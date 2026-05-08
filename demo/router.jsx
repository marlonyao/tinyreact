/**
 * TinyReact Router Demo — 多页面应用
 * 
 * 演示：
 * - HashRouter + Route 路由配置
 * - Link 导航
 * - 动态路由参数 (/users/:id)
 * - useRouter() 获取路由状态
 * 
 * 构建：npm run demo:build
 * 使用：直接打开 demo/router.html
 */

/* globals TinyReact, h, HashRouter, Route, Link, useRouter, useState */

// ========== 页面组件 ==========

/** 首页 */
const Home = () => (
  <div className="page">
    <h1>🏠 Home</h1>
    <p>Welcome to TinyReact Router Demo!</p>
    <p>This is a single-page application with client-side routing.</p>
    <div className="card">
      <h3>Features</h3>
      <ul>
        <li><Link to="/about">About Page</Link></li>
        <li><Link to="/users">User List</Link></li>
        <li><Link to="/users/42">User #42 Profile</Link></li>
        <li><Link to="/counter">Interactive Counter</Link></li>
      </ul>
    </div>
  </div>
);

/** 关于页 */
const About = () => (
  <div className="page">
    <h1>📖 About</h1>
    <p>TinyReact is a minimal React-like framework built from scratch (~600 LOC).</p>
    <p>Router features implemented:</p>
    <ul>
      <li>Hash-based routing (HashRouter)</li>
      <li>Path matching with dynamic params (:id)</li>
      <li>Navigation with Link component</li>
      <li>useRouter() hook for programmatic navigation</li>
    </ul>
    <p><Link to="/">← Back to Home</Link></p>
  </div>
);

/** 用户列表页 */
const UserList = () => {
  const users = [
    { id: 1, name: 'Alice' },
    { id: 2, name: 'Bob' },
    { id: 42, name: 'Yao Lei' },
  ];

  return (
    <div className="page">
      <h1>👥 Users</h1>
      <ul className="user-list">
        {users.map(user => (
          <li key={user.id}>
            <Link to={`/users/${user.id}`}>{user.name}</Link>
          </li>
        ))}
      </ul>
      <p><Link to="/">← Back to Home</Link></p>
    </div>
  );
};

/** 用户详情页（动态路由参数） */
const UserProfile = (props) => {
  const users = {
    1: { name: 'Alice', role: 'Designer' },
    2: { name: 'Bob', role: 'Developer' },
    42: { name: 'Yao Lei', role: 'Software Engineer' },
  };

  const userId = props.params.id;
  const user = users[userId];

  if (!user) {
    return (
      <div className="page">
        <h1>❌ User Not Found</h1>
        <p>No user with ID: {userId}</p>
        <p><Link to="/users">← Back to Users</Link></p>
      </div>
    );
  }

  return (
    <div className="page">
      <h1>👤 {user.name}</h1>
      <div className="card">
        <p><strong>ID:</strong> {userId}</p>
        <p><strong>Name:</strong> {user.name}</p>
        <p><strong>Role:</strong> {user.role}</p>
      </div>
      <p>
        <Link to="/users">← Back to Users</Link>
        {' | '}
        <Link to="/">Home</Link>
      </p>
    </div>
  );
};

/** 交互式计数器页 */
const Counter = () => {
  const [count, setCount] = useState(0);
  const router = useRouter();

  return (
    <div className="page">
      <h1>🔢 Counter</h1>
      <div className="card counter-card">
        <p className="count">{count}</p>
        <div className="counter-buttons">
          <button onClick={() => setCount(c => c - 1)}>-</button>
          <button onClick={() => setCount(0)}>Reset</button>
          <button onClick={() => setCount(c => c + 1)}>+</button>
        </div>
        <p className="route-info">Current route: {router.path}</p>
      </div>
      <p><Link to="/">← Back to Home</Link></p>
    </div>
  );
};

// ========== 导航栏 ==========

const NavBar = () => (
  <nav className="navbar">
    <Link to="/" className="nav-brand">TinyReact Router</Link>
    <div className="nav-links">
      <Link to="/">Home</Link>
      <Link to="/about">About</Link>
      <Link to="/users">Users</Link>
      <Link to="/counter">Counter</Link>
    </div>
  </nav>
);

// ========== 根组件 ==========

const App = () => (
  <div>
    <NavBar />
    <main className="main-content">
      <Route path="/" component={Home} />
      <Route path="/about" component={About} />
      <Route path="/users" component={UserList} />
      <Route path="/users/:id" component={UserProfile} />
      <Route path="/counter" component={Counter} />
    </main>
  </div>
);

// ========== 挂载 ==========

const root = document.getElementById('root');
TinyReact.render(
  h(HashRouter, null, h(App, null)),
  root
);
