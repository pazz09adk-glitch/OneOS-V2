# OneOS V2 表单控件套件 · 产品需求说明

## 1. 总览

为 OneOS V2 提供统一的表单控件皮肤与交互（输入、单选、多选、单日日期、区间日期、时间），视觉母版为租赁合同 `LeaseContractHub`，主色 Stripe Violet `#533AFD`。

## 2. 目标用户与任务

| 角色 | 任务 |
|------|------|
| 产品 / 设计 | 一眼对比六类控件在浅/深色下的尺寸与状态 |
| 前端迁页 | 新 V2 页直接引用 `src/common/oneos-v2-form`，不再各自写皮肤 |

## 3. 范围

- **在范围**：`O2Input` / `O2Select` / `O2MultiSelect` / `O2DatePicker` / `O2DateRangePicker` / `O2TimePicker` + 本预览页
- **不在范围**：大改业务页；旧 vm 页强制替换（可暂留 `FilterPickerField` / `DateRangeFilterField`）

## 4. 用户故事（闭环）

1. **起点**：打开本原型或 `/prototypes/oneos-v2?view=form-kit`
2. **运作**：切换浅/深色；操作筛选尺寸与表单尺寸控件；可开「演示错误态」
3. **闭环**：确认规格后，迁页按 README 引用 `O2*` 组件

## 5. 验收

- [ ] 六类控件外观一致（圆角 8、主色 Violet、聚焦 soft 环）
- [ ] 浅色 / 深色均可操作
- [ ] 区间日期展示「至」，双月历
- [ ] 文档写清尺寸与引用路径
