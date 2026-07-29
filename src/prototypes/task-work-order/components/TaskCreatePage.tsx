import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import {
  V2Button,
  V2DatePicker,
  V2FieldLabel,
  V2Select,
} from '../../../resources/design-system/components/UIComponents';
import {
  CURRENT_USER,
  DATA_ADJUST_EXECUTOR_ID,
  getDeptSupervisorId,
  MOCK_OWNERS,
  MOCK_PURCHASE_CONTRACTS,
  MOCK_RELATED_BIZ_DOCS,
  TASK_TYPE_META,
  ownerName,
  vehiclesOfPurchaseContract,
  vehiclesOfRelatedBizDoc,
} from '../mockData';
import { getRelatedBizSelectOptions } from '../relatedBiz';
import {
  DataAdjustItem,
  MileageMode,
  RelatedBizType,
  TaskType,
  TaskWorkOrder,
} from '../types';

interface TaskCreatePageProps {
  onBack: () => void;
  onSubmit: (taskData: Partial<TaskWorkOrder>) => boolean | void;
}

function newAdjustItem(): DataAdjustItem {
  return {
    id: `dai-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    fieldName: '',
    reason: '',
  };
}

function VehiclePickList({
  vehicles,
  vehicleIds,
  onToggle,
  emptyHint,
  hint,
}: {
  vehicles: { id: string; plateNo: string; model: string }[];
  vehicleIds: string[];
  onToggle: (id: string) => void;
  emptyHint: string;
  hint?: string;
}) {
  if (!vehicles.length) {
    return <div className="v2-two-vehicle-cascade-hint">{emptyHint}</div>;
  }
  return (
    <>
      {hint && (
        <div className="v2-two-detail-muted" style={{ marginBottom: 8, fontSize: 12 }}>
          {hint}
        </div>
      )}
      <div className="v2-two-vehicle-pick">
        {vehicles.map((v) => {
          const isChecked = vehicleIds.includes(v.id);
          return (
            <button
              key={v.id}
              type="button"
              className={`v2-two-vehicle-pick-btn ${isChecked ? 'is-on' : ''}`}
              onClick={() => onToggle(v.id)}
            >
              {v.plateNo}（{v.model}）
            </button>
          );
        })}
      </div>
    </>
  );
}

export const TaskCreatePage: React.FC<TaskCreatePageProps> = ({ onBack, onSubmit }) => {
  const [title, setTitle] = useState('');
  const [requirement, setRequirement] = useState('');
  const [taskType, setTaskType] = useState<TaskType>('general');
  const [relatedBizType, setRelatedBizType] = useState<RelatedBizType | ''>('');
  const [relatedBizId, setRelatedBizId] = useState('');
  const [contractId, setContractId] = useState('');
  const [adjustItems, setAdjustItems] = useState<DataAdjustItem[]>([newAdjustItem()]);
  const [periodStart, setPeriodStart] = useState('2026-08-01');
  const [periodEnd, setPeriodEnd] = useState('2026-08-31');
  const [vehicleIds, setVehicleIds] = useState<string[]>([]);
  const [mileageTarget, setMileageTarget] = useState('');
  const [mileageMode, setMileageMode] = useState<MileageMode>('period_avg');
  const [currentOwnerId, setCurrentOwnerId] = useState('u_zhao');
  const [accountableOwnerId, setAccountableOwnerId] = useState('u_wang');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isDataAdjust = taskType === 'data_adjustment';
  const isMileage = taskType === 'mileage';

  const relatedDocs = relatedBizType
    ? MOCK_RELATED_BIZ_DOCS.filter((d) => d.type === relatedBizType)
    : [];

  const contractVehicles = vehiclesOfPurchaseContract(contractId);
  const relatedBizVehicles = vehiclesOfRelatedBizDoc(relatedBizId);
  const selectedContract = MOCK_PURCHASE_CONTRACTS.find((c) => c.id === contractId);

  const applyRelatedBizId = (id: string) => {
    setRelatedBizId(id);
    setVehicleIds(vehiclesOfRelatedBizDoc(id).map((v) => v.id));
  };

  const applyPurchaseContract = (id: string) => {
    setContractId(id);
    const vehicles = vehiclesOfPurchaseContract(id);
    setVehicleIds(vehicles.map((v) => v.id));
    const contract = MOCK_PURCHASE_CONTRACTS.find((c) => c.id === id);
    if (contract) {
      if (!title.trim()) {
        setTitle(`${contract.code} · 里程履约目标`);
      }
      if (!requirement.trim() && contract.clauses.mileage) {
        setRequirement(contract.clauses.mileage);
      }
    }
  };

  const toggleVehicle = (id: string) => {
    setVehicleIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleTaskTypeChange = (val: TaskType) => {
    setTaskType(val);
    setErrors({});
    setRelatedBizType('');
    setRelatedBizId('');
    setContractId('');
    setVehicleIds([]);
    if (val === 'data_adjustment') {
      setCurrentOwnerId(DATA_ADJUST_EXECUTOR_ID);
      setAccountableOwnerId(getDeptSupervisorId(CURRENT_USER.id));
      setMileageTarget('');
      setRequirement('');
      if (!adjustItems.length) setAdjustItems([newAdjustItem()]);
    } else {
      setCurrentOwnerId('u_zhao');
      setAccountableOwnerId('u_wang');
    }
  };

  const validate = (): boolean => {
    const next: Record<string, string> = {};
    if (!taskType) next.taskType = '请选择工单类型';
    if (!title.trim()) next.title = '请填写任务名称';

    if (isDataAdjust) {
      if (!relatedBizType) next.relatedBizType = '请选择关联业务';
      if (relatedDocs.length > 0 && !relatedBizId) next.relatedBizId = '请选择业务单';
      adjustItems.forEach((item, idx) => {
        if (!item.fieldName.trim()) next[`adj-field-${idx}`] = '请填写修改字段';
        if (!item.reason.trim()) next[`adj-reason-${idx}`] = '请填写修改原因';
      });
      if (!adjustItems.length) next.adjustItems = '请至少新增一条改数明细';
    } else if (isMileage) {
      if (!contractId) next.contractId = '请选择采购合同';
      if (!vehicleIds.length) next.vehicleIds = '请至少勾选一台车辆';
      if (!requirement.trim()) next.requirement = '请填写执行要求说明';
      if (!periodStart) next.periodStart = '请选择计划开始日期';
      if (!periodEnd) next.periodEnd = '请选择计划完成日期';
      if (!mileageTarget.trim()) next.mileageTarget = '请填写目标公里数';
      if (!currentOwnerId) next.currentOwnerId = '请选择执行人';
      if (!accountableOwnerId) next.accountableOwnerId = '请选择归口责任人';
    } else {
      if (!requirement.trim()) next.requirement = '请填写执行要求说明';
      if (!periodStart) next.periodStart = '请选择计划开始日期';
      if (!periodEnd) next.periodEnd = '请选择计划完成日期';
      if (!currentOwnerId) next.currentOwnerId = '请选择执行人';
      if (!accountableOwnerId) next.accountableOwnerId = '请选择归口责任人';
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handlePublish = () => {
    if (!validate()) return;

    if (isDataAdjust) {
      const doc = MOCK_RELATED_BIZ_DOCS.find((d) => d.id === relatedBizId);
      const detailSummary = adjustItems
        .map((it) => `【${it.fieldName.trim()}】${it.reason.trim()}`)
        .join('；');

      const ok = onSubmit({
        source: 'standalone',
        title: title.trim(),
        requirement: detailSummary,
        taskType: 'data_adjustment',
        relatedBizType: relatedBizType || undefined,
        relatedBizId: doc?.id,
        relatedBizCode: doc?.code,
        contractId: doc?.type === 'purchase_contract' ? doc.id : undefined,
        contractCode: doc?.type === 'purchase_contract' ? doc.code : undefined,
        dataAdjustItems: adjustItems.map((it) => ({
          ...it,
          fieldName: it.fieldName.trim(),
          reason: it.reason.trim(),
        })),
        vehicleIds: [],
        currentOwnerId: DATA_ADJUST_EXECUTOR_ID,
        accountableOwnerId: getDeptSupervisorId(CURRENT_USER.id),
      });
      if (ok === false) return;
      return;
    }

    if (isMileage) {
      const contract = MOCK_PURCHASE_CONTRACTS.find((c) => c.id === contractId);
      const ok = onSubmit({
        source: 'standalone',
        title: title.trim(),
        requirement: requirement.trim(),
        taskType: 'mileage',
        relatedBizType: 'purchase_contract',
        relatedBizId: contract?.id,
        relatedBizCode: contract?.code,
        contractId: contract?.id,
        contractCode: contract?.code,
        vehicleIds,
        periodStart,
        periodEnd,
        mileageTarget: mileageTarget ? Number(mileageTarget) : undefined,
        mileageMode,
        currentOwnerId,
        accountableOwnerId,
      });
      if (ok === false) return;
      return;
    }

    const doc = relatedBizId
      ? MOCK_RELATED_BIZ_DOCS.find((d) => d.id === relatedBizId)
      : undefined;

    const ok = onSubmit({
      source: 'standalone',
      title: title.trim(),
      requirement: requirement.trim(),
      taskType,
      relatedBizType: doc?.type || (relatedBizType || undefined),
      relatedBizId: doc?.id,
      relatedBizCode: doc?.code,
      contractId: doc?.type === 'purchase_contract' ? doc.id : undefined,
      contractCode: doc?.type === 'purchase_contract' ? doc.code : undefined,
      vehicleIds,
      periodStart,
      periodEnd,
      mileageTarget: mileageTarget ? Number(mileageTarget) : undefined,
      mileageMode,
      currentOwnerId,
      accountableOwnerId,
    });

    if (ok === false) return;
  };

  const updateAdjustItem = (id: string, patch: Partial<DataAdjustItem>) => {
    setAdjustItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...patch } : it)));
  };

  const supervisorId = getDeptSupervisorId(CURRENT_USER.id);

  return (
    <div className="v2-two-detail-page v2-two-create-page">
      <header className="v2-two-form-header">
        <div className="v2-two-form-header__left">
          <V2Button variant="back" size="md" onClick={onBack}>
            返回台账
          </V2Button>
          <div className="v2-two-form-header__divider" aria-hidden />
          <div className="v2-two-form-header__titles">
            <h1>新增工单</h1>
          </div>
        </div>
        <div className="v2-two-form-header__actions">
          <V2Button variant="ghost" size="md" onClick={onBack}>
            取消
          </V2Button>
          <V2Button variant="primary" size="md" onClick={handlePublish}>
            发布工单
          </V2Button>
        </div>
      </header>

      <div className="v2-two-create-body">
        <div className="v2-two-detail-section">
          <div className="v2-two-create-grid">
            <div className="v2-two-filter-field">
              <V2FieldLabel required>工单类型</V2FieldLabel>
              <V2Select
                value={taskType}
                onChange={(val) => handleTaskTypeChange(val as TaskType)}
                options={Object.entries(TASK_TYPE_META).map(([k, v]) => ({
                  value: k,
                  label: v.label,
                }))}
              />
              {isDataAdjust && (
                <div className="v2-two-detail-muted" style={{ marginTop: 6, fontSize: 12 }}>
                  原微信群改数申请迁移至此：填写关联业务、业务单与改数明细；系统自动指定归口，交办数智中心（审批链路时间线演示）。
                </div>
              )}
              {errors.taskType && <div className="v2-two-field-error">{errors.taskType}</div>}
            </div>

            {isDataAdjust ? (
              <>
                <div className="v2-two-filter-field">
                  <V2FieldLabel required>关联业务</V2FieldLabel>
                  <V2Select
                    searchable
                    value={relatedBizType}
                    onChange={(val) => {
                      setRelatedBizType(val as RelatedBizType | '');
                      setRelatedBizId('');
                    }}
                    options={getRelatedBizSelectOptions()}
                  />
                  {errors.relatedBizType && (
                    <div className="v2-two-field-error">{errors.relatedBizType}</div>
                  )}
                </div>

                <div className="v2-two-filter-field">
                  <V2FieldLabel required={relatedDocs.length > 0}>业务单</V2FieldLabel>
                  <V2Select
                    value={relatedBizId}
                    onChange={(val) => setRelatedBizId(val as string)}
                    disabled={!relatedBizType}
                    options={[
                      {
                        value: '',
                        label: !relatedBizType
                          ? '请先选择关联业务'
                          : relatedDocs.length
                            ? '请选择业务单号'
                            : '该功能暂无系统业务单样例',
                      },
                      ...relatedDocs.map((d) => ({
                        value: d.id,
                        label: `${d.code} · ${d.title}`,
                      })),
                    ]}
                  />
                  {relatedBizType && relatedDocs.length === 0 && (
                    <div className="v2-two-field-hint" style={{ marginTop: 6, fontSize: 12, color: 'var(--ln-muted, #697386)' }}>
                      原型仅对部分模块提供样例单；无样例时可直接提交，以改数明细为准。
                    </div>
                  )}
                  {errors.relatedBizId && (
                    <div className="v2-two-field-error">{errors.relatedBizId}</div>
                  )}
                </div>

                <div className="v2-two-filter-field v2-two-create-span-2">
                  <V2FieldLabel required>任务名称</V2FieldLabel>
                  <input
                    type="text"
                    className="v2-two-text-input"
                    placeholder="简述本次数据调整协同事宜"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                  {errors.title && <div className="v2-two-field-error">{errors.title}</div>}
                </div>

                <div className="v2-two-filter-field v2-two-create-span-2">
                  <div className="v2-two-adjust-head">
                    <V2FieldLabel required>改数明细</V2FieldLabel>
                    <V2Button
                      variant="outline"
                      size="sm"
                      icon={<Plus size={14} />}
                      onClick={() => setAdjustItems((prev) => [...prev, newAdjustItem()])}
                    >
                      新增一条
                    </V2Button>
                  </div>
                  <div className="v2-two-detail-muted" style={{ marginBottom: 10, fontSize: 12 }}>
                    一单可提交同一业务下多条字段修改；每行填写修改字段与修改原因，至少保留一条。
                  </div>
                  {errors.adjustItems && (
                    <div className="v2-two-field-error">{errors.adjustItems}</div>
                  )}
                  <div className="v2-two-adjust-list">
                    {adjustItems.map((item, idx) => (
                      <div key={item.id} className="v2-two-adjust-row">
                        <div className="v2-two-adjust-row__meta">
                          <span className="v2-two-adjust-row__index">第 {idx + 1} 条</span>
                          <V2Button
                            variant="ghost"
                            size="sm"
                            icon={<Trash2 size={14} />}
                            disabled={adjustItems.length <= 1}
                            onClick={() =>
                              setAdjustItems((prev) =>
                                prev.length <= 1 ? prev : prev.filter((x) => x.id !== item.id)
                              )
                            }
                          >
                            删除一条
                          </V2Button>
                        </div>
                        <div className="v2-two-adjust-row__grid">
                          <div className="v2-two-filter-field">
                            <V2FieldLabel required>修改字段</V2FieldLabel>
                            <input
                              type="text"
                              className="v2-two-text-input"
                              placeholder="如：起租日、账单天数"
                              value={item.fieldName}
                              onChange={(e) =>
                                updateAdjustItem(item.id, { fieldName: e.target.value })
                              }
                            />
                            {errors[`adj-field-${idx}`] && (
                              <div className="v2-two-field-error">
                                {errors[`adj-field-${idx}`]}
                              </div>
                            )}
                          </div>
                          <div className="v2-two-filter-field v2-two-create-span-2">
                            <V2FieldLabel required>修改原因</V2FieldLabel>
                            <input
                              type="text"
                              className="v2-two-text-input"
                              placeholder="说明为何修改及目标值"
                              value={item.reason}
                              onChange={(e) =>
                                updateAdjustItem(item.id, { reason: e.target.value })
                              }
                            />
                            {errors[`adj-reason-${idx}`] && (
                              <div className="v2-two-field-error">
                                {errors[`adj-reason-${idx}`]}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="v2-two-filter-field">
                  <V2FieldLabel required>归口责任人</V2FieldLabel>
                  <input
                    type="text"
                    className="v2-two-text-input is-locked"
                    readOnly
                    value={`${ownerName(supervisorId)}（部门主管 · 自动选定）`}
                    aria-label="归口责任人（自动选定部门主管）"
                  />
                </div>

                <div className="v2-two-filter-field">
                  <V2FieldLabel required>数智中心处理人</V2FieldLabel>
                  <input
                    type="text"
                    className="v2-two-text-input is-locked"
                    readOnly
                    value={`${ownerName(DATA_ADJUST_EXECUTOR_ID)}（锁定）`}
                    aria-label="数智中心处理人（锁定王冕）"
                  />
                </div>
              </>
            ) : isMileage ? (
              <>
                <div className="v2-two-filter-field">
                  <V2FieldLabel required>采购合同</V2FieldLabel>
                  <V2Select
                    searchable
                    value={contractId}
                    onChange={(val) => applyPurchaseContract(val as string)}
                    options={[
                      { value: '', label: '请选择采购合同' },
                      ...MOCK_PURCHASE_CONTRACTS.map((c) => ({
                        value: c.id,
                        label: `${c.code} · ${c.supplierName} · ${c.vehicleModel}`,
                      })),
                    ]}
                  />
                  <div className="v2-two-detail-muted" style={{ marginTop: 6, fontSize: 12 }}>
                    里程履约直接关联采购合同；选中后带出合同下全部车牌，默认全选。
                  </div>
                  {errors.contractId && (
                    <div className="v2-two-field-error">{errors.contractId}</div>
                  )}
                </div>

                <div className="v2-two-filter-field v2-two-create-span-2">
                  <V2FieldLabel required>绑定车辆</V2FieldLabel>
                  {!contractId ? (
                    <div className="v2-two-vehicle-cascade-hint">
                      请先选择采购合同，系统将读出该合同下全部车牌。
                    </div>
                  ) : (
                    <VehiclePickList
                      vehicles={contractVehicles}
                      vehicleIds={vehicleIds}
                      onToggle={toggleVehicle}
                      emptyHint="该采购合同暂无落库车辆。"
                      hint={`已从${selectedContract?.code || '采购合同'}带出 ${contractVehicles.length} 台，默认全选；可取消勾选不纳入本次任务。下方计划起止与里程目标对勾选车辆统一生效。`}
                    />
                  )}
                  {errors.vehicleIds && (
                    <div className="v2-two-field-error">{errors.vehicleIds}</div>
                  )}
                </div>

                <div className="v2-two-filter-field v2-two-create-span-2">
                  <V2FieldLabel required>任务名称</V2FieldLabel>
                  <input
                    type="text"
                    className="v2-two-text-input"
                    placeholder="简述里程履约协同事宜"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                  {errors.title && <div className="v2-two-field-error">{errors.title}</div>}
                </div>

                <div className="v2-two-filter-field v2-two-create-span-2">
                  <V2FieldLabel required>执行要求说明</V2FieldLabel>
                  <textarea
                    className="v2-two-textarea"
                    rows={4}
                    placeholder="执行人可见的里程要求说明（隔离商业敏感信息）"
                    value={requirement}
                    onChange={(e) => setRequirement(e.target.value)}
                  />
                  {errors.requirement && (
                    <div className="v2-two-field-error">{errors.requirement}</div>
                  )}
                </div>

                <div className="v2-two-filter-field">
                  <V2FieldLabel required>计划开始</V2FieldLabel>
                  <V2DatePicker value={periodStart} onChange={setPeriodStart} />
                  {errors.periodStart && (
                    <div className="v2-two-field-error">{errors.periodStart}</div>
                  )}
                </div>

                <div className="v2-two-filter-field">
                  <V2FieldLabel required>计划完成</V2FieldLabel>
                  <V2DatePicker value={periodEnd} onChange={setPeriodEnd} />
                  {errors.periodEnd && (
                    <div className="v2-two-field-error">{errors.periodEnd}</div>
                  )}
                </div>

                <div className="v2-two-filter-field">
                  <V2FieldLabel required>里程目标 (km)</V2FieldLabel>
                  <input
                    type="number"
                    className="v2-two-text-input"
                    placeholder="统一目标公里数（勾选车辆共用）"
                    value={mileageTarget}
                    onChange={(e) => setMileageTarget(e.target.value)}
                  />
                  {errors.mileageTarget && (
                    <div className="v2-two-field-error">{errors.mileageTarget}</div>
                  )}
                </div>

                <div className="v2-two-filter-field">
                  <V2FieldLabel required>算力模式</V2FieldLabel>
                  <V2Select
                    value={mileageMode}
                    onChange={(val) => setMileageMode(val as MileageMode)}
                    options={[
                      { value: 'period_avg', label: '周期内单车均值' },
                      { value: 'cumulative', label: '单车累计里程' },
                    ]}
                  />
                </div>

                <div className="v2-two-filter-field">
                  <V2FieldLabel required>当前协同执行人</V2FieldLabel>
                  <V2Select
                    value={currentOwnerId}
                    onChange={(val) => setCurrentOwnerId(val as string)}
                    options={MOCK_OWNERS.map((o) => ({
                      value: o.id,
                      label: `${o.name} (${o.dept})`,
                    }))}
                  />
                  {errors.currentOwnerId && (
                    <div className="v2-two-field-error">{errors.currentOwnerId}</div>
                  )}
                </div>

                <div className="v2-two-filter-field">
                  <V2FieldLabel required>归口责任人</V2FieldLabel>
                  <V2Select
                    value={accountableOwnerId}
                    onChange={(val) => setAccountableOwnerId(val as string)}
                    options={MOCK_OWNERS.map((o) => ({
                      value: o.id,
                      label: `${o.name} (${o.dept})`,
                    }))}
                  />
                  {errors.accountableOwnerId && (
                    <div className="v2-two-field-error">{errors.accountableOwnerId}</div>
                  )}
                </div>
              </>
            ) : (
              <>
                <div className="v2-two-filter-field">
                  <V2FieldLabel optional>关联业务</V2FieldLabel>
                  <V2Select
                    searchable
                    value={relatedBizType}
                    onChange={(val) => {
                      setRelatedBizType(val as RelatedBizType | '');
                      setRelatedBizId('');
                      setVehicleIds([]);
                    }}
                    options={[
                      { value: '', label: '不关联' },
                      ...getRelatedBizSelectOptions(false),
                    ]}
                  />
                </div>

                <div className="v2-two-filter-field">
                  <V2FieldLabel optional>业务单</V2FieldLabel>
                  <V2Select
                    value={relatedBizId}
                    onChange={(val) => applyRelatedBizId(val as string)}
                    disabled={!relatedBizType}
                    options={[
                      {
                        value: '',
                        label: !relatedBizType
                          ? '请先选择关联业务'
                          : relatedDocs.length
                            ? '请选择业务单号'
                            : '该功能暂无系统业务单样例',
                      },
                      ...relatedDocs.map((d) => ({
                        value: d.id,
                        label: `${d.code} · ${d.title}`,
                      })),
                    ]}
                  />
                </div>

                <div className="v2-two-filter-field v2-two-create-span-2">
                  <V2FieldLabel optional>绑定车辆</V2FieldLabel>
                  {!relatedBizId ? (
                    <div className="v2-two-vehicle-cascade-hint">
                      请先选择工单类型 → 关联业务 → 业务单后，系统将读出可绑定车辆。
                    </div>
                  ) : (
                    <VehiclePickList
                      vehicles={relatedBizVehicles}
                      vehicleIds={vehicleIds}
                      onToggle={toggleVehicle}
                      emptyHint="该业务单暂无可绑定车辆。"
                      hint={`已根据业务单带出 ${relatedBizVehicles.length} 台车辆，可按需勾选。`}
                    />
                  )}
                </div>

                <div className="v2-two-filter-field v2-two-create-span-2">
                  <V2FieldLabel required>任务名称</V2FieldLabel>
                  <input
                    type="text"
                    className="v2-two-text-input"
                    placeholder="简述需办结的协同事宜"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                  {errors.title && <div className="v2-two-field-error">{errors.title}</div>}
                </div>

                <div className="v2-two-filter-field v2-two-create-span-2">
                  <V2FieldLabel required>执行要求说明</V2FieldLabel>
                  <textarea
                    className="v2-two-textarea"
                    rows={4}
                    placeholder="执行人可见的要求说明（隔离商业敏感信息）"
                    value={requirement}
                    onChange={(e) => setRequirement(e.target.value)}
                  />
                  {errors.requirement && (
                    <div className="v2-two-field-error">{errors.requirement}</div>
                  )}
                </div>

                <div className="v2-two-filter-field">
                  <V2FieldLabel required>计划开始</V2FieldLabel>
                  <V2DatePicker value={periodStart} onChange={setPeriodStart} />
                  {errors.periodStart && (
                    <div className="v2-two-field-error">{errors.periodStart}</div>
                  )}
                </div>

                <div className="v2-two-filter-field">
                  <V2FieldLabel required>计划完成</V2FieldLabel>
                  <V2DatePicker value={periodEnd} onChange={setPeriodEnd} />
                  {errors.periodEnd && (
                    <div className="v2-two-field-error">{errors.periodEnd}</div>
                  )}
                </div>

                <div className="v2-two-filter-field">
                  <V2FieldLabel required>当前协同执行人</V2FieldLabel>
                  <V2Select
                    value={currentOwnerId}
                    onChange={(val) => setCurrentOwnerId(val as string)}
                    options={MOCK_OWNERS.map((o) => ({
                      value: o.id,
                      label: `${o.name} (${o.dept})`,
                    }))}
                  />
                  {errors.currentOwnerId && (
                    <div className="v2-two-field-error">{errors.currentOwnerId}</div>
                  )}
                </div>

                <div className="v2-two-filter-field">
                  <V2FieldLabel required>归口责任人</V2FieldLabel>
                  <V2Select
                    value={accountableOwnerId}
                    onChange={(val) => setAccountableOwnerId(val as string)}
                    options={MOCK_OWNERS.map((o) => ({
                      value: o.id,
                      label: `${o.name} (${o.dept})`,
                    }))}
                  />
                  {errors.accountableOwnerId && (
                    <div className="v2-two-field-error">{errors.accountableOwnerId}</div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
