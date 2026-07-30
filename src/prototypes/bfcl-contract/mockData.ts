import type { ContractRow } from './types';
export const MOCK: ContractRow[] = [
  { id:'1', contractNo:'ZL-2026-0888', customer:'嘉兴氢途科技', templateName:'标准商用车租赁·V3', nonStandard:false, redlineTouched:false, signPath:'E签宝', status:'已闭环', owner:'陈业管', lockPickup:true, lockBill:true, lockReturn:true },
  { id:'2', contractNo:'ZL-2026-0901', customer:'杭州博众物流', templateName:'标准商用车租赁·V3', nonStandard:true, redlineTouched:true, signPath:'E签宝', status:'非标审批中', owner:'王业管', lockPickup:true, lockBill:true, lockReturn:true },
  { id:'3', contractNo:'ZL-2026-0912', customer:'温州快达货运', templateName:'标准商用车租赁·V3', nonStandard:false, redlineTouched:false, signPath:'线下盖章', status:'催办中', owner:'李业管', lockPickup:true, lockBill:true, lockReturn:true },
  { id:'4', contractNo:'ZL-2026-0920', customer:'绍兴绿能城配', templateName:'KA战略客户模板·V2', nonStandard:false, redlineTouched:false, signPath:'E签宝', status:'待签章', owner:'赵业管', lockPickup:true, lockBill:true, lockReturn:true },
  { id:'5', contractNo:'ZL-DRAFT-011', customer:'宁波港运通', templateName:'标准商用车租赁·V3', nonStandard:false, redlineTouched:false, signPath:'E签宝', status:'草稿', owner:'陈业管', lockPickup:true, lockBill:true, lockReturn:true },
];
