# OperationActions · 列表操作列规范

> 完整规范见 `src/prototypes/vm-shared/DESIGN.md` · 操作列 OperationActions  
> OneOS V2 同步见 `src/resources/design-system/DESIGN.md` §3.16

## 组件

- 路径：`src/common/OperationActions.tsx`
- 样式：每个 V2 入口必须直接引入 `src/common/vm-operation-actions.css`；`vehicle-management/index.tsx` 已完成该直接引入

## 布局（定稿）

```
[查看/详情]  [编辑/处理/处置]  [⋮]
```

- **查看 / 详情**：详情或对象工作台入口，存在时固定第一
- **编辑 / 处理 / 处置**：工作流动作；有详情入口时外侧最多 1 个并固定第二，无详情入口时外侧最多 2 个
- **查看记录 / 操作记录 / history**：留痕动作，收入「更多」下拉，不得当作详情入口
- **更多**：仅图标 `MoreHorizontal`，点击后通过组件内置的 portal 菜单展开留痕、低频管理与危险操作；没有菜单项时不显示
- 无任何操作时显示 `-`

## 迁移步骤

1. 确认当前 V2 入口已直接引入 `src/common/vm-operation-actions.css`；车辆管理入口 `vehicle-management/index.tsx` 已完成
2. `import { OperationActions, splitOperationActions } from '../../common/OperationActions'`
3. 将原内联按钮改为：

```tsx
<OperationActions
  edit={canEdit ? { onClick: () => ... } : undefined}
  view={{ label: '详情', onClick: () => openDetail(record) }}
  more={[
    { key: 'history', label: '查看记录', onClick: () => openHistory(record) },
    { key: 'process', label: '处置', onClick: () => openProcess(record) },
  ]}
/>
```

有 `view` 时只能选择一个外显工作流动作。若同时传入 `edit`、`process`，组件确定性选择 `edit`，`process` **不会**自动移入 `more`；调用方应像上例一样把有意保留的次级工作流动作显式加入 `more`，或只传入选定的一个工作流动作。

4. 检查最终顺序为 `[查看/详情] [编辑/处理/处置] [⋮ 更多]`
5. 操作列宽建议 `148–184px`，`fixed: 'right'`
6. 勿把已外显的工作流动作重复放进 `more`；`more` 为空时不要渲染更多

## 扁平列表迁移

```tsx
const { edit, process, view, more } = splitOperationActions(allItems);
const retainedSecondary = view && edit && process
  ? [
      {
        key: 'process',
        label: process.label ?? '处理',
        onClick: process.onClick,
        disabled: process.disabled,
      },
      ...more,
    ]
  : more;

return (
  <OperationActions
    view={view}
    edit={edit}
    process={view && edit ? undefined : process}
    more={retainedSecondary}
  />
);
```

迁移后必须复核：`view` 只承载详情 / 对象入口；查看记录、操作记录、history 留在 `more`。有 `view` 时按 `edit > process` 选择一个外显工作流动作，并决定是否把有意保留的次级动作显式移入 `more`；无 `view` 时仍可直接传入 `edit` + `process`，外显两个工作流动作。

## 禁止

- 详情 / 对象入口不在第一位，或被收入更多
- 有详情入口时外显 2 个工作流动作
- 无详情入口时外显超过 2 个工作流动作
- 将查看记录、操作记录、history 当作详情入口外显
- 没有菜单项却显示空的更多
- 文字「更多」链接触发器
- pipe `|` 分隔操作链接
