export type SignStatus = '草稿' | '非标审批中' | '待签章' | '催办中' | '已闭环';
export type ContractRow = {
  id: string;
  contractNo: string;
  customer: string;
  templateName: string;
  nonStandard: boolean;
  redlineTouched: boolean;
  signPath: 'E签宝' | '线下盖章';
  status: SignStatus;
  owner: string;
  lockPickup: boolean;
  lockBill: boolean;
  lockReturn: boolean;
};
export type Filters = { keyword: string; status: SignStatus | 'all' };
