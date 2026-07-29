// 【重要】必须使用 const Component 作为组件变量名
// 车辆业务 - 交车管理（ONEOS运管平台，布局参照新增租赁合同）

var DV_KPI_STYLE = ''
	+ '.dv-kpi-stats-row{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;margin-bottom:16px;}'
	+ '@media (max-width:768px){.dv-kpi-stats-row{grid-template-columns:repeat(1,minmax(0,1fr));}}'
	+ '.lc-alert-card{display:flex;align-items:flex-start;gap:12px;padding:14px 30px 14px 16px;border-radius:12px;border:1px solid #e2e8f0;background:#fff;position:relative;overflow:hidden;min-width:0;}'
	+ '.lc-alert-card-main{flex:1;min-width:0;}'
	+ '.lc-alert-card-icon{flex-shrink:0;width:40px;height:40px;border-radius:10px;display:flex;align-items:center;justify-content:center;}'
	+ '.lc-alert-card-val{font-size:26px;font-weight:800;line-height:1.1;color:#0f172a;font-variant-numeric:tabular-nums;}'
	+ '.lc-alert-card-title{font-size:13px;font-weight:600;color:#334155;margin-top:2px;}'
	+ '.lc-alert-card-tip-anchor{position:absolute;top:8px;right:8px;z-index:2;line-height:0;}'
	+ '.lc-alert-card-tip{width:18px;height:18px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;color:#94a3b8;background:rgba(255,255,255,.92);border:1px solid #e2e8f0;cursor:help;line-height:0;}'
	+ '.lc-alert-card-tip:hover{color:#64748b;border-color:#cbd5e1;background:#fff;}'
	+ '.lc-alert-card--total{background:linear-gradient(135deg,#f8fafc 0%,#fff 100%);}'
	+ '.lc-alert-card--total .lc-alert-card-icon{background:#e2e8f0;color:#475569;}'
	+ '.lc-alert-card--progress{background:linear-gradient(135deg,#fff7ed 0%,#fff 55%);border-color:#fed7aa;}'
	+ '.lc-alert-card--progress .lc-alert-card-icon{background:#ffedd5;color:#ea580c;}'
	+ '.lc-alert-card--progress .lc-alert-card-val{color:#c2410c;}'
	+ '.lc-alert-card--completed{background:linear-gradient(135deg,#ecfdf5 0%,#fff 55%);border-color:#bbf7d0;}'
	+ '.lc-alert-card--completed .lc-alert-card-icon{background:#d1fae5;color:#059669;}'
	+ '.lc-alert-card--completed .lc-alert-card-val{color:#047857;}'
	+ '.lc-alert-card-clickable{cursor:pointer;transition:box-shadow .2s ease,border-color .2s ease,transform .2s ease;}'
	+ '.lc-alert-card-clickable:hover{box-shadow:0 4px 14px rgba(15,23,42,.08);}'
	+ '.lc-alert-card-active{box-shadow:0 0 0 2px rgba(22,93,255,.2)!important;border-color:#165dff!important;}'
	+ '.lc-multi-plate-pop{width:320px;padding:4px 2px;}'
	+ '.lc-multi-plate-pop-hint{font-size:12px;color:#64748b;margin-bottom:8px;line-height:1.5;}'
	+ '.lc-multi-plate-pop-actions{display:flex;justify-content:flex-end;gap:8px;margin-top:10px;}'
	+ '.lc-multi-plate-trigger{cursor:pointer;}'
	+ '.lc-multi-plate-trigger .ant-input{cursor:pointer;}';

var DV_KPI_ICONS = {
	total: React.createElement('svg', { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' },
		React.createElement('rect', { x: 3, y: 3, width: 7, height: 7 }), React.createElement('rect', { x: 14, y: 3, width: 7, height: 7 }),
		React.createElement('rect', { x: 14, y: 14, width: 7, height: 7 }), React.createElement('rect', { x: 3, y: 14, width: 7, height: 7 })),
	progress: React.createElement('svg', { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' },
		React.createElement('circle', { cx: 12, cy: 12, r: 10 }), React.createElement('polyline', { points: '12 6 12 12 16 14' })),
	completed: React.createElement('svg', { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' },
		React.createElement('path', { d: 'M22 11.08V12a10 10 0 1 1-5.93-9.14' }), React.createElement('polyline', { points: '22 4 12 14.01 9 11.01' }))
};

var DV_KPI_TIP_SVG = React.createElement('svg', { width: 12, height: 12, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2.2, strokeLinecap: 'round', strokeLinejoin: 'round' },
	React.createElement('circle', { cx: 12, cy: 12, r: 10 }), React.createElement('line', { x1: 12, y1: 16, x2: 12, y2: 12 }), React.createElement('line', { x1: 12, y1: 8, x2: 12.01, y2: 8 }));

function formatDeliveryRegion(region) {
	if (!region || region === '-') return '-';
	var r = String(region).trim();
	if (r.indexOf('-') === -1) {
		var m = r.match(/^(.+?(?:省|市|自治区|特别行政区))(.+)$/);
		if (m && m[2]) r = m[1] + '-' + m[2];
	}
	return r;
}

function parseDeliveryRegionParts(region) {
	if (!region || region === '-') return { province: '', city: '', raw: '' };
	var r = String(region).trim();
	var idx = r.indexOf('-');
	if (idx >= 0) {
		return { province: r.slice(0, idx).trim(), city: r.slice(idx + 1).trim(), raw: r };
	}
	if (r.indexOf('省') >= 0) return { province: r, city: '', raw: r };
	if (r.indexOf('市') >= 0) return { province: '', city: r, raw: r };
	return { province: r, city: '', raw: r };
}

function regionCityMatch(cityA, cityB) {
	if (!cityA || !cityB) return false;
	return cityA === cityB || cityA.indexOf(cityB) >= 0 || cityB.indexOf(cityA) >= 0;
}

/** 运维人员区域权限是否覆盖目标区域（省-市） */
function matchRegionPermission(permissions, targetRegion) {
	var target = parseDeliveryRegionParts(formatDeliveryRegion(targetRegion));
	if (!target.province && !target.city) return true;
	var perms = permissions || [];
	for (var i = 0; i < perms.length; i++) {
		var perm = String(perms[i] || '').trim();
		if (!perm) continue;
		if (perm.indexOf('-') >= 0) {
			var scoped = parseDeliveryRegionParts(perm);
			if (scoped.province && target.province && scoped.province !== target.province) continue;
			if (scoped.city) {
				if (regionCityMatch(target.city, scoped.city)) return true;
				continue;
			}
			if (scoped.province && scoped.province === target.province) return true;
			continue;
		}
		if (perm.indexOf('省') >= 0) {
			if (target.province === perm) return true;
			continue;
		}
		if (regionCityMatch(target.city, perm)) return true;
	}
	return false;
}

var DV_RESERVE_VEHICLE_STATUS_READY = '已备车';

function getOperatorRegionPermissions() {
	if (typeof window !== 'undefined' && window.DV_MOCK_OPERATOR_REGION_PERMISSIONS && window.DV_MOCK_OPERATOR_REGION_PERMISSIONS.length) {
		return window.DV_MOCK_OPERATOR_REGION_PERMISSIONS.slice();
	}
	return ['浙江省-嘉兴市'];
}

function filterRowsByOperatorRegion(rows) {
	var perms = getOperatorRegionPermissions();
	return (rows || []).filter(function (row) {
		return matchRegionPermission(perms, row.deliveryRegion);
	});
}

function filterSelectableReserveVehicles(vehicles, operatorPermissions) {
	var perms = operatorPermissions || getOperatorRegionPermissions();
	return (vehicles || []).filter(function (vehicle) {
		if ((vehicle.vehicleStatus || '') !== DV_RESERVE_VEHICLE_STATUS_READY) return false;
		return matchRegionPermission(perms, vehicle.parkingRegion);
	});
}

function isDeliverySignedStatus(status) {
	return status === '客户已签章' || status === '已签章';
}

function isDeliveryPendingCustomerSignStatus(status) {
	return status === '待客户签章';
}

/** 待客户签章 / 客户已签章 使用统一 Tag 样式 */
var DV_CUSTOMER_SIGN_STATUS_BG = '#2563eb';

function isCustomerSignRelatedStatus(status) {
	return isDeliveryPendingCustomerSignStatus(status) || isDeliverySignedStatus(status);
}

function getAuthorizedListFromRecord(record) {
	var list = record && record.authorizedList;
	if (!Array.isArray(list)) return [];
	return list.filter(function (a) {
		return a && ((a.name && String(a.name).trim()) || (a.phone && String(a.phone).trim()));
	});
}

function buildCustomerSignPendingPopoverContent(record) {
	var list = getAuthorizedListFromRecord(record);
	var boxStyle = { minWidth: 168, fontSize: 13, lineHeight: 1.65 };
	var labelStyle = { color: '#64748b' };
	var valStyle = { color: '#334155', fontWeight: 600 };
	if (!list.length) {
		return React.createElement('div', { style: boxStyle },
			React.createElement('div', null,
				React.createElement('span', { style: labelStyle }, '授权人姓名：'),
				React.createElement('span', { style: valStyle }, '-')
			),
			React.createElement('div', { style: { marginTop: 4 } },
				React.createElement('span', { style: labelStyle }, '授权人手机号：'),
				React.createElement('span', { style: valStyle }, '-')
			)
		);
	}
	var children = [];
	list.forEach(function (item, idx) {
		if (idx > 0) {
			children.push(React.createElement('div', { key: 'sep-' + idx, style: { borderTop: '1px solid #f1f5f9', margin: '8px 0' } }));
		}
		children.push(
			React.createElement('div', { key: 'name-' + idx },
				React.createElement('span', { style: labelStyle }, '授权人姓名：'),
				React.createElement('span', { style: valStyle }, (item.name && String(item.name).trim()) || '-')
			),
			React.createElement('div', { key: 'phone-' + idx, style: { marginTop: 4 } },
				React.createElement('span', { style: labelStyle }, '授权人手机号：'),
				React.createElement('span', { style: valStyle }, (item.phone && String(item.phone).trim()) || '-')
			)
		);
	});
	return React.createElement('div', { style: boxStyle }, children);
}

function buildDeliverySignFileName(record) {
	var plate = (record.plateNo && String(record.plateNo).trim()) ? String(record.plateNo).trim() : '车牌待选';
	var orderId = record.orderId != null ? String(record.orderId) : 'unknown';
	var vehicleKey = record.vehicleKey != null ? String(record.vehicleKey) : '';
	return '交车签章文件_' + orderId + (vehicleKey ? '_' + vehicleKey : '') + '_' + plate + '.pdf';
}

function buildDeliverySignFileContent(record) {
	var plate = (record.plateNo && String(record.plateNo).trim()) ? String(record.plateNo).trim() : '车牌待选';
	return [
		'交车签章文件（原型 Mock，联调后对接 E 签宝签章 PDF）',
		'',
		'合同编号：' + (record.contractCode || '-'),
		'项目名称：' + (record.projectName || '-'),
		'客户名称：' + (record.customerName || '-'),
		'车牌号：' + plate,
		'品牌型号：' + (record.brand || '-') + ' / ' + (record.model || '-'),
		'交车人：' + (record.deliveryPerson || '-'),
		'完成交车时间：' + (record.deliveryTime || '-'),
		'签章状态：客户已签章',
		'',
		'生成时间：' + new Date().toLocaleString('zh-CN', { hour12: false })
	].join('\n');
}

function escapeSignHtml(text) {
	return String(text == null ? '-' : text)
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;');
}

function buildDeliverySignPreviewHtml(record) {
	var filename = buildDeliverySignFileName(record);
	var plate = (record.plateNo && String(record.plateNo).trim()) ? String(record.plateNo).trim() : '车牌待选';
	var rows = [
		['文件名称', filename],
		['合同编号', record.contractCode || '-'],
		['项目名称', record.projectName || '-'],
		['客户名称', record.customerName || '-'],
		['车牌号', plate],
		['品牌型号', (record.brand || '-') + ' / ' + (record.model || '-')],
		['交车人', record.deliveryPerson || '-'],
		['完成交车时间', record.deliveryTime || '-'],
		['签章状态', '客户已签章'],
		['签章方', record.customerName || '-'],
		['预览时间', new Date().toLocaleString('zh-CN', { hour12: false })]
	];
	var bodyRows = rows.map(function (row) {
		return '<tr><th>' + escapeSignHtml(row[0]) + '</th><td>' + escapeSignHtml(row[1]) + '</td></tr>';
	}).join('');
	return '<!DOCTYPE html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'
		+ '<title>' + escapeSignHtml(filename) + '</title>'
		+ '<style>'
		+ 'body{margin:0;background:#f1f5f9;color:#0f172a;font-family:"PingFang SC","Microsoft YaHei",sans-serif;}'
		+ '.wrap{max-width:920px;margin:24px auto;padding:0 16px 32px;}'
		+ '.card{background:#fff;border:1px solid #e2e8f0;border-radius:12px;box-shadow:0 8px 24px rgba(15,23,42,.06);overflow:hidden;}'
		+ '.head{padding:20px 24px;border-bottom:1px solid #f1f5f9;background:linear-gradient(135deg,#ecfdf5 0%,#fff 55%);}'
		+ '.badge{display:inline-block;padding:4px 10px;border-radius:999px;background:#16a34a;color:#fff;font-size:12px;font-weight:600;}'
		+ 'h1{margin:10px 0 6px;font-size:22px;}'
		+ '.sub{color:#64748b;font-size:13px;}'
		+ '.body{padding:20px 24px 24px;}'
		+ 'table{width:100%;border-collapse:collapse;font-size:14px;}'
		+ 'th,td{padding:12px 14px;border-bottom:1px solid #f1f5f9;text-align:left;vertical-align:top;}'
		+ 'th{width:140px;color:#64748b;font-weight:600;background:#f8fafc;}'
		+ '.note{margin-top:16px;padding:12px 14px;border-radius:8px;background:#fff7ed;border:1px solid #fed7aa;color:#9a3412;font-size:12px;line-height:1.6;}'
		+ '</style></head><body><div class="wrap"><div class="card"><div class="head"><span class="badge">E签宝签章文件</span>'
		+ '<h1>' + escapeSignHtml(filename) + '</h1><div class="sub">数字化资产 ONEOS · 交车管理 · 签章文件预览（原型 Mock）</div></div>'
		+ '<div class="body"><table>' + bodyRows + '</table>'
		+ '<div class="note">本页为原型预览占位，联调后将展示 E 签宝返回的真实签章 PDF 或在线预览地址。</div>'
		+ '</div></div></div></body></html>';
}

function previewDeliverySignFile(record) {
	if (!record || !isDeliverySignedStatus(record.deliveryStatus || record.status)) return;
	if (typeof window === 'undefined') return;
	var html = buildDeliverySignPreviewHtml(record);
	var blob = new Blob([html], { type: 'text/html;charset=utf-8' });
	var url = URL.createObjectURL(blob);
	var opened = window.open(url, '_blank', 'noopener,noreferrer');
	if (!opened) {
		URL.revokeObjectURL(url);
		if (typeof message !== 'undefined' && message.warning) message.warning('请允许浏览器弹出窗口以预览签章文件');
		return;
	}
	if (typeof message !== 'undefined' && message.success) message.success('已在新页面打开签章文件预览');
	setTimeout(function () { URL.revokeObjectURL(url); }, 120000);
}

function downloadDeliverySignFile(record) {
	if (!record || !isDeliverySignedStatus(record.deliveryStatus || record.status)) return;
	var filename = buildDeliverySignFileName(record);
	var content = buildDeliverySignFileContent(record);
	var blob = new Blob([content], { type: 'application/octet-stream' });
	var url = URL.createObjectURL(blob);
	var a = document.createElement('a');
	a.href = url;
	a.download = filename;
	a.click();
	URL.revokeObjectURL(url);
	if (typeof message !== 'undefined' && message.success) message.success('已开始下载签章文件');
}

// 查看交车单：禁用输入框/选择器可读性增强（背景更淡、文字纯黑）
var DV_VIEW_READONLY_CTRL_CSS = ''
	+ '.dv-edit-drawer-view .ant-input[disabled],'
	+ '.dv-edit-drawer-view textarea.ant-input[disabled]{'
	+ 'color:#000!important;-webkit-text-fill-color:#000!important;'
	+ 'background-color:#fafafa!important;border-color:#e5e7eb!important;'
	+ 'cursor:default!important;opacity:1!important;'
	+ '}'
	+ '.dv-edit-drawer-view .ant-input-affix-wrapper-disabled,'
	+ '.dv-edit-drawer-view .ant-input-affix-wrapper[disabled]{'
	+ 'color:#000!important;background-color:#fafafa!important;'
	+ 'border-color:#e5e7eb!important;cursor:default!important;opacity:1!important;'
	+ '}'
	+ '.dv-edit-drawer-view .ant-input-affix-wrapper-disabled input[disabled],'
	+ '.dv-edit-drawer-view .ant-input-affix-wrapper[disabled] input[disabled]{'
	+ 'color:#000!important;-webkit-text-fill-color:#000!important;'
	+ 'background-color:transparent!important;cursor:default!important;'
	+ '}'
	+ '.dv-edit-drawer-view .ant-input-affix-wrapper-disabled .ant-input-suffix,'
	+ '.dv-edit-drawer-view .ant-input-affix-wrapper[disabled] .ant-input-suffix{'
	+ 'color:rgba(0,0,0,.65)!important;'
	+ '}'
	+ '.dv-edit-drawer-view .ant-select-disabled.ant-select .ant-select-selector{'
	+ 'color:#000!important;background-color:#fafafa!important;'
	+ 'border-color:#e5e7eb!important;cursor:default!important;opacity:1!important;'
	+ '}'
	+ '.dv-edit-drawer-view .ant-select-disabled .ant-select-selection-item,'
	+ '.dv-edit-drawer-view .ant-select-disabled .ant-select-selection-placeholder{'
	+ 'color:#000!important;'
	+ '}';

// 使用方式：window.DeliveryEditDrawer(props)

function DeliveryEditDrawer(props) {
	var useState = React.useState;
	var useMemo = React.useMemo;
	var useCallback = React.useCallback;
	var useRef = React.useRef;
	var useEffect = React.useEffect;

	var open = props.open;
	var record = props.record;
	var onClose = props.onClose;
	var onSave = props.onSave;
	var onSubmit = props.onSubmit;
	var readOnly = props.readOnly === true || props.mode === 'view';

	var antd = window.antd;
	var Drawer = antd.Drawer;
	var Button = antd.Button;
	var Input = antd.Input;
	var Select = antd.Select;
	var Switch = antd.Switch;
	var Modal = antd.Modal;
	var Table = antd.Table;
	var Tag = antd.Tag;
	var Popover = antd.Popover;
	var message = antd.message;

	function RequiredLabel(text) {
		return React.createElement('span', { style: { display: 'inline-flex', alignItems: 'center', gap: 4 } },
			React.createElement('span', { style: { color: '#ef4444', fontWeight: 600 } }, '*'),
			React.createElement('span', null, text)
		);
	}

	function isEmpty(v) {
		return v === null || v === undefined || String(v).trim() === '';
	}

	function filterOption(input, option) {
		var label = (option && (option.label || option.children)) || '';
		return String(label).toLowerCase().indexOf(String(input || '').toLowerCase()) >= 0;
	}

	function fileToDataUrl(file, cb) {
		try {
			var reader = new FileReader();
			reader.onload = function (e) { cb(null, (e && e.target && e.target.result) || ''); };
			reader.onerror = function () { cb(new Error('read error')); };
			reader.readAsDataURL(file);
		} catch (e) { cb(e); }
	}

	var reserveVehicles = useMemo(function () {
		return [
			{ plateNo: '浙F80088', vehicleStatus: DV_RESERVE_VEHICLE_STATUS_READY, parkingRegion: '浙江省-嘉兴市', parkingLot: '嘉兴港区氢能停车场', vehicleType: '厢式车', brand: '福田', model: 'BJ1180', vin: 'LJNAU1A2XK7654321', hasAd: false, adPhoto: [], bigWordPhoto: [], hasTailboard: false },
			{ plateNo: '浙F88601', vehicleStatus: DV_RESERVE_VEHICLE_STATUS_READY, parkingRegion: '浙江省-嘉兴市', parkingLot: '平湖指定停车场', vehicleType: '4.5吨冷链车', brand: '现代', model: '帕力安牌4.5吨冷链车', vin: 'LNBSCPKB8RR123888', hasAd: false, adPhoto: [], bigWordPhoto: [], hasTailboard: true },
			{ plateNo: '浙A10088', vehicleStatus: DV_RESERVE_VEHICLE_STATUS_READY, parkingRegion: '浙江省-杭州市', parkingLot: '未来科技城地下停车场', vehicleType: '城配货车', brand: '福田', model: 'BJ1190', vin: 'LJNAU1A2XK8888001', hasAd: true, adPhoto: [{ uid: 'ad-hz', name: '广告照片.jpg', url: 'https://dummyimage.com/600x400/e2e8f0/475569&text=Ad-HZ' }], bigWordPhoto: [], hasTailboard: false },
			{ plateNo: '粤AGP4598', vehicleStatus: DV_RESERVE_VEHICLE_STATUS_READY, parkingRegion: '广东省-广州市', parkingLot: '广州南沙物流园停车场', vehicleType: '4.5吨冷链车', brand: '现代', model: '帕力安牌4.5吨冷链车', vin: 'LNBSCPKB9RR223402', hasAd: false, adPhoto: [], bigWordPhoto: [], hasTailboard: false },
			{ plateNo: '川A99999', vehicleStatus: DV_RESERVE_VEHICLE_STATUS_READY, parkingRegion: '四川省-成都市', parkingLot: '成都龙泉驿停车场', vehicleType: '4.5吨冷链车', brand: '现代', model: '帕力安牌4.5吨冷链车', vin: 'LNBSCPKB9RR223999', hasAd: false, adPhoto: [], bigWordPhoto: [], hasTailboard: false },
			{ plateNo: '京A12345', vehicleStatus: '备车中', parkingRegion: '浙江省-嘉兴市', parkingLot: '嘉兴测试停车场', vehicleType: '牵引车', brand: '东风', model: 'DFH1180', vin: 'LJNAU1A2XK1234567', hasAd: true, adPhoto: [{ uid: 'ad1', name: '广告照片.jpg', url: 'https://dummyimage.com/600x400/e2e8f0/475569&text=Ad' }], bigWordPhoto: [{ uid: 'bw1', name: '放大字.jpg', url: 'https://dummyimage.com/600x400/e2e8f0/475569&text=BigWord' }], hasTailboard: true },
			{ plateNo: '沪A30003', vehicleStatus: DV_RESERVE_VEHICLE_STATUS_READY, parkingRegion: '上海市-上海市', parkingLot: '浦东停车场', vehicleType: '厢式车', brand: '重汽', model: 'HOWO-T5G', vin: 'LJNAU1A2XK9999000', hasAd: true, adPhoto: [{ uid: 'ad2', name: '广告2.jpg', url: 'https://dummyimage.com/600x400/e2e8f0/475569&text=Ad2' }], bigWordPhoto: [{ uid: 'bw2', name: '放大字2.jpg', url: 'https://dummyimage.com/600x400/e2e8f0/475569&text=BW2' }], hasTailboard: true }
		];
	}, []);

	var plateOptions = useMemo(function () {
		return filterSelectableReserveVehicles(reserveVehicles, getOperatorRegionPermissions()).map(function (v) {
			return {
				value: v.plateNo,
				label: v.plateNo + ' · ' + (v.parkingLot || formatDeliveryRegion(v.parkingRegion))
			};
		});
	}, [reserveVehicles]);

	var vehicleByPlate = useMemo(function () {
		var map = {};
		reserveVehicles.forEach(function (v) { map[v.plateNo] = v; });
		return map;
	}, [reserveVehicles]);

	function isPlatePendingInForm(plateNo) {
		if (plateNo == null || plateNo === undefined) return true;
		var s = String(plateNo).trim();
		return s === '' || s === '-';
	}

	function displayDisabledField(v) {
		var s = v == null || v === undefined ? '' : String(v).trim();
		return s || '-';
	}

	function displayFormVin(plateNo, vin) {
		if (isPlatePendingInForm(plateNo)) return '-';
		return displayDisabledField(vin);
	}

	function syncVehicleInfoFromReserveRecord(reserveRecord, deliveryRec, plate) {
		// 备车记录 → 交车单「车辆信息」同步（驾驶培训字段不参与同步，见 buildInitialForm / handlePlateChange）
		var hasPlate = plate && !isPlatePendingInForm(plate);
		return {
			vehicleType: (reserveRecord && reserveRecord.vehicleType) || (deliveryRec && deliveryRec.vehicleType) || '',
			brand: (reserveRecord && reserveRecord.brand) || (deliveryRec && deliveryRec.brand) || '',
			model: (reserveRecord && reserveRecord.model) || (deliveryRec && deliveryRec.model) || '',
			vin: hasPlate ? ((reserveRecord && reserveRecord.vin) || (deliveryRec && deliveryRec.vin) || '') : '',
			hasAd: !!(reserveRecord && reserveRecord.hasAd),
			adPhoto: (reserveRecord && reserveRecord.adPhoto) ? reserveRecord.adPhoto.slice() : [],
			bigWordPhoto: (reserveRecord && reserveRecord.bigWordPhoto) ? reserveRecord.bigWordPhoto.slice() : [],
			hasTailboard: reserveRecord ? !!reserveRecord.hasTailboard : false,
			spareTirePhoto: (reserveRecord && reserveRecord.spareTirePhoto) ? reserveRecord.spareTirePhoto.slice() : [],
			spareTireDepth: (reserveRecord && reserveRecord.spareTireDepth) || ''
		};
	}

	function buildInitialForm(rec) {
		var plate = (rec && rec.plateNo && String(rec.plateNo).trim()) || undefined;
		var reserveRecord = plate ? vehicleByPlate[plate] : null;
		if (!reserveRecord && rec && rec.brand && plate) {
			reserveRecord = { plateNo: plate, vehicleType: rec.vehicleType || '', brand: rec.brand || '', model: rec.model || '', vin: rec.vin || '', hasAd: false, adPhoto: [], bigWordPhoto: [], hasTailboard: false };
		}
		var synced = syncVehicleInfoFromReserveRecord(reserveRecord, rec, plate);
		return Object.assign({
			plateNo: plate,
			trainingRecognized: false,
			driverLicenses: [],
			driverFrontPhoto: [],
			mileageKm: rec && rec.deliveryMileage != null ? String(rec.deliveryMileage) : '',
			batteryPct: rec && rec.deliveryElec != null ? String(rec.deliveryElec) : '',
			hydrogenAmount: rec && rec.deliveryH2 != null ? String(rec.deliveryH2) : '',
			hydrogenUnit: (rec && rec.deliveryH2Unit === 'MPa') ? 'MPa' : '%',
			serviceFee: ''
		}, synced);
	}

	var formState = useState(buildInitialForm(null));
	var form = formState[0];
	var setForm = formState[1];
	var activeSectionState = useState('basic');
	var activeSection = activeSectionState[0];
	var setActiveSection = activeSectionState[1];
	var submittingState = useState(false);
	var submitting = submittingState[0];
	var setSubmitting = submittingState[1];
	var previewState = useState({ open: false, url: '', title: '', gallery: [], index: 0 });
	var ocrModalState = useState({ open: false, photoUrl: '', depth: '6.50' });
	var trainingInputRef = useRef(null);

	useEffect(function () {
		if (open && record) {
			var initial = buildInitialForm(record);
			var nextPhotos = createEmptyPhotos();
			if (readOnly && record.deliveryStatus && record.deliveryStatus !== '未开始' && record.deliveryStatus !== '已保存') {
				initial = Object.assign({}, initial, buildDriverInfoFromPickupCode(), buildViewFormPhotoExtras());
				nextPhotos = buildViewDeliveryPhotos();
			}
			setForm(initial);
			setActiveSection('basic');
			setSubmitting(false);
			setPhotos(nextPhotos);
			setInspectionList(buildInspectionList());
		}
	}, [open, record && record.id, readOnly]);

	function updateForm(patch) {
		setForm(function (p) { return Object.assign({}, p, patch); });
	}

	function handlePlateChange(v) {
		if (!v) {
			updateForm({
				plateNo: undefined,
				vehicleType: '',
				brand: '',
				model: '',
				vin: '',
				hasAd: false,
				adPhoto: [],
				bigWordPhoto: [],
				hasTailboard: false,
				spareTirePhoto: [],
				spareTireDepth: '',
				trainingRecognized: false,
				driverLicenses: [],
				driverFrontPhoto: []
			});
			return;
		}
		var reserveRecord = vehicleByPlate[v];
		updateForm(Object.assign({
			plateNo: v,
			trainingRecognized: false,
			driverLicenses: [],
			driverFrontPhoto: []
		}, syncVehicleInfoFromReserveRecord(reserveRecord, null, v)));
	}

	function makeThumb(url, onPreview, onRemove) {
		return React.createElement('div', { style: { width: 72, height: 72, borderRadius: 8, border: '1px solid #e2e8f0', overflow: 'hidden', position: 'relative', background: '#f8fafc' } },
			React.createElement('img', { src: url, style: { width: '100%', height: '100%', objectFit: 'cover', cursor: 'pointer' }, onClick: onPreview }),
			onRemove ? React.createElement('button', {
				type: 'button',
				'aria-label': '删除图片',
				style: { position: 'absolute', right: 4, top: 4, width: 22, height: 22, borderRadius: 999, border: 'none', background: 'rgba(15,23,42,.65)', color: '#fff', cursor: 'pointer', fontSize: 12, lineHeight: '22px', padding: 0 },
				onClick: function (e) { e.stopPropagation(); onRemove(); }
			}, '×') : null
		);
	}

	function mockViewPhoto(uid, name) {
		return [{ uid: uid, name: name + '.jpg', url: 'https://dummyimage.com/640x360/e2e8f0/475569&text=' + encodeURIComponent(name) }];
	}

	function mockDeliveryPhotoItem(uid, seed, slotLabel) {
		return {
			uid: uid,
			name: slotLabel + '.jpg',
			url: 'https://picsum.photos/seed/dv-' + seed + '/960/540'
		};
	}

	function mockDeliveryPhotoSlot(uid, seed, slotLabel) {
		return [mockDeliveryPhotoItem(uid, seed, slotLabel)];
	}

	function mockDeliveryPhotoList(items) {
		return items.map(function (it) {
			return mockDeliveryPhotoItem(it.uid, it.seed, it.label);
		});
	}

	function buildDeliveryPhotoGallery(photoData) {
		var list = [];
		var slotGroups = [
			{ key: 'vehicle', label: '车辆' },
			{ key: 'chassis', label: '底盘' },
			{ key: 'tire', label: '轮胎' }
		];
		slotGroups.forEach(function (group) {
			var groupMap = (photoData && photoData[group.key]) || {};
			Object.keys(groupMap).forEach(function (slotLabel) {
				(groupMap[slotLabel] || []).forEach(function (file) {
					list.push({
						uid: file.uid,
						url: file.url,
						name: file.name,
						title: group.label + ' · ' + slotLabel
					});
				});
			});
		});
		['defect', 'other'].forEach(function (groupKey) {
			var groupLabel = groupKey === 'defect' ? '瑕疵' : '其他';
			((photoData && photoData[groupKey]) || []).forEach(function (file, idx) {
				var files = (photoData && photoData[groupKey]) || [];
				list.push({
					uid: file.uid,
					url: file.url,
					name: file.name,
					title: files.length > 1 ? groupLabel + ' · ' + (file.name || (groupLabel + (idx + 1))) : groupLabel + ' · ' + (file.name || groupLabel)
				});
			});
		});
		return list;
	}

	function closePhotoPreview() {
		previewState[1]({ open: false, url: '', title: '', gallery: [], index: 0 });
	}

	function openPhotoPreview(options) {
		var gallery = (options && options.gallery) || [];
		var index = 0;
		if (gallery.length && options && options.uid) {
			for (var i = 0; i < gallery.length; i++) {
				if (gallery[i].uid === options.uid) {
					index = i;
					break;
				}
			}
		}
		var current = gallery.length ? gallery[index] : { url: options.url, title: options.title };
		previewState[1]({
			open: true,
			url: current.url,
			title: current.title || (options && options.title) || '预览',
			gallery: gallery,
			index: index
		});
	}

	function shiftPhotoPreview(step) {
		previewState[1](function (prev) {
			var gallery = prev.gallery || [];
			if (gallery.length <= 1) return prev;
			var nextIndex = prev.index + step;
			if (nextIndex < 0) nextIndex = gallery.length - 1;
			if (nextIndex >= gallery.length) nextIndex = 0;
			var item = gallery[nextIndex];
			return Object.assign({}, prev, {
				index: nextIndex,
				url: item.url,
				title: item.title
			});
		});
	}

	function buildViewFormPhotoExtras() {
		return {
			spareTirePhoto: mockViewPhoto('sp1', '备胎照片'),
			spareTireDepth: '6.50'
		};
	}

	function buildViewDeliveryPhotos() {
		return {
			vehicle: {
				'仪表盘': mockDeliveryPhotoSlot('v1', 'vehicle-dash', '仪表盘'),
				'车辆正前': mockDeliveryPhotoSlot('v2', 'vehicle-front', '车辆正前'),
				'车辆左前方': mockDeliveryPhotoSlot('v3', 'vehicle-left-front', '车辆左前方'),
				'车辆左后方': mockDeliveryPhotoSlot('v4', 'vehicle-left-rear', '车辆左后方'),
				'车辆右前方': mockDeliveryPhotoSlot('v5', 'vehicle-right-front', '车辆右前方'),
				'车辆右后方': mockDeliveryPhotoSlot('v6', 'vehicle-right-rear', '车辆右后方')
			},
			chassis: {
				'正前方位底部': mockDeliveryPhotoSlot('c1', 'chassis-front', '正前方位底部'),
				'左侧前方底部': mockDeliveryPhotoSlot('c2', 'chassis-left-front', '左侧前方底部'),
				'左侧后方底部': mockDeliveryPhotoSlot('c3', 'chassis-left-rear', '左侧后方底部'),
				'正后方位底部': mockDeliveryPhotoSlot('c4', 'chassis-rear', '正后方位底部'),
				'右侧前方底部': mockDeliveryPhotoSlot('c5', 'chassis-right-front', '右侧前方底部'),
				'右侧后方底部': mockDeliveryPhotoSlot('c6', 'chassis-right-rear', '右侧后方底部')
			},
			tire: {
				'左前': mockDeliveryPhotoSlot('t1', 'tire-left-front', '左前'),
				'右前': mockDeliveryPhotoSlot('t2', 'tire-right-front', '右前'),
				'左后内': mockDeliveryPhotoSlot('t3', 'tire-left-rear-in', '左后内'),
				'左后外': mockDeliveryPhotoSlot('t4', 'tire-left-rear-out', '左后外'),
				'右后内': mockDeliveryPhotoSlot('t5', 'tire-right-rear-in', '右后内'),
				'右后外': mockDeliveryPhotoSlot('t6', 'tire-right-rear-out', '右后外')
			},
			defect: mockDeliveryPhotoList([
				{ uid: 'd1', seed: 'defect-scratch', label: '瑕疵-刮擦' },
				{ uid: 'd2', seed: 'defect-dent', label: '瑕疵-凹陷' },
				{ uid: 'd3', seed: 'defect-paint', label: '瑕疵-漆面' }
			]),
			other: mockDeliveryPhotoList([
				{ uid: 'o1', seed: 'other-tools', label: '其他-随车工具' },
				{ uid: 'o2', seed: 'other-cargo', label: '其他-车厢物品' }
			])
		};
	}

	function ReadonlyPhotoBox(boxProps) {
		var label = boxProps.label;
		var value = boxProps.value || [];
		var gallery = boxProps.gallery;
		return React.createElement('div', null,
			label ? React.createElement('div', { style: { fontSize: 13, color: '#475569', marginBottom: 8, fontWeight: 500 } }, label) : null,
			value.length > 0
				? React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' } },
					value.map(function (f) {
						return React.createElement('div', { key: f.uid },
							makeThumb(f.url, function () {
								openPhotoPreview({
									gallery: gallery && gallery.length ? gallery : null,
									uid: f.uid,
									url: f.url,
									title: (gallery && gallery.length)
										? ((gallery.filter(function (g) { return g.uid === f.uid; })[0] || {}).title || f.name || label || '预览')
										: (f.name || label || '预览')
								});
							})
						);
					})
				)
				: React.createElement('span', { style: { fontSize: 13, color: '#94a3b8' } }, '-')
		);
	}

	function UploadBox(uploadProps) {
		var label = uploadProps.label;
		var value = uploadProps.value || [];
		var unlimited = !!uploadProps.unlimited;
		var max = unlimited ? Infinity : (uploadProps.max || 1);
		var onChange = uploadProps.onChange;
		var disabled = !!uploadProps.disabled;
		function handlePick(e) {
			if (disabled) return;
			var f = e && e.target && e.target.files && e.target.files[0];
			if (!f) return;
			fileToDataUrl(f, function (err, url) {
				if (err) { message.error('上传失败'); return; }
				var next = value.slice();
				next.push({ uid: String(Date.now()), name: f.name || 'image', url: url });
				if (!unlimited && next.length > max) next = next.slice(next.length - max);
				onChange && onChange(next);
			});
			e.target.value = '';
		}
		return React.createElement('div', null,
			label ? React.createElement('div', { style: { fontSize: 13, color: '#475569', marginBottom: 8, fontWeight: 500 } }, label) : null,
			React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' } },
				value.map(function (f) {
					return React.createElement('div', { key: f.uid },
						makeThumb(f.url, function () { previewState[1]({ open: true, url: f.url, title: f.name }); }, disabled ? null : function () { onChange && onChange(value.filter(function (x) { return x.uid !== f.uid; })); })
					);
				}),
				(!disabled && (unlimited || value.length < max)) ? React.createElement('label', { style: { width: 72, height: 72, borderRadius: 8, border: '1px dashed #cbd5e1', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#64748b', cursor: 'pointer', fontSize: 20, lineHeight: 1, background: '#fff', transition: 'border-color .2s' } },
					React.createElement('input', { type: 'file', accept: 'image/*', style: { display: 'none' }, onChange: handlePick }),
					React.createElement('span', { style: { fontSize: 22, lineHeight: 1, marginBottom: 2 } }, '+'),
					React.createElement('span', { style: { fontSize: 12 } }, '上传')
				) : null
			),
			uploadProps.tip ? React.createElement('div', { style: { marginTop: 6, fontSize: 12, color: '#94a3b8', lineHeight: 1.5 } }, uploadProps.tip) : null
		);
	}

	var EDIT_PHOTO_UPLOAD_HINT = '照片上传说明：jpg、jpeg、png、gif、webp 格式，单张不超过 5MB，支持预览与删除（适用于本页所有照片上传项）';

	function createEmptyPhotos() {
		return {
			vehicle: {
				'仪表盘': [],
				'车辆正前': [],
				'车辆左前方': [],
				'车辆左后方': [],
				'车辆右前方': [],
				'车辆右后方': []
			},
			chassis: {
				'正前方位底部': [],
				'左侧前方底部': [],
				'左侧后方底部': [],
				'正后方位底部': [],
				'右侧前方底部': [],
				'右侧后方底部': []
			},
			tire: {
				'左前': [],
				'右前': [],
				'左后内': [],
				'左后外': [],
				'右后内': [],
				'右后外': []
			},
			defect: [],
			other: []
		};
	}

	function updatePhotoSlot(groupKey, slotKey, list) {
		setPhotos(function (p) {
			var n = Object.assign({}, p);
			if (slotKey) {
				n[groupKey] = Object.assign({}, p[groupKey] || {});
				n[groupKey][slotKey] = list;
			} else {
				n[groupKey] = list;
			}
			return n;
		});
	}

	function PhotoModuleTitle(title, required) {
		return React.createElement('div', {
			style: {
				display: 'flex',
				alignItems: 'center',
				gap: 8,
				marginBottom: 10,
				fontSize: 14,
				fontWeight: 700,
				color: '#0f172a'
			}
		},
			React.createElement('span', { style: { width: 3, height: 14, borderRadius: 2, background: '#2563eb', flexShrink: 0 } }),
			(required && !readOnly) ? RequiredLabel(title) : title
		);
	}

	function PhotoGridColumn(title, items, required, previewGallery) {
		return React.createElement('div', { style: { marginBottom: 20, minWidth: 0 } },
			PhotoModuleTitle(title, required),
			React.createElement('div', { style: { border: '1px solid #e2e8f0', borderRadius: 10, padding: 12, background: '#fafbfc' } },
				React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 12 } },
					items.map(function (it) {
						return React.createElement('div', { key: it.key },
							readOnly
								? ReadonlyPhotoBox({ label: it.label, value: it.value, gallery: previewGallery })
								: UploadBox({
									label: required ? RequiredLabel(it.label) : it.label,
									value: it.value,
									max: 1,
									disabled: readOnly,
									onChange: it.onChange
								})
						);
					})
				)
			)
		);
	}

	function PhotoGridSimple(title, value, onChange, previewGallery) {
		return React.createElement('div', { style: { marginBottom: 20, minWidth: 0 } },
			PhotoModuleTitle(title, false),
			React.createElement('div', { style: { border: '1px solid #e2e8f0', borderRadius: 10, padding: 12, background: '#fafbfc' } },
				readOnly
					? ReadonlyPhotoBox({ value: value, gallery: previewGallery })
					: UploadBox({ value: value, unlimited: true, disabled: readOnly, onChange: onChange })
			)
		);
	}

	function buildPhotoGridItems(groupKey) {
		var group = photos[groupKey] || {};
		return Object.keys(group).map(function (k) {
			return {
				key: groupKey + '-' + k,
				label: k,
				value: group[k] || [],
				onChange: function (l) { updatePhotoSlot(groupKey, k, l); }
			};
		});
	}

	function FormItem(itemProps) {
		return React.createElement('div', { style: { marginBottom: 16, minWidth: 0 } },
			React.createElement('div', { style: { fontSize: 13, color: '#475569', marginBottom: 6, fontWeight: 500 } },
				itemProps.required ? RequiredLabel(itemProps.label) : itemProps.label
			),
			itemProps.children
		);
	}

	var inspectionCategoryItems = {
		'车灯': ['大灯', '转向灯', '小灯', '示廓灯', '刹车灯', '倒车灯', '牌照灯', '防雾灯', '室内灯'],
		'仪表盘': ['氢系统指示', '电控系统指示', '数值清晰准确', '故障报警灯'],
		'驾驶室': ['点烟器', '车窗升降', '按键开关', '雨刮器', '内后视镜是否正常', '内/外门把手', '安全带', '空调冷暖风', '仪表盘', '门锁功能', '手刹', '车钥匙功能是否正常', '喇叭', '音响功能', '遮阳板', '主副驾座椅', '方向盘', '内饰干净整洁'],
		'轮胎': ['前左胎', '前右胎', '后左胎', '后右胎', '备胎'],
		'液位检查': ['冷却液', '制动液', '玻璃水'],
		'外观检查': ['车身外观', '漆面', '玻璃'],
		'车辆外观': ['整车外观'],
		'其他': ['其他检查项'],
		'随车工具': ['三角牌', '灭火器', '反光背心'],
		'随车证件': ['行驶证', '营运证', '保险单'],
		'整车': ['整车状态'],
		'燃料电池系统': ['氢系统', '储氢瓶'],
		'冷机': ['冷机运行'],
		'制动系统': ['制动踏板', '驻车制动']
	};

	function buildInspectionList() {
		var list = [];
		var categories = Object.keys(inspectionCategoryItems);
		for (var ci = 0; ci < categories.length; ci++) {
			var cat = categories[ci];
			var items = inspectionCategoryItems[cat] || [];
			for (var ji = 0; ji < items.length; ji++) {
				var it = items[ji];
				var isTire = cat === '轮胎';
				list.push({
					key: 'ins-' + ci + '-' + ji,
					category: cat,
					item: it,
					checked: true,
					treadDepth: isTire ? '6.5' : '',
					remark: ''
				});
			}
		}
		return list;
	}

	var inspectionListState = useState(buildInspectionList);
	var inspectionList = inspectionListState[0];
	var setInspectionList = inspectionListState[1];
	var inspectionListRef = useRef(null);
	inspectionListRef.current = inspectionList;

	function updateInspectionRow(key, patch) {
		setInspectionList(function (prev) {
			return (prev || []).map(function (r) {
				if (r.key !== key) return r;
				return Object.assign({}, r, patch);
			});
		});
	}

	var inspectionColumns = useMemo(function () {
		return [
			{
				title: '类别',
				dataIndex: 'category',
				key: 'category',
				width: 120,
				render: function (text, record, index) {
					var rows = inspectionListRef.current || [];
					var cat = record && record.category;
					if (!cat) return { children: text, props: { rowSpan: 1 } };
					var isFirst = true;
					for (var i = index - 1; i >= 0; i--) {
						if (!rows[i] || rows[i].category !== cat) break;
						isFirst = false;
						break;
					}
					if (!isFirst) return { children: null, props: { rowSpan: 0 } };
					var span = 1;
					for (var j = index + 1; j < rows.length; j++) {
						if (!rows[j] || rows[j].category !== cat) break;
						span++;
					}
					return { children: text, props: { rowSpan: span } };
				}
			},
			{ title: '检查项目', dataIndex: 'item', key: 'item', width: 180 },
			{
				title: '检查情况',
				dataIndex: 'checked',
				key: 'checked',
				width: 160,
				render: function (_, insRecord) {
					var isTire = insRecord && insRecord.category === '轮胎';
					return isTire
						? React.createElement(Input, {
							value: insRecord.treadDepth,
							placeholder: '请输入胎纹深度',
							addonAfter: 'mm',
							disabled: readOnly,
							onChange: function (e) { updateInspectionRow(insRecord.key, { treadDepth: e.target.value }); }
						})
						: React.createElement(Switch, {
							checked: !!insRecord.checked,
							disabled: readOnly,
							onChange: function (v) { updateInspectionRow(insRecord.key, { checked: !!v }); }
						});
				}
			},
			{
				title: '备注',
				dataIndex: 'remark',
				key: 'remark',
				render: function (_, insRecord) {
					return React.createElement(Input, {
						value: insRecord.remark,
						placeholder: '请输入',
						disabled: readOnly,
						onChange: function (e) { updateInspectionRow(insRecord.key, { remark: e.target.value }); }
					});
				}
			}
		];
	}, [readOnly]);

	var photoState = useState(createEmptyPhotos);
	var photos = photoState[0];
	var setPhotos = photoState[1];

	var showSignFileSection = readOnly && record && isDeliverySignedStatus(record.deliveryStatus || record.status);
	var signFileName = showSignFileSection ? buildDeliverySignFileName(record) : '';

	var sectionNav = [
		{ key: 'basic', label: '交车车辆' },
		{ key: 'equip', label: '车辆信息' },
		{ key: 'metrics', label: '交车数据' },
		{ key: 'inspection', label: '交车检查单' },
		{ key: 'photos', label: '交车照片' }
	];
	if (showSignFileSection) {
		sectionNav.push({ key: 'esign', label: 'E签宝签章' });
	}

	var SECTION_SCROLL_MARGIN = 12;

	function scrollToSection(key) {
		setActiveSection(key);
		var el = document.getElementById('dv-edit-section-' + key);
		if (el && el.scrollIntoView) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
	}

	function SectionCard(cardProps) {
		return React.createElement('div', {
			id: cardProps.id,
			style: {
				scrollMarginTop: SECTION_SCROLL_MARGIN,
				marginBottom: 16,
				background: '#fff',
				borderRadius: 12,
				border: '1px solid #e2e8f0',
				boxShadow: '0 1px 2px rgba(15,23,42,.04)',
				overflow: 'hidden'
			}
		},
			React.createElement('div', {
				style: {
					padding: '14px 16px',
					borderBottom: '1px solid #f1f5f9',
					fontSize: 14,
					fontWeight: 700,
					color: '#0f172a',
					display: 'flex',
					alignItems: 'center',
					gap: 8
				}
			},
				React.createElement('span', { style: { width: 3, height: 14, borderRadius: 2, background: '#2563eb', flexShrink: 0 } }),
				cardProps.title
			),
			React.createElement('div', { style: { padding: '16px 16px 8px' } }, cardProps.children)
		);
	}

	function validateSubmit() {
		if (isEmpty(form.plateNo)) return '请选择车牌号';
		if (form.hasAd) {
			if (!form.adPhoto.length) return '请上传广告照片';
			if (!form.bigWordPhoto.length) return '请上传放大字照片';
		}
		if (!form.trainingRecognized) return '请上传司机提车码并完成识别';
		if (isEmpty(form.mileageKm)) return '请填写交车里程';
		if (isEmpty(form.batteryPct)) return '请填写交车电量';
		if (isEmpty(form.hydrogenAmount)) return '请填写交车氢量';
		var requiredPhotoGroups = [
			{ key: 'vehicle', label: '车辆' },
			{ key: 'chassis', label: '底盘' },
			{ key: 'tire', label: '轮胎' }
		];
		for (var pi = 0; pi < requiredPhotoGroups.length; pi++) {
			var pg = requiredPhotoGroups[pi];
			var groupMap = photos && photos[pg.key];
			var keys = groupMap ? Object.keys(groupMap) : [];
			for (var ki = 0; ki < keys.length; ki++) {
				var pk = keys[ki];
				if (!(groupMap[pk] && groupMap[pk].length)) return '请上传' + pg.label + '照片：' + pk;
			}
		}
		return '';
	}

	function buildPatchFromForm() {
		return {
			plateNo: form.plateNo || '',
			vehicleType: form.vehicleType,
			brand: form.brand,
			model: form.model,
			vin: form.vin,
			deliveryMileage: form.mileageKm === '' ? null : Number(form.mileageKm),
			deliveryElec: form.batteryPct === '' ? null : Number(form.batteryPct),
			deliveryH2: form.hydrogenAmount === '' ? null : Number(form.hydrogenAmount),
			deliveryH2Unit: form.hydrogenUnit,
			deliveryStatus: '已保存'
		};
	}

	function handleSaveClick() {
		onSave && onSave(buildPatchFromForm());
		message.success('已保存');
	}

	function handleSubmitClick() {
		var err = validateSubmit();
		if (err) { message.error(err); return; }
		Modal.confirm({
			title: '确认交车',
			content: '请确认信息填写无误，点击确认完成该车辆交车。',
			okText: '确认',
			cancelText: '取消',
			onOk: function () {
				setSubmitting(true);
				setTimeout(function () {
					setSubmitting(false);
					onSubmit && onSubmit(buildPatchFromForm());
					message.success('交车成功');
					onClose && onClose();
				}, 400);
			}
		});
	}

	function isInvalidPickupCodeFile(file) {
		var name = ((file && file.name) || '').toLowerCase();
		return name.indexOf('invalid') >= 0 || name.indexOf('无效') >= 0;
	}

	function buildDriverInfoFromPickupCode() {
		return {
			trainingRecognized: true,
			driverFrontPhoto: [{ uid: 'front', name: '司机正面照', url: 'https://dummyimage.com/600x400/e2e8f0/475569&text=Driver-Front' }],
			driverLicenses: [
				{ uid: 'id1', name: '身份证（正面）', url: 'https://dummyimage.com/600x400/e2e8f0/475569&text=ID-F' },
				{ uid: 'id2', name: '身份证（反面）', url: 'https://dummyimage.com/600x400/e2e8f0/475569&text=ID-B' },
				{ uid: 'dl', name: '驾驶证', url: 'https://dummyimage.com/600x400/e2e8f0/475569&text=DL' },
				{ uid: 'qc', name: '从业资格证', url: 'https://dummyimage.com/600x400/e2e8f0/475569&text=QC' }
			]
		};
	}

	function handleTrainingPick(e) {
		var f = e && e.target && e.target.files && e.target.files[0];
		if (!f) return;
		var pickedFile = f;
		setTimeout(function () {
			if (isInvalidPickupCodeFile(pickedFile)) {
				updateForm({ trainingRecognized: false, driverFrontPhoto: [], driverLicenses: [] });
				message.error('提车码无效，请重新选择');
				return;
			}
			updateForm(buildDriverInfoFromPickupCode());
			message.success('提车码识别成功，已加载司机证照');
		}, 500);
		e.target.value = '';
	}

	function openPickupCodePicker() {
		trainingInputRef.current && trainingInputRef.current.click();
	}

	if (!open) return null;

	var drawerTitle = readOnly ? '查看交车单' : '编辑交车单';

	var summaryLabelWidth = 80;
	function renderSummaryField(labelText, valueText) {
		return React.createElement('div', { style: { display: 'flex', alignItems: 'flex-start', gap: 6, minWidth: 0 } },
			React.createElement('span', { style: { color: '#94a3b8', flexShrink: 0, width: summaryLabelWidth, textAlign: 'left' } }, labelText),
			React.createElement('span', { style: { color: '#334155', flex: 1, minWidth: 0, textAlign: 'left', wordBreak: 'break-all', lineHeight: 1.5 } }, valueText)
		);
	}

	var summaryCard = record ? React.createElement('div', { style: { marginBottom: 16, padding: '12px 14px', borderRadius: 10, background: 'linear-gradient(135deg,#f8fafc 0%,#fff 100%)', border: '1px solid #e2e8f0', fontSize: 13 } },
		React.createElement('div', { style: { display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center', marginBottom: 10, paddingBottom: 10, borderBottom: '1px solid #f1f5f9' } },
			React.createElement(Tag, { style: { margin: 0, border: 'none', background: '#eff6ff', color: '#2563eb', fontWeight: 600 } }, record.customerName || '-'),
			React.createElement('span', { style: { color: '#475569' } }, record.contractCode || '-'),
			(function () {
				var status = record.deliveryStatus || '未开始';
				var signed = isDeliverySignedStatus(status);
				var pendingSign = isDeliveryPendingCustomerSignStatus(status);
				var signRelated = isCustomerSignRelatedStatus(status);
				var tag = React.createElement(Tag, {
					style: {
						margin: 0,
						border: 'none',
						background: signRelated ? DV_CUSTOMER_SIGN_STATUS_BG : '#f1f5f9',
						color: signRelated ? '#fff' : '#475569',
						fontWeight: signRelated ? 600 : 400
					},
					title: signed ? '点击下载签章文件' : undefined,
					role: signed ? 'button' : undefined,
					tabIndex: signed ? 0 : undefined,
					onClick: signed ? function (e) { e.stopPropagation(); downloadDeliverySignFile(record); } : undefined,
					onKeyDown: signed ? function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); downloadDeliverySignFile(record); } } : undefined
				}, status);
				if (pendingSign) {
					return React.createElement(Popover, {
						content: buildCustomerSignPendingPopoverContent(record),
						trigger: 'hover',
						placement: 'topLeft',
						mouseEnterDelay: 0.15,
						mouseLeaveDelay: 0.1,
						destroyTooltipOnHide: true
					}, tag);
				}
				return tag;
			})()
		),
		React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: '8px 16px' } },
			renderSummaryField('项目：', record.projectName || '-'),
			renderSummaryField('交车地点：', formatDeliveryRegion(record.deliveryRegion)),
			renderSummaryField('品牌型号：', (record.brand || '-') + ' / ' + (record.model || '-')),
			renderSummaryField('任务来源：', record.taskSource || '-')
		)
	) : null;

	var sectionNavEl = React.createElement('nav', {
		'aria-label': '交车单分节导航',
		style: {
			width: 108,
			flexShrink: 0,
			position: 'sticky',
			top: 0,
			alignSelf: 'flex-start',
			paddingTop: 4,
			zIndex: 2
		}
	},
		React.createElement('div', { style: { fontSize: 12, color: '#94a3b8', fontWeight: 600, marginBottom: 8, paddingLeft: 12, letterSpacing: '.02em' } }, '目录'),
		sectionNav.map(function (s) {
			var active = activeSection === s.key;
			return React.createElement('button', {
				key: s.key,
				type: 'button',
				onClick: function () { scrollToSection(s.key); },
				style: {
					display: 'block',
					width: '100%',
					textAlign: 'left',
					border: 'none',
					cursor: 'pointer',
					padding: '9px 12px',
					borderRadius: 8,
					fontSize: 13,
					lineHeight: 1.4,
					fontWeight: active ? 600 : 500,
					background: active ? '#eff6ff' : 'transparent',
					color: active ? '#2563eb' : '#64748b',
					borderLeft: active ? '3px solid #2563eb' : '3px solid transparent',
					marginBottom: 2,
					transition: 'background .2s,color .2s'
				}
			}, s.label);
		})
	);

	var sectionBasic = React.createElement(SectionCard, { id: 'dv-edit-section-basic', title: '交车车辆' },
		React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: '0 16px' } },
			React.createElement(FormItem, { label: '车牌号', required: !readOnly },
				React.createElement(Select, { value: form.plateNo, options: plateOptions, showSearch: true, filterOption: filterOption, placeholder: '请选择已备车车辆（按区域权限过滤）', allowClear: !readOnly, disabled: readOnly, style: { width: '100%' }, onChange: handlePlateChange })
			),
			React.createElement(FormItem, { label: '车辆类型' }, React.createElement(Input, { value: displayDisabledField(form.vehicleType), disabled: true })),
			React.createElement(FormItem, { label: '品牌' }, React.createElement(Input, { value: displayDisabledField(form.brand), disabled: true })),
			React.createElement(FormItem, { label: '型号' }, React.createElement(Input, { value: displayDisabledField(form.model), disabled: true })),
			React.createElement(FormItem, { label: '车辆识别代码' }, React.createElement(Input, { value: displayFormVin(form.plateNo, form.vin), disabled: true }))
		)
	);

	var sectionEquip = React.createElement(SectionCard, { id: 'dv-edit-section-equip', title: '车辆信息' },
		!readOnly ? React.createElement('div', { style: { marginBottom: 12, fontSize: 12, color: '#94a3b8', lineHeight: 1.6 } }, EDIT_PHOTO_UPLOAD_HINT) : null,
		React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px', marginBottom: form.hasAd ? 8 : 0 } },
			React.createElement(FormItem, { label: '车身广告及放大字', required: !readOnly },
				React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 10 } },
					React.createElement(Switch, { checked: !!form.hasAd, disabled: readOnly, onChange: function (v) { updateForm({ hasAd: !!v }); } }),
					React.createElement('span', { style: { fontSize: 13, color: '#64748b' } }, form.hasAd ? '有车身广告' : '无车身广告')
				)
			),
			React.createElement(FormItem, { label: '尾板', required: !readOnly },
				React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 10 } },
					React.createElement(Switch, { checked: !!form.hasTailboard, disabled: readOnly, onChange: function (v) { updateForm({ hasTailboard: !!v }); } }),
					React.createElement('span', { style: { fontSize: 13, color: '#64748b' } }, form.hasTailboard ? '有尾板' : '无尾板')
				)
			)
		),
		form.hasAd ? React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 8 } },
			readOnly
				? React.createElement(React.Fragment, null,
					React.createElement(ReadonlyPhotoBox, { label: '广告照片', value: form.adPhoto }),
					React.createElement(ReadonlyPhotoBox, { label: '放大字照片', value: form.bigWordPhoto })
				)
				: React.createElement(React.Fragment, null,
					React.createElement(UploadBox, { label: RequiredLabel('广告照片'), value: form.adPhoto, max: 1, disabled: readOnly, onChange: function (l) { updateForm({ adPhoto: l }); } }),
					React.createElement(UploadBox, { label: RequiredLabel('放大字照片'), value: form.bigWordPhoto, max: 1, disabled: readOnly, onChange: function (l) { updateForm({ bigWordPhoto: l }); } })
				)
		) : null,
		React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 } },
			readOnly
				? React.createElement(ReadonlyPhotoBox, { label: '备胎照片', value: form.spareTirePhoto })
				: React.createElement(UploadBox, { label: '备胎照片', value: form.spareTirePhoto, max: 1, disabled: readOnly, onChange: function (l) { updateForm({ spareTirePhoto: l }); if (!readOnly && l && l.length) ocrModalState[1]({ open: true, photoUrl: l[0].url, depth: '6.50' }); } }),
			React.createElement(FormItem, { label: '备胎胎纹深度' },
				React.createElement(Input, { value: form.spareTireDepth, placeholder: readOnly ? undefined : '请输入', addonAfter: 'mm', disabled: readOnly, onChange: function (e) { updateForm({ spareTireDepth: e.target.value }); } })
			)
		),
		React.createElement(FormItem, { label: '驾驶培训', required: !readOnly },
			form.trainingRecognized
				? React.createElement('div', null,
					readOnly
						? React.createElement('span', { style: { color: '#16a34a', fontWeight: 600, fontSize: 13 } }, '已完成视频培训')
						: React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' } },
							React.createElement('span', { style: { color: '#16a34a', fontWeight: 600, fontSize: 13 } }, '已完成视频培训'),
							React.createElement(Button, { type: 'link', size: 'small', style: { padding: 0, height: 'auto' }, onClick: openPickupCodePicker }, '重新选择提车码')
						),
					!readOnly ? React.createElement('div', { style: { marginTop: 8, fontSize: 12, color: '#64748b', lineHeight: 1.5 } }, '已根据提车码内绑定的司机信息，自动加载司机证照等照片') : null,
					form.driverFrontPhoto && form.driverFrontPhoto.length ? React.createElement('div', { style: { marginTop: 12 } },
						React.createElement('div', { style: { fontSize: 13, color: '#475569', marginBottom: 8, fontWeight: 500 } }, '司机正面照'),
						makeThumb(form.driverFrontPhoto[0].url, function () { previewState[1]({ open: true, url: form.driverFrontPhoto[0].url, title: '司机正面照' }); })
					) : null
				)
				: (readOnly
					? React.createElement('span', { style: { fontSize: 13, color: '#94a3b8' } }, '-')
					: React.createElement(React.Fragment, null,
						React.createElement('input', { type: 'file', ref: trainingInputRef, accept: 'image/*', style: { display: 'none' }, onChange: handleTrainingPick }),
						React.createElement(Button, { onClick: openPickupCodePicker }, '上传司机提车码'),
						React.createElement('div', { style: { marginTop: 8, fontSize: 12, color: '#94a3b8', lineHeight: 1.5 } }, '上传后将自动识别提车码内绑定的司机信息，并展示司机证照等照片')
					))
		),
		form.driverLicenses && form.driverLicenses.length ? React.createElement(FormItem, { label: '司机证照' },
			React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(4,minmax(0,1fr))', gap: 12 } },
				form.driverLicenses.map(function (f) {
					return React.createElement('div', { key: f.uid },
						makeThumb(f.url, function () { previewState[1]({ open: true, url: f.url, title: f.name }); }),
						React.createElement('div', { style: { marginTop: 4, fontSize: 12, color: '#64748b', textAlign: 'center' } }, f.name)
					);
				})
			)
		) : null
	);

	var sectionInspection = React.createElement(SectionCard, { id: 'dv-edit-section-inspection', title: '交车检查单' },
		React.createElement(Table, {
			rowKey: 'key',
			size: 'small',
			pagination: false,
			bordered: true,
			dataSource: inspectionList,
			columns: inspectionColumns,
			scroll: { x: 640 }
		})
	);

	var sectionMetrics = React.createElement(SectionCard, { id: 'dv-edit-section-metrics', title: '交车数据' },
		React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: '0 16px' } },
			React.createElement(FormItem, { label: '交车里程', required: !readOnly },
				React.createElement(Input, { value: form.mileageKm, placeholder: '请输入', addonAfter: 'km', disabled: readOnly, onChange: function (e) { updateForm({ mileageKm: e.target.value }); } })
			),
			React.createElement(FormItem, { label: '交车电量', required: !readOnly },
				React.createElement(Input, { value: form.batteryPct, placeholder: '请输入', addonAfter: '%', disabled: readOnly, onChange: function (e) { updateForm({ batteryPct: e.target.value }); } })
			),
			React.createElement(FormItem, { label: '交车氢量', required: !readOnly },
				React.createElement(Input, { value: form.hydrogenAmount, placeholder: '请输入', addonAfter: form.hydrogenUnit, disabled: readOnly, onChange: function (e) { updateForm({ hydrogenAmount: e.target.value }); } })
			),
			React.createElement(FormItem, { label: '送车服务费' },
				React.createElement(Input, { value: form.serviceFee, placeholder: '选填', addonAfter: '元', disabled: readOnly, onChange: function (e) { updateForm({ serviceFee: e.target.value }); } })
			)
		)
	);

	var deliveryPhotoGallery = readOnly ? buildDeliveryPhotoGallery(photos) : [];

	var sectionPhotos = React.createElement(SectionCard, { id: 'dv-edit-section-photos', title: '交车照片' },
		!readOnly ? React.createElement('div', { style: { marginBottom: 12, fontSize: 12, color: '#94a3b8', lineHeight: 1.6 } }, EDIT_PHOTO_UPLOAD_HINT) : null,
		PhotoGridColumn('车辆', buildPhotoGridItems('vehicle'), !readOnly, deliveryPhotoGallery),
		PhotoGridColumn('底盘', buildPhotoGridItems('chassis'), !readOnly, deliveryPhotoGallery),
		PhotoGridColumn('轮胎', buildPhotoGridItems('tire'), !readOnly, deliveryPhotoGallery),
		PhotoGridSimple('瑕疵', photos.defect || [], function (l) { updatePhotoSlot('defect', null, l); }, deliveryPhotoGallery),
		PhotoGridSimple('其他', photos.other || [], function (l) { updatePhotoSlot('other', null, l); }, deliveryPhotoGallery)
	);

	var sectionEsign = showSignFileSection ? React.createElement(SectionCard, { id: 'dv-edit-section-esign', title: 'E签宝签章文件' },
		React.createElement('div', {
			style: {
				display: 'flex',
				alignItems: 'flex-start',
				gap: 14,
				padding: '12px 14px',
				borderRadius: 10,
				border: '1px solid #e2e8f0',
				background: 'linear-gradient(135deg,#f8fafc 0%,#fff 100%)'
			}
		},
			React.createElement('div', {
				style: {
					width: 44,
					height: 44,
					borderRadius: 10,
					background: '#fee2e2',
					color: '#dc2626',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					fontSize: 12,
					fontWeight: 700,
					flexShrink: 0
				}
			}, 'PDF'),
			React.createElement('div', { style: { flex: 1, minWidth: 0 } },
				React.createElement('div', { style: { fontSize: 14, fontWeight: 600, color: '#0f172a', wordBreak: 'break-all' } }, signFileName),
				React.createElement('div', { style: { marginTop: 6, fontSize: 12, color: '#64748b', lineHeight: 1.6 } },
					React.createElement('div', null, '签章时间：', record.deliveryTime || '-'),
					React.createElement('div', null, '签章方：', record.customerName || '-')
				)
			),
			React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0 } },
				React.createElement(Button, { size: 'small', onClick: function () { previewDeliverySignFile(record); } }, '预览'),
				React.createElement(Button, { type: 'primary', size: 'small', onClick: function () { downloadDeliverySignFile(record); } }, '下载')
			)
		)
	) : null;

	return React.createElement(React.Fragment, null,
		readOnly ? React.createElement('style', null, DV_VIEW_READONLY_CTRL_CSS) : null,
		React.createElement(Drawer, {
			open: open,
			onClose: onClose,
			width: Math.min(960, typeof window !== 'undefined' ? window.innerWidth - 24 : 960),
			title: drawerTitle,
			destroyOnClose: true,
			styles: {
				body: { padding: '16px 20px 88px', background: '#f8fafc' },
				footer: { borderTop: '1px solid #e2e8f0', padding: '12px 20px' }
			},
			footer: readOnly
				? React.createElement('div', { style: { display: 'flex', justifyContent: 'flex-end' } },
					React.createElement(Button, { onClick: onClose }, '关闭')
				)
				: React.createElement('div', { style: { display: 'flex', justifyContent: 'flex-end', gap: 10 } },
					React.createElement(Button, { onClick: onClose, disabled: submitting }, '取消'),
					React.createElement(Button, { onClick: handleSaveClick, disabled: submitting }, '保存'),
					React.createElement(Button, { type: 'primary', loading: submitting, onClick: handleSubmitClick }, '提交')
				)
		},
			React.createElement('div', { className: readOnly ? 'dv-edit-drawer-view' : undefined },
			summaryCard,
			React.createElement('div', { style: { display: 'flex', gap: 16, alignItems: 'flex-start' } },
				sectionNavEl,
				React.createElement('div', { style: { flex: 1, minWidth: 0 } },
					sectionBasic,
					sectionEquip,
					sectionMetrics,
					sectionInspection,
					sectionPhotos,
					sectionEsign
				)
			)
			)
		),
		React.createElement(Modal, {
			open: !!previewState[0].open,
			title: previewState[0].title || '预览',
			footer: null,
			onCancel: closePhotoPreview,
			width: 920,
			styles: { body: { padding: '12px 20px 20px' } }
		},
			previewState[0].url ? React.createElement('div', null,
				React.createElement('div', { style: { textAlign: 'center', background: '#0f172a', borderRadius: 10, padding: 12 } },
					React.createElement('img', {
						src: previewState[0].url,
						alt: previewState[0].title,
						style: { width: '100%', maxHeight: '72vh', objectFit: 'contain' }
					})
				),
				previewState[0].gallery && previewState[0].gallery.length > 1 ? React.createElement('div', {
					style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginTop: 16 }
				},
					React.createElement(Button, { onClick: function () { shiftPhotoPreview(-1); } }, '上一张'),
					React.createElement('span', { style: { fontSize: 13, color: '#64748b', fontVariantNumeric: 'tabular-nums' } },
						String(previewState[0].index + 1) + ' / ' + previewState[0].gallery.length
					),
					React.createElement(Button, { type: 'primary', onClick: function () { shiftPhotoPreview(1); } }, '下一张')
				) : null
			) : null
		),
		React.createElement(Modal, {
			open: !!ocrModalState[0].open,
			title: '备胎识别',
			onCancel: function () { ocrModalState[1](Object.assign({}, ocrModalState[0], { open: false })); },
			onOk: function () { updateForm({ spareTireDepth: ocrModalState[0].depth }); ocrModalState[1](Object.assign({}, ocrModalState[0], { open: false })); message.success('已反写胎纹深度'); },
			okText: '确认',
			cancelText: '取消'
		},
			React.createElement(Input, { value: ocrModalState[0].depth, addonAfter: 'mm', onChange: function (e) { ocrModalState[1](Object.assign({}, ocrModalState[0], { depth: e.target.value })); } })
		)
	);
}

if (typeof window !== 'undefined') {
	window.DeliveryEditDrawer = DeliveryEditDrawer;
}


var DV_REQ_SCROLL_STYLE = { fontSize: 13, color: '#334155', lineHeight: 1.75, maxHeight: '68vh', overflowY: 'auto', paddingRight: 4 };
var DV_REQ_TH_STYLE = { border: '1px solid #e2e8f0', padding: '8px 10px', textAlign: 'left', background: '#f8fafc', fontWeight: 600 };
var DV_REQ_TD_STYLE = { border: '1px solid #e2e8f0', padding: '8px 10px', verticalAlign: 'top' };

function dvReqTitle(text) {
	return React.createElement('p', { style: { margin: '0 0 8px', fontWeight: 700, color: '#0f172a', fontSize: 14 } }, text);
}

function dvReqSubtitle(text) {
	return React.createElement('p', { style: { margin: '14px 0 6px', fontWeight: 600, color: '#334155' } }, text);
}

function dvReqHint(text) {
	return React.createElement('p', { style: { margin: '4px 0 8px', color: '#64748b', fontSize: 12 } }, text);
}

function dvReqStrong(label, text) {
	return React.createElement(React.Fragment, null, React.createElement('strong', null, label), text);
}

function dvReqUl(items) {
	return React.createElement('ul', { style: { paddingLeft: 20, margin: '6px 0 14px' } },
		items.map(function (item, idx) {
			return React.createElement('li', { key: idx, style: { marginBottom: 4 } }, item);
		})
	);
}

function dvReqOl(items) {
	return React.createElement('ol', { style: { paddingLeft: 20, margin: '6px 0 14px' } },
		items.map(function (item, idx) {
			return React.createElement('li', { key: idx, style: { marginBottom: 4 } }, item);
		})
	);
}

function dvReqTable(headers, rows) {
	return React.createElement('table', { style: { width: '100%', borderCollapse: 'collapse', fontSize: 12, margin: '8px 0 14px' } },
		React.createElement('thead', null,
			React.createElement('tr', null,
				headers.map(function (h, i) {
					return React.createElement('th', { key: i, style: DV_REQ_TH_STYLE }, h);
				})
			)
		),
		React.createElement('tbody', null,
			rows.map(function (row, ri) {
				return React.createElement('tr', { key: ri },
					row.map(function (cell, ci) {
						return React.createElement('td', { key: ci, style: DV_REQ_TD_STYLE }, cell);
					})
				);
			})
		)
	);
}

function renderDeliveryRequirementPrdTab(Alert) {
	return React.createElement('div', { style: DV_REQ_SCROLL_STYLE },
		React.createElement(Alert, {
			type: 'info',
			showIcon: true,
			style: { marginBottom: 14, borderRadius: 10 },
			message: '模块定位',
			description: '交车管理面向运维人员，按「单车一行」跟进交车任务进度。运维在列表抽屉内完成交车单录入与提交；客户被授权人通过 E 签宝完成签章后，交车流程完结。本文从产品经理视角描述业务规则与页面行为，不涉及表结构、接口字段及实现细节。'
		}),

		dvReqTitle('一、业务对象说明'),
		dvReqUl([
			dvReqStrong('交车任务：', '一次交车业务单元，通常对应一份车辆租赁合同或替换车场景，可包含多台车。'),
			dvReqStrong('交车单（单车）：', '交车任务下某一台车的交车记录，列表以「一车一行」展示。'),
			dvReqStrong('运维交车：', '运维人员现场验车、拍照、录入里程/电量/氢量等，保存或提交交车单。'),
			dvReqStrong('客户签章：', '运维提交后，客户侧被授权人在 E 签宝完成电子签章，状态由「待客户签章」变为「客户已签章」。'),
			dvReqStrong('被授权人：', '取自关联租赁合同的被授权人信息；本模块只读展示姓名与手机号，供运维跟进签章。')
		]),

		dvReqTitle('二、页面结构'),
		dvReqUl([
			'面包屑：运维管理 / 车辆业务 / 交车管理',
			'右上角「查看需求说明」：打开本说明文档',
			'页面自上而下：筛选区 → KPI 统计卡片 → 列表区（含导出）'
		]),

		dvReqTitle('三、数据统计（KPI 卡片）'),
		dvReqHint('三张可点击卡片替代原 Tab，统计范围均为「当前筛选条件命中后的全部车辆行」，不受分页影响。'),
		dvReqTable(
			['卡片', '统计口径', '默认'],
			[
				['全部交车任务', '进行中 + 已完成', '—'],
				['进行中的交车任务', '交车状态为「未开始」「已保存」「待客户签章」', React.createElement('strong', null, '默认选中')],
				['已完成的交车任务', '交车状态为「客户已签章」', '—']
			]
		),
		dvReqUl([
			'卡片右上角问号：悬停展示指标说明',
			'点击卡片切换列表数据，选中卡片高亮'
		]),

		dvReqTitle('四、筛选区'),
		dvReqSubtitle('4.1 通用规则'),
		dvReqUl([
			'默认展示首行 4 项；点击「展开」显示全部 16 项，「收起」恢复默认',
			'多条件之间为「且」关系；修改筛选项后须点击「搜索」才生效',
			'「重置」清空全部筛选并恢复默认'
		]),
		dvReqSubtitle('4.2 车辆批量筛选（第一项）'),
		dvReqHint('交互体验与「保险采购 · 比价单选车」一致。'),
		dvReqOl([
			'点击输入框弹出批量录入面板，支持车牌号、车辆识别代码（VIN）',
			'每行一条；可从 Excel 等批量复制粘贴；同一行内亦可用逗号、顿号、分号分隔',
			'面板内「确定」仅保存录入内容；须再点筛选区「搜索」后列表才刷新',
			'面板内「清空」或触发器一键清除：立即清除该条件并刷新列表',
			'已生效时触发器展示「已选 N 辆车」',
			dvReqStrong('匹配规则：', '命中任一输入值即展示（OR）；车牌/VIN 均支持精确或包含匹配')
		]),
		dvReqSubtitle('4.3 其余筛选项'),
		dvReqUl([
			'合同编号、项目名称、客户名称：可搜索下拉',
			'交车区域：省-市二级联动',
			'完成交车时间：日期段，精确至天',
			'交车人、车辆识别代码、车辆类型、品牌、型号',
			'业务部门、业务负责人、任务来源、业务类型、是否延期',
			dvReqStrong('说明：', '「车辆」批量筛选与「车辆识别代码」单项筛选可同时使用，结果为且关系')
		]),

		dvReqTitle('五、列表（一车一行）'),
		dvReqSubtitle('5.1 数据粒度'),
		dvReqUl([
			'一个交车任务含多车时，按车辆拆分为独立行展示',
			'列表数据范围受运维人员区域权限约束（详见第十二节）'
		]),
		dvReqSubtitle('5.2 列说明'),
		dvReqTable(
			['列', '展示与交互'],
			[
				['车辆信息', '三行：车牌号、品牌-型号、VIN；车牌未选时橙色「车牌待选」，VIN 显示 -；点击车牌号打开查看抽屉'],
				['合同信息', '客户名称 + 业务类型 Tag、合同编号（可跳转）、项目名称（可跳转）'],
				['业务负责人', '业务部门、业务负责人（两行）'],
				['任务来源', '实心 Tag；来源为「替换车」时悬停展示 旧车 → 新车'],
				['交车地点', '第一行交车区域（省-市），第二行停车场（车牌待选时显示 -）'],
				['交车状态', '详见第六节'],
				['完成交车时间', '单行展示'],
				['交车人', '单行展示'],
				['是否归还', '未交车显示 -；已交车未还车显示「未归还」；已还车显示「已归还」且悬停展示还车时间、还车人'],
				['交车记录', '交车里程(km)、交车氢量(%或MPa)、交车电量(%) 三行合并'],
				['创建时间 / 创建人', '交车任务维度字段'],
				['操作', '「查看」始终可用；「编辑」仅「未开始」「已保存」时展示']
			]
		),
		dvReqSubtitle('5.3 其他规则'),
		dvReqUl([
			'合同信息列宽支持拖拽调整',
			'分页：默认 10 条/页，可选 10 / 20 / 50'
		]),

		dvReqTitle('六、交车状态与客户签章'),
		dvReqSubtitle('6.1 状态定义'),
		dvReqTable(
			['状态', '含义', 'KPI 归属'],
			[
				['未开始', '交车单尚未保存有效数据', '进行中'],
				['已保存', '运维已保存但未正式提交', '进行中'],
				['待客户签章', '运维已提交，等待客户被授权人 E 签宝签章', '进行中'],
				['客户已签章', '客户被授权人已完成签章，流程完结', '已完成']
			]
		),
		dvReqSubtitle('6.2 Tag 视觉与交互规则'),
		dvReqUl([
			dvReqStrong('统一视觉：', '「待客户签章」与「客户已签章」使用相同 Tag 样式（蓝色实心），不做颜色或下划线区分'),
			dvReqStrong('待客户签章：', '悬停 Popover 展示租赁合同被授权人姓名、手机号；多人逐条展示；无数据显示 -'),
			dvReqStrong('客户已签章：', '点击 Tag 下载 E 签宝签章文件；文件名建议含交车单标识、车辆序号、车牌号'),
			'抽屉摘要卡中的状态 Tag 遵循与列表相同的视觉与交互规则'
		]),
		dvReqSubtitle('6.3 被授权人数据来源'),
		dvReqUl([
			'取自交车任务关联的车辆租赁合同「被授权人信息」',
			'交车管理侧只读展示，不在本模块维护被授权人',
			'已提交/已签章交车单以提交当时合同快照为准（具体以业务归档规则为准）'
		]),

		dvReqTitle('七、交车状态流转'),
		React.createElement('div', { style: { padding: '10px 14px', background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0', margin: '8px 0 14px', fontSize: 13, fontWeight: 600, color: '#334155' } },
			'未开始 → 已保存（保存）→ 待客户签章（提交）→ 客户已签章（客户 E 签宝完成）'
		),
		dvReqUl([
			'仅「未开始」「已保存」可编辑；任意状态均可查看'
		]),

		dvReqTitle('八、编辑交车单（抽屉）'),
		dvReqSubtitle('8.1 入口与布局'),
		dvReqUl([
			'入口：列表操作列「编辑」（仅未开始/已保存）',
			'顶部摘要卡：客户名称、合同编号、交车状态、项目、交车地点、品牌型号、任务来源',
			'左侧目录锚点：交车车辆 · 车辆信息 · 交车数据 · 交车检查单 · 交车照片',
			'底部操作：取消、保存、提交'
		]),
		dvReqSubtitle('8.2 交车车辆'),
		dvReqUl([
			'车牌号（必填）：可搜索选择停车场内「已备车」车辆（详见第十二节）',
			'车牌待选时 VIN 显示 -；车辆类型/品牌/型号/VIN 只读，随车牌联动'
		]),
		dvReqSubtitle('8.3 车辆信息'),
		dvReqHint('备车数据同步 — 打开抽屉或选择车牌后自动同步，页面不单独提示。'),
		dvReqUl([
			'同步：车身广告及照片、尾板、备胎照片/胎纹深度、车辆基础信息',
			'不同步：驾驶培训相关（提车码、司机证照等），须在交车环节单独上传识别',
			'车身广告开关与备车「后装设备-车身广告」双向同步',
			'车身广告及放大字（开关必填；开启后各 1 张照片必填）',
			'尾板（开关必填）；备胎照片/胎纹深度（选填，支持 OCR）',
			'驾驶培训（必填）：上传提车码 → 识别成功后加载司机证照；失败提示重新选择'
		]),
		dvReqSubtitle('8.4 交车数据'),
		dvReqUl([
			'交车里程（必填，km）、交车电量（必填，%）、交车氢量（必填，% 或 MPa）',
			'送车服务费（选填，元）',
			dvReqStrong('里程自动取值：', '优先车机当前里程 → 其次最近一次异动/调拨/还车结束里程 → 均不可用则手工录入')
		]),
		dvReqSubtitle('8.5 交车检查单'),
		dvReqUl([
			'列：类别（同类合并）、检查项目、检查情况、备注',
			'覆盖车灯、仪表盘、驾驶室、轮胎、液位、外观、随车工具/证件、燃料电池、冷机、制动等'
		]),
		dvReqSubtitle('8.6 交车照片'),
		dvReqUl([
			'分模块：车辆、底盘、轮胎、瑕疵、其他',
			'车辆/底盘/轮胎各 6 个必传点位；瑕疵、其他不限张数',
			'单张：jpg/jpeg/png/gif/webp，不超过 5MB；支持预览、删除'
		]),
		dvReqSubtitle('8.7 保存与提交校验'),
		dvReqTable(
			['业务动作', '须满足的条件'],
			[
				[React.createElement('strong', null, '保存'), React.createElement('ul', { style: { margin: 0, paddingLeft: 18 } },
					React.createElement('li', null, '通过当前已填字段校验'),
					React.createElement('li', null, '状态变为「已保存」，抽屉不关闭')
				)],
				[React.createElement('strong', null, '提交'), React.createElement('ul', { style: { margin: 0, paddingLeft: 18 } },
					React.createElement('li', null, '车牌已选择'),
					React.createElement('li', null, '车身广告（若开启）及放大字照片已上传'),
					React.createElement('li', null, '提车码识别成功，驾驶培训证照齐全'),
					React.createElement('li', null, '交车里程、电量、氢量已填写'),
					React.createElement('li', null, '车辆/底盘/轮胎全部必传照片点已上传'),
					React.createElement('li', null, '二次确认后状态变为「待客户签章」，写入完成交车时间/交车人，关闭抽屉')
				)]
			]
		),

		dvReqTitle('九、查看交车单（抽屉）'),
		dvReqUl([
			'入口：列表点击车牌号，或操作列「查看」',
			'布局与编辑页一致；全部只读，底部仅「关闭」',
			'「客户已签章」时额外展示「E签宝签章文件」卡片：文件名、签章时间、签章方；支持预览与下载',
			'已提交交车单展示完整交车照片；驾驶培训区展示状态与证照图片'
		]),

		dvReqTitle('十、导出'),
		dvReqUl([
			'范围：当前 KPI 卡片选中项 + 全部筛选条件（含车辆批量筛选）下的全部命中行，不受分页限制',
			'导出列与业务导出样表一致；交车里程、氢量、电量为独立三列（非列表合并列）',
			'列表区展示当前 KPI 名称及导出范围说明'
		]),

		dvReqTitle('十一、指标单位约定'),
		dvReqUl([
			'交车里程：km',
			'交车电量：%',
			'交车氢量：% 或 MPa（按车辆/合同配置）',
			'列表「交车记录」合并展示；导出仍为三列'
		]),

		dvReqTitle('十二、区域权限与车牌选择'),
		dvReqSubtitle('12.1 交车任务可见范围'),
		dvReqUl([
			'以交车单「交车区域」（省-市）为任务所属区域',
			'运维人员须具备该区域或其上级区域权限，方可查看并执行',
			'示例：交车区域「浙江省-嘉兴市」→ 具备「浙江省」或「嘉兴市」权限可见；仅「杭州市」权限不可见',
			'无权限时整条交车任务（含其下所有车辆行）均不可见'
		]),
		dvReqSubtitle('12.2 停车场车牌可选范围'),
		dvReqUl([
			'下拉仅展示车辆状态为「已备车」的车辆',
			'在「已备车」前提下，停车场区域须落在当前运维权限覆盖范围内',
			'省级权限：可选该省各停车场内已备车车辆；市级权限：仅可选该市',
			'下拉建议展示：车牌号 + 停车场名称'
		]),

		dvReqTitle('十三、关联模块与数据依赖'),
		dvReqTable(
			['关联模块', '提供的数据 / 能力'],
			[
				['车辆租赁合同', '合同编号、客户、项目、交车区域/地点、被授权人信息'],
				['备车管理', '已备车车辆、车身广告、备胎等同步数据'],
				['提车码 / 司机培训', '驾驶培训识别与证照数据'],
				['E 签宝', '客户签章状态与签章文件'],
				['合同管理', '列表点击合同编号/项目名称跳转详情'],
				['替换车', '任务来源为「替换车」时展示旧车 → 新车对照']
			]
		)
	);
}

function renderDeliveryRequirementManualTab(Alert, Table) {
	return React.createElement('div', { style: Object.assign({}, DV_REQ_SCROLL_STYLE, { maxHeight: '62vh' }) },
		React.createElement(Alert, {
			type: 'success',
			showIcon: true,
			style: { marginBottom: 14, borderRadius: 10 },
			message: '交车全流程（简版）',
			description: '选车 → 录入交车数据 → 拍照 → 保存/提交 → 跟进客户签章。运维侧以「提交」为节点，客户签章在 E 签宝侧完成。'
		}),
		React.createElement(Table, {
			size: 'small',
			pagination: false,
			bordered: true,
			style: { marginBottom: 14 },
			columns: [
				{ title: '步骤', dataIndex: 'step', width: 56 },
				{ title: '操作', dataIndex: 'action' },
				{ title: '要点', dataIndex: 'tip', width: 220 }
			],
			dataSource: [
				{ key: '1', step: '①', action: '筛选定位车辆', tip: 'KPI 卡片切换进行中/已完成；车辆批量筛选粘贴车牌' },
				{ key: '2', step: '②', action: '编辑交车单', tip: '仅「未开始/已保存」可编辑；选择已备车车牌' },
				{ key: '3', step: '③', action: '填写车辆信息', tip: '广告/尾板/备胎；上传提车码完成驾驶培训' },
				{ key: '4', step: '④', action: '录入交车数据', tip: '里程/电量/氢量必填；里程可自动带入后修改' },
				{ key: '5', step: '⑤', action: '完成检查单与拍照', tip: '检查单逐项确认；车辆/底盘/轮胎 18 点位必传' },
				{ key: '6', step: '⑥', action: '保存或提交', tip: '保存→已保存；提交→待客户签章' },
				{ key: '7', step: '⑦', action: '跟进客户签章', tip: '悬停「待客户签章」查看被授权人联系方式' },
				{ key: '8', step: '⑧', action: '签章完成', tip: '状态变「客户已签章」；点击 Tag 下载签章文件' }
			]
		}),
		dvReqTitle('提交前自查'),
		dvReqUl([
			'车牌已从「已备车」列表中选择',
			'提车码识别成功，司机证照已加载',
			'交车里程、电量、氢量均已填写',
			'车辆 / 底盘 / 轮胎全部必传照片点已上传',
			'车身广告若开启，广告图与放大字图均已上传'
		]),
		dvReqTitle('常见情况'),
		dvReqUl([
			'车牌待选：VIN 不展示，交车地点停车场行显示 -',
			'待客户签章：运维不可再编辑，可悬停查看被授权人手机号跟进',
			'客户已签章：归入 KPI「已完成」，可下载签章 PDF',
			'替换车任务：任务来源列悬停可查看旧车 → 新车对照',
			'导出：与当前 KPI + 筛选条件一致，不受分页限制'
		])
	);
}

function createDeliveryRequirementModalItems(antd) {
	var Alert = antd.Alert;
	var Table = antd.Table;
	return [
		{
			key: 'prd',
			label: '需求说明',
			children: renderDeliveryRequirementPrdTab(Alert)
		},
		{
			key: 'manual',
			label: '操作手册',
			children: renderDeliveryRequirementManualTab(Alert, Table)
		}
	];
}

const Component = function () {
	var useState = React.useState;
	var useCallback = React.useCallback;
	var useMemo = React.useMemo;
	var useEffect = React.useEffect;

	var antd = window.antd;
	var Breadcrumb = antd.Breadcrumb;
	var Card = antd.Card;
	var DatePicker = antd.DatePicker;
	var Select = antd.Select;
	var Button = antd.Button;
	var Table = antd.Table;
	var Cascader = antd.Cascader;
	var Tag = antd.Tag;
	var Tooltip = antd.Tooltip;
	var Popover = antd.Popover;
	var Modal = antd.Modal;
	var Tabs = antd.Tabs;
	var message = antd.message;
	var Input = antd.Input;

	var RangePicker = DatePicker.RangePicker;

	function parseMultiPlates(text) {
		var raw = (text || '').trim();
		if (!raw) return [];
		var lines = raw.split(/\r?\n/).map(function (line) { return line.trim(); }).filter(Boolean);
		var expanded = [];
		lines.forEach(function (line) {
			if (/[,，、;；]/.test(line)) {
				line.split(/[,，、;；]+/).forEach(function (s) {
					var t = s.trim();
					if (t) expanded.push(t);
				});
			} else {
				expanded.push(line);
			}
		});
		var seen = {};
		var out = [];
		expanded.forEach(function (s) {
			var key = s.toUpperCase();
			if (!seen[key]) {
				seen[key] = true;
				out.push(key);
			}
		});
		return out;
	}

	function rowMatchesVehicleFilter(row, vehicleText) {
		var tokens = parseMultiPlates(vehicleText);
		if (!tokens.length) return true;
		var plateRaw = (row.plateNo || '').trim();
		var plate = (!plateRaw || plateRaw === '-') ? '' : plateRaw.toUpperCase();
		var vin = (row.vin || '').trim().toUpperCase();
		for (var i = 0; i < tokens.length; i++) {
			var token = tokens[i];
			if (plate && (plate === token || plate.indexOf(token) !== -1)) return true;
			if (vin && (vin === token || vin.indexOf(token) !== -1)) return true;
		}
		return false;
	}

	function createEmptyFilters() {
		return {
		contractCode: undefined,
		projectName: undefined,
		customerName: undefined,
		deliveryRegion: undefined,
		dateStart: '',
		dateEnd: '',
			deliveryPerson: undefined,
			plateNos: '',
			vin: undefined,
			vehicleType: undefined,
			brand: undefined,
			model: undefined,
			businessDept: undefined,
			businessOwner: undefined,
			taskSource: undefined,
			bizType: undefined,
			isDelayed: undefined
		};
	}

	function patchFilters(prev, patch) {
		var next = {};
		var k;
		for (k in prev) next[k] = prev[k];
		for (k in patch) next[k] = patch[k];
		return next;
	}

	var filterState = useState(createEmptyFilters);
	var filters = filterState[0];
	var setFilters = filterState[1];
	var appliedFilterState = useState(createEmptyFilters);
	var appliedFilters = appliedFilterState[0];
	var setAppliedFilters = appliedFilterState[1];
	var filterExpandedState = useState(false);
	var filterExpanded = filterExpandedState[0];
	var setFilterExpanded = filterExpandedState[1];
	var multiPlateOpenState = useState(false);
	var multiPlateOpen = multiPlateOpenState[0];
	var setMultiPlateOpen = multiPlateOpenState[1];
	var multiPlateDraftState = useState('');
	var multiPlateDraft = multiPlateDraftState[0];
	var setMultiPlateDraft = multiPlateDraftState[1];

	/** total | inProgress | completed */
	var kpiFilterState = useState('inProgress');
	var kpiFilter = kpiFilterState[0];
	var setKpiFilter = kpiFilterState[1];
	var pageState = useState(1);
	var pageSizeState = useState(10);
	var colWidthsState = useState({ contractInfo: 240 });
	var colWidths = colWidthsState[0];
	var setColWidths = colWidthsState[1];
	var requirementModalOpen = useState(false);
	var setRequirementModalOpen = requirementModalOpen[1];

	var requirementModalItems = useMemo(function () {
		return createDeliveryRequirementModalItems(antd);
	}, []);

	// 交车区域：省-市 二级
	var regionOptions = [
		{ value: 'zhejiang', label: '浙江省', children: [{ value: 'hangzhou', label: '杭州市' }, { value: 'jiaxing', label: '嘉兴市' }, { value: 'ningbo', label: '宁波市' }] },
		{ value: 'shanghai', label: '上海市', children: [{ value: 'shanghai', label: '上海市' }] },
		{ value: 'guangdong', label: '广东省', children: [{ value: 'guangzhou', label: '广州市' }, { value: 'shenzhen', label: '深圳市' }] }
	];

	var contractCodeOptions = [
		{ value: 'LNZLHT', label: 'LNZLHT' },
		{ value: 'HT-ZL-2024', label: 'HT-ZL-2024' },
		{ value: 'HT-ZL-2025', label: 'HT-ZL-2025' }
	];
	var projectNameOptions = [
		{ value: 'p1', label: '桐乡韵达租赁4.5T*10' },
		{ value: 'p2', label: '洛安供应链-租赁帕力安4.5T*30' },
		{ value: 'p3', label: '嘉兴氢能示范项目' },
		{ value: 'p4', label: '杭州城配租赁项目' }
	];
	var customerNameOptions = [
		{ value: 'c1', label: '桐乡市丰韵快递有限责任公司' },
		{ value: 'c2', label: '武汉洛安供应链有限公司' },
		{ value: 'c3', label: '嘉兴某某物流有限公司' },
		{ value: 'c4', label: '杭州某某租赁有限公司' }
	];
	var deliveryPersonOptions = [
		{ value: '张三', label: '张三' },
		{ value: '李四', label: '李四' },
		{ value: '王五', label: '王五' },
		{ value: '魏山', label: '魏山' },
		{ value: '何苗苗', label: '何苗苗' }
	];
	var taskSourceOptions = [
		{ value: '替换车', label: '替换车' },
		{ value: '交车任务', label: '交车任务' }
	];
	var bizTypeOptions = [
		{ value: '租赁', label: '租赁' },
		{ value: '自营', label: '自营' }
	];
	var isDelayedOptions = [
		{ value: 'yes', label: '是' },
		{ value: 'no', label: '否' }
	];

	var DV_ORDER_KEY = 'oneos_delivery_order_id';
	var DV_VEHICLE_KEY = 'oneos_delivery_vehicle_key';
	var DV_NAV_KEY = 'oneos_delivery_navigate_target';
	var DV_CONTRACT_CODE_KEY = 'oneos_contract_code';
	var DV_LIST_LINK_STYLE = { color: '#165dff', cursor: 'pointer' };

	/** 交车状态：进行中=未开始/已保存/待客户签章；历史=客户已签章（运维+客户 E 签宝均完成） */
	var DELIVERY_STATUS_HISTORY = '客户已签章';
	var DELIVERY_STATUS_IN_PROGRESS = ['未开始', '已保存', '待客户签章'];

	function isDeliveryHistoryStatus(status) {
		return status === DELIVERY_STATUS_HISTORY || status === '已签章';
	}

	function isDeliveryInProgressStatus(status) {
		return DELIVERY_STATUS_IN_PROGRESS.indexOf(status || '未开始') >= 0;
	}

	/** 运维侧已完成交车提交（待签章或已签章）视为车辆已交车 */
	function isVehicleDelivered(status) {
		return status === '待客户签章' || isDeliveryHistoryStatus(status);
	}

	function canEditDeliveryRow(record) {
		var s = record.deliveryStatus;
		return s === '未开始' || s === '已保存';
	}

	// 交车任务（一单多车）；列表按车辆拆分为独立行，表头对齐导出样表
	var deliveryOrdersState = useState([
		{
			id: 'o1', expectedDate: '2025-02-28 至 2025-03-05', contractCode: 'LNZLHT 20260104001', projectName: '桐乡韵达租赁4.5T*10', customerName: '桐乡市丰韵快递有限责任公司', businessDept: '业务二部', businessOwner: '刘念念', taskSource: '替换车', replaceOldPlate: '浙A88601F', bizType: '租赁', deliveryRegion: '浙江省-嘉兴市', deliveryAddress: '平湖指定停车场', createTime: '2026-06-04 11:28', createBy: '赵小峰',
			authorizedList: [{ name: '周授权', phone: '13805731234', idCard: '330402199001011234' }],
			vehicleList: [
				{ vehicleKey: 1, seq: 1, vehicleType: '4.5吨冷链车', brand: '现代', model: '帕力安牌4.5吨冷链车', vin: 'LNBSCPKB8RR123401', replaceOldPlate: '浙A88601F', plateNo: '', deliveryTime: '', deliveryPerson: '', deliveryStatus: '未开始', deliveryMileage: null, deliveryH2: null, deliveryElec: null },
				{ vehicleKey: 2, seq: 2, vehicleType: '4.5吨冷链车', brand: '现代', model: '帕力安牌4.5吨冷链车', vin: 'LNBSCPKB8RR123402', replaceOldPlate: '浙A88602F', plateNo: '', deliveryTime: '', deliveryPerson: '', deliveryStatus: '未开始', deliveryMileage: null, deliveryH2: null, deliveryElec: null }
			]
		},
		{
			id: 'o2', expectedDate: '2025-03-01', contractCode: 'LNZLHT2026040301-042', projectName: '洛安供应链-租赁帕力安4.5T*30', customerName: '武汉洛安供应链有限公司', businessDept: '业务三部', businessOwner: '金可鹏', taskSource: '交车任务', bizType: '租赁', deliveryRegion: '四川省-成都市', deliveryAddress: '成都龙泉驿停车场', createTime: '2026-05-31 14:07', createBy: '何苗苗',
			authorizedList: [{ name: '陈明', phone: '13800138088', idCard: '420102199002022345' }],
			vehicleList: [
				{ vehicleKey: 1, seq: 1, vehicleType: '4.5吨冷链车', brand: '现代', model: '帕力安牌4.5吨冷链车', vin: 'LNBSCPKB9RR223401', plateNo: '粤AGP9827', deliveryTime: '2026-06-03 18:20', deliveryPerson: '魏山', deliveryStatus: '待客户签章', deliveryMileage: 48202, deliveryH2: 19, deliveryH2Unit: '%', deliveryElec: 82 },
				{ vehicleKey: 2, seq: 2, vehicleType: '4.5吨冷链车', brand: '现代', model: '帕力安牌4.5吨冷链车', vin: 'LNBSCPKB9RR223402', plateNo: '粤AGP4598', deliveryTime: '2026-06-02 11:00', deliveryPerson: '魏山', deliveryStatus: '已保存', deliveryMileage: null, deliveryH2: null, deliveryElec: null }
			]
		},
		{
			id: 'o3', expectedDate: '2025-03-08', contractCode: 'LNZLHT2025042201', projectName: '炽瑞-租赁现代4.5T', customerName: '东莞沙田炽瑞物流有限公司', businessDept: '业务三部', businessOwner: '金可鹏', taskSource: '替换车', replaceOldPlate: '粤B58888F', bizType: '租赁', deliveryRegion: '广东省-广州市', deliveryAddress: '广州南沙物流园停车场', createTime: '2026-05-28 20:30', createBy: '童军林',
			authorizedList: [{ name: '黄签章', phone: '13600136066', idCard: '441900199003033456' }],
			vehicleList: [
				{ vehicleKey: 1, seq: 1, vehicleType: '4.5吨货车', brand: '现代', model: '4.5吨货车', vin: 'LNBSCPKB7RR323401', replaceOldPlate: '粤B58888F', plateNo: '', deliveryTime: '', deliveryPerson: '', deliveryStatus: '未开始', deliveryMileage: null, deliveryH2: null, deliveryElec: null }
			]
		},
		{
			id: 'o4', expectedDate: '2024-11-15', contractCode: 'LNZLHT2024111401', projectName: '聚德11月新增苏龙18T*2', customerName: '沈阳聚德物流有限公司', businessDept: '业务三部', businessOwner: '金可鹏', taskSource: '交车任务', bizType: '租赁', deliveryRegion: '浙江省-嘉兴市', deliveryAddress: '嘉兴港区氢能停车场', createTime: '2024-11-15 15:05', createBy: '何苗苗',
			authorizedList: [
				{ name: '李签章', phone: '13900139099', idCard: '210102199004044567' },
				{ name: '王签章', phone: '13700137077', idCard: '210103199005055678' }
			],
			vehicleList: [
				{ vehicleKey: 1, seq: 1, vehicleType: '18吨双飞翼货车', brand: '苏龙', model: '海格牌18吨双飞翼货车', vin: 'LKLG7C4E4NA774701', plateNo: '浙F80088', deliveryTime: '2026-06-02 16:00', deliveryPerson: '魏山', deliveryStatus: '待客户签章', deliveryMileage: 46200, deliveryH2: 21, deliveryH2Unit: '%', deliveryElec: 80 },
				{ vehicleKey: 2, seq: 2, vehicleType: '18吨双飞翼货车', brand: '苏龙', model: '海格牌18吨双飞翼货车', vin: 'LKLG7C4E4NA774702', plateNo: '沪A03802F', deliveryTime: '2025-11-20 09:30', deliveryPerson: '何苗苗', deliveryStatus: '已保存', deliveryMileage: null, deliveryH2: null, deliveryElec: null }
			]
		},
		{
			id: 'o5', expectedDate: '2025-02-15', contractCode: 'HT-ZL-2024-001', projectName: '嘉兴氢能示范项目', customerName: '嘉兴某某物流有限公司', businessDept: '业务一部', businessOwner: '张经理', taskSource: '交车任务', bizType: '租赁', deliveryRegion: '浙江省-嘉兴市', deliveryAddress: '南湖科技大道停车场', createTime: '2025-02-10 09:00', createBy: '系统',
			authorizedList: [{ name: '张授权', phone: '13500135055', idCard: '330402199006066789' }],
			vehicleList: [
				{ vehicleKey: 1, seq: 1, vehicleType: '厢式货车', brand: '东风', model: 'DFH1180', vin: 'LKLG7C4E4NA774759', plateNo: '京A12345', deliveryTime: '2025-02-15 10:30', deliveryPerson: '张三', deliveryStatus: '客户已签章', deliveryMileage: 12580, deliveryH2: 35, deliveryH2Unit: 'MPa', deliveryElec: 45, vehicleReturned: true, returnTime: '2025-08-20 11:30', returnPerson: '王五' },
				{ vehicleKey: 2, seq: 2, vehicleType: '厢式货车', brand: '福田', model: 'BJ1180', vin: 'LKLG7C4E4NA774760', plateNo: '京C11111', deliveryTime: '2025-02-15 14:00', deliveryPerson: '李四', deliveryStatus: '客户已签章', deliveryMileage: 13200, deliveryH2: 68, deliveryH2Unit: '%', deliveryElec: 38, vehicleReturned: false }
			]
		},
		{
			id: 'o6', expectedDate: '2025-02-18', contractCode: 'HT-ZL-2024-003', projectName: '杭州城配租赁项目', customerName: '杭州某某租赁有限公司', businessDept: '业务二部', businessOwner: '李经理', taskSource: '交车任务', bizType: '租赁', deliveryRegion: '浙江省-杭州市', deliveryAddress: '未来科技城地下停车场', createTime: '2025-02-12 08:30', createBy: '李四',
			authorizedList: [{ name: '赵授权', phone: '13300133033', idCard: '330106199007077890' }],
			vehicleList: [
				{ vehicleKey: 1, seq: 1, vehicleType: '城配货车', brand: '重汽', model: 'ZZ1180', vin: 'LKLG7C4E4NA774801', plateNo: '浙A10001', deliveryTime: '2025-02-18 09:15', deliveryPerson: '张三', deliveryStatus: '客户已签章', deliveryMileage: 9800, deliveryH2: 10.8, deliveryH2Unit: '%', deliveryElec: 52, vehicleReturned: true, returnTime: '2026-05-12 09:20', returnPerson: '张三' },
				{ vehicleKey: 2, seq: 2, vehicleType: '城配货车', brand: '东风', model: 'DFH1190', vin: 'LKLG7C4E4NA774802', plateNo: '浙A10002', deliveryTime: '2025-02-18 11:40', deliveryPerson: '李四', deliveryStatus: '客户已签章', deliveryMileage: 10120, deliveryH2: 9.6, deliveryH2Unit: '%', deliveryElec: 48, vehicleReturned: false },
				{ vehicleKey: 3, seq: 3, vehicleType: '城配货车', brand: '福田', model: 'BJ1190', vin: 'LKLG7C4E4NA774803', plateNo: '浙A10003', deliveryTime: '2025-02-18 16:20', deliveryPerson: '王五', deliveryStatus: '客户已签章', deliveryMileage: 11500, deliveryH2: 32, deliveryH2Unit: 'MPa', deliveryElec: 55, vehicleReturned: false }
			]
		}
	]);
	var deliveryOrders = deliveryOrdersState[0];
	var setDeliveryOrders = deliveryOrdersState[1];

	var editDrawerState = useState({ open: false, record: null, mode: 'edit' });
	var editDrawer = editDrawerState[0];
	var setEditDrawer = editDrawerState[1];

	function resolveVehicleReturnedFields(deliveryStatus, v) {
		if (!isVehicleDelivered(deliveryStatus || '未开始')) {
			return { vehicleReturned: false, returnTime: '', returnPerson: '' };
		}
		if (!isDeliveryHistoryStatus(deliveryStatus || '未开始')) {
			return { vehicleReturned: false, returnTime: '', returnPerson: '' };
		}
		return {
			vehicleReturned: v.vehicleReturned === true || !!(v.returnTime && String(v.returnTime).trim()),
			returnTime: v.returnTime || '',
			returnPerson: (v.returnPerson && v.returnPerson !== '-') ? String(v.returnPerson).trim() : ''
		};
	}

	function expandOrdersToVehicleRows(orders) {
		var rows = [];
		(orders || []).forEach(function (order) {
			(order.vehicleList || []).forEach(function (v, idx) {
				var vk = v.vehicleKey != null ? v.vehicleKey : idx + 1;
				var deliveryStatus = v.deliveryStatus || '未开始';
				var returnFields = resolveVehicleReturnedFields(deliveryStatus, v);
				rows.push({
					id: order.id + '_v' + vk,
					orderId: order.id,
					vehicleKey: vk,
					seq: v.seq != null ? v.seq : idx + 1,
					deliveryTime: v.deliveryTime || v.actualDate || '',
					deliveryPerson: (v.deliveryPerson && v.deliveryPerson !== '-') ? v.deliveryPerson : '',
					plateNo: (v.plateNo && v.plateNo !== '-') ? String(v.plateNo).trim() : '',
					vin: (v.plateNo && v.plateNo !== '-' && String(v.plateNo).trim()) ? (v.vin || '') : '',
					vehicleType: v.vehicleType || '',
					brand: v.brand || '',
					model: v.model || '',
					contractCode: order.contractCode,
					customerName: order.customerName,
					projectName: order.projectName,
					businessDept: order.businessDept || '-',
					businessOwner: order.businessOwner || '-',
					taskSource: order.taskSource || '-',
					replaceOldPlate: (v.replaceOldPlate || order.replaceOldPlate || '').trim(),
					bizType: order.bizType || '-',
					deliveryRegion: order.deliveryRegion || '-',
					deliveryAddress: order.deliveryAddress || '-',
					deliveryStatus: deliveryStatus,
					deliveryMileage: v.deliveryMileage,
					deliveryH2: v.deliveryH2,
					deliveryH2Unit: v.deliveryH2Unit === 'MPa' ? 'MPa' : '%',
					deliveryElec: v.deliveryElec,
					createTime: order.createTime,
					createBy: order.createBy,
					expectedDate: order.expectedDate,
					authorizedList: Array.isArray(order.authorizedList) ? order.authorizedList.slice() : [],
					vehicleReturned: returnFields.vehicleReturned,
					returnTime: returnFields.returnTime,
					returnPerson: returnFields.returnPerson
				});
			});
		});
		return rows;
	}

	function formatDeliveryMileage(v) {
		if (v === null || v === undefined || v === '') return '-';
		return String(v) + ' km';
	}

	function formatDeliveryH2(v, unit) {
		if (v === null || v === undefined || v === '') return '-';
		var u = unit === 'MPa' ? 'MPa' : '%';
		return String(v) + ' ' + u;
	}

	function formatDeliveryElec(v) {
		if (v === null || v === undefined || v === '') return '-';
		return String(v) + ' %';
	}

	function renderDeliveryRecordCell(record) {
		return React.createElement('div', null,
			React.createElement('div', { style: cellLineSubStyle }, '里程 ', formatDeliveryMileage(record.deliveryMileage)),
			React.createElement('div', { style: cellLineSubStyle }, '氢量 ', formatDeliveryH2(record.deliveryH2, record.deliveryH2Unit)),
			React.createElement('div', { style: cellLineSubStyle }, '电量 ', formatDeliveryElec(record.deliveryElec))
		);
	}

	function rowDateKey(row) {
		var t = row.deliveryTime || '';
		if (t && t.length >= 10) return t.slice(0, 10);
		return (row.createTime || '').slice(0, 10);
	}

	function parseExpectedEndDate(expectedDate) {
		if (!expectedDate) return '';
		var s = String(expectedDate).trim();
		if (s.indexOf('至') >= 0) {
			var seg = s.split('至');
			return (seg[seg.length - 1] || '').trim().slice(0, 10);
		}
		return s.slice(0, 10);
	}

	function computeRowDelayed(row) {
		if (isDeliveryHistoryStatus(row.deliveryStatus)) return false;
		var end = parseExpectedEndDate(row.expectedDate);
		if (!end) return false;
		return end < '2026-06-01';
	}

	function filterSelectOption(input, option) {
		var label = (option && (option.label || option.children)) || '';
		return String(label).toLowerCase().indexOf(String(input || '').toLowerCase()) >= 0;
	}

	function filterVehicleRows(rows) {
		var list = rows.slice();
		var f = appliedFilters;
		if (f.contractCode) {
			var cc = (contractCodeOptions.find(function (o) { return o.value === f.contractCode; }) || {}).label || f.contractCode;
			list = list.filter(function (r) { return (r.contractCode || '').indexOf(cc) !== -1; });
		}
		if (f.projectName) {
			var projLabel = (projectNameOptions.find(function (o) { return o.value === f.projectName; }) || {}).label;
			if (projLabel) list = list.filter(function (r) { return r.projectName === projLabel; });
		}
		if (f.customerName) {
			var custLabel = (customerNameOptions.find(function (o) { return o.value === f.customerName; }) || {}).label;
			if (custLabel) list = list.filter(function (r) { return r.customerName === custLabel; });
		}
		if (f.deliveryRegion) list = list.filter(function (r) { return (r.deliveryRegion || '').indexOf(f.deliveryRegion) !== -1; });
		if (f.dateStart) list = list.filter(function (r) { return rowDateKey(r) >= f.dateStart; });
		if (f.dateEnd) list = list.filter(function (r) { return rowDateKey(r) <= f.dateEnd; });
		if (f.deliveryPerson) list = list.filter(function (r) { return (r.deliveryPerson || '').indexOf(f.deliveryPerson) !== -1; });
		if (parseMultiPlates(f.plateNos).length) {
			list = list.filter(function (r) { return rowMatchesVehicleFilter(r, f.plateNos); });
		}
		if (f.vin) list = list.filter(function (r) { return (r.vin || '').indexOf(f.vin) !== -1; });
		if (f.vehicleType) list = list.filter(function (r) { return r.vehicleType === f.vehicleType; });
		if (f.brand) list = list.filter(function (r) { return r.brand === f.brand; });
		if (f.model) list = list.filter(function (r) { return r.model === f.model; });
		if (f.businessDept) list = list.filter(function (r) { return (r.businessDept || '').indexOf(f.businessDept) !== -1; });
		if (f.businessOwner) list = list.filter(function (r) { return (r.businessOwner || '').indexOf(f.businessOwner) !== -1; });
		if (f.taskSource) list = list.filter(function (r) { return r.taskSource === f.taskSource; });
		if (f.bizType) list = list.filter(function (r) { return r.bizType === f.bizType; });
		if (f.isDelayed === 'yes') list = list.filter(function (r) { return computeRowDelayed(r); });
		if (f.isDelayed === 'no') list = list.filter(function (r) { return !computeRowDelayed(r); });
		return list;
	}

	var allVehicleRows = useMemo(function () {
		return expandOrdersToVehicleRows(deliveryOrders);
	}, [deliveryOrders]);

	var operatorVisibleRows = useMemo(function () {
		return filterRowsByOperatorRegion(allVehicleRows);
	}, [allVehicleRows]);

	function buildSelectOptions(values) {
		var seen = {};
		var opts = [];
		(values || []).forEach(function (v) {
			var s = v == null ? '' : String(v).trim();
			if (!s || seen[s]) return;
			seen[s] = true;
			opts.push({ value: s, label: s });
		});
		opts.sort(function (a, b) { return a.label.localeCompare(b.label, 'zh-CN'); });
		return opts;
	}

	var dynamicFilterOptions = useMemo(function () {
		var vins = [];
		var vehicleTypes = [];
		var brands = [];
		var models = [];
		var depts = [];
		var owners = [];
		operatorVisibleRows.forEach(function (r) {
			if (r.vin) vins.push(r.vin);
			if (r.vehicleType) vehicleTypes.push(r.vehicleType);
			if (r.brand) brands.push(r.brand);
			if (r.model) models.push(r.model);
			if (r.businessDept && r.businessDept !== '-') depts.push(r.businessDept);
			if (r.businessOwner && r.businessOwner !== '-') owners.push(r.businessOwner);
		});
		return {
			vinOptions: buildSelectOptions(vins),
			vehicleTypeOptions: buildSelectOptions(vehicleTypes),
			brandOptions: buildSelectOptions(brands),
			modelOptions: buildSelectOptions(models),
			businessDeptOptions: buildSelectOptions(depts),
			businessOwnerOptions: buildSelectOptions(owners)
		};
	}, [operatorVisibleRows]);

	var filteredBySearch = useMemo(function () {
		return filterVehicleRows(operatorVisibleRows);
	}, [operatorVisibleRows, appliedFilters]);

	var kpiStats = useMemo(function () {
		var inProgress = 0;
		var completed = 0;
		filteredBySearch.forEach(function (r) {
			if (isDeliveryHistoryStatus(r.deliveryStatus)) completed++;
			else if (isDeliveryInProgressStatus(r.deliveryStatus)) inProgress++;
		});
		return { total: filteredBySearch.length, inProgress: inProgress, completed: completed };
	}, [filteredBySearch]);

	function matchKpiFilter(row, filterKey) {
		if (filterKey === 'total') return true;
		if (filterKey === 'inProgress') return isDeliveryInProgressStatus(row.deliveryStatus);
		if (filterKey === 'completed') return isDeliveryHistoryStatus(row.deliveryStatus);
		return true;
	}

	var filteredList = useMemo(function () {
		return filteredBySearch.filter(function (r) { return matchKpiFilter(r, kpiFilter); });
	}, [filteredBySearch, kpiFilter]);

	function patchVehicleInOrder(orderId, vehicleKey, patch) {
		setDeliveryOrders(function (orders) {
			return orders.map(function (order) {
				if (order.id !== orderId) return order;
				return Object.assign({}, order, {
					vehicleList: (order.vehicleList || []).map(function (v) {
						var vk = v.vehicleKey != null ? v.vehicleKey : v.seq;
						if (vk !== vehicleKey) return v;
						return Object.assign({}, v, patch);
					})
				});
			});
		});
	}

	var openEditDrawer = useCallback(function (record) {
		setEditDrawer({ open: true, record: record, mode: 'edit' });
	}, []);

	var openViewDrawer = useCallback(function (record) {
		setEditDrawer({ open: true, record: record, mode: 'view' });
	}, []);

	var closeEditDrawer = useCallback(function () {
		setEditDrawer({ open: false, record: null, mode: 'edit' });
	}, []);

	var handleEditSave = useCallback(function (patch) {
		var rec = editDrawer.record;
		if (!rec) return;
		patchVehicleInOrder(rec.orderId, rec.vehicleKey, Object.assign({}, patch, { deliveryStatus: '已保存' }));
	}, [editDrawer.record]);

	var handleEditSubmit = useCallback(function (patch) {
		var rec = editDrawer.record;
		if (!rec) return;
		patchVehicleInOrder(rec.orderId, rec.vehicleKey, Object.assign({}, patch, { deliveryStatus: '待客户签章', deliveryTime: patch.deliveryTime || '2026-06-04 10:00', deliveryPerson: patch.deliveryPerson || '魏山' }));
		closeEditDrawer();
	}, [editDrawer.record, closeEditDrawer]);

	var navigateToContractDetail = useCallback(function (record) {
		try {
			sessionStorage.setItem(DV_CONTRACT_CODE_KEY, record.contractCode || '');
			sessionStorage.setItem(DV_ORDER_KEY, record.orderId || '');
		} catch (e) {}
		message.info('跳转 合同管理-该合同详情页（合同编号 ' + (record.contractCode || '-') + '）');
	}, []);

	var navigateDelivery = useCallback(function (record, target) {
		try {
			sessionStorage.setItem(DV_ORDER_KEY, record.orderId || '');
			sessionStorage.setItem(DV_VEHICLE_KEY, String(record.vehicleKey != null ? record.vehicleKey : ''));
			sessionStorage.setItem(DV_NAV_KEY, target || 'order');
		} catch (e) {}
		var pageMap = { order: '交车管理-交车单', edit: '交车管理-交车单-编辑', view: '交车管理-交车单-查看' };
		message.info('跳转 ' + (pageMap[target] || target) + '（交车单 ' + record.orderId + ' · 车辆 ' + record.plateNo + '）');
	}, []);

	var page = pageState[0];
	var setPage = pageState[1];
	var pageSize = pageSizeState[0];
	var setPageSize = pageSizeState[1];

	var handleKpiCardClick = useCallback(function (key) {
		setKpiFilter(key);
		setPage(1);
	}, []);

	var totalCount = filteredList.length;
	var displayList = useMemo(function () {
		var start = (page - 1) * pageSize;
		return filteredList.slice(start, start + pageSize);
	}, [filteredList, page, pageSize]);

	var kpiExportLabelMap = { total: '全部交车任务', inProgress: '进行中的交车任务', completed: '已完成的交车任务' };

	function normalizeRegionFilter(regionVal) {
		if (Array.isArray(regionVal) && regionVal.length >= 2) {
			var prov = regionOptions.find(function (r) { return r.value === regionVal[0]; });
			var city = prov && prov.children && prov.children.find(function (c) { return c.value === regionVal[1]; });
			return prov && city ? prov.label + '-' + city.label : undefined;
		}
		if (Array.isArray(regionVal) && regionVal.length === 1) {
			var pOnly = regionOptions.find(function (r) { return r.value === regionVal[0]; });
			return pOnly ? pOnly.label : undefined;
		}
		return regionVal;
	}

	var appliedMultiVehicles = useMemo(function () {
		return parseMultiPlates(appliedFilters.plateNos);
	}, [appliedFilters.plateNos]);

	var vehicleFilterTriggerText = appliedMultiVehicles.length
		? ('已选 ' + appliedMultiVehicles.length + ' 辆车')
		: '';

	var handleMultiPlateOpenChange = useCallback(function (open) {
		setMultiPlateOpen(open);
		if (open) setMultiPlateDraft(filters.plateNos || '');
	}, [filters.plateNos]);

	var handleMultiPlateClear = useCallback(function () {
		setMultiPlateDraft('');
		setMultiPlateOpen(false);
		var next = patchFilters(filters, { plateNos: '' });
		setFilters(next);
		setAppliedFilters(patchFilters(next, {}));
		setPage(1);
	}, [filters]);

	var handleMultiPlateApply = useCallback(function () {
		var trimmed = multiPlateDraft.trim();
		setFilters(function (f) { return patchFilters(f, { plateNos: trimmed }); });
		setMultiPlateOpen(false);
	}, [multiPlateDraft]);

	var handleQuery = useCallback(function () {
		var plateText = (multiPlateDraft.trim() || (filters.plateNos || '')).trim();
		var next = patchFilters(filters, {
			deliveryRegion: normalizeRegionFilter(filters.deliveryRegion),
			plateNos: plateText
		});
		setFilters(next);
		setAppliedFilters(patchFilters(next, {}));
		setMultiPlateDraft(plateText);
		setMultiPlateOpen(false);
		setPage(1);
		var tokens = parseMultiPlates(plateText);
		if (tokens.length) {
			message.success('已按 ' + tokens.length + ' 辆车筛选');
		}
	}, [filters, multiPlateDraft]);

	var handleReset = useCallback(function () {
		var empty = createEmptyFilters();
		setFilters(empty);
		setAppliedFilters(empty);
		setMultiPlateDraft('');
		setMultiPlateOpen(false);
		setPage(1);
	}, []);

	var getExportRowsByKpi = useCallback(function (filterKey) {
		return filteredBySearch.filter(function (r) { return matchKpiFilter(r, filterKey); });
	}, [filteredBySearch]);

	var handleExport = useCallback(function () {
		var tabLabel = kpiExportLabelMap[kpiFilter] || '交车任务';
		var rows = getExportRowsByKpi(kpiFilter);
		if (!rows || rows.length === 0) {
			message.warning('当前「' + tabLabel + '」无数据可导出');
			return;
		}
		var escapeCsv = function (v) {
			var s = v == null ? '' : String(v);
			if (s.indexOf(',') !== -1 || s.indexOf('"') !== -1 || s.indexOf('\n') !== -1) return '"' + s.replace(/"/g, '""') + '"';
			return s;
		};
		var headers = ['完成交车时间', '交车人', '车牌号', '品牌', '型号', '合同编号', '客户名称', '项目名称', '业务部门', '业务负责人', '任务来源', '业务类型', '交车区域', '交车地点', '交车状态', '交车里程', '交车氢量', '交车电量', '创建时间', '创建人'];
		var rowToCells = function (r) {
			return [formatCompletedDeliveryTimeExport(r.deliveryTime), r.deliveryPerson || '-', displayPlateNo(r.plateNo), r.brand || '-', r.model || '-', r.contractCode, r.customerName, r.projectName, r.businessDept, r.businessOwner, r.taskSource, r.bizType, r.deliveryRegion, r.deliveryAddress, r.deliveryStatus, formatDeliveryMileage(r.deliveryMileage), formatDeliveryH2(r.deliveryH2, r.deliveryH2Unit), formatDeliveryElec(r.deliveryElec), r.createTime, r.createBy];
		};
		var csv = headers.map(escapeCsv).join(',') + '\n';
		rows.forEach(function (r) {
			csv += rowToCells(r).map(escapeCsv).join(',') + '\n';
		});
		var blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' });
		var url = URL.createObjectURL(blob);
		var a = document.createElement('a');
		a.href = url;
		a.download = '交车管理_' + tabLabel + '_' + new Date().getTime() + '.csv';
		a.click();
		URL.revokeObjectURL(url);
		message.success('已导出「' + tabLabel + '」共 ' + rows.length + ' 条（含当前筛选条件）');
	}, [kpiFilter, getExportRowsByKpi]);

	var dateRangeValue = useMemo(function () {
		if (!filters.dateStart && !filters.dateEnd) return null;
		try {
			if (typeof window !== 'undefined' && window.dayjs && filters.dateStart && filters.dateEnd) {
				return [window.dayjs(filters.dateStart), window.dayjs(filters.dateEnd)];
			}
		} catch (e) {}
		return null;
	}, [filters.dateStart, filters.dateEnd]);

	var onDateRangeChange = useCallback(function (dates, dateStrings) {
		setFilters(function (f) {
			var g = {}; for (var k in f) g[k] = f[k];
			g.dateStart = (dateStrings && dateStrings[0]) || '';
			g.dateEnd = (dateStrings && dateStrings[1]) || '';
			return g;
		});
	}, []);

	// 交车区域 Cascader 的 value：用 appliedFilters 反推或存 value 数组。筛选用字符串比较，表单用 Cascader 选省-市
	var deliveryRegionValue = useMemo(function () {
		var s = filters.deliveryRegion;
		if (!s || typeof s !== 'string') return undefined;
		var parts = s.split('-');
		if (parts.length < 2) return undefined;
		for (var i = 0; i < regionOptions.length; i++) {
			var prov = regionOptions[i];
			if (prov.label !== parts[0]) continue;
			for (var j = 0; j < (prov.children || []).length; j++) {
				if (prov.children[j].label === parts[1]) return [prov.value, prov.children[j].value];
			}
		}
		return undefined;
	}, [filters.deliveryRegion]);

	var solidTagBaseStyle = { margin: 0, border: 'none', fontWeight: 600, color: '#fff', lineHeight: '20px', flexShrink: 0, flexGrow: 0 };

	function renderSolidTag(text, bgColor) {
		if (!text || text === '-') return '-';
		return React.createElement(Tag, {
			style: Object.assign({}, solidTagBaseStyle, { backgroundColor: bgColor || '#64748b' })
		}, text);
	}

	function renderDeliveryStatus(status, record) {
		var bg = '#8c8c8c';
		if (isCustomerSignRelatedStatus(status)) bg = DV_CUSTOMER_SIGN_STATUS_BG;
		else if (status === '已保存') bg = '#ea580c';
		else if (status === '未开始') bg = '#64748b';
		var signed = isDeliverySignedStatus(status);
		var pendingSign = isDeliveryPendingCustomerSignStatus(status);
		var style = Object.assign({}, solidTagBaseStyle, { backgroundColor: bg || '#64748b' });
		var tag = React.createElement(Tag, {
			style: style,
			title: signed ? '点击下载签章文件' : undefined,
			role: signed ? 'button' : undefined,
			tabIndex: signed ? 0 : undefined,
			onClick: signed ? function (e) { e.stopPropagation(); downloadDeliverySignFile(record); } : undefined,
			onKeyDown: signed ? function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); downloadDeliverySignFile(record); } } : undefined
		}, status);
		if (pendingSign) {
			return React.createElement(Popover, {
				content: buildCustomerSignPendingPopoverContent(record),
				trigger: 'hover',
				placement: 'topLeft',
				mouseEnterDelay: 0.15,
				mouseLeaveDelay: 0.1,
				destroyTooltipOnHide: true
			}, tag);
		}
		return tag;
	}

	function renderBizTypeTag(bizType) {
		if (!bizType || bizType === '-') return null;
		var bg = '#64748b';
		if (bizType === '租赁') bg = '#2563eb';
		else if (bizType === '自营') bg = '#7c3aed';
		return React.createElement(Tag, {
			style: Object.assign({}, solidTagBaseStyle, {
				backgroundColor: bg,
				display: 'inline-flex',
				alignItems: 'center',
				justifyContent: 'center',
				textAlign: 'center',
				alignSelf: 'center',
				minWidth: 44,
				height: 22,
				padding: '0 10px',
				boxSizing: 'border-box'
			})
		}, bizType);
	}

	function renderTaskSourceTag(text, bgColor) {
		return React.createElement(Tag, {
			style: Object.assign({}, solidTagBaseStyle, { backgroundColor: bgColor, cursor: 'default' })
		}, text);
	}

	var handleColumnResizeStart = useCallback(function (colKey, e) {
		e.preventDefault();
		e.stopPropagation();
		var startX = e.clientX;
		var startW = colWidths[colKey] || 240;
		function onMove(ev) {
			var nextW = Math.max(140, Math.min(560, startW + ev.clientX - startX));
			setColWidths(function (prev) {
				var next = {};
				for (var k in prev) next[k] = prev[k];
				next[colKey] = nextW;
				return next;
			});
		}
		function onUp() {
			document.removeEventListener('mousemove', onMove);
			document.removeEventListener('mouseup', onUp);
		}
		document.addEventListener('mousemove', onMove);
		document.addEventListener('mouseup', onUp);
	}, [colWidths]);

	function renderResizableTitle(title, colKey) {
		return React.createElement('div', { style: { position: 'relative', paddingRight: 10, userSelect: 'none' } },
			title,
			React.createElement('span', {
				role: 'separator',
				'aria-orientation': 'vertical',
				title: '拖动调整列宽',
				style: {
					position: 'absolute',
					right: 0,
					top: 0,
					bottom: 0,
					width: 8,
					cursor: 'col-resize',
					zIndex: 1
				},
				onMouseDown: function (ev) { handleColumnResizeStart(colKey, ev); }
			})
		);
	}

	function renderContractInfoCell(record) {
		var customerName = record.customerName || '-';
		var showTip = customerName !== '-';
		var contractCode = record.contractCode || '-';
		var projectName = record.projectName || '-';
		return React.createElement('div', { style: { minWidth: 0, width: '100%' } },
			React.createElement('div', {
				style: {
					display: 'flex',
					alignItems: 'center',
					flexWrap: 'nowrap',
					gap: 6,
					minWidth: 0,
					width: '100%',
					lineHeight: 1.45
				}
			},
				React.createElement(Tooltip, { title: showTip ? customerName : null, placement: 'topLeft' },
					React.createElement('span', {
						style: {
							flex: '1 1 auto',
							minWidth: 0,
							overflow: 'hidden',
							textOverflow: 'ellipsis',
							whiteSpace: 'nowrap',
							color: '#333',
							display: 'block'
						}
					}, customerName)
				),
				React.createElement('span', {
					style: {
						flexShrink: 0,
						display: 'inline-flex',
						alignItems: 'center',
						justifyContent: 'center'
					}
				}, renderBizTypeTag(record.bizType))
			),
			contractCode !== '-'
				? React.createElement('div', {
					style: Object.assign({}, cellLineSubStyle, DV_LIST_LINK_STYLE, { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }),
					role: 'button',
					tabIndex: 0,
					onClick: function () { navigateToContractDetail(record); },
					onKeyDown: function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); navigateToContractDetail(record); } }
				}, contractCode)
				: React.createElement('div', { style: cellLineSubStyle }, '-'),
			projectName !== '-'
				? React.createElement('div', {
					style: Object.assign({}, cellLineSubStyle, DV_LIST_LINK_STYLE, { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }),
					role: 'button',
					tabIndex: 0,
					onClick: function () { navigateToContractDetail(record); },
					onKeyDown: function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); navigateToContractDetail(record); } }
				}, projectName)
				: React.createElement('div', { style: Object.assign({}, cellLineSubStyle, { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }) }, '-')
		);
	}

	function renderDeliveryPlaceCell(record) {
		var regionText = '交车区域：' + formatDeliveryRegion(record.deliveryRegion);
		var parkingText = isPlatePending(record.plateNo) ? '-' : (record.deliveryAddress || '-');
		return renderCellLines(regionText, [parkingText]);
	}

	function parseCompletedDeliveryTime(raw) {
		if (!raw || String(raw).trim() === '' || raw === '-') return { date: '-', time: '-' };
		var s = String(raw).trim();
		if (s.indexOf(' ') >= 0) {
			var parts = s.split(/\s+/);
			var datePart = parts[0] || '-';
			var timePart = parts[1] || '-';
			if (timePart.length >= 5) timePart = timePart.slice(0, 5);
			return { date: datePart, time: timePart };
		}
		return { date: s, time: '-' };
	}

	function renderCompletedDeliveryTimeCell(record) {
		var parsed = parseCompletedDeliveryTime(record.deliveryTime);
		return renderCellLines(parsed.date, [parsed.time]);
	}

	function renderTaskCreateTimeCell(record) {
		var parsed = parseCompletedDeliveryTime(record.createTime);
		if (parsed.date === '-' && parsed.time === '-') return '-';
		if (parsed.time === '-') return parsed.date;
		return parsed.date + ' ' + parsed.time;
	}

	function renderTaskCreateByCell(createBy) {
		if (createBy == null || createBy === undefined) return '-';
		var name = String(createBy).trim();
		return name === '' || name === '-' ? '-' : name;
	}

	function isVehicleReturned(record) {
		if (!record || !isVehicleDelivered(record.deliveryStatus) || !isDeliveryHistoryStatus(record.deliveryStatus)) return false;
		return record.vehicleReturned === true;
	}

	function renderVehicleReturnedCell(record) {
		if (!record || !isVehicleDelivered(record.deliveryStatus)) {
			return '-';
		}
		if (!isVehicleReturned(record)) {
			return React.createElement('span', { style: { color: '#64748b' } }, '未归还');
		}
		var label = React.createElement('span', {
			style: { color: '#16a34a', fontWeight: 600, cursor: 'default', borderBottom: '1px dashed #86efac' }
		}, '已归还');
		return React.createElement(Popover, {
			content: renderReturnVehiclePopoverContent(record),
			trigger: 'hover',
			placement: 'topLeft',
			mouseEnterDelay: 0.15,
			mouseLeaveDelay: 0.1,
			destroyTooltipOnHide: true
		}, label);
	}

	function formatReturnTimeDisplay(raw) {
		var parsed = parseCompletedDeliveryTime(raw);
		if (parsed.date === '-' && parsed.time === '-') return '-';
		if (parsed.time === '-') return parsed.date;
		return parsed.date + ' ' + parsed.time;
	}

	function renderReturnVehiclePopoverContent(record) {
		return React.createElement('div', { style: { minWidth: 168, fontSize: 13, lineHeight: 1.65 } },
			React.createElement('div', null,
				React.createElement('span', { style: { color: '#64748b' } }, '还车时间：'),
				React.createElement('span', { style: { color: '#334155', fontWeight: 600 } }, formatReturnTimeDisplay(record.returnTime))
			),
			React.createElement('div', { style: { marginTop: 4 } },
				React.createElement('span', { style: { color: '#64748b' } }, '还车人：'),
				React.createElement('span', { style: { color: '#334155', fontWeight: 600 } }, record.returnPerson || '-')
			)
		);
	}

	function formatCompletedDeliveryTimeExport(raw) {
		var parsed = parseCompletedDeliveryTime(raw);
		if (parsed.date === '-' && parsed.time === '-') return '-';
		if (parsed.time === '-') return parsed.date;
		return parsed.date + ' ' + parsed.time;
	}

	var cellLineMainStyle = { lineHeight: 1.45, color: '#333', wordBreak: 'break-all' };
	var cellLineSubStyle = { lineHeight: 1.4, fontSize: 12, color: '#8c8c8c', marginTop: 2, wordBreak: 'break-all' };

	function renderCellLines(mainText, subLines) {
		var subs = subLines || [];
		return React.createElement('div', null,
			React.createElement('div', { style: cellLineMainStyle }, mainText || '-'),
			subs.map(function (line, i) {
				return React.createElement('div', { key: i, style: cellLineSubStyle }, line || '-');
			})
		);
	}

	function isPlatePending(plateNo) {
		if (plateNo == null || plateNo === undefined) return true;
		var s = String(plateNo).trim();
		return s === '' || s === '-';
	}

	function displayPlateNo(plateNo) {
		return isPlatePending(plateNo) ? '车牌待选' : String(plateNo).trim();
	}

	function displayBrandModel(brand, model) {
		var b = brand && brand !== '-' ? String(brand).trim() : '';
		var m = model && model !== '-' ? String(model).trim() : '';
		if (b && m) return b + '-' + m;
		if (b) return b;
		if (m) return m;
		return '-';
	}

	function displayVin(vin, plateNo) {
		if (plateNo != null && isPlatePending(plateNo)) return '-';
		var s = vin == null || vin === undefined ? '' : String(vin).trim();
		return s || '-';
	}

	function displayReplaceOldPlate(plate) {
		var s = plate == null ? '' : String(plate).trim();
		return s || '-';
	}

	function renderReplaceVehiclePopoverContent(record) {
		var oldPlate = displayReplaceOldPlate(record.replaceOldPlate);
		var newPlate = displayPlateNo(record.plateNo);
		return React.createElement('div', { style: { minWidth: 168, fontSize: 13, lineHeight: 1.5 } },
			React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' } },
				React.createElement('span', { style: { color: '#64748b' } }, '旧车'),
				React.createElement('span', { style: { fontWeight: 600, color: '#334155' } }, oldPlate),
				React.createElement('span', { style: { color: '#94a3b8', fontWeight: 600 } }, '→'),
				React.createElement('span', { style: { color: '#64748b' } }, '新车'),
				React.createElement('span', {
					style: { fontWeight: 600, color: isPlatePending(record.plateNo) ? '#d48806' : '#334155' }
				}, newPlate)
			)
		);
	}

	function renderTaskSourceCell(value, record) {
		if (value === '替换车') {
			return React.createElement(Popover, {
				content: renderReplaceVehiclePopoverContent(record),
				trigger: 'hover',
				placement: 'topLeft',
				mouseEnterDelay: 0.15,
				mouseLeaveDelay: 0.1,
				destroyTooltipOnHide: true
			}, renderTaskSourceTag('替换车', '#ea580c'));
		}
		if (value === '交车任务') return renderTaskSourceTag('交车任务', '#2563eb');
		return value || '-';
	}

	function renderVehicleInfoCell(record) {
		var pending = isPlatePending(record.plateNo);
		var plateStyle = Object.assign({}, cellLineMainStyle, { cursor: 'pointer' }, pending ? { color: '#d48806', fontWeight: 500 } : { color: '#165dff' });
		return React.createElement('div', null,
			React.createElement('div', {
				style: plateStyle,
				role: 'button',
				tabIndex: 0,
				onClick: function () { openViewDrawer(record); },
				onKeyDown: function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openViewDrawer(record); } }
			}, displayPlateNo(record.plateNo)),
			React.createElement('div', { style: cellLineSubStyle }, displayBrandModel(record.brand, record.model)),
			React.createElement('div', { style: cellLineSubStyle }, displayVin(record.vin, record.plateNo))
		);
	}

	// 列表列（按车辆一行；待处理/历史记录列顺序一致）
	var colDeliveryTime = { title: '完成交车时间', key: 'completedDeliveryTime', width: 118, render: function (_, r) { return renderCompletedDeliveryTimeCell(r); } };
	var colDeliveryPerson = { title: '交车人', dataIndex: 'deliveryPerson', key: 'deliveryPerson', width: 80, render: function (v) { return v || '-'; } };
	var colDeliveryStatus = { title: '交车状态', dataIndex: 'deliveryStatus', key: 'deliveryStatus', width: 108, render: function (v, r) { return renderDeliveryStatus(v, r); } };
	var sharedListColumns = useMemo(function () {
		return [
		{
			title: '车辆信息',
			key: 'vehicleInfo',
			width: 188,
			render: function (_, r) { return renderVehicleInfoCell(r); }
		},
		{
			title: renderResizableTitle('合同信息', 'contractInfo'),
			key: 'contractInfo',
			width: colWidths.contractInfo,
			render: function (_, r) { return renderContractInfoCell(r); }
		},
		{
			title: '业务负责人',
			key: 'businessInfo',
			width: 120,
			render: function (_, r) {
				return renderCellLines(r.businessDept, [r.businessOwner]);
			}
		},
		{ title: '任务来源', dataIndex: 'taskSource', key: 'taskSource', width: 92, ellipsis: true, render: function (v, r) { return renderTaskSourceCell(v, r); } },
		{ title: '交车地点', key: 'deliveryPlace', width: 168, render: function (_, r) { return renderDeliveryPlaceCell(r); } },
		colDeliveryStatus,
		colDeliveryTime,
		colDeliveryPerson,
		{ title: '是否归还', key: 'vehicleReturned', width: 88, render: function (_, r) { return renderVehicleReturnedCell(r); } },
		{
			title: '交车记录',
			key: 'deliveryRecord',
			width: 118,
			render: function (_, r) { return renderDeliveryRecordCell(r); }
		},
		{ title: '交车任务创建时间', key: 'taskCreateTime', width: 150, ellipsis: true, render: function (_, r) { return renderTaskCreateTimeCell(r); } },
		{ title: '交车任务创建人', dataIndex: 'createBy', key: 'taskCreateBy', width: 108, ellipsis: true, render: function (v) { return renderTaskCreateByCell(v); } }
	];
	}, [colWidths.contractInfo, handleColumnResizeStart, navigateToContractDetail]);

	var listColumns = useMemo(function () {
		return sharedListColumns.concat([
		{
			title: '操作', key: 'action', width: 96, fixed: 'right', render: function (_, r) {
				var nodes = [
					React.createElement(Button, { key: 'view', type: 'link', size: 'small', onClick: function () { openViewDrawer(r); } }, '查看')
				];
				if (canEditDeliveryRow(r)) {
					nodes.push(React.createElement(Button, { key: 'edit', type: 'link', size: 'small', onClick: function () { openEditDrawer(r); } }, '编辑'));
				}
				return React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'nowrap' } }, nodes);
			}
		}
	]);
	}, [sharedListColumns, openEditDrawer, openViewDrawer]);

	var kpiCards = useMemo(function () {
		return [
			{ key: 'total', type: 'total', title: '全部交车任务', desc: '当前筛选条件下的全部交车任务（含进行中与已完成）', val: kpiStats.total, icon: DV_KPI_ICONS.total },
			{ key: 'inProgress', type: 'progress', title: '进行中的交车任务', desc: '交车状态为「未开始」「已保存」「待客户签章」的任务（客户未完成最终签章）', val: kpiStats.inProgress, icon: DV_KPI_ICONS.progress },
			{ key: 'completed', type: 'completed', title: '已完成的交车任务', desc: '客户已完成最终签章步骤的所有交车任务（状态为「客户已签章」）', val: kpiStats.completed, icon: DV_KPI_ICONS.completed }
		];
	}, [kpiStats]);

	function renderKpiCard(card) {
		var active = kpiFilter === card.key;
		return React.createElement('div', {
			key: card.key,
			role: 'button',
			tabIndex: 0,
			className: 'lc-alert-card lc-alert-card--' + card.type + ' lc-alert-card-clickable' + (active ? ' lc-alert-card-active' : ''),
			onClick: function () { handleKpiCardClick(card.key); },
			onKeyDown: function (e) {
				if (e.key === 'Enter' || e.key === ' ') {
					e.preventDefault();
					handleKpiCardClick(card.key);
				}
			}
		},
			React.createElement('div', { className: 'lc-alert-card-tip-anchor' },
				React.createElement(Tooltip, { title: card.desc, placement: 'topRight', overlayStyle: { maxWidth: 360 } },
					React.createElement('span', {
						className: 'lc-alert-card-tip',
						role: 'img',
						'aria-label': card.title + '说明',
						onClick: function (e) { e.stopPropagation(); },
						onMouseDown: function (e) { e.stopPropagation(); }
					}, DV_KPI_TIP_SVG)
				)
			),
			React.createElement('div', { className: 'lc-alert-card-icon' }, card.icon),
			React.createElement('div', { className: 'lc-alert-card-main' },
				React.createElement('div', { className: 'lc-alert-card-val' }, card.val),
				React.createElement('div', { className: 'lc-alert-card-title' }, card.title)
			)
		);
	}

	var tablePagination = useMemo(function () {
		return {
			current: page,
			pageSize: pageSize,
			total: totalCount,
			showSizeChanger: true,
			showTotal: function (t) { return '共 ' + t + ' 条'; },
			pageSizeOptions: ['10', '20', '50'],
			onChange: function (p, size) { setPage(p); if (size !== pageSize) setPageSize(size); }
		};
	}, [page, pageSize, totalCount]);

	var filterLabelStyle = { display: 'block', marginBottom: 4, color: '#333', fontSize: 14 };
	var filterControlStyle = { width: '100%' };
	var filterItemStyle = { minWidth: 0 };

	var styles = {
		page: { padding: '16px 24px 48px', backgroundColor: '#f5f5f5', minHeight: '100vh', fontSize: 14 },
		breadcrumb: { marginBottom: 16, color: '#666' },
		breadcrumbSep: { margin: '0 8px', color: '#999' },
		card: { backgroundColor: '#fff', borderRadius: 8, marginBottom: 16, boxShadow: '0 1px 2px rgba(0,0,0,0.05)', overflow: 'hidden' },
		cardBody: { padding: '20px 24px' },
		filterGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '16px 24px', alignItems: 'start' },
		filterActions: { display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 8, marginTop: 16, paddingTop: 16, borderTop: '1px solid #f1f5f9' }
	};

	var filterItems = [
		React.createElement('div', { key: 'plateNos', style: filterItemStyle },
			React.createElement('div', { style: filterLabelStyle }, '车辆'),
			React.createElement(Popover, {
				open: multiPlateOpen,
				onOpenChange: handleMultiPlateOpenChange,
				trigger: 'click',
				placement: 'bottomLeft',
				overlayClassName: 'lc-multi-plate-popover',
				content: React.createElement('div', { className: 'lc-multi-plate-pop' },
					React.createElement('div', { className: 'lc-multi-plate-pop-hint' },
						'支持多辆车车牌号、车辆识别代码，每行一条；可从 Excel 等批量复制粘贴，点击「确定」后于筛选区点击「搜索」生效。'
					),
					React.createElement(Input.TextArea, {
						value: multiPlateDraft,
						onChange: function (e) { setMultiPlateDraft(e.target.value); },
						placeholder: '浙F80088\n粤AGP4598\nLNBSCPKB9RR223402',
						autoSize: { minRows: 5, maxRows: 10 },
						style: { borderRadius: 8, fontFamily: 'monospace', fontSize: 13 }
					}),
					React.createElement('div', { className: 'lc-multi-plate-pop-actions' },
						React.createElement(Button, { size: 'small', onClick: handleMultiPlateClear }, '清空'),
						React.createElement(Button, { size: 'small', type: 'primary', onClick: handleMultiPlateApply }, '确定')
					)
				)
			},
				React.createElement(Input, {
					className: 'lc-multi-plate-trigger',
					readOnly: true,
					allowClear: !!vehicleFilterTriggerText,
					placeholder: '支持多辆车车牌号、车辆识别代码，每行一条',
					value: vehicleFilterTriggerText,
					onClick: function () { setMultiPlateOpen(true); },
					onClear: function (e) {
						if (e && e.stopPropagation) e.stopPropagation();
						handleMultiPlateClear();
					},
					style: Object.assign({ borderRadius: 8 }, filterControlStyle),
					suffix: React.createElement('svg', {
						width: 14, height: 14, viewBox: '0 0 24 24', fill: 'none', stroke: '#94a3b8', strokeWidth: 2,
						style: { pointerEvents: 'none' }
					}, React.createElement('polyline', { points: '6 9 12 15 18 9' }))
				})
			)
		),
		React.createElement('div', { key: 'contractCode', style: filterItemStyle },
			React.createElement('div', { style: filterLabelStyle }, '合同编号'),
						React.createElement(Select, {
				placeholder: '请输入或选择合同编号',
							allowClear: true,
							showSearch: true,
							optionFilterProp: 'label',
				style: filterControlStyle,
							value: filters.contractCode,
				onChange: function (v) { setFilters(function (f) { return patchFilters(f, { contractCode: v }); }); },
							options: contractCodeOptions
						})
					),
		React.createElement('div', { key: 'projectName', style: filterItemStyle },
			React.createElement('div', { style: filterLabelStyle }, '项目名称'),
						React.createElement(Select, {
							placeholder: '请输入或选择项目名称',
							allowClear: true,
							showSearch: true,
							optionFilterProp: 'label',
				style: filterControlStyle,
							value: filters.projectName,
				onChange: function (v) { setFilters(function (f) { return patchFilters(f, { projectName: v }); }); },
							options: projectNameOptions
						})
					),
		React.createElement('div', { key: 'customerName', style: filterItemStyle },
			React.createElement('div', { style: filterLabelStyle }, '客户名称'),
						React.createElement(Select, {
							placeholder: '请输入或选择客户名称',
							allowClear: true,
							showSearch: true,
							optionFilterProp: 'label',
				style: filterControlStyle,
							value: filters.customerName,
				onChange: function (v) { setFilters(function (f) { return patchFilters(f, { customerName: v }); }); },
							options: customerNameOptions
						})
					),
		React.createElement('div', { key: 'deliveryRegion', style: filterItemStyle },
			React.createElement('div', { style: filterLabelStyle }, '交车区域'),
						React.createElement(Cascader, {
							options: regionOptions,
							placeholder: '请选择省-市',
							allowClear: true,
				style: filterControlStyle,
							value: deliveryRegionValue,
							onChange: function (value) {
								var s;
								if (value && value.length >= 2) {
									var prov = regionOptions.find(function (r) { return r.value === value[0]; });
									var city = prov && prov.children && prov.children.find(function (c) { return c.value === value[1]; });
									s = prov && city ? prov.label + '-' + city.label : undefined;
								} else { s = undefined; }
					setFilters(function (f) { return patchFilters(f, { deliveryRegion: s }); });
							},
							displayRender: function (labels) { return labels && labels.length ? labels.join(' / ') : ''; }
						})
					),
		React.createElement('div', { key: 'completedTime', style: filterItemStyle },
			React.createElement('div', { style: filterLabelStyle }, '完成交车时间'),
						React.createElement(RangePicker, {
				style: filterControlStyle,
				placeholder: ['请选择开始时间', '请选择结束时间'],
							value: dateRangeValue,
							onChange: onDateRangeChange
						})
					),
		React.createElement('div', { key: 'deliveryPerson', style: filterItemStyle },
			React.createElement('div', { style: filterLabelStyle }, '交车人'),
						React.createElement(Select, {
				placeholder: '请输入或选择交车人',
							allowClear: true,
							showSearch: true,
							optionFilterProp: 'label',
				style: filterControlStyle,
							value: filters.deliveryPerson,
				onChange: function (v) { setFilters(function (f) { return patchFilters(f, { deliveryPerson: v }); }); },
							options: deliveryPersonOptions
						})
		),
		React.createElement('div', { key: 'vin', style: filterItemStyle },
			React.createElement('div', { style: filterLabelStyle }, '车辆识别代码'),
			React.createElement(Select, {
				placeholder: '请输入或选择车辆识别代码',
				allowClear: true,
				showSearch: true,
				style: filterControlStyle,
				value: filters.vin,
				onChange: function (v) { setFilters(function (f) { return patchFilters(f, { vin: v }); }); },
				options: dynamicFilterOptions.vinOptions,
				filterOption: filterSelectOption
			})
		),
		React.createElement('div', { key: 'vehicleType', style: filterItemStyle },
			React.createElement('div', { style: filterLabelStyle }, '车辆类型'),
			React.createElement(Select, {
				placeholder: '请选择车辆类型',
				allowClear: true,
				showSearch: true,
				style: filterControlStyle,
				value: filters.vehicleType,
				onChange: function (v) { setFilters(function (f) { return patchFilters(f, { vehicleType: v }); }); },
				options: dynamicFilterOptions.vehicleTypeOptions,
				filterOption: filterSelectOption
			})
		),
		React.createElement('div', { key: 'brand', style: filterItemStyle },
			React.createElement('div', { style: filterLabelStyle }, '品牌'),
			React.createElement(Select, {
				placeholder: '请选择品牌',
				allowClear: true,
				showSearch: true,
				style: filterControlStyle,
				value: filters.brand,
				onChange: function (v) { setFilters(function (f) { return patchFilters(f, { brand: v }); }); },
				options: dynamicFilterOptions.brandOptions,
				filterOption: filterSelectOption
			})
		),
		React.createElement('div', { key: 'model', style: filterItemStyle },
			React.createElement('div', { style: filterLabelStyle }, '型号'),
			React.createElement(Select, {
				placeholder: '请选择或输入型号',
				allowClear: true,
				showSearch: true,
				style: filterControlStyle,
				value: filters.model,
				onChange: function (v) { setFilters(function (f) { return patchFilters(f, { model: v }); }); },
				options: dynamicFilterOptions.modelOptions,
				filterOption: filterSelectOption
			})
		),
		React.createElement('div', { key: 'businessDept', style: filterItemStyle },
			React.createElement('div', { style: filterLabelStyle }, '业务部门'),
			React.createElement(Select, {
				placeholder: '请输入或选择业务部门',
				allowClear: true,
				showSearch: true,
				style: filterControlStyle,
				value: filters.businessDept,
				onChange: function (v) { setFilters(function (f) { return patchFilters(f, { businessDept: v }); }); },
				options: dynamicFilterOptions.businessDeptOptions,
				filterOption: filterSelectOption
			})
		),
		React.createElement('div', { key: 'businessOwner', style: filterItemStyle },
			React.createElement('div', { style: filterLabelStyle }, '业务负责人'),
			React.createElement(Select, {
				placeholder: '请输入或选择业务负责人',
				allowClear: true,
				showSearch: true,
				style: filterControlStyle,
				value: filters.businessOwner,
				onChange: function (v) { setFilters(function (f) { return patchFilters(f, { businessOwner: v }); }); },
				options: dynamicFilterOptions.businessOwnerOptions,
				filterOption: filterSelectOption
			})
		),
		React.createElement('div', { key: 'taskSource', style: filterItemStyle },
			React.createElement('div', { style: filterLabelStyle }, '任务来源'),
			React.createElement(Select, {
				placeholder: '请选择任务来源',
				allowClear: true,
				style: filterControlStyle,
				value: filters.taskSource,
				onChange: function (v) { setFilters(function (f) { return patchFilters(f, { taskSource: v }); }); },
				options: taskSourceOptions
			})
		),
		React.createElement('div', { key: 'bizType', style: filterItemStyle },
			React.createElement('div', { style: filterLabelStyle }, '业务类型'),
			React.createElement(Select, {
				placeholder: '请选择业务类型',
				allowClear: true,
				style: filterControlStyle,
				value: filters.bizType,
				onChange: function (v) { setFilters(function (f) { return patchFilters(f, { bizType: v }); }); },
				options: bizTypeOptions
			})
		),
		React.createElement('div', { key: 'isDelayed', style: filterItemStyle },
			React.createElement('div', { style: filterLabelStyle }, '是否延期'),
			React.createElement(Select, {
				placeholder: '请选择是否延期',
				allowClear: true,
				style: filterControlStyle,
				value: filters.isDelayed,
				onChange: function (v) { setFilters(function (f) { return patchFilters(f, { isDelayed: v }); }); },
				options: isDelayedOptions
			})
		)
	];

	var filterVisibleCount = filterExpanded ? filterItems.length : 4;
	var filterNodes = [];
	var fi;
	for (fi = 0; fi < filterVisibleCount && fi < filterItems.length; fi++) {
		filterNodes.push(filterItems[fi]);
	}

	var breadcrumbItems = [
		{ title: '运维管理' },
		{ title: '车辆业务' },
		{ title: '交车管理' }
	];

	return React.createElement('div', { style: styles.page },
		React.createElement('style', null, DV_KPI_STYLE),
		React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 } },
			React.createElement(Breadcrumb, { items: breadcrumbItems }),
			React.createElement(Button, {
				type: 'default',
				style: { borderRadius: 8, border: '1px solid #cbd5e1', fontWeight: 600, color: '#475569' },
				onClick: function () { setRequirementModalOpen(true); }
			}, '查看需求说明')
		),
		React.createElement(Card, { style: { marginBottom: 16 } },
			React.createElement('div', { style: styles.cardBody },
				React.createElement('div', { style: styles.filterGrid }, filterNodes),
				React.createElement('div', { style: styles.filterActions },
					React.createElement(Button, { onClick: handleReset }, '重置'),
					React.createElement(Button, { type: 'primary', onClick: handleQuery }, '搜索'),
					React.createElement(Button, {
						type: 'link',
						size: 'small',
						onClick: function () { setFilterExpanded(!filterExpanded); },
						style: { display: 'inline-flex', alignItems: 'center', gap: 4, padding: '0 4px' }
					},
						filterExpanded ? '收起' : '展开',
						React.createElement('svg', {
							width: 12,
							height: 12,
							viewBox: '0 0 24 24',
							fill: 'none',
							stroke: 'currentColor',
							strokeWidth: 2,
							strokeLinecap: 'round',
							strokeLinejoin: 'round',
							style: { transform: filterExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease' }
						}, React.createElement('polyline', { points: '6 9 12 15 18 9' }))
					)
				)
			)
		),
		React.createElement(Card, null,
			React.createElement('div', { style: styles.cardBody },
				React.createElement('div', { className: 'dv-kpi-stats-row' }, kpiCards.map(renderKpiCard)),
				React.createElement('div', { style: { display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 12 } },
					React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' } },
						React.createElement('span', { style: { fontSize: 13, color: '#64748b' } },
							'当前标签：',
							React.createElement('span', { style: { color: '#334155', fontWeight: 600 } }, kpiExportLabelMap[kpiFilter] || '-'),
							' · 导出与列表一致（含筛选，全部命中行）'
						),
						React.createElement(Button, { onClick: handleExport }, '导出')
					)
				),
				React.createElement(Table, {
					columns: listColumns,
					dataSource: displayList,
							rowKey: 'id',
							pagination: tablePagination,
					tableLayout: 'fixed',
					scroll: { x: 1760 },
							size: 'middle'
						})
			)
		),
		React.createElement(Modal, {
			title: '交车管理 — 说明文档',
			open: requirementModalOpen[0],
			onCancel: function () { setRequirementModalOpen(false); },
			footer: null,
			width: 880,
			centered: true,
			destroyOnClose: true
		}, React.createElement(Tabs, {
			defaultActiveKey: 'prd',
			size: 'small',
			items: requirementModalItems
		})),
		React.createElement(DeliveryEditDrawer, {
			open: editDrawer.open,
			record: editDrawer.record,
			mode: editDrawer.mode,
			onClose: closeEditDrawer,
			onSave: handleEditSave,
			onSubmit: handleEditSubmit
		})
	);
};

if (typeof window !== 'undefined') {
	window.Component = Component;
	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', function () {
			var rootEl = document.getElementById('root');
			if (rootEl && window.ReactDOM && window.React) {
				var root = ReactDOM.createRoot(rootEl);
				root.render(React.createElement(Component));
			}
		});
	} else {
		var rootEl = document.getElementById('root');
		if (rootEl && window.ReactDOM && window.React) {
			var root = ReactDOM.createRoot(rootEl);
			root.render(React.createElement(Component));
		}
	}
}
