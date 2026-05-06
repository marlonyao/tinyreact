import { diff, Patch } from '../src/diff.js';
import { createElement } from '../src/createElement.js';
import { describe, it } from 'node:test';
import assert from 'node:assert';

describe('Phase 2: Diff 算法', () => {
  describe('相同节点', () => {
    it('完全相同的节点返回 null', () => {
      const oldVNode = createElement('div', null, 'hello');
      const newVNode = createElement('div', null, 'hello');
      assert.strictEqual(diff(oldVNode, newVNode), null);
    });

    it('相同类型相同 props 返回 null', () => {
      const oldVNode = createElement('span', { className: 'x' }, 'a');
      const newVNode = createElement('span', { className: 'x' }, 'a');
      assert.strictEqual(diff(oldVNode, newVNode), null);
    });
  });

  describe('节点增删', () => {
    it('旧节点为空 → ADD', () => {
      const newVNode = createElement('div', null, 'new');
      const patch = diff(null, newVNode);
      assert.strictEqual(patch?.type, 'ADD');
      assert.strictEqual(patch?.vnode, newVNode);
    });

    it('新节点为空 → REMOVE', () => {
      const oldVNode = createElement('div', null, 'old');
      const patch = diff(oldVNode, null);
      assert.strictEqual(patch?.type, 'REMOVE');
      assert.strictEqual(patch?.oldVNode, oldVNode);
    });

    it('类型不同 → REPLACE', () => {
      const oldVNode = createElement('div', null);
      const newVNode = createElement('span', null);
      const patch = diff(oldVNode, newVNode);
      assert.strictEqual(patch?.type, 'REPLACE');
    });

    it('文本节点和元素节点互转 → REPLACE', () => {
      const oldVNode = createElement('div', null);
      const newVNode = createElement(null, null, 'text');
      // 这里 createElement 的第一个参数不能是 null，但 diff 会处理这种情况
      // 我们用 VNode 直接构造
    });
  });

  describe('文本节点', () => {
    it('文本内容变化 → TEXT', () => {
      const oldVNode = createElement('div', null, 'old');
      const newVNode = createElement('div', null, 'new');
      const patch = diff(oldVNode, newVNode);
      assert.strictEqual(patch?.type, 'UPDATE');
      // 子节点应该有 TEXT patch
      assert.strictEqual(patch?.children?.[0]?.type, 'TEXT');
      assert.strictEqual(patch?.children?.[0]?.text, 'new');
    });

    it('文本内容相同 → 无 patch', () => {
      const oldVNode = createElement('div', null, 'same');
      const newVNode = createElement('div', null, 'same');
      const patch = diff(oldVNode, newVNode);
      assert.strictEqual(patch, null);
    });
  });

  describe('Props 变更', () => {
    it('新增属性', () => {
      const oldVNode = createElement('div', null);
      const newVNode = createElement('div', { id: 'app' });
      const patch = diff(oldVNode, newVNode);
      assert.strictEqual(patch?.type, 'UPDATE');
      assert.strictEqual(patch?.props?.length, 1);
      assert.strictEqual(patch?.props?.[0].key, 'id');
      assert.strictEqual(patch?.props?.[0].value, 'app');
    });

    it('删除属性', () => {
      const oldVNode = createElement('div', { id: 'app' });
      const newVNode = createElement('div', null);
      const patch = diff(oldVNode, newVNode);
      assert.strictEqual(patch?.type, 'UPDATE');
      assert.strictEqual(patch?.props?.[0].key, 'id');
      assert.strictEqual(patch?.props?.[0].value, undefined);
    });

    it('修改属性值', () => {
      const oldVNode = createElement('div', { className: 'old' });
      const newVNode = createElement('div', { className: 'new' });
      const patch = diff(oldVNode, newVNode);
      assert.strictEqual(patch?.type, 'UPDATE');
      assert.strictEqual(patch?.props?.[0].key, 'className');
      assert.strictEqual(patch?.props?.[0].value, 'new');
      assert.strictEqual(patch?.props?.[0].oldValue, 'old');
    });

    it('多个属性变更', () => {
      const oldVNode = createElement('div', { a: '1', b: '2' });
      const newVNode = createElement('div', { a: '10', c: '3' });
      const patch = diff(oldVNode, newVNode);
      assert.strictEqual(patch?.type, 'UPDATE');
      assert.strictEqual(patch?.props?.length, 3); // a 修改, b 删除, c 新增
    });
  });

  describe('子节点变更', () => {
    it('子节点新增', () => {
      const oldVNode = createElement('ul', null);
      const newVNode = createElement('ul', null,
        createElement('li', null, 'item')
      );
      const patch = diff(oldVNode, newVNode);
      assert.strictEqual(patch?.type, 'UPDATE');
      assert.strictEqual(patch?.children?.[0]?.type, 'ADD');
    });

    it('子节点删除', () => {
      const oldVNode = createElement('ul', null,
        createElement('li', null, 'item')
      );
      const newVNode = createElement('ul', null);
      const patch = diff(oldVNode, newVNode);
      assert.strictEqual(patch?.type, 'UPDATE');
      assert.strictEqual(patch?.children?.[0]?.type, 'REMOVE');
    });

    it('子节点替换', () => {
      const oldVNode = createElement('div', null,
        createElement('span', null)
      );
      const newVNode = createElement('div', null,
        createElement('p', null)
      );
      const patch = diff(oldVNode, newVNode);
      assert.strictEqual(patch?.type, 'UPDATE');
      assert.strictEqual(patch?.children?.[0]?.type, 'REPLACE');
    });

    it('多个子节点混合变更', () => {
      const oldVNode = createElement('ul', null,
        createElement('li', { key: 'a' }, 'A'),
        createElement('li', { key: 'b' }, 'B')
      );
      const newVNode = createElement('ul', null,
        createElement('li', { key: 'a' }, 'A'),
        createElement('li', { key: 'c' }, 'C'),
        createElement('li', { key: 'd' }, 'D')
      );
      const patch = diff(oldVNode, newVNode);
      assert.strictEqual(patch?.type, 'UPDATE');
      // 第1个相同（null），第2个变成 UPDATE（内容变），第3个 ADD
      // 但因为我们现在没有 key 优化，按索引对比
      assert.strictEqual(patch?.children?.length, 2); // 第2个 UPDATE, 第3个 ADD
    });
  });

  describe('复杂结构 diff', () => {
    it('深层嵌套变更', () => {
      const oldVNode = createElement('div', { id: 'app' },
        createElement('header', null,
          createElement('h1', null, 'Old Title')
        )
      );
      const newVNode = createElement('div', { id: 'app' },
        createElement('header', null,
          createElement('h1', null, 'New Title')
        )
      );
      const patch = diff(oldVNode, newVNode);
      assert.strictEqual(patch?.type, 'UPDATE');
      // header 有 UPDATE patch
      assert.strictEqual(patch?.children?.[0]?.type, 'UPDATE');
      // h1 有 UPDATE patch
      assert.strictEqual(patch?.children?.[0]?.children?.[0]?.type, 'UPDATE');
      // text 有 TEXT patch
      assert.strictEqual(patch?.children?.[0]?.children?.[0]?.children?.[0]?.type, 'TEXT');
      assert.strictEqual(patch?.children?.[0]?.children?.[0]?.children?.[0]?.text, 'New Title');
    });
  });
});
