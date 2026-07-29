#!/usr/bin/env node
/**
 * Remove breadcrumb UI from prototype pages under src/prototypes.
 * Keeps sibling actions such as「查看需求说明」when present in breadcrumbRight.
 */
import fs from 'fs';
import path from 'path';

const ROOT = path.resolve('src/prototypes');

function walk(dir, out = []) {
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      if (name === 'node_modules' || name === '.spec') continue;
      walk(full, out);
    } else if (/\.(jsx|tsx)$/.test(name)) {
      out.push(full);
    }
  }
  return out;
}

function removeBalancedFrom(source, openIndex) {
  let i = openIndex;
  if (source[i] !== '(') return null;
  let depth = 0;
  let inStr = null;
  let escape = false;
  for (; i < source.length; i++) {
    const ch = source[i];
    if (inStr) {
      if (escape) {
        escape = false;
        continue;
      }
      if (ch === '\\') {
        escape = true;
        continue;
      }
      if (ch === inStr) inStr = null;
      continue;
    }
    if (ch === "'" || ch === '"' || ch === '`') {
      inStr = ch;
      continue;
    }
    if (ch === '(') depth++;
    else if (ch === ')') {
      depth--;
      if (depth === 0) return source.slice(openIndex, i + 1);
    }
  }
  return null;
}

function removeReactBreadcrumbCalls(source) {
  const token = 'React.createElement(Breadcrumb,';
  let result = source;
  let idx = 0;
  while ((idx = result.indexOf(token, idx)) !== -1) {
    const open = result.indexOf('(', idx);
    const chunk = removeBalancedFrom(result, open);
    if (!chunk) break;
    let start = idx;
    let end = open + chunk.length;
    while (start > 0 && /[\t ]/.test(result[start - 1])) start--;
    if (result[start - 1] === ',') start--;
    if (result[start - 1] === '\n' && result[start - 2] === ',') start--;
    while (end < result.length && /[\t ,]/.test(result[end])) end++;
    if (result[end] === '\n') end++;
    result = result.slice(0, start) + result.slice(end);
    idx = start;
  }
  return result;
}

function removeBreadcrumbImports(source) {
  return source
    .replace(/^\s*var Breadcrumb = antd\.Breadcrumb;\n/gm, '')
    .replace(/^\s*const Breadcrumb = antd\.Breadcrumb;\n/gm, '')
    .replace(/^\s*import\s+\{[^}]*\bBreadcrumb\b[^}]*\}\s+from\s+['"][^'"]+['"];\n/gm, (line) =>
      line.replace(/\bBreadcrumb,?\s*/g, '').replace(/,\s*,/g, ',').replace(/\{\s*,/g, '{').replace(/,\s*\}/g, '}').replace(/import\s+\{\s*\}\s+from[^;]+;\n/g, '')
    );
}

function removeNavBreadcrumbs(source) {
  return source.replace(
    /\n?\s*<nav[^>]*breadcrumb[^>]*>[\s\S]*?<\/nav>\n?/gi,
    '\n'
  );
}

function replaceJsxBreadcrumbBar(source) {
  // JSX: breadcrumb row with optional right actions
  return source.replace(
    /\{\/\*[\s*]*面包屑[\s*]*\*\/\}\s*\n?\s*<div style=\{styles\.breadcrumb\}>[\s\S]*?<div style=\{styles\.breadcrumbRight\}>([\s\S]*?)<\/div>\s*<\/div>/g,
    (_, right) => `\n\t\t\t<div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>${right.trim()}</div>`
  );
}

function replaceCreateElementBreadcrumbBar(source) {
  // createElement breadcrumb with Left + Right — keep Right only
  const pattern = /React\.createElement\(\s*'div',\s*\{ style: styles\.breadcrumb \},[\s\S]*?React\.createElement\(\s*'div',\s*\{ style: styles\.breadcrumbRight \},([\s\S]*?)\)\s*\)/g;
  return source.replace(
    pattern,
    (_, right) =>
      `React.createElement('div', { style: { display: 'flex', justifyContent: 'flex-end', marginBottom: 16 } }, ${right.trim()})`
  );
}

function replaceSimpleCreateElementBreadcrumb(source) {
  // div with only styles.breadcrumb path segments (no Right sibling)
  return source.replace(
    /React\.createElement\(\s*'div',\s*\{ style: styles\.breadcrumb[^}]*\},[\s\S]*?\),?\n?/g,
    ''
  );
}

function replaceLeaseContractBreadcrumbRow(source) {
  // Long inline breadcrumb + req button row
  return source.replace(
    /React\.createElement\('div',\s*\{ style: \{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 \} \},\s*React\.createElement\('div',\s*\{ style: styles\.breadcrumb[^}]+\}[\s\S]*?'查看需求说明'\)\),/g,
    (match) => {
      const req = match.match(/React\.createElement\('button'[\s\S]*?'查看需求说明'\)/);
      if (!req) return '';
      return `React.createElement('div', { style: { display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: 16 } }, ${req[0]}),`;
    }
  );
}

function removeEmptyBreadcrumbWrappers(source) {
  // div wrapper that only wrapped breadcrumb (now empty)
  return source
    .replace(
      /React\.createElement\('div',\s*\{ style: \{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 \} \},\s*\),?\n?/g,
      ''
    )
    .replace(
      /React\.createElement\('div',\s*\{ style: \{ marginBottom: 16 \} \},\s*\),?\n?/g,
      ''
    )
    .replace(
      /React\.createElement\('div',\s*\{ className: 'vpr-collect-topbar__main' \},\s*\),?\n?/g,
      ''
    );
}

function transformFile(filePath) {
  let source = fs.readFileSync(filePath, 'utf8');
  if (!/breadcrumb|Breadcrumb|面包屑/.test(source)) return false;

  const original = source;
  source = removeReactBreadcrumbCalls(source);
  source = removeBreadcrumbImports(source);
  source = removeNavBreadcrumbs(source);
  source = replaceJsxBreadcrumbBar(source);
  source = replaceCreateElementBreadcrumbBar(source);
  source = replaceSimpleCreateElementBreadcrumb(source);
  source = replaceLeaseContractBreadcrumbRow(source);
  source = removeEmptyBreadcrumbWrappers(source);

  // header with only req link after breadcrumb removed
  source = source.replace(
    /React\.createElement\(\s*'header',\s*\{ className: 'vr-page-header' \},\s*React\.createElement\(\s*Button,/g,
    `React.createElement('header', { className: 'vr-page-header', style: { display: 'flex', justifyContent: 'flex-end', marginBottom: 16 } }, React.createElement(Button,`
  );

  // flex topbar: space-between -> flex-end when breadcrumb was first child
  source = source.replace(
    /justifyContent: 'space-between', marginBottom: 16 \} \},\s*React\.createElement\(Button, \{ type: 'link'/g,
    `justifyContent: 'flex-end', marginBottom: 16 } }, React.createElement(Button, { type: 'link'`
  );

  if (source !== original) {
    fs.writeFileSync(filePath, source);
    return true;
  }
  return false;
}

const files = walk(ROOT);
let changed = 0;
for (const file of files) {
  if (transformFile(file)) {
    changed++;
    console.log('updated:', path.relative(process.cwd(), file));
  }
}

// CSS tweak for collect topbar
const vprCss = path.join(ROOT, 'vehicle-pickup-receivable/styles/index.css');
if (fs.existsSync(vprCss)) {
  let css = fs.readFileSync(vprCss, 'utf8');
  const next = css
    .replace('/* 办理页顶栏：返回 + 面包屑 */', '/* 办理页顶栏：返回 + 操作 */')
    .replace(
      /\.vm-page\.vpr-collect-page \.vpr-collect-topbar \{\n  display: flex;\n  align-items: center;\n  gap: 16px;/,
      `.vm-page.vpr-collect-page .vpr-collect-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;`
    )
    .replace(/\n\.vm-page\.vpr-collect-page \.vpr-collect-topbar__main \{[^}]+\}\n?/g, '\n');
  if (next !== css) {
    fs.writeFileSync(vprCss, next);
    console.log('updated:', path.relative(process.cwd(), vprCss));
  }
}

console.log(`\nDone. ${changed} file(s) updated.`);
