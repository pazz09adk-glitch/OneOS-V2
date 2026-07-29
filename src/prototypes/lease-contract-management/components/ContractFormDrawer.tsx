import React, { useState } from 'react';
import {
  X,
  Save,
  Send,
  AlertTriangle,
  Plus,
  Trash2,
  CheckCircle2,
  FileText,
  Building,
  User,
  ShieldAlert,
} from 'lucide-react';
import { LeaseContractRecord } from '../types';

interface ContractFormDrawerProps {
  open: boolean;
  onClose: () => void;
  record?: LeaseContractRecord | null;
  onSave: (contract: Partial<LeaseContractRecord>, status: 'draft' | 'submitted') => void;
  isDark: boolean;
}

export function ContractFormDrawer({
  open,
  onClose,
  record,
  onSave,
  isDark,
}: ContractFormDrawerProps) {
  const [code, setCode] = useState(record?.code || `HT-ZL-2026-${Math.floor(100 + Math.random() * 900)}`);
  const [projectName, setProjectName] = useState(record?.projectName || '');
  const [customerName, setCustomerName] = useState(record?.customerName || '杭州嘉氢物流有限公司');
  const [signingCompany, setSigningCompany] = useState(
    record?.signingCompany || '羚牛氢能(浙江)供应链管理有限公司'
  );
  const [hasMinMileage, setHasMinMileage] = useState(true);
  const [targetMileageKm, setTargetMileageKm] = useState(50000);
  const [paymentPeriod, setPaymentPeriod] = useState(record?.paymentPeriod || '月付');
  const [depositAmount, setDepositAmount] = useState(record?.depositAmount || 50000);
  const [monthlyRent, setMonthlyRent] = useState(record?.monthlyRentPerVehicle || 12000);
  const [remarks, setRemarks] = useState(record?.remarks || '');
  const [hasExpiredCredential, setHasExpiredCredential] = useState(false);

  const [delegates, setDelegates] = useState([
    { id: '1', name: '王强', phone: '13812345678', idCard: '330106198801011234' },
  ]);

  if (!open) return null;

  const bg = isDark ? '#0a0b0d' : '#f6f9fc';
  const surface = isDark ? '#121418' : '#ffffff';
  const inputBg = isDark ? '#1a1d24' : '#f8fafc';
  const border = isDark ? '#23272f' : '#e3e8ee';
  const textPrimary = isDark ? '#f7fafc' : '#0a2540';
  const textSecondary = isDark ? '#a0aec0' : '#425466';
  const accent = '#533afd';

  const handleAddDelegate = () => {
    setDelegates([...delegates, { id: String(Date.now()), name: '', phone: '', idCard: '' }]);
  };

  const handleRemoveDelegate = (id: string) => {
    setDelegates(delegates.filter((d) => d.id !== id));
  };

  const handleSubmit = (submitStatus: 'draft' | 'submitted') => {
    if (submitStatus === 'submitted' && hasExpiredCredential) {
      alert('拦截：当前所选客户存在已过期的资质证照（如道路运输许可证已过期），业管更新前禁止提交新合同！');
      return;
    }

    onSave(
      {
        id: record?.id || `lc-${Date.now()}`,
        code,
        projectName: projectName || '新建重卡租赁项目',
        customerName,
        lesseeCompany: `${customerName} (B级客户)`,
        signingCompany,
        contractTemplateCategory: 'formal',
        contractTemplateName: '正式租赁合同模板',
        standardContractName: '2026年标准商用车租赁合同',
        approvalType: 'standard',
        approvalStatus: submitStatus === 'submitted' ? 'pending' : 'unsubmitted',
        contractStatus: submitStatus === 'submitted' ? 'submitted' : 'draft',
        currentApprover: submitStatus === 'submitted' ? '李合规 (风控初审)' : '未提交',
        signingMethod: 'online_esign',
        businessDept: '华东业务一部',
        businessOwner: '陈业务',
        creator: '当前用户',
        createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
        updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
        endDate: '2028-06-30',
        totalVehicles: 2,
        deliveredVehiclesCount: 0,
        returnedVehiclesCount: 0,
        paymentPeriod,
        h2PaymentMethod: 'prepaid',
        depositAmount,
        monthlyRentPerVehicle: monthlyRent,
        deliveryRegion: '浙江省·嘉兴市',
        deliveryDatePlan: '2026-08-01',
        delegates,
        extraFees: [],
        tripartiteAgreements: [],
        vehicles: [],
        remarks,
      },
      submitStatus
    );
  };

  const inputStyle: React.CSSProperties = {
    background: inputBg,
    border: `1px solid ${border}`,
    borderRadius: '8px',
    padding: '8px 12px',
    fontSize: '13px',
    color: textPrimary,
    outline: 'none',
    width: '100%',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: '12px',
    fontWeight: 600,
    color: textSecondary,
    marginBottom: '6px',
    display: 'block',
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        background: 'rgba(0, 0, 0, 0.6)',
        display: 'flex',
        justifyContent: 'flex-end',
      }}
    >
      <div
        style={{
          width: '90vw',
          maxWidth: '1280px',
          height: '100%',
          background: bg,
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '-8px 0 32px rgba(0,0,0,0.3)',
        }}
      >
        {/* Drawer Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justify: 'space-between',
            padding: '16px 24px',
            background: surface,
            borderBottom: `1px solid ${border}`,
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 800, margin: 0, color: textPrimary }}>
                {record ? '编辑租赁合同' : '新增租赁合同'}
              </h2>
              <span
                style={{
                  fontSize: '11px',
                  fontFamily: 'monospace',
                  fontWeight: 700,
                  color: accent,
                  background: isDark ? 'rgba(83, 58, 253, 0.2)' : '#e0e7ff',
                  padding: '2px 8px',
                  borderRadius: '4px',
                }}
              >
                {code}
              </span>
            </div>
            <p style={{ fontSize: '12px', color: textSecondary, margin: '2px 0 0 0' }}>
              完成主体表单录入，右侧实时预览 Word 合同文本与风控提示
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              type="button"
              onClick={() => handleSubmit('draft')}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                border: `1px solid ${border}`,
                background: surface,
                color: textPrimary,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Save size={14} /> 保存草稿
            </button>
            <button
              type="button"
              onClick={() => handleSubmit('submitted')}
              style={{
                padding: '8px 20px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                border: 'none',
                background: accent,
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Send size={14} /> 提交审核
            </button>
            <button
              type="button"
              onClick={onClose}
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: textSecondary }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Drawer Body: 2 Columns */}
        <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 500px', overflow: 'hidden' }}>
          {/* Left Form Scroll Area */}
          <div style={{ padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Module 1: Party A & Party B */}
            <div style={{ background: surface, border: `1px solid ${border}`, borderRadius: '12px', padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <Building size={16} style={{ color: accent }} />
                <h3 style={{ fontSize: '15px', fontWeight: 700, margin: 0, color: textPrimary }}>
                  1. 签约双方主体信息
                </h3>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={labelStyle}>项目名称 *</label>
                  <input
                    type="text"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    placeholder="请输入项目名称..."
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>出租方 (甲方主体) *</label>
                  <select
                    value={signingCompany}
                    onChange={(e) => setSigningCompany(e.target.value)}
                    style={inputStyle}
                  >
                    <option value="羚牛氢能(浙江)供应链管理有限公司">羚牛氢能(浙江)供应链管理有限公司</option>
                    <option value="上海羚牛氢能科技有限公司">上海羚牛氢能科技有限公司</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                <div>
                  <label style={labelStyle}>承租方 (乙方客户) *</label>
                  <select
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    style={inputStyle}
                  >
                    <option value="杭州嘉氢物流有限公司">杭州嘉氢物流有限公司 (资质有效)</option>
                    <option value="宁波港通冷链物流有限公司">宁波港通冷链物流有限公司 (资质预警)</option>
                    <option value="杭州某某租赁有限公司">杭州某某租赁有限公司 (证照已过期 - 拦截提单)</option>
                  </select>
                </div>

                <div>
                  <label style={labelStyle}>客户资质证照校验 (OCR 自动校验)</label>
                  <div
                    style={{
                      padding: '8px 12px',
                      borderRadius: '8px',
                      background: hasExpiredCredential
                        ? isDark
                          ? 'rgba(239, 68, 68, 0.15)'
                          : '#fee2e2'
                        : isDark
                        ? 'rgba(16, 185, 129, 0.15)'
                        : '#dcfce7',
                      border: `1px solid ${hasExpiredCredential ? '#ef4444' : '#10b981'}`,
                      fontSize: '12px',
                      color: hasExpiredCredential ? '#ef4444' : '#10b981',
                      display: 'flex',
                      alignItems: 'center',
                      justify: 'space-between',
                    }}
                  >
                    <span style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {hasExpiredCredential ? <AlertTriangle size={14} /> : <CheckCircle2 size={14} />}
                      {hasExpiredCredential ? '包含过期证照 (道路运输许可证已过期)' : '资质证照 OCR 识别全部有效'}
                    </span>
                    <button
                      type="button"
                      onClick={() => setHasExpiredCredential(!hasExpiredCredential)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: accent,
                        fontSize: '11px',
                        cursor: 'pointer',
                        textDecoration: 'underline',
                      }}
                    >
                      切换校验阻断测试
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Module 2: Mileage & Fee */}
            <div style={{ background: surface, border: `1px solid ${border}`, borderRadius: '12px', padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <FileText size={16} style={{ color: accent }} />
                <h3 style={{ fontSize: '15px', fontWeight: 700, margin: 0, color: textPrimary }}>
                  2. 里程标准与费用条款
                </h3>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                <div>
                  <label style={labelStyle}>付款周期 *</label>
                  <select
                    value={paymentPeriod}
                    onChange={(e) => setPaymentPeriod(e.target.value)}
                    style={inputStyle}
                  >
                    <option value="月付">月付</option>
                    <option value="季付">季付</option>
                    <option value="半年付">半年付</option>
                    <option value="年付">年付</option>
                  </select>
                </div>

                <div>
                  <label style={labelStyle}>单车月租金 (元) *</label>
                  <input
                    type="number"
                    value={monthlyRent}
                    onChange={(e) => setMonthlyRent(Number(e.target.value))}
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label style={labelStyle}>履约保证金 (元) *</label>
                  <input
                    type="number"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(Number(e.target.value))}
                    style={inputStyle}
                  />
                </div>
              </div>
            </div>

            {/* Module 3: Delegates */}
            <div style={{ background: surface, border: `1px solid ${border}`, borderRadius: '12px', padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <User size={16} style={{ color: accent }} />
                  <h3 style={{ fontSize: '15px', fontWeight: 700, margin: 0, color: textPrimary }}>
                    3. 授权委托书被授权人
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={handleAddDelegate}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    border: `1px solid ${accent}`,
                    background: 'transparent',
                    color: accent,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <Plus size={12} /> 添加被授权人
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {delegates.map((d, index) => (
                  <div key={d.id} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 40px', gap: '10px', alignItems: 'center' }}>
                    <input
                      type="text"
                      placeholder="姓名..."
                      value={d.name}
                      onChange={(e) => {
                        const next = [...delegates];
                        next[index].name = e.target.value;
                        setDelegates(next);
                      }}
                      style={inputStyle}
                    />
                    <input
                      type="text"
                      placeholder="手机号..."
                      value={d.phone}
                      onChange={(e) => {
                        const next = [...delegates];
                        next[index].phone = e.target.value;
                        setDelegates(next);
                      }}
                      style={inputStyle}
                    />
                    <input
                      type="text"
                      placeholder="身份证号..."
                      value={d.idCard}
                      onChange={(e) => {
                        const next = [...delegates];
                        next[index].idCard = e.target.value;
                        setDelegates(next);
                      }}
                      style={inputStyle}
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveDelegate(d.id)}
                      style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', textAlign: 'center' }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Remarks */}
            <div style={{ background: surface, border: `1px solid ${border}`, borderRadius: '12px', padding: '20px' }}>
              <label style={labelStyle}>合同备注事项</label>
              <textarea
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="请输入补充条款说明或风控备注..."
                rows={3}
                style={{ ...inputStyle, resize: 'none' }}
              />
            </div>
          </div>

          {/* Right Preview Column */}
          <div
            style={{
              background: surface,
              borderLeft: `1px solid ${border}`,
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '13px', fontWeight: 700, color: textPrimary }}>
                📄 Word 合同文书实时版式预览
              </span>
              <span style={{ fontSize: '11px', color: accent, background: isDark ? 'rgba(83, 58, 253, 0.2)' : '#e0e7ff', padding: '2px 8px', borderRadius: '4px' }}>
                标准版 v2.6
              </span>
            </div>

            <div
              style={{
                flex: 1,
                background: isDark ? '#1a1d24' : '#f8fafc',
                border: `1px solid ${border}`,
                borderRadius: '8px',
                padding: '20px',
                fontFamily: 'serif',
                fontSize: '12px',
                lineHeight: 1.8,
                color: textPrimary,
                overflowY: 'auto',
              }}
            >
              <h2 style={{ textAlign: 'center', fontSize: '16px', fontWeight: 800, marginBottom: '16px' }}>
                2026年标准商用车租赁合同
              </h2>
              <p><strong>甲方 (出租方)：</strong>{signingCompany}</p>
              <p><strong>乙方 (承租方)：</strong>{customerName}</p>
              <hr style={{ border: 'none', borderTop: `1px solid ${border}`, margin: '12px 0' }} />
              <p><strong>第一条 租赁标的物与数量</strong><br />甲方向乙方出租重卡车辆共计 2 辆，单车租金为人民币 ¥{monthlyRent} 元/月。</p>
              <p><strong>第二条 付款方式与保证金</strong><br />付款周期为【{paymentPeriod}】，履约保证金共计人民币 ¥{depositAmount} 元整。</p>
              <p><strong>第三条 里程考核标准</strong><br />车辆年目标里程不低于 {targetMileageKm} 公里，超程按规定标准结算。</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
