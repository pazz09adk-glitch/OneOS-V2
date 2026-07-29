import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  Upload,
  CheckCircle2,
  FileText,
  Trash2,
  ShieldAlert,
} from 'lucide-react';
import type {
  FaultRecord,
  FaultCategory,
  FaultLevel,
  FaultResolveStatus,
  FaultTaskStatus,
  FaultAttachment,
} from '../types';
import { V2Select } from '../../../resources/design-system/components/UIComponents';
import { normalizeCategories } from '../utils';

export interface FaultHandlePageProps {
  item: FaultRecord;
  onBack: () => void;
  onSave: (updatedItem: FaultRecord, isArchive: boolean) => void;
}

const CATEGORY_OPTIONS = [
  { value: '底盘系统', label: '底盘系统' },
  { value: '三电系统', label: '三电系统' },
  { value: '整车控制', label: '整车控制' },
  { value: '燃料电池系统', label: '燃料电池系统' },
  { value: '供氢系统', label: '供氢系统' },
  { value: '空调系统', label: '空调系统' },
  { value: '冷机系统', label: '冷机系统' },
  { value: '其他', label: '其他' },
];

const LEVEL_OPTIONS = [
  { value: 'L1-特急', label: 'L1-特急' },
  { value: 'L2-紧急', label: 'L2-紧急' },
  { value: 'L3-一般', label: 'L3-一般' },
  { value: 'L4-提示', label: 'L4-提示' },
];

const RESOLVE_OPTIONS = [
  { value: '未解决', label: '未解决' },
  { value: '临时排故', label: '临时排故' },
  { value: '已解决', label: '已解决' },
];

export const FaultHandlePage: React.FC<FaultHandlePageProps> = ({
  item,
  onBack,
  onSave,
}) => {
  const [formData, setFormData] = useState<Partial<FaultRecord>>({ ...item });
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    setFormData({ ...item });
    setValidationError(null);
  }, [item]);

  const handleAddMockFile = () => {
    const newAtt: FaultAttachment = {
      id: `att-${Date.now()}`,
      name: `索赔与维修证据照片_${Date.now().toString().slice(-4)}.jpg`,
      size: '2.8 MB',
      type: 'image',
      uploadTime: new Date().toLocaleString(),
    };
    setFormData((prev) => ({
      ...prev,
      attachments: [...(prev.attachments || []), newAtt],
    }));
  };

  const handleRemoveFile = (attId: string) => {
    setFormData((prev) => ({
      ...prev,
      attachments: (prev.attachments || []).filter((a) => a.id !== attId),
    }));
  };

  const handleSaveDraft = () => {
    const updated: FaultRecord = {
      ...item,
      ...formData,
      taskStatus:
        formData.taskStatus === 'pending'
          ? 'processing'
          : (formData.taskStatus as FaultTaskStatus),
      lastOperationTime: new Date().toLocaleString('zh-CN'),
      lastOperator: '张明辉',
    };
    onSave(updated, false);
  };

  const handleArchive = () => {
    setValidationError(null);
    const atts = formData.attachments || [];

    if (!formData.categories || formData.categories.length === 0) {
      setValidationError('归档失败：请至少选择 1 项【故障部位/分类】！');
      return;
    }
    if (!formData.level) {
      setValidationError('归档失败：请选择【故障等级】！');
      return;
    }
    if (!formData.faultLocation || !formData.faultLocation.trim()) {
      setValidationError('归档失败：请填报【故障发生地点】！');
      return;
    }
    if (!formData.repairResult || !formData.repairResult.trim()) {
      setValidationError('归档失败：请填写【维修处置总结与排故结果】！');
      return;
    }
    if (formData.resolveStatus !== '已解决') {
      setValidationError('归档失败：解决情况必须为【已解决】方可归档闭环！');
      return;
    }
    if (atts.length === 0) {
      setValidationError(
        '归档校验未通过：缺乏索赔证据链附件！必须至少上传 1 份照片或维修工单附件。'
      );
      return;
    }

    const updated: FaultRecord = {
      ...item,
      ...formData,
      taskStatus: 'archived',
      resolveStatus: '已解决',
      archivedTime: new Date().toLocaleString('zh-CN'),
      lastOperationTime: new Date().toLocaleString('zh-CN'),
      lastOperator: '张明辉',
    };
    onSave(updated, true);
  };

  return (
    <div className="v2-fh-page">
      <header className="v2-fh-form-header">
        <div className="v2-fh-form-header__left">
          <button type="button" className="v2-fh-form-header__back" onClick={onBack}>
            <ArrowLeft style={{ width: 14, height: 14 }} aria-hidden />
            返回
          </button>
          <div className="v2-fh-form-header__divider" aria-hidden />
          <div className="v2-fh-form-header__titles">
            <div className="v2-fh-form-header__meta">
              <span>车辆运维 / 故障处置</span>
              <span className="v2-fh-form-header__code">{item.id}</span>
              <span className="tabular-nums">{item.plate}</span>
            </div>
            <h1>故障处置与归档</h1>
          </div>
        </div>
        <div className="v2-fh-form-header__actions">
          <button
            type="button"
            className="v2-fh-btn v2-fh-btn--secondary"
            onClick={handleSaveDraft}
          >
            保存为处理中
          </button>
          <button
            type="button"
            className="v2-fh-btn v2-fh-btn--primary"
            onClick={handleArchive}
          >
            <CheckCircle2 style={{ width: 14, height: 14 }} aria-hidden />
            校验并立即归档
          </button>
        </div>
      </header>

      {validationError ? (
        <div className="v2-fh-page-alert" role="alert">
          <ShieldAlert style={{ width: 16, height: 16 }} aria-hidden />
          <span>{validationError}</span>
        </div>
      ) : null}

      <div className="v2-fh-page__body v2-fh-page__body--form">
        <section className="v2-fh-page-card">
          <h3 className="v2-fh-drawer-card__title">基础信息</h3>
          <div className="v2-fh-form-grid">
            <div className="v2-fh-filter-item">
              <label>
                故障部位 / 分类 <span className="v2-fh-req">*</span>
              </label>
              <V2Select
                multiple
                options={CATEGORY_OPTIONS}
                value={normalizeCategories(formData.categories)}
                onChange={(val) =>
                  setFormData((prev) => ({
                    ...prev,
                    categories: normalizeCategories(
                      (Array.isArray(val) ? val : [val]) as FaultCategory[]
                    ),
                  }))
                }
                placeholder="可多选故障部位"
              />
            </div>
            <div className="v2-fh-filter-item">
              <label>
                故障等级 <span className="v2-fh-req">*</span>
              </label>
              <V2Select
                options={LEVEL_OPTIONS}
                value={formData.level || 'L2-紧急'}
                onChange={(val) =>
                  setFormData((prev) => ({ ...prev, level: val as FaultLevel }))
                }
              />
            </div>
            <div className="v2-fh-filter-item">
              <label>
                解决情况 <span className="v2-fh-req">*</span>
              </label>
              <V2Select
                options={RESOLVE_OPTIONS}
                value={formData.resolveStatus || '未解决'}
                onChange={(val) =>
                  setFormData((prev) => ({
                    ...prev,
                    resolveStatus: val as FaultResolveStatus,
                  }))
                }
              />
            </div>
            <div className="v2-fh-filter-item">
              <label>维修估算/实际费用 (元)</label>
              <input
                type="number"
                className="v2-fh-input"
                placeholder="请输入费用"
                value={formData.repairCost ?? ''}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    repairCost: Number(e.target.value),
                  }))
                }
              />
            </div>
          </div>

          <div className="v2-fh-filter-item">
            <label>
              故障发生地点 / 报警路段 <span className="v2-fh-req">*</span>
            </label>
            <input
              type="text"
              className="v2-fh-input"
              placeholder="如：杭州市萧山区物流园1大道"
              value={formData.faultLocation || ''}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, faultLocation: e.target.value }))
              }
            />
          </div>

          <div className="v2-fh-filter-item">
            <label>维修工厂 / 合作特约服务站</label>
            <input
              type="text"
              className="v2-fh-input"
              placeholder="如：上海金山氢能产业园整车厂检修中心"
              value={formData.repairFactory || ''}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, repairFactory: e.target.value }))
              }
            />
          </div>

          <div className="v2-fh-filter-item">
            <label>
              维修处置总结与排故结果 <span className="v2-fh-req">*</span>
            </label>
            <textarea
              rows={4}
              className="v2-fh-input v2-fh-textarea"
              placeholder="请详细描述具体的排故手段、更换配件及测试结果..."
              value={formData.repairResult || ''}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, repairResult: e.target.value }))
              }
            />
          </div>
        </section>

        <section className="v2-fh-page-card">
          <div className="v2-fh-drawer-card__row">
            <h3 className="v2-fh-drawer-card__title">
              索赔与排故证据链附件 <span className="v2-fh-req">*</span>
            </h3>
            <button
              type="button"
              className="v2-fh-btn v2-fh-btn--secondary v2-fh-btn--sm"
              onClick={handleAddMockFile}
            >
              <Upload style={{ width: 14, height: 14 }} aria-hidden />
              模拟上传证据
            </button>
          </div>
          <p className="v2-fh-cell-sub">归档硬门槛：至少 1 份照片或维修工单。</p>
          <ul className="v2-fh-drawer-attach__list">
            {(formData.attachments || []).map((att) => (
              <li key={att.id} className="v2-fh-drawer-attach__item">
                <div className="v2-fh-drawer-attach__name">
                  <FileText style={{ width: 14, height: 14 }} aria-hidden />
                  <span>{att.name}</span>
                  <span className="v2-fh-drawer-attach__size">({att.size})</span>
                </div>
                <button
                  type="button"
                  className="v2-fh-drawer-icon-btn"
                  onClick={() => handleRemoveFile(att.id)}
                  aria-label="删除附件"
                >
                  <Trash2
                    style={{ width: 14, height: 14, color: 'var(--ln-error)' }}
                    aria-hidden
                  />
                </button>
              </li>
            ))}
          </ul>
          {(formData.attachments || []).length === 0 ? (
            <p className="v2-fh-drawer-empty">暂未上传附件</p>
          ) : null}
        </section>
      </div>
    </div>
  );
};
