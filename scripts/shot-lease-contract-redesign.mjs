#!/usr/bin/env node
/**
 * 租赁合同全新 UI/UX 重构设计 (5 套完全不同布局交互) 截图生成器
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const outDir = path.join(root, 'src/resources/design-system/lease-contract-redesign-shots');

async function loadPuppeteer() {
  const require = createRequire(import.meta.url);
  try {
    return require('puppeteer');
  } catch {
    return require('puppeteer-core');
  }
}

const CONCEPTS = [
  {
    id: 1,
    name: 'Linear 极速命令行与聚焦工作区',
    code: 'concept-1-linear',
    desc: '快捷键驱动 (⌘K)、右侧抽屉滑动预览、极窄高密表格与微状态指示点',
  },
  {
    id: 2,
    name: 'Stripe 金融台账与 Bento 分析枢纽',
    code: 'concept-2-stripe',
    desc: '高端 Fintech 视觉、Bento Bento Card 分析头图、Segmented Tabs 选项卡',
  },
  {
    id: 3,
    name: 'Studio 双栏联动合同工作台',
    code: 'concept-3-studio',
    desc: '35% 左侧列表 | 65% 右侧完整画卷，零上下文切换，直接在线查阅盖章与运单',
  },
  {
    id: 4,
    name: 'Stage Pipeline 阶段履约看板',
    code: 'concept-4-kanban',
    desc: '4 列生命周期 Pipeline 看板，清晰掌控草稿、审批、履约与归档卡点',
  },
  {
    id: 5,
    name: 'Executive 决策视界与优雅卡片阵列',
    code: 'concept-5-executive',
    desc: 'Apple 高管级 Glassmorphism 渐变半透明大盘、3 列卡片矩阵与氛围高亮',
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

  for (const concept of CONCEPTS) {
    for (const mode of modes) {
      const demoUrl = `${baseUrl}/prototypes/oneos-prototype-demo/?oneosTheme=${mode}#proto=lease-contract-redesign`;
      console.log(`正在渲染 Concept ${concept.id} (${mode})...`);

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

      // 找到子 iframe 并修改 src 为带有 ?concept=X 的页面
      let childFrame = null;
      for (let i = 0; i < 30; i++) {
        childFrame = page.frames().find(
          (f) => f !== page.mainFrame() && f.url().includes('lease-contract-redesign'),
        );
        if (childFrame) break;
        await new Promise((r) => setTimeout(r, 200));
      }

      // 切换 iframe 内部 URL 为特定的 concept 与 mode
      const iframeElement = await page.$('.oneos-shell-frame');
      if (iframeElement) {
        const targetSrc = `${baseUrl}/prototypes/lease-contract-redesign/?concept=${concept.id}&oneosTheme=${mode}`;
        await page.evaluate((el, src) => {
          el.src = src;
        }, iframeElement, targetSrc);
      }

      // 等待新 iframe 载入并对齐主题
      await new Promise((r) => setTimeout(r, 1200));

      childFrame = page.frames().find(
        (f) => f !== page.mainFrame() && f.url().includes('lease-contract-redesign'),
      );

      if (childFrame) {
        await childFrame.evaluate((m) => {
          document.documentElement.dataset.dsMode = m;
          document.documentElement.dataset.oneosTheme = m;
        }, mode);
      }

      await new Promise((r) => setTimeout(r, 400));

      const fileName = `${concept.code}-${mode}.png`;
      const outPath = path.join(outDir, fileName);

      await page.screenshot({ path: outPath, type: 'png', fullPage: false });
      console.log('Successfully written:', fileName);
      results.push({
        fileName,
        conceptId: concept.id,
        conceptName: concept.name,
        desc: concept.desc,
        mode: mode === 'light' ? '浅色' : '暗色',
      });
    }
  }

  const readme = `# 租赁合同管理 — 5 套全新 UI/UX 重构方案截图

生成时间：${new Date().toISOString().slice(0, 10)}  
统一标准：高大上（Premium / High-End SaaS）、全左侧菜单与顶栏外壳嵌入、100% 浅/暗双模式，支持真正差异化的 UI 布局与交互工作流。

| 文件 | 方案编号与名称 | 模式 | UI / UX 创新亮点 |
|------|----------------|------|------------------|
${results
  .map(
    (r) =>
      `| \`${r.fileName}\` | **Concept ${r.conceptId}**：${r.conceptName} | ${r.mode} | ${r.desc} |`,
  )
  .join('\n')}
`;

  fs.writeFileSync(path.join(outDir, 'README.md'), readme);
  await browser.close();
  console.log('全部 5 套全新的 UI/UX 设计稿已成功生成并保存至：', outDir);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
