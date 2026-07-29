// 【重要】必须使用 const Component 作为组件变量名 - Axhub 产品原型
// 数字化资产ONEOS运管平台 - 查看交车任务模块（只读表单 + 车辆列表还车操作）

const Component = function () {
  var useState = React.useState;
  var useCallback = React.useCallback;

  var antd = window.antd;
  var Input = antd.Input;
  var Button = antd.Button;
  var Modal = antd.Modal;
  var Drawer = antd.Drawer;
  var DatePicker = antd.DatePicker;
  var RangePicker = DatePicker.RangePicker;
  var Cascader = antd.Cascader;
  var Space = antd.Space;
  var Checkbox = antd.Checkbox;
  var message = antd.message;

  var reqModalOpen = useState(false);
  /** 交车单是否已点击「车辆到达」（到达后不可撤销还车） */
  var vehicleArrivedPair = useState(false);
  var vehicleArrived = vehicleArrivedPair[0];
  var setVehicleArrived = vehicleArrivedPair[1];

  var returnRegionOptions = [
    { value: '浙江省', label: '浙江省', children: [{ value: '杭州市', label: '杭州市' }, { value: '嘉兴市', label: '嘉兴市' }, { value: '宁波市', label: '宁波市' }] },
    { value: '上海市', label: '上海市', children: [{ value: '上海市', label: '上海市' }] },
    { value: '江苏省', label: '江苏省', children: [{ value: '南京市', label: '南京市' }, { value: '苏州市', label: '苏州市' }] },
    { value: '广东省', label: '广东省', children: [{ value: '广州市', label: '广州市' }, { value: '深圳市', label: '深圳市' }] },
    { value: '北京市', label: '北京市', children: [{ value: '北京市', label: '北京市' }] }
  ];

  var initialVehicles = [
    { seq: 1, brand: '东风', model: '氢燃料电池重卡 H31', plateNo: '浙A10001', vin: 'LFV2BJCH8K3123456', monthRent: '12800', serviceFee: '800', deposit: '30000', remark: '首车', deliverySuccess: true, returnTaskCreated: false, returnTimeStart: null, returnTimeEnd: null, returnProvince: null, returnCity: null },
    { seq: 2, brand: '福田', model: '智蓝氢能轻卡', plateNo: '', vin: 'LZYTBACR2M1234567', monthRent: '8500', serviceFee: '500', deposit: '20000', remark: '待上牌', deliverySuccess: false, returnTaskCreated: false, returnTimeStart: null, returnTimeEnd: null, returnProvince: null, returnCity: null },
    { seq: 3, brand: '重汽', model: '豪沃氢能牵引车', plateNo: '浙F20001', vin: 'ZZ4257N386FZ12345', monthRent: '15000', serviceFee: '1000', deposit: '35000', remark: '', deliverySuccess: true, returnTaskCreated: true, returnTimeStart: '2026-04-10', returnTimeEnd: '2026-04-12', returnProvince: '浙江省', returnCity: '嘉兴市' }
  ];

  var vehiclesPair = useState(initialVehicles);
  var vehicles = vehiclesPair[0];
  var setVehicles = vehiclesPair[1];

  var drawerOpenPair = useState(false);
  var drawerOpen = drawerOpenPair[0];
  var setDrawerOpen = drawerOpenPair[1];
  var drawerRowIndexPair = useState(-1);
  var drawerRowIndex = drawerRowIndexPair[0];
  var setDrawerRowIndex = drawerRowIndexPair[1];
  var drawerRangePair = useState(null);
  var drawerRange = drawerRangePair[0];
  var setDrawerRange = drawerRangePair[1];
  var drawerRegionPair = useState([]);
  var drawerRegion = drawerRegionPair[0];
  var setDrawerRegion = drawerRegionPair[1];

  var task = {
    projectName: '嘉兴某某物流氢能运输项目',
    contractCode: 'JXZL20260216YW101235A',
    customerName: '嘉兴某某物流有限公司',
    deliveryRegion: '浙江省 / 嘉兴市',
    deliveryLocation: '浙江省嘉兴市南湖区科技大道1号',
    planDeliveryDisplay: '2026-03-01至2026-03-05',
    billingStartDate: '2026-03-06'
  };

  function toYmd(d) {
    if (d == null) return '';
    if (typeof d === 'string') return d.slice(0, 10);
    if (typeof d.format === 'function') return d.format('YYYY-MM-DD');
    return '';
  }

  function formatReturnTimeDisplay(row) {
    if (!row.returnTaskCreated || !row.returnTimeStart) return '-';
    var s = row.returnTimeStart;
    var e = row.returnTimeEnd || row.returnTimeStart;
    if (s === e) return s;
    return s + '至' + e;
  }

  function formatReturnAreaDisplay(row) {
    if (!row.returnProvince || !row.returnCity) return '-';
    return row.returnProvince + '-' + row.returnCity;
  }

  function returnStatusText(row) {
    return row.returnTaskCreated ? '已还车' : '未还车';
  }

  var openReturnDrawer = useCallback(function (index) {
    setDrawerRowIndex(index);
    setDrawerRange(null);
    setDrawerRegion([]);
    setDrawerOpen(true);
  }, [setDrawerOpen, setDrawerRowIndex, setDrawerRange, setDrawerRegion]);

  var closeReturnDrawer = useCallback(function () {
    setDrawerOpen(false);
    setDrawerRowIndex(-1);
    setDrawerRange(null);
    setDrawerRegion([]);
  }, [setDrawerOpen, setDrawerRowIndex, setDrawerRange, setDrawerRegion]);

  var submitReturnDrawer = useCallback(function () {
    if (drawerRowIndex < 0) return;
    var dates = drawerRange;
    if (!dates || !dates[0] || !dates[1]) {
      message.warning('请选择还车时间');
      return;
    }
    if (!drawerRegion || drawerRegion.length < 2) {
      message.warning('请选择还车区域（省-市）');
      return;
    }
    var startStr = toYmd(dates[0]);
    var endStr = toYmd(dates[1]);
    var prov = drawerRegion[0];
    var city = drawerRegion[1];
    setVehicles(function (prev) {
      var next = prev.slice();
      var r = Object.assign({}, next[drawerRowIndex]);
      r.returnTaskCreated = true;
      r.returnTimeStart = startStr;
      r.returnTimeEnd = endStr;
      r.returnProvince = prov;
      r.returnCity = city;
      next[drawerRowIndex] = r;
      return next;
    });
    message.success('还车任务已创建');
    closeReturnDrawer();
  }, [drawerRowIndex, drawerRange, drawerRegion, setVehicles, closeReturnDrawer]);

  var revokeReturn = useCallback(function (index) {
    if (vehicleArrived) {
      message.warning('交车单已确认车辆到达，无法撤销还车');
      return;
    }
    Modal.confirm({
      title: '确认撤销还车？',
      content: '撤销后将清除已填写的还车时间与还车区域，需重新发起还车。',
      okText: '确定',
      cancelText: '取消',
      onOk: function () {
        setVehicles(function (prev) {
          var next = prev.slice();
          var r = Object.assign({}, next[index]);
          r.returnTaskCreated = false;
          r.returnTimeStart = null;
          r.returnTimeEnd = null;
          r.returnProvince = null;
          r.returnCity = null;
          next[index] = r;
          return next;
        });
        message.success('已撤销还车');
      }
    });
  }, [vehicleArrived, setVehicles]);

  var styles = {
    page: { padding: '16px 24px 48px', backgroundColor: '#f5f5f5', minHeight: '100vh', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', fontSize: 14 },
    breadcrumb: { marginBottom: 16, color: '#666' },
    breadcrumbSep: { margin: '0 8px', color: '#999' },
    card: { backgroundColor: '#fff', borderRadius: 8, marginBottom: 16, boxShadow: '0 1px 2px rgba(0,0,0,0.05)', overflow: 'visible' },
    cardHeader: { padding: '16px 20px', borderBottom: '1px solid #f0f0f0' },
    cardTitle: { fontSize: 16, fontWeight: 600, color: '#333' },
    cardBody: { padding: '20px 24px' },
    formRow: { display: 'flex', flexWrap: 'wrap', marginBottom: 16 },
    formCol: { flex: '0 0 33.33%', minWidth: 200, paddingRight: 16, marginBottom: 8 },
    label: { display: 'block', marginBottom: 6, color: '#333' },
    inputDisabled: { width: '100%', padding: '6px 10px', border: '1px solid #d9d9d9', borderRadius: 4, backgroundColor: '#f5f5f5', color: '#666', fontSize: 13 },
    footer: { position: 'fixed', bottom: 0, left: 0, right: 0, padding: '12px 24px', backgroundColor: '#fff', borderTop: '1px solid #e8e8e8', display: 'flex', gap: 12, justifyContent: 'flex-start', alignItems: 'center', zIndex: 99 },
    tableWrap: { marginTop: 16, width: '100%', maxWidth: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch' },
    /** 随列内容撑开总宽，窄屏由外层横向滚动 */
    table: { width: 'max-content', maxWidth: 'none', borderCollapse: 'collapse', fontSize: 13, tableLayout: 'auto' },
    th: { padding: '10px 8px', textAlign: 'left', borderBottom: '1px solid #e8e8e8', backgroundColor: '#fafafa', fontWeight: 600, whiteSpace: 'nowrap' },
    td: { padding: '8px', borderBottom: '1px solid #f0f0f0', verticalAlign: 'middle' },
    /** 表体单元格内输入框：按内容宽度，避免被 100% 拉满整表 */
    inputInTable: { boxSizing: 'border-box', minWidth: 72, maxWidth: 280, width: 'auto', padding: '6px 10px', border: '1px solid #d9d9d9', borderRadius: 4, backgroundColor: '#f5f5f5', color: '#666', fontSize: 13 },
    thStickyRight: {
      position: 'sticky',
      right: 0,
      zIndex: 4,
      backgroundColor: '#fafafa',
      boxShadow: '-6px 0 8px -4px rgba(0,0,0,0.12)',
      borderLeft: '1px solid #e8e8e8'
    },
    tdStickyRight: {
      position: 'sticky',
      right: 0,
      zIndex: 3,
      backgroundColor: '#fff',
      boxShadow: '-6px 0 8px -4px rgba(0,0,0,0.1)',
      borderLeft: '1px solid #f0f0f0'
    },
    drawerFieldLabel: { marginBottom: 6, fontSize: 14, color: 'rgba(0,0,0,0.65)' },
    protoHint: { fontSize: 12, color: '#999', marginTop: 8 }
  };

  var FormItemReadOnly = function (props) {
    return React.createElement('div', { style: styles.formCol },
      React.createElement('label', { style: styles.label }, props.label),
      React.createElement(Input, { value: props.value != null ? props.value : '', disabled: true, style: styles.inputDisabled })
    );
  };

  var formRow1 = React.createElement('div', { style: styles.formRow },
    React.createElement(FormItemReadOnly, { label: '选择项目名称', value: task.projectName }),
    React.createElement(FormItemReadOnly, { label: '合同编码', value: task.contractCode }),
    React.createElement(FormItemReadOnly, { label: '客户名称', value: task.customerName }),
    React.createElement(FormItemReadOnly, { label: '交车区域', value: task.deliveryRegion }),
    React.createElement(FormItemReadOnly, { label: '交车地点', value: task.deliveryLocation })
  );

  var formRow2 = React.createElement('div', { style: styles.formRow },
    React.createElement(FormItemReadOnly, { label: '预计交车日期', value: task.planDeliveryDisplay }),
    React.createElement(FormItemReadOnly, { label: '开始计费日期', value: task.billingStartDate })
  );

  var tableHeader = React.createElement('thead', null,
    React.createElement('tr', null,
      React.createElement('th', { style: Object.assign({}, styles.th, { width: 56 }) }, '序号'),
      React.createElement('th', { style: styles.th }, '品牌'),
      React.createElement('th', { style: styles.th }, '型号'),
      React.createElement('th', { style: styles.th }, '车牌号'),
      React.createElement('th', { style: styles.th }, '车辆识别代码'),
      React.createElement('th', { style: styles.th }, '车辆月租金'),
      React.createElement('th', { style: styles.th }, '服务费'),
      React.createElement('th', { style: styles.th }, '保证金'),
      React.createElement('th', { style: styles.th }, '备注'),
      React.createElement('th', { style: styles.th }, '还车时间'),
      React.createElement('th', { style: styles.th }, '还车区域'),
      React.createElement('th', { style: styles.th }, '还车状态'),
      React.createElement('th', { style: Object.assign({}, styles.th, styles.thStickyRight, { width: 140, minWidth: 140 }) }, '操作')
    )
  );

  var renderOperationCell = function (row, i) {
    if (!row.deliverySuccess) {
      return React.createElement('span', { style: { color: '#999' } }, '—');
    }
    if (!row.returnTaskCreated) {
      return React.createElement(Button, { type: 'link', size: 'small', style: { padding: 0 }, onClick: function () { openReturnDrawer(i); } }, '还车');
    }
    return React.createElement(Button, {
      type: 'link',
      size: 'small',
      style: { padding: 0 },
      disabled: vehicleArrived,
      onClick: function () { revokeReturn(i); }
    }, '撤销还车');
  };

  var tableBody = React.createElement('tbody', null,
    vehicles.length === 0
      ? React.createElement('tr', null, React.createElement('td', { colSpan: 13, style: Object.assign({}, styles.td, { textAlign: 'center', color: '#999' }) }, '暂无车辆'))
      : vehicles.map(function (row, i) {
        return React.createElement('tr', { key: row.vin || i },
          React.createElement('td', { style: styles.td }, row.seq != null ? row.seq : '—'),
          React.createElement('td', { style: styles.td }, React.createElement(Input, { value: row.brand, disabled: true, style: styles.inputInTable })),
          React.createElement('td', { style: styles.td }, React.createElement(Input, { value: row.model, disabled: true, style: styles.inputInTable })),
          React.createElement('td', { style: styles.td }, React.createElement(Input, { value: row.plateNo || '-', disabled: true, style: styles.inputInTable })),
          React.createElement('td', { style: styles.td }, React.createElement(Input, { value: row.vin, disabled: true, style: styles.inputInTable })),
          React.createElement('td', { style: styles.td }, React.createElement(Input, { value: row.monthRent + '元', disabled: true, style: styles.inputInTable })),
          React.createElement('td', { style: styles.td }, React.createElement(Input, { value: row.serviceFee + '元', disabled: true, style: styles.inputInTable })),
          React.createElement('td', { style: styles.td }, React.createElement(Input, { value: row.deposit + '元', disabled: true, style: styles.inputInTable })),
          React.createElement('td', { style: styles.td }, React.createElement(Input, { value: row.remark || '-', disabled: true, style: styles.inputInTable })),
          React.createElement('td', { style: styles.td }, React.createElement(Input, { value: formatReturnTimeDisplay(row), disabled: true, style: styles.inputInTable })),
          React.createElement('td', { style: styles.td }, React.createElement(Input, { value: formatReturnAreaDisplay(row), disabled: true, style: styles.inputInTable })),
          React.createElement('td', { style: styles.td }, React.createElement(Input, { value: returnStatusText(row), disabled: true, style: styles.inputInTable })),
          React.createElement('td', { style: Object.assign({}, styles.td, styles.tdStickyRight, { minWidth: 140 }) }, renderOperationCell(row, i))
        );
      })
  );

  var tableEl = React.createElement('div', { style: styles.tableWrap },
    React.createElement('table', { style: styles.table }, tableHeader, tableBody)
  );

  var handleBack = function () {
    if (window.history && window.history.back) window.history.back();
    else message.info('返回');
  };

  var drawerTitle = '还车';
  if (drawerRowIndex >= 0 && vehicles[drawerRowIndex]) {
    var dr = vehicles[drawerRowIndex];
    drawerTitle = '还车（序号 ' + dr.seq + (dr.plateNo ? ' · ' + dr.plateNo : '') + '）';
  }

  var returnDrawer = React.createElement(Drawer, {
    title: drawerTitle,
    placement: 'right',
    width: 420,
    open: drawerOpen,
    onClose: closeReturnDrawer,
    destroyOnClose: true,
    footer: React.createElement('div', { style: { textAlign: 'right' } },
      React.createElement(Space, null,
        React.createElement(Button, { onClick: closeReturnDrawer }, '取消'),
        React.createElement(Button, { type: 'primary', onClick: submitReturnDrawer }, '提交')
      )
    )
  },
    React.createElement('div', { style: { paddingBottom: 8 } },
      React.createElement('div', { style: styles.drawerFieldLabel }, '还车时间'),
      React.createElement(RangePicker, {
        style: { width: '100%' },
        format: 'YYYY-MM-DD',
        placeholder: ['开始日期', '结束日期（单日请选同一天）'],
        value: drawerRange,
        onChange: function (dates) { setDrawerRange(dates && dates.length === 2 ? dates : null); }
      }),
      React.createElement('div', { style: { marginTop: 4, fontSize: 12, color: '#999' } }, '单日还车请将开始、结束选为同一天；跨天则为开始至结束时间段。')
    ),
    React.createElement('div', { style: { marginTop: 20 } },
      React.createElement('div', { style: styles.drawerFieldLabel }, '还车区域'),
      React.createElement(Cascader, {
        style: { width: '100%' },
        options: returnRegionOptions,
        value: drawerRegion && drawerRegion.length ? drawerRegion : undefined,
        onChange: function (v) { setDrawerRegion(v || []); },
        placeholder: '请选择省 / 市',
        showSearch: true
      })
    )
  );

  var reqSpecText =
    '查看交车任务\n' +
    '一个「数字化资产ONEOS运管平台」中的「交车任务」「查看」模块。\n\n' +
    '1.面包屑：业务管理-交车任务-查看交车任务\n\n' +
    '2.表单（只读）：项目名称、合同编码、客户名称、交车区域、交车地点、预计交车日期、开始计费日期等，根据交车任务数据反显。\n\n' +
    '3.车辆列表：\n' +
    '3.1.序号、品牌、型号、车牌号、车辆识别代码、车辆月租金、服务费、保证金、备注（只读）；\n' +
    '3.2.还车时间：展示操作「还车」提交时填写的还车时间；单日为 YYYY-MM-DD，时间段为 YYYY-MM-DD至YYYY-MM-DD；未提交还车前显示为「-」；\n' +
    '3.3.还车区域：展示提交还车时选择的省-市（格式：省-市）；未提交前显示为「-」；\n' +
    '3.4.还车状态：已还车（已创建还车任务）/ 未还车；\n' +
    '3.5.操作列：\n' +
    '　· 仅「交车成功」的车辆显示操作；未交车成功的行操作列为「—」；\n' +
    '　· 未创建还车任务时显示「还车」：点击后右侧抽屉打开，含「还车时间」（日期区间选择器，单输入框双日历，单日将起止选同一天）、「还车区域」（省-市二级级联），底部「提交」「取消」；提交校验通过后创建还车任务并关闭抽屉；\n' +
    '　· 已创建还车任务后隐藏「还车」，显示「撤销还车」；点击「撤销还车」须二次确认（确认弹窗说明将清除还车时间与区域）；确认后撤销还车任务；交车单已点击「车辆到达」后「撤销还车」按钮置灰不可点；\n' +
    '3.6.表格布局：表格总宽度随列内容撑开；容器内超出宽度时支持横向滚动；「操作」列固定在可视区域右侧（横向滚动时保持可见）。\n\n' +
    '4.原型演示：列表下方提供「模拟交车单已点击车辆到达」勾选，用于联调前验证「撤销还车」置灰逻辑；正式对接后由交车单状态接口驱动，可移除该勾选。\n\n' +
    '5.页面底部为「返回」按钮。';

  return React.createElement('div', { style: styles.page },
    React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 } },
      React.createElement('div', { style: styles.breadcrumb },
        React.createElement('span', null, '业务管理'),
        React.createElement('span', { style: styles.breadcrumbSep }, ' / '),
        React.createElement('span', null, '交车任务'),
        React.createElement('span', { style: styles.breadcrumbSep }, ' / '),
        React.createElement('span', { style: { color: '#1890ff' } }, '查看交车任务')),
      React.createElement(Button, { type: 'link', style: { padding: 0 }, onClick: function () { reqModalOpen[1](true); } }, '查看需求说明')),
    React.createElement('div', { style: styles.card },
      React.createElement('div', { style: styles.cardHeader }, React.createElement('span', { style: styles.cardTitle }, '交车任务')),
      React.createElement('div', { style: styles.cardBody },
        formRow1,
        formRow2,
        tableEl,
        React.createElement('div', { style: styles.protoHint },
          React.createElement(Checkbox, { checked: vehicleArrived, onChange: function (e) { setVehicleArrived(e.target.checked); } }),
          ' 原型演示：模拟交车单已点击「车辆到达」（勾选后「撤销还车」置灰，对接接口后由交车单状态驱动）'))),
    React.createElement('div', { style: { height: 60 } }),
    React.createElement('div', { style: styles.footer },
      React.createElement(Button, { onClick: handleBack }, '返回')),
    returnDrawer,
    React.createElement(Modal, {
      title: '需求说明',
      open: reqModalOpen[0],
      onCancel: function () { reqModalOpen[1](false); },
      width: 560,
      footer: React.createElement(Button, { onClick: function () { reqModalOpen[1](false); } }, '关闭'),
      bodyStyle: { maxHeight: '70vh', overflow: 'auto' }
    }, React.createElement('div', { style: { padding: '8px 0', whiteSpace: 'pre-wrap', fontSize: 13, lineHeight: 1.6 } }, reqSpecText))
  );
};
