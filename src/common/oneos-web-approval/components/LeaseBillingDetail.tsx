import React, { useState } from 'react';
import {
  Avatar,
  Button,
  Empty,
  Space,
  Table,
  Tabs,
  Tag,
  Timeline,
  Typography,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  CopyOutlined,
  ReloadOutlined,
  UserOutlined,
} from '@ant-design/icons';
import type { ApprovalCardItem } from '../types';
import { formatStatusLabel, getApprovalTypeLabel } from '../config/approvalTypeConfig';

const { Text, Title } = Typography;

export interface LeaseBillingDetailProps {
  item: ApprovalCardItem;
  onRefresh?: () => void;
}

function getFact(item: ApprovalCardItem, label: string): string {
  return item.keyFacts?.find((fact) => fact.label === label)?.value ?? '-';
}

function parseBillingCycle(text: string) {
  const normalized = text.replace('·', ' ').trim();
  const periodMatch = normalized.match(/第\d+期/);
  const period = periodMatch?.[0] ?? '-';
  const fullDateMatch = normalized.match(/(\d{4}-\d{2}-\d{2})至(\d{4}-\d{2}-\d{2})/);
  if (fullDateMatch) {
    return { period, startDate: fullDateMatch[1], endDate: fullDateMatch[2] };
  }
  const rangeMatch = normalized.match(/(\d{2}-\d{2})至(\d{2}-\d{2})/);
  const startDate = rangeMatch ? `2026-${rangeMatch[1]}` : '-';
  const endDate = rangeMatch ? `2026-${rangeMatch[2]}` : '-';
  return { period, startDate, endDate };
}

function parseAmount(value: string): string {
  return value.replace(/[¥,]/g, '').trim() || '0.00';
}

function buildBillNo(item: ApprovalCardItem): string {
  const seq = item.id.replace(/\D/g, '').padStart(16, '0');
  return `207${seq}994`;
}

interface BillDetailRow {
  key: string;
  index: number;
  brand: string;
  model: string;
  plateNo: string;
  rentReceivable: string;
  rentReceived: string;
  rentRemark: string;
  waivedAmount: string;
  depositReceivable: string;
}

function buildBillDetailRows(item: ApprovalCardItem): BillDetailRow[] {
  const vehicleCount = Number(getFact(item, '计费车辆数量').match(/(\d+)/)?.[1] ?? 2);
  const amount = parseAmount(getFact(item, '应收款总额'));
  const receivedAmount = parseAmount(getFact(item, '实收款总额'));
  const perVehicleReceivable = (Number(amount) / vehicleCount).toFixed(2);
  const perVehicleReceived = (Number(receivedAmount) / vehicleCount).toFixed(2);

  return Array.from({ length: vehicleCount }, (_, index) => ({
    key: String(index + 1),
    index: index + 1,
    brand: '帕力安',
    model: '4.5T 厢式货车',
    plateNo: index === 0 ? '粤AGR9901' : '粤AGR9902',
    rentReceivable: perVehicleReceivable,
    rentReceived: perVehicleReceived,
    rentRemark: '-',
    waivedAmount: '0.00',
    depositReceivable: '0.00',
  }));
}

export function LeaseBillingDetail({ item, onRefresh }: LeaseBillingDetailProps) {
  const [activeTab, setActiveTab] = useState('detail');
  const billNo = buildBillNo(item);
  const typeLabel = getApprovalTypeLabel(item.type);
  const statusLabel = item.statusLabel ?? formatStatusLabel(item);
  const cycle = parseBillingCycle(item.subtitle ?? '');
  const receivableTotal = parseAmount(getFact(item, '应收款总额'));
  const receivedTotal = parseAmount(getFact(item, '实收款总额'));
  const invoicedTotal = parseAmount(getFact(item, '开票总额'));
  const pendingInvoice = Math.max(Number(receivedTotal) - Number(invoicedTotal), 0).toFixed(2);
  const billDetailRows = buildBillDetailRows(item);

  const billInfoRows = [
    { label: '合同编码', value: 'AUTO_REG_20260703105722' },
    { label: '合同类型', value: '租赁合同' },
    { label: '项目名称', value: item.projectName ?? '-' },
    { label: '客户名称', value: item.title },
    { label: '交车任务编码', value: '-' },
    { label: '账单编码', value: `RS-ZD-${item.id.replace('ac-', '')}-${billNo.slice(-10)}` },
    { label: '账单期数', value: cycle.period },
    { label: '账单开始日期', value: cycle.startDate },
    { label: '账单结束日期', value: cycle.endDate },
  ];

  const detailColumns: ColumnsType<BillDetailRow> = [
    { title: '序号', dataIndex: 'index', width: 56, fixed: 'left' },
    { title: '品牌', dataIndex: 'brand', width: 80 },
    { title: '型号', dataIndex: 'model', width: 120 },
    { title: '车牌号', dataIndex: 'plateNo', width: 100 },
    { title: '应收车辆月租金', dataIndex: 'rentReceivable', width: 120 },
    { title: '实收车辆月租金', dataIndex: 'rentReceived', width: 120 },
    { title: '车辆租金备注', dataIndex: 'rentRemark', width: 110 },
    { title: '减免金额', dataIndex: 'waivedAmount', width: 90 },
    { title: '应收车辆保证金', dataIndex: 'depositReceivable', width: 120 },
  ];

  return (
    <div className="ap-detail ap-detail--billing">
      <div className="ap-detail__toolbar">
        <Space size={8}>
          <Text type="secondary">编号：</Text>
          <Text copyable={{ icon: <CopyOutlined />, text: billNo }}>{billNo}</Text>
        </Space>
        <Button type="text" icon={<ReloadOutlined />} onClick={onRefresh}>
          刷新
        </Button>
      </div>

      <div className="ap-detail__header">
        <div className="ap-detail__header-main">
          <Title level={4} className="ap-detail__title">
            {typeLabel}审批
          </Title>
          <span className="ap-detail__badge ap-detail__badge--pending">{statusLabel}</span>
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
                <Text strong className="ap-detail__section-title">
                  账单信息
                </Text>
                <table className="ap-insurance-summary ap-billing-summary">
                  <tbody>
                    {Array.from({ length: Math.ceil(billInfoRows.length / 3) }).map((_, rowIndex) => {
                      const cells = billInfoRows.slice(rowIndex * 3, rowIndex * 3 + 3);
                      return (
                        <tr key={rowIndex}>
                          {cells.map((cell) => (
                            <React.Fragment key={cell.label}>
                              <th>{cell.label}</th>
                              <td>{cell.value}</td>
                            </React.Fragment>
                          ))}
                          {cells.length < 3
                            ? Array.from({ length: 3 - cells.length }).map((__, fillIndex) => (
                                <React.Fragment key={`fill-${fillIndex}`}>
                                  <th />
                                  <td />
                                </React.Fragment>
                              ))
                            : null}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                <div className="ap-billing-detail-section">
                  <Text strong className="ap-detail__section-title">
                    账单明细
                  </Text>
                  <div className="ap-billing-totals">
                    <span>
                      应收款总额 <Text className="ap-billing-totals__value">{receivableTotal} 元</Text>
                    </span>
                    <span>
                      实收款总额 <Text className="ap-billing-totals__value">{receivedTotal} 元</Text>
                    </span>
                    <span>
                      开票总额 <Text className="ap-billing-totals__value">{invoicedTotal} 元</Text>
                    </span>
                    <span className="ap-billing-totals__meta">
                      待开票 {pendingInvoice} 元
                    </span>
                  </div>
                  <Table
                    className="ap-insurance-table ap-billing-table"
                    columns={detailColumns}
                    dataSource={billDetailRows}
                    pagination={false}
                    size="small"
                    scroll={{ x: 1100 }}
                  />
                </div>

                <div className="ap-billing-timeline-section">
                  <Text strong className="ap-detail__section-title">
                    审批记录
                  </Text>
                  <Timeline
                    className="ap-detail__timeline"
                    items={[
                      {
                        color: 'gray',
                        children: (
                          <div className="ap-billing-timeline-item">
                            <div className="ap-billing-timeline-head">
                              <Text strong>财务经理审批</Text>
                              <Tag>待审批</Tag>
                            </div>
                          </div>
                        ),
                      },
                      {
                        color: 'green',
                        dot: <CheckCircleOutlined style={{ fontSize: 14 }} />,
                        children: (
                          <div className="ap-billing-timeline-item">
                            <div className="ap-billing-timeline-head">
                              <Text strong>发起审批</Text>
                              <Tag color="success">通过</Tag>
                            </div>
                            <Text type="secondary">{item.initiatedBy}</Text>
                            <Text type="secondary" className="ap-detail__timeline-time">
                              {item.initiatedAt}
                            </Text>
                          </div>
                        ),
                      },
                    ]}
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
