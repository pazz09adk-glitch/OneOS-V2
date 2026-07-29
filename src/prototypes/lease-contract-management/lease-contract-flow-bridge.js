/**
 * 列表合同 → 续签/转正式/增车/转三方 等流程表单初始态
 */

import { generateAutoContractCodeSuffix } from '../contract-template-management/contract-template-vars.js';
import { getDefaultContractTemplateId } from '../contract-template-management/contract-template-catalog.js';
import { buildLeaseContractEditFormState } from './lease-contract-edit-bridge.js';
import {
	createDefaultLeaseOrderState,
	createEmptyLeaseOrderRow,
	createEmptyDelegateRow,
	normalizeLeaseOrderState,
	syncRowPricingFields,
} from './lease-order-vars.js';
import { canContractVehicleReturn, isContractApprovalPassed } from './lease-contract-list-data.js';

export var FLOW_MODE_CREATE = 'create';
export var FLOW_MODE_EDIT = 'edit';
export var FLOW_MODE_RENEW = 'renew';
export var FLOW_MODE_TRIAL_TO_FORMAL = 'trialToFormal';
export var FLOW_MODE_ADD_VEHICLE = 'addVehicle';
export var FLOW_MODE_ADD_POA = 'addPoa';
export var FLOW_MODE_TRIPARTITE = 'tripartite';

export var FLOW_MODE_LABELS = {
	create: '新增租赁合同',
	edit: '编辑租赁合同',
	renew: '续签合同',
	trialToFormal: '试用转正式',
	addVehicle: '新增车辆',
	addPoa: '添加授权委托书',
	tripartite: '转三方合同',
};

export function getDeliveredNotReturnedVehicles(record) {
	if (!record || !record.vehicles || !isContractApprovalPassed(record)) return [];
	return record.vehicles.filter(function (vehicle) {
		return canContractVehicleReturn(vehicle, record);
	});
}

function mapLockedVehicleToRow(vehicle, index) {
	var row = createEmptyLeaseOrderRow();
	row.id = 'lo-flow-locked-' + index;
	row.brandModels = vehicle.brand && vehicle.model ? [[vehicle.brand, vehicle.model]] : [];
	row.vehicleQty = 1;
	row.plateNos = vehicle.plateNo && vehicle.plateNo !== '-' ? [vehicle.plateNo] : [];
	row.rent = vehicle.rent != null ? vehicle.rent : 8800;
	row.serviceFee = vehicle.serviceFee != null ? vehicle.serviceFee : 1200;
	row.deposit = vehicle.deposit != null ? vehicle.deposit : 20000;
	row.leasePeriodMode = 'months';
	row.leasePeriodMonths = vehicle.leasePeriodMonths != null ? vehicle.leasePeriodMonths : 12;
	row._flowLocked = true;
	row._flowLockedFields = ['brandModels', 'plateNos', 'vehicleQty'];
	row._deliveredAt = vehicle.actualDelivery || null;
	return syncRowPricingFields(row);
}

function buildRowsFromDeliveredVehicles(record) {
	var region = (record.deliveryRegion || []).slice();
	var vehicles = getDeliveredNotReturnedVehicles(record);
	return vehicles.map(function (vehicle, index) {
		var row = mapLockedVehicleToRow(vehicle, index);
		row._deliveryRegion = region;
		row._deliveredAt = vehicle.actualDelivery || null;
		return row;
	});
}

function cloneFormState(base) {
	if (!base) return null;
	return JSON.parse(JSON.stringify(base));
}

function withNewContractCode(state) {
	if (!state) return state;
	state.contractCode = generateAutoContractCodeSuffix();
	return state;
}

function withLeaseOrderRows(state, rows, extra) {
	if (!state) return state;
	state.leaseOrder = normalizeLeaseOrderState(Object.assign({}, state.leaseOrder, extra || {}, {
		rows: rows.length ? rows : [createEmptyLeaseOrderRow()],
	}));
	return state;
}

/** 续签：复制原合同，锁定已交未还车辆，可新增车辆卡片 */
export function buildRenewContractFormState(record) {
	var base = cloneFormState(buildLeaseContractEditFormState(record));
	if (!base) return null;
	withNewContractCode(base);
	var lockedRows = buildRowsFromDeliveredVehicles(record);
	withLeaseOrderRows(base, lockedRows, {
		deliveryRegion: (record.deliveryRegion || []).slice(),
		deliveryRegionMode: record.deliveryRegionTbd ? 'tbd' : 'region',
		deliveryDateMode: record.deliveryDateMode || 'range',
		deliveryDateTbd: Boolean(record.deliveryDateTbd),
	});
	base._flowMode = FLOW_MODE_RENEW;
	base._sourceContractCode = record.contractCode;
	base._pickupReceivableHint = '已交未还车辆不生成提车应收款；新增车辆按新增合同规则生成提车应收款。';
	return base;
}

/** 转正式：锁定已交未还车辆品牌型号车牌，租金服务项可改 */
export function buildTrialToFormalFormState(record) {
	var base = cloneFormState(buildLeaseContractEditFormState(record));
	if (!base) return null;
	withNewContractCode(base);
	base.contractType = 'formal';
	var lockedRows = buildRowsFromDeliveredVehicles(record);
	lockedRows.forEach(function (row) {
		row._flowLockedFields = ['brandModels', 'plateNos', 'vehicleQty'];
	});
	withLeaseOrderRows(base, lockedRows);
	base._flowMode = FLOW_MODE_TRIAL_TO_FORMAL;
	base._sourceContractCode = record.contractCode;
	base._pickupReceivableHint = '车辆金额变更将重新记录提车应收款；已交未还车辆完成后不再生成交车任务。';
	return base;
}

/** 新增车辆：仅新附件1 */
export function buildAddVehicleFormState(record) {
	var base = buildLeaseContractEditFormState(record);
	if (!base) return null;
	base = cloneFormState(base);
	withNewContractCode(base);
	withLeaseOrderRows(base, [createEmptyLeaseOrderRow()]);
	base._flowMode = FLOW_MODE_ADD_VEHICLE;
	base._sourceContractCode = record.contractCode;
	base._pickupReceivableHint = '审批通过后，新增车辆按新增合同规则生成提车应收款任务。';
	base._signingHint = '无需重新签署主合同，仅对新增附件1（租赁订单）发起审批。';
	return base;
}

/** 添加授权委托书：仅维护受托人，预览仅授权委托书 */
export function buildAddPowerOfAttorneyFormState(record) {
	var base = buildLeaseContractEditFormState(record);
	if (!base) return null;
	base = cloneFormState(base);
	withNewContractCode(base);
	base.powerOfAttorney = {
		delegates: [createEmptyDelegateRow()],
	};
	base._flowMode = FLOW_MODE_ADD_POA;
	base._sourceContractCode = record.contractCode;
	base._signingHint = '无需重新签署主合同，仅对新增授权委托书发起审批。';
	return base;
}

/** 转三方：模板固定转三方协议，可增车 */
export function buildTripartiteContractFormState(record) {
	var base = cloneFormState(buildLeaseContractEditFormState(record));
	if (!base) return null;
	withNewContractCode(base);
	var tripartiteTemplateId = getDefaultContractTemplateId('转三方协议');
	base.contractTemplateId = tripartiteTemplateId
		|| base.contractTemplateId
		|| getDefaultContractTemplateId('合同')
		|| '';
	base._flowMode = FLOW_MODE_TRIPARTITE;
	base._sourceContractCode = record.contractCode;
	base._requiresTripartiteParty = true;
	base._signingHint = '审批通过后沿用原合同签署方式；线上发送 E签宝链接，线下需完成盖章合同补传。';
	base.thirdPartyCustomerId = '';
	base.thirdPartyPrincipalName = '';
	base.thirdPartyPrincipalPhone = '';
	var rows = base.leaseOrder && base.leaseOrder.rows ? base.leaseOrder.rows.slice() : [createEmptyLeaseOrderRow()];
	withLeaseOrderRows(base, rows);
	return base;
}

export function getFlowPageTitle(flowMode) {
	return FLOW_MODE_LABELS[flowMode] || FLOW_MODE_LABELS.create;
}

export function countNewPickupVehicles(leaseOrder, lockedRowPrefix) {
	if (!leaseOrder || !leaseOrder.rows) return 0;
	var prefix = lockedRowPrefix || 'lo-flow-locked-';
	return leaseOrder.rows.filter(function (row) {
		return !row._flowLocked && String(row.id || '').indexOf(prefix) !== 0;
	}).length;
}
