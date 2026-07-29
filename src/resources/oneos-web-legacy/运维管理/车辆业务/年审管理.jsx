// 【重要】必须使用 const Component 作为组件变量名
// 运维管理 - 车辆业务 - 年审管理（Web 列表页，逻辑对齐 ONE-OS 小程序年审管理）

const { useState, useMemo, useEffect } = React;
const moment = window.moment || window.dayjs;
const antd = window.antd;
const {
  Alert,
  App,
  Badge,
  Button,
  Card,
  Cascader,
  Col,
  DatePicker,
  Form,
  Input,
  Modal,
  Row,
  Select,
  Space,
  Table,
  Tabs,
  Tag,
  Tooltip,
  Typography,
  message,
} = antd;

const { Text, Paragraph } = Typography;
const { RangePicker } = DatePicker;

const PROVINCE_CITY_MAP = {
  广东省: ['广州市', '深圳市', '东莞市'],
  江苏省: ['南京市', '苏州市', '无锡市'],
  浙江省: ['杭州市', '宁波市', '温州市'],
  上海市: ['上海市'],
  安徽省: ['合肥市', '芜湖市'],
  山东省: ['临沂市'],
  福建省: ['厦门市'],
};

const HANDLER_OPTIONS = [
  { label: '全部', value: '' },
  { label: '张明辉', value: '张明辉' },
  { label: '李晓彤', value: '李晓彤' },
  { label: '王建国', value: '王建国' },
];

const MOCK_CURRENT_HANDLER = '张明辉';
/** 列表 KPI、执行率统计锚定日（与原型演示一致） */
const AR_ANCHOR_DATE = '2026-06-01';
const AR_TASK_ID_STORAGE_KEY = 'oneos_ar_operate_task_id';
const AR_TASKS_STORAGE_KEY = 'oneos_ar_web_tasks_v1';
const AR_DRAFT_STORAGE_KEY = 'oneos_ar_operate_drafts_v1';
const AR_NAV_TARGET_KEY = 'oneos_ar_navigate_target';
const AR_NAV_EVENT = 'oneos-ar-return-list';

const loadTasksFromStorage = () => {
  try {
    const raw = localStorage.getItem(AR_TASKS_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length ? parsed : null;
  } catch {
    return null;
  }
};

const persistTasksToStorage = (tasks) => {
  try {
    localStorage.setItem(AR_TASKS_STORAGE_KEY, JSON.stringify(tasks));
  } catch {
    /* ignore */
  }
};

const loadOperateDrafts = () => {
  try {
    const raw = localStorage.getItem(AR_DRAFT_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
};

const persistOperateDrafts = (drafts) => {
  try {
    localStorage.setItem(AR_DRAFT_STORAGE_KEY, JSON.stringify(drafts));
  } catch {
    /* ignore */
  }
};

/** 列表「已保存」标签示例：对应待办 ar-1、ar-2（办理页可续填） */
const MOCK_SAMPLE_DRAFTS = {
  'ar-1': {
    savedAt: '2026-06-01T10:30:00.000Z',
    inspectionForm: {
      station: '汇通检测站',
      cost: '280',
      remark: '检测已完成，待提交年审结果',
    },
    licenseForm: {
      photos: [
        {
          uid: 'sample-ar-1-license-1',
          name: '行驶证正面.jpg',
          url: 'https://picsum.photos/seed/ar-license-ar1/240/180',
          status: 'done',
        },
        {
          uid: 'sample-ar-1-license-2',
          name: '行驶证副页.jpg',
          url: 'https://picsum.photos/seed/ar-license-ar1b/240/180',
          status: 'done',
        },
      ],
      inspectionValidUntil: '2026-07-31',
      ocrStatus: 'done',
    },
    m2Expanded: false,
    m2Form: { station: '', cost: '', remark: '', photos: [] },
    zbExpanded: false,
    zbForm: { station: '', cost: '', remark: '', photos: [] },
  },
  'ar-2': {
    savedAt: '2026-06-01T14:15:00.000Z',
    inspectionForm: {
      station: '平湖检测站',
      cost: '320',
      remark: '',
    },
    licenseForm: {
      photos: [],
      inspectionValidUntil: null,
      ocrStatus: 'idle',
    },
    m2Expanded: true,
    m2Form: {
      station: '汇通检测站',
      cost: '180',
      remark: '二保已做，整备待补',
      photos: [],
    },
    zbExpanded: false,
    zbForm: { station: '', cost: '', remark: '', photos: [] },
  },
};

/** 合并示例草稿与本地已保存数据（本地同 taskId 优先）；无本地数据时写入示例供办理页反写 */
const loadOperateDraftsForDisplay = () => {
  const stored = loadOperateDrafts();
  const merged = { ...MOCK_SAMPLE_DRAFTS, ...stored };
  try {
    if (!localStorage.getItem(AR_DRAFT_STORAGE_KEY)) {
      persistOperateDrafts(MOCK_SAMPLE_DRAFTS);
    }
  } catch {
    /* ignore */
  }
    return merged;
};

const DEFAULT_FILTER = {
  provinceCity: null,
  expireRange: null,
  handler: '',
  executeTimeRange: null,
};

const mapOperateStatus = (raw) => {
  if (raw === '可运营' || raw === '待运营') return '库存';
  return raw || '—';
};

/** 执行率 KPI 演示：6/7/8 月检验有效期任务（与 AR_ANCHOR_DATE 对齐） */
const EXECUTION_RATE_DEMO_PLANS = [
  { month: '2026-06', done: 34, pending: 24 },
  { month: '2026-07', done: 42, pending: 16 },
  { month: '2026-08', done: 18, pending: 11 },
];

const EXECUTION_RATE_DEMO_HANDLERS = ['张明辉', '张明辉', '李晓彤', '王建国'];

const buildExecutionRateDemoTasks = () => {
  const rows = [];
  EXECUTION_RATE_DEMO_PLANS.forEach((plan, monthIdx) => {
    let seq = 0;
    const monthTag = plan.month.replace('-', '');
    const baseDay = monthIdx * 3 + 1;
    for (let i = 0; i < plan.done; i += 1) {
      seq += 1;
      const handler = EXECUTION_RATE_DEMO_HANDLERS[i % EXECUTION_RATE_DEMO_HANDLERS.length];
      const day = String(((i + baseDay) % 27) + 1).padStart(2, '0');
      const expireDate = `${plan.month}-${day}`;
      rows.push({
        id: `ar-rate-${plan.month}-done-${i}`,
        plateNo: `粤Y${monthTag}${String(seq).padStart(3, '0')}`,
        vin: `LRATED${plan.month}D${String(i).padStart(4, '0')}`,
        brand: '解放',
        model: '执行率演示车',
        operateStatusRaw: '自营',
        operateStatus: '自营',
        expireDate,
        daysLeft: 0,
        tab: 'history',
        province: '广东省',
        city: '深圳市',
        executor: handler,
        assignee: handler,
        executeTime: `${plan.month}-${day} ${String(9 + (i % 8)).padStart(2, '0')}:30`,
      });
    }
    for (let i = 0; i < plan.pending; i += 1) {
      seq += 1;
      const handler = EXECUTION_RATE_DEMO_HANDLERS[(i + monthIdx) % EXECUTION_RATE_DEMO_HANDLERS.length];
      const day = String(((i + baseDay + 7) % 27) + 1).padStart(2, '0');
      const expireDate = `${plan.month}-${day}`;
      const daysLeft = monthIdx === 0 ? 12 + (i % 10) : monthIdx === 1 ? 35 + (i % 15) : 55 + (i % 12);
      rows.push({
        id: `ar-rate-${plan.month}-pending-${i}`,
        plateNo: `粤Y${monthTag}${String(seq).padStart(3, '0')}`,
        vin: `LRATEP${plan.month}P${String(i).padStart(4, '0')}`,
        brand: '福田',
        model: '执行率演示车',
        operateStatusRaw: '租赁',
        operateStatus: '租赁',
        expireDate,
        daysLeft,
        tab: 'pending',
        province: '广东省',
        city: '深圳市',
        executor: '',
        assignee: handler,
        executeTime: '',
      });
    }
  });
  return rows;
};

const EXECUTION_RATE_DEMO_TASKS = buildExecutionRateDemoTasks();

const mergeExecutionRateDemoTasks = (tasks) => {
  const list = Array.isArray(tasks) ? [...tasks] : [];
  const idSet = new Set(list.map((t) => t.id));
  EXECUTION_RATE_DEMO_TASKS.forEach((t) => {
    if (!idSet.has(t.id)) {
      list.push(t);
      idSet.add(t.id);
    }
  });
  return list;
};

const MOCK_TASKS = [
  {
    id: 'ar-1',
    plateNo: '粤B58888F',
    vin: 'LGHXCAE28M6789012',
    brand: '福田',
    model: '奥铃4.5吨冷藏车',
    operateStatusRaw: '租赁',
    expireDate: '2026-07-20',
    daysLeft: 49,
    tab: 'pending',
    province: '广东省',
    city: '深圳市',
    executor: '',
    executeTime: '',
  },
  {
    id: 'ar-2',
    plateNo: '沪A03561F',
    vin: 'LMRKH9AC0R1004086',
    brand: '宇通',
    model: '49吨牵引车头',
    operateStatusRaw: '自营',
    expireDate: '2026-07-31',
    daysLeft: 60,
    tab: 'pending',
    province: '上海市',
    city: '上海市',
    executor: '',
    executeTime: '',
  },
  {
    id: 'ar-3',
    plateNo: '苏E33333',
    vin: 'LSXCH9AE8M1094857',
    brand: '陕汽',
    model: '德龙X3000混动牵引车',
    operateStatusRaw: '可运营',
    expireDate: '2026-05-15',
    daysLeft: -17,
    tab: 'pending',
    province: '江苏省',
    city: '苏州市',
    executor: '',
    executeTime: '',
  },
  {
    id: 'ar-7',
    plateNo: '鲁Q88901',
    vin: 'LZZ5CLSB8NC778899',
    brand: '重汽',
    model: '豪沃T7H牵引车',
    operateStatusRaw: '租赁',
    expireDate: '2026-04-10',
    daysLeft: -52,
    tab: 'pending',
    province: '山东省',
    city: '临沂市',
    executor: '',
    executeTime: '',
  },
  {
    id: 'ar-8',
    plateNo: '闽D55662',
    vin: 'LFWNHXSD8P1122334',
    brand: '金龙',
    model: '凯歌纯电动厢货',
    operateStatusRaw: '自营',
    expireDate: '2026-04-27',
    daysLeft: -35,
    tab: 'pending',
    province: '福建省',
    city: '厦门市',
    executor: '',
    executeTime: '',
  },
  {
    id: 'ar-4',
    plateNo: '浙A88888',
    vin: 'LMRKH9AE2P9876543',
    brand: '宇通',
    model: '氢燃料电池大巴',
    operateStatusRaw: '待运营',
    expireDate: '2026-08-10',
    daysLeft: 70,
    tab: 'pending',
    province: '浙江省',
    city: '杭州市',
    executor: '',
    executeTime: '',
  },
  {
    id: 'ar-6',
    plateNo: '皖B66221',
    vin: 'LZZ5CLSB8NA123456',
    brand: '江淮',
    model: '格尔发A5',
    operateStatusRaw: '库存',
    expireDate: '2026-06-28',
    daysLeft: 27,
    tab: 'pending',
    province: '安徽省',
    city: '合肥市',
    executor: '',
    executeTime: '',
  },
  {
    id: 'ar-h-jun',
    plateNo: '苏B88112',
    vin: 'LZZ5CLSB8NC556677',
    brand: '解放',
    model: 'J7牵引车',
    operateStatusRaw: '自营',
    expireDate: '2026-06-05',
    daysLeft: 0,
    tab: 'history',
    province: '江苏省',
    city: '无锡市',
    executor: '张明辉',
    executeTime: '2026-06-03 11:20',
    assignee: '张明辉',
  },
  {
    id: 'ar-h1',
    plateNo: '苏A88991',
    vin: 'LSVAM4187C2123456',
    brand: '解放',
    model: 'J6P牵引车',
    operateStatusRaw: '自营',
    expireDate: '2026-03-10',
    daysLeft: 0,
    tab: 'history',
    province: '江苏省',
    city: '南京市',
    executor: '张明辉',
    executeTime: '2026-03-08 14:20',
  },
  {
    id: 'ar-h2',
    plateNo: '粤A11223',
    vin: 'LFWNHXSD8P7654321',
    brand: '比亚迪',
    model: 'T5纯电轻卡',
    operateStatusRaw: '待运营',
    expireDate: '2026-02-20',
    daysLeft: 0,
    tab: 'history',
    province: '广东省',
    city: '广州市',
    executor: '李晓彤',
    executeTime: '2026-02-18 09:45',
  },
  {
    id: 'ar-h3',
    plateNo: '京A55667',
    vin: 'LZZ5CLSB8NB654321',
    brand: '东风',
    model: '天龙KL',
    operateStatusRaw: '租赁',
    expireDate: '2026-01-15',
    daysLeft: 0,
    tab: 'history',
    province: '广东省',
    city: '东莞市',
    executor: '王建国',
    executeTime: '2026-01-12 16:30',
  },
].map((t, idx) => ({
  ...t,
  operateStatus: mapOperateStatus(t.operateStatusRaw),
  assignee:
    t.assignee
    ?? (t.tab === 'pending'
      ? ['张明辉', '张明辉', '李晓彤', '王建国', '张明辉', '李晓彤', '张明辉'][idx % 7] || MOCK_CURRENT_HANDLER
      : ''),
}));

const getTaskExpireMonthKey = (task) => {
  if (!task?.expireDate || !moment) return '';
  return moment(task.expireDate).startOf('month').format('YYYY-MM');
};

const isAnnualReviewCompleted = (task) => task.tab === 'history';

const getTaskResponsibleUser = (task) => task.executor || task.assignee || '';

/** 运维主管看全量；运维专员仅统计本人负责/办理的任务 */
const taskInRoleScope = (task, isSupervisor, currentUser) => {
  if (isSupervisor) return true;
  return getTaskResponsibleUser(task) === currentUser;
};

const buildThreeMonthWindows = (anchorDate = AR_ANCHOR_DATE) => {
  const base = moment(anchorDate).startOf('month');
  return [0, 1, 2].map((offset) => {
    const m = base.clone().add(offset, 'month');
    return {
      key: `m${offset}`,
      title: `${m.format('M')}月执行率`,
      monthLabel: m.format('YYYY年M月'),
      monthKey: m.format('YYYY-MM'),
    };
  });
};

const computeMonthExecutionRate = (allTasks, monthKey, isSupervisor, currentUser) => {
  const scoped = (allTasks || []).filter((t) => {
    if (isAnnualReviewExcluded(t)) return false;
    if (getTaskExpireMonthKey(t) !== monthKey) return false;
    return taskInRoleScope(t, isSupervisor, currentUser);
  });
  const total = scoped.length;
  const done = scoped.filter(isAnnualReviewCompleted).length;
  const rate = total === 0 ? null : Math.round((done / total) * 100);
  return { total, done, pending: total - done, rate };
};

const isAnnualReviewExcluded = (task) =>
  task.operateStatusRaw === '退出运营' || task.operateStatus === '退出运营';

const getOverdueDays = (task) => {
  if (task?.daysLeft != null && task.daysLeft < 0) return -task.daysLeft;
  if (moment && task?.expireDate) {
    const overdue = moment().startOf('day').diff(moment(task.expireDate).startOf('day'), 'days');
    return overdue > 0 ? overdue : 0;
  }
  return 0;
};

const getDaysLeftForSort = (task) => {
  if (task?.daysLeft != null) return task.daysLeft;
  if (moment && task?.expireDate) {
    return moment(task.expireDate).startOf('day').diff(moment().startOf('day'), 'days');
  }
  return Number.MAX_SAFE_INTEGER;
};

const sortPendingTasks = (tasks) =>
  [...tasks].sort((a, b) => {
    const overdueDiff = getOverdueDays(b) - getOverdueDays(a);
    if (overdueDiff !== 0) return overdueDiff;
    return getDaysLeftForSort(a) - getDaysLeftForSort(b);
  });

const buildMockLicensePhotos = (taskId) => [
  {
    uid: `license-${taskId}-1`,
    name: '行驶证.jpg',
    url: `https://picsum.photos/seed/ar-license-${taskId}/240/180`,
    status: 'done',
  },
];

const buildSampleHistorySnapshot = (task) => ({
  inspectionForm: {
    station: task.id === 'ar-h2' ? '平湖检测站' : '汇通检测站',
    cost: task.id === 'ar-h3' ? '450' : '320',
    remark: task.id === 'ar-h1' ? '已通过年检' : '',
  },
  licenseForm: {
    photos: buildMockLicensePhotos(task.id),
    inspectionValidUntil: task.expireDate,
    ocrStatus: 'done',
  },
  m2Expanded: task.id === 'ar-h1',
  m2Form:
    task.id === 'ar-h1'
      ? { station: '汇通检测站', cost: '180', remark: '二保已完成', photos: [] }
      : { station: '', cost: '', remark: '', photos: [] },
  zbExpanded: task.id === 'ar-h3',
  zbForm:
    task.id === 'ar-h3'
      ? { station: '广州天河维修站', cost: '520', remark: '整备完成', photos: [] }
      : { station: '', cost: '', remark: '', photos: [] },
});

const getHistoryServiceForms = (task) => {
  const snap = task?.operateSnapshot;
  if (snap) {
    return { m2: snap.m2Form || {}, zb: snap.zbForm || {} };
  }
  return { m2: task?.m2Form || {}, zb: task?.zbForm || {} };
};

const formatListMoney = (cost) => {
  if (cost === '' || cost == null) return '—';
  const n = Number(cost);
  return Number.isFinite(n) ? n.toFixed(2) : String(cost);
};

const getM2StationName = (task) => getHistoryServiceForms(task).m2?.station || '—';
const getM2Cost = (task) => formatListMoney(getHistoryServiceForms(task).m2?.cost);
const getZbStationName = (task) => getHistoryServiceForms(task).zb?.station || '—';
const getZbCost = (task) => formatListMoney(getHistoryServiceForms(task).zb?.cost);

const formatTaskRegion = (task) => {
  if (!task?.province) return '—';
  if (task.city) return `${task.province}-${task.city}`;
  return task.province;
};

const isTaskOverdue = (task) =>
  task?.daysLeft != null ? task.daysLeft < 0 : getOverdueDays(task) > 0;

const escapeCsvCell = (val) => {
  const text = val == null ? '' : String(val);
  if (/[",\n\r]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
};

const mapTasksForList = (rawTasks) =>
  (rawTasks || [])
    .filter((t) => !isAnnualReviewExcluded(t))
    .map((t) =>
      t.tab === 'history'
        ? { ...t, operateSnapshot: t.operateSnapshot || buildSampleHistorySnapshot(t) }
        : t
    );

const downloadCsv = (filename, headers, rows) => {
  const bom = '\uFEFF';
  const lines = [headers.map(escapeCsvCell).join(',')].concat(
    rows.map((row) => row.map(escapeCsvCell).join(','))
  );
  const blob = new Blob([bom + lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

const buildRegionCascaderOptions = () =>
  Object.entries(PROVINCE_CITY_MAP).map(([province, cities]) => ({
    label: province,
    value: province,
    children: cities.map((c) => ({ label: c, value: c })),
  }));

const AR_ICONS = {
  vehicle: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="3" width="15" height="13" />
      <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
      <circle cx="5.5" cy="18.5" r="2.5" />
      <circle cx="18.5" cy="18.5" r="2.5" />
    </svg>
  ),
  warning: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
  success: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  ),
  rate: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  ),
  info: (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  ),
};

const PAGE_STYLES = `
.ar-web{min-height:100vh;background:#f7f8fa;font-family:Inter,Helvetica,PingFang SC,Microsoft YaHei,Arial,sans-serif}
.ar-web .main-content{padding:20px 24px 32px;max-width:1440px}
.ar-web .ar-page-top-bar{display:flex;justify-content:flex-end;margin-bottom:8px}
.ar-web .filter-card-toolbar{display:flex;justify-content:flex-end;margin-bottom:12px}
.ar-web .ar-alert-stats-row{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:12px;margin-top:12px;margin-bottom:0}
@media (max-width:1200px){
  .ar-web .ar-alert-stats-row{display:flex;flex-wrap:nowrap;overflow-x:auto;gap:12px;padding-bottom:4px;-webkit-overflow-scrolling:touch}
  .ar-web .ar-alert-stats-row .ar-alert-card{flex:0 0 168px;max-width:42vw}
}
.ar-web .ar-alert-card{display:flex;align-items:center;gap:12px;padding:14px 40px 14px 16px;border-radius:12px;border:1px solid #e2e8f0;background:#fff;position:relative;overflow:visible}
.ar-web .ar-alert-card-clickable{cursor:pointer;transition:box-shadow .2s ease,border-color .2s ease,transform .2s ease}
.ar-web .ar-alert-card-clickable:hover{box-shadow:0 4px 14px rgba(15,23,42,.08)}
.ar-web .ar-alert-card-active{box-shadow:0 0 0 2px rgba(22,93,255,.18)!important;border-color:#165dff!important}
.ar-web .ar-alert-card-icon{flex-shrink:0;width:40px;height:40px;border-radius:10px;display:flex;align-items:center;justify-content:center}
.ar-web .ar-alert-card-val{font-size:26px;font-weight:800;line-height:1.1;color:#0f172a;font-variant-numeric:tabular-nums}
.ar-web .ar-alert-card-title{font-size:13px;font-weight:600;color:#334155;margin-top:2px}
.ar-web .ar-alert-card-body{flex:1;min-width:0}
.ar-web .ar-alert-card-info{position:absolute;top:10px;right:10px;width:22px;height:22px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;color:#94a3b8;background:rgba(148,163,184,.12);cursor:help;z-index:1}
.ar-web .ar-alert-card-info:hover{color:#475569;background:rgba(148,163,184,.22)}
.ar-web .ar-rate-card{background:linear-gradient(135deg,#eff6ff 0%,#fff 55%);border-color:#bfdbfe}
.ar-web .ar-rate-card .ar-alert-card-icon{background:#dbeafe;color:#2563eb}
.ar-web .ar-rate-card .ar-alert-card-val{color:#1d4ed8}
.ar-web .ar-rate-card--hover-tip{cursor:default}
.ar-web .ar-alert-card--total{background:linear-gradient(135deg,#f8fafc 0%,#fff 100%)}
.ar-web .ar-alert-card--total .ar-alert-card-icon{background:#e2e8f0;color:#475569}
.ar-web .ar-alert-card--normal{background:linear-gradient(135deg,#ecfdf5 0%,#fff 55%);border-color:#bbf7d0}
.ar-web .ar-alert-card--normal .ar-alert-card-icon{background:#d1fae5;color:#059669}
.ar-web .ar-alert-card--normal .ar-alert-card-val{color:#047857}
.ar-web .ar-alert-card--expired{background:linear-gradient(135deg,#fef2f2 0%,#fff 55%);border-color:#fecaca}
.ar-web .ar-alert-card--expired .ar-alert-card-icon{background:#fee2e2;color:#dc2626}
.ar-web .ar-alert-card--expired .ar-alert-card-val{color:#b91c1c}
.ar-web .filter-card,.ar-web .table-card{border:1px solid #e5e6eb!important;border-radius:10px!important;box-shadow:none!important}
.ar-web .filter-card .ant-card-body{padding:16px 20px 8px}
.ar-web .filter-form .ant-form-item{margin-bottom:16px}
.ar-web .filter-form .ant-form-item-control-input,.ar-web .filter-form .ant-select,.ar-web .filter-form .ant-picker,.ar-web .filter-form .ant-cascader{width:100%!important}
.ar-web .filter-form .ant-select-selector{width:100%!important}
.ar-web .filter-actions{display:flex;justify-content:flex-end;gap:8px;padding-bottom:12px;margin-top:4px}
.ar-web .table-card .ant-card-body{padding:0}
.ar-web .table-list-bar{display:flex;justify-content:flex-end;align-items:center;padding:12px 20px 0}
.ar-web .table-inner{padding:0 20px 16px}
.ar-web .plate-cell{font-weight:600;color:#1d2129;font-size:14px}
.ar-web .plate-cell-with-tag{display:inline-flex;align-items:center;flex-wrap:wrap;gap:8px}
.ar-web .ar-prd-ul{margin:0;padding-left:20px}
.ar-web .ar-prd-ul li{margin-bottom:6px}
.ar-web .action-link{color:#165dff;cursor:pointer;user-select:none}
.ar-web .action-link:hover{text-decoration:underline}
.ar-web .action-link+.action-link{margin-left:12px}
.ar-web .filter-tags{margin-top:8px;display:flex;flex-wrap:wrap;gap:8px}
.ar-web .ar-prd-doc{max-height:65vh;overflow-y:auto;font-size:13px;line-height:1.65;color:#4e5969}
.ar-web .ar-prd-h2{font-size:15px;font-weight:600;color:#1d2129;margin:16px 0 8px}
.ar-web .ar-prd-h3{font-size:14px;font-weight:600;color:#1d2129;margin:12px 0 6px}
.ar-web .ar-prd-highlight{background:#f0f9ff;border:1px solid #bedaff;border-radius:8px;padding:12px 14px;margin:12px 0}
@media (prefers-reduced-motion: reduce){
  .ar-web .ar-alert-card-clickable{transition:none}
  .ar-web .ar-alert-card-clickable:hover{transform:none}
}
`;

const Component = function AnnualReviewWebList() {
  const regionOptions = useMemo(() => buildRegionCascaderOptions(), []);

  const [mainTab, setMainTab] = useState('pending');
  /** all=待办任务 | overdue=已逾期 | completed=已完成 */
  const [kpiActive, setKpiActive] = useState('all');
  const [plateInput, setPlateInput] = useState('');
  const [appliedPlate, setAppliedPlate] = useState('');
  const [filterDraft, setFilterDraft] = useState({ ...DEFAULT_FILTER });
  const [filterApplied, setFilterApplied] = useState({ ...DEFAULT_FILTER });
  const [filterExpanded, setFilterExpanded] = useState(true);
  const [tasks, setTasks] = useState(() => {
    const stored = loadTasksFromStorage();
    const base = mergeExecutionRateDemoTasks(stored || MOCK_TASKS);
    return base.filter((t) => !isAnnualReviewExcluded(t)).map((t) =>
      t.tab === 'history'
        ? { ...t, operateSnapshot: t.operateSnapshot || buildSampleHistorySnapshot(t) }
        : t
    );
  });
  const [prdOpen, setPrdOpen] = useState(false);
  const [operateDrafts, setOperateDrafts] = useState(() => loadOperateDraftsForDisplay());
  const [rangePickerKey, setRangePickerKey] = useState(0);
  const [tablePage, setTablePage] = useState(1);
  const [tablePageSize, setTablePageSize] = useState(10);
  /** false=运维专员（仅本人任务）；true=运维主管（全量） */
  const [viewAsSupervisor, setViewAsSupervisor] = useState(false);

  useEffect(() => {
    setTablePage(1);
  }, [mainTab, kpiActive, appliedPlate, filterApplied]);

  const syncFromHandlePage = () => {
    setOperateDrafts(loadOperateDraftsForDisplay());
    const stored = loadTasksFromStorage();
    if (stored) setTasks(mapTasksForList(mergeExecutionRateDemoTasks(stored)));
  };

  useEffect(() => {
    const handler = () => syncFromHandlePage();
    window.addEventListener(AR_NAV_EVENT, handler);
    window.addEventListener('focus', handler);
    const onStorage = (e) => {
      if (!e.key || e.key === AR_DRAFT_STORAGE_KEY || e.key === AR_TASKS_STORAGE_KEY) {
        handler();
      }
    };
    window.addEventListener('storage', onStorage);
    try {
      if (sessionStorage.getItem(AR_NAV_TARGET_KEY) === 'list') {
        sessionStorage.removeItem(AR_NAV_TARGET_KEY);
        handler();
      }
    } catch {
      /* ignore */
    }
    return () => {
      window.removeEventListener(AR_NAV_EVENT, handler);
      window.removeEventListener('focus', handler);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  const pendingSource = useMemo(() => tasks.filter((t) => t.tab === 'pending'), [tasks]);

  const listStats = useMemo(() => {
    const pending = pendingSource;
    const overdue = pending.filter((t) => isTaskOverdue(t)).length;
    const completed = tasks.filter((t) => t.tab === 'history').length;
    return {
      pendingTotal: pending.length,
      overdue,
      completed,
    };
  }, [pendingSource, tasks]);

  const monthWindows = useMemo(() => buildThreeMonthWindows(AR_ANCHOR_DATE), []);

  const executionRateCards = useMemo(() => {
    const isSupervisor = viewAsSupervisor;
    const currentUser = MOCK_CURRENT_HANDLER;
    return monthWindows.map((win) => {
      const stat = computeMonthExecutionRate(tasks, win.monthKey, isSupervisor, currentUser);
      return {
        ...win,
        ...stat,
        tooltipText: `已处理：${stat.done}/本月任务数：${stat.total}`,
      };
    });
  }, [tasks, monthWindows, viewAsSupervisor]);

  const activeFilterTags = useMemo(() => {
    const f = filterApplied;
    const tags = [];
    if (f.provinceCity && f.provinceCity[0]) {
      tags.push({
        key: 'region',
        label: `运营区域：${f.provinceCity[1] ? `${f.provinceCity[0]} / ${f.provinceCity[1]}` : f.provinceCity[0]}`,
      });
    }
    if (f.expireRange && f.expireRange[0] && f.expireRange[1] && moment) {
      tags.push({
        key: 'expire',
        label: `到期时间：${moment(f.expireRange[0]).format('YYYY-MM-DD')} ~ ${moment(f.expireRange[1]).format('YYYY-MM-DD')}`,
      });
    }
    if (mainTab === 'history') {
      if (f.handler) tags.push({ key: 'handler', label: `办理人：${f.handler}` });
      if (f.executeTimeRange && f.executeTimeRange[0] && f.executeTimeRange[1] && moment) {
        tags.push({
          key: 'done',
          label: `完成时间：${moment(f.executeTimeRange[0]).format('YYYY-MM-DD')} ~ ${moment(f.executeTimeRange[1]).format('YYYY-MM-DD')}`,
        });
      }
    }
    if (appliedPlate) tags.push({ key: 'plate', label: `车牌：${appliedPlate}` });
    return tags;
  }, [filterApplied, appliedPlate, mainTab]);

  const filteredList = useMemo(() => {
    const f = filterApplied;
    const plateKey = (appliedPlate || '').trim().toLowerCase();

    const list = tasks.filter((t) => {
      if (t.tab !== mainTab) return false;
      if (plateKey && !t.plateNo.toLowerCase().includes(plateKey)) return false;
      if (f.provinceCity && f.provinceCity[0]) {
        if (t.province !== f.provinceCity[0]) return false;
        if (f.provinceCity[1] && t.city !== f.provinceCity[1]) return false;
      }
      if (f.expireRange && f.expireRange[0] && f.expireRange[1] && moment) {
        const exp = moment(t.expireDate).startOf('day').valueOf();
        const start = moment(f.expireRange[0]).startOf('day').valueOf();
        const end = moment(f.expireRange[1]).endOf('day').valueOf();
        if (exp < start || exp > end) return false;
      }
      if (mainTab === 'history') {
        if (f.handler && t.executor !== f.handler) return false;
        if (f.executeTimeRange && f.executeTimeRange[0] && f.executeTimeRange[1] && moment) {
          const done = moment(t.executeTime);
          if (!done.isValid()) return false;
          const start = moment(f.executeTimeRange[0]).startOf('day').valueOf();
          const end = moment(f.executeTimeRange[1]).endOf('day').valueOf();
          const doneVal = done.valueOf();
          if (doneVal < start || doneVal > end) return false;
        }
      }
      return true;
    });

    let scoped = list;
    if (kpiActive === 'overdue' && mainTab === 'pending') {
      scoped = scoped.filter((t) => isTaskOverdue(t));
    }

    if (mainTab === 'pending') return sortPendingTasks(scoped);
    if (mainTab === 'history' && moment) {
      return [...scoped].sort((a, b) => {
        const ta = moment(a.executeTime);
        const tb = moment(b.executeTime);
        if (ta.isValid() && tb.isValid()) return tb.valueOf() - ta.valueOf();
        return String(b.executeTime || '').localeCompare(String(a.executeTime || ''));
      });
    }
    return scoped;
  }, [tasks, mainTab, kpiActive, appliedPlate, filterApplied]);

  const renderUrgencyTag = (task) => {
    if (mainTab !== 'pending') return null;
    const days = task.daysLeft;
    if (days == null) return <Tag>—</Tag>;
    if (days < 0) {
      return (
        <Tag color="error" aria-label={`已逾期 ${Math.abs(days)} 天`}>
          已逾期 {Math.abs(days)} 天
        </Tag>
      );
    }
    if (days <= 30) {
      return (
        <Tag color="warning" aria-label={`剩余 ${days} 天`}>
          剩余 {days} 天
        </Tag>
      );
    }
    return <Tag color="default">剩余 {days} 天</Tag>;
  };

  const goHandlePage = (task) => {
    try {
      sessionStorage.setItem(AR_TASK_ID_STORAGE_KEY, task.id);
      persistTasksToStorage(tasks);
    } catch {
      /* ignore */
    }
    message.info('已带入车辆信息，请打开「年审管理-办理」页面继续办理');
  };

  const goViewPage = (task) => {
    try {
      sessionStorage.setItem(AR_TASK_ID_STORAGE_KEY, task.id);
      persistTasksToStorage(tasks);
    } catch {
      /* ignore */
    }
    message.info('已带入历史记录，请打开「年审管理-查看」页面');
  };

  const handleKpiClick = (key) => {
    setKpiActive(key);
    if (key === 'completed') {
      setMainTab('history');
    } else {
      setMainTab('pending');
    }
  };

  const formatUrgencyText = (task) => {
    const days = task?.daysLeft;
    if (days == null) return '';
    if (days < 0) return `已逾期 ${Math.abs(days)} 天`;
    return `剩余 ${days} 天`;
  };

  const handleExportList = () => {
    if (!filteredList.length) {
      message.warning('当前列表无可导出数据');
      return;
    }
    const isPending = mainTab === 'pending';
    const tabLabel = kpiActive === 'overdue' ? '已逾期' : kpiActive === 'completed' ? '已完成' : '待办任务';
    const headers = isPending
      ? ['序号', '车牌号', '品牌', '型号', '紧急程度', '运营状态', '运营区域', '检验到期日']
      : [
          '序号',
          '车牌号',
          '品牌',
          '型号',
          '运营状态',
          '运营区域',
          '检验有效期至',
          '二保服务站名称',
          '二保费用',
          '整备服务站名称',
          '整备费用',
          '办理人',
          '完成时间',
        ];
    const rows = filteredList.map((row, index) =>
      isPending
        ? [
            index + 1,
            row.plateNo,
            row.brand,
            row.model,
            formatUrgencyText(row),
            row.operateStatus,
            formatTaskRegion(row),
            row.expireDate,
          ]
        : [
            index + 1,
            row.plateNo,
            row.brand,
            row.model,
            row.operateStatus,
            formatTaskRegion(row),
            row.expireDate,
            getM2StationName(row) === '—' ? '' : getM2StationName(row),
            getM2Cost(row) === '—' ? '' : getM2Cost(row),
            getZbStationName(row) === '—' ? '' : getZbStationName(row),
            getZbCost(row) === '—' ? '' : getZbCost(row),
            row.executor,
            row.executeTime,
          ]
    );
    const dateStr = moment ? moment().format('YYYYMMDD_HHmm') : 'export';
    downloadCsv(`年审管理_${tabLabel}_${dateStr}.csv`, headers, rows);
    message.success(`已导出 ${filteredList.length} 条记录`);
  };

  const indexColumn = useMemo(
    () => ({
      title: '序号',
      key: 'serial',
      width: 64,
      fixed: 'left',
      align: 'center',
      render: (_, __, index) => (tablePage - 1) * tablePageSize + index + 1,
    }),
    [tablePage, tablePageSize]
  );

  const plateColumnPending = useMemo(
    () => ({
      title: '车牌号',
      dataIndex: 'plateNo',
      key: 'plateNo',
      fixed: 'left',
      width: 168,
      render: (_, row) => (
        <span className="plate-cell plate-cell-with-tag">
          <span>{row.plateNo}</span>
          {operateDrafts[row.id] ? <Tag color="processing">已保存</Tag> : null}
        </span>
      ),
    }),
    [operateDrafts]
  );

  const plateColumnHistory = useMemo(
    () => ({
      title: '车牌号',
      dataIndex: 'plateNo',
      key: 'plateNo',
      fixed: 'left',
      width: 112,
      render: (v) => <span className="plate-cell">{v}</span>,
    }),
    []
  );

  const brandModelColumns = useMemo(
    () => [
      { title: '品牌', dataIndex: 'brand', key: 'brand', width: 88, ellipsis: true },
      { title: '型号', dataIndex: 'model', key: 'model', width: 168, ellipsis: true },
    ],
    []
  );

  const applySearch = () => {
    setAppliedPlate(plateInput.trim());
    setFilterApplied({ ...filterDraft });
    setTablePage(1);
    message.success('已按筛选条件更新列表');
  };

  const resetFilters = () => {
    setPlateInput('');
    setAppliedPlate('');
    const next = { ...DEFAULT_FILTER };
    setFilterDraft(next);
    setFilterApplied(next);
    setRangePickerKey((k) => k + 1);
    message.info('已重置筛选条件');
  };

  const removeFilterTag = (key) => {
    if (key === 'plate') {
      setPlateInput('');
      setAppliedPlate('');
      return;
    }
    const next = { ...filterApplied };
    if (key === 'region') next.provinceCity = null;
    if (key === 'expire') next.expireRange = null;
    if (key === 'handler') next.handler = '';
    if (key === 'done') next.executeTimeRange = null;
    setFilterDraft(next);
    setFilterApplied(next);
    if (key === 'expire' || key === 'done') setRangePickerKey((k) => k + 1);
  };

  const pendingColumns = [
    indexColumn,
    plateColumnPending,
    ...brandModelColumns,
    {
      title: '紧急程度',
      key: 'urgency',
      width: 120,
      render: (_, row) => renderUrgencyTag(row),
    },
    {
      title: '运营状态',
      dataIndex: 'operateStatus',
      key: 'operateStatus',
      width: 96,
      render: (v) => <Badge status={v === '库存' ? 'warning' : 'processing'} text={v} />,
    },
    {
      title: '运营区域',
      key: 'region',
      width: 160,
      render: (_, row) => formatTaskRegion(row),
    },
    {
      title: '检验到期日',
      dataIndex: 'expireDate',
      key: 'expireDate',
      width: 120,
    },
    {
      title: '操作',
      key: 'action',
      fixed: 'right',
      width: 88,
      render: (_, row) => (
        <a className="action-link" onClick={() => goHandlePage(row)} role="button" tabIndex={0}>
          办理
        </a>
        ),
    },
  ];

  const historyColumns = [
    indexColumn,
    plateColumnHistory,
    ...brandModelColumns,
    {
      title: '运营状态',
      dataIndex: 'operateStatus',
      key: 'operateStatus',
      width: 96,
      render: (v) => <Badge status="success" text={v} />,
    },
    {
      title: '运营区域',
      key: 'region',
      width: 160,
      render: (_, row) => formatTaskRegion(row),
    },
    {
      title: '检验有效期至',
      dataIndex: 'expireDate',
      key: 'expireDate',
      width: 120,
    },
    {
      title: '二保服务站名称',
      key: 'm2Station',
      width: 128,
      ellipsis: true,
      render: (_, row) => getM2StationName(row),
    },
    {
      title: '二保费用',
      key: 'm2Cost',
      width: 96,
      align: 'right',
      render: (_, row) => getM2Cost(row),
    },
    {
      title: '整备服务站名称',
      key: 'zbStation',
      width: 128,
      ellipsis: true,
      render: (_, row) => getZbStationName(row),
    },
    {
      title: '整备费用',
      key: 'zbCost',
      width: 96,
      align: 'right',
      render: (_, row) => getZbCost(row),
    },
    {
      title: '办理人',
      dataIndex: 'executor',
      key: 'executor',
      width: 100,
    },
    {
      title: '完成时间',
      dataIndex: 'executeTime',
      key: 'executeTime',
      width: 160,
      defaultSortOrder: 'descend',
      sorter: (a, b) => String(b.executeTime).localeCompare(String(a.executeTime)),
    },
    {
      title: '操作',
      key: 'action',
      fixed: 'right',
      width: 88,
      render: (_, row) => (
        <a className="action-link" onClick={() => goViewPage(row)} role="button" tabIndex={0}>
          查看
        </a>
      ),
    },
  ];

  const kpiAlertCards = [
    {
      key: 'all',
      kpi: 'all',
      type: 'total',
      title: '待办任务',
      desc: '当前待办理年审任务总数（不含退出运营车辆）。点击卡片筛选待办列表。',
      val: listStats.pendingTotal,
      icon: AR_ICONS.vehicle,
    },
    {
      key: 'overdue',
      kpi: 'overdue',
      type: 'expired',
      title: '已逾期',
      desc: '检验到期日已过仍未办结的待办任务。点击后列表仅展示已逾期车辆，排序优先逾期最久。',
      val: listStats.overdue,
      icon: AR_ICONS.warning,
    },
    {
      key: 'completed',
      kpi: 'completed',
      type: 'normal',
      title: '已完成',
      desc: '已提交办结并进入历史记录的年审任务数。点击切换至历史 Tab。',
      val: listStats.completed,
      icon: AR_ICONS.success,
    },
  ];

  const renderKpiInfoIcon = (desc) => (
    <Tooltip title={desc} placement="topRight">
      <span
        className="ar-alert-card-info"
        role="img"
        aria-label="指标说明"
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {AR_ICONS.info}
      </span>
    </Tooltip>
  );

  const statCards = (
    <div className="ar-alert-stats-row">
      {kpiAlertCards.map((card) => (
        <div
          key={card.key}
          className={`ar-alert-card ar-alert-card--${card.type} ar-alert-card-clickable${
            kpiActive === card.kpi ? ' ar-alert-card-active' : ''
          }`}
          onClick={() => handleKpiClick(card.kpi)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && handleKpiClick(card.kpi)}
        >
          {renderKpiInfoIcon(card.desc)}
          <div className="ar-alert-card-icon">{card.icon}</div>
          <div className="ar-alert-card-body">
            <div className="ar-alert-card-val">{card.val}</div>
            <div className="ar-alert-card-title">{card.title}</div>
          </div>
        </div>
      ))}
      {executionRateCards.map((card) => (
        <Tooltip key={card.key} title={card.tooltipText} placement="top">
          <div className="ar-alert-card ar-rate-card ar-rate-card--hover-tip">
            <div className="ar-alert-card-icon">{AR_ICONS.rate}</div>
            <div className="ar-alert-card-body">
              <div className="ar-alert-card-val">{card.rate == null ? '—' : `${card.rate}%`}</div>
              <div className="ar-alert-card-title">{card.title}</div>
            </div>
          </div>
        </Tooltip>
      ))}
    </div>
  );

  const pageContent = (
    <div className="ar-web">
      <style>{PAGE_STYLES}</style>
      <div className="main-content">
          <div className="ar-page-top-bar">
            <Space wrap>
              <span style={{ fontSize: 12, color: '#64748b' }}>查看视角</span>
              <Select
                value={viewAsSupervisor ? 'supervisor' : 'specialist'}
                onChange={(v) => setViewAsSupervisor(v === 'supervisor')}
                style={{ width: 168 }}
                options={[
                  { label: '运维专员', value: 'specialist' },
                  { label: '运维主管', value: 'supervisor' },
                ]}
              />
              <Button type="primary" ghost onClick={() => setPrdOpen(true)}>
                查看需求说明
              </Button>
            </Space>
          </div>
          <Card className="filter-card">
            <div className="filter-card-toolbar">
              <Button type="link" size="small" onClick={() => setFilterExpanded((v) => !v)} aria-expanded={filterExpanded}>
                {filterExpanded ? '收起' : '展开'}
              </Button>
            </div>
            {filterExpanded && (
              <Form layout="vertical" className="filter-form">
                <Row gutter={16}>
                  <Col xs={24} md={8}>
                    <Form.Item label="车牌号">
                      <Input
                        allowClear
                        placeholder="支持模糊搜索"
                        value={plateInput}
                        onChange={(e) => setPlateInput(e.target.value)}
                        onPressEnter={applySearch}
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={8}>
                    <Form.Item label="运营区域">
                      <Cascader
                        allowClear
                        placeholder="省 / 市"
                        options={regionOptions}
                        value={filterDraft.provinceCity}
                        onChange={(v) => setFilterDraft((p) => ({ ...p, provinceCity: v }))}
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={8}>
                    <Form.Item label="检验到期时间">
                      <RangePicker
                        key={`expire-${rangePickerKey}`}
                        onChange={(dates) =>
                          setFilterDraft((p) => ({
                            ...p,
                            expireRange: dates && dates[0] && dates[1] ? [dates[0], dates[1]] : null,
                          }))
                        }
                      />
                    </Form.Item>
                  </Col>
                  {mainTab === 'history' && (
                    <>
                      <Col xs={24} md={8}>
                        <Form.Item label="办理人">
                          <Select
                            allowClear
                            placeholder="全部"
                            options={HANDLER_OPTIONS}
                            value={filterDraft.handler || undefined}
                            onChange={(v) => setFilterDraft((p) => ({ ...p, handler: v || '' }))}
                          />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={8}>
                        <Form.Item label="完成时间">
                          <RangePicker
                            key={`done-${rangePickerKey}`}
                            onChange={(dates) =>
                              setFilterDraft((p) => ({
                                ...p,
                                executeTimeRange: dates && dates[0] && dates[1] ? [dates[0], dates[1]] : null,
                              }))
                            }
                          />
                        </Form.Item>
                      </Col>
                    </>
                  )}
                </Row>
                <div className="filter-actions">
                  <Button onClick={resetFilters}>重置</Button>
                  <Button type="primary" onClick={applySearch}>
                    查询
                  </Button>
                </div>
              </Form>
            )}
            {activeFilterTags.length > 0 && (
              <div className="filter-tags">
                {activeFilterTags.map((t) => (
                  <Tag key={t.key} closable onClose={() => removeFilterTag(t.key)}>
                    {t.label}
                  </Tag>
                ))}
              </div>
            )}
          </Card>

          {statCards}

          <Card className="table-card" style={{ marginTop: 16 }}>
            <div className="table-list-bar">
              <Button onClick={handleExportList}>导出</Button>
            </div>
            <div className="table-inner">
              <Table
                rowKey="id"
                columns={mainTab === 'pending' ? pendingColumns : historyColumns}
                dataSource={filteredList}
                scroll={{ x: mainTab === 'history' ? 1680 : 1180 }}
                sticky
                pagination={{
                  current: tablePage,
                  pageSize: tablePageSize,
                  showSizeChanger: true,
                  showTotal: (total) => `共 ${total} 条`,
                  onChange: (page, pageSize) => {
                    setTablePage(page);
                    setTablePageSize(pageSize);
                  },
                }}
                locale={{
                  emptyText: (
                    <div style={{ padding: '48px 0', color: '#86909c' }}>
                      暂无符合条件的年审任务
                    </div>
                  ),
                }}
              />
            </div>
          </Card>
      </div>

      <Modal
        open={prdOpen}
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 17, fontWeight: 800, color: '#0f172a' }}>
            <span
              style={{
                width: 28,
                height: 28,
                borderRadius: 6,
                background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: 14,
              }}
            >
              📋
            </span>
            <span>年审管理 · 产品需求说明（PRD）</span>
          </div>
        }
        onCancel={() => setPrdOpen(false)}
        footer={[
          <Button
            key="close"
            type="primary"
            style={{ borderRadius: 8, background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)', border: 'none' }}
            onClick={() => setPrdOpen(false)}
          >
            我已了解
          </Button>,
        ]}
        width={980}
        centered
        style={{ top: 20 }}
        bodyStyle={{ maxHeight: '72vh', overflowY: 'auto', padding: '12px 24px 24px' }}
        destroyOnClose
      >
        <div className="ar-prd-doc" style={{ fontSize: 13, lineHeight: 1.65, color: '#334155' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16, fontSize: 12, color: '#64748b' }}>
            <Tag color="blue">本页：年审任务列表（监管台）</Tag>
            <Tag>模块路径：运维管理 &gt; 车辆业务 &gt; 年审管理</Tag>
            <Tag>文档版本：V1.1</Tag>
            <Tag>读者：产品 / 运维主管 / 运维专员 / 研发测试</Tag>
          </div>

          <Alert
            type="info"
            showIcon
            style={{ marginBottom: 16, borderRadius: 12 }}
            message={<span style={{ fontWeight: 700 }}>本文档说明「年审管理」列表页能力</span>}
            description="单车分组办理、OCR、提交与证照回写在独立页面「年审管理-办理」；历史只读查看在「年审管理-查看」。列表通过 session 任务 ID + 本地任务库/草稿库与办理页联动，逻辑对齐 ONE-OS 小程序年审管理。"
          />

          <Tabs defaultActiveKey="core" size="middle" tabBarGutter={12} type="card" className="ar-prd-tabs">
            <Tabs.TabPane tab="⭐ 核心逻辑" key="core">
              <div style={{ marginTop: 10 }}>
                <div
                  style={{
                    background: 'linear-gradient(135deg, #eff6ff 0%, #f8fafc 100%)',
                    border: '2px solid #93c5fd',
                    borderRadius: 12,
                    padding: '14px 18px',
                    marginBottom: 16,
                  }}
                >
                  <div style={{ fontWeight: 800, fontSize: 15, color: '#1d4ed8', marginBottom: 10 }}>产品定位（本页）</div>
                  <p style={{ margin: '0 0 8px' }}>
                    <strong>监管台：</strong>对车辆年审任务进行<strong>预警看板、执行率跟踪、筛选检索、导出、进入单车办理</strong>，不承担分组表单录入本身。
                  </p>
                  <p style={{ margin: 0 }}>
                    <strong>价值：</strong>让运维团队「先看全局风险与完成度 → 再按车办理」，待办与历史一体管理，办结后回写证照检验有效期。
                  </p>
                </div>

                <div style={{ fontWeight: 800, fontSize: 14, color: '#0f172a', marginBottom: 10 }}>端到端主流程</div>
                <ol style={{ paddingLeft: 20, margin: '0 0 18px', lineHeight: 1.75 }}>
                  <li>
                    <strong>进入列表</strong> → 默认待办视图，KPI 一行展示任务概况 + 近 3 个月执行率
                  </li>
                  <li>
                    <strong>点击 KPI / 筛选查询</strong> → 缩小待处理车辆范围（KPI 计数为全量任务口径，见规则②）
                  </li>
                  <li>
                    <strong>待办办理</strong> →「办理」进入办理页，保存草稿或提交办结
                  </li>
                  <li>
                    <strong>办结归档</strong> → 任务进历史，列表切至已完成；证照检验有效期全量覆盖
                  </li>
                  <li>
                    <strong>历史追溯</strong> →「查看」只读回看检测/行驶证/二保/整备录入内容
                  </li>
                </ol>

                <div style={{ fontWeight: 800, fontSize: 14, color: '#b91c1c', marginBottom: 10 }}>【重点】五条必读业务规则</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 18 }}>
                  <div style={{ background: '#fffbeb', border: '1px solid #fcd34d', borderRadius: 10, padding: '10px 14px' }}>
                    <strong style={{ color: '#92400e' }}>① 任务来源与范围</strong>
                    <span style={{ color: '#78350f' }}>
                      {' '}
                      — 待办由车辆<strong>检验有效期</strong>驱动生成；<strong>退出运营</strong>车辆不在本模块展示、不参与统计。
                    </span>
                  </div>
                  <div style={{ background: '#eff6ff', border: '1px solid #93c5fd', borderRadius: 10, padding: '10px 14px' }}>
                    <strong style={{ color: '#1d4ed8' }}>② KPI vs 筛选</strong>
                    <span style={{ color: '#1e3a8a' }}>
                      {' '}
                      — 待办总数 / 已逾期 / 已完成、执行率均按<strong>全量任务库</strong>统计，<strong>不随列表筛选变化</strong>；点击 KPI 仅切换列表视图/范围，可与筛选叠加。
                    </span>
                  </div>
                  <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '10px 14px' }}>
                    <strong style={{ color: '#991b1b' }}>③ 逾期与紧急程度</strong>
                    <span style={{ color: '#7f1d1d' }}>
                      {' '}
                      — 检验到期日早于今日为<strong>已逾期</strong>；待办列表展示紧急标签：已逾期（红）、剩余 ≤30 天（橙）、其余（灰）。待办排序：逾期越久越靠前，其次剩余天数越少越靠前。
                    </span>
                  </div>
                  <div style={{ background: '#f5f3ff', border: '1px solid #c4b5fd', borderRadius: 10, padding: '10px 14px' }}>
                    <strong style={{ color: '#5b21b6' }}>④ 草稿与办结</strong>
                    <span style={{ color: '#4c1d95' }}>
                      {' '}
                      — 办理页「保存」不写证照、不校验，回列表显示
                      <Tag color="processing" style={{ margin: '0 4px' }}>
                        已保存
                      </Tag>
                      ；「提交」校验通过后清草稿、任务转历史，并同步证照。
                    </span>
                  </div>
                  <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 10, padding: '10px 14px' }}>
                    <strong style={{ color: '#166534' }}>⑤ 证照回写</strong>
                    <span style={{ color: '#14532d' }}>
                      {' '}
                      — 提交时以<strong>新行驶证照片（最多 4 张）+ 检验有效期至</strong>对「证照管理」对应车辆做<strong>全量覆盖</strong>（非增量）；保存不同步证照。
                    </span>
                  </div>
                </div>

                <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>列表视图切换（无独立 Tab 栏）</div>
                <Paragraph style={{ margin: '0 0 12px' }}>
                  通过 KPI 卡片切换：<Text strong>待办任务</Text>、<Text strong>已逾期</Text>（仍属待办池）、<Text strong>已完成</Text>（切换为历史列表）。当前视图决定表格列与筛选项（历史多出办理人、完成时间）。
                </Paragraph>
              </div>
            </Tabs.TabPane>

            <Tabs.TabPane tab="📊 本页功能" key="list">
              <div style={{ marginTop: 10 }}>
                <div className="ar-prd-h2" style={{ marginTop: 0 }}>1. 页面结构（自上而下）</div>
                <ol className="ar-prd-ul">
                  <li>右上「查看需求说明」（本文档）；原型另提供「查看视角」切换专员/主管（正式环境由登录角色决定）</li>
                  <li>筛选区：车牌、运营区域、检验到期时间；历史视图增加办理人、完成时间</li>
                  <li>KPI 看板：一行 6 卡（3 任务指标 + 3 月执行率）</li>
                  <li>任务表格 + 导出</li>
                </ol>

                <div className="ar-prd-h2">2. 筛选与标签</div>
                <ul className="ar-prd-ul">
                  <li>点击「查询」后条件生效；「重置」清空；已生效条件以可关闭 Tag 展示</li>
                  <li>车牌支持模糊匹配；运营区域为省/市级联；检验到期时间为闭区间</li>
                  <li>筛选仅作用于<strong>列表</strong>，不改变 KPI / 执行率数字</li>
                </ul>

                <div className="ar-prd-h2">3. 待办列表字段</div>
                <Paragraph style={{ margin: '0 0 8px' }}>
                  序号、车牌号（含「已保存」标签）、品牌、型号、紧急程度、运营状态、运营区域、检验到期日、操作（办理）。
                </Paragraph>
                <Paragraph style={{ margin: 0, fontSize: 12, color: '#64748b' }}>
                  运营状态展示规则：主数据「可运营」「待运营」统一显示为「库存」，与证照模块一致。
                </Paragraph>

                <div className="ar-prd-h2">4. 历史列表字段</div>
                <Paragraph style={{ margin: 0 }}>
                  序号、车牌号、品牌、型号、运营状态、运营区域、检验有效期至、二保服务站名称/费用、整备服务站名称/费用、办理人、完成时间、操作（查看）。未办理二保/整备时名称与费用显示「—」。
                </Paragraph>

                <div className="ar-prd-h2">5. 导出</div>
                <Paragraph style={{ margin: 0 }}>
                  表格右上「导出」：导出<strong>当前筛选结果</strong>为 CSV（UTF-8 BOM），列与当前列表视图一致；无数据时提示不可导出。
                </Paragraph>
              </div>
            </Tabs.TabPane>

            <Tabs.TabPane tab="📈 KPI与执行率" key="kpi">
              <div style={{ marginTop: 10 }}>
                <div className="ar-prd-h2" style={{ marginTop: 0 }}>任务 KPI（前三卡，可点击）</div>
                <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #e2e8f0', fontSize: 12, marginBottom: 16 }}>
                  <thead>
                    <tr style={{ background: '#f8fafc' }}>
                      <th style={{ padding: '8px 12px', textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>卡片</th>
                      <th style={{ padding: '8px 12px', textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>统计口径</th>
                      <th style={{ padding: '8px 12px', textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>点击行为</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{ padding: '8px 12px', borderBottom: '1px solid #f1f5f9', fontWeight: 600 }}>待办任务</td>
                      <td style={{ padding: '8px 12px', borderBottom: '1px solid #f1f5f9' }}>tab=待办 的任务总数</td>
                      <td style={{ padding: '8px 12px', borderBottom: '1px solid #f1f5f9' }}>列表切待办，展示全部待办</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '8px 12px', borderBottom: '1px solid #f1f5f9', fontWeight: 600 }}>已逾期</td>
                      <td style={{ padding: '8px 12px', borderBottom: '1px solid #f1f5f9' }}>待办中检验到期日 &lt; 今日</td>
                      <td style={{ padding: '8px 12px', borderBottom: '1px solid #f1f5f9' }}>列表切待办，仅展示逾期车</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '8px 12px', fontWeight: 600 }}>已完成</td>
                      <td style={{ padding: '8px 12px' }}>tab=历史 的任务总数</td>
                      <td style={{ padding: '8px 12px' }}>列表切历史</td>
                    </tr>
                  </tbody>
                </table>
                <Paragraph style={{ margin: '0 0 12px', fontSize: 12, color: '#64748b' }}>
                  卡片左侧图标垂直居中；指标说明见右上角 ⓘ 悬浮提示。
                </Paragraph>

                <div className="ar-prd-h2">近 3 个月执行率（后三卡）</div>
                <ul className="ar-prd-ul">
                  <li>
                    <strong>月份：</strong>以系统当前月为基准，自动取<strong>当月、下月、下下月</strong>，标题示例「6月执行率」「7月执行率」「8月执行率」
                  </li>
                  <li>
                    <strong>本月任务数：</strong>检验有效期（到期日）落在该自然月的任务条数（待办 + 历史合计，不含退出运营）
                  </li>
                  <li>
                    <strong>已处理数：</strong>上述任务中已办结（进入历史）的条数
                  </li>
                  <li>
                    <strong>展示：</strong>大数显示「已执行比例」= round(已处理 ÷ 本月任务数 × 100%)；无任务时显示「—」
                  </li>
                  <li>
                    <strong>悬浮：</strong>鼠标悬停卡片显示「已处理：x/本月任务数：y」，例：已处理：35/本月任务数：60
                  </li>
                  <li>
                    <strong>角色：</strong>运维主管统计全量；运维专员仅统计本人为办理人/负责人的任务（正式环境按登录账号，勿依赖原型下拉）
                  </li>
                </ul>
              </div>
            </Tabs.TabPane>

            <Tabs.TabPane tab="🔗 办理与查看" key="flow">
              <div style={{ marginTop: 10 }}>
                <div className="ar-prd-h2" style={{ marginTop: 0 }}>办理页「年审管理-办理」</div>
                <ul className="ar-prd-ul">
                  <li>列表「办理」→ session 写入当前任务 ID，并持久化任务库 → 打开办理页</li>
                  <li>分组模块：检测信息、行驶证（OCR）、二保（可选）、整备（可选）</li>
                  <li>
                    <Text strong>保存：</Text>本地草稿，不校验，不同步证照；返回列表显示「已保存」
                  </li>
                  <li>
                    <Text strong>提交：</Text>必填校验通过后 → 任务转历史、记录办理人与完成时间、清除草稿、回写证照检验有效期与行驶证照片
                  </li>
                  <li>返回列表：自定义事件 + session 标记，列表自动刷新任务与草稿状态</li>
                </ul>

                <div className="ar-prd-h2">查看页「年审管理-查看」</div>
                <ul className="ar-prd-ul">
                  <li>历史行「查看」→ 带入任务 ID → 只读展示办结快照（布局同办理页）</li>
                  <li>不可编辑、不可再次提交；用于稽核与客服查询</li>
                </ul>

                <div className="ar-prd-h2">与小程序 / 证照的关系</div>
                <ul className="ar-prd-ul">
                  <li>任务生成、紧急程度、办理字段口径与 ONE-OS 小程序年审管理对齐</li>
                  <li>办结写回「证照管理」对应车牌的行驶证影像与检验有效期（全量覆盖）</li>
                </ul>
              </div>
            </Tabs.TabPane>

            <Tabs.TabPane tab="⚙️ 业务规则" key="rules">
              <div style={{ marginTop: 10 }}>
                <div className="ar-prd-h2" style={{ marginTop: 0 }}>数据与权限（上线预期）</div>
                <ul className="ar-prd-ul">
                  <li>任务主数据由后端按车辆检验有效期与运营状态下发；前端不手工造任务（原型含演示数据）</li>
                  <li>办理人、完成时间在提交时写入；历史列表可按办理人、完成时间筛选</li>
                  <li>执行率按自然月滚动，每月 1 日「下下月」窗口前移</li>
                  <li>专员仅看本人执行率；主管/管理员看团队全量</li>
                </ul>

                <div className="ar-prd-h2">原型演示说明</div>
                <ul className="ar-prd-ul">
                  <li>本地存储键：任务库 <Text code>oneos_ar_web_tasks_v1</Text>、草稿 <Text code>oneos_ar_operate_drafts_v1</Text></li>
                  <li>内置执行率样例车（车牌粤Y…）用于演示 6/7/8 月比例，合并进任务库且不与用户数据重复 ID</li>
                  <li>待办「粤B58888F」「沪A03561F」默认带草稿，演示「已保存」续填</li>
                </ul>
              </div>
            </Tabs.TabPane>

            <Tabs.TabPane tab="✅ 验收标准" key="accept">
              <div style={{ marginTop: 10 }}>
                <div className="ar-prd-h2" style={{ marginTop: 0 }}>功能验收清单</div>
                <ul className="ar-prd-ul">
                  <li>6 张 KPI 同一行展示；任务 KPI 可点击切换列表；执行率悬停显示已处理/本月任务数</li>
                  <li>筛选查询、Tag 关闭、重置行为正确；筛选不改变 KPI 数字</li>
                  <li>待办排序符合逾期优先规则；历史按完成时间倒序</li>
                  <li>办理 → 保存 → 列表「已保存」→ 续填 → 提交 → 进历史、标签消失、证照回写</li>
                  <li>历史「查看」只读；导出列与当前视图一致</li>
                  <li>退出运营车辆不出现在列表与统计中</li>
                  <li>专员/主管执行率口径符合 PRD，与列表筛选独立</li>
                </ul>

                <div className="ar-prd-h2">非功能</div>
                <ul className="ar-prd-ul">
                  <li>表格支持横向滚动与表头吸顶；空列表友好提示</li>
                  <li>KPI 卡片支持键盘 Enter 触发（待办三卡）</li>
                  <li>与办理/查看页 session 联动，返回后列表状态刷新</li>
                </ul>
              </div>
            </Tabs.TabPane>
          </Tabs>
        </div>
      </Modal>

    </div>
  );

  return App ? <App>{pageContent}</App> : pageContent;
};

if (typeof window !== 'undefined') {
  window.Component = Component;
}

export default Component;
