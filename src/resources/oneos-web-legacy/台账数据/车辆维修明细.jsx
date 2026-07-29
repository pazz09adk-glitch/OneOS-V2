// 【重要】必须使用 const Component 作为组件变量名
// 台账数据 - 车辆维修/保养明细（运维手动录入；提报人/类型多选筛选；确认提交后锁定，主管可编辑）
// 原型：保存/确认提交、表格内联编辑；联调后对接登录用户、角色与车辆清单接口

const Component = function () {
	var useState = React.useState;
	var useMemo = React.useMemo;
	var useCallback = React.useCallback;
	var useRef = React.useRef;

	var antd = window.antd;
	var App = antd.App;
	var Breadcrumb = antd.Breadcrumb;
	var Card = antd.Card;
	var Button = antd.Button;
	var Table = antd.Table;
	var Select = antd.Select;
	var DatePicker = antd.DatePicker;
	var Input = antd.Input;
	var InputNumber = antd.InputNumber;
	var Row = antd.Row;
	var Col = antd.Col;
	var Space = antd.Space;
	var Tag = antd.Tag;
	var Popconfirm = antd.Popconfirm;
	var Popover = antd.Popover;
	var Tooltip = antd.Tooltip;
	var Dropdown = antd.Dropdown;
	var Modal = antd.Modal;
	var message = antd.message;

	var CURRENT_USER = { id: 'u_zhang', name: '张运维', role: 'staff' };

	var SUBMIT_CONFIRM_TEXT = '提交后数据将无法修改，如需修改请联系运维主管进行修改';

	var RECORD_TYPE_OPTIONS = [
		{ value: '维修', label: '维修' },
		{ value: '保养', label: '保养' }
	];

	var CHANGE_LOG_FIELD_LABELS = {
		repairDate: '进修日期',
		plateNo: '车牌号',
		recordType: '类型',
		itemDesc: '项目/材料',
		laborUnit: '人工费单位',
		laborQty: '人工费数量',
		laborUnitPrice: '人工费单价(含税)',
		partsUnit: '配件费单位',
		partsQty: '配件费数量',
		partsUnitPrice: '配件费单价(含税)',
		submitStatus: '提交状态',
		saveStatus: '保存状态',
		_copy: '复制新增',
		_create: '新增记录'
	};

	/**
	 * 系统全部车辆车牌（原型枚举，与车辆管理模块一致；联调后由车辆清单接口加载）
	 */
	var SYSTEM_VEHICLE_PLATES = [
		'京C12345',
		'京CN88771F',
		'京E88888',
		'京F33333',
		'京G12345',
		'京H88888',
		'川AL55602F',
		'沪A12345',
		'沪AD12345F',
		'沪B99999',
		'沪C11111',
		'沪D66666',
		'浙AD12345F',
		'浙AH55660F',
		'浙BK33210F',
		'苏EF99887F',
		'粤A11B22',
		'粤A12345',
		'粤A66D66',
		'粤A77F77',
		'粤A88K88',
		'粤A99A99',
		'粤B12345',
		'粤B22C33',
		'粤B44E44',
		'粤B55B55',
		'粤B67890',
		'粤BK33210F'
	];

	function normPlateKey(plate) {
		return String(plate == null ? '' : plate)
			.replace(/[\s\-·]/g, '')
			.toUpperCase();
	}

	function isPlateInVehicleTable(plate) {
		if (!plate) return false;
		var key = normPlateKey(plate);
		for (var i = 0; i < SYSTEM_VEHICLE_PLATES.length; i++) {
			if (normPlateKey(SYSTEM_VEHICLE_PLATES[i]) === key) return true;
		}
		return false;
	}

	function isEmptyStr(v) {
		return !String(v == null ? '' : v).trim();
	}

	function isEmptyNum(v) {
		return v === null || v === undefined || v === '';
	}

	function getRowInvalidMap(row) {
		var inv = {};
		if (!row.repairDate) inv.repairDate = true;
		if (!row.plateNo) inv.plateNo = 'empty';
		else if (!isPlateInVehicleTable(row.plateNo)) inv.plateNo = 'not_exist';
		if (isEmptyStr(row.recordType)) inv.recordType = true;
		if (isEmptyStr(row.itemDesc)) inv.itemDesc = true;
		if (isEmptyStr(row.laborUnit)) inv.laborUnit = true;
		if (isEmptyNum(row.laborQty)) inv.laborQty = true;
		if (isEmptyNum(row.laborUnitPrice)) inv.laborUnitPrice = true;
		if (isEmptyStr(row.partsUnit)) inv.partsUnit = true;
		if (isEmptyNum(row.partsQty)) inv.partsQty = true;
		if (isEmptyNum(row.partsUnitPrice)) inv.partsUnitPrice = true;
		return inv;
	}

	/** 列表展示顺序：0 已确认提交 → 1 已保存 → 2 新增未保存 */
	function rowDisplaySortTier(row) {
		if (row && row.submitStatus === 'submitted') return 0;
		if (row && row.saveStatus === 'saved') return 1;
		return 2;
	}

	function rowStatusLabel(row) {
		if (row && row.submitStatus === 'submitted') return '已提交';
		if (row && row.saveStatus === 'saved') return '已保存';
		return '待保存';
	}

	function isSavedDraftRow(row) {
		return row && row.submitStatus !== 'submitted' && row.saveStatus === 'saved';
	}

	/** 状态为「已保存」的行均在操作列展示「编辑」「删除」 */
	function canShowSavedActions(row) {
		return isSavedDraftRow(row);
	}

	/** 状态为「已提交」：仅运维主管在操作列展示「编辑」「删除」 */
	function canShowSubmittedActions(row, isSupervisorRole) {
		return !!isSupervisorRole && row && row.submitStatus === 'submitted';
	}

	function canDeleteRow(row, isSupervisorRole) {
		if (row && row.submitStatus === 'submitted') {
			return !!isSupervisorRole;
		}
		if (isSupervisorRole) return true;
		return row && row.createdBy === CURRENT_USER.id;
	}

	/** 已提交不可复制；其余本人或主管可复制 */
	function canCopyRow(row, isSupervisorRole) {
		if (!row || row.submitStatus === 'submitted') return false;
		if (isSupervisorRole) return true;
		return row.createdBy === CURRENT_USER.id;
	}

	function cloneRowTimeValue(t) {
		if (!t) return t;
		try {
			if (window.dayjs && window.dayjs.isDayjs && window.dayjs.isDayjs(t)) return t.clone();
			if (window.dayjs) {
				var d = window.dayjs(t);
				return d.isValid() ? d : t;
			}
		} catch (eClone) {}
		return t;
	}

	function buildCopiedRow(sourceRow) {
		var now = nowDayjs();
		return recalcRow({
			key: nextRowKey(),
			createdBy: CURRENT_USER.id,
			reporterName: CURRENT_USER.name,
			repairDate: cloneRowTimeValue(sourceRow.repairDate),
			plateNo: sourceRow.plateNo,
			reportTime: now,
			recordType: sourceRow.recordType,
			itemDesc: sourceRow.itemDesc || '',
			laborUnit: sourceRow.laborUnit || '',
			laborQty: sourceRow.laborQty,
			laborUnitPrice: sourceRow.laborUnitPrice,
			laborAmount: 0,
			partsUnit: sourceRow.partsUnit || '',
			partsQty: sourceRow.partsQty,
			partsUnitPrice: sourceRow.partsUnitPrice,
			partsAmount: 0,
			totalCost: 0,
			submitStatus: 'draft',
			saveStatus: 'unsaved',
			submittedAt: null
		});
	}

	function valuesEqualForLog(field, a, b) {
		if (a === b) return true;
		if ((a == null || a === '') && (b == null || b === '')) return true;
		if (field === 'repairDate' && window.dayjs) {
			try {
				return window.dayjs(a).valueOf() === window.dayjs(b).valueOf();
			} catch (eLog) {
				return false;
			}
		}
		if (
			field === 'laborQty' ||
			field === 'laborUnitPrice' ||
			field === 'partsQty' ||
			field === 'partsUnitPrice'
		) {
			if (isEmptyNum(a) && isEmptyNum(b)) return true;
			if (field === 'laborQty' || field === 'partsQty') return toIntQty(a) === toIntQty(b);
			return roundMoney(a) === roundMoney(b);
		}
		return String(a) === String(b);
	}

	function formatLogValue(field, value, rowCtx) {
		if (value == null || value === '') return '—';
		if (field === 'repairDate') return formatDate(value) || formatDateTime(value) || String(value);
		if (field === 'submitStatus') {
			if (value === 'submitted') return '已提交';
			return '未提交';
		}
		if (field === 'saveStatus') {
			if (value === 'saved') return '已保存';
			return '待保存';
		}
		if (
			field === 'laborQty' ||
			field === 'partsQty'
		) {
			return isEmptyNum(value) ? '—' : String(toIntQty(value));
		}
		if (field === 'laborUnitPrice' || field === 'partsUnitPrice') {
			return isEmptyNum(value) ? '—' : fmtMoney(value);
		}
		return String(value);
	}

	function rowTimeValue(row, field) {
		var v = row && row[field];
		if (!v || !window.dayjs) return 0;
		try {
			return window.dayjs(v).valueOf();
		} catch (e1) {
			return 0;
		}
	}

	function sortRowsWithinTier(rows) {
		return rows.slice().sort(function (a, b) {
			var ta = rowTimeValue(a, 'submittedAt') || rowTimeValue(a, 'reportTime');
			var tb = rowTimeValue(b, 'submittedAt') || rowTimeValue(b, 'reportTime');
			if (tb !== ta) return tb - ta;
			return String(a.key || '').localeCompare(String(b.key || ''));
		});
	}

	/** 分区合并，避免同层数据按日期与另一层穿插 */
	function sortRowsByDisplayTier(rows) {
		var submitted = [];
		var saved = [];
		var unsaved = [];
		(rows || []).forEach(function (r) {
			var tier = rowDisplaySortTier(r);
			if (tier === 0) submitted.push(r);
			else if (tier === 1) saved.push(r);
			else unsaved.push(r);
		});
		return sortRowsWithinTier(submitted).concat(sortRowsWithinTier(saved)).concat(sortRowsWithinTier(unsaved));
	}

	function firstInvalidMessage(row, inv, seq) {
		var prefix = '第' + seq + '行：';
		if (inv.repairDate) return prefix + '请填写进修日期';
		if (inv.plateNo === 'empty') return prefix + '请填写车牌号';
		if (inv.plateNo === 'not_exist') return prefix + '车辆不存在';
		if (inv.recordType) return prefix + '请选择类型';
		if (inv.itemDesc) return prefix + '请填写项目/材料';
		if (inv.laborUnit) return prefix + '请填写人工费单位';
		if (inv.laborQty) return prefix + '请填写人工费数量';
		if (inv.laborUnitPrice) return prefix + '请填写人工费单价（含税）';
		if (inv.partsUnit) return prefix + '请填写配件费单位';
		if (inv.partsQty) return prefix + '请填写配件费数量';
		if (inv.partsUnitPrice) return prefix + '请填写配件费单价（含税）';
		return prefix + '请完善必填项';
	}

	var OTHER_REPORTERS = [
		{ id: 'u_zhou', name: '周敏' },
		{ id: 'u_li_h', name: '李航' },
		{ id: 'u_wang', name: '王磊' }
	];

	var rowIdSeed = 0;
	function nextRowKey() {
		rowIdSeed += 1;
		return 'mr-' + Date.now() + '-' + rowIdSeed;
	}

	function filterOption(input, option) {
		var label = (option && (option.label || option.children)) || '';
		return String(label).toLowerCase().indexOf(String(input || '').toLowerCase()) >= 0;
	}

	/** 车牌号下拉：支持输入模糊匹配（忽略空格、大小写） */
	function filterPlateOption(input, option) {
		var q = normPlateKey(input);
		if (!q) return true;
		var label = normPlateKey(option && (option.label != null ? option.label : option.value));
		return label.indexOf(q) >= 0;
	}

	function numOrZero(v) {
		if (v === null || v === undefined || v === '') return 0;
		var n = Number(v);
		return isNaN(n) ? 0 : n;
	}

	function roundMoney(n) {
		return Math.round(numOrZero(n) * 100) / 100;
	}

	function toIntQty(v) {
		if (v === null || v === undefined || v === '') return 0;
		var n = Math.floor(Number(v));
		return isNaN(n) || n < 0 ? 0 : n;
	}

	function fmtMoney(n) {
		if (n === null || n === undefined || n === '') return '0.00';
		return roundMoney(n).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
	}

	function nowDayjs() {
		try {
			if (window.dayjs) return window.dayjs();
		} catch (e1) {}
		return null;
	}

	function formatDate(d) {
		if (!d || !window.dayjs) return '';
		try {
			return window.dayjs(d).format('YYYY-MM-DD');
		} catch (e2) {
			return '';
		}
	}

	function formatDateTime(d) {
		if (!d || !window.dayjs) return '';
		try {
			return window.dayjs(d).format('YYYY-MM-DD HH:mm');
		} catch (e3) {
			return '';
		}
	}

	function recalcRow(row) {
		var laborQty = toIntQty(row.laborQty);
		var partsQty = toIntQty(row.partsQty);
		var laborAmt = roundMoney(laborQty * numOrZero(row.laborUnitPrice));
		var partsAmt = roundMoney(partsQty * numOrZero(row.partsUnitPrice));
		var total = roundMoney(laborAmt + partsAmt);
		return Object.assign({}, row, {
			laborQty: laborQty,
			partsQty: partsQty,
			laborAmount: laborAmt,
			partsAmount: partsAmt,
			totalCost: total
		});
	}

	function buildEmptyRow(user) {
		var now = nowDayjs();
		return recalcRow({
			key: nextRowKey(),
			createdBy: user.id,
			reporterName: user.name,
			repairDate: now,
			plateNo: undefined,
			reportTime: now,
			recordType: undefined,
			itemDesc: '',
			laborUnit: '',
			laborQty: null,
			laborUnitPrice: null,
			laborAmount: 0,
			partsUnit: '',
			partsQty: null,
			partsUnitPrice: null,
			partsAmount: 0,
			totalCost: 0,
			submitStatus: 'draft',
			saveStatus: 'unsaved'
		});
	}

	function buildMockAllRows() {
		var plates = SYSTEM_VEHICLE_PLATES;
		var items = ['更换空压机滤芯', '制动片检修', '冷却液补充', '高压线束检查', '轮胎换位'];
		var rows = [];
		var reporters = [{ id: CURRENT_USER.id, name: CURRENT_USER.name }].concat(OTHER_REPORTERS);
		var i;
		for (i = 0; i < 8; i++) {
			var rep = reporters[i % reporters.length];
			var submitStatus = 'draft';
			var saveStatus = 'unsaved';
			if (rep.id === CURRENT_USER.id) {
				if (i < 3) {
					submitStatus = 'submitted';
					saveStatus = 'saved';
				} else if (i === 3) {
					saveStatus = 'saved';
				}
			} else {
				saveStatus = 'saved';
			}
			var laborQty = 1 + (i % 4);
			var laborPrice = 120 + i * 15;
			var partsQty = i % 2 === 0 ? 2 : 0;
			var partsPrice = 80 + i * 20;
			var d = nowDayjs();
			var repairDay = d && d.subtract ? d.subtract(i, 'day') : d;
			rows.push(
				recalcRow({
					key: 'mock-' + (i + 1),
					createdBy: rep.id,
					reporterName: rep.name,
					repairDate: repairDay,
					plateNo: plates[i % plates.length],
					reportTime: repairDay,
					recordType: i % 3 === 0 ? '保养' : '维修',
					itemDesc: items[i % items.length],
					laborUnit: '工时',
					laborQty: laborQty,
					laborUnitPrice: laborPrice,
					laborAmount: 0,
					partsUnit: '件',
					partsQty: partsQty,
					partsUnitPrice: partsPrice,
					partsAmount: 0,
					totalCost: 0,
					submitStatus: submitStatus,
					saveStatus: saveStatus,
					submittedAt: submitStatus === 'submitted' ? repairDay : null
				})
			);
		}
		return rows;
	}

	var layoutStyle = {
		padding: '16px 24px 24px',
		minHeight: '100vh',
		background: 'linear-gradient(165deg, #eef4ff 0%, #f5f7fa 42%, #f0f2f5 100%)'
	};
	var filterLabelStyle = { marginBottom: 6, fontSize: 13, color: 'rgba(0,0,0,0.55)', fontWeight: 500 };
	var filterItemStyle = { marginBottom: 12 };
	var filterControlStyle = { width: '100%' };
	var filterActionsColStyle = { flex: '0 0 auto', marginLeft: 'auto' };

	var filterCardStyle = {
		marginBottom: 20,
		borderRadius: 16,
		boxShadow: '0 4px 20px -4px rgba(16,24,40,0.03), 0 0 0 1px rgba(16,24,40,0.06)',
		border: 'none',
		background: '#ffffff'
	};

	var tableCardStyle = {
		borderRadius: 16,
		boxShadow: '0 10px 32px -4px rgba(16,24,40,0.06), 0 0 0 1px rgba(16,24,40,0.04)',
		border: 'none',
		background: '#ffffff',
		overflow: 'hidden'
	};

	var ledgerTableStyle =
		'.maint-ledger-table-wrap{border-radius:12px;overflow:hidden;box-shadow:0 4px 24px -6px rgba(15,23,42,0.05),0 0 0 1px rgba(22,119,255,0.1)}' +
		'.maint-ledger-table .ant-table-thead>tr>th,.maint-ledger-table .ant-table-thead .ant-table-cell{white-space:nowrap;color:#0f172a!important;font-weight:600!important;font-size:13px!important;' +
		'background:#e8f4fc!important;border-bottom:1px solid #bae6fd!important;border-inline-end:1px solid #dbeafe!important;padding:0 8px!important;height:38px!important;text-align:center!important}' +
		'.maint-ledger-table .ant-table-thead>tr:not(:last-child)>th{border-bottom:1px solid #bae6fd!important}' +
		'.maint-repair-date-picker,.maint-repair-date-picker .ant-picker-input{width:100%;min-width:132px}' +
		'.maint-repair-date-picker .ant-picker-input>input{min-width:118px}' +
		'.maint-ledger-table .ant-table-tbody>tr:not(.ant-table-measure-row)>td{padding:4px 6px!important;vertical-align:middle!important}' +
		'.maint-ledger-table .ant-table-tbody>tr.maint-row-data:hover>td{background:#f0f9ff!important}' +
		'.maint-ledger-table .ant-table-summary>tr>td{font-weight:700;background:#f8fafc!important;color:#0f172a!important;border-top:2px solid #cbd5e1!important;padding:0 8px!important;height:38px!important}' +
		'.maint-cell-readonly{color:#64748b;background:#f8fafc}' +
		'.maint-inline-input{width:100%}' +
		'.maint-row-tier-0>td{background:#f8fafc!important}' +
		'.maint-row-tier-1>td{background:#fff!important}' +
		'.maint-row-tier-2>td{background:#fffbeb!important}' +
		'.maint-row-tier-boundary>td{border-top:2px solid #7dd3fc!important}' +
		'.maint-action-icon-btn{display:inline-flex;align-items:center;justify-content:center;width:22px;height:22px;border-radius:4px;cursor:pointer;color:rgba(15,23,42,0.55);transition:background .15s,color .15s}' +
		'.maint-action-icon-btn:hover{background:#f0f9ff;color:#1677ff}' +
		'.maint-action-icon-btn.maint-action-icon-danger:hover{background:#fff1f0;color:#ff4d4f}' +
		'.maint-action-icon-btn.is-disabled{color:rgba(15,23,42,0.25);cursor:not-allowed;pointer-events:none}' +
		'.maint-row-more-btn.maint-action-icon-btn:hover{background:#f5f5f5;color:rgba(15,23,42,0.75)}';

	var rowsState = useState(buildMockAllRows);
	var allRows = rowsState[0];
	var setAllRows = rowsState[1];

	var vehiclePlateOptions = useMemo(function () {
		return SYSTEM_VEHICLE_PLATES.map(function (p) {
			return { value: p, label: p };
		});
	}, []);

	var plateDraftState = useState(undefined);
	var plateDraft = plateDraftState[0];
	var setPlateDraft = plateDraftState[1];

	/** 提报人多选：空数组表示全部 */
	var reporterDraftState = useState([]);
	var reporterDraft = reporterDraftState[0];
	var setReporterDraft = reporterDraftState[1];

	var dateRangeDraftState = useState(null);
	var dateRangeDraft = dateRangeDraftState[0];
	var setDateRangeDraft = dateRangeDraftState[1];

	/** 类型多选：空数组表示全部（保养、维修） */
	var typeDraftState = useState([]);
	var typeDraft = typeDraftState[0];
	var setTypeDraft = typeDraftState[1];

	var plateAppliedState = useState(undefined);
	var plateApplied = plateAppliedState[0];
	var setPlateApplied = plateAppliedState[1];

	var reporterAppliedState = useState([]);
	var reporterApplied = reporterAppliedState[0];
	var setReporterApplied = reporterAppliedState[1];

	var dateRangeAppliedState = useState(null);
	var dateRangeApplied = dateRangeAppliedState[0];
	var setDateRangeApplied = dateRangeAppliedState[1];

	var typeAppliedState = useState([]);
	var typeApplied = typeAppliedState[0];
	var setTypeApplied = typeAppliedState[1];

	/** 联调后由账号权限判断是否运维主管 */
	var isSupervisor = false;
	var editingKeysState = useState([]);
	var editingKeys = editingKeysState[0];
	var setEditingKeys = editingKeysState[1];

	var rowInvalidState = useState({});
	var rowInvalid = rowInvalidState[0];
	var setRowInvalid = rowInvalidState[1];

	var changeLogsByKeyState = useState({});
	var changeLogsByKey = changeLogsByKeyState[0];
	var setChangeLogsByKey = changeLogsByKeyState[1];

	var changeLogModalState = useState({ open: false, rowKey: null, rowLabel: '' });
	var changeLogModal = changeLogModalState[0];
	var setChangeLogModal = changeLogModalState[1];

	var changeLogsSeededRef = useRef(false);

	var appendChangeLog = useCallback(function (rowKey, field, before, after, rowCtx, meta) {
		if (!rowKey) return;
		meta = meta || {};
		var fieldLabel = meta.fieldLabel || CHANGE_LOG_FIELD_LABELS[field] || field;
		var beforeText = meta.beforeText != null ? meta.beforeText : formatLogValue(field, before, rowCtx);
		var afterText = meta.afterText != null ? meta.afterText : formatLogValue(field, after, rowCtx);
		if (!meta.force && beforeText === afterText) return;
		setChangeLogsByKey(function (prev) {
			var list = (prev[rowKey] || []).slice();
			list.unshift({
				id: 'clog-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8),
				at: nowDayjs(),
				userId: CURRENT_USER.id,
				userName: CURRENT_USER.name,
				field: field,
				fieldLabel: fieldLabel,
				before: beforeText,
				after: afterText
			});
			var next = Object.assign({}, prev);
			next[rowKey] = list;
			return next;
		});
	}, []);

	var openChangeLogModal = useCallback(function (record) {
		if (!record) return;
		var label = (record.plateNo || '') + (record.repairDate ? ' · ' + formatDate(record.repairDate) : '');
		setChangeLogModal({
			open: true,
			rowKey: record.key,
			rowLabel: label.trim()
		});
	}, []);

	var closeChangeLogModal = useCallback(function () {
		setChangeLogModal({ open: false, rowKey: null, rowLabel: '' });
	}, []);

	var copyPopoverKeyState = useState(null);
	var copyPopoverKey = copyPopoverKeyState[0];
	var setCopyPopoverKey = copyPopoverKeyState[1];
	var copyRowCountState = useState(1);
	var copyRowCount = copyRowCountState[0];
	var setCopyRowCount = copyRowCountState[1];

	var applyCopyRows = useCallback(function (sourceKey, count) {
		var n = Math.floor(Number(count));
		if (!isFinite(n) || n < 1) {
			message.warning('请输入大于0的复制行数');
			return;
		}
		if (n > 100) {
			message.warning('单次最多复制100行');
			return;
		}
		var didCopy = false;
		setAllRows(function (prev) {
			var source = null;
			var i;
			for (i = 0; i < prev.length; i++) {
				if (prev[i].key === sourceKey) {
					source = prev[i];
					break;
				}
			}
			if (!source || !canCopyRow(source, isSupervisor)) return prev;
			var copies = [];
			for (i = 0; i < n; i++) {
				copies.push(buildCopiedRow(source));
			}
			var ci;
			var sourceLabel = (source.plateNo || '当前行') + (source.itemDesc ? ' · ' + source.itemDesc : '');
			for (ci = 0; ci < copies.length; ci++) {
				appendChangeLog(copies[ci].key, '_copy', null, null, source, {
					fieldLabel: '复制新增',
					beforeText: '—',
					afterText: '复制自「' + sourceLabel + '」',
					force: true
				});
			}
			didCopy = true;
			return prev.concat(copies);
		});
		setCopyPopoverKey(null);
		if (didCopy) message.success('已复制 ' + n + ' 行');
		else message.warning('无法复制该条记录');
	}, [appendChangeLog, isSupervisor]);

	var latestRefs = useRef({});
	latestRefs.current = {
		setAllRows: setAllRows,
		setEditingKeys: setEditingKeys,
		setRowInvalid: setRowInvalid,
		editingKeys: editingKeys,
		rowInvalid: rowInvalid,
		isSupervisor: isSupervisor,
		vehicleOptions: vehiclePlateOptions,
		appendChangeLog: appendChangeLog
	};

	React.useEffect(function () {
		if (changeLogsSeededRef.current) return;
		changeLogsSeededRef.current = true;
		var demoAt = nowDayjs();
		var demoAt2 = demoAt && demoAt.subtract ? demoAt.subtract(2, 'hour') : demoAt;
		setChangeLogsByKey({
			'mock-1': [
				{
					id: 'clog-demo-2',
					at: demoAt,
					userId: CURRENT_USER.id,
					userName: CURRENT_USER.name,
					field: 'itemDesc',
					fieldLabel: '项目/材料',
					before: '更换空压机滤芯',
					after: '制动片检修'
				},
				{
					id: 'clog-demo-1',
					at: demoAt2,
					userId: CURRENT_USER.id,
					userName: CURRENT_USER.name,
					field: 'recordType',
					fieldLabel: '类型',
					before: '维修',
					after: '保养'
				}
			]
		});
	}, []);

	var isRowSubmitted = useCallback(function (row) {
		return row && row.submitStatus === 'submitted';
	}, []);

	var isRowSaved = useCallback(function (row) {
		return row && row.saveStatus === 'saved';
	}, []);

	/** 是否可编辑单元格：未保存草稿直接编辑；已保存需点「编辑」；已提交仅运维主管点「编辑」后可改 */
	var canEditRow = useCallback(
		function (row) {
			if (!row) return false;
			if (isRowSubmitted(row)) {
				if (!isSupervisor) return false;
				return editingKeys.indexOf(row.key) >= 0;
			}
			if (isSavedDraftRow(row)) {
				if (isSupervisor) return editingKeys.indexOf(row.key) >= 0;
				if (row.createdBy !== CURRENT_USER.id) return false;
				return editingKeys.indexOf(row.key) >= 0;
			}
			if (isSupervisor) return false;
			if (row.createdBy !== CURRENT_USER.id) return false;
			return true;
		},
		[isSupervisor, editingKeys, isRowSubmitted]
	);

	var visibleRows = useMemo(function () {
		var list = allRows.slice();
		if (plateApplied) {
			list = list.filter(function (r) { return r.plateNo === plateApplied; });
		}
		if (reporterApplied && reporterApplied.length > 0) {
			list = list.filter(function (r) { return reporterApplied.indexOf(r.reporterName) >= 0; });
		}
		if (typeApplied && typeApplied.length > 0) {
			list = list.filter(function (r) { return typeApplied.indexOf(r.recordType) >= 0; });
		}
		if (dateRangeApplied && dateRangeApplied[0] && dateRangeApplied[1] && window.dayjs) {
			var start = window.dayjs(dateRangeApplied[0]).startOf('day');
			var end = window.dayjs(dateRangeApplied[1]).endOf('day');
			list = list.filter(function (r) {
				if (!r.repairDate) return false;
				var d = window.dayjs(r.repairDate);
				return d.isAfter(start.subtract(1, 'ms')) && d.isBefore(end.add(1, 'ms'));
			});
		}
		list = sortRowsByDisplayTier(list);
		return list.map(function (r, idx) {
			return Object.assign({}, r, { seq: idx + 1, displayTier: rowDisplaySortTier(r) });
		});
	}, [allRows, plateApplied, reporterApplied, typeApplied, dateRangeApplied]);

	/** 合计行仅汇总三个人含税金额字段 */
	var totals = useMemo(function () {
		return visibleRows.reduce(
			function (acc, r) {
				acc.laborAmount += numOrZero(r.laborAmount);
				acc.partsAmount += numOrZero(r.partsAmount);
				acc.totalCost += numOrZero(r.totalCost);
				return acc;
			},
			{ laborAmount: 0, partsAmount: 0, totalCost: 0 }
		);
	}, [visibleRows]);

	var reporterOptions = useMemo(function () {
		var names = {};
		names[CURRENT_USER.name] = true;
		OTHER_REPORTERS.forEach(function (rep) {
			if (rep.name) names[rep.name] = true;
		});
		allRows.forEach(function (r) {
			if (r.reporterName) names[r.reporterName] = true;
		});
		return Object.keys(names).map(function (n) { return { value: n, label: n }; });
	}, [allRows]);

	var updateRow = useCallback(function (key, patch) {
		setAllRows(function (prev) {
			return prev.map(function (r) {
				if (r.key !== key) return r;
				return recalcRow(Object.assign({}, r, patch));
			});
		});
	}, []);

	var addRow = useCallback(function () {
		var row = buildEmptyRow(CURRENT_USER);
		appendChangeLog(row.key, '_create', null, null, row, {
			fieldLabel: '新增记录',
			beforeText: '—',
			afterText: '新增空白行',
			force: true
		});
		setAllRows(function (prev) {
			return prev.concat([row]);
		});
		message.success('已新增一行，请填写维修/保养信息');
	}, [appendChangeLog]);

	var handleQuery = useCallback(function () {
		setPlateApplied(plateDraft);
		setReporterApplied(reporterDraft);
		setTypeApplied(typeDraft);
		setDateRangeApplied(dateRangeDraft);
		message.success('查询成功');
	}, [plateDraft, reporterDraft, typeDraft, dateRangeDraft]);

	var handleReset = useCallback(function () {
		setPlateDraft(undefined);
		setReporterDraft([]);
		setTypeDraft([]);
		setDateRangeDraft(null);
		setPlateApplied(undefined);
		setReporterApplied([]);
		setTypeApplied([]);
		setDateRangeApplied(null);
	}, []);

	function validateMaintainableRows(rows) {
		var allInvalid = {};
		var firstMsg = '';
		(rows || []).forEach(function (r, idx) {
			var inv = getRowInvalidMap(r);
			if (Object.keys(inv).length > 0) {
				allInvalid[r.key] = inv;
				if (!firstMsg) firstMsg = firstInvalidMessage(r, inv, r.seq || idx + 1);
			}
		});
		if (firstMsg) {
			setRowInvalid(allInvalid);
			message.warning(firstMsg);
			return false;
		}
		setRowInvalid({});
		return true;
	}

	var pendingSubmitRows = useMemo(function () {
		return allRows.filter(function (r) {
			return r.createdBy === CURRENT_USER.id && r.submitStatus !== 'submitted' && r.saveStatus === 'saved';
		});
	}, [allRows]);

	var handleSave = useCallback(function () {
		var toSave = allRows.filter(function (r) {
			return r.createdBy === CURRENT_USER.id && r.submitStatus !== 'submitted';
		});
		if (!toSave.length) {
			message.info('暂无待保存的草稿记录');
			return;
		}
		if (!validateMaintainableRows(toSave)) return;
		setAllRows(function (prev) {
			return prev.map(function (r) {
				if (r.createdBy === CURRENT_USER.id && r.submitStatus !== 'submitted') {
					return Object.assign({}, r, { saveStatus: 'saved' });
				}
				return r;
			});
		});
		setEditingKeys([]);
		message.success('保存成功（原型）');
	}, [allRows]);

	var handleConfirmSubmit = useCallback(function () {
		if (isSupervisor) {
			message.info('运维主管无需提交，请使用编辑修改已提交记录');
			return;
		}
		if (!pendingSubmitRows.length) {
			var hasUnsaved = allRows.some(function (r) {
				return r.createdBy === CURRENT_USER.id && r.submitStatus !== 'submitted' && r.saveStatus !== 'saved';
			});
			message.info(hasUnsaved ? '请先保存后再确认提交' : '暂无待提交的已保存记录');
			return;
		}
		if (!validateMaintainableRows(pendingSubmitRows)) return;
		Modal.confirm({
			title: '确认提交',
			content: SUBMIT_CONFIRM_TEXT,
			okText: '确认',
			cancelText: '取消',
			onOk: function () {
				setAllRows(function (prev) {
					return prev.map(function (r) {
						if (r.createdBy === CURRENT_USER.id && r.submitStatus !== 'submitted' && r.saveStatus === 'saved') {
							if (!valuesEqualForLog('submitStatus', r.submitStatus, 'submitted')) {
								appendChangeLog(r.key, 'submitStatus', r.submitStatus, 'submitted', r, { force: true });
							}
							return Object.assign({}, r, {
								submitStatus: 'submitted',
								saveStatus: 'saved',
								submittedAt: nowDayjs()
							});
						}
						return r;
					});
				});
				setEditingKeys([]);
				message.success('提交成功，数据已锁定');
			}
		});
	}, [isSupervisor, pendingSubmitRows, allRows, appendChangeLog]);

	var cellInputStyle = { width: '100%' };
	var cellNumStyle = { width: '100%' };

	var columns = useMemo(function () {
		function patch(key, field, val) {
			var ref = latestRefs.current;
			var patchObj = {};
			patchObj[field] = val;
			ref.setAllRows(function (prev) {
				return prev.map(function (r) {
					if (r.key !== key) return r;
					var next = recalcRow(Object.assign({}, r, patchObj));
					if (ref.appendChangeLog && !valuesEqualForLog(field, r[field], val)) {
						ref.appendChangeLog(key, field, r[field], val, next);
					}
					return next;
				});
			});
			ref.setRowInvalid(function (prev) {
				if (!prev || !prev[key] || !prev[key][field]) return prev;
				var next = Object.assign({}, prev);
				var rowInv = Object.assign({}, next[key]);
				delete rowInv[field];
				if (Object.keys(rowInv).length === 0) {
					delete next[key];
				} else {
					next[key] = rowInv;
				}
				return next;
			});
		}

		function readOnlyCell(v, align) {
			return React.createElement(
				'div',
				{
					className: 'maint-cell-readonly',
					style: { padding: '4px 8px', textAlign: align || 'center' }
				},
				v === 0 || v === '0' ? v : v || '-'
			);
		}

		function fieldInvalid(record, field) {
			var ref = latestRefs.current;
			var rowInv = (ref.rowInvalid && ref.rowInvalid[record.key]) || {};
			return rowInv[field];
		}

		function reqTitle(text) {
			return React.createElement(
				'span',
				null,
				React.createElement('span', { style: { color: '#ff4d4f', marginRight: 2 } }, '*'),
				text
			);
		}

		return [
			{
				title: '序号',
				dataIndex: 'seq',
				key: 'seq',
				width: 56,
				align: 'center',
				fixed: 'left'
			},
			{
				title: '状态',
				dataIndex: 'displayTier',
				key: 'recordStatus',
				width: 76,
				align: 'center',
				fixed: 'left',
				render: function (_, record) {
					var label = rowStatusLabel(record);
					var color = label === '已提交' ? 'blue' : label === '已保存' ? 'orange' : 'default';
					return React.createElement(Tag, { color: color, style: { margin: 0 } }, label);
				}
			},
			{
				title: reqTitle('进修日期'),
				dataIndex: 'repairDate',
				key: 'repairDate',
				width: 152,
				align: 'center',
				render: function (v, record) {
					if (!canEditRow(record)) return readOnlyCell(formatDate(v));
					return React.createElement(DatePicker, {
						className: 'maint-repair-date-picker',
						style: { width: '100%', minWidth: 132 },
						format: 'YYYY-MM-DD',
						placeholder: '请选择进修日期',
						allowClear: true,
						value: v,
						status: fieldInvalid(record, 'repairDate') ? 'error' : undefined,
						onChange: function (d) { patch(record.key, 'repairDate', d); }
					});
				}
			},
			{
				title: reqTitle('车牌号'),
				dataIndex: 'plateNo',
				key: 'plateNo',
				width: 140,
				align: 'center',
				render: function (v, record) {
					var ref = latestRefs.current;
					if (!canEditRow(record)) return readOnlyCell(v);
					var plateInv = fieldInvalid(record, 'plateNo');
					return React.createElement(Select, {
						style: cellInputStyle,
						showSearch: true,
						allowClear: true,
						placeholder: '请输入车牌号搜索',
						value: v,
						status: plateInv ? 'error' : undefined,
						options: ref.vehicleOptions,
						optionFilterProp: 'label',
						filterOption: filterPlateOption,
						notFoundContent: '未找到匹配车辆',
						onChange: function (val) { patch(record.key, 'plateNo', val); }
					});
				}
			},
			{
				title: '提报人',
				dataIndex: 'reporterName',
				key: 'reporterName',
				width: 88,
				align: 'center',
				render: function (v) { return readOnlyCell(v); }
			},
			{
				title: '提报时间',
				dataIndex: 'reportTime',
				key: 'reportTime',
				width: 168,
				align: 'center',
				render: function (v) {
					return React.createElement(
						'div',
						{ className: 'maint-cell-readonly', style: { padding: '4px 8px', textAlign: 'center', whiteSpace: 'nowrap', minWidth: 152 } },
						formatDateTime(v) || '-'
					);
				}
			},
			{
				title: reqTitle('类型'),
				dataIndex: 'recordType',
				key: 'recordType',
				width: 100,
				align: 'center',
				render: function (v, record) {
					if (!canEditRow(record)) return readOnlyCell(v);
					return React.createElement(Select, {
						style: cellInputStyle,
						allowClear: true,
						placeholder: '请选择类型',
						value: v,
						status: fieldInvalid(record, 'recordType') ? 'error' : undefined,
						options: RECORD_TYPE_OPTIONS,
						onChange: function (val) { patch(record.key, 'recordType', val); }
					});
				}
			},
			{
				title: reqTitle('项目/材料'),
				dataIndex: 'itemDesc',
				key: 'itemDesc',
				width: 160,
				align: 'center',
				render: function (v, record) {
					if (!canEditRow(record)) return readOnlyCell(v);
					return React.createElement(Input, {
						className: 'maint-inline-input',
						value: v,
						placeholder: '请输入项目/材料',
						status: fieldInvalid(record, 'itemDesc') ? 'error' : undefined,
						onChange: function (e) { patch(record.key, 'itemDesc', e.target.value); }
					});
				}
			},
			{
				title: '人工费',
				key: 'laborGroup',
				children: [
					{
						title: reqTitle('单位'),
						dataIndex: 'laborUnit',
						key: 'laborUnit',
						width: 72,
						align: 'center',
						render: function (v, record) {
							if (!canEditRow(record)) return readOnlyCell(v);
							return React.createElement(Input, {
								className: 'maint-inline-input',
								value: v,
								placeholder: '单位',
								status: fieldInvalid(record, 'laborUnit') ? 'error' : undefined,
								onChange: function (e) { patch(record.key, 'laborUnit', e.target.value); }
							});
						}
					},
					{
						title: reqTitle('数量'),
						dataIndex: 'laborQty',
						key: 'laborQty',
						width: 88,
						align: 'right',
						render: function (v, record) {
							if (!canEditRow(record)) return readOnlyCell(toIntQty(v), 'right');
							return React.createElement(InputNumber, {
								style: cellNumStyle,
								min: 0,
								step: 1,
								precision: 0,
								placeholder: '数量',
								value: isEmptyNum(v) ? null : toIntQty(v),
								status: fieldInvalid(record, 'laborQty') ? 'error' : undefined,
								onChange: function (val) { patch(record.key, 'laborQty', val == null ? null : toIntQty(val)); }
							});
						}
					},
					{
						title: reqTitle('单价(含税)'),
						dataIndex: 'laborUnitPrice',
						key: 'laborUnitPrice',
						width: 100,
						align: 'right',
						render: function (v, record) {
							if (!canEditRow(record)) return readOnlyCell(fmtMoney(v), 'right');
							return React.createElement(InputNumber, {
								style: cellNumStyle,
								min: 0,
								precision: 2,
								placeholder: '单价',
								value: isEmptyNum(v) ? null : v,
								status: fieldInvalid(record, 'laborUnitPrice') ? 'error' : undefined,
								onChange: function (val) { patch(record.key, 'laborUnitPrice', val == null ? null : val); }
							});
						}
					},
					{
						title: '金额(含税)',
						dataIndex: 'laborAmount',
						key: 'laborAmount',
						width: 100,
						align: 'right',
						render: function (v) { return React.createElement('span', { style: { paddingRight: 8 } }, fmtMoney(v)); }
					}
				]
			},
			{
				title: '配件费',
				key: 'partsGroup',
				children: [
					{
						title: reqTitle('单位'),
						dataIndex: 'partsUnit',
						key: 'partsUnit',
						width: 72,
						align: 'center',
						render: function (v, record) {
							if (!canEditRow(record)) return readOnlyCell(v);
							return React.createElement(Input, {
								className: 'maint-inline-input',
								value: v,
								placeholder: '单位',
								status: fieldInvalid(record, 'partsUnit') ? 'error' : undefined,
								onChange: function (e) { patch(record.key, 'partsUnit', e.target.value); }
							});
						}
					},
					{
						title: reqTitle('数量'),
						dataIndex: 'partsQty',
						key: 'partsQty',
						width: 88,
						align: 'right',
						render: function (v, record) {
							if (!canEditRow(record)) return readOnlyCell(toIntQty(v), 'right');
							return React.createElement(InputNumber, {
								style: cellNumStyle,
								min: 0,
								step: 1,
								precision: 0,
								placeholder: '数量',
								value: isEmptyNum(v) ? null : toIntQty(v),
								status: fieldInvalid(record, 'partsQty') ? 'error' : undefined,
								onChange: function (val) { patch(record.key, 'partsQty', val == null ? null : toIntQty(val)); }
							});
						}
					},
					{
						title: reqTitle('单价(含税)'),
						dataIndex: 'partsUnitPrice',
						key: 'partsUnitPrice',
						width: 100,
						align: 'right',
						render: function (v, record) {
							if (!canEditRow(record)) return readOnlyCell(fmtMoney(v), 'right');
							return React.createElement(InputNumber, {
								style: cellNumStyle,
								min: 0,
								precision: 2,
								placeholder: '单价',
								value: isEmptyNum(v) ? null : v,
								status: fieldInvalid(record, 'partsUnitPrice') ? 'error' : undefined,
								onChange: function (val) { patch(record.key, 'partsUnitPrice', val == null ? null : val); }
							});
						}
					},
					{
						title: '金额(含税)',
						dataIndex: 'partsAmount',
						key: 'partsAmount',
						width: 100,
						align: 'right',
						render: function (v) { return React.createElement('span', { style: { paddingRight: 8 } }, fmtMoney(v)); }
					}
				]
			},
			{
				title: '费用总计（含税）',
				dataIndex: 'totalCost',
				key: 'totalCost',
				width: 120,
				align: 'right',
				fixed: 'right',
				render: function (v) {
					return React.createElement('span', { style: { paddingRight: 8, fontWeight: 600, color: '#0f172a' } }, fmtMoney(v));
				}
			},
			{
				title: '操作',
				key: 'action',
				width: 128,
				align: 'center',
				fixed: 'right',
				render: function (_, record) {
					var ref = latestRefs.current;
					var submitted = record.submitStatus === 'submitted';
					var isOwn = record.createdBy === CURRENT_USER.id;
					var allowCopy = canCopyRow(record, ref.isSupervisor);

					function renderEditIcon() {
						return React.createElement(
							'svg',
							{ viewBox: '64 64 896 896', width: 14, height: 14, fill: 'currentColor', 'aria-hidden': true },
							React.createElement('path', {
								d: 'M257.7 752c2 0 4-.2 6-.5L431.9 722c2-.4 3.9-1.3 5.3-2.8l423.9-423.9a9.96 9.96 0 0 0 0-14.1L694.9 114.9c-1.9-1.9-4.4-2.9-7.1-2.9s-5.2 1-7.1 2.9L256.8 538.8c-1.5 1.5-2.4 3.3-2.8 5.3l-29.5 168.2a33.5 33.5 0 0 0 9.4 29.8c6.6 6.4 14.9 9.9 23.8 9.9z'
							})
						);
					}

					function renderCopyIcon() {
						return React.createElement(
							'svg',
							{ viewBox: '64 64 896 896', width: 14, height: 14, fill: 'currentColor', 'aria-hidden': true },
							React.createElement('path', {
								d: 'M832 64H296c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8h496v688c0 4.4 3.6 8 8 8h56c4.4 0 8-3.6 8-8V96c0-17.7-14.3-32-32-32zM704 192H192c-17.7 0-32 14.3-32 32v530c0 17.7 14.3 32 32 32h512c17.7 0 32-14.3 32-32V224c0-17.7-14.3-32-32-32z'
							})
						);
					}

					function renderDeleteIcon() {
						return React.createElement(
							'svg',
							{ viewBox: '64 64 896 896', width: 14, height: 14, fill: 'currentColor', 'aria-hidden': true },
							React.createElement('path', {
								d: 'M360 184h-8c4.4 0 8-3.6 8-8v8h304v-8c0 4.4 3.6 8 8 8h-8v72h72v-80c0-35.3-28.7-64-64-64H352c-35.3 0-64 28.7-64 64v80h72v-72zm504 72H160c-17.7 0-32 14.3-32 32v32c0 4.4 3.6 8 8 8h60v520c0 17.7 14.3 32 32 32h632c17.7 0 32-14.3 32-32V336h60c4.4 0 8-3.6 8-8v-32c0-17.7-14.3-32-32-32zM512 464c-17.7 0-32 14.3-32 32v288c0 17.7 14.3 32 32 32h64c17.7 0 32-14.3 32-32V496c0-17.7-14.3-32-32-32h-64zm-192 0c-17.7 0-32 14.3-32 32v288c0 17.7 14.3 32 32 32h64c17.7 0 32-14.3 32-32V496c0-17.7-14.3-32-32-32h-64zm-192 0c-17.7 0-32 14.3-32 32v288c0 17.7 14.3 32 32 32h64c17.7 0 32-14.3 32-32V496c0-17.7-14.3-32-32-32h-64z'
							})
						);
					}

					function renderMoreIcon() {
						return React.createElement(
							'svg',
							{ viewBox: '0 0 16 16', width: 16, height: 16, fill: 'currentColor', 'aria-hidden': true },
							React.createElement('circle', { cx: '8', cy: '3', r: '1.5' }),
							React.createElement('circle', { cx: '8', cy: '8', r: '1.5' }),
							React.createElement('circle', { cx: '8', cy: '13', r: '1.5' })
						);
					}

					function renderIconAction(title, iconNode, onClick, extraClass, disabled) {
						var cls =
							'maint-action-icon-btn' + (extraClass ? ' ' + extraClass : '') + (disabled ? ' is-disabled' : '');
						var node = React.createElement(
							'span',
							{
								className: cls,
								role: 'button',
								tabIndex: disabled ? -1 : 0,
								'aria-label': title,
								onClick:
									disabled || !onClick
										? undefined
										: function (e) {
												e.stopPropagation();
												onClick(e);
											}
							},
							iconNode
						);
						return React.createElement(Tooltip, { title: title }, node);
					}

					function renderMoreAction() {
						return React.createElement(
							Dropdown,
							{
								trigger: ['hover'],
								placement: 'bottomRight',
								menu: {
									items: [
										{
											key: 'changelog',
											label: '变更日志',
											onClick: function () {
												openChangeLogModal(record);
											}
										}
									]
								}
							},
							renderIconAction('更多', renderMoreIcon(), null, 'maint-row-more-btn')
						);
					}

					function renderCopyButton() {
						if (!allowCopy) return null;
						var popOpen = copyPopoverKey === record.key;
						var popContent = React.createElement(
							'div',
							{ style: { width: 220 } },
							React.createElement(
								'div',
								{ style: { marginBottom: 8, fontSize: 13, color: 'rgba(15,23,42,0.65)' } },
								'复制当前行已填写的全部数据'
							),
							React.createElement(
								'div',
								{ style: { marginBottom: 6, fontSize: 13, color: 'rgba(15,23,42,0.55)' } },
								'复制行数'
							),
							React.createElement(InputNumber, {
								style: { width: '100%', marginBottom: 10 },
								min: 1,
								max: 100,
								precision: 0,
								value: popOpen ? copyRowCount : 1,
								onChange: function (val) {
									setCopyRowCount(val == null ? 1 : val);
								}
							}),
							React.createElement(
								Button,
								{
									type: 'primary',
									block: true,
									size: 'small',
									onClick: function () {
										applyCopyRows(record.key, copyRowCount);
									}
								},
								'确认复制'
							)
						);
						return React.createElement(
							Popover,
							{
								trigger: 'click',
								placement: 'leftTop',
								open: popOpen,
								content: popContent,
								onOpenChange: function (open) {
									if (open) {
										setCopyPopoverKey(record.key);
										setCopyRowCount(1);
									} else if (copyPopoverKey === record.key) {
										setCopyPopoverKey(null);
									}
								}
							},
							renderIconAction('复制', renderCopyIcon())
						);
					}

					function toggleEditKeys() {
						ref.setEditingKeys(function (prev) {
							if (prev.indexOf(record.key) >= 0) {
								return prev.filter(function (k) { return k !== record.key; });
							}
							return prev.concat([record.key]);
						});
					}

					function renderEditDeletePair(onEditClick, opts) {
						opts = opts || {};
						var showCopy = opts.showCopy !== false && allowCopy;
						var allowEdit = opts.allowEdit !== false;
						var allowDelete =
							opts.allowDelete !== false && canDeleteRow(record, ref.isSupervisor);
						var isEditing = ref.editingKeys.indexOf(record.key) >= 0;
						var editTitle = opts.editDisabledTitle && !allowEdit
							? opts.editDisabledTitle
							: isEditing
								? '完成编辑'
								: '编辑';
						var deleteTitle = opts.deleteDisabledTitle && !allowDelete
							? opts.deleteDisabledTitle
							: '删除';
						var deleteBtn = React.createElement(
							Popconfirm,
							{
								title: '确认删除该条维修/保养记录？',
								disabled: !allowDelete,
								onConfirm: function () {
									if (!allowDelete) {
										if (record.submitStatus === 'submitted') {
											message.info('已提交记录仅运维主管可删除');
										}
										return;
									}
									ref.setAllRows(function (prev) {
										return prev.filter(function (r) { return r.key !== record.key; });
									});
									ref.setEditingKeys(function (prev) {
										return prev.filter(function (k) { return k !== record.key; });
									});
									message.success('已删除');
								}
							},
							renderIconAction(
								deleteTitle,
								renderDeleteIcon(),
								null,
								'maint-action-icon-danger',
								!allowDelete
							)
						);
						var nodes = [
							renderIconAction(
								editTitle,
								renderEditIcon(),
								allowEdit ? onEditClick : null,
								'',
								!allowEdit
							)
						];
						if (showCopy) nodes.push(renderCopyButton());
						nodes.push(deleteBtn, renderMoreAction());
						return React.createElement(
							'div',
							{ style: { display: 'inline-flex', alignItems: 'center', gap: 2, flexWrap: 'nowrap' } },
							nodes
						);
					}

					if (submitted) {
						if (!canShowSubmittedActions(record, ref.isSupervisor)) {
							return renderMoreAction();
						}
						return renderEditDeletePair(
							function () {
								if (!ref.isSupervisor) {
									message.info('已提交记录仅运维主管可编辑');
									return;
								}
								toggleEditKeys();
							},
							{ showCopy: false }
						);
					}

					if (isSavedDraftRow(record)) {
						if (!canShowSavedActions(record)) return renderMoreAction();
						return renderEditDeletePair(function () {
							if (!ref.isSupervisor && record.createdBy !== CURRENT_USER.id) {
								message.info('仅可编辑本人提报的维修/保养记录');
								return;
							}
							toggleEditKeys();
						});
					}

					if (ref.isSupervisor || !isOwn) return renderMoreAction();

					return React.createElement(
						'div',
						{ style: { display: 'inline-flex', alignItems: 'center', gap: 2, flexWrap: 'nowrap' } },
						renderCopyButton(),
						React.createElement(
							Popconfirm,
							{
								title: '确认删除该条维修/保养记录？',
								onConfirm: function () {
									ref.setAllRows(function (prev) {
										return prev.filter(function (r) { return r.key !== record.key; });
									});
									message.success('已删除');
								}
							},
							renderIconAction('删除', renderDeleteIcon(), null, 'maint-action-icon-danger')
						),
						renderMoreAction()
					);
				}
			}
		];
	}, [
		canEditRow,
		editingKeys,
		isSupervisor,
		rowInvalid,
		copyPopoverKey,
		copyRowCount,
		applyCopyRows,
		openChangeLogModal
	]);

	var changeLogRows = useMemo(
		function () {
			if (!changeLogModal.rowKey) return [];
			return changeLogsByKey[changeLogModal.rowKey] || [];
		},
		[changeLogModal.rowKey, changeLogsByKey]
	);

	var changeLogColumns = useMemo(
		function () {
			return [
				{
					title: '修改时间',
					dataIndex: 'at',
					key: 'at',
					width: 168,
					render: function (v) {
						return formatDateTime(v) || '—';
					}
				},
				{
					title: '修改人',
					dataIndex: 'userName',
					key: 'userName',
					width: 88,
					align: 'center'
				},
				{
					title: '修改字段',
					dataIndex: 'fieldLabel',
					key: 'fieldLabel',
					width: 140,
					align: 'center'
				},
				{
					title: '修改前',
					dataIndex: 'before',
					key: 'before',
					ellipsis: true,
					render: function (v) {
						return React.createElement('span', { style: { color: '#cf1322' } }, v == null || v === '' ? '—' : v);
					}
				},
				{
					title: '修改后',
					dataIndex: 'after',
					key: 'after',
					ellipsis: true,
					render: function (v) {
						return React.createElement('span', { style: { color: '#389e0d' } }, v == null || v === '' ? '—' : v);
					}
				}
			];
		},
		[]
	);

	var tableSummary = useCallback(function () {
		return React.createElement(
			Table.Summary,
			null,
			React.createElement(
				Table.Summary.Row,
				null,
				React.createElement(Table.Summary.Cell, { index: 0, align: 'center' }, '合计'),
				React.createElement(Table.Summary.Cell, { index: 1, colSpan: 7 }),
				React.createElement(Table.Summary.Cell, { index: 8, colSpan: 3 }),
				React.createElement(Table.Summary.Cell, { index: 11, align: 'right' }, fmtMoney(totals.laborAmount)),
				React.createElement(Table.Summary.Cell, { index: 12, colSpan: 3 }),
				React.createElement(Table.Summary.Cell, { index: 15, align: 'right' }, fmtMoney(totals.partsAmount)),
				React.createElement(Table.Summary.Cell, { index: 16, align: 'right' }, fmtMoney(totals.totalCost)),
				React.createElement(Table.Summary.Cell, { index: 17 })
			)
		);
	}, [totals]);

	return React.createElement(
		App,
		null,
		React.createElement('style', null, ledgerTableStyle),
		React.createElement(
			'div',
			{ style: layoutStyle },
			React.createElement(Breadcrumb, {
				style: { marginBottom: 12 },
				items: [{ title: '台账数据' }, { title: '车辆维修/保养明细' }]
			}),
			React.createElement(
				Card,
				{ style: filterCardStyle, bodyStyle: { paddingBottom: 4 } },
				React.createElement(
					Row,
					{ gutter: [16, 16], align: 'bottom' },
					React.createElement(
						Col,
						{ xs: 24, sm: 12, md: 8, lg: 5 },
						React.createElement(
							'div',
							{ style: filterItemStyle },
							React.createElement('div', { style: filterLabelStyle }, '进修日期'),
							React.createElement(DatePicker.RangePicker, {
								style: filterControlStyle,
								format: 'YYYY-MM-DD',
								value: dateRangeDraft,
								onChange: function (v) { setDateRangeDraft(v); }
							})
						)
					),
					React.createElement(
						Col,
						{ xs: 24, sm: 12, md: 8, lg: 4 },
						React.createElement(
							'div',
							{ style: filterItemStyle },
							React.createElement('div', { style: filterLabelStyle }, '车牌号'),
							React.createElement(Select, {
								allowClear: true,
								showSearch: true,
								placeholder: '全部，可输入车牌搜索',
								style: filterControlStyle,
								value: plateDraft,
								onChange: function (v) { setPlateDraft(v); },
								options: vehiclePlateOptions,
								optionFilterProp: 'label',
								filterOption: filterPlateOption
							})
						)
					),
					React.createElement(
						Col,
						{ xs: 24, sm: 12, md: 8, lg: 4 },
						React.createElement(
							'div',
							{ style: filterItemStyle },
							React.createElement('div', { style: filterLabelStyle }, '类型'),
							React.createElement(Select, {
								mode: 'multiple',
								allowClear: true,
								placeholder: '全部',
								style: filterControlStyle,
								value: typeDraft,
								onChange: function (v) { setTypeDraft(v || []); },
								options: RECORD_TYPE_OPTIONS,
								maxTagCount: 2
							})
						)
					),
					React.createElement(
						Col,
						{ xs: 24, sm: 12, md: 8, lg: 5 },
						React.createElement(
							'div',
							{ style: filterItemStyle },
							React.createElement('div', { style: filterLabelStyle }, '提报人'),
							React.createElement(Select, {
								mode: 'multiple',
								allowClear: true,
								showSearch: true,
								placeholder: '全部',
								style: filterControlStyle,
								value: reporterDraft,
								onChange: function (v) { setReporterDraft(v || []); },
								options: reporterOptions,
								filterOption: filterOption,
								maxTagCount: 2
							})
						)
					),
					React.createElement(
						Col,
						{ xs: 24, sm: 12, md: 8, lg: 6, style: filterActionsColStyle },
						React.createElement(
							'div',
							{ style: filterItemStyle },
							React.createElement('div', { style: filterLabelStyle }, '\u00a0'),
							React.createElement(
								Space,
								{ wrap: true },
								React.createElement(Button, { onClick: handleReset }, '重置'),
								React.createElement(Button, { type: 'primary', onClick: handleQuery }, '查询')
							)
						)
					)
				)
			),
			React.createElement(
				Card,
				{ style: tableCardStyle, bodyStyle: { padding: '20px 20px 24px' } },
				React.createElement(
					'div',
					{ style: { position: 'relative', marginBottom: 8, minHeight: 36 } },
					React.createElement(
						'div',
						{
							style: {
								textAlign: 'center',
								fontSize: 18,
								fontWeight: 700,
								color: 'rgba(15,23,42,0.92)',
								letterSpacing: '0.02em',
								padding: '0 200px'
							}
						},
						'车辆维修/保养明细'
					),
					React.createElement(
						'div',
						{ style: { position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)' } },
						React.createElement(
							Space,
							null,
							React.createElement(Button, { onClick: handleSave }, '保存'),
							!isSupervisor
								? React.createElement(Button, { type: 'primary', onClick: handleConfirmSubmit }, '确认提交')
								: null
						)
					)
				),
				React.createElement(
					'div',
					{ className: 'maint-ledger-table-wrap' },
					React.createElement(Table, {
						className: 'maint-ledger-table',
						size: 'small',
						bordered: true,
						rowKey: 'key',
						columns: columns,
						dataSource: visibleRows,
						pagination: false,
						rowClassName: function (record, index) {
							var tier = record.displayTier != null ? record.displayTier : rowDisplaySortTier(record);
							var prev = visibleRows[index - 1];
							var prevTier = prev ? (prev.displayTier != null ? prev.displayTier : rowDisplaySortTier(prev)) : tier;
							var cls = 'maint-row-data maint-row-tier-' + tier;
							if (index > 0 && prevTier !== tier) cls += ' maint-row-tier-boundary';
							return cls;
						},
						scroll: { x: 'max-content', y: 'calc(100vh - 360px)' },
						sticky: true,
						summary: tableSummary
					})
				),
				!isSupervisor
					? React.createElement(
						Button,
						{
							type: 'dashed',
							block: true,
							style: { marginTop: 12 },
							onClick: addRow
						},
						'新增一行'
					)
					: null
			),
			React.createElement(
				Modal,
				{
					title: '变更日志' + (changeLogModal.rowLabel ? ' · ' + changeLogModal.rowLabel : ''),
					open: changeLogModal.open,
					onCancel: closeChangeLogModal,
					footer: React.createElement(Button, { onClick: closeChangeLogModal }, '关闭'),
					width: 880,
					destroyOnClose: true
				},
				React.createElement(Table, {
					size: 'small',
					bordered: true,
					rowKey: 'id',
					pagination: changeLogRows.length > 8 ? { pageSize: 8, showSizeChanger: false } : false,
					columns: changeLogColumns,
					dataSource: changeLogRows,
					locale: { emptyText: '暂无变更记录' },
					scroll: { x: 'max-content', y: 360 }
				})
			)
		)
	);
};
