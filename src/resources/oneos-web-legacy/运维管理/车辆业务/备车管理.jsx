// 【重要】必须使用 const Component 作为组件变量名
// 备车管理 - 车辆资产管理后台（按 antd 规范）

const Component = function () {
	var useState = React.useState;
	var useCallback = React.useCallback;
	var useMemo = React.useMemo;

	var antd = window.antd;
	var Breadcrumb = antd.Breadcrumb;
	var Card = antd.Card;
	var DatePicker = antd.DatePicker;
	var Select = antd.Select;
	var Button = antd.Button;
	var Tabs = antd.Tabs;
	var Table = antd.Table;
	var Modal = antd.Modal;
	var Steps = antd.Steps;
	var Input = antd.Input;
	var Cascader = antd.Cascader;
	var Radio = antd.Radio;
	var Space = antd.Space;
	var Row = antd.Row;
	var Col = antd.Col;
	var message = antd.message;

	var RangePicker = DatePicker.RangePicker;

	// 当前视图：'list' | 'add'
	var viewState = useState('list');
	var currentView = viewState[0];
	var setCurrentView = viewState[1];

	var filterState = useState({
		dateStart: '',
		dateEnd: '',
		operator: undefined,
		plateNo: undefined,
		vehicleType: undefined,
		vehicleModelCascader: undefined,
		parkingLot: []
	});
	var filters = filterState[0];
	var setFilters = filterState[1];
	// 实际参与列表筛选的条件（点击查询后与 filters 同步）
	var appliedFilterState = useState({
		dateStart: '',
		dateEnd: '',
		operator: undefined,
		plateNo: undefined,
		vehicleType: undefined,
		vehicleModelCascader: undefined,
		parkingLot: []
	});
	var appliedFilters = appliedFilterState[0];
	var setAppliedFilters = appliedFilterState[1];

	var activeTabState = useState('completed');
	var activeTab = activeTabState[0];
	var setActiveTab = activeTabState[1];

	var defaultInspection = [{ checkType: '灯光', checkItem: '前大灯', result: '正常', treadDepth: '', remark: '' }, { checkType: '灯光', checkItem: '尾灯', result: '正常', treadDepth: '', remark: '' }, { checkType: '轮胎', checkItem: '前左胎', result: '正常', treadDepth: '5.2mm', remark: '' }, { checkType: '车身', checkItem: '车身外观', result: '正常', treadDepth: '', remark: '' }];
	var completedListState = useState([
		{ id: '1', completeDate: '2025-02-10 09:30', operator: '张三', vehicleType: '重型厢式货车', plateNo: '京A12345', brand: '东风', model: 'DFH1180', vin: 'LGHXCAE28M1234567', parkingLot: '朝阳停车场', bodyAd: '有', adPhotos: ['https://picsum.photos/200/150?random=1', 'https://picsum.photos/200/150?random=2', 'https://picsum.photos/200/150?random=3'], tailboard: '有', spareTireTreadDepth: '5.2mm', spareTirePhotos: ['https://picsum.photos/200/150?random=sp1'], flawPhotos: ['https://picsum.photos/200/150?random=4', 'https://picsum.photos/200/150?random=5'], inspectionList: defaultInspection },
		{ id: '2', completeDate: '2025-02-09 10:15', operator: '李四', vehicleType: '重型平板半挂车', plateNo: '京C11111', brand: '福田', model: 'BJ1180', vin: 'LGHXCAE28M7654321', parkingLot: '海淀停车场', bodyAd: '无', adPhotos: [], tailboard: '无', spareTireTreadDepth: '3.1mm', spareTirePhotos: [], flawPhotos: ['https://picsum.photos/200/150?random=6'], inspectionList: defaultInspection },
		{ id: '3', completeDate: '2025-02-08 11:00', operator: '王五', vehicleType: '轻型厢式货车', plateNo: '京D22222', brand: '江淮', model: 'HFC1180', vin: 'LGHXCAE28M8888888', parkingLot: '丰台停车场', bodyAd: '有', adPhotos: ['https://picsum.photos/200/150?random=7', 'https://picsum.photos/200/150?random=8'], tailboard: '有', spareTireTreadDepth: '4.0mm', spareTirePhotos: ['https://picsum.photos/200/150?random=sp2'], flawPhotos: [], inspectionList: defaultInspection },
		{ id: '4', completeDate: '2025-02-07 13:45', operator: '赵六', vehicleType: '重型半挂牵引车', plateNo: '京E33333', brand: '重汽', model: 'ZZ1180', vin: 'LGHXCAE28M7777777', parkingLot: '西城停车场', bodyAd: '无', adPhotos: [], tailboard: '无', spareTireTreadDepth: '5.0mm', spareTirePhotos: ['https://picsum.photos/200/150?random=sp3'], flawPhotos: ['https://picsum.photos/200/150?random=9'], inspectionList: defaultInspection },
		{ id: '5', completeDate: '2025-02-06 08:20', operator: '张三', vehicleType: '重型厢式货车', plateNo: '京A23456', brand: '东风', model: 'DFH1190', vin: 'LGHXCAE28M6666666', parkingLot: '朝阳停车场', bodyAd: '有', adPhotos: ['https://picsum.photos/200/150?random=10'], tailboard: '有', spareTireTreadDepth: '4.5mm', spareTirePhotos: [], flawPhotos: [], inspectionList: defaultInspection },
		{ id: '6', completeDate: '2025-02-05 14:30', operator: '李四', vehicleType: '轻型厢式货车', plateNo: '京B34567', brand: '福田', model: 'BJ1190', vin: 'LGHXCAE28M5555555', parkingLot: '海淀停车场', bodyAd: '无', adPhotos: [], tailboard: '无', spareTireTreadDepth: '3.8mm', spareTirePhotos: ['https://picsum.photos/200/150?random=sp4'], flawPhotos: ['https://picsum.photos/200/150?random=11', 'https://picsum.photos/200/150?random=12'], inspectionList: defaultInspection },
		{ id: '7', completeDate: '2025-02-04 16:00', operator: '王五', vehicleType: '重型集装箱半挂车', plateNo: '京C45678', brand: '江淮', model: 'HFC1190', vin: 'LGHXCAE28M4444444', parkingLot: '丰台停车场', bodyAd: '有', adPhotos: ['https://picsum.photos/200/150?random=13', 'https://picsum.photos/200/150?random=14'], tailboard: '有', spareTireTreadDepth: '5.2mm', spareTirePhotos: ['https://picsum.photos/200/150?random=sp5'], flawPhotos: [], inspectionList: defaultInspection },
		{ id: '8', completeDate: '2025-02-03 09:00', operator: '赵六', vehicleType: '重型厢式货车', plateNo: '京D56789', brand: '重汽', model: 'ZZ1190', vin: 'LGHXCAE28M3333333', parkingLot: '西城停车场', bodyAd: '无', adPhotos: [], tailboard: '有', spareTireTreadDepth: '4.2mm', spareTirePhotos: [], flawPhotos: ['https://picsum.photos/200/150?random=15'], inspectionList: defaultInspection },
		{ id: '9', completeDate: '2025-02-02 10:30', operator: '张三', vehicleType: '小型普通客车', plateNo: '京E67890', brand: '东风', model: 'DFH1200', vin: 'LGHXCAE28M2222222', parkingLot: '朝阳停车场', bodyAd: '有', adPhotos: ['https://picsum.photos/200/150?random=16', 'https://picsum.photos/200/150?random=17', 'https://picsum.photos/200/150?random=18'], tailboard: '无', spareTireTreadDepth: '5.0mm', spareTirePhotos: ['https://picsum.photos/200/150?random=sp6'], flawPhotos: [], inspectionList: defaultInspection },
		{ id: '10', completeDate: '2025-02-01 15:45', operator: '李四', vehicleType: '轻型厢式货车', plateNo: '京A78901', brand: '福田', model: 'BJ1200', vin: 'LGHXCAE28M1111111', parkingLot: '海淀停车场', bodyAd: '无', adPhotos: [], tailboard: '有', spareTireTreadDepth: '3.5mm', spareTirePhotos: [], flawPhotos: [], inspectionList: defaultInspection }
	]);
	var completedList = completedListState[0];
	var setCompletedList = completedListState[1];

	var pendingListState = useState([
		{ id: 'p1', operateDate: '2025-02-10 14:30', operator: '王五', vehicleType: '轻型厢式货车', plateNo: '京F10001', brand: '江淮', model: 'HFC1180', vin: 'LGHXCAE28M9990001', parkingLot: '丰台停车场', bodyAd: '有', adPhotos: ['https://picsum.photos/200/150?random=19', 'https://picsum.photos/200/150?random=20'], tailboard: '有', spareTireTreadDepth: '4.0mm', spareTirePhotos: ['https://picsum.photos/200/150?random=sp7'], flawPhotos: [] },
		{ id: 'p2', operateDate: '2025-02-09 09:15', operator: '赵六', vehicleType: '重型平板半挂车', plateNo: '京F10002', brand: '重汽', model: 'ZZ1180', vin: 'LGHXCAE28M9990002', parkingLot: '西城停车场', bodyAd: '无', adPhotos: [], tailboard: '无', spareTireTreadDepth: '3.1mm', spareTirePhotos: [], flawPhotos: ['https://picsum.photos/200/150?random=21'] },
		{ id: 'p3', operateDate: '2025-02-08 11:45', operator: '张三', vehicleType: '重型半挂牵引车', plateNo: '京F10003', brand: '东风', model: 'DFH1180', vin: 'LGHXCAE28M9990003', parkingLot: '朝阳停车场', bodyAd: '有', adPhotos: ['https://picsum.photos/200/150?random=22'], tailboard: '有', spareTireTreadDepth: '5.0mm', spareTirePhotos: [], flawPhotos: [] },
		{ id: 'p4', operateDate: '2025-02-07 08:00', operator: '李四', vehicleType: '重型厢式货车', plateNo: '京F10005', brand: '福田', model: 'BJ1180', vin: 'LGHXCAE28M9990004', parkingLot: '海淀停车场', bodyAd: '无', adPhotos: [], tailboard: '无', spareTireTreadDepth: '4.2mm', spareTirePhotos: ['https://picsum.photos/200/150?random=sp8'], flawPhotos: [] },
		{ id: 'p5', operateDate: '2025-02-06 13:20', operator: '王五', vehicleType: '轻型厢式货车', plateNo: '京F10006', brand: '江淮', model: 'HFC1190', vin: 'LGHXCAE28M9990005', parkingLot: '丰台停车场', bodyAd: '有', adPhotos: ['https://picsum.photos/200/150?random=23', 'https://picsum.photos/200/150?random=24', 'https://picsum.photos/200/150?random=25'], tailboard: '有', spareTireTreadDepth: '3.8mm', spareTirePhotos: [], flawPhotos: ['https://picsum.photos/200/150?random=26', 'https://picsum.photos/200/150?random=27'] },
		{ id: 'p6', operateDate: '2025-02-05 15:30', operator: '赵六', vehicleType: '重型集装箱半挂车', plateNo: '京F10007', brand: '重汽', model: 'ZZ1190', vin: 'LGHXCAE28M9990006', parkingLot: '西城停车场', bodyAd: '无', adPhotos: [], tailboard: '无', spareTireTreadDepth: '5.2mm', spareTirePhotos: ['https://picsum.photos/200/150?random=sp9'], flawPhotos: [] },
		{ id: 'p7', operateDate: '2025-02-04 10:00', operator: '张三', vehicleType: '重型厢式货车', plateNo: '京F10009', brand: '东风', model: 'DFH1190', vin: 'LGHXCAE28M9990007', parkingLot: '朝阳停车场', bodyAd: '有', adPhotos: ['https://picsum.photos/200/150?random=28', 'https://picsum.photos/200/150?random=29'], tailboard: '有', spareTireTreadDepth: '4.5mm', spareTirePhotos: [], flawPhotos: [] },
		{ id: 'p8', operateDate: '2025-02-03 16:45', operator: '李四', vehicleType: '小型普通客车', plateNo: '京F10010', brand: '福田', model: 'BJ1190', vin: 'LGHXCAE28M9990008', parkingLot: '海淀停车场', bodyAd: '无', adPhotos: [], tailboard: '无', spareTireTreadDepth: '3.5mm', spareTirePhotos: [], flawPhotos: ['https://picsum.photos/200/150?random=30'] },
		{ id: 'p9', operateDate: '2025-02-02 09:30', operator: '王五', vehicleType: '轻型厢式货车', plateNo: '京F10011', brand: '江淮', model: 'HFC1200', vin: 'LGHXCAE28M9990009', parkingLot: '丰台停车场', bodyAd: '有', adPhotos: ['https://picsum.photos/200/150?random=31'], tailboard: '有', spareTireTreadDepth: '5.0mm', spareTirePhotos: ['https://picsum.photos/200/150?random=sp10'], flawPhotos: [] },
		{ id: 'p10', operateDate: '2025-02-01 14:00', operator: '赵六', vehicleType: '重型平板半挂车', plateNo: '京F10013', brand: '重汽', model: 'ZZ1200', vin: 'LGHXCAE28M9990010', parkingLot: '西城停车场', bodyAd: '无', adPhotos: [], tailboard: '无', spareTireTreadDepth: '4.0mm', spareTirePhotos: [], flawPhotos: [] }
	]);
	var pendingList = pendingListState[0];
	var setPendingList = pendingListState[1];

	var pageState = useState(1);
	var page = pageState[0];
	var setPage = pageState[1];
	var pageSizeState = useState(10);
	var pageSize = pageSizeState[0];
	var setPageSize = pageSizeState[1];

	var operatorOptions = useMemo(function () {
		var set = new Set();
		completedList.forEach(function (r) { if (r.operator) set.add(r.operator); });
		pendingList.forEach(function (r) { if (r.operator) set.add(r.operator); });
		return Array.from(set).map(function (v) { return { value: v, label: v }; });
	}, [completedList, pendingList]);
	var plateOptions = useMemo(function () {
		var set = new Set();
		completedList.forEach(function (r) { if (r.plateNo) set.add(r.plateNo); });
		pendingList.forEach(function (r) { if (r.plateNo) set.add(r.plateNo); });
		return Array.from(set).map(function (v) { return { value: v, label: v }; });
	}, [completedList, pendingList]);
	var vehicleTypeOptions = useMemo(function () {
		return [
			{ value: '轻型厢式货车', label: '轻型厢式货车' },
			{ value: '重型厢式货车', label: '重型厢式货车' },
			{ value: '重型半挂牵引车', label: '重型半挂牵引车' },
			{ value: '重型集装箱半挂车', label: '重型集装箱半挂车' },
			{ value: '小型普通客车', label: '小型普通客车' },
			{ value: '重型平板半挂车', label: '重型平板半挂车' },
			{ value: '叉车', label: '叉车' },
			{ value: '油车', label: '油车' },
			{ value: '观光车', label: '观光车' }
		];
	}, []);
	var parkingOptions = useMemo(function () { return [{ value: '朝阳停车场', label: '朝阳停车场' }, { value: '海淀停车场', label: '海淀停车场' }, { value: '丰台停车场', label: '丰台停车场' }, { value: '西城停车场', label: '西城停车场' }]; }, []);
	var vehicleModelCascaderOptions = useMemo(function () {
		var map = {};
		completedList.forEach(function (r) {
			if (!r.brand) return;
			if (!map[r.brand]) map[r.brand] = { value: r.brand, label: r.brand, children: [] };
			var children = map[r.brand].children;
			var model = r.model || '';
			if (model && children.every(function (c) { return c.value !== model; })) children.push({ value: model, label: model });
		});
		pendingList.forEach(function (r) {
			if (!r.brand) return;
			if (!map[r.brand]) map[r.brand] = { value: r.brand, label: r.brand, children: [] };
			var children = map[r.brand].children;
			var model = r.model || '';
			if (model && children.every(function (c) { return c.value !== model; })) children.push({ value: model, label: model });
		});
		return Object.keys(map).map(function (k) { return map[k]; });
	}, [completedList, pendingList]);

	var reqDocOpenState = useState(false);
	var photoModalState = useState({ open: false, photos: [], currentIndex: 0 });

	var addStepState = useState(1);
	var addFormState = useState({
		plateNo: '',
		vehicleType: '',
		brand: '',
		model: '',
		vin: '',
		bodyAd: '无',
		adPhotos: [],
		tailboard: '无',
		trailerPlate: '',
		spareTireTreadDepth: '',
		spareTirePhotos: [],
		flawPhotos: [],
		inspectionList: [
			{ checkType: '灯光', checkItem: '前大灯', result: '正常', treadDepth: '', remark: '' },
			{ checkType: '灯光', checkItem: '尾灯', result: '正常', treadDepth: '', remark: '' },
			{ checkType: '轮胎', checkItem: '前左胎', result: '正常', treadDepth: '', remark: '' },
			{ checkType: '车身', checkItem: '车身外观', result: '正常', treadDepth: '', remark: '' }
		]
	});

	var filteredCompleted = useMemo(function () {
		var list = completedList.slice();
		if (appliedFilters.operator) list = list.filter(function (r) { return (r.operator || '').indexOf(appliedFilters.operator) !== -1; });
		if (appliedFilters.plateNo) list = list.filter(function (r) { return (r.plateNo || '').indexOf(appliedFilters.plateNo) !== -1; });
		if (appliedFilters.vehicleType) list = list.filter(function (r) { return r.vehicleType === appliedFilters.vehicleType; });
		if (appliedFilters.vehicleModelCascader && appliedFilters.vehicleModelCascader.length >= 1) {
			var brand = appliedFilters.vehicleModelCascader[0];
			var model = appliedFilters.vehicleModelCascader[1];
			list = list.filter(function (r) {
				if (r.brand !== brand) return false;
				if (model && r.model !== model) return false;
				return true;
			});
		}
		if (appliedFilters.parkingLot && appliedFilters.parkingLot.length > 0) list = list.filter(function (r) { return appliedFilters.parkingLot.indexOf(r.parkingLot) !== -1; });
		if (appliedFilters.dateStart) list = list.filter(function (r) { var d = (r.completeDate || '').slice(0, 10); return d >= appliedFilters.dateStart; });
		if (appliedFilters.dateEnd) list = list.filter(function (r) { var d = (r.completeDate || '').slice(0, 10); return d <= appliedFilters.dateEnd; });
		return list.sort(function (a, b) { return (b.completeDate || '').localeCompare(a.completeDate || ''); });
	}, [completedList, appliedFilters]);

	var filteredPending = useMemo(function () {
		var list = pendingList.slice();
		if (appliedFilters.operator) list = list.filter(function (r) { return (r.operator || '').indexOf(appliedFilters.operator) !== -1; });
		if (appliedFilters.plateNo) list = list.filter(function (r) { return (r.plateNo || '').indexOf(appliedFilters.plateNo) !== -1; });
		if (appliedFilters.vehicleType) list = list.filter(function (r) { return r.vehicleType === appliedFilters.vehicleType; });
		if (appliedFilters.vehicleModelCascader && appliedFilters.vehicleModelCascader.length >= 1) {
			var brand = appliedFilters.vehicleModelCascader[0];
			var model = appliedFilters.vehicleModelCascader[1];
			list = list.filter(function (r) {
				if (r.brand !== brand) return false;
				if (model && r.model !== model) return false;
				return true;
			});
		}
		if (appliedFilters.parkingLot && appliedFilters.parkingLot.length > 0) list = list.filter(function (r) { return appliedFilters.parkingLot.indexOf(r.parkingLot) !== -1; });
		if (appliedFilters.dateStart) list = list.filter(function (r) { var d = (r.operateDate || '').slice(0, 10); return d >= appliedFilters.dateStart; });
		if (appliedFilters.dateEnd) list = list.filter(function (r) { var d = (r.operateDate || '').slice(0, 10); return d <= appliedFilters.dateEnd; });
		return list.sort(function (a, b) { return (b.operateDate || '').localeCompare(a.operateDate || ''); });
	}, [pendingList, appliedFilters]);

	var displayCompleted = useMemo(function () {
		var start = (page - 1) * pageSize;
		return filteredCompleted.slice(start, start + pageSize);
	}, [filteredCompleted, page, pageSize]);

	var displayPending = useMemo(function () {
		var start = (page - 1) * pageSize;
		return filteredPending.slice(start, start + pageSize);
	}, [filteredPending, page, pageSize]);

	var totalCompleted = filteredCompleted.length;
	var totalPending = filteredPending.length;
	var totalCount = activeTab === 'completed' ? totalCompleted : totalPending;

	var handleQuery = useCallback(function () {
		setAppliedFilters({ dateStart: filters.dateStart, dateEnd: filters.dateEnd, operator: filters.operator, plateNo: filters.plateNo, vehicleType: filters.vehicleType, vehicleModelCascader: filters.vehicleModelCascader, parkingLot: filters.parkingLot || [] });
		setPage(1);
	}, [filters.dateStart, filters.dateEnd, filters.operator, filters.plateNo, filters.vehicleType, filters.vehicleModelCascader, filters.parkingLot]);
	var handleReset = useCallback(function () {
		var empty = { dateStart: '', dateEnd: '', operator: undefined, plateNo: undefined, vehicleType: undefined, vehicleModelCascader: undefined, parkingLot: [] };
		setFilters(empty);
		setAppliedFilters(empty);
		setPage(1);
	}, []);

	var handleExport = useCallback(function () {
		if (activeTab !== 'completed') {
			message.warning('请在「已完成」Tab 下导出');
			return;
		}
		var rows = filteredCompleted;
		var headers = ['备车时间', '备车人', '车辆类型', '车牌号', '品牌', '型号', '车辆识别代码', '停车场', '车身广告及放大字', '尾板', '备胎胎纹深度'];
		var csv = headers.join(',') + '\n';
		rows.forEach(function (r) {
			csv += [(r.completeDate || '').slice(0, 10), r.operator, r.vehicleType, r.plateNo, r.brand, r.model, r.vin, r.parkingLot, r.bodyAd, r.tailboard, r.spareTireTreadDepth || ''].join(',') + '\n';
		});
		var blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' });
		var url = URL.createObjectURL(blob);
		var a = document.createElement('a');
		a.href = url;
		a.download = '备车管理导出_' + new Date().getTime() + '.csv';
		a.click();
		URL.revokeObjectURL(url);
		message.success('导出成功');
	}, [activeTab, filteredCompleted]);

	var handlePendingDelete = useCallback(function () {
		if (pendingDeleteId) {
			setPendingList(function (prev) { return prev.filter(function (r) { return r.id !== pendingDeleteId; }); });
			message.success('已删除');
		}
		setPendingDeleteId(null);
	}, [pendingDeleteId]);

	var openPhotoModal = useCallback(function (photos, index) {
		if (!photos || photos.length === 0) return;
		photoModalState[1]({ open: true, photos: photos, currentIndex: index || 0 });
	}, []);

	var addForm = addFormState[0];
	var setAddForm = addFormState[1];
	var addStep = addStepState[0];
	var setAddStep = addStepState[1];

	var handleAddSave = useCallback(function () {
		var d = new Date();
		var pad = function (n) { return String(n).padStart(2, '0'); };
		var dateTimeStr = d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) + ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes());
		var item = {
			id: 'p' + Date.now(),
			operateDate: dateTimeStr,
			operator: '当前用户',
			vehicleType: addForm.vehicleType || '轻型厢式货车',
			plateNo: addForm.plateNo,
			brand: addForm.brand || '-',
			model: addForm.model || '-',
			vin: addForm.vin,
			parkingLot: addForm.parkingLot || '朝阳停车场',
			bodyAd: addForm.bodyAd,
			adPhotos: addForm.adPhotos || [],
			tailboard: addForm.tailboard,
			trailerPlate: addForm.trailerPlate || '',
			spareTireTreadDepth: addForm.spareTireTreadDepth || '',
			spareTirePhotos: addForm.spareTirePhotos || [],
			flawPhotos: addForm.flawPhotos || []
		};
		setPendingList(pendingList.concat([item]));
		setCurrentView('list');
		setActiveTab('pending');
		setAddForm({ plateNo: '', vehicleType: '', brand: '', model: '', vin: '', bodyAd: '无', adPhotos: [], tailboard: '无', trailerPlate: '', spareTireTreadDepth: '', spareTirePhotos: [], flawPhotos: [], inspectionList: addForm.inspectionList });
		setAddStep(1);
		message.success('已保存至待提交列表');
	}, [addForm, pendingList]);

	var handleAddNext = useCallback(function () {
		if (!addForm.plateNo) {
			message.warning('请选择车牌号');
			return;
		}
		setAddStep(2);
	}, [addForm.plateNo]);

	var handleAddSubmit = useCallback(function () {
		var d = new Date();
		var pad = function (n) { return String(n).padStart(2, '0'); };
		var dateTimeStr = d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) + ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes());
		var item = {
			id: String(Date.now()),
			completeDate: dateTimeStr,
			operator: '当前用户',
			vehicleType: addForm.vehicleType || '轻型厢式货车',
			plateNo: addForm.plateNo,
			brand: addForm.brand || '-',
			model: addForm.model || '-',
			vin: addForm.vin,
			parkingLot: addForm.parkingLot || '朝阳停车场',
			bodyAd: addForm.bodyAd,
			adPhotos: addForm.adPhotos || [],
			tailboard: addForm.tailboard,
			spareTireTreadDepth: addForm.spareTireTreadDepth || '',
			spareTirePhotos: addForm.spareTirePhotos || [],
			flawPhotos: addForm.flawPhotos || [],
			inspectionList: addForm.inspectionList || []
		};
		setCompletedList(completedList.concat([item]));
		setCurrentView('list');
		setActiveTab('completed');
		setAddForm({ plateNo: '', vehicleType: '', brand: '', model: '', vin: '', bodyAd: '无', adPhotos: [], tailboard: '无', trailerPlate: '', spareTireTreadDepth: '', spareTirePhotos: [], flawPhotos: [], inspectionList: addForm.inspectionList });
		setAddStep(1);
		message.success('提交成功');
	}, [addForm, completedList]);

	var onPlateSelect = useCallback(function (plateNo) {
		setAddForm(function (prev) {
			var next = {};
			for (var k in prev) next[k] = prev[k];
			next.plateNo = plateNo;
			next.vehicleType = '厢式货车';
			next.brand = '东风';
			next.vin = 'LGHXCAE28M' + Math.floor(Math.random() * 10000000);
			return next;
		});
	}, []);

	var requirementDocContent = '备车管理：\n一个「数字化资产ONEOS运管平台」中的「备车管理」模块\n1.面包屑：\n1.1.运维管理-车辆业务-备车管理\n\n2.筛选：\n2.1.备车日期：日期选择器，精确至天，支持单输入框双日历选择开始日期-结束日期；\n2.2.备车人：选择器，支持输入框内输入进行模糊搜索下拉选项匹配，提示信息为：请选择或输入备车人姓名；\n2.3.车牌号：选择器，支持输入框内输入进行模糊搜索下拉选项匹配，提示信息为：请选择或输入车牌号；\n2.4.车辆类型：选择器，选项包含：轻型厢式货车、重型厢式货车、重型半挂牵引车、轻型厢式货车、重型厢式货车、重型集装箱半挂车、小型普通客车、重型半挂牵引车、重型平板半挂车、叉车、油车、观光车；\n2.5.车辆型号：级联选择器，选择品牌及型号；\n2.5.停车场：选择器，支持多选，选择所有停车场；\n\n3.列表：分为已完成、待提交2个tab，已完成tab下显示所有已完成备车的车辆，待提交tab下显示所有仅保存待提交的车辆；\n3.1.已完成，列表右侧为新增、导出：\n    3.1.1.备车时间：显示备车完成时间，格式为：YYYY-MM-DD；\n    3.1.2.备车人：显示备车用户姓名；\n    3.1.3.车辆类型：显示备车车辆类型；\n    3.1.4.品牌：显示备车车辆品牌；\n    3.1.5.型号：显示备车车辆型号；\n    3.1.6.车牌号：显示备车车辆车牌号；\n    3.1.7.车辆识别代码：显示备车车辆识别代码；\n    3.1.8.停车场：显示备车车辆所在停车场；\n    3.1.9.车身广告及放大字：显示备车车辆是否有车身广告及放大字，显示为有或无；\n    3.1.10.尾板：如尾板为有，显示备车车辆是否有尾板，显示为有或无；\n    3.1.11.备胎胎纹深度：显示备车车辆备胎胎纹深度，格式为：xxmm；\n    3.1.12.操作：查看；\n           3.1.12.1.查看：点击查看，进入备车管理-待提交-查看页；\n\n3.2.待提交，列表右侧为新增：\n    3.2.1.创建时间：显示记录创建时间，格式为：YYYY-MM-DD；\n    3.2.2.创建人：显示创建用户姓名；\n    3.2.3.车辆类型：显示备车车辆类型；\n    3.2.4.品牌：显示备车车辆品牌；\n    3.2.5.型号：显示备车车辆型号；\n    3.2.6.车牌号：显示备车车辆车牌号；\n    3.2.7.车辆识别代码：显示备车车辆识别代码；\n    3.2.8.停车场：显示备车车辆所在停车场；\n    3.2.9.车身广告及放大字：显示备车车辆是否有车身广告及放大字，显示为有或无；\n    3.2.10.广告照片：如车身广告及放大字为有，则显示查看照片，如车身广告及放大字为无，则显示-；\n    3.2.11.放大字照片：如车身广告及放大字为有，则显示查看照片，如车身广告及放大字为无，则显示-；\n    3.2.12.尾板：如尾板为有，显示备车车辆是否有尾板，显示为有或无；\n    3.2.13.备胎胎纹深度：显示备车车辆备胎胎纹深度，格式为：xxmm；\n    3.2.14.备胎照片：如备胎照片为有，则显示查看照片，如备胎为无，则显示-；\n    3.2.15.瑕疵照片：如瑕疵照片为有，则显示查看照片，如瑕疵照片为无，则显示-；\n    3.2.16.操作：查看、编辑、删除；\n           3.2.16.1.查看：点击查看，进入备车管理-待提交-查看页；\n           3.2.16.2.编辑：点击编辑，进入备车管理-待提交-编辑页；\n           3.2.16.3.删除：点击进行二次确认，确认后删除；\n\n已完成、待提交均支持分页功能，可设置单页查询数据条数；\n\n备车权限说明：\n1.运维人员分区域，对应区域运维人员只能新增自己区域停车场的车辆进行备车；\n2.运维人员只能查看自己区域停车场的备车记录；';

	// 日期范围变化（antd RangePicker 返回 dayjs 或 [string, string] 依项目而定，此处用字符串存）
	function onDateRangeChange(dates, dateStrings) {
		setFilters(function (f) {
			var g = {};
			for (var k in f) g[k] = f[k];
			g.dateStart = (dateStrings && dateStrings[0]) || '';
			g.dateEnd = (dateStrings && dateStrings[1]) || '';
			return g;
		});
	}

	var dateRangeValue = useMemo(function () {
		if (!filters.dateStart && !filters.dateEnd) return null;
		try {
			if (typeof window.dayjs === 'function' && filters.dateStart && filters.dateEnd) {
				return [window.dayjs(filters.dateStart), window.dayjs(filters.dateEnd)];
			}
		} catch (e) {}
		return null;
	}, [filters.dateStart, filters.dateEnd]);

	// 已完成表格列
	function getCompletedColumns() {
		return [
			{ title: '备车时间', dataIndex: 'completeDate', key: 'completeDate', width: 120, render: function (v) { return v ? String(v).slice(0, 10) : '—'; } },
			{ title: '备车人', dataIndex: 'operator', key: 'operator', width: 90, render: function (v) { return v || '—'; } },
			{ title: '车辆类型', dataIndex: 'vehicleType', key: 'vehicleType', width: 120, render: function (v) { return v || '—'; } },
			{ title: '品牌', dataIndex: 'brand', key: 'brand', width: 80, render: function (v) { return v || '—'; } },
			{ title: '型号', dataIndex: 'model', key: 'model', width: 100, render: function (v) { return v || '—'; } },
			{ title: '车牌号', dataIndex: 'plateNo', key: 'plateNo', width: 100, render: function (v) { return v || '—'; } },
			{ title: '车辆识别代码', dataIndex: 'vin', key: 'vin', width: 180, ellipsis: true, render: function (v) { return v || '—'; } },
			{ title: '停车场', dataIndex: 'parkingLot', key: 'parkingLot', width: 110, render: function (v) { return v || '—'; } },
			{ title: '车身广告及放大字', dataIndex: 'bodyAd', key: 'bodyAd', width: 120, render: function (v) { return v === '有' || v === '无' ? v : '—'; } },
			{ title: '尾板', dataIndex: 'tailboard', key: 'tailboard', width: 70, render: function (v) { return v === '有' || v === '无' ? v : '—'; } },
			{ title: '备胎胎纹深度', key: 'spareTireTreadDepth', width: 110, render: function (_, r) { var d = r.spareTireTreadDepth; return d ? (String(d).replace(/mm$/, '') + 'mm') : '—'; } },
			{ title: '操作', key: 'action', width: 80, fixed: 'right', render: function (_, r) {
				return React.createElement(Button, { type: 'link', size: 'small', onClick: function () {} }, '查看');
			}}
		];
	}

	var pendingDeleteIdState = useState(null);
	var pendingDeleteId = pendingDeleteIdState[0];
	var setPendingDeleteId = pendingDeleteIdState[1];

	function getPendingColumns() {
		return [
			{ title: '创建时间', dataIndex: 'operateDate', key: 'operateDate', width: 120, render: function (v) { return v ? String(v).slice(0, 10) : '—'; } },
			{ title: '创建人', dataIndex: 'operator', key: 'operator', width: 90, render: function (v) { return v || '—'; } },
			{ title: '车辆类型', dataIndex: 'vehicleType', key: 'vehicleType', width: 120, render: function (v) { return v || '—'; } },
			{ title: '品牌', dataIndex: 'brand', key: 'brand', width: 80, render: function (v) { return v || '—'; } },
			{ title: '型号', dataIndex: 'model', key: 'model', width: 100, render: function (v) { return v || '—'; } },
			{ title: '车牌号', dataIndex: 'plateNo', key: 'plateNo', width: 100, render: function (v) { return v || '—'; } },
			{ title: '车辆识别代码', dataIndex: 'vin', key: 'vin', width: 180, ellipsis: true, render: function (v) { return v || '—'; } },
			{ title: '停车场', dataIndex: 'parkingLot', key: 'parkingLot', width: 110, render: function (v) { return v || '—'; } },
			{ title: '车身广告及放大字', dataIndex: 'bodyAd', key: 'bodyAd', width: 120, render: function (v) { return v === '有' || v === '无' ? v : '—'; } },
			{ title: '尾板', dataIndex: 'tailboard', key: 'tailboard', width: 70, render: function (v) { return v === '有' || v === '无' ? v : '—'; } },
			{ title: '备胎胎纹深度', key: 'spareTireTreadDepth', width: 110, render: function (_, r) { var d = r.spareTireTreadDepth; return d ? (String(d).replace(/mm$/, '') + 'mm') : '—'; } },
			{ title: '操作', key: 'action', width: 160, fixed: 'right', render: function (_, r) {
				return React.createElement(Space, { size: 'small' },
					React.createElement(Button, { type: 'link', size: 'small', onClick: function () {} }, '查看'),
					React.createElement(Button, { type: 'link', size: 'small', onClick: function () {
						setAddForm(function (prev) {
							var n = {};
							for (var k in prev) n[k] = prev[k];
							n.plateNo = r.plateNo; n.vehicleType = r.vehicleType; n.brand = r.brand; n.model = r.model; n.vin = r.vin;
							n.bodyAd = r.bodyAd; n.adPhotos = r.adPhotos || []; n.tailboard = r.tailboard;
							n.trailerPlate = r.trailerPlate || ''; n.flawPhotos = r.flawPhotos || [];
							return n;
						});
						setAddStep(1);
						setCurrentView('add');
					} }, '编辑'),
					React.createElement(Button, { type: 'link', size: 'small', danger: true, onClick: function () { setPendingDeleteId(r.id); } }, '删除')
				);
			}}
		];
	}

	var tablePagination = useMemo(function () {
		return {
			current: page,
			pageSize: pageSize,
			total: totalCount,
			showSizeChanger: true,
			showTotal: function (t) { return '共 ' + t + ' 条'; },
			pageSizeOptions: ['10', '20', '50'],
			onChange: function (p, size) {
				setPage(p);
				if (size !== pageSize) setPageSize(size);
			}
		};
	}, [page, pageSize, totalCount]);

	// —————— 列表页 ——————
	function ListView() {
		var breadcrumbItems = [
			{ title: '运维管理' },
			{ title: '车辆业务' },
			{ title: '备车管理' }
		];
		return React.createElement('div', { style: { padding: 24, background: '#f5f5f5', minHeight: '100vh' } },
			React.createElement('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 } },
				React.createElement(Breadcrumb, { items: breadcrumbItems }),
				React.createElement(Button, { type: 'link', style: { padding: 0 }, onClick: function () { reqDocOpenState[1](true); } }, '查看需求说明')
			),
			React.createElement(Modal, {
				title: '需求说明',
				open: reqDocOpenState[0],
				onCancel: function () { reqDocOpenState[1](false); },
				footer: null,
				width: 720,
				styles: { body: { maxHeight: '70vh', overflow: 'auto', whiteSpace: 'pre-wrap', fontSize: 14 } }
			}, requirementDocContent.split('\n').map(function (line, idx) {
				var trimmed = line;
				if (trimmed.indexOf('#') === 0) {
					return React.createElement('div', { key: idx, style: { fontWeight: 'bold', marginTop: idx === 0 ? 0 : 16, marginBottom: 8, paddingBottom: 4, borderBottom: '1px solid #f0f0f0' } }, trimmed.replace(/^#\.?/, '').trim());
				}
				if (/^\d+\./.test(trimmed)) return React.createElement('div', { key: idx, style: { marginLeft: 12, marginBottom: 4 } }, trimmed);
				if (trimmed === '') return React.createElement('div', { key: idx, style: { height: 12 } });
				return React.createElement('div', { key: idx, style: { marginBottom: 8 } }, trimmed);
			})),
			React.createElement(Card, { style: { marginBottom: 16 } },
				React.createElement('div', {
					style: {
						display: 'grid',
						gridTemplateColumns: '1fr 1fr 1fr',
						gap: '16px 24px',
						alignItems: 'start',
						flex: 1,
						minWidth: 0
					}
				},
					React.createElement('div', null,
						React.createElement('div', { style: { marginBottom: 4 } }, '备车日期'),
						React.createElement(RangePicker, {
							value: dateRangeValue,
							onChange: onDateRangeChange,
							style: { width: '100%' },
							placeholder: ['开始日期', '结束日期']
						})
					),
					React.createElement('div', null,
						React.createElement('div', { style: { marginBottom: 4 } }, '备车人'),
						React.createElement(Select, {
							placeholder: '请选择或输入备车人姓名',
							allowClear: true,
							showSearch: true,
							filterOption: function (input, opt) { return (opt && opt.label && String(opt.label).toLowerCase().indexOf((input || '').toLowerCase()) !== -1); },
							value: filters.operator,
							onChange: function (v) { setFilters(function (f) { var g = {}; for (var k in f) g[k] = f[k]; g.operator = v; return g; }); },
							style: { width: '100%' },
							options: operatorOptions
						})
					),
					React.createElement('div', null,
						React.createElement('div', { style: { marginBottom: 4 } }, '车牌号'),
						React.createElement(Select, {
							placeholder: '请选择或输入车牌号',
							allowClear: true,
							showSearch: true,
							filterOption: function (input, opt) { return (opt && opt.label && String(opt.label).toLowerCase().indexOf((input || '').toLowerCase()) !== -1); },
							value: filters.plateNo,
							onChange: function (v) { setFilters(function (f) { var g = {}; for (var k in f) g[k] = f[k]; g.plateNo = v; return g; }); },
							style: { width: '100%' },
							options: plateOptions
						})
					),
					React.createElement('div', null,
						React.createElement('div', { style: { marginBottom: 4 } }, '车辆类型'),
						React.createElement(Select, {
							placeholder: '请选择车辆类型',
							allowClear: true,
							value: filters.vehicleType,
							onChange: function (v) { setFilters(function (f) { var g = {}; for (var k in f) g[k] = f[k]; g.vehicleType = v; return g; }); },
							style: { width: '100%' },
							options: vehicleTypeOptions
						})
					),
					React.createElement('div', null,
						React.createElement('div', { style: { marginBottom: 4 } }, '车辆型号'),
						React.createElement(Cascader, {
							options: vehicleModelCascaderOptions,
							value: filters.vehicleModelCascader,
							onChange: function (v) { setFilters(function (f) { var g = {}; for (var k in f) g[k] = f[k]; g.vehicleModelCascader = v; return g; }); },
							placeholder: '请选择品牌及型号',
							allowClear: true,
							style: { width: '100%' },
							changeOnSelect: true
						})
					),
					React.createElement('div', null,
						React.createElement('div', { style: { marginBottom: 4 } }, '停车场'),
						React.createElement(Select, {
							placeholder: '请选择停车场',
							allowClear: true,
							mode: 'multiple',
							value: filters.parkingLot || [],
							onChange: function (v) { setFilters(function (f) { var g = {}; for (var k in f) g[k] = f[k]; g.parkingLot = v || []; return g; }); },
							style: { width: '100%' },
							options: parkingOptions
						})
					)
				),
				React.createElement('div', { style: { display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 } },
					React.createElement(Button, { onClick: handleReset }, '重置'),
					React.createElement(Button, { type: 'primary', onClick: handleQuery }, '查询')
				)
			),
			React.createElement(Card, null,
				React.createElement(Tabs, {
					activeKey: activeTab,
					onChange: function (k) { setActiveTab(k); setPage(1); },
					tabBarExtraContent: React.createElement('div', { style: { display: 'flex', gap: 8 } },
						React.createElement(Button, { type: 'primary', onClick: function () {} }, '新增'),
						activeTab === 'completed' ? React.createElement(Button, { onClick: handleExport }, '导出') : null
					),
					items: [
						{
							key: 'completed',
							label: '已完成',
							children: React.createElement(Table, {
								columns: getCompletedColumns(),
								dataSource: displayCompleted,
								rowKey: 'id',
								pagination: tablePagination,
								scroll: { x: 1600 },
								size: 'middle'
							})
						},
						{
							key: 'pending',
							label: '待提交',
							children: React.createElement(Table, {
								columns: getPendingColumns(),
								dataSource: displayPending,
								rowKey: 'id',
								pagination: tablePagination,
								scroll: { x: 1600 },
								size: 'middle'
							})
						}
					]
				})
			),
			React.createElement(Modal, {
				title: '确认删除',
				open: !!pendingDeleteId,
				onCancel: function () { setPendingDeleteId(null); },
				onOk: handlePendingDelete,
				okText: '确认',
				cancelText: '取消'
			}, '确定要删除该条待提交记录吗？'),
			// 照片预览：全屏遮罩 + 放大图片，点击遮罩关闭
			photoModalState[0].open && photoModalState[0].photos && photoModalState[0].photos.length > 0 ? React.createElement('div', {
				style: {
					position: 'fixed',
					top: 0,
					left: 0,
					right: 0,
					bottom: 0,
					backgroundColor: 'rgba(0,0,0,0.75)',
					zIndex: 1000,
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					cursor: 'pointer'
				},
				onClick: function () { photoModalState[1]({ open: false, photos: [], currentIndex: 0 }); }
			}, React.createElement('div', {
				style: { position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'default', maxWidth: '100%', maxHeight: '100%' },
				onClick: function (e) { if (e) e.stopPropagation(); }
			},
				React.createElement('img', {
					src: photoModalState[0].photos[photoModalState[0].currentIndex] || photoModalState[0].photos[0],
					alt: '',
					style: { maxWidth: '90vw', maxHeight: '85vh', objectFit: 'contain' }
				}),
				photoModalState[0].photos.length > 1 ? React.createElement('div', { style: { marginTop: 16, display: 'flex', alignItems: 'center', gap: 16 } },
					React.createElement(Button, {
						disabled: photoModalState[0].currentIndex === 0,
						onClick: function (e) { e.stopPropagation(); photoModalState[1]({ open: true, photos: photoModalState[0].photos, currentIndex: Math.max(0, photoModalState[0].currentIndex - 1) }); }
					}, '上一张'),
					React.createElement('span', { style: { color: '#fff' } }, (photoModalState[0].currentIndex + 1) + ' / ' + photoModalState[0].photos.length),
					React.createElement(Button, {
						disabled: photoModalState[0].currentIndex >= photoModalState[0].photos.length - 1,
						onClick: function (e) { e.stopPropagation(); photoModalState[1]({ open: true, photos: photoModalState[0].photos, currentIndex: Math.min(photoModalState[0].photos.length - 1, photoModalState[0].currentIndex + 1) }); }
					}, '下一张')
				) : null
			)) : null
		);
	}

	// —————— 新增页 ——————
	function AddView() {
		var form = addFormState[0];
		var setForm = addFormState[1];
		var step = addStepState[0];
		var addBreadcrumbItems = [
			{ title: '运维管理' },
			{ title: '车辆业务' },
			{ title: '备车管理' },
			{ title: '新增备车' }
		];
		return React.createElement('div', { style: { padding: 24, background: '#f5f5f5', minHeight: '100vh' } },
			React.createElement(Breadcrumb, { items: addBreadcrumbItems, style: { marginBottom: 16 } }),
			React.createElement(Card, null,
				React.createElement(Steps, { current: step - 1, style: { marginBottom: 24 }, items: [
					{ title: '步骤1 车辆记录' },
					{ title: '步骤2 备车检查' }
				] }),
				step === 1 ? React.createElement(Row, { gutter: [16, 16] },
					React.createElement(Col, { span: 24 }, React.createElement('span', { style: { color: '#666', marginRight: 8 } }, '车牌号 *'), React.createElement(Select, { placeholder: '请选择车牌号（仅库存车辆）', allowClear: true, showSearch: true, optionFilterProp: 'label', value: form.plateNo || undefined, onChange: onPlateSelect, style: { width: 200 }, options: plateOptions })),
					React.createElement(Col, { span: 24 }, React.createElement('span', { style: { color: '#666', marginRight: 8 } }, '车辆类型'), React.createElement(Input, { value: form.vehicleType, readOnly: true, style: { width: 200, background: '#f5f5f5' } })),
					React.createElement(Col, { span: 24 }, React.createElement('span', { style: { color: '#666', marginRight: 8 } }, '品牌'), React.createElement(Input, { value: form.brand, readOnly: true, style: { width: 200, background: '#f5f5f5' } })),
					React.createElement(Col, { span: 24 }, React.createElement('span', { style: { color: '#666', marginRight: 8 } }, '车架号'), React.createElement(Input, { value: form.vin, readOnly: true, style: { width: 200, background: '#f5f5f5' } })),
					React.createElement(Col, { span: 24 }, React.createElement('span', { style: { color: '#666', marginRight: 8 } }, '车身广告 *'), React.createElement(Radio.Group, { value: form.bodyAd, onChange: function (e) { setForm(function (p) { var n = {}; for (var k in p) n[k] = p[k]; n.bodyAd = e.target.value; return n; }); }, options: [{ value: '无', label: '无' }, { value: '有', label: '有' }] })),
					form.bodyAd === '有' ? React.createElement(Col, { span: 24 }, React.createElement('span', { style: { color: '#666', marginRight: 8 } }, '广告照片（最多5张）'), React.createElement(Space, null, (form.adPhotos || []).slice(0, 5).map(function (url, i) { return React.createElement('img', { key: i, src: url, alt: '', style: { width: 60, height: 60, objectFit: 'cover', borderRadius: 4 } }); }), (form.adPhotos || []).length < 5 ? React.createElement(Button, { onClick: function () { setForm(function (p) { var n = {}; for (var k in p) n[k] = p[k]; n.adPhotos = (p.adPhotos || []).concat(['https://picsum.photos/200/150?r=' + Date.now()]); return n; }); } }, '上传') : null)) : null,
					React.createElement(Col, { span: 24 }, React.createElement('span', { style: { color: '#666', marginRight: 8 } }, '尾板 *'), React.createElement(Radio.Group, { value: form.tailboard, onChange: function (e) { setForm(function (p) { var n = {}; for (var k in p) n[k] = p[k]; n.tailboard = e.target.value; return n; }); }, options: [{ value: '无', label: '无' }, { value: '有', label: '有' }] })),
					React.createElement(Col, { span: 24 }, React.createElement('span', { style: { color: '#666', marginRight: 8 } }, '挂车牌号（有挂时填写）'), React.createElement(Input, { value: form.trailerPlate, onChange: function (e) { setForm(function (p) { var n = {}; for (var k in p) n[k] = p[k]; n.trailerPlate = e.target.value; return n; }); }, placeholder: '不填视为无挂', style: { width: 200 } })),
					React.createElement(Col, { span: 24 }, React.createElement('span', { style: { color: '#666', marginRight: 8 } }, '瑕疵照片（最多5张）'), React.createElement(Space, null, (form.flawPhotos || []).slice(0, 5).map(function (url, i) { return React.createElement('img', { key: i, src: url, alt: '', style: { width: 60, height: 60, objectFit: 'cover', borderRadius: 4 } }); }), (form.flawPhotos || []).length < 5 ? React.createElement(Button, { onClick: function () { setForm(function (p) { var n = {}; for (var k in p) n[k] = p[k]; n.flawPhotos = (p.flawPhotos || []).concat(['https://picsum.photos/200/150?f=' + Date.now()]); return n; }); } }, '上传') : null)),
					React.createElement(Col, { span: 24 }, React.createElement(Space, null, React.createElement(Button, { type: 'primary', onClick: handleAddNext }, '下一步'), React.createElement(Button, { onClick: handleAddSave }, '保存'), React.createElement(Button, { onClick: function () { setCurrentView('list'); } }, '取消')))
				) : React.createElement('div', null,
					React.createElement('div', { style: { marginBottom: 16, fontWeight: 600 } }, '备车检查'),
					React.createElement(Table, {
						dataSource: form.inspectionList || [],
						rowKey: function (_, i) { return i; },
						pagination: false,
						columns: [
							{ title: '检查类型', dataIndex: 'checkType', width: 100 },
							{ title: '检查项', dataIndex: 'checkItem', width: 120 },
							{ title: '检查项结果', dataIndex: 'result', width: 120, render: function (val, record, i) {
								return React.createElement(Select, { value: val, onChange: function (v) { setForm(function (p) { var n = {}; for (var k in p) n[k] = p[k]; var list = (p.inspectionList || []).slice(); list[i] = Object.assign({}, list[i], { result: v }); n.inspectionList = list; return n; }); }, style: { width: '100%' }, options: [{ value: '正常', label: '正常' }, { value: '异常', label: '异常' }] });
							}},
							{ title: '胎纹深度（轮胎时）', key: 'treadDepth', width: 140, render: function (_, record, i) {
								if (record.checkItem && record.checkItem.indexOf('胎') !== -1) {
									return React.createElement(Input, { value: record.treadDepth, onChange: function (e) { setForm(function (p) { var n = {}; for (var k in p) n[k] = p[k]; var list = (p.inspectionList || []).slice(); list[i] = Object.assign({}, list[i], { treadDepth: e.target.value }); n.inspectionList = list; return n; }); }, placeholder: '胎纹深度' });
								}
								return '-';
							}},
							{ title: '备注', dataIndex: 'remark', render: function (val, record, i) {
								return React.createElement(Input, { value: val, onChange: function (e) { setForm(function (p) { var n = {}; for (var k in p) n[k] = p[k]; var list = (p.inspectionList || []).slice(); list[i] = Object.assign({}, list[i], { remark: e.target.value }); n.inspectionList = list; return n; }); }, placeholder: '备注' });
							}}
						]
					}),
					React.createElement('div', { style: { marginTop: 16 } }, React.createElement(Space, null, React.createElement(Button, { type: 'primary', onClick: handleAddSubmit }, '提交'), React.createElement(Button, { onClick: handleAddSave }, '保存'), React.createElement(Button, { onClick: function () { setCurrentView('list'); } }, '取消')))
				)
			)
		);
	}

	return ListView();
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
