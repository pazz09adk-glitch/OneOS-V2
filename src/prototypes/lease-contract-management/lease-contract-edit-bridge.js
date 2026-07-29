/**
 * 列表合同记录 → 新增/编辑页表单初始态（原型回填）
 */

import { DEFAULT_MILEAGE_STANDARD, DEFAULT_FEE_INFO } from '../contract-template-management/contract-template-vars.js';
import {
	createDefaultLeaseOrderState,
	createEmptyLeaseOrderRow,
	createEmptyDelegateRow,
	PLATE_ACTUAL_DELIVERY,
	normalizeLeaseOrderState,
	syncRowPricingFields,
} from './lease-order-vars.js';
import {
	inferContractTemplateId,
	isDeliveryDateTbd,
	SIGNING_COMPANY_LESSOR_IDS,
} from './lease-contract-list-data.js';

var LEASE_CUSTOMER_IDS_BY_NAME = {
	'嘉兴某某物流有限公司': '1',
	'上海某某运输公司': '2',
	'杭州某某租赁有限公司': '3',
};

function extractContractCodeInput(code) {
	if (!code) return '';
	return String(code).replace(/^HT-ZL-/, '').replace(/^LNZLHT-?/i, '');
}

function mapVehicleToLeaseOrderRow(vehicle, index) {
	var row = createEmptyLeaseOrderRow();
	row.id = 'lo-bridge-' + index;
	if (vehicle.brand && vehicle.model) {
		row.brandModels = [[vehicle.brand, vehicle.model]];
	}
	row.vehicleQty = 1;
	var plate = vehicle.plateNo;
	row.plateNos = plate && plate !== '-' ? [plate] : [PLATE_ACTUAL_DELIVERY];
	row.rent = vehicle.rent != null ? vehicle.rent : 8800;
	row.serviceFee = vehicle.serviceFee != null ? vehicle.serviceFee : 1200;
	row.deposit = vehicle.deposit != null ? vehicle.deposit : 20000;
	row.leasePeriodMode = 'months';
	row.leasePeriodMonths = vehicle.leasePeriodMonths != null ? vehicle.leasePeriodMonths : 12;
	return syncRowPricingFields(row);
}

function mapAuthorizedDelegatesToPoaRows(delegates) {
	if (!delegates || !delegates.length) {
		return [createEmptyDelegateRow()];
	}
	return delegates.map(function (person, index) {
		return {
			id: 'del-bridge-' + index,
			name: person.name || '',
			contact: person.contact || person.phone || '',
			idNumber: person.idNumber || person.idCard || '',
		};
	});
}

function buildLeaseOrderFromRecord(record) {
	var defaultOrder = createDefaultLeaseOrderState();
	var vehicles = record.vehicles || [];
	var rows = vehicles.length
		? vehicles.map(mapVehicleToLeaseOrderRow)
		: defaultOrder.rows.slice();
	var deliveryDate = record.deliveryDate;
	var deliveryDateTbd = Boolean(record.deliveryDateTbd || isDeliveryDateTbd(deliveryDate));
	if (deliveryDateTbd) {
		deliveryDate = null;
	}
	return normalizeLeaseOrderState({
		thirdPartyLiabilityMillion: record.thirdPartyLiabilityMillion != null
			? record.thirdPartyLiabilityMillion
			: defaultOrder.thirdPartyLiabilityMillion,
		deliveryRegion: (record.deliveryRegion || defaultOrder.deliveryRegion).slice(),
		deliveryRegionMode: record.deliveryRegionTbd ? 'tbd' : 'region',
		deliveryRegionTbd: Boolean(record.deliveryRegionTbd),
		deliveryDate: deliveryDate || null,
		deliveryDateStart: record.deliveryDateStart || deliveryDate || null,
		deliveryDateEnd: record.deliveryDateEnd || null,
		deliveryDateMode: deliveryDateTbd ? 'unconfirmed' : 'range',
		deliveryDateTbd: deliveryDateTbd,
		rows: rows,
	});
}

function buildMileageFromRecord(record) {
	return Object.assign({}, DEFAULT_MILEAGE_STANDARD, {
		hasRequirement: Boolean(record.hasMinimumMileage),
		period: record.mileagePeriod || DEFAULT_MILEAGE_STANDARD.period,
		targetKm: record.mileageTargetKm != null
			? record.mileageTargetKm
			: DEFAULT_MILEAGE_STANDARD.targetKm,
		reductionYuan: record.mileageReductionYuan != null
			? record.mileageReductionYuan
			: DEFAULT_MILEAGE_STANDARD.reductionYuan,
		validUntil: record.mileageValidUntil || DEFAULT_MILEAGE_STANDARD.validUntil,
	});
}

function buildFeeInfoFromRecord(record) {
	var hydrogenPaymentMethod = record.hydrogenPaymentMethod || DEFAULT_FEE_INFO.hydrogenPaymentMethod;
	if (record.hydrogenSettlementMode === 'month' && hydrogenPaymentMethod !== 'month') {
		hydrogenPaymentMethod = 'month';
	}
	var isPrepay = hydrogenPaymentMethod === 'prepay';
	return Object.assign({}, DEFAULT_FEE_INFO, {
		paymentMethod: record.paymentMethod || DEFAULT_FEE_INFO.paymentMethod,
		paymentPeriod: record.paymentPeriod != null ? record.paymentPeriod : DEFAULT_FEE_INFO.paymentPeriod,
		hydrogenPaymentMethod: hydrogenPaymentMethod,
		prepayAmount: record.prepayAmount != null ? record.prepayAmount : (isPrepay ? 50000 : null),
		payAheadWorkdays: record.payAheadWorkdays != null ? record.payAheadWorkdays : DEFAULT_FEE_INFO.payAheadWorkdays,
		returnHydrogenDiffUnitPrice: record.returnHydrogenDiffUnitPrice != null
			? record.returnHydrogenDiffUnitPrice
			: 8.5,
	});
}

/** 列表行 → 编辑页表单初始值；授权委托书未维护时 delegates 为空行 */
export function buildLeaseContractEditFormState(record) {
	if (!record) return null;
	var lessorId = record.lessorId || SIGNING_COMPANY_LESSOR_IDS[record.signingCompany] || '';
	var customerId = record.customerId || LEASE_CUSTOMER_IDS_BY_NAME[record.customerName] || '';
	var poaMaintained = record.poaUploaded === true
		&& record.authorizedDelegates
		&& record.authorizedDelegates.length > 0;
	return {
		contractTemplateId: record.contractTemplateId || inferContractTemplateId(record) || '',
		lessorId: lessorId,
		customerId: customerId,
		contractCode: extractContractCodeInput(record.contractCode),
		projectName: record.projectName || '',
		businessDept: record.businessDept || '',
		businessOwner: record.businessOwner || '',
		mileage: buildMileageFromRecord(record),
		feeInfo: buildFeeInfoFromRecord(record),
		leaseOrder: buildLeaseOrderFromRecord(record),
		powerOfAttorney: {
			delegates: poaMaintained
				? mapAuthorizedDelegatesToPoaRows(record.authorizedDelegates)
				: [createEmptyDelegateRow()],
		},
		contractRemark: record.poaRemark || '',
		customerPrincipalName: record.customerPrincipalName || '',
		customerPrincipalPhone: record.customerPrincipalPhone || '',
		thirdPartyCustomerId: record.thirdPartyCustomerId || '',
		thirdPartyPrincipalName: record.thirdPartyPrincipalName || '',
		thirdPartyPrincipalPhone: record.thirdPartyPrincipalPhone || '',
		sealTypes: Array.isArray(record.sealTypes) && record.sealTypes.length
			? record.sealTypes.slice()
			: ['contract'],
	};
}
