/**
 * TinyReact Browser Demo — TodoList (JSX)
 * 
 * JSX 文件通过 Babel 编译为普通 JS，再由 esbuild 打包。
 * 构建命令：npm run demo:build
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

  return (
    <div className="app">
      <header>
        <h1>TinyReact TodoList</h1>
        <p className="subtitle">A React-like framework from scratch (~600 LOC)</p>
      </header>

      <div className="input-row">
        <input
          type="text"
          className="todo-input"
          value={input}
          placeholder="What needs to be done?"
          onInput={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button className="btn-add" onClick={addTodo}>Add</button>
      </div>

      <div className="filters">
        <button
          className={filter === 'all' ? 'active' : ''}
          onClick={() => setFilter('all')}
        >
          All ({todos.length})
        </button>
        <button
          className={filter === 'active' ? 'active' : ''}
          onClick={() => setFilter('active')}
        >
          Active ({todos.filter(t => !t.done).length})
        </button>
        <button
          className={filter === 'completed' ? 'active' : ''}
          onClick={() => setFilter('completed')}
        >
          Completed ({todos.filter(t => t.done).length})
        </button>
      </div>

      <ul className="todo-list">
        {filtered.length === 0
          ? <li className="empty">No tasks here. Add one above.</li>
          : filtered.map(todo =>
              <li key={todo.id} className={todo.done ? 'done' : ''}>
                <input
                  type="checkbox"
                  checked={todo.done}
                  onChange={() => toggle(todo.id)}
                />
                <span className="text">{todo.text}</span>
                <button className="btn-delete" onClick={() => remove(todo.id)}>×</button>
              </li>
            )
        }
      </ul>

      <footer>
        <span className="counter">
          {todos.filter(t => !t.done).length} items left
        </span>
        {todos.some(t => t.done) && (
          <button className="btn-clear" onClick={() => setTodos(prev => prev.filter(t => !t.done))}>
            Clear completed
          </button>
        )}
      </footer>
    </div>
  );
};

const root = document.getElementById('root');
render(<TodoApp />, root);
