#!/usr/bin/env node
/**
 * 合并 merge 冲突中的 prototype-registry.json 与 sidebar-tree.json（保留两侧内容）。
 * 用法：node scripts/merge-registry-sidebar-conflicts.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');

function gitShow(stage, filePath) {
  return execSync(`git show :${stage}:${filePath}`, {
    cwd: projectRoot,
    encoding: 'utf8',
  });
}

function readJsonFromGit(stage, relativePath) {
  return JSON.parse(gitShow(stage, relativePath));
}

function writeJson(relativePath, value) {
  const abs = path.join(projectRoot, relativePath);
  fs.writeFileSync(abs, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function collectItemKeys(items, acc = new Set()) {
  for (const item of items || []) {
    if (item?.itemKey) acc.add(item.itemKey);
    if (Array.isArray(item?.children)) collectItemKeys(item.children, acc);
  }
  return acc;
}

function findItemByKey(items, itemKey) {
  for (const item of items || []) {
    if (item?.itemKey === itemKey) return item;
    if (Array.isArray(item?.children)) {
      const found = findItemByKey(item.children, itemKey);
      if (found) return found;
    }
  }
  return null;
}

function findFolder(items, title) {
  for (const item of items || []) {
    if (item?.kind === 'folder' && item?.title === title) return item;
    if (Array.isArray(item?.children)) {
      const found = findFolder(item.children, title);
      if (found) return found;
    }
  }
  return null;
}

function ensureChildFolder(parent, folderTitle, folderId) {
  parent.children = parent.children || [];
  let folder = parent.children.find((c) => c.kind === 'folder' && c.title === folderTitle);
  if (!folder) {
    folder = {
      id: folderId,
      kind: 'folder',
      title: folderTitle,
      children: [],
    };
    parent.children.push(folder);
  }
  folder.children = folder.children || [];
  return folder;
}

function ensureItem(folder, item) {
  if (!item?.itemKey) return;
  const exists = folder.children.some((c) => c.itemKey === item.itemKey);
  if (!exists) folder.children.push(JSON.parse(JSON.stringify(item)));
}

function mergeRegistry() {
  const relativePath = 'src/prototypes/oneos-prototype-nav/prototype-registry.json';
  const ours = readJsonFromGit(2, relativePath);
  const theirs = readJsonFromGit(3, relativePath);

  const merged = {
    version: 1,
    updatedAt: new Date().toISOString(),
    prototypes: { ...theirs.prototypes },
    recentUpdates: [],
  };

  for (const key of ['oneos-web-h2-station-weekly', 'oneos-web-h2-station-analysis']) {
    if (ours.prototypes[key]) merged.prototypes[key] = ours.prototypes[key];
  }

  const seen = new Set();
  const combinedRecent = [...(ours.recentUpdates || []), ...(theirs.recentUpdates || [])];
  for (const entry of combinedRecent) {
    const sig = `${entry.prototypeId}|${entry.version}|${entry.date}|${entry.time}`;
    if (seen.has(sig)) continue;
    seen.add(sig);
    merged.recentUpdates.push(entry);
  }
  merged.recentUpdates = merged.recentUpdates.slice(0, 40);

  writeJson(relativePath, merged);
  return {
    prototypeCount: Object.keys(merged.prototypes).length,
    recentCount: merged.recentUpdates.length,
    hasXll: Boolean(merged.prototypes['xll-miniapp']),
    h2AnalysisVersion: merged.prototypes['oneos-web-h2-station-analysis']?.version,
  };
}

function mergeSidebar() {
  const relativePath = '.axhub/make/sidebar-tree.json';
  const ours = readJsonFromGit(2, relativePath);
  const theirs = readJsonFromGit(3, relativePath);

  const merged = JSON.parse(JSON.stringify(theirs));
  merged.updatedAt = new Date().toISOString();

  const oursKeys = collectItemKeys(ours.prototypes);
  const mergedKeys = collectItemKeys(merged.prototypes);
  const localOnlyKeys = [
    'prototypes/oneos-web-h2-station-weekly',
    'prototypes/oneos-web-h2-station-analysis',
  ].filter((key) => oursKeys.has(key) && !mergedKeys.has(key));

  const oneOsFolder = findFolder(merged.prototypes, 'OneOS');
  const h2Folder = oneOsFolder ? findFolder(oneOsFolder.children, '加氢站管理') : findFolder(merged.prototypes, '加氢站管理');

  if (h2Folder) {
    for (const itemKey of localOnlyKeys) {
      const source =
        findItemByKey(ours.prototypes, itemKey) ||
        ({
          'prototypes/oneos-web-h2-station-weekly': {
            id: 'item:prototypes:oneos-web-h2-station-weekly',
            kind: 'item',
            title: '站点周报统计',
            itemKey: 'prototypes/oneos-web-h2-station-weekly',
          },
          'prototypes/oneos-web-h2-station-analysis': {
            id: 'item-prototypes-oneos-web-h2-station-analysis',
            kind: 'item',
            title: '加氢站分析',
            itemKey: 'prototypes/oneos-web-h2-station-analysis',
          },
        }[itemKey]);
      ensureItem(h2Folder, source);
    }
  }

  writeJson(relativePath, merged);
  return {
    addedKeys: localOnlyKeys,
    itemCount: collectItemKeys(merged.prototypes).size,
  };
}

const registry = mergeRegistry();
const sidebar = mergeSidebar();
console.log('[merge] prototype-registry.json', registry);
console.log('[merge] sidebar-tree.json', sidebar);
