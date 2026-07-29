#!/usr/bin/env node
/**
 * 从 src/resources/oneos-web-legacy 生成 ONE-OS Web 端原型与侧边栏菜单项。
 *
 * 用法：node scripts/sync-oneos-web-prototypes.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');
const legacyRoot = path.join(projectRoot, 'src/resources/oneos-web-legacy');
const prototypesRoot = path.join(projectRoot, 'src/prototypes');
const sidebarPath = path.join(projectRoot, '.axhub/make/sidebar-tree.json');

const PAGE_ID_RE = /^[a-z0-9-]+$/u;

const XLL_MODULES = [
  { slug: 'oneos-web-safety-training', title: '业务-司机安全培训', skipCodegen: true },
];

/** 从 ONE-OS Web 合包拆出、由项目内手写 index 维护的独立原型 */
const STANDALONE_MODULES = [
  { slug: 'business-dept-ledger', title: '业务部台账', skipCodegen: true },
  { slug: 'customer-payment-collection', title: '客户回款情况', skipCodegen: true },
  { slug: 'vehicle-maintenance-ledger', title: '车辆维修明细', skipCodegen: true },
  { slug: 'oneos-web-h2-station-site', title: '站点信息', skipCodegen: true },
  { slug: 'oneos-web-h2-station-stats', title: '加氢站数量统计', skipCodegen: true },
  { slug: 'vehicle-return-settlement', title: '还车应结款', skipCodegen: true },
  { slug: 'vehicle-pickup-receivable', title: '提车应收款', skipCodegen: true },
  { slug: 'oneos-web-approval', title: '审批中心', skipCodegen: true },
  { slug: 'oneos-web-approval-initiated', title: '我发起的', skipCodegen: true },
  { slug: 'oneos-web-approval-todo', title: '我的待办', skipCodegen: true },
  { slug: 'oneos-web-approval-done', title: '我的已办', skipCodegen: true },
  { slug: 'oneos-web-approval-cc', title: '我的抄送', skipCodegen: true },
];

const MODULES = [
  { slug: 'oneos-web-workbench', title: '工作台', files: ['工作台.jsx'] },
  { slug: 'oneos-web-login', title: '登录', files: ['登录.jsx'] },
  { slug: 'oneos-web-vehicle-asset', title: '车辆管理', files: ['车辆管理.jsx', '车辆管理-查看.jsx'] },
  { slug: 'oneos-web-contract-template', title: '合同模板管理', files: ['合同模板管理.jsx'] },
  { slug: 'oneos-web-help-center', title: '帮助中心', dir: '帮助中心' },
  {
    slug: 'oneos-web-finance',
    title: '财务管理',
    dir: '财务管理',
    excludeDirs: ['文档'],
    excludeFiles: [
      '还车应结款.jsx',
      '还车应结款-查看.jsx',
      '还车应结款-费用明细.jsx',
      '提车应收款.jsx',
      '提车应收款-查看.jsx',
      '提车应收款-开票信息.jsx',
      '提车应收款-审核.jsx',
      '提车应收款-提车收款单.jsx',
      '提车收款单-编辑.jsx',
    ],
  },
  { slug: 'oneos-web-procurement', title: '采购管理', dir: '采购管理' },
  { slug: 'oneos-web-lease-contract', title: '车辆租赁合同', dir: '车辆租赁合同' },
  { slug: 'oneos-web-h2-station', title: '加氢站管理', dir: '加氢站管理', excludeDirs: ['export-tools', 'AI-加氢站站点信息-complete'], excludeFiles: ['站点信息.jsx'] },
  { slug: 'oneos-web-data-analysis', title: '数据分析', dir: '数据分析', excludeFiles: ['业务部台账.jsx', '客户回款情况.jsx'] },
  { slug: 'oneos-web-ledger-data', title: '台账数据', dir: '台账数据', excludeDirs: ['docs'], excludeFiles: ['车辆维修明细.jsx'] },
  { slug: 'oneos-web-business', title: '业务管理', dir: '业务管理', excludeDirs: ['文档', 'export-tools', 'AI-保险采购-complete'] },
  { slug: 'oneos-web-ops', title: '运维管理', dir: '运维管理' },
  { slug: 'oneos-web-requirements', title: '需求说明', dir: '需求说明', docsOnly: true },
];

function slugifyPageId(relPath) {
  const stem = relPath.replace(/\.jsx$/u, '').replace(/[\\/]/g, '-');
  const ascii = stem.replace(/[^\x00-\x7F]/gu, (ch) => `u${ch.charCodeAt(0).toString(16)}`);
  let id = ascii.toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
  if (!id || !PAGE_ID_RE.test(id)) {
    id = `p${Math.abs(hashCode(relPath)).toString(36)}`;
  }
  return id.slice(0, 48);
}

function hashCode(value) {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = ((hash << 5) - hash) + value.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}

function collectJsxFiles(module) {
  if (module.docsOnly) {
    return [];
  }
  if (module.files) {
    return module.files.map((file) => ({
      rel: file,
      abs: path.join(legacyRoot, file),
      title: file.replace(/\.jsx$/u, ''),
    }));
  }
  const baseDir = path.join(legacyRoot, module.dir);
  const results = [];
  const walk = (dir, prefix = '') => {
    if (!fs.existsSync(dir)) return;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.name.startsWith('.')) continue;
      const full = path.join(dir, entry.name);
      const rel = path.posix.join(module.dir, prefix, entry.name).replace(/\\/g, '/');
      if (entry.isDirectory()) {
        if (module.excludeDirs?.includes(entry.name)) continue;
        walk(full, prefix ? `${prefix}/${entry.name}` : entry.name);
        continue;
      }
      if (!entry.name.endsWith('.jsx')) continue;
      if (module.excludeFiles?.includes(entry.name)) continue;
      results.push({
        rel,
        abs: full,
        title: entry.name.replace(/\.jsx$/u, ''),
      });
    }
  };
  walk(baseDir);
  return results.sort((a, b) => a.rel.localeCompare(b.rel, 'zh-CN'));
}

function prepareLegacyJsx(sourcePath, targetPath) {
  const raw = fs.readFileSync(sourcePath, 'utf8');
  let content = raw;
  if (!/export\s+default\s+Component/u.test(content)) {
    content = `${content.trim()}\n\nexport default Component;\n`;
  }
  fs.mkdirSync(path.dirname(targetPath), { recursive: true });
  fs.writeFileSync(targetPath, content, 'utf8');
}

function writeRequirementsPrototype(module) {
  const protoDir = path.join(prototypesRoot, module.slug);
  fs.mkdirSync(protoDir, { recursive: true });
  const indexTsx = `/**
 * @name ${module.title}
 * 自 ONE-OS web端/需求说明 归档
 */
import React, { useMemo, useState } from 'react';
import { Card, Col, Input, List, Row, Typography } from 'antd';

const DOC_MAP = import.meta.glob('../../resources/oneos-web-legacy/需求说明/**/*', {
  query: '?raw',
  import: 'default',
  eager: true,
});

const FILES = Object.keys(DOC_MAP)
  .map((key) => key.replace('../../resources/oneos-web-legacy/需求说明/', ''))
  .filter(Boolean)
  .sort((a, b) => a.localeCompare(b, 'zh-CN'))
  .map((rel) => ({ rel, title: rel }));

export default function OneosWebRequirementsPage() {
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(FILES[0]?.rel ?? '');

  const filtered = useMemo(() => {
    const q = query.trim();
    if (!q) return FILES;
    return FILES.filter((item) => item.title.includes(q));
  }, [query]);

  const content = useMemo(() => {
    if (!active) return '';
    const key = \`../../resources/oneos-web-legacy/需求说明/\${active}\`;
    return String(DOC_MAP[key] ?? '无法加载文档');
  }, [active]);

  return (
    <Row gutter={16} style={{ padding: 16, minHeight: '100vh', background: '#f5f7fa' }}>
      <Col span={7}>
        <Card title="${module.title}" extra={<Input.Search allowClear placeholder="搜索文档" onSearch={setQuery} onChange={(e) => setQuery(e.target.value)} style={{ width: 160 }} />}>
          <List
            size="small"
            dataSource={filtered}
            renderItem={(item) => (
              <List.Item style={{ cursor: 'pointer', background: item.rel === active ? '#e8f3ff' : undefined }} onClick={() => setActive(item.rel)}>
                {item.title}
              </List.Item>
            )}
          />
        </Card>
      </Col>
      <Col span={17}>
        <Card>
          <Typography.Paragraph style={{ whiteSpace: 'pre-wrap', marginBottom: 0 }}>{content}</Typography.Paragraph>
        </Card>
      </Col>
    </Row>
  );
}
`;
  fs.writeFileSync(path.join(protoDir, 'index.tsx'), indexTsx, 'utf8');
}

function writePrototype(module, pages) {
  const protoDir = path.join(prototypesRoot, module.slug);
  const pagesDir = path.join(protoDir, 'pages');
  fs.mkdirSync(pagesDir, { recursive: true });

  const pageEntries = [];
  const importLines = [];
  const usedIds = new Set();

  pages.forEach((page, index) => {
    const fileName = `${String(index + 1).padStart(2, '0')}-${path.basename(page.rel)}`;
    const target = path.join(pagesDir, fileName);
    prepareLegacyJsx(page.abs, target);
    const importName = `Page${index + 1}`;
    importLines.push(`import ${importName} from './pages/${fileName}';`);
    let id = slugifyPageId(page.rel);
    while (usedIds.has(id)) id = `${id}-${index + 1}`;
    usedIds.add(id);
    pageEntries.push({ id, title: page.title, importName });
  });

  const pagesArray = pageEntries.map((p) => `    { id: '${p.id}', title: '${p.title.replace(/'/g, "\\'")}', component: ${p.importName} },`).join('\n');

  const indexTsx = `/**
 * @name ${module.title}
 * 自 ONE-OS web端 原稿复刻（${pages.length} 个页面）
 */
import '../../common/oneosWebLegacy/legacyGlobals';
import React from 'react';
${importLines.join('\n')}
import { OneosWebLegacyShell } from '../../common/oneosWebLegacy/OneosWebLegacyShell';

const pages = [
${pagesArray}
];

export default function ${toComponentName(module.slug)}() {
  return (
    <OneosWebLegacyShell
      moduleTitle="${module.title}"
      pages={pages}
      defaultPageId="${pageEntries[0]?.id ?? ''}"
    />
  );
}
`;
  fs.writeFileSync(path.join(protoDir, 'index.tsx'), indexTsx, 'utf8');
}

function toComponentName(slug) {
  return slug
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
}

const WORKBENCH_SIDEBAR_ITEM = {
  id: 'item:prototypes:oneos-web-workbench',
  kind: 'item',
  title: '工作台',
  itemKey: 'prototypes/oneos-web-workbench',
};

const ONEOS_NAV_FOLDER_ID = 'folder-1782874576229-r8atbu';

function toSidebarItem(module) {
  return {
    id: `item:prototypes:${module.slug}`,
    kind: 'item',
    title: module.title,
    itemKey: `prototypes/${module.slug}`,
  };
}

function ensureWorkbenchInOneOsRoot(prototypes) {
  for (const item of prototypes) {
    if (item?.id !== ONEOS_NAV_FOLDER_ID || item.kind !== 'folder' || !Array.isArray(item.children)) {
      continue;
    }
    const rest = item.children.filter((child) => child.itemKey !== WORKBENCH_SIDEBAR_ITEM.itemKey);
    item.children = [WORKBENCH_SIDEBAR_ITEM, ...rest];
    return;
  }
}

function updateSidebar(webModules, xllModules) {
  const sidebar = JSON.parse(fs.readFileSync(sidebarPath, 'utf8'));
  const prefix = 'item:prototypes:oneos-web-';
  const existing = (sidebar.prototypes ?? []).filter(
    (item) =>
      item.id !== 'folder-prototypes-oneos-web'
      && item.id !== 'folder-prototypes-xll-miniapp'
      && item.itemKey !== 'prototypes/contract-template-management'
      && !String(item.id).startsWith(prefix)
      && !String(item.itemKey).startsWith('prototypes/oneos-web-'),
  );

  ensureWorkbenchInOneOsRoot(existing);

  const webModulesForFolder = webModules.filter((module) => module.slug !== 'oneos-web-workbench');

  const xllFolder = {
    id: 'folder-prototypes-xll-miniapp',
    kind: 'folder',
    title: '小羚羚小程序',
    children: xllModules.map(toSidebarItem),
  };

  const oneosFolder = {
    id: 'folder-prototypes-oneos-web',
    kind: 'folder',
    title: 'ONE-OS Web 端',
    defaultExpanded: true,
    children: webModulesForFolder.map(toSidebarItem),
  };

  sidebar.prototypes = [...existing, xllFolder, oneosFolder];
  sidebar.updatedAt = new Date().toISOString();
  fs.writeFileSync(sidebarPath, `${JSON.stringify(sidebar, null, 2)}\n`, 'utf8');
}

function main() {
  if (!fs.existsSync(legacyRoot)) {
    console.error('缺少 src/resources/oneos-web-legacy，请先复制 ONE-OS web端 资料。');
    process.exit(1);
  }

  const allModules = [...XLL_MODULES, ...STANDALONE_MODULES, ...MODULES];

  for (const module of allModules) {
    if (module.skipCodegen) {
      console.log(`[skip codegen] ${module.slug}（入口由项目内手写维护）`);
      continue;
    }
    if (module.docsOnly) {
      writeRequirementsPrototype(module);
      console.log(`[ok] ${module.slug} (需求说明文档浏览)`);
      continue;
    }
    const pages = collectJsxFiles(module);
    if (!pages.length) {
      console.warn(`[skip] ${module.slug}: 未找到 jsx 页面`);
      continue;
    }
    writePrototype(module, pages);
    console.log(`[ok] ${module.slug} (${pages.length} pages)`);
  }

  updateSidebar(MODULES, XLL_MODULES);
  console.log('已更新 .axhub/make/sidebar-tree.json');
}

main();
