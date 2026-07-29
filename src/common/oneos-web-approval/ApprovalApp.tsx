import '../oneosWebLegacy/legacyGlobals';
import '../../prototypes/vehicle-management/style.css';import './styles/index.css';

import React from 'react';
import { ConfigProvider } from 'antd';
import type { ApprovalTabKey } from './types';
import { ApprovalCenterPage } from './pages/ApprovalCenterPage';

const approvalTheme = {
  token: {
    colorPrimary: '#165dff',
    borderRadius: 8,
    fontFamily:
      'Inter, -apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei", sans-serif',
    colorBgLayout: '#f5f7fa',
  },
  components: {
    Tabs: {
      inkBarColor: '#165dff',
      itemSelectedColor: '#165dff',
      itemHoverColor: '#165dff',
    },
    Button: {
      controlHeight: 32,
    },
    Select: {
      controlHeight: 32,
    },
    Input: {
      controlHeight: 32,
    },
  },
};

export interface ApprovalAppProps {
  tabKey?: ApprovalTabKey;
  pageTitle?: string;
  showTabs?: boolean;
}

export function ApprovalApp({
  tabKey,
  pageTitle = '审批中心',
  showTabs = false,
}: ApprovalAppProps) {
  return (
    <ConfigProvider theme={approvalTheme}>
      <ApprovalCenterPage
        tabKey={tabKey}
        pageTitle={pageTitle}
        showTabs={showTabs}
      />
    </ConfigProvider>
  );
}

export default ApprovalApp;
