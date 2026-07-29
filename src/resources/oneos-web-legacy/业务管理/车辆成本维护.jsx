// 【重要】必须使用 const Component 作为组件变量名
// 业务管理 - 车辆成本维护（2026年3月12日版本）

const Component = function () {
	var useState = React.useState;

	var antd = window.antd;
	var Breadcrumb = antd.Breadcrumb;
	var Card = antd.Card;
	var Table = antd.Table;
	var Button = antd.Button;
	var Input = antd.Input;
	var Space = antd.Space;
	var Modal = antd.Modal;
	var message = antd.message;

	var requirementModalVisible = useState(false);
	var listDataState = useState([
		{ id: 1, brand: '东风', model: '18吨双飞翼', rentalCostPerDay: 260.00, selfOperatedCostPerDay: 250.00 },
		{ id: 2, brand: '福田', model: '18吨厢式', rentalCostPerDay: 255.00, selfOperatedCostPerDay: 245.00 },
		{ id: 3, brand: '重汽', model: '18吨栏板', rentalCostPerDay: 270.00, selfOperatedCostPerDay: 260.00 },
		{ id: 4, brand: '陕汽', model: '25吨牵引', rentalCostPerDay: 268.00, selfOperatedCostPerDay: 258.00 },
		{ id: 5, brand: '解放', model: '18吨冷藏', rentalCostPerDay: 262.00, selfOperatedCostPerDay: 252.00 },
		{ id: 6, brand: '江淮', model: '9吨厢式', rentalCostPerDay: 248.00, selfOperatedCostPerDay: 238.00 },
		{ id: 7, brand: '东风', model: '25吨栏板', rentalCostPerDay: 275.00, selfOperatedCostPerDay: 265.00 },
		{ id: 8, brand: '福田', model: '25吨飞翼', rentalCostPerDay: 272.00, selfOperatedCostPerDay: 262.00 },
		{ id: 9, brand: '重汽', model: '25吨冷藏', rentalCostPerDay: 278.00, selfOperatedCostPerDay: 268.00 },
		{ id: 10, brand: '陕汽', model: '18吨自卸', rentalCostPerDay: 265.00, selfOperatedCostPerDay: 255.00 }
	]);
	var listData = listDataState[0];
	var setListData = listDataState[1];
	var editingKeyState = useState(null);
	var editingKey = editingKeyState[0];
	var setEditingKey = editingKeyState[1];
	var editRentalState = useState('');
	var editRental = editRentalState[0];
	var setEditRental = editRentalState[1];
	var editSelfOperatedState = useState('');
	var editSelfOperated = editSelfOperatedState[0];
	var setEditSelfOperated = editSelfOperatedState[1];


	function fmtCost(v) {
		var n = typeof v === 'number' ? v : parseFloat(v);
		return (isNaN(n) ? '0.00' : n.toFixed(2)) + '元';
	}

	function saveRow(id) {
		var r = parseFloat(editRental);
		var s = parseFloat(editSelfOperated);
		if (isNaN(r) || r < 0 || isNaN(s) || s < 0) {
			message.warning('请输入有效的日成本（元），支持两位小数');
			return;
		}
		setListData(function (prev) {
			return prev.map(function (row) {
				if (row.id !== id) return row;
				var o = {}; for (var k in row) o[k] = row[k];
				o.rentalCostPerDay = Math.round(r * 100) / 100;
				o.selfOperatedCostPerDay = Math.round(s * 100) / 100;
				return o;
			});
		});
		setEditingKey(null);
		setEditRental('');
		setEditSelfOperated('');
		message.success('保存成功');
	}

	function cancelEdit() {
		setEditingKey(null);
		setEditRental('');
		setEditSelfOperated('');
	}

	var layoutStyle = { padding: '16px 24px', background: '#f5f5f5', minHeight: '100vh' };
	var cardStyle = { marginBottom: 16 };

	var columns = [
		{ title: '序号', key: 'idx', width: 72, align: 'center', render: function (_, __, index) { return index + 1; } },
		{ title: '品牌', dataIndex: 'brand', key: 'brand', width: 120, ellipsis: true, render: function (v) { return v || '—'; } },
		{ title: '型号', dataIndex: 'model', key: 'model', width: 160, ellipsis: true, render: function (v) { return v || '—'; } },
		{
			title: '租赁车辆日成本',
			dataIndex: 'rentalCostPerDay',
			key: 'rentalCostPerDay',
			width: 160,
			align: 'right',
			render: function (v, record) {
				var id = record.id;
				var isEditing = editingKey === id;
				if (isEditing) {
					return React.createElement(Input, {
						type: 'number',
						step: 0.01,
						min: 0,
						value: editRental,
						onChange: function (e) { setEditRental(e.target.value); },
						style: { width: 120, textAlign: 'right' },
						addonAfter: '元'
					});
				}
				return fmtCost(v);
			}
		},
		{
			title: '自营车辆日成本',
			dataIndex: 'selfOperatedCostPerDay',
			key: 'selfOperatedCostPerDay',
			width: 160,
			align: 'right',
			render: function (v, record) {
				var id = record.id;
				var isEditing = editingKey === id;
				if (isEditing) {
					return React.createElement(Input, {
						type: 'number',
						step: 0.01,
						min: 0,
						value: editSelfOperated,
						onChange: function (e) { setEditSelfOperated(e.target.value); },
						style: { width: 120, textAlign: 'right' },
						addonAfter: '元'
					});
				}
				return fmtCost(v);
			}
		},
		{
			title: '操作',
			key: 'action',
			width: 140,
			render: function (_, record) {
				var isEditing = editingKey === record.id;
				if (isEditing) {
					return React.createElement(Space, { size: 'small' },
						React.createElement(Button, { type: 'link', size: 'small', onClick: function () { saveRow(record.id); } }, '保存'),
						React.createElement(Button, { type: 'link', size: 'small', onClick: cancelEdit }, '取消')
					);
				}
				return React.createElement(Button, {
					type: 'link',
					size: 'small',
					onClick: function () {
						setEditingKey(record.id);
						setEditRental(record.rentalCostPerDay != null ? String(record.rentalCostPerDay) : '');
						setEditSelfOperated(record.selfOperatedCostPerDay != null ? String(record.selfOperatedCostPerDay) : '');
					}
				}, '编辑');
			}
		}
	];

	var requirementContent = '车辆成本维护（2026年3月12日版本）\n一个「数字化资产ONEOS运管平台」中的「车辆成本维护」模块\n#面包屑：业务管理-车辆成本维护；\n\n页面为1个卡片：车辆成本列表。列表默认显示当前系统中所有品牌和型号记录，如型号参数表有新增，则该处同步新增一条数据；\n1.品牌：显示车辆品牌；\n2.型号：显示车辆型号（如18吨双飞翼，而不是公告型号）；\n3.租赁车辆日成本：显示格式为：xx.xx元，支持两位小数；\n4.自营车辆日成本：显示格式为：xx.xx元，支持两位小数；\n5.操作：编辑；';

	return React.createElement('div', { style: layoutStyle },
		React.createElement('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 } },
			React.createElement(Breadcrumb, {
				items: [
					{ title: '业务管理' },
					{ title: '车辆成本维护' }
				]
			}),
			React.createElement(Button, { type: 'link', style: { padding: 0 }, onClick: function () { requirementModalVisible[1](true); } }, '查看需求说明')
		),
		React.createElement(Card, { title: '车辆成本列表', style: cardStyle },
			React.createElement(Table, {
				rowKey: 'id',
				columns: columns,
				dataSource: listData,
				pagination: { pageSize: 10, showSizeChanger: true, showTotal: function (t) { return '共 ' + t + ' 条'; } },
				size: 'middle',
				bordered: true
			})
		),
		React.createElement(Modal, {
			title: '需求说明',
			open: requirementModalVisible[0],
			onCancel: function () { requirementModalVisible[1](false); },
			width: 560,
			footer: React.createElement(Button, { onClick: function () { requirementModalVisible[1](false); } }, '关闭'),
			bodyStyle: { maxHeight: '70vh', overflow: 'auto' }
		}, React.createElement('div', { style: { padding: '8px 0', whiteSpace: 'pre-wrap', fontSize: 13, lineHeight: 1.6 } }, requirementContent))
	);
};
