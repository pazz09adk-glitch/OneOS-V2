#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

const ROOT = path.resolve('src/prototypes');

function walk(dir, out = []) {
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    if (fs.statSync(full).isDirectory()) {
      if (name === 'node_modules' || name === '.spec') continue;
      walk(full, out);
    } else if (/\.(jsx|tsx)$/.test(name)) out.push(full);
  }
  return out;
}

function cleanup(source) {
  let s = source;

  // Lease contract topbar: remove span trail, keep req action
  s = s.replace(
    /React\.createElement\('div', \{ style: \{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: 16 \} \}, React\.createElement\('span'[\s\S]*?\)\),\s*(React\.createElement\('(?:button|span)'[\s\S]*?'查看需求说明'\)[^)]*\)\),/g,
    `React.createElement('div', { style: { display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: 16 } }, $1),`
  );

  // Topbar only breadcrumb spans (no req button)
  s = s.replace(
    /React\.createElement\('div', \{ style: \{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: 16 \} \}, React\.createElement\('span'[\s\S]*?\)\),/g,
    ''
  );

  // Unused breadcrumb vars
  s = s.replace(/\n\tvar breadcrumbItems = \[[\s\S]*?\];\n/g, '\n');
  s = s.replace(/\n\t\tvar breadcrumbItems = \[[\s\S]*?\];\n/g, '\n');
  s = s.replace(/\n\tvar breadcrumbNodes = \[[\s\S]*?\];\n/g, '\n');

  // Broken 后装设备 page wrapper
  s = s.replace(
    /(\{ style: styles\.page \},\n)\s*React\.createElement\('a', \{ href: '#', style: styles\.requirementLink[\s\S]*?'查看需求说明'\)\n\t\t\),/g,
    `$1\t\tReact.createElement('div', { style: { display: 'flex', justifyContent: 'flex-end', marginBottom: 16 } },\n\t\t\tReact.createElement('a', { href: '#', style: styles.requirementLink, onClick: function (e) { e.preventDefault(); setShowRequirementModal(true); } }, '查看需求说明')\n\t\t),\n`
  );

  // Empty if blocks left from breadcrumb removal in 业务台账
  s = s.replace(/\n\tif \(view === 'sales' \|\| view === 'project'\) \{\s*\}\n\tif \(view === 'project'\) \{\s*\}\n/g, '\n');

  return s;
}

const files = walk(ROOT);
let changed = 0;
for (const file of files) {
  let source = fs.readFileSync(file, 'utf8');
  if (!/breadcrumb|Breadcrumb|面包屑/.test(source)) continue;
  const next = cleanup(source);
  if (next !== source) {
    fs.writeFileSync(file, next);
    changed++;
    console.log('fixed:', path.relative(process.cwd(), file));
  }
}
console.log(`Pass 3 done. ${changed} file(s).`);
