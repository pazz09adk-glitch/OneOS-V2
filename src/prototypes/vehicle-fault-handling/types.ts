export type FaultTaskStatus = 'pending' | 'processing' | 'suspended' | 'archived';

export type FaultResolveStatus = '未解决' | '临时排故' | '已解决';

export type FaultLevel = 'L1-特急' | 'L2-紧急' | 'L3-一般' | 'L4-提示';

export type FaultCategory =
  | '底盘系统'
  | '三电系统'
  | '整车控制'
  | '燃料电池系统'
  | '供氢系统'
  | '空调系统'
  | '冷机系统'
  | '其他';

export type FaultSource =
  | 'AI机器人上报'
  | '司机报修'
  | '客户报告'
  | '定期巡检'
  | '车机遥测';

export interface FaultAttachment {
  id: string;
  name: string;
  size: string;
  type: 'image' | 'video' | 'pdf' | 'doc' | 'zip';
  uploadTime: string;
  url?: string;
}

export interface FaultSuspendRecord {
  id: string;
  suspendType: '等待零部件到货' | '整车厂索赔审核' | '客户暂停运营' | '厂方巡检排查' | '其他原因';
  reason: string;
  operator: string;
  suspendTime: string;
  resumeTime?: string;
}

export interface FaultNotificationRecord {
  id: string;
  channel: '系统消息' | '短信催办' | '邮件督办';
  recipient: string;
  role: string;
  title: string;
  content: string;
  sendTime: string;
  status: '已发送' | '已阅读';
}

export interface FaultRecord {
  id: string; // 故障单号，系统自动生成：GZ + YYYYMMDD + HHMM + 当日流水号，如 GZ20260624111101
  plate: string; // 车牌号，如 浙A88888F
  brand: string; // 车辆品牌，如 东风商用车
  model: string; // 车辆型号，如 天龙 18T 氢能重卡
  vin: string; // VIN 码
  operateCity: string; // 运营城市/地区，如 浙江省杭州市
  operateCompany: string; // 运营公司/客户名称，如 杭州城配物流有限公司
  opsManager: string; // 运维负责人，如 王婷婷
  
  taskStatus: FaultTaskStatus; // 任务状态: pending | processing | suspended | archived
  resolveStatus: FaultResolveStatus; // 解决情况: 未解决 | 临时排故 | 已解决
  level: FaultLevel; // 故障等级（整单最高紧急度）
  /** 故障涉及部位（一条单据可对应多个部位） */
  categories: FaultCategory[];
  source: FaultSource; // 故障来源
  
  reportTime: string; // 上报时间，如 2026-07-10 09:30
  deadlineTime: string; // 最后完成时限 (截止日)，上报+30天
  archivedTime?: string; // 归档时间
  lastOperationTime: string; // 最后操作时间
  lastOperator: string; // 最后操作人
  
  description: string; // 故障现象描述
  aiChatSummary?: string; // AI 机器人聊天与排查摘要
  
  // 处置与维修记录
  repairFactory?: string; // 维修工厂/服务站，如 上海港能服务站
  repairResult?: string; // 维修处置结果与排故过程
  repairCost?: number; // 维修估算或实际费用（元）
  faultLocation?: string; // 故障发生地点，如 杭州市萧山区物流园1大道
  
  // 证据链与附件
  attachments: FaultAttachment[];
  
  // 挂起记录
  suspendHistory: FaultSuspendRecord[];
  
  // 催办通知记录
  notificationHistory: FaultNotificationRecord[];
}

export interface FaultFilters {
  taskStatus: FaultTaskStatus | 'all';
  resolveStatus: FaultResolveStatus | 'all';
  level: FaultLevel | 'all';
  category: FaultCategory | 'all';
  source: FaultSource | 'all';
  plateKeyword: string;
  faultCodeKeyword: string;
  opsManager: string | 'all';
  operateCityKeyword: string;
  deadlineRange: [string, string] | null; // 起止日期
  isUrgentOnly?: boolean; // 临期/逾期深链筛选
}

export const INITIAL_FAULT_FILTERS: FaultFilters = {
  taskStatus: 'all',
  resolveStatus: 'all',
  level: 'all',
  category: 'all',
  source: 'all',
  plateKeyword: '',
  faultCodeKeyword: '',
  opsManager: 'all',
  operateCityKeyword: '',
  deadlineRange: null,
  isUrgentOnly: false,
};
