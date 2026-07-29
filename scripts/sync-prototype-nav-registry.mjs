/**
 * 原型导航注册表：检测原型变更、递增版本、写入变更日志，并同步 nav-menu。
 *
 * 用法：
 *   node scripts/sync-prototype-nav-registry.mjs
 *   node scripts/sync-prototype-nav-registry.mjs --prototype vehicle-h2-fee-ledger
 *   node scripts/sync-prototype-nav-registry.mjs --prototype vehicle-h2-fee-ledger --note "成本单价校验"
 *   CHANGELOG_NOTE="修复筛选" node scripts/sync-prototype-nav-registry.mjs --prototype customer-management
 */
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const NAV_PROTOTYPE_ID = 'oneos-prototype-nav';
const REGISTRY_RELATIVE = 'src/prototypes/oneos-prototype-nav/prototype-registry.json';
const TRACKED_EXTENSIONS = new Set(['.tsx', '.ts', '.jsx', '.js', '.css', '.json', '.md', '.html']);
const IGNORED_DIR_NAMES = new Set(['node_modules', '.git', 'dist', 'coverage']);
const IGNORED_FILE_NAMES = new Set(['prototype-registry.json', 'nav-menu.json']);
const MAX_CHANGELOG_PER_PROTOTYPE = 30;
const MAX_RECENT_UPDATES = 40;

function parseArgs(argv) {
  const args = {
    prototype: '',
    projectRoot: '',
    note: process.env.CHANGELOG_NOTE?.trim() || '',
    quiet: false,
    skipDirectorySync: false,
  };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--prototype' && argv[i + 1]) {
      args.prototype = argv[++i].trim();
    } else if (arg === '--project-root' && argv[i + 1]) {
      args.projectRoot = path.resolve(argv[++i].trim());
    } else if (arg === '--note' && argv[i + 1]) {
      args.note = argv[++i].trim();
    } else if (arg === '--quiet') {
      args.quiet = true;
    } else if (arg === '--skip-directory-sync') {
      args.skipDirectorySync = true;
    }
  }
  return args;
}

function readJson(filePath, fallback = null) {
  if (!fs.existsSync(filePath)) return fallback;
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function writeJson(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function log(message, quiet) {
  if (!quiet) console.log(message);
}

function prototypeIdFromItemKey(itemKey) {
  const normalized = String(itemKey || '').trim().replace(/^\/+/u, '');
  const match = normalized.match(/^prototypes\/(.+)$/u);
  return match ? match[1] : '';
}

function loadSidebarPrototypes(projectRoot) {
  const sidebarPath = path.join(projectRoot, '.axhub/make/sidebar-tree.json');
  if (!fs.existsSync(sidebarPath)) {
    throw new Error(`缺少侧边栏配置：${sidebarPath}`);
  }
  const sidebar = readJson(sidebarPath, {});
  return Array.isArray(sidebar.prototypes) ? sidebar.prototypes : [];
}

function collectNavPrototypeTitles(sidebarItems) {
  const titles = new Map();
  const walk = (items) => {
    for (const item of items || []) {
      if (item?.kind === 'item') {
        const prototypeId = prototypeIdFromItemKey(item.itemKey);
        if (prototypeId && prototypeId !== NAV_PROTOTYPE_ID) {
          titles.set(prototypeId, item.title || prototypeId);
        }
      }
      if (Array.isArray(item?.children)) walk(item.children);
    }
  };
  walk(sidebarItems);
  return titles;
}

function shouldTrackFile(relativePath) {
  const base = path.basename(relativePath);
  if (IGNORED_FILE_NAMES.has(base)) return false;
  if (relativePath === 'annotation-source.json') return false;
  const ext = path.extname(relativePath).toLowerCase();
  return TRACKED_EXTENSIONS.has(ext);
}

function listTrackedFiles(prototypeDir) {
  const files = [];
  const walk = (dir, prefix = '') => {
    if (!fs.existsSync(dir)) return;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (IGNORED_DIR_NAMES.has(entry.name)) continue;
      const rel = prefix ? `${prefix}/${entry.name}` : entry.name;
      const abs = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(abs, rel);
        continue;
      }
      if (shouldTrackFile(rel)) files.push(rel);
    }
  };
  walk(prototypeDir);
  return files.sort((a, b) => a.localeCompare(b));
}

function hashPrototypeDir(prototypeDir) {
  const files = listTrackedFiles(prototypeDir);
  const hash = crypto.createHash('sha256');
  hash.update(`files:${files.length}\n`);
  for (const rel of files) {
    const abs = path.join(prototypeDir, rel);
    const stat = fs.statSync(abs);
    hash.update(`${rel}\n${stat.mtimeMs}\n${stat.size}\n`);
    hash.update(fs.readFileSync(abs));
    hash.update('\n');
  }
  return { hash: hash.digest('hex'), files };
}

function formatNowParts(date = new Date()) {
  const pad = (n) => String(n).padStart(2, '0');
  return {
    iso: date.toISOString(),
    date: `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`,
    time: `${pad(date.getHours())}:${pad(date.getMinutes())}`,
    label: `${date.getMonth() + 1}月${date.getDate()}日`,
  };
}

function summarizeChange(changedFiles, note) {
  if (note) return note;
  const names = changedFiles.map((f) => path.basename(f)).join(' ');
  if (/PRD|requirements|需求/i.test(names) || changedFiles.some((f) => f.includes('.spec/') && f.endsWith('.md'))) {
    return '更新需求说明与标注';
  }
  if (changedFiles.some((f) => f.endsWith('.css'))) {
    return '更新页面样式';
  }
  if (changedFiles.some((f) => /\.(tsx|jsx)$/.test(f) || f.includes('/pages/'))) {
    return '更新页面逻辑与交互';
  }
  if (changedFiles.length === 1) {
    return `更新 ${path.basename(changedFiles[0])}`;
  }
  return `更新 ${changedFiles.length} 个文件`;
}

function diffChangedFiles(previousFiles, currentFiles) {
  const prevSet = new Set(previousFiles || []);
  return currentFiles.filter((file) => !prevSet.has(file));
}

/** 仅标注/批注文件变动时不自动递增版本（避免 dev 保存刷屏） */
function isAnnotationOnlyChange(changedFiles) {
  if (!changedFiles.length) return false;
  return changedFiles.every((file) => (
    file === 'annotation-source.json'
    || file.endsWith('/annotation-source.json')
    || file.includes('prototype-comments')
    || (file.includes('.spec/') && file.endsWith('.md') && !file.includes('requirements-prd'))
  ));
}

function bumpVersion(revision) {
  return `v1.${revision}`;
}

function createRegistrySkeleton() {
  return {
    version: 1,
    updatedAt: new Date().toISOString(),
    prototypes: {},
    recentUpdates: [],
  };
}

function upsertPrototypeRecord(registry, prototypeId, title, contentHash, files, options) {
  const existing = registry.prototypes[prototypeId] || {
    title,
    version: 'v1.0',
    revision: 0,
    lastUpdated: null,
    contentHash: '',
    trackedFiles: [],
    changelog: [],
  };

  const changed = existing.contentHash && existing.contentHash !== contentHash;
  const now = formatNowParts();

  if (!existing.contentHash) {
    existing.title = title;
    existing.contentHash = contentHash;
    existing.trackedFiles = files;
    existing.lastUpdated = now.iso;
    registry.prototypes[prototypeId] = existing;
    return { changed: false, entry: null };
  }

  if (!changed) {
    existing.title = title;
    existing.trackedFiles = files;
    registry.prototypes[prototypeId] = existing;
    return { changed: false, entry: null };
  }

  const changedFiles = diffChangedFiles(existing.trackedFiles, files);
  if (!options.note && isAnnotationOnlyChange(changedFiles.length ? changedFiles : files)) {
    existing.title = title;
    existing.contentHash = contentHash;
    existing.trackedFiles = files;
    registry.prototypes[prototypeId] = existing;
    return { changed: false, entry: null };
  }

  const summary = summarizeChange(changedFiles.length ? changedFiles : files, options.note);
  const nextRevision = (existing.revision || 0) + 1;
  const version = bumpVersion(nextRevision);

  const entry = {
    version,
    date: now.date,
    time: now.time,
    summary,
    files: (changedFiles.length ? changedFiles : files).slice(0, 12),
  };

  existing.title = title;
  existing.version = version;
  existing.revision = nextRevision;
  existing.lastUpdated = now.iso;
  existing.contentHash = contentHash;
  existing.trackedFiles = files;
  existing.changelog = [entry, ...(existing.changelog || [])].slice(0, MAX_CHANGELOG_PER_PROTOTYPE);
  registry.prototypes[prototypeId] = existing;

  return { changed: true, entry: { prototypeId, title, ...entry } };
}

function pushRecentUpdate(registry, update) {
  if (!update) return;
  registry.recentUpdates = [
    update,
    ...(registry.recentUpdates || []).filter((item) => !(
      item.prototypeId === update.prototypeId && item.version === update.version
    )),
  ].slice(0, MAX_RECENT_UPDATES);
}

function syncNavMenuAndDirectories(projectRoot, quiet) {
  const script = path.join(projectRoot, 'scripts/sync-project-prototype-directory.mjs');
  const result = spawnSync(process.execPath, [script, `--project-root=${projectRoot}`], {
    cwd: projectRoot,
    encoding: 'utf8',
  });
  if (result.status !== 0) {
    const err = result.stderr || result.stdout || 'unknown error';
    throw new Error(`同步原型目录失败：${err}`);
  }
  if (!quiet && result.stdout?.trim()) {
    console.log(result.stdout.trim());
  }
}

function syncXllNavMenu(projectRoot, quiet) {
  const script = path.join(projectRoot, 'scripts/sync-xll-nav-menu.mjs');
  if (!fs.existsSync(script)) return false;
  const result = spawnSync(process.execPath, [script, `--project-root=${projectRoot}`], {
    cwd: projectRoot,
    encoding: 'utf8',
  });
  if (result.status !== 0) {
    const err = result.stderr || result.stdout || 'unknown error';
    throw new Error(`同步小羚羚导航失败：${err}`);
  }
  if (!quiet && result.stdout?.trim()) {
    console.log(result.stdout.trim());
  }
  return true;
}

export function syncPrototypeNavRegistry(options = {}) {
  const projectRoot = options.projectRoot || path.resolve(__dirname, '..');
  const registryPath = path.join(projectRoot, REGISTRY_RELATIVE);
  const sidebarItems = loadSidebarPrototypes(projectRoot);
  const titleMap = collectNavPrototypeTitles(sidebarItems);
  const registry = readJson(registryPath, createRegistrySkeleton()) || createRegistrySkeleton();

  if (!options.skipDirectorySync) {
    syncNavMenuAndDirectories(projectRoot, options.quiet);
    syncXllNavMenu(projectRoot, options.quiet);
  }

  const targetIds = options.prototype
    ? [options.prototype]
    : [...titleMap.keys()];

  let bumped = 0;
  for (const prototypeId of targetIds) {
    if (prototypeId === NAV_PROTOTYPE_ID && options.prototype !== NAV_PROTOTYPE_ID) continue;
    const title = titleMap.get(prototypeId) || prototypeId;
    const prototypeDir = path.join(projectRoot, 'src/prototypes', prototypeId);
    if (!fs.existsSync(prototypeDir)) {
      log(`[skip] ${prototypeId}: 目录不存在`, options.quiet);
      continue;
    }

    const { hash, files } = hashPrototypeDir(prototypeDir);
    const result = upsertPrototypeRecord(registry, prototypeId, title, hash, files, {
      note: options.note && options.prototype === prototypeId ? options.note : '',
    });
    if (result.changed) {
      bumped += 1;
      pushRecentUpdate(registry, result.entry);
      log(`[version] ${prototypeId}: ${result.entry.version} — ${result.entry.summary}`, options.quiet);
    }
  }

  registry.updatedAt = new Date().toISOString();
  writeJson(registryPath, registry);

  return { bumped, registryPath, prototypeCount: targetIds.length };
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const projectRoot = args.projectRoot || path.resolve(__dirname, '..');
  const result = syncPrototypeNavRegistry({
    projectRoot,
    prototype: args.prototype,
    note: args.note,
    quiet: args.quiet,
    skipDirectorySync: args.skipDirectorySync,
  });
  log(`完成：检查 ${result.prototypeCount} 个原型，新增版本 ${result.bumped} 个`, args.quiet);
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  main();
}
