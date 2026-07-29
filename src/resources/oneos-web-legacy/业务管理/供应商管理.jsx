// 【重要】必须使用 const Component 作为组件变量名
// 业务管理 - 供应商管理（2026年3月12日版本）

const Component = function () {
	var useState = React.useState;
	var useMemo = React.useMemo;

	var antd = window.antd;
	var Breadcrumb = antd.Breadcrumb;
	var Card = antd.Card;
	var Table = antd.Table;
	var Button = antd.Button;
	var Select = antd.Select;
	var Input = antd.Input;
	var Space = antd.Space;
	var Modal = antd.Modal;
	var Cascader = antd.Cascader;
	var message = antd.message;

	var requirementModalVisible = useState(false);
	var filterExpanded = useState(false);
	var filterSupplierCode = useState(undefined);
	var filterCoopStatus = useState([]);
	var filterType = useState([]);
	var filterRegion = useState([]);
	var filterCity = useState(undefined);
	var filterCreator = useState(undefined);
	var supplierNameKeyword = useState('');
	var deleteModalOpen = useState(false);
	var deleteTargetRecord = useState(null);

	var regionOptions = [
		{ value: '华北', label: '华北' },
		{ value: '华东', label: '华东' },
		{ value: '华南', label: '华南' },
		{ value: '华中', label: '华中' },
		{ value: '东北', label: '东北' },
		{ value: '西南', label: '西南' },
		{ value: '西北', label: '西北' }
	];
	var coopStatusOptions = [
		{ value: '已合作', label: '已合作' },
		{ value: '终止合作', label: '终止合作' },
		{ value: '洽谈中', label: '洽谈中' },
		{ value: '合约过期', label: '合约过期' }
	];
	var typeOptions = [
		{ value: '备件供应商', label: '备件供应商' },
		{ value: '保险公司', label: '保险公司' },
		{ value: '加氢站', label: '加氢站' },
		{ value: '充电站', label: '充电站' },
		{ value: '维修站', label: '维修站' },
		{ value: '救援车队', label: '救援车队' },
		{ value: '整车厂', label: '整车厂' },
		{ value: '其他', label: '其他' }
	];
	var cityCascaderOptions = [
		{ value: '浙江省', label: '浙江省', children: [{ value: '杭州市', label: '杭州市' }, { value: '嘉兴市', label: '嘉兴市' }, { value: '宁波市', label: '宁波市' }] },
		{ value: '上海市', label: '上海市', children: [{ value: '上海市', label: '上海市' }] },
		{ value: '江苏省', label: '江苏省', children: [{ value: '南京市', label: '南京市' }, { value: '苏州市', label: '苏州市' }] },
		{ value: '广东省', label: '广东省', children: [{ value: '广州市', label: '广州市' }, { value: '深圳市', label: '深圳市' }] },
		{ value: '北京市', label: '北京市', children: [{ value: '北京市', label: '北京市' }] }
	];

	var listDataState = useState([
		{ id: 1, supplierCode: 'GYS-2025-001', coopStatus: '已合作', supplierName: '嘉兴某某加氢站', type: '加氢站', region: '华东', city: '浙江省-嘉兴市', creditCodeOrId: '91330400MA2XXXXX1', contact: '张三', contactMobile: '13800138001', contactPhone: '0571-88888888', address: '浙江省嘉兴市南湖区科技大道1号', email: 'zhangsan@example.com', remark: '', creator: '李四', createTime: '2025-01-10 09:30' },
		{ id: 2, supplierCode: 'GYS-2025-002', coopStatus: '洽谈中', supplierName: '上海某某保险公司', type: '保险公司', region: '华东', city: '上海市-上海市', creditCodeOrId: '91310000MA2YYYYY2', contact: '王五', contactMobile: '13900139002', contactPhone: '-', address: '上海市浦东新区张江镇', email: 'wangwu@example.com', remark: '意向供应商', creator: '李专员', createTime: '2025-02-15 14:20' },
		{ id: 3, supplierCode: 'GYS-2025-003', coopStatus: '已合作', supplierName: '杭州某某维修站', type: '维修站', region: '华东', city: '浙江省-杭州市', creditCodeOrId: '91330100MA2ZZZZZ3', contact: '赵六', contactMobile: '13700137003', contactPhone: '0571-99999999', address: '浙江省杭州市余杭区未来科技城', email: 'zhaoliu@example.com', remark: '', creator: '张经理', createTime: '2025-01-20 11:00' },
		{ id: 4, supplierCode: 'GYS-2024-012', coopStatus: '终止合作', supplierName: '某某备件供应商', type: '备件供应商', region: '华南', city: '广东省-广州市', creditCodeOrId: '91440100MA2AAAAA4', contact: '孙七', contactMobile: '13600136004', contactPhone: '-', address: '广东省广州市天河区', email: 'sunqi@example.com', remark: '已终止', creator: '李四', createTime: '2024-06-01 10:00' },
		{ id: 5, supplierCode: 'GYS-2025-004', coopStatus: '合约过期', supplierName: '南京某某整车厂', type: '整车厂', region: '华东', city: '江苏省-南京市', creditCodeOrId: '91320100MA2BBBBB5', contact: '周八', contactMobile: '13500135005', contactPhone: '025-66666666', address: '江苏省南京市江宁区', email: 'zhouba@example.com', remark: '待续约', creator: '王专员', createTime: '2025-03-01 08:45' }
	]);
	var listData = listDataState[0];
	var setListData = listDataState[1];

	var supplierCodeOptions = useMemo(function () {
		var arr = [];
		listData.forEach(function (r) {
			if (r.supplierCode && arr.every(function (o) { return o.value !== r.supplierCode; })) arr.push({ value: r.supplierCode, label: r.supplierCode });
		});
		return arr;
	}, [listData]);
	var creatorOptions = useMemo(function () {
		var arr = [];
		listData.forEach(function (r) {
			if (r.creator && arr.every(function (o) { return o.value !== r.creator; })) arr.push({ value: r.creator, label: r.creator });
		});
		return arr;
	}, [listData]);

	var filteredList = useMemo(function () {
		var list = listData;
		var code = filterSupplierCode[0];
		var statuses = filterCoopStatus[0] || [];
		var types = filterType[0] || [];
		var regions = filterRegion[0] || [];
		var cityVal = filterCity[0];
		var creator = filterCreator[0];
		var nameKw = (supplierNameKeyword[0] || '').trim().toLowerCase();
		if (code) list = list.filter(function (r) { return r.supplierCode === code; });
		if (statuses.length) list = list.filter(function (r) { return statuses.indexOf(r.coopStatus) !== -1; });
		if (types.length) list = list.filter(function (r) { return types.indexOf(r.type) !== -1; });
		if (regions.length) list = list.filter(function (r) { return regions.indexOf(r.region) !== -1; });
		if (cityVal && Array.isArray(cityVal) && cityVal.length >= 2) list = list.filter(function (r) { return r.city === cityVal[0] + '-' + cityVal[1]; });
		if (creator) list = list.filter(function (r) { return r.creator === creator; });
		if (nameKw) list = list.filter(function (r) { return (r.supplierName || '').toLowerCase().indexOf(nameKw) !== -1; });
		return list;
	}, [listData, filterSupplierCode[0], filterCoopStatus[0], filterType[0], filterRegion[0], filterCity[0], filterCreator[0], supplierNameKeyword[0]]);

	function handleReset() {
		filterSupplierCode[1](undefined);
		filterCoopStatus[1]([]);
		filterType[1]([]);
		filterRegion[1]([]);
		filterCity[1](undefined);
		filterCreator[1](undefined);
	}

	function goView(record) {
		if (window.__supplierView) window.__supplierView(record);
		else message.info('跳转供应商管理-查看（原型）');
	}
	function goEdit(record) {
		if (window.__supplierEdit) window.__supplierEdit(record);
		else message.info('跳转供应商管理-编辑（原型）');
	}
	function openDeleteConfirm(record) {
		deleteTargetRecord[1](record);
		deleteModalOpen[1](true);
	}
	function confirmDelete() {
		var record = deleteTargetRecord[0];
		if (record) {
			setListData(function (prev) { return prev.filter(function (r) { return r.id !== record.id; }); });
			message.success('已删除');
		}
		deleteModalOpen[1](false);
		deleteTargetRecord[1](null);
	}

	var layoutStyle = { padding: '16px 24px', background: '#f5f5f5', minHeight: '100vh' };
	var cardStyle = { marginBottom: 16 };
	var filterLabelStyle = { marginBottom: 6, fontSize: 14, color: 'rgba(0,0,0,0.65)' };
	var filterItemStyle = { marginBottom: 12 };
	var filterControlStyle = { width: '100%' };

	var columns = [
		{ title: '供应商编码', dataIndex: 'supplierCode', key: 'supplierCode', width: 120, ellipsis: true, fixed: 'left', render: function (v) { return v || '—'; } },
		{ title: '合作状态', dataIndex: 'coopStatus', key: 'coopStatus', width: 100, render: function (v) { return v || '—'; } },
		{ title: '供应商名称', dataIndex: 'supplierName', key: 'supplierName', width: 180, ellipsis: true, render: function (v) { return v || '—'; } },
		{ title: '类型', dataIndex: 'type', key: 'type', width: 110, render: function (v) { return v || '—'; } },
		{ title: '区域', dataIndex: 'region', key: 'region', width: 80, render: function (v) { return v || '—'; } },
		{ title: '城市', dataIndex: 'city', key: 'city', width: 140, ellipsis: true, render: function (v) { return v || '—'; } },
		{ title: '信用代码/身份证', dataIndex: 'creditCodeOrId', key: 'creditCodeOrId', width: 180, ellipsis: true, render: function (v) { return v || '—'; } },
		{ title: '联系人', dataIndex: 'contact', key: 'contact', width: 100, render: function (v) { return v || '—'; } },
		{ title: '联系人手机', dataIndex: 'contactMobile', key: 'contactMobile', width: 120, render: function (v) { return v || '—'; } },
		{ title: '联系人座机', dataIndex: 'contactPhone', key: 'contactPhone', width: 120, render: function (v) { return v === '-' || !v ? '—' : v; } },
		{ title: '供应商地址', dataIndex: 'address', key: 'address', width: 200, ellipsis: true, render: function (v) { return v || '—'; } },
		{ title: '电子邮箱', dataIndex: 'email', key: 'email', width: 180, ellipsis: true, render: function (v) { return v || '—'; } },
		{ title: '备注', dataIndex: 'remark', key: 'remark', width: 120, ellipsis: true, render: function (v) { return v || '—'; } },
		{ title: '创建人', dataIndex: 'creator', key: 'creator', width: 100, render: function (v) { return v || '—'; } },
		{ title: '创建时间', dataIndex: 'createTime', key: 'createTime', width: 160, render: function (v) { return v || '—'; } },
		{
			title: '操作',
			key: 'action',
			width: 180,
			fixed: 'right',
			render: function (_, record) {
				return React.createElement(Space, { size: 'small' },
					React.createElement(Button, { type: 'link', size: 'small', onClick: function () { goView(record); } }, '查看'),
					React.createElement(Button, { type: 'link', size: 'small', onClick: function () { goEdit(record); } }, '编辑'),
					React.createElement(Button, { type: 'link', size: 'small', danger: true, onClick: function () { openDeleteConfirm(record); } }, '删除')
				);
			}
		}
	];

	var filterItems = [
		React.createElement('div', { key: 'code', style: filterItemStyle },
			React.createElement('div', { style: filterLabelStyle }, '供应商编码'),
			React.createElement(Select, {
				placeholder: '请选择或输入供应商编码',
				allowClear: true,
				showSearch: true,
				style: filterControlStyle,
				value: filterSupplierCode[0],
				onChange: function (v) { filterSupplierCode[1](v); },
				options: supplierCodeOptions,
				filterOption: function (input, opt) { return (opt.label || '').toString().toLowerCase().indexOf((input || '').toLowerCase()) !== -1; }
			})
		),
		React.createElement('div', { key: 'status', style: filterItemStyle },
			React.createElement('div', { style: filterLabelStyle }, '合作状态'),
			React.createElement(Select, {
				placeholder: '请选择合作状态',
				allowClear: true,
				mode: 'multiple',
				style: filterControlStyle,
				value: filterCoopStatus[0],
				onChange: function (v) { filterCoopStatus[1](v || []); },
				options: coopStatusOptions
			})
		),
		React.createElement('div', { key: 'type', style: filterItemStyle },
			React.createElement('div', { style: filterLabelStyle }, '类型'),
			React.createElement(Select, {
				placeholder: '请选择类型',
				allowClear: true,
				mode: 'multiple',
				style: filterControlStyle,
				value: filterType[0],
				onChange: function (v) { filterType[1](v || []); },
				options: typeOptions
			})
		),
		React.createElement('div', { key: 'region', style: filterItemStyle },
			React.createElement('div', { style: filterLabelStyle }, '区域'),
			React.createElement(Select, {
				placeholder: '请选择区域',
				allowClear: true,
				mode: 'multiple',
				style: filterControlStyle,
				value: filterRegion[0],
				onChange: function (v) { filterRegion[1](v || []); },
				options: regionOptions
			})
		),
		React.createElement('div', { key: 'city', style: filterItemStyle },
			React.createElement('div', { style: filterLabelStyle }, '城市'),
			React.createElement(Cascader, {
				options: cityCascaderOptions,
				value: filterCity[0],
				onChange: function (v) { filterCity[1](v); },
				placeholder: '请选择省-市',
				allowClear: true,
				style: filterControlStyle
			})
		),
		React.createElement('div', { key: 'creator', style: filterItemStyle },
			React.createElement('div', { style: filterLabelStyle }, '创建人'),
			React.createElement(Select, {
				placeholder: '请选择创建人',
				allowClear: true,
				style: filterControlStyle,
				value: filterCreator[0],
				onChange: function (v) { filterCreator[1](v); },
				options: creatorOptions
			})
		)
	];
	var filterCount = filterExpanded[0] ? 6 : 3;
	var filterNodes = filterItems.slice(0, filterCount);

	var requirementContent = '供应商管理（2026年3月12日版本）\n一个「数字化资产ONEOS运管平台」中的「供应商管理」模块\n#面包屑：业务管理-供应商管理；\n\n页面分为2个卡片；\n1.筛选：默认显示首行，可通过展开、收起功能进行展开/收起的切换，右侧为重置、查询按钮；\n#支持供应商编码、合作状态、类型、区域、城市、创建人等筛选方式；\n1.1.供应商编码：选择器，支持输入框内输入内容模糊搜索，下拉显示对应选项；\n1.2.合作状态：选择器，支持多选，选项为已合作、终止合作、洽谈中、合约过期；\n1.3.类型：选择器，支持多选，选项为：备件供应商、保险公司、加氢站、充电站、维修站、救援车队、整车厂、其他；\n1.4.区域：选择器，支持多选，选项为：华北、华东、华南、华中、东北、西南、西北；\n1.4.城市：地区级联选择器，支持2级选择，格式为省-市；\n1.5.创建人：选择器，选项为所有创建用户姓名；\n\n2.供应商列表：\n#左上方为供应商名称输入框（输入供应商名称直接联动），右上角为新增、导出、导入；\n2.1.供应商编码：显示供应商编码；\n2.2.合作状态：显示合作状态，选项为已合作、终止合作、洽谈中、合约过期；\n2.3.供应商名称：显示供应商名称；\n2.4.类型：备件供应商、保险公司、加氢站、充电站、维修站、救援车队、整车厂、其他；\n2.4.区域：显示供应商区域，由选择城市后自动匹配；\n2.5.城市：显示供应商城市，格式为：省-市；\n2.6.信用代码/身份证：显示供应商信用代码或身份证，取决于新增时输入的是什么；\n2.7.联系人：显示供应商联系人；\n2.8.联系人手机：显示供应商联系人手机；\n2.9.联系人座机：显示供应商联系人座机，无则显示为-；\n2.10.供应商地址：显示供应商地址信息；\n2.11.电子邮箱：显示供应商电子邮箱；\n2.12.备注：显示供应商备注信息；\n2.13.创建人：显示供应商创建人用户姓名；\n2.14.创建时间：显示供应商创建时间；\n2.15.操作：查看、编辑、删除；\n     2.16.1.查看：跳转供应商管理-查看页；\n     2.16.2.编辑：跳转供应商管理-编辑页；\n     2.16.3.删除：二次确认，点击确认后删除，已删除供应商无法在各类合同或账单选择时选择，但历史数据中该供应商信息依然显示；';

	return React.createElement('div', { style: layoutStyle },
		React.createElement('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 } },
			React.createElement(Breadcrumb, {
				items: [
					{ title: '业务管理' },
					{ title: '供应商管理' }
				]
			}),
			React.createElement(Button, { type: 'link', style: { padding: 0 }, onClick: function () { requirementModalVisible[1](true); } }, '查看需求说明')
		),
		React.createElement(Card, { title: '筛选', style: cardStyle },
			React.createElement('div', {
				style: {
					display: 'grid',
					gridTemplateColumns: '1fr 1fr 1fr',
					gap: '16px 24px',
					alignItems: 'start',
					flex: 1,
					minWidth: 0
				}
			}, filterNodes),
			React.createElement('div', { style: { display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 } },
				React.createElement(Button, { onClick: handleReset }, '重置'),
				React.createElement(Button, { type: 'primary' }, '查询'),
				React.createElement(Button, { type: 'link', size: 'small', onClick: function () { filterExpanded[1](!filterExpanded[0]); } }, filterExpanded[0] ? '收起' : '展开')
			)
		),
		React.createElement(Card, { title: '供应商列表', style: cardStyle },
			React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 } },
				React.createElement(Input.Search, {
					placeholder: '请输入供应商名称',
					allowClear: true,
					value: supplierNameKeyword[0],
					onChange: function (e) { supplierNameKeyword[1](e.target.value); },
					style: { width: 280 }
				}),
				React.createElement(Space, null,
					React.createElement(Button, { type: 'primary' }, '新增'),
					React.createElement(Button, null, '导出'),
					React.createElement(Button, null, '导入')
				)
			),
			React.createElement(Table, {
				rowKey: 'id',
				columns: columns,
				dataSource: filteredList,
				pagination: { pageSize: 10, showSizeChanger: true, showTotal: function (t) { return '共 ' + t + ' 条'; } },
				size: 'middle',
				bordered: true,
				scroll: { x: 2400 }
			})
		),
		React.createElement(Modal, {
			title: '确认删除',
			open: deleteModalOpen[0],
			onCancel: function () { deleteModalOpen[1](false); deleteTargetRecord[1](null); },
			onOk: confirmDelete,
			okText: '确认',
			cancelText: '取消'
		}, '确定要删除该供应商吗？删除后该供应商将无法在各类合同或账单中选择，历史数据中仍会保留该供应商信息。'),
		React.createElement(Modal, {
			title: '需求说明',
			open: requirementModalVisible[0],
			onCancel: function () { requirementModalVisible[1](false); },
			width: 640,
			footer: React.createElement(Button, { onClick: function () { requirementModalVisible[1](false); } }, '关闭'),
			bodyStyle: { maxHeight: '70vh', overflow: 'auto' }
		}, React.createElement('div', { style: { padding: '8px 0', whiteSpace: 'pre-wrap', fontSize: 13, lineHeight: 1.6 } }, requirementContent))
	);
};
