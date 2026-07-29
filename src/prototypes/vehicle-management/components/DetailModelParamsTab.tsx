import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import type { VehicleRecord } from '../types';
import { formatBrandModel } from '../utils/vehicle';
import {
  resolveVehicleModelParams,
  type VehicleModelParams,
} from '../utils/modelParams';

function isEmptyValue(value: string): boolean {
  return !value || value === '无' || value === '—' || value === '-';
}

function ParamField({
  label,
  value,
  span,
}: {
  label: string;
  value: string;
  span?: 2 | 'full';
}) {
  const empty = isEmptyValue(value);
  const spanClass = span === 'full'
    ? ' is-span-full'
    : span === 2
      ? ' is-span-2'
      : '';

  return (
    <div className={`va-description-item${spanClass}`}>
      <dt>{label}</dt>
      <dd className={empty ? 'is-empty' : undefined}>
        {empty ? '—' : value}
      </dd>
    </div>
  );
}

function ParamSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="va-detail-block va-model-param-section">
      <h3>{title}</h3>
      <dl className="va-description-grid">{children}</dl>
    </section>
  );
}

function MaintenanceTable({
  rows,
  labelledBy,
}: {
  rows: VehicleModelParams['maintenanceItems'];
  labelledBy: string;
}) {
  return (
    <div className="va-model-param-table-wrap">
      <table className="va-model-param-table" aria-labelledby={labelledBy}>
        <thead>
          <tr>
            <th scope="col">养护项目</th>
            <th scope="col">保养公里周期(KM)</th>
            <th scope="col">保养时间周期(月)</th>
            <th scope="col">工时费(元)</th>
            <th scope="col">材料费(元)</th>
            <th scope="col">合计(元)</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              <td>{row.item}</td>
              <td className="tabular-nums">{row.kmCycle}</td>
              <td className="tabular-nums">{row.monthCycle}</td>
              <td className="tabular-nums">{row.labor}</td>
              <td className="tabular-nums">{row.material}</td>
              <td className="tabular-nums">{row.total}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** 型号参数只读面板（由品牌车型「查看」打开，字段全量对齐型号「新增」表单） */
export function DetailModelParamsPanel({ record }: { record: VehicleRecord }) {
  const params = resolveVehicleModelParams(record);
  const maintenanceHeadingId = React.useId();

  return (
    <section className="va-model-param-tab" aria-label="型号参数（只读）">
      <ParamSection title="基本情况">
        <ParamField label="品牌" value={params.brand} />
        <ParamField label="型号" value={params.model} />
        <ParamField label="车辆类型" value={params.vehicleType} />
        <ParamField label="公告型号" value={params.announcementModel} />
        <ParamField label="燃料种类" value={params.fuelType} />
        <ParamField label="车牌颜色" value={params.plateColor} />
        <ParamField label="车辆长度(米)" value={params.lengthM} />
        <ParamField label="车辆宽度(米)" value={params.widthM} />
        <ParamField label="车辆高度(米)" value={params.heightM} />
      </ParamSection>

      <ParamSection title="轮胎情况">
        <ParamField label="轮胎数量" value={params.tireCount} />
        <ParamField label="轮胎磨损费用(元/mm)" value={params.tireWearFee} />
      </ParamSection>

      <ParamSection title="电气情况">
        <ParamField label="电池类型" value={params.batteryType} />
        <ParamField label="电池厂家" value={params.batteryVendor} span={2} />
        <ParamField label="储电量" value={params.energyCapacity} />
        <ParamField label="电续航里程(KM)" value={params.electricRangeKm} />
      </ParamSection>

      <ParamSection title="供氢系统情况">
        <ParamField label="氢瓶容量" value={params.hydrogenCapacity} />
        <ParamField label="仪表盘显示模式" value={params.gaugeMode} />
        <ParamField label="氢续航里程(KM)" value={params.hydrogenRangeKm} />
      </ParamSection>

      <ParamSection title="其他系统情况">
        <ParamField label="冷机厂家" value={params.coldUnitVendor} span="full" />
      </ParamSection>

      <section className="va-detail-block va-model-param-section">
        <h3 id={maintenanceHeadingId}>保养规则</h3>
        <MaintenanceTable
          rows={params.maintenanceItems}
          labelledBy={maintenanceHeadingId}
        />
      </section>
    </section>
  );
}

/** 兼容旧导出名 */
export const DetailModelParamsTab = DetailModelParamsPanel;

export function ModelParamsModal({
  record,
  onClose,
}: {
  record: VehicleRecord;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
      }
    };
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [onClose]);

  return (
    <div
      className="va-modal-mask"
      role="presentation"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        className="va-modal va-modal--model-params"
        role="dialog"
        aria-modal="true"
        aria-labelledby="model-params-title"
      >
        <div className="va-modal--model-params__head">
          <div className="va-modal--model-params__titles">
            <h3 id="model-params-title">型号参数</h3>
            <p className="va-modal-desc">
              {formatBrandModel(record, '无')}
              {' · '}
              <span className="tabular-nums">{record.plateNo}</span>
            </p>
          </div>
          <button
            type="button"
            className="va-license-preview__close"
            aria-label="关闭型号参数"
            onClick={onClose}
          >
            <X size={18} aria-hidden />
          </button>
        </div>
        <div className="va-modal--model-params__body">
          <DetailModelParamsPanel record={record} />
        </div>
      </div>
    </div>
  );
}
