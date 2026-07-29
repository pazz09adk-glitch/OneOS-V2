/**
 * 车辆氢费明细 ↔ 加氢站模块 共享数据桥
 * 加氢站侧氢费/对账/加氢记录均读取本 Store；车辆氢费明细页运行时同步全量台账行。
 */

var H2_RECONCILE_RECONCILED = 'reconciled';
var H2_RECONCILE_PENDING = 'pending';
var H2_VERIFY_VERIFIED = 'verified';
var H2_VERIFY_UNVERIFIED = 'unverified';
/** 记录来源：站端上传 | 羚牛上传（车辆氢费明细人工录入） */
var H2_RECORD_SOURCE_STATION = 'station';
var H2_RECORD_SOURCE_LINGNIU = 'lingniu';

/**
 * 原型本地「系统车辆列表」车牌（不含尾缀 F）。命中 → 羚牛车辆，否则 → 非羚牛车辆。
 * 正式环境应改为车辆管理接口；未接真实 API。
 */
var H2_FLEET_PLATE_KEYS = [
	'浙A55666', '浙A77888', '浙A99001', '浙A12345', '浙A67890', '浙A88888', '浙A03561',
	'浙B23456', '浙B99999', '浙B58888',
	'沪A88888', '沪BDB9161', '沪ADB9161',
	'苏E33333',
	'浙A88H201', '浙F00688', '浙F07588', '浙F06618',
	'粤AGR8556', '粤AGP5156',
	/* 车辆氢费明细演示车牌 */
	'浙AD12345', '浙AH55660', '浙BK33210', '粤BK33210', '沪AD12345', '苏EF99887', '京CN88771', '川AL55602'
];

var H2_FLEET_PLATE_SET = (function () {
	var set = {};
	H2_FLEET_PLATE_KEYS.forEach(function (p) {
		set[String(p).toUpperCase()] = true;
	});
	return set;
})();

/** 车牌规范化键：去尾缀 F、大写、去空白 */
function h2BridgeNormalizePlateKey(plateNo) {
	return String(plateNo || '').trim().toUpperCase().replace(/F$/u, '');
}

/** 是否羚牛车辆（系统车辆列表命中） */
function h2BridgeIsLingniuVehicle(plateNo) {
	var key = h2BridgeNormalizePlateKey(plateNo);
	if (!key) return false;
	return Boolean(H2_FLEET_PLATE_SET[key]);
}

var H2_STATION_CODE_MAP = {
	'中国石油中油高新能源牙谷加油加氢站': 'JX-H2-001',
	'杭州临平加氢站': 'HZ-H2-002',
	'上海宝山加氢站': 'SH-H2-003',
	'苏州工业园区备用站': 'SZ-H2-004'
};

var H2_STATION_CODE_SET = (function () {
	var set = {};
	Object.keys(H2_STATION_CODE_MAP).forEach(function (name) {
		set[H2_STATION_CODE_MAP[name]] = true;
	});
	return set;
})();

/** 与车辆氢费明细、加氢站模块对齐的 canonical seed（含本站未核对 / 已核对未对账用例） */
var H2_CANONICAL_LEDGER_SEED = [
	/* 嘉兴本站 · 列表首页用例：未核对（无核对时间）→ 已核对未对账 → 已核对已对账 */
	{ key: 'rf-11', id: 'rf-11', stationId: 'JX-H2-001', stationName: '中国石油中油高新能源牙谷加油加氢站', hydrogenTime: '2026-07-16 09:20:18', plateNo: '浙A55666F', customerName: '中国石油中油高新能源牙谷加油加氢站·站端上报', hydrogenKg: 11.2, costUnitPrice: 42.5, costTotal: 476.0, customerUnitPrice: 42.5, customerAmount: 476.0, settlementStatus: 'customer', mileageKm: 132080, creatorName: '站端账号', verifyStatus: H2_VERIFY_UNVERIFIED, verifiedAt: null, reconcileStatus: H2_RECONCILE_PENDING },
	{ key: 'rf-12', id: 'rf-12', stationId: 'JX-H2-001', stationName: '中国石油中油高新能源牙谷加油加氢站', hydrogenTime: '2026-07-15 16:45:02', plateNo: '浙A77888F', customerName: '中国石油中油高新能源牙谷加油加氢站·站端上报', hydrogenKg: 9.8, costUnitPrice: 42.5, costTotal: 416.5, customerUnitPrice: 42.5, customerAmount: 416.5, settlementStatus: 'customer', mileageKm: null, creatorName: '站端账号', verifyStatus: H2_VERIFY_UNVERIFIED, verifiedAt: null, reconcileStatus: H2_RECONCILE_PENDING },
	{ key: 'rf-13', id: 'rf-13', stationId: 'JX-H2-001', stationName: '中国石油中油高新能源牙谷加油加氢站', hydrogenTime: '2026-07-14 11:08:40', plateNo: '浙A99001F', customerName: '嘉兴市鑫峤供应链科技有限公司', hydrogenKg: 14.0, costUnitPrice: 42.5, costTotal: 595.0, customerUnitPrice: 45, customerAmount: 630.0, settlementStatus: 'customer', mileageKm: 155200, creatorName: '站端账号', verifyStatus: H2_VERIFY_VERIFIED, verifiedAt: '2026-07-14 15:30:00', reconcileStatus: H2_RECONCILE_PENDING, reconcileDate: null },
	{ key: 'rf-1', id: 'rf-1', stationId: 'JX-H2-001', stationName: '中国石油中油高新能源牙谷加油加氢站', hydrogenTime: '2026-05-28 10:21:08', plateNo: '浙A12345F', customerName: '嘉兴市鑫峤供应链科技有限公司', hydrogenKg: 12.5, costUnitPrice: 42.5, costTotal: 531.25, customerUnitPrice: 45, customerAmount: 562.5, settlementStatus: 'customer', mileageKm: 128560, creatorName: '张三', verifyStatus: H2_VERIFY_VERIFIED, verifiedAt: '2026-05-29 10:00:00', reconcileStatus: H2_RECONCILE_RECONCILED, reconcileDate: '2026-05-29 10:00:00' },
	{ key: 'rf-2', id: 'rf-2', stationId: 'JX-H2-001', stationName: '中国石油中油高新能源牙谷加油加氢站', hydrogenTime: '2026-05-26 14:08:33', plateNo: '浙A67890F', customerName: '浙江绿运物流有限公司', hydrogenKg: 10.0, costUnitPrice: 42.5, costTotal: 425.0, customerUnitPrice: 45, customerAmount: 450.0, settlementStatus: 'internal', mileageKm: 95230, creatorName: '李四', verifyStatus: H2_VERIFY_VERIFIED, verifiedAt: '2026-05-27 10:00:00', reconcileStatus: H2_RECONCILE_RECONCILED, reconcileDate: '2026-05-27 10:00:00' },
	{ key: 'rf-3', id: 'rf-3', stationId: 'JX-H2-001', stationName: '中国石油中油高新能源牙谷加油加氢站', hydrogenTime: '2026-05-22 09:15:00', plateNo: '浙A88888F', customerName: '嘉兴市鑫峤供应链科技有限公司', hydrogenKg: 18.3, costUnitPrice: 42.5, costTotal: 777.75, customerUnitPrice: 45, customerAmount: 823.5, settlementStatus: 'customer_self', mileageKm: 201880, creatorName: '王静', verifyStatus: H2_VERIFY_VERIFIED, verifiedAt: '2026-05-23 10:00:00', reconcileStatus: H2_RECONCILE_RECONCILED, reconcileDate: '2026-05-23 10:00:00' },
	{ key: 'rf-4', id: 'rf-4', stationId: 'JX-H2-001', stationName: '中国石油中油高新能源牙谷加油加氢站', hydrogenTime: '2026-05-18 16:42:11', plateNo: '浙A03561F', customerName: '嘉兴港务氢能运输队', hydrogenKg: 15.6, costUnitPrice: 42.5, costTotal: 663.0, customerUnitPrice: 45, customerAmount: 702.0, settlementStatus: 'customer', mileageKm: 167420, creatorName: '张三', verifyStatus: H2_VERIFY_VERIFIED, verifiedAt: '2026-05-19 10:00:00', reconcileStatus: H2_RECONCILE_RECONCILED, reconcileDate: '2026-05-19 10:00:00' },
	{ key: 'rf-5', id: 'rf-5', stationId: 'HZ-H2-002', stationName: '杭州临平加氢站', hydrogenTime: '2026-05-30 09:30:22', plateNo: '浙B23456F', customerName: '杭州临平城配中心', hydrogenKg: 15.3, costUnitPrice: 43.0, costTotal: 657.9, customerUnitPrice: 46, customerAmount: 703.8, settlementStatus: 'internal', mileageKm: 143200, creatorName: '赵敏', verifyStatus: H2_VERIFY_VERIFIED, verifiedAt: '2026-05-31 10:00:00', reconcileStatus: H2_RECONCILE_RECONCILED, reconcileDate: '2026-05-31 10:00:00' },
	{ key: 'rf-6', id: 'rf-6', stationId: 'HZ-H2-002', stationName: '杭州临平加氢站', hydrogenTime: '2026-05-27 18:10:05', plateNo: '浙B99999F', customerName: '浙江氢运科技', hydrogenKg: 18.2, costUnitPrice: 43.0, costTotal: 782.6, customerUnitPrice: 46, customerAmount: 837.2, settlementStatus: 'customer_self', mileageKm: 189650, creatorName: '陈浩', verifyStatus: H2_VERIFY_VERIFIED, verifiedAt: '2026-05-28 10:00:00', reconcileStatus: H2_RECONCILE_RECONCILED, reconcileDate: '2026-05-28 10:00:00' },
	{ key: 'rf-7', id: 'rf-7', stationId: 'HZ-H2-002', stationName: '杭州临平加氢站', hydrogenTime: '2026-05-24 11:05:40', plateNo: '浙B58888F', customerName: '杭州临平城配中心', hydrogenKg: 11.8, costUnitPrice: 43.0, costTotal: 507.4, customerUnitPrice: 46, customerAmount: 542.8, settlementStatus: 'customer', mileageKm: 110340, creatorName: '李四', verifyStatus: H2_VERIFY_VERIFIED, verifiedAt: '2026-05-25 10:00:00', reconcileStatus: H2_RECONCILE_RECONCILED, reconcileDate: '2026-05-25 10:00:00' },
	{ key: 'rf-8', id: 'rf-8', stationId: 'SH-H2-003', stationName: '上海宝山加氢站', hydrogenTime: '2026-04-20 16:45:18', plateNo: '沪A88888F', customerName: '上海羚牛氢运', hydrogenKg: 8.0, costUnitPrice: 44.0, costTotal: 352.0, customerUnitPrice: 47, customerAmount: 376.0, settlementStatus: 'internal', mileageKm: 88420, creatorName: '王静', verifyStatus: H2_VERIFY_VERIFIED, verifiedAt: '2026-04-21 10:00:00', reconcileStatus: H2_RECONCILE_RECONCILED, reconcileDate: '2026-04-21 10:00:00' },
	{ key: 'rf-9', id: 'rf-9', stationId: 'SH-H2-003', stationName: '上海宝山加氢站', hydrogenTime: '2026-04-08 09:12:55', plateNo: '沪BDB9161F', customerName: '宝山园区试运车队', hydrogenKg: 9.5, costUnitPrice: 44.0, costTotal: 418.0, customerUnitPrice: 47, customerAmount: 446.5, settlementStatus: 'customer_self', mileageKm: 76500, creatorName: '张三', verifyStatus: H2_VERIFY_VERIFIED, verifiedAt: '2026-04-09 10:00:00', reconcileStatus: H2_RECONCILE_PENDING, reconcileDate: null },
	{ key: 'rf-10', id: 'rf-10', stationId: 'SZ-H2-004', stationName: '苏州工业园区备用站', hydrogenTime: '2026-03-15 10:00:00', plateNo: '苏E33333F', customerName: '苏州试运客户', hydrogenKg: 6.2, costUnitPrice: 41.0, costTotal: 254.2, customerUnitPrice: 44, customerAmount: 272.8, settlementStatus: 'customer', mileageKm: 45210, creatorName: '赵敏', verifyStatus: H2_VERIFY_UNVERIFIED, verifiedAt: null, reconcileStatus: H2_RECONCILE_PENDING },
	/* 非羚牛车辆演示：车牌不在系统车辆列表 → 列表核对/对账字段应显示为空 */
	{ key: 'rf-ext-1', id: 'rf-ext-1', stationId: 'JX-H2-001', stationName: '中国石油中油高新能源牙谷加油加氢站', hydrogenTime: '2026-07-13 14:22:00', plateNo: '浙C77801F', customerName: '中国石油中油高新能源牙谷加油加氢站·站端上报', hydrogenKg: 8.5, costUnitPrice: 42.5, costTotal: 361.25, customerUnitPrice: 42.5, customerAmount: 361.25, settlementStatus: 'customer', mileageKm: 88000, creatorName: '站端账号', verifyStatus: H2_VERIFY_UNVERIFIED, verifiedAt: null, reconcileStatus: H2_RECONCILE_PENDING }
];

function h2BridgeFormatDateTime(value) {
	if (!value) return '';
	if (typeof value === 'string') return value;
	if (value.format) return value.format('YYYY-MM-DD HH:mm:ss');
	return String(value);
}

/** 已对账记录必须有对账时间；缺省时按加氢日次日 10:00:00 推导（原型演示） */
function h2BridgeDeriveReconcileTime(hydrogenTime) {
	var s = h2BridgeFormatDateTime(hydrogenTime);
	var m = String(s).match(/^(\d{4})-(\d{2})-(\d{2})/);
	if (!m) return '2026-01-01 10:00:00';
	var d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]) + 1, 10, 0, 0);
	var pad = function (n) { return n < 10 ? '0' + n : String(n); };
	return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) + ' 10:00:00';
}

function h2BridgeResolveReconcileTime(row) {
	/* 对账时间仅来自对账单回写的 reconcileDate；勿用 reconciledAt（完成核对会写入） */
	var explicit = row.reconcileDate || '';
	if (explicit) return h2BridgeFormatDateTime(explicit);
	if (row.reconcileStatus === H2_RECONCILE_RECONCILED) {
		return h2BridgeDeriveReconcileTime(row.hydrogenTime);
	}
	return '';
}

function h2BridgeMatchStatementPatch(row, patch) {
	if (patch.ledgerId && row.ledgerSyncId && patch.ledgerId === row.ledgerSyncId) return true;
	var rowTime = h2BridgeFormatDateTime(row.hydrogenTime);
	var patchTime = String(patch.hydrogenTime || '');
	return (row.stationName || '') === (patch.stationName || '')
		&& (row.plateNo || '') === (patch.plateNo || '')
		&& (rowTime === patchTime || String(row.hydrogenTime || '') === patchTime);
}

function h2BridgeInferRecordSource(row) {
	if (!row) return H2_RECORD_SOURCE_LINGNIU;
	if (row.recordSource === H2_RECORD_SOURCE_STATION || row.recordSource === H2_RECORD_SOURCE_LINGNIU) {
		return row.recordSource;
	}
	var creator = String(row.creatorName || '').trim();
	var customer = String(row.customerName || '');
	if (creator === '站端账号' || customer.indexOf('·站端上报') >= 0) return H2_RECORD_SOURCE_STATION;
	return H2_RECORD_SOURCE_LINGNIU;
}

function h2BridgeNormalizeRow(row) {
	if (!row) return row;
	var next = Object.assign({}, row);
	next.recordSource = h2BridgeInferRecordSource(next);
	if (!Array.isArray(next.changeLogs)) next.changeLogs = [];
	if (next.verifiedByName == null) next.verifiedByName = '';
	if (next.reconciledByName == null) next.reconciledByName = '';
	return next;
}

function h2BridgeFormatLogScalar(value) {
	if (value == null || value === '') return '—';
	if (typeof value === 'number' && isFinite(value)) {
		return String(Math.round(value * 100) / 100);
	}
	return String(value);
}

/** 站端/台账编辑时对比字段，生成变更日志条目（时间倒序由调用方 unshift） */
function h2BridgeBuildFieldChangeLogs(prev, next, operatorName) {
	if (!prev || !next) return [];
	var fields = [
		{ key: 'hydrogenTime', label: '加氢时间' },
		{ key: 'plateNo', label: '车牌号' },
		{ key: 'hydrogenKg', label: '加氢量' },
		{ key: 'costUnitPrice', label: '氢气单价' },
		{ key: 'costTotal', label: '加氢总额', alt: 'customerAmount' },
		{ key: 'mileageKm', label: '里程' }
	];
	var logs = [];
	var now = new Date();
	var nowStr = now.getFullYear() + '-' + h2BridgePad2(now.getMonth() + 1) + '-' + h2BridgePad2(now.getDate())
		+ ' ' + h2BridgePad2(now.getHours()) + ':' + h2BridgePad2(now.getMinutes()) + ':' + h2BridgePad2(now.getSeconds());
	fields.forEach(function (f) {
		var before = prev[f.key];
		var after = next[f.key];
		if (before == null && f.alt) before = prev[f.alt];
		if (after == null && f.alt) after = next[f.alt];
		var beforeText = h2BridgeFormatLogScalar(before);
		var afterText = h2BridgeFormatLogScalar(after);
		if (beforeText === afterText) return;
		logs.push({
			id: 'clog-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8),
			at: nowStr,
			operatorName: operatorName || next.creatorName || '系统',
			userName: operatorName || next.creatorName || '系统',
			field: f.key,
			fieldLabel: f.label,
			oldValue: beforeText,
			newValue: afterText,
			before: beforeText,
			after: afterText
		});
	});
	return logs;
}

function h2BridgeEnrichSeedDefaults(row) {
	var next = h2BridgeNormalizeRow(row);
	if (next.verifyStatus === H2_VERIFY_VERIFIED && !next.verifiedByName) {
		next.verifiedByName = next.creatorName === '站端账号' ? '李业务' : (next.creatorName || '李业务');
	}
	if (next.reconcileStatus === H2_RECONCILE_RECONCILED && !next.reconciledByName) {
		next.reconciledByName = '系统管理员';
	}
	if (next.key === 'rf-13' && (!next.changeLogs || !next.changeLogs.length)) {
		next.changeLogs = [
			{
				id: 'clog-seed-rf13-1',
				at: '2026-07-14 11:20:00',
				operatorName: '站端账号',
				userName: '站端账号',
				field: 'hydrogenKg',
				fieldLabel: '加氢量',
				oldValue: '13.50',
				newValue: '14.00',
				before: '13.50',
				after: '14.00'
			}
		];
	}
	if (next.key === 'rf-1' && (!next.changeLogs || !next.changeLogs.length)) {
		next.changeLogs = [
			{
				id: 'clog-seed-rf1-1',
				at: '2026-05-28 11:05:00',
				operatorName: '张三',
				userName: '张三',
				field: 'costUnitPrice',
				fieldLabel: '氢气单价',
				oldValue: '42.00',
				newValue: '42.50',
				before: '42.00',
				after: '42.50'
			}
		];
	}
	return next;
}

function h2BridgeCloneRows(rows) {
	return (rows || []).map(function (r) {
		var cloned = Object.assign({}, r);
		if (Array.isArray(r.changeLogs)) {
			cloned.changeLogs = r.changeLogs.map(function (log) { return Object.assign({}, log); });
		}
		return h2BridgeNormalizeRow(cloned);
	});
}

function h2BridgeApplyStatementPatches(rows, patches) {
	if (!patches || !patches.length) return h2BridgeCloneRows(rows);
	return (rows || []).map(function (r) {
		var patch = null;
		var i;
		for (i = 0; i < patches.length; i++) {
			if (h2BridgeMatchStatementPatch(r, patches[i])) {
				patch = patches[i];
				break;
			}
		}
		if (!patch) return h2BridgeNormalizeRow(r);
		return h2BridgeNormalizeRow(Object.assign({}, r, {
			statementPatched: true,
			reconcileStatus: H2_RECONCILE_RECONCILED,
			reconcileDate: patch.reconcileDate,
			receiptDate: patch.receiptDate,
			stationPaymentStatus: patch.paymentStatus || 'paid',
			paymentStatus: patch.paymentStatus || 'paid',
			statementRecordId: patch.statementRecordId != null ? patch.statementRecordId : r.statementRecordId,
			reconciledByName: patch.reconciler || patch.reconciledByName || r.reconciledByName || ''
		}));
	});
}

function h2BridgeBuildInitialRows() {
	var patches = (typeof window !== 'undefined' && window.H2_STATION_STATEMENT_LEDGER_UPDATES) || [];
	var seeded = (H2_CANONICAL_LEDGER_SEED || []).map(h2BridgeEnrichSeedDefaults);
	return h2BridgeApplyStatementPatches(seeded, patches);
}

function h2BridgePad2(n) {
	return n < 10 ? '0' + n : String(n);
}

/** 自然日 YYYY-MM-DD（设备本地时区） */
function h2BridgeTodayDateKey(d) {
	var x = d || new Date();
	return x.getFullYear() + '-' + h2BridgePad2(x.getMonth() + 1) + '-' + h2BridgePad2(x.getDate());
}

function h2BridgeYesterdayDateKey() {
	var d = new Date();
	d.setDate(d.getDate() - 1);
	return h2BridgeTodayDateKey(d);
}

function h2BridgeManualLedgerKey(stationId, ledgerDate) {
	return String(stationId || '').trim() + '|' + String(ledgerDate || '').trim();
}

/** 解析站点编码：支持传入编码或站名（勿把站名原样当 id） */
function h2BridgeResolveStationId(stationId, stationName) {
	var a = String(stationId || '').trim();
	var b = String(stationName || '').trim();
	if (a && H2_STATION_CODE_MAP[a]) return H2_STATION_CODE_MAP[a];
	if (b && H2_STATION_CODE_MAP[b]) return H2_STATION_CODE_MAP[b];
	if (a && H2_STATION_CODE_SET[a]) return a;
	if (b && H2_STATION_CODE_SET[b]) return b;
	return a || '';
}

/** 手工台账种子：前日已上传；昨日默认未上传，便于演示「前一日缺失则今日禁新增」 */
function h2BridgeBuildInitialManualLedgers() {
	var d = new Date();
	d.setDate(d.getDate() - 2);
	var dayBeforeYesterday = h2BridgeTodayDateKey(d);
	return [
		{
			id: 'ml-seed-day-before-yesterday',
			stationId: 'JX-H2-001',
			stationName: '中国石油中油高新能源牙谷加油加氢站',
			ledgerDate: dayBeforeYesterday,
			images: [
				{
					id: 'ml-img-seed-1',
					name: '前日手工台账.jpg',
					dataUrl: '',
					placeholder: true,
					archived: true,
					uploadedAt: dayBeforeYesterday + ' 18:30:00'
				}
			],
			updatedAt: dayBeforeYesterday + ' 18:30:00'
		}
	];
}

function h2BridgeCloneManualLedgers(list) {
	return (list || []).map(function (item) {
		return Object.assign({}, item, {
			images: (item.images || []).map(function (img) { return Object.assign({}, img); })
		});
	});
}

function h2BridgeCreateStore() {
	var listeners = [];
	var state = {
		rows: h2BridgeBuildInitialRows(),
		manualLedgers: h2BridgeBuildInitialManualLedgers()
	};

	function notify() {
		listeners.forEach(function (fn) {
			try { fn(state.rows); } catch (_e) { /* noop */ }
		});
	}

	return {
		getRows: function () { return h2BridgeCloneRows(state.rows); },
		setRows: function (rows) {
			state.rows = h2BridgeCloneRows(rows);
			notify();
		},
		getManualLedgers: function () { return h2BridgeCloneManualLedgers(state.manualLedgers); },
		subscribe: function (fn) {
			listeners.push(fn);
			return function () {
				listeners = listeners.filter(function (item) { return item !== fn; });
			};
		},
		applyPatches: function (patches) {
			if (!patches || !patches.length) return;
			state.rows = h2BridgeApplyStatementPatches(state.rows, patches);
			notify();
		},
		upsertRow: function (row) {
			if (!row) return null;
			var next = Object.assign({}, row);
			if (!next.id && !next.key) {
				next.id = 'rf-h5-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
				next.key = next.id;
			} else {
				next.id = next.id || next.key;
				next.key = next.key || next.id;
			}
			if (!next.reconcileStatus) next.reconcileStatus = H2_RECONCILE_PENDING;
			if (!next.verifyStatus) next.verifyStatus = H2_VERIFY_UNVERIFIED;
			if (!next.recordSource) next.recordSource = h2BridgeInferRecordSource(next);
			var found = false;
			var saved = null;
			state.rows = state.rows.map(function (r) {
				if ((r.id || r.key) === next.id || (r.id || r.key) === next.key) {
					found = true;
					var merged = h2BridgeNormalizeRow(Object.assign({}, r, next));
					if (!next.recordSource && r.recordSource) merged.recordSource = r.recordSource;
					var operator = next.changeLogOperator || next.creatorName || r.creatorName || '系统';
					var fieldLogs = h2BridgeBuildFieldChangeLogs(r, merged, operator);
					var prevLogs = Array.isArray(r.changeLogs) ? r.changeLogs.slice() : [];
					if (Array.isArray(next.changeLogs) && next.replaceChangeLogs) {
						merged.changeLogs = next.changeLogs.slice();
					} else {
						merged.changeLogs = fieldLogs.concat(prevLogs);
					}
					saved = merged;
					return merged;
				}
				return r;
			});
			if (!found) {
				saved = h2BridgeNormalizeRow(next);
				if (!Array.isArray(saved.changeLogs)) saved.changeLogs = [];
				state.rows = [saved].concat(state.rows);
			}
			notify();
			return Object.assign({}, saved);
		},
		removeRow: function (id) {
			var target = String(id || '');
			if (!target) return false;
			var before = state.rows.length;
			state.rows = state.rows.filter(function (r) {
				return String(r.id || r.key || '') !== target;
			});
			var changed = state.rows.length !== before;
			if (changed) notify();
			return changed;
		},
		upsertManualLedger: function (input) {
			if (!input) return null;
			var stationId = h2BridgeResolveStationId(input.stationId, input.stationName);
			var stationName = String(input.stationName || '').trim();
			var ledgerDate = String(input.ledgerDate || h2BridgeTodayDateKey()).trim();
			if (!stationId || !ledgerDate) return null;
			var key = h2BridgeManualLedgerKey(stationId, ledgerDate);
			var existing = null;
			state.manualLedgers.forEach(function (item) {
				if (h2BridgeManualLedgerKey(item.stationId, item.ledgerDate) === key) existing = item;
			});
			function normalizeImage(img, i) {
				return {
					id: img.id || ('ml-img-' + Date.now() + '-' + i),
					name: String(img.name || ('台账照片' + (i + 1) + '.jpg')),
					dataUrl: String(img.dataUrl || ''),
					placeholder: Boolean(img.placeholder),
					archived: true,
					uploadedAt: img.uploadedAt || (ledgerDate + ' 12:00:00')
				};
			}
			/** 已归档图不可删：保留原有全部，仅追加新图 */
			var images = (existing && existing.images ? existing.images : []).map(function (img, i) {
				return normalizeImage(img, i);
			});
			var seen = {};
			images.forEach(function (img) { seen[img.id] = true; });
			(input.images || []).forEach(function (img, i) {
				var nextImg = normalizeImage(img, images.length + i);
				if (!nextImg.dataUrl && !nextImg.placeholder) return;
				if (seen[nextImg.id]) return;
				seen[nextImg.id] = true;
				images.push(nextImg);
			});
			if (!images.length) return null;
			var now = new Date();
			var nowStr = now.getFullYear() + '-' + h2BridgePad2(now.getMonth() + 1) + '-' + h2BridgePad2(now.getDate())
				+ ' ' + h2BridgePad2(now.getHours()) + ':' + h2BridgePad2(now.getMinutes()) + ':' + h2BridgePad2(now.getSeconds());
			var next = {
				id: 'ml-' + stationId + '-' + ledgerDate,
				stationId: stationId,
				stationName: stationName || stationId,
				ledgerDate: ledgerDate,
				images: images,
				updatedAt: nowStr
			};
			var found = false;
			state.manualLedgers = state.manualLedgers.map(function (item) {
				if (h2BridgeManualLedgerKey(item.stationId, item.ledgerDate) === key) {
					found = true;
					return next;
				}
				return item;
			});
			if (!found) state.manualLedgers = [next].concat(state.manualLedgers);
			notify();
			return h2BridgeCloneManualLedgers([next])[0];
		},
		getManualLedger: function (stationIdOrName, ledgerDate) {
			var dateKey = String(ledgerDate || h2BridgeTodayDateKey()).trim();
			var sid = h2BridgeResolveStationId(stationIdOrName, stationIdOrName);
			if (!sid) sid = h2BridgeResolveStationId('', stationIdOrName);
			if (!sid) return null;
			var key = h2BridgeManualLedgerKey(sid, dateKey);
			var i;
			for (i = 0; i < state.manualLedgers.length; i++) {
				var item = state.manualLedgers[i];
				if (h2BridgeManualLedgerKey(item.stationId, item.ledgerDate) === key) {
					return h2BridgeCloneManualLedgers([item])[0];
				}
			}
			return null;
		},
		listManualLedgersByStation: function (stationIdOrName) {
			var sid = h2BridgeResolveStationId(stationIdOrName, stationIdOrName);
			if (!sid) sid = h2BridgeResolveStationId('', stationIdOrName);
			if (!sid) return [];
			return h2BridgeCloneManualLedgers(state.manualLedgers.filter(function (item) {
				return item.stationId === sid;
			})).sort(function (a, b) {
				return String(b.ledgerDate).localeCompare(String(a.ledgerDate));
			});
		},
		hasManualLedgerForDate: function (stationIdOrName, ledgerDate) {
			var entry = this.getManualLedger(stationIdOrName, ledgerDate);
			return Boolean(entry && entry.images && entry.images.length);
		}
	};
}

function h2BridgeMapToRefuelRecord(row) {
	var costTotal = row.costTotal != null ? row.costTotal : row.costAmount;
	return {
		id: row.id || row.key,
		stationName: row.stationName,
		hydrogenTime: h2BridgeFormatDateTime(row.hydrogenTime),
		plateNo: row.plateNo,
		customerName: row.customerName,
		hydrogenKg: row.hydrogenKg,
		costUnitPrice: row.costUnitPrice,
		costAmount: costTotal,
		customerUnitPrice: row.customerUnitPrice,
		customerAmount: row.customerAmount,
		settlementStatus: row.settlementStatus,
		orderNo: row.orderNo,
		mileageKm: row.mileageKm
	};
}

function h2BridgeBuildRefuelOrderNo(record, index) {
	if (record && record.orderNo) return record.orderNo;
	var idPart = String((record && record.id) || (record && record.key) || '').replace(/\D/g, '') || String(index + 1);
	return 'JQ' + idPart.padStart(4, '0') + String(100 + index);
}

function h2BridgeMapToStationLedgerRow(row, index) {
	var costTotal = row.costTotal != null ? row.costTotal : row.costAmount;
	var isReconciled = row.reconcileStatus === H2_RECONCILE_RECONCILED;
	return {
		id: row.id || row.key || ('ledger-' + index),
		stationName: row.stationName,
		hydrogenTime: h2BridgeFormatDateTime(row.hydrogenTime),
		plateNo: row.plateNo,
		customerName: row.customerName,
		hydrogenKg: row.hydrogenKg,
		costUnitPrice: row.costUnitPrice,
		costTotal: costTotal,
		settlementStatus: row.settlementStatus,
		orderNo: h2BridgeBuildRefuelOrderNo(row, index),
		/* 对账单筛选依赖：须透出核对状态，否则站点侧会把全部行当成未核对 */
		verifyStatus: row.verifyStatus === H2_VERIFY_VERIFIED ? H2_VERIFY_VERIFIED : H2_VERIFY_UNVERIFIED,
		verifiedAt: row.verifiedAt || null,
		reconcileStatus: row.reconcileStatus || (isReconciled ? H2_RECONCILE_RECONCILED : H2_RECONCILE_PENDING),
		statementRecordId: row.statementRecordId || null,
		reconcileDate: row.reconcileDate || null,
		receiptDate: row.receiptDate || null,
		paymentStatus: row.paymentStatus || (isReconciled ? 'unpaid' : null)
	};
}

function h2BridgeMapToHrRecord(row, index, fillerNames) {
	var fillers = fillerNames || ['张三', '李四', '王静', '赵敏', '陈浩'];
	var costTotal = row.costTotal != null ? row.costTotal : row.costAmount;
	var unitPrice = row.costUnitPrice != null ? row.costUnitPrice : row.customerUnitPrice;
	var totalAmount = costTotal != null ? costTotal : row.customerAmount;
	var reconcileTime = h2BridgeResolveReconcileTime(row);
	var isReconciled = row.reconcileStatus === H2_RECONCILE_RECONCILED || Boolean(row.reconcileDate);
	var verifiedAt = row.verifiedAt || '';
	var changeLogs = Array.isArray(row.changeLogs)
		? row.changeLogs.map(function (log) { return Object.assign({}, log); })
		: [];
	return {
		id: row.id || row.key || ('hr-' + (index + 1)),
		hydrogenTime: h2BridgeFormatDateTime(row.hydrogenTime),
		plateNo: row.plateNo,
		hydrogenKg: row.hydrogenKg,
		unitPrice: unitPrice,
		totalAmount: totalAmount,
		/* 兼容旧列名：金额同站端口径 */
		customerAmount: totalAmount,
		costUnitPrice: unitPrice,
		costTotal: totalAmount,
		mileageKm: row.mileageKm,
		fillerName: row.creatorName || fillers[index % fillers.length],
		settlementStatus: row.settlementStatus,
		stationName: row.stationName,
		stationCode: row.stationId || H2_STATION_CODE_MAP[row.stationName] || '',
		recordSource: h2BridgeInferRecordSource(row),
		verifyStatus: row.verifyStatus === H2_VERIFY_VERIFIED ? H2_VERIFY_VERIFIED : H2_VERIFY_UNVERIFIED,
		verifiedAt: verifiedAt ? h2BridgeFormatDateTime(verifiedAt) : '',
		verifiedByName: row.verifiedByName || '',
		reconcileStatus: isReconciled ? H2_RECONCILE_RECONCILED : H2_RECONCILE_PENDING,
		reconcileTime: isReconciled ? reconcileTime : '',
		reconciledByName: row.reconciledByName || '',
		changeLogs: changeLogs
	};
}

function h2BridgeMapToOrderRecord(row, index) {
	var time = h2BridgeFormatDateTime(row.hydrogenTime);
	return {
		id: index + 1,
		stationCode: row.stationId || H2_STATION_CODE_MAP[row.stationName] || '',
		stationName: row.stationName,
		time: time.length >= 16 ? time.slice(0, 16) : time,
		plateNo: (row.plateNo || '').replace(/F$/, ''),
		amountKg: row.hydrogenKg,
		amountYuan: row.customerAmount
	};
}

function h2BridgeGetStore() {
	if (typeof window === 'undefined') return null;
	if (!window.H2_VEHICLE_LEDGER_STORE) {
		window.H2_VEHICLE_LEDGER_STORE = h2BridgeCreateStore();
	}
	return window.H2_VEHICLE_LEDGER_STORE;
}

function h2BridgeEnsureApi() {
	if (typeof window === 'undefined') return;
	var store = h2BridgeGetStore();
	var existing = window.H2_VEHICLE_LEDGER_API || {};
	window.H2_VEHICLE_LEDGER_API = Object.assign({}, existing, {
		getRows: function () { return store.getRows(); },
		syncRows: function (rows) {
			if (!rows) return;
			store.setRows(rows);
		},
		applyPatches: function (patches) {
			store.applyPatches(patches);
			if (typeof existing.applyPatches === 'function') {
				existing.applyPatches(patches);
			}
		}
	});
}

function h2BridgeGetAllRefuelRecords() {
	var store = h2BridgeGetStore();
	return store.getRows().map(h2BridgeMapToRefuelRecord);
}

function h2BridgeGetRefuelRecordsByStation(stationName) {
	var name = String(stationName || '').trim();
	return h2BridgeGetAllRefuelRecords()
		.filter(function (r) { return (r.stationName || '') === name; })
		.sort(function (a, b) {
			return String(b.hydrogenTime || '').localeCompare(String(a.hydrogenTime || ''));
		});
}

function h2BridgeBuildStationLedgerStore() {
	var store = h2BridgeGetStore();
	return store.getRows().map(h2BridgeMapToStationLedgerRow);
}

function h2BridgeGetHrRecords(fillerNames) {
	var store = h2BridgeGetStore();
	return store.getRows().map(function (row, index) {
		return h2BridgeMapToHrRecord(row, index, fillerNames);
	});
}

function h2BridgeGetOrderRecords() {
	var store = h2BridgeGetStore();
	return store.getRows().map(h2BridgeMapToOrderRecord);
}

function h2BridgeGetStationList() {
	var seen = {};
	var list = [];
	h2BridgeGetStore().getRows().forEach(function (row) {
		var code = row.stationId || H2_STATION_CODE_MAP[row.stationName];
		if (!code || seen[code]) return;
		seen[code] = true;
		list.push({ value: code, label: row.stationName });
	});
	return list;
}

/** 车牌写入口径：大写并补尾缀 F */
function h2BridgeNormalizePlate(plateNo) {
	var plate = String(plateNo || '').trim().toUpperCase();
	if (plate && !/F$/u.test(plate)) plate += 'F';
	return plate;
}

/** 时间写入口径：补全秒 */
function h2BridgeNormalizeHydrogenTime(hydrogenTime) {
	var s = String(hydrogenTime || '').trim();
	if (s.length === 16) s += ':00';
	return s;
}

/**
 * 业务主键：同站 + 同车牌 + 同加氢时间（精确到秒）视为重复。
 * @returns {object|null} 已存在行的浅拷贝，未命中返回 null
 */
function h2BridgeFindDuplicateRow(candidate, excludeId) {
	if (!candidate) return null;
	var store = h2BridgeGetStore();
	if (!store) return null;
	var station = String(candidate.stationName || '').trim();
	var plate = h2BridgeNormalizePlate(candidate.plateNo);
	var time = h2BridgeNormalizeHydrogenTime(candidate.hydrogenTime);
	if (!station || !plate || !time) return null;
	var exclude = excludeId != null ? String(excludeId) : '';
	var rows = store.getRows();
	var i;
	for (i = 0; i < rows.length; i++) {
		var row = rows[i];
		var id = String(row.id || row.key || '');
		if (exclude && id === exclude) continue;
		if (String(row.stationName || '').trim() !== station) continue;
		if (h2BridgeNormalizePlate(row.plateNo) !== plate) continue;
		if (h2BridgeNormalizeHydrogenTime(row.hydrogenTime) !== time) continue;
		return Object.assign({}, row);
	}
	return null;
}

/**
 * 总额与「单价×量」偏差（元）。容差默认 0.05。
 * @returns {{ expected: number, actual: number, diff: number }|null}
 */
function h2BridgeTotalAmountMismatch(unitPrice, hydrogenKg, totalAmount, toleranceYuan) {
	var p = Number(unitPrice);
	var k = Number(hydrogenKg);
	var a = Number(totalAmount);
	if (!isFinite(p) || !isFinite(k) || !isFinite(a)) return null;
	var expected = Math.round(p * k * 100) / 100;
	var actual = Math.round(a * 100) / 100;
	var tol = toleranceYuan != null ? Number(toleranceYuan) : 0.05;
	if (!isFinite(tol)) tol = 0.05;
	var diff = Math.round(Math.abs(actual - expected) * 100) / 100;
	if (diff <= tol) return null;
	return { expected: expected, actual: actual, diff: diff };
}

/** 取该站最近一条流水的站端口径单价，缺省 42.5 */
function h2BridgeLookupStationUnitPrice(stationName) {
	var name = String(stationName || '').trim();
	if (!name) return 42.5;
	var store = h2BridgeGetStore();
	if (!store) return 42.5;
	var rows = store.getRows().slice().sort(function (a, b) {
		return String(b.hydrogenTime || '').localeCompare(String(a.hydrogenTime || ''));
	});
	var i;
	for (i = 0; i < rows.length; i++) {
		if (String(rows[i].stationName || '').trim() !== name) continue;
		var price = rows[i].costUnitPrice != null ? rows[i].costUnitPrice : rows[i].customerUnitPrice;
		var n = Number(price);
		if (isFinite(n) && n >= 0) return Math.round(n * 100) / 100;
	}
	return 42.5;
}

function h2BridgeInit() {
	h2BridgeEnsureApi();
	var store = h2BridgeGetStore();
	if (typeof window !== 'undefined') {
		window.H2VehicleLedgerBridge = {
			getRows: function () { return store.getRows(); },
			getAllRefuelRecords: h2BridgeGetAllRefuelRecords,
			getRefuelRecordsByStation: h2BridgeGetRefuelRecordsByStation,
			buildStationLedgerStore: h2BridgeBuildStationLedgerStore,
			getHrRecords: h2BridgeGetHrRecords,
			getOrderRecords: h2BridgeGetOrderRecords,
			getStationList: h2BridgeGetStationList,
			normalizePlate: h2BridgeNormalizePlate,
			normalizeHydrogenTime: h2BridgeNormalizeHydrogenTime,
			findDuplicateRow: h2BridgeFindDuplicateRow,
			totalAmountMismatch: h2BridgeTotalAmountMismatch,
			lookupStationUnitPrice: h2BridgeLookupStationUnitPrice,
			todayDateKey: h2BridgeTodayDateKey,
			yesterdayDateKey: h2BridgeYesterdayDateKey,
			getManualLedger: function (stationIdOrName, ledgerDate) {
				return store.getManualLedger(stationIdOrName, ledgerDate);
			},
			listManualLedgersByStation: function (stationIdOrName) {
				return store.listManualLedgersByStation(stationIdOrName);
			},
			hasManualLedgerForDate: function (stationIdOrName, ledgerDate) {
				return store.hasManualLedgerForDate(stationIdOrName, ledgerDate);
			},
			upsertManualLedger: function (input) {
				return store.upsertManualLedger(input);
			},
			/** 前一日台账未上传（且昨日≥本站首笔加氢日）→ 今日禁新增 */
			isManualLedgerGateBlocked: function (stationIdOrName) {
				var station = String(stationIdOrName || '').trim();
				if (!station) return false;
				var todayKey = h2BridgeTodayDateKey();
				var yesterdayKey = h2BridgeYesterdayDateKey();
				var rows = store.getRows() || [];
				var earliest = null;
				rows.forEach(function (row) {
					var sid = String(row.stationId || '').trim();
					var sn = String(row.stationName || '').trim();
					if (sid !== station && sn !== station) return;
					var m = String(row.hydrogenTime || '').match(/^(\d{4}-\d{2}-\d{2})/);
					if (!m) return;
					if (!earliest || m[1] < earliest) earliest = m[1];
				});
				if (!earliest || yesterdayKey > todayKey || yesterdayKey < earliest) return false;
				return !store.hasManualLedgerForDate(station, yesterdayKey);
			},
			upsertRow: function (row) { return store.upsertRow(row); },
			removeRow: function (id) { return store.removeRow(id); },
			subscribe: function (fn) { return store.subscribe(fn); },
			isLingniuVehicle: h2BridgeIsLingniuVehicle,
			normalizePlateKey: h2BridgeNormalizePlateKey
		};
	}
	return store;
}

h2BridgeInit();

export {
	H2_CANONICAL_LEDGER_SEED,
	H2_STATION_CODE_MAP,
	H2_RECONCILE_RECONCILED,
	H2_RECONCILE_PENDING,
	H2_VERIFY_VERIFIED,
	H2_VERIFY_UNVERIFIED,
	H2_RECORD_SOURCE_STATION,
	H2_RECORD_SOURCE_LINGNIU,
	h2BridgeInit,
	h2BridgeGetStore,
	h2BridgeGetAllRefuelRecords,
	h2BridgeGetRefuelRecordsByStation,
	h2BridgeBuildStationLedgerStore,
	h2BridgeGetHrRecords,
	h2BridgeGetOrderRecords,
	h2BridgeGetStationList,
	h2BridgeNormalizePlate,
	h2BridgeNormalizeHydrogenTime,
	h2BridgeFindDuplicateRow,
	h2BridgeTotalAmountMismatch,
	h2BridgeLookupStationUnitPrice,
	h2BridgeInferRecordSource,
	h2BridgeIsLingniuVehicle,
	h2BridgeNormalizePlateKey
};
