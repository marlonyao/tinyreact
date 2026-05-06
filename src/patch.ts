import { VNode } from './types.js';
import { createDOM, updateProps } from './dom.js';
import { Patch } from './diff.js';

export function applyPatch(patch: Patch, parentDOM: Node): void {
  const index = patch.index ?? 0;
  const targetDOM = parentDOM.childNodes[index];

  switch (patch.type) {
    case 'ADD': {
      const dom = createDOM(patch.vnode!);
      if (dom) {
        if (index < parentDOM.childNodes.length) {
          parentDOM.insertBefore(dom, parentDOM.childNodes[index]);
        } else {
          parentDOM.appendChild(dom);
        }
      }
      break;
    }
    case 'REMOVE': {
      if (targetDOM) {
        parentDOM.removeChild(targetDOM);
      }
      break;
    }
    case 'REPLACE': {
      const newDom = createDOM(patch.vnode!);
      if (newDom && targetDOM) {
        parentDOM.replaceChild(newDom, targetDOM);
      } else if (newDom) {
        parentDOM.appendChild(newDom);
      }
      break;
    }
    case 'TEXT': {
      if (targetDOM) {
        (targetDOM as Text).nodeValue = patch.text!;
      }
      break;
    }
    case 'UPDATE': {
      if (!targetDOM) break;

      // 同步 DOM 引用到新 VNode，确保下次 diff 时能找到正确的 DOM 节点
      if (patch.vnode) {
        patch.vnode.dom = targetDOM;
      }

      if (patch.props) {
        updateProps(targetDOM as HTMLElement, patch.props);
      }

      if (patch.children && patch.children.length > 0) {
        for (const childPatch of patch.children) {
          applyPatch(childPatch, targetDOM);
        }
      }
      break;
    }
  }
}
