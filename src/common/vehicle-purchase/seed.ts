import type {
  PurchaseContract,
  InspectionTask,
  InspectionVehicleLine,
  StockedVehicleRecord,
  PaymentInstallment,
} from './types';
import { resolveApprovalKind } from './approvalRules';
import {
  DEFAULT_ACCEPTANCE_CHECK_ITEMS,
  DEFAULT_SIGNOFF_DOC_NAME,
  buildSignoffEsignFileName,
} from './acceptance';

function nowStr() {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

function lngdPaymentSchedule(): PaymentInstallment[] {
  return [
    {
      id: 'pay-1',
      period: 1,
      label: '第1期价款（定金）',
      amount: 680_000,
      unitAmount: 5_000,
      trigger: '本合同签订之日起 7 个工作日内',
      prerequisite: '无',
      dueHint: '含税，人民币 0.5 万元/辆',
    },
    {
      id: 'pay-2',
      period: 2,
      label: '第2期价款',
      amount: 40_800_000,
      unitAmount: 300_000,
      trigger: '本项目车辆交付且乙方收到符合约定的发票后起 19 个工作日内',
      prerequisite: '甲方已按增资协议向丙方按期足额支付全部增资款',
      dueHint: '含税，人民币 30 万元/辆',
    },
    {
      id: 'pay-3',
      period: 3,
      label: '第3期价款',
      amount: 40_800_000,
      unitAmount: 300_000,
      trigger: '自本项目车辆交车日起满 1 年之日起 7 个工作日内',
      prerequisite: '车辆已交付',
      dueHint: '含税，人民币 30 万元/辆',
    },
    {
      id: 'pay-4',
      period: 4,
      label: '第4期价款',
      amount: 13_600_000,
      unitAmount: 100_000,
      trigger: '自本项目车辆交车日起满 2 年之日起 7 个工作日内',
      prerequisite: '车辆已交付',
      dueHint: '含税，人民币 10 万元/辆',
    },
  ];
}

export function buildSeedContracts(): PurchaseContract[] {
  const c1: PurchaseContract = {
    id: 'pc-001',
    code: 'HT-CG-2026-0088',
    buyerName: '氢能科技（广东）有限公司',
    sellerName: '东风商用车有限公司',
    buyerRoleLabel: '买方',
    sellerRoleLabel: '卖方（车企）',
    vehicleModel: '苏龙18T氢能重卡',
    powerType: '氢燃料电池',
    configSummary: '18T 牵引车 · 燃料电池系统标配',
    quantity: 5,
    unitPrice: 680000,
    totalAmount: 3400000,
    priceScopeNote: '价格含运费；不含购置税、保险、上牌杂费',
    inspectLocation: '东风襄阳工厂停车场',
    inspectDate: '2026-08-15',
    paymentSummary: '预付 30%，到货验收合格后 60%，质保期满 10%。',
    paymentSchedule: [
      {
        id: 'c1-p1',
        period: 1,
        label: '预付款',
        amount: 1_020_000,
        trigger: '合同签订后 7 日内',
        prerequisite: '无',
      },
      {
        id: 'c1-p2',
        period: 2,
        label: '到货验收款',
        amount: 2_040_000,
        trigger: '验收合格交付后',
        prerequisite: '验车通过并签署签收单',
      },
      {
        id: 'c1-p3',
        period: 3,
        label: '质保金',
        amount: 340_000,
        trigger: '质保期满',
        prerequisite: '无重大质量索赔',
      },
    ],
    warrantySummary: '整车质保按厂家手册；燃料电池系统另见附件。',
    purchaserName: '李采购',
    remark: '首批试运营车辆',
    attachments: [{ uid: 'att-1', name: 'HT-CG-2026-0088-盖章合同.pdf', kind: 'contract' }],
    status: 'inspection_created',
    approvalKind: 'normal',
    createdAt: '2026-03-15 10:00',
    updatedAt: '2026-03-20 16:00',
    inspectionTaskId: 'insp-001',
    clauses: {
      mileage: '采购车辆交付后首年每月单车行驶里程不低于 6,000 km；未达标需说明原因。',
      maintenance: '首保周期 2 万 km 或 24 个月（以先到为准）；易损件由运维按合同标准执行。',
      policy: '帕力安18T里程优惠政策：月里程≥6000km 可享受次月减免，具体按采购附件执行。',
      payment: '预付 30%，到货验收合格后 60%，质保期满 10%。',
      penalty: '逾期交付按 5000 元/次承担违约金；质量不符按合同第八条处理。',
    },
  };

  const c2: PurchaseContract = {
    id: 'pc-002',
    code: 'HT-CG-2026-0102',
    buyerName: '羚牛新能源科技有限公司',
    sellerName: '福田智蓝新能源',
    vehicleModel: '智蓝氢能轻卡 4.5T',
    powerType: '氢燃料电池',
    configSummary: '4.5T 厢式 · 城市配送',
    quantity: 8,
    unitPrice: 420000,
    totalAmount: 3360000,
    inspectLocation: '福田智蓝长沙基地',
    inspectDate: '2026-09-01',
    paymentSummary: '货到票到 45 天内付款。',
    paymentSchedule: [
      {
        id: 'c2-p1',
        period: 1,
        label: '货到票到款',
        amount: 3_360_000,
        trigger: '货到票到后 45 天内',
        prerequisite: '验收合格',
      },
    ],
    warrantySummary: '3 年质保期内免费上门巡检 1 次/季。',
    purchaserName: '李采购',
    attachments: [{ uid: 'att-2', name: 'HT-CG-2026-0102-合同扫描件.pdf', kind: 'contract' }],
    status: 'approved',
    approvalKind: 'normal',
    createdAt: '2026-04-02 11:00',
    updatedAt: '2026-04-10 09:30',
    clauses: {
      mileage: '交付后 36 个月内累计里程不低于 15 万 km（单车）。',
      maintenance: '按厂家保养手册执行；乙方提供 3 年质保期内免费上门巡检 1 次/季。',
      policy: '享免政策：帕力安4.5T里程优惠政策（详见附件）。',
      payment: '货到票到 45 天内付款。',
      penalty: '标准违约条款。',
    },
  };

  const totalLngd = 95_880_000;
  const c3: PurchaseContract = {
    id: 'pc-003',
    code: 'LNGD-25-091',
    buyerName: '羚牛氢能科技（广东）有限公司',
    sellerName: '现代汽车氢燃料电池系统（广州）有限公司',
    thirdPartyName: '羚牛新能源科技（上海）有限公司',
    buyerRoleLabel: '乙方（买方）',
    sellerRoleLabel: '甲方（卖方/车企）',
    thirdPartyRoleLabel: '丙方（乙方唯一股东 · 增资/担保相关）',
    vehicleModel: '4.5吨燃料电池冷藏车',
    productModelCode: 'XDQ5041XLCFCEV0',
    powerType: '氢燃料电池',
    configSummary: '按附件一《4.5吨燃料电池冷藏车配置表》；不作注明的按甲方标准',
    originPlace: '中国',
    manufacturer: '现代汽车氢燃料电池系统（广州）有限公司',
    quantity: 136,
    unitPrice: 705_000,
    totalAmount: totalLngd,
    priceScopeNote: '车辆价格不含购置税、保险、上牌杂费；价格含运费',
    inspectLocation: '乙方指定地点（广州市辖区内）',
    inspectDate: '2025-06-30',
    deliveryPrerequisite:
      '甲方按照增资协议向丙方缴纳全部增资款之日起约定工作日内，在乙方指定地点完成全部车辆交付',
    relatedAgreementNote:
      '2025年5月12日甲方与丙方及其股东签订《关于羚牛新能源科技（上海）有限公司增资协议》；本合同价款与交付与增资履约挂钩',
    warrantySummary:
      '整车（除易损件）2年或10万公里（以先到为准）；氢燃料电池系统、储氢系统、三电系统核心零部件质保期更长（以用户手册及质保协议为准）',
    paymentSummary:
      '四期：定金68万 → 交车收票后4080万（增资到位为前提）→ 交车满1年4080万 → 交车满2年1360万',
    paymentSchedule: lngdPaymentSchedule(),
    purchaserName: '王采购',
    remark: '样例对齐 LNGD-25-091：三方主体 + 增资绑定 + 四期付款 + 发送签收单验收',
    attachments: [
      {
        uid: 'att-3',
        name: 'LNGD-25-091车辆购买合同136辆4.5T.pdf',
        kind: 'contract',
      },
      {
        uid: 'att-3b',
        name: '附件一-4.5吨燃料电池冷藏车配置表.pdf',
        kind: 'config',
      },
      {
        uid: 'att-3c',
        name: '附件二-担保车辆明细.pdf',
        kind: 'guarantee',
      },
    ],
    status: 'draft',
    approvalKind: resolveApprovalKind(totalLngd),
    createdAt: '2025-05-12 15:20',
    updatedAt: '2025-05-12 15:20',
    clauses: {
      payment:
        '第1期定金68万；第2期交车收票后4080万（增资到位为前提）；第3/4期按交车满1年/2年支付。',
      penalty: '逾期付款按未支付金额 0.05%/日计息；质量不符可拒收并要求重新交付。',
    },
  };

  return [c1, c2, c3];
}

function emptyLine(seq: number, idPrefix: string): InspectionVehicleLine {
  return {
    id: `${idPrefix}-line-${seq}`,
    seq,
    vin: '',
    status: 'awaiting',
    evidences: [],
    redeliveryCount: 0,
  };
}

/** 大数量合同不预生成全部行，改为按到车追加 */
export function createInspectionTaskFromContract(contract: PurchaseContract): InspectionTask {
  const id = `insp-${Date.now()}`;
  const code = `YC-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`;
  const initialCount = Math.min(contract.quantity, 3);
  return {
    id,
    code,
    contractId: contract.id,
    contractCode: contract.code,
    vehicleModel: contract.vehicleModel,
    expectedQty: contract.quantity,
    inspectLocation: contract.inspectLocation,
    inspectDate: contract.inspectDate,
    status: 'pending',
    defaultDeliverUnit: contract.sellerName,
    defaultReceiveUnit: contract.buyerName,
    acceptanceCheckItems: [...DEFAULT_ACCEPTANCE_CHECK_ITEMS],
    signoffDocName: DEFAULT_SIGNOFF_DOC_NAME,
    vehicles: Array.from({ length: initialCount }, (_, i) => ({
      ...emptyLine(i + 1, id),
      vehicleModel: contract.vehicleModel,
      deliverUnit: contract.sellerName,
      receiveUnit: contract.buyerName,
      handoverDate: contract.inspectDate,
    })),
    createdAt: nowStr(),
    updatedAt: nowStr(),
  };
}

export function appendInspectionVehicleLine(task: InspectionTask): InspectionTask {
  if (task.vehicles.length >= task.expectedQty) {
    return task;
  }
  const seq = task.vehicles.length + 1;
  return {
    ...task,
    vehicles: [
      ...task.vehicles,
      {
        ...emptyLine(seq, task.id),
        vehicleModel: task.vehicleModel,
        deliverUnit: task.defaultDeliverUnit,
        receiveUnit: task.defaultReceiveUnit,
        handoverDate: task.inspectDate,
      },
    ],
    status: task.status === 'pending' ? 'in_progress' : task.status,
    updatedAt: nowStr(),
  };
}

/** 拒收后发起重新交付：回到待登记，保留拒收历史 */
export function requestRedelivery(line: InspectionVehicleLine): InspectionVehicleLine {
  return {
    ...line,
    status: 'redelivery',
    redeliveryCount: (line.redeliveryCount || 0) + 1,
    lastRejectedAt: line.lastRejectedAt || nowStr(),
    vin: '',
    esignFileName: undefined,
    signedAt: undefined,
    checkItems: undefined,
    evidences: [],
    failReason: line.failReason,
  };
}

export function startRedeliveryInspection(line: InspectionVehicleLine): InspectionVehicleLine {
  return {
    ...line,
    status: 'awaiting',
  };
}

export function buildSeedInspections(): InspectionTask[] {
  const allOk: Record<string, 'ok'> = {};
  DEFAULT_ACCEPTANCE_CHECK_ITEMS.forEach((item) => {
    allOk[item] = 'ok';
  });
  return [
    {
      id: 'insp-001',
      code: 'YC-2026-0001',
      contractId: 'pc-001',
      contractCode: 'HT-CG-2026-0088',
      vehicleModel: '苏龙18T氢能重卡',
      expectedQty: 5,
      inspectLocation: '东风襄阳工厂停车场',
      inspectDate: '2026-08-15',
      status: 'in_progress',
      defaultDeliverUnit: '东风商用车有限公司',
      defaultReceiveUnit: '氢能科技（广东）有限公司',
      acceptanceCheckItems: [...DEFAULT_ACCEPTANCE_CHECK_ITEMS],
      signoffDocName: DEFAULT_SIGNOFF_DOC_NAME,
      vehicles: [
        {
          id: 'line-1',
          seq: 1,
          vin: 'LFV2BJCH8K3123456',
          status: 'stocked',
          vehicleModel: '苏龙18T氢能重卡',
          deliverUnit: '东风商用车有限公司',
          receiveUnit: '氢能科技（广东）有限公司',
          handoverDate: '2026-08-15',
          odometerKm: 12,
          motorNo: 'TZ220X5-H0001',
          checkItems: [...DEFAULT_ACCEPTANCE_CHECK_ITEMS],
          handoverMarks: allOk,
          evidences: [
            { uid: 'e1', name: '左前45度.jpg', kind: 'photo', photoAngle: 'left45' },
            { uid: 'e1b', name: '右后45度.jpg', kind: 'photo', photoAngle: 'right45' },
          ],
          delivererSigned: true,
          receiverSigned: true,
          esignFileName: buildSignoffEsignFileName('YC-2026-0001', 1),
          signedAt: '2026-08-15 11:20',
          stockedAt: '2026-08-15 11:22',
          stockedVehicleId: 'sv-001',
          redeliveryCount: 0,
        },
        {
          id: 'line-2',
          seq: 2,
          vin: 'LFV2BJCH8K3123457',
          status: 'failed',
          vehicleModel: '苏龙18T氢能重卡',
          deliverUnit: '东风商用车有限公司',
          receiveUnit: '氢能科技（广东）有限公司',
          handoverDate: '2026-08-15',
          odometerKm: 8,
          failReason: '备胎/随车工具缺少，漆面破损，拒收并要求重新交付',
          checkItems: ['整车外观状况（与公告目录样车相同）', '漆面状况'],
          handoverMarks: {
            '整车外观状况（与公告目录样车相同）': 'damage',
            '漆面状况': 'damage',
            '备胎（1只）': 'missing',
            '千斤顶': 'missing',
          },
          evidences: [
            { uid: 'e2', name: '漆面破损.jpg', kind: 'photo' },
            { uid: 'e3', name: '工具缺失.jpg', kind: 'photo' },
          ],
          lastRejectedAt: '2026-08-15 14:00',
          redeliveryCount: 0,
        },
        {
          ...emptyLine(3, 'insp-001'),
          vehicleModel: '苏龙18T氢能重卡',
          deliverUnit: '东风商用车有限公司',
          receiveUnit: '氢能科技（广东）有限公司',
          handoverDate: '2026-08-15',
        },
        {
          ...emptyLine(4, 'insp-001'),
          vehicleModel: '苏龙18T氢能重卡',
          deliverUnit: '东风商用车有限公司',
          receiveUnit: '氢能科技（广东）有限公司',
        },
        {
          ...emptyLine(5, 'insp-001'),
          vehicleModel: '苏龙18T氢能重卡',
          deliverUnit: '东风商用车有限公司',
          receiveUnit: '氢能科技（广东）有限公司',
        },
      ],
      createdAt: '2026-03-20 16:05',
      updatedAt: '2026-08-15 11:22',
    },
  ];
}

export function stockVehicleFromLine(
  task: InspectionTask,
  line: InspectionVehicleLine,
): StockedVehicleRecord {
  return {
    id: `sv-${Date.now()}-${line.seq}`,
    vin: line.vin,
    brandModel: task.vehicleModel,
    purchaseContractId: task.contractId,
    purchaseContractCode: task.contractCode,
    purchaseDate: nowStr().slice(0, 10),
    status: '未备车',
    sourceInspectionTaskId: task.id,
    sourceLineId: line.id,
  };
}

export function buildEsignFileName(taskCode: string, seq: number) {
  return buildSignoffEsignFileName(taskCode, seq);
}

export function formatMoney(n: number) {
  return `¥${Number(n || 0).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export { nowStr as formatNow };
