import React, { useCallback, useEffect, useRef, useState } from 'react';
import OneOsAppShell, {
  PROTOTYPE_DEMO_HREF,
  type ShellTab,
} from '@/common/oneos-app-shell/OneOsAppShell';
import { type ShellMenuItem } from '@/common/oneos-app-shell/nav-from-prototypes';
import {
  hasUnseenRelease,
  postReleaseDemoOpen,
} from '@/common/oneos-app-shell/release-demo-bridge';

const DEFAULT_HREF = '/prototypes/oneos-v2';
const DEFAULT_TITLE = 'OneOS V2 全局规范示范';

function parseProtoFromHash(): { href: string; protoKey: string } | null {
  if (typeof window === 'undefined') return null;
  const hash = window.location.hash;
  const match = hash.match(/#proto=([^&]+)/);
  if (!match || !match[1]) return null;

  const rawKey = decodeURIComponent(match[1]).trim();
  if (!rawKey) return null;

  const href = rawKey.startsWith('/') ? rawKey : `/prototypes/${rawKey}`;
  return { href, protoKey: rawKey.replace(/^\/?prototypes\//, '') };
}

export default function OneosPrototypeDemoPage() {
  const [activeHref, setActiveHref] = useState<string>(() => {
    const parsed = parseProtoFromHash();
    return parsed ? parsed.href : DEFAULT_HREF;
  });

  const [tabs, setTabs] = useState<ShellTab[]>(() => {
    const parsed = parseProtoFromHash();
    if (parsed && parsed.href !== DEFAULT_HREF) {
      const keyName = parsed.protoKey;
      return [
        { href: DEFAULT_HREF, title: DEFAULT_TITLE },
        { href: parsed.href, title: keyName },
      ];
    }
    return [{ href: DEFAULT_HREF, title: DEFAULT_TITLE }];
  });

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [iframeKey, setIframeKey] = useState(0);
  const [releaseNotesUnread, setReleaseNotesUnread] = useState(() => hasUnseenRelease());

  useEffect(() => {
    setReleaseNotesUnread(hasUnseenRelease());
  }, [activeHref, iframeKey]);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key && e.key !== 'oneos-wb-release-seen-v1') return;
      setReleaseNotesUnread(hasUnseenRelease());
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  // 监听 Hash 变化同步状态
  useEffect(() => {
    const handleHashChange = () => {
      const parsed = parseProtoFromHash();
      if (parsed) {
        setActiveHref(parsed.href);
        setTabs((prev) => {
          if (prev.some((t) => t.href === parsed.href)) return prev;
          return [...prev, { href: parsed.href, title: parsed.protoKey }];
        });
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // 更新 Hash
  const updateHash = useCallback((href: string) => {
    const key = href.replace(/^\/?prototypes\//, '');
    window.history.replaceState(null, '', `#proto=${key}`);
  }, []);

  const handleNavigate = useCallback(
    (item: ShellMenuItem) => {
      if (!item.href || item.href === PROTOTYPE_DEMO_HREF) return;
      const href = item.href;
      setActiveHref(href);
      updateHash(href);

      setTabs((prev) => {
        const existsIndex = prev.findIndex((t) => t.href === href);
        if (existsIndex >= 0) {
          // 更新 title 为更规范的 label
          const next = [...prev];
          next[existsIndex] = { href, title: item.label };
          return next;
        }
        return [...prev, { href, title: item.label }];
      });
    },
    [updateHash],
  );

  const handleTabSelect = useCallback(
    (href: string) => {
      setActiveHref(href);
      updateHash(href);
    },
    [updateHash],
  );

  const handleTabClose = useCallback(
    (targetHref: string) => {
      setTabs((prev) => {
        if (prev.length <= 1) return prev; // 保持至少一个 Tab
        const next = prev.filter((t) => t.href !== targetHref);
        if (activeHref === targetHref) {
          const fallback = next[next.length - 1];
          if (fallback) {
            setActiveHref(fallback.href);
            updateHash(fallback.href);
          }
        }
        return next;
      });
    },
    [activeHref, updateHash],
  );

  const handleRefresh = useCallback(() => {
    if (iframeRef.current) {
      try {
        iframeRef.current.contentWindow?.location.reload();
      } catch {
        setIframeKey((k) => k + 1);
      }
    } else {
      setIframeKey((k) => k + 1);
    }
  }, []);

  const handleOpenReleaseNotes = useCallback(() => {
    const win = iframeRef.current?.contentWindow;
    if (win) {
      postReleaseDemoOpen(win);
      // 打开后稍后刷新未读点（同源 localStorage 由 iframe 写入）
      window.setTimeout(() => setReleaseNotesUnread(hasUnseenRelease()), 400);
    }
  }, []);

  return (
    <OneOsAppShell
      activeHref={activeHref}
      tabs={tabs}
      onNavigate={handleNavigate}
      onTabSelect={handleTabSelect}
      onTabClose={handleTabClose}
      onRefresh={handleRefresh}
      brandHref={PROTOTYPE_DEMO_HREF}
      onOpenReleaseNotes={handleOpenReleaseNotes}
      releaseNotesUnread={releaseNotesUnread}
    >
      <iframe
        key={`${activeHref}-${iframeKey}`}
        ref={iframeRef}
        className="oneos-shell-frame"
        src={activeHref}
        title="OneOS Prototype Preview"
      />
    </OneOsAppShell>
  );
}
