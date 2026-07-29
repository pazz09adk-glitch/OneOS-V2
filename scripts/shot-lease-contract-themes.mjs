#!/usr/bin/env node
/**
 * 租赁合同列表（含 OneOS 侧栏 + 顶栏）· 5 主题 × 浅/暗 截图
 *
 * Usage:
 *   node scripts/shot-lease-contract-themes.mjs
 *   node scripts/shot-lease-contract-themes.mjs --base=http://127.0.0.1:51720
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { THEME_SHOTS, buildSkinCss } from './lease-contract-theme-skins.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const outDir = path.join(root, 'src/resources/design-system/lease-contract-theme-shots');

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

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const demoUrl = `${args.base.replace(/\/$/, '')}/prototypes/oneos-prototype-demo/#proto=lease-contract-management`;
  fs.mkdirSync(outDir, { recursive: true });

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

  console.log('打开演示主页', demoUrl);
  await page.goto(demoUrl, { waitUntil: 'networkidle2' });

  // 1. 等待主 Shell 框架
  await page.waitForSelector('.oneos-shell', { timeout: 60000 });
  await page.waitForSelector('.oneos-shell-frame', { timeout: 60000 });

  // 2. 准确定位真正的子 iframe（排除主页面 mainFrame）
  let childFrame = null;
  for (let i = 0; i < 30; i++) {
    childFrame = page.frames().find(
      (f) => f !== page.mainFrame() && f.url().includes('lease-contract-management'),
    );
    if (childFrame) {
      const ready = await childFrame.evaluate(() => !!document.querySelector('.vm-filter-card'));
      if (ready) {
        console.log(`子 iframe 页面已真正渲染就绪 (耗时 ${i * 200}ms)`);
        break;
      }
    }
    await new Promise((r) => setTimeout(r, 200));
  }

  if (!childFrame) {
    throw new Error('未在演示壳中找到已渲染的子 iframe');
  }

  const modes = ['light', 'dark'];
  const results = [];

  for (const theme of THEME_SHOTS) {
    for (const mode of modes) {
      const css = buildSkinCss(theme, mode);

      // A) 给主外壳 (Main Page) 应用主题 css 与浅/深属性
      await page.evaluate(
        (cssText, modeName) => {
          document.documentElement.dataset.dsMode = modeName;
          document.documentElement.dataset.oneosTheme = modeName;
          const shell = document.querySelector('.oneos-shell');
          if (shell) shell.dataset.oneosTheme = modeName;

          let el = document.getElementById('ds-theme-shot-skin');
          if (!el) {
            el = document.createElement('style');
            el.id = 'ds-theme-shot-skin';
            document.head.appendChild(el);
          }
          el.textContent = cssText;

          // 彻底隐去 ThemeLab 弹框和标注图层
          let hideEl = document.getElementById('ds-theme-shot-hide');
          if (!hideEl) {
            hideEl = document.createElement('style');
            hideEl.id = 'ds-theme-shot-hide';
            document.head.appendChild(hideEl);
          }
          hideEl.textContent = `
            .ds-theme-lab, .ds-theme-lab--collapsed, [data-annotation-id="lc-theme-lab"],
            .axhub-annotation-host, [data-axhub-annotation], .PrototypeAnnotationHost,
            iframe[src*="annotation"] {
              display: none !important; visibility: hidden !important; pointer-events: none !important;
            }
          `;
        },
        css,
        mode,
      );

      // B) 给真正的子 iframe (Child Frame) 应用主题 css 与浅/深属性
      await childFrame.evaluate(
        (cssText, modeName) => {
          document.documentElement.dataset.dsMode = modeName;
          document.documentElement.dataset.oneosTheme = modeName;

          let el = document.getElementById('ds-theme-shot-skin');
          if (!el) {
            el = document.createElement('style');
            el.id = 'ds-theme-shot-skin';
            document.head.appendChild(el);
          }
          el.textContent = cssText;

          // 彻底隐去 ThemeLab 弹框和标注图层
          let hideEl = document.getElementById('ds-theme-shot-hide');
          if (!hideEl) {
            hideEl = document.createElement('style');
            hideEl.id = 'ds-theme-shot-hide';
            document.head.appendChild(hideEl);
          }
          hideEl.textContent = `
            .ds-theme-lab, .ds-theme-lab--collapsed, [data-annotation-id="lc-theme-lab"],
            .axhub-annotation-host, [data-axhub-annotation], .PrototypeAnnotationHost,
            iframe[src*="annotation"] {
              display: none !important; visibility: hidden !important; pointer-events: none !important;
            }
          `;

          // 展开“更多筛选”呈现完整条件
          const expand = document.querySelector(
            'button.ldb-filter-toggle, button.vm-btn-link.ldb-filter-toggle',
          );
          if (expand && expand.textContent.includes('更多')) {
            expand.click();
          }
        },
        css,
        mode,
      );

      await new Promise((r) => setTimeout(r, 400));

      const file = `${theme.id}-${mode}.png`;
      const outPath = path.join(outDir, file);

      // 截取完整演示外壳页面
      await page.screenshot({ path: outPath, type: 'png', fullPage: false });
      console.log('wrote', file);
      results.push({ file, theme: theme.name, mode, category: theme.category });
    }
  }

  const readme = `# 租赁合同（含 OneOS 侧栏 + 顶栏）· 5 主题比稿截图

生成时间：${new Date().toISOString().slice(0, 10)}  
底稿：演示外壳 \`/prototypes/oneos-prototype-demo/#proto=lease-contract-management\`（包含完整左侧菜单与顶部栏，外壳与内容主题/浅暗 100% 深度绑定）

| 文件 | 主题 | 分类 | 模式 |
|------|------|------|------|
${results.map((r) => `| \`${r.file}\` | ${r.theme} | ${r.category} | ${r.mode === 'light' ? '浅色' : '暗色'} |`).join('\n')}

## 五套主题风格

| 编号 | 主题 | 调性与气质 |
|------|------|------|
| A | Linear | 冷 · 紫靛 · 精致中后台 |
| B | Stripe | 冷 · 品牌紫 · 金融精致 |
| C | Airbnb | 暖 · 珊瑚红 · 出行品牌 |
| D | Claude | 暖 · 陶土米 · 人文克制 |
| E | Intercom | 暖 · 米白黑 · 温和 B2B（浅色主按钮用品牌橙） |

> 说明：外壳（侧边栏与顶栏）与内容区（租赁合同）在颜色调性与浅/暗模式下 100% 绑定一致，主题实验室悬浮弹框已移除。
`;
  fs.writeFileSync(path.join(outDir, 'README.md'), readme);
  await browser.close();
  console.log('完成 →', outDir);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
