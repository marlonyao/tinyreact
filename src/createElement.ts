// createElement: 构建 Virtual DOM 树

import { VNode, VNodeType, ChildType } from './types.js';

/**
 * 创建虚拟节点
 * @param type - HTML 标签名 或 组件函数 或 null(文本节点)
 * @param props - 属性对象
 * @param children - 子节点（会自动扁平化、过滤、转换原始值）
 */
export function createElement(
  type: VNodeType,
  props: Record<string, any> | null,
  ...children: ChildType[]
): VNode {
  // 处理 props
  const normalizedProps = props ? { ...props } : {};
  
  // 从 props 中提取 key
  const key = normalizedProps.key;
  if (key !== undefined) {
    delete normalizedProps.key;
  }

  // 扁平化 children，过滤 false/null/undefined，将原始值转为文本节点
  const flatChildren = flattenChildren(children);

  return {
    type,
    props: normalizedProps,
    children: flatChildren,
    key,
  };
}

function flattenChildren(children: ChildType[]): VNode[] {
  const result: VNode[] = [];

  for (const child of children) {
    if (child === null || child === undefined || child === false || child === true) {
      continue; // 过滤掉 falsy 值（React 行为）
    }
    if (typeof child === 'string' || typeof child === 'number') {
      result.push(createTextNode(String(child)));
    } else if (Array.isArray(child)) {
      result.push(...flattenChildren(child));
    } else {
      result.push(child);
    }
  }

  return result;
}

function createTextNode(text: string): VNode {
  return {
    type: null,
    props: {},
    children: [],
    text,
  };
}
