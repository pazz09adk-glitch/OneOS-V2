// 【重要】必须使用 const Component 作为组件变量名
// 采购管理 - 三方退租车管理（审批完成后按车辆生成退车任务）

var ONEOS_ANT_TABLE_GLOBAL_FIX = [
	'.ant-table-container .ant-table-header { margin-bottom: 0 !important; }',
	'.ant-table-container .ant-table-body { margin-top: 0 !important; }',
	'.ant-table-container .ant-table-body > table, .ant-table-content table { margin-top: 0 !important; }',
	'.ant-table-tbody > tr.ant-table-measure-row, .ant-table-tbody > tr.ant-table-measure-row > td, .ant-table-tbody > tr.ant-table-measure-row > th { display: none !important; height: 0 !important; max-height: 0 !important; min-height: 0 !important; padding: 0 !important; margin: 0 !important; border: none !important; line-height: 0 !important; font-size: 0 !important; overflow: hidden !important; visibility: hidden !important; pointer-events: none !important; }'
];

var TRM_KPI_STYLE = ''
	+ '.trm-kpi-stats-row{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;margin-bottom:16px;}'
	+ '@media (max-width:768px){.trm-kpi-stats-row{grid-template-columns:repeat(1,minmax(0,1fr));}}'
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
	+ '.lc-alert-card--completed .lc-alert-card-icon{background:#d1fae5;color:#10b981;}'
	+ '.lc-alert-card--completed .lc-alert-card-val{color:#047857;}'
	+ '.lc-alert-card-clickable{cursor:pointer;transition:box-shadow .2s ease,border-color .2s ease,transform .2s ease;}'
	+ '.lc-alert-card-clickable:hover{box-shadow:0 4px 14px rgba(15,23,42,.08);}'
	+ '.lc-alert-card-active{box-shadow:0 0 0 2px rgba(22,93,255,.2)!important;border-color:#165dff!important;}';

var TRM_KPI_ICONS = {
	total: React.createElement('svg', { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' },
		React.createElement('rect', { x: 3, y: 3, width: 7, height: 7 }), React.createElement('rect', { x: 14, y: 3, width: 7, height: 7 }),
		React.createElement('rect', { x: 14, y: 14, width: 7, height: 7 }), React.createElement('rect', { x: 3, y: 14, width: 7, height: 7 })),
	progress: React.createElement('svg', { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' },
		React.createElement('circle', { cx: 12, cy: 12, r: 10 }), React.createElement('polyline', { points: '12 6 12 12 16 14' })),
	completed: React.createElement('svg', { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' },
		React.createElement('path', { d: 'M22 11.08V12a10 10 0 1 1-5.93-9.14' }), React.createElement('polyline', { points: '22 4 12 14.01 9 11.01' }))
};

var TRM_KPI_TIP_SVG = React.createElement('svg', { width: 12, height: 12, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2.2, strokeLinecap: 'round', strokeLinejoin: 'round' },
	React.createElement('circle', { cx: 12, cy: 12, r: 10 }), React.createElement('line', { x1: 12, y1: 16, x2: 12, y2: 12 }), React.createElement('line', { x1: 12, y1: 8, x2: 12.01, y2: 8 }));

var PAGE_STYLE = ONEOS_ANT_TABLE_GLOBAL_FIX.concat([
	'.trm-page{--trm-primary:#165dff;--trm-accent:#10b981;--trm-bg:#f5f5f5;--trm-surface:#fff;--trm-text:#0f172a;--trm-muted:#64748b;--trm-line:#e2e8f0;font-family:"PingFang SC","Microsoft YaHei",system-ui,sans-serif;color:var(--trm-text)}',
	'.trm-page .trm-table-card .ant-table-tbody>tr:not(.ant-table-measure-row)>td{padding:12px 14px!important;vertical-align:middle!important}',
	'.trm-page .trm-table-card .ant-table-thead>tr>th{background:#f8fafc!important;font-weight:600!important}',
	'.trm-drawer-summary{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px 16px;padding:16px;border-radius:12px;background:linear-gradient(135deg,#ecfdf5 0%,#eff6ff 55%,#fff 100%);border:1px solid #bbf7d0;margin-bottom:16px}',
	'@media(max-width:768px){.trm-drawer-summary{grid-template-columns:1fr}}',
	'.trm-drawer-summary__item{min-width:0}',
	'.trm-drawer-summary__label{font-size:12px;color:#64748b;margin-bottom:4px}',
	'.trm-drawer-summary__val{font-size:14px;font-weight:600;color:#0f172a;word-break:break-all}',
	'.trm-section{margin-bottom:16px;background:#fff;border-radius:12px;border:1px solid var(--trm-line);overflow:hidden}',
	'.trm-section__head{padding:14px 16px;border-bottom:1px solid #f1f5f9;font-size:14px;font-weight:700;color:#0f172a;display:flex;align-items:center;gap:8px}',
	'.trm-section__head-bar{width:3px;height:14px;border-radius:2px;background:var(--trm-accent);flex-shrink:0}',
	'.trm-section__body{padding:16px}',
	'.trm-photo-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}',
	'@media(max-width:900px){.trm-photo-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}',
	'@media(max-width:560px){.trm-photo-grid{grid-template-columns:1fr}}',
	'.trm-photo-slot{border:1px solid #e2e8f0;border-radius:10px;padding:12px;background:#fafbfc;min-width:0}',
	'.trm-photo-slot__label{font-size:13px;font-weight:600;color:#475569;margin-bottom:8px}',
	'.trm-photo-multi{border:1px solid #e2e8f0;border-radius:10px;padding:12px;background:#fafbfc;min-width:0}',
	'.trm-photo-multi__label{font-size:13px;font-weight:700;color:#334155;margin-bottom:10px;display:flex;align-items:center;gap:8px}',
	'.trm-photo-multi__label-bar{width:3px;height:14px;border-radius:2px;background:var(--trm-accent);flex-shrink:0}',
	'.trm-photo-multi__hint{font-size:12px;color:#94a3b8;margin-top:8px;line-height:1.5}',
	'.trm-plate{font-weight:700;font-variant-numeric:tabular-nums;color:#0f172a}',
	'.trm-biz-no{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:13px;font-weight:600;color:var(--trm-primary)}'
]).join('\n');

/** 对齐小羚羚 DV_INSPECTION_SECTIONS */
var TRM_INSPECTION_TIRE_CATEGORY = '轮胎检查';
var TRM_INSPECTION_SECTIONS = [
	{ category: '证件信息', items: ['行驶证', '营运证', '加氢证', 'ETC设备', 'ETC卡', '前后车牌照', '通行证', 'GPS设备(服务中)'] },
	{ category: '工具信息', items: ['钥匙', '备胎', '三角木', '千斤顶', '工具包', '三角警示牌', '灭火器', '其他'] },
	{ category: '外观检查', items: ['检查玻璃无划痕、破裂', '检查座椅无划痕、破损', '检查车身漆面无划痕、变形', '检查货箱反光贴完好', '检查货箱防撞块完好', '检查所有灯光完好', '检查冷机工作(如有)', '车辆清洗', '其他'] },
	{ category: TRM_INSPECTION_TIRE_CATEGORY, items: ['左前 (1轴)', '左后内 (2轴)', '左后外 (2轴)', '右前 (1轴)', '右后内 (2轴)', '右后外 (2轴)'], tread: true }
];

var TRM_VEHICLE_PHOTO_SLOTS = {
	vehicle: ['仪表盘', '车辆正前', '车辆左前方', '车辆左后方', '车辆右前方', '车辆右后方'],
	chassis: ['正前方位底部', '左侧前方底部', '左侧后方底部', '正后方位底部', '右侧前方底部', '右侧后方底部'],
	tire: ['左前', '右前', '左后内', '左后外', '右后内', '右后外']
};

var TRM_CREDENTIAL_PHOTO_SLOTS = ['行驶证主页', '行驶证副页', '营运证', '加氢证'];

var TRM_TASK_STATUS_OPTIONS = [
	{ value: '待办理', label: '待办理' },
	{ value: '已保存', label: '已保存' },
	{ value: '已完成', label: '已完成' }
];

var TRM_TASK_STATUS_COLOR = {
	'待办理': 'default',
	'已保存': 'processing',
	'已完成': 'success'
};

var TRM_REGION_OPTIONS = [
	{ value: 'zhejiang', label: '浙江省', children: [{ value: 'hangzhou', label: '杭州市' }, { value: 'ningbo', label: '宁波市' }, { value: 'jiaxing', label: '嘉兴市' }, { value: 'huzhou', label: '湖州市' }] },
	{ value: 'shanghai', label: '上海市', children: [{ value: 'shanghai', label: '上海市' }] },
	{ value: 'guangdong', label: '广东省', children: [{ value: 'guangzhou', label: '广州市' }, { value: 'shenzhen', label: '深圳市' }, { value: 'dongguan', label: '东莞市' }] }
];

var CURRENT_USER = '张明辉';

function trmIsTireCategory(category) {
	return category === TRM_INSPECTION_TIRE_CATEGORY;
}

function trmBuildInspectionList() {
	var list = [];
	var tireIdx = 0;
	TRM_INSPECTION_SECTIONS.forEach(function (section, ci) {
		(section.items || []).forEach(function (item, ji) {
			var isTire = !!section.tread;
			list.push({
				key: 'ins-' + ci + '-' + ji,
				category: section.category,
				item: item,
				checked: item === '检查冷机工作(如有)' ? false : true,
				treadDepth: isTire ? '' : '',
				remark: ''
			});
			if (isTire) tireIdx++;
		});
	});
	return list;
}

function trmCreateEmptyPhotos() {
	var photos = { vehicle: {}, chassis: {}, tire: {}, credential: {}, defect: [], other: [] };
	Object.keys(TRM_VEHICLE_PHOTO_SLOTS).forEach(function (groupKey) {
		photos[groupKey] = {};
		TRM_VEHICLE_PHOTO_SLOTS[groupKey].forEach(function (slot) {
			photos[groupKey][slot] = [];
		});
	});
	TRM_CREDENTIAL_PHOTO_SLOTS.forEach(function (slot) {
		photos.credential[slot] = [];
	});
	return photos;
}

function trmNormalizePhotos(raw) {
	var base = trmCreateEmptyPhotos();
	if (!raw || typeof raw !== 'object') return base;
	Object.keys(TRM_VEHICLE_PHOTO_SLOTS).forEach(function (groupKey) {
		var group = raw[groupKey];
		if (group && typeof group === 'object' && !Array.isArray(group)) {
			TRM_VEHICLE_PHOTO_SLOTS[groupKey].forEach(function (slot) {
				base[groupKey][slot] = Array.isArray(group[slot]) ? group[slot].slice() : [];
			});
		}
	});
	if (raw.credential && typeof raw.credential === 'object') {
		TRM_CREDENTIAL_PHOTO_SLOTS.forEach(function (slot) {
			base.credential[slot] = Array.isArray(raw.credential[slot]) ? raw.credential[slot].slice() : [];
		});
	}
	base.defect = Array.isArray(raw.defect) ? raw.defect.slice() : [];
	base.other = Array.isArray(raw.other) ? raw.other.slice() : [];
	return base;
}

function trmCreateEmptyExecution() {
	return {
		faultRepaired: null,
		inspectionList: trmBuildInspectionList(),
		photos: trmCreateEmptyPhotos()
	};
}

function trmFormatNow() {
	var d = new Date();
	function pad(n) { return n < 10 ? '0' + n : String(n); }
	return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) + ' '
		+ pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds());
}

function trmBuildSeedApprovedApp() {
	return {
		id: 'tr4',
		bizNo: 'TR-2026-004',
		expectedReturnDate: '2026-02-20',
		lessorName: '嘉兴某某物流有限公司',
		lesseeId: 'ln_jx',
		lesseeName: '羚牛运营（嘉兴）',
		deliveryRegion: ['zhejiang', 'jiaxing'],
		deliveryRegionText: '浙江省-嘉兴市',
		returnStaff: ['张明辉', '刘念念', '金可鹏'],
		vehicles: [
			{ id: 'v6', plateNo: '浙F80088', vehicleStatus: '库存', stockSubStatus: '可运营', vin: 'LKLG7C4E4NA774701', brand: '苏龙', model: '海格牌18吨双飞翼货车', depositPaid: '20000.00', returnSettlementAmount: '18500.00', companySettlementAmount: '16800.00' }
		],
		vehicleCount: 1,
		approvalStatus: '审批完成',
		currentApprover: '—',
		creator: '采购-王丽',
		createTime: '2026-02-18 16:45:00',
		settlementRemark: '车辆外观良好，按合同约定退车结算。'
	};
}

function trmBuildTaskFromAppVehicle(app, vehicle) {
	return {
		id: 'trt-' + app.id + '-' + vehicle.id,
		applicationId: app.id,
		vehicleRowId: vehicle.id,
		bizNo: app.bizNo,
		lessorName: app.lessorName,
		lesseeName: app.lesseeName || '',
		lesseeId: app.lesseeId,
		returnRegion: app.deliveryRegionText || '',
		expectedReturnDate: app.expectedReturnDate,
		returnStaff: (app.returnStaff || []).slice(),
		plateNo: vehicle.plateNo,
		brand: vehicle.brand,
		model: vehicle.model,
		vin: vehicle.vin,
		returnLocation: app.deliveryRegionText || '',
		taskStatus: '待办理',
		returnPerson: '',
		completedTime: '',
		execution: null
	};
}

var TASKS_KEY = 'oneos_tri_return_tasks_v1';
var APPLY_KEY = 'oneos_tri_rent_apply_v1';

function loadTasks() {
	if (typeof localStorage === 'undefined') return [];
	try {
		var raw = localStorage.getItem(TASKS_KEY);
		return raw ? JSON.parse(raw) : [];
	} catch (e) { return []; }
}

function saveTasks(tasks) {
	if (typeof localStorage === 'undefined') return;
	try { localStorage.setItem(TASKS_KEY, JSON.stringify(tasks || [])); } catch (e) { /* noop */ }
}

function loadApplications() {
	if (typeof localStorage === 'undefined') return [];
	try {
		var raw = localStorage.getItem(APPLY_KEY);
		return raw ? JSON.parse(raw) : [];
	} catch (e) { return []; }
}

function saveApplications(apps) {
	if (typeof localStorage === 'undefined') return;
	try { localStorage.setItem(APPLY_KEY, JSON.stringify(apps || [])); } catch (e) { /* noop */ }
}

function spawnTasksFromApplication(app) {
	if (!app || app.approvalStatus !== '审批完成') return [];
	var tasks = loadTasks();
	var idMap = {};
	tasks.forEach(function (t) { idMap[t.id] = true; });
	var spawned = [];
	(app.vehicles || []).forEach(function (vehicle) {
		if (!vehicle || !vehicle.id) return;
		var taskId = 'trt-' + app.id + '-' + vehicle.id;
		if (idMap[taskId]) return;
		var task = trmBuildTaskFromAppVehicle(app, vehicle);
		tasks.push(task);
		spawned.push(task);
		idMap[taskId] = true;
	});
	if (spawned.length) saveTasks(tasks);
	return spawned;
}

function syncTasksFromApplications(apps) {
	var all = [];
	(apps || []).forEach(function (app) {
		var s = spawnTasksFromApplication(app);
		all = all.concat(s);
	});
	return all;
}

if (typeof window !== 'undefined') {
	window.ONEOS_TRI_RETURN = {
		TASKS_KEY: TASKS_KEY,
		APPLY_KEY: APPLY_KEY,
		loadTasks: loadTasks,
		saveTasks: saveTasks,
		loadApplications: loadApplications,
		saveApplications: saveApplications,
		spawnTasksFromApplication: spawnTasksFromApplication,
		syncTasksFromApplications: syncTasksFromApplications
	};
}

function ReturnTaskEditDrawer(props) {
	var useState = React.useState;
	var useMemo = React.useMemo;
	var useRef = React.useRef;
	var useEffect = React.useEffect;
	var useCallback = React.useCallback;

	var open = props.open;
	var record = props.record;
	var readOnly = props.readOnly === true || props.mode === 'view';
	var onClose = props.onClose;
	var onSave = props.onSave;
	var onSubmit = props.onSubmit;

	var antd = window.antd;
	var Drawer = antd.Drawer;
	var Button = antd.Button;
	var Input = antd.Input;
	var Switch = antd.Switch;
	var Table = antd.Table;
	var Upload = antd.Upload;
	var Modal = antd.Modal;
	var message = antd.message;

	var execState = useState(trmCreateEmptyExecution);
	var execution = execState[0];
	var setExecution = execState[1];
	var submittingState = useState(false);
	var submitting = submittingState[0];
	var setSubmitting = submittingState[1];
	var previewState = useState({ open: false, url: '', title: '' });
	var preview = previewState[0];
	var setPreview = previewState[1];

	var inspectionListRef = useRef(null);
	inspectionListRef.current = execution.inspectionList;

	useEffect(function () {
		if (!open || !record) return;
		var exec = record.execution ? JSON.parse(JSON.stringify(record.execution)) : trmCreateEmptyExecution();
		if (!exec.inspectionList || !exec.inspectionList.length) exec.inspectionList = trmBuildInspectionList();
		exec.photos = trmNormalizePhotos(exec.photos);
		setExecution(exec);
	}, [open, record && record.id]);

	function RequiredLabel(text) {
		return React.createElement('span', { style: { display: 'inline-flex', alignItems: 'center', gap: 4 } },
			React.createElement('span', { style: { color: '#ef4444', fontWeight: 600 } }, '*'),
			React.createElement('span', null, text)
		);
	}

	function patchExecution(patch) {
		setExecution(function (prev) { return Object.assign({}, prev, patch); });
	}

	function updateInspectionRow(key, patch) {
		setExecution(function (prev) {
			return Object.assign({}, prev, {
				inspectionList: (prev.inspectionList || []).map(function (r) {
					return r.key === key ? Object.assign({}, r, patch) : r;
				})
			});
		});
	}

	function fileToDataUrl(file, cb) {
		try {
			var reader = new FileReader();
			reader.onload = function (e) { cb(null, (e && e.target && e.target.result) || ''); };
			reader.onerror = function () { cb(new Error('read')); };
			reader.readAsDataURL(file);
		} catch (e) { cb(e); }
	}

	function trmUploadButton() {
		return React.createElement('div', { style: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#64748b' } },
			React.createElement('span', { style: { fontSize: 22, lineHeight: 1 } }, '+'),
			React.createElement('span', { style: { fontSize: 12, marginTop: 4 } }, '上传')
		);
	}

	function trmValidatePhotoFile(file) {
		if (!file) return '无效文件';
		if (file.size > 5 * 1024 * 1024) return '单张不超过 5MB';
		var type = String(file.type || '').toLowerCase();
		if (type && type.indexOf('image/') !== 0) return '请上传图片文件';
		return '';
	}

	function makeUploadProps(groupKey, slotKey) {
		var value = groupKey === 'defect' || groupKey === 'other'
			? ((execution.photos || {})[groupKey] || [])
			: ((((execution.photos || {})[groupKey] || {})[slotKey]) || []);
		if (!Array.isArray(value)) value = [];
		var isMulti = groupKey === 'defect' || groupKey === 'other';
		return {
			listType: 'picture-card',
			fileList: value,
			disabled: readOnly,
			accept: 'image/jpeg,image/jpg,image/png,image/gif,image/webp',
			multiple: isMulti,
			beforeUpload: function (file) {
				var err = trmValidatePhotoFile(file);
				if (err) { message.error(err); return Upload.LIST_IGNORE; }
				fileToDataUrl(file, function (readErr, url) {
					if (readErr) { message.error('上传失败'); return; }
					setExecution(function (prev) {
						var photos = trmNormalizePhotos(prev.photos);
						var current = isMulti
							? (photos[groupKey] || [])
							: ((((photos[groupKey] || {})[slotKey]) || []));
						var next = current.slice();
						next.push({ uid: String(Date.now()) + '-' + Math.random().toFixed(4), name: file.name || 'image.jpg', status: 'done', url: url });
						if (!isMulti && next.length > 1) next = next.slice(next.length - 1);
						if (isMulti) {
							photos[groupKey] = next;
						} else {
							if (!photos[groupKey]) photos[groupKey] = {};
							photos[groupKey][slotKey] = next;
						}
						return Object.assign({}, prev, { photos: photos });
					});
				});
				return false;
			},
			onRemove: function (file) {
				setExecution(function (prev) {
					var photos = trmNormalizePhotos(prev.photos);
					var current = isMulti
						? (photos[groupKey] || [])
						: ((((photos[groupKey] || {})[slotKey]) || []));
					var next = current.filter(function (f) { return f.uid !== file.uid; });
					if (isMulti) {
						photos[groupKey] = next;
					} else {
						if (!photos[groupKey]) photos[groupKey] = {};
						photos[groupKey][slotKey] = next;
					}
					return Object.assign({}, prev, { photos: photos });
				});
			},
			onPreview: function (file) {
				setPreview({ open: true, url: file.url || file.thumbUrl, title: file.name || slotKey || groupKey });
			}
		};
	}

	function validateSubmit() {
		if (execution.faultRepaired === null || execution.faultRepaired === undefined) {
			return '请确认车辆故障是否修复';
		}
		var list = execution.inspectionList || [];
		for (var i = 0; i < list.length; i++) {
			var row = list[i];
			if (trmIsTireCategory(row.category) && !String(row.treadDepth || '').trim()) {
				return '请填写' + row.item + '胎纹深度';
			}
		}
		var photoGroups = [
			{ key: 'vehicle', label: '车辆', slots: TRM_VEHICLE_PHOTO_SLOTS.vehicle },
			{ key: 'chassis', label: '底盘', slots: TRM_VEHICLE_PHOTO_SLOTS.chassis },
			{ key: 'tire', label: '轮胎', slots: TRM_VEHICLE_PHOTO_SLOTS.tire }
		];
		for (var gi = 0; gi < photoGroups.length; gi++) {
			var pg = photoGroups[gi];
			for (var si = 0; si < pg.slots.length; si++) {
				var slot = pg.slots[si];
				var files = (((execution.photos || {})[pg.key] || {})[slot]) || [];
				if (!files.length) return '请上传' + pg.label + '照片：' + slot;
			}
		}
		for (var ci = 0; ci < TRM_CREDENTIAL_PHOTO_SLOTS.length; ci++) {
			var credSlot = TRM_CREDENTIAL_PHOTO_SLOTS[ci];
			var credFiles = (((execution.photos || {}).credential || {})[credSlot]) || [];
			if (!credFiles.length) return '请上传车辆证件照片：' + credSlot;
		}
		return '';
	}

	function buildExecutionPayload() {
		return JSON.parse(JSON.stringify(execution));
	}

	function handleSaveClick() {
		onSave && onSave(buildExecutionPayload());
		message.success('已保存');
	}

	function handleSubmitClick() {
		var err = validateSubmit();
		if (err) { message.error(err); return; }
		Modal.confirm({
			title: '确认提交退车',
			content: '请确认三方退车检查与照片均已填写完整，提交后任务将标记为已完成。',
			okText: '确认提交',
			cancelText: '取消',
			onOk: function () {
				setSubmitting(true);
				setTimeout(function () {
					setSubmitting(false);
					onSubmit && onSubmit(buildExecutionPayload());
					message.success('退车任务已完成');
					onClose && onClose();
				}, 400);
			}
		});
	}

	var inspectionColumns = useMemo(function () {
		return [
			{
				title: '类别',
				dataIndex: 'category',
				key: 'category',
				width: 120,
				render: function (text, insRecord, index) {
					var rows = inspectionListRef.current || [];
					var cat = insRecord && insRecord.category;
					if (!cat) return text;
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
			{ title: '检查项目', dataIndex: 'item', key: 'item', width: 220 },
			{
				title: '检查情况',
				key: 'checked',
				width: 180,
				render: function (_, insRecord) {
					if (trmIsTireCategory(insRecord.category)) {
						return React.createElement(Input, {
							value: insRecord.treadDepth,
							placeholder: '请输入胎纹深度',
							addonAfter: 'mm',
							disabled: readOnly,
							onChange: function (e) { updateInspectionRow(insRecord.key, { treadDepth: e.target.value }); }
						});
					}
					return React.createElement(Switch, {
						checked: !!insRecord.checked,
						disabled: readOnly,
						checkedChildren: '正常',
						unCheckedChildren: '异常',
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

	function renderPhotoGroup(title, groupKey, slots) {
		return React.createElement('div', { key: groupKey, style: { marginBottom: 16 } },
			React.createElement('div', { style: { fontSize: 13, fontWeight: 700, color: '#334155', marginBottom: 10 } }, title),
			React.createElement('div', { className: 'trm-photo-grid' },
				slots.map(function (slot) {
					var props = makeUploadProps(groupKey, slot);
					var files = props.fileList || [];
					return React.createElement('div', { key: groupKey + slot, className: 'trm-photo-slot' },
						React.createElement('div', { className: 'trm-photo-slot__label' }, slot),
						React.createElement(Upload, props,
							!readOnly && files.length < 1 ? trmUploadButton() : null
						)
					);
				})
			)
		);
	}

	function renderPhotoMultiCard(title, groupKey) {
		var props = makeUploadProps(groupKey, null);
		return React.createElement('div', { key: groupKey, className: 'trm-photo-multi', style: { marginBottom: 16 } },
			React.createElement('div', { className: 'trm-photo-multi__label' },
				React.createElement('span', { className: 'trm-photo-multi__label-bar' }),
				title
			),
			React.createElement(Upload, props, !readOnly ? trmUploadButton() : null),
			!readOnly ? React.createElement('div', { className: 'trm-photo-multi__hint' }, '可上传多张，记录车身瑕疵或其他需说明的情况') : null
		);
	}

	if (!record) return null;

	var summaryItems = [
		{ label: '申请单号', val: record.bizNo || '—' },
		{ label: '出租方', val: record.lessorName || '—' },
		{ label: '承租方', val: record.lesseeName || '—' },
		{ label: '退车区域', val: record.returnRegion || '—' },
		{ label: '预计退租时间', val: record.expectedReturnDate || '—' },
		{ label: '退车人员', val: (record.returnStaff || []).join('、') || '—' }
	];

	return React.createElement(Drawer, {
		title: readOnly ? '查看退车任务' : '办理退车任务',
		open: open,
		width: 920,
		destroyOnClose: true,
		onClose: onClose,
		footer: readOnly ? React.createElement('div', { style: { textAlign: 'right' } },
			React.createElement(Button, { onClick: onClose }, '关闭')
		) : React.createElement('div', { style: { display: 'flex', justifyContent: 'flex-end', gap: 8 } },
			React.createElement(Button, { onClick: onClose }, '取消'),
			React.createElement(Button, { onClick: handleSaveClick }, '保存'),
			React.createElement(Button, { type: 'primary', loading: submitting, onClick: handleSubmitClick, style: { background: '#10b981', borderColor: '#10b981' } }, '提交')
		)
	},
		React.createElement('div', { className: 'trm-drawer-summary' },
			summaryItems.map(function (it) {
				return React.createElement('div', { key: it.label, className: 'trm-drawer-summary__item' },
					React.createElement('div', { className: 'trm-drawer-summary__label' }, it.label),
					React.createElement('div', { className: 'trm-drawer-summary__val' }, it.val)
				);
			})
		),
		React.createElement('div', { style: { marginBottom: 12, padding: '10px 14px', borderRadius: 10, background: '#f8fafc', border: '1px solid #e2e8f0', fontSize: 13 } },
			React.createElement('span', { style: { color: '#64748b' } }, '车辆：'),
			React.createElement('span', { className: 'trm-plate', style: { marginRight: 12 } }, record.plateNo || '—'),
			React.createElement('span', { style: { color: '#64748b' } }, record.brand + ' / ' + record.model),
			React.createElement('span', { style: { color: '#94a3b8', marginLeft: 8 } }, record.vin || '')
		),
		React.createElement('div', { className: 'trm-section' },
			React.createElement('div', { className: 'trm-section__head' },
				React.createElement('span', { className: 'trm-section__head-bar' }),
				RequiredLabel('车辆故障是否修复')
			),
			React.createElement('div', { className: 'trm-section__body' },
				React.createElement(Switch, {
					checked: execution.faultRepaired === true,
					disabled: readOnly,
					checkedChildren: '已修复',
					unCheckedChildren: '未修复',
					onChange: function (v) { patchExecution({ faultRepaired: !!v }); }
				}),
				React.createElement('span', { style: { marginLeft: 12, fontSize: 13, color: '#64748b' } }, '提交前必选')
			)
		),
		React.createElement('div', { className: 'trm-section' },
			React.createElement('div', { className: 'trm-section__head' },
				React.createElement('span', { className: 'trm-section__head-bar' }),
				'三方退车检查'
			),
			React.createElement('div', { className: 'trm-section__body' },
				React.createElement(Table, {
					columns: inspectionColumns,
					dataSource: execution.inspectionList,
					rowKey: 'key',
					size: 'small',
					pagination: false,
					scroll: { x: 720 },
					bordered: true
				})
			)
		),
		React.createElement('div', { className: 'trm-section' },
			React.createElement('div', { className: 'trm-section__head' },
				React.createElement('span', { className: 'trm-section__head-bar' }),
				'车辆照片'
			),
			React.createElement('div', { className: 'trm-section__body' },
				!readOnly ? React.createElement('div', { style: { marginBottom: 12, fontSize: 12, color: '#94a3b8', lineHeight: 1.6 } },
					'照片上传说明：jpg、jpeg、png、gif、webp 格式，单张不超过 5MB，支持预览与删除'
				) : null,
				renderPhotoGroup('车辆', 'vehicle', TRM_VEHICLE_PHOTO_SLOTS.vehicle),
				renderPhotoGroup('底盘', 'chassis', TRM_VEHICLE_PHOTO_SLOTS.chassis),
				renderPhotoGroup('轮胎', 'tire', TRM_VEHICLE_PHOTO_SLOTS.tire),
				renderPhotoMultiCard('瑕疵', 'defect'),
				renderPhotoMultiCard('其他', 'other'),
				renderPhotoGroup('车辆证件', 'credential', TRM_CREDENTIAL_PHOTO_SLOTS)
			)
		),
		React.createElement(Modal, {
			open: preview.open,
			title: preview.title || '预览',
			footer: null,
			onCancel: function () { setPreview({ open: false, url: '', title: '' }); },
			width: 720,
			centered: true
		},
			preview.url ? React.createElement('img', { src: preview.url, alt: preview.title, style: { width: '100%', borderRadius: 8 } }) : null
		)
	);
}

const Component = function () {
	var useState = React.useState;
	var useMemo = React.useMemo;
	var useCallback = React.useCallback;
	var useEffect = React.useEffect;

	var antd = window.antd;
	var Card = antd.Card;
	var Button = antd.Button;
	var Input = antd.Input;
	var Select = antd.Select;
	var Table = antd.Table;
	var Tag = antd.Tag;
	var Tooltip = antd.Tooltip;
	var Cascader = antd.Cascader;
	var Breadcrumb = antd.Breadcrumb;

	function createEmptyFilters() {
		return { plateNo: '', bizNo: '', returnRegion: undefined, taskStatus: undefined };
	}

	var tasksState = useState([]);
	var tasks = tasksState[0];
	var setTasks = tasksState[1];

	var filterState = useState(createEmptyFilters);
	var filters = filterState[0];
	var setFilters = filterState[1];
	var appliedFilterState = useState(createEmptyFilters);
	var appliedFilters = appliedFilterState[0];
	var setAppliedFilters = appliedFilterState[1];

	var kpiFilterState = useState('inProgress');
	var kpiFilter = kpiFilterState[0];
	var setKpiFilter = kpiFilterState[1];

	var pageState = useState(1);
	var page = pageState[0];
	var setPage = pageState[1];
	var pageSizeState = useState(10);
	var pageSize = pageSizeState[0];
	var setPageSize = pageSizeState[1];

	var drawerState = useState({ open: false, record: null, mode: 'edit' });
	var drawer = drawerState[0];
	var setDrawer = drawerState[1];

	function refreshTasksFromStorage() {
		setTasks(loadTasks());
	}

	useEffect(function () {
		var existing = loadTasks();
		if (!existing.length) {
			var apps = loadApplications();
			if (!apps.length) {
				apps = [trmBuildSeedApprovedApp()];
				saveApplications(apps);
			}
			syncTasksFromApplications(apps.filter(function (a) { return a.approvalStatus === '审批完成'; }));
		}
		refreshTasksFromStorage();
	}, []);

	function persistTasks(nextTasks) {
		saveTasks(nextTasks);
		setTasks(nextTasks.slice());
	}

	function matchKpiFilter(row, kpi) {
		if (kpi === 'total') return true;
		if (kpi === 'inProgress') return row.taskStatus === '待办理' || row.taskStatus === '已保存';
		if (kpi === 'completed') return row.taskStatus === '已完成';
		return true;
	}

	function matchAppliedFilters(row, f) {
		if (f.plateNo && String(row.plateNo || '').indexOf(String(f.plateNo).trim()) === -1) return false;
		if (f.bizNo && String(row.bizNo || '').indexOf(String(f.bizNo).trim()) === -1) return false;
		if (f.returnRegion && row.returnRegion !== f.returnRegion) return false;
		if (f.taskStatus && row.taskStatus !== f.taskStatus) return false;
		return true;
	}

	var filteredBySearch = useMemo(function () {
		return (tasks || []).filter(function (r) { return matchAppliedFilters(r, appliedFilters); });
	}, [tasks, appliedFilters]);

	var kpiStats = useMemo(function () {
		var total = filteredBySearch.length;
		var inProgress = filteredBySearch.filter(function (r) { return matchKpiFilter(r, 'inProgress'); }).length;
		var completed = filteredBySearch.filter(function (r) { return matchKpiFilter(r, 'completed'); }).length;
		return { total: total, inProgress: inProgress, completed: completed };
	}, [filteredBySearch]);

	var displayList = useMemo(function () {
		return filteredBySearch.filter(function (r) { return matchKpiFilter(r, kpiFilter); });
	}, [filteredBySearch, kpiFilter]);

	var totalCount = displayList.length;
	var pagedList = useMemo(function () {
		var start = (page - 1) * pageSize;
		return displayList.slice(start, start + pageSize);
	}, [displayList, page, pageSize]);

	function handleKpiCardClick(key) {
		setKpiFilter(key);
		setPage(1);
	}

	function handleQuery() {
		setAppliedFilters(Object.assign({}, filters));
		setPage(1);
	}

	function handleReset() {
		var empty = createEmptyFilters();
		setFilters(empty);
		setAppliedFilters(empty);
		setPage(1);
	}

	function openEditDrawer(record) {
		setDrawer({ open: true, record: record, mode: 'edit' });
	}

	function openViewDrawer(record) {
		setDrawer({ open: true, record: record, mode: 'view' });
	}

	function closeDrawer() {
		setDrawer({ open: false, record: null, mode: 'edit' });
	}

	var handleDrawerSave = useCallback(function (execution) {
		if (!drawer.record) return;
		var recordId = drawer.record.id;
		var next = (tasks || []).map(function (t) {
			if (t.id !== recordId) return t;
			return Object.assign({}, t, { taskStatus: '已保存', execution: execution });
		});
		persistTasks(next);
		setDrawer(function (prev) {
			if (!prev.record || prev.record.id !== recordId) return prev;
			return Object.assign({}, prev, {
				record: Object.assign({}, prev.record, { taskStatus: '已保存', execution: execution })
			});
		});
	}, [drawer.record, tasks]);

	var handleDrawerSubmit = useCallback(function (execution) {
		if (!drawer.record) return;
		var recordId = drawer.record.id;
		var completedTime = trmFormatNow();
		var next = (tasks || []).map(function (t) {
			if (t.id !== recordId) return t;
			return Object.assign({}, t, {
				taskStatus: '已完成',
				returnPerson: CURRENT_USER,
				completedTime: completedTime,
				execution: execution
			});
		});
		persistTasks(next);
	}, [drawer.record, tasks]);

	function renderCellLines(primary, secondaryLines) {
		var lines = [primary].concat(secondaryLines || []).filter(function (x) { return x && String(x).trim(); });
		if (!lines.length) return React.createElement('span', { style: { color: '#94a3b8' } }, '—');
		return React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 2, lineHeight: 1.45 } },
			lines.map(function (line, idx) {
				return React.createElement('span', {
					key: idx,
					style: { fontSize: idx === 0 ? 13 : 12, color: idx === 0 ? '#0f172a' : '#64748b', fontWeight: idx === 0 ? 600 : 400 }
				}, line);
			})
		);
	}

	var columns = useMemo(function () {
		return [
			{
				title: '车辆信息',
				key: 'vehicle',
				width: 200,
				render: function (_, r) {
					return renderCellLines(r.plateNo, [((r.brand || '') + ' / ' + (r.model || '')).replace(/^ \/ | \/ $/g, ''), r.vin]);
				}
			},
			{
				title: '采购申请信息',
				key: 'apply',
				width: 220,
				render: function (_, r) {
					return React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 2, lineHeight: 1.45 } },
						React.createElement('span', { className: 'trm-biz-no' }, r.bizNo || '—'),
						React.createElement('span', { style: { fontSize: 12, color: '#64748b' } }, r.lessorName || '—'),
						React.createElement('span', { style: { fontSize: 12, color: '#64748b' } }, r.lesseeName || '—')
					);
				}
			},
			{ title: '预计退租时间', dataIndex: 'expectedReturnDate', key: 'expectedReturnDate', width: 120 },
			{ title: '退车地点', dataIndex: 'returnLocation', key: 'returnLocation', width: 140, ellipsis: true },
			{
				title: '任务状态',
				dataIndex: 'taskStatus',
				key: 'taskStatus',
				width: 96,
				render: function (v) {
					return React.createElement(Tag, { color: TRM_TASK_STATUS_COLOR[v] || 'default', style: { margin: 0 } }, v || '—');
				}
			},
			{
				title: '退车人',
				dataIndex: 'returnPerson',
				key: 'returnPerson',
				width: 88,
				render: function (v) { return v || '—'; }
			},
			{
				title: '完成时间',
				dataIndex: 'completedTime',
				key: 'completedTime',
				width: 160,
				render: function (v) { return v || '—'; }
			},
			{
				title: '操作',
				key: 'action',
				width: 120,
				fixed: 'right',
				render: function (_, r) {
					var nodes = [];
					if (r.taskStatus !== '已完成') {
						nodes.push(React.createElement(Button, {
							key: 'edit',
							type: 'link',
							size: 'small',
							style: { color: '#165dff', fontWeight: 600, padding: '0 4px' },
							onClick: function () { openEditDrawer(r); }
						}, '办理'));
					}
					nodes.push(React.createElement(Button, {
						key: 'view',
						type: 'link',
						size: 'small',
						style: { padding: '0 4px' },
						onClick: function () { openViewDrawer(r); }
					}, '查看'));
					return React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 2 } }, nodes);
				}
			}
		];
	}, []);

	var kpiCards = useMemo(function () {
		return [
			{ key: 'total', type: 'total', title: '全部退车任务', desc: '当前筛选条件下的全部三方退车任务', val: kpiStats.total, icon: TRM_KPI_ICONS.total },
			{ key: 'inProgress', type: 'progress', title: '进行中', desc: '任务状态为「待办理」或「已保存」的退车任务', val: kpiStats.inProgress, icon: TRM_KPI_ICONS.progress },
			{ key: 'completed', type: 'completed', title: '已完成', desc: '任务状态为「已完成」的退车任务', val: kpiStats.completed, icon: TRM_KPI_ICONS.completed }
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
					}, TRM_KPI_TIP_SVG)
				)
			),
			React.createElement('div', { className: 'lc-alert-card-icon' }, card.icon),
			React.createElement('div', { className: 'lc-alert-card-main' },
				React.createElement('div', { className: 'lc-alert-card-val' }, card.val),
				React.createElement('div', { className: 'lc-alert-card-title' }, card.title)
			)
		);
	}

	var regionCascaderValue = useMemo(function () {
		if (!filters.returnRegion) return undefined;
		var parts = String(filters.returnRegion).split('-');
		if (parts.length < 2) return undefined;
		var prov = TRM_REGION_OPTIONS.find(function (p) { return p.label === parts[0]; });
		if (!prov) return undefined;
		var city = (prov.children || []).find(function (c) { return c.label === parts[1]; });
		return city ? [prov.value, city.value] : undefined;
	}, [filters.returnRegion]);

	var filterLabelStyle = { display: 'block', marginBottom: 4, color: '#333', fontSize: 14, fontWeight: 600 };
	var filterControlStyle = { width: '100%' };

	var styles = {
		page: { padding: '16px 24px 48px', backgroundColor: '#f5f5f5', minHeight: '100vh', fontSize: 14 },
		filterGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '16px 24px', alignItems: 'start' },
		filterActions: { display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 8, marginTop: 16, paddingTop: 16, borderTop: '1px solid #f1f5f9' },
		cardBody: { padding: '20px 24px' }
	};

	return React.createElement('div', { className: 'trm-page', style: styles.page },
		React.createElement('style', null, TRM_KPI_STYLE),
		React.createElement('style', null, PAGE_STYLE),
		React.createElement('div', { style: { marginBottom: 16 } },
			React.createElement(Breadcrumb, { items: [{ title: '采购管理' }, { title: '三方退租车管理' }] })
		),
		React.createElement('div', { style: { marginBottom: 16 } },
			React.createElement('h1', { style: { margin: 0, fontSize: 22, fontWeight: 700, color: '#0f172a' } }, '三方退租车管理'),
			React.createElement('p', { style: { margin: '6px 0 0', fontSize: 14, color: '#64748b' } },
				'三方退租申请审批完成后，按车辆自动生成退车办理任务；当前操作人：', CURRENT_USER
			)
		),
		React.createElement(Card, { style: { marginBottom: 16 } },
			React.createElement('div', { style: styles.cardBody },
				React.createElement('div', { style: styles.filterGrid },
					React.createElement('div', null,
						React.createElement('div', { style: filterLabelStyle }, '车牌'),
						React.createElement(Input, {
							placeholder: '请输入车牌号',
							allowClear: true,
							style: filterControlStyle,
							value: filters.plateNo,
							onChange: function (e) { setFilters(function (f) { return Object.assign({}, f, { plateNo: e.target.value }); }); }
						})
					),
					React.createElement('div', null,
						React.createElement('div', { style: filterLabelStyle }, '申请单号'),
						React.createElement(Input, {
							placeholder: '请输入申请单号',
							allowClear: true,
							style: filterControlStyle,
							value: filters.bizNo,
							onChange: function (e) { setFilters(function (f) { return Object.assign({}, f, { bizNo: e.target.value }); }); }
						})
					),
					React.createElement('div', null,
						React.createElement('div', { style: filterLabelStyle }, '退车区域'),
						React.createElement(Cascader, {
							options: TRM_REGION_OPTIONS,
							placeholder: '请选择省-市',
							allowClear: true,
							style: filterControlStyle,
							value: regionCascaderValue,
							onChange: function (value) {
								var regionText;
								if (value && value.length >= 2) {
									var prov = TRM_REGION_OPTIONS.find(function (r) { return r.value === value[0]; });
									var city = prov && prov.children && prov.children.find(function (c) { return c.value === value[1]; });
									regionText = prov && city ? prov.label + '-' + city.label : undefined;
								} else {
									regionText = undefined;
								}
								setFilters(function (f) { return Object.assign({}, f, { returnRegion: regionText }); });
							},
							displayRender: function (labels) { return labels && labels.length ? labels.join(' / ') : ''; }
						})
					),
					React.createElement('div', null,
						React.createElement('div', { style: filterLabelStyle }, '任务状态'),
						React.createElement(Select, {
							placeholder: '请选择任务状态',
							allowClear: true,
							style: filterControlStyle,
							value: filters.taskStatus,
							onChange: function (v) { setFilters(function (f) { return Object.assign({}, f, { taskStatus: v }); }); },
							options: TRM_TASK_STATUS_OPTIONS
						})
					)
				),
				React.createElement('div', { style: styles.filterActions },
					React.createElement(Button, { onClick: handleReset }, '重置'),
					React.createElement(Button, { type: 'primary', onClick: handleQuery, style: { background: '#165dff' } }, '搜索')
				)
			)
		),
		React.createElement(Card, { className: 'trm-table-card' },
			React.createElement('div', { style: styles.cardBody },
				React.createElement('div', { className: 'trm-kpi-stats-row' }, kpiCards.map(renderKpiCard)),
				React.createElement(Table, {
					columns: columns,
					dataSource: pagedList,
					rowKey: 'id',
					size: 'middle',
					tableLayout: 'fixed',
					scroll: { x: 1200 },
					pagination: {
						current: page,
						pageSize: pageSize,
						total: totalCount,
						showSizeChanger: true,
						showTotal: function (t) { return '共 ' + t + ' 条'; },
						pageSizeOptions: ['10', '20', '50'],
						onChange: function (p, size) { setPage(p); if (size !== pageSize) setPageSize(size); }
					}
				})
			)
		),
		React.createElement(ReturnTaskEditDrawer, {
			open: drawer.open,
			record: drawer.record,
			mode: drawer.mode,
			readOnly: drawer.mode === 'view',
			onClose: closeDrawer,
			onSave: handleDrawerSave,
			onSubmit: handleDrawerSubmit
		})
	);
};

if (typeof window !== 'undefined') window.Component = Component;
