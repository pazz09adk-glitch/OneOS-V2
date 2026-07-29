/** 附件1 租赁订单 — 品牌型号级联与行数据 */

import vehiclesData from '../vehicle-management/data/vehicles.json';

export var READY_VEHICLE_STATUS = '已备车';

/** 车辆库中暂无「已备车」时的原型兜底数据 */
export var LEASE_READY_VEHICLE_FALLBACK = [
	{ plateNo: '粤AGR8556', brand: '现代', model: '帕力安牌4.5吨冷链车', vehicleStatus: '已备车' },
	{ plateNo: '粤BHY6688', brand: '现代', model: '18吨氢燃料电池车', vehicleStatus: '已备车' },
	{ plateNo: '粤CSL9901', brand: '苏龙', model: '9.6米氢燃料电池车', vehicleStatus: '已备车' },
	{ plateNo: '粤DFC7722', brand: '跃进', model: '4.2米冷链车', vehicleStatus: '已备车' },
	{ plateNo: '粤EGT5533', brand: '宇通', model: '氢燃料电池客车', vehicleStatus: '已备车' },
];

export function getReadyVehicles() {
	var ready = vehiclesData.filter(function (vehicle) {
		return vehicle.vehicleStatus === READY_VEHICLE_STATUS && vehicle.plateNo;
	});
	return ready.length > 0 ? ready : LEASE_READY_VEHICLE_FALLBACK;
}

export function getReadyVehiclePlateOptions(brandModels) {
	var vehicles = getReadyVehicles();
	var models = normalizeBrandModels({ brandModels: brandModels });
	if (models.length > 0) {
		vehicles = vehicles.filter(function (vehicle) {
			return models.some(function (pair) {
				return vehicle.brand === pair[0] && vehicle.model === pair[1];
			});
		});
	}
	return vehicles.map(function (vehicle) {
		return {
			value: vehicle.plateNo,
			label: vehicle.plateNo,
		};
	});
}

export function parsePlateSearchText(text) {
	return String(text || '')
		.split(/[\n,，;；\s]+/)
		.map(function (item) { return item.trim().toUpperCase(); })
		.filter(Boolean);
}

import { getVehicleBrandModelCatalog } from '../../common/vehicle-brand-model-catalog.js';

export var LEASE_VEHICLE_BRAND_MODEL_CATALOG = getVehicleBrandModelCatalog();

export var PROVINCE_CITY_CASCADER_OPTIONS = [
	{
		value: '浙江省',
		label: '浙江省',
		children: [
			{ value: '嘉兴市', label: '嘉兴市' },
			{ value: '杭州市', label: '杭州市' },
			{ value: '宁波市', label: '宁波市' },
		],
	},
	{
		value: '上海市',
		label: '上海市',
		children: [{ value: '上海市', label: '上海市' }],
	},
	{
		value: '广东省',
		label: '广东省',
		children: [
			{ value: '广州市', label: '广州市' },
			{ value: '深圳市', label: '深圳市' },
		],
	},
	{
		value: '江苏省',
		label: '江苏省',
		children: [
			{ value: '南京市', label: '南京市' },
			{ value: '苏州市', label: '苏州市' },
		],
	},
];

export function flattenProvinceCityOptions() {
	var list = [];
	PROVINCE_CITY_CASCADER_OPTIONS.forEach(function (prov) {
		(prov.children || []).forEach(function (city) {
			list.push({
				province: prov.value,
				city: city.value,
				label: prov.label + ' / ' + city.label,
			});
		});
	});
	return list;
}

export function matchProvinceCityOption(option, query) {
	var normalized = (query || '').trim().toLowerCase();
	if (!normalized) return true;
	return option.province.toLowerCase().indexOf(normalized) >= 0
		|| option.city.toLowerCase().indexOf(normalized) >= 0
		|| option.label.toLowerCase().indexOf(normalized) >= 0;
}

export function formatDeliveryRegionDisplay(region) {
	if (!region || !region.length) return '';
	if (region.length >= 2) return region[0] + ' / ' + region[1];
	return region[0] || '';
}

export function buildBrandModelCascaderOptions() {
	return LEASE_VEHICLE_BRAND_MODEL_CATALOG.map(function (item) {
		return {
			value: item.brand,
			label: item.brand,
			children: item.models.map(function (model) {
				return { value: model, label: model };
			}),
		};
	});
}

export var PLATE_ACTUAL_DELIVERY = '以实际交付为准';

export var PLATE_MODE_ACTUAL = 'actual';

export var PLATE_MODE_SPECIFIC = 'specific';

export var PLATE_SPECIFIC_LABEL = '选择特定车辆';

export var DELIVERY_REGION_TBD_LABEL = '交还车时约定';

export var DELIVERY_REGION_TBD_DISPLAY = '提车应收款或合同车辆子表还车时，按实际情况配置交还地点';

export var LEASE_DELIVERY_DATE_UNCONFIRMED_LABEL = '暂未确认';

export var LEASE_DELIVERY_DATE_UNCONFIRMED_DISPLAY = '提车前通过提车应收款功能生成交车任务';

export var POA_MAX_DELEGATES = 5;

export function createEmptyLeaseOrderRow() {
	return {
		id: 'lo-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7),
		brandModels: [],
		vehicleQty: 1,
		plateMode: PLATE_MODE_ACTUAL,
		plateNos: [PLATE_ACTUAL_DELIVERY],
		rentServiceSubtotal: null,
		rent: null,
		serviceFee: null,
		deposit: null,
		extraServices: [],
		leasePeriodMode: 'months',
		leasePeriodMonths: 1,
		leasePeriodStart: null,
		leasePeriodEnd: null,
	};
}

export function normalizeBrandModels(row) {
	if (!row) return [];
	if (Array.isArray(row.brandModels) && row.brandModels.length) {
		return row.brandModels.filter(function (item) {
			return item && item.length >= 2 && item[0] && item[1];
		});
	}
	if (row.brandModel && row.brandModel.length >= 2) {
		return [row.brandModel.slice(0, 2)];
	}
	return [];
}

export function normalizePlateNos(row) {
	if (!row) return [PLATE_ACTUAL_DELIVERY];
	if (Array.isArray(row.plateNos) && row.plateNos.length) {
		return row.plateNos.filter(function (item) { return Boolean(item); });
	}
	if (row.plateNo) {
		return [row.plateNo];
	}
	return [PLATE_ACTUAL_DELIVERY];
}

export function getPlateMode(row) {
	if (!row) return PLATE_MODE_ACTUAL;
	if (row.plateMode === PLATE_MODE_SPECIFIC || row.plateMode === PLATE_MODE_ACTUAL) {
		return row.plateMode;
	}
	var plates = normalizePlateNos(row);
	if (plates.length === 1 && plates[0] === PLATE_ACTUAL_DELIVERY) {
		return PLATE_MODE_ACTUAL;
	}
	return PLATE_MODE_SPECIFIC;
}

export function findVehicleByPlateNo(plate) {
	var normalized = String(plate || '').trim().toUpperCase();
	if (!normalized || normalized === PLATE_ACTUAL_DELIVERY) return null;
	var i;
	for (i = 0; i < vehiclesData.length; i++) {
		if (String(vehiclesData[i].plateNo || '').trim().toUpperCase() === normalized) {
			return vehiclesData[i];
		}
	}
	for (i = 0; i < LEASE_READY_VEHICLE_FALLBACK.length; i++) {
		if (String(LEASE_READY_VEHICLE_FALLBACK[i].plateNo || '').trim().toUpperCase() === normalized) {
			return LEASE_READY_VEHICLE_FALLBACK[i];
		}
	}
	return null;
}

export function validatePlateForLeaseOrder(plate, brandModels) {
	var normalized = String(plate || '').trim().toUpperCase();
	if (!normalized) {
		return {
			plate: plate,
			ok: false,
			reason: 'empty',
			message: '车牌号不能为空',
		};
	}
	var models = normalizeBrandModels({ brandModels: brandModels });
	if (!models.length) {
		return {
			plate: normalized,
			ok: false,
			reason: 'no_brand_model',
			message: '请先选择品牌 / 型号',
		};
	}
	var vehicle = findVehicleByPlateNo(normalized);
	if (!vehicle) {
		return {
			plate: normalized,
			ok: false,
			reason: 'not_found',
			message: '未找到该车牌',
		};
	}
	if (vehicle.vehicleStatus !== READY_VEHICLE_STATUS) {
		return {
			plate: normalized,
			ok: false,
			reason: 'not_ready',
			message: '车辆状态为「' + vehicle.vehicleStatus + '」，需为已备车',
			vehicleStatus: vehicle.vehicleStatus,
		};
	}
	var brandMatched = models.some(function (pair) {
		return vehicle.brand === pair[0] && vehicle.model === pair[1];
	});
	if (!brandMatched) {
		return {
			plate: normalized,
			ok: false,
			reason: 'brand_mismatch',
			message: '品牌 / 型号不一致（车辆为 ' + formatBrandModelPair(vehicle.brand, vehicle.model) + '）',
			vehicleBrand: vehicle.brand,
			vehicleModel: vehicle.model,
		};
	}
	return {
		plate: normalized,
		ok: true,
		reason: 'matched',
		message: '校验通过',
		resolvedPlate: vehicle.plateNo,
	};
}

export function validatePlatesForLeaseOrder(plates, brandModels) {
	var results = [];
	var matched = [];
	(plates || []).forEach(function (plate) {
		var result = validatePlateForLeaseOrder(plate, brandModels);
		results.push(result);
		if (result.ok && result.resolvedPlate && matched.indexOf(result.resolvedPlate) < 0) {
			matched.push(result.resolvedPlate);
		}
	});
	return { results: results, matched: matched };
}

export function resolvePlateAgainstAssets(plate, brandModels) {
	var result = validatePlateForLeaseOrder(plate, brandModels);
	return result.ok ? result.resolvedPlate : null;
}

export function matchPlatesAgainstAssets(plates, brandModels) {
	var matched = [];
	(plates || []).forEach(function (plate) {
		var resolved = resolvePlateAgainstAssets(plate, brandModels);
		if (resolved && matched.indexOf(resolved) < 0) matched.push(resolved);
	});
	return matched;
}

export function syncRowPlateFields(row) {
	if (!row) return row;
	var next = Object.assign({}, row);
	var brandModels = normalizeBrandModels(next);
	var plateMode = getPlateMode(next);
	next.plateMode = plateMode;
	if (plateMode === PLATE_MODE_ACTUAL) {
		next.plateNos = [PLATE_ACTUAL_DELIVERY];
		return next;
	}
	var matched = matchPlatesAgainstAssets(normalizePlateNos(next), brandModels);
	next.plateNos = matched;
	var qty = next.vehicleQty != null ? Number(next.vehicleQty) : 1;
	if (!Number.isFinite(qty) || qty <= 0) qty = 1;
	if (matched.length > qty) next.vehicleQty = matched.length;
	return next;
}

export function formatBrandModelPair(brand, model) {
	if (!brand && !model) return '';
	if (!model) return brand;
	if (!brand) return model;
	return brand + '-' + model;
}

export function formatBrandModelsDisplay(brandModels) {
	return (brandModels || []).map(function (pair) {
		return formatBrandModelPair(pair[0], pair[1]);
	}).filter(Boolean);
}

export function getRowVehicleQty(row) {
	if (!row) return 0;
	var plates = normalizePlateNos(row);
	var actualPlates = plates.filter(function (plate) {
		return plate !== PLATE_ACTUAL_DELIVERY;
	});
	if (actualPlates.length > 0) return actualPlates.length;
	var qty = row.vehicleQty != null ? Number(row.vehicleQty) : 1;
	if (!Number.isFinite(qty) || qty <= 0) return 1;
	return Math.floor(qty);
}

export function getRowVehicleCountForPricing(row) {
	return getRowVehicleQty(row) || 1;
}

export function calcInsuredVehicleCount(order) {
	var rows = (order && order.rows) || [];
	if (!rows.length) return 0;
	return rows.reduce(function (sum, row) {
		return sum + getRowVehicleQty(row);
	}, 0);
}

/** @deprecated 车辆数由各行数量自动汇总，不再支持手动编辑 */
export function isInsuredVehicleCountEditable() {
	return false;
}

export function countNationalInStockByBrandModel(brand, model) {
	if (!brand || !model) return 0;
	return vehiclesData.filter(function (vehicle) {
		return vehicle.brand === brand
			&& vehicle.model === model
			&& (vehicle.operateStatus === '可运营' || vehicle.operateStatus === '待运营');
	}).length;
}

var IN_STOCK_MUNICIPALITIES = ['北京市', '上海市', '天津市', '重庆市'];

function parseInStockProvinceCity(location) {
	if (!location) return { province: '未登记', city: '未登记' };
	var loc = String(location).trim();
	var i;
	for (i = 0; i < IN_STOCK_MUNICIPALITIES.length; i++) {
		var municipality = IN_STOCK_MUNICIPALITIES[i];
		if (loc.indexOf(municipality) === 0) {
			return { province: municipality, city: municipality };
		}
	}
	var provMatch = loc.match(/^(.*?(?:省|自治区))/);
	if (!provMatch) {
		var cityOnly = loc.match(/^(.+?市)/);
		if (cityOnly) return { province: cityOnly[1], city: cityOnly[1] };
		return { province: '未登记', city: '未登记' };
	}
	var province = provMatch[1];
	var rest = loc.slice(provMatch[1].length);
	var cityMatch = rest.match(/^(.+?市)/) || rest.match(/^(.+?(?:州|盟|地区))/);
	return {
		province: province,
		city: cityMatch ? cityMatch[1] : '省内其他',
	};
}

/** 按品牌型号统计在库车辆，并按省、市分组 */
export function getInStockBreakdownByBrandModel(brand, model) {
	if (!brand || !model) {
		return { total: 0, regions: [] };
	}
	var grouped = {};
	vehiclesData.forEach(function (vehicle) {
		if (vehicle.brand !== brand || vehicle.model !== model) return;
		if (vehicle.operateStatus !== '可运营' && vehicle.operateStatus !== '待运营') return;
		var parts = parseInStockProvinceCity(vehicle.location);
		var province = parts.province;
		var city = parts.city;
		if (!grouped[province]) grouped[province] = {};
		grouped[province][city] = (grouped[province][city] || 0) + 1;
	});
	var regions = Object.keys(grouped).sort(function (a, b) {
		return a.localeCompare(b, 'zh-CN');
	}).map(function (province) {
		var cities = Object.keys(grouped[province]).sort(function (a, b) {
			return a.localeCompare(b, 'zh-CN');
		}).map(function (city) {
			return { city: city, count: grouped[province][city] };
		});
		var provinceTotal = cities.reduce(function (sum, item) {
			return sum + item.count;
		}, 0);
		return { province: province, total: provinceTotal, cities: cities };
	});
	return {
		total: countNationalInStockByBrandModel(brand, model),
		regions: regions,
	};
}

/** 车型最低租金配置（原型）；键为 brand|model */
export var LEASE_VEHICLE_MIN_RENT_BY_MODEL = {
	'飞驰|集卡头': 15000,
	'飞驰|半挂车': 12000,
	'现代|18吨氢燃料电池车': 18000,
	'苏龙|9.6米氢燃料电池车': 16000,
};

export function getLeaseMinRentForBrandModel(brand, model) {
	if (!brand || !model) return null;
	var key = brand + '|' + model;
	if (LEASE_VEHICLE_MIN_RENT_BY_MODEL[key] != null) {
		return LEASE_VEHICLE_MIN_RENT_BY_MODEL[key];
	}
	return null;
}

export function isLeaseRentBelowMinimum(rent, brand, model) {
	var minRent = getLeaseMinRentForBrandModel(brand, model);
	if (minRent == null) return false;
	if (rent == null || rent === '') return false;
	return Number(rent) < minRent;
}

export function hasLeaseOrderRentBelowMinimum(order) {
	var rows = (order && order.rows) || [];
	return rows.some(function (row) {
		var models = normalizeBrandModels(row);
		if (!models.length || row.rent == null || row.rent === '') return false;
		return models.some(function (pair) {
			return isLeaseRentBelowMinimum(row.rent, pair[0], pair[1]);
		});
	});
}

export function formatLeasePeriod(row) {
	if (!row) return '';
	if (row.leasePeriodMode === 'fixed' || (row.leasePeriodStart && row.leasePeriodEnd && !row.leasePeriodMonths)) {
		if (row.leasePeriodStart && row.leasePeriodEnd) {
			return row.leasePeriodStart + ' ~ ' + row.leasePeriodEnd;
		}
		return row.leasePeriodStart || row.leasePeriodEnd || '';
	}
	if (row.leasePeriodMonths != null && row.leasePeriodMonths !== '') {
		return '提车起算 ' + String(row.leasePeriodMonths) + ' 个月';
	}
	if (row.leasePeriodStart && row.leasePeriodEnd) {
		return row.leasePeriodStart + ' ~ ' + row.leasePeriodEnd;
	}
	return row.leasePeriodStart || row.leasePeriodEnd || '';
}

export function normalizeExtraServices(row) {
	if (!row) return [];
	var values = [];
	if (Array.isArray(row.extraServices)) values = row.extraServices.slice();
	else if (row.extraService) values = [row.extraService];
	return values.filter(function (value) {
		return Boolean(getExtraServiceByValue(value));
	});
}

export function calcRowServiceFee(row) {
	return sumFixedExtraServiceFees(normalizeExtraServices(row));
}

export function formatServiceFeeAmount(value) {
	var num = value != null && value !== '' ? Number(value) : 0;
	if (!Number.isFinite(num)) num = 0;
	return num.toFixed(2);
}

export function syncRowPricingFields(row) {
	var next = Object.assign({}, row);
	next.serviceFee = calcRowServiceFee(next);
	next.rentServiceSubtotal = calcRentServiceSubtotal(
		next.rent,
		next.serviceFee,
		getRowVehicleCountForPricing(next),
	);
	return next;
}

export function formatLeaseOrderDeliveryRegion(order) {
	if (!order) return '-';
	if (order.deliveryRegionMode === 'tbd' || order.deliveryRegionTbd) {
		return DELIVERY_REGION_TBD_LABEL;
	}
	var region = order.deliveryRegion || [];
	if (!region.length) return '-';
	return region.join(' / ');
}

export function formatLeaseOrderDeliveryDate(order) {
	if (!order) return '-';
	if (order.deliveryDateMode === 'unconfirmed' || order.deliveryDateTbd) {
		return LEASE_DELIVERY_DATE_UNCONFIRMED_LABEL;
	}
	if (order.deliveryDateStart && order.deliveryDateEnd) {
		return order.deliveryDateStart + ' ~ ' + order.deliveryDateEnd;
	}
	if (order.deliveryDate) return order.deliveryDate;
	return '-';
}

export function normalizeLeaseOrderState(order) {
	var base = order || createDefaultLeaseOrderState();
	var rows = (base.rows || [createEmptyLeaseOrderRow()]).map(function (row) {
		var next = Object.assign({}, createEmptyLeaseOrderRow(), row);
		if (!next.leasePeriodMode) {
			next.leasePeriodMode = (next.leasePeriodStart && next.leasePeriodEnd && !next.leasePeriodMonths)
				? 'fixed'
				: 'months';
		}
		if (next.leasePeriodMode === 'months' && (next.leasePeriodMonths == null || next.leasePeriodMonths === '')) {
			next.leasePeriodMonths = 1;
		}
		return syncRowPricingFields(syncRowPlateFields(next));
	});
	var normalized = Object.assign({}, createDefaultLeaseOrderState(), base, {
		rows: rows.length ? rows : [createEmptyLeaseOrderRow()],
		deliveryRegionMode: base.deliveryRegionMode
			|| (base.deliveryRegionTbd ? 'tbd' : ((base.deliveryRegion && base.deliveryRegion.length) ? 'region' : 'tbd')),
		deliveryDateMode: base.deliveryDateMode
			|| (base.deliveryDateTbd ? 'unconfirmed' : ((base.deliveryDateStart && base.deliveryDateEnd) ? 'range' : 'unconfirmed')),
		deliveryDateStart: base.deliveryDateStart || null,
		deliveryDateEnd: base.deliveryDateEnd || null,
		deliveryDateTbd: Boolean(base.deliveryDateTbd || base.deliveryDateMode === 'unconfirmed'),
		deliveryRegionTbd: Boolean(base.deliveryRegionTbd || base.deliveryRegionMode === 'tbd'),
	});
	normalized.insuredVehicleCount = calcInsuredVehicleCount(normalized);
	return normalized;
}

/** 租赁订单服务项：固定费用 / 浮动费用 */
export var LEASE_SERVICE_FEE_TYPE = {
	FIXED: 'fixed',
	FLOATING: 'floating',
};

export var LEASE_EXTRA_SERVICE_TREE = [
	{
		category: '固定费用',
		feeType: LEASE_SERVICE_FEE_TYPE.FIXED,
		subCategories: [
			{
				name: '无忧包',
				items: [
					{ value: 'wear-insurance', name: '易损保', fee: 80, unitLabel: '元/车/月' },
					{ value: 'maintenance-insurance', name: '养护保', fee: 200, unitLabel: '元/车/月' },
					{ value: 'tire-insurance', name: '轮胎保', fee: 100, unitLabel: '元/车/月' },
				],
			},
			{
				name: '交还车服务',
				items: [
					{ value: 'door-delivery', name: '送车服务费', fee: 300, unitLabel: '元/车/月' },
					{ value: 'door-pickup', name: '接车服务费', fee: 300, unitLabel: '元/车/月' },
				],
			},
			{
				name: '车辆加装',
				items: [
					{ value: 'tailgate', name: '尾板', fee: 150, unitLabel: '元/车/月' },
				],
			},
		],
	},
	{
		category: '浮动费用',
		feeType: LEASE_SERVICE_FEE_TYPE.FLOATING,
		subCategories: [
			{
				name: '里程计费',
				items: [
					{
						value: 'mileage-maintenance',
						name: '维保费',
						billingRule: '0.10 元/公里，按实际行驶里程计入租赁账单',
					},
					{
						value: 'transport-risk',
						name: '运保费',
						billingRule: '0.08 元/公里，按实际行驶里程计入租赁账单',
					},
				],
			},
			{
				name: '使用期计费',
				items: [
					{
						value: 'usage-extra',
						name: '超期使用费',
						billingRule: '按车辆实际使用天数核算，计入后续租赁账单',
					},
					{
						value: 'energy-adjust',
						name: '能源费补缴',
						billingRule: '按氢量/电量实际用量与合同约定单价核算',
					},
				],
			},
		],
	},
];

function forEachExtraServiceItem(callback) {
	LEASE_EXTRA_SERVICE_TREE.forEach(function (root) {
		(root.subCategories || []).forEach(function (sub) {
			(sub.items || []).forEach(function (item) {
				callback(item, root, sub);
			});
		});
	});
}

function buildExtraServiceCatalog() {
	var list = [];
	forEachExtraServiceItem(function (item, root, sub) {
		list.push(Object.assign({}, item, {
			feeType: root.feeType,
			category: root.category,
			subCategory: sub.name,
		}));
	});
	return list;
}

export var LEASE_EXTRA_SERVICE_CATALOG = buildExtraServiceCatalog();

export function flattenExtraServiceOptions() {
	var options = [];
	forEachExtraServiceItem(function (item, root, sub) {
		options.push({
			value: item.value,
			name: item.name,
			category: root.category,
			subCategory: sub.name,
			feeType: root.feeType,
			fee: item.fee,
			unitLabel: item.unitLabel,
			billingRule: item.billingRule,
		});
	});
	return options;
}

export function matchExtraServiceOption(option, query) {
	var normalized = (query || '').trim().toLowerCase();
	if (!normalized) return true;
	return option.name.toLowerCase().indexOf(normalized) >= 0
		|| (option.category || '').toLowerCase().indexOf(normalized) >= 0
		|| (option.subCategory || '').toLowerCase().indexOf(normalized) >= 0
		|| (option.billingRule || '').toLowerCase().indexOf(normalized) >= 0;
}

export function getExtraServiceCategoryByValue(value) {
	var item = getExtraServiceByValue(value);
	return item ? item.category : '';
}

export function getExtraServiceSubCategoryByValue(value) {
	var item = getExtraServiceByValue(value);
	return item ? item.subCategory : '';
}

export var LEASE_EXTRA_SERVICE_OPTIONS = LEASE_EXTRA_SERVICE_CATALOG.map(function (item) {
	return {
		value: item.value,
		label: item.name,
	};
});

export function getExtraServiceFeeByValue(value) {
	var item = getExtraServiceByValue(value);
	if (!item || item.feeType !== LEASE_SERVICE_FEE_TYPE.FIXED) return 0;
	return item.fee != null ? Number(item.fee) : 0;
}

export function getExtraServiceByValue(value) {
	if (!value) return null;
	for (var i = 0; i < LEASE_EXTRA_SERVICE_CATALOG.length; i++) {
		if (LEASE_EXTRA_SERVICE_CATALOG[i].value === value) {
			return LEASE_EXTRA_SERVICE_CATALOG[i];
		}
	}
	return null;
}

export function getExtraServiceNames(selectedValues) {
	if (!selectedValues || !selectedValues.length) return [];
	return selectedValues.map(function (value) {
		var item = getExtraServiceByValue(value);
		return item ? item.name : value;
	});
}

export function formatExtraServiceUnitPrice(item) {
	if (!item || item.feeType !== LEASE_SERVICE_FEE_TYPE.FIXED) return '';
	var fee = item.fee != null ? item.fee : 0;
	return fee.toLocaleString('zh-CN') + (item.unitLabel || '元/车/月');
}

export function getExtraFeeLockedServiceValues(existingRows) {
	var values = [];
	(existingRows || []).forEach(function (row) {
		var rowValues = row.serviceValues || [];
		if (!rowValues.length && row.serviceValue) {
			rowValues = [row.serviceValue];
		}
		rowValues.forEach(function (value) {
			if (value && values.indexOf(value) < 0) values.push(value);
		});
	});
	return values;
}

export function getExtraFeeNewServiceValues(selectedValues, lockedValues) {
	return (selectedValues || []).filter(function (value) {
		return (lockedValues || []).indexOf(value) < 0;
	});
}

export function formatExtraFeeExistingServiceLabel(serviceValues) {
	var names = getExtraServiceNames(serviceValues || []);
	return names.length ? names.join('、') : '历史附加服务项';
}

export function formatExtraServicesDisplay(selectedValues) {
	if (!selectedValues || !selectedValues.length) return '';
	return selectedValues.map(function (value) {
		var item = getExtraServiceByValue(value);
		if (!item) return value;
		if (item.feeType === LEASE_SERVICE_FEE_TYPE.FIXED) {
			return item.name + '（' + formatExtraServiceUnitPrice(item) + '）';
		}
		return item.name + '（' + (item.billingRule || '浮动计费') + '）';
	}).join('、');
}

/** 合同预览：服务内容每行一条 */
export function formatExtraServicesPreviewLines(selectedValues) {
	if (!selectedValues || !selectedValues.length) return [];
	return selectedValues.map(function (value) {
		var item = getExtraServiceByValue(value);
		if (!item) return value;
		if (item.feeType === LEASE_SERVICE_FEE_TYPE.FIXED) {
			return item.name + '（' + formatExtraServiceUnitPrice(item) + '）';
		}
		return item.name + '：' + (item.billingRule || '浮动计费');
	});
}

export function sumFixedExtraServiceFees(selectedValues) {
	if (!selectedValues || !selectedValues.length) return 0;
	var total = 0;
	selectedValues.forEach(function (value) {
		total += getExtraServiceFeeByValue(value);
	});
	return total;
}

/** @deprecated 仅统计固定费用；浮动费用不计入合同初始服务费 */
export function sumExtraServiceFees(selectedValues) {
	return sumFixedExtraServiceFees(selectedValues);
}

export function calcRentServiceSubtotal(rent, serviceFee, vehicleCount) {
	var serviceFeeTotal = serviceFee != null && serviceFee !== '' ? Number(serviceFee) : 0;
	if (!Number.isFinite(serviceFeeTotal)) serviceFeeTotal = 0;
	var hasRent = rent != null && rent !== '';
	if (!hasRent && serviceFeeTotal <= 0) return null;
	var rentVal = hasRent ? Number(rent) : 0;
	if (!Number.isFinite(rentVal)) return null;
	var count = vehicleCount != null && vehicleCount !== '' ? Number(vehicleCount) : 1;
	if (!Number.isFinite(count) || count <= 0) count = 1;
	return Math.round((rentVal + serviceFeeTotal) * count * 100) / 100;
}

export function getRowPlateCount(row) {
	var plates = normalizePlateNos(row);
	var actualPlates = plates.filter(function (plate) {
		return plate !== PLATE_ACTUAL_DELIVERY;
	});
	if (actualPlates.length > 0) return actualPlates.length;
	if (plates.indexOf(PLATE_ACTUAL_DELIVERY) >= 0) return 1;
	return 0;
}

export function calcLeaseOrderKpis(rows, order) {
	var rentServiceTaxTotal = 0;
	var depositTotal = 0;
	var hasSubtotal = false;
	var hasDeposit = false;
	(rows || []).forEach(function (row) {
		var vehicleCount = getRowVehicleCountForPricing(row);
		var subtotal = calcRentServiceSubtotal(row.rent, row.serviceFee, vehicleCount);
		if (subtotal != null) {
			rentServiceTaxTotal += subtotal;
			hasSubtotal = true;
		}
		if (row.deposit != null && row.deposit !== '') {
			var depositVal = Number(row.deposit);
			if (Number.isFinite(depositVal)) {
				depositTotal += depositVal * vehicleCount;
				hasDeposit = true;
			}
		}
	});
	function roundMoney(amount) {
		return Math.round(amount * 100) / 100;
	}
	var monthlyTotal = hasSubtotal ? roundMoney(rentServiceTaxTotal) : null;
	return {
		rentServiceTaxTotal: monthlyTotal,
		depositTotal: hasDeposit ? roundMoney(depositTotal) : null,
		firstPeriodRentService: monthlyTotal,
	};
}

export function formatKpiAmount(value) {
	if (value == null || !Number.isFinite(value)) {
		return '0元';
	}
	return '¥' + value.toLocaleString('zh-CN', {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	});
}

export function countLeaseOrderRows(rows, order) {
	if (!rows || !rows.length) return 0;
	if (order) return calcInsuredVehicleCount(order);
	var total = 0;
	rows.forEach(function (row) {
		total += getRowPlateCount(row);
	});
	return total;
}

export function isDelegateRowStarted(row) {
	if (!row) return false;
	return Boolean((row.name || '').trim())
		|| Boolean((row.contact || '').trim())
		|| Boolean((row.idNumber || '').trim());
}

export function isDelegateRowComplete(row) {
	if (!row) return false;
	return Boolean((row.name || '').trim())
		&& Boolean((row.contact || '').trim())
		&& Boolean((row.idNumber || '').trim());
}

export function normalizeDelegateRows(delegates) {
	return (delegates || []).filter(isDelegateRowStarted);
}

export function createDefaultLeaseOrderState() {
	return {
		insuredVehicleCount: 1,
		thirdPartyLiabilityMillion: null,
		deliveryRegion: [],
		deliveryRegionMode: 'tbd',
		deliveryRegionTbd: true,
		deliveryDate: null,
		deliveryDateStart: null,
		deliveryDateEnd: null,
		deliveryDateMode: 'unconfirmed',
		deliveryDateTbd: true,
		rows: [createEmptyLeaseOrderRow()],
	};
}

/** @deprecated 使用 createDefaultLeaseOrderState */
export var DEFAULT_LEASE_ORDERS = createDefaultLeaseOrderState().rows;

/** 授权委托书 — 委托人行数据 */

export function createEmptyDelegateRow() {
	return {
		id: 'del-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7),
		name: '',
		contact: '',
		idNumber: '',
	};
}

export function createDefaultPowerOfAttorneyState() {
	return {
		delegates: [createEmptyDelegateRow()],
	};
}
