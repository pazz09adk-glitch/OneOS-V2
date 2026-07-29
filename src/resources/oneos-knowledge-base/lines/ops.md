# 运维管理条线

**闭环一句话**：采购/三方合同付款 → 验车入库上牌证照备车 → 交车运营 → 故障维保异动替换 → 还车 → 处置出库归档。

## 责任部门

运维部（主）、采购、业务（交还车协同）、财务（付款）。

## 标准步骤

1. 车辆采购 / 三方租赁合同与付款。
2. 验车入库（车辆识别代码）。
3. 上牌、证照一车一档、临期推送。
4. 备车整备 → 交车（区域派单、培训留痕、电子签）。
5. 运营中：故障、维保、异动/调拨、替换车。
6. 还车现场对比 → 处置出库（出售/过户/报废）。

## 模块索引

| 模块 | 规则卡 | 置信度 |
|------|--------|--------|
| 车辆采购合同 | [vehicle-purchase-contract](../modules/vehicle-purchase-contract.md) | confirmed |
| 验车入库 | [vehicle-inspection](../modules/vehicle-inspection.md) | confirmed |
| 运维综合 | [oneos-web-ops](../modules/oneos-web-ops.md) | architecture |
| 故障处置 | [vehicle-fault-handling](../modules/vehicle-fault-handling.md) | confirmed |
| 故障处置 H5 | [oneos-v2-h5-vehicle-fault-handling](../modules/oneos-v2-h5-vehicle-fault-handling.md) | confirmed |
| 维保明细 | [vehicle-maintenance-ledger](../modules/vehicle-maintenance-ledger.md) | architecture |
| 车辆资产 | [vehicle-management](../modules/vehicle-management.md) | confirmed |
| 保险采购 | [insurance-procurement](../modules/insurance-procurement.md) | confirmed |

## 与底座

全生命周期写入车辆资产；维保/异动成本进盈亏；交还车里程进履约。


## V1.2 拆分模块（已并入）

| 模块 | 规则卡 |
|------|--------|
| 备车 | [ops-vehicle-prepare](../modules/ops-vehicle-prepare.md) |
| 交车 | [ops-vehicle-delivery](../modules/ops-vehicle-delivery.md) |
| 还车 | [ops-vehicle-return](../modules/ops-vehicle-return.md) |
| 替换车 | [ops-vehicle-replace](../modules/ops-vehicle-replace.md) |
| 调拨 | [ops-vehicle-transfer](../modules/ops-vehicle-transfer.md) |
| 年审 | [ops-vehicle-annual-review](../modules/ops-vehicle-annual-review.md) |
| 异动 | [ops-vehicle-relocation](../modules/ops-vehicle-relocation.md) |
| 上牌 | [ops-license-plate](../modules/ops-license-plate.md) |
| 证照 | [ops-certificates](../modules/ops-certificates.md) |
| 后装设备 | [ops-aftermarket-device](../modules/ops-aftermarket-device.md) |
| 备件仓库 | [ops-parts-warehouse](../modules/ops-parts-warehouse.md) |
| 停车场 | [ops-parking-lot](../modules/ops-parking-lot.md) |
| 型号参数 | [ops-vehicle-model](../modules/ops-vehicle-model.md) |
| 三方退租 | [procurement-third-party-exit](../modules/procurement-third-party-exit.md) |
