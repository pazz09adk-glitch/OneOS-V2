#!/usr/bin/env node
/**
 * 打包 OneOS V2 设计规范「其他前端外发包」为 zip。
 *
 * 用法（在仓库根目录）：
 *   node scripts/pack-oneos-v2-design-handoff.mjs
 *   node scripts/pack-oneos-v2-design-handoff.mjs --out ~/Desktop
 *
 * 产出目录默认：dist/oneos-v2-design-handoff/
 * zip 文件名：oneos-v2-design-handoff-v{版本}-{日期}.zip
 *
 * 不含 UIComponents.tsx / prototypes（另一套前端不依赖本仓库 React 组件）。
 */

import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const DS = path.join(ROOT, 'src/resources/design-system');

function parseArgs(argv) {
  const out = { outDir: path.join(ROOT, 'dist') };
  for (let i = 2; i < argv.length; i += 1) {
    if (argv[i] === '--out' && argv[i + 1]) {
      out.outDir = path.resolve(argv[++i]);
    } else if (argv[i] === '--help' || argv[i] === '-h') {
      out.help = true;
    }
  }
  return out;
}

function readDesignVersion() {
  const designPath = path.join(DS, 'DESIGN.md');
  const text = fs.readFileSync(designPath, 'utf8');
  const m = text.match(/\|\s*文档版本\s*\|\s*\*\*([^*]+)\*\*/);
  if (m) {
    const raw = m[1].trim();
    const ver = raw.match(/v?\d+(?:\.\d+)*/i);
    return ver ? ver[0].replace(/^v/i, '') : 'unknown';
  }
  return 'unknown';
}

function dateStamp() {
  const d = new Date();
  const y = d.getFullYear();
  const mo = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}${mo}${day}`;
}

/** @type {Array<{ from: string, to: string, optional?: boolean }>} */
const FILES = [
  { from: 'DESIGN.md', to: 'DESIGN.md' },
  { from: 'README.md', to: 'README.md' },
  { from: 'PRIORITY.md', to: 'PRIORITY.md' },
  { from: 'HANDOFF-其他前端.md', to: 'HANDOFF-其他前端.md' },
  { from: 'HANDOFF-Confluence摘要.md', to: 'HANDOFF-Confluence摘要.md' },
  { from: 'HANDOFF-Codex开发.md', to: 'HANDOFF-Codex开发.md' },
  { from: 'ai-prompt-template.md', to: 'ai-prompt-template.md' },
  { from: 'tokens.json', to: 'tokens.json' },
  { from: 'theme-variants.json', to: 'theme-variants.json', optional: true },
  { from: 'oneos-ds-tokens.css', to: 'oneos-ds-tokens.css' },
  { from: 'oneos-ds-filter-affordance.css', to: 'oneos-ds-filter-affordance.css' },
  { from: 'ruoyi-theme-preset.json', to: 'ruoyi-theme-preset.json' },
  { from: 'ruoyi-oneos-v2-theme.css', to: 'ruoyi-oneos-v2-theme.css' },
];

function copyFile(src, dest, optional = false) {
  if (!fs.existsSync(src)) {
    if (optional) {
      console.warn(`[skip optional] ${src}`);
      return false;
    }
    throw new Error(`缺少文件: ${src}`);
  }
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
  return true;
}

function copyDirRecursive(srcDir, destDir) {
  if (!fs.existsSync(srcDir)) {
    throw new Error(`缺少目录: ${srcDir}`);
  }
  fs.mkdirSync(destDir, { recursive: true });
  for (const name of fs.readdirSync(srcDir)) {
    const from = path.join(srcDir, name);
    const to = path.join(destDir, name);
    const st = fs.statSync(from);
    if (st.isDirectory()) {
      copyDirRecursive(from, to);
    } else if (st.isFile() && name.endsWith('.md')) {
      fs.copyFileSync(from, to);
    }
  }
}

function writePackageReadme(packRoot, version) {
  const body = `# OneOS V2 设计规范 · 其他前端外发包

| 项 | 说明 |
|---|---|
| DESIGN 版本 | v${version} |
| 打包日期 | ${dateStamp()} |
| 展厅预览 | https://prototype.lnoneos.com/oneos-v2/index.html |
| 台账母版 | https://prototype.lnoneos.com/lease-contract-management/index.html |

## 先读哪份

1. **一页摘要（可贴 Confluence）**：\`HANDOFF-Confluence摘要.md\`
2. **完整接入步骤（其他前端）**：\`HANDOFF-其他前端.md\`
3. **研发 Codex 接入**：\`HANDOFF-Codex开发.md\`
4. **总规范**：\`DESIGN.md\`
5. **给 AI**：\`ai-prompt-template.md\`（配合 HANDOFF §4 改路径）

## 建议落盘

解压后复制到对方仓库：

\`\`\`text
docs/oneos-v2/
\`\`\`

## 本包不含

- \`UIComponents.tsx\` 等 React 组件实现（请按规范自研等价控件）
- Axhub 业务原型源码

维护方：OneOS 产品 / 设计规范。
`;
  fs.writeFileSync(path.join(packRoot, '00-请先阅读.md'), body, 'utf8');
}

function zipFolder(folderPath, zipPath) {
  const parent = path.dirname(folderPath);
  const base = path.basename(folderPath);
  // Prefer system zip for broad compatibility on macOS
  const result = spawnSync('zip', ['-r', '-q', zipPath, base], {
    cwd: parent,
    encoding: 'utf8',
  });
  if (result.status !== 0) {
    throw new Error(`zip 失败: ${result.stderr || result.stdout || result.error}`);
  }
}

function main() {
  const args = parseArgs(process.argv);
  if (args.help) {
    console.log(`Usage: node scripts/pack-oneos-v2-design-handoff.mjs [--out <dir>]`);
    process.exit(0);
  }

  if (!fs.existsSync(DS)) {
    console.error(`找不到设计规范目录: ${DS}`);
    process.exit(1);
  }

  const version = readDesignVersion();
  const stamp = dateStamp();
  const packName = `oneos-v2-design-handoff-v${version}-${stamp}`;
  const stagingParent = path.join(args.outDir, 'oneos-v2-design-handoff');
  const packRoot = path.join(stagingParent, packName);
  const zipPath = path.join(args.outDir, `${packName}.zip`);

  fs.rmSync(packRoot, { recursive: true, force: true });
  fs.mkdirSync(packRoot, { recursive: true });

  for (const item of FILES) {
    copyFile(path.join(DS, item.from), path.join(packRoot, item.to), item.optional);
  }
  copyDirRecursive(path.join(DS, 'chapters'), path.join(packRoot, 'chapters'));
  writePackageReadme(packRoot, version);

  fs.mkdirSync(path.dirname(zipPath), { recursive: true });
  if (fs.existsSync(zipPath)) fs.unlinkSync(zipPath);
  zipFolder(packRoot, zipPath);

  const sizeKb = Math.round(fs.statSync(zipPath).size / 1024);
  console.log('打包完成');
  console.log(`  版本: v${version}`);
  console.log(`  目录: ${packRoot}`);
  console.log(`  ZIP : ${zipPath} (${sizeKb} KB)`);
  console.log('');
  console.log('下一步：把 ZIP 发给对方，并附上展厅链接 https://prototype.lnoneos.com/oneos-v2/index.html');
}

main();
