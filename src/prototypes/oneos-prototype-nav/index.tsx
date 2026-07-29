/**
 * @name 原型导航
 * ONE-OS 原型目录导航：按菜单分组快速进入各功能原型
 */
import './style.css';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  ArrowUpRight,
  Clock3,
  ExternalLink,
  FileCode2,
  History,
  LayoutGrid,
  Lock,
  Search,
  X,
  Zap,
} from 'lucide-react';
import {
  countNavLinks,
  flattenNavLinks,
  getPrototypeRegistryRecord,
  getRegistryUpdatedAt,
  iconForLink,
  loadNavSections,
  loadRecentUpdates,
  resolvePrototypeHref,
  linkHref,
  type NavLinkItem,
  type NavSection,
  type NavSubGroup,
  type PrototypeChangelogEntry,
  type PrototypeRegistryRecord,
  type RecentUpdateEntry,
} from './nav-data';

function formatRecordUpdatedAt(record: PrototypeRegistryRecord | null): string | undefined {
  if (record?.lastUpdated) {
    const date = new Date(record.lastUpdated);
    if (!Number.isNaN(date.getTime())) {
      return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      });
    }
  }
  const latest = record?.changelog?.[0];
  if (latest) {
    const time = latest.time.length === 5 ? `${latest.time}:00` : latest.time;
    return `${latest.date.replace(/-/g, '/')} ${time}`;
  }
  return undefined;
}

function linkMeta(record: PrototypeRegistryRecord | null): string | undefined {
  const updatedAt = formatRecordUpdatedAt(record);
  if (updatedAt) return `${updatedAt} 更新`;
  return undefined;
}

function sidebarSectionLabel(section: NavSection): string {
  if (section.title === '小羚羚') return '小羚羚「小程序」';
  return section.title;
}

function sectionIdFromHash(): string | null {
  const match = window.location.hash.match(/^#opn-section-(.+)$/u);
  return match ? match[1] : null;
}

function resolveInitialSectionId(sections: NavSection[]): string {
  const fromHash = sectionIdFromHash();
  if (fromHash && sections.some((section) => section.id === fromHash)) return fromHash;
  return sections[0]?.id || '';
}

const NEW_TAB_LINK_PROPS = {
  target: '_blank',
  rel: 'noopener noreferrer',
} as const;

const AUTH_STORAGE_KEY = 'oneos-prototype-nav-auth';
const NAV_ACCESS_PASSWORD = 'lingniu';

function readAuthSession(): boolean {
  try {
    return sessionStorage.getItem(AUTH_STORAGE_KEY) === 'ok';
  } catch {
    return false;
  }
}

function writeAuthSession(): void {
  try {
    sessionStorage.setItem(AUTH_STORAGE_KEY, 'ok');
  } catch {
    /* ignore quota / private mode */
  }
}

function PasswordGate({ onUnlock }: { onUnlock: () => void }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');

    window.setTimeout(() => {
      if (password === NAV_ACCESS_PASSWORD) {
        writeAuthSession();
        onUnlock();
        return;
      }
      setError('密码不正确，请重试');
      setSubmitting(false);
      inputRef.current?.focus();
      inputRef.current?.select();
    }, 120);
  };

  return (
    <div className="opn-gate" data-annotation-id="opn-password-gate">
      <div className="opn-gate-card" role="dialog" aria-modal="true" aria-labelledby="opn-gate-title">
        <span className="opn-gate-icon" aria-hidden>
          <Lock size={22} strokeWidth={1.75} />
        </span>
        <p className="opn-gate-eyebrow">Restricted Access</p>
        <h1 id="opn-gate-title" className="opn-gate-title">原型导航</h1>
        <p className="opn-gate-lead">仅供「数智部」开发团队使用，无法访问请联系「王冕」</p>

        <form className="opn-gate-form" onSubmit={handleSubmit}>
          <div className="opn-gate-field">
            <label className="opn-gate-label" htmlFor="opn-gate-password">
              访问密码
            </label>
            <input
              ref={inputRef}
              id="opn-gate-password"
              className={`opn-gate-input${error ? ' opn-gate-input--error' : ''}`}
              type="password"
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                if (error) setError('');
              }}
              placeholder="请输入密码"
              autoComplete="current-password"
              aria-invalid={Boolean(error)}
              aria-describedby={error ? 'opn-gate-error' : undefined}
              disabled={submitting}
            />
          </div>
          {error && (
            <p id="opn-gate-error" className="opn-gate-error" role="alert">
              {error}
            </p>
          )}
          <button type="submit" className="opn-gate-submit" disabled={submitting || !password.trim()}>
            {submitting ? '验证中…' : '进入导航'}
          </button>
        </form>
      </div>
    </div>
  );
}

function NavLinkCard({
  link,
  meta,
  onSelect,
}: {
  link: NavLinkItem;
  meta?: string;
  onSelect: (link: NavLinkItem) => void;
}) {
  const Icon = iconForLink(link.title);
  const record = getPrototypeRegistryRecord(link.prototypeId);
  const metaText = meta ?? linkMeta(record);
  const version = link.version || record?.version;

  return (
    <button
      type="button"
      className="opn-link-card"
      onClick={() => onSelect(link)}
      aria-label={`查看 ${link.title} 的变更日志`}
      data-annotation-id={`opn-link-${link.prototypeId}-${link.id}`}
    >
      <span className="opn-link-card-icon" aria-hidden>
        <Icon size={18} strokeWidth={1.75} />
      </span>
      <span className="opn-link-card-body">
        <span className="opn-link-card-title-row">
          <span className="opn-link-card-title">{link.title}</span>
          {version && <span className="opn-link-card-version">{version}</span>}
        </span>
        {metaText && <span className="opn-link-card-meta">{metaText}</span>}
      </span>
      <ArrowUpRight size={16} className="opn-link-card-arrow" aria-hidden />
    </button>
  );
}

function SubGroupPanel({
  group,
  onSelectLink,
}: {
  group: NavSubGroup;
  onSelectLink: (link: NavLinkItem) => void;
}) {
  const Icon = group.icon;
  return (
    <div className="opn-subgroup" data-annotation-id={`opn-group-${group.id}`}>
      <header className="opn-subgroup-header">
        <span className="opn-subgroup-icon" aria-hidden>
          <Icon size={16} strokeWidth={1.75} />
        </span>
        <h3>{group.title}</h3>
        <span className="opn-subgroup-count">共{group.links.length}个原型</span>
      </header>
      <div className="opn-link-grid">
        {group.links.map((link) => (
          <NavLinkCard key={link.id} link={link} onSelect={onSelectLink} />
        ))}
      </div>
    </div>
  );
}

function SectionBlock({
  section,
  onSelectLink,
}: {
  section: NavSection;
  onSelectLink: (link: NavLinkItem) => void;
}) {
  const Icon = section.icon;
  const linkCount = section.links.length
    + section.subGroups.reduce((sum, group) => sum + group.links.length, 0);

  return (
    <section
      className="opn-section"
      id={`opn-section-${section.id}`}
      data-annotation-id={`opn-section-${section.id}`}
    >
      <header className="opn-section-header">
        <div className="opn-section-heading">
          <span className="opn-section-icon" aria-hidden>
            <Icon size={20} strokeWidth={1.75} />
          </span>
          <div>
            <div className="opn-section-title-row">
              <h2>{section.title}</h2>
              <span className="opn-section-badge">{linkCount}个原型页</span>
            </div>
            {section.description && <p>{section.description}</p>}
          </div>
        </div>
      </header>

      {section.links.length > 0 && (
        <div className="opn-link-grid opn-link-grid--featured">
          {section.links.map((link) => (
            <NavLinkCard key={link.id} link={link} onSelect={onSelectLink} />
          ))}
        </div>
      )}

      {section.subGroups.length > 0 && (
        <div className="opn-subgroup-stack">
          {section.subGroups.map((group) => (
            <SubGroupPanel key={group.id} group={group} onSelectLink={onSelectLink} />
          ))}
        </div>
      )}
    </section>
  );
}

function ChangelogEntryRow({
  entry,
  isLatest,
}: {
  entry: PrototypeChangelogEntry;
  isLatest?: boolean;
}) {
  return (
    <li className={`opn-changelog-item${isLatest ? ' opn-changelog-item--latest' : ''}`}>
      <div className="opn-changelog-rail" aria-hidden>
        <span className="opn-changelog-dot" />
      </div>
      <div className="opn-changelog-content">
        <div className="opn-changelog-item-head">
          <span className="opn-changelog-version">{entry.version}</span>
          <time className="opn-changelog-time" dateTime={`${entry.date}T${entry.time}`}>
            {entry.date}
            {' '}
            {entry.time}
          </time>
        </div>
        <p className="opn-changelog-summary">{entry.summary}</p>
        {entry.details && entry.details.length > 0 && (
          <ul className="opn-changelog-details">
            {entry.details.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        )}
        {entry.files.length > 0 && (
          <details className="opn-changelog-files">
            <summary>
              <FileCode2 size={14} aria-hidden />
              变更文件
              <span className="opn-changelog-files-count">{entry.files.length}</span>
            </summary>
            <ul>
              {entry.files.map((file) => (
                <li key={file}>{file}</li>
              ))}
            </ul>
          </details>
        )}
      </div>
    </li>
  );
}

function ChangelogDetailPanel({
  link,
  onClose,
}: {
  link: NavLinkItem;
  onClose: () => void;
}) {
  const record = getPrototypeRegistryRecord(link.prototypeId);
  const changelog = record?.changelog || [];
  const Icon = iconForLink(link.title);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.requestAnimationFrame(() => panelRef.current?.focus());
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  return (
    <div className="opn-detail-overlay" role="presentation" onClick={onClose}>
      <div
        ref={panelRef}
        className="opn-detail-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="opn-detail-title"
        tabIndex={-1}
        onClick={(event) => event.stopPropagation()}
        data-annotation-id={`opn-detail-${link.prototypeId}`}
      >
        <header className="opn-detail-header">
          <div className="opn-detail-heading">
            <span className="opn-detail-icon" aria-hidden>
              <Icon size={20} strokeWidth={1.75} />
            </span>
            <div>
              <p className="opn-detail-eyebrow">Prototype Changelog</p>
              <h2 id="opn-detail-title">{link.title}</h2>
              <p className="opn-detail-subtitle">
                <span className="opn-detail-version">{record?.version || link.version || 'v1.0'}</span>
                {record?.lastUpdated && (
                  <>
                    <span className="opn-detail-dot" aria-hidden>·</span>
                    <Clock3 size={13} aria-hidden />
                    {new Date(record.lastUpdated).toLocaleString('zh-CN', {
                      month: 'numeric',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </>
                )}
              </p>
            </div>
          </div>
          <div className="opn-detail-toolbar">
            <a
              className="opn-detail-open-btn"
              href={linkHref(link)}
              {...NEW_TAB_LINK_PROPS}
              aria-label={`查看 ${link.title} 原型（在新标签页打开）`}
            >
              查看原型
              <ExternalLink size={14} strokeWidth={1.75} aria-hidden />
            </a>
            <button
              type="button"
              className="opn-detail-close"
              onClick={onClose}
              aria-label="关闭变更日志"
            >
              <X size={18} aria-hidden />
            </button>
          </div>
        </header>

        <div className="opn-detail-body">
          <section className="opn-detail-section" aria-labelledby="opn-changelog-title">
            <header className="opn-detail-section-header">
              <History size={16} aria-hidden />
              <h3 id="opn-changelog-title">变更日志与历史记录</h3>
            </header>
            {changelog.length > 0 ? (
              <ol className="opn-changelog-list">
                {changelog.map((entry, index) => (
                  <ChangelogEntryRow
                    key={`${entry.version}-${entry.date}-${entry.time}`}
                    entry={entry}
                    isLatest={index === 0}
                  />
                ))}
              </ol>
            ) : (
              <p className="opn-detail-empty">
                暂无自动记录的变更日志。原型更新并保存后，将在此展示版本说明与历史记录。
              </p>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

function RecentUpdatesPanel({
  updates,
  onSelectLink,
}: {
  updates: RecentUpdateEntry[];
  onSelectLink: (link: NavLinkItem) => void;
}) {
  if (!updates.length) return null;
  return (
    <section className="opn-updates" data-annotation-id="opn-recent-updates" aria-labelledby="opn-updates-title">
      <header className="opn-updates-header">
        <div>
          <p className="opn-updates-eyebrow">Activity</p>
          <h2 id="opn-updates-title">最近更新</h2>
        </div>
        <p>点击条目查看完整变更说明；右上角可在新标签页打开原型</p>
      </header>
      <ol className="opn-updates-list">
        {updates.map((item) => (
          <li key={`${item.prototypeId}-${item.version}-${item.date}-${item.time}`} className="opn-updates-item">
            <button
              type="button"
              className="opn-updates-link"
              onClick={() => onSelectLink({
                id: item.prototypeId,
                title: item.title,
                href: resolvePrototypeHref(item.prototypeId),
                prototypeId: item.prototypeId,
                version: item.version,
              })}
            >
              <span className="opn-updates-link-main">
                <span className="opn-updates-link-title">{item.title}</span>
                <span className="opn-updates-summary">{item.summary}</span>
                {item.details && item.details.length > 0 && (
                  <span className="opn-updates-detail">
                    {item.details[0]}
                  </span>
                )}
              </span>
              <span className="opn-updates-side">
                <span className="opn-updates-version">{item.version}</span>
                <span className="opn-updates-meta">
                  {item.date}
                  {' '}
                  {item.time}
                </span>
              </span>
            </button>
          </li>
        ))}
      </ol>
    </section>
  );
}

export default function OneosPrototypeNavApp() {
  const [isAuthed, setIsAuthed] = useState(readAuthSession);
  const sections = useMemo(() => {
    const loaded = loadNavSections();
    const patchLink = (link: NavLinkItem): NavLinkItem => ({
      ...link,
      href: linkHref(link),
    });
    return loaded.map((section) => ({
      ...section,
      links: section.links.map(patchLink),
      subGroups: section.subGroups.map((group) => ({
        ...group,
        links: group.links.map(patchLink),
      })),
    }));
  }, []);
  const recentUpdates = useMemo(() => loadRecentUpdates(), []);
  const registryUpdatedAt = useMemo(() => getRegistryUpdatedAt(), []);
  const allLinks = useMemo(() => flattenNavLinks(sections), [sections]);
  const totalCount = useMemo(() => countNavLinks(sections), [sections]);
  const [query, setQuery] = useState('');
  const [selectedLink, setSelectedLink] = useState<NavLinkItem | null>(null);
  const [activeSectionId, setActiveSectionId] = useState(() => resolveInitialSectionId(loadNavSections()));
  const searchRef = useRef<HTMLInputElement>(null);

  const handleSelectLink = useCallback((link: NavLinkItem) => {
    setSelectedLink({ ...link, href: linkHref(link) });
  }, []);

  const handleCloseDetail = useCallback(() => {
    setSelectedLink(null);
  }, []);

  const handleSelectSection = useCallback((sectionId: string) => {
    setActiveSectionId(sectionId);
    window.history.replaceState(null, '', `#opn-section-${sectionId}`);
    document.getElementById('opn-main')?.scrollTo({ top: 0 });
  }, []);

  useEffect(() => {
    const onHashChange = () => {
      const fromHash = sectionIdFromHash();
      if (fromHash && sections.some((section) => section.id === fromHash)) {
        setActiveSectionId(fromHash);
      }
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, [sections]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const tag = (event.target as HTMLElement | null)?.tagName;
      const isTyping = tag === 'INPUT' || tag === 'TEXTAREA' || (event.target as HTMLElement)?.isContentEditable;
      if (isTyping || selectedLink) return;
      if (event.key === '/') {
        event.preventDefault();
        searchRef.current?.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [selectedLink]);

  const normalizedQuery = query.trim().toLowerCase();
  const filteredLinks = useMemo(() => {
    if (!normalizedQuery) return [];
    return allLinks.filter((link) => (
      link.title.toLowerCase().includes(normalizedQuery)
      || link.prototypeId.toLowerCase().includes(normalizedQuery)
      || link.sectionTitle.toLowerCase().includes(normalizedQuery)
      || (link.groupTitle || '').toLowerCase().includes(normalizedQuery)
    ));
  }, [allLinks, normalizedQuery]);

  const visibleSections = useMemo(() => {
    if (normalizedQuery) {
      const matchedIds = new Set(filteredLinks.map((link) => link.prototypeId));
      return sections
        .map((section) => {
          const links = section.links.filter((link) => matchedIds.has(link.prototypeId));
          const subGroups = section.subGroups
            .map((group) => ({
              ...group,
              links: group.links.filter((link) => matchedIds.has(link.prototypeId)),
            }))
            .filter((group) => group.links.length > 0);
          if (!links.length && !subGroups.length) return null;
          return { ...section, links, subGroups };
        })
        .filter((section): section is NavSection => Boolean(section));
    }

    const activeSection = sections.find((section) => section.id === activeSectionId) || sections[0];
    return activeSection ? [activeSection] : [];
  }, [sections, normalizedQuery, filteredLinks, activeSectionId]);

  if (!isAuthed) {
    return (
      <div className="opn-page opn-page--gate" data-annotation-id="opn-page">
        <PasswordGate onUnlock={() => setIsAuthed(true)} />
      </div>
    );
  }

  return (
    <div className="opn-page" data-annotation-id="opn-page">
      <a className="opn-skip" href="#opn-main">跳到导航内容</a>

      <header className="opn-topbar" data-annotation-id="opn-topbar">
        <div className="opn-topbar-inner">
          <div className="opn-brand">
            <span className="opn-brand-mark" aria-hidden>
              <Zap size={14} strokeWidth={2.25} />
            </span>
            <span className="opn-brand-text">ONE-OS · Prototype Hub</span>
          </div>
          <div className="opn-topbar-stats">
            <span className="opn-topbar-stat">
              <LayoutGrid size={14} aria-hidden />
              {totalCount}
              {' '}
              原型
            </span>
            {registryUpdatedAt && (
              <span className="opn-topbar-stat opn-topbar-stat--muted">
                同步
                {' '}
                {new Date(registryUpdatedAt).toLocaleString('zh-CN', {
                  month: 'numeric',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            )}
          </div>
        </div>
      </header>

      <section className="opn-hero" data-annotation-id="opn-hero">
        <div className="opn-hero-inner">
          <p className="opn-eyebrow">Prototype Directory</p>
          <h1>
            <span className="opn-hero-accent">「OneOS」全环节产品原型管理</span>
          </h1>

          <label className="opn-search" data-annotation-id="opn-search">
            <Search size={17} aria-hidden />
            <input
              ref={searchRef}
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="搜索菜单或原型名称…"
              aria-label="搜索原型"
            />
            {!query && <kbd className="opn-search-kbd" aria-hidden>/</kbd>}
            {query && (
              <button
                type="button"
                className="opn-search-clear"
                onClick={() => setQuery('')}
                aria-label="清除搜索"
              >
                <X size={15} aria-hidden />
              </button>
            )}
          </label>
        </div>
      </section>

      <div className={`opn-layout${normalizedQuery ? ' opn-layout--search' : ''}`}>
        {!normalizedQuery && (
          <aside className="opn-sidebar" aria-label="分组目录">
            <p className="opn-sidebar-title">Directory</p>
            <nav className="opn-sidebar-nav">
              {sections.map((section) => {
                const Icon = section.icon;
                const isActive = activeSectionId === section.id;
                return (
                  <button
                    key={section.id}
                    type="button"
                    className={`opn-sidebar-link${isActive ? ' opn-sidebar-link--active' : ''}`}
                    onClick={() => handleSelectSection(section.id)}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <Icon size={15} strokeWidth={1.75} aria-hidden />
                    <span>{sidebarSectionLabel(section)}</span>
                  </button>
                );
              })}
            </nav>
          </aside>
        )}

        <main id="opn-main" className="opn-main">
          {normalizedQuery && (
            <p className="opn-search-result" role="status">
              找到
              {' '}
              <strong>{filteredLinks.length}</strong>
              {' '}
              个匹配「
              {query.trim()}
              」的原型
            </p>
          )}

          {visibleSections.length === 0 ? (
            <div className="opn-empty">
              <p>没有匹配的原型，请换个关键词试试。</p>
              <button type="button" className="opn-empty-btn" onClick={() => setQuery('')}>
                清除搜索
              </button>
            </div>
          ) : (
            visibleSections.map((section) => (
              <SectionBlock
                key={section.id}
                section={section}
                onSelectLink={handleSelectLink}
              />
            ))
          )}

          {!normalizedQuery && (
            <RecentUpdatesPanel updates={recentUpdates} onSelectLink={handleSelectLink} />
          )}
        </main>
      </div>

      {selectedLink && (
        <ChangelogDetailPanel link={selectedLink} onClose={handleCloseDetail} />
      )}
    </div>
  );
}
