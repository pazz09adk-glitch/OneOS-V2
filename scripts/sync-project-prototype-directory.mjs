/**
 * 将 .axhub/make/sidebar-tree.json 同步到原型导航页 nav-menu.json。
 * 不再向各原型 annotation-source.json 注入「ONE-OS 原型导航」目录。
 *
 * 用法：
 *   node scripts/sync-project-prototype-directory.mjs
 *   node scripts/sync-project-prototype-directory.mjs --prototype vehicle-management
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const NAV_FOLDER_ID = 'oneos-project-nav';

function parseArgs(argv) {
  const args = { prototype: '', projectRoot: '' };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--prototype' && argv[i + 1]) {
      args.prototype = argv[++i].trim();
    } else if (arg === '--project-root' && argv[i + 1]) {
      args.projectRoot = path.resolve(argv[++i].trim());
    }
  }
  return args;
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function writeJson(filePath, value) {
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function loadSidebarPrototypes(projectRoot) {
  const sidebarPath = path.join(projectRoot, '.axhub/make/sidebar-tree.json');
  if (!fs.existsSync(sidebarPath)) {
    throw new Error(`缺少侧边栏配置：${sidebarPath}`);
  }
  const sidebar = readJson(sidebarPath);
  return Array.isArray(sidebar.prototypes) ? sidebar.prototypes : [];
}

function listPrototypeIdsWithAnnotation(projectRoot) {
  const prototypesRoot = path.join(projectRoot, 'src/prototypes');
  if (!fs.existsSync(prototypesRoot)) return [];
  return fs.readdirSync(prototypesRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory()
      && fs.existsSync(path.join(prototypesRoot, entry.name, 'annotation-source.json')))
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b, 'zh-CN'));
}

function stripNavNodes(nodes) {
  const list = Array.isArray(nodes) ? nodes : [];
  return list
    .filter((node) => node?.id !== NAV_FOLDER_ID)
    .map((node) => {
      if (node?.type === 'folder' && Array.isArray(node.children)) {
        return { ...node, children: stripNavNodes(node.children) };
      }
      return node;
    });
}

function fixPublishedLinks(nodes, prototypeId) {
  const walk = (items) => {
    for (const node of items || []) {
      if (node?.type === 'link' && typeof node.href === 'string') {
        const href = node.href.trim();
        const selfMatch = href.match(new RegExp(`^/prototypes/${prototypeId.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&')}(?:[#?].*)?$`, 'u'));
        if (selfMatch) {
          node.href = './index.html';
          node.target = node.target || 'self';
        } else {
          const otherMatch = href.match(/^\/prototypes\/([^/?#]+)(?:[#?].*)?$/u);
          if (otherMatch) {
            node.href = `../${otherMatch[1]}/index.html`;
            node.target = node.target || 'self';
          }
        }
      }
      if (node?.type === 'folder' && Array.isArray(node.children)) {
        walk(node.children);
      }
    }
  };
  walk(nodes);
}

function cleanupPrototypeDirectory(prototypeId, projectRoot) {
  const annotationPath = path.join(projectRoot, 'src/prototypes', prototypeId, 'annotation-source.json');
  if (!fs.existsSync(annotationPath)) {
    console.log(`[skip] ${prototypeId}: 无 annotation-source.json`);
    return false;
  }

  const annotation = readJson(annotationPath);
  const existingNodes = Array.isArray(annotation.directory?.nodes) ? annotation.directory.nodes : [];
  const cleanedNodes = stripNavNodes(existingNodes);
  fixPublishedLinks(cleanedNodes, prototypeId);

  const before = JSON.stringify(existingNodes);
  const after = JSON.stringify(cleanedNodes);
  if (before === after) {
    console.log(`[ok] ${prototypeId}: 目录已不含原型导航`);
    return false;
  }

  annotation.directory = { nodes: cleanedNodes };
  annotation.data = annotation.data || {};
  annotation.data.updatedAt = Date.now();
  writeJson(annotationPath, annotation);
  console.log(`[cleanup] ${prototypeId}: 已移除原型导航目录节点`);
  return true;
}

function filterNavMenuPrototypes(sidebarItems) {
  return sidebarItems.filter((node) => node?.kind === 'folder' && node?.title === 'OneOS');
}

function syncPrototypeNavMenu(projectRoot, sidebarItems) {
  const navMenuPath = path.join(projectRoot, 'src/prototypes/oneos-prototype-nav/nav-menu.json');
  if (!fs.existsSync(path.dirname(navMenuPath))) return false;
  const filtered = filterNavMenuPrototypes(sidebarItems);
  writeJson(navMenuPath, { prototypes: filtered });
  console.log(`[sync] oneos-prototype-nav: 已更新 nav-menu.json（${filtered.length} 个分区）`);
  return true;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const projectRoot = args.projectRoot || path.resolve(__dirname, '..');
  const sidebarItems = loadSidebarPrototypes(projectRoot);
  const targets = args.prototype
    ? [args.prototype]
    : listPrototypeIdsWithAnnotation(projectRoot);

  if (!sidebarItems.length) {
    console.error('sidebar-tree.json 中未找到 prototypes 菜单。');
    process.exit(1);
  }
  if (!targets.length) {
    console.log('未找到带 annotation-source.json 的原型。');
    process.exit(0);
  }

  let changed = 0;
  for (const prototypeId of targets) {
    if (cleanupPrototypeDirectory(prototypeId, projectRoot)) {
      changed += 1;
    }
  }
  console.log(`完成：处理 ${targets.length} 个原型，清理 ${changed} 个 annotation-source.json`);
  syncPrototypeNavMenu(projectRoot, sidebarItems);
}

main();
