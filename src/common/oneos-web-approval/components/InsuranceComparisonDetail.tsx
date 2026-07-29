import React, { useState } from 'react';
import {
  Avatar,
  Button,
  Empty,
  Space,
  Table,
  Tabs,
  Tag,
  Typography,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  ClockCircleOutlined,
  CopyOutlined,
  ReloadOutlined,
  UserOutlined,
} from '@ant-design/icons';
import type { ApprovalCardItem } from '../types';
import { formatStatusLabel } from '../config/approvalTypeConfig';

const { Text, Title } = Typography;

export interface InsuranceComparisonDetailProps {
  item: ApprovalCardItem;
  onRefresh?: () => void;
}

function getFact(item: ApprovalCardItem, label: string): string {
  return item.keyFacts?.find((fact) => fact.label === label)?.value ?? '-';
}

interface VehicleRow {
  key: string;
  plateNo: string;
  vin: string;
  insuranceType: string;
  latestPaymentDate: string;
  finalQuote: string;
  status: string;
  approver: string;
  remark: string;
}

interface QuoteRow {
  key: string;
  company: string;
  amount: string;
  isFinal: boolean;
  remark: string;
}

function buildComparisonNo(item: ApprovalCardItem): string {
  const datePart = item.initiatedAt.replace(/[-: ]/g, '').slice(0, 8);
  const seq = item.id.replace(/\D/g, '').padStart(4, '0');
  return `BXBJ${datePart}${seq}`;
}

function buildSummaryRows(item: ApprovalCardItem, comparisonNo: string) {
  const finalQuote = getFact(item, '最终报价').replace('¥', '');
  const insuranceType = getFact(item, '采购险种');
  const companyCount = getFact(item, '保险公司数量');

  return [
    { label: '比价单号', value: comparisonNo },
    { label: '采购状态', value: <Tag color="processing">审批中</Tag> },
    { label: '创建人', value: item.initiatedBy },
    { label: '创建时间', value: item.initiatedAt },
    { label: '车辆数', value: '1' },
    { label: '险种数', value: '1' },
    { label: '已确认报价数', value: '1' },
    { label: '确认报价总额', value: finalQuote },
    { label: '当前审批人', value: item.currentApprover ?? '-' },
    { label: '保险公司数量', value: companyCount },
    { label: '采购险种', value: insuranceType },
    { label: '中选保险公司', value: item.subtitle ?? '-' },
  ];
}

function buildVehicleRows(item: ApprovalCardItem): VehicleRow[] {
  const finalQuote = getFact(item, '最终报价').replace('¥', '');

  return [
    {
      key: '1',
      plateNo: item.title,
      vin: '-',
      insuranceType: getFact(item, '采购险种'),
      latestPaymentDate: getFact(item, '最晚付费日'),
      finalQuote,
      status: '审批中',
      approver: item.currentApprover ?? '-',
      remark: item.subtitle ?? '-',
    },
  ];
}

function buildQuoteRows(item: ApprovalCardItem): QuoteRow[] {
  const winner = item.subtitle ?? '国元农业保险上海分公司';
  const finalAmount = getFact(item, '最终报价').replace('¥', '');

  return [
    { key: '1', company: '国任财产保险股份有限公司广东分公司', amount: '111.00', isFinal: false, remark: '-' },
    { key: '2', company: winner, amount: finalAmount, isFinal: true, remark: '-' },
    { key: '3', company: '中国平安财产保险股份有限公司上海分公司', amount: '888.00', isFinal: false, remark: '-' },
  ];
}

export function InsuranceComparisonDetail({ item, onRefresh }: InsuranceComparisonDetailProps) {
  const [activeTab, setActiveTab] = useState('detail');
  const comparisonNo = buildComparisonNo(item);
  const statusLabel = formatStatusLabel(item);
  const typeLabel = item.typeLabel ?? '保险比价采购';
  const summaryRows = buildSummaryRows(item, comparisonNo);
  const vehicleRows = buildVehicleRows(item);
  const quoteRows = buildQuoteRows(item);

  const vehicleColumns: ColumnsType<VehicleRow> = [
    { title: '车牌号', dataIndex: 'plateNo', width: 110 },
    { title: 'VIN', dataIndex: 'vin', width: 120 },
    { title: '险种', dataIndex: 'insuranceType', width: 90 },
    { title: '最晚付费日', dataIndex: 'latestPaymentDate', width: 120 },
    { title: '最终报价', dataIndex: 'finalQuote', width: 100 },
    {
      title: '采购状态',
      dataIndex: 'status',
      width: 90,
      render: (value: string) => <Tag color="processing">{value}</Tag>,
    },
    { title: '当前审批人', dataIndex: 'approver', width: 120 },
    { title: '备注', dataIndex: 'remark', ellipsis: true },
  ];

  const quoteColumns: ColumnsType<QuoteRow> = [
    { title: '保险公司', dataIndex: 'company', ellipsis: true },
    { title: '报价金额', dataIndex: 'amount', width: 110 },
    {
      title: '最终',
      dataIndex: 'isFinal',
      width: 72,
      render: (isFinal: boolean) =>
        isFinal ? <Tag color="success">是</Tag> : <Text type="secondary">-</Text>,
    },
    { title: '备注', dataIndex: 'remark', width: 80 },
  ];

  return (
    <div className="ap-detail ap-detail--insurance">
      <div className="ap-detail__toolbar">
        <Space size={8}>
          <Text type="secondary">编号：</Text>
          <Text copyable={{ icon: <CopyOutlined />, text: comparisonNo }}>{comparisonNo}</Text>
        </Space>
        <Button type="text" icon={<ReloadOutlined />} onClick={onRefresh}>
          刷新
        </Button>
      </div>

      <div className="ap-detail__header">
        <div className="ap-detail__header-main">
          <Title level={4} className="ap-detail__title">
            {typeLabel}审批-{comparisonNo}
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
                <table className="ap-insurance-summary">
                  <tbody>
                    {Array.from({ length: Math.ceil(summaryRows.length / 2) }).map((_, rowIndex) => {
                      const left = summaryRows[rowIndex * 2];
                      const right = summaryRows[rowIndex * 2 + 1];
                      return (
                        <tr key={left.label}>
                          <th>{left.label}</th>
                          <td>{left.value}</td>
                          {right ? (
                            <>
                              <th>{right.label}</th>
                              <td>{right.value}</td>
                            </>
                          ) : (
                            <>
                              <th />
                              <td />
                            </>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                <div className="ap-insurance-table-section">
                  <Text strong className="ap-detail__section-title">
                    车辆明细
                  </Text>
                  <Table
                    className="ap-insurance-table"
                    columns={vehicleColumns}
                    dataSource={vehicleRows}
                    pagination={false}
                    size="small"
                    expandable={{
                      expandedRowRender: () => (
                        <Table
                          className="ap-insurance-quote-table"
                          columns={quoteColumns}
                          dataSource={quoteRows}
                          pagination={false}
                          size="small"
                        />
                      ),
                      defaultExpandedRowKeys: ['1'],
                    }}
                    scroll={{ x: 900 }}
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
