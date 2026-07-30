import type { AccountRow, RechargeRow, CustBillRow, StationBillRow, H2Record } from './types';
export const ACCOUNTS: AccountRow[] = [
  { id:'a1', customer:'嘉兴氢途科技', project:'临平城配', balance:128600, status:'正常' },
  { id:'a2', customer:'杭州博众物流', project:'萧山干线', balance:8200, status:'低余额' },
  { id:'a3', customer:'宁波港运通', project:'北仑港区', balance:45600, status:'正常' },
];
export const RECHARGES: RechargeRow[] = [
  { id:'r1', docNo:'EA-202607-0011', customer:'嘉兴氢途科技', amount:50000, linked:30000, status:'部分入账' },
  { id:'r2', docNo:'EA-202607-0008', customer:'杭州博众物流', amount:20000, linked:20000, status:'已入账' },
];
export const CUST_BILLS: CustBillRow[] = [
  { id:'c1', docNo:'H2C-202607-0003', customer:'嘉兴氢途科技', amount:18640, linked:0, status:'未收款' },
  { id:'c2', docNo:'H2C-202606-0012', customer:'杭州博众物流', amount:9200, linked:9200, status:'已付清' },
];
export const STATION_BILLS: StationBillRow[] = [
  { id:'s1', docNo:'H2S-202607-0005', station:'临平加氢站', amount:93200, linked:0, status:'待付款' },
  { id:'s2', docNo:'H2S-202606-0009', station:'萧山加氢站', amount:66100, linked:66100, status:'已付款' },
];
export const H2_RECORDS: H2Record[] = [
  { id:'h1', plate:'浙A88888F', kg:28.5, amount:3420, verified:true, deducted:true },
  { id:'h2', plate:'浙A66666D', kg:31.2, amount:3744, verified:true, deducted:false },
  { id:'h3', plate:'浙B12345D', kg:22.0, amount:2640, verified:false, deducted:false },
];
