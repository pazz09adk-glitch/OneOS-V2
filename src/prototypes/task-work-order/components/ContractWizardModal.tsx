import React, { useState } from 'react';
import { CheckCircle2, X, Lock, ChevronRight, ChevronLeft } from 'lucide-react';
import { V2Button, V2DatePicker, V2Select, V2Steps } from '../../../resources/design-system/components/UIComponents';
import { DEFAULT_EXECUTOR_ID, MOCK_OWNERS, MOCK_PURCHASE_CONTRACTS, MOCK_VEHICLES } from '../mockData';
import { TaskType, TaskWorkOrder } from '../types';

interface ContractWizardModalProps {
  open: boolean;
  onCancel: () => void;
  onSubmit: (taskData: Partial<TaskWorkOrder>) => boolean | void;
}

const CLAUSE_TYPES: { value: TaskType; label: string }[] = [
  { value: 'mileage', label: '里程履约' },
  { value: 'maintenance', label: '维保履约' },
  { value: 'policy', label: '政策兑现' },
  { value: 'payment', label: '付款节点' },
  { value: 'penalty', label: '条款跟进' },
  { value: 'general', label: '通用协同' },
];

export const ContractWizardModal: React.FC<ContractWizardModalProps> = ({
  open,
  onCancel,
  onSubmit,
}) => {
  const [currentStep, setCurrentStep] = useState(0);

  // Form state
  const [contractId, setContractId] = useState<string>('pc-001');
  const [clauseType, setClauseType] = useState<TaskType>('mileage');
  const [requirement, setRequirement] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [periodStart, setPeriodStart] = useState<string>('2026-08-01');
  const [periodEnd, setPeriodEnd] = useState<string>('2026-08-31');
  const [vehicleIds, setVehicleIds] = useState<string[]>(['v1', 'v2']);
  const [mileageTarget, setMileageTarget] = useState<string>('6000');
  const [mileageMode, setMileageMode] = useState<'period_avg' | 'cumulative'>('period_avg');
  const [currentOwnerId, setCurrentOwnerId] = useState<string>(DEFAULT_EXECUTOR_ID);
  const [accountableOwnerId, setAccountableOwnerId] = useState<string>('u_chen');

  if (!open) return null;

  const selectedContract = MOCK_PURCHASE_CONTRACTS.find((c) => c.id === contractId);

  const availableVehicles = MOCK_VEHICLES.filter(
    (v) => !contractId || v.contractId === contractId
  );

  const handleFinish = () => {
    const contract = MOCK_PURCHASE_CONTRACTS.find((c) => c.id === contractId);
    const clauseText =
      requirement || (contract?.clauses && contract.clauses[clauseType]) || '—';

    const ok = onSubmit({
      source: 'contract',
      contractId: contract?.id,
      contractCode: contract?.code,
      relatedBizType: 'purchase_contract',
      relatedBizId: contract?.id,
      relatedBizCode: contract?.code,
      taskType: clauseType,
      title: title || `${clauseType === 'mileage' ? '里程履约' : '协同任务'} · ${contract?.code}`,
      requirement: clauseText,
      vehicleIds,
      periodStart,
      periodEnd,
      mileageTarget: mileageTarget ? Number(mileageTarget) : undefined,
      mileageMode,
      currentOwnerId,
      accountableOwnerId,
    });

    if (ok === false) return;
    setCurrentStep(0);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        backgroundColor: 'rgba(0, 0, 0, 0.45)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      }}
    >
      <div
        style={{
          background: 'var(--v2-two-bg-card)',
          borderRadius: 12,
          border: '1px solid var(--v2-two-border)',
          width: '100%',
          maxWidth: 620,
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '90vh',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid var(--v2-two-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--v2-two-text-main)' }}>
            从采购合同发起任务工单
          </div>
          <button
            type="button"
            onClick={onCancel}
            style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#8898aa' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: 20, overflowY: 'auto', flex: 1 }}>
          <div style={{ marginBottom: 20 }}>
            <V2Steps
              current={currentStep}
              items={[
                { title: '选择合同与条款' },
                { title: '设置周期与绑车' },
                { title: '指派责任人' },
              ]}
            />
          </div>

          {currentStep === 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="v2-two-wizard-hint">
                <Lock size={13} style={{ display: 'inline', marginRight: 4 }} />
                选取采购合同生成协同工单；发布后执行人将在待办中处理，<strong>已进行商业隔离与文本脱敏</strong>。
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--v2-two-text-sub)', marginBottom: 4 }}>
                  选择采购合同 *
                </label>
                <V2Select
                  value={contractId}
                  onChange={(val) => setContractId(val as string)}
                  options={MOCK_PURCHASE_CONTRACTS.map((c) => ({
                    value: c.id,
                    label: `${c.code} · ${c.supplierName} (${c.vehicleModel} x${c.quantity})`,
                  }))}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--v2-two-text-sub)', marginBottom: 4 }}>
                  条款类型 *
                </label>
                <V2Select
                  value={clauseType}
                  onChange={(val) => {
                    const ct = val as TaskType;
                    setClauseType(ct);
                    if (selectedContract && selectedContract.clauses[ct]) {
                      setRequirement(selectedContract.clauses[ct] || '');
                    }
                  }}
                  options={CLAUSE_TYPES}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--v2-two-text-sub)', marginBottom: 4 }}>
                  条款摘要 (继承合同，可微调)
                </label>
                <textarea
                  rows={3}
                  value={requirement || (selectedContract?.clauses[clauseType] || '')}
                  onChange={(e) => setRequirement(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 6,
                    border: '1px solid var(--v2-two-border)',
                    background: 'var(--v2-two-bg-card)',
                    color: 'var(--v2-two-text-main)',
                    fontSize: 13,
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--v2-two-text-sub)', marginBottom: 4 }}>
                  工单任务名称
                </label>
                <input
                  type="text"
                  placeholder="留空自动生成，如：月里程≥6000km 履约跟踪"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  style={{
                    width: '100%',
                    height: 38,
                    padding: '0 12px',
                    borderRadius: 6,
                    border: '1px solid var(--v2-two-border)',
                    background: 'var(--v2-two-bg-card)',
                    color: 'var(--v2-two-text-main)',
                    fontSize: 13,
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>
          )}

          {currentStep === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="v2-two-wizard-hint">
                执行周期由业管自定义（支持跨月、跨年），绑定车辆后将自动汇总车机/GPS 里程进度。
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--v2-two-text-sub)', marginBottom: 4 }}>
                    周期开始日期 *
                  </label>
                  <V2DatePicker value={periodStart} onChange={setPeriodStart} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--v2-two-text-sub)', marginBottom: 4 }}>
                    周期结束日期 *
                  </label>
                  <V2DatePicker value={periodEnd} onChange={setPeriodEnd} />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--v2-two-text-sub)', marginBottom: 4 }}>
                  绑定车辆 (勾选可自动跟踪算力)
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {availableVehicles.map((v) => {
                    const isChecked = vehicleIds.includes(v.id);
                    return (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => {
                          setVehicleIds((prev) =>
                            isChecked ? prev.filter((id) => id !== v.id) : [...prev, v.id]
                          );
                        }}
                        style={{
                          padding: '6px 12px',
                          borderRadius: 6,
                          border: isChecked ? '1px solid var(--v2-two-primary)' : '1px solid var(--v2-two-border)',
                          background: isChecked ? 'var(--v2-two-primary-bg)' : 'var(--v2-two-bg-card)',
                          color: isChecked ? 'var(--v2-two-primary)' : 'var(--v2-two-text-main)',
                          cursor: 'pointer',
                          fontSize: 12,
                          fontWeight: isChecked ? 600 : 400,
                        }}
                      >
                        <span className="v2-two-mono">{v.plateNo}</span> ({v.model})
                      </button>
                    );
                  })}
                </div>
              </div>

              {(clauseType === 'mileage' || clauseType === 'policy') && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--v2-two-text-sub)', marginBottom: 4 }}>
                      里程目标 (km)
                    </label>
                    <input
                      type="number"
                      value={mileageTarget}
                      onChange={(e) => setMileageTarget(e.target.value)}
                      style={{
                        width: '100%',
                        height: 38,
                        padding: '0 12px',
                        borderRadius: 6,
                        border: '1px solid var(--v2-two-border)',
                        background: 'var(--v2-two-bg-card)',
                        color: 'var(--v2-two-text-main)',
                        fontSize: 13,
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--v2-two-text-sub)', marginBottom: 4 }}>
                      算力模式
                    </label>
                    <V2Select
                      value={mileageMode}
                      onChange={(val) => setMileageMode(val as any)}
                      options={[
                        { value: 'period_avg', label: '周期内单车均值' },
                        { value: 'cumulative', label: '单车累计里程' },
                      ]}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {currentStep === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--v2-two-text-sub)', marginBottom: 4 }}>
                  当前协同执行人 *
                </label>
                <V2Select
                  value={currentOwnerId}
                  onChange={(val) => setCurrentOwnerId(val as string)}
                  options={MOCK_OWNERS.map((o) => ({ value: o.id, label: `${o.name} (${o.dept})` }))}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--v2-two-text-sub)', marginBottom: 4 }}>
                  归口责任人 (固定监督，不因转交变更) *
                </label>
                <V2Select
                  value={accountableOwnerId}
                  onChange={(val) => setAccountableOwnerId(val as string)}
                  options={MOCK_OWNERS.map((o) => ({ value: o.id, label: `${o.name} (${o.dept})` }))}
                />
              </div>

              <div
                style={{
                  background: 'rgba(16, 185, 129, 0.1)',
                  border: '1px solid #10b981',
                  borderRadius: 6,
                  padding: '10px 12px',
                  fontSize: 12,
                  color: '#047857',
                }}
              >
                <CheckCircle2 size={14} style={{ flexShrink: 0, marginTop: 2 }} />
                发布后，该工单将即时同步至执行人的 OneOS 工作台待办，执行人可进行进度反馈与凭证上传。
              </div>
            </div>
          )}
        </div>

        <div className="v2-two-modal-footer">
          <V2Button variant="ghost" size="md" onClick={onCancel}>
            取消
          </V2Button>
          {currentStep > 0 && (
            <V2Button
              variant="secondary"
              size="md"
              icon={<ChevronLeft size={14} />}
              onClick={() => setCurrentStep((s) => s - 1)}
            >
              上一步
            </V2Button>
          )}
          {currentStep < 2 ? (
            <V2Button
              variant="primary"
              size="md"
              icon={<ChevronRight size={14} />}
              onClick={() => setCurrentStep((s) => s + 1)}
            >
              下一步
            </V2Button>
          ) : (
            <V2Button variant="primary" size="md" onClick={handleFinish}>
              发布工单
            </V2Button>
          )}
        </div>
      </div>
    </div>
  );
};
