import type { LucideIcon } from 'lucide-react';
import {
  Building2,
  FileText,
  Fuel,
  Link2,
  Shield,
  Truck,
  Users,
  Wallet,
} from 'lucide-react';

export type ModuleAccent = 'blue' | 'violet' | 'indigo' | 'amber' | 'teal' | 'emerald';

export interface ChainModule {
  id: string;
  step: number;
  title: string;
  subtitle: string;
  shortLabel: string;
  accent: ModuleAccent;
  icon: LucideIcon;
  roles: string[];
  start: string;
  process: string[];
  closure: string;
  outcomes?: { label: string; tone: 'ok' | 'warn' | 'danger' }[];
  prototypeHref?: string;
  prototypeLabel?: string;
}

export interface ReceiptRow {
  doc: string;
  action: string;
}

export interface GateItem {
  title: string;
  detail: string;
  tone: 'ok' | 'warn' | 'danger';
}

export const BRIEFING_META = {
  eyebrow: 'OneOS · 业财一体化汇报',
  title: '租赁 → 能源 → 采购：业财闭环怎么咬合',
  tagline: '给业务管理组主管、分管领导、财务部总经理的对齐页',
  summary:
    '业财一体化不是多建几个报表，而是把「该收/该付」和「实收/实付」用关联钉死，回写业务状态，驱动交车、开票、催款、退租结算、氢费对账、加氢站付款、保险付款与保单归档。',
  formula: '业务单据（应收/应付）  ←关联→  财务收/付款记录（实收/实付）  →  状态回写 + 动作放行',
  discipline: '无关联，不得假性结清 / 已充值 / 已付款 / 可交车；合同未签章闭环，催办不得消。',
  stats: [
    { value: '7', label: '业务链条' },
    { value: '5+3', label: '收款 / 付款单据' },
    { value: '7', label: '关键门禁' },
    { value: '4', label: '待会上拍板' },
  ],
};

export const ROLE_CARDS = [
  { role: '财务', text: '收/付款入系统、开票、付款执行、期末余额初值、财务评分' },
  { role: '业务 / 业管 / 能源 / 采购', text: '出单、对账、主动关联收付款、解释业务状态' },
  { role: '系统', text: '自动算应收、宽限逾期、账户扣充、审批后出付款任务' },
];

export const CHAIN_MODULES: ChainModule[] = [
  {
    id: 'customer',
    step: 1,
    title: '客户准入与风险',
    subtitle: 'KA/LA/SMB 宽限 · 三维评分 · 红线预警',
    shortLabel: '客户',
    accent: 'blue',
    icon: Users,
    roles: ['业务管理组', '法务', '安全', '财务'],
    start: '业管在客户管理维护分级与主数据；系统叠加法务/安全/财务三维评估。',
    process: [
      'KA 宽限 15 日 / LA 10 日 / SMB 6 日（账单自生成日起算）。',
      '法务每 3 个月法律评估；安全按违规；财务按逾期。',
      '综合分＜10 或触红线：新签可特批；在途合同预警各部门。',
    ],
    closure: '形成可签约/特批/预警/强制收车策略，供合同与账单引用。',
    outcomes: [
      { label: '标准签约', tone: 'ok' },
      { label: '新签特批', tone: 'warn' },
      { label: '高风险·可强制收车', tone: 'danger' },
    ],
    prototypeHref: '/prototypes/bfcl-customer-risk/',
    prototypeLabel: '打开业财·客户风险',
  },
  {
    id: 'contract',
    step: 2,
    title: '标准合同 → 租赁合同',
    subtitle: '合同即规则 · 一对一锁死履约要素',
    shortLabel: '签约',
    accent: 'violet',
    icon: FileText,
    roles: ['法务', '业务管理组'],
    start: '法务维护标准制式合同：风控红线、品牌车型可见条款/附件、锁定区。',
    process: [
      '创建租赁合同调取模板；改红线或新增内容 → 自动非标审批。',
      '合同编号系统唯一；提车/账单/还车/里程由本合同驱动。',
      'E 签宝双章，或线下盖章回传法务补附件。',
    ],
    closure: '签章闭环完成；未闭环则工作台催办任务常驻。',
    outcomes: [
      { label: '标准路径', tone: 'ok' },
      { label: '非标审批', tone: 'warn' },
      { label: '催办常驻', tone: 'danger' },
    ],
    prototypeHref: '/prototypes/bfcl-contract/',
    prototypeLabel: '打开业财·签约锁死',
  },
  {
    id: 'pickup',
    step: 3,
    title: '提车应收',
    subtitle: '15 日前后算法 · 付清/特批才交车',
    shortLabel: '提车',
    accent: 'indigo',
    icon: Truck,
    roles: ['业务管理组', '财务', '运维'],
    start: '合同生效后按约定提车日自动生成提车应收（租金+保证金+服务费±氢预付）。',
    process: [
      '≤15 日：剩余天租金+保证金+剩余天服务费；＞15 日：当月+下月整月+保证金+整月服务费。',
      '先开票审批后开票；后开票关联收款后开票。',
      '业务关联财务收款；实收=应收可交车，不足走特批。',
    ],
    closure: '对齐完成生成运维交车任务；无关联不得假性付清。',
    outcomes: [
      { label: '已付清可交车', tone: 'ok' },
      { label: '特批放行', tone: 'warn' },
      { label: '未对齐拦截', tone: 'danger' },
    ],
    prototypeHref: '/prototypes/bfcl-pickup-receivable/',
    prototypeLabel: '打开业财·提车应收',
  },
  {
    id: 'bill',
    step: 4,
    title: '租赁账单',
    subtitle: '交车起算 · 25 日生成 · 宽限逾期',
    shortLabel: '账单',
    accent: 'amber',
    icon: Building2,
    roles: ['业务管理组', '财务', '安全', '运维'],
    start: '运维交车成功后按实际交车时间起算租期账单。',
    process: [
      '12:00 后首日半天；首期至月底；二期起自然月，每月 25 日生成并通知。',
      '按客户 KA/LA/SMB 宽限判逾期；附加费可滚下期；里程可减免。',
      '业务关联收款，回写账单实收状态；埋点推算期末余额。',
    ],
    closure: '账单实收闭环；逾期可联动催款。',
    outcomes: [
      { label: '已结清', tone: 'ok' },
      { label: '部分收款', tone: 'warn' },
      { label: '逾期', tone: 'danger' },
    ],
    prototypeHref: '/prototypes/bfcl-lease-bill/',
    prototypeLabel: '打开业财·租赁账单',
  },
  {
    id: 'return',
    step: 5,
    title: '还车应结',
    subtitle: 'E签宝退租日 · 应收/应退分走收付',
    shortLabel: '还车',
    accent: 'teal',
    icon: Link2,
    roles: ['业务管理组', '运维', '安全', '能源', '财务'],
    start: '还车成功且 E 签宝用户签字 = 实际退租日，系统汇总各组费用。',
    process: [
      '安全/运维/业务/能源四组提交费用（ETC、氢差、无忧包、违章事故等）。',
      '客户仍有应付 → 关联收款；保证金等应退 → 关联付款。',
    ],
    closure: '收或付关联完成，还车应结闭环。',
    outcomes: [
      { label: '已闭环', tone: 'ok' },
      { label: '应退客户', tone: 'warn' },
      { label: '客户应付未收', tone: 'danger' },
    ],
    prototypeHref: '/prototypes/bfcl-return/',
    prototypeLabel: '打开业财·还车应结',
  },
  {
    id: 'energy',
    step: 6,
    title: '能源账户与氢费',
    subtitle: '预付入账 · 核对后扣费 · 双边对账',
    shortLabel: '能源',
    accent: 'emerald',
    icon: Fuel,
    roles: ['能源部', '业务', '财务', '采购'],
    start: '合同氢气预付或独立充值单；客户按项目持有能源账户。',
    process: [
      '关联收款后入账；无项目账户则自动建户。',
      '加氢/充电仅「已核对」后扣账户（核对 ≠ 对账）。',
      '客户月结对账单关联收款；加氢站对账单关联付款明细。',
    ],
    closure: '充值/扣费/客户收款/加氢站付款各自闭环。',
    outcomes: [
      { label: '已入账/已付清', tone: 'ok' },
      { label: '未核对不扣费', tone: 'warn' },
      { label: '无关联不充值', tone: 'danger' },
    ],
    prototypeHref: '/prototypes/bfcl-energy/',
    prototypeLabel: '打开业财·能源氢费',
  },
  {
    id: 'insurance',
    step: 7,
    title: '保险采购',
    subtitle: '供应商账户 → 比价付款 → 批量保单',
    shortLabel: '保险',
    accent: 'violet',
    icon: Shield,
    roles: ['采购部', '财务', '运维', '安全'],
    start: '保险公司等主体须在供应商管理维护收款账户。',
    process: [
      '比价审批通过 → 自动生成保险付款任务（带打款信息）。',
      '财务付款后关联保险付款单闭环。',
      '闭环后方可批量上传保单，自动识别，一车多保。',
    ],
    closure: '付款闭环 + 保单归档回写资产保险状态。',
    outcomes: [
      { label: '保单已归档', tone: 'ok' },
      { label: '待付款', tone: 'warn' },
      { label: '账户不全阻断', tone: 'danger' },
    ],
    prototypeHref: '/prototypes/bfcl-insurance/',
    prototypeLabel: '打开业财·保险采购',
  },
];

export const FINANCE_HUB: ChainModule = {
  id: 'payment',
  step: 0,
  title: '财务中枢 · 收付款关联',
  subtitle: '所有资金闭环的交汇点',
  shortLabel: '财务',
  accent: 'blue',
  icon: Wallet,
  roles: ['财务', '业务', '能源', '采购'],
  start: '客户打款 / 公司出账后，财务导入或上传收付款记录。',
  process: [
    '条线人员按单据类型认领、关联、核销。',
    '系统回写业务单据：付清/部分/未收、已付款、账户余额、可否交车、可否上传保单。',
  ],
  closure: '业务状态与资金痕迹一致；禁止无关联假性结清。',
  outcomes: [
    { label: '已闭环', tone: 'ok' },
    { label: '部分关联', tone: 'warn' },
    { label: '未关联拦截', tone: 'danger' },
  ],
  prototypeHref: '/prototypes/bfcl-payment-hub/',
  prototypeLabel: '打开业财·收付款中枢',
};

export const RECEIPT_ROWS: ReceiptRow[] = [
  { doc: '提车应收款', action: '关联收款；付清可交车' },
  { doc: '租赁账单', action: '关联收款；更新账单状态' },
  { doc: '还车应结（应收）', action: '关联收款' },
  { doc: '能源充值 / 氢气预付款', action: '关联收款 → 自动充入能源账户' },
  { doc: '客户氢费对账单', action: '能源关联收款 → 已付清/部分/未收' },
];

export const PAYMENT_ROWS: ReceiptRow[] = [
  { doc: '还车应结（应退）', action: '退款申请 → 付款记录关联' },
  { doc: '加氢站对账单', action: '付款明细关联 → 已付款' },
  { doc: '保险付款单', action: '付款记录关联 → 闭环后上传保单' },
];

export const GATES: GateItem[] = [
  { title: '交车', detail: '提车应收关联收款且实收=应收，或特批通过。', tone: 'danger' },
  { title: '签约', detail: '改风控红线或新增内容必须非标；编号唯一；合同锁死履约要素。', tone: 'warn' },
  { title: '签章', detail: 'E签宝或线下法务补附件；未闭环催办常驻。', tone: 'warn' },
  { title: '能源入账', detail: '无收款关联不充值；无账户则自动建户后再充。', tone: 'danger' },
  { title: '能源扣费', detail: '仅已核对加氢/氢费明细后扣账户。', tone: 'warn' },
  { title: '保单归档', detail: '保险付款单闭环后才可批量上传并一车多保。', tone: 'danger' },
  { title: '自动付款任务', detail: '供应商账户不全禁止或标红阻断自动出付款任务。', tone: 'danger' },
];

export const DECISIONS = [
  'ETC 卡/设备损坏：还车检查归业管还是运维',
  '广告损坏丢失：能否定固定价格表',
  '风险触红线后强制收车：标准合同条款与最终解释权',
  '合同编号唯一：历史重复怎么治、新号怎么发',
];

export const PIPELINE = [
  '客户风险',
  '签约锁死',
  '提车应收',
  '租赁账单',
  '还车应结',
  '能源氢费',
  '保险采购',
];
