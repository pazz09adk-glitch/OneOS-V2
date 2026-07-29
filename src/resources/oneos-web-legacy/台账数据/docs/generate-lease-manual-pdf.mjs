#!/usr/bin/env node
/**
 * 将 租赁业务台账操作说明.html 导出为 PDF
 * 用法: node generate-lease-manual-pdf.mjs [输出路径]
 * 优先使用本机 Chrome Headless；无 Chrome 时可改用 npx playwright
 */
import { execFileSync } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const htmlPath = path.join(__dirname, '租赁业务台账操作说明.html');
const desktopOut = '/Users/sylvawong/Desktop/ONE-OS-租赁业务台账操作说明.pdf';
const outPath = process.argv[2] || desktopOut;
const docsCopy = path.join(__dirname, 'ONE-OS-租赁业务台账操作说明.pdf');

if (!fs.existsSync(htmlPath)) {
  console.error('找不到 HTML:', htmlPath);
  process.exit(1);
}

const chromePaths = [
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Chromium.app/Contents/MacOS/Chromium'
];
const chrome = chromePaths.find((p) => fs.existsSync(p));

if (chrome) {
  execFileSync(chrome, [
    '--headless', '--disable-gpu', '--no-pdf-header-footer',
    '--print-to-pdf=' + outPath,
    'file://' + htmlPath
  ], { stdio: 'inherit' });
} else {
  console.error('未找到 Chrome，请安装 Google Chrome 或手动打开 HTML 打印为 PDF');
  process.exit(1);
}

if (outPath !== docsCopy) fs.copyFileSync(outPath, docsCopy);
console.log('PDF 已生成:', outPath);
console.log('副本:', docsCopy);
