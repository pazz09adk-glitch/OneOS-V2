/**
 * 业财八页共用故事锚点（原型串联用）。
 * 主故事：杭州博众物流 · 浙A88888F · 合同 ZL-2026-0901
 */
export const CHAIN = {
  customerBoZhong: '杭州博众物流',
  customerJiaXing: '嘉兴氢途科技',
  customerNingBo: '宁波港运通',
  customerWenZhou: '温州快达',
  customerStation: '临平加氢站',
  customerInsurance: '中国人保财险浙江分公司',
  plateMain: '浙A88888F',
  contractBoZhong: 'ZL-2026-0901',
  contractJiaXing: 'ZL-2026-0888',
  pickup: { docNo: 'PR-202607-0018', amount: 28600, receipt: 'RC-20260728-001' },
  leaseBill: { docNo: 'LB-202607-0042', amount: 45200, receipt: 'RC-20260725-014' },
  energyRecharge: { docNo: 'EA-202607-0011', amount: 50000, linked: 30000, receipt: 'RC-20260720-008' },
  energyCust: { docNo: 'H2C-202607-0003', amount: 18640 },
  energyStation: { docNo: 'H2S-202607-0005', amount: 93200, payment: 'PY-20260727-003' },
  returnRecv: { docNo: 'RS-202607-0007', amount: 12800, plate: '浙B12345D' },
  returnRefund: { docNo: 'RS-202607-0009', amount: 20000, plate: '浙C66666', payment: 'PY-20260718-006' },
  insurance: { docNo: 'INS-PAY-202607-02', amount: 168000, payment: 'PY-20260722-011' },
} as const;

export const CHAIN_NAV: { id: string; label: string; href: string }[] = [
  { id: 'risk', label: '客户风险', href: '/prototypes/bfcl-customer-risk/' },
  { id: 'contract', label: '租赁合同', href: '/prototypes/bfcl-contract/' },
  { id: 'pickup', label: '提车应收', href: '/prototypes/bfcl-pickup-receivable/' },
  { id: 'bill', label: '租赁账单', href: '/prototypes/bfcl-lease-bill/' },
  { id: 'return', label: '还车应结', href: '/prototypes/bfcl-return/' },
  { id: 'energy', label: '能源氢费', href: '/prototypes/bfcl-energy/' },
  { id: 'insurance', label: '保险采购', href: '/prototypes/bfcl-insurance/' },
  { id: 'pay', label: '收付款中枢', href: '/prototypes/bfcl-payment-hub/' },
];
