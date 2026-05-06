# TinyReact 实现计划

## 目标
构建一个最小但可用的类 React 框架，通过实现来深入理解 React 核心原理。

## 语言选择
**TypeScript** — 类型安全有助于理清虚拟 DOM 的结构，且 React 本身就是 JS 生态的框架。

## 核心特性拆解

1. **Virtual DOM** — 用 JS 对象表示 DOM 树
2. **createElement / h** — 创建虚拟节点
3. **Render** — 将 VDOM 挂载到真实 DOM
4. **Diff (Reconciliation)** — 对比两棵 VDOM 树，找出最小变更集
5. **Patch** — 将变更应用到真实 DOM
6. **Components** — 函数组件 + 状态管理
7. **Hooks** — useState、useEffect

## 实现阶段

### Phase 1: Virtual DOM + 首次渲染
- createElement 函数
- VNode 类型定义（element、text、fragment）
- render 函数：递归创建真实 DOM 并挂载
- 测试：渲染简单 JSX-like 结构

### Phase 2: Diff 算法
- 对比两棵 VDOM 树
- 节点类型变化的处理
- Props 差异检测
- 子节点 diff（含 key 优化）
- 测试：各种 diff 场景

### Phase 3: Patch + 组件更新
- 将 diff 结果应用到真实 DOM
- 函数组件支持
- setState / 重新渲染机制
- 测试：交互式更新

### Phase 4: Hooks 系统
- useState 实现（基于数组下标的闭包技巧）
- useEffect 实现（依赖数组比较 + cleanup）
- 测试：hooks 规则、多次渲染状态保持

### Phase 5: 事件处理 + 小应用
- 合成事件（简化版）
- 写一个 TodoList 验证框架可用性
- 性能基准测试（与原生 DOM 操作对比）

## 测试策略
每阶段先写测试，再写实现。使用 Node.js + jsdom 运行测试，无需真实浏览器。

## 项目结构
```
tinyreact/
├── src/
│   ├── createElement.ts
│   ├── render.ts
│   ├── diff.ts
│   ├── patch.ts
│   ├── component.ts
│   ├── hooks.ts
│   └── index.ts
├── tests/
│   ├── createElement.test.ts
│   ├── render.test.ts
│   ├── diff.test.ts
│   ├── patch.test.ts
│   ├── hooks.test.ts
│   └── integration.test.ts
├── demo/
│   └── todolist.html
├── package.json
└── tsconfig.json
```

## 预期产出
- 一个~500行核心代码的 React 雏形
- 支持组件、状态、hooks
- 完整的测试覆盖
- 一个可运行的 TodoList demo
