import { VNode } from './types.js';
import { createDOM } from './dom.js';
import { diff } from './diff.js';
import { applyPatch } from './patch.js';
import {
  ComponentInstance,
  setCurrentInstance,
  clearCurrentInstance,
  resetHookIndex,
  setRerenderFn,
  flushEffects,
} from './hooks.js';

interface ContainerState {
  tree: VNode;
}

const containerMap = new WeakMap<HTMLElement, ContainerState>();
const rootMap = new WeakMap<HTMLElement, { vnode: VNode; container: HTMLElement }>();

// 组件实例缓存：fn -> key -> instance
const instanceMap = new WeakMap<Function, Map<string, ComponentInstance>>();

function getInstanceKey(props: Record<string, any>): string {
  return props.key ?? '__default__';
}

function getOrCreateInstance(
  fn: Function,
  props: Record<string, any>,
  container: HTMLElement
): ComponentInstance {
  let fnMap = instanceMap.get(fn);
  if (!fnMap) {
    fnMap = new Map();
    instanceMap.set(fn, fnMap);
  }
  const key = getInstanceKey(props);
  let instance = fnMap.get(key);
  if (!instance) {
    instance = {
      fn,
      props,
      hooks: [],
      hookIndex: 0,
      container,
    };
    fnMap.set(key, instance);
  }
  instance.props = props;
  instance.container = container;
  return instance;
}

/**
 * 展开函数组件，得到纯元素 VNode 树
 * 在此注入 hooks 上下文
 */
function expandVNode(vnode: VNode, container: HTMLElement): VNode {
  if (typeof vnode.type === 'function') {
    const fn = vnode.type as Function;
    const instance = getOrCreateInstance(fn, vnode.props, container);

    // 重置 hooks 索引，准备本次渲染的 hooks 读取
    resetHookIndex(instance);
    setCurrentInstance(instance);

    // 执行组件函数（hooks 在此内部被调用）
    const result = fn(vnode.props);

    // 清除全局上下文，防止外部代码误用 hooks
    clearCurrentInstance();

    // 递归展开子树（结果可能仍是组件，继续展开直到纯元素树）
    return expandVNode(result, container);
  }

  // 文本节点
  if (vnode.type === null) {
    return vnode;
  }

  // 元素节点：递归展开所有子节点
  return {
    ...vnode,
    children: vnode.children.map((child) => expandVNode(child, container)),
  };
}

/**
 * 内部渲染逻辑
 */
function doRender(vnode: VNode, container: HTMLElement): void {
  const expanded = expandVNode(vnode, container);
  const state = containerMap.get(container);

  if (!state) {
    // 首次渲染：创建全新 DOM
    container.innerHTML = '';
    const dom = createDOM(expanded);
    if (dom) container.appendChild(dom);
    containerMap.set(container, { tree: expanded });
    return;
  }

  // 增量更新
  const rootPatch = diff(state.tree, expanded);
  if (!rootPatch) {
    // 无变化
    containerMap.set(container, { tree: expanded });
    return;
  }

  if (rootPatch.type === 'UPDATE') {
    const expectedDOM = state.tree.dom;
    if (container.firstChild !== expectedDOM) {
      // DOM 被外部修改，回退到全量替换
      container.innerHTML = '';
      const dom = createDOM(expanded);
      if (dom) container.appendChild(dom);
    } else {
      applyPatch(rootPatch, container);
    }
  } else {
    // REPLACE / ADD / REMOVE / TEXT — 根节点变化，全量替换
    container.innerHTML = '';
    const dom = createDOM(expanded);
    if (dom) container.appendChild(dom);
  }

  containerMap.set(container, { tree: expanded });
}

// 注册 rerender 回调：state 变化时从根重新渲染
setRerenderFn((container: HTMLElement) => {
  const root = rootMap.get(container);
  if (root) {
    doRender(root.vnode, root.container);
    flushEffects();
  }
});

/**
 * 将虚拟节点渲染到指定的 DOM 容器中
 */
export function render(vnode: VNode, container: HTMLElement): void {
  // 保存根 VNode，供 rerender 使用
  rootMap.set(container, { vnode, container });

  doRender(vnode, container);

  // 执行本次渲染中注册的所有 effects（DOM 已更新）
  flushEffects();
}
