import { VNode } from './types.js';
import { createDOM } from './dom.js';
import { diff } from './diff.js';
import { applyPatch } from './patch.js';

interface ContainerState {
  tree: VNode;
}

const containerMap = new WeakMap<HTMLElement, ContainerState>();

/**
 * 展开函数组件，得到纯元素 VNode 树
 */
function expandVNode(vnode: VNode): VNode {
  if (typeof vnode.type === 'function') {
    const result = (vnode.type as Function)(vnode.props);
    return expandVNode(result);
  }
  
  return {
    ...vnode,
    children: vnode.children.map(expandVNode),
  };
}

/**
 * 将虚拟节点渲染到指定的 DOM 容器中
 * 首次渲染：创建全新 DOM
 * 后续渲染：diff + patch 增量更新
 */
export function render(vnode: VNode, container: HTMLElement): void {
  const expanded = expandVNode(vnode);
  const state = containerMap.get(container);
  
  if (!state) {
    // 首次渲染
    container.innerHTML = '';
    const dom = createDOM(expanded);
    if (dom) container.appendChild(dom);
    containerMap.set(container, { tree: expanded });
    return;
  }
  
  // 增量更新
  const rootPatch = diff(state.tree, expanded);
  if (!rootPatch) return; // 无变化
  
  if (rootPatch.type === 'UPDATE') {
    // 检查 DOM 是否被外部修改过（比如测试直接操作 innerHTML）
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
    // 根节点类型变化（REPLACE / ADD / REMOVE / TEXT），全量替换
    container.innerHTML = '';
    const dom = createDOM(expanded);
    if (dom) container.appendChild(dom);
  }
  
  containerMap.set(container, { tree: expanded });
}
