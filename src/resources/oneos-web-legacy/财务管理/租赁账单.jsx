// 【重要】必须使用 const Component 作为组件变量名
// 财务管理 - 租赁账单（基于租赁业务运营明细台账-明细表）

const Component = function () {
	var useState = React.useState;
	var useMemo = React.useMemo;
	var useCallback = React.useCallback;

	var antd = window.antd;
	var App = antd.App;
	var Breadcrumb = antd.Breadcrumb;
	var Card = antd.Card;
	var Table = antd.Table;
	var Button = antd.Button;
	var Select = antd.Select;
	var DatePicker = antd.DatePicker;
	var Space = antd.Space;
	var Tag = antd.Tag;
	var Modal = antd.Modal;
	var Row = antd.Row;
	var Col = antd.Col;
	var message = antd.message;

	var RangePicker = DatePicker.RangePicker;

	// 客户主数据（联调对接「业务管理-客户管理」）
	var CUSTOMER_MASTER = [
		{ customerCode: 'KH-2025-001', customerName: '嘉兴某某物流有限公司', region: '华东', city: '浙江省-嘉兴市' },
		{ customerCode: 'KH-2025-002', customerName: '上海某某运输公司', region: '华东', city: '上海市-上海市' },
		{ customerCode: 'KH-2025-003', customerName: '杭州某某租赁有限公司', region: '华东', city: '浙江省-杭州市' },
		{ customerCode: 'KH-2025-004', customerName: '南京某某供应链公司', region: '华东', city: '江苏省-南京市' },
		{ customerCode: 'KH-2026-101', customerName: '宁波港集装箱运输有限公司嘉兴分公司', region: '华东', city: '浙江省-嘉兴市' },
		{ customerCode: 'KH-2026-102', customerName: '嘉兴市乍浦港口经营有限公司', region: '华东', city: '浙江省-嘉兴市' },
		{ customerCode: 'KH-2026-103', customerName: '上海馨想事成物流有限公司', region: '华东', city: '上海市-上海市' },
		{ customerCode: 'KH-2026-104', customerName: '北京海龙运输有限公司', region: '华北', city: '北京市-北京市' }
	];

	// 车辆主数据（联调对接「车辆管理」；品牌/型号取自业务台账样例）
	var VEHICLE_MASTER = [
		{ plateNo: '浙F07033F', brand: '现代', model: '4.5吨货车', vehicleType: '轻型厢式货车', operateStatus: '租赁' },
		{ plateNo: '浙F06909F', brand: '现代', model: '帕力安牌4.5吨冷链车', vehicleType: '厢式货车', operateStatus: '租赁' },
		{ plateNo: '浙F39003F', brand: '现代', model: '帕力安牌18吨双飞翼货车', vehicleType: '重型厢式货车', operateStatus: '租赁' },
		{ plateNo: '沪A33198F', brand: '楚风', model: '18吨厢式货车', vehicleType: '重型厢式货车', operateStatus: '租赁' },
		{ plateNo: '浙F09038F', brand: '苏龙', model: '海格牌18吨双飞翼货车', vehicleType: '重型厢式货车', operateStatus: '租赁' },
		{ plateNo: '浙F00661F', brand: '跃进', model: '4.5吨冷链车', vehicleType: '厢式货车', operateStatus: '租赁' },
		{ plateNo: '浙F00688F', brand: '飞驰', model: '49吨牵引车头', vehicleType: '牵引车', operateStatus: '租赁' },
		{ plateNo: '浙F01115F', brand: '飞驰', model: '49吨牵引车头', vehicleType: '牵引车', operateStatus: '租赁' },
		{ plateNo: '浙F03218F', brand: '飞驰', model: '49吨牵引车头', vehicleType: '牵引车', operateStatus: '租赁' },
		{ plateNo: '粤AGP5621', brand: '现代', model: '帕力安牌4.5吨冷链车', vehicleType: '厢式货车', operateStatus: '租赁' },
		{ plateNo: '京A29256F', brand: '飞驰', model: '49吨牵引车头', vehicleType: '牵引车', operateStatus: '租赁' },
		{ plateNo: '浙F01505F', brand: '飞驰', model: '49吨牵引车头', vehicleType: '牵引车', operateStatus: '租赁' }
	];

	var listDataState = useState([
		{ key: 'b1', seq: 1, year: '2026', month: '1', businessDept: '业务一部', salesperson: '陈高伟', billDate: '2026-01-01', plateNo: '浙F07033F', customerName: '宁波港集装箱运输有限公司嘉兴分公司', pickupDate: '2025-08-27', contractStart: '2025-09-01', contractEnd: '2025-11-30', startDate: '', returnDate: '-', avgDays: '', deposit: 0, contractRent: 6696, receivableTotal: 6696, receivableRent: 6696, insuranceSurcharge: 0, opsFee: 0, otherIncome: 0, discount: 0, actualReceived: 6696, unreceived: 0, invoiceDate: '2026-01-16', paymentDate: '2026-01-27', paymentMethod: '月度后付', vehicleTargetCost: 7100, vehicleActualCost: null, insuranceFee: null, hydrogenFee: null, opsCost: null, brokerageFee: 0, otherCost: null, totalCost: 7100, profit: -404, actualProfit: null, discountDetail: '', assetOwner: '浙江氢能产业发展有限公司', policy: '', signCompany: '浙江羚牛氢能科技有限公司', remark: '' },
		{ key: 'b2', seq: 2, year: '2026', month: '1', businessDept: '业务一部', salesperson: '陈高伟', billDate: '2026-01-01', plateNo: '浙F06909F', customerName: '宁波港集装箱运输有限公司嘉兴分公司', pickupDate: '2025-08-27', contractStart: '2025-09-01', contractEnd: '2025-11-30', startDate: '', returnDate: '-', avgDays: '', deposit: 0, contractRent: 6696, receivableTotal: 6696, receivableRent: 6696, insuranceSurcharge: 0, opsFee: 0, otherIncome: 0, discount: 0, actualReceived: 6696, unreceived: 0, invoiceDate: '2026-01-16', paymentDate: '2026-01-27', paymentMethod: '月度后付', vehicleTargetCost: 7100, vehicleActualCost: null, insuranceFee: null, hydrogenFee: null, opsCost: null, brokerageFee: 0, otherCost: null, totalCost: 7100, profit: -404, actualProfit: null, discountDetail: '', assetOwner: '浙江氢能产业发展有限公司', policy: '', signCompany: '浙江羚牛氢能科技有限公司', remark: '' },
		{ key: 'b3', seq: 3, year: '2026', month: '1', businessDept: '业务一部', salesperson: '陈高伟', billDate: '2026-01-01', plateNo: '浙F39003F', customerName: '宁波港集装箱运输有限公司嘉兴分公司', pickupDate: '2025-08-27', contractStart: '2025-09-01', contractEnd: '2025-11-30', startDate: '', returnDate: '-', avgDays: '', deposit: 0, contractRent: 6696, receivableTotal: 6696, receivableRent: 6696, insuranceSurcharge: 0, opsFee: 0, otherIncome: 0, discount: 0, actualReceived: 6696, unreceived: 0, invoiceDate: '2026-01-16', paymentDate: '2026-01-27', paymentMethod: '月度后付', vehicleTargetCost: 7100, vehicleActualCost: null, insuranceFee: null, hydrogenFee: null, opsCost: null, brokerageFee: 0, otherCost: null, totalCost: 7100, profit: -404, actualProfit: null, discountDetail: '', assetOwner: '浙江氢能产业发展有限公司', policy: '', signCompany: '浙江羚牛氢能科技有限公司', remark: '' },
		{ key: 'b4', seq: 4, year: '2026', month: '1', businessDept: '业务一部', salesperson: '陈高伟', billDate: '2026-01-01', plateNo: '沪A33198F', customerName: '宁波港集装箱运输有限公司嘉兴分公司', pickupDate: '2025-08-27', contractStart: '2025-09-01', contractEnd: '2025-11-30', startDate: '', returnDate: '-', avgDays: '', deposit: 0, contractRent: 6696, receivableTotal: 6696, receivableRent: 6696, insuranceSurcharge: 0, opsFee: 0, otherIncome: 0, discount: 0, actualReceived: 6696, unreceived: 0, invoiceDate: '2026-01-16', paymentDate: '2026-01-27', paymentMethod: '月度后付', vehicleTargetCost: 7100, vehicleActualCost: null, insuranceFee: null, hydrogenFee: null, opsCost: null, brokerageFee: 0, otherCost: null, totalCost: 7100, profit: -404, actualProfit: null, discountDetail: '', assetOwner: '上海羚牛氢运物联网科技有限公司', policy: '', signCompany: '浙江羚牛氢能科技有限公司', remark: '' },
		{ key: 'b5', seq: 5, year: '2026', month: '1', businessDept: '业务一部', salesperson: '陈高伟', billDate: '2026-01-01', plateNo: '浙F09038F', customerName: '宁波港集装箱运输有限公司嘉兴分公司', pickupDate: '2025-08-27', contractStart: '2025-09-01', contractEnd: '2025-11-30', startDate: '', returnDate: '-', avgDays: '', deposit: 0, contractRent: 6696, receivableTotal: 6696, receivableRent: 6696, insuranceSurcharge: 0, opsFee: 0, otherIncome: 0, discount: 0, actualReceived: 6696, unreceived: 0, invoiceDate: '2026-01-16', paymentDate: '2026-01-27', paymentMethod: '月度后付', vehicleTargetCost: 7100, vehicleActualCost: null, insuranceFee: null, hydrogenFee: null, opsCost: null, brokerageFee: 0, otherCost: null, totalCost: 7100, profit: -404, actualProfit: null, discountDetail: '', assetOwner: '浙江氢能产业发展有限公司', policy: '', signCompany: '浙江羚牛氢能科技有限公司', remark: '' },
		{ key: 'b6', seq: 6, year: '2026', month: '1', businessDept: '业务一部', salesperson: '陈高伟', billDate: '2026-01-01', plateNo: '浙F00661F', customerName: '嘉兴市乍浦港口经营有限公司', pickupDate: '2022-12-01', contractStart: '2022-12-01', contractEnd: '2025-11-30', startDate: '', returnDate: '-', avgDays: '', deposit: 0, contractRent: 18700, receivableTotal: 18700, receivableRent: 18700, insuranceSurcharge: 0, opsFee: 0, otherIncome: 0, discount: 0, actualReceived: 18700, unreceived: 0, invoiceDate: '2026-02-11', paymentDate: '2026-02-28', paymentMethod: '月度后付', vehicleTargetCost: 7100, vehicleActualCost: null, insuranceFee: null, hydrogenFee: null, opsCost: null, brokerageFee: 0, otherCost: null, totalCost: 7100, profit: 11600, actualProfit: null, discountDetail: '', assetOwner: '嘉兴氢能产业发展股份有限公司', policy: '', signCompany: '浙江羚牛氢能科技有限公司', remark: '' },
		{ key: 'b7', seq: 7, year: '2026', month: '1', businessDept: '业务一部', salesperson: '陈高伟', billDate: '2026-01-01', plateNo: '浙F00688F', customerName: '嘉兴市乍浦港口经营有限公司', pickupDate: '2022-12-01', contractStart: '2022-12-01', contractEnd: '2025-11-30', startDate: '', returnDate: '-', avgDays: '', deposit: 0, contractRent: 18700, receivableTotal: 18700, receivableRent: 18700, insuranceSurcharge: 0, opsFee: 0, otherIncome: 0, discount: 0, actualReceived: 18700, unreceived: 0, invoiceDate: '2026-02-11', paymentDate: '2026-02-28', paymentMethod: '月度后付', vehicleTargetCost: 7100, vehicleActualCost: null, insuranceFee: null, hydrogenFee: null, opsCost: null, brokerageFee: 0, otherCost: null, totalCost: 7100, profit: 11600, actualProfit: null, discountDetail: '', assetOwner: '嘉兴氢能产业发展股份有限公司', policy: '', signCompany: '浙江羚牛氢能科技有限公司', remark: '' },
		{ key: 'b8', seq: 8, year: '2026', month: '1', businessDept: '业务一部', salesperson: '陈高伟', billDate: '2026-01-01', plateNo: '浙F01115F', customerName: '嘉兴市乍浦港口经营有限公司', pickupDate: '2022-12-01', contractStart: '2022-12-01', contractEnd: '2025-11-30', startDate: '', returnDate: '-', avgDays: '', deposit: 0, contractRent: 18700, receivableTotal: 18700, receivableRent: 18700, insuranceSurcharge: 0, opsFee: 0, otherIncome: 0, discount: 0, actualReceived: 18700, unreceived: 0, invoiceDate: '2026-02-11', paymentDate: '2026-02-28', paymentMethod: '月度后付', vehicleTargetCost: 7100, vehicleActualCost: null, insuranceFee: null, hydrogenFee: null, opsCost: null, brokerageFee: 0, otherCost: null, totalCost: 7100, profit: 11600, actualProfit: null, discountDetail: '', assetOwner: '嘉兴氢能产业发展股份有限公司', policy: '', signCompany: '浙江羚牛氢能科技有限公司', remark: '' },
		{ key: 'b9', seq: 9, year: '2026', month: '2', businessDept: '业务二部', salesperson: '董剑煜', billDate: '2026-02-01', plateNo: '浙F03218F', customerName: '上海馨想事成物流有限公司', pickupDate: '2026-01-10', contractStart: '2026-01-15', contractEnd: '2027-01-14', startDate: '', returnDate: '-', avgDays: '', deposit: 10000, contractRent: 12800, receivableTotal: 12800, receivableRent: 12000, insuranceSurcharge: 500, opsFee: 300, otherIncome: 0, discount: 0, actualReceived: 12800, unreceived: 0, invoiceDate: '2026-02-15', paymentDate: '2026-02-28', paymentMethod: '月度预付', vehicleTargetCost: 8500, vehicleActualCost: 8200, insuranceFee: 600, hydrogenFee: 1200, opsCost: 300, brokerageFee: 0, otherCost: 0, totalCost: 10300, profit: 2500, actualProfit: 2200, discountDetail: '', assetOwner: '浙江羚牛氢能科技有限公司', policy: '首月免运维费', signCompany: '浙江羚牛氢能科技有限公司', remark: '' },
		{ key: 'b10', seq: 10, year: '2026', month: '2', businessDept: '业务二部', salesperson: '赵连飞', billDate: '2026-02-01', plateNo: '粤AGP5621', customerName: '嘉兴某某物流有限公司', pickupDate: '2026-02-01', contractStart: '2026-02-01', contractEnd: '2027-01-31', startDate: '', returnDate: '-', avgDays: '', deposit: 8000, contractRent: 9800, receivableTotal: 9800, receivableRent: 9500, insuranceSurcharge: 200, opsFee: 100, otherIncome: 0, discount: 0, actualReceived: 9500, unreceived: 300, invoiceDate: '2026-02-20', paymentDate: '-', paymentMethod: '月度后付', vehicleTargetCost: 7200, vehicleActualCost: 7000, insuranceFee: 450, hydrogenFee: 800, opsCost: 150, brokerageFee: 0, otherCost: 0, totalCost: 8400, profit: 1400, actualProfit: null, discountDetail: '', assetOwner: '浙江羚牛氢能科技有限公司', policy: '', signCompany: '浙江羚牛氢能科技有限公司', remark: '部分未收' },
		{ key: 'b11', seq: 11, year: '2026', month: '2', businessDept: '业务一部', salesperson: '刘念念', billDate: '2026-02-01', plateNo: '京A29256F', customerName: '北京海龙运输有限公司', pickupDate: '2025-08-01', contractStart: '2025-08-15', contractEnd: '2026-08-14', startDate: '', returnDate: '-', avgDays: '', deposit: 15000, contractRent: 22000, receivableTotal: 22000, receivableRent: 21000, insuranceSurcharge: 600, opsFee: 400, otherIncome: 0, discount: 0, actualReceived: 22000, unreceived: 0, invoiceDate: '2026-02-10', paymentDate: '2026-02-25', paymentMethod: '季度预付', vehicleTargetCost: 12000, vehicleActualCost: 11500, insuranceFee: 900, hydrogenFee: 2500, opsCost: 400, brokerageFee: 500, otherCost: 0, totalCost: 15800, profit: 6200, actualProfit: 5800, discountDetail: '', assetOwner: '北京羚牛氢运科技有限公司', policy: '季度结算优惠', signCompany: '浙江羚牛氢能科技有限公司', remark: '' },
		{ key: 'b12', seq: 12, year: '2026', month: '2', businessDept: '业务一部', salesperson: '尚建华', billDate: '2026-02-01', plateNo: '浙F01505F', customerName: '嘉兴市乍浦港口经营有限公司', pickupDate: '2022-12-01', contractStart: '2022-12-01', contractEnd: '2025-11-30', startDate: '', returnDate: '-', avgDays: '', deposit: 0, contractRent: 18700, receivableTotal: 18700, receivableRent: 18700, insuranceSurcharge: 0, opsFee: 0, otherIncome: 0, discount: 500, actualReceived: 18200, unreceived: 0, invoiceDate: '2026-02-11', paymentDate: '2026-02-28', paymentMethod: '月度后付', vehicleTargetCost: 7100, vehicleActualCost: 7100, insuranceFee: null, hydrogenFee: null, opsCost: null, brokerageFee: 0, otherCost: null, totalCost: 7100, profit: 11600, actualProfit: 11100, discountDetail: '客户协商减免500元', assetOwner: '嘉兴氢能产业发展股份有限公司', policy: '', signCompany: '浙江羚牛氢能科技有限公司', remark: '' }
	]);
	var listData = listDataState[0];

	// 筛选草稿 / 已应用（点击查询后生效）
	var periodDraftState = useState(undefined);
	var periodDraft = periodDraftState[0];
	var setPeriodDraft = periodDraftState[1];
	var customerDraftState = useState(undefined);
	var customerDraft = customerDraftState[0];
	var setCustomerDraft = customerDraftState[1];
	var plateDraftState = useState(undefined);
	var plateDraft = plateDraftState[0];
	var setPlateDraft = plateDraftState[1];
	var salespersonDraftState = useState(undefined);
	var salespersonDraft = salespersonDraftState[0];
	var setSalespersonDraft = salespersonDraftState[1];
	var billDateDraftState = useState(null);
	var billDateDraft = billDateDraftState[0];
	var setBillDateDraft = billDateDraftState[1];
	var paymentDraftState = useState(undefined);
	var paymentDraft = paymentDraftState[0];
	var setPaymentDraft = paymentDraftState[1];

	var periodAppliedState = useState(undefined);
	var periodApplied = periodAppliedState[0];
	var setPeriodApplied = periodAppliedState[1];
	var customerAppliedState = useState(undefined);
	var customerApplied = customerAppliedState[0];
	var setCustomerApplied = customerAppliedState[1];
	var plateAppliedState = useState(undefined);
	var plateApplied = plateAppliedState[0];
	var setPlateApplied = plateAppliedState[1];
	var salespersonAppliedState = useState(undefined);
	var salespersonApplied = salespersonAppliedState[0];
	var setSalespersonApplied = salespersonAppliedState[1];
	var billDateAppliedState = useState(null);
	var billDateApplied = billDateAppliedState[0];
	var setBillDateApplied = billDateAppliedState[1];
	var paymentAppliedState = useState(undefined);
	var paymentApplied = paymentAppliedState[0];
	var setPaymentApplied = paymentAppliedState[1];

	var filterExpandedState = useState(false);
	var filterExpanded = filterExpandedState[0];
	var setFilterExpanded = filterExpandedState[1];
	var requirementModalVisible = useState(false);

	var layoutStyle = {
		padding: '16px 24px 24px',
		minHeight: '100vh',
		background: 'linear-gradient(165deg, #eef4ff 0%, #f5f7fa 42%, #f0f2f5 100%)'
	};
	var filterLabelStyle = { marginBottom: 6, fontSize: 13, color: 'rgba(0,0,0,0.55)', fontWeight: 500 };
	var filterItemStyle = { marginBottom: 12 };
	var filterControlStyle = { width: '100%' };
	var filterCardStyle = {
		marginBottom: 20,
		borderRadius: 16,
		boxShadow: '0 4px 20px -4px rgba(16,24,40,0.03), 0 0 0 1px rgba(16,24,40,0.06)',
		border: 'none',
		background: '#ffffff'
	};
	var tableCardStyle = {
		borderRadius: 16,
		boxShadow: '0 10px 32px -4px rgba(16,24,40,0.06), 0 0 0 1px rgba(16,24,40,0.04)',
		border: 'none',
		background: '#ffffff',
		overflow: 'hidden'
	};
	var ledgerTableStyle =
		'.rb-ledger-table-wrap{border-radius:12px;overflow:hidden;box-shadow:0 4px 24px -6px rgba(15,23,42,0.05),0 0 0 1px rgba(22,119,255,0.1)}' +
		'.rb-ledger-table .ant-table-thead>tr>th,.rb-ledger-table .ant-table-thead .ant-table-cell{white-space:nowrap;color:#0f172a!important;font-weight:600!important;font-size:12px!important;' +
		'background:#e8f4fc!important;border-bottom:1px solid #bae6fd!important;border-inline-end:1px solid #dbeafe!important;padding:0 6px!important;height:36px!important;text-align:center!important}' +
		'.rb-ledger-table .ant-table-tbody>tr:not(.ant-table-measure-row)>td{padding:4px 6px!important;vertical-align:middle!important;font-size:12px}' +
		'.rb-ledger-table .ant-table-tbody>tr.rb-row-data:hover>td{background:#f0f9ff!important}' +
		'.rb-ledger-totals-bar{display:flex;align-items:stretch;gap:0;margin-bottom:10px;border:1px solid #bae6fd;border-radius:10px;overflow:hidden;background:#f8fafc;box-shadow:0 1px 0 rgba(15,23,42,0.04)}' +
		'.rb-ledger-totals-bar__title{display:flex;align-items:center;justify-content:center;min-width:72px;padding:10px 14px;font-size:14px;font-weight:700;color:#0f172a;background:#e8f4fc;border-right:1px solid #bae6fd}' +
		'.rb-ledger-totals-bar__items{display:flex;flex:1;flex-wrap:wrap}' +
		'.rb-ledger-totals-bar__item{flex:1;min-width:140px;padding:8px 20px;border-right:1px solid #e2e8f0;display:flex;flex-direction:column;justify-content:center;gap:4px}' +
		'.rb-ledger-totals-bar__item:last-child{border-right:none}' +
		'.rb-ledger-totals-bar__label{font-size:12px;color:rgba(15,23,42,0.55);font-weight:500;line-height:1.2}' +
		'.rb-ledger-totals-bar__value{font-size:16px;font-weight:700;color:#0f172a;font-variant-numeric:tabular-nums;line-height:1.3}' +
		'.rb-ledger-totals-bar__value.is-profit-pos{color:#389e0d}' +
		'.rb-ledger-totals-bar__value.is-profit-neg{color:#cf1322}';

	var customerOptions = useMemo(function () {
		return CUSTOMER_MASTER.map(function (c) {
			return { value: c.customerName, label: c.customerName + '（' + c.customerCode + '）' };
		});
	}, []);

	var plateOptions = useMemo(function () {
		return VEHICLE_MASTER.map(function (v) {
			return { value: v.plateNo, label: v.plateNo + ' · ' + (v.brand || '') + ' · ' + (v.model || '') };
		});
	}, []);

	var vehicleByPlate = useMemo(function () {
		var map = {};
		VEHICLE_MASTER.forEach(function (v) { map[v.plateNo] = v; });
		return map;
	}, []);

	function fmtYearMonth(year, month) {
		if (!year) return '';
		var m = String(month || '');
		if (m.length === 1) m = '0' + m;
		return year + '-' + m;
	}

	var periodOptions = useMemo(function () {
		var set = {};
		listData.forEach(function (r) {
			var p = fmtYearMonth(r.year, r.month);
			if (p) set[p] = true;
		});
		return Object.keys(set).sort().reverse().map(function (v) { return { value: v, label: v }; });
	}, [listData]);

	var salespersonOptions = useMemo(function () {
		var map = {};
		listData.forEach(function (r) {
			if (!r.salesperson) return;
			var key = r.salesperson;
			if (!map[key]) map[key] = r.businessDept || '';
		});
		return Object.keys(map).map(function (v) {
			var dept = map[v];
			return { value: v, label: dept ? dept + ' · ' + v : v };
		});
	}, [listData]);

	var paymentMethodOptions = useMemo(function () {
		var set = {};
		listData.forEach(function (r) { if (r.paymentMethod) set[r.paymentMethod] = true; });
		return Object.keys(set).map(function (v) { return { value: v, label: v }; });
	}, [listData]);

	function inDateRange(dateStr, range) {
		if (!range || !range[0] || !range[1]) return true;
		var s = new Date(String(range[0]).replace(/-/g, '/'));
		var e = new Date(String(range[1]).replace(/-/g, '/'));
		var d = new Date(String(dateStr || '').replace(/-/g, '/'));
		if (isNaN(s.getTime()) || isNaN(e.getTime()) || isNaN(d.getTime())) return true;
		var ms = d.getTime();
		return ms >= s.getTime() && ms <= (e.getTime() + 24 * 60 * 60 * 1000 - 1);
	}

	var filteredList = useMemo(function () {
		return listData.filter(function (r) {
			if (periodApplied && fmtYearMonth(r.year, r.month) !== periodApplied) return false;
			if (salespersonApplied && r.salesperson !== salespersonApplied) return false;
			if (customerApplied && r.customerName !== customerApplied) return false;
			if (plateApplied && r.plateNo !== plateApplied) return false;
			if (paymentApplied && r.paymentMethod !== paymentApplied) return false;
			if (!inDateRange(r.billDate, billDateApplied)) return false;
			return true;
		});
	}, [listData, periodApplied, salespersonApplied, customerApplied, plateApplied, paymentApplied, billDateApplied]);

	var totals = useMemo(function () {
		var fields = ['receivableTotal', 'actualReceived', 'unreceived', 'totalCost', 'profit'];
		var result = { receivableTotal: 0, actualReceived: 0, unreceived: 0, totalCost: 0, profit: 0 };
		filteredList.forEach(function (r) {
			fields.forEach(function (f) {
				var n = parseFloat(r[f]);
				if (!isNaN(n)) result[f] += n;
			});
		});
		return result;
	}, [filteredList]);

	function fmtMoney(v) {
		if (v === null || v === undefined || v === '') return '—';
		var n = typeof v === 'number' ? v : parseFloat(v);
		if (isNaN(n)) return '—';
		return n.toFixed(2);
	}

	function fmtDate(v) {
		if (!v || v === '-') return '—';
		return String(v).slice(0, 10);
	}

	function getMonthLastDay(year, month) {
		var y = parseInt(year, 10);
		var m = parseInt(month, 10);
		if (isNaN(y) || isNaN(m)) return '';
		var last = new Date(y, m, 0).getDate();
		var mm = m < 10 ? '0' + m : String(m);
		var dd = last < 10 ? '0' + last : String(last);
		return y + '-' + mm + '-' + dd;
	}

	function renderBillDateRange(_, record) {
		var start = fmtDate(record.startDate || record.billDate);
		var end = fmtDate(record.billDateEnd || getMonthLastDay(record.year, record.month));
		if (start === '—' && end === '—') return '—';
		return React.createElement('div', { style: { lineHeight: 1.35 } },
			React.createElement('div', null, start),
			React.createElement('div', { style: { fontSize: 11, color: '#64748b' } }, '至'),
			React.createElement('div', null, end)
		);
	}

	function renderProfit(v) {
		if (v === null || v === undefined || v === '') return '—';
		var n = typeof v === 'number' ? v : parseFloat(v);
		if (isNaN(n)) return '—';
		var color = n > 0 ? '#389e0d' : n < 0 ? '#cf1322' : '#666';
		return React.createElement('span', { style: { color: color, fontWeight: 600 } }, n.toFixed(2));
	}

	function filterOption(input, option) {
		var label = (option && (option.label || option.children)) || '';
		return String(label).toLowerCase().indexOf(String(input || '').toLowerCase()) >= 0;
	}

	var handleQuery = useCallback(function () {
		setPeriodApplied(periodDraft);
		setCustomerApplied(customerDraft);
		setPlateApplied(plateDraft);
		setSalespersonApplied(salespersonDraft);
		setBillDateApplied(billDateDraft);
		setPaymentApplied(paymentDraft);
		message.success('查询成功');
	}, [periodDraft, customerDraft, plateDraft, salespersonDraft, billDateDraft, paymentDraft]);

	var handleReset = useCallback(function () {
		setPeriodDraft(undefined);
		setCustomerDraft(undefined);
		setPlateDraft(undefined);
		setSalespersonDraft(undefined);
		setBillDateDraft(null);
		setPaymentDraft(undefined);
		setPeriodApplied(undefined);
		setCustomerApplied(undefined);
		setPlateApplied(undefined);
		setSalespersonApplied(undefined);
		setBillDateApplied(null);
		setPaymentApplied(undefined);
	}, []);

	function handleExport() {
		message.success('租赁账单导出任务已提交（原型）');
	}

	var columns = [
		{ title: '序号', dataIndex: 'seq', key: 'seq', width: 56, fixed: 'left', align: 'center' },
		{
			title: '月份',
			key: 'yearMonth',
			width: 88,
			fixed: 'left',
			align: 'center',
			render: function (_, record) {
				var v = fmtYearMonth(record.year, record.month);
				return v || '—';
			}
		},
		{
			title: '业务员',
			key: 'salesperson',
			width: 96,
			align: 'center',
			render: function (_, record) {
				return React.createElement('div', { style: { lineHeight: 1.3 } },
					React.createElement('div', { style: { fontWeight: 500 } }, record.businessDept || '—'),
					React.createElement('div', { style: { fontSize: 11, color: '#64748b' } }, record.salesperson || '—')
				);
			}
		},
		{ title: '账单日期', key: 'billDate', width: 112, align: 'center', render: renderBillDateRange },
		{
			title: '车牌号码',
			dataIndex: 'plateNo',
			key: 'plateNo',
			width: 148,
			align: 'center',
			render: function (v) {
				if (!v) return '—';
				var veh = vehicleByPlate[v];
				return React.createElement('div', { style: { lineHeight: 1.35 } },
					React.createElement('div', { style: { fontWeight: 600 } }, v),
					veh ? React.createElement(React.Fragment, null,
						React.createElement('div', { style: { fontSize: 11, color: '#64748b' } }, veh.brand || '—'),
						React.createElement('div', { style: { fontSize: 11, color: '#64748b' } }, veh.model || '—')
					) : null
				);
			}
		},
		{ title: '客户名称', dataIndex: 'customerName', key: 'customerName', width: 200, ellipsis: true },
		{ title: '提车日期', dataIndex: 'pickupDate', key: 'pickupDate', width: 108, align: 'center', render: fmtDate },
		{ title: '合同生效日期', dataIndex: 'contractStart', key: 'contractStart', width: 118, align: 'center', render: fmtDate },
		{ title: '合同到期日期', dataIndex: 'contractEnd', key: 'contractEnd', width: 118, align: 'center', render: fmtDate },
		{ title: '起始日期', dataIndex: 'startDate', key: 'startDate', width: 108, align: 'center', render: fmtDate },
		{ title: '退车日期', dataIndex: 'returnDate', key: 'returnDate', width: 108, align: 'center', render: function (v) { return v || '—'; } },
		{ title: '平均天数', dataIndex: 'avgDays', key: 'avgDays', width: 80, align: 'center', render: function (v) { return v || '—'; } },
		{ title: '押金', dataIndex: 'deposit', key: 'deposit', width: 88, align: 'right', render: fmtMoney },
		{ title: '合同标的租金', dataIndex: 'contractRent', key: 'contractRent', width: 108, align: 'right', render: fmtMoney },
		{ title: '应收合计', dataIndex: 'receivableTotal', key: 'receivableTotal', width: 96, align: 'right', render: fmtMoney },
		{ title: '应收租金', dataIndex: 'receivableRent', key: 'receivableRent', width: 96, align: 'right', render: fmtMoney },
		{ title: '保险上浮费', dataIndex: 'insuranceSurcharge', key: 'insuranceSurcharge', width: 96, align: 'right', render: fmtMoney },
		{ title: '运维费', dataIndex: 'opsFee', key: 'opsFee', width: 80, align: 'right', render: fmtMoney },
		{ title: '其他收入', dataIndex: 'otherIncome', key: 'otherIncome', width: 88, align: 'right', render: fmtMoney },
		{ title: '减免金额', dataIndex: 'discount', key: 'discount', width: 88, align: 'right', render: fmtMoney },
		{ title: '实收金额', dataIndex: 'actualReceived', key: 'actualReceived', width: 96, align: 'right', render: fmtMoney },
		{
			title: '未收',
			dataIndex: 'unreceived',
			key: 'unreceived',
			width: 88,
			align: 'right',
			render: function (v) {
				var n = parseFloat(v);
				if (isNaN(n) || n === 0) return fmtMoney(v);
				return React.createElement(Tag, { color: 'error', style: { margin: 0 } }, fmtMoney(v));
			}
		},
		{ title: '开票日期', dataIndex: 'invoiceDate', key: 'invoiceDate', width: 108, align: 'center', render: fmtDate },
		{ title: '实际付款日期', dataIndex: 'paymentDate', key: 'paymentDate', width: 118, align: 'center', render: fmtDate },
		{ title: '付款方式', dataIndex: 'paymentMethod', key: 'paymentMethod', width: 96, align: 'center' },
		{ title: '车辆标的成本', dataIndex: 'vehicleTargetCost', key: 'vehicleTargetCost', width: 108, align: 'right', render: fmtMoney },
		{ title: '车辆实际成本', dataIndex: 'vehicleActualCost', key: 'vehicleActualCost', width: 108, align: 'right', render: fmtMoney },
		{ title: '保险费', dataIndex: 'insuranceFee', key: 'insuranceFee', width: 80, align: 'right', render: fmtMoney },
		{ title: '氢费', dataIndex: 'hydrogenFee', key: 'hydrogenFee', width: 80, align: 'right', render: fmtMoney },
		{ title: '运维费(成本)', dataIndex: 'opsCost', key: 'opsCost', width: 100, align: 'right', render: fmtMoney },
		{ title: '居间费', dataIndex: 'brokerageFee', key: 'brokerageFee', width: 80, align: 'right', render: fmtMoney },
		{ title: '其他', dataIndex: 'otherCost', key: 'otherCost', width: 80, align: 'right', render: fmtMoney },
		{ title: '总成本', dataIndex: 'totalCost', key: 'totalCost', width: 96, align: 'right', render: fmtMoney },
		{ title: '盈亏', dataIndex: 'profit', key: 'profit', width: 88, align: 'right', render: renderProfit },
		{ title: '实际盈亏', dataIndex: 'actualProfit', key: 'actualProfit', width: 96, align: 'right', render: renderProfit },
		{ title: '减免金额明细', dataIndex: 'discountDetail', key: 'discountDetail', width: 140, ellipsis: true, render: function (v) { return v || '—'; } },
		{ title: '资产归属', dataIndex: 'assetOwner', key: 'assetOwner', width: 180, ellipsis: true },
		{ title: '享免政策及增值服务', dataIndex: 'policy', key: 'policy', width: 140, ellipsis: true, render: function (v) { return v || '—'; } },
		{ title: '签约公司', dataIndex: 'signCompany', key: 'signCompany', width: 180, ellipsis: true },
		{ title: '备注', dataIndex: 'remark', key: 'remark', width: 120, ellipsis: true, render: function (v) { return v || '—'; } }
	];

	var renderTotalsBar = useCallback(function () {
		var profitCls = 'rb-ledger-totals-bar__value';
		if (totals.profit > 0) profitCls += ' is-profit-pos';
		else if (totals.profit < 0) profitCls += ' is-profit-neg';
		var items = [
			{ key: 'receivableTotal', label: '应收合计(元)', value: fmtMoney(totals.receivableTotal) },
			{ key: 'actualReceived', label: '实收金额(元)', value: fmtMoney(totals.actualReceived) },
			{ key: 'unreceived', label: '未收(元)', value: fmtMoney(totals.unreceived) },
			{ key: 'totalCost', label: '总成本(元)', value: fmtMoney(totals.totalCost) },
			{ key: 'profit', label: '盈亏(元)', value: fmtMoney(totals.profit), valueClass: profitCls }
		];
		return React.createElement('div', { className: 'rb-ledger-totals-bar' },
			React.createElement('div', { className: 'rb-ledger-totals-bar__title' }, '合计'),
			React.createElement('div', { className: 'rb-ledger-totals-bar__items' },
				items.map(function (item) {
					return React.createElement('div', { key: item.key, className: 'rb-ledger-totals-bar__item' },
						React.createElement('div', { className: 'rb-ledger-totals-bar__label' }, item.label),
						React.createElement('div', { className: item.valueClass || 'rb-ledger-totals-bar__value' }, item.value)
					);
				})
			)
		);
	}, [totals]);

	var requirementContent = '租赁账单（2026年6月版本）\n一个「数字化资产ONEOS运管平台」中的「财务管理」「租赁账单」模块\n#面包屑：财务管理-租赁账单；\n\n页面基于「租赁业务运营明细台账-明细表」字段设计，交互与视觉参照「台账数据-车辆氢费明细」。\n\n1.筛选：修改条件后点击「查询」生效；\n1.1.客户名称：选项取自系统「客户管理」；\n1.2.车牌号码：选项取自系统「车辆管理」；\n\n2.列表：顶部合计条展示应收、实收、未收、总成本、盈亏；\n#右上角支持导出；';

	var filterColProps = { xs: 24, sm: 12, lg: 6 };
	var filterActions = React.createElement(Space, { wrap: true, style: { justifyContent: 'flex-end', width: '100%' } },
		React.createElement(Button, { type: 'link', style: { padding: '4px 0' }, onClick: function () { setFilterExpanded(!filterExpanded); } }, filterExpanded ? '收起' : '展开'),
		React.createElement(Button, { onClick: handleReset }, '重置'),
		React.createElement(Button, { type: 'primary', onClick: handleQuery }, '查询')
	);

	return React.createElement(App, null,
		React.createElement('style', null, ledgerTableStyle),
		React.createElement('div', { style: layoutStyle },
			React.createElement('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, gap: 16 } },
				React.createElement(Breadcrumb, { items: [{ title: '财务管理' }, { title: '租赁账单' }] }),
				React.createElement(Button, { type: 'link', style: { padding: 0, flexShrink: 0, fontSize: 14 }, onClick: function () { requirementModalVisible[1](true); } }, '查看需求说明')
			),

			React.createElement(Card, { style: filterCardStyle, bodyStyle: { paddingBottom: 4 } },
				React.createElement(Row, { gutter: [16, 0], align: 'bottom' },
					React.createElement(Col, filterColProps,
						React.createElement('div', { style: filterItemStyle },
							React.createElement('div', { style: filterLabelStyle }, '月份'),
							React.createElement(Select, { placeholder: '全部', allowClear: true, style: filterControlStyle, value: periodDraft, onChange: setPeriodDraft, options: periodOptions })
						)
					),
					React.createElement(Col, filterColProps,
						React.createElement('div', { style: filterItemStyle },
							React.createElement('div', { style: filterLabelStyle }, filterExpanded ? '客户名称' : '\u00a0'),
							filterExpanded
								? React.createElement(Select, { placeholder: '全部', allowClear: true, showSearch: true, style: filterControlStyle, value: customerDraft, onChange: setCustomerDraft, options: customerOptions, filterOption: filterOption })
								: React.createElement('div', { style: { textAlign: 'right' } }, filterActions)
						)
					),
					filterExpanded ? React.createElement(Col, filterColProps,
						React.createElement('div', { style: filterItemStyle },
							React.createElement('div', { style: filterLabelStyle }, '车牌号码'),
							React.createElement(Select, { placeholder: '全部', allowClear: true, showSearch: true, style: filterControlStyle, value: plateDraft, onChange: setPlateDraft, options: plateOptions, filterOption: filterOption })
						)
					) : null
				),
				filterExpanded ? [
					React.createElement(Row, { key: 'filter-row-2', gutter: [16, 0], align: 'top' },
						React.createElement(Col, filterColProps,
							React.createElement('div', { style: filterItemStyle },
								React.createElement('div', { style: filterLabelStyle }, '业务员'),
								React.createElement(Select, { placeholder: '全部', allowClear: true, showSearch: true, style: filterControlStyle, value: salespersonDraft, onChange: setSalespersonDraft, options: salespersonOptions, filterOption: filterOption })
							)
						),
						React.createElement(Col, filterColProps,
							React.createElement('div', { style: filterItemStyle },
								React.createElement('div', { style: filterLabelStyle }, '账单日期'),
								React.createElement(RangePicker, { style: filterControlStyle, value: billDateDraft, onChange: setBillDateDraft, format: 'YYYY-MM-DD', separator: '至' })
							)
						),
						React.createElement(Col, filterColProps,
							React.createElement('div', { style: filterItemStyle },
								React.createElement('div', { style: filterLabelStyle }, '付款方式'),
								React.createElement(Select, { placeholder: '全部', allowClear: true, style: filterControlStyle, value: paymentDraft, onChange: setPaymentDraft, options: paymentMethodOptions })
							)
						)
					),
					React.createElement(Row, { key: 'filter-actions', justify: 'end', style: { marginTop: -4 } },
						React.createElement(Col, { span: 24 },
							React.createElement('div', { style: { textAlign: 'right', marginBottom: 4 } }, filterActions)
						)
					)
				] : null
			),

			React.createElement(Card, { style: tableCardStyle, bodyStyle: { padding: '20px 20px 24px' } },
				React.createElement('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, minHeight: 36, gap: 12 } },
					React.createElement('span', { style: { fontSize: 13, color: 'rgba(15,23,42,0.55)' } }, '共 ' + filteredList.length + ' 条'),
					React.createElement('div', { style: { flex: 1, textAlign: 'center', fontSize: 18, fontWeight: 700, color: 'rgba(15,23,42,0.92)' } }, '租赁账单'),
					React.createElement(Space, { size: 8 },
						React.createElement(Button, { onClick: handleExport }, '导出')
					)
				),
				renderTotalsBar(),
				React.createElement('div', { className: 'rb-ledger-table-wrap' },
					React.createElement(Table, {
						className: 'rb-ledger-table',
						rowKey: 'key',
						columns: columns,
						dataSource: filteredList,
						size: 'small',
						bordered: true,
						rowClassName: function () { return 'rb-row-data'; },
						pagination: { pageSize: 20, showSizeChanger: true, showTotal: function (t) { return '共 ' + t + ' 条'; } },
						scroll: { x: 'max-content', y: filterExpanded ? 'calc(100vh - 524px)' : 'calc(100vh - 464px)' },
						sticky: true
					})
				)
			),

			React.createElement(Modal, {
				title: '需求说明',
				open: requirementModalVisible[0],
				onCancel: function () { requirementModalVisible[1](false); },
				width: 720,
				footer: React.createElement(Button, { onClick: function () { requirementModalVisible[1](false); } }, '关闭'),
				bodyStyle: { maxHeight: '70vh', overflow: 'auto' }
			}, React.createElement('div', { style: { whiteSpace: 'pre-wrap', fontSize: 13, lineHeight: 1.6 } }, requirementContent))
		)
	);
};

export default Component;
