// 【重要】必须使用 const Component 作为组件变量名
// 交车管理 - 交车单（运维管理-车辆业务-交车管理-交车单）

const Component = function () {
	var useState = React.useState;
	var useMemo = React.useMemo;
	var useCallback = React.useCallback;

	var antd = window.antd;
	var Breadcrumb = antd.Breadcrumb;
	var Input = antd.Input;
	var Button = antd.Button;
	var Select = antd.Select;
	var Table = antd.Table;
	var DatePicker = antd.DatePicker;
	var Modal = antd.Modal;
	var message = antd.message;

	var requirementModalOpen = useState(false);
	var setRequirementModalOpen = requirementModalOpen[1];
	var requirementDocContent = '交车管理-交车单\n一个「数字化资产ONEOS运管平台」中的「交车管理-交车单」模块\n\n1.面包屑：\n1.1.运维管理-车辆业务-交车管理-交车单\n\n每个模块为一个单独卡片：\n\n2.项目详情：表单结构：\n2.1.项目名称：输入框禁用，显示该交车单对应车辆租赁合同中项目名称；\n2.2.合同编码：输入框禁用，显示该交车单对应车辆租赁合同中项目合同编码；\n2.3.客户名称：输入框禁用，显示该交车单对应车辆租赁合同中客户名称；\n2.4.预计交车日期：日期选择器禁用，显示该交车单预计交车日期，分为单日和日期区间两种，格式为：YYYY-MM-DD、YYYY-MM-DD至YYYY-MM-DD；\n2.5.交车区域：输入框禁用，显示该交车单对应车辆租赁合同中交车区域；\n2.6.交车地点：输入框禁用，显示该交车单对应车辆租赁合同中交车地点；\n2.7.业务部门：输入框禁用，显示该交车单对应车辆租赁合同中业务部门；\n2.8.业务负责人：输入框禁用，显示该交车单对应车辆租赁合同中业务负责人；\n\n3.交车明细：列表结构；\n3.1.序号：与车辆租赁合同中序号对应，显示该交车任务所有车辆序号；\n3.2.品牌：选择器禁用，显示该交车单对应车辆租赁合同中品牌；\n3.3.型号：选择器禁用，显示该交车单对应车辆租赁合同中型号；\n3.4.车牌号：已交车车辆显示车牌号，未交车车辆显示-；\n3.5.实际交车日期：日期选择器禁用，显示该交车单实际交车日期，精确至日，格式为：YYYY-MM-DD；\n3.6.交车人：输入框禁用，显示该交车单中该车辆实际交车人员（注意这里是交车单中某辆车的交车人员，一个交车单可同时多个交车人员操作同时交多辆车，而不是最终提交整个交车单的人员）；\n3.7.交车状态：已完成、待提交、已签章；\n    3.7.1.已完成：已完成交车提交，但还未完成被授权人签章；\n    3.7.2.待提交：仅点击保存，未完成交车提交；\n    3.7.3.已签章：已完成交车提交并完成被授权人签章；\n3.8.操作：查看、编辑、下载签章文件；\n    3.8.1.查看：点击跳转该车辆交车明细；\n    3.8.2.编辑：交车状态为待提交时显示，点击弹出卡片至交车明细编辑页；\n    3.8.3.下载签章文件：交车完成并完成被授权人签章时显示，点击下载签章文件；\n\n4.底部为提交、取消按钮；\n  4.1.提交：提交按钮必须所有车辆交车状态为已签章时才可提交，否则为禁用状态；\n  4.2.取消：点击返回交车管理列表页；';

	// 项目详情（只读，来自交车任务/租赁合同）
	var projectDetail = useMemo(function () {
		return {
			projectName: '嘉兴氢能示范项目',
			contractCode: 'HT-ZL-2025-001',
			customerName: '嘉兴某某物流有限公司',
			expectedDate: '2025-02-28 至 2025-03-05',
			deliveryRegion: '浙江省-嘉兴市',
			deliveryAddress: '嘉兴市南湖区科技大道1号',
			businessDept: '业务1部',
			businessOwner: '张经理'
		};
	}, []);

	// 备车库车辆选项（车牌号下拉仅能选备车库中车辆）
	var reservePlateOptions = useMemo(function () {
		return [
			{ value: '京A12345', label: '京A12345' },
			{ value: '京C11111', label: '京C11111' },
			{ value: '京D22222', label: '京D22222' },
			{ value: '浙A10001', label: '浙A10001' },
			{ value: '浙F80088', label: '浙F80088' },
			{ value: '沪A30003', label: '沪A30003' }
		];
	}, []);

	// 交车明细列表（序号、品牌、型号、车牌号可编辑、实际交车日期、交车人、交车状态、操作）
	var detailListState = useState([
		{ key: 1, seq: 1, brand: '东风', model: 'DFH1180', plateNo: '京A12345', actualDate: '2025-02-28', deliveryPerson: '张三', status: '客户已签章' },
		{ key: 2, seq: 2, brand: '东风', model: 'DFH1250', plateNo: '京C11111', actualDate: '2025-02-28', deliveryPerson: '张三', status: '客户已签章' },
		{ key: 3, seq: 3, brand: '福田', model: 'BJ1180', plateNo: '浙A10001', actualDate: '2025-03-01', deliveryPerson: '李四', status: '待客户签章' },
		{ key: 4, seq: 4, brand: '福田', model: 'BJ1250', plateNo: '浙F80088', actualDate: '2025-03-01', deliveryPerson: '李四', status: '待客户签章' },
		{ key: 5, seq: 5, brand: '重汽', model: 'HOWO-T5G', plateNo: '沪A30003', actualDate: '2025-03-02', deliveryPerson: '王五', status: '已保存' },
		{ key: 6, seq: 6, brand: '陕汽', model: '德龙X3000', plateNo: '京D22222', actualDate: '2025-03-02', deliveryPerson: '王五', status: '已保存' },
		{ key: 7, seq: 7, brand: '解放', model: 'J6P', plateNo: '', actualDate: '', deliveryPerson: '', status: '未开始' },
		{ key: 8, seq: 8, brand: '欧曼', model: 'EST-A', plateNo: '', actualDate: '', deliveryPerson: '', status: '未开始' },
		{ key: 9, seq: 9, brand: '江淮', model: '格尔发K7', plateNo: '', actualDate: '', deliveryPerson: '', status: '未开始' },
		{ key: 10, seq: 10, brand: '红岩', model: '杰狮C6', plateNo: '', actualDate: '', deliveryPerson: '', status: '未开始' }
	]);
	var detailList = detailListState[0];
	var setDetailList = detailListState[1];

	function isDetailHistoryStatus(status) {
		return status === '客户已签章' || status === '已签章';
	}

	function canEditDetailRow(record) {
		var s = record.status;
		return s === '未开始' || s === '已保存';
	}

	function hasPlateSelected(record) {
		var p = record.plateNo;
		return p && String(p).trim() !== '' && p !== '-';
	}

	var allCustomerSigned = useMemo(function () {
		return detailList.length > 0 && detailList.every(function (row) { return isDetailHistoryStatus(row.status); });
	}, [detailList]);

	var updateDetailRow = useCallback(function (index, field, value) {
		setDetailList(function (prev) {
			var next = prev.slice();
			var row = next[index] || {};
			next[index] = Object.assign({}, row, { [field]: value });
			return next;
		});
	}, []);

	var handleSubmit = useCallback(function () {
		if (!allCustomerSigned) return;
		message.success('提交成功（原型）');
		if (typeof window !== 'undefined' && window.history) window.history.back();
	}, [allCustomerSigned]);

	var handleCancel = useCallback(function () {
		if (typeof window !== 'undefined' && window.history) window.history.back();
		else message.info('返回交车管理列表页');
	}, []);

	var handleViewDetail = useCallback(function (record) {
		message.info('跳转该车辆交车明细（原型）');
	}, []);

	var handleEditDetail = useCallback(function (record, index) {
		message.info('弹出卡片至交车明细编辑页（原型）');
	}, []);

	var handleDownloadSign = useCallback(function (record) {
		message.success('下载签章文件（原型）');
	}, []);

	var styles = {
		page: { padding: '16px 24px 48px', backgroundColor: '#f5f5f5', minHeight: '100vh', fontFamily: '"PingFang SC", "苹方-简", -apple-system, BlinkMacSystemFont, "Microsoft YaHei", sans-serif', fontSize: 14 },
		breadcrumb: { marginBottom: 16, color: '#666' },
		breadcrumbSep: { margin: '0 8px', color: '#999' },
		card: { backgroundColor: '#fff', borderRadius: 8, marginBottom: 16, boxShadow: '0 1px 2px rgba(0,0,0,0.05)', overflow: 'hidden' },
		cardHeader: { display: 'flex', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid #f0f0f0' },
		cardTitle: { fontSize: 16, fontWeight: 600, color: '#333' },
		cardBody: { padding: '20px 24px' },
		formRow: { display: 'flex', flexWrap: 'wrap', marginBottom: 16 },
		formCol: { flex: '0 0 33.33%', minWidth: 200, paddingRight: 16, marginBottom: 8 },
		formColFull: { flex: '0 0 100%', marginBottom: 8 },
		label: { display: 'block', marginBottom: 6, color: '#333' },
		inputDisabled: { width: '100%', backgroundColor: '#f5f5f5', color: 'rgba(0,0,0,0.65)', cursor: 'not-allowed', border: '1px solid #d9d9d9', borderRadius: 4, padding: '8px 12px', fontSize: 14 },
		footer: { position: 'fixed', bottom: 0, left: 0, right: 0, padding: '12px 24px', backgroundColor: '#fff', borderTop: '1px solid #e8e8e8', display: 'flex', gap: 12, justifyContent: 'flex-start', zIndex: 99 }
	};

	var CardBlock = function (props) {
		return React.createElement('div', { id: props.id, style: styles.card },
			React.createElement('div', { style: styles.cardHeader },
				React.createElement('span', { style: styles.cardTitle }, props.title)
			),
			React.createElement('div', { style: styles.cardBody }, props.children)
		);
	};

	var FormItem = function (props) {
		var colStyle = props.fullWidth ? styles.formColFull : styles.formCol;
		return React.createElement('div', { style: colStyle },
			React.createElement('label', { style: styles.label }, props.label),
			props.children
		);
	};

	var columns = [
		{ title: '序号', dataIndex: 'seq', key: 'seq', width: 70, render: function (v) { return v; } },
		{ title: '品牌', dataIndex: 'brand', key: 'brand', width: 100, render: function (v) { return React.createElement(Input, { value: v || '', disabled: true, style: { width: '100%', background: '#f5f5f5' } }); } },
		{ title: '型号', dataIndex: 'model', key: 'model', width: 110, render: function (v) { return React.createElement(Input, { value: v || '', disabled: true, style: { width: '100%', background: '#f5f5f5' } }); } },
		{
			title: '车牌号',
			dataIndex: 'plateNo',
			key: 'plateNo',
			width: 120,
			render: function (v, record) {
				if (hasPlateSelected(record)) {
					return React.createElement(Input, { value: v || '', disabled: true, style: { width: '100%', background: '#f5f5f5' } });
				}
				return React.createElement(Input, { value: '车牌待选', disabled: true, style: { width: '100%', background: '#f5f5f5', color: '#d48806' } });
			}
		},
		{
			title: '实际交车日期',
			dataIndex: 'actualDate',
			key: 'actualDate',
			width: 130,
			render: function (v) { return React.createElement(Input, { value: v || '', disabled: true, style: { width: '100%', background: '#f5f5f5' } }); }
		},
		{
			title: '交车人',
			dataIndex: 'deliveryPerson',
			key: 'deliveryPerson',
			width: 90,
			render: function (v) { return React.createElement(Input, { value: v || '', disabled: true, style: { width: '100%', background: '#f5f5f5' } }); }
		},
		{ title: '交车状态', dataIndex: 'status', key: 'status', width: 108, render: function (v) { return v || '-'; } },
		{
			title: '操作',
			key: 'action',
			width: 200,
			fixed: 'right',
			render: function (_, record, index) {
				return React.createElement(React.Fragment, null,
					React.createElement(Button, { type: 'link', size: 'small', onClick: function () { handleViewDetail(record); } }, '查看'),
					canEditDetailRow(record) ? React.createElement(Button, { type: 'link', size: 'small', onClick: function () { handleEditDetail(record, index); } }, '编辑') : null,
					isDetailHistoryStatus(record.status) ? React.createElement(Button, { type: 'link', size: 'small', onClick: function () { handleDownloadSign(record); } }, '下载签章文件') : null
				);
			}
		}
	];

	return React.createElement('div', { style: styles.page },
		React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 } },
			React.createElement('div', { style: styles.breadcrumb },
				React.createElement('span', null, '运维管理'),
				React.createElement('span', { style: styles.breadcrumbSep }, ' / '),
				React.createElement('span', null, '车辆业务'),
				React.createElement('span', { style: styles.breadcrumbSep }, ' / '),
				React.createElement('span', null, '交车管理'),
				React.createElement('span', { style: styles.breadcrumbSep }, ' / '),
				React.createElement('span', { style: { color: '#1890ff' } }, '交车单')
			),
			React.createElement(Button, { type: 'link', onClick: function () { setRequirementModalOpen(true); } }, '查看需求说明')
		),

		React.createElement('div', { id: 'card-project' }, React.createElement(CardBlock, { id: 'card-project', title: '项目详情' }, React.createElement('div', { style: styles.formRow },
			React.createElement(FormItem, { label: '项目名称' }, React.createElement(Input, { value: projectDetail.projectName, disabled: true, style: styles.inputDisabled })),
			React.createElement(FormItem, { label: '合同编码' }, React.createElement(Input, { value: projectDetail.contractCode, disabled: true, style: styles.inputDisabled })),
			React.createElement(FormItem, { label: '客户名称' }, React.createElement(Input, { value: projectDetail.customerName, disabled: true, style: styles.inputDisabled })),
			React.createElement(FormItem, { label: '预计交车日期' }, React.createElement(Input, { value: projectDetail.expectedDate, disabled: true, style: styles.inputDisabled })),
			React.createElement(FormItem, { label: '交车区域' }, React.createElement(Input, { value: projectDetail.deliveryRegion, disabled: true, style: styles.inputDisabled })),
			React.createElement(FormItem, { label: '交车地点' }, React.createElement(Input, { value: projectDetail.deliveryAddress, disabled: true, style: styles.inputDisabled })),
			React.createElement(FormItem, { label: '业务部门' }, React.createElement(Input, { value: projectDetail.businessDept, disabled: true, style: styles.inputDisabled })),
			React.createElement(FormItem, { label: '业务负责人' }, React.createElement(Input, { value: projectDetail.businessOwner, disabled: true, style: styles.inputDisabled }))
		))),

		React.createElement('div', { id: 'card-detail', style: { marginTop: 16 } }, React.createElement(CardBlock, { id: 'card-detail', title: '交车明细' }, React.createElement(Table, {
			columns: columns,
			dataSource: detailList,
			rowKey: 'key',
			pagination: false,
			size: 'small',
			scroll: { x: 920 }
		}))),

		React.createElement('div', { style: { height: 60 } }),
		React.createElement('div', { style: styles.footer },
			React.createElement(Button, { type: 'primary', disabled: !allCustomerSigned, onClick: handleSubmit }, '提交'),
			React.createElement(Button, { onClick: handleCancel }, '取消')
		),

		React.createElement(Modal, {
			title: '需求说明',
			open: requirementModalOpen[0],
			onCancel: function () { setRequirementModalOpen(false); },
			footer: React.createElement(Button, { onClick: function () { setRequirementModalOpen(false); } }, '关闭'),
			width: 640,
			destroyOnClose: true
		}, React.createElement('div', { style: { maxHeight: 560, overflowY: 'auto', whiteSpace: 'pre-wrap', lineHeight: 1.6, fontSize: 13 } }, requirementDocContent))
	);
};
