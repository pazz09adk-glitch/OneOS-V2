# 租赁业务条线

**闭环一句话**：客户对接认领与过程管理 → 客户准入评级 → 标准模板签约 → 提车应收对齐交车 → 周期账单核销 → 还车多部门费用结算归档。

## 责任部门

业务管理组（主）、法务、财务、运维（交还车）、安全/能源（还车费用会签）。

## 业财基准

全链条规则见 [foundations/biz-finance-integration.md](../foundations/biz-finance-integration.md)。租赁段不可偏离：

1. **标准合同 → 租赁合同**：法务制式（红线/车型条款/锁定区）；调取模板；改红线或新增→非标；编号唯一；合同即规则锁死；E 签宝或线下盖章回传；未闭环工作台催办常驻。
2. 提车应收付清（或特批）才交车；先/后开票均需发票回传闭环。
3. 账单按**实际交车**起算；每月 25 日生成；KA/LA/SMB 宽限判逾期；收款关联；期末余额埋点。
4. 还车：E 签宝用户签=退租日；应收走收款、应退走付款关联。
5. 客户三维风险：新签可特批；红线或综合分＜10 在途预警，可强制收车（合同条款待拍板）。

## 标准步骤

1. **客户管理**：维护客户与 KA/LA/SMB；法务/财务/安全综合准入与评分。
2. **客户对接过程**：按客户主体认领独占对接、登记跟进；可先认领再准入；保护期释放/转让审批；仅有效归属人可发起合同。
3. **标准合同模板**：法务制式；红线、品牌/车型可见条款附件、锁定区。
4. **租赁合同**：调取模板；非标自动审批；编号唯一；合同即规则；E 签宝或线下回传闭环；新建另校验对接归属。
5. **提车应收**：按 15 日规则自动应收；开票；关联收款；触发运维交车。
6. **租赁业务台账**：首期至月底、二期起自然月；里程减免；安全/运维附加滚下期；关联收款。
7. **还车应结**：还车+E 签宝后汇总费用；关联收/付款；归档。

## 模块索引

| 模块 | 规则卡 | 置信度 |
|------|--------|--------|
| 客户管理 | [customer-management](../modules/customer-management.md) | architecture |
| 客户对接过程 | [customer-engagement](../modules/customer-engagement.md) | architecture |
| 标准合同模板 | [contract-template-management](../modules/contract-template-management.md) | architecture |
| 租赁合同 | [lease-contract-management](../modules/lease-contract-management.md) | confirmed |
| 提车应收 | [vehicle-pickup-receivable](../modules/vehicle-pickup-receivable.md) | architecture |
| 租赁业务台账 | [lease-business-ledger](../modules/lease-business-ledger.md) | architecture |
| 还车应结 | [vehicle-return-settlement](../modules/vehicle-return-settlement.md) | confirmed |
| **业财一体化底座** | [biz-finance-integration](../foundations/biz-finance-integration.md) | architecture |

## 与底座

写入车辆履约态、里程相关节点；首期与周期账单、提车/还车关联收款或付款记录；期末余额服务催款。
