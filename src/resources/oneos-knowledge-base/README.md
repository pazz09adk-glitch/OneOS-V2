# OneOS 全产品线知识库

面向**企业培训 / 业务手册**与**数字员工（RAG / Agent）**的统一真相层。  
合并 **OneOS V2（本仓库）+ V1.2 Web（legacy 镜像）+ 桌面 ONE-OS 母仓**，提炼可检索规则卡；**不替代**各模块详细 AutoPRD / 使用说明书全文。

## 怎么用

| 角色 | 用法 |
|------|------|
| 人 | 本 README → [素材语料](00-source-corpus.md) / [V1.2 对照表](00-v12-oneos-mapping.md) → 条线总述 → `modules/<id>.md` |
| 数字员工 | **先读** [应答口径](00-digital-employee-voice.md) → `machine/kb-manifest.json` → `machine/rules/<id>.json` |

**硬约束**：机器人对用户讲解规则时，按正式业务系统作答，**禁止**说「原型 / 演示 / 示意」等话术。详见应答口径。

## 覆盖世代

| 世代 | 内容 | 入口 |
|------|------|------|
| V2 | 中期 5+3 架构、AutoPRD、现原型 | [产品总览](00-product-overview.md) |
| V1.2 Web | 业务/运维/财务/加氢/台账/数据分析等页面 | [对照表](00-v12-oneos-mapping.md)、仓库 `oneos-web-legacy` |
| Desktop ONE-OS | `~/Desktop/CURSOR/ONE-OS`：web端、手册、状态说明、小程序、小羚羚、版本规划等 | [素材语料](00-source-corpus.md) |

## 置信度

| 值 | 含义 |
|----|------|
| `confirmed` | 有较完整 V2 AutoPRD / 定稿口径 |
| `architecture` | 由中期架构矩阵推导，待原型/定稿校验 |
| `legacy` | 已从 V1.2 / Desktop ONE-OS 并入 |
| `building` | 建设中或试验页 |

## 目录

```text
00-product-overview.md
00-cross-cutting-rules.md      # §3 业财一体化 → foundations/biz-finance-integration
00-source-corpus.md            # 多世代素材路径
00-v12-oneos-mapping.md        # V1.2/ONE-OS ↔ KB 对照
00-digital-employee-voice.md
lines/ foundations/ platform/
modules/                       # 人读规则卡
machine/kb-manifest.json
machine/rules/*.json
```

### 业财一体化基准（王冕 · 数字分身 / 原型 / 规划）

| 用途 | 入口 |
|------|------|
| 底座规则卡 | [foundations/biz-finance-integration.md](foundations/biz-finance-integration.md) |
| 机读规则 | [machine/rules/biz-finance-integration.json](machine/rules/biz-finance-integration.json) |
| 汇报主稿（简要+详细+流程图） | [`../业财一体化全链条方案-汇报稿.md`](../业财一体化全链条方案-汇报稿.md) |
| 详细条文底稿 | [`../business-finance-closed-loop-briefing.md`](../business-finance-closed-loop-briefing.md) |

数字员工回答收付款、交车门禁、账单逾期、还车应结、能源对账、保险付款时：**先检索上述底座卡**。

## 冲突裁决（摘要）

1. 中期闭环与最新 AutoPRD 优先。  
2. **业财资金闭环与门禁**：以 [foundations/biz-finance-integration.md](foundations/biz-finance-integration.md)（王冕规划基准）为准。  
3. V1.2 操作细节以 Desktop `web端` 为准（仓库 legacy 为镜像）。  
4. 氢费「核对 ≠ 对账」以 V2 现行口径为准。  
5. 未来版本 / 试验页不作为现网强验收；业财待拍板三项未定前勿写死实现。

## 车牌硬口径

形如 `浙A88888F`，禁止中间间隔点。
