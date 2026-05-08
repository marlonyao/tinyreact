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

// Step 2: 编译 TodoList JSX → JS
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

// Step 3: 编译 Router Demo JSX → JS
await esbuild.build({
  entryPoints: ['demo/router.jsx'],
  outfile: 'demo/router-app.js',
  format: 'esm',
  jsx: 'transform',
  jsxFactory: 'h',
  jsxFragment: 'Fragment',
});

// 替换 import 语句为全局变量
import { readFileSync, writeFileSync } from 'fs';
let routerJs = readFileSync('demo/router-app.js', 'utf-8');
routerJs = `var h = TinyReact.createElement;\nvar HashRouter = TinyReact.HashRouter;\nvar Route = TinyReact.Route;\nvar Link = TinyReact.Link;\nvar useRouter = TinyReact.useRouter;\nvar useState = TinyReact.useState;\n` + routerJs;
writeFileSync('demo/router-app.js', routerJs);

console.log('✅ Demo built successfully!');
console.log('   demo/todolist.html  — TodoList demo');
console.log('   demo/router.html    — Router demo');
