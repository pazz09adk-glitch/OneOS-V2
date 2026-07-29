/**
 * 品牌·型号主数据：优先来自车辆管理种子数据，并与租赁合同演示枚举合并。
 */
import vehicles from '../prototypes/vehicle-management/data/vehicles.json';

/** 租赁合同/条件条款演示用补充车型（车辆台账中可能尚未收录） */
var LEASE_DEMO_EXTRA_CATALOG = [
	{ brand: '现代', models: ['18吨氢燃料电池车', '9.6米厢式货车', '帕力安牌4.5吨冷链车'] },
	{ brand: '苏龙', models: ['9.6米氢燃料电池车', '海格牌18吨双飞翼货车'] },
	{ brand: '飞驰', models: ['集卡头', '半挂车'] },
	{ brand: '跃进', models: ['4.2米冷链车', '4.5吨冷链车'] },
	{ brand: '宇通', models: ['氢燃料电池客车'] },
];

function mergeCatalogs() {
	var map = new Map();
	var sources = arguments;
	for (var s = 0; s < sources.length; s++) {
		var list = sources[s] || [];
		list.forEach(function (item) {
			if (!item || !item.brand) return;
			if (!map.has(item.brand)) map.set(item.brand, new Set());
			var models = item.models || [];
			models.forEach(function (model) {
				if (model) map.get(item.brand).add(model);
			});
		});
	}
	return Array.from(map.entries())
		.map(function (entry) {
			return {
				brand: entry[0],
				models: Array.from(entry[1]).sort(function (a, b) {
					return String(a).localeCompare(String(b), 'zh-CN');
				}),
			};
		})
		.sort(function (a, b) {
			return a.brand.localeCompare(b.brand, 'zh-CN');
		});
}

function buildFromVehicleManagement() {
	var map = new Map();
	(vehicles || []).forEach(function (row) {
		if (!row || !row.brand || !row.model) return;
		if (!map.has(row.brand)) map.set(row.brand, new Set());
		map.get(row.brand).add(row.model);
	});
	return Array.from(map.entries()).map(function (entry) {
		return {
			brand: entry[0],
			models: Array.from(entry[1]).sort(function (a, b) {
				return String(a).localeCompare(String(b), 'zh-CN');
			}),
		};
	});
}

var cachedCatalog = null;

export function getVehicleBrandModelCatalog() {
	if (!cachedCatalog) {
		cachedCatalog = mergeCatalogs(buildFromVehicleManagement(), LEASE_DEMO_EXTRA_CATALOG);
	}
	return cachedCatalog;
}
