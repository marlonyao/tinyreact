/**
 * TinyReact Browser Demo — TodoList
 * 
 * 说明：
 * 1. demo/tinyreact.js 由 esbuild 从 src/ 打包生成（IIFE 格式）
 * 2. 打开方式：直接用浏览器打开本文件，或在目录下运行 `npx serve`
 * 3. 框架源码：https://github.com/marlonyao/tinyreact
 */

const { createElement: h, render, useState, useEffect } = TinyReact;

const TodoApp = () => {
  const [todos, setTodos] = useState([
    { id: 1, text: 'Learn Virtual DOM', done: true },
    { id: 2, text: 'Implement Diff Algorithm', done: true },
    { id: 3, text: 'Add Hooks (useState / useEffect)', done: true },
    { id: 4, text: 'Build a TodoList with TinyReact', done: false },
  ]);
  const [filter, setFilter] = useState('all');
  const [input, setInput] = useState('');

  useEffect(() => {
    document.title = `TinyReact — ${todos.filter(t => !t.done).length} items left`;
  }, [todos]);

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

  const toggle = (id) => {
    setTodos(prev => prev.map(t =>
      t.id === id ? { ...t, done: !t.done } : t
    ));
  };

  const remove = (id) => {
    setTodos(prev => prev.filter(t => t.id !== id));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') addTodo();
  };

  return h('div', { className: 'app' },
    h('header', null,
      h('h1', null, 'TinyReact TodoList'),
      h('p', { className: 'subtitle' }, 'A React-like framework from scratch (~600 LOC)')
    ),

    h('div', { className: 'input-row' },
      h('input', {
        type: 'text',
        className: 'todo-input',
        value: input,
        placeholder: 'What needs to be done?',
        onInput: (e) => setInput(e.target.value),
        onKeyDown: handleKeyDown,
      }),
      h('button', { className: 'btn-add', onClick: addTodo }, 'Add')
    ),

    h('div', { className: 'filters' },
      h('button', {
        className: filter === 'all' ? 'active' : '',
        onClick: () => setFilter('all'),
      }, `All (${todos.length})`),
      h('button', {
        className: filter === 'active' ? 'active' : '',
        onClick: () => setFilter('active'),
      }, `Active (${todos.filter(t => !t.done).length})`),
      h('button', {
        className: filter === 'completed' ? 'active' : '',
        onClick: () => setFilter('completed'),
      }, `Completed (${todos.filter(t => t.done).length})`)
    ),

    h('ul', { className: 'todo-list' },
      filtered.length === 0
        ? h('li', { className: 'empty' }, 'No tasks here. Add one above.')
        : filtered.map(todo =>
            h('li', {
              key: todo.id,
              className: todo.done ? 'done' : '',
            },
              h('input', {
                type: 'checkbox',
                checked: todo.done,
                onChange: () => toggle(todo.id),
              }),
              h('span', { className: 'text' }, todo.text),
              h('button', {
                className: 'btn-delete',
                onClick: () => remove(todo.id),
              }, '×')
            )
          )
    ),

    h('footer', null,
      h('span', { className: 'counter' },
        `${todos.filter(t => !t.done).length} items left`
      ),
      todos.some(t => t.done) && h('button', {
        className: 'btn-clear',
        onClick: () => setTodos(prev => prev.filter(t => !t.done)),
      }, 'Clear completed')
    )
  );
};

const root = document.getElementById('root');
render(h(TodoApp), root);
