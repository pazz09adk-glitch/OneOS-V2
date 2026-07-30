import React, { useState } from 'react';
import {
  Save,
  Send,
  AlertTriangle,
  Plus,
  Trash2,
  CheckCircle2,
  FileText,
  Building,
  User,
  Copy,
} from 'lucide-react';
import {
  V2Button,
  V2Select,
  V2Switch,
  V2CheckboxGroup,
  V2DatePicker,
} from '../../../resources/design-system/components/UIComponents';
import type { AuthorizedDelegate, LeaseContractRecord, VehicleItem } from '../types';

/**
 * layout: sidebar
 * 租赁合同新增/编辑 · 交付级全页（对齐 requirements-prd-create + KB lease-contract-management）
 * 仓库缺 contract-template-management / antd，故用 V2 控件重作可提交主干；非演示壳。
 */

type CredentialTone = 'ok' | 'warn' | 'expired';

interface CustomerOption {
  value: string;
  label: string;
  risk: 'A' | 'B' | 'C';
  selectable: boolean;
  credentials: { name: string; tone: CredentialTone; expiry: string }[];
  archive: {
    company: string;
    bank: string;
    account: string;
    taxNo: string;
    address: string;
    phone: string;
    contact: string;
    email: string;
  };
}

interface LessorOption {
  value: string;
  label: string;
  archive: {
    accountName: string;
    bank: string;
    account: string;
    address: string;
    contact: string;
    phone: string;
    email: string;
  };
}

interface OrderRow {
  id: string;
  brand: string;
  model: string;
  plateNo: string;
  leaseMonths: number;
  rent: number;
  deposit: number;
  serviceFee: number;
}

interface ContractFormDrawerProps {
  open: boolean;
  onClose: () => void;
  record?: LeaseContractRecord | null;
  onSave: (contract: Partial<LeaseContractRecord>, status: 'draft' | 'submitted') => void;
  isDark: boolean;
}

const LESSORS: LessorOption[] = [
  {
    value: '羚牛氢能(浙江)供应链管理有限公司',
    label: '羚牛氢能(浙江)供应链管理有限公司',
    archive: {
      accountName: '羚牛氢能(浙江)供应链管理有限公司',
      bank: '招商银行杭州分行营业部',
      account: '5719 **** **** 8891',
      address: '浙江省杭州市余杭区xxx路 88 号',
      contact: '张财务',
      phone: '0571-88886666',
      email: 'lessor-zj@lingniu.example',
    },
  },
  {
    value: '上海羚牛氢能科技有限公司',
    label: '上海羚牛氢能科技有限公司',
    archive: {
      accountName: '上海羚牛氢能科技有限公司',
      bank: '工商银行上海分行陆家嘴支行',
      account: '1001 **** **** 2208',
      address: '上海市浦东新区世纪大道 1 号',
      contact: '李结算',
      phone: '021-58886666',
      email: 'lessor-sh@lingniu.example',
    },
  },
];

const CUSTOMERS: CustomerOption[] = [
  {
    value: '杭州嘉氢物流有限公司',
    label: '杭州嘉氢物流有限公司（B · 可选）',
    risk: 'B',
    selectable: true,
    credentials: [
      { name: '营业执照', tone: 'ok', expiry: '2030-12-31' },
      { name: '法人身份证正面', tone: 'ok', expiry: '2032-01-01' },
      { name: '法人身份证反面', tone: 'ok', expiry: '2032-01-01' },
      { name: '道路运输许可证', tone: 'ok', expiry: '2028-06-30' },
    ],
    archive: {
      company: '杭州嘉氢物流有限公司',
      bank: '中国银行杭州高新支行',
      account: '3570 **** **** 1102',
      taxNo: '91330100MA2XXXXX1A',
      address: '杭州市余杭区仓前街道某某路 12 号',
      phone: '0571-99998888',
      contact: '陈采购',
      email: 'chen@jiaqing.example',
    },
  },
  {
    value: '宁波港通冷链物流有限公司',
    label: '宁波港通冷链物流有限公司（B · 资质预警）',
    risk: 'B',
    selectable: true,
    credentials: [
      { name: '营业执照', tone: 'ok', expiry: '2029-08-01' },
      { name: '法人身份证正面', tone: 'ok', expiry: '2031-03-15' },
      { name: '法人身份证反面', tone: 'ok', expiry: '2031-03-15' },
      { name: '道路运输许可证', tone: 'warn', expiry: '2026-09-30' },
    ],
    archive: {
      company: '宁波港通冷链物流有限公司',
      bank: '宁波银行鄞州支行',
      account: '7001 **** **** 6688',
      taxNo: '91330200MA2YYYYY2B',
      address: '宁波市鄞州区中河街道冷链物流园 A 区',
      phone: '0574-88887777',
      contact: '周调度',
      email: 'zhou@gangtong.example',
    },
  },
  {
    value: '杭州某某租赁有限公司',
    label: '杭州某某租赁有限公司（B · 证照过期 · 拦截提交）',
    risk: 'B',
    selectable: true,
    credentials: [
      { name: '营业执照', tone: 'ok', expiry: '2028-01-01' },
      { name: '法人身份证正面', tone: 'warn', expiry: '2026-08-20' },
      { name: '法人身份证反面', tone: 'warn', expiry: '2026-08-20' },
      { name: '道路运输许可证', tone: 'expired', expiry: '2025-12-31' },
    ],
    archive: {
      company: '杭州某某租赁有限公司',
      bank: '建设银行杭州城东支行',
      account: '3300 **** **** 9910',
      taxNo: '91330100MA2ZZZZZ3C',
      address: '杭州市上城区望江东路 66 号',
      phone: '0571-66665555',
      contact: '王经理',
      email: 'wang@moumou.example',
    },
  },
];

const BRAND_MODELS: { brand: string; model: string; minRent: number }[] = [
  { brand: '羚牛氢能', model: '49T 氢能重卡 (示范版)', minRent: 12000 },
  { brand: '羚牛氢能', model: '18T 厢式氢能卡车', minRent: 8000 },
  { brand: '现代', model: '18T 正式合同车型', minRent: 9000 },
];

const TEMPLATE_OPTIONS = [
  { value: 'formal', label: '正式租赁合同模板' },
  { value: 'trial', label: '试用合同模板' },
  { value: 'heavy_18t', label: '现代18吨正式合同模板' },
];

const STANDARD_DOC: Record<string, string> = {
  formal: '2026年标准商用车租赁合同',
  trial: '2026年试用车辆租赁合同',
  heavy_18t: '2026年现代18吨正式租赁合同',
};

function emptyOrderRow(): OrderRow {
  return {
    id: `lo-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    brand: '羚牛氢能',
    model: '49T 氢能重卡 (示范版)',
    plateNo: '交车时确认',
    leaseMonths: 12,
    rent: 12000,
    deposit: 50000,
    serviceFee: 0,
  };
}

function credentialToneColor(tone: CredentialTone) {
  if (tone === 'ok') return '#10b981';
  if (tone === 'warn') return '#d97706';
  return '#ef4444';
}

function credentialToneLabel(tone: CredentialTone) {
  if (tone === 'ok') return '有效';
  if (tone === 'warn') return '即将到期';
  return '已过期';
}

function CompletenessBadge({ done }: { done: boolean }) {
  return (
    <span
      style={{
        fontSize: 11,
        fontWeight: 700,
        padding: '2px 8px',
        borderRadius: 999,
        background: done ? 'rgba(16,185,129,0.12)' : 'rgba(148,163,184,0.18)',
        color: done ? '#10b981' : '#64748b',
      }}
    >
      {done ? '已完成' : '待完善'}
    </span>
  );
}

export function ContractFormDrawer({
  open,
  onClose,
  record,
  onSave,
  isDark,
}: ContractFormDrawerProps) {
  const [code] = useState(
    record?.code || `HT-ZL-2026-${Math.floor(100 + Math.random() * 900)}`,
  );
  const [templateCategory, setTemplateCategory] = useState<string>(
    record?.contractTemplateCategory || 'formal',
  );
  const [signingMethod, setSigningMethod] = useState<'online_esign' | 'offline_stamp'>(
    record?.signingMethod || 'online_esign',
  );
  const [sealTypes, setSealTypes] = useState<string[]>(['contract']);
  const [projectName, setProjectName] = useState(record?.projectName || '');
  const [customerName, setCustomerName] = useState(record?.customerName || '杭州嘉氢物流有限公司');
  const [signingCompany, setSigningCompany] = useState(
    record?.signingCompany || '羚牛氢能(浙江)供应链管理有限公司',
  );
  const [principalName, setPrincipalName] = useState('陈采购');
  const [principalPhone, setPrincipalPhone] = useState('13800001111');

  const [hasMinMileage, setHasMinMileage] = useState(record?.hasMinimumMileage ?? true);
  const [mileagePeriod, setMileagePeriod] = useState(record?.mileagePeriod || 'year');
  const [targetMileageKm, setTargetMileageKm] = useState(record?.mileageTargetKm || 50000);
  const [mileageTypes, setMileageTypes] = useState<string[]>(['actual', 'odometer']);

  const [paymentPeriod, setPaymentPeriod] = useState(record?.paymentPeriod || '月付');
  const [h2PaymentMethod, setH2PaymentMethod] = useState<'self' | 'prepaid' | 'monthly'>(
    record?.h2PaymentMethod || 'prepaid',
  );
  const [prepayAmount, setPrepayAmount] = useState(50000);
  const [payAheadDays, setPayAheadDays] = useState(5);
  const [returnH2Price, setReturnH2Price] = useState(8.5);
  const [depositAmount, setDepositAmount] = useState(record?.depositAmount || 50000);

  const [thirdPartyLiability, setThirdPartyLiability] = useState(2);
  const [deliveryRegion, setDeliveryRegion] = useState(record?.deliveryRegion || '浙江省·嘉兴市');
  const [deliveryDate, setDeliveryDate] = useState('2026-08-01');
  const [orderRows, setOrderRows] = useState<OrderRow[]>(() => {
    if (record?.vehicles?.length) {
      return record.vehicles.map((v, i) => ({
        id: v.id || `lo-${i}`,
        brand: v.brand,
        model: v.model,
        plateNo: v.plateNo || '交车时确认',
        leaseMonths: 12,
        rent: record.monthlyRentPerVehicle || 12000,
        deposit: Math.round((record.depositAmount || 50000) / Math.max(record.vehicles.length, 1)),
        serviceFee: 0,
      }));
    }
    return [emptyOrderRow()];
  });

  const [delegates, setDelegates] = useState<AuthorizedDelegate[]>(
    record?.delegates?.length
      ? record.delegates
      : [{ id: '1', name: '王强', phone: '13812345678', idCard: '330106198801011234' }],
  );
  const [remarks, setRemarks] = useState(record?.remarks || '');
  const [forceExpiredDemo, setForceExpiredDemo] = useState(false);

  const bg = isDark ? '#0a0b0d' : '#f6f9fc';
  const surface = isDark ? '#121418' : '#ffffff';
  const border = isDark ? '#23272f' : '#e3e8ee';
  const textPrimary = isDark ? '#f7fafc' : '#0a2540';
  const textSecondary = isDark ? '#a0aec0' : '#425466';
  const accent = 'var(--oneos-primary, var(--ln-primary, #533afd))';
  const accentSoft = isDark
    ? 'color-mix(in srgb, var(--oneos-primary, #533afd) 20%, transparent)'
    : 'var(--ln-primary-soft, #e0e7ff)';

  const customer = CUSTOMERS.find((c) => c.value === customerName) || CUSTOMERS[0];
  const lessor = LESSORS.find((l) => l.value === signingCompany) || LESSORS[0];

  const credentials = forceExpiredDemo
    ? customer.credentials.map((c) =>
        c.name.includes('道路运输') ? { ...c, tone: 'expired' as const, expiry: '2025-01-01' } : c,
      )
    : customer.credentials;

  if (!open) return null;

  const hasExpired = credentials.some((c) => c.tone === 'expired');
  const hasWarn = credentials.some((c) => c.tone === 'warn');

  const rentBelowMin = orderRows.some((row) => {
    const cat = BRAND_MODELS.find((b) => b.brand === row.brand && b.model === row.model);
    return cat ? row.rent < cat.minRent : false;
  });
  const nonStandardSeal = sealTypes.some((s) => s === 'official' || s === 'legal_person');
  const approvalType: 'standard' | 'non_standard' =
    rentBelowMin || nonStandardSeal ? 'non_standard' : 'standard';

  const signingDone = Boolean(projectName.trim() && signingCompany && customerName && principalPhone);
  const mileageDone = !hasMinMileage || (Boolean(mileagePeriod) && targetMileageKm > 0 && mileageTypes.length > 0);
  const feeDone =
    Boolean(paymentPeriod) &&
    Boolean(h2PaymentMethod) &&
    returnH2Price >= 0 &&
    (h2PaymentMethod !== 'prepaid' || (prepayAmount > 0 && payAheadDays > 0));
  const orderDone = thirdPartyLiability > 0 && orderRows.length > 0 && orderRows.every((r) => r.rent > 0 && r.brand && r.model);
  const poaDone = delegates.length > 0 && delegates.every((d) => d.name && d.phone && d.idCard);
  const sealDone = sealTypes.length > 0;

  const orderKpi = {
    qty: orderRows.length,
    rent: orderRows.reduce((s, r) => s + r.rent, 0),
    deposit: orderRows.reduce((s, r) => s + r.deposit, 0),
    service: orderRows.reduce((s, r) => s + r.serviceFee, 0),
  };

  const inputStyle: React.CSSProperties = {
    background: surface,
    border: `1px solid ${border}`,
    borderRadius: 8,
    height: 36,
    minHeight: 36,
    padding: '0 12px',
    fontSize: 12,
    lineHeight: '34px',
    color: textPrimary,
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 12,
    fontWeight: 600,
    color: textSecondary,
    marginBottom: 6,
    display: 'block',
  };

  const cardStyle: React.CSSProperties = {
    background: surface,
    border: `1px solid ${border}`,
    borderRadius: 12,
    padding: 20,
  };

  const sectionHead = (title: string, icon: React.ReactNode, done: boolean) => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, gap: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
        <span style={{ color: accent, display: 'inline-flex' }}>{icon}</span>
        <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0, color: textPrimary }}>{title}</h3>
      </div>
      <CompletenessBadge done={done} />
    </div>
  );

  const archiveBox = (title: string, rows: [string, string][]) => (
    <div
      style={{
        marginTop: 12,
        padding: 12,
        borderRadius: 8,
        border: `1px solid ${border}`,
        background: isDark ? '#1a1d24' : '#f8fafc',
        fontSize: 12,
        color: textSecondary,
      }}
    >
      <div style={{ fontWeight: 700, color: textPrimary, marginBottom: 8 }}>{title}</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '6px 16px' }}>
        {rows.map(([k, v]) => (
          <div key={k}>
            <span style={{ color: textSecondary }}>{k}：</span>
            <strong style={{ color: textPrimary, fontWeight: 600 }}>{v}</strong>
          </div>
        ))}
      </div>
    </div>
  );

  const updateRow = (id: string, patch: Partial<OrderRow>) => {
    setOrderRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  };

  const handleSubmit = (submitStatus: 'draft' | 'submitted') => {
    if (submitStatus === 'submitted') {
      if (hasExpired) {
        alert(
          `拦截：客户「${customerName}」存在已过期资质证照，业管更新前禁止提交新合同。\n请先完成证照更新，或切换客户。`,
        );
        return;
      }
      if (!signingDone || !mileageDone || !feeDone || !orderDone || !poaDone || !sealDone) {
        alert('请完善必填项后再提交：签约双方、里程、费用、租赁订单、授权委托书、用章类型。');
        return;
      }
      if (!/^1\d{10}$/.test(principalPhone.trim())) {
        alert('乙方负责人手机号须为 11 位手机号。');
        return;
      }
    }

    const vehicles: VehicleItem[] = orderRows.map((r, i) => ({
      id: `v-new-${i}`,
      plateNo: r.plateNo === '交车时确认' ? `浙A${String(88880 + i).padStart(5, '0')}F` : r.plateNo.replace(/·/g, ''),
      vin: `LFNDEMO${String(202600100 + i)}`,
      brand: r.brand,
      model: r.model,
      vehicleType: '商用车',
      pickupReceivableStatus: 'none',
      delivered: false,
      leaseBillStatus: 'none',
      returned: false,
      mileageTargetKm: hasMinMileage ? targetMileageKm : undefined,
      deliveryRegion,
      plannedDeliveryDate: deliveryDate,
    }));

    onSave(
      {
        id: record?.id || `lc-${Date.now()}`,
        code,
        projectName: projectName.trim() || '新建重卡租赁项目',
        customerName,
        lesseeCompany: `${customerName} (${customer.risk}级客户)`,
        signingCompany,
        contractTemplateCategory: templateCategory as LeaseContractRecord['contractTemplateCategory'],
        contractTemplateName: TEMPLATE_OPTIONS.find((t) => t.value === templateCategory)?.label || '正式租赁合同模板',
        standardContractName: STANDARD_DOC[templateCategory] || STANDARD_DOC.formal,
        approvalType,
        approvalStatus: submitStatus === 'submitted' ? 'pending' : 'unsubmitted',
        contractStatus: submitStatus === 'submitted' ? 'submitted' : 'draft',
        currentApprover: submitStatus === 'submitted' ? '李合规 (风控初审)' : undefined,
        signingMethod,
        businessDept: '华东业务一部',
        businessOwner: '陈业务',
        creator: '当前用户',
        createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
        updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
        endDate: '2028-06-30',
        totalVehicles: vehicles.length,
        deliveredVehiclesCount: 0,
        returnedVehiclesCount: 0,
        paymentPeriod,
        h2PaymentMethod,
        depositAmount: orderKpi.deposit || depositAmount,
        monthlyRentPerVehicle: orderRows[0]?.rent || 12000,
        deliveryRegion,
        deliveryDatePlan: deliveryDate,
        hasMinimumMileage: hasMinMileage,
        mileagePeriod: hasMinMileage ? (mileagePeriod as 'month' | 'quarter' | 'year') : undefined,
        mileageTargetKm: hasMinMileage ? targetMileageKm : undefined,
        delegates,
        extraFees: [],
        tripartiteAgreements: [],
        vehicles,
        remarks,
      },
      submitStatus,
    );
  };

  return (
    <div
      data-ds-mode={isDark ? 'dark' : 'light'}
      data-oneos-theme={isDark ? 'dark' : 'light'}
      data-annotation-id="lc-create-main-contract"
      style={{
        background: bg,
        color: textPrimary,
        minHeight: '100vh',
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "PingFang SC", "Microsoft YaHei", sans-serif',
        padding: '24px 32px',
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 20,
          gap: 16,
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
          <V2Button variant="back" size="md" onClick={onClose}>
            返回台账
          </V2Button>
          <div style={{ height: 16, width: 1, background: border, flexShrink: 0 }} />
          <div style={{ minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <h1 style={{ fontSize: 20, fontWeight: 800, margin: 0, lineHeight: 1.3 }}>
                {record ? '编辑租赁合同' : '新增租赁合同'}
              </h1>
              <span
                style={{
                  fontSize: 11,
                  fontFamily: "var(--ln-font-mono, 'JetBrains Mono', monospace)",
                  fontWeight: 700,
                  color: accent,
                  background: accentSoft,
                  padding: '2px 8px',
                  borderRadius: 4,
                }}
              >
                {code}
              </span>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: approvalType === 'standard' ? '#10b981' : '#d97706',
                  background:
                    approvalType === 'standard' ? 'rgba(16,185,129,0.12)' : 'rgba(217,119,6,0.12)',
                  padding: '2px 8px',
                  borderRadius: 4,
                }}
              >
                {approvalType === 'standard' ? '标准合同审批' : '非标准合同审批'}
              </span>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
          <V2Button variant="secondary" size="md" icon={<Save size={15} />} onClick={() => handleSubmit('draft')}>
            保存草稿
          </V2Button>
          <V2Button variant="primary" size="md" icon={<Send size={15} />} onClick={() => handleSubmit('submitted')}>
            提交审核
          </V2Button>
        </div>
      </div>

      <div
        style={{
          flex: 1,
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) minmax(300px, 400px)',
          gap: 16,
          alignItems: 'start',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, minWidth: 0 }}>
          {/* 0 模板与签署 */}
          <div style={cardStyle} data-annotation-id="lc-create-signing-method">
            {sectionHead('0. 合同模板与签署闭环', <FileText size={16} />, Boolean(templateCategory) && sealDone)}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
              <div>
                <label style={labelStyle}>合同模板 *</label>
                <V2Select
                  value={templateCategory}
                  onChange={setTemplateCategory}
                  options={TEMPLATE_OPTIONS}
                  allowClear={false}
                />
              </div>
              <div>
                <label style={labelStyle}>标准合同名称</label>
                <div style={{ ...inputStyle, display: 'flex', alignItems: 'center', color: textSecondary }}>
                  {STANDARD_DOC[templateCategory]}
                </div>
              </div>
              <div>
                <label style={labelStyle}>签署方式 *</label>
                <V2Select
                  value={signingMethod}
                  onChange={(v) => setSigningMethod(v as 'online_esign' | 'offline_stamp')}
                  allowClear={false}
                  options={[
                    { value: 'online_esign', label: '线上电子签章（E签宝）' },
                    { value: 'offline_stamp', label: '线下人工上传盖章件' },
                  ]}
                />
              </div>
              <div>
                <label style={labelStyle}>用章类型 *（多选；加公章/法人章走非标）</label>
                <V2CheckboxGroup
                  value={sealTypes}
                  onChange={(v) => setSealTypes(v.length ? v : ['contract'])}
                  options={[
                    { value: 'contract', label: '合同章' },
                    { value: 'official', label: '公章' },
                    { value: 'legal_person', label: '法人章' },
                  ]}
                />
              </div>
            </div>
          </div>

          {/* 1 签约 */}
          <div style={cardStyle}>
            {sectionHead('1. 签约双方主体信息', <Building size={16} />, signingDone && !hasExpired)}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
              <div>
                <label style={labelStyle}>项目名称 *</label>
                <input
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="请输入项目名称"
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>合同编号 *</label>
                <div style={{ ...inputStyle, display: 'flex', alignItems: 'center', fontFamily: 'monospace', fontWeight: 700 }}>
                  {code}
                </div>
              </div>
              <div>
                <label style={labelStyle}>出租方（甲方）*</label>
                <V2Select
                  value={signingCompany}
                  onChange={setSigningCompany}
                  allowClear={false}
                  options={LESSORS.map((l) => ({ value: l.value, label: l.label }))}
                />
              </div>
              <div>
                <label style={labelStyle}>承租方（乙方 · 仅 A/B 可选）*</label>
                <V2Select
                  value={customerName}
                  onChange={setCustomerName}
                  allowClear={false}
                  options={CUSTOMERS.filter((c) => c.selectable).map((c) => ({
                    value: c.value,
                    label: c.label,
                  }))}
                />
              </div>
              <div>
                <label style={labelStyle}>乙方负责人姓名</label>
                <input value={principalName} onChange={(e) => setPrincipalName(e.target.value)} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>乙方负责人手机号</label>
                <input
                  value={principalPhone}
                  onChange={(e) => setPrincipalPhone(e.target.value)}
                  placeholder="E签宝对接手机号"
                  style={inputStyle}
                />
              </div>
            </div>

            {archiveBox('甲方档案（只读带出）', [
              ['户名', lessor.archive.accountName],
              ['开户行', lessor.archive.bank],
              ['账号', lessor.archive.account],
              ['通讯地址', lessor.archive.address],
              ['联系人', lessor.archive.contact],
              ['电话', lessor.archive.phone],
              ['邮箱', lessor.archive.email],
              ['—', '—'],
            ])}
            {archiveBox('乙方档案（只读带出）', [
              ['企业名称', customer.archive.company],
              ['开户银行', customer.archive.bank],
              ['银行账号', customer.archive.account],
              ['纳税人识别号', customer.archive.taxNo],
              ['企业地址', customer.archive.address],
              ['企业电话', customer.archive.phone],
              ['联系人', customer.archive.contact],
              ['邮箱', customer.archive.email],
            ])}

            <div style={{ marginTop: 14 }} data-annotation-id="lc-credentials-ocr">
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, marginBottom: 8 }}>
                <label style={{ ...labelStyle, marginBottom: 0 }}>客户资质证照 OCR 校验</label>
                <button
                  type="button"
                  onClick={() => setForceExpiredDemo((v) => !v)}
                  style={{
                    border: 'none',
                    background: 'transparent',
                    color: accent,
                    fontSize: 11,
                    cursor: 'pointer',
                    textDecoration: 'underline',
                  }}
                >
                  {forceExpiredDemo ? '恢复客户真实证照态' : '切换过期拦截演示'}
                </button>
              </div>
              <div
                style={{
                  padding: '10px 12px',
                  borderRadius: 8,
                  border: `1px solid ${hasExpired ? '#ef4444' : hasWarn ? '#d97706' : '#10b981'}`,
                  background: hasExpired
                    ? isDark
                      ? 'rgba(239,68,68,0.12)'
                      : '#fef2f2'
                    : hasWarn
                      ? isDark
                        ? 'rgba(217,119,6,0.12)'
                        : '#fffbeb'
                      : isDark
                        ? 'rgba(16,185,129,0.12)'
                        : '#ecfdf5',
                  color: hasExpired ? '#ef4444' : hasWarn ? '#d97706' : '#10b981',
                  fontSize: 12,
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  marginBottom: 10,
                }}
              >
                {hasExpired ? <AlertTriangle size={14} /> : <CheckCircle2 size={14} />}
                {hasExpired
                  ? '存在已过期证照：禁止提交新合同（可暂存草稿）'
                  : hasWarn
                    ? '存在即将到期证照（≤3个月）：可提交，业管待办已示意'
                    : '资质证照 OCR 识别全部有效'}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 8 }}>
                {credentials.map((c) => (
                  <div
                    key={c.name}
                    style={{
                      border: `1px solid ${border}`,
                      borderRadius: 8,
                      padding: '8px 10px',
                      fontSize: 12,
                      background: isDark ? '#1a1d24' : '#fff',
                    }}
                  >
                    <div style={{ fontWeight: 700, color: textPrimary }}>{c.name}</div>
                    <div style={{ marginTop: 4, color: textSecondary }}>有效期至 {c.expiry}</div>
                    <div style={{ marginTop: 4, color: credentialToneColor(c.tone), fontWeight: 700 }}>
                      OCR 已识别 · {credentialToneLabel(c.tone)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 2 里程 */}
          <div style={cardStyle}>
            {sectionHead('2. 里程标准', <FileText size={16} />, mileageDone)}
            <div style={{ marginBottom: 12 }}>
              <V2Switch
                checked={hasMinMileage}
                onChange={setHasMinMileage}
                label="是否有最低里程要求"
                subLabel="开启后写入合同减免与考核条款"
              />
            </div>
            {hasMinMileage && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                <div>
                  <label style={labelStyle}>统计周期 *</label>
                  <V2Select
                    value={mileagePeriod}
                    onChange={(v) => setMileagePeriod(v as 'month' | 'quarter' | 'year')}
                    allowClear={false}
                    options={[
                      { value: 'month', label: '月' },
                      { value: 'quarter', label: '季' },
                      { value: 'year', label: '年' },
                    ]}
                  />
                </div>
                <div>
                  <label style={labelStyle}>目标里程（公里）*</label>
                  <input
                    type="number"
                    value={targetMileageKm}
                    onChange={(e) => setTargetMileageKm(Number(e.target.value) || 0)}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>里程类型 *</label>
                  <V2CheckboxGroup
                    value={mileageTypes}
                    onChange={setMileageTypes}
                    options={[
                      { value: 'actual', label: '实际里程' },
                      { value: 'odometer', label: '仪表里程' },
                    ]}
                  />
                </div>
              </div>
            )}
          </div>

          {/* 3 费用 */}
          <div style={cardStyle}>
            {sectionHead('3. 费用信息', <FileText size={16} />, feeDone)}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
              <div>
                <label style={labelStyle}>付款周期 *</label>
                <V2Select
                  value={paymentPeriod}
                  onChange={setPaymentPeriod}
                  allowClear={false}
                  options={[
                    { value: '月付', label: '月付' },
                    { value: '季付', label: '季付' },
                    { value: '半年付', label: '半年付' },
                    { value: '年付', label: '年付' },
                  ]}
                />
              </div>
              <div>
                <label style={labelStyle}>氢费支付方式 *</label>
                <V2Select
                  value={h2PaymentMethod}
                  onChange={(v) => setH2PaymentMethod(v as 'self' | 'prepaid' | 'monthly')}
                  allowClear={false}
                  options={[
                    { value: 'self', label: '自行解决' },
                    { value: 'prepaid', label: '预付款' },
                    { value: 'monthly', label: '按月结算' },
                  ]}
                />
              </div>
              <div>
                <label style={labelStyle}>还车氢量差单价（元）*</label>
                <input
                  type="number"
                  step="0.1"
                  value={returnH2Price}
                  onChange={(e) => setReturnH2Price(Number(e.target.value) || 0)}
                  style={inputStyle}
                />
              </div>
              {h2PaymentMethod === 'prepaid' && (
                <>
                  <div>
                    <label style={labelStyle}>预付金额 *</label>
                    <input
                      type="number"
                      value={prepayAmount}
                      onChange={(e) => setPrepayAmount(Number(e.target.value) || 0)}
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>提前付款工作日 *</label>
                    <input
                      type="number"
                      value={payAheadDays}
                      onChange={(e) => setPayAheadDays(Number(e.target.value) || 0)}
                      style={inputStyle}
                    />
                  </div>
                </>
              )}
              <div>
                <label style={labelStyle}>履约保证金汇总参考（元）</label>
                <input
                  type="number"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(Number(e.target.value) || 0)}
                  style={inputStyle}
                />
              </div>
            </div>
          </div>

          {/* 4 租赁订单 */}
          <div style={cardStyle} data-annotation-id="lc-create-lease-order">
            {sectionHead('4. 附件1：租赁订单', <TruckIcon color={accent} />, orderDone)}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 12 }}>
              <div>
                <label style={labelStyle}>三者责任险（百万）*</label>
                <input
                  type="number"
                  value={thirdPartyLiability}
                  onChange={(e) => setThirdPartyLiability(Number(e.target.value) || 0)}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>交车区域 *</label>
                <input value={deliveryRegion} onChange={(e) => setDeliveryRegion(e.target.value)} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>计划交车日期 *</label>
                <V2DatePicker value={deliveryDate} onChange={setDeliveryDate} />
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                gap: 12,
                flexWrap: 'wrap',
                marginBottom: 12,
                fontSize: 12,
                color: textSecondary,
              }}
            >
              <span>
                投保车辆数 <strong style={{ color: textPrimary }}>{orderKpi.qty}</strong>
              </span>
              <span>
                月租金合计 <strong style={{ color: textPrimary }}>¥{orderKpi.rent.toLocaleString()}</strong>
              </span>
              <span>
                保证金合计 <strong style={{ color: textPrimary }}>¥{orderKpi.deposit.toLocaleString()}</strong>
              </span>
              <span>
                固定服务费 <strong style={{ color: textPrimary }}>¥{orderKpi.service.toLocaleString()}</strong>
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
              <V2Button
                variant="outline"
                size="sm"
                icon={<Plus size={12} />}
                onClick={() => setOrderRows((prev) => [...prev, emptyOrderRow()])}
              >
                新增车辆行
              </V2Button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {orderRows.map((row, index) => {
                const cat = BRAND_MODELS.find((b) => b.brand === row.brand && b.model === row.model);
                const below = cat ? row.rent < cat.minRent : false;
                return (
                  <div
                    key={row.id}
                    style={{
                      border: `1px solid ${below ? '#d97706' : border}`,
                      borderRadius: 10,
                      padding: 12,
                      background: isDark ? '#1a1d24' : '#f8fafc',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBottom: 8,
                        fontSize: 12,
                        fontWeight: 700,
                        color: textPrimary,
                      }}
                    >
                      <span>车辆 #{index + 1}</span>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button
                          type="button"
                          title="复制行"
                          onClick={() =>
                            setOrderRows((prev) => [
                              ...prev,
                              { ...row, id: emptyOrderRow().id, plateNo: '交车时确认' },
                            ])
                          }
                          style={{ border: 'none', background: 'transparent', color: accent, cursor: 'pointer' }}
                        >
                          <Copy size={14} />
                        </button>
                        <button
                          type="button"
                          title="删除行"
                          aria-label="删除车辆行"
                          disabled={orderRows.length <= 1}
                          onClick={() => setOrderRows((prev) => prev.filter((r) => r.id !== row.id))}
                          style={{
                            border: 'none',
                            background: 'transparent',
                            color: '#ef4444',
                            cursor: orderRows.length <= 1 ? 'not-allowed' : 'pointer',
                            opacity: orderRows.length <= 1 ? 0.4 : 1,
                          }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.4fr 1fr 0.7fr 0.9fr 0.9fr', gap: 8 }}>
                      <div>
                        <label style={labelStyle}>品牌</label>
                        <V2Select
                          value={row.brand}
                          allowClear={false}
                          onChange={(brand) => {
                            const first = BRAND_MODELS.find((b) => b.brand === brand);
                            updateRow(row.id, {
                              brand,
                              model: first?.model || row.model,
                              rent: first?.minRent || row.rent,
                            });
                          }}
                          options={[...new Set(BRAND_MODELS.map((b) => b.brand))].map((b) => ({
                            value: b,
                            label: b,
                          }))}
                        />
                      </div>
                      <div>
                        <label style={labelStyle}>型号</label>
                        <V2Select
                          value={row.model}
                          allowClear={false}
                          onChange={(model) => {
                            const hit = BRAND_MODELS.find((b) => b.brand === row.brand && b.model === model);
                            updateRow(row.id, { model, rent: hit?.minRent || row.rent });
                          }}
                          options={BRAND_MODELS.filter((b) => b.brand === row.brand).map((b) => ({
                            value: b.model,
                            label: b.model,
                          }))}
                        />
                      </div>
                      <div>
                        <label style={labelStyle}>车牌</label>
                        <input
                          value={row.plateNo}
                          onChange={(e) => updateRow(row.id, { plateNo: e.target.value.replace(/·/g, '') })}
                          style={inputStyle}
                        />
                      </div>
                      <div>
                        <label style={labelStyle}>租期月</label>
                        <input
                          type="number"
                          value={row.leaseMonths}
                          onChange={(e) => updateRow(row.id, { leaseMonths: Number(e.target.value) || 1 })}
                          style={inputStyle}
                        />
                      </div>
                      <div>
                        <label style={labelStyle}>月租金</label>
                        <input
                          type="number"
                          value={row.rent}
                          onChange={(e) => updateRow(row.id, { rent: Number(e.target.value) || 0 })}
                          style={inputStyle}
                        />
                      </div>
                      <div>
                        <label style={labelStyle}>保证金</label>
                        <input
                          type="number"
                          value={row.deposit}
                          onChange={(e) => updateRow(row.id, { deposit: Number(e.target.value) || 0 })}
                          style={inputStyle}
                        />
                      </div>
                    </div>
                    {below && (
                      <div style={{ marginTop: 8, fontSize: 11, color: '#d97706', fontWeight: 600 }}>
                        月租金低于系统最低值 ¥{cat?.minRent.toLocaleString()}，将自动判定为非标准合同审批
                      </div>
                    )}
                    {cat && (
                      <div style={{ marginTop: 6, fontSize: 11, color: textSecondary }}>
                        全国在库示意：{cat.brand === '现代' ? 6 : 18} 台可运营/待运营
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* 5 授权 */}
          <div style={cardStyle} data-annotation-id="lc-create-poa">
            {sectionHead('5. 授权委托书被授权人', <User size={16} />, poaDone)}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
              <V2Button
                variant="outline"
                size="sm"
                icon={<Plus size={12} />}
                onClick={() =>
                  setDelegates((prev) => [...prev, { id: String(Date.now()), name: '', phone: '', idCard: '' }])
                }
              >
                添加被授权人
              </V2Button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {delegates.map((d, index) => (
                <div
                  key={d.id}
                  style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.2fr 40px', gap: 10, alignItems: 'center' }}
                >
                  <input
                    placeholder="姓名 *"
                    value={d.name}
                    onChange={(e) => {
                      const next = [...delegates];
                      next[index] = { ...d, name: e.target.value };
                      setDelegates(next);
                    }}
                    style={inputStyle}
                  />
                  <input
                    placeholder="手机号 *"
                    value={d.phone}
                    onChange={(e) => {
                      const next = [...delegates];
                      next[index] = { ...d, phone: e.target.value };
                      setDelegates(next);
                    }}
                    style={inputStyle}
                  />
                  <input
                    placeholder="身份证号 *"
                    value={d.idCard}
                    onChange={(e) => {
                      const next = [...delegates];
                      next[index] = { ...d, idCard: e.target.value };
                      setDelegates(next);
                    }}
                    style={inputStyle}
                  />
                  <button
                    type="button"
                    aria-label="删除被授权人"
                    onClick={() => setDelegates((prev) => (prev.length <= 1 ? prev : prev.filter((x) => x.id !== d.id)))}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#ef4444',
                      cursor: 'pointer',
                      minHeight: 36,
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* 6 备注 */}
          <div style={cardStyle} data-annotation-id="lc-create-contract-remark">
            <label style={labelStyle}>合同备注（选填，最多 500 字）</label>
            <textarea
              value={remarks}
              maxLength={500}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="补充条款说明或风控备注…"
              rows={3}
              style={{
                ...inputStyle,
                height: 'auto',
                minHeight: 88,
                padding: '8px 12px',
                lineHeight: 1.5,
                resize: 'vertical',
              }}
            />
            <div style={{ textAlign: 'right', fontSize: 11, color: textSecondary, marginTop: 4 }}>
              {remarks.length}/500
            </div>
          </div>
        </div>

        {/* 右侧预览 */}
        <aside
          data-annotation-id="lc-create-preview"
          style={{
            ...cardStyle,
            position: 'sticky',
            top: 24,
            alignSelf: 'start',
            maxHeight: 'calc(100vh - 48px)',
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            minHeight: 520,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'center' }}>
            <span style={{ fontSize: 13, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <FileText size={14} style={{ color: accent }} />
              Word 合同文书实时预览
            </span>
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: approvalType === 'standard' ? '#10b981' : '#d97706',
                background:
                  approvalType === 'standard' ? 'rgba(16,185,129,0.12)' : 'rgba(217,119,6,0.12)',
                padding: '2px 8px',
                borderRadius: 4,
              }}
            >
              {approvalType === 'standard' ? '标准' : '非标'}
            </span>
          </div>
          <div style={{ fontSize: 11, color: textSecondary }}>
            模板 {STANDARD_DOC[templateCategory]} ·{' '}
            {signingMethod === 'online_esign' ? '线上 E签宝' : '线下盖章回传'} · 用章{' '}
            {sealTypes
              .map((s) => ({ contract: '合同章', official: '公章', legal_person: '法人章' })[s] || s)
              .join('、')}
          </div>
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              background: isDark ? '#1a1d24' : '#f8fafc',
              border: `1px solid ${border}`,
              borderRadius: 8,
              padding: 18,
              fontFamily: 'Georgia, "Songti SC", serif',
              fontSize: 12,
              lineHeight: 1.8,
              minHeight: 360,
            }}
          >
            <h2 style={{ textAlign: 'center', fontSize: 16, fontWeight: 800, marginBottom: 14 }}>
              {STANDARD_DOC[templateCategory]}
            </h2>
            <p>
              <strong>合同编号：</strong>
              {code}
            </p>
            <p>
              <strong>项目名称：</strong>
              {projectName || '（待填写）'}
            </p>
            <p>
              <strong>甲方（出租方）：</strong>
              {signingCompany}
            </p>
            <p>
              <strong>乙方（承租方）：</strong>
              {customerName}
            </p>
            <p>
              <strong>乙方负责人：</strong>
              {principalName || '—'} / {principalPhone || '—'}
            </p>
            <hr style={{ border: 'none', borderTop: `1px solid ${border}`, margin: '12px 0' }} />
            <p>
              <strong>第一条 租赁标的</strong>
              <br />
              甲方向乙方出租车辆共计 {orderRows.length} 辆
              {orderRows[0] ? `（示例车型：${orderRows[0].brand} · ${orderRows[0].model}）` : ''}
              ，单车月租金人民币 ¥{orderRows[0]?.rent?.toLocaleString() || '—'} 元。
            </p>
            <p>
              <strong>第二条 付款与保证金</strong>
              <br />
              付款周期【{paymentPeriod}】；氢费支付方式【
              {{ self: '自行解决', prepaid: '预付款', monthly: '按月结算' }[h2PaymentMethod]}】
              {h2PaymentMethod === 'prepaid' ? `，预付 ¥${prepayAmount.toLocaleString()}，提前 ${payAheadDays} 个工作日` : ''}
              ；履约保证金合计约 ¥{(orderKpi.deposit || depositAmount).toLocaleString()} 元；还车氢量差单价 ¥
              {returnH2Price}/单位。
            </p>
            <p>
              <strong>第三条 里程考核</strong>
              <br />
              {hasMinMileage
                ? `车辆${{ month: '月', quarter: '季', year: '年' }[mileagePeriod] || ''}目标里程不低于 ${targetMileageKm.toLocaleString()} 公里。`
                : '本合同无最低里程考核要求。'}
            </p>
            <p>
              <strong>第四条 交车安排</strong>
              <br />
              交车区域 {deliveryRegion}；计划交车日期 {deliveryDate || '—'}；三者责任险 {thirdPartyLiability}{' '}
              百万元。
            </p>
            <p>
              <strong>第五条 授权委托</strong>
              <br />
              被授权人：
              {delegates
                .filter((d) => d.name)
                .map((d) => d.name)
                .join('、') || '（待填写）'}
              。
            </p>
            {remarks ? (
              <p>
                <strong>备注</strong>
                <br />
                {remarks}
              </p>
            ) : null}
            {approvalType === 'non_standard' ? (
              <p style={{ color: '#d97706', fontWeight: 700 }} className="ct-risk-redline" data-risk-redline="1">
                【风控提示】触发非标准合同审批：
                {[rentBelowMin ? '租金低于最低值' : '', nonStandardSeal ? '加盖公章/法人章' : '']
                  .filter(Boolean)
                  .join('；')}
                。
              </p>
            ) : null}
          </div>
        </aside>
      </div>
    </div>
  );
}

function TruckIcon({ color }: { color: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M1 3h15v13H1V3zm15 5h4l3 4v4h-7V8z"
        stroke={color}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <circle cx="5.5" cy="18.5" r="2.5" stroke={color} strokeWidth="2" />
      <circle cx="18.5" cy="18.5" r="2.5" stroke={color} strokeWidth="2" />
    </svg>
  );
}
