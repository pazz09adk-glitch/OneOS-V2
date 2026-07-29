# 00 · 总则与端矩阵

| 项 | 说明 |
|---|---|
| 文档版本 | **v2.2**（对齐租赁合同母版 · Stripe Violet） |
| 适用范围 | OneOS 统一运营管理平台（PC Web）+ App（原生 iOS/Android）+ 微信小程序 + H5 现场端 |
| 视觉基底 | Stripe Fintech UI + Linear 结构；主色 **`#533AFD`** |
| 页面母版 | `src/prototypes/lease-contract-management/LeaseContractHub.tsx` |
| 人类事实源 | 本目录 `chapters/*.md` + 根 [`DESIGN.md`](../DESIGN.md) + [`oneos-v2/DESIGN.md`](../../prototypes/oneos-v2/DESIGN.md) |
| 机器事实源 | [`tokens.json`](../tokens.json) + [`oneos-ds-tokens.css`](../oneos-ds-tokens.css) |
| Web 台账壳 | 对标母版三视图；存量 `vm-page` 列表迁入时先换 Token，再升三视图 |
| 现场端参考 | `src/prototypes/vehicle-inspection-*/field-theme.css`（迁 V2 时主色改为 Violet） |

---

## 1. 目标

约束页面显示、组件、字体、主题色、列表、表单、栅格、分页等，使 **语义统一、视觉同源、尺寸可分端**，杜绝各页私自造色/造字号/造分页。

OneOS V2 新页与迁入页：**必须对标租赁合同台账母版**，禁止再引入品牌绿 / 若依蓝作为主色。

## 2. 事实源层级（强制）

```text
页面母版（LeaseContractHub）
    → Design Tokens（色/字/间距/圆角/阴影）
        → 基础组件（Button / Input / Table …）
            → 页面模板（列表 / 看板 / 主从 / App 壳 …）
                → 业务扩展（.spec 写明的例外）
```

| 层级 | 可改谁 | 禁止 |
|------|--------|------|
| 母版 / Token | 设计规范维护者 | 业务页硬编码第二主色 |
| 组件 | 公共组件库 | 复制粘贴改皮肤的私有分页/多选 |
| 模板 | 规范 + 模块 DESIGN | 自由拼装破坏标准三视图 DOM |
| 业务例外 | 该原型 `.spec/*.md` | 静默破例不写文档 |

## 3. 端矩阵

| 端 | 代号 | 典型场景 | 共享规则 | 分端规则 |
|----|------|----------|----------|----------|
| PC Web | `web-pc` | 中后台列表、台账、审批、工作台 | Token 语义、三视图模板、文案词典 | 侧栏、表格、32/36 控件高 |
| 移动 Web | `web-mobile` | 窄屏浏览器、部分 H5 | 同上 | 断点折叠、热区 ≥40px |
| H5 现场端 | `h5-field` | 验车/巡检等独立 H5 | 主色与中性色同源（Violet） | 底栏主按钮、扫码/拍照 |
| 微信小程序 | `mp-weixin` | 小羚羚等 | 同源 Token 名 | 胶囊避让、rpx、TabBar |
| 原生 App | `app-native` | iOS / Android | 同源语义 | 安全区、pt/dp、系统字体、手势 |

**原则**：同名组件含义一致（「主按钮」「危险操作」）；尺寸与容器可分端。禁止「同名三端三种含义」。

## 4. Token 命名

| 体系 | 用途 | 示例 |
|------|------|------|
| `--ln-*` | 视觉语义（品牌/中性/状态） | `--ln-primary` = `#533AFD` |
| `--vm-*` | Web 列表壳层控件尺寸/字体 | `--vm-btn-height` |
| `--oneos-ds-*` | 本规范 CSS 入口别名（映射到 `--ln-*`） | `--oneos-ds-color-primary` |

新代码优先写 `--ln-*` 或通过 `oneos-ds-tokens.css` 引入。  
**禁止**将 `#32a06e`、`#10b981`、`#409EFF` 作为 V2 主色。

## 5. 版本与变更

- 规范版本：semver（当前 **2.2.0**，主色与母版对齐）
- Token 破坏性变更必须：改 `tokens.json` → CSS → 各章数值 → `PRIORITY` / 修订记录
- 每章保留 **Do / Don't**；禁止项优先级高于推荐项

## 6. 品牌与气质边界

| 允许 | 禁止 |
|------|------|
| Stripe Violet 主色 + Fintech 微边框 | 另起绿/蓝主色、营销风大插画首屏 |
| 中后台信息密度：标准 / 略紧（台账） | emoji 作功能图标 |
| Lucide / Heroicons 等 SVG | 页面级另起主题色 |
| 浅色 + 暗色双模式（母版已支持） | 外壳与内容主题失配 |

## 7. 落地载体

| 载体 | 路径 |
|------|------|
| 页面母版 | `src/prototypes/lease-contract-management/LeaseContractHub.tsx` |
| V2 项目规范 | `src/prototypes/oneos-v2/DESIGN.md` |
| 迁页清单 | `src/prototypes/oneos-v2/.spec/migration-from-1.2.md` |
| Markdown 规范 | `src/resources/design-system/chapters/` |
| JSON Token | `src/resources/design-system/tokens.json` |
| CSS Variables | `src/resources/design-system/oneos-ds-tokens.css` |
| AI 提示 | `ai-prompt-template.md` |

## 8. AI / 开发强制引用

生成或改 UI 前必须阅读：

1. 母版 `LeaseContractHub.tsx`
2. [`oneos-v2/DESIGN.md`](../../prototypes/oneos-v2/DESIGN.md) + 根 [`DESIGN.md`](../DESIGN.md)
3. 本文件 + [`01-foundations.md`](./01-foundations.md)
4. 对应页面类型的 [`04-patterns.md`](./04-patterns.md)
5. [`tokens.json`](../tokens.json)
