import React, { useMemo, useState } from 'react';
import { BfclChainNav } from '../bfcl-shared-chain/BfclChainNav';
import '../bfcl-shared-chain/bfcl-chain-nav.css';
import { V2Button, V2StatusTabs } from '../../resources/design-system/components/UIComponents';
import { V2Badge } from '../../resources/design-system/components/V2Badge';
import { SUPPLIERS, PAYS, BATCHES } from './mockData';
import { formatMoney, type InsTab, type InsPay, type PolicyBatch, type Supplier } from './types';

export function InsuranceHub() {
  const [tab, setTab] = useState<InsTab>('供应商');
  const [suppliers, setSuppliers] = useState(SUPPLIERS);
  const [pays, setPays] = useState(PAYS);
  const [batches, setBatches] = useState(BATCHES);
  const [toast, setToast] = useState<string|null>(null);
  const showToast=(m:string)=>{ setToast(m); window.setTimeout(()=>setToast(null),2400); };

  const kpi = useMemo(()=>[
    {label:'供应商缺账户', value:String(suppliers.filter(s=>!s.accountOk).length)},
    {label:'待付款单', value:String(pays.filter(p=>p.status==='待付款').length)},
    {label:'已闭环', value:String(pays.filter(p=>p.status==='已闭环').length)},
    {label:'待归档批次', value:String(batches.filter(b=>b.status!=='已归档').length)},
  ],[suppliers,pays,batches]);

  const fillAccount = (s: Supplier) => {
    setSuppliers(list=>list.map(x=>x.id===s.id?{...x, accountOk:true, bank:'招行杭州分行', accountNo:'5719 **** 3344'}:x));
    setPays(list=>list.map(p=>p.supplier===s.name?{...p, accountBlocked:false}:p));
    showToast('账户信息已维护，可自动生成付款任务');
  };

  const approveQuote = (p: InsPay) => {
    if (p.accountBlocked) { showToast('门禁：供应商账户不全，禁止自动出付款任务'); return; }
    if (p.status!=='待比价') { showToast('当前状态不可比价通过'); return; }
    setPays(list=>list.map(x=>x.id===p.id?{...x, status:'待付款'}:x));
    showToast('比价审批通过：已自动生成保险付款任务（带打款账户）');
  };

  const closePay = (p: InsPay) => {
    if (p.status!=='待付款') { showToast('仅待付款可关联闭环'); return; }
    setPays(list=>list.map(x=>x.id===p.id?{...x, status:'已闭环'}:x));
    setBatches(list=>list.map(b=>b.payDocNo===p.docNo?{...b, status:'可上传'}:b));
    // also create batch if none
    if (!batches.some(b=>b.payDocNo===p.docNo)) {
      setBatches(list=>[...list, { id:'b'+Date.now(), batchNo:'POL-BATCH-NEW', payDocNo:p.docNo, vehicles:6, policies:0, status:'可上传' }]);
    }
    showToast(`付款记录 PY-20260722-011 已关联 ${p.docNo} → 闭环，可批量上传保单`);
  };

  const uploadBatch = (b: PolicyBatch) => {
    if (b.status==='不可上传') { showToast('门禁：付款未闭环，不可批量正式归档保单'); return; }
    if (b.status==='已归档') { showToast('已归档'); return; }
    setBatches(list=>list.map(x=>x.id===b.id?{...x, policies:x.vehicles*2, status:'已归档'}:x));
    showToast('批量上传成功：自动识别 · 一车多保 · 回写资产保险状态');
  };

  return (
    <div className="bfcl-page">
      <BfclChainNav current="insurance" />
      <div className="bfcl-toolbar">
        <V2StatusTabs value={tab} onChange={setTab} options={[
          {key:'供应商',label:'供应商账户'},{key:'比价付款',label:'比价·付款'},{key:'保单',label:'批量保单'},
        ]} />
      </div>
      <div className="bfcl-kpi">{kpi.map(k=>(
        <div key={k.label} className="bfcl-kpi__card"><span className="bfcl-kpi__label">{k.label}</span><strong className="bfcl-kpi__value">{k.value}</strong></div>
      ))}</div>

      {tab==='供应商' && (
        <div className="bfcl-shell" data-annotation-id="bfcl-ins-sup">
          <table className="bfcl-table"><thead><tr><th>供应商</th><th>开户行</th><th>账号</th><th>账户齐全</th><th>操作</th></tr></thead>
          <tbody>{suppliers.map(s=>(
            <tr key={s.id}>
              <td className="bfcl-primary">{s.name}</td><td>{s.bank}</td><td className="bfcl-mono">{s.accountNo}</td>
              <td><V2Badge status={s.accountOk?'success':'error'} label={s.accountOk?'齐全':'缺账户'} /></td>
              <td>{s.accountOk?<span className="bfcl-muted">可自动打款</span>:<V2Button variant="outline" size="sm" onClick={()=>fillAccount(s)}>上传账户</V2Button>}</td>
            </tr>
          ))}</tbody></table>
        </div>
      )}

      {tab==='比价付款' && (
        <div className="bfcl-shell" data-annotation-id="bfcl-ins-pay">
          <table className="bfcl-table"><thead><tr><th>付款单</th><th>保险公司</th><th>金额</th><th>状态</th><th>操作</th></tr></thead>
          <tbody>{pays.map(p=>(
            <tr key={p.id}>
              <td className="bfcl-mono bfcl-primary">{p.docNo}</td><td>{p.supplier}</td>
              <td className="bfcl-mono">¥{formatMoney(p.amount)}</td>
              <td>
                <V2Badge status={p.status==='已闭环'?'success':p.status==='待付款'?'warning':'default'} label={p.status} />
                {p.accountBlocked ? <> <V2Badge status="error" label="账户阻断" /></> : null}
              </td>
              <td style={{display:'flex',gap:8}}>
                <V2Button variant="outline" size="sm" onClick={()=>approveQuote(p)}>比价通过</V2Button>
                <V2Button variant="primary" size="sm" onClick={()=>closePay(p)}>关联付款闭环</V2Button>
              </td>
            </tr>
          ))}</tbody></table>
        </div>
      )}

      {tab==='保单' && (
        <div className="bfcl-shell" data-annotation-id="bfcl-ins-pol">
          <table className="bfcl-table"><thead><tr>
            <th>批次</th><th>关联付款单</th><th>车辆数</th><th>交强</th><th>商业</th><th>超赔/货物/驾意</th><th>状态</th><th>操作</th>
          </tr></thead>
          <tbody>{batches.map(b=>{
            const jq = b.status==='已归档' ? b.vehicles : 0;
            const sy = b.status==='已归档' ? b.vehicles : 0;
            const extra = b.status==='已归档' ? Math.max(0, b.policies - jq - sy) : 0;
            return (
            <tr key={b.id}>
              <td className="bfcl-mono bfcl-primary">{b.batchNo}</td>
              <td className="bfcl-mono">{b.payDocNo}</td>
              <td>{b.vehicles}</td>
              <td>{jq || '—'}</td>
              <td>{sy || '—'}</td>
              <td>{extra || '—'}</td>
              <td><V2Badge status={b.status==='已归档'?'success':b.status==='可上传'?'processing':'error'} label={b.status} /></td>
              <td><V2Button variant="outline" size="sm" onClick={()=>uploadBatch(b)}>批量上传保单</V2Button></td>
            </tr>
          );})}</tbody></table>
          <p className="bfcl-muted" style={{padding:14}}>对照 V1.2 保险采购：交强/商业/超赔/货物/驾意一车多保；比价材料可并行，正式归档卡在付款闭环之后。车牌示例：浙A88888F。</p>
        </div>
      )}
      {toast?<div className="bfcl-toast" role="status">{toast}</div>:null}
    </div>
  );
}
