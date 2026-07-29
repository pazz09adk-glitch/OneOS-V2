import React, { useState } from 'react';
import { LeaseContractH5 } from '../lease-contract-management/components/LeaseContractH5';
import { MOCK_LEASE_CONTRACTS } from '../lease-contract-management/mockData';
import { LeaseContractRecord, VehicleItem } from '../lease-contract-management/types';
import {
  DelegateModal,
  ExtraFeeModal,
  TrialToFormalModal,
  UploadStampModal,
  ReturnVehicleModal
} from '../lease-contract-management/components/Modals';
import { ContractFormDrawer } from '../lease-contract-management/components/ContractFormDrawer';

export default function H5LeaseContractApp() {
  const [contracts, setContracts] = useState<LeaseContractRecord[]>(MOCK_LEASE_CONTRACTS);
  const [isDark, setIsDark] = useState<boolean>(false);
  const [formOpen, setFormOpen] = useState<boolean>(false);
  const [editing, setEditing] = useState<LeaseContractRecord | null>(null);
  const [target, setTarget] = useState<LeaseContractRecord | null>(null);
  const [targetVehicle, setTargetVehicle] = useState<VehicleItem | null>(null);
  const [modal, setModal] = useState<string | null>(null);

  return (
    <div style={{ minHeight: '100vh', background: isDark ? '#0A0B0D' : '#F6F9FC', padding: '12px 0' }}>
      <LeaseContractH5
        contracts={contracts}
        isDark={isDark}
        onOpenCreateForm={() => { setEditing(null); setFormOpen(true); }}
        onOpenEditForm={(r) => { setEditing(r); setFormOpen(true); }}
        onOpenDelegateModal={(r) => { setTarget(r); setModal('delegate'); }}
        onOpenExtraFeeModal={(r) => { setTarget(r); setModal('extraFee'); }}
        onOpenTrialModal={(r) => { setTarget(r); setModal('trialToFormal'); }}
        onOpenStampModal={(r) => { setTarget(r); setModal('uploadStamp'); }}
        onOpenReturnVehicleModal={(r, v) => { setTarget(r); setTargetVehicle(v || null); setModal('returnVehicle'); }}
      />

      <ContractFormDrawer open={formOpen} onClose={() => setFormOpen(false)} editingRecord={editing} onSave={() => alert('已保存合同')} />
      {modal === 'delegate' && target && <DelegateModal record={target} onClose={() => setModal(null)} onSave={() => alert('已更新代理人')} />}
      {modal === 'extraFee' && target && <ExtraFeeModal record={target} onClose={() => setModal(null)} onSave={() => alert('已新增附加费')} />}
      {modal === 'trialToFormal' && target && <TrialToFormalModal record={target} onClose={() => setModal(null)} onSave={() => alert('试用转正式申请成功')} />}
      {modal === 'uploadStamp' && target && <UploadStampModal record={target} onClose={() => setModal(null)} onSave={() => alert('上传盖章件成功')} />}
      {modal === 'returnVehicle' && target && targetVehicle && <ReturnVehicleModal vehicle={targetVehicle} isDark={isDark} onClose={() => setModal(null)} />}
    </div>
  );
}
