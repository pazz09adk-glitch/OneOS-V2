# Ant Design（AntD）设计规范导出（v5）

> 说明：本文档基于 Ant Design v5 官方文档与设计令牌（Design Token）整理，用于项目内统一 UI 口径。若与线上文档不一致，以官方文档与实际 `token` 输出为准。
>
> 参考：
> - Ant Design 文档：`https://ant.design/docs/react/introduce`
> - 主题定制（Design Token）：`https://ant.design/docs/react/customize-theme`
> - CSS Variables：`https://ant.design/docs/react/css-variables`

## 1. 设计原则（适用于业务后台）

- **清晰**：信息层级明确（标题/正文/辅助信息/弱提示），减少不必要装饰。
- **一致**：同类型组件在同场景下外观与交互一致（按钮语义、表单校验、弹窗页脚等）。
- **高效**：高频任务优先（表格筛选、快捷操作、批量处理），减少路径长度。
- **可控**：可预期的反馈（加载/成功/失败/空态），避免“无响应”与不可逆操作。

## 2. 视觉基础（Design Token 口径）

### 2.1 色彩（Color）

#### 语义色（常用）

- **主色（Primary）**：品牌/主要操作按钮/高亮状态  
  - AntD v5 默认：`colorPrimary = #1677ff`
- **成功（Success）**：成功态、完成态、正向结果
- **警告（Warning）**：需要注意但不阻断流程
- **错误（Error）**：失败、阻断、危险操作
- **信息（Info）**：中性提示（一般与 Primary 同系或更弱）

#### 文本与背景（建议层级）

- **正文主文本**：用于标题、正文关键值
- **次级文本**：用于说明、辅助信息
- **弱文本**：用于占位、不可用、次要信息
- **容器背景**：页面背景、卡片/表格容器背景
- **分割/边框**：分割线、边框、表格网格线

> 落地建议：**不要直接手写颜色值**，优先使用 AntD token（如 `colorText` / `colorBgContainer` / `colorBorder` / `colorPrimary`），避免暗色模式或主题切换时失控。

### 2.2 字体（Typography）

- **基础字号**：AntD v5 默认 `fontSize = 14px`
- **字号体系**：在正文 14 的基础上，常用 `12/14/16/20/24`（具体以 token 为准）
- **字重**：正文 400，标题/强调 500/600（按设计与字体实际支持）
- **行高**：正文建议 1.4–1.6 区间；表格/表单密集场景可略收紧但要保证可读性

落地建议：
- 表单 label、辅助说明、错误提示使用 **次级/弱** 文本层级，避免与正文抢占注意力。
- 数字与金额在表格中建议 **右对齐**，并用等宽数字特性（如字体支持 `font-variant-numeric: tabular-nums`）提升可扫读性。

### 2.3 间距（Spacing）

推荐用 8px 网格作为基础节奏（token 会覆盖实际值）：
- **4/8/12/16/24/32**：常用间距档位
- 表单项上下间距、卡片内边距、区块间距尽量统一

落地建议：
- 页面区块：24（区块间）
- 卡片/容器内边距：16 或 24
- 表单项间距：16（常规）/ 12（密集）

### 2.4 圆角（Radius）

- AntD v5 默认 `borderRadius = 6px`  
  常见分层：`2/4/6/8`（不同组件会使用不同层级）

落地建议：
- 不要在同一页面混用多个“视觉上相近但不一致”的圆角（例如 4 与 6 随意混用）。

### 2.5 阴影与层级（Shadow & Elevation）

典型层级：
- **容器浮层**：Popover/Dropdown/Tooltip
- **对话框**：Modal
- **抽屉**：Drawer（靠近边缘）

落地建议：
- 阴影仅用于表达“悬浮/层级”，不要把阴影当分割线使用。

### 2.6 动效（Motion）

- **有意义**：动效用于表达状态变化（展开/收起/加载/反馈），避免纯装饰。
- **短而稳**：后台系统建议偏短时长，降低等待感；重要确认可以稍长但不要拖沓。
- **可中断**：用户快速操作时动效不应叠加导致卡顿或错位。

## 3. 布局与栅格（Layout & Grid）

- 使用 `Row/Col` 或 `Space/Flex` 组织布局，避免大量手写 margin 拼接。
- 表单与筛选区建议固定结构：
  - **筛选区**（可折叠）
  - **操作区**（主按钮 + 次按钮 + 批量操作）
  - **表格区**
  - **分页/汇总**
- 页面建议采用“标题 + 关键指标/说明 + 主体内容”层级，减少首屏信息噪声。

## 4. 组件使用规范（后台高频）

### 4.1 Button（按钮）

- **主按钮（Primary）**：每个视图/弹窗**尽量只有一个**主按钮（最主要动作）。
- **次按钮（Default）**：辅助动作、返回、取消。
- **危险（Danger）**：删除/作废/清空等不可逆操作，必须配确认（Popconfirm/Modal.confirm）。
- **禁用态**：禁用必须有原因（提示或辅助文案），避免“为什么点不了”。

弹窗页脚建议顺序（从右到左）：**主操作** → 次操作（取消/关闭）。

### 4.2 Form（表单）

- 校验提示就近展示，错误文案可读且可执行（告诉用户怎么改）。
- 必填项统一标识；不要同页混用不同必填标记策略。
- 长表单建议分组（Card/Collapse/Steps），并提供保存草稿/分步提交（视业务复杂度）。

### 4.3 Table（表格）

- 列宽：关键列固定宽度，描述列可自适应；避免全自适应导致抖动。
- 对齐：金额/数量 **右对齐**；状态/标签可居中；文本默认左对齐。
- 操作列：避免超过 3 个直出操作；其余收纳到 Dropdown/More。
- 空态：提供原因与下一步（调整筛选/新建/刷新）。

### 4.4 Modal / Drawer（弹窗/抽屉）

- **Modal**：用于强打断、需要确认的任务；内容不宜过长。
- **Drawer**：用于不中断上下文的编辑/详情；适合较长内容或分区信息。
- 关闭方式：提供右上角关闭；重要内容关闭需二次确认（有未保存变更时）。

### 4.5 Message / Notification / Alert（反馈）

- **Message**：短反馈（保存成功/复制成功），不承载复杂信息。
- **Notification**：较长信息、异步结果、可操作提示（带按钮/链接）。
- **Alert**：页面内静态提示/规则说明/风险提示。

落地建议：错误信息尽量包含 **定位信息 + 原因 + 建议动作**（例如“金额格式不合法，请输入最多两位小数”）。

## 5. 主题与 Token “导出”（工程落地）

### 5.1 通过 `ConfigProvider` 统一主题

在应用入口用 `ConfigProvider` 设置全局 token（示意）：

```tsx
import { ConfigProvider, theme } from 'antd';

export function App() {
  return (
    <ConfigProvider
      theme={{
        algorithm: theme.defaultAlgorithm,
        token: {
          colorPrimary: '#1677ff',
          borderRadius: 6,
          fontSize: 14,
        },
        components: {
          // 组件级 token 覆盖（按需）
        },
      }}
    >
      {/* routes */}
    </ConfigProvider>
  );
}
```

### 5.2 在页面/组件中打印当前 token（用于“导出当前主题规范”）

你可以在任意页面临时输出（开发态）：

```tsx
import { theme } from 'antd';

export function DebugTokens() {
  const { token } = theme.useToken();
  // 控制台复制即可作为“当前工程实际 token 导出”
  console.log('antd token =>', token);
  return null;
}
```

如果需要生成 JSON 文件，可以把 `token` 序列化后下载（浏览器端）：

```ts
export function downloadJson(filename: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
```

## 6. 默认关键值速查（AntD v5）

- **主色**：`#1677ff`
- **基础字号**：`14px`
- **默认圆角**：`6px`

> 注：完整 token 以 `theme.useToken()` 输出为准（因为你的工程可能有覆盖）。

