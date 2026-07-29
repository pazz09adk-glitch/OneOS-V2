import type { AnnotationSourceDocument } from '@axhub/annotation';

export const PROTOTYPE_NAV_FOLDER_ID = 'oneos-project-nav';

type DirectoryNode = {
  id?: string;
  type?: string;
  title?: string;
  markdown?: string;
  markdownId?: string;
  markdownPath?: string;
  children?: DirectoryNode[];
  payload?: { pageId?: string };
};

function isNavFolder(node: DirectoryNode | undefined): boolean {
  return node?.type === 'folder' && node.id === PROTOTYPE_NAV_FOLDER_ID;
}

function isDirectoryJumpNode(node: DirectoryNode | undefined): boolean {
  return node?.type === 'link' || node?.type === 'route';
}

function collectRoutePageIds(nodes: DirectoryNode[] | undefined): string[] {
  const pageIds: string[] = [];
  const walk = (items: DirectoryNode[] | undefined) => {
    for (const node of items || []) {
      if (node.type === 'route') {
        const pageId = String(node.payload?.pageId || '').trim();
        if (pageId) pageIds.push(pageId);
      }
      if (node.type === 'folder' && Array.isArray(node.children)) {
        walk(node.children);
      }
    }
  };
  walk(nodes);
  return pageIds;
}

function folderMatchesPage(folder: DirectoryNode, currentPageId?: string): boolean {
  if (!currentPageId) return true;
  const pageIds = collectRoutePageIds(folder.children);
  if (!pageIds.length) return true;
  return pageIds.includes(currentPageId);
}

function filterDirectoryNodesForAnnotationPanel(
  nodes: DirectoryNode[] | undefined,
  currentPageId?: string,
): DirectoryNode[] {
  const result: DirectoryNode[] = [];

  for (const node of nodes || []) {
    if (isNavFolder(node) || isDirectoryJumpNode(node)) continue;

    if (node.type === 'markdown') {
      result.push(node);
      continue;
    }

    if (node.type === 'folder') {
      if (!folderMatchesPage(node, currentPageId)) continue;
      const children = filterDirectoryNodesForAnnotationPanel(node.children, currentPageId);
      if (!children.length) continue;
      result.push({
        ...node,
        children,
      });
    }
  }

  return result;
}

/** 供右侧「原型标注」目录使用：保留 PRD 分节，去除导航与页面跳转节点 */
export function buildAnnotationViewerSource(
  source: AnnotationSourceDocument,
  currentPageId?: string,
): AnnotationSourceDocument {
  const nodes = filterDirectoryNodesForAnnotationPanel(
    source.directory?.nodes as DirectoryNode[] | undefined,
    currentPageId,
  );

  return {
    ...source,
    directory: { nodes },
  };
}

export function stripPrototypeNavFromDirectoryNodes(
  nodes: DirectoryNode[] | undefined,
): DirectoryNode[] {
  return (nodes || [])
    .filter((node) => !isNavFolder(node))
    .map((node) => {
      if (node.type !== 'folder' || !Array.isArray(node.children)) return node;
      return {
        ...node,
        children: stripPrototypeNavFromDirectoryNodes(node.children),
      };
    });
}
