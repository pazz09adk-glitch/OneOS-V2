// 【重要】必须使用 const Component 作为组件变量名 - Axhub 产品原型
// 数字化资产ONEOS运管平台 - 编辑交车任务模块（布局同新增交车任务，项目名称禁用不可改）

const Component = function() {
  var antd = window.antd;
  var Input = antd.Input;
  var Select = antd.Select;
  var Button = antd.Button;
  var DatePicker = antd.DatePicker;
  var Modal = antd.Modal;
  var message = antd.message;
  var Option = Select.Option;
  var Checkbox = antd.Checkbox;
  var Tooltip = antd.Tooltip;
  var RangePicker = DatePicker.RangePicker;

  var projectId = React.useState('p1');
  var selectedProjectId = projectId[0];
  var setSelectedProjectId = projectId[1];

  var expectedDelivery = React.useState(function() {
    if (typeof window !== 'undefined' && window.dayjs) {
      return [window.dayjs('2026-03-01'), window.dayjs('2026-03-05')];
    }
    return null;
  });
  var expectedDeliveryValue = expectedDelivery[0];
  var setExpectedDelivery = expectedDelivery[1];

  var billingDate = React.useState(function() {
    if (typeof window !== 'undefined' && window.dayjs) {
      return window.dayjs('2026-03-06');
    }
    return null;
  });
  var billingDateValue = billingDate[0];
  var setBillingDate = billingDate[1];

  var noReturnCarCheckedState = React.useState(false);
  var noReturnCarChecked = noReturnCarCheckedState[0];
  var setNoReturnCarChecked = noReturnCarCheckedState[1];

  var selectedRowKeys = React.useState(['v3', 'v4']);
  var checkedRowKeys = selectedRowKeys[0];
  var setCheckedRowKeys = selectedRowKeys[1];

  var formErrors = React.useState({});
  var errors = formErrors[0];
  var setErrors = formErrors[1];

  var reqModalOpen = React.useState(false);

  // Mock：项目列表及车辆（与新增交车任务一致，含续签项目）
  var projectList = [
    { id: 'p1', name: '嘉兴某某物流氢能运输项目', contractCode: 'JXZL20260216YW101235A', customerName: '嘉兴某某物流有限公司', deliveryRegion: '浙江省 / 嘉兴市', deliveryLocation: '浙江省嘉兴市南湖区科技大道1号', vehicles: [
      { key: 'v1', seq: 1, brand: '东风', model: '氢燃料电池重卡 H31', plateNo: '浙A10001', vin: 'LFV2BJCH8K3123456', monthRent: '12800', serviceFee: '800', deposit: '30000', remark: '首车', deliveryStatus: 'submitted' },
      { key: 'v2', seq: 2, brand: '东风', model: '氢燃料电池重卡 H31', plateNo: '浙A10002', vin: 'LFV2BJCH8K3123457', monthRent: '12800', serviceFee: '800', deposit: '30000', remark: '', deliveryStatus: 'submitted' },
      { key: 'v3', seq: 3, brand: '福田', model: '智蓝氢能轻卡', plateNo: '', vin: 'LZYTBACR2M1234567', monthRent: '8500', serviceFee: '500', deposit: '20000', remark: '待上牌', deliveryStatus: 'none' },
      { key: 'v4', seq: 4, brand: '重汽', model: '豪沃氢能牵引车', plateNo: '浙F20001', vin: 'ZZ4257N386FZ12345', monthRent: '15000', serviceFee: '1000', deposit: '35000', remark: '', deliveryStatus: 'none' },
      { key: 'v5', seq: 5, brand: '陕汽', model: '德龙氢能自卸', plateNo: '浙F20002', vin: 'SX1313GR456123456', monthRent: '13200', serviceFee: '880', deposit: '32000', remark: '固定线路', deliveryStatus: 'none' }
    ]},
    { id: 'p1_r', name: '嘉兴某某物流氢能运输项目（续签合同）', isRenewal: true, contractCode: 'JXZL20270116YW101235B', customerName: '嘉兴某某物流有限公司', deliveryRegion: '浙江省 / 嘉兴市', deliveryLocation: '浙江省嘉兴市南湖区科技大道1号', vehicles: [
      { key: 'v1r_1', seq: 1, brand: '东风', model: '氢燃料电池重卡 H31', plateNo: '浙A10001', vin: 'LFV2BJCH8K3123456', monthRent: '12800', serviceFee: '800', deposit: '30000', remark: '续签合同车辆', deliveryStatus: 'none' },
      { key: 'v1r_0', seq: 2, brand: '东风', model: '氢燃料电池重卡 H31', plateNo: '浙A09999', vin: 'LFV2BJCH8K3000000', monthRent: '12800', serviceFee: '800', deposit: '30000', remark: '续签：已交车车辆样例', deliveryStatus: 'completed' },
      { key: 'v1r_0b', seq: 3, brand: '福田', model: '智蓝氢能轻卡', plateNo: '浙A08888', vin: 'LZYTBACR2M1000001', monthRent: '8500', serviceFee: '500', deposit: '20000', remark: '续签：已交车车辆样例', deliveryStatus: 'completed' },
      { key: 'v1r_0c', seq: 4, brand: '重汽', model: '豪沃氢能牵引车', plateNo: '浙A07777', vin: 'ZZ4257N386FZ00002', monthRent: '15000', serviceFee: '1000', deposit: '35000', remark: '续签：已交车车辆样例', deliveryStatus: 'completed' },
      { key: 'v1r_2', seq: 5, brand: '福田', model: '智蓝氢能轻卡', plateNo: '', vin: 'LZYTBACR2M1234567', monthRent: '8500', serviceFee: '500', deposit: '20000', remark: '续签待上牌', deliveryStatus: 'none' }
    ]},
    { id: 'p2', name: '上海某某运输氢能租赁项目', contractCode: 'SHZL20260201YW200123A', customerName: '上海某某运输公司', deliveryRegion: '上海市 / 上海市', deliveryLocation: '上海市浦东新区张江高科技园区', vehicles: [
      { key: 'v6', seq: 1, brand: '上汽红岩', model: '杰狮氢能牵引', plateNo: '沪A30003', vin: 'SH1313HY789012345', monthRent: '14500', serviceFee: '950', deposit: '34000', remark: '', deliveryStatus: 'submitted' },
      { key: 'v7', seq: 2, brand: '宇通', model: '氢能公交 ZK6126', plateNo: '沪B40001', vin: 'LZYTAGCF8K4567890', monthRent: '22000', serviceFee: '1200', deposit: '50000', remark: '示范线路', deliveryStatus: 'none' },
      { key: 'v8', seq: 3, brand: '福田', model: '欧辉氢能大巴', plateNo: '', vin: 'LZYTBACR2M2345678', monthRent: '19800', serviceFee: '1100', deposit: '45000', remark: '', deliveryStatus: 'none' }
    ]},
    { id: 'p3', name: '杭州某某租赁氢能项目', contractCode: 'HZZL20260115YW100089A', customerName: '杭州某某租赁有限公司', deliveryRegion: '浙江省 / 杭州市', deliveryLocation: '浙江省杭州市余杭区未来科技城', vehicles: [
      { key: 'v9', seq: 1, brand: '品牌C', model: '型号C1', plateNo: '浙A40004', vin: 'L4234567890ABCDEF', monthRent: '8200', serviceFee: '450', deposit: '20000', remark: '重点客户', deliveryStatus: 'completed' },
      { key: 'v10', seq: 2, brand: '品牌C', model: '型号C2', plateNo: '', vin: 'L5234567890ABCDEF', monthRent: '7800', serviceFee: '420', deposit: '19000', remark: '', deliveryStatus: 'submitted' },
      { key: 'v11', seq: 3, brand: '东风', model: '氢燃料电池厢货', plateNo: '浙A50001', vin: 'LFV2BJCH8K5678901', monthRent: '9200', serviceFee: '520', deposit: '22000', remark: '城配', deliveryStatus: 'none' },
      { key: 'v12', seq: 4, brand: '开沃', model: '创源氢能轻卡', plateNo: '浙A50002', vin: 'LJXTBACR9N6789012', monthRent: '8800', serviceFee: '480', deposit: '21000', remark: '', deliveryStatus: 'none' }
    ]}
  ];

  var selectedProject = projectList.find(function(p) { return p.id === selectedProjectId; });
  var isRenewalProject = !!(selectedProject && selectedProject.isRenewal);
  var vehicleListRaw = selectedProject ? selectedProject.vehicles : [];
  var vehicleList = vehicleListRaw.filter(function(v) {
    if (v.deliveryStatus === 'completed') { if (!isRenewalProject) return false; return true; }
    if (v.deliveryStatus === 'submitted') return true;
    if (isRenewalProject && !!noReturnCarChecked) return false;
    return true;
  });
  var selectableVehicles = vehicleList.filter(function(v) {
    if (v.deliveryStatus === 'submitted') return false;
    if (v.deliveryStatus === 'completed') return isRenewalProject && !!noReturnCarChecked;
    return true;
  });

  var handleProjectChange = function(id) {
    setSelectedProjectId(id || '');
    setCheckedRowKeys([]);
    setNoReturnCarChecked(false);
  };

  var todayStr = (function() {
    var d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  })();

  var validateExpectedDelivery = function() {
    if (!expectedDeliveryValue || !expectedDeliveryValue.length) return '请选择预计交车日期';
    var start = expectedDeliveryValue[0] && expectedDeliveryValue[0].format ? expectedDeliveryValue[0].format('YYYY-MM-DD') : null;
    var end = expectedDeliveryValue[1] && expectedDeliveryValue[1].format ? expectedDeliveryValue[1].format('YYYY-MM-DD') : null;
    if (!start) return '请选择预计交车日期';
    if (end && end < start) return '结束日期不能早于开始日期';
    if (end && end < todayStr) return '结束日期不能早于当前日期';
    return null;
  };

  var needExpectedDelivery = !(isRenewalProject && noReturnCarChecked);
  var expectedDeliveryError = needExpectedDelivery ? validateExpectedDelivery() : null;

  var billingDateError = !billingDateValue ? '请选择开始计费日期' : null;

  var handleSubmit = function() {
    var err = {};
    if (!selectedProjectId) err.projectName = '请选择项目名称';
    if (needExpectedDelivery && expectedDeliveryError) err.expectedDelivery = expectedDeliveryError;
    if (billingDateError) err.billingDate = billingDateError;
    if (checkedRowKeys.length === 0 && selectableVehicles.length > 0) err.vehicles = '请至少选择一辆车';
    setErrors(err);
    if (Object.keys(err).length) return;
    message.success('交车任务已保存。');
  };

  var onToggleNoReturnCar = function(e) {
    var next = !!(e && e.target ? e.target.checked : e);
    setNoReturnCarChecked(next);
    if (!next) {
      setCheckedRowKeys(function(prev) {
        var completedKeys = vehicleList.filter(function(v) { return v && v.deliveryStatus === 'completed'; }).map(function(v) { return v.key; });
        return prev.filter(function(k) { return completedKeys.indexOf(k) === -1; });
      });
    }
  };

  var handleCancel = function() {
    message.info('取消');
  };

  var onSelectAll = function(checked) {
    if (checked) setCheckedRowKeys(selectableVehicles.map(function(v) { return v.key; }));
    else setCheckedRowKeys([]);
  };

  var onSelectRow = function(record, checked) {
    if (checked) setCheckedRowKeys(function(prev) { return prev.indexOf(record.key) === -1 ? prev.concat(record.key) : prev; });
    else setCheckedRowKeys(function(prev) { return prev.filter(function(k) { return k !== record.key; }); });
  };

  var styles = {
    page: { padding: '16px 24px 48px', backgroundColor: '#f5f5f5', minHeight: '100vh', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', fontSize: 14 },
    breadcrumb: { marginBottom: 16, color: '#666' },
    breadcrumbSep: { margin: '0 8px', color: '#999' },
    card: { backgroundColor: '#fff', borderRadius: 8, marginBottom: 16, boxShadow: '0 1px 2px rgba(0,0,0,0.05)', overflow: 'hidden' },
    cardHeader: { padding: '16px 20px', borderBottom: '1px solid #f0f0f0' },
    cardTitle: { fontSize: 16, fontWeight: 600, color: '#333' },
    cardBody: { padding: '20px 24px' },
    formRow: { display: 'flex', flexWrap: 'wrap', marginBottom: 16 },
    formCol: { flex: '0 0 33.33%', minWidth: 200, paddingRight: 16, marginBottom: 8 },
    label: { display: 'block', marginBottom: 6, color: '#333' },
    labelRequired: { color: '#ff4d4f', marginRight: 4 },
    errMsg: { color: '#ff4d4f', fontSize: 12, marginTop: 4 },
    footer: { position: 'fixed', bottom: 0, left: 0, right: 0, padding: '12px 24px', backgroundColor: '#fff', borderTop: '1px solid #e8e8e8', display: 'flex', gap: 12, justifyContent: 'flex-start', zIndex: 99 },
    tableWrap: { marginTop: 16, overflowX: 'auto' },
    table: { width: '100%', borderCollapse: 'collapse', fontSize: 13 },
    th: { padding: '10px 8px', textAlign: 'left', borderBottom: '1px solid #e8e8e8', backgroundColor: '#fafafa', fontWeight: 600 },
    td: { padding: '8px', borderBottom: '1px solid #f0f0f0', verticalAlign: 'middle' },
    inputDisabled: { width: '100%', padding: '6px 10px', border: '1px solid #d9d9d9', borderRadius: 4, backgroundColor: '#f5f5f5', color: '#666', fontSize: 13 },
    modalMask: { position: 'fixed', left: 0, top: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.45)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' },
    modalBox: { backgroundColor: '#fff', borderRadius: 8, width: '90%', maxWidth: 640, maxHeight: '85vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 4px 20px rgba(0,0,0,0.15)' },
    modalHeader: { padding: '16px 20px', borderBottom: '1px solid #f0f0f0', fontSize: 16, fontWeight: 600 },
    modalBody: { padding: 20, overflow: 'auto', flex: 1 }
  };

  var reqSpecText = '编辑交车任务\n一个「数字化资产ONEOS运管平台」中的「交车任务」「编辑」模块\n1.面包屑：\n1.1.业务管理-交车任务-编辑\n\n2.表单：\n2.1.选择项目名称：必选项，反写新增时写入的数据，选择器，默认提示文本：请选择或输入项目名称，支持从输入框内输入内容进行模糊搜索，对应自营合同、租赁合同-「项目名称」字段；；\n2.2.合同编码：输入框（禁用状态），根据所选项目名称自动反写合同编码；\n2.3.客户名称：输入框（禁用状态），根据所选项目名称自动反写客户名称；\n2.4.交车区域：输入框（禁用状态），根据所选项目名称自动反写交车区域。提交时根据交车区域，为对应区域运维人员分配对应交车任务；\n2.5.交车地点：输入框（禁用状态），根据所选项目名称自动反写交车地点；\n2.6.预计交车日期：必填项，反写新增时写入的数据，日期选择器，支持某天或某个时间段两种模式，格式为YYYY-MM-DD或YYYY-MM-DD至YYYY-MM-DD，结束日期不能早于开始日期，并且结束日期不能早于当前日期；\n    2.6.1.如勾选不需要还车，则预计交车日期隐藏，不需要设置；\n2.7.开始计费日期：必填项，反写新增时写入的数据，日期选择器，支持单日选择，格式为YYYY-MM-DD；\n2.8.已交车辆是否需要还车：勾选框，反写新增时写入的数据，内容为不需要还车，默认不勾选，不勾选时，无法在车辆列表勾选已交未还的车辆，勾选后，已交未还的车辆也可以勾选，但不会生成新交车任务，只是按照开始计费日期生成账单；\n    2.8.1.勾选时，车辆列表只显示已交未还的车辆清单，不能添加新车（避免已交未还部分车辆开始计费日期计算不精确）；\n    2.8.2.不勾选时，车辆列表显示已交未还的车辆清单及续签合同新增车辆，但是已交未还部分的车辆不可勾选；\n2.9.下方为列表，列表拉取该车辆租赁合同对应所有车辆信息（该合同下已提交过交车任务的车辆不可选，已完成交车的车辆不显示在列表中），列表字段为：全选/多选、序号、品牌、型号、车牌号、车辆识别代码、车辆月租金、服务费、保证金、备注；\n    2.9.1.序号：与租赁合同车辆序号对应；\n    2.9.2.全选/多选：支持全选、多选模式，反写新增时写入的数据，选择对应车辆后，点击提交自动生成被选中车辆交车任务，需要至少选择1辆，才能进行提交，该合同下已提交过交车任务和已交车的车辆不可选，多选框为禁用状态，悬浮时提示：该车辆已完成交车/该车辆已创建交车任务；\n    2.9.3.品牌：输入框（禁用状态），根据所选项目名称自动反写品牌；\n    2.9.4.型号：输入框（禁用状态），根据所选项目名称自动反写型号；\n    2.9.5.车牌号：输入框（禁用状态），根据所选项目名称自动反写车牌号，车牌号可能为空，为空时显示为-；\n    2.9.6.车辆识别代码：输入框（禁用状态），根据所选项目名称自动反写车辆识别代码；\n    2.9.7.车辆月租金：输入框（禁用状态），根据所选项目名称自动反写车辆月租金，后缀为元；\n    2.9.8.服务费：输入框（禁用状态），根据所选项目名称自动反写服务费，后缀为元；\n    2.9.9.保证金：输入框（禁用状态），根据所选项目名称自动反写保证金，后缀为元；\n    2.9.10.备注：输入框（禁用状态），根据所选项目名称自动反写备注信息，备注为空时显示为-；\n2.10.页面底部为提交、取消；';

  var FormItem = function(props) {
    return React.createElement('div', { style: styles.formCol },
      React.createElement('label', { style: styles.label }, props.required ? React.createElement('span', { style: styles.labelRequired }, '*') : null, props.label),
      props.children,
      props.error ? React.createElement('div', { style: styles.errMsg }, props.error) : null
    );
  };

  var projectOptions = projectList.map(function(p) { return React.createElement(Option, { key: p.id, value: p.id }, p.name); });

  var formRow1 = React.createElement('div', { style: styles.formRow },
    React.createElement(FormItem, { label: '选择项目名称', required: true, error: errors.projectName },
      React.createElement(Select, {
        placeholder: '请选择或输入项目名称（对应自营合同、租赁合同-项目名称）',
        style: { width: '100%' },
        value: selectedProjectId || undefined,
        disabled: true,
        showSearch: true,
        filterOption: function(input, opt) { return opt.children && String(opt.children).toLowerCase().indexOf((input || '').toLowerCase()) >= 0; },
        status: errors.projectName ? 'error' : undefined
      }, projectOptions)),
    React.createElement(FormItem, { label: '合同编码' }, React.createElement(Input, { value: selectedProject ? selectedProject.contractCode : '', disabled: true, style: { width: '100%' } })),
    React.createElement(FormItem, { label: '客户名称' }, React.createElement(Input, { value: selectedProject ? selectedProject.customerName : '', disabled: true, style: { width: '100%' } })),
    React.createElement(FormItem, { label: '交车区域' }, React.createElement(Input, { value: selectedProject ? selectedProject.deliveryRegion : '', disabled: true, style: { width: '100%' } })),
    React.createElement(FormItem, { label: '交车地点' }, React.createElement(Input, { value: selectedProject ? selectedProject.deliveryLocation : '', disabled: true, style: { width: '100%' } }))
  );

  var formRow2 = React.createElement('div', { style: styles.formRow },
    needExpectedDelivery ? React.createElement(FormItem, { label: '预计交车日期', required: true, error: errors.expectedDelivery },
      React.createElement(RangePicker, {
          style: { width: '100%' },
          format: 'YYYY-MM-DD',
          placeholder: ['请选择开始日期', '请选择结束日期（单日请选同一天）'],
          value: expectedDeliveryValue,
          onChange: function(dates) { setExpectedDelivery(dates && dates.length === 2 ? dates : null); },
          status: errors.expectedDelivery ? 'error' : undefined
        })) : null,
    React.createElement(FormItem, { label: '开始计费日期', required: true, error: errors.billingDate },
      React.createElement(DatePicker, {
        style: { width: '100%' },
        format: 'YYYY-MM-DD',
        placeholder: '请选择日期',
        value: billingDateValue,
        onChange: function(d, dateStr) { setBillingDate(d); },
        status: errors.billingDate ? 'error' : undefined
      })),
    isRenewalProject ? React.createElement(FormItem, { label: '已交车辆是否需要还车' },
      React.createElement('div', { style: { display: 'flex', alignItems: 'flex-start', gap: 8, lineHeight: 1.6 } },
        React.createElement(Checkbox, { checked: !!noReturnCarChecked, onChange: onToggleNoReturnCar }, '不需要还车'),
        React.createElement('span', { style: { color: '#8c8c8c', fontSize: 12, marginTop: 2 } },
          '勾选不需要还车，则车辆无需交车，',
          React.createElement('br', null),
          '只设置开始计费日期即可重新生成账单'
        )
      )
    ) : null
  );

  var allSelectableChecked = selectableVehicles.length > 0 && selectableVehicles.every(function(v) { return checkedRowKeys.indexOf(v.key) !== -1; });
  var someSelectableChecked = selectableVehicles.some(function(v) { return checkedRowKeys.indexOf(v.key) !== -1; });
  var tableHeader = React.createElement('thead', null,
    React.createElement('tr', null,
      React.createElement('th', { style: Object.assign({}, styles.th, { width: 48 }) },
        React.createElement(Checkbox, {
          checked: allSelectableChecked,
          indeterminate: someSelectableChecked && !allSelectableChecked,
          onChange: function(e) { onSelectAll(e.target.checked); }
        })),
      React.createElement('th', { style: Object.assign({}, styles.th, { width: 56 }) }, '序号'),
      React.createElement('th', { style: styles.th }, '品牌'),
      React.createElement('th', { style: styles.th }, '型号'),
      React.createElement('th', { style: styles.th }, '车牌号'),
      React.createElement('th', { style: styles.th }, '车辆识别代码'),
      React.createElement('th', { style: styles.th }, '车辆月租金'),
      React.createElement('th', { style: styles.th }, '服务费'),
      React.createElement('th', { style: styles.th }, '保证金'),
      React.createElement('th', { style: styles.th }, '备注')
    )
  );

  var tableBody = React.createElement('tbody', null,
    vehicleList.length === 0
      ? React.createElement('tr', null, React.createElement('td', { colSpan: 10, style: Object.assign({}, styles.td, { textAlign: 'center', color: '#999' }) }, '请先选择项目名称，将自动带出该合同下车辆信息'))
      : vehicleList.map(function(row) {
          var isSubmitted = row.deliveryStatus === 'submitted';
          var isCompleted = row.deliveryStatus === 'completed';
          var completedSelectable = isRenewalProject && !!noReturnCarChecked;
          return React.createElement('tr', { key: row.key },
            React.createElement('td', { style: styles.td },
              isSubmitted
                ? React.createElement(Tooltip, { title: '该车辆已创建交车任务' },
                    React.createElement('span', { style: { display: 'inline-flex', alignItems: 'center', cursor: 'not-allowed' } },
                      React.createElement(Checkbox, { disabled: true, checked: false })))
                : isCompleted
                  ? React.createElement(Tooltip, { title: '该车辆已完成交车' },
                      React.createElement('span', { style: { display: 'inline-flex', alignItems: 'center' } },
                        React.createElement(Checkbox, {
                          disabled: !completedSelectable,
                          checked: completedSelectable ? (checkedRowKeys.indexOf(row.key) !== -1) : false,
                          onChange: function(e) { onSelectRow(row, e.target.checked); }
                        })
                      ))
                  : React.createElement(Checkbox, { checked: checkedRowKeys.indexOf(row.key) !== -1, onChange: function(e) { onSelectRow(row, e.target.checked); } })),
            React.createElement('td', { style: styles.td }, row.seq != null ? row.seq : '—'),
            React.createElement('td', { style: styles.td }, React.createElement(Input, { value: row.brand, disabled: true, style: styles.inputDisabled })),
            React.createElement('td', { style: styles.td }, React.createElement(Input, { value: row.model, disabled: true, style: styles.inputDisabled })),
            React.createElement('td', { style: styles.td }, React.createElement(Input, { value: row.plateNo || '-', disabled: true, style: styles.inputDisabled })),
            React.createElement('td', { style: styles.td }, React.createElement(Input, { value: row.vin, disabled: true, style: styles.inputDisabled })),
            React.createElement('td', { style: styles.td }, React.createElement(Input, { value: row.monthRent + '元', disabled: true, style: styles.inputDisabled })),
            React.createElement('td', { style: styles.td }, React.createElement(Input, { value: row.serviceFee + '元', disabled: true, style: styles.inputDisabled })),
            React.createElement('td', { style: styles.td }, React.createElement(Input, { value: row.deposit + '元', disabled: true, style: styles.inputDisabled })),
            React.createElement('td', { style: styles.td }, React.createElement(Input, { value: row.remark || '-', disabled: true, style: styles.inputDisabled }))
          );
        })
  );

  var tableEl = React.createElement('div', { style: styles.tableWrap },
    React.createElement('table', { style: styles.table }, tableHeader, tableBody)
  );

  if (errors.vehicles) {
    tableEl = React.createElement('div', null,
      React.createElement('div', { style: Object.assign({}, styles.errMsg, { marginBottom: 8 }) }, errors.vehicles),
      tableEl
    );
  }

  return React.createElement('div', { style: styles.page },
    React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 } },
      React.createElement('div', { style: styles.breadcrumb },
        React.createElement('span', null, '业务管理'),
        React.createElement('span', { style: styles.breadcrumbSep }, ' / '),
        React.createElement('span', null, '交车任务'),
        React.createElement('span', { style: styles.breadcrumbSep }, ' / '),
        React.createElement('span', { style: { color: '#1890ff' } }, '编辑交车任务')),
      React.createElement(Button, { type: 'link', style: { padding: 0 }, onClick: function() { reqModalOpen[1](true); } }, '查看需求说明')),
    React.createElement('div', { style: styles.card },
      React.createElement('div', { style: styles.cardHeader }, React.createElement('span', { style: styles.cardTitle }, '交车任务')),
      React.createElement('div', { style: styles.cardBody },
        formRow1,
        formRow2,
        tableEl)),
    React.createElement('div', { style: { height: 60 } }),
    React.createElement(Modal, {
      title: '需求说明',
      open: reqModalOpen[0],
      onCancel: function() { reqModalOpen[1](false); },
      width: 720,
      footer: React.createElement(Button, { onClick: function() { reqModalOpen[1](false); } }, '关闭'),
      bodyStyle: { maxHeight: '70vh', overflow: 'auto' }
    }, React.createElement('div', { style: { padding: '8px 0' } },
      React.createElement('div', { style: { whiteSpace: 'pre-wrap', fontSize: 13, lineHeight: 1.6 } }, reqSpecText))),
    React.createElement('div', { style: styles.footer },
      React.createElement(Button, { type: 'primary', onClick: handleSubmit }, '提交'),
      React.createElement(Button, { onClick: handleCancel }, '取消'))
  );
};
