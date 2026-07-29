// 【重要】必须使用 const Component 作为组件变量名
// 运维管理 - 车辆业务 - 年审管理 · 办理（分组表单页，逻辑对齐 ONE-OS 小程序）

const { useState, useMemo, useEffect, useRef } = React;
const moment = window.moment || window.dayjs;
const antd = window.antd;
const {
  App,
  Alert,
  Button,
  Col,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Modal,
  Row,
  Select,
  Spin,
  Tag,
  Typography,
  Upload,
  message,
} = antd;
const Image = antd.Image;

const { Text, Paragraph } = Typography;
const TextArea = Input.TextArea;

const AR_DRAFT_STORAGE_KEY = 'oneos_ar_operate_drafts_v1';
const AR_TASK_ID_STORAGE_KEY = 'oneos_ar_operate_task_id';
const AR_TASKS_STORAGE_KEY = 'oneos_ar_web_tasks_v1';
const AR_NAV_TARGET_KEY = 'oneos_ar_navigate_target';
const AR_NAV_EVENT = 'oneos-ar-return-list';
const CERTIFICATE_LICENSE_SYNC_KEY = 'oneos_certificate_license_sync';

/** 办理页保存/提交后返回列表（Axhub 多文件原型：事件 + session 标记） */
const navigateToAnnualReviewList = (toastMsg) => {
  try {
    sessionStorage.setItem(AR_NAV_TARGET_KEY, 'list');
    sessionStorage.removeItem(AR_TASK_ID_STORAGE_KEY);
  } catch {
    /* ignore */
  }
  try {
    window.dispatchEvent(new CustomEvent(AR_NAV_EVENT));
  } catch {
    /* ignore */
  }
  if (typeof window.__axhubNavigate === 'function') {
    window.__axhubNavigate('年审管理');
    if (toastMsg) message.success(toastMsg);
    return;
  }
  if (toastMsg) message.success(toastMsg);
  else message.info('请切换至「年审管理」列表页查看');
};

const INSPECTION_STATION_LIST = ['汇通检测站', '平湖检测站', '嘉兴检测站', '松江检测站'];
const REPAIR_STATION_LIST = [
  '杭州拱墅维修站',
  '广州天河维修站',
  '上海浦东维修站',
  '深圳南山维修站',
  '天津港保税区维修站',
];
const INSPECTION_STATION_STORAGE_KEY = 'annual-review.station.inspection';

const MAX_SERVICE_PHOTOS = 10;
const MAX_LICENSE_PHOTOS = 4;
const LICENSE_OCR_MOCK_MS = 1500;
const MOCK_CURRENT_HANDLER = '张明辉';

const EMPTY_SERVICE_FORM = { station: '', cost: '', remark: '', photos: [] };
const EMPTY_INSPECTION_FORM = { station: '', cost: '', remark: '' };
const EMPTY_LICENSE_FORM = { photos: [], inspectionValidUntil: null, ocrStatus: 'idle' };

const mapOperateStatus = (raw) => {
  if (raw === '可运营' || raw === '待运营') return '库存';
  return raw || '—';
};

const MOCK_TASKS = [
  {
    id: 'ar-1',
    plateNo: '粤B58888F',
    vin: 'LGHXCAE28M6789012',
    brand: '福田',
    model: '奥铃4.5吨冷藏车',
    operateStatusRaw: '租赁',
    expireDate: '2026-07-20',
    daysLeft: 49,
    tab: 'pending',
    province: '广东省',
    city: '深圳市',
    executor: '',
    executeTime: '',
  },
  {
    id: 'ar-2',
    plateNo: '沪A03561F',
    vin: 'LMRKH9AC0R1004086',
    brand: '宇通',
    model: '49吨牵引车头',
    operateStatusRaw: '自营',
    expireDate: '2026-07-31',
    daysLeft: 60,
    tab: 'pending',
    province: '上海市',
    city: '上海市',
    executor: '',
    executeTime: '',
  },
  {
    id: 'ar-3',
    plateNo: '苏E33333',
    vin: 'LSXCH9AE8M1094857',
    brand: '陕汽',
    model: '德龙X3000混动牵引车',
    operateStatusRaw: '可运营',
    expireDate: '2026-05-15',
    daysLeft: -17,
    tab: 'pending',
    province: '江苏省',
    city: '苏州市',
    executor: '',
    executeTime: '',
  },
  {
    id: 'ar-7',
    plateNo: '鲁Q88901',
    vin: 'LZZ5CLSB8NC778899',
    brand: '重汽',
    model: '豪沃T7H牵引车',
    operateStatusRaw: '租赁',
    expireDate: '2026-04-10',
    daysLeft: -52,
    tab: 'pending',
    province: '山东省',
    city: '临沂市',
    executor: '',
    executeTime: '',
  },
  {
    id: 'ar-8',
    plateNo: '闽D55662',
    vin: 'LFWNHXSD8P1122334',
    brand: '金龙',
    model: '凯歌纯电动厢货',
    operateStatusRaw: '自营',
    expireDate: '2026-04-27',
    daysLeft: -35,
    tab: 'pending',
    province: '福建省',
    city: '厦门市',
    executor: '',
    executeTime: '',
  },
  {
    id: 'ar-4',
    plateNo: '浙A88888',
    vin: 'LMRKH9AE2P9876543',
    brand: '宇通',
    model: '氢燃料电池大巴',
    operateStatusRaw: '待运营',
    expireDate: '2026-08-10',
    daysLeft: 70,
    tab: 'pending',
    province: '浙江省',
    city: '杭州市',
    executor: '',
    executeTime: '',
  },
  {
    id: 'ar-6',
    plateNo: '皖B66221',
    vin: 'LZZ5CLSB8NA123456',
    brand: '江淮',
    model: '格尔发A5',
    operateStatusRaw: '库存',
    expireDate: '2026-06-28',
    daysLeft: 27,
    tab: 'pending',
    province: '安徽省',
    city: '合肥市',
    executor: '',
    executeTime: '',
  },
].map((t) => ({
  ...t,
  operateStatus: mapOperateStatus(t.operateStatusRaw),
}));

const isFormCostEmpty = (cost) => cost === '' || cost == null;

const validateStationCost = (form, stationLabel) => {
  if (form?.station && isFormCostEmpty(form.cost)) {
    message.error(`请填写${stationLabel}费用`);
    return false;
  }
  return true;
};

const validateLicenseForm = (licenseForm) => {
  if (!(licenseForm?.photos || []).length) {
    message.error('请上传行驶证照片');
    return false;
  }
  if (!licenseForm?.inspectionValidUntil) {
    message.error('请填写检验有效期');
    return false;
  }
  return true;
};

const formatTaskRegion = (task) => {
  if (!task?.province) return '—';
  if (task.city) return `${task.province}-${task.city}`;
  return task.province;
};

const formatOperateStatusDisplay = (task) => {
  const base = task.operateStatus || '—';
  if (base === '库存' && (task.operateStatusRaw === '可运营' || task.operateStatusRaw === '待运营')) {
    return `库存（${task.operateStatusRaw}）`;
  }
  return base;
};

const readInspectionStationList = () => {
  try {
    const raw = localStorage.getItem(INSPECTION_STATION_STORAGE_KEY);
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length) return parsed;
  } catch {
    /* ignore */
  }
  return [...INSPECTION_STATION_LIST];
};

const loadTasksFromStorage = () => {
  try {
    const raw = localStorage.getItem(AR_TASKS_STORAGE_KEY);
    if (!raw) return MOCK_TASKS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length ? parsed : MOCK_TASKS;
  } catch {
    return MOCK_TASKS;
  }
};

const persistTasksToStorage = (tasks) => {
  try {
    localStorage.setItem(AR_TASKS_STORAGE_KEY, JSON.stringify(tasks));
  } catch {
    /* ignore */
  }
};

const loadOperateDrafts = () => {
  try {
    const raw = localStorage.getItem(AR_DRAFT_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
};

const persistOperateDrafts = (drafts) => {
  try {
    localStorage.setItem(AR_DRAFT_STORAGE_KEY, JSON.stringify(drafts));
  } catch {
    /* ignore */
  }
};

const getUploadPreviewUrl = (file) => {
  if (!file) return '';
  if (file.url) return file.url;
  if (file.thumbUrl) return file.thumbUrl;
  if (file.originFileObj && typeof URL !== 'undefined' && URL.createObjectURL) {
    return URL.createObjectURL(file.originFileObj);
  }
  return '';
};

const serializeUploadFileList = (list) =>
  (list || []).map((f) => ({
    uid: f.uid,
    name: f.name,
    url: getUploadPreviewUrl(f) || '',
    status: f.status || 'done',
  }));

const deserializeUploadFileList = (list) =>
  (list || []).map((f) => ({
    uid: f.uid || `file-${f.name}-${Math.random().toString(36).slice(2, 8)}`,
    name: f.name,
    url: f.url,
    thumbUrl: f.url,
    status: f.status || 'done',
  }));

const syncLicenseToCertificateManagement = (task, licenseForm, operator) => {
  if (!task?.plateNo) return null;
  const photos = serializeUploadFileList(licenseForm?.photos || []);
  const payload = {
    plateNo: task.plateNo,
    vin: task.vin || '',
    inspectionValidUntil: licenseForm?.inspectionValidUntil || '',
    photos,
    photoCount: photos.length,
    operator: operator || MOCK_CURRENT_HANDLER,
    source: 'annual_review',
    syncedAt: new Date().toISOString(),
  };
  try {
    const store = JSON.parse(localStorage.getItem(CERTIFICATE_LICENSE_SYNC_KEY) || '{}');
    store[task.plateNo] = payload;
    localStorage.setItem(CERTIFICATE_LICENSE_SYNC_KEY, JSON.stringify(store));
  } catch {
    /* ignore */
  }
  return payload;
};

const platesMatch = (a, b) => {
  const na = (a || '').replace(/\s/g, '').toUpperCase();
  const nb = (b || '').replace(/\s/g, '').toUpperCase();
  return na.length > 0 && na === nb;
};

const getUploadFileName = (file) =>
  String(file?.name || file?.originFileObj?.name || '').toLowerCase();

/** 模拟单张行驶证 OCR 车牌（文件名含 mismatch / 不一致 可测失败） */
const mockOcrLicensePlateForFile = (task, file) => {
  const name = getUploadFileName(file);
  if (name.includes('mismatch') || name.includes('不一致')) return '粤B00000D';
  return task?.plateNo || '';
};

/** 模拟单张是否识别到检验有效期至（无有效期：文件名含 novalid / 无有效期） */
const mockOcrLicenseValidUntilForFile = (task, file, index) => {
  const name = getUploadFileName(file);
  if (name.includes('novalid') || name.includes('无有效期')) return null;
  const base = task?.expireDate || '2026-07-20';
  if (moment) {
    return moment(base).add(index, 'month').endOf('month').format('YYYY-MM-DD');
  }
  const parts = String(base).split('-');
  const year = Number(parts[0]) || new Date().getFullYear();
  const month = (Number(parts[1]) || 1) + index;
  const day = new Date(year, month, 0).getDate();
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
};

/** 批量 OCR：逐张校验车牌；多张均有有效期时取最后识别的一条 */
const runLicenseOcrResult = (task, photos) => {
  const list = photos || [];
  const expectedPlate = task?.plateNo || '';
  for (let i = 0; i < list.length; i++) {
    const recognizedPlate = mockOcrLicensePlateForFile(task, list[i]);
    if (!platesMatch(recognizedPlate, expectedPlate)) {
      return { ok: false };
    }
  }
  let lastValidUntil = null;
  list.forEach((file, index) => {
    const validUntil = mockOcrLicenseValidUntilForFile(task, file, index);
    if (validUntil) lastValidUntil = validUntil;
  });
  return { ok: true, validUntil: lastValidUntil };
};

const readInitialTaskId = () => {
  try {
    return sessionStorage.getItem(AR_TASK_ID_STORAGE_KEY) || '';
  } catch {
    return '';
  }
};

const PAGE_STYLES = `
.ar-handle{min-height:100vh;background:#f2f3f5;font-family:Inter,Helvetica,PingFang SC,Microsoft YaHei,Arial,sans-serif}
.ar-handle-inner{max-width:1200px;margin:0 auto;padding:16px 24px 96px}
.ar-handle-top{display:flex;justify-content:flex-end;align-items:center;gap:12px;margin-bottom:12px;min-height:32px}
.ar-handle-top-extra{margin-right:auto}
.ar-form-group{background:#fff;border:1px solid #e5e6eb;border-radius:4px;margin-bottom:16px}
.ar-form-group-head{display:flex;align-items:center;justify-content:space-between;padding:14px 20px;border-bottom:1px solid #f2f3f5}
.ar-form-group-title{font-size:14px;font-weight:600;color:#1d2129}
.ar-form-group-body{padding:20px 20px 8px}
.ar-form-group-body .ant-form-item{margin-bottom:20px}
.ar-form-group-body .ant-form-item-label>label{color:#4e5969;font-size:13px}
.ar-form-label-hint{font-size:12px;font-weight:400;color:#86909c;margin-left:8px}
.ar-form-footer{position:fixed;left:0;right:0;bottom:0;z-index:100;background:#fff;border-top:1px solid #e5e6eb;box-shadow:0 -2px 8px rgba(0,0,0,.06)}
.ar-form-footer-inner{max-width:1200px;margin:0 auto;padding:12px 24px;display:flex;justify-content:flex-end;gap:12px}
.ar-ocr-banner{padding:10px 12px;border-radius:4px;font-size:13px;margin-bottom:16px}
.ar-ocr-banner--error{background:#ffece8;border:1px solid #ffccc7;color:#cb2634}
.ar-ocr-banner--done{background:#e8ffea;border:1px solid #aff0b5;color:#009a29}
.ar-ocr-mask{position:fixed;inset:0;z-index:200;background:rgba(29,33,41,.45);display:flex;align-items:center;justify-content:center}
.ar-ocr-mask-panel{background:#fff;border-radius:8px;padding:32px 48px;text-align:center}
.ar-prd-doc{max-height:65vh;overflow-y:auto;font-size:13px;line-height:1.65;color:#4e5969}
.ar-prd-highlight{background:#f0f9ff;border:1px solid #bedaff;border-radius:4px;padding:12px;margin:12px 0}
.ar-prd-h2{font-size:15px;font-weight:600;color:#1d2129;margin:16px 0 8px}
.ar-prd-h3{font-size:14px;font-weight:600;color:#1d2129;margin:12px 0 6px}
.ar-prd-ul{margin:0;padding-left:20px}
.ar-prd-ul li{margin-bottom:6px}
.ar-photo-block{width:100%}
.ar-photo-row{display:flex;align-items:flex-start;gap:12px}
.ar-photo-upload-fixed{flex-shrink:0;width:104px}
.ar-photo-upload-cell{display:block;width:100%}
.ar-photo-upload-cell .ant-upload{display:block;width:100%}
.ar-photo-upload-cell .ant-upload-select{display:block!important;width:100%!important;height:auto!important;margin:0!important;border:none!important;background:transparent!important}
.ar-photo-list-scroll{flex:1;min-width:0;display:flex;flex-wrap:wrap;gap:10px;align-content:flex-start}
.ar-photo-slot{position:relative;width:104px;height:104px;border-radius:8px;box-sizing:border-box;flex-shrink:0}
.ar-photo-slot--add{display:flex;flex-direction:column;align-items:center;justify-content:center;border:1px dashed #c9cdd4;background:#fafafa;color:#86909c;cursor:pointer;gap:2px;transition:border-color .2s,background .2s}
.ar-photo-slot--add:hover{border-color:#165dff;background:#f0f5ff;color:#165dff}
.ar-photo-add-icon{font-size:22px;line-height:1;font-weight:300}
.ar-photo-add-text{font-size:12px;line-height:1.2}
.ar-photo-item{overflow:visible}
.ar-photo-item-thumb{width:100%;height:100%;border-radius:8px;overflow:hidden;border:none;padding:0;background:#f2f3f5;cursor:pointer;display:block}
.ar-photo-item-thumb img{width:100%;height:100%;object-fit:cover;display:block}
.ar-photo-del{position:absolute;top:-6px;right:-6px;z-index:2;width:20px;height:20px;border-radius:50%;border:none;background:rgba(29,33,41,.72);color:#fff;font-size:14px;line-height:1;cursor:pointer;padding:0;display:flex;align-items:center;justify-content:center}
.ar-photo-del:hover{background:#cb2634}
.ar-photo-hint{margin-top:8px;font-size:12px;color:#86909c;line-height:1.4}
.ar-photo-preview-img{max-width:100%;max-height:70vh;object-fit:contain}
`;

/** 照片上传：左固定上传、右照片列表，支持批量（对齐小程序 PhotoUploadBlock） */
const PhotoUploadBlock = ({ fileList, onChange, maxPhotos = MAX_SERVICE_PHOTOS }) => {
  const list = fileList || [];
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const canUpload = list.length < maxPhotos;

  const handleChange = ({ fileList: nextList }) => {
    onChange((nextList || []).slice(0, maxPhotos));
  };

  const handleRemove = (uid, e) => {
    e.stopPropagation();
    e.preventDefault();
    onChange(list.filter((f) => f.uid !== uid));
  };

  const handlePreview = (file) => {
    const url = getUploadPreviewUrl(file);
    if (!url) return;
    if (Image && typeof Image.preview === 'function') {
      Image.preview({ src: url });
      return;
    }
    setPreviewUrl(url);
    setPreviewOpen(true);
  };

  return (
    <div className="ar-photo-block">
      <div className="ar-photo-row">
        <div className="ar-photo-upload-fixed">
          {canUpload ? (
            <Upload
              className="ar-photo-upload-cell"
              showUploadList={false}
              multiple
              accept="image/*"
              fileList={list}
              beforeUpload={() => false}
              onChange={handleChange}
            >
              <div className="ar-photo-slot ar-photo-slot--add" role="button" tabIndex={0}>
                <span className="ar-photo-add-icon">+</span>
                <span className="ar-photo-add-text">上传</span>
              </div>
            </Upload>
          ) : (
            <div
              className="ar-photo-slot ar-photo-slot--add"
              style={{ opacity: 0.45, cursor: 'not-allowed', pointerEvents: 'none' }}
              aria-hidden
            >
              <span className="ar-photo-add-icon">+</span>
              <span className="ar-photo-add-text">已满</span>
            </div>
          )}
        </div>
        <div className="ar-photo-list-scroll">
          {list.map((file) => {
            const url = getUploadPreviewUrl(file);
            return (
              <div key={file.uid} className="ar-photo-slot ar-photo-item">
                <button
                  type="button"
                  className="ar-photo-item-thumb"
                  onClick={() => handlePreview(file)}
                  aria-label="预览照片"
                >
                  {url ? (
                    <img src={url} alt="" />
                  ) : (
                    <span style={{ fontSize: 12, color: '#86909c' }}>图片</span>
                  )}
                </button>
                <button
                  type="button"
                  className="ar-photo-del"
                  aria-label="删除照片"
                  onClick={(e) => handleRemove(file.uid, e)}
                >
                  ×
                </button>
              </div>
            );
          })}
        </div>
      </div>
      <div className="ar-photo-hint">最多上传 {maxPhotos} 张，支持批量选择</div>
      <Modal
        open={previewOpen}
        footer={null}
        onCancel={() => setPreviewOpen(false)}
        centered
        width={720}
        destroyOnClose
        title="照片预览"
      >
        {previewUrl ? <img className="ar-photo-preview-img" src={previewUrl} alt="预览" /> : null}
      </Modal>
    </div>
  );
};

const FormGroup = ({ title, extra, children }) => (
  <section className="ar-form-group">
    <div className="ar-form-group-head">
      <span className="ar-form-group-title">{title}</span>
      {extra}
    </div>
    <div className="ar-form-group-body">{children}</div>
  </section>
);

const Component = function AnnualReviewHandlePage() {
  const [tasks, setTasks] = useState(() => loadTasksFromStorage());
  const [taskId, setTaskId] = useState(() => {
    const saved = readInitialTaskId();
    const pending = loadTasksFromStorage().filter((t) => t.tab === 'pending');
    if (saved && pending.some((t) => t.id === saved)) return saved;
    return pending[0]?.id || '';
  });
  const [prdOpen, setPrdOpen] = useState(false);
  const [inspectionForm, setInspectionForm] = useState({ ...EMPTY_INSPECTION_FORM });
  const [licenseForm, setLicenseForm] = useState({ ...EMPTY_LICENSE_FORM });
  const [m2Expanded, setM2Expanded] = useState(false);
  const [m2Form, setM2Form] = useState({ ...EMPTY_SERVICE_FORM });
  const [zbExpanded, setZbExpanded] = useState(false);
  const [zbForm, setZbForm] = useState({ ...EMPTY_SERVICE_FORM });
  const [operateDrafts, setOperateDrafts] = useState(() => loadOperateDrafts());
  const licenseOcrTimerRef = useRef(null);

  const pendingTasks = useMemo(() => tasks.filter((t) => t.tab === 'pending'), [tasks]);
  const operateTask = useMemo(
    () => pendingTasks.find((t) => t.id === taskId) || pendingTasks[0] || null,
    [pendingTasks, taskId]
  );

  const inspectionStationOptions = useMemo(
    () => readInspectionStationList().map((s) => ({ label: s, value: s })),
    []
  );
  const repairStationOptions = useMemo(() => REPAIR_STATION_LIST.map((s) => ({ label: s, value: s })), []);

  const resetOperateForms = () => {
    if (licenseOcrTimerRef.current) {
      clearTimeout(licenseOcrTimerRef.current);
      licenseOcrTimerRef.current = null;
    }
    setInspectionForm({ ...EMPTY_INSPECTION_FORM });
    setLicenseForm({ ...EMPTY_LICENSE_FORM });
    setM2Expanded(false);
    setM2Form({ ...EMPTY_SERVICE_FORM });
    setZbExpanded(false);
    setZbForm({ ...EMPTY_SERVICE_FORM });
  };

  const applyOperateDraft = (draft) => {
    if (!draft) return;
    setInspectionForm({ ...EMPTY_INSPECTION_FORM, ...draft.inspectionForm });
    const lf = draft.licenseForm || {};
    setLicenseForm({
      ...EMPTY_LICENSE_FORM,
      photos: deserializeUploadFileList(lf.photos),
      inspectionValidUntil: lf.inspectionValidUntil ?? null,
      ocrStatus: lf.ocrStatus === 'recognizing' ? 'idle' : lf.ocrStatus || 'idle',
    });
    setM2Expanded(!!draft.m2Expanded);
    const m2 = draft.m2Form || {};
    setM2Form({ ...EMPTY_SERVICE_FORM, ...m2, photos: deserializeUploadFileList(m2.photos) });
    setZbExpanded(!!draft.zbExpanded);
    const zb = draft.zbForm || {};
    setZbForm({ ...EMPTY_SERVICE_FORM, ...zb, photos: deserializeUploadFileList(zb.photos) });
  };

  const collectOperateDraft = () => ({
    savedAt: new Date().toISOString(),
    inspectionForm: { ...inspectionForm },
    licenseForm: {
      photos: serializeUploadFileList(licenseForm.photos),
      inspectionValidUntil: licenseForm.inspectionValidUntil,
      ocrStatus: licenseForm.ocrStatus === 'recognizing' ? 'idle' : licenseForm.ocrStatus,
    },
    m2Expanded,
    m2Form: { ...m2Form, photos: serializeUploadFileList(m2Form.photos) },
    zbExpanded,
    zbForm: { ...zbForm, photos: serializeUploadFileList(zbForm.photos) },
  });

  const upsertOperateDraft = (id, draft) => {
    const next = { ...operateDrafts, [id]: draft };
    setOperateDrafts(next);
    persistOperateDrafts(next);
  };

  const removeOperateDraft = (id) => {
    if (!operateDrafts[id]) return;
    const next = { ...operateDrafts };
    delete next[id];
    setOperateDrafts(next);
    persistOperateDrafts(next);
  };

  useEffect(() => {
    if (!operateTask) return;
    const draft = operateDrafts[operateTask.id];
    if (draft) applyOperateDraft(draft);
    else resetOperateForms();
  }, [operateTask?.id]);

  const runLicenseOcr = (task, photos) => {
    if (licenseOcrTimerRef.current) clearTimeout(licenseOcrTimerRef.current);
    setLicenseForm((p) => ({ ...p, ocrStatus: 'recognizing', inspectionValidUntil: null }));
    licenseOcrTimerRef.current = setTimeout(() => {
      const result = runLicenseOcrResult(task, photos);
      if (!result.ok) {
        setLicenseForm({ ...EMPTY_LICENSE_FORM });
        message.error('行驶证车牌号不一致，请检查后重新上传');
        licenseOcrTimerRef.current = null;
        return;
      }
      setLicenseForm((p) => ({
        ...p,
        photos: photos || [],
        inspectionValidUntil: result.validUntil,
        ocrStatus: result.validUntil ? 'done' : 'idle',
      }));
      if (result.validUntil) message.success('检验有效期识别完成');
      licenseOcrTimerRef.current = null;
    }, LICENSE_OCR_MOCK_MS);
  };

  const handleLicensePhotosChange = (fileList) => {
    const list = (fileList || []).slice(0, MAX_LICENSE_PHOTOS);
    if (!list.length) {
      if (licenseOcrTimerRef.current) {
        clearTimeout(licenseOcrTimerRef.current);
        licenseOcrTimerRef.current = null;
      }
      setLicenseForm({ ...EMPTY_LICENSE_FORM });
      return;
    }
    setLicenseForm((p) => ({ ...p, photos: list }));
    if (operateTask) runLicenseOcr(operateTask, list);
  };

  const handleReset = () => {
    if (!operateTask) return;
    resetOperateForms();
    message.info('已重置当前表单');
  };

  const handleSave = () => {
    if (!operateTask) return;
    upsertOperateDraft(operateTask.id, collectOperateDraft());
    persistTasksToStorage(tasks);
    navigateToAnnualReviewList('已保存，已返回列表');
  };

  const handleSubmit = () => {
    if (!operateTask) return;
    if (licenseForm.ocrStatus === 'recognizing') {
      message.warning('行驶证识别中，请稍候');
      return;
    }
    if (!validateLicenseForm(licenseForm)) return;
    if (isFormCostEmpty(inspectionForm.cost)) {
      message.error('请填写检测费用');
      return;
    }
    if (!validateStationCost(m2Form, '二保')) return;
    if (!validateStationCost(zbForm, '整备')) return;

    const snapshot = collectOperateDraft();
    const completeTime = moment
      ? moment().format('YYYY-MM-DD HH:mm')
      : new Date().toISOString().slice(0, 16).replace('T', ' ');
    const taskIdCurrent = operateTask.id;

    removeOperateDraft(taskIdCurrent);
    syncLicenseToCertificateManagement(operateTask, licenseForm, MOCK_CURRENT_HANDLER);

    const nextTasks = tasks.map((t) =>
      t.id === taskIdCurrent
        ? {
            ...t,
            tab: 'history',
            executor: MOCK_CURRENT_HANDLER,
            executeTime: completeTime,
            expireDate: licenseForm.inspectionValidUntil || t.expireDate,
            operateSnapshot: snapshot,
          }
        : t
    );
    setTasks(nextTasks);
    persistTasksToStorage(nextTasks);

    navigateToAnnualReviewList(
      '提交成功：新行驶证照片与检验有效期至已全量覆盖至车辆证照，任务已进入历史记录'
    );
  };

  const licenseRecognizing = licenseForm.ocrStatus === 'recognizing';

  const pageInner = (
    <div className="ar-handle">
      <style>{PAGE_STYLES}</style>
      <div className="ar-handle-inner">
        <div className="ar-handle-top">
          {operateTask && operateDrafts[operateTask.id] ? (
            <Tag className="ar-handle-top-extra" color="processing">
              已保存
            </Tag>
          ) : null}
          <Button type="primary" ghost onClick={() => setPrdOpen(true)}>
            需求说明
          </Button>
        </div>

        {!operateTask ? (
          <Alert type="info" showIcon message="暂无待办年审任务，请先在列表页选择待办车辆办理。" />
        ) : (
          <Form layout="vertical" colon={false}>
            <FormGroup title="车辆信息">
              <Row gutter={24}>
                <Col xs={24} md={8}>
                  <Form.Item label="车牌号">
                    <Input value={operateTask.plateNo} disabled />
                  </Form.Item>
                </Col>
                <Col xs={24} md={8}>
                  <Form.Item label="品牌">
                    <Input value={operateTask.brand} disabled />
                  </Form.Item>
                </Col>
                <Col xs={24} md={8}>
                  <Form.Item label="型号">
                    <Input value={operateTask.model} disabled />
                  </Form.Item>
                </Col>
                <Col xs={24} md={8}>
                  <Form.Item label="检验有效期">
                    <Input value={operateTask.expireDate} disabled />
                  </Form.Item>
                </Col>
                <Col xs={24} md={8}>
                  <Form.Item label="运营状态">
                    <Input value={formatOperateStatusDisplay(operateTask)} disabled />
                  </Form.Item>
                </Col>
                <Col xs={24} md={8}>
                  <Form.Item label="运营区域">
                    <Input value={formatTaskRegion(operateTask)} disabled />
                  </Form.Item>
                </Col>
              </Row>
            </FormGroup>

            <FormGroup title="更新行驶证">
              {licenseForm.ocrStatus === 'done' && licenseForm.inspectionValidUntil && (
                <div className="ar-ocr-banner ar-ocr-banner--done">
                  已根据行驶证照片识别检验有效期（精确到月，已自动补全至月末）
                </div>
              )}
              <Row gutter={24}>
                <Col span={24}>
                  <Form.Item
                    required
                    label={
                      <span>
                        行驶证照片
                        <span className="ar-form-label-hint">
                          提交后将自动更新年审照片到车辆证照（支持最多 4 张照片上传）
                        </span>
                      </span>
                    }
                  >
                    <PhotoUploadBlock
                      fileList={licenseForm.photos}
                      onChange={handleLicensePhotosChange}
                      maxPhotos={MAX_LICENSE_PHOTOS}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={8}>
                  <Form.Item label="检验有效期" required>
                    <DatePicker
                      style={{ width: '100%' }}
                      value={
                        licenseForm.inspectionValidUntil && moment
                          ? moment(licenseForm.inspectionValidUntil)
                          : null
                      }
                      onChange={(_, dateStr) =>
                        setLicenseForm((p) => ({ ...p, inspectionValidUntil: dateStr || null }))
                      }
                      disabled={licenseRecognizing}
                      placeholder="上传照片自动识别"
                    />
                  </Form.Item>
                </Col>
              </Row>
            </FormGroup>

            <FormGroup title="检测服务站信息">
              <Row gutter={24}>
                <Col xs={24} md={8}>
                  <Form.Item label="检测服务站">
                    <Select
                      allowClear
                      showSearch
                      placeholder="请选择"
                      options={inspectionStationOptions}
                      value={inspectionForm.station || undefined}
                      onChange={(v) => setInspectionForm((p) => ({ ...p, station: v || '' }))}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={8}>
                  <Form.Item label="费用（元）" required>
                    <InputNumber
                      style={{ width: '100%' }}
                      min={0}
                      precision={2}
                      placeholder="请输入费用"
                      addonAfter="元"
                      value={inspectionForm.cost === '' ? null : Number(inspectionForm.cost)}
                      onChange={(v) =>
                        setInspectionForm((p) => ({ ...p, cost: v == null ? '' : String(v) }))
                      }
                    />
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item label="备注">
                    <TextArea
                      rows={3}
                      placeholder="请输入检测备注信息"
                      maxLength={200}
                      showCount
                      value={inspectionForm.remark}
                      onChange={(e) => setInspectionForm((p) => ({ ...p, remark: e.target.value }))}
                    />
                  </Form.Item>
                </Col>
              </Row>
            </FormGroup>

            {!m2Expanded ? (
              <Button type="dashed" block style={{ marginBottom: 16 }} onClick={() => setM2Expanded(true)}>
                + 添加二保信息
              </Button>
            ) : (
              <FormGroup
                title="二保信息"
                extra={
                  <Button type="link" size="small" onClick={() => setM2Expanded(false)}>
                    收起
                  </Button>
                }
              >
                <Row gutter={24}>
                  <Col xs={24} md={8}>
                    <Form.Item label="二保服务站">
                      <Select
                        allowClear
                        showSearch
                        placeholder="请选择"
                        options={inspectionStationOptions}
                        value={m2Form.station || undefined}
                        onChange={(v) => setM2Form((p) => ({ ...p, station: v || '' }))}
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={8}>
                    <Form.Item label="费用（元）" required={!!m2Form.station}>
                      <InputNumber
                        style={{ width: '100%' }}
                        min={0}
                        precision={2}
                        addonAfter="元"
                        placeholder={m2Form.station ? '必填' : '请输入'}
                        value={m2Form.cost === '' ? null : Number(m2Form.cost)}
                        onChange={(v) => setM2Form((p) => ({ ...p, cost: v == null ? '' : String(v) }))}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={24}>
                    <Form.Item label="备注">
                      <TextArea
                        rows={3}
                        placeholder="请输入二保备注信息"
                        value={m2Form.remark}
                        onChange={(e) => setM2Form((p) => ({ ...p, remark: e.target.value }))}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={24}>
                    <Form.Item label="二保照片">
                      <PhotoUploadBlock
                        fileList={m2Form.photos}
                        onChange={(fl) => setM2Form((p) => ({ ...p, photos: fl }))}
                        maxPhotos={MAX_SERVICE_PHOTOS}
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </FormGroup>
            )}

            {!zbExpanded ? (
              <Button type="dashed" block style={{ marginBottom: 16 }} onClick={() => setZbExpanded(true)}>
                + 添加整备服务站信息
              </Button>
            ) : (
              <FormGroup
                title="整备服务站信息"
                extra={
                  <Button type="link" size="small" onClick={() => setZbExpanded(false)}>
                    收起
                  </Button>
                }
              >
                <Row gutter={24}>
                  <Col xs={24} md={8}>
                    <Form.Item label="整备服务站">
                      <Select
                        allowClear
                        showSearch
                        placeholder="请选择"
                        options={repairStationOptions}
                        value={zbForm.station || undefined}
                        onChange={(v) => setZbForm((p) => ({ ...p, station: v || '' }))}
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={8}>
                    <Form.Item label="费用（元）" required={!!zbForm.station}>
                      <InputNumber
                        style={{ width: '100%' }}
                        min={0}
                        precision={2}
                        addonAfter="元"
                        placeholder={zbForm.station ? '必填' : '请输入'}
                        value={zbForm.cost === '' ? null : Number(zbForm.cost)}
                        onChange={(v) => setZbForm((p) => ({ ...p, cost: v == null ? '' : String(v) }))}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={24}>
                    <Form.Item label="备注">
                      <TextArea
                        rows={3}
                        placeholder="请输入整备备注信息"
                        value={zbForm.remark}
                        onChange={(e) => setZbForm((p) => ({ ...p, remark: e.target.value }))}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={24}>
                    <Form.Item label="整备照片">
                      <PhotoUploadBlock
                        fileList={zbForm.photos}
                        onChange={(fl) => setZbForm((p) => ({ ...p, photos: fl }))}
                        maxPhotos={MAX_SERVICE_PHOTOS}
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </FormGroup>
            )}
          </Form>
        )}
      </div>

      <div className="ar-form-footer">
        <div className="ar-form-footer-inner">
          <Button size="large" onClick={handleReset} disabled={!operateTask || licenseRecognizing}>
            重置
          </Button>
          <Button size="large" onClick={handleSave} disabled={!operateTask || licenseRecognizing}>
            保存
          </Button>
          <Button
            type="primary"
            size="large"
            onClick={handleSubmit}
            disabled={!operateTask || licenseRecognizing}
          >
            提交
          </Button>
        </div>
      </div>

      {licenseRecognizing && (
        <div className="ar-ocr-mask" role="alertdialog" aria-busy="true" aria-label="行驶证识别中">
          <div className="ar-ocr-mask-panel">
            <Spin size="large" />
            <div style={{ marginTop: 16, fontWeight: 600 }}>识别中</div>
            <Text type="secondary" style={{ display: 'block', marginTop: 8 }}>
              正在识别行驶证信息，请稍候
            </Text>
          </div>
        </div>
      )}

      <Modal
        title="年审办理 · 产品需求说明（PRD）"
        open={prdOpen}
        onCancel={() => setPrdOpen(false)}
        footer={[
          <Button key="ok" type="primary" onClick={() => setPrdOpen(false)}>
            我已了解
          </Button>,
        ]}
        width={800}
        destroyOnClose
      >
        <div className="ar-prd-doc">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
            <Tag>模块：运维管理 &gt; 车辆业务 &gt; 年审管理-办理</Tag>
            <Tag>文档版本：V1.0</Tag>
            <Tag>适用角色：产品经理 / 运维办理人 / 研发测试</Tag>
          </div>
          <div className="ar-prd-highlight">
            <Text strong>产品目标</Text>
            <Paragraph style={{ margin: '8px 0 0' }}>
              在 Web 端以分组表单完成单车年审现场办理：更新行驶证影像与检验有效期、登记检测站费用，可选录入二保/整备；提交后与列表、车辆证照台账联动。
            </Paragraph>
          </div>
          <div className="ar-prd-h2">一、页面结构</div>
          <ul className="ar-prd-ul">
            <li>右上「需求说明」：打开本文档。</li>
            <li>分组：车辆信息（只读）→ 更新行驶证 → 检测服务站 → 可选二保/整备。</li>
            <li>底部操作：重置、保存、提交（固定底栏）。</li>
          </ul>
          <div className="ar-prd-h2">二、保存 vs 提交（核心差异）</div>
          <ul className="ar-prd-ul">
            <li>
              <Text strong>保存：</Text>不校验任何必填项；将当前已填内容写入本地草稿；保存成功后
              <Text strong>自动返回年审管理列表</Text>；对应待办行车牌号后展示标签「已保存」。
            </li>
            <li>
              <Text strong>提交：</Text>校验必填项（见第三节）；通过后任务进入历史记录，并
              <Text strong>全量覆盖</Text>车辆证照中该车的行驶证照片（最多 4 张）与「检验有效期至」；成功后返回列表。
            </li>
            <li>保存不同步证照台账；仅提交触发证照全量覆盖。</li>
          </ul>
          <div className="ar-prd-h2">三、提交必填与联动校验</div>
          <ul className="ar-prd-ul">
            <li>行驶证照片：至少 1 张，最多 4 张，支持批量上传；左上传、右缩略图。</li>
            <li>检验有效期至：必填（可 OCR 自动带出或手工选择）。</li>
            <li>检测服务站费用：必填。</li>
            <li>二保/整备：若已选服务站，则对应费用必填。</li>
            <li>OCR 进行中不可提交；车牌不一致时清空照片并提示，需重新上传。</li>
          </ul>
          <div className="ar-prd-h2">四、行驶证 OCR（原型）</div>
          <ul className="ar-prd-ul">
            <li>上传后逐张识别车牌；任一张与待办车牌不一致 → 清空全部照片、不写入有效期、Toast：行驶证车牌号不一致，请检查后重新上传。</li>
            <li>多张均识别到「检验有效期至」时，取按上传顺序 <Text strong>最后一条</Text> 有效结果写入表单。</li>
            <li>提交成功后，以表单最终值全量覆盖证照，非增量 patch。</li>
          </ul>
          <div className="ar-prd-h2">五、照片交互</div>
          <ul className="ar-prd-ul">
            <li>点击缩略图：全屏放大预览。</li>
            <li>点击右上角删除：仅删除该张，不触发预览。</li>
          </ul>
          <div className="ar-prd-h2">六、入口与返回</div>
          <Paragraph style={{ margin: 0 }}>
            由列表待办点击「办理」进入，通过 session 带入任务；保存/提交后返回列表，列表刷新草稿标签与任务状态。
          </Paragraph>
        </div>
      </Modal>
    </div>
  );

  return App ? <App>{pageInner}</App> : pageInner;
};

if (typeof window !== 'undefined') {
  window.Component = Component;
}

export default Component;
