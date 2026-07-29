// 【重要】必须使用 const Component 作为组件变量名 - Axhub 产品原型
// 车辆资产管理系统 - 查看租赁合同模块（只读 + 审批状态 + 盖章附件，IE11+ 兼容）

const Component = function() {
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
  var cc4bState = React.useState(false);
  var cc4b = cc4bState[0];
  var setCc4b = cc4bState[1];
  var cc5State = React.useState(false);
  var cc5 = cc5State[0];
  var setCc5 = cc5State[1];
  var cc6State = React.useState(false);
  var cc6 = cc6State[0];
  var setCc6 = cc6State[1];
  var stampedHoverIndexState = React.useState(null);
  var stampedHoverIndex = stampedHoverIndexState[0];
  var setStampedHoverIndex = stampedHoverIndexState[1];
  var reqSpecState = React.useState(false);
  var reqSpecOpen = reqSpecState[0];
  var setReqSpecOpen = reqSpecState[1];
  var servicePopoverRowState = React.useState(null);
  var servicePopoverRow = servicePopoverRowState[0];
  var setServicePopoverRow = servicePopoverRowState[1];
  var servicePopoverRowNewVehicleState = React.useState(null);
  var servicePopoverRowNewVehicle = servicePopoverRowNewVehicleState[0];
  var setServicePopoverRowNewVehicle = servicePopoverRowNewVehicleState[1];

  // 模拟已上传的盖章合同附件（法务上传，可多附件；三方合同重新审批后会有新附件）
  var stampedContractFiles = [
    { name: '盖章合同-租赁合同-盖章版.pdf', size: '1.2 MB', uploadTime: '2026-02-18 10:30' },
    { name: '盖章合同-补充协议-盖章版.pdf', size: '0.6 MB', uploadTime: '2026-02-18 10:35' }
  ];

  // 合同变更历史记录（变更时间倒序，序号 1.2.3...）
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
    tag: { display: 'inline-block', padding: '2px 8px', marginRight: 8, marginBottom: 4, backgroundColor: '#e6f7ff', color: '#1890ff', borderRadius: 4, fontSize: 12 },
    footer: { position: 'fixed', bottom: 0, left: 0, right: 0, padding: '12px 24px', backgroundColor: '#fff', borderTop: '1px solid #e8e8e8', display: 'flex', gap: 12, justifyContent: 'flex-start', zIndex: 99 },
    btn: { padding: '8px 24px', borderRadius: 4, border: '1px solid #d9d9d9', cursor: 'pointer', fontSize: 14 },
    btnDefault: { backgroundColor: '#fff', color: '#333' },
    approvalCard: { backgroundColor: '#fff', borderRadius: 8, marginBottom: 16, boxShadow: '0 1px 2px rgba(0,0,0,0.05)', overflow: 'hidden' },
    approvalCardHeader: { padding: '16px 20px', borderBottom: '1px solid #f0f0f0', fontSize: 16, fontWeight: 600, color: '#333', textAlign: 'center' },
    approvalCardBody: { padding: '24px 20px', display: 'flex', justifyContent: 'center' },
    stepWrap: { display: 'flex', alignItems: 'flex-start', flexWrap: 'wrap', justifyContent: 'center' },
    stepItem: { flex: '1 1 0', minWidth: 140, maxWidth: 220, textAlign: 'center', position: 'relative' },
    stepIcon: { width: 32, height: 32, borderRadius: '50%', margin: '0 auto 8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 600 },
    stepIconDone: { backgroundColor: '#52c41a', color: '#fff' },
    stepLine: { position: 'absolute', top: 16, left: '50%', right: '-50%', height: 2, backgroundColor: '#e8e8e8', zIndex: 0 },
    stepLineDone: { backgroundColor: '#52c41a' },
    stepTitle: { fontSize: 13, color: '#333', fontWeight: 500, marginBottom: 4 },
    stepDesc: { fontSize: 12, color: '#666' },
    stepStatus: { fontSize: 12, color: '#52c41a', marginTop: 4 },
    stepTime: { fontSize: 12, color: '#999', marginTop: 2 },
    attachmentRow: { display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 12 },
    attachmentFile: { display: 'inline-flex', alignItems: 'center', padding: '8px 12px', backgroundColor: '#f5f5f5', borderRadius: 4, border: '1px solid #d9d9d9', fontSize: 14, color: '#1890ff', cursor: 'pointer', textDecoration: 'none', fontFamily: 'inherit', margin: 0, outline: 'none' },
    attachmentFileHover: { color: '#40a9ff', borderColor: '#1890ff', backgroundColor: '#e6f7ff' },
    attachmentMeta: { fontSize: 12, color: '#999', marginLeft: 8 },
    feeSectionTitle: { fontSize: 15, fontWeight: 600, color: '#333', marginTop: 20, marginBottom: 10 },
    feeSectionTitleFirst: { marginTop: 0 },
    historyLink: { color: '#1890ff', cursor: 'pointer', background: 'none', border: 'none', padding: 0, fontSize: 14 },
    modalMask: { position: 'fixed', left: 0, top: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.45)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' },
    modalBox: { backgroundColor: '#fff', borderRadius: 8, width: '90%', maxWidth: 640, maxHeight: '85vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 4px 20px rgba(0,0,0,0.15)' },
    modalHeader: { padding: '16px 20px', borderBottom: '1px solid #f0f0f0', fontSize: 16, fontWeight: 600 },
    modalBody: { padding: 20, overflow: 'auto', flex: 1 }
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

  // 审批流程步骤数据（全部已通过，含审核时间 YYYY-MM-DD HH:MM）
  var approvalSteps = [
    { title: '业务部主管', person: '姚守涛', status: '已通过', approveTime: '2026-02-16 09:30' },
    { title: '事业部主管', person: '尚建华', status: '已通过', approveTime: '2026-02-16 10:15' },
    { title: '财务部', person: '宋欣怡 / 吕红', status: '已通过', approveTime: '2026-02-16 11:20' },
    { title: '法务部', person: '高洁 / 彭青松', status: '已通过', approveTime: '2026-02-16 14:00' }
  ];

  var Steps = window.antd && window.antd.Steps;
  var approvalCurrent = (function() {
    for (var i = 0; i < approvalSteps.length; i++) {
      if (approvalSteps[i].status !== '已通过') return i;
    }
    return approvalSteps.length - 1;
  })();
  var approvalCardEl = React.createElement('div', { style: Object.assign({}, styles.card, { marginTop: 16 }) },
    React.createElement('div', { style: Object.assign({}, styles.cardHeader, { cursor: 'default' }) },
      React.createElement('span', { style: styles.cardTitle }, '审批状态')
    ),
    React.createElement('div', { style: styles.cardBody },
      Steps
        ? React.createElement(Steps, {
            direction: 'vertical',
            current: approvalCurrent,
            items: approvalSteps.map(function(s) {
              var statusText = s.status === '已通过' ? '审批通过' : s.status === '审批驳回' ? '审批驳回' : '待审批';
              var desc = React.createElement('div', { style: { fontSize: 13, color: 'rgba(0,0,0,0.65)', marginTop: 4 } },
                React.createElement('div', null, '审批状态：', statusText),
                React.createElement('div', null, '审批人：', s.person || '-'),
                React.createElement('div', null, '审批时间：', s.approveTime || '-')
              );
              return {
                title: s.title,
                description: desc,
                status: s.status === '已通过' ? 'finish' : s.status === '审批驳回' ? 'error' : 'wait'
              };
            })
          })
        : React.createElement('div', { style: { color: '#999', fontSize: 13 } }, '暂无审批信息')
    )
  );

  // 模拟只读数据（与新增合同同结构）
  var mockCustomer = { name: '嘉兴某某物流有限公司', creditCode: '91330400MA2XXXXX1', address: '浙江省嘉兴市南湖区科技大道1号', contact: '张三', phone: '13800138001', email: 'zhangsan@example.com', companyName: '嘉兴某某物流有限公司', companyPhone: '0571-88888888', mailingAddress: '浙江省嘉兴市南湖区科技大道1号', bank: '中国工商银行嘉兴分行', bankAccount: '6222021234567890123', taxId: '91330400MA2XXXXX1' };
  var isThreePartyContract = true;
  var mockThirdPartyCustomer = { name: '杭州某某供应链有限公司', creditCode: '91330100MA2YYYYY2', address: '浙江省杭州市余杭区未来科技城', contact: '李四', phone: '13800138002', email: 'lisi@example.com', companyName: '杭州某某供应链有限公司', companyPhone: '0571-99999999', mailingAddress: '浙江省杭州市余杭区未来科技城', bank: '中国农业银行杭州分行', bankAccount: '6228481234567890123', taxId: '91330100MA2YYYYY2', department: '业务2部', responsible: '李专员' };
  var contractOriginalFiles = [
    { name: '租赁合同-原件.pdf', size: '1.2 MB', uploadTime: '2026-02-16 14:30' },
    { name: '租赁合同-补充协议.pdf', size: '0.6 MB', uploadTime: '2026-02-16 14:35' }
  ];
  if (isThreePartyContract) {
    contractOriginalFiles = contractOriginalFiles.concat([{ name: '三方合同-原件.pdf', size: '0.8 MB', uploadTime: '2026-03-02 16:10' }]);
    stampedContractFiles = stampedContractFiles.concat([{ name: '三方盖章合同-盖章版.pdf', size: '1.1 MB', uploadTime: '2026-03-03 09:50' }]);
  }
  var mockContract = { projectName: '嘉兴氢能运输项目', contractCode: 'JXZL20260216YW101235A', contractType: '正式合同', effectiveDate: '2026-02-16', paymentMethod: '预付', mainVehicleModels: '型号A1、型号A2', endDate: '2027-02-16', paymentPeriod: '1个月', signingCompany: '嘉兴羚牛', deliveryRegion: '浙江省 / 嘉兴市', deliveryLocation: '嘉兴市南湖区科技大道1号', contractApprovalType: '标准合同审批', remarks: '' };
  var mockAuthorized = [{ name: '张三', phone: '13800138001', idCard: '330102199001011234' }];
  var mockRentalOrders = [
    { brand: '品牌A', model: '型号A1', plateNo: '浙A10001', vehicleStatus: '已交车', vin: 'L1234567890ABCDEF', monthRent: '8000', serviceFee: '500', deposit: '10000', remark: '', serviceItems: [{ project: '保养费用', fee: '200', effectiveDate: '2026-03-01' }, { project: '清洗费', fee: '80', effectiveDate: '2026-03-01' }] },
    { brand: '品牌A', model: '型号A2', plateNo: '浙B20002', vehicleStatus: '已交车-临时替换', vin: 'L2234567890ABCDEF', monthRent: '8000', serviceFee: '500', deposit: '10000', remark: '', serviceItems: [{ project: '清洗费', fee: '80', effectiveDate: '2026-03-01' }] }
  ];
  var mockRentalSummary = { vehicleCount: 2, totalRentService: '17000.00', totalDeposit: '20000.00', hydrogenPrepay: '5000.00' };
  var addVehicleDate = '2026-03-15';
  var mockNewVehicleOrders = [
    { brand: '品牌B', model: '型号B1', plateNo: '沪A30003', vehicleStatus: '待交车', vin: 'L3234567890ABCDEF', monthRent: '7000', serviceFee: '400', deposit: '8000', remark: '新增车辆', serviceItems: [{ project: '保养费用', fee: '180', effectiveDate: '2026-04-01' }] }
  ];
  var mockNewVehicleSummary = { vehicleCount: 1, totalRentService: '7400.00', totalDeposit: '8000.00' };
  var mockHydrogen = { bearer: '客户', paymentMethod: '预付', hydrogenPrepay: '5000', returnPrice: '80' };
  var mockFeeTemplate = '标准费用模板A';
  var mockBillingMethod = '按自然月结算';
  var feeTemplateCertFees = [{ project: '补办行驶证', standard: '50元/次', serviceFee: '20' }, { project: '补办驾驶证', standard: '30元/次', serviceFee: '10' }, { project: '补办牌照', standard: '100元/次', serviceFee: '50' }];
  var feeTemplatePenaltyFees = [{ project: '提前退车违约金', standard: '月租金×1', serviceFee: '0' }, { project: '违章处理违约金', standard: '按实际发生', serviceFee: '50' }];
  var feeTemplateConsumables = [{ category: '轮胎', part: '前轮', partName: '轮胎A型', qty: 1, feeDetail: '500.00' }, { category: '易损件', part: '雨刮', partName: '雨刮片', qty: 2, feeDetail: '80.00' }];
  var feeTemplateOtherFees = [{ project: '上门送车费', standard: '100元/次', serviceFee: '50' }, { project: '上门收车费', standard: '100元/次', serviceFee: '50' }, { project: '清洗费', standard: '80元/次', serviceFee: '30' }];
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
  var feeTemplateBody = React.createElement('div', null,
    React.createElement('div', { style: Object.assign({}, styles.feeSectionTitle, styles.feeSectionTitleFirst) }, '证照补办费用'),
    feeCertTable,
    React.createElement('div', { style: styles.feeSectionTitle }, '违约金费用'),
    feePenaltyTable,
    React.createElement('div', { style: styles.feeSectionTitle }, '易损件信息'),
    feeConsumablesTable,
    React.createElement('div', { style: styles.feeSectionTitle }, '其他费用信息'),
    feeOtherTable
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
        React.createElement('div', { style: Object.assign({}, styles.input, styles.inputDisabled, { padding: '8px 12px' }) },
          contractOriginalFiles && contractOriginalFiles.length
            ? React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 8 } },
                contractOriginalFiles.map(function(f, i) {
                  return React.createElement('div', { key: i, style: { display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' } },
                    React.createElement('a', { href: '#', style: { color: '#1890ff', cursor: 'pointer', textDecoration: 'none' }, onClick: function(e) { e.preventDefault(); window.open('#', '_blank'); } }, f.name),
                    (f.size || f.uploadTime) ? React.createElement('span', { style: { color: '#999', fontSize: 12 } }, (f.size || '') + (f.size && f.uploadTime ? ' · ' : '') + (f.uploadTime || '')) : null
                  );
                })
              )
            : '—'
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
  var Popover = window.antd && window.antd.Popover;
  var renderServiceItemsPopover = function(row) {
    var items = row.serviceItems || [];
    if (items.length === 0) {
      return React.createElement('div', { style: { padding: 12, minWidth: 320, fontSize: 13 } }, '暂无服务项明细');
    }
    var thead = React.createElement('thead', null,
      React.createElement('tr', null,
        React.createElement('th', { style: styles.rentalTh }, '服务项目'),
        React.createElement('th', { style: styles.rentalTh }, '费用'),
        React.createElement('th', { style: styles.rentalTh }, '生效时间')
      )
    );
    var tbody = React.createElement('tbody', null,
      items.map(function(si, i) {
        return React.createElement('tr', { key: i },
          React.createElement('td', { style: styles.rentalTd }, si.project || '—'),
          React.createElement('td', { style: styles.rentalTd }, si.fee != null && si.fee !== '' ? si.fee + ' 元' : '—'),
          React.createElement('td', { style: styles.rentalTd }, si.effectiveDate || '—')
        );
      })
    );
    return React.createElement('div', { style: { padding: 8 } },
      React.createElement('table', { style: styles.rentalTable }, thead, tbody)
    );
  };
  var rentalTableBody = mockRentalOrders.map(function(row, idx) {
    var servicePopoverContent = renderServiceItemsPopover(row);
    var serviceCell = Popover
      ? React.createElement(Popover, { content: servicePopoverContent, title: '服务项明细', trigger: 'click' },
          React.createElement('span', { style: { color: '#1890ff', cursor: 'pointer', fontSize: 13 } }, '查看'))
      : React.createElement('span', {
          style: { color: '#1890ff', cursor: 'pointer', fontSize: 13 },
          onClick: function() { setServicePopoverRowNewVehicle(null); setServicePopoverRow(servicePopoverRow === idx ? null : idx); }
        }, '查看');
    return React.createElement('tr', { key: idx },
      React.createElement('td', { style: styles.rentalTd }, idx + 1),
      React.createElement('td', { style: styles.rentalTd }, React.createElement('div', { style: styles.rentalInputDisabled }, row.brand)),
      React.createElement('td', { style: styles.rentalTd }, React.createElement('div', { style: styles.rentalInputDisabled }, row.model)),
      React.createElement('td', { style: styles.rentalTd }, React.createElement('div', { style: styles.rentalInputDisabled }, row.plateNo)),
      React.createElement('td', { style: styles.rentalTd }, React.createElement('div', { style: styles.rentalInputDisabled }, row.vehicleStatus || '—')),
      React.createElement('td', { style: styles.rentalTd }, React.createElement('div', { style: styles.rentalInputDisabled }, row.vin)),
      React.createElement('td', { style: styles.rentalTd }, React.createElement('div', { style: styles.rentalInputDisabled }, row.monthRent + ' 元')),
      React.createElement('td', { style: styles.rentalTd }, serviceCell),
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
        React.createElement('th', { style: styles.rentalTh, width: 160 }, '车辆状态'),
        React.createElement('th', { style: styles.rentalTh, width: 160 }, '车辆识别代码'),
        React.createElement('th', { style: styles.rentalTh, width: 120 }, '车辆月租金'),
        React.createElement('th', { style: styles.rentalTh, width: 80 }, '服务费项目'),
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

  var newVehicleSummaryEl = React.createElement('div', { style: styles.summaryList },
    React.createElement('div', { style: styles.summaryListItem }, React.createElement('span', { style: styles.summaryListLabel }, '租赁车辆数'), React.createElement('span', { style: styles.summaryListValue }, mockNewVehicleSummary.vehicleCount + ' 辆')),
    React.createElement('div', { style: styles.summaryListItem }, React.createElement('span', { style: styles.summaryListLabel }, '租金及服务费合计'), React.createElement('span', { style: styles.summaryListValue }, mockNewVehicleSummary.totalRentService + ' 元')),
    React.createElement('div', { style: styles.summaryListItem }, React.createElement('span', { style: styles.summaryListLabel }, '保证金总额'), React.createElement('span', { style: styles.summaryListValue }, mockNewVehicleSummary.totalDeposit + ' 元'))
  );
  var newVehicleTableBody = mockNewVehicleOrders.map(function(row, idx) {
    var servicePopoverContent = renderServiceItemsPopover(row);
    var serviceCell = Popover
      ? React.createElement(Popover, { content: servicePopoverContent, title: '服务项目', trigger: 'click' },
          React.createElement('span', { style: { color: '#1890ff', cursor: 'pointer', fontSize: 13 } }, '查看'))
      : React.createElement('span', {
          style: { color: '#1890ff', cursor: 'pointer', fontSize: 13 },
          onClick: function() { setServicePopoverRow(null); setServicePopoverRowNewVehicle(idx); }
        }, '查看');
    return React.createElement('tr', { key: idx },
      React.createElement('td', { style: styles.rentalTd }, idx + 1),
      React.createElement('td', { style: styles.rentalTd }, React.createElement('div', { style: styles.rentalInputDisabled }, row.brand)),
      React.createElement('td', { style: styles.rentalTd }, React.createElement('div', { style: styles.rentalInputDisabled }, row.model)),
      React.createElement('td', { style: styles.rentalTd }, React.createElement('div', { style: styles.rentalInputDisabled }, row.plateNo)),
      React.createElement('td', { style: styles.rentalTd }, React.createElement('div', { style: styles.rentalInputDisabled }, row.vin)),
      React.createElement('td', { style: styles.rentalTd }, React.createElement('div', { style: styles.rentalInputDisabled }, row.monthRent + ' 元')),
      React.createElement('td', { style: styles.rentalTd }, serviceCell),
      React.createElement('td', { style: styles.rentalTd }, React.createElement('div', { style: styles.rentalInputDisabled }, row.serviceFee + ' 元')),
      React.createElement('td', { style: styles.rentalTd }, React.createElement('div', { style: styles.rentalInputDisabled }, row.deposit + ' 元')),
      React.createElement('td', { style: styles.rentalTd }, React.createElement('div', { style: styles.rentalInputDisabled }, row.remark || '—'))
    );
  });
  var newVehicleTableEl = React.createElement('table', { style: styles.rentalTable },
    React.createElement('thead', null,
      React.createElement('tr', null,
        React.createElement('th', { style: styles.rentalTh, width: 50 }, '序号'),
        React.createElement('th', { style: styles.rentalTh, width: 100 }, '品牌'),
        React.createElement('th', { style: styles.rentalTh, width: 100 }, '型号'),
        React.createElement('th', { style: styles.rentalTh, width: 120 }, '车牌号'),
        React.createElement('th', { style: styles.rentalTh, width: 160 }, '车辆识别代码'),
        React.createElement('th', { style: styles.rentalTh, width: 120 }, '车辆月租金'),
        React.createElement('th', { style: styles.rentalTh, width: 80 }, '服务费项目'),
        React.createElement('th', { style: styles.rentalTh, width: 90 }, '服务费'),
        React.createElement('th', { style: styles.rentalTh, width: 100 }, '保证金'),
        React.createElement('th', { style: styles.rentalTh, width: 80 }, '备注')
      )
    ),
    React.createElement('tbody', null, newVehicleTableBody)
  );
  var newVehicleContent = React.createElement('div', null, newVehicleSummaryEl, React.createElement('div', { style: { overflowX: 'auto', marginBottom: 16 } }, newVehicleTableEl));

  var feeContent = React.createElement('div', null, React.createElement('div', { style: styles.formRow }, React.createElement(FormItemReadOnly, { label: '选择费用模板', value: mockFeeTemplate })), feeTemplateBody);

  var billingContent = React.createElement('div', null, React.createElement('div', { style: { padding: '12px 16px', border: '1px solid #e8e8e8', borderRadius: 4, backgroundColor: '#fafafa', fontSize: 14, color: '#333' } }, mockBillingMethod));

  var attachmentContent = React.createElement('div', { style: styles.card },
    React.createElement('div', { style: styles.cardHeader },
      React.createElement('span', { style: styles.cardTitle }, '盖章合同附件')
    ),
    React.createElement('div', { style: styles.cardBody },
      stampedContractFiles && stampedContractFiles.length
        ? React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 10 } },
            stampedContractFiles.map(function(f, i) {
              return React.createElement('div', { key: i, style: styles.attachmentRow },
                React.createElement('button', {
                  type: 'button',
                  style: Object.assign({}, styles.attachmentFile, stampedHoverIndex === i ? styles.attachmentFileHover : {}),
                  onMouseEnter: function() { setStampedHoverIndex(i); },
                  onMouseLeave: function() { setStampedHoverIndex(null); },
                  onClick: function() { window.open('#', '_blank'); }
                }, '📄 ' + f.name, React.createElement('span', { style: styles.attachmentMeta }, f.size + ' · ' + f.uploadTime))
              );
            })
          )
        : React.createElement('div', { style: { color: '#999', fontSize: 13 } }, '暂无附件')
    )
  );

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
        React.createElement('th', { style: styles.rentalTh, width: 100 }, '操作类型'),
        React.createElement('th', { style: styles.rentalTh, width: 90 }, '操作人'),
        React.createElement('th', { style: styles.rentalTh, width: 120 }, '原始记录'),
        React.createElement('th', { style: styles.rentalTh }, '备注')
      )
    ),
    React.createElement('tbody', null, historyTableRows)
  );
  var changeHistoryContent = React.createElement('div', { style: styles.card },
    React.createElement('div', { style: styles.cardHeader },
      React.createElement('span', { style: styles.cardTitle }, '合同变更历史记录')
    ),
    React.createElement('div', { style: styles.cardBody },
      React.createElement('div', { style: { overflowX: 'auto' } }, historyTable)
    )
  );

  var requirementContent = '车辆租赁合同-查看（2026年3月3日版本）\n「数字化资产ONE-OS运管平台」中的「车辆租赁合同」-「查看租赁合同」模块，在车辆租赁合同操作列点击「查看」进行查看；\n1.面包屑：\n#业务管理-车辆租赁合同-查看合同\n\n3.客户基本信息卡片：\n#显示已审批合同实际信息，不可修改，当客户信息产生变更时，对该条历史合同数据不作更新，合同变更为三方合同时不在原有客户基本信息做修改，而是增加三方客户基本信息卡片；\n3.1.客户名称：从该条合同自动反查；\n3.2.客户统一信用代码：从该条合同自动反查；\n3.3.客户地址：从该条合同自动反查；\n3.4.客户联系人：从该条合同自动反查；\n3.5.客户电话：从该条合同自动反查；\n3.6.客户电子邮箱：从该条合同自动反查；\n3.7.企业名称：从该条合同自动反查；\n3.8.企业电话：从该条合同自动反查；\n3.9.邮寄地址：从该条合同自动反查；\n3.10.开户银行：从该条合同自动反查；\n3.11.银行账号：从该条合同自动反查；\n3.12.纳税人识别号：从该条合同自动反查；\n3.13.业务部门：从该条合同自动反查；\n3.14.业务负责人：从该条合同自动反查；\n\n4.丙方客户基本信息卡片（当合同转三方合同时显示）：\n#显示已审批合同丙方实际信息，不可修改；；\n4.1.客户名称：从该条合同自动反查；\n4.2.客户统一信用代码：从该条合同自动反查；\n4.3.客户地址：从该条合同自动反查；\n4.4.客户联系人：从该条合同自动反查；\n4.5.客户电话：从该条合同自动反查；\n4.6.客户电子邮箱：从该条合同自动反查；\n4.7.企业名称：从该条合同自动反查；\n4.8.企业电话：从该条合同自动反查；\n4.9.邮寄地址：从该条合同自动反查；\n4.10.开户银行：从该条合同自动反查；\n4.11.银行账号：从该条合同自动反查；\n4.12.纳税人识别号：从该条合同自动反查；\n4.13.业务部门：从该条合同自动反查；\n4.14.业务负责人：从该条合同自动反查；\n\n5.合同基本信息卡片：\n#显示合同基本信息，不可修改；\n5.1.项目名称：从该条合同自动反查；\n5.2.合同编码：从该条合同自动反查，在新增租赁合同点击提交审核时生成；\n    合同编码由：[城市简写][合同类型][签约时间][业务部门代码][顺序流水号][签署状态]组成；\n    5.2.1.地区简写：如上海为SH，嘉兴为JX；\n    5.2.2.合同类型：采购合同为CG、租赁合同为ZL、自营合同为ZY；\n    5.2.3.签约时间：显示合同签约时间，如20260216\n    5.2.4.业务部门代码：显示合同签约业务部门信息，如YW1代表业务1部，YW2代表业务2部；\n    5.2.5.顺序流水号：实施5位编号补零规则，如01235，代表是集团编号为1235的合同；\n    5.2.6.签署状态：A为正式合同，B为试用合同；\n    如编号为：JXZL20260216YW101235A，则代表嘉兴业务1部在2026年2月16日签署的租赁正式合同，在集团中编号为1235，也可以理解为第1235份合同；\n    5.2.7.如果该合同为续签合同，则自动在新合同编码后额外添加：（续签自：旧合同合同编码xxx）；\n    5.2.8.如果该合同为转正式合同，则自动在新合同编码后额外添加：（转正式合同自：旧合同合同编码xxx）；\n5.3.合同类型：从该条合同自动反查；\n5.4.生效日期：从该条合同自动反查；\n5.5.付款方式：从该条合同自动反查；\n5.6.主要车型：从该条合同自动反查；\n5.7.结束日期：从该条合同自动反查；\n    5.7.1.合同结束日期前30天将以消息提醒方式提醒（消息中心、工作台）；\n    5.7.2.到达合同结束日期时，租赁账单将会立刻停止计算，作为最后一期账单；\n    5.7.3.续签合同/转正式合同将重新生成账单，不会对旧合同账单做任何继承处理；\n5.8.付款周期：从该条合同自动反查；\n5.9.签约公司：从该条合同自动反查；\n5.10.交车区域：从该条合同自动反查；\n5.11.交车地点：从该条合同自动反查；\n5.12.合同审批类型：从该条合同自动反查，可选值「标准合同审批」「非标准合同审批」；\n5.13.合同原件：从该条合同自动反查，显示「合同原件名称.格式」「文件大小」「上传时间」，可能会存在多个附件，显示为一列，如果转为三方合同，则会显示新附件，显示「三方合同原件名称.格式」「文件大小」「上传时间」；\n5.14.备注：从该条合同自动反查；\n     5.14.1.如果该合同为续签合同，则自动在已填备注信息上方额外添加：续签自：旧合同合同编码xxx；\n     5.14.2.如果该合同为转正式合同，则自动在已填备注信息上方额外添加：转正式合同自：旧合同合同编码xxx；\n\n6.被授权人信息卡片：\n#显示所有被授权人信息，不可修改，如要新增被授权人，需要在列表中点击添加被授权人进行处理；\n6.1.被授权人：从该条合同自动反查；\n6.2.被授权人联系电话：从该条合同自动反查；\n6.3.被授权人身份证：从该条合同自动反查；\n\n7.租赁订单信息卡片：\n#显示租赁合同对应车辆明细费用、氢费明细费用等相关信息；\n7.1.上方为租赁车辆总计数据，包括租赁车辆数、租金及服务费合计、保证金总额、氢气预付款金额等相关信息；\n    7.1.1.租赁车辆数：显示下方租赁订单信息包含多少辆车；\n    7.1.2.租金及服务费合计：显示下方租赁订单信息中车辆租金总额及服务费总额；\n    7.1.3.保证金总额：显示下方租赁订单信息中车辆保证金总额；\n    7.1.4.氢气预付款金额：显示氢气预付款金额，如客户选择自行承担氢费或羚牛承担氢费，则该处为0不计入氢气预付款金额；\n7.2.下方为列表，显示序号、品牌、型号、车牌号、车辆识别代码、车辆月租金（元）、服务费项目、服务费、保证金、备注；\n    7.2.1.序号：从该条合同自动反查；\n    7.2.2.品牌：从该条合同自动反查；\n    7.2.3.型号：从该条合同自动反查；\n    7.2.4.车牌号：从该条合同自动反查；\n    7.2.5.车辆状态：分为已交车、已交车-临时替换、已交车-永久替换、待交车；\n    7.2.6.车辆识别代码：从该条合同自动反查；\n    7.2.7.车辆月租金：从该条合同自动反查；\n    7.2.7.服务费项目：点击查看按钮弹出卡片，卡片标题为：服务项目，下方列表显示服务项目、费用、生效时间；\n          7.2.7.1.服务项目：从该条合同自动反查；\n          7.2.7.2.费用：从该条合同自动反查；\n          7.2.7.3.生效时间：从该条合同自动反查；\n                  #在提车应收款中，车辆的交车日期和服务费生效日期可能会存在不同的情况，所以服务费需要单独以生效时间进行计算，例如：\n                  交车后车辆从1月1日开始计费，付款周期为2个月，则提车应收款租金会计算到3月1日，但是服务费生效时间为1月30日，此情况下需要以3月1日-1月30日，计算出服务费具体收费天数为30天，然后根据：（服务费费用/30）* 服务费收费天数30）进行计算；\n    7.2.8.服务费：从该条合同自动反查；\n    7.2.9.保证金：从该条合同自动反查；\n    7.2.10.备注：从该条合同自动反查；\n7.3.氢费承担方：从该条合同自动反查；\n7.4.付款方式：从该条合同自动反查；\n7.5.氢气预付款：从该条合同自动反查；\n7.6.退还车氢气单价：从该条合同自动反查，该金额主要用于与客户约定还车时，与交车时氢气差值以此费用进行自动计算和结算；\n\n8.新增车辆信息卡片（用户每次为合同新增车辆时，都会生成一个新增车辆信息卡片）：\n#显示租赁合同对应新增车辆的明细费用、氢费明细费用等相关信息；\n8.1.卡片标题显示为：新增车辆信息（YYYY-MM-DD）\n8.2.上方为租赁车辆总计数据，包括租赁车辆数、租金及服务费合计、保证金总额等相关信息；\n    8.2.1.租赁车辆数：显示下方租赁订单信息包含多少辆车；\n    8.2.2.租金及服务费合计：显示下方租赁订单信息中车辆租金总额及服务费总额；\n    8.2.3.保证金总额：显示下方租赁订单信息中车辆保证金总额；\n8.3.下方为列表，显示序号、品牌、型号、车牌号、车辆识别代码、车辆月租金（元）、服务费项目、服务费、保证金、备注；\n    8.3.1.序号：从该条合同自动反查；\n    8.3.2.品牌：从该条合同自动反查；\n    8.3.3.型号：从该条合同自动反查；\n    8.3.4.车牌号：从该条合同自动反查；\n    8.3.5.车辆识别代码：从该条合同自动反查；\n    8.3.6.车辆月租金：从该条合同自动反查；\n    8.3.7.服务费项目：点击查看按钮弹出卡片，卡片标题为：服务项目，下方列表显示服务项目、费用、生效时间；\n          8.3.7.1.服务项目：从该条合同自动反查；\n          8.3.7.2.费用：从该条合同自动反查；\n          8.3.7.3.生效时间：从该条合同自动反查；\n                  #在提车应收款中，车辆的交车日期和服务费生效日期可能会存在不同的情况，所以服务费需要单独以生效时间进行计算，例如：\n                  交车后车辆从1月1日开始计费，付款周期为2个月，则提车应收款租金会计算到3月1日，但是服务费生效时间为1月30日，此情况下需要以3月1日-1月30日，计算出服务费具体收费天数为30天，然后根据：（服务费费用/30）* 服务费收费天数30）进行计算；\n    8.3.8.服务费：从该条合同自动反查；\n    8.3.9.保证金：从该条合同自动反查；\n    8.3.10.备注：从该条合同自动反查；\n\n9.其他费用信息卡片：\n#显示对应租赁费用模板证照补办费用、违约金费用、易损件费用、其他费用等信息；\n9.1.选择费用模板：必选项，从「租赁费用模板」中拉取，选择后自动将该费用模板所有环节费用显示在合同中；\n    9.1.1.证照补办费用：单独标题显示，内容为列表，列表中包括项目、收费标准、服务费，从该条合同自动反查；\n    9.1.2.违约金费用：单独标题显示，内容为列表，列表中包含项目、收费标准、服务费，从该条合同自动反查；\n    9.1.3.易损件信息：单独标题显示，内容为列表，列表中包含类别、损坏部位、配件、数量、费用明细，从该条合同自动反查；\n    9.1.4.其他费用信息：单独标题显示，内容为列表，列表中包含项目、收费标准、服务费，从该条合同自动反查；\n\n10.账单计算方式卡片：\n#显示实际结算方式；\n\n11.盖章合同附件：\n#显示财务审核完成后，由法务上传的盖章版合同文件，显示「盖章合同名称.格式」「文件大小」「上传时间」，可能会存在多个附件，显示为一列；如果转为三方合同，则会重新审批，法务上传显示新附件，显示「三方盖章合同名称.格式」「文件大小」「上传时间」\n\n12.合同变更历史记录：\n#显示合同变更历史，包括序号、变更时间、操作类型、操作人、原始记录、备注；\n12.1.序号：显示变更历史序号，按照变更时间倒序（从近到远）进行排序；\n12.2.变更时间：显示变更时间，格式为：YYYY-MM-DD HH:MM；\n12.3.操作类型：包括变更为三方合同、添加车辆、添加授权人、续签合同、撤回合同、终止合同、转正式合同、保存；\n12.4.操作人：显示对应操作类型操作人员；\n12.5.原始记录：显示查看变更前记录，点击打开新页面至查看原始合同快照；\n12.6.备注：备注改动内容，包括：\n     12.6.1.变更为三方合同时：增加丙方客户“客户名称xxxxxx”；\n     12.6.2.添加车辆时：添加车辆“车牌号xxx”、“车牌号xxx”、“车牌号xxx”，每辆车单独一行显示；\n     12.6.3.添加授权人时：添加授权人“授权人xxxx”、“授权人xxx”，每个授权人单独一行显示；\n     12.6.4.续签合同时：续签自”原合同编码xxxxxx“；\n     12.6.5.撤回合同时：主动撤回；\n     12.6.6.终止合同时：主动终止；\n     12.6.7.转正式合同时：转正式合同自“原合同编码xxxx”；\n     12.6.8.保存：无；\n\n2.审批状态：\n按照流程引擎设置节点显示；\n\n13.最下方为返回按钮，点击返回车辆租赁合同列表；\n\n所有卡片支持收起/展开功能，通过点击卡片右侧收起/展开实现；并增加锚点功能，锚点固定于页面右上角，点击锚点对应卡片名称，页面自动跳转至该卡片所在区域；';
  var reqSpecModalContent = reqSpecOpen ? React.createElement('div', { style: styles.modalMask, onClick: function(e) { if (e.target === e.currentTarget) setReqSpecOpen(false); } }, React.createElement('div', { style: Object.assign({}, styles.modalBox, { maxWidth: 720 }), onClick: function(e) { e.stopPropagation(); } }, React.createElement('div', { style: styles.modalHeader }, '需求说明'), React.createElement('div', { style: Object.assign({}, styles.modalBody, { maxHeight: '70vh', padding: '20px 24px', overflow: 'auto' }) }, React.createElement('div', { style: { whiteSpace: 'pre-wrap', fontSize: 13, lineHeight: 1.6, color: 'rgba(0,0,0,0.85)' } }, requirementContent)), React.createElement('div', { style: { padding: '12px 20px', borderTop: '1px solid #f0f0f0', textAlign: 'right' } }, React.createElement('button', { style: Object.assign({}, styles.btn, styles.btnDefault), onClick: function() { setReqSpecOpen(false); } }, '关闭')))) : null;

  var servicePopoverRentalOpen = !Popover && servicePopoverRow !== null && mockRentalOrders[servicePopoverRow];
  var servicePopoverNewVehicleOpen = !Popover && servicePopoverRowNewVehicle !== null && mockNewVehicleOrders[servicePopoverRowNewVehicle];
  var servicePopoverContentCustom = (servicePopoverRentalOpen || servicePopoverNewVehicleOpen)
    ? React.createElement('div', { style: styles.modalMask, onClick: function(e) { if (e.target === e.currentTarget) { setServicePopoverRow(null); setServicePopoverRowNewVehicle(null); } } },
        React.createElement('div', { style: Object.assign({}, styles.modalBox, { maxWidth: 480 }), onClick: function(e) { e.stopPropagation(); } },
          React.createElement('div', { style: styles.modalHeader }, '服务项目'),
          React.createElement('div', { style: Object.assign({}, styles.modalBody, { padding: '16px 20px' }) }, servicePopoverRentalOpen ? renderServiceItemsPopover(mockRentalOrders[servicePopoverRow]) : renderServiceItemsPopover(mockNewVehicleOrders[servicePopoverRowNewVehicle])),
          React.createElement('div', { style: { padding: '12px 20px', borderTop: '1px solid #f0f0f0', textAlign: 'right' } }, React.createElement('button', { style: Object.assign({}, styles.btn, styles.btnDefault), onClick: function() { setServicePopoverRow(null); setServicePopoverRowNewVehicle(null); } }, '关闭'))
        ))
    : null;

  return React.createElement('div', { style: styles.page },
    servicePopoverContentCustom,
    React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 } }, React.createElement('div', { style: styles.breadcrumb }, React.createElement('span', null, '业务管理'), React.createElement('span', { style: styles.breadcrumbSep }, ' / '), React.createElement('span', null, '车辆租赁合同'), React.createElement('span', { style: styles.breadcrumbSep }, ' / '), React.createElement('span', { style: { color: '#1890ff' } }, '查看合同')), React.createElement('span', { style: { color: '#1890ff', cursor: 'pointer', fontSize: 14 }, onClick: function() { setReqSpecOpen(true); } }, '查看需求说明')),
    React.createElement('div', { style: styles.anchorWrap },
      React.createElement('div', { style: { marginBottom: 8, fontWeight: 600, fontSize: 14 } }, '锚点导航'),
      React.createElement('button', { style: styles.anchorItem, onClick: function() { scrollToCard('card-customer'); } }, '客户基本信息'),
      isThreePartyContract ? React.createElement('button', { style: styles.anchorItem, onClick: function() { scrollToCard('card-third-party'); } }, '丙方客户基本信息') : null,
      React.createElement('button', { style: styles.anchorItem, onClick: function() { scrollToCard('card-contract'); } }, '合同基本信息'),
      React.createElement('button', { style: styles.anchorItem, onClick: function() { scrollToCard('card-authorized'); } }, '被授权人信息'),
      React.createElement('button', { style: styles.anchorItem, onClick: function() { scrollToCard('card-rental'); } }, '租赁订单信息'),
      React.createElement('button', { style: styles.anchorItem, onClick: function() { scrollToCard('card-new-vehicle'); } }, '新增车辆信息（' + addVehicleDate + '）'),
      React.createElement('button', { style: styles.anchorItem, onClick: function() { scrollToCard('card-fee'); } }, '其他费用信息'),
      React.createElement('button', { style: styles.anchorItem, onClick: function() { scrollToCard('card-billing'); } }, '账单计算方式'),
      React.createElement('button', { style: styles.anchorItem, onClick: function() { scrollToCard('card-attachment'); } }, '盖章合同附件'),
      React.createElement('button', { style: styles.anchorItem, onClick: function() { scrollToCard('card-history'); } }, '合同变更历史记录')
    ),
    React.createElement('div', { id: 'card-customer' }, React.createElement(CardBlock, { id: 'card-customer', title: '客户基本信息', collapsed: cc1, setCollapsed: setCc1 }, customerFields)),
    isThreePartyContract ? React.createElement('div', { id: 'card-third-party', style: { marginTop: 16 } }, React.createElement(CardBlock, { id: 'card-third-party', title: '丙方客户基本信息', collapsed: cc1b, setCollapsed: setCc1b }, thirdPartyCustomerFields)) : null,
    React.createElement('div', { id: 'card-contract', style: { marginTop: 16 } }, React.createElement(CardBlock, { title: '合同基本信息', collapsed: cc2, setCollapsed: setCc2 }, React.createElement('div', null, contractFormRow1, contractFormRow2))),
    React.createElement('div', { id: 'card-authorized', style: { marginTop: 16 } }, React.createElement(CardBlock, { title: '被授权人信息', collapsed: cc3, setCollapsed: setCc3 }, authorizedContent)),
    React.createElement('div', { id: 'card-rental', style: { marginTop: 16 } }, React.createElement(CardBlock, { title: '租赁订单信息', collapsed: cc4, setCollapsed: setCc4 }, rentalContent)),
    React.createElement('div', { id: 'card-new-vehicle', style: { marginTop: 16 } }, React.createElement(CardBlock, { id: 'card-new-vehicle', title: '新增车辆信息（' + addVehicleDate + '）', collapsed: cc4b, setCollapsed: setCc4b }, newVehicleContent)),
    React.createElement('div', { id: 'card-fee', style: { marginTop: 16 } }, React.createElement(CardBlock, { title: '其他费用信息', collapsed: cc5, setCollapsed: setCc5 }, feeContent)),
    React.createElement('div', { id: 'card-billing', style: { marginTop: 16 } }, React.createElement(CardBlock, { title: '账单计算方式', collapsed: cc6, setCollapsed: setCc6 }, billingContent)),
    React.createElement('div', { id: 'card-attachment', style: { marginTop: 16 } }, attachmentContent),
    React.createElement('div', { id: 'card-history', style: { marginTop: 16 } }, changeHistoryContent),
    approvalCardEl,
    React.createElement('div', { style: { height: 60 } }),
    reqSpecModalContent,
    React.createElement('div', { style: styles.footer }, React.createElement('button', { style: Object.assign({}, styles.btn, styles.btnDefault) }, '返回'))
  );
};
