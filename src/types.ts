// Virtual Node 类型定义

export type VNodeType = string | Function | null;

export interface VNode {
  type: VNodeType;
  props: Record<string, any>;
  children: VNode[];
  key?: string | number;
  text?: string | number; // 文本节点内容，type === null 时使用
  dom?: Node; // 指向对应的真实 DOM 节点
}

export type ChildType = VNode | string | number | boolean | null | undefined;
