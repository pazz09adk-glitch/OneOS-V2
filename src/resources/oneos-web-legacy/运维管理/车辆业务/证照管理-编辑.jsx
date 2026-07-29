// 【重要】必须使用 const Component 作为组件变量名
// 运维管理 - 车辆业务 - 证照管理（资质维护页，由台账列表「管理」进入）

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
  Tag,
  message
} = antd;

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

const navigateToLicenseList = (toastMsg) => {
  try {
    sessionStorage.setItem(LC_NAV_TARGET_KEY, 'list');
    sessionStorage.removeItem(LC_EDIT_PLATE_KEY);
  } catch {
    /* ignore */
  }
  try {
    window.dispatchEvent(new CustomEvent(LC_NAV_EVENT));
  } catch {
    /* ignore */
  }
  if (typeof window.__axhubNavigate === 'function') {
    window.__axhubNavigate('证照管理');
    if (toastMsg) message.success(toastMsg);
    return;
  }
  if (toastMsg) message.success(toastMsg);
  else message.info('请切换至「证照管理」台账列表页查看');
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

const mergeLicenseStatusTypes = (a, b) => {
  const rank = { error: 0, warning: 1, default: 2, success: 3, processing: 2 };
  const ra = rank[a] ?? 9;
  const rb = rank[b] ?? 9;
  return ra <= rb ? a : b;
};

const loadPlateLicenseBundle = (master, plate) => {
  if (master[plate]) return JSON.parse(JSON.stringify(master[plate]));
  return createEmptyLicenseRecord();
};

/** 特种设备使用标识：与台账列表一致，提前 60 天临期感知，≤15 天高危提示 */
const SPECIAL_EQUIP_DECAL_WARN_DAYS = 60;
const SPECIAL_EQUIP_DECAL_CRITICAL_DAYS = 15;

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
    specialEquipDecal: { photos: ['https://picsum.photos/seed/spec2/600/400'], nextInspectDate: '2026-07-20', updateTime: '2026-05-20 16:45:00', updateUser: '系统管理员' },
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
  const [selectedPlate, setSelectedPlate] = useState('沪A03561F');
  const [activeNav, setActiveTab] = useState('driverLicense');

  const [allLicenses, setAllLicenses] = useState(() => (
    loadLicensesFromStorage() || JSON.parse(JSON.stringify(INITIAL_LICENSE_DATA))
  ));

  const [licenses, setLicenses] = useState(() => createEmptyLicenseRecord());
  const [savedLicenses, setSavedLicenses] = useState(() => createEmptyLicenseRecord());

  const [ocrActiveCard, setOcrActiveCard] = useState(null);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrHighlight, setOcrHighlight] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const [prdOpen, setPrdOpen] = useState(false);

  const syncLicensesForPlate = (plate, master) => {
    const bundle = loadPlateLicenseBundle(master, plate);
    setLicenses(JSON.parse(JSON.stringify(bundle)));
    setSavedLicenses(JSON.parse(JSON.stringify(bundle)));
  };

  useEffect(() => {
    const master = loadLicensesFromStorage() || JSON.parse(JSON.stringify(INITIAL_LICENSE_DATA));
    setAllLicenses(master);
    let plate = MOCK_VEHICLES[0]?.plateNo || '沪A03561F';
    try {
      const fromSession = sessionStorage.getItem(LC_EDIT_PLATE_KEY);
      if (fromSession) plate = fromSession;
    } catch {
      /* ignore */
    }
    setSelectedPlate(plate);
    syncLicensesForPlate(plate, master);
    message.loading({ content: `正在调取 [${plate}] 资质档案明细...`, key: 'loading_edit', duration: 0.5 });
  }, []);

  // 切换车辆时，自动填充该车辆的已有证照数据
  const handlePlateChange = (plate) => {
    setSelectedPlate(plate);
    try {
      sessionStorage.setItem(LC_EDIT_PLATE_KEY, plate);
    } catch {
      /* ignore */
    }
    syncLicensesForPlate(plate, allLicenses);
    message.success(`已切换车辆：${plate}`);
  };

  // 车辆基本信息
  const currentVehicleInfo = useMemo(() => (
    MOCK_VEHICLES.find((v) => v.plateNo === selectedPlate) || MOCK_VEHICLES[0]
  ), [selectedPlate]);

  // 计算上海牌照
  const isShanghaiPlate = useMemo(() => {
    return selectedPlate.startsWith('沪');
  }, [selectedPlate]);

  // 行驶证有效期月份自动算最后一天
  const handleDriverLicenseExpireChange = (dateString) => {
    if (!dateString) {
      setLicenses(prev => {
        const copy = { ...prev };
        copy.driverLicense.expireDate = '';
        return copy;
      });
      return;
    }
    const match = dateString.match(/^(\d{4})-(\d{2})/);
    if (match) {
      const year = parseInt(match[1]);
      const month = parseInt(match[2]);
      const lastDay = new Date(year, month, 0).getDate();
      const adjustedDate = `${year}-${String(month).padStart(2, '0')}-${lastDay}`;
      
      setLicenses(prev => {
        const copy = { ...prev };
        copy.driverLicense.expireDate = adjustedDate;
        return copy;
      });
    }
  };

  // 模拟 OCR 识别全过程（编辑页联动）
  const simulateOcr = (cardType) => {
    setOcrActiveCard(cardType);
    setOcrLoading(true);
    setOcrHighlight(false);
    
    setTimeout(() => {
      const isMismatch = Math.random() < 0.25;
      const ocrPlateNo = isMismatch ? '京A88888' : selectedPlate;
      
      if (ocrPlateNo !== selectedPlate) {
        setOcrLoading(false);
        setOcrActiveCard(null);
        Modal.error({
          title: 'OCR 校验失败',
          content: (
            <div>
              <p>系统检测到上传的证件照片对应的车牌号与当前编辑车辆不符！</p>
              <p style={{ marginTop: 8 }}>当前编辑车辆：<strong style={{ color: '#0f172a' }}>{selectedPlate}</strong></p>
              <p>证件识别车牌：<strong style={{ color: '#ef4444' }}>{ocrPlateNo}</strong></p>
              <p style={{ color: '#64748b', fontSize: 12, marginTop: 12 }}>
                提示：请确认您上传的是否为本车的行驶证或道路运输证。为了保证台账档案的真实严谨，车牌号不一致禁止保存录入。
              </p>
            </div>
          ),
          okText: '重新上传',
          onOk() {
            setLicenses(prev => {
              const copy = { ...prev };
              if (cardType === 'driverLicense') {
                copy.driverLicense.photos.pop();
              } else if (cardType === 'transportLicense') {
                copy.transportLicense.photos = [];
              }
              return copy;
            });
          }
        });
        return;
      }

      setOcrLoading(false);
      setOcrHighlight(true);
      
      setLicenses(prev => {
        const copy = { ...prev };
        if (cardType === 'driverLicense') {
          copy.driverLicense.photos = ['https://picsum.photos/seed/license_ocr/600/400'];
          copy.driverLicense.regDate = '2024-06-05';
          copy.driverLicense.issueDate = '2024-06-05';
          copy.driverLicense.scrapDate = '2039-06-04';
          copy.driverLicense.expireDate = '2026-06-30';
          copy.driverLicense.updateType = '直接上传';
          copy.driverLicense.updateTime = new Date().toLocaleString();
          copy.driverLicense.updateUser = '系统智能OCR';
          if (isShanghaiPlate) {
            copy.driverLicense.shNextEvaluation = '2026-12-05';
          }
        } else if (cardType === 'transportLicense') {
          copy.transportLicense.photos = ['https://picsum.photos/seed/trans_ocr/600/400'];
          copy.transportLicense.licenseNo = '交字310115582910号';
          copy.transportLicense.issueDate = '2024-08-15';
          copy.transportLicense.expireDate = '2026-08-31';
          copy.transportLicense.inspectValidUntil = '2026-07-31';
          copy.transportLicense.updateTime = new Date().toLocaleString();
          copy.transportLicense.updateUser = '系统智能OCR';
        }
        return copy;
      });
      
      message.success('OCR识别完成，已自动提取关键信息，请进行核对');
      
      setTimeout(() => {
        setOcrHighlight(false);
        setOcrActiveCard(null);
      }, 1200);
    }, 1800);
  };

  // 手动增删照片（编辑页联动）
  const handlePhotoUpload = (cardType) => {
    setLicenses(prev => {
      const copy = { ...prev };
      const randomSeed = Math.floor(Math.random() * 1000);
      const url = `https://picsum.photos/seed/${randomSeed}/600/400`;
      
      if (cardType === 'driverLicense') {
        if (copy.driverLicense.photos.length >= 4) {
          message.warning('行驶证最多允许上传4张照片！');
          return prev;
        }
        copy.driverLicense.photos = [...copy.driverLicense.photos, url];
        setTimeout(() => simulateOcr('driverLicense'), 200);
      } else if (cardType === 'transportLicense') {
        copy.transportLicense.photos = [url];
        setTimeout(() => simulateOcr('transportLicense'), 200);
      } else if (cardType === 'registrationCert') {
        copy.registrationCert.photos = [...copy.registrationCert.photos, url];
      } else if (cardType === 'specialEquipCert') {
        copy.specialEquipCert.photos = [url];
      } else if (cardType === 'specialEquipDecal') {
        copy.specialEquipDecal.photos = [url];
      } else if (cardType === 'safetyValve') {
        copy.safetyValve.photos = [url];
      } else if (cardType === 'pressureGauge') {
        copy.pressureGauge.photos = [url];
      }
      return copy;
    });
  };

  const handlePhotoDelete = (cardType, index) => {
    setLicenses(prev => {
      const copy = { ...prev };
      if (cardType === 'driverLicense') {
        const arr = [...copy.driverLicense.photos];
        arr.splice(index, 1);
        copy.driverLicense.photos = arr;
      } else if (cardType === 'transportLicense') {
        copy.transportLicense.photos = [];
      } else if (cardType === 'registrationCert') {
        const arr = [...copy.registrationCert.photos];
        arr.splice(index, 1);
        copy.registrationCert.photos = arr;
      } else if (cardType === 'specialEquipCert') {
        copy.specialEquipCert.photos = [];
      } else if (cardType === 'specialEquipDecal') {
        copy.specialEquipDecal.photos = [];
      } else if (cardType === 'safetyValve') {
        copy.safetyValve.photos = [];
      } else if (cardType === 'pressureGauge') {
        copy.pressureGauge.photos = [];
      }
      return copy;
    });
    message.info('照片已移除');
  };

  const handlePhotoUpdate = (cardType, index) => {
    setLicenses(prev => {
      const copy = { ...prev };
      const randomSeed = Math.floor(Math.random() * 1000) + 2000;
      const url = `https://picsum.photos/seed/${randomSeed}/600/400`;
      
      const arr = [...copy[cardType].photos];
      arr[index] = url;
      copy[cardType].photos = arr;
      
      if (cardType === 'driverLicense') {
        setTimeout(() => simulateOcr('driverLicense'), 200);
      } else if (cardType === 'transportLicense') {
        setTimeout(() => simulateOcr('transportLicense'), 200);
      }
      
      return copy;
    });
    message.success('证件照片已更新！');
  };

  // 证照完整度（编辑页联动）
  const completionStats = useMemo(() => {
    let total = 8;
    let completed = 0;
    
    if (licenses.driverLicense.photos.length > 0 && licenses.driverLicense.regDate) completed++;
    if (licenses.transportLicense.photos.length > 0 && licenses.transportLicense.licenseNo) completed++;
    if (licenses.registrationCert.photos.length > 0) completed++;
    if (licenses.specialEquipCert.photos.length > 0) completed++;
    if (licenses.specialEquipDecal.photos.length > 0 && licenses.specialEquipDecal.nextInspectDate) completed++;
    if (licenses.hydrogenCard.cardNo) completed++;
    if (licenses.safetyValve.photos.length > 0 && licenses.safetyValve.inspectDate) completed++;
    if (licenses.pressureGauge.photos.length > 0 && licenses.pressureGauge.inspectDate) completed++;

    return {
      percent: Math.round((completed / total) * 100),
      count: completed,
      total: total
    };
  }, [licenses]);

  // 提前60天警报计算（编辑页联动）
  const transportAlertInfo = useMemo(() => {
    if (!licenses.transportLicense.expireDate) return null;
    const expDate = new Date(licenses.transportLicense.expireDate);
    const today = new Date('2026-06-01');
    expDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    const diffTime = expDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays > 60) return null;
    return {
      daysLeft: diffDays,
      shouldWarn: diffDays <= 15
    };
  }, [licenses.transportLicense.expireDate]);

  // 提前90天警报计算（编辑页联动）
  const driverAlertInfo = useMemo(() => {
    if (!licenses.driverLicense.expireDate) return null;
    const expDate = new Date(licenses.driverLicense.expireDate);
    const today = new Date('2026-06-01');
    expDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    const diffTime = expDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays > 90) return null;
    return {
      daysLeft: diffDays,
      shouldWarn: diffDays <= 30
    };
  }, [licenses.driverLicense.expireDate]);

  // 特种设备使用标识：提前 60 天超前感知（与列表 KPI 一致）
  const specialEquipDecalAlertInfo = useMemo(() => {
    if (!licenses.specialEquipDecal.nextInspectDate) return null;
    const expDate = new Date(licenses.specialEquipDecal.nextInspectDate);
    const today = new Date('2026-06-01');
    expDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    const diffDays = Math.ceil((expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays > SPECIAL_EQUIP_DECAL_WARN_DAYS) return null;
    return {
      daysLeft: diffDays,
      isExpired: diffDays <= 0,
      shouldWarn: diffDays <= SPECIAL_EQUIP_DECAL_CRITICAL_DAYS
    };
  }, [licenses.specialEquipDecal.nextInspectDate]);

  // 沪牌评定天数（编辑页联动）
  const shEvaluationDaysLeft = useMemo(() => {
    if (!licenses.driverLicense.shNextEvaluation) return null;
    const targetDate = new Date(licenses.driverLicense.shNextEvaluation);
    const today = new Date('2026-06-01');
    targetDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    const diffTime = targetDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }, [licenses.driverLicense.shNextEvaluation]);

  // 获取单个徽标状态（编辑页联动）
  const getBadgeStatus = (key) => {
    const item = licenses[key];
    if (!item) return 'default';
    
    if (key === 'hydrogenCard') {
      if (!item.cardNo) return 'default';
    } else {
      if (!item.photos || item.photos.length === 0) return 'default';
    }
    
    const today = new Date('2026-06-01');
    today.setHours(0, 0, 0, 0);
    
    if (key === 'driverLicense') {
      if (!item.expireDate) return 'success';
      const expDate = new Date(item.expireDate);
      expDate.setHours(0, 0, 0, 0);
      const diffDays = Math.ceil((expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays <= 0) return 'error';
      if (diffDays <= 90) return 'warning';
      return 'success';
    }
    
    if (key === 'transportLicense') {
      const badgeFromDate = (dateStr) => {
        if (!dateStr) return 'success';
        const expDate = new Date(dateStr);
        expDate.setHours(0, 0, 0, 0);
        const diffDays = Math.ceil((expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays <= 0) return 'error';
        if (diffDays <= 60) return 'warning';
        return 'success';
      };
      return mergeLicenseStatusTypes(
        badgeFromDate(item.expireDate),
        badgeFromDate(item.inspectValidUntil)
      );
    }
    
    if (key === 'specialEquipDecal' || key === 'safetyValve' || key === 'pressureGauge') {
      const dKey = key === 'specialEquipDecal' ? 'nextInspectDate' : 'nextInspectDate';
      if (!item[dKey]) return 'success';
      const expDate = new Date(item[dKey]);
      expDate.setHours(0, 0, 0, 0);
      const diffDays = Math.ceil((expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays <= 0) return 'error';
      if (diffDays <= 60) return 'warning';
      return 'success';
    }
    
    return 'success';
  };

  const isCardDirty = (cardKey) => {
    return JSON.stringify(licenses[cardKey]) !== JSON.stringify(savedLicenses[cardKey]);
  };

  const hasUnsavedChanges = useMemo(() => {
    return Object.keys(licenses).some(key => isCardDirty(key));
  }, [licenses, savedLicenses]);

  const handlePlateSelectChange = (plate) => {
    if (hasUnsavedChanges) {
      Modal.confirm({
        title: '确认切换车辆？',
        content: '当前页面还有证照未保存，切换车辆将丢失未保存的修改，是否确认切换？',
        okText: '确认切换',
        cancelText: '取消',
        onOk() {
          handlePlateChange(plate);
        }
      });
    } else {
      handlePlateChange(plate);
    }
  };

  const scrollToAnchor = (id) => {
    setActiveTab(id);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleCardSubmit = (cardKey, cardName) => {
    Modal.confirm({
      title: '确认保存',
      content: `是否确认保存「${cardName}」的所有更改至 ONE-OS？`,
      okText: '确认保存',
      cancelText: '取消',
      onOk() {
        const key = `save_${cardKey}`;
        message.loading({ content: `正在保存「${cardName}」数据至 ONE-OS...`, key });
        setTimeout(() => {
          // 同步局部已保存状态
          setSavedLicenses(prev => {
            const copy = JSON.parse(JSON.stringify(prev));
            copy[cardKey] = JSON.parse(JSON.stringify(licenses[cardKey]));
            return copy;
          });
          // 核心：回写至共享数据库 master state 保证列表和统计同步更新！
                    setAllLicenses((prev) => {
            const copy = JSON.parse(JSON.stringify(prev));
            if (!copy[selectedPlate]) copy[selectedPlate] = createEmptyLicenseRecord();
            copy[selectedPlate][cardKey] = JSON.parse(JSON.stringify(licenses[cardKey]));
            persistLicensesToStorage(copy);
            return copy;
          });
          message.success({ content: `「${cardName}」数据保存成功！已独立同步回台账。`, key, duration: 2 });
        }, 600);
      }
    });
  };

  return (
    <div className="lc-edit-page" style={{ padding: '24px 24px 80px', height: '100vh', display: 'flex', flexDirection: 'column', background: 'linear-gradient(165deg, #f1f5f9 0%, #f8fafc 50%, #f1f5f9 100%)', overflow: 'hidden', boxSizing: 'border-box' }}>
      <style>{PAGE_STYLE}</style>

        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
          
          {/* 顶栏 */}
          <div className="lc-page-header" style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Button 
              type="default" 
              icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: 4, verticalAlign: 'middle' }}><polyline points="15 18 9 12 15 6"/></svg>}
              style={{ borderRadius: '8px', fontWeight: 600, display: 'inline-flex', alignItems: 'center' }}
              onClick={() => navigateToLicenseList('已返回证照台账列表')}
            >
              返回台账列表
            </Button>
            <Button 
              type="default" 
              icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: 4, verticalAlign: 'middle' }}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>}
              style={{ borderRadius: '8px', border: '1px solid #cbd5e1', fontWeight: 600, display: 'inline-flex', alignItems: 'center', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', color: '#475569' }}
              onClick={() => setPrdOpen(true)}
            >
              查看需求说明
            </Button>
          </div>

          {/* 双栏布局 */}
          <main className="lc-layout-row">
            {/* 左侧侧边栏 */}
            <aside className="lc-sidebar">
              <div className="lc-sticky-card">
                {/* 车辆卡片 */}
                <Card className="lc-sidebar-card" style={{ marginBottom: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                    <div style={{ 
                      width: 44, 
                      height: 44, 
                      borderRadius: 12, 
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      color: '#fff' 
                    }}>
                      {ICONS.vehicle}
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800 }}>{selectedPlate}</h3>
                        <Popover
                          content={
                            <div style={{ padding: '4px 0' }}>
                              <div style={{ fontSize: 12, color: '#64748b', marginBottom: 8 }}>选择切换车辆：</div>
                              <Select
                                showSearch
                                placeholder="搜索车牌号"
                                optionFilterProp="children"
                                value={selectedPlate}
                                onChange={handlePlateSelectChange}
                                style={{ width: 180 }}
                                filterOption={(input, option) =>
                                  (option?.value ?? '').toLowerCase().includes(input.toLowerCase())
                                }
                              >
                                {MOCK_VEHICLES.map(v => (
                                  <Select.Option key={v.plateNo} value={v.plateNo}>
                                    {v.plateNo}
                                  </Select.Option>
                                ))}
                              </Select>
                            </div>
                          }
                          title={null}
                          trigger="click"
                          placement="bottomLeft"
                        >
                          <span style={{ fontSize: 12, color: '#10b981', cursor: 'pointer', textDecoration: 'underline' }}>切换车辆</span>
                        </Popover>
                      </div>
                      <Badge
                        status={
                          currentVehicleInfo.status === '退出运营' ? 'default'
                            : currentVehicleInfo.status === '库存' ? 'warning'
                            : 'success'
                        }
                        text={currentVehicleInfo.status}
                      />
                    </div>
                  </div>

                  <div style={{ background: '#f8fafc', padding: 12, borderRadius: 12, border: '1px solid #f1f5f9' }}>
                    <div className="lc-sidebar-info-row">
                      <span className="lc-sidebar-label">车辆品牌</span>
                      <span className="lc-sidebar-val">{currentVehicleInfo.brand}</span>
                    </div>
                    <div className="lc-sidebar-info-row">
                      <span className="lc-sidebar-label">车辆型号</span>
                      <span className="lc-sidebar-val">{currentVehicleInfo.model}</span>
                    </div>
                    <div className="lc-sidebar-info-row">
                      <span className="lc-sidebar-label">车辆识别代码（VIN码）</span>
                      <span className="lc-sidebar-val" style={{ fontFamily: 'monospace' }}>{currentVehicleInfo.vin}</span>
                    </div>
                  </div>
                </Card>

                {/* 证件锚点导航 */}
                <Card 
                  className="lc-sidebar-card lc-sidebar-card-index" 
                  title={
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <span style={{ fontSize: 14, fontWeight: 700 }}><Space>{ICONS.shield} 证照分类索引</Space></span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 10, fontWeight: 400, color: '#64748b' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2 }}><Badge status="success" style={{ fontSize: 8 }} />正常</span>
                        <Tooltip title="行驶证≤90天 / 道路运输证≤60天 / 特种设备标识≤60天 / 安全阀≤60天 / 压力表≤60天">
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2, cursor: 'help' }}><Badge status="warning" style={{ fontSize: 8 }} />临期</span>
                        </Tooltip>
                        <Tooltip title="行驶证检验有效期到期 / 道路运输证有效期/检验时间到期 / 安全阀、压力表下次检验到期">
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2, cursor: 'help' }}><Badge status="error" style={{ fontSize: 8 }} />已到期</span>
                        </Tooltip>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2 }}><Badge status="default" style={{ fontSize: 8 }} />未上传</span>
                      </div>
                    </div>
                  }
                >
                  <nav className="lc-nav-list" aria-label="Index">
                    <button 
                      className={`lc-nav-item ${activeNav === 'driverLicense' ? 'active' : ''}`}
                      onClick={() => scrollToAnchor('driverLicense')}
                    >
                      <span>行驶证</span>
                      <Badge status={getBadgeStatus('driverLicense')} />
                    </button>
                    <button 
                      className={`lc-nav-item ${activeNav === 'transportLicense' ? 'active' : ''}`}
                      onClick={() => scrollToAnchor('transportLicense')}
                    >
                      <span>道路运输证</span>
                      <Badge status={getBadgeStatus('transportLicense')} />
                    </button>
                    <button 
                      className={`lc-nav-item ${activeNav === 'registrationCert' ? 'active' : ''}`}
                      onClick={() => scrollToAnchor('registrationCert')}
                    >
                      <span>登记证</span>
                      <Badge status={getBadgeStatus('registrationCert')} />
                    </button>
                    <button 
                      className={`lc-nav-item ${activeNav === 'specialEquipCert' ? 'active' : ''}`}
                      onClick={() => scrollToAnchor('specialEquipCert')}
                    >
                      <span>特种设备使用登记证</span>
                      <Badge status={getBadgeStatus('specialEquipCert')} />
                    </button>
                    <button 
                      className={`lc-nav-item ${activeNav === 'specialEquipDecal' ? 'active' : ''}`}
                      onClick={() => scrollToAnchor('specialEquipDecal')}
                    >
                      <span>特种设备使用标识</span>
                      <Badge status={getBadgeStatus('specialEquipDecal')} />
                    </button>
                    <button 
                      className={`lc-nav-item ${activeNav === 'hydrogenCard' ? 'active' : ''}`}
                      onClick={() => scrollToAnchor('hydrogenCard')}
                    >
                      <span>加氢卡</span>
                      <Badge status={getBadgeStatus('hydrogenCard')} />
                    </button>
                    <button 
                      className={`lc-nav-item ${activeNav === 'safetyValve' ? 'active' : ''}`}
                      onClick={() => scrollToAnchor('safetyValve')}
                    >
                      <span>安全阀</span>
                      <Badge status={getBadgeStatus('safetyValve')} />
                    </button>
                    <button 
                      className={`lc-nav-item ${activeNav === 'pressureGauge' ? 'active' : ''}`}
                      onClick={() => scrollToAnchor('pressureGauge')}
                    >
                      <span>压力表</span>
                      <Badge status={getBadgeStatus('pressureGauge')} />
                    </button>
                  </nav>
                </Card>
              </div>
            </aside>

            {/* 右侧明细编辑区 */}
            <section className="lc-content-area" aria-label="Details">
              <Form layout="vertical" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Card 1: 行驶证 */}
              <Card 
                id="driverLicense" 
                className="lc-card" 
                title={
                  <div className="lc-card-title">
                    <span>行驶证</span>
                  </div>
                }
                extra={
                  <Space>
                    {isCardDirty('driverLicense') && (
                      <span style={{ fontSize: 11, color: '#f97316', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4, marginRight: 8 }}>
                        <Badge status="warning" /> 未保存
                      </span>
                    )}
                    {licenses.driverLicense.photos.length > 0 && (
                      <span className="lc-ocr-tag">{ICONS.success} 已完善</span>
                    )}
                    <Button 
                      type="primary" 
                      size="small" 
                      style={{ borderRadius: '6px', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', border: 'none' }}
                      onClick={() => handleCardSubmit('driverLicense', '行驶证')}
                    >
                      保存该项
                    </Button>
                  </Space>
                }
              >
                <Spin spinning={ocrLoading && ocrActiveCard === 'driverLicense'} tip="正在使用ONEOS-OCR识别行驶证照片...">
                  {/* 年审超前任务提醒 */}
                  {driverAlertInfo && (
                    <Alert
                      message={
                        <div style={{ fontWeight: 600 }}>
                          车辆年检超前感知系统
                        </div>
                      }
                      description={
                        <div style={{ fontSize: 12, marginTop: 4 }}>
                          根据法规政策，机动车行驶证需在检验有效期前完成年检。系统会提前 90 天自动生成年检任务。 
                          本车辆距离年检最终时间还剩余 <strong style={{ fontSize: 14, color: driverAlertInfo.daysLeft > 30 ? '#10b981' : '#ef4444' }}>{driverAlertInfo.daysLeft}</strong> 天
                        </div>
                      }
                      type={driverAlertInfo.shouldWarn ? "error" : "warning"}
                      showIcon
                      icon={ICONS.warning}
                      style={{ marginBottom: 20, borderRadius: 12 }}
                    />
                  )}

                  <div style={{ marginBottom: 20 }}>
                    <div className="lc-form-group-title">
                      <span>证件照片上传</span>
                      <span style={{ fontSize: 11, fontWeight: 400, color: '#94a3b8' }}>（支持正副本及细节图，最多4张）</span>
                    </div>
                    
                    <div className="lc-upload-grid">
                      {licenses.driverLicense.photos.map((url, idx) => (
                        <div className="lc-upload-box" key={idx}>
                          {ocrLoading && ocrActiveCard === 'driverLicense' && <div className="lc-ocr-scanline" />}
                          <img src={url} className="lc-image-thumb" alt="行驶证" />
                          <div className="lc-image-mask">
                            <Tooltip title="查看大图">
                              <div className="lc-image-action-btn" onClick={() => { setPreviewUrl(url); setPreviewOpen(true); }}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 8 8 8 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                              </div>
                            </Tooltip>
                            <Tooltip title="更换照片">
                              <div className="lc-image-action-btn" onClick={() => handlePhotoUpdate('driverLicense', idx)}>
                                {ICONS.edit}
                              </div>
                            </Tooltip>
                            <Tooltip title="移除照片">
                              <div className="lc-image-action-btn delete" onClick={() => handlePhotoDelete('driverLicense', idx)}>
                                {ICONS.delete}
                              </div>
                            </Tooltip>
                          </div>
                        </div>
                      ))}
                      
                      {licenses.driverLicense.photos.length < 4 && (
                        <div className="lc-upload-box" onClick={() => handlePhotoUpload('driverLicense')}>
                          {ICONS.camera}
                          <span style={{ fontSize: 12, marginTop: 8, fontWeight: 500 }}>上传照片 ({licenses.driverLicense.photos.length}/4)</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <Divider style={{ margin: '20px 0' }} />

                  <div className="lc-form-grid">
                    <Form.Item label={<span style={{ fontWeight: 600 }}>注册日期</span>} required>
                      <DatePicker 
                        value={licenses.driverLicense.regDate ? moment(licenses.driverLicense.regDate) : null} 
                        onChange={(date, dateString) => setLicenses(prev => {
                          const copy = { ...prev };
                          copy.driverLicense.regDate = dateString;
                          return copy;
                        })}
                        placeholder="选择注册日期"
                        className={ocrHighlight && ocrActiveCard === 'driverLicense' ? 'lc-ocr-flash' : ''}
                        style={{ width: '100%' }}
                      />
                    </Form.Item>
                    
                    <Form.Item label={<span style={{ fontWeight: 600 }}>发证日期</span>} required>
                      <DatePicker 
                        value={licenses.driverLicense.issueDate ? moment(licenses.driverLicense.issueDate) : null} 
                        onChange={(date, dateString) => setLicenses(prev => {
                          const copy = { ...prev };
                          copy.driverLicense.issueDate = dateString;
                          return copy;
                        })}
                        placeholder="选择发证日期"
                        className={ocrHighlight && ocrActiveCard === 'driverLicense' ? 'lc-ocr-flash' : ''}
                        style={{ width: '100%' }}
                      />
                    </Form.Item>

                    <Form.Item label={<span style={{ fontWeight: 600 }}>强制报废日期</span>} required>
                      <DatePicker 
                        value={licenses.driverLicense.scrapDate ? moment(licenses.driverLicense.scrapDate) : null} 
                        onChange={(date, dateString) => setLicenses(prev => {
                          const copy = { ...prev };
                          copy.driverLicense.scrapDate = dateString;
                          return copy;
                        })}
                        placeholder="选择强制报废日期"
                        className={ocrHighlight && ocrActiveCard === 'driverLicense' ? 'lc-ocr-flash' : ''}
                        style={{ width: '100%' }}
                      />
                    </Form.Item>

                    <Form.Item 
                      label={<span style={{ fontWeight: 600 }}>检验有效期至</span>} 
                      required
                    >
                      <DatePicker 
                        picker="month"
                        format="YYYY-MM-DD"
                        value={licenses.driverLicense.expireDate ? moment(licenses.driverLicense.expireDate) : null}
                        onChange={(date, dateString) => handleDriverLicenseExpireChange(dateString)}
                        placeholder="选择年月"
                        className={ocrHighlight && ocrActiveCard === 'driverLicense' ? 'lc-ocr-flash' : ''}
                        style={{ width: '100%' }}
                      />
                    </Form.Item>
                  </div>

                  {/* 沪牌专属字段 */}
                  {isShanghaiPlate && (
                    <div style={{ 
                      marginTop: 20, 
                      padding: 18, 
                      borderRadius: 12, 
                      background: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)', 
                      border: '1.5px solid #ddd6fe',
                      animation: 'lc-slide-down .3s ease-out'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                        <span className="lc-sh-badge">沪牌车辆等级评定</span>
                        <span style={{ fontSize: 12, color: '#6d28d9', fontWeight: 500 }}>
                          本市牌照车辆需定期进行等级评定，目前距下次等级评定还有 {shEvaluationDaysLeft !== null ? shEvaluationDaysLeft : '--'} 天
                        </span>
                      </div>
                      <Row gutter={16}>
                        <Col span={12}>
                          <Form.Item label={<span style={{ fontWeight: 700, color: '#5b21b6' }}>下次等级评定时间</span>} required>
                            <DatePicker 
                              value={licenses.driverLicense.shNextEvaluation ? moment(licenses.driverLicense.shNextEvaluation) : null}
                              onChange={(date, dateString) => setLicenses(prev => {
                                const copy = { ...prev };
                                copy.driverLicense.shNextEvaluation = dateString;
                                return copy;
                              })}
                              style={{ width: '100%', borderRadius: 8 }}
                              placeholder="选择评定日期"
                            />
                          </Form.Item>
                        </Col>
                      </Row>
                    </div>
                  )}
                </Spin>
              </Card>

              {/* Card 2: 道路运输证 */}
              <Card 
                id="transportLicense" 
                className="lc-card" 
                title={
                  <div className="lc-card-title">
                    <span>道路运输证</span>
                  </div>
                }
                extra={
                  <Space>
                    {isCardDirty('transportLicense') && (
                      <span style={{ fontSize: 11, color: '#f97316', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4, marginRight: 8 }}>
                        <Badge status="warning" /> 未保存
                      </span>
                    )}
                    {licenses.transportLicense.photos.length > 0 && (
                      <span className="lc-ocr-tag">{ICONS.success} 已完善</span>
                    )}
                    <Button 
                      type="primary" 
                      size="small" 
                      style={{ borderRadius: '6px', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', border: 'none' }}
                      onClick={() => handleCardSubmit('transportLicense', '道路运输证')}
                    >
                      保存该项
                    </Button>
                  </Space>
                }
              >
                <Spin spinning={ocrLoading && ocrActiveCard === 'transportLicense'} tip="正在提取运输证许可证信息...">
                  {/* 年审超前任务提醒 */}
                  {transportAlertInfo && (
                    <Alert
                      message={
                        <div style={{ fontWeight: 600 }}>
                          营运证件年审超前感知系统
                        </div>
                      }
                      description={
                        <div style={{ fontSize: 12, marginTop: 4 }}>
                          根据法规政策，道路运输证需在有效期前进行续签，系统会提前 60 天列入年审任务。
                          本车辆距离最终检验时间还剩 <strong style={{ fontSize: 14, color: transportAlertInfo.daysLeft > 15 ? '#10b981' : '#ef4444' }}>{transportAlertInfo.daysLeft}</strong> 天
                        </div>
                      }
                      type={transportAlertInfo.shouldWarn ? "error" : "warning"}
                      showIcon
                      icon={ICONS.warning}
                      style={{ marginBottom: 20, borderRadius: 12 }}
                    />
                  )}

                  <div style={{ marginBottom: 20 }}>
                    <div className="lc-form-group-title">
                      <span>道路运输证照片</span>
                    </div>
                    <div className="lc-upload-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
                      {licenses.transportLicense.photos.map((url, idx) => (
                        <div className="lc-upload-box" key={idx}>
                          <img src={url} className="lc-image-thumb" alt="道路运输证" />
                          <div className="lc-image-mask">
                            <Tooltip title="查看大图">
                              <div className="lc-image-action-btn" onClick={() => { setPreviewUrl(url); setPreviewOpen(true); }}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 8 8 8 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                              </div>
                            </Tooltip>
                            <Tooltip title="更换照片">
                              <div className="lc-image-action-btn" onClick={() => handlePhotoUpdate('transportLicense', idx)}>
                                {ICONS.edit}
                              </div>
                            </Tooltip>
                            <Tooltip title="移除照片">
                              <div className="lc-image-action-btn delete" onClick={() => handlePhotoDelete('transportLicense', idx)}>
                                {ICONS.delete}
                              </div>
                            </Tooltip>
                          </div>
                        </div>
                      ))}
                      {licenses.transportLicense.photos.length === 0 && (
                        <div className="lc-upload-box" onClick={() => handlePhotoUpload('transportLicense')}>
                          {ICONS.camera}
                          <span style={{ fontSize: 12, marginTop: 8, fontWeight: 500 }}>上传运输证主图</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <Divider style={{ margin: '20px 0' }} />

                  <div className="lc-form-grid">
                    <Form.Item label={<span style={{ fontWeight: 600 }}>经营许可证号</span>} required>
                      <Input 
                        value={licenses.transportLicense.licenseNo} 
                        onChange={e => setLicenses(prev => {
                          const copy = { ...prev };
                          copy.transportLicense.licenseNo = e.target.value;
                          return copy;
                        })}
                        placeholder="例如：交字31011..."
                        className={ocrHighlight && ocrActiveCard === 'transportLicense' ? 'lc-ocr-flash' : ''}
                      />
                    </Form.Item>

                    <Form.Item label={<span style={{ fontWeight: 600 }}>核发时间</span>} required>
                      <DatePicker 
                        value={licenses.transportLicense.issueDate ? moment(licenses.transportLicense.issueDate) : null} 
                        onChange={(date, dateString) => setLicenses(prev => {
                          const copy = { ...prev };
                          copy.transportLicense.issueDate = dateString;
                          return copy;
                        })}
                        placeholder="选择核发时间"
                        className={ocrHighlight && ocrActiveCard === 'transportLicense' ? 'lc-ocr-flash' : ''}
                        style={{ width: '100%' }}
                      />
                    </Form.Item>

                    <Form.Item label={<span style={{ fontWeight: 600 }}>证件有效期</span>} required>
                      <DatePicker 
                        value={licenses.transportLicense.expireDate ? moment(licenses.transportLicense.expireDate) : null} 
                        onChange={(date, dateString) => setLicenses(prev => {
                          const copy = { ...prev };
                          copy.transportLicense.expireDate = dateString;
                          return copy;
                        })}
                        placeholder="道路运输证有效期至"
                        className={ocrHighlight && ocrActiveCard === 'transportLicense' ? 'lc-ocr-flash' : ''}
                        style={{ width: '100%' }}
                      />
                    </Form.Item>

                    <Form.Item label={<span style={{ fontWeight: 600 }}>审验有效期</span>} required>
                      <DatePicker 
                        value={licenses.transportLicense.inspectValidUntil ? moment(licenses.transportLicense.inspectValidUntil) : null} 
                        onChange={(date, dateString) => setLicenses(prev => {
                          const copy = { ...prev };
                          copy.transportLicense.inspectValidUntil = dateString;
                          return copy;
                        })}
                        placeholder="选择审验有效期"
                        className={ocrHighlight && ocrActiveCard === 'transportLicense' ? 'lc-ocr-flash' : ''}
                        style={{ width: '100%' }}
                      />
                    </Form.Item>
                  </div>
                </Spin>
              </Card>

              {/* Card 3: 登记证 */}
              <Card 
                id="registrationCert" 
                className="lc-card" 
                title={
                  <div className="lc-card-title">
                    <span>登记证</span>
                  </div>
                }
                extra={
                  <Space>
                    {isCardDirty('registrationCert') && (
                      <span style={{ fontSize: 11, color: '#f97316', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4, marginRight: 8 }}>
                        <Badge status="warning" /> 未保存
                      </span>
                    )}
                    {licenses.registrationCert.photos.length > 0 && (
                      <span className="lc-ocr-tag">{ICONS.success} 已完善</span>
                    )}
                    <Button 
                      type="primary" 
                      size="small" 
                      style={{ borderRadius: '6px', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', border: 'none' }}
                      onClick={() => handleCardSubmit('registrationCert', '登记证')}
                    >
                      保存该项
                    </Button>
                  </Space>
                }
              >
                <div className="lc-form-group-title">
                  <span>登记证高清照片</span>
                  <span style={{ fontSize: 11, fontWeight: 400, color: '#94a3b8' }}>（支持上传多张，包含登记栏所有变更页）</span>
                </div>
                
                <div className="lc-upload-grid">
                  {licenses.registrationCert.photos.map((url, idx) => (
                    <div className="lc-upload-box" key={idx}>
                      <img src={url} className="lc-image-thumb" alt="登记证" />
                      <div className="lc-image-mask">
                        <Tooltip title="查看大图">
                          <div className="lc-image-action-btn" onClick={() => { setPreviewUrl(url); setPreviewOpen(true); }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 8 8 8 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                          </div>
                        </Tooltip>
                        <Tooltip title="更换照片">
                          <div className="lc-image-action-btn" onClick={() => handlePhotoUpdate('registrationCert', idx)}>
                            {ICONS.edit}
                          </div>
                        </Tooltip>
                        <Tooltip title="移除照片">
                          <div className="lc-image-action-btn delete" onClick={() => handlePhotoDelete('registrationCert', idx)}>
                            {ICONS.delete}
                          </div>
                        </Tooltip>
                      </div>
                    </div>
                  ))}
                  <div className="lc-upload-box" onClick={() => handlePhotoUpload('registrationCert')}>
                    {ICONS.camera}
                    <span style={{ fontSize: 12, marginTop: 8, fontWeight: 500 }}>追加新页面</span>
                  </div>
                </div>
              </Card>

              {/* Card 4: 特种设备使用登记证 */}
              <Card 
                id="specialEquipCert" 
                className="lc-card" 
                title={
                  <div className="lc-card-title">
                    <span>特种设备使用登记证</span>
                  </div>
                }
                extra={
                  <Space>
                    {isCardDirty('specialEquipCert') && (
                      <span style={{ fontSize: 11, color: '#f97316', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4, marginRight: 8 }}>
                        <Badge status="warning" /> 未保存
                      </span>
                    )}
                    {licenses.specialEquipCert.photos.length > 0 && (
                      <span className="lc-ocr-tag">{ICONS.success} 已完善</span>
                    )}
                    <Button 
                      type="primary" 
                      size="small" 
                      style={{ borderRadius: '6px', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', border: 'none' }}
                      onClick={() => handleCardSubmit('specialEquipCert', '特种设备使用登记证')}
                    >
                      保存该项
                    </Button>
                  </Space>
                }
              >
                <div className="lc-form-group-title">
                  <span>使用登记证照片</span>
                </div>
                
                <div className="lc-upload-grid">
                  {licenses.specialEquipCert.photos.map((url, idx) => (
                    <div className="lc-upload-box" key={idx}>
                      <img src={url} className="lc-image-thumb" alt="特种设备使用登记证" />
                      <div className="lc-image-mask">
                        <Tooltip title="查看大图">
                          <div className="lc-image-action-btn" onClick={() => { setPreviewUrl(url); setPreviewOpen(true); }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 8 8 8 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                          </div>
                        </Tooltip>
                        <Tooltip title="更换照片">
                          <div className="lc-image-action-btn" onClick={() => handlePhotoUpdate('specialEquipCert', idx)}>
                            {ICONS.edit}
                          </div>
                        </Tooltip>
                        <Tooltip title="移除照片">
                          <div className="lc-image-action-btn delete" onClick={() => handlePhotoDelete('specialEquipCert', idx)}>
                            {ICONS.delete}
                          </div>
                        </Tooltip>
                      </div>
                    </div>
                  ))}
                  {licenses.specialEquipCert.photos.length === 0 && (
                    <div className="lc-upload-box" onClick={() => handlePhotoUpload('specialEquipCert')}>
                      {ICONS.camera}
                      <span style={{ fontSize: 12, marginTop: 8, fontWeight: 500 }}>上传登记证</span>
                    </div>
                  )}
                </div>
              </Card>

              {/* Card 5: 特种设备使用标识 */}
              <Card 
                id="specialEquipDecal" 
                className="lc-card" 
                title={
                  <div className="lc-card-title">
                    <span>特种设备使用标识</span>
                  </div>
                }
                extra={
                  <Space>
                    {isCardDirty('specialEquipDecal') && (
                      <span style={{ fontSize: 11, color: '#f97316', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4, marginRight: 8 }}>
                        <Badge status="warning" /> 未保存
                      </span>
                    )}
                    {licenses.specialEquipDecal.photos.length > 0 && (
                      <span className="lc-ocr-tag">{ICONS.success} 已完善</span>
                    )}
                    <Button 
                      type="primary" 
                      size="small" 
                      style={{ borderRadius: '6px', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', border: 'none' }}
                      onClick={() => handleCardSubmit('specialEquipDecal', '特种设备使用标识')}
                    >
                      保存该项
                    </Button>
                  </Space>
                }
              >
                {specialEquipDecalAlertInfo && (
                  <Alert
                    message={
                      <div style={{ fontWeight: 600 }}>
                        特种设备使用标识检验超前感知系统
                      </div>
                    }
                    description={
                      <div style={{ fontSize: 12, marginTop: 4 }}>
                        {specialEquipDecalAlertInfo.isExpired ? (
                          <>
                            本车「下次检验日期」已到期，已逾期 <strong style={{ fontSize: 14, color: '#ef4444' }}>{Math.abs(specialEquipDecalAlertInfo.daysLeft)}</strong> 天，请尽快安排检验并更新标识信息。
                          </>
                        ) : (
                          <>
                            系统提前 <strong>{SPECIAL_EQUIP_DECAL_WARN_DAYS}</strong> 天感知特种设备使用标识检验临期（与证照台账列表规则一致）。
                            距离下次检验日期还剩 <strong style={{ fontSize: 14, color: specialEquipDecalAlertInfo.shouldWarn ? '#ef4444' : '#10b981' }}>{specialEquipDecalAlertInfo.daysLeft}</strong> 天
                            {specialEquipDecalAlertInfo.shouldWarn ? '，已进入高危提醒区间，请优先处理。' : '，请关注检验安排。'}
                          </>
                        )}
                      </div>
                    }
                    type={specialEquipDecalAlertInfo.isExpired || specialEquipDecalAlertInfo.shouldWarn ? 'error' : 'warning'}
                    showIcon
                    icon={ICONS.warning}
                    style={{ marginBottom: 20, borderRadius: 12 }}
                  />
                )}

                <div className="lc-form-group-title">
                  <span>使用安全标识照片</span>
                </div>
                
                <div className="lc-upload-grid" style={{ marginBottom: 20 }}>
                  {licenses.specialEquipDecal.photos.map((url, idx) => (
                    <div className="lc-upload-box" key={idx}>
                      <img src={url} className="lc-image-thumb" alt="使用安全标识" />
                      <div className="lc-image-mask">
                        <Tooltip title="查看大图">
                          <div className="lc-image-action-btn" onClick={() => { setPreviewUrl(url); setPreviewOpen(true); }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 8 8 8 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                          </div>
                        </Tooltip>
                        <Tooltip title="更换照片">
                          <div className="lc-image-action-btn" onClick={() => handlePhotoUpdate('specialEquipDecal', idx)}>
                            {ICONS.edit}
                          </div>
                        </Tooltip>
                        <Tooltip title="移除照片">
                          <div className="lc-image-action-btn delete" onClick={() => handlePhotoDelete('specialEquipDecal', idx)}>
                            {ICONS.delete}
                          </div>
                        </Tooltip>
                      </div>
                    </div>
                  ))}
                  {licenses.specialEquipDecal.photos.length === 0 && (
                    <div className="lc-upload-box" onClick={() => handlePhotoUpload('specialEquipDecal')}>
                      {ICONS.camera}
                      <span style={{ fontSize: 12, marginTop: 8, fontWeight: 500 }}>上传标识贴</span>
                    </div>
                  )}
                </div>

                <Divider style={{ margin: '20px 0' }} />

                <div className="lc-form-grid">
                  <Form.Item label={<span style={{ fontWeight: 600 }}>下次检验日期</span>} required>
                    <DatePicker 
                      value={licenses.specialEquipDecal.nextInspectDate ? moment(licenses.specialEquipDecal.nextInspectDate) : null}
                      onChange={(date, dateString) => setLicenses(prev => {
                        const copy = { ...prev };
                        copy.specialEquipDecal.nextInspectDate = dateString;
                        return copy;
                      })}
                      style={{ width: '100%' }}
                      placeholder="选择检验截止日期"
                    />
                  </Form.Item>
                </div>
              </Card>

              {/* Card 6: 加氢卡 */}
              <Card 
                id="hydrogenCard" 
                className="lc-card" 
                title={
                  <div className="lc-card-title">
                    <span>加氢卡</span>
                  </div>
                }
                extra={
                  <Space>
                    {isCardDirty('hydrogenCard') && (
                      <span style={{ fontSize: 11, color: '#f97316', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4, marginRight: 8 }}>
                        <Badge status="warning" /> 未保存
                      </span>
                    )}
                    {licenses.hydrogenCard.cardNo && (
                      <span className="lc-ocr-tag">{ICONS.success} 已完善</span>
                    )}
                    <Button 
                      type="primary" 
                      size="small" 
                      style={{ borderRadius: '6px', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', border: 'none' }}
                      onClick={() => handleCardSubmit('hydrogenCard', '加氢卡')}
                    >
                      保存该项
                    </Button>
                  </Space>
                }
              >
                <div style={{ marginBottom: 20, maxWidth: 320 }}>
                  <div className="lc-h2-refuel-card">
                    <div className="lc-h2-card-logo">
                      <span>加氢卡类型</span>
                    </div>
                    
                    <div className="lc-h2-card-number">
                      {licenses.hydrogenCard.cardNo || '•••• •••• •••• ••••'}
                    </div>
                    
                    <div>
                      <div style={{ fontSize: 9, color: '#cbd5e1', textTransform: 'uppercase' }}>Available Balance</div>
                      <div className="lc-h2-card-balance">
                        ¥ {licenses.hydrogenCard.balance ? licenses.hydrogenCard.balance.toLocaleString('zh-CN', {minimumFractionDigits: 2}) : '0.00'}
                      </div>
                    </div>
                    
                    <div className="lc-h2-card-meta">
                      <div>TYPE: {licenses.hydrogenCard.cardType || '中石化加氢卡'}</div>
                      <div>BY: {licenses.hydrogenCard.issueUser ? licenses.hydrogenCard.issueUser.split('-')[1] || licenses.hydrogenCard.issueUser : '能源管理部-张晓'}</div>
                    </div>
                  </div>
                </div>

                <Divider style={{ margin: '20px 0' }} />

                <div className="lc-form-grid">
                  <Form.Item label={<span style={{ fontWeight: 600 }}>加氢卡号</span>} required>
                    <Input 
                      value={licenses.hydrogenCard.cardNo} 
                      disabled
                      placeholder="未绑定卡号"
                    />
                  </Form.Item>

                  <Form.Item label={<span style={{ fontWeight: 600 }}>实时余额</span>} required>
                    <InputNumber 
                      value={licenses.hydrogenCard.balance}
                      disabled
                      style={{ width: '100%' }}
                      formatter={value => `¥ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      parser={value => value.replace(/\¥\s?|(,*)/g, '')}
                    />
                  </Form.Item>

                  <Form.Item label={<span style={{ fontWeight: 600 }}>配发时间</span>}>
                    <DatePicker 
                      showTime={{ format: 'HH:mm' }}
                      format="YYYY-MM-DD HH:mm"
                      value={licenses.hydrogenCard.issueDate ? moment(licenses.hydrogenCard.issueDate, 'YYYY-MM-DD HH:mm') : null}
                      disabled
                      style={{ width: '100%' }}
                    />
                  </Form.Item>
                  
                  <Form.Item label={<span style={{ fontWeight: 600 }}>配发经办人</span>}>
                    <Input 
                      value={licenses.hydrogenCard.issueUser}
                      disabled
                      placeholder="未录入经办人"
                    />
                  </Form.Item>
                </div>
              </Card>

              {/* Card 7: 安全阀 */}
              <Card 
                id="safetyValve" 
                className="lc-card" 
                title={
                  <div className="lc-card-title">
                    <span>安全阀</span>
                  </div>
                }
                extra={
                  <Space>
                    {isCardDirty('safetyValve') && (
                      <span style={{ fontSize: 11, color: '#f97316', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4, marginRight: 8 }}>
                        <Badge status="warning" /> 未保存
                      </span>
                    )}
                    {licenses.safetyValve.photos.length > 0 && (
                      <span className="lc-ocr-tag">{ICONS.success} 已完善</span>
                    )}
                    <Button 
                      type="primary" 
                      size="small" 
                      style={{ borderRadius: '6px', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', border: 'none' }}
                      onClick={() => handleCardSubmit('safetyValve', '安全阀')}
                    >
                      保存该项
                    </Button>
                  </Space>
                }
              >
                <div className="lc-form-group-title">
                  <span>安全阀校验报告照片</span>
                </div>
                
                <div className="lc-upload-grid" style={{ marginBottom: 20 }}>
                  {licenses.safetyValve.photos.map((url, idx) => (
                    <div className="lc-upload-box" key={idx}>
                      <img src={url} className="lc-image-thumb" alt="安全阀" />
                      <div className="lc-image-mask">
                        <Tooltip title="查看大图">
                          <div className="lc-image-action-btn" onClick={() => { setPreviewUrl(url); setPreviewOpen(true); }}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 8 8 8 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                          </div>
                        </Tooltip>
                        <Tooltip title="更换照片">
                          <div className="lc-image-action-btn" onClick={() => handlePhotoUpdate('safetyValve', idx)}>
                            {ICONS.edit}
                          </div>
                        </Tooltip>
                        <Tooltip title="移除照片">
                          <div className="lc-image-action-btn delete" onClick={() => handlePhotoDelete('safetyValve', idx)}>
                            {ICONS.delete}
                          </div>
                        </Tooltip>
                      </div>
                    </div>
                  ))}
                  {licenses.safetyValve.photos.length === 0 && (
                    <div className="lc-upload-box" onClick={() => handlePhotoUpload('safetyValve')}>
                      {ICONS.camera}
                      <span style={{ fontSize: 12, marginTop: 8, fontWeight: 500 }}>上传阀体/报告</span>
                    </div>
                  )}
                </div>

                <Divider style={{ margin: '20px 0' }} />

                <div className="lc-form-grid">
                  <Form.Item label={<span style={{ fontWeight: 600 }}>本次检验日期</span>} required>
                    <DatePicker 
                      value={licenses.safetyValve.inspectDate ? moment(licenses.safetyValve.inspectDate) : null}
                      onChange={(date, dateString) => setLicenses(prev => {
                        const copy = { ...prev };
                        copy.safetyValve.inspectDate = dateString;
                        return copy;
                      })}
                      style={{ width: '100%' }}
                      placeholder="选择检验日期"
                    />
                  </Form.Item>
                  
                  <Form.Item label={<span style={{ fontWeight: 600 }}>下次检测日期</span>} required>
                    <DatePicker 
                      value={licenses.safetyValve.nextInspectDate ? moment(licenses.safetyValve.nextInspectDate) : null}
                      onChange={(date, dateString) => setLicenses(prev => {
                        const copy = { ...prev };
                        copy.safetyValve.nextInspectDate = dateString;
                        return copy;
                      })}
                      style={{ width: '100%' }}
                      placeholder="选择下次检测日期"
                    />
                  </Form.Item>
                </div>
              </Card>

              {/* Card 8: 压力表 */}
              <Card 
                id="pressureGauge" 
                className="lc-card" 
                title={
                  <div className="lc-card-title">
                    <span>压力表</span>
                  </div>
                }
                extra={
                  <Space>
                    {isCardDirty('pressureGauge') && (
                      <span style={{ fontSize: 11, color: '#f97316', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4, marginRight: 8 }}>
                        <Badge status="warning" /> 未保存
                      </span>
                    )}
                    {licenses.pressureGauge.photos.length > 0 && (
                      <span className="lc-ocr-tag">{ICONS.success} 已完善</span>
                    )}
                    <Button 
                      type="primary" 
                      size="small" 
                      style={{ borderRadius: '6px', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', border: 'none' }}
                      onClick={() => handleCardSubmit('pressureGauge', '压力表')}
                    >
                      保存该项
                    </Button>
                  </Space>
                }
              >
                <div className="lc-form-group-title">
                  <span>压力表校验报告照片</span>
                </div>
                
                <div className="lc-upload-grid" style={{ marginBottom: 20 }}>
                  {licenses.pressureGauge.photos.map((url, idx) => (
                    <div className="lc-upload-box" key={idx}>
                      <img src={url} className="lc-image-thumb" alt="压力表" />
                      <div className="lc-image-mask">
                        <Tooltip title="查看大图">
                          <div className="lc-image-action-btn" onClick={() => { setPreviewUrl(url); setPreviewOpen(true); }}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 8 8 8 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                          </div>
                        </Tooltip>
                        <Tooltip title="更换照片">
                          <div className="lc-image-action-btn" onClick={() => handlePhotoUpdate('pressureGauge', idx)}>
                            {ICONS.edit}
                          </div>
                        </Tooltip>
                        <Tooltip title="移除照片">
                          <div className="lc-image-action-btn delete" onClick={() => handlePhotoDelete('pressureGauge', idx)}>
                            {ICONS.delete}
                          </div>
                        </Tooltip>
                      </div>
                    </div>
                  ))}
                  {licenses.pressureGauge.photos.length === 0 && (
                    <div className="lc-upload-box" onClick={() => handlePhotoUpload('pressureGauge')}>
                      {ICONS.camera}
                      <span style={{ fontSize: 12, marginTop: 8, fontWeight: 500 }}>上传表盘/报告</span>
                    </div>
                  )}
                </div>

                <Divider style={{ margin: '20px 0' }} />

                <div className="lc-form-grid">
                  <Form.Item label={<span style={{ fontWeight: 600 }}>本次检验日期</span>} required>
                    <DatePicker 
                      value={licenses.pressureGauge.inspectDate ? moment(licenses.pressureGauge.inspectDate) : null}
                      onChange={(date, dateString) => setLicenses(prev => {
                        const copy = { ...prev };
                        copy.pressureGauge.inspectDate = dateString;
                        return copy;
                      })}
                      style={{ width: '100%' }}
                      placeholder="选择检验日期"
                    />
                  </Form.Item>
                  
                  <Form.Item label={<span style={{ fontWeight: 600 }}>下次检验日期</span>} required>
                    <DatePicker 
                      value={licenses.pressureGauge.nextInspectDate ? moment(licenses.pressureGauge.nextInspectDate) : null}
                      onChange={(date, dateString) => setLicenses(prev => {
                        const copy = { ...prev };
                        copy.pressureGauge.nextInspectDate = dateString;
                        return copy;
                      })}
                      style={{ width: '100%' }}
                      placeholder="选择下次检验日期"
                    />
                  </Form.Item>
                </div>
              </Card>
              </Form>
            </section>
          </main>

          {/* 底部浮动提交栏 */}
          <footer className="lc-page-footer">
            <Space size={12}>
              <Button 
                type="primary"
                size="large" 
                style={{ borderRadius: '10px', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', border: 'none', minWidth: 140 }}
                onClick={() => navigateToLicenseList('已返回证照台账列表')}
              >
                返回台账列表
              </Button>
            </Space>
          </footer>
        </div>

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
            <span>证照资质维护 · 产品需求说明</span>
          </div>
        }
        footer={[
          <Button key="close" type="primary" style={{ borderRadius: 8, background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)', border: 'none' }} onClick={() => setPrdOpen(false)}>
            我已了解
          </Button>
        ]}
        onCancel={() => setPrdOpen(false)}
        width={960}
        centered
        bodyStyle={{ maxHeight: '72vh', overflowY: 'auto', padding: '12px 24px 24px' }}
      >
        <div style={{ fontSize: 13, lineHeight: 1.65, color: '#334155' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16, fontSize: 12, color: '#64748b' }}>
            <Tag color="green">本页：证照资质维护</Tag>
            <Tag>模块路径：运维管理 &gt; 车辆业务 &gt; 证照管理-编辑</Tag>
            <Tag>文档版本：V1.1</Tag>
            <Tag>读者：产品 / 运营 / 合规 / 研发测试</Tag>
          </div>

          <Alert
            type="info"
            showIcon
            style={{ marginBottom: 16, borderRadius: 12 }}
            message={<span style={{ fontWeight: 700 }}>本文档说明「证照管理-编辑」维护页</span>}
            description="由台账列表「管理」进入；与「证照管理」列表共用证照库（localStorage + session 车牌）。列表监管、批量作业见列表页 PRD。"
          />

          <Tabs defaultActiveKey="core" size="middle" tabBarGutter={12} type="card" className="lc-prd-tabs">
            <Tabs.TabPane tab="⭐ 核心逻辑" key="core">
              <div style={{ marginTop: 10 }}>
                <div style={{ background: 'linear-gradient(135deg, #ecfdf5 0%, #f8fafc 100%)', border: '2px solid #6ee7b7', borderRadius: 12, padding: '14px 18px', marginBottom: 16 }}>
                  <div style={{ fontWeight: 800, fontSize: 15, color: '#047857', marginBottom: 10 }}>产品定位（本页）</div>
                  <p style={{ margin: '0 0 8px' }}><strong>单车维护工作台：</strong>对一台车的八类证照分卡片录入影像与关键日期，<strong>不做</strong>列表筛选与批量任务。</p>
                  <p style={{ margin: 0 }}><strong>价值：</strong>分卡保存降低心智负担；OCR + 车牌校验防串证；超前感知提示驱动检验续办。</p>
                </div>

                <div style={{ fontWeight: 800, fontSize: 14, color: '#0f172a', marginBottom: 10 }}>端到端主流程</div>
                <ol style={{ paddingLeft: 20, margin: '0 0 18px', lineHeight: 1.75 }}>
                  <li>列表点「管理」→ 带入车牌进入本页</li>
                  <li>左侧看索引状态点 → 点击定位右侧证照卡片</li>
                  <li>上传/改字段 → 触发「未保存」；行驶证/运输证另触发 OCR</li>
                  <li>单卡「保存该项」→ 写回证照库 → 列表 KPI/行状态更新</li>
                  <li>「返回台账列表」→ 回到证照管理列表（已保存数据保留）</li>
                </ol>

                <div style={{ fontWeight: 800, fontSize: 14, color: '#b91c1c', marginBottom: 10 }}>【重点】五条必读规则</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 18 }}>
                  <div style={{ background: '#fffbeb', border: '1px solid #fcd34d', borderRadius: 10, padding: '10px 14px' }}>
                    <strong style={{ color: '#92400e' }}>① 分卡片保存（非整页提交）</strong>
                    <span style={{ color: '#78350f' }}> — 每张证照独立保存；未保存切换车辆须二次确认；返回列表不丢已保存数据。</span>
                  </div>
                  <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '10px 14px' }}>
                    <strong style={{ color: '#991b1b' }}>② 行驶证/运输证 OCR 车牌强校验</strong>
                    <span style={{ color: '#7f1d1d' }}> — 上传或更换照片触发 OCR；识别车牌与当前车不一致则弹窗阻断并清空当次无效照片。</span>
                  </div>
                  <div style={{ background: '#eff6ff', border: '1px solid #93c5fd', borderRadius: 10, padding: '10px 14px' }}>
                    <strong style={{ color: '#1d4ed8' }}>③ 三类超前感知（维护页 Alert）</strong>
                    <span style={{ color: '#1e3a8a' }}> — 行驶证 ≤90 天；道路运输证 ≤60 天；<strong>特种设备使用标识 ≤60 天</strong>（≤15 天高危红提示，已到期单独文案）。与列表临期规则一致。</span>
                  </div>
                  <div style={{ background: '#f5f3ff', border: '1px solid #c4b5fd', borderRadius: 10, padding: '10px 14px' }}>
                    <strong style={{ color: '#5b21b6' }}>④ 运营状态展示</strong>
                    <span style={{ color: '#4c1d95' }}> — 主数据「可运营」「待运营」展示为「库存」；与列表、筛选口径一致。</span>
                  </div>
                  <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 10, padding: '10px 14px' }}>
                    <strong style={{ color: '#166534' }}>⑤ 数据回写</strong>
                    <span style={{ color: '#14532d' }}> — 保存写入 <code>oneos_lc_licenses_v1</code>；列表通过事件刷新；支持 Axhub 导航往返。</span>
                  </div>
                </div>

                <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>超前感知阈值（与列表联动）</div>
                <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #e2e8f0', fontSize: 12 }}>
                  <thead>
                    <tr style={{ background: '#f8fafc' }}>
                      <th style={{ padding: '8px 12px', textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>证照</th>
                      <th style={{ padding: '8px 12px', textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>感知窗口</th>
                      <th style={{ padding: '8px 12px', textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>维护页提示</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr><td style={{ padding: '8px 12px', borderBottom: '1px solid #f1f5f9' }}>行驶证</td><td style={{ padding: '8px 12px', borderBottom: '1px solid #f1f5f9' }}>≤90 天</td><td style={{ padding: '8px 12px', borderBottom: '1px solid #f1f5f9' }}>≤30 天 Alert 升为 error</td></tr>
                    <tr><td style={{ padding: '8px 12px', borderBottom: '1px solid #f1f5f9' }}>道路运输证</td><td style={{ padding: '8px 12px', borderBottom: '1px solid #f1f5f9' }}>证件/审验有效期 ≤60 天</td><td style={{ padding: '8px 12px', borderBottom: '1px solid #f1f5f9' }}>≤15 天 error（按证件有效期算）</td></tr>
                    <tr><td style={{ padding: '8px 12px', fontWeight: 600, color: '#059669' }}>特种设备使用标识</td><td style={{ padding: '8px 12px', fontWeight: 600 }}>下次检验 ≤60 天</td><td style={{ padding: '8px 12px' }}>≤15 天 error；≤0 天「已逾期」文案；索引橙/红与列表一致</td></tr>
                    <tr><td style={{ padding: '8px 12px' }}>安全阀/压力表</td><td style={{ padding: '8px 12px' }}>下次检验 ≤60 天</td><td style={{ padding: '8px 12px' }}>仅索引状态点，卡片内无 Alert 条（可后续迭代）</td></tr>
                  </tbody>
                </table>
              </div>
            </Tabs.TabPane>

            <Tabs.TabPane tab="📋 八类证照" key="certs">
              <div style={{ marginTop: 10, fontSize: 12 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #e2e8f0' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc' }}>
                      <th style={{ padding: '8px 12px', textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>证照</th>
                      <th style={{ padding: '8px 12px', textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>维护要点</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr><td style={{ padding: '8px 12px', borderBottom: '1px solid #f1f5f9', fontWeight: 600 }}>行驶证</td><td style={{ padding: '8px 12px', borderBottom: '1px solid #f1f5f9' }}>最多 4 张；OCR 回填；检验有效期至（选月取月末）；沪牌「下次等级评定」；超前感知 Alert</td></tr>
                    <tr><td style={{ padding: '8px 12px', borderBottom: '1px solid #f1f5f9', fontWeight: 600 }}>道路运输证</td><td style={{ padding: '8px 12px', borderBottom: '1px solid #f1f5f9' }}>单图 OCR；证号、核发时间、<strong>证件有效期</strong>、<strong>审验有效期</strong>；超前感知 Alert</td></tr>
                    <tr><td style={{ padding: '8px 12px', borderBottom: '1px solid #f1f5f9' }}>登记证 / 特种设备使用登记证</td><td style={{ padding: '8px 12px', borderBottom: '1px solid #f1f5f9' }}>影像上传为主，无 OCR 字段表单</td></tr>
                    <tr><td style={{ padding: '8px 12px', borderBottom: '1px solid #f1f5f9', fontWeight: 600, color: '#059669' }}>特种设备使用标识</td><td style={{ padding: '8px 12px', borderBottom: '1px solid #f1f5f9' }}>标识照片 + <strong>下次检验日期</strong>；<strong>60 天超前感知 Alert</strong></td></tr>
                    <tr><td style={{ padding: '8px 12px', borderBottom: '1px solid #f1f5f9' }}>加氢卡</td><td style={{ padding: '8px 12px', borderBottom: '1px solid #f1f5f9' }}><strong>只读</strong>：卡号、类型、余额、配发时间、配发人</td></tr>
                    <tr><td style={{ padding: '8px 12px' }}>安全阀 / 压力表</td><td style={{ padding: '8px 12px' }}>影像；本次/下次检验日期（手填，不联动）</td></tr>
                  </tbody>
                </table>
              </div>
            </Tabs.TabPane>

            <Tabs.TabPane tab="🛡️ 安全与交互" key="safety">
              <div style={{ marginTop: 10, fontSize: 12, display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ background: '#fef2f2', padding: '12px 14px', borderRadius: 10, border: '1px solid #fecaca' }}>
                  <strong style={{ color: '#991b1b' }}>车牌 OCR 强校验</strong>
                  <ul style={{ margin: '8px 0 0', paddingLeft: 18, color: '#7f1d1d' }}>
                    <li>仅行驶证、道路运输证；原型含 25% 模拟失败便于测试</li>
                    <li>失败：Modal 报错、阻断写入、移除当次无效图</li>
                  </ul>
                </div>
                <div style={{ background: '#fffbeb', padding: '12px 14px', borderRadius: 10, border: '1px solid #fef3c7' }}>
                  <strong style={{ color: '#b45309' }}>脏数据守卫</strong>
                  <ul style={{ margin: '8px 0 0', paddingLeft: 18, color: '#78350f' }}>
                    <li>任意卡片未保存 → 切换车辆弹窗确认</li>
                    <li>照片增删改、字段变更均标「未保存」</li>
                  </ul>
                </div>
                <div style={{ fontWeight: 700, color: '#0f172a' }}>照片生命周期</div>
                <p style={{ margin: 0, color: '#64748b' }}>上传/追加、查看大图、更换（覆盖）、删除；删空后侧边栏索引变灰「未上传」。</p>
              </div>
            </Tabs.TabPane>

            <Tabs.TabPane tab="✅ 验收标准" key="accept">
              <div style={{ marginTop: 10, fontSize: 12 }}>
                <ul style={{ paddingLeft: 20, margin: 0, lineHeight: 1.75 }}>
                  <li>列表「管理」带入车牌；保存后列表数据一致</li>
                  <li>八类分卡保存、未保存提示、切换车辆拦截</li>
                  <li>行驶证/运输证 OCR 车牌不一致阻断</li>
                  <li>行驶证 90 天、运输证 60 天、<strong>特种设备标识 60 天</strong>维护页 Alert 与索引颜色正确</li>
                  <li>运输证审验有效期字段可维护并回写列表</li>
                  <li>沪牌等级评定区块仅沪牌展示</li>
                  <li>加氢卡只读</li>
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
