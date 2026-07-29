#!/usr/bin/env node
/**
 * 融合方案（Stripe Fintech Bento + 看板 + 左侧任务/右侧表单主从）三视图截图生成脚本
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const outDir = path.join(root, 'src/resources/design-system/lease-contract-combo-shots');

async function loadPuppeteer() {
  const require = createRequire(import.meta.url);
  try {
    return require('puppeteer');
  } catch {
    return require('puppeteer-core');
  }
}

const COMBOS = [
  {
    view: 'list',
    viewLabel: '列表模式 (List View)',
    desc: 'Stripe Fintech 高端台账列表：显示项目、客户/签约主体、履约与审批状态、交付车辆与金额',
  },
  {
    view: 'kanban',
    viewLabel: '看板模式 (Kanban View)',
    desc: 'Pipeline 阶段履约看板：草稿箱、待我审批/盖章中、履约执行中、已终止/归档 4 大生命周期列',
  },
  {
    view: 'split',
    viewLabel: '主从/表单模式 (Master-Detail View)',
    desc: '左侧任务菜单 + 右侧表单内容区：包含合同概览、关联车辆与运单、电子盖章存证与合规审批',
  },
];

async function main() {
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

  const baseUrl = 'http://127.0.0.1:51720';
  const modes = ['light', 'dark'];
  const results = [];

  for (const combo of COMBOS) {
    for (const mode of modes) {
      const demoUrl = `${baseUrl}/prototypes/oneos-prototype-demo/?oneosTheme=${mode}#proto=lease-contract-redesign`;
      console.log(`正在渲染 Combo [${combo.view}] (${mode})...`);

      await page.goto(demoUrl, { waitUntil: 'networkidle2' });
      await page.waitForSelector('.oneos-shell', { timeout: 30000 });
      await page.waitForSelector('.oneos-shell-frame', { timeout: 30000 });

      // 给外壳设置主题属性
      await page.evaluate((m) => {
        document.documentElement.dataset.dsMode = m;
        document.documentElement.dataset.oneosTheme = m;
        const shell = document.querySelector('.oneos-shell');
        if (shell) shell.dataset.oneosTheme = m;
      }, mode);

      // 找到子 iframe 并修改 src 为带 ?concept=combo&view=list/kanban/split 的页面
      const iframeElement = await page.$('.oneos-shell-frame');
      if (iframeElement) {
        const targetSrc = `${baseUrl}/prototypes/lease-contract-redesign/?concept=combo&view=${combo.view}&oneosTheme=${mode}`;
        await page.evaluate((el, src) => {
          el.src = src;
        }, iframeElement, targetSrc);
      }

      // 等待新 iframe 载入并对齐主题
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

      const fileName = `combo-${combo.view}-${mode}.png`;
      const outPath = path.join(outDir, fileName);

      await page.screenshot({ path: outPath, type: 'png', fullPage: false });
      console.log('Successfully written:', fileName);
      results.push({
        fileName,
        viewLabel: combo.viewLabel,
        desc: combo.desc,
        mode: mode === 'light' ? '浅色' : '暗色',
      });
    }
  }

  const readme = `# 租赁合同管理 — Stripe Bento 统一三视图 (列表 / 看板 / 左任务右表单) 截图

生成时间：${new Date().toISOString().slice(0, 10)}  
底稿风格：以概念 2 (Stripe Fintech UI) 为基础视觉基调，三视图规范统一下的无缝切换体验。

| 文件 | 视图模式 | 模式 | 页面特性说明 |
|------|----------|------|--------------|
${results
  .map(
    (r) =>
      `| \`${r.fileName}\` | **${r.viewLabel}** | ${r.mode} | ${r.desc} |`,
  )
  .join('\n')}
`;

  fs.writeFileSync(path.join(outDir, 'README.md'), readme);
  await browser.close();
  console.log('三视图融合方案截图全部成功生成并保存至：', outDir);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
