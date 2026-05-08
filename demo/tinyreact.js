"use strict";
var TinyReact = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // src/index.ts
  var index_exports = {};
  __export(index_exports, {
    HashRouter: () => HashRouter,
    Link: () => Link,
    Route: () => Route,
    applyPatch: () => applyPatch,
    createContext: () => createContext,
    createDOM: () => createDOM,
    createElement: () => createElement,
    diff: () => diff,
    matchPath: () => matchPath,
    render: () => render,
    setProps: () => setProps,
    updateProps: () => updateProps,
    useContext: () => useContext,
    useEffect: () => useEffect,
    useRouter: () => useRouter,
    useState: () => useState
  });

  // src/createElement.ts
  function createElement(type, props, ...children) {
    const normalizedProps = props ? { ...props } : {};
    const key = normalizedProps.key;
    if (key !== void 0) {
      delete normalizedProps.key;
    }
    const flatChildren = flattenChildren(children);
    return {
      type,
      props: normalizedProps,
      children: flatChildren,
      key
    };
  }
  function flattenChildren(children) {
    const result = [];
    for (const child of children) {
      if (child === null || child === void 0 || child === false || child === true) {
        continue;
      }
      if (typeof child === "string" || typeof child === "number") {
        result.push(createTextNode(String(child)));
      } else if (Array.isArray(child)) {
        result.push(...flattenChildren(child));
      } else {
        result.push(child);
      }
    }
    return result;
  }
  function createTextNode(text) {
    return {
      type: null,
      props: {},
      children: [],
      text
    };
  }

  // src/dom.ts
  function createDOM(vnode) {
    if (vnode.type === null) {
      const textNode = document.createTextNode(String(vnode.text || ""));
      vnode.dom = textNode;
      return textNode;
    }
    const element = document.createElement(vnode.type);
    vnode.dom = element;
    setProps(element, vnode.props);
    for (const child of vnode.children) {
      const childDOM = createDOM(child);
      if (childDOM) {
        element.appendChild(childDOM);
      }
    }
    return element;
  }
  function setProps(element, props) {
    for (const [key, value] of Object.entries(props)) {
      if (value === void 0 || value === null) continue;
      if (key.startsWith("on") && typeof value === "function") {
        const eventType = key.slice(2).toLowerCase();
        element.addEventListener(eventType, value);
        element.__events = element.__events || {};
        element.__events[eventType] = value;
        continue;
      }
      if (key === "checked" || key === "selected" || key === "disabled" || key === "readOnly") {
        element[key] = value;
        continue;
      }
      if (key === "value") {
        element.value = value;
        continue;
      }
      if (key === "style") {
        if (typeof value === "string") {
          element.style.cssText = value;
        } else if (typeof value === "object") {
          Object.assign(element.style, value);
        }
        continue;
      }
      if (key === "className") {
        element.className = String(value);
        continue;
      }
      element.setAttribute(key, String(value));
    }
  }
  function updateProps(element, propPatches) {
    for (const { key, value } of propPatches) {
      if (value === void 0) {
        if (key.startsWith("on")) {
          const eventType = key.slice(2).toLowerCase();
          const oldHandler = element.__events?.[eventType];
          if (oldHandler) {
            element.removeEventListener(eventType, oldHandler);
            delete element.__events[eventType];
          }
        } else if (key === "className") {
          element.className = "";
        } else if (key === "style") {
          element.style.cssText = "";
        } else if (key === "checked" || key === "selected" || key === "disabled" || key === "readOnly") {
          element[key] = false;
        } else if (key === "value") {
          element.value = "";
        } else {
          element.removeAttribute(key);
        }
      } else {
        if (key.startsWith("on") && typeof value === "function") {
          const eventType = key.slice(2).toLowerCase();
          const oldHandler = element.__events?.[eventType];
          if (oldHandler) {
            element.removeEventListener(eventType, oldHandler);
          }
          element.addEventListener(eventType, value);
          element.__events = element.__events || {};
          element.__events[eventType] = value;
        } else if (key === "style") {
          if (typeof value === "string") {
            element.style.cssText = value;
          } else if (typeof value === "object") {
            Object.assign(element.style, value);
          }
        } else if (key === "className") {
          element.className = String(value);
        } else if (key === "checked" || key === "selected" || key === "disabled" || key === "readOnly") {
          element[key] = value;
        } else if (key === "value") {
          element.value = value;
        } else {
          element.setAttribute(key, String(value));
        }
      }
    }
  }

  // src/diff.ts
  function diff(oldVNode, newVNode) {
    if (!oldVNode && !newVNode) {
      return null;
    }
    if (!oldVNode) {
      return { type: "ADD", vnode: newVNode };
    }
    if (!newVNode) {
      return { type: "REMOVE", oldVNode };
    }
    if (oldVNode.type !== newVNode.type) {
      return { type: "REPLACE", vnode: newVNode, oldVNode };
    }
    if (oldVNode.type === null) {
      if (oldVNode.text !== newVNode.text) {
        return { type: "TEXT", text: String(newVNode.text || "") };
      }
      return null;
    }
    const propsPatches = diffProps(oldVNode.props, newVNode.props);
    const childrenPatches = diffChildren(oldVNode.children, newVNode.children);
    if (propsPatches.length === 0 && childrenPatches.length === 0) {
      return null;
    }
    return {
      type: "UPDATE",
      vnode: newVNode,
      props: propsPatches,
      children: childrenPatches
    };
  }
  function diffProps(oldProps, newProps) {
    const patches = [];
    const allKeys = /* @__PURE__ */ new Set([...Object.keys(oldProps), ...Object.keys(newProps)]);
    for (const key of allKeys) {
      const oldValue = oldProps[key];
      const newValue = newProps[key];
      if (!(key in newProps)) {
        patches.push({ key, value: void 0, oldValue });
        continue;
      }
      if (!(key in oldProps) || oldValue !== newValue) {
        patches.push({ key, value: newValue, oldValue });
      }
    }
    return patches;
  }
  function diffChildren(oldChildren, newChildren) {
    const maxLen = Math.max(oldChildren.length, newChildren.length);
    const patches = [];
    for (let i = 0; i < maxLen; i++) {
      const oldChild = i < oldChildren.length ? oldChildren[i] : null;
      const newChild = i < newChildren.length ? newChildren[i] : null;
      const patch = diff(oldChild, newChild);
      if (patch) {
        patch.index = i;
        patches.push(patch);
      }
    }
    return patches;
  }

  // src/patch.ts
  function applyPatch(patch, parentDOM) {
    const index = patch.index ?? 0;
    const targetDOM = parentDOM.childNodes[index];
    switch (patch.type) {
      case "ADD": {
        const dom = createDOM(patch.vnode);
        if (dom) {
          if (index < parentDOM.childNodes.length) {
            parentDOM.insertBefore(dom, parentDOM.childNodes[index]);
          } else {
            parentDOM.appendChild(dom);
          }
        }
        break;
      }
      case "REMOVE": {
        if (targetDOM) {
          parentDOM.removeChild(targetDOM);
        }
        break;
      }
      case "REPLACE": {
        const newDom = createDOM(patch.vnode);
        if (newDom && targetDOM) {
          parentDOM.replaceChild(newDom, targetDOM);
        } else if (newDom) {
          parentDOM.appendChild(newDom);
        }
        break;
      }
      case "TEXT": {
        if (targetDOM) {
          targetDOM.nodeValue = patch.text;
        }
        break;
      }
      case "UPDATE": {
        if (!targetDOM) break;
        if (patch.vnode) {
          patch.vnode.dom = targetDOM;
        }
        if (patch.props) {
          updateProps(targetDOM, patch.props);
        }
        if (patch.children && patch.children.length > 0) {
          const removes = patch.children.filter((p) => p.type === "REMOVE").sort((a, b) => (b.index ?? 0) - (a.index ?? 0));
          const others = patch.children.filter((p) => p.type !== "REMOVE").sort((a, b) => (a.index ?? 0) - (b.index ?? 0));
          for (const childPatch of others) {
            applyPatch(childPatch, targetDOM);
          }
          for (const childPatch of removes) {
            applyPatch(childPatch, targetDOM);
          }
        }
        break;
      }
    }
  }

  // src/hooks.ts
  var currentInstance = null;
  var effectsToRun = [];
  var rerenderFn = null;
  function setRerenderFn(fn) {
    rerenderFn = fn;
  }
  function setCurrentInstance(instance) {
    currentInstance = instance;
  }
  function clearCurrentInstance() {
    currentInstance = null;
  }
  function resetHookIndex(instance) {
    instance.hookIndex = 0;
  }
  function useState(initial) {
    if (!currentInstance) {
      throw new Error("useState must be called inside a function component");
    }
    const instance = currentInstance;
    const idx = instance.hookIndex++;
    if (idx >= instance.hooks.length) {
      instance.hooks.push({ type: "state", value: initial });
    }
    const hook = instance.hooks[idx];
    const setState = (value) => {
      const newValue = typeof value === "function" ? value(hook.value) : value;
      if (newValue !== hook.value) {
        hook.value = newValue;
        if (rerenderFn) {
          rerenderFn(instance.container);
        }
      }
    };
    return [hook.value, setState];
  }
  function useEffect(effect, deps) {
    if (!currentInstance) {
      throw new Error("useEffect must be called inside a function component");
    }
    const idx = currentInstance.hookIndex++;
    if (idx >= currentInstance.hooks.length) {
      currentInstance.hooks.push({ type: "effect", effect, deps, cleanup: void 0 });
      effectsToRun.push({ instance: currentInstance, hookIndex: idx });
    } else {
      const hook = currentInstance.hooks[idx];
      const prevDeps = hook.deps;
      const hasChanged = !prevDeps || !deps || deps.some((d, i) => d !== prevDeps[i]);
      if (hasChanged) {
        if (hook.cleanup) {
          hook.cleanup();
        }
        hook.effect = effect;
        hook.deps = deps;
        effectsToRun.push({ instance: currentInstance, hookIndex: idx });
      }
    }
  }
  function flushEffects() {
    for (const { instance, hookIndex } of effectsToRun) {
      const hook = instance.hooks[hookIndex];
      if (hook.effect) {
        const cleanup = hook.effect();
        hook.cleanup = cleanup || void 0;
      }
    }
    effectsToRun = [];
  }

  // src/context.ts
  var contextStacks = /* @__PURE__ */ new Map();
  function getStack(id) {
    let stack = contextStacks.get(id);
    if (!stack) {
      stack = [];
      contextStacks.set(id, stack);
    }
    return stack;
  }
  function createContext(defaultValue) {
    const contextId = /* @__PURE__ */ Symbol("context");
    const provider = { _providerFor: contextId };
    return { _contextId: contextId, _defaultValue: defaultValue, Provider: provider };
  }
  function getProviderId(type) {
    if (typeof type === "object" && type !== null && "_providerFor" in type) {
      return type._providerFor;
    }
    return null;
  }
  function useContext(context) {
    const stack = getStack(context._contextId);
    if (stack.length > 0) {
      return stack[stack.length - 1];
    }
    return context._defaultValue;
  }
  function pushContextValue(contextId, value) {
    getStack(contextId).push(value);
  }
  function popContextValue(contextId) {
    getStack(contextId).pop();
  }

  // src/render.ts
  var containerMap = /* @__PURE__ */ new WeakMap();
  var rootMap = /* @__PURE__ */ new WeakMap();
  var instanceMap = /* @__PURE__ */ new WeakMap();
  function getInstanceKey(props) {
    return props.key ?? "__default__";
  }
  function getOrCreateInstance(fn, props, container) {
    let containerMap2 = instanceMap.get(container);
    if (!containerMap2) {
      containerMap2 = /* @__PURE__ */ new WeakMap();
      instanceMap.set(container, containerMap2);
    }
    let fnMap = containerMap2.get(fn);
    if (!fnMap) {
      fnMap = /* @__PURE__ */ new Map();
      containerMap2.set(fn, fnMap);
    }
    const key = getInstanceKey(props);
    let instance = fnMap.get(key);
    if (!instance) {
      instance = {
        fn,
        props,
        hooks: [],
        hookIndex: 0,
        container
      };
      fnMap.set(key, instance);
    }
    instance.props = props;
    instance.container = container;
    return instance;
  }
  function expandVNode(vnode, container) {
    const providerId = getProviderId(vnode.type);
    if (providerId) {
      pushContextValue(providerId, vnode.props.value);
      const expandedChildren = vnode.children.map((child) => expandVNode(child, container));
      popContextValue(providerId);
      if (expandedChildren.length === 1) {
        return expandedChildren[0];
      }
      return { type: "div", props: {}, children: expandedChildren };
    }
    if (typeof vnode.type === "function") {
      const fn = vnode.type;
      const instance = getOrCreateInstance(fn, vnode.props, container);
      resetHookIndex(instance);
      setCurrentInstance(instance);
      const propsWithChildren = {
        ...vnode.props,
        children: vnode.children.length === 1 ? vnode.children[0] : vnode.children
      };
      const result = fn(propsWithChildren);
      clearCurrentInstance();
      if (result === null || result === void 0) {
        return { type: null, props: {}, children: [], text: "" };
      }
      return expandVNode(result, container);
    }
    if (vnode.type === null) {
      return vnode;
    }
    return {
      ...vnode,
      children: vnode.children.map((child) => expandVNode(child, container))
    };
  }
  function doRender(vnode, container) {
    const expanded = expandVNode(vnode, container);
    const state = containerMap.get(container);
    if (!state) {
      container.innerHTML = "";
      const dom = createDOM(expanded);
      if (dom) container.appendChild(dom);
      containerMap.set(container, { tree: expanded });
      return;
    }
    const rootPatch = diff(state.tree, expanded);
    if (!rootPatch) {
      containerMap.set(container, { tree: expanded });
      return;
    }
    if (rootPatch.type === "UPDATE") {
      const expectedDOM = state.tree.dom;
      if (container.firstChild !== expectedDOM) {
        container.innerHTML = "";
        const dom = createDOM(expanded);
        if (dom) container.appendChild(dom);
      } else {
        applyPatch(rootPatch, container);
      }
    } else {
      container.innerHTML = "";
      const dom = createDOM(expanded);
      if (dom) container.appendChild(dom);
    }
    containerMap.set(container, { tree: expanded });
  }
  setRerenderFn((container) => {
    const root = rootMap.get(container);
    if (root) {
      doRender(root.vnode, root.container);
      flushEffects();
    }
  });
  function render(vnode, container) {
    rootMap.set(container, { vnode, container });
    doRender(vnode, container);
    flushEffects();
  }

  // src/router.ts
  var RouterContext = createContext({
    path: "/",
    navigate: () => {
    },
    params: {}
  });
  function HashRouter(props) {
    const getHashPath = () => {
      const hash = window.location.hash.slice(1) || "/";
      return hash;
    };
    const [path, setPath] = useState(getHashPath());
    useEffect(() => {
      const onHashChange = () => {
        setPath(getHashPath());
      };
      window.addEventListener("hashchange", onHashChange);
      return () => window.removeEventListener("hashchange", onHashChange);
    }, []);
    const navigate = (newPath) => {
      window.location.hash = newPath;
      if (newPath === path) {
        setPath(newPath);
      }
    };
    const routerState = { path, navigate, params: {} };
    return createElement(RouterContext.Provider, { value: routerState }, props.children);
  }
  function matchPath(pattern, path) {
    const patternParts = pattern.split("/").filter(Boolean);
    const pathParts = path.split("/").filter(Boolean);
    if (patternParts.length !== pathParts.length) {
      return { matched: false, params: {} };
    }
    const params = {};
    for (let i = 0; i < patternParts.length; i++) {
      const patternPart = patternParts[i];
      const pathPart = pathParts[i];
      if (patternPart.startsWith(":")) {
        const paramName = patternPart.slice(1);
        params[paramName] = pathPart;
      } else if (patternPart !== pathPart) {
        return { matched: false, params: {} };
      }
    }
    return { matched: true, params };
  }
  function Route(props) {
    const router = useContext(RouterContext);
    const { matched, params } = matchPath(props.path, router.path);
    if (!matched) return null;
    const Component = props.component;
    return createElement(Component, { params, navigate: router.navigate });
  }
  function Link(props) {
    const router = useContext(RouterContext);
    const handleClick = (e) => {
      e.preventDefault();
      router.navigate(props.to);
    };
    return createElement("a", {
      href: "#" + props.to,
      onClick: handleClick,
      className: props.className || ""
    }, props.children);
  }
  function useRouter() {
    return useContext(RouterContext);
  }
  return __toCommonJS(index_exports);
})();
