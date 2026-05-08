// context.test.ts — useContext + createContext 测试

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';

const dom = new JSDOM('<!DOCTYPE html><html><body><div id="root"></div></body></html>');
(globalThis as any).document = dom.window.document;
(globalThis as any).HTMLElement = dom.window.HTMLElement;
(globalThis as any).Text = dom.window.Text;
(globalThis as any).Node = dom.window.Node;

import { createElement, render, createContext, useContext } from '../src/index.js';
const h = createElement;

describe('createContext + useContext', () => {
  it('should return default value without Provider', () => {
    const ThemeCtx = createContext('light');

    const Child = () => {
      const theme = useContext(ThemeCtx);
      return h('span', null, theme);
    };

    const container = document.createElement('div');
    render(h(Child, null), container);

    assert.equal(container.innerHTML, '<span>light</span>');
  });

  it('should provide value through Provider', () => {
    const ThemeCtx = createContext('light');

    const Child = () => {
      const theme = useContext(ThemeCtx);
      return h('span', null, theme);
    };

    const App = () => h(ThemeCtx.Provider, { value: 'dark' }, h(Child, null));

    const container = document.createElement('div');
    render(h(App, null), container);

    assert.equal(container.innerHTML, '<span>dark</span>');
  });

  it('should support nested Providers', () => {
    const Ctx = createContext('default');

    const Display = () => {
      const val = useContext(Ctx);
      return h('span', null, val);
    };

    const App = () =>
      h(Ctx.Provider, { value: 'outer' },
        h('div', null,
          h(Display, null),
          h(Ctx.Provider, { value: 'inner' },
            h(Display, null)
          ),
          h(Display, null)
        )
      );

    const container = document.createElement('div');
    render(h(App, null), container);

    assert.equal(container.innerHTML, '<div><span>outer</span><span>inner</span><span>outer</span></div>');
  });

  it('should isolate different contexts', () => {
    const CtxA = createContext('A-default');
    const CtxB = createContext('B-default');

    const ShowA = () => h('span', null, useContext(CtxA));
    const ShowB = () => h('span', null, useContext(CtxB));

    const App = () =>
      h('div', null,
        h(CtxA.Provider, { value: 'A-value' },
          h('div', null,
            h(ShowA, null),
            h(ShowB, null)
          )
        )
      );

    const container = document.createElement('div');
    render(h(App, null), container);

    assert.equal(container.innerHTML, '<div><div><span>A-value</span><span>B-default</span></div></div>');
  });
});
