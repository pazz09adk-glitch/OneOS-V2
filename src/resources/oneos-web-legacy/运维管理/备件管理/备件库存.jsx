// 【重要】必须使用 const Component 作为组件变量名
// 数字化资产 ONEOS 运管平台 - 运维管理 - 备件库 - 备件库存（原型）

const Component = function () {
	var useState = React.useState;
	var useMemo = React.useMemo;
	var useCallback = React.useCallback;

	var antd = window.antd;
	var Breadcrumb = antd.Breadcrumb;
	var Card = antd.Card;
	var Button = antd.Button;
	var Table = antd.Table;
	var Select = antd.Select;
	var Modal = antd.Modal;
	var Drawer = antd.Drawer;
	var Form = antd.Form;
	var Input = antd.Input;
	var InputNumber = antd.InputNumber;
	var DatePicker = antd.DatePicker;
	var message = antd.message;
	var Space = antd.Space;
	var Descriptions = antd.Descriptions;
	var Upload = antd.Upload;
	var Image = antd.Image;

	var dayjs = window.dayjs;

	function normUploadFileList(e) {
		if (Array.isArray(e)) return e;
		return e && e.fileList ? e.fileList : [];
	}

	function filterOption(input, option) {
		var label = (option && (option.label || option.children)) || '';
		return String(label).toLowerCase().indexOf(String(input || '').toLowerCase()) >= 0;
	}

	function todayDayjs() {
		if (dayjs) return dayjs().startOf('day');
		return null;
	}

	function todayYMD() {
		if (dayjs) return dayjs().format('YYYY-MM-DD');
		var d = new Date();
		return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
	}

	function csvEscape(s) {
		var x = String(s == null ? '' : s);
		if (/[",\n\r]/.test(x)) return '"' + x.replace(/"/g, '""') + '"';
		return x;
	}

	function downloadCsv(filename, headers, rows) {
		var lines = [headers.map(csvEscape).join(',')].concat(
			rows.map(function (r) { return r.map(csvEscape).join(','); })
		);
		var blob = new Blob(['\uFEFF' + lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
		var a = document.createElement('a');
		a.href = URL.createObjectURL(blob);
		a.download = filename;
		a.click();
		URL.revokeObjectURL(a.href);
	}

	var layoutStyle = { padding: '16px 24px', background: '#f5f5f5', minHeight: '100vh' };
	var filterLabelStyle = { marginBottom: 6, fontSize: 14, color: 'rgba(0,0,0,0.65)' };
	var filterItemStyle = { marginBottom: 12 };
	var filterControlStyle = { width: '100%' };
	var tableStyle = '.spare-stock-table .ant-table-thead th,.spare-stock-table .ant-table-tbody td{white-space:nowrap;}' +
		'.spare-stock-table .col-stock-qty{text-align:left !important;}' +
		'.spare-stock-table th.col-stock-qty{text-align:left !important;}';

	// 与「仓库管理」一致的仓库名称选项（入库/领用出库）
	var warehouseManageNames = useMemo(function () {
		return [
			'天河备件库', '西湖服务备件库', '上海浦东备件仓', '深圳南山备件仓',
			'成都高新备件库', '宁波江北备件库', '北京朝阳备件仓', '重庆两江备件库'
		];
	}, []);

	var vehicleModelSpecMap = {
		'飞驰49t': '海格牌KLQ5180XYKFCEV',
		'宇通49t': 'KLQ6129',
		'现代4.5t': 'BJ5180',
		'跃进4.5t': '帅铃Q6',
		'苏龙18t': '海格牌KLQ5180XYKFCEV'
	};
	var allVehicleModelOptions = useMemo(function () {
		return [
			{ value: '飞驰49t', label: '飞驰49t' },
			{ value: '宇通49t', label: '宇通49t' },
			{ value: '现代4.5t', label: '现代4.5t' },
			{ value: '跃进4.5t', label: '跃进4.5t' },
			{ value: '苏龙18t', label: '苏龙18t' }
		];
	}, []);
	var addDrawerVehicleOptions = useMemo(function () {
		return allVehicleModelOptions.map(function (opt) {
			var spec = vehicleModelSpecMap[opt.value];
			return {
				value: opt.value,
				label: spec ? opt.value + '（型号：' + spec + '）' : opt.label
			};
		});
	}, [allVehicleModelOptions]);

	function buildInitialStockRows() {
		var XJ = '新件库';
		var XJCode = 'WH-XJK';
		var YS = '易损件库';
		var YSCode = 'WH-YSK';
		return [
			{ id: 'ss-xj-01', warehouseCode: XJCode, warehouseName: XJ, spareCode: 'FC49t-XJ-0001', spareName: '去离子柱(飞驰49t-新件)', vehicleModels: ['飞驰49t'], stockQty: 34, totalInbound: 42, totalOutbound: 8 },
			{ id: 'ss-xj-02', warehouseCode: XJCode, warehouseName: XJ, spareCode: 'FC49t-XJ-0002', spareName: '燃料电池空气滤芯(飞驰49t-新件)', vehicleModels: ['飞驰49t'], stockQty: 28, totalInbound: 55, totalOutbound: 27 },
			{ id: 'ss-xj-03', warehouseCode: XJCode, warehouseName: XJ, spareCode: 'YT49t-XJ-0001', spareName: '去离子柱(宇通49t-新件)', vehicleModels: ['宇通49t'], stockQty: 20, totalInbound: 28, totalOutbound: 8 },
			{ id: 'ss-xj-04', warehouseCode: XJCode, warehouseName: XJ, spareCode: 'YT49t-XJ-0002', spareName: '燃料电池空气滤芯(宇通49t-新件)', vehicleModels: ['宇通49t'], stockQty: 12, totalInbound: 18, totalOutbound: 6 },
			{ id: 'ss-xj-05', warehouseCode: XJCode, warehouseName: XJ, spareCode: 'YT49t-XJ-0005', spareName: '燃料电池去离子水(宇通49t-新件)', vehicleModels: ['宇通49t'], stockQty: 5, totalInbound: 5, totalOutbound: 0 },
			{ id: 'ss-xj-06', warehouseCode: XJCode, warehouseName: XJ, spareCode: 'YT49t-XJ-0029', spareName: '小循环滤网(宇通49t-新件)', vehicleModels: ['宇通49t'], stockQty: 11, totalInbound: 13, totalOutbound: 2 },
			{ id: 'ss-xj-07', warehouseCode: XJCode, warehouseName: XJ, spareCode: 'YT49t-XJ-0030', spareName: '大循环滤网(宇通49t-新件)', vehicleModels: ['宇通49t'], stockQty: 10, totalInbound: 10, totalOutbound: 0 },
			{ id: 'ss-xj-08', warehouseCode: XJCode, warehouseName: XJ, spareCode: 'XD4.5t-XJ-0008', spareName: '后尾灯(现代4.5t-新件)', vehicleModels: ['现代4.5t'], stockQty: 18, totalInbound: 40, totalOutbound: 22 },
			{ id: 'ss-xj-09', warehouseCode: XJCode, warehouseName: XJ, spareCode: 'YJ4.5t-XJ-0035', spareName: '12V蓄电池(跃进4.5t-新件)', vehicleModels: ['跃进4.5t'], stockQty: 23, totalInbound: 26, totalOutbound: 3 },
			{ id: 'ss-xj-10', warehouseCode: XJCode, warehouseName: XJ, spareCode: 'SL18t-XJ-0001', spareName: '去离子柱(苏龙18t-新件)', vehicleModels: ['苏龙18t'], stockQty: 11, totalInbound: 12, totalOutbound: 1 },
			{ id: 'ss-xj-11', warehouseCode: XJCode, warehouseName: XJ, spareCode: 'SL18t-XJ-0002', spareName: '燃料电池空气滤芯(苏龙18t-新件)', vehicleModels: ['苏龙18t'], stockQty: 16, totalInbound: 16, totalOutbound: 0 },
			{ id: 'ss-ys-01', warehouseCode: YSCode, warehouseName: YS, spareCode: 'TY-YS-0001', spareName: 'H1灯泡-易损件', vehicleModels: [], stockQty: 55, totalInbound: 55, totalOutbound: 0 },
			{ id: 'ss-ys-02', warehouseCode: YSCode, warehouseName: YS, spareCode: 'TY-YS-0002', spareName: 'H3灯泡-易损件', vehicleModels: [], stockQty: 50, totalInbound: 50, totalOutbound: 0 },
			{ id: 'ss-ys-03', warehouseCode: YSCode, warehouseName: YS, spareCode: 'TY-YS-0003', spareName: 'H7灯泡-易损件', vehicleModels: [], stockQty: 53, totalInbound: 53, totalOutbound: 0 },
			{ id: 'ss-ys-04', warehouseCode: YSCode, warehouseName: YS, spareCode: 'TY-YS-0004', spareName: '小灯泡-易损件', vehicleModels: [], stockQty: 52, totalInbound: 52, totalOutbound: 0 },
			{ id: 'ss-ys-05', warehouseCode: YSCode, warehouseName: YS, spareCode: 'TY-YS-0005', spareName: '2405灯泡-易损件', vehicleModels: [], stockQty: 110, totalInbound: 110, totalOutbound: 0 }
		];
	}

	function buildSpareCatalogFromRows(rows) {
		var map = {};
		(rows || []).forEach(function (r) {
			if (!r || !r.spareCode || map[r.spareCode]) return;
			var isBulb = /灯泡/.test(r.spareName || '');
			map[r.spareCode] = {
				spareCode: r.spareCode,
				spareName: r.spareName,
				unit: isBulb ? '个' : '件',
				vehicleModels: (r.vehicleModels || []).slice(),
				alertThreshold: isBulb ? 20 : 8
			};
		});
		return map;
	}

	var listState = useState(buildInitialStockRows);
	var list = listState[0];

	var spareCatalogState = useState(function () {
		return buildSpareCatalogFromRows(buildInitialStockRows());
	});
	var spareCatalog = spareCatalogState[0];
	var setSpareCatalog = spareCatalogState[1];

	function getCatalogEntry(spareCode) {
		return spareCatalog[spareCode] || null;
	}

	function getUnitForCode(spareCode) {
		var c = getCatalogEntry(spareCode);
		return (c && c.unit) || '件';
	}

	var inboundRecordsState = useState(function () {
		var ph1 = 'https://via.placeholder.com/160x120.png?text=Inbound+1';
		var ph2 = 'https://via.placeholder.com/160x120.png?text=Inbound+2';
		return [
			{ id: 'in-001', warehouseName: '新件库', spareCode: 'FC49t-XJ-0001', spareName: '去离子柱(飞驰49t-新件)', inboundType: '采购', qty: 4, inboundDate: '2025-02-27', operator: '张三', unitPrice: 128.5, remark: '季度补货', photoUrls: [ph1] },
			{ id: 'in-002', warehouseName: '新件库', spareCode: 'YT49t-XJ-0002', spareName: '燃料电池空气滤芯(宇通49t-新件)', inboundType: '采购', qty: 6, inboundDate: '2025-02-26', operator: '李四', unitPrice: 86, remark: '', photoUrls: [ph1, ph2] },
			{ id: 'in-003', warehouseName: '易损件库', spareCode: 'TY-YS-0001', spareName: 'H1灯泡-易损件', inboundType: '其他', qty: 20, inboundDate: '2025-02-25', operator: '王五', unitPrice: 3.5, remark: '调拨转入', photoUrls: [] },
			{ id: 'in-004', warehouseName: '新件库', spareCode: 'SL18t-XJ-0002', spareName: '燃料电池空气滤芯(苏龙18t-新件)', inboundType: '采购', qty: 8, inboundDate: '2025-02-24', operator: '张三', unitPrice: 92.8, remark: '', photoUrls: [ph2] },
			{ id: 'in-005', warehouseName: '新件库', spareCode: 'FC49t-XJ-0001', spareName: '去离子柱(飞驰49t-新件)', inboundType: '其他', qty: 2, inboundDate: '2025-02-20', operator: '赵六', unitPrice: 0, remark: '盘盈', photoUrls: [] }
		];
	});
	var inboundRecords = inboundRecordsState[0];

	var outboundRecordsState = useState(function () {
		return [
			{ id: 'out-001', warehouseName: '新件库', spareCode: 'FC49t-XJ-0002', spareName: '燃料电池空气滤芯(飞驰49t-新件)', outboundType: '维修', qty: 2, outboundDate: '2025-02-27', operator: '周强', remark: '车辆粤A12345' },
			{ id: 'out-002', warehouseName: '新件库', spareCode: 'XD4.5t-XJ-0008', spareName: '后尾灯(现代4.5t-新件)', outboundType: '保养', qty: 1, outboundDate: '2025-02-26', operator: '钱敏', remark: '' },
			{ id: 'out-003', warehouseName: '易损件库', spareCode: 'TY-YS-0003', spareName: 'H7灯泡-易损件', outboundType: '其他', qty: 5, outboundDate: '2025-02-25', operator: '孙亮', remark: '场站备用' },
			{ id: 'out-004', warehouseName: '新件库', spareCode: 'YJ4.5t-XJ-0035', spareName: '12V蓄电池(跃进4.5t-新件)', outboundType: '维修', qty: 1, outboundDate: '2025-02-24', operator: '周强', remark: '' },
			{ id: 'out-005', warehouseName: '新件库', spareCode: 'FC49t-XJ-0001', spareName: '去离子柱(飞驰49t-新件)', outboundType: '保养', qty: 1, outboundDate: '2025-02-23', operator: '钱敏', remark: '定期更换' },
			{ id: 'out-006', warehouseName: '新件库', spareCode: 'FC49t-XJ-0002', spareName: '燃料电池空气滤芯(飞驰49t-新件)', outboundType: '维修', qty: 1, outboundDate: '2025-02-22', operator: '周强', remark: '粤B88888 进站' },
			{ id: 'out-007', warehouseName: '新件库', spareCode: 'YT49t-XJ-0001', spareName: '去离子柱(宇通49t-新件)', outboundType: '维修', qty: 2, outboundDate: '2025-02-21', operator: '吴刚', remark: '' },
			{ id: 'out-008', warehouseName: '新件库', spareCode: 'YT49t-XJ-0002', spareName: '燃料电池空气滤芯(宇通49t-新件)', outboundType: '保养', qty: 3, outboundDate: '2025-02-20', operator: '钱敏', remark: '车队批量保养' },
			{ id: 'out-009', warehouseName: '新件库', spareCode: 'YT49t-XJ-0029', spareName: '小循环滤网(宇通49t-新件)', outboundType: '维修', qty: 1, outboundDate: '2025-02-19', operator: '郑华', remark: '泄漏检修更换' },
			{ id: 'out-010', warehouseName: '新件库', spareCode: 'SL18t-XJ-0001', spareName: '去离子柱(苏龙18t-新件)', outboundType: '其他', qty: 1, outboundDate: '2025-02-18', operator: '孙亮', remark: '调拨至华东服务站' },
			{ id: 'out-011', warehouseName: '新件库', spareCode: 'SL18t-XJ-0002', spareName: '燃料电池空气滤芯(苏龙18t-新件)', outboundType: '维修', qty: 2, outboundDate: '2025-02-17', operator: '周强', remark: '' },
			{ id: 'out-012', warehouseName: '易损件库', spareCode: 'TY-YS-0001', spareName: 'H1灯泡-易损件', outboundType: '维修', qty: 8, outboundDate: '2025-02-16', operator: '赵磊', remark: '夜间抢修多车' },
			{ id: 'out-013', warehouseName: '易损件库', spareCode: 'TY-YS-0001', spareName: 'H1灯泡-易损件', outboundType: '其他', qty: 4, outboundDate: '2025-02-15', operator: '孙亮', remark: '场站灯箱维护' },
			{ id: 'out-014', warehouseName: '易损件库', spareCode: 'TY-YS-0002', spareName: 'H3灯泡-易损件', outboundType: '保养', qty: 6, outboundDate: '2025-02-14', operator: '钱敏', remark: '' },
			{ id: 'out-015', warehouseName: '易损件库', spareCode: 'TY-YS-0004', spareName: '小灯泡-易损件', outboundType: '其他', qty: 10, outboundDate: '2025-02-13', operator: '吴刚', remark: '库存盘点出库' },
			{ id: 'out-016', warehouseName: '易损件库', spareCode: 'TY-YS-0005', spareName: '2405灯泡-易损件', outboundType: '维修', qty: 12, outboundDate: '2025-02-12', operator: '郑华', remark: '批量更换老化灯泡' },
			{ id: 'out-017', warehouseName: '新件库', spareCode: 'YT49t-XJ-0030', spareName: '大循环滤网(宇通49t-新件)', outboundType: '保养', qty: 2, outboundDate: '2025-02-11', operator: '钱敏', remark: '粤C22334' },
			{ id: 'out-018', warehouseName: '新件库', spareCode: 'YT49t-XJ-0005', spareName: '燃料电池去离子水(宇通49t-新件)', outboundType: '其他', qty: 1, outboundDate: '2025-02-10', operator: '孙亮', remark: '试验用料' },
			{ id: 'out-019', warehouseName: '新件库', spareCode: 'FC49t-XJ-0001', spareName: '去离子柱(飞驰49t-新件)', outboundType: '维修', qty: 3, outboundDate: '2025-02-09', operator: '周强', remark: '质保期内更换' },
			{ id: 'out-020', warehouseName: '新件库', spareCode: 'XD4.5t-XJ-0008', spareName: '后尾灯(现代4.5t-新件)', outboundType: '维修', qty: 2, outboundDate: '2025-02-08', operator: '赵磊', remark: '追尾事故修复' }
		];
	});
	var outboundRecords = outboundRecordsState[0];

	var defaultDraft = {
		warehouseName: undefined,
		spareCode: undefined,
		spareName: undefined,
		vehicleModels: []
	};

	var draftState = useState(Object.assign({}, defaultDraft));
	var draft = draftState[0];
	var setDraft = draftState[1];

	var appliedState = useState(Object.assign({}, defaultDraft));
	var applied = appliedState[0];
	var setApplied = appliedState[1];

	var pageState = useState(1);
	var page = pageState[0];
	var setPage = pageState[1];

	var pageSizeState = useState(10);
	var pageSize = pageSizeState[0];
	var setPageSize = pageSizeState[1];

	var requirementModalState = useState(false);
	var requirementModalOpen = requirementModalState[0];
	var setRequirementModalOpen = requirementModalState[1];

	var addDrawerState = useState(false);
	var addDrawerOpen = addDrawerState[0];
	var setAddDrawerOpen = addDrawerState[1];

	var inboundDrawerState = useState(false);
	var inboundDrawerOpen = inboundDrawerState[0];
	var setInboundDrawerOpen = inboundDrawerState[1];

	var outboundDrawerState = useState(false);
	var outboundDrawerOpen = outboundDrawerState[0];
	var setOutboundDrawerOpen = outboundDrawerState[1];

	var detailRowState = useState(null);
	var detailRow = detailRowState[0];
	var setDetailRow = detailRowState[1];

	var inboundHistRowState = useState(null);
	var inboundHistRow = inboundHistRowState[0];
	var setInboundHistRow = inboundHistRowState[1];

	var outboundHistRowState = useState(null);
	var outboundHistRow = outboundHistRowState[0];
	var setOutboundHistRow = outboundHistRowState[1];

	var histInboundPageState = useState(1);
	var histInboundPage = histInboundPageState[0];
	var setHistInboundPage = histInboundPageState[1];
	var histInboundPageSizeState = useState(10);
	var histInboundPageSize = histInboundPageSizeState[0];
	var setHistInboundPageSize = histInboundPageSizeState[1];

	var histOutboundPageState = useState(1);
	var histOutboundPage = histOutboundPageState[0];
	var setHistOutboundPage = histOutboundPageState[1];
	var histOutboundPageSizeState = useState(10);
	var histOutboundPageSize = histOutboundPageSizeState[0];
	var setHistOutboundPageSize = histOutboundPageSizeState[1];

	var addForm = Form.useForm()[0];
	var inboundForm = Form.useForm()[0];
	var outboundForm = Form.useForm()[0];

	var requirementDocContent = [
		'一个「数字化资产ONEOS运管平台」中的「备件库存」模块',
		'#面包屑：运维管理-备件库-备件库存',
		'',
		'1.筛选：',
		'1.1.仓库名称：选择器，支持输入框内输入模糊搜索，下拉匹配正确项；',
		'1.2.备件编码：选择器，支持输入框内输入模糊搜索，下拉匹配正确项；',
		'1.3.备件名称：选择器，支持输入框内输入模糊搜索，下拉匹配正确项；',
		'1.4.适配车型：选择器，支持多选，显示所有型号；',
		'',
		'2.列表；右侧为新增备件信息、入库、领用出库、批量导入、导出按钮',
		'#列表：',
		'2.1.序号：1.2.3.以此类推；',
		'2.2.仓库编码：显示仓库编码；',
		'2.3.仓库名称：显示仓库名称；',
		'2.4.备件编码：显示备件编码；',
		'2.5.备件名称：显示备件名称；',
		'2.6.适配车型：显示适配车型，一个备件可能有多个车型，非必填；',
		'2.7.库存数量：显示库存数量；',
		'2.8.累积入库数量：显示该备件入库数量总和；',
		'2.9.累积出库数量：显示该备件出库数量总和；',
		'2.10.操作：备件明细、入库记录、出库记录；',
		'     2.10.1.备件明细：点击弹出抽屉，字段为：',
		'            2.10.1.1.备件编码：显示备件编码；',
		'            2.10.1.2.备件名称：显示备件名称；',
		'            2.10.1.3.计算单位：显示备件计算单位；',
		'            2.10.1.4.适配车型：显示备件适配车型；',
		'            2.10.1.5.告警阈值：显示备件告警阈值；',
		'     2.10.2.入库记录：点击弹出抽屉，显示列表，支持导出csv，列表字段为：',
		'            2.10.2.1.备件编码：显示备件编码；',
		'            2.10.2.2.备件名称：显示备件名称；',
		'            2.10.2.3.入库类型：显示入库类型，分为采购、其他；',
		'            2.10.2.4.入库数量：显示入库数量，单位根据备件明细单位显示，格式为：xx（单位）；',
		'            2.10.2.5.入库日期：显示入库日期，YYYY-MM-DD；',
		'            2.10.2.6.入库人员：显示入库人员姓名；',
		'            2.10.2.7.单价：显示入库单价，格式为：xx.xx元；',
		'            2.10.2.8.入库照片：显示入库照片，点击可放大预览；',
		'            2.10.2.9.备注：显示备注信息；',
		'     2.10.3.出库记录：点击弹出抽屉，显示列表，支持导出csv，字段为：',
		'            2.10.3.1.备件编码：显示备件编码；',
		'            2.10.3.2.备件名称：显示备件名称；',
		'            2.10.3.3.出库类型：显示出库类型；',
		'            2.10.3.4.出库数量：显示出库数量，单位根据备件明细单位显示，格式为：xx（单位）；',
		'            2.10.3.5.出库日期：显示出库日期，YYYY-MM-DD；',
		'            2.10.3.6.出库人员：显示出库人员姓名；',
		'            2.10.3.7.备注：显示备注信息；',
		'2.11.右下角为分页功能，支持选择单页显示数据条数；',
		'',
		'3.新增备件信息',
		'点击弹出抽屉，字段为：',
		'3.1.备件编码：输入框，默认提示为请输入备件编码；',
		'3.2.备件名称：输入框，默认提示为请输入备件名称；',
		'3.3.计算单位：输入框，默认提示为请输入计量单位；',
		'3.4.适配车型：非必填，选择器，支持多选，选项来自型号表，默认提示：请选择车型；',
		'3.5.告警阈值：输入框，支持正数整数输入，支持输入框上下按钮调整数量，默认提示为请设置备件告警阈值；',
		'',
		'4.入库：',
		'点击弹出抽屉，字段为：',
		'4.1.仓库名称：选择器，选项来自于仓库管理；',
		'4.2.备件名称：选择器，选项来自于备件管理；',
		'4.3.入库类型：选择器，选项为：采购、其他；',
		'4.4.入库数量：输入框，支持正数整数输入；支持点击增加减少变动数量；',
		'4.5.入库日期：日期选择器，精确至天，默认为当日；',
		'4.6.单价：输入框，支持2位小数输入，后缀为元；',
		'4.7.入库照片：照片上传按钮，点击上传本地文件，上传后，支持预览和点击右上角删除按钮删除；',
		'4.8.备注：文本域，支持自定义输入；',
		'',
		'5.领用出库：',
		'点击弹出抽屉，字段为：',
		'5.1.仓库名称：选择器，选项来自于仓库管理；',
		'5.2.备件名称：选择器，选项来自于备件管理；',
		'5.3.出库类型：选择器，选项为：维修、保养、其他；',
		'5.4.出库数量：输入框，支持正数整数输入；支持点击增加减少变动数量；',
		'5.5.出库日期：日期选择器，精确至天，默认为当天；',
		'5.6.备注：文本域，支持自定义输入；',
		'',
		'6.批量导入：',
		'根据入库字段，生成csv模板；',
		'',
		'7.导出：根据筛选条件自动导出csv文件；'
	].join('\n');

	var warehouseNameOptions = useMemo(function () {
		var set = new Set();
		warehouseManageNames.forEach(function (w) { set.add(w); });
		(list || []).forEach(function (r) { if (r && r.warehouseName) set.add(r.warehouseName); });
		return Array.from(set).map(function (v) { return { value: v, label: v }; });
	}, [list, warehouseManageNames]);

	var warehouseOptionsForForm = useMemo(function () {
		return warehouseManageNames.map(function (w) { return { value: w, label: w }; });
	}, [warehouseManageNames]);

	var spareCodeOptions = useMemo(function () {
		var set = new Set();
		(list || []).forEach(function (r) { if (r && r.spareCode) set.add(r.spareCode); });
		Object.keys(spareCatalog).forEach(function (k) { set.add(k); });
		return Array.from(set).map(function (v) { return { value: v, label: v }; });
	}, [list, spareCatalog]);

	var spareNameOptions = useMemo(function () {
		var set = new Set();
		(list || []).forEach(function (r) { if (r && r.spareName) set.add(r.spareName); });
		Object.keys(spareCatalog).forEach(function (k) {
			var c = spareCatalog[k];
			if (c && c.spareName) set.add(c.spareName);
		});
		return Array.from(set).map(function (v) { return { value: v, label: v }; });
	}, [list, spareCatalog]);

	var spareSelectByNameOptions = useMemo(function () {
		var byCode = {};
		Object.keys(spareCatalog).forEach(function (code) {
			var c = spareCatalog[code];
			if (c) byCode[code] = { value: code, label: c.spareName + '（' + code + '）' };
		});
		(list || []).forEach(function (r) {
			if (r && r.spareCode && !byCode[r.spareCode]) {
				byCode[r.spareCode] = { value: r.spareCode, label: r.spareName + '（' + r.spareCode + '）' };
			}
		});
		return Object.keys(byCode).map(function (k) { return byCode[k]; });
	}, [list, spareCatalog]);

	function rowMatchesVehicleModels(row, selected) {
		if (!selected || selected.length === 0) return true;
		var models = row.vehicleModels || [];
		for (var i = 0; i < selected.length; i++) {
			if (models.indexOf(selected[i]) >= 0) return true;
		}
		return false;
	}

	var filtered = useMemo(function () {
		return (list || []).filter(function (r) {
			if (applied.warehouseName && r.warehouseName !== applied.warehouseName) return false;
			if (applied.spareCode && r.spareCode !== applied.spareCode) return false;
			if (applied.spareName && r.spareName !== applied.spareName) return false;
			if (!rowMatchesVehicleModels(r, applied.vehicleModels)) return false;
			return true;
		});
	}, [list, applied]);

	var paged = useMemo(function () {
		var start = (page - 1) * pageSize;
		return filtered.slice(start, start + pageSize);
	}, [filtered, page, pageSize]);

	var serialStart = (page - 1) * pageSize;

	var handleQuery = useCallback(function () {
		setApplied({
			warehouseName: draft.warehouseName,
			spareCode: draft.spareCode,
			spareName: draft.spareName,
			vehicleModels: draft.vehicleModels ? draft.vehicleModels.slice() : []
		});
		setPage(1);
	}, [draft]);

	var handleReset = useCallback(function () {
		setDraft(Object.assign({}, defaultDraft));
		setApplied(Object.assign({}, defaultDraft));
		setPage(1);
	}, []);

	var handleAdd = useCallback(function () {
		addForm.resetFields();
		setAddDrawerOpen(true);
	}, [addForm]);

	var handleAddDrawerClose = useCallback(function () {
		setAddDrawerOpen(false);
		addForm.resetFields();
	}, [addForm]);

	var handleAddDrawerSubmit = useCallback(function () {
		addForm.validateFields().then(function (vals) {
			setSpareCatalog(function (prev) {
				var next = Object.assign({}, prev);
				next[vals.spareCode] = {
					spareCode: vals.spareCode,
					spareName: vals.spareName,
					unit: vals.unit,
					vehicleModels: vals.vehicleModels || [],
					alertThreshold: vals.alertThreshold
				};
				return next;
			});
			message.success('已保存（原型，联调时对接建档接口）');
			setAddDrawerOpen(false);
			addForm.resetFields();
		}).catch(function () {});
	}, [addForm, setSpareCatalog]);

	var handleOpenInboundForm = useCallback(function () {
		inboundForm.resetFields();
		inboundForm.setFieldsValue({
			inboundDate: todayDayjs() || undefined,
			qty: 1,
			inboundType: '采购',
			unitPrice: undefined,
			remark: '',
			inboundPhotos: []
		});
		setInboundDrawerOpen(true);
	}, [inboundForm]);

	var handleInboundFormClose = useCallback(function () {
		var fl = inboundForm.getFieldValue('inboundPhotos') || [];
		fl.forEach(function (f) {
			var u = f.url || f.thumbUrl;
			if (u && String(u).indexOf('blob:') === 0) {
				try { URL.revokeObjectURL(u); } catch (e) {}
			}
		});
		setInboundDrawerOpen(false);
		inboundForm.resetFields();
	}, [inboundForm]);

	var handleInboundFormSubmit = useCallback(function () {
		inboundForm.validateFields().then(function () {
			message.success('入库已提交（原型，联调对接接口）');
			setInboundDrawerOpen(false);
			inboundForm.resetFields();
		}).catch(function () {});
	}, [inboundForm]);

	var handleOpenOutboundForm = useCallback(function () {
		outboundForm.resetFields();
		outboundForm.setFieldsValue({
			outboundDate: todayDayjs() || undefined,
			qty: 1,
			outboundType: '维修',
			remark: ''
		});
		setOutboundDrawerOpen(true);
	}, [outboundForm]);

	var handleOutboundFormClose = useCallback(function () {
		setOutboundDrawerOpen(false);
		outboundForm.resetFields();
	}, [outboundForm]);

	var handleOutboundFormSubmit = useCallback(function () {
		outboundForm.validateFields().then(function () {
			message.success('领用出库已提交（原型，联调对接接口）');
			setOutboundDrawerOpen(false);
			outboundForm.resetFields();
		}).catch(function () {});
	}, [outboundForm]);

	var handleDownloadImportTemplate = useCallback(function () {
		var headers = ['仓库名称', '备件名称', '入库类型', '入库数量', '入库日期', '单价', '入库照片', '备注'];
		var sample = [
			['天河备件库', '示例备件名称', '采购', '10', todayYMD(), '99.99', '图片文件名或URL，可留空', '模板示例行，可删除']
		];
		downloadCsv('备件入库导入模板.csv', headers, sample);
		message.success('已下载 CSV 模板');
	}, []);

	var handleExportList = useCallback(function () {
		var headers = ['序号', '仓库编码', '仓库名称', '备件编码', '备件名称', '适配车型', '库存数量', '累积入库数量', '累积出库数量'];
		var rows = filtered.map(function (r, i) {
			var vm = (r.vehicleModels || []).length ? r.vehicleModels.join('、') : '-';
			return [
				String(i + 1),
				r.warehouseCode,
				r.warehouseName,
				r.spareCode,
				r.spareName,
				vm,
				r.stockQty,
				r.totalInbound,
				r.totalOutbound
			];
		});
		downloadCsv('备件库存导出_' + todayYMD() + '.csv', headers, rows);
		message.success('已按当前筛选条件导出 ' + rows.length + ' 条');
	}, [filtered]);

	var openDetail = useCallback(function (row) {
		setDetailRow(row);
	}, []);

	var openInboundHist = useCallback(function (row) {
		setInboundHistRow(row);
		setHistInboundPage(1);
	}, []);

	var openOutboundHist = useCallback(function (row) {
		setOutboundHistRow(row);
		setHistOutboundPage(1);
	}, []);

	var filteredInboundHist = useMemo(function () {
		if (!inboundHistRow) return [];
		return (inboundRecords || []).filter(function (r) {
			return r.warehouseName === inboundHistRow.warehouseName && r.spareCode === inboundHistRow.spareCode;
		});
	}, [inboundRecords, inboundHistRow]);

	var filteredOutboundHist = useMemo(function () {
		if (!outboundHistRow) return [];
		return (outboundRecords || []).filter(function (r) {
			return r.warehouseName === outboundHistRow.warehouseName && r.spareCode === outboundHistRow.spareCode;
		});
	}, [outboundRecords, outboundHistRow]);

	var exportInboundHistCsv = useCallback(function () {
		if (!inboundHistRow) return;
		var unit = getUnitForCode(inboundHistRow.spareCode);
		var headers = ['备件编码', '备件名称', '入库类型', '入库数量', '入库日期', '入库人员', '单价', '入库照片', '备注'];
		var rows = filteredInboundHist.map(function (r) {
			var pics = (r.photoUrls && r.photoUrls.length) ? r.photoUrls.join('；') : '无';
			return [
				r.spareCode,
				r.spareName,
				r.inboundType,
				String(r.qty) + '（' + unit + '）',
				r.inboundDate,
				r.operator,
				(Number(r.unitPrice).toFixed(2)) + '元',
				pics,
				r.remark || ''
			];
		});
		downloadCsv('入库记录_' + inboundHistRow.spareCode + '_' + todayYMD() + '.csv', headers, rows);
		message.success('已导出 ' + rows.length + ' 条');
	}, [filteredInboundHist, inboundHistRow, spareCatalog]);

	var exportOutboundHistCsv = useCallback(function () {
		if (!outboundHistRow) return;
		var unit = getUnitForCode(outboundHistRow.spareCode);
		var headers = ['备件编码', '备件名称', '出库类型', '出库数量', '出库日期', '出库人员', '备注'];
		var rows = filteredOutboundHist.map(function (r) {
			return [
				r.spareCode,
				r.spareName,
				r.outboundType,
				String(r.qty) + '（' + unit + '）',
				r.outboundDate,
				r.operator,
				r.remark || ''
			];
		});
		downloadCsv('出库记录_' + outboundHistRow.spareCode + '_' + todayYMD() + '.csv', headers, rows);
		message.success('已导出 ' + rows.length + ' 条');
	}, [filteredOutboundHist, outboundHistRow, spareCatalog]);

	var columns = useMemo(function () {
		return [
			{
				title: '序号',
				key: 'serial',
				width: 64,
				fixed: 'left',
				render: function (_, r, idx) {
					return serialStart + idx + 1;
				}
			},
			{ title: '仓库编码', dataIndex: 'warehouseCode', key: 'warehouseCode', width: 112, fixed: 'left' },
			{ title: '仓库名称', dataIndex: 'warehouseName', key: 'warehouseName', width: 140, ellipsis: true },
			{ title: '备件编码', dataIndex: 'spareCode', key: 'spareCode', width: 130 },
			{ title: '备件名称', dataIndex: 'spareName', key: 'spareName', width: 240, ellipsis: true },
			{
				title: '适配车型',
				key: 'vehicleModels',
				width: 200,
				ellipsis: true,
				render: function (_, r) {
					var arr = r.vehicleModels || [];
					return arr.length ? arr.join('、') : '-';
				}
			},
			{
				title: '库存数量',
				dataIndex: 'stockQty',
				key: 'stockQty',
				width: 96,
				align: 'left',
				className: 'col-stock-qty',
				onHeaderCell: function () { return { className: 'col-stock-qty' }; },
				render: function (v) {
					if (v == null) return '-';
					return React.createElement('span', {
						style: {
							color: 'var(--ant-color-primary, #1677ff)',
							fontWeight: 600,
							fontSize: 15
						}
					}, v);
				}
			},
			{
				title: '累积入库数量',
				dataIndex: 'totalInbound',
				key: 'totalInbound',
				width: 120,
				render: function (v) { return v != null ? v : '-'; }
			},
			{
				title: '累积出库数量',
				dataIndex: 'totalOutbound',
				key: 'totalOutbound',
				width: 120,
				render: function (v) { return v != null ? v : '-'; }
			},
			{
				title: '操作',
				key: 'actions',
				width: 220,
				fixed: 'right',
				render: function (_, row) {
					return React.createElement(Space, { size: 'small', wrap: true },
						React.createElement(Button, { type: 'link', size: 'small', style: { padding: 0 }, onClick: function () { openDetail(row); } }, '备件明细'),
						React.createElement(Button, { type: 'link', size: 'small', style: { padding: 0 }, onClick: function () { openInboundHist(row); } }, '入库记录'),
						React.createElement(Button, { type: 'link', size: 'small', style: { padding: 0 }, onClick: function () { openOutboundHist(row); } }, '出库记录')
					);
				}
			}
		];
	}, [serialStart, openDetail, openInboundHist, openOutboundHist]);

	var histInboundSerial = (histInboundPage - 1) * histInboundPageSize;
	var histInboundPaged = useMemo(function () {
		var s = (histInboundPage - 1) * histInboundPageSize;
		return filteredInboundHist.slice(s, s + histInboundPageSize);
	}, [filteredInboundHist, histInboundPage, histInboundPageSize]);

	var histOutboundSerial = (histOutboundPage - 1) * histOutboundPageSize;
	var histOutboundPaged = useMemo(function () {
		var s = (histOutboundPage - 1) * histOutboundPageSize;
		return filteredOutboundHist.slice(s, s + histOutboundPageSize);
	}, [filteredOutboundHist, histOutboundPage, histOutboundPageSize]);

	var inboundHistColumns = useMemo(function () {
		function renderInboundPhotos(_, r) {
			var urls = r.photoUrls || [];
			if (!urls.length) return '-';
			if (Image && Image.PreviewGroup) {
				return React.createElement(
					Image.PreviewGroup,
					null,
					urls.map(function (u, i) {
						return React.createElement(Image, {
							key: i,
							width: 52,
							height: 52,
							style: { objectFit: 'cover', borderRadius: 4, marginRight: 4, cursor: 'pointer', verticalAlign: 'middle' },
							src: u,
							alt: '入库照片'
						});
					})
				);
			}
			return React.createElement(Space, { size: 4, wrap: true },
				urls.map(function (u, i) {
					return React.createElement('img', {
						key: i,
						src: u,
						alt: '',
						style: { width: 52, height: 52, objectFit: 'cover', borderRadius: 4, cursor: 'pointer' },
						onClick: function () { window.open(u, '_blank'); }
					});
				})
			);
		}
		return [
			{ title: '序号', key: 's', width: 60, render: function (_, r, i) { return histInboundSerial + i + 1; } },
			{ title: '备件编码', dataIndex: 'spareCode', key: 'spareCode', width: 130 },
			{ title: '备件名称', dataIndex: 'spareName', key: 'spareName', ellipsis: true },
			{ title: '入库类型', dataIndex: 'inboundType', key: 'inboundType', width: 88 },
			{
				title: '入库数量',
				key: 'qtyDisp',
				width: 110,
				render: function (_, r) {
					var u = getUnitForCode(r.spareCode);
					return r.qty + '（' + u + '）';
				}
			},
			{ title: '入库日期', dataIndex: 'inboundDate', key: 'inboundDate', width: 112 },
			{ title: '入库人员', dataIndex: 'operator', key: 'operator', width: 96 },
			{
				title: '单价',
				key: 'price',
				width: 100,
				render: function (_, r) {
					return Number(r.unitPrice).toFixed(2) + '元';
				}
			},
			{ title: '入库照片', key: 'photos', width: 200, render: renderInboundPhotos },
			{ title: '备注', dataIndex: 'remark', key: 'remark', ellipsis: true }
		];
	}, [histInboundSerial, spareCatalog]);

	var outboundHistColumns = useMemo(function () {
		return [
			{ title: '序号', key: 's', width: 60, render: function (_, r, i) { return histOutboundSerial + i + 1; } },
			{ title: '备件编码', dataIndex: 'spareCode', key: 'spareCode', width: 130 },
			{ title: '备件名称', dataIndex: 'spareName', key: 'spareName', ellipsis: true },
			{ title: '出库类型', dataIndex: 'outboundType', key: 'outboundType', width: 88 },
			{
				title: '出库数量',
				key: 'qtyDisp',
				width: 110,
				render: function (_, r) {
					var u = getUnitForCode(r.spareCode);
					return r.qty + '（' + u + '）';
				}
			},
			{ title: '出库日期', dataIndex: 'outboundDate', key: 'outboundDate', width: 112 },
			{ title: '出库人员', dataIndex: 'operator', key: 'operator', width: 96 },
			{ title: '备注', dataIndex: 'remark', key: 'remark', ellipsis: true }
		];
	}, [histOutboundSerial, spareCatalog]);

	var detailDescItems = useMemo(function () {
		if (!detailRow) return [];
		var cat = getCatalogEntry(detailRow.spareCode);
		var vm = (detailRow.vehicleModels || []).length
			? detailRow.vehicleModels.join('、')
			: (cat && cat.vehicleModels && cat.vehicleModels.length ? cat.vehicleModels.join('、') : '-');
		return [
			{ key: 'c', label: '备件编码', children: detailRow.spareCode },
			{ key: 'n', label: '备件名称', children: detailRow.spareName },
			{ key: 'u', label: '计算单位', children: (cat && cat.unit) || '-' },
			{ key: 'v', label: '适配车型', children: vm },
			{ key: 'a', label: '告警阈值', children: cat && cat.alertThreshold != null ? String(cat.alertThreshold) : '-' }
		];
	}, [detailRow, spareCatalog]);

	return React.createElement('div', { style: layoutStyle },
		React.createElement('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 8 } },
			React.createElement(Breadcrumb, { items: [{ title: '运维管理' }, { title: '备件库' }, { title: '备件库存' }] }),
			React.createElement(Button, { type: 'link', style: { padding: 0 }, onClick: function () { setRequirementModalOpen(true); } }, '查看需求说明')
		),

		React.createElement(Modal, {
			title: '需求说明',
			open: requirementModalOpen,
			onCancel: function () { setRequirementModalOpen(false); },
			width: 820,
			footer: React.createElement(Button, { onClick: function () { setRequirementModalOpen(false); } }, '关闭'),
			bodyStyle: { paddingTop: 12, maxHeight: '78vh', overflow: 'auto' }
		},
			React.createElement(Card, {
				size: 'small',
				bordered: true,
				style: { borderRadius: 8 },
				bodyStyle: { padding: '16px 18px' }
			},
				React.createElement('div', { style: { whiteSpace: 'pre-wrap', fontSize: 13, lineHeight: 1.65, color: 'rgba(0,0,0,0.85)' } }, requirementDocContent)
			)
		),

		React.createElement(Drawer, {
			title: '备件明细',
			placement: 'right',
			width: 440,
			open: !!detailRow,
			onClose: function () { setDetailRow(null); },
			destroyOnClose: true
		},
			detailRow ? React.createElement(Descriptions, { column: 1, bordered: true, size: 'small' },
				detailDescItems.map(function (it) {
					return React.createElement(Descriptions.Item, { key: it.key, label: it.label }, it.children);
				})
			) : null
		),

		React.createElement(Drawer, {
			title: inboundHistRow ? '入库记录 · ' + inboundHistRow.spareName : '入库记录',
			placement: 'right',
			width: 1120,
			open: !!inboundHistRow,
			onClose: function () { setInboundHistRow(null); },
			destroyOnClose: true,
			extra: React.createElement(Button, { type: 'primary', size: 'small', onClick: exportInboundHistCsv, disabled: !filteredInboundHist.length }, '导出 CSV')
		},
			React.createElement(Table, {
				rowKey: 'id',
				size: 'small',
				columns: inboundHistColumns,
				dataSource: histInboundPaged,
				scroll: { x: 1180 },
				pagination: {
					current: histInboundPage,
					pageSize: histInboundPageSize,
					total: filteredInboundHist.length,
					showSizeChanger: true,
					showTotal: function (t) { return '共 ' + t + ' 条'; },
					onChange: function (pg, ps) { setHistInboundPage(pg); if (ps) setHistInboundPageSize(ps); }
				}
			})
		),

		React.createElement(Drawer, {
			title: outboundHistRow ? '出库记录 · ' + outboundHistRow.spareName : '出库记录',
			placement: 'right',
			width: 880,
			open: !!outboundHistRow,
			onClose: function () { setOutboundHistRow(null); },
			destroyOnClose: true,
			extra: React.createElement(Button, { type: 'primary', size: 'small', onClick: exportOutboundHistCsv, disabled: !filteredOutboundHist.length }, '导出 CSV')
		},
			React.createElement(Table, {
				rowKey: 'id',
				size: 'small',
				columns: outboundHistColumns,
				dataSource: histOutboundPaged,
				scroll: { x: 860 },
				pagination: {
					current: histOutboundPage,
					pageSize: histOutboundPageSize,
					total: filteredOutboundHist.length,
					showSizeChanger: true,
					showTotal: function (t) { return '共 ' + t + ' 条'; },
					onChange: function (pg, ps) { setHistOutboundPage(pg); if (ps) setHistOutboundPageSize(ps); }
				}
			})
		),

		React.createElement(Drawer, {
			title: '新增备件信息',
			placement: 'right',
			width: 440,
			open: addDrawerOpen,
			onClose: handleAddDrawerClose,
			destroyOnClose: true,
			footer: React.createElement('div', { style: { textAlign: 'right' } },
				React.createElement(Button, { onClick: handleAddDrawerClose, style: { marginRight: 8 } }, '取消'),
				React.createElement(Button, { type: 'primary', onClick: handleAddDrawerSubmit }, '确定')
			)
		},
			React.createElement(Form, { form: addForm, layout: 'vertical', preserve: false },
				React.createElement(Form.Item, {
					name: 'spareCode',
					label: '备件编码',
					rules: [{ required: true, message: '请输入备件编码' }]
				}, React.createElement(Input, { placeholder: '请输入备件编码', allowClear: true })),
				React.createElement(Form.Item, {
					name: 'spareName',
					label: '备件名称',
					rules: [{ required: true, message: '请输入备件名称' }]
				}, React.createElement(Input, { placeholder: '请输入备件名称', allowClear: true })),
				React.createElement(Form.Item, {
					name: 'unit',
					label: '计算单位',
					rules: [{ required: true, message: '请输入计量单位' }]
				}, React.createElement(Input, { placeholder: '请输入计量单位', allowClear: true })),
				React.createElement(Form.Item, {
					name: 'vehicleModels',
					label: '适配车型'
				}, React.createElement(Select, {
					mode: 'multiple',
					placeholder: '请选择车型',
					allowClear: true,
					options: addDrawerVehicleOptions,
					showSearch: true,
					filterOption: filterOption,
					maxTagCount: 'responsive'
				})),
				React.createElement(Form.Item, {
					name: 'alertThreshold',
					label: '告警阈值',
					rules: [{ required: true, message: '请设置备件告警阈值' }]
				}, React.createElement(InputNumber, {
					placeholder: '请设置备件告警阈值',
					style: { width: '100%' },
					min: 1,
					precision: 0,
					step: 1
				}))
			)
		),

		React.createElement(Drawer, {
			title: '入库',
			placement: 'right',
			width: 480,
			open: inboundDrawerOpen,
			onClose: handleInboundFormClose,
			destroyOnClose: true,
			footer: React.createElement('div', { style: { textAlign: 'right' } },
				React.createElement(Button, { onClick: handleInboundFormClose, style: { marginRight: 8 } }, '取消'),
				React.createElement(Button, { type: 'primary', onClick: handleInboundFormSubmit }, '确定')
			)
		},
			React.createElement(Form, { form: inboundForm, layout: 'vertical', preserve: false },
				React.createElement(Form.Item, {
					name: 'warehouseName',
					label: '仓库名称',
					rules: [{ required: true, message: '请选择仓库名称' }]
				}, React.createElement(Select, {
					placeholder: '请选择仓库',
					allowClear: true,
					showSearch: true,
					options: warehouseOptionsForForm,
					filterOption: filterOption
				})),
				React.createElement(Form.Item, {
					name: 'spareCode',
					label: '备件名称',
					rules: [{ required: true, message: '请选择备件' }]
				}, React.createElement(Select, {
					placeholder: '请选择备件',
					allowClear: true,
					showSearch: true,
					options: spareSelectByNameOptions,
					filterOption: filterOption
				})),
				React.createElement(Form.Item, {
					name: 'inboundType',
					label: '入库类型',
					rules: [{ required: true, message: '请选择入库类型' }]
				}, React.createElement(Select, {
					placeholder: '请选择',
					options: [{ value: '采购', label: '采购' }, { value: '其他', label: '其他' }]
				})),
				React.createElement(Form.Item, {
					name: 'qty',
					label: '入库数量',
					rules: [{ required: true, message: '请输入入库数量' }]
				}, React.createElement(InputNumber, {
					style: { width: '100%' },
					min: 1,
					precision: 0,
					step: 1
				})),
				React.createElement(Form.Item, {
					name: 'inboundDate',
					label: '入库日期',
					rules: [{ required: true, message: '请选择入库日期' }]
				}, React.createElement(DatePicker, { style: { width: '100%' }, format: 'YYYY-MM-DD' })),
				React.createElement(Form.Item, { label: '单价' },
					React.createElement(Input.Group, { compact: true, style: { display: 'flex', width: '100%' } },
						React.createElement(Form.Item, {
							name: 'unitPrice',
							noStyle: true,
							rules: [{ required: true, message: '请输入单价' }]
						}, React.createElement(InputNumber, {
							style: { width: 'calc(100% - 40px)' },
							min: 0,
							precision: 2,
							step: 0.01,
							placeholder: '支持两位小数'
						})),
						React.createElement(Input, {
							style: { width: 40, textAlign: 'center', padding: '0 4px' },
							disabled: true,
							value: '元'
						})
					)
				),
				React.createElement(Form.Item, {
					name: 'inboundPhotos',
					label: '入库照片',
					valuePropName: 'fileList',
					getValueFromEvent: normUploadFileList,
					extra: React.createElement('span', { style: { fontSize: 12, color: 'rgba(0,0,0,0.45)' } }, '本地选择图片，点击缩略图可放大预览；卡片右上角可删除')
				}, React.createElement(Upload, {
					listType: 'picture-card',
					accept: 'image/*',
					beforeUpload: function () { return false; },
					maxCount: 9,
					multiple: true
				}, React.createElement('div', null,
					React.createElement('div', { style: { fontSize: 22, lineHeight: 1 } }, '+'),
					React.createElement('div', { style: { marginTop: 6, fontSize: 12, color: 'rgba(0,0,0,0.65)' } }, '上传照片')
				))),
				React.createElement(Form.Item, { name: 'remark', label: '备注' },
					React.createElement(Input.TextArea, { rows: 3, placeholder: '请输入备注', allowClear: true }))
			)
		),

		React.createElement(Drawer, {
			title: '领用出库',
			placement: 'right',
			width: 440,
			open: outboundDrawerOpen,
			onClose: handleOutboundFormClose,
			destroyOnClose: true,
			footer: React.createElement('div', { style: { textAlign: 'right' } },
				React.createElement(Button, { onClick: handleOutboundFormClose, style: { marginRight: 8 } }, '取消'),
				React.createElement(Button, { type: 'primary', onClick: handleOutboundFormSubmit }, '确定')
			)
		},
			React.createElement(Form, { form: outboundForm, layout: 'vertical', preserve: false },
				React.createElement(Form.Item, {
					name: 'warehouseName',
					label: '仓库名称',
					rules: [{ required: true, message: '请选择仓库名称' }]
				}, React.createElement(Select, {
					placeholder: '请选择仓库',
					allowClear: true,
					showSearch: true,
					options: warehouseOptionsForForm,
					filterOption: filterOption
				})),
				React.createElement(Form.Item, {
					name: 'spareCode',
					label: '备件名称',
					rules: [{ required: true, message: '请选择备件' }]
				}, React.createElement(Select, {
					placeholder: '请选择备件',
					allowClear: true,
					showSearch: true,
					options: spareSelectByNameOptions,
					filterOption: filterOption
				})),
				React.createElement(Form.Item, {
					name: 'outboundType',
					label: '出库类型',
					rules: [{ required: true, message: '请选择出库类型' }]
				}, React.createElement(Select, {
					placeholder: '请选择',
					options: [
						{ value: '维修', label: '维修' },
						{ value: '保养', label: '保养' },
						{ value: '其他', label: '其他' }
					]
				})),
				React.createElement(Form.Item, {
					name: 'qty',
					label: '出库数量',
					rules: [{ required: true, message: '请输入出库数量' }]
				}, React.createElement(InputNumber, {
					style: { width: '100%' },
					min: 1,
					precision: 0,
					step: 1
				})),
				React.createElement(Form.Item, {
					name: 'outboundDate',
					label: '出库日期',
					rules: [{ required: true, message: '请选择出库日期' }]
				}, React.createElement(DatePicker, { style: { width: '100%' }, format: 'YYYY-MM-DD' })),
				React.createElement(Form.Item, { name: 'remark', label: '备注' },
					React.createElement(Input.TextArea, { rows: 3, placeholder: '请输入备注', allowClear: true }))
			)
		),

		React.createElement(Card, { style: { marginBottom: 16 } },
			React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px 24px', alignItems: 'start' } },
				React.createElement('div', { style: filterItemStyle },
					React.createElement('div', { style: filterLabelStyle }, '仓库名称'),
					React.createElement(Select, {
						placeholder: '请输入或选择仓库名称',
						style: filterControlStyle,
						value: draft.warehouseName,
						onChange: function (v) { setDraft(function (p) { return Object.assign({}, p, { warehouseName: v }); }); },
						allowClear: true,
						showSearch: true,
						options: warehouseNameOptions,
						filterOption: filterOption
					})
				),
				React.createElement('div', { style: filterItemStyle },
					React.createElement('div', { style: filterLabelStyle }, '备件编码'),
					React.createElement(Select, {
						placeholder: '请输入或选择备件编码',
						style: filterControlStyle,
						value: draft.spareCode,
						onChange: function (v) { setDraft(function (p) { return Object.assign({}, p, { spareCode: v }); }); },
						allowClear: true,
						showSearch: true,
						options: spareCodeOptions,
						filterOption: filterOption
					})
				),
				React.createElement('div', { style: filterItemStyle },
					React.createElement('div', { style: filterLabelStyle }, '备件名称'),
					React.createElement(Select, {
						placeholder: '请输入或选择备件名称',
						style: filterControlStyle,
						value: draft.spareName,
						onChange: function (v) { setDraft(function (p) { return Object.assign({}, p, { spareName: v }); }); },
						allowClear: true,
						showSearch: true,
						options: spareNameOptions,
						filterOption: filterOption
					})
				),
				React.createElement('div', { style: filterItemStyle },
					React.createElement('div', { style: filterLabelStyle }, '适配车型'),
					React.createElement(Select, {
						mode: 'multiple',
						placeholder: '请选择型号（可多选）',
						style: filterControlStyle,
						value: draft.vehicleModels,
						onChange: function (v) { setDraft(function (p) { return Object.assign({}, p, { vehicleModels: v || [] }); }); },
						allowClear: true,
						showSearch: true,
						filterOption: filterOption,
						options: allVehicleModelOptions,
						maxTagCount: 'responsive'
					})
				)
			),
			React.createElement('div', { style: { display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 } },
				React.createElement(Button, { onClick: handleReset }, '重置'),
				React.createElement(Button, { type: 'primary', onClick: handleQuery }, '查询')
			)
		),

		React.createElement(Card, {
			title: '列表',
			bordered: false,
			style: { borderRadius: 8 },
			extra: React.createElement(Space, { wrap: true },
				React.createElement(Button, { type: 'primary', onClick: handleAdd }, '新增备件信息'),
				React.createElement(Button, { onClick: handleOpenInboundForm }, '入库'),
				React.createElement(Button, { onClick: handleOpenOutboundForm }, '领用出库'),
				React.createElement(Button, { onClick: handleDownloadImportTemplate }, '批量导入'),
				React.createElement(Button, { onClick: handleExportList }, '导出')
			)
		},
			React.createElement('style', null, tableStyle),
			React.createElement('div', { className: 'spare-stock-table' },
				React.createElement(Table, {
					rowKey: 'id',
					columns: columns,
					dataSource: paged,
					scroll: { x: 1680 },
					size: 'small',
					pagination: {
						current: page,
						pageSize: pageSize,
						total: filtered.length,
						showSizeChanger: true,
						showQuickJumper: true,
						pageSizeOptions: ['10', '20', '50', '100'],
						showTotal: function (t) { return '共 ' + t + ' 条'; },
						onChange: function (pg, ps) { setPage(pg); if (ps) setPageSize(ps); }
					}
				})
			)
		)
	);
};
