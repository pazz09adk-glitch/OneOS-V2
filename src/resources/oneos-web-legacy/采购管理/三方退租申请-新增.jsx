// 【重要】必须使用 const Component 作为组件变量名
// 采购管理 - 三方退租申请（列表 + 新增/编辑/查看）

const Component = function () {
	var useState = React.useState;
	var useCallback = React.useCallback;
	var useMemo = React.useMemo;
	var useRef = React.useRef;
	var useEffect = React.useEffect;

	var TRA_APPLY_KEY = 'oneos_tri_rent_apply_v1';

	function traLoadList() {
		if (typeof localStorage === 'undefined') return buildSeedList();
		try {
			var raw = localStorage.getItem(TRA_APPLY_KEY);
			if (raw) return JSON.parse(raw);
		} catch (e) { /* noop */ }
		return buildSeedList();
	}

	function traPersistAndSyncTasks(nextList) {
		if (typeof localStorage !== 'undefined') {
			try { localStorage.setItem(TRA_APPLY_KEY, JSON.stringify(nextList || [])); } catch (e) { /* noop */ }
		}
		if (typeof window !== 'undefined' && window.ONEOS_TRI_RETURN && window.ONEOS_TRI_RETURN.syncTasksFromApplications) {
			window.ONEOS_TRI_RETURN.syncTasksFromApplications(nextList || []);
		}
	}

	var antd = window.antd;
	var Card = antd.Card;
	var DatePicker = antd.DatePicker;
	var RangePicker = DatePicker.RangePicker;
	var Select = antd.Select;
	var Input = antd.Input;
	var Button = antd.Button;
	var Table = antd.Table;
	var Modal = antd.Modal;
	var message = antd.message;
	var Tag = antd.Tag;
	var Empty = antd.Empty;
	var Cascader = antd.Cascader;
	var Space = antd.Space;
	var Popconfirm = antd.Popconfirm;
	var Upload = antd.Upload;
	var Dropdown = antd.Dropdown;
	var Tooltip = antd.Tooltip;

	var CURRENT_USER = '采购-王丽';

	var LESSEE_OPTIONS = [
		{ value: 'ln_zj', label: '浙江羚牛氢能科技有限公司' },
		{ value: 'ln_jx', label: '羚牛运营（嘉兴）' },
		{ value: 'ln_sh', label: '羚牛运营（上海）' },
		{ value: 'ln_gd', label: '羚牛运营（广东）' },
		{ value: 'ln_sh_iot', label: '上海羚牛氢运物联网科技有限公司' },
		{ value: 'ln_jx_auto', label: '嘉兴羚牛汽车服务有限公司' },
		{ value: 'ln_gd_tech', label: '羚牛氢能科技（广东）有限公司' }
	];

	var OPS_STAFF_OPTIONS = [
		{ value: '张明辉', label: '张明辉' },
		{ value: '魏山', label: '魏山' },
		{ value: '李四', label: '李四' },
		{ value: '王五', label: '王五' },
		{ value: '赵六', label: '赵六' },
		{ value: '刘念念', label: '刘念念' },
		{ value: '金可鹏', label: '金可鹏' },
		{ value: '姚守涛', label: '姚守涛' },
		{ value: '尚建华', label: '尚建华' },
		{ value: '何苗苗', label: '何苗苗' },
		{ value: '陈高伟', label: '陈高伟' }
	];

	var REGION_OPTIONS = [
		{ value: 'zhejiang', label: '浙江省', children: [{ value: 'hangzhou', label: '杭州市' }, { value: 'ningbo', label: '宁波市' }, { value: 'jiaxing', label: '嘉兴市' }, { value: 'huzhou', label: '湖州市' }] },
		{ value: 'shanghai', label: '上海市', children: [{ value: 'shanghai', label: '上海市' }] },
		{ value: 'guangdong', label: '广东省', children: [{ value: 'guangzhou', label: '广州市' }, { value: 'shenzhen', label: '深圳市' }, { value: 'dongguan', label: '东莞市' }] },
		{ value: 'jiangsu', label: '江苏省', children: [{ value: 'suzhou', label: '苏州市' }, { value: 'nanjing', label: '南京市' }] }
	];

	var VEHICLE_DB = [
		{ plateNo: '浙A12345', vin: 'LGHXCAE28M1234567', brand: '东风', model: 'DFH1180', vehicleStatus: '租赁' },
		{ plateNo: '浙A67890', vin: 'LGHXCAE28M6789012', brand: '福田', model: 'BJ1180', vehicleStatus: '自营' },
		{ plateNo: '浙F88601', vin: 'LNBSCPKB8RR123402', brand: '现代', model: '帕力安牌4.5吨冷链车', vehicleStatus: '库存', stockSubStatus: '可运营' },
		{ plateNo: '沪B11111', vin: 'LGHXCAE28M7654321', brand: '江淮', model: 'HFC1180', vehicleStatus: '租赁' },
		{ plateNo: '京A12345', vin: 'LKLG7C4E4NA774759', brand: '东风', model: 'DFH1180', vehicleStatus: '自营' },
		{ plateNo: '粤A12345', vin: 'LKLG7C4E4NA774801', brand: '东风', model: 'DFH1180', vehicleStatus: '库存', stockSubStatus: '待运营' },
		{ plateNo: '浙F80088', vin: 'LKLG7C4E4NA774701', brand: '苏龙', model: '海格牌18吨双飞翼货车', vehicleStatus: '库存', stockSubStatus: '可运营' }
	];

	var VEHICLE_STATUS_TAG_COLOR = {
		'租赁': 'blue',
		'自营': 'green',
		'库存': 'default',
		'可运营': 'cyan',
		'待运营': 'orange'
	};

	function renderVehicleStatusTag(row) {
		if (!row || !row.vehicleStatus) {
			return React.createElement('span', { style: { color: 'var(--tra-muted)' } }, '—');
		}
		if (row.vehicleStatus === '库存' && row.stockSubStatus) {
			return React.createElement(Space, { size: 4, wrap: true },
				React.createElement(Tag, { color: VEHICLE_STATUS_TAG_COLOR['库存'], style: { margin: 0 } }, '库存'),
				React.createElement(Tag, { color: VEHICLE_STATUS_TAG_COLOR[row.stockSubStatus] || 'default', style: { margin: 0 } }, row.stockSubStatus)
			);
		}
		return React.createElement(Tag, { color: VEHICLE_STATUS_TAG_COLOR[row.vehicleStatus] || 'default', style: { margin: 0 } }, row.vehicleStatus);
	}

	var APPROVAL_STATUS_COLOR = {
		'待提交': 'default',
		'待审批': 'processing',
		'审批中': 'processing',
		'审批驳回': 'error',
		'审批完成': 'success',
		'撤回': 'warning'
	};

	function lesseeLabel(id) {
		var hit = LESSEE_OPTIONS.find(function (o) { return o.value === id; });
		return hit ? hit.label : '—';
	}

	function regionTextFromValue(val) {
		if (!val || !Array.isArray(val) || val.length < 2) return '';
		var p = REGION_OPTIONS.find(function (x) { return x.value === val[0]; });
		if (!p) return '';
		var c = (p.children || []).find(function (x) { return x.value === val[1]; });
		return c ? p.label + '-' + c.label : p.label;
	}

	function toFixed2Input(v) {
		var s = String(v === null || v === undefined ? '' : v);
		s = s.replace(/[^\d.]/g, '');
		var firstDot = s.indexOf('.');
		if (firstDot >= 0) {
			s = s.slice(0, firstDot + 1) + s.slice(firstDot + 1).replace(/\./g, '');
			var a = s.split('.');
			s = a[0] + '.' + (a[1] || '').slice(0, 2);
		}
		return s;
	}

	function filterOption(input, option) {
		var label = (option && (option.label || option.children)) || '';
		return String(label).toLowerCase().indexOf(String(input || '').toLowerCase()) >= 0;
	}

	function createEmptyVehicleRow() {
		return {
			id: 'v_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
			plateNo: undefined,
			vehicleStatus: undefined,
			stockSubStatus: undefined,
			vin: '',
			brand: '',
			model: '',
			depositPaid: ''
		};
	}

	function createEmptyForm() {
		return {
			expectedReturnDate: null,
			lessorName: '',
			lesseeId: undefined,
			deliveryRegion: undefined,
			returnStaff: [],
			settlementRemark: '',
			vehicles: [createEmptyVehicleRow()]
		};
	}

	function buildSeedList() {
		return [
			{
				id: 'tr1',
				bizNo: 'TR-2026-001',
				expectedReturnDate: '2026-04-15',
				lessorName: '桐乡市丰韵快递有限责任公司',
				lesseeId: 'ln_zj',
				lesseeName: '浙江羚牛氢能科技有限公司',
				deliveryRegion: ['zhejiang', 'jiaxing'],
				deliveryRegionText: '浙江省-嘉兴市',
				returnStaff: ['张明辉', '魏山'],
				vehicles: [
					{ id: 'v1', plateNo: '浙F88601', vehicleStatus: '库存', stockSubStatus: '可运营', vin: 'LNBSCPKB8RR123402', brand: '现代', model: '帕力安牌4.5吨冷链车', depositPaid: '12000.00', returnSettlementAmount: '', companySettlementAmount: '' },
					{ id: 'v2', plateNo: '浙A12345', vehicleStatus: '租赁', vin: 'LGHXCAE28M1234567', brand: '东风', model: 'DFH1180', depositPaid: '8000.50', returnSettlementAmount: '', companySettlementAmount: '' }
				],
				vehicleCount: 2,
				approvalStatus: '待提交',
				currentApprover: '—',
				creator: '采购-王丽',
				createTime: '2026-03-10 09:00:00'
			},
			{
				id: 'tr2',
				bizNo: 'TR-2026-002',
				expectedReturnDate: '2026-05-01',
				lessorName: '上海迅杰物流有限公司',
				lesseeId: 'ln_sh',
				lesseeName: '羚牛运营（上海）',
				deliveryRegion: ['shanghai', 'shanghai'],
				deliveryRegionText: '上海市-上海市',
				returnStaff: ['李四', '王五'],
				vehicles: [
					{ id: 'v3', plateNo: '沪B11111', vehicleStatus: '租赁', vin: 'LGHXCAE28M7654321', brand: '江淮', model: 'HFC1180', depositPaid: '15000.00', returnSettlementAmount: '', companySettlementAmount: '' }
				],
				vehicleCount: 1,
				approvalStatus: '待审批',
				currentApprover: '采购部主管',
				creator: '采购-王丽',
				createTime: '2026-03-08 14:20:00'
			},
			{
				id: 'tr3',
				bizNo: 'TR-2026-003',
				expectedReturnDate: '2026-03-28',
				lessorName: '深圳冷链运输有限公司',
				lesseeId: 'ln_gd',
				lesseeName: '羚牛运营（广东）',
				deliveryRegion: ['guangdong', 'shenzhen'],
				deliveryRegionText: '广东省-深圳市',
				returnStaff: ['赵六'],
				vehicles: [
					{ id: 'v4', plateNo: '粤A12345', vehicleStatus: '库存', stockSubStatus: '待运营', vin: 'LKLG7C4E4NA774801', brand: '东风', model: 'DFH1180', depositPaid: '6000.00', returnSettlementAmount: '5800.00', companySettlementAmount: '5200.00' },
					{ id: 'v5', plateNo: '浙A67890', vehicleStatus: '自营', vin: 'LGHXCAE28M6789012', brand: '福田', model: 'BJ1180', depositPaid: '7200.80', returnSettlementAmount: '7000.00', companySettlementAmount: '6500.00' }
				],
				vehicleCount: 2,
				approvalStatus: '审批驳回',
				currentApprover: '尚建华',
				creator: '采购-李强',
				createTime: '2026-03-05 11:30:00'
			},
			{
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
			}
		];
	}

	var vehicleByPlate = useMemo(function () {
		var map = {};
		VEHICLE_DB.forEach(function (v) { map[v.plateNo] = v; });
		return map;
	}, []);

	var plateOptions = useMemo(function () {
		return VEHICLE_DB.map(function (v) { return { value: v.plateNo, label: v.plateNo }; });
	}, []);

	var pageModeState = useState('list');
	var pageMode = pageModeState[0];
	var setPageMode = pageModeState[1];

	var formModeState = useState('add');
	var formMode = formModeState[0];
	var setFormMode = formModeState[1];

	var listState = useState(traLoadList);
	var list = listState[0];
	var setList = listState[1];

	useEffect(function () {
		traPersistAndSyncTasks(list);
	}, [list]);

	var currentIdState = useState(null);
	var currentId = currentIdState[0];
	var setCurrentId = currentIdState[1];

	var formState = useState(createEmptyForm);
	var form = formState[0];
	var setForm = formState[1];

	var editedState = useState(false);
	var edited = editedState[0];
	var setEdited = editedState[1];

	var cancelModalState = useState(false);
	var importModalState = useState(false);
	var requirementModalState = useState(false);
	var deleteModalState = useState({ open: false, record: null });
	var listFilterStatusState = useState('');
	var submitLoadingState = useState(false);

	var EMPTY_LIST_FILTER = {
		lessorName: undefined,
		lesseeId: undefined,
		plateNo: undefined,
		vin: undefined,
		brand: undefined,
		model: undefined,
		creator: undefined,
		createTimeRange: null
	};
	var listFilterDraftState = useState(function () {
		return Object.assign({}, EMPTY_LIST_FILTER);
	});
	var listFilterAppliedState = useState(function () {
		return Object.assign({}, EMPTY_LIST_FILTER);
	});

	var lessorOptions = useMemo(function () {
		var set = {};
		list.forEach(function (r) {
			if (r.lessorName) set[r.lessorName] = true;
		});
		return Object.keys(set).sort().map(function (name) {
			return { value: name, label: name };
		});
	}, [list]);

	var creatorOptions = useMemo(function () {
		var set = {};
		list.forEach(function (r) {
			if (r.creator) set[r.creator] = true;
		});
		return Object.keys(set).sort().map(function (name) {
			return { value: name, label: name };
		});
	}, [list]);

	var listPlateOptions = useMemo(function () {
		return buildListVehicleOptions('plateNo');
	}, [list]);

	var listVinOptions = useMemo(function () {
		return buildListVehicleOptions('vin');
	}, [list]);

	var listBrandOptions = useMemo(function () {
		return buildListVehicleOptions('brand');
	}, [list]);

	var listModelOptions = useMemo(function () {
		return buildListVehicleOptions('model');
	}, [list]);

	function buildListVehicleOptions(field) {
		var set = {};
		list.forEach(function (r) {
			(r.vehicles || []).forEach(function (v) {
				if (v[field]) set[v[field]] = true;
			});
		});
		VEHICLE_DB.forEach(function (v) {
			if (v[field]) set[v[field]] = true;
		});
		return Object.keys(set).sort().map(function (val) {
			return { value: val, label: val };
		});
	}

	function matchVehicleFilters(vehicles, filter) {
		if (!filter.plateNo && !filter.vin && !filter.brand && !filter.model) return true;
		return (vehicles || []).some(function (v) {
			if (filter.plateNo && v.plateNo !== filter.plateNo) return false;
			if (filter.vin && v.vin !== filter.vin) return false;
			if (filter.brand && v.brand !== filter.brand) return false;
			if (filter.model && v.model !== filter.model) return false;
			return true;
		});
	}

	function toDateStr(val) {
		if (!val) return '';
		if (typeof val === 'string') return val.slice(0, 10);
		if (val.format) return val.format('YYYY-MM-DD');
		return '';
	}

	function matchCreateTimeRange(createTimeStr, range) {
		if (!range || !range[0] || !range[1]) return true;
		var datePart = String(createTimeStr || '').slice(0, 10);
		if (!datePart) return false;
		var start = toDateStr(range[0]);
		var end = toDateStr(range[1]);
		return datePart >= start && datePart <= end;
	}

	var handleFilterSearch = useCallback(function () {
		listFilterAppliedState[1](Object.assign({}, listFilterDraftState[0]));
	}, [listFilterDraftState[0]]);

	var handleFilterReset = useCallback(function () {
		var empty = Object.assign({}, EMPTY_LIST_FILTER);
		listFilterDraftState[1](empty);
		listFilterAppliedState[1](empty);
		listFilterStatusState[1]('');
	}, []);

	var bizNoRef = useRef(5);

	var isSettlementPage = pageMode === 'settlement';
	var readOnly = formMode === 'view' || isSettlementPage;

	var canEditRecord = useCallback(function (record) {
		return ['待提交', '审批驳回', '撤回'].indexOf(record.approvalStatus) >= 0;
	}, []);

	var updateForm = useCallback(function (patch) {
		setEdited(true);
		setForm(function (prev) {
			var next = {};
			for (var k in prev) next[k] = prev[k];
			for (var pk in patch) next[pk] = patch[pk];
			return next;
		});
	}, []);

	var updateVehicleRow = useCallback(function (rowId, patch) {
		setEdited(true);
		setForm(function (prev) {
			return Object.assign({}, prev, {
				vehicles: (prev.vehicles || []).map(function (r) {
					if (r.id !== rowId) return r;
					var next = {};
					for (var k in r) next[k] = r[k];
					for (var pk in patch) next[pk] = patch[pk];
					return next;
				})
			});
		});
	}, []);

	var onPlateChange = useCallback(function (rowId, plateNo) {
		var v = vehicleByPlate[plateNo];
		updateVehicleRow(rowId, {
			plateNo: plateNo,
			vin: v ? v.vin : '',
			brand: v ? v.brand : '',
			model: v ? v.model : '',
			vehicleStatus: v ? v.vehicleStatus : undefined,
			stockSubStatus: v ? v.stockSubStatus : undefined
		});
	}, [vehicleByPlate, updateVehicleRow]);

	var addVehicleRow = useCallback(function () {
		setEdited(true);
		setForm(function (prev) {
			return Object.assign({}, prev, {
				vehicles: (prev.vehicles || []).concat([createEmptyVehicleRow()])
			});
		});
	}, []);

	var removeVehicleRow = useCallback(function (rowId) {
		setEdited(true);
		setForm(function (prev) {
			var nextList = (prev.vehicles || []).filter(function (r) { return r.id !== rowId; });
			if (nextList.length === 0) nextList = [createEmptyVehicleRow()];
			return Object.assign({}, prev, { vehicles: nextList });
		});
	}, []);

	var openAdd = useCallback(function () {
		setFormMode('add');
		setCurrentId(null);
		setForm(createEmptyForm());
		setEdited(false);
		setPageMode('form');
	}, []);

	var openFormFromRecord = useCallback(function (record, mode) {
		setFormMode(mode);
		setCurrentId(record.id);
		setForm({
			expectedReturnDate: record.expectedReturnDate || null,
			lessorName: record.lessorName || '',
			lesseeId: record.lesseeId,
			deliveryRegion: record.deliveryRegion,
			returnStaff: record.returnStaff ? record.returnStaff.slice() : [],
			settlementRemark: record.settlementRemark || '',
			vehicles: (record.vehicles || []).map(function (v) {
				return Object.assign({}, v, { id: v.id || createEmptyVehicleRow().id });
			})
		});
		setEdited(false);
		setPageMode('form');
	}, []);

	var openSettlementFromRecord = useCallback(function (record) {
		setFormMode('view');
		setCurrentId(record.id);
		setForm({
			expectedReturnDate: record.expectedReturnDate || null,
			lessorName: record.lessorName || '',
			lesseeId: record.lesseeId,
			deliveryRegion: record.deliveryRegion,
			returnStaff: record.returnStaff ? record.returnStaff.slice() : [],
			settlementRemark: record.settlementRemark || '',
			vehicles: (record.vehicles || []).map(function (v) {
				return Object.assign({}, v, { id: v.id || createEmptyVehicleRow().id });
			})
		});
		setEdited(false);
		setPageMode('settlement');
	}, []);

	var backToList = useCallback(function () {
		setPageMode('list');
		setCurrentId(null);
		setForm(createEmptyForm());
		setEdited(false);
	}, []);

	var buildRecordFromForm = useCallback(function (status) {
		var vehicles = (form.vehicles || []).filter(function (v) { return v.plateNo; });
		return {
			id: currentId || ('tr' + Date.now()),
			bizNo: currentId
				? (list.find(function (x) { return x.id === currentId; }) || {}).bizNo
				: 'TR-2026-' + (function (n) {
					if (n < 10) return '00' + n;
					if (n < 100) return '0' + n;
					return String(n);
				})(bizNoRef.current++),
			expectedReturnDate: form.expectedReturnDate || '',
			lessorName: (form.lessorName || '').trim(),
			lesseeId: form.lesseeId,
			lesseeName: lesseeLabel(form.lesseeId),
			deliveryRegion: form.deliveryRegion,
			deliveryRegionText: regionTextFromValue(form.deliveryRegion),
			returnStaff: form.returnStaff || [],
			vehicles: vehicles,
			vehicleCount: vehicles.length,
			approvalStatus: status,
			currentApprover: status === '待提交' ? '—' : (status === '待审批' ? '采购部主管' : '—'),
			creator: currentId
				? (list.find(function (x) { return x.id === currentId; }) || {}).creator
				: CURRENT_USER,
			createTime: currentId
				? (list.find(function (x) { return x.id === currentId; }) || {}).createTime
				: new Date().toISOString().slice(0, 19).replace('T', ' ')
		};
	}, [form, currentId, list]);

	var validateForm = useCallback(function () {
		if (!form.expectedReturnDate) {
			message.warning('请选择预计退租时间');
			return false;
		}
		if (!String(form.lessorName || '').trim()) {
			message.warning('请填写出租方企业全称');
			return false;
		}
		if (!form.lesseeId) {
			message.warning('请选择承租方企业');
			return false;
		}
		if (!form.deliveryRegion || form.deliveryRegion.length < 2) {
			message.warning('请选择退车地点（省-市）');
			return false;
		}
		if (!form.returnStaff || !form.returnStaff.length) {
			message.warning('请选择退车人员');
			return false;
		}
		var rows = (form.vehicles || []).filter(function (v) { return v.plateNo; });
		if (!rows.length) {
			message.warning('请至少添加一辆退租车辆');
			return false;
		}
		var badDeposit = rows.find(function (v) { return !String(v.depositPaid || '').trim(); });
		if (badDeposit) {
			message.warning('请填写车辆「' + badDeposit.plateNo + '」的已缴纳押金');
			return false;
		}
		var badStatus = rows.find(function (v) {
			if (!v.vehicleStatus) return true;
			if (v.vehicleStatus === '库存' && !v.stockSubStatus) return true;
			return false;
		});
		if (badStatus) {
			message.warning('车辆「' + badStatus.plateNo + '」未获取到车辆状态，请重新选择车牌');
			return false;
		}
		return true;
	}, [form]);

	var handleSave = useCallback(function () {
		var record = buildRecordFromForm('待提交');
		setList(function (prev) {
			if (currentId) {
				return prev.map(function (r) { return r.id === currentId ? Object.assign({}, r, record) : r; });
			}
			return [record].concat(prev);
		});
		message.success('已保存（原型）');
		setEdited(false);
		if (!currentId) setCurrentId(record.id);
	}, [buildRecordFromForm, currentId]);

	var handleSubmit = useCallback(function () {
		if (!validateForm()) return;
		submitLoadingState[1](true);
		window.setTimeout(function () {
			var record = buildRecordFromForm('待审批');
			setList(function (prev) {
				if (currentId) {
					return prev.map(function (r) { return r.id === currentId ? Object.assign({}, r, record) : r; });
				}
				return [record].concat(prev);
			});
			submitLoadingState[1](false);
			message.success('已提交审批（原型）');
			backToList();
		}, 400);
	}, [validateForm, buildRecordFromForm, currentId, backToList]);

	var handleCancel = useCallback(function () {
		if (edited) cancelModalState[1](true);
		else backToList();
	}, [edited, backToList]);

	var handleFormBack = useCallback(function () {
		if (edited) cancelModalState[1](true);
		else backToList();
	}, [edited, backToList]);

	var handleSaveSettlement = useCallback(function () {
		var rows = (form.vehicles || []).filter(function (v) { return v.plateNo; });
		if (!rows.length) {
			message.warning('暂无车辆数据');
			return;
		}
		var bad = rows.find(function (v) { return !String(v.returnSettlementAmount || '').trim(); });
		if (bad) {
			message.warning('请填写车辆「' + bad.plateNo + '」的退车结算金额');
			return;
		}
		setList(function (prev) {
			return prev.map(function (r) {
				if (r.id !== currentId) return r;
				return Object.assign({}, r, {
					vehicles: (form.vehicles || []).map(function (v) {
						return Object.assign({}, v);
					}),
					settlementRemark: (form.settlementRemark || '').trim()
				});
			});
		});
		setEdited(false);
		message.success('结算明细已保存');
		backToList();
	}, [form, currentId, backToList]);

	var confirmDelete = useCallback(function (record) {
		setList(function (prev) { return prev.filter(function (r) { return r.id !== record.id; }); });
		deleteModalState[1]({ open: false, record: null });
		message.success('已删除');
	}, []);

	var handleBatchImport = useCallback(function () {
		var demoRows = [
			{ plateNo: '浙F88601', depositPaid: '12000.00' },
			{ plateNo: '浙A12345', depositPaid: '8500.50' },
			{ plateNo: '京A12345', depositPaid: '10000.00' }
		];
		var imported = demoRows.map(function (row) {
			var v = vehicleByPlate[row.plateNo];
			return {
				id: createEmptyVehicleRow().id,
				plateNo: row.plateNo,
				vehicleStatus: v ? v.vehicleStatus : undefined,
				stockSubStatus: v ? v.stockSubStatus : undefined,
				vin: v ? v.vin : '',
				brand: v ? v.brand : '',
				model: v ? v.model : '',
				depositPaid: row.depositPaid
			};
		});
		setEdited(true);
		setForm(function (prev) {
			var existing = (prev.vehicles || []).filter(function (r) { return r.plateNo; });
			return Object.assign({}, prev, { vehicles: existing.concat(imported) });
		});
		importModalState[1](false);
		message.success('已导入 ' + imported.length + ' 辆车辆（原型）');
	}, [vehicleByPlate]);

	var kpiStats = useMemo(function () {
		var draft = 0;
		var pending = 0;
		var done = 0;
		list.forEach(function (r) {
			if (r.approvalStatus === '待提交') draft += 1;
			else if (r.approvalStatus === '审批完成') done += 1;
			else pending += 1;
		});
		return { total: list.length, draft: draft, pending: pending, done: done };
	}, [list]);

	var filteredList = useMemo(function () {
		var st = listFilterStatusState[0];
		var f = listFilterAppliedState[0];
		return list.filter(function (r) {
			if (st === '__in_progress__') {
				if (['待审批', '审批中', '审批驳回', '撤回'].indexOf(r.approvalStatus) < 0) return false;
			} else if (st && r.approvalStatus !== st) return false;
			if (f.lessorName && r.lessorName !== f.lessorName) return false;
			if (f.lesseeId && r.lesseeId !== f.lesseeId) return false;
			if (f.creator && r.creator !== f.creator) return false;
			if (!matchVehicleFilters(r.vehicles, f)) return false;
			if (!matchCreateTimeRange(r.createTime, f.createTimeRange)) return false;
			return true;
		});
	}, [list, listFilterStatusState[0], listFilterAppliedState[0]]);

	function IconPlus() {
		return React.createElement('svg', { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', 'aria-hidden': true },
			React.createElement('line', { x1: 12, y1: 5, x2: 12, y2: 19 }),
			React.createElement('line', { x1: 5, y1: 12, x2: 19, y2: 12 }));
	}

	function IconDoc() {
		return React.createElement('svg', { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true },
			React.createElement('path', { d: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z' }),
			React.createElement('polyline', { points: '14 2 14 8 20 8' }));
	}

	function IconUpload() {
		return React.createElement('svg', { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true },
			React.createElement('path', { d: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4' }),
			React.createElement('polyline', { points: '17 8 12 3 7 8' }),
			React.createElement('line', { x1: 12, y1: 3, x2: 12, y2: 15 }));
	}

	function IconBack() {
		return React.createElement('svg', { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true },
			React.createElement('polyline', { points: '15 18 9 12 15 6' }));
	}

	function IconTruck() {
		return React.createElement('svg', { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true },
			React.createElement('rect', { x: 1, y: 3, width: 15, height: 13 }),
			React.createElement('polygon', { points: '16 8 20 8 23 11 23 16 16 16 16 8' }),
			React.createElement('circle', { cx: 5.5, cy: 18.5, r: 2.5 }),
			React.createElement('circle', { cx: 18.5, cy: 18.5, r: 2.5 }));
	}

	var pageCss =
		"@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400&display=swap');" +
		'.tra-page{--tra-primary:#2563EB;--tra-primary-soft:#EFF6FF;--tra-accent:#F97316;--tra-bg:#F8FAFC;--tra-surface:#FFFFFF;--tra-text:#1E293B;--tra-muted:#64748B;--tra-line:#E2E8F0;--tra-success:#059669;--tra-danger:#DC2626;font-family:"Plus Jakarta Sans",system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;color:var(--tra-text)}' +
		'.tra-page .tra-page-shell{max-width:1440px;margin:0 auto}' +
		'.tra-page .tra-page-topbar{display:flex;justify-content:flex-end;align-items:center;margin-bottom:16px}' +
		'.tra-page .tra-form-topbar{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:16px}' +
		'.tra-page .tra-form-topbar__left{display:flex;align-items:center;gap:10px;min-width:0}' +
		'.tra-page .tra-back-btn{display:inline-flex;align-items:center;gap:4px;padding:0 4px 0 0;font-size:14px;font-weight:600;color:var(--tra-text)!important;height:auto}' +
		'.tra-page .tra-back-btn:hover{color:var(--tra-primary)!important}' +
		'.tra-page .tra-page-header{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;margin-bottom:20px}' +
		'.tra-page .tra-page-hero{margin-bottom:20px}' +
		'.tra-page .tra-page-hero__title{font-size:22px;font-weight:700;color:var(--tra-text);line-height:1.3;margin:0 0 6px}' +
		'.tra-page .tra-page-hero__sub{font-size:14px;color:var(--tra-muted);line-height:1.55;margin:0}' +
		'.tra-page .tra-kpi-row{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;margin-bottom:16px}' +
		'@media(max-width:1024px){.tra-page .tra-kpi-row{grid-template-columns:repeat(2,minmax(0,1fr))}}' +
		'@media(max-width:640px){.tra-page .tra-kpi-row{grid-template-columns:1fr}}' +
		'.tra-page .tra-kpi-card{display:flex;align-items:flex-start;gap:12px;padding:14px 16px;border-radius:12px;border:1px solid var(--tra-line);background:var(--tra-surface);cursor:pointer;transition:border-color .2s ease,box-shadow .2s ease,transform .2s ease;touch-action:manipulation}' +
		'.tra-page .tra-kpi-card:hover{box-shadow:0 4px 14px rgba(37,99,235,.08);border-color:#BFDBFE}' +
		'.tra-page .tra-kpi-card.active{border-color:var(--tra-primary);box-shadow:0 0 0 2px rgba(37,99,235,.15)}' +
		'.tra-page .tra-kpi-card__icon{width:40px;height:40px;border-radius:10px;display:flex;align-items:center;justify-content:center;flex-shrink:0}' +
		'.tra-page .tra-kpi-card__icon--total{background:#E2E8F0;color:#475569}' +
		'.tra-page .tra-kpi-card__icon--draft{background:#F1F5F9;color:#64748B}' +
		'.tra-page .tra-kpi-card__icon--pending{background:#FFEDD5;color:#EA580C}' +
		'.tra-page .tra-kpi-card__icon--done{background:#D1FAE5;color:#059669}' +
		'.tra-page .tra-kpi-card__val{font-size:24px;font-weight:800;line-height:1.1;font-variant-numeric:tabular-nums;color:var(--tra-text)}' +
		'.tra-page .tra-kpi-card__label{font-size:13px;font-weight:600;color:#334155;margin-top:2px}' +
		'.tra-page .tra-list-filter-card{margin-bottom:16px;border-radius:16px;border:none;box-shadow:0 4px 24px -6px rgba(15,23,42,0.08),0 0 0 1px rgba(15,23,42,0.05);background:var(--tra-surface)}' +
		'.tra-page .tra-list-filter-card>.ant-card-body{padding:16px 24px 20px}' +
		'.tra-page .tra-list-filter-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:16px 24px;align-items:start}' +
		'@media(max-width:1200px){.tra-page .tra-list-filter-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}' +
		'@media(max-width:640px){.tra-page .tra-list-filter-grid{grid-template-columns:1fr}}' +
		'.tra-page .tra-list-filter-item{display:flex;flex-direction:column;gap:6px;min-width:0}' +
		'.tra-page .tra-list-filter-label{font-size:13px;font-weight:600;color:#334155;line-height:1.4}' +
		'.tra-page .tra-list-filter-control{width:100%}' +
		'.tra-page .tra-list-filter-actions{display:flex;justify-content:flex-end;gap:10px;margin-top:16px;padding-top:16px;border-top:1px solid #F1F5F9}' +
		'.tra-page .tra-filter-bar{display:flex;flex-wrap:wrap;align-items:center;gap:10px;margin-bottom:16px;padding:14px 16px;border-radius:12px;background:var(--tra-surface);border:1px solid var(--tra-line)}' +
		'.tra-page .tra-main-card{border-radius:16px;border:none;box-shadow:0 4px 24px -6px rgba(15,23,42,0.08),0 0 0 1px rgba(15,23,42,0.05);background:var(--tra-surface)}' +
		'.tra-page .tra-main-card>.ant-card-head{border-bottom:1px solid #f1f5f9;padding:16px 24px;min-height:auto}' +
		'.tra-page .tra-main-card>.ant-card-head .ant-card-head-title{font-size:16px;font-weight:700;color:var(--tra-text);padding:0}' +
		'.tra-page .tra-main-card>.ant-card-body{padding:20px 24px 24px}' +
		'.tra-page .tra-form-card{margin-bottom:16px}' +
		'.tra-page .tra-toolbar{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:16px;flex-wrap:wrap}' +
		'.tra-page .tra-toolbar__hint{font-size:13px;color:var(--tra-muted);line-height:1.5}' +
		'.tra-page .tra-table .ant-table-tbody>tr{cursor:default;transition:background .15s ease}' +
		'.tra-page .tra-table .ant-table-tbody>tr:hover>td{background:#F8FAFC!important}' +
		'.tra-page .tra-biz-no{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:13px;font-weight:600;color:var(--tra-primary)}' +
		'.tra-page .tra-vehicle-count-link{font-variant-numeric:tabular-nums;font-weight:600;color:var(--tra-primary);cursor:pointer;border:none;background:none;padding:0;line-height:inherit}' +
		'.tra-page .tra-vehicle-count-link:hover{text-decoration:underline;color:#1D4ED8}' +
		'.tra-vehicle-drill-modal .ant-modal-content{border-radius:16px!important;overflow:hidden;box-shadow:0 24px 48px -12px rgba(15,23,42,0.18)!important}' +
		'.tra-vehicle-drill-modal .ant-modal-header{padding:18px 24px 14px!important;border-bottom:1px solid #f1f5f9!important;margin-bottom:0!important}' +
		'.tra-vehicle-drill-modal .ant-modal-title{font-size:17px!important;font-weight:700!important;color:#0f172a!important}' +
		'.tra-vehicle-drill-modal .ant-modal-body{padding:16px 24px 20px!important;background:#f8fafc}' +
		'.tra-vehicle-drill-modal .ant-modal-footer{padding:12px 24px 18px!important;border-top:1px solid #f1f5f9!important;background:#fff}' +
		'.tra-vehicle-drill-modal .tra-vehicle-drill-panel{display:flex;flex-direction:column;gap:14px}' +
		'.tra-vehicle-drill-modal .tra-vehicle-drill-info-card{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;padding:12px 16px;background:linear-gradient(135deg,#eff6ff 0%,#ecfdf5 50%,#f8fafc 100%);border:1px solid #bfdbfe;border-radius:12px}' +
		'.tra-vehicle-drill-modal .tra-vehicle-drill-info-card__name{font-size:15px;font-weight:700;color:#0f172a;line-height:1.35}' +
		'.tra-vehicle-drill-modal .tra-vehicle-drill-info-card__meta{font-size:12px;color:#64748b;font-variant-numeric:tabular-nums;white-space:nowrap}' +
		'.tra-vehicle-drill-modal .tra-vehicle-drill-stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px}' +
		'@media(max-width:860px){.tra-vehicle-drill-modal .tra-vehicle-drill-stats{grid-template-columns:repeat(2,minmax(0,1fr))}}' +
		'@media(max-width:520px){.tra-vehicle-drill-modal .tra-vehicle-drill-stats{grid-template-columns:1fr}}' +
		'.tra-vehicle-drill-modal .tra-vehicle-drill-stat{display:flex;flex-direction:column;justify-content:center;min-height:78px;padding:12px 14px;border-radius:12px;border:1px solid #e2e8f0;background:#fff;box-shadow:0 1px 3px rgba(15,23,42,0.06);min-width:0;box-sizing:border-box}' +
		'.tra-vehicle-drill-modal .tra-vehicle-drill-stat--count{border-left:4px solid #3b82f6}' +
		'.tra-vehicle-drill-modal .tra-vehicle-drill-stat--deposit{border-left:4px solid #10b981;background:linear-gradient(180deg,#fff 0%,#f0fdf4 100%)}' +
		'.tra-vehicle-drill-modal .tra-vehicle-drill-stat--return{border-left:4px solid #f97316}' +
		'.tra-vehicle-drill-modal .tra-vehicle-drill-stat--company{border-left:4px solid #6366f1}' +
		'.tra-vehicle-drill-modal .tra-vehicle-drill-stat__label{font-size:12px;font-weight:600;color:#64748b;margin-bottom:8px;line-height:1.2}' +
		'.tra-vehicle-drill-modal .tra-vehicle-drill-stat__value{font-size:20px;font-weight:800;font-variant-numeric:tabular-nums;line-height:1.2;color:#0f172a;word-break:break-all}' +
		'.tra-vehicle-drill-modal .tra-vehicle-drill-stat__value--count{color:#2563eb}' +
		'.tra-vehicle-drill-modal .tra-vehicle-drill-stat__value--deposit{color:#059669}' +
		'.tra-vehicle-drill-modal .tra-vehicle-drill-stat__value--return{color:#ea580c}' +
		'.tra-vehicle-drill-modal .tra-vehicle-drill-stat__value--company{color:#4f46e5}' +
		'.tra-vehicle-drill-modal .tra-vehicle-drill-table-wrap{background:#fff;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(15,23,42,0.04)}' +
		'.tra-vehicle-drill-modal .tra-vehicle-drill-table-head{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:10px 14px;border-bottom:1px solid #f1f5f9;background:#fafbfc}' +
		'.tra-vehicle-drill-modal .tra-vehicle-drill-table-head__left{display:flex;align-items:center;gap:10px;min-width:0}' +
		'.tra-vehicle-drill-modal .tra-vehicle-drill-table-head__title{font-size:13px;font-weight:700;color:#334155}' +
		'.tra-vehicle-drill-modal .tra-vehicle-drill-table-head__count{font-size:12px;color:#64748b;font-variant-numeric:tabular-nums}' +
		'.tra-vehicle-drill-modal .tra-vehicle-drill-table{border-radius:0!important}' +
		'.tra-vehicle-drill-modal .tra-vehicle-drill-table .ant-table{background:transparent!important}' +
		'.tra-vehicle-drill-modal .tra-vehicle-drill-table .ant-table-container{border:none!important}' +
		'.tra-vehicle-drill-modal .tra-vehicle-drill-table .ant-table-thead>tr>th{background:#f8fafc!important;font-size:12px!important;font-weight:700!important;color:#475569!important;padding:10px 12px!important;border-bottom:1px solid #e2e8f0!important}' +
		'.tra-vehicle-drill-modal .tra-vehicle-drill-table .ant-table-tbody>tr:not(.ant-table-measure-row)>td{font-size:13px!important;padding:10px 12px!important;vertical-align:middle!important;border-bottom:1px solid #f8fafc!important}' +
		'.tra-vehicle-drill-modal .tra-vehicle-drill-table .ant-table-tbody>tr:not(.ant-table-measure-row):last-child>td{border-bottom:none!important}' +
		'.tra-vehicle-drill-modal .tra-vehicle-drill-table .ant-table-tbody>tr:hover>td{background:#eff6ff!important}' +
		'.tra-vehicle-drill-modal .tra-vehicle-drill-plate{font-weight:700;color:#0f172a;font-variant-numeric:tabular-nums}' +
		'.tra-vehicle-drill-modal .tra-vehicle-drill-text{color:#334155}' +
		'.tra-vehicle-drill-modal .tra-vehicle-drill-money{font-variant-numeric:tabular-nums;white-space:nowrap;font-weight:600}' +
		'.tra-vehicle-drill-modal .tra-vehicle-drill-money--deposit{color:#059669}' +
		'.tra-vehicle-drill-modal .tra-vehicle-drill-money--return{color:#ea580c}' +
		'.tra-vehicle-drill-modal .tra-vehicle-drill-money--company{color:#4f46e5;font-weight:700}' +
		'.tra-page .tra-section{margin-bottom:20px}' +
		'.tra-page .tra-section__head{display:flex;align-items:center;gap:10px;margin-bottom:14px;padding-bottom:10px;border-bottom:1px solid #F1F5F9}' +
		'.tra-page .tra-section__index{width:26px;height:26px;border-radius:8px;background:var(--tra-primary-soft);color:var(--tra-primary);font-size:12px;font-weight:800;display:flex;align-items:center;justify-content:center;flex-shrink:0}' +
		'.tra-page .tra-section__title{font-size:15px;font-weight:700;color:var(--tra-text)}' +
		'.tra-page .tra-section__hint{font-size:12px;color:var(--tra-muted);margin-left:auto}' +
		'.tra-page .tra-form-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px 20px}' +
		'@media(max-width:900px){.tra-page .tra-form-grid{grid-template-columns:1fr}}' +
		'.tra-page .tra-field{display:flex;flex-direction:column;gap:6px;min-width:0}' +
		'.tra-page .tra-field.full{grid-column:1/-1}' +
		'.tra-page .tra-field.half-row{grid-column:1/-1}' +
		'.tra-page .tra-field__control--half{width:50%;max-width:50%}' +
		'@media(max-width:900px){.tra-page .tra-field__control--half{width:100%;max-width:100%}}' +
		'.tra-page .tra-field__label{font-size:13px;font-weight:600;color:#334155;line-height:1.4}' +
		'.tra-page .tra-field__label .tra-req{color:var(--tra-danger);margin-right:2px}' +
		'.tra-page .tra-field__helper{font-size:12px;color:var(--tra-muted);line-height:1.45;margin-top:2px}' +
		'.tra-page .tra-readonly-val{min-height:32px;padding:6px 12px;border-radius:8px;background:#F8FAFC;border:1px solid #E2E8F0;font-size:14px;color:var(--tra-text);line-height:1.5;word-break:break-all}' +
		'.tra-page .tra-readonly-val--muted{color:var(--tra-muted)}' +
		'.tra-page .tra-staff-tags{display:flex;flex-wrap:wrap;gap:6px}' +
		'.tra-page .tra-vehicle-block{padding:16px 18px;border-radius:12px;border:1px solid var(--tra-line);background:linear-gradient(180deg,#fff 0%,#F8FAFC 100%)}' +
		'.tra-page .tra-vehicle-block__head{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:12px;flex-wrap:wrap}' +
		'.tra-page .tra-vehicle-block__title{display:flex;align-items:center;gap:8px;font-size:14px;font-weight:700;color:var(--tra-text)}' +
		'.tra-page .tra-vehicle-block__count{font-size:12px;font-weight:600;color:var(--tra-muted);background:#F1F5F9;padding:2px 8px;border-radius:999px}' +
		'.tra-page .tra-footer{display:flex;flex-wrap:wrap;gap:10px;margin-top:24px;padding-top:20px;border-top:1px solid #f1f5f9}' +
		'.tra-page .tra-footer--sticky{position:sticky;bottom:0;z-index:10;background:linear-gradient(180deg,rgba(255,255,255,0) 0%,#fff 24%);padding-bottom:8px;margin-bottom:-8px}' +
		'.tra-page .tra-link-btn.ant-btn-link{color:var(--tra-primary);font-weight:600}' +
		'.tra-page .tra-link-btn.ant-btn-link:hover{color:#1D4ED8}' +
		'.tra-page .tra-row-actions{display:flex;align-items:center;gap:4px}' +
		'.tra-page .tra-action-more-btn{display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;border-radius:8px;color:#64748b;cursor:pointer;transition:background .15s ease,color .15s ease}' +
		'.tra-page .tra-action-more-btn:hover{background:#f1f5f9;color:#334155}' +
		'.tra-page .tra-action-more-btn:focus-visible{outline:2px solid var(--tra-primary);outline-offset:2px}' +
		'.tra-page .tra-empty-action{margin-top:12px}' +
		'.tra-page .tra-import-tip{padding:12px 14px;border-radius:10px;background:var(--tra-primary-soft);border:1px solid #BFDBFE;font-size:13px;color:#1E40AF;line-height:1.6;margin-bottom:14px}' +
		'.tra-page .tra-form-status{display:inline-flex;align-items:center;gap:6px;margin-left:10px;vertical-align:middle}' +
		'.tra-req-doc{padding:4px 2px 8px;font-size:13px;color:#475569;line-height:1.75}' +
		'.tra-req-doc h3{font-size:15px;font-weight:700;color:var(--tra-text);margin:16px 0 8px}' +
		'.tra-req-doc p{margin:0 0 6px}' +
		'.tra-page button,.tra-page .ant-btn,.tra-page .tra-kpi-card{cursor:pointer}' +
		'.tra-page .ant-btn:focus-visible,.tra-page .tra-kpi-card:focus-visible{outline:2px solid var(--tra-primary);outline-offset:2px}' +
		'@media(prefers-reduced-motion:reduce){.tra-page .tra-kpi-card,.tra-page .tra-table .ant-table-tbody>tr{transition:none}}';

	function renderField(label, required, node, layout, helper) {
		var fieldCls = 'tra-field';
		if (layout === true || layout === 'full') fieldCls += ' full';
		else if (layout === 'halfRow') fieldCls += ' half-row';
		var controlNode = layout === 'halfRow'
			? React.createElement('div', { className: 'tra-field__control tra-field__control--half' }, node)
			: node;
		return React.createElement(
			'div',
			{ className: fieldCls },
			React.createElement(
				'div',
				{ className: 'tra-field__label' },
				required ? React.createElement('span', { className: 'tra-req', 'aria-hidden': true }, '*') : null,
				label
			),
			controlNode,
			helper ? React.createElement('div', { className: 'tra-field__helper' }, helper) : null
		);
	}

	function renderReadonlyVal(text, muted) {
		return React.createElement('div', { className: 'tra-readonly-val' + (muted || !text ? ' tra-readonly-val--muted' : '') }, text || '—');
	}

	function renderKpiCard(key, label, value, iconCls, filterVal) {
		var active = listFilterStatusState[0] === filterVal;
		return React.createElement('div', {
			key: key,
			className: 'tra-kpi-card' + (active ? ' active' : ''),
			role: 'button',
			tabIndex: 0,
			'aria-pressed': active,
			onClick: function () {
				listFilterStatusState[1](active ? '' : filterVal);
			},
			onKeyDown: function (e) {
				if (e.key === 'Enter' || e.key === ' ') {
					e.preventDefault();
					listFilterStatusState[1](active ? '' : filterVal);
				}
			}
		},
			React.createElement('div', { className: 'tra-kpi-card__icon ' + iconCls }, React.createElement(IconDoc)),
			React.createElement('div', null,
				React.createElement('div', { className: 'tra-kpi-card__val' }, value),
				React.createElement('div', { className: 'tra-kpi-card__label' }, label)
			)
		);
	}

	function IconMore() {
		return React.createElement('svg', {
			viewBox: '0 0 16 16',
			width: 16,
			height: 16,
			fill: 'currentColor',
			'aria-hidden': true
		},
			React.createElement('circle', { cx: 8, cy: 3, r: 1.5 }),
			React.createElement('circle', { cx: 8, cy: 8, r: 1.5 }),
			React.createElement('circle', { cx: 8, cy: 13, r: 1.5 })
		);
	}

	function canViewSettlementDetail(record) {
		return record && record.approvalStatus === '审批完成' && record.vehicleCount > 0;
	}

	function getListRowMoreMenuItems(record) {
		var items = [];
		if (canEditRecord(record)) {
			items.push({
				key: 'edit',
				label: '编辑',
				onClick: function () { openFormFromRecord(record, 'edit'); }
			});
		}
		if (canViewSettlementDetail(record)) {
			items.push({
				key: 'settle',
				label: '结算明细',
				onClick: function () {
					openSettlementFromRecord(record);
				}
			});
		}
		if (record.approvalStatus === '待审批' || record.approvalStatus === '审批中') {
			items.push({
				key: 'mockApprove',
				label: '模拟审批通过',
				onClick: function () {
					setList(function (prev) {
						return prev.map(function (r) {
							if (r.id !== record.id) return r;
							return Object.assign({}, r, { approvalStatus: '审批完成', currentApprover: '—' });
						});
					});
					message.success('已模拟审批通过，将为车辆自动生成退租任务');
				}
			});
		}
		if (record.approvalStatus === '待提交') {
			if (items.length) items.push({ type: 'divider' });
			items.push({
				key: 'delete',
				label: '删除',
				danger: true,
				onClick: function () {
					Modal.confirm({
						title: '确认删除该退租申请？',
						okText: '删除',
						okType: 'danger',
						cancelText: '取消',
						onOk: function () { confirmDelete(record); }
					});
				}
			});
		}
		return items;
	}

	function renderListPage() {
		var columns = [
			{
				title: '申请单号',
				dataIndex: 'bizNo',
				key: 'bizNo',
				width: 130,
				fixed: 'left',
				render: function (text) {
					return React.createElement('span', { className: 'tra-biz-no' }, text);
				}
			},
			{ title: '预计退租时间', dataIndex: 'expectedReturnDate', key: 'expectedReturnDate', width: 120 },
			{ title: '出租方', dataIndex: 'lessorName', key: 'lessorName', width: 180, ellipsis: { showTitle: true } },
			{ title: '承租方', dataIndex: 'lesseeName', key: 'lesseeName', width: 200, ellipsis: { showTitle: true } },
			{ title: '退车地点', dataIndex: 'deliveryRegionText', key: 'deliveryRegionText', width: 140 },
			{
				title: '车辆数',
				dataIndex: 'vehicleCount',
				key: 'vehicleCount',
				width: 72,
				align: 'center',
				render: function (n, record) {
					if (!n) return React.createElement('span', { style: { color: 'var(--tra-muted)' } }, '0');
					if (!canViewSettlementDetail(record)) {
						return React.createElement('span', { style: { fontVariantNumeric: 'tabular-nums', fontWeight: 600 } }, n);
					}
					return React.createElement('button', {
						type: 'button',
						className: 'tra-vehicle-count-link',
						onClick: function () {
							openSettlementFromRecord(record);
						}
					}, n);
				}
			},
			{
				title: '审批状态',
				dataIndex: 'approvalStatus',
				key: 'approvalStatus',
				width: 100,
				render: function (text) {
					return React.createElement(Tag, { color: APPROVAL_STATUS_COLOR[text] || 'default' }, text);
				}
			},
			{ title: '当前审批人', dataIndex: 'currentApprover', key: 'currentApprover', width: 110 },
			{ title: '创建人', dataIndex: 'creator', key: 'creator', width: 100 },
			{ title: '创建时间', dataIndex: 'createTime', key: 'createTime', width: 168 },
			{
				title: '操作',
				key: 'action',
				width: 108,
				fixed: 'right',
				render: function (_, record) {
					var moreItems = getListRowMoreMenuItems(record);
					return React.createElement('div', { className: 'tra-row-actions' },
						React.createElement(Button, {
							type: 'link',
							size: 'small',
							onClick: function () { openFormFromRecord(record, 'view'); }
						}, '查看'),
						moreItems.length
							? React.createElement(Dropdown, {
								trigger: ['hover'],
								placement: 'bottomRight',
								menu: { items: moreItems }
							},
								React.createElement(Tooltip, { title: '更多' },
									React.createElement('span', {
										className: 'tra-action-more-btn',
										role: 'button',
										tabIndex: 0,
										'aria-label': '更多操作',
										onClick: function (e) { e.stopPropagation(); }
									}, React.createElement(IconMore))
								)
							)
							: null
					);
				}
			}
		];

		return React.createElement(
			'div',
			{ className: 'tra-page', style: { padding: '20px 24px 32px', minHeight: '100vh', background: 'var(--tra-bg, #F8FAFC)' } },
			React.createElement('style', null, pageCss),
			React.createElement('div', { className: 'tra-page-shell' },
			React.createElement(
				'div',
				{ className: 'tra-page-topbar' },
				React.createElement(
					Button,
					{ type: 'link', className: 'tra-link-btn', style: { padding: 0 }, onClick: function () { requirementModalState[1](true); } },
					'查看需求说明'
				)
			),
			React.createElement(
				Card,
				{ className: 'tra-list-filter-card' },
				React.createElement(
					'div',
					{ className: 'tra-list-filter-grid' },
					React.createElement(
						'div',
						{ className: 'tra-list-filter-item' },
						React.createElement('span', { className: 'tra-list-filter-label' }, '出租方'),
						React.createElement(Select, {
							className: 'tra-list-filter-control',
							placeholder: '请选择出租方',
							allowClear: true,
							showSearch: true,
							value: listFilterDraftState[0].lessorName,
							onChange: function (v) {
								listFilterDraftState[1](Object.assign({}, listFilterDraftState[0], { lessorName: v }));
							},
							options: lessorOptions,
							filterOption: filterOption
						})
					),
					React.createElement(
						'div',
						{ className: 'tra-list-filter-item' },
						React.createElement('span', { className: 'tra-list-filter-label' }, '承租方'),
						React.createElement(Select, {
							className: 'tra-list-filter-control',
							placeholder: '请选择承租方',
							allowClear: true,
							showSearch: true,
							value: listFilterDraftState[0].lesseeId,
							onChange: function (v) {
								listFilterDraftState[1](Object.assign({}, listFilterDraftState[0], { lesseeId: v }));
							},
							options: LESSEE_OPTIONS,
							filterOption: filterOption
						})
					),
					React.createElement(
						'div',
						{ className: 'tra-list-filter-item' },
						React.createElement('span', { className: 'tra-list-filter-label' }, '车牌号'),
						React.createElement(Select, {
							className: 'tra-list-filter-control',
							placeholder: '请选择车牌号',
							allowClear: true,
							showSearch: true,
							value: listFilterDraftState[0].plateNo,
							onChange: function (v) {
								listFilterDraftState[1](Object.assign({}, listFilterDraftState[0], { plateNo: v }));
							},
							options: listPlateOptions,
							filterOption: filterOption
						})
					),
					React.createElement(
						'div',
						{ className: 'tra-list-filter-item' },
						React.createElement('span', { className: 'tra-list-filter-label' }, '车辆识别代码'),
						React.createElement(Select, {
							className: 'tra-list-filter-control',
							placeholder: '请选择车辆识别代码',
							allowClear: true,
							showSearch: true,
							value: listFilterDraftState[0].vin,
							onChange: function (v) {
								listFilterDraftState[1](Object.assign({}, listFilterDraftState[0], { vin: v }));
							},
							options: listVinOptions,
							filterOption: filterOption
						})
					),
					React.createElement(
						'div',
						{ className: 'tra-list-filter-item' },
						React.createElement('span', { className: 'tra-list-filter-label' }, '品牌'),
						React.createElement(Select, {
							className: 'tra-list-filter-control',
							placeholder: '请选择品牌',
							allowClear: true,
							showSearch: true,
							value: listFilterDraftState[0].brand,
							onChange: function (v) {
								listFilterDraftState[1](Object.assign({}, listFilterDraftState[0], { brand: v }));
							},
							options: listBrandOptions,
							filterOption: filterOption
						})
					),
					React.createElement(
						'div',
						{ className: 'tra-list-filter-item' },
						React.createElement('span', { className: 'tra-list-filter-label' }, '型号'),
						React.createElement(Select, {
							className: 'tra-list-filter-control',
							placeholder: '请选择型号',
							allowClear: true,
							showSearch: true,
							value: listFilterDraftState[0].model,
							onChange: function (v) {
								listFilterDraftState[1](Object.assign({}, listFilterDraftState[0], { model: v }));
							},
							options: listModelOptions,
							filterOption: filterOption
						})
					),
					React.createElement(
						'div',
						{ className: 'tra-list-filter-item' },
						React.createElement('span', { className: 'tra-list-filter-label' }, '创建人'),
						React.createElement(Select, {
							className: 'tra-list-filter-control',
							placeholder: '请选择创建人',
							allowClear: true,
							showSearch: true,
							value: listFilterDraftState[0].creator,
							onChange: function (v) {
								listFilterDraftState[1](Object.assign({}, listFilterDraftState[0], { creator: v }));
							},
							options: creatorOptions,
							filterOption: filterOption
						})
					),
					React.createElement(
						'div',
						{ className: 'tra-list-filter-item' },
						React.createElement('span', { className: 'tra-list-filter-label' }, '创建时间'),
						React.createElement(RangePicker, {
							className: 'tra-list-filter-control',
							style: { width: '100%', maxWidth: 360 },
							placeholder: ['开始日期', '结束日期'],
							format: 'YYYY-MM-DD',
							value: listFilterDraftState[0].createTimeRange,
							onChange: function (v) {
								listFilterDraftState[1](Object.assign({}, listFilterDraftState[0], { createTimeRange: v }));
							}
						})
					)
				),
				React.createElement(
					'div',
					{ className: 'tra-list-filter-actions' },
					React.createElement(Button, { onClick: handleFilterReset }, '重置'),
					React.createElement(Button, { type: 'primary', onClick: handleFilterSearch }, '搜索')
				)
			),
			React.createElement(
				Card,
				{ className: 'tra-main-card' },
				React.createElement(
					'div',
					{ className: 'tra-kpi-row', role: 'group', 'aria-label': '申请统计' },
					renderKpiCard('total', '全部申请', kpiStats.total, 'tra-kpi-card__icon--total', ''),
					renderKpiCard('draft', '待提交', kpiStats.draft, 'tra-kpi-card__icon--draft', '待提交'),
					renderKpiCard('pending', '审批进行中', kpiStats.pending, 'tra-kpi-card__icon--pending', '__in_progress__'),
					renderKpiCard('done', '审批完成', kpiStats.done, 'tra-kpi-card__icon--done', '审批完成')
				),
				React.createElement(
					'div',
					{ className: 'tra-toolbar', style: { justifyContent: 'flex-end' } },
					React.createElement(Button, { type: 'primary', icon: React.createElement(IconPlus), onClick: openAdd }, '新增')
				),
				filteredList.length
					? React.createElement(Table, {
						className: 'tra-table',
						rowKey: 'id',
						columns: columns,
						dataSource: filteredList,
						size: 'middle',
						scroll: { x: 1500 },
						pagination: { pageSize: 10, showSizeChanger: true, showTotal: function (t) { return '共 ' + t + ' 条'; } }
					})
					: React.createElement(Empty, {
						description: list.length ? '暂无匹配结果，请调整筛选条件' : '暂无退租申请',
						children: list.length ? null : React.createElement(Button, { type: 'primary', className: 'tra-empty-action', onClick: openAdd }, '立即新增')
					})
			),
			React.createElement(Modal, {
				title: '三方退租申请 · 需求说明',
				open: requirementModalState[0],
				onCancel: function () { requirementModalState[1](false); },
				width: 720,
				footer: React.createElement(Button, { type: 'primary', onClick: function () { requirementModalState[1](false); } }, '关闭')
			}, React.createElement(
				'div',
				{ className: 'tra-req-doc' },
				React.createElement('p', null, '采购管理 / 三方退租申请。列表管理全部申请；支持新增、查看、编辑（待提交/审批驳回/撤回）、删除（仅待提交）。'),
				React.createElement('h3', null, '表单字段'),
				React.createElement('p', null, '预计退租时间（到日）、出租方信息（手动填写全称）、承租方（羚牛各分公司）、退车地点（省-市级联）、退车人员（运维姓名多选）、车辆信息（车牌号、车辆状态、VIN/品牌/型号自动反写、已缴纳押金 2 位小数，支持批量导入）。'),
				React.createElement('h3', null, '操作'),
				React.createElement('p', null, '保存：草稿待提交；提交：进入审批流程。')
			))
			)
		);
	}

	function renderVehicleTable() {
		var columns = [
			{
				title: '车牌号',
				dataIndex: 'plateNo',
				width: 140,
				render: function (_, row) {
					return readOnly
						? React.createElement('span', { className: 'tra-biz-no' }, row.plateNo || '—')
						: React.createElement(Select, {
							placeholder: '请选择车牌号',
							style: { width: '100%' },
							value: row.plateNo,
							onChange: function (v) { onPlateChange(row.id, v); },
							allowClear: true,
							showSearch: true,
							options: plateOptions,
							filterOption: filterOption
						});
				}
			},
			{
				title: '车辆状态',
				dataIndex: 'vehicleStatus',
				width: 130,
				render: function (_, row) {
					return renderVehicleStatusTag(row);
				}
			},
			{
				title: '车辆识别代码',
				dataIndex: 'vin',
				width: 200,
				ellipsis: true,
				render: function (text) {
					return readOnly
						? React.createElement('span', { style: { fontFamily: 'ui-monospace,monospace', fontSize: 12 } }, text || '—')
						: React.createElement(Input, { value: text || '', disabled: true, placeholder: '选择车牌后自动获取' });
				}
			},
			{
				title: '品牌',
				dataIndex: 'brand',
				width: 120,
				render: function (text) {
					return React.createElement(Input, { value: text || '', disabled: true, placeholder: '自动获取' });
				}
			},
			{
				title: '型号',
				dataIndex: 'model',
				width: 180,
				ellipsis: true,
				render: function (text) {
					return React.createElement(Input, { value: text || '', disabled: true, placeholder: '自动获取' });
				}
			},
			{
				title: '已缴纳押金',
				dataIndex: 'depositPaid',
				width: 140,
				render: function (_, row) {
					return readOnly
						? React.createElement('span', { style: { fontVariantNumeric: 'tabular-nums', fontWeight: 600 } }, row.depositPaid ? '￥' + row.depositPaid : '—')
						: React.createElement(Input, {
							value: row.depositPaid || '',
							placeholder: '0.00',
							addonBefore: '￥',
							onChange: function (e) {
								updateVehicleRow(row.id, { depositPaid: toFixed2Input(e.target.value) });
							}
						});
				}
			}
		];

		if (isSettlementPage) {
			columns.push({
				title: '退车结算金额',
				dataIndex: 'returnSettlementAmount',
				width: 150,
				render: function (_, row) {
					if (!row.plateNo) return React.createElement('span', { style: { color: 'var(--tra-muted)' } }, '—');
					return React.createElement(Input, {
						value: row.returnSettlementAmount || '',
						placeholder: '0.00',
						addonBefore: '￥',
						onChange: function (e) {
							updateVehicleRow(row.id, { returnSettlementAmount: toFixed2Input(e.target.value) });
						}
					});
				}
			});
		}

		if (!readOnly) {
			columns.push({
				title: '操作',
				key: 'op',
				width: 72,
				render: function (_, row) {
					return React.createElement(Button, {
						type: 'link',
						size: 'small',
						danger: true,
						onClick: function () { removeVehicleRow(row.id); }
					}, '删除');
				}
			});
		}

		return React.createElement(Table, {
			rowKey: 'id',
			columns: columns,
			dataSource: form.vehicles || [],
			size: 'small',
			pagination: false,
			locale: { emptyText: '请添加车辆或批量导入' }
		});
	}

	function renderFormPage() {
		var currentRecord = currentId ? list.find(function (x) { return x.id === currentId; }) : null;
		var vehicleCount = (form.vehicles || []).filter(function (v) { return v.plateNo; }).length;

		return React.createElement(
			'div',
			{ className: 'tra-page', style: { padding: '20px 24px 32px', minHeight: '100vh', background: 'linear-gradient(165deg,#EFF6FF 0%,#F8FAFC 42%,#F1F5F9 100%)' } },
			React.createElement('style', null, pageCss),
			React.createElement('div', { className: 'tra-page-shell' },
			React.createElement(
				'div',
				{ className: 'tra-form-topbar' },
				React.createElement(
					'div',
					{ className: 'tra-form-topbar__left' },
					React.createElement(Button, {
						type: 'link',
						className: 'tra-back-btn',
						icon: React.createElement(IconBack),
						onClick: handleFormBack
					}, '返回'),
					readOnly && currentRecord
						? React.createElement(React.Fragment, null,
							React.createElement(Tag, { color: APPROVAL_STATUS_COLOR[currentRecord.approvalStatus] || 'default' }, currentRecord.approvalStatus),
							isSettlementPage ? React.createElement(Tag, { color: 'orange' }, '结算明细') : null
						)
						: null
				),
				React.createElement(
					Button,
					{ type: 'link', className: 'tra-link-btn', style: { padding: 0 }, onClick: function () { requirementModalState[1](true); } },
					'查看需求说明'
				)
			),
			React.createElement(
				Card,
				{ className: 'tra-main-card tra-form-card', title: '退租基本信息' },
				React.createElement(
					'div',
					{ className: 'tra-form-grid' },
					renderField(
						'预计退租时间',
						true,
						readOnly
							? renderReadonlyVal(form.expectedReturnDate)
							: React.createElement(DatePicker, {
								style: { width: '100%' },
								value: form.expectedReturnDate ? (window.dayjs ? window.dayjs(form.expectedReturnDate) : undefined) : null,
								onChange: function (_, dateStr) { updateForm({ expectedReturnDate: dateStr || null }); },
								format: 'YYYY-MM-DD',
								placeholder: '请选择日期',
								disabled: readOnly
							}),
						'halfRow',
						isSettlementPage ? false : '精确到日，用于安排退车与结算节点'
					),
					renderField(
						'承租方信息',
						true,
						readOnly
							? renderReadonlyVal(lesseeLabel(form.lesseeId))
							: React.createElement(Select, {
								placeholder: '请选择羚牛分公司',
								style: { width: '100%' },
								value: form.lesseeId,
								onChange: function (v) { updateForm({ lesseeId: v }); },
								allowClear: true,
								showSearch: true,
								options: LESSEE_OPTIONS,
								filterOption: filterOption,
								disabled: readOnly
							}),
						false,
						'选择羚牛体系内承租分公司'
					),
					renderField(
						'出租方信息',
						true,
						readOnly
							? renderReadonlyVal(form.lessorName)
							: React.createElement(Input, {
								placeholder: '请输入出租方企业全称',
								value: form.lessorName,
								onChange: function (e) { updateForm({ lessorName: e.target.value }); },
								disabled: readOnly,
								maxLength: 120
							}),
						false
					),
					renderField(
						'退车地点',
						true,
						readOnly
							? renderReadonlyVal(regionTextFromValue(form.deliveryRegion))
							: React.createElement(Cascader, {
								options: REGION_OPTIONS,
								value: form.deliveryRegion,
								onChange: function (v) { updateForm({ deliveryRegion: v }); },
								placeholder: '请选择省 / 市',
								style: { width: '100%' },
								disabled: readOnly
							}),
						false
					),
					renderField(
						'退车人员',
						true,
						readOnly
							? React.createElement('div', { className: 'tra-staff-tags' },
								(form.returnStaff || []).length
									? (form.returnStaff || []).map(function (name) {
										return React.createElement(Tag, { key: name, color: 'blue' }, name);
									})
									: renderReadonlyVal('', true))
							: React.createElement(Select, {
								mode: 'multiple',
								placeholder: '请选择负责验车与交接的运维人员',
								style: { width: '100%' },
								value: form.returnStaff || [],
								onChange: function (v) { updateForm({ returnStaff: v || [] }); },
								allowClear: true,
								showSearch: true,
								options: OPS_STAFF_OPTIONS,
								filterOption: filterOption,
								disabled: readOnly,
								maxTagCount: 'responsive'
							}),
						false
					)
				)
			),
			React.createElement(
				Card,
				{
					className: 'tra-main-card tra-form-card',
					title: React.createElement(
						'span',
						{ className: 'tra-vehicle-block__title' },
						React.createElement(IconTruck),
						'车辆信息',
						React.createElement('span', { className: 'tra-vehicle-block__count' }, vehicleCount + ' 辆')
					),
					extra: readOnly ? null : React.createElement(Space, { size: 8 },
						React.createElement(Button, { icon: React.createElement(IconUpload), onClick: function () { importModalState[1](true); } }, '批量导入'),
						React.createElement(Button, { type: 'dashed', icon: React.createElement(IconPlus), onClick: addVehicleRow }, '新增一行')
					)
				},
				renderVehicleTable(),
				isSettlementPage ? React.createElement(
					'div',
					{ className: 'tra-settlement-remark', style: { marginTop: 20 } },
					React.createElement('div', { className: 'tra-field-label', style: { marginBottom: 8, fontSize: 13, fontWeight: 600, color: '#334155' } }, '备注'),
					React.createElement(Input.TextArea, {
						value: form.settlementRemark || '',
						onChange: function (e) { updateForm({ settlementRemark: e.target.value }); },
						placeholder: '请输入结算备注',
						rows: 4,
						maxLength: 500,
						showCount: true
					})
				) : null
			),
			isSettlementPage ? React.createElement(
				'div',
				{ className: 'tra-footer tra-footer--sticky' },
				React.createElement(Button, { type: 'primary', size: 'large', onClick: handleSaveSettlement }, '保存'),
				React.createElement(Button, { size: 'large', onClick: handleFormBack }, '返回')
			) : readOnly ? null : React.createElement(
					'div',
					{ className: 'tra-footer tra-footer--sticky' },
					React.createElement(Button, { type: 'primary', size: 'large', loading: submitLoadingState[0], onClick: handleSubmit }, '提交'),
					React.createElement(Button, { size: 'large', onClick: handleSave }, '保存'),
					React.createElement(Button, { size: 'large', onClick: handleCancel }, '取消')
				),
			!isSettlementPage && readOnly ? React.createElement(
					'div',
					{ className: 'tra-footer' },
					canEditRecord(currentRecord || {})
						? React.createElement(Button, { type: 'primary', size: 'large', onClick: function () { setFormMode('edit'); } }, '编辑')
						: null,
					React.createElement(Button, { size: 'large', onClick: backToList }, '返回列表')
				) : null,
			React.createElement(Modal, {
				title: '批量导入车辆',
				open: importModalState[0],
				onCancel: function () { importModalState[1](false); },
				onOk: handleBatchImport,
				okText: '确认导入（原型）',
				cancelText: '取消'
			}, React.createElement(
				'div',
				null,
				React.createElement('div', { className: 'tra-import-tip' }, '模板列：车牌号、已缴纳押金。上传后系统将根据车牌号自动匹配 VIN、品牌与型号。'),
				React.createElement(Upload.Dragger, {
					multiple: false,
					accept: '.xlsx,.xls,.csv',
					beforeUpload: function () { return false; },
					showUploadList: false
				}, React.createElement('p', { style: { margin: 0, color: '#64748B' } }, '点击或拖拽上传 Excel（原型将导入示例 3 条）'))
			)),
			React.createElement(Modal, {
				title: '取消将会丢失所有已填写内容，是否确认？',
				open: cancelModalState[0],
				onCancel: function () { cancelModalState[1](false); },
				onOk: function () { cancelModalState[1](false); backToList(); },
				okText: '确认',
				cancelText: '返回'
			}),
			React.createElement(Modal, {
				title: '三方退租申请 · 需求说明',
				open: requirementModalState[0],
				onCancel: function () { requirementModalState[1](false); },
				width: 720,
				footer: React.createElement(Button, { type: 'primary', onClick: function () { requirementModalState[1](false); } }, '关闭')
			}, React.createElement('div', { className: 'tra-req-doc' }, React.createElement('p', null, '参照替换车管理新增页交互；由采购填写退租信息并提交审批。')))
			)
		);
	}

	return pageMode === 'list' ? renderListPage() : renderFormPage();
};
