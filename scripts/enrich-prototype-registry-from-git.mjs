/**
 * 从 Git 提交历史生成/补全原型导航注册表中的详细变更日志。
 *
 * 用法：
 *   node scripts/enrich-prototype-registry-from-git.mjs
 *   node scripts/enrich-prototype-registry-from-git.mjs --prototype vehicle-h2-fee-ledger
 */
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');
const REGISTRY_PATH = path.join(projectRoot, 'src/prototypes/oneos-prototype-nav/prototype-registry.json');
const TRACKED_EXTENSIONS = new Set(['.tsx', '.ts', '.jsx', '.js', '.css', '.json', '.md', '.html']);
const IGNORED_FILE_NAMES = new Set(['prototype-registry.json', 'nav-menu.json']);
const MAX_CHANGELOG = 30;
const MAX_RECENT = 40;

function parseArgs(argv) {
  const args = { prototype: '' };
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === '--prototype' && argv[i + 1]) args.prototype = argv[++i].trim();
  }
  return args;
}

function shouldTrackFile(relativePath) {
  const base = path.basename(relativePath);
  if (IGNORED_FILE_NAMES.has(base)) return false;
  if (relativePath === 'annotation-source.json') return false;
  return TRACKED_EXTENSIONS.has(path.extname(relativePath).toLowerCase());
}

function normalizePrototypePath(filePath, prototypeId) {
  const normalized = String(filePath || '').replace(/\\/gu, '/').trim();
  const prefix = `src/prototypes/${prototypeId}/`;
  if (normalized.startsWith(prefix)) return normalized.slice(prefix.length);
  return null;
}

function parseCommitBlocks(raw) {
  const blocks = raw.split(/\n?----\n/u).map((block) => block.trim()).filter(Boolean);
  const commits = [];
  for (const block of blocks) {
    const lines = block.split('\n');
    const hash = lines[0]?.trim();
    if (!/^[0-9a-f]{7,40}$/iu.test(hash || '')) continue;
    const dateLine = lines[1]?.trim();
    const subject = lines[2]?.trim() || '';
    if (!dateLine) continue;

    const fileStart = lines.findIndex((line, index) => index > 2 && line.trim() === '');
    const bodyEnd = fileStart >= 0 ? fileStart : lines.length;
    const body = lines.slice(3, bodyEnd).join('\n').trim();
    const files = (fileStart >= 0 ? lines.slice(fileStart + 1) : [])
      .map((line) => line.trim())
      .filter(Boolean);

    commits.push({ hash, dateLine, subject, body, files });
  }
  return commits;
}

function getPrototypeCommits(prototypeId) {
  const relDir = `src/prototypes/${prototypeId}`;
  if (!fs.existsSync(path.join(projectRoot, relDir))) return [];
  let raw = '';
  try {
    raw = execSync(
      `git log --pretty=format:----%n%H%n%ci%n%s%n%b --name-only -- ${relDir}`,
      { cwd: projectRoot, encoding: 'utf8', maxBuffer: 20 * 1024 * 1024 },
    );
  } catch {
    return [];
  }
  return parseCommitBlocks(raw);
}

function formatDateParts(dateLine) {
  const match = dateLine.match(/^(\d{4})-(\d{2})-(\d{2})\s+(\d{2}):(\d{2})/u);
  if (!match) {
    const date = new Date(dateLine);
    if (Number.isNaN(date.getTime())) return { date: '1970-01-01', time: '00:00', iso: null };
    return {
      date: date.toISOString().slice(0, 10),
      time: `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`,
      iso: date.toISOString(),
    };
  }
  const [, y, m, d, hh, mm] = match;
  return {
    date: `${y}-${m}-${d}`,
    time: `${hh}:${mm}`,
    iso: new Date(`${y}-${m}-${d}T${hh}:${mm}:00+08:00`).toISOString(),
  };
}

function extractBodyLines(body) {
  return body
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line && !/^Co-authored-by:/iu.test(line))
    .map((line) => line.replace(/^[-*•]\s*/u, '').trim())
    .filter(Boolean);
}

function strictKeywords(title, prototypeId) {
  const keywords = new Set([title, prototypeId]);
  for (const part of String(title || '').split(/[·、/（）()\s「」]+/u)) {
    const trimmed = part.trim();
    if (trimmed.length >= 3) keywords.add(trimmed);
  }
  if (title.includes('氢费明细')) keywords.add('氢费明细');
  else if (title.includes('氢费')) keywords.add('氢费');
  if (title.includes('原型导航')) keywords.add('原型导航');
  if (title.includes('合同模板')) keywords.add('合同模板');
  if (title.includes('租赁合同')) keywords.add('租赁合同');
  if (title.includes('租赁业务')) keywords.add('租赁业务');
  if (title.includes('收款记录')) keywords.add('收款记录');
  if (title.includes('维修保养')) keywords.add('维修保养');
  if (title.includes('还车应结')) keywords.add('还车应结');
  return [...keywords];
}

function lineMatchesPrototype(line, title, prototypeId) {
  if (!line) return false;
  if (line.includes(title)) return true;
  if (line.toLowerCase().includes(prototypeId.toLowerCase())) return true;
  return strictKeywords(title, prototypeId).some((keyword) => (
    keyword.length >= 3 && line.includes(keyword)
  ));
}

function commitIsRelevant(commit, title, prototypeId, changedFiles, allChangedFiles, bodyLines) {
  if (changedFiles.length > 0) return true;

  const onlyAnnotation = allChangedFiles.length > 0
    && allChangedFiles.every((file) => file === 'annotation-source.json');
  const textMatches = [commit.subject, ...bodyLines].some((line) => (
    lineMatchesPrototype(line, title, prototypeId)
  ));

  if (textMatches && onlyAnnotation) return true;
  if (textMatches) return true;
  return false;
}

function summarizeFileChanges(files) {
  const notes = [];
  const prd = files.filter((f) => f.includes('.spec/') && f.endsWith('.md'));
  const comments = files.filter((f) => f.includes('prototype-comments') || f.includes('annotation-source'));
  const styles = files.filter((f) => f.endsWith('.css'));
  const logic = files.filter((f) => /\.(tsx|jsx|ts|js)$/u.test(f) && !f.endsWith('.css'));
  const data = files.filter((f) => f.includes('/data/') || f.endsWith('.json'));

  if (logic.length) {
    const names = [...new Set(logic.map((f) => path.basename(f)))].slice(0, 4);
    notes.push(`页面逻辑与交互：${names.join('、')}${logic.length > names.length ? ' 等' : ''}`);
  }
  if (styles.length) notes.push(`样式与布局：${[...new Set(styles.map((f) => path.basename(f)))].join('、')}`);
  if (prd.length) notes.push(`需求说明与 PRD：${prd.map((f) => path.basename(f)).join('、')}`);
  if (comments.length) notes.push('原型标注目录与批注说明同步');
  if (data.length) notes.push(`演示数据与配置：${data.map((f) => path.basename(f)).join('、')}`);
  return notes;
}

function buildSummary(subject, prototypeId, title, bodyLines, changedFiles, onlyAnnotation) {
  const matched = bodyLines.filter((line) => lineMatchesPrototype(line, title, prototypeId));
  if (matched.length === 1) return matched[0];
  if (matched.length > 1) return matched[0];

  const fragments = splitSubjectFragments(subject, prototypeId, title);
  if (fragments.length === 1) return fragments[0];
  if (fragments.length > 1) return fragments[0];

  if (onlyAnnotation && changedFiles.length === 0) return '原型标注目录同步';
  if (changedFiles.length) return summarizeFileChanges(changedFiles)[0] || subject;
  if (lineMatchesPrototype(subject, title, prototypeId)) return subject;

  return subject;
}

function dedupeDetails(summary, details) {
  return [...new Set(details)].filter((line) => (
    line
    && line !== summary
    && !summary.includes(line)
    && line.length > 2
  ));
}

function splitSubjectFragments(subject, prototypeId, title) {
  const segments = subject
    .split(/[；;]/u)
    .map((part) => part.trim())
    .filter(Boolean);
  const matched = segments.filter((segment) => lineMatchesPrototype(segment, title, prototypeId));
  if (!matched.length) return [];

  const fragments = [];
  for (const segment of matched) {
    const colonIndex = segment.indexOf('：');
    const tail = colonIndex >= 0 ? segment.slice(colonIndex + 1) : segment;
    tail.split(/[、,，]/u)
      .map((part) => part.trim())
      .filter((part) => part.length >= 4)
      .forEach((part) => fragments.push(part));
  }
  return [...new Set(fragments)];
}

function buildDetails(subject, bodyLines, prototypeId, title, changedFiles) {
  const details = [];
  const matched = bodyLines.filter((line) => lineMatchesPrototype(line, title, prototypeId));
  details.push(...matched);

  for (const fragment of splitSubjectFragments(subject, prototypeId, title)) {
    if (!details.includes(fragment) && fragment !== subject) details.push(fragment);
  }

  for (const note of summarizeFileChanges(changedFiles)) {
    if (!details.includes(note)) details.push(note);
  }

  if (!details.length && changedFiles.length) {
    details.push(`变更 ${changedFiles.length} 个文件`);
  }

  return details.filter((line) => line !== subject);
}

function bumpVersion(indexFromOldest) {
  return `v1.${indexFromOldest}`;
}

function buildChangelogFromGit(prototypeId, title) {
  const commits = getPrototypeCommits(prototypeId);
  if (!commits.length) return [];

  const chronological = [...commits].reverse();
  const entries = [];

  for (const commit of chronological) {
    const { date, time } = formatDateParts(commit.dateLine);
    const bodyLines = extractBodyLines(commit.body);
    const changedFiles = commit.files
      .map((file) => normalizePrototypePath(file, prototypeId))
      .filter((file) => file && shouldTrackFile(file));
    const allChangedFiles = commit.files
      .map((file) => normalizePrototypePath(file, prototypeId))
      .filter(Boolean);
    const onlyAnnotation = allChangedFiles.length > 0
      && allChangedFiles.every((file) => file === 'annotation-source.json');

    if (!commitIsRelevant(commit, title, prototypeId, changedFiles, allChangedFiles, bodyLines)) {
      continue;
    }

    const summary = buildSummary(commit.subject, prototypeId, title, bodyLines, changedFiles, onlyAnnotation);
    const details = dedupeDetails(
      summary,
      buildDetails(commit.subject, bodyLines, prototypeId, title, changedFiles),
    );

    entries.push({
      version: '',
      date,
      time,
      summary,
      details,
      commit: commit.hash.slice(0, 7),
      files: [...new Set(changedFiles)].slice(0, 12),
    });
  }

  return entries.reverse().map((entry, index, list) => ({
    ...entry,
    version: bumpVersion(list.length - index),
  }));
}

function rebuildRecentUpdates(registry) {
  const rows = [];
  for (const [prototypeId, record] of Object.entries(registry.prototypes || {})) {
    const latest = record.changelog?.[0];
    if (!latest) continue;
    rows.push({
      prototypeId,
      title: record.title || prototypeId,
      version: latest.version,
      date: latest.date,
      time: latest.time,
      summary: latest.summary,
      details: latest.details || [],
      files: latest.files || [],
      commit: latest.commit,
      _sort: `${latest.date}T${latest.time}`,
    });
  }
  rows.sort((a, b) => b._sort.localeCompare(a._sort));
  return rows.slice(0, MAX_RECENT).map(({ _sort, ...row }) => row);
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const registry = JSON.parse(fs.readFileSync(REGISTRY_PATH, 'utf8'));
  const prototypeIds = args.prototype
    ? [args.prototype]
    : Object.keys(registry.prototypes || {});

  let updated = 0;
  for (const prototypeId of prototypeIds) {
    const record = registry.prototypes[prototypeId];
    if (!record) continue;
    const changelog = buildChangelogFromGit(prototypeId, record.title || prototypeId);
    if (!changelog.length) continue;

    record.changelog = changelog.slice(0, MAX_CHANGELOG);
    record.revision = changelog.length;
    record.version = changelog[0].version;
    const latestIso = getPrototypeCommits(prototypeId)[0];
    if (latestIso) {
      const { iso } = formatDateParts(latestIso.dateLine);
      if (iso) record.lastUpdated = iso;
    }
    registry.prototypes[prototypeId] = record;
    updated += 1;
    console.log(`[git] ${prototypeId}: ${changelog.length} entries → ${changelog[0].version}`);
  }

  registry.recentUpdates = rebuildRecentUpdates(registry);
  registry.updatedAt = new Date().toISOString();
  fs.writeFileSync(REGISTRY_PATH, `${JSON.stringify(registry, null, 2)}\n`, 'utf8');
  console.log(`完成：补全 ${updated} 个原型的 Git 变更日志`);
}

main();
