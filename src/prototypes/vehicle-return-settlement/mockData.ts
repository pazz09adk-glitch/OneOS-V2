import { OPS_WAIVER_MAP, calcCarePackages, formatMoney, opsNetAmount } from './carePackageRates';
import type { FeeRow, SettlementRecord } from './types';

function effectiveWaiver(row: FeeRow, record: Pick<SettlementRecord, 'hasCarePackage' | 'hasWearPackage' | 'hasTirePackage'>): string {
  const kind = OPS_WAIVER_MAP[row.feeItem];
  if (kind === 'care' && record.hasCarePackage) return row.packageWaiver ?? '0';
  if (kind === 'wear' && record.hasWearPackage) return row.packageWaiver ?? '0';
  if (kind === 'tire' && record.hasTirePackage) return row.packageWaiver ?? '0';
  return '0';
}

const emptyDept = (submitBy = '', status: '待提交' | '已提交' = '待提交') => ({
  submitBy,
  status,
  feeRows: [] as FeeRow[],
});

const defaultOpsRows = (overrides: Partial<Record<string, { amount: string; waiver?: string }>> = {}): FeeRow[] => {
  const items = [
    '清洗费',
    '未结算保养费',
    '未结算维修费',
    '车损费',
    '工具损坏丢失费',
    '证件丢失费',
    '广告损坏丢失费',
    '送车服务费',
    '接车服务费',
    '轮胎磨损费',
  ];
  return items.map((feeItem, i) => {
    const o = overrides[feeItem];
    return {
      key: `ops-${i + 1}`,
      seq: i + 1,
      feeItem,
      amount: o?.amount ?? '0.00',
      packageWaiver: o?.waiver ?? '0.00',
      remark: '',
      updatedAt: o ? '2026-07-21 11:00' : '—',
    };
  });
};

function withPackageBizFees(
  base: FeeRow[],
  record: Pick<
    SettlementRecord,
    | 'vehicleModel'
    | 'mileageKm'
    | 'deliveryTime'
    | 'returnTime'
    | 'hasCarePackage'
    | 'hasWearPackage'
  >,
): FeeRow[] {
  const calc = calcCarePackages(record);
  const auto: FeeRow[] = [];
  if (record.hasCarePackage) {
    auto.push({
      key: 'pkg-care',
      seq: 0,
      feeItem: '保养无忧包（养护保）',
      amount: calc.carePackageFeeText,
      remark: calc.careFormula,
      updatedAt: '系统自动核算',
    });
  }
  if (record.hasWearPackage) {
    auto.push({
      key: 'pkg-wear',
      seq: 0,
      feeItem: '维修无忧包（易损保）',
      amount: calc.wearPackageFeeText,
      remark: calc.wearFormula,
      updatedAt: '系统自动核算',
    });
  }
  const merged = [...auto, ...base].map((r, i) => ({ ...r, seq: i + 1 }));
  return merged;
}

function recomputeTotals(partial: Omit<SettlementRecord, 'pendingTotal' | 'refundTotal' | 'payTotal'>): SettlementRecord {
  const sumRows = (rows: FeeRow[], withWaiver: boolean) =>
    rows.reduce((s, r) => {
      if (withWaiver) return s + opsNetAmount(r.amount, effectiveWaiver(r, partial));
      return s + (Number(r.amount) || 0);
    }, 0);

  const pending =
    sumRows(partial.bizService.feeRows, false) +
    sumRows(partial.ops.feeRows, true) +
    sumRows(partial.safety.feeRows, false) +
    sumRows(partial.energy.feeRows, false);

  const deposit = Number(partial.depositTotal) || 0;
  const diff = deposit - pending;
  return {
    ...partial,
    pendingTotal: formatMoney(pending),
    refundTotal: formatMoney(Math.max(0, diff)),
    payTotal: formatMoney(Math.max(0, -diff)),
  };
}

const base001 = {
  key: '1',
  billNo: 'HC-JS-2026-001',
  contractCode: 'ZL-2025-0881',
  customerName: '杭州运通物流有限公司',
  projectName: '华东干线租赁项目',
  plateNo: '浙A88888F',
  vehicleModel: '苏龙车18T',
  mileageKm: 62100,
  bizDept: '华东业务一部',
  bizOwner: '王冕',
  deliveryTime: '2025-11-01 09:30',
  returnTime: '2026-07-20 16:00',
  returnPerson: '李强',
  approvalStatus: '待提交' as const,
  hasCarePackage: true,
  hasWearPackage: true,
  hasTirePackage: false,
  violations: [
    {
      key: 'v1',
      code: 'WZ202603150001',
      plateNo: '浙A88888F',
      violationBehavior: '闯红灯',
      violationTime: '2026-03-15 08:22',
      penaltyAmount: '200.00',
      paymentStatus: '未缴费',
      score: '6',
      handleStatus: '未处理',
      violationCustomer: '杭州运通物流有限公司',
      remark: '本段租期内自动带出',
    },
    {
      key: 'v2',
      code: 'WZ202605080012',
      plateNo: '浙A88888F',
      violationBehavior: '超速未达50%',
      violationTime: '2026-05-08 14:10',
      penaltyAmount: '100.00',
      paymentStatus: '未缴费',
      score: '3',
      handleStatus: '未处理',
      violationCustomer: '杭州运通物流有限公司',
      remark: '',
    },
  ],
  accidents: [] as SettlementRecord['accidents'],
  safety: {
    submitBy: '',
    status: '待提交' as const,
    feeRows: [
      { key: 'sf1', seq: 1, feeItem: '违章处理违约金', amount: '0.00', remark: '', updatedAt: '—' },
      { key: 'sf2', seq: 2, feeItem: '保险上浮', amount: '0.00', remark: '', updatedAt: '—' },
      { key: 'sf3', seq: 3, feeItem: '其他违规费用', amount: '0.00', remark: '', updatedAt: '—' },
    ],
  },
  bizService: {
    submitBy: '业务-周敏',
    status: '已提交' as const,
    feeRows: [] as FeeRow[],
  },
  ops: {
    submitBy: '运维-陈涛',
    status: '待提交' as const,
    feeRows: defaultOpsRows({
      清洗费: { amount: '80.00' },
      未结算保养费: { amount: '372.50', waiver: '372.50' },
      未结算维修费: { amount: '860.00', waiver: '860.00' },
    }),
  },
  energy: emptyDept('能源-孙悦', '已提交'),
  depositTotal: '2000.00',
};

const seeded001 = (() => {
  const bizRows = withPackageBizFees(
    [
      { key: 'b1', seq: 1, feeItem: 'ETC-客户未缴费用', amount: '100.00', remark: '', updatedAt: '2026-07-21 10:12' },
      { key: 'b2', seq: 2, feeItem: 'ETC卡缺损费', amount: '0.00', remark: '', updatedAt: '2026-07-21 10:12' },
    ],
    base001,
  );
  return recomputeTotals({
    ...base001,
    bizService: { ...base001.bizService, feeRows: bizRows },
  });
})();

export const MOCK_SETTLEMENTS: SettlementRecord[] = [
  seeded001,
  recomputeTotals({
    key: '2',
    billNo: 'HC-JS-2026-002',
    contractCode: 'ZL-2025-1022',
    customerName: '宁波海港货运有限公司',
    projectName: '港口短驳租赁',
    plateNo: '浙B66666D',
    vehicleModel: '现代4.5T普货',
    mileageKm: 18400,
    bizDept: '浙江业务二部',
    bizOwner: '赵倩',
    deliveryTime: '2026-01-10 10:00',
    returnTime: '2026-07-18 15:20',
    returnPerson: '周凯',
    approvalStatus: '待提交',
    hasCarePackage: false,
    hasWearPackage: false,
    hasTirePackage: false,
    violations: [],
    accidents: [],
    safety: {
      submitBy: '',
      status: '待提交',
      feeRows: [
        { key: 'sf1', seq: 1, feeItem: '违章处理违约金', amount: '0.00', remark: '', updatedAt: '—' },
        { key: 'sf2', seq: 2, feeItem: '保险上浮', amount: '0.00', remark: '', updatedAt: '—' },
        { key: 'sf3', seq: 3, feeItem: '其他违规费用', amount: '0.00', remark: '', updatedAt: '—' },
      ],
    },
    bizService: emptyDept('业务-刘洋', '待提交'),
    ops: {
      submitBy: '运维-陈涛',
      status: '待提交',
      feeRows: defaultOpsRows({
        未结算保养费: { amount: '920.00', waiver: '0.00' },
        未结算维修费: { amount: '450.00', waiver: '0.00' },
      }),
    },
    energy: emptyDept('', '待提交'),
    depositTotal: '3000.00',
  }),
  (() => {
    const base = {
      key: '3',
      billNo: 'HC-JS-2026-003',
      contractCode: 'ZL-2025-0550',
      customerName: '上海馨想事物流有限公司',
      projectName: '城配氢能示范',
      plateNo: '沪C12345',
      vehicleModel: '飞驰49T',
      mileageKm: 41200,
      bizDept: '上海业务部',
      bizOwner: '王冕',
      deliveryTime: '2025-08-01 08:00',
      returnTime: '2026-07-10 17:40',
      returnPerson: '马超',
      approvalStatus: '审批中' as const,
      hasCarePackage: true,
      hasWearPackage: false,
      hasTirePackage: true,
      violations: [
        {
          key: 'v3',
          code: 'WZ202601200008',
          plateNo: '沪C12345',
          violationBehavior: '违停',
          violationTime: '2026-01-20 19:05',
          penaltyAmount: '100.00',
          paymentStatus: '已缴费',
          score: '0',
          handleStatus: '已处理',
          violationCustomer: '上海馨想事物流有限公司',
          remark: '',
        },
      ],
      accidents: [
        {
          key: 'a1',
          accidentCode: 'SG202602110001',
          plateNo: '沪C12345',
          accidentTime: '2026-02-11',
          accidentPlace: '上海市浦东新区外环',
          accidentType: '追尾',
          customerName: '上海馨想事物流有限公司',
          ourClaimAmount: '3200.00',
          theirClaimAmount: '0.00',
          responsibility: '全责',
          accidentStatus: '未结案',
          closeTime: '',
          otherFee: '200.00',
          remark: '客户未结清定损',
        },
      ],
      safety: {
        submitBy: '安全-赵六',
        status: '已提交' as const,
        feeRows: [
          { key: 'sf1', seq: 1, feeItem: '违章处理违约金', amount: '150.00', remark: '含服务费', updatedAt: '2026-07-12 09:30' },
          { key: 'sf2', seq: 2, feeItem: '保险上浮', amount: '500.00', remark: '', updatedAt: '2026-07-12 09:30' },
          { key: 'sf3', seq: 3, feeItem: '其他违规费用', amount: '200.00', remark: '事故杂费', updatedAt: '2026-07-12 09:30' },
        ],
      },
      bizService: {
        submitBy: '业务-周敏',
        status: '已提交' as const,
        feeRows: [] as FeeRow[],
      },
      ops: {
        submitBy: '运维-陈涛',
        status: '已提交' as const,
        feeRows: defaultOpsRows({
          车损费: { amount: '3200.00' },
          未结算保养费: { amount: '500.00', waiver: '500.00' },
          轮胎磨损费: { amount: '180.00', waiver: '180.00' },
        }),
      },
      energy: {
        submitBy: '能源-孙悦',
        status: '已提交' as const,
        feeRows: [{ key: 'e1', seq: 1, feeItem: '氢费补缴', amount: '284.54', remark: '', updatedAt: '2026-07-11 15:20' }],
      },
      depositTotal: '5000.00',
    };
    return recomputeTotals({
      ...base,
      bizService: {
        ...base.bizService,
        feeRows: withPackageBizFees(
          [{ key: 'b1', seq: 1, feeItem: 'ETC-客户未缴费用', amount: '0.00', remark: '', updatedAt: '2026-07-11 16:00' }],
          base,
        ),
      },
    });
  })(),
  recomputeTotals({
    key: '4',
    billNo: 'HC-JS-2026-004',
    contractCode: 'ZL-2026-0018',
    customerName: '嘉兴港航运输有限公司',
    projectName: '嘉兴园区短租',
    plateNo: '浙F03218F',
    vehicleModel: '宇通49T',
    mileageKm: 9800,
    bizDept: '华东业务一部',
    bizOwner: '林峰',
    deliveryTime: '2026-03-01 09:00',
    returnTime: '2026-07-22 11:10',
    returnPerson: '李强',
    approvalStatus: '待审批',
    hasCarePackage: false,
    hasWearPackage: true,
    hasTirePackage: false,
    violations: [
      {
        key: 'v4',
        code: 'WZ202604010003',
        plateNo: '浙F03218F',
        violationBehavior: '占用应急车道',
        violationTime: '2026-04-01 07:48',
        penaltyAmount: '200.00',
        paymentStatus: '未缴费',
        score: '6',
        handleStatus: '未处理',
        violationCustomer: '嘉兴港航运输有限公司',
        remark: '租期外历史不在本单展示（本条在期内）',
      },
    ],
    accidents: [],
    safety: {
      submitBy: '安全-赵六',
      status: '已提交',
      feeRows: [
        { key: 'sf1', seq: 1, feeItem: '违章处理违约金', amount: '200.00', remark: '', updatedAt: '2026-07-22 14:00' },
        { key: 'sf2', seq: 2, feeItem: '保险上浮', amount: '0.00', remark: '', updatedAt: '2026-07-22 14:00' },
        { key: 'sf3', seq: 3, feeItem: '其他违规费用', amount: '0.00', remark: '', updatedAt: '2026-07-22 14:00' },
      ],
    },
    bizService: {
      submitBy: '业务-周敏',
      status: '已提交',
      feeRows: withPackageBizFees([], {
        vehicleModel: '宇通49T',
        mileageKm: 9800,
        deliveryTime: '2026-03-01 09:00',
        returnTime: '2026-07-22 11:10',
        hasCarePackage: false,
        hasWearPackage: true,
      }),
    },
    ops: {
      submitBy: '运维-陈涛',
      status: '已提交',
      feeRows: defaultOpsRows({
        未结算维修费: { amount: '1200.00', waiver: '1200.00' },
      }),
    },
    energy: {
      submitBy: '能源-孙悦',
      status: '已提交',
      feeRows: [],
    },
    depositTotal: '1500.00',
  }),
];

export const APPROVAL_OPTIONS = [
  { value: 'all', label: '全部审批状态' },
  { value: '待提交', label: '待提交' },
  { value: '待审批', label: '待审批' },
  { value: '审批中', label: '审批中' },
  { value: '审批完成', label: '审批完成' },
  { value: '审批驳回', label: '审批驳回' },
  { value: '撤回', label: '撤回' },
];

export const ROLE_OPTIONS = [
  { value: 'biz', label: '业管（只读看安全）' },
  { value: 'safety', label: '安全员（可提交）' },
  { value: 'ops', label: '运维（无忧包减免）' },
  { value: 'energy', label: '能源' },
];

export { recomputeTotals, withPackageBizFees };
