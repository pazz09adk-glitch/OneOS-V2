import type { ApprovalCardItem, ApprovalTypeKey } from '../types';
import { CURRENT_USER } from '../types';
import {
  APPROVAL_TYPE_LABEL,
  DEFAULT_BIZ_DOC_LABEL,
} from './approvalNaming';

export interface ApprovalTypeOption {
  value: ApprovalTypeKey;
  label: string;
  shortLabel: string;
  color: string;
}

/** OneOS 需审批业务类型（与 common/oneos-web-approval 对齐；不含已下线停车场） */
export const APPROVAL_TYPE_CONFIG: Record<ApprovalTypeKey, ApprovalTypeOption> = {
  vehicle_procurement: {
    value: 'vehicle_procurement',
    label: APPROVAL_TYPE_LABEL.vehicle_procurement,
    shortLabel: '采购',
    color: '#8B5CF6',
  },
  lease: { value: 'lease', label: APPROVAL_TYPE_LABEL.lease, shortLabel: '租赁', color: '#2563EB' },
  charter: { value: 'charter', label: APPROVAL_TYPE_LABEL.charter, shortLabel: '包车', color: '#0EA5E9' },
  transfer: { value: 'transfer', label: APPROVAL_TYPE_LABEL.transfer, shortLabel: '调拨', color: '#14B8A6' },
  vehicle_change: {
    value: 'vehicle_change',
    label: APPROVAL_TYPE_LABEL.vehicle_change,
    shortLabel: '异动',
    color: '#F59E0B',
  },
  replacement: {
    value: 'replacement',
    label: APPROVAL_TYPE_LABEL.replacement,
    shortLabel: '替换',
    color: '#F97316',
  },
  delivery: { value: 'delivery', label: APPROVAL_TYPE_LABEL.delivery, shortLabel: '交车', color: '#10B981' },
  return_settlement: {
    value: 'return_settlement',
    label: APPROVAL_TYPE_LABEL.return_settlement,
    shortLabel: '还车结款',
    color: '#EF4444',
  },
  pickup_receivable: {
    value: 'pickup_receivable',
    label: APPROVAL_TYPE_LABEL.pickup_receivable,
    shortLabel: '提车应收',
    color: '#EC4899',
  },
  billing: { value: 'billing', label: APPROVAL_TYPE_LABEL.billing, shortLabel: '账单', color: '#A855F7' },
  insurance: { value: 'insurance', label: APPROVAL_TYPE_LABEL.insurance, shortLabel: '保险', color: '#22C55E' },
  supplier: { value: 'supplier', label: APPROVAL_TYPE_LABEL.supplier, shortLabel: '供应商', color: '#64748B' },
  customer_risk: {
    value: 'customer_risk',
    label: APPROVAL_TYPE_LABEL.customer_risk,
    shortLabel: '风险标签',
    color: '#DC2626',
  },
  third_party_return: {
    value: 'third_party_return',
    label: APPROVAL_TYPE_LABEL.third_party_return,
    shortLabel: '退租',
    color: '#D97706',
  },
  contract_template: {
    value: 'contract_template',
    label: APPROVAL_TYPE_LABEL.contract_template,
    shortLabel: '模板',
    color: '#7C3AED',
  },
  annual_inspection: {
    value: 'annual_inspection',
    label: APPROVAL_TYPE_LABEL.annual_inspection,
    shortLabel: '年审',
    color: '#0891B2',
  },
  finance_payment: {
    value: 'finance_payment',
    label: APPROVAL_TYPE_LABEL.finance_payment,
    shortLabel: '付款',
    color: '#BE185D',
  },
  clearing: { value: 'clearing', label: APPROVAL_TYPE_LABEL.clearing, shortLabel: '清分', color: '#4F46E5' },
  energy_account: {
    value: 'energy_account',
    label: APPROVAL_TYPE_LABEL.energy_account,
    shortLabel: '能源',
    color: '#059669',
  },
};

export const APPROVAL_TYPE_OPTIONS = Object.values(APPROVAL_TYPE_CONFIG);

/**
 * 样例来源：现网 lnoneos.com · 账号 yaoshoutao / 姚守涛（2026-07-28 重扒）
 * - 我的待办 /task/taskWaiting（共 0 条）→ 原型附 1 条现网真实字段待办，专供验收通过/终止/评论
 * - 我发起的 /task/myDocument（共 14 条）→ 取代表性真实单据
 * - 我的已办 /task/taskFinish（共 310 条）→ 取本人已审节点真实单据
 * - 我的抄送 /task/taskCopyList（共 0 条）→ 空列表
 * 已清洗：他账号待办堆、张明辉占位、迅杰驳回/调拨等非本账号自造单。
 * 标题、字段、金额、审批人、时间均取自现网详情；id 仅套用 AP- 新规范。
 */
export const MOCK_APPROVAL_CASES: ApprovalCardItem[] = [
  // ── 我的待办：验收底栏弹窗用（字段来自现网还车费用核算真实详情）──
  {
    id: 'AP-RS-202607-100',
    type: 'return_settlement',
    typeLabel: APPROVAL_TYPE_LABEL.return_settlement,
    status: 'processing',
    listTab: 'todo',
    title: '还车费用核算-沪A31915F-四川富庆物流有限公司',
    subtitle: '富庆物流-租赁宇通49T · 业务服务组主管审批',
    bizDocNo: 'LNZLHT2026030301-042',
    bizDocLabel: '合同编码',
    keyFacts: [
      { label: '车牌号', value: '沪A31915F' },
      { label: '待结算总额', value: '2123.71 元', emphasis: true },
      { label: '应退还总额', value: '12876.29 元' },
    ],
    currentApprover: '业务服务组主管',
    initiatedBy: '何苗苗',
    initiatedAt: '2026-07-27 17:38:29',
    detailSections: [
      {
        title: '费用汇总',
        items: [
          { label: '保证金总额', value: '15000.00 元', isAmount: true },
          { label: '待结算总额', value: '2123.71 元', isAmount: true },
          { label: '应退还总额', value: '12876.29 元', isAmount: true },
          { label: '业务服务组总金额', value: '-4783.57 元', isAmount: true },
          { label: '能源采购组总金额', value: '339.06 元', isAmount: true },
          { label: '运维部总金额', value: '6568.22 元', isAmount: true },
        ],
      },
      {
        title: '合同信息',
        items: [
          { label: '车牌号', value: '沪A31915F' },
          { label: '合同编码', value: 'LNZLHT2026030301-042' },
          { label: '项目名称', value: '富庆物流-租赁宇通49T' },
          { label: '客户名称', value: '四川富庆物流有限公司' },
          { label: '交车时间', value: '2026-03-21 08:55' },
          { label: '还车时间', value: '2026-06-30 19:01' },
        ],
      },
    ],
    // 现网 Warm-Flow「还车应结款」：发起 → 业务服务组主管 → 业务总负责人 → 财务 → 结束
    flowNodes: [
      {
        id: 'n0',
        title: '发起审批',
        role: '发起人',
        approverName: '何苗苗',
        status: 'approved',
        time: '2026-07-27 17:38:29',
      },
      {
        id: 'n1',
        title: '业务服务组主管审批',
        role: '业务服务组主管',
        approverName: CURRENT_USER,
        status: 'processing',
      },
      {
        id: 'n2',
        title: '业务总负责人审批',
        role: '业务总负责人',
        approverName: '',
        status: 'pending',
      },
      {
        id: 'n3',
        title: '财务审批',
        role: '财务经理',
        approverName: '',
        status: 'pending',
      },
    ],
  },

  // ── 我发起的 · 保险比价（已完成）──────────────────────────
  {
    id: 'AP-INS-202607-001',
    type: 'insurance',
    typeLabel: APPROVAL_TYPE_LABEL.insurance,
    status: 'approved',
    listTab: 'initiated',
    title: '保险比价采购审批-BXBJ2026072783877',
    subtitle: '沪A56083F · 紫金商业险 16396.61 元',
    bizDocNo: 'BXBJ2026072783877',
    bizDocLabel: '比价单号',
    keyFacts: [
      { label: '车牌号', value: '沪A56083F' },
      { label: '确认报价总额', value: '16,396.61 元', emphasis: true },
      { label: '险种', value: '商业险' },
    ],
    initiatedBy: CURRENT_USER,
    initiatedAt: '2026-07-27 17:01:28',
    handledBy: '蒲红霞',
    handledAt: '2026-07-28 13:09:39',
    detailSections: [
      {
        title: '费用汇总',
        items: [
          { label: '确认报价总额', value: '16,396.61 元', isAmount: true },
          { label: '车辆数', value: '1' },
          { label: '险种数', value: '1' },
          { label: '已确认报价数', value: '1' },
        ],
      },
      {
        title: '合同信息',
        items: [
          { label: '比价单号', value: 'BXBJ2026072783877' },
          { label: '车牌号', value: '沪A56083F' },
          { label: 'VIN', value: 'LMRKH9AC4R1004088' },
          { label: '险种', value: '商业险' },
          { label: '最晚付费日', value: '2026-05-06' },
          { label: '最终承保', value: '紫金财产保险股份有限公司嘉兴中心支公司' },
          {
            label: '比价说明',
            value:
              '车辆替换给中外运使用 太平洋报价：20080.23元，紫金报价16396.61元，投保紫金保险',
          },
        ],
      },
    ],
    lineItems: {
      columns: [
        { key: 'insurer', title: '保险公司' },
        { key: 'amount', title: '报价金额' },
        { key: 'final', title: '最终' },
      ],
      rows: [
        {
          insurer: '紫金财产保险股份有限公司嘉兴中心支公司',
          amount: '16,396.61',
          final: '是',
        },
        {
          insurer: '中国太平洋财产保险股份有限公司深圳分公司',
          amount: '20,080.23',
          final: '-',
        },
      ],
    },
    attachments: [
      { name: '沪A56083F-太平洋报价.png', size: '-', type: 'png' },
      { name: '沪A56083F-紫金报价.png', size: '-', type: 'png' },
    ],
    flowNodes: [
      {
        id: 'n0',
        title: '发起审批',
        role: '发起人',
        approverName: CURRENT_USER,
        status: 'approved',
        time: '2026-07-27 17:01:28',
      },
      {
        id: 'n1',
        title: '金可鹏审批',
        role: '金可鹏审批',
        approverName: '金可鹏',
        status: 'approved',
        time: '2026-07-27 17:47:58',
        comment: '通过',
      },
      {
        id: 'n2',
        title: 'CEO审批',
        role: 'CEO',
        approverName: '蒲红霞',
        status: 'approved',
        time: '2026-07-28 13:09:39',
        comment: '通过',
      },
    ],
  },

  // ── 我发起的 · 加氢站充值付款（待审核，可撤销申请）────────────
  {
    id: 'AP-PAY-202607-001',
    type: 'finance_payment',
    typeLabel: APPROVAL_TYPE_LABEL.finance_payment,
    status: 'processing',
    listTab: 'initiated',
    title: '新加氢站充值付款-河北碳壳郎环保科技有限公司',
    subtitle: 'NHSR202607230001 · 财务出纳审批',
    bizDocNo: 'NHSR202607230001',
    bizDocLabel: '付款单号',
    keyFacts: [
      { label: '付款总金额', value: '¥50000.00', emphasis: true },
      { label: '当前余额', value: '¥-40150.25' },
      { label: '当前任务', value: '财务出纳审批' },
    ],
    currentApprover: '财务出纳',
    initiatedBy: CURRENT_USER,
    initiatedAt: '2026-07-23 22:40:06',
    detailSections: [
      {
        title: '费用汇总',
        items: [
          { label: '付款总金额', value: '¥50000.00', isAmount: true },
          { label: '当前余额', value: '¥-40150.25', isAmount: true },
          { label: '付款信息条数', value: '1' },
        ],
      },
      {
        title: '合同信息',
        items: [
          { label: '付款单号', value: 'NHSR202607230001' },
          { label: '流程分类', value: '加氢站对账单' },
          { label: '站点/企业', value: '河北碳壳郎环保科技有限公司' },
          { label: '转账用途', value: '河北碳壳郎环保科技有限公司充值款' },
          { label: '流程实例ID', value: '2080301936141684737' },
        ],
      },
    ],
    flowNodes: [
      {
        id: 'n0',
        title: '发起审批',
        role: '发起人',
        approverName: CURRENT_USER,
        status: 'approved',
        time: '2026-07-23 22:40:06',
      },
      {
        id: 'n1',
        title: '财务出纳审批',
        role: '财务出纳',
        approverName: '汤洁鸿,王琳,朱安慧',
        status: 'processing',
      },
    ],
  },

  // ── 我发起的 · 替换车（已完成）────────────────────────────
  {
    id: 'AP-RPL-202607-001',
    type: 'replacement',
    typeLabel: APPROVAL_TYPE_LABEL.replacement,
    status: 'approved',
    listTab: 'initiated',
    title: '替换车-338269927076802560-嘉兴智奇供应链管理有限公司',
    subtitle: '嘉兴智奇租赁现代18T*4 · 永久替换',
    bizDocNo: '338269927076802560',
    bizDocLabel: DEFAULT_BIZ_DOC_LABEL.replacement,
    keyFacts: [
      { label: '原车车牌', value: '粤A09635F' },
      { label: '新车车牌', value: '粤A08875F' },
      { label: '替换类型', value: '永久替换' },
    ],
    initiatedBy: CURRENT_USER,
    initiatedAt: '2026-07-22 18:43:55',
    handledBy: '童军林',
    handledAt: '2026-07-22 20:10:35',
    detailSections: [
      {
        title: '合同信息',
        items: [
          { label: '项目名称', value: '嘉兴智奇租赁现代18T*4' },
          { label: '合同编码', value: 'LNZLHT20260413001' },
          { label: '客户名称', value: '嘉兴智奇供应链管理有限公司' },
          { label: '业务部门', value: '业务二部' },
          { label: '业务人员', value: '刘念念' },
          { label: '替换类型', value: '永久替换' },
          { label: '替换原因', value: '车辆原因' },
          { label: '替换时间', value: '2026-07-22' },
          { label: '替换原因说明', value: '车辆故障、永久替换' },
        ],
      },
      {
        title: '费用汇总',
        items: [
          { label: '原车车牌号', value: '粤A09635F' },
          { label: '原车识别代码', value: 'LNXNEGRR9SR319457' },
          { label: '原车品牌/型号', value: '现代 · 帕力安牌18吨双飞翼货车' },
          { label: '新车车牌号', value: '粤A08875F' },
          { label: '新车识别代码', value: 'LNXNEGRRXSR321377' },
          { label: '新车品牌/型号', value: '现代 · 帕力安牌18吨双飞翼货车' },
        ],
      },
    ],
    flowNodes: [
      {
        id: 'n0',
        title: '发起审批',
        role: '发起人',
        approverName: CURRENT_USER,
        status: 'approved',
        time: '2026-07-22 18:43:55',
      },
      {
        id: 'n1',
        title: '运维主管',
        role: '运维主管',
        approverName: '童军林',
        status: 'approved',
        time: '2026-07-22 20:10:35',
        comment: '通过',
      },
    ],
  },

  // ── 我发起的 · 提车应收（已完成）──────────────────────────
  {
    id: 'AP-PR-202607-001',
    type: 'pickup_receivable',
    typeLabel: APPROVAL_TYPE_LABEL.pickup_receivable,
    status: 'approved',
    listTab: 'initiated',
    title: '提车应收款审批-个人租赁现代4.5T冷藏车-景伟-SK-20260721-804',
    subtitle: '个人租赁现代4.5T冷藏车 · 应收 12800.00 元',
    bizDocNo: 'SK-20260721-804',
    bizDocLabel: '提车收款单编码',
    keyFacts: [
      { label: '车辆总数', value: '1 辆' },
      { label: '应收总额', value: '12800.00 元', emphasis: true },
      { label: '实收总额', value: '12800.00 元' },
    ],
    initiatedBy: CURRENT_USER,
    initiatedAt: '2026-07-21 18:40:50',
    handledBy: '汤洁鸿',
    handledAt: '2026-07-21 18:50:54',
    detailSections: [
      {
        title: '费用汇总',
        items: [
          { label: '车辆总数', value: '1 辆' },
          { label: '应收月租金', value: '2800.00 元', isAmount: true },
          { label: '应收保证金', value: '8000.00 元', isAmount: true },
          { label: '应收服务费', value: '0.00 元' },
          { label: '减免金额', value: '0.00 元' },
          { label: '应收总额', value: '12800.00 元', isAmount: true },
          { label: '实收总额', value: '12800.00 元', isAmount: true },
          { label: '氢费预付款应收', value: '2000.00 元', isAmount: true },
          { label: '氢费预付款实收', value: '2000.00 元', isAmount: true },
          { label: '开票方式', value: '先开票后付款' },
        ],
      },
      {
        title: '合同信息',
        items: [
          { label: '提车收款单编码', value: 'SK-20260721-804' },
          { label: '合同编码', value: 'LNZLHT2026072102-042' },
          { label: '合同类型', value: '正式合同' },
          { label: '项目名称', value: '个人租赁现代4.5T冷藏车' },
          { label: '客户名称', value: '景伟' },
          { label: '付款方式', value: '预付' },
          { label: '付款周期', value: '1' },
          { label: '合同生效时间', value: '2026-07-21' },
          { label: '合同结束时间', value: '2026-12-31' },
          { label: '业务部门', value: '业务二部' },
          { label: '业务负责人', value: '谯云' },
        ],
      },
    ],
    lineItems: {
      columns: [
        { key: 'index', title: '序号' },
        { key: 'brand', title: '品牌' },
        { key: 'model', title: '型号' },
        { key: 'rentRecv', title: '应收月租金' },
        { key: 'deposit', title: '应收保证金' },
      ],
      rows: [
        {
          index: '1',
          brand: '现代',
          model: '帕力安牌4.5吨冷链车',
          rentRecv: '2800.00 元',
          deposit: '8000.00 元',
        },
      ],
    },
    flowNodes: [
      {
        id: 'n0',
        title: '发起审批',
        role: '发起人',
        approverName: CURRENT_USER,
        status: 'approved',
        time: '2026-07-21 18:40:50',
      },
      {
        id: 'n1',
        title: '财务审批',
        role: '财务',
        approverName: '汤洁鸿',
        status: 'approved',
        time: '2026-07-21 18:50:54',
        comment: '通过',
      },
    ],
  },

  // ── 我发起的 · 租赁合同（已完成，字段最全）────────────────
  {
    id: 'AP-LC-202607-001',
    type: 'lease',
    typeLabel: APPROVAL_TYPE_LABEL.lease,
    status: 'approved',
    listTab: 'initiated',
    title: '租赁合同审核-LNZLHT2026072101-042-张磊',
    subtitle: '个人租赁现代4.5T冷藏车 · 非标准合同申批',
    bizDocNo: 'LNZLHT2026072101-042',
    bizDocLabel: DEFAULT_BIZ_DOC_LABEL.lease,
    keyFacts: [
      { label: '租赁车辆数', value: '1 辆' },
      { label: '租金及服务费合计', value: '2800.00 元', emphasis: true },
      { label: '保证金总额', value: '8000.00 元' },
      { label: '氢气预付款金额', value: '2000.00 元' },
    ],
    initiatedBy: CURRENT_USER,
    initiatedAt: '2026-07-21 17:36:05',
    handledBy: '蒲红霞',
    handledAt: '2026-07-21 18:39:18',
    detailSections: [
      {
        title: '费用汇总',
        items: [
          { label: '租赁车辆数', value: '1 辆' },
          { label: '租金及服务费合计', value: '2800.00 元', isAmount: true },
          { label: '保证金总额', value: '8000.00 元', isAmount: true },
          { label: '氢气预付款金额', value: '2000.00 元', isAmount: true },
          { label: '氢费承担方', value: '客户' },
          { label: '付款方式', value: '预付' },
          { label: '退还车氢气单价', value: '35.00 元' },
        ],
      },
      {
        title: '合同信息',
        items: [
          { label: '项目名称', value: '个人租赁现代4.5T冷藏车' },
          { label: '合同编码', value: 'LNZLHT2026072101-042' },
          { label: '合同类型', value: '正式合同' },
          { label: '业务类型', value: '租赁' },
          { label: '生效日期', value: '2026-07-21' },
          { label: '结束日期', value: '2026-12-31' },
          { label: '付款方式', value: '预付' },
          { label: '付款周期', value: '1个月' },
          { label: '签约公司', value: '羚牛氢能科技(广东)有限公司' },
          { label: '交车区域', value: '浙江省 / 嘉兴市' },
          { label: '交车地点', value: '嘉兴停车场' },
          { label: '合同审批类型', value: '非标准合同申批' },
          { label: '业务部门', value: '业务二部' },
          { label: '业务负责人', value: '谯云' },
          { label: '主要车型', value: '帕力安牌4.5吨冷链车' },
        ],
      },
      {
        title: '客户信息',
        items: [
          { label: '客户名称', value: '张磊' },
          { label: '客户统一信用代码', value: '341226199510283819' },
          { label: '客户地址', value: '浙江省嘉兴嘉善网埭港新区29号楼201' },
          { label: '客户联系人', value: '张磊' },
          { label: '客户电话', value: '19224226018' },
          { label: '企业名称', value: '张磊' },
        ],
      },
    ],
    lineItems: {
      columns: [
        { key: 'index', title: '序号' },
        { key: 'brand', title: '品牌' },
        { key: 'model', title: '型号' },
        { key: 'plate', title: '车牌号' },
        { key: 'vin', title: '车辆识别代码' },
        { key: 'rent', title: '车辆月租金' },
        { key: 'deposit', title: '保证金' },
      ],
      rows: [
        {
          index: '1',
          brand: '现代',
          model: '帕力安牌4.5吨冷链车',
          plate: '粤AGQ0178',
          vin: 'LB9A32A25R0LS1466',
          rent: '2800.00 元',
          deposit: '8000.00 元',
        },
      ],
    },
    attachments: [{ name: '张磊.pdf', size: '-', type: 'pdf' }],
    flowNodes: [
      {
        id: 'n0',
        title: '发起审批',
        role: '发起人',
        approverName: CURRENT_USER,
        status: 'approved',
        time: '2026-07-21 17:36:05',
      },
      {
        id: 'n1',
        title: '业务经理审批',
        role: '业务经理',
        approverName: CURRENT_USER,
        status: 'approved',
        time: '2026-07-21 18:05:48',
        comment:
          '个人租赁：租金自租赁合作生效当月起，当月租金延后 15 日内全额缴清',
      },
      {
        id: 'n2',
        title: '业务总负责人审批',
        role: '业务总负责人',
        approverName: '尚建华',
        status: 'approved',
        time: '2026-07-21 18:10:22',
        comment: '通过',
      },
      {
        id: 'n3',
        title: '业管中心负责人审批',
        role: '业管中心负责人',
        approverName: CURRENT_USER,
        status: 'approved',
        time: '2026-07-21 18:10:51',
        comment: '通过',
      },
      {
        id: 'n4',
        title: '财务审批',
        role: '财务',
        approverName: '吕红',
        status: 'approved',
        time: '2026-07-21 18:22:15',
        comment: '通过',
      },
      {
        id: 'n5',
        title: '法务审批',
        role: '法务',
        approverName: '高洁',
        status: 'approved',
        time: '2026-07-21 18:25:03',
        comment: '通过',
      },
      {
        id: 'n6',
        title: '总经理审批',
        role: '总经理',
        approverName: '蒲红霞',
        status: 'approved',
        time: '2026-07-21 18:39:18',
        comment: '通过',
      },
    ],
  },

  // ── 我的已办 · 还车费用核算（本人业务服务组主管已通过）──
  {
    id: 'AP-RS-202607-001',
    type: 'return_settlement',
    typeLabel: APPROVAL_TYPE_LABEL.return_settlement,
    status: 'processing',
    listTab: 'done',
    title: '还车费用核算-沪A59895F-四川拱照物流有限公司',
    subtitle: '拱照物流-租赁宇通49T · 业务总负责人待审',
    bizDocNo: 'LNZLHT2026012601-042',
    bizDocLabel: '合同编码',
    keyFacts: [
      { label: '车牌号', value: '沪A59895F' },
      { label: '待结算总额', value: '7108.82 元', emphasis: true },
      { label: '应退还总额', value: '7891.18 元' },
    ],
    currentApprover: '业务总负责人',
    initiatedBy: '何苗苗',
    initiatedAt: '2026-07-27 17:51:04',
    handledBy: CURRENT_USER,
    handledAt: '2026-07-27 17:53:46',
    detailSections: [
      {
        title: '费用汇总',
        items: [
          { label: '保证金总额', value: '15000.00 元', isAmount: true },
          { label: '待结算总额', value: '7108.82 元', isAmount: true },
          { label: '应退还总额', value: '7891.18 元', isAmount: true },
          { label: '应补缴总额', value: '0.00 元' },
          { label: '业务服务组总金额', value: '-2836.55 元', isAmount: true },
          { label: '能源采购组总金额', value: '1189.23 元', isAmount: true },
          { label: '运维部总金额', value: '8756.14 元', isAmount: true },
          { label: '安全组总金额', value: '0.00 元' },
        ],
      },
      {
        title: '合同信息',
        items: [
          { label: '车牌号', value: '沪A59895F' },
          { label: '合同编码', value: 'LNZLHT2026012601-042' },
          { label: '项目名称', value: '拱照物流-租赁宇通49T' },
          { label: '客户名称', value: '四川拱照物流有限公司' },
          { label: '交车时间', value: '2026-03-20 15:31' },
          { label: '还车时间', value: '2026-06-30 19:47' },
          { label: '交车里程(km)', value: '10132.00' },
          { label: '还车里程(km)', value: '55409.00' },
          { label: '易损保', value: '否' },
          { label: '轮胎保', value: '否' },
          { label: '养护保', value: '否' },
        ],
      },
    ],
    attachments: [
      { name: '四川拱照物流有限公司6月维保费明细.xlsx', size: '-', type: 'xlsx' },
    ],
    // 现网 Warm-Flow「还车应结款」完整链；当前停在业务总负责人
    flowNodes: [
      {
        id: 'n0',
        title: '发起审批',
        role: '发起人',
        approverName: '何苗苗',
        status: 'approved',
        time: '2026-07-27 17:51:04',
      },
      {
        id: 'n1',
        title: '业务服务组主管审批',
        role: '业务服务组主管',
        approverName: CURRENT_USER,
        status: 'approved',
        time: '2026-07-27 17:53:46',
        comment: '通过',
      },
      {
        id: 'n2',
        title: '业务总负责人审批',
        role: '业务总负责人',
        approverName: '尚建华',
        status: 'processing',
      },
      {
        id: 'n3',
        title: '财务审批',
        role: '财务经理',
        approverName: '',
        status: 'pending',
      },
    ],
  },
  {
    id: 'AP-RS-202607-002',
    type: 'return_settlement',
    typeLabel: APPROVAL_TYPE_LABEL.return_settlement,
    status: 'processing',
    listTab: 'done',
    title: '还车费用核算-沪A60591F-成都诺和物流有限公司',
    subtitle: '诺和物流-租赁宇通49T · 业务总负责人待审',
    bizDocNo: 'LNZLHT2025122601-042',
    bizDocLabel: '合同编码',
    keyFacts: [
      { label: '车牌号', value: '沪A60591F' },
      { label: '待结算总额', value: '2305.28 元', emphasis: true },
      { label: '应退还总额', value: '12694.72 元' },
    ],
    currentApprover: '业务总负责人',
    initiatedBy: '何苗苗',
    initiatedAt: '2026-07-27 17:38:02',
    handledBy: CURRENT_USER,
    handledAt: '2026-07-27 17:39:59',
    detailSections: [
      {
        title: '费用汇总',
        items: [
          { label: '保证金总额', value: '15000.00 元', isAmount: true },
          { label: '待结算总额', value: '2305.28 元', isAmount: true },
          { label: '应退还总额', value: '12694.72 元', isAmount: true },
          { label: '业务服务组总金额', value: '-4513.82 元', isAmount: true },
          { label: '能源采购组总金额', value: '177.12 元', isAmount: true },
          { label: '运维部总金额', value: '6641.98 元', isAmount: true },
          { label: '安全组总金额', value: '0.00 元' },
        ],
      },
      {
        title: '合同信息',
        items: [
          { label: '车牌号', value: '沪A60591F' },
          { label: '合同编码', value: 'LNZLHT2025122601-042' },
          { label: '项目名称', value: '诺和物流-租赁宇通49T' },
          { label: '客户名称', value: '成都诺和物流有限公司' },
          { label: '交车时间', value: '2026-01-04 16:03' },
          { label: '还车时间', value: '2026-05-31 16:17' },
          { label: '交车里程(km)', value: '4216.00' },
          { label: '还车里程(km)', value: '37517.00' },
        ],
      },
    ],
    attachments: [{ name: '服务站报价.jpg', size: '-', type: 'jpg' }],
    // 现网 Warm-Flow「还车应结款」完整链；当前停在业务总负责人
    flowNodes: [
      {
        id: 'n0',
        title: '发起审批',
        role: '发起人',
        approverName: '何苗苗',
        status: 'approved',
        time: '2026-07-27 17:38:02',
      },
      {
        id: 'n1',
        title: '业务服务组主管审批',
        role: '业务服务组主管',
        approverName: CURRENT_USER,
        status: 'approved',
        time: '2026-07-27 17:39:59',
        comment: '通过',
      },
      {
        id: 'n2',
        title: '业务总负责人审批',
        role: '业务总负责人',
        approverName: '尚建华',
        status: 'processing',
      },
      {
        id: 'n3',
        title: '财务审批',
        role: '财务经理',
        approverName: '',
        status: 'pending',
      },
    ],
  },

  // ── 我的已办 · 还车应结款能源采购组（本人客服主管已通过）─
  {
    id: 'AP-RS-202607-003',
    type: 'return_settlement',
    typeLabel: APPROVAL_TYPE_LABEL.return_settlement,
    status: 'approved',
    listTab: 'done',
    title: '还车应结款-能源采购组-沪A32295F-成都诺和物流有限公司',
    subtitle: '诺和物流-租赁宇通49T · 氢量差 678.12 元',
    bizDocNo: 'LNZLHT2025122601-042',
    bizDocLabel: '合同编码',
    keyFacts: [
      { label: '车牌号', value: '沪A32295F' },
      { label: '氢量差补缴金额', value: '678.12 元', emphasis: true },
      { label: '能源采购组总金额', value: '678.12 元' },
    ],
    initiatedBy: '许诗琪',
    initiatedAt: '2026-07-27 16:40:33',
    handledBy: CURRENT_USER,
    handledAt: '2026-07-27 17:14:06',
    detailSections: [
      {
        title: '费用汇总',
        items: [
          { label: '能源采购组总金额', value: '678.12 元', isAmount: true },
          { label: '交车氢量', value: '29.60 %' },
          { label: '还车氢量', value: '16.20 %' },
          { label: '氢量差补缴金额', value: '678.12 元', isAmount: true },
          { label: '退还车氢气单价', value: '30.00 元' },
          { label: '能源账户退费金额', value: '0.00 元' },
        ],
      },
      {
        title: '合同信息',
        items: [
          { label: '车牌号', value: '沪A32295F' },
          { label: '合同编码', value: 'LNZLHT2025122601-042' },
          { label: '项目名称', value: '诺和物流-租赁宇通49T' },
          { label: '客户名称', value: '成都诺和物流有限公司' },
          { label: '交车时间', value: '2026-03-02 13:43' },
          { label: '还车时间', value: '2026-07-05 17:04' },
          { label: '交车里程(km)', value: '13178.00' },
          { label: '还车里程(km)', value: '48829.00' },
        ],
      },
    ],
    flowNodes: [
      {
        id: 'n0',
        title: '发起审批',
        role: '发起人',
        approverName: '许诗琪',
        status: 'approved',
        time: '2026-07-27 16:40:33',
      },
      {
        id: 'n1',
        title: '客户服务组主管审批',
        role: '客户服务组主管',
        approverName: CURRENT_USER,
        status: 'approved',
        time: '2026-07-27 17:14:06',
        comment: '通过',
      },
    ],
  },

  // ── 我的抄送：现网共 0 条 ─────────────────────────────────
];

export function filterCasesByTab(
  cases: ApprovalCardItem[],
  tabKey?: string,
): ApprovalCardItem[] {
  if (!tabKey) return cases;
  return cases.filter(item => item.listTab === tabKey);
}
