#!/usr/bin/env node
/**
 * 将 web端/加氢站管理/站点信息.jsx 导出为 Axhub AI Extension 兼容的本地文件包
 * 格式参照 AI-羚牛OneOS-complete.zip
 */
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import { chromium } from 'playwright';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../../..');
const JSX_PATH = path.join(ROOT, 'web端/加氢站管理/站点信息.jsx');
const MANUAL_MD = path.join(ROOT, 'web端/加氢站管理/站点管理使用说明书.md');
const DOCS_IMG_DIR = path.join(ROOT, 'web端/加氢站管理/docs');
const OUT_DIR = path.join(ROOT, 'web端/加氢站管理/AI-加氢站站点信息-complete');
const ZIP_PATH = path.join(ROOT, 'AI-加氢站站点信息-complete.zip');
const PORT = 5199;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.jsx': 'text/plain; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.png': 'image/png',
  '.md': 'text/markdown; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.woff2': 'font/woff2',
};

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function writeJson(filePath, data) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
}

function copyFile(src, dest) {
  ensureDir(path.dirname(dest));
  fs.copyFileSync(src, dest);
}

function extractPageStyles(jsxText) {
  const parts = [];
  const fixMatch = jsxText.match(/var ONEOS_ANT_TABLE_GLOBAL_FIX = \[([\s\S]*?)\];/);
  if (fixMatch) {
    const re = /'((?:\\'|[^'])*)'/g;
    let m;
    while ((m = re.exec(fixMatch[1]))) parts.push(m[1].replace(/\\'/g, "'"));
  }
  const pageMatch = jsxText.match(/var H2_PAGE_STYLE = ONEOS_ANT_TABLE_GLOBAL_FIX\.concat\(\[([\s\S]*?)\]\);/);
  if (pageMatch) {
    const re = /'((?:\\'|[^'])*)'/g;
    let m;
    while ((m = re.exec(pageMatch[1]))) parts.push(m[1].replace(/\\'/g, "'"));
  }
  return parts.join('\n');
}

function extractColors(cssText) {
  const colorMap = new Map();
  const re = /#(?:[0-9a-fA-F]{3,8})\b|rgba?\([^)]+\)/g;
  let m;
  while ((m = re.exec(cssText))) {
    colorMap.set(m[0], (colorMap.get(m[0]) || 0) + 1);
  }
  const sorted = [...colorMap.entries()].sort((a, b) => b[1] - a[1]).slice(0, 20);
  return {
    background: sorted.filter(([c]) => /#f|#e|rgb\(2(4|5|48)/i.test(c)).map(([value, count]) => ({ value, count })),
    text: sorted.filter(([c]) => /#0f|#33|#47|#64|rgb\(15/i.test(c)).map(([value, count]) => ({ value, count })),
    accent: sorted.filter(([c]) => /#10b981|#059669|#f97316|#ea580c/i.test(c)).map(([value, count]) => ({ value, count })),
    all: sorted.map(([value, count]) => ({ value, count })),
  };
}

function startServer() {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      const urlPath = decodeURIComponent((req.url || '/').split('?')[0]);
      let rel = urlPath === '/' ? 'web端/加氢站管理/export-tools/preview-bootstrap.html' : urlPath.slice(1);
      const filePath = path.join(ROOT, rel);
      if (!filePath.startsWith(ROOT) || !fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
        res.writeHead(404);
        res.end('Not found: ' + rel);
        return;
      }
      const ext = path.extname(filePath);
      res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
      fs.createReadStream(filePath).pipe(res);
    });
    server.listen(PORT, '127.0.0.1', () => resolve(server));
  });
}

async function waitReady(page) {
  await page.waitForFunction(
    () => window.__CAPTURE_READY__ === true || window.__CAPTURE_ERROR__,
    null,
    { timeout: 180000 }
  );
  const err = await page.evaluate(() => window.__CAPTURE_ERROR__ || '');
  if (err) throw new Error('预览加载失败:\n' + err);
  await page.waitForSelector('.h2-station-page', { timeout: 30000 });
  await page.waitForTimeout(2000);
}

function buildDomExport(pageData) {
  const { nodes, styles, root } = pageData;
  return {
    nodes: Object.fromEntries(
      Object.entries(nodes).map(([id, node]) => {
        const out = { tag: node.tag, styleId: node.styleId };
        if (node.children?.length) out.children = node.children;
        if (node.text) out.text = node.text;
        if (node.className) out.originalClass = node.className;
        if (node.id) out.id = node.id;
        if (node.width) out.width = node.width;
        if (node.height) out.height = node.height;
        return [id, out];
      })
    ),
    root,
  };
}

async function capturePageData(page) {
  return page.evaluate(() => {
    const SKIP_TAGS = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'LINK', 'META', 'HEAD']);
    const styles = {};
    const nodes = {};
    let counter = 0;
    const styleKeyMap = new Map();

    function getStyleId(el) {
      const cs = window.getComputedStyle(el);
      const key = [
        el.tagName.toLowerCase(),
        el.className || '',
        cs.display,
        cs.fontSize,
        cs.fontWeight,
        cs.color,
        cs.backgroundColor,
        cs.padding,
        cs.margin,
        cs.borderRadius,
      ].join('|');
      if (!styleKeyMap.has(key)) {
        const id = 'style_' + (styleKeyMap.size + 1);
        styleKeyMap.set(key, id);
        styles[id] = {
          tw: '',
          custom: {
            display: cs.display,
            fontSize: cs.fontSize,
            fontWeight: cs.fontWeight,
            color: cs.color,
            backgroundColor: cs.backgroundColor,
            padding: cs.padding,
            margin: cs.margin,
            borderRadius: cs.borderRadius,
            fontFamily: cs.fontFamily,
            lineHeight: cs.lineHeight,
            border: cs.border,
            boxShadow: cs.boxShadow,
          },
        };
      }
      return styleKeyMap.get(key);
    }

    function cssPath(el) {
      if (!(el instanceof Element)) return '';
      const parts = [];
      let cur = el;
      while (cur && cur.nodeType === 1 && cur !== document.body) {
        let part = cur.tagName.toLowerCase();
        if (cur.id) {
          part += '#' + cur.id;
          parts.unshift(part);
          break;
        }
        if (cur.className && typeof cur.className === 'string') {
          const cls = cur.className.trim().split(/\s+/).filter(Boolean).slice(0, 2);
          if (cls.length) part += '.' + cls.join('.');
        }
        const parent = cur.parentElement;
        if (parent) {
          const siblings = [...parent.children].filter((c) => c.tagName === cur.tagName);
          if (siblings.length > 1) {
            const idx = siblings.indexOf(cur) + 1;
            part += `:nth-of-type(${idx})`;
          }
        }
        parts.unshift(part);
        cur = parent;
      }
      return parts.join(' > ');
    }

    function walk(el, depth) {
      if (!el || el.nodeType !== 1) return null;
      if (SKIP_TAGS.has(el.tagName)) return null;
      const rect = el.getBoundingClientRect();
      if (rect.width === 0 && rect.height === 0 && !el.classList.contains('h2-station-page')) {
        const text = (el.textContent || '').trim();
        if (!text && !el.children.length) return null;
      }
      counter += 1;
      const id = 'n' + counter;
      const node = {
        nodeId: id,
        tag: el.tagName.toLowerCase(),
        styleId: getStyleId(el),
        selector: cssPath(el),
        depth,
        bbox: {
          left: Math.round(rect.left),
          top: Math.round(rect.top),
          width: Math.round(rect.width),
          height: Math.round(rect.height),
        },
        width: rect.width ? rect.width.toFixed(4) + 'px' : undefined,
        height: rect.height ? rect.height.toFixed(4) + 'px' : undefined,
      };
      if (el.id) node.id = el.id;
      if (el.className && typeof el.className === 'string') node.originalClass = el.className;
      const directText = [...el.childNodes]
        .filter((n) => n.nodeType === 3)
        .map((n) => n.textContent.trim())
        .filter(Boolean)
        .join(' ');
      if (directText) node.text = directText.slice(0, 200);
      const children = [];
      for (const child of el.children) {
        const childId = walk(child, depth + 1);
        if (childId) children.push(childId);
      }
      if (children.length) {
        node.children = children;
        node.childCount = children.length;
      }
      nodes[id] = node;
      return id;
    }

    const rootEl = document.querySelector('.h2-station-page') || document.getElementById('root');
    const root = walk(rootEl, 0);
    return { nodes, styles, root, nodeCount: counter, pageText: rootEl.innerText || '' };
  });
}

function buildSkeleton(nodes, root) {
  const skeletonNodes = {};
  for (const [id, node] of Object.entries(nodes)) {
    skeletonNodes[id] = {
      tag: node.tag,
      depth: node.depth,
      ...(node.children ? { children: node.children, childCount: node.childCount } : { childCount: 0 }),
    };
  }
  return {
    capturedAt: new Date().toISOString(),
    nodeCount: Object.keys(nodes).length,
    nodes: skeletonNodes,
    root,
  };
}

function buildPageMap(nodes) {
  const links = [];
  const buttons = [];
  for (const node of Object.values(nodes)) {
    if (!node.selector) continue;
    if (node.tag === 'button' || (node.tag === 'a' && node.text)) {
      const item = {
        selector: node.selector,
        type: node.tag,
        visible: true,
      };
      if (node.text) item.text = node.text;
      if (node.tag === 'button') buttons.push(item);
      else links.push(item);
    }
  }
  return { links, buttons: buttons.slice(0, 100), interactiveCount: buttons.length + links.length };
}

function buildContentMd(pageText, manualText) {
  const lines = [
    '# 加氢站管理 · 站点信息',
    '',
    '> 由 `web端/加氢站管理/站点信息.jsx` 原型页面导出',
    '',
    '## 页面可见文案（列表态）',
    '',
    '```',
    pageText.slice(0, 12000),
    '```',
    '',
  ];
  if (manualText) {
    lines.push('## 使用说明书摘要', '', manualText.slice(0, 8000));
  }
  return lines.join('\n');
}

function buildReadme() {
  return `# 加氢站站点信息 - 网页数据导出包

本压缩包由 ONE-OS 仓库中的 \`站点信息.jsx\` 原型页面生成，格式兼容 Axhub AI Extension 导出规范，供 AI 辅助页面还原与设计分析。

## 文件结构

\`\`\`
├── README.md
├── manifest.json
├── screenshot.png
├── content.md
├── index.html              # 静态快照（可直接浏览器打开预览布局）
├── preview.html            # 交互式 React 预览（需本地 HTTP 服务）
├── style.css               # 从 JSX 内联样式提取的页面 CSS
├── source/
│   └── 站点信息.jsx         # 原始 React 原型源码
├── structure/
│   ├── doms.json
│   └── styles.json
├── flat/
│   ├── skeleton.json
│   └── nodes/
├── topology/
│   ├── topology.json
│   ├── selector-map.json
│   └── content-blocks.json
├── page-map.json
├── theme.json
├── prompts/
│   ├── rebuild-page.md
│   └── rebuild-section.md
└── assets/
    └── images/
\`\`\`

## 使用建议

1. **视觉参考**：优先查看 \`screenshot.png\`
2. **源码还原**：阅读 \`source/站点信息.jsx\` 获取完整交互与业务逻辑
3. **结构还原**：使用 \`structure/doms.json\` + \`structure/styles.json\`
4. **渐进式读取**：从 \`flat/skeleton.json\` 入手，再按需读取 \`flat/nodes/n*.json\`

## 本地预览

\`\`\`bash
# 在项目根目录启动静态服务后访问 preview.html
npx --yes serve web端/加氢站管理/AI-加氢站站点信息-complete -p 5200
# 打开 http://127.0.0.1:5200/preview.html
\`\`\`

**生成时间：** ${new Date().toISOString()}
**版本：** 3.0（ONE-OS JSX 导出）
`;
}

async function main() {
  if (!fs.existsSync(JSX_PATH)) throw new Error('找不到站点信息.jsx: ' + JSX_PATH);

  console.log('清理输出目录...');
  if (fs.existsSync(OUT_DIR)) fs.rmSync(OUT_DIR, { recursive: true, force: true });
  ensureDir(OUT_DIR);

  const jsxText = fs.readFileSync(JSX_PATH, 'utf8');
  const styleCss = extractPageStyles(jsxText);
  const manualText = fs.existsSync(MANUAL_MD) ? fs.readFileSync(MANUAL_MD, 'utf8') : '';

  copyFile(JSX_PATH, path.join(OUT_DIR, 'source/站点信息.jsx'));
  copyFile(JSX_PATH, path.join(__dirname, 'source/站点信息.jsx'));
  fs.writeFileSync(path.join(OUT_DIR, 'style.css'), styleCss, 'utf8');
  fs.writeFileSync(path.join(OUT_DIR, 'README.md'), buildReadme(), 'utf8');

  // 复制说明书配图
  if (fs.existsSync(DOCS_IMG_DIR)) {
    for (const file of fs.readdirSync(DOCS_IMG_DIR)) {
      if (/\.(png|jpg|jpeg|webp)$/i.test(file)) {
        copyFile(path.join(DOCS_IMG_DIR, file), path.join(OUT_DIR, 'assets/images', file));
      }
    }
  }

  console.log('启动预览服务...');
  const server = await startServer();
  const browser = await chromium.launch({ headless: true });
  const base = `http://127.0.0.1:${PORT}/web端/加氢站管理/export-tools/preview-bootstrap.html`;

  try {
    const viewports = [
      { name: 'desktop-1440', width: 1440, height: 900 },
      { name: 'tablet-768', width: 768, height: 1024 },
      { name: 'mobile-390', width: 390, height: 844 },
    ];

    let mainPageData = null;
    let capturedHtml = '';
    let pageHeight = 900;
    let pageWidth = 1440;

    for (const vp of viewports) {
      console.log('截图:', vp.name);
      const context = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
        deviceScaleFactor: 1,
      });
      const page = await context.newPage();
      await page.goto(base, { waitUntil: 'networkidle', timeout: 180000 });
      await waitReady(page);

      ensureDir(path.join(OUT_DIR, 'screenshots'));
      const shotPath = vp.name === 'desktop-1440'
        ? path.join(OUT_DIR, 'screenshot.png')
        : path.join(OUT_DIR, 'screenshots', vp.name + '.png');
      await page.screenshot({ path: shotPath, fullPage: true });

      if (vp.name === 'desktop-1440') {
        mainPageData = await capturePageData(page);
        capturedHtml = await page.evaluate(() => {
          const el = document.querySelector('.h2-station-page') || document.getElementById('root');
          return el ? el.outerHTML : '';
        });
        const dims = await page.evaluate(() => {
          const el = document.querySelector('.h2-station-page') || document.body;
          return { width: el.scrollWidth, height: el.scrollHeight };
        });
        pageWidth = dims.width;
        pageHeight = dims.height;
      }
      await context.close();
    }

    if (!mainPageData) throw new Error('未能采集页面数据');

    // index.html 静态快照
    const indexHtml = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>加氢站管理 · 站点信息</title>
  <link rel="stylesheet" href="https://unpkg.com/antd@5/dist/reset.css">
  <link rel="stylesheet" href="style.css">
  <style>
    * { box-sizing: border-box; }
    body { margin: 0; padding: 0; background: #e5e7eb; }
  </style>
</head>
<body>
${capturedHtml}
</body>
</html>`;
    fs.writeFileSync(path.join(OUT_DIR, 'index.html'), indexHtml, 'utf8');

    // preview.html 交互预览
    copyFile(
      path.join(__dirname, 'preview-bootstrap.html'),
      path.join(OUT_DIR, 'preview.html')
    );

    const doms = buildDomExport(mainPageData);
    ensureDir(path.join(OUT_DIR, 'structure'));
    writeJson(path.join(OUT_DIR, 'structure/doms.json'), doms);
    writeJson(path.join(OUT_DIR, 'structure/styles.json'), { styles: mainPageData.styles });

    const skeleton = buildSkeleton(mainPageData.nodes, mainPageData.root);
    writeJson(path.join(OUT_DIR, 'flat/skeleton.json'), skeleton);

    ensureDir(path.join(OUT_DIR, 'flat/nodes'));
    for (const [id, node] of Object.entries(mainPageData.nodes)) {
      writeJson(path.join(OUT_DIR, 'flat/nodes', id + '.json'), node);
    }

    const pageMap = buildPageMap(mainPageData.nodes);
    writeJson(path.join(OUT_DIR, 'page-map.json'), pageMap);

    const theme = {
      source: 'web端/加氢站管理/站点信息.jsx',
      colors: extractColors(styleCss),
      typography: {
        families: ['-apple-system', 'system-ui', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
        textStyles: [
          { size: '24px', weight: '800', usage: 'KPI 数值' },
          { size: '15px', weight: '700', usage: '卡片标题' },
          { size: '13px', weight: '500', usage: '表格/表单正文' },
          { size: '12px', weight: '500', usage: '辅助说明' },
        ],
      },
      spacing: ['8px', '12px', '16px', '20px', '24px'],
      radius: ['8px', '10px', '12px', '16px'],
      shadow: {
        card: ['0 4px 20px -4px rgba(15, 23, 42, 0.03)', '0 1px 3px rgba(15, 23, 42, 0.04)'],
      },
      brand: {
        primary: '#10b981',
        warning: '#f59e0b',
        danger: '#ef4444',
        surface: '#f8fafc',
        border: '#e2e8f0',
      },
    };
    writeJson(path.join(OUT_DIR, 'theme.json'), theme);

    const contentMd = buildContentMd(mainPageData.pageText, manualText);
    fs.writeFileSync(path.join(OUT_DIR, 'content.md'), contentMd, 'utf8');

    const selectorMap = Object.fromEntries(
      Object.entries(mainPageData.nodes)
        .filter(([, n]) => n.selector)
        .map(([id, n]) => [id, { selector: n.selector, tag: n.tag, text: n.text || '' }])
    );
    ensureDir(path.join(OUT_DIR, 'topology'));
    writeJson(path.join(OUT_DIR, 'topology/selector-map.json'), selectorMap);
    writeJson(path.join(OUT_DIR, 'topology/topology.json'), {
      pageWidth,
      pageHeight,
      scrollContainer: '.h2-station-page .lc-table-card',
      fixedLayers: [],
      sections: [
        { id: 'section-filter', name: '筛选区', order: 0 },
        { id: 'section-kpi', name: 'KPI 分类卡', order: 1 },
        { id: 'section-table', name: '站点列表', order: 2 },
      ],
    });
    writeJson(path.join(OUT_DIR, 'topology/content-blocks.json'), {
      blocks: [
        { id: 'breadcrumb', type: 'navigation', text: '加氢站管理 / 站点信息' },
        { id: 'filter-card', type: 'form', text: '筛选条件' },
        { id: 'kpi-row', type: 'stats', text: '全部加氢站 / 预付余额预警 / 已欠费 / 无加氢 / 签约站点 / 普通站点' },
        { id: 'data-table', type: 'table', text: '站点列表' },
      ],
    });

    ensureDir(path.join(OUT_DIR, 'prompts'));
    fs.writeFileSync(
      path.join(OUT_DIR, 'prompts/rebuild-page.md'),
      `# Rebuild Page Prompt

Rebuild the page "加氢站管理 · 站点信息" as a production-ready webpage.

Use the export pack in this order:
1. Read \`manifest.json\` to understand available files.
2. Use \`screenshot.png\` as the visual source of truth.
3. Read \`source/站点信息.jsx\` for complete React logic, mock data, and modals.
4. Use \`structure/doms.json\` and \`structure/styles.json\` for layout restoration.
5. Use \`theme.json\` for design tokens.
6. Use \`content.md\` for copy and section semantics.

Implementation requirements:
- Preserve list filters, KPI cards, data table, and toolbar actions.
- Support sub-views: create/edit station, price config, statement flow (see JSX source).
- Match Ant Design 5 visual style with green (#10b981) accent.
`,
      'utf8'
    );
    fs.writeFileSync(
      path.join(OUT_DIR, 'prompts/rebuild-section.md'),
      `# Rebuild Section Prompt

Rebuild a single section of "加氢站管理 · 站点信息".

1. Locate the section in \`flat/skeleton.json\`.
2. Load related node files from \`flat/nodes/\`.
3. Cross-check with \`screenshot.png\` and \`source/站点信息.jsx\`.
`,
      'utf8'
    );

    const imageFiles = fs.existsSync(path.join(OUT_DIR, 'assets/images'))
      ? fs.readdirSync(path.join(OUT_DIR, 'assets/images'))
      : [];

    const manifest = {
      version: '3.0',
      generator: 'one-os-jsx-exporter',
      exportTime: new Date().toISOString(),
      sourceUrl: null,
      sourceFile: 'web端/加氢站管理/站点信息.jsx',
      viewport: { width: pageWidth, height: pageHeight },
      mode: 'full',
      files: {
        domlist: 'structure/doms.json',
        stylePool: 'structure/styles.json',
        theme: 'theme.json',
        screenshot: 'screenshot.png',
        content: 'content.md',
        pageMap: 'page-map.json',
        topology: 'topology/topology.json',
        selectorMap: 'topology/selector-map.json',
        contentBlocks: 'topology/content-blocks.json',
        sourceCode: 'source/站点信息.jsx',
        html: 'index.html',
        css: 'style.css',
        preview: 'preview.html',
      },
      flatStructure: {
        skeleton: 'flat/skeleton.json',
        nodesDir: 'flat/nodes/',
      },
      screenshots: {
        current: 'screenshot.png',
        responsive: imageFiles.length
          ? ['screenshots/desktop-1440.png', 'screenshots/tablet-768.png', 'screenshots/mobile-390.png']
          : [],
      },
      assets: {
        imageCount: imageFiles.length,
        fontCount: 0,
        imageFiles: imageFiles.map((f) => 'assets/images/' + f),
        fontFiles: [],
      },
      stats: {
        nodeCount: mainPageData.nodeCount,
        styleCount: Object.keys(mainPageData.styles).length,
        markdownLength: contentMd.length,
        sectionCount: 3,
        jsxLines: jsxText.split('\n').length,
      },
      capabilities: {
        hasFonts: false,
        hasScreenshot: true,
        hasResponsiveScreenshots: true,
        hasTheme: true,
        hasMarkdown: true,
        hasPreviewHTML: true,
        hasSourceJSX: true,
        hasTopology: true,
        hasSelectorMap: true,
        hasContentBlocks: true,
        hasRebuildPrompts: true,
        hasFlatStructure: true,
        jsonFormat: true,
      },
    };
    writeJson(path.join(OUT_DIR, 'manifest.json'), manifest);

    console.log('打包 zip...');
    if (fs.existsSync(ZIP_PATH)) fs.unlinkSync(ZIP_PATH);
    execSync(
      `cd "${path.dirname(OUT_DIR)}" && zip -rq "${ZIP_PATH}" "${path.basename(OUT_DIR)}"`,
      { stdio: 'inherit' }
    );

    console.log('\n导出完成:');
    console.log('  目录:', OUT_DIR);
    console.log('  压缩包:', ZIP_PATH);
    console.log('  节点数:', mainPageData.nodeCount);
    console.log('  样式数:', Object.keys(mainPageData.styles).length);
  } finally {
    await browser.close();
    server.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
