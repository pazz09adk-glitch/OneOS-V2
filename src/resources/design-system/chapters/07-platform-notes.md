# 07 · Platform Notes（Web / App / 小程序差异）

语义统一，尺寸与壳层分端。下表为默认对照；模块例外写 `.spec`。

---

## 1. 总对照表

| 项 | PC Web | 移动 Web | App / 小程序 |
|----|--------|----------|--------------|
| 主色 | **`#533AFD`**（Stripe Violet） | 同左 | 同左 |
| 正文字号 | 14px | ≥14–16px | ≥16px（输入） |
| 主按钮高 | 36px | ≥40px | ≥44pt/dp |
| 筛选控件高 | 32px | ≥36px | ≥40 |
| 列表 | 表 + 底部分页 | 表横滚或卡片 | 行/卡片 + 刷新/加载更多 |
| 导航 | 侧栏 + 顶栏 | 抽屉或精简顶栏 | TabBar ≤5 + Navbar |
| 弹层 | Modal / Drawer | 全屏或 Sheet | Modal / ActionSheet / Sheet |
| 日期区间筛选 | `DateRangeFilterField` | 同左或分步 | 系统 Picker |
| Focus | 边框变色（vm） | outline 可接受 | 系统焦点/读屏 |
| Hover | 有 | 无（改用 active） | 无 |
| 单位 | px / rem | px | pt / dp / rpx |

---

## 2. Web PC

- 壳层：业务原型嵌入统一运营壳（侧栏当前模块名）。
- 列表强制：`vm-page`、`vehicle-management/style.css`、`TablePagination`、`OperationActions`。
- Ant Design：`ConfigProvider` 使用 `tokens.json` → `antdTheme`。
- 可点击元素：`cursor-pointer`。

---

## 3. 移动 Web / H5 现场端

- Token：与 PC 同源；参考 `field-theme.css`。
- 主按钮 min-height 44px（现场已实践）。
- 优先单列表单；底栏固定主操作 + safe-area。
- 摄像头/相册权限拒绝时给设置引导文案。

---

## 4. 微信小程序

| 项 | 规则 |
|----|------|
| 布局 | 避开右上胶囊；标题区短文案 |
| 单位 | rpx；设计稿以 375 宽为基准 |
| 主题 | 将 `--ln-*` 色值写入小程序 theme / CSS 变量 |
| 导航 | `tabBar` 选中色 = primary；项数 ≤5 |
| 分享 | 分享图与文案不影响主操作区 |
| 列表 | 与 App 模式一致（刷新 + 加载更多或分页二选一） |

---

## 5. 原生 App（iOS / Android）

| 项 | 规则 |
|----|------|
| 字体 | 优先系统字体，字号阶梯对齐 Foundations |
| 安全区 | 必须垫 inset；底栏/Tab 不被 Home Indicator 挡住 |
| 返回 | iOS 边缘滑动返回与顶栏返回并存；Android 物理返回 = 取消/上一页 |
| 手势 | 不重新定义系统手势；左滑删除需可见入口兜底 |
| 触感 | 仅关键确认 |
| 动态字号 | 允许放大；截断策略见 Foundations |
| Token 导出 | JSON 同 `tokens.json`；尺寸列增加 `ios`/`android` 字段（见 08） |

---

## 6. 导航差异细则

### Web

- 顶栏：全局搜索、消息铃铛、用户菜单；角标用 Badge。
- 面包屑：外壳顶栏/标签页已承担模块定位时，**表单/详情页头不要再挂「条线 / 模块」路径**（见 `DESIGN.md` §4.8）；仅深层设置等多层嵌套场景可酌情使用独立面包屑。
- 正文不重复侧栏模块大标题。

### App / 小程序

- Tab 选中：图标 + 文字主色。
- Navbar 右侧 ≤2 操作。
- 深链进入须能返回合理上一层（无栈则回首页 Tab）。

---

## 7. 分发与工程

| 端 | 样式入口 |
|----|----------|
| Web 列表 | `vehicle-management/style.css` |
| 规范 CSS 变量 | `src/resources/design-system/oneos-ds-tokens.css` |
| H5/App 原型 | `field-theme.css`（须与 tokens 同步） |
| 小程序 | 构建时拷贝 tokens 色值 |

修改 Token 时：**同轮**更新 `tokens.json`、`oneos-ds-tokens.css`、现场 `field-theme.css` 主色相关变量。

---

## Do / Don't

### Do

- 跨端用同一套语义名与色值。
- 在对照表内选型，不发明第四种按钮高度体系。

### Don't

- 不要在小程序使用仅 Web 的 hover 交互当唯一入口。
- 不要阻断系统返回手势。
