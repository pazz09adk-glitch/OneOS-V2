#!/usr/bin/env node
/**
 * 将 web端/业务管理/保险采购.jsx 导出为 Axhub AI Extension 兼容的本地文件包
 */
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import { chromium } from 'playwright';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../../..');
const JSX_PATH = path.join(ROOT, 'web端/业务管理/保险采购.jsx');
const OUT_DIR = path.join(ROOT, 'web端/业务管理/AI-保险采购-complete');
const ZIP_PATH = path.join(ROOT, 'AI-保险采购-complete.zip');
const PAGE_SELECTOR = '.lc-edit-page';
const PAGE_TITLE = '业务管理 · 保险采购';
const SOURCE_FILE = 'web端/业务管理/保险采购.jsx';
const SOURCE_NAME = '保险采购.jsx';
const PORT = 5201;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.jsx': 'text/plain; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.png': 'image/png',
  '.md': 'text/markdown; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
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
  const tpl = jsxText.match(/const PAGE_STYLE = `([\s\S]*?)`;/);
  if (tpl) return tpl[1];
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
    accent: sorted.filter(([c]) => /#10b981|#2563eb|#3b82f6|#f59e0b/i.test(c)).map(([value, count]) => ({ value, count })),
    all: sorted.map(([value, count]) => ({ value, count })),
  };
}

function startServer() {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      const urlPath = decodeURIComponent((req.url || '/').split('?')[0]);
      const rel = urlPath === '/' ? 'web端/业务管理/export-tools/preview-bootstrap.html' : urlPath.slice(1);
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

async function waitReady(page, selector) {
  await page.waitForFunction(
    () => window.__CAPTURE_READY__ === true || window.__CAPTURE_ERROR__,
    null,
    { timeout: 180000 }
  );
  const err = await page.evaluate(() => window.__CAPTURE_ERROR__ || '');
  if (err) throw new Error('预览加载失败:\n' + err);
  await page.waitForSelector(selector, { timeout: 30000 });
  await page.waitForTimeout(2500);
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

async function capturePageData(page, selector) {
  return page.evaluate((pageSelector) => {
    const SKIP_TAGS = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'LINK', 'META', 'HEAD']);
    const styles = {};
    const nodes = {};
    let counter = 0;
    const styleKeyMap = new Map();
    const rootClass = pageSelector.replace(/^\./, '');

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
      if (rect.width === 0 && rect.height === 0 && !el.classList.contains(rootClass)) {
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

    const rootEl = document.querySelector(pageSelector) || document.getElementById('root');
    const root = walk(rootEl, 0);
    return { nodes, styles, root, nodeCount: counter, pageText: rootEl.innerText || '' };
  }, selector);
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
      const item = { selector: node.selector, type: node.tag, visible: true };
      if (node.text) item.text = node.text;
      if (node.tag === 'button') buttons.push(item);
      else links.push(item);
    }
  }
  return { links, buttons: buttons.slice(0, 100), interactiveCount: buttons.length + links.length };
}

function buildContentMd(pageText) {
  return [
    `# ${PAGE_TITLE}`,
    '',
    `> 由 \`${SOURCE_FILE}\` 原型页面导出`,
    '',
    '## 页面可见文案（列表态）',
    '',
    '```',
    pageText.slice(0, 12000),
    '```',
    '',
    '## 模块说明',
    '',
    '- 比价单：选车报价 → 保存 → 临期/超期提醒 → 勾选提交采购审批',
    '- 保单管理：一车一档台账，OCR/导入/逐条录入，与比价单不关联',
    '- 与车辆管理「保险状态」联动：交强险 + 商业险均有效为正常，否则异常',
  ].join('\n');
}

function buildReadme() {
  return `# 保险采购 - 网页数据导出包

本压缩包由 ONE-OS 仓库中的 \`保险采购.jsx\` 原型页面生成，格式兼容 Axhub AI Extension 导出规范。

## 文件结构

\`\`\`
├── README.md / manifest.json / screenshot.png / content.md
├── index.html              # 静态 DOM 快照
├── preview.html            # 交互式 React 预览
├── style.css               # 从 PAGE_STYLE 提取
├── source/保险采购.jsx      # 完整原型源码
├── structure/ flat/ topology/ page-map.json / theme.json / prompts/
\`\`\`

## 本地预览

\`\`\`bash
npx --yes serve web端/业务管理/AI-保险采购-complete -p 5202
# http://127.0.0.1:5202/preview.html
\`\`\`

**生成时间：** ${new Date().toISOString()}
`;
}

async function main() {
  if (!fs.existsSync(JSX_PATH)) throw new Error('找不到保险采购.jsx: ' + JSX_PATH);

  console.log('清理输出目录...');
  if (fs.existsSync(OUT_DIR)) fs.rmSync(OUT_DIR, { recursive: true, force: true });
  ensureDir(OUT_DIR);

  const jsxText = fs.readFileSync(JSX_PATH, 'utf8');
  const styleCss = extractPageStyles(jsxText);

  copyFile(JSX_PATH, path.join(OUT_DIR, 'source', SOURCE_NAME));
  copyFile(JSX_PATH, path.join(__dirname, 'source', SOURCE_NAME));
  fs.writeFileSync(path.join(OUT_DIR, 'style.css'), styleCss, 'utf8');
  fs.writeFileSync(path.join(OUT_DIR, 'README.md'), buildReadme(), 'utf8');

  console.log('启动预览服务...');
  const server = await startServer();
  const browser = await chromium.launch({ headless: true });
  const base = `http://127.0.0.1:${PORT}/web端/业务管理/export-tools/preview-bootstrap.html`;

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
      await waitReady(page, PAGE_SELECTOR);

      ensureDir(path.join(OUT_DIR, 'screenshots'));
      const shotPath = vp.name === 'desktop-1440'
        ? path.join(OUT_DIR, 'screenshot.png')
        : path.join(OUT_DIR, 'screenshots', vp.name + '.png');
      await page.screenshot({ path: shotPath, fullPage: true });

      if (vp.name === 'desktop-1440') {
        mainPageData = await capturePageData(page, PAGE_SELECTOR);
        capturedHtml = await page.evaluate((sel) => {
          const el = document.querySelector(sel) || document.getElementById('root');
          return el ? el.outerHTML : '';
        }, PAGE_SELECTOR);
        const dims = await page.evaluate((sel) => {
          const el = document.querySelector(sel) || document.body;
          return { width: el.scrollWidth, height: el.scrollHeight };
        }, PAGE_SELECTOR);
        pageWidth = dims.width;
        pageHeight = dims.height;
      }
      await context.close();
    }

    if (!mainPageData) throw new Error('未能采集页面数据');

    const indexHtml = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${PAGE_TITLE}</title>
  <link rel="stylesheet" href="https://unpkg.com/antd@5/dist/reset.css">
  <link rel="stylesheet" href="style.css">
  <style>* { box-sizing: border-box; } body { margin: 0; padding: 0; background: #e5e7eb; }</style>
</head>
<body>
${capturedHtml}
</body>
</html>`;
    fs.writeFileSync(path.join(OUT_DIR, 'index.html'), indexHtml, 'utf8');
    copyFile(path.join(__dirname, 'preview-bootstrap.html'), path.join(OUT_DIR, 'preview.html'));

    writeJson(path.join(OUT_DIR, 'structure/doms.json'), buildDomExport(mainPageData));
    writeJson(path.join(OUT_DIR, 'structure/styles.json'), { styles: mainPageData.styles });
    writeJson(path.join(OUT_DIR, 'flat/skeleton.json'), buildSkeleton(mainPageData.nodes, mainPageData.root));

    ensureDir(path.join(OUT_DIR, 'flat/nodes'));
    for (const [id, node] of Object.entries(mainPageData.nodes)) {
      writeJson(path.join(OUT_DIR, 'flat/nodes', id + '.json'), node);
    }

    writeJson(path.join(OUT_DIR, 'page-map.json'), buildPageMap(mainPageData.nodes));
    writeJson(path.join(OUT_DIR, 'theme.json'), {
      source: SOURCE_FILE,
      colors: extractColors(styleCss),
      typography: {
        families: ['system-ui', '-apple-system', 'sans-serif'],
        textStyles: [
          { size: '18px', weight: '800', usage: '页面标题' },
          { size: '15px', weight: '700', usage: '卡片标题' },
          { size: '13px', weight: '500', usage: '表格/表单' },
          { size: '12px', weight: '500', usage: '辅助说明' },
        ],
      },
      spacing: ['8px', '12px', '16px', '20px', '24px'],
      radius: ['8px', '10px', '12px', '16px'],
      brand: { primary: '#2563eb', success: '#10b981', warning: '#f59e0b', danger: '#ef4444', surface: '#f8fafc', border: '#e2e8f0' },
    });

    const contentMd = buildContentMd(mainPageData.pageText);
    fs.writeFileSync(path.join(OUT_DIR, 'content.md'), contentMd, 'utf8');

    writeJson(path.join(OUT_DIR, 'topology/selector-map.json'), Object.fromEntries(
      Object.entries(mainPageData.nodes).filter(([, n]) => n.selector).map(([id, n]) => [id, { selector: n.selector, tag: n.tag, text: n.text || '' }])
    ));
    writeJson(path.join(OUT_DIR, 'topology/topology.json'), {
      pageWidth, pageHeight,
      scrollContainer: '.lc-edit-page .lc-table-card',
      sections: [
        { id: 'section-header', name: '页面标题', order: 0 },
        { id: 'section-filter', name: '保单筛选', order: 1 },
        { id: 'section-kpi', name: 'KPI 统计卡', order: 2 },
        { id: 'section-tabs', name: '保单管理/比价单', order: 3 },
        { id: 'section-table', name: '车辆保单列表', order: 4 },
      ],
    });
    writeJson(path.join(OUT_DIR, 'topology/content-blocks.json'), {
      blocks: [
        { id: 'header', type: 'title', text: '保险采购' },
        { id: 'filter', type: 'form', text: '保单管理 · 筛选条件' },
        { id: 'kpi', type: 'stats', text: '车辆总数 / 正常 / 异常 / 临期 / 逾期' },
        { id: 'tabs', type: 'navigation', text: '保单管理 · 比价单管理' },
        { id: 'table', type: 'table', text: '车辆保单台账列表' },
      ],
    });

    ensureDir(path.join(OUT_DIR, 'prompts'));
    fs.writeFileSync(path.join(OUT_DIR, 'prompts/rebuild-page.md'), `# Rebuild Page Prompt

Rebuild "${PAGE_TITLE}" as a production-ready webpage.

1. Read \`manifest.json\` and \`screenshot.png\`
2. Read \`source/${SOURCE_NAME}\` for full React logic (compare sheets, policy OCR, alerts)
3. Use \`structure/doms.json\` + \`structure/styles.json\` + \`theme.json\`

Preserve: policy filters, KPI cards, tabs (保单管理/比价单), vehicle ledger table, modals.
`, 'utf8');
    fs.writeFileSync(path.join(OUT_DIR, 'prompts/rebuild-section.md'), `# Rebuild Section Prompt\n\nRebuild one section of "${PAGE_TITLE}" using flat/nodes/ and source JSX.\n`, 'utf8');

    writeJson(path.join(OUT_DIR, 'manifest.json'), {
      version: '3.0',
      generator: 'one-os-jsx-exporter',
      exportTime: new Date().toISOString(),
      sourceFile: SOURCE_FILE,
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
        sourceCode: 'source/' + SOURCE_NAME,
        html: 'index.html',
        css: 'style.css',
        preview: 'preview.html',
      },
      flatStructure: { skeleton: 'flat/skeleton.json', nodesDir: 'flat/nodes/' },
      screenshots: {
        current: 'screenshot.png',
        responsive: ['screenshots/desktop-1440.png', 'screenshots/tablet-768.png', 'screenshots/mobile-390.png'],
      },
      stats: {
        nodeCount: mainPageData.nodeCount,
        styleCount: Object.keys(mainPageData.styles).length,
        markdownLength: contentMd.length,
        sectionCount: 5,
        jsxLines: jsxText.split('\n').length,
      },
      capabilities: {
        hasScreenshot: true,
        hasResponsiveScreenshots: true,
        hasTheme: true,
        hasMarkdown: true,
        hasPreviewHTML: true,
        hasSourceJSX: true,
        hasTopology: true,
        hasFlatStructure: true,
        hasRebuildPrompts: true,
        jsonFormat: true,
      },
    });

    console.log('打包 zip...');
    if (fs.existsSync(ZIP_PATH)) fs.unlinkSync(ZIP_PATH);
    execSync(`cd "${path.dirname(OUT_DIR)}" && zip -rq "${ZIP_PATH}" "${path.basename(OUT_DIR)}"`, { stdio: 'inherit' });

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
