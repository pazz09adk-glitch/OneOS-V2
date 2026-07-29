import navMenu from './nav-menu.json';
import xllNavMenu from './xll-nav-menu.json';
import prototypeRegistry from './prototype-registry.json';
import type { LucideIcon } from 'lucide-react';
import {
  BarChart3,
  BookOpen,
  Briefcase,
  Building2,
  Car,
  FileText,
  Fuel,
  Globe,
  LayoutDashboard,
  Layers,
  Monitor,
  Shield,
  Smartphone,
  Truck,
  Wallet,
  Wrench,
} from 'lucide-react';

const CURRENT_PROTOTYPE_ID = 'oneos-prototype-nav';
const PUBLISHED_CLOUD_HOSTS = new Set(['prototype.lnoneos.com']);
/** 导航页左侧 DIRECTORY 仅展示这些一级分区（小羚羚由 xll-nav-menu.json 单独注入） */
const NAV_SIDEBAR_SECTION_TITLES = new Set(['OneOS']);

/** 与 axhub.config.json cloudPublishing.s3.pathAliases 保持一致 */
const CLOUD_PUBLISH_PATH_ALIASES: Record<string, string> = {
  'oneos-prototype-nav': 'oneos-prototype-nav',
};

function cloudPrototypeSegment(prototypeId: string): string {
  // 与 axhub.config.json cloudPublishing.s3 及 Make 发布路径一致：/{id}/index.html
  return CLOUD_PUBLISH_PATH_ALIASES[prototypeId] || prototypeId;
}

/** 对象存储静态发布站点（无 Make 本地 dev server 路由） */
export function isPublishedCloudHost(): boolean {
  if (typeof window === 'undefined') return false;
  const { hostname, pathname } = window.location;
  if (PUBLISHED_CLOUD_HOSTS.has(hostname)) return true;
  // export-html 发布页：/{prototype-id}/index.html（与 Make 对象存储发布一致）
  return /\/index\.html$/u.test(pathname);
}

export function resolvePrototypeHref(prototypeId: string): string {
  if (typeof window === 'undefined') return `/prototypes/${prototypeId}`;
  if (isPublishedCloudHost()) {
    return `${window.location.origin}/${cloudPrototypeSegment(prototypeId)}/index.html`;
  }
  return `/prototypes/${prototypeId}`;
}

function normalizeAbsoluteHref(href: string): string {
  const matches = href.match(/https?:\/\/[^\s"']+/gu);
  if (matches && matches.length > 1) return matches[0];
  return href;
}

/** 卡片/弹窗打开时按当前环境解析链接，避免静态包内 href 写死 */
export function linkHref(link: NavLinkItem): string {
  if (link.external) return normalizeAbsoluteHref(link.href);
  if (/^https?:\/\//u.test(link.href)) return normalizeAbsoluteHref(link.href);
  if (link.href.includes('#page=')) return link.href;
  return resolvePrototypeHref(link.prototypeId);
}

export interface NavLinkItem {
  id: string;
  title: string;
  href: string;
  prototypeId: string;
  version?: string;
  lastUpdatedLabel?: string;
  external?: boolean;
}

export interface PrototypeChangelogEntry {
  version: string;
  date: string;
  time: string;
  summary: string;
  details?: string[];
  commit?: string;
  files: string[];
}

export interface PrototypeRegistryRecord {
  title: string;
  version: string;
  revision: number;
  lastUpdated: string | null;
  changelog: PrototypeChangelogEntry[];
}

export interface RecentUpdateEntry extends PrototypeChangelogEntry {
  prototypeId: string;
  title: string;
}

export interface NavSubGroup {
  id: string;
  title: string;
  icon: LucideIcon;
  links: NavLinkItem[];
}

export interface NavSection {
  id: string;
  title: string;
  icon: LucideIcon;
  description: string;
  /** 直接挂在分区下的入口（无二级分组） */
  links: NavLinkItem[];
  /** 二级菜单分组 */
  subGroups: NavSubGroup[];
}

type SidebarNode = {
  id?: string;
  kind?: string;
  title?: string;
  itemKey?: string;
  children?: SidebarNode[];
};

const GROUP_ICONS: Record<string, LucideIcon> = {
  车辆资产: Car,
  运维管理: Wrench,
  业务管理: Briefcase,
  合同配置: FileText,
  加氢站管理: Fuel,
  数据分析: BarChart3,
  台账管理: BookOpen,
  财务管理: Wallet,
  主流程: LayoutDashboard,
  业务模块: Briefcase,
};

const SECTION_META: Record<string, { icon: LucideIcon; description: string }> = {
  OneOS: {
    icon: Layers,
    description: '',
  },
  小羚羚: {
    icon: Smartphone,
    description: '氢能车辆运营移动端原型；菜单与小羚羚「小程序」项目目录同步。',
  },
};

function prototypeIdFromItemKey(itemKey: string): string {
  const normalized = String(itemKey || '').trim().replace(/^\/+/u, '');
  const match = normalized.match(/^prototypes\/(.+)$/u);
  return match ? match[1] : '';
}

function registryRecord(prototypeId: string): PrototypeRegistryRecord | null {
  const record = (prototypeRegistry as { prototypes?: Record<string, PrototypeRegistryRecord> }).prototypes?.[prototypeId];
  return record || null;
}

function formatUpdatedLabel(iso: string | null | undefined): string | undefined {
  if (!iso) return undefined;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return undefined;
  return `${date.getMonth() + 1}月${date.getDate()}日`;
}

function toLink(node: SidebarNode): NavLinkItem | null {
  const prototypeId = prototypeIdFromItemKey(node.itemKey || '');
  if (!prototypeId || !node.title || prototypeId === CURRENT_PROTOTYPE_ID) return null;
  const record = registryRecord(prototypeId);
  return {
    id: node.id || prototypeId,
    title: node.title,
    href: `/prototypes/${prototypeId}`,
    prototypeId,
    version: record?.version,
    lastUpdatedLabel: formatUpdatedLabel(record?.lastUpdated),
  };
}

function iconForSubGroup(title: string): LucideIcon {
  return GROUP_ICONS[title] || Building2;
}

function iconForLink(title: string): LucideIcon {
  if (title.includes('车辆') || title.includes('车')) return Car;
  if (title.includes('氢') || title.includes('加氢')) return Fuel;
  if (title.includes('租')) return FileText;
  if (title.includes('财务') || title.includes('收款') || title.includes('结款')) return Wallet;
  if (title.includes('客户') || title.includes('供应商') || title.includes('业务')) return Briefcase;
  if (title.includes('台账') || title.includes('明细')) return BookOpen;
  if (title.includes('登录')) return Shield;
  if (title.includes('帮助')) return Globe;
  if (title.includes('工作台')) return LayoutDashboard;
  if (title.includes('运维')) return Wrench;
  if (title.includes('数据')) return BarChart3;
  if (title.includes('物流')) return Truck;
  return Monitor;
}

export { iconForLink };

function transformSection(node: SidebarNode): NavSection | null {
  if (!node.title) return null;
  const meta = SECTION_META[node.title] || {
    icon: Building2,
    description: '原型入口分组。',
  };

  const links: NavLinkItem[] = [];
  const subGroups: NavSubGroup[] = [];

  for (const child of node.children || []) {
    if (child.kind === 'item') {
      const link = toLink(child);
      if (link) links.push(link);
      continue;
    }
    if (child.kind !== 'folder' || !Array.isArray(child.children)) continue;
    const groupLinks = child.children
      .filter((item) => item.kind === 'item')
      .map((item) => toLink(item))
      .filter((item): item is NavLinkItem => Boolean(item));
    if (!groupLinks.length) continue;
    subGroups.push({
      id: child.id || child.title || `group-${subGroups.length}`,
      title: child.title || '分组',
      icon: iconForSubGroup(child.title || ''),
      links: groupLinks,
    });
  }

  if (node.kind === 'item') {
    const link = toLink(node);
    if (!link) return null;
    return {
      id: node.id || link.prototypeId,
      title: node.title,
      icon: meta.icon,
      description: meta.description,
      links: [link],
      subGroups: [],
    };
  }

  if (!links.length && !subGroups.length) return null;

  return {
    id: node.id || node.title,
    title: node.title,
    icon: meta.icon,
    description: meta.description,
    links,
    subGroups,
  };
}

export function loadNavSections(): NavSection[] {
  const prototypes = (navMenu as { prototypes?: SidebarNode[] }).prototypes || [];
  const oneosSections = prototypes
    .filter((node) => node.kind === 'folder' && NAV_SIDEBAR_SECTION_TITLES.has(String(node.title || '')))
    .map((node) => transformSection(node))
    .filter((section): section is NavSection => Boolean(section));
  const xllSection = loadXllNavSection();
  return xllSection ? [...oneosSections, xllSection] : oneosSections;
}

type XllNavMenuFile = {
  title?: string;
  sectionId?: string;
  description?: string;
  prototypeId?: string;
  hrefPrefix?: string;
  groups?: Array<{
    id: string;
    title: string;
    links: Array<{ id: string; title: string; pageId: string }>;
  }>;
};

function loadXllNavSection(): NavSection | null {
  const config = xllNavMenu as XllNavMenuFile;
  const groups = config.groups || [];
  if (!groups.length) return null;

  const meta = SECTION_META[config.title || '小羚羚'] || {
    icon: Smartphone,
    description: config.description || '小羚羚小程序原型入口。',
  };
  const hrefPrefix = String(config.hrefPrefix || '/prototypes/xll-miniapp').replace(/\/$/u, '');
  const prototypeId = config.prototypeId || 'xll-miniapp';
  const external = /^https?:\/\//u.test(hrefPrefix);

  const subGroups: NavSubGroup[] = groups.map((group) => ({
    id: group.id,
    title: group.title,
    icon: iconForSubGroup(group.title),
    links: group.links.map((link) => ({
      id: link.id,
      title: link.title,
      href: `${hrefPrefix}#page=${link.pageId}`,
      prototypeId,
      external,
    })),
  }));

  if (!subGroups.length) return null;

  return {
    id: config.sectionId || 'folder-prototypes-xll-miniapp',
    title: config.title || '小羚羚',
    icon: meta.icon,
    description: meta.description,
    links: [],
    subGroups,
  };
}

export function countNavLinks(sections: NavSection[]): number {
  return sections.reduce((total, section) => {
    const direct = section.links.length;
    const nested = section.subGroups.reduce((sum, group) => sum + group.links.length, 0);
    return total + direct + nested;
  }, 0);
}

export function flattenNavLinks(sections: NavSection[]): Array<NavLinkItem & { sectionTitle: string; groupTitle?: string }> {
  const rows: Array<NavLinkItem & { sectionTitle: string; groupTitle?: string }> = [];
  for (const section of sections) {
    for (const link of section.links) {
      rows.push({ ...link, sectionTitle: section.title });
    }
    for (const group of section.subGroups) {
      for (const link of group.links) {
        rows.push({ ...link, sectionTitle: section.title, groupTitle: group.title });
      }
    }
  }
  return rows;
}

export function loadRecentUpdates(): RecentUpdateEntry[] {
  const recent = (prototypeRegistry as { recentUpdates?: RecentUpdateEntry[] }).recentUpdates;
  return Array.isArray(recent) ? recent : [];
}

export function getRegistryUpdatedAt(): string | null {
  const updatedAt = (prototypeRegistry as { updatedAt?: string }).updatedAt;
  return updatedAt || null;
}

export function getPrototypeRegistryRecord(prototypeId: string): PrototypeRegistryRecord | null {
  return registryRecord(prototypeId);
}
