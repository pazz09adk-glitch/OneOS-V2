# OneOS V2 统一表单控件

路径：`src/common/oneos-v2-form/`  
预览原型：`/prototypes/oneos-v2-form-kit`

## 导出

| 组件 | 文件 | 说明 |
|------|------|------|
| `O2Input` | `Input.tsx` | 单行输入 |
| `O2Select` | `Select.tsx` | 单选（可搜索） |
| `O2MultiSelect` | `MultiSelect.tsx` | 多选 Tag |
| `O2DatePicker` | `DatePicker.tsx` | 单日日历 |
| `O2DateRangePicker` | `DateRangePicker.tsx` | 开始「至」结束 · 双月 |
| `O2TimePicker` | `TimePicker.tsx` | `HH:mm` / `HH:mm:ss` |

样式：`oneos-v2-form.css`（依赖 `oneos-ds-tokens.css`）

## 引用

```tsx
import '../../resources/design-system/oneos-ds-tokens.css';
import '../../common/oneos-v2-form/oneos-v2-form.css';
import {
  O2Input,
  O2Select,
  O2MultiSelect,
  O2DatePicker,
  O2DateRangePicker,
  O2TimePicker,
} from '../../common/oneos-v2-form';
```

主色 Stripe Violet `#533AFD`；高度 `md=36` / `sm=32`；圆角 8。  
区间日期：开始框 +「至」+ 结束框 + 双月历（对标 `DateRangeFilterField`）。

预览：`/prototypes/oneos-v2-form-kit` · `/prototypes/oneos-v2?view=form-kit`
