// router.test.ts — Router 功能测试

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { matchPath } from '../src/router.js';

describe('matchPath', () => {
  it('should match exact path', () => {
    const result = matchPath('/', '/');
    assert.deepEqual(result, { matched: true, params: {} });
  });

  it('should match simple path', () => {
    const result = matchPath('/about', '/about');
    assert.deepEqual(result, { matched: true, params: {} });
  });

  it('should not match different paths', () => {
    const result = matchPath('/about', '/');
    assert.deepEqual(result, { matched: false, params: {} });
  });

  it('should extract dynamic params', () => {
    const result = matchPath('/users/:id', '/users/123');
    assert.deepEqual(result, { matched: true, params: { id: '123' } });
  });

  it('should extract multiple dynamic params', () => {
    const result = matchPath('/users/:userId/posts/:postId', '/users/42/posts/7');
    assert.deepEqual(result, { matched: true, params: { userId: '42', postId: '7' } });
  });

  it('should not match when lengths differ', () => {
    const result = matchPath('/users/:id', '/users');
    assert.deepEqual(result, { matched: false, params: {} });
  });

  it('should match multi-segment path', () => {
    const result = matchPath('/a/b/c', '/a/b/c');
    assert.deepEqual(result, { matched: true, params: {} });
  });

  it('should not match partial path', () => {
    const result = matchPath('/a/b', '/a/b/c');
    assert.deepEqual(result, { matched: false, params: {} });
  });
});
