import { VNode, VNodeType } from './types.js';
import { PropPatch } from './diff.js';

export function createDOM(vnode: VNode): Node | null {
  if (vnode.type === null) {
    const textNode = document.createTextNode(String(vnode.text || ''));
    vnode.dom = textNode;
    return textNode;
  }

  const element = document.createElement(vnode.type as string);
  vnode.dom = element;
  setProps(element, vnode.props);
  
  for (const child of vnode.children) {
    const childDOM = createDOM(child);
    if (childDOM) {
      element.appendChild(childDOM);
    }
  }
  
  return element;
}

export function setProps(element: HTMLElement, props: Record<string, any>): void {
  for (const [key, value] of Object.entries(props)) {
    if (value === undefined || value === null) continue;

    if (key.startsWith('on') && typeof value === 'function') {
      const eventType = key.slice(2).toLowerCase();
      element.addEventListener(eventType, value);
      (element as any).__events = (element as any).__events || {};
      (element as any).__events[eventType] = value;
      continue;
    }

    if (key === 'style') {
      if (typeof value === 'string') {
        element.style.cssText = value;
      } else if (typeof value === 'object') {
        Object.assign(element.style, value);
      }
      continue;
    }

    if (key === 'className') {
      element.className = String(value);
      continue;
    }

    element.setAttribute(key, String(value));
  }
}

export function updateProps(element: HTMLElement, propPatches: PropPatch[]): void {
  for (const { key, value } of propPatches) {
    if (value === undefined) {
      // 删除属性
      if (key.startsWith('on')) {
        const eventType = key.slice(2).toLowerCase();
        const oldHandler = (element as any).__events?.[eventType];
        if (oldHandler) {
          element.removeEventListener(eventType, oldHandler);
          delete (element as any).__events[eventType];
        }
      } else if (key === 'className') {
        element.className = '';
      } else if (key === 'style') {
        element.style.cssText = '';
      } else {
        element.removeAttribute(key);
      }
    } else {
      // 设置/更新属性
      if (key.startsWith('on') && typeof value === 'function') {
        const eventType = key.slice(2).toLowerCase();
        const oldHandler = (element as any).__events?.[eventType];
        if (oldHandler) {
          element.removeEventListener(eventType, oldHandler);
        }
        element.addEventListener(eventType, value);
        (element as any).__events = (element as any).__events || {};
        (element as any).__events[eventType] = value;
      } else if (key === 'style') {
        if (typeof value === 'string') {
          element.style.cssText = value;
        } else if (typeof value === 'object') {
          Object.assign(element.style, value);
        }
      } else if (key === 'className') {
        element.className = String(value);
      } else {
        element.setAttribute(key, String(value));
      }
    }
  }
}
