// 【重要】必须使用 const Component 作为组件变量名
// 停车场管理 - 车辆资产管理后台模块
// 设计变量参考 Arco Design Token: https://arco.design/react/docs/token
var ARCO_TOKEN = {
	// 主色 / 品牌色
	primary: '#165DFF',
	primaryHover: '#4080FF',
	primaryActive: '#0E42D2',
	// 功能色
	danger: '#F53F3F',
	success: '#00B42A',
	warning: '#FF7D00',
	link: '#165DFF',
	// 中性色 (Neutral)
	neutral1: '#FFFFFF',
	neutral2: '#F7F8FA',
	neutral3: '#F2F3F5',
	neutral4: '#E5E6EB',
	neutral5: '#C9CDD4',
	neutral6: '#86909C',
	neutral7: '#4E5969',
	neutral8: '#1D2129',
	// 边框
	border: '#E5E6EB',
	borderSecondary: '#C9CDD4',
	// 填充/背景
	fill: '#F2F3F5',
	fillSecondary: '#F7F8FA',
	// 阴影
	shadowLight: '0 1px 2px rgba(0,0,0,0.05)',
	shadowMedium: '0 2px 8px rgba(0,0,0,0.08)',
	// 圆角
	radiusSmall: '2px',
	radiusMedium: '4px',
	radiusLarge: '8px',
	// 间距
	spacing4: '4px',
	spacing8: '8px',
	spacing12: '12px',
	spacing16: '16px',
	spacing24: '24px',
	// 字体
	fontSize14: '14px',
	fontSize16: '16px',
	fontFamily: '-apple-system, BlinkMacSystemFont, "PingFang SC", "Helvetica Neue", Arial, sans-serif'
};

const Component = function () {
	var _useState = React.useState('list');
	var currentView = _useState[0];
	var setCurrentView = _useState[1];

	var _useState2 = React.useState([]);
	var regionProvince = _useState2[0];
	var setRegionProvince = _useState2[1];

	var _useState3 = React.useState('');
	var regionCity = _useState3[0];
	var setRegionCity = _useState3[1];

	var _useState4 = React.useState('');
	var filterParkingName = _useState4[0];
	var setFilterParkingName = _useState4[1];

	var _useState5 = React.useState('');
	var filterManager = _useState5[0];
	var setFilterManager = _useState5[1];

	var _useState5b = React.useState(false);
	var parkingNameInputFocused = _useState5b[0];
	var setParkingNameInputFocused = _useState5b[1];

	var _useState5d = React.useState(false);
	var managerInputFocused = _useState5d[0];
	var setManagerInputFocused = _useState5d[1];

	var _useState6 = React.useState(false);
	var showColumnSettings = _useState6[0];
	var setShowColumnSettings = _useState6[1];

	var _useState6b = React.useState(false);
	var columnIconHover = _useState6b[0];
	var setColumnIconHover = _useState6b[1];

	var _useState6c = React.useState(false);
	var regionCascaderOpen = _useState6c[0];
	var setRegionCascaderOpen = _useState6c[1];

	var _useState6d = React.useState(false);
	var formRegionCascaderOpen = _useState6d[0];
	var setFormRegionCascaderOpen = _useState6d[1];

	var _useState6e = React.useState('');
	var regionCascaderHover = _useState6e[0];
	var setRegionCascaderHover = _useState6e[1];
	var _useState6f = React.useState('');
	var formRegionCascaderHover = _useState6f[0];
	var setFormRegionCascaderHover = _useState6f[1];

	var _useState7 = React.useState(null);
	var vehicleDetailParkingId = _useState7[0];
	var setVehicleDetailParkingId = _useState7[1];

	var _useState8 = React.useState(null);
	var viewParking = _useState8[0];
	var setViewParking = _useState8[1];

	var _useState9 = React.useState(null);
	var editParking = _useState9[0];
	var setEditParking = _useState9[1];

	var _useState10 = React.useState(null);
	var deleteConfirmParking = _useState10[0];
	var setDeleteConfirmParking = _useState10[1];

	var _useState11 = React.useState('');
	var toastMessage = _useState11[0];
	var setToastMessage = _useState11[1];

	var _useState11b = React.useState(false);
	var showRequirementModal = _useState11b[0];
	var setShowRequirementModal = _useState11b[1];

	// 分页状态
	var _useState12 = React.useState(1);
	var currentPage = _useState12[0];
	var setCurrentPage = _useState12[1];
	var _useState13 = React.useState(10);
	var pageSize = _useState13[0];
	var setPageSize = _useState13[1];

	// 新建表单状态
	var _useState12 = React.useState({
		regionProvince: '',
		regionCity: '',
		parkingName: '',
		parkingSpaces: '',
		address: '',
		manager: '',
		managerPhone: '',
		contactName: '',
		contactPhone: '',
		leaseStart: '',
		leaseEnd: '',
		rentFee: '',
		contractFile: null
	});
	var formData = _useState12[0];
	var setFormData = _useState12[1];

	// 列显示配置
	var defaultColumnsVisible = {
		region: true,
		parkingName: true,
		parkedVehicles: true,
		parkingSpaces: true,
		address: true,
		leaseStart: true,
		leaseEnd: true,
		manager: true,
		managerPhone: true,
		contactName: true,
		contactPhone: true
	};
	var _useState13 = React.useState(defaultColumnsVisible);
	var columnsVisible = _useState13[0];
	var setColumnsVisible = _useState13[1];

	// 模拟省-市数据
	var provinceList = [
		{ code: 'gd', name: '广东省' },
		{ code: 'zj', name: '浙江省' },
		{ code: 'bj', name: '北京市' }
	];
	var cityMap = {
		gd: [{ code: 'gz', name: '广州市' }, { code: 'sz', name: '深圳市' }],
		zj: [{ code: 'hz', name: '杭州市' }, { code: 'nb', name: '宁波市' }],
		bj: [{ code: 'bj', name: '北京市' }]
	};

	// 模拟停车场列表数据
	var mockParkingList = [
		{
			id: '1',
			regionProvince: '广东省',
			regionCity: '广州市',
			parkingName: '天河智慧停车场',
			parkedCount: 12,
			parkingSpaces: 50,
			address: '广州市天河区体育西路123号',
			leaseStart: '2023-01-01',
			leaseEnd: '2025-12-31',
			manager: '张明',
			managerPhone: '13800138001',
			contactName: '李华',
			contactPhone: '13900139001',
			vehicles: [
				{ city: '广州', frameNo: 'LGW123456', plateNo: '粤A12345', code: 'V001', brand: '比亚迪', model: '秦', color: '白色', status: '正常', mileage: 12000, location: '天河区体育西路', gpsTime: '2025-02-06 10:30:00' },
				{ city: '广州', frameNo: 'LGW789012', plateNo: '粤A67890', code: 'V002', brand: '特斯拉', model: 'Model 3', color: '黑色', status: '正常', mileage: 8000, location: '天河区体育西路', gpsTime: '2025-02-06 10:28:00' }
			]
		},
		{
			id: '2',
			regionProvince: '广东省',
			regionCity: '深圳市',
			parkingName: '南山科技园停车场',
			parkedCount: 0,
			parkingSpaces: 80,
			address: '深圳市南山区科技园南路88号',
			leaseStart: '2022-06-01',
			leaseEnd: '2025-05-31',
			manager: '王芳',
			managerPhone: '13700137001',
			contactName: '赵强',
			contactPhone: '13600136001',
			vehicles: []
		},
		{
			id: '3',
			regionProvince: '浙江省',
			regionCity: '杭州市',
			parkingName: '西湖景区停车场',
			parkedCount: 5,
			parkingSpaces: 30,
			address: '杭州市西湖区杨公堤1号',
			leaseStart: '2024-01-01',
			leaseEnd: '2026-12-31',
			manager: '陈静',
			managerPhone: '13500135001',
			contactName: '刘洋',
			contactPhone: '13400134001',
			vehicles: [
				{ city: '杭州', frameNo: 'HZ111', plateNo: '浙A11111', code: 'V003', brand: '小鹏', model: 'P7', color: '灰色', status: '维修', mileage: 15000, location: '西湖区杨公堤', gpsTime: '2025-02-05 18:00:00' }
			]
		}
	];

	// 获取所有唯一的停车场名称和负责人
	var getAllParkingNames = function () {
		var names = [];
		var seen = {};
		mockParkingList.forEach(function (item) {
			if (item.parkingName && !seen[item.parkingName]) {
				seen[item.parkingName] = true;
				names.push(item.parkingName);
			}
		});
		return names.sort();
	};
	var getAllManagers = function () {
		var managers = [];
		var seen = {};
		mockParkingList.forEach(function (item) {
			if (item.manager && !seen[item.manager]) {
				seen[item.manager] = true;
				managers.push(item.manager);
			}
		});
		return managers.sort();
	};
	var allParkingNames = getAllParkingNames();
	var allManagers = getAllManagers();

	var getFilteredList = function () {
		var list = mockParkingList;
		if (regionProvince && regionProvince.length > 0) {
			var p = provinceList.find(function (x) { return x.code === regionProvince; });
			var pName = p ? p.name : '';
			list = list.filter(function (item) { return item.regionProvince === pName; });
		}
		if (regionCity) {
			var cities = cityMap[regionProvince];
			var c = cities && cities.find(function (x) { return x.code === regionCity; });
			var cName = c ? c.name : '';
			list = list.filter(function (item) { return item.regionCity === cName; });
		}
		if (filterParkingName) {
			list = list.filter(function (item) {
				return item.parkingName && item.parkingName.indexOf(filterParkingName) >= 0;
			});
		}
		if (filterManager) {
			list = list.filter(function (item) {
				return item.manager && item.manager.indexOf(filterManager) >= 0;
			});
		}
		return list;
	};

	var filteredList = getFilteredList();
	var totalItems = filteredList.length;
	var totalPages = Math.ceil(totalItems / pageSize) || 1;
	var validPage = currentPage > totalPages && totalPages > 0 ? 1 : (currentPage < 1 ? 1 : currentPage);
	if (validPage !== currentPage && totalPages > 0) {
		setCurrentPage(1);
		validPage = 1;
	}
	var startIndex = (validPage - 1) * pageSize;
	var endIndex = startIndex + pageSize;
	var paginatedList = filteredList.slice(startIndex, endIndex);

	var handleExport = function () {
		setToastMessage('导出功能为原型演示');
		setTimeout(function () { setToastMessage(''); }, 2000);
	};

	var handleDeleteConfirm = function () {
		if (!deleteConfirmParking) return;
		if (deleteConfirmParking.parkedCount > 0) {
			setToastMessage('该停车场存在车辆，无法删除');
			setDeleteConfirmParking(null);
			setTimeout(function () { setToastMessage(''); }, 2000);
			return;
		}
		setToastMessage('删除成功');
		setDeleteConfirmParking(null);
		setTimeout(function () { setToastMessage(''); }, 2000);
	};

	var handleFormChange = function (field, value) {
		var next = {};
		for (var k in formData) { next[k] = formData[k]; }
		next[field] = value;
		setFormData(next);
	};

	var handleSubmitNew = function () {
		if (!formData.regionProvince || !formData.regionCity) {
			setToastMessage('请选择地区');
			setTimeout(function () { setToastMessage(''); }, 2000);
			return;
		}
		if (!formData.parkingName || !formData.parkingName.trim()) {
			setToastMessage('请填写停车场名称');
			setTimeout(function () { setToastMessage(''); }, 2000);
			return;
		}
		if (!formData.leaseStart) {
			setToastMessage('请选择租赁开始时间');
			setTimeout(function () { setToastMessage(''); }, 2000);
			return;
		}
		if (!formData.leaseEnd) {
			setToastMessage('请选择租赁到期时间');
			setTimeout(function () { setToastMessage(''); }, 2000);
			return;
		}
		if (formData.leaseEnd < formData.leaseStart) {
			setToastMessage('租赁到期时间不能早于租赁开始时间');
			setTimeout(function () { setToastMessage(''); }, 2000);
			return;
		}
		if (!formData.rentFee || formData.rentFee.trim() === '') {
			setToastMessage('请填写租赁费');
			setTimeout(function () { setToastMessage(''); }, 2000);
			return;
		}
		setToastMessage('提交成功');
		setTimeout(function () { setToastMessage(''); }, 1500);
		setCurrentView('list');
		setFormData({
			regionProvince: '',
			regionCity: '',
			parkingName: '',
			parkingSpaces: '',
			address: '',
			manager: '',
			managerPhone: '',
			contactName: '',
			contactPhone: '',
			leaseStart: '',
			leaseEnd: '',
			rentFee: '',
			contractFile: null
		});
	};

	var handleCancelNew = function () {
		setCurrentView('list');
		setFormData({
			regionProvince: '',
			regionCity: '',
			parkingName: '',
			parkingSpaces: '',
			address: '',
			manager: '',
			managerPhone: '',
			contactName: '',
			contactPhone: '',
			leaseStart: '',
			leaseEnd: '',
			rentFee: '',
			contractFile: null
		});
	};

	var t = ARCO_TOKEN;
	var styles = {
		page: { padding: t.spacing24, fontFamily: t.fontFamily, backgroundColor: t.fill, minHeight: '100vh' },
		breadcrumb: { marginBottom: t.spacing16, fontSize: t.fontSize14, color: t.neutral6, display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
		breadcrumbLeft: { display: 'flex', alignItems: 'center' },
		breadcrumbLink: { color: t.link, textDecoration: 'none', marginRight: t.spacing8 },
		breadcrumbCurrent: { color: t.neutral8 },
		breadcrumbRight: { display: 'flex', alignItems: 'center' },
		requirementLink: { color: t.link, textDecoration: 'none', fontSize: t.fontSize14, cursor: 'pointer' },
		card: { backgroundColor: t.neutral1, borderRadius: t.radiusLarge, boxShadow: t.shadowLight, marginBottom: t.spacing16, padding: t.spacing16 },
		filterRow: { display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: t.spacing12 },
		filterRowLeft: { display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: t.spacing12 },
		filterRowRight: { display: 'flex', alignItems: 'center', gap: t.spacing8, marginLeft: 'auto' },
		label: { marginRight: t.spacing8, fontSize: t.fontSize14, color: t.neutral8 },
		select: { padding: '0 10px', height: '32px', borderRadius: '2px', border: '1px solid ' + t.border, fontSize: t.fontSize14, boxSizing: 'border-box' },
		input: { padding: '0 10px', height: '32px', width: '100%', borderRadius: '2px', border: '1px solid ' + t.border, fontSize: t.fontSize14, boxSizing: 'border-box' },
		toolbar: { display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: t.spacing12, marginBottom: t.spacing16 },
		btn: { padding: t.spacing8 + ' ' + t.spacing16, borderRadius: t.radiusMedium, cursor: 'pointer', fontSize: t.fontSize14, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px', boxSizing: 'border-box' },
		btnFixed: { width: '100px', height: '32px', padding: 0, borderRadius: '2px', lineHeight: '1' },
		btnIcon: { width: '14px', height: '14px', flexShrink: 0, display: 'block' },
		btnPrimary: { backgroundColor: t.primary, color: t.neutral1, border: 'none' },
		btnFillBlue: { backgroundColor: t.primary, color: t.neutral1, border: 'none' },
		btnOutlineBlue: { backgroundColor: t.neutral1, color: t.primary, border: '1px solid ' + t.primary },
		btnDefault: { backgroundColor: t.neutral1, color: t.neutral8, border: '1px solid ' + t.border },
		btnDanger: { backgroundColor: t.danger, color: t.neutral1, border: 'none' },
		tableWrap: { overflowX: 'auto', backgroundColor: t.neutral1, borderRadius: t.radiusMedium, border: '1px solid ' + t.neutral4 },
		table: { width: '100%', borderCollapse: 'separate', borderSpacing: 0, fontSize: t.fontSize14 },
		th: { textAlign: 'left', padding: '12px 16px', backgroundColor: t.fillSecondary, borderBottom: '1px solid ' + t.neutral4, fontWeight: 600, color: t.neutral8, fontSize: t.fontSize14, whiteSpace: 'nowrap' },
		td: { padding: '12px 16px', borderBottom: '1px solid ' + t.neutral4, color: t.neutral8, fontSize: t.fontSize14 },
		trHover: { backgroundColor: t.fillSecondary },
		pagination: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', borderTop: '1px solid ' + t.neutral4, backgroundColor: t.neutral1 },
		paginationLeft: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: t.fontSize14, color: t.neutral7 },
		paginationRight: { display: 'flex', alignItems: 'center', gap: '8px' },
		paginationSelect: { padding: '4px 8px', height: '28px', borderRadius: '2px', border: '1px solid ' + t.border, fontSize: t.fontSize14, backgroundColor: t.neutral1 },
		paginationBtn: { minWidth: '28px', height: '28px', padding: '0 8px', borderRadius: '2px', border: '1px solid ' + t.border, backgroundColor: t.neutral1, color: t.neutral8, cursor: 'pointer', fontSize: t.fontSize14, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' },
		paginationBtnActive: { backgroundColor: t.primary, color: t.neutral1, borderColor: t.primary },
		paginationBtnDisabled: { opacity: 0.5, cursor: 'not-allowed' },
		paginationInput: { width: '50px', height: '28px', padding: '0 8px', borderRadius: '2px', border: '1px solid ' + t.border, fontSize: t.fontSize14, textAlign: 'center' },
		linkBlue: { color: t.link, cursor: 'pointer', textDecoration: 'none' },
		actionLink: { color: t.link, cursor: 'pointer', marginRight: t.spacing12, fontSize: t.fontSize14 },
		modalMask: { position: 'fixed', left: 0, top: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.45)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' },
		modalBox: { backgroundColor: t.neutral1, borderRadius: t.radiusLarge, maxWidth: '90%', maxHeight: '90%', overflow: 'auto', padding: t.spacing24, minWidth: '500px', position: 'relative' },
		modalTitle: { fontSize: t.fontSize16, fontWeight: 600, marginBottom: t.spacing16, color: t.neutral8 },
		modalHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: t.spacing16 },
		modalCloseBtn: { position: 'absolute', right: t.spacing16, top: t.spacing16, width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', borderRadius: t.radiusMedium, backgroundColor: 'transparent', border: 'none', color: t.neutral6, fontSize: '18px', lineHeight: '1', padding: 0 },
		modalCloseBtnHover: { backgroundColor: t.fill, color: t.neutral8 },
		modalContent: { fontSize: t.fontSize14, color: t.neutral8, lineHeight: '1.6', whiteSpace: 'pre-wrap' },
		requirementSection: { marginBottom: t.spacing16 },
		requirementSectionTitle: { fontSize: t.fontSize16, fontWeight: 600, color: t.neutral8, marginBottom: t.spacing8 },
		requirementItem: { marginBottom: t.spacing8, paddingLeft: t.spacing16 },
		requirementSubItem: { marginBottom: t.spacing4, paddingLeft: t.spacing16, fontSize: t.fontSize14, color: t.neutral7 },
		modalFooter: { marginTop: t.spacing24, display: 'flex', justifyContent: 'flex-end', gap: t.spacing8 },
		toast: { position: 'fixed', top: t.spacing24, left: '50%', transform: 'translateX(-50%)', backgroundColor: 'rgba(0,0,0,0.75)', color: t.neutral1, padding: '10px 20px', borderRadius: t.radiusMedium, zIndex: 2000, fontSize: t.fontSize14 },
		formRow: { marginBottom: t.spacing16 },
		formLabel: { display: 'block', marginBottom: '6px', fontSize: t.fontSize14, color: t.neutral8 },
		formLabelReq: { color: t.danger, marginLeft: '2px' },
		vehicleCard: { border: '1px solid ' + t.neutral4, borderRadius: '6px', padding: t.spacing12, backgroundColor: t.fillSecondary, fontSize: '13px', color: t.neutral8 },
		vehicleCardRow: { marginBottom: t.spacing4 },
		vehicleModalBox: { backgroundColor: t.neutral1, borderRadius: t.radiusLarge, maxWidth: '1200px', width: '90%', maxHeight: '80vh', overflow: 'auto', padding: t.spacing24, boxShadow: t.shadowMedium },
		vehicleModalTitle: { fontSize: t.fontSize16, fontWeight: 600, marginBottom: t.spacing16, color: t.neutral8 },
		columnSettingsBox: { position: 'absolute', right: 0, top: '100%', marginTop: t.spacing4, backgroundColor: t.neutral1, border: '1px solid ' + t.border, borderRadius: t.radiusMedium, padding: 0, minWidth: '220px', boxShadow: t.shadowMedium, zIndex: 100 },
		columnSettingsHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: t.spacing12, borderBottom: '1px solid ' + t.neutral4, fontSize: t.fontSize14, fontWeight: 600, color: t.neutral8 },
		columnSettingsBody: { padding: t.spacing12, maxHeight: '320px', overflowY: 'auto' },
		checkboxRow: { marginBottom: '6px', fontSize: t.fontSize14 },
		iconBtn: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', padding: 0, margin: 0, backgroundColor: 'transparent', border: 'none', borderRadius: t.radiusMedium, cursor: 'pointer', color: t.neutral6, transition: 'background-color 0.2s, color 0.2s' },
		newPageLayout: { display: 'flex', gap: t.spacing24, flexWrap: 'wrap' },
		newPageForm: { flex: '2', minWidth: '400px' },
		newPageMap: { flex: '1', minWidth: '300px', height: '400px', backgroundColor: t.neutral4, borderRadius: t.radiusLarge, display: 'flex', alignItems: 'center', justifyContent: 'center', color: t.neutral6, fontSize: t.fontSize14 },
		cascaderWrap: { position: 'relative', width: '300px' },
		cascaderInput: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', height: '32px', padding: '0 10px', borderRadius: '2px', border: '1px solid ' + t.border, backgroundColor: t.neutral1, fontSize: t.fontSize14, color: t.neutral8, cursor: 'pointer', boxSizing: 'border-box' },
		cascaderInputFocus: { borderColor: t.primary, outline: 'none' },
		cascaderPlaceholder: { color: t.neutral6 },
		cascaderChevron: { marginLeft: '8px', color: t.neutral6, transition: 'transform 0.2s' },
		cascaderPanel: { position: 'absolute', left: 0, top: '100%', marginTop: '4px', backgroundColor: t.neutral1, borderRadius: t.radiusMedium, border: '1px solid ' + t.border, boxShadow: t.shadowMedium, zIndex: 100, display: 'flex', minWidth: '280px', maxHeight: '280px' },
		cascaderColumn: { minWidth: '120px', maxHeight: '280px', overflowY: 'auto', borderRight: '1px solid ' + t.neutral4 },
		cascaderColumnLast: { borderRight: 'none' },
		cascaderOption: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', fontSize: t.fontSize14, color: t.neutral8, cursor: 'pointer', whiteSpace: 'nowrap' },
		cascaderOptionHover: { backgroundColor: t.fill },
		autocompleteWrap: { position: 'relative', width: '300px' },
		autocompletePanel: { position: 'absolute', left: 0, top: '100%', marginTop: '4px', backgroundColor: t.neutral1, borderRadius: t.radiusMedium, border: '1px solid ' + t.border, boxShadow: t.shadowMedium, zIndex: 100, minWidth: '100%', maxHeight: '240px', overflowY: 'auto' },
		autocompleteOption: { padding: '8px 12px', fontSize: t.fontSize14, color: t.neutral8, cursor: 'pointer' },
		autocompleteOptionHover: { backgroundColor: t.fill }
	};

	return (
		<div style={styles.page}>
			{/* 面包屑 */}
			<div style={styles.breadcrumb}>
				<div style={styles.breadcrumbLeft}>
					<a href="#" style={styles.breadcrumbLink} onClick={function (e) { e.preventDefault(); setCurrentView('list'); }}>基本数据维护</a>
					<span style={{ marginRight: '8px' }}>/</span>
					<span style={styles.breadcrumbCurrent}>停车场</span>
				</div>
				<div style={styles.breadcrumbRight}>
					<a href="#" style={styles.requirementLink} onClick={function (e) { e.preventDefault(); setShowRequirementModal(true); }}>查看需求说明</a>
				</div>
			</div>

			{currentView === 'list' && (
				<React.Fragment>
					{/* 筛选栏 - 单独卡片 */}
					<div style={styles.card}>
						<div style={styles.filterRow}>
							<div style={styles.filterRowLeft}>
								<span style={styles.label}>地区：</span>
								<div style={styles.cascaderWrap}>
									<div
										style={Object.assign({}, styles.cascaderInput, regionCascaderOpen ? styles.cascaderInputFocus : {})}
										onClick={function () { setRegionCascaderOpen(!regionCascaderOpen); }}
									>
										<span style={regionProvince && regionCity ? {} : styles.cascaderPlaceholder}>
											{regionProvince && regionCity
												? (function () {
													var p = provinceList.find(function (x) { return x.code === regionProvince; });
													var cities = cityMap[regionProvince];
													var c = cities && cities.find(function (x) { return x.code === regionCity; });
													return (p ? p.name : '') + (p && c ? ' - ' : '') + (c ? c.name : '');
												}())
												: '请选择省/市'}
										</span>
										<span style={Object.assign({}, styles.cascaderChevron, regionCascaderOpen ? { transform: 'rotate(180deg)' } : {})}>
											<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M7 10l5 5 5-5z" /></svg>
										</span>
									</div>
									{regionCascaderOpen && (
										<React.Fragment>
											<div style={{ position: 'fixed', left: 0, top: 0, right: 0, bottom: 0, zIndex: 99 }} onClick={function () { setRegionCascaderOpen(false); }} />
											<div style={styles.cascaderPanel} onClick={function (e) { e.stopPropagation(); }}>
												<div style={styles.cascaderColumn}>
													{provinceList.map(function (p) {
														var isSelected = regionProvince === p.code;
														var isHovered = regionCascaderHover === 'p-' + p.code;
														return React.createElement('div', {
															key: p.code,
															style: Object.assign({}, styles.cascaderOption, (isSelected || isHovered) ? styles.cascaderOptionHover : {}),
															onClick: function () {
																setRegionProvince(p.code);
																setRegionCity('');
															},
															onMouseEnter: function () { setRegionCascaderHover('p-' + p.code); },
															onMouseLeave: function () { setRegionCascaderHover(''); }
														}, p.name, React.createElement('span', { style: { color: t.neutral6 } }, '>'));
													})}
												</div>
												<div style={Object.assign({}, styles.cascaderColumn, styles.cascaderColumnLast)}>
													{(cityMap[regionProvince] || []).map(function (c) {
														var isSelected = regionCity === c.code;
														var isHovered = regionCascaderHover === 'c-' + c.code;
														return React.createElement('div', {
															key: c.code,
															style: Object.assign({}, styles.cascaderOption, (isSelected || isHovered) ? styles.cascaderOptionHover : {}),
															onClick: function () {
																setRegionCity(c.code);
																setRegionCascaderOpen(false);
															},
															onMouseEnter: function () { setRegionCascaderHover('c-' + c.code); },
															onMouseLeave: function () { setRegionCascaderHover(''); }
														}, c.name);
													})}
												</div>
											</div>
										</React.Fragment>
									)}
								</div>
								<span style={styles.label}>停车场名称：</span>
								<div style={styles.autocompleteWrap}>
									<input
										style={Object.assign({}, styles.input, parkingNameInputFocused ? { borderColor: t.primary } : {})}
										placeholder="支持模糊搜索"
										value={filterParkingName}
										onChange={function (e) { setFilterParkingName(e.target.value); }}
										onFocus={function () { setParkingNameInputFocused(true); }}
										onBlur={function () { setTimeout(function () { setParkingNameInputFocused(false); }, 200); }}
									/>
									{(parkingNameInputFocused || filterParkingName) && allParkingNames.filter(function (name) {
										return !filterParkingName || name.indexOf(filterParkingName) >= 0;
									}).length > 0 && (
										<React.Fragment>
											<div style={{ position: 'fixed', left: 0, top: 0, right: 0, bottom: 0, zIndex: 99 }} onClick={function () { setParkingNameInputFocused(false); }} />
											<div style={styles.autocompletePanel} onClick={function (e) { e.stopPropagation(); }}>
												{allParkingNames.filter(function (name) {
													return !filterParkingName || name.indexOf(filterParkingName) >= 0;
												}).map(function (name) {
													var isSelected = filterParkingName === name;
													return React.createElement('div', {
														key: name,
														style: Object.assign({}, styles.autocompleteOption, isSelected ? styles.autocompleteOptionHover : {}),
														onMouseDown: function (e) { e.preventDefault(); },
														onClick: function () {
															setFilterParkingName(name);
															setParkingNameInputFocused(false);
														},
														onMouseEnter: function (e) { e.currentTarget.style.backgroundColor = t.fill; },
														onMouseLeave: function (e) { if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent'; }
													}, name);
												})}
											</div>
										</React.Fragment>
									)}
								</div>
								<span style={styles.label}>负责人：</span>
								<div style={styles.autocompleteWrap}>
									<input
										style={Object.assign({}, styles.input, managerInputFocused ? { borderColor: t.primary } : {})}
										placeholder="支持模糊搜索"
										value={filterManager}
										onChange={function (e) { setFilterManager(e.target.value); }}
										onFocus={function () { setManagerInputFocused(true); }}
										onBlur={function () { setTimeout(function () { setManagerInputFocused(false); }, 200); }}
									/>
									{(managerInputFocused || filterManager) && allManagers.filter(function (manager) {
										return !filterManager || manager.indexOf(filterManager) >= 0;
									}).length > 0 && (
										<React.Fragment>
											<div style={{ position: 'fixed', left: 0, top: 0, right: 0, bottom: 0, zIndex: 99 }} onClick={function () { setManagerInputFocused(false); }} />
											<div style={styles.autocompletePanel} onClick={function (e) { e.stopPropagation(); }}>
												{allManagers.filter(function (manager) {
													return !filterManager || manager.indexOf(filterManager) >= 0;
												}).map(function (manager) {
													var isSelected = filterManager === manager;
													return React.createElement('div', {
														key: manager,
														style: Object.assign({}, styles.autocompleteOption, isSelected ? styles.autocompleteOptionHover : {}),
														onMouseDown: function (e) { e.preventDefault(); },
														onClick: function () {
															setFilterManager(manager);
															setManagerInputFocused(false);
														},
														onMouseEnter: function (e) { e.currentTarget.style.backgroundColor = t.fill; },
														onMouseLeave: function (e) { if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent'; }
													}, manager);
												})}
											</div>
										</React.Fragment>
									)}
								</div>
							</div>
							<div style={styles.filterRowRight}>
								<button
									style={Object.assign({}, styles.btn, styles.btnFillBlue, styles.btnFixed)}
									onClick={function () {
										setCurrentPage(1);
										setToastMessage('查询成功');
										setTimeout(function () { setToastMessage(''); }, 1500);
									}}
								>
									<svg style={styles.btnIcon} viewBox="0 0 24 24" fill="currentColor">
										<path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
									</svg>
									<span>查询</span>
								</button>
								<button
									style={Object.assign({}, styles.btn, styles.btnOutlineBlue, styles.btnFixed)}
									onClick={function () {
										setRegionProvince('');
										setRegionCity('');
										setFilterParkingName('');
										setFilterManager('');
										setParkingNameInputFocused(false);
										setManagerInputFocused(false);
										setCurrentPage(1);
									}}
								>
									<svg style={styles.btnIcon} viewBox="0 0 24 24" fill="currentColor">
										<path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" />
									</svg>
									<span>重置</span>
								</button>
							</div>
						</div>
					</div>

					{/* 列表区 - 单独卡片 */}
					<div style={styles.card}>
						<div style={styles.toolbar}>
						<button
							style={Object.assign({}, styles.btn, styles.btnFillBlue, styles.btnFixed)}
							onClick={function () { setCurrentView('new'); }}
						>
							<svg style={styles.btnIcon} viewBox="0 0 24 24" fill="currentColor">
								<path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
							</svg>
							<span>新建</span>
						</button>
						<button style={Object.assign({}, styles.btn, styles.btnDefault, styles.btnFixed)} onClick={handleExport}>
							<svg style={styles.btnIcon} viewBox="0 0 24 24" fill="currentColor">
								<path d="M19 12v7H5v-7H3v7c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-7h-2zm-6 .67l2.59-2.58L17 11.5l-5 5-5-5 1.41-1.41L11 12.67V3h2z" />
							</svg>
							<span>导出</span>
						</button>
						<div style={{ position: 'relative' }}>
							<button
								style={Object.assign(
									{},
									styles.iconBtn,
									(columnIconHover || showColumnSettings) ? { backgroundColor: t.neutral3, color: t.neutral7 } : {}
								)}
								onClick={function () { setShowColumnSettings(!showColumnSettings); }}
								onMouseEnter={function () { setColumnIconHover(true); }}
								onMouseLeave={function () { setColumnIconHover(false); }}
								title="列展示"
								aria-label="列展示"
							>
								<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
									<path d="M12.22 2h-.44a2 2 0 00-2 2v.18a2 2 0 01-1 1.73l-.43.25a2 2 0 01-2 0l-.15-.08a2 2 0 00-2.73.73l-.22.38a2 2 0 00.73 2.73l.15.1a2 2 0 011 1.72v.51a2 2 0 01-1 1.74l-.15.09a2 2 0 00-.73 2.73l.22.38a2 2 0 002.73.73l.15-.08a2 2 0 012 0l.43.25a2 2 0 011 1.73V20a2 2 0 002 2h.44a2 2 0 002-2v-.18a2 2 0 011-1.73l.43-.25a2 2 0 012 0l.15.08a2 2 0 002.73-.73l.22-.39a2 2 0 00-.73-2.73l-.15-.08a2 2 0 01-1-1.74v-.5a2 2 0 011-1.74l.15-.09a2 2 0 00.73-2.73l-.22-.38a2 2 0 00-2.73-.73l-.15.08a2 2 0 01-2 0l-.43-.25a2 2 0 01-1-1.73V4a2 2 0 00-2-2z" />
									<circle cx="12" cy="12" r="3" />
								</svg>
							</button>
							{showColumnSettings && (
								<React.Fragment>
									<div
										style={{ position: 'fixed', left: 0, top: 0, right: 0, bottom: 0, zIndex: 99 }}
										onClick={function () { setShowColumnSettings(false); }}
									/>
									<div
										style={styles.columnSettingsBox}
										onClick={function (e) { e.stopPropagation(); }}
									>
										<div style={styles.columnSettingsHeader}>
											<span>列展示</span>
											<button
												style={Object.assign({}, styles.btn, styles.btnOutlineBlue, { padding: '2px 8px', fontSize: '12px' })}
												onClick={function () { setColumnsVisible(defaultColumnsVisible); }}
											>
												重置
											</button>
										</div>
										<div style={styles.columnSettingsBody}>
											{Object.keys(columnsVisible).map(function (key) {
												var labels = {
													region: '地区',
													parkingName: '停车场名称',
													parkedVehicles: '停放车辆',
													parkingSpaces: '车位数',
													address: '地址',
													leaseStart: '租赁开始时间',
													leaseEnd: '租赁结束时间',
													manager: '负责人',
													managerPhone: '负责人联系方式',
													contactName: '停车场联系人',
													contactPhone: '停车场电话'
												};
												return React.createElement(
													'div',
													{ key: key, style: styles.checkboxRow },
													React.createElement('label', { style: { display: 'flex', alignItems: 'center', cursor: 'pointer' }},
														React.createElement('input', {
															type: 'checkbox',
															checked: columnsVisible[key],
															onChange: function () {
																var next = {};
																for (var k in columnsVisible) { next[k] = columnsVisible[k]; }
																next[key] = !columnsVisible[key];
																setColumnsVisible(next);
															}
														}),
														React.createElement('span', { style: { marginLeft: '8px' } }, labels[key] || key)
													)
												);
											})}
										</div>
									</div>
								</React.Fragment>
							)}
						</div>
					</div>

					{/* 表格 */}
					<div style={styles.tableWrap}>
						<table style={styles.table}>
							<thead>
								<tr>
									{columnsVisible.region && React.createElement('th', { style: styles.th }, '地区')}
									{columnsVisible.parkingName && React.createElement('th', { style: styles.th }, '停车场名称')}
									{columnsVisible.parkedVehicles && React.createElement('th', { style: styles.th }, '停放车辆')}
									{columnsVisible.parkingSpaces && React.createElement('th', { style: styles.th }, '车位数')}
									{columnsVisible.address && React.createElement('th', { style: styles.th }, '地址')}
									{columnsVisible.leaseStart && React.createElement('th', { style: styles.th }, '租赁开始时间')}
									{columnsVisible.leaseEnd && React.createElement('th', { style: styles.th }, '租赁结束时间')}
									{columnsVisible.manager && React.createElement('th', { style: styles.th }, '负责人')}
									{columnsVisible.managerPhone && React.createElement('th', { style: styles.th }, '负责人联系方式')}
									{columnsVisible.contactName && React.createElement('th', { style: styles.th }, '停车场联系人')}
									{columnsVisible.contactPhone && React.createElement('th', { style: styles.th }, '停车场电话')}
									<th style={styles.th}>操作</th>
								</tr>
							</thead>
							<tbody>
								{paginatedList.length === 0 ? (
									React.createElement('tr', {},
										React.createElement('td', {
											colSpan: Object.keys(columnsVisible).filter(function (k) { return columnsVisible[k]; }).length + 1,
											style: Object.assign({}, styles.td, { textAlign: 'center', color: t.neutral6, padding: '40px' })
										}, '暂无数据')
									)
								) : paginatedList.map(function (row) {
									return React.createElement(
										'tr',
										{ key: row.id, style: { transition: 'background-color 0.2s' }, onMouseEnter: function (e) { e.currentTarget.style.backgroundColor = t.fillSecondary; }, onMouseLeave: function (e) { e.currentTarget.style.backgroundColor = 'transparent'; } },
										columnsVisible.region && React.createElement('td', { style: styles.td }, row.regionProvince + '-' + row.regionCity),
										columnsVisible.parkingName && React.createElement('td', { style: styles.td }, row.parkingName),
										columnsVisible.parkedVehicles && React.createElement('td', { style: styles.td },
											React.createElement('span', {
												style: styles.linkBlue,
												onClick: function () {
													if (row.parkedCount > 0 && row.vehicles && row.vehicles.length > 0) {
														setVehicleDetailParkingId(row.id);
													} else {
														setToastMessage('该停车场暂无车辆');
														setTimeout(function () { setToastMessage(''); }, 2000);
													}
												}
											}, row.parkedCount)
										),
										columnsVisible.parkingSpaces && React.createElement('td', { style: styles.td }, row.parkingSpaces),
										columnsVisible.address && React.createElement('td', { style: styles.td }, row.address),
										columnsVisible.leaseStart && React.createElement('td', { style: styles.td }, row.leaseStart),
										columnsVisible.leaseEnd && React.createElement('td', { style: styles.td }, row.leaseEnd),
										columnsVisible.manager && React.createElement('td', { style: styles.td }, row.manager),
										columnsVisible.managerPhone && React.createElement('td', { style: styles.td }, row.managerPhone),
										columnsVisible.contactName && React.createElement('td', { style: styles.td }, row.contactName),
										columnsVisible.contactPhone && React.createElement('td', { style: styles.td }, row.contactPhone),
										React.createElement('td', { style: styles.td },
											React.createElement('a', {
												style: styles.actionLink,
												onClick: function (e) { e.preventDefault(); setViewParking(row); }
											}, '查看'),
											React.createElement('a', {
												style: styles.actionLink,
												onClick: function (e) { e.preventDefault(); setEditParking(row); }
											}, '编辑'),
											React.createElement('a', {
												style: Object.assign({}, styles.actionLink, { color: t.danger }),
												onClick: function (e) { e.preventDefault(); setDeleteConfirmParking(row); }
											}, '删除')
										)
									);
								})}
							</tbody>
						</table>
					</div>

					{/* 分页 */}
					{totalItems > 0 && (
						<div style={styles.pagination}>
							<div style={styles.paginationLeft}>
								<span>共 {totalItems} 条</span>
								<span style={{ marginLeft: '16px' }}>每页显示</span>
								<select
									style={styles.paginationSelect}
									value={pageSize}
									onChange={function (e) {
										var newPageSize = parseInt(e.target.value, 10);
										setPageSize(newPageSize);
										setCurrentPage(1);
									}}
								>
									<option value="10">10</option>
									<option value="20">20</option>
									<option value="50">50</option>
									<option value="100">100</option>
								</select>
								<span>条</span>
							</div>
							<div style={styles.paginationRight}>
								<button
									style={Object.assign({}, styles.paginationBtn, currentPage === 1 ? styles.paginationBtnDisabled : {})}
									onClick={function () { if (currentPage > 1) setCurrentPage(currentPage - 1); }}
									disabled={currentPage === 1}
									onMouseLeave={function (e) { if (currentPage > 1) { e.currentTarget.style.borderColor = t.border; e.currentTarget.style.color = t.neutral8; } }}
								>
									<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
										<path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
									</svg>
								</button>
								{(function () {
									var pages = [];
									var showPages = 5;
									var startPage = Math.max(1, currentPage - Math.floor(showPages / 2));
									var endPage = Math.min(totalPages, startPage + showPages - 1);
									if (endPage - startPage < showPages - 1) {
										startPage = Math.max(1, endPage - showPages + 1);
									}
									if (startPage > 1) {
										pages.push(React.createElement('button', {
											key: 1,
											style: styles.paginationBtn,
											onClick: function () { setCurrentPage(1); },
											onMouseLeave: function (e) { e.currentTarget.style.borderColor = t.border; e.currentTarget.style.color = t.neutral8; }
										}, '1'));
										if (startPage > 2) {
											pages.push(React.createElement('span', { key: 'ellipsis1', style: { padding: '0 4px', color: t.neutral7 } }, '...'));
										}
									}
									for (var i = startPage; i <= endPage; i++) {
										var isActive = i === currentPage;
										pages.push(React.createElement('button', {
											key: i,
											style: Object.assign({}, styles.paginationBtn, isActive ? styles.paginationBtnActive : {}),
											onClick: function (page) { return function () { setCurrentPage(page); }; }(i),
											onMouseLeave: function (e) { if (!isActive) { e.currentTarget.style.borderColor = t.border; e.currentTarget.style.color = t.neutral8; } }
										}, i));
									}
									if (endPage < totalPages) {
										if (endPage < totalPages - 1) {
											pages.push(React.createElement('span', { key: 'ellipsis2', style: { padding: '0 4px', color: t.neutral7 } }, '...'));
										}
										pages.push(React.createElement('button', {
											key: totalPages,
											style: styles.paginationBtn,
											onClick: function () { setCurrentPage(totalPages); },
											onMouseLeave: function (e) { e.currentTarget.style.borderColor = t.border; e.currentTarget.style.color = t.neutral8; }
										}, totalPages));
									}
									return pages;
								})()}
								<button
									style={Object.assign({}, styles.paginationBtn, currentPage === totalPages ? styles.paginationBtnDisabled : {})}
									onClick={function () { if (currentPage < totalPages) setCurrentPage(currentPage + 1); }}
									disabled={currentPage === totalPages}
								>
									<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
										<path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
									</svg>
								</button>
								<span style={{ marginLeft: '8px', fontSize: t.fontSize14, color: t.neutral7 }}>跳至</span>
								<input
									type="number"
									style={styles.paginationInput}
									min="1"
									max={totalPages}
									value={currentPage}
									onChange={function (e) {
										var page = parseInt(e.target.value, 10);
										if (page >= 1 && page <= totalPages) {
											setCurrentPage(page);
										}
									}}
									onKeyDown={function (e) {
										if (e.key === 'Enter') {
											var page = parseInt(e.target.value, 10);
											if (page >= 1 && page <= totalPages) {
												setCurrentPage(page);
											}
										}
									}}
								/>
								<span style={{ fontSize: t.fontSize14, color: t.neutral7 }}>页</span>
							</div>
						</div>
					)}

					</div>
				</React.Fragment>
			)}

			{/* 新建停车场页面 */}
			{currentView === 'new' && (
				<div style={styles.card}>
					<div style={styles.modalTitle}>新建停车场</div>
					<div style={styles.newPageLayout}>
						<div style={styles.newPageForm}>
							<div style={styles.formRow}>
								<span style={styles.formLabel}>地区 <span style={styles.formLabelReq}>*</span></span>
								<div style={styles.cascaderWrap}>
									<div
										style={Object.assign({}, styles.cascaderInput, formRegionCascaderOpen ? styles.cascaderInputFocus : {})}
										onClick={function () { setFormRegionCascaderOpen(!formRegionCascaderOpen); }}
									>
										<span style={formData.regionProvince && formData.regionCity ? {} : styles.cascaderPlaceholder}>
											{formData.regionProvince && formData.regionCity
												? (function () {
													var p = provinceList.find(function (x) { return x.code === formData.regionProvince; });
													var cities = cityMap[formData.regionProvince];
													var c = cities && cities.find(function (x) { return x.code === formData.regionCity; });
													return (p ? p.name : '') + (p && c ? ' - ' : '') + (c ? c.name : '');
												}())
												: '请选择省/市'}
										</span>
										<span style={Object.assign({}, styles.cascaderChevron, formRegionCascaderOpen ? { transform: 'rotate(180deg)' } : {})}>
											<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M7 10l5 5 5-5z" /></svg>
										</span>
									</div>
									{formRegionCascaderOpen && (
										<React.Fragment>
											<div style={{ position: 'fixed', left: 0, top: 0, right: 0, bottom: 0, zIndex: 99 }} onClick={function () { setFormRegionCascaderOpen(false); }} />
											<div style={styles.cascaderPanel} onClick={function (e) { e.stopPropagation(); }}>
												<div style={styles.cascaderColumn}>
													{provinceList.map(function (p) {
														var isSelected = formData.regionProvince === p.code;
														var isHovered = formRegionCascaderHover === 'p-' + p.code;
														return React.createElement('div', {
															key: p.code,
															style: Object.assign({}, styles.cascaderOption, (isSelected || isHovered) ? styles.cascaderOptionHover : {}),
															onClick: function () {
																handleFormChange('regionProvince', p.code);
																handleFormChange('regionCity', '');
															},
															onMouseEnter: function () { setFormRegionCascaderHover('p-' + p.code); },
															onMouseLeave: function () { setFormRegionCascaderHover(''); }
														}, p.name, React.createElement('span', { style: { color: t.neutral6 } }, '>'));
													})}
												</div>
												<div style={Object.assign({}, styles.cascaderColumn, styles.cascaderColumnLast)}>
													{(cityMap[formData.regionProvince] || []).map(function (c) {
														var isSelected = formData.regionCity === c.code;
														var isHovered = formRegionCascaderHover === 'c-' + c.code;
														return React.createElement('div', {
															key: c.code,
															style: Object.assign({}, styles.cascaderOption, (isSelected || isHovered) ? styles.cascaderOptionHover : {}),
															onClick: function () {
																handleFormChange('regionCity', c.code);
																setFormRegionCascaderOpen(false);
															},
															onMouseEnter: function () { setFormRegionCascaderHover('c-' + c.code); },
															onMouseLeave: function () { setFormRegionCascaderHover(''); }
														}, c.name);
													})}
												</div>
											</div>
										</React.Fragment>
									)}
								</div>
							</div>
							<div style={styles.formRow}>
								<span style={styles.formLabel}>停车场名称 <span style={styles.formLabelReq}>*</span></span>
								<input style={styles.input} value={formData.parkingName} onChange={function (e) { handleFormChange('parkingName', e.target.value); }} placeholder="请输入" />
							</div>
							<div style={styles.formRow}>
								<span style={styles.formLabel}>车位数</span>
								<input style={styles.input} type="number" value={formData.parkingSpaces} onChange={function (e) { handleFormChange('parkingSpaces', e.target.value); }} placeholder="选填" />
							</div>
							<div style={styles.formRow}>
								<span style={styles.formLabel}>地址</span>
								<input
									style={styles.input}
									value={formData.address}
									onChange={function (e) { handleFormChange('address', e.target.value); }}
									placeholder="选填，与地图联动"
								/>
							</div>
							<div style={styles.formRow}>
								<span style={styles.formLabel}>负责人</span>
								<input style={styles.input} value={formData.manager} onChange={function (e) { handleFormChange('manager', e.target.value); }} placeholder="选填" />
							</div>
							<div style={styles.formRow}>
								<span style={styles.formLabel}>负责人电话</span>
								<input style={styles.input} value={formData.managerPhone} onChange={function (e) { handleFormChange('managerPhone', e.target.value); }} placeholder="选填" />
							</div>
							<div style={styles.formRow}>
								<span style={styles.formLabel}>停车场联系人</span>
								<input style={styles.input} value={formData.contactName} onChange={function (e) { handleFormChange('contactName', e.target.value); }} placeholder="选填" />
							</div>
							<div style={styles.formRow}>
								<span style={styles.formLabel}>停车场电话</span>
								<input style={styles.input} value={formData.contactPhone} onChange={function (e) { handleFormChange('contactPhone', e.target.value); }} placeholder="选填" />
							</div>
							<div style={styles.formRow}>
								<span style={styles.formLabel}>租赁开始时间 <span style={styles.formLabelReq}>*</span></span>
								<input
									style={styles.input}
									type="date"
									value={formData.leaseStart}
									onChange={function (e) { handleFormChange('leaseStart', e.target.value); }}
								/>
							</div>
							<div style={styles.formRow}>
								<span style={styles.formLabel}>租赁到期时间 <span style={styles.formLabelReq}>*</span></span>
								<input
									style={styles.input}
									type="date"
									value={formData.leaseEnd}
									onChange={function (e) { handleFormChange('leaseEnd', e.target.value); }}
								/>
							</div>
							<div style={styles.formRow}>
								<span style={styles.formLabel}>租赁费 <span style={styles.formLabelReq}>*</span></span>
								<span style={{ display: 'inline-flex', alignItems: 'center' }}>
									<input
										style={styles.input}
										type="number"
										value={formData.rentFee}
										onChange={function (e) { handleFormChange('rentFee', e.target.value); }}
										placeholder="请输入"
									/>
									<span style={{ marginLeft: '8px' }}>元</span>
								</span>
							</div>
							<div style={styles.formRow}>
								<span style={styles.formLabel}>租赁合同</span>
								<input type="file" accept=".pdf" onChange={function (e) { handleFormChange('contractFile', e.target.files[0] || null); }} />
								<span style={{ marginLeft: '8px', fontSize: '12px', color: '#999' }}>支持上传PDF</span>
							</div>
						</div>
						<div style={styles.newPageMap}>
							地图区域（输入地址可定位，拖动反写地址）
							{formData.address && React.createElement('div', { style: { marginTop: '8px', fontSize: '12px' } }, '当前地址：' + formData.address)}
						</div>
					</div>
					<div style={styles.modalFooter}>
						<button style={Object.assign({}, styles.btn, styles.btnDefault)} onClick={handleCancelNew}>取消</button>
						<button style={Object.assign({}, styles.btn, styles.btnPrimary)} onClick={handleSubmitNew}>提交</button>
					</div>
				</div>
			)}

			{/* 编辑弹窗 - 与新增相同可编辑 */}
			{editParking && (
				<div style={styles.modalMask} onClick={function () { setEditParking(null); }}>
					<div style={Object.assign({}, styles.modalBox, { minWidth: '520px' })} onClick={function (e) { e.stopPropagation(); }}>
						<div style={styles.modalTitle}>编辑停车场</div>
						<div style={styles.formRow}>
							<span style={styles.formLabel}>地区 <span style={styles.formLabelReq}>*</span></span>
							<span>{editParking.regionProvince}-{editParking.regionCity}</span>
						</div>
						<div style={styles.formRow}>
							<span style={styles.formLabel}>停车场名称</span>
							<input style={styles.input} defaultValue={editParking.parkingName} placeholder="请输入" />
						</div>
						<div style={styles.formRow}>
							<span style={styles.formLabel}>车位数</span>
							<input style={styles.input} type="number" defaultValue={editParking.parkingSpaces} placeholder="选填" />
						</div>
						<div style={styles.formRow}>
							<span style={styles.formLabel}>地址</span>
							<input style={styles.input} defaultValue={editParking.address} placeholder="选填" />
						</div>
						<div style={styles.formRow}>
							<span style={styles.formLabel}>负责人 / 负责人电话</span>
							<input style={styles.input} defaultValue={editParking.manager} placeholder="负责人" />
							<input style={Object.assign({}, styles.input, { marginLeft: '8px' })} defaultValue={editParking.managerPhone} placeholder="电话" />
						</div>
						<div style={styles.formRow}>
							<span style={styles.formLabel}>停车场联系人 / 停车场电话</span>
							<input style={styles.input} defaultValue={editParking.contactName} placeholder="联系人" />
							<input style={Object.assign({}, styles.input, { marginLeft: '8px' })} defaultValue={editParking.contactPhone} placeholder="电话" />
						</div>
						<div style={styles.formRow}>
							<span style={styles.formLabel}>租赁开始时间 / 租赁结束时间</span>
							<span>{editParking.leaseStart} / {editParking.leaseEnd}</span>
						</div>
						<div style={styles.modalFooter}>
							<button style={Object.assign({}, styles.btn, styles.btnDefault)} onClick={function () { setEditParking(null); }}>取消</button>
							<button style={Object.assign({}, styles.btn, styles.btnPrimary)} onClick={function () { setToastMessage('保存成功'); setEditParking(null); setTimeout(function () { setToastMessage(''); }, 2000); }}>保存</button>
						</div>
					</div>
				</div>
			)}

			{/* 查看弹窗 - 与新增相同但只读 */}
			{viewParking && (
				<div style={styles.modalMask} onClick={function () { setViewParking(null); }}>
					<div style={styles.modalBox} onClick={function (e) { e.stopPropagation(); }}>
						<div style={styles.modalTitle}>查看停车场</div>
						<div style={styles.formRow}>
							<span style={styles.formLabel}>地区</span>
							<span>{viewParking.regionProvince}-{viewParking.regionCity}</span>
						</div>
						<div style={styles.formRow}>
							<span style={styles.formLabel}>停车场名称</span>
							<span>{viewParking.parkingName}</span>
						</div>
						<div style={styles.formRow}>
							<span style={styles.formLabel}>车位数</span>
							<span>{viewParking.parkingSpaces}</span>
						</div>
						<div style={styles.formRow}>
							<span style={styles.formLabel}>地址</span>
							<span>{viewParking.address}</span>
						</div>
						<div style={styles.formRow}>
							<span style={styles.formLabel}>负责人 / 负责人电话</span>
							<span>{viewParking.manager} / {viewParking.managerPhone}</span>
						</div>
						<div style={styles.formRow}>
							<span style={styles.formLabel}>停车场联系人 / 停车场电话</span>
							<span>{viewParking.contactName} / {viewParking.contactPhone}</span>
						</div>
						<div style={styles.formRow}>
							<span style={styles.formLabel}>租赁开始时间 / 租赁结束时间</span>
							<span>{viewParking.leaseStart} / {viewParking.leaseEnd}</span>
						</div>
						<div style={styles.modalFooter}>
							<button style={Object.assign({}, styles.btn, styles.btnDefault)} onClick={function () { setViewParking(null); }}>关闭</button>
						</div>
					</div>
				</div>
			)}

			{/* 删除确认弹窗 */}
			{deleteConfirmParking && (
				<div style={styles.modalMask} onClick={function () { setDeleteConfirmParking(null); }}>
					<div style={Object.assign({}, styles.modalBox, { minWidth: '360px' })} onClick={function (e) { e.stopPropagation(); }}>
						<div style={styles.modalTitle}>确认删除</div>
						<p style={{ margin: '0 0 16px', fontSize: '14px' }}>是否确认删除该停车场？</p>
						<div style={styles.modalFooter}>
							<button style={Object.assign({}, styles.btn, styles.btnDefault)} onClick={function () { setDeleteConfirmParking(null); }}>取消</button>
							<button style={Object.assign({}, styles.btn, styles.btnDanger)} onClick={handleDeleteConfirm}>确认删除</button>
						</div>
					</div>
				</div>
			)}

			{/* 车辆信息弹框 */}
			{vehicleDetailParkingId && (function () {
				var row = mockParkingList.find(function (r) { return r.id === vehicleDetailParkingId; });
				if (!row || !row.vehicles || row.vehicles.length === 0) {
					return null;
				}
				return React.createElement(
					'div',
					{ style: styles.modalMask, onClick: function () { setVehicleDetailParkingId(null); } },
					React.createElement('div', {
						style: styles.vehicleModalBox,
						onClick: function (e) { e.stopPropagation(); }
					},
						React.createElement('div', { style: styles.vehicleModalTitle }, row.parkingName + ' - 车辆明细'),
						React.createElement('div', { style: styles.tableWrap },
							React.createElement('table', { style: styles.table },
								React.createElement('thead', {},
									React.createElement('tr', {},
										React.createElement('th', { style: styles.th }, '运营城市'),
										React.createElement('th', { style: styles.th }, '车架号'),
										React.createElement('th', { style: styles.th }, '车牌号'),
										React.createElement('th', { style: styles.th }, '车辆编号'),
										React.createElement('th', { style: styles.th }, '品牌'),
										React.createElement('th', { style: styles.th }, '型号'),
										React.createElement('th', { style: styles.th }, '车身颜色'),
										React.createElement('th', { style: styles.th }, '整备状态'),
										React.createElement('th', { style: styles.th }, '行驶公里数'),
										React.createElement('th', { style: styles.th }, '当前位置'),
										React.createElement('th', { style: styles.th }, 'GPS最后上传时间')
									)
								),
								React.createElement('tbody', {},
									row.vehicles.map(function (v, i) {
										return React.createElement('tr', { key: i },
											React.createElement('td', { style: styles.td }, v.city),
											React.createElement('td', { style: styles.td }, v.frameNo),
											React.createElement('td', { style: styles.td }, v.plateNo),
											React.createElement('td', { style: styles.td }, v.code),
											React.createElement('td', { style: styles.td }, v.brand),
											React.createElement('td', { style: styles.td }, v.model),
											React.createElement('td', { style: styles.td }, v.color),
											React.createElement('td', { style: styles.td }, v.status),
											React.createElement('td', { style: styles.td }, v.mileage),
											React.createElement('td', { style: styles.td }, v.location),
											React.createElement('td', { style: styles.td }, v.gpsTime)
										);
									})
								)
							)
						),
						React.createElement('div', { style: styles.modalFooter },
							React.createElement('button', {
								style: Object.assign({}, styles.btn, styles.btnDefault),
								onClick: function () { setVehicleDetailParkingId(null); }
							}, '关闭')
						)
					)
				);
			})()}

			{/* 需求说明弹窗 */}
			{showRequirementModal && (
				<div style={styles.modalMask} onClick={function () { setShowRequirementModal(false); }}>
					<div style={Object.assign({}, styles.modalBox, { minWidth: '600px', maxWidth: '800px' })} onClick={function (e) { e.stopPropagation(); }}>
						<button
							style={styles.modalCloseBtn}
							onClick={function () { setShowRequirementModal(false); }}
							onMouseEnter={function (e) { e.currentTarget.style.backgroundColor = t.fill; e.currentTarget.style.color = t.neutral8; }}
							onMouseLeave={function (e) { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = t.neutral6; }}
							title="关闭"
						>
							×
						</button>
						<div style={styles.modalContent}>
							<div style={styles.requirementSection}>
								<div style={styles.requirementSectionTitle}>筛选：</div>
								<div style={styles.requirementItem}>包括地区（级联选择器，省-市）、停车场名称（选择器，支持输入框中模糊搜索）、负责人（选择器，支持输入框中模糊搜索）</div>
							</div>
							<div style={styles.requirementSection}>
								<div style={styles.requirementSectionTitle}>停车场列表：</div>
								<div style={styles.requirementItem}>支持新建、导出、列设置</div>
								<div style={styles.requirementItem}>字段显示依次为地区、停车场名称、停放车辆、车位数、地址、租赁开始时间、租赁结束时间、负责人、负责人联系方式、停车场联系人、停车场联系方式</div>
								<div style={styles.requirementSubItem}>1. 地区字段显示精确至省-市即可</div>
								<div style={styles.requirementSubItem}>2. 停车场名称字段显示实际停车场名称</div>
								<div style={styles.requirementSubItem}>3. 停放车辆显示停车场当前停放车辆数，车辆数标注为重点色（如蓝色），点击车辆数以卡片模式展开对应车辆明细，车辆明细显示运营城市、车架号、车牌号、车辆编号、品牌、型号、车身颜色、整备状态、行驶公里数、当前位置、GPS最后上传时间</div>
								<div style={styles.requirementSubItem}>4. 车位数显示停车场实际车位数</div>
								<div style={styles.requirementSubItem}>5. 地址显示停车场实际地址</div>
								<div style={styles.requirementSubItem}>6. 租赁开始时间显示停车场合同实际租赁时间，显示格式为年月日</div>
								<div style={styles.requirementSubItem}>7. 租赁结束时间显示停车场合同实际租赁时间，显示格式为年月日</div>
								<div style={styles.requirementSubItem}>8. 负责人显示停车场实际负责人姓名</div>
								<div style={styles.requirementSubItem}>9. 负责人联系方式显示停车场实际负责人手机号</div>
								<div style={styles.requirementSubItem}>10. 停车场联系人显示停车场联系人姓名</div>
								<div style={styles.requirementSubItem}>11. 停车场电话显示停车场联系人手机号</div>
								<div style={styles.requirementSubItem}>12. 操作列支持查看、编辑、删除</div>
								<div style={Object.assign({}, styles.requirementItem, { marginTop: t.spacing12 })}>查看与新增页面相同，只是所有信息输入为禁用状态</div>
								<div style={styles.requirementItem}>点击删除进行二次确认，提示"是否确认删除该停车场"，同时判断停车场是否有车辆数据，如有车辆数据则提示"该停车场存在车辆，无法删除"，如停车场无车辆，则toast提示删除成功</div>
							</div>
						</div>
					</div>
				</div>
			)}

			{toastMessage && React.createElement('div', { style: styles.toast }, toastMessage)}
		</div>
	);
};
if (typeof window !== 'undefined') {
	window.Component = Component;
	function mount() {
		var rootEl = document.getElementById('root');
		if (rootEl && window.ReactDOM && window.React) {
			var root = ReactDOM.createRoot(rootEl);
			root.render(React.createElement(Component));
		}
	}
	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', mount);
	} else {
		setTimeout(mount, 0);
	}
}
