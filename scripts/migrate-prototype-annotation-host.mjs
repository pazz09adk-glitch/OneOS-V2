/**
 * 将原型 index.tsx 中的 AnnotationViewer 迁移为 PrototypeAnnotationHost。
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');
const prototypesRoot = path.join(projectRoot, 'src/prototypes');
const hostImport = "import { PrototypeAnnotationHost } from '../../common/prototype-annotation-host';";

function listIndexFiles() {
  return fs.readdirSync(prototypesRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => path.join(prototypesRoot, entry.name, 'index.tsx'))
    .filter((filePath) => fs.existsSync(filePath))
    .filter((filePath) => fs.readFileSync(filePath, 'utf8').includes('AnnotationViewer'));
}

function migrateFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  if (!content.includes('AnnotationViewer')) return false;
  if (content.includes('PrototypeAnnotationHost')) {
    console.log(`[skip] ${path.relative(projectRoot, filePath)}`);
    return false;
  }

  content = content.replace(
    /import\s*\{([^}]*)\}\s*from\s*'@axhub\/annotation';/u,
    (match, importsBlock) => {
      const cleaned = importsBlock
        .split(',')
        .map((item) => item.trim())
        .filter((item) => item && item !== 'AnnotationViewer')
        .join(',\n  ');
      return `import {\n  ${cleaned}\n} from '@axhub/annotation';`;
    },
  );

  if (!content.includes(hostImport)) {
    content = content.replace(
      /\} from '@axhub\/annotation';/u,
      `} from '@axhub/annotation';\n${hostImport}`,
    );
  }

  content = content
    .replace(/<AnnotationViewer\b/gu, '<PrototypeAnnotationHost')
    .replace(/<\/AnnotationViewer>/gu, '</PrototypeAnnotationHost>')
    .replace(/React\.createElement\(AnnotationViewer,/gu, 'React.createElement(PrototypeAnnotationHost,');

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`[migrate] ${path.relative(projectRoot, filePath)}`);
  return true;
}

let changed = 0;
for (const filePath of listIndexFiles()) {
  if (migrateFile(filePath)) changed += 1;
}
console.log(`完成：迁移 ${changed} 个 index.tsx`);
