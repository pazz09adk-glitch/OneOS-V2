// 【重要】必须使用 const Component 作为组件变量名
// 后装设备 - 运维管理-车辆业务
var ARCO_TOKEN = {
	primary: '#165DFF',
	primaryHover: '#4080FF',
	danger: '#F53F3F',
	success: '#00B42A',
	neutral1: '#FFFFFF',
	neutral2: '#F7F8FA',
	neutral3: '#F2F3F5',
	neutral4: '#E5E6EB',
	neutral5: '#C9CDD4',
	neutral6: '#86909C',
	neutral7: '#4E5969',
	neutral8: '#1D2129',
	border: '#E5E6EB',
	fill: '#F2F3F5',
	fillSecondary: '#F7F8FA',
	shadowLight: '0 1px 2px rgba(0,0,0,0.05)',
	radiusMedium: '4px',
	radiusLarge: '8px',
	spacing8: '8px',
	spacing12: '12px',
	spacing16: '16px',
	spacing24: '24px',
	fontSize14: '14px',
	fontSize16: '16px',
	fontFamily: '-apple-system, BlinkMacSystemFont, "PingFang SC", "Helvetica Neue", Arial, sans-serif',
	link: '#165DFF'
};

var DEVICE_TYPES = ['GPS', '尾板', '车身广告', 'G7安全套件', 'G7普通设备', 'G7温控设备', '备胎'];

var MOCK_VEHICLE_OPTIONS = ['粤A12345', '粤A67890', '粤B11111', '粤B22222', '粤C33333', '京A88888'];

var MOCK_LIST = [
	{ id: '1', deviceType: 'GPS', plateNo: '粤A12345', supplier: '深圳智联', lastOpType: '安装', createTime: '2025-02-20 10:30', removeTime: '', createOperator: '张明', removeOperator: '' },
	{ id: '2', deviceType: '尾板', plateNo: '粤A67890', supplier: '广州机械', lastOpType: '拆除', createTime: '2025-02-01 09:00', removeTime: '2025-02-18 14:20', createOperator: '李强', removeOperator: '王芳' },
	{ id: '3', deviceType: '车身广告', plateNo: '粤B11111', supplier: '东莞广告', lastOpType: '安装', createTime: '2025-02-15 09:00', removeTime: '', createOperator: '李强', removeOperator: '' },
	{ id: '4', deviceType: 'G7安全套件', plateNo: '粤A12345', supplier: 'G7科技', lastOpType: '安装', createTime: '2025-02-10 16:45', removeTime: '', createOperator: '张明', removeOperator: '' },
	{ id: '5', deviceType: '备胎', plateNo: '粤C33333', supplier: '华南轮胎', lastOpType: '拆除', createTime: '2025-01-20 08:00', removeTime: '2025-02-08 11:20', createOperator: '赵六', removeOperator: '赵六' }
];

const Component = function () {
	var antd = window.antd;
	var Select = antd.Select;
	var Button = antd.Button;
	var DatePicker = antd.DatePicker;
	var Table = antd.Table;
	var Modal = antd.Modal;
	var Input = antd.Input;
	var message = antd.message;
	var Option = Select.Option;
	var RangePicker = DatePicker.RangePicker;
	var Tabs = antd.Tabs;

	var _useStateTab = React.useState('installed');
	var activeTab = _useStateTab[0];
	var setActiveTab = _useStateTab[1];

	var _useState = React.useState('');
	var filterDeviceType = _useState[0];
	var setFilterDeviceType = _useState[1];

	var _useState2 = React.useState('');
	var filterVehicle = _useState2[0];
	var setFilterVehicle = _useState2[1];

	var _useState3 = React.useState([]);
	var filterDateRange = _useState3[0];
	var setFilterDateRange = _useState3[1];

	var _useState4 = React.useState({ deviceType: '', vehicle: '', dateStart: '', dateEnd: '' });
	var appliedFilter = _useState4[0];
	var setAppliedFilter = _useState4[1];

	var _useState5 = React.useState(1);
	var currentPage = _useState5[0];
	var setCurrentPage = _useState5[1];

	var _useState6 = React.useState(10);
	var pageSize = _useState6[0];
	var setPageSize = _useState6[1];

	var _useState7 = React.useState(MOCK_LIST);
	var dataList = _useState7[0];
	var setDataList = _useState7[1];

	var _useState8 = React.useState(null);
	var viewRecord = _useState8[0];
	var setViewRecord = _useState8[1];

	var _useState9 = React.useState(null);
	var editRecord = _useState9[0];
	var setEditRecord = _useState9[1];

	var _useState10 = React.useState(null);
	var removeConfirmRecord = _useState10[0];
	var setRemoveConfirmRecord = _useState10[1];

	var _useState11 = React.useState(false);
	var addModalVisible = _useState11[0];
	var setAddModalVisible = _useState11[1];

	var _useState12 = React.useState(false);
	var showRequirementModal = _useState12[0];
	var setShowRequirementModal = _useState12[1];

	var applyBaseFilter = function (list) {
		if (appliedFilter.deviceType) {
			list = list.filter(function (r) { return r.deviceType === appliedFilter.deviceType; });
		}
		if (appliedFilter.vehicle) {
			list = list.filter(function (r) { return r.plateNo && r.plateNo.indexOf(appliedFilter.vehicle) >= 0; });
		}
		return list;
	};

	var installedList = dataList.filter(function (r) { return !r.removeTime || r.removeTime === ''; });
	var removedList = dataList.filter(function (r) { return r.removeTime && r.removeTime !== ''; });

	var installedFiltered = applyBaseFilter(installedList).filter(function (r) {
		if (appliedFilter.dateStart && r.createTime) { if (r.createTime.slice(0, 10) < appliedFilter.dateStart) return false; }
		if (appliedFilter.dateEnd && r.createTime) { if (r.createTime.slice(0, 10) > appliedFilter.dateEnd) return false; }
		return true;
	});
	var removedFiltered = applyBaseFilter(removedList).filter(function (r) {
		if (appliedFilter.dateStart && r.removeTime) { if (r.removeTime.slice(0, 10) < appliedFilter.dateStart) return false; }
		if (appliedFilter.dateEnd && r.removeTime) { if (r.removeTime.slice(0, 10) > appliedFilter.dateEnd) return false; }
		return true;
	});

	var filteredList = activeTab === 'installed' ? installedFiltered : removedFiltered;
	var totalItems = filteredList.length;
	var totalPages = Math.ceil(totalItems / pageSize) || 1;
	var validPage = currentPage > totalPages && totalPages > 0 ? 1 : (currentPage < 1 ? 1 : currentPage);
	var startIndex = (validPage - 1) * pageSize;
	var paginatedList = filteredList.slice(startIndex, startIndex + pageSize);

	var handleQuery = function () {
		var dateStart = '';
		var dateEnd = '';
		if (filterDateRange && filterDateRange.length >= 2 && filterDateRange[0] && filterDateRange[1]) {
			if (filterDateRange[0].format) {
				dateStart = filterDateRange[0].format('YYYY-MM-DD');
				dateEnd = filterDateRange[1].format('YYYY-MM-DD');
			} else if (window.dayjs) {
				dateStart = window.dayjs(filterDateRange[0]).format('YYYY-MM-DD');
				dateEnd = window.dayjs(filterDateRange[1]).format('YYYY-MM-DD');
			}
		}
		setAppliedFilter({
			deviceType: filterDeviceType,
			vehicle: filterVehicle,
			dateStart: dateStart,
			dateEnd: dateEnd
		});
		setCurrentPage(1);
		message.success('查询成功');
	};

	var handleReset = function () {
		setFilterDeviceType('');
		setFilterVehicle('');
		setFilterDateRange([]);
		setAppliedFilter({ deviceType: '', vehicle: '', dateStart: '', dateEnd: '' });
		setCurrentPage(1);
	};

	var handleRemoveConfirm = function (row) {
		var nowStr = '2025-02-24 15:00';
		if (window.dayjs) { nowStr = window.dayjs().format('YYYY-MM-DD HH:mm'); }
		setDataList(dataList.map(function (r) {
			if (r.id === row.id) {
				return { id: r.id, deviceType: r.deviceType, plateNo: r.plateNo, supplier: r.supplier, lastOpType: '拆除', createTime: r.createTime, removeTime: nowStr, createOperator: r.createOperator, removeOperator: '当前用户' };
			}
			return r;
		}));
		setRemoveConfirmRecord(null);
		message.success('拆除成功');
	};

	var t = ARCO_TOKEN;
	var styles = {
		page: { padding: t.spacing24, fontFamily: t.fontFamily, backgroundColor: t.fill, minHeight: '100vh' },
		breadcrumb: { marginBottom: t.spacing16, fontSize: t.fontSize14, color: t.neutral6, display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
		breadcrumbLeft: { display: 'flex', alignItems: 'center' },
		breadcrumbLink: { color: t.link, textDecoration: 'none', marginRight: '8px' },
		breadcrumbCurrent: { color: t.neutral8 },
		requirementLink: { color: t.link, textDecoration: 'none', fontSize: t.fontSize14, cursor: 'pointer' },
		modalContent: { fontSize: t.fontSize14, color: t.neutral8, lineHeight: 1.6 },
		requirementSection: { marginBottom: t.spacing16 },
		requirementSectionTitle: { fontSize: t.fontSize16, fontWeight: 600, color: t.neutral8, marginBottom: 8 },
		requirementItem: { marginBottom: 8, paddingLeft: 16 },
		requirementSubItem: { marginBottom: 4, paddingLeft: 16, color: t.neutral7 },
		card: { backgroundColor: t.neutral1, borderRadius: t.radiusLarge, boxShadow: t.shadowLight, marginBottom: t.spacing16, padding: t.spacing16 },
		filterRow: { display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: t.spacing12 },
		label: { marginRight: t.spacing8, fontSize: t.fontSize14, color: t.neutral8, whiteSpace: 'nowrap' },
		filterRight: { marginLeft: 'auto', display: 'flex', gap: t.spacing8 },
		toolbar: { display: 'flex', justifyContent: 'flex-end', gap: t.spacing12, marginBottom: t.spacing8 }
	};

	var deviceTypeOptions = DEVICE_TYPES.map(function (type) {
		return React.createElement(Option, { key: type, value: type }, type);
	});

	var vehicleOptions = MOCK_VEHICLE_OPTIONS.map(function (v) {
		return React.createElement(Option, { key: v, value: v }, v);
	});

	return React.createElement(
		'div',
		{ style: styles.page },
		React.createElement(
			'div',
			{ style: styles.breadcrumb },
			React.createElement('div', { style: styles.breadcrumbLeft },
				React.createElement('a', { href: '#', style: styles.breadcrumbLink, onClick: function (e) { e.preventDefault(); } }, '运维管理'),
				React.createElement('span', { style: { marginRight: '8px' } }, '/'),
				React.createElement('a', { href: '#', style: styles.breadcrumbLink, onClick: function (e) { e.preventDefault(); } }, '车辆业务'),
				React.createElement('span', { style: { marginRight: '8px' } }, '/'),
				React.createElement('span', { style: styles.breadcrumbCurrent }, '后装设备')
			),
			React.createElement('a', { href: '#', style: styles.requirementLink, onClick: function (e) { e.preventDefault(); setShowRequirementModal(true); } }, '查看需求说明')
		),
		React.createElement(
			'div',
			{ style: styles.card },
			React.createElement(
				'div',
				{ style: styles.filterRow },
				React.createElement('span', { style: styles.label }, '设备类型：'),
				React.createElement(Select, {
					placeholder: '请选择设备类型',
					style: { width: 160 },
					value: filterDeviceType || undefined,
					onChange: function (v) { setFilterDeviceType(v || ''); },
					allowClear: true
				}, deviceTypeOptions),
				React.createElement('span', { style: styles.label }, '使用车辆：'),
				React.createElement(Select, {
					placeholder: '请选择或输入搜索',
					style: { width: 180 },
					value: filterVehicle || undefined,
					onChange: function (v) { setFilterVehicle(v || ''); },
					showSearch: true,
					allowClear: true,
					filterOption: function (input, opt) {
						var c = opt && opt.children;
						return c && String(c).toLowerCase().indexOf((input || '').toLowerCase()) >= 0;
					}
				}, vehicleOptions),
				React.createElement('span', { style: styles.label }, '安装时间：'),
				React.createElement(RangePicker, {
					style: { width: 260 },
					format: 'YYYY-MM-DD',
					placeholder: ['开始日期', '结束日期'],
					value: filterDateRange,
					onChange: function (dates) { setFilterDateRange(dates || []); }
				}),
				React.createElement('div', { style: styles.filterRight },
					React.createElement(Button, { type: 'primary', onClick: handleQuery }, '查询'),
					React.createElement(Button, { onClick: handleReset }, '重置')
				)
			)
		),
		React.createElement(
			'div',
			{ style: styles.card },
			React.createElement(
				'div',
				{ style: styles.toolbar },
				activeTab === 'installed' && React.createElement(Button, { type: 'primary', onClick: function () { message.info('请查看运维管理-车辆业务-后装设备-新增后装设备'); } }, '新增'),
				React.createElement(Button, { onClick: function () { message.info('根据筛选条件导出excel'); } }, '导出')
			),
			React.createElement(Tabs, {
				activeKey: activeTab,
				onChange: function (key) { setActiveTab(key); setCurrentPage(1); },
				items: [
					{
						key: 'installed',
						label: '已安装',
						children: React.createElement(Table, {
							rowKey: 'id',
							size: 'small',
							columns: [
								{ title: '设备类型', dataIndex: 'deviceType', key: 'deviceType', width: 120 },
								{ title: '车牌号', dataIndex: 'plateNo', key: 'plateNo', width: 120 },
								{ title: '供应商', dataIndex: 'supplier', key: 'supplier', width: 120 },
								{ title: '安装时间', dataIndex: 'createTime', key: 'createTime', width: 160 },
								{ title: '安装人', dataIndex: 'createOperator', key: 'createOperator', width: 100 },
								{
									title: '操作',
									key: 'action',
									width: 160,
									render: function (_, row) {
										return React.createElement(React.Fragment, null,
											React.createElement(Button, { type: 'link', size: 'small', onClick: function () { message.info('请查看运维管理-车辆业务-后装设备-查看'); } }, '查看'),
											React.createElement(Button, { type: 'link', size: 'small', onClick: function () { message.info('请查看运维管理-车辆业务-后装设备-编辑'); } }, '编辑'),
											React.createElement(Button, { type: 'link', size: 'small', danger: true, onClick: function () { setRemoveConfirmRecord(row); } }, '拆除')
										);
									}
								}
							],
							dataSource: paginatedList,
							pagination: {
								current: validPage,
								pageSize: pageSize,
								total: totalItems,
								showSizeChanger: true,
								showQuickJumper: true,
								pageSizeOptions: ['10', '20', '50', '100'],
								showTotal: function (total) { return '共 ' + total + ' 条'; },
								onChange: function (page, size) {
									setCurrentPage(page);
									if (size !== pageSize) setPageSize(size);
								}
							}
						})
					},
					{
						key: 'removed',
						label: '拆除记录',
						children: React.createElement(Table, {
							rowKey: 'id',
							size: 'small',
							columns: [
								{ title: '设备类型', dataIndex: 'deviceType', key: 'deviceType', width: 120 },
								{ title: '车牌号', dataIndex: 'plateNo', key: 'plateNo', width: 120 },
								{ title: '供应商', dataIndex: 'supplier', key: 'supplier', width: 120 },
								{ title: '拆除时间', dataIndex: 'removeTime', key: 'removeTime', width: 160 },
								{ title: '拆除人', dataIndex: 'removeOperator', key: 'removeOperator', width: 100 },
								{
									title: '操作',
									key: 'action',
									width: 80,
									render: function (_, row) {
										return React.createElement(Button, { type: 'link', size: 'small', onClick: function () { message.info('请查看运维管理-车辆业务-后装设备-查看'); } }, '查看');
									}
								}
							],
							dataSource: paginatedList,
							pagination: {
								current: validPage,
								pageSize: pageSize,
								total: totalItems,
								showSizeChanger: true,
								showQuickJumper: true,
								pageSizeOptions: ['10', '20', '50', '100'],
								showTotal: function (total) { return '共 ' + total + ' 条'; },
								onChange: function (page, size) {
									setCurrentPage(page);
									if (size !== pageSize) setPageSize(size);
								}
							}
						})
					}
				]
			})
		),
		viewRecord && React.createElement(Modal, {
			title: '查看后装设备',
			open: !!viewRecord,
			onCancel: function () { setViewRecord(null); },
			footer: React.createElement(Button, { onClick: function () { setViewRecord(null); } }, '关闭'),
			width: 520,
			children: viewRecord ? React.createElement('div', { style: { lineHeight: '2' } },
				React.createElement('div', null, '设备类型：', viewRecord.deviceType),
				React.createElement('div', null, '车牌号：', viewRecord.plateNo),
				React.createElement('div', null, '供应商：', viewRecord.supplier),
				React.createElement('div', null, '安装时间：', viewRecord.createTime || '-'),
				React.createElement('div', null, '安装人：', viewRecord.createOperator || '-'),
				React.createElement('div', null, '拆除时间：', viewRecord.removeTime || '-'),
				React.createElement('div', null, '拆除人：', viewRecord.removeOperator || '-')
			) : null
		}),
		editRecord && React.createElement(Modal, {
			title: '编辑后装设备',
			open: !!editRecord,
			onCancel: function () { setEditRecord(null); },
			onOk: function () {
				setEditRecord(null);
				message.success('保存成功');
			},
			okText: '保存',
			cancelText: '取消',
			width: 520,
			children: editRecord ? React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 16 } },
				React.createElement('div', null, React.createElement('span', { style: styles.label }, '设备类型'), React.createElement(Select, { style: { width: '100%' }, value: editRecord.deviceType, options: DEVICE_TYPES.map(function (d) { return { label: d, value: d }; }) })),
				React.createElement('div', null, React.createElement('span', { style: styles.label }, '车牌号'), React.createElement(Input, { style: { width: '100%' }, value: editRecord.plateNo, readOnly: true })),
				React.createElement('div', null, React.createElement('span', { style: styles.label }, '供应商'), React.createElement(Input, { style: { width: '100%' }, defaultValue: editRecord.supplier }))
			) : null
		}),
		removeConfirmRecord && React.createElement(Modal, {
			title: '确认拆除',
			open: !!removeConfirmRecord,
			onCancel: function () { setRemoveConfirmRecord(null); },
			onOk: function () { handleRemoveConfirm(removeConfirmRecord); },
			okText: '确认拆除',
			cancelText: '取消',
			okButtonProps: { danger: true },
			children: removeConfirmRecord ? React.createElement('div', null, '确定要拆除该车辆「', removeConfirmRecord.deviceType, '」后装设备吗？') : null
		}),
		React.createElement(Modal, {
			title: '需求说明',
			open: showRequirementModal,
			onCancel: function () { setShowRequirementModal(false); },
			footer: React.createElement(Button, { onClick: function () { setShowRequirementModal(false); } }, '关闭'),
			width: 720,
			children: React.createElement('div', { style: styles.modalContent },
				React.createElement('div', { style: styles.requirementSection },
					React.createElement('div', { style: styles.requirementSectionTitle }, '1. 面包屑：'),
					React.createElement('div', { style: styles.requirementItem }, '1.1. 运维管理-车辆业务-后装设备')
				),
				React.createElement('div', { style: styles.requirementSection },
					React.createElement('div', { style: styles.requirementSectionTitle }, '2. 筛选：'),
					React.createElement('div', { style: styles.requirementItem }, '2.1. 支持通过设备类型、使用车辆、安装日期进行管理，点击查询后，筛选条件与列表内容联动。点击重置会回到默认筛选条件并在列表展示结果：'),
					React.createElement('div', { style: styles.requirementSubItem }, '2.1.1. 设备类型：选择器，包括GPS、尾板、车身广告、G7安全套件、G7普通设备、G7温控设备、备胎；'),
					React.createElement('div', { style: styles.requirementSubItem }, '2.1.2. 使用车辆：选择器，支持通过输入框对输入内容模糊搜索，并下拉对应选项；'),
					React.createElement('div', { style: styles.requirementSubItem }, '2.1.3. 安装时间：日期选择器，支持单输入框内双日历选择开始-结束时间；')
				),
				React.createElement('div', { style: styles.requirementSection },
					React.createElement('div', { style: styles.requirementSectionTitle }, '3. 列表：'),
					React.createElement('div', { style: styles.requirementItem }, '列表分为2个tab，已安装/拆除记录；'),
					React.createElement('div', { style: styles.requirementItem }, '当已安装列表对应车辆存在车身广告/尾板时，在备车时会自动拉取车身广告/尾板为有的状态；'),
					React.createElement('div', { style: styles.requirementItem }, '当已安装列表不存在车身广告/尾板时，在备车时车身广告/尾板为无的状态；'),
					React.createElement('div', { style: styles.requirementItem }, '如果在备车/交车时手动取消或勾选车身广告尾板，并完成提交，后装设备列表也会新增一条该车辆的车身广告/尾板安装数据；'),
					React.createElement('div', { style: styles.requirementSectionTitle }, '3.1. 已安装：'),
					React.createElement('div', { style: styles.requirementSubItem }, '3.1.1. 列表展示所有后装设备信息，字段依次为：设备类型、车牌号、供应商、安装时间、安装人、操作；列表右上角为新增、导出；'),
					React.createElement('div', { style: styles.requirementSubItem }, '3.1.1.1. 设备类型：显示后装设备类型，包括：GPS、尾板、车身广告、G7安全套件、G7普通设备、G7温控设备、备胎；'),
					React.createElement('div', { style: styles.requirementSubItem }, '3.1.1.2. 车牌号：显示后装设备对应车牌号信息；'),
					React.createElement('div', { style: styles.requirementSubItem }, '3.1.1.3. 供应商：显示后装设备供应商信息；'),
					React.createElement('div', { style: styles.requirementSubItem }, '3.1.1.4. 安装时间：显示后装设备安装时间，格式为YYYY-MM-DD HH:MM；'),
					React.createElement('div', { style: styles.requirementSubItem }, '3.1.1.5. 安装人：显示后装设备安装用户名称；'),
					React.createElement('div', { style: styles.requirementSubItem }, '3.1.1.6. 操作：支持查看、编辑、拆除；'),
					React.createElement('div', { style: styles.requirementSectionTitle }, '3.2. 拆除记录：'),
					React.createElement('div', { style: styles.requirementSubItem }, '3.2.1. 列表展示所有后装设备拆除记录，字段依次为：设备类型、车牌号、供应商、拆除时间、拆除人、操作；列表右上角为新增、导出；'),
					React.createElement('div', { style: styles.requirementSubItem }, '3.2.1.1. 设备类型：显示后装设备类型，包括：GPS、尾板、车身广告、G7安全套件、G7普通设备、G7温控设备、备胎；'),
					React.createElement('div', { style: styles.requirementSubItem }, '3.2.1.2. 车牌号：显示后装设备对应车牌号信息；'),
					React.createElement('div', { style: styles.requirementSubItem }, '3.2.1.3. 供应商：显示后装设备供应商信息；'),
					React.createElement('div', { style: styles.requirementSubItem }, '3.2.1.4. 拆除时间：显示后装设备拆除时间，格式为YYYY-MM-DD HH:MM；'),
					React.createElement('div', { style: styles.requirementSubItem }, '3.2.1.5. 拆除人：显示后装设备拆除用户名称；'),
					React.createElement('div', { style: styles.requirementSubItem }, '3.2.1.6. 操作：支持查看；')
				)
			)
		}),
		addModalVisible && React.createElement(Modal, {
			title: '新增后装设备',
			open: addModalVisible,
			onCancel: function () { setAddModalVisible(false); },
			onOk: function () {
				setDataList([{ id: String(Date.now()), deviceType: 'GPS', plateNo: '粤A12345', supplier: '新供应商', lastOpType: '安装', createTime: '2025-02-24 12:00', removeTime: '', createOperator: '当前用户', removeOperator: '' }].concat(dataList));
				setAddModalVisible(false);
				message.success('新增成功');
			},
			okText: '确定',
			cancelText: '取消',
			width: 520,
			children: React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 16 } },
				React.createElement('div', null, React.createElement('span', { style: styles.label }, '设备类型'), React.createElement(Select, { style: { width: '100%' }, placeholder: '请选择', options: DEVICE_TYPES.map(function (d) { return { label: d, value: d }; }) })),
				React.createElement('div', null, React.createElement('span', { style: styles.label }, '使用车辆'), React.createElement(Select, { style: { width: '100%' }, placeholder: '请选择或搜索', showSearch: true, options: MOCK_VEHICLE_OPTIONS.map(function (v) { return { label: v, value: v }; }) })),
				React.createElement('div', null, React.createElement('span', { style: styles.label }, '供应商'), React.createElement(Input, { style: { width: '100%' }, placeholder: '请输入供应商' }))
			)
		})
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
