// 【重要】必须使用 const Component 作为组件变量名
// 业务管理 - 保险采购
// 模块：① 比价单（选车报价 → 保存 → 按最晚付费日临期/超期提醒 → 勾选提交采购审批）
//       ② 保单管理（一车一档台账，OCR/导入/逐条录入，与比价单不关联）
// 与车辆管理「保险状态」联动：交强险 + 商业险均存在且在有效期内为正常，否则异常（禁止交车）

const { useState, useMemo, useCallback, useRef } = React;
const moment = window.moment || window.dayjs;
const antd = window.antd;
const {
  Input,
  Select,
  Button,
  Card,
  Table,
  Badge,
  Tooltip,
  Modal,
  Tag,
  message,
  Popover,
  Alert,
  Checkbox,
  DatePicker,
  InputNumber,
  Space,
  Radio,
  Upload,
  Progress,
  Dropdown,
  Tabs,
} = antd;

const ANCHOR_TODAY = '2026-06-01';
const IPC_STORAGE_KEY = 'oneos_ipc_insurance_v1';
const IPC_COMPARE_SHEETS_KEY = 'oneos_ipc_compare_sheets_v1';
const IPC_POLICY_RECOGN_TASKS_KEY = 'oneos_ipc_policy_recogn_tasks_v2';
const IPC_INSURANCE_HISTORY_EDITS_KEY = 'oneos_ipc_insurance_history_edits_v1';
const IPC_EDIT_PLATE_KEY = 'oneos_ipc_edit_plate';
const NO_PLATE_LABEL = '暂无车牌';
const PROTO_COMPARE_CREATOR = '张明辉';

const INSURANCE_TYPE_ITEMS = [
  { key: 'compulsory', label: '交强', fullLabel: '交强险' },
  { key: 'commercial', label: '商业', fullLabel: '商业险' },
  { key: 'excess', label: '超赔', fullLabel: '超赔险' },
  { key: 'cargo', label: '货物', fullLabel: '货物险' },
  { key: 'driverAccident', label: '驾意', fullLabel: '驾意险' },
];

const CORE_INSURANCE_KEYS = ['compulsory', 'commercial'];
/** 比价单采购流程中视为「已占用比价单」的状态（审批中、审批通过；不含撤回、审批驳回） */
const ACTIVE_COMPARE_PROCUREMENT_STATUSES = ['submitted', 'approved'];

const normalizeCompareProcurementStatus = (status) => (
  status === 'completed' ? 'approved' : (status || 'none')
);

const isCompareProcurementSelectionDisabled = (status) => {
  const st = normalizeCompareProcurementStatus(status);
  return st === 'submitted' || st === 'approved';
};

/** 采购状态展示（撤回、审批驳回、审批通过由工作流回写，本页只读展示） */
const COMPARE_PROCUREMENT_STATUS_META = {
  none: { label: '未提交', color: 'default' },
  submitted: { label: '审批中', color: 'processing' },
  approved: { label: '审批通过', color: 'success' },
  withdrawn: { label: '撤回', color: 'default' },
  rejected: { label: '审批驳回', color: 'error' },
};

const renderCompareProcurementStatusTag = (status) => {
  const st = normalizeCompareProcurementStatus(status);
  const meta = COMPARE_PROCUREMENT_STATUS_META[st] || COMPARE_PROCUREMENT_STATUS_META.none;
  return <Tag color={meta.color} style={{ margin: 0, fontWeight: 600 }}>{meta.label}</Tag>;
};

/** KPI 临期/逾期弹窗：比价采购状态标签（与列表采购状态文案略有差异） */
const ALERT_COMPARE_PROCUREMENT_STATUS_META = {
  submitted: { label: '审批中', color: 'processing' },
  approved: { label: '审批完成', color: 'success' },
  withdrawn: { label: '撤回', color: 'default' },
  rejected: { label: '驳回', color: 'error' },
};

const COMPARE_PROCUREMENT_STATUS_PRIORITY = {
  submitted: 4,
  approved: 3,
  rejected: 2,
  withdrawn: 1,
};

const renderAlertCompareProcurementTag = (status) => {
  const st = normalizeCompareProcurementStatus(status);
  const meta = ALERT_COMPARE_PROCUREMENT_STATUS_META[st];
  if (!meta) return null;
  return <Tag color={meta.color} style={{ margin: 0, fontSize: 10, fontWeight: 600 }}>{meta.label}</Tag>;
};

const buildCompareProcurementStatusByVehicleType = (compareSheets) => {
  const map = new Map();
  (compareSheets || []).forEach((sheet) => {
    (sheet.rows || []).forEach((row) => {
      const key = buildCompareSubmissionKey(row, row.insuranceType);
      if (!key) return;
      const st = normalizeCompareProcurementStatus(row.procurementStatus);
      if (st === 'none') return;
      const prev = map.get(key);
      const prevP = prev ? (COMPARE_PROCUREMENT_STATUS_PRIORITY[prev] ?? 0) : 0;
      const nextP = COMPARE_PROCUREMENT_STATUS_PRIORITY[st] ?? 0;
      if (nextP >= prevP) map.set(key, st);
    });
  });
  return map;
};

const getCompareProcurementStatusForVehicleType = (vehicle, insuranceTypeLabel, statusMap) => {
  const key = buildCompareSubmissionKey(vehicle, insuranceTypeLabel);
  if (!key || !statusMap) return null;
  return statusMap.get(key) || null;
};

/** 工作流当前审批人样例（正式环境由审批流接口回写，非必填） */
const MOCK_WORKFLOW_CURRENT_APPROVERS = ['李专员', '王专员', '张明辉', '陈高伟', '赵六'];

const pickMockWorkflowCurrentApprover = (rowId) => {
  const hash = String(rowId || '').split('').reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
  return MOCK_WORKFLOW_CURRENT_APPROVERS[hash % MOCK_WORKFLOW_CURRENT_APPROVERS.length];
};
const INSURANCE_WARN_DAYS = 30;
/** 比价单：最晚付费日期 ≤ 该天数视为临期 */
const LATEST_PAY_WARN_DAYS = 3;

const INSURANCE_LABEL_TO_KEY = {
  交强险: 'compulsory',
  商业险: 'commercial',
  超赔险: 'excess',
  货物险: 'cargo',
  驾意险: 'driverAccident',
};

const INSURANCE_KEY_TO_LABEL = {
  compulsory: '交强险',
  commercial: '商业险',
  excess: '超赔险',
  cargo: '货物险',
  driverAccident: '驾意险',
};

const EXPIRING_WARN_TYPE_KEYS = INSURANCE_TYPE_ITEMS.map((item) => item.key);

const getVehicleInsuranceEndDate = (ledgerKey, typeKey, allInsurance) => {
  const item = allInsurance[ledgerKey]?.[typeKey];
  if (!item?.endDate || !item?.policyNo) return '';
  return item.endDate;
};

const compareInsuranceEndDate = (dateA, dateB, order) => {
  const av = dateA || '';
  const bv = dateB || '';
  if (!av && !bv) return 0;
  if (!av) return 1;
  if (!bv) return -1;
  const cmp = String(av).localeCompare(String(bv));
  return order === 'ascend' ? cmp : -cmp;
};

const POLICY_OCR_MODES = [
  { key: 'policy', label: '保单录入', desc: '选择险种后上传附件，自动识别保单要素并匹配台账' },
  { key: 'suspend', label: '停保', desc: '上传停保/停驶批单，识别保单号与车牌后停保' },
  { key: 'resume', label: '复驶', desc: '上传复驶批单，识别保单号、恢复时间与新到期日期' },
  { key: 'cancel', label: '退保', desc: '上传退保批单，识别保单号、退保时间与退保金额' },
];

const POLICY_BIZ_TYPE_OPTIONS = [
  { value: 'policy', label: '保单录入' },
  { value: 'suspend', label: '停租' },
  { value: 'resume', label: '复驶' },
  { value: 'cancel', label: '退保' },
];

const EMPTY_POLICY_DETAIL = {
  plateNo: '',
  vin: '',
  insuranceType: '交强险',
  bizType: 'policy',
  company: '',
  policyNo: '',
  endorsementNo: '',
  payTime: '',
  startDate: '',
  endDate: '',
  reinstateDate: '',
  premium: '',
  coverageItems: [],
  applicant: '',
  insured: '',
  vehicleOwner: '',
  signDate: '',
  suspendTime: '',
  resumeTime: '',
  newEndDate: '',
  cancelTime: '',
  attachments: [],
};

const EMPTY_COVERAGE_ITEM = {
  coverageName: '',
  coverageAmount: '',
  deductible: '',
  itemPremium: '',
};

/** 保单项目/责任限额：表单为结构化列表；导入/OCR/台账可为分号拼接文本 */
const parseCoverageItemsInput = (raw) => {
  if (Array.isArray(raw)) {
    return raw.map((s) => String(s ?? '').trim()).filter(Boolean);
  }
  const text = String(raw ?? '').trim();
  if (!text) return [];
  const segments = text.split(/[；;\n]+/).map((s) => s.trim()).filter(Boolean);
  const expanded = [];
  segments.forEach((part) => {
    const sub = part.split(/、/).map((s) => s.trim()).filter(Boolean);
    if (sub.length > 1 && part.length <= 120) {
      expanded.push(...sub);
    } else {
      expanded.push(part);
    }
  });
  return expanded;
};

const normalizeCoverageItem = (raw) => {
  if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
    return {
      coverageName: String(raw.coverageName ?? raw.name ?? '').trim(),
      coverageAmount: String(raw.coverageAmount ?? '').trim(),
      deductible: String(raw.deductible ?? '').trim(),
      itemPremium: String(raw.itemPremium ?? raw.premium ?? '').trim(),
    };
  }
  const text = String(raw ?? '').trim();
  return text ? { ...EMPTY_COVERAGE_ITEM, coverageName: text } : { ...EMPTY_COVERAGE_ITEM };
};

const normalizeCoverageItems = (raw) => {
  if (!raw) return [];
  if (Array.isArray(raw)) {
    return raw
      .map(normalizeCoverageItem)
      .filter((item) => item.coverageName || item.coverageAmount || item.deductible || item.itemPremium);
  }
  return parseCoverageItemsInput(raw).map((name) => ({ ...EMPTY_COVERAGE_ITEM, coverageName: name }));
};

const serializeCoverageItems = (items) => (
  normalizeCoverageItems(items).map((row) => {
    const parts = [
      row.coverageName,
      row.coverageAmount && `保额${row.coverageAmount}`,
      row.deductible && `免额${row.deductible}`,
      row.itemPremium && `保费${row.itemPremium}元`,
    ].filter(Boolean);
    return parts.join(' ');
  }).join('；')
);

const getCoverageItemsFormRows = (items) => {
  const list = normalizeCoverageItems(items);
  return list.length ? list.map((item) => ({ ...EMPTY_COVERAGE_ITEM, ...item })) : [{ ...EMPTY_COVERAGE_ITEM }];
};

const buildSampleCoverageItemsForRecognEdit = (insuranceType, premiumTotal) => {
  const total = (premiumTotal || '').trim();
  const samples = {
    交强险: [
      { coverageName: '死亡伤残赔偿', coverageAmount: '180000元', deductible: '—', itemPremium: '850.00' },
      { coverageName: '医疗费用赔偿', coverageAmount: '18000元', deductible: '—', itemPremium: '283.00' },
      { coverageName: '财产损失赔偿', coverageAmount: '2000元', deductible: '—', itemPremium: '110.00' },
    ],
    商业险: [
      { coverageName: '机动车损失险', coverageAmount: '350000元', deductible: '绝对免赔额500元', itemPremium: '5200.00' },
      { coverageName: '第三者责任险', coverageAmount: '2000000元', deductible: '—', itemPremium: '6100.00' },
      { coverageName: '车上人员责任险(司机)', coverageAmount: '20000元', deductible: '—', itemPremium: '850.00' },
      { coverageName: '车上人员责任险(乘客)', coverageAmount: '20000元/座', deductible: '—', itemPremium: '650.50' },
    ],
    超赔险: [
      { coverageName: '超赔责任险', coverageAmount: '10000000元', deductible: '—', itemPremium: '1200.00' },
      { coverageName: '附加超额第三者责任', coverageAmount: '5000000元', deductible: '—', itemPremium: '300.00' },
    ],
    货物险: [
      { coverageName: '公路货物运输定额保险', coverageAmount: '500000元', deductible: '每次事故免赔1000元', itemPremium: '1800.00' },
      { coverageName: '集装箱货物及其箱体', coverageAmount: '200000元', deductible: '—', itemPremium: '420.00' },
    ],
    驾意险: [
      { coverageName: '驾乘意外身故伤残', coverageAmount: '500000元/座', deductible: '—', itemPremium: '220.00' },
      { coverageName: '驾乘意外医疗', coverageAmount: '50000元/座', deductible: '免赔额100元', itemPremium: '160.00' },
    ],
  };
  const rows = (samples[insuranceType] || samples.交强险).map((row) => ({ ...EMPTY_COVERAGE_ITEM, ...row }));
  if (total && rows.length) {
    const sum = rows.reduce((acc, row) => acc + (parseFloat(row.itemPremium) || 0), 0);
    const target = parseFloat(total);
    if (!Number.isNaN(target) && sum > 0 && Math.abs(sum - target) > 0.01) {
      const last = rows[rows.length - 1];
      const adjust = (target - sum + (parseFloat(last.itemPremium) || 0)).toFixed(2);
      last.itemPremium = adjust;
    }
  }
  return rows;
};

const enrichPolicyDetailCoverageForEdit = (detail) => {
  const normalized = enrichSuspendPolicyDetail(detail);
  if (normalized.bizType === 'suspend') return normalized;
  const items = normalizeCoverageItems(normalized.coverageItems);
  const needsSample = !items.length || items.every((i) => !i.coverageAmount && !i.deductible && !i.itemPremium);
  if (needsSample) {
    return {
      ...normalized,
      coverageItems: buildSampleCoverageItemsForRecognEdit(normalized.insuranceType, normalized.premium),
    };
  }
  return { ...normalized, coverageItems: items };
};

/** 保单 OCR 识别不反写承保险种明细（保额/免赔/分项保费） */
const stripPolicyRecognCoverageFields = (detail) => {
  const d = normalizePolicyDetail(detail);
  return { ...d, coverageItems: [] };
};

/** 基于用户提供的真实保单/批单样本（PDF 解析 + 文件名） */
const REFERENCE_POLICY_OCR_MOCKS = [
  {
    test: (n) => /沪BDB9161.*交强险/i.test(n),
    detail: {
      plateNo: '沪BDB9161', vin: 'LC0DF4CD8S0303140', insuranceType: '交强险', bizType: 'policy',
      policyNo: 'ASHZ001CTP26B187065J', endorsementNo: 'DZQA26480000279515',
      company: '中国太平洋财产保险股份有限公司',
      payTime: '2026-06-01 17:42:10', signDate: '2026-05-27', startDate: '2026-06-05', endDate: '2027-06-04',
      premium: '1243.00',
      coverageItems: [
        { coverageName: '死亡伤残赔偿', coverageAmount: '180000元', deductible: '—', itemPremium: '850.00' },
        { coverageName: '医疗费用赔偿', coverageAmount: '18000元', deductible: '—', itemPremium: '283.00' },
        { coverageName: '财产损失赔偿', coverageAmount: '2000元', deductible: '—', itemPremium: '110.00' },
      ],
      applicant: '上海羚牛氢运物联网科技有限公司', insured: '上海羚牛氢运物联网科技有限公司',
      vehicleOwner: '上海羚牛氢运物联网科技有限公司',
    },
  },
  {
    test: (n) => /粤AGP9827.*商业险/i.test(n),
    detail: {
      plateNo: '粤AGP9827', insuranceType: '商业险', bizType: 'policy',
      policyNo: '2050AA330400260000GV', company: '紫金财产保险股份有限公司',
      payTime: '2026-05-28 10:00', startDate: '2026-06-06', endDate: '2027-05-27', premium: '12800',
      applicant: '羚牛运营（广东）', insured: '羚牛运营（广东）', vehicleOwner: '羚牛运营（广东）',
      coverageItems: [
        { coverageName: '机动车损失险', coverageAmount: '350000元', deductible: '绝对免赔额500元', itemPremium: '5200.00' },
        { coverageName: '第三者责任险', coverageAmount: '2000000元', deductible: '—', itemPremium: '6100.00' },
        { coverageName: '车上人员责任险', coverageAmount: '20000元/座', deductible: '—', itemPremium: '1500.00' },
      ],
    },
  },
  {
    test: (n) => /粤AGP3071.*驾意/i.test(n),
    detail: {
      plateNo: '粤AGP3071', insuranceType: '驾意险', bizType: 'policy',
      policyNo: 'JY2026AGP3071001', company: '中国平安财产保险股份有限公司',
      startDate: '2026-06-06', endDate: '2027-05-27', premium: '380.00',
      coverageItems: '驾乘意外险，每座身故伤残/医疗限额',
    },
  },
  {
    test: (n) => /粤AGR9766.*超赔/i.test(n),
    detail: {
      plateNo: '粤AGR9766', vin: 'LB9A32A21R0LS1478', insuranceType: '超赔险', bizType: 'policy',
      policyNo: '6260828000909X006408', company: '国任财产保险股份有限公司广州市番禺支公司',
      payTime: '2026-04-16 14:37:37', signDate: '2026-04-16', startDate: '2026-04-17', endDate: '2027-04-16',
      premium: '1500.00',
      coverageItems: '公路货物运输定额保险；累计赔偿限额10001000元；主险货物保险金额1000元',
      applicant: '羚牛氢能科技（广东）有限公司', insured: '羚牛氢能科技（广东）有限公司',
      vehicleOwner: '羚牛氢能科技（广东）有限公司',
    },
  },
  {
    test: (n) => /货物险|20208A330400240001QX/i.test(n),
    detail: {
      plateNo: '浙F05178F', insuranceType: '货物险', bizType: 'policy',
      policyNo: '20208A330400240001QX', company: '紫金财产保险股份有限公司',
      payTime: '2024-10-17 15:58:05', startDate: '2024-10-18', endDate: '2025-10-17', premium: '1500.00',
      coverageItems: '公路货物运输定额保险 CNY500000；集装箱货物及其箱体',
      applicant: '嘉兴羚牛汽车服务有限公司', insured: '嘉兴羚牛汽车服务有限公司',
      vehicleOwner: '嘉兴羚牛汽车服务有限公司',
    },
  },
  {
    test: (n) => /粤A03423F.*停驶/i.test(n),
    detail: {
      plateNo: '粤A03423F', insuranceType: '商业险', bizType: 'suspend',
      policyNo: '2050AA3304002600002EM', endorsementNo: '3050AA3304002600002EM01',
      company: '紫金财产保险股份有限公司', payTime: '2026-04-16 16:13:53',
      startDate: '2026-04-17', endDate: '2027-03-31', reinstateDate: '2027-03-31',
      suspendTime: '2026-04-17', resumeTime: '2027-03-31', newEndDate: '2027-03-31',
      coverageItems: '停驶批单：保险车辆停驶，停驶期间保险责任中止',
    },
  },
  {
    test: (n) => /粤A06290F.*复驶/i.test(n),
    detail: {
      plateNo: '粤A06290F', insuranceType: '商业险', bizType: 'resume',
      policyNo: '2050AA33040026000226', endorsementNo: '3050AA3304002600022602',
      company: '紫金财产保险股份有限公司', payTime: '2026-04-30 14:25:43',
      resumeTime: '2026-05-06', newEndDate: '2027-03-27',
      startDate: '2026-05-06', endDate: '2027-03-27', reinstateDate: '2026-05-06',
      coverageItems: '复驶批单：停驶车辆恢复行驶，保险责任自复驶日起恢复',
    },
  },
  {
    test: (n) => /浙F03220F.*复驶|BSHZ001S2024B005477B/i.test(n),
    detail: {
      plateNo: '浙F03220F', insuranceType: '商业险', bizType: 'resume',
      policyNo: 'BSHZ001S2024B005477B', endorsementNo: 'BSHZ001S2024B005477E',
      company: '中国太平洋财产保险股份有限公司',
      resumeTime: '2026-05-01', newEndDate: '2027-04-30',
      startDate: '2026-05-01', endDate: '2027-04-30',
      coverageItems: '复驶批单',
    },
  },
  {
    test: (n) => /沪A06192F.*停保|BSHZ001S2024B005054V/i.test(n),
    detail: {
      plateNo: '沪A06192F', insuranceType: '商业险', bizType: 'suspend',
      policyNo: 'BSHZ001S2024B005054V', endorsementNo: 'BSHZ001S2024B005054E',
      company: '中国太平洋财产保险股份有限公司', startDate: '2025-12-05', endDate: '2026-03-05',
      reinstateDate: '2026-06-01', suspendTime: '2025-12-05', resumeTime: '2026-06-01', newEndDate: '2026-03-05',
      coverageItems: '停保批单',
    },
  },
  {
    test: (n) => /粤A03331F.*退保/i.test(n),
    detail: {
      plateNo: '粤A03331F', insuranceType: '商业险', bizType: 'cancel',
      policyNo: '2050AA330400260000GV', endorsementNo: '3050AA330400260000GV02',
      company: '紫金财产保险股份有限公司', payTime: '2026-05-27 17:51:20',
      cancelTime: '2026-05-28', startDate: '2026-05-28', endDate: '2026-05-28', premium: '7853.27',
      coverageItems: '商业险退保批单，退还保费',
    },
  },
  {
    test: (n) => /粤AGR0772.*停保/i.test(n),
    detail: {
      plateNo: '粤AGR0772', insuranceType: '商业险', bizType: 'suspend',
      policyNo: 'PAIC-SY-AGR0772-2025', company: '中国平安财产保险股份有限公司',
      startDate: '2025-12-05', endDate: '2026-03-05', reinstateDate: '2026-06-01',
      suspendTime: '2025-12-05', resumeTime: '2026-06-01', newEndDate: '2026-03-05',
      coverageItems: '商业险停保',
    },
  },
];

const normalizePolicyDetail = (raw = {}) => ({
  ...EMPTY_POLICY_DETAIL,
  ...raw,
  plateNo: (raw.plateNo || '').trim(),
  vin: (raw.vin || '').trim(),
  insuranceType: raw.insuranceType || '交强险',
  bizType: raw.bizType || 'policy',
  coverageItems: normalizeCoverageItems(raw.coverageItems),
});

const enrichSuspendPolicyDetail = (raw = {}) => {
  const d = normalizePolicyDetail(raw);
  if (d.bizType !== 'suspend') return d;
  const suspendTime = (d.suspendTime || d.startDate || '').trim();
  const resumeTime = (d.resumeTime || d.reinstateDate || '').trim();
  const newEndDate = (d.newEndDate || d.endDate || '').trim();
  return {
    ...d,
    suspendTime,
    resumeTime,
    newEndDate,
    startDate: suspendTime || d.startDate,
    reinstateDate: resumeTime || d.reinstateDate,
    endDate: newEndDate || d.endDate,
  };
};

const enrichResumePolicyDetail = (raw = {}) => {
  const d = normalizePolicyDetail(raw);
  if (d.bizType !== 'resume') return d;
  const resumeTime = (d.resumeTime || d.reinstateDate || d.startDate || '').trim();
  const newEndDate = (d.newEndDate || d.endDate || '').trim();
  return {
    ...d,
    resumeTime,
    newEndDate,
    reinstateDate: resumeTime || d.reinstateDate,
    endDate: newEndDate || d.endDate,
    startDate: resumeTime || d.startDate,
  };
};

const enrichCancelPolicyDetail = (raw = {}) => {
  const d = normalizePolicyDetail(raw);
  if (d.bizType !== 'cancel') return d;
  const cancelTime = (d.cancelTime || d.startDate || d.endDate || '').trim();
  const refundAmount = String(d.premium || '').trim();
  return {
    ...d,
    cancelTime,
    startDate: cancelTime || d.startDate,
    endDate: cancelTime || d.endDate,
    premium: refundAmount || d.premium || '',
  };
};

const SUSPEND_RECOGN_FORM_REQUIRED_KEYS = [
  'policyNo',
  'suspendTime',
  'newEndDate',
];

const RESUME_RECOGN_FORM_REQUIRED_KEYS = [
  'policyNo',
  'resumeTime',
  'newEndDate',
];

const CANCEL_RECOGN_FORM_REQUIRED_KEYS = [
  'policyNo',
  'cancelTime',
  'premium',
];

const renderSuspendTooltipTitle = (recordOrItem) => {
  if (!recordOrItem) return null;
  const detail = recordOrItem.policyDetail || {};
  const suspendTime = recordOrItem.suspendTime || detail.suspendTime || detail.startDate || recordOrItem.startDate || '';
  const resumeTime = recordOrItem.resumeTime || detail.resumeTime || detail.reinstateDate || recordOrItem.reinstateDate || '';
  const newEndDate = recordOrItem.newEndDate || detail.newEndDate || recordOrItem.endDate || detail.endDate || '';
  return (
    <div style={{ lineHeight: 1.65, fontSize: 12 }}>
      <div>中止时间：{suspendTime || '—'}</div>
      <div>恢复时间：{resumeTime || '—'}</div>
      <div>新到期日期：{newEndDate || '—'}</div>
    </div>
  );
};

const inferPolicyDetailFromFileName = (fileName) => {
  const name = fileName || '';
  const plateMatch = name.match(/[京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼][A-Z][A-Z0-9]{4,6}[A-Z0-9挂学警港澳]?/i);
  const plateNo = plateMatch ? plateMatch[0].toUpperCase() : '';
  let insuranceType = '交强险';
  if (/商业险|商业/.test(name)) insuranceType = '商业险';
  else if (/超赔/.test(name)) insuranceType = '超赔险';
  else if (/驾意/.test(name)) insuranceType = '驾意险';
  else if (/货物/.test(name)) insuranceType = '货物险';
  else if (/交强/.test(name)) insuranceType = '交强险';
  let bizType = 'policy';
  if (/停驶|停保/.test(name)) bizType = 'suspend';
  else if (/复驶/.test(name)) bizType = 'resume';
  else if (/退保/.test(name)) bizType = 'cancel';
  const policyNoMatch = name.match(/BSHZ\d+[A-Z0-9]+|ASHZ\d+[A-Z0-9]+|202\d{2}A\d+QX|2050AA\d+[A-Z0-9]+|6260\d+X\d+/i);
  const rangeMatch = name.match(/(\d{4})[.\-](\d{1,2})[.\-](\d{1,2})/);
  let startDate = '';
  let endDate = '';
  if (rangeMatch) {
    const y = rangeMatch[1];
    const m = String(rangeMatch[2]).padStart(2, '0');
    const d = String(rangeMatch[3]).padStart(2, '0');
    startDate = `${y}-${m}-${d}`;
    const parts = name.match(/(\d{4})[.\-](\d{1,2})[.\-](\d{1,2}).*?(\d{4})[.\-](\d{1,2})[.\-](\d{1,2})/);
    if (parts) {
      endDate = `${parts[4]}-${String(parts[5]).padStart(2, '0')}-${String(parts[6]).padStart(2, '0')}`;
    }
  }
  return normalizePolicyDetail({
    plateNo,
    insuranceType,
    bizType,
    policyNo: policyNoMatch ? policyNoMatch[0] : '',
    startDate,
    endDate,
  });
};

const resolvePolicyDetailFromFileName = (fileName) => {
  const ref = REFERENCE_POLICY_OCR_MOCKS.find((m) => m.test(fileName));
  if (ref) {
    if (ref.detail.bizType === 'suspend') return enrichSuspendPolicyDetail(ref.detail);
    if (ref.detail.bizType === 'resume') return enrichResumePolicyDetail(ref.detail);
    if (ref.detail.bizType === 'cancel') return enrichCancelPolicyDetail(ref.detail);
    return normalizePolicyDetail(ref.detail);
  }
  return inferPolicyDetailFromFileName(fileName);
};

const bizTypeToRecognMode = (bizType) => (
  bizType === 'suspend' ? 'suspend' : bizType === 'resume' ? 'resume' : bizType === 'cancel' ? 'cancel' : 'policy'
);

/** 任务级 mode 与单条 result.recognMode 合并，停保/复驶/退保任务优先于 result 内嵌字段 */
const resolvePolicyRecognEffectiveMode = (taskMode, result) => {
  if (result?.recognMode && result.recognMode !== 'policy') return result.recognMode;
  if (taskMode && taskMode !== 'policy') return taskMode;
  return bizTypeToRecognMode(result?.ocrBizType || result?.policyDetail?.bizType);
};

const POLICY_RECOGN_CONFIRM_HINT = {
  policy: '左侧预览保单原件，右侧核对识别反写的车牌、车主、投保人、被保险人、保险公司、保单号、收费确认时间、生效/到期日期及保险费合计；带 * 为必填项。',
  suspend: '左侧预览停保批单原件，右侧核对「保单号」「中止时间」「恢复时间」「新到期日期」；带 * 为必填项。确认后新到期日期将写入台账该保单的到期日期。',
  resume: '左侧预览复驶批单原件，右侧核对「保单号」「恢复时间」「新到期日期」；带 * 为必填项。确认后新到期日期将写入台账该保单的到期日期。',
  cancel: '左侧预览退保批单原件，右侧核对「保单号」「退保时间」「退保金额」；带 * 为必填项。',
};

const applyPolicyDetailToInsuranceItem = (item, detail, mode) => {
  const d = normalizePolicyDetail(detail);
  const next = { ...item };
  next.company = d.company || next.company;
  next.policyNo = d.policyNo || next.policyNo;
  next.endorsementNo = d.endorsementNo || next.endorsementNo || '';
  next.startDate = d.startDate || next.startDate;
  next.endDate = d.endDate || next.endDate;
  next.premium = d.premium || next.premium;
  next.payTime = d.payTime || next.payTime || '';
  next.signDate = d.signDate || next.signDate || '';
  next.coverageItems = serializeCoverageItems(d.coverageItems) || next.coverageItems || '';
  next.applicant = d.applicant || next.applicant || '';
  next.insured = d.insured || next.insured || '';
  next.vehicleOwner = d.vehicleOwner || next.vehicleOwner || '';
  if (Array.isArray(d.attachments)) {
    next.attachments = d.attachments;
  }
  if (mode === 'policy') {
    next.policyTag = '';
    next.reinstateDate = '';
  } else if (mode === 'suspend') {
    const suspendTime = (d.suspendTime || d.startDate || '').trim();
    const resumeTime = (d.resumeTime || d.reinstateDate || '').trim();
    const newEndDate = (d.newEndDate || d.endDate || '').trim();
    next.policyTag = 'suspended';
    next.suspendTime = suspendTime;
    next.resumeTime = resumeTime;
    next.reinstateDate = resumeTime || next.reinstateDate || '';
    if (newEndDate) next.endDate = newEndDate;
  } else if (mode === 'resume') {
    const resumeTime = (d.resumeTime || d.reinstateDate || '').trim();
    const newEndDate = (d.newEndDate || d.endDate || '').trim();
    next.policyTag = '';
    next.resumeTime = resumeTime;
    next.reinstateDate = resumeTime || next.reinstateDate || '';
    if (newEndDate) next.endDate = newEndDate;
  } else if (mode === 'cancel') {
    const cancelTime = (d.cancelTime || d.startDate || d.endDate || '').trim();
    next.policyTag = 'cancelled';
    next.reinstateDate = '';
    next.cancelTime = cancelTime;
    if (d.premium) next.premium = normalizeRecognPremiumAmount(d.premium) || d.premium;
  }
  return next;
};

const createPolicyRecognTaskId = () => `TASK-${Date.now().toString().slice(-8)}`;

const isPolicyRecognImageOrPdf = (file) => {
  const name = (file?.name || '').toLowerCase();
  const type = (file?.type || '').toLowerCase();
  return type.includes('pdf') || type.startsWith('image/') || /\.(pdf|png|jpe?g|webp|bmp|gif|tiff?)$/i.test(name);
};

const isPolicyImportExcelFile = (file) => {
  const name = (file?.name || '').toLowerCase();
  const type = (file?.type || '').toLowerCase();
  return /\.(csv|xlsx|xls)$/i.test(name)
    || type.includes('csv')
    || type.includes('spreadsheet')
    || type.includes('excel');
};

/** 新增/续保录入必填项（车牌与 VIN 至少填一项；承保险种明细非必填） */
const POLICY_ENTRY_REQUIRED_FIELDS = [
  { key: 'insuranceType', label: '险种' },
  { key: 'company', label: '保险公司' },
  { key: 'policyNo', label: '保单号' },
  { key: 'startDate', label: '生效日期' },
  { key: 'endDate', label: '到期日期' },
  { key: 'premium', label: '保险费合计' },
];

const POLICY_ENTRY_FORM_REQUIRED_KEYS = [
  'plateNo',
  ...POLICY_ENTRY_REQUIRED_FIELDS.map((item) => item.key),
];

const validatePolicyEntryDetail = (detail, options = {}) => {
  const d = normalizePolicyDetail(detail);
  const { silent = false, rowIndex } = options;
  const rowPrefix = rowIndex != null ? `第 ${rowIndex} 行：` : '';
  if (!d.plateNo && !d.vin) {
    if (!silent) message.warning(`${rowPrefix}车牌号与 VIN 至少填一项`);
    return { ok: false, label: '车牌号或 VIN' };
  }
  const missing = POLICY_ENTRY_REQUIRED_FIELDS.find(({ key }) => !String(d[key] || '').trim());
  if (missing) {
    if (!silent) message.warning(`${rowPrefix}请填写${missing.label}`);
    return { ok: false, label: missing.label };
  }
  return { ok: true };
};

/** 批量导入模板列：与「新增保单」表单一致，仅用于新增/续保；带 * 为必填 */
const POLICY_IMPORT_TEMPLATE_COLUMNS = [
  { header: '车牌号', key: 'plateNo', required: true, sample: '沪BDB9161' },
  { header: 'VIN码', key: 'vin', required: false, sample: 'LC0DF4CD8S0303140' },
  { header: '险种', key: 'insuranceType', required: true, sample: '交强险' },
  { header: '保险公司', key: 'company', required: true, sample: '中国太平洋财产保险股份有限公司' },
  { header: '保单号', key: 'policyNo', required: true, sample: 'ASHZ001CTP26B187065J' },
  { header: '批单号', key: 'endorsementNo', required: false, sample: '' },
  { header: '付款时间', key: 'payTime', required: false, sample: '2026-06-01 17:42:10' },
  { header: '签单日期', key: 'signDate', required: false, sample: '2026-05-27' },
  { header: '生效日期', key: 'startDate', required: true, sample: '2026-06-05' },
  { header: '到期日期', key: 'endDate', required: true, sample: '2027-06-04' },
  { header: '保险费合计', key: 'premium', required: true, sample: '1243.00' },
  { header: '投保人', key: 'applicant', required: false, sample: '上海羚牛氢运物联网科技有限公司' },
  { header: '被保险人', key: 'insured', required: false, sample: '上海羚牛氢运物联网科技有限公司' },
  { header: '承保险种', key: 'coverageName', required: false, sample: '机动车第三者责任险' },
  { header: '保险金额', key: 'coverageAmount', required: false, sample: '2000000元' },
  { header: '保险金额/责任免额', key: 'coverageDeductible', required: false, sample: '绝对免赔额500元' },
  { header: '保险费', key: 'coveragePremium', required: false, sample: '1280.00' },
];

const POLICY_IMPORT_TEMPLATE_HEADERS = POLICY_IMPORT_TEMPLATE_COLUMNS.map((col) => (
  col.required ? `${col.header}*` : col.header
));
const POLICY_IMPORT_TEMPLATE_SAMPLE_ROW = POLICY_IMPORT_TEMPLATE_COLUMNS.map((col) => col.sample);

const POLICY_IMPORT_HEADER_ALIASES = {
  车牌: 'plateNo',
  VIN: 'vin',
  车辆识别代码: 'vin',
  保险类型: 'insuranceType',
  生效日: 'startDate',
  生效时间: 'startDate',
  起保日期: 'startDate',
  到期日: 'endDate',
  到期时间: 'endDate',
  '保费(元)': 'premium',
  保费: 'premium',
  保单项目: 'coverageItems',
  责任免额: 'coverageDeductible',
};

const finalizePolicyImportRow = (row) => {
  const coverageName = (row.coverageName || '').trim();
  const coverageAmount = (row.coverageAmount || '').trim();
  const coverageDeductible = (row.coverageDeductible || '').trim();
  const coveragePremium = (row.coveragePremium || '').trim();
  let coverageItems = row.coverageItems;
  if (coverageName || coverageAmount || coverageDeductible || coveragePremium) {
    coverageItems = [{
      coverageName,
      coverageAmount,
      deductible: coverageDeductible,
      itemPremium: coveragePremium,
    }];
  }
  const {
    coverageName: _coverageName,
    coverageAmount: _coverageAmount,
    coverageDeductible: _coverageDeductible,
    coveragePremium: _coveragePremium,
    ...rest
  } = row;
  return normalizePolicyDetail({ ...rest, coverageItems });
};

const downloadPolicyImportTemplate = () => {
  const escapeCsvCell = (val) => {
    const s = String(val ?? '');
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const csv = `\uFEFF${[
    POLICY_IMPORT_TEMPLATE_HEADERS.map(escapeCsvCell).join(','),
    POLICY_IMPORT_TEMPLATE_SAMPLE_ROW.map(escapeCsvCell).join(','),
  ].join('\n')}`;
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = '保单新增续保导入模板.csv';
  a.click();
  URL.revokeObjectURL(url);
};

const parseCsvLine = (line) => {
  const result = [];
  let cur = '';
  let inQuote = false;
  for (let i = 0; i < line.length; i += 1) {
    const c = line[i];
    if (c === '"') {
      inQuote = !inQuote;
      continue;
    }
    if (c === ',' && !inQuote) {
      result.push(cur.trim());
      cur = '';
      continue;
    }
    cur += c;
  }
  result.push(cur.trim());
  return result;
};

const normalizeImportHeaderKey = (header) => {
  const h = String(header || '').trim().replace(/^\uFEFF/, '').replace(/\*+$/, '');
  const fromColumns = POLICY_IMPORT_TEMPLATE_COLUMNS.find((col) => col.header === h)?.key;
  if (fromColumns) return fromColumns;
  if (h === '业务类型') return 'bizTypeLabel';
  return POLICY_IMPORT_HEADER_ALIASES[h] || null;
};

const POLICY_IMPORT_SKIP_BIZ_LABELS = new Set(['停保', '停租', '复驶', '退保']);

const parsePolicyImportFileText = (text) => {
  const lines = String(text || '').split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (!lines.length) return [];
  const headerCells = parseCsvLine(lines[0]);
  const colIndex = {};
  headerCells.forEach((cell, idx) => {
    const key = normalizeImportHeaderKey(cell);
    if (key) colIndex[key] = idx;
  });
  const hasHeader = Object.keys(colIndex).length >= 3;
  const dataLines = hasHeader ? lines.slice(1) : lines;
  const fallbackIndexByKey = Object.fromEntries(
    POLICY_IMPORT_TEMPLATE_COLUMNS.map((col, idx) => [col.key, idx])
  );
  const pick = (cells, key) => {
    if (hasHeader && colIndex[key] != null) return (cells[colIndex[key]] || '').trim();
    const idx = fallbackIndexByKey[key];
    return idx != null ? (cells[idx] || '').trim() : '';
  };
  return dataLines.map((line) => {
    const cells = parseCsvLine(line);
    if (!cells.some((c) => c)) return null;
    const bizLabel = pick(cells, 'bizTypeLabel');
    if (bizLabel && POLICY_IMPORT_SKIP_BIZ_LABELS.has(bizLabel)) return null;
    const row = { bizType: 'policy' };
    POLICY_IMPORT_TEMPLATE_COLUMNS.forEach((col) => {
      row[col.key] = pick(cells, col.key);
    });
    if (!row.coverageItems) {
      row.coverageItems = pick(cells, 'coverageItems');
    }
    return finalizePolicyImportRow(row);
  }).filter(Boolean);
};

const validatePolicyImportRows = (rows) => {
  for (let i = 0; i < (rows || []).length; i += 1) {
    const result = validatePolicyEntryDetail(rows[i], { silent: true, rowIndex: i + 1 });
    if (!result.ok) {
      message.error(`第 ${i + 1} 行缺少必填项：${result.label}`);
      return false;
    }
  }
  return true;
};

const resolveImportRowLedgerKey = (row) => {
  const plate = (row?.plateNo || '').trim();
  const vin = (row?.vin || '').trim();
  if (plate) {
    const v = findVehicleByPlate(plate);
    if (v) return getVehicleLedgerKey(v);
  }
  if (vin) {
    const v = findVehicleByVin(vin);
    if (v) return getVehicleLedgerKey(v);
  }
  return null;
};

const isImportRowLedgerMatched = (ledgerKey) => (
  !!ledgerKey && MOCK_VEHICLES.some((v) => getVehicleLedgerKey(v) === ledgerKey)
);

const buildRecognResultFromDetail = (fileMeta, detail, allInsurance, forcedMode) => {
  const mode = forcedMode || bizTypeToRecognMode(detail.bizType);
  const raw = mode === 'suspend'
    ? enrichSuspendPolicyDetail(detail)
    : mode === 'resume'
      ? enrichResumePolicyDetail(detail)
      : mode === 'cancel'
        ? enrichCancelPolicyDetail(detail)
        : normalizePolicyDetail(detail);
  const d = mode === 'policy' ? stripPolicyRecognCoverageFields(raw) : raw;
  const plate = d.plateNo;
  const vin = d.vin;
  const vehicle = (plate && findVehicleByPlate(plate))
    || (vin && findVehicleByVin(vin))
    || { plateNo: plate, vin };
  let ledgerKey = resolveImportRowLedgerKey({ plateNo: plate, vin })
    || (plate ? getVehicleLedgerKey(vehicle) : '')
    || (vin ? getVehicleLedgerKey(vehicle) : '');
  let typeKey = INSURANCE_LABEL_TO_KEY[d.insuranceType];
  const record = ledgerKey ? allInsurance[ledgerKey] : null;
  let existing = typeKey && record ? record[typeKey] : null;
  if (mode !== 'policy' && d.policyNo) {
    const policyMatch = findPolicyMatchAcrossLedger(allInsurance, d.policyNo)
      || (ledgerKey ? findPolicyMatchInLedger(allInsurance, ledgerKey, d.policyNo) : null);
    if (policyMatch) {
      if (policyMatch.ledgerKey) ledgerKey = policyMatch.ledgerKey;
      typeKey = policyMatch.typeKey;
      existing = policyMatch.item;
    }
  }
  const typeLabel = INSURANCE_TYPE_ITEMS.find((it) => it.key === typeKey)?.fullLabel || d.insuranceType || '—';
  const ocrPolicyNo = d.policyNo || existing?.policyNo || '';
  let ocrEndDate = (
    mode === 'suspend' || mode === 'resume'
      ? (d.newEndDate || d.endDate)
      : d.endDate
  ) || existing?.endDate || '';
  let reinstateDate = d.resumeTime || d.reinstateDate || '';
  if (!ocrEndDate) {
    if (mode === 'suspend' || mode === 'cancel') ocrEndDate = ANCHOR_TODAY;
    else if (mode === 'resume') ocrEndDate = '2027-06-30';
    else ocrEndDate = '2027-12-31';
  }
  const matched = (mode === 'suspend' || mode === 'resume' || mode === 'cancel')
    ? !!ledgerKey && !!typeKey && !!ocrPolicyNo
    : isImportRowLedgerMatched(ledgerKey) && !!typeKey && !!(ocrPolicyNo || ocrEndDate);
  const matchTip = matched
    ? ((mode === 'suspend' || mode === 'resume' || mode === 'cancel') ? '已匹配台账保单，可核对后确认' : '已与台账车辆、险种匹配，可核对后确认')
    : (mode === 'suspend' || mode === 'resume' || mode === 'cancel')
      ? (!ocrPolicyNo ? '请填写保单号' : '未匹配到台账保单，请检查保单号')
      : !ledgerKey
        ? '未匹配到台账车辆，请检查车牌或 VIN'
        : !typeKey
          ? '险种填写有误'
          : '请填写保单号或到期日期';
  const bizLabel = POLICY_BIZ_TYPE_OPTIONS.find((o) => o.value === d.bizType)?.label || '保单录入';
  const companyResolve = mode === 'policy'
    ? resolveInsuranceCompanyFromOcr(d.company)
    : { company: d.company || existing?.company || '', candidates: [] };
  const ocrRecognizedPlate = String(plate || '').trim().toUpperCase();
  return {
    id: fileMeta.id || `ocr-r-${Date.now()}`,
    fileUid: fileMeta.fileUid || fileMeta.uid || `f-${Date.now()}`,
    fileName: fileMeta.fileName || fileMeta.name || '导入记录',
    fileType: fileMeta.fileType || '',
    policyDetail: d,
    ocrPlateNo: (vehicle.plateNo || plate || '').trim(),
    ocrRecognizedPlate,
    ocrVin: vehicle.vin || vin || '',
    displayPlate: formatVehiclePlateDisplay(vehicle.plateNo || plate),
    ocrPolicyNo,
    ocrEndDate,
    ocrStartDate: d.startDate || '',
    ocrPremium: d.premium || '',
    ocrPayTime: d.payTime || '',
    ocrEndorsementNo: d.endorsementNo || '',
    ocrCoverageItems: mode === 'policy' ? '' : serializeCoverageItems(d.coverageItems),
    ocrBizType: d.bizType,
    ocrBizTypeLabel: bizLabel,
    ocrCompany: mode === 'policy' ? companyResolve.company : (d.company || existing?.company || ''),
    ocrCompanyRaw: d.company || '',
    companyCandidates: companyResolve.candidates,
    ocrVehicleOwner: d.vehicleOwner || '',
    ocrApplicant: d.applicant || '',
    ocrInsured: d.insured || '',
    reinstateDate,
    suspendTime: d.suspendTime || d.startDate || '',
    resumeTime: d.resumeTime || d.reinstateDate || '',
    newEndDate: d.newEndDate || d.endDate || '',
    cancelTime: d.cancelTime || d.startDate || d.endDate || '',
    ledgerKey: ledgerKey || '',
    typeKey: typeKey || '',
    insuranceTypeLabel: typeLabel,
    matched,
    matchTip,
    recognSuccess: true,
    confirmed: false,
    recognMode: mode,
  };
};

const buildImportResultsFromRows = (rows, allInsurance) => (
  (rows || []).map((row, idx) => buildRecognResultFromDetail(
    { id: `import-r-${idx}-${Date.now()}`, fileUid: `import-row-${idx}`, fileName: `导入_${row.plateNo || row.vin || `第${idx + 1}行`}.csv`, fileType: 'text/csv' },
    normalizePolicyDetail(row),
    allInsurance
  ))
);

const readPolicyImportFileAsText = (file) => new Promise((resolve, reject) => {
  const name = (file?.name || '').toLowerCase();
  if (/\.(xlsx|xls)$/i.test(name)) {
    message.warning('当前原型请使用 CSV 模板（在 Excel 中打开模板后另存为 CSV UTF-8 再上传）');
    resolve('');
    return;
  }
  const reader = new FileReader();
  reader.onload = (e) => resolve(String(e?.target?.result || ''));
  reader.onerror = () => reject(new Error('read failed'));
  reader.readAsText(file, 'UTF-8');
});

const findPolicyMatchInLedger = (allInsurance, ledgerKey, policyNo) => {
  const record = allInsurance?.[ledgerKey];
  if (!record || !policyNo) return null;
  for (let i = 0; i < INSURANCE_TYPE_ITEMS.length; i += 1) {
    const item = INSURANCE_TYPE_ITEMS[i];
    if (record[item.key]?.policyNo === policyNo) {
      return { typeKey: item.key, item: record[item.key], label: item.fullLabel };
    }
  }
  return null;
};

const findPolicyMatchAcrossLedger = (allInsurance, policyNo) => {
  if (!policyNo) return null;
  const keys = Object.keys(allInsurance || {});
  for (let i = 0; i < keys.length; i += 1) {
    const ledgerKey = keys[i];
    const match = findPolicyMatchInLedger(allInsurance, ledgerKey, policyNo);
    if (match) return { ledgerKey, ...match };
  }
  return null;
};

const buildMockOcrResults = (files, mode, insuranceTypeLabel, allInsurance) => (
  (files || []).filter((f) => f.status === 'done').map((file, idx) => {
    const fromFile = resolvePolicyDetailFromFileName(file.name);
    const detail = normalizePolicyDetail({
      ...fromFile,
      insuranceType: mode === 'policy' ? (insuranceTypeLabel || fromFile.insuranceType) : fromFile.insuranceType,
      bizType: mode !== 'policy' ? mode : (fromFile.bizType || 'policy'),
    });
    if (!detail.plateNo && !detail.vin) {
      const vehicle = MOCK_VEHICLES[idx % MOCK_VEHICLES.length] || {};
      detail.plateNo = vehicle.plateNo || '';
      detail.vin = vehicle.vin || '';
    }
    if (!detail.policyNo) {
      detail.policyNo = `PDZA${String(20260000 + idx)}`;
    }
    if (mode === 'policy') {
      Object.assign(detail, stripPolicyRecognCoverageFields(detail));
      if (!detail.premium) {
        detail.premium = detail.insuranceType === '交强险' ? '1243.00' : '12800.00';
      }
    }
    if (mode === 'suspend') {
      Object.assign(detail, enrichSuspendPolicyDetail(detail));
    }
    if (mode === 'resume') {
      Object.assign(detail, enrichResumePolicyDetail(detail));
    }
    if (mode === 'cancel') {
      Object.assign(detail, enrichCancelPolicyDetail(detail));
    }
    const result = buildRecognResultFromDetail(
      { id: `ocr-r-${file.uid}`, fileUid: file.uid, fileName: file.name, fileType: file.type || '' },
      detail,
      allInsurance,
      mode
    );
    if (files.length >= 2 && idx === files.length - 1) {
      return {
        ...result,
        recognSuccess: false,
        matched: false,
        matchTip: 'OCR 识别失败，请检查文件清晰度或重新上传',
      };
    }
    return result;
  })
);

const recognResultToPolicyDetail = (result, taskMode = 'policy') => {
  const mode = resolvePolicyRecognEffectiveMode(taskMode, result);
  const pd = result.policyDetail || {};
  const merged = {
    plateNo: (result.ocrPlateNo || pd.plateNo || '').trim(),
    vin: (result.ocrVin || pd.vin || '').trim(),
    insuranceType: result.insuranceTypeLabel || pd.insuranceType || '交强险',
    bizType: mode !== 'policy' ? mode : (result.ocrBizType || pd.bizType || 'policy'),
    company: result.ocrCompany || pd.company || '',
    policyNo: result.ocrPolicyNo || pd.policyNo || '',
    endorsementNo: result.ocrEndorsementNo || pd.endorsementNo || '',
    payTime: result.ocrPayTime || pd.payTime || '',
    startDate: result.ocrStartDate || pd.startDate || '',
    endDate: result.ocrEndDate || pd.endDate || '',
    reinstateDate: result.reinstateDate || pd.reinstateDate || '',
    suspendTime: result.suspendTime || pd.suspendTime || '',
    resumeTime: result.resumeTime || pd.resumeTime || '',
    newEndDate: result.newEndDate || pd.newEndDate || '',
    cancelTime: result.cancelTime || pd.cancelTime || '',
    premium: result.ocrPremium || pd.premium || '',
    coverageItems: mode === 'policy'
      ? []
      : normalizeCoverageItems(pd.coverageItems ?? result.ocrCoverageItems),
    applicant: result.ocrApplicant || pd.applicant || '',
    insured: result.ocrInsured || pd.insured || '',
    vehicleOwner: result.ocrVehicleOwner || pd.vehicleOwner || '',
    signDate: pd.signDate || '',
    attachments: pd.attachments || [],
  };
  if (mode === 'suspend') return enrichSuspendPolicyDetail(merged);
  if (mode === 'resume') return enrichResumePolicyDetail(merged);
  if (mode === 'cancel') return enrichCancelPolicyDetail(merged);
  return normalizePolicyDetail(merged);
};

const buildPolicyRecognConfirmDraft = (result, taskMode = 'policy') => {
  const mode = resolvePolicyRecognEffectiveMode(taskMode, result);
  const detail = recognResultToPolicyDetail(result, taskMode);
  if (mode === 'suspend') {
    return enrichSuspendPolicyDetail({ ...detail, bizType: 'suspend' });
  }
  if (mode === 'resume') {
    return enrichResumePolicyDetail({ ...detail, bizType: 'resume' });
  }
  if (mode === 'cancel') {
    return enrichCancelPolicyDetail({ ...detail, bizType: 'cancel' });
  }
  if (mode === 'policy') {
    const enriched = enrichPolicyRecognOcrDetail(
      {
        ...detail,
        vehicleOwner: result.ocrVehicleOwner || detail.vehicleOwner,
        applicant: result.ocrApplicant || detail.applicant,
        insured: result.ocrInsured || detail.insured,
        company: result.ocrCompanyRaw || detail.company || result.ocrCompany,
      },
      {
        ocrRecognizedPlate: result.ocrRecognizedPlate || result.ocrPlateNo,
        companyCandidates: result.companyCandidates,
      }
    );
    return stripPolicyRecognCoverageFields(enriched);
  }
  return normalizePolicyDetail({ ...detail, bizType: mode });
};

const applyPolicyOcrResultToLedger = (result, mode) => {
  const { ledgerKey, typeKey } = result;
  if (!ledgerKey || !typeKey) return false;
  const effectiveMode = result.recognMode || mode;
  const rawDetail = result.policyDetail
    ? stripPolicyRecognDraftMeta(result.policyDetail)
    : null;
  const detail = rawDetail
    ? (effectiveMode === 'suspend'
      ? enrichSuspendPolicyDetail(rawDetail)
      : effectiveMode === 'resume'
        ? enrichResumePolicyDetail(rawDetail)
        : effectiveMode === 'cancel'
          ? enrichCancelPolicyDetail(rawDetail)
          : normalizePolicyDetail(rawDetail))
    : recognResultToPolicyDetail(result);
  const nowStr = formatCompareSheetNow();
  return (prev) => {
    const record = ensureInsuranceRecordShape(prev[ledgerKey] || createEmptyInsuranceRecord());
    const item = applyPolicyDetailToInsuranceItem({ ...record[typeKey] }, detail, effectiveMode);
    item.updateTime = nowStr;
    item.updateUser = PROTO_COMPARE_CREATOR;
    return { ...prev, [ledgerKey]: { ...record, [typeKey]: item } };
  };
};

/** 保险公司管理模块 — 保险公司名称枚举（原型 mock） */
const INSURANCE_MGMT_COMPANIES = [
  '中国人民财产保险股份有限公司',
  '中国平安财产保险股份有限公司',
  '中国太平洋财产保险股份有限公司',
  '中国人寿财产保险股份有限公司',
  '阳光财产保险股份有限公司',
  '中华联合财产保险股份有限公司',
  '太平财产保险有限公司',
  '大地财产保险股份有限公司',
  '紫金财产保险股份有限公司',
  '国任财产保险股份有限公司广州市番禺支公司',
  '上海某某保险公司',
];

const QUOTE_INSURANCE_TYPES = ['交强险', '商业险', '超赔险', '货物险', '驾意险'];

const sanitizePremiumInput = (raw) => {
  let s = String(raw || '').replace(/[^\d.]/g, '');
  const dotIdx = s.indexOf('.');
  if (dotIdx >= 0) {
    s = s.slice(0, dotIdx + 1) + s.slice(dotIdx + 1).replace(/\./g, '').slice(0, 2);
  }
  return s;
};

const isValidPremium = (s) => {
  const v = (s || '').trim();
  if (!v) return false;
  if (!/^\d+(\.\d{1,2})?$/.test(v)) return false;
  return parseFloat(v) > 0;
};

const formatPremiumDisplay = (s) => {
  if (!isValidPremium(s)) return s || '';
  return parseFloat(s).toFixed(2);
};

const createEmptyQuoteDraft = () => ({ company: undefined, premium: '' });

const shortInsuranceCompanyName = (name) => (
  (name || '').replace(/股份有限公司/g, '').replace(/有限公司/g, '').trim()
);

/** 比价单：汇总各行已确认报价金额 */
const calcCompareSheetConfirmedTotal = (rows) => {
  let total = 0;
  let count = 0;
  (rows || []).forEach((row) => {
    if (!row.confirmedQuoteId) return;
    const quote = (row.quotes || []).find((q) => q.id === row.confirmedQuoteId);
    if (!quote?.premium) return;
    const amount = parseFloat(quote.premium);
    if (!Number.isNaN(amount) && amount > 0) {
      total += amount;
      count += 1;
    }
  });
  return { total, count };
};

const VEHICLE_PROFILES = {
  '沪A03561F': { customer: '上海迅杰物流有限公司', ownerCompany: '浙江羚牛氢能科技有限公司', color: '白色', regDate: '2024-06-05', inspectExpire: '2026-06-30' },
  '粤B58888F': { customer: '深圳冷链运输有限公司', ownerCompany: '羚牛运营（广东）', color: '蓝色', regDate: '2024-07-20', inspectExpire: '2026-07-20' },
  '苏E33333': { customer: '苏州港务集团', ownerCompany: '浙江羚牛氢能科技有限公司', color: '红色', regDate: '2024-05-16', inspectExpire: '2026-05-15' },
  '京A12345': { customer: '—', ownerCompany: '某某科技有限公司', color: '灰色', regDate: '2020-10-01', inspectExpire: '2024-10-01' },
  '浙A88888': { customer: '—', ownerCompany: '浙江羚牛氢能科技有限公司', color: '绿色', regDate: '2025-01-01', inspectExpire: '2027-12-31' },
  '沪D66666': { customer: '客户C', ownerCompany: '羚牛运营（上海）', color: '白色', regDate: '2021-06-15', inspectExpire: '2025-01-31' },
  '粤A12345': { customer: '客户A', ownerCompany: '羚牛运营（广东）', color: '白色', regDate: '2023-07-01', inspectExpire: '2026-02-28' },
  '苏A55678': { customer: '—', ownerCompany: '羚牛运营（嘉兴）', color: '黄色', regDate: '2025-05-01', inspectExpire: '2026-04-30' },
  LZYTBACR2M9999001: { customer: '嘉兴某某物流有限公司', ownerCompany: '浙江羚牛氢能科技有限公司', color: '白色', regDate: '2025-11-01', inspectExpire: '2026-10-31' },
  '浙F08888F': { customer: '嘉兴港务物流有限公司', ownerCompany: '羚牛运营（嘉兴）', color: '白色', regDate: '2024-08-10', inspectExpire: '2026-08-10' },
  '浙F07777F': { customer: '平湖冷链运输有限公司', ownerCompany: '羚牛运营（嘉兴）', color: '蓝色', regDate: '2024-09-15', inspectExpire: '2026-09-15' },
  '粤AGP9001': { customer: '广州氢能示范运营公司', ownerCompany: '羚牛运营（广东）', color: '银色', regDate: '2025-02-01', inspectExpire: '2026-07-15' },
  '粤AGP9002': { customer: '深圳城配物流有限公司', ownerCompany: '羚牛运营（广东）', color: '白色', regDate: '2024-11-20', inspectExpire: '2026-06-20' },
  '沪A09999F': { customer: '上海综合物流有限公司', ownerCompany: '羚牛运营（上海）', color: '绿色', regDate: '2025-04-01', inspectExpire: '2026-10-01' },
};

const createCompareRowId = () => `cr-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
const createCompareSheetId = () => `cs-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
const createCompareAttachmentId = () => `att-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
const createQuoteId = () => `qt-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

const formatFileSize = (bytes) => {
  if (bytes == null || Number.isNaN(bytes)) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

const attachmentsToUploadFileList = (attachments) => (attachments || []).map((a) => ({
  uid: a.uid || a.id || createCompareAttachmentId(),
  name: a.name,
  size: a.size,
  type: a.type,
  status: 'done',
  uploadedAt: a.uploadedAt,
}));

const uploadFileListToAttachments = (fileList) => (fileList || []).map((f) => ({
  id: f.uid || createCompareAttachmentId(),
  uid: f.uid,
  name: f.name,
  size: f.size,
  type: f.type || '',
  uploadedAt: f.uploadedAt || formatCompareSheetNow(),
}));

const formatCompareSheetNow = () => {
  if (moment) return moment(ANCHOR_TODAY).hour(10).minute(30).second(0).format('YYYY-MM-DD HH:mm:ss');
  return `${ANCHOR_TODAY} 10:30:00`;
};

const calcCompareSheetStats = (rows) => {
  const vehicleKeys = new Set();
  (rows || []).forEach((row) => {
    const plate = (row.plateNo || '').trim();
    const vin = (row.vin || '').trim();
    if (plate) vehicleKeys.add(`plate:${plate.toUpperCase()}`);
    else if (vin) vehicleKeys.add(`vin:${vin.toUpperCase()}`);
  });
  return {
    totalVehicles: vehicleKeys.size,
    insuranceCount: (rows || []).length,
  };
};

const countCompareRowsWithConfirmedQuote = (rows) => (
  (rows || []).filter((r) => r.confirmedQuoteId).length
);

const getLatestPayDateDiffDays = (dateStr) => {
  if (!dateStr || !moment) return null;
  const today = moment(ANCHOR_TODAY).startOf('day');
  const pay = moment(dateStr).startOf('day');
  if (!pay.isValid()) return null;
  return pay.diff(today, 'days');
};

const getLatestPayDateStatus = (dateStr) => {
  const diff = getLatestPayDateDiffDays(dateStr);
  if (diff === null) return { type: 'none', text: '未填写最晚付费日期' };
  if (diff < 0) return { type: 'overdue', text: `最晚付费已超期 ${Math.abs(diff)} 天`, diffDays: diff };
  if (diff <= LATEST_PAY_WARN_DAYS) return { type: 'warning', text: `最晚付费临期，剩余 ${diff} 天`, diffDays: diff };
  return { type: 'normal', text: `距离最晚付费 ${diff} 天`, diffDays: diff };
};

const calcCompareSheetPayAlerts = (sheet) => {
  let warning = 0;
  let overdue = 0;
  (sheet?.rows || []).forEach((row) => {
    const st = getLatestPayDateStatus(row.latestPayDate);
    if (st.type === 'warning') warning += 1;
    if (st.type === 'overdue') overdue += 1;
  });
  return { warning, overdue };
};

const syncCompareSheetProcurementCounts = (sheet) => {
  const rows = sheet?.rows || [];
  const submittedProcurementCount = rows.filter((r) => {
    const st = normalizeCompareProcurementStatus(r.procurementStatus);
    return st === 'submitted' || st === 'approved';
  }).length;
  const approvedCount = rows.filter((r) => (
    normalizeCompareProcurementStatus(r.procurementStatus) === 'approved'
  )).length;
  return { submittedProcurementCount, approvedCount, completedCount: approvedCount };
};

const normalizeCompareRows = (rows) => (rows || []).map((row) => ({
  ...row,
  procurementStatus: normalizeCompareProcurementStatus(row.procurementStatus),
  procurementCurrentApprover: row.procurementCurrentApprover || '',
}));

const normalizeCompareSheet = (sheet) => {
  const rows = normalizeCompareRows(sheet.rows);
  const attachments = Array.isArray(sheet.attachments) ? sheet.attachments : [];
  return {
    ...sheet,
    rows,
    attachments,
    ...calcCompareSheetStats(rows),
    ...syncCompareSheetProcurementCounts({ rows }),
  };
};

const createEmptyInsuranceItem = () => ({
  company: '',
  policyNo: '',
  endorsementNo: '',
  startDate: '',
  endDate: '',
  premium: '',
  payTime: '',
  signDate: '',
  coverageItems: '',
  applicant: '',
  insured: '',
  updateTime: '',
  updateUser: '',
  policyTag: '',
  reinstateDate: '',
  suspendTime: '',
  resumeTime: '',
  cancelTime: '',
  refundPremium: '',
  attachments: [],
  operationLogs: [],
  archivedPolicies: [],
});

const INSURANCE_OPERATION_TYPE_LABEL = {
  add: '新增',
  suspend: '停保',
  resume: '复驶',
  cancel: '退保',
};

const EMPTY_POLICY_BIZ_FORM = {
  suspendTime: '',
  resumeTime: '',
  newEndDate: '',
  cancelTime: '',
  refundPremium: '',
};

const appendInsuranceOperationLog = (logs, payload) => [
  {
    id: `iop-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    time: formatCompareSheetNow(),
    operator: payload.operator || PROTO_COMPARE_CREATOR,
    type: payload.type,
    remark: payload.remark || '',
    attachments: Array.isArray(payload.attachments) ? payload.attachments : [],
  },
  ...(logs || []),
];

/** 保单业务状态：正常（含复驶后）、已停保、已退保 */
const INSURANCE_POLICY_STATUS_META = {
  normal: { label: '正常', color: 'success' },
  suspended: { label: '已停保', color: 'warning' },
  cancelled: { label: '已退保', color: 'default' },
};

const getInsurancePolicyStatusKey = (record) => {
  if (record?.policyTag === 'cancelled' || record?.purchaseType === 'cancel') return 'cancelled';
  if (record?.policyTag === 'suspended' || record?.purchaseType === 'rentStop') return 'suspended';
  return 'normal';
};

const getInsurancePolicyStatusMeta = (record) => (
  INSURANCE_POLICY_STATUS_META[getInsurancePolicyStatusKey(record)] || INSURANCE_POLICY_STATUS_META.normal
);

const buildOperationChangeRemark = (changes) => (
  (changes || [])
    .filter((c) => c.before !== c.after)
    .map((c) => `${c.label}：${c.before || '—'} → ${c.after || '—'}`)
    .join('；')
);

const deriveLedgerMgmtPurchaseType = (item) => {
  if (item?.policyTag === 'cancelled') return 'cancel';
  if (item?.policyTag === 'suspended') return 'rentStop';
  return 'new';
};

const createLedgerMgmtHistoryRecord = (vehicle, ledgerKey, typeKey, typeLabel, item, options = {}) => {
  const purchaseTime = item.startDate || item.updateTime || item.endDate || item.suspendTime || '';
  const derivedEventType = item.policyTag === 'cancelled'
    ? 'cancel'
    : item.policyTag === 'suspended'
      ? 'suspend'
      : 'purchase';
  const record = createInsuranceHistoryRecord({
    id: options.id || `ih-${ledgerKey}-${typeKey}-ledger-current`,
    typeKey,
    typeLabel,
    eventType: options.eventType || derivedEventType,
    purchaseType: options.purchaseType || deriveLedgerMgmtPurchaseType(item),
    time: purchaseTime,
    payTime: item.payTime || '',
    policyNo: item.policyNo,
    company: item.company,
    premium: item.premium,
    startDate: item.startDate,
    endDate: item.endDate,
    policyTag: item.policyTag || '',
    reinstateDate: item.reinstateDate || item.resumeTime || '',
    suspendTime: item.suspendTime || '',
    resumeTime: item.resumeTime || item.reinstateDate || '',
    policyDetail: buildPolicyDetailFromLedgerItem(
      vehicle,
      typeLabel,
      item,
      item.policyTag === 'suspended' ? 'suspend' : item.policyTag === 'cancelled' ? 'cancel' : 'policy'
    ),
    source: 'ledger',
    sourceLabel: options.sourceLabel || '台账当前保单',
    fileName: item.attachments?.[0]?.name || `${item.policyNo}_${typeLabel}.pdf`,
  });
  return {
    ...record,
    purchaseTime,
    operationLogs: item.operationLogs || [],
    isArchived: !!options.isArchived,
    isLedgerCurrent: !options.isArchived,
    attachments: item.attachments || [],
    summary: getInsuranceEventSummary(record),
  };
};

const createEmptyCompareRow = () => ({
  id: createCompareRowId(),
  plateNo: '',
  vin: '',
  customer: '',
  ownerCompany: '',
  brand: '',
  model: '',
  bodyColor: '',
  regDate: '',
  inspectExpire: '',
  insureMode: '续保',
  insuranceType: '交强险',
  jqValidUntil: '',
  syValidUntil: '',
  latestPayDate: '',
  quotes: [],
  confirmedQuoteId: '',
  procurementStatus: 'none',
  procurementSubmittedAt: '',
  procurementCurrentApprover: '',
});

const buildCompareRowFromVehicle = (v, insuranceData) => ({
  id: createCompareRowId(),
  ...buildVehicleComparePatch(v, insuranceData),
  latestPayDate: '',
  quotes: [],
  confirmedQuoteId: '',
  procurementStatus: 'none',
  procurementSubmittedAt: '',
  procurementCurrentApprover: '',
});

const cloneCompareRow = (row) => ({
  ...JSON.parse(JSON.stringify(row)),
  id: createCompareRowId(),
  quotes: (row.quotes || []).map((q) => ({ ...q, id: createQuoteId() })),
  confirmedQuoteId: '',
});

const MOCK_VEHICLES = [
  { plateNo: '沪A03561F', brand: '宇通', model: '49吨牵引车头', vin: 'LMRKH9AC0R1004086', status: '自营' },
  { plateNo: '粤B58888F', brand: '福田', model: '奥铃4.5吨冷藏车', vin: 'LGHXCAE28M6789012', status: '租赁' },
  { plateNo: '苏E33333', brand: '陕汽', model: '德龙X3000混动牵引车', vin: 'LSXCH9AE8M1094857', status: '自营' },
  { plateNo: '京A12345', brand: '东风', model: 'DFH1180厢式货车', vin: 'LKLG7C4E4NA774759', status: '退出运营' },
  { plateNo: '浙A88888', brand: '宇通', model: '氢燃料电池大巴', vin: 'LMRKH9AE2P9876543', status: '库存' },
  { plateNo: '沪D66666', brand: '比亚迪', model: 'T5轻卡', vin: 'LSVAU2BR3NS567890', status: '租赁' },
  { plateNo: '粤A12345', brand: '比亚迪', model: '汉EV', vin: 'LGWEF4A59NS123456', status: '租赁' },
  { plateNo: '苏A55678', brand: '福田', model: '欧马可4.2米', vin: 'LVBV3JBB8NY123456', status: '库存' },
  { plateNo: '', brand: '东风', model: '氢燃料电池牵引车（待上牌）', vin: 'LZYTBACR2M9999001', status: '库存' },
  { plateNo: '沪BDB9161', brand: '腾势', model: 'QCJ6520MBEV1纯电动', vin: 'LC0DF4CD8S0303140', status: '自营' },
  { plateNo: '粤AGR9766', brand: '帕力安', model: '燃料电池翼开启厢式车', vin: 'LB9A32A21R0LS1478', status: '自营' },
  { plateNo: '粤AGP9827', brand: '比亚迪', model: '轻卡', vin: 'LGXAGP98270000001', status: '租赁' },
  { plateNo: '粤AGP3071', brand: '福田', model: '欧马可', vin: 'LGXAGP30710000001', status: '租赁' },
  { plateNo: '粤A03423F', brand: '宇通', model: '49吨牵引', vin: 'LZYTBACR2A03423F01', status: '自营' },
  { plateNo: '粤A06290F', brand: '陕汽', model: '牵引车', vin: 'LZYTBACR2A06290F01', status: '自营' },
  { plateNo: '粤A03331F', brand: '东风', model: '厢式货车', vin: 'LZYTBACR2A03331F01', status: '自营' },
  { plateNo: '浙F03220F', brand: '福田', model: '冷藏车', vin: 'LZYTBACR2F03220F01', status: '租赁' },
  { plateNo: '沪A06192F', brand: '比亚迪', model: 'T5', vin: 'LZYTBACR2A06192F01', status: '自营' },
  { plateNo: '浙F05178F', brand: '福田', model: '牵引车', vin: 'LZYTBACR2F05178F01', status: '自营' },
  /* 样例：多险种同时临期/到期 */
  { plateNo: '浙F08888F', brand: '宇通', model: '49吨氢能牵引车', vin: 'LMRKH9AC0R1004991', status: '自营' },
  { plateNo: '浙F07777F', brand: '福田', model: '4.5吨氢能冷藏车', vin: 'LGHXCAE28M6784992', status: '租赁' },
  { plateNo: '粤AGP9001', brand: '帕力安', model: '燃料电池厢式车', vin: 'LB9A32A21R0LS4993', status: '自营' },
  { plateNo: '粤AGP9002', brand: '陕汽', model: '德龙氢能牵引车', vin: 'LSXCH9AE8M1094994', status: '租赁' },
  { plateNo: '沪A09999F', brand: '比亚迪', model: 'T5氢能轻卡', vin: 'LSVAU2BR3NS5674995', status: '自营' },
];

const hasVehiclePlate = (vehicle) => !!(vehicle?.plateNo || '').trim();

const getVehicleLedgerKey = (vehicleOrKey) => {
  if (!vehicleOrKey) return '';
  if (typeof vehicleOrKey === 'object') {
    const plate = (vehicleOrKey.plateNo || '').trim();
    if (plate) return plate;
    return (vehicleOrKey.vin || '').trim();
  }
  return String(vehicleOrKey).trim();
};

const formatVehiclePlateDisplay = (plateNo) => {
  const p = (plateNo || '').trim();
  return p || NO_PLATE_LABEL;
};

const isCompareRowVehicleLinked = (row) => !!(row?.plateNo || '').trim() || !!(row?.vin || '').trim();

const getVehicleProfile = (vehicle) => {
  if (!vehicle) return {};
  const plate = (vehicle.plateNo || '').trim();
  if (plate && VEHICLE_PROFILES[plate]) return VEHICLE_PROFILES[plate];
  const vin = (vehicle.vin || '').trim();
  return VEHICLE_PROFILES[vin] || {};
};

const getInitialInsuranceSeed = (vehicle) => {
  const plate = (vehicle.plateNo || '').trim();
  if (plate && INITIAL_INSURANCE_DATA[plate]) return INITIAL_INSURANCE_DATA[plate];
  const vin = (vehicle.vin || '').trim();
  return INITIAL_INSURANCE_DATA[vin] || null;
};

const findVehicleByPlate = (plate) => {
  const key = (plate || '').trim().toUpperCase();
  if (!key) return null;
  return MOCK_VEHICLES.find((v) => (v.plateNo || '').trim().toUpperCase() === key) || null;
};

const findVehicleByVin = (vin) => {
  const key = (vin || '').trim().toUpperCase();
  return MOCK_VEHICLES.find((v) => v.vin.toUpperCase() === key) || null;
};

const PLATE_SELECT_OPTIONS = MOCK_VEHICLES
  .filter((v) => hasVehiclePlate(v))
  .map((v) => ({ label: v.plateNo, value: v.plateNo }));
const VIN_SELECT_OPTIONS = MOCK_VEHICLES.map((v) => ({ label: v.vin, value: v.vin }));

const getVehicleRegistrationOwner = (plateNo) => {
  const vehicle = findVehicleByPlate(plateNo);
  if (!vehicle) return '';
  const profile = getVehicleProfile(vehicle);
  return profile.ownerCompany || profile.customer || '';
};

const normalizeRecognPayTime = (raw) => {
  const s = String(raw || '').trim();
  if (!s) return '';
  if (/^\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2}$/.test(s)) return s;
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{1,2})(?::(\d{1,2}))?(?::(\d{1,2}))?)?$/);
  if (m) {
    const [, y, mo, d, h = '0', mi = '0', se = '0'] = m;
    return `${y}-${mo}-${d} ${String(h).padStart(2, '0')}:${String(mi).padStart(2, '0')}:${String(se).padStart(2, '0')}`;
  }
  return s;
};

const normalizeRecognDate = (raw) => {
  const s = String(raw || '').trim();
  if (!s) return '';
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (m) return `${m[1]}-${m[2]}-${m[3]}`;
  return s;
};

const normalizeRecognPremiumAmount = (raw) => {
  const cleaned = sanitizePremiumInput(raw);
  if (!cleaned) return '';
  const num = parseFloat(cleaned);
  if (Number.isNaN(num)) return cleaned;
  return num.toFixed(2);
};

const matchInsuranceCompanyCandidates = (ocrText, catalog = INSURANCE_MGMT_COMPANIES) => {
  const text = String(ocrText || '').trim();
  if (!text) return [];
  const exact = catalog.filter((c) => c === text);
  if (exact.length) return exact;
  const norm = text.replace(/\s/g, '');
  return catalog.filter((c) => {
    const cn = c.replace(/\s/g, '');
    return cn.includes(norm) || norm.includes(cn);
  });
};

const resolveInsuranceCompanyFromOcr = (ocrText, catalog = INSURANCE_MGMT_COMPANIES) => {
  const candidates = matchInsuranceCompanyCandidates(ocrText, catalog);
  if (candidates.length === 1) return { company: candidates[0], candidates };
  if (candidates.length > 1) return { company: '', candidates };
  return { company: '', candidates: catalog };
};

const stripPolicyRecognDraftMeta = (draft) => {
  if (!draft || typeof draft !== 'object') return draft;
  const {
    _companyCandidates,
    _ocrRecognizedPlate,
    _plateLedgerMatched,
    ...rest
  } = draft;
  return rest;
};

const enrichPolicyRecognOcrDetail = (detail, context = {}) => {
  const d = normalizePolicyDetail(detail);
  const ocrPlate = String(context.ocrRecognizedPlate || d.plateNo || '').trim().toUpperCase();
  const ledgerPlate = ocrPlate && findVehicleByPlate(ocrPlate) ? ocrPlate : '';
  const plateNo = ledgerPlate || String(d.plateNo || '').trim().toUpperCase();
  const vehicle = findVehicleByPlate(plateNo);
  const companyMatches = matchInsuranceCompanyCandidates(d.company);
  const companyResolve = resolveInsuranceCompanyFromOcr(d.company);
  const resolvedCompany = companyMatches.length === 1 ? companyMatches[0] : companyResolve.company;
  const candidates = companyMatches.length > 1
    ? companyMatches
    : (context.companyCandidates || companyResolve.candidates);
  return {
    ...d,
    plateNo: ledgerPlate || plateNo,
    vin: vehicle?.vin || d.vin || '',
    vehicleOwner: (d.vehicleOwner || '').trim() || getVehicleRegistrationOwner(ledgerPlate || plateNo),
    payTime: normalizeRecognPayTime(d.payTime),
    startDate: normalizeRecognDate(d.startDate),
    endDate: normalizeRecognDate(d.endDate),
    premium: normalizeRecognPremiumAmount(d.premium),
    company: resolvedCompany,
    applicant: (d.applicant || '').trim(),
    insured: (d.insured || '').trim(),
    _companyCandidates: candidates,
    _ocrRecognizedPlate: ocrPlate,
    _plateLedgerMatched: !!ledgerPlate,
  };
};

const validatePolicyRecognPlateForConfirm = (draft, result, options = {}) => {
  const { silent = false } = options;
  const ocrPlate = String(result?.ocrRecognizedPlate || result?.ocrPlateNo || '').trim().toUpperCase();
  const selected = String(draft?.plateNo || '').trim().toUpperCase();
  if (!selected) {
    if (!silent) message.warning('请选择车牌号');
    return false;
  }
  if (!findVehicleByPlate(selected)) {
    if (!silent) message.warning('所选车牌号不在台账车辆中，请重新选择');
    return false;
  }
  if (ocrPlate && selected !== ocrPlate) {
    if (!silent) message.error(`识别车牌号为 ${ocrPlate}，与当前所选 ${selected} 不一致，请核对`);
    return false;
  }
  return true;
};

const buildVehicleComparePatch = (vehicle, insuranceData) => {
  if (!vehicle) return {};
  const profile = getVehicleProfile(vehicle);
  const ins = insuranceData[getVehicleLedgerKey(vehicle)] || {};
  const jqEnd = ins.compulsory?.endDate || '';
  const syEnd = ins.commercial?.endDate || '';
  return {
    plateNo: vehicle.plateNo,
    vin: vehicle.vin,
    customer: profile.customer || '',
    ownerCompany: profile.ownerCompany || '',
    brand: vehicle.brand,
    model: vehicle.model,
    bodyColor: profile.color || '',
    regDate: profile.regDate || '',
    inspectExpire: profile.inspectExpire || '',
    insureMode: jqEnd || syEnd ? '续保' : '新保',
    insuranceType: '交强险',
    jqValidUntil: jqEnd,
    syValidUntil: syEnd,
  };
};

const clearVehicleComparePatch = () => ({
  plateNo: '',
  vin: '',
  customer: '',
  ownerCompany: '',
  brand: '',
  model: '',
  bodyColor: '',
  regDate: '',
  inspectExpire: '',
  insureMode: '续保',
  insuranceType: '交强险',
  jqValidUntil: '',
  syValidUntil: '',
});

const createEmptyInsuranceRecord = () => ({
  compulsory: createEmptyInsuranceItem(),
  commercial: createEmptyInsuranceItem(),
  excess: createEmptyInsuranceItem(),
  cargo: createEmptyInsuranceItem(),
  driverAccident: createEmptyInsuranceItem(),
});

const ensureInsuranceRecordShape = (record) => {
  const base = createEmptyInsuranceRecord();
  const next = { ...base };
  INSURANCE_TYPE_ITEMS.forEach(({ key }) => {
    next[key] = { ...base[key], ...(record?.[key] || {}) };
  });
  return next;
};

const VEHICLE_INSURANCE_MGMT_TABS = [
  { key: 'timeline', label: '保险采购全周期记录' },
  { key: 'compulsory', label: '交强险' },
  { key: 'commercial', label: '商业险' },
  { key: 'excess', label: '超赔险' },
  { key: 'driverAccident', label: '驾意险' },
  { key: 'cargo', label: '货物险' },
];

/** 管理页记录类型：新保 / 续保 / 停租 / 复驶 / 退保 */
const POLICY_PURCHASE_TYPE_META = {
  new: { label: '新保', color: 'success', timelineColor: 'green', chipClass: 'lc-purchase-type--new' },
  renew: { label: '续保', color: 'processing', timelineColor: 'blue', chipClass: 'lc-purchase-type--renew' },
  rentStop: { label: '停保', color: 'warning', timelineColor: 'orange', chipClass: 'lc-purchase-type--rent-stop' },
  resume: { label: '复驶', color: 'cyan', timelineColor: 'cyan', chipClass: 'lc-purchase-type--resume' },
  cancel: { label: '退保', color: 'default', timelineColor: 'gray', chipClass: 'lc-purchase-type--cancel' },
};

const POLICY_LIKE_EVENT_TYPES = new Set(['purchase', 'renew', 'procurement', 'recognize']);

const isPolicyLikeInsuranceRecord = (record) => (
  POLICY_LIKE_EVENT_TYPES.has(record?.eventType)
  || record?.purchaseType === 'new'
  || record?.purchaseType === 'renew'
);

const eventTypeToDefaultPurchaseType = (eventType) => {
  if (eventType === 'suspend') return 'rentStop';
  if (eventType === 'resume') return 'resume';
  if (eventType === 'cancel') return 'cancel';
  if (eventType === 'renew') return 'renew';
  return 'new';
};

const assignPurchaseTypesToRecords = (records) => {
  const counters = {};
  const chronological = [...records].sort((a, b) => String(a.time).localeCompare(String(b.time)));
  chronological.forEach((rec) => {
    const typeKey = rec.typeKey || '_';
    if (!counters[typeKey]) counters[typeKey] = 0;
    let purchaseType = eventTypeToDefaultPurchaseType(rec.eventType);
    if (POLICY_LIKE_EVENT_TYPES.has(rec.eventType)) {
      purchaseType = counters[typeKey] > 0 ? 'renew' : 'new';
      counters[typeKey] += 1;
    }
    rec.purchaseType = purchaseType;
  });
  return records;
};

const subtractInsuranceYears = (dateStr, years) => {
  if (!moment || !dateStr) return '';
  const d = moment(dateStr, 'YYYY-MM-DD', true);
  if (!d.isValid()) return '';
  return d.subtract(years, 'year').format('YYYY-MM-DD');
};

const vehicleMatchesCompareRow = (vehicle, row) => {
  if (!vehicle || !row) return false;
  const ledgerKey = getVehicleLedgerKey(vehicle);
  const rowKey = getVehicleLedgerKey({ plateNo: row.plateNo, vin: row.vin });
  return !!ledgerKey && ledgerKey === rowKey;
};

const isActiveCompareProcurementStatus = (status) => (
  ACTIVE_COMPARE_PROCUREMENT_STATUSES.includes(status)
);

const buildCompareSubmissionKey = (vehicleOrRow, insuranceTypeLabel) => {
  const key = getVehicleLedgerKey(vehicleOrRow);
  const type = insuranceTypeLabel || '交强险';
  if (!key) return '';
  return `${key}::${type}`;
};

const buildActiveCompareSubmissionSet = (compareSheets) => {
  const set = new Set();
  (compareSheets || []).forEach((sheet) => {
    (sheet.rows || []).forEach((row) => {
      if (!isActiveCompareProcurementStatus(row.procurementStatus)) return;
      const submissionKey = buildCompareSubmissionKey(row, row.insuranceType);
      if (submissionKey) set.add(submissionKey);
    });
  });
  return set;
};

const isVehicleTypeSubmittedToCompare = (vehicle, insuranceTypeLabel, submissionSet) => (
  submissionSet.has(buildCompareSubmissionKey(vehicle, insuranceTypeLabel))
);

const createInsuranceHistoryRecord = (payload) => ({
  id: payload.id || `ih-${payload.typeKey}-${payload.eventType}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
  typeKey: payload.typeKey,
  typeLabel: payload.typeLabel,
  eventType: payload.eventType,
  purchaseType: payload.purchaseType || eventTypeToDefaultPurchaseType(payload.eventType),
  time: payload.time || '',
  payTime: payload.payTime || '',
  purchaseTime: payload.time || '',
  policyNo: payload.policyNo || '',
  company: payload.company || '',
  premium: payload.premium || '',
  startDate: payload.startDate || '',
  endDate: payload.endDate || '',
  source: payload.source || 'ledger',
  sourceLabel: payload.sourceLabel || '',
  policyTag: payload.policyTag || '',
  reinstateDate: payload.reinstateDate || '',
  suspendTime: payload.suspendTime || '',
  resumeTime: payload.resumeTime || '',
  policyDetail: payload.policyDetail || null,
  fileName: payload.fileName || (payload.policyNo ? `${payload.policyNo}_${payload.typeLabel}.pdf` : '保单附件.pdf'),
});

const purchaseTypeToBizType = (purchaseType, eventType) => {
  if (purchaseType === 'rentStop' || eventType === 'suspend') return 'suspend';
  if (purchaseType === 'resume' || eventType === 'resume') return 'resume';
  if (purchaseType === 'cancel' || eventType === 'cancel') return 'cancel';
  return 'policy';
};

const historyRecordToPolicyDetail = (record, vehicle) => {
  if (record?.policyDetail) {
    return normalizePolicyDetail({
      ...record.policyDetail,
      plateNo: vehicle?.plateNo || record.policyDetail.plateNo,
      vin: vehicle?.vin || record.policyDetail.vin,
    });
  }
  return normalizePolicyDetail({
    plateNo: vehicle?.plateNo || '',
    vin: vehicle?.vin || '',
    insuranceType: record?.typeLabel || '交强险',
    bizType: purchaseTypeToBizType(record?.purchaseType, record?.eventType),
    company: record?.company || '',
    policyNo: record?.policyNo || '',
    payTime: record?.payTime || '',
    startDate: record?.startDate || '',
    endDate: record?.endDate || '',
    reinstateDate: record?.reinstateDate || '',
    premium: record?.premium || '',
    coverageItems: normalizeCoverageItems(record?.policyDetail?.coverageItems),
    applicant: '',
    insured: '',
    signDate: '',
  });
};

const applyPolicyDetailToHistoryRecord = (record, detail) => {
  const d = enrichSuspendPolicyDetail(detail);
  const time = d.bizType === 'suspend'
    ? (d.suspendTime || d.startDate || record.time)
    : (d.startDate || record.time);
  const typeLabel = d.insuranceType || record.typeLabel;
  const next = {
    ...record,
    policyDetail: d,
    typeLabel,
    policyNo: d.policyNo || record.policyNo,
    company: d.company,
    payTime: d.payTime,
    startDate: d.startDate,
    endDate: d.bizType === 'suspend' ? (d.newEndDate || d.endDate) : d.endDate,
    premium: d.premium,
    reinstateDate: d.reinstateDate,
    suspendTime: d.suspendTime || d.startDate || record.suspendTime || '',
    resumeTime: d.resumeTime || d.reinstateDate || record.resumeTime || '',
    time: d.bizType === 'suspend' ? (d.suspendTime || d.startDate || time) : time,
    purchaseTime: d.bizType === 'suspend' ? (d.suspendTime || d.startDate || time) : time,
    fileName: d.policyNo ? `${d.policyNo}_${typeLabel}.pdf` : record.fileName,
  };
  next.summary = getInsuranceEventSummary(next);
  return next;
};

const applyHistoryEditsToVehicleHistory = (history, edits) => {
  if (!history || !edits || typeof edits !== 'object') return history;
  const patch = (r) => {
    const detail = edits[r.id];
    if (!detail) return r;
    return applyPolicyDetailToHistoryRecord(r, detail);
  };
  const byType = {};
  Object.keys(history.byType || {}).forEach((k) => {
    byType[k] = (history.byType[k] || []).map(patch);
  });
  return {
    ...history,
    timeline: (history.timeline || []).map(patch),
    byType,
  };
};

const buildPolicyDetailFromLedgerItem = (vehicle, typeLabel, item, bizType = 'policy') => normalizePolicyDetail({
  plateNo: vehicle?.plateNo || '',
  vin: vehicle?.vin || '',
  insuranceType: typeLabel,
  bizType,
  company: item?.company || '',
  policyNo: item?.policyNo || '',
  endorsementNo: item?.endorsementNo || '',
  payTime: item?.payTime || '',
  signDate: item?.signDate || '',
  startDate: item?.startDate || '',
  endDate: item?.endDate || '',
  reinstateDate: item?.reinstateDate || '',
  suspendTime: item?.suspendTime || '',
  resumeTime: item?.resumeTime || item?.reinstateDate || '',
  newEndDate: item?.endDate || '',
  premium: item?.premium || '',
  coverageItems: parseCoverageItemsInput(item?.coverageItems),
  applicant: item?.applicant || '',
  insured: item?.insured || '',
});

const getInsuranceEventSummary = (record) => {
  const premiumText = record.premium ? `，金额 ¥${record.premium}` : '';
  const typeLabel = POLICY_PURCHASE_TYPE_META[record.purchaseType]?.label || '记录';
  const period = record.startDate && record.endDate
    ? `，期间 ${record.startDate} 至 ${record.endDate}`
    : (record.endDate ? `，到期日期 ${record.endDate}` : '');
  switch (record.purchaseType) {
    case 'new':
      return `${typeLabel} ${record.typeLabel}，保单号 ${record.policyNo || '—'}${period}${premiumText}`;
    case 'renew':
      return `${typeLabel} ${record.typeLabel}，保单号 ${record.policyNo || '—'}${period}${premiumText}`;
    case 'rentStop': {
      const suspendTime = record.suspendTime || record.policyDetail?.suspendTime || record.startDate || '';
      const resumeTime = record.resumeTime || record.reinstateDate || record.policyDetail?.resumeTime || '';
      const newEndDate = record.endDate || record.policyDetail?.newEndDate || '';
      const parts = [`${typeLabel} · ${record.typeLabel}，保单号 ${record.policyNo || '—'}`];
      if (suspendTime) parts.push(`中止 ${suspendTime}`);
      if (resumeTime) parts.push(`恢复 ${resumeTime}`);
      if (newEndDate) parts.push(`新到期 ${newEndDate}`);
      return parts.join('，');
    }
    case 'resume':
      return `${typeLabel} · ${record.typeLabel}，保单号 ${record.policyNo || '—'}${period}`;
    case 'cancel':
      return `${typeLabel} · ${record.typeLabel}，保单号 ${record.policyNo || '—'}${premiumText}`;
    default:
      return `${record.typeLabel} · ${record.policyNo || '—'}`;
  }
};

const isTimelineBizRecord = (item) => (
  ['rentStop', 'resume', 'cancel'].includes(item?.purchaseType)
  || ['suspend', 'resume', 'cancel'].includes(item?.eventType)
);

const buildOperationLogTimelineEntries = (insRecord) => {
  const entries = [];
  const seen = new Set();
  INSURANCE_TYPE_ITEMS.forEach(({ key: typeKey, fullLabel: typeLabel }) => {
    const pushLogs = (item) => {
      if (!item) return;
      (item.operationLogs || []).forEach((log) => {
        if (!log?.id || seen.has(log.id)) return;
        seen.add(log.id);
        const purchaseType = log.type === 'suspend'
          ? 'rentStop'
          : log.type === 'resume'
            ? 'resume'
            : log.type === 'cancel'
              ? 'cancel'
              : 'new';
        const record = createInsuranceHistoryRecord({
          id: `tl-op-${log.id}`,
          typeKey,
          typeLabel,
          eventType: log.type === 'add' ? 'purchase' : log.type,
          purchaseType,
          time: log.time,
          policyNo: item.policyNo || '',
          company: item.company || '',
          source: 'operation',
          sourceLabel: '操作记录',
        });
        entries.push({
          ...record,
          summary: log.remark || `${INSURANCE_OPERATION_TYPE_LABEL[log.type] || log.type} · ${typeLabel}`,
          operator: log.operator,
          fromOperationLog: true,
        });
      });
    };
    const item = insRecord[typeKey];
    pushLogs(item);
    (item?.archivedPolicies || []).forEach(pushLogs);
  });
  return entries;
};

const splitVehicleInsuranceTimeline = (timeline, insRecord) => {
  const opEntries = buildOperationLogTimelineEntries(insRecord);
  const seenIds = new Set();
  const all = [];
  [...(timeline || []), ...opEntries].forEach((item) => {
    if (!item?.id || seenIds.has(item.id)) return;
    seenIds.add(item.id);
    all.push({
      ...item,
      summary: item.summary || getInsuranceEventSummary(item),
    });
  });
  const timelinePolicy = [];
  const timelineBiz = [];
  all.forEach((item) => {
    if (isTimelineBizRecord(item)) timelineBiz.push(item);
    else timelinePolicy.push(item);
  });
  const sorter = (a, b) => String(b.time || '').localeCompare(String(a.time || ''));
  timelinePolicy.sort(sorter);
  timelineBiz.sort(sorter);
  return { timelinePolicy, timelineBiz };
};

const buildVehicleInsuranceHistory = (vehicle, allInsurance, compareSheets, policyRecognTasks) => {
  const ledgerKey = getVehicleLedgerKey(vehicle);
  const record = ensureInsuranceRecordShape(allInsurance[ledgerKey] || createEmptyInsuranceRecord());
  const records = [];

  INSURANCE_TYPE_ITEMS.forEach(({ key: typeKey, fullLabel: typeLabel }) => {
    const item = record[typeKey];
    if (!item?.policyNo) return;
    records.push(createLedgerMgmtHistoryRecord(vehicle, ledgerKey, typeKey, typeLabel, item));
  });

  (compareSheets || []).forEach((sheet) => {
    (sheet.rows || []).forEach((row) => {
      if (!vehicleMatchesCompareRow(vehicle, row)) return;
      const typeKey = INSURANCE_LABEL_TO_KEY[row.insuranceType] || 'compulsory';
      const typeLabel = row.insuranceType || INSURANCE_TYPE_ITEMS.find((it) => it.key === typeKey)?.fullLabel || '—';
      const confirmed = (row.quotes || []).find((q) => q.id === row.confirmedQuoteId);
      if (!confirmed) return;
      const eventType = normalizeCompareProcurementStatus(row.procurementStatus) === 'approved' ? 'procurement' : 'procurement';
      records.push(createInsuranceHistoryRecord({
        id: `ih-compare-${sheet.id}-${row.id}`,
        typeKey,
        typeLabel,
        eventType,
        time: row.procurementSubmittedAt || sheet.createdAt,
        policyNo: confirmed.policyNo || `CG-${String(row.id).slice(-8)}`,
        company: confirmed.company,
        premium: confirmed.premium,
        source: 'compare',
        sourceLabel: sheet.periodLabel ? `比价单 · ${sheet.periodLabel}` : '比价单采购',
        fileName: `${sheet.id || 'sheet'}_${typeLabel}_采购单.pdf`,
      }));
    });
  });

  (policyRecognTasks || []).forEach((task) => {
    (task.results || []).forEach((r) => {
      if (!r.confirmed || r.ledgerKey !== ledgerKey) return;
      const typeKey = r.typeKey || INSURANCE_LABEL_TO_KEY[r.insuranceTypeLabel];
      if (!typeKey) return;
      let eventType = 'recognize';
      if (task.mode === 'suspend') eventType = 'suspend';
      else if (task.mode === 'cancel') eventType = 'cancel';
      else if (task.mode === 'resume') eventType = 'resume';
      records.push(createInsuranceHistoryRecord({
        id: `ih-recognize-${task.id}-${r.id}`,
        typeKey,
        typeLabel: r.insuranceTypeLabel || INSURANCE_TYPE_ITEMS.find((it) => it.key === typeKey)?.fullLabel,
        eventType,
        time: task.completedAt || task.createdAt,
        policyNo: r.ocrPolicyNo,
        company: r.ocrCompany,
        premium: r.ocrPremium || '',
        payTime: r.ocrPayTime || '',
        startDate: r.ocrStartDate || '',
        endDate: r.ocrEndDate,
        reinstateDate: r.reinstateDate,
        policyTag: eventType === 'suspend' ? 'suspended' : eventType === 'cancel' ? 'cancelled' : '',
        policyDetail: r.policyDetail ? normalizePolicyDetail(r.policyDetail) : recognResultToPolicyDetail(r),
        source: 'recognize',
        sourceLabel: task.entryLabel || '批量识别',
        recognizeTaskId: task.id,
        recognizeResultId: r.id,
        fileName: r.fileName || `${r.ocrPolicyNo}_${r.insuranceTypeLabel}.pdf`,
      }));
    });
  });

  assignPurchaseTypesToRecords(records);
  records.sort((a, b) => String(b.time).localeCompare(String(a.time)));

  const timeline = records.map((r) => ({
    ...r,
    summary: getInsuranceEventSummary(r),
  }));

  const byType = {};
  INSURANCE_TYPE_ITEMS.forEach(({ key: typeKey, fullLabel: typeLabel }) => {
    const item = record[typeKey];
    const typeRows = [];
    if (item?.policyNo) {
      typeRows.push(createLedgerMgmtHistoryRecord(vehicle, ledgerKey, typeKey, typeLabel, item));
    }
    (item?.archivedPolicies || []).forEach((archived, archivedIndex) => {
      typeRows.push(createLedgerMgmtHistoryRecord(vehicle, ledgerKey, typeKey, typeLabel, archived, {
        id: `ih-${ledgerKey}-${typeKey}-archived-${archivedIndex}`,
        isArchived: true,
        sourceLabel: '历史保单',
        purchaseType: archived.policyTag === 'cancelled' ? 'cancel' : 'renew',
      }));
    });
    byType[typeKey] = typeRows;
  });

  const { timelinePolicy, timelineBiz } = splitVehicleInsuranceTimeline(timeline, record);

  return { timeline, timelinePolicy, timelineBiz, byType, ledgerKey };
};

const INITIAL_INSURANCE_DATA = {
  '沪A03561F': {
    compulsory: { company: '中国人民财产保险', policyNo: 'PDZA202533048200000123', startDate: '2025-01-01', endDate: '2026-12-31', premium: '950.00', updateTime: '2025-01-05 10:00', updateUser: '张明辉' },
    commercial: { company: '中国人民财产保险', policyNo: 'PDAA202533048200000456', startDate: '2025-01-01', endDate: '2026-12-31', premium: '12800.50', updateTime: '2025-01-05 10:00', updateUser: '张明辉' },
    excess: { company: '中国平安财产保险', policyNo: 'PAIC-CP-2025-8899', startDate: '2025-07-01', endDate: '2026-06-30', premium: '3200.00', updateTime: '2025-06-28 14:20', updateUser: '李专员' },
    cargo: { company: '中国太平洋财产保险', policyNo: 'CPIC-HW-2025-1122', startDate: '2025-03-15', endDate: '2026-03-14', premium: '1800.00', updateTime: '2025-03-10 09:15', updateUser: '李专员' },
    driverAccident: { company: '', policyNo: '', startDate: '', endDate: '', premium: '', updateTime: '', updateUser: '' },
  },
  '粤B58888F': {
    compulsory: { company: '阳光财产保险', policyNo: 'YGCI-JQ-2025-3301', startDate: '2025-09-01', endDate: '2026-08-31', premium: '950.00', updateTime: '2025-08-28 11:00', updateUser: '王专员' },
    commercial: { company: '', policyNo: '', startDate: '', endDate: '', premium: '', updateTime: '', updateUser: '' },
    excess: { company: '', policyNo: '', startDate: '', endDate: '', premium: '', updateTime: '', updateUser: '' },
    cargo: { company: '中国人寿财产保险', policyNo: 'GPIC-HW-2025-7788', startDate: '2025-04-01', endDate: '2026-03-31', premium: '1600.00', updateTime: '2025-03-28 16:40', updateUser: '王专员' },
    driverAccident: { company: '中华联合财产保险', policyNo: 'CIC-JY-2025-001', startDate: '2025-05-01', endDate: '2026-04-30', premium: '560.00', updateTime: '2025-04-28 10:00', updateUser: '王专员' },
  },
  '苏E33333': {
    compulsory: { company: '中国太平洋财产保险', policyNo: 'CPIC-JQ-2024-7788', startDate: '2024-06-01', endDate: '2025-05-31', premium: '880.00', updateTime: '2024-05-28 09:00', updateUser: '陈高伟' },
    commercial: { company: '中国人寿财产保险', policyNo: 'GPIC-SY-2025-1122', startDate: '2025-07-01', endDate: '2026-06-30', premium: '9850.00', updateTime: '2025-06-25 15:30', updateUser: '陈高伟' },
    excess: { company: '', policyNo: '', startDate: '', endDate: '', premium: '', updateTime: '', updateUser: '' },
    cargo: { company: '', policyNo: '', startDate: '', endDate: '', premium: '', updateTime: '', updateUser: '' },
    driverAccident: { company: '', policyNo: '', startDate: '', endDate: '', premium: '', updateTime: '', updateUser: '' },
  },
  '京A12345': {
    compulsory: { company: '', policyNo: '', startDate: '', endDate: '', premium: '', updateTime: '', updateUser: '' },
    commercial: { company: '', policyNo: '', startDate: '', endDate: '', premium: '', updateTime: '', updateUser: '' },
    excess: { company: '', policyNo: '', startDate: '', endDate: '', premium: '', updateTime: '', updateUser: '' },
    cargo: { company: '', policyNo: '', startDate: '', endDate: '', premium: '', updateTime: '', updateUser: '' },
    driverAccident: { company: '', policyNo: '', startDate: '', endDate: '', premium: '', updateTime: '', updateUser: '' },
  },
  '浙A88888': {
    compulsory: { company: '中国人民财产保险', policyNo: 'PDZA202533048200000789', startDate: '2025-07-01', endDate: '2026-06-30', premium: '950.00', updateTime: '2025-06-28 10:00', updateUser: '张小凡' },
    commercial: { company: '中国人民财产保险', policyNo: 'PDAA202533048200000790', startDate: '2025-01-01', endDate: '2027-12-31', premium: '15600.00', updateTime: '2025-01-05 10:00', updateUser: '张小凡' },
    excess: { company: '中国平安财产保险', policyNo: 'PAIC-CP-2025-9900', startDate: '2025-01-01', endDate: '2026-12-31', premium: '2800.00', updateTime: '2025-01-03 11:00', updateUser: '张小凡' },
    cargo: { company: '', policyNo: '', startDate: '', endDate: '', premium: '', updateTime: '', updateUser: '' },
    driverAccident: { company: '阳光财产保险', policyNo: 'YGCI-JY-2025-2200', startDate: '2025-09-01', endDate: '2026-08-31', premium: '480.00', updateTime: '2025-08-30 09:00', updateUser: '张小凡' },
  },
  '沪D66666': {
    compulsory: { company: '中国人民财产保险', policyNo: 'PDZA202533048200000321', startDate: '2025-02-01', endDate: '2026-01-31', premium: '950.00', updateTime: '2025-01-28 14:00', updateUser: '赵六' },
    commercial: { company: '中国人民财产保险', policyNo: 'PDAA202533048200000322', startDate: '2025-02-01', endDate: '2026-01-31', premium: '11200.00', updateTime: '2025-01-28 14:00', updateUser: '赵六' },
    excess: { company: '', policyNo: '', startDate: '', endDate: '', premium: '', updateTime: '', updateUser: '' },
    cargo: { company: '', policyNo: '', startDate: '', endDate: '', premium: '', updateTime: '', updateUser: '' },
    driverAccident: { company: '', policyNo: '', startDate: '', endDate: '', premium: '', updateTime: '', updateUser: '' },
  },
  '粤A12345': {
    compulsory: { company: '中国平安财产保险', policyNo: 'PAIC-JQ-2025-4455', startDate: '2025-03-01', endDate: '2026-02-28', premium: '950.00', updateTime: '2025-02-25 10:00', updateUser: '张三' },
    commercial: {
      company: '中国平安财产保险',
      policyNo: 'PAIC-SY-2025-4456',
      startDate: '2025-03-01',
      endDate: '2026-08-31',
      premium: '10500.00',
      updateTime: '2026-05-15 14:20',
      updateUser: '张三',
      policyTag: 'suspended',
      suspendTime: '2026-05-10',
      resumeTime: '2026-09-01',
      reinstateDate: '2026-09-01',
      attachments: [{ id: 'att-demo-suspend-1', name: 'PAIC-SY-2025-4456_停保批单.pdf', size: 245760, type: 'application/pdf', uploadedAt: '2026-05-15 14:20:00' }],
      operationLogs: [
        {
          id: 'iop-demo-suspend-1',
          time: '2026-05-15 14:20:00',
          operator: '张三',
          type: 'suspend',
          remark: '保单状态：正常 → 已停保；到期日期：2026-02-28 → 2026-08-31；中止时间：— → 2026-05-10；恢复时间：— → 2026-09-01',
          attachments: [{ id: 'att-demo-suspend-1', name: 'PAIC-SY-2025-4456_停保批单.pdf', size: 245760, type: 'application/pdf', uploadedAt: '2026-05-15 14:20:00' }],
        },
      ],
    },
    excess: { company: '中国太平洋财产保险', policyNo: 'CPIC-CP-2025-5566', startDate: '2025-03-01', endDate: '2026-02-28', premium: '2400.00', updateTime: '2025-02-25 10:00', updateUser: '张三' },
    cargo: { company: '中华联合财产保险', policyNo: 'CIC-HW-2025-7788', startDate: '2025-03-01', endDate: '2026-02-28', premium: '1500.00', updateTime: '2025-02-25 10:00', updateUser: '张三' },
    driverAccident: { company: '阳光财产保险', policyNo: 'YGCI-JY-2025-9900', startDate: '2025-03-01', endDate: '2026-02-28', premium: '520.00', updateTime: '2025-02-25 10:00', updateUser: '张三' },
  },
  '苏A55678': {
    compulsory: { company: '中国人寿财产保险', policyNo: 'GPIC-JQ-2025-0011', startDate: '2025-05-01', endDate: '2026-04-30', premium: '880.00', updateTime: '2025-04-28 09:00', updateUser: '孙七' },
    commercial: { company: '', policyNo: '', startDate: '', endDate: '', premium: '', updateTime: '', updateUser: '' },
    excess: { company: '', policyNo: '', startDate: '', endDate: '', premium: '', updateTime: '', updateUser: '' },
    cargo: { company: '', policyNo: '', startDate: '', endDate: '', premium: '', updateTime: '', updateUser: '' },
    driverAccident: { company: '', policyNo: '', startDate: '', endDate: '', premium: '', updateTime: '', updateUser: '' },
  },
  LZYTBACR2M9999001: {
    compulsory: { company: '中国人民财产保险', policyNo: 'PDZA202533048200000901', startDate: '2025-10-01', endDate: '2026-09-30', premium: '950.00', updateTime: '2025-09-28 10:00', updateUser: '李专员' },
    commercial: { company: '', policyNo: '', startDate: '', endDate: '', premium: '', updateTime: '', updateUser: '' },
    excess: { company: '中国平安财产保险', policyNo: 'PAIC-CP-2025-7701', startDate: '2025-10-01', endDate: '2026-09-30', premium: '2600.00', updateTime: '2025-09-28 10:00', updateUser: '李专员' },
    cargo: { company: '', policyNo: '', startDate: '', endDate: '', premium: '', updateTime: '', updateUser: '' },
    driverAccident: { company: '', policyNo: '', startDate: '', endDate: '', premium: '', updateTime: '', updateUser: '' },
  },
  /* 样例1：五类险种均为临期（基准日 2026-06-01 起 30 天内） */
  '浙F08888F': {
    compulsory: { company: '中国人民财产保险', policyNo: 'PDZA-DEMO-08888-JQ', startDate: '2025-06-08', endDate: '2026-06-08', premium: '950.00', updateTime: '2026-05-28 10:00', updateUser: '样例数据' },
    commercial: { company: '中国人民财产保险', policyNo: 'PDAA-DEMO-08888-SY', startDate: '2025-06-12', endDate: '2026-06-12', premium: '11800.00', updateTime: '2026-05-28 10:00', updateUser: '样例数据' },
    excess: { company: '中国平安财产保险', policyNo: 'PAIC-DEMO-08888-CP', startDate: '2025-06-16', endDate: '2026-06-16', premium: '2800.00', updateTime: '2026-05-28 10:00', updateUser: '样例数据' },
    cargo: { company: '中国太平洋财产保险', policyNo: 'CPIC-DEMO-08888-HW', startDate: '2025-06-20', endDate: '2026-06-20', premium: '1500.00', updateTime: '2026-05-28 10:00', updateUser: '样例数据' },
    driverAccident: { company: '阳光财产保险', policyNo: 'YGCI-DEMO-08888-JY', startDate: '2025-06-25', endDate: '2026-06-25', premium: '520.00', updateTime: '2026-05-28 10:00', updateUser: '样例数据' },
  },
  /* 样例2：临期 + 到期混合 */
  '浙F07777F': {
    compulsory: { company: '中国人寿财产保险', policyNo: 'GPIC-DEMO-07777-JQ', startDate: '2025-05-20', endDate: '2026-05-20', premium: '880.00', updateTime: '2026-05-28 10:00', updateUser: '样例数据' },
    commercial: { company: '中国平安财产保险', policyNo: 'PAIC-DEMO-07777-SY', startDate: '2025-06-10', endDate: '2026-06-10', premium: '10200.00', updateTime: '2026-05-28 10:00', updateUser: '样例数据' },
    excess: { company: '中华联合财产保险', policyNo: 'CIC-DEMO-07777-CP', startDate: '2025-05-31', endDate: '2026-05-31', premium: '2400.00', updateTime: '2026-05-28 10:00', updateUser: '样例数据' },
    cargo: { company: '中国太平洋财产保险', policyNo: 'CPIC-DEMO-07777-HW', startDate: '2025-06-28', endDate: '2026-06-28', premium: '1600.00', updateTime: '2026-05-28 10:00', updateUser: '样例数据' },
    driverAccident: { company: '阳光财产保险', policyNo: 'YGCI-DEMO-07777-JY', startDate: '2025-05-15', endDate: '2026-05-15', premium: '480.00', updateTime: '2026-05-28 10:00', updateUser: '样例数据' },
  },
  /* 样例3：四类临期 + 一类到期 */
  '粤AGP9001': {
    compulsory: { company: '中国人民财产保险', policyNo: 'PDZA-DEMO-9001-JQ', startDate: '2025-06-05', endDate: '2026-06-05', premium: '950.00', updateTime: '2026-05-28 10:00', updateUser: '样例数据' },
    commercial: { company: '中国人民财产保险', policyNo: 'PDAA-DEMO-9001-SY', startDate: '2025-06-30', endDate: '2026-06-30', premium: '13200.00', updateTime: '2026-05-28 10:00', updateUser: '样例数据' },
    excess: { company: '中国平安财产保险', policyNo: 'PAIC-DEMO-9001-CP', startDate: '2025-06-18', endDate: '2026-06-18', premium: '3000.00', updateTime: '2026-05-28 10:00', updateUser: '样例数据' },
    cargo: { company: '中华联合财产保险', policyNo: 'CIC-DEMO-9001-HW', startDate: '2025-05-28', endDate: '2026-05-28', premium: '1400.00', updateTime: '2026-05-28 10:00', updateUser: '样例数据' },
    driverAccident: { company: '阳光财产保险', policyNo: 'YGCI-DEMO-9001-JY', startDate: '2025-06-22', endDate: '2026-06-22', premium: '560.00', updateTime: '2026-05-28 10:00', updateUser: '样例数据' },
  },
  /* 样例4：三类临期 + 两类到期（交强/商业同日落临期） */
  '粤AGP9002': {
    compulsory: { company: '中国人寿财产保险', policyNo: 'GPIC-DEMO-9002-JQ', startDate: '2025-06-01', endDate: '2026-06-01', premium: '900.00', updateTime: '2026-05-28 10:00', updateUser: '样例数据' },
    commercial: { company: '中国平安财产保险', policyNo: 'PAIC-DEMO-9002-SY', startDate: '2025-06-15', endDate: '2026-06-15', premium: '10800.00', updateTime: '2026-05-28 10:00', updateUser: '样例数据' },
    excess: { company: '中国太平洋财产保险', policyNo: 'CPIC-DEMO-9002-CP', startDate: '2025-06-15', endDate: '2026-06-15', premium: '2600.00', updateTime: '2026-05-28 10:00', updateUser: '样例数据' },
    cargo: { company: '中华联合财产保险', policyNo: 'CIC-DEMO-9002-HW', startDate: '2025-05-10', endDate: '2026-05-10', premium: '1200.00', updateTime: '2026-05-28 10:00', updateUser: '样例数据' },
    driverAccident: { company: '阳光财产保险', policyNo: 'YGCI-DEMO-9002-JY', startDate: '2025-06-30', endDate: '2026-06-30', premium: '500.00', updateTime: '2026-05-28 10:00', updateUser: '样例数据' },
  },
  /* 样例5：五类险种均为临期（均落在 30 天临界内） */
  '沪A09999F': {
    compulsory: { company: '中国人民财产保险', policyNo: 'PDZA-DEMO-09999-JQ', startDate: '2025-07-01', endDate: '2026-07-01', premium: '950.00', updateTime: '2026-05-28 10:00', updateUser: '样例数据' },
    commercial: { company: '中国人民财产保险', policyNo: 'PDAA-DEMO-09999-SY', startDate: '2025-07-01', endDate: '2026-07-01', premium: '12500.00', updateTime: '2026-05-28 10:00', updateUser: '样例数据' },
    excess: { company: '中国平安财产保险', policyNo: 'PAIC-DEMO-09999-CP', startDate: '2025-07-01', endDate: '2026-07-01', premium: '2900.00', updateTime: '2026-05-28 10:00', updateUser: '样例数据' },
    cargo: { company: '中国太平洋财产保险', policyNo: 'CPIC-DEMO-09999-HW', startDate: '2025-07-01', endDate: '2026-07-01', premium: '1550.00', updateTime: '2026-05-28 10:00', updateUser: '样例数据' },
    driverAccident: { company: '阳光财产保险', policyNo: 'YGCI-DEMO-09999-JY', startDate: '2025-07-01', endDate: '2026-07-01', premium: '530.00', updateTime: '2026-05-28 10:00', updateUser: '样例数据' },
  },
};

const loadInsuranceFromStorage = () => {
  try {
    const raw = localStorage.getItem(IPC_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch {
    return null;
  }
};

const persistInsuranceToStorage = (data) => {
  try {
    localStorage.setItem(IPC_STORAGE_KEY, JSON.stringify(data));
  } catch {
    /* ignore */
  }
};

const loadCompareSheetsFromStorage = () => {
  try {
    const raw = localStorage.getItem(IPC_COMPARE_SHEETS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
};

const persistCompareSheetsToStorage = (sheets) => {
  try {
    localStorage.setItem(IPC_COMPARE_SHEETS_KEY, JSON.stringify(sheets));
  } catch {
    /* ignore */
  }
};

const POLICY_RECOGN_ENTRY_LABEL = { ocr: '保单批量识别', import: '批量导入' };
const POLICY_RECOGN_MODE_LABEL = Object.fromEntries(POLICY_OCR_MODES.map((m) => [m.key, m.label]));
const POLICY_RECOGN_STATUS_META = {
  pending_confirm: { label: '待确认', color: 'warning' },
  partial: { label: '部分确认', color: 'processing' },
  completed: { label: '已完成', color: 'success' },
};

const validatePolicyRecognDetailForConfirm = (detail, options = {}) => {
  const { silent = false, mode: modeOverride, recognResult } = options;
  const mode = modeOverride || bizTypeToRecognMode(detail?.bizType);
  if (mode === 'suspend') {
    const d = enrichSuspendPolicyDetail(detail);
    if (!d.policyNo) {
      if (!silent) message.warning('请填写保单号');
      return false;
    }
    if (!d.suspendTime) {
      if (!silent) message.warning('请填写中止时间');
      return false;
    }
    if (!d.newEndDate) {
      if (!silent) message.warning('请填写新到期日期');
      return false;
    }
    return true;
  }
  if (mode === 'resume') {
    const d = enrichResumePolicyDetail(detail);
    if (!d.policyNo) {
      if (!silent) message.warning('请填写保单号');
      return false;
    }
    if (!d.resumeTime) {
      if (!silent) message.warning('请填写恢复时间');
      return false;
    }
    if (!d.newEndDate) {
      if (!silent) message.warning('请填写新到期日期');
      return false;
    }
    return true;
  }
  if (mode === 'cancel') {
    const d = enrichCancelPolicyDetail(detail);
    if (!d.policyNo) {
      if (!silent) message.warning('请填写保单号');
      return false;
    }
    if (!d.cancelTime) {
      if (!silent) message.warning('请填写退保时间');
      return false;
    }
    if (!isValidPremium(d.premium)) {
      if (!silent) message.warning('请填写退保金额');
      return false;
    }
    return true;
  }
  const stripped = stripPolicyRecognDraftMeta(detail);
  if (!validatePolicyEntryDetail(stripped, { silent }).ok) return false;
  if (recognResult && !validatePolicyRecognPlateForConfirm(detail, recognResult, { silent })) return false;
  return true;
};

const getPolicyRecognSuccessResults = (results) => (
  (results || []).filter((r) => r.recognSuccess !== false)
);

const derivePolicyRecognTaskStatus = (results) => {
  const list = getPolicyRecognSuccessResults(results);
  const matched = list.filter((r) => r.matched);
  const confirmedMatched = matched.filter((r) => r.confirmed);
  if (matched.length > 0 && confirmedMatched.length >= matched.length) return 'completed';
  if (list.some((r) => r.confirmed)) return 'partial';
  return 'pending_confirm';
};

const summarizePolicyRecognTask = (results, extras = {}) => {
  const list = results || [];
  const successList = getPolicyRecognSuccessResults(list);
  const failList = list.filter((r) => r.recognSuccess === false);
  const total = extras.totalFileCount ?? list.length;
  const done = extras.recognDoneCount ?? (extras.phase === 'recognizing' ? 0 : total);
  return {
    fileCount: list.length,
    totalFileCount: total,
    recognDoneCount: done,
    recognSuccessCount: successList.length,
    recognFailCount: failList.length,
    matchedCount: successList.filter((r) => r.matched).length,
    confirmedCount: successList.filter((r) => r.confirmed).length,
  };
};

const isPolicyRecognTaskRecognizing = (task) => (
  task?.phase === 'recognizing'
  || ((task?.totalFileCount || 0) > 0 && (task?.recognDoneCount || 0) < task.totalFileCount)
);

const buildPolicyRecognTaskRecord = ({
  id,
  entry,
  mode,
  insuranceType,
  results,
  createdAt,
  creator,
  status,
  completedAt,
  phase,
  totalFileCount,
  recognDoneCount,
}) => {
  const taskPhase = phase || 'results';
  const stats = summarizePolicyRecognTask(results, {
    totalFileCount,
    recognDoneCount,
    phase: taskPhase,
  });
  return {
    id,
    createdAt: createdAt || formatCompareSheetNow(),
    completedAt: completedAt || '',
    entry,
    entryLabel: POLICY_RECOGN_ENTRY_LABEL[entry] || entry,
    mode,
    modeLabel: POLICY_RECOGN_MODE_LABEL[mode] || mode,
    insuranceType: insuranceType || '',
    creator: creator || PROTO_COMPARE_CREATOR,
    status: status || derivePolicyRecognTaskStatus(results),
    phase: taskPhase,
    ...stats,
    results: (results || []).map((r) => ({ ...r })),
    fileNames: (results || []).map((r) => r.fileName).filter(Boolean),
  };
};

const loadPolicyRecognTasksFromStorage = () => {
  try {
    const raw = localStorage.getItem(IPC_POLICY_RECOGN_TASKS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
};

const persistPolicyRecognTasksToStorage = (tasks) => {
  try {
    localStorage.setItem(IPC_POLICY_RECOGN_TASKS_KEY, JSON.stringify(tasks));
  } catch {
    /* ignore */
  }
};

const loadInsuranceHistoryEditsFromStorage = () => {
  try {
    const raw = localStorage.getItem(IPC_INSURANCE_HISTORY_EDITS_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
};

const persistInsuranceHistoryEditsToStorage = (edits) => {
  try {
    localStorage.setItem(IPC_INSURANCE_HISTORY_EDITS_KEY, JSON.stringify(edits));
  } catch {
    /* ignore */
  }
};

const createMockPolicyRecognTasks = () => {
  const insMap = buildMockInsuranceMap();

  const filesCompleted1 = [
    { uid: 'demo-c1', name: '粤BDG9701_交强险.pdf', status: 'done' },
    { uid: 'demo-c2', name: '粤AGR9766_商业险.pdf', status: 'done' },
    { uid: 'demo-c3', name: '沪A03561F_交强险.pdf', status: 'done' },
  ];
  const resultsCompleted1 = buildMockOcrResults(filesCompleted1, 'policy', '交强险', insMap);
  if (resultsCompleted1[0]) resultsCompleted1[0].confirmed = true;

  const filesCompleted2 = [
    { uid: 'demo-c4', name: '粤B88888_复驶批单.pdf', status: 'done' },
    { uid: 'demo-c5', name: '京ADH1653_复驶批单.pdf', status: 'done' },
    { uid: 'demo-c6', name: '粤BDG9701_复驶批单.pdf', status: 'done' },
    { uid: 'demo-c7', name: '模糊扫描件_复驶.pdf', status: 'done' },
  ];
  const resultsCompleted2 = buildMockOcrResults(filesCompleted2, 'resume', '', insMap);
  resultsCompleted2.forEach((r) => {
    if (r.recognSuccess !== false) r.confirmed = true;
  });

  const filesSuspend = [
    { uid: 'demo-s1', name: '沪A06192F_商业险_停保批单.pdf', status: 'done' },
    { uid: 'demo-s2', name: '粤AGR0772_商业险停保.pdf', status: 'done' },
  ];
  const resultsSuspend = buildMockOcrResults(filesSuspend, 'suspend', '', insMap);

  return [
    buildPolicyRecognTaskRecord({
      id: 'TASK-83892906',
      entry: 'ocr',
      mode: 'policy',
      insuranceType: '交强险',
      results: resultsCompleted1,
      createdAt: '2026-05-28 15:20:10',
      completedAt: '2026-05-28 15:32:00',
      phase: 'results',
      totalFileCount: filesCompleted1.length,
      recognDoneCount: filesCompleted1.length,
    }),
    buildPolicyRecognTaskRecord({
      id: 'TASK-84120155',
      entry: 'ocr',
      mode: 'resume',
      insuranceType: '',
      results: resultsCompleted2,
      createdAt: '2026-05-30 09:15:00',
      completedAt: '2026-05-30 09:18:40',
      phase: 'results',
      totalFileCount: filesCompleted2.length,
      recognDoneCount: filesCompleted2.length,
    }),
    buildPolicyRecognTaskRecord({
      id: 'TASK-84330812',
      entry: 'ocr',
      mode: 'suspend',
      insuranceType: '',
      results: resultsSuspend,
      createdAt: '2026-06-02 14:22:00',
      completedAt: '2026-06-02 14:25:18',
      phase: 'results',
      totalFileCount: filesSuspend.length,
      recognDoneCount: filesSuspend.length,
    }),
    buildPolicyRecognTaskRecord({
      id: 'TASK-84210588',
      entry: 'ocr',
      mode: 'policy',
      insuranceType: '商业险',
      results: [],
      createdAt: '2026-06-01 10:08:22',
      phase: 'recognizing',
      totalFileCount: 5,
      recognDoneCount: 2,
    }),
  ];
};

const buildMockInsuranceMap = () => {
  const map = {};
  MOCK_VEHICLES.forEach((v) => {
    const key = getVehicleLedgerKey(v);
    const seed = getInitialInsuranceSeed(v);
    map[key] = seed ? JSON.parse(JSON.stringify(seed)) : createEmptyInsuranceRecord();
  });
  return map;
};

const createMockCompareRowWithQuote = (vehicle, insMap, insuranceType, premium, extra = {}) => {
  const row = buildCompareRowFromVehicle(vehicle, insMap);
  const quoteId = createQuoteId();
  row.insuranceType = insuranceType;
  row.quotes = [{ id: quoteId, company: INSURANCE_MGMT_COMPANIES[0], premium }];
  row.confirmedQuoteId = quoteId;
  row.latestPayDate = extra.latestPayDate || '2026-06-15';
  row.procurementStatus = normalizeCompareProcurementStatus(extra.procurementStatus || 'none');
  row.procurementSubmittedAt = extra.procurementSubmittedAt || '';
  row.procurementCurrentApprover = extra.procurementCurrentApprover || '';
  return row;
};

const createMockCompareSheets = () => {
  const insMap = buildMockInsuranceMap();
  const sheet1Rows = normalizeCompareRows([
    createMockCompareRowWithQuote(MOCK_VEHICLES[0], insMap, '交强险', '950.00', { latestPayDate: '2026-06-03', procurementStatus: 'approved' }),
    createMockCompareRowWithQuote(MOCK_VEHICLES[0], insMap, '商业险', '12800.50', {
      latestPayDate: '2026-06-04',
      procurementStatus: 'submitted',
      procurementCurrentApprover: MOCK_WORKFLOW_CURRENT_APPROVERS[0],
      procurementSubmittedAt: '2026-05-29 10:00:00',
    }),
    createMockCompareRowWithQuote(MOCK_VEHICLES[1], insMap, '交强险', '950.00', {
      latestPayDate: '2026-05-28',
      procurementStatus: 'submitted',
      procurementSubmittedAt: '2026-05-31 09:15:00',
      procurementCurrentApprover: '',
    }),
  ]);
  const sheet2Rows = normalizeCompareRows([
    createMockCompareRowWithQuote(MOCK_VEHICLES[2], insMap, '交强险', '880.00', { latestPayDate: '2026-06-02', procurementStatus: 'approved' }),
    createMockCompareRowWithQuote(MOCK_VEHICLES[2], insMap, '商业险', '9850.00', { latestPayDate: '2026-06-02', procurementStatus: 'approved' }),
    createMockCompareRowWithQuote(MOCK_VEHICLES[7], insMap, '交强险', '950.00', {
      latestPayDate: '2026-06-01',
      procurementStatus: 'submitted',
      procurementCurrentApprover: MOCK_WORKFLOW_CURRENT_APPROVERS[1],
      procurementSubmittedAt: '2026-05-30 14:00:00',
    }),
    createMockCompareRowWithQuote(MOCK_VEHICLES[7], insMap, '超赔险', '2600.00', {
      latestPayDate: '2026-07-01',
      procurementStatus: 'submitted',
      procurementCurrentApprover: MOCK_WORKFLOW_CURRENT_APPROVERS[2],
      procurementSubmittedAt: '2026-05-30 14:00:00',
    }),
    createMockCompareRowWithQuote(MOCK_VEHICLES[3], insMap, '交强险', '950.00', {
      latestPayDate: '2026-06-10',
      procurementStatus: 'submitted',
      procurementCurrentApprover: MOCK_WORKFLOW_CURRENT_APPROVERS[3],
      procurementSubmittedAt: '2026-05-27 16:40:00',
    }),
    createMockCompareRowWithQuote(MOCK_VEHICLES[1], insMap, '商业险', '11200.00', {
      latestPayDate: '2026-05-20',
      procurementStatus: 'withdrawn',
      procurementSubmittedAt: '2026-05-18 11:20:00',
    }),
    createMockCompareRowWithQuote(MOCK_VEHICLES[1], insMap, '货物险', '1600.00', {
      latestPayDate: '2026-05-22',
      procurementStatus: 'rejected',
      procurementSubmittedAt: '2026-05-19 09:30:00',
    }),
  ]);
  const sheet3Rows = normalizeCompareRows([
    createMockCompareRowWithQuote(MOCK_VEHICLES[4], insMap, '商业险', '15600.00', { latestPayDate: '2026-05-20' }),
  ]);
  return [
    normalizeCompareSheet({
      id: 'cs-mock-20260528',
      createdAt: '2026-05-28 14:20:00',
      createdBy: '张明辉',
      periodLabel: '2026年5-6月',
      remark: '华东区二季度集中采购',
      attachments: [
        { id: 'att-demo-1', uid: 'att-demo-1', name: '6月比价询价单.pdf', size: 245760, type: 'application/pdf', uploadedAt: '2026-05-28 14:18:00' },
        { id: 'att-demo-2', uid: 'att-demo-2', name: '保险公司报价截图.zip', size: 1048576, type: 'application/zip', uploadedAt: '2026-05-28 14:19:00' },
      ],
      rows: sheet1Rows,
    }),
    normalizeCompareSheet({
      id: 'cs-mock-20260520',
      createdAt: '2026-05-20 09:15:00',
      createdBy: '李专员',
      periodLabel: '2026年5月',
      remark: '苏粤车辆续保比价',
      attachments: [
        { id: 'att-demo-3', uid: 'att-demo-3', name: '5月比价汇总表.xlsx', size: 186240, type: 'application/vnd.ms-excel', uploadedAt: '2026-05-20 09:10:00' },
      ],
      rows: sheet2Rows,
    }),
    normalizeCompareSheet({
      id: 'cs-mock-20260510',
      createdAt: '2026-05-10 16:40:00',
      createdBy: '王专员',
      periodLabel: '2026年5月',
      remark: '浙A88888 商业险新保询价',
      attachments: [
        { id: 'att-demo-4', uid: 'att-demo-4', name: '询价邮件截图.png', size: 98304, type: 'image/png', uploadedAt: '2026-05-10 16:35:00' },
      ],
      rows: sheet3Rows,
    }),
  ];
};

const compareSheetMatchesPlateFilter = (sheet, plateKey) => {
  if (!plateKey) return true;
  const key = plateKey.trim().toLowerCase();
  return (sheet.rows || []).some((row) => {
    const plate = (row.plateNo || '').trim().toLowerCase();
    const vin = (row.vin || '').trim().toLowerCase();
    if (plate && plate.includes(key)) return true;
    if (!plate && (NO_PLATE_LABEL.toLowerCase().includes(key) || key.includes('暂无'))) return true;
    if (vin && vin.includes(key)) return true;
    return false;
  });
};

const compareSheetMatchesCreatedRange = (createdAt, range) => {
  if (!range || !range[0] || !range[1]) return true;
  if (!createdAt || !moment) return true;
  const day = moment(String(createdAt).slice(0, 10), 'YYYY-MM-DD', true);
  if (!day.isValid()) return true;
  const start = range[0].clone().startOf('day');
  const end = range[1].clone().endOf('day');
  return day.isSameOrAfter(start) && day.isSameOrBefore(end);
};

const insuranceEndDateMatchesRange = (endDate, range) => {
  if (!range?.[0] || !range?.[1]) return true;
  if (!endDate || !moment) return false;
  const day = moment(endDate, 'YYYY-MM-DD', true);
  if (!day.isValid()) return false;
  const start = range[0].clone().startOf('day');
  const end = range[1].clone().endOf('day');
  return day.isSameOrAfter(start) && day.isSameOrBefore(end);
};

const vehicleMatchesListInsuranceTypeFilter = (ledgerKey, insuranceTypeLabel, endDateRange, insuranceData) => {
  if (!insuranceTypeLabel) return true;
  const typeKey = INSURANCE_LABEL_TO_KEY[insuranceTypeLabel];
  if (!typeKey) return true;
  const item = insuranceData?.[ledgerKey]?.[typeKey];
  const endDate = item?.endDate;
  if (!endDate && !item?.policyNo) return false;
  if (endDateRange?.[0] && endDateRange?.[1]) {
    return insuranceEndDateMatchesRange(endDate, endDateRange);
  }
  return true;
};

const compareSheetMatchesPayAlertFilter = (sheet, filter) => {
  if (!filter || filter === 'all') return true;
  const alerts = calcCompareSheetPayAlerts(sheet);
  if (filter === 'warning') return alerts.warning > 0;
  if (filter === 'overdue') return alerts.overdue > 0;
  return true;
};

const DEFAULT_COMPARE_MGMT_FILTERS = { plateNo: '', createdRange: null, payAlertFilter: 'all' };
const DEFAULT_COMPARE_EDITOR_FILTERS = { vehicles: '', latestPayWithin3Days: false, insuranceType: '' };
const DEFAULT_POLICY_RECOGN_TASK_FILTERS = { mode: '全部', createdRange: null };

const compareRowMatchesVehicleFilter = (row, vehicleText) => {
  const tokens = parseMultiPlates(vehicleText);
  if (!tokens.length) return true;
  const plate = (row.plateNo || '').trim().toUpperCase();
  const vin = (row.vin || '').trim().toUpperCase();
  return tokens.some((token) => {
    if (plate && (plate === token || plate.includes(token))) return true;
    if (vin && (vin === token || vin.includes(token))) return true;
    return false;
  });
};

const isCompareRowLatestPayWithinDays = (row, days = LATEST_PAY_WARN_DAYS) => {
  const diff = getLatestPayDateDiffDays(row.latestPayDate);
  if (diff === null) return false;
  return diff <= days;
};

const filterCompareEditorRows = (rows, filters) => {
  const type = filters.insuranceType || '';
  return (rows || []).filter((row) => {
    if (!compareRowMatchesVehicleFilter(row, filters.vehicles)) return false;
    if (filters.latestPayWithin3Days && !isCompareRowLatestPayWithinDays(row)) return false;
    if (type && (row.insuranceType || '交强险') !== type) return false;
    return true;
  });
};

const countCompareRowsByInsuranceType = (rows) => {
  const counts = {};
  QUOTE_INSURANCE_TYPES.forEach((t) => { counts[t] = 0; });
  (rows || []).forEach((row) => {
    const t = row.insuranceType || '交强险';
    if (counts[t] !== undefined) counts[t] += 1;
  });
  return counts;
};

const tableTitleMultiline = (...lines) => (
  <div className="lc-table-th-multiline">
    {lines.map((line, idx) => (
      <span key={idx} className="lc-table-th-line">{line}</span>
    ))}
  </div>
);

const listColumnHeaderCell = () => ({ className: 'lc-th-wrap' });

const mapInsuranceStatusToBadge = (type) => {
  if (type === 'success') return 'success';
  if (type === 'warning') return 'warning';
  if (type === 'expired') return 'error';
  return 'default';
};

/** 到期日期列：剩余 / 过期天数文案 */
const getInsuranceRemainShortText = (status) => {
  const { type, diffDays } = status || {};
  if (type === 'unuploaded') return '未购买';
  if (type === 'expired') return diffDays != null ? `过期${Math.abs(diffDays)}天` : '已过期';
  if (diffDays != null) return `剩余${diffDays}天`;
  return '—';
};

const sortVehiclesRetiredLast = (vehicles) => {
  const active = [];
  const retired = [];
  vehicles.forEach((v) => {
    if (v.status === '退出运营') retired.push(v);
    else active.push(v);
  });
  return [...active, ...retired];
};

const parseMultiPlates = (text) => {
  const raw = (text || '').trim();
  if (!raw) return [];
  const lines = raw.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const expanded = lines.flatMap((line) => {
    if (/[,，、;；]/.test(line)) {
      return line.split(/[,，、;；]+/).map((s) => s.trim()).filter(Boolean);
    }
    return [line];
  });
  return [...new Set(expanded.map((s) => s.toUpperCase()))];
};

/** 批量新增比价行：每行一条车牌或 VIN，不去重 */
const parseBatchVehicleLines = (text) => (
  (text || '').trim().split(/\r?\n/).map((line) => line.trim()).filter(Boolean)
);

const findVehicleByPlateOrVin = (token) => {
  const key = (token || '').trim();
  if (!key) return null;
  return findVehicleByPlate(key) || findVehicleByVin(key);
};

const ICONS = {
  vehicle: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>,
  success: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>,
  warning: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  shield: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  policy: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
  more: <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="1.75"/><circle cx="12" cy="12" r="1.75"/><circle cx="19" cy="12" r="1.75"/></svg>,
};

const PAGE_STYLE = `
.lc-edit-page { font-family: system-ui, -apple-system, sans-serif; color: #1e293b; }
.lc-page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
.lc-filter-card.ant-card { border-radius: 16px !important; border: 1px solid #e2e8f0 !important; box-shadow: 0 4px 20px -4px rgba(15, 23, 42, 0.03) !important; margin-bottom: 16px; }
.lc-filter-card > .ant-card-head { border-bottom: 1px solid #f1f5f9 !important; min-height: auto; padding: 12px 20px !important; }
.lc-filter-card > .ant-card-head .ant-card-head-title { font-size: 15px !important; font-weight: 700 !important; color: #0f172a !important; padding: 0 !important; }
.lc-filter-card > .ant-card-body { padding: 16px 20px 20px !important; }
.lc-filter-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 14px 24px; }
@media (max-width: 1100px) { .lc-filter-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media (max-width: 720px) { .lc-filter-grid { grid-template-columns: 1fr; } }
.lc-filter-field { display: flex; align-items: center; gap: 12px; min-width: 0; }
.lc-filter-field-label { flex: 0 0 72px; text-align: right; font-size: 13px; font-weight: 500; color: #475569; line-height: 1.4; white-space: nowrap; }
.lc-filter-field-control { flex: 1; min-width: 0; }
.lc-filter-field-control .ant-input, .lc-filter-field-control .ant-select { width: 100%; }
.lc-multi-plate-pop { width: 320px; padding: 4px 2px; }
.lc-multi-plate-pop-hint { font-size: 12px; color: #64748b; margin-bottom: 8px; line-height: 1.5; }
.lc-multi-plate-pop-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 10px; }
.lc-multi-plate-trigger { cursor: pointer; }
.lc-multi-plate-trigger .ant-input { cursor: pointer; }
.lc-filter-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 16px; padding-top: 16px; border-top: 1px solid #f1f5f9; }
.lc-alert-stats-row { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 12px; margin-bottom: 16px; }
@media (max-width: 1200px) { .lc-alert-stats-row { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
@media (max-width: 768px) { .lc-alert-stats-row { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
.lc-alert-card { display: flex; align-items: flex-start; gap: 12px; padding: 14px 30px 14px 16px; border-radius: 12px; border: 1px solid #e2e8f0; background: #fff; position: relative; overflow: hidden; min-width: 0; }
.lc-alert-card-main { flex: 1; min-width: 0; }
.lc-alert-card-icon { flex-shrink: 0; width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; }
.lc-alert-card-val { font-size: 26px; font-weight: 800; line-height: 1.1; color: #0f172a; font-variant-numeric: tabular-nums; }
.lc-alert-card-title { font-size: 13px; font-weight: 600; color: #334155; margin-top: 2px; }
.lc-alert-card-tip-anchor { position: absolute; top: 8px; right: 8px; z-index: 2; line-height: 0; }
.lc-alert-card-tip { width: 18px; height: 18px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; color: #94a3b8; background: rgba(255,255,255,.92); border: 1px solid #e2e8f0; cursor: help; line-height: 0; }
.lc-alert-card-tip:hover { color: #64748b; border-color: #cbd5e1; background: #fff; }
.lc-alert-card--total { background: linear-gradient(135deg, #f8fafc 0%, #fff 100%); }
.lc-alert-card--total .lc-alert-card-icon { background: #e2e8f0; color: #475569; }
.lc-alert-card--normal { background: linear-gradient(135deg, #ecfdf5 0%, #fff 55%); border-color: #bbf7d0; }
.lc-alert-card--normal .lc-alert-card-icon { background: #d1fae5; color: #059669; }
.lc-alert-card--normal .lc-alert-card-val { color: #047857; }
.lc-alert-card--warning { background: linear-gradient(135deg, #fff7ed 0%, #fff 55%); border-color: #fed7aa; }
.lc-alert-card--warning .lc-alert-card-icon { background: #ffedd5; color: #ea580c; }
.lc-alert-card--warning .lc-alert-card-val { color: #c2410c; }
.lc-alert-card--expired { background: linear-gradient(135deg, #fef2f2 0%, #fff 55%); border-color: #fecaca; }
.lc-alert-card--expired .lc-alert-card-icon { background: #fee2e2; color: #dc2626; }
.lc-alert-card--expired .lc-alert-card-val { color: #b91c1c; }
.lc-alert-card--unuploaded { background: linear-gradient(135deg, #f8fafc 0%, #fff 55%); }
.lc-alert-card--unuploaded .lc-alert-card-icon { background: #f1f5f9; color: #64748b; }
.lc-alert-card--unuploaded .lc-alert-card-val { color: #64748b; }
.lc-alert-card-clickable { cursor: pointer; transition: box-shadow .2s ease, border-color .2s ease; }
.lc-alert-card-clickable:hover { box-shadow: 0 4px 14px rgba(15, 23, 42, 0.08); }
.lc-alert-card-active { box-shadow: 0 0 0 2px rgba(22, 93, 255, 0.2) !important; border-color: #165dff !important; }
.lc-table-section { margin-bottom: 0; }
.lc-table-toolbar { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px 16px; margin-bottom: 8px; min-height: 32px; }
.lc-table-card { background: #fff; border-radius: 16px; border: 1px solid #e2e8f0; box-shadow: 0 4px 20px -4px rgba(15, 23, 42, 0.03); overflow: hidden; }
.lc-table-card .ant-table-thead > tr > th { background: #f8fafc !important; color: #475569 !important; font-weight: 700 !important; font-size: 13px !important; border-bottom: 1px solid #e2e8f0 !important; padding: 12px 16px !important; vertical-align: middle; }
.lc-table-card .ant-table-thead > tr > th.lc-th-wrap { padding: 10px 8px !important; text-align: center; vertical-align: middle; white-space: nowrap; }
.lc-table-th-multiline { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 2px; line-height: 1.3; white-space: normal; }
.lc-table-th-line { display: block; font-size: 12px; font-weight: 700; color: #475569; }
.lc-list-expire-cell { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
.lc-list-expire-date { font-size: 12px; font-weight: 600; line-height: 1.35; }
.lc-list-expire-meta { line-height: 1.2; }
.lc-list-status-badge-wrap { display: inline-flex; max-width: 100%; }
.lc-list-status-badge-wrap .ant-badge { display: inline-flex; align-items: center; max-width: 100%; }
.lc-list-status-badge-text { font-size: 11px; font-weight: 600; white-space: nowrap; }
.lc-list-table .ant-table-wrapper, .lc-list-table .ant-table { width: 100% !important; }
.lc-list-table .ant-table-content table { table-layout: fixed; width: 100% !important; }
.lc-cell-ellipsis { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.lc-table-card .ant-table-tbody > tr:not(.ant-table-measure-row) > td { padding: 10px 8px !important; border-bottom: 1px solid #f1f5f9 !important; }
.lc-table-card .ant-table-tbody > tr:not(.ant-table-measure-row):hover > td { background: #f8fafc !important; }
.lc-table-card .ant-table-tbody > tr.lc-row-retired:not(.ant-table-measure-row) > td { background: #f8fafc !important; color: #94a3b8; }
.lc-list-plate-cell { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.lc-list-plate-sub { display: block; font-size: 11px; font-weight: 500; line-height: 1.35; }
.lc-list-plate-empty { color: #94a3b8 !important; font-style: italic; font-weight: 500 !important; }
.lc-table-toolbar-actions { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; margin-left: auto; }
.lc-compare-modal .ant-modal-content { border-radius: 16px; overflow: hidden; }
.lc-compare-modal .ant-modal-header { background: linear-gradient(135deg, #f8fafc 0%, #fff 100%); border-bottom: 1px solid #e2e8f0; padding: 16px 20px; }
.lc-compare-modal .ant-modal-title { font-size: 16px; font-weight: 700; color: #0f172a; }
.lc-compare-modal .ant-modal-body { padding: 16px 20px 12px; max-height: calc(100vh - 180px); overflow: auto; }
.lc-compare-modal .ant-modal-footer { border-top: 1px solid #f1f5f9; padding: 12px 20px 16px; }
.lc-compare-toolbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; flex-wrap: wrap; gap: 8px; }
.lc-compare-table-wrap { border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; background: #fff; box-shadow: 0 4px 16px -4px rgba(15, 23, 42, 0.06); }
.lc-compare-table .ant-table-thead > tr > th { background: #f1f5f9 !important; color: #334155 !important; font-size: 12px !important; font-weight: 700 !important; padding: 10px 8px !important; white-space: nowrap; border-bottom: 1px solid #e2e8f0 !important; }
.lc-compare-table .ant-table-thead > tr > th.lc-compare-th-key { background: #ecfdf5 !important; color: #065f46 !important; }
.lc-compare-table .ant-table-thead > tr > th.lc-compare-th-auto { background: #f8fafc !important; }
.lc-compare-table .ant-table-thead > tr > th.lc-compare-th-edit { background: #fffbeb !important; color: #92400e !important; }
.lc-compare-th-batch-trigger { display: inline-flex; align-items: center; gap: 4px; cursor: pointer; user-select: none; white-space: nowrap; }
.lc-compare-th-batch-trigger:hover { color: #059669 !important; }
.lc-compare-th-batch-tag { font-size: 10px; font-weight: 700; color: #059669; background: #ecfdf5; border: 1px solid #bbf7d0; padding: 0 4px; border-radius: 4px; line-height: 16px; }
.lc-compare-table .ant-table-thead > tr > th.ant-table-cell-fix-right.lc-compare-th-edit { background: #fffbeb !important; z-index: 3; }
.lc-compare-table .ant-table-thead > tr > th.ant-table-cell-fix-right.lc-compare-th-auto { background: #f8fafc !important; z-index: 3; }
.lc-compare-table .ant-table-tbody > tr > td.ant-table-cell-fix-right { z-index: 2; }
.lc-compare-table .ant-table-tbody > tr > td { padding: 8px 6px !important; vertical-align: middle !important; font-size: 12px; border-bottom: 1px solid #f1f5f9 !important; }
.lc-compare-table .ant-table-tbody > tr:nth-child(even) > td { background: #fafbfc; }
.lc-compare-table .ant-table-tbody > tr:hover > td { background: #f0fdf4 !important; }
.lc-compare-table .ant-table-tbody > tr.ant-table-row-selected > td { background: #ecfdf5 !important; }
.lc-compare-table .ant-table-thead > tr > th.ant-table-cell-fix-left,
.lc-compare-table .ant-table-thead > tr > th.ant-table-cell-fix-right { background: #f1f5f9 !important; }
.lc-compare-table .ant-table-thead > tr > th.ant-table-cell-fix-left.lc-compare-th-key { background: #ecfdf5 !important; }
.lc-compare-table .ant-table-tbody > tr > td.ant-table-cell-fix-left,
.lc-compare-table .ant-table-tbody > tr > td.ant-table-cell-fix-right { background: #fff !important; }
.lc-compare-table .ant-table-tbody > tr:nth-child(even) > td.ant-table-cell-fix-left,
.lc-compare-table .ant-table-tbody > tr:nth-child(even) > td.ant-table-cell-fix-right { background: #fafbfc !important; }
.lc-compare-table .ant-table-tbody > tr:hover > td.ant-table-cell-fix-left,
.lc-compare-table .ant-table-tbody > tr:hover > td.ant-table-cell-fix-right { background: #f0fdf4 !important; }
.lc-compare-table .ant-table-tbody > tr.ant-table-row-selected > td.ant-table-cell-fix-left,
.lc-compare-table .ant-table-tbody > tr.ant-table-row-selected > td.ant-table-cell-fix-right { background: #ecfdf5 !important; }
.lc-compare-table .ant-table-cell-fix-left-last::after,
.lc-compare-table .ant-table-cell-fix-right-first::after { box-shadow: inset 10px 0 8px -8px rgba(15, 23, 42, 0.12); }
.lc-compare-cell-select { width: 100%; min-width: 100px; }
.lc-compare-cell-select .ant-select-selector { border-radius: 6px !important; font-size: 12px !important; min-height: 28px !important; }
.lc-compare-cell-input { width: 100%; min-width: 88px; border-radius: 6px; }
.lc-compare-cell-input.ant-input-sm, .lc-compare-cell-input.ant-picker-small { font-size: 12px; }
.lc-compare-readonly { display: block; padding: 4px 8px; min-height: 28px; line-height: 20px; border-radius: 6px; background: #f8fafc; border: 1px solid #f1f5f9; color: #334155; font-size: 12px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.lc-compare-readonly--wrap { white-space: normal; word-break: break-all; line-height: 1.4; }
.lc-compare-readonly.is-empty { color: #94a3b8; }
.lc-compare-readonly.is-linked { background: #f0fdf4; border-color: #bbf7d0; color: #065f46; font-weight: 500; }
.lc-compare-action-cell { display: flex; align-items: center; gap: 2px; flex-wrap: wrap; }
.lc-compare-action-cell .ant-btn-link { font-size: 12px; font-weight: 600; padding: 0 4px; height: auto; }
.lc-compare-quote-btn { display: inline-flex; align-items: center; gap: 4px; padding: 2px 8px; border-radius: 6px; background: #ecfdf5; border: 1px solid #a7f3d0; color: #059669 !important; font-weight: 600 !important; font-size: 12px !important; }
.lc-compare-quote-btn:hover { background: #d1fae5 !important; }
.lc-quote-popover-overlay .ant-popover-inner { padding: 0 !important; border-radius: 14px !important; overflow: hidden; box-shadow: 0 16px 48px -12px rgba(15, 23, 42, 0.22) !important; border: 1px solid #e2e8f0; }
.lc-quote-popover-overlay .ant-popover-arrow { display: none; }
.lc-quote-card { width: 400px; max-width: 92vw; }
.lc-quote-card-head { display: flex; align-items: center; justify-content: space-between; gap: 8px; padding: 14px 16px; background: linear-gradient(135deg, #ecfdf5 0%, #f8fafc 55%, #fff 100%); border-bottom: 1px solid #e2e8f0; }
.lc-quote-card-title { font-size: 15px; font-weight: 700; color: #0f172a; }
.lc-quote-card-plate { font-size: 11px; font-weight: 600; color: #059669; background: #d1fae5; border: 1px solid #a7f3d0; padding: 2px 8px; border-radius: 999px; white-space: nowrap; }
.lc-quote-card-body { padding: 14px 16px 16px; max-height: 420px; overflow-y: auto; }
.lc-quote-card-body::-webkit-scrollbar { width: 4px; }
.lc-quote-card-body::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 2px; }
.lc-quote-list-label { font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 8px; }
.lc-quote-empty { text-align: center; padding: 20px 12px; border-radius: 10px; background: #f8fafc; border: 1px dashed #e2e8f0; color: #94a3b8; font-size: 12px; margin-bottom: 14px; }
.lc-quote-item-card { display: flex; align-items: flex-start; gap: 10px; padding: 10px 12px; margin-bottom: 8px; border-radius: 10px; border: 1px solid #e2e8f0; background: #fff; transition: border-color .2s, box-shadow .2s; }
.lc-quote-item-card:hover { border-color: #cbd5e1; box-shadow: 0 2px 8px rgba(15, 23, 42, 0.04); }
.lc-quote-item-card.is-selected { border-color: #10b981; background: linear-gradient(135deg, #f0fdf4 0%, #fff 100%); box-shadow: 0 0 0 1px rgba(16, 185, 129, 0.15); }
.lc-quote-item-card .ant-radio { margin-top: 2px; }
.lc-quote-item-main { flex: 1; min-width: 0; }
.lc-quote-item-company { font-size: 13px; font-weight: 600; color: #0f172a; line-height: 1.4; margin-bottom: 4px; }
.lc-quote-item-row { display: flex; align-items: center; flex-wrap: wrap; gap: 6px; font-size: 12px; color: #64748b; }
.lc-quote-type-tag { display: inline-flex; align-items: center; padding: 1px 7px; border-radius: 4px; background: #eff6ff; border: 1px solid #bfdbfe; color: #1d4ed8; font-size: 11px; font-weight: 600; }
.lc-quote-price { font-size: 14px; font-weight: 700; color: #059669; font-variant-numeric: tabular-nums; }
.lc-quote-price-unit { font-size: 11px; font-weight: 500; color: #64748b; margin-left: 2px; }
.lc-quote-item-del { flex-shrink: 0; padding: 0 4px !important; height: auto !important; font-size: 12px !important; }
.lc-quote-form-wrap { margin-top: 14px; padding-top: 14px; border-top: 1px solid #f1f5f9; }
.lc-quote-form-title { font-size: 13px; font-weight: 700; color: #0f172a; margin-bottom: 12px; display: flex; align-items: center; gap: 6px; }
.lc-quote-form-title::before { content: ''; width: 3px; height: 14px; border-radius: 2px; background: #10b981; }
.lc-quote-form-field { margin-bottom: 10px; }
.lc-quote-form-label { display: block; font-size: 12px; font-weight: 600; color: #475569; margin-bottom: 5px; }
.lc-quote-form-label-required::after { content: ' *'; color: #ef4444; }
.lc-quote-form-actions { display: flex; justify-content: flex-end; margin-top: 4px; }
.lc-quote-form-actions .ant-btn-primary { border-radius: 8px; font-weight: 600; background: linear-gradient(135deg, #10b981 0%, #059669 100%); border: none; box-shadow: 0 2px 8px rgba(16, 185, 129, 0.25); }
.lc-compare-quote-cell { display: flex; flex-direction: column; gap: 6px; min-width: 0; }
.lc-compare-quote-inline-list { display: flex; flex-direction: column; gap: 4px; width: 100%; }
.lc-compare-quote-inline-item { display: flex; align-items: center; gap: 4px; padding: 4px 6px; border-radius: 6px; border: 1px solid #e2e8f0; background: #fff; cursor: pointer; transition: border-color .15s, background .15s; margin: 0 !important; }
.lc-compare-quote-inline-item:hover { border-color: #cbd5e1; background: #f8fafc; }
.lc-compare-quote-inline-item.is-selected { border-color: #10b981; background: #f0fdf4; box-shadow: 0 0 0 1px rgba(16, 185, 129, 0.12); }
.lc-compare-quote-inline-item .ant-radio { margin-right: 0; top: 0; }
.lc-compare-quote-inline-company { flex: 1; min-width: 0; font-size: 11px; font-weight: 600; color: #334155; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.lc-compare-quote-inline-price { flex-shrink: 0; font-size: 12px; font-weight: 700; color: #059669; font-variant-numeric: tabular-nums; }
.lc-compare-quote-inline-del { flex-shrink: 0; padding: 0 2px !important; height: 18px !important; min-width: 18px !important; font-size: 14px !important; line-height: 1 !important; color: #94a3b8 !important; }
.lc-compare-quote-inline-del:hover { color: #ef4444 !important; }
.lc-compare-quote-add { padding: 0 !important; height: auto !important; font-size: 12px !important; font-weight: 600 !important; color: #059669 !important; align-self: flex-start; }
.lc-compare-quote-empty-hint { font-size: 11px; color: #94a3b8; line-height: 1.4; }
.lc-quote-card-type-badge { font-size: 11px; font-weight: 600; color: #1d4ed8; background: #eff6ff; border: 1px solid #bfdbfe; padding: 2px 8px; border-radius: 999px; white-space: nowrap; }
.lc-compare-footer { margin-top: 14px; padding-top: 14px; border-top: 1px solid #e2e8f0; display: flex; flex-direction: column; gap: 12px; }
.lc-compare-remark-field { display: flex; flex-direction: column; gap: 6px; }
.lc-compare-remark-label { font-size: 13px; font-weight: 600; color: #334155; }
.lc-compare-field-label-required::after { content: '*'; color: #ef4444; margin-left: 2px; }
.lc-compare-total-row { display: flex; gap: 12px; align-items: stretch; }
@media (max-width: 720px) { .lc-compare-total-row { flex-direction: column; } }
.lc-compare-total-bar { display: flex; align-items: baseline; flex-wrap: wrap; gap: 8px 16px; padding: 12px 16px; border-radius: 10px; background: linear-gradient(135deg, #ecfdf5 0%, #f8fafc 100%); border: 1px solid #bbf7d0; }
.lc-compare-total-row .lc-compare-total-bar { flex: 1; min-width: 0; flex-direction: column; align-items: flex-start; gap: 6px; }
.lc-compare-total-label { font-size: 13px; font-weight: 600; color: #334155; }
.lc-compare-total-amount { font-size: 22px; font-weight: 800; color: #059669; font-variant-numeric: tabular-nums; line-height: 1.2; }
.lc-compare-total-unit { font-size: 13px; font-weight: 600; color: #059669; margin-left: 2px; }
.lc-compare-total-hint { font-size: 12px; color: #64748b; margin-left: auto; }
.lc-compare-total-row .lc-compare-total-hint { margin-left: 0; }
.lc-copy-pop { width: 200px; }
.lc-copy-pop-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 10px; }
.lc-compare-mgmt-modal .ant-modal-body { padding: 16px 20px 20px; }
.lc-compare-mgmt-filter { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px 24px; margin-bottom: 14px; padding-bottom: 14px; border-bottom: 1px solid #f1f5f9; }
@media (max-width: 720px) { .lc-compare-mgmt-filter { grid-template-columns: 1fr; } }
.lc-compare-mgmt-toolbar { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; margin-bottom: 12px; }
.lc-compare-mgmt-table .ant-table-thead > tr > th { background: #f8fafc !important; font-weight: 700 !important; font-size: 13px !important; }
.lc-compare-mgmt-table .ant-table-tbody > tr > td { font-size: 13px; }
.lc-compare-mgmt-count { font-variant-numeric: tabular-nums; font-weight: 700; color: #0f172a; }
.lc-expiring-warn-modal .ant-modal-body { padding: 16px 20px 20px; }
.lc-expiring-warn-filter { margin-bottom: 14px; padding: 12px 14px; border-radius: 10px; background: #f8fafc; border: 1px solid #e2e8f0; }
.lc-expiring-warn-filter-label { font-size: 12px; font-weight: 700; color: #64748b; margin-bottom: 8px; }
.lc-expiring-warn-filter .ant-checkbox-group { display: flex; flex-wrap: wrap; gap: 8px 16px; }
.lc-expiring-warn-toolbar { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; margin-bottom: 12px; }
.lc-expiring-warn-table .ant-table-thead > tr > th { background: #f8fafc !important; font-weight: 700 !important; font-size: 13px !important; cursor: pointer; }
.lc-expiring-warn-table .ant-table-tbody > tr > td { font-size: 13px; }
.lc-compare-pay-alert-row { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; margin-bottom: 14px; }
.lc-compare-pay-alert { display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 10px 14px; border-radius: 10px; border: 1px solid #e2e8f0; background: #fff; cursor: pointer; transition: box-shadow .2s ease, border-color .2s ease; }
.lc-compare-pay-alert:hover { box-shadow: 0 4px 14px rgba(15, 23, 42, 0.08); }
.lc-compare-pay-alert--active { box-shadow: 0 0 0 2px rgba(22, 93, 255, 0.2) !important; border-color: #165dff !important; }
.lc-compare-pay-alert--all { border-color: #cbd5e1; background: linear-gradient(135deg, #f8fafc 0%, #fff 80%); }
.lc-compare-pay-alert--warning { border-color: #fed7aa; background: linear-gradient(135deg, #fff7ed 0%, #fff 80%); }
.lc-compare-pay-alert--overdue { border-color: #fecaca; background: linear-gradient(135deg, #fef2f2 0%, #fff 80%); }
.lc-compare-pay-alert-val { font-size: 22px; font-weight: 800; font-variant-numeric: tabular-nums; line-height: 1; }
.lc-compare-pay-alert--all .lc-compare-pay-alert-val { color: #0f172a; }
.lc-compare-pay-alert--warning .lc-compare-pay-alert-val { color: #c2410c; }
.lc-compare-pay-alert--overdue .lc-compare-pay-alert-val { color: #b91c1c; }
.lc-compare-editor-filter { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 14px 20px; margin-bottom: 12px; padding: 12px 14px; border-radius: 10px; background: #f8fafc; border: 1px solid #e2e8f0; align-items: end; }
@media (max-width: 900px) { .lc-compare-editor-filter { grid-template-columns: 1fr; } }
.lc-compare-editor-filter-check { display: flex; align-items: center; min-height: 32px; padding: 4px 0; }
.lc-compare-type-stats-row { margin-bottom: 12px; grid-template-columns: repeat(6, minmax(0, 1fr)); }
@media (max-width: 1200px) { .lc-compare-type-stats-row { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
@media (max-width: 768px) { .lc-compare-type-stats-row { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
.lc-compare-type-card { display: flex; flex-direction: column; gap: 4px; padding: 10px 14px; border-radius: 10px; border: 1px solid #e2e8f0; background: #fff; cursor: pointer; transition: box-shadow .2s ease, border-color .2s ease; min-width: 0; }
.lc-compare-type-card:hover { box-shadow: 0 4px 14px rgba(15, 23, 42, 0.08); }
.lc-compare-type-card.is-active { box-shadow: 0 0 0 2px rgba(22, 93, 255, 0.2); border-color: #165dff; background: linear-gradient(135deg, #eff6ff 0%, #fff 80%); }
.lc-compare-type-card-val { font-size: 22px; font-weight: 800; color: #0f172a; font-variant-numeric: tabular-nums; line-height: 1.1; }
.lc-compare-type-card-title { font-size: 12px; font-weight: 600; color: #64748b; }
.lc-compare-editor-meta { display: flex; flex-wrap: wrap; gap: 12px 20px; margin-bottom: 12px; padding: 10px 14px; border-radius: 10px; background: #f8fafc; border: 1px solid #e2e8f0; }
.lc-compare-editor-meta-field { display: flex; align-items: center; gap: 8px; min-width: 200px; flex: 1; }
.lc-compare-editor-meta-label { font-size: 12px; font-weight: 600; color: #64748b; white-space: nowrap; }
.lc-compare-procurement-hint { font-size: 12px; color: #64748b; }
.lc-compare-total-bar--procurement { border-color: #bfdbfe; background: linear-gradient(135deg, #eff6ff 0%, #f8fafc 100%); }
.lc-compare-total-bar--procurement .lc-compare-total-amount { color: #1d4ed8; }
.lc-module-tabs.ant-tabs > .ant-tabs-nav { margin-bottom: 12px; }
.lc-module-tabs .ant-tabs-tab { font-weight: 600; font-size: 14px; }
.lc-policy-toolbar { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
.lc-policy-ocr-upload { margin: 12px 0; }
.lc-policy-import-template-bar { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; padding: 12px 14px; margin-bottom: 12px; border-radius: 10px; background: linear-gradient(135deg, #ecfdf5 0%, #f8fafc 100%); border: 1px solid #a7f3d0; }
.lc-policy-import-template-bar-text { font-size: 12px; color: #047857; line-height: 1.55; flex: 1; min-width: 200px; }
.lc-policy-import-excel-upload { margin: 0; }
.lc-policy-recogn-modal .ant-modal-body { padding: 16px 20px 20px; max-height: calc(100vh - 160px); overflow-y: auto; }
.lc-policy-recogn-file-list { margin-top: 10px; max-height: 140px; overflow-y: auto; }
.lc-policy-recogn-file-item { display: flex; align-items: center; justify-content: space-between; gap: 8px; padding: 6px 0; border-bottom: 1px solid #f1f5f9; font-size: 12px; }
.lc-policy-recogn-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 14px; flex-wrap: wrap; }
.lc-policy-recogn-tasks-filter { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px 16px; margin-bottom: 12px; }
@media (max-width: 900px) { .lc-policy-recogn-tasks-filter { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
.lc-policy-recogn-tasks-toolbar { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; flex-wrap: wrap; gap: 8px; }
.lc-policy-recogn-task-progress { min-width: 108px; }
.lc-policy-recogn-task-progress .ant-progress { margin-bottom: 2px; line-height: 1; }
.lc-policy-recogn-task-progress-text { display: block; font-size: 11px; color: #64748b; font-variant-numeric: tabular-nums; text-align: center; }
.lc-policy-recogn-task-id { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 12px; color: #334155; }
.lc-policy-recogn-preview { width: 100%; min-height: 360px; border: 1px solid #e2e8f0; border-radius: 8px; background: #f8fafc; display: flex; align-items: center; justify-content: center; }
.lc-policy-recogn-preview img { max-width: 100%; max-height: 100%; object-fit: contain; }
.lc-policy-recogn-preview iframe { width: 100%; height: 100%; border: none; border-radius: 8px; }
.lc-policy-recogn-confirm-split { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 16px; min-height: 480px; margin-top: 12px; }
@media (max-width: 1100px) { .lc-policy-recogn-confirm-split { grid-template-columns: 1fr; } }
.lc-policy-recogn-confirm-preview { border: 1px solid #e2e8f0; border-radius: 12px; background: #f8fafc; display: flex; flex-direction: column; min-height: 480px; overflow: hidden; }
.lc-policy-recogn-confirm-preview-head { padding: 10px 14px; border-bottom: 1px solid #e2e8f0; font-size: 12px; font-weight: 600; color: #64748b; background: #fff; }
.lc-policy-recogn-confirm-preview-body { flex: 1; display: flex; align-items: center; justify-content: center; padding: 12px; min-height: 0; }
.lc-policy-recogn-confirm-preview-body .lc-policy-recogn-preview { min-height: 420px; height: 100%; border: none; background: transparent; }
.lc-policy-recogn-confirm-form { border: 1px solid #e2e8f0; border-radius: 12px; background: #fff; padding: 14px 16px; max-height: 520px; overflow-y: auto; }
.lc-policy-recogn-confirm-form-title { font-size: 13px; font-weight: 700; color: #0f172a; margin-bottom: 12px; }
.lc-policy-recogn-picker { margin-bottom: 4px; }
.lc-policy-recogn-picker .ant-table-tbody > tr { cursor: pointer; }
.lc-policy-recogn-picker .ant-table-tbody > tr.lc-policy-recogn-picker-row--active > td { background: #eff6ff !important; }
.lc-policy-recogn-picker .ant-table-tbody > tr.lc-policy-recogn-picker-row--confirmed > td { opacity: 0.72; }
.lc-policy-field-label-required::after { content: '*'; color: #ef4444; margin-left: 2px; }
.lc-vehicle-ins-mgmt-modal .ant-modal-content { border-radius: 16px; overflow: hidden; box-shadow: 0 24px 64px -16px rgba(15, 23, 42, 0.28); }
.lc-vehicle-ins-mgmt-modal .ant-modal-header { display: none; }
.lc-vehicle-ins-mgmt-modal .ant-modal-body { padding: 0; max-height: calc(100vh - 96px); overflow: hidden; display: flex; flex-direction: column; }
.lc-vehicle-ins-mgmt-modal .ant-modal-footer { border-top: 1px solid #e2e8f0; padding: 12px 20px; background: #f8fafc; }
.lc-vehicle-ins-mgmt-shell { display: flex; flex-direction: column; min-height: 0; flex: 1; }
.lc-vehicle-ins-mgmt-hero { padding: 20px 24px 18px; background: linear-gradient(135deg, #ecfdf5 0%, #f8fafc 42%, #fff 100%); border-bottom: 1px solid #e2e8f0; }
.lc-vehicle-ins-mgmt-hero-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; flex-wrap: wrap; margin-bottom: 16px; }
.lc-vehicle-ins-mgmt-hero-title { font-size: 11px; font-weight: 700; color: #059669; letter-spacing: 0.06em; text-transform: uppercase; margin-bottom: 6px; }
.lc-vehicle-ins-mgmt-plate { font-size: 26px; font-weight: 800; color: #0f172a; letter-spacing: 0.02em; line-height: 1.2; }
.lc-vehicle-ins-mgmt-subtitle { font-size: 13px; color: #64748b; margin-top: 6px; }
.lc-vehicle-ins-mgmt-status-pill { display: inline-flex; align-items: center; gap: 6px; padding: 6px 14px; border-radius: 999px; font-size: 13px; font-weight: 700; border: 1px solid transparent; }
.lc-vehicle-ins-mgmt-status-pill--success { background: #ecfdf5; border-color: #a7f3d0; color: #047857; }
.lc-vehicle-ins-mgmt-status-pill--warning { background: #fffbeb; border-color: #fde68a; color: #b45309; }
.lc-vehicle-ins-mgmt-status-pill--error { background: #fef2f2; border-color: #fecaca; color: #b91c1c; }
.lc-vehicle-ins-mgmt-meta-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px 14px; }
@media (max-width: 768px) { .lc-vehicle-ins-mgmt-meta-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
.lc-vehicle-ins-mgmt-meta-card { padding: 10px 12px; border-radius: 10px; background: rgba(255,255,255,.85); border: 1px solid #e2e8f0; min-width: 0; }
.lc-vehicle-ins-mgmt-meta-label { font-size: 11px; color: #94a3b8; font-weight: 600; margin-bottom: 4px; }
.lc-vehicle-ins-mgmt-meta-val { font-size: 13px; font-weight: 600; color: #0f172a; word-break: break-all; line-height: 1.35; }
.lc-vehicle-ins-mgmt-body { padding: 16px 20px 20px; overflow-y: auto; flex: 1; min-height: 0; }
.lc-vehicle-ins-mgmt-filter { display: flex; align-items: center; gap: 12px; margin-bottom: 14px; padding: 12px 14px; border-radius: 10px; background: #f8fafc; border: 1px solid #e2e8f0; }
.lc-vehicle-ins-mgmt-filter .lc-filter-field { flex: 1; min-width: 0; margin: 0; }
.lc-vehicle-ins-mgmt-filter .lc-filter-field-label { flex: 0 0 64px; }
.lc-vehicle-ins-policy-more-btn { display: inline-flex; align-items: center; justify-content: center; width: 24px; height: 24px; border-radius: 6px; color: #64748b; cursor: pointer; transition: background 0.15s, color 0.15s; }
.lc-vehicle-ins-policy-more-btn:hover { background: #f1f5f9; color: #334155; }
.lc-policy-biz-summary { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px 16px; padding: 14px 16px; margin-bottom: 16px; border-radius: 12px; background: #f8fafc; border: 1px solid #e2e8f0; }
.lc-policy-biz-summary-item-label { font-size: 11px; color: #94a3b8; font-weight: 600; margin-bottom: 4px; }
.lc-policy-biz-summary-item-val { font-size: 13px; color: #0f172a; font-weight: 600; word-break: break-all; }
.lc-policy-biz-form { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px 16px; }
.lc-policy-biz-form-full { grid-column: 1 / -1; }
@media (max-width: 640px) { .lc-policy-biz-summary, .lc-policy-biz-form { grid-template-columns: 1fr; } }
.lc-purchase-type-chip { display: inline-flex; align-items: center; padding: 2px 10px; border-radius: 999px; font-size: 11px; font-weight: 700; border: 1px solid transparent; line-height: 1.5; }
.lc-purchase-type--new { background: #ecfdf5; border-color: #a7f3d0; color: #047857; }
.lc-purchase-type--renew { background: #eff6ff; border-color: #bfdbfe; color: #1d4ed8; }
.lc-purchase-type--rent-stop { background: #fff7ed; border-color: #fed7aa; color: #c2410c; }
.lc-purchase-type--resume { background: #ecfeff; border-color: #a5f3fc; color: #0e7490; }
.lc-purchase-type--cancel { background: #f1f5f9; border-color: #cbd5e1; color: #475569; }
.lc-vehicle-ins-mgmt-tabs .ant-tabs-nav { margin-bottom: 0 !important; padding: 0 4px; }
.lc-vehicle-ins-mgmt-tabs .ant-tabs-tab { font-weight: 600; font-size: 13px; padding: 10px 14px !important; transition: color 0.15s; }
.lc-vehicle-ins-mgmt-tabs .ant-tabs-tab-active .ant-tabs-tab-btn { color: #059669 !important; }
.lc-vehicle-ins-mgmt-tabs .ant-tabs-ink-bar { background: #10b981 !important; height: 3px !important; border-radius: 3px 3px 0 0; }
.lc-vehicle-ins-mgmt-tabs .ant-tabs-content-holder { padding-top: 14px; }
.lc-ins-tab-badge { display: inline-flex; align-items: center; justify-content: center; min-width: 18px; height: 18px; padding: 0 5px; margin-left: 6px; border-radius: 999px; background: #e2e8f0; color: #475569; font-size: 11px; font-weight: 700; }
.lc-vehicle-ins-mgmt-tabs .ant-tabs-tab-active .lc-ins-tab-badge { background: #d1fae5; color: #047857; }
.lc-vehicle-ins-timeline-center { max-height: 480px; overflow-y: auto; padding: 4px 8px 12px; }
.lc-vehicle-ins-timeline-center-head { display: grid; grid-template-columns: minmax(0, 1fr) 28px minmax(0, 1fr); gap: 12px; align-items: center; margin-bottom: 12px; padding: 0 4px; }
.lc-vehicle-ins-timeline-center-head-side { font-size: 13px; font-weight: 700; color: #334155; }
.lc-vehicle-ins-timeline-center-head-side--left { text-align: right; }
.lc-vehicle-ins-timeline-center-head-side--right { text-align: left; }
.lc-vehicle-ins-timeline-center-head-axis { width: 2px; height: 18px; margin: 0 auto; border-radius: 2px; background: linear-gradient(180deg, #10b981, #94a3b8); }
.lc-vehicle-ins-timeline-center-body { position: relative; }
.lc-vehicle-ins-timeline-center-row { display: grid; grid-template-columns: minmax(0, 1fr) 28px minmax(0, 1fr); gap: 12px; align-items: stretch; min-height: 72px; }
.lc-vehicle-ins-timeline-center-col { display: flex; min-width: 0; }
.lc-vehicle-ins-timeline-center-col--left { justify-content: flex-end; }
.lc-vehicle-ins-timeline-center-col--right { justify-content: flex-start; }
.lc-vehicle-ins-timeline-center-axis { position: relative; display: flex; justify-content: center; padding-top: 18px; }
.lc-vehicle-ins-timeline-center-axis::before { content: ''; position: absolute; top: 0; bottom: 0; left: 50%; width: 2px; margin-left: -1px; background: #e2e8f0; }
.lc-vehicle-ins-timeline-center-row:first-child .lc-vehicle-ins-timeline-center-axis::before { top: 22px; }
.lc-vehicle-ins-timeline-center-row:last-child .lc-vehicle-ins-timeline-center-axis::before { bottom: auto; height: 22px; }
.lc-vehicle-ins-timeline-center-dot { position: relative; z-index: 1; width: 12px; height: 12px; border-radius: 50%; border: 2px solid #fff; box-shadow: 0 0 0 2px currentColor; flex-shrink: 0; }
.lc-vehicle-ins-timeline-center-dot--policy { color: #10b981; background: #10b981; }
.lc-vehicle-ins-timeline-center-dot--biz { color: #f59e0b; background: #f59e0b; }
.lc-vehicle-ins-timeline-item--left { text-align: right; }
.lc-vehicle-ins-timeline-item--left .lc-vehicle-ins-timeline-title { justify-content: flex-end; }
.lc-vehicle-ins-timeline-item--left .lc-vehicle-ins-timeline-meta { text-align: right; }
@media (max-width: 720px) {
  .lc-vehicle-ins-timeline-center-head { grid-template-columns: 1fr; gap: 4px; text-align: center !important; }
  .lc-vehicle-ins-timeline-center-head-axis { display: none; }
  .lc-vehicle-ins-timeline-center-row { grid-template-columns: 1fr; gap: 8px; min-height: auto; padding-left: 20px; border-left: 2px solid #e2e8f0; margin-left: 8px; }
  .lc-vehicle-ins-timeline-center-axis { display: none; }
  .lc-vehicle-ins-timeline-center-col--left { justify-content: flex-start; }
  .lc-vehicle-ins-timeline-item--left { text-align: left; }
  .lc-vehicle-ins-timeline-item--left .lc-vehicle-ins-timeline-title { justify-content: flex-start; }
  .lc-vehicle-ins-timeline-item--left .lc-vehicle-ins-timeline-meta { text-align: left; }
}
.lc-vehicle-ins-timeline-center-col .lc-vehicle-ins-timeline-item { width: 100%; max-width: 360px; margin: 0 0 14px; }
.lc-vehicle-ins-timeline-item { cursor: pointer; padding: 12px 14px; margin: 0 0 10px; border-radius: 12px; border: 1px solid #e2e8f0; background: #fff; transition: border-color 0.15s, box-shadow 0.15s, transform 0.15s; }
.lc-vehicle-ins-timeline-item:hover { border-color: #a7f3d0; box-shadow: 0 4px 14px -6px rgba(16, 185, 129, 0.35); transform: translateY(-1px); }
.lc-vehicle-ins-timeline-item:focus-visible { outline: 2px solid #10b981; outline-offset: 2px; }
.lc-vehicle-ins-timeline-title { font-size: 13px; font-weight: 700; color: #0f172a; margin-bottom: 6px; display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.lc-vehicle-ins-timeline-desc { font-size: 12px; color: #475569; line-height: 1.55; }
.lc-vehicle-ins-timeline-meta { font-size: 11px; color: #94a3b8; margin-top: 6px; }
.lc-vehicle-ins-mgmt-table-card { border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; background: #fff; }
.lc-vehicle-ins-mgmt-table-card .ant-table-thead > tr > th { background: #f8fafc !important; font-weight: 700 !important; font-size: 12px !important; color: #475569 !important; white-space: nowrap; }
.lc-vehicle-ins-mgmt-table .ant-table-content table { table-layout: fixed; width: 100% !important; }
.lc-vehicle-ins-mgmt-table .ant-table-tbody > tr.ant-table-measure-row { visibility: collapse !important; height: 0 !important; font-size: 0 !important; line-height: 0 !important; }
.lc-vehicle-ins-mgmt-table .ant-table-tbody > tr.ant-table-measure-row > td { padding: 0 !important; border: none !important; height: 0 !important; }
.lc-vehicle-ins-mgmt-table .ant-table-tbody > tr:not(.ant-table-measure-row) > td { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; vertical-align: middle; padding-top: 8px !important; padding-bottom: 8px !important; }
.lc-vehicle-ins-mgmt-table .ant-table-tbody > tr > td .ant-table-cell-content { overflow: hidden; text-overflow: ellipsis; }
.lc-vehicle-ins-mgmt-table .lc-vehicle-ins-mgmt-actions { display: inline-flex; align-items: center; flex-wrap: nowrap; white-space: nowrap; gap: 2px; max-width: 100%; }
.lc-vehicle-ins-mgmt-table .lc-vehicle-ins-mgmt-actions .ant-btn-link { flex-shrink: 0; white-space: nowrap; }
.lc-vehicle-ins-mgmt-table .lc-vehicle-ins-mgmt-cell-ellipsis { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 100%; }
.lc-vehicle-ins-mgmt-empty { padding: 48px 24px; text-align: center; border-radius: 12px; border: 1px dashed #cbd5e1; background: #f8fafc; }
.lc-ins-history-row--active > td { background: #ecfdf5 !important; }
.lc-ins-history-row--active > td:first-child { box-shadow: inset 3px 0 0 #10b981; }
.lc-policy-detail-form { display: grid; grid-template-columns: 1fr 1fr; gap: 12px 16px; }
.lc-policy-detail-form--suspend-confirm { grid-template-columns: 1fr; max-width: 400px; }
@media (max-width: 720px) { .lc-policy-detail-form { grid-template-columns: 1fr; } }
.lc-policy-detail-form-full { grid-column: 1 / -1; }
.lc-policy-detail-section-title { font-size: 13px; font-weight: 700; color: #334155; margin: 4px 0 8px; grid-column: 1 / -1; }
.lc-coverage-items-table-section { grid-column: 1 / -1; }
.lc-coverage-items-table-section--confirm { margin-top: 4px; }
.lc-coverage-items-table-wrap { border-radius: 10px; border: 1px solid #e2e8f0; overflow: hidden; background: #fff; }
.lc-coverage-items-table .ant-table-thead > tr > th { background: #f8fafc !important; font-size: 12px !important; font-weight: 700 !important; padding: 8px 10px !important; }
.lc-coverage-items-table .ant-table-tbody > tr > td { padding: 6px 8px !important; vertical-align: middle !important; }
.lc-coverage-items-add { margin-top: 8px; border-radius: 8px !important; font-weight: 600; color: #059669 !important; border-color: #a7f3d0 !important; background: #f0fdf4 !important; }
.lc-coverage-items-add:hover { border-color: #6ee7b7 !important; color: #047857 !important; }
.lc-list-policy-tag { margin-top: 4px; }
.lc-compare-attach-field { display: flex; flex-direction: column; gap: 8px; }
.lc-compare-attach-label { font-size: 13px; font-weight: 600; color: #334155; }
.lc-compare-attach-hint { font-size: 12px; color: #94a3b8; line-height: 1.5; }
.lc-compare-attach-upload .ant-upload-list { max-height: 160px; overflow-y: auto; margin-top: 8px; }
.lc-compare-attach-upload .ant-upload-list-item { border-radius: 8px; }
.lc-compare-attach-upload .ant-upload-select { display: block; }
`;

const goInsuranceEditPage = (ledgerKey, master, vehicle) => {
  const label = vehicle
    ? (hasVehiclePlate(vehicle) ? vehicle.plateNo : `${NO_PLATE_LABEL}（${vehicle.vin}）`)
    : ledgerKey;
  try {
    sessionStorage.setItem(IPC_EDIT_PLATE_KEY, ledgerKey);
    persistInsuranceToStorage(master);
  } catch {
    /* ignore */
  }
  if (typeof window.__axhubNavigate === 'function') {
    window.__axhubNavigate('保险采购-编辑');
    message.success(`已进入 [${label}] 保险维护`);
    return;
  }
  message.info(`已带入 [${label}] 车辆信息，请打开「保险采购-编辑」页面继续维护`);
};

const Component = function () {
  const [allInsurance, setAllInsurance] = useState(() => {
    const stored = loadInsuranceFromStorage();
    if (stored) {
      const normalized = {};
      Object.keys(stored).forEach((k) => {
        normalized[k] = ensureInsuranceRecordShape(stored[k]);
      });
      MOCK_VEHICLES.forEach((v) => {
        const key = getVehicleLedgerKey(v);
        if (normalized[key]) return;
        const seed = getInitialInsuranceSeed(v);
        if (seed) {
          normalized[key] = ensureInsuranceRecordShape(JSON.parse(JSON.stringify(seed)));
        }
      });
      return normalized;
    }
    const merged = {};
    MOCK_VEHICLES.forEach((v) => {
      const key = getVehicleLedgerKey(v);
      const seed = getInitialInsuranceSeed(v);
      merged[key] = ensureInsuranceRecordShape(
        seed ? JSON.parse(JSON.stringify(seed)) : createEmptyInsuranceRecord()
      );
    });
    return merged;
  });

  const updateAllInsurance = useCallback((updater) => {
    setAllInsurance((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      persistInsuranceToStorage(next);
      return next;
    });
  }, []);

  const DEFAULT_LIST_FILTERS = {
    plateNo: '',
    plateNos: '',
    vin: '',
    brand: '',
    model: '',
    operateStatus: '全部',
    insuranceStatus: '全部',
    insuranceType: '',
    endDateRange: null,
  };
  const [listFilters, setListFilters] = useState(() => ({ ...DEFAULT_LIST_FILTERS }));
  const [appliedFilters, setAppliedFilters] = useState(() => ({ ...DEFAULT_LIST_FILTERS }));
  const [multiPlateOpen, setMultiPlateOpen] = useState(false);
  const [multiPlateDraft, setMultiPlateDraft] = useState('');
  const [kpiFilter, setKpiFilter] = useState('total');
  const [prdOpen, setPrdOpen] = useState(false);
  const [compareMgmtOpen, setCompareMgmtOpen] = useState(false);
  const [compareSheets, setCompareSheets] = useState(() => {
    const stored = loadCompareSheetsFromStorage();
    const list = stored && stored.length ? stored : createMockCompareSheets();
    return list.map(normalizeCompareSheet);
  });
  const [compareMgmtFilters, setCompareMgmtFilters] = useState(() => ({ ...DEFAULT_COMPARE_MGMT_FILTERS }));
  const [appliedCompareMgmtFilters, setAppliedCompareMgmtFilters] = useState(() => ({ ...DEFAULT_COMPARE_MGMT_FILTERS }));
  const [compareModalOpen, setCompareModalOpen] = useState(false);
  const [editingCompareSheetId, setEditingCompareSheetId] = useState(null);
  const [compareRows, setCompareRows] = useState([]);
  const [selectedCompareKeys, setSelectedCompareKeys] = useState([]);
  const [copyPopoverRowId, setCopyPopoverRowId] = useState(null);
  const [copyCountDraft, setCopyCountDraft] = useState(1);
  const [quoteDraft, setQuoteDraft] = useState(createEmptyQuoteDraft);
  const [quoteEditRowId, setQuoteEditRowId] = useState(null);
  const [compareRemark, setCompareRemark] = useState('');
  const [compareEditorFilters, setCompareEditorFilters] = useState(() => ({ ...DEFAULT_COMPARE_EDITOR_FILTERS }));
  const [compareAttachmentFileList, setCompareAttachmentFileList] = useState([]);
  const [policyRecognOpen, setPolicyRecognOpen] = useState(false);
  const [policyRecognEntry, setPolicyRecognEntry] = useState('ocr');
  const [policyRecognMode, setPolicyRecognMode] = useState('policy');
  const [policyRecognInsuranceType, setPolicyRecognInsuranceType] = useState('交强险');
  const [policyRecognPhase, setPolicyRecognPhase] = useState('upload');
  const [policyRecognFiles, setPolicyRecognFiles] = useState([]);
  const [policyRecognTaskId, setPolicyRecognTaskId] = useState('');
  const policyRecognTimerRef = useRef(null);
  const policyRecognProgressTimerRef = useRef(null);
  const [policyRecognResults, setPolicyRecognResults] = useState([]);
  const [policyRecognViewOnly, setPolicyRecognViewOnly] = useState(false);
  const [policyRecognActiveResultId, setPolicyRecognActiveResultId] = useState('');
  const [policyRecognConfirmDraft, setPolicyRecognConfirmDraft] = useState(() => ({ ...EMPTY_POLICY_DETAIL }));
  const [policyPreview, setPolicyPreview] = useState(null);
  const [policyRecognTasks, setPolicyRecognTasks] = useState(() => {
    const stored = loadPolicyRecognTasksFromStorage();
    return stored && stored.length ? stored : createMockPolicyRecognTasks();
  });
  const [policyRecognTasksOpen, setPolicyRecognTasksOpen] = useState(false);
  const [policyRecognTasksFilters, setPolicyRecognTasksFilters] = useState(() => ({ ...DEFAULT_POLICY_RECOGN_TASK_FILTERS }));
  const [appliedPolicyRecognTasksFilters, setAppliedPolicyRecognTasksFilters] = useState(() => ({ ...DEFAULT_POLICY_RECOGN_TASK_FILTERS }));
  const [policyAddOpen, setPolicyAddOpen] = useState(false);
  const [vehicleInsMgmtOpen, setVehicleInsMgmtOpen] = useState(false);
  const [vehicleInsMgmtVehicle, setVehicleInsMgmtVehicle] = useState(null);
  const [vehicleInsMgmtActiveTab, setVehicleInsMgmtActiveTab] = useState('timeline');
  const [vehicleInsMgmtHighlightId, setVehicleInsMgmtHighlightId] = useState('');
  const [vehicleInsMgmtPolicyNoFilter, setVehicleInsMgmtPolicyNoFilter] = useState('');
  const [vehicleInsMgmtTabPage, setVehicleInsMgmtTabPage] = useState({});
  const [policyBizModalOpen, setPolicyBizModalOpen] = useState(false);
  const [policyBizModalMode, setPolicyBizModalMode] = useState('suspend');
  const [policyBizModalRecord, setPolicyBizModalRecord] = useState(null);
  const [policyBizForm, setPolicyBizForm] = useState(() => ({ ...EMPTY_POLICY_BIZ_FORM }));
  const [policyBizAttachmentFileList, setPolicyBizAttachmentFileList] = useState([]);
  const [policyOpHistoryOpen, setPolicyOpHistoryOpen] = useState(false);
  const [policyOpHistoryRecord, setPolicyOpHistoryRecord] = useState(null);
  const [policyAddDraft, setPolicyAddDraft] = useState(() => ({ ...EMPTY_POLICY_DETAIL }));
  const [policyAddAttachmentFileList, setPolicyAddAttachmentFileList] = useState([]);
  const [insuranceHistoryEdits, setInsuranceHistoryEdits] = useState(() => loadInsuranceHistoryEditsFromStorage());
  const [vehicleInsHistoryEditOpen, setVehicleInsHistoryEditOpen] = useState(false);
  const [vehicleInsHistoryEditRecord, setVehicleInsHistoryEditRecord] = useState(null);
  const [vehicleInsHistoryEditDraft, setVehicleInsHistoryEditDraft] = useState(() => ({ ...EMPTY_POLICY_DETAIL }));
  const [insuranceAlertOpen, setInsuranceAlertOpen] = useState(false);
  const [insuranceAlertMode, setInsuranceAlertMode] = useState('expiring');
  const [insuranceAlertTypeFilter, setInsuranceAlertTypeFilter] = useState(() => [...EXPIRING_WARN_TYPE_KEYS]);
  const [insuranceAlertSort, setInsuranceAlertSort] = useState({ key: 'commercial', order: 'descend' });
  const [batchCompareTypesOpen, setBatchCompareTypesOpen] = useState(false);
  const [batchCompareTypesDraft, setBatchCompareTypesDraft] = useState(() => [...QUOTE_INSURANCE_TYPES]);
  const [compareVehicleFilterOpen, setCompareVehicleFilterOpen] = useState(false);
  const [compareVehicleFilterDraft, setCompareVehicleFilterDraft] = useState('');
  const [compareBatchAddOpen, setCompareBatchAddOpen] = useState(false);
  const [compareBatchAddDraft, setCompareBatchAddDraft] = useState('');

  const compareSheetSummary = useMemo(
    () => calcCompareSheetConfirmedTotal(compareRows),
    [compareRows]
  );

  const selectedProcurementSummary = useMemo(() => {
    const selected = compareRows.filter((r) => selectedCompareKeys.includes(r.id));
    return calcCompareSheetConfirmedTotal(selected);
  }, [compareRows, selectedCompareKeys]);

  const compareEditorTypeCounts = useMemo(
    () => countCompareRowsByInsuranceType(compareRows),
    [compareRows]
  );

  const displayCompareRows = useMemo(
    () => filterCompareEditorRows(compareRows, compareEditorFilters),
    [compareRows, compareEditorFilters]
  );

  const appliedCompareVehicles = useMemo(
    () => parseMultiPlates(compareEditorFilters.vehicles),
    [compareEditorFilters.vehicles]
  );

  const compareVehicleTriggerText = appliedCompareVehicles.length
    ? `已选 ${appliedCompareVehicles.length} 辆车`
    : '';

  const isCompareEditorFiltered = useMemo(() => {
    const f = compareEditorFilters;
    return !!(f.vehicles || '').trim() || f.latestPayWithin3Days || f.insuranceType;
  }, [compareEditorFilters]);

  const compareMgmtBaseFilteredSheets = useMemo(() => {
    const plateKey = (appliedCompareMgmtFilters.plateNo || '').trim();
    const range = appliedCompareMgmtFilters.createdRange;
    return compareSheets
      .filter((sheet) => compareSheetMatchesCreatedRange(sheet.createdAt, range))
      .filter((sheet) => compareSheetMatchesPlateFilter(sheet, plateKey));
  }, [compareSheets, appliedCompareMgmtFilters.plateNo, appliedCompareMgmtFilters.createdRange]);

  const compareMgmtPayAlerts = useMemo(() => {
    let warningSheets = 0;
    let overdueSheets = 0;
    compareMgmtBaseFilteredSheets.forEach((sheet) => {
      const alert = calcCompareSheetPayAlerts(sheet);
      if (alert.warning > 0) warningSheets += 1;
      if (alert.overdue > 0) overdueSheets += 1;
    });
    return {
      total: compareMgmtBaseFilteredSheets.length,
      warning: warningSheets,
      overdue: overdueSheets,
    };
  }, [compareMgmtBaseFilteredSheets]);

  const saveCompareSheets = useCallback((nextSheets) => {
    setCompareSheets(nextSheets);
    persistCompareSheetsToStorage(nextSheets);
  }, []);

  const filteredCompareSheets = useMemo(() => (
    compareMgmtBaseFilteredSheets
      .filter((sheet) => compareSheetMatchesPayAlertFilter(sheet, appliedCompareMgmtFilters.payAlertFilter))
      .sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')))
  ), [compareMgmtBaseFilteredSheets, appliedCompareMgmtFilters.payAlertFilter]);

  const handleCompareMgmtPayAlertFilter = (payAlertFilter) => {
    setCompareMgmtFilters((prev) => ({ ...prev, payAlertFilter }));
    setAppliedCompareMgmtFilters((prev) => ({ ...prev, payAlertFilter }));
  };

  const updateCompareRow = useCallback((rowId, patch) => {
    setCompareRows((prev) => prev.map((r) => (r.id === rowId ? { ...r, ...patch } : r)));
  }, []);

  const fillCompareRowFromVehicle = useCallback((rowId, vehicle) => {
    if (!vehicle) return;
    updateCompareRow(rowId, buildVehicleComparePatch(vehicle, allInsurance));
  }, [allInsurance, updateCompareRow]);

  const fillCompareRowFromPlate = useCallback((rowId, plateNo) => {
    const vehicle = findVehicleByPlate(plateNo);
    if (!vehicle) return;
    fillCompareRowFromVehicle(rowId, vehicle);
  }, [fillCompareRowFromVehicle]);

  const handleComparePlateChange = useCallback((rowId, plateNo) => {
    if (!plateNo) {
      updateCompareRow(rowId, clearVehicleComparePatch());
      return;
    }
    fillCompareRowFromPlate(rowId, plateNo);
  }, [fillCompareRowFromPlate, updateCompareRow]);

  const handleCompareVinChange = useCallback((rowId, vin) => {
    if (!vin) {
      updateCompareRow(rowId, clearVehicleComparePatch());
      return;
    }
    const vehicle = findVehicleByVin(vin);
    if (!vehicle) {
      message.warning('未找到该 VIN 对应车辆');
      return;
    }
    fillCompareRowFromVehicle(rowId, vehicle);
  }, [fillCompareRowFromVehicle, updateCompareRow]);

  const renderReadonlyField = (val, linked) => (
    <span
      className={`lc-compare-readonly lc-compare-readonly--wrap${val ? (linked ? ' is-linked' : '') : ' is-empty'}`}
      title={val || ''}
    >
      {val || '—'}
    </span>
  );

  const renderReadonlyDate = (val, linked) => (
    <span className={`lc-compare-readonly${val ? (linked ? ' is-linked' : '') : ' is-empty'}`}>
      {val || '—'}
    </span>
  );

  const openCompareMgmtModal = () => {
    setCompareMgmtFilters({ ...DEFAULT_COMPARE_MGMT_FILTERS });
    setAppliedCompareMgmtFilters({ ...DEFAULT_COMPARE_MGMT_FILTERS });
    setCompareMgmtOpen(true);
  };

  const openCompareEditor = (sheet) => {
    if (sheet) {
      setEditingCompareSheetId(sheet.id);
      setCompareRows(normalizeCompareRows(JSON.parse(JSON.stringify(sheet.rows || []))));
      setCompareRemark(sheet.remark || '');
      setCompareAttachmentFileList(attachmentsToUploadFileList(sheet.attachments));
    } else {
      setEditingCompareSheetId(null);
      setCompareRows([createEmptyCompareRow()]);
      setCompareRemark('');
      setCompareAttachmentFileList([]);
    }
    setCompareEditorFilters({ ...DEFAULT_COMPARE_EDITOR_FILTERS });
    setCompareVehicleFilterOpen(false);
    setCompareVehicleFilterDraft('');
    setCompareBatchAddOpen(false);
    setCompareBatchAddDraft('');
    setSelectedCompareKeys([]);
    setQuoteDraft(createEmptyQuoteDraft());
    setQuoteEditRowId(null);
    setCompareModalOpen(true);
  };

  const handleCompareVehicleFilterOpenChange = (open) => {
    setCompareVehicleFilterOpen(open);
    if (open) setCompareVehicleFilterDraft(compareEditorFilters.vehicles || '');
  };

  const handleCompareVehicleFilterClear = () => {
    setCompareVehicleFilterDraft('');
    setCompareEditorFilters((prev) => ({ ...prev, vehicles: '' }));
    setCompareVehicleFilterOpen(false);
  };

  const handleCompareVehicleFilterApply = () => {
    const trimmed = compareVehicleFilterDraft.trim();
    setCompareEditorFilters((prev) => ({ ...prev, vehicles: trimmed }));
    setCompareVehicleFilterOpen(false);
    const tokens = parseMultiPlates(trimmed);
    if (tokens.length) {
      const hitCount = filterCompareEditorRows(compareRows, {
        ...compareEditorFilters,
        vehicles: trimmed,
      }).length;
      message.success(`已按 ${tokens.length} 辆车筛选，命中 ${hitCount} 条购买记录`);
    }
  };

  const buildSheetPayloadFromEditor = (rowsSnapshot) => normalizeCompareSheet({
    id: editingCompareSheetId || createCompareSheetId(),
    createdAt: editingCompareSheetId
      ? (compareSheets.find((s) => s.id === editingCompareSheetId)?.createdAt || formatCompareSheetNow())
      : formatCompareSheetNow(),
    createdBy: editingCompareSheetId
      ? (compareSheets.find((s) => s.id === editingCompareSheetId)?.createdBy || PROTO_COMPARE_CREATOR)
      : PROTO_COMPARE_CREATOR,
    periodLabel: editingCompareSheetId
      ? (compareSheets.find((s) => s.id === editingCompareSheetId)?.periodLabel || '')
      : '',
    remark: compareRemark,
    attachments: uploadFileListToAttachments(compareAttachmentFileList),
    rows: rowsSnapshot,
  });

  const handleCompareAttachmentChange = ({ fileList }) => {
    setCompareAttachmentFileList(
      fileList.map((f) => ({
        ...f,
        status: 'done',
        uploadedAt: f.uploadedAt || formatCompareSheetNow(),
      }))
    );
  };

  const handleCompareMgmtQuery = () => {
    setAppliedCompareMgmtFilters({ ...compareMgmtFilters });
    message.success('查询完成');
  };

  const handleCompareMgmtReset = () => {
    setCompareMgmtFilters({ ...DEFAULT_COMPARE_MGMT_FILTERS });
    setAppliedCompareMgmtFilters({ ...DEFAULT_COMPARE_MGMT_FILTERS });
    message.info('筛选条件已重置');
  };

  const handleDeleteCompareSheet = (sheet) => {
    Modal.confirm({
      title: '删除比价单',
      content: `确定删除 ${sheet.createdAt || ''} 由 ${sheet.createdBy || '—'} 创建的比价单吗？删除后不可恢复。`,
      okText: '删除',
      okType: 'danger',
      cancelText: '取消',
      centered: true,
      onOk: () => {
        const next = compareSheets.filter((s) => s.id !== sheet.id);
        saveCompareSheets(next);
        message.success('比价单已删除');
      },
    });
  };

  const handleAddCompareRow = () => {
    setCompareRows((prev) => [...prev, createEmptyCompareRow()]);
  };

  const handleOpenBatchAddCompareRows = () => {
    setCompareBatchAddDraft('');
    setCompareBatchAddOpen(true);
  };

  const handleConfirmBatchAddCompareRows = () => {
    const lines = parseBatchVehicleLines(compareBatchAddDraft);
    if (!lines.length) {
      message.warning('请输入至少一条车牌号或车辆识别代码');
      return;
    }
    const notFound = [];
    const newRows = lines.map((token) => {
      const vehicle = findVehicleByPlateOrVin(token);
      if (!vehicle) {
        notFound.push(token);
        return null;
      }
      const row = buildCompareRowFromVehicle(vehicle, allInsurance);
      if (compareEditorFilters.insuranceType) {
        row.insuranceType = compareEditorFilters.insuranceType;
      }
      return row;
    }).filter(Boolean);
    if (!newRows.length) {
      message.warning(
        notFound.length
          ? `未找到匹配车辆：${notFound.slice(0, 5).join('、')}${notFound.length > 5 ? ` 等 ${notFound.length} 条` : ''}`
          : '没有可新增的记录'
      );
      return;
    }
    setCompareRows((prev) => [...prev, ...newRows]);
    setCompareBatchAddOpen(false);
    setCompareBatchAddDraft('');
    const skipHint = notFound.length ? `，${notFound.length} 条未匹配已跳过` : '';
    message.success(`已批量新增 ${newRows.length} 条购买记录${skipHint}`);
  };

  const handleBatchSetCompareInsuranceType = (insuranceType) => {
    const targetIdSet = new Set(
      selectedCompareKeys.length
        ? selectedCompareKeys
        : compareRows.map((r) => r.id)
    );
    if (!targetIdSet.size) {
      message.warning('没有可设置的购买记录');
      return;
    }
    let updated = 0;
    let skippedProcurement = 0;
    setCompareRows((prev) => prev.map((r) => {
      if (!targetIdSet.has(r.id)) return r;
      if (isCompareProcurementSelectionDisabled(r.procurementStatus)) {
        skippedProcurement += 1;
        return r;
      }
      if (r.insuranceType === insuranceType) return r;
      updated += 1;
      return {
        ...r,
        insuranceType,
        quotes: [],
        confirmedQuoteId: '',
      };
    }));
    if (!updated) {
      message.info(
        skippedProcurement
          ? '所选记录均为审批中/审批通过，或险种已是目标值'
          : '没有需要变更的记录'
      );
      return;
    }
    const scopeLabel = selectedCompareKeys.length ? '所选' : '全部';
    const skipHint = skippedProcurement ? `，${skippedProcurement} 条审批中/通过记录已跳过` : '';
    message.success(`已将${scopeLabel} ${updated} 条记录设为${insuranceType}${skipHint}`);
  };

  const handleDeleteCompareRow = (rowId) => {
    setCompareRows((prev) => prev.filter((r) => r.id !== rowId));
    setSelectedCompareKeys((prev) => prev.filter((k) => k !== rowId));
  };

  const handleCopyCompareRow = (row, count) => {
    const n = Math.max(1, Math.min(50, Number(count) || 1));
    const clones = Array.from({ length: n }, () => cloneCompareRow(row));
    setCompareRows((prev) => {
      const idx = prev.findIndex((r) => r.id === row.id);
      if (idx < 0) return [...prev, ...clones];
      const next = [...prev];
      next.splice(idx + 1, 0, ...clones);
      return next;
    });
    setCopyPopoverRowId(null);
    setCopyCountDraft(1);
    message.success(`已复制 ${n} 条记录`);
  };

  const handleAddQuote = (rowId, rowInsuranceType) => {
    if (!quoteDraft.company) {
      message.warning('请选择保险公司');
      return;
    }
    if (!isValidPremium(quoteDraft.premium)) {
      message.warning('请输入大于 0 的报价，最多两位小数');
      return;
    }
    const premium = formatPremiumDisplay(quoteDraft.premium);
    const newQuote = {
      id: createQuoteId(),
      company: quoteDraft.company,
      premium,
    };
    let added = false;
    setCompareRows((prev) => prev.map((r) => {
      if (r.id !== rowId) return r;
      const exists = (r.quotes || []).some((q) => q.company === quoteDraft.company);
      if (exists) {
        message.warning('该保险公司报价已存在');
        return r;
      }
      added = true;
      return { ...r, quotes: [...(r.quotes || []), newQuote] };
    }));
    if (added) {
      setQuoteDraft(createEmptyQuoteDraft());
      message.success(`已添加${rowInsuranceType || ''}报价`);
    }
  };

  const handleRemoveQuote = (rowId, quoteId) => {
    setCompareRows((prev) => prev.map((r) => {
      if (r.id !== rowId) return r;
      const quotes = (r.quotes || []).filter((q) => q.id !== quoteId);
      const confirmedQuoteId = r.confirmedQuoteId === quoteId ? '' : r.confirmedQuoteId;
      return { ...r, quotes, confirmedQuoteId };
    }));
  };

  const validateCompareSheetRequiredMeta = () => {
    if (!(compareRemark || '').trim()) {
      message.warning('请填写备注');
      return false;
    }
    const hasAttachment = (compareAttachmentFileList || []).some((f) => f.status !== 'removed');
    if (!hasAttachment) {
      message.warning('请上传附件');
      return false;
    }
    return true;
  };

  const handleSubmitCompareSheet = (options = {}) => {
    const { closeModal = true } = options;
    if (!compareRows.length) {
      message.warning('请至少添加一条购买记录');
      return null;
    }
    const missingVehicle = compareRows.find((r) => !(r.plateNo || '').trim() && !(r.vin || '').trim());
    if (missingVehicle) {
      message.warning('存在未选择车辆的记录，请填写车牌或 VIN');
      return null;
    }
    if (!validateCompareSheetRequiredMeta()) return null;
    const rowsSnapshot = normalizeCompareRows(JSON.parse(JSON.stringify(compareRows)));
    const payload = buildSheetPayloadFromEditor(rowsSnapshot);
    let nextSheets;
    let savedId = payload.id;
    if (editingCompareSheetId) {
      nextSheets = compareSheets.map((s) => (s.id === editingCompareSheetId ? payload : s));
      message.success(`比价单已保存，共 ${rowsSnapshot.length} 条购买记录`);
    } else {
      nextSheets = [payload, ...compareSheets];
      message.success(`比价单已创建，共 ${rowsSnapshot.length} 条购买记录`);
      savedId = payload.id;
    }
    saveCompareSheets(nextSheets);
    setEditingCompareSheetId(savedId);
    if (closeModal) {
      setCompareModalOpen(false);
    }
    return savedId;
  };

  const submitProcurementApplication = (keys = selectedCompareKeys) => {
    if (!keys.length) return;
    const submittedAt = formatCompareSheetNow();
    const rowsSnapshot = compareRows.map((r) => (
      keys.includes(r.id)
        ? {
          ...r,
          procurementStatus: 'submitted',
          procurementSubmittedAt: submittedAt,
          procurementCurrentApprover: pickMockWorkflowCurrentApprover(r.id),
        }
        : r
    ));
    const payload = buildSheetPayloadFromEditor(rowsSnapshot);
    const nextSheets = compareSheets.map((s) => (s.id === payload.id ? payload : s));
    saveCompareSheets(nextSheets);
    setCompareRows(rowsSnapshot);
    setSelectedCompareKeys([]);
    message.success('比价单审批流程提交成功');
  };

  const handleSubmitProcurement = () => {
    if (!selectedCompareKeys.length) {
      message.warning('请勾选需要提交采购的购买记录');
      return;
    }
    const selectedRows = compareRows.filter((r) => selectedCompareKeys.includes(r.id));
    const noQuotes = selectedRows.find((r) => !(r.quotes || []).length);
    if (noQuotes) {
      message.warning('勾选记录须新增保险报价（报价情况为必填）');
      return;
    }
    const noConfirmed = selectedRows.find((r) => !r.confirmedQuoteId);
    if (noConfirmed) {
      message.warning('勾选记录须将报价设为最终比价结果后方可提交');
      return;
    }
    const noPayDate = selectedRows.find((r) => !r.latestPayDate);
    if (noPayDate) {
      message.warning('勾选记录须填写最晚付费日期');
      return;
    }
    const alreadySubmitted = selectedRows.find((r) => isCompareProcurementSelectionDisabled(r.procurementStatus));
    if (alreadySubmitted) {
      message.warning('勾选记录中包含审批中或审批通过项，请重新选择');
      return;
    }
    if (!validateCompareSheetRequiredMeta()) return;
    if (!editingCompareSheetId) {
      Modal.confirm({
        title: '保存并提交采购',
        content: '提交采购前将先保存当前比价单，是否继续？',
        okText: '继续',
        cancelText: '取消',
        centered: true,
        onOk: () => {
          const savedId = handleSubmitCompareSheet({ closeModal: false });
          if (savedId) submitProcurementApplication();
        },
      });
      return;
    }
    submitProcurementApplication();
  };

  const resolvePolicyVehicleKey = (plateOrVin) => {
    const key = (plateOrVin || '').trim();
    if (!key) return null;
    const byPlate = findVehicleByPlate(key);
    if (byPlate) return getVehicleLedgerKey(byPlate);
    const byVin = findVehicleByVin(key);
    if (byVin) return getVehicleLedgerKey(byVin);
    return null;
  };

  const upsertPolicyRecognTask = useCallback((snapshot) => {
    const {
      taskId,
      entry,
      mode,
      insuranceType,
      results,
      phase,
      completedAt,
      totalFileCount,
      recognDoneCount,
    } = snapshot;
    if (!taskId) return;
    setPolicyRecognTasks((prev) => {
      const existing = prev.find((t) => t.id === taskId);
      let mergedResults = results;
      if (mergedResults !== undefined && existing?.results?.length) {
        const existingFailed = existing.results.filter((r) => r.recognSuccess === false);
        const newHasFailed = mergedResults.some((r) => r.recognSuccess === false);
        if (existingFailed.length && !newHasFailed) {
          mergedResults = [...mergedResults, ...existingFailed];
        }
      }
      const finalResults = mergedResults !== undefined ? mergedResults : (existing?.results || []);
      const record = buildPolicyRecognTaskRecord({
        id: taskId,
        entry: entry ?? existing?.entry ?? 'ocr',
        mode: mode ?? existing?.mode ?? 'policy',
        insuranceType: insuranceType ?? existing?.insuranceType ?? '',
        results: finalResults,
        createdAt: existing?.createdAt,
        creator: existing?.creator,
        completedAt: completedAt ?? existing?.completedAt ?? '',
        phase: phase ?? existing?.phase ?? 'results',
        totalFileCount: totalFileCount ?? existing?.totalFileCount,
        recognDoneCount: recognDoneCount ?? existing?.recognDoneCount,
      });
      const idx = prev.findIndex((t) => t.id === taskId);
      const next = idx >= 0
        ? prev.map((t, i) => (i === idx ? record : t))
        : [record, ...prev];
      persistPolicyRecognTasksToStorage(next);
      return next;
    });
  }, []);

  const vehicleInsuranceHistory = useMemo(() => {
    if (!vehicleInsMgmtVehicle) {
      return { timeline: [], timelinePolicy: [], timelineBiz: [], byType: {}, ledgerKey: '' };
    }
    const built = buildVehicleInsuranceHistory(
      vehicleInsMgmtVehicle,
      allInsurance,
      compareSheets,
      policyRecognTasks
    );
    const patched = applyHistoryEditsToVehicleHistory(built, insuranceHistoryEdits);
    const insRecord = ensureInsuranceRecordShape(allInsurance[patched.ledgerKey] || createEmptyInsuranceRecord());
    const { timelinePolicy, timelineBiz } = splitVehicleInsuranceTimeline(patched.timeline, insRecord);
    return { ...patched, timelinePolicy, timelineBiz };
  }, [vehicleInsMgmtVehicle, allInsurance, compareSheets, policyRecognTasks, insuranceHistoryEdits]);

  const openVehicleInsuranceMgmt = (vehicle) => {
    setVehicleInsMgmtVehicle(vehicle);
    setVehicleInsMgmtActiveTab('timeline');
    setVehicleInsMgmtHighlightId('');
    setVehicleInsMgmtPolicyNoFilter('');
    setVehicleInsMgmtTabPage({});
    setVehicleInsMgmtOpen(true);
  };

  const openPolicyBizModal = (record, mode) => {
    if (!vehicleInsMgmtVehicle || !record?.typeKey) return;
    const ledgerKey = getVehicleLedgerKey(vehicleInsMgmtVehicle);
    const item = allInsurance[ledgerKey]?.[record.typeKey] || {};
    setPolicyBizModalRecord(record);
    setPolicyBizModalMode(mode);
    setPolicyBizForm({
      suspendTime: item.suspendTime || ANCHOR_TODAY,
      resumeTime: item.resumeTime || item.reinstateDate || '',
      newEndDate: item.endDate || '',
      cancelTime: item.cancelTime || ANCHOR_TODAY,
      refundPremium: item.refundPremium || item.premium || '',
    });
    setPolicyBizAttachmentFileList(attachmentsToUploadFileList(item.attachments || []));
    setPolicyBizModalOpen(true);
  };

  const openPolicyOpHistoryModal = (record) => {
    if (!vehicleInsMgmtVehicle || !record) return;
    const ledgerKey = getVehicleLedgerKey(vehicleInsMgmtVehicle);
    const ledgerItem = allInsurance[ledgerKey]?.[record.typeKey];
    let logs = record.operationLogs || [];
    if (record.isArchived && ledgerItem?.archivedPolicies?.length) {
      const archivedIndex = Number(String(record.id || '').split('-archived-')[1]);
      if (!Number.isNaN(archivedIndex)) {
        logs = ledgerItem.archivedPolicies[archivedIndex]?.operationLogs || logs;
      }
    } else if (record.isLedgerCurrent && ledgerItem) {
      logs = ledgerItem.operationLogs || logs;
    }
    setPolicyOpHistoryRecord({ ...record, operationLogs: logs });
    setPolicyOpHistoryOpen(true);
  };

  const handlePolicyBizAttachmentChange = ({ fileList }) => {
    const incoming = fileList.filter((f) => f.status !== 'removed');
    const valid = incoming.filter((f) => isPolicyRecognImageOrPdf(f));
    if (valid.length < incoming.length) {
      message.warning('已忽略不支持格式，附件仅支持 PDF / 图片');
    }
    setPolicyBizAttachmentFileList(
      valid.map((f) => ({
        ...f,
        status: 'done',
        uploadedAt: f.uploadedAt || formatCompareSheetNow(),
      }))
    );
  };

  const submitPolicyBizModal = () => {
    if (!vehicleInsMgmtVehicle || !policyBizModalRecord?.typeKey) return;
    const ledgerKey = getVehicleLedgerKey(vehicleInsMgmtVehicle);
    const typeKey = policyBizModalRecord.typeKey;
    const mode = policyBizModalMode;
    const attachments = uploadFileListToAttachments(policyBizAttachmentFileList);

    if (mode === 'suspend' && (!policyBizForm.suspendTime || !policyBizForm.newEndDate)) {
      message.warning('请填写中止时间与「新到期日期」');
      return;
    }
    if (mode === 'resume' && (!policyBizForm.resumeTime || !policyBizForm.newEndDate)) {
      message.warning('请填写恢复时间与「新到期日期」');
      return;
    }
    if (mode === 'cancel' && !policyBizForm.cancelTime) {
      message.warning('请填写退保时间');
      return;
    }

    updateAllInsurance((prev) => {
      const rec = ensureInsuranceRecordShape(prev[ledgerKey] || createEmptyInsuranceRecord());
      const before = { ...rec[typeKey] };
      const nextItem = { ...before };
      const changes = [];
      const beforeStatus = before.policyTag === 'cancelled'
        ? '已退保'
        : before.policyTag === 'suspended'
          ? '已停保'
          : '正常';

      if (mode === 'suspend') {
        changes.push(
          { label: '保单状态', before: beforeStatus, after: '已停保' },
          { label: '到期日期', before: before.endDate, after: policyBizForm.newEndDate },
          { label: '中止时间', before: before.suspendTime, after: policyBizForm.suspendTime },
          { label: '恢复时间', before: before.resumeTime || before.reinstateDate, after: policyBizForm.resumeTime },
        );
        nextItem.policyTag = 'suspended';
        nextItem.endDate = policyBizForm.newEndDate;
        nextItem.suspendTime = policyBizForm.suspendTime;
        nextItem.resumeTime = policyBizForm.resumeTime;
        nextItem.reinstateDate = policyBizForm.resumeTime;
        if (attachments.length) nextItem.attachments = attachments;
      } else if (mode === 'resume') {
        const resumeBeforeStatus = before.policyTag === 'cancelled'
          ? '已退保'
          : before.policyTag === 'suspended'
            ? '已停保'
            : '正常';
        changes.push(
          { label: '保单状态', before: resumeBeforeStatus, after: '正常' },
          { label: '到期日期', before: before.endDate, after: policyBizForm.newEndDate },
          { label: '恢复时间', before: before.resumeTime || before.reinstateDate, after: policyBizForm.resumeTime },
        );
        if (before.policyTag === 'cancelled') {
          changes.push({ label: '退保时间', before: before.cancelTime, after: '' });
          nextItem.cancelTime = '';
        }
        nextItem.policyTag = '';
        nextItem.endDate = policyBizForm.newEndDate;
        nextItem.resumeTime = policyBizForm.resumeTime;
        nextItem.reinstateDate = policyBizForm.resumeTime;
        if (attachments.length) nextItem.attachments = attachments;
      } else if (mode === 'cancel') {
        changes.push(
          { label: '保单状态', before: beforeStatus, after: '已退保' },
          { label: '到期日期', before: before.endDate, after: '' },
          { label: '退保时间', before: before.cancelTime, after: policyBizForm.cancelTime },
          { label: '退还保费', before: before.refundPremium, after: policyBizForm.refundPremium },
        );
        nextItem.policyTag = 'cancelled';
        nextItem.endDate = '';
        nextItem.cancelTime = policyBizForm.cancelTime;
        nextItem.refundPremium = policyBizForm.refundPremium;
        if (attachments.length) nextItem.attachments = attachments;
      }
      nextItem.updateTime = formatCompareSheetNow();
      nextItem.updateUser = PROTO_COMPARE_CREATOR;
      nextItem.operationLogs = appendInsuranceOperationLog(before.operationLogs, {
        type: mode,
        remark: buildOperationChangeRemark(changes),
        attachments: ['suspend', 'resume', 'cancel'].includes(mode) ? attachments : [],
      });
      return { ...prev, [ledgerKey]: { ...rec, [typeKey]: nextItem } };
    });

    const okText = mode === 'suspend' ? '停保已提交' : mode === 'resume' ? '复驶已提交' : '退保已提交';
    message.success(okText);
    setPolicyBizModalOpen(false);
    setPolicyBizModalRecord(null);
    setPolicyBizForm({ ...EMPTY_POLICY_BIZ_FORM });
    setPolicyBizAttachmentFileList([]);
  };

  const getPolicyMoreMenuItems = (record) => {
    const items = [];
    if (record?.isLedgerCurrent && !record?.isArchived) {
      const pt = record.purchaseType;
      if (pt === 'cancel') {
        items.push({ key: 'resume', label: '复驶' });
      } else if (pt === 'new' || pt === 'renew') {
        items.push({ key: 'suspend', label: '停保' });
        items.push({ key: 'cancel', label: '退保' });
      } else if (pt === 'rentStop') {
        items.push({ key: 'resume', label: '复驶' });
        items.push({ key: 'cancel', label: '退保' });
      }
    }
    items.push({ key: 'history', label: '操作历史' });
    return items;
  };

  const handlePolicyMoreMenuClick = (record, key) => {
    if (key === 'history') {
      openPolicyOpHistoryModal(record);
      return;
    }
    openPolicyBizModal(record, key);
  };

  const jumpToVehicleInsuranceRecord = (typeKey, recordId, rowsSource) => {
    const rows = rowsSource || vehicleInsuranceHistory.byType[typeKey] || [];
    const idx = rows.findIndex((r) => r.id === recordId);
    if (idx >= 0 && rows.length > 8) {
      const pageSize = 8;
      setVehicleInsMgmtTabPage((prev) => ({
        ...prev,
        [typeKey]: Math.floor(idx / pageSize) + 1,
      }));
    }
    setVehicleInsMgmtActiveTab(typeKey);
    setVehicleInsMgmtHighlightId(recordId);
    window.setTimeout(() => setVehicleInsMgmtHighlightId(''), 3200);
  };

  const handleVehicleInsMgmtPolicyNoSearch = () => {
    const key = (vehicleInsMgmtPolicyNoFilter || '').trim().toUpperCase();
    if (!key) {
      message.warning('请输入保单号');
      return;
    }
    const matched = vehicleInsuranceHistory.timeline.filter((record) => (
      String(record.policyNo || '').toUpperCase().includes(key)
    ));
    if (!matched.length) {
      message.warning('未找到匹配的保单记录');
      return;
    }
    if (matched.length > 1) {
      message.info(`找到 ${matched.length} 条匹配记录，已定位至第一条`);
    }
    const target = matched[0];
    jumpToVehicleInsuranceRecord(target.typeKey, target.id);
  };

  const handleInsuranceRecordPreview = (record) => {
    Modal.info({
      title: `预览 · ${record.fileName}`,
      width: 520,
      centered: true,
      content: (
        <div style={{ padding: '12px 0', color: '#64748b', fontSize: 13, lineHeight: 1.6 }}>
          <div><strong style={{ color: '#334155' }}>险种：</strong>{record.typeLabel}</div>
          <div><strong style={{ color: '#334155' }}>保单号：</strong>{record.policyNo || '—'}</div>
          <div><strong style={{ color: '#334155' }}>保险公司：</strong>{record.company || '—'}</div>
          <div style={{ marginTop: 12 }}>正式环境将内嵌 PDF / 图片预览；原型仅展示附件名称。</div>
        </div>
      ),
      okText: '关闭',
    });
  };

  const handleInsuranceRecordDownload = (record) => {
    message.success(`已开始下载：${record.fileName || '保单附件'}（原型）`);
  };

  const handleOperationLogAttachmentPreview = (attachment) => {
    if (!attachment?.name) {
      message.info('该操作未上传附件');
      return;
    }
    Modal.info({
      title: `预览 · ${attachment.name}`,
      width: 520,
      centered: true,
      content: (
        <div style={{ padding: '12px 0', color: '#64748b', fontSize: 13, lineHeight: 1.6 }}>
          <div><strong style={{ color: '#334155' }}>文件名：</strong>{attachment.name}</div>
          {attachment.size ? (
            <div><strong style={{ color: '#334155' }}>大小：</strong>{formatAttachmentSize(attachment.size)}</div>
          ) : null}
          <div style={{ marginTop: 12 }}>正式环境将内嵌 PDF / 图片预览；原型仅展示附件名称。</div>
        </div>
      ),
      okText: '关闭',
    });
  };

  const handleOperationLogAttachmentDownload = (attachment) => {
    if (!attachment?.name) {
      message.info('该操作未上传附件');
      return;
    }
    message.success(`已开始下载：${attachment.name}（原型）`);
  };

  const renderInsurancePolicyStatusTag = (record) => {
    const meta = getInsurancePolicyStatusMeta(record);
    const tag = (
      <Tag color={meta.color} style={{ margin: 0, fontWeight: 600, fontSize: 12 }}>
        {meta.label}
      </Tag>
    );
    if (meta.label === '已停保') {
      return (
        <Tooltip title={renderSuspendTooltipTitle(record)}>
          {tag}
        </Tooltip>
      );
    }
    return tag;
  };

  const syncVehicleInsHistoryEditToLedger = (record, detail) => {
    if (!vehicleInsMgmtVehicle || record.source !== 'ledger') return;
    const ledgerKey = getVehicleLedgerKey(vehicleInsMgmtVehicle);
    if (!ledgerKey) return;
    const ledgerEvents = new Set(['purchase', 'suspend', 'cancel']);
    if (!ledgerEvents.has(record.eventType)) return;
    const mode = bizTypeToRecognMode(detail.bizType);
    updateAllInsurance((prev) => {
      const rec = ensureInsuranceRecordShape(prev[ledgerKey] || createEmptyInsuranceRecord());
      const item = rec[record.typeKey];
      if (!item?.policyNo) return prev;
      if (record.eventType === 'purchase' && item.policyNo !== record.policyNo) return prev;
      const nextItem = applyPolicyDetailToInsuranceItem({ ...item }, detail, mode);
      nextItem.updateTime = formatCompareSheetNow();
      nextItem.updateUser = PROTO_COMPARE_CREATOR;
      return { ...prev, [ledgerKey]: { ...rec, [record.typeKey]: nextItem } };
    });
  };

  const syncVehicleInsHistoryEditToRecognTask = (record, detail) => {
    if (record.source !== 'recognize' || !record.recognizeTaskId || !record.recognizeResultId) return;
    setPolicyRecognTasks((prev) => {
      const next = prev.map((task) => {
        if (task.id !== record.recognizeTaskId) return task;
        const results = (task.results || []).map((r) => (
          r.id === record.recognizeResultId
            ? mergeRecognResultWithDetail(r, detail)
            : r
        ));
        return { ...task, results };
      });
      persistPolicyRecognTasksToStorage(next);
      return next;
    });
  };

  const openVehicleInsHistoryEdit = (record) => {
    if (!vehicleInsMgmtVehicle) return;
    setVehicleInsHistoryEditRecord(record);
    setVehicleInsHistoryEditDraft(historyRecordToPolicyDetail(record, vehicleInsMgmtVehicle));
    setVehicleInsHistoryEditOpen(true);
  };

  const saveVehicleInsHistoryEdit = () => {
    if (!vehicleInsHistoryEditRecord) return;
    const detail = normalizePolicyDetail(vehicleInsHistoryEditDraft);
    if (!detail.policyNo && !detail.endDate) {
      message.warning('请至少填写保单号或到期日期');
      return;
    }
    const record = vehicleInsHistoryEditRecord;
    setInsuranceHistoryEdits((prev) => {
      const next = { ...prev, [record.id]: detail };
      persistInsuranceHistoryEditsToStorage(next);
      return next;
    });
    syncVehicleInsHistoryEditToLedger(record, detail);
    syncVehicleInsHistoryEditToRecognTask(record, detail);
    setVehicleInsHistoryEditOpen(false);
    setVehicleInsHistoryEditRecord(null);
    message.success('已保存保单要素');
  };

  const renderPurchaseTypeChip = (purchaseType, record) => {
    const meta = POLICY_PURCHASE_TYPE_META[purchaseType] || { label: purchaseType, chipClass: '' };
    const chip = (
      <span className={`lc-purchase-type-chip ${meta.chipClass || ''}`}>{meta.label}</span>
    );
    if (purchaseType === 'rentStop' && record) {
      return (
        <Tooltip title={renderSuspendTooltipTitle(record)} placement="top">
          {chip}
        </Tooltip>
      );
    }
    return chip;
  };

  const renderVehicleInsuranceTimelineCard = (item, side) => (
    <div
      className={`lc-vehicle-ins-timeline-item lc-vehicle-ins-timeline-item--${side}`}
      role="button"
      tabIndex={0}
      onClick={() => jumpToVehicleInsuranceRecord(item.typeKey, item.id)}
      onKeyDown={(e) => {
        if (e.key === 'Enter') jumpToVehicleInsuranceRecord(item.typeKey, item.id);
      }}
    >
      <div style={{ fontSize: 12, color: '#64748b', fontVariantNumeric: 'tabular-nums', marginBottom: 6 }}>
        {item.time || '—'}
      </div>
      <div className="lc-vehicle-ins-timeline-title">
        {renderPurchaseTypeChip(item.purchaseType, item)}
        <span>{item.typeLabel}</span>
        {item.policyNo ? (
          <span style={{ fontSize: 12, color: '#64748b', fontWeight: 500 }}>{item.policyNo}</span>
        ) : null}
      </div>
      <div className="lc-vehicle-ins-timeline-desc">{item.summary}</div>
      <div className="lc-vehicle-ins-timeline-meta">
        {item.sourceLabel ? `${item.sourceLabel} · ` : ''}
        点击查看 {item.typeLabel} 明细 →
      </div>
    </div>
  );

  const renderVehicleInsuranceCenterTimeline = () => {
    const policyItems = vehicleInsuranceHistory.timelinePolicy || [];
    const bizItems = vehicleInsuranceHistory.timelineBiz || [];
    const merged = [
      ...policyItems.map((item) => ({ ...item, timelineSide: 'policy' })),
      ...bizItems.map((item) => ({ ...item, timelineSide: 'biz' })),
    ].sort((a, b) => String(b.time || '').localeCompare(String(a.time || '')));

    return (
      <div className="lc-vehicle-ins-timeline-center">
        <div className="lc-vehicle-ins-timeline-center-head">
          <div className="lc-vehicle-ins-timeline-center-head-side lc-vehicle-ins-timeline-center-head-side--left">
            保单新增 / 续保
          </div>
          <div className="lc-vehicle-ins-timeline-center-head-axis" aria-hidden />
          <div className="lc-vehicle-ins-timeline-center-head-side lc-vehicle-ins-timeline-center-head-side--right">
            停保 / 复驶 / 退保
          </div>
        </div>
        <div className="lc-vehicle-ins-timeline-center-body">
          {merged.map((item) => (
            <div key={item.id} className="lc-vehicle-ins-timeline-center-row">
              <div className="lc-vehicle-ins-timeline-center-col lc-vehicle-ins-timeline-center-col--left">
                {item.timelineSide === 'policy' ? renderVehicleInsuranceTimelineCard(item, 'left') : null}
              </div>
              <div className="lc-vehicle-ins-timeline-center-axis">
                <span
                  className={`lc-vehicle-ins-timeline-center-dot lc-vehicle-ins-timeline-center-dot--${item.timelineSide}`}
                  aria-hidden
                />
              </div>
              <div className="lc-vehicle-ins-timeline-center-col lc-vehicle-ins-timeline-center-col--right">
                {item.timelineSide === 'biz' ? renderVehicleInsuranceTimelineCard(item, 'right') : null}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const vehicleInsMgmtTabCounts = useMemo(() => {
    const counts = {
      timeline: (vehicleInsuranceHistory.timelinePolicy?.length || 0)
        + (vehicleInsuranceHistory.timelineBiz?.length || 0),
    };
    VEHICLE_INSURANCE_MGMT_TABS.filter((t) => t.key !== 'timeline').forEach((tab) => {
      counts[tab.key] = (vehicleInsuranceHistory.byType[tab.key] || []).length;
    });
    return counts;
  }, [vehicleInsuranceHistory]);

  const renderMgmtTableEllipsis = (val) => {
    const text = val || '—';
    return (
      <Tooltip title={text === '—' ? '' : text}>
        <span className="lc-vehicle-ins-mgmt-cell-ellipsis">{text}</span>
      </Tooltip>
    );
  };

  const vehicleInsuranceHistoryColumns = [
    {
      title: '保险导入时间',
      dataIndex: 'purchaseTime',
      width: 148,
      ellipsis: true,
      render: (val) => renderMgmtTableEllipsis(val),
    },
    {
      title: '类型',
      dataIndex: 'purchaseType',
      width: 72,
      render: (val, record) => renderPurchaseTypeChip(val, record),
    },
    {
      title: '保单号',
      dataIndex: 'policyNo',
      width: 148,
      ellipsis: true,
      render: (val) => renderMgmtTableEllipsis(val),
    },
    {
      title: '保险状态',
      key: 'policyStatus',
      width: 88,
      render: (_, record) => renderInsurancePolicyStatusTag(record),
    },
    {
      title: '保险公司',
      dataIndex: 'company',
      width: 160,
      ellipsis: true,
      render: (val) => renderMgmtTableEllipsis(val),
    },
    {
      title: '付款时间',
      dataIndex: 'payTime',
      width: 148,
      ellipsis: true,
      render: (val) => renderMgmtTableEllipsis(val),
    },
    {
      title: '生效日期',
      dataIndex: 'startDate',
      width: 100,
      ellipsis: true,
      render: (val) => renderMgmtTableEllipsis(val),
    },
    {
      title: '到期日期',
      dataIndex: 'endDate',
      width: 100,
      ellipsis: true,
      render: (val) => renderMgmtTableEllipsis(val),
    },
    {
      title: '金额',
      dataIndex: 'premium',
      width: 96,
      align: 'right',
      ellipsis: true,
      render: (val, record) => {
        const text = val
          ? `${record.purchaseType === 'cancel' ? '-' : ''}¥${val}`
          : '—';
        return (
          <Tooltip title={text}>
            <span
              className="lc-vehicle-ins-mgmt-cell-ellipsis"
              style={{
                fontVariantNumeric: 'tabular-nums',
                fontWeight: 600,
                color: record.purchaseType === 'cancel' ? '#b45309' : '#047857',
              }}
            >
              {text}
            </span>
          </Tooltip>
        );
      },
    },
    {
      title: '操作',
      key: 'action',
      width: 188,
      fixed: 'right',
      render: (_, record) => (
        <div className="lc-vehicle-ins-mgmt-actions">
          <Button type="link" size="small" style={{ padding: 0, fontWeight: 600 }} onClick={() => openVehicleInsHistoryEdit(record)}>编辑</Button>
          <Button type="link" size="small" style={{ padding: 0 }} onClick={() => handleInsuranceRecordPreview(record)}>预览</Button>
          <Button type="link" size="small" style={{ padding: 0, fontWeight: 600, color: '#059669' }} onClick={() => handleInsuranceRecordDownload(record)}>下载</Button>
          <Dropdown
            trigger={['click']}
            placement="bottomRight"
            menu={{
              items: getPolicyMoreMenuItems(record),
              onClick: ({ key, domEvent }) => {
                domEvent.stopPropagation();
                handlePolicyMoreMenuClick(record, key);
              },
            }}
          >
            <Tooltip title="更多">
              <span
                className="lc-vehicle-ins-policy-more-btn"
                role="button"
                tabIndex={0}
                aria-label="更多操作"
                onClick={(e) => e.stopPropagation()}
              >
                {ICONS.more}
              </span>
            </Tooltip>
          </Dropdown>
        </div>
      ),
    },
  ];

  const renderVehicleInsuranceTypeTab = (typeKey) => {
    const rows = vehicleInsuranceHistory.byType[typeKey] || [];
    const tabLabel = VEHICLE_INSURANCE_MGMT_TABS.find((t) => t.key === typeKey)?.label || '';
    if (!rows.length) {
      return (
        <div className="lc-vehicle-ins-mgmt-empty">
          <div style={{ fontSize: 15, fontWeight: 700, color: '#334155', marginBottom: 8 }}>{tabLabel}暂无记录</div>
          <div style={{ fontSize: 13, color: '#64748b' }}>该险种首次购买为「新保」，此前已购后再投保记为「续保」</div>
        </div>
      );
    }
    return (
      <div className="lc-vehicle-ins-mgmt-table-card">
        <Table
          className="lc-vehicle-ins-mgmt-table"
          size="small"
          rowKey="id"
          tableLayout="fixed"
          dataSource={rows}
          columns={vehicleInsuranceHistoryColumns}
          pagination={rows.length > 8 ? {
            current: vehicleInsMgmtTabPage[typeKey] || 1,
            pageSize: 8,
            showSizeChanger: false,
            size: 'small',
            onChange: (page) => setVehicleInsMgmtTabPage((prev) => ({ ...prev, [typeKey]: page })),
          } : false}
          scroll={{ x: 1248 }}
          rowClassName={(record) => (record.id === vehicleInsMgmtHighlightId ? 'lc-ins-history-row--active' : '')}
        />
      </div>
    );
  };

  const renderVehicleInsMgmtTabLabel = (tab) => {
    const count = vehicleInsMgmtTabCounts[tab.key] || 0;
    return (
      <span>
        {tab.label}
        {count > 0 ? <span className="lc-ins-tab-badge">{count}</span> : null}
      </span>
    );
  };

  const filteredPolicyRecognTasks = useMemo(() => {
    const mode = appliedPolicyRecognTasksFilters.mode;
    const range = appliedPolicyRecognTasksFilters.createdRange;
    return [...policyRecognTasks]
      .filter((task) => {
        if (mode && mode !== '全部' && task.modeLabel !== mode) return false;
        return compareSheetMatchesCreatedRange(task.createdAt, range);
      })
      .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
  }, [policyRecognTasks, appliedPolicyRecognTasksFilters]);

  const openPolicyRecognTasksModal = () => {
    setPolicyRecognTasksFilters({ ...DEFAULT_POLICY_RECOGN_TASK_FILTERS });
    setAppliedPolicyRecognTasksFilters({ ...DEFAULT_POLICY_RECOGN_TASK_FILTERS });
    setPolicyRecognTasksOpen(true);
  };

  const handlePolicyRecognTasksQuery = () => {
    setAppliedPolicyRecognTasksFilters({ ...policyRecognTasksFilters });
    message.success('已刷新任务列表');
  };

  const handlePolicyRecognTasksReset = () => {
    setPolicyRecognTasksFilters({ ...DEFAULT_POLICY_RECOGN_TASK_FILTERS });
    setAppliedPolicyRecognTasksFilters({ ...DEFAULT_POLICY_RECOGN_TASK_FILTERS });
  };

  const openPolicyRecogn = (entry, initialMode = 'policy') => {
    const canResumeOcr = entry === 'ocr'
      && policyRecognEntry === 'ocr'
      && policyRecognTaskId
      && (policyRecognPhase === 'recognizing'
        || (policyRecognPhase === 'results' && policyRecognResults.length));
    if (canResumeOcr) {
      if (policyRecognPhase === 'results' && policyRecognResults.length && !policyRecognActiveResultId) {
        const preferred = policyRecognResults.find((r) => r.matched && !r.confirmed)
          || policyRecognResults.find((r) => !r.confirmed)
          || policyRecognResults[0];
        if (preferred) {
          setPolicyRecognActiveResultId(preferred.id);
          setPolicyRecognConfirmDraft(buildPolicyRecognConfirmDraft(preferred, policyRecognMode));
          showPolicyRecognResultPreview(preferred);
        }
      }
      setPolicyRecognOpen(true);
      return;
    }
    if (policyRecognTimerRef.current) {
      window.clearTimeout(policyRecognTimerRef.current);
      policyRecognTimerRef.current = null;
    }
    if (policyRecognProgressTimerRef.current) {
      window.clearInterval(policyRecognProgressTimerRef.current);
      policyRecognProgressTimerRef.current = null;
    }
    setPolicyRecognEntry(entry);
    setPolicyRecognMode(entry === 'import' ? 'policy' : initialMode);
    setPolicyRecognInsuranceType('交强险');
    setPolicyRecognPhase('upload');
    setPolicyRecognFiles([]);
    setPolicyRecognTaskId('');
    setPolicyRecognResults([]);
    setPolicyRecognViewOnly(false);
    setPolicyRecognActiveResultId('');
    setPolicyRecognConfirmDraft({ ...EMPTY_POLICY_DETAIL });
    setPolicyPreview(null);
    setPolicyRecognOpen(true);
  };

  const openPolicyRecognTaskRecord = (task) => {
    if (!task?.id) {
      message.warning('任务记录无效');
      return;
    }
    if (isPolicyRecognTaskRecognizing(task)) {
      message.info('请等待识别完成后操作');
      return;
    }
    const successResults = getPolicyRecognSuccessResults(task.results).map((r) => ({ ...r }));
    if (!successResults.length) {
      message.warning('暂无识别成功的结果可确认');
      return;
    }
    setPolicyRecognEntry(task.entry || 'ocr');
    setPolicyRecognMode(task.mode || 'policy');
    setPolicyRecognInsuranceType(task.insuranceType || '交强险');
    setPolicyRecognTaskId(task.id);
    setPolicyRecognResults(successResults);
    setPolicyRecognFiles([]);
    setPolicyRecognViewOnly(task.status === 'completed');
    setPolicyRecognPhase('results');
    setPolicyPreview(null);
    setPolicyRecognOpen(true);
    setPolicyRecognTasksOpen(false);
    const preferred = successResults.find((r) => r.matched && !r.confirmed)
      || successResults.find((r) => !r.confirmed)
      || successResults[0];
    if (preferred) {
      setPolicyRecognActiveResultId(preferred.id);
      setPolicyRecognConfirmDraft(buildPolicyRecognConfirmDraft(preferred, task.mode || 'policy'));
      showPolicyRecognResultPreview(preferred);
    }
  };

  const closePolicyRecogn = () => {
    const syncedResults = policyRecognPhase === 'results'
      ? persistActiveRecognDraft()
      : policyRecognResults;
    if (syncedResults !== policyRecognResults) {
      setPolicyRecognResults(syncedResults);
    }
    if (policyRecognTaskId && syncedResults.length) {
      const status = derivePolicyRecognTaskStatus(syncedResults);
      upsertPolicyRecognTask({
        taskId: policyRecognTaskId,
        entry: policyRecognEntry,
        mode: policyRecognMode,
        insuranceType: policyRecognInsuranceType,
        results: syncedResults,
        phase: policyRecognPhase,
        completedAt: status === 'completed' ? formatCompareSheetNow() : undefined,
      });
    }
    if (policyPreview?.url) URL.revokeObjectURL(policyPreview.url);
    setPolicyPreview(null);
    setPolicyRecognOpen(false);
  };

  const policyRecognAllUploaded = policyRecognFiles.length > 0
    && policyRecognFiles.every((f) => f.status === 'done');

  const handlePolicyRecognUploadChange = ({ fileList }) => {
    const incoming = fileList.filter((f) => f.status !== 'removed');
    const valid = incoming.filter((f) => isPolicyRecognImageOrPdf(f));
    if (valid.length < incoming.length) {
      message.warning('已忽略不支持格式，仅支持 PDF / 图片');
    }
    const next = valid.map((f) => {
      if (f.status === 'done') return f;
      return { ...f, status: 'uploading', percent: f.percent || 0 };
    });
    setPolicyRecognFiles(next);
    next.forEach((f, i) => {
      if (f.status === 'uploading') {
        window.setTimeout(() => {
          setPolicyRecognFiles((prev) => prev.map((p) => (
            p.uid === f.uid ? { ...p, status: 'done', percent: 100 } : p
          )));
        }, 500 + i * 280);
      }
    });
  };

  const handlePolicyImportUploadChange = ({ fileList }) => {
    const incoming = fileList.filter((f) => f.status !== 'removed').slice(-1);
    const valid = incoming.filter((f) => isPolicyImportExcelFile(f));
    if (incoming.length && !valid.length) {
      message.warning('请上传 Excel 模板文件（.csv、.xlsx、.xls）');
      return;
    }
    const next = valid.map((f) => (
      f.status === 'done' ? f : { ...f, status: 'done', percent: 100 }
    ));
    setPolicyRecognFiles(next);
  };

  const mergeRecognResultWithDetail = (result, detail) => {
    const mode = resolvePolicyRecognEffectiveMode(policyRecognMode, result);
    const stripped = stripPolicyRecognDraftMeta(detail);
    const normalizedDetail = mode === 'suspend'
      ? enrichSuspendPolicyDetail({ ...stripped, bizType: 'suspend' })
      : mode === 'resume'
        ? enrichResumePolicyDetail({ ...stripped, bizType: 'resume' })
        : mode === 'cancel'
          ? enrichCancelPolicyDetail({ ...stripped, bizType: 'cancel' })
          : normalizePolicyDetail({ ...stripped, bizType: mode !== 'policy' ? mode : (stripped.bizType || 'policy') });
    const rebuilt = buildRecognResultFromDetail(
      {
        id: result.id,
        fileUid: result.fileUid,
        fileName: result.fileName,
        fileType: result.fileType,
      },
      normalizedDetail,
      allInsurance,
      mode
    );
    return { ...result, ...rebuilt, id: result.id, confirmed: result.confirmed };
  };

  const showPolicyRecognResultPreview = (result) => {
    if (!result) return;
    const file = policyRecognFiles.find((f) => f.uid === result.fileUid);
    if (policyPreview?.url) URL.revokeObjectURL(policyPreview.url);
    if (file?.originFileObj && (file.type || '').startsWith('image/')) {
      const url = URL.createObjectURL(file.originFileObj);
      setPolicyPreview({ url, fileName: result.fileName, isImage: true });
      return;
    }
    setPolicyPreview({
      url: null,
      fileName: result.fileName,
      isImage: false,
      hint: policyRecognEntry === 'import'
        ? '导入记录无原件预览，请核对右侧识别字段'
        : (policyRecognFiles.length
          ? 'PDF 预览（原型）：正式环境将内嵌预览识别原件'
          : '任务记录未保存原件，正式环境可从附件库查看'),
    });
  };

  const persistActiveRecognDraft = (resultsList = policyRecognResults) => {
    if (!policyRecognActiveResultId) return resultsList;
    const result = resultsList.find((r) => r.id === policyRecognActiveResultId);
    if (!result) return resultsList;
    const merged = mergeRecognResultWithDetail(result, policyRecognConfirmDraft);
    return resultsList.map((r) => (r.id === policyRecognActiveResultId ? merged : r));
  };

  const selectPolicyRecognResult = (resultId, resultsList = policyRecognResults) => {
    const nextResults = policyRecognActiveResultId && policyRecognActiveResultId !== resultId
      ? persistActiveRecognDraft(resultsList)
      : resultsList;
    if (nextResults !== resultsList) {
      setPolicyRecognResults(nextResults);
    }
    const result = nextResults.find((r) => r.id === resultId);
    if (!result) return nextResults;
    setPolicyRecognActiveResultId(resultId);
    setPolicyRecognConfirmDraft(buildPolicyRecognConfirmDraft(result, policyRecognMode));
    showPolicyRecognResultPreview(result);
    return nextResults;
  };

  const enterPolicyRecognConfirmPhase = (results, snapshot = {}) => {
    const displayResults = getPolicyRecognSuccessResults(results);
    if (!displayResults.length) return;
    if (snapshot.mode) setPolicyRecognMode(snapshot.mode);
    if (snapshot.entry) setPolicyRecognEntry(snapshot.entry);
    if (snapshot.insuranceType !== undefined) setPolicyRecognInsuranceType(snapshot.insuranceType);
    setPolicyRecognResults(displayResults);
    setPolicyRecognPhase('results');
    const preferred = displayResults.find((r) => r.matched && !r.confirmed)
      || displayResults.find((r) => !r.confirmed)
      || displayResults[0];
    if (preferred) {
      setPolicyRecognActiveResultId(preferred.id);
      setPolicyRecognConfirmDraft(buildPolicyRecognConfirmDraft(preferred, snapshot.mode ?? policyRecognMode));
      showPolicyRecognResultPreview(preferred);
    }
    if (snapshot.taskId) {
      upsertPolicyRecognTask({
        taskId: snapshot.taskId,
        entry: snapshot.entry ?? policyRecognEntry,
        mode: snapshot.mode ?? policyRecognMode,
        insuranceType: snapshot.insuranceType ?? policyRecognInsuranceType,
        results,
        phase: 'results',
        totalFileCount: snapshot.totalFileCount,
        recognDoneCount: snapshot.recognDoneCount ?? snapshot.totalFileCount,
      });
    }
  };

  const handleRecognConfirmPlateChange = (plateNo) => {
    const vehicle = plateNo ? findVehicleByPlate(plateNo) : null;
    const result = policyRecognResults.find((r) => r.id === policyRecognActiveResultId);
    const ocrPlate = String(result?.ocrRecognizedPlate || result?.ocrPlateNo || '').trim().toUpperCase();
    const selected = String(plateNo || '').trim().toUpperCase();
    if (ocrPlate && selected && ocrPlate !== selected) {
      message.error(`识别车牌号为 ${ocrPlate}，与所选 ${selected} 不一致，请核对`);
    }
    setPolicyRecognConfirmDraft((prev) => ({
      ...prev,
      plateNo: plateNo || '',
      vin: vehicle?.vin || (plateNo ? prev.vin : ''),
      vehicleOwner: vehicle?.vin
        ? (prev.vehicleOwner || getVehicleRegistrationOwner(plateNo))
        : prev.vehicleOwner,
      _ocrRecognizedPlate: ocrPlate || prev._ocrRecognizedPlate,
      _plateLedgerMatched: !!vehicle,
    }));
  };

  const startPolicyExcelImportTask = async () => {
    const fileItem = policyRecognFiles.find((f) => f.status === 'done');
    const file = fileItem?.originFileObj;
    if (!file) {
      message.warning('请先上传 Excel 导入文件');
      return;
    }
    const taskId = createPolicyRecognTaskId();
    setPolicyRecognPhase('recognizing');
    setPolicyRecognTaskId(taskId);
    try {
      const text = await readPolicyImportFileAsText(file);
      if (!String(text).trim()) {
        setPolicyRecognPhase('upload');
        return;
      }
      const rows = parsePolicyImportFileText(text);
      if (!rows.length) {
        message.error('未解析到有效数据，请按模板填写带 * 的必填项');
        setPolicyRecognPhase('upload');
        return;
      }
      if (!validatePolicyImportRows(rows)) {
        setPolicyRecognPhase('upload');
        return;
      }
      const results = buildImportResultsFromRows(rows, allInsurance);
      enterPolicyRecognConfirmPhase(results, {
        taskId,
        entry: 'import',
        mode: 'policy',
        insuranceType: '',
      });
      const matchedN = results.filter((r) => r.matched).length;
      message.success(`已解析 ${results.length} 条，${matchedN} 条已匹配台账，请核对识别内容后确认`);
    } catch {
      message.error('导入文件读取失败，请重试');
      setPolicyRecognPhase('upload');
    }
  };

  const startPolicyRecognTask = () => {
    if (!policyRecognAllUploaded) {
      message.warning(policyRecognEntry === 'import' ? '请先上传 Excel 文件' : '请等待全部文件上传完成');
      return;
    }
    if (policyRecognEntry === 'import') {
      startPolicyExcelImportTask();
      return;
    }
    if (policyRecognMode === 'policy' && !policyRecognInsuranceType) {
      message.warning('请选择保险类型');
      return;
    }
    const taskId = createPolicyRecognTaskId();
    const entrySnap = policyRecognEntry;
    const modeSnap = policyRecognMode;
    const insuranceSnap = policyRecognInsuranceType;
    const filesSnap = policyRecognFiles;
    const fileCount = filesSnap.filter((f) => f.status === 'done').length;
    if (policyRecognTimerRef.current) {
      window.clearTimeout(policyRecognTimerRef.current);
      policyRecognTimerRef.current = null;
    }
    if (policyRecognProgressTimerRef.current) {
      window.clearInterval(policyRecognProgressTimerRef.current);
      policyRecognProgressTimerRef.current = null;
    }
    setPolicyRecognPhase('recognizing');
    setPolicyRecognTaskId(taskId);
    upsertPolicyRecognTask({
      taskId,
      entry: entrySnap,
      mode: modeSnap,
      insuranceType: insuranceSnap,
      results: [],
      phase: 'recognizing',
      totalFileCount: fileCount,
      recognDoneCount: 0,
    });
    setPolicyRecognOpen(false);
    message.info('正在识别，请稍后点击「保单批量识别」确认识别结果');
    policyRecognProgressTimerRef.current = window.setInterval(() => {
      setPolicyRecognTasks((prev) => {
        const task = prev.find((t) => t.id === taskId);
        if (!task || !isPolicyRecognTaskRecognizing(task)) {
          if (policyRecognProgressTimerRef.current) {
            window.clearInterval(policyRecognProgressTimerRef.current);
            policyRecognProgressTimerRef.current = null;
          }
          return prev;
        }
        const nextDone = Math.min(task.totalFileCount, (task.recognDoneCount || 0) + 1);
        if (nextDone >= task.totalFileCount) {
          if (policyRecognProgressTimerRef.current) {
            window.clearInterval(policyRecognProgressTimerRef.current);
            policyRecognProgressTimerRef.current = null;
          }
          return prev;
        }
        const next = prev.map((t) => (
          t.id === taskId ? { ...t, recognDoneCount: nextDone } : t
        ));
        persistPolicyRecognTasksToStorage(next);
        return next;
      });
    }, 480);
    policyRecognTimerRef.current = window.setTimeout(() => {
      policyRecognTimerRef.current = null;
      if (policyRecognProgressTimerRef.current) {
        window.clearInterval(policyRecognProgressTimerRef.current);
        policyRecognProgressTimerRef.current = null;
      }
      const results = buildMockOcrResults(
        filesSnap,
        modeSnap,
        insuranceSnap,
        allInsurance
      );
      enterPolicyRecognConfirmPhase(results, {
        taskId,
        entry: entrySnap,
        mode: modeSnap,
        insuranceType: insuranceSnap,
        totalFileCount: fileCount,
        recognDoneCount: fileCount,
      });
    }, 2400);
  };

  const openPolicyRecognResults = () => {
    if (!policyRecognResults.length) {
      message.warning('暂无识别结果');
      return;
    }
    enterPolicyRecognConfirmPhase(policyRecognResults, { taskId: policyRecognTaskId });
  };

  const renderPolicyDetailForm = (draft, setDraft, options = {}) => {
    const {
      showBizType = true,
      recognConfirmMode = false,
      policyEntryMode = false,
      bizRecognMode,
      onPlateChange,
      recognResult,
    } = options;
    const isSuspendRecogn = recognConfirmMode && (
      bizRecognMode === 'suspend' || draft.bizType === 'suspend'
    );
    const isResumeRecogn = recognConfirmMode && (
      bizRecognMode === 'resume' || draft.bizType === 'resume'
    );
    const isCancelRecogn = recognConfirmMode && (
      bizRecognMode === 'cancel' || draft.bizType === 'cancel'
    );
    const isEndorsementRecogn = isSuspendRecogn || isResumeRecogn || isCancelRecogn;
    const isPolicyRecogn = recognConfirmMode && !isEndorsementRecogn;
    const companySelectList = (() => {
      if (!isPolicyRecogn) return INSURANCE_MGMT_COMPANIES;
      const raw = recognResult?.ocrCompanyRaw || '';
      const partial = matchInsuranceCompanyCandidates(raw);
      if (partial.length > 1) return partial;
      return INSURANCE_MGMT_COMPANIES;
    })();
    const companySelectOptions = companySelectList.map((c) => ({ label: c, value: c }));
    const requiredKeys = isSuspendRecogn
      ? SUSPEND_RECOGN_FORM_REQUIRED_KEYS
      : isResumeRecogn
        ? RESUME_RECOGN_FORM_REQUIRED_KEYS
        : isCancelRecogn
          ? CANCEL_RECOGN_FORM_REQUIRED_KEYS
          : (recognConfirmMode || policyEntryMode ? POLICY_ENTRY_FORM_REQUIRED_KEYS : []);
    const fieldLabel = (text, key) => (
      requiredKeys.includes(key) ? <span className="lc-policy-field-label-required">{text}</span> : text
    );
    const coverageRows = getCoverageItemsFormRows(draft.coverageItems);
    const updateCoverageField = (idx, field, value) => {
      const next = coverageRows.map((row, i) => (i === idx ? { ...row, [field]: value } : row));
      setDraft((p) => ({ ...p, coverageItems: next }));
    };
    const addCoverageRow = () => {
      setDraft((p) => ({
        ...p,
        coverageItems: [...getCoverageItemsFormRows(p.coverageItems), { ...EMPTY_COVERAGE_ITEM }],
      }));
    };
    const removeCoverageRow = (idx) => {
      const next = coverageRows.filter((_, i) => i !== idx);
      setDraft((p) => ({ ...p, coverageItems: next.length ? next : [{ ...EMPTY_COVERAGE_ITEM }] }));
    };
    return (
      <div className={`lc-policy-detail-form${recognConfirmMode ? ' lc-policy-detail-form--recogn-confirm' : ''}${isEndorsementRecogn ? ' lc-policy-detail-form--suspend-confirm' : ''}`}>
        {isPolicyRecogn && draft._ocrRecognizedPlate && !draft._plateLedgerMatched ? (
          <div className="lc-policy-detail-form-full" style={{ marginBottom: 4 }}>
            <Alert
              type="error"
              showIcon
              message={`识别车牌号 ${draft._ocrRecognizedPlate} 未在台账车辆中，请核对原件或联系采购部`}
              style={{ borderRadius: 8 }}
            />
          </div>
        ) : null}
        {isPolicyRecogn ? (
          <div className="lc-policy-detail-section-title">车辆与主体</div>
        ) : (!recognConfirmMode ? <div className="lc-policy-detail-section-title">车辆与险种</div> : null)}
        {isPolicyRecogn ? renderFilterField('车主', (
          <Input
            value={draft.vehicleOwner}
            onChange={(e) => setDraft((p) => ({ ...p, vehicleOwner: e.target.value }))}
            placeholder="行驶证车主名称"
          />
        )) : null}
        {!isEndorsementRecogn ? renderFilterField(fieldLabel('车牌号', 'plateNo'), (
          recognConfirmMode ? (
            <Select
              showSearch
              allowClear
              placeholder="选择或输入车牌号"
              value={draft.plateNo || undefined}
              options={PLATE_SELECT_OPTIONS}
              filterOption={(input, option) => (option?.label || '').toLowerCase().includes(input.toLowerCase())}
              onChange={(val) => {
                if (onPlateChange) onPlateChange(val);
                else setDraft((p) => ({ ...p, plateNo: val || '' }));
              }}
              style={{ width: '100%' }}
            />
          ) : (
            <Input
              value={draft.plateNo}
              onChange={(e) => setDraft((p) => ({ ...p, plateNo: e.target.value }))}
              placeholder="与 VIN 至少填一项"
            />
          )
        )) : null}
        {!isEndorsementRecogn ? renderFilterField('车辆识别代码', (
          <Input
            value={draft.vin}
            readOnly={recognConfirmMode}
            placeholder={recognConfirmMode ? '根据车牌号自动匹配' : ''}
            onChange={recognConfirmMode ? undefined : (e) => setDraft((p) => ({ ...p, vin: e.target.value }))}
            style={recognConfirmMode ? { background: '#f8fafc', color: '#475569' } : undefined}
          />
        )) : null}
        {isPolicyRecogn ? (
          <>
            {renderFilterField('投保人', (
              <Input
                value={draft.applicant}
                onChange={(e) => setDraft((p) => ({ ...p, applicant: e.target.value }))}
                placeholder="投保人名称"
              />
            ))}
            {renderFilterField('被保险人', (
              <Input
                value={draft.insured}
                onChange={(e) => setDraft((p) => ({ ...p, insured: e.target.value }))}
                placeholder="被保险人名称"
              />
            ))}
          </>
        ) : null}
        {showBizType ? renderFilterField('业务类型', (
          <Select
            value={draft.bizType}
            onChange={(v) => setDraft((p) => ({ ...p, bizType: v }))}
            style={{ width: '100%' }}
            options={POLICY_BIZ_TYPE_OPTIONS}
          />
        )) : null}
        {!recognConfirmMode ? renderFilterField(fieldLabel('险种', 'insuranceType'), (
          <Select
            value={draft.insuranceType}
            onChange={(v) => setDraft((p) => ({ ...p, insuranceType: v }))}
            style={{ width: '100%' }}
            options={QUOTE_INSURANCE_TYPES.map((t) => ({ label: t, value: t }))}
          />
        )) : null}
        {!recognConfirmMode ? <div className="lc-policy-detail-section-title">保单要素</div> : null}
        {isPolicyRecogn ? <div className="lc-policy-detail-section-title">保单要素</div> : null}
        {isEndorsementRecogn ? <div className="lc-policy-detail-section-title">批单要素</div> : null}
        {!isEndorsementRecogn ? renderFilterField(fieldLabel('保险公司', 'company'), (
          <Select
            allowClear
            showSearch
            value={draft.company || undefined}
            onChange={(v) => setDraft((p) => ({ ...p, company: v || '' }))}
            style={{ width: '100%' }}
            placeholder={isPolicyRecogn ? '识别未完全命中时请手动选择' : undefined}
            options={companySelectOptions}
          />
        )) : null}
        {renderFilterField(fieldLabel('保单号', 'policyNo'), (
          <Input value={draft.policyNo} onChange={(e) => setDraft((p) => ({ ...p, policyNo: e.target.value }))} />
        ))}
        {!recognConfirmMode ? renderFilterField('批单号', (
          <Input value={draft.endorsementNo} onChange={(e) => setDraft((p) => ({ ...p, endorsementNo: e.target.value }))} placeholder="停保/复驶/退保批单号" />
        )) : null}
        {!isEndorsementRecogn ? renderFilterField(
          isPolicyRecogn ? fieldLabel('收费确认时间', 'payTime') : fieldLabel('付款时间', 'payTime'),
          (
            <Input
              value={draft.payTime}
              onChange={(e) => setDraft((p) => ({ ...p, payTime: e.target.value }))}
              onBlur={(e) => setDraft((p) => ({ ...p, payTime: normalizeRecognPayTime(e.target.value) }))}
              placeholder="YYYY-MM-DD HH:MM:SS"
            />
          )
        ) : null}
        {!recognConfirmMode ? renderFilterField('签单日期', (
          <DatePicker
            style={{ width: '100%' }}
            value={draft.signDate && moment ? moment(draft.signDate) : null}
            onChange={(_, ds) => setDraft((p) => ({ ...p, signDate: ds || '' }))}
          />
        )) : null}
        {isSuspendRecogn ? (
          <>
            {renderFilterField(fieldLabel('中止时间', 'suspendTime'), (
              <DatePicker
                style={{ width: '100%' }}
                value={draft.suspendTime && moment ? moment(draft.suspendTime) : null}
                onChange={(_, ds) => setDraft((p) => ({
                  ...p,
                  suspendTime: ds || '',
                  startDate: ds || p.startDate,
                }))}
              />
            ))}
            {renderFilterField('恢复时间', (
              <DatePicker
                style={{ width: '100%' }}
                value={draft.resumeTime && moment ? moment(draft.resumeTime) : null}
                onChange={(_, ds) => setDraft((p) => ({
                  ...p,
                  resumeTime: ds || '',
                  reinstateDate: ds || p.reinstateDate,
                }))}
              />
            ))}
            {renderFilterField(fieldLabel('新到期日期', 'newEndDate'), (
              <DatePicker
                style={{ width: '100%' }}
                value={draft.newEndDate && moment ? moment(draft.newEndDate) : null}
                onChange={(_, ds) => setDraft((p) => ({
                  ...p,
                  newEndDate: ds || '',
                  endDate: ds || p.endDate,
                }))}
              />
            ))}
          </>
        ) : isResumeRecogn ? (
          <>
            {renderFilterField(fieldLabel('恢复时间', 'resumeTime'), (
              <DatePicker
                style={{ width: '100%' }}
                value={draft.resumeTime && moment ? moment(draft.resumeTime) : null}
                onChange={(_, ds) => setDraft((p) => ({
                  ...p,
                  resumeTime: ds || '',
                  reinstateDate: ds || p.reinstateDate,
                  startDate: ds || p.startDate,
                }))}
              />
            ))}
            {renderFilterField(fieldLabel('新到期日期', 'newEndDate'), (
              <DatePicker
                style={{ width: '100%' }}
                value={draft.newEndDate && moment ? moment(draft.newEndDate) : null}
                onChange={(_, ds) => setDraft((p) => ({
                  ...p,
                  newEndDate: ds || '',
                  endDate: ds || p.endDate,
                }))}
              />
            ))}
          </>
        ) : isCancelRecogn ? (
          <>
            {renderFilterField(fieldLabel('退保时间', 'cancelTime'), (
              <DatePicker
                style={{ width: '100%' }}
                value={draft.cancelTime && moment ? moment(draft.cancelTime) : null}
                onChange={(_, ds) => setDraft((p) => ({
                  ...p,
                  cancelTime: ds || '',
                  startDate: ds || p.startDate,
                  endDate: ds || p.endDate,
                }))}
              />
            ))}
            {renderFilterField(fieldLabel('退保金额', 'premium'), (
              <Input
                value={draft.premium}
                onChange={(e) => setDraft((p) => ({ ...p, premium: sanitizePremiumInput(e.target.value) }))}
                onBlur={(e) => setDraft((p) => ({ ...p, premium: normalizeRecognPremiumAmount(e.target.value) }))}
                placeholder="0.00"
              />
            ))}
          </>
        ) : (
          <>
            {renderFilterField(fieldLabel('生效日期', 'startDate'), (
              <DatePicker
                style={{ width: '100%' }}
                value={draft.startDate && moment ? moment(draft.startDate) : null}
                onChange={(_, ds) => setDraft((p) => ({ ...p, startDate: ds || '' }))}
              />
            ))}
            {renderFilterField(fieldLabel('到期日期', 'endDate'), (
              <DatePicker
                style={{ width: '100%' }}
                value={draft.endDate && moment ? moment(draft.endDate) : null}
                onChange={(_, ds) => setDraft((p) => ({ ...p, endDate: ds || '' }))}
              />
            ))}
          </>
        )}
        {!recognConfirmMode && (draft.bizType === 'suspend' || draft.bizType === 'resume') ? renderFilterField('复驶日期', (
          <DatePicker
            style={{ width: '100%' }}
            value={draft.reinstateDate && moment ? moment(draft.reinstateDate) : null}
            onChange={(_, ds) => setDraft((p) => ({ ...p, reinstateDate: ds || '' }))}
          />
        )) : null}
        {!isEndorsementRecogn ? renderFilterField(
          recognConfirmMode || policyEntryMode
            ? fieldLabel('保险费合计', 'premium')
            : (draft.bizType === 'cancel' ? '退费金额(元)' : '保险费合计'),
          (
            <Input
              value={draft.premium}
              onChange={(e) => setDraft((p) => ({ ...p, premium: sanitizePremiumInput(e.target.value) }))}
              onBlur={(e) => setDraft((p) => ({ ...p, premium: normalizeRecognPremiumAmount(e.target.value) }))}
              placeholder="0.00"
            />
          )
        ) : null}
        {!recognConfirmMode && !isPolicyRecogn ? renderFilterField('投保人', (
          <Input value={draft.applicant} onChange={(e) => setDraft((p) => ({ ...p, applicant: e.target.value }))} />
        )) : null}
        {!recognConfirmMode && !isPolicyRecogn ? renderFilterField('被保险人', (
          <Input value={draft.insured} onChange={(e) => setDraft((p) => ({ ...p, insured: e.target.value }))} />
        )) : null}
        {!isEndorsementRecogn && !isPolicyRecogn ? (
        <div className={`lc-policy-detail-form-full lc-coverage-items-table-section${recognConfirmMode ? ' lc-coverage-items-table-section--confirm' : ''}`}>
          {!recognConfirmMode ? (
            <div className="lc-policy-detail-section-title" style={{ marginBottom: 8 }}>保单项目/责任限额</div>
          ) : null}
          <div className="lc-coverage-items-table-wrap">
            <Table
              className="lc-coverage-items-table"
              size="small"
              bordered
              pagination={false}
              rowKey={(_, idx) => `cov-row-${idx}`}
              dataSource={coverageRows}
              scroll={{ x: recognConfirmMode ? 600 : 720 }}
              locale={{ emptyText: '暂无承保险种数据' }}
              columns={[
                {
                  title: '承保险种',
                  dataIndex: 'coverageName',
                  width: recognConfirmMode ? 140 : 160,
                  render: (val, _row, idx) => (
                    <Input
                      size="small"
                      value={val}
                      onChange={(e) => updateCoverageField(idx, 'coverageName', e.target.value)}
                      placeholder="如：机动车损失险"
                    />
                  ),
                },
                {
                  title: '保险金额',
                  dataIndex: 'coverageAmount',
                  width: recognConfirmMode ? 120 : 140,
                  render: (val, _row, idx) => (
                    <Input
                      size="small"
                      value={val}
                      onChange={(e) => updateCoverageField(idx, 'coverageAmount', e.target.value)}
                      placeholder="如：2000000元"
                    />
                  ),
                },
                {
                  title: '保险金额/责任免额',
                  dataIndex: 'deductible',
                  width: recognConfirmMode ? 140 : 160,
                  render: (val, _row, idx) => (
                    <Input
                      size="small"
                      value={val}
                      onChange={(e) => updateCoverageField(idx, 'deductible', e.target.value)}
                      placeholder="如：绝对免赔额500元"
                    />
                  ),
                },
                {
                  title: '保险费',
                  dataIndex: 'itemPremium',
                  width: recognConfirmMode ? 96 : 110,
                  render: (val, _row, idx) => (
                    <Input
                      size="small"
                      value={val}
                      onChange={(e) => updateCoverageField(idx, 'itemPremium', e.target.value)}
                      placeholder="0.00"
                    />
                  ),
                },
                {
                  title: '操作',
                  key: 'action',
                  width: 64,
                  fixed: 'right',
                  render: (_val, _row, idx) => (
                    <Button
                      type="link"
                      size="small"
                      danger
                      style={{ padding: 0 }}
                      disabled={coverageRows.length <= 1}
                      onClick={() => removeCoverageRow(idx)}
                    >
                      删除
                    </Button>
                  ),
                },
              ]}
            />
          </div>
          <Button type="dashed" block className="lc-coverage-items-add" onClick={addCoverageRow}>
            + 新增项目
          </Button>
          {!recognConfirmMode ? (
            <div style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.5, marginTop: 6 }}>
              按承保险种分行维护保额、免赔额与分项保险费；上方「保险费合计」为整单合计金额
            </div>
          ) : (
            <div style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.5, marginTop: 6 }}>
              识别结果已自动反写，可按需修改；上方「保险费合计」为整单合计金额
            </div>
          )}
        </div>
        ) : isSuspendRecogn ? (
          <div style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.5, marginTop: 4 }}>
            停保批单核对保单号、中止时间、恢复时间与新到期日期；台账匹配依据保单号，「新到期日期」确认后将写入该保单到期日期
          </div>
        ) : isResumeRecogn ? (
          <div style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.5, marginTop: 4 }}>
            复驶批单核对保单号、恢复时间与新到期日期；台账匹配依据保单号，「新到期日期」确认后将写入该保单到期日期
          </div>
        ) : isCancelRecogn ? (
          <div style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.5, marginTop: 4 }}>
            退保批单核对保单号、退保时间与退保金额；台账匹配依据保单号，确认后将标记该保单为已退保
          </div>
        ) : null}
      </div>
    );
  };

  const confirmPolicyRecognResult = (resultId, detailOverride) => {
    const baseResults = persistActiveRecognDraft();
    const result = baseResults.find((r) => r.id === resultId);
    if (!result) return;
    const detail = detailOverride || (
      resultId === policyRecognActiveResultId
        ? policyRecognConfirmDraft
        : buildPolicyRecognConfirmDraft(result, policyRecognMode)
    );
    const confirmMode = resolvePolicyRecognEffectiveMode(policyRecognMode, result);
    if (!validatePolicyRecognDetailForConfirm(detail, { mode: confirmMode, recognResult: result })) return;
    const merged = mergeRecognResultWithDetail(result, detail);
    if (!merged.matched) {
      const warnMode = resolvePolicyRecognEffectiveMode(policyRecognMode, merged);
      message.warning(
        warnMode === 'suspend' || warnMode === 'resume' || warnMode === 'cancel'
          ? '该条未匹配台账，请检查保单号是否正确'
          : '该条未匹配台账，请检查车牌号是否正确'
      );
      return;
    }
    if (merged.confirmed) {
      message.info('该条已确认');
      return;
    }
    const mode = resolvePolicyRecognEffectiveMode(policyRecognMode, merged);
    updateAllInsurance(applyPolicyOcrResultToLedger(merged, mode));
    const nextResults = baseResults.map((r) => (
      r.id === resultId ? { ...merged, confirmed: true } : r
    ));
    setPolicyRecognResults(nextResults);
    if (derivePolicyRecognTaskStatus(nextResults) === 'completed') {
      setPolicyRecognViewOnly(true);
    }
    if (policyRecognTaskId) {
      upsertPolicyRecognTask({
        taskId: policyRecognTaskId,
        entry: policyRecognEntry,
        mode: policyRecognMode,
        insuranceType: policyRecognInsuranceType,
        results: nextResults,
        phase: 'results',
        completedAt: derivePolicyRecognTaskStatus(nextResults) === 'completed' ? formatCompareSheetNow() : undefined,
      });
    }
    message.success(`已确认 ${merged.displayPlate || merged.ocrVin}，台账已更新`);
  };

  const confirmCurrentPolicyRecognResult = () => {
    if (!policyRecognActiveResultId) {
      message.warning('请先选择要确认的识别记录');
      return;
    }
    confirmPolicyRecognResult(policyRecognActiveResultId, policyRecognConfirmDraft);
  };

  const confirmAllPolicyRecognResults = () => {
    const synced = persistActiveRecognDraft();
    setPolicyRecognResults(synced);
    const pending = synced.filter((r) => r.matched && !r.confirmed);
    if (!pending.length) {
      message.info('没有可批量确认的记录');
      return;
    }
    let nextInsurance = { ...allInsurance };
    const invalid = pending.find((result) => {
      const detail = result.id === policyRecognActiveResultId
        ? policyRecognConfirmDraft
        : buildPolicyRecognConfirmDraft(result, policyRecognMode);
      const mode = resolvePolicyRecognEffectiveMode(policyRecognMode, result);
      return !validatePolicyRecognDetailForConfirm(detail, { mode, silent: true, recognResult: result });
    });
    if (invalid) {
      message.warning('批量确认前请确保每条记录必填项均已填写，可先逐条确认');
      return;
    }
    pending.forEach((result) => {
      const detail = result.id === policyRecognActiveResultId
        ? policyRecognConfirmDraft
        : buildPolicyRecognConfirmDraft(result, policyRecognMode);
      const merged = mergeRecognResultWithDetail(result, detail);
      const mode = resolvePolicyRecognEffectiveMode(policyRecognMode, merged);
      nextInsurance = applyPolicyOcrResultToLedger(merged, mode)(nextInsurance);
    });
    updateAllInsurance(() => nextInsurance);
    const nextResults = policyRecognResults.map((r) => (
      r.matched ? { ...r, confirmed: true } : r
    ));
    setPolicyRecognResults(nextResults);
    const allDone = derivePolicyRecognTaskStatus(nextResults) === 'completed';
    if (allDone) setPolicyRecognViewOnly(true);
    if (policyRecognTaskId) {
      upsertPolicyRecognTask({
        taskId: policyRecognTaskId,
        entry: policyRecognEntry,
        mode: policyRecognMode,
        insuranceType: policyRecognInsuranceType,
        results: nextResults,
        phase: 'results',
        completedAt: allDone ? formatCompareSheetNow() : undefined,
      });
    }
    message.success(`已批量确认 ${pending.length} 条，台账到期日期已更新`);
  };

  const policyRecognActiveResult = useMemo(
    () => policyRecognResults.find((r) => r.id === policyRecognActiveResultId) || null,
    [policyRecognResults, policyRecognActiveResultId]
  );

  const activePolicyRecognMode = useMemo(
    () => resolvePolicyRecognEffectiveMode(policyRecognMode, policyRecognActiveResult),
    [policyRecognMode, policyRecognActiveResult]
  );

  const policyRecognPickerColumns = useMemo(() => ([
    {
      title: '文件/记录',
      dataIndex: 'fileName',
      width: 160,
      ellipsis: true,
    },
    {
      title: '车牌号',
      key: 'plate',
      width: 100,
      render: (_, r) => r.displayPlate || r.ocrPlateNo || '—',
    },
    {
      title: '险种',
      dataIndex: 'insuranceTypeLabel',
      width: 72,
    },
    {
      title: '匹配',
      key: 'matched',
      width: 80,
      render: (_, r) => (
        <Tag color={r.matched ? 'success' : 'error'} style={{ margin: 0, fontSize: 11 }}>
          {r.matched ? '已匹配' : '未匹配'}
        </Tag>
      ),
    },
    {
      title: '状态',
      key: 'confirmed',
      width: 80,
      render: (_, r) => (
        r.confirmed ? <Tag color="blue" style={{ margin: 0 }}>已确认</Tag> : <Tag style={{ margin: 0 }}>待确认</Tag>
      ),
    },
  ]), []);

  const handlePolicyAddAttachmentChange = ({ fileList }) => {
    const incoming = fileList.filter((f) => f.status !== 'removed');
    const valid = incoming.filter((f) => isPolicyRecognImageOrPdf(f));
    if (valid.length < incoming.length) {
      message.warning('已忽略不支持格式，保单附件仅支持 PDF / 图片');
    }
    setPolicyAddAttachmentFileList(
      valid.map((f) => ({
        ...f,
        status: 'done',
        uploadedAt: f.uploadedAt || formatCompareSheetNow(),
      }))
    );
  };

  const handlePolicyAddSubmit = () => {
    const attachments = uploadFileListToAttachments(policyAddAttachmentFileList);
    const detail = normalizePolicyDetail({
      ...policyAddDraft,
      bizType: 'policy',
      attachments,
    });
    if (!validatePolicyEntryDetail(detail).ok) return;
    const ledgerKey = resolvePolicyVehicleKey(detail.plateNo || detail.vin);
    if (!ledgerKey) {
      message.warning('请填写台账中存在的车牌或 VIN');
      return;
    }
    const typeKey = INSURANCE_LABEL_TO_KEY[detail.insuranceType];
    if (!typeKey) {
      message.warning('险种填写有误');
      return;
    }
    updateAllInsurance((prev) => {
      const record = ensureInsuranceRecordShape(prev[ledgerKey] || createEmptyInsuranceRecord());
      const existing = record[typeKey] || createEmptyInsuranceItem();
      let baseItem = { ...existing };
      let logs = existing.operationLogs || [];
      if (existing.policyTag === 'cancelled' && existing.policyNo) {
        baseItem = {
          ...createEmptyInsuranceItem(),
          archivedPolicies: [...(existing.archivedPolicies || []), { ...existing }],
        };
        logs = [];
      }
      const item = applyPolicyDetailToInsuranceItem(
        baseItem,
        { ...detail, policyNo: detail.policyNo || `MAN-${Date.now().toString().slice(-6)}` },
        'policy'
      );
      item.updateTime = formatCompareSheetNow();
      item.updateUser = PROTO_COMPARE_CREATOR;
      item.operationLogs = appendInsuranceOperationLog(logs, {
        type: 'add',
        remark: buildOperationChangeRemark([
          { label: '保单号', before: existing.policyNo, after: item.policyNo },
          { label: '保险公司', before: existing.company, after: item.company },
          { label: '到期日期', before: existing.endDate, after: item.endDate },
        ]),
      });
      return { ...prev, [ledgerKey]: { ...record, [typeKey]: item } };
    });
    message.success('保单已录入台账');
    setPolicyAddOpen(false);
    setPolicyAddDraft({ ...EMPTY_POLICY_DETAIL });
    setPolicyAddAttachmentFileList([]);
  };

  const renderPolicyStatusTag = (item) => {
    if (!item?.policyTag) return null;
    if (item.policyTag === 'suspended') {
      return (
        <Tooltip title={renderSuspendTooltipTitle(item)}>
          <Tag color="warning" className="lc-list-policy-tag" style={{ margin: 0, fontSize: 10, fontWeight: 600 }}>已停保</Tag>
        </Tooltip>
      );
    }
    if (item.policyTag === 'cancelled') {
      return (
        <Tag color="default" className="lc-list-policy-tag" style={{ margin: 0, fontSize: 10, fontWeight: 600 }}>已退保</Tag>
      );
    }
    return null;
  };

  const renderDateCell = (rowId, field, value) => (
    <DatePicker
      size="small"
      className="lc-compare-cell-input"
      value={value && moment ? moment(value) : null}
      onChange={(_, ds) => updateCompareRow(rowId, { [field]: ds || '' })}
      placeholder="选择日期"
      style={{ width: '100%' }}
    />
  );

  const renderQuoteAddPopover = (row) => (
    <Popover
      trigger="click"
      placement="leftTop"
      overlayClassName="lc-quote-popover-overlay"
      open={quoteEditRowId === row.id}
      onOpenChange={(open) => {
        setQuoteEditRowId(open ? row.id : null);
        if (!open) setQuoteDraft(createEmptyQuoteDraft());
      }}
      content={(
        <div className="lc-quote-card">
          <div className="lc-quote-card-head">
            <span className="lc-quote-card-title">添加报价</span>
            <span className="lc-quote-card-type-badge">{row.insuranceType || '交强险'}</span>
          </div>
          <div className="lc-quote-card-body" style={{ maxHeight: 'none' }}>
            <div className="lc-quote-form-field">
              <label className="lc-quote-form-label lc-quote-form-label-required">保险公司</label>
              <Select
                size="small"
                placeholder="请选择保险公司"
                showSearch
                allowClear
                value={quoteDraft.company}
                onChange={(val) => setQuoteDraft((d) => ({ ...d, company: val }))}
                options={INSURANCE_MGMT_COMPANIES.map((c) => ({ label: c, value: c }))}
                filterOption={(input, option) => (option?.label || '').toLowerCase().includes(input.toLowerCase())}
                style={{ width: '100%' }}
              />
            </div>
            <div className="lc-quote-form-field">
              <label className="lc-quote-form-label lc-quote-form-label-required">报价（元）</label>
              <Input
                size="small"
                placeholder="0.00"
                value={quoteDraft.premium}
                onChange={(e) => setQuoteDraft((d) => ({ ...d, premium: sanitizePremiumInput(e.target.value) }))}
                onBlur={() => {
                  if (quoteDraft.premium && isValidPremium(quoteDraft.premium)) {
                    setQuoteDraft((d) => ({ ...d, premium: formatPremiumDisplay(d.premium) }));
                  }
                }}
              />
            </div>
            <div className="lc-quote-form-actions">
              <Button size="small" type="primary" onClick={() => handleAddQuote(row.id, row.insuranceType)}>确认添加</Button>
            </div>
          </div>
        </div>
      )}
    >
      <Button type="link" size="small" className="lc-compare-quote-add">+ 添加报价</Button>
    </Popover>
  );

  const renderQuoteCell = (row) => {
    const quotes = row.quotes || [];
    return (
      <div className="lc-compare-quote-cell">
        {quotes.length > 0 ? (
          <Radio.Group
            value={row.confirmedQuoteId || undefined}
            onChange={(e) => updateCompareRow(row.id, { confirmedQuoteId: e.target.value })}
            className="lc-compare-quote-inline-list"
          >
            {quotes.map((q) => {
              const selected = row.confirmedQuoteId === q.id;
              return (
                <label
                  key={q.id}
                  className={`lc-compare-quote-inline-item${selected ? ' is-selected' : ''}`}
                  title={`${q.company} · ${q.premium} 元`}
                >
                  <Radio value={q.id} />
                  <span className="lc-compare-quote-inline-company">{shortInsuranceCompanyName(q.company)}</span>
                  <span className="lc-compare-quote-inline-price">{q.premium}元</span>
                  <Button
                    type="link"
                    size="small"
                    className="lc-compare-quote-inline-del"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleRemoveQuote(row.id, q.id);
                    }}
                  >
                    ×
                  </Button>
                </label>
              );
            })}
          </Radio.Group>
        ) : (
          <span className="lc-compare-quote-empty-hint" style={{ color: '#ef4444' }}>暂无报价（必填）</span>
        )}
        {renderQuoteAddPopover(row)}
      </div>
    );
  };

  const compareColumns = [
    {
      title: '车牌号',
      dataIndex: 'plateNo',
      width: 118,
      fixed: 'left',
      onHeaderCell: () => ({ className: 'lc-compare-th-key' }),
      render: (val, row) => (
        <Select
          size="small"
          className="lc-compare-cell-select"
          placeholder="选择车牌"
          allowClear
          showSearch
          value={val || undefined}
          options={PLATE_SELECT_OPTIONS}
          filterOption={(input, option) => (option?.label || '').toLowerCase().includes(input.toLowerCase())}
          onChange={(v) => handleComparePlateChange(row.id, v)}
        />
      ),
    },
    {
      title: '车辆识别代码',
      dataIndex: 'vin',
      width: 168,
      fixed: 'left',
      onHeaderCell: () => ({ className: 'lc-compare-th-key' }),
      render: (val, row) => (
        <Tooltip title={row.plateNo ? '已选车牌，VIN 自动带出' : '未选车牌时可通过 VIN 定位车辆'}>
          <Select
            size="small"
            className="lc-compare-cell-select"
            placeholder={row.plateNo ? '已关联' : '选择 VIN'}
            allowClear={!row.plateNo}
            showSearch
            disabled={!!row.plateNo}
            value={val || undefined}
            options={VIN_SELECT_OPTIONS}
            filterOption={(input, option) => (option?.label || '').toLowerCase().includes(input.toLowerCase())}
            onChange={(v) => handleCompareVinChange(row.id, v)}
          />
        </Tooltip>
      ),
    },
    {
      title: '客户',
      dataIndex: 'customer',
      width: 128,
      onHeaderCell: () => ({ className: 'lc-compare-th-auto' }),
      render: (val, row) => renderReadonlyField(val, isCompareRowVehicleLinked(row)),
    },
    {
      title: '归属公司',
      dataIndex: 'ownerCompany',
      width: 148,
      onHeaderCell: () => ({ className: 'lc-compare-th-auto' }),
      render: (val, row) => renderReadonlyField(val, isCompareRowVehicleLinked(row)),
    },
    {
      title: '品牌',
      dataIndex: 'brand',
      width: 80,
      onHeaderCell: () => ({ className: 'lc-compare-th-auto' }),
      render: (val, row) => renderReadonlyField(val, isCompareRowVehicleLinked(row)),
    },
    {
      title: '型号',
      dataIndex: 'model',
      width: 120,
      onHeaderCell: () => ({ className: 'lc-compare-th-auto' }),
      render: (val, row) => renderReadonlyField(val, isCompareRowVehicleLinked(row)),
    },
    {
      title: '车身颜色',
      dataIndex: 'bodyColor',
      width: 80,
      onHeaderCell: () => ({ className: 'lc-compare-th-auto' }),
      render: (val, row) => renderReadonlyField(val, isCompareRowVehicleLinked(row)),
    },
    {
      title: '行驶证注册日期',
      dataIndex: 'regDate',
      width: 118,
      onHeaderCell: () => ({ className: 'lc-compare-th-auto' }),
      render: (val, row) => renderReadonlyDate(val, isCompareRowVehicleLinked(row)),
    },
    {
      title: '年检有效期',
      dataIndex: 'inspectExpire',
      width: 108,
      onHeaderCell: () => ({ className: 'lc-compare-th-auto' }),
      render: (val, row) => renderReadonlyDate(val, isCompareRowVehicleLinked(row)),
    },
    {
      title: '投保方式',
      dataIndex: 'insureMode',
      width: 96,
      onHeaderCell: () => ({ className: 'lc-compare-th-edit' }),
      render: (val, row) => (
        <Select
          size="small"
          className="lc-compare-cell-select"
          value={val}
          onChange={(v) => updateCompareRow(row.id, { insureMode: v })}
          options={[{ label: '新保', value: '新保' }, { label: '续保', value: '续保' }]}
        />
      ),
    },
    {
      title: (
        <Dropdown
          trigger={['click']}
          menu={{
            items: QUOTE_INSURANCE_TYPES.map((t) => ({
              key: t,
              label: `批量设为${t}`,
            })),
            onClick: ({ key }) => handleBatchSetCompareInsuranceType(key),
          }}
        >
          <span className="lc-compare-th-batch-trigger" onClick={(e) => e.stopPropagation()}>
            <span>保险类型</span>
            <span className="lc-compare-th-batch-tag">批量</span>
          </span>
        </Dropdown>
      ),
      dataIndex: 'insuranceType',
      width: 108,
      onHeaderCell: () => ({ className: 'lc-compare-th-edit' }),
      render: (val, row) => (
        <Select
          size="small"
          className="lc-compare-cell-select"
          value={val || '交强险'}
          onChange={(v) => updateCompareRow(row.id, {
            insuranceType: v,
            quotes: [],
            confirmedQuoteId: '',
          })}
          options={QUOTE_INSURANCE_TYPES.map((t) => ({ label: t, value: t }))}
        />
      ),
    },
    {
      title: '交强险到期日期',
      dataIndex: 'jqValidUntil',
      width: 108,
      onHeaderCell: () => ({ className: 'lc-compare-th-auto' }),
      render: (val, row) => renderReadonlyDate(val, isCompareRowVehicleLinked(row)),
    },
    {
      title: '商业险到期日期',
      dataIndex: 'syValidUntil',
      width: 108,
      onHeaderCell: () => ({ className: 'lc-compare-th-auto' }),
      render: (val, row) => renderReadonlyDate(val, isCompareRowVehicleLinked(row)),
    },
    {
      title: '最晚付费日期',
      dataIndex: 'latestPayDate',
      width: 128,
      onHeaderCell: () => ({ className: 'lc-compare-th-edit' }),
      render: (val, row) => {
        const paySt = getLatestPayDateStatus(val);
        return (
          <div>
            {renderDateCell(row.id, 'latestPayDate', val)}
            {val ? (
              <div style={{ marginTop: 4 }}>
                <Tag
                  color={paySt.type === 'overdue' ? 'error' : paySt.type === 'warning' ? 'warning' : 'success'}
                  style={{ margin: 0, fontSize: 10, fontWeight: 600 }}
                >
                  {paySt.type === 'overdue' ? `超期${Math.abs(paySt.diffDays)}天` : paySt.type === 'warning' ? `临期${paySt.diffDays}天` : `剩余${paySt.diffDays}天`}
                </Tag>
              </div>
            ) : null}
          </div>
        );
      },
    },
    {
      title: '采购状态',
      dataIndex: 'procurementStatus',
      width: 92,
      fixed: 'right',
      onHeaderCell: () => ({ className: 'lc-compare-th-auto' }),
      render: (st) => renderCompareProcurementStatusTag(st),
    },
    {
      title: '当前审批人',
      dataIndex: 'procurementCurrentApprover',
      width: 96,
      fixed: 'right',
      onHeaderCell: () => ({ className: 'lc-compare-th-auto' }),
      render: (val, row) => {
        if (normalizeCompareProcurementStatus(row.procurementStatus) !== 'submitted') {
          return <span style={{ color: '#94a3b8' }}>—</span>;
        }
        if (!val) {
          return (
            <Tooltip title="由工作流自动回写，非必填">
              <span style={{ color: '#94a3b8', fontSize: 12 }}>—</span>
            </Tooltip>
          );
        }
        return <span style={{ fontSize: 12, color: '#334155', fontWeight: 600 }}>{val}</span>;
      },
    },
    {
      title: (
        <span>
          报价情况
          <span style={{ color: '#ef4444', marginLeft: 2 }} aria-hidden>*</span>
        </span>
      ),
      key: 'quotes',
      width: 240,
      fixed: 'right',
      onHeaderCell: () => ({ className: 'lc-compare-th-edit' }),
      render: (_, row) => renderQuoteCell(row),
    },
    {
      title: '操作',
      key: 'action',
      width: 96,
      fixed: 'right',
      onHeaderCell: () => ({ className: 'lc-compare-th-edit' }),
      render: (_, row) => (
        <div className="lc-compare-action-cell">
          <Popover
            trigger="click"
            open={copyPopoverRowId === row.id}
            onOpenChange={(open) => {
              setCopyPopoverRowId(open ? row.id : null);
              if (!open) setCopyCountDraft(1);
            }}
            content={(
              <div className="lc-copy-pop">
                <div style={{ fontSize: 12, color: '#64748b', marginBottom: 8 }}>复制条数</div>
                <InputNumber min={1} max={50} value={copyCountDraft} onChange={(v) => setCopyCountDraft(v || 1)} style={{ width: '100%' }} />
                <div className="lc-copy-pop-actions">
                  <Button size="small" onClick={() => setCopyPopoverRowId(null)}>取消</Button>
                  <Button size="small" type="primary" onClick={() => handleCopyCompareRow(row, copyCountDraft)}>确认</Button>
                </div>
              </div>
            )}
          >
            <Button type="link" size="small">复制</Button>
          </Popover>
          <Button type="link" size="small" danger onClick={() => handleDeleteCompareRow(row.id)}>删除</Button>
        </div>
      ),
    },
  ];

  const getInsuranceItemStatus = (ledgerKey, typeKey) => {
    const item = allInsurance[ledgerKey]?.[typeKey];
    if (item?.policyTag === 'cancelled') {
      return { type: 'unuploaded', text: '已退保', diffDays: null };
    }
    if (!item || !item.policyNo) {
      return { type: 'unuploaded', text: '未购买', diffDays: null };
    }
    if (!item.endDate) {
      if (item.policyTag === 'suspended') {
        return { type: 'warning', text: '已停保', diffDays: null };
      }
      return { type: 'unuploaded', text: '未购买', diffDays: null };
    }
    const today = new Date(ANCHOR_TODAY);
    today.setHours(0, 0, 0, 0);
    const expDate = new Date(item.endDate);
    expDate.setHours(0, 0, 0, 0);
    const diffDays = Math.ceil((expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays <= 0) {
      return { type: 'expired', text: `已到期 (逾期 ${Math.abs(diffDays)} 天)`, diffDays };
    }
    if (diffDays <= INSURANCE_WARN_DAYS) {
      return { type: 'warning', text: `临期 (${diffDays} 天后)`, diffDays };
    }
    return { type: 'success', text: '正常', diffDays };
  };

  /** 与车辆管理「保险状态」一致：交强险 + 商业险均存在且在有效期内（临期仍算有效） */
  const getVehicleInsuranceStatus = (ledgerKey) => {
    const jq = getInsuranceItemStatus(ledgerKey, 'compulsory');
    const sy = getInsuranceItemStatus(ledgerKey, 'commercial');
    const isValid = (st) => st.type === 'success' || st.type === 'warning';
    const isNormal = isValid(jq) && isValid(sy);
    if (isNormal) {
      const hasWarning = jq.type === 'warning' || sy.type === 'warning';
      return {
        label: hasWarning ? '临期' : '正常',
        color: hasWarning ? 'warning' : 'success',
        abnormal: false,
        tip: hasWarning
          ? '交强险或商业险临期，仍在有效期内，可交车但需尽快续保'
          : '交强险、商业险均在有效期内',
      };
    }
    const reasons = [];
    if (jq.type === 'unuploaded') reasons.push('交强险未购买');
    else if (jq.type === 'expired') reasons.push('交强险已到期');
    if (sy.type === 'unuploaded') reasons.push('商业险未购买');
    else if (sy.type === 'expired') reasons.push('商业险已到期');
    return {
      label: '异常',
      color: 'error',
      abnormal: true,
      tip: `${reasons.join('；')}。保险状态异常的车辆禁止交车`,
    };
  };

  const isCoreInsuranceNormal = (ledgerKey) => !getVehicleInsuranceStatus(ledgerKey).abnormal;

  const isAnyInsuranceWarning = (ledgerKey) => (
    INSURANCE_TYPE_ITEMS.some((item) => getInsuranceItemStatus(ledgerKey, item.key).type === 'warning')
  );

  const isCoreInsuranceExpired = (ledgerKey) => (
    CORE_INSURANCE_KEYS.some((key) => getInsuranceItemStatus(ledgerKey, key).type === 'expired')
  );

  const isCoreInsuranceMissing = (ledgerKey) => (
    CORE_INSURANCE_KEYS.some((key) => getInsuranceItemStatus(ledgerKey, key).type === 'unuploaded')
  );

  const matchKpiFilter = (ledgerKey, filterKey) => {
    if (filterKey === 'total') return true;
    if (filterKey === 'normal') return isCoreInsuranceNormal(ledgerKey);
    if (filterKey === 'warning') return isAnyInsuranceWarning(ledgerKey);
    if (filterKey === 'expired') return isCoreInsuranceExpired(ledgerKey);
    if (filterKey === 'unuploaded') return isCoreInsuranceMissing(ledgerKey);
    return true;
  };

  const stats = useMemo(() => {
    let normal = 0;
    let warning = 0;
    let expired = 0;
    let unuploaded = 0;
    MOCK_VEHICLES.forEach((v) => {
      const ledgerKey = getVehicleLedgerKey(v);
      if (isCoreInsuranceNormal(ledgerKey)) normal += 1;
      if (isAnyInsuranceWarning(ledgerKey)) warning += 1;
      if (isCoreInsuranceExpired(ledgerKey)) expired += 1;
      if (isCoreInsuranceMissing(ledgerKey)) unuploaded += 1;
    });
    return { total: MOCK_VEHICLES.length, normal, warning, expired, unuploaded };
  }, [allInsurance]);

  const activeCompareSubmissionSet = useMemo(
    () => buildActiveCompareSubmissionSet(compareSheets),
    [compareSheets]
  );

  const compareProcurementStatusByVehicleType = useMemo(
    () => buildCompareProcurementStatusByVehicleType(compareSheets),
    [compareSheets]
  );

  const openInsuranceAlertModal = (mode) => {
    setInsuranceAlertMode(mode);
    setInsuranceAlertTypeFilter(
      mode === 'coreExpired' ? [...CORE_INSURANCE_KEYS] : [...EXPIRING_WARN_TYPE_KEYS]
    );
    setInsuranceAlertSort({ key: 'commercial', order: 'descend' });
    setInsuranceAlertOpen(true);
  };

  const insuranceAlertBaseList = useMemo(() => {
    const selectedKeys = insuranceAlertTypeFilter || [];
    if (!selectedKeys.length) return [];
    return MOCK_VEHICLES.filter((vehicle) => {
      const ledgerKey = getVehicleLedgerKey(vehicle);
      if (insuranceAlertMode === 'coreExpired') {
        if (!isCoreInsuranceExpired(ledgerKey)) return false;
        return selectedKeys.some((typeKey) => getInsuranceItemStatus(ledgerKey, typeKey).type === 'expired');
      }
      return selectedKeys.some((typeKey) => {
        const st = getInsuranceItemStatus(ledgerKey, typeKey).type;
        return st === 'warning' || st === 'expired';
      });
    });
  }, [allInsurance, insuranceAlertTypeFilter, insuranceAlertMode]);

  const insuranceAlertSortedList = useMemo(() => {
    const list = [...insuranceAlertBaseList];
    const sortKey = insuranceAlertSort.key || 'commercial';
    const sortOrder = insuranceAlertSort.order || 'descend';
    list.sort((a, b) => {
      const av = getVehicleInsuranceEndDate(getVehicleLedgerKey(a), sortKey, allInsurance);
      const bv = getVehicleInsuranceEndDate(getVehicleLedgerKey(b), sortKey, allInsurance);
      return compareInsuranceEndDate(av, bv, sortOrder);
    });
    return list;
  }, [insuranceAlertBaseList, insuranceAlertSort, allInsurance]);

  const handleInsuranceAlertTableChange = (_pagination, _filters, sorter) => {
    const nextSorter = Array.isArray(sorter) ? sorter[0] : sorter;
    if (!nextSorter || !nextSorter.columnKey) return;
    setInsuranceAlertSort({
      key: nextSorter.columnKey,
      order: nextSorter.order || 'descend',
    });
  };

  const renderInsuranceAlertDateCell = (record, typeKey) => {
    const ledgerKey = getVehicleLedgerKey(record);
    const dateVal = getVehicleInsuranceEndDate(ledgerKey, typeKey, allInsurance);
    const status = getInsuranceItemStatus(ledgerKey, typeKey);
    const isWarn = status.type === 'warning';
    const isExpired = status.type === 'expired';
    const typeLabel = INSURANCE_KEY_TO_LABEL[typeKey];
    const procurementSt = getCompareProcurementStatusForVehicleType(
      record,
      typeLabel,
      compareProcurementStatusByVehicleType
    );
    return (
      <div>
        <span style={{
          color: isExpired ? '#dc2626' : (isWarn ? '#c2410c' : (dateVal ? '#334155' : '#94a3b8')),
          fontWeight: isWarn || isExpired ? 600 : 400,
        }}
        >
          {dateVal || '—'}
        </span>
        {procurementSt && (isWarn || isExpired) ? (
          <div style={{ marginTop: 4 }}>
            {renderAlertCompareProcurementTag(procurementSt)}
          </div>
        ) : null}
      </div>
    );
  };

  const insuranceAlertColumns = useMemo(() => {
    const sortOrderFor = (typeKey) => (insuranceAlertSort.key === typeKey ? insuranceAlertSort.order : null);
    const dateCol = (typeKey, title) => ({
      title,
      key: typeKey,
      dataIndex: typeKey,
      width: 136,
      sortOrder: sortOrderFor(typeKey),
      sorter: () => 0,
      sortDirections: ['descend', 'ascend'],
      showSorterTooltip: false,
      render: (_val, record) => renderInsuranceAlertDateCell(record, typeKey),
    });
    return [
      {
        title: '车牌号',
        key: 'plateNo',
        width: 108,
        fixed: 'left',
        render: (_val, record) => (
          <span style={{ fontWeight: 700, color: '#0f172a' }}>{formatVehiclePlateDisplay(record.plateNo)}</span>
        ),
      },
      dateCol('compulsory', '交强险到期日期'),
      dateCol('commercial', '商业险到期日期'),
      dateCol('excess', '超赔险到期日期'),
      dateCol('cargo', '货物险到期日期'),
      dateCol('driverAccident', '驾意险到期日期'),
    ];
  }, [allInsurance, insuranceAlertSort, compareProcurementStatusByVehicleType]);

  const openBatchCompareTypesModal = () => {
    if (!insuranceAlertSortedList.length) {
      message.warning(
        insuranceAlertMode === 'coreExpired'
          ? '当前筛选条件下暂无核心险种逾期记录'
          : '当前筛选条件下暂无临期记录'
      );
      return;
    }
    const defaultLabels = insuranceAlertTypeFilter.map((key) => INSURANCE_KEY_TO_LABEL[key]).filter(Boolean);
    const fallback = insuranceAlertMode === 'coreExpired'
      ? CORE_INSURANCE_KEYS.map((k) => INSURANCE_KEY_TO_LABEL[k])
      : [...QUOTE_INSURANCE_TYPES];
    setBatchCompareTypesDraft(defaultLabels.length ? defaultLabels : fallback);
    setBatchCompareTypesOpen(true);
  };

  const handleConfirmBatchCompareSheets = () => {
    const allowedTypes = insuranceAlertMode === 'coreExpired'
      ? CORE_INSURANCE_KEYS.map((k) => INSURANCE_KEY_TO_LABEL[k])
      : QUOTE_INSURANCE_TYPES;
    const selectedLabels = (batchCompareTypesDraft || []).filter((label) => allowedTypes.includes(label));
    if (!selectedLabels.length) {
      message.warning('请至少选择一种保险类型');
      return;
    }

    const targetStatus = insuranceAlertMode === 'coreExpired' ? 'expired' : 'warning';
    const generatedRows = [];
    let skippedSubmitted = 0;
    selectedLabels.forEach((typeLabel) => {
      const typeKey = INSURANCE_LABEL_TO_KEY[typeLabel];
      insuranceAlertSortedList
        .filter((vehicle) => getInsuranceItemStatus(getVehicleLedgerKey(vehicle), typeKey).type === targetStatus)
        .forEach((vehicle) => {
          if (isVehicleTypeSubmittedToCompare(vehicle, typeLabel, activeCompareSubmissionSet)) {
            skippedSubmitted += 1;
            return;
          }
          const row = buildCompareRowFromVehicle(vehicle, allInsurance);
          row.insuranceType = typeLabel;
          generatedRows.push(row);
        });
    });

    if (!generatedRows.length) {
      message.warning(
        skippedSubmitted
          ? '所选险种均已提交比价单或无可生成记录，未生成购买记录'
          : (insuranceAlertMode === 'coreExpired'
            ? '所选险种在当前列表中无逾期车辆，未生成购买记录'
            : '所选险种在当前列表中无临期车辆，未生成购买记录')
      );
      return;
    }

    setEditingCompareSheetId(null);
    setCompareRows(normalizeCompareRows(generatedRows));
    setCompareRemark(`临期预警一键生成 · ${selectedLabels.join('、')}`);
    setCompareEditorFilters({ ...DEFAULT_COMPARE_EDITOR_FILTERS });
    setCompareVehicleFilterOpen(false);
    setCompareVehicleFilterDraft('');
    setCompareAttachmentFileList([]);
    setSelectedCompareKeys([]);
    setQuoteDraft(createEmptyQuoteDraft());
    setQuoteEditRowId(null);
    setBatchCompareTypesOpen(false);
    setInsuranceAlertOpen(false);
    setCompareModalOpen(true);
    const skipHint = skippedSubmitted ? `，已跳过 ${skippedSubmitted} 条已提交比价单记录` : '';
    message.success(`已带入 ${generatedRows.length} 条购买记录至新建比价单${skipHint}，请继续维护报价后保存`);
  };

  const brandOptions = useMemo(
    () => [...new Set(MOCK_VEHICLES.map((v) => v.brand))].map((b) => ({ label: b, value: b })),
    []
  );
  const modelOptions = useMemo(
    () => [...new Set(MOCK_VEHICLES.map((v) => v.model))].map((m) => ({ label: m, value: m })),
    []
  );

  const appliedMultiPlates = useMemo(() => parseMultiPlates(appliedFilters.plateNos), [appliedFilters.plateNos]);

  const filterVehiclesByFilters = (vehicles, f, kpi) => {
    const plateKey = (f.plateNo || '').trim().toLowerCase();
    const multiPlates = parseMultiPlates(f.plateNos);
    const vinKey = (f.vin || '').trim().toLowerCase();
    const brandKey = (f.brand || '').trim().toLowerCase();
    const modelKey = (f.model || '').trim().toLowerCase();

    return vehicles.filter((v) => {
      const ledgerKey = getVehicleLedgerKey(v);
      const plateText = (v.plateNo || '').trim();
      if (multiPlates.length) {
        if (!plateText) return false;
        if (!multiPlates.includes(plateText.toUpperCase())) return false;
      } else if (plateKey) {
        if (!plateText) {
          if (!NO_PLATE_LABEL.toLowerCase().includes(plateKey) && !plateKey.includes('暂无')) return false;
        } else if (!plateText.toLowerCase().includes(plateKey)) return false;
      }
      if (vinKey && !v.vin.toLowerCase().includes(vinKey)) return false;
      if (brandKey && !v.brand.toLowerCase().includes(brandKey)) return false;
      if (modelKey && !v.model.toLowerCase().includes(modelKey)) return false;
      if (f.operateStatus !== '全部' && v.status !== f.operateStatus) return false;
      if (f.insuranceStatus === '正常' && getVehicleInsuranceStatus(ledgerKey).abnormal) return false;
      if (f.insuranceStatus === '异常' && !getVehicleInsuranceStatus(ledgerKey).abnormal) return false;
      if (!vehicleMatchesListInsuranceTypeFilter(ledgerKey, f.insuranceType, f.endDateRange, allInsurance)) return false;
      if (!matchKpiFilter(ledgerKey, kpi)) return false;
      return true;
    });
  };

  const filteredVehicles = useMemo(
    () => sortVehiclesRetiredLast(filterVehiclesByFilters(MOCK_VEHICLES, appliedFilters, kpiFilter)),
    [appliedFilters, allInsurance, kpiFilter]
  );

  const handleListFilterQuery = () => {
    const hasEndStart = listFilters.endDateRange?.[0];
    const hasEndEnd = listFilters.endDateRange?.[1];
    if ((hasEndStart || hasEndEnd) && !listFilters.insuranceType) {
      message.warning('请先选择保险类型，再按到期时间筛选');
      return;
    }
    if ((hasEndStart && !hasEndEnd) || (!hasEndStart && hasEndEnd)) {
      message.warning('请完整选择到期时间的开始与结束日期');
      return;
    }
    const plates = parseMultiPlates(multiPlateDraft);
    const next = {
      ...listFilters,
      plateNos: multiPlateDraft.trim(),
      plateNo: plates.length ? '' : listFilters.plateNo,
    };
    setListFilters(next);
    setAppliedFilters(next);
    setMultiPlateOpen(false);
    const hitCount = filterVehiclesByFilters(MOCK_VEHICLES, next, kpiFilter).length;
    if (plates.length) {
      message.success(`已按 ${plates.length} 个车牌筛选，命中 ${hitCount} 条记录`);
    } else {
      message.success(`查询完成，命中 ${hitCount} 条记录`);
    }
  };

  const handleListFilterReset = () => {
    setListFilters({ ...DEFAULT_LIST_FILTERS });
    setAppliedFilters({ ...DEFAULT_LIST_FILTERS });
    setMultiPlateDraft('');
    setKpiFilter('total');
    message.info('筛选条件已重置');
  };

  const handleMultiPlateOpenChange = (open) => {
    setMultiPlateOpen(open);
    if (open) setMultiPlateDraft(listFilters.plateNos || '');
  };

  const renderFilterField = (label, control) => (
    <div className="lc-filter-field">
      <span className="lc-filter-field-label">{label}</span>
      <div className="lc-filter-field-control">{control}</div>
    </div>
  );

  const isRetiredVehicle = (record) => record?.status === '退出运营';

  const renderInsuranceDateCell = (record, typeKey) => {
    const ledgerKey = getVehicleLedgerKey(record);
    const item = allInsurance[ledgerKey]?.[typeKey];
    const status = getInsuranceItemStatus(ledgerKey, typeKey);
    const dateVal = item?.endDate;
    const muted = isRetiredVehicle(record);
    const policyTagEl = renderPolicyStatusTag(item);
    return (
      <div className="lc-list-expire-cell">
        <div
          className="lc-list-expire-date"
          style={{ color: muted ? '#94a3b8' : (dateVal ? '#334155' : '#94a3b8') }}
        >
          {dateVal || '—'}
        </div>
        {!muted ? (
          <div className="lc-list-expire-meta">
            {policyTagEl || (
              <Tooltip title={status.text}>
                <span className="lc-list-status-badge-wrap">
                  <Badge
                    status={mapInsuranceStatusToBadge(status.type)}
                    text={(
                      <span className="lc-list-status-badge-text">
                        {getInsuranceRemainShortText(status)}
                      </span>
                    )}
                  />
                </span>
              </Tooltip>
            )}
          </div>
        ) : null}
      </div>
    );
  };

  const listColumns = [
    {
      title: '车牌号',
      dataIndex: 'plateNo',
      key: 'plateNo',
      width: 148,
      onHeaderCell: listColumnHeaderCell,
      align: 'left',
      render: (plate, record) => {
        const muted = isRetiredVehicle(record);
        const noPlate = !hasVehiclePlate(record);
        const displayPlate = formatVehiclePlateDisplay(plate);
        const sub = [record.brand, record.model].filter(Boolean).join(' · ');
        return (
          <div className="lc-list-plate-cell">
            <span
              className={noPlate && !muted ? 'lc-list-plate-empty' : ''}
              style={{ fontWeight: 600, fontSize: 13, color: muted ? '#94a3b8' : (noPlate ? '#94a3b8' : '#0f172a') }}
            >
              {displayPlate}
            </span>
            {sub ? (
              <Tooltip title={sub}>
                <span className="lc-list-plate-sub lc-cell-ellipsis" style={{ color: muted ? '#94a3b8' : '#64748b' }}>
                  {sub}
                </span>
              </Tooltip>
            ) : null}
          </div>
        );
      },
    },
    {
      title: 'VIN码',
      dataIndex: 'vin',
      key: 'vin',
      width: 112,
      onHeaderCell: listColumnHeaderCell,
      render: (vin, record) => (
        <Tooltip title={vin}>
          <span className="lc-cell-ellipsis" style={{ fontFamily: 'monospace', fontSize: 11, color: isRetiredVehicle(record) ? '#94a3b8' : '#475569' }}>
            {vin}
          </span>
        </Tooltip>
      ),
    },
    {
      title: '运营状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      onHeaderCell: listColumnHeaderCell,
      render: (status) => (
        <span style={{ fontSize: 13, fontWeight: 600, color: status === '退出运营' ? '#94a3b8' : '#334155' }}>
          {status}
        </span>
      ),
    },
    {
      title: '保险状态',
      key: 'insuranceStatus',
      width: 80,
      onHeaderCell: listColumnHeaderCell,
      render: (record) => {
        const st = getVehicleInsuranceStatus(getVehicleLedgerKey(record));
        return (
          <Tooltip title={st.tip}>
            <Tag color={st.color} style={{ margin: 0, fontWeight: 600, fontSize: 12 }}>
              {st.label}
            </Tag>
          </Tooltip>
        );
      },
    },
    {
      title: '交强险到期日期',
      key: 'compulsory',
      width: 118,
      onHeaderCell: listColumnHeaderCell,
      render: (record) => renderInsuranceDateCell(record, 'compulsory'),
    },
    {
      title: '商业险到期日期',
      key: 'commercial',
      width: 118,
      onHeaderCell: listColumnHeaderCell,
      render: (record) => renderInsuranceDateCell(record, 'commercial'),
    },
    {
      title: '超赔险到期日期',
      key: 'excess',
      width: 118,
      onHeaderCell: listColumnHeaderCell,
      render: (record) => renderInsuranceDateCell(record, 'excess'),
    },
    {
      title: '货物险到期日期',
      key: 'cargo',
      width: 118,
      onHeaderCell: listColumnHeaderCell,
      render: (record) => renderInsuranceDateCell(record, 'cargo'),
    },
    {
      title: '驾意险到期日期',
      key: 'driverAccident',
      width: 118,
      onHeaderCell: listColumnHeaderCell,
      render: (record) => renderInsuranceDateCell(record, 'driverAccident'),
    },
    {
      title: '操作',
      key: 'action',
      width: 64,
      onHeaderCell: listColumnHeaderCell,
      render: (record) => (
        <Button
          type="link"
          size="small"
          style={{ fontWeight: 600, color: '#10b981', padding: 0 }}
          onClick={() => openVehicleInsuranceMgmt(record)}
        >
          管理
        </Button>
      ),
    },
  ];

  return (
    <div
      className="lc-edit-page"
      style={{
        padding: '24px 24px 80px',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: 'linear-gradient(165deg, #f1f5f9 0%, #f8fafc 50%, #f1f5f9 100%)',
        overflow: 'hidden',
        boxSizing: 'border-box',
      }}
    >
      <style>{PAGE_STYLE}</style>

      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
        <div className="lc-page-header" style={{ marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', lineHeight: 1.3 }}>保险采购</div>
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>保单管理（一车一档）· 比价单独立管理，互不关联</div>
          </div>
          <Button
            type="default"
            icon={ICONS.policy}
            style={{ borderRadius: 8, border: '1px solid #cbd5e1', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 6, color: '#475569' }}
            onClick={() => setPrdOpen(true)}
          >
            查看需求说明
          </Button>
        </div>

        <Card className="lc-filter-card" title="保单管理 · 筛选条件" bordered={false}>
          <div className="lc-filter-grid">
            {renderFilterField('车牌号', (
              <Input
                placeholder={appliedMultiPlates.length ? '已启用多车牌筛选' : '请输入车牌号'}
                allowClear
                disabled={appliedMultiPlates.length > 0}
                value={listFilters.plateNo}
                onChange={(e) => setListFilters((prev) => ({ ...prev, plateNo: e.target.value }))}
                onPressEnter={handleListFilterQuery}
                style={{ borderRadius: 8 }}
              />
            ))}
            {renderFilterField('多车牌', (
              <Popover
                open={multiPlateOpen}
                onOpenChange={handleMultiPlateOpenChange}
                trigger="click"
                placement="bottomLeft"
                content={(
                  <div className="lc-multi-plate-pop">
                    <div className="lc-multi-plate-pop-hint">每行一个车牌，或同一行内用逗号分隔</div>
                    <Input.TextArea
                      rows={5}
                      value={multiPlateDraft}
                      onChange={(e) => setMultiPlateDraft(e.target.value)}
                      placeholder={'沪A03561F\n粤B58888F'}
                      style={{ borderRadius: 8 }}
                    />
                    <div className="lc-multi-plate-pop-actions">
                      <Button size="small" onClick={() => setMultiPlateOpen(false)}>取消</Button>
                      <Button size="small" type="primary" onClick={handleListFilterQuery}>应用</Button>
                    </div>
                  </div>
                )}
              >
                <Input
                  className="lc-multi-plate-trigger"
                  readOnly
                  placeholder="点击输入多个车牌"
                  value={appliedMultiPlates.length ? `已选 ${appliedMultiPlates.length} 个车牌` : ''}
                  style={{ borderRadius: 8 }}
                />
              </Popover>
            ))}
            {renderFilterField('VIN码', (
              <Input
                placeholder="请输入车辆识别代码"
                allowClear
                value={listFilters.vin}
                onChange={(e) => setListFilters((prev) => ({ ...prev, vin: e.target.value }))}
                onPressEnter={handleListFilterQuery}
                style={{ borderRadius: 8 }}
              />
            ))}
            {renderFilterField('品牌', (
              <Select
                placeholder="请选择或输入品牌"
                allowClear
                showSearch
                value={listFilters.brand || undefined}
                onChange={(val) => setListFilters((prev) => ({ ...prev, brand: val || '' }))}
                options={brandOptions}
                filterOption={(input, option) => (option?.label || '').toLowerCase().includes(input.toLowerCase())}
                style={{ width: '100%' }}
              />
            ))}
            {renderFilterField('型号', (
              <Select
                placeholder="请选择或输入型号"
                allowClear
                showSearch
                value={listFilters.model || undefined}
                onChange={(val) => setListFilters((prev) => ({ ...prev, model: val || '' }))}
                options={modelOptions}
                filterOption={(input, option) => (option?.label || '').toLowerCase().includes(input.toLowerCase())}
                style={{ width: '100%' }}
              />
            ))}
            {renderFilterField('运营状态', (
              <Select
                value={listFilters.operateStatus}
                onChange={(val) => setListFilters((prev) => ({ ...prev, operateStatus: val }))}
                style={{ width: '100%' }}
              >
                <Select.Option value="全部">全部</Select.Option>
                <Select.Option value="租赁">租赁</Select.Option>
                <Select.Option value="自营">自营</Select.Option>
                <Select.Option value="库存">库存</Select.Option>
                <Select.Option value="退出运营">退出运营</Select.Option>
              </Select>
            ))}
            {renderFilterField('保险状态', (
              <Select
                value={listFilters.insuranceStatus}
                onChange={(val) => setListFilters((prev) => ({ ...prev, insuranceStatus: val }))}
                style={{ width: '100%' }}
              >
                <Select.Option value="全部">全部</Select.Option>
                <Select.Option value="正常">正常/临期</Select.Option>
                <Select.Option value="异常">异常</Select.Option>
              </Select>
            ))}
            {renderFilterField('保险类型', (
              <Select
                placeholder="请选择险种"
                allowClear
                value={listFilters.insuranceType || undefined}
                onChange={(val) => setListFilters((prev) => ({
                  ...prev,
                  insuranceType: val || '',
                  endDateRange: val ? prev.endDateRange : null,
                }))}
                options={INSURANCE_TYPE_ITEMS.map((item) => ({
                  label: item.fullLabel,
                  value: item.fullLabel,
                }))}
                style={{ width: '100%' }}
              />
            ))}
            {renderFilterField('到期时间', (
              <Tooltip title={listFilters.insuranceType ? '' : '须先选择保险类型'}>
                <DatePicker.RangePicker
                  style={{ width: '100%' }}
                  value={listFilters.endDateRange}
                  disabled={!listFilters.insuranceType}
                  onChange={(range) => {
                    if (!listFilters.insuranceType) {
                      message.warning('请先选择保险类型');
                      return;
                    }
                    setListFilters((prev) => ({ ...prev, endDateRange: range }));
                  }}
                  placeholder={listFilters.insuranceType ? ['开始日期', '结束日期'] : ['请先选择保险类型', '']}
                  allowClear
                />
              </Tooltip>
            ))}
          </div>
          <div className="lc-filter-actions">
            <Button onClick={handleListFilterReset}>重置</Button>
            <Button type="primary" onClick={handleListFilterQuery}>查询</Button>
          </div>
        </Card>

        <div className="lc-alert-stats-row">
          {[
            { key: 'total', type: 'total', title: '台账车辆总数', desc: '纳入保险采购台账管理的车辆（一车一档）', val: stats.total, icon: ICONS.vehicle },
            { key: 'normal', type: 'normal', title: '保险状态正常', desc: '交强险、商业险均已购买且在有效期内，与车辆管理「保险状态=正常」一致', val: stats.normal, icon: ICONS.success },
            { key: 'warning', type: 'warning', title: '险种临期预警', desc: `任一类险种止期 ≤ ${INSURANCE_WARN_DAYS} 天（含交强险、商业险、超赔险、货物险、驾意险）`, val: stats.warning, icon: ICONS.warning },
            { key: 'expired', type: 'expired', title: '核心险种逾期', desc: '交强险或商业险已到期，车辆管理保险状态为异常，禁止交车', val: stats.expired, icon: ICONS.warning },
            { key: 'unuploaded', type: 'unuploaded', title: '核心险种待购', desc: '交强险或商业险未录入/未购买，车辆管理保险状态为异常，禁止交车', val: stats.unuploaded, icon: ICONS.shield },
          ].map((card) => (
            <div
              key={card.key}
              role="button"
              tabIndex={0}
              className={`lc-alert-card lc-alert-card--${card.type} lc-alert-card-clickable${
                card.key === 'warning'
                  ? (insuranceAlertOpen && insuranceAlertMode === 'expiring' ? ' lc-alert-card-active' : '')
                  : card.key === 'expired'
                    ? (insuranceAlertOpen && insuranceAlertMode === 'coreExpired' ? ' lc-alert-card-active' : '')
                    : (kpiFilter === card.key ? ' lc-alert-card-active' : '')
              }`}
              onClick={() => {
                if (card.key === 'warning') openInsuranceAlertModal('expiring');
                else if (card.key === 'expired') openInsuranceAlertModal('coreExpired');
                else setKpiFilter(card.key);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  if (card.key === 'warning') openInsuranceAlertModal('expiring');
                  else if (card.key === 'expired') openInsuranceAlertModal('coreExpired');
                  else setKpiFilter(card.key);
                }
              }}
            >
              <div className="lc-alert-card-tip-anchor">
                <Tooltip title={card.desc} placement="topRight" overlayStyle={{ maxWidth: 340 }}>
                  <span
                    className="lc-alert-card-tip"
                    role="img"
                    aria-label={`${card.title}说明`}
                    onClick={(e) => e.stopPropagation()}
                    onMouseDown={(e) => e.stopPropagation()}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="16" x2="12" y2="12" />
                      <line x1="12" y1="8" x2="12.01" y2="8" />
                    </svg>
                  </span>
                </Tooltip>
              </div>
              <div className="lc-alert-card-icon">{card.icon}</div>
              <div className="lc-alert-card-main">
                <div className="lc-alert-card-val">{card.val}</div>
                <div className="lc-alert-card-title">{card.title}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="lc-table-section" style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          <div className="lc-table-toolbar">
            <span style={{ fontSize: 13, fontWeight: 600, color: '#475569' }}>保单录入</span>
            <div className="lc-table-toolbar-actions lc-policy-toolbar">
              <Button
                type="primary"
                style={{ borderRadius: 8, fontWeight: 600, background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', border: 'none' }}
                onClick={openCompareMgmtModal}
              >
                比价单管理
              </Button>
              <Button
                type="default"
                style={{ borderRadius: 8, fontWeight: 600, borderColor: '#10b981', color: '#059669' }}
                onClick={() => openPolicyRecogn('ocr', 'policy')}
              >
                保单批量识别
              </Button>
              <Button
                style={{ borderRadius: 8, fontWeight: 600 }}
                onClick={openPolicyRecognTasksModal}
              >
                识别任务记录
              </Button>
              <Button
                style={{ borderRadius: 8, fontWeight: 600, borderColor: '#10b981', color: '#059669' }}
                onClick={() => openPolicyRecogn('import', 'policy')}
              >
                批量导入
              </Button>
              <Button
                style={{ borderRadius: 8, fontWeight: 600 }}
                onClick={() => {
                  setPolicyAddDraft({ ...EMPTY_POLICY_DETAIL, bizType: 'policy' });
                  setPolicyAddAttachmentFileList([]);
                  setPolicyAddOpen(true);
                }}
              >
                新增
              </Button>
            </div>
          </div>
          <div className="lc-table-card" style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
            <Table
              className="lc-list-table"
              columns={listColumns}
              dataSource={filteredVehicles}
              rowKey={(record) => getVehicleLedgerKey(record)}
              rowClassName={(record) => (record.status === '退出运营' ? 'lc-row-retired' : '')}
              pagination={false}
              scroll={{ x: 1040 }}
              locale={{
                emptyText: (
                  <div style={{ padding: '40px 0' }}>
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5" style={{ marginBottom: 12 }}><circle cx="12" cy="12" r="10" /><line x1="8" y1="12" x2="16" y2="12" /></svg>
                    <div style={{ color: '#94a3b8' }}>暂无符合检索条件的保险台账车辆</div>
                  </div>
                ),
              }}
            />
          </div>
        </div>
      </div>

      <Modal
        className="lc-vehicle-ins-mgmt-modal"
        open={vehicleInsMgmtOpen}
        title={null}
        width={1120}
        centered
        destroyOnClose
        footer={(
          <Button type="primary" style={{ fontWeight: 600, borderRadius: 8 }} onClick={() => setVehicleInsMgmtOpen(false)}>
            关闭
          </Button>
        )}
        onCancel={() => setVehicleInsMgmtOpen(false)}
      >
        {vehicleInsMgmtVehicle ? (() => {
          const profile = getVehicleProfile(vehicleInsMgmtVehicle);
          const ledgerKey = getVehicleLedgerKey(vehicleInsMgmtVehicle);
          const insStatus = getVehicleInsuranceStatus(ledgerKey);
          const statusPillClass = insStatus.color === 'success' || insStatus.color === 'warning'
            ? `lc-vehicle-ins-mgmt-status-pill--${insStatus.color}`
            : 'lc-vehicle-ins-mgmt-status-pill--error';
          return (
            <div className="lc-vehicle-ins-mgmt-shell">
              <div className="lc-vehicle-ins-mgmt-hero">
                <div className="lc-vehicle-ins-mgmt-hero-top">
                  <div>
                    <div className="lc-vehicle-ins-mgmt-hero-title">车辆保险档案</div>
                    <div className="lc-vehicle-ins-mgmt-plate">{formatVehiclePlateDisplay(vehicleInsMgmtVehicle.plateNo)}</div>
                    <div className="lc-vehicle-ins-mgmt-subtitle">
                      {vehicleInsMgmtVehicle.brand} {vehicleInsMgmtVehicle.model}
                    </div>
                  </div>
                  <Tooltip title={insStatus.tip}>
                    <span className={`lc-vehicle-ins-mgmt-status-pill ${statusPillClass}`}>
                      保险状态 · {insStatus.label}
                    </span>
                  </Tooltip>
                </div>
                <div className="lc-vehicle-ins-mgmt-meta-grid">
                  <div className="lc-vehicle-ins-mgmt-meta-card">
                    <div className="lc-vehicle-ins-mgmt-meta-label">VIN码</div>
                    <div className="lc-vehicle-ins-mgmt-meta-val">{vehicleInsMgmtVehicle.vin || '—'}</div>
                  </div>
                  <div className="lc-vehicle-ins-mgmt-meta-card">
                    <div className="lc-vehicle-ins-mgmt-meta-label">运营状态</div>
                    <div className="lc-vehicle-ins-mgmt-meta-val">{vehicleInsMgmtVehicle.status || '—'}</div>
                  </div>
                  <div className="lc-vehicle-ins-mgmt-meta-card">
                    <div className="lc-vehicle-ins-mgmt-meta-label">客户</div>
                    <div className="lc-vehicle-ins-mgmt-meta-val">{profile.customer || '—'}</div>
                  </div>
                  <div className="lc-vehicle-ins-mgmt-meta-card">
                    <div className="lc-vehicle-ins-mgmt-meta-label">产权方</div>
                    <div className="lc-vehicle-ins-mgmt-meta-val">{profile.ownerCompany || '—'}</div>
                  </div>
                  <div className="lc-vehicle-ins-mgmt-meta-card">
                    <div className="lc-vehicle-ins-mgmt-meta-label">注册日期</div>
                    <div className="lc-vehicle-ins-mgmt-meta-val">{profile.regDate || '—'}</div>
                  </div>
                  <div className="lc-vehicle-ins-mgmt-meta-card">
                    <div className="lc-vehicle-ins-mgmt-meta-label">年审到期</div>
                    <div className="lc-vehicle-ins-mgmt-meta-val">{profile.inspectExpire || '—'}</div>
                  </div>
                </div>
              </div>
              <div className="lc-vehicle-ins-mgmt-body">
                <div className="lc-vehicle-ins-mgmt-filter">
                  {renderFilterField('保单号', (
                    <Input
                      allowClear
                      placeholder="输入保单号，回车或点击查询"
                      value={vehicleInsMgmtPolicyNoFilter}
                      onChange={(e) => setVehicleInsMgmtPolicyNoFilter(e.target.value)}
                      onPressEnter={handleVehicleInsMgmtPolicyNoSearch}
                      style={{ borderRadius: 8 }}
                    />
                  ))}
                  <Button type="primary" style={{ borderRadius: 8, fontWeight: 600 }} onClick={handleVehicleInsMgmtPolicyNoSearch}>
                    查询
                  </Button>
                </div>
                <Tabs
                  className="lc-vehicle-ins-mgmt-tabs"
                  activeKey={vehicleInsMgmtActiveTab}
                  onChange={(key) => {
                    setVehicleInsMgmtActiveTab(key);
                    setVehicleInsMgmtHighlightId('');
                  }}
                  type="card"
                  size="small"
                >
                  <Tabs.TabPane tab={renderVehicleInsMgmtTabLabel({ key: 'timeline', label: '全周期记录' })} key="timeline">
                    {!vehicleInsuranceHistory.timelinePolicy?.length
                      && !vehicleInsuranceHistory.timelineBiz?.length ? (
                        <div className="lc-vehicle-ins-mgmt-empty">
                          <div style={{ fontSize: 15, fontWeight: 700, color: '#334155', marginBottom: 8 }}>暂无全周期记录</div>
                          <div style={{ fontSize: 13, color: '#64748b' }}>可通过新增、续保或停保 / 复驶 / 退保操作产生记录</div>
                        </div>
                      ) : (
                        renderVehicleInsuranceCenterTimeline()
                      )}
                  </Tabs.TabPane>
                  {VEHICLE_INSURANCE_MGMT_TABS.filter((t) => t.key !== 'timeline').map((tab) => (
                    <Tabs.TabPane tab={renderVehicleInsMgmtTabLabel(tab)} key={tab.key}>
                      {renderVehicleInsuranceTypeTab(tab.key)}
                    </Tabs.TabPane>
                  ))}
                </Tabs>
              </div>
            </div>
          );
        })() : null}
      </Modal>

      <Modal
        title={
          policyBizModalMode === 'suspend'
            ? '停保'
            : policyBizModalMode === 'resume'
              ? '复驶'
              : '退保'
        }
        open={policyBizModalOpen}
        width={640}
        centered
        destroyOnClose
        okText="提交"
        cancelText="取消"
        onCancel={() => {
          setPolicyBizModalOpen(false);
          setPolicyBizModalRecord(null);
          setPolicyBizForm({ ...EMPTY_POLICY_BIZ_FORM });
          setPolicyBizAttachmentFileList([]);
        }}
        onOk={submitPolicyBizModal}
      >
        {policyBizModalRecord && vehicleInsMgmtVehicle ? (
          <>
            <div className="lc-policy-biz-summary">
              <div>
                <div className="lc-policy-biz-summary-item-label">车牌号</div>
                <div className="lc-policy-biz-summary-item-val">{formatVehiclePlateDisplay(vehicleInsMgmtVehicle.plateNo)}</div>
              </div>
              <div>
                <div className="lc-policy-biz-summary-item-label">保单号</div>
                <div className="lc-policy-biz-summary-item-val">{policyBizModalRecord.policyNo || '—'}</div>
              </div>
              <div>
                <div className="lc-policy-biz-summary-item-label">保险公司</div>
                <div className="lc-policy-biz-summary-item-val">{policyBizModalRecord.company || '—'}</div>
              </div>
              <div>
                <div className="lc-policy-biz-summary-item-label">生效日期</div>
                <div className="lc-policy-biz-summary-item-val">{policyBizModalRecord.startDate || '—'}</div>
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <div className="lc-policy-biz-summary-item-label">到期日期</div>
                <div className="lc-policy-biz-summary-item-val">{policyBizModalRecord.endDate || '—'}</div>
              </div>
            </div>
            <div className="lc-policy-biz-form">
              {policyBizModalMode === 'suspend' ? (
                <>
                  {renderFilterField('中止时间', (
                    <DatePicker
                      style={{ width: '100%' }}
                      value={policyBizForm.suspendTime && moment ? moment(policyBizForm.suspendTime) : null}
                      onChange={(_, ds) => setPolicyBizForm((p) => ({ ...p, suspendTime: ds || '' }))}
                    />
                  ))}
                  {renderFilterField('恢复时间', (
                    <DatePicker
                      style={{ width: '100%' }}
                      value={policyBizForm.resumeTime && moment ? moment(policyBizForm.resumeTime) : null}
                      onChange={(_, ds) => setPolicyBizForm((p) => ({ ...p, resumeTime: ds || '' }))}
                    />
                  ))}
                  {renderFilterField('新到期日期', (
                    <DatePicker
                      style={{ width: '100%' }}
                      value={policyBizForm.newEndDate && moment ? moment(policyBizForm.newEndDate) : null}
                      onChange={(_, ds) => setPolicyBizForm((p) => ({ ...p, newEndDate: ds || '' }))}
                    />
                  ))}
                  <div className="lc-policy-biz-form-full lc-compare-attach-field">
                    <span className="lc-compare-attach-label">停保单附件</span>
                    <span className="lc-compare-attach-hint">支持 PDF、图片，可上传多份</span>
                    <Upload
                      className="lc-compare-attach-upload"
                      multiple
                      accept=".pdf,image/*"
                      fileList={policyBizAttachmentFileList}
                      beforeUpload={() => false}
                      onChange={handlePolicyBizAttachmentChange}
                    >
                      <Button type="dashed" style={{ borderRadius: 8, fontWeight: 600, width: '100%' }}>
                        上传停保单附件
                      </Button>
                    </Upload>
                  </div>
                </>
              ) : null}
              {policyBizModalMode === 'resume' ? (
                <>
                  {renderFilterField('恢复时间', (
                    <DatePicker
                      style={{ width: '100%' }}
                      value={policyBizForm.resumeTime && moment ? moment(policyBizForm.resumeTime) : null}
                      onChange={(_, ds) => setPolicyBizForm((p) => ({ ...p, resumeTime: ds || '' }))}
                    />
                  ))}
                  {renderFilterField('新到期日期', (
                    <DatePicker
                      style={{ width: '100%' }}
                      value={policyBizForm.newEndDate && moment ? moment(policyBizForm.newEndDate) : null}
                      onChange={(_, ds) => setPolicyBizForm((p) => ({ ...p, newEndDate: ds || '' }))}
                    />
                  ))}
                  <div className="lc-policy-biz-form-full lc-compare-attach-field">
                    <span className="lc-compare-attach-label">复驶单附件</span>
                    <span className="lc-compare-attach-hint">支持 PDF、图片，可上传多份</span>
                    <Upload
                      className="lc-compare-attach-upload"
                      multiple
                      accept=".pdf,image/*"
                      fileList={policyBizAttachmentFileList}
                      beforeUpload={() => false}
                      onChange={handlePolicyBizAttachmentChange}
                    >
                      <Button type="dashed" style={{ borderRadius: 8, fontWeight: 600, width: '100%' }}>
                        上传复驶单附件
                      </Button>
                    </Upload>
                  </div>
                </>
              ) : null}
              {policyBizModalMode === 'cancel' ? (
                <>
                  {renderFilterField('退保时间', (
                    <DatePicker
                      style={{ width: '100%' }}
                      value={policyBizForm.cancelTime && moment ? moment(policyBizForm.cancelTime) : null}
                      onChange={(_, ds) => setPolicyBizForm((p) => ({ ...p, cancelTime: ds || '' }))}
                    />
                  ))}
                  {renderFilterField('退还保费', (
                    <Input
                      value={policyBizForm.refundPremium}
                      onChange={(e) => setPolicyBizForm((p) => ({ ...p, refundPremium: e.target.value }))}
                      placeholder="元"
                    />
                  ))}
                  <div className="lc-policy-biz-form-full lc-compare-attach-field">
                    <span className="lc-compare-attach-label">退保单附件</span>
                    <span className="lc-compare-attach-hint">支持 PDF、图片，可上传多份</span>
                    <Upload
                      className="lc-compare-attach-upload"
                      multiple
                      accept=".pdf,image/*"
                      fileList={policyBizAttachmentFileList}
                      beforeUpload={() => false}
                      onChange={handlePolicyBizAttachmentChange}
                    >
                      <Button type="dashed" style={{ borderRadius: 8, fontWeight: 600, width: '100%' }}>
                        上传退保单附件
                      </Button>
                    </Upload>
                  </div>
                </>
              ) : null}
            </div>
          </>
        ) : null}
      </Modal>

      <Modal
        title={`操作历史${policyOpHistoryRecord?.typeLabel ? ` · ${policyOpHistoryRecord.typeLabel}` : ''}`}
        open={policyOpHistoryOpen}
        width={960}
        centered
        footer={(
          <Button type="primary" onClick={() => {
            setPolicyOpHistoryOpen(false);
            setPolicyOpHistoryRecord(null);
          }}
          >
            关闭
          </Button>
        )}
        onCancel={() => {
          setPolicyOpHistoryOpen(false);
          setPolicyOpHistoryRecord(null);
        }}
      >
        <Table
          size="small"
          rowKey="id"
          pagination={false}
          locale={{ emptyText: '暂无操作记录' }}
          dataSource={policyOpHistoryRecord?.operationLogs || []}
          scroll={{ x: 920, y: 360 }}
          columns={[
            {
              title: '操作时间',
              dataIndex: 'time',
              width: 168,
              render: (val) => <span style={{ fontVariantNumeric: 'tabular-nums' }}>{val || '—'}</span>,
            },
            {
              title: '操作人',
              dataIndex: 'operator',
              width: 96,
              ellipsis: true,
            },
            {
              title: '操作类型',
              dataIndex: 'type',
              width: 88,
              render: (val) => INSURANCE_OPERATION_TYPE_LABEL[val] || val || '—',
            },
            {
              title: '备注',
              dataIndex: 'remark',
              width: 220,
              ellipsis: true,
              render: (val) => (
                <Tooltip title={val}>
                  <span>{val || '—'}</span>
                </Tooltip>
              ),
            },
            {
              title: '附件',
              key: 'attachments',
              width: 148,
              render: (_, log) => {
                const bizTypes = ['suspend', 'resume', 'cancel'];
                if (!bizTypes.includes(log.type)) return <span style={{ color: '#94a3b8' }}>—</span>;
                const attachments = log.attachments || [];
                if (!attachments.length) {
                  return <span style={{ color: '#94a3b8', fontSize: 12 }}>无附件</span>;
                }
                return (
                  <div className="lc-vehicle-ins-mgmt-actions" style={{ flexWrap: 'wrap', gap: 2 }}>
                    {attachments.map((att) => (
                      <span key={att.id || att.uid || att.name} style={{ display: 'inline-flex', alignItems: 'center', gap: 2 }}>
                        <Tooltip title={att.name}>
                          <Button
                            type="link"
                            size="small"
                            style={{ padding: 0, fontSize: 12 }}
                            onClick={() => handleOperationLogAttachmentPreview(att)}
                          >
                            预览
                          </Button>
                        </Tooltip>
                        <Button
                          type="link"
                          size="small"
                          style={{ padding: 0, fontSize: 12, fontWeight: 600, color: '#059669' }}
                          onClick={() => handleOperationLogAttachmentDownload(att)}
                        >
                          下载
                        </Button>
                      </span>
                    ))}
                  </div>
                );
              },
            },
          ]}
        />
      </Modal>

      <Modal
        open={prdOpen}
        title="保险采购 — 产品需求说明（研发）"
        width={880}
        centered
        footer={null}
        onCancel={() => setPrdOpen(false)}
      >
        <Tabs
          defaultActiveKey="prd"
          size="small"
          items={[
            {
              key: 'prd',
              label: '需求说明',
              children: (
                <div style={{ fontSize: 13, color: '#334155', lineHeight: 1.75, maxHeight: '68vh', overflowY: 'auto', paddingRight: 4 }}>
                  <Alert
                    type="info"
                    showIcon
                    style={{ marginBottom: 14, borderRadius: 10 }}
                    message="文档说明（面向研发）"
                    description="本文档由产品侧输出，用于向技术团队说明「保险采购」模块的业务目标、功能边界、状态规则与验收标准。原型已实现部分交互，正式开发须以本文业务规则为准，接口与存储由技术方案落地。"
                  />

                  <p><strong>一、需求背景与目标</strong></p>
                  <p style={{ margin: '6px 0 8px' }}>
                    车队保险采购分散在 Excel、邮件与线下批单中，台账不全、续保临期易漏、停保退保无留痕、采购比价难追溯、交车合规无法实时校验。
                    本模块需在同一页面承载两条<strong>相互独立</strong>的业务线，技术实现上须避免强耦合与自动双向同步。
                  </p>
                  <ul style={{ paddingLeft: 20, margin: '6px 0 14px' }}>
                    <li><strong>保单管理：</strong>建立一车一档台账，支撑 OCR/导入/手工录入及停保/复驶/退保变更，并与车辆管理交车合规联动。</li>
                    <li><strong>比价单：</strong>支撑采购前多方报价、批次管理、最晚付费预警与采购审批发起；审批结果回写购买记录，<strong>不自动写入保单台账</strong>。</li>
                  </ul>

                  <p><strong>二、模块边界与外部依赖</strong></p>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, margin: '8px 0 14px' }}>
                    <thead>
                      <tr style={{ background: '#f8fafc' }}>
                        <th style={{ border: '1px solid #e2e8f0', padding: '8px 10px', textAlign: 'left' }}>依赖模块</th>
                        <th style={{ border: '1px solid #e2e8f0', padding: '8px 10px', textAlign: 'left' }}>交互方式</th>
                        <th style={{ border: '1px solid #e2e8f0', padding: '8px 10px', textAlign: 'left' }}>产品要求</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td style={{ border: '1px solid #e2e8f0', padding: '8px 10px' }}>车辆管理</td>
                        <td style={{ border: '1px solid #e2e8f0', padding: '8px 10px' }}>读取车辆档案；输出保险状态</td>
                        <td style={{ border: '1px solid #e2e8f0', padding: '8px 10px' }}>交车合规判定口径须与车辆管理「保险状态」字段一致，异常车辆禁止交车</td>
                      </tr>
                      <tr>
                        <td style={{ border: '1px solid #e2e8f0', padding: '8px 10px' }}>审批中心</td>
                        <td style={{ border: '1px solid #e2e8f0', padding: '8px 10px' }}>发起采购审批；回写采购状态</td>
                        <td style={{ border: '1px solid #e2e8f0', padding: '8px 10px' }}>本页只读展示状态与当前审批人，不提供审批办理能力</td>
                      </tr>
                      <tr>
                        <td style={{ border: '1px solid #e2e8f0', padding: '8px 10px' }}>OCR 服务</td>
                        <td style={{ border: '1px solid #e2e8f0', padding: '8px 10px' }}>保单/批单识别</td>
                        <td style={{ border: '1px solid #e2e8f0', padding: '8px 10px' }}>识别结果须人工确认后落库；不同业务类型识别字段不同（见第六节）</td>
                      </tr>
                    </tbody>
                  </table>
                  <p style={{ margin: '4px 0 14px', color: '#64748b', fontSize: 12 }}>
                    <strong>关键约束：</strong>比价单引用车辆档案与台账到期日作只读参考；审批通过后运营人员须在保单管理侧另行录入正式保单。
                  </p>

                  <p><strong>三、核心数据实体（需持久化）</strong></p>
                  <ul style={{ paddingLeft: 20, margin: '6px 0 14px' }}>
                    <li><strong>车辆保险台账（一车一档）：</strong>以车牌或 VIN 为键；下设五类险种（交强、商业、超赔、货物、驾意），每险种独立存储保单要素、<code>policyTag</code>、操作日志、附件、历史归档保单。</li>
                    <li><strong>险种记录关键字段：</strong>保单号、保险公司、生效/到期日、保费、保险状态（正常/已停保/已退保）、停保中止/恢复时间、退保时间与退还保费、附件列表、<code>operationLogs[]</code>。</li>
                    <li><strong>比价单：</strong>批次头（创建时间、创建人、备注、附件）+ 购买记录行数组。</li>
                    <li><strong>购买记录行：</strong>车辆标识、险种、投保方式、报价列表、最终比价结果 ID、最晚付费日、采购状态、提交时间、当前审批人。</li>
                    <li><strong>识别任务：</strong>任务级 mode（保单/停保/复驶/退保/导入）+ 多条待确认结果；确认后写入台账并标记任务状态。</li>
                  </ul>

                  <p><strong>四、保单管理 · 功能需求</strong></p>
                  <p style={{ margin: '8px 0 4px' }}><strong>4.1 列表与筛选</strong></p>
                  <ul style={{ paddingLeft: 20, margin: '4px 0 10px' }}>
                    <li>支持车牌、多车牌、VIN、品牌、型号、运营状态、保险状态（正常/异常）、险种、到期时间范围筛选。</li>
                    <li>首页 KPI：台账车辆总数、保险状态正常、险种临期预警（30 天）、核心险种逾期、核心险种待购；点击 KPI 可筛选列表或打开预警弹窗。</li>
                    <li>列表展示五类险种到期日；到期日单元格副文案展示临期/逾期天数或停保/退保标签。</li>
                  </ul>
                  <p style={{ margin: '8px 0 4px' }}><strong>4.2 车辆保险档案（管理弹窗）</strong></p>
                  <ul style={{ paddingLeft: 20, margin: '4px 0 10px' }}>
                    <li>Tab1「全周期记录」：时间轴分左右——左侧新保/续保，右侧停保/复驶/退保。</li>
                    <li>Tab2～Tab6 按险种展示历史表；列顺序须包含：导入时间、类型、<strong>保单号、保险状态（保单号右侧）</strong>、保险公司、付款/生效/到期、金额、操作。</li>
                    <li><strong>保险状态枚举：</strong>正常（复驶后亦算正常）、已停保、已退保；已停保悬停展示中止时间、恢复时间、新到期日期。</li>
                    <li>当前有效记录支持停保/复驶/退保；历史归档记录只读，不可办理业务变更。</li>
                  </ul>
                  <p style={{ margin: '8px 0 4px' }}><strong>4.3 录入通道</strong></p>
                  <ul style={{ paddingLeft: 20, margin: '4px 0 10px' }}>
                    <li>逐条新增、保单批量识别（OCR）、Excel 批量导入（仅新保/续保）。</li>
                    <li>导入须自动跳过停保/复驶/退保类业务行。</li>
                    <li>保单 OCR 确认页<strong>不展示</strong>承保险种明细、保险金额、免赔额、分项保费及操作列；上述字段仅在手工新增/台账编辑保留。</li>
                  </ul>

                  <p><strong>五、险种状态计算规则（须服务端统一实现）</strong></p>
                  <p style={{ margin: '6px 0 8px', color: '#64748b' }}>单险种展示状态（列表副标签），按优先级自上而下命中即停止：</p>
                  <ol style={{ paddingLeft: 20, margin: '6px 0 10px' }}>
                    <li>已退保 → 已退保</li>
                    <li>无保单号 → 未购买</li>
                    <li>有保单号 + 停保标记 → 已停保</li>
                    <li>有保单号无到期日 → 未购买</li>
                    <li>到期日 ≤ 今天 → 已到期</li>
                    <li>到期日 ≤ 今天+30 天 → 临期</li>
                    <li>其余 → 正常</li>
                  </ol>
                  <p style={{ margin: '8px 0 4px' }}><strong>车辆级保险状态（交车联动）</strong></p>
                  <ul style={{ paddingLeft: 20, margin: '4px 0 14px' }}>
                    <li>仅由<strong>交强险 + 商业险</strong>决定；二者均为正常或临期 → 车辆正常/临期，允许交车。</li>
                    <li>任一为未购买或已到期 → 车辆异常，禁止交车；已退保视同无有效保障。</li>
                    <li>超赔/货物/驾意仅参与「险种临期预警」统计，不参与交车判定。</li>
                  </ul>

                  <p><strong>六、OCR / 批单识别 · 字段与落库规则</strong></p>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, margin: '8px 0 14px' }}>
                    <thead>
                      <tr style={{ background: '#f8fafc' }}>
                        <th style={{ border: '1px solid #e2e8f0', padding: '8px 10px' }}>业务类型</th>
                        <th style={{ border: '1px solid #e2e8f0', padding: '8px 10px' }}>识别/确认字段</th>
                        <th style={{ border: '1px solid #e2e8f0', padding: '8px 10px' }}>确认后写入</th>
                        <th style={{ border: '1px solid #e2e8f0', padding: '8px 10px' }}>匹配规则</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td style={{ border: '1px solid #e2e8f0', padding: '8px 10px' }}>保单录入</td>
                        <td style={{ border: '1px solid #e2e8f0', padding: '8px 10px' }}>车牌、车主、投保人、被保险人、保司、保单号、收费确认时间、生效/到期日、保费合计</td>
                        <td style={{ border: '1px solid #e2e8f0', padding: '8px 10px' }}>对应险种台账；清空停保/退保标记</td>
                        <td style={{ border: '1px solid #e2e8f0', padding: '8px 10px' }}>车牌/VIN 匹配车辆</td>
                      </tr>
                      <tr>
                        <td style={{ border: '1px solid #e2e8f0', padding: '8px 10px' }}>停保</td>
                        <td style={{ border: '1px solid #e2e8f0', padding: '8px 10px' }}>保单号、中止时间、恢复时间、新到期日期</td>
                        <td style={{ border: '1px solid #e2e8f0', padding: '8px 10px' }}>到期日写新到期日期；标记已停保</td>
                        <td style={{ border: '1px solid #e2e8f0', padding: '8px 10px' }}><strong>按保单号全库匹配</strong></td>
                      </tr>
                      <tr>
                        <td style={{ border: '1px solid #e2e8f0', padding: '8px 10px' }}>复驶</td>
                        <td style={{ border: '1px solid #e2e8f0', padding: '8px 10px' }}>保单号、恢复时间、新到期日期</td>
                        <td style={{ border: '1px solid #e2e8f0', padding: '8px 10px' }}>清除停保/退保标记；到期日更新；状态恢复为正常</td>
                        <td style={{ border: '1px solid #e2e8f0', padding: '8px 10px' }}>按保单号全库匹配</td>
                      </tr>
                      <tr>
                        <td style={{ border: '1px solid #e2e8f0', padding: '8px 10px' }}>退保</td>
                        <td style={{ border: '1px solid #e2e8f0', padding: '8px 10px' }}>保单号、退保时间、退保金额</td>
                        <td style={{ border: '1px solid #e2e8f0', padding: '8px 10px' }}>标记已退保；清空到期日</td>
                        <td style={{ border: '1px solid #e2e8f0', padding: '8px 10px' }}>按保单号全库匹配</td>
                      </tr>
                    </tbody>
                  </table>

                  <p><strong>七、停保 / 复驶 / 退保 · 业务规则</strong></p>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, margin: '8px 0 14px' }}>
                    <thead>
                      <tr style={{ background: '#f8fafc' }}>
                        <th style={{ border: '1px solid #e2e8f0', padding: '8px 10px' }}>当前记录类型</th>
                        <th style={{ border: '1px solid #e2e8f0', padding: '8px 10px' }}>允许操作</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr><td style={{ border: '1px solid #e2e8f0', padding: '8px 10px' }}>新保 / 续保（正常）</td><td style={{ border: '1px solid #e2e8f0', padding: '8px 10px' }}>停保、退保</td></tr>
                      <tr><td style={{ border: '1px solid #e2e8f0', padding: '8px 10px' }}>已停保</td><td style={{ border: '1px solid #e2e8f0', padding: '8px 10px' }}>复驶、退保</td></tr>
                      <tr><td style={{ border: '1px solid #e2e8f0', padding: '8px 10px' }}>已退保</td><td style={{ border: '1px solid #e2e8f0', padding: '8px 10px' }}>仅复驶</td></tr>
                      <tr><td style={{ border: '1px solid #e2e8f0', padding: '8px 10px' }}>历史归档</td><td style={{ border: '1px solid #e2e8f0', padding: '8px 10px' }}>只读，不可操作</td></tr>
                    </tbody>
                  </table>
                  <ul style={{ paddingLeft: 20, margin: '4px 0 14px' }}>
                    <li>每次办理须写入 <code>operationLogs</code>：操作时间、操作人、类型、变更备注；停保/复驶/退保须支持上传附件。</li>
                    <li><strong>操作历史弹窗：</strong>停保/复驶/退保类日志须展示附件预览与下载入口；无附件时展示「无附件」。</li>
                    <li>新保录入时若当前险种为已退保且有保单号，须将旧记录归档至 <code>archivedPolicies</code> 后写入新保单。</li>
                  </ul>

                  <p><strong>八、比价单 · 功能需求</strong></p>
                  <p style={{ margin: '8px 0 4px' }}><strong>8.1 比价单管理列表</strong></p>
                  <ul style={{ paddingLeft: 20, margin: '4px 0 10px' }}>
                    <li>支持按创建时间、车牌筛选。</li>
                    <li>看板三项须可点击筛选下方列表：<strong>全部比价单</strong>、<strong>最晚付费临期</strong>（批次内含距最晚付费日 ≤ 3 天的购买记录）、<strong>最晚付费超期</strong>（批次内含已过期购买记录）。数字统计为<strong>比价单批次数量</strong>，可与时间/车牌筛选叠加。</li>
                    <li>列表字段：创建日期、创建人、总车辆（去重）、保险数量（行数）、附件数、已提交采购数量、审批通过数量。</li>
                  </ul>
                  <p style={{ margin: '8px 0 4px' }}><strong>8.2 编辑器 · 购买记录</strong></p>
                  <ul style={{ paddingLeft: 20, margin: '4px 0 10px' }}>
                    <li>每行关联车辆（车牌或 VIN 至少一项）；选车后客户、品牌、车型、年检/交强/商业到期日只读带出。</li>
                    <li>可编辑：投保方式、保险类型、最晚付费日期。有交强或商业到期日默认续保，否则新保。</li>
                    <li>修改保险类型须清空该行全部报价与最终比价结果。</li>
                    <li>每行须录入至少一条报价（保司+金额），提交前须确定唯一「最终比价结果」。</li>
                    <li>最晚付费日展示标签：剩余天数 / 临期（≤3天）/ 超期。</li>
                  </ul>
                  <p style={{ margin: '8px 0 4px' }}><strong>8.3 保存与提交校验</strong></p>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, margin: '8px 0 14px' }}>
                    <thead>
                      <tr style={{ background: '#f8fafc' }}>
                        <th style={{ border: '1px solid #e2e8f0', padding: '8px 10px', textAlign: 'left' }}>动作</th>
                        <th style={{ border: '1px solid #e2e8f0', padding: '8px 10px', textAlign: 'left' }}>校验条件</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td style={{ border: '1px solid #e2e8f0', padding: '8px 10px', verticalAlign: 'top' }}><strong>保存比价单</strong></td>
                        <td style={{ border: '1px solid #e2e8f0', padding: '8px 10px' }}>
                          ≥1 条购买记录；每行已选车辆；整单备注非空；整单 ≥1 个附件
                        </td>
                      </tr>
                      <tr>
                        <td style={{ border: '1px solid #e2e8f0', padding: '8px 10px', verticalAlign: 'top' }}><strong>提交采购申请</strong></td>
                        <td style={{ border: '1px solid #e2e8f0', padding: '8px 10px' }}>
                          ≥1 条勾选行；勾选行均有最终比价结果与最晚付费日；采购状态为未提交/撤回/审批驳回；满足保存条件；未保存须先提示保存
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  <p><strong>九、采购状态机（购买记录行级）</strong></p>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, margin: '8px 0 12px' }}>
                    <thead>
                      <tr style={{ background: '#f8fafc' }}>
                        <th style={{ border: '1px solid #e2e8f0', padding: '8px 10px' }}>状态</th>
                        <th style={{ border: '1px solid #e2e8f0', padding: '8px 10px' }}>可否再次提交</th>
                        <th style={{ border: '1px solid #e2e8f0', padding: '8px 10px' }}>写入方</th>
                        <th style={{ border: '1px solid #e2e8f0', padding: '8px 10px' }}>UI 约束</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr><td style={{ border: '1px solid #e2e8f0', padding: '8px 10px' }}>未提交</td><td style={{ border: '1px solid #e2e8f0', padding: '8px 10px' }}>可以</td><td style={{ border: '1px solid #e2e8f0', padding: '8px 10px' }}>默认</td><td style={{ border: '1px solid #e2e8f0', padding: '8px 10px' }}>—</td></tr>
                      <tr><td style={{ border: '1px solid #e2e8f0', padding: '8px 10px' }}>审批中</td><td style={{ border: '1px solid #e2e8f0', padding: '8px 10px' }}><strong>不可以</strong></td><td style={{ border: '1px solid #e2e8f0', padding: '8px 10px' }}>本页提交</td><td style={{ border: '1px solid #e2e8f0', padding: '8px 10px' }}>多选框禁用</td></tr>
                      <tr><td style={{ border: '1px solid #e2e8f0', padding: '8px 10px' }}>审批通过</td><td style={{ border: '1px solid #e2e8f0', padding: '8px 10px' }}><strong>不可以</strong></td><td style={{ border: '1px solid #e2e8f0', padding: '8px 10px' }}>审批中心回写</td><td style={{ border: '1px solid #e2e8f0', padding: '8px 10px' }}>多选框禁用</td></tr>
                      <tr><td style={{ border: '1px solid #e2e8f0', padding: '8px 10px' }}>撤回 / 审批驳回</td><td style={{ border: '1px solid #e2e8f0', padding: '8px 10px' }}>可以</td><td style={{ border: '1px solid #e2e8f0', padding: '8px 10px' }}>审批中心回写</td><td style={{ border: '1px solid #e2e8f0', padding: '8px 10px' }}>—</td></tr>
                    </tbody>
                  </table>
                  <p style={{ margin: '4px 0 14px', color: '#64748b', fontSize: 12 }}>
                    当前审批人由审批流回写，允许为空；本页不提供审批/撤回/驳回操作。
                  </p>

                  <p><strong>十、预警与一键生成</strong></p>
                  <ul style={{ paddingLeft: 20, margin: '6px 0 14px' }}>
                    <li><strong>台账 KPI：</strong>险种临期 = 任一类险种 30 天内到期；核心逾期 = 交强或商业已过期；临期弹窗展示比价采购状态标签。</li>
                    <li><strong>一键生成比价单：</strong>从临期/逾期预警勾选险种带入购买记录；自动填备注；附件须用户补传；跳过已有审批中/审批通过的同车同险种记录。</li>
                    <li><strong>比价看板：</strong>临期阈值 3 天；点击看板卡片即时筛选列表，无需二次点查询。</li>
                  </ul>

                  <p><strong>十一、验收标准（研发自测 + 产品验收）</strong></p>
                  <ol style={{ paddingLeft: 20, margin: '6px 0 0' }}>
                    <li>五类险种表格在保单号右侧正确展示保险状态；复驶后显示「正常」。</li>
                    <li>停保/复驶/退保办理后，操作历史可预览与下载对应附件。</li>
                    <li>停保/复驶/退保 OCR 仅展示约定字段，确认后按保单号匹配台账并正确更新到期日与状态。</li>
                    <li>保单 OCR 确认页不展示险种明细表；手工编辑路径仍保留明细能力。</li>
                    <li>交强+商业均有效时车辆保险状态正常/临期，与车辆管理交车规则一致。</li>
                    <li>比价单保存/提交校验按第八节执行；审批中/通过行不可重复勾选提交。</li>
                    <li>比价单管理看板「全部/临期/超期」点击后列表筛选结果正确，可与创建时间/车牌叠加。</li>
                    <li>审批通过后比价单数据不自动写入保单台账；须通过保单管理独立录入。</li>
                  </ol>
                </div>
              ),
            },
            {
              key: 'manual',
              label: '操作手册',
              children: (
                <div style={{ fontSize: 13, color: '#334155', lineHeight: 1.75, maxHeight: '62vh', overflowY: 'auto', paddingRight: 4 }}>
                  <Alert
                    type="success"
                    showIcon
                    style={{ marginBottom: 14, borderRadius: 10 }}
                    message="比价单全流程（简版）"
                    description="创建 → 报价 → 保存 → 勾选提交 → 跟踪审批。约 5 分钟可完成一单。"
                  />
                  <Table
                    size="small"
                    pagination={false}
                    bordered
                    style={{ marginBottom: 14 }}
                    columns={[
                      { title: '步骤', dataIndex: 'step', width: 56 },
                      { title: '操作', dataIndex: 'action' },
                      { title: '要点', dataIndex: 'tip', width: 200 },
                    ]}
                    dataSource={[
                      { key: '1', step: '①', action: '进入编辑器', tip: '比价单管理 → 新建/编辑；或临期预警 → 一键生成' },
                      { key: '2', step: '②', action: '添加购买记录', tip: '新增一行 / 批量选车；选车牌或 VIN + 险种' },
                      { key: '3', step: '③', action: '录入报价', tip: '报价情况 → 新增 → 设为最终比价结果' },
                      { key: '4', step: '④', action: '填最晚付费日', tip: '每行必选；临期≤3天、超期有标签提醒' },
                      { key: '5', step: '⑤', action: '保存比价单', tip: '备注 + 至少 1 个附件（必填）' },
                      { key: '6', step: '⑥', action: '提交采购', tip: '勾选行 → 提交采购申请；未保存会先提示保存' },
                      { key: '7', step: '⑦', action: '跟踪结果', tip: '列表看统计；审批在审批中心，本页看状态' },
                    ]}
                  />
                  <p><strong>提交前自查（勾选行须全部满足）</strong></p>
                  <ul style={{ paddingLeft: 20, margin: '4px 0 12px' }}>
                    <li>已设最终比价结果</li>
                    <li>已填最晚付费日期</li>
                    <li>采购状态为「未提交 / 撤回 / 审批驳回」（审批中、审批通过不可选）</li>
                    <li>比价单已填备注并上传附件</li>
                  </ul>
                  <p><strong>金额栏</strong></p>
                  <ul style={{ paddingLeft: 20, margin: '4px 0 12px' }}>
                    <li>左：<strong>当前保单总金额</strong> — 全单已确认报价合计</li>
                    <li>右：<strong>已选保单总金额</strong> — 勾选待提交行合计</li>
                  </ul>
                  <p><strong>常见情况</strong></p>
                  <ul style={{ paddingLeft: 20, margin: '4px 0 0' }}>
                    <li>一键生成后须补报价、附件，再保存提交。</li>
                    <li>撤回/驳回后：重新勾选该行 → 再次提交采购申请。</li>
                    <li>比价单管理列表可筛创建时间/车牌，查看临期/超期看板。</li>
                  </ul>
                </div>
              ),
            },
          ]}
        />
      </Modal>

      <Modal
        className="lc-compare-mgmt-modal"
        open={compareMgmtOpen}
        title="比价单管理"
        width={1080}
        centered
        footer={null}
        onCancel={() => setCompareMgmtOpen(false)}
      >
        <div className="lc-compare-mgmt-filter">
          {renderFilterField('创建时间', (
            <DatePicker.RangePicker
              style={{ width: '100%' }}
              value={compareMgmtFilters.createdRange}
              onChange={(range) => setCompareMgmtFilters((prev) => ({ ...prev, createdRange: range }))}
              placeholder={['开始日期', '结束日期']}
              allowClear
            />
          ))}
          {renderFilterField('车牌号', (
            <Input
              placeholder="支持模糊匹配，含暂无车牌车辆 VIN"
              allowClear
              value={compareMgmtFilters.plateNo}
              onChange={(e) => setCompareMgmtFilters((prev) => ({ ...prev, plateNo: e.target.value }))}
              onPressEnter={handleCompareMgmtQuery}
              style={{ borderRadius: 8 }}
            />
          ))}
        </div>
        <div className="lc-filter-actions" style={{ marginTop: 0, paddingTop: 0, borderTop: 'none', marginBottom: 14 }}>
          <Button onClick={handleCompareMgmtReset}>重置</Button>
          <Button type="primary" onClick={handleCompareMgmtQuery}>查询</Button>
        </div>
        <div className="lc-compare-pay-alert-row">
          <div
            role="button"
            tabIndex={0}
            className={`lc-compare-pay-alert lc-compare-pay-alert--all${appliedCompareMgmtFilters.payAlertFilter === 'all' ? ' lc-compare-pay-alert--active' : ''}`}
            onClick={() => handleCompareMgmtPayAlertFilter('all')}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleCompareMgmtPayAlertFilter('all');
              }
            }}
          >
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#334155' }}>全部比价单</div>
              <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>显示符合筛选条件的全部批次</div>
            </div>
            <span className="lc-compare-pay-alert-val">{compareMgmtPayAlerts.total}</span>
          </div>
          <div
            role="button"
            tabIndex={0}
            className={`lc-compare-pay-alert lc-compare-pay-alert--warning${appliedCompareMgmtFilters.payAlertFilter === 'warning' ? ' lc-compare-pay-alert--active' : ''}`}
            onClick={() => handleCompareMgmtPayAlertFilter('warning')}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleCompareMgmtPayAlertFilter('warning');
              }
            }}
          >
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#9a3412' }}>最晚付费临期</div>
              <div style={{ fontSize: 11, color: '#c2410c', marginTop: 2 }}>含临期购买记录的比价单（≤ {LATEST_PAY_WARN_DAYS} 天）</div>
            </div>
            <span className="lc-compare-pay-alert-val">{compareMgmtPayAlerts.warning}</span>
          </div>
          <div
            role="button"
            tabIndex={0}
            className={`lc-compare-pay-alert lc-compare-pay-alert--overdue${appliedCompareMgmtFilters.payAlertFilter === 'overdue' ? ' lc-compare-pay-alert--active' : ''}`}
            onClick={() => handleCompareMgmtPayAlertFilter('overdue')}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleCompareMgmtPayAlertFilter('overdue');
              }
            }}
          >
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#991b1b' }}>最晚付费超期</div>
              <div style={{ fontSize: 11, color: '#b91c1c', marginTop: 2 }}>含超期购买记录的比价单</div>
            </div>
            <span className="lc-compare-pay-alert-val">{compareMgmtPayAlerts.overdue}</span>
          </div>
        </div>
        <div className="lc-compare-mgmt-toolbar">
          <span style={{ fontSize: 13, color: '#64748b' }}>
            共 <strong style={{ color: '#0f172a' }}>{filteredCompareSheets.length}</strong> 条比价单
          </span>
          <Button
            type="primary"
            style={{ fontWeight: 600, background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', border: 'none', borderRadius: 8 }}
            onClick={() => openCompareEditor(null)}
          >
            新建比价单
          </Button>
        </div>
        <Table
          className="lc-compare-mgmt-table"
          size="middle"
          rowKey="id"
          dataSource={filteredCompareSheets}
          pagination={{ pageSize: 8, showSizeChanger: false, showTotal: (t) => `共 ${t} 条` }}
          scroll={{ x: 1040 }}
          locale={{ emptyText: '暂无比价单，请点击「新建比价单」' }}
          columns={[
            {
              title: '创建日期',
              dataIndex: 'createdAt',
              key: 'createdAt',
              width: 168,
              render: (val) => <span style={{ fontVariantNumeric: 'tabular-nums' }}>{val || '—'}</span>,
            },
            {
              title: '创建人',
              dataIndex: 'createdBy',
              key: 'createdBy',
              width: 96,
              render: (val) => val || '—',
            },
            {
              title: '总车辆',
              dataIndex: 'totalVehicles',
              key: 'totalVehicles',
              width: 88,
              align: 'center',
              render: (val) => <span className="lc-compare-mgmt-count">{val ?? 0}</span>,
            },
            {
              title: '保险数量',
              dataIndex: 'insuranceCount',
              key: 'insuranceCount',
              width: 96,
              align: 'center',
              render: (val) => <span className="lc-compare-mgmt-count">{val ?? 0}</span>,
            },
            {
              title: '附件',
              key: 'attachments',
              width: 72,
              align: 'center',
              render: (_, record) => {
                const n = record.attachments?.length || 0;
                return n > 0 ? (
                  <Tooltip title={record.attachments.map((a) => a.name).join('、')}>
                    <Tag color="blue" style={{ margin: 0, fontWeight: 600 }}>{n}</Tag>
                  </Tooltip>
                ) : (
                  <span style={{ color: '#94a3b8' }}>—</span>
                );
              },
            },
            {
              title: '已提交采购数量',
              dataIndex: 'submittedProcurementCount',
              key: 'submittedProcurementCount',
              width: 128,
              align: 'center',
              render: (val) => (
                <Tag color={val > 0 ? 'processing' : 'default'} style={{ margin: 0, fontWeight: 600 }}>
                  {val ?? 0}
                </Tag>
              ),
            },
            {
              title: '审批通过数量',
              dataIndex: 'approvedCount',
              key: 'approvedCount',
              width: 120,
              align: 'center',
              render: (val) => (
                <Tag color={val > 0 ? 'success' : 'default'} style={{ margin: 0, fontWeight: 600 }}>
                  {val ?? 0}
                </Tag>
              ),
            },
            {
              title: '操作',
              key: 'action',
              width: 120,
              fixed: 'right',
              render: (_, record) => (
                <Space size={4}>
                  <Button type="link" size="small" style={{ padding: 0, fontWeight: 600, color: '#10b981' }} onClick={() => openCompareEditor(record)}>
                    编辑
                  </Button>
                  <Button type="link" size="small" danger style={{ padding: 0, fontWeight: 600 }} onClick={() => handleDeleteCompareSheet(record)}>
                    删除
                  </Button>
                </Space>
              ),
            },
          ]}
        />
      </Modal>

      <Modal
        className="lc-compare-modal"
        open={compareModalOpen}
        title={editingCompareSheetId ? '编辑比价单' : '新建比价单'}
        width="96vw"
        centered
        destroyOnClose
        onCancel={() => {
          setCompareModalOpen(false);
          setEditingCompareSheetId(null);
        }}
        footer={(
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
            <span className="lc-compare-procurement-hint">
              勾选购买记录后可提交采购申请；须新增报价、设为最终比价结果并填写最晚付费日期
            </span>
            <div style={{ display: 'flex', gap: 8 }}>
              <Button onClick={() => {
                setCompareModalOpen(false);
                setEditingCompareSheetId(null);
              }}
              >
                取消
              </Button>
              <Button style={{ fontWeight: 600 }} onClick={() => handleSubmitCompareSheet({ closeModal: false })}>
                保存比价单
              </Button>
              <Button
                type="primary"
                style={{ fontWeight: 600, background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)', border: 'none' }}
                onClick={handleSubmitProcurement}
                disabled={!selectedCompareKeys.length}
              >
                提交采购申请
              </Button>
            </div>
          </div>
        )}
      >
        <div className="lc-compare-editor-filter">
          {renderFilterField('车辆', (
            <Popover
              open={compareVehicleFilterOpen}
              onOpenChange={handleCompareVehicleFilterOpenChange}
              trigger="click"
              placement="bottomLeft"
              overlayClassName="lc-multi-plate-popover"
              content={(
                <div className="lc-multi-plate-pop">
                  <div className="lc-multi-plate-pop-hint">
                    支持多辆车车牌号、车辆识别代码，每行一条；可从 Excel 等批量复制粘贴，点击「收起」后列表展示全部命中记录。
                  </div>
                  <Input.TextArea
                    value={compareVehicleFilterDraft}
                    onChange={(e) => setCompareVehicleFilterDraft(e.target.value)}
                    placeholder={'沪A03561F\n粤B58888F\nLB9A32A21R0LS1478'}
                    autoSize={{ minRows: 5, maxRows: 10 }}
                    style={{ borderRadius: 8, fontFamily: 'monospace', fontSize: 13 }}
                  />
                  <div className="lc-multi-plate-pop-actions">
                    <Button size="small" onClick={handleCompareVehicleFilterClear}>清空</Button>
                    <Button size="small" type="primary" onClick={handleCompareVehicleFilterApply}>收起</Button>
                  </div>
                </div>
              )}
            >
              <Input
                size="small"
                className="lc-multi-plate-trigger"
                readOnly
                allowClear={!!compareVehicleTriggerText}
                placeholder="支持多辆车车牌号、车辆识别代码，每行一条"
                value={compareVehicleTriggerText}
                onClick={() => setCompareVehicleFilterOpen(true)}
                onClear={(e) => {
                  e.stopPropagation();
                  handleCompareVehicleFilterClear();
                }}
                style={{ borderRadius: 8 }}
                suffix={(
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" style={{ pointerEvents: 'none' }}>
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                )}
              />
            </Popover>
          ))}
          <div className="lc-compare-editor-filter-check">
            <Checkbox
              checked={compareEditorFilters.latestPayWithin3Days}
              onChange={(e) => setCompareEditorFilters((prev) => ({ ...prev, latestPayWithin3Days: e.target.checked }))}
            >
              <span style={{ fontSize: 13, color: '#334155' }}>
                仅显示最晚付费日期 {LATEST_PAY_WARN_DAYS} 天内的记录
              </span>
            </Checkbox>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, alignItems: 'center' }}>
            <Button
              size="small"
              onClick={() => {
                setCompareEditorFilters({ ...DEFAULT_COMPARE_EDITOR_FILTERS });
                setCompareVehicleFilterDraft('');
                setCompareVehicleFilterOpen(false);
              }}
              disabled={!isCompareEditorFiltered}
            >
              重置筛选
            </Button>
          </div>
        </div>
        <div className="lc-alert-stats-row lc-compare-type-stats-row">
          <div
            role="button"
            tabIndex={0}
            className={`lc-compare-type-card${!compareEditorFilters.insuranceType ? ' is-active' : ''}`}
            onClick={() => setCompareEditorFilters((prev) => ({ ...prev, insuranceType: '' }))}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setCompareEditorFilters((prev) => ({ ...prev, insuranceType: '' }));
              }
            }}
          >
            <span className="lc-compare-type-card-val">{compareRows.length}</span>
            <span className="lc-compare-type-card-title">全部</span>
          </div>
          {QUOTE_INSURANCE_TYPES.map((typeLabel) => (
            <div
              key={typeLabel}
              role="button"
              tabIndex={0}
              className={`lc-compare-type-card${compareEditorFilters.insuranceType === typeLabel ? ' is-active' : ''}`}
              onClick={() => setCompareEditorFilters((prev) => ({
                ...prev,
                insuranceType: typeLabel,
              }))}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setCompareEditorFilters((prev) => ({ ...prev, insuranceType: typeLabel }));
                }
              }}
            >
              <span className="lc-compare-type-card-val">{compareEditorTypeCounts[typeLabel] ?? 0}</span>
              <span className="lc-compare-type-card-title">{typeLabel}</span>
            </div>
          ))}
        </div>
        <Alert
          type="info"
          showIcon
          style={{ marginBottom: 12, borderRadius: 8, fontSize: 12 }}
          message="比价单与保单台账独立维护；可按车牌、险种与最晚付费日筛选记录；报价情况为必填，提交采购前须新增报价并设为最终比价结果。"
        />
        <div className="lc-compare-toolbar">
          <Space wrap>
            <Button type="primary" size="small" style={{ fontWeight: 600 }} onClick={handleAddCompareRow}>新增一行</Button>
            <Button size="small" style={{ fontWeight: 600 }} onClick={handleOpenBatchAddCompareRows}>批量新增</Button>
            {selectedCompareKeys.length ? (
              <Button
                size="small"
                danger
                onClick={() => {
                  setCompareRows((prev) => prev.filter((r) => !selectedCompareKeys.includes(r.id)));
                  setSelectedCompareKeys([]);
                  message.success('已删除所选记录');
                }}
              >
                删除所选（{selectedCompareKeys.length}）
              </Button>
            ) : null}
          </Space>
          <span style={{ fontSize: 12, color: '#64748b' }}>
            {isCompareEditorFiltered ? (
              <>筛选显示 <strong style={{ color: '#0f172a' }}>{displayCompareRows.length}</strong> / {compareRows.length} 条购买记录</>
            ) : (
              <>共 {compareRows.length} 条购买记录</>
            )}
          </span>
        </div>
        <div className="lc-compare-table-wrap">
          <Table
            className="lc-compare-table"
            size="small"
            bordered={false}
            rowKey="id"
            columns={compareColumns}
            dataSource={displayCompareRows}
            pagination={false}
            scroll={{ x: 2280, y: 'calc(100vh - 480px)' }}
            tableLayout="fixed"
            rowSelection={{
              selectedRowKeys: selectedCompareKeys,
              onChange: setSelectedCompareKeys,
              columnWidth: 40,
              getCheckboxProps: (record) => ({
                disabled: isCompareProcurementSelectionDisabled(record.procurementStatus),
              }),
            }}
            locale={{ emptyText: '暂无购买记录，请点击「新增一行」或「批量新增」' }}
          />
        </div>
        <div className="lc-compare-footer">
          <div className="lc-compare-remark-field">
            <label className="lc-compare-remark-label lc-compare-field-label-required" htmlFor="lc-compare-remark">备注</label>
            <Input.TextArea
              id="lc-compare-remark"
              rows={2}
              value={compareRemark}
              onChange={(e) => setCompareRemark(e.target.value)}
              placeholder="请填写比价说明、采购要求等"
              maxLength={500}
              showCount
              style={{ borderRadius: 8 }}
            />
          </div>
          <div className="lc-compare-attach-field">
            <span className="lc-compare-attach-label lc-compare-field-label-required">附件</span>
            <span className="lc-compare-attach-hint">必填，不限制文件格式与上传数量；保存比价单时一并存储附件信息（原型仅存元数据）</span>
            <Upload
              className="lc-compare-attach-upload"
              multiple
              fileList={compareAttachmentFileList}
              beforeUpload={() => false}
              onChange={handleCompareAttachmentChange}
              itemRender={(originNode, file) => (
                <Tooltip title={`${file.name}${file.size != null ? ` · ${formatFileSize(file.size)}` : ''}`}>
                  {originNode}
                </Tooltip>
              )}
            >
              <Button type="dashed" style={{ borderRadius: 8, fontWeight: 600, width: '100%' }}>
                点击或拖拽上传附件
              </Button>
            </Upload>
          </div>
          <div className="lc-compare-total-row">
            <div className="lc-compare-total-bar">
              <span className="lc-compare-total-label">当前保单总金额</span>
              <span>
                <span className="lc-compare-total-amount">{compareSheetSummary.total.toFixed(2)}</span>
                <span className="lc-compare-total-unit">元</span>
              </span>
              <span className="lc-compare-total-hint">
                全单已确认 {compareSheetSummary.count} 项
              </span>
            </div>
            <div className="lc-compare-total-bar lc-compare-total-bar--procurement">
              <span className="lc-compare-total-label">已选保单总金额</span>
              <span>
                <span className="lc-compare-total-amount">{selectedProcurementSummary.total.toFixed(2)}</span>
                <span className="lc-compare-total-unit">元</span>
              </span>
              <span className="lc-compare-total-hint">
                已勾选 {selectedCompareKeys.length} 条 · 可提交 {selectedProcurementSummary.count} 项确认报价
              </span>
            </div>
          </div>
        </div>
      </Modal>

      <Modal
        title="批量新增购买记录"
        open={compareBatchAddOpen}
        width={480}
        centered
        destroyOnClose
        okText="确认新增"
        cancelText="取消"
        onCancel={() => {
          setCompareBatchAddOpen(false);
          setCompareBatchAddDraft('');
        }}
        onOk={handleConfirmBatchAddCompareRows}
      >
        <div style={{ fontSize: 12, color: '#64748b', marginBottom: 10, lineHeight: 1.6 }}>
          每行输入一个车牌号或车辆识别代码（VIN），确认后按行数生成购买记录并自动带出车辆信息。
          {compareEditorFilters.insuranceType ? (
            <span style={{ display: 'block', marginTop: 4, color: '#1d4ed8' }}>
              当前已选险种筛选「{compareEditorFilters.insuranceType}」，新增记录将默认使用该险种。
            </span>
          ) : null}
        </div>
        <Input.TextArea
          rows={10}
          value={compareBatchAddDraft}
          onChange={(e) => setCompareBatchAddDraft(e.target.value)}
          placeholder={'沪A03561F\n粤B58888F\nLMRKH9AC0R1004086'}
          style={{ borderRadius: 8, fontFamily: 'ui-monospace, monospace', fontSize: 13 }}
        />
        <div style={{ marginTop: 8, fontSize: 12, color: '#94a3b8' }}>
          已输入 {parseBatchVehicleLines(compareBatchAddDraft).length} 条
        </div>
      </Modal>

      <Modal
        className="lc-policy-recogn-tasks-modal"
        open={policyRecognTasksOpen}
        title="识别任务记录"
        width={1120}
        centered
        footer={null}
        onCancel={() => setPolicyRecognTasksOpen(false)}
      >
        <div className="lc-policy-recogn-tasks-filter">
          {renderFilterField('创建时间', (
            <DatePicker.RangePicker
              style={{ width: '100%' }}
              value={policyRecognTasksFilters.createdRange}
              onChange={(range) => setPolicyRecognTasksFilters((prev) => ({ ...prev, createdRange: range }))}
              placeholder={['开始日期', '结束日期']}
              allowClear
            />
          ))}
          {renderFilterField('业务类型', (
            <Select
              value={policyRecognTasksFilters.mode}
              onChange={(v) => setPolicyRecognTasksFilters((prev) => ({ ...prev, mode: v }))}
              style={{ width: '100%' }}
              options={[
                { label: '全部', value: '全部' },
                ...POLICY_OCR_MODES.map((m) => ({ label: m.label, value: m.label })),
              ]}
            />
          ))}
        </div>
        <div className="lc-filter-actions" style={{ marginTop: 0, paddingTop: 0, borderTop: 'none', marginBottom: 14 }}>
          <Button onClick={handlePolicyRecognTasksReset}>重置</Button>
          <Button type="primary" onClick={handlePolicyRecognTasksQuery}>查询</Button>
        </div>
        <div className="lc-policy-recogn-tasks-toolbar">
          <span style={{ fontSize: 13, color: '#64748b' }}>
            共 <strong style={{ color: '#0f172a' }}>{filteredPolicyRecognTasks.length}</strong> 条识别任务
          </span>
          <Button
            type="primary"
            style={{ fontWeight: 600, background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', border: 'none', borderRadius: 8 }}
            onClick={() => {
              setPolicyRecognTasksOpen(false);
              openPolicyRecogn('ocr', 'policy');
            }}
          >
            新建识别任务
          </Button>
        </div>
        <Table
          size="middle"
          rowKey="id"
          dataSource={filteredPolicyRecognTasks}
          pagination={{ pageSize: 8, showSizeChanger: false, showTotal: (t) => `共 ${t} 条` }}
          scroll={{ x: 1080 }}
          locale={{ emptyText: '暂无识别任务，请发起「保单批量识别」' }}
          columns={[
            {
              title: '创建时间',
              dataIndex: 'createdAt',
              width: 168,
              render: (val) => <span style={{ fontVariantNumeric: 'tabular-nums' }}>{val || '—'}</span>,
            },
            {
              title: '操作人',
              dataIndex: 'creator',
              width: 96,
              ellipsis: true,
            },
            {
              title: '业务类型',
              dataIndex: 'modeLabel',
              width: 96,
              render: (val) => val || '—',
            },
            {
              title: '识别成功数',
              dataIndex: 'recognSuccessCount',
              width: 96,
              align: 'center',
              render: (val) => (
                <span style={{ fontVariantNumeric: 'tabular-nums', color: '#059669', fontWeight: 600 }}>
                  {val ?? 0}
                </span>
              ),
            },
            {
              title: '识别失败数',
              dataIndex: 'recognFailCount',
              width: 96,
              align: 'center',
              render: (val) => (
                <span style={{ fontVariantNumeric: 'tabular-nums', color: val > 0 ? '#dc2626' : '#64748b', fontWeight: 600 }}>
                  {val ?? 0}
                </span>
              ),
            },
            {
              title: '识别进度',
              key: 'recognProgress',
              width: 132,
              render: (_, record) => {
                const total = record.totalFileCount || record.fileCount || 0;
                const done = record.recognDoneCount ?? (isPolicyRecognTaskRecognizing(record) ? 0 : total);
                const recognizing = isPolicyRecognTaskRecognizing(record);
                const percent = total > 0 ? Math.round((done / total) * 100) : 0;
                return (
                  <div className="lc-policy-recogn-task-progress">
                    <Progress
                      percent={percent}
                      size="small"
                      status={recognizing ? 'active' : 'success'}
                      showInfo={false}
                      strokeColor={recognizing ? '#2563eb' : '#10b981'}
                    />
                    <span className="lc-policy-recogn-task-progress-text">
                      {total > 0 ? `${done}/${total}` : '—'}
                    </span>
                  </div>
                );
              },
            },
            {
              title: '确认进度',
              key: 'confirmProgress',
              width: 96,
              align: 'center',
              render: (_, record) => (
                <span style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 600 }}>
                  {record.confirmedCount}/{record.recognSuccessCount || 0}
                </span>
              ),
            },
            {
              title: '操作',
              key: 'action',
              width: 120,
              fixed: 'right',
              render: (_, record) => {
                const recognizing = isPolicyRecognTaskRecognizing(record);
                const noSuccess = !(record.recognSuccessCount > 0);
                const disabled = recognizing || noSuccess;
                const btn = (
                  <Button
                    type="link"
                    size="small"
                    style={{ padding: 0, fontWeight: 600, color: disabled ? undefined : '#10b981' }}
                    disabled={disabled}
                    onClick={() => openPolicyRecognTaskRecord(record)}
                  >
                    确认识别结果
                  </Button>
                );
                if (recognizing) {
                  return (
                    <Tooltip title="请等待识别完成后操作">
                      <span>{btn}</span>
                    </Tooltip>
                  );
                }
                return btn;
              },
            },
          ]}
        />
      </Modal>

      <Modal
        className="lc-policy-recogn-modal"
        title={
          policyRecognPhase === 'results'
            ? (policyRecognEntry === 'import'
              ? '批量导入 · 确认'
              : `保单批量识别 · 确认${activePolicyRecognMode !== 'policy' ? `（${POLICY_RECOGN_MODE_LABEL[activePolicyRecognMode] || activePolicyRecognMode}）` : ''}`)
            : (policyRecognEntry === 'import' ? '批量导入' : '保单批量识别')
        }
        open={policyRecognOpen}
        width={policyRecognPhase === 'results' ? 1360 : 760}
        centered
        footer={null}
        onCancel={closePolicyRecogn}
        destroyOnClose
      >
        {policyRecognPhase === 'upload' ? (
          <>
            {policyRecognEntry === 'ocr' ? (
              <>
                <Alert
                  type="info"
                  showIcon
                  style={{ marginBottom: 14, borderRadius: 8 }}
                  message="自动识别车牌号、保单号并与台账匹配，无需手填车牌 / VIN / 险种（保单录入需先选择保险类型）"
                />
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 6 }}>业务类型</div>
                  <Radio.Group
                    value={policyRecognMode}
                    onChange={(e) => setPolicyRecognMode(e.target.value)}
                    style={{ display: 'flex', flexDirection: 'column', gap: 8 }}
                  >
                    {POLICY_OCR_MODES.map((m) => (
                      <Radio key={m.key} value={m.key}>
                        <span style={{ fontWeight: 600 }}>{m.label}</span>
                        <span style={{ color: '#64748b', marginLeft: 6, fontSize: 12 }}>{m.desc}</span>
                      </Radio>
                    ))}
                  </Radio.Group>
                </div>
                {policyRecognMode === 'policy' ? (
                  <div style={{ marginBottom: 12 }}>
                    {renderFilterField('保险类型', (
                      <Select
                        value={policyRecognInsuranceType}
                        onChange={setPolicyRecognInsuranceType}
                        style={{ width: '100%' }}
                        options={QUOTE_INSURANCE_TYPES.map((t) => ({ label: t, value: t }))}
                      />
                    ))}
                  </div>
                ) : null}
                <Upload.Dragger
                  className="lc-policy-ocr-upload"
                  multiple
                  accept=".pdf,.png,.jpg,.jpeg,.webp,.bmp,.gif,.tiff,.tif"
                  beforeUpload={() => false}
                  fileList={policyRecognFiles}
                  onChange={handlePolicyRecognUploadChange}
                  disabled={policyRecognPhase !== 'upload'}
                >
                  <p style={{ fontWeight: 600, color: '#334155' }}>拖拽或点击上传 PDF / 图片</p>
                  <p style={{ fontSize: 12, color: '#94a3b8' }}>不限制上传数量；上传完成后可开始识别</p>
                </Upload.Dragger>
              </>
            ) : (
              <>
                <div className="lc-policy-import-template-bar">
                  <div className="lc-policy-import-template-bar-text">
                    <div style={{ fontWeight: 700, marginBottom: 4 }}>第一步：下载新增/续保导入模板</div>
                    模板字段与「新增保单」一致；表头带 * 为必填（车牌与 VIN 至少填一项）。承保险种、保险金额、保险金额/责任免额、保险费为选填；仅用于新增/续保。
                  </div>
                  <Button
                    type="primary"
                    ghost
                    style={{ borderColor: '#10b981', color: '#059669', fontWeight: 600, flexShrink: 0 }}
                    onClick={downloadPolicyImportTemplate}
                  >
                    下载导入模板
                  </Button>
                </div>
                <Alert
                  type="success"
                  showIcon
                  style={{ marginBottom: 12, borderRadius: 8 }}
                  message="第二步：填写模板后上传 Excel 文件批量导入新增/续保保单"
                  description="支持 .csv（推荐，Excel 可直接打开编辑）、.xlsx、.xls；请按模板填写带 * 的必填项后上传，系统将校验并匹配台账，再进入核对确认。"
                />
                <Upload.Dragger
                  className="lc-policy-import-excel-upload"
                  maxCount={1}
                  accept=".csv,.xlsx,.xls"
                  beforeUpload={() => false}
                  fileList={policyRecognFiles}
                  onChange={handlePolicyImportUploadChange}
                  disabled={policyRecognPhase !== 'upload'}
                >
                  <p style={{ fontWeight: 600, color: '#334155' }}>拖拽或点击上传 Excel / CSV</p>
                  <p style={{ fontSize: 12, color: '#94a3b8' }}>单次上传一个文件；.xlsx 原型请另存为 CSV UTF-8</p>
                </Upload.Dragger>
              </>
            )}
            {policyRecognEntry === 'ocr' && policyRecognFiles.length ? (
              <div className="lc-policy-recogn-file-list">
                {policyRecognFiles.map((f) => (
                  <div key={f.uid} className="lc-policy-recogn-file-item">
                    <span className="lc-cell-ellipsis" style={{ flex: 1 }} title={f.name}>{f.name}</span>
                    {f.status === 'uploading' ? (
                      <Tag color="processing">上传中</Tag>
                    ) : (
                      <Tag color="success">已上传</Tag>
                    )}
                  </div>
                ))}
              </div>
            ) : null}
            <div className="lc-policy-recogn-actions">
              <Button onClick={closePolicyRecogn}>取消</Button>
              <Button
                type="primary"
                disabled={!policyRecognAllUploaded}
                onClick={startPolicyRecognTask}
              >
                {policyRecognEntry === 'import' ? '开始导入' : '开始识别'}
              </Button>
            </div>
          </>
        ) : null}

        {policyRecognPhase === 'recognizing' ? (
          <>
            <Alert
              showIcon
              type="info"
              message={
                policyRecognEntry === 'import'
                  ? '正在解析 Excel 导入数据，请稍候…'
                  : '正在识别，请稍后点击「保单批量识别」确认识别结果'
              }
              style={{ marginBottom: 12, borderRadius: 8 }}
            />
            <div className="lc-policy-recogn-actions">
              <Button onClick={closePolicyRecogn}>关闭</Button>
            </div>
          </>
        ) : null}

        {policyRecognPhase === 'recognized' ? (
          <>
            <Alert
              showIcon
              type="success"
              message={policyRecognEntry === 'import' ? '导入解析完成' : '识别完成'}
              description={
                policyRecognEntry === 'import'
                  ? `共解析 ${policyRecognResults.length} 条 Excel 记录，已校验车牌/VIN 与险种。请点击「处理」核对并确认写入台账。`
                  : `共识别 ${policyRecognResults.length} 个文件，已自动匹配车牌号与保单号。请点击「处理」核对并确认结果。`
              }
              style={{ marginBottom: 14, borderRadius: 8 }}
            />
            <div className="lc-policy-recogn-actions">
              <Button onClick={() => setPolicyRecognPhase('upload')}>
                {policyRecognEntry === 'import' ? '重新上传' : '返回上传'}
              </Button>
              <Button type="primary" onClick={openPolicyRecognResults}>处理</Button>
            </div>
          </>
        ) : null}

        {policyRecognPhase === 'results' ? (
          <>
            {policyRecognViewOnly ? (
              <Alert
                showIcon
                type="info"
                message="该任务已全部确认"
                description="当前为只读查看；如需修改台账请使用「新增」或重新发起识别任务。"
                style={{ marginBottom: 12, borderRadius: 8 }}
              />
            ) : (
              <Alert
                showIcon
                type="info"
                message={
                  activePolicyRecognMode === 'suspend'
                    ? '停保批单识别确认'
                    : '识别结果确认'
                }
                description={POLICY_RECOGN_CONFIRM_HINT[activePolicyRecognMode] || POLICY_RECOGN_CONFIRM_HINT.policy}
                style={{ marginBottom: 12, borderRadius: 8 }}
              />
            )}
            <Table
              className="lc-policy-recogn-picker"
              size="small"
              rowKey="id"
              dataSource={policyRecognResults}
              pagination={policyRecognResults.length > 5 ? { pageSize: 5, showSizeChanger: false } : false}
              scroll={{ x: 560 }}
              columns={policyRecognPickerColumns}
              onRow={(record) => ({
                onClick: () => selectPolicyRecognResult(record.id),
                className: [
                  record.id === policyRecognActiveResultId ? 'lc-policy-recogn-picker-row--active' : '',
                  record.confirmed ? 'lc-policy-recogn-picker-row--confirmed' : '',
                ].filter(Boolean).join(' '),
              })}
            />
            <div className="lc-policy-recogn-confirm-split">
              <div className="lc-policy-recogn-confirm-preview">
                <div className="lc-policy-recogn-confirm-preview-head">
                  保单预览 · {policyPreview?.fileName || '—'}
                </div>
                <div className="lc-policy-recogn-confirm-preview-body">
                  <div className="lc-policy-recogn-preview">
                    {policyPreview?.isImage && policyPreview.url ? (
                      <img src={policyPreview.url} alt={policyPreview.fileName} />
                    ) : (
                      <div style={{ padding: 24, textAlign: 'center', color: '#64748b' }}>
                        <div style={{ fontSize: 48, marginBottom: 12 }}>PDF</div>
                        <div style={{ fontWeight: 600, color: '#334155' }}>{policyPreview?.fileName || '暂无预览'}</div>
                        <div style={{ fontSize: 13, marginTop: 8 }}>{policyPreview?.hint}</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="lc-policy-recogn-confirm-form">
                <div className="lc-policy-recogn-confirm-form-title">
                  {activePolicyRecognMode === 'suspend' ? '确认识别内容（停保）'
                    : activePolicyRecognMode === 'resume' ? '确认识别内容（复驶）'
                      : activePolicyRecognMode === 'cancel' ? '确认识别内容（退保）'
                        : '确认识别内容'}
                </div>
                {policyRecognActiveResultId ? (
                  renderPolicyDetailForm(policyRecognConfirmDraft, setPolicyRecognConfirmDraft, {
                    showBizType: false,
                    recognConfirmMode: true,
                    bizRecognMode: activePolicyRecognMode,
                    onPlateChange: handleRecognConfirmPlateChange,
                    recognResult: policyRecognActiveResult,
                  })
                ) : (
                  <div style={{ fontSize: 13, color: '#94a3b8', padding: '24px 0', textAlign: 'center' }}>
                    请从上方列表选择一条识别记录
                  </div>
                )}
              </div>
            </div>
            <div className="lc-policy-recogn-actions">
              {!policyRecognViewOnly ? (
                <Button onClick={() => {
                  setPolicyRecognPhase('upload');
                  if (policyRecognTaskId) {
                    const synced = persistActiveRecognDraft();
                    setPolicyRecognResults(synced);
                    upsertPolicyRecognTask({
                      taskId: policyRecognTaskId,
                      entry: policyRecognEntry,
                      mode: policyRecognMode,
                      insuranceType: policyRecognInsuranceType,
                      results: synced,
                      phase: 'upload',
                    });
                  }
                }}
                >
                  返回上传
                </Button>
              ) : null}
              {!policyRecognViewOnly ? (
                <Button onClick={confirmAllPolicyRecognResults}>批量确认</Button>
              ) : null}
              {!policyRecognViewOnly ? (
                <Button
                  type="primary"
                  ghost
                  style={{ borderColor: '#10b981', color: '#059669', fontWeight: 600 }}
                  disabled={!policyRecognActiveResultId}
                  onClick={confirmCurrentPolicyRecognResult}
                >
                  确认本条
                </Button>
              ) : null}
              <Button type="primary" onClick={closePolicyRecogn}>
                {policyRecognViewOnly ? '关闭' : '完成'}
              </Button>
            </div>
          </>
        ) : null}
      </Modal>

      <Modal
        title={vehicleInsHistoryEditRecord ? `编辑保单 · ${vehicleInsHistoryEditRecord.typeLabel}` : '编辑保单'}
        open={vehicleInsHistoryEditOpen}
        width={920}
        centered
        destroyOnClose
        onCancel={() => {
          setVehicleInsHistoryEditOpen(false);
          setVehicleInsHistoryEditRecord(null);
        }}
        onOk={saveVehicleInsHistoryEdit}
        okText="保存"
        cancelText="取消"
      >
        <Alert
          type="info"
          showIcon
          style={{ marginBottom: 12, borderRadius: 8 }}
          message="可编辑保单识别/台账关键要素；保存后同步更新本车档案记录，来源为台账或识别任务时一并回写"
        />
        {renderPolicyDetailForm(vehicleInsHistoryEditDraft, setVehicleInsHistoryEditDraft)}
      </Modal>

      <Modal
        title="新增保单"
        open={policyAddOpen}
        width={920}
        centered
        destroyOnClose
        onCancel={() => {
          setPolicyAddOpen(false);
          setPolicyAddAttachmentFileList([]);
        }}
        onOk={handlePolicyAddSubmit}
        okText="保存"
        cancelText="取消"
      >
        <Alert
          type="info"
          showIcon
          style={{ marginBottom: 12, borderRadius: 8 }}
          message="仅支持录入五类险种保单；停保、复驶、退保请在列表「管理」中通过保单记录「更多」操作办理"
        />
        {renderPolicyDetailForm(policyAddDraft, setPolicyAddDraft, { showBizType: false, policyEntryMode: true })}
        <div className="lc-compare-attach-field" style={{ marginTop: 16 }}>
          <span className="lc-compare-attach-label">保单附件</span>
          <span className="lc-compare-attach-hint">支持 PDF、图片格式，可上传多份；保存时一并存入保单档案（原型仅存元数据）</span>
          <Upload
            className="lc-compare-attach-upload"
            multiple
            accept=".pdf,image/*"
            fileList={policyAddAttachmentFileList}
            beforeUpload={() => false}
            onChange={handlePolicyAddAttachmentChange}
            itemRender={(originNode, file) => (
              <Tooltip title={`${file.name}${file.size != null ? ` · ${formatFileSize(file.size)}` : ''}`}>
                {originNode}
              </Tooltip>
            )}
          >
            <Button type="dashed" style={{ borderRadius: 8, fontWeight: 600, width: '100%' }}>
              点击或拖拽上传保单附件
            </Button>
          </Upload>
        </div>
      </Modal>

      <Modal
        className="lc-expiring-warn-modal"
        title={insuranceAlertMode === 'coreExpired' ? '核心险种逾期' : '险种临期预警'}
        open={insuranceAlertOpen}
        width={1080}
        centered
        destroyOnClose
        footer={(
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
            <span style={{ fontSize: 12, color: '#64748b' }}>
              默认按商业险到期日期降序；点击表头可切换各险种升序/降序
            </span>
            <Space>
              <Button onClick={() => setInsuranceAlertOpen(false)}>关闭</Button>
              <Button type="primary" onClick={openBatchCompareTypesModal}>一键生成比价单</Button>
            </Space>
          </div>
        )}
        onCancel={() => setInsuranceAlertOpen(false)}
      >
        <div className="lc-expiring-warn-filter">
          <div className="lc-expiring-warn-filter-label">
            {insuranceAlertMode === 'coreExpired'
              ? '逾期险种筛选（交强险、商业险）'
              : '临期险种筛选（默认全选 5 类）'}
          </div>
          <Checkbox.Group
            options={(insuranceAlertMode === 'coreExpired'
              ? INSURANCE_TYPE_ITEMS.filter((item) => CORE_INSURANCE_KEYS.includes(item.key))
              : INSURANCE_TYPE_ITEMS
            ).map((item) => ({ label: item.fullLabel, value: item.key }))}
            value={insuranceAlertTypeFilter}
            onChange={(vals) => setInsuranceAlertTypeFilter(vals)}
          />
        </div>
        <div className="lc-expiring-warn-toolbar">
          <span style={{ fontSize: 13, color: '#475569' }}>
            {insuranceAlertMode === 'coreExpired' ? (
              <>
                共 <strong className="lc-compare-mgmt-count">{insuranceAlertSortedList.length}</strong> 辆核心险种逾期
                <span style={{ color: '#94a3b8', marginLeft: 8 }}>（交强险或商业险已到期，禁止交车）</span>
              </>
            ) : (
              <>
                共 <strong className="lc-compare-mgmt-count">{insuranceAlertSortedList.length}</strong> 辆存在临期记录
                <span style={{ color: '#94a3b8', marginLeft: 8 }}>（含临期 ≤ {INSURANCE_WARN_DAYS} 天及已到期）</span>
              </>
            )}
          </span>
        </div>
        <Alert
          type="info"
          showIcon
          style={{ marginBottom: 12, borderRadius: 8, fontSize: 12 }}
          message="一键生成比价单时会自动过滤审批中、审批完成的记录"
          description="临期/逾期险种下展示比价采购状态标签：审批中、驳回、撤回、审批完成；撤回或驳回后可重新生成。"
        />
        <Table
          className="lc-expiring-warn-table"
          rowKey={(record) => getVehicleLedgerKey(record)}
          size="small"
          bordered
          pagination={{ pageSize: 10, showSizeChanger: true, pageSizeOptions: ['10', '20', '50'] }}
          scroll={{ x: 940 }}
          dataSource={insuranceAlertSortedList}
          columns={insuranceAlertColumns}
          onChange={handleInsuranceAlertTableChange}
          locale={{
            emptyText: insuranceAlertMode === 'coreExpired'
              ? '当前筛选条件下暂无核心险种逾期记录'
              : '当前筛选条件下暂无临期记录',
          }}
        />
      </Modal>

      <Modal
        title="一键生成比价单"
        open={batchCompareTypesOpen}
        width={480}
        centered
        destroyOnClose
        okText="确认生成"
        cancelText="取消"
        onCancel={() => setBatchCompareTypesOpen(false)}
        onOk={handleConfirmBatchCompareSheets}
      >
        <Alert
          type="info"
          showIcon
          style={{ marginBottom: 14, borderRadius: 8 }}
          message="可多选险种；确认后将带入「新建比价单」表单。审批中、审批完成的记录将自动跳过；撤回或驳回后可重新生成。"
        />
        <div style={{ fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 8 }}>选择要生成的保险类型</div>
        <Checkbox.Group
          style={{ display: 'flex', flexDirection: 'column', gap: 10 }}
          options={(insuranceAlertMode === 'coreExpired'
            ? CORE_INSURANCE_KEYS.map((k) => INSURANCE_KEY_TO_LABEL[k])
            : QUOTE_INSURANCE_TYPES
          ).map((t) => ({ label: t, value: t }))}
          value={batchCompareTypesDraft}
          onChange={(vals) => setBatchCompareTypesDraft(vals)}
        />
      </Modal>
    </div>
  );
};

export default Component;
