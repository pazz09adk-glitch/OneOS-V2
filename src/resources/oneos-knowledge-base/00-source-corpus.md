# 知识库素材语料（多世代）

本知识库合并三类真相源，供企业与数字员工统一检索。

## A. OneOS V2（本仓库）

| 类型 | 路径 |
|------|------|
| **业财一体化全链条（规划/原型/数字分身基准）** | `src/resources/业财一体化全链条方案-汇报稿.md` · `src/resources/business-finance-closed-loop-briefing.md` · KB `foundations/biz-finance-integration.md` |
| 中期架构 | `src/resources/prd/oneos-midterm-architecture-and-requirements-autoprd.md` |
| AutoPRD | `src/resources/prd/*-autoprd.md` |
| 故事地图 | `src/resources/oneos-story-map/` |
| V2 原型 | `src/prototypes/` |

## B. 仓库内 V1.2 镜像

| 类型 | 路径 |
|------|------|
| Web 端页面与需求碎片 | `src/resources/oneos-web-legacy/` |
| 说明 | 与桌面工程 `web端` 基本同源（约 113 页 JSX） |

## C. 桌面 ONE-OS 工程（完整 V1.x 母仓）

**根路径**：`~/Desktop/CURSOR/ONE-OS`

| 子域 | 路径 | 用途 |
|------|------|------|
| Web 端（V1.2 主站） | `~/Desktop/CURSOR/ONE-OS/web端/` | 业务管理/运维/财务/加氢/台账/数据分析等 |
| 用户手册初稿 | `~/Desktop/CURSOR/ONE-OS/docs/ONE-OS-用户使用手册-初稿.md` | 移动端登录/待办/业务入口 |
| 车辆状态说明 | `~/Desktop/CURSOR/ONE-OS/ONEOS-web/车辆状态说明-产品需求文档.md` | 五维状态体系 |
| 版本规划 | `~/Desktop/CURSOR/ONE-OS/OneOS项目版本完成情况及未来版本规划.jsx` | 资产轨/业财轨路线图 |
| 小羚羚交车 | `~/Desktop/CURSOR/ONE-OS/docs/小羚羚-交车-产品需求文档.md` | 外部交车数字化 |
| 设计规范 | `~/Desktop/CURSOR/ONE-OS/docs/ONE-OS-DESIGN-SPEC.md` 等 | 视觉（知识库不展开 UI） |
| ONEOS-web 扩展 | `~/Desktop/CURSOR/ONE-OS/ONEOS-web/` | CRM/ERP/大屏/状态说明 |
| OneOS2.0 试验 | `~/Desktop/CURSOR/ONE-OS/OneOS2.0/` | 合同模板/签约主体等早期试验 |
| 小程序 | `~/Desktop/CURSOR/ONE-OS/ONE-OS小程序/` | 运维现场端 |
| 小羚羚方案 | `~/Desktop/CURSOR/ONE-OS/小羚羚/` | 产业数字化方案原型 |

## 冲突裁决

1. **业务闭环与中期方向**：以 V2 中期架构 / 最新 AutoPRD 为准。  
2. **业财资金闭环与门禁**：以 `foundations/biz-finance-integration.md` 及汇报主稿为准（王冕产品口径）。  
3. **V1.2 页面操作细节**：以 `~/Desktop/CURSOR/ONE-OS/web端` + 同目录产品需求说明为准；仓库 `src/resources/oneos-web-legacy` 作镜像。  
4. **氢费核对/对账用词**：以 V2 `vehicle-h2-fee-ledger` / H5 加氢订单现行口径为准，legacy 氢费文档中旧「对账」命名勿覆盖。  
5. **已下线能力**：以工作台/版本规划标注为准，规则卡标 `deprecated` 风险。
