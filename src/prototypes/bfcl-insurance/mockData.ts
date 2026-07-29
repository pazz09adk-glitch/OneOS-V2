import type { Supplier, InsPay, PolicyBatch } from './types';
export const SUPPLIERS: Supplier[] = [
  { id:'s1', name:'中国人保财险浙江分公司', accountOk:true, bank:'工行杭州分行', accountNo:'1202 **** 8899' },
  { id:'s2', name:'中国平安财险杭州中支', accountOk:false, bank:'—', accountNo:'未维护' },
  { id:'s3', name:'太平洋财险浙江分公司', accountOk:true, bank:'建行西湖支行', accountNo:'3305 **** 1122' },
];
export const PAYS: InsPay[] = [
  { id:'p1', docNo:'INS-PAY-202607-02', supplier:'中国人保财险浙江分公司', amount:168000, status:'已闭环', accountBlocked:false },
  { id:'p2', docNo:'INS-PAY-202607-05', supplier:'太平洋财险浙江分公司', amount:92000, status:'待付款', accountBlocked:false },
  { id:'p3', docNo:'INS-PAY-202607-06', supplier:'中国平安财险杭州中支', amount:45000, status:'待比价', accountBlocked:true },
];
export const BATCHES: PolicyBatch[] = [
  { id:'b1', batchNo:'POL-BATCH-07', payDocNo:'INS-PAY-202607-02', vehicles:12, policies:24, status:'已归档' },
  { id:'b2', batchNo:'POL-BATCH-08', payDocNo:'INS-PAY-202607-05', vehicles:8, policies:0, status:'不可上传' },
];
