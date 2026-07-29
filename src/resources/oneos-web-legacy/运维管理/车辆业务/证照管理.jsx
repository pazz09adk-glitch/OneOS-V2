// 【重要】必须使用 const Component 作为组件变量名
// 运维管理 - 车辆业务 - 证照管理（台账列表页）

const { useState, useEffect, useMemo, useRef } = React;
const moment = window.moment || window.dayjs;
const antd = window.antd;
const { 
  Form, 
  Input, 
  Select, 
  Button, 
  DatePicker, 
  Card, 
  Row, 
  Col, 
  Space, 
  Badge, 
  Alert, 
  InputNumber, 
  Divider, 
  Switch, 
  Spin, 
  Tooltip, 
  Modal,
  Progress,
  Popover,
  Tabs,
  Table,
  Tag,
  message,
  Checkbox,
  Upload
} = antd;

const CERT_EXPORT_OPTIONS = [
  { key: 'driverLicense', label: '行驶证', folder: '行驶证' },
  { key: 'transportLicense', label: '道路运输证', folder: '道路运输证' },
  { key: 'registrationCert', label: '登记证', folder: '登记证' },
  { key: 'specialEquipCert', label: '特种设备使用登记证', folder: '特种设备使用登记证' },
  { key: 'specialEquipDecal', label: '特种设备使用标识', folder: '特种设备使用标识' },
  { key: 'safetyValve', label: '安全阀', folder: '安全阀' },
  { key: 'pressureGauge', label: '压力表', folder: '压力表' }
];

const BATCH_UPLOAD_CERT_OPTIONS = [
  { key: 'driverLicense', label: '行驶证' },
  { key: 'transportLicense', label: '道路运输证' },
  { key: 'registrationCert', label: '登记证', photoOnly: true },
  { key: 'specialEquipCert', label: '特种设备使用登记证', photoOnly: true },
  { key: 'specialEquipDecal', label: '特种设备使用标识' }
];

const isBatchUploadPhotoOnlyType = (certType) => (
  BATCH_UPLOAD_CERT_OPTIONS.find((o) => o.key === certType)?.photoOnly === true
);

const BATCH_UPLOAD_OPERATOR = '张明辉';

const LC_LICENSES_STORAGE_KEY = 'oneos_lc_licenses_v1';
const LC_EDIT_PLATE_KEY = 'oneos_lc_edit_plate';
const LC_NAV_TARGET_KEY = 'oneos_lc_navigate_target';
const LC_NAV_EVENT = 'oneos-lc-return-list';

const loadLicensesFromStorage = () => {
  try {
    const raw = localStorage.getItem(LC_LICENSES_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch {
    return null;
  }
};

const persistLicensesToStorage = (data) => {
  try {
    localStorage.setItem(LC_LICENSES_STORAGE_KEY, JSON.stringify(data));
  } catch {
    /* ignore */
  }
};

const goLicenseEditPage = (plateNo, master) => {
  try {
    sessionStorage.setItem(LC_EDIT_PLATE_KEY, plateNo);
    persistLicensesToStorage(master);
  } catch {
    /* ignore */
  }
  if (typeof window.__axhubNavigate === 'function') {
    window.__axhubNavigate('证照管理-编辑');
    message.success(`已进入 [${plateNo}] 资质维护`);
    return;
  }
  message.info(`已带入 [${plateNo}] 车辆信息，请打开「证照管理-编辑」页面继续维护`);
};


/** 列表「证件状态」列：八类证照，双行四列展示 */
const LIST_CERT_STATUS_ITEMS = [
  { key: 'driverLicense', label: '行驶证', fullLabel: '行驶证' },
  { key: 'transportLicense', label: '运输证', fullLabel: '道路运输证', mergedTransport: true },
  { key: 'registrationCert', label: '登记', fullLabel: '机动车登记证书' },
  { key: 'specialEquipCert', label: '特种', fullLabel: '特种设备使用登记证' },
  { key: 'specialEquipDecal', label: '特设标', fullLabel: '特种设备使用标识' },
  { key: 'hydrogenCard', label: '加氢卡', fullLabel: '加氢卡' },
  { key: 'safetyValve', label: '安全阀', fullLabel: '安全阀检验' },
  { key: 'pressureGauge', label: '压力表', fullLabel: '压力表检验' }
];

/** 列表表头：过长标题拆为多行，收窄列宽便于一屏展示 */
const tableTitleMultiline = (...lines) => (
  <div className="lc-table-th-multiline">
    {lines.map((line, idx) => (
      <span key={idx} className="lc-table-th-line">{line}</span>
    ))}
  </div>
);

const listColumnHeaderCell = () => ({ className: 'lc-th-wrap' });

const BATCH_EXPORT_RULE_LINES = [
  '按当前筛选条件（含 KPI 看板筛选）导出，勾选证照类型各生成一个文件夹，最终打包为 ZIP。',
  '文件夹内文件以车牌号命名；仅 1 张影像时为「车牌号.jpg」，多张依次为「车牌号-1」「车牌号-2」……'
];

/** 批量导出影像命名：单张=车牌号，多张=车牌号-序号 */
const buildExportPhotoBaseName = (plateNo, index, total) => {
  if (total <= 1) return plateNo;
  return `${plateNo}-${index + 1}`;
};

/** 列表排序：退出运营车辆置底，组内保持原台账顺序 */
const sortVehiclesRetiredLast = (vehicles) => {
  const active = [];
  const retired = [];
  vehicles.forEach((v) => {
    if (v.status === '退出运营') retired.push(v);
    else active.push(v);
  });
  return [...active, ...retired];
};

/** 多车牌：优先按行解析，单行内仍支持逗号分隔 */
const parseMultiPlates = (text) => {
  const raw = (text || '').trim();
  if (!raw) return [];
  const lines = raw.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const expanded = lines.flatMap((line) => {
    if (/[,，、;；]/.test(line)) {
      return line.split(/[,，、;；]+/).map((s) => s.trim()).filter(Boolean);
    }
    return [line];
  });
  return [...new Set(expanded.map((s) => s.toUpperCase()))];
};

const loadJsZip = () => new Promise((resolve, reject) => {
  if (typeof window !== 'undefined' && window.JSZip) {
    resolve(window.JSZip);
    return;
  }
  const script = document.createElement('script');
  script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';
  script.async = true;
  script.onload = () => (window.JSZip ? resolve(window.JSZip) : reject(new Error('JSZip load failed')));
  script.onerror = () => reject(new Error('JSZip script error'));
  document.head.appendChild(script);
});

const fetchImageBlob = async (url) => {
  try {
    const res = await fetch(url, { mode: 'cors' });
    if (!res.ok) return null;
    return await res.blob();
  } catch {
    return null;
  }
};

const downloadBlobFile = (blob, filename) => {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
};

const formatExportFilename = () => {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}_${pad(d.getHours())}${pad(d.getMinutes())}`;
};

const normalizePlateNo = (plate) => (plate || '').trim().toUpperCase();

const findVehicleByPlate = (plate) => {
  const key = normalizePlateNo(plate);
  return MOCK_VEHICLES.find((v) => normalizePlateNo(v.plateNo) === key) || null;
};

/** 批量 OCR：识别车牌须在证照台账中存在，否则视为校验失败 */
const validateBatchOcrPlate = (ocrPlateNo) => {
  const normalized = normalizePlateNo(ocrPlateNo);
  if (!normalized) {
    return { plateValid: false, ocrPlateNo: '', matchedPlateNo: '', plateError: '未识别到车牌号，请更换清晰照片后重试' };
  }
  const vehicle = findVehicleByPlate(normalized);
  if (!vehicle) {
    return {
      plateValid: false,
      ocrPlateNo: normalized,
      matchedPlateNo: '',
      plateError: `识别车牌「${normalized}」与证照台账不一致，请核对照片是否为台账车辆证照`
    };
  }
  return { plateValid: true, ocrPlateNo: vehicle.plateNo, matchedPlateNo: vehicle.plateNo, plateError: '' };
};

const buildMockBatchOcrItem = (certType, photoIndex) => {
  const samplePlate = MOCK_VEHICLES[photoIndex % MOCK_VEHICLES.length]?.plateNo || '沪A00000';
  const isMismatch = Math.random() < 0.2;
  const rawOcrPlate = isMismatch ? '京A88888' : samplePlate;
  const plateCheck = validateBatchOcrPlate(rawOcrPlate);

  if (certType === 'driverLicense') {
    const fields = {
      regDate: '2024-06-05',
      issueDate: '2024-06-05',
      scrapDate: '2039-06-04',
      expireDate: '2026-06-30',
      updateType: '批量上传'
    };
    return { ...plateCheck, fields };
  }
  if (certType === 'transportLicense') {
    return {
      ...plateCheck,
      fields: {
        licenseNo: '交字310115582910号',
        issueDate: '2024-08-15',
        expireDate: '2026-08-31',
        inspectValidUntil: '2026-07-31'
      }
    };
  }
  if (certType === 'registrationCert' || certType === 'specialEquipCert') {
    return { ...plateCheck, fields: {} };
  }
  if (certType === 'specialEquipDecal') {
    return {
      ...plateCheck,
      fields: { nextInspectDate: '2027-05-20' }
    };
  }
  return { ...plateCheck, fields: {} };
};

const countBatchOcrResults = (results) => {
  if (!results || !results.length) return { ocrSuccessCount: 0, ocrFailCount: 0 };
  const ocrSuccessCount = results.filter((r) => r.plateValid).length;
  return { ocrSuccessCount, ocrFailCount: results.length - ocrSuccessCount };
};

/** 按车牌聚合识别结果，逐张确认时每组对应一个车牌及其全部照片 */
const buildOcrConfirmGroups = (results) => {
  const order = [];
  const map = new Map();
  (results || []).forEach((item, sourceIndex) => {
    const plateKey = item.plateValid
      ? normalizePlateNo(item.matchedPlateNo || item.ocrPlateNo)
      : `__invalid__${sourceIndex}`;
    if (!map.has(plateKey)) {
      map.set(plateKey, {
        plateNo: item.matchedPlateNo || item.ocrPlateNo || '',
        plateValid: !!item.plateValid,
        items: [],
        fields: { ...(item.fields || {}) }
      });
      order.push(plateKey);
    }
    const group = map.get(plateKey);
    group.items.push({ ...item, sourceIndex });
    if (item.fields) Object.assign(group.fields, item.fields);
  });
  return order.map((k) => map.get(k));
};

const createEmptyLicenseRecord = () => ({
  driverLicense: { photos: [], regDate: '', issueDate: '', scrapDate: '', expireDate: '', updateType: '直接上传', updateTime: '', updateUser: '' },
  transportLicense: { photos: [], licenseNo: '', issueDate: '', expireDate: '', inspectValidUntil: '', updateTime: '', updateUser: '' },
  registrationCert: { photos: [] },
  specialEquipCert: { photos: [] },
  specialEquipDecal: { photos: [], nextInspectDate: '', updateTime: '', updateUser: '' },
  hydrogenCard: { cardNo: '', cardType: '中石化加氢卡', balance: 0, issueDate: '', issueUser: '' },
  safetyValve: { photos: [], inspectDate: '', nextInspectDate: '' },
  pressureGauge: { photos: [], inspectDate: '', nextInspectDate: '' }
});

const applyBatchOcrGroupToCert = (existingCert, certType, group, operator) => {
  const photos = group.items.map((it) => it.photoUrl).filter(Boolean);
  const f = group.fields || {};
  const now = new Date().toLocaleString('zh-CN', { hour12: false });
  const base = existingCert ? JSON.parse(JSON.stringify(existingCert)) : {};

  if (certType === 'driverLicense') {
    const maxPhotos = photos.slice(0, 4);
    return {
      ...base,
      photos: maxPhotos,
      regDate: f.regDate || base.regDate || '',
      issueDate: f.issueDate || base.issueDate || '',
      scrapDate: f.scrapDate || base.scrapDate || '',
      expireDate: f.expireDate || base.expireDate || '',
      updateType: f.updateType || '批量上传',
      updateTime: now,
      updateUser: operator || base.updateUser || ''
    };
  }
  if (certType === 'transportLicense') {
    return {
      ...base,
      photos: photos.length ? photos.slice(0, 1) : base.photos || [],
      licenseNo: f.licenseNo || base.licenseNo || '',
      issueDate: f.issueDate || base.issueDate || '',
      expireDate: f.expireDate || base.expireDate || '',
      inspectValidUntil: f.inspectValidUntil || base.inspectValidUntil || '',
      updateTime: now,
      updateUser: operator || base.updateUser || ''
    };
  }
  if (certType === 'specialEquipDecal') {
    return {
      ...base,
      photos: photos.length ? photos : base.photos || [],
      nextInspectDate: f.nextInspectDate || base.nextInspectDate || '',
      updateTime: now,
      updateUser: operator || base.updateUser || ''
    };
  }
  if (certType === 'registrationCert') {
    return {
      ...base,
      photos: photos.length ? photos : base.photos || []
    };
  }
  if (certType === 'specialEquipCert') {
    return {
      ...base,
      photos: photos.length ? photos.slice(0, 1) : base.photos || []
    };
  }
  return base;
};

// 常用矢量图标，保证 100% 渲染且支持高保真样式
const ICONS = {
  ocr: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 22V4c0-.5.2-1 .6-1.4C5 2.2 5.5 2 6 2h12c.5 0 1 .2 1.4.6.4.4.6.9.6 1.4v18l-5-4-5 4-5-4-5 4z"/></svg>,
  upload: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>,
  camera: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>,
  warning: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  card: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>,
  success: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>,
  delete: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>,
  shield: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  vehicle: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>,
  edit: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4z"/></svg>,
  filter: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
};

// 预设的车辆列表（扩充至 5 辆以完美支持台账数据测试）
const MOCK_VEHICLES = [
  { plateNo: '沪A03561F', brand: '宇通', model: '49吨牵引车头', vin: 'LMRKH9AC0R1004086', status: '自营' },
  { plateNo: '粤B58888F', brand: '福田', model: '奥铃4.5吨冷藏车', vin: 'LGHXCAE28M6789012', status: '租赁' },
  { plateNo: '苏E33333', brand: '陕汽', model: '德龙X3000混动牵引车', vin: 'LSXCH9AE8M1094857', status: '自营' },
  { plateNo: '京A12345', brand: '东风', model: 'DFH1180厢式货车', vin: 'LKLG7C4E4NA774759', status: '退出运营' },
  { plateNo: '浙A88888', brand: '宇通', model: '氢燃料电池大巴', vin: 'LMRKH9AE2P9876543', status: '库存' }
];

// 模拟预设的所有车辆证照档案数据库
const INITIAL_LICENSE_DATA = {
  '沪A03561F': {
    driverLicense: {
      photos: ['https://picsum.photos/seed/license1/600/400', 'https://picsum.photos/seed/license2/600/400'],
      regDate: '2024-06-05',
      issueDate: '2024-06-05',
      scrapDate: '2039-06-04',
      expireDate: '2026-06-30', // 行驶证 29 天后到期（临期警告）
      updateType: '直接上传',
      updateTime: '2026-05-28 14:32:00',
      updateUser: '李明辉',
      shNextEvaluation: '2026-12-05'
    },
    transportLicense: {
      photos: ['https://picsum.photos/seed/transport/600/400'],
      licenseNo: '交字310115102345号',
      issueDate: '2024-07-12',
      expireDate: '2026-07-31', // 证件有效期 60 天后到期（临期临界）
      inspectValidUntil: '2026-07-20', // 审验有效期 49 天后（临期）
      updateTime: '2026-05-10 11:20:00',
      updateUser: '陈高伟'
    },
    registrationCert: { photos: ['https://picsum.photos/seed/regcert1/600/400'] },
    specialEquipCert: { photos: ['https://picsum.photos/seed/spec1/600/400'] },
    specialEquipDecal: { photos: ['https://picsum.photos/seed/spec2/600/400'], nextInspectDate: '2027-05-20' },
    hydrogenCard: { cardNo: 'H2-9988-7766-5544', cardType: '中石化加氢卡', balance: 12850.50, issueDate: '2025-01-15 14:30', issueUser: '能源管理部-张晓' },
    safetyValve: { photos: ['https://picsum.photos/seed/valve/600/400'], inspectDate: '2025-10-10', nextInspectDate: '2026-10-09' },
    pressureGauge: { photos: ['https://picsum.photos/seed/gauge/600/400'], inspectDate: '2025-12-15', nextInspectDate: '2026-06-14' }
  },
  '粤B58888F': {
    driverLicense: { photos: [], regDate: '', issueDate: '', scrapDate: '', expireDate: '', updateType: '直接上传', updateTime: '', updateUser: '' },
    transportLicense: {
      photos: ['https://picsum.photos/seed/trans_ocr/600/400'],
      licenseNo: '粤字440301102947号',
      issueDate: '2024-07-20',
      expireDate: '2026-07-20',
      inspectValidUntil: '2026-08-15',
      updateTime: '2026-05-15 09:30:00',
      updateUser: '黄志杰'
    },
    registrationCert: { photos: [] },
    specialEquipCert: { photos: [] },
    specialEquipDecal: { photos: [], nextInspectDate: '' },
    hydrogenCard: { cardNo: 'H2-5566-4433-2211', cardType: '中石化加氢卡', balance: 5200.00, issueDate: '2025-03-10 10:15', issueUser: '能源管理部-张晓' },
    safetyValve: { photos: [], inspectDate: '', nextInspectDate: '' },
    pressureGauge: { photos: [], inspectDate: '', nextInspectDate: '' }
  },
  '京A12345': {
    driverLicense: { photos: [], regDate: '', issueDate: '', scrapDate: '', expireDate: '', updateType: '直接上传', updateTime: '', updateUser: '' },
    transportLicense: { photos: [], licenseNo: '', issueDate: '', expireDate: '', inspectValidUntil: '', updateTime: '', updateUser: '' },
    registrationCert: { photos: [] },
    specialEquipCert: { photos: [] },
    specialEquipDecal: { photos: [], nextInspectDate: '' },
    hydrogenCard: { cardNo: '', cardType: '中石化加氢卡', balance: 0, issueDate: '', issueUser: '' },
    safetyValve: { photos: [], inspectDate: '', nextInspectDate: '' },
    pressureGauge: { photos: [], inspectDate: '', nextInspectDate: '' }
  },
  '苏E33333': {
    driverLicense: {
      photos: ['https://picsum.photos/seed/su_lic/600/400'],
      regDate: '2024-05-16',
      issueDate: '2024-05-16',
      scrapDate: '2039-05-15',
      expireDate: '2026-05-15', // 已过期（逾期 17 天）
      updateType: '直接上传',
      updateTime: '2026-05-01 10:00:00',
      updateUser: '王东东'
    },
    transportLicense: {
      photos: ['https://picsum.photos/seed/su_trans/600/400'],
      licenseNo: '苏字320501104829号',
      issueDate: '2024-08-10',
      expireDate: '2026-08-10',
      inspectValidUntil: '2026-08-10',
      updateTime: '2026-05-12 15:40:00',
      updateUser: '王东东'
    },
    registrationCert: { photos: [] },
    specialEquipCert: { photos: [] },
    specialEquipDecal: { photos: [], nextInspectDate: '' },
    hydrogenCard: { cardNo: '', cardType: '中石化加氢卡', balance: 0, issueDate: '', issueUser: '' },
    safetyValve: { photos: [], inspectDate: '', nextInspectDate: '' },
    pressureGauge: { photos: [], inspectDate: '', nextInspectDate: '' }
  },
  '浙A88888': {
    driverLicense: {
      photos: ['https://picsum.photos/seed/zhe1/600/400'],
      regDate: '2025-01-01',
      issueDate: '2025-01-01',
      scrapDate: '2040-01-01',
      expireDate: '2027-12-31', // 正常
      updateType: '直接上传',
      updateTime: '2026-01-10 11:00:00',
      updateUser: '张小凡'
    },
    transportLicense: {
      photos: ['https://picsum.photos/seed/zhe2/600/400'],
      licenseNo: '浙字330101582910号',
      issueDate: '2025-01-05',
      expireDate: '2027-12-31',
      inspectValidUntil: '2027-12-31',
      updateTime: '2026-01-10 11:00:00',
      updateUser: '张小凡'
    },
    registrationCert: { photos: ['https://picsum.photos/seed/zhe3/600/400'] },
    specialEquipCert: { photos: [] },
    specialEquipDecal: { photos: [], nextInspectDate: '' },
    hydrogenCard: { cardNo: 'H2-8888-6666-5555', cardType: '中石化加氢卡', balance: 8800.00, issueDate: '2025-05-20 16:30', issueUser: '能源管理部-张晓' },
    safetyValve: { photos: ['https://picsum.photos/seed/zhe_v/600/400'], inspectDate: '2025-12-20', nextInspectDate: '2026-12-19' },
    pressureGauge: { photos: ['https://picsum.photos/seed/zhe_g/600/400'], inspectDate: '2025-12-20', nextInspectDate: '2026-12-19' }
  }
};

const PAGE_STYLE = `
.lc-edit-page {
  font-family: system-ui, -apple-system, sans-serif;
  color: #1e293b;
}
.lc-page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}
.lc-page-title {
  font-size: 22px;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
}
.lc-layout-row {
  display: flex;
  gap: 24px;
  flex: 1;
  min-height: 0;
}
.lc-sidebar {
  width: 320px;
  flex-shrink: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
}
.lc-content-area {
  flex: 1;
  min-width: 0;
  height: 100%;
  overflow-y: auto;
  padding-right: 12px;
  padding-bottom: 80px;
}
.lc-content-area::-webkit-scrollbar {
  width: 6px;
}
.lc-content-area::-webkit-scrollbar-track {
  background: transparent;
}
.lc-content-area::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}
.lc-content-area::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
.lc-sticky-card {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-height: 0;
}
.lc-sidebar-card {
  border-radius: 16px !important;
  border: 1px solid #e2e8f0 !important;
  box-shadow: 0 4px 20px -4px rgba(15, 23, 42, 0.05) !important;
  overflow: hidden !important;
}
.lc-sidebar-card-index {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}
.lc-sidebar-card-index .ant-card-body {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 12px 16px !important;
}
.lc-sidebar-info-row {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px dashed #f1f5f9;
}
.lc-sidebar-info-row:last-child {
  border-bottom: none;
}
.lc-sidebar-label {
  font-size: 13px;
  color: #64748b;
}
.lc-sidebar-val {
  font-size: 13px;
  font-weight: 600;
  color: #0f172a;
}
.lc-nav-list {
  display: flex;
  flex-direction: column;
  gap: 5px;
  flex: 1;
  overflow-y: auto;
  padding-right: 4px;
}
.lc-nav-list::-webkit-scrollbar {
  width: 4px;
}
.lc-nav-list::-webkit-scrollbar-track {
  background: transparent;
}
.lc-nav-list::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 2px;
}
.lc-nav-list::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
.lc-nav-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  color: #475569;
  background: #f8fafc;
  border: 1px solid #f1f5f9;
  cursor: pointer;
  transition: all .2s ease;
}
.lc-nav-item:hover {
  background: #f1f5f9;
  border-color: #cbd5e1;
  color: #0f172a;
}
.lc-nav-item.active {
  background: #ecfdf5;
  border-color: #a7f3d0;
  color: #065f46;
  font-weight: 600;
  box-shadow: 0 2px 8px -2px rgba(16, 185, 129, 0.1);
}
.lc-card {
  border-radius: 16px !important;
  border: 1px solid #e2e8f0 !important;
  box-shadow: 0 4px 20px -4px rgba(15, 23, 42, 0.05) !important;
  transition: border-color .3s, box-shadow .3s;
  overflow: hidden !important;
}
.lc-card:hover {
  border-color: #cbd5e1 !important;
  box-shadow: 0 10px 25px -5px rgba(15, 23, 42, 0.08) !important;
}
.lc-card .ant-card-head {
  border-bottom: 1px solid #f1f5f9 !important;
  background: #fafbfc;
  padding: 14px 24px !important;
}
.lc-card-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  font-weight: 700;
  color: #0f172a;
}
.lc-card-subtitle {
  font-size: 11px;
  font-weight: 400;
  color: #94a3b8;
  margin-top: 2px;
}
.lc-upload-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}
.lc-upload-box {
  aspect-ratio: 4/3;
  border: 1.5px dashed #cbd5e1;
  border-radius: 12px;
  background: #f8fafc;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #64748b;
  transition: all .2s ease;
  position: relative;
  overflow: hidden;
}
.lc-upload-box:hover {
  border-color: #10b981;
  background: #ecfdf5;
  color: #10b981;
}
.lc-image-thumb {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.lc-image-mask {
  position: absolute;
  inset: 0;
  background: rgba(15, 23, 42, 0.6);
  opacity: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  transition: opacity .2s ease;
  color: #fff;
}
.lc-upload-box:hover .lc-image-mask {
  opacity: 1;
}
.lc-image-action-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(255,255,255,0.15);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background .2s;
}
.lc-image-action-btn:hover {
  background: rgba(255,255,255,0.3);
}
.lc-image-action-btn.delete:hover {
  background: #ef4444;
}
.lc-ocr-tag {
  background: #fef3c7;
  color: #d97706;
  border: 1px solid #fde68a;
  font-size: 11px;
  padding: 1px 6px;
  border-radius: 4px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}
.lc-ocr-scanline {
  position: absolute;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, transparent, #10b981, transparent);
  animation: lc-scan 1.5s infinite linear;
  z-index: 10;
  box-shadow: 0 0 8px #10b981;
}
@keyframes lc-scan {
  0% { top: 0%; }
  50% { top: 100%; }
  100% { top: 0%; }
}
.lc-sh-badge {
  background: #f5f3ff;
  color: #7c3aed;
  border: 1px solid #ddd6fe;
  font-size: 11px;
  padding: 1px 6px;
  border-radius: 4px;
  font-weight: 600;
}
.lc-form-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px 20px;
}
.lc-form-grid .ant-form-item {
  margin-bottom: 0 !important;
  display: flex !important;
  flex-direction: column !important;
}
.lc-form-grid .ant-form-item-label {
  padding-bottom: 6px !important;
  text-align: left !important;
}
.lc-form-grid .ant-form-item-control {
  width: 100% !important;
}
.lc-form-grid .ant-form-item-control-input-content {
  display: flex !important;
  width: 100% !important;
}
.lc-form-grid .ant-form-item-control-input-content > * {
  width: 100% !important;
}
.lc-form-group-title {
  font-size: 13px;
  font-weight: 600;
  color: #475569;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 6px;
}
.lc-h2-refuel-card {
  width: 100%;
  height: 160px;
  border-radius: 16px;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  position: relative;
  overflow: hidden;
  padding: 20px;
  color: #fff;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  box-shadow: 0 8px 30px rgba(15, 23, 42, 0.15);
}
.lc-h2-refuel-card::before {
  content: "";
  position: absolute;
  top: -20%;
  right: -20%;
  width: 180px;
  height: 180px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(16, 185, 129, 0.2) 0%, transparent 70%);
  filter: blur(20px);
}
.lc-h2-card-logo {
  font-size: 16px;
  font-weight: 800;
  letter-spacing: 0.05em;
  background: linear-gradient(90deg, #10b981, #34d399);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  display: flex;
  align-items: center;
  gap: 6px;
}
.lc-h2-card-number {
  font-size: 18px;
  font-weight: 700;
  font-family: monospace;
  letter-spacing: 0.1em;
  color: #f1f5f9;
}
.lc-h2-card-balance {
  font-size: 24px;
  font-weight: 800;
  font-family: monospace;
  color: #34d399;
}
.lc-h2-card-meta {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: #94a3b8;
}
.lc-page-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(12px);
  border-top: 1px solid #e2e8f0;
  padding: 12px 24px;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  z-index: 100;
  box-shadow: 0 -4px 20px rgba(15, 23, 42, 0.03);
}
.lc-ocr-flash {
  animation: flash-green .4s ease-out 2;
}
@keyframes flash-green {
  0% { background-color: transparent; }
  50% { background-color: rgba(16, 185, 129, 0.15); }
  100% { background-color: transparent; }
}

/* ==================== 列表台账页面专属样式 ==================== */
.lc-filter-card.ant-card {
  border-radius: 16px !important;
  border: 1px solid #e2e8f0 !important;
  box-shadow: 0 4px 20px -4px rgba(15, 23, 42, 0.03) !important;
  margin-bottom: 16px;
}
.lc-filter-card > .ant-card-head {
  border-bottom: 1px solid #f1f5f9 !important;
  min-height: auto;
  padding: 12px 20px !important;
}
.lc-filter-card > .ant-card-head .ant-card-head-title {
  font-size: 15px !important;
  font-weight: 700 !important;
  color: #0f172a !important;
  padding: 0 !important;
}
.lc-filter-card > .ant-card-body {
  padding: 16px 20px 20px !important;
}
.lc-filter-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px 24px;
}
@media (max-width: 1100px) {
  .lc-filter-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
@media (max-width: 720px) {
  .lc-filter-grid { grid-template-columns: 1fr; }
}
.lc-filter-field {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}
.lc-filter-field-label {
  flex: 0 0 72px;
  text-align: right;
  font-size: 13px;
  font-weight: 500;
  color: #475569;
  line-height: 1.4;
  white-space: nowrap;
}
.lc-filter-field-control {
  flex: 1;
  min-width: 0;
}
.lc-filter-field-control .ant-input,
.lc-filter-field-control .ant-select {
  width: 100%;
}
.lc-multi-plate-pop {
  width: 320px;
  padding: 4px 2px;
}
.lc-multi-plate-pop-hint {
  font-size: 12px;
  color: #64748b;
  margin-bottom: 8px;
  line-height: 1.5;
}
.lc-multi-plate-pop-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 10px;
}
.lc-multi-plate-trigger {
  cursor: pointer;
}
.lc-multi-plate-trigger .ant-input {
  cursor: pointer;
}
.lc-filter-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #f1f5f9;
}
.lc-alert-stats-row {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 16px;
}
@media (max-width: 1200px) {
  .lc-alert-stats-row { grid-template-columns: repeat(3, minmax(0, 1fr)); }
}
@media (max-width: 768px) {
  .lc-alert-stats-row { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
.lc-alert-card {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px 30px 14px 16px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  background: #fff;
  position: relative;
  overflow: hidden;
  min-width: 0;
}
.lc-alert-card-main {
  flex: 1;
  min-width: 0;
}
.lc-alert-card-icon {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.lc-alert-card-val {
  font-size: 26px;
  font-weight: 800;
  line-height: 1.1;
  color: #0f172a;
  font-variant-numeric: tabular-nums;
}
.lc-alert-card-title {
  font-size: 13px;
  font-weight: 600;
  color: #334155;
  margin-top: 2px;
}
.lc-alert-card-tip-anchor {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 2;
  line-height: 0;
}
.lc-alert-card-tip {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #94a3b8;
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid #e2e8f0;
  cursor: help;
  line-height: 0;
}
.lc-alert-card-tip:hover {
  color: #64748b;
  border-color: #cbd5e1;
  background: #fff;
}
.lc-alert-card--total { background: linear-gradient(135deg, #f8fafc 0%, #fff 100%); }
.lc-alert-card--total .lc-alert-card-icon { background: #e2e8f0; color: #475569; }
.lc-alert-card--normal { background: linear-gradient(135deg, #ecfdf5 0%, #fff 55%); border-color: #bbf7d0; }
.lc-alert-card--normal .lc-alert-card-icon { background: #d1fae5; color: #059669; }
.lc-alert-card--normal .lc-alert-card-val { color: #047857; }
.lc-alert-card--warning { background: linear-gradient(135deg, #fff7ed 0%, #fff 55%); border-color: #fed7aa; }
.lc-alert-card--warning .lc-alert-card-icon { background: #ffedd5; color: #ea580c; }
.lc-alert-card--warning .lc-alert-card-val { color: #c2410c; }
.lc-alert-card--expired { background: linear-gradient(135deg, #fef2f2 0%, #fff 55%); border-color: #fecaca; }
.lc-alert-card--expired .lc-alert-card-icon { background: #fee2e2; color: #dc2626; }
.lc-alert-card--expired .lc-alert-card-val { color: #b91c1c; }
.lc-alert-card--unuploaded { background: linear-gradient(135deg, #f8fafc 0%, #fff 55%); }
.lc-alert-card--unuploaded .lc-alert-card-icon { background: #f1f5f9; color: #64748b; }
.lc-alert-card--unuploaded .lc-alert-card-val { color: #64748b; }
.lc-alert-card-clickable {
  cursor: pointer;
  transition: box-shadow 0.2s ease, border-color 0.2s ease, transform 0.2s ease;
}
.lc-alert-card-clickable:hover {
  box-shadow: 0 4px 14px rgba(15, 23, 42, 0.08);
}
.lc-alert-card-active {
  box-shadow: 0 0 0 2px rgba(22, 93, 255, 0.2) !important;
  border-color: #165dff !important;
}
.lc-table-section { margin-bottom: 0; }
.lc-table-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px 16px;
  margin-bottom: 8px;
  min-height: 32px;
}
.lc-table-cert-legend-outer {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  justify-content: flex-start;
  gap: 10px;
  padding: 6px 4px;
}
.lc-table-toolbar-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  margin-left: auto;
}
.lc-cert-legend-items {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  font-size: 12px;
  font-weight: 400;
  color: #64748b;
}
.lc-cert-legend-item {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}
.lc-cert-legend-item--help { cursor: help; }
.lc-plate-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 13px;
  height: 25px;
  padding: 0 10px;
  border-radius: 5px;
  letter-spacing: 0.05em;
  box-shadow: 0 2px 4px rgba(0,0,0,0.06);
  border: 1.5px solid #000000;
}
.lc-plate-blue {
  background: linear-gradient(135deg, #1e40af 0%, #1d4ed8 100%);
  color: #ffffff;
  border-color: #3b82f6;
}
.lc-plate-yellow {
  background: linear-gradient(135deg, #eab308 0%, #ca8a04 100%);
  color: #0f172a;
  border-color: #facc15;
}
.lc-plate-green {
  background: linear-gradient(90deg, #34d399 0%, #a7f3d0 50%, #34d399 100%);
  color: #0f172a;
  border-color: #10b981;
}
.lc-table-card {
  background: #ffffff;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 20px -4px rgba(15, 23, 42, 0.03);
  overflow: hidden;
}
.lc-table-cert-legend-label {
  font-size: 12px;
  font-weight: 600;
  color: #64748b;
}
.lc-table-card .ant-table-thead > tr > th {
  background: #f8fafc !important;
  color: #475569 !important;
  font-weight: 700 !important;
  font-size: 13px !important;
  border-bottom: 1px solid #e2e8f0 !important;
  padding: 12px 16px !important;
  vertical-align: middle;
}
.lc-table-card .ant-table-thead > tr > th.lc-th-wrap {
  padding: 8px 8px !important;
  text-align: center;
  vertical-align: middle;
}
.lc-table-th-multiline {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  line-height: 1.3;
  white-space: normal;
  word-break: keep-all;
}
.lc-table-th-line {
  display: block;
  font-size: 12px;
  font-weight: 700;
  color: #475569;
}
.lc-list-table .ant-table-wrapper,
.lc-list-table .ant-table {
  width: 100% !important;
}
.lc-list-table .ant-table-content table {
  table-layout: fixed;
  width: 100% !important;
}
.lc-cell-ellipsis {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.lc-list-table .ant-table-tbody > tr:not(.ant-table-measure-row) > td {
  padding: 10px 8px !important;
}
.lc-table-card .ant-table-tbody > tr.ant-table-measure-row,
.lc-table-card .ant-table-tbody > tr.ant-table-measure-row > td {
  height: 0 !important;
  max-height: 0 !important;
  padding: 0 !important;
  margin: 0 !important;
  border: none !important;
  line-height: 0 !important;
  font-size: 0 !important;
  overflow: hidden !important;
  visibility: hidden !important;
}
.lc-table-card .ant-table-tbody > tr:not(.ant-table-measure-row) > td {
  padding: 14px 16px !important;
  border-bottom: 1px solid #f1f5f9 !important;
}
.lc-table-card .ant-table-tbody > tr:not(.ant-table-measure-row):hover > td {
  background: #f8fafc !important;
}
.lc-table-card .ant-table-tbody > tr.lc-row-retired:not(.ant-table-measure-row) > td {
  background: #f8fafc !important;
  color: #94a3b8;
}
.lc-table-card .ant-table-tbody > tr.lc-row-retired:hover > td {
  background: #f1f5f9 !important;
}
.lc-table-card .ant-table-tbody > tr.lc-row-retired .lc-muted-text {
  color: #94a3b8 !important;
}
.lc-table-card .ant-table-tbody > tr.lc-row-retired .ant-badge-status-text {
  color: #94a3b8 !important;
}
.lc-mini-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 4px;
}
.lc-mini-badge-success { background: #f0fdf4; color: #16a34a; border: 1px solid #bbf7d0; }
.lc-mini-badge-warning { background: #fff7ed; color: #ea580c; border: 1px solid #ffedd5; }
.lc-mini-badge-error { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; }
.lc-mini-badge-default { background: #f1f5f9; color: #64748b; border: 1px solid #e2e8f0; }
.lc-list-cert-status-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  grid-template-rows: auto auto;
  gap: 3px 2px;
  width: 100%;
  max-width: 100%;
}
.lc-list-cert-status-item {
  display: inline-flex;
  align-items: center;
  min-width: 0;
  line-height: 1.2;
}
.lc-list-cert-status-item .ant-badge {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  max-width: 100%;
  font-size: 10px;
}
.lc-list-cert-status-item .ant-badge-status-dot {
  width: 5px !important;
  height: 5px !important;
  top: 0 !important;
}
.lc-list-cert-status-item .ant-badge-status-text {
  font-size: 10px !important;
  white-space: nowrap;
  margin-left: 2px !important;
}
.lc-list-status-badge-wrap {
  display: inline-flex;
  max-width: 100%;
}
.lc-list-status-badge-wrap .ant-badge {
  display: inline-flex;
  align-items: center;
  max-width: 100%;
}
.lc-list-status-badge-text {
  font-size: 10px;
  white-space: nowrap;
  line-height: 1.2;
}
.lc-list-date-cell-status {
  margin-top: 3px;
}

.lc-dot-indicator {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  display: inline-block;
}
.lc-batch-export-types {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px 16px;
  margin-top: 8px;
}
@media (max-width: 640px) {
  .lc-batch-export-types { grid-template-columns: 1fr; }
}
.lc-batch-ocr-confirm {
  display: grid;
  grid-template-columns: minmax(200px, 340px) 1fr;
  gap: 20px;
  min-height: 420px;
}
@media (max-width: 900px) {
  .lc-batch-ocr-confirm { grid-template-columns: 1fr; }
}
.lc-batch-ocr-photos {
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: 480px;
  overflow-y: auto;
}
.lc-batch-ocr-photo-main {
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  overflow: hidden;
  cursor: zoom-in;
  background: #f8fafc;
}
.lc-batch-ocr-photo-main img {
  width: 100%;
  display: block;
  max-height: 280px;
  object-fit: contain;
}
.lc-batch-ocr-thumb-row {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.lc-batch-ocr-thumb {
  width: 56px;
  height: 56px;
  border-radius: 8px;
  border: 2px solid transparent;
  overflow: hidden;
  cursor: pointer;
  opacity: 0.75;
}
.lc-batch-ocr-thumb.active {
  border-color: #10b981;
  opacity: 1;
}
.lc-batch-ocr-thumb--fail {
  border-color: #ef4444 !important;
  opacity: 1;
}
.lc-batch-ocr-thumb img { width: 100%; height: 100%; object-fit: cover; }
.lc-batch-ocr-plate-readonly {
  font-size: 15px;
  font-weight: 700;
  color: #0f172a;
  letter-spacing: 0.04em;
}
.lc-batch-ocr-step-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 14px;
  padding: 10px 14px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
}
.lc-batch-ocr-step-val {
  font-size: 18px;
  font-weight: 800;
  color: #0f172a;
  font-variant-numeric: tabular-nums;
}
.lc-batch-ocr-photo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(72px, 1fr));
  gap: 8px;
  margin-bottom: 10px;
}
`;

const Component = function () {
  // 核心共享数据库状态，使编辑修改在列表中实时生效！
  const [allLicenses, setAllLicenses] = useState(() => (
    loadLicensesFromStorage() || JSON.parse(JSON.stringify(INITIAL_LICENSE_DATA))
  ));

  const patchAllLicenses = (updater) => {
    setAllLicenses((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      persistLicensesToStorage(next);
      return next;
    });
  };

  const DEFAULT_LIST_FILTERS = {
    plateNo: '',
    plateNos: '',
    vin: '',
    brand: '',
    model: '',
    operateStatus: '全部'
  };
  const [listFilters, setListFilters] = useState(() => ({ ...DEFAULT_LIST_FILTERS }));
  const [appliedFilters, setAppliedFilters] = useState(() => ({ ...DEFAULT_LIST_FILTERS }));
  const [multiPlateOpen, setMultiPlateOpen] = useState(false);
  const [multiPlateDraft, setMultiPlateDraft] = useState('');


  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const [prdOpen, setPrdOpen] = useState(false);
  /** total | normal | warning | expired | unuploaded */
  const [kpiFilter, setKpiFilter] = useState('total');

  useEffect(() => {
    const refreshFromStorage = () => {
      const stored = loadLicensesFromStorage();
      if (stored) setAllLicenses(stored);
    };
    const onReturn = () => {
      try {
        if (sessionStorage.getItem(LC_NAV_TARGET_KEY) === 'list') {
          sessionStorage.removeItem(LC_NAV_TARGET_KEY);
          refreshFromStorage();
        }
      } catch {
        /* ignore */
      }
    };
    window.addEventListener(LC_NAV_EVENT, onReturn);
    onReturn();
    return () => window.removeEventListener(LC_NAV_EVENT, onReturn);
  }, []);

  const [batchExportOpen, setBatchExportOpen] = useState(false);
  const [exportCertTypes, setExportCertTypes] = useState([]);
  const [batchOcrOpen, setBatchOcrOpen] = useState(false);
  const [batchOcrCertType, setBatchOcrCertType] = useState('driverLicense');
  const [batchOcrFileList, setBatchOcrFileList] = useState([]);
  const [ocrTasks, setOcrTasks] = useState([]);
  const [ocrConfirmOpen, setOcrConfirmOpen] = useState(false);
  const [ocrConfirmTask, setOcrConfirmTask] = useState(null);
  const [ocrConfirmGroups, setOcrConfirmGroups] = useState([]);
  const [ocrConfirmGroupIdx, setOcrConfirmGroupIdx] = useState(0);
  const [ocrConfirmPhotoIdx, setOcrConfirmPhotoIdx] = useState(0);
  const ocrTaskTimersRef = useRef({});

  // 辅助函数：根据车牌前缀获取车牌颜色类别
  const getPlateClass = (plate) => {
    if (plate.endsWith('F') || plate.endsWith('D') || plate.length === 8) {
      return 'lc-plate-green'; // 绿牌（新能源车）
    }
    if (plate.startsWith('粤') || plate.startsWith('京')) {
      return 'lc-plate-blue'; // 蓝牌（普通货车）
    }
    return 'lc-plate-yellow'; // 黄牌（中重卡）
  };

  // 辅助函数：获取到期天数
  const getDiffDays = (dateStr) => {
    if (!dateStr) return null;
    const expDate = new Date(dateStr);
    const today = new Date('2026-06-01'); // 锚定今天日期 2026-06-01
    expDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    const diffTime = expDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const mergeLicenseStatusTypes = (a, b) => {
    const rank = { expired: 0, warning: 1, unuploaded: 2, success: 3 };
    return (rank[a] ?? 9) <= (rank[b] ?? 9) ? a : b;
  };

  const getListCertStatus = (plateNo, item) => {
    if (item.mergedTransport) {
      const cert = getLicenseStatus(plateNo, 'transportLicense', { dateField: 'expireDate' });
      const inspect = getLicenseStatus(plateNo, 'transportLicense', { dateField: 'inspectValidUntil' });
      const type = mergeLicenseStatusTypes(cert.type, inspect.type);
      return {
        type,
        text: `证件有效期：${cert.text}；审验有效期：${inspect.text}`
      };
    }
    const st = getLicenseStatus(plateNo, item.key);
    return { type: st.type, text: st.text };
  };

  // 获取单个车辆各证件的到期状态（道路运输证可通过 dateField 区分证件有效期 / 审验有效期）
  const getLicenseStatus = (plate, key, options = {}) => {
    const item = allLicenses[plate]?.[key];
    if (!item) return { type: 'unuploaded', text: '未上传', diffDays: null };

    if (key === 'hydrogenCard') {
      return item.cardNo ? { type: 'success', text: '已绑定', diffDays: null } : { type: 'unuploaded', text: '未绑定', diffDays: null };
    }

    if (!item.photos || item.photos.length === 0) {
      return { type: 'unuploaded', text: '未上传', diffDays: null };
    }

    // 针对有日期的
    const today = new Date('2026-06-01');
    today.setHours(0,0,0,0);

    let dateValue = '';
    let warnThreshold = 30; // 默认30天警告

    if (key === 'driverLicense') {
      dateValue = item.expireDate;
      warnThreshold = 90; // 行驶证 90 天
    } else if (key === 'transportLicense') {
      dateValue = options.dateField === 'inspectValidUntil' ? item.inspectValidUntil : item.expireDate;
      warnThreshold = 60; // 运输证 60 天
    } else if (key === 'specialEquipDecal') {
      dateValue = item.nextInspectDate;
      warnThreshold = 60; // 特种设备使用标识 60 天
    } else if (key === 'safetyValve' || key === 'pressureGauge') {
      dateValue = item.nextInspectDate;
      warnThreshold = 60; // 安全阀 / 压力表 60 天
    }

    if (!dateValue) {
      return { type: 'success', text: '正常', diffDays: null }; // 已上传照片无日期的默认为正常
    }

    const expDate = new Date(dateValue);
    expDate.setHours(0, 0, 0, 0);
    const diffDays = Math.ceil((expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) {
      return { type: 'expired', text: `已到期 (逾期 ${Math.abs(diffDays)} 天)`, diffDays };
    }
    if (diffDays <= warnThreshold) {
      return { type: 'warning', text: `临期 (${diffDays} 天后)`, diffDays };
    }
    return { type: 'success', text: '正常', diffDays };
  };

  const mapLicenseTypeToBadge = (type) => {
    if (type === 'success') return 'success';
    if (type === 'warning') return 'warning';
    if (type === 'expired') return 'error';
    return 'default';
  };

  /** 列表日期列：状态文案单行展示，完整说明放 Tooltip */
  const getListStatusShortText = (status) => {
    const { type, text, diffDays } = status || {};
    if (type === 'warning') {
      return diffDays != null ? `临期${diffDays}天` : '临期';
    }
    if (type === 'expired') {
      return diffDays != null ? `逾期${Math.abs(diffDays)}天` : '已到期';
    }
    if (type === 'unuploaded') return text === '未绑定' ? '未绑定' : '未上传';
    return text || '正常';
  };

  const renderListLicenseStatusBadge = (status) => (
    <Tooltip title={status?.text || ''}>
      <span className="lc-list-status-badge-wrap">
        <Badge
          status={mapLicenseTypeToBadge(status?.type)}
          text={<span className="lc-list-status-badge-text">{getListStatusShortText(status)}</span>}
        />
      </span>
    </Tooltip>
  );

  const isRetiredVehicle = (record) => record?.status === '退出运营';

  const CERT_STATUS_LEGEND = (
    <div className="lc-cert-legend-items">
      <span className="lc-cert-legend-item"><Badge status="success" style={{ fontSize: 8 }} />正常</span>
      <Tooltip title="行驶证≤90天 / 道路运输证≤60天 / 特种设备标识≤60天 / 安全阀≤60天 / 压力表≤60天">
        <span className="lc-cert-legend-item lc-cert-legend-item--help"><Badge status="warning" style={{ fontSize: 8 }} />临期</span>
      </Tooltip>
      <Tooltip title="行驶证检验有效期到期 / 道路运输证有效期/检验时间到期 / 安全阀、压力表下次检验到期">
        <span className="lc-cert-legend-item lc-cert-legend-item--help"><Badge status="error" style={{ fontSize: 8 }} />已到期</span>
      </Tooltip>
      <span className="lc-cert-legend-item"><Badge status="default" style={{ fontSize: 8 }} />未上传</span>
    </div>
  );

  const isTransportLicenseWarning = (plateNo) => (
    getLicenseStatus(plateNo, 'transportLicense', { dateField: 'expireDate' }).type === 'warning'
    || getLicenseStatus(plateNo, 'transportLicense', { dateField: 'inspectValidUntil' }).type === 'warning'
  );

  const isTransportLicenseExpired = (plateNo) => (
    getLicenseStatus(plateNo, 'transportLicense', { dateField: 'expireDate' }).type === 'expired'
    || getLicenseStatus(plateNo, 'transportLicense', { dateField: 'inspectValidUntil' }).type === 'expired'
  );

  const isQualificationNormal = (plateNo) => {
    const d = getLicenseStatus(plateNo, 'driverLicense');
    const tCert = getLicenseStatus(plateNo, 'transportLicense', { dateField: 'expireDate' });
    const tInspect = getLicenseStatus(plateNo, 'transportLicense', { dateField: 'inspectValidUntil' });
    return d.type === 'success' && tCert.type === 'success' && tInspect.type === 'success';
  };

  const isCertNearExpiry = (plateNo) => {
    if (isTransportLicenseWarning(plateNo)) return true;
    const keys = ['driverLicense', 'specialEquipDecal', 'safetyValve', 'pressureGauge'];
    return keys.some((key) => getLicenseStatus(plateNo, key).type === 'warning');
  };

  const isCoreCertExpired = (plateNo) => {
    if (isTransportLicenseExpired(plateNo)) return true;
    const keys = ['driverLicense', 'safetyValve', 'pressureGauge'];
    return keys.some((key) => getLicenseStatus(plateNo, key).type === 'expired');
  };

  const isCertPendingUpload = (plateNo) => {
    const keys = ['driverLicense', 'transportLicense', 'specialEquipCert', 'specialEquipDecal'];
    return keys.some((key) => getLicenseStatus(plateNo, key).type === 'unuploaded');
  };

  const matchKpiFilter = (plateNo, filterKey) => {
    if (filterKey === 'total') return true;
    if (filterKey === 'normal') return isQualificationNormal(plateNo);
    if (filterKey === 'warning') return isCertNearExpiry(plateNo);
    if (filterKey === 'expired') return isCoreCertExpired(plateNo);
    if (filterKey === 'unuploaded') return isCertPendingUpload(plateNo);
    return true;
  };

  const handleKpiCardClick = (key) => {
    setKpiFilter(key);
  };

  // ==================== 统计面板数据动态推算 ====================
  const stats = useMemo(() => {
    let normal = 0;
    let warning = 0;
    let expired = 0;
    let unuploaded = 0;

    MOCK_VEHICLES.forEach((v) => {
      if (isQualificationNormal(v.plateNo)) normal++;
      if (isCertNearExpiry(v.plateNo)) warning++;
      if (isCoreCertExpired(v.plateNo)) expired++;
      if (isCertPendingUpload(v.plateNo)) unuploaded++;
    });

    return {
      total: MOCK_VEHICLES.length,
      normal,
      warning,
      expired,
      unuploaded,
    };
  }, [allLicenses]);

  const brandOptions = useMemo(() => {
    return [...new Set(MOCK_VEHICLES.map(v => v.brand))].map(b => ({ label: b, value: b }));
  }, []);

  const modelOptions = useMemo(() => {
    return [...new Set(MOCK_VEHICLES.map(v => v.model))].map(m => ({ label: m, value: m }));
  }, []);

  useEffect(() => {
    return () => {
      Object.values(ocrTaskTimersRef.current).forEach((id) => clearInterval(id));
    };
  }, []);

  const runBatchOcrTask = (taskId) => {
    if (ocrTaskTimersRef.current[taskId]) clearInterval(ocrTaskTimersRef.current[taskId]);
    ocrTaskTimersRef.current[taskId] = setInterval(() => {
      setOcrTasks((prev) => {
        const task = prev.find((t) => t.id === taskId);
        if (!task || task.status === 'done') return prev;
        const nextProgress = Math.min(100, task.progress + 12 + Math.floor(Math.random() * 18));
        if (nextProgress < 100) {
          return prev.map((t) => (t.id === taskId ? { ...t, progress: nextProgress } : t));
        }
        clearInterval(ocrTaskTimersRef.current[taskId]);
        delete ocrTaskTimersRef.current[taskId];
        const results = task.photos.map((ph, idx) => ({
          ...buildMockBatchOcrItem(task.certType, idx),
          photoUrl: ph.url,
          photoName: ph.name
        }));
        const { ocrSuccessCount, ocrFailCount } = countBatchOcrResults(results);
        return prev.map((t) => (t.id === taskId ? {
          ...t,
          progress: 100,
          status: 'done',
          results,
          ocrSuccessCount,
          ocrFailCount
        } : t));
      });
    }, 450);
  };

  const handleStartBatchOcr = () => {
    if (!batchOcrFileList.length) {
      message.warning('请先上传至少一张证照照片');
      return;
    }
    const photos = batchOcrFileList.map((f) => ({
      url: f.url || (f.originFileObj ? URL.createObjectURL(f.originFileObj) : ''),
      name: f.name
    }));
    const task = {
      id: `ocr-${Date.now()}`,
      certType: batchOcrCertType,
      certLabel: BATCH_UPLOAD_CERT_OPTIONS.find((o) => o.key === batchOcrCertType)?.label || '',
      operator: BATCH_UPLOAD_OPERATOR,
      operateTime: new Date().toLocaleString('zh-CN', { hour12: false }),
      photoCount: photos.length,
      progress: 0,
      status: 'running',
      photos,
      results: null
    };
    setOcrTasks((prev) => [task, ...prev]);
    setBatchOcrFileList([]);
    runBatchOcrTask(task.id);
    message.success('已创建批量上传任务');
  };

  const currentOcrConfirmGroup = ocrConfirmGroups[ocrConfirmGroupIdx] || null;
  const ocrConfirmTotalSheets = ocrConfirmGroups.length;

  const closeOcrConfirm = () => {
    setOcrConfirmOpen(false);
    setOcrConfirmTask(null);
    setOcrConfirmGroups([]);
    setOcrConfirmGroupIdx(0);
    setOcrConfirmPhotoIdx(0);
  };

  const finishOcrConfirmFlow = (lastPlate) => {
    if (ocrConfirmTask?.id) {
      setOcrTasks((prev) => prev.map((t) => (
        t.id === ocrConfirmTask.id ? { ...t, confirmDone: true } : t
      )));
    }
    const photoOnly = isBatchUploadPhotoOnlyType(ocrConfirmTask?.certType);
    message.success(
      lastPlate
        ? (photoOnly ? `全部确认完成，末次已同步 ${lastPlate} 证照照片` : `全部确认完成，末次已更新 ${lastPlate} 证照`)
        : '全部逐张确认完成'
    );
    closeOcrConfirm();
  };

  const goToNextOcrConfirmGroup = (lastUpdatedPlate) => {
    if (ocrConfirmGroupIdx >= ocrConfirmGroups.length - 1) {
      finishOcrConfirmFlow(lastUpdatedPlate);
      return;
    }
    setOcrConfirmGroupIdx((i) => i + 1);
    setOcrConfirmPhotoIdx(0);
  };

  const openOcrConfirm = (task) => {
    if (task.progress < 100 || !task.results) return;
    const groups = buildOcrConfirmGroups(task.results);
    if (!groups.length) {
      message.warning('暂无上传结果可确认');
      return;
    }
    setOcrConfirmTask(task);
    setOcrConfirmGroups(JSON.parse(JSON.stringify(groups)));
    setOcrConfirmGroupIdx(0);
    setOcrConfirmPhotoIdx(0);
    setOcrConfirmOpen(true);
  };

  const updateOcrConfirmField = (fieldKey, value) => {
    setOcrConfirmGroups((prev) => prev.map((g, i) => (
      i === ocrConfirmGroupIdx ? { ...g, fields: { ...g.fields, [fieldKey]: value } } : g
    )));
  };

  const handleOcrConfirmSkip = () => {
    message.info('已跳过本张，进入下一张确认');
    goToNextOcrConfirmGroup();
  };

  const handleOcrConfirmSubmit = () => {
    if (!ocrConfirmTask || !currentOcrConfirmGroup) return;
    if (!currentOcrConfirmGroup.plateValid) {
      message.error('当前识别车牌未通过校验，请跳过或重新识别');
      return;
    }
    const plateNo = currentOcrConfirmGroup.plateNo;
    const certType = ocrConfirmTask.certType;
    const certLabel = ocrConfirmTask.certLabel;
    const photoOnly = isBatchUploadPhotoOnlyType(certType);

    patchAllLicenses((prev) => {
      const copy = JSON.parse(JSON.stringify(prev));
      if (!copy[plateNo]) copy[plateNo] = createEmptyLicenseRecord();
      const existing = copy[plateNo][certType] || {};
      copy[plateNo][certType] = applyBatchOcrGroupToCert(
        existing,
        certType,
        currentOcrConfirmGroup,
        BATCH_UPLOAD_OPERATOR
      );
      return copy;
    });

    message.success(
      photoOnly
        ? `已同步 ${plateNo} 的${certLabel}照片至台账`
        : `已更新 ${plateNo} 的${certLabel}`
    );
    goToNextOcrConfirmGroup(plateNo);
  };

  const renderOcrPlateValidation = (group) => {
    if (!group) return null;
    if (group.plateValid) {
      return (
        <Alert
          type="success"
          showIcon
          message="车牌校验通过"
          description={
            <span>
              OCR 识别车牌：<span className="lc-batch-ocr-plate-readonly">{group.plateNo}</span>
              <span style={{ marginLeft: 8, fontSize: 12, color: '#64748b' }}>（已匹配台账车辆，不可修改）</span>
            </span>
          }
          style={{ marginBottom: 14, borderRadius: 10 }}
        />
      );
    }
    return (
      <Alert
        type="error"
        showIcon
        message="车牌校验失败"
        description={
          <div>
            {group.plateNo ? (
              <p style={{ margin: '0 0 6px' }}>
                OCR 识别车牌：<strong style={{ color: '#b91c1c' }}>{group.plateNo}</strong>
              </p>
            ) : null}
            <p style={{ margin: 0, fontSize: 12 }}>
              {group.items[0]?.plateError || '识别车牌与证照台账不一致，请跳过本张后继续'}
            </p>
          </div>
        }
        style={{ marginBottom: 14, borderRadius: 10 }}
      />
    );
  };

  const handleBatchExport = async () => {
    if (!exportCertTypes.length) {
      message.warning('请至少勾选一种证照类型');
      return;
    }
    const hide = message.loading({ content: '正在按筛选结果打包导出...', key: 'batchExport', duration: 0 });
    try {
      const JSZipLib = await loadJsZip();
      const zip = new JSZipLib();
      let fileCount = 0;
      const selectedOpts = CERT_EXPORT_OPTIONS.filter((o) => exportCertTypes.includes(o.key));

      for (const opt of selectedOpts) {
        const folder = zip.folder(opt.folder);
        for (const v of filteredVehicles) {
          const lic = allLicenses[v.plateNo]?.[opt.key];
          if (!lic) continue;

          const photos = lic.photos || [];
          if (!photos.length) continue;
          for (let i = 0; i < photos.length; i += 1) {
            const blob = await fetchImageBlob(photos[i]);
            const baseName = buildExportPhotoBaseName(v.plateNo, i, photos.length);
            if (blob) folder.file(`${baseName}.jpg`, blob);
            else folder.file(`${baseName}_链接.txt`, photos[i]);
            fileCount += 1;
          }
        }
      }

      if (fileCount === 0) {
        hide();
        message.warning('当前筛选条件下，所选证照类型均无可用文件可导出');
        return;
      }

      const blob = await zip.generateAsync({ type: 'blob' });
      downloadBlobFile(blob, `证照批量导出_${formatExportFilename()}.zip`);
      hide();
      message.success({ content: `导出完成，共 ${fileCount} 个文件，已按证照类型分文件夹打包`, key: 'batchExport' });
      setBatchExportOpen(false);
    } catch {
      hide();
      message.error({ content: '打包导出失败，请检查网络后重试', key: 'batchExport' });
    }
  };

  const renderOcrConfirmFields = (certType, group) => {
    if (isBatchUploadPhotoOnlyType(certType)) return null;
    const f = group?.fields || {};
    const fieldDisabled = !group?.plateValid;
    if (certType === 'driverLicense') {
      return (
        <div className="lc-form-grid">
          <Form.Item label={<span style={{ fontWeight: 600 }}>注册日期</span>} required>
            <DatePicker
              disabled={fieldDisabled}
              value={f.regDate ? moment(f.regDate) : null}
              onChange={(_, ds) => updateOcrConfirmField('regDate', ds)}
              style={{ width: '100%' }}
            />
          </Form.Item>
          <Form.Item label={<span style={{ fontWeight: 600 }}>发证日期</span>} required>
            <DatePicker
              disabled={fieldDisabled}
              value={f.issueDate ? moment(f.issueDate) : null}
              onChange={(_, ds) => updateOcrConfirmField('issueDate', ds)}
              style={{ width: '100%' }}
            />
          </Form.Item>
          <Form.Item label={<span style={{ fontWeight: 600 }}>强制报废日期</span>}>
            <DatePicker
              disabled={fieldDisabled}
              value={f.scrapDate ? moment(f.scrapDate) : null}
              onChange={(_, ds) => updateOcrConfirmField('scrapDate', ds)}
              style={{ width: '100%' }}
            />
          </Form.Item>
          <Form.Item label={<span style={{ fontWeight: 600 }}>检验有效期至</span>} required>
            <DatePicker
              disabled={fieldDisabled}
              value={f.expireDate ? moment(f.expireDate) : null}
              onChange={(_, ds) => updateOcrConfirmField('expireDate', ds)}
              style={{ width: '100%' }}
            />
          </Form.Item>
        </div>
      );
    }
    if (certType === 'transportLicense') {
      return (
        <div className="lc-form-grid">
          <Form.Item label={<span style={{ fontWeight: 600 }}>经营许可证号</span>} required>
            <Input
              disabled={fieldDisabled}
              value={f.licenseNo || ''}
              onChange={(e) => updateOcrConfirmField('licenseNo', e.target.value)}
              placeholder="例如：交字31011..."
            />
          </Form.Item>
          <Form.Item label={<span style={{ fontWeight: 600 }}>核发时间</span>} required>
            <DatePicker
              disabled={fieldDisabled}
              value={f.issueDate ? moment(f.issueDate) : null}
              onChange={(_, ds) => updateOcrConfirmField('issueDate', ds)}
              style={{ width: '100%' }}
            />
          </Form.Item>
          <Form.Item label={<span style={{ fontWeight: 600 }}>证件有效期</span>} required>
            <DatePicker
              disabled={fieldDisabled}
              value={f.expireDate ? moment(f.expireDate) : null}
              onChange={(_, ds) => updateOcrConfirmField('expireDate', ds)}
              style={{ width: '100%' }}
            />
          </Form.Item>
          <Form.Item label={<span style={{ fontWeight: 600 }}>审验有效期</span>} required>
            <DatePicker
              disabled={fieldDisabled}
              value={f.inspectValidUntil ? moment(f.inspectValidUntil) : null}
              onChange={(_, ds) => updateOcrConfirmField('inspectValidUntil', ds)}
              style={{ width: '100%' }}
            />
          </Form.Item>
        </div>
      );
    }
    return (
      <div className="lc-form-grid">
        <Form.Item label={<span style={{ fontWeight: 600 }}>下次检验日期</span>} required>
          <DatePicker
            disabled={fieldDisabled}
            value={f.nextInspectDate ? moment(f.nextInspectDate) : null}
            onChange={(_, ds) => updateOcrConfirmField('nextInspectDate', ds)}
            style={{ width: '100%' }}
            placeholder="选择检验截止日期"
          />
        </Form.Item>
      </div>
    );
  };

  const batchOcrTaskColumns = [
    { title: '操作人', dataIndex: 'operator', width: 88 },
    { title: '操作时间', dataIndex: 'operateTime', width: 168 },
    { title: '证照类型', dataIndex: 'certLabel', width: 140 },
    { title: '照片数量', dataIndex: 'photoCount', width: 88, align: 'center' },
    {
      title: 'OCR结果',
      key: 'ocrStats',
      width: 128,
      render: (_, record) => {
        if (record.status !== 'done') return <span style={{ color: '#94a3b8' }}>—</span>;
        return (
          <Space size={4} wrap>
            <Tag color="success" style={{ margin: 0 }}>成功 {record.ocrSuccessCount ?? 0}</Tag>
            <Tag color="error" style={{ margin: 0 }}>失败 {record.ocrFailCount ?? 0}</Tag>
          </Space>
        );
      }
    },
    {
      title: '处理进度',
      dataIndex: 'progress',
      width: 160,
      render: (val, record) => (
        <Progress percent={val} size="small" status={record.status === 'done' ? 'success' : 'active'} />
      )
    },
    {
      title: '操作',
      key: 'action',
      width: 88,
      render: (_, record) => (
        <Button
          type="link"
          size="small"
          disabled={record.progress < 100}
          style={{ padding: 0, fontWeight: 600 }}
          onClick={() => openOcrConfirm(record)}
        >
          {record.confirmDone ? '已确认' : '逐张确认'}
        </Button>
      )
    }
  ];

  const filterVehiclesByFilters = (vehicles, f, kpi) => {
    const plateKey = (f.plateNo || '').trim().toLowerCase();
    const multiPlates = parseMultiPlates(f.plateNos);
    const vinKey = (f.vin || '').trim().toLowerCase();
    const brandKey = (f.brand || '').trim().toLowerCase();
    const modelKey = (f.model || '').trim().toLowerCase();

    return vehicles.filter((v) => {
      const plateUpper = v.plateNo.toUpperCase();
      if (multiPlates.length) {
        if (!multiPlates.includes(plateUpper)) return false;
      } else if (plateKey && !v.plateNo.toLowerCase().includes(plateKey)) return false;
      if (vinKey && !v.vin.toLowerCase().includes(vinKey)) return false;
      if (brandKey && !v.brand.toLowerCase().includes(brandKey)) return false;
      if (modelKey && !v.model.toLowerCase().includes(modelKey)) return false;
      if (f.operateStatus !== '全部' && v.status !== f.operateStatus) return false;
      if (!matchKpiFilter(v.plateNo, kpi)) return false;
      return true;
    });
  };

  const handleListFilterQuery = () => {
    const plates = parseMultiPlates(multiPlateDraft);
    const next = {
      ...listFilters,
      plateNos: multiPlateDraft.trim(),
      plateNo: plates.length ? '' : listFilters.plateNo,
    };
    setListFilters(next);
    setAppliedFilters(next);
    setMultiPlateOpen(false);
    const hitCount = filterVehiclesByFilters(MOCK_VEHICLES, next, kpiFilter).length;
    if (plates.length) {
      message.success(`已按 ${plates.length} 个车牌筛选，命中 ${hitCount} 条记录`);
    } else {
      message.success(`已按筛选条件更新列表，共 ${hitCount} 条记录`);
    }
  };

  const handleListFilterReset = () => {
    const next = { ...DEFAULT_LIST_FILTERS };
    setListFilters(next);
    setAppliedFilters(next);
    setMultiPlateDraft('');
    setMultiPlateOpen(false);
    message.info('已重置筛选条件');
  };

  const appliedMultiPlates = useMemo(
    () => parseMultiPlates(appliedFilters.plateNos),
    [appliedFilters.plateNos]
  );

  const multiPlateTriggerText = useMemo(() => {
    if (!appliedMultiPlates.length) return '';
    if (appliedMultiPlates.length <= 2) return appliedMultiPlates.join('、');
    return `已选 ${appliedMultiPlates.length} 个车牌`;
  }, [appliedMultiPlates]);

  const handleMultiPlateOpenChange = (open) => {
    setMultiPlateOpen(open);
    if (open) setMultiPlateDraft(listFilters.plateNos || '');
  };

  const handleMultiPlateDraftClear = () => {
    setMultiPlateDraft('');
    setListFilters((prev) => ({ ...prev, plateNos: '' }));
  };

  const renderFilterField = (label, control) => (
    <div className="lc-filter-field">
      <span className="lc-filter-field-label">{label}</span>
      <div className="lc-filter-field-control">{control}</div>
    </div>
  );

  // ==================== 车辆列表筛选逻辑 ====================
  const filteredVehicles = useMemo(
    () => sortVehiclesRetiredLast(filterVehiclesByFilters(MOCK_VEHICLES, appliedFilters, kpiFilter)),
    [appliedFilters, allLicenses, kpiFilter]
  );

  // ==================== 列表台账表格列配置 ====================
  const listColumns = [
    {
      title: '车牌号',
      dataIndex: 'plateNo',
      key: 'plateNo',
      width: 96,
      onHeaderCell: listColumnHeaderCell,
      render: (plate, record) => (
        <span
          className={`lc-muted-text ${isRetiredVehicle(record) ? '' : ''}`}
          style={{ fontWeight: 600, fontSize: 13, color: isRetiredVehicle(record) ? '#94a3b8' : '#0f172a' }}
        >
          {plate}
        </span>
      )
    },
    {
      title: tableTitleMultiline('车辆识别代码', '（VIN码）'),
      dataIndex: 'vin',
      key: 'vin',
      width: 112,
      onHeaderCell: listColumnHeaderCell,
      render: (vin, record) => (
        <Tooltip title={vin}>
          <span
            className="lc-muted-text lc-cell-ellipsis"
            style={{ fontFamily: 'monospace', fontSize: 11, color: isRetiredVehicle(record) ? '#94a3b8' : '#475569' }}
          >
            {vin}
          </span>
        </Tooltip>
      )
    },
    {
      title: tableTitleMultiline('运营', '状态'),
      dataIndex: 'status',
      key: 'status',
      width: 72,
      onHeaderCell: listColumnHeaderCell,
      render: (status) => (
        <span style={{ fontSize: 13, fontWeight: 600, color: status === '退出运营' ? '#94a3b8' : '#334155' }}>
          {status}
        </span>
      )
    },
    {
      title: '品牌',
      dataIndex: 'brand',
      key: 'brand',
      width: 72,
      onHeaderCell: listColumnHeaderCell,
      render: (brand, record) => (
        <span className="lc-muted-text" style={{ fontSize: 13, fontWeight: 600, color: isRetiredVehicle(record) ? '#94a3b8' : '#0f172a' }}>
          {brand}
        </span>
      )
    },
    {
      title: '型号',
      dataIndex: 'model',
      key: 'model',
      width: 108,
      onHeaderCell: listColumnHeaderCell,
      render: (model, record) => (
        <Tooltip title={model}>
          <span
            className="lc-muted-text lc-cell-ellipsis"
            style={{ fontSize: 12, color: isRetiredVehicle(record) ? '#94a3b8' : '#475569' }}
          >
            {model}
          </span>
        </Tooltip>
      )
    },
    {
      title: tableTitleMultiline('行驶证', '到期时间'),
      key: 'driverLicense',
      width: 92,
      onHeaderCell: listColumnHeaderCell,
      render: (record) => {
        const status = getLicenseStatus(record.plateNo, 'driverLicense');
        const dateVal = allLicenses[record.plateNo]?.driverLicense?.expireDate;
        const muted = isRetiredVehicle(record);

        return (
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: muted ? '#94a3b8' : (dateVal ? '#334155' : '#94a3b8') }}>
              {dateVal || '—'}
            </div>
            <div className="lc-list-date-cell-status">
              {renderListLicenseStatusBadge(status)}
            </div>
          </div>
        );
      }
    },
    {
      title: tableTitleMultiline('道路运输证', '证件有效期'),
      key: 'transportLicenseExpire',
      width: 92,
      onHeaderCell: listColumnHeaderCell,
      render: (record) => {
        const status = getLicenseStatus(record.plateNo, 'transportLicense', { dateField: 'expireDate' });
        const dateVal = allLicenses[record.plateNo]?.transportLicense?.expireDate;
        const muted = isRetiredVehicle(record);

        return (
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: muted ? '#94a3b8' : (dateVal ? '#334155' : '#94a3b8') }}>
              {dateVal || '—'}
            </div>
            <div className="lc-list-date-cell-status">
              {renderListLicenseStatusBadge(status)}
            </div>
          </div>
        );
      }
    },
    {
      title: tableTitleMultiline('道路运输证', '审验有效期'),
      key: 'transportLicenseInspect',
      width: 92,
      onHeaderCell: listColumnHeaderCell,
      render: (record) => {
        const status = getLicenseStatus(record.plateNo, 'transportLicense', { dateField: 'inspectValidUntil' });
        const dateVal = allLicenses[record.plateNo]?.transportLicense?.inspectValidUntil;
        const muted = isRetiredVehicle(record);

        return (
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: muted ? '#94a3b8' : (dateVal ? '#334155' : '#94a3b8') }}>
              {dateVal || '—'}
            </div>
            <div className="lc-list-date-cell-status">
              {renderListLicenseStatusBadge(status)}
            </div>
          </div>
        );
      }
    },
    {
      title: tableTitleMultiline('特种设备标识', '到期时间'),
      key: 'specialEquipDecal',
      width: 92,
      onHeaderCell: listColumnHeaderCell,
      render: (record) => {
        const status = getLicenseStatus(record.plateNo, 'specialEquipDecal');
        const dateVal = allLicenses[record.plateNo]?.specialEquipDecal?.nextInspectDate;
        const muted = isRetiredVehicle(record);

        return (
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: muted ? '#94a3b8' : (dateVal ? '#334155' : '#94a3b8') }}>
              {dateVal || '—'}
            </div>
            <div className="lc-list-date-cell-status">
              {renderListLicenseStatusBadge(status)}
            </div>
          </div>
        );
      }
    },
    {
      title: tableTitleMultiline('证件', '状态'),
      key: 'allCertStatus',
      width: 272,
      onHeaderCell: listColumnHeaderCell,
      render: (record) => {
        const muted = isRetiredVehicle(record);
        const labelColor = muted ? '#94a3b8' : '#64748b';

        return (
          <div className="lc-list-cert-status-grid">
            {LIST_CERT_STATUS_ITEMS.map((item) => {
              const st = getListCertStatus(record.plateNo, item);
              return (
                <Tooltip
                  key={item.key}
                  title={`${item.fullLabel}：${st.text}`}
                >
                  <span className="lc-list-cert-status-item">
                    <Badge
                      status={mapLicenseTypeToBadge(st.type)}
                      text={<span style={{ fontSize: 10, color: labelColor }}>{item.label}</span>}
                    />
                  </span>
                </Tooltip>
              );
            })}
          </div>
        );
      }
    },
    {
      title: '操作',
      key: 'action',
      width: 64,
      onHeaderCell: listColumnHeaderCell,
      render: (record) => (
        <Button
          type="link"
          size="small"
          className="lc-action-btn"
          style={{ fontWeight: 600, color: '#10b981', padding: 0 }}
          onClick={() => goLicenseEditPage(record.plateNo, allLicenses)}
        >
          管理
        </Button>
      )
    }
  ];

  return (
    <div className="lc-edit-page" style={{ padding: '24px 24px 80px', height: '100vh', display: 'flex', flexDirection: 'column', background: 'linear-gradient(165deg, #f1f5f9 0%, #f8fafc 50%, #f1f5f9 100%)', overflow: 'hidden', boxSizing: 'border-box' }}>
      <style>{PAGE_STYLE}</style>
      
      {/* ======================================================== */}
      {/* ======================= 1. 列表台账视图 =================== */}
      {/* ======================================================== */}
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
          
          {/* 顶栏 */}
          <div className="lc-page-header" style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
            <Button 
              type="default" 
              icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: 4, verticalAlign: 'middle' }}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>}
              style={{ borderRadius: '8px', border: '1px solid #cbd5e1', fontWeight: 600, display: 'inline-flex', alignItems: 'center', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', color: '#475569' }}
              onClick={() => setPrdOpen(true)}
            >
              查看需求说明
            </Button>
          </div>

          {/* 筛选条件 */}
          <Card className="lc-filter-card" title="筛选条件" bordered={false}>
            <div className="lc-filter-grid">
              {renderFilterField('车牌号', (
                <Input
                  placeholder={appliedMultiPlates.length ? '已启用多车牌筛选' : '请输入车牌号'}
                  allowClear
                  disabled={appliedMultiPlates.length > 0}
                  value={listFilters.plateNo}
                  onChange={e => setListFilters(prev => ({ ...prev, plateNo: e.target.value }))}
                  onPressEnter={handleListFilterQuery}
                  style={{ borderRadius: 8 }}
                />
              ))}
              {renderFilterField('多车牌', (
                <Popover
                  open={multiPlateOpen}
                  onOpenChange={handleMultiPlateOpenChange}
                  trigger="click"
                  placement="bottomLeft"
                  overlayClassName="lc-multi-plate-popover"
                  content={
                    <div className="lc-multi-plate-pop">
                      <div className="lc-multi-plate-pop-hint">
                        每行一个车牌号，可从 Excel 等批量复制粘贴；点击「查询」后列表展示全部命中车辆。
                      </div>
                      <Input.TextArea
                        value={multiPlateDraft}
                        onChange={(e) => setMultiPlateDraft(e.target.value)}
                        placeholder={'沪A03561F\n粤B58888F\n苏E33333'}
                        autoSize={{ minRows: 5, maxRows: 10 }}
                        style={{ borderRadius: 8, fontFamily: 'monospace', fontSize: 13 }}
                      />
                      <div className="lc-multi-plate-pop-actions">
                        <Button size="small" onClick={handleMultiPlateDraftClear}>清空</Button>
                        <Button
                          size="small"
                          type="primary"
                          onClick={() => {
                            setListFilters((prev) => ({ ...prev, plateNos: multiPlateDraft.trim() }));
                            setMultiPlateOpen(false);
                          }}
                        >
                          收起
                        </Button>
                      </div>
                    </div>
                  }
                >
                  <Input
                    className="lc-multi-plate-trigger"
                    readOnly
                    allowClear={!!multiPlateTriggerText}
                    placeholder="点击输入多个车牌（每行一个）"
                    value={multiPlateTriggerText}
                    onClick={() => setMultiPlateOpen(true)}
                    onClear={(e) => {
                      e.stopPropagation();
                      handleMultiPlateDraftClear();
                      setAppliedFilters((prev) => ({ ...prev, plateNos: '' }));
                    }}
                    style={{ borderRadius: 8 }}
                    suffix={
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" style={{ pointerEvents: 'none' }}>
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    }
                  />
                </Popover>
              ))}
              {renderFilterField('VIN码', (
                <Input
                  placeholder="请输入车辆识别代码"
                  allowClear
                  value={listFilters.vin}
                  onChange={e => setListFilters(prev => ({ ...prev, vin: e.target.value }))}
                  onPressEnter={handleListFilterQuery}
                  style={{ borderRadius: 8 }}
                />
              ))}
              {renderFilterField('品牌', (
                <Select
                  placeholder="请选择或输入品牌"
                  allowClear
                  showSearch
                  value={listFilters.brand || undefined}
                  onChange={val => setListFilters(prev => ({ ...prev, brand: val || '' }))}
                  options={brandOptions}
                  filterOption={(input, option) => (option?.label || '').toLowerCase().includes(input.toLowerCase())}
                  style={{ width: '100%' }}
                  dropdownStyle={{ borderRadius: 8 }}
                />
              ))}
              {renderFilterField('车型', (
                <Select
                  placeholder="请选择或输入车型"
                  allowClear
                  showSearch
                  value={listFilters.model || undefined}
                  onChange={val => setListFilters(prev => ({ ...prev, model: val || '' }))}
                  options={modelOptions}
                  filterOption={(input, option) => (option?.label || '').toLowerCase().includes(input.toLowerCase())}
                  style={{ width: '100%' }}
                  dropdownStyle={{ borderRadius: 8 }}
                />
              ))}
              {renderFilterField('运营状态', (
                <Select
                  placeholder="全部"
                  value={listFilters.operateStatus}
                  onChange={val => setListFilters(prev => ({ ...prev, operateStatus: val }))}
                  style={{ width: '100%' }}
                  dropdownStyle={{ borderRadius: 8 }}
                >
                  <Select.Option value="全部">全部</Select.Option>
                  <Select.Option value="租赁">租赁</Select.Option>
                  <Select.Option value="自营">自营</Select.Option>
                  <Select.Option value="库存">库存</Select.Option>
                  <Select.Option value="退出运营">退出运营</Select.Option>
                </Select>
              ))}
            </div>
            <div className="lc-filter-actions">
              <Button onClick={handleListFilterReset}>重置</Button>
              <Button type="primary" onClick={handleListFilterQuery}>查询</Button>
            </div>
          </Card>

          {/* 资质预警看板（筛选与列表之间） */}
          <div className="lc-alert-stats-row">
            {[
              {
                key: 'total',
                type: 'total',
                title: '监管车辆总数',
                desc: '纳入证照台账管理的车辆',
                val: stats.total,
                icon: ICONS.vehicle
              },
              {
                key: 'normal',
                type: 'normal',
                title: '资质全部正常',
                desc: '行驶证/道路运输证/特种设备登记证/特种设备标志均已上传，并在有效期内',
                val: stats.normal,
                icon: ICONS.success
              },
              {
                key: 'warning',
                type: 'warning',
                title: '证件临期预警',
                desc: '行驶证≤90天 / 道路运输证≤60天 / 特种设备标识≤60天 / 安全阀≤60天 / 压力表≤60天',
                val: stats.warning,
                icon: ICONS.warning
              },
              {
                key: 'expired',
                type: 'expired',
                title: '已逾期',
                desc: '行驶证检验有效期到期 / 道路运输证有效期/检验时间到期 / 安全阀下次检验到期 / 压力表下次检验到期',
                val: stats.expired,
                icon: ICONS.warning
              },
              {
                key: 'unuploaded',
                type: 'unuploaded',
                title: '证照待补录',
                desc: '核心证照：行驶证、道路运输证、特种设备登记证、特种设备标识。任一类未上传影像即计为待补录。',
                val: stats.unuploaded,
                icon: ICONS.shield
              }
            ].map(card => (
              <div
                key={card.key}
                role="button"
                tabIndex={0}
                className={`lc-alert-card lc-alert-card--${card.type} lc-alert-card-clickable${kpiFilter === card.key ? ' lc-alert-card-active' : ''}`}
                onClick={() => handleKpiCardClick(card.key)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleKpiCardClick(card.key);
                  }
                }}
              >
                <div className="lc-alert-card-tip-anchor">
                  <Tooltip title={card.desc} placement="topRight" overlayStyle={{ maxWidth: 340 }}>
                    <span
                      className="lc-alert-card-tip"
                      role="img"
                      aria-label={`${card.title}说明`}
                      onClick={(e) => e.stopPropagation()}
                      onMouseDown={(e) => e.stopPropagation()}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="16" x2="12" y2="12" />
                        <line x1="12" y1="8" x2="12.01" y2="8" />
                      </svg>
                    </span>
                  </Tooltip>
                </div>
                <div className="lc-alert-card-icon">{card.icon}</div>
                <div className="lc-alert-card-main">
                  <div className="lc-alert-card-val">{card.val}</div>
                  <div className="lc-alert-card-title">{card.title}</div>
                </div>
              </div>
            ))}
          </div>

          {/* 表格台账区域：图示左上，批量操作右上 */}
          <div className="lc-table-section" style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
            <div className="lc-table-toolbar">
              <div className="lc-table-cert-legend-outer">
                <span className="lc-table-cert-legend-label">证件状态图示</span>
                {CERT_STATUS_LEGEND}
              </div>
              <div className="lc-table-toolbar-actions">
                <Button
                  type="primary"
                  style={{ borderRadius: 8, fontWeight: 600, background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', border: 'none' }}
                  onClick={() => setBatchExportOpen(true)}
                >
                  批量导出证照
                </Button>
                <Button
                  type="default"
                  style={{ borderRadius: 8, fontWeight: 600, borderColor: '#10b981', color: '#059669' }}
                  onClick={() => setBatchOcrOpen(true)}
                >
                  批量上传证照
                </Button>
              </div>
            </div>
            <div className="lc-table-card" style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
            <Table
              className="lc-list-table"
              columns={listColumns}
              dataSource={filteredVehicles}
              rowKey="plateNo"
              rowClassName={(record) => (record.status === '退出运营' ? 'lc-row-retired' : '')}
              pagination={false}
              locale={{ emptyText: <div style={{ padding: '40px 0' }}><svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5" style={{ marginBottom: 12 }}><circle cx="12" cy="12" r="10"/><line x1="8" y1="12" x2="16" y2="12"/></svg><div style={{ color: '#94a3b8' }}>暂无符合检索条件的证照车辆</div></div> }}
            />
            </div>
          </div>
        </div>

      {/* ======================================================== */}
      {/* ======================= 2. 批量导出 / 批量上传 ============== */}
      {/* ======================================================== */}

      <Modal
        open={batchExportOpen}
        title="批量导出证照"
        width={520}
        centered
        okText="开始导出"
        cancelText="取消"
        onCancel={() => setBatchExportOpen(false)}
        onOk={handleBatchExport}
      >
        <Alert
          type="info"
          showIcon
          style={{ marginBottom: 14, borderRadius: 10 }}
          message="导出规则"
          description={
            <ul style={{ margin: '6px 0 0', paddingLeft: 18, fontSize: 12, color: '#475569' }}>
              {BATCH_EXPORT_RULE_LINES.map((line) => (
                <li key={line} style={{ marginBottom: 4 }}>{line}</li>
              ))}
            </ul>
          }
        />
        <Checkbox.Group
          className="lc-batch-export-types"
          value={exportCertTypes}
          onChange={setExportCertTypes}
        >
          {CERT_EXPORT_OPTIONS.map((opt) => (
            <Checkbox key={opt.key} value={opt.key}>{opt.label}</Checkbox>
          ))}
        </Checkbox.Group>
        <div style={{ marginTop: 14, fontSize: 12, color: '#94a3b8' }}>
          当前筛选命中 <strong style={{ color: '#0f172a' }}>{filteredVehicles.length}</strong> 辆车
        </div>
      </Modal>

      <Modal
        open={batchOcrOpen}
        title="批量上传证照"
        width={880}
        centered
        footer={null}
        onCancel={() => setBatchOcrOpen(false)}
        destroyOnClose={false}
      >
        <Card size="small" bordered={false} style={{ background: '#f8fafc', borderRadius: 12, marginBottom: 16 }}>
          <div style={{ marginBottom: 12, fontWeight: 600, color: '#0f172a' }}>新建上传任务</div>
          <div style={{ marginBottom: 12 }}>
            <span style={{ fontSize: 12, color: '#64748b', marginRight: 12 }}>证照类型</span>
            <Select
              value={batchOcrCertType}
              onChange={setBatchOcrCertType}
              style={{ minWidth: 260 }}
              options={BATCH_UPLOAD_CERT_OPTIONS.map((o) => ({ label: o.label, value: o.key }))}
            />
          </div>
          <p style={{ margin: '0 0 12px', fontSize: 12, color: '#64748b', lineHeight: 1.5 }}>
            登记证、特种设备使用登记证：识别车牌通过后仅需确认同步照片；行驶证、道路运输证、特种设备使用标识需核对识别字段。
          </p>
          <Upload
            multiple
            accept="image/*"
            listType="picture-card"
            fileList={batchOcrFileList}
            beforeUpload={() => false}
            onChange={({ fileList }) => setBatchOcrFileList(fileList)}
          >
            {batchOcrFileList.length < 20 && (
              <div>
                <div style={{ fontSize: 24, color: '#94a3b8' }}>+</div>
                <div style={{ marginTop: 8, fontSize: 12 }}>上传照片</div>
              </div>
            )}
          </Upload>
          <div style={{ marginTop: 12, display: 'flex', justifyContent: 'flex-end' }}>
            <Button type="primary" onClick={handleStartBatchOcr} style={{ borderRadius: 8, fontWeight: 600 }}>
              生成上传任务
            </Button>
          </div>
        </Card>
        <div style={{ fontWeight: 600, marginBottom: 8, color: '#0f172a' }}>上传任务列表</div>
        <Table
          size="small"
          rowKey="id"
          columns={batchOcrTaskColumns}
          dataSource={ocrTasks}
          pagination={{ pageSize: 5, showSizeChanger: false }}
          locale={{ emptyText: '暂无任务，请在上方上传照片并生成任务' }}
          scroll={{ x: 880 }}
        />
      </Modal>

      <Modal
        open={ocrConfirmOpen}
        title={
          ocrConfirmTask && currentOcrConfirmGroup
            ? `上传确认 · ${ocrConfirmTask.certLabel} · ${currentOcrConfirmGroup.plateNo || '未识别车牌'}`
            : '上传确认（逐张确认）'
        }
        width={960}
        centered
        footer={
          <Space>
            <Button onClick={closeOcrConfirm}>取消</Button>
            {currentOcrConfirmGroup && !currentOcrConfirmGroup.plateValid ? (
              <Button onClick={handleOcrConfirmSkip}>跳过本张</Button>
            ) : null}
            <Button
              type="primary"
              disabled={!currentOcrConfirmGroup?.plateValid}
              onClick={handleOcrConfirmSubmit}
            >
              {isBatchUploadPhotoOnlyType(ocrConfirmTask?.certType)
                ? (ocrConfirmGroupIdx >= ocrConfirmTotalSheets - 1 ? '提交并同步照片' : '提交并同步照片，下一张')
                : (ocrConfirmGroupIdx >= ocrConfirmTotalSheets - 1 ? '提交并更新' : '提交并更新，下一张')}
            </Button>
          </Space>
        }
        onCancel={closeOcrConfirm}
      >
        {currentOcrConfirmGroup && (
          <div>
            <div className="lc-batch-ocr-step-bar">
              <div>
                <div style={{ fontSize: 12, color: '#64748b', marginBottom: 2 }}>逐张确认进度</div>
                <div className="lc-batch-ocr-step-val">
                  当前 {ocrConfirmGroupIdx + 1} / {ocrConfirmTotalSheets} 张
                </div>
              </div>
              <Tag color={currentOcrConfirmGroup.plateValid ? 'success' : 'error'}>
                {currentOcrConfirmGroup.plateValid
                  ? (isBatchUploadPhotoOnlyType(ocrConfirmTask?.certType) ? '可同步照片' : '可提交更新')
                  : '车牌校验失败'}
              </Tag>
            </div>
            <div className="lc-batch-ocr-confirm">
              <div className="lc-batch-ocr-photos">
                <div style={{ fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 8 }}>
                  本车牌上传照片（共 {currentOcrConfirmGroup.items.length} 张）
                </div>
                <div className="lc-batch-ocr-photo-grid">
                  {currentOcrConfirmGroup.items.map((it, idx) => (
                    <div
                      key={idx}
                      className={`lc-batch-ocr-thumb${idx === ocrConfirmPhotoIdx ? ' active' : ''}`}
                      onClick={() => setOcrConfirmPhotoIdx(idx)}
                      title={it.photoName || `照片${idx + 1}`}
                    >
                      <img src={it.photoUrl} alt={it.photoName || `图${idx + 1}`} />
                    </div>
                  ))}
                </div>
                <div
                  className="lc-batch-ocr-photo-main"
                  onClick={() => {
                    const url = currentOcrConfirmGroup.items[ocrConfirmPhotoIdx]?.photoUrl;
                    if (url) { setPreviewUrl(url); setPreviewOpen(true); }
                  }}
                >
                  <img
                    src={currentOcrConfirmGroup.items[ocrConfirmPhotoIdx]?.photoUrl}
                    alt="证照预览"
                  />
                </div>
                <div style={{ fontSize: 12, color: '#64748b', marginTop: 8 }}>
                  预览第 {ocrConfirmPhotoIdx + 1} 张 · 点击大图可放大
                </div>
              </div>
              <div>
                {isBatchUploadPhotoOnlyType(ocrConfirmTask?.certType) ? (
                  <>
                    {renderOcrPlateValidation(currentOcrConfirmGroup)}
                    <Alert
                      type="info"
                      showIcon
                      message="仅同步照片至台账"
                      description="登记证、特种设备使用登记证不识别业务字段；车牌校验通过后，将本页照片写入该车对应证照。"
                      style={{ borderRadius: 10 }}
                    />
                  </>
                ) : (
                  <>
                    <div style={{ marginBottom: 12, fontWeight: 700, color: '#0f172a' }}>
                      识别字段（可编辑，提交后写入该车辆证照）
                    </div>
                    {renderOcrPlateValidation(currentOcrConfirmGroup)}
                    <Form layout="vertical">
                      {renderOcrConfirmFields(ocrConfirmTask?.certType, currentOcrConfirmGroup)}
                    </Form>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* ======================================================== */}
      {/* ======================= 4. 公共大图/PRD 弹窗 ============== */}
      {/* ======================================================== */}
      
      {/* 照片预览大图弹窗 */}
      <Modal
        open={previewOpen}
        title="证件照片高清预览"
        footer={null}
        onCancel={() => setPreviewOpen(false)}
        width={720}
        centered
      >
        <img src={previewUrl} style={{ width: '100%', borderRadius: 8, objectFit: 'contain' }} alt="大图" />
      </Modal>

      {/* 需求说明弹窗（产品经理视角 PRD） */}
      <Modal
        open={prdOpen}
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 17, fontWeight: 800, color: '#0f172a' }}>
            <span style={{
              width: 28,
              height: 28,
              borderRadius: 6,
              background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: 14
            }}>📋</span>
            <span>车辆证照管理 · 产品需求说明（PRD）</span>
          </div>
        }
        footer={[
          <Button key="close" type="primary" style={{ borderRadius: 8, background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)', border: 'none' }} onClick={() => setPrdOpen(false)}>
            我已了解
          </Button>
        ]}
        onCancel={() => setPrdOpen(false)}
        width={980}
        centered
        style={{ top: 20 }}
        bodyStyle={{ maxHeight: '72vh', overflowY: 'auto', padding: '12px 24px 24px' }}
      >
        <div style={{ fontSize: 13, lineHeight: 1.65, color: '#334155' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16, fontSize: 12, color: '#64748b' }}>
            <Tag color="green">本页：证照台账列表（监管台）</Tag>
            <Tag>模块路径：运维管理 &gt; 车辆业务 &gt; 证照管理</Tag>
            <Tag>文档版本：V1.1</Tag>
            <Tag>读者：产品 / 运营 / 合规 / 研发测试</Tag>
          </div>

          <Alert
            type="info"
            showIcon
            style={{ marginBottom: 16, borderRadius: 12 }}
            message={<span style={{ fontWeight: 700 }}>本文档说明「证照管理」列表页能力</span>}
            description="单车证照录入、OCR、分卡保存等在独立页面「证照管理-编辑」；两页通过 session 车牌 + 本地证照库同步。维护页需求见其页面内「查看需求说明」。"
          />

          <Tabs defaultActiveKey="core" size="middle" tabBarGutter={12} type="card" className="lc-prd-tabs">
            <Tabs.TabPane tab="⭐ 核心逻辑" key="core">
              <div style={{ marginTop: 10 }}>
                <div style={{ background: 'linear-gradient(135deg, #ecfdf5 0%, #f8fafc 100%)', border: '2px solid #6ee7b7', borderRadius: 12, padding: '14px 18px', marginBottom: 16 }}>
                  <div style={{ fontWeight: 800, fontSize: 15, color: '#047857', marginBottom: 10 }}>产品定位（本页）</div>
                  <p style={{ margin: '0 0 8px' }}>
                    <strong>监管台：</strong>对全量车辆证照进行<strong>检索、预警、批量导出/上传、进入单车维护</strong>，不承担逐车表单编辑。
                  </p>
                  <p style={{ margin: 0 }}>
                    <strong>价值：</strong>让合规专员「先看见风险车辆 → 再处理单车」，批量作业与台账维护分工清晰。
                  </p>
                </div>

                <div style={{ fontWeight: 800, fontSize: 14, color: '#0f172a', marginBottom: 10 }}>端到端主流程</div>
                <ol style={{ paddingLeft: 20, margin: '0 0 18px', lineHeight: 1.75 }}>
                  <li><strong>进入列表</strong> → 默认展示全量监管车辆（退出运营置底、行置灰）</li>
                  <li><strong>筛选 / 点击看板</strong> → 缩小待处理范围（看板计数不随筛选变，见规则②）</li>
                  <li><strong>行内读数</strong> → 到期列 +「证件状态」八类状态点（双行四列）</li>
                  <li><strong>单车维护</strong> →「管理」进入「证照管理-编辑」，分卡保存后回写列表与看板</li>
                  <li><strong>批量作业</strong> → 按当前筛选结果导出 ZIP，或批量上传 OCR 任务确认入库</li>
                </ol>

                <div style={{ fontWeight: 800, fontSize: 14, color: '#b91c1c', marginBottom: 10 }}>【重点】五条必读业务规则</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 18 }}>
                  <div style={{ background: '#fffbeb', border: '1px solid #fcd34d', borderRadius: 10, padding: '10px 14px' }}>
                    <strong style={{ color: '#92400e' }}>① 运营状态归并</strong>
                    <span style={{ color: '#78350f' }}> — 主数据「可运营」「待运营」在本模块统一为「库存」；筛选「库存」须命中上述车辆；列表与维护页一致。</span>
                  </div>
                  <div style={{ background: '#eff6ff', border: '1px solid #93c5fd', borderRadius: 10, padding: '10px 14px' }}>
                    <strong style={{ color: '#1d4ed8' }}>② 看板 vs 筛选</strong>
                    <span style={{ color: '#1e3a8a' }}> — 看板按<strong>全量台账</strong>统计，不随筛选变化；点击看板仅过滤<strong>列表</strong>，可与筛选叠加。</span>
                  </div>
                  <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '10px 14px' }}>
                    <strong style={{ color: '#991b1b' }}>③ 临期 / 逾期口径</strong>
                    <span style={{ color: '#7f1d1d' }}> — 行驶证 ≤90 天临期；运输证<strong>证件有效期、审验有效期</strong>分列展示、分别算状态；特设标 / 安全阀 / 压力表 ≤60 天临期；≤0 天为已到期。</span>
                  </div>
                  <div style={{ background: '#f5f3ff', border: '1px solid #c4b5fd', borderRadius: 10, padding: '10px 14px' }}>
                    <strong style={{ color: '#5b21b6' }}>④ 批量上传</strong>
                    <span style={{ color: '#4c1d95' }}> — OCR 车牌须在台账；按车牌聚合确认；登记证 / 特种设备使用登记证<strong>仅同步照片</strong>。</span>
                  </div>
                  <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 10, padding: '10px 14px' }}>
                    <strong style={{ color: '#166534' }}>⑤ 数据同步</strong>
                    <span style={{ color: '#14532d' }}> — 「管理」写 session 车牌；维护页保存、批量确认写回证照库，列表 KPI 与行状态联动更新。</span>
                  </div>
                </div>

                <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>看板五项指标（点击可筛列表，口径以 ⓘ 为准）</div>
                <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #e2e8f0', fontSize: 12 }}>
                  <thead>
                    <tr style={{ background: '#f8fafc' }}>
                      <th style={{ padding: '8px 12px', textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>指标</th>
                      <th style={{ padding: '8px 12px', textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>统计逻辑</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr><td style={{ padding: '8px 12px', borderBottom: '1px solid #f1f5f9', fontWeight: 600 }}>监管车辆总数</td><td style={{ padding: '8px 12px', borderBottom: '1px solid #f1f5f9' }}>全部台账车辆；点击恢复全量</td></tr>
                    <tr><td style={{ padding: '8px 12px', borderBottom: '1px solid #f1f5f9', fontWeight: 600 }}>资质全部正常</td><td style={{ padding: '8px 12px', borderBottom: '1px solid #f1f5f9' }}>行驶证 + 运输证（证件有效期、审验有效期）均在有效期内</td></tr>
                    <tr><td style={{ padding: '8px 12px', borderBottom: '1px solid #f1f5f9', fontWeight: 600 }}>证件临期预警</td><td style={{ padding: '8px 12px', borderBottom: '1px solid #f1f5f9' }}>行驶证 90 天内；运输证/特设标/安全阀/压力表 60 天内（运输证两日期任一即计入）</td></tr>
                    <tr><td style={{ padding: '8px 12px', borderBottom: '1px solid #f1f5f9', fontWeight: 600 }}>已逾期</td><td style={{ padding: '8px 12px', borderBottom: '1px solid #f1f5f9' }}>行驶证到期；运输证证件或审验到期；安全阀/压力表下次检验到期</td></tr>
                    <tr><td style={{ padding: '8px 12px', fontWeight: 600 }}>证照待补录</td><td style={{ padding: '8px 12px' }}>四类核心证照任一未上传：行驶证、道路运输证、特种设备使用登记证、特种设备使用标识</td></tr>
                  </tbody>
                </table>
              </div>
            </Tabs.TabPane>

            <Tabs.TabPane tab="📊 本页功能" key="list">
              <div style={{ marginTop: 10 }}>
                <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>1. 页面结构（自上而下）</div>
                <ol style={{ paddingLeft: 20, margin: '0 0 16px' }}>
                  <li>右上角「查看需求说明」（本文档）</li>
                  <li><strong>筛选条件</strong>：三列网格；「查询」生效、「重置」清空</li>
                  <li><strong>资质预警看板</strong>：五项 KPI，ⓘ 看口径，点击筛列表</li>
                  <li><strong>证照台账表格</strong>：左上图例、右上批量导出/上传</li>
                </ol>

                <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>2. 筛选逻辑</div>
                <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #e2e8f0', marginBottom: 12, fontSize: 12 }}>
                  <thead>
                    <tr style={{ background: '#f8fafc' }}>
                      <th style={{ padding: '8px 12px', textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>筛选项</th>
                      <th style={{ padding: '8px 12px', textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>规则</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr><td style={{ padding: '8px 12px', borderBottom: '1px solid #f1f5f9' }}>车牌号</td><td style={{ padding: '8px 12px', borderBottom: '1px solid #f1f5f9' }}>模糊匹配；启用多车牌时禁用</td></tr>
                    <tr><td style={{ padding: '8px 12px', borderBottom: '1px solid #f1f5f9', fontWeight: 600, color: '#b45309' }}>多车牌</td><td style={{ padding: '8px 12px', borderBottom: '1px solid #f1f5f9' }}><strong>点击输入框</strong>展开文本域，每行一个车牌（支持 Excel 粘贴）；点「查询」后<strong>精确匹配</strong>并展示全部命中，提示命中条数</td></tr>
                    <tr><td style={{ padding: '8px 12px', borderBottom: '1px solid #f1f5f9' }}>VIN码</td><td style={{ padding: '8px 12px', borderBottom: '1px solid #f1f5f9' }}>模糊匹配</td></tr>
                    <tr><td style={{ padding: '8px 12px', borderBottom: '1px solid #f1f5f9' }}>品牌 / 车型</td><td style={{ padding: '8px 12px', borderBottom: '1px solid #f1f5f9' }}>可搜索下拉，可清空</td></tr>
                    <tr><td style={{ padding: '8px 12px', fontWeight: 600, color: '#b45309' }}>运营状态</td><td style={{ padding: '8px 12px' }}>全部 / 租赁 / 自营 / <strong style={{ color: '#ea580c' }}>库存</strong> / 退出运营；选库存含主数据可运营、待运营</td></tr>
                  </tbody>
                </table>
                <p style={{ fontSize: 12, color: '#64748b', margin: '0 0 16px' }}>筛选与看板点击可叠加；修改筛选项后须点「查询」才生效。</p>

                <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>3. 列表字段与交互</div>
                <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #e2e8f0', fontSize: 12, marginBottom: 16 }}>
                  <thead>
                    <tr style={{ background: '#f8fafc' }}>
                      <th style={{ padding: '8px 12px', textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>列 / 能力</th>
                      <th style={{ padding: '8px 12px', textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>说明</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr><td style={{ padding: '8px 12px', borderBottom: '1px solid #f1f5f9' }}>基础信息</td><td style={{ padding: '8px 12px', borderBottom: '1px solid #f1f5f9' }}>车牌、VIN、运营状态、品牌、型号；表头过长字段支持两行展示</td></tr>
                    <tr><td style={{ padding: '8px 12px', borderBottom: '1px solid #f1f5f9' }}>三类到期列</td><td style={{ padding: '8px 12px', borderBottom: '1px solid #f1f5f9' }}>行驶证到期；运输证<strong>证件有效期</strong>与<strong>审验有效期</strong>分列；特种设备标识到期；日期下 Badge 单行展示（临期N天/逾期N天），悬停看全文</td></tr>
                    <tr><td style={{ padding: '8px 12px', borderBottom: '1px solid #f1f5f9', fontWeight: 600 }}>证件状态</td><td style={{ padding: '8px 12px', borderBottom: '1px solid #f1f5f9' }}><strong>八类证照</strong>双行四列：行驶/运输/登记/特种 · 特设标/加氢/安全阀/压力表；绿正常、橙临期、红到期、灰未上传（加氢：已绑定/未绑定）；运输证状态取两日期最严重</td></tr>
                    <tr><td style={{ padding: '8px 12px', borderBottom: '1px solid #f1f5f9', fontWeight: 600, color: '#059669' }}>管理</td><td style={{ padding: '8px 12px', borderBottom: '1px solid #f1f5f9' }}>跳转「证照管理-编辑」；<strong>无删除</strong></td></tr>
                    <tr><td style={{ padding: '8px 12px', borderBottom: '1px solid #f1f5f9' }}>退出运营</td><td style={{ padding: '8px 12px', borderBottom: '1px solid #f1f5f9' }}>行置灰，同筛选结果内<strong>固定排底部</strong>，仍可点管理</td></tr>
                  </tbody>
                </table>

                <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>4. 批量导出证照</div>
                <p style={{ fontSize: 12, color: '#64748b', margin: '0 0 8px' }}>入口：列表右上方。范围：<strong>当前筛选命中车辆</strong>（含看板筛选）。类型：7 类影像（<strong>不含加氢卡</strong>）。</p>
                <ul style={{ paddingLeft: 20, margin: '0 0 10px', fontSize: 12 }}>
                  {BATCH_EXPORT_RULE_LINES.map((line) => (
                    <li key={line} style={{ marginBottom: 6 }}>{line}</li>
                  ))}
                </ul>
                <div style={{ fontSize: 12, color: '#64748b', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: '10px 14px', fontFamily: 'monospace', lineHeight: 1.6 }}>
                  证照批量导出_时间戳.zip → 按类型分文件夹 → 沪A03561F.jpg / 粤B58888F-1.jpg …
                </div>

                <div style={{ fontWeight: 700, color: '#0f172a', margin: '18px 0 8px' }}>5. 批量上传证照</div>
                <p style={{ fontSize: 12, margin: '0 0 8px' }}>入口：列表右上方。一次任务仅选<strong>一种</strong>证照类型。</p>
                <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #e2e8f0', fontSize: 12, marginBottom: 10 }}>
                  <thead>
                    <tr style={{ background: '#f8fafc' }}>
                      <th style={{ padding: '8px 12px', textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>阶段</th>
                      <th style={{ padding: '8px 12px', textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>逻辑要点</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr><td style={{ padding: '8px 12px', borderBottom: '1px solid #f1f5f9' }}>建任务</td><td style={{ padding: '8px 12px', borderBottom: '1px solid #f1f5f9' }}>多图上传 → 生成任务 → 列表展示 OCR 成功/失败条数、处理进度</td></tr>
                    <tr><td style={{ padding: '8px 12px', borderBottom: '1px solid #f1f5f9' }}>逐张确认</td><td style={{ padding: '8px 12px', borderBottom: '1px solid #f1f5f9' }}>按<strong>车牌聚合</strong>；页头「当前 M/总 N 张」为车牌数；同页展示该车牌全部照片</td></tr>
                    <tr><td style={{ padding: '8px 12px', borderBottom: '1px solid #f1f5f9', fontWeight: 600 }}>仅照片类</td><td style={{ padding: '8px 12px', borderBottom: '1px solid #f1f5f9' }}>登记证、特种设备使用登记证：车牌通过 →「提交并同步照片」</td></tr>
                    <tr><td style={{ padding: '8px 12px', borderBottom: '1px solid #f1f5f9' }}>字段类</td><td style={{ padding: '8px 12px', borderBottom: '1px solid #f1f5f9' }}>行驶证、道路运输证、特种设备使用标识：可编辑识别字段 →「提交并更新」</td></tr>
                    <tr><td style={{ padding: '8px 12px' }}>异常</td><td style={{ padding: '8px 12px' }}>车牌不在台账 → 失败，可「跳过本张」；全部确认后任务显示「已确认」</td></tr>
                  </tbody>
                </table>
              </div>
            </Tabs.TabPane>

            <Tabs.TabPane tab="🔗 单车维护" key="maintain">
              <div style={{ marginTop: 10 }}>
                <Alert type="success" showIcon style={{ marginBottom: 14, borderRadius: 10 }} message="维护能力在独立页面「证照管理-编辑」" description="本列表页仅提供入口，不在此页编辑表单。" />
                <ul style={{ paddingLeft: 20, margin: '0 0 14px', lineHeight: 1.75 }}>
                  <li><strong>进入：</strong>列表「管理」→ session 写入车牌 → 打开编辑页（支持 Axhub 导航）</li>
                  <li><strong>布局：</strong>左车辆信息 + 八类证照索引（状态点）；右八类卡片锚点滚动</li>
                  <li><strong>保存：</strong>分卡片「保存该项」，非整页提交；未保存切换车辆二次确认</li>
                  <li><strong>安全：</strong>行驶证/运输证 OCR 车牌须与当前车一致，否则阻断并清空无效图</li>
                  <li><strong>回写：</strong>保存后更新证照库，返回列表后看板与行状态刷新</li>
                </ul>
                <p style={{ fontSize: 12, color: '#64748b', margin: 0 }}>八类证照字段、照片生命周期、沪牌等级评定等详见「证照管理-编辑」页内 PRD。</p>
              </div>
            </Tabs.TabPane>

            <Tabs.TabPane tab="⚙️ 业务规则" key="rules">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 10, fontSize: 12 }}>
                <div style={{ border: '2px solid #fbbf24', background: '#fffbeb', padding: '12px 14px', borderRadius: 8 }}>
                  <div style={{ fontWeight: 800, fontSize: 13, color: '#92400e', marginBottom: 8 }}>运营状态归并（接口必读）</div>
                  <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: 6, overflow: 'hidden' }}>
                    <thead>
                      <tr style={{ background: '#fef3c7' }}>
                        <th style={{ padding: '8px 10px', textAlign: 'left', borderBottom: '1px solid #fde68a' }}>主数据</th>
                        <th style={{ padding: '8px 10px', textAlign: 'left', borderBottom: '1px solid #fde68a' }}>本模块展示</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr><td style={{ padding: '8px 10px', borderBottom: '1px solid #fef3c7' }}>租赁 / 自营 / 退出运营</td><td style={{ padding: '8px 10px', borderBottom: '1px solid #fef3c7' }}>同左</td></tr>
                      <tr style={{ background: '#fff7ed' }}><td style={{ padding: '8px 10px', borderBottom: '1px solid #fef3c7', fontWeight: 700, color: '#c2410c' }}>可运营、待运营</td><td style={{ padding: '8px 10px', borderBottom: '1px solid #fef3c7', fontWeight: 700, color: '#c2410c' }}>库存</td></tr>
                    </tbody>
                  </table>
                </div>
                <div style={{ borderLeft: '3px solid #10b981', background: '#f0fdf4', padding: '10px 14px', borderRadius: '0 8px 8px 0' }}>
                  <strong>到期感知阈值</strong>
                  <ul style={{ margin: '6px 0 0', paddingLeft: 18 }}>
                    <li>行驶证：≤90 天临期，≤0 天到期</li>
                    <li>道路运输证：证件有效期、审验有效期各算，≤60 天临期</li>
                    <li>特种设备标识 / 安全阀 / 压力表：下次检验 ≤60 天临期</li>
                    <li>登记类、特种设备使用登记证：有图无日期视为正常（列表状态点）</li>
                  </ul>
                </div>
                <div style={{ borderLeft: '3px solid #06b6d4', background: '#ecfeff', padding: '10px 14px', borderRadius: '0 8px 8px 0' }}>
                  <strong>批量与筛选</strong>
                  <p style={{ margin: '6px 0 0' }}>批量导出/上传均基于<strong>当前列表筛选结果</strong>（含 KPI 点击后的列表范围），与看板全量统计独立。</p>
                </div>
              </div>
            </Tabs.TabPane>

            <Tabs.TabPane tab="✅ 验收标准" key="accept">
              <div style={{ marginTop: 10, fontSize: 12 }}>
                <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>列表页验收清单</div>
                <ul style={{ paddingLeft: 20, margin: '0 0 14px', lineHeight: 1.7 }}>
                  <li>可运营/待运营展示为库存；筛库存可命中</li>
                  <li>多车牌：每行一车、查询后精确匹配并提示条数</li>
                  <li>看板全量统计；点击看板仅筛列表；ⓘ 展示口径</li>
                  <li>八类证件状态双行展示；到期 Badge 不换行</li>
                  <li>批量导出 7 类 ZIP 命名规则；批量上传 5 类及确认流</li>
                  <li>管理跳转编辑页；保存后列表与 KPI 一致</li>
                  <li>退出运营置底置灰；无删除</li>
                </ul>
                <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>本期不做</div>
                <ul style={{ paddingLeft: 20, margin: 0, color: '#64748b' }}>
                  <li>列表页内嵌单车维护（已拆至编辑页）</li>
                  <li>台账车辆删除、批量导入台账</li>
                  <li>年审状态作列表筛选项</li>
                  <li>加氢卡页面内编辑（能源模块回写）</li>
                </ul>
              </div>
            </Tabs.TabPane>
          </Tabs>
        </div>
      </Modal>
    </div>
  );
};

export default Component;
