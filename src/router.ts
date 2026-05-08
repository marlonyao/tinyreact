// router.ts — 简易 React Router 实现
// 原理：hash 路由 + Context + useState + popstate/hashchange

import { createElement as h, useState, useEffect, createContext, useContext } from './index.js';

// ========================
// Router Context
// ========================

interface RouterState {
  path: string;
  navigate: (path: string) => void;
  params: Record<string, string>;
}

const RouterContext = createContext<RouterState>({
  path: '/',
  navigate: () => {},
  params: {},
});

// ========================
// Hash Router
// ========================

/**
 * HashRouter: 使用 URL hash (#/) 管理路由
 * 
 * 用法：
 * <HashRouter>
 *   <Route path="/" component={Home} />
 *   <Route path="/about" component={About} />
 * </HashRouter>
 */
export function HashRouter(props: { children: any }) {
  const getHashPath = () => {
    const hash = window.location.hash.slice(1) || '/';
    return hash;
  };

  const [path, setPath] = useState(getHashPath());

  useEffect(() => {
    const onHashChange = () => {
      setPath(getHashPath());
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const navigate = (newPath: string) => {
    window.location.hash = newPath;
    // hashchange 会触发 setPath，但如果是相同 hash 则不会触发
    if (newPath === path) {
      setPath(newPath);
    }
  };

  const routerState: RouterState = { path, navigate, params: {} };

  return h(RouterContext.Provider, { value: routerState }, props.children);
}

// ========================
// Route 匹配
// ========================

/**
 * 匹配路径模式，支持动态参数 :id
 * 
 * matchPath('/users/:id', '/users/123') → { matched: true, params: { id: '123' } }
 * matchPath('/about', '/about') → { matched: true, params: {} }
 * matchPath('/about', '/') → { matched: false, params: {} }
 */
export function matchPath(
  pattern: string,
  path: string
): { matched: boolean; params: Record<string, string> } {
  const patternParts = pattern.split('/').filter(Boolean);
  const pathParts = path.split('/').filter(Boolean);

  if (patternParts.length !== pathParts.length) {
    return { matched: false, params: {} };
  }

  const params: Record<string, string> = {};

  for (let i = 0; i < patternParts.length; i++) {
    const patternPart = patternParts[i];
    const pathPart = pathParts[i];

    if (patternPart.startsWith(':')) {
      // 动态参数
      const paramName = patternPart.slice(1);
      params[paramName] = pathPart;
    } else if (patternPart !== pathPart) {
      return { matched: false, params: {} };
    }
  }

  return { matched: true, params };
}

/**
 * Route: 定义路径和组件的映射
 * 
 * <Route path="/" component={Home} />
 * <Route path="/users/:id" component={UserProfile} />
 */
export function Route(props: { path: string; component: Function }) {
  const router = useContext(RouterContext);
  const { matched, params } = matchPath(props.path, router.path);

  if (!matched) return null;

  const Component = props.component;
  return h(Component, { params, navigate: router.navigate });
}

// ========================
// Link 导航组件
// ========================

/**
 * Link: 导航链接
 * 
 * <Link to="/about">About</Link>
 */
export function Link(props: { to: string; children: any; className?: string }) {
  const router = useContext(RouterContext);

  const handleClick = (e: Event) => {
    e.preventDefault();
    router.navigate(props.to);
  };

  return h('a', {
    href: '#' + props.to,
    onClick: handleClick,
    className: props.className || '',
  }, props.children);
}

// ========================
// 工具函数
// ========================

/**
 * useRouter: 在组件内获取路由状态
 */
export function useRouter(): RouterState {
  return useContext(RouterContext);
}
