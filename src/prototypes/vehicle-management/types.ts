export interface OpsAssignLog {
  id: string;
  /** 操作时间展示文案，如 2026-07-20 14:30 */
  operatedAt: string;
  /** 操作人 */
  operator: string;
  /** 指派对象（可为空表示清空） */
  assignees: string[];
}

export interface VehicleRecord {
  id: string;
  plateNo: string;
  vin: string;
  vehicleNo: string;
  color: string;
  year: string;
  purchaseDate: string;
  parking: string;
  /**
   * 最后停放区域（数据库持久字段）。
   * 交车后列表「停放区域」可清空，本字段应保留，供运维负责人按区域自动匹配；
   * 未记录时交车后无法自动确定运维负责人。
   */
  lastParkingArea?: string;
  ownership: string;
  scrapDate: string;
  ratingTime: string;
  operateCompany: string;
  vehicleSource: string;
  leaseCompany: string;
  vehicleType: string;
  brand: string;
  model: string;
  customer: string;
  department: string;
  manager: string;
  contractNo: string;
  operateStatus: string;
  vehicleStatus: string;
  licenseStatus: string;
  insuranceStatus: string;
  mileage: string;
  location: string;
  gpsTime: string;
  regDate: string;
  inspectExpire: string;
  lastDeliveryTime: string;
  lastDeliveryMile: string;
  lastReturnTime: string;
  lastReturnMile: string;
  lastDeliveryPerson?: string;
  lastReturnPerson?: string;
  outStatus: string;
  onlineStatus: string;
  projectName: string;
  vehicleLedgerType?: string;
  locationAddress?: string;
  lastDeliveryRegion?: string;
  lastReturnRegion?: string;
  /** 当前运维负责人（可多名）；查询全员可读，待办/操作仅负责人可执行 */
  opsManagers?: string[];
  /** 运维负责人指派操作记录（最新在前） */
  opsAssignLogs?: OpsAssignLog[];
  operateCitySource?: '车机' | 'GPS' | '人工';
  /** 里程来源；缺省时由 resolveMileageSource 推断 */
  mileageSource?: '车机' | 'GPS' | '交车登记' | '还车登记';
  /** 车辆里程考核任务（国家/地方政策补贴里程要求；区别于客户租赁合同约定的优惠里程考核） */
  /** 创建工单时写入的初始里程；缺省按车机 → GPS → 人工取值 */
  mileageTaskStartKm?: number | string;
  mileageTaskStartSource?: '车机' | 'GPS' | '人工';
  /** 任务约定需完成总里程（相对初始的增量目标） */
  mileageTaskTargetKm?: number | string;
  mileageTaskDeadlineDays?: number | string;
  /** 近若干自然日日行驶里程（km）；计算时筛「＞20 km」活跃日取最近 7 日均 */
  mileageTaskRecentDailyKm?: Array<number | string>;
  /** 已按活跃日口径算好的近 7 活跃日日均（km）；无日序列时可用 */
  mileageTaskDailyAvg7d?: number | string;
  telematicsLinked?: boolean;
  gpsLat?: number;
  gpsLng?: number;
}

export type KpiKey =
  | 'all'
  | 'lease'
  | 'logistics'
  | 'stock'
  | 'nonOperating'
  | 'exit'
  | 'licenseAbnormal'
  | 'insuranceAbnormal';

export interface VehicleFilters {
  plateNos: string[];
  operateCities: string[];
  areaRegion: string[];
  brand: string[];
  model: string[];
  customer: string[];
  department: string[];
  projectName: string[];
  projectType: string[];
  contractNo: string[];
  ownership: string[];
  operateCompany: string[];
  operateStatus: string[];
  vehicleSource: string[];
  leaseCompany: string[];
  commercialInsurance: string;
  compulsoryInsurance: string;
  parking: string[];
  licenseStatus: string[];
  insuranceStatus: string[];
  /**
   * 在租车型占比卡选中态（不进「更多筛选」表单）。
   * `__other__` = TOP4 及以后；其它为单车型 bucket key。
   */
  fleetCardKey: string;
  /** 「其他」卡：按品牌|型号|车型键过滤，不写入 brand / model 多选 */
  fleetModelKeys: string[];
}

export type InsuranceType = '交强险' | '商业险';

export interface InsurancePurchaseRecord {
  id: string;
  vehicleId: string;
  insuranceType: InsuranceType;
  expireDate: string;
  purchasedAt: string;
}

export const EMPTY_FILTERS: VehicleFilters = {
  plateNos: [],
  operateCities: [],
  areaRegion: [],
  brand: [],
  model: [],
  customer: [],
  department: [],
  projectName: [],
  projectType: [],
  contractNo: [],
  ownership: [],
  operateCompany: [],
  operateStatus: [],
  vehicleSource: [],
  leaseCompany: [],
  commercialInsurance: '',
  compulsoryInsurance: '',
  parking: [],
  licenseStatus: [],
  insuranceStatus: [],
  fleetCardKey: '',
  fleetModelKeys: [],
};

export type DetailTabId =
  | 'lifecycle'
  | 'insurance'
  | 'lease'
  | 'logistics'
  | 'inspect'
  | 'delivery'
  | 'return'
  | 'replace'
  | 'accident'
  | 'fault'
  | 'violation'
  | 'movement'
  | 'transfer'
  | 'annual';
