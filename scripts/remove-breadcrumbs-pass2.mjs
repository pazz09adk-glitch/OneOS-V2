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

  // Fix corrupted fragment from partial breadcrumb removal (37-新增后装设备)
  s = s.replace(
    /\{ style: styles\.page \},\s*\{ e\.preventDefault\(\); \} \}, '运维管理'\),[\s\S]*?React\.createElement\('span', \{ style: styles\.breadcrumbCurrent \}, '[^']+'\)\s*\),/g,
    '{ style: styles.page },'
  );

  // Top bar: breadcrumb spans + req button -> req button only
  s = s.replace(
    /React\.createElement\('div', \{ style: \{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 \} \},\s*React\.createElement\('span'[\s\S]*?\),\s*(React\.createElement\(Button, \{ type: 'link'[\s\S]*?'查看需求说明'\)\s*)\),/g,
    `React.createElement('div', { style: { display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: 16 } }, $1),`
  );

  // Lease contract rows with broken partial breadcrumb
  s = s.replace(
    /React\.createElement\('div', \{ style: \{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 \} \},\s*React\.createElement\('span'[\s\S]*?\),\s*(React\.createElement\('(?:button|span)'[\s\S]*?'查看需求说明'\)[^)]*\))/g,
    `React.createElement('div', { style: { display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: 16 } }, $1)`
  );

  // Lease contract row - only breadcrumb spans ending with )), no req
  s = s.replace(
    /React\.createElement\('div', \{ style: \{ marginBottom: 16 \} \},\s*React\.createElement\('span'[\s\S]*?\)\),/g,
    ''
  );

  // 后装设备 list page partial breadcrumb block inside createElement
  s = s.replace(
    /React\.createElement\('div', \{ style: styles\.breadcrumbLeft \},[\s\S]*?React\.createElement\('span', \{ style: styles\.breadcrumbCurrent \}, '[^']+'\)\s*\),/g,
    ''
  );

  // Orphan breadcrumb link lines after broken removal
  s = s.replace(
    /\n\t\t\tReact\.createElement\('a', \{ href: '#', style: styles\.breadcrumbLink[\s\S]*?breadcrumbCurrent \}, '[^']+'\)\n\t\t\),/g,
    ''
  );

  // Remove breadcrumbItems variable blocks
  s = s.replace(/\n\tvar breadcrumbItems = \[[\s\S]*?\];\n/g, '\n');
  s = s.replace(/\n\tvar breadcrumbItems = \[[\s\S]*?\];\n/g, '\n');
  s = s.replace(/\n\t\tbreadcrumbItems\.push\([^)]+\);\n/g, '');

  // 备车/交车任务 inline breadcrumb rows (partial)
  s = s.replace(
    /React\.createElement\('div', \{ style: styles\.breadcrumb[^}]*\},[\s\S]*?\),?\n?/g,
    ''
  );
  s = s.replace(
    /React\.createElement\('span', \{ key: '[^']+', style: styles\.breadcrumbSep \}, ' \/ '\),?\n?\s*/g,
    ''
  );

  // Arco/fault pages: remove Breadcrumb from Layout header if any remain
  s = s.replace(/,\s*breadcrumb:\s*React\.createElement\(Breadcrumb[\s\S]*?\)/g, '');

  // business pages partial breadcrumb in flex div
  s = s.replace(
    /React\.createElement\('div', \{ style: \{ display: 'flex', alignItems: 'center', marginBottom: 16 \} \},[\s\S]*?styles\.breadcrumbSep[\s\S]*?\),/g,
    ''
  );

  // Fix double spaces in lease contract lines
  s = s.replace(/marginBottom: 16 \} \},\s{2}React/g, 'marginBottom: 16 } }, React');

  // 27-交车管理: broken topbar after breadcrumb removal
  s = s.replace(
    /React\.createElement\('div', \{ style: \{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 \} \},\s*React\.createElement\(Button,/g,
    `React.createElement('div', { style: { display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: 16 } }, React.createElement(Button,`
  );

  return s;
}

function fixCollectPageIndent(source) {
  return source.replace(
    /(\}, '返回'\),\n)\s+React\.createElement\(Button,/g,
    `$1\t\t\tReact.createElement(Button,`
  );
}

const files = walk(ROOT);
let changed = 0;
for (const file of files) {
  let source = fs.readFileSync(file, 'utf8');
  if (!/breadcrumb|Breadcrumb|面包屑/.test(source)) continue;
  const next = fixCollectPageIndent(cleanup(source));
  if (next !== source) {
    fs.writeFileSync(file, next);
    changed++;
    console.log('fixed:', path.relative(process.cwd(), file));
  }
}
console.log(`Pass 2 done. ${changed} file(s).`);
