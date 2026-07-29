// 【重要】必须使用 const Component 作为组件变量名
// 业务管理 - 车辆租赁合同 - 新增车辆（与查看合同页布局一致，仅新增车辆信息卡片可编辑）

const Component = function() {
	var useState = React.useState;
	var useCallback = React.useCallback;
	var antd = window.antd;
	var Select = antd.Select;
	var Input = antd.Input;
	var Button = antd.Button;
	var Table = antd.Table;
	var DatePicker = antd.DatePicker;
	var message = antd.message;
	var Option = Select.Option;

	var cc1State = React.useState(false);
	var cc1 = cc1State[0];
	var setCc1 = cc1State[1];
	var cc1bState = React.useState(false);
	var cc1b = cc1bState[0];
	var setCc1b = cc1bState[1];
	var cc2State = React.useState(false);
	var cc2 = cc2State[0];
	var setCc2 = cc2State[1];
	var cc3State = React.useState(false);
	var cc3 = cc3State[0];
	var setCc3 = cc3State[1];
	var cc4State = React.useState(false);
	var cc4 = cc4State[0];
	var setCc4 = cc4State[1];
	var cc5State = React.useState(false);
	var cc5 = cc5State[0];
	var setCc5 = cc5State[1];
	var cc6State = React.useState(false);
	var cc6 = cc6State[0];
	var setCc6 = cc6State[1];
	var cc7State = React.useState(false);
	var cc7 = cc7State[0];
	var setCc7 = cc7State[1];
	var cc8State = React.useState(false);
	var cc8 = cc8State[0];
	var setCc8 = cc8State[1];
	var cc9State = React.useState(false);
	var cc9 = cc9State[0];
	var setCc9 = cc9State[1];

	var reqSpecState = React.useState(false);
	var reqSpecOpen = reqSpecState[0];
	var setReqSpecOpen = reqSpecState[1];
	var cancelConfirmState = React.useState(false);
	var cancelConfirmOpen = cancelConfirmState[0];
	var setCancelConfirmOpen = cancelConfirmState[1];
	var editedState = React.useState(false);
	var edited = editedState[0];
	var setEdited = editedState[1];

	var emptyNewRow = { brand: '', model: '', plateNo: '', vin: '', monthRent: '', serviceItems: [{ project: '', fee: '', effectiveDate: '' }], deposit: '', remark: '' };
	var _newVehicleRows = useState([Object.assign({}, emptyNewRow)]);
	var newVehicleRows = _newVehicleRows[0];
	var setNewVehicleRows = _newVehicleRows[1];
	var _newVehicleContractOriginals = useState([]);
	var newVehicleContractOriginals = _newVehicleContractOriginals[0];
	var setNewVehicleContractOriginals = _newVehicleContractOriginals[1];
	var newVehicleContractInputRef = React.useRef(null);
	var _serviceModalRowIndex = useState(null);
	var serviceModalRowIndex = _serviceModalRowIndex[0];
	var setServiceModalRowIndex = _serviceModalRowIndex[1];

	var brandList = ['品牌A', '品牌B', '品牌C', '品牌D'];
	var serviceItemOptions = ['代处理费用', '罚款', '违章处理违约金', '未参加安全培训', '车辆出险', '年检年审违约', '停车费', '设备损坏金（包含易损件）', '清洗费', '上门收车人工费', '上门收车送车行驶费', '上门收车基础服务费', '保险上浮', '保养费用', '补办驾驶证', '补办牌照', '补办营运证', '补办加氢证', '借用备用钥匙', '补配钥匙', '租金', '氢气费-客', '退还车氢量差', '能源费补缴', '能源费退款', '送车上门人工费', '送车上门送车行驶费', '送车上门基础服务费', '保证金', '氢气预付费', '维修费用', 'ETC-客', 'ETC卡缺损费', 'ETC设备缺损费', '电费-客', '未结算保养费', '未结算维修费', '车损费', '工具损坏或丢失费', '证件费', '广告损坏费', '送车服务费', '接车服务费', '补办行驶证', '超赔险', '轮胎磨损费', '无忧包', '轮胎保', '养护保', '尾板'];
	var modelByBrand = { '品牌A': ['型号A1', '型号A2', '型号A3'], '品牌B': ['型号B1', '型号B2'], '品牌C': ['型号C1', '型号C2'], '品牌D': ['型号D1'] };
	var plateNoOptions = ['浙A10001', '浙A10002', '浙B20001', '浙B20002', '浙C30001', '浙C30002', '沪D40001', '沪D40002', '苏E50001', '苏E50002', '京F60001', '京F60002'].map(function(p) { return { value: p, label: p }; });

	var vehicleList = [
		{ plateNo: '浙A10001', vin: 'L1234567890ABCDEF', brand: '品牌A', model: '型号A1' },
		{ plateNo: '浙B20002', vin: 'L2234567890ABCDEF', brand: '品牌A', model: '型号A2' },
		{ plateNo: '沪D40001', vin: 'L3234567890ABCDEF', brand: '品牌B', model: '型号B1' }
	];

	var addNewVehicleRow = useCallback(function() {
		setEdited(true);
		setNewVehicleRows(function(prev) { return prev.concat([{ brand: '', model: '', plateNo: '', vin: '', monthRent: '', serviceItems: [{ project: '', fee: '', effectiveDate: '' }], deposit: '', remark: '' }]); });
	}, []);
	var removeNewVehicleRow = useCallback(function(index) {
		setEdited(true);
		setNewVehicleRows(function(prev) {
			var next = prev.slice();
			next.splice(index, 1);
			if (next.length === 0) next = [{ brand: '', model: '', plateNo: '', vin: '', monthRent: '', serviceItems: [{ project: '', fee: '', effectiveDate: '' }], deposit: '', remark: '' }];
			return next;
		});
	}, []);
	var copyNewVehicleRow = useCallback(function(index) {
		setEdited(true);
		var row = newVehicleRows[index];
		if (!row) return;
		var serviceItemsCopy = (row.serviceItems || []).map(function(si) { return { project: si.project || '', fee: si.fee || '', effectiveDate: si.effectiveDate || '' }; });
		if (serviceItemsCopy.length === 0) serviceItemsCopy = [{ project: '', fee: '', effectiveDate: '' }];
		var newRow = { brand: row.brand || '', model: row.model || '', plateNo: '', vin: '', monthRent: row.monthRent || '', serviceItems: serviceItemsCopy, deposit: row.deposit || '', remark: row.remark || '' };
		setNewVehicleRows(function(prev) {
			var next = prev.slice();
			next.splice(index + 1, 0, newRow);
			return next;
		});
		message.success('已复制该行（车牌号已清空）');
	}, [newVehicleRows]);
	var updateNewVehicleRow = useCallback(function(index, field, value) {
		setEdited(true);
		setNewVehicleRows(function(prev) {
			var next = prev.slice();
			var row = next[index] || emptyNewRow;
			var o = {};
			o[field] = value;
			if (field === 'brand') o.model = '';
			if (field === 'plateNo') {
				var v = null;
				for (var vi = 0; vi < vehicleList.length; vi++) {
					if (vehicleList[vi].plateNo === value) { v = vehicleList[vi]; break; }
				}
				if (v) {
					o.vin = v.vin || '';
					if ((!row.brand && !row.model) && (v.brand || v.model)) {
						o.brand = v.brand || '';
						o.model = v.model || '';
					}
				} else {
					o.vin = '';
				}
			}
			next[index] = Object.assign({}, row, o);
			return next;
		});
	}, []);

	var calcRowServiceFee = function(row) {
		var sum = 0;
		for (var i = 0; i < (row.serviceItems || []).length; i++) {
			var fee = parseFloat(row.serviceItems[i].fee);
			if (!isNaN(fee)) sum += fee;
		}
		return sum.toFixed(2);
	};
	var openServiceModal = function(index) { setServiceModalRowIndex(index); };
	var closeServiceModal = function() { setServiceModalRowIndex(null); };
	var addServiceItem = function() {
		if (serviceModalRowIndex === null) return;
		setEdited(true);
		var next = newVehicleRows.slice();
		var row = next[serviceModalRowIndex];
		var items = (row.serviceItems || []).concat([{ project: '', fee: '', effectiveDate: '' }]);
		var newRow = {};
		for (var k in row) { if (row.hasOwnProperty(k) && k !== 'serviceItems') newRow[k] = row[k]; }
		newRow.serviceItems = items;
		next[serviceModalRowIndex] = newRow;
		setNewVehicleRows(next);
	};
	var removeServiceItem = function(siIndex) {
		if (serviceModalRowIndex === null) return;
		setEdited(true);
		var next = newVehicleRows.slice();
		var row = next[serviceModalRowIndex];
		var items = (row.serviceItems || []).slice();
		items.splice(siIndex, 1);
		if (items.length === 0) items = [{ project: '', fee: '', effectiveDate: '' }];
		var newRow = {};
		for (var k in row) { if (row.hasOwnProperty(k) && k !== 'serviceItems') newRow[k] = row[k]; }
		newRow.serviceItems = items;
		next[serviceModalRowIndex] = newRow;
		setNewVehicleRows(next);
	};
	var updateServiceItem = function(siIndex, field, value) {
		if (serviceModalRowIndex === null) return;
		setEdited(true);
		var next = newVehicleRows.slice();
		var row = next[serviceModalRowIndex];
		var items = (row.serviceItems || []).slice();
		var item = items[siIndex] || {};
		var newItem = {};
		for (var k in item) { if (item.hasOwnProperty(k)) newItem[k] = item[k]; }
		newItem[field] = value;
		items[siIndex] = newItem;
		var newRow = {};
		for (var rk in row) { if (row.hasOwnProperty(rk) && rk !== 'serviceItems') newRow[rk] = row[rk]; }
		newRow.serviceItems = items;
		next[serviceModalRowIndex] = newRow;
		setNewVehicleRows(next);
	};
	var newOrderSummary = (function() {
		var count = newVehicleRows.length;
		var rentService = 0;
		var depositTotal = 0;
		for (var i = 0; i < newVehicleRows.length; i++) {
			rentService += parseFloat(newVehicleRows[i].monthRent) || 0;
			rentService += parseFloat(calcRowServiceFee(newVehicleRows[i])) || 0;
			depositTotal += parseFloat(newVehicleRows[i].deposit) || 0;
		}
		return { vehicleCount: count, totalRentService: rentService.toFixed(2), totalDeposit: depositTotal.toFixed(2) };
	})();

	var scrollToCard = function(id) {
		var el = document.getElementById(id);
		if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
	};

	var styles = {
		page: { padding: '16px 24px 48px', backgroundColor: '#f5f5f5', minHeight: '100vh', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', fontSize: 14 },
		breadcrumb: { marginBottom: 16, color: '#666' },
		breadcrumbSep: { margin: '0 8px', color: '#999' },
		anchorWrap: { position: 'fixed', top: 80, right: 24, zIndex: 100, backgroundColor: '#fff', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.12)', padding: '12px 16px', minWidth: 160 },
		anchorItem: { display: 'block', padding: '6px 0', color: '#1890ff', cursor: 'pointer', border: 'none', background: 'none', width: '100%', textAlign: 'left', fontSize: 13 },
		card: { backgroundColor: '#fff', borderRadius: 8, marginBottom: 16, boxShadow: '0 1px 2px rgba(0,0,0,0.05)', overflow: 'hidden' },
		cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid #f0f0f0', cursor: 'pointer' },
		cardTitle: { fontSize: 16, fontWeight: 600, color: '#333' },
		cardToggle: { color: '#999', fontSize: 14 },
		cardBody: { padding: '20px 24px' },
		formRow: { display: 'flex', flexWrap: 'wrap', marginBottom: 16 },
		formCol: { flex: '0 0 33.33%', minWidth: 200, paddingRight: 16, marginBottom: 8 },
		formColFull: { flex: '0 0 100%', marginBottom: 8 },
		label: { display: 'block', marginBottom: 6, color: '#333' },
		input: { width: '100%', padding: '8px 12px', border: '1px solid #d9d9d9', borderRadius: 4, fontSize: 14 },
		inputDisabled: { backgroundColor: '#f5f5f5', color: '#666', cursor: 'default', borderColor: '#e8e8e8' },
		summaryList: { marginBottom: 16, display: 'flex', flexWrap: 'wrap', gap: 16 },
		summaryListItem: { flex: '0 0 calc(50% - 8px)', display: 'flex', alignItems: 'center', padding: '12px 16px', border: '1px solid #e8e8e8', borderRadius: 4, backgroundColor: '#fafafa', fontSize: 14, boxSizing: 'border-box' },
		summaryListLabel: { flex: '0 0 140px', color: '#666' },
		summaryListValue: { flex: 1, fontWeight: 600, color: '#333' },
		rentalTable: { width: '100%', borderCollapse: 'collapse', fontSize: 13 },
		rentalTh: { padding: '10px 8px', textAlign: 'left', borderBottom: '1px solid #e8e8e8', backgroundColor: '#fafafa', fontWeight: 600 },
		rentalTd: { padding: '8px', borderBottom: '1px solid #f0f0f0', verticalAlign: 'middle' },
		rentalInputDisabled: { backgroundColor: '#f5f5f5', color: '#666', border: '1px solid #e8e8e8', padding: '6px 10px', borderRadius: 4, width: '100%', fontSize: 13 },
		historyLink: { color: '#1890ff', cursor: 'pointer', background: 'none', border: 'none', padding: 0, fontSize: 14 },
		footer: { position: 'fixed', bottom: 0, left: 0, right: 0, padding: '12px 24px', backgroundColor: '#fff', borderTop: '1px solid #e8e8e8', display: 'flex', gap: 12, justifyContent: 'flex-start', zIndex: 99 },
		btn: { padding: '8px 24px', borderRadius: 4, border: '1px solid #d9d9d9', cursor: 'pointer', fontSize: 14 },
		btnDefault: { backgroundColor: '#fff', color: '#333' },
		btnPrimary: { backgroundColor: '#1890ff', color: '#fff', borderColor: '#1890ff' },
		feeSectionTitle: { fontSize: 15, fontWeight: 600, color: '#333', marginTop: 20, marginBottom: 10 },
		feeSectionTitleFirst: { marginTop: 0 },
		sectionTitle: { fontSize: 15, fontWeight: 600, color: '#333', marginBottom: 12 },
		modalMask: { position: 'fixed', left: 0, top: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.45)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' },
		modalBox: { backgroundColor: '#fff', borderRadius: 8, width: '90%', maxWidth: 720, maxHeight: '85vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 4px 20px rgba(0,0,0,0.15)' },
		modalHeader: { padding: '16px 20px', borderBottom: '1px solid #f0f0f0', fontSize: 16, fontWeight: 600 },
		modalBody: { padding: 20, overflow: 'auto', flex: 1 },
		rentalTdCenter: { padding: '8px', borderBottom: '1px solid #f0f0f0', verticalAlign: 'middle' }
	};

	var CardBlock = function(props) {
		return React.createElement('div', { id: props.id, style: styles.card },
			React.createElement('div', { style: styles.cardHeader, onClick: function() { props.setCollapsed(!props.collapsed); } },
				React.createElement('span', { style: styles.cardTitle }, props.title),
				React.createElement('span', { style: styles.cardToggle }, props.collapsed ? '展开' : '收起')
			),
			!props.collapsed ? React.createElement('div', { style: styles.cardBody }, props.children) : null
		);
	};

	var FormItemReadOnly = function(props) {
		var colStyle = props.fullWidth ? styles.formColFull : styles.formCol;
		return React.createElement('div', { style: colStyle },
			React.createElement('label', { style: styles.label }, props.label),
			React.createElement('div', { style: Object.assign({}, styles.input, styles.inputDisabled) }, props.value || '—')
		);
	};

	var mockCustomer = { name: '嘉兴某某物流有限公司', creditCode: '91330400MA2XXXXX1', address: '浙江省嘉兴市南湖区科技大道1号', contact: '张三', phone: '13800138001', email: 'zhangsan@example.com', companyName: '嘉兴某某物流有限公司', companyPhone: '0571-88888888', mailingAddress: '浙江省嘉兴市南湖区科技大道1号', bank: '中国工商银行嘉兴分行', bankAccount: '6222021234567890123', taxId: '91330400MA2XXXXX1' };
	var isThreePartyContract = true;
	var mockThirdPartyCustomer = { name: '杭州某某供应链有限公司', creditCode: '91330100MA2YYYYY2', address: '浙江省杭州市余杭区未来科技城', contact: '李四', phone: '13800138002', email: 'lisi@example.com', companyName: '杭州某某供应链有限公司', companyPhone: '0571-99999999', mailingAddress: '浙江省杭州市余杭区未来科技城', bank: '中国农业银行杭州分行', bankAccount: '6228481234567890123', taxId: '91330100MA2YYYYY2', department: '业务2部', responsible: '李专员' };
	var contractOriginalFiles = [
		{ name: '租赁合同-原件.pdf', size: '1.2 MB', uploadTime: '2026-02-16 14:30' },
		{ name: '租赁合同-补充协议.pdf', size: '0.6 MB', uploadTime: '2026-02-16 14:35' }
	];
	if (isThreePartyContract) {
		contractOriginalFiles = contractOriginalFiles.concat([{ name: '三方合同-原件.pdf', size: '0.8 MB', uploadTime: '2026-03-02 16:10' }]);
	}
	var _contractBasicOriginals = useState(contractOriginalFiles.slice());
	var contractBasicOriginals = _contractBasicOriginals[0];
	var setContractBasicOriginals = _contractBasicOriginals[1];
	var contractBasicInputRef = React.useRef(null);
	var addVehicleDate = '2026-03-15';
	var mockContract = { projectName: '嘉兴氢能运输项目', contractCode: 'JXZL20260216YW101235A', contractType: '正式合同', effectiveDate: '2026-02-16', paymentMethod: '预付', mainVehicleModels: '型号A1、型号A2', endDate: '2027-02-16', paymentPeriod: '1个月', signingCompany: '嘉兴羚牛', deliveryRegion: '浙江省 / 嘉兴市', deliveryLocation: '嘉兴市南湖区科技大道1号', contractApprovalType: '标准合同审批', remarks: '' };
	var mockAuthorized = [{ name: '张三', phone: '13800138001', idCard: '330102199001011234' }];
	var mockRentalOrders = [{ brand: '品牌A', model: '型号A1', plateNo: '浙A10001', vin: 'L1234567890ABCDEF', monthRent: '8000', serviceFee: '500', deposit: '10000', remark: '' }, { brand: '品牌A', model: '型号A2', plateNo: '浙B20002', vin: 'L2234567890ABCDEF', monthRent: '8000', serviceFee: '500', deposit: '10000', remark: '' }];
	var mockRentalSummary = { vehicleCount: 2, totalRentService: '17000.00', totalDeposit: '20000.00', hydrogenPrepay: '5000.00' };
	var mockHydrogen = { bearer: '客户', paymentMethod: '预付', hydrogenPrepay: '5000', returnPrice: '80' };
	var mockFeeTemplate = '标准费用模板A';
	var mockBillingMethod = '按自然月结算';
	var feeTemplateCertFees = [{ project: '补办行驶证', standard: '50元/次', serviceFee: '20' }, { project: '补办驾驶证', standard: '30元/次', serviceFee: '10' }, { project: '补办牌照', standard: '100元/次', serviceFee: '50' }];
	var feeTemplatePenaltyFees = [{ project: '提前退车违约金', standard: '月租金×1', serviceFee: '0' }, { project: '违章处理违约金', standard: '按实际发生', serviceFee: '50' }];
	var feeTemplateConsumables = [{ category: '轮胎', part: '前轮', partName: '轮胎A型', qty: 1, feeDetail: '500.00' }, { category: '易损件', part: '雨刮', partName: '雨刮片', qty: 2, feeDetail: '80.00' }];
	var feeTemplateOtherFees = [{ project: '上门送车费', standard: '100元/次', serviceFee: '50' }, { project: '上门收车费', standard: '100元/次', serviceFee: '50' }, { project: '清洗费', standard: '80元/次', serviceFee: '30' }];
	var feeTableHeader3 = React.createElement('tr', null, React.createElement('th', { style: styles.rentalTh }, '项目'), React.createElement('th', { style: styles.rentalTh }, '收费标准'), React.createElement('th', { style: styles.rentalTh }, '服务费'));
	var feeTableHeader5 = React.createElement('tr', null, React.createElement('th', { style: styles.rentalTh }, '类别'), React.createElement('th', { style: styles.rentalTh }, '损坏部位'), React.createElement('th', { style: styles.rentalTh }, '配件'), React.createElement('th', { style: styles.rentalTh }, '数量'), React.createElement('th', { style: styles.rentalTh }, '费用明细'));
	var makeFeeRow3 = function(r, i) { return React.createElement('tr', { key: i }, React.createElement('td', { style: styles.rentalTd }, r.project), React.createElement('td', { style: styles.rentalTd }, r.standard), React.createElement('td', { style: styles.rentalTd }, r.serviceFee)); };
	var makeFeeRow5 = function(r, i) { return React.createElement('tr', { key: i }, React.createElement('td', { style: styles.rentalTd }, r.category), React.createElement('td', { style: styles.rentalTd }, r.part), React.createElement('td', { style: styles.rentalTd }, r.partName), React.createElement('td', { style: styles.rentalTd }, r.qty), React.createElement('td', { style: styles.rentalTd }, r.feeDetail)); };
	var feeCertTable = React.createElement('table', { style: styles.rentalTable }, React.createElement('thead', null, feeTableHeader3), React.createElement('tbody', null, feeTemplateCertFees.map(makeFeeRow3)));
	var feePenaltyTable = React.createElement('table', { style: styles.rentalTable }, React.createElement('thead', null, feeTableHeader3), React.createElement('tbody', null, feeTemplatePenaltyFees.map(makeFeeRow3)));
	var feeConsumablesTable = React.createElement('table', { style: styles.rentalTable }, React.createElement('thead', null, feeTableHeader5), React.createElement('tbody', null, feeTemplateConsumables.map(makeFeeRow5)));
	var feeOtherTable = React.createElement('table', { style: styles.rentalTable }, React.createElement('thead', null, feeTableHeader3), React.createElement('tbody', null, feeTemplateOtherFees.map(makeFeeRow3)));
	var feeTemplateBody = React.createElement('div', null,
		React.createElement('div', { style: Object.assign({}, styles.feeSectionTitle, styles.feeSectionTitleFirst) }, '证照补办费用'), feeCertTable,
		React.createElement('div', { style: styles.feeSectionTitle }, '违约金费用'), feePenaltyTable,
		React.createElement('div', { style: styles.feeSectionTitle }, '易损件信息'), feeConsumablesTable,
		React.createElement('div', { style: styles.feeSectionTitle }, '其他费用信息'), feeOtherTable
	);

	var customerFields = React.createElement('div', { style: styles.formRow },
		React.createElement(FormItemReadOnly, { label: '客户名称', value: mockCustomer.name }),
		React.createElement(FormItemReadOnly, { label: '客户统一信用代码', value: mockCustomer.creditCode }),
		React.createElement(FormItemReadOnly, { label: '客户地址', value: mockCustomer.address }),
		React.createElement(FormItemReadOnly, { label: '客户联系人', value: mockCustomer.contact }),
		React.createElement(FormItemReadOnly, { label: '客户电话', value: mockCustomer.phone }),
		React.createElement(FormItemReadOnly, { label: '客户电子邮箱', value: mockCustomer.email }),
		React.createElement(FormItemReadOnly, { label: '企业名称', value: mockCustomer.companyName }),
		React.createElement(FormItemReadOnly, { label: '企业电话', value: mockCustomer.companyPhone }),
		React.createElement(FormItemReadOnly, { label: '邮寄地址', value: mockCustomer.mailingAddress }),
		React.createElement(FormItemReadOnly, { label: '开户银行', value: mockCustomer.bank }),
		React.createElement(FormItemReadOnly, { label: '银行账号', value: mockCustomer.bankAccount }),
		React.createElement(FormItemReadOnly, { label: '纳税人识别号', value: mockCustomer.taxId }),
		React.createElement(FormItemReadOnly, { label: '业务部门', value: '业务1部' }),
		React.createElement(FormItemReadOnly, { label: '业务负责人', value: '张经理' })
	);

	var thirdPartyCustomerFields = React.createElement('div', { style: styles.formRow },
		React.createElement(FormItemReadOnly, { label: '客户名称', value: mockThirdPartyCustomer.name }),
		React.createElement(FormItemReadOnly, { label: '客户统一信用代码', value: mockThirdPartyCustomer.creditCode }),
		React.createElement(FormItemReadOnly, { label: '客户地址', value: mockThirdPartyCustomer.address }),
		React.createElement(FormItemReadOnly, { label: '客户联系人', value: mockThirdPartyCustomer.contact }),
		React.createElement(FormItemReadOnly, { label: '客户电话', value: mockThirdPartyCustomer.phone }),
		React.createElement(FormItemReadOnly, { label: '客户电子邮箱', value: mockThirdPartyCustomer.email }),
		React.createElement(FormItemReadOnly, { label: '企业名称', value: mockThirdPartyCustomer.companyName }),
		React.createElement(FormItemReadOnly, { label: '企业电话', value: mockThirdPartyCustomer.companyPhone }),
		React.createElement(FormItemReadOnly, { label: '邮寄地址', value: mockThirdPartyCustomer.mailingAddress }),
		React.createElement(FormItemReadOnly, { label: '开户银行', value: mockThirdPartyCustomer.bank }),
		React.createElement(FormItemReadOnly, { label: '银行账号', value: mockThirdPartyCustomer.bankAccount }),
		React.createElement(FormItemReadOnly, { label: '纳税人识别号', value: mockThirdPartyCustomer.taxId }),
		React.createElement(FormItemReadOnly, { label: '业务部门', value: mockThirdPartyCustomer.department }),
		React.createElement(FormItemReadOnly, { label: '业务负责人', value: mockThirdPartyCustomer.responsible })
	);

	var contractFormRow1 = React.createElement('div', { style: styles.formRow },
		React.createElement(FormItemReadOnly, { label: '项目名称', value: mockContract.projectName }),
		React.createElement(FormItemReadOnly, { label: '合同编码', value: mockContract.contractCode }),
		React.createElement(FormItemReadOnly, { label: '合同类型', value: mockContract.contractType }),
		React.createElement(FormItemReadOnly, { label: '生效日期', value: mockContract.effectiveDate }),
		React.createElement(FormItemReadOnly, { label: '付款方式', value: mockContract.paymentMethod }),
		React.createElement(FormItemReadOnly, { label: '主要车型', value: mockContract.mainVehicleModels }),
		React.createElement(FormItemReadOnly, { label: '结束日期', value: mockContract.endDate }),
		React.createElement(FormItemReadOnly, { label: '付款周期', value: mockContract.paymentPeriod }),
		React.createElement(FormItemReadOnly, { label: '签约公司', value: mockContract.signingCompany }),
		React.createElement('div', { style: styles.formCol },
			React.createElement(FormItemReadOnly, { label: '交车区域', value: mockContract.deliveryRegion }),
			React.createElement('div', null,
				React.createElement('label', { style: styles.label }, '合同原件'),
				contractBasicOriginals && contractBasicOriginals.length > 0
					? React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 } },
						contractBasicOriginals.map(function(f, i) {
							return React.createElement('div', { key: i, style: { display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', padding: '8px 12px', backgroundColor: '#fafafa', borderRadius: 4, border: '1px solid #e8e8e8' } },
								React.createElement('a', { href: '#', style: { color: '#1890ff', cursor: 'pointer', textDecoration: 'none' }, onClick: function(e) { e.preventDefault(); if (f.file && typeof URL !== 'undefined') { var u = URL.createObjectURL(f.file); window.open(u); } else { window.open('#', '_blank'); } } }, f.name),
								(f.size || f.uploadTime) ? React.createElement('span', { style: { color: '#999', fontSize: 12 } }, (f.size || '') + (f.size && f.uploadTime ? ' · ' : '') + (f.uploadTime || '')) : null,
								f.file ? React.createElement(Button, { type: 'link', size: 'small', danger: true, onClick: function() { setContractBasicOriginals(function(prev) { var n = prev.slice(); n.splice(i, 1); return n; }); } }, '删除') : null
							);
						})
					)
					: null,
				React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 8 } },
					React.createElement('input', { ref: contractBasicInputRef, type: 'file', style: { display: 'none' }, accept: '.doc,.docx,.pdf', onChange: function(e) {
						var f = e.target.files && e.target.files[0];
						if (f) {
							var sizeDisplay = f.size >= 1024 * 1024 ? (f.size / 1024 / 1024).toFixed(1) + ' MB' : (f.size / 1024).toFixed(1) + ' KB';
							var now = window.moment ? window.moment() : new Date();
							var uploadTimeStr = window.moment ? now.format('YYYY-MM-DD HH:mm') : now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0') + '-' + String(now.getDate()).padStart(2, '0') + ' ' + String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');
							setContractBasicOriginals(function(prev) { return prev.concat([{ name: f.name, file: f, size: sizeDisplay, uploadTime: uploadTimeStr }]); });
						}
						e.target.value = '';
					} }),
					React.createElement(Button, { type: 'default', onClick: function() { if (contractBasicInputRef.current) contractBasicInputRef.current.click(); } }, '上传附件')
				)
			)
		),
		React.createElement(FormItemReadOnly, { label: '交车地点', value: mockContract.deliveryLocation }),
		React.createElement(FormItemReadOnly, { label: '合同审批类型', value: mockContract.contractApprovalType || '—' })
	);
	var contractFormRow2 = React.createElement('div', { style: styles.formRow }, React.createElement(FormItemReadOnly, { label: '备注', fullWidth: true, value: mockContract.remarks || '—' }));

	var authorizedContent = React.createElement('div', null,
		React.createElement('div', { style: { display: 'flex', gap: 12, alignItems: 'center', marginBottom: 8 } },
			React.createElement('span', { style: { flex: 1, fontWeight: 600, fontSize: 13 } }, '被授权人姓名'),
			React.createElement('span', { style: { flex: 1, fontWeight: 600, fontSize: 13 } }, '被授权人联系电话'),
			React.createElement('span', { style: { flex: 1, fontWeight: 600, fontSize: 13 } }, '被授权人身份证')
		),
		mockAuthorized.map(function(item, index) {
			return React.createElement('div', { key: index, style: { display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12 } },
				React.createElement('div', { style: Object.assign({}, styles.input, styles.inputDisabled, { flex: 1 }) }, item.name),
				React.createElement('div', { style: Object.assign({}, styles.input, styles.inputDisabled, { flex: 1 }) }, item.phone),
				React.createElement('div', { style: Object.assign({}, styles.input, styles.inputDisabled, { flex: 1 }) }, item.idCard)
			);
		})
	);

	var rentalSummaryEl = React.createElement('div', { style: styles.summaryList },
		React.createElement('div', { style: styles.summaryListItem }, React.createElement('span', { style: styles.summaryListLabel }, '租赁车辆数'), React.createElement('span', { style: styles.summaryListValue }, mockRentalSummary.vehicleCount + ' 辆')),
		React.createElement('div', { style: styles.summaryListItem }, React.createElement('span', { style: styles.summaryListLabel }, '租金及服务费合计'), React.createElement('span', { style: styles.summaryListValue }, mockRentalSummary.totalRentService + ' 元')),
		React.createElement('div', { style: styles.summaryListItem }, React.createElement('span', { style: styles.summaryListLabel }, '保证金总额'), React.createElement('span', { style: styles.summaryListValue }, mockRentalSummary.totalDeposit + ' 元')),
		React.createElement('div', { style: styles.summaryListItem }, React.createElement('span', { style: styles.summaryListLabel }, '氢气预付款金额'), React.createElement('span', { style: styles.summaryListValue }, mockRentalSummary.hydrogenPrepay + ' 元'))
	);
	var rentalTableBody = mockRentalOrders.map(function(row, idx) {
		return React.createElement('tr', { key: idx },
			React.createElement('td', { style: styles.rentalTd }, idx + 1),
			React.createElement('td', { style: styles.rentalTd }, React.createElement('div', { style: styles.rentalInputDisabled }, row.brand)),
			React.createElement('td', { style: styles.rentalTd }, React.createElement('div', { style: styles.rentalInputDisabled }, row.model)),
			React.createElement('td', { style: styles.rentalTd }, React.createElement('div', { style: styles.rentalInputDisabled }, row.plateNo)),
			React.createElement('td', { style: styles.rentalTd }, React.createElement('div', { style: styles.rentalInputDisabled }, row.vin)),
			React.createElement('td', { style: styles.rentalTd }, React.createElement('div', { style: styles.rentalInputDisabled }, row.monthRent + ' 元')),
			React.createElement('td', { style: styles.rentalTd }, React.createElement('div', { style: styles.rentalInputDisabled }, row.serviceFee + ' 元')),
			React.createElement('td', { style: styles.rentalTd }, React.createElement('div', { style: styles.rentalInputDisabled }, row.deposit + ' 元')),
			React.createElement('td', { style: styles.rentalTd }, React.createElement('div', { style: styles.rentalInputDisabled }, row.remark || '—'))
		);
	});
	var rentalTableEl = React.createElement('table', { style: styles.rentalTable },
		React.createElement('thead', null,
			React.createElement('tr', null,
				React.createElement('th', { style: styles.rentalTh, width: 50 }, '序号'),
				React.createElement('th', { style: styles.rentalTh, width: 100 }, '品牌'),
				React.createElement('th', { style: styles.rentalTh, width: 100 }, '型号'),
				React.createElement('th', { style: styles.rentalTh, width: 120 }, '车牌号'),
				React.createElement('th', { style: styles.rentalTh, width: 160 }, '车辆识别代码'),
				React.createElement('th', { style: styles.rentalTh, width: 120 }, '车辆月租金'),
				React.createElement('th', { style: styles.rentalTh, width: 90 }, '服务费'),
				React.createElement('th', { style: styles.rentalTh, width: 100 }, '保证金'),
				React.createElement('th', { style: styles.rentalTh, width: 80 }, '备注')
			)
		),
		React.createElement('tbody', null, rentalTableBody)
	);
	var hydrogenReadOnly = React.createElement('div', { style: styles.formRow },
		React.createElement(FormItemReadOnly, { label: '氢费承担方', value: mockHydrogen.bearer }),
		React.createElement(FormItemReadOnly, { label: '付款方式', value: mockHydrogen.paymentMethod }),
		React.createElement(FormItemReadOnly, { label: '氢气预付款', value: mockHydrogen.hydrogenPrepay + ' 元' }),
		React.createElement(FormItemReadOnly, { label: '退还车氢气单价', value: mockHydrogen.returnPrice + ' 元' })
	);
	var rentalContent = React.createElement('div', null, rentalSummaryEl, React.createElement('div', { style: { overflowX: 'auto', marginBottom: 16 } }, rentalTableEl), hydrogenReadOnly);

	var newVehicleColumns = [
		{ title: '序号', key: 'no', width: 60, render: function(_, __, i) { return i + 1; } },
		{ title: '品牌', key: 'brand', width: 90, render: function(_, row, i) { return React.createElement(Select, { placeholder: '请选择', style: { width: '100%' }, value: row.brand || undefined, onChange: function(v) { updateNewVehicleRow(i, 'brand', v || ''); }, options: brandList.map(function(b) { return { value: b, label: b }; }), allowClear: true }); } },
		{ title: '型号', key: 'model', width: 100, render: function(_, row, i) { var opts = (row.brand && modelByBrand[row.brand]) ? modelByBrand[row.brand].map(function(m) { return { value: m, label: m }; }) : []; return React.createElement(Select, { placeholder: '请选择', style: { width: '100%' }, value: row.model || undefined, onChange: function(v) { updateNewVehicleRow(i, 'model', v || ''); }, options: opts, allowClear: true, disabled: !row.brand }); } },
		{ title: '车牌号', key: 'plateNo', width: 120, render: function(_, row, i) { return React.createElement(Select, { placeholder: '请选择或输入搜索', style: { width: '100%' }, value: row.plateNo || undefined, onChange: function(v) { updateNewVehicleRow(i, 'plateNo', v || ''); }, options: plateNoOptions, allowClear: true, showSearch: true, filterOption: function(input, option) { var label = (option && option.label) ? option.label : ''; return label.toLowerCase().indexOf((input || '').toLowerCase()) >= 0; } }); } },
		{ title: '车辆识别代码', key: 'vin', width: 160, render: function(_, row, i) { return React.createElement(Input, { placeholder: '由车牌号反写', value: row.plateNo || row.vin || '', disabled: true }); } },
		{ title: '车辆月租金', key: 'monthRent', width: 120, render: function(_, row, i) { return React.createElement(Input, { placeholder: '0.00', value: row.monthRent || '', onChange: function(e) { updateNewVehicleRow(i, 'monthRent', e.target.value); }, addonAfter: '元' }); } },
		{ title: '服务费项目', key: 'serviceItems', width: 80, render: function(_, row, i) { return React.createElement(Button, { type: 'link', size: 'small', onClick: function() { openServiceModal(i); } }, '管理'); } },
		{ title: '服务费', key: 'serviceFee', width: 90, render: function(_, row, i) { return calcRowServiceFee(row) + ' 元'; } },
		{ title: '保证金', key: 'deposit', width: 100, render: function(_, row, i) { return React.createElement(Input, { placeholder: '0.00', value: row.deposit || '', onChange: function(e) { updateNewVehicleRow(i, 'deposit', e.target.value); }, addonAfter: '元' }); } },
		{ title: '备注', key: 'remark', width: 120, render: function(_, row, i) { return React.createElement(Input, { placeholder: '选填', value: row.remark || '', onChange: function(e) { updateNewVehicleRow(i, 'remark', e.target.value); } }); } },
		{ title: '操作', key: 'action', width: 100, render: function(_, row, i) { return React.createElement('span', { style: { display: 'inline-flex', gap: 4, alignItems: 'center' } }, React.createElement(Button, { type: 'link', size: 'small', onClick: function() { copyNewVehicleRow(i); } }, '复制'), React.createElement(Button, { type: 'link', size: 'small', danger: true, onClick: function() { removeNewVehicleRow(i); } }, '删除')); } }
	];

	var newOrderSummaryEl = React.createElement('div', { style: styles.summaryList },
		React.createElement('div', { style: styles.summaryListItem }, React.createElement('span', { style: styles.summaryListLabel }, '租赁车辆数'), React.createElement('span', { style: styles.summaryListValue }, newOrderSummary.vehicleCount + ' 辆')),
		React.createElement('div', { style: styles.summaryListItem }, React.createElement('span', { style: styles.summaryListLabel }, '租金及服务费合计'), React.createElement('span', { style: styles.summaryListValue }, newOrderSummary.totalRentService + ' 元')),
		React.createElement('div', { style: styles.summaryListItem }, React.createElement('span', { style: styles.summaryListLabel }, '保证金总额'), React.createElement('span', { style: styles.summaryListValue }, newOrderSummary.totalDeposit + ' 元'))
	);

	var serviceModalRows = serviceModalRowIndex !== null && newVehicleRows[serviceModalRowIndex] ? newVehicleRows[serviceModalRowIndex].serviceItems : [];
	var serviceModalContent = serviceModalRowIndex !== null ? React.createElement('div', { style: styles.modalMask, onClick: function(e) { if (e.target === e.currentTarget) closeServiceModal(); } },
		React.createElement('div', { style: styles.modalBox, onClick: function(e) { e.stopPropagation(); } },
			React.createElement('div', { style: styles.modalHeader }, '服务项目'),
			React.createElement('div', { style: styles.modalBody },
				React.createElement('table', { style: styles.rentalTable },
					React.createElement('thead', null, React.createElement('tr', null, React.createElement('th', { style: styles.rentalTh }, '服务项目'), React.createElement('th', { style: styles.rentalTh }, '费用'), React.createElement('th', { style: styles.rentalTh }, '生效时间'), React.createElement('th', { style: Object.assign({}, styles.rentalTh, { width: 80 }) }, '操作'))),
					React.createElement('tbody', null, serviceModalRows.map(function(si, siIdx) {
						return React.createElement('tr', { key: siIdx },
							React.createElement('td', { style: styles.rentalTd }, React.createElement(Select, { style: { width: '100%' }, placeholder: '请选择服务项目', value: si.project || undefined, onChange: function(v) { updateServiceItem(siIdx, 'project', v || ''); }, showSearch: true, filterOption: function(input, opt) { return opt && opt.children && String(opt.children).toLowerCase().indexOf((input || '').toLowerCase()) >= 0; }, allowClear: true }, serviceItemOptions.map(function(opt, oi) { return React.createElement(Option, { key: oi, value: opt }, opt); }))),
							React.createElement('td', { style: styles.rentalTd }, React.createElement(Input, { placeholder: '0.00', value: si.fee || '', onChange: function(e) { updateServiceItem(siIdx, 'fee', e.target.value); }, addonAfter: '元', style: { width: '100%' } })),
							React.createElement('td', { style: styles.rentalTd }, React.createElement(DatePicker, { style: { width: '100%' }, format: 'YYYY-MM-DD', placeholder: '请选择生效时间', value: si.effectiveDate && window.moment ? window.moment(si.effectiveDate, 'YYYY-MM-DD') : null, onChange: function(d, dateStr) { updateServiceItem(siIdx, 'effectiveDate', dateStr || ''); } })),
							React.createElement('td', { style: styles.rentalTd }, React.createElement(Button, { type: 'link', size: 'small', danger: true, onClick: function() { removeServiceItem(siIdx); } }, '删除'))
						);
					}))
				),
				React.createElement(Button, { type: 'dashed', style: { marginTop: 12, width: '100%' }, onClick: addServiceItem }, '添加一行')
			),
			React.createElement('div', { style: { padding: '12px 20px', borderTop: '1px solid #f0f0f0', textAlign: 'right', display: 'flex', gap: 12, justifyContent: 'flex-end' } },
				React.createElement(Button, { type: 'primary', onClick: function() { closeServiceModal(); } }, '保存'),
				React.createElement(Button, { onClick: closeServiceModal }, '关闭')
			)
		)
	) : null;

	var openNewVehicleContract = function(item) {
		if (item && item.file && typeof URL !== 'undefined') { var url = URL.createObjectURL(item.file); window.open(url); }
	};
	var newVehicleContractSection = React.createElement('div', { style: styles.formRow },
		React.createElement('div', { style: styles.formColFull },
			React.createElement('label', { style: styles.label }, '合同原件'),
			newVehicleContractOriginals && newVehicleContractOriginals.length > 0
				? React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 } },
					newVehicleContractOriginals.map(function(f, i) {
						return React.createElement('div', { key: i, style: { display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', padding: '8px 12px', backgroundColor: '#f5f5f5', borderRadius: 4, border: '1px solid #d9d9d9' } },
							React.createElement('a', { href: '#', style: { color: '#1890ff', cursor: 'pointer', textDecoration: 'none' }, onClick: function(e) { e.preventDefault(); openNewVehicleContract(f); } }, f.name),
							(f.size || f.uploadTime) ? React.createElement('span', { style: { color: '#999', fontSize: 12 } }, (f.size || '') + (f.size && f.uploadTime ? ' · ' : '') + (f.uploadTime || '')) : null,
							React.createElement(Button, { type: 'link', size: 'small', danger: true, onClick: function() { setEdited(true); setNewVehicleContractOriginals(function(prev) { var n = prev.slice(); n.splice(i, 1); return n; }); } }, '删除')
						);
					})
				)
				: null,
			React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 8 } },
				React.createElement('input', { ref: newVehicleContractInputRef, type: 'file', style: { display: 'none' }, accept: '.doc,.docx,.pdf', onChange: function(e) {
					var f = e.target.files && e.target.files[0];
					if (f) {
						setEdited(true);
						var sizeDisplay = f.size >= 1024 * 1024 ? (f.size / 1024 / 1024).toFixed(1) + ' MB' : (f.size / 1024).toFixed(1) + ' KB';
						var now = window.moment ? window.moment() : new Date();
						var uploadTimeStr = window.moment ? now.format('YYYY-MM-DD HH:mm') : now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0') + '-' + String(now.getDate()).padStart(2, '0') + ' ' + String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');
						setNewVehicleContractOriginals(function(prev) { return prev.concat([{ name: f.name, file: f, size: sizeDisplay, uploadTime: uploadTimeStr }]); });
					}
					e.target.value = '';
				} }),
				React.createElement(Button, { type: 'default', onClick: function() { if (newVehicleContractInputRef.current) newVehicleContractInputRef.current.click(); } }, '上传附件')
			)
		)
	);
	var newVehicleCardContent = React.createElement('div', null,
		newVehicleContractSection,
		newOrderSummaryEl,
		React.createElement(Table, { rowKey: function(_, i) { return String(i); }, size: 'small', columns: newVehicleColumns, dataSource: newVehicleRows, pagination: false, scroll: { x: 1100 } }),
		React.createElement(Button, { type: 'dashed', style: { marginTop: 12, width: '100%' }, onClick: addNewVehicleRow }, '添加一行')
	);

	var feeContent = React.createElement('div', null, React.createElement('div', { style: styles.formRow }, React.createElement(FormItemReadOnly, { label: '选择费用模板', value: mockFeeTemplate })), feeTemplateBody);
	var billingContent = React.createElement('div', null, React.createElement('div', { style: { padding: '12px 16px', border: '1px solid #e8e8e8', borderRadius: 4, backgroundColor: '#fafafa', fontSize: 14, color: '#333' } }, mockBillingMethod));
	var changeHistoryRaw = [
		{ changeTime: '2026-03-03 10:20', opType: '保存', operator: '张三', remark: '无' },
		{ changeTime: '2026-03-02 16:10', opType: '变更为三方合同', operator: '李四', remark: '增加丙方客户“客户名称杭州某某供应链有限公司”' },
		{ changeTime: '2026-03-01 11:40', opType: '添加车辆', operator: '王五', remark: '添加车辆“沪A30003”\n添加车辆“浙A10001”\n添加车辆“浙B20002”' },
		{ changeTime: '2026-02-28 09:05', opType: '添加授权人', operator: '赵六', remark: '添加授权人“授权人张三”\n添加授权人“授权人李四”' },
		{ changeTime: '2026-02-26 15:30', opType: '续签合同', operator: '周九', remark: '续签自“原合同编码JXZL20250210YW101100A”' },
		{ changeTime: '2026-02-23 14:18', opType: '撤回合同', operator: '钱七', remark: '主动撤回' },
		{ changeTime: '2026-02-20 10:00', opType: '终止合同', operator: '孙八', remark: '主动终止' },
		{ changeTime: '2026-02-16 14:30', opType: '转正式合同', operator: '张经理', remark: '转正式合同自“原合同编码JXZL20260210YW101230B”' }
	];
	var changeHistorySorted = changeHistoryRaw.slice().sort(function(a, b) { return b.changeTime.localeCompare(a.changeTime); });
	var historyTableRows = changeHistorySorted.map(function(row, index) {
		return React.createElement('tr', { key: index },
			React.createElement('td', { style: styles.rentalTd }, index + 1),
			React.createElement('td', { style: styles.rentalTd }, row.changeTime),
			React.createElement('td', { style: styles.rentalTd }, row.opType),
			React.createElement('td', { style: styles.rentalTd }, row.operator),
			React.createElement('td', { style: styles.rentalTd }, React.createElement('button', { type: 'button', style: styles.historyLink, onClick: function() { window.open('#', '_blank'); } }, '查看变更前记录')),
			React.createElement('td', { style: Object.assign({}, styles.rentalTd, { verticalAlign: 'top', whiteSpace: 'pre-line' }) }, row.remark)
		);
	});
	var historyTable = React.createElement('table', { style: styles.rentalTable },
		React.createElement('thead', null,
			React.createElement('tr', null,
				React.createElement('th', { style: styles.rentalTh, width: 60 }, '序号'),
				React.createElement('th', { style: styles.rentalTh, width: 140 }, '变更时间'),
				React.createElement('th', { style: styles.rentalTh, width: 120 }, '操作类型'),
				React.createElement('th', { style: styles.rentalTh, width: 90 }, '操作人'),
				React.createElement('th', { style: styles.rentalTh, width: 120 }, '原始记录'),
				React.createElement('th', { style: styles.rentalTh }, '备注')
			)
		),
		React.createElement('tbody', null, historyTableRows)
	);

	var requirementContent = '车辆租赁合同-新增（2026年3月3日版本）\n「数字化资产ONE-OS运管平台」中的「车辆租赁合同」-「新增租赁合同」模块，点击车辆租赁合同右上角「新增」进行创建；\n1.面包屑：\n#业务管理-车辆租赁合同-新增合同\n\n2.客户基本信息卡片：\n#用于从客户列表中选择客户，并将该合同绑定到业务部门及业务负责人（绑定业务部门/业务负责人主要为了后期从部门/业务负责人维度进行数据统计）；\n2.1.客户名称：必选项，选择器，支持从输入框内输入内容进行模糊搜索，从客户信息列表中选择对应客户（只显示已通过审核的客户）；\n2.2.客户统一信用代码：输入框（禁用状态），根据所选客户自动从客户信息列表中拉取对应客户-「信用代码」字段；\n2.3.客户地址：输入框（禁用状态），根据所选客户自动从客户信息列表中拉取对应客户-「客户地址」字段；\n2.4.客户联系人：输入框（禁用状态），根据所选客户自动从客户信息列表中拉取对应客户-「客户联系人」字段；\n2.5.客户电话：输入框（禁用状态），根据所选客户自动从客户信息列表中拉取对应客户-「客户电话」字段；\n2.6.客户电子邮箱：输入框（禁用状态），根据所选客户自动从客户信息列表中拉取对应客户-「客户电子邮箱」字段；\n2.7.企业名称：输入框（禁用状态），根据所选客户自动从客户信息列表中拉取对应客户-「企业名称」字段；\n2.8.企业电话：输入框（禁用状态），根据所选客户自动从客户信息列表中拉取对应客户-「企业电话」字段；\n2.9.邮寄地址：输入框（禁用状态），根据所选客户自动从客户信息列表中拉取对应客户-「邮寄地址」字段；\n2.10.开户银行：输入框（禁用状态），根据所选客户自动从客户信息列表中拉取对应客户-「开户银行」字段；\n2.11.银行账号：输入框（禁用状态），根据所选客户自动从客户信息列表中拉取对应客户-「银行账号」字段；\n2.12.纳税人识别号：输入框（禁用状态），根据所选客户自动从客户信息列表中拉取对应客户-「纳税人识别号」字段；\n2.13.业务部门：必选项，选择器，从部门表中选择该租赁合同对应部门；\n2.14.业务负责人：必选项，选择器，从已选业务部门下拉取对应业务负责人，未选择业务部门时，业务负责人字段不可选；\n\n3.合同基本信息卡片：\n#用于定义租赁合同基本情况和付款方式；\n3.1.项目名称：必填项，输入框，用于定义该合同项目名称，默认提示信息"请输入项目名称"；\n3.2.合同类型：必选项，选择器，合同类型分为「正式合同」「试用合同」；\n3.3.生效日期：必选项，日期选择器，格式为YYYY-MM-DD，精确至天，默认为点击新增日期；\n3.4.付款方式：必选项，付款方式分为「预付」「后付」两种；\n      3.4.1.如果选择预付，以对应「付款方式」和「付款周期」规则，在每一期新账单生成就列入业务待办（工作台功能），同时以消息通知对应用户；\n      3.4.2.如果选择后付，以对应「付款方式」和「付款周期」规则，在每一期新账单生成时，将前一期账单列入业务待办（工作台功能），同时以消息通知对应用户；\n3.5.主要车型：输入框（禁用状态），根据租赁订单信息中所有所选车型，自动反写入输入框并以标签形式显示，支持多车型显示，标签显示：型号名称；\n3.6.结束日期：必选项，日期选择器，格式为YYYY-MM-DD，精确至天；\n      3.6.1.合同结束日期前30天将以消息提醒方式提醒（消息中心、工作台）；\n      3.6.2.到达合同结束日期时，租赁账单将会立刻停止计算，作为最后一期账单；\n      3.6.3.续签合同/转正式合同将重新生成账单，不会对旧合同账单做任何继承处理；\n3.7.付款周期：必选项，选择器，支持1个月-12个月 12种付款周期，账单将以此周期和账单计算方式规则，从交车任务形成的交车单进行完整交车后，定时自动生成账单；\n3.8.签约公司：必选项，选择器，从组织机构表中获取所有根组织机构（如嘉兴羚牛、上海羚牛、广东羚牛等），默认显示新增用户当前机构，可手动修改，后期需要考虑从签约公司维度统计合同相关数据；\n3.9.交车区域：必选项，地区选择器，支持省-市2级，选择区域后，该任务生成交车任务时会自动推送至该区域负责运维人员；\n3.10.交车地点：必填项，输入框，支持自定义输入交车地点；\n3.11.合同审批类型：必填项，选择器，分为「标准合同审批」「非标准合同审批」；\n3.12.合同原件：必填项，按钮，按钮文字为：上传附件，支持多个附件上传（doc/docx/pdf格式）；\n3.13.备注：文本域，支持自定义输入备注信息；\n\n4.被授权人信息卡片：\n#用于定义租赁合同相关被授权人相关信息，被授权人在交车单完成时，需要选择被授权人，并通过被授权人手机短信，在E签宝进行签字确认；\n4.1.被授权人：必填项，输入框，用于输入被授权人信息；\n4.2.被授权人联系电话：必填项，输入框，用于输入被授权人联系电话，该电话后续需要接收E签宝签字链接；\n4.3.被授权人身份证：必填项，输入框，用于输入被授权人身份证信息；\n4.4.支持通过新增/删除一行的方式，创建或管理多个授权人，后续交车单完成时可从多个授权人中选择接收授权人；\n\n5.租赁订单信息卡片：\n#用于定义租赁合同对应车辆明细费用、氢费明细费用等相关信息；\n5.1.上方为租赁车辆总计数据，包括租赁车辆数、租金及服务费合计、保证金总额、氢气预付款金额等相关信息；\n    5.1.1.租赁车辆数：显示下方租赁订单信息包含多少辆车；\n    5.1.2.租金及服务费合计：显示下方租赁订单信息中车辆租金总额及服务费总额；\n    5.1.3.保证金总额：显示下方租赁订单信息中车辆保证金总额；\n    5.1.4.氢气预付款金额：显示氢气预付款金额，如客户选择自行承担氢费或羚牛承担氢费，则该处为0不计入氢气预付款金额；\n5.2.下方为列表，显示序号、品牌、型号、车牌号、车辆识别代码、车辆月租金（元）、服务费项目、服务费、保证金、备注，默认且至少显示一行空数据；\n    5.2.1.序号：自动按照条数生成，规则为1、2、3....以此类推；\n    5.2.2.品牌：必选项，选择器，从型号参数库中「品牌」字段拉取所有品牌；\n    5.2.3.型号：必选项，选择器，与品牌存在级联关系，未选择品牌则无法选择型号；\n    5.2.4.车牌号：选填项，选择器（支持从输入框输入车牌号关键字下拉匹配），可通过选择车牌号对品牌、型号进行反写；\n    5.2.5.车辆识别代码：输入框（禁用），显示该车辆对应车辆识别代码，根据所选车牌号从车辆表直接拉取进行反写；\n    5.2.6.车辆月租金：输入框，支持两位小数，用于输入该车辆月租金金额，输入框后缀为元，如还车时账单周期不满1个月，则按照：（车辆月租金/30）* 实际天数进行计算；\n    5.2.7.服务费项目：点击管理按钮弹出卡片，卡片标题为：服务项目，下方列表显示服务项目、费用、生效时间、操作；\n          5.2.7.1.服务项目：必选项，选择器（支持输入框输入服务项目关键字进行下拉匹配），选项包含：代处理费用、罚款、违章处理违约金、未参加安全培训、车辆出险、年检年审违约、停车费、设备损坏金（包含易损件）、清洗费、上门收车人工费、上门收车送车行驶费、上门收车基础服务费、保险上浮、保养费用、补办驾驶证、补办牌照、补办营运证、补办加氢证、借用备用钥匙、补配钥匙、租金、氢气费-客、退还车氢量差、能源费补缴、能源费退款、送车上门人工费、送车上门送车行驶费、送车上门基础服务费、保证金、氢气预付费、维修费用、ETC-客、ETC卡缺损费、ETC设备缺损费、电费-客、未结算保养费、未结算维修费、车损费、工具损坏或丢失费、证件费、广告损坏费、送车服务费、接车服务费、补办行驶证、超赔险、轮胎磨损费、无忧包、轮胎保、养护保、尾板；\n          5.2.7.2.费用：必填项，输入框，支持2位小数，输入框后缀为元；\n          5.2.7.3.生效时间：必选项，日期选择器，格式为YYYY-MM-DD；\n          5.2.7.4.操作：删除，点击删除直接删除该行数据；\n          5.2.7.5.新增一行数据：点击添加一行服务项目；\n                  #在提车应收款中，车辆的交车日期和服务费生效日期可能会存在不同的情况，所以服务费需要单独以生效时间进行计算，例如：\n                  交车后车辆从1月1日开始计费，付款周期为2个月，则提车应收款租金会计算到3月1日，但是服务费生效时间为1月30日，此情况下需要以3月1日-1月30日，计算出服务费具体收费天数为30天，然后根据：（服务费费用/30）* 服务费收费天数30）进行计算；\n    5.2.8.服务费：自动根据添加的所有服务费项目计算总额，支持2位小数，格式为：xx.xx元；\n    5.2.9.保证金：必填项，输入框，支持2位小数，后缀为元，用于填写车辆需要支付的保证金金额，保证金为提车应收款一次性支付，还车时需要计入退还费用中；\n    5.2.10.备注：选填项，输入框，用于备注车辆复杂情况；\n    5.2.11.操作：删除，点击删除删除该行数据；\n    5.2.12.添加一行：点击后列表新增一行，用于填写一条新的车辆租金费用信息；\n5.3.氢费承担方：必选项，选择器，选项为：「我方」、「客户」，默认选择「客户」；\n    5.3.1.选择「我方」：不显示付款方式、氢气预付款；\n    5.3.2.选择「客户」：付款方式字段默认为预付，可手动修改；\n5.4.付款方式：必选项，选择器，选项为：「预付」、「月付款」、「自行结算」，默认为：「预付」；\n    5.4.1.预付：选择「预付」，需要填写：「氢气预付款」，氢气预付款指合同签署时客户就需预先付出的氢费款项，该部分款项会自动计入提车应收款中氢气预付款金额；\n    5.4.2.月付款：选择「月付款」，提车应收款中不进行收费，而是由业务人员按照实际情况，通过氢费账单功能生成对应氢费账单，单独与客户进行结算；\n    5.4.3.自行结算：选择「自行结算」，指合同签署后，所有氢气费用由客户自行承担；\n5.5.氢气预付款：选择「客户」「预付」时显示，必填项，输入框，支持2位小数，氢气预付款金额会计算入该合同交车应收款中，并计入5.1.4.氢气预付款金额中；\n5.6.退还车氢气单价：必填项，输入框，支持2位小数，后缀为元，不管氢费承担方和付款方式选择任何选项都需要进行维护，该金额主要用于与客户约定还车时，与交车时氢气差值以此费用进行自动计算和结算；\n\n6.其他费用信息卡片：\n#用于选择对应租赁费用模板，选择后展示证照补办费用、违约金费用、易损件费用、其他费用等信息，租赁费用模板管理功能位于「车辆租赁合同」列表左上角；\n6.1.选择费用模板：必选项，从「租赁费用模板」中拉取，选择后自动将该费用模板所有环节费用显示在合同中；\n    6.1.1.证照补办费用：单独标题显示，内容为列表，列表中包括项目、收费标准、服务费，选择费用模板后自动反显；\n    6.1.2.违约金费用：单独标题显示，内容为列表，列表中包含项目、收费标准、服务费，选择费用模板后自动反显；\n    6.1.3.易损件信息：单独标题显示，内容为列表，列表中包含类别、损坏部位、配件、数量、费用明细，选择费用模板后自动反显；\n    6.1.4.其他费用信息：单独标题显示，内容为列表，列表中包含项目、收费标准、服务费，选择费用模板后自动反显；\n\n7.账单计算方式卡片：\n#必选项，填充按钮组，默认为按自然月结算，可手动修改，用于定义租赁合同的账单计算方式，分为「按自然月结算」、「按付款周期天数结算」两种方式；\n7.1.按付款周期天数结算：账单按照合同基本信息卡片中每隔付款周期*30天形成一期账单；\n    例如付款周期为2个月，则交车任务交车成功时，提车应收款从交车任务配置的开始计费时间开始，根据60天收取车辆租金，此后每隔60天生成一期租赁账单；\n7.2.按自然月结算：账单按照第一个月计费开始日期到当月最后一天为第一期，之后按照付款周期所选月份间隔，从开始月份第一天到间隔月份最后一天的自然月方式形成一期账单；\n    例如付款周期为2个月，则交车任务交车成功时，提车应收款车辆租金需要收取≥2个月租金作为标准流程，＜2个月租金作为非标流程；\n    租赁账单首期从交车任务配置的开始计费时间开始，如付款周期为2个月，则首期账单结束时间为第二个月最后一天，付款周期为3个月，则首期账单结束时间为第三个月最后一天，此后每一期按照实际自然月开始-结束形成账单，例如付款周期为2个月，则第二期账单从2月1日-3月31日，以此类推；\n\n8.最下方为提交并审核、保存、取消三个按钮；\n8.1.点击提交并审核，toast提示：租赁合同已提交审核。同时该租赁合同进入租赁合同审核列表中；\n8.2.点击保存，会存储租赁订单已填写内容，不做必填项校验，同时显示在租赁合同列表中，该条数据只能保存人自己查看并编辑，其他人无法操作；\n8.3.点击取消，如当前页面有已编辑内容时，点击取消会进行二次提示，内容为：取消将会丢失所有已填写内容，是否确认？点击确认返回车辆租赁合同列表页；\n\n所有卡片支持收起/展开功能，通过点击卡片右侧收起/展开实现；并增加锚点功能，锚点固定于页面右上角，点击锚点对应卡片名称，页面自动跳转至该卡片所在区域；';

	return React.createElement('div', { style: styles.page },
		React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 } },
			React.createElement('div', { style: styles.breadcrumb }, React.createElement('span', null, '业务管理'), React.createElement('span', { style: styles.breadcrumbSep }, ' / '), React.createElement('span', null, '车辆租赁合同'), React.createElement('span', { style: styles.breadcrumbSep }, ' / '), React.createElement('span', { style: { color: '#1890ff' } }, '新增车辆')),
			React.createElement('span', { style: { color: '#1890ff', cursor: 'pointer', fontSize: 14 }, onClick: function() { setReqSpecOpen(true); } }, '查看需求说明')
		),
		React.createElement('div', { style: styles.anchorWrap },
			React.createElement('div', { style: { marginBottom: 8, fontWeight: 600, fontSize: 14 } }, '锚点导航'),
			React.createElement('button', { type: 'button', style: styles.anchorItem, onClick: function() { scrollToCard('card-customer'); } }, '客户基本信息'),
			isThreePartyContract ? React.createElement('button', { type: 'button', style: styles.anchorItem, onClick: function() { scrollToCard('card-third-party'); } }, '丙方客户基本信息') : null,
			React.createElement('button', { type: 'button', style: styles.anchorItem, onClick: function() { scrollToCard('card-contract'); } }, '合同基本信息'),
			React.createElement('button', { type: 'button', style: styles.anchorItem, onClick: function() { scrollToCard('card-authorized'); } }, '被授权人信息'),
			React.createElement('button', { type: 'button', style: styles.anchorItem, onClick: function() { scrollToCard('card-rental'); } }, '租赁订单信息'),
			React.createElement('button', { type: 'button', style: styles.anchorItem, onClick: function() { scrollToCard('card-new-vehicle'); } }, '新增车辆信息（' + addVehicleDate + '）'),
			React.createElement('button', { type: 'button', style: styles.anchorItem, onClick: function() { scrollToCard('card-fee'); } }, '其他费用信息'),
			React.createElement('button', { type: 'button', style: styles.anchorItem, onClick: function() { scrollToCard('card-billing'); } }, '账单计算方式'),
		),
		React.createElement('div', { id: 'card-customer' }, React.createElement(CardBlock, { title: '客户基本信息', collapsed: cc1, setCollapsed: setCc1 }, customerFields)),
		isThreePartyContract ? React.createElement('div', { id: 'card-third-party', style: { marginTop: 16 } }, React.createElement(CardBlock, { title: '丙方客户基本信息', collapsed: cc1b, setCollapsed: setCc1b }, thirdPartyCustomerFields)) : null,
		React.createElement('div', { id: 'card-contract', style: { marginTop: 16 } }, React.createElement(CardBlock, { title: '合同基本信息', collapsed: cc2, setCollapsed: setCc2 }, React.createElement('div', null, contractFormRow1, contractFormRow2))),
		React.createElement('div', { id: 'card-authorized', style: { marginTop: 16 } }, React.createElement(CardBlock, { title: '被授权人信息', collapsed: cc3, setCollapsed: setCc3 }, authorizedContent)),
		React.createElement('div', { id: 'card-rental', style: { marginTop: 16 } }, React.createElement(CardBlock, { title: '租赁订单信息', collapsed: cc4, setCollapsed: setCc4 }, rentalContent)),
		React.createElement('div', { id: 'card-new-vehicle', style: { marginTop: 16 } }, React.createElement(CardBlock, { title: '新增车辆信息（' + addVehicleDate + '）', collapsed: cc7, setCollapsed: setCc7 }, newVehicleCardContent)),
		React.createElement('div', { id: 'card-fee', style: { marginTop: 16 } }, React.createElement(CardBlock, { title: '其他费用信息', collapsed: cc5, setCollapsed: setCc5 }, feeContent)),
		React.createElement('div', { id: 'card-billing', style: { marginTop: 16 } }, React.createElement(CardBlock, { title: '账单计算方式', collapsed: cc6, setCollapsed: setCc6 }, billingContent)),
		React.createElement('div', { style: { height: 60 } }),
		serviceModalContent,
		reqSpecOpen ? React.createElement('div', { style: styles.modalMask, onClick: function(e) { if (e.target === e.currentTarget) setReqSpecOpen(false); } },
			React.createElement('div', { style: Object.assign({}, styles.modalBox, { maxWidth: 720 }), onClick: function(e) { e.stopPropagation(); } },
				React.createElement('div', { style: styles.modalHeader }, '需求说明'),
				React.createElement('div', { style: Object.assign({}, styles.modalBody, { maxHeight: '70vh', padding: '20px 24px' }) }, React.createElement('div', { style: { whiteSpace: 'pre-wrap', fontSize: 13, lineHeight: 1.6, color: 'rgba(0,0,0,0.85)' } }, requirementContent)),
				React.createElement('div', { style: { padding: '12px 20px', borderTop: '1px solid #f0f0f0', textAlign: 'right' } }, React.createElement(Button, { onClick: function() { setReqSpecOpen(false); } }, '关闭'))
			)
		) : null,
		cancelConfirmOpen ? React.createElement('div', { style: styles.modalMask, onClick: function(e) { if (e.target === e.currentTarget) setCancelConfirmOpen(false); } },
			React.createElement('div', { style: Object.assign({}, styles.modalBox, { maxWidth: 520 }), onClick: function(e) { e.stopPropagation(); } },
				React.createElement('div', { style: styles.modalHeader }, '提示'),
				React.createElement('div', { style: Object.assign({}, styles.modalBody, { padding: '20px 24px' }) }, '取消将会丢失所有已填写内容，是否确认？'),
				React.createElement('div', { style: { padding: '12px 20px', borderTop: '1px solid #f0f0f0', textAlign: 'right', display: 'flex', gap: 12, justifyContent: 'flex-end' } },
					React.createElement(Button, { onClick: function() { setCancelConfirmOpen(false); } }, '否'),
					React.createElement(Button, { type: 'primary', onClick: function() { setCancelConfirmOpen(false); setEdited(false); message.info('已返回车辆租赁合同列表（原型）'); } }, '是')
				)
			)
		) : null,
		React.createElement('div', { style: styles.footer },
			React.createElement(Button, { type: 'primary', onClick: function() {
				// 提交并审核：做必填校验（品牌/型号/月租金/保证金/服务项目/费用/生效时间）
				var errs = [];
				for (var i = 0; i < newVehicleRows.length; i++) {
					var r = newVehicleRows[i];
					if (!r.brand) errs.push('第' + (i + 1) + '行品牌');
					if (!r.model) errs.push('第' + (i + 1) + '行型号');
					if (!r.monthRent || String(r.monthRent).trim() === '') errs.push('第' + (i + 1) + '行车辆月租金');
					if (!r.deposit || String(r.deposit).trim() === '') errs.push('第' + (i + 1) + '行保证金');
					var items = r.serviceItems || [];
					for (var j = 0; j < items.length; j++) {
						if (!items[j].project) errs.push('第' + (i + 1) + '行服务项目');
						if (!items[j].fee || String(items[j].fee).trim() === '') errs.push('第' + (i + 1) + '行服务费用');
						if (!items[j].effectiveDate) errs.push('第' + (i + 1) + '行生效时间');
					}
				}
				if (errs.length) { message.warning('请完善必填项：' + errs.join('、')); return; }
				setEdited(false);
				message.success('租赁合同已提交审核。同时该租赁合同重新触发审核流程；');
			} }, '提交并审核'),
			React.createElement(Button, { onClick: function() { setEdited(false); message.success('已保存（不校验必填项），仅操作人可查看编辑'); } }, '保存'),
			React.createElement(Button, { onClick: function() { if (edited) setCancelConfirmOpen(true); else message.info('已返回车辆租赁合同列表（原型）'); } }, '取消')
		)
	);
};
