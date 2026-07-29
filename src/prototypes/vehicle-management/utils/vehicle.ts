import type { KpiKey, OpsAssignLog, VehicleRecord } from '../types';

export const KPI_CARDS: Array<{ key: KpiKey; title: string; desc: string }> = [
  { key: 'all', title: '所有营运车辆', desc: '未退出运营，且可以用来交付的车辆' },
  { key: 'lease', title: '租赁车辆', desc: '运营状态为「租赁」的车辆，已交付租赁业务项目' },
  { key: 'logistics', title: '物流车辆', desc: '运营状态为「物流」的车辆，已交付物流业务项目' },
  { key: 'stock', title: '库存车辆', desc: '营运车辆中运营状态为「在库-可交付」「在库-不可交付」的在库车辆（不含非运营台账）' },
  { key: 'nonOperating', title: '非运营车辆', desc: '观光车、公务车等不参与租赁及物流的车辆；不可用于整套车辆业务，运营状态固定为「在库-不可交付」' },
  { key: 'exit', title: '退出运营车辆', desc: '已退出运营的车辆' },
];

/** 界面展示枚举（编辑/筛选）；种子可仍为「可运营」「库存可交付」等旧值 */
export const OPERATE_STATUS_OPTIONS = [
  '租赁',
  '物流',
  '在库-可交付',
  '在库-不可交付',
  '退出运营',
] as const;

/** 旧值 / 过渡值 → 界面展示文案（统一「在库-可交付 / 在库-不可交付」） */
export const OPERATE_STATUS_LABEL_MAP: Record<string, string> = {
  可运营: '在库-可交付',
  待运营: '在库-不可交付',
  代运营: '在库-不可交付',
  库存可交付: '在库-可交付',
  库存不可交付: '在库-不可交付',
  '在库-可交付': '在库-可交付',
  '在库-不可交付': '在库-不可交付',
  租赁: '租赁',
  物流: '物流',
  退出运营: '退出运营',
};

/** 运营状态五档定义（列表 / 详情胶囊悬停提示） */
export const OPERATE_STATUS_DESCRIPTION: Record<string, string> = {
  租赁: '已交付租赁业务项目。',
  物流: '已交付物流业务项目。',
  '在库-可交付': '在库且可交付（证照、保险等允许交车）。',
  '在库-不可交付': '在库但暂不可交付（证照、保险等暂不允许交车）。',
  退出运营: '已退出运营，不再参与租赁及物流交付。',
};

/** 悬停 / 无障碍：按展示文案或整车记录解析运营状态说明 */
export function resolveOperateStatusDescription(
  row: Pick<VehicleRecord, 'operateStatus' | 'vehicleLedgerType'> | string,
): string {
  if (typeof row !== 'string' && isNonOperating(row)) {
    return '非运营车辆（观光车、公务车等）不参与租赁及物流；运营状态固定为「在库-不可交付」。';
  }
  const label = typeof row === 'string'
    ? formatOperateStatusLabel(row)
    : resolveOperateStatus(row);
  return OPERATE_STATUS_DESCRIPTION[label] || `运营状态：${label}`;
}

/** 筛选项对应的种子兼容值（含新旧） */
const OPERATE_STATUS_FILTER_ALIASES: Record<string, string[]> = {
  租赁: ['租赁'],
  物流: ['物流'],
  '在库-可交付': ['在库-可交付', '库存可交付', '可运营'],
  '在库-不可交付': ['在库-不可交付', '库存不可交付', '待运营', '代运营'],
  退出运营: ['退出运营'],
  // 兼容仍以旧展示文案作为筛选项传入
  库存可交付: ['在库-可交付', '库存可交付', '可运营'],
  库存不可交付: ['在库-不可交付', '库存不可交付', '待运营', '代运营'],
};

export function formatOperateStatusLabel(raw: unknown, emptyLabel = '未设置'): string {
  const value = String(raw ?? '').trim();
  if (!value || value === '-') return emptyLabel;
  return OPERATE_STATUS_LABEL_MAP[value] || value;
}

/** 是否库存（可交付/不可交付，兼容旧值） */
export function isStockOperateStatus(status: string): boolean {
  const label = formatOperateStatusLabel(status, '');
  return label === '在库-可交付'
    || label === '在库-不可交付'
    || status === '可运营'
    || status === '待运营'
    || status === '代运营'
    || status === '在库-可交付'
    || status === '在库-不可交付'
    || status === '库存可交付'
    || status === '库存不可交付'
    || status === '库存';
}

/**
 * 筛选：选中展示文案时，同时命中种子旧值。
 * selected 可为新文案或旧值。
 */
export function matchOperateStatusFilter(
  recordStatus: string,
  selectedLabels: string[],
): boolean {
  if (selectedLabels.length === 0) return true;
  const raw = String(recordStatus || '').trim();
  return selectedLabels.some((selected) => {
    const key = OPERATE_STATUS_LABEL_MAP[selected] || selected;
    const aliases = OPERATE_STATUS_FILTER_ALIASES[key] || [selected, key];
    return aliases.includes(raw) || aliases.includes(OPERATE_STATUS_LABEL_MAP[raw] || raw);
  });
}
export const PROJECT_TYPE_OPTIONS = ['租赁', '物流'];
export const VEHICLE_SOURCE_OPTIONS = ['自有', '外租', '挂靠'];
export const LICENSE_STATUS_OPTIONS = ['正常', '异常'];
export const INSURANCE_STATUS_OPTIONS = ['正常', '临期', '异常'];
export const VEHICLE_STATUS_OPTIONS = [
  '待验车',
  '未备车',
  '已备车',
  '待交车',
  '已交车',
  '待还车',
  '呆滞车',
  '报废中',
  '维修中',
  '销售中',
  '过户中',
  '替换中',
  '调拨中',
  '异动中',
  '三方退租中',
  '无',
] as const;

export type VehicleStatusLabel = (typeof VEHICLE_STATUS_OPTIONS)[number];

/** 车辆状态标签规则（对齐车辆状态说明图） */
export type VehicleStatusTagType = 'default' | 'primary' | 'success' | 'warning' | 'error' | 'purple';

export interface VehicleStatusMeta {
  label: string;
  tagType: VehicleStatusTagType;
  /** 图中标注「暂未上线」的状态 */
  offline: boolean;
  description: string;
}

export const VEHICLE_STATUS_META: Record<string, VehicleStatusMeta> = {
  待验车: {
    label: '待验车',
    tagType: 'primary',
    offline: true,
    description: '采购/三方租用入库后尚未完成验车。',
  },
  未备车: {
    label: '未备车',
    tagType: 'primary',
    offline: false,
    description: '尚未备车，可随时发起备车。',
  },
  已备车: {
    label: '已备车',
    tagType: 'success',
    offline: false,
    description: '已完成备车并在备车库中，可随时交车（须证照/保险正常、运营状态允许）。',
  },
  待交车: {
    label: '待交车',
    tagType: 'primary',
    offline: false,
    description: '租赁合同已确定车牌，签约后占位，防止被其他业务误交。',
  },
  已交车: {
    label: '已交车',
    tagType: 'success',
    offline: false,
    description: '运维 E 签宝交车签章完成即算已交车，无需等待客户签章。此时运营状态必为租赁或自营。',
  },
  待还车: {
    label: '待还车',
    tagType: 'warning',
    offline: false,
    description: '还车任务已生成，还车流程尚未完成。',
  },
  呆滞车: {
    label: '呆滞车',
    tagType: 'primary',
    offline: true,
    description: '将随呆滞车管理功能上线。',
  },
  报废中: {
    label: '报废中',
    tagType: 'warning',
    offline: false,
    description: '报废流程已审批通过，尚未完成报废情况填写。',
  },
  维修中: {
    label: '维修中',
    tagType: 'warning',
    offline: true,
    description: '维修单未完成或未标记已修复；修复后恢复维修前车辆状态。',
  },
  销售中: {
    label: '销售中',
    tagType: 'purple',
    offline: true,
    description: '销售流程已通过，尚未完成销售结果填写；完成后车辆状态为无、出库为销售出库。',
  },
  过户中: {
    label: '过户中',
    tagType: 'primary',
    offline: true,
    description: '内部过户进行中，尚未完成信息填写与证件更新。',
  },
  替换中: {
    label: '替换中',
    tagType: 'primary',
    offline: false,
    description: '替换车流程通过后新车标记；完成后新车为已交车。旧车永久替换则还车后未备车，临时替换仍已交车。',
  },
  调拨中: {
    label: '调拨中',
    tagType: 'primary',
    offline: false,
    description: '调拨流程通过后，调拨方完成调拨信息记录时标记；接收人完成接车后恢复调拨前状态。',
  },
  异动中: {
    label: '异动中',
    tagType: 'primary',
    offline: false,
    description: '异动流程通过审批并开始执行时标记；操作人完成异动结束后恢复异动前状态。',
  },
  三方退租中: {
    label: '三方退租中',
    tagType: 'warning',
    offline: true,
    description: '三方退租已通过，尚未完成退租确认。',
  },
  无: {
    label: '无',
    tagType: 'default',
    offline: false,
    description: '报废/销售/三方退租完成后的终态，不再参与在库运营占位。',
  },
};

export function resolveVehicleStatusMeta(status: unknown): VehicleStatusMeta | null {
  const label = String(status ?? '').trim();
  if (!label || label === '-' || label === '—') return null;
  return VEHICLE_STATUS_META[label] || {
    label,
    tagType: 'default',
    offline: false,
    description: '车辆状态',
  };
}

/** 调拨中 / 异动中：执行中视为未在库（不展示停放区域） */
export function isVehicleAwayByStatus(record: Pick<VehicleRecord, 'vehicleStatus'>): boolean {
  const status = String(record.vehicleStatus || '').trim();
  return status === '调拨中' || status === '异动中';
}

export function buildYearOptions(): string[] {
  const year = new Date().getFullYear();
  return Array.from({ length: 13 }, (_, index) => String(year - index));
}

export interface VehicleEditForm {
  parking: string;
  operateStatus: string;
  vehicleStatus: string;
  ownership: string;
  operateCompany: string;
  vehicleSource: string;
  leaseCompany: string;
  year: string;
  purchaseDate: string;
}

export function createVehicleEditForm(record: VehicleRecord): VehicleEditForm {
  return {
    parking: isEmpty(record.parking) ? '' : String(record.parking),
    operateStatus: resolveOperateStatus(record),
    vehicleStatus: record.vehicleStatus || '',
    ownership: isEmpty(record.ownership) ? '' : String(record.ownership),
    operateCompany: record.operateCompany || '',
    vehicleSource: record.vehicleSource || '',
    leaseCompany: isEmpty(record.leaseCompany) ? '' : String(record.leaseCompany),
    year: isEmpty(record.year) ? '' : String(record.year),
    purchaseDate: isEmpty(record.purchaseDate) ? '' : String(record.purchaseDate),
  };
}

export function applyVehicleEditForm(record: VehicleRecord, form: VehicleEditForm): VehicleRecord {
  return normalizeVehicleRecord({
    ...record,
    parking: form.parking || '-',
    operateStatus: isNonOperating(record) ? NON_OPERATING_OPERATE_STATUS : form.operateStatus,
    vehicleStatus: form.vehicleStatus,
    ownership: form.ownership.trim() || '-',
    operateCompany: form.operateCompany || record.operateCompany,
    vehicleSource: form.vehicleSource || record.vehicleSource,
    leaseCompany: form.leaseCompany.trim() || '-',
    year: form.year || record.year,
    purchaseDate: form.purchaseDate || record.purchaseDate,
  });
}

export const PARKING_REGION_MAP: Record<string, string> = {
  '广州开创大道停车场': '广东省-广州市',
  '开创大道云埔宏仁便民停车场': '广东省-广州市',
  '广州现代停车场': '广东省-广州市',
  '佛山汽车运输集团公交分公司塱沙充电站': '广东省-广州市',
  '韶关宝氢科技停车场': '广东省-广州市',
  '平湖停车场': '浙江省-嘉兴市',
  '嘉兴公司楼下氢能展厅': '浙江省-嘉兴市',
  '汇通检测站停车场': '浙江省-嘉兴市',
  '独山港停车场': '浙江省-嘉兴市',
  '龙王路停车场': '浙江省-嘉兴市',
  '成都宇通服务站停车场': '四川省-成都市',
  '北京一汽宏特停车场': '北京市-北京市',
  '乌鲁木齐隆盛达停车场': '新疆维吾尔自治区-乌鲁木齐市',
};

export const PARKING_OPTIONS = Object.keys(PARKING_REGION_MAP);

/** 运维人员模拟名单（对齐实际运维昵称 14 人）；区域为原型演示分配 */
export const OPS_STAFF = [
  { name: '沈帅', role: '运维专员', regions: ['浙江省-嘉兴市'] },
  { name: '赵伟军', role: '运维专员', regions: ['浙江省-嘉兴市'] },
  { name: '赵小峰', role: '运维专员', regions: ['浙江省-嘉兴市'] },
  { name: '赵波', role: '运维专员', regions: ['广东省-广州市'] },
  /** 全省管控：仅写省份时，匹配该省下全部地市车辆 */
  { name: '何斐', role: '运维主管', regions: ['浙江省', '广东省-广州市'] },
  { name: '黄志辉', role: '运维专员', regions: ['广东省-广州市'] },
  { name: '邱陈佳', role: '运维专员', regions: ['广东省-广州市'] },
  { name: '黄桂球', role: '运维专员', regions: ['北京市-北京市'] },
  { name: '王建功', role: '运维专员', regions: ['北京市-北京市'] },
  { name: '童军林', role: '运维专员', regions: ['四川省-成都市'] },
  { name: '范军军', role: '运维专员', regions: ['四川省-成都市'] },
  { name: '魏山', role: '运维专员', regions: ['新疆维吾尔自治区-乌鲁木齐市'] },
  { name: '程鹏铨', role: '运维专员', regions: ['上海市-上海市'] },
  { name: '伍仲文', role: '运维专员', regions: ['上海市-上海市', '浙江省-嘉兴市'] },
];

export function isEmpty(value: unknown): boolean {
  return value === null || value === undefined || value === '' || value === '-';
}

export function displayText(value: unknown, fallback = '—'): string {
  if (isEmpty(value)) return fallback;
  return String(value);
}

/** 详情页空值展示为「无」 */
export function displayUILabel(value: unknown): string {
  return displayText(value, '无');
}

/** 沪牌：车牌以「沪」开头 */
export function isShanghaiPlate(plateNo: string): boolean {
  return String(plateNo || '').trim().startsWith('沪');
}

/** 当前位置列：优先展示 GPS 定位具体地址 */
export function resolveGpsLocationAddress(record: VehicleRecord, fallback = '—'): string {
  if (!isEmpty(record.locationAddress)) {
    return String(record.locationAddress).trim();
  }
  return displayText(record.location, fallback);
}

export function normalizePlate(plate: string): string {
  return plate.replace(/\s+/g, '').toUpperCase();
}

export function parseMultiPlates(text: string): string[] {
  const raw = text.trim();
  if (!raw) return [];
  const lines = raw.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const plates: string[] = [];
  const seen = new Set<string>();
  for (const line of lines) {
    const parts = line.split(/[,，、\s]+/).map((p) => p.trim()).filter(Boolean);
    for (const p of parts) {
      const n = normalizePlate(p);
      if (n && !seen.has(n)) {
        seen.add(n);
        plates.push(n);
      }
    }
  }
  return plates;
}

export const MUNICIPALITIES = ['北京市', '上海市', '天津市', '重庆市'];

export const OPERATE_CITY_SEED = [
  '北京市-北京市', '上海市-上海市', '天津市-天津市', '重庆市-重庆市',
  '广东省-广州市', '广东省-深圳市', '广东省-佛山市', '广东省-韶关市',
  '浙江省-嘉兴市', '浙江省-杭州市', '浙江省-湖州市', '浙江省-金华市', '浙江省-宁波市', '浙江省-绍兴市',
  '江苏省-常州市', '江苏省-南京市', '江苏省-苏州市',
  '四川省-成都市', '四川省-德阳市', '河南省-开封市', '湖北省-武汉市',
  '陕西省-西安市', '新疆维吾尔自治区-乌鲁木齐市',
];

export function formatOperateCity(location: string, fallback = '—'): string {
  if (isEmpty(location)) return fallback;
  const loc = String(location).trim();
  if (loc.includes('-')) {
    const [province, city = ''] = loc.split('-').map((s) => s.trim());
    if (province && city) return `${province}-${city}`;
    if (province) return province;
  }
  for (const municipality of MUNICIPALITIES) {
    if (loc.startsWith(municipality)) return `${municipality}-${municipality}`;
  }
  const provMatch = loc.match(/^(.*?(?:省|自治区))/);
  if (!provMatch) return loc.includes('市') ? loc : fallback;
  const province = provMatch[1];
  const rest = loc.slice(provMatch[1].length).replace(/^[-—\s]+/, '');
  const cityMatch = rest.match(/^(.+?市)/) || rest.match(/^(.+?(?:州|盟|地区))/);
  if (cityMatch) return `${province}-${cityMatch[1]}`;
  return province;
}

/** 列表展示用：长省级行政区简写（如 新疆维吾尔自治区 → 新疆） */
const LONG_PROVINCE_SHORT: Record<string, string> = {
  新疆维吾尔自治区: '新疆',
  广西壮族自治区: '广西',
  宁夏回族自治区: '宁夏',
  内蒙古自治区: '内蒙古',
  西藏自治区: '西藏',
  香港特别行政区: '香港',
  澳门特别行政区: '澳门',
};

export function formatOperateCityShort(location: string, fallback = '—'): string {
  const full = formatOperateCity(location, fallback);
  if (full === fallback) return full;
  if (!full.includes('-')) return LONG_PROVINCE_SHORT[full] || full;
  const [province, city = ''] = full.split('-');
  const shortProv = LONG_PROVINCE_SHORT[province] || province;
  return city ? `${shortProv}-${city}` : shortProv;
}

export type OperateCitySource = '车机' | 'GPS' | '人工';

/** 列表合同编号 → 新标签打开租赁合同详情（原型深链） */
export function openLeaseContractDetail(contractNo: string): void {
  const code = String(contractNo || '').trim();
  if (!code || code === '-' || code === '—') return;
  const url = `/prototypes/lease-contract-management?contractCode=${encodeURIComponent(code)}&view=split`;
  window.open(url, '_blank', 'noopener,noreferrer');
}

export function resolveOperateCitySource(record: VehicleRecord): OperateCitySource | '' {
  if (isEmpty(record.location)) return '';
  if (record.operateCitySource) return record.operateCitySource;
  if (record.telematicsLinked === true) return '车机';
  if (record.telematicsLinked === false && !isEmpty(record.gpsTime)) return 'GPS';
  if (!isEmpty(record.gpsTime)) return 'GPS';
  return '人工';
}

/**
 * 详情侧栏「定位信息」来源：优先车机 → 其次 GPS 平台 → 最后人工。
 * 不读 operateCitySource 覆盖（避免与硬件接入优先级冲突）。
 */
export function resolveLocationInfoSource(record: VehicleRecord): OperateCitySource {
  if (record.telematicsLinked === true) return '车机';
  if (!isEmpty(record.gpsTime)) return 'GPS';
  if (
    typeof record.gpsLat === 'number'
    && typeof record.gpsLng === 'number'
    && Number.isFinite(record.gpsLat)
    && Number.isFinite(record.gpsLng)
  ) {
    return 'GPS';
  }
  if (!isEmpty(record.locationAddress) && record.locationAddress !== record.location) {
    return 'GPS';
  }
  return '人工';
}

/** 在线状态仅展示「在线 / 离线」 */
export function formatOnlineStatusLabel(raw: unknown): '在线' | '离线' {
  const text = isEmpty(raw) ? '' : String(raw).trim();
  if (text === '在线' || /online/i.test(text)) return '在线';
  return '离线';
}

export function operateCitySourceTagClass(source: OperateCitySource): string {
  if (source === '车机') return 'vm-tag vm-tag-teal';
  if (source === 'GPS') return 'vm-tag vm-tag-gps';
  return 'vm-tag vm-tag-manual';
}

export function canEditOperateCity(record: VehicleRecord): boolean {
  return resolveOperateCitySource(record) === '人工';
}

export function parseRegionParts(regionText: string): { province: string; city: string } {
  const text = isEmpty(regionText) ? '' : String(regionText).trim();
  if (!text) return { province: '', city: '' };
  const dash = text.indexOf('-');
  if (dash >= 0) {
    return {
      province: text.slice(0, dash).trim(),
      city: text.slice(dash + 1).trim(),
    };
  }
  if (text.includes('省') || text.includes('自治区') || text.endsWith('市')) {
    return { province: text, city: '' };
  }
  return { province: '', city: text };
}

/** 大区筛选项（华东、华南等） */
export const AREA_REGION_OPTIONS = [
  '华东',
  '华南',
  '华中',
  '华北',
  '东北',
  '西南',
  '西北',
] as const;

const PROVINCE_TO_AREA_REGION: Record<string, string> = {
  上海市: '华东',
  江苏省: '华东',
  浙江省: '华东',
  安徽省: '华东',
  福建省: '华东',
  江西省: '华东',
  山东省: '华东',
  广东省: '华南',
  广西壮族自治区: '华南',
  海南省: '华南',
  河南省: '华中',
  湖北省: '华中',
  湖南省: '华中',
  北京市: '华北',
  天津市: '华北',
  河北省: '华北',
  山西省: '华北',
  内蒙古自治区: '华北',
  辽宁省: '东北',
  吉林省: '东北',
  黑龙江省: '东北',
  重庆市: '西南',
  四川省: '西南',
  贵州省: '西南',
  云南省: '西南',
  西藏自治区: '西南',
  陕西省: '西北',
  甘肃省: '西北',
  青海省: '西北',
  宁夏回族自治区: '西北',
  新疆维吾尔自治区: '西北',
};

/** 根据运营城市解析车辆所属大区 */
export function resolveVehicleAreaRegion(record: VehicleRecord): string {
  const cityFull = formatOperateCity(record.location, '');
  if (!cityFull || cityFull === '—') return '';
  const { province } = parseRegionParts(cityFull);
  if (!province) return '';
  return PROVINCE_TO_AREA_REGION[province] || '';
}

export function matchAreaRegionFilter(record: VehicleRecord, filterValue: string): boolean {
  const query = filterValue.trim();
  if (!query) return true;
  const region = resolveVehicleAreaRegion(record);
  if (!region) return false;
  return region === query || region.includes(query);
}

/** 非运营车辆台账类型：运营状态强制为「在库-不可交付」 */
export const NON_OPERATING_OPERATE_STATUS = '在库-不可交付' as const;

export function isNonOperating(record: Pick<VehicleRecord, 'vehicleLedgerType'>): boolean {
  return record.vehicleLedgerType === '非运营车辆';
}

/**
 * 解析展示/落库用的运营状态：
 * 非运营车辆一律为「在库-不可交付」（不可改为租赁/物流/可交付等）。
 */
export function resolveOperateStatus(record: Pick<VehicleRecord, 'vehicleLedgerType' | 'operateStatus'>): string {
  if (isNonOperating(record)) return NON_OPERATING_OPERATE_STATUS;
  return formatOperateStatusLabel(record.operateStatus, '');
}

/** 规范化单车记录（种子加载、保存回写时保证非运营口径） */
export function normalizeVehicleRecord(record: VehicleRecord): VehicleRecord {
  if (!isNonOperating(record)) return record;
  if (record.operateStatus === NON_OPERATING_OPERATE_STATUS) return record;
  return { ...record, operateStatus: NON_OPERATING_OPERATE_STATUS };
}

export function normalizeVehicleRecords(records: readonly VehicleRecord[]): VehicleRecord[] {
  return records.map(normalizeVehicleRecord);
}

export function isOperatingFleet(record: VehicleRecord): boolean {
  if (isNonOperating(record)) return false;
  if (record.operateStatus === '退出运营') return false;
  return true;
}

export function daysUntilExpire(
  dateStr: string,
  referenceDate: Date = new Date(),
): number | null {
  if (isEmpty(dateStr)) return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr.slice(0, 10));
  if (!match || Number.isNaN(referenceDate.getTime())) return null;

  const year = Number(match[1]);
  const monthIndex = Number(match[2]) - 1;
  const day = Number(match[3]);
  const targetUtc = Date.UTC(year, monthIndex, day);
  const targetDate = new Date(targetUtc);
  if (
    targetDate.getUTCFullYear() !== year
    || targetDate.getUTCMonth() !== monthIndex
    || targetDate.getUTCDate() !== day
  ) {
    return null;
  }

  const referenceUtc = Date.UTC(
    referenceDate.getFullYear(),
    referenceDate.getMonth(),
    referenceDate.getDate(),
  );
  return Math.round((targetUtc - referenceUtc) / 86400000);
}

/**
 * 列表 / 筛选用证照状态（正常 / 异常）。
 * - **非沪牌**：优先台账 `licenseStatus`；缺省时按行驶证检验有效期是否过期推断
 * - **沪牌（特例）**：只按**等级评定时间**是否过期判定，**不**看行驶证检验有效期、也**不**直接采用台账 licenseStatus
 */
export function resolveLicenseDisplayStatus(record: VehicleRecord): '正常' | '异常' {
  if (isShanghaiPlate(record.plateNo)) {
    const ratingRaw = isEmpty(record.ratingTime) || record.ratingTime === '-' || record.ratingTime === '—'
      ? ''
      : String(record.ratingTime).trim().slice(0, 10);
    if (!ratingRaw) return '异常';
    const days = daysUntilExpire(ratingRaw);
    if (days !== null && days < 0) return '异常';
    return '正常';
  }

  if (record.licenseStatus === '异常') return '异常';
  if (record.licenseStatus === '正常') return '正常';
  const days = daysUntilExpire(record.inspectExpire);
  if (days !== null && days < 0) return '异常';
  return '正常';
}

export function isLicenseExpired(record: VehicleRecord): boolean {
  return resolveLicenseDisplayStatus(record) === '异常';
}

export function matchKpi(record: VehicleRecord, key: KpiKey): boolean {
  const status = record.operateStatus;
  switch (key) {
    case 'all': return isOperatingFleet(record);
    case 'lease': return status === '租赁';
    case 'logistics': return status === '物流';
    case 'stock': return isStockOperateStatus(status) && !isNonOperating(record);
    case 'nonOperating': return isNonOperating(record);
    case 'exit': return status === '退出运营';
    case 'licenseAbnormal': return isLicenseExpired(record);
    case 'insuranceAbnormal': return record.insuranceStatus === '异常';
    default: return true;
  }
}

export function countKpi(records: VehicleRecord[], key: KpiKey): number {
  return records.filter((r) => matchKpi(r, key)).length;
}

export function resolveProjectName(record: VehicleRecord): string {
  return resolveProjectDelivery(record).projectName;
}

export interface ProjectDeliveryInfo {
  projectName: string;
  contractNo: string;
  companyName: string;
}

export function isDeliveredToLeaseOrLogisticsProject(record: VehicleRecord): boolean {
  return record.operateStatus === '租赁' || record.operateStatus === '物流';
}

/** 所属项目：仅展示已交付至租赁/物流项目的三元信息 */
export function resolveProjectDelivery(
  record: VehicleRecord,
  emptyLabel = '—',
): ProjectDeliveryInfo {
  if (!isDeliveredToLeaseOrLogisticsProject(record)) {
    return {
      projectName: emptyLabel,
      contractNo: emptyLabel,
      companyName: emptyLabel,
    };
  }
  return {
    projectName: displayText(record.projectName, emptyLabel),
    contractNo: displayText(record.contractNo, emptyLabel),
    companyName: displayText(record.customer, emptyLabel),
  };
}

export function isThirdPartyLease(record: VehicleRecord): boolean {
  return record.vehicleSource === '外租';
}

export function resolveThirdPartyLeaseCompany(record: VehicleRecord, emptyLabel = '—'): string {
  if (!isThirdPartyLease(record)) return emptyLabel;
  return displayText(record.leaseCompany, emptyLabel);
}

/** 品牌·型号（中间点分隔，空值回落） */
export function formatBrandModel(record: VehicleRecord, emptyLabel = '—'): string {
  const brand = isEmpty(record.brand) ? '' : String(record.brand).trim();
  const model = isEmpty(record.model) ? '' : String(record.model).trim();
  if (brand && model) return `${brand}·${model}`;
  if (brand || model) return brand || model;
  return emptyLabel;
}

/**
 * 车辆来源主行：仅展示来源类型（自有 / 外租 / 挂靠）
 */
export function formatVehicleSourcePrimary(record: VehicleRecord, emptyLabel = '—'): string {
  const source = isEmpty(record.vehicleSource) ? '' : String(record.vehicleSource).trim();
  return source || emptyLabel;
}

/**
 * 车辆来源辅行：
 * - 自有 → 该车辆为自行采购
 * - 外租 → 租赁来源公司名称
 * - 挂靠 → 挂靠来源公司名称
 */
export function formatVehicleSourceSecondary(record: VehicleRecord, emptyLabel = '—'): string {
  const source = isEmpty(record.vehicleSource) ? '' : String(record.vehicleSource).trim();
  if (!source) return emptyLabel;
  if (source === '自有') return '该车辆为自行采购';
  const company = displayText(record.leaseCompany, '');
  if (source === '外租') return company || '未录入租赁来源公司';
  if (source === '挂靠') return company || '未录入挂靠来源公司';
  return emptyLabel;
}

/**
 * 车辆来源完整展示（详情/筛选用）：主类型 + 辅文
 */
export function formatVehicleSourceDisplay(record: VehicleRecord, emptyLabel = '—'): string {
  const primary = formatVehicleSourcePrimary(record, '');
  if (!primary) return emptyLabel;
  const secondary = formatVehicleSourceSecondary(record, '');
  if (!secondary || secondary === emptyLabel) return primary;
  if (primary === '自有') return `${primary}（${secondary}）`;
  return `${primary} · ${secondary}`;
}

/** 停放点类型：按名称识别停车场或维修站 */
export type ParkingSiteKind = 'parking' | 'repair';

export function resolveParkingSiteKind(parkingName: unknown): ParkingSiteKind {
  const name = String(parkingName ?? '').trim();
  if (!name || name === '-' || name === '—') return 'parking';
  // 维修/服务优先（如「嘉兴华昱维修站停车场」「成都宇通服务站停车场」）
  if (/维修站|服务站|修理厂|检测站/.test(name)) return 'repair';
  return 'parking';
}

export function formatParkingSiteKindLabel(kind: ParkingSiteKind): string {
  return kind === 'repair' ? '维修站' : '停车场';
}

/** 停放区域展示：仅在库显示停车场/维修站；非在库提示文案；在库缺失为数据质量警示 */
export type ParkingAreaDisplayVariant = 'value' | 'na' | 'missing';

export function formatParkingAreaDisplay(record: VehicleRecord): {
  text: string;
  muted: boolean;
  caption: string;
  variant: ParkingAreaDisplayVariant;
  hint: string;
  title: string;
  siteKind: ParkingSiteKind | null;
} {
  const vehicleStatus = String(record.vehicleStatus || '').trim();
  if (vehicleStatus === '调拨中') {
    return {
      text: '车辆未在库',
      muted: true,
      caption: '停放区域',
      variant: 'na',
      hint: '车辆调拨中',
      title: '调拨通过审批且调拨方完成调拨信息记录后，车辆视为未在库，不展示停放区域',
      siteKind: null,
    };
  }
  if (vehicleStatus === '异动中') {
    return {
      text: '车辆未在库',
      muted: true,
      caption: '停放区域',
      variant: 'na',
      hint: '车辆异动中',
      title: '异动通过审批并开始执行后，车辆视为未在库，不展示停放区域',
      siteKind: null,
    };
  }
  if (!isStockOperateStatus(record.operateStatus)) {
    return {
      text: '车辆未在库',
      muted: true,
      caption: '停放区域',
      variant: 'na',
      hint: '履约中不展示',
      title: '车辆不在库（如租赁/物流交付中），列表不展示停放区域',
      siteKind: null,
    };
  }
  if (!hasLastParkingArea(record)) {
    return {
      text: '未录入停放区域',
      muted: true,
      caption: '停车场 / 维修站',
      variant: 'missing',
      hint: '疑似迁移缺漏，请核对',
      title: '在库车辆通常应有停车场或维修站。此处为空多为旧系统迁移缺漏或未补录，请核对后维护',
      siteKind: null,
    };
  }
  const text = String(record.parking).trim();
  const siteKind = resolveParkingSiteKind(text);
  return {
    text,
    muted: false,
    caption: formatParkingSiteKindLabel(siteKind),
    variant: 'value',
    hint: '',
    title: text,
    siteKind,
  };
}

export type ComplianceAlertLevel = 'ok' | 'tip' | 'warn';

export interface ComplianceAlertItem {
  level: Exclude<ComplianceAlertLevel, 'ok'>;
  text: string;
}

export interface ComplianceSummary {
  level: ComplianceAlertLevel;
  text: string;
}

const LICENSE_EXPIRING_SOON_DAYS = 90;
const RATING_EXPIRING_SOON_DAYS = 90;

function pushExpiryAlerts(
  items: ComplianceAlertItem[],
  label: string,
  dateStr: string | undefined,
  soonDays: number,
): void {
  if (!dateStr || isEmpty(dateStr)) return;
  const days = daysUntilExpire(dateStr);
  if (days === null) return;
  if (days < 0) {
    items.push({ level: 'warn', text: `${label}已过期 ${Math.abs(days)} 天` });
  } else if (days <= soonDays) {
    items.push({ level: 'tip', text: `${label}临期（剩 ${days} 天）` });
  }
}

/**
 * 详情「交车合规摘要」：交强/商业（30 天临期）、行驶证与等级评定（90 天临期）；
 * 过期为警示，临期为提示；多项合并为一句话。
 */
export function buildComplianceAlertItems(
  record: VehicleRecord,
  insurance?: { compulsory?: string; commercial?: string },
): ComplianceAlertItem[] {
  const items: ComplianceAlertItem[] = [];
  pushExpiryAlerts(items, '交强险', insurance?.compulsory, 30);
  pushExpiryAlerts(items, '商业险', insurance?.commercial, 30);
  pushExpiryAlerts(items, '行驶证', record.inspectExpire, LICENSE_EXPIRING_SOON_DAYS);
  pushExpiryAlerts(items, '等级评定', record.ratingTime, RATING_EXPIRING_SOON_DAYS);
  return items;
}

/** 正常态也展示；多项合并为一句，避免多行撑乱布局 */
export function composeComplianceSummary(items: ComplianceAlertItem[]): ComplianceSummary {
  if (!items.length) {
    return { level: 'ok', text: '保险与证照状态正常，暂无临期或过期事项' };
  }
  const hasWarn = items.some((item) => item.level === 'warn');
  const cores = items.map((item) => item.text.replace(/，请关注办理$|，请尽快处理$/, ''));
  if (cores.length === 1) {
    return {
      level: hasWarn ? 'warn' : 'tip',
      text: `${cores[0]}${hasWarn ? '，请尽快处理' : '，请关注办理'}`,
    };
  }
  return {
    level: hasWarn ? 'warn' : 'tip',
    text: `${cores.join('、')}${hasWarn ? '，请尽快处理' : '，请关注办理'}`,
  };
}

/** 标注工具切换合规摘要演示态（>3 项用 select） */
export type ComplianceDemoKey =
  | 'auto'
  | 'none'
  | 'compulsory_tip'
  | 'compulsory_warn'
  | 'commercial_tip'
  | 'commercial_warn'
  | 'license_tip'
  | 'license_warn'
  | 'rating_tip'
  | 'rating_warn'
  | 'multi';

const COMPLIANCE_DEMO_PRESETS: Record<Exclude<ComplianceDemoKey, 'auto'>, ComplianceAlertItem[]> = {
  none: [],
  compulsory_tip: [{ level: 'tip', text: '交强险临期（剩 13 天）' }],
  compulsory_warn: [{ level: 'warn', text: '交强险已过期 8 天' }],
  commercial_tip: [{ level: 'tip', text: '商业险临期（剩 21 天）' }],
  commercial_warn: [{ level: 'warn', text: '商业险已过期 5 天' }],
  license_tip: [{ level: 'tip', text: '行驶证临期（剩 45 天）' }],
  license_warn: [{ level: 'warn', text: '行驶证已过期 12 天' }],
  rating_tip: [{ level: 'tip', text: '等级评定临期（剩 60 天）' }],
  rating_warn: [{ level: 'warn', text: '等级评定已过期 3 天' }],
  multi: [
    { level: 'tip', text: '交强险临期（剩 13 天）' },
    { level: 'warn', text: '商业险已过期 5 天' },
    { level: 'tip', text: '行驶证临期（剩 45 天）' },
    { level: 'warn', text: '等级评定已过期 3 天' },
  ],
};

export function normalizeComplianceDemoKey(value: unknown): ComplianceDemoKey {
  const key = typeof value === 'string' ? value : '';
  if (
    key === 'none'
    || key === 'compulsory_tip'
    || key === 'compulsory_warn'
    || key === 'commercial_tip'
    || key === 'commercial_warn'
    || key === 'license_tip'
    || key === 'license_warn'
    || key === 'rating_tip'
    || key === 'rating_warn'
    || key === 'multi'
  ) {
    return key;
  }
  return 'auto';
}

/** 跟随数据或强制演示态解析交车合规摘要（始终返回一句摘要） */
export function resolveComplianceSummary(
  record: VehicleRecord,
  insurance?: { compulsory?: string; commercial?: string },
  demoKey: ComplianceDemoKey = 'auto',
): ComplianceSummary {
  const items = demoKey === 'auto'
    ? buildComplianceAlertItems(record, insurance)
    : COMPLIANCE_DEMO_PRESETS[demoKey].map((item) => ({ ...item }));
  return composeComplianceSummary(items);
}

/** 数据库中的「最后停放区域」名称（交车后列表可清空，本字段应保留） */
export function resolveLastParkingAreaName(record: VehicleRecord): string {
  if (!isEmpty(record.lastParkingArea)) return String(record.lastParkingArea).trim();
  // 在库时列表 parking 即当前停放，可视为最后停放
  if (!isEmpty(record.parking)) return String(record.parking).trim();
  return '';
}

/** 是否具备有效的「最后停放区域」（数据库字段 / 在库时的当前停放） */
export function hasLastParkingArea(record: VehicleRecord): boolean {
  return Boolean(resolveLastParkingAreaName(record));
}

/**
 * 由最后停放区域映射运营区域（省-市）。
 * 依据数据库最后停放区域，而非列表展示用的当前停放列。
 */
export function resolveLastParkingRegion(record: VehicleRecord): string {
  const parkingName = resolveLastParkingAreaName(record);
  if (!parkingName) return '';
  return PARKING_REGION_MAP[parkingName] || '';
}

export function resolveVehicleRegion(record: VehicleRecord, fallback = '未指定区域'): string {
  const fromParking = resolveLastParkingRegion(record);
  if (fromParking) return fromParking;
  const fromLocation = formatOperateCity(record.location, '');
  return fromLocation || fallback;
}

function normalizeRegionPart(part: string): string {
  return String(part || '')
    .trim()
    .replace(/(维吾尔|壮族|回族)/g, '')
    .replace(/(特别行政区|自治区|省|市)$/g, '');
}

/**
 * 车辆停放区域（省-市）与运维人员负责区域是否匹配：
 * 1) 精确省-市一致；
 * 2) 运维人员仅配置省份（或 `省-*` / `省-全省`）时，匹配该省下全部地市。
 */
function regionMatchesStaff(vehicleRegion: string, staffRegion: string): boolean {
  if (!vehicleRegion || !staffRegion) return false;
  if (vehicleRegion === staffRegion) return true;

  const [vProvRaw = '', vCityRaw = ''] = vehicleRegion.split('-');
  const [sProvRaw = '', sCityRaw = ''] = staffRegion.split('-');
  const vProv = normalizeRegionPart(vProvRaw);
  const sProv = normalizeRegionPart(sProvRaw);
  const vCity = normalizeRegionPart(vCityRaw);
  const sCity = normalizeRegionPart(sCityRaw);

  // 全省管控：运维区域只写省，或写「省-*」「省-全省」
  const staffIsProvinceWide =
    !sCityRaw
    || sCityRaw === '*'
    || sCityRaw === '全省'
    || /^全/.test(sCityRaw);

  if (staffIsProvinceWide) {
    return Boolean(vProv && sProv && vProv === sProv);
  }

  if (vProv && sProv && vProv === sProv) {
    if (!vCity || !sCity) return false;
    return vCity === sCity;
  }

  // 兼容旧数据：仅市名互相包含
  if (sCity && vCity && (vCity.includes(sCity) || sCity.includes(vCity))) return true;
  return false;
}

/** 按最后停放区域（省-市）匹配当前运维负责人；支持全省管控人员 */
export function resolveOpsStaffCandidates(record: VehicleRecord): typeof OPS_STAFF {
  const region = resolveLastParkingRegion(record);
  if (!region) return [];
  return OPS_STAFF.filter((staff) => staff.regions.some((r) => regionMatchesStaff(region, r)));
}

export function resolveOpsManagers(record: VehicleRecord): string[] {
  if (record.opsManagers?.length) return record.opsManagers;
  return resolveOpsStaffCandidates(record).map((s) => s.name).slice(0, 2);
}

/** 运维指派操作记录：有显式日志用显式；否则按当前负责人生成一条区域匹配种子 */
export function resolveOpsAssignLogs(record: VehicleRecord): OpsAssignLog[] {
  if (record.opsAssignLogs?.length) return record.opsAssignLogs;
  const managers = resolveOpsManagers(record);
  if (!managers.length) return [];
  return [{
    id: `ops-seed-${record.id}`,
    operatedAt: String(record.gpsTime || record.lastDeliveryTime || '2026-07-20 00:00').slice(0, 16),
    operator: '系统（区域匹配）',
    assignees: managers,
  }];
}

export function formatOpsAssignNow(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function formatMileage(mile: string, force = false, emptyFallback = '—'): string {
  if (isEmpty(mile)) return force ? '0 km' : emptyFallback;
  const num = Number(mile);
  if (!Number.isFinite(num)) return String(mile);
  return `${num.toLocaleString('zh-CN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} km`;
}

export type MileageSource = '车机' | 'GPS' | '交车登记' | '还车登记';

function normalizeMileNumber(raw: unknown): number | null {
  if (isEmpty(raw)) return null;
  const num = Number(String(raw).replace(/,/g, '').trim());
  return Number.isFinite(num) ? num : null;
}

function parseLooseTime(raw: string): number {
  if (isEmpty(raw)) return 0;
  const t = Date.parse(String(raw).trim().replace(' ', 'T'));
  return Number.isFinite(t) ? t : 0;
}

/**
 * 里程来源：优先显式字段；否则车机/GPS；再按与交/还车里程是否一致及时间先后推断。
 * 不改种子 JSON，仅界面推断。
 */
export function resolveMileageSource(record: VehicleRecord): MileageSource | '' {
  if (isEmpty(record.mileage)) return '';
  if (record.mileageSource) return record.mileageSource;

  if (record.telematicsLinked === true || record.onlineStatus === '在线') return '车机';
  if (record.telematicsLinked === false && !isEmpty(record.gpsTime)) return 'GPS';

  const mile = normalizeMileNumber(record.mileage);
  const deliveryMile = normalizeMileNumber(record.lastDeliveryMile);
  const returnMile = normalizeMileNumber(record.lastReturnMile);
  const deliveryAt = parseLooseTime(record.lastDeliveryTime);
  const returnAt = parseLooseTime(record.lastReturnTime);

  const matchDelivery = mile !== null && deliveryMile !== null && mile === deliveryMile;
  const matchReturn = mile !== null && returnMile !== null && mile === returnMile;

  if (matchReturn && matchDelivery) {
    return returnAt >= deliveryAt ? '还车登记' : '交车登记';
  }
  if (matchReturn) return '还车登记';
  if (matchDelivery) return '交车登记';

  if (!isEmpty(record.lastReturnTime) && returnAt >= deliveryAt) return '还车登记';
  if (!isEmpty(record.lastDeliveryTime)) return '交车登记';
  if (!isEmpty(record.gpsTime)) return 'GPS';
  return '交车登记';
}

export function formatDateYmd(raw: string): string {
  if (isEmpty(raw)) return '';
  return raw.slice(0, 10);
}

export function formatGpsTime(raw: string, emptyLabel = '—'): string {
  if (isEmpty(raw)) return emptyLabel;
  const text = String(raw).trim().replace('T', ' ');
  // 仅日期：不补造 00:00:00
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text;
  // 有时分：列表辅行统一到分钟，避免秒级过长挤占邻列
  const minuteMatch = text.match(/^(\d{4}-\d{2}-\d{2})[ T](\d{2}:\d{2})(?::\d{2})?/);
  if (minuteMatch) return `${minuteMatch[1]} ${minuteMatch[2]}`;
  return text.slice(0, 16);
}

/** 定位更新相对时间：优先「N天N小时前」；不足 1 小时用分钟/刚刚 */
export function formatGpsRelativeAgo(raw: string, emptyLabel = '—'): string {
  if (isEmpty(raw)) return emptyLabel;
  const text = String(raw).trim().replace(' ', 'T');
  const t = new Date(text);
  if (Number.isNaN(t.getTime())) return emptyLabel;
  const diffMs = Math.max(0, Date.now() - t.getTime());
  const days = Math.floor(diffMs / 86400000);
  const hours = Math.floor((diffMs % 86400000) / 3600000);
  if (days === 0 && hours === 0) {
    const mins = Math.floor(diffMs / 60000);
    if (mins <= 0) return '刚刚';
    return `${mins}分钟前`;
  }
  if (days === 0) return `${hours}小时前`;
  if (hours === 0) return `${days}天前`;
  return `${days}天${hours}小时前`;
}

/** 交还车里程，无数据时返回空 */
export function formatHandoverMileage(mile: string, emptyLabel = ''): string {
  if (isEmpty(mile)) return emptyLabel;
  const num = Number(mile);
  if (!Number.isFinite(num)) return String(mile);
  return `${num.toLocaleString('zh-CN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} km`;
}

/** 交还车时间，精确到分钟 */
export function formatHandoverDateTimeMinute(raw: string, emptyLabel = ''): string {
  if (isEmpty(raw)) return emptyLabel;
  const text = String(raw).trim().replace('T', ' ');
  const match = text.match(/^(\d{4}-\d{2}-\d{2})[ T](\d{2}:\d{2})/);
  if (match) return `${match[1]} ${match[2]}`;
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text;
  return text.slice(0, 16);
}

export interface VehicleGpsCoords {
  lat: number;
  lng: number;
}

const LOCATION_COORDS: Record<string, [number, number]> = {
  '广东省广州市': [23.1291, 113.2644],
  '广东省佛山市': [23.0218, 113.1219],
  '广东省': [23.3790, 113.7633],
  '上海市奉贤区': [30.9128, 121.4745],
  '上海市': [31.2304, 121.4737],
  '河南省开封市': [34.7972, 114.3075],
  '江苏省常州市': [31.8122, 119.9692],
  '江苏省苏州市': [31.2989, 120.5853],
  '江苏省南京市': [32.0603, 118.7969],
  '浙江省嘉兴市': [30.7461, 120.7555],
  '浙江省湖州市': [30.8930, 120.0881],
  '浙江省杭州市': [30.2741, 120.1551],
  '浙江省金华市': [29.0784, 119.6476],
  '浙江省宁波市': [29.8683, 121.5440],
  '浙江省绍兴市': [30.0303, 120.5800],
  '浙江省': [29.1411, 120.0985],
  '四川省成都市': [30.5728, 104.0668],
  '四川省德阳市': [31.1270, 104.3980],
  '四川省': [30.6517, 104.0757],
  '北京市大兴区': [39.7269, 116.3414],
  '北京市': [39.9042, 116.4074],
  '湖北省武汉市': [30.5928, 114.3055],
  '陕西省西安市': [34.3416, 108.9398],
  '重庆市大渡口区': [29.4840, 106.4823],
  '新疆维吾尔自治区乌鲁木齐市': [43.8256, 87.6168],
};

function findLocationCoords(location: string): [number, number] | null {
  if (isEmpty(location)) return null;
  const loc = String(location).trim();
  if (LOCATION_COORDS[loc]) return LOCATION_COORDS[loc];
  const sorted = Object.entries(LOCATION_COORDS).sort((a, b) => b[0].length - a[0].length);
  for (const [key, coords] of sorted) {
    if (loc.startsWith(key) || loc.includes(key)) return coords;
  }
  return null;
}

/** 解析车辆 GPS 坐标（样例数据按城市基准点 + 车辆 id 偏移模拟实际定位） */
export function resolveVehicleGpsCoords(record: VehicleRecord): VehicleGpsCoords | null {
  if (typeof record.gpsLat === 'number' && typeof record.gpsLng === 'number') {
    return { lat: record.gpsLat, lng: record.gpsLng };
  }
  const base = findLocationCoords(record.location);
  if (!base) return null;
  const n = parseInt(record.id, 10) || 1;
  return {
    lat: base[0] + ((n % 17) - 8) * 0.006,
    lng: base[1] + ((n % 23) - 11) * 0.006,
  };
}

/** 仅车机 / GPS 来源可打开定位地图；人工未接入定位，不可点省市看地图 */
export function canOpenLocationMap(record: VehicleRecord): boolean {
  const source = resolveOperateCitySource(record);
  if (source !== '车机' && source !== 'GPS') return false;
  return resolveVehicleGpsCoords(record) !== null;
}

export function buildMapEmbedUrl(lat: number, lng: number, span = 0.02): string {
  const safeSpan = Math.min(0.35, Math.max(0.002, span));
  const bbox = `${lng - safeSpan},${lat - safeSpan},${lng + safeSpan},${lat + safeSpan}`;
  /* 不带 marker：由弹层自绘绿/灰定位点，车辆始终居中 */
  return `https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(bbox)}&layer=mapnik`;
}

/** 原型演示：模拟 GPS 接口轮询到的下一拍坐标（车辆移动中） */
export function simulateGpsPollCoords(
  lat: number,
  lng: number,
  seed = Date.now(),
): VehicleGpsCoords {
  const step = 0.00035 + (seed % 7) * 0.00004;
  const angle = ((seed % 360) * Math.PI) / 180;
  return {
    lat: lat + Math.cos(angle) * step,
    lng: lng + Math.sin(angle) * step,
  };
}

/** 在线车辆地图轮询间隔（毫秒） */
export const VEHICLE_MAP_GPS_POLL_MS = 3000;

