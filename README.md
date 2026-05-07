# TinyReact

A minimal React-like framework built from scratch for learning purposes. ~600 lines of TypeScript covering the core mechanisms of React: Virtual DOM, Diff & Patch, Hooks, and Component Lifecycle.

**Live Demo:** Open `demo/todolist.html` directly in your browser.

## Features

| Feature | Status |
|---------|--------|
| Virtual DOM (createElement, render) | ✅ |
| Diff Algorithm (reconciliation) | ✅ |
| Patch System (incremental DOM updates) | ✅ |
| Function Components | ✅ |
| Event Binding | ✅ |
| **useState** Hook | ✅ |
| **useEffect** Hook (with cleanup) | ✅ |
| TodoList Browser Demo | ✅ |
| Performance Benchmarks | ✅ |

## Quick Start

```bash
git clone https://github.com/marlonyao/tinyreact.git
cd tinyreact
npm install
npm test          # 68 tests, all passing
npm run demo:build  # Build browser bundle
open demo/todolist.html
```

## Demo

```bash
npm run demo:build
# Then open demo/todolist.html in your browser
```

Or serve the `demo/` directory:

```bash
cd demo && npx serve
```

### Package Layout

```
src/              Framework source (~600 LOC)
tests/            68 unit tests covering all 5 phases
demo/             Browser TodoList demo (IIFE bundle)
demo/todolist.html    Open directly in browser
demo/todolist.js      TodoList application
demo/todolist.css     Styles
demo/tinyreact.js     Bundled framework (run `npm run demo:build`)
```

## Architecture

### 1. Virtual DOM

`createElement(type, props, ...children)` produces a tree of `VNode` objects. `render(vnode, container)` walks the tree and creates real DOM nodes via `document.createElement` / `createTextNode`.

### 2. Diff Algorithm (Reconciliation)

Two-pass diff:
1. **Key match phase**: by `key` → `UPDATE` with prop/child patches
2. **Index fallback**: by position → `UPDATE`, or type-mismatch → `REPLACE`
3. Remaining nodes → `REMOVE` / `ADD`

### 3. Patch System

`applyPatch(patch, parentDOM)` executes DOM mutations:
- `UPDATE` → `updateProps` + recurse children
- `REPLACE` → `replaceChild`
- `REMOVE` → `removeChild`
- `ADD` → `appendChild`
- `TEXT` → `textContent`

Key fix: REMOVE patches execute **in descending index order** so earlier indices remain valid.

### 4. Hooks System

Hooks are stored in a per-component array. The component instance is identified by `(container, function, key)`.

```typescript
function Counter() {
  const [count, setCount] = useState(0);
  useEffect(() => { document.title = count; }, [count]);
  return h('button', { onClick: () => setCount(c => c + 1) }, count);
}
```

Key design: `setState` captures the `instance` in a closure at render time. After `clearCurrentInstance()` the global is null, but the closure still holds the reference.

### 5. TodoList Integration Demo + Performance Benchmarks

Browser TodoList with filtering, add/remove/toggle, and clear-completed. Performance suite covers 100-node rendering, single-node incremental updates, list appends, and deep-tree diffs — all under 10ms.

## Test Results

```
✔ Phase 1: Virtual DOM + 首次渲染 (12)
✔ Phase 2: Diff 算法 (15)
✔ Phase 3: Patch + 组件更新 (17)
✔ Phase 4: Hooks 系统 (13)
✔ Phase 5: TodoList Demo + 性能基准 (11)
────────────────────────────────────
68 passing, 0 failing
```

## License

MIT
