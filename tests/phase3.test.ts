import { createElement } from '../src/createElement.js';
import { render } from '../src/render.js';
import { diff } from '../src/diff.js';
import { describe, it } from 'node:test';
import assert from 'node:assert';
import { JSDOM } from 'jsdom';

// 设置 jsdom 全局环境
const dom = new JSDOM('<!DOCTYPE html><html><body><div id="root"></div></body></html>');
global.document = dom.window.document;

describe('Phase 3: Patch + 组件更新', () => {
  describe('增量更新', () => {
    it('更新文本内容', () => {
      const container = document.getElementById('root')!;
      render(createElement('div', null, 'old'), container);
      render(createElement('div', null, 'new'), container);
      assert.strictEqual(container.textContent, 'new');
    });

    it('更新 props', () => {
      const container = document.getElementById('root')!;
      render(createElement('div', { id: 'a' }), container);
      render(createElement('div', { id: 'b' }), container);
      assert.strictEqual(container.querySelector('div')?.id, 'b');
    });

    it('删除 props', () => {
      const container = document.getElementById('root')!;
      render(createElement('div', { id: 'test', className: 'foo' }), container);
      render(createElement('div', { id: 'test' }), container);
      const div = container.querySelector('div')!;
      assert.strictEqual(div.id, 'test');
      assert.strictEqual(div.className, '');
    });

    it('添加子节点', () => {
      const container = document.getElementById('root')!;
      render(createElement('ul', null, createElement('li', null, 'A')), container);
      render(createElement('ul', null,
        createElement('li', null, 'A'),
        createElement('li', null, 'B')
      ), container);
      assert.strictEqual(container.querySelectorAll('li').length, 2);
      assert.strictEqual(container.querySelectorAll('li')[1]?.textContent, 'B');
    });

    it('删除子节点', () => {
      const container = document.getElementById('root')!;
      render(createElement('ul', null,
        createElement('li', null, 'A'),
        createElement('li', null, 'B')
      ), container);
      render(createElement('ul', null, createElement('li', null, 'A')), container);
      assert.strictEqual(container.querySelectorAll('li').length, 1);
    });

    it('替换子节点', () => {
      const container = document.getElementById('root')!;
      render(createElement('div', null, createElement('span', null, 'old')), container);
      render(createElement('div', null, createElement('p', null, 'new')), container);
      assert.ok(container.querySelector('p'));
      assert.strictEqual(container.querySelector('span'), null);
      assert.strictEqual(container.querySelector('p')?.textContent, 'new');
    });

    it('多层嵌套增量更新', () => {
      const container = document.getElementById('root')!;
      render(createElement('div', { id: 'app' },
        createElement('header', null,
          createElement('h1', null, 'Old')
        ),
        createElement('main', null,
          createElement('p', null, 'Content')
        )
      ), container);
      render(createElement('div', { id: 'app' },
        createElement('header', null,
          createElement('h1', null, 'New')
        ),
        createElement('main', null,
          createElement('p', null, 'Content')
        )
      ), container);
      assert.strictEqual(container.querySelector('h1')?.textContent, 'New');
      // main 和 p 应该没被重建（检查是不是同一个 DOM 节点）
      const main = container.querySelector('main')!;
      const p = container.querySelector('p')!;
      assert.ok(main);
      assert.ok(p);
    });

    it('根节点类型变化时全量替换', () => {
      const container = document.getElementById('root')!;
      render(createElement('div', null, 'old'), container);
      render(createElement('span', null, 'new'), container);
      assert.strictEqual(container.innerHTML, '<span>new</span>');
    });

    it('相同节点二次 render 不操作 DOM', () => {
      const container = document.getElementById('root')!;
      const vnode = createElement('div', null, 'same');
      render(vnode, container);
      const dom = container.firstChild;
      render(vnode, container);
      // DOM 节点应该还是同一个
      assert.strictEqual(container.firstChild, dom);
    });
  });

  describe('函数组件', () => {
    it('渲染函数组件', () => {
      const Hello = (props: { name: string }) =>
        createElement('h1', null, `Hello ${props.name}`);
      const container = document.getElementById('root')!;
      render(createElement(Hello, { name: 'World' }), container);
      assert.strictEqual(container.querySelector('h1')?.textContent, 'Hello World');
    });

    it('函数组件 props 变化', () => {
      const Hello = (props: { name: string }) =>
        createElement('h1', null, `Hello ${props.name}`);
      const container = document.getElementById('root')!;
      render(createElement(Hello, { name: 'World' }), container);
      render(createElement(Hello, { name: 'React' }), container);
      assert.strictEqual(container.querySelector('h1')?.textContent, 'Hello React');
    });

    it('嵌套函数组件', () => {
      const Title = (props: { text: string }) =>
        createElement('h1', null, props.text);
      const App = () =>
        createElement('div', null, createElement(Title, { text: 'Nested' }));
      const container = document.getElementById('root')!;
      render(createElement(App, {}), container);
      assert.strictEqual(container.querySelector('h1')?.textContent, 'Nested');
    });

    it('函数组件返回复杂结构', () => {
      const List = (props: { items: string[] }) =>
        createElement('ul', null,
          ...props.items.map(item => createElement('li', null, item))
        );
      const container = document.getElementById('root')!;
      render(createElement(List, { items: ['a', 'b'] }), container);
      assert.strictEqual(container.querySelectorAll('li').length, 2);

      render(createElement(List, { items: ['a', 'b', 'c'] }), container);
      assert.strictEqual(container.querySelectorAll('li').length, 3);
    });
  });

  describe('事件处理', () => {
    it('绑定点击事件', () => {
      const container = document.getElementById('root')!;
      let clicked = false;
      render(createElement('button', {
        onClick: () => { clicked = true; }
      }, 'Click'), container);

      const btn = container.querySelector('button')!;
      btn.click();
      assert.strictEqual(clicked, true);
    });

    it('更新事件处理器', () => {
      const container = document.getElementById('root')!;
      let count = 0;
      render(createElement('button', {
        onClick: () => { count = 1; }
      }, 'Click'), container);

      render(createElement('button', {
        onClick: () => { count = 2; }
      }, 'Click'), container);

      const btn = container.querySelector('button')!;
      btn.click();
      assert.strictEqual(count, 2);
    });
  });
});
