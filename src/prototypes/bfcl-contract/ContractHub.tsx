import React, { useMemo, useState } from 'react';
import { BfclChainNav } from '../bfcl-shared-chain/BfclChainNav';
import '../bfcl-shared-chain/bfcl-chain-nav.css';
import { Filter, RotateCcw } from 'lucide-react';
import { DetailEntryLink } from '../../common/DetailEntryLink';
import { OperationActions } from '../../common/OperationActions';
import { V2Button, V2Empty, V2FilterMoreButton, V2FilterSearch, V2Pagination, V2Select, V2StatusTabs } from '../../resources/design-system/components/UIComponents';
import { V2Badge, type V2BadgeStatus } from '../../resources/design-system/components/V2Badge';
import { MOCK } from './mockData';
import type { ContractRow, Filters, SignStatus } from './types';

const badge = (s: SignStatus): V2BadgeStatus => {
  if (s === '已闭环') return 'success';
  if (s === '催办中' || s === '非标审批中') return 'error';
  if (s === '待签章') return 'warning';
  return 'default';
};

export function ContractHub() {
  const [rows, setRows] = useState(MOCK);
  const [mode, setMode] = useState<'ledger'|'detail'>('ledger');
  const [tab, setTab] = useState<SignStatus|'all'>('all');
  const [filters, setFilters] = useState<Filters>({ keyword:'', status:'all' });
  const [draft, setDraft] = useState(filters);
  const [moreOpen, setMoreOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [activeId, setActiveId] = useState<string|null>(null);
  const [toast, setToast] = useState<string|null>(null);
  const showToast = (m: string) => { setToast(m); window.setTimeout(()=>setToast(null), 2400); };

  const filtered = useMemo(() => rows.filter(r => {
    if (tab!=='all' && r.status!==tab) return false;
    if (filters.status!=='all' && r.status!==filters.status) return false;
    if (filters.keyword) {
      const q = filters.keyword.trim().toLowerCase();
      if (![r.contractNo,r.customer,r.templateName,r.owner].join(' ').toLowerCase().includes(q)) return false;
    }
    return true;
  }), [rows, filters, tab]);

  const kpi = useMemo(() => [
    { label:'催办常驻', value:String(rows.filter(r=>r.status==='催办中').length), tab:'催办中' as const },
    { label:'非标审批', value:String(rows.filter(r=>r.status==='非标审批中').length), tab:'非标审批中' as const },
    { label:'待签章', value:String(rows.filter(r=>r.status==='待签章').length), tab:'待签章' as const },
    { label:'已闭环', value:String(rows.filter(r=>r.status==='已闭环').length), tab:'已闭环' as const },
  ], [rows]);

  const pageRows = filtered.slice((page-1)*pageSize, page*pageSize);
  const active = rows.find(r=>r.id===activeId) ?? null;
  const patch = (n: ContractRow) => { setRows(l=>l.map(r=>r.id===n.id?n:r)); setActiveId(n.id); };

  if (mode==='detail' && active) {
    return (
      <div className="bfcl-detail">
      <BfclChainNav current="contract" />
        <header className="bfcl-form-header">
          <V2Button variant="back" size="sm" onClick={()=>{setMode('ledger'); setActiveId(null);}}>返回列表</V2Button>
          <span className="bfcl-form-header__divider" />
          <div className="bfcl-form-header__title-wrap">
            <h1 className="bfcl-form-header__title">租赁合同 · 签约锁死</h1>
            <span className="bfcl-form-header__pill">{active.contractNo}</span>
          </div>
          <div className="bfcl-form-header__actions">
            <V2Button variant="secondary" size="sm" onClick={()=>{
              if (active.redlineTouched) { patch({...active, status:'非标审批中', nonStandard:true}); showToast('改动风控红线：已进入非标审批'); }
              else showToast('当前未改红线，可走标准路径');
            }}>模拟改红线</V2Button>
            <V2Button variant="primary" size="sm" onClick={()=>{
              if (active.status==='催办中' || active.status==='待签章') {
                patch({...active, status:'已闭环'}); showToast('签章闭环完成，催办任务消除');
              } else if (active.status==='已闭环') showToast('已闭环');
              else showToast('请先完成审批/发起签章');
            }}>完成签章闭环</V2Button>
          </div>
        </header>
        <section className="bfcl-context" data-annotation-id="bfcl-ct-status">
          <div><span className="bfcl-muted">客户</span><strong>{active.customer}</strong></div>
          <div><span className="bfcl-muted">模板</span><strong>{active.templateName}</strong></div>
          <div><span className="bfcl-muted">签章路径</span><strong>{active.signPath}</strong></div>
          <div><span className="bfcl-muted">状态</span><V2Badge status={badge(active.status)} label={active.status} /></div>
        </section>
        <div className="bfcl-split">
          <section className="bfcl-panel" data-annotation-id="bfcl-ct-lock">
            <h2>合同即规则 · 一对一锁死</h2>
            <ul>
              <li>提车应收规则：{active.lockPickup ? '已锁死' : '未锁'}</li>
              <li>租赁账单规则：{active.lockBill ? '已锁死' : '未锁'}</li>
              <li>还车应结 / 里程：{active.lockReturn ? '已锁死' : '未锁'}</li>
              <li>编号系统唯一（历史重复待治理拍板）</li>
            </ul>
          </section>
          <section className="bfcl-panel">
            <h2>标准合同前置</h2>
            <ul>
              <li>法务制式：风控红线 / 品牌车型可见条款附件 / 锁定区</li>
              <li>改红线或新增内容 → 自动非标审批</li>
              <li>线上 E 签宝双章；线下分享不可篡改文件 → 法务补附件</li>
              <li>未闭环：工作台催办任务常驻</li>
            </ul>
            <div style={{display:'flex',gap:8,marginTop:12,flexWrap:'wrap'}}>
              <V2Button variant="outline" size="sm" onClick={()=>{ patch({...active, status:'催办中', signPath:'线下盖章'}); showToast('已生成线下盖章催办（常驻）'); }}>线下盖章催办</V2Button>
              <V2Button variant="secondary" size="sm" onClick={()=>{ window.location.href='/prototypes/lease-contract-management/'; }}>打开旧版合同台账</V2Button>
            </div>
          </section>
        </div>
        {toast ? <div className="bfcl-toast" role="status">{toast}</div> : null}
      </div>
    );
  }

  return (
    <div className="bfcl-page">
      <BfclChainNav current="contract" />
      <div className="bfcl-toolbar">
        <V2StatusTabs value={tab} onChange={(v)=>{setTab(v); setPage(1);}} options={[
          {key:'all',label:'全部'},{key:'草稿',label:'草稿'},{key:'非标审批中',label:'非标'},{key:'待签章',label:'待签章'},{key:'催办中',label:'催办'},{key:'已闭环',label:'已闭环'},
        ]} />
      </div>
      <div className="bfcl-kpi">{kpi.map(k=>(
        <button key={k.label} type="button" className="bfcl-kpi__card" onClick={()=>{ if(k.tab){setTab(k.tab); setPage(1);} }}>
          <span className="bfcl-kpi__label">{k.label}</span><strong className="bfcl-kpi__value">{k.value}</strong>
        </button>
      ))}</div>
      <div className="bfcl-shell">
        <div className="bfcl-tools v2-filter-toolbar-tools">
          <V2FilterSearch aria-label="搜索合同"><input type="text" placeholder="合同号 / 客户 / 模板" value={draft.keyword} onChange={e=>setDraft(d=>({...d,keyword:e.target.value}))} onKeyDown={e=>{if(e.key==='Enter'){setFilters(draft); setMoreOpen(false); setPage(1);}}} /></V2FilterSearch>
          <V2FilterMoreButton open={moreOpen} activeCount={draft.status!=='all'?1:0} onClick={()=>setMoreOpen(o=>!o)} />
          <V2Button variant="primary" size="sm" icon={<Filter size={14} />} onClick={()=>{setFilters(draft); setMoreOpen(false); setPage(1);}}>查询</V2Button>
          <V2Button variant="secondary" size="sm" icon={<RotateCcw size={14} />} onClick={()=>{const e={keyword:'',status:'all' as const}; setDraft(e); setFilters(e); setTab('all'); setMoreOpen(false); setPage(1);}}>重置</V2Button>
        </div>
        {moreOpen ? <div className="bfcl-more"><div className="bfcl-field"><label>状态</label><V2Select value={draft.status} onChange={v=>setDraft(d=>({...d,status:v as Filters['status']}))} options={[{value:'all',label:'全部'},{value:'草稿',label:'草稿'},{value:'非标审批中',label:'非标审批中'},{value:'待签章',label:'待签章'},{value:'催办中',label:'催办中'},{value:'已闭环',label:'已闭环'}]} /></div></div> : null}
        {pageRows.length===0 ? <V2Empty type="empty" title="无匹配合同" description="调整筛选" /> : (
          <table className="bfcl-table"><thead><tr><th>合同号</th><th>客户</th><th>模板</th><th>签章</th><th>非标</th><th>状态</th><th>操作</th></tr></thead>
          <tbody>{pageRows.map(r=>(
            <tr key={r.id}>
              <td>
                <DetailEntryLink
                  variant="code"
                  ariaLabel={`${r.contractNo}，点击进入合同详情`}
                  onClick={() => { setActiveId(r.id); setMode('detail'); }}
                >
                  {r.contractNo}
                </DetailEntryLink>
              </td>
              <td>{r.customer}</td><td>{r.templateName}</td><td>{r.signPath}</td>
              <td>{r.nonStandard?'是':'否'}</td>
              <td><V2Badge status={badge(r.status)} label={r.status} /></td>
              <td><OperationActions process={{label:'办理', onClick:()=>{setActiveId(r.id); setMode('detail');}}} view={{label:'详情', onClick:()=>{setActiveId(r.id); setMode('detail');}}} /></td>
            </tr>
          ))}</tbody></table>
        )}
      </div>
      <div className="bfcl-pager"><V2Pagination total={filtered.length} page={page} pageSize={pageSize} onChange={(p,ps)=>{setPage(p); setPageSize(ps);}} /></div>
      {toast ? <div className="bfcl-toast" role="status">{toast}</div> : null}
    </div>
  );
}
