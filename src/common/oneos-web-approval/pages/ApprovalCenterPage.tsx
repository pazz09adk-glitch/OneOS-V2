import React, { useEffect, useMemo, useState } from 'react';
import { Input, Select, Tabs } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import type { ApprovalCardItem, ApprovalListTab, ApprovalStatus } from '../types';
import { ApprovalCardList } from '../components/ApprovalCardList';
import { ApprovalDetailPlaceholder } from '../components/ApprovalDetailPlaceholder';
import {
  filterCasesByTab,
  MOCK_APPROVAL_CASES,
} from '../data/mockApprovalCases';
import {
  APPROVAL_TYPE_OPTIONS,
  formatStatusLabel,
} from '../config/approvalTypeConfig';

const TAB_ITEMS: { key: ApprovalListTab; label: string }[] = [
  { key: 'todo', label: '我的待办' },
  { key: 'initiated', label: '我发起的' },
  { key: 'done', label: '我的已办' },
  { key: 'cc', label: '我的抄送' },
];

const STATUS_OPTIONS: { value: ApprovalStatus | 'all'; label: string }[] = [
  { value: 'all', label: '全部状态' },
  { value: 'pending', label: '审批中' },
  { value: 'approved', label: '已通过' },
  { value: 'rejected', label: '已驳回' },
];

export interface ApprovalCenterPageProps {
  tabKey?: ApprovalListTab;
  pageTitle?: string;
  showTabs?: boolean;
}

export function ApprovalCenterPage({
  tabKey = 'todo',
  pageTitle,
  showTabs = false,
}: ApprovalCenterPageProps) {
  const [activeTab, setActiveTab] = useState<ApprovalListTab>(tabKey);
  const [statusFilter, setStatusFilter] = useState<ApprovalStatus | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [keyword, setKeyword] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    setActiveTab(tabKey);
  }, [tabKey]);

  const tabItems = useMemo(() => {
    let list = filterCasesByTab(MOCK_APPROVAL_CASES, activeTab);

    if (statusFilter !== 'all') {
      list = list.filter((item) => item.status === statusFilter);
    }
    if (typeFilter !== 'all') {
      list = list.filter((item) => item.type === typeFilter);
    }
    if (keyword.trim()) {
      const q = keyword.trim().toLowerCase();
      list = list.filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          (item.subtitle?.toLowerCase().includes(q) ?? false) ||
          item.initiatedBy.toLowerCase().includes(q) ||
          formatStatusLabel(item).toLowerCase().includes(q),
      );
    }
    return list;
  }, [activeTab, statusFilter, typeFilter, keyword]);

  useEffect(() => {
    if (tabItems.length === 0) {
      setSelectedId(null);
      return;
    }
    if (!selectedId || !tabItems.some((item) => item.id === selectedId)) {
      setSelectedId(tabItems[0].id);
    }
  }, [tabItems, selectedId]);

  const selectedItem = useMemo(
    () => tabItems.find((item) => item.id === selectedId) ?? null,
    [tabItems, selectedId],
  );

  const handleItemClick = (item: ApprovalCardItem) => {
    setSelectedId(item.id);
  };

  const currentTabMeta = TAB_ITEMS.find((t) => t.key === activeTab);
  const displayTitle = pageTitle ?? currentTabMeta?.label ?? '审批中心';

  return (
    <div className="ap-page">
      {showTabs ? (
        <div className="ap-page__tabs-bar">
          <Tabs
            activeKey={activeTab}
            onChange={(key) => setActiveTab(key as ApprovalListTab)}
            items={TAB_ITEMS.map((t) => ({ key: t.key, label: t.label }))}
          />
        </div>
      ) : null}

      <div className="ap-page__shell">
        <aside className="ap-page__sidebar">
          <div className="ap-sidebar__head">
            <h1 className="ap-sidebar__title">{displayTitle}</h1>
            <p className="ap-sidebar__desc">按状态、流程类型与关键词筛选审批事项</p>
          </div>

          <div className="ap-filter ap-filter--sidebar">
            <Select
              className="ap-filter__control"
              value={statusFilter}
              onChange={setStatusFilter}
              options={STATUS_OPTIONS}
              placeholder="审批状态"
            />
            <Select
              className="ap-filter__control"
              value={typeFilter}
              onChange={setTypeFilter}
              options={[{ value: 'all', label: '全部类型' }, ...APPROVAL_TYPE_OPTIONS]}
              placeholder="流程类型"
            />
            <Input
              className="ap-filter__search"
              allowClear
              prefix={<SearchOutlined />}
              placeholder="关键词搜索"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
          </div>

          <div className="ap-sidebar__list">
            <ApprovalCardList
              items={tabItems}
              selectedId={selectedId}
              onItemClick={handleItemClick}
            />
          </div>

          <div className="ap-sidebar__foot">共 {tabItems.length} 条</div>
        </aside>

        <main className="ap-page__detail">
          <ApprovalDetailPlaceholder item={selectedItem} />
        </main>
      </div>
    </div>
  );
}
