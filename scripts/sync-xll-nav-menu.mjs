/**
 * 从小羚羚「小程序」项目同步页面目录到 oneos 原型导航。
 *
 * 用法：
 *   node scripts/sync-xll-nav-menu.mjs
 *   node scripts/sync-xll-nav-menu.mjs --project-root /path/to/oneos1.2
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const ROUTE_TO_PAGE = {
  todo: 'todo',
  business: 'business',
  map: 'map',
  mine: 'mine',
  audit: 'audit',
  delivery: 'delivery',
  inspection: 'inspection',
  vehicle: 'vehicle',
  thirdReturn: 'third-return',
  'third-return': 'third-return',
  replace: 'replace',
  'audit-return': 'audit-return',
  training: 'driver-training',
  'driver-training': 'driver-training',
};

function parseArgs(argv) {
  const args = { projectRoot: '' };
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === '--project-root' && argv[i + 1]) {
      args.projectRoot = path.resolve(argv[++i].trim());
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

function resolvePageId(route) {
  const key = String(route || '').trim();
  return ROUTE_TO_PAGE[key] || key;
}

function buildLinksFromFolder(folder) {
  const links = [];
  for (const child of folder.children || []) {
    if (child?.type !== 'route' || !child.route) continue;
    const pageId = resolvePageId(child.route);
    links.push({
      id: child.id || `xll-route-${pageId}`,
      title: child.title || pageId,
      pageId,
      route: child.route,
    });
  }
  return links;
}

export function syncXllNavMenu(projectRoot) {
  const oneosRoot = projectRoot || path.resolve(__dirname, '..');
  const sourceConfigPath = path.join(oneosRoot, 'src/prototypes/oneos-prototype-nav/xll-nav-source.json');
  const outputPath = path.join(oneosRoot, 'src/prototypes/oneos-prototype-nav/xll-nav-menu.json');
  const sourceConfig = readJson(sourceConfigPath);
  if (!sourceConfig?.projectRoot) {
    throw new Error(`缺少小羚羚同步配置：${sourceConfigPath}`);
  }

  const xllRoot = path.resolve(sourceConfig.projectRoot);
  const annotationPath = path.join(xllRoot, sourceConfig.annotationSource);
  const annotation = readJson(annotationPath);
  if (!annotation) {
    throw new Error(`无法读取小羚羚标注目录：${annotationPath}`);
  }

  const includeIds = new Set(sourceConfig.includeDirectoryIds || ['directory-main', 'directory-modules']);
  const groups = [];
  for (const node of annotation.directory?.nodes || []) {
    if (node?.type !== 'folder' || !includeIds.has(node.id)) continue;
    const links = buildLinksFromFolder(node);
    if (!links.length) continue;
    groups.push({
      id: node.id,
      title: node.title || '分组',
      defaultExpanded: node.defaultExpanded !== false,
      links,
    });
  }

  const devInfoPath = path.join(xllRoot, sourceConfig.devServerInfo || '.axhub/make/.dev-server-info.json');
  const devInfo = readJson(devInfoPath, {});
  const runtimeOrigin = String(devInfo.origin || '').trim() || 'http://localhost:51721';
  const prototypeId = sourceConfig.prototypeId || 'xll-miniapp';

  const menu = {
    version: 1,
    updatedAt: new Date().toISOString(),
    title: '小羚羚',
    sectionId: 'folder-prototypes-xll-miniapp',
    description: '氢能车辆运营移动端原型；菜单与小羚羚「小程序」项目目录同步。',
    prototypeId,
    runtimeOrigin,
    hrefPrefix: `${runtimeOrigin.replace(/\/$/u, '')}/prototypes/${prototypeId}`,
    groups,
  };

  writeJson(outputPath, menu);
  return { outputPath, groupCount: groups.length, linkCount: groups.reduce((n, g) => n + g.links.length, 0) };
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const result = syncXllNavMenu(args.projectRoot);
  console.log(`[sync] xll-nav-menu: ${result.groupCount} 个分组，${result.linkCount} 个页面入口`);
  console.log(`[sync] 写入 ${result.outputPath}`);
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  main();
}
