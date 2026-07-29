#!/usr/bin/env node
/**
 * 租赁合同表单页 + 工作台 · 5 主题 × 浅/暗 截图
 *
 * Usage:
 *   node scripts/shot-form-workbench-themes.mjs
 *   node scripts/shot-form-workbench-themes.mjs --base=http://127.0.0.1:51720
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { THEME_SHOTS, buildSkinCss } from './lease-contract-theme-skins.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const outRoot = path.join(root, 'src/resources/design-system/lease-contract-theme-shots');

const PAGES = [
  {
    key: 'form',
    title: '租赁合同 · 新增表单',
    path: '/prototypes/lease-contract-management/',
    ready: '.vm-page.lc-page',
    shot: '.vm-page.lc-create-page, .vm-page.lc-page',
    async prepare(page) {
      // 已在表单页则跳过
      const onCreate = await page.$('.lc-create-page');
      if (onCreate) return;
      // 点工具栏「新增」
      const clicked = await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button, a, .vm-btn'));
        const btn = buttons.find((el) => (el.textContent || '').trim() === '新增');
        if (btn) {
          btn.click();
          return true;
        }
        return false;
      });
      if (!clicked) throw new Error('未找到「新增」按钮');
      await page.waitForSelector('.lc-create-page', { timeout: 30000 });
      await new Promise((r) => setTimeout(r, 500));
    },
  },
  {
    key: 'workbench',
    title: '工作台',
    path: '/prototypes/oneos-web-workbench-new/',
    ready: '.vm-page.wb-page',
    shot: '.vm-page.wb-page',
    /** 比稿截图不需要版本更新弹层遮挡首屏 */
    async beforeGoto(page) {
      await page.evaluateOnNewDocument(() => {
        const KEY = 'oneos-wb-release-seen-v1';
        const VERSION = '1.1.5';
        const operators = [
          '王冕', '周凯', '王磊', '刘洋', '黄倩', '孙敏', '陈静', '赵律师', '张明',
        ];
        const map = {};
        try {
          const raw = window.localStorage.getItem(KEY);
          if (raw) Object.assign(map, JSON.parse(raw) || {});
        } catch { /* ignore */ }
        for (const name of operators) map[name] = VERSION;
        window.localStorage.setItem(KEY, JSON.stringify(map));
      });
    },
    async prepare(page) {
      // 若仍弹出（缓存/旧会话），点「知道了」或强制隐藏
      await page.evaluate(async () => {
        const confirm = document.querySelector('.wb-release-confirm');
        if (confirm instanceof HTMLElement) confirm.click();
        await new Promise((r) => setTimeout(r, 200));
        let style = document.getElementById('ds-theme-shot-hide-release');
        if (!style) {
          style = document.createElement('style');
          style.id = 'ds-theme-shot-hide-release';
          document.head.appendChild(style);
        }
        style.textContent = `
          [data-annotation-id="wb-release-notes"],
          .wb-overlay--release,
          .wb-modal--release {
            display: none !important;
            visibility: hidden !important;
            pointer-events: none !important;
          }
        `;
      });
      await new Promise((r) => setTimeout(r, 150));
    },
  },
];

function parseArgs(argv) {
  const args = { base: 'http://127.0.0.1:51720' };
  for (const a of argv) {
    if (a.startsWith('--base=')) args.base = a.slice('--base='.length);
  }
  return args;
}

async function loadPuppeteer() {
  const require = createRequire(import.meta.url);
  try {
    return require('puppeteer');
  } catch {
    return require('puppeteer-core');
  }
}

async function applySkin(page, theme, mode) {
  const css = buildSkinCss(theme, mode);
  await page.evaluate((cssText, modeName) => {
    document.documentElement.dataset.dsMode = modeName;
    let el = document.getElementById('ds-theme-shot-skin');
    if (!el) {
      el = document.createElement('style');
      el.id = 'ds-theme-shot-skin';
      document.head.appendChild(el);
    }
    el.textContent = cssText;
  }, css, mode);
  await new Promise((r) => setTimeout(r, 250));
}

async function hideAnnotation(page) {
  await page.evaluate(() => {
    let el = document.getElementById('ds-theme-shot-hide-ann');
    if (!el) {
      el = document.createElement('style');
      el.id = 'ds-theme-shot-hide-ann';
      document.head.appendChild(el);
    }
    el.textContent = `
      .axhub-annotation-host, [data-axhub-annotation],
      [class*="Annotation"], [class*="annotation-toolbar"] {
        display: none !important; visibility: hidden !important;
      }
    `;
  });
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const base = args.base.replace(/\/$/, '');
  const puppeteer = await loadPuppeteer();
  const browser = await puppeteer.launch({
    headless: true,
    executablePath:
      process.env.PUPPETEER_EXECUTABLE_PATH
      || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    defaultViewport: { width: 1440, height: 1100, deviceScaleFactor: 2 },
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const allResults = [];

  for (const pageCfg of PAGES) {
    const outDir = path.join(outRoot, pageCfg.key);
    fs.mkdirSync(outDir, { recursive: true });
    const page = await browser.newPage();
    page.setDefaultTimeout(60000);
    const url = `${base}${pageCfg.path}`;
    console.log(`\n== ${pageCfg.title} ==\n打开 ${url}`);
    if (typeof pageCfg.beforeGoto === 'function') {
      await pageCfg.beforeGoto(page);
    }
    await page.goto(url, { waitUntil: 'networkidle2' });
    await page.waitForSelector(pageCfg.ready, { timeout: 60000 });
    await pageCfg.prepare(page);
    await hideAnnotation(page);

    for (const theme of THEME_SHOTS) {
      for (const mode of ['light', 'dark']) {
        await applySkin(page, theme, mode);
        const file = `${theme.id}-${mode}.png`;
        const outPath = path.join(outDir, file);
        const handle = await page.$(pageCfg.shot);
        if (handle) {
          await handle.screenshot({ path: outPath, type: 'png' });
        } else {
          await page.screenshot({ path: outPath, type: 'png' });
        }
        console.log('wrote', pageCfg.key + '/' + file);
        allResults.push({
          page: pageCfg.key,
          pageTitle: pageCfg.title,
          file: `${pageCfg.key}/${file}`,
          theme: theme.name,
          mode,
          category: theme.category,
        });
      }
    }
    await page.close();

    const readme = `# ${pageCfg.title} · 主题比稿截图

生成时间：${new Date().toISOString().slice(0, 10)}

| 文件 | 主题 | 模式 |
|------|------|------|
${allResults
  .filter((r) => r.page === pageCfg.key)
  .map((r) => `| \`${path.basename(r.file)}\` | ${r.theme} | ${r.mode === 'light' ? '浅色' : '暗色'} |`)
  .join('\n')}
`;
    fs.writeFileSync(path.join(outDir, 'README.md'), readme);
  }

  // 更新总 README
  const indexMd = `# 主题比稿截图总览

生成时间：${new Date().toISOString().slice(0, 10)}

## 页面

| 目录 | 页面 |
|------|------|
| \`.\`（根目录 png） | 租赁合同 · 列表 |
| [\`form/\`](./form/) | 租赁合同 · 新增表单 |
| [\`workbench/\`](./workbench/) | 工作台 |

## 五套主题

| 编号 | 主题 | 气质 |
|------|------|------|
| A | Linear | 冷 · 紫靛 · 精致中后台 |
| B | Stripe | 冷 · 品牌紫 · 金融精致 |
| C | Airbnb | 暖 · 珊瑚红 · 出行品牌 |
| D | Claude | 暖 · 陶土米 · 人文克制 |
| E | Intercom | 暖 · 米白黑 · 温和 B2B |

每页均为 5 主题 × 浅/暗 = 10 张。皮肤为 token 叠加预览，定稿后再完整落地。
`;
  fs.writeFileSync(path.join(outRoot, 'README.md'), indexMd);

  await browser.close();
  console.log('\n完成 →', outRoot);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
