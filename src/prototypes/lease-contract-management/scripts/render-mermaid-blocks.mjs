import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '../../../..');
const mmdcBin = path.join(projectRoot, 'node_modules/.bin/mmdc');

const MERMAID_BLOCK_RE = /```mermaid\n([\s\S]*?)```/g;

function renderMermaidToSvg(code) {
  if (!fs.existsSync(mmdcBin)) {
    throw new Error('mmdc not found. Run: npm install -D @mermaid-js/mermaid-cli');
  }
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'lc-mermaid-'));
  const inputPath = path.join(tempDir, 'diagram.mmd');
  const outputPath = path.join(tempDir, 'diagram.svg');
  try {
    fs.writeFileSync(inputPath, code.trim(), 'utf8');
    execFileSync(
      mmdcBin,
      ['-i', inputPath, '-o', outputPath, '-b', 'transparent', '-t', 'neutral'],
      { stdio: 'pipe' },
    );
    return fs.readFileSync(outputPath, 'utf8');
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
}

function svgToMarkdownImage(svg, alt = '流程图') {
  const base64 = Buffer.from(svg, 'utf8').toString('base64');
  return `\n\n![${alt}](data:image/svg+xml;base64,${base64})\n\n`;
}

/**
 * Replace ```mermaid fenced blocks with inline SVG images (data URI).
 * Annotation markdown renderer supports ![alt](data:image/svg+xml;base64,...).
 */
export async function renderMermaidInMarkdown(markdown, alt = '流程图') {
  if (!markdown || !markdown.includes('```mermaid')) {
    return markdown;
  }

  const blocks = [];
  let match;
  const re = new RegExp(MERMAID_BLOCK_RE.source, 'g');
  while ((match = re.exec(markdown)) !== null) {
    blocks.push({ start: match.index, end: match.index + match[0].length, code: match[1] });
  }

  if (blocks.length === 0) return markdown;

  const rendered = blocks.map((block, index) => {
    try {
      const svg = renderMermaidToSvg(block.code);
      return { ...block, image: svgToMarkdownImage(svg, `${alt} ${index + 1}`) };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.warn(`[mermaid] render failed for block ${index + 1}: ${message}`);
      return {
        ...block,
        image: `\n\n> ⚠️ 流程图渲染失败：${message}\n\n\`\`\`mermaid\n${block.code}\`\`\`\n\n`,
      };
    }
  });

  let result = '';
  let cursor = 0;
  for (const block of rendered) {
    result += markdown.slice(cursor, block.start);
    result += block.image;
    cursor = block.end;
  }
  result += markdown.slice(cursor);
  return result;
}
