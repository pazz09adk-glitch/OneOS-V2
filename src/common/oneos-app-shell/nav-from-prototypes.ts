/**
 * 将 oneos-prototype-nav/nav-menu.json 转为羚牛 OneOS 侧栏菜单树
 */

export type NavMenuNode = {
  id: string;
  kind: 'folder' | 'item';
  title: string;
  itemKey?: string;
  children?: NavMenuNode[];
};

export type ShellMenuItem = {
  key: string;
  label: string;
  href?: string;
  children?: ShellMenuItem[];
};

type NavMenuFile = {
  prototypes?: NavMenuNode[];
};

export function itemKeyToHref(itemKey?: string): string | undefined {
  if (!itemKey) return undefined;
  if (itemKey.startsWith('/prototypes/')) return itemKey;
  if (itemKey.startsWith('prototypes/')) return `/${itemKey}`;
  return `/prototypes/${itemKey}`;
}

function convertNode(node: NavMenuNode): ShellMenuItem {
  if (node.kind === 'item') {
    return {
      key: node.id || node.itemKey || node.title,
      label: node.title,
      href: itemKeyToHref(node.itemKey),
    };
  }
  return {
    key: node.id || node.title,
    label: node.title,
    children: (node.children || []).map(convertNode),
  };
}

/** 取「OneOS」根目录下的子树作为侧栏；若无则用整棵 prototypes */
export function buildShellMenuFromNav(
  nav: NavMenuFile,
  options?: { excludeHrefs?: string[] },
): ShellMenuItem[] {
  const roots = nav.prototypes || [];
  const oneos = roots.find((n) => n.kind === 'folder' && /oneos/i.test(n.title));
  const source = oneos?.children?.length ? oneos.children : roots;
  const exclude = new Set(
    (options?.excludeHrefs ?? ['/prototypes/oneos-prototype-demo']).map((h) => h.replace(/\/$/, '')),
  );

  function filterTree(items: ShellMenuItem[]): ShellMenuItem[] {
    return items
      .map((it) => {
        if (it.href && exclude.has(it.href.replace(/\/$/, ''))) return null;
        if (it.children?.length) {
          const children = filterTree(it.children);
          if (!it.href && children.length === 0) return null;
          return { ...it, children };
        }
        return it;
      })
      .filter(Boolean) as ShellMenuItem[];
  }

  return filterTree(source.map(convertNode));
}

/** 去掉 query/hash 与尾部斜杠，供菜单高亮与路径匹配 */
export function hrefPathname(href: string): string {
  return href.split(/[?#]/)[0]!.replace(/\/$/, '') || href;
}

export function findMenuPath(
  items: ShellMenuItem[],
  activeHref: string,
  trail: ShellMenuItem[] = [],
): ShellMenuItem[] | null {
  const activePath = hrefPathname(activeHref);
  for (const item of items) {
    const next = [...trail, item];
    if (item.href) {
      const itemPath = hrefPathname(item.href);
      if (activePath === itemPath || activePath.endsWith(itemPath)) {
        return next;
      }
    }
    if (item.children?.length) {
      const hit = findMenuPath(item.children, activeHref, next);
      if (hit) return hit;
    }
  }
  return null;
}

export function collectOpenKeys(path: ShellMenuItem[]): string[] {
  return path.filter((n) => n.children?.length).map((n) => n.key);
}
