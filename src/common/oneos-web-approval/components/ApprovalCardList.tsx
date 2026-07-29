import React from 'react';
import { Empty, Spin } from 'antd';
import type { ApprovalCardItem } from '../types';
import { ApprovalCard } from './ApprovalCard';

export interface ApprovalCardListProps {
  items: ApprovalCardItem[];
  loading?: boolean;
  selectedId?: string | null;
  onItemClick?: (item: ApprovalCardItem) => void;
}

export function ApprovalCardList({
  items,
  loading = false,
  selectedId,
  onItemClick,
}: ApprovalCardListProps) {
  if (loading) {
    return (
      <div className="ap-list ap-list--loading">
        <Spin tip="加载中..." />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="ap-list ap-list--empty">
        <Empty description="暂无审批事项" />
      </div>
    );
  }

  return (
    <div className="ap-list">
      {items.map((item) => (
        <ApprovalCard
          key={item.id}
          item={item}
          selected={item.id === selectedId}
          onClick={onItemClick}
        />
      ))}
    </div>
  );
}
