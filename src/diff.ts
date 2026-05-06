// diff: 对比两棵 Virtual DOM 树，生成变更补丁

import { VNode } from './types.js';

export type PatchType = 'REPLACE' | 'REMOVE' | 'ADD' | 'UPDATE' | 'TEXT';

export interface Patch {
  type: PatchType;
  // 变更对应的真实 DOM 节点（patch 阶段需要）
  dom?: Node;
  // 新 VNode（ADD / REPLACE / UPDATE 用）
  vnode?: VNode;
  // 旧 VNode（REMOVE 用）
  oldVNode?: VNode;
  // 属性变更列表（UPDATE 用）
  props?: PropPatch[];
  // 文本内容（TEXT 用）
  text?: string;
  // 子节点 patches
  children?: Patch[];
}

export interface PropPatch {
  key: string;
  value: any;      // undefined 表示删除
  oldValue: any;
}

/**
 * 对比两棵 VNode 树，返回 patches
 */
export function diff(oldVNode: VNode | null, newVNode: VNode | null): Patch | null {
  // 两者都为空
  if (!oldVNode && !newVNode) {
    return null;
  }

  // 旧节点为空，新节点存在 → 新增
  if (!oldVNode) {
    return { type: 'ADD', vnode: newVNode! };
  }

  // 新节点为空，旧节点存在 → 删除
  if (!newVNode) {
    return { type: 'REMOVE', oldVNode };
  }

  // 类型不同 → 替换（包括文本节点和元素节点互转）
  if (oldVNode.type !== newVNode.type) {
    return { type: 'REPLACE', vnode: newVNode, oldVNode };
  }

  // 都是文本节点
  if (oldVNode.type === null) {
    if (oldVNode.text !== newVNode.text) {
      return { type: 'TEXT', text: String(newVNode.text || '') };
    }
    return null; // 文本相同，无需变更
  }

  // 都是元素节点，类型相同 → 对比 props 和 children
  const propsPatches = diffProps(oldVNode.props, newVNode.props);
  const childrenPatches = diffChildren(oldVNode.children, newVNode.children);

  if (propsPatches.length === 0 && childrenPatches.length === 0) {
    return null; // 完全相同
  }

  return {
    type: 'UPDATE',
    vnode: newVNode,
    props: propsPatches,
    children: childrenPatches,
  };
}

/**
 * 对比属性对象
 */
function diffProps(
  oldProps: Record<string, any>,
  newProps: Record<string, any>
): PropPatch[] {
  const patches: PropPatch[] = [];
  const allKeys = new Set([...Object.keys(oldProps), ...Object.keys(newProps)]);

  for (const key of allKeys) {
    const oldValue = oldProps[key];
    const newValue = newProps[key];

    // 新属性不存在 → 删除
    if (!(key in newProps)) {
      patches.push({ key, value: undefined, oldValue });
      continue;
    }

    // 旧属性不存在，或值不同 → 更新
    if (!(key in oldProps) || oldValue !== newValue) {
      patches.push({ key, value: newValue, oldValue });
    }
  }

  return patches;
}

/**
 * 对比子节点列表
 * 简化版：按索引逐一对比，不考虑 key 优化（key 放在 Phase 3 或后续）
 */
function diffChildren(oldChildren: VNode[], newChildren: VNode[]): Patch[] {
  const maxLen = Math.max(oldChildren.length, newChildren.length);
  const patches: Patch[] = [];

  for (let i = 0; i < maxLen; i++) {
    const oldChild = i < oldChildren.length ? oldChildren[i] : null;
    const newChild = i < newChildren.length ? newChildren[i] : null;
    const patch = diff(oldChild, newChild);
    if (patch) {
      patches.push(patch);
    }
  }

  return patches;
}
