// context.ts — Context API 实现
// 核心原理：用栈追踪嵌套的 Provider 值

export interface Context<T> {
  _contextId: symbol;
  _defaultValue: T;
  Provider: { _providerFor: symbol };  // Provider 标记对象
}

// 全局 Context 值栈：每个 context id 对应一个栈
const contextStacks = new Map<symbol, any[]>();

function getStack(id: symbol): any[] {
  let stack = contextStacks.get(id);
  if (!stack) {
    stack = [];
    contextStacks.set(id, stack);
  }
  return stack;
}

/**
 * 创建 Context
 */
export function createContext<T>(defaultValue: T): Context<T> {
  const contextId = Symbol('context');
  const provider = { _providerFor: contextId };
  return { _contextId: contextId, _defaultValue: defaultValue, Provider: provider };
}

/**
 * 检查 VNode type 是否是某个 Context 的 Provider
 * 返回对应的 contextId 或 null
 */
export function getProviderId(type: any): symbol | null {
  if (typeof type === 'object' && type !== null && '_providerFor' in type) {
    return type._providerFor;
  }
  return null;
}

/**
 * useContext: 从栈顶获取最近的 Context 值
 */
export function useContext<T>(context: Context<T>): T {
  const stack = getStack(context._contextId);
  if (stack.length > 0) {
    return stack[stack.length - 1];
  }
  return context._defaultValue;
}

/**
 * Push a Provider value onto the stack
 */
export function pushContextValue(contextId: symbol, value: any): void {
  getStack(contextId).push(value);
}

/**
 * Pop a Provider value from the stack
 */
export function popContextValue(contextId: symbol): void {
  getStack(contextId).pop();
}
