/**
 * TinyReact Browser Demo — TodoList (JSX + Nested Components)
 * 
 * 演示组件拆分和嵌套：
 * - TodoApp: 根组件，管理状态
 * - TodoHeader: 标题区域
 * - TodoInput: 输入框
 * - TodoFilters: 筛选按钮
 * - TodoList: 列表区域
 * - TodoItem: 单个 todo 项
 * - TodoFooter: 底部统计
 * 
 * 构建命令：npm run demo:build
 */

const { createElement: h, render, useState, useEffect } = TinyReact;

// ========== 子组件 ==========

/** 标题区域 */
const TodoHeader = () => (
  <header>
    <h1>TinyReact TodoList</h1>
    <p className="subtitle">A React-like framework from scratch (~600 LOC)</p>
  </header>
);

/** 输入框组件 */
const TodoInput = (props) => (
  <div className="input-row">
    <input
      type="text"
      className="todo-input"
      value={props.value}
      placeholder="What needs to be done?"
      onInput={props.onInput}
      onKeyDown={props.onKeyDown}
    />
    <button className="btn-add" onClick={props.onAdd}>Add</button>
  </div>
);

/** 筛选按钮组件 */
const TodoFilters = (props) => (
  <div className="filters">
    <button
      className={props.filter === 'all' ? 'active' : ''}
      onClick={() => props.onFilterChange('all')}
    >
      All ({props.total})
    </button>
    <button
      className={props.filter === 'active' ? 'active' : ''}
      onClick={() => props.onFilterChange('active')}
    >
      Active ({props.active})
    </button>
    <button
      className={props.filter === 'completed' ? 'active' : ''}
      onClick={() => props.onFilterChange('completed')}
    >
      Completed ({props.completed})
    </button>
  </div>
);

/** 单个 Todo 项组件 */
const TodoItem = (props) => (
  <li key={props.todo.id} className={props.todo.done ? 'done' : ''}>
    <input
      type="checkbox"
      checked={props.todo.done}
      onChange={() => props.onToggle(props.todo.id)}
    />
    <span className="text">{props.todo.text}</span>
    <button className="btn-delete" onClick={() => props.onRemove(props.todo.id)}>×</button>
  </li>
);

/** 列表区域组件 */
const TodoList = (props) => (
  <ul className="todo-list">
    {props.items.length === 0
      ? <li className="empty">No tasks here. Add one above.</li>
      : props.items.map(todo =>
          <TodoItem
            key={todo.id}
            todo={todo}
            onToggle={props.onToggle}
            onRemove={props.onRemove}
          />
        )
    }
  </ul>
);

/** 底部统计组件 */
const TodoFooter = (props) => (
  <footer>
    <span className="counter">
      {props.remaining} items left
    </span>
    {props.hasCompleted && (
      <button className="btn-clear" onClick={props.onClearCompleted}>
        Clear completed
      </button>
    )}
  </footer>
);

// ========== 根组件 ==========

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

  const remaining = todos.filter(t => !t.done).length;

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

  const clearCompleted = () => {
    setTodos(prev => prev.filter(t => !t.done));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') addTodo();
  };

  return (
    <div className="app">
      <TodoHeader />
      <TodoInput
        value={input}
        onInput={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        onAdd={addTodo}
      />
      <TodoFilters
        filter={filter}
        total={todos.length}
        active={remaining}
        completed={todos.filter(t => t.done).length}
        onFilterChange={setFilter}
      />
      <TodoList
        items={filtered}
        onToggle={toggle}
        onRemove={remove}
      />
      <TodoFooter
        remaining={remaining}
        hasCompleted={todos.some(t => t.done)}
        onClearCompleted={clearCompleted}
      />
    </div>
  );
};

const root = document.getElementById('root');
render(<TodoApp />, root);
