/** 车辆采购合同 / 验车 / 入库 · 共享类型 */

export type ContractStatus =
  | 'draft'
  | 'pending'
  | 'processing'
  | 'approved'
  | 'rejected'
  | 'inspection_created';

export type ApprovalKind = 'normal' | 'abnormal';

export type InspectionTaskStatus = 'pending' | 'in_progress' | 'completed';

/** awaiting 待登记；passed 已签收待入库；failed 拒收待重交；redelivery 已发起重交；stocked 已入库 */
export type VehicleInspectStatus =
  | 'awaiting'
  | 'passed'
  | 'failed'
  | 'redelivery'
  | 'stocked';

export interface PurchaseAttachment {
  uid: string;
  name: string;
  /** config=配置表附件一；guarantee=担保附件；contract=合同正文；other */
  kind?: 'contract' | 'config' | 'guarantee' | 'other';
}

/** 分期付款计划（对齐 LNGD 类合同多期价款） */
export interface PaymentInstallment {
  id: string;
  /** 第几期 */
  period: number;
  label: string;
  amount: number;
  /** 元/辆（可选） */
  unitAmount?: number;
  /** 触发条件说明 */
  trigger: string;
  /** 前提条件（如增资到位、收票） */
  prerequisite?: string;
  dueHint?: string;
}

export interface PurchaseContract {
  id: string;
  code: string;
  /** 买方（合同乙方常见） */
  buyerName: string;
  /** 卖方（合同甲方常见，车企） */
  sellerName: string;
  /** 第三方（如股东/担保/增资方） */
  thirdPartyName?: string;
  buyerRoleLabel?: string;
  sellerRoleLabel?: string;
  thirdPartyRoleLabel?: string;
  vehicleModel: string;
  /** 产品型号编码，如 XDQ5041XLCFCEV0 */
  productModelCode?: string;
  powerType: string;
  configSummary: string;
  originPlace?: string;
  manufacturer?: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  /** 价格口径说明（如不含购置税保险上牌） */
  priceScopeNote?: string;
  inspectLocation: string;
  inspectDate: string;
  /** 交付前提（如增资协议足额到位后 N 个工作日） */
  deliveryPrerequisite?: string;
  /** 关联协议说明（增资协议等） */
  relatedAgreementNote?: string;
  /** 质保摘要 */
  warrantySummary?: string;
  /** 自由文本付款摘要（兼容旧数据） */
  paymentSummary: string;
  /** 结构化分期 */
  paymentSchedule?: PaymentInstallment[];
  buyerContact?: string;
  purchaserName: string;
  remark?: string;
  attachments: PurchaseAttachment[];
  status: ContractStatus;
  approvalKind: ApprovalKind;
  createdAt: string;
  updatedAt: string;
  inspectionTaskId?: string;
  clauses?: Partial<Record<'mileage' | 'maintenance' | 'policy' | 'payment' | 'penalty', string>>;
}

export interface InspectionEvidence {
  uid: string;
  name: string;
  kind: 'photo' | 'video' | 'doc';
  /** left45 / right45 / other */
  photoAngle?: 'left45' | 'right45' | 'other';
}

export interface InspectionVehicleLine {
  id: string;
  seq: number;
  /** 车辆识别代码（交接验收表字段名） */
  vin: string;
  status: VehicleInspectStatus;
  failReason?: string;
  evidences: InspectionEvidence[];
  /** 勾选通过的检查项（兼容旧数据） */
  checkItems?: string[];
  /** 交接验收表：项目 → 交/接车状况标记 */
  handoverMarks?: Partial<Record<string, import('./acceptance').HandoverItemMark>>;
  /** 车辆型号（可与任务车型一致，现场可改） */
  vehicleModel?: string;
  /** 交车单位 */
  deliverUnit?: string;
  /** 接车单位 */
  receiveUnit?: string;
  /** 车辆交接日期 */
  handoverDate?: string;
  /** 交车时仪表里程（公里） */
  odometerKm?: number;
  /** 发动机号/电机号 */
  motorNo?: string;
  /** 备注说明状况 */
  remark?: string;
  /** 交车方已签 */
  delivererSigned?: boolean;
  /** 接车方已签 */
  receiverSigned?: boolean;
  /** 电子签章《车辆交接验收表》文件名 */
  esignFileName?: string;
  signedAt?: string;
  stockedAt?: string;
  stockedVehicleId?: string;
  redeliveryCount?: number;
  lastRejectedAt?: string;
}

export interface InspectionTask {
  id: string;
  code: string;
  contractId: string;
  contractCode: string;
  vehicleModel: string;
  expectedQty: number;
  inspectLocation: string;
  inspectDate: string;
  status: InspectionTaskStatus;
  /** 默认交车/接车单位（可带到每台） */
  defaultDeliverUnit?: string;
  defaultReceiveUnit?: string;
  acceptanceCheckItems?: string[];
  /** 默认《车辆交接验收表》 */
  signoffDocName?: string;
  vehicles: InspectionVehicleLine[];
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface StockedVehicleRecord {
  id: string;
  vin: string;
  brandModel: string;
  purchaseContractId: string;
  purchaseContractCode: string;
  purchaseDate: string;
  status: string;
  sourceInspectionTaskId: string;
  sourceLineId: string;
}

export interface WorkOrderPrefillRow {
  clauseType: string;
  title: string;
  currentOwnerId: string;
  accountableOwnerId: string;
  requirement?: string;
}

export interface WorkOrderPrefillPayload {
  contractId: string;
  contractCode: string;
  rows: WorkOrderPrefillRow[];
  batch?: boolean;
}
