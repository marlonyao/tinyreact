// hooks.ts: Hooks 系统核心实现
// 核心原理：用数组 + 索引保存组件状态，每次渲染按固定顺序访问

import { VNode } from './types.js';

export interface StateHook<T> {
  type: 'state';
  value: T;
}

export interface EffectHook {
  type: 'effect';
  effect: (() => void | (() => void)) | null;
  deps: any[] | undefined;
  cleanup: (() => void) | undefined;
}

export type Hook = StateHook<any> | EffectHook;

export interface ComponentInstance {
  fn: Function;
  props: Record<string, any>;
  hooks: Hook[];
  hookIndex: number;
  container: HTMLElement;
}

// 当前正在渲染的组件实例
let currentInstance: ComponentInstance | null = null;

// 待执行的 effects（在 DOM 更新后统一执行）
let effectsToRun: Array<{ instance: ComponentInstance; hookIndex: number }> = [];

// 重新渲染的回调（由 render.ts 注册）
let rerenderFn: ((container: HTMLElement) => void) | null = null;

export function setRerenderFn(fn: (container: HTMLElement) => void): void {
  rerenderFn = fn;
}

export function setCurrentInstance(instance: ComponentInstance): void {
  currentInstance = instance;
}

export function clearCurrentInstance(): void {
  currentInstance = null;
}

export function resetHookIndex(instance: ComponentInstance): void {
  instance.hookIndex = 0;
}

/**
 * useState: 在组件中保存状态
 * 首次渲染时初始化值，后续渲染按索引读取已有值
 */
export function useState<T>(initial: T): [T, (v: T | ((prev: T) => T)) => void] {
  if (!currentInstance) {
    throw new Error('useState must be called inside a function component');
  }

  // 捕获当前 instance 到局部变量，避免闭包依赖全局 currentInstance
  const instance = currentInstance;
  const idx = instance.hookIndex++;

  // 首次渲染：初始化 hook
  if (idx >= instance.hooks.length) {
    instance.hooks.push({ type: 'state', value: initial });
  }

  const hook = instance.hooks[idx] as StateHook<T>;

  // setState 闭包：直接捕获 instance（不依赖全局 currentInstance）
  const setState = (value: T | ((prev: T) => T)) => {
    const newValue = typeof value === 'function'
      ? (value as (prev: T) => T)(hook.value)
      : value;

    if (newValue !== hook.value) {
      hook.value = newValue;
      // 触发重新渲染（从根重新构建 VNode 树）
      if (rerenderFn) {
        rerenderFn(instance.container);
      }
    }
  };

  return [hook.value, setState];
}

/**
 * useEffect: 副作用管理
 * 在 DOM 更新后执行，支持依赖数组和 cleanup
 */
export function useEffect(effect: () => void | (() => void), deps?: any[]): void {
  if (!currentInstance) {
    throw new Error('useEffect must be called inside a function component');
  }

  const idx = currentInstance.hookIndex++;

  if (idx >= currentInstance.hooks.length) {
    // 首次渲染：记录 effect，待 DOM 更新后执行
    currentInstance.hooks.push({ type: 'effect', effect, deps, cleanup: undefined });
    effectsToRun.push({ instance: currentInstance, hookIndex: idx });
  } else {
    // 后续渲染：比较依赖数组
    const hook = currentInstance.hooks[idx] as EffectHook;
    const prevDeps = hook.deps;
    const hasChanged = !prevDeps || !deps || deps.some((d, i) => d !== prevDeps[i]);

    if (hasChanged) {
      // 依赖变化：先执行旧 cleanup，再标记执行新 effect
      if (hook.cleanup) {
        hook.cleanup();
      }
      hook.effect = effect;
      hook.deps = deps;
      effectsToRun.push({ instance: currentInstance, hookIndex: idx });
    }
  }
}

/**
 * 执行所有待执行的 effects
 * 在每次 render 完成后调用（DOM 已更新）
 */
export function flushEffects(): void {
  for (const { instance, hookIndex } of effectsToRun) {
    const hook = instance.hooks[hookIndex] as EffectHook;
    if (hook.effect) {
      const cleanup = hook.effect();
      hook.cleanup = cleanup || undefined;
    }
  }
  effectsToRun = [];
}
