import React, { useState } from 'react';
import {
  Avatar,
  Button,
  Empty,
  Space,
  Tabs,
  Timeline,
  Typography,
} from 'antd';
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  CopyOutlined,
  ReloadOutlined,
  UserOutlined,
} from '@ant-design/icons';
import type { ApprovalCardItem } from '../types';
import {
  formatStatusLabel,
  getApprovalTypeLabel,
} from '../config/approvalTypeConfig';
import { InsuranceComparisonDetail } from './InsuranceComparisonDetail';
import { LeaseBillingDetail } from './LeaseBillingDetail';

const { Text, Title } = Typography;

export interface ApprovalDetailPlaceholderProps {
  item: ApprovalCardItem | null;
  onRefresh?: () => void;
}

function statusBadgeClass(status: ApprovalCardItem['status']): string {
  if (status === 'approved') return 'ap-detail__badge ap-detail__badge--approved';
  if (status === 'rejected' || status === 'terminated') {
    return 'ap-detail__badge ap-detail__badge--rejected';
  }
  return 'ap-detail__badge ap-detail__badge--pending';
}

const MOCK_TIMELINE = [
  { role: '发起人', name: '提交申请', time: '', color: 'blue' as const },
  { role: '部门主管', name: '审批通过', time: '2026-07-08 10:30', color: 'green' as const },
  { role: '财务审核', name: '审批中', time: '', color: 'gray' as const },
];

export function ApprovalDetailPlaceholder({ item, onRefresh }: ApprovalDetailPlaceholderProps) {
  const [activeTab, setActiveTab] = useState('detail');

  if (!item) {
    return (
      <div className="ap-detail ap-detail--empty">
        <Empty description="请从左侧选择一条审批事项" />
      </div>
    );
  }

  if (item.typeLabel === '保险比价采购') {
    return <InsuranceComparisonDetail item={item} onRefresh={onRefresh} />;
  }

  if (item.type === 'billing') {
    return <LeaseBillingDetail item={item} onRefresh={onRefresh} />;
  }

  const statusLabel = formatStatusLabel(item);
  const typeLabel = getApprovalTypeLabel(item.type);

  return (
    <div className="ap-detail">
      <div className="ap-detail__toolbar">
        <Space size={8}>
          <Text type="secondary">编号：</Text>
          <Text copyable={{ icon: <CopyOutlined />, text: item.id }}>{item.id}</Text>
        </Space>
        <Button type="text" icon={<ReloadOutlined />} onClick={onRefresh}>
          刷新
        </Button>
      </div>

      <div className="ap-detail__header">
        <div className="ap-detail__header-main">
          <Title level={4} className="ap-detail__title">
            {item.title}
          </Title>
          <span className={statusBadgeClass(item.status)}>{statusLabel}</span>
        </div>
        <div className="ap-detail__meta">
          <Space size={16} wrap>
            <Space size={6}>
              <Avatar size={24} icon={<UserOutlined />} />
              <Text>{item.initiatedBy}</Text>
            </Space>
            <Space size={6}>
              <Text type="secondary">流程分类</Text>
              <Text>{typeLabel}</Text>
            </Space>
            <Space size={6}>
              <ClockCircleOutlined style={{ color: '#8c8c8c' }} />
              <Text type="secondary">提交时间</Text>
              <Text>{item.initiatedAt}</Text>
            </Space>
          </Space>
        </div>
      </div>

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        className="ap-detail__tabs"
        items={[
          {
            key: 'detail',
            label: '审批详情',
            children: (
              <div className="ap-detail__content">
                {item.subtitle ? (
                  <p className="ap-detail__subtitle">{item.subtitle}</p>
                ) : null}

                {item.keyFacts && item.keyFacts.length > 0 ? (
                  <dl className="ap-detail__facts">
                    {item.keyFacts.map((fact) => (
                      <div key={fact.label} className="ap-detail__fact">
                        <dt>{fact.label}</dt>
                        <dd className={fact.emphasis ? 'ap-detail__fact-value--emphasis' : undefined}>
                          {fact.value}
                        </dd>
                      </div>
                    ))}
                  </dl>
                ) : null}

                {item.risks && item.risks.length > 0 ? (
                  <div className="ap-detail__risks">
                    {item.risks.map((risk) => (
                      <span
                        key={risk.label}
                        className={`ap-card__risk ap-card__risk--${risk.level ?? 'default'}`}
                      >
                        {risk.label}
                      </span>
                    ))}
                  </div>
                ) : null}

                <div className="ap-detail__timeline-section">
                  <Text strong className="ap-detail__section-title">
                    审批进度
                  </Text>
                  <Timeline
                    className="ap-detail__timeline"
                    items={MOCK_TIMELINE.map((step, index) => ({
                      color: step.color,
                      dot:
                        step.color === 'green' ? (
                          <CheckCircleOutlined style={{ fontSize: 14 }} />
                        ) : undefined,
                      children: (
                        <div className="ap-detail__timeline-item">
                          <div className="ap-detail__timeline-head">
                            <Text strong>
                              {step.role}
                              {step.name ? ` · ${step.name}` : ''}
                            </Text>
                            {step.time ? (
                              <Text type="secondary" className="ap-detail__timeline-time">
                                {step.time}
                              </Text>
                            ) : null}
                          </div>
                          {index === 0 ? (
                            <Text type="secondary">{item.initiatedBy}</Text>
                          ) : null}
                        </div>
                      ),
                    }))}
                  />
                </div>
              </div>
            ),
          },
          {
            key: 'flow',
            label: '审批流程图',
            children: (
              <div className="ap-detail__flow-placeholder">
                <Empty description="流程图占位，后续接入 BPM 流程引擎" />
              </div>
            ),
          },
        ]}
      />

      <div className="ap-detail__actions">
        <Button>评论</Button>
      </div>
    </div>
  );
}
