// 【重要】必须使用 const Component 作为组件变量名
// 业务管理 - 客户管理（2026年3月12日版本）

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
	var filterCustomerCode = useState(undefined);
	var filterCoopStatus = useState([]);
	var filterRegion = useState([]);
	var filterCity = useState(undefined);
	var filterBusinessManager = useState(undefined);
	var filterCreator = useState(undefined);
	var customerNameKeyword = useState('');
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
	var cityCascaderOptions = [
		{ value: '浙江省', label: '浙江省', children: [{ value: '杭州市', label: '杭州市' }, { value: '嘉兴市', label: '嘉兴市' }, { value: '宁波市', label: '宁波市' }] },
		{ value: '上海市', label: '上海市', children: [{ value: '上海市', label: '上海市' }] },
		{ value: '江苏省', label: '江苏省', children: [{ value: '南京市', label: '南京市' }, { value: '苏州市', label: '苏州市' }] },
		{ value: '广东省', label: '广东省', children: [{ value: '广州市', label: '广州市' }, { value: '深圳市', label: '深圳市' }] },
		{ value: '北京市', label: '北京市', children: [{ value: '北京市', label: '北京市' }] }
	];

	var listDataState = useState([
		{ id: 1, customerCode: 'KH-2025-001', coopStatus: '已合作', customerName: '嘉兴某某物流有限公司', region: '华东', city: '浙江省-嘉兴市', creditCodeOrId: '91330400MA2XXXXX1', contact: '张三', contactMobile: '13800138001', contactPhone: '0571-88888888', businessManagers: '张经理', address: '浙江省嘉兴市南湖区科技大道1号', email: 'zhangsan@example.com', remark: '', creator: '李四', createTime: '2025-01-10 09:30' },
		{ id: 2, customerCode: 'KH-2025-002', coopStatus: '洽谈中', customerName: '上海某某运输公司', region: '华东', city: '上海市-上海市', creditCodeOrId: '91310000MA2YYYYY2', contact: '王五', contactMobile: '13900139002', contactPhone: '-', businessManagers: '李专员', address: '上海市浦东新区张江镇', email: 'wangwu@example.com', remark: '意向客户', creator: '李专员', createTime: '2025-02-15 14:20' },
		{ id: 3, customerCode: 'KH-2025-003', coopStatus: '已合作', customerName: '杭州某某租赁有限公司', region: '华东', city: '浙江省-杭州市', creditCodeOrId: '91330100MA2ZZZZZ3', contact: '赵六', contactMobile: '13700137003', contactPhone: '0571-99999999', businessManagers: '张经理、王专员', address: '浙江省杭州市余杭区未来科技城', email: 'zhaoliu@example.com', remark: '', creator: '张经理', createTime: '2025-01-20 11:00' },
		{ id: 4, customerCode: 'KH-2024-012', coopStatus: '终止合作', customerName: '某某旧客户公司', region: '华南', city: '广东省-广州市', creditCodeOrId: '91440100MA2AAAAA4', contact: '孙七', contactMobile: '13600136004', contactPhone: '-', businessManagers: '李专员', address: '广东省广州市天河区', email: 'sunqi@example.com', remark: '已终止', creator: '李四', createTime: '2024-06-01 10:00' },
		{ id: 5, customerCode: 'KH-2025-004', coopStatus: '合约过期', customerName: '南京某某供应链公司', region: '华东', city: '江苏省-南京市', creditCodeOrId: '91320100MA2BBBBB5', contact: '周八', contactMobile: '13500135005', contactPhone: '025-66666666', businessManagers: '王专员', address: '江苏省南京市江宁区', email: 'zhouba@example.com', remark: '待续约', creator: '王专员', createTime: '2025-03-01 08:45' }
	]);
	var listData = listDataState[0];
	var setListData = listDataState[1];

	var customerCodeOptions = useMemo(function () {
		var arr = [];
		listData.forEach(function (r) {
			if (r.customerCode && arr.every(function (o) { return o.value !== r.customerCode; })) arr.push({ value: r.customerCode, label: r.customerCode });
		});
		return arr;
	}, [listData]);
	var businessManagerOptions = useMemo(function () {
		var set = new Set();
		listData.forEach(function (r) {
			var managers = (r.businessManagers || '').split(/[、,，]/).map(function (s) { return s.trim(); }).filter(Boolean);
			managers.forEach(function (m) { set.add(m); });
		});
		return Array.from(set).map(function (v) { return { value: v, label: v }; });
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
		var code = filterCustomerCode[0];
		var statuses = filterCoopStatus[0] || [];
		var regions = filterRegion[0] || [];
		var cityVal = filterCity[0];
		var manager = filterBusinessManager[0];
		var creator = filterCreator[0];
		var nameKw = (customerNameKeyword[0] || '').trim().toLowerCase();
		if (code) list = list.filter(function (r) { return r.customerCode === code; });
		if (statuses.length) list = list.filter(function (r) { return statuses.indexOf(r.coopStatus) !== -1; });
		if (regions.length) list = list.filter(function (r) { return regions.indexOf(r.region) !== -1; });
		if (cityVal && Array.isArray(cityVal) && cityVal.length >= 2) list = list.filter(function (r) { return r.city === cityVal[0] + '-' + cityVal[1]; });
		if (manager) list = list.filter(function (r) { return (r.businessManagers || '').indexOf(manager) !== -1; });
		if (creator) list = list.filter(function (r) { return r.creator === creator; });
		if (nameKw) list = list.filter(function (r) { return (r.customerName || '').toLowerCase().indexOf(nameKw) !== -1; });
		return list;
	}, [listData, filterCustomerCode[0], filterCoopStatus[0], filterRegion[0], filterCity[0], filterBusinessManager[0], filterCreator[0], customerNameKeyword[0]]);

	function handleReset() {
		filterCustomerCode[1](undefined);
		filterCoopStatus[1]([]);
		filterRegion[1]([]);
		filterCity[1](undefined);
		filterBusinessManager[1](undefined);
		filterCreator[1](undefined);
	}

	function goView(record) {
		if (window.__customerView) window.__customerView(record);
		else message.info('跳转客户管理-查看（原型）');
	}
	function goEdit(record) {
		if (window.__customerEdit) window.__customerEdit(record);
		else message.info('跳转客户管理-编辑（原型）');
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
		{ title: '客户编码', dataIndex: 'customerCode', key: 'customerCode', width: 120, ellipsis: true, fixed: 'left', render: function (v) { return v || '—'; } },
		{ title: '合作状态', dataIndex: 'coopStatus', key: 'coopStatus', width: 100, render: function (v) { return v || '—'; } },
		{ title: '客户名称', dataIndex: 'customerName', key: 'customerName', width: 180, ellipsis: true, render: function (v) { return v || '—'; } },
		{ title: '区域', dataIndex: 'region', key: 'region', width: 80, render: function (v) { return v || '—'; } },
		{ title: '城市', dataIndex: 'city', key: 'city', width: 140, ellipsis: true, render: function (v) { return v || '—'; } },
		{ title: '信用代码/身份证', dataIndex: 'creditCodeOrId', key: 'creditCodeOrId', width: 180, ellipsis: true, render: function (v) { return v || '—'; } },
		{ title: '联系人', dataIndex: 'contact', key: 'contact', width: 100, render: function (v) { return v || '—'; } },
		{ title: '联系人手机', dataIndex: 'contactMobile', key: 'contactMobile', width: 120, render: function (v) { return v || '—'; } },
		{ title: '联系人座机', dataIndex: 'contactPhone', key: 'contactPhone', width: 120, render: function (v) { return v === '-' || !v ? '—' : v; } },
		{ title: '业务经理', dataIndex: 'businessManagers', key: 'businessManagers', width: 140, ellipsis: true, render: function (v) { return v || '—'; } },
		{ title: '客户地址', dataIndex: 'address', key: 'address', width: 200, ellipsis: true, render: function (v) { return v || '—'; } },
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
			React.createElement('div', { style: filterLabelStyle }, '客户编码'),
			React.createElement(Select, {
				placeholder: '请选择或输入客户编码',
				allowClear: true,
				showSearch: true,
				style: filterControlStyle,
				value: filterCustomerCode[0],
				onChange: function (v) { filterCustomerCode[1](v); },
				options: customerCodeOptions,
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
		React.createElement('div', { key: 'manager', style: filterItemStyle },
			React.createElement('div', { style: filterLabelStyle }, '业务经理'),
			React.createElement(Select, {
				placeholder: '请选择业务经理',
				allowClear: true,
				style: filterControlStyle,
				value: filterBusinessManager[0],
				onChange: function (v) { filterBusinessManager[1](v); },
				options: businessManagerOptions
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

	var requirementContent = '客户管理（2026年3月12日版本）\n一个「数字化资产ONEOS运管平台」中的「客户管理」模块\n#面包屑：业务管理-客户管理；\n\n页面分为2个卡片；\n1.筛选：默认显示首行，可通过展开、收起功能进行展开/收起的切换，右侧为重置、查询按钮；\n#支持客户编码、合作状态、区域、城市、业务经理、创建人等筛选方式；\n1.1.客户编码：选择器，支持输入框内输入内容模糊搜索，下拉显示对应选项；\n1.2.合作状态：选择器，支持多选，选项为已合作、终止合作、洽谈中、合约过期；\n1.3.区域：选择器，支持多选，选项为：华北、华东、华南、华中、东北、西南、西北；\n1.4.城市：地区级联选择器，支持2级选择，格式为省-市；\n1.5.业务经理：选择器，选项为客户表中所有业务经理；\n1.6.创建人：选择器，选项为所有创建用户姓名；\n\n2.客户列表：\n#左上方为客户名称输入框（输入客户名称直接联动），右上角为新增、导出、导入；\n2.1.客户编码：显示客户编码；\n2.2.合作状态：显示合作状态，选项为已合作、终止合作、洽谈中、合约过期；\n2.3.客户名称：显示客户名称；\n2.4.区域：显示客户区域，客户区域由选择城市后自动匹配；\n2.5.城市：显示客户城市，格式为：省-市；\n2.6.信用代码/身份证：显示客户信用代码或身份证，取决于新增时输入的是什么；\n2.7.联系人：显示客户联系人；\n2.8.联系人手机：显示客户联系人手机；\n2.9.联系人座机：显示客户联系人座机，无则显示为-；\n2.10.业务经理：显示客户对应业务经理姓名，可能会存在多个业务经理维护一个客户；\n2.11.客户地址：显示客户地址信息；\n2.12.电子邮箱：显示客户电子邮箱；\n2.13.备注：显示客户备注信息；\n2.14.创建人：显示客户创建人用户姓名；\n2.15.创建时间：显示客户创建时间；\n2.16.操作：查看、编辑、删除；\n     2.16.1.查看：跳转客户管理-查看页；\n     2.16.2.编辑：跳转客户管理-编辑页；\n     2.16.3.删除：二次确认，点击确认后删除，已删除客户无法再被新合同选择客户时选择，但历史数据中该客户信息依然显示；';

	return React.createElement('div', { style: layoutStyle },
		React.createElement('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 } },
			React.createElement(Breadcrumb, {
				items: [
					{ title: '业务管理' },
					{ title: '客户管理' }
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
		React.createElement(Card, { title: '客户列表', style: cardStyle },
			React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 } },
				React.createElement(Input.Search, {
					placeholder: '请输入客户名称',
					allowClear: true,
					value: customerNameKeyword[0],
					onChange: function (e) { customerNameKeyword[1](e.target.value); }
					, style: { width: 280 }
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
				scroll: { x: 2200 }
			})
		),
		React.createElement(Modal, {
			title: '确认删除',
			open: deleteModalOpen[0],
			onCancel: function () { deleteModalOpen[1](false); deleteTargetRecord[1](null); },
			onOk: confirmDelete,
			okText: '确认',
			cancelText: '取消'
		}, '确定要删除该客户吗？删除后该客户将无法在新合同中选择，历史数据中仍会保留该客户信息。'),
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
