// 【重要】必须使用 const Component 作为组件变量名
// 车辆租赁合同 - 附加费用（参照新增合同，除服务费项目-管理弹层可编辑外其余只读+样例数据）

const Component = function() {
  var antd = window.antd;
  var Input = antd.Input;
  var Select = antd.Select;
  var Button = antd.Button;
  var DatePicker = antd.DatePicker;
  var message = antd.message;
  var Option = Select.Option;

  // 样例数据（只读展示）
  var detail = React.useMemo(function() {
    return {
      customerName: '嘉兴某某物流有限公司',
      creditCode: '91330400MA2XXXXX1',
      address: '浙江省嘉兴市南湖区科技大道1号',
      contact: '张三',
      phone: '13800138001',
      email: 'zhangsan@example.com',
      companyName: '嘉兴某某物流有限公司',
      companyPhone: '0571-88888888',
      mailingAddress: '浙江省嘉兴市南湖区科技大道1号',
      bank: '中国工商银行嘉兴分行',
      bankAccount: '6222021234567890123',
      taxId: '91330400MA2XXXXX1',
      businessDept: '业务1部',
      businessOwner: '张经理',
      projectName: '嘉兴城配运输项目',
      contractType: '正式合同',
      effectiveDate: '2026-02-16',
      paymentMethod: '预付',
      mainVehicleModels: '型号A1、型号B1',
      endDate: '2027-02-16',
      paymentPeriod: '2',
      signingCompany: '嘉兴羚牛',
      deliveryRegion: '浙江省 / 嘉兴市',
      deliveryLocation: '嘉兴市南湖区科技大道1号',
      contractApprovalType: '标准合同审批',
      contractOriginalName: '租赁合同-嘉兴某某物流.pdf',
      remarks: '首年优惠',
      authorizedList: [
        { name: '张三', phone: '13800138001', idCard: '330102199001011234' },
        { name: '李四', phone: '13800138002', idCard: '330102199002022345' }
      ],
      feeTemplate: '标准费用模板A',
      billingMethod: 'month',
      hydrogenBearer: '客户',
      hydrogenPaymentMethod: '预付',
      hydrogenPrepay: '5000.00',
      returnHydrogenPrice: '12.50',
      rentalOrders: [
        { id: 1, brand: '品牌A', model: '型号A1', plateNo: '浙A10001', vin: 'L1234567890ABCDEF', monthRent: '8000', serviceItems: [{ project: '保养费用', fee: '200.00', effectiveDate: '2026-03-01' }, { project: '清洗费', fee: '80.00', effectiveDate: '2026-03-01' }], deposit: '10000', remark: '' },
        { id: 2, brand: '品牌B', model: '型号B1', plateNo: '沪A30003', vin: 'L3234567890ABCDEF', monthRent: '7500', serviceItems: [{ project: 'ETC-客', fee: '50.00', effectiveDate: '2026-02-20' }], deposit: '8000', remark: '试用车' }
      ]
    };
  }, []);

  var rentalOrdersInit = detail.rentalOrders.map(function(r) {
    return { id: r.id, brand: r.brand, model: r.model, plateNo: r.plateNo, vin: r.vin, monthRent: r.monthRent, serviceItems: (r.serviceItems || []).map(function(si) { return { project: si.project || '', fee: si.fee || '', effectiveDate: si.effectiveDate || '' }; }), deposit: r.deposit, remark: r.remark || '' };
  });
  var os1 = React.useState(rentalOrdersInit);
  var rentalOrders = os1[0];
  var setRentalOrders = os1[1];
  var os1b = React.useState(null);
  var serviceModalRowIndex = os1b[0];
  var setServiceModalRowIndex = os1b[1];

  var serviceItemOptions = ['代处理费用', '罚款', '违章处理违约金', '未参加安全培训', '车辆出险', '年检年审违约', '停车费', '设备损坏金（包含易损件）', '清洗费', '上门收车人工费', '上门收车送车行驶费', '上门收车基础服务费', '保险上浮', '保养费用', '补办驾驶证', '补办牌照', '补办营运证', '补办加氢证', '借用备用钥匙', '补配钥匙', '租金', '氢气费-客', '退还车氢量差', '能源费补缴', '能源费退款', '送车上门人工费', '送车上门送车行驶费', '送车上门基础服务费', '保证金', '氢气预付费', '维修费用', 'ETC-客', 'ETC卡缺损费', 'ETC设备缺损费', '电费-客', '未结算保养费', '未结算维修费', '车损费', '工具损坏或丢失费', '证件费', '广告损坏费', '送车服务费', '接车服务费', '补办行驶证', '超赔险', '轮胎磨损费', '无忧包', '轮胎保', '养护保', '尾板'];

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
  var rentalTotalHydrogen = detail.hydrogenBearer === '客户' && detail.hydrogenPaymentMethod === '预付' ? (parseFloat(detail.hydrogenPrepay) || 0) : 0;

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

  var cc1 = React.useState(false)[0];
  var setCc1 = React.useState(false)[1];
  var cc2 = React.useState(false)[0];
  var setCc2 = React.useState(false)[1];
  var cc3 = React.useState(false)[0];
  var setCc3 = React.useState(false)[1];
  var cc4 = React.useState(false)[0];
  var setCc4 = React.useState(false)[1];
  var cc5 = React.useState(false)[0];
  var setCc5 = React.useState(false)[1];
  var cc6 = React.useState(false)[0];
  var setCc6 = React.useState(false)[1];

  var styles = {
    page: { padding: '16px 24px 48px', backgroundColor: '#f5f5f5', minHeight: '100vh', fontFamily: '"PingFang SC", "苹方-简", -apple-system, BlinkMacSystemFont, "Microsoft YaHei", sans-serif', fontSize: 14 },
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
    inputDisabled: { width: '100%', padding: '8px 12px', border: '1px solid #d9d9d9', borderRadius: 4, fontSize: 14, backgroundColor: '#f5f5f5', color: 'rgba(0,0,0,0.65)' },
    summaryList: { marginBottom: 16, display: 'flex', flexWrap: 'wrap', gap: 16 },
    summaryListItem: { flex: '0 0 calc(50% - 8px)', display: 'flex', alignItems: 'center', padding: '12px 16px', border: '1px solid #e8e8e8', borderRadius: 4, backgroundColor: '#fafafa', fontSize: 14, boxSizing: 'border-box' },
    summaryListLabel: { flex: '0 0 140px', color: '#666' },
    summaryListValue: { flex: 1, fontWeight: 600, color: '#333' },
    rentalTable: { width: '100%', borderCollapse: 'collapse', fontSize: 13 },
    rentalTh: { padding: '10px 8px', textAlign: 'left', borderBottom: '1px solid #e8e8e8', backgroundColor: '#fafafa', fontWeight: 600 },
    rentalTd: { padding: '8px', borderBottom: '1px solid #f0f0f0', verticalAlign: 'top' },
    rentalTdCenter: { padding: '8px', borderBottom: '1px solid #f0f0f0', verticalAlign: 'middle' },
    rentalInput: { width: '100%', padding: '6px 10px', border: '1px solid #d9d9d9', borderRadius: 4, fontSize: 13 },
    rentalInputDisabled: { backgroundColor: '#f5f5f5', color: '#999' },
    modalMask: { position: 'fixed', left: 0, top: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.45)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' },
    modalBox: { backgroundColor: '#fff', borderRadius: 8, width: '90%', maxWidth: 720, maxHeight: '85vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 4px 20px rgba(0,0,0,0.15)' },
    modalHeader: { padding: '16px 20px', borderBottom: '1px solid #f0f0f0', fontSize: 16, fontWeight: 600 },
    modalBody: { padding: 20, overflow: 'auto', flex: 1 },
    footer: { position: 'fixed', bottom: 0, left: 0, right: 0, padding: '12px 24px', backgroundColor: '#fff', borderTop: '1px solid #e8e8e8', display: 'flex', gap: 12, justifyContent: 'flex-start', zIndex: 99 }
  };

  var scrollToCard = function(id) {
    var el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
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

  var FormItem = function(props) {
    var colStyle = props.fullWidth ? styles.formColFull : styles.formCol;
    return React.createElement('div', { style: colStyle },
      React.createElement('label', { style: styles.label }, props.label),
      props.children
    );
  };

  var customerFields = React.createElement('div', { style: styles.formRow },
    React.createElement(FormItem, { label: '客户名称' }, React.createElement(Input, { value: detail.customerName, disabled: true, style: styles.inputDisabled })),
    React.createElement(FormItem, { label: '客户统一信用代码' }, React.createElement(Input, { value: detail.creditCode, disabled: true, style: styles.inputDisabled })),
    React.createElement(FormItem, { label: '客户地址' }, React.createElement(Input, { value: detail.address, disabled: true, style: styles.inputDisabled })),
    React.createElement(FormItem, { label: '客户联系人' }, React.createElement(Input, { value: detail.contact, disabled: true, style: styles.inputDisabled })),
    React.createElement(FormItem, { label: '客户电话' }, React.createElement(Input, { value: detail.phone, disabled: true, style: styles.inputDisabled })),
    React.createElement(FormItem, { label: '客户电子邮箱' }, React.createElement(Input, { value: detail.email, disabled: true, style: styles.inputDisabled })),
    React.createElement(FormItem, { label: '企业名称' }, React.createElement(Input, { value: detail.companyName, disabled: true, style: styles.inputDisabled })),
    React.createElement(FormItem, { label: '企业电话' }, React.createElement(Input, { value: detail.companyPhone, disabled: true, style: styles.inputDisabled })),
    React.createElement(FormItem, { label: '邮寄地址' }, React.createElement(Input, { value: detail.mailingAddress, disabled: true, style: styles.inputDisabled })),
    React.createElement(FormItem, { label: '开户银行' }, React.createElement(Input, { value: detail.bank, disabled: true, style: styles.inputDisabled })),
    React.createElement(FormItem, { label: '银行账号' }, React.createElement(Input, { value: detail.bankAccount, disabled: true, style: styles.inputDisabled })),
    React.createElement(FormItem, { label: '纳税人识别号' }, React.createElement(Input, { value: detail.taxId, disabled: true, style: styles.inputDisabled })),
    React.createElement(FormItem, { label: '业务部门' }, React.createElement(Input, { value: detail.businessDept, disabled: true, style: styles.inputDisabled })),
    React.createElement(FormItem, { label: '业务负责人' }, React.createElement(Input, { value: detail.businessOwner, disabled: true, style: styles.inputDisabled }))
  );

  var contractFormRow1 = React.createElement('div', { style: styles.formRow },
    React.createElement(FormItem, { label: '项目名称' }, React.createElement(Input, { value: detail.projectName, disabled: true, style: styles.inputDisabled })),
    React.createElement(FormItem, { label: '合同类型' }, React.createElement(Input, { value: detail.contractType, disabled: true, style: styles.inputDisabled })),
    React.createElement(FormItem, { label: '生效日期' }, React.createElement(Input, { value: detail.effectiveDate, disabled: true, style: styles.inputDisabled })),
    React.createElement(FormItem, { label: '付款方式' }, React.createElement(Input, { value: detail.paymentMethod, disabled: true, style: styles.inputDisabled })),
    React.createElement(FormItem, { label: '主要车型' }, React.createElement(Input, { value: detail.mainVehicleModels, disabled: true, style: styles.inputDisabled })),
    React.createElement(FormItem, { label: '结束日期' }, React.createElement(Input, { value: detail.endDate, disabled: true, style: styles.inputDisabled })),
    React.createElement(FormItem, { label: '付款周期' }, React.createElement(Input, { value: detail.paymentPeriod + '个月', disabled: true, style: styles.inputDisabled })),
    React.createElement(FormItem, { label: '签约公司' }, React.createElement(Input, { value: detail.signingCompany, disabled: true, style: styles.inputDisabled })),
    React.createElement(FormItem, { label: '交车区域' }, React.createElement(Input, { value: detail.deliveryRegion, disabled: true, style: styles.inputDisabled })),
    React.createElement(FormItem, { label: '交车地点' }, React.createElement(Input, { value: detail.deliveryLocation, disabled: true, style: styles.inputDisabled })),
    React.createElement(FormItem, { label: '合同审批类型' }, React.createElement(Input, { value: detail.contractApprovalType || '—', disabled: true, style: styles.inputDisabled })),
    React.createElement(FormItem, { label: '合同原件' }, React.createElement(Input, { value: detail.contractOriginalName, disabled: true, style: styles.inputDisabled })),
    React.createElement(FormItem, { label: '备注', fullWidth: true }, React.createElement(Input.TextArea, { value: detail.remarks, disabled: true, style: { width: '100%', minHeight: 80, backgroundColor: '#f5f5f5' } }))
  );

  var authorizedContent = React.createElement('div', null,
    detail.authorizedList.map(function(item, index) {
      return React.createElement('div', { key: index, style: { display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 12 } },
        React.createElement(Input, { value: item.name, disabled: true, style: Object.assign({}, styles.rentalInput, styles.rentalInputDisabled, { flex: 1 }) }),
        React.createElement(Input, { value: item.phone, disabled: true, style: Object.assign({}, styles.rentalInput, styles.rentalInputDisabled, { flex: 1 }) }),
        React.createElement(Input, { value: item.idCard, disabled: true, style: Object.assign({}, styles.rentalInput, styles.rentalInputDisabled, { flex: 1 }) })
      );
    })
  );

  var rentalTableBody = rentalOrders.map(function(row, idx) {
    return React.createElement('tr', { key: row.id != null ? row.id : idx },
      React.createElement('td', { style: styles.rentalTdCenter }, idx + 1),
      React.createElement('td', { style: styles.rentalTd }, React.createElement(Input, { value: row.brand || '', disabled: true, style: Object.assign({}, styles.rentalInput, styles.rentalInputDisabled) })),
      React.createElement('td', { style: styles.rentalTd }, React.createElement(Input, { value: row.model || '', disabled: true, style: Object.assign({}, styles.rentalInput, styles.rentalInputDisabled) })),
      React.createElement('td', { style: styles.rentalTd }, React.createElement(Input, { value: row.plateNo || '', disabled: true, style: Object.assign({}, styles.rentalInput, styles.rentalInputDisabled) })),
      React.createElement('td', { style: styles.rentalTd }, React.createElement(Input, { value: row.vin || '', disabled: true, style: Object.assign({}, styles.rentalInput, styles.rentalInputDisabled) })),
      React.createElement('td', { style: styles.rentalTd }, React.createElement('div', { style: { display: 'flex', alignItems: 'center' } }, React.createElement(Input, { value: row.monthRent || '', disabled: true, style: Object.assign({}, styles.rentalInput, styles.rentalInputDisabled) }), React.createElement('span', { style: { marginLeft: 4 } }, '元'))),
      React.createElement('td', { style: styles.rentalTdCenter }, React.createElement(Button, { type: 'link', size: 'small', onClick: function() { openServiceModal(idx); } }, '管理')),
      React.createElement('td', { style: styles.rentalTdCenter }, calcRowServiceFee(row) + ' 元'),
      React.createElement('td', { style: styles.rentalTd }, React.createElement(Input, { value: row.deposit || '', disabled: true, style: Object.assign({}, styles.rentalInput, styles.rentalInputDisabled) })),
      React.createElement('td', { style: styles.rentalTd }, React.createElement(Input, { value: row.remark || '', disabled: true, style: Object.assign({}, styles.rentalInput, styles.rentalInputDisabled) }))
    );
  });

  var rentalSummary = React.createElement('div', { style: styles.summaryList },
    React.createElement('div', { style: styles.summaryListItem }, React.createElement('span', { style: styles.summaryListLabel }, '租赁车辆数'), React.createElement('span', { style: styles.summaryListValue }, rentalTotalVehicles + ' 辆')),
    React.createElement('div', { style: styles.summaryListItem }, React.createElement('span', { style: styles.summaryListLabel }, '租金及服务费合计'), React.createElement('span', { style: styles.summaryListValue }, rentalTotalRentService.toFixed(2) + ' 元')),
    React.createElement('div', { style: styles.summaryListItem }, React.createElement('span', { style: styles.summaryListLabel }, '保证金总额'), React.createElement('span', { style: styles.summaryListValue }, rentalTotalDeposit.toFixed(2) + ' 元')),
    React.createElement('div', { style: styles.summaryListItem }, React.createElement('span', { style: styles.summaryListLabel }, '氢气预付款金额'), React.createElement('span', { style: styles.summaryListValue }, rentalTotalHydrogen.toFixed(2) + ' 元'))
  );

  var rentalTableThead = React.createElement('thead', null, React.createElement('tr', null,
    React.createElement('th', { style: Object.assign({}, styles.rentalTh, { width: 50 }) }, '序号'),
    React.createElement('th', { style: Object.assign({}, styles.rentalTh, { width: 100 }) }, '品牌'),
    React.createElement('th', { style: Object.assign({}, styles.rentalTh, { width: 100 }) }, '型号'),
    React.createElement('th', { style: Object.assign({}, styles.rentalTh, { width: 120 }) }, '车牌号'),
    React.createElement('th', { style: Object.assign({}, styles.rentalTh, { width: 160 }) }, '车辆识别代码'),
    React.createElement('th', { style: Object.assign({}, styles.rentalTh, { width: 120 }) }, '车辆月租金'),
    React.createElement('th', { style: Object.assign({}, styles.rentalTh, { width: 80 }) }, '服务费项目'),
    React.createElement('th', { style: Object.assign({}, styles.rentalTh, { width: 90 }) }, '服务费'),
    React.createElement('th', { style: Object.assign({}, styles.rentalTh, { width: 100 }) }, '保证金'),
    React.createElement('th', { style: Object.assign({}, styles.rentalTh, { width: 80 }) }, '备注')
  ));
  var rentalTableEl = React.createElement('table', { style: styles.rentalTable }, rentalTableThead, React.createElement('tbody', null, rentalTableBody));
  var rentalContent = React.createElement('div', null,
    rentalSummary,
    React.createElement('div', { style: { overflowX: 'auto', marginBottom: 16 } }, rentalTableEl),
    React.createElement('div', { style: Object.assign({}, styles.formRow, { marginTop: 20 }) },
      React.createElement(FormItem, { label: '氢费承担方' }, React.createElement(Input, { value: detail.hydrogenBearer, disabled: true, style: styles.inputDisabled })),
      detail.hydrogenBearer === '客户' ? React.createElement(FormItem, { label: '付款方式' }, React.createElement(Input, { value: detail.hydrogenPaymentMethod, disabled: true, style: styles.inputDisabled })) : null,
      detail.hydrogenPaymentMethod === '预付' && detail.hydrogenBearer === '客户' ? React.createElement(FormItem, { label: '氢气预付款' }, React.createElement(Input, { value: detail.hydrogenPrepay, disabled: true, style: styles.inputDisabled })) : null,
      React.createElement(FormItem, { label: '退还车氢气单价' }, React.createElement(Input, { value: detail.returnHydrogenPrice, disabled: true, style: styles.inputDisabled }))
    )
  );

  var feeContent = React.createElement('div', null,
    React.createElement(FormItem, { label: '选择费用模板' }, React.createElement(Input, { value: detail.feeTemplate, disabled: true, style: styles.inputDisabled }))
  );

  var billingLabel = detail.billingMethod === 'month' ? '按自然月结算' : '按付款周期天数结算';
  var billingContent = React.createElement('div', null, React.createElement(FormItem, { label: '账单计算方式' }, React.createElement(Input, { value: billingLabel, disabled: true, style: styles.inputDisabled })));

  var serviceModalRows = serviceModalRowIndex !== null && rentalOrders[serviceModalRowIndex] ? rentalOrders[serviceModalRowIndex].serviceItems : [];
  var serviceModalContent = serviceModalRowIndex !== null ? React.createElement('div', { style: styles.modalMask, onClick: function(e) { if (e.target === e.currentTarget) closeServiceModal(); } },
    React.createElement('div', { style: styles.modalBox, onClick: function(e) { e.stopPropagation(); } },
      React.createElement('div', { style: styles.modalHeader }, '服务项目'),
      React.createElement('div', { style: styles.modalBody },
        React.createElement('table', { style: styles.rentalTable },
          React.createElement('thead', null, React.createElement('tr', null,
            React.createElement('th', { style: styles.rentalTh }, '服务项目'),
            React.createElement('th', { style: styles.rentalTh }, '费用'),
            React.createElement('th', { style: styles.rentalTh }, '生效时间'),
            React.createElement('th', { style: Object.assign({}, styles.rentalTh, { width: 80 }) }, '操作')
          )),
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
      React.createElement('div', { style: { padding: '12px 20px', borderTop: '1px solid #f0f0f0', display: 'flex', gap: 12, justifyContent: 'flex-end' } },
        React.createElement(Button, { type: 'primary', onClick: function() { closeServiceModal(); } }, '保存'),
        React.createElement(Button, { onClick: closeServiceModal }, '关闭')
      )
    )
  ) : null;

  var handleSubmit = function() {
    message.success('已提交审核（原型）');
    if (typeof window !== 'undefined' && window.history) window.history.back();
  };
  var handleBack = function() {
    if (typeof window !== 'undefined' && window.history) window.history.back();
    else message.info('返回');
  };

  return React.createElement('div', { style: styles.page },
    React.createElement('div', { style: { marginBottom: 16 } }, React.createElement('div', { style: styles.breadcrumb }, React.createElement('span', null, '业务管理'), React.createElement('span', { style: styles.breadcrumbSep }, ' / '), React.createElement('span', null, '车辆租赁合同'), React.createElement('span', { style: styles.breadcrumbSep }, ' / '), React.createElement('span', { style: { color: '#1890ff' } }, '附加费用'))),
    React.createElement('div', { style: styles.anchorWrap },
      React.createElement('div', { style: { marginBottom: 8, fontWeight: 600, fontSize: 14 } }, '锚点导航'),
      React.createElement('button', { style: styles.anchorItem, onClick: function() { scrollToCard('card-customer'); } }, '客户基本信息'),
      React.createElement('button', { style: styles.anchorItem, onClick: function() { scrollToCard('card-contract'); } }, '合同基本信息'),
      React.createElement('button', { style: styles.anchorItem, onClick: function() { scrollToCard('card-authorized'); } }, '被授权人信息'),
      React.createElement('button', { style: styles.anchorItem, onClick: function() { scrollToCard('card-rental'); } }, '租赁订单信息'),
      React.createElement('button', { style: styles.anchorItem, onClick: function() { scrollToCard('card-fee'); } }, '其他费用信息'),
      React.createElement('button', { style: styles.anchorItem, onClick: function() { scrollToCard('card-billing'); } }, '账单计算方式')
    ),
    React.createElement('div', { id: 'card-customer' }, React.createElement(CardBlock, { id: 'card-customer', title: '客户基本信息', collapsed: cc1, setCollapsed: setCc1 }, customerFields)),
    React.createElement('div', { id: 'card-contract', style: { marginTop: 16 } }, React.createElement(CardBlock, { title: '合同基本信息', collapsed: cc2, setCollapsed: setCc2 }, contractFormRow1)),
    React.createElement('div', { id: 'card-authorized', style: { marginTop: 16 } }, React.createElement(CardBlock, { title: '被授权人信息', collapsed: cc3, setCollapsed: setCc3 }, authorizedContent)),
    React.createElement('div', { id: 'card-rental', style: { marginTop: 16 } }, React.createElement(CardBlock, { title: '租赁订单信息', collapsed: cc4, setCollapsed: setCc4 }, rentalContent)),
    React.createElement('div', { id: 'card-fee', style: { marginTop: 16 } }, React.createElement(CardBlock, { title: '其他费用信息', collapsed: cc5, setCollapsed: setCc5 }, feeContent)),
    React.createElement('div', { id: 'card-billing', style: { marginTop: 16 } }, React.createElement(CardBlock, { title: '账单计算方式', collapsed: cc6, setCollapsed: setCc6 }, billingContent)),
    React.createElement('div', { style: { height: 60 } }),
    serviceModalContent,
    React.createElement('div', { style: styles.footer },
      React.createElement(Button, { type: 'primary', onClick: handleSubmit }, '提交审核'),
      React.createElement(Button, { onClick: handleBack }, '返回')
    )
  );
};
