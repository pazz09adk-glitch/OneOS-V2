#!/usr/bin/env node
/**
 * 将项目原型页发布到 S3（阿里云 OSS）。
 * 流程：Make Admin export-html 构建静态包 → 按页面独立前缀上传到 OSS。
 *
 * 用法：
 *   node scripts/publish-all-to-s3.mjs
 *   node scripts/publish-all-to-s3.mjs --dry-run
 *   node scripts/publish-all-to-s3.mjs --group prototypes
 *   node scripts/publish-all-to-s3.mjs --ids vehicle-management,oneos-prototype-nav
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import extract from 'extract-zip';
import { readServerInfo } from './utils/serverInfo.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');
const CONFIG_PATH = path.join(projectRoot, '.axhub/make/axhub.config.json');

function parseArgs(argv) {
  const args = {
    // 默认 oneos-v2；Make 多工程时务必传 --project-id，避免发到旧仓导致 NoSuchKey
    projectId: 'oneos-v2',
    adminOrigin: '',
    dryRun: false,
    group: 'all',
    ids: [],
    includeSource: true,
  };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--project-id' && argv[i + 1]) args.projectId = argv[++i].trim();
    else if (arg === '--admin-origin' && argv[i + 1]) args.adminOrigin = argv[++i].trim();
    else if (arg === '--group' && argv[i + 1]) args.group = argv[++i].trim();
    else if (arg === '--ids' && argv[i + 1]) {
      args.ids = argv[++i].split(',').map((id) => id.trim()).filter(Boolean);
    }
    else if (arg === '--dry-run') args.dryRun = true;
    else if (arg === '--no-source') args.includeSource = false;
  }
  return args;
}

function resolveAdminOrigin(explicit) {
  if (explicit) return explicit.replace(/\/+$/u, '');
  const info = readServerInfo(projectRoot, 'admin');
  if (info?.origin) return info.origin.replace(/\/+$/u, '');
  return 'http://localhost:53817';
}

function readS3Config() {
  const raw = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
  const s3 = raw?.cloudPublishing?.s3;
  if (!s3?.accessKeyId || !s3?.secretAccessKey || !s3?.bucket) {
    throw new Error('请在 .axhub/make/axhub.config.json 中配置 cloudPublishing.s3');
  }
  return {
    ...s3,
    pathAliases: s3.pathAliases && typeof s3.pathAliases === 'object' ? s3.pathAliases : {},
    includeSource: raw?.cloudPublishing?.publishSettings?.includeSource !== false,
  };
}

function toPublishPath(resource) {
  const raw = resource.filePath || resource.sourcePath || '';
  return String(raw).replace(/\\/gu, '/').replace(/\/index\.tsx?$/iu, '');
}

function resolveObjectPrefix(entry, pathAliases = {}) {
  const alias = pathAliases[entry.id];
  if (alias) return String(alias).replace(/^\/+|\/+$/gu, '');

  const normalized = entry.path.replace(/^\/+|\/+$/gu, '');
  const prototypeMatch = normalized.match(/^(?:src\/)?prototypes\/([^/]+)$/u);
  // 与 Make 客户端「发布到对象存储」一致：/{prototype-id}/index.html（不加 prototypes/ 前缀）
  if (prototypeMatch?.[1]) return prototypeMatch[1];
  const themeMatch = normalized.match(/^(?:src\/)?themes\/(.+)$/u);
  if (themeMatch?.[1]) return `themes/${themeMatch[1]}`;
  return entry.id;
}

/**
 * OSS 命名空间：
 * - 优先显式 s3.prefix（不推荐：Make 客户端会把它当成唯一目录，丢掉原型 id）
 * - 否则取 baseUrl 路径段（推荐：prefix 留空 + baseUrl=https://prototype.lnoneos.com/v2 → 命名空间 v2）
 */
function resolveS3Namespace(s3Config) {
  const explicit = String(s3Config?.prefix || '').replace(/^\/+|\/+$/gu, '');
  if (explicit) return explicit;
  try {
    return new URL(String(s3Config?.baseUrl || '')).pathname.replace(/^\/+|\/+$/gu, '');
  } catch {
    return '';
  }
}

/**
 * 公网链接规则：
 * - OSS 实际上传前缀 = `{namespace}/{prototypeId}`（见 publishEntry）
 * - baseUrl 若已带命名空间路径（.../v2），公网只拼 prototypeId，避免 /v2/v2/
 * - baseUrl 为域名根时，公网拼完整 objectPrefix
 */
function resolvePublicUrl(baseUrl, objectPrefix, entryPrefix = '', s3Prefix = '') {
  const base = String(baseUrl || '').replace(/\/+$/u, '');
  const ossPrefix = String(s3Prefix || '').replace(/^\/+|\/+$/gu, '');
  const protoPrefix = String(entryPrefix || '').replace(/^\/+|\/+$/gu, '');
  const fullPrefix = String(objectPrefix || '').replace(/^\/+|\/+$/gu, '');

  let pathname = '';
  try {
    pathname = new URL(base).pathname.replace(/\/+$/u, '');
  } catch {
    pathname = '';
  }
  const baseAlreadyHasOssPrefix = Boolean(
    ossPrefix && (pathname === `/${ossPrefix}` || pathname.endsWith(`/${ossPrefix}`)),
  );
  const publicPrefix = baseAlreadyHasOssPrefix
    ? (protoPrefix || fullPrefix.replace(new RegExp(`^${ossPrefix}/`), ''))
    : fullPrefix;
  const key = `${publicPrefix.replace(/^\/+|\/+$/gu, '')}/index.html`.replace(/^\/+/u, '');
  return `${base}/${key.split('/').map(encodeURIComponent).join('/')}`;
}

function guessContentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const map = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.webp': 'image/webp',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.woff2': 'font/woff2',
    '.woff': 'font/woff',
    '.txt': 'text/plain; charset=utf-8',
  };
  return map[ext] || 'application/octet-stream';
}

async function collectPublishEntries(adminOrigin, projectId, groupFilter, pathAliases = {}) {
  const res = await fetch(`${adminOrigin}/api/projects/${encodeURIComponent(projectId)}/resources`);
  if (!res.ok) {
    throw new Error(`GET /api/projects/${projectId}/resources failed: ${res.status}`);
  }
  const data = await res.json();
  const groups = groupFilter === 'all' ? ['prototypes', 'themes'] : [groupFilter];
  const entries = [];
  for (const group of groups) {
    for (const item of data.resources?.[group] || []) {
      const publishPath = toPublishPath(item);
      if (!publishPath) continue;
      entries.push({
        group,
        id: item.id,
        title: item.title || item.id,
        path: publishPath,
        prefix: resolveObjectPrefix({ path: publishPath, id: item.id }, pathAliases),
      });
    }
  }
  return entries;
}

async function exportHtmlZip(adminOrigin, projectId, entry, includeSource) {
  const params = new URLSearchParams({
    path: entry.path,
    projectId,
  });
  if (includeSource) params.set('includeSource', 'true');
  const res = await fetch(`${adminOrigin}/api/export-html?${params.toString()}`);
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    let message = text;
    try {
      message = JSON.parse(text).error || text;
    } catch {
      // keep raw text
    }
    throw new Error(message || `export-html failed (${res.status})`);
  }
  const buffer = Buffer.from(await res.arrayBuffer());
  if (buffer.length < 4 || buffer[0] !== 0x50 || buffer[1] !== 0x4b) {
    throw new Error('export-html 未返回有效 ZIP');
  }
  return buffer;
}

function resolveS3Endpoint(s3Config) {
  const bucket = String(s3Config.bucket || '').trim();
  const endpoint = String(s3Config.endpoint || '').trim().replace(/\/+$/u, '');
  const region = String(s3Config.region || 'cn-hangzhou').trim();

  if (endpoint) {
    // 配置里可能是 bucket 级域名（model-lnoneos.oss-...），AWS SDK 只需区域 endpoint。
    const bucketHostPrefix = bucket ? `${bucket}.` : '';
    if (bucketHostPrefix && endpoint.includes(bucketHostPrefix)) {
      return endpoint.replace(bucketHostPrefix, '');
    }
    return endpoint;
  }

  return `https://oss-${region}.aliyuncs.com`;
}

function createS3Client(s3Config) {
  return new S3Client({
    region: s3Config.region || 'cn-hangzhou',
    endpoint: resolveS3Endpoint(s3Config),
    forcePathStyle: false,
    credentials: {
      accessKeyId: s3Config.accessKeyId,
      secretAccessKey: s3Config.secretAccessKey,
    },
  });
}

async function uploadDirectory(client, bucket, prefix, dir) {
  const uploaded = [];
  const walk = async (currentDir, relative = '') => {
    for (const name of fs.readdirSync(currentDir)) {
      const abs = path.join(currentDir, name);
      const rel = relative ? `${relative}/${name}` : name;
      if (fs.statSync(abs).isDirectory()) {
        await walk(abs, rel);
        continue;
      }
      const key = [prefix.replace(/^\/+|\/+$/gu, ''), rel].filter(Boolean).join('/');
      await client.send(new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: fs.readFileSync(abs),
        ContentType: guessContentType(abs),
      }));
      uploaded.push(key);
    }
  };
  await walk(dir);
  return uploaded;
}

async function publishEntry(client, s3Config, adminOrigin, projectId, entry, includeSource) {
  const zipBuffer = await exportHtmlZip(adminOrigin, projectId, entry, includeSource);
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'axhub-publish-'));
  const zipPath = path.join(tempDir, 'bundle.zip');
  const extractDir = path.join(tempDir, 'site');
  fs.writeFileSync(zipPath, zipBuffer);
  fs.mkdirSync(extractDir, { recursive: true });
  await extract(zipPath, { dir: extractDir });
  const namespace = resolveS3Namespace(s3Config);
  const objectPrefix = namespace ? `${namespace}/${entry.prefix}` : entry.prefix;
  const keys = await uploadDirectory(client, s3Config.bucket, objectPrefix, extractDir);
  fs.rmSync(tempDir, { recursive: true, force: true });
  return {
    url: resolvePublicUrl(s3Config.baseUrl, objectPrefix, entry.prefix, namespace),
    fileCount: keys.length,
    keys,
  };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const adminOrigin = resolveAdminOrigin(args.adminOrigin);
  const s3Config = readS3Config();
  const includeSource = args.includeSource && s3Config.includeSource;
  let entries = await collectPublishEntries(adminOrigin, args.projectId, args.group, s3Config.pathAliases);
  if (args.ids.length > 0) {
    const idSet = new Set(args.ids);
    entries = entries.filter((entry) => idSet.has(entry.id));
    const missing = args.ids.filter((id) => !entries.some((entry) => entry.id === id));
    if (missing.length > 0) {
      throw new Error(`未找到原型: ${missing.join(', ')}`);
    }
  }

  const namespace = resolveS3Namespace(s3Config);
  console.log(`Admin: ${adminOrigin}`);
  console.log(`Bucket: ${s3Config.bucket}`);
  console.log(`Base URL: ${s3Config.baseUrl}`);
  console.log(`OSS namespace: ${namespace || '(bucket root)'}`);
  console.log(`Pages to publish: ${entries.length}`);

  if (args.dryRun) {
    for (const entry of entries) {
      const objectPrefix = namespace ? `${namespace}/${entry.prefix}` : entry.prefix;
      const url = resolvePublicUrl(s3Config.baseUrl, objectPrefix, entry.prefix, namespace);
      console.log(`[dry-run] ${entry.group}/${entry.id} -> ${objectPrefix}/index.html`);
      console.log(`           ${url}`);
    }
    return;
  }

  const client = createS3Client(s3Config);
  const results = [];
  let failed = 0;

  for (let i = 0; i < entries.length; i += 1) {
    const entry = entries[i];
    const label = `[${i + 1}/${entries.length}] ${entry.group}/${entry.id}`;
    process.stdout.write(`${label} ... `);
    try {
      const result = await publishEntry(client, s3Config, adminOrigin, args.projectId, entry, includeSource);
      console.log(`OK ${result.url} (${result.fileCount} files)`);
      results.push({ ...entry, status: 'success', ...result });
    } catch (error) {
      failed += 1;
      const message = error instanceof Error ? error.message : String(error);
      console.log(`FAIL ${message}`);
      results.push({ ...entry, status: 'failed', error: message });
    }
  }

  const reportPath = path.join(
    projectRoot,
    '.axhub/make/exports',
    `cloud.publish.s3-all-${new Date().toISOString().replace(/[:.]/gu, '-')}.json`,
  );
  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, `${JSON.stringify({
    schemaVersion: 2,
    projectId: args.projectId,
    target: 's3',
    method: 'export-html+s3-upload',
    total: entries.length,
    success: entries.length - failed,
    failed,
    completedAt: new Date().toISOString(),
    results: results.map(({ keys, ...rest }) => ({
      ...rest,
      fileCount: rest.fileCount ?? keys?.length ?? 0,
    })),
  }, null, 2)}\n`, 'utf8');

  console.log(`\nDone: ${entries.length - failed}/${entries.length} succeeded`);
  if (failed > 0) process.exitCode = 1;
  console.log(`Report: ${reportPath}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
