import './oneos-app-shell.css';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ChevronDown,
  ChevronRight,
  LayoutDashboard,
  Menu,
  Moon,
  Sun,
  PanelLeftClose,
  RefreshCw,
  Search,
  Maximize,
  X,
  Sparkles,
  Settings,
  type LucideIcon,
  FolderOpen,
  FileText,
  Truck,
  Shield,
  Wallet,
  Fuel,
  BatteryCharging,
  Users,
  Workflow,
  ClipboardList,
  BarChart3,
  Wrench,
} from 'lucide-react';
import navMenuJson from '../../prototypes/oneos-prototype-nav/nav-menu.json';
import {
  buildShellMenuFromNav,
  collectOpenKeys,
  findMenuPath,
  hrefPathname,
  type ShellMenuItem,
} from './nav-from-prototypes';
import {
  applyRuoYiSettingsToDocument,
  syncRuoYiSettingsToAllIframes,
  type OneOsTheme,
} from './theme';
import {
  RuoYiSettingsDrawer,
  readStoredRuoYiSettings,
  persistRuoYiSettings,
  DEFAULT_RUOYI_SETTINGS,
  type RuoYiSettings,
} from './RuoYiSettingsDrawer';
import { ShellNoticeCenter } from './ShellNoticeCenter';
import {
  isNoticesSync,
  postNoticeAction,
  type ShellNoticeItem,
} from './notice-bridge';

const AVATAR_URL = 'https://unpkg.com/@vbenjs/static-source@0.1.7/source/avatar-v1.webp';

/** 演示壳自身，不在内容区嵌套打开 */
export const PROTOTYPE_DEMO_HREF = '/prototypes/oneos-prototype-demo';

function iconForLabel(label: string): LucideIcon {
  if (/原型演示|工作台/.test(label)) return LayoutDashboard;
  if (/审批/.test(label)) return ClipboardList;
  if (/车辆|运维|资产/.test(label)) return Truck;
  if (/安全/.test(label)) return Shield;
  if (/财务|应收|收款|应结/.test(label)) return Wallet;
  if (/加氢|氢/.test(label)) return Fuel;
  if (/充电/.test(label)) return BatteryCharging;
  if (/用户|客户|机构|角色|部门/.test(label)) return Users;
  if (/工作流|流程/.test(label)) return Workflow;
  if (/系统|菜单|字典|参数|日志/.test(label)) return Settings;
  if (/BI|统计|分析|台账|明细|盈亏|回款/.test(label)) return BarChart3;
  if (/合同|业务|保险|供应商/.test(label)) return FileText;
  if (/任务|工单|调度/.test(label)) return Wrench;
  if (/配置|模板/.test(label)) return FolderOpen;
  return FolderOpen;
}

export type ShellTab = {
  href: string;
  title: string;
};

export type OneOsAppShellProps = {
  children: React.ReactNode;
  activeHref?: string;
  pageTitle?: string;
  breadcrumb?: string[];
  /** 自定义导航：用于演示壳在内容区切换；不传则整页跳转 */
  onNavigate?: (item: ShellMenuItem) => void;
  /** 多页签（演示壳） */
  tabs?: ShellTab[];
  onTabSelect?: (href: string) => void;
  onTabClose?: (href: string) => void;
  onRefresh?: () => void;
  brandHref?: string;
  /** 原型外壳演示：顶栏「版本更新」图标，打开更新日志 */
  onOpenReleaseNotes?: () => void;
  /** 是否有未读版本更新（显示角标） */
  releaseNotesUnread?: boolean;
};

export function OneOsAppShell({
  children,
  activeHref = PROTOTYPE_DEMO_HREF,
  pageTitle = '原型演示',
  breadcrumb,
  onNavigate: onNavigateProp,
  tabs,
  onTabSelect,
  onTabClose,
  onRefresh,
  brandHref = PROTOTYPE_DEMO_HREF,
  onOpenReleaseNotes,
  releaseNotesUnread = false,
}: OneOsAppShellProps) {
  const menu = useMemo(
    () => buildShellMenuFromNav(navMenuJson as Parameters<typeof buildShellMenuFromNav>[0]),
    [],
  );
  const path = useMemo(() => findMenuPath(menu, activeHref) || [], [menu, activeHref]);
  const [collapsed, setCollapsed] = useState(false);
  const [openKeys, setOpenKeys] = useState<string[]>(() => collectOpenKeys(path));
  
  // RuoYi 偏好设置
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [ruoyiSettings, setRuoyiSettings] = useState<RuoYiSettings>(() => readStoredRuoYiSettings());

  const [shellNotices, setShellNotices] = useState<ShellNoticeItem[]>([]);
  const [shellUnread, setShellUnread] = useState(0);

  // 计算当前主题浅暗模式
  const isDark = useMemo(() => {
    if (ruoyiSettings.themeMode === 'dark') return true;
    if (ruoyiSettings.themeMode === 'light') return false;
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  }, [ruoyiSettings.themeMode]);

  const currentTheme: OneOsTheme = isDark ? 'dark' : 'light';

  // 当设置更新时应用到父 DOM 并同步到所有 iframe
  useEffect(() => {
    persistRuoYiSettings(ruoyiSettings);
    applyRuoYiSettingsToDocument(document, ruoyiSettings);
    syncRuoYiSettingsToAllIframes(ruoyiSettings);
  }, [ruoyiSettings]);

  // 监听新加载或切换的 iframe，确保 onload 时样式被完整注入
  useEffect(() => {
    const syncIframes = () => {
      const frames = document.querySelectorAll<HTMLIFrameElement>('.oneos-shell-frame, iframe');
      frames.forEach((frame) => {
        const handleLoad = () => {
          try {
            if (frame.contentDocument) {
              applyRuoYiSettingsToDocument(frame.contentDocument, ruoyiSettings);
            }
          } catch {
            /* ignore cross-origin error */
          }
        };

        frame.removeEventListener('load', handleLoad);
        frame.addEventListener('load', handleLoad);

        if (frame.contentDocument && frame.contentDocument.readyState === 'complete') {
          handleLoad();
        }
      });
    };

    syncIframes();
    const timer = setTimeout(syncIframes, 300);
    return () => clearTimeout(timer);
  }, [activeHref, ruoyiSettings]);

  useEffect(() => {
    const onMsg = (e: MessageEvent) => {
      if (!isNoticesSync(e.data)) return;
      setShellNotices(e.data.notices);
      setShellUnread(e.data.unreadCount);
    };
    window.addEventListener('message', onMsg);
    return () => window.removeEventListener('message', onMsg);
  }, []);

  useEffect(() => {
    setShellNotices([]);
    setShellUnread(0);
  }, [activeHref]);

  const frameWindow = useCallback((): Window | null => {
    if (typeof document === 'undefined') return null;
    const frame = document.querySelector<HTMLIFrameElement>('.oneos-shell-frame');
    return frame?.contentWindow || null;
  }, []);

  const onNoticeRead = useCallback(
    (notice: ShellNoticeItem) => {
      setShellNotices((prev) =>
        prev.map((n) => (n.id === notice.id ? { ...n, read: true } : n)),
      );
      setShellUnread((c) => Math.max(0, c - (notice.read ? 0 : 1)));
      const win = frameWindow();
      if (win) postNoticeAction(win, 'read', notice.id);
    },
    [frameWindow],
  );

  const onNoticeOpen = useCallback(
    (notice: ShellNoticeItem) => {
      const win = frameWindow();
      if (win) postNoticeAction(win, 'open', notice.id);
    },
    [frameWindow],
  );

  const onNoticeHandle = useCallback(
    (notice: ShellNoticeItem) => {
      setShellNotices((prev) =>
        prev.map((n) => (n.id === notice.id ? { ...n, read: true } : n)),
      );
      setShellUnread((c) => Math.max(0, c - (notice.read ? 0 : 1)));
      const win = frameWindow();
      if (win) postNoticeAction(win, 'handle', notice.id);
    },
    [frameWindow],
  );

  useEffect(() => {
    setOpenKeys((prev) => {
      const next = collectOpenKeys(path);
      return Array.from(new Set([...prev, ...next]));
    });
  }, [path]);

  const toggleTheme = useCallback(() => {
    setRuoyiSettings((prev) => ({
      ...prev,
      themeMode: isDark ? 'light' : 'dark',
    }));
  }, [isDark]);

  const crumbs = breadcrumb?.length
    ? breadcrumb
    : path.length
      ? path.map((p) => p.label)
      : ['OneOS', pageTitle];

  const selectedKey = path[path.length - 1]?.key;
  const showTabs = Array.isArray(tabs);

  const handleNavigate = useCallback(
    (item: ShellMenuItem) => {
      if (onNavigateProp) {
        onNavigateProp(item);
        return;
      }
      if (item.href && typeof window !== 'undefined') {
        window.location.href = item.href;
      }
    },
    [onNavigateProp],
  );

  const onNoticeViewAll = useCallback(() => {
    handleNavigate({
      key: 'message-center',
      label: '消息中心',
      href: '/prototypes/message-center',
    });
  }, [handleNavigate]);

  const toggleOpen = useCallback((key: string) => {
    setOpenKeys((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));
  }, []);

  const renderItems = (items: ShellMenuItem[], level = 0): React.ReactNode =>
    items.map((item) => {
      const hasChildren = !!item.children?.length;
      const opened = openKeys.includes(item.key);
      const selected =
        item.key === selectedKey ||
        (!!item.href && hrefPathname(item.href) === hrefPathname(activeHref));
      const Icon = iconForLabel(item.label);

      return (
        <li key={item.key} className={`oneos-shell-menu__item oneos-shell-menu__item--lv${level}`}>
          <button
            type="button"
            className={`oneos-shell-menu__btn${selected ? ' is-active' : ''}${hasChildren ? ' is-parent' : ''}`}
            title={item.label}
            aria-expanded={hasChildren ? opened : undefined}
            onClick={() => {
              if (hasChildren) toggleOpen(item.key);
              else handleNavigate(item);
            }}
          >
            <Icon className="oneos-shell-menu__icon" size={16} strokeWidth={1.75} aria-hidden />
            {!collapsed && <span className="oneos-shell-menu__label">{item.label}</span>}
            {!collapsed && hasChildren && (
              <span className="oneos-shell-menu__arrow" aria-hidden>
                {opened ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </span>
            )}
          </button>
          {!collapsed && hasChildren && opened && (
            <ul className="oneos-shell-menu__sub">{renderItems(item.children!, level + 1)}</ul>
          )}
        </li>
      );
    });

  return (
    <div
      className={`oneos-shell${collapsed ? ' oneos-shell--collapsed' : ''}${ruoyiSettings.darkSidebar ? ' oneos-shell--dark-sidebar' : ''}${ruoyiSettings.darkNavbar ? ' oneos-shell--dark-navbar' : ''}`}
      data-oneos-theme={currentTheme}
      data-ds-mode={currentTheme}
    >
      <aside className="oneos-shell-aside" aria-label="羚牛 OneOS 导航">
        <div className="oneos-shell-brand">
          <a className="oneos-shell-brand__link" href={brandHref} title="羚牛OneOS">
            <span className="oneos-shell-brand__mark" aria-hidden>
              <svg viewBox="0 0 32 32" width="28" height="28">
                <defs>
                  <linearGradient id="oneosBrandGrad" x1="0" y1="0" x2="32" y2="32">
                    <stop offset="0%" stopColor="var(--oneos-primary, #533AFD)" />
                    <stop offset="100%" stopColor="var(--ln-primary-hover, #6346FF)" />
                  </linearGradient>
                </defs>
                <rect width="32" height="32" rx="9" fill="url(#oneosBrandGrad)" />
                <path
                  d="M8 20.5L12.2 9h3.1l4.2 11.5h-3.1l-.8-2.3h-4.7l-.8 2.3H8zm4.2-4.7h3.2L14 11.2h-.1L12.2 15.8zM21 9h2.8v11.5H21V9z"
                  fill="#fff"
                />
              </svg>
            </span>
            {!collapsed && <span className="oneos-shell-brand__text">羚牛OneOS</span>}
          </a>
        </div>
        <nav className="oneos-shell-nav">
          <ul className="oneos-shell-menu">{renderItems(menu)}</ul>
        </nav>
      </aside>

      <div className="oneos-shell-main">
        <div className="oneos-shell-chrome">
          <header className="oneos-shell-header">
            <div className="oneos-shell-header__left">
              <button
                type="button"
                className="oneos-shell-icon-btn"
                aria-label={collapsed ? '展开侧栏' : '收起侧栏'}
                onClick={() => setCollapsed((v) => !v)}
              >
                {collapsed ? <Menu size={18} /> : <PanelLeftClose size={18} />}
              </button>
              <button
                type="button"
                className="oneos-shell-icon-btn"
                aria-label="刷新"
                onClick={() => (onRefresh ? onRefresh() : window.location.reload())}
              >
                <RefreshCw size={16} />
              </button>
              <nav className="oneos-shell-breadcrumb" aria-label="面包屑">
                <ol>
                  {crumbs.map((c, i) => (
                    <li key={`${c}-${i}`}>
                      {i > 0 && <span className="oneos-shell-breadcrumb__sep">/</span>}
                      <span className={i === crumbs.length - 1 ? 'is-current' : undefined}>{c}</span>
                    </li>
                  ))}
                </ol>
              </nav>
            </div>
            <div className="oneos-shell-header__right">
              <label className="oneos-shell-search">
                <Search size={14} aria-hidden />
                <input type="search" placeholder="搜索" aria-label="搜索" />
                <kbd>⌘ K</kbd>
              </label>

              {/* ⚙️ 若依偏好设置按钮 */}
              <button
                type="button"
                className="oneos-shell-icon-btn"
                aria-label="偏好设置"
                title="若依偏好设置"
                onClick={() => setSettingsOpen(true)}
              >
                <Settings size={16} />
              </button>

              {onOpenReleaseNotes ? (
                <button
                  type="button"
                  className={`oneos-shell-release-btn${releaseNotesUnread ? ' has-unread' : ''}`}
                  onClick={onOpenReleaseNotes}
                  aria-label="版本更新"
                  title="版本更新日志"
                  data-annotation-id="shell-release-notes"
                >
                  <span className="oneos-shell-release-btn__ring" aria-hidden />
                  <span className="oneos-shell-release-btn__icon" aria-hidden>
                    <Sparkles size={16} strokeWidth={2.25} />
                  </span>
                  {releaseNotesUnread ? (
                    <span className="oneos-shell-release-btn__dot" aria-hidden />
                  ) : null}
                </button>
              ) : null}
              <button
                type="button"
                className="oneos-shell-icon-btn"
                aria-label={currentTheme === 'dark' ? '切换浅色模式' : '切换暗色模式'}
                title={currentTheme === 'dark' ? '浅色模式' : '暗色模式'}
                onClick={toggleTheme}
              >
                {currentTheme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
              </button>
              <button type="button" className="oneos-shell-icon-btn" aria-label="全屏" title="全屏（演示）">
                <Maximize size={16} />
              </button>
              <ShellNoticeCenter
                notices={shellNotices}
                unreadCount={shellUnread}
                onRead={onNoticeRead}
                onOpen={onNoticeOpen}
                onHandle={onNoticeHandle}
                onViewAll={onNoticeViewAll}
              />
              <button type="button" className="oneos-shell-avatar" aria-label="超级管理员">
                <img src={AVATAR_URL} alt="" width={28} height={28} />
              </button>
            </div>
          </header>

          {showTabs && tabs!.length > 0 && (
            <div className="oneos-shell-tabs" role="tablist" aria-label="打开的页签">
              {tabs!.map((tab) => {
                const active = hrefPathname(tab.href) === hrefPathname(activeHref);
                return (
                  <div
                    key={tab.href}
                    className={`oneos-shell-tab${active ? ' is-active' : ''}`}
                    role="tab"
                    aria-selected={active}
                  >
                    <button
                      type="button"
                      className="oneos-shell-tab__label"
                      onClick={() => onTabSelect?.(tab.href)}
                    >
                      {tab.title}
                    </button>
                    {onTabClose && (
                      <button
                        type="button"
                        className="oneos-shell-tab__close"
                        aria-label={`关闭 ${tab.title}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onTabClose(tab.href);
                        }}
                      >
                        <X size={12} />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="oneos-shell-content">{children}</div>
      </div>

      {/* 若依偏好设置 Drawer 面板 */}
      <RuoYiSettingsDrawer
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        settings={ruoyiSettings}
        onChange={setRuoyiSettings}
        onReset={() => setRuoyiSettings(DEFAULT_RUOYI_SETTINGS)}
      />
    </div>
  );
}

export default OneOsAppShell;
