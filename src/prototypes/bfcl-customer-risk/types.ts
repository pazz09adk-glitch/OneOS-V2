export type CustomerTier = 'KA' | 'LA' | 'SMB';
export type RiskLevel = '正常' | '关注' | '高风险';
export type CoopStatus = '已合作' | '终止合作' | '洽谈中' | '合约过期';

export type CustomerRisk = {
  id: string;
  name: string;
  code: string;
  tier: CustomerTier;
  graceDays: number;
  region: string;
  city: string;
  creditCode: string;
  contact: string;
  mobile: string;
  coopStatus: CoopStatus;
  legalScore: number;
  safetyScore: number;
  financeScore: number;
  composite: number;
  redline: boolean;
  riskLevel: RiskLevel;
  owner: string;
  bizDept: string;
  vehicleCount: number;
  overdueDays: number;
  contractsInFlight: number;
  address: string;
};

export type Filters = {
  keyword: string;
  tier: CustomerTier | 'all';
  risk: RiskLevel | 'all';
  coop: CoopStatus | 'all';
};

export type PageMode = 'ledger' | 'detail';

export const TIER_GRACE: Record<CustomerTier, number> = {
  KA: 15,
  LA: 10,
  SMB: 6,
};
