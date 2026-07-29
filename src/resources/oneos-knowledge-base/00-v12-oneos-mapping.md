# V1.2 / ONE-OS ↔ V2 知识库对照表

> 世代：`legacy` = Desktop ONE-OS + 仓库 oneos-web-legacy；`v2` = 本仓库 AutoPRD/原型。

## 状态图例

| 状态 | 含义 |
|------|------|
| migrated | V2 已有规则卡，V1.2 作操作细节补充 |
| split | V1.2 多页，在 V2 中收拢为综合模块或待拆 |
| legacy_only | 目前主要以 V1.2/ONE-OS 为准并入知识库 |
| external | 小羚羚/小程序等外延产品 |
| handbook | 说明型（非办结页） |

## 租赁 / 业务管理

| V1.2 / ONE-OS 页面 | V2 / KB 模块 | 状态 |
|--------------------|--------------|------|
| 客户管理* | customer-management | migrated |
| 供应商管理* | supplier-management | migrated |
| 合同模板管理 | contract-template-management | migrated |
| 车辆租赁合同* | lease-contract-management | migrated |
| 交车任务* | oneos-web-ops / ops-vehicle-delivery | split |
| 租赁账单* | lease-business-ledger | migrated |
| 保险采购 | insurance-procurement | migrated |
| ETC管理 | biz-etc-management | legacy_only |
| 车辆成本维护 | biz-vehicle-cost | legacy_only |

## 财务

| V1.2 | V2 / KB | 状态 |
|------|---------|------|
| 提车应收款* | vehicle-pickup-receivable | migrated |
| 还车应结款* | vehicle-return-settlement | migrated |
| 租赁账单（财务侧） | lease-business-ledger / payment-records | split |

## 加氢 / 台账

| V1.2 | V2 / KB | 状态 |
|------|---------|------|
| 站点信息 | oneos-web-h2-station-site | migrated（V1.2 PRD 更深） |
| 加氢订单 / 加氢记录 | oneos-h5-h2-order | migrated |
| 车辆氢费明细 | vehicle-h2-fee-ledger | migrated（注意核对≠对账） |
| 氢费采购端汇总 | ledger-h2-procurement-summary | legacy_only |
| 保险分摊明细 | ledger-insurance-allocation | legacy_only |
| 租赁业务台账 | lease-business-ledger | migrated |
| 车辆维修明细 | vehicle-maintenance-ledger | migrated |

## 运维

| V1.2 | V2 / KB | 状态 |
|------|---------|------|
| 车辆管理 | vehicle-management | migrated |
| 备车/交车/还车/替换/调拨/年审/异动/故障/上牌/证照 | oneos-web-ops + 下列拆分卡 | split |
| 后装设备 | ops-aftermarket-device | legacy_only |
| 备件库存/仓库 | ops-parts-warehouse | legacy_only |
| 停车场管理 | ops-parking-lot | legacy_only |
| 型号参数 | ops-vehicle-model | legacy_only |
| 三方退租 | procurement-third-party-exit | legacy_only |
| 安全培训扫码 | safety-training-scan | legacy_only |

## 数据分析 / 平台

| V1.2 | V2 / KB | 状态 |
|------|---------|------|
| 物流业务台账等报表 | analytics-business-ledgers | legacy_only |
| 工作台 | oneos-web-workbench-new | migrated |
| 帮助中心 | help-center | legacy_only |
| 登录 | oneos-mobile-app / 平台登录 | split |

## Desktop ONE-OS 外延

| 能力 | KB 模块 | 状态 |
|------|---------|------|
| 车辆状态说明（五维） | vehicle-status-handbook | handbook |
| 移动端运管（手册） | oneos-mobile-app | external |
| 小程序 | oneos-miniprogram | external |
| 小羚羚交车 | xiaolingling-delivery | external |
| 加氢站大屏 | h2-station-dashboard | legacy_only |
| 版本完成与规划 | version-roadmap | handbook |
| CRM/ERP 试验页 | oneos-web-crm-erp-sandbox | building |

详细操作以各 `modules/*.md` 为准。
