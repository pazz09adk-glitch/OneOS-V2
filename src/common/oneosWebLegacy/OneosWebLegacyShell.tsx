import React, { useEffect, useMemo } from 'react';
import { ConfigProvider, Layout, Menu, Typography } from 'antd';
import { clearHostPrototypeRouteInfo, defineHashPageRoute, useHashPage } from '../useHashPage';
import { ensureOneosWebLegacyGlobals } from './legacyGlobals';

import '../../resources/oneos-web-legacy/styles/oneos-app.css';
import '../../resources/oneos-web-legacy/styles/oneos-tokens.css';
import '../../resources/oneos-web-legacy/styles/index.css';

export interface OneosWebLegacyPage {
  id: string;
  title: string;
  component: React.ComponentType;
}

export interface OneosWebLegacyShellProps {
  moduleTitle: string;
  pages: OneosWebLegacyPage[];
  defaultPageId?: string;
}

const oneosTheme = {
  token: {
    colorPrimary: '#165dff',
    borderRadius: 8,
    fontFamily:
      'Inter, -apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei", sans-serif',
  },
};

function OneosWebLegacyPageLayout({
  children,
  moduleTitle,
  pages,
  activePageId,
  onSelectPage,
}: {
  children: React.ReactNode;
  moduleTitle: string;
  pages: OneosWebLegacyPage[];
  activePageId?: string;
  onSelectPage?: (pageId: string) => void;
}) {
  const showMenu = pages.length > 1 && activePageId && onSelectPage;

  return (
    <ConfigProvider theme={oneosTheme}>
      <Layout style={{ minHeight: '100vh', background: '#f5f7fa' }}>
        {showMenu ? (
          <Layout.Sider
            width={220}
            theme="light"
            style={{ borderRight: '1px solid #e5e7eb' }}
          >
            <div style={{ padding: '16px 16px 8px', fontWeight: 600 }}>{moduleTitle}</div>
            <Menu
              mode="inline"
              selectedKeys={[activePageId]}
              items={pages.map((item) => ({
                key: item.id,
                label: item.title,
                onClick: () => onSelectPage(item.id),
              }))}
            />
          </Layout.Sider>
        ) : null}
        <Layout.Content style={{ minHeight: '100vh', overflow: 'auto' }}>
          {children}
        </Layout.Content>
      </Layout>
    </ConfigProvider>
  );
}

function OneosWebLegacySinglePageShell({ pages }: OneosWebLegacyShellProps) {
  const active = pages[0];

  useEffect(() => {
    clearHostPrototypeRouteInfo();
  }, []);

  if (!active) {
    return (
      <Typography.Text type="secondary">
        未配置可预览页面
      </Typography.Text>
    );
  }

  const ActivePage = active.component;

  return (
    <OneosWebLegacyPageLayout moduleTitle="" pages={pages}>
      <ActivePage />
    </OneosWebLegacyPageLayout>
  );
}

function OneosWebLegacyMultiPageShell({
  moduleTitle,
  pages,
  defaultPageId,
}: OneosWebLegacyShellProps) {
  const route = useMemo(
    () => defineHashPageRoute(
      pages.map((page) => ({ id: page.id, title: page.title })),
      { defaultPageId: defaultPageId ?? pages[0]?.id },
    ),
    [pages, defaultPageId],
  );
  const { page, setPage } = useHashPage(route);
  const active = pages.find((item) => item.id === page) ?? pages[0];

  if (!active) {
    return (
      <Typography.Text type="secondary">
        未配置可预览页面
      </Typography.Text>
    );
  }

  const ActivePage = active.component;

  return (
    <OneosWebLegacyPageLayout
      moduleTitle={moduleTitle}
      pages={pages}
      activePageId={active.id}
      onSelectPage={setPage}
    >
      <ActivePage />
    </OneosWebLegacyPageLayout>
  );
}

export function OneosWebLegacyShell(props: OneosWebLegacyShellProps) {
  ensureOneosWebLegacyGlobals();

  if (props.pages.length <= 1) {
    return <OneosWebLegacySinglePageShell {...props} />;
  }

  return <OneosWebLegacyMultiPageShell {...props} />;
}
