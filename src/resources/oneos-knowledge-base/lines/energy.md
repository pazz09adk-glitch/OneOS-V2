# 能源业务条线

**闭环一句话**：供应商与站点建档 → 签约站订单/PLC 或非签约补录 → 对账核对 → 能源账户扣充与财务收/付款核销。

## 责任部门

能源部（主）、财务（核销）、采购（加氢站对账付款）、运维/业务（车辆侧核对与预付关联）。

## 业财基准

全链条规则见 [foundations/biz-finance-integration.md](../foundations/biz-finance-integration.md)。能源段不可偏离：

1. 氢气预付/充值单：关联财务收款后入能源账户；无项目账户则自动建户。
2. 扣费：加氢站上传经能源对账完成，或车辆氢费明细核对完成，才扣账户。
3. 客户月结氢费：能源出对账单 → 财务收款 → 能源关联 → 已付清/部分/未收款。
4. 加氢站：采购出对账单 → 审批付款 → 付款明细关联 → 已付款。客户承担氢费由客户对账，站结算走公司付款。

## 标准步骤

1. **供应商管理**：结算要素、资质；**自动付款主体须上传账户信息**。
2. **加氢站管理**：签约站 vs 非签约站；账号与预付款。
3. **加氢订单**：签约站主动上报 / PLC；可含预约。
4. **车辆氢费明细**：非签约站人工补录（OCR/围栏辅助）；核对后可扣账户。
5. **氢费账户 / 收款 / 对账单**：客户对账关联收款；站对账关联付款。

## 模块索引

| 模块 | 规则卡 | 置信度 |
|------|--------|--------|
| 供应商管理 | [supplier-management](../modules/supplier-management.md) | architecture |
| 加氢站 | [oneos-web-h2-station-site](../modules/oneos-web-h2-station-site.md) | architecture |
| 加氢订单 H5 | [oneos-h5-h2-order](../modules/oneos-h5-h2-order.md) | architecture |
| 车辆氢费明细 | [vehicle-h2-fee-ledger](../modules/vehicle-h2-fee-ledger.md) | architecture |
| 收款记录/氢费账户 | [payment-records](../modules/payment-records.md) | architecture |
| **业财一体化底座** | [biz-finance-integration](../foundations/biz-finance-integration.md) | architecture |

## 与底座

能源成本回填条线盈亏；加氢记录关联车辆档案；资金闭环回写业务状态。

## V1.2 / ONE-OS 补充

| 模块 | 规则卡 |
|------|--------|
| 氢费采购端汇总 | [ledger-h2-procurement-summary](../modules/ledger-h2-procurement-summary.md) |
| 加氢站大屏 | [h2-station-dashboard](../modules/h2-station-dashboard.md) |
