import React, { useMemo, useState } from 'react';
import {
  AlertCircle,
  Check,
  CheckCircle2,
  Download,
  FileCheck,
  FileSpreadsheet,
  FileUp,
  Trash2,
  UploadCloud,
  UserCog,
  X,
} from 'lucide-react';
import type { VehicleRecord } from '../types';
import {
  OPERATE_STATUS_OPTIONS,
  OPS_STAFF,
  VEHICLE_SOURCE_OPTIONS,
  VEHICLE_STATUS_OPTIONS,
  createVehicleEditForm,
  applyVehicleEditForm,
  formatOperateCity,
  hasLastParkingArea,
  isNonOperating,
  NON_OPERATING_OPERATE_STATUS,
  resolveLastParkingAreaName,
  resolveLastParkingRegion,
  resolveOpsStaffCandidates,
} from '../utils/vehicle';
import { buildChinaOperateCityTree, operateCityValueToLocation, toOperateCityValue } from '../utils/filters';
import { downloadVehicleImportTemplate } from '../utils/importTemplate';
import { V2DatePicker, V2RadioGroup, V2Select, V2Tag } from '../../../resources/design-system/components/UIComponents';

function toSelectOptions(items: readonly string[]) {
  return items.map((item) => ({ value: item, label: item }));
}

/** 出厂年份：当前年起向前 40 年（V2 无独立 YearPicker，用 Select） */
function buildYearOptions(span = 40): { value: string; label: string }[] {
  const current = new Date().getFullYear();
  return Array.from({ length: span + 1 }, (_, i) => {
    const year = String(current - i);
    return { value: year, label: year };
  });
}

const YEAR_OPTIONS = buildYearOptions();

export function Toast({ message }: { message: string }) {
  if (!message) return null;
  return <div className="va-toast" role="status">{message}</div>;
}

export function OpsManagerModal({
  record,
  onClose,
  onSave,
}: {
  record: VehicleRecord;
  onClose: () => void;
  onSave: (managers: string[]) => void;
}) {
  const candidates = resolveOpsStaffCandidates(record);
  const [selected, setSelected] = useState<string[]>(record.opsManagers?.length ? record.opsManagers : []);
  const [query, setQuery] = useState('');
  const hasParking = hasLastParkingArea(record);
  const parkingRegion = resolveLastParkingRegion(record);
  const regionLabel = hasParking
    ? (parkingRegion ? formatOperateCity(parkingRegion) : resolveLastParkingAreaName(record))
    : '';
  const staffList = candidates.length ? candidates : OPS_STAFF;
  const listLabel = candidates.length ? '候选人（按最后停放区域过滤）' : '运维人员（手动选择）';
  const filteredStaff = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return staffList;
    return staffList.filter((staff) => (
      staff.name.toLowerCase().includes(q) || staff.role.toLowerCase().includes(q)
    ));
  }, [staffList, query]);

  const toggle = (name: string) => {
    setSelected((prev) => (
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    ));
  };

  return (
    <div
      className="va-modal-mask"
      role="dialog"
      aria-modal="true"
      aria-labelledby="ops-title"
      onClick={onClose}
    >
      <div
        className="va-modal va-modal-ops"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="va-modal-ops__accent" aria-hidden />
        <header className="va-modal-header">
          <div className="va-modal-title-wrap">
            <div className="va-modal-title-row">
              <UserCog size={18} className="va-modal-icon" aria-hidden />
              <h3 id="ops-title" className="va-modal-title">设置运维负责人</h3>
            </div>
            <div className="va-modal-ops__meta">
              <V2Tag type="primary" size="small" className="tabular-nums">{record.plateNo}</V2Tag>
              {regionLabel ? (
                <V2Tag type="default" size="small">{regionLabel}</V2Tag>
              ) : null}
            </div>
          </div>
          <button type="button" className="va-modal-close" onClick={onClose} aria-label="关闭">
            <X size={16} aria-hidden />
          </button>
        </header>

        <div className="va-modal-ops__body">
          <p className="va-modal-ops__hint is-clarify" role="note">
            运维负责人对应运维用户「区域」字段，命中车辆最后交车 / 停车场 / 维修站所在省市。自动匹配依据「最后停放区域」持久字段（不是列表当前停放展示）。交车后列表停放可能清空；未保留最后停放区域时需手动指派。
            <br />
            权限：所有运维可查看全部车辆与运维业务数据；仅该车运维负责人可生成待办并执行年审、调拨、异动、交车、还车、替换车等操作。可指定一名或多名，避免无人管理。
          </p>
          {!hasParking ? (
            <p className="va-modal-ops__hint" role="status">
              当前车辆未记录最后停放区域，无法按区域自动匹配。请点击下方名单指定一名或多名运维负责人。
            </p>
          ) : null}
          {hasParking && !candidates.length ? (
            <p className="va-modal-ops__hint" role="status">
              当前最后停放区域暂无配置运维人员，可从全部名单中手动选择一名或多名。
            </p>
          ) : null}

          {selected.length ? (
            <div className="va-modal-ops__selected" aria-label="已选运维负责人">
              {selected.map((name) => (
                <button
                  key={name}
                  type="button"
                  className="va-modal-ops__selected-chip"
                  onClick={() => toggle(name)}
                  title={`移除 ${name}`}
                >
                  {name}
                  <X size={12} aria-hidden />
                </button>
              ))}
            </div>
          ) : (
            <p className="va-modal-ops__selected-empty">尚未选择运维负责人</p>
          )}

          <label className="va-modal-ops__search">
            <span className="va-sr-only">搜索运维人员</span>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="搜索姓名或角色"
            />
          </label>

          <div className="va-modal-ops__section">
            <div className="va-modal-ops__label-row">
              <span className="va-modal-ops__label">{listLabel}</span>
              <span className="va-modal-ops__count tabular-nums">
                已选 {selected.length} · 共 {filteredStaff.length}
              </span>
            </div>
            <div className="va-modal-ops__list" role="group" aria-label={listLabel}>
              {filteredStaff.length ? filteredStaff.map((staff) => {
                const active = selected.includes(staff.name);
                return (
                  <button
                    key={staff.name}
                    type="button"
                    className={`va-modal-ops__person${active ? ' is-active' : ''}`}
                    aria-pressed={active}
                    onClick={() => toggle(staff.name)}
                  >
                    <span className="va-modal-ops__avatar" aria-hidden>
                      {staff.name.slice(0, 1)}
                    </span>
                    <span className="va-modal-ops__person-text">
                      <span className="va-modal-ops__person-name">{staff.name}</span>
                      <span className="va-modal-ops__person-role">{staff.role}</span>
                    </span>
                    <span className={`va-modal-ops__check${active ? ' is-on' : ''}`} aria-hidden>
                      {active ? <Check size={14} strokeWidth={2.5} /> : null}
                    </span>
                  </button>
                );
              }) : (
                <div className="va-modal-ops__list-empty" role="status">
                  没有匹配「{query.trim()}」的运维人员
                </div>
              )}
            </div>
          </div>
        </div>

        <footer className="va-modal-footer">
          <button type="button" className="va-btn va-btn-secondary" onClick={onClose}>取消</button>
          <button type="button" className="va-btn va-btn-primary" onClick={() => onSave(selected)}>
            保存
          </button>
        </footer>
      </div>
    </div>
  );
}

export function OperateCityModal({
  record,
  onClose,
  onSave,
}: {
  record: VehicleRecord;
  onClose: () => void;
  onSave: (location: string) => void;
}) {
  const tree = useMemo(() => buildChinaOperateCityTree(), []);
  const [province, setProvince] = useState(() => formatOperateCity(record.location).split('-')[0] || tree[0]?.province || '');
  const cities = tree.find((n) => n.province === province)?.cities || [];
  const [city, setCity] = useState(cities[0] || province);

  return (
    <div className="va-modal-mask" role="dialog" aria-modal="true" aria-labelledby="city-title">
      <div className="va-modal">
        <h3 id="city-title">修改运营城市</h3>
        <p className="va-modal-desc">保存后数据来源标记为「人工」，并记录本次修改时间为更新时间</p>
        <div className="va-filter-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
          <div className="va-field">
            <label htmlFor="va-city-province">省</label>
            <V2Select
              options={toSelectOptions(tree.map((n) => n.province))}
              value={province}
              searchable
              placeholder="请选择省"
              onChange={(next) => {
                const nextProvince = String(next || '');
                setProvince(nextProvince);
                const nextCities = tree.find((n) => n.province === nextProvince)?.cities || [];
                setCity(nextCities[0] || nextProvince);
              }}
            />
          </div>
          <div className="va-field">
            <label htmlFor="va-city-city">市</label>
            <V2Select
              options={toSelectOptions(cities)}
              value={city}
              searchable
              placeholder="请选择市"
              onChange={(next) => setCity(String(next || ''))}
            />
          </div>
        </div>
        <div className="va-modal-actions">
          <button type="button" className="va-btn va-btn-secondary" onClick={onClose}>取消</button>
          <button
            type="button"
            className="va-btn va-btn-primary"
            onClick={() => onSave(operateCityValueToLocation(toOperateCityValue(province, city)))}
          >
            保存
          </button>
        </div>
      </div>
    </div>
  );
}

export function VehicleEditModal({
  record,
  onClose,
  onSave,
}: {
  record: VehicleRecord;
  onClose: () => void;
  onSave: (next: VehicleRecord) => void;
}) {
  const [form, setForm] = useState(() => createVehicleEditForm(record));
  const canSave = Boolean(form.operateStatus && form.vehicleStatus);
  const nonOperating = isNonOperating(record);
  const operateStatusOptions = nonOperating
    ? toSelectOptions([NON_OPERATING_OPERATE_STATUS])
    : toSelectOptions(OPERATE_STATUS_OPTIONS);

  return (
    <div className="va-modal-mask" role="dialog" aria-modal="true" aria-labelledby="edit-title">
      <div className="va-modal" style={{ width: 'min(640px, 100%)' }}>
        <h3 id="edit-title">编辑车辆 · {record.plateNo}</h3>
        <div className="va-filter-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
          <div className="va-field">
            <label>运营状态{nonOperating ? '（非运营台账固定）' : ''}</label>
            <V2Select
              options={operateStatusOptions}
              value={form.operateStatus}
              placeholder="请选择"
              disabled={nonOperating}
              onChange={(next) => setForm({ ...form, operateStatus: String(next || '') })}
            />
          </div>
          <div className="va-field">
            <label>车辆状态</label>
            <V2Select
              options={toSelectOptions(VEHICLE_STATUS_OPTIONS)}
              value={form.vehicleStatus}
              placeholder="请选择"
              onChange={(next) => setForm({ ...form, vehicleStatus: String(next || '') })}
            />
          </div>
          <div className="va-field">
            <label>车辆来源</label>
            <V2Select
              options={toSelectOptions(VEHICLE_SOURCE_OPTIONS)}
              value={form.vehicleSource}
              onChange={(next) => setForm({ ...form, vehicleSource: String(next || '') })}
            />
          </div>
          <div className="va-field">
            <label>出厂年份</label>
            <V2Select
              options={YEAR_OPTIONS}
              value={form.year}
              placeholder="选择出厂年份"
              searchable
              onChange={(next) => setForm({ ...form, year: String(next || '') })}
            />
          </div>
          <div className="va-field">
            <label>停车场</label>
            <input value={form.parking} onChange={(e) => setForm({ ...form, parking: e.target.value })} />
          </div>
          <div className="va-field">
            <label>采购入库日期</label>
            <V2DatePicker
              value={form.purchaseDate.slice(0, 10)}
              onChange={(next) => setForm({ ...form, purchaseDate: next })}
              placeholder="选择采购入库日期"
            />
          </div>
        </div>
        <div className="va-modal-actions">
          <button type="button" className="va-btn va-btn-secondary" onClick={onClose}>取消</button>
          <button
            type="button"
            className="va-btn va-btn-primary"
            disabled={!canSave}
            onClick={() => onSave(applyVehicleEditForm(record, form))}
          >
            保存
          </button>
        </div>
      </div>
    </div>
  );
}

const ARCHIVE_FIELD_META = {
  year: {
    title: '出厂年份',
    emptyHint: '补充后将写入车辆档案，并用于入库与生命周期节点展示。',
    filledHint: '修改后立即更新车辆档案。',
    placeholder: '选择出厂年份',
    toast: '已更新出厂年份',
  },
  purchaseDate: {
    title: '采购入库日期',
    emptyHint: '当前尚未维护采购入库日期。补充后将写入车辆档案，并作为入库节点时间依据。',
    filledHint: '修改后立即更新车辆档案。',
    placeholder: '选择采购入库日期',
    toast: '已更新采购入库日期',
  },
} as const;

export type ArchiveFieldKey = keyof typeof ARCHIVE_FIELD_META;

function isArchiveUnset(value: unknown): boolean {
  return value === null || value === undefined || value === '' || value === '-' || value === '无';
}

/** 详情档案信息：单字段弹出维护（出厂年份 / 采购入库日期） */
export function ArchiveFieldModal({
  field,
  record,
  onClose,
  onSave,
}: {
  field: ArchiveFieldKey;
  record: VehicleRecord;
  onClose: () => void;
  onSave: (patch: Partial<VehicleRecord>, toast: string) => void;
}) {
  const meta = ARCHIVE_FIELD_META[field];
  const initial = field === 'year'
    ? (isArchiveUnset(record.year) ? '' : String(record.year))
    : (isArchiveUnset(record.purchaseDate) ? '' : String(record.purchaseDate).slice(0, 10));
  const [draft, setDraft] = useState(initial);
  const isEmpty = isArchiveUnset(initial);
  const canSave = Boolean(draft) && draft !== initial;

  return (
    <div className="va-modal-mask" role="dialog" aria-modal="true" aria-labelledby="archive-field-title">
      <div className="va-modal va-modal--archive-field" style={{ width: 'min(420px, 100%)' }}>
        <h3 id="archive-field-title">
          {isEmpty ? '补充' : '修改'}{meta.title}
        </h3>
        <p className="va-modal-desc">{isEmpty ? meta.emptyHint : meta.filledHint}</p>
        <div className="va-field">
          <label>{meta.title}</label>
          {field === 'year' ? (
            <V2Select
              options={YEAR_OPTIONS}
              value={draft}
              placeholder={meta.placeholder}
              searchable
              onChange={(next) => setDraft(String(next || ''))}
            />
          ) : (
            <V2DatePicker
              value={draft}
              placeholder={meta.placeholder}
              onChange={(next) => setDraft(next)}
            />
          )}
        </div>
        <div className="va-modal-actions">
          <button type="button" className="va-btn va-btn-secondary" onClick={onClose}>取消</button>
          <button
            type="button"
            className="va-btn va-btn-primary"
            disabled={!canSave}
            onClick={() => onSave({ [field]: draft }, meta.toast)}
          >
            保存
          </button>
        </div>
      </div>
    </div>
  );
}

export type ImportDuplicateMode = 'skip' | 'overwrite' | 'error';

const IMPORT_DUP_OPTIONS = [
  {
    value: 'skip',
    label: '跳过重复',
    description: '已存在的记录不导入（按车辆识别代码比对）',
  },
  {
    value: 'overwrite',
    label: '覆盖重复',
    description: '使用本次导入内容覆盖已有记录',
  },
  {
    value: 'error',
    label: '报错',
    description: '重复行进入失败文件，其余行继续导入',
  },
] as const;

export function ImportModal({
  onClose,
  onImport,
}: {
  onClose: () => void;
  onImport: (file: File, duplicateMode: ImportDuplicateMode) => void;
}) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [duplicateMode, setDuplicateMode] = useState<ImportDuplicateMode>('skip');

  const handleDownloadTemplate = () => {
    downloadVehicleImportTemplate();
  };

  const handleFileSelect = (file: File) => {
    if (!file) return;
    setIsParsing(true);
    setTimeout(() => {
      setSelectedFile(file);
      setIsParsing(false);
    }, 400);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileSelect(file);
  };

  return (
    <div className="va-modal-mask" role="dialog" aria-modal="true" aria-labelledby="import-title">
      <div className="va-modal va-modal-import" style={{ width: 'min(800px, 100%)' }}>
        <div className="va-modal-header">
          <div className="va-modal-title-wrap">
            <div className="va-modal-title-row">
              <FileUp size={18} className="va-modal-icon" aria-hidden />
              <h3 id="import-title" className="va-modal-title">批量导入车辆资产</h3>
            </div>
            <p className="va-modal-desc">
              按标准 Excel 模板导入车辆台账；「车辆来源」须按下拉枚举选择；以「车辆识别代码」作为唯一标识处理重复记录
            </p>
          </div>
          <button type="button" className="va-modal-close" onClick={onClose} title="关闭弹窗">
            <X size={18} aria-hidden />
          </button>
        </div>

        <div className="va-import-body">
          <ol className="va-import-steps" aria-label="导入步骤">
            <li className={`va-import-step ${!selectedFile ? 'is-active' : 'is-done'}`}>
              <span className="va-step-idx" aria-hidden>{selectedFile ? <CheckCircle2 size={12} strokeWidth={2.5} /> : '1'}</span>
              <span className="va-step-txt">下载模板 / 准备数据</span>
            </li>
            <li className="va-step-line" aria-hidden />
            <li className={`va-import-step ${selectedFile ? 'is-active' : ''}`}>
              <span className="va-step-idx" aria-hidden>2</span>
              <span className="va-step-txt">重复处理与预检</span>
            </li>
            <li className="va-step-line" aria-hidden />
            <li className="va-import-step">
              <span className="va-step-idx" aria-hidden>3</span>
              <span className="va-step-txt">确认入库</span>
            </li>
          </ol>

          {!selectedFile ? (
            <div className="va-import-upload-flow">
              <div className="va-import-template-card">
                <div className="va-template-info">
                  <div className="va-template-icon-bg">
                    <FileSpreadsheet size={22} className="va-template-icon" />
                  </div>
                  <div>
                    <div className="va-template-title">下载标准车辆台账导入模板 (`.xlsx`)</div>
                    <div className="va-template-meta">「车辆来源」已设 Excel 下拉：自有 / 外租 / 挂靠，请勿自行填写</div>
                  </div>
                </div>
                <button
                  type="button"
                  className="va-btn va-btn-secondary va-btn-sm"
                  onClick={handleDownloadTemplate}
                  title="下载 Excel 模板；车辆来源列为数据有效性下拉"
                >
                  <Download size={14} />
                  下载模板
                </button>
              </div>

              <div
                className={`va-import-dropzone${isDragging ? ' is-dragging' : ''}${isParsing ? ' is-parsing' : ''}`}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  id="va-file-input"
                  accept=".csv,text/csv,.xlsx"
                  hidden
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileSelect(file);
                  }}
                />
                <label htmlFor="va-file-input" className="va-dropzone-label">
                  <div className="va-dropzone-icon-bg">
                    <UploadCloud size={28} className="va-dropzone-icon" />
                  </div>
                  <div className="va-dropzone-main-text">
                    {isParsing ? '正在对上传文件进行数据规范与重复项预检...' : '点击上传或将 CSV/Excel 文件拖拽至此处'}
                  </div>
                  <div className="va-dropzone-sub-text">
                    支持 `.csv` 或 `.xlsx` 格式文件，单文件上限 10MB，单次最高导入 2,000 条
                  </div>
                </label>
              </div>
            </div>
          ) : (
            <div className="va-import-preview-flow">
              <div className="va-import-file-bar">
                <div className="va-file-info">
                  <span className="va-file-icon-wrap" aria-hidden>
                    <FileCheck size={16} className="va-file-icon" />
                  </span>
                  <div className="va-file-copy">
                    <div className="va-file-name-row">
                      <span className="va-file-name" title={selectedFile.name}>{selectedFile.name}</span>
                      <span className="va-file-size tabular-nums">
                        {(selectedFile.size / 1024).toFixed(1)}
                        {' '}
                        KB
                      </span>
                    </div>
                    <span className="va-tag va-tag-ok">数据解析正常</span>
                  </div>
                </div>
                <button
                  type="button"
                  className="va-file-remove-btn"
                  onClick={() => setSelectedFile(null)}
                  title="移除并重新选择"
                >
                  <Trash2 size={15} aria-hidden />
                  <span>重新选择</span>
                </button>
              </div>

              <section className="va-import-panel" aria-labelledby="import-dup-title">
                <header className="va-import-panel__head">
                  <h4 id="import-dup-title" className="va-import-panel__title">
                    重复记录处理
                  </h4>
                  <p className="va-import-panel__hint">
                    主键为车辆识别代码；请选择已存在记录的处理策略
                  </p>
                </header>
                <V2RadioGroup
                  type="card"
                  className="va-import-dup__radios"
                  value={duplicateMode}
                  onChange={(next) => setDuplicateMode((next as ImportDuplicateMode) || 'skip')}
                  options={[...IMPORT_DUP_OPTIONS]}
                />
              </section>

              <section className="va-import-panel" aria-labelledby="import-preview-title">
                <header className="va-import-panel__head va-import-panel__head--row">
                  <div className="va-import-panel__head-main">
                    <h4 id="import-preview-title" className="va-import-panel__title">
                      预检结果
                    </h4>
                    <p className="va-import-panel__hint">拟导入数据摘要与前 3 行预览</p>
                  </div>
                  <div className="va-import-summary-grid" aria-label="预检统计">
                    <div className="va-summary-item is-pass">
                      <span className="va-summary-val tabular-nums">12</span>
                      <span className="va-summary-lbl">预检通过</span>
                    </div>
                    <div className="va-summary-item is-warn">
                      <span className="va-summary-val tabular-nums">1</span>
                      <span className="va-summary-lbl">可自动补全</span>
                    </div>
                    <div className="va-summary-item is-err">
                      <span className="va-summary-val tabular-nums">0</span>
                      <span className="va-summary-lbl">异常 / 重复</span>
                    </div>
                  </div>
                </header>

                <div className="va-import-table-wrap">
                  <table className="va-import-preview-table">
                    <thead>
                      <tr>
                        <th>车辆类型</th>
                        <th>公告型号</th>
                        <th>车牌号</th>
                        <th>车辆识别代码</th>
                        <th>车辆来源</th>
                        <th>来源公司</th>
                        <th>预检结果</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>运营车辆</td>
                        <td>帕力安4.5吨</td>
                        <td className="font-mono tabular-nums">浙A88888</td>
                        <td className="font-mono tabular-nums">LB9A32A25R0LS1581</td>
                        <td>自有</td>
                        <td>羚牛新能源科技（上海）有限公司</td>
                        <td><span className="va-tag va-tag-ok"><CheckCircle2 size={12} aria-hidden /> 通过</span></td>
                      </tr>
                      <tr>
                        <td>运营车辆</td>
                        <td>49吨牵引车头</td>
                        <td className="font-mono tabular-nums">粤A66666</td>
                        <td className="font-mono tabular-nums">LZYTDTD29P1012345</td>
                        <td>外租</td>
                        <td>某某租赁有限公司</td>
                        <td><span className="va-tag va-tag-ok"><CheckCircle2 size={12} aria-hidden /> 通过</span></td>
                      </tr>
                      <tr>
                        <td>非运营车辆</td>
                        <td>重型半挂牵引车</td>
                        <td className="font-mono tabular-nums">沪A01559F</td>
                        <td className="font-mono tabular-nums">LZZ1CLVB5PA123456</td>
                        <td>自有</td>
                        <td>羚牛新能源科技（上海）有限公司</td>
                        <td><span className="va-tag va-tag-warn"><AlertCircle size={12} aria-hidden /> 补全出厂年份</span></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>
            </div>
          )}
        </div>

        <div className="va-modal-footer">
          <button type="button" className="va-btn va-btn-ghost" onClick={onClose}>
            取消
          </button>
          <button
            type="button"
            className="va-btn va-btn-primary"
            disabled={!selectedFile}
            onClick={() => {
              if (selectedFile) onImport(selectedFile, duplicateMode);
            }}
          >
            {selectedFile ? '确认导入并入库 (12条)' : '请先选择上传文件'}
          </button>
        </div>
      </div>
    </div>
  );
}



