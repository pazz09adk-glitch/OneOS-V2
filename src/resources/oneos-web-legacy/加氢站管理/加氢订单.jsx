// 【重要】必须使用 const Component 作为组件变量名
// 加氢站管理 - 加氢订单（列表 + 筛选）（2026年3月版）

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
	var DatePicker = antd.DatePicker;
	var Space = antd.Space;
	var Modal = antd.Modal;
	var message = antd.message;

	var RangePicker = DatePicker.RangePicker || DatePicker.RangePicker;

	// 筛选状态
	var stationState = useState(undefined);
	var timeRangeState = useState([]);
	var plateNoState = useState('');
	var station = stationState[0];
	var setStation = stationState[1];
	var timeRange = timeRangeState[0];
	var setTimeRange = timeRangeState[1];
	var plateNo = plateNoState[0];
	var setPlateNo = plateNoState[1];

	var requirementModalVisible = useState(false);

	// 模拟：加氢站与加氢记录数据
	var stationList = useMemo(function () {
		return [
			{ value: 'JX-H2-001', label: '嘉兴加氢站（一期）' },
			{ value: 'HZ-H2-002', label: '杭州临平加氢站' },
			{ value: 'SH-H2-003', label: '上海宝山加氢站' }
		];
	}, []);

	var rawData = useMemo(function () {
		return [
			{ id: 1, stationCode: 'JX-H2-001', stationName: '嘉兴加氢站（一期）', time: '2026-03-01 10:21', plateNo: '浙A12345', amountKg: 12.5, amountYuan: 625.00 },
			{ id: 2, stationCode: 'JX-H2-001', stationName: '嘉兴加氢站（一期）', time: '2026-03-01 14:08', plateNo: '浙A67890', amountKg: 10.0, amountYuan: 500.00 },
			{ id: 3, stationCode: 'HZ-H2-002', stationName: '杭州临平加氢站', time: '2026-03-02 09:30', plateNo: '浙B23456', amountKg: 15.3, amountYuan: 765.00 },
			{ id: 4, stationCode: 'SH-H2-003', stationName: '上海宝山加氢站', time: '2026-03-03 16:45', plateNo: '沪A88888', amountKg: 8.0, amountYuan: 400.00 },
			{ id: 5, stationCode: 'HZ-H2-002', stationName: '杭州临平加氢站', time: '2026-03-03 18:10', plateNo: '浙B99999', amountKg: 18.2, amountYuan: 910.00 }
		];
	}, []);

	// 简单字符串时间过滤（示例用，实际可改为 dayjs 比较）
	function inRange(timeStr, range) {
		if (!range || !range.length || !range[0] || !range[1]) return true;
		// timeStr: 'YYYY-MM-DD HH:mm'，只做字符串比较以示意
		var t = timeStr.replace(/[-:\\s]/g, '');
		var s = range[0].format ? range[0].format('YYYYMMDDHHmm') : '';
		var e = range[1].format ? range[1].format('YYYYMMDDHHmm') : '';
		if (!s || !e) return true;
		return t >= s && t <= e;
	}

	var filteredData = useMemo(function () {
		var list = rawData.slice();
		if (station) {
			list = list.filter(function (r) { return r.stationCode === station; });
		}
		if (plateNo && plateNo.trim()) {
			var kw = plateNo.trim().toLowerCase();
			list = list.filter(function (r) { return (r.plateNo || '').toLowerCase().indexOf(kw) !== -1; });
		}
		if (timeRange && timeRange.length === 2) {
			list = list.filter(function (r) { return inRange(r.time, timeRange); });
		}
		return list.map(function (r, idx) {
			return Object.assign({}, r, { seq: idx + 1 });
		});
	}, [rawData, station, plateNo, timeRange]);

	var columns = [
		{ title: '序号', dataIndex: 'seq', key: 'seq', width: 70, align: 'center' },
		{ title: '加氢站', dataIndex: 'stationName', key: 'stationName', width: 200 },
		{ title: '加氢时间', dataIndex: 'time', key: 'time', width: 180 },
		{ title: '车牌号', dataIndex: 'plateNo', key: 'plateNo', width: 120 },
		{ title: '加氢量（kg）', dataIndex: 'amountKg', key: 'amountKg', width: 120, align: 'right', render: function (v) { return (v != null ? v.toFixed(2) : '0.00'); } },
		{ title: '金额（元）', dataIndex: 'amountYuan', key: 'amountYuan', width: 120, align: 'right', render: function (v) { var n = typeof v === 'number' ? v : parseFloat(v); return (isNaN(n) ? '0.00' : n.toFixed(2)); } }
	];

	var layoutStyle = { padding: '16px 24px', background: '#f5f5f5', minHeight: '100vh' };
	var cardStyle = { marginBottom: 16 };
	var filterLabelStyle = { marginBottom: 6, fontSize: 14, color: 'rgba(0,0,0,0.65)' };
	var filterItemStyle = { marginBottom: 12 };

	function handleReset() {
		setStation(undefined);
		setTimeRange([]);
		setPlateNo('');
	}

	function handleExport() {
		message.info('导出当前筛选条件下的加氢订单（示例）');
	}

	var requirementContent = '加氢订单：一个「数字化资产ONEOS运管平台」中的「加氢站管理-加氢订单」模块。\n\n#1.面包屑：加氢站管理-加氢订单\n\n#2.筛选：支持加氢站、加氢时间、车牌号等筛选；\n2.1.加氢站：选择器，选择加氢站；\n2.2.加氢时间：日期时间范围选择器，支持开始时间-结束时间；\n2.3.车牌号：输入框，支持模糊匹配；\n右侧为查询、重置按钮。\n\n#3.列表：加氢订单列表，展示序号、加氢站、加氢时间、车牌号、加氢量（kg）、金额（元）；支持分页与导出。';

	return React.createElement('div', { style: layoutStyle },
		React.createElement('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 } },
			React.createElement(Breadcrumb, {
				items: [
					{ title: '加氢站管理' },
					{ title: '加氢订单' }
				]
			}),
			React.createElement(Button, { type: 'link', style: { padding: 0 }, onClick: function () { requirementModalVisible[1](true); } }, '查看需求说明')
		),
		React.createElement(Card, { title: '筛选', style: cardStyle },
			React.createElement('div', {
				style: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px 24px', alignItems: 'flex-end' }
			},
				React.createElement('div', { style: filterItemStyle },
					React.createElement('div', { style: filterLabelStyle }, '加氢站'),
					React.createElement(Select, {
						placeholder: '请选择加氢站',
						allowClear: true,
						style: { width: '100%' },
						value: station,
						onChange: function (v) { setStation(v); },
						options: stationList
					})
				),
				React.createElement('div', { style: filterItemStyle },
					React.createElement('div', { style: filterLabelStyle }, '加氢时间'),
					React.createElement(RangePicker, {
						style: { width: '100%' },
						showTime: true,
						placeholder: ['开始时间', '结束时间'],
						value: timeRange,
						onChange: function (v) { setTimeRange(v || []); }
					})
				),
				React.createElement('div', { style: filterItemStyle },
					React.createElement('div', { style: filterLabelStyle }, '车牌号'),
					React.createElement(Input, {
						placeholder: '请输入车牌号',
						value: plateNo,
						onChange: function (e) { setPlateNo(e.target.value); }
					})
				)
			),
			React.createElement('div', { style: { display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 } },
				React.createElement(Button, { onClick: handleReset }, '重置'),
				React.createElement(Button, { type: 'primary' }, '查询')
			)
		),
		React.createElement(Card, { title: '加氢订单列表', style: cardStyle },
			React.createElement('div', { style: { display: 'flex', justifyContent: 'flex-end', marginBottom: 16 } },
				React.createElement(Button, { onClick: handleExport }, '导出')
			),
			React.createElement(Table, {
				rowKey: 'id',
				columns: columns,
				dataSource: filteredData,
				pagination: { pageSize: 10, showSizeChanger: true, showTotal: function (t) { return '共 ' + t + ' 条'; } },
				bordered: true,
				size: 'middle',
				scroll: { x: 700 }
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

