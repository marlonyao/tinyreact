import { createElement } from '../src/createElement.js';
import { render } from '../src/render.js';
import { describe, it } from 'node:test';
import assert from 'node:assert';
import { JSDOM } from 'jsdom';
// 设置 jsdom 全局环境
const dom = new JSDOM('<!DOCTYPE html><html><body><div id="root"></div></body></html>');
global.document = dom.window.document;
describe('Phase 1: Virtual DOM + 首次渲染', () => {
    describe('createElement', () => {
        it('创建简单元素', () => {
            const vnode = createElement('div', null);
            assert.strictEqual(vnode.type, 'div');
            assert.deepStrictEqual(vnode.props, {});
            assert.deepStrictEqual(vnode.children, []);
        });
        it('带 props 的元素', () => {
            const vnode = createElement('div', { id: 'app', className: 'container' });
            assert.strictEqual(vnode.props.id, 'app');
            assert.strictEqual(vnode.props.className, 'container');
        });
        it('带文本子节点', () => {
            const vnode = createElement('h1', null, 'Hello World');
            assert.strictEqual(vnode.children.length, 1);
            assert.strictEqual(vnode.children[0].type, null);
            assert.strictEqual(vnode.children[0].text, 'Hello World');
        });
        it('多层嵌套', () => {
            const vnode = createElement('div', null, createElement('p', null, 'Paragraph 1'), createElement('p', null, 'Paragraph 2'));
            assert.strictEqual(vnode.children.length, 2);
            assert.strictEqual(vnode.children[0].type, 'p');
            assert.strictEqual(vnode.children[1].type, 'p');
        });
        it('过滤 falsy children', () => {
            const vnode = createElement('div', null, 'a', null, undefined, false, 'b');
            assert.strictEqual(vnode.children.length, 2);
            assert.strictEqual(vnode.children[0].text, 'a');
            assert.strictEqual(vnode.children[1].text, 'b');
        });
        it('数字子节点转为文本', () => {
            const vnode = createElement('span', null, 42);
            assert.strictEqual(vnode.children[0].type, null);
            assert.strictEqual(vnode.children[0].text, '42');
        });
        it('数组子节点扁平化', () => {
            const items = ['a', 'b', 'c'].map(t => createElement('li', null, t));
            const vnode = createElement('ul', null, ...items);
            assert.strictEqual(vnode.children.length, 3);
            assert.strictEqual(vnode.children[0].type, 'li');
        });
        it('从 props 中提取 key', () => {
            const vnode = createElement('div', { key: 'unique' });
            assert.strictEqual(vnode.key, 'unique');
            assert.strictEqual(vnode.props.key, undefined);
        });
    });
    describe('render', () => {
        it('渲染文本到容器', () => {
            const container = document.getElementById('root');
            const vnode = createElement('div', null, 'Hello');
            render(vnode, container);
            assert.strictEqual(container.innerHTML, '<div>Hello</div>');
        });
        it('渲染嵌套元素', () => {
            const container = document.getElementById('root');
            const vnode = createElement('div', { className: 'box' }, createElement('h1', null, 'Title'), createElement('p', null, 'Content'));
            render(vnode, container);
            assert.strictEqual(container.querySelector('h1')?.textContent, 'Title');
            assert.strictEqual(container.querySelector('p')?.textContent, 'Content');
            assert.ok(container.querySelector('.box'));
        });
        it('渲染复杂结构', () => {
            const container = document.getElementById('root');
            const vnode = createElement('div', { id: 'app' }, createElement('header', null, createElement('h1', null, 'TinyReact')), createElement('main', null, createElement('p', null, 'A minimal React-like framework'), createElement('button', { id: 'btn' }, 'Click me')));
            render(vnode, container);
            assert.ok(container.querySelector('#app'));
            assert.ok(container.querySelector('header h1'));
            assert.ok(container.querySelector('main #btn'));
            assert.strictEqual(container.querySelector('main p')?.textContent, 'A minimal React-like framework');
        });
        it('渲染前清空容器', () => {
            const container = document.getElementById('root');
            container.innerHTML = '<span>old</span>';
            const vnode = createElement('div', null, 'new');
            render(vnode, container);
            assert.strictEqual(container.innerHTML, '<div>new</div>');
        });
    });
});
