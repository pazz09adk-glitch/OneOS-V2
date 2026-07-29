export interface VehicleItem {
  id: string;
  plateNo: string;
  vin: string;
  brand: string;
  model: string;
  vehicleType: string;
  /** 提车应收款 */
  pickupReceivableStatus: 'paid' | 'unpaid' | 'processing' | 'none';
  pickupReceivableLabel?: string;
  /** 交车 */
  delivered: boolean;
  deliveredMileage?: number;
  deliveredBy?: string;
  deliveredAt?: string;
  /** 租赁账单：仅已交车有意义 */
  leaseBillStatus: 'normal' | 'overdue' | 'none';
  /** 还车 */
  returned: boolean;
  returnedAt?: string;
  returnMileage?: number;
  returnBy?: string;
  /** 还车应结款 */
  returnSettlementStatus?: 'pending' | 'approving' | 'settled' | 'none';
  returnApprover?: string;
  /** 里程 */
  mileageTargetKm?: number;
  currentMileageKm?: number;
  remainingMileageKm?: number;
  mileageProgress?: number;
  mileageForecastStatus?: '预计达标' | '预计不足' | '已达标';
  deliveryRegion?: string;
  plannedDeliveryDate?: string;
}

export interface AuthorizedDelegate {
  id: string;
  name: string;
  phone: string;
  idCard: string;
}

export interface ExtraFeeItem {
  id: string;
  vehiclePlate: string;
  serviceItem: string;
  feeAmount: number;
  effectiveDate: string;
}

export interface TripartiteAgreement {
  id: string;
  title: string;
  partyCName: string;
  fileUrl?: string;
  grantLetterUrl?: string;
}

export interface LeaseContractRecord {
  id: string;
  code: string;
  projectName: string;
  customerName: string;
  lesseeCompany: string;
  signingCompany: string;
  contractTemplateCategory: 'formal' | 'trial' | 'heavy_18t';
  contractTemplateName: string;
  standardContractName: string;
  approvalType: 'standard' | 'non_standard';
  approvalStatus: 'unsubmitted' | 'pending' | 'approving' | 'approved' | 'rejected' | 'terminated' | 'withdrawn';
  contractStatus: 'draft' | 'submitted' | 'active' | 'terminated';
  currentApprover?: string;
  approvalNodes?: { nodeName: string; approver: string; status: 'passed' | 'pending' | 'rejected' }[];
  signingMethod: 'online_esign' | 'offline_stamp';
  stampedFiles?: string[];
  businessDept: string;
  businessOwner: string;
  creator: string;
  createdAt: string;
  updatedAt: string;
  endDate: string;
  totalVehicles: number;
  deliveredVehiclesCount: number;
  returnedVehiclesCount: number;
  paymentPeriod: string;
  h2PaymentMethod: 'self' | 'prepaid' | 'monthly';
  depositAmount: number;
  monthlyRentPerVehicle: number;
  deliveryRegion: string;
  deliveryDatePlan: string;
  hasMinimumMileage?: boolean;
  mileagePeriod?: 'month' | 'quarter' | 'year';
  mileageTargetKm?: number;
  delegates: AuthorizedDelegate[];
  extraFees: ExtraFeeItem[];
  tripartiteAgreements: TripartiteAgreement[];
  vehicles: VehicleItem[];
  remarks?: string;
}

export interface ContractFilterState {
  contractCode?: string;
  projectName?: string;
  customerName?: string;
  signingCompany?: string;
  approvalStatus: string[];
  contractStatus: string[];
  businessDept: string[];
  businessOwner: string[];
  contractTemplateCategory?: string;
  standardContractName?: string;
  approvalType: string[];
  creator: string[];
  startDate?: string;
  endDate?: string;
}

/** 高阶筛选默认空条件（待应用 / 已应用共用） */
export const EMPTY_CONTRACT_FILTERS: ContractFilterState = {
  contractCode: '',
  projectName: '',
  customerName: '',
  signingCompany: '',
  approvalStatus: ['全部'],
  contractStatus: ['全部'],
  businessDept: [],
  businessOwner: [],
  contractTemplateCategory: '',
  standardContractName: '',
  approvalType: ['全部'],
  creator: [],
  startDate: '',
  endDate: '',
};

/** 高阶筛选已生效条件数（用于「更多筛选」徽标） */
export function countActiveContractFilters(state: ContractFilterState): number {
  let n = 0;
  if (state.contractCode?.trim()) n += 1;
  if (state.projectName?.trim()) n += 1;
  if (state.customerName?.trim()) n += 1;
  if (state.signingCompany?.trim()) n += 1;
  if (state.contractTemplateCategory?.trim()) n += 1;
  if (state.standardContractName?.trim()) n += 1;
  if (state.startDate?.trim()) n += 1;
  if (state.endDate?.trim()) n += 1;
  if (state.approvalStatus[0] && state.approvalStatus[0] !== '全部') n += 1;
  if (state.contractStatus[0] && state.contractStatus[0] !== '全部') n += 1;
  if (state.approvalType[0] && state.approvalType[0] !== '全部') n += 1;
  if (state.businessDept.length) n += 1;
  if (state.businessOwner.length) n += 1;
  if (state.creator.length) n += 1;
  return n;
}

/** 审批通过后才视为履约交车口径 */
export function isApprovalPassed(record: LeaseContractRecord): boolean {
  return record.approvalStatus === 'approved';
}

export function isVehicleDelivered(vehicle: VehicleItem, record: LeaseContractRecord): boolean {
  if (!isApprovalPassed(record)) return false;
  return Boolean(vehicle.delivered && vehicle.deliveredAt);
}

export function canReturnVehicle(vehicle: VehicleItem, record: LeaseContractRecord): boolean {
  return isApprovalPassed(record) && isVehicleDelivered(vehicle, record) && !vehicle.returned;
}

export function countDeliveredVehicles(record: LeaseContractRecord): number {
  return (record.vehicles || []).filter((v) => isVehicleDelivered(v, record)).length;
}
