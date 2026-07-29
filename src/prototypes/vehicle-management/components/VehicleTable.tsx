import React from 'react';
import { CircleHelp } from 'lucide-react';
import { OperationActions } from '../../../common/OperationActions';
import type { VehicleRecord } from '../types';
import {
  displayText,
  formatGpsTime,
  formatMileage,
  formatOperateCity,
  operateCitySourceTagClass,
  canEditOperateCity,
  canOpenLocationMap,
  resolveOperateCitySource,
  resolveOpsManagers,
  resolveProjectDelivery,
  resolveGpsLocationAddress,
  resolveThirdPartyLeaseCompany,
} from '../utils/vehicle';
import type { VehicleInsuranceExpire } from '../utils/insurance';
import { buildInsuranceStatusTooltip, resolveVehicleInsuranceExpire } from '../utils/insurance';
import { HandoverSituationCell } from './HandoverSituationCell';
import { InspectExpireCell } from './InspectExpireCell';
import { InsuranceExpireCell } from './InsuranceExpireCell';
import { StatusTag } from './StatusTag';

interface VehicleTableProps {
  records: VehicleRecord[];
  insuranceExpireMap: Map<string, VehicleInsuranceExpire>;
  canEditOpsManager: boolean;
  isAdmin: boolean;
  onView: (record: VehicleRecord) => void;
  onEdit: (record: VehicleRecord) => void;
  onEditOpsManager: (record: VehicleRecord) => void;
  onEditOperateCity: (record: VehicleRecord) => void;
  onOpenContract: (record: VehicleRecord, contractNo: string) => void;
  onOpenLicenseEdit: (record: VehicleRecord) => void;
  onOpenInsurancePurchase: (record: VehicleRecord, insuranceType: '交强险' | '商业险') => void;
  onOpenLocationMap: (record: VehicleRecord) => void;
  onOpenDeliveryManagement: (record: VehicleRecord) => void;
  onOpenReturnManagement: (record: VehicleRecord) => void;
}

const EMPTY = '';

function isClickableProjectField(value: string): boolean {
  return Boolean(value && value !== EMPTY);
}

function formatBrandModel(brand: string, model: string): string {
  const brandText = displayText(brand, EMPTY);
  const modelText = displayText(model, EMPTY);
  if (brandText && modelText) return `${brandText} · ${modelText}`;
  return brandText || modelText;
}

function operateStatusTone(status: string): 'green' | 'blue' | 'amber' | 'gray' {
  if (status === '租赁' || status === '物流') return 'green';
  if (
    status === '可运营'
    || status === '待运营'
    || status === '代运营'
    || status === '库存可交付'
    || status === '库存不可交付'
    || status === '在库-可交付'
    || status === '在库-不可交付'
  ) return 'amber';
  if (status === '退出运营') return 'gray';
  return 'blue';
}

function alertTone(status: string): 'green' | 'red' | 'gray' {
  if (status === '正常') return 'green';
  if (status === '异常') return 'red';
  return 'gray';
}

export function VehicleTable({
  records,
  insuranceExpireMap,
  canEditOpsManager,
  isAdmin,
  onView,
  onEdit,
  onEditOpsManager,
  onEditOperateCity,
  onOpenContract,
  onOpenLicenseEdit,
  onOpenInsurancePurchase,
  onOpenLocationMap,
  onOpenDeliveryManagement,
  onOpenReturnManagement,
}: VehicleTableProps) {
  if (records.length === 0) {
    return (
      <div className="vm-empty" data-annotation-id="vm-vehicle-table">
        <p>暂无符合条件的车辆</p>
      </div>
    );
  }

  return (
    <div className="vm-table-wrap" data-annotation-id="vm-vehicle-table">
      <table className="vm-table">
        <thead>
          <tr>
            <th className="sticky-col">车辆信息</th>
            <th>运营城市</th>
            <th>运营状态</th>
            <th>所属项目</th>
            <th>业务员</th>
            <th>停放区域</th>
            <th>里程数</th>
            <th>车辆状态</th>
            <th>证照状态</th>
            <th>检验有效期</th>
            <th>保险状态</th>
            <th>交强险到期时间</th>
            <th>商业险到期时间</th>
            <th>上次交车情况</th>
            <th>上次还车情况</th>
            <th>登记所有权</th>
            <th>
              <span className="vm-th-label">
                运营公司
                <span
                  className="vm-th-tip"
                  tabIndex={0}
                  role="note"
                  aria-label="运营公司说明"
                >
                  <CircleHelp size={13} aria-hidden />
                  <span className="vm-th-tooltip" role="tooltip">该车辆由羚牛哪个公司主体运营</span>
                </span>
              </span>
            </th>
            <th>车辆来源</th>
            <th>三方租赁公司</th>
            <th>当前位置</th>
            <th>运维负责人</th>
            <th className="sticky-right">操作</th>
          </tr>
        </thead>
        <tbody>
          {records.map((record) => {
            const ops = resolveOpsManagers(record);
            const online = record.onlineStatus === '在线';
            const citySource = resolveOperateCitySource(record);
            const cityText = formatOperateCity(record.location, EMPTY);
            const project = resolveProjectDelivery(record, EMPTY);
            const insurance = resolveVehicleInsuranceExpire(record.id, insuranceExpireMap);
            const thirdPartyLeaseCompany = resolveThirdPartyLeaseCompany(record, EMPTY);
            const cityEditable = canEditOperateCity(record);
            const locationAddress = resolveGpsLocationAddress(record, EMPTY);
            const locationMapOpenable = canOpenLocationMap(record);
            return (
              <tr key={record.id}>
                <td className="sticky-col">
                  <div className="vm-identity">
                    <button type="button" className="vm-link" onClick={() => onView(record)}>
                      {record.plateNo}
                    </button>
                    <button type="button" className="vm-link vm-vin" onClick={() => onView(record)}>
                      {record.vin}
                    </button>
                    <span className="vm-brand">{formatBrandModel(record.brand, record.model)}</span>
                  </div>
                </td>
                <td>
                  <div className="vm-cell-tags">
                    {cityEditable ? (
                      <button
                        type="button"
                        className="vm-link"
                        onClick={() => onEditOperateCity(record)}
                        title="点击修改运营城市"
                      >
                        {cityText}
                      </button>
                    ) : (
                      <span
                        title={
                          citySource === '车机'
                            ? '车机定位的运营城市不可修改'
                            : citySource === 'GPS'
                              ? 'GPS定位的运营城市不可修改'
                              : undefined
                        }
                      >
                        {cityText}
                      </span>
                    )}
                    {citySource && (
                      <span className={operateCitySourceTagClass(citySource)}>{citySource}</span>
                    )}
                  </div>
                </td>
                <td>
                  <StatusTag
                    label={record.operateStatus}
                    tone={operateStatusTone(record.operateStatus)}
                    emptyLabel={EMPTY}
                  />
                </td>
                <td>
                  <div className="vm-stack">
                    {isClickableProjectField(project.projectName) ? (
                      <button
                        type="button"
                        className="vm-link primary"
                        onClick={() => onOpenContract(record, project.contractNo)}
                      >
                        {project.projectName}
                      </button>
                    ) : (
                      <span className="primary">{project.projectName}</span>
                    )}
                    {isClickableProjectField(project.contractNo) ? (
                      <button
                        type="button"
                        className="vm-link code"
                        onClick={() => onOpenContract(record, project.contractNo)}
                      >
                        {project.contractNo}
                      </button>
                    ) : (
                      <span className="code">{project.contractNo}</span>
                    )}
                    <span className="sub">{project.companyName}</span>
                  </div>
                </td>
                <td>
                  <div className="vm-stack">
                    <span className="sub">{displayText(record.department, EMPTY)}</span>
                    <span className="primary">{displayText(record.manager, EMPTY)}</span>
                  </div>
                </td>
                <td>{displayText(record.parking, EMPTY)}</td>
                <td>
                  <div className="vm-cell-tags">
                    <span className="vm-mileage">{formatMileage(record.mileage, online, EMPTY)}</span>
                    {online && <span className="vm-tag vm-tag-teal">车机</span>}
                  </div>
                </td>
                <td>
                  <StatusTag label={record.vehicleStatus} tone="blue" emptyLabel={EMPTY} />
                </td>
                <td>
                  <StatusTag
                    label={record.licenseStatus}
                    tone={alertTone(record.licenseStatus)}
                    title={record.licenseStatus === '异常' ? '行驶证检验有效期已过期' : undefined}
                    emptyLabel={EMPTY}
                  />
                </td>
                <td>
                  <InspectExpireCell
                    expireDate={record.inspectExpire}
                    emptyLabel={EMPTY}
                    onClickNotUploaded={() => onOpenLicenseEdit(record)}
                  />
                </td>
                <td>
                  <StatusTag
                    label={record.insuranceStatus}
                    tone={alertTone(record.insuranceStatus)}
                    title={buildInsuranceStatusTooltip(insurance)}
                    emptyLabel={EMPTY}
                  />
                </td>
                <td>
                  <InsuranceExpireCell
                    insuranceType="交强险"
                    expireDate={insurance.compulsory}
                    emptyLabel={EMPTY}
                    onClickNotPurchased={() => onOpenInsurancePurchase(record, '交强险')}
                  />
                </td>
                <td>
                  <InsuranceExpireCell
                    insuranceType="商业险"
                    expireDate={insurance.commercial}
                    emptyLabel={EMPTY}
                    onClickNotPurchased={() => onOpenInsurancePurchase(record, '商业险')}
                  />
                </td>
                <td>
                  <HandoverSituationCell
                    kind="delivery"
                    record={record}
                    emptyLabel={EMPTY}
                    onClick={onOpenDeliveryManagement}
                  />
                </td>
                <td>
                  <HandoverSituationCell
                    kind="return"
                    record={record}
                    emptyLabel={EMPTY}
                    onClick={onOpenReturnManagement}
                  />
                </td>
                <td className="ellipsis" title={record.ownership}>{displayText(record.ownership, EMPTY)}</td>
                <td className="ellipsis" title={record.operateCompany}>{displayText(record.operateCompany, EMPTY)}</td>
                <td>
                  <StatusTag label={record.vehicleSource} tone="blue" emptyLabel={EMPTY} />
                </td>
                <td className="ellipsis" title={thirdPartyLeaseCompany || undefined}>
                  {thirdPartyLeaseCompany}
                </td>
                <td>
                  <div className="vm-location">
                    <span className={`vm-online ${online ? 'on' : 'off'}`}>
                      <span className="dot" aria-hidden />
                      {record.onlineStatus || '离线'}
                    </span>
                    {locationMapOpenable ? (
                      <button
                        type="button"
                        className="vm-link vm-loc-text"
                        onClick={() => onOpenLocationMap(record)}
                        title={locationAddress}
                      >
                        {locationAddress}
                      </button>
                    ) : (
                      <span className="vm-loc-text" title={locationAddress || undefined}>
                        {locationAddress}
                      </span>
                    )}
                    <span className="vm-loc-time">{formatGpsTime(record.gpsTime, EMPTY)}</span>
                  </div>
                </td>
                <td>
                  {canEditOpsManager ? (
                    <button type="button" className="vm-link" onClick={() => onEditOpsManager(record)}>
                      {ops.length ? ops.join('，') : '设置负责人'}
                    </button>
                  ) : (
                    <span>{ops.length ? ops.join('，') : EMPTY}</span>
                  )}
                </td>
                <td className="sticky-right">
                  <OperationActions
                    edit={isAdmin ? { onClick: () => onEdit(record) } : undefined}
                    view={{ label: '查看记录', onClick: () => onView(record) }}
                    more={canEditOpsManager
                      ? [{
                          key: 'opsManager',
                          label: '修改运维负责人',
                          onClick: () => onEditOpsManager(record),
                        }]
                      : []}
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
