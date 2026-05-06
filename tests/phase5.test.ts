import {
  createElement, render, useState, useEffect,
} from '../src/index.js';
import { describe, it } from 'node:test';
import assert from 'node:assert';
import { JSDOM } from 'jsdom';

describe('Phase 5: TodoList 集成测试', { concurrency: false }, () => {
  let dom: JSDOM;

  function freshContainer(): HTMLElement {
    dom = new JSDOM('<!DOCTYPE html><html><body><div id="root"></div></body></html>');
    (global as any).document = dom.window.document;
    return dom.window.document.getElementById('root')!;
  }

  interface Todo {
    id: number;
    text: string;
    done: boolean;
  }

  function TodoApp() {
    const [todos, setTodos] = useState<Todo[]>([
      { id: 1, text: 'Learn VDOM', done: true },
      { id: 2, text: 'Build Diff', done: true },
      { id: 3, text: 'Add Hooks', done: false },
    ]);
    const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
    const [input, setInput] = useState('');

    const filtered = todos.filter(t => {
      if (filter === 'active') return !t.done;
      if (filter === 'completed') return t.done;
      return true;
    });

    const addTodo = () => {
      const text = input.trim();
      if (!text) return;
      setTodos(prev => [...prev, { id: Date.now(), text, done: false }]);
      setInput('');
    };

    const toggle = (id: number) => {
      setTodos(prev => prev.map(t =>
        t.id === id ? { ...t, done: !t.done } : t
      ));
    };

    const remove = (id: number) => {
      setTodos(prev => prev.filter(t => t.id !== id));
    };

    return createElement('div', { className: 'todo-app' },
      createElement('h1', null, 'TinyReact TodoList'),
      createElement('div', { className: 'input-row' },
        createElement('input', {
          type: 'text',
          value: input,
          onInput: (e: any) => setInput(e.target.value),
          placeholder: 'What needs to be done?',
        }),
        createElement('button', { onClick: addTodo }, 'Add')
      ),
      createElement('div', { className: 'filters' },
        createElement('button', {
          className: filter === 'all' ? 'active' : '',
          onClick: () => setFilter('all'),
        }, 'All'),
        createElement('button', {
          className: filter === 'active' ? 'active' : '',
          onClick: () => setFilter('active'),
        }, 'Active'),
        createElement('button', {
          className: filter === 'completed' ? 'active' : '',
          onClick: () => setFilter('completed'),
        }, 'Completed')
      ),
      createElement('ul', { className: 'todo-list' },
        ...filtered.map(todo =>
          createElement('li', {
            key: todo.id,
            className: todo.done ? 'done' : '',
          },
            createElement('input', {
              type: 'checkbox',
              checked: todo.done,
              onChange: () => toggle(todo.id),
            }),
            createElement('span', null, todo.text),
            createElement('button', {
              className: 'delete',
              onClick: () => remove(todo.id),
            }, '×')
          )
        )
      ),
      createElement('div', { className: 'summary' },
        `${todos.filter(t => !t.done).length} items left`
      )
    );
  }

  it('渲染初始 TodoList', () => {
    const container = freshContainer();
    render(createElement(TodoApp, {}), container);

    assert.ok(container.querySelector('.todo-app'));
    assert.strictEqual(container.querySelector('h1')?.textContent, 'TinyReact TodoList');
    assert.strictEqual(container.querySelectorAll('li').length, 3);
    assert.strictEqual(container.querySelector('.summary')?.textContent, '1 items left');
  });

  it('切换任务完成状态', () => {
    const container = freshContainer();
    render(createElement(TodoApp, {}), container);

    const checkboxes = container.querySelectorAll('input[type="checkbox"]');
    assert.strictEqual(checkboxes.length, 3);

    // 第三个任务（Add Hooks）是未完成的，点击完成它
    const third = checkboxes[2] as HTMLInputElement;
    assert.strictEqual(third.checked, false);
    third.click();
    assert.strictEqual(third.checked, true);
    assert.strictEqual(container.querySelector('.summary')?.textContent, '0 items left');
  });

  it('删除任务', () => {
    const container = freshContainer();
    render(createElement(TodoApp, {}), container);

    const deleteBtns = container.querySelectorAll('button.delete');
    assert.strictEqual(deleteBtns.length, 3);

    // 删除第一个任务
    (deleteBtns[0] as HTMLButtonElement).click();
    assert.strictEqual(container.querySelectorAll('li').length, 2);
    assert.strictEqual(container.querySelector('.summary')?.textContent, '1 items left');
  });

  it('过滤：只显示未完成', () => {
    const container = freshContainer();
    render(createElement(TodoApp, {}), container);

    // 点击 Active 过滤按钮
    const filterBtns = container.querySelectorAll('.filters button');
    (filterBtns[1] as HTMLButtonElement).click(); // Active

    assert.strictEqual(container.querySelectorAll('li').length, 1);
    assert.strictEqual(container.querySelector('li span')?.textContent, 'Add Hooks');
  });

  it('过滤：只显示已完成', () => {
    const container = freshContainer();
    render(createElement(TodoApp, {}), container);

    const filterBtns = container.querySelectorAll('.filters button');
    (filterBtns[2] as HTMLButtonElement).click(); // Completed

    assert.strictEqual(container.querySelectorAll('li').length, 2);
  });

  it('添加新任务', () => {
    const container = freshContainer();
    render(createElement(TodoApp, {}), container);

    const input = container.querySelector('input[type="text"]') as HTMLInputElement;
    const addBtn = container.querySelector('.input-row button') as HTMLButtonElement;

    // 模拟输入
    input.value = 'Write tests';
    input.dispatchEvent(new (dom.window as any).Event('input', { bubbles: true }));
    addBtn.click();
    assert.strictEqual(container.querySelectorAll('li').length, 4);
    assert.ok([...container.querySelectorAll('li span')].some(s => s.textContent === 'Write tests'));
  });

  it('空输入不添加任务', () => {
    const container = freshContainer();
    render(createElement(TodoApp, {}), container);

    const addBtn = container.querySelector('.input-row button') as HTMLButtonElement;
    addBtn.click();
    assert.strictEqual(container.querySelectorAll('li').length, 3); // 不变
  });
});

describe('Phase 5: 性能基准测试', () => {
  function freshContainer(): HTMLElement {
    const dom = new JSDOM('<!DOCTYPE html><html><body><div id="root"></div></body></html>');
    (global as any).document = dom.window.document;
    return dom.window.document.getElementById('root')!;
  }

  function measure(name: string, fn: () => void, iterations: number = 1000): number {
    const start = performance.now();
    for (let i = 0; i < iterations; i++) {
      fn();
    }
    const elapsed = performance.now() - start;
    console.log(`  ${name}: ${elapsed.toFixed(2)}ms (${iterations}次)`);
    return elapsed;
  }

  it('大量节点渲染性能', () => {
    const container = freshContainer();

    function BigList() {
      return createElement('ul', null,
        ...Array.from({ length: 100 }, (_, i) =>
          createElement('li', { key: i, className: 'item' }, `Item ${i}`)
        )
      );
    }

    const t = measure('100节点首次渲染', () => {
      render(createElement(BigList, {}), container);
    }, 10);

    assert.ok(t < 100, `100节点渲染应在100ms内，实际${t.toFixed(2)}ms`);
  });

  it('增量更新性能：单节点修改', () => {
    const container = freshContainer();

    function Counter() {
      const [count, setCount] = useState(0);
      return createElement('div', null,
        createElement('h1', null, 'Static'),
        createElement('p', null, String(count)),
        createElement('button', { onClick: () => setCount(c => c + 1) }, '+')
      );
    }

    render(createElement(Counter, {}), container);

    const btn = container.querySelector('button') as HTMLButtonElement;
    const t = measure('单节点增量更新', () => {
      btn.click();
    }, 100);

    assert.ok(t < 50, `单节点更新应在50ms内，实际${t.toFixed(2)}ms`);
  });

  it('列表插入性能', () => {
    const container = freshContainer();

    function ListApp() {
      const [items, setItems] = useState<string[]>([]);
      return createElement('div', null,
        createElement('ul', null,
          ...items.map((item, i) => createElement('li', { key: i }, item))
        ),
        createElement('button', {
          onClick: () => setItems(prev => [...prev, `Item ${prev.length}`])
        }, 'Add')
      );
    }

    render(createElement(ListApp, {}), container);
    const btn = container.querySelector('button') as HTMLButtonElement;

    const t = measure('列表追加', () => {
      btn.click();
    }, 50);

    assert.ok(t < 100, `列表追加应在100ms内，实际${t.toFixed(2)}ms`);
    assert.strictEqual(container.querySelectorAll('li').length, 50);
  });

  it('复杂树 diff 性能', () => {
    const container = freshContainer();

    function Tree(props: { depth: number; label: string }) {
      if (props.depth <= 0) {
        return createElement('span', null, props.label);
      }
      return createElement('div', { className: `depth-${props.depth}` },
        createElement(Tree, { depth: props.depth - 1, label: `${props.label}-A` }),
        createElement(Tree, { depth: props.depth - 1, label: `${props.label}-B` })
      );
    }

    // 深度5的树，约 2^5 = 32 个叶子节点
    render(createElement(Tree, { depth: 5, label: 'root' }), container);

    const t = measure('深度5树更新（props变化）', () => {
      render(createElement(Tree, { depth: 5, label: 'updated' }), container);
    }, 10);

    assert.ok(t < 100, `树更新应在100ms内，实际${t.toFixed(2)}ms`);
  });
});
