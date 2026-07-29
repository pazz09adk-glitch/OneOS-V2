import React from 'react';
import { CornerDownRight } from 'lucide-react';
import {
  LeaseContractRecord,
  VehicleItem,
  canReturnVehicle,
  isApprovalPassed,
  isVehicleDelivered,
} from '../types';

export type VehicleExpandFilter = 'all' | 'delivered';

interface VehicleSubTableProps {
  record: LeaseContractRecord;
  vehicles: VehicleItem[];
  filterMode?: VehicleExpandFilter;
  onReturnVehicle: (vehicle: VehicleItem) => void;
  isDark: boolean;
}

function pickupLabel(v: VehicleItem) {
  if (v.pickupReceivableStatus === 'paid') return { text: '已支付', tone: 'green' as const };
  if (v.pickupReceivableStatus === 'processing') return { text: '支付中', tone: 'amber' as const };
  if (v.pickupReceivableStatus === 'none') return { text: '—', tone: 'muted' as const };
  return { text: '待支付', tone: 'red' as const };
}

function settlementLabel(v: VehicleItem) {
  if (!v.returned) return { text: '—', tone: 'muted' as const, approver: '' };
  if (v.returnSettlementStatus === 'settled') return { text: '已完成', tone: 'green' as const, approver: '' };
  if (v.returnSettlementStatus === 'approving')
    return { text: '审批中', tone: 'amber' as const, approver: v.returnApprover || '' };
  if (v.returnSettlementStatus === 'pending') return { text: '待提交', tone: 'blue' as const, approver: '' };
  return { text: '—', tone: 'muted' as const, approver: '' };
}

function mileagePeriodLabel(period?: LeaseContractRecord['mileagePeriod']) {
  if (period === 'quarter') return '每季度';
  if (period === 'year') return '每年度';
  return '每月';
}

/**
 * 嵌套车辆子表（对齐原原型 §7.2.1）
 * 列：车辆信息 | 提车应收款 | 交车 | 租赁账单 | 还车 | 还车应结款 | 交车安排 | 里程要求 | 里程完成情况 | 操作
 */
export function VehicleSubTable({
  record,
  vehicles,
  filterMode = 'all',
  onReturnVehicle,
  isDark,
}: VehicleSubTableProps) {
  const bg = isDark ? '#0f1115' : '#f1f5f9';
  const surface = isDark ? '#121418' : '#ffffff';
  const border = isDark ? '#23272f' : '#e3e8ee';
  const textPrimary = isDark ? '#f7fafc' : '#0a2540';
  const textSecondary = isDark ? '#a0aec0' : '#425466';
  const accent = '#533afd';
  const approved = isApprovalPassed(record);

  const rows =
    filterMode === 'delivered'
      ? vehicles.filter((v) => isVehicleDelivered(v, record))
      : vehicles;

  const toneBg = (tone: 'green' | 'amber' | 'red' | 'blue' | 'muted') => {
    if (tone === 'green') return isDark ? 'rgba(16,185,129,0.15)' : '#ecfdf5';
    if (tone === 'amber') return isDark ? 'rgba(217,119,6,0.15)' : '#fffbeb';
    if (tone === 'red') return isDark ? 'rgba(239,68,68,0.15)' : '#fef2f2';
    if (tone === 'blue') return isDark ? 'rgba(59,130,246,0.15)' : '#eff6ff';
    return isDark ? '#1f2430' : '#f1f5f9';
  };
  const toneColor = (tone: 'green' | 'amber' | 'red' | 'blue' | 'muted') => {
    if (tone === 'green') return '#10b981';
    if (tone === 'amber') return '#d97706';
    if (tone === 'red') return '#ef4444';
    if (tone === 'blue') return '#3b82f6';
    return textSecondary;
  };

  if (!rows.length) {
    return (
      <div
        style={{
          background: bg,
          border: `1px solid ${border}`,
          borderRadius: 8,
          padding: 20,
          textAlign: 'center',
          fontSize: 12,
          color: textSecondary,
        }}
      >
        {filterMode === 'delivered' ? '暂无已交车记录' : '暂无车辆明细'}
      </div>
    );
  }

  const th: React.CSSProperties = {
    padding: '10px 12px',
    fontWeight: 600,
    fontSize: 11,
    color: textSecondary,
    whiteSpace: 'nowrap',
    borderBottom: `1px solid ${border}`,
    background: isDark ? '#16181f' : '#fafbfc',
  };

  const td: React.CSSProperties = {
    padding: '12px',
    borderBottom: `1px solid ${border}`,
    verticalAlign: 'top',
    fontSize: 12,
    color: textPrimary,
    background: surface,
  };

  return (
    <div
      style={{
        background: bg,
        border: `1px solid ${border}`,
        borderRadius: 10,
        padding: '12px 14px 14px',
        margin: '4px 0 8px',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 10,
          gap: 8,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            fontSize: 12,
            fontWeight: 700,
            color: accent,
          }}
        >
          <CornerDownRight size={14} />
          {filterMode === 'delivered' ? '已交车车辆明细' : '合同车辆明细'}
          <span
            style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: 11,
              fontWeight: 700,
              background: isDark ? 'rgba(83,58,253,0.18)' : '#e0e7ff',
              color: accent,
              padding: '1px 8px',
              borderRadius: 10,
            }}
          >
            {rows.length} 辆
          </span>
        </div>
        <span style={{ fontSize: 11, color: textSecondary }}>
          {filterMode === 'delivered'
            ? '仅展示审批通过且已有实际交车时间的车辆'
            : '展示本合同下全部租赁车辆（含未交车）'}
          {!approved ? ' · 当前审批未通过，交车列按「未交车」口径展示' : ''}
        </span>
      </div>

      <div style={{ overflowX: 'auto', borderRadius: 8, border: `1px solid ${border}` }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 1100 }}>
          <thead>
            <tr>
              <th style={{ ...th, textAlign: 'left' }}>车辆信息</th>
              <th style={{ ...th, textAlign: 'left' }}>提车应收款</th>
              <th style={{ ...th, textAlign: 'left' }} title="交车情况">
                交车
              </th>
              <th style={{ ...th, textAlign: 'left' }}>租赁账单</th>
              <th style={{ ...th, textAlign: 'left' }} title="还车情况">
                还车
              </th>
              <th style={{ ...th, textAlign: 'left' }}>还车应结款</th>
              <th style={{ ...th, textAlign: 'left' }}>交车安排</th>
              <th style={{ ...th, textAlign: 'left' }}>里程要求</th>
              <th style={{ ...th, textAlign: 'left' }}>里程完成情况</th>
              <th style={{ ...th, textAlign: 'right' }}>操作</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((v) => {
              const delivered = isVehicleDelivered(v, record);
              const pickup = pickupLabel(v);
              const settle = settlementLabel(v);
              const canReturn = canReturnVehicle(v, record);
              const progress = Math.min(
                100,
                Math.max(
                  0,
                  v.mileageProgress != null
                    ? v.mileageProgress
                    : v.mileageTargetKm
                      ? ((v.currentMileageKm || 0) / v.mileageTargetKm) * 100
                      : 0
                )
              );

              return (
                <tr key={v.id}>
                  {/* 车辆信息：车牌 / VIN / 品牌·型号 */}
                  <td style={td}>
                    <div style={{ fontWeight: 700, fontFamily: 'JetBrains Mono, monospace', color: accent }}>
                      {v.plateNo || '—'}
                    </div>
                    <div style={{ fontSize: 11, color: textSecondary, fontFamily: 'monospace', marginTop: 2 }}>
                      VIN {v.vin || '—'}
                    </div>
                    <div style={{ fontSize: 11, color: textSecondary, marginTop: 2 }}>
                      {v.brand} · {v.model}
                    </div>
                    <div style={{ fontSize: 10, color: textSecondary, marginTop: 2 }}>{v.vehicleType}</div>
                  </td>

                  {/* 提车应收款 */}
                  <td style={td}>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        padding: '2px 8px',
                        borderRadius: 6,
                        background: toneBg(pickup.tone),
                        color: toneColor(pickup.tone),
                      }}
                    >
                      {pickup.text}
                    </span>
                  </td>

                  {/* 交车：里程 / 交车人 / 时间；未交车 */}
                  <td style={td}>
                    {delivered ? (
                      <div style={{ lineHeight: 1.55 }}>
                        <div style={{ fontFamily: 'monospace', fontWeight: 700 }}>
                          {v.deliveredMileage != null ? `${v.deliveredMileage.toLocaleString()} km` : '—'}
                        </div>
                        <div style={{ fontSize: 11, color: textSecondary }}>{v.deliveredBy || '—'}</div>
                        <div style={{ fontSize: 11, color: textSecondary, fontFamily: 'monospace' }}>
                          {v.deliveredAt || '—'}
                        </div>
                      </div>
                    ) : (
                      <span style={{ color: textSecondary }}>未交车</span>
                    )}
                  </td>

                  {/* 租赁账单：仅已交车 */}
                  <td style={td}>
                    {!delivered ? (
                      <span style={{ color: textSecondary }}>—</span>
                    ) : (
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          color: v.leaseBillStatus === 'overdue' ? '#ef4444' : '#10b981',
                        }}
                      >
                        {v.leaseBillStatus === 'overdue' ? '欠费' : '正常'}
                      </span>
                    )}
                  </td>

                  {/* 还车 */}
                  <td style={td}>
                    {v.returned ? (
                      <div style={{ lineHeight: 1.55 }}>
                        <div style={{ fontFamily: 'monospace', fontWeight: 700 }}>
                          {v.returnMileage != null ? `${v.returnMileage.toLocaleString()} km` : '—'}
                        </div>
                        <div style={{ fontSize: 11, color: textSecondary }}>{v.returnBy || '—'}</div>
                        <div style={{ fontSize: 11, color: textSecondary, fontFamily: 'monospace' }}>
                          {v.returnedAt || '—'}
                        </div>
                      </div>
                    ) : (
                      <span style={{ color: textSecondary }}>{delivered ? '未还车' : '—'}</span>
                    )}
                  </td>

                  {/* 还车应结款 */}
                  <td style={td}>
                    {!v.returned ? (
                      <span style={{ color: textSecondary }}>—</span>
                    ) : (
                      <div>
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 600,
                            padding: '2px 8px',
                            borderRadius: 6,
                            background: toneBg(settle.tone),
                            color: toneColor(settle.tone),
                          }}
                        >
                          {settle.text}
                        </span>
                        {settle.approver ? (
                          <div style={{ fontSize: 10, color: textSecondary, marginTop: 4 }}>
                            当前审批人：{settle.approver}
                          </div>
                        ) : null}
                      </div>
                    )}
                  </td>

                  {/* 交车安排：区域 + 计划/实际日期 */}
                  <td style={td}>
                    <div style={{ fontSize: 11, color: textPrimary }}>
                      {v.deliveryRegion || record.deliveryRegion}
                    </div>
                    <div style={{ fontSize: 11, color: textSecondary, fontFamily: 'monospace', marginTop: 2 }}>
                      {delivered
                        ? `实际 ${v.deliveredAt?.slice(0, 10) || '—'}`
                        : `计划 ${v.plannedDeliveryDate || record.deliveryDatePlan || '—'}`}
                    </div>
                  </td>

                  {/* 里程要求 */}
                  <td style={td}>
                    {!record.hasMinimumMileage ? (
                      <span style={{ color: textSecondary }}>无里程要求</span>
                    ) : (
                      <div>
                        <div style={{ fontWeight: 700, fontFamily: 'monospace' }}>
                          {(v.mileageTargetKm || record.mileageTargetKm || 0).toLocaleString()} km
                        </div>
                        <div style={{ fontSize: 10, color: textSecondary, marginTop: 2 }}>
                          {mileagePeriodLabel(record.mileagePeriod)}
                        </div>
                      </div>
                    )}
                  </td>

                  {/* 里程完成情况 */}
                  <td style={{ ...td, minWidth: 140 }}>
                    {!record.hasMinimumMileage || !delivered ? (
                      <span style={{ color: textSecondary }}>—</span>
                    ) : (
                      <div>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: 8,
                            marginBottom: 4,
                          }}
                        >
                          <span style={{ fontFamily: 'monospace', fontWeight: 700 }}>
                            余 {(v.remainingMileageKm ?? Math.max(0, (v.mileageTargetKm || 0) - (v.currentMileageKm || 0))).toLocaleString()} km
                          </span>
                          {v.mileageForecastStatus ? (
                            <span
                              style={{
                                fontSize: 10,
                                fontWeight: 600,
                                padding: '1px 6px',
                                borderRadius: 4,
                                background:
                                  v.mileageForecastStatus === '预计不足'
                                    ? toneBg('red')
                                    : toneBg('green'),
                                color:
                                  v.mileageForecastStatus === '预计不足'
                                    ? toneColor('red')
                                    : toneColor('green'),
                              }}
                            >
                              {v.mileageForecastStatus}
                            </span>
                          ) : null}
                        </div>
                        <div
                          style={{
                            height: 4,
                            background: isDark ? '#23272f' : '#e2e8ee',
                            borderRadius: 2,
                            overflow: 'hidden',
                          }}
                        >
                          <div
                            style={{
                              height: '100%',
                              width: `${progress}%`,
                              background: accent,
                            }}
                          />
                        </div>
                        <div style={{ fontSize: 10, color: textSecondary, marginTop: 4, fontFamily: 'monospace' }}>
                          {(v.currentMileageKm || 0).toLocaleString()} / {(v.mileageTargetKm || record.mileageTargetKm || 0).toLocaleString()} · {Math.round(progress)}%
                        </div>
                      </div>
                    )}
                  </td>

                  {/* 操作：审批通过 + 已交车 + 未还车 → 还车 */}
                  <td style={{ ...td, textAlign: 'right' }}>
                    {canReturn ? (
                      <button
                        type="button"
                        onClick={() => onReturnVehicle(v)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: accent,
                          fontSize: 12,
                          fontWeight: 700,
                          cursor: 'pointer',
                          padding: 0,
                        }}
                      >
                        还车
                      </button>
                    ) : (
                      <span style={{ color: textSecondary }}>—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
