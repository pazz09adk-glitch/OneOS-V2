// 【重要】必须使用 const Component 作为组件变量名 - Axhub 产品原型
// 车辆管理系统 - 新增租赁合同模块（整体实现，IE11+ 兼容，采用 antd）

const Component = function() {
  var antd = window.antd;
  var Input = antd.Input;
  var Select = antd.Select;
  var Button = antd.Button;
  var DatePicker = antd.DatePicker;
  var Modal = antd.Modal;
  var message = antd.message;
  var Option = Select.Option;
  var Row = antd.Row;
  var Col = antd.Col;

  var cs1 = React.useState('');
  var customerSearch = cs1[0];
  var setCustomerSearch = cs1[1];
  var cs2 = React.useState(null);
  var selectedCustomer = cs2[0];
  var setSelectedCustomer = cs2[1];
  var cs3 = React.useState(false);
  var customerDropdownOpen = cs3[0];
  var setCustomerDropdownOpen = cs3[1];
  var cs4 = React.useState('');
  var businessDept = cs4[0];
  var setBusinessDept = cs4[1];
  var cs5 = React.useState('');
  var businessOwner = cs5[0];
  var setBusinessOwner = cs5[1];
  var cs6 = React.useState('');
  var ownerFocusError = cs6[0];
  var setOwnerFocusError = cs6[1];
  var contractOriginalRef = React.useRef(null);
  var csContractOriginal = React.useState(null);
  var contractOriginal = csContractOriginal[0];
  var setContractOriginal = csContractOriginal[1];

  var bs1 = React.useState('');
  var projectName = bs1[0];
  var setProjectName = bs1[1];
  var bs2 = React.useState('');
  var contractType = bs2[0];
  var setContractType = bs2[1];
  var bs3 = React.useState('2026-02-16');
  var effectiveDate = bs3[0];
  var setEffectiveDate = bs3[1];
  var bs4 = React.useState('');
  var paymentMethod = bs4[0];
  var setPaymentMethod = bs4[1];
  var bs6 = React.useState('2027-02-16');
  var endDate = bs6[0];
  var setEndDate = bs6[1];
  var bs7 = React.useState('1');
  var paymentPeriod = bs7[0];
  var setPaymentPeriod = bs7[1];
  var bs8 = React.useState('嘉兴羚牛');
  var signingCompany = bs8[0];
  var setSigningCompany = bs8[1];
  var bs9 = React.useState('');
  var deliveryProvince = bs9[0];
  var setDeliveryProvince = bs9[1];
  var bs10 = React.useState('');
  var deliveryCity = bs10[0];
  var setDeliveryCity = bs10[1];
  var bs10b = React.useState(false);
  var deliveryRegionOpen = bs10b[0];
  var setDeliveryRegionOpen = bs10b[1];
  var deliveryRegionClickInsideRef = React.useRef(false);
  var nextRentalRowIdRef = React.useRef(2);
  var bs11 = React.useState('');
  var deliveryLocation = bs11[0];
  var setDeliveryLocation = bs11[1];
  var bs11a = React.useState('');
  var contractApprovalType = bs11a[0];
  var setContractApprovalType = bs11a[1];
  var bs12 = React.useState('');
  var remarks = bs12[0];
  var setRemarks = bs12[1];

  var as1 = React.useState([{ name: '', phone: '', idCard: '' }]);
  var authorizedList = as1[0];
  var setAuthorizedList = as1[1];

  var emptyRentalRow = { id: 1, brand: '', model: '', plateNo: '', vin: '', monthRent: '', serviceItems: [{ project: '', fee: '', effectiveDate: '' }], deposit: '', remark: '' };
  var os1 = React.useState([emptyRentalRow]);
  var rentalOrders = os1[0];
  var setRentalOrders = os1[1];
  var os1b = React.useState(null);
  var serviceModalRowIndex = os1b[0];
  var setServiceModalRowIndex = os1b[1];
  var os1c = React.useState('客户');
  var hydrogenBearer = os1c[0];
  var setHydrogenBearer = os1c[1];
  var os1d = React.useState('预付');
  var hydrogenPaymentMethod = os1d[0];
  var setHydrogenPaymentMethod = os1d[1];
  var os1e = React.useState('');
  var hydrogenPrepay = os1e[0];
  var setHydrogenPrepay = os1e[1];
  var os1f = React.useState('');
  var returnHydrogenPrice = os1f[0];
  var setReturnHydrogenPrice = os1f[1];
  var os1g = React.useState(null);
  var plateNoFocusRow = os1g[0];
  var setPlateNoFocusRow = os1g[1];
  var os1h = React.useState('');
  var plateNoSearch = os1h[0];
  var setPlateNoSearch = os1h[1];
  var os1i = React.useState(null);
  var serviceItemFocusRow = os1i[0];
  var setServiceItemFocusRow = os1i[1];
  var os1j = React.useState('');
  var serviceItemSearch = os1j[0];
  var setServiceItemSearch = os1j[1];
  var copyPopState = React.useState(null);
  var copyPopover = copyPopState[0];
  var setCopyPopover = copyPopState[1];
  var copyQtyState = React.useState('1');
  var copyQuantity = copyQtyState[0];
  var setCopyQuantity = copyQtyState[1];
  var os1k = React.useState(null);
  var plateNoDropdownRect = os1k[0];
  var setPlateNoDropdownRect = os1k[1];
  var os2 = React.useState('');
  var feeTemplate = os2[0];
  var setFeeTemplate = os2[1];
  var os3 = React.useState('month');
  var billingMethod = os3[0];
  var setBillingMethod = os3[1];

  var cc1State = React.useState(false);
  var cc1 = cc1State[0];
  var setCc1 = cc1State[1];
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
  var reqSpecState = React.useState(false);
  var reqSpecOpen = reqSpecState[0];
  var setReqSpecOpen = reqSpecState[1];
  var formErrorsState = React.useState({});
  var formErrors = formErrorsState[0];
  var setFormErrors = formErrorsState[1];

  var customerList = [
    { id: '1', name: '嘉兴某某物流有限公司', creditCode: '91330400MA2XXXXX1', address: '浙江省嘉兴市南湖区科技大道1号', contact: '张三', phone: '13800138001', email: 'zhangsan@example.com', companyName: '嘉兴某某物流有限公司', companyPhone: '0571-88888888', mailingAddress: '浙江省嘉兴市南湖区科技大道1号', bank: '中国工商银行嘉兴分行', bankAccount: '6222021234567890123', taxId: '91330400MA2XXXXX1' },
    { id: '2', name: '上海某某运输公司', creditCode: '91310000MA2XXXXX2', address: '上海市浦东新区张江高科技园区', contact: '李四', phone: '13800138002', email: 'lisi@example.com', companyName: '上海某某运输公司', companyPhone: '021-66666666', mailingAddress: '上海市浦东新区张江高科技园区', bank: '中国建设银行上海分行', bankAccount: '6217001234567890123', taxId: '91310000MA2XXXXX2' },
    { id: '3', name: '杭州某某租赁有限公司', creditCode: '91330100MA2XXXXX3', address: '浙江省杭州市余杭区未来科技城', contact: '王五', phone: '13800138003', email: 'wangwu@example.com', companyName: '杭州某某租赁有限公司', companyPhone: '0571-99999999', mailingAddress: '浙江省杭州市余杭区未来科技城', bank: '中国农业银行杭州分行', bankAccount: '6228481234567890123', taxId: '91330100MA2XXXXX3' }
  ];
  var deptList = [{ id: 'YW1', name: '业务1部', owners: ['张经理', '李专员', '王专员'] }, { id: 'YW2', name: '业务2部', owners: ['赵经理', '钱专员'] }, { id: 'YW3', name: '业务3部', owners: ['孙经理', '周专员'] }];
  var lessorCompanyList = (typeof window !== 'undefined' && window.ONEOS_LESSOR_COMPANIES) || [
    { id: 'jx', shortName: '嘉兴羚牛', legalName: '浙江羚牛氢能科技有限公司', creditCode: '91330481MA2JXXXXX', address: '浙江省嘉兴市平湖市乍浦镇杭州湾大道1号', contact: '法务部', phone: '0573-88888888', email: 'legal@lingniu-jx.com', accountName: '浙江羚牛氢能科技有限公司', bankName: '招商银行嘉兴分行', bankAccount: '120924165110301', hotline: '400-021-1773' },
    { id: 'sh', shortName: '上海羚牛', legalName: '羚牛氢能科技（上海）有限公司', creditCode: '91310115MA1HXXXXX', address: '上海市浦东新区张江高科技园区科苑路88号', contact: '法务部', phone: '021-88888888', email: 'legal@lingniu-sh.com', accountName: '羚牛氢能科技（上海）有限公司', bankName: '招商银行上海张江支行', bankAccount: '120924165110401', hotline: '400-021-1773' },
    { id: 'gd', shortName: '广东羚牛', legalName: '羚牛氢能科技（广东）有限公司', creditCode: '91440101MA5CXXXXX', address: '广东省广州市黄埔区科学城开源大道11号', contact: '法务部', phone: '020-88888888', email: 'legal@lingniu-gd.com', accountName: '羚牛氢能科技（广东）有限公司', bankName: '招商银行广州萝岗支行', bankAccount: '120924165110201', hotline: '400-021-1773' }
  ];
  var selectedLessor = lessorCompanyList.find(function(c) { return c.id === signingCompany; }) || null;
  var regionList = [
    { province: '浙江省', cities: ['杭州市', '宁波市', '嘉兴市', '湖州市'] },
    { province: '上海市', cities: ['上海市'] },
    { province: '广东省', cities: ['广州市', '深圳市', '东莞市'] }
  ];
  var feeTemplates = ['标准费用模板A', '标准费用模板B', '定制费用模板C'];
  var feeTemplateCertFees = [{ project: '补办行驶证', standard: '50元/次', serviceFee: '20' }, { project: '补办驾驶证', standard: '30元/次', serviceFee: '10' }, { project: '补办牌照', standard: '100元/次', serviceFee: '50' }];
  var feeTemplatePenaltyFees = [{ project: '提前退车违约金', standard: '月租金×1', serviceFee: '0' }, { project: '违章处理违约金', standard: '按实际发生', serviceFee: '50' }];
  var feeTemplateConsumables = [{ category: '轮胎', part: '前轮', partName: '轮胎A型', qty: 1, feeDetail: '500.00' }, { category: '易损件', part: '雨刮', partName: '雨刮片', qty: 2, feeDetail: '80.00' }];
  var feeTemplateOtherFees = [{ project: '上门送车费', standard: '100元/次', serviceFee: '50' }, { project: '上门收车费', standard: '100元/次', serviceFee: '50' }, { project: '清洗费', standard: '80元/次', serviceFee: '30' }];
  var brandList = ['品牌A', '品牌B', '品牌C', '品牌D'];
  var modelByBrand = { '品牌A': ['型号A1', '型号A2', '型号A3'], '品牌B': ['型号B1', '型号B2'], '品牌C': ['型号C1', '型号C2', '型号C3'], '品牌D': ['型号D1'] };
  var vehicleList = [
    { plateNo: '浙A10001', vin: 'L1234567890ABCDEF', brand: '品牌A', model: '型号A1' },
    { plateNo: '浙B20002', vin: 'L2234567890ABCDEF', brand: '品牌A', model: '型号A2' },
    { plateNo: '沪A30003', vin: 'L3234567890ABCDEF', brand: '品牌B', model: '型号B1' },
    { plateNo: '粤A40004', vin: 'L4234567890ABCDEF', brand: '品牌C', model: '型号C1' }
  ];
  var serviceItemOptions = ['代处理费用', '罚款', '违章处理违约金', '未参加安全培训', '车辆出险', '年检年审违约', '停车费', '设备损坏金（包含易损件）', '清洗费', '上门收车人工费', '上门收车送车行驶费', '上门收车基础服务费', '保险上浮', '保养费用', '补办驾驶证', '补办牌照', '补办营运证', '补办加氢证', '借用备用钥匙', '补配钥匙', '租金', '氢气费-客', '退还车氢量差', '能源费补缴', '能源费退款', '送车上门人工费', '送车上门送车行驶费', '送车上门基础服务费', '保证金', '氢气预付费', '维修费用', 'ETC-客', 'ETC卡缺损费', 'ETC设备缺损费', '电费-客', '未结算保养费', '未结算维修费', '车损费', '工具损坏或丢失费', '证件费', '广告损坏费', '送车服务费', '接车服务费', '补办行驶证', '超赔险', '轮胎磨损费', '无忧包', '轮胎保', '养护保', '尾板'];

  var filteredCustomers = customerList.filter(function(c) { return !customerSearch || c.name.indexOf(customerSearch) !== -1; });
  var currentDept = deptList.find(function(d) { return d.id === businessDept; });
  var ownerOptions = currentDept ? currentDept.owners : [];
  var contractCode = (function() {
    var cityCode = 'JX';
    var typeCode = 'ZL';
    var signCode = contractType === '正式合同' ? 'A' : 'B';
    var dateStr = effectiveDate ? effectiveDate.replace(/-/g, '') : '20260216';
    var deptCode = businessDept || 'YW1';
    return cityCode + typeCode + dateStr + deptCode + '01235' + signCode;
  })();
  var mainVehicleModelsDisplay = (function() {
    var models = [];
    var seen = {};
    for (var i = 0; i < rentalOrders.length; i++) {
      var m = rentalOrders[i].model;
      if (m && !seen[m]) { seen[m] = true; models.push(m); }
    }
    return models.join('、');
  })();
  var calcRowServiceFee = function(row) {
    var sum = 0;
    for (var i = 0; i < (row.serviceItems || []).length; i++) {
      var fee = parseFloat(row.serviceItems[i].fee);
      if (!isNaN(fee)) sum += fee;
    }
    return sum.toFixed(2);
  };
  var rentalTotalVehicles = rentalOrders.length;
  var rentalTotalRentService = rentalOrders.reduce(function(s, r) { return s + (parseFloat(r.monthRent) || 0) + (parseFloat(calcRowServiceFee(r)) || 0); }, 0);
  var rentalTotalDeposit = rentalOrders.reduce(function(s, r) { return s + (parseFloat(r.deposit) || 0); }, 0);
  var rentalTotalHydrogen = (hydrogenPaymentMethod === '预付' && hydrogenBearer === '客户') ? (parseFloat(hydrogenPrepay) || 0) : 0;

  var selectCustomer = function(c) {
    setSelectedCustomer(c);
    setCustomerSearch(c ? c.name : '');
    setCustomerDropdownOpen(false);
  };
  var deliveryRegionDisplay = deliveryProvince && deliveryCity ? deliveryProvince + ' / ' + deliveryCity : '';
  var selectDeliveryRegion = function(province, city) {
    setDeliveryProvince(province);
    setDeliveryCity(city);
    setDeliveryRegionOpen(false);
  };
  var scrollToCard = function(id) {
    var el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  var handleOwnerFocus = function() {
    if (!businessDept) setOwnerFocusError('请先选择业务部门');
    else setOwnerFocusError('');
  };
  var handleOwnerBlur = function() { setOwnerFocusError(''); };
  var openContractOriginal = function() {
    if (contractOriginal && contractOriginal.file) {
      var url = URL.createObjectURL(contractOriginal.file);
      window.open(url);
    }
  };

  var validateSubmitAndReview = function() {
    var errs = {};
    if (!selectedCustomer) errs.customer = '请选择客户';
    if (!businessDept) errs.businessDept = '请选择业务部门';
    if (!contractOriginal) errs.contractOriginal = '请上传合同原件';
    if (!businessOwner) errs.businessOwner = '请选择业务负责人';
    if (!projectName || !projectName.trim()) errs.projectName = '请输入项目名称';
    if (!contractType) errs.contractType = '请选择合同类型';
    if (!effectiveDate) errs.effectiveDate = '请选择生效日期';
    if (!paymentMethod) errs.paymentMethod = '请选择付款方式';
    if (!endDate) errs.endDate = '请选择结束日期';
    if (!paymentPeriod) errs.paymentPeriod = '请选择付款周期';
    if (!signingCompany) errs.signingCompany = '请选择签约公司';
    if (!deliveryProvince || !deliveryCity) errs.deliveryRegion = '请选择交车区域';
    if (!deliveryLocation || !String(deliveryLocation).trim()) errs.deliveryLocation = '请输入交车地点';
    if (!contractApprovalType) errs.contractApprovalType = '请选择合同审批类型';
    var authInvalid = authorizedList.some(function(a) { return !a.name || !a.name.trim() || !a.phone || !a.phone.trim() || !a.idCard || !a.idCard.trim(); });
    if (authInvalid) errs.authorizedList = '请完整填写被授权人姓名、联系电话、身份证';
    var rentalInvalid = rentalOrders.some(function(r) { return !r.brand || !r.model || !(r.monthRent && String(r.monthRent).trim()) || !(r.deposit && String(r.deposit).trim()); });
    if (rentalInvalid) errs.rentalOrders = '请完整填写租赁订单的品牌、型号、车辆月租金、保证金';
    if (!hydrogenBearer) errs.hydrogenBearer = '请选择氢费承担方';
    if (hydrogenBearer === '客户' && !hydrogenPaymentMethod) errs.hydrogenPaymentMethod = '请选择付款方式';
    if (hydrogenBearer === '客户' && hydrogenPaymentMethod === '预付' && (!hydrogenPrepay || !String(hydrogenPrepay).trim())) errs.hydrogenPrepay = '请输入氢气预付款';
    if (!returnHydrogenPrice || !String(returnHydrogenPrice).trim()) errs.returnHydrogenPrice = '请输入退还车氢气单价';
    if (!feeTemplate) errs.feeTemplate = '请选择费用模板';
    if (!billingMethod) errs.billingMethod = '请选择账单计算方式';
    setFormErrors(errs);
    if (Object.keys(errs).length > 0) {
      var firstId = errs.customer || errs.businessDept || errs.businessOwner ? 'card-customer' : (errs.projectName || errs.contractType || errs.effectiveDate || errs.paymentMethod || errs.endDate || errs.paymentPeriod || errs.signingCompany || errs.deliveryRegion || errs.deliveryLocation || errs.contractApprovalType || errs.contractOriginal) ? 'card-contract' : errs.authorizedList ? 'card-authorized' : (errs.rentalOrders || errs.hydrogenBearer || errs.hydrogenPaymentMethod || errs.hydrogenPrepay || errs.returnHydrogenPrice) ? 'card-rental' : errs.feeTemplate ? 'card-fee' : 'card-billing';
      setCc1(false); setCc2(false); setCc3(false); setCc4(false); setCc5(false); setCc6(false);
      setTimeout(function() { var el = document.getElementById(firstId); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 100);
      return false;
    }
    return true;
  };

  var addAuthorized = function() {
    setAuthorizedList(authorizedList.concat([{ name: '', phone: '', idCard: '' }]));
  };
  var removeAuthorized = function(index) {
    var next = authorizedList.slice(0);
    next.splice(index, 1);
    setAuthorizedList(next.length ? next : [{ name: '', phone: '', idCard: '' }]);
  };
  var updateAuthorized = function(index, field, value) {
    var next = authorizedList.slice(0);
    var cur = next[index] || {};
    var patch = {};
    patch[field] = value;
    next[index] = Object.assign({}, cur, patch);
    setAuthorizedList(next);
  };

  var addRentalRow = function() {
    setRentalOrders(rentalOrders.concat([{ id: nextRentalRowIdRef.current++, brand: '', model: '', plateNo: '', vin: '', monthRent: '', serviceItems: [{ project: '', fee: '', effectiveDate: '' }], deposit: '', remark: '' }]));
  };
  var removeRentalRow = function(index) {
    var next = rentalOrders.slice(0);
    next.splice(index, 1);
    setRentalOrders(next.length ? next : [Object.assign({}, emptyRentalRow)]);
  };
  var buildDuplicateRentalRow = function(sourceRow) {
    var serviceItemsCopy = (sourceRow.serviceItems || []).map(function(si) { return { project: si.project || '', fee: si.fee || '', effectiveDate: si.effectiveDate || '' }; });
    if (serviceItemsCopy.length === 0) serviceItemsCopy = [{ project: '', fee: '', effectiveDate: '' }];
    return { id: nextRentalRowIdRef.current++, brand: sourceRow.brand || '', model: sourceRow.model || '', plateNo: '', vin: '', monthRent: sourceRow.monthRent || '', serviceItems: serviceItemsCopy, deposit: sourceRow.deposit || '', remark: sourceRow.remark || '' };
  };
  var applyRentalRowCopies = function(rowIndex, count) {
    var row = rentalOrders[rowIndex];
    if (!row) return;
    var n = typeof count === 'number' ? count : parseInt(String(count), 10);
    if (isNaN(n) || n < 0) {
      if (message.warning) message.warning('请输入非负整数');
      return;
    }
    n = Math.floor(n);
    if (n === 0) {
      setCopyPopover(null);
      if (message.info) message.info('复制数量为 0，未新增行');
      return;
    }
    var next = rentalOrders.slice(0);
    var insertAt = rowIndex + 1;
    for (var i = 0; i < n; i++) {
      next.splice(insertAt + i, 0, buildDuplicateRentalRow(row));
    }
    setRentalOrders(next);
    setCopyPopover(null);
    if (message.success) message.success('已复制 ' + n + ' 条记录（车牌号已清空）');
  };
  var confirmRentalCopyPopover = function() {
    if (!copyPopover) return;
    if (copyQuantity === '') {
      if (message.warning) message.warning('请输入复制数量');
      return;
    }
    if (!/^\d+$/.test(copyQuantity)) {
      if (message.warning) message.warning('请输入非负整数');
      return;
    }
    applyRentalRowCopies(copyPopover.index, parseInt(copyQuantity, 10));
  };
  var openRentalCopyPopover = function(rowIndex, anchorEl) {
    if (!anchorEl || !anchorEl.getBoundingClientRect) return;
    var r = anchorEl.getBoundingClientRect();
    var cardH = 168;
    var top = r.bottom + 8;
    if (top + cardH > window.innerHeight - 8) top = Math.max(8, r.top - cardH - 8);
    var left = r.left;
    var cardW = 240;
    if (left + cardW > window.innerWidth - 8) left = Math.max(8, window.innerWidth - cardW - 8);
    setCopyPopover({ index: rowIndex, top: top, left: left });
    setCopyQuantity('1');
  };
  var updateRentalOrder = function(index, field, value) {
    var next = rentalOrders.slice(0);
    var cur = next[index] || {};
    var newRow = Object.assign({}, cur);
    newRow[field] = value;
    if (field === 'plateNo') {
      var v = vehicleList.find(function(x) { return x.plateNo === value; });
      if (v) {
        newRow.vin = v.vin || '';
        if (v.brand || v.model) {
          if (!cur.brand && !cur.model) {
            newRow.brand = v.brand || '';
            newRow.model = v.model || '';
          }
        }
      } else {
        newRow.vin = '';
      }
    }
    if (field === 'brand') newRow.model = '';
    next[index] = newRow;
    setRentalOrders(next);
  };
  var openServiceModal = function(index) { setServiceModalRowIndex(index); };
  var closeServiceModal = function() { setServiceModalRowIndex(null); };
  var addServiceItem = function() {
    if (serviceModalRowIndex === null) return;
    var next = rentalOrders.slice(0);
    var row = next[serviceModalRowIndex];
    var items = (row.serviceItems || []).concat([{ project: '', fee: '', effectiveDate: '' }]);
    var newRow = {};
    for (var k in row) { if (row.hasOwnProperty(k) && k !== 'serviceItems') newRow[k] = row[k]; }
    newRow.serviceItems = items;
    next[serviceModalRowIndex] = newRow;
    setRentalOrders(next);
  };
  var removeServiceItem = function(siIndex) {
    if (serviceModalRowIndex === null) return;
    var next = rentalOrders.slice(0);
    var row = next[serviceModalRowIndex];
    var items = (row.serviceItems || []).slice(0);
    items.splice(siIndex, 1);
    if (items.length === 0) items = [{ project: '', fee: '', effectiveDate: '' }];
    var newRow = {};
    for (var k in row) { if (row.hasOwnProperty(k) && k !== 'serviceItems') newRow[k] = row[k]; }
    newRow.serviceItems = items;
    next[serviceModalRowIndex] = newRow;
    setRentalOrders(next);
  };
  var updateServiceItem = function(siIndex, field, value) {
    if (serviceModalRowIndex === null) return;
    var next = rentalOrders.slice(0);
    var row = next[serviceModalRowIndex];
    var items = (row.serviceItems || []).slice(0);
    var item = items[siIndex] || {};
    var newItem = {};
    for (var k in item) { if (item.hasOwnProperty(k)) newItem[k] = item[k]; }
    newItem[field] = value;
    items[siIndex] = newItem;
    var newRow = {};
    for (var rk in row) { if (row.hasOwnProperty(rk) && rk !== 'serviceItems') newRow[rk] = row[rk]; }
    newRow.serviceItems = items;
    next[serviceModalRowIndex] = newRow;
    setRentalOrders(next);
  };

  React.useEffect(function() {
    if (!deliveryRegionOpen) return;
    var handler = function(e) {
      if (deliveryRegionClickInsideRef.current) { deliveryRegionClickInsideRef.current = false; return; }
      var el = document.getElementById('delivery-region-wrap');
      if (el && !el.contains(e.target)) setDeliveryRegionOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return function() { document.removeEventListener('mousedown', handler); };
  }, [deliveryRegionOpen]);

  React.useEffect(function() {
    if (!copyPopover) return;
    var handler = function(e) {
      var pop = document.getElementById('rental-copy-popover');
      if (pop && pop.contains(e.target)) return;
      setCopyPopover(null);
    };
    var t = window.setTimeout(function() {
      document.addEventListener('mousedown', handler);
    }, 0);
    return function() {
      window.clearTimeout(t);
      document.removeEventListener('mousedown', handler);
    };
  }, [copyPopover]);

  React.useEffect(function() {
    if (plateNoFocusRow === null) { setPlateNoDropdownRect(null); return; }
    var timer = setTimeout(function() {
      var el = document.getElementById('plate-no-input-' + plateNoFocusRow);
      if (el && el.getBoundingClientRect) {
        var rect = el.getBoundingClientRect();
        setPlateNoDropdownRect({ top: rect.bottom + 2, left: rect.left, width: rect.width });
      } else { setPlateNoDropdownRect(null); }
    }, 0);
    return function() { clearTimeout(timer); };
  }, [plateNoFocusRow]);

  var styles = {
    page: { padding: '16px 24px 88px', backgroundColor: '#f5f7fa', minHeight: '100vh', fontFamily: '"PingFang SC", "苹方-简", -apple-system, BlinkMacSystemFont, "Microsoft YaHei", sans-serif', fontSize: 14, color: 'rgba(0,0,0,0.88)' },
    breadcrumb: { marginBottom: 16, color: 'rgba(0,0,0,0.65)' },
    breadcrumbSep: { margin: '0 8px', color: 'rgba(0,0,0,0.35)' },
    anchorWrap: { position: 'fixed', top: 80, right: 24, zIndex: 100, backgroundColor: '#fff', borderRadius: 12, border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 1px 2px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.06)', padding: '12px 16px', minWidth: 168 },
    anchorItem: { display: 'block', padding: '8px 4px', minHeight: 36, color: '#1677ff', cursor: 'pointer', border: 'none', background: 'none', width: '100%', textAlign: 'left', fontSize: 14, borderRadius: 6, outline: 'none' },
    card: { backgroundColor: '#fff', borderRadius: 12, marginBottom: 16, border: '1px solid rgba(0,0,0,0.04)', boxShadow: '0 1px 2px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.06)', overflow: 'hidden' },
    cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid rgba(0,0,0,0.06)', cursor: 'pointer' },
    cardTitle: { fontSize: 16, fontWeight: 600, color: 'rgba(0,0,0,0.88)' },
    cardToggle: { color: 'rgba(0,0,0,0.45)', fontSize: 14 },
    cardBody: { padding: '20px 24px' },
    formRow: { display: 'flex', flexWrap: 'wrap', marginBottom: 16 },
    formCol: { flex: '0 0 33.33%', minWidth: 200, paddingRight: 16, marginBottom: 8 },
    formColFull: { flex: '0 0 100%', marginBottom: 8 },
    label: { display: 'block', marginBottom: 6, color: 'rgba(0,0,0,0.88)', fontWeight: 500 },
    labelRequired: { color: '#ff4d4f', marginRight: 4 },
    input: { width: '100%', padding: '8px 12px', border: '1px solid #d9d9d9', borderRadius: 4, fontSize: 14 },
    inputDisabled: { backgroundColor: '#f5f5f5', color: '#999', cursor: 'not-allowed' },
    inputError: { borderColor: '#ff4d4f' },
    select: { width: '100%', padding: '8px 12px', border: '1px solid #d9d9d9', borderRadius: 4, fontSize: 14 },
    textarea: { width: '100%', padding: '8px 12px', border: '1px solid #d9d9d9', borderRadius: 4, fontSize: 14, minHeight: 80, resize: 'vertical' },
    errMsg: { color: '#ff4d4f', fontSize: 12, marginTop: 4 },
    summaryList: { marginBottom: 16, display: 'flex', flexWrap: 'wrap', gap: 16 },
    summaryListItem: { flex: '0 0 calc(50% - 8px)', display: 'flex', alignItems: 'center', padding: '12px 16px', border: '1px solid #e8e8e8', borderRadius: 4, backgroundColor: '#fafafa', fontSize: 14, boxSizing: 'border-box' },
    summaryListLabel: { flex: '0 0 140px', color: '#666' },
    summaryListValue: { flex: 1, fontWeight: 600, color: '#333' },
    authRow: { display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 12 },
    authInput: { flex: 1, padding: '8px 12px', border: '1px solid #d9d9d9', borderRadius: 4, fontSize: 14 },
    btnDel: { padding: '8px 16px', color: '#ff4d4f', border: '1px solid #ff4d4f', borderRadius: 4, backgroundColor: '#fff', cursor: 'pointer', fontSize: 14 },
    btnAdd: { padding: '8px 16px', color: '#1677ff', border: '1px dashed #1677ff', borderRadius: 8, backgroundColor: '#fff', cursor: 'pointer', marginBottom: 16, fontSize: 14 },
    footer: { position: 'fixed', bottom: 0, left: 0, right: 0, padding: '12px 24px', backgroundColor: '#fff', borderTop: '1px solid rgba(0,0,0,0.06)', display: 'flex', gap: 12, justifyContent: 'flex-start', alignItems: 'center', zIndex: 99, boxShadow: '0 -2px 8px rgba(0,0,0,0.04)' },
    btn: { padding: '8px 24px', borderRadius: 8, border: '1px solid #d9d9d9', cursor: 'pointer', fontSize: 14, minHeight: 40 },
    btnPrimary: { backgroundColor: '#1677ff', color: '#fff', borderColor: '#1677ff' },
    btnDefault: { backgroundColor: '#fff', color: 'rgba(0,0,0,0.88)' },
    tag: { display: 'inline-block', padding: '2px 8px', marginRight: 8, marginBottom: 4, backgroundColor: '#e6f4ff', color: '#1677ff', borderRadius: 6, fontSize: 12 },
    regionCascader: { position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 4, backgroundColor: '#fff', border: '1px solid #d9d9d9', borderRadius: 4, boxShadow: '0 2px 8px rgba(0,0,0,0.12)', zIndex: 10, display: 'flex', minHeight: 200 },
    regionCascaderCol: { flex: 1, borderRight: '1px solid #f0f0f0', overflowY: 'auto' },
    regionCascaderColLast: { flex: 1 },
    regionCascaderItem: { padding: '10px 12px', cursor: 'pointer', fontSize: 14 },
    rentalTable: { width: '100%', borderCollapse: 'collapse', fontSize: 14 },
    rentalTh: { padding: '10px 8px', textAlign: 'left', borderBottom: '1px solid #e8e8e8', backgroundColor: '#fafafa', fontWeight: 600, fontSize: 14 },
    rentalTd: { padding: '8px', borderBottom: '1px solid #f0f0f0', verticalAlign: 'top', fontSize: 14 },
    rentalTdCenter: { padding: '8px', borderBottom: '1px solid #f0f0f0', verticalAlign: 'middle', fontSize: 14 },
    rentalInput: { width: '100%', padding: '6px 10px', border: '1px solid #d9d9d9', borderRadius: 4, fontSize: 14 },
    rentalInputDisabled: { backgroundColor: '#f5f5f5', color: '#999' },
    modalMask: { position: 'fixed', left: 0, top: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.45)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' },
    modalBox: { backgroundColor: '#fff', borderRadius: 8, width: '90%', maxWidth: 720, maxHeight: '85vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 4px 20px rgba(0,0,0,0.15)' },
    modalHeader: { padding: '16px 20px', borderBottom: '1px solid #f0f0f0', fontSize: 16, fontWeight: 600 },
    modalBody: { padding: 20, overflow: 'auto', flex: 1 },
    btnGroup: { display: 'inline-flex', border: '1px solid #d9d9d9', borderRadius: 4, overflow: 'hidden' },
    btnGroupItem: { padding: '8px 16px', border: 'none', borderRight: '1px solid #d9d9d9', backgroundColor: '#fff', color: '#333', cursor: 'pointer', fontSize: 14 },
    btnGroupItemLast: { borderRight: 'none' },
    btnGroupItemActive: { backgroundColor: '#1677ff', color: '#fff', borderColor: '#1677ff', borderRightColor: '#1677ff' },
    feeSectionTitle: { fontSize: 16, fontWeight: 600, color: '#333', marginTop: 20, marginBottom: 10 },
    feeSectionTitleFirst: { marginTop: 0 },
    modalFormInput: { width: '100%', padding: '8px 12px', border: '1px solid #d9d9d9', borderRadius: 4, fontSize: 14, height: 36, boxSizing: 'border-box' },
    copyPopoverCard: { position: 'fixed', zIndex: 2000, backgroundColor: '#fff', borderRadius: 8, boxShadow: '0 4px 20px rgba(0,0,0,0.12), 0 0 1px rgba(0,0,0,0.08)', border: '1px solid #f0f0f0', padding: '14px 16px', minWidth: 232, maxWidth: 'calc(100vw - 24px)' },
    copyPopoverTitle: { fontSize: 14, fontWeight: 600, color: 'rgba(0,0,0,0.88)', marginBottom: 12 },
    copyPopoverFooter: { display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 14 }
  };

  var CardBlock = function(props) {
    var panelId = 'card-panel-' + (props.id || String(props.title || '').replace(/\s/g, '-'));
    var titleId = 'card-title-' + panelId;
    return React.createElement('div', { id: props.id, style: Object.assign({}, styles.card, props.cardStyle || {}) },
      React.createElement('div', {
        style: styles.cardHeader,
        onClick: function() { props.setCollapsed(!props.collapsed); },
        role: 'button',
        tabIndex: 0,
        'aria-expanded': !props.collapsed,
        'aria-controls': panelId,
        onKeyDown: function(e) {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            props.setCollapsed(!props.collapsed);
          }
        }
      },
        React.createElement('span', { style: styles.cardTitle, id: titleId }, props.title),
        React.createElement('span', { style: styles.cardToggle }, props.collapsed ? '展开' : '收起')
      ),
      !props.collapsed ? React.createElement('div', { id: panelId, style: styles.cardBody, role: 'region', 'aria-labelledby': titleId }, props.children) : null
    );
  };

  var FormItem = function(props) {
    var span = props.fullWidth ? 24 : (props.span || 8); // 满宽占 24 列，常规占 8 列（1/3 宽度）
    var colStyle = props.colStyle || {};
    return React.createElement(Col, { span: span, style: Object.assign({ marginBottom: 16 }, colStyle) },
      React.createElement('label', { style: styles.label, className: 'acro-text-base' }, props.required ? React.createElement('span', { style: styles.labelRequired }, '*') : null, props.label),
      props.children,
      props.error ? React.createElement('div', { style: styles.errMsg, className: 'acro-text-xs', role: 'alert' }, props.error) : null
    );
  };

  var customerOptions = customerList.map(function(c) { return React.createElement(Option, { key: c.id, value: c.id }, c.name); });
  var customerFields = React.createElement(Row, { gutter: 24 },
    React.createElement(FormItem, { label: '客户名称', required: true, error: formErrors.customer }, React.createElement(Select, { placeholder: '请选择或输入搜索客户', style: { width: '100%' }, value: selectedCustomer ? selectedCustomer.id : undefined, onChange: function(id) { var c = customerList.find(function(x) { return x.id === id; }); selectCustomer(c || null); }, showSearch: true, allowClear: true, filterOption: function(input, opt) { return opt.children && String(opt.children).toLowerCase().indexOf((input || '').toLowerCase()) >= 0; }, status: formErrors.customer ? 'error' : undefined }, customerOptions)),
    React.createElement(FormItem, { label: '客户统一信用代码' }, React.createElement(Input, { value: selectedCustomer ? selectedCustomer.creditCode : '', disabled: true, style: { width: '100%' } })),
    React.createElement(FormItem, { label: '客户地址' }, React.createElement(Input, { value: selectedCustomer ? selectedCustomer.address : '', disabled: true, style: { width: '100%' } })),
    React.createElement(FormItem, { label: '客户联系人' }, React.createElement(Input, { value: selectedCustomer ? selectedCustomer.contact : '', disabled: true, style: { width: '100%' } })),
    React.createElement(FormItem, { label: '客户电话' }, React.createElement(Input, { value: selectedCustomer ? selectedCustomer.phone : '', disabled: true, style: { width: '100%' } })),
    React.createElement(FormItem, { label: '客户电子邮箱' }, React.createElement(Input, { value: selectedCustomer ? selectedCustomer.email : '', disabled: true, style: { width: '100%' } })),
    React.createElement(FormItem, { label: '企业名称' }, React.createElement(Input, { value: selectedCustomer ? selectedCustomer.companyName : '', disabled: true, style: { width: '100%' } })),
    React.createElement(FormItem, { label: '企业电话' }, React.createElement(Input, { value: selectedCustomer ? selectedCustomer.companyPhone : '', disabled: true, style: { width: '100%' } })),
    React.createElement(FormItem, { label: '邮寄地址' }, React.createElement(Input, { value: selectedCustomer ? selectedCustomer.mailingAddress : '', disabled: true, style: { width: '100%' } })),
    React.createElement(FormItem, { label: '开户银行' }, React.createElement(Input, { value: selectedCustomer ? selectedCustomer.bank : '', disabled: true, style: { width: '100%' } })),
    React.createElement(FormItem, { label: '银行账号' }, React.createElement(Input, { value: selectedCustomer ? selectedCustomer.bankAccount : '', disabled: true, style: { width: '100%' } })),
    React.createElement(FormItem, { label: '纳税人识别号' }, React.createElement(Input, { value: selectedCustomer ? selectedCustomer.taxId : '', disabled: true, style: { width: '100%' } })),
    React.createElement(FormItem, { label: '业务部门', required: true, error: formErrors.businessDept }, React.createElement(Select, { placeholder: '请选择业务部门', style: { width: '100%' }, value: businessDept || undefined, onChange: function(v) { setBusinessDept(v || ''); setBusinessOwner(''); }, status: formErrors.businessDept ? 'error' : undefined }, deptList.map(function(d, i) { return React.createElement(Option, { key: i, value: d.id }, d.name); }))),
    React.createElement(FormItem, { label: '业务负责人', required: true, error: formErrors.businessOwner || ownerFocusError }, React.createElement(Select, { placeholder: businessDept ? '请选择' : '请先选择业务部门', style: { width: '100%' }, value: businessOwner || undefined, onChange: function(v) { setBusinessOwner(v || ''); setOwnerFocusError(''); }, onFocus: handleOwnerFocus, onBlur: handleOwnerBlur, disabled: !businessDept, status: (formErrors.businessOwner || ownerFocusError) ? 'error' : undefined }, ownerOptions.map(function(o, i) { return React.createElement(Option, { key: i, value: o }, o); })))
  );

  var contractFormRow1 = React.createElement(Row, { gutter: 24 },
    React.createElement(FormItem, { label: '项目名称', required: true, error: formErrors.projectName }, React.createElement(Input, { placeholder: '请输入项目名称', value: projectName, onChange: function(e) { setProjectName(e.target.value); }, status: formErrors.projectName ? 'error' : undefined, style: { width: '100%' } })),
    React.createElement(FormItem, { label: '合同类型', required: true, error: formErrors.contractType }, React.createElement(Select, { placeholder: '请选择合同类型', style: { width: '100%' }, value: contractType || undefined, onChange: function(v) { setContractType(v || ''); }, status: formErrors.contractType ? 'error' : undefined }, React.createElement(Option, { value: '正式合同' }, '正式合同'), React.createElement(Option, { value: '试用合同' }, '试用合同'))),
    React.createElement(FormItem, { label: '生效日期', required: true, error: formErrors.effectiveDate }, React.createElement(DatePicker, { style: { width: '100%' }, format: 'YYYY-MM-DD', placeholder: '请选择生效日期', value: effectiveDate && window.moment ? window.moment(effectiveDate, 'YYYY-MM-DD') : null, onChange: function(d, dateStr) { setEffectiveDate(dateStr || ''); }, status: formErrors.effectiveDate ? 'error' : undefined })),
    React.createElement(FormItem, { label: '付款方式', required: true, error: formErrors.paymentMethod }, React.createElement(Select, { placeholder: '请选择付款方式', style: { width: '100%' }, value: paymentMethod || undefined, onChange: function(v) { setPaymentMethod(v || ''); }, status: formErrors.paymentMethod ? 'error' : undefined }, React.createElement(Option, { value: '预付' }, '预付'), React.createElement(Option, { value: '后付' }, '后付'))),
    React.createElement(FormItem, { label: '主要车型' }, React.createElement('div', { style: { padding: '8px 12px', minHeight: 36, border: '1px solid #d9d9d9', borderRadius: 4, backgroundColor: '#f5f5f5', display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' } }, mainVehicleModelsDisplay ? mainVehicleModelsDisplay.split('、').map(function(m, i) { return React.createElement('span', { key: i, style: styles.tag }, m); }) : React.createElement('span', { style: { color: '#999' } }, '根据租赁订单自动反写'))),
    React.createElement(FormItem, { label: '结束日期', required: true, error: formErrors.endDate }, React.createElement(DatePicker, { style: { width: '100%' }, format: 'YYYY-MM-DD', placeholder: '请选择结束日期', value: endDate && window.moment ? window.moment(endDate, 'YYYY-MM-DD') : null, onChange: function(d, dateStr) { setEndDate(dateStr || ''); }, status: formErrors.endDate ? 'error' : undefined })),
    React.createElement(FormItem, { label: '付款周期', required: true, error: formErrors.paymentPeriod }, React.createElement(Select, { placeholder: '请选择', style: { width: '100%' }, value: paymentPeriod || undefined, onChange: function(v) { setPaymentPeriod(v || ''); }, status: formErrors.paymentPeriod ? 'error' : undefined }, [1,2,3,4,5,6,7,8,9,10,11,12].map(function(n) { return React.createElement(Option, { key: n, value: String(n) }, n + '个月'); }))),
    React.createElement(FormItem, { label: '签约公司（甲方）', required: true, error: formErrors.signingCompany }, React.createElement(Select, { placeholder: '请选择旗下签约主体', style: { width: '100%' }, value: signingCompany || undefined, onChange: function(v) { setSigningCompany(v || ''); }, status: formErrors.signingCompany ? 'error' : undefined }, lessorCompanyList.map(function(c) { return React.createElement(Option, { key: c.id, value: c.id }, c.legalName); }))),
    React.createElement(FormItem, { label: '甲方全称' }, React.createElement(Input, { value: selectedLessor ? selectedLessor.legalName : '', disabled: true, style: { width: '100%' } })),
    React.createElement(FormItem, { label: '甲方地址' }, React.createElement(Input, { value: selectedLessor ? selectedLessor.address : '', disabled: true, style: { width: '100%' } })),
    React.createElement(FormItem, { label: '甲方联系人' }, React.createElement(Input, { value: selectedLessor ? selectedLessor.contact : '', disabled: true, style: { width: '100%' } })),
    React.createElement(FormItem, { label: '甲方电话' }, React.createElement(Input, { value: selectedLessor ? selectedLessor.phone : '', disabled: true, style: { width: '100%' } })),
    React.createElement(FormItem, { label: '收款户名' }, React.createElement(Input, { value: selectedLessor ? selectedLessor.accountName : '', disabled: true, style: { width: '100%' } })),
    React.createElement(FormItem, { label: '开户行' }, React.createElement(Input, { value: selectedLessor ? selectedLessor.bankName : '', disabled: true, style: { width: '100%' } })),
    React.createElement(FormItem, { label: '银行账号' }, React.createElement(Input, { value: selectedLessor ? selectedLessor.bankAccount : '', disabled: true, style: { width: '100%' } })),
    React.createElement(React.Fragment, null,
      React.createElement(FormItem, { label: '交车区域', required: true, error: formErrors.deliveryRegion }, React.createElement('div', { id: 'delivery-region-wrap', style: { position: 'relative' } }, React.createElement(Input, { style: Object.assign({}, formErrors.deliveryRegion ? { borderColor: '#ff4d4f' } : {}, { cursor: 'pointer', caretColor: 'transparent', width: '100%' }), placeholder: '请选择省-市', value: deliveryRegionDisplay, readOnly: true, role: 'combobox', 'aria-expanded': deliveryRegionOpen, 'aria-haspopup': 'listbox', 'aria-controls': 'delivery-region-cascader', 'aria-invalid': !!formErrors.deliveryRegion, 'aria-label': '交车区域，省-市', onClick: function() { setDeliveryRegionOpen(!deliveryRegionOpen); }, onKeyDown: function(e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setDeliveryRegionOpen(!deliveryRegionOpen); } } }), deliveryRegionOpen ? React.createElement('div', { id: 'delivery-region-cascader', style: styles.regionCascader, onMouseDown: function() { deliveryRegionClickInsideRef.current = true; } }, React.createElement('div', { style: styles.regionCascaderCol }, regionList.map(function(r, i) { var isActive = r.province === deliveryProvince; return React.createElement('div', { key: i, style: Object.assign({}, styles.regionCascaderItem, isActive ? { backgroundColor: '#e6f4ff', color: '#1677ff' } : {}), onMouseEnter: function(e) { if (!isActive) e.currentTarget.style.backgroundColor = '#f5f5f5'; }, onMouseLeave: function(e) { if (!isActive) e.currentTarget.style.backgroundColor = 'transparent'; }, onMouseDown: function(e) { e.preventDefault(); setDeliveryProvince(r.province); setDeliveryCity(''); } }, r.province); })), React.createElement('div', { style: styles.regionCascaderColLast }, deliveryProvince ? (regionList.find(function(x) { return x.province === deliveryProvince; }) || { cities: [] }).cities.map(function(c, i) { var isActive = c === deliveryCity; return React.createElement('div', { key: i, style: Object.assign({}, styles.regionCascaderItem, isActive ? { backgroundColor: '#e6f4ff', color: '#1677ff' } : {}), onMouseEnter: function(e) { if (!isActive) e.currentTarget.style.backgroundColor = '#f5f5f5'; }, onMouseLeave: function(e) { if (!isActive) e.currentTarget.style.backgroundColor = 'transparent'; }, onMouseDown: function(e) { e.preventDefault(); selectDeliveryRegion(deliveryProvince, c); } }, c); }) : React.createElement('div', { style: { padding: 16, color: '#999', fontSize: 13 } }, '请先选择省'))) : null))
    ),
    React.createElement(FormItem, { label: '交车地点', required: true, error: formErrors.deliveryLocation }, React.createElement(Input, { placeholder: '请输入交车地点', value: deliveryLocation, onChange: function(e) { setDeliveryLocation(e.target.value); }, status: formErrors.deliveryLocation ? 'error' : undefined, style: { width: '100%' } })),
    React.createElement(FormItem, { label: '合同审批类型', required: true, error: formErrors.contractApprovalType }, React.createElement(Select, { placeholder: '请选择合同审批类型', style: { width: '100%' }, value: contractApprovalType || undefined, onChange: function(v) { setContractApprovalType(v || ''); }, status: formErrors.contractApprovalType ? 'error' : undefined }, React.createElement(Option, { value: '标准合同审批' }, '标准合同审批'), React.createElement(Option, { value: '非标准合同审批' }, '非标准合同审批')))
  );
  var contractFormRow1Part2 = React.createElement(Row, { gutter: 24 },
    React.createElement(FormItem, { label: '合同原件', required: true, error: formErrors.contractOriginal },
      contractOriginal
        ? React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' } },
            React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' } },
              React.createElement(Button, { type: 'link', size: 'small', 'aria-label': '打开或预览合同原件：' + (contractOriginal.name || ''), onClick: function(e) { e.preventDefault(); openContractOriginal(); } }, contractOriginal.name),
              contractOriginal.size || contractOriginal.uploadTime ? React.createElement('span', { style: { color: '#999', fontSize: 12 } }, (contractOriginal.size ? contractOriginal.size : '') + (contractOriginal.size && contractOriginal.uploadTime ? ' · ' : '') + (contractOriginal.uploadTime || '')) : null
            ),
            React.createElement(Button, { type: 'button', size: 'small', danger: true, onClick: function() { setContractOriginal(null); } }, '删除')
          )
        : React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 8 } },
            React.createElement('input', { ref: contractOriginalRef, type: 'file', style: { display: 'none' }, onChange: function(e) {
            var f = e.target.files && e.target.files[0];
            if (f) {
              var sizeDisplay = f.size >= 1024 * 1024 ? (f.size / 1024 / 1024).toFixed(1) + ' MB' : (f.size / 1024).toFixed(1) + ' KB';
              var now = window.moment ? window.moment() : new Date();
              var uploadTimeStr = window.moment ? now.format('YYYY-MM-DD HH:mm') : now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0') + '-' + String(now.getDate()).padStart(2, '0') + ' ' + String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');
              setContractOriginal({ name: f.name, file: f, size: sizeDisplay, uploadTime: uploadTimeStr });
            }
            e.target.value = '';
          } }),
            React.createElement(Button, { type: 'default', style: { padding: '8px 16px', border: '1px solid #d9d9d9', borderRadius: 4, backgroundColor: '#fff', color: '#333', cursor: 'pointer', fontSize: 14 }, onClick: function() { if (contractOriginalRef.current) contractOriginalRef.current.click(); } }, '上传附件')
          )
    )
  );
  var contractFormRow2 = React.createElement(Row, { gutter: 24 }, React.createElement(FormItem, { label: '备注', fullWidth: true }, React.createElement(Input.TextArea, { placeholder: '请输入备注信息', value: remarks, onChange: function(e) { setRemarks(e.target.value); }, style: styles.textarea, rows: 4 })));

  var authorizedContent = React.createElement('div', null,
    React.createElement('div', { style: { display: 'flex', gap: 12, alignItems: 'center', marginBottom: 8 } }, React.createElement('span', { style: { flex: 1, fontWeight: 600, fontSize: 13 } }, React.createElement('span', { style: { color: '#ff4d4f', marginRight: 4 } }, '*'), '被授权人姓名'), React.createElement('span', { style: { flex: 1, fontWeight: 600, fontSize: 13 } }, React.createElement('span', { style: { color: '#ff4d4f', marginRight: 4 } }, '*'), '被授权人联系电话'), React.createElement('span', { style: { flex: 1, fontWeight: 600, fontSize: 13 } }, React.createElement('span', { style: { color: '#ff4d4f', marginRight: 4 } }, '*'), '被授权人身份证'), React.createElement('span', { style: { flex: '0 0 80px' } })),
    authorizedList.map(function(item, index) { return React.createElement('div', { key: index, style: styles.authRow }, React.createElement(Input, { style: Object.assign({}, styles.authInput, formErrors.authorizedList ? { borderColor: '#ff4d4f' } : {}, { flex: 1 }), placeholder: '请输入被授权人姓名', value: item.name, onChange: function(e) { updateAuthorized(index, 'name', e.target.value); } }), React.createElement(Input, { style: Object.assign({}, styles.authInput, formErrors.authorizedList ? { borderColor: '#ff4d4f' } : {}, { flex: 1 }), placeholder: '请输入被授权人联系电话', value: item.phone, onChange: function(e) { updateAuthorized(index, 'phone', e.target.value); } }), React.createElement(Input, { style: Object.assign({}, styles.authInput, formErrors.authorizedList ? { borderColor: '#ff4d4f' } : {}, { flex: 1 }), placeholder: '请输入被授权人身份证号', value: item.idCard, onChange: function(e) { updateAuthorized(index, 'idCard', e.target.value); } }), React.createElement(Button, { type: 'button', danger: true, onClick: function() { removeAuthorized(index); } }, '删除')); }),
    formErrors.authorizedList ? React.createElement('div', { style: styles.errMsg }, formErrors.authorizedList) : null,
    React.createElement(Button, { type: 'dashed', style: { width: '100%', marginBottom: 16 }, onClick: addAuthorized }, '添加一行')
  );

  var hydrogenFormRow = (function() {
    var hydrogenFields = [];
    hydrogenFields.push(React.createElement(FormItem, { label: '氢费承担方', required: true, error: formErrors.hydrogenBearer }, React.createElement(Select, { style: { width: '100%' }, value: hydrogenBearer || undefined, onChange: function(v) { setHydrogenBearer(v || ''); setHydrogenPaymentMethod(v === '客户' ? '预付' : ''); }, status: formErrors.hydrogenBearer ? 'error' : undefined }, React.createElement(Option, { value: '我方' }, '我方'), React.createElement(Option, { value: '客户' }, '客户'))));
    if (hydrogenBearer === '客户') { hydrogenFields.push(React.createElement(FormItem, { label: '付款方式', required: true, error: formErrors.hydrogenPaymentMethod }, React.createElement(Select, { style: { width: '100%' }, value: hydrogenPaymentMethod || undefined, onChange: function(v) { setHydrogenPaymentMethod(v || ''); }, status: formErrors.hydrogenPaymentMethod ? 'error' : undefined }, React.createElement(Option, { value: '预付' }, '预付'), React.createElement(Option, { value: '月付款' }, '月付款'), React.createElement(Option, { value: '自行结算' }, '自行结算')))); }
    var hydrogenPrepayInput = React.createElement(Input, { placeholder: '0.00', value: hydrogenPrepay, onChange: function(e) { setHydrogenPrepay(e.target.value); }, addonAfter: '元', status: formErrors.hydrogenPrepay ? 'error' : undefined, style: { width: '100%' } });
    var returnHydrogenInput = React.createElement(Input, { placeholder: '0.00', value: returnHydrogenPrice, onChange: function(e) { setReturnHydrogenPrice(e.target.value); }, addonAfter: '元', status: formErrors.returnHydrogenPrice ? 'error' : undefined, style: { width: '100%' } });
    var returnHydrogenColStyle = hydrogenPaymentMethod === '预付' ? { flex: '1 1 0', minWidth: 180 } : { flex: '0 0 calc(50% - 8px)', minWidth: 180 };
    hydrogenFields.push(React.createElement('div', { key: 'hydrogen-amount-row', style: { display: 'flex', gap: 16, flex: '1 1 100%' } }, hydrogenPaymentMethod === '预付' ? React.createElement(FormItem, { label: '氢气预付款', required: true, error: formErrors.hydrogenPrepay, colStyle: { flex: '1 1 0', minWidth: 180 } }, hydrogenPrepayInput) : null, React.createElement(FormItem, { label: '退还车氢气单价', required: true, error: formErrors.returnHydrogenPrice, colStyle: returnHydrogenColStyle }, returnHydrogenInput)));
    return React.createElement.apply(React, [Row, { gutter: 24, style: { marginTop: 20 } }].concat(hydrogenFields));
  })();

  var plateNoOptions = vehicleList.map(function(v) { return React.createElement(Option, { key: v.plateNo, value: v.plateNo }, v.plateNo); });
  var rentalTableBody = rentalOrders.map(function(row, idx) {
    var modelOpts = row.brand ? (modelByBrand[row.brand] || []) : [];
    var rowId = row.id != null ? row.id : idx;
    return React.createElement('tr', { key: rowId },
      React.createElement('td', { style: styles.rentalTdCenter }, idx + 1),
      React.createElement('td', { style: styles.rentalTd }, React.createElement(Select, { style: { width: '100%', minWidth: 90 }, value: row.brand || undefined, onChange: function(v) { updateRentalOrder(idx, 'brand', v || ''); }, placeholder: '请选择' }, brandList.map(function(b, i) { return React.createElement(Option, { key: i, value: b }, b); }))),
      React.createElement('td', { style: styles.rentalTd }, React.createElement(Select, { style: { width: '100%', minWidth: 90 }, value: row.model || undefined, onChange: function(v) { updateRentalOrder(idx, 'model', v || ''); }, disabled: !row.brand, placeholder: '请选择' }, modelOpts.map(function(m, i) { return React.createElement(Option, { key: i, value: m }, m); }))),
      React.createElement('td', { style: styles.rentalTd }, React.createElement(Select, { style: { width: '100%' }, placeholder: '请选择或输入搜索', value: row.plateNo || undefined, onChange: function(v) { updateRentalOrder(idx, 'plateNo', v || ''); }, showSearch: true, allowClear: true, filterOption: function(input, opt) { return opt && opt.children && String(opt.children).toLowerCase().indexOf((input || '').toLowerCase()) >= 0; } }, plateNoOptions)),
      React.createElement('td', { style: styles.rentalTd }, React.createElement(Input, { value: row.vin || '', disabled: true, style: { width: '100%' } })),
      React.createElement('td', { style: styles.rentalTd }, React.createElement('div', { style: { display: 'flex', alignItems: 'center' } }, React.createElement(Input, { placeholder: '0.00', value: row.monthRent || '', onChange: function(e) { updateRentalOrder(idx, 'monthRent', e.target.value); }, style: styles.rentalInput }), React.createElement('span', { style: { marginLeft: 4, whiteSpace: 'nowrap' } }, '元'))),
      React.createElement('td', { style: styles.rentalTdCenter }, React.createElement(Button, { type: 'link', size: 'small', onClick: function() { openServiceModal(idx); } }, '管理')),
      React.createElement('td', { style: styles.rentalTdCenter }, calcRowServiceFee(row) + ' 元'),
      React.createElement('td', { style: styles.rentalTd }, React.createElement('div', { style: { display: 'flex', alignItems: 'center' } }, React.createElement(Input, { placeholder: '0.00', value: row.deposit || '', onChange: function(e) { updateRentalOrder(idx, 'deposit', e.target.value); }, style: styles.rentalInput }), React.createElement('span', { style: { marginLeft: 4, whiteSpace: 'nowrap' } }, '元'))),
      React.createElement('td', { style: styles.rentalTd }, React.createElement(Input, { placeholder: '备注', value: row.remark || '', onChange: function(e) { updateRentalOrder(idx, 'remark', e.target.value); }, style: Object.assign({}, styles.rentalInput, { width: '100%' }) })),
      React.createElement('td', { style: styles.rentalTdCenter }, React.createElement('div', { style: { display: 'inline-flex', gap: 4, alignItems: 'center' } }, React.createElement(Button, { type: 'link', size: 'small', 'aria-haspopup': 'dialog', 'aria-expanded': copyPopover && copyPopover.index === idx, onClick: function(e) { e.preventDefault(); e.stopPropagation(); openRentalCopyPopover(idx, e.currentTarget); } }, '复制'), React.createElement(Button, { type: 'link', size: 'small', danger: true, onClick: function() { removeRentalRow(idx); } }, '删除')))
    );
  });

  var rentalSummary = React.createElement('div', { style: styles.summaryList },
    React.createElement('div', { style: styles.summaryListItem }, React.createElement('span', { style: styles.summaryListLabel }, '租赁车辆数'), React.createElement('span', { style: styles.summaryListValue }, rentalTotalVehicles + ' 辆')),
    React.createElement('div', { style: styles.summaryListItem }, React.createElement('span', { style: styles.summaryListLabel }, '租金及服务费合计'), React.createElement('span', { style: styles.summaryListValue }, rentalTotalRentService.toFixed(2) + ' 元')),
    React.createElement('div', { style: styles.summaryListItem }, React.createElement('span', { style: styles.summaryListLabel }, '保证金总额'), React.createElement('span', { style: styles.summaryListValue }, rentalTotalDeposit.toFixed(2) + ' 元')),
    React.createElement('div', { style: styles.summaryListItem }, React.createElement('span', { style: styles.summaryListLabel }, '氢气预付款金额'), React.createElement('span', { style: styles.summaryListValue }, rentalTotalHydrogen.toFixed(2) + ' 元'))
  );
  var reqStarStyle = { color: '#ff4d4f', marginRight: 4 };
  var reqStar = React.createElement('span', { style: reqStarStyle }, '*');
  var rentalTh1 = React.createElement('th', { style: Object.assign({}, styles.rentalTh, { width: 50, verticalAlign: 'middle' }) }, '序号');
  var rentalTh2 = React.createElement('th', { style: Object.assign({}, styles.rentalTh, { width: 100 }) }, reqStar, '品牌');
  var rentalTh3 = React.createElement('th', { style: Object.assign({}, styles.rentalTh, { width: 100 }) }, reqStar, '型号');
  var rentalTh4 = React.createElement('th', { style: Object.assign({}, styles.rentalTh, { width: 120 }) }, '车牌号');
  var rentalTh5 = React.createElement('th', { style: Object.assign({}, styles.rentalTh, { width: 160 }) }, '车辆识别代码');
  var rentalTh6 = React.createElement('th', { style: Object.assign({}, styles.rentalTh, { width: 120 }) }, reqStar, '车辆月租金');
  var rentalTh7 = React.createElement('th', { style: Object.assign({}, styles.rentalTh, { width: 80, verticalAlign: 'middle' }) }, '服务费项目');
  var rentalTh8 = React.createElement('th', { style: Object.assign({}, styles.rentalTh, { width: 90, verticalAlign: 'middle' }) }, '服务费');
  var rentalTh9 = React.createElement('th', { style: Object.assign({}, styles.rentalTh, { width: 100 }) }, reqStar, '保证金');
  var rentalTh10 = React.createElement('th', { style: Object.assign({}, styles.rentalTh, { width: 80 }) }, '备注');
  var rentalTh11 = React.createElement('th', { style: Object.assign({}, styles.rentalTh, { width: 90, verticalAlign: 'middle' }) }, '操作');
  var rentalTableThead = React.createElement('thead', null, React.createElement('tr', null, rentalTh1, rentalTh2, rentalTh3, rentalTh4, rentalTh5, rentalTh6, rentalTh7, rentalTh8, rentalTh9, rentalTh10, rentalTh11));
  var rentalTableTbody = React.createElement('tbody', null, rentalTableBody);
  var rentalTableEl = React.createElement('table', { style: styles.rentalTable }, rentalTableThead, rentalTableTbody);
  var rentalTableWrap = React.createElement('div', { style: { overflowX: 'auto', marginBottom: 16 } }, rentalTableEl);
  var rentalCopyPopoverEl = copyPopover
    ? React.createElement('div', {
      id: 'rental-copy-popover',
      role: 'dialog',
      'aria-modal': 'false',
      'aria-label': '复制租赁订单行',
      style: Object.assign({}, styles.copyPopoverCard, { top: copyPopover.top, left: copyPopover.left }),
      onMouseDown: function(e) { e.stopPropagation(); }
    },
      React.createElement('div', { style: styles.copyPopoverTitle }, '复制本行'),
      React.createElement('div', null,
        React.createElement('label', { style: { display: 'block', fontSize: 13, color: 'rgba(0,0,0,0.65)', marginBottom: 6 } }, '复制数量'),
        React.createElement(Input, {
          value: copyQuantity,
          placeholder: '非负整数，如 3',
          inputMode: 'numeric',
          pattern: '[0-9]*',
          autoComplete: 'off',
          'aria-label': '复制数量，非负整数',
          onChange: function(e) {
            var raw = (e.target && e.target.value) || '';
            var digits = raw.replace(/\D/g, '');
            setCopyQuantity(digits);
          },
          onPressEnter: confirmRentalCopyPopover,
          style: { width: '100%' }
        })
      ),
      React.createElement('div', { style: styles.copyPopoverFooter },
        React.createElement(Button, { size: 'small', onClick: function() { setCopyPopover(null); } }, '取消'),
        React.createElement(Button, { type: 'primary', size: 'small', onClick: confirmRentalCopyPopover }, '确认')
      )
    )
    : null;

  var rentalContent = React.createElement('div', null, rentalSummary, formErrors.rentalOrders ? React.createElement('div', { style: styles.errMsg }, formErrors.rentalOrders) : null, rentalTableWrap, React.createElement(Button, { type: 'dashed', style: { marginTop: 12, width: '100%' }, onClick: addRentalRow }, '添加一行'), hydrogenFormRow);

  var feeTableHeader3 = React.createElement('tr', null, React.createElement('th', { style: styles.rentalTh }, '项目'), React.createElement('th', { style: styles.rentalTh }, '收费标准'), React.createElement('th', { style: styles.rentalTh }, '服务费'));
  var feeTableHeader5 = React.createElement('tr', null, React.createElement('th', { style: styles.rentalTh }, '类别'), React.createElement('th', { style: styles.rentalTh }, '损坏部位'), React.createElement('th', { style: styles.rentalTh }, '配件'), React.createElement('th', { style: styles.rentalTh }, '数量'), React.createElement('th', { style: styles.rentalTh }, '费用明细'));
  var makeFeeRow3 = function(r, i) {
    var td1 = React.createElement('td', { style: styles.rentalTd }, r.project);
    var td2 = React.createElement('td', { style: styles.rentalTd }, r.standard);
    var td3 = React.createElement('td', { style: styles.rentalTd }, r.serviceFee);
    return React.createElement('tr', { key: i }, td1, td2, td3);
  };
  var makeFeeRow5 = function(r, i) {
    var td1 = React.createElement('td', { style: styles.rentalTd }, r.category);
    var td2 = React.createElement('td', { style: styles.rentalTd }, r.part);
    var td3 = React.createElement('td', { style: styles.rentalTd }, r.partName);
    var td4 = React.createElement('td', { style: styles.rentalTd }, r.qty);
    var td5 = React.createElement('td', { style: styles.rentalTd }, r.feeDetail);
    return React.createElement('tr', { key: i }, td1, td2, td3, td4, td5);
  };
  var feeCertRows = feeTemplateCertFees.map(makeFeeRow3);
  var feePenaltyRows = feeTemplatePenaltyFees.map(makeFeeRow3);
  var feeConsumablesRows = feeTemplateConsumables.map(makeFeeRow5);
  var feeOtherRows = feeTemplateOtherFees.map(makeFeeRow3);
  var feeCertTable = React.createElement('table', { style: styles.rentalTable }, React.createElement('thead', null, feeTableHeader3), React.createElement('tbody', null, feeCertRows));
  var feePenaltyTable = React.createElement('table', { style: styles.rentalTable }, React.createElement('thead', null, feeTableHeader3), React.createElement('tbody', null, feePenaltyRows));
  var feeConsumablesTable = React.createElement('table', { style: styles.rentalTable }, React.createElement('thead', null, feeTableHeader5), React.createElement('tbody', null, feeConsumablesRows));
  var feeOtherTable = React.createElement('table', { style: styles.rentalTable }, React.createElement('thead', null, feeTableHeader3), React.createElement('tbody', null, feeOtherRows));
  var feeTemplateSelect = React.createElement(Row, { gutter: 24 }, React.createElement(FormItem, { label: '选择费用模板', required: true, error: formErrors.feeTemplate }, React.createElement(Select, { placeholder: '请选择费用模板', style: { width: '100%' }, value: feeTemplate || undefined, onChange: function(v) { setFeeTemplate(v || ''); }, status: formErrors.feeTemplate ? 'error' : undefined }, feeTemplates.map(function(f, i) { return React.createElement(Option, { key: i, value: f }, f); }))));
  var feeTemplateBody = feeTemplate ? React.createElement('div', null,
    React.createElement('div', { style: Object.assign({}, styles.feeSectionTitle, styles.feeSectionTitleFirst) }, '证照补办费用'),
    feeCertTable,
    React.createElement('div', { style: styles.feeSectionTitle }, '违约金费用'),
    feePenaltyTable,
    React.createElement('div', { style: styles.feeSectionTitle }, '易损件信息'),
    feeConsumablesTable,
    React.createElement('div', { style: styles.feeSectionTitle }, '其他费用信息'),
    feeOtherTable
  ) : null;
  var feeContent = React.createElement('div', null, feeTemplateSelect, feeTemplateBody);

  var billingBtnBase = { padding: '12px 16px', border: '1px solid #d9d9d9', borderRadius: 0, backgroundColor: '#fff', color: '#333', cursor: 'pointer', fontSize: 14, textAlign: 'left', flex: 1, minWidth: 0, width: 0, minHeight: 88, height: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'flex-start', overflow: 'visible' };
  var billingContent = React.createElement('div', null,
    React.createElement('div', { style: { display: 'flex', border: formErrors.billingMethod ? '1px solid #ff4d4f' : '1px solid #d9d9d9', borderRadius: 4, overflow: 'hidden', alignItems: 'stretch' } },
      React.createElement(Button, { type: 'button', 'aria-pressed': billingMethod === 'month', 'aria-label': '账单按自然月结算', style: Object.assign({}, billingBtnBase, { borderRight: '1px solid #d9d9d9' }, billingMethod === 'month' ? { backgroundColor: '#1677ff', color: '#fff', borderColor: '#1677ff' } : {}), onClick: function() { setBillingMethod('month'); } }, React.createElement('div', { style: { width: '100%' } }, React.createElement('div', { style: { fontWeight: 600, marginBottom: 6 } }, '按自然月结算'), React.createElement('div', { style: { fontSize: 12, opacity: 0.9, whiteSpace: 'normal', wordBreak: 'break-word', lineHeight: 1.5 } }, '账单按照第一个月计费日期开始-当月最后一天为第一期，之后按自然月方式形成每一期账单，例如付款周期为2个月，则第二期账单从2月1日-3月31日。'))),
      React.createElement(Button, { type: 'button', 'aria-pressed': billingMethod === 'period', 'aria-label': '账单按付款周期天数结算', style: Object.assign({}, billingBtnBase, billingMethod === 'period' ? { backgroundColor: '#1677ff', color: '#fff', borderColor: '#1677ff' } : {}), onClick: function() { setBillingMethod('period'); } }, React.createElement('div', { style: { width: '100%' } }, React.createElement('div', { style: { fontWeight: 600, marginBottom: 6 } }, '按付款周期天数结算'), React.createElement('div', { style: { fontSize: 12, opacity: 0.9, whiteSpace: 'normal', wordBreak: 'break-word', lineHeight: 1.5 } }, '账单按照合同基本信息中付款周期实际天数形成一期账单，例如付款周期为60天，则该账单账期为60天，每60天会自动生成新一期账单。')))
    ),
    formErrors.billingMethod ? React.createElement('div', { style: styles.errMsg }, formErrors.billingMethod) : null
  );

  var serviceModalRows = serviceModalRowIndex !== null && rentalOrders[serviceModalRowIndex] ? rentalOrders[serviceModalRowIndex].serviceItems : [];
  var serviceModalContent = serviceModalRowIndex !== null ? React.createElement('div', { style: styles.modalMask, onClick: function(e) { if (e.target === e.currentTarget) closeServiceModal(); } }, React.createElement('div', { style: styles.modalBox, onClick: function(e) { e.stopPropagation(); } }, React.createElement('div', { style: styles.modalHeader }, '服务项目'), React.createElement('div', { style: styles.modalBody }, React.createElement('table', { style: styles.rentalTable }, React.createElement('thead', null, React.createElement('tr', null, React.createElement('th', { style: styles.rentalTh }, '服务项目'), React.createElement('th', { style: styles.rentalTh }, '费用'), React.createElement('th', { style: styles.rentalTh }, '生效时间'), React.createElement('th', { style: Object.assign({}, styles.rentalTh, { width: 80 }) }, '操作'))), React.createElement('tbody', null, serviceModalRows.map(function(si, siIdx) { var filteredServiceOpts = serviceItemOptions.filter(function(o) { return !serviceItemSearch || o.indexOf(serviceItemSearch) !== -1; }); return React.createElement('tr', { key: siIdx }, React.createElement('td', { style: styles.rentalTd }, React.createElement(Select, { style: { width: '100%' }, placeholder: '请选择服务项目', value: si.project || undefined, onChange: function(v) { updateServiceItem(siIdx, 'project', v || ''); }, showSearch: true, filterOption: function(input, opt) { return opt && opt.children && String(opt.children).toLowerCase().indexOf((input || '').toLowerCase()) >= 0; }, allowClear: true }, serviceItemOptions.map(function(opt, oi) { return React.createElement(Option, { key: oi, value: opt }, opt); }))), React.createElement('td', { style: styles.rentalTd }, React.createElement(Input, { placeholder: '0.00', value: si.fee || '', onChange: function(e) { updateServiceItem(siIdx, 'fee', e.target.value); }, addonAfter: '元', style: { width: '100%' } })), React.createElement('td', { style: styles.rentalTd }, React.createElement(DatePicker, { style: { width: '100%' }, format: 'YYYY-MM-DD', placeholder: '请选择生效时间', value: si.effectiveDate && window.moment ? window.moment(si.effectiveDate, 'YYYY-MM-DD') : null, onChange: function(d, dateStr) { updateServiceItem(siIdx, 'effectiveDate', dateStr || ''); } })), React.createElement('td', { style: styles.rentalTd }, React.createElement(Button, { type: 'link', size: 'small', danger: true, onClick: function() { removeServiceItem(siIdx); } }, '删除'))); }))), React.createElement(Button, { type: 'dashed', style: { marginTop: 12, width: '100%' }, onClick: addServiceItem }, '添加一行')), React.createElement('div', { style: { padding: '12px 20px', borderTop: '1px solid #f0f0f0', textAlign: 'right', display: 'flex', gap: 12, justifyContent: 'flex-end' } }, React.createElement(Button, { type: 'primary', onClick: function() { closeServiceModal(); } }, '保存'), React.createElement(Button, { onClick: closeServiceModal }, '关闭')))) : null;

  var requirementContent = '车辆租赁合同-新增（2026年3月3日版本）\n「数字化资产ONE-OS运管平台」中的「车辆租赁合同」-「新增租赁合同」模块，点击车辆租赁合同右上角「新增」进行创建；\n1.面包屑：\n#业务管理-车辆租赁合同-新增合同\n\n2.客户基本信息卡片：\n#用于从客户列表中选择客户，并将该合同绑定到业务部门及业务负责人（绑定业务部门/业务负责人主要为了后期从部门/业务负责人维度进行数据统计）；\n2.1.客户名称：必选项，选择器，支持从输入框内输入内容进行模糊搜索，从客户信息列表中选择对应客户（只显示已通过审核的客户）；\n2.2.客户统一信用代码：输入框（禁用状态），根据所选客户自动从客户信息列表中拉取对应客户-「信用代码」字段；\n2.3.客户地址：输入框（禁用状态），根据所选客户自动从客户信息列表中拉取对应客户-「客户地址」字段；\n2.4.客户联系人：输入框（禁用状态），根据所选客户自动从客户信息列表中拉取对应客户-「客户联系人」字段；\n2.5.客户电话：输入框（禁用状态），根据所选客户自动从客户信息列表中拉取对应客户-「客户电话」字段；\n2.6.客户电子邮箱：输入框（禁用状态），根据所选客户自动从客户信息列表中拉取对应客户-「客户电子邮箱」字段；\n2.7.企业名称：输入框（禁用状态），根据所选客户自动从客户信息列表中拉取对应客户-「企业名称」字段；\n2.8.企业电话：输入框（禁用状态），根据所选客户自动从客户信息列表中拉取对应客户-「企业电话」字段；\n2.9.邮寄地址：输入框（禁用状态），根据所选客户自动从客户信息列表中拉取对应客户-「邮寄地址」字段；\n2.10.开户银行：输入框（禁用状态），根据所选客户自动从客户信息列表中拉取对应客户-「开户银行」字段；\n2.11.银行账号：输入框（禁用状态），根据所选客户自动从客户信息列表中拉取对应客户-「银行账号」字段；\n2.12.纳税人识别号：输入框（禁用状态），根据所选客户自动从客户信息列表中拉取对应客户-「纳税人识别号」字段；\n2.13.业务部门：必选项，选择器，从部门表中选择该租赁合同对应部门；\n2.14.业务负责人：必选项，选择器，从已选业务部门下拉取对应业务负责人，未选择业务部门时，业务负责人字段不可选；\n\n3.合同基本信息卡片：\n#用于定义租赁合同基本情况和付款方式；\n3.1.项目名称：必填项，输入框，用于定义该合同项目名称，默认提示信息"请输入项目名称"；\n3.2.合同类型：必选项，选择器，合同类型分为「正式合同」「试用合同」；\n3.3.生效日期：必选项，日期选择器，格式为YYYY-MM-DD，精确至天，默认为点击新增日期；\n3.4.付款方式：必选项，付款方式分为「预付」「后付」两种；\n      3.4.1.如果选择预付，以对应「付款方式」和「付款周期」规则，在每一期新账单生成就列入业务待办（工作台功能），同时以消息通知对应用户；\n      3.4.2.如果选择后付，以对应「付款方式」和「付款周期」规则，在每一期新账单生成时，将前一期账单列入业务待办（工作台功能），同时以消息通知对应用户；\n3.5.主要车型：输入框（禁用状态），根据租赁订单信息中所有所选车型，自动反写入输入框并以标签形式显示，支持多车型显示，标签显示：型号名称；\n3.6.结束日期：必选项，日期选择器，格式为YYYY-MM-DD，精确至天；\n      3.6.1.合同结束日期前30天将以消息提醒方式提醒（消息中心、工作台）；\n      3.6.2.到达合同结束日期时，租赁账单将会立刻停止计算，作为最后一期账单；\n      3.6.3.续签合同/转正式合同将重新生成账单，不会对旧合同账单做任何继承处理；\n3.7.付款周期：必选项，选择器，支持1个月-12个月 12种付款周期，账单将以此周期和账单计算方式规则，从交车任务形成的交车单进行完整交车后，定时自动生成账单；\n3.8.签约公司：必选项，选择器，从组织机构表中获取所有根组织机构（如嘉兴羚牛、上海羚牛、广东羚牛等），默认显示新增用户当前机构，可手动修改，后期需要考虑从签约公司维度统计合同相关数据；\n3.9.交车区域：必选项，地区选择器，支持省-市2级，选择区域后，该任务生成交车任务时会自动推送至该区域负责运维人员；\n3.10.交车地点：必填项，输入框，支持自定义输入交车地点；\n3.11.合同审批类型：必填项，选择器，分为「标准合同审批」「非标准合同审批」；\n3.12.合同原件：必填项，按钮，按钮文字为：上传附件，支持多个附件上传（doc/docx/pdf格式）；\n3.13.备注：文本域，支持自定义输入备注信息；\n\n4.被授权人信息卡片：\n#用于定义租赁合同相关被授权人相关信息，被授权人在交车单完成时，需要选择被授权人，并通过被授权人手机短信，在E签宝进行签字确认；\n4.1.被授权人：必填项，输入框，用于输入被授权人信息；\n4.2.被授权人联系电话：必填项，输入框，用于输入被授权人联系电话，该电话后续需要接收E签宝签字链接；\n4.3.被授权人身份证：必填项，输入框，用于输入被授权人身份证信息；\n4.4.支持通过新增/删除一行的方式，创建或管理多个授权人，后续交车单完成时可从多个授权人中选择接收授权人；\n\n5.租赁订单信息卡片：\n#用于定义租赁合同对应车辆明细费用、氢费明细费用等相关信息；\n5.1.上方为租赁车辆总计数据，包括租赁车辆数、租金及服务费合计、保证金总额、氢气预付款金额等相关信息；\n    5.1.1.租赁车辆数：显示下方租赁订单信息包含多少辆车；\n    5.1.2.租金及服务费合计：显示下方租赁订单信息中车辆租金总额及服务费总额；\n    5.1.3.保证金总额：显示下方租赁订单信息中车辆保证金总额；\n    5.1.4.氢气预付款金额：显示氢气预付款金额，如客户选择自行承担氢费或羚牛承担氢费，则该处为0不计入氢气预付款金额；\n5.2.下方为列表，显示序号、品牌、型号、车牌号、车辆识别代码、车辆月租金（元）、服务费项目、服务费、保证金、备注，默认且至少显示一行空数据；\n    5.2.1.序号：自动按照条数生成，规则为1、2、3....以此类推；\n    5.2.2.品牌：必选项，选择器，从型号参数库中「品牌」字段拉取所有品牌；\n    5.2.3.型号：必选项，选择器，与品牌存在级联关系，未选择品牌则无法选择型号；\n    5.2.4.车牌号：选填项，选择器（支持从输入框输入车牌号关键字下拉匹配），可通过选择车牌号对品牌、型号进行反写；\n    5.2.5.车辆识别代码：输入框（禁用），显示该车辆对应车辆识别代码，根据所选车牌号从车辆表直接拉取进行反写；\n    5.2.6.车辆月租金：输入框，支持两位小数，用于输入该车辆月租金金额，输入框后缀为元，如还车时账单周期不满1个月，则按照：（车辆月租金/30）* 实际天数进行计算；\n    5.2.7.服务费项目：点击管理按钮弹出卡片，卡片标题为：服务项目，下方列表显示服务项目、费用、生效时间、操作；\n          5.2.7.1.服务项目：必选项，选择器（支持输入框输入服务项目关键字进行下拉匹配），选项包含：代处理费用、罚款、违章处理违约金、未参加安全培训、车辆出险、年检年审违约、停车费、设备损坏金（包含易损件）、清洗费、上门收车人工费、上门收车送车行驶费、上门收车基础服务费、保险上浮、保养费用、补办驾驶证、补办牌照、补办营运证、补办加氢证、借用备用钥匙、补配钥匙、租金、氢气费-客、退还车氢量差、能源费补缴、能源费退款、送车上门人工费、送车上门送车行驶费、送车上门基础服务费、保证金、氢气预付费、维修费用、ETC-客、ETC卡缺损费、ETC设备缺损费、电费-客、未结算保养费、未结算维修费、车损费、工具损坏或丢失费、证件费、广告损坏费、送车服务费、接车服务费、补办行驶证、超赔险、轮胎磨损费、无忧包、轮胎保、养护保、尾板；\n          5.2.7.2.费用：必填项，输入框，支持2位小数，输入框后缀为元；\n          5.2.7.3.生效时间：必选项，日期选择器，格式为YYYY-MM-DD；\n          5.2.7.4.操作：删除，点击删除直接删除该行数据；\n          5.2.7.5.新增一行数据：点击添加一行服务项目；\n                  #在提车应收款中，车辆的交车日期和服务费生效日期可能会存在不同的情况，所以服务费需要单独以生效时间进行计算，例如：\n                  交车后车辆从1月1日开始计费，付款周期为2个月，则提车应收款租金会计算到3月1日，但是服务费生效时间为1月30日，此情况下需要以3月1日-1月30日，计算出服务费具体收费天数为30天，然后根据：（服务费费用/30）* 服务费收费天数30）进行计算；\n    5.2.8.服务费：自动根据添加的所有服务费项目计算总额，支持2位小数，格式为：xx.xx元；\n    5.2.9.保证金：必填项，输入框，支持2位小数，后缀为元，用于填写车辆需要支付的保证金金额，保证金为提车应收款一次性支付，还车时需要计入退还费用中；\n    5.2.10.备注：选填项，输入框，用于备注车辆复杂情况；\n    5.2.11.操作：删除，点击删除删除该行数据；\n    5.2.12.添加一行：点击后列表新增一行，用于填写一条新的车辆租金费用信息；\n5.3.氢费承担方：必选项，选择器，选项为：「我方」、「客户」，默认选择「客户」；\n    5.3.1.选择「我方」：不显示付款方式、氢气预付款；\n    5.3.2.选择「客户」：付款方式字段默认为预付，可手动修改；\n5.4.付款方式：必选项，选择器，选项为：「预付」、「月付款」、「自行结算」，默认为：「预付」；\n    5.4.1.预付：选择「预付」，需要填写：「氢气预付款」，氢气预付款指合同签署时客户就需预先付出的氢费款项，该部分款项会自动计入提车应收款中氢气预付款金额；\n    5.4.2.月付款：选择「月付款」，提车应收款中不进行收费，而是由业务人员按照实际情况，通过氢费账单功能生成对应氢费账单，单独与客户进行结算；\n    5.4.3.自行结算：选择「自行结算」，指合同签署后，所有氢气费用由客户自行承担；\n5.5.氢气预付款：选择「客户」「预付」时显示，必填项，输入框，支持2位小数，氢气预付款金额会计算入该合同交车应收款中，并计入5.1.4.氢气预付款金额中；\n5.6.退还车氢气单价：必填项，输入框，支持2位小数，后缀为元，不管氢费承担方和付款方式选择任何选项都需要进行维护，该金额主要用于与客户约定还车时，与交车时氢气差值以此费用进行自动计算和结算；\n\n6.其他费用信息卡片：\n#用于选择对应租赁费用模板，选择后展示证照补办费用、违约金费用、易损件费用、其他费用等信息，租赁费用模板管理功能位于「车辆租赁合同」列表左上角；\n6.1.选择费用模板：必选项，从「租赁费用模板」中拉取，选择后自动将该费用模板所有环节费用显示在合同中；\n    6.1.1.证照补办费用：单独标题显示，内容为列表，列表中包括项目、收费标准、服务费，选择费用模板后自动反显；\n    6.1.2.违约金费用：单独标题显示，内容为列表，列表中包含项目、收费标准、服务费，选择费用模板后自动反显；\n    6.1.3.易损件信息：单独标题显示，内容为列表，列表中包含类别、损坏部位、配件、数量、费用明细，选择费用模板后自动反显；\n    6.1.4.其他费用信息：单独标题显示，内容为列表，列表中包含项目、收费标准、服务费，选择费用模板后自动反显；\n\n7.账单计算方式卡片：\n#必选项，填充按钮组，默认为按自然月结算，可手动修改，用于定义租赁合同的账单计算方式，分为「按自然月结算」、「按付款周期天数结算」两种方式；\n7.1.按付款周期天数结算：账单按照合同基本信息卡片中每隔付款周期*30天形成一期账单；\n    例如付款周期为2个月，则交车任务交车成功时，提车应收款从交车任务配置的开始计费时间开始，根据60天收取车辆租金，此后每隔60天生成一期租赁账单；\n7.2.按自然月结算：账单按照第一个月计费开始日期到当月最后一天为第一期，之后按照付款周期所选月份间隔，从开始月份第一天到间隔月份最后一天的自然月方式形成一期账单；\n    例如付款周期为2个月，则交车任务交车成功时，提车应收款车辆租金需要收取≥2个月租金作为标准流程，＜2个月租金作为非标流程；\n    租赁账单首期从交车任务配置的开始计费时间开始，如付款周期为2个月，则首期账单结束时间为第二个月最后一天，付款周期为3个月，则首期账单结束时间为第三个月最后一天，此后每一期按照实际自然月开始-结束形成账单，例如付款周期为2个月，则第二期账单从2月1日-3月31日，以此类推；\n\n8.最下方为提交并审核、保存、取消三个按钮；\n8.1.点击提交并审核，toast提示：租赁合同已提交审核。同时该租赁合同进入租赁合同审核列表中；\n8.2.点击保存，会存储租赁订单已填写内容，不做必填项校验，同时显示在租赁合同列表中，该条数据只能保存人自己查看并编辑，其他人无法操作；\n8.3.点击取消，如当前页面有已编辑内容时，点击取消会进行二次提示，内容为：取消将会丢失所有已填写内容，是否确认？点击确认返回车辆租赁合同列表页；\n\n所有卡片支持收起/展开功能，通过点击卡片右侧收起/展开实现；并增加锚点功能，锚点固定于页面右上角，点击锚点对应卡片名称，页面自动跳转至该卡片所在区域；';
  var reqSpecModalContent = reqSpecOpen ? React.createElement('div', { style: styles.modalMask, onClick: function(e) { if (e.target === e.currentTarget) setReqSpecOpen(false); } }, React.createElement('div', { style: Object.assign({}, styles.modalBox, { maxWidth: 720 }), onClick: function(e) { e.stopPropagation(); } }, React.createElement('div', { style: styles.modalHeader }, '需求说明'), React.createElement('div', { style: Object.assign({}, styles.modalBody, { maxHeight: '70vh', padding: '20px 24px', overflow: 'auto' }) }, React.createElement('div', { style: { whiteSpace: 'pre-wrap', fontSize: 13, lineHeight: 1.6, color: 'rgba(0,0,0,0.85)' } }, requirementContent)), React.createElement('div', { style: { padding: '12px 20px', borderTop: '1px solid #f0f0f0', textAlign: 'right' } }, React.createElement(Button, { onClick: function() { setReqSpecOpen(false); } }, '关闭')))) : null;

  var acroCss = React.createElement('style', null, `
    .acro-text-xs { font-size: 12px; }
    .acro-text-sm { font-size: 13px; }
    .acro-text-base { font-size: 14px; }
    .acro-text-lg { font-size: 16px; }
    .acro-text-xl { font-size: 20px; }
    .acro-text-xxl { font-size: 24px; }
    .acro-title-promo { font-size: 36px; }
  `);

  return React.createElement('div', { style: styles.page },
    acroCss,
    React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 } }, React.createElement('div', { style: styles.breadcrumb, className: 'acro-text-base' }, React.createElement('span', null, '业务管理'), React.createElement('span', { style: styles.breadcrumbSep }, ' / '), React.createElement('span', null, '车辆租赁合同'), React.createElement('span', { style: styles.breadcrumbSep }, ' / '), React.createElement('span', { style: { color: '#1677ff' } }, '新增租赁合同')), React.createElement('button', { type: 'button', 'aria-label': '打开需求说明', style: { color: '#1677ff', cursor: 'pointer', border: 'none', background: 'none', padding: '8px 4px', minHeight: 40, borderRadius: 6 }, className: 'acro-text-base', onClick: function() { setReqSpecOpen(true); } }, '查看需求说明')),
    React.createElement('div', { style: styles.anchorWrap, role: 'navigation', 'aria-label': '页面区块锚点导航' },
      React.createElement('div', { style: { marginBottom: 8, fontWeight: 600, fontSize: 14 } }, '锚点导航'),
      React.createElement('button', { type: 'button', style: styles.anchorItem, 'aria-label': '跳转到客户基本信息', onClick: function() { scrollToCard('card-customer'); } }, '客户基本信息'),
      React.createElement('button', { type: 'button', style: styles.anchorItem, 'aria-label': '跳转到合同基本信息', onClick: function() { scrollToCard('card-contract'); } }, '合同基本信息'),
      React.createElement('button', { type: 'button', style: styles.anchorItem, 'aria-label': '跳转到被授权人信息', onClick: function() { scrollToCard('card-authorized'); } }, '被授权人信息'),
      React.createElement('button', { type: 'button', style: styles.anchorItem, 'aria-label': '跳转到租赁订单信息', onClick: function() { scrollToCard('card-rental'); } }, '租赁订单信息'),
      React.createElement('button', { type: 'button', style: styles.anchorItem, 'aria-label': '跳转到其他费用信息', onClick: function() { scrollToCard('card-fee'); } }, '其他费用信息'),
      React.createElement('button', { type: 'button', style: styles.anchorItem, 'aria-label': '跳转到账单计算方式', onClick: function() { scrollToCard('card-billing'); } }, '账单计算方式')
    ),
    React.createElement(CardBlock, { id: 'card-customer', title: '客户基本信息', collapsed: cc1, setCollapsed: setCc1 }, customerFields),
    React.createElement(CardBlock, { id: 'card-contract', cardStyle: { marginTop: 16 }, title: '合同基本信息', collapsed: cc2, setCollapsed: setCc2 }, React.createElement('div', null, contractFormRow1, contractFormRow1Part2, contractFormRow2)),
    React.createElement(CardBlock, { id: 'card-authorized', cardStyle: { marginTop: 16 }, title: '被授权人信息', collapsed: cc3, setCollapsed: setCc3 }, authorizedContent),
    React.createElement(CardBlock, { id: 'card-rental', cardStyle: { marginTop: 16 }, title: '租赁订单信息', collapsed: cc4, setCollapsed: setCc4 }, rentalContent),
    React.createElement(CardBlock, { id: 'card-fee', cardStyle: { marginTop: 16 }, title: '其他费用信息', collapsed: cc5, setCollapsed: setCc5 }, feeContent),
    React.createElement(CardBlock, { id: 'card-billing', cardStyle: { marginTop: 16 }, title: '账单计算方式', collapsed: cc6, setCollapsed: setCc6 }, billingContent),
    React.createElement('div', { style: { height: 60 } }),
    rentalCopyPopoverEl,
    serviceModalContent,
    reqSpecModalContent,
    React.createElement('div', { style: styles.footer }, React.createElement(Button, { type: 'primary', size: 'large', onClick: function() { if (validateSubmitAndReview()) { message.success('租赁合同已提交审核。'); } } }, '提交并审核'), React.createElement(Button, { size: 'large', onClick: function() { message.info('保存，加入租赁合同列表（仅操作人可查看编辑）'); } }, '保存'), React.createElement(Button, { size: 'large', onClick: function() { message.info('取消'); } }, '取消'))
  );
};
