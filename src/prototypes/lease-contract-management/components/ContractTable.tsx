import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronRight,
  UserCheck,
  Trash2,
  PlusCircle,
  Clock,
  Paperclip,
  FileCheck,
  XSquare,
} from 'lucide-react';
import { OperationActions, type OperationActionItem } from '../../../common/OperationActions';
import '../../../common/vm-operation-actions.css';
import { LeaseContractRecord, VehicleItem } from '../types';
import { VehicleSubTable } from './VehicleSubTable';

interface ContractTableProps {
  records: LeaseContractRecord[];
  onViewContract: (record: LeaseContractRecord) => void;
  onEditContract: (record: LeaseContractRecord) => void;
  onDeleteContract: (record: LeaseContractRecord) => void;
  onWithdrawContract: (record: LeaseContractRecord) => void;
  onAddDelegates: (record: LeaseContractRecord) => void;
  onExtraFee: (record: LeaseContractRecord) => void;
  onTripartite: (record: LeaseContractRecord) => void;
  onTrialToFormal: (record: LeaseContractRecord) => void;
  onTerminateContract: (record: LeaseContractRecord) => void;
  onUploadStamp: (record: LeaseContractRecord) => void;
  onReturnVehicle: (vehicle: VehicleItem) => void;
  isDark: boolean;
}

export function ContractTable({
  records,
  onViewContract,
  onEditContract,
  onDeleteContract,
  onWithdrawContract,
  onAddDelegates,
  onExtraFee,
  onTripartite,
  onTrialToFormal,
  onTerminateContract,
  onUploadStamp,
  onReturnVehicle,
  isDark,
}: ContractTableProps) {
  const [expandedRowIds, setExpandedRowIds] = useState<Record<string, boolean>>({});

  const surface = isDark ? '#121418' : '#ffffff';
  const border = isDark ? '#23272f' : '#e3e8ee';
  const textPrimary = isDark ? '#f7fafc' : '#0a2540';
  const textSecondary = isDark ? '#a0aec0' : '#425466';
  const accent = '#533afd';
  const accentLight = isDark ? 'rgba(83, 58, 253, 0.18)' : '#e0e7ff';

  const buildRowActions = (r: LeaseContractRecord) => {
    const canEdit = r.contractStatus === 'draft' || r.approvalStatus === 'rejected';
    const more: OperationActionItem[] = [];
    if (r.contractStatus === 'draft') {
      more.push({
        key: 'delete',
        label: '删除草稿',
        danger: true,
        icon: Trash2,
        onClick: () => onDeleteContract(r),
      });
    }
    if (r.approvalStatus === 'approving') {
      more.push({
        key: 'withdraw',
        label: '撤回审批',
        icon: Clock,
        onClick: () => onWithdrawContract(r),
      });
    }
    if (r.contractStatus === 'active') {
      more.push(
        {
          key: 'extraFee',
          label: '附加费用',
          icon: PlusCircle,
          onClick: () => onExtraFee(r),
        },
        {
          key: 'toTripartite',
          label: '转三方协议',
          icon: Paperclip,
          onClick: () => onTripartite(r),
        },
        {
          key: 'terminate',
          label: '终止合同',
          danger: true,
          icon: XSquare,
          onClick: () => onTerminateContract(r),
        },
      );
    }
    if (r.contractTemplateCategory === 'trial') {
      more.push({
        key: 'toFormal',
        label: '试用转正式',
        icon: FileCheck,
        onClick: () => onTrialToFormal(r),
      });
    }
    if (r.approvalStatus === 'approved' && r.signingMethod === 'offline_stamp') {
      more.push({
        key: 'uploadStamped',
        label: '补传盖章件',
        icon: Paperclip,
        onClick: () => onUploadStamp(r),
      });
    }
    return {
      edit: canEdit ? { label: '编辑', onClick: () => onEditContract(r) } : undefined,
      view: { label: '查看记录', onClick: () => onViewContract(r) },
      more,
    };
  };

  const toggleExpandRow = (id: string) => {
    setExpandedRowIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const getApprovalStatusBadge = (r: LeaseContractRecord) => {
    const statusMap: Record<
      string,
      { label: string; bg: string; color: string; border: string }
    > = {
      approved: {
        label: '审批通过',
        bg: isDark ? 'rgba(16, 185, 129, 0.15)' : '#dcfce7',
        color: '#10b981',
        border: 'rgba(16, 185, 129, 0.3)',
      },
      approving: {
        label: '审批中',
        bg: isDark ? 'rgba(217, 119, 6, 0.15)' : '#fef3c7',
        color: '#d97706',
        border: 'rgba(217, 119, 6, 0.3)',
      },
      pending: {
        label: '待审批',
        bg: isDark ? 'rgba(59, 130, 246, 0.15)' : '#dbeafe',
        color: '#3b82f6',
        border: 'rgba(59, 130, 246, 0.3)',
      },
      rejected: {
        label: '审批驳回',
        bg: isDark ? 'rgba(239, 68, 68, 0.15)' : '#fee2e2',
        color: '#ef4444',
        border: 'rgba(239, 68, 68, 0.3)',
      },
      unsubmitted: {
        label: '未提交',
        bg: isDark ? '#1f2430' : '#f1f5f9',
        color: textSecondary,
        border: border,
      },
      terminated: {
        label: '已终止',
        bg: isDark ? '#1f2430' : '#f1f5f9',
        color: textSecondary,
        border: border,
      },
      withdrawn: {
        label: '已撤回',
        bg: isDark ? '#1f2430' : '#f1f5f9',
        color: textSecondary,
        border: border,
      },
    };

    const cfg = statusMap[r.approvalStatus] || statusMap['unsubmitted'];

    return (
      <div style={{ position: 'relative', display: 'inline-block' }}>
        <span
          style={{
            fontSize: '11px',
            fontWeight: 700,
            padding: '3px 8px',
            borderRadius: '6px',
            background: cfg.bg,
            color: cfg.color,
            border: `1px solid ${cfg.border}`,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          {cfg.label}
        </span>
        {r.currentApprover && (
          <div
            style={{
              fontSize: '10px',
              color: textSecondary,
              marginTop: '3px',
              whiteSpace: 'nowrap',
            }}
          >
            {r.currentApprover}
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      style={{
        background: surface,
        border: `1px solid ${border}`,
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: isDark ? 'none' : '0 2px 8px rgba(0,0,0,0.02)',
      }}
    >
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
          <thead>
            <tr
              style={{
                background: isDark ? '#16181f' : '#f8fafc',
                borderBottom: `1px solid ${border}`,
                color: textSecondary,
                height: '40px',
              }}
            >
              <th style={{ padding: '10px 14px', width: '40px' }} />
              <th style={{ padding: '10px 14px', fontWeight: 700 }}>项目名称 / 合同编号 / 客户</th>
              <th style={{ padding: '10px 14px', fontWeight: 700 }}>租赁订单 (交车明细)</th>
              <th style={{ padding: '10px 14px', fontWeight: 700 }}>签署与标准</th>
              <th style={{ padding: '10px 14px', fontWeight: 700 }}>审批状态与流转</th>
              <th style={{ padding: '10px 14px', fontWeight: 700 }}>签约公司主体</th>
              <th style={{ padding: '10px 14px', fontWeight: 700 }}>费用与保证金</th>
              <th style={{ padding: '10px 14px', fontWeight: 700 }}>受托人</th>
              <th style={{ padding: '10px 14px', fontWeight: 700, textAlign: 'right' }}>操作</th>
            </tr>
          </thead>
          <tbody>
            {records.map((r) => {
              const isExpanded = !!expandedRowIds[r.id];
              return (
                <React.Fragment key={r.id}>
                  <tr
                    style={{
                      borderBottom: `1px solid ${border}`,
                      color: textPrimary,
                      transition: 'background 0.15s ease',
                      height: '56px',
                    }}
                  >
                    {/* Expand Toggle Column */}
                    <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                      {r.vehicles && r.vehicles.length > 0 ? (
                        <button
                          type="button"
                          onClick={() => toggleExpandRow(r.id)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            color: accent,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '4px',
                          }}
                        >
                          {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                        </button>
                      ) : null}
                    </td>

                    {/* 1. Project Info */}
                    <td style={{ padding: '10px 14px' }}>
                      <div
                        onClick={() => onViewContract(r)}
                        style={{
                          fontWeight: 700,
                          color: textPrimary,
                          cursor: 'pointer',
                          marginBottom: '2px',
                        }}
                      >
                        {r.projectName}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px' }}>
                        <span style={{ fontFamily: 'monospace', fontWeight: 700, color: accent }}>
                          {r.code}
                        </span>
                        <span style={{ color: textSecondary }}>• {r.customerName}</span>
                      </div>
                    </td>

                    {/* 2. Lease Order & Vehicle Expand Counter */}
                    <td style={{ padding: '10px 14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '12px', color: textSecondary }}>总车辆:</span>
                        <span style={{ fontWeight: 800, fontFamily: 'monospace' }}>{r.totalVehicles} 辆</span>
                      </div>
                      <div style={{ marginTop: '2px' }}>
                        <button
                          type="button"
                          onClick={() => toggleExpandRow(r.id)}
                          style={{
                            background: isExpanded ? accentLight : 'transparent',
                            border: `1px solid ${accent}`,
                            borderRadius: '6px',
                            padding: '2px 8px',
                            fontSize: '11px',
                            fontWeight: 700,
                            color: accent,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          已交车: {r.deliveredVehiclesCount} 辆 {isExpanded ? '▲ 收起' : '▼ 展开子表'}
                        </button>
                      </div>
                    </td>

                    {/* 3. Signing Method & Standard Type */}
                    <td style={{ padding: '10px 14px' }}>
                      <div style={{ fontSize: '12px', fontWeight: 600 }}>
                        {r.signingMethod === 'online_esign' ? '线上电子签章 (E签宝)' : '线下人工签署 (盖章版)'}
                      </div>
                      <div style={{ fontSize: '11px', color: textSecondary, marginTop: '2px' }}>
                        {r.approvalType === 'standard' ? '标准规范合同' : '非标合同 (特批免责)'}
                      </div>
                    </td>

                    {/* 4. Approval Status */}
                    <td style={{ padding: '10px 14px' }}>{getApprovalStatusBadge(r)}</td>

                    {/* 5. Signing Company */}
                    <td style={{ padding: '10px 14px' }}>
                      <div style={{ fontSize: '12px', fontWeight: 600 }}>{r.signingCompany}</div>
                      <div style={{ fontSize: '11px', color: textSecondary, marginTop: '2px' }}>
                        部门: {r.businessDept} ({r.businessOwner})
                      </div>
                    </td>

                    {/* 6. Fee Info */}
                    <td style={{ padding: '10px 14px' }}>
                      <div style={{ fontWeight: 800, fontFamily: 'monospace', color: accent }}>
                        ¥{r.monthlyRentPerVehicle.toLocaleString()} /辆/月
                      </div>
                      <div style={{ fontSize: '11px', color: textSecondary, marginTop: '2px' }}>
                        {r.paymentPeriod} • 保证金 ¥{(r.depositAmount / 10000).toFixed(1)}万
                      </div>
                    </td>

                    {/* 7. Delegates */}
                    <td style={{ padding: '10px 14px' }}>
                      <button
                        type="button"
                        onClick={() => onAddDelegates(r)}
                        style={{
                          background: 'transparent',
                          border: `1px solid ${border}`,
                          borderRadius: '6px',
                          padding: '3px 8px',
                          fontSize: '11px',
                          fontWeight: 600,
                          color: textPrimary,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <UserCheck size={12} style={{ color: accent }} />
                        {r.delegates.length} 人授权
                      </button>
                    </td>

                    {/* 8. Actions — 常用编辑外显，查看记录进更多 */}
                    <td style={{ padding: '10px 14px', textAlign: 'right' }}>
                      {(() => {
                        const actions = buildRowActions(r);
                        return (
                          <div style={{ display: 'inline-flex', justifyContent: 'flex-end' }}>
                            <OperationActions
                              edit={actions.edit}
                              view={actions.view}
                              more={actions.more}
                            />
                          </div>
                        );
                      })()}
                    </td>
                  </tr>

                  {/* Expanded Row for Vehicle SubTable */}
                  {isExpanded && (
                    <tr>
                      <td colSpan={9} style={{ padding: '0 14px 14px 14px', background: surface }}>
                        <VehicleSubTable
                          record={r}
                          vehicles={r.vehicles}
                          filterMode="all"
                          onReturnVehicle={onReturnVehicle}
                          isDark={isDark}
                        />
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
