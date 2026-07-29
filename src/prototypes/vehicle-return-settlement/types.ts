export type ApprovalStatus =
  | '待提交'
  | '待审批'
  | '审批中'
  | '审批完成'
  | '审批驳回'
  | '撤回';

export type DeptSubmitStatus = '待提交' | '已提交';

export type PreviewRole = 'biz' | 'safety' | 'ops' | 'energy';

export type ViewMode = 'list' | 'kanban' | 'split';

export type PageMode = 'ledger' | 'detail';

export type ViolationRecord = {
  key: string;
  code: string;
  plateNo: string;
  violationBehavior: string;
  violationTime: string;
  penaltyAmount: string;
  paymentStatus: string;
  score: string;
  handleStatus: string;
  violationCustomer: string;
  remark: string;
};

export type AccidentRecord = {
  key: string;
  accidentCode: string;
  plateNo: string;
  accidentTime: string;
  accidentPlace: string;
  accidentType: string;
  customerName: string;
  ourClaimAmount: string;
  theirClaimAmount: string;
  responsibility: string;
  accidentStatus: string;
  closeTime: string;
  otherFee: string;
  remark: string;
};

export type FeeRow = {
  key: string;
  seq: number;
  feeItem: string;
  amount: string;
  remark: string;
  updatedAt: string;
  /**
   * 无忧包减免（元）。仅 未结算保养费 / 未结算维修费 / 轮胎磨损费 可填；
   * 对应未购买养护保 / 易损保 / 轮胎保时禁用。
   */
  packageWaiver?: string;
};

export type DeptBlock = {
  submitBy: string;
  status: DeptSubmitStatus;
  feeRows: FeeRow[];
};

export type SettlementRecord = {
  key: string;
  billNo: string;
  contractCode: string;
  customerName: string;
  projectName: string;
  plateNo: string;
  /** 收费方案车型，对齐《各车型收费方案》 */
  vehicleModel: string;
  /** 本段实际里程（公里），用于养护保核算 */
  mileageKm: number;
  bizDept: string;
  bizOwner: string;
  deliveryTime: string;
  returnTime: string;
  returnPerson: string;
  approvalStatus: ApprovalStatus;
  /** 业管与客户谈妥：是否购买保养无忧包（养护保） */
  hasCarePackage: boolean;
  /** 业管与客户谈妥：是否购买维修无忧包（易损保） */
  hasWearPackage: boolean;
  /** 是否购买轮胎保（仅控制轮胎磨损费减免，本期不改费率表） */
  hasTirePackage: boolean;
  /** 本段实际交车～还车内自动带出的违章（不依赖安全员提交） */
  violations: ViolationRecord[];
  /** 本段实际交车～还车内自动带出的事故 */
  accidents: AccidentRecord[];
  safety: DeptBlock;
  bizService: DeptBlock;
  ops: DeptBlock;
  energy: DeptBlock;
  depositTotal: string;
  pendingTotal: string;
  refundTotal: string;
  payTotal: string;
};

export type SettlementFilters = {
  keyword: string;
  approvalStatus: ApprovalStatus | 'all';
  returnDateRange: [string, string] | null;
};
