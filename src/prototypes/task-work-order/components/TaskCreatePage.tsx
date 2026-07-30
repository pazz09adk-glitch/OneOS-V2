import React, { useRef, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import {
  V2Button,
  V2DatePicker,
  V2FieldLabel,
  V2Select,
  V2Toast,
  firstErrorFieldKey,
  scrollToFirstInvalidField,
} from '../../../resources/design-system/components/UIComponents';
import {
  CURRENT_USER,
  DATA_ADJUST_EXECUTOR_ID,
  DEFAULT_EXECUTOR_ID,
  getDeptSupervisorId,
  MOCK_OWNERS,
  MOCK_PURCHASE_CONTRACTS,
  MOCK_RELATED_BIZ_DOCS,
  TASK_TYPE_META,
  ownerName,
  vehiclesOfPurchaseContract,
  vehiclesOfRelatedBizDoc,
} from '../mockData';
import { getRelatedBizSelectOptions, relatedBizTypeLabel } from '../relatedBiz';
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
  /** create=发布新单；edit=保存已有工单修改 */
  mode?: 'create' | 'edit';
  /** 编辑态预填来源 */
  initialTask?: TaskWorkOrder | null;
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
  onChange,
  emptyHint,
  sourceLabel,
  invalid = false,
}: {
  vehicles: { id: string; plateNo: string; model: string }[];
  vehicleIds: string[];
  onChange: (ids: string[]) => void;
  emptyHint: string;
  /** 如合同号 / 业务单号，写入顶栏来源说明 */
  sourceLabel?: string;
  invalid?: boolean;
}) {
  if (!vehicles.length) {
    return <div className="v2-two-vehicle-cascade-hint">{emptyHint}</div>;
  }

  const allIds = vehicles.map((v) => v.id);
  const selectedCount = allIds.filter((id) => vehicleIds.includes(id)).length;
  const allSelected = selectedCount === allIds.length;

  const toggleBulk = () => {
    onChange(allSelected ? [] : allIds);
  };

  return (
    <div
      className={`v2-two-vehicle-pick-panel${invalid ? ' is-invalid' : ''}`}
      aria-invalid={invalid || undefined}
    >
      <div className="v2-two-vehicle-pick-bar">
        <p className="v2-two-vehicle-pick-source">
          {sourceLabel
            ? `已从 ${sourceLabel} 带出 ${allIds.length} 台，默认全选`
            : `共 ${allIds.length} 台可选，默认全选`}
        </p>
        <div className="v2-two-vehicle-pick-bulk">
          <span className="v2-two-vehicle-pick-count" aria-live="polite">
            已选 {selectedCount}/{allIds.length}
          </span>
          <button
            type="button"
            className="v2-two-vehicle-pick-link"
            onClick={toggleBulk}
            aria-label={allSelected ? '取消全选' : '全选全部车辆'}
          >
            {allSelected ? '取消全选' : '全选'}
          </button>
        </div>
      </div>
      <p className="v2-two-vehicle-pick-tip">
        下方计划与目标仅对勾选车辆生效；不需要的车牌点一下即可取消。
      </p>
      <div className="v2-two-vehicle-pick">
        {vehicles.map((v) => {
          const isChecked = vehicleIds.includes(v.id);
          return (
            <button
              key={v.id}
              type="button"
              className={`v2-two-vehicle-pick-btn ${isChecked ? 'is-on' : ''}`}
              onClick={() =>
                onChange(
                  isChecked
                    ? vehicleIds.filter((id) => id !== v.id)
                    : [...vehicleIds, v.id]
                )
              }
              aria-pressed={isChecked}
            >
              <span className="v2-two-mono">{v.plateNo}</span>（{v.model}）
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** 当前协同执行人字段说明 */
const EXECUTOR_FIELD_HINT =
  '任务实际跟进与反馈的责任人；可与归口责任人相同，也可另行指定。';

/** 归口责任人字段说明 */
const ACCOUNTABLE_FIELD_HINT =
  '部门级监督与闭环责任人；负责督办进度，通常可与执行人相同或为部门主管。';

const CREATE_FIELD_ORDER = [
  'taskType',
  'relatedBizType',
  'relatedBizId',
  'contractId',
  'vehicleIds',
  'title',
  'requirement',
  'periodStart',
  'periodEnd',
  'mileageTarget',
  'currentOwnerId',
  'accountableOwnerId',
  'adjustItems',
];

export const TaskCreatePage: React.FC<TaskCreatePageProps> = ({
  onBack,
  onSubmit,
  mode = 'create',
  initialTask = null,
}) => {
  const isEdit = mode === 'edit' && Boolean(initialTask);
  const formRef = useRef<HTMLDivElement>(null);
  const [title, setTitle] = useState(initialTask?.title || '');
  const [requirement, setRequirement] = useState(
    initialTask?.taskType === 'data_adjustment' ? '' : initialTask?.requirement || ''
  );
  const [taskType, setTaskType] = useState<TaskType>(initialTask?.taskType || 'general');
  const [relatedBizType, setRelatedBizType] = useState<RelatedBizType | ''>(
    initialTask?.relatedBizType || ''
  );
  const [relatedBizId, setRelatedBizId] = useState(initialTask?.relatedBizId || '');
  const [contractId, setContractId] = useState(
    initialTask?.contractId ||
      (initialTask?.taskType === 'mileage' ? initialTask.relatedBizId || '' : '')
  );
  const [adjustItems, setAdjustItems] = useState<DataAdjustItem[]>(
    initialTask?.dataAdjustItems?.length
      ? initialTask.dataAdjustItems.map((it) => ({ ...it }))
      : [newAdjustItem()]
  );
  const [periodStart, setPeriodStart] = useState(initialTask?.periodStart || '2026-08-01');
  const [periodEnd, setPeriodEnd] = useState(
    initialTask?.periodUnlimited || initialTask?.periodEnd === 'UNLIMITED'
      ? ''
      : initialTask?.periodEnd || '2026-08-31'
  );
  const [periodUnlimited, setPeriodUnlimited] = useState(
    Boolean(initialTask?.periodUnlimited || initialTask?.periodEnd === 'UNLIMITED')
  );
  const [changeRemark, setChangeRemark] = useState('');
  const [vehicleIds, setVehicleIds] = useState<string[]>(initialTask?.vehicleIds || []);
  const [mileageTarget, setMileageTarget] = useState(
    initialTask?.mileageTarget != null ? String(initialTask.mileageTarget) : ''
  );
  const [mileageMode, setMileageMode] = useState<MileageMode>(
    initialTask?.mileageMode || 'period_avg'
  );
  const [currentOwnerId, setCurrentOwnerId] = useState(
    initialTask?.currentOwnerId || DEFAULT_EXECUTOR_ID
  );
  const [accountableOwnerId, setAccountableOwnerId] = useState(
    initialTask?.accountableOwnerId || 'u_wang'
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [toast, setToast] = useState<{ message: string; title?: string } | null>(null);

  const isDataAdjust = taskType === 'data_adjustment';
  const isMileage = taskType === 'mileage';

  const relatedDocs = relatedBizType
    ? MOCK_RELATED_BIZ_DOCS.filter((d) => d.type === relatedBizType)
    : [];
  const selectedRelatedDoc = relatedDocs.find((d) => d.id === relatedBizId);
  const lockedRelatedDocLabel = selectedRelatedDoc
    ? `${selectedRelatedDoc.code} · ${selectedRelatedDoc.title}`
    : initialTask?.relatedBizCode || '—';

  const contractVehicles = vehiclesOfPurchaseContract(contractId);
  const relatedBizVehicles = vehiclesOfRelatedBizDoc(relatedBizId);
  const selectedContract = MOCK_PURCHASE_CONTRACTS.find((c) => c.id === contractId);

  const applyRelatedBizId = (id: string) => {
    setRelatedBizId(id);
    setVehicleIds(vehiclesOfRelatedBizDoc(id).map((v) => v.id));
  };

  const applyPurchaseContract = (id: string) => {
    setContractId(id);
    if (!id) {
      setVehicleIds([]);
      return;
    }
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

  const handleTaskTypeChange = (val: TaskType) => {
    if (isEdit) return;
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
      setCurrentOwnerId(DEFAULT_EXECUTOR_ID);
      setAccountableOwnerId('u_wang');
    }
  };

  const validate = (): Record<string, string> => {
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
      if (!periodUnlimited && !periodEnd) next.periodEnd = '请选择计划完成日期，或勾选不限';
      if (!mileageTarget.trim()) next.mileageTarget = '请填写目标公里数';
      if (!currentOwnerId) next.currentOwnerId = '请选择执行人';
      if (!accountableOwnerId) next.accountableOwnerId = '请选择归口责任人';
    } else {
      if (!requirement.trim()) next.requirement = '请填写执行要求说明';
      if (!periodStart) next.periodStart = '请选择计划开始日期';
      if (!periodUnlimited && !periodEnd) next.periodEnd = '请选择计划完成日期，或勾选不限';
      if (!currentOwnerId) next.currentOwnerId = '请选择执行人';
      if (!accountableOwnerId) next.accountableOwnerId = '请选择归口责任人';
    }

    setErrors(next);
    return next;
  };

  const handlePublish = () => {
    const next = validate();
    const errorCount = Object.keys(next).length;
    if (errorCount > 0) {
      const firstKey = firstErrorFieldKey(next, CREATE_FIELD_ORDER);
      setToast({
        title: isEdit ? '无法保存' : '无法发布',
        message: `还有 ${errorCount} 项必填未完善${firstKey && next[firstKey] ? `：${next[firstKey]}` : ''}`,
      });
      if (firstKey) {
        requestAnimationFrame(() =>
          scrollToFirstInvalidField(firstKey, formRef.current)
        );
      }
      return;
    }

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
        ...(isEdit ? { editChangeRemark: changeRemark.trim() || undefined } : {}),
      } as Partial<TaskWorkOrder> & { editChangeRemark?: string });
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
        periodEnd: periodUnlimited ? 'UNLIMITED' : periodEnd,
        periodUnlimited,
        mileageTarget: mileageTarget ? Number(mileageTarget) : undefined,
        mileageMode,
        currentOwnerId,
        accountableOwnerId,
        ...(isEdit ? { editChangeRemark: changeRemark.trim() || undefined } : {}),
      } as Partial<TaskWorkOrder> & { editChangeRemark?: string });
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
      periodEnd: periodUnlimited ? 'UNLIMITED' : periodEnd,
      periodUnlimited,
      mileageTarget: mileageTarget ? Number(mileageTarget) : undefined,
      mileageMode,
      currentOwnerId,
      accountableOwnerId,
      ...(isEdit ? { editChangeRemark: changeRemark.trim() || undefined } : {}),
    } as Partial<TaskWorkOrder> & { editChangeRemark?: string });

    if (ok === false) return;
  };

  const updateAdjustItem = (id: string, patch: Partial<DataAdjustItem>) => {
    setAdjustItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...patch } : it)));
  };

  const supervisorId = getDeptSupervisorId(CURRENT_USER.id);

  return (
    <div ref={formRef} className="v2-two-detail-page v2-two-create-page">
      <V2Toast
        open={Boolean(toast)}
        tone="error"
        title={toast?.title}
        message={toast?.message || ''}
        onClose={() => setToast(null)}
      />
      <header className="v2-two-form-header">
        <div className="v2-two-form-header__left">
          <V2Button variant="back" size="md" onClick={onBack}>
            返回台账
          </V2Button>
          <div className="v2-two-form-header__divider" aria-hidden />
          <div className="v2-two-form-header__titles">
            <div className="v2-two-form-header__title-row">
              {isEdit && initialTask?.code ? (
                <span className="v2-two-form-header__code">{initialTask.code}</span>
              ) : null}
              <h1>{isEdit ? '编辑工单' : '新增工单'}</h1>
            </div>
          </div>
        </div>
        <div className="v2-two-form-header__actions">
          <V2Button variant="ghost" size="md" onClick={onBack}>
            取消
          </V2Button>
          <V2Button variant="primary" size="md" onClick={handlePublish}>
            {isEdit ? '保存修改' : '发布工单'}
          </V2Button>
        </div>
      </header>

      <div className="v2-two-create-body">
        <div className="v2-two-detail-section">
          <div className="v2-two-create-grid">
            <div className="v2-two-filter-field" data-field="taskType">
              <V2FieldLabel required>工单类型</V2FieldLabel>
              {isEdit ? (
                <>
                  <input
                    type="text"
                    className="v2-two-text-input is-locked"
                    readOnly
                    value={TASK_TYPE_META[taskType]?.label || taskType}
                    aria-label="工单类型（不可修改）"
                  />
                  <div className="v2-two-field-hint">工单号与类型发布后不可修改。</div>
                </>
              ) : (
                <V2Select
                  invalid={Boolean(errors.taskType)}
                  value={taskType}
                  onChange={(val) => handleTaskTypeChange(val as TaskType)}
                  options={Object.entries(TASK_TYPE_META).map(([k, v]) => ({
                    value: k,
                    label: v.label,
                  }))}
                />
              )}
              {isDataAdjust && (
                <div className="v2-two-detail-muted" style={{ marginTop: 6, fontSize: 12 }}>
                  原微信群改数申请迁移至此：填写关联业务、业务单与改数明细；系统自动指定归口，交办数智中心（审批链路时间线演示）。
                </div>
              )}
              {errors.taskType && <div className="v2-two-field-error">{errors.taskType}</div>}
            </div>

            {isDataAdjust ? (
              <>
                <div className="v2-two-filter-field" data-field="relatedBizType">
                  <V2FieldLabel required>关联业务</V2FieldLabel>
                  {isEdit ? (
                    <>
                      <input
                        type="text"
                        className="v2-two-text-input is-locked"
                        readOnly
                        value={relatedBizTypeLabel(relatedBizType) || '—'}
                        aria-label="关联业务（不可修改）"
                      />
                      <div className="v2-two-field-hint">关联业务发布后不可修改。</div>
                    </>
                  ) : (
                    <V2Select
                      searchable
                      invalid={Boolean(errors.relatedBizType)}
                      value={relatedBizType}
                      onChange={(val) => {
                        setRelatedBizType(val as RelatedBizType | '');
                        setRelatedBizId('');
                      }}
                      placeholder="请选择关联业务"
                      options={getRelatedBizSelectOptions()}
                    />
                  )}
                  {errors.relatedBizType && (
                    <div className="v2-two-field-error">{errors.relatedBizType}</div>
                  )}
                </div>

                <div className="v2-two-filter-field" data-field="relatedBizId">
                  <V2FieldLabel required={relatedDocs.length > 0}>业务单</V2FieldLabel>
                  {isEdit ? (
                    <>
                      <input
                        type="text"
                        className="v2-two-text-input is-locked"
                        readOnly
                        value={lockedRelatedDocLabel}
                        aria-label="业务单（不可修改）"
                      />
                      <div className="v2-two-field-hint">关联业务单发布后不可修改。</div>
                    </>
                  ) : (
                    <V2Select
                      invalid={Boolean(errors.relatedBizId)}
                      value={relatedBizId}
                      onChange={(val) => setRelatedBizId(val as string)}
                      disabled={!relatedBizType}
                      placeholder={
                        !relatedBizType
                          ? '请先选择关联业务'
                          : relatedDocs.length
                            ? '请选择业务单'
                            : '该功能暂无系统业务单样例'
                      }
                      options={relatedDocs.map((d) => ({
                        value: d.id,
                        label: `${d.code} · ${d.title}`,
                      }))}
                    />
                  )}
                  {relatedBizType && relatedDocs.length === 0 && !isEdit && (
                    <div className="v2-two-field-hint" style={{ marginTop: 6, fontSize: 12, color: 'var(--ln-muted, #697386)' }}>
                      原型仅对部分模块提供样例单；无样例时可直接提交，以改数明细为准。
                    </div>
                  )}
                  {errors.relatedBizId && (
                    <div className="v2-two-field-error">{errors.relatedBizId}</div>
                  )}
                </div>

                <div className="v2-two-filter-field v2-two-create-span-2" data-field="title">
                  <V2FieldLabel required>任务名称</V2FieldLabel>
                  <input
                    type="text"
                    className={`v2-two-text-input${errors.title ? ' is-invalid' : ''}`}
                    aria-invalid={Boolean(errors.title) || undefined}
                    placeholder="简述本次数据调整协同事宜"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                  {errors.title && <div className="v2-two-field-error">{errors.title}</div>}
                </div>

                <div className="v2-two-filter-field v2-two-create-span-2" data-field="adjustItems">
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
                              className={`v2-two-text-input${errors[`adj-field-${idx}`] ? ' is-invalid' : ''}`}
                              aria-invalid={Boolean(errors[`adj-field-${idx}`]) || undefined}
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
                              className={`v2-two-text-input${errors[`adj-reason-${idx}`] ? ' is-invalid' : ''}`}
                              aria-invalid={Boolean(errors[`adj-reason-${idx}`]) || undefined}
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
                  <div className="v2-two-field-hint">{ACCOUNTABLE_FIELD_HINT}</div>
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
                  {isEdit ? (
                    <>
                      <input
                        type="text"
                        className="v2-two-text-input is-locked"
                        readOnly
                        value={
                          selectedContract
                            ? `${selectedContract.code} · ${selectedContract.supplierName} · ${selectedContract.vehicleModel}`
                            : initialTask?.contractCode || initialTask?.relatedBizCode || '—'
                        }
                        aria-label="采购合同（不可修改）"
                      />
                      <div className="v2-two-field-hint">采购合同发布后不可修改；仍可调整绑定车辆。</div>
                    </>
                  ) : (
                    <>
                      <V2Select
                        searchable
                        invalid={Boolean(errors.contractId)}
                        value={contractId}
                        onChange={(val) => applyPurchaseContract(val as string)}
                        placeholder="请选择采购合同"
                        options={MOCK_PURCHASE_CONTRACTS.map((c) => ({
                          value: c.id,
                          label: `${c.code} · ${c.supplierName} · ${c.vehicleModel}`,
                        }))}
                      />
                      <div className="v2-two-detail-muted" style={{ marginTop: 6, fontSize: 12 }}>
                        里程履约直接关联采购合同；选中后带出合同下全部车牌，默认全选。
                      </div>
                    </>
                  )}
                  {errors.contractId && (
                    <div className="v2-two-field-error">{errors.contractId}</div>
                  )}
                </div>

                <div className="v2-two-filter-field v2-two-create-span-2" data-field="vehicleIds">
                  <V2FieldLabel required>绑定车辆</V2FieldLabel>
                  {!contractId ? (
                    <div className="v2-two-vehicle-cascade-hint">
                      请先选择采购合同，系统将读出该合同下全部车牌。
                    </div>
                  ) : (
                    <VehiclePickList
                      vehicles={contractVehicles}
                      vehicleIds={vehicleIds}
                      onChange={setVehicleIds}
                      emptyHint="该采购合同暂无落库车辆。"
                      sourceLabel={selectedContract?.code || '采购合同'}
                      invalid={Boolean(errors.vehicleIds)}
                    />
                  )}
                  {errors.vehicleIds && (
                    <div className="v2-two-field-error">{errors.vehicleIds}</div>
                  )}
                </div>

                <div className="v2-two-filter-field v2-two-create-span-2" data-field="title">
                  <V2FieldLabel required>任务名称</V2FieldLabel>
                  <input
                    type="text"
                    className={`v2-two-text-input${errors.title ? ' is-invalid' : ''}`}
                    aria-invalid={Boolean(errors.title) || undefined}
                    placeholder="简述里程履约协同事宜"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                  {errors.title && <div className="v2-two-field-error">{errors.title}</div>}
                </div>

                <div className="v2-two-filter-field v2-two-create-span-2" data-field="requirement">
                  <V2FieldLabel required>执行要求说明</V2FieldLabel>
                  <textarea
                    className={`v2-two-textarea${errors.requirement ? ' is-invalid' : ''}`}
                    aria-invalid={Boolean(errors.requirement) || undefined}
                    rows={4}
                    placeholder="执行人可见的里程要求说明（隔离商业敏感信息）"
                    value={requirement}
                    onChange={(e) => setRequirement(e.target.value)}
                  />
                  {errors.requirement && (
                    <div className="v2-two-field-error">{errors.requirement}</div>
                  )}
                </div>

                <div className="v2-two-filter-field" data-field="periodStart">
                  <V2FieldLabel required>计划开始</V2FieldLabel>
                  <V2DatePicker invalid={Boolean(errors.periodStart)} value={periodStart} onChange={setPeriodStart} />
                  {errors.periodStart && (
                    <div className="v2-two-field-error">{errors.periodStart}</div>
                  )}
                </div>

                <div className="v2-two-filter-field" data-field="periodEnd">
                  <V2FieldLabel required={!periodUnlimited}>计划完成</V2FieldLabel>
                  <V2DatePicker
                    disabled={periodUnlimited}
                    invalid={Boolean(errors.periodEnd)}
                    value={periodUnlimited ? '' : periodEnd}
                    placeholder={periodUnlimited ? '不限' : '选择日期'}
                    onChange={(val) => {
                      setPeriodUnlimited(false);
                      setPeriodEnd(val);
                    }}
                  />
                  <div className="v2-two-period-unlimited-row">
                    <label>
                      <input
                        type="checkbox"
                        checked={periodUnlimited}
                        onChange={(e) => {
                          const on = e.target.checked;
                          setPeriodUnlimited(on);
                          if (on) {
                            setPeriodEnd('');
                            setErrors((prev) => {
                              const next = { ...prev };
                              delete next.periodEnd;
                              return next;
                            });
                          }
                        }}
                      />
                      不限（长期跟进，无固定完成日）
                    </label>
                  </div>
                  {errors.periodEnd && (
                    <div className="v2-two-field-error">{errors.periodEnd}</div>
                  )}
                </div>

                <div className="v2-two-filter-field" data-field="mileageTarget">
                  <V2FieldLabel required>里程目标 (km)</V2FieldLabel>
                  <input
                    type="number"
                    className={`v2-two-text-input${errors.mileageTarget ? ' is-invalid' : ''}`}
                    aria-invalid={Boolean(errors.mileageTarget) || undefined}
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

                <div className="v2-two-filter-field" data-field="currentOwnerId">
                  <V2FieldLabel required>当前协同执行人</V2FieldLabel>
                  <V2Select
                    invalid={Boolean(errors.currentOwnerId)}
                    value={currentOwnerId}
                    onChange={(val) => setCurrentOwnerId(val as string)}
                    options={MOCK_OWNERS.map((o) => ({
                      value: o.id,
                      label: `${o.name} (${o.dept})`,
                    }))}
                  />
                  <div className="v2-two-field-hint">{EXECUTOR_FIELD_HINT}</div>
                  {errors.currentOwnerId && (
                    <div className="v2-two-field-error">{errors.currentOwnerId}</div>
                  )}
                </div>

                <div className="v2-two-filter-field" data-field="accountableOwnerId">
                  <V2FieldLabel required>归口责任人</V2FieldLabel>
                  <V2Select
                    invalid={Boolean(errors.accountableOwnerId)}
                    value={accountableOwnerId}
                    onChange={(val) => setAccountableOwnerId(val as string)}
                    options={MOCK_OWNERS.map((o) => ({
                      value: o.id,
                      label: `${o.name} (${o.dept})`,
                    }))}
                  />
                  <div className="v2-two-field-hint">{ACCOUNTABLE_FIELD_HINT}</div>
                  {errors.accountableOwnerId && (
                    <div className="v2-two-field-error">{errors.accountableOwnerId}</div>
                  )}
                </div>

                {isEdit ? (
                  <div className="v2-two-filter-field v2-two-create-span-2">
                    <V2FieldLabel optional>变更说明</V2FieldLabel>
                    <textarea
                      className="v2-two-textarea"
                      rows={2}
                      placeholder="说明本次修改原因，将写入操作时间线（选填）"
                      value={changeRemark}
                      onChange={(e) => setChangeRemark(e.target.value)}
                    />
                  </div>
                ) : null}
              </>
            ) : (
              <>
                <div className="v2-two-filter-field">
                  <V2FieldLabel optional>关联业务</V2FieldLabel>
                  {isEdit ? (
                    <>
                      <input
                        type="text"
                        className="v2-two-text-input is-locked"
                        readOnly
                        value={relatedBizType ? relatedBizTypeLabel(relatedBizType) : '未关联'}
                        aria-label="关联业务（不可修改）"
                      />
                      <div className="v2-two-field-hint">关联业务发布后不可修改。</div>
                    </>
                  ) : (
                    <V2Select
                      searchable
                      value={relatedBizType}
                      onChange={(val) => {
                        setRelatedBizType(val as RelatedBizType | '');
                        setRelatedBizId('');
                        setVehicleIds([]);
                      }}
                      placeholder="请选择关联业务"
                      options={getRelatedBizSelectOptions()}
                    />
                  )}
                </div>

                <div className="v2-two-filter-field">
                  <V2FieldLabel optional>业务单</V2FieldLabel>
                  {isEdit ? (
                    <>
                      <input
                        type="text"
                        className="v2-two-text-input is-locked"
                        readOnly
                        value={lockedRelatedDocLabel === '—' && !relatedBizId ? '未关联' : lockedRelatedDocLabel}
                        aria-label="业务单（不可修改）"
                      />
                      <div className="v2-two-field-hint">关联业务单发布后不可修改。</div>
                    </>
                  ) : (
                    <V2Select
                      value={relatedBizId}
                      onChange={(val) => applyRelatedBizId(val as string)}
                      disabled={!relatedBizType}
                      placeholder={
                        !relatedBizType
                          ? '请先选择关联业务'
                          : relatedDocs.length
                            ? '请选择业务单'
                            : '该功能暂无系统业务单样例'
                      }
                      options={relatedDocs.map((d) => ({
                        value: d.id,
                        label: `${d.code} · ${d.title}`,
                      }))}
                    />
                  )}
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
                      onChange={setVehicleIds}
                      emptyHint="该业务单暂无可绑定车辆。"
                      sourceLabel="当前业务单"
                    />
                  )}
                </div>

                <div className="v2-two-filter-field v2-two-create-span-2" data-field="title">
                  <V2FieldLabel required>任务名称</V2FieldLabel>
                  <input
                    type="text"
                    className={`v2-two-text-input${errors.title ? ' is-invalid' : ''}`}
                    aria-invalid={Boolean(errors.title) || undefined}
                    placeholder="简述需办结的协同事宜"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                  {errors.title && <div className="v2-two-field-error">{errors.title}</div>}
                </div>

                <div className="v2-two-filter-field v2-two-create-span-2" data-field="requirement">
                  <V2FieldLabel required>执行要求说明</V2FieldLabel>
                  <textarea
                    className={`v2-two-textarea${errors.requirement ? ' is-invalid' : ''}`}
                    aria-invalid={Boolean(errors.requirement) || undefined}
                    rows={4}
                    placeholder="执行人可见的要求说明（隔离商业敏感信息）"
                    value={requirement}
                    onChange={(e) => setRequirement(e.target.value)}
                  />
                  {errors.requirement && (
                    <div className="v2-two-field-error">{errors.requirement}</div>
                  )}
                </div>

                <div className="v2-two-filter-field" data-field="periodStart">
                  <V2FieldLabel required>计划开始</V2FieldLabel>
                  <V2DatePicker invalid={Boolean(errors.periodStart)} value={periodStart} onChange={setPeriodStart} />
                  {errors.periodStart && (
                    <div className="v2-two-field-error">{errors.periodStart}</div>
                  )}
                </div>

                <div className="v2-two-filter-field" data-field="periodEnd">
                  <V2FieldLabel required={!periodUnlimited}>计划完成</V2FieldLabel>
                  <V2DatePicker
                    disabled={periodUnlimited}
                    invalid={Boolean(errors.periodEnd)}
                    value={periodUnlimited ? '' : periodEnd}
                    placeholder={periodUnlimited ? '不限' : '选择日期'}
                    onChange={(val) => {
                      setPeriodUnlimited(false);
                      setPeriodEnd(val);
                    }}
                  />
                  <div className="v2-two-period-unlimited-row">
                    <label>
                      <input
                        type="checkbox"
                        checked={periodUnlimited}
                        onChange={(e) => {
                          const on = e.target.checked;
                          setPeriodUnlimited(on);
                          if (on) {
                            setPeriodEnd('');
                            setErrors((prev) => {
                              const next = { ...prev };
                              delete next.periodEnd;
                              return next;
                            });
                          }
                        }}
                      />
                      不限（长期跟进，无固定完成日）
                    </label>
                  </div>
                  {errors.periodEnd && (
                    <div className="v2-two-field-error">{errors.periodEnd}</div>
                  )}
                </div>

                <div className="v2-two-filter-field" data-field="currentOwnerId">
                  <V2FieldLabel required>当前协同执行人</V2FieldLabel>
                  <V2Select
                    invalid={Boolean(errors.currentOwnerId)}
                    value={currentOwnerId}
                    onChange={(val) => setCurrentOwnerId(val as string)}
                    options={MOCK_OWNERS.map((o) => ({
                      value: o.id,
                      label: `${o.name} (${o.dept})`,
                    }))}
                  />
                  <div className="v2-two-field-hint">{EXECUTOR_FIELD_HINT}</div>
                  {errors.currentOwnerId && (
                    <div className="v2-two-field-error">{errors.currentOwnerId}</div>
                  )}
                </div>

                <div className="v2-two-filter-field" data-field="accountableOwnerId">
                  <V2FieldLabel required>归口责任人</V2FieldLabel>
                  <V2Select
                    invalid={Boolean(errors.accountableOwnerId)}
                    value={accountableOwnerId}
                    onChange={(val) => setAccountableOwnerId(val as string)}
                    options={MOCK_OWNERS.map((o) => ({
                      value: o.id,
                      label: `${o.name} (${o.dept})`,
                    }))}
                  />
                  <div className="v2-two-field-hint">{ACCOUNTABLE_FIELD_HINT}</div>
                  {errors.accountableOwnerId && (
                    <div className="v2-two-field-error">{errors.accountableOwnerId}</div>
                  )}
                </div>

                {isEdit ? (
                  <div className="v2-two-filter-field v2-two-create-span-2">
                    <V2FieldLabel optional>变更说明</V2FieldLabel>
                    <textarea
                      className="v2-two-textarea"
                      rows={2}
                      placeholder="说明本次修改原因，将写入操作时间线（选填）"
                      value={changeRemark}
                      onChange={(e) => setChangeRemark(e.target.value)}
                    />
                  </div>
                ) : null}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
