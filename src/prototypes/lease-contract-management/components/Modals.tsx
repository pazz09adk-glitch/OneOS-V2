import React, { useState } from 'react';
import { X, Check, Paperclip, Send, AlertTriangle, Truck, UserPlus, DollarSign, FileCheck } from 'lucide-react';
import { LeaseContractRecord, VehicleItem } from '../types';

interface CommonModalProps {
  open: boolean;
  onClose: () => void;
  record?: LeaseContractRecord | null;
  isDark: boolean;
}

/* 1. 添加被授权人弹窗 */
export function DelegateModal({ open, onClose, record, isDark }: CommonModalProps) {
  const [delegates, setDelegates] = useState(
    record?.delegates || [{ id: '1', name: '张经理', phone: '13800001111', idCard: '330106198501011234' }]
  );

  if (!open) return null;

  const surface = isDark ? '#121418' : '#ffffff';
  const inputBg = isDark ? '#1a1d24' : '#f8fafc';
  const border = isDark ? '#23272f' : '#e3e8ee';
  const textPrimary = isDark ? '#f7fafc' : '#0a2540';
  const textSecondary = isDark ? '#a0aec0' : '#425466';
  const accent = '#533afd';

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '560px', background: surface, border: `1px solid ${border}`, borderRadius: '12px', padding: '24px', boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0, color: textPrimary, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <UserPlus size={18} style={{ color: accent }} /> 添加 / 管理被授权人列表
          </h3>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: textSecondary, cursor: 'pointer' }}>
            <X size={18} />
          </button>
        </div>

        <div style={{ fontSize: '12px', color: textSecondary, marginBottom: '16px' }}>
          合同编码: <span style={{ color: accent, fontFamily: 'monospace', fontWeight: 700 }}>{record?.code}</span> • 被授权人在交付现场具备代表客户签署交接单权限
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
          {delegates.map((d, i) => (
            <div key={d.id} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
              <input type="text" value={d.name} placeholder="姓名" style={{ background: inputBg, border: `1px solid ${border}`, borderRadius: '6px', padding: '6px 10px', fontSize: '12px', color: textPrimary }} />
              <input type="text" value={d.phone} placeholder="手机号" style={{ background: inputBg, border: `1px solid ${border}`, borderRadius: '6px', padding: '6px 10px', fontSize: '12px', color: textPrimary }} />
              <input type="text" value={d.idCard} placeholder="身份证号" style={{ background: inputBg, border: `1px solid ${border}`, borderRadius: '6px', padding: '6px 10px', fontSize: '12px', color: textPrimary }} />
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button onClick={onClose} style={{ padding: '6px 16px', borderRadius: '6px', fontSize: '12px', background: 'transparent', border: `1px solid ${border}`, color: textPrimary, cursor: 'pointer' }}>
            取消
          </button>
          <button onClick={() => { alert('授权人更新成功！'); onClose(); }} style={{ padding: '6px 20px', borderRadius: '6px', fontSize: '12px', background: accent, border: 'none', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>
            保存更新
          </button>
        </div>
      </div>
    </div>
  );
}

/* 2. 附加费用弹窗 */
export function ExtraFeeModal({ open, onClose, record, isDark }: CommonModalProps) {
  const [feeAmount, setFeeAmount] = useState(1200);
  const [serviceItem, setServiceItem] = useState('车载高阶加氢安全监控');

  if (!open) return null;

  const surface = isDark ? '#121418' : '#ffffff';
  const inputBg = isDark ? '#1a1d24' : '#f8fafc';
  const border = isDark ? '#23272f' : '#e3e8ee';
  const textPrimary = isDark ? '#f7fafc' : '#0a2540';
  const textSecondary = isDark ? '#a0aec0' : '#425466';
  const accent = '#533afd';

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '520px', background: surface, border: `1px solid ${border}`, borderRadius: '12px', padding: '24px', boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0, color: textPrimary, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <DollarSign size={18} style={{ color: accent }} /> 按车辆录入附加服务费用
          </h3>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: textSecondary, cursor: 'pointer' }}>
            <X size={18} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
          <div>
            <label style={{ fontSize: '12px', color: textSecondary, fontWeight: 600, display: 'block', marginBottom: '4px' }}>附加服务项目名称</label>
            <input type="text" value={serviceItem} onChange={(e) => setServiceItem(e.target.value)} style={{ width: '100%', background: inputBg, border: `1px solid ${border}`, borderRadius: '6px', padding: '8px 12px', fontSize: '13px', color: textPrimary }} />
          </div>
          <div>
            <label style={{ fontSize: '12px', color: textSecondary, fontWeight: 600, display: 'block', marginBottom: '4px' }}>附加费用金额 (元/月)</label>
            <input type="number" value={feeAmount} onChange={(e) => setFeeAmount(Number(e.target.value))} style={{ width: '100%', background: inputBg, border: `1px solid ${border}`, borderRadius: '6px', padding: '8px 12px', fontSize: '13px', color: textPrimary }} />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button onClick={onClose} style={{ padding: '6px 16px', borderRadius: '6px', fontSize: '12px', background: 'transparent', border: `1px solid ${border}`, color: textPrimary, cursor: 'pointer' }}>
            取消
          </button>
          <button onClick={() => { alert('附加费用已成功录入关联账单！'); onClose(); }} style={{ padding: '6px 20px', borderRadius: '6px', fontSize: '12px', background: accent, border: 'none', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>
            提交录入
          </button>
        </div>
      </div>
    </div>
  );
}

/* 3. 试用转正式弹窗 */
export function TrialToFormalModal({ open, onClose, record, isDark }: CommonModalProps) {
  if (!open) return null;

  const surface = isDark ? '#121418' : '#ffffff';
  const border = isDark ? '#23272f' : '#e3e8ee';
  const textPrimary = isDark ? '#f7fafc' : '#0a2540';
  const textSecondary = isDark ? '#a0aec0' : '#425466';
  const accent = '#533afd';

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '560px', background: surface, border: `1px solid ${border}`, borderRadius: '12px', padding: '24px', boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0, color: textPrimary, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileCheck size={18} style={{ color: accent }} /> 试用合同转正式租赁合同
          </h3>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: textSecondary, cursor: 'pointer' }}>
            <X size={18} />
          </button>
        </div>

        <div style={{ fontSize: '12px', color: textSecondary, lineHeight: 1.6, marginBottom: '20px' }}>
          原试用协议编码: <span style={{ color: accent, fontFamily: 'monospace', fontWeight: 700 }}>{record?.code}</span><br />
          系统已自动拉取客户档案、授信额度与车辆订单。转换成功后，原试用合同将自动归档为「已终止」，并生成全新正式租赁合同审批流。
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button onClick={onClose} style={{ padding: '6px 16px', borderRadius: '6px', fontSize: '12px', background: 'transparent', border: `1px solid ${border}`, color: textPrimary, cursor: 'pointer' }}>
            取消
          </button>
          <button onClick={() => { alert('已成功发起试用转正式合同审批！'); onClose(); }} style={{ padding: '6px 20px', borderRadius: '6px', fontSize: '12px', background: accent, border: 'none', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>
            确认转正式并提交
          </button>
        </div>
      </div>
    </div>
  );
}

/* 4. 上传盖章件弹窗 */
export function UploadStampModal({ open, onClose, record, isDark }: CommonModalProps) {
  if (!open) return null;

  const surface = isDark ? '#121418' : '#ffffff';
  const border = isDark ? '#23272f' : '#e3e8ee';
  const textPrimary = isDark ? '#f7fafc' : '#0a2540';
  const textSecondary = isDark ? '#a0aec0' : '#425466';
  const accent = '#533afd';

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '500px', background: surface, border: `1px solid ${border}`, borderRadius: '12px', padding: '24px', boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0, color: textPrimary, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Paperclip size={18} style={{ color: accent }} /> 补传线下盖章合同扫描件
          </h3>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: textSecondary, cursor: 'pointer' }}>
            <X size={18} />
          </button>
        </div>

        <div style={{ border: `2px dashed ${border}`, borderRadius: '8px', padding: '30px', textAlign: 'center', marginBottom: '20px', cursor: 'pointer' }}>
          <Paperclip size={24} style={{ color: accent, marginBottom: '8px' }} />
          <div style={{ fontSize: '13px', fontWeight: 600, color: textPrimary }}>点击或拖拽 PDF / 盖章扫描件到此处</div>
          <div style={{ fontSize: '11px', color: textSecondary, marginTop: '4px' }}>支持文件格式：PDF / JPG / PNG，单文件不超过 20MB</div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button onClick={onClose} style={{ padding: '6px 16px', borderRadius: '6px', fontSize: '12px', background: 'transparent', border: `1px solid ${border}`, color: textPrimary, cursor: 'pointer' }}>
            取消
          </button>
          <button onClick={() => { alert('盖章件已成功补传并归档！'); onClose(); }} style={{ padding: '6px 20px', borderRadius: '6px', fontSize: '12px', background: accent, border: 'none', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>
            确认归档
          </button>
        </div>
      </div>
    </div>
  );
}

/* 5. 还车办理弹窗 */
export function ReturnVehicleModal({ open, onClose, vehicle, isDark }: { open: boolean; onClose: () => void; vehicle?: VehicleItem | null; isDark: boolean }) {
  if (!open || !vehicle) return null;

  const surface = isDark ? '#121418' : '#ffffff';
  const inputBg = isDark ? '#1a1d24' : '#f8fafc';
  const border = isDark ? '#23272f' : '#e3e8ee';
  const textPrimary = isDark ? '#f7fafc' : '#0a2540';
  const textSecondary = isDark ? '#a0aec0' : '#425466';
  const accent = '#533afd';

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '520px', background: surface, border: `1px solid ${border}`, borderRadius: '12px', padding: '24px', boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0, color: textPrimary, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Truck size={18} style={{ color: accent }} /> 办理车辆还车与退车结算
          </h3>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: textSecondary, cursor: 'pointer' }}>
            <X size={18} />
          </button>
        </div>

        <div style={{ background: inputBg, border: `1px solid ${border}`, borderRadius: '8px', padding: '12px', marginBottom: '16px', fontSize: '12px' }}>
          <div><strong>车牌号:</strong> <span style={{ color: accent, fontWeight: 700 }}>{vehicle.plateNo}</span></div>
          <div><strong>VIN 码:</strong> {vehicle.vin}</div>
          <div><strong>车型:</strong> {vehicle.brand} {vehicle.model}</div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
          <div>
            <label style={{ fontSize: '12px', color: textSecondary, fontWeight: 600, display: 'block', marginBottom: '4px' }}>还车公里数 (Km) *</label>
            <input type="number" defaultValue={vehicle.currentMileageKm || 20000} style={{ width: '100%', background: inputBg, border: `1px solid ${border}`, borderRadius: '6px', padding: '8px 12px', fontSize: '13px', color: textPrimary }} />
          </div>
          <div>
            <label style={{ fontSize: '12px', color: textSecondary, fontWeight: 600, display: 'block', marginBottom: '4px' }}>剩余氢量与差价结算 (元)</label>
            <input type="number" defaultValue={0} style={{ width: '100%', background: inputBg, border: `1px solid ${border}`, borderRadius: '6px', padding: '8px 12px', fontSize: '13px', color: textPrimary }} />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button onClick={onClose} style={{ padding: '6px 16px', borderRadius: '6px', fontSize: '12px', background: 'transparent', border: `1px solid ${border}`, color: textPrimary, cursor: 'pointer' }}>
            取消
          </button>
          <button onClick={() => { alert('还车申请已提交，进入退车应结款审批流程！'); onClose(); }} style={{ padding: '6px 20px', borderRadius: '6px', fontSize: '12px', background: accent, border: 'none', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>
            确认发起还车结算
          </button>
        </div>
      </div>
    </div>
  );
}
