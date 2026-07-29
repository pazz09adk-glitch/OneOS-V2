# 08 · Tokens 附录

机器可读完整快照见 [`../tokens.json`](../tokens.json)。  
CSS 入口见 [`../oneos-ds-tokens.css`](../oneos-ds-tokens.css)。

---

## 1. 文件关系

```text
tokens.json          ← 跨工具 / AI / 导出
oneos-ds-tokens.css  ← Web/H5 :root 变量
vehicle-management/style.css  ← 列表组件实现（仍引用 --ln-* / --vm-*）
field-theme.css      ← 现场端，必须与主色表一致
```

## 2. 色板摘要

见 [01-foundations §2](./01-foundations.md)。主色 **`#533AFD`**（Stripe Violet；母版 LeaseContractHub）。

## 3. 间距 / 圆角 / 控件

| Key | Value |
|-----|-------|
| space.1–12 | 4–48px scale |
| radius.control | 8px |
| radius.card | 12px |
| radius.sheet | 16px 16px 0 0 |
| size.control.web | 32px |
| size.button.web | 36px |
| size.button.app | 44px |
| size.touchMin | 44px |

## 4. Ant Design 映射

使用 `tokens.json` → `antdTheme`：

- `colorPrimary` / `colorLink` → `#533AFD`
- `borderRadius` → 8
- `fontSize` → 14
- Table `headerBg` → `#f6f7f7`

组件级覆盖按需追加，禁止页面内另写一套 primary。

## 5. 小程序导出示例

```json
{
  "brandPrimary": "#533AFD",
  "brandPrimaryLight": "#e8f5ef",
  "textPrimary": "#18181b",
  "textSecondary": "#52525b",
  "textMuted": "#71717a",
  "bgPage": "#f5f6f6",
  "bgCard": "#ffffff",
  "border": "#e5e7eb",
  "success": "#27a644",
  "warning": "#d97706",
  "error": "#e5484d"
}
```

## 6. 原生导出字段约定

```json
{
  "color.primary": { "hex": "#533AFD", "ios": "UIColor", "android": "Color" },
  "size.buttonHeight": { "web": 36, "ios": 44, "android": 48 }
}
```

具体平台 Color Asset 命名由客户端工程约定，**hex 必须以 tokens.json 为准**。

## 7. 阴影

| Token | CSS |
|-------|-----|
| soft | `0 1px 2px rgba(24, 24, 27, 0.06)` |
| hover | `0 8px 24px rgba(24, 24, 27, 0.1)` |
| float | `0 12px 32px rgba(24, 24, 27, 0.12)` |
| modal | `0 20px 40px rgba(24, 24, 27, 0.14)` |

## 8. 动效 Token

| Key | Value |
|-----|-------|
| duration.fast | 150ms |
| duration.normal | 200ms |
| duration.slow | 300ms |
| easing.standard | ease-out |

---

## 维护

改色或尺寸时同步：

1. `tokens.json`
2. `oneos-ds-tokens.css`
3. `01-foundations.md` / 本附录数值
4. `field-theme.css`（若影响现场）
5. 必要时 `vehicle-management/style.css`
