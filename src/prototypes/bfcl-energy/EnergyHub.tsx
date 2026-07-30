import React, { useMemo, useState } from 'react';
import { BfclChainNav } from '../bfcl-shared-chain/BfclChainNav';
import '../bfcl-shared-chain/bfcl-chain-nav.css';
import { V2Button, V2Empty, V2StatusTabs } from '../../resources/design-system/components/UIComponents';
import { V2Badge } from '../../resources/design-system/components/V2Badge';
import { ACCOUNTS, RECHARGES, CUST_BILLS, STATION_BILLS, H2_RECORDS } from './mockData';
import { formatMoney, type EnergyTab, type RechargeRow, type CustBillRow, type StationBillRow, type H2Record } from './types';

export function EnergyHub() {
  const [tab, setTab] = useState<EnergyTab>('账户');
  const [recharges, setRecharges] = useState(RECHARGES);
  const [cust, setCust] = useState(CUST_BILLS);
  const [station, setStation] = useState(STATION_BILLS);
  const [h2, setH2] = useState(H2_RECORDS);
  const [toast, setToast] = useState<string|null>(null);
  const showToast=(m:string)=>{ setToast(m); window.setTimeout(()=>setToast(null),2400); };

  const kpi = useMemo(()=>[
    {label:'能源账户', value:String(ACCOUNTS.length)},
    {label:'待入账充值', value:String(recharges.filter(r=>r.status!=='已入账').length)},
    {label:'客户待收', value:String(cust.filter(c=>c.status!=='已付清').length)},
    {label:'加氢站待付', value:String(station.filter(s=>s.status==='待付款').length)},
  ],[recharges,cust,station]);

  const linkRecharge = (row: RechargeRow) => {
    setRecharges(list=>list.map(r=>r.id===row.id?{...r, linked:r.amount, status:'已入账'}:r));
    showToast('关联收款成功：金额已充入项目能源账户（无户则自动建户）');
  };
  const tryDeduct = (row: H2Record) => {
    if (!row.verified) { showToast('门禁：仅已核对记录可扣账户'); return; }
    if (row.deducted) { showToast('已扣费'); return; }
    setH2(list=>list.map(h=>h.id===row.id?{...h, deducted:true}:h));
    showToast(`已扣费 ¥${formatMoney(row.amount)} · ${row.plate}`);
  };

  return (
    <div className="bfcl-page">
      <BfclChainNav current="energy" />
      <div className="bfcl-toolbar">
        <V2StatusTabs value={tab} onChange={setTab} options={[
          {key:'账户',label:'能源账户'},{key:'充值单',label:'充值/预付'},{key:'客户对账',label:'客户氢费'},{key:'加氢站对账',label:'加氢站'},
        ]} />
        <V2Button variant="secondary" size="sm" onClick={()=>{window.location.href='/prototypes/bfcl-payment-hub/';}}>收付款中枢</V2Button>
      </div>
      <div className="bfcl-kpi">{kpi.map(k=>(
        <div key={k.label} className="bfcl-kpi__card"><span className="bfcl-kpi__label">{k.label}</span><strong className="bfcl-kpi__value">{k.value}</strong></div>
      ))}</div>

      {tab==='账户' && (
        <div className="bfcl-shell" data-annotation-id="bfcl-en-account">
          <table className="bfcl-table"><thead><tr><th>客户</th><th>项目</th><th>余额</th><th>状态</th></tr></thead>
          <tbody>{ACCOUNTS.map(a=>(
            <tr key={a.id}><td className="bfcl-primary">{a.customer}</td><td>{a.project}</td>
            <td className="bfcl-mono">¥{formatMoney(a.balance)}</td>
            <td><V2Badge status={a.status==='正常'?'success':'warning'} label={a.status} /></td></tr>
          ))}</tbody></table>
        </div>
      )}

      {tab==='充值单' && (
        <div className="bfcl-shell" data-annotation-id="bfcl-en-recharge">
          {recharges.length===0?<V2Empty type="empty" title="无充值单" description="" />:(
            <table className="bfcl-table"><thead><tr><th>充值单</th><th>客户</th><th>金额</th><th>已关联</th><th>状态</th><th>操作</th></tr></thead>
            <tbody>{recharges.map(r=>(
              <tr key={r.id}>
                <td className="bfcl-mono bfcl-primary">{r.docNo}</td><td>{r.customer}</td>
                <td className="bfcl-mono">¥{formatMoney(r.amount)}</td>
                <td className="bfcl-mono">¥{formatMoney(r.linked)}</td>
                <td><V2Badge status={r.status==='已入账'?'success':r.status==='部分入账'?'warning':'error'} label={r.status} /></td>
                <td><V2Button variant="outline" size="sm" onClick={()=>{
                  if(r.status==='已入账'){ showToast('已入账'); return; }
                  const nextLinked = r.amount;
                  setRecharges(list=>list.map(x=>x.id===r.id?{...x, linked:nextLinked, status:'已入账'}:x));
                  showToast(`关联收款入账完成 · ${r.docNo}（对照中枢 RC-20260720-008）`);
                }}>关联收款入账</V2Button></td>
              </tr>
            ))}</tbody></table>
          )}
          <div className="bfcl-panel" style={{margin:14,border:'none',background:'var(--pearl)'}}>
            <h2>加氢核对扣费（演示）</h2>
            {h2.map(h=>(
              <div key={h.id} className="bfcl-row">
                <span className="bfcl-mono">{h.plate}</span>
                <span>{h.kg} kg · ¥{formatMoney(h.amount)}</span>
                <V2Badge status={h.verified?'success':'warning'} label={h.verified?'已核对':'未核对'} />
                <V2Button variant="outline" size="sm" onClick={()=>tryDeduct(h)}>{h.deducted?'已扣费':'扣账户'}</V2Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab==='客户对账' && (
        <div className="bfcl-shell">
          <table className="bfcl-table"><thead><tr><th>对账单</th><th>客户</th><th>金额</th><th>已关联</th><th>状态</th><th>操作</th></tr></thead>
          <tbody>{cust.map(c=>(
            <tr key={c.id}>
              <td className="bfcl-mono bfcl-primary">{c.docNo}</td><td>{c.customer}</td>
              <td className="bfcl-mono">¥{formatMoney(c.amount)}</td>
              <td className="bfcl-mono">¥{formatMoney(c.linked)}</td>
              <td><V2Badge status={c.status==='已付清'?'success':c.status==='部分'?'warning':'error'} label={c.status} /></td>
              <td><V2Button variant="outline" size="sm" onClick={()=>{
                if(c.status==='已付清'){ showToast('已付清'); return; }
                setCust(list=>list.map(x=>x.id===c.id?{...x,linked:x.amount,status:'已付清'}:x));
                showToast(`客户氢费对账单 ${c.docNo} 已关联收款（对照中枢）`);
              }}>关联收款</V2Button></td>
            </tr>
          ))}</tbody></table>
        </div>
      )}

      {tab==='加氢站对账' && (
        <div className="bfcl-shell" data-annotation-id="bfcl-en-station">
          <table className="bfcl-table"><thead><tr><th>对账单</th><th>加氢站</th><th>金额</th><th>已关联</th><th>状态</th><th>操作</th></tr></thead>
          <tbody>{station.map(s=>(
            <tr key={s.id}>
              <td className="bfcl-mono bfcl-primary">{s.docNo}</td><td>{s.station}</td>
              <td className="bfcl-mono">¥{formatMoney(s.amount)}</td>
              <td className="bfcl-mono">¥{formatMoney(s.linked)}</td>
              <td><V2Badge status={s.status==='已付款'?'success':'warning'} label={s.status} /></td>
              <td><V2Button variant="outline" size="sm" onClick={()=>{
                if(s.status==='已付款'){ showToast('已付款'); return; }
                setStation(list=>list.map(x=>x.id===s.id?{...x,linked:x.amount,status:'已付款'}:x));
                showToast(`已关联付款明细 ${s.docNo === 'H2S-202607-0005' ? 'PY-20260727-003' : ''} → 标记已付款`);
              }}>关联付款</V2Button></td>
            </tr>
          ))}</tbody></table>
        </div>
      )}
      {toast?<div className="bfcl-toast" role="status">{toast}</div>:null}
    </div>
  );
}
