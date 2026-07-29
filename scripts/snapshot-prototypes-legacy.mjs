#!/usr/bin/env node
/**
 * 将 src/prototypes 下业务原型整套复制为 <id>-legacy，供设计规范 v2 对照。
 * 排除：oneos-prototype-nav、已有 *-legacy
 * 复制时跳过：.spec/acp、.spec/prototype-comment-assets（体积大、非页面源码）
 *
 * Usage: node scripts/snapshot-prototypes-legacy.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const prototypesDir = path.join(root, 'src/prototypes');
const sidebarPath = path.join(root, '.axhub/make/sidebar-tree.json');

const SKIP_DIRS = new Set(['oneos-prototype-nav']);
const RSYNC_EXCLUDES = [
  '--exclude=.spec/acp',
  '--exclude=.spec/prototype-comment-assets',
  '--exclude=node_modules',
  '--exclude=.DS_Store',
];

function listSourceIds() {
  return fs
    .readdirSync(prototypesDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .filter((name) => !SKIP_DIRS.has(name) && !name.endsWith('-legacy'))
    .sort();
}

function collectTitles(node, map = new Map()) {
  if (!node) return map;
  if (Array.isArray(node)) {
    for (const child of node) collectTitles(child, map);
    return map;
  }
  if (node.kind === 'item' && node.itemKey?.startsWith('prototypes/')) {
    const id = node.itemKey.slice('prototypes/'.length);
    map.set(id, node.title || id);
  }
  if (node.children) collectTitles(node.children, map);
  if (node.prototypes) collectTitles(node.prototypes, map);
  return map;
}

function walkFiles(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === '.git') continue;
      walkFiles(full, out);
    } else if (/\.(tsx?|jsx?|css|md|json|html|js)$/i.test(entry.name)) {
      out.push(full);
    }
  }
  return out;
}

function rewriteFileContent(content, sourceIds) {
  let next = content;
  // Longer ids first to avoid partial replaces
  const ids = [...sourceIds].sort((a, b) => b.length - a.length);
  for (const id of ids) {
    const legacy = `${id}-legacy`;
    // path segments / imports
    next = next.replaceAll(`prototypes/${id}/`, `prototypes/${legacy}/`);
    next = next.replaceAll(`prototypes/${id}'`, `prototypes/${legacy}'`);
    next = next.replaceAll(`prototypes/${id}"`, `prototypes/${legacy}"`);
    next = next.replaceAll(`../${id}/`, `../${legacy}/`);
    next = next.replaceAll(`'../${id}'`, `'../${legacy}'`);
    next = next.replaceAll(`"../${id}"`, `"../${legacy}"`);
    next = next.replaceAll(`/${id}/index.html`, `/${legacy}/index.html`);
  }
  return next;
}

function patchAnnotationTitles(filePath, legacyId, displayTitle) {
  if (!fs.existsSync(filePath)) return;
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    const doc = JSON.parse(raw);
    if (doc && typeof doc === 'object') {
      if (typeof doc.title === 'string') doc.title = displayTitle;
      if (typeof doc.name === 'string') doc.name = displayTitle;
      if (doc.meta && typeof doc.meta === 'object') {
        doc.meta.legacyOf = legacyId.replace(/-legacy$/, '');
        doc.meta.title = displayTitle;
      }
      fs.writeFileSync(filePath, `${JSON.stringify(doc, null, 2)}\n`);
    }
  } catch {
    // leave as-is if not JSON object
  }
}

function copyOne(id) {
  const src = path.join(prototypesDir, id);
  const dest = path.join(prototypesDir, `${id}-legacy`);
  if (fs.existsSync(dest)) {
    fs.rmSync(dest, { recursive: true, force: true });
  }
  const result = spawnSync(
    'rsync',
    ['-a', ...RSYNC_EXCLUDES, `${src}/`, `${dest}/`],
    { encoding: 'utf8' }
  );
  if (result.status !== 0) {
    // fallback cp
    fs.cpSync(src, dest, {
      recursive: true,
      filter: (p) =>
        !p.includes(`${path.sep}.spec${path.sep}acp`) &&
        !p.includes(`${path.sep}prototype-comment-assets`) &&
        !p.includes(`${path.sep}node_modules`),
    });
  }
  return dest;
}

function addLegacySidebarFolder(sidebar, legacyEntries) {
  const folderId = 'folder-ds-v2-legacy-snapshots';
  const folder = {
    id: folderId,
    kind: 'folder',
    title: '设计规范对照·旧版',
    children: legacyEntries.map(({ id, title }) => ({
      id: `item:prototypes:${id}`,
      kind: 'item',
      title,
      itemKey: `prototypes/${id}`,
    })),
  };

  // nav-menu 只同步 title === 'OneOS' 的分区，旧版必须挂在其下
  const list = sidebar.prototypes || [];
  const oneos = list.find((n) => n.kind === 'folder' && n.title === 'OneOS');
  if (!oneos) {
    throw new Error('sidebar-tree.json 中未找到 OneOS 分区');
  }
  oneos.children = Array.isArray(oneos.children) ? oneos.children : [];
  // 移除顶层误挂的同名文件夹
  sidebar.prototypes = list.filter((n) => n.id !== folderId);
  const idx = oneos.children.findIndex((n) => n.id === folderId);
  if (idx >= 0) oneos.children[idx] = folder;
  else oneos.children.push(folder);
  sidebar.updatedAt = new Date().toISOString();
}

function main() {
  const sourceIds = listSourceIds();
  const sidebar = JSON.parse(fs.readFileSync(sidebarPath, 'utf8'));
  const titleMap = collectTitles(sidebar);

  console.log(`将复制 ${sourceIds.length} 个原型 → *-legacy`);

  for (const id of sourceIds) {
    process.stdout.write(`  copy ${id} ... `);
    copyOne(id);
    console.log('ok');
  }

  const legacyIds = sourceIds.map((id) => `${id}-legacy`);
  const allSourceAndLegacy = new Set([...sourceIds, ...legacyIds]);

  // Rewrite cross-refs inside legacy trees to stay frozen against live restyles
  for (const legacyId of legacyIds) {
    const dir = path.join(prototypesDir, legacyId);
    const baseId = legacyId.replace(/-legacy$/, '');
    const title = `【旧版】${titleMap.get(baseId) || baseId}`;
    const files = walkFiles(dir);
    for (const file of files) {
      const before = fs.readFileSync(file, 'utf8');
      let after = rewriteFileContent(before, sourceIds);
      if (after !== before) fs.writeFileSync(file, after);
    }
    patchAnnotationTitles(path.join(dir, 'annotation-source.json'), legacyId, title);
    fs.writeFileSync(
      path.join(dir, 'LEGACY.md'),
      `# ${title}

本目录为设计规范 v2 套用前的**冻结对照副本**（${new Date().toISOString().slice(0, 10)}）。

- 源原型：\`src/prototypes/${baseId}/\`
- 请勿在此目录继续改业务；正式改造只在源目录进行
- 已跳过复制：\`.spec/acp\`、\`.spec/prototype-comment-assets\`（批注大图/会话）
- 交叉引用已尽量改写为同套 \`*-legacy\`，避免引用被改版后的正式样式
`
    );
  }

  const legacyEntries = sourceIds.map((id) => ({
    id: `${id}-legacy`,
    title: `【旧版】${titleMap.get(id) || id}`,
  }));
  addLegacySidebarFolder(sidebar, legacyEntries);
  fs.writeFileSync(sidebarPath, `${JSON.stringify(sidebar, null, 2)}\n`);
  console.log(`已更新 sidebar-tree.json（${legacyEntries.length} 个旧版入口）`);

  const sync = spawnSync(
    'npm',
    ['run', 'nav:sync', '--', '--note', '注册设计规范 v2 前整套 legacy 对照副本'],
    { cwd: root, encoding: 'utf8', shell: true }
  );
  console.log(sync.stdout || '');
  if (sync.stderr) console.error(sync.stderr);
  if (sync.status !== 0) {
    console.error('nav:sync 失败，请手动执行 npm run nav:sync');
    process.exit(sync.status || 1);
  }

  console.log('完成。');
}

main();
