// render: 将 Virtual DOM 挂载到真实 DOM

import { VNode, VNodeType } from './types.js';

/**
 * 将虚拟节点渲染到指定的 DOM 容器中
 * 这会清空容器内容并重新挂载
 */
export function render(vnode: VNode, container: HTMLElement): void {
  // 清空容器
  container.innerHTML = '';
  // 创建真实 DOM 并挂载
  const dom = createDOM(vnode);
  if (dom) {
    container.appendChild(dom);
  }
}

/**
 * 根据 VNode 创建真实 DOM 节点
 */
function createDOM(vnode: VNode): Node | null {
  // 文本节点
  if (vnode.type === null) {
    return document.createTextNode(String(vnode.text || ''));
  }

  // 函数组件（Phase 1 暂不支持组件，直接返回 null）
  if (typeof vnode.type === 'function') {
    return null;
  }

  // 元素节点
  const element = document.createElement(vnode.type);

  // 设置 props
  setProps(element, vnode.props);

  // 递归创建子节点
  for (const child of vnode.children) {
    const childDOM = createDOM(child);
    if (childDOM) {
      element.appendChild(childDOM);
    }
  }

  return element;
}

/**
 * 设置 DOM 元素的属性
 */
function setProps(element: HTMLElement, props: Record<string, any>): void {
  for (const [key, value] of Object.entries(props)) {
    if (value === undefined || value === null) continue;

    // 处理事件监听: onClick → click
    if (key.startsWith('on') && typeof value === 'function') {
      const eventType = key.slice(2).toLowerCase();
      element.addEventListener(eventType, value);
      continue;
    }

    // 处理 style
    if (key === 'style') {
      if (typeof value === 'string') {
        element.style.cssText = value;
      } else if (typeof value === 'object') {
        Object.assign(element.style, value);
      }
      continue;
    }

    // className 映射到 class
    if (key === 'className') {
      element.className = String(value);
      continue;
    }

    // 其他属性用 setAttribute
    element.setAttribute(key, String(value));
  }
}
