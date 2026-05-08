// build-demo.js — esbuild 构建脚本，支持 JSX
import esbuild from 'esbuild';

// Step 1: 打包框架核心（IIFE 格式，暴露全局 TinyReact）
await esbuild.build({
  entryPoints: ['src/index.ts'],
  bundle: true,
  format: 'iife',
  globalName: 'TinyReact',
  outfile: 'demo/tinyreact.js',
});

// Step 2: 编译 demo JSX → JS（inject TinyReact 的 h 函数）
await esbuild.build({
  entryPoints: ['demo/todolist.jsx'],
  outfile: 'demo/todolist.js',
  format: 'iife',
  banner: {
    js: 'const h = TinyReact.createElement;',
  },
  jsx: 'transform',
  jsxFactory: 'h',
  jsxFragment: 'Fragment',
});

console.log('✅ Demo built successfully!');
console.log('   demo/tinyreact.js  — framework bundle');
console.log('   demo/todolist.js   — app (compiled from JSX)');
console.log('   Open demo/todolist.html in browser');
