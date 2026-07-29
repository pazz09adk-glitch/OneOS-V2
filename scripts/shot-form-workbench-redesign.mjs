#!/usr/bin/env node
/**
 * 基于 Stripe Fintech 高端风格的 表单页 (故障处置) 与 工作台页 (不含版本日志) 浅/暗截图生成器
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const formOutDir = path.join(root, 'src/resources/design-system/fault-form-shots');
const workbenchOutDir = path.join(root, 'src/resources/design-system/workbench-shots');

async function loadPuppeteer() {
  const require = createRequire(import.meta.url);
  try {
    return require('puppeteer');
  } catch {
    return require('puppeteer-core');
  }
}

async function main() {
  fs.mkdirSync(formOutDir, { recursive: true });
  fs.mkdirSync(workbenchOutDir, { recursive: true });

  const puppeteer = await loadPuppeteer();

  const browser = await puppeteer.launch({
    headless: true,
    executablePath:
      process.env.PUPPETEER_EXECUTABLE_PATH ||
      '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    defaultViewport: { width: 1440, height: 1024, deviceScaleFactor: 2 },
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  page.setDefaultTimeout(60000);

  const baseUrl = 'http://127.0.0.1:51720';
  const modes = ['light', 'dark'];

  // 1. 生成故障处置表单页截图 (Form)
  for (const mode of modes) {
    const demoUrl = `${baseUrl}/prototypes/oneos-prototype-demo/?oneosTheme=${mode}#proto=lease-contract-redesign`;
    console.log(`正在渲染 表单页 (故障处置) (${mode})...`);

    await page.goto(demoUrl, { waitUntil: 'networkidle2' });
    await page.waitForSelector('.oneos-shell', { timeout: 30000 });
    await page.waitForSelector('.oneos-shell-frame', { timeout: 30000 });

    await page.evaluate((m) => {
      document.documentElement.dataset.dsMode = m;
      document.documentElement.dataset.oneosTheme = m;
      const shell = document.querySelector('.oneos-shell');
      if (shell) shell.dataset.oneosTheme = m;
    }, mode);

    const iframeElement = await page.$('.oneos-shell-frame');
    if (iframeElement) {
      const targetSrc = `${baseUrl}/prototypes/lease-contract-redesign/?concept=form&oneosTheme=${mode}`;
      await page.evaluate((el, src) => {
        el.src = src;
      }, iframeElement, targetSrc);
    }

    await new Promise((r) => setTimeout(r, 1200));

    const childFrame = page.frames().find(
      (f) => f !== page.mainFrame() && f.url().includes('lease-contract-redesign'),
    );

    if (childFrame) {
      await childFrame.evaluate((m) => {
        document.documentElement.dataset.dsMode = m;
        document.documentElement.dataset.oneosTheme = m;
      }, mode);
    }

    await new Promise((r) => setTimeout(r, 400));

    const fileName = `fault-form-${mode}.png`;
    const outPath = path.join(formOutDir, fileName);

    await page.screenshot({ path: outPath, type: 'png', fullPage: false });
    console.log('Successfully written Form image:', fileName);
  }

  // 2. 生成现代工作台页截图 (Workbench - 不含版本更新日志)
  for (const mode of modes) {
    const demoUrl = `${baseUrl}/prototypes/oneos-prototype-demo/?oneosTheme=${mode}#proto=lease-contract-redesign`;
    console.log(`正在渲染 工作台页 (无版本日志) (${mode})...`);

    await page.goto(demoUrl, { waitUntil: 'networkidle2' });
    await page.waitForSelector('.oneos-shell', { timeout: 30000 });
    await page.waitForSelector('.oneos-shell-frame', { timeout: 30000 });

    await page.evaluate((m) => {
      document.documentElement.dataset.dsMode = m;
      document.documentElement.dataset.oneosTheme = m;
      const shell = document.querySelector('.oneos-shell');
      if (shell) shell.dataset.oneosTheme = m;
    }, mode);

    const iframeElement = await page.$('.oneos-shell-frame');
    if (iframeElement) {
      const targetSrc = `${baseUrl}/prototypes/lease-contract-redesign/?concept=workbench&oneosTheme=${mode}`;
      await page.evaluate((el, src) => {
        el.src = src;
      }, iframeElement, targetSrc);
    }

    await new Promise((r) => setTimeout(r, 1200));

    const childFrame = page.frames().find(
      (f) => f !== page.mainFrame() && f.url().includes('lease-contract-redesign'),
    );

    if (childFrame) {
      await childFrame.evaluate((m) => {
        document.documentElement.dataset.dsMode = m;
        document.documentElement.dataset.oneosTheme = m;
      }, mode);
    }

    await new Promise((r) => setTimeout(r, 400));

    const fileName = `workbench-${mode}.png`;
    const outPath = path.join(workbenchOutDir, fileName);

    await page.screenshot({ path: outPath, type: 'png', fullPage: false });
    console.log('Successfully written Workbench image:', fileName);
  }

  await browser.close();
  console.log('表单页与工作台页截图已成功全部生成！');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
