import { createElement, render, useState, useEffect } from '../src/index.js';
import { describe, it } from 'node:test';
import assert from 'node:assert';
import { JSDOM } from 'jsdom';

// 每次测试前重置 jsdom 环境
describe('Phase 4: Hooks 系统', () => {
  function freshContainer(): HTMLElement {
    const dom = new JSDOM('<!DOCTYPE html><html><body><div id="root"></div></body></html>');
    (global as any).document = dom.window.document;
    return dom.window.document.getElementById('root')!;
  }

  describe('useState', () => {
    it('基本用法：初始值 + setState 触发重新渲染', () => {
      const container = freshContainer();
      let setCountRef: (v: number | ((prev: number) => number)) => void;

      function Counter() {
        const [count, setCount] = useState(0);
        setCountRef = setCount;
        return createElement('div', null, String(count));
      }

      render(createElement(Counter, {}), container);
      assert.strictEqual(container.textContent, '0');

      // 点击 +1
      setCountRef!(1);
      assert.strictEqual(container.textContent, '1');

      // 再次 +1
      setCountRef!(2);
      assert.strictEqual(container.textContent, '2');
    });

    it('函数式更新：setState(prev => prev + 1)', () => {
      const container = freshContainer();
      let setCountRef: (v: number | ((prev: number) => number)) => void;

      function Counter() {
        const [count, setCount] = useState(10);
        setCountRef = setCount;
        return createElement('span', null, String(count));
      }

      render(createElement(Counter, {}), container);
      assert.strictEqual(container.textContent, '10');

      setCountRef!(prev => prev + 5);
      assert.strictEqual(container.textContent, '15');

      setCountRef!(prev => prev + 5);
      assert.strictEqual(container.textContent, '20');
    });

    it('多个 useState 按顺序保存各自状态', () => {
      const container = freshContainer();
      let setARef: (v: number) => void;
      let setBRef: (v: string) => void;

      function MultiState() {
        const [a, setA] = useState(1);
        const [b, setB] = useState('x');
        setARef = setA;
        setBRef = setB;
        return createElement('div', null, `${a}-${b}`);
      }

      render(createElement(MultiState, {}), container);
      assert.strictEqual(container.textContent, '1-x');

      setARef!(2);
      assert.strictEqual(container.textContent, '2-x');

      setBRef!('y');
      assert.strictEqual(container.textContent, '2-y');
    });

    it('相同值 setState 不触发重新渲染', () => {
      const container = freshContainer();
      let renderCount = 0;
      let setCountRef: (v: number) => void;

      function Counter() {
        renderCount++;
        const [count, setCount] = useState(0);
        setCountRef = setCount;
        return createElement('div', null, String(count));
      }

      render(createElement(Counter, {}), container);
      assert.strictEqual(renderCount, 1);

      setCountRef!(0); // 相同值
      assert.strictEqual(renderCount, 1); // 不应该重新渲染

      setCountRef!(1); // 不同值
      assert.strictEqual(renderCount, 2);
    });
  });

  describe('useEffect', () => {
    it('首次渲染后执行 effect', () => {
      const container = freshContainer();
      const effects: string[] = [];

      function Logger() {
        useEffect(() => {
          effects.push('mounted');
        });
        return createElement('div', null, 'hello');
      }

      render(createElement(Logger, {}), container);
      assert.deepStrictEqual(effects, ['mounted']);
    });

    it('依赖变化时执行，不变化时跳过', () => {
      const container = freshContainer();
      const effects: string[] = [];
      let setValueRef: (v: number) => void;

      function DepEffect() {
        const [value, setValue] = useState(0);
        setValueRef = setValue;

        useEffect(() => {
          effects.push(`effect:${value}`);
        }, [value]);

        return createElement('div', null, String(value));
      }

      render(createElement(DepEffect, {}), container);
      assert.deepStrictEqual(effects, ['effect:0']);

      setValueRef!(1);
      assert.deepStrictEqual(effects, ['effect:0', 'effect:1']);

      setValueRef!(1); // 相同值
      assert.deepStrictEqual(effects, ['effect:0', 'effect:1']); // 不应再执行
    });

    it('空依赖数组：只在首次渲染执行', () => {
      const container = freshContainer();
      const effects: string[] = [];
      let setValueRef: (v: number) => void;

      function OnceEffect() {
        const [value, setValue] = useState(0);
        setValueRef = setValue;

        useEffect(() => {
          effects.push('once');
        }, []);

        return createElement('div', null, String(value));
      }

      render(createElement(OnceEffect, {}), container);
      assert.deepStrictEqual(effects, ['once']);

      setValueRef!(1);
      assert.deepStrictEqual(effects, ['once']); // 不应再执行

      setValueRef!(2);
      assert.deepStrictEqual(effects, ['once']);
    });

    it('cleanup：依赖变化时先执行旧 cleanup', () => {
      const container = freshContainer();
      const log: string[] = [];
      let setIdRef: (v: number) => void;

      function CleanupEffect() {
        const [id, setId] = useState(1);
        setIdRef = setId;

        useEffect(() => {
          log.push(`effect:${id}`);
          return () => {
            log.push(`cleanup:${id}`);
          };
        }, [id]);

        return createElement('div', null, String(id));
      }

      render(createElement(CleanupEffect, {}), container);
      assert.deepStrictEqual(log, ['effect:1']);

      setIdRef!(2);
      assert.deepStrictEqual(log, ['effect:1', 'cleanup:1', 'effect:2']);

      setIdRef!(3);
      assert.deepStrictEqual(log, ['effect:1', 'cleanup:1', 'effect:2', 'cleanup:2', 'effect:3']);
    });

    it('无依赖：每次渲染后都执行（cleanup 先执行）', () => {
      const container = freshContainer();
      const log: string[] = [];
      let setValueRef: (v: number) => void;

      function AlwaysEffect() {
        const [value, setValue] = useState(0);
        setValueRef = setValue;

        useEffect(() => {
          log.push(`run:${value}`);
          return () => {
            log.push(`cleanup:${value}`);
          };
        });

        return createElement('div', null, String(value));
      }

      render(createElement(AlwaysEffect, {}), container);
      assert.deepStrictEqual(log, ['run:0']);

      setValueRef!(1);
      // 先 cleanup 旧 effect，再执行新 effect
      assert.deepStrictEqual(log, ['run:0', 'cleanup:0', 'run:1']);
    });
  });

  describe('hooks 规则与边界', () => {
    it('hooks 在组件外调用抛出错误', () => {
      assert.throws(() => {
        useState(0);
      }, /useState must be called inside a function component/);

      assert.throws(() => {
        useEffect(() => {});
      }, /useEffect must be called inside a function component/);
    });

    it('嵌套组件各自拥有独立 hooks 状态', () => {
      const container = freshContainer();
      let setParentRef: (v: string) => void;
      let setChildRef: (v: number) => void;

      function Child() {
        const [count, setCount] = useState(100);
        setChildRef = setCount;
        return createElement('span', null, String(count));
      }

      function Parent() {
        const [label, setLabel] = useState('A');
        setParentRef = setLabel;
        return createElement('div', null,
          createElement('h1', null, label),
          createElement(Child, {})
        );
      }

      render(createElement(Parent, {}), container);
      assert.strictEqual(container.querySelector('h1')?.textContent, 'A');
      assert.strictEqual(container.querySelector('span')?.textContent, '100');

      // 更新子组件
      setChildRef!(200);
      assert.strictEqual(container.querySelector('span')?.textContent, '200');
      assert.strictEqual(container.querySelector('h1')?.textContent, 'A'); // 父不变

      // 更新父组件
      setParentRef!('B');
      assert.strictEqual(container.querySelector('h1')?.textContent, 'B');
      assert.strictEqual(container.querySelector('span')?.textContent, '200'); // 子状态保留
    });
  });

  describe('hooks + DOM 交互', () => {
    it('useState + onClick 实现计数器', () => {
      const container = freshContainer();

      function Counter() {
        const [count, setCount] = useState(0);
        return createElement('button', {
          onClick: () => setCount(prev => prev + 1)
        }, String(count));
      }

      render(createElement(Counter, {}), container);
      const btn = container.querySelector('button')!;
      assert.strictEqual(btn.textContent, '0');

      btn.click();
      assert.strictEqual(btn.textContent, '1');

      btn.click();
      assert.strictEqual(btn.textContent, '2');
    });

    it('useEffect 配合 props 变化', () => {
      const container = freshContainer();
      const effects: string[] = [];

      function PropEffect(props: { userId: number }) {
        useEffect(() => {
          effects.push(`fetch:${props.userId}`);
        }, [props.userId]);

        return createElement('div', null, `User ${props.userId}`);
      }

      render(createElement(PropEffect, { userId: 1 }), container);
      assert.deepStrictEqual(effects, ['fetch:1']);

      render(createElement(PropEffect, { userId: 2 }), container);
      assert.deepStrictEqual(effects, ['fetch:1', 'fetch:2']);

      render(createElement(PropEffect, { userId: 2 }), container);
      assert.deepStrictEqual(effects, ['fetch:1', 'fetch:2']); // 相同 props，不应执行
    });
  });
});
