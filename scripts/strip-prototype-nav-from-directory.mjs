/**
 * 从各原型 annotation-source.json 移除 ONE-OS 原型导航目录节点。
 *
 * 用法：
 *   node scripts/strip-prototype-nav-from-directory.mjs
 *   node scripts/strip-prototype-nav-from-directory.mjs --prototype lease-contract-management
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

function listPrototypeIds(projectRoot) {
  const prototypesRoot = path.join(projectRoot, 'src/prototypes');
  if (!fs.existsSync(prototypesRoot)) return [];
  return fs.readdirSync(prototypesRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory()
      && fs.existsSync(path.join(prototypesRoot, entry.name, 'annotation-source.json')))
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b, 'zh-CN'));
}

function stripPrototype(prototypeId, projectRoot) {
  const annotationPath = path.join(projectRoot, 'src/prototypes', prototypeId, 'annotation-source.json');
  if (!fs.existsSync(annotationPath)) return false;

  const annotation = readJson(annotationPath);
  const before = JSON.stringify(annotation.directory?.nodes || []);
  annotation.directory = {
    nodes: stripNavNodes(annotation.directory?.nodes),
  };
  const after = JSON.stringify(annotation.directory.nodes || []);
  if (before === after) {
    console.log(`[skip] ${prototypeId}: 无导航节点`);
    return false;
  }

  annotation.data = annotation.data || {};
  annotation.data.updatedAt = Date.now();
  writeJson(annotationPath, annotation);
  console.log(`[strip] ${prototypeId}: 已移除原型导航目录`);
  return true;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const projectRoot = args.projectRoot || path.resolve(__dirname, '..');
  const targets = args.prototype ? [args.prototype] : listPrototypeIds(projectRoot);

  let changed = 0;
  for (const prototypeId of targets) {
    if (stripPrototype(prototypeId, projectRoot)) changed += 1;
  }
  console.log(`完成：处理 ${targets.length} 个原型，更新 ${changed} 个 annotation-source.json`);
}

main();
