import React from 'react';
import { HelpCircle, FileText, Clock, CheckCircle2, AlertCircle, XCircle } from 'lucide-react';
import { LeaseContractRecord } from '../types';

interface KpiCardsProps {
  records: LeaseContractRecord[];
  activeKpi: string;
  onKpiSelect: (kpiKey: string) => void;
  isDark: boolean;
}

export function KpiCards({ records, activeKpi, onKpiSelect, isDark }: KpiCardsProps) {
  const surface = isDark ? '#121418' : '#ffffff';
  const border = isDark ? '#23272f' : '#e3e8ee';
  const textPrimary = isDark ? '#f7fafc' : '#0a2540';
  const textSecondary = isDark ? '#a0aec0' : '#425466';
  const accent = '#533afd';
  const accentLight = isDark ? 'rgba(83, 58, 253, 0.18)' : '#e0e7ff';

  const totalCount = records.length;
  const draftCount = records.filter((r) => r.contractStatus === 'draft').length;
  const activeCount = records.filter((r) => r.contractStatus === 'active').length;
  const approvingCount = records.filter((r) => r.contractStatus === 'submitted').length;
  const terminatedCount = records.filter((r) => r.contractStatus === 'terminated').length;

  const cards = [
    { key: 'all', title: '全部合同', count: totalCount, icon: FileText, desc: '包含全部生命周期合同汇总' },
    { key: 'draft', title: '草稿箱', count: draftCount, icon: Clock, desc: '尚在草拟或被驳回待编辑的合同' },
    { key: 'active', title: '履约进行中', count: activeCount, icon: CheckCircle2, desc: '审批通过且在有效期内进行中合同' },
    { key: 'submitted', title: '审批中', count: approvingCount, icon: AlertCircle, desc: '已提交正处于审核/盖章流转中的合同' },
    { key: 'terminated', title: '已终止 / 归档', count: terminatedCount, icon: XCircle, desc: '到期自然终止或已办理退车归档合同' },
  ];

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 1fr)',
        gap: '14px',
        marginBottom: '20px',
      }}
    >
      {cards.map((c) => {
        const isSelected = activeKpi === c.key;
        const Icon = c.icon;
        return (
          <div
            key={c.key}
            onClick={() => onKpiSelect(c.key)}
            style={{
              background: isSelected ? accentLight : surface,
              border: `1px solid ${isSelected ? accent : border}`,
              borderRadius: '12px',
              padding: '16px',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              display: 'flex',
              flexDirection: 'column',
              justify: 'space-between',
              position: 'relative',
              boxShadow: isSelected
                ? '0 4px 12px rgba(83, 58, 253, 0.15)'
                : isDark
                ? 'none'
                : '0 2px 6px rgba(0,0,0,0.02)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span
                style={{
                  fontSize: '12px',
                  fontWeight: 600,
                  color: isSelected ? accent : textSecondary,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <Icon size={15} style={{ color: isSelected ? accent : textSecondary }} />
                {c.title}
              </span>
              <div title={c.desc} style={{ cursor: 'help' }}>
                <HelpCircle size={13} style={{ color: textSecondary, opacity: 0.7 }} />
              </div>
            </div>

            <div style={{ marginTop: '12px', display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
              <span
                style={{
                  fontSize: '24px',
                  fontWeight: 800,
                  fontFamily: 'JetBrains Mono, monospace',
                  color: isSelected ? accent : textPrimary,
                }}
              >
                {c.count}
              </span>
              <span style={{ fontSize: '11px', color: textSecondary }}>份</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
