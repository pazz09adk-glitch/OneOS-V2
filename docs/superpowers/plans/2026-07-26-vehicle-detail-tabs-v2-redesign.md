# Vehicle Detail Tabs V2 Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make lifecycle the default vehicle-detail tab and rebuild model parameters, licenses, insurance, and all subsequent record tabs with the OneOS 1.2 field/function contract expressed through OneOS V2 components and layout.

**Architecture:** `DetailView` remains the vehicle-context and tab-layout coordinator; it no longer renders business tables inline. Focused tab components own their data, filters, pagination, and operations, while shared record primitives provide the V2 filter shell, table, and footer. License data is normalized by a pure utility so the license component can render real current data, empty states, and optional image previews without inventing records.

**Tech Stack:** React 18, TypeScript 5.9, Vitest 4, jsdom 26, OneOS V2 form kit, common `TablePagination`, common `OperationActions`, Lucide React, CSS.

---

## File map

### Create

- `tests/vehicle-management/detailTestUtils.tsx` — shared jsdom render/interaction helpers.
- `tests/vehicle-management/DetailView.tabs.test.tsx` — default tab and sidebar/full-width layout.
- `tests/vehicle-management/DetailModelParamsTab.test.tsx` — description-grid semantics and maintenance table.
- `tests/vehicle-management/DetailLicenseTab.test.tsx` — eight license categories, status index, anchor behavior, image preview, and empty states.
- `tests/vehicle-management/DetailRecordTabs.test.tsx` — reference field contracts, query/reset, pagination, and operations.
- `src/prototypes/vehicle-management/utils/vehicleLicenses.ts` — normalized eight-category license view model.
- `src/prototypes/vehicle-management/components/DetailLicenseTab.tsx` — license index/cards/preview.
- `src/prototypes/vehicle-management/components/DetailRecordPrimitives.tsx` — V2 filter shell, record table, link cell, and compact footer.
- `src/prototypes/vehicle-management/components/DetailInsuranceRecordsTab.tsx` — insurance overview and purchase history.
- `src/prototypes/vehicle-management/components/DetailRecordTabs.tsx` — lease, accident, violation, movement, transfer, and annual review tabs.

### Modify

- `src/prototypes/vehicle-management/components/DetailView.tsx` — default tab, layout mode, and child-tab integration.
- `src/prototypes/vehicle-management/components/DetailModelParamsTab.tsx` — V2 description-list markup.
- `src/prototypes/vehicle-management/components/DetailFaultRecordsTab.tsx` — self-contained V2 form imports and global action semantics.
- `src/prototypes/vehicle-management/style.css` — detail layout, description grids, license cards, record filters/tables, and responsive rules.
- `src/prototypes/vehicle-management/index.tsx` — import the V2 form stylesheet through the form-kit entrypoint if the child imports do not already bundle it.

### Keep unchanged

- `VehicleLifecyclePanel.tsx`
- basic-information content inside `DetailView`
- all JSON data files
- vehicle header/summary/location fields

## Task 1: Lock default-tab and adaptive-layout behavior

**Files:**

- Create: `tests/vehicle-management/detailTestUtils.tsx`
- Create: `tests/vehicle-management/DetailView.tabs.test.tsx`
- Modify: `src/prototypes/vehicle-management/components/DetailView.tsx`

- [ ] **Step 1: Add shared test rendering utilities**

Create:

```tsx
// @vitest-environment jsdom
import React, { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';

export async function renderReact(element: React.ReactElement) {
  const host = document.createElement('div');
  document.body.appendChild(host);
  const root: Root = createRoot(host);
  await act(async () => root.render(element));
  return {
    host,
    async cleanup() {
      await act(async () => root.unmount());
      host.remove();
      document.body.replaceChildren();
    },
  };
}

export async function click(element: HTMLElement) {
  await act(async () => element.click());
}

export function buttonByName(root: ParentNode, name: string) {
  return Array.from(root.querySelectorAll('button')).find(
    (button) => button.getAttribute('aria-label') === name || button.textContent?.trim() === name,
  ) as HTMLButtonElement | undefined;
}
```

- [ ] **Step 2: Write failing layout tests**

Use the first vehicle from `data/vehicles.json` and no-op callbacks. Assert:

```tsx
expect(host.querySelector('[role="tab"][aria-selected="true"]')?.textContent).toBe('生命周期');
expect(host.querySelector('.va-form-page-grid')?.classList.contains('is-wide-tab')).toBe(false);
expect(host.querySelector('aside[aria-label="车辆侧栏信息"]')).not.toBeNull();
```

After clicking `型号参数`:

```tsx
expect(host.querySelector('.va-form-page-grid')?.classList.contains('is-wide-tab')).toBe(true);
expect(host.querySelector('aside[aria-label="车辆侧栏信息"]')).toBeNull();
```

After clicking `基本信息`, assert the aside returns and `is-wide-tab` is removed.

- [ ] **Step 3: Run the test and verify RED**

Run:

```bash
npm run test:run -- tests/vehicle-management/DetailView.tabs.test.tsx
```

Expected: default-tab assertion fails because current state initializes to `basic`; wide-tab assertions also fail.

- [ ] **Step 4: Implement the layout coordinator**

Add:

```tsx
export const DEFAULT_DETAIL_TAB: DetailTabId = 'lifecycle';
export const DETAIL_TABS_WITH_ASIDE = new Set<DetailTabId>(['lifecycle', 'basic']);

export function detailTabUsesAside(tab: DetailTabId): boolean {
  return DETAIL_TABS_WITH_ASIDE.has(tab);
}
```

Initialize:

```tsx
const [tab, setTab] = useState<DetailTabId>(DEFAULT_DETAIL_TAB);
const showDetailAside = detailTabUsesAside(tab);
```

Apply:

```tsx
<div className={`va-form-page-grid${showDetailAside ? '' : ' is-wide-tab'}`}>
```

Render the aside only when `showDetailAside`. Keep summary and location cards unchanged.

- [ ] **Step 5: Verify GREEN**

Run:

```bash
npm run test:run -- tests/vehicle-management/DetailView.tabs.test.tsx
```

Expected: all layout tests pass.

## Task 2: Convert model parameters to a V2 description grid

**Files:**

- Create: `tests/vehicle-management/DetailModelParamsTab.test.tsx`
- Modify: `src/prototypes/vehicle-management/components/DetailModelParamsTab.tsx`
- Modify: `src/prototypes/vehicle-management/style.css`

- [ ] **Step 1: Write the failing model presentation test**

Render `DetailModelParamsTab` with the first vehicle and assert:

```tsx
expect(host.querySelector('[aria-label="型号参数（只读）"]')).not.toBeNull();
expect(host.querySelectorAll('.va-description-item').length).toBeGreaterThanOrEqual(10);
expect(host.querySelectorAll('.va-model-param-item__value').length).toBe(0);
expect(host.querySelectorAll('input,select,textarea').length).toBe(0);
expect(host.querySelector('table')?.textContent).toContain('保养公里周期');
```

Also assert section headings:

```tsx
['基本情况', '轮胎情况', '电气情况', '供氢系统情况', '其他系统情况', '保养规则']
```

- [ ] **Step 2: Verify RED**

Run:

```bash
npm run test:run -- tests/vehicle-management/DetailModelParamsTab.test.tsx
```

Expected: description-item and heading assertions fail against the current input-like visual classes.

- [ ] **Step 3: Replace field markup**

Use semantic definition markup:

```tsx
function ParamField({ label, value, wide = false }: ParamFieldProps) {
  const empty = isEmptyValue(value);
  return (
    <div className={`va-description-item${wide ? ' is-wide' : ''}`}>
      <dt className="va-description-item__label">{label}</dt>
      <dd className={`va-description-item__value${empty ? ' is-empty' : ''}`}>
        {empty ? '—' : value}
      </dd>
    </div>
  );
}
```

Each section renders:

```tsx
<section className="va-detail-section va-model-param-section">
  <h3 className="va-detail-section__title">{title}</h3>
  <dl className={`va-description-grid is-cols-${columns}`}>{children}</dl>
</section>
```

Rename the maintenance heading to `保养规则`; preserve every current row and field.

- [ ] **Step 4: Replace the input-like CSS**

Remove background/border/control-height styling from `.va-model-param-item__value`. Add:

```css
.va-description-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  column-gap: 32px;
  row-gap: 20px;
  margin: 0;
}

.va-description-item {
  min-width: 0;
  margin: 0;
}

.va-description-item.is-wide {
  grid-column: span 2;
}

.va-description-item__label {
  margin: 0 0 6px;
  color: var(--ln-muted);
  font-size: 12px;
  line-height: 1.4;
}

.va-description-item__value {
  margin: 0;
  color: var(--ln-ink);
  font-size: 14px;
  font-weight: 600;
  line-height: 1.5;
  overflow-wrap: anywhere;
}
```

At `max-width: 767px`, use one column and reset `grid-column`.

- [ ] **Step 5: Verify the model tab**

Run:

```bash
npm run test:run -- tests/vehicle-management/DetailModelParamsTab.test.tsx
```

Expected: all tests pass.

## Task 3: Normalize the eight license categories

**Files:**

- Create: `src/prototypes/vehicle-management/utils/vehicleLicenses.ts`
- Create: `tests/vehicle-management/DetailLicenseTab.test.tsx`

- [ ] **Step 1: Define the license view-model contract**

Create:

```ts
export type VehicleLicenseStatus = 'normal' | 'expiring' | 'expired' | 'missing';

export interface VehicleLicenseImage {
  id: string;
  src: string;
  alt: string;
}

export interface VehicleLicenseField {
  label: string;
  value: string;
  expiryDays?: number | null;
}

export interface VehicleLicenseGroup {
  id:
    | 'driver'
    | 'transport'
    | 'registration'
    | 'special-registration'
    | 'special-mark'
    | 'hydrogen-card'
    | 'safety-valve'
    | 'pressure-gauge';
  label: string;
  status: VehicleLicenseStatus;
  statusLabel: string;
  images: VehicleLicenseImage[];
  fields: VehicleLicenseField[];
  emptyTitle?: string;
  emptyDescription?: string;
}
```

- [ ] **Step 2: Write failing utility assertions in the license test**

Assert `resolveVehicleLicenses(record)` returns the labels in this exact order:

```ts
[
  '行驶证',
  '道路运输证',
  '登记证',
  '特种设备使用登记证',
  '特种设备使用标识',
  '加氢卡',
  '安全阀',
  '压力表',
]
```

Assert driver fields contain `注册日期`, `发证日期`, `强制报废日期`, `检验有效期至`; transport contains `经营许可证号`, `核发时间`, `证件有效期`, `审验有效期`.

- [ ] **Step 3: Verify RED**

Run:

```bash
npm run test:run -- tests/vehicle-management/DetailLicenseTab.test.tsx
```

Expected: module import fails because `vehicleLicenses.ts` does not exist.

- [ ] **Step 4: Implement deterministic normalization**

Use current `VehicleRecord` fields only:

- driver: `regDate`, unavailable issue date as `—`, `scrapDate`, `inspectExpire`;
- transport/registration/special categories: unavailable values as `—`;
- hydrogen card: derive bound/missing from `telematicsLinked`;
- no current image URL means `images: []`, never a generated placeholder.

Use `daysUntilExpire` for known expiry dates. Apply:

```ts
export function licenseStatusFromDays(
  days: number | null,
  warnDays: number,
  hasDocument: boolean,
): VehicleLicenseStatus {
  if (!hasDocument) return 'missing';
  if (days === null) return 'normal';
  if (days < 0) return 'expired';
  if (days <= warnDays) return 'expiring';
  return 'normal';
}
```

Thresholds: driver 90 days; transport, special mark, safety valve, pressure gauge 60 days.

- [ ] **Step 5: Verify the utility assertions**

Run the same focused command. Expected: normalization assertions pass; component assertions remain pending until Task 4.

## Task 4: Build the V2 license index, cards, anchors, and preview

**Files:**

- Create: `src/prototypes/vehicle-management/components/DetailLicenseTab.tsx`
- Modify: `tests/vehicle-management/DetailLicenseTab.test.tsx`
- Modify: `src/prototypes/vehicle-management/style.css`

- [ ] **Step 1: Add failing component tests**

Render with `record`. Assert:

- navigation `证照分类` has eight buttons;
- legend exposes `正常`, `临期`, `已到期`, `未上传`;
- eight `article[data-license-id]` sections exist;
- the driver article contains its four fields;
- a missing group uses V2 empty-state text, not an `<img>`.

Render with an injected `groups` fixture containing one real test image:

```ts
images: [{ id: 'driver-front', src: 'data:image/png;base64,iVBORw0KGgo=', alt: '行驶证正页' }]
```

Click `预览行驶证正页`; assert dialog `证照图片预览` opens. Click its close button and assert removal.

Stub:

```ts
const scrollIntoView = vi.fn();
Element.prototype.scrollIntoView = scrollIntoView;
```

Click the `行驶证` index and assert `scrollIntoView({ behavior: 'smooth', block: 'start' })`.

- [ ] **Step 2: Verify RED**

Run the focused license test. Expected: component import or role assertions fail.

- [ ] **Step 3: Implement the component**

Public API:

```tsx
interface DetailLicenseTabProps {
  record: VehicleRecord;
  groups?: VehicleLicenseGroup[];
}
```

Use `groups ?? resolveVehicleLicenses(record)`. Render:

- `section.va-license-index`;
- `nav[aria-label="证照分类"]`;
- status dots/tags;
- one `article` per group;
- image buttons only for actual image entries;
- description grid for fields;
- `V2Empty` for missing image/content;
- a body-level modal/dialog for image preview with close button and `alt`.

- [ ] **Step 4: Add license styling**

Add V2 token-based styles for:

- index card and legend;
- wrapping pill buttons;
- two-column license-card grid at desktop;
- full-width cards for dense categories;
- image thumbnails with 4:3 ratio;
- description grid;
- sticky-scroll offset via `scroll-margin-top`;
- one-column cards at `max-width: 767px`.

- [ ] **Step 5: Verify the license tab**

Run:

```bash
npm run test:run -- tests/vehicle-management/DetailLicenseTab.test.tsx
```

Expected: all utility and component tests pass.

## Task 5: Create shared V2 record-tab primitives

**Files:**

- Create: `src/prototypes/vehicle-management/components/DetailRecordPrimitives.tsx`
- Create: `tests/vehicle-management/DetailRecordTabs.test.tsx`
- Modify: `src/prototypes/vehicle-management/style.css`

- [ ] **Step 1: Write failing primitive tests**

Test a minimal fixture through `DetailRecordTable`:

```tsx
const columns = [
  { key: 'code', label: '编号', render: (row) => row.code },
  { key: 'status', label: '状态', render: (row) => row.status || '—' },
];
```

Assert headers, `—` empty values, empty table row, and common pagination total.

Test `DetailRecordFilterBar`:

- form/region accessible name;
- `重置` and `查询`;
- `is-expanded` removed after clicking query/reset when initially expanded.

- [ ] **Step 2: Verify RED**

Run:

```bash
npm run test:run -- tests/vehicle-management/DetailRecordTabs.test.tsx
```

Expected: primitives module import fails.

- [ ] **Step 3: Implement the primitives**

Create:

```tsx
export interface DetailRecordColumn<Row> {
  key: string;
  label: string;
  width?: number;
  className?: string;
  render: (row: Row) => React.ReactNode;
}

export function DetailRecordFilterBar(props: {
  title: string;
  children: React.ReactNode;
  onQuery: () => void;
  onReset: () => void;
}) {
  const [expanded, setExpanded] = React.useState(true);
  const query = () => {
    props.onQuery();
    setExpanded(false);
  };
  const reset = () => {
    props.onReset();
    setExpanded(false);
  };
  return (
    <section
      className={`va-record-filter${expanded ? ' is-expanded' : ''}`}
      aria-label={`${props.title}筛选`}
    >
      <div className="va-record-filter__grid">{props.children}</div>
      <div className="va-record-filter__actions">
        <button type="button" className="vm-btn vm-btn-ghost" onClick={reset}>重置</button>
        <button type="button" className="vm-btn vm-btn-primary" onClick={query}>查询</button>
      </div>
    </section>
  );
}

export function DetailRecordTable<Row extends { id: string }>(props: {
  columns: DetailRecordColumn<Row>[];
  rows: Row[];
  emptyText?: string;
}) {
  const emptyText = props.emptyText || '暂无数据';
  return (
    <div className="vm-table-card va-record-table-card">
      <div className="vm-table-wrap vm-table-wrap--detail-tab">
        <table className="vm-table">
          <thead>
            <tr>
              {props.columns.map((column) => (
                <th key={column.key} style={column.width ? { minWidth: column.width } : undefined}>
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {props.rows.length === 0 ? (
              <tr>
                <td colSpan={props.columns.length} className="vm-empty-cell">{emptyText}</td>
              </tr>
            ) : props.rows.map((row) => (
              <tr key={row.id}>
                {props.columns.map((column) => (
                  <td key={column.key} className={column.className}>
                    {column.render(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function DetailRecordFooter(props: TablePaginationProps) {
  return <div className="vm-table-footer vm-table-footer--compact"><TablePagination {...props} /></div>;
}
```

Use common `TablePagination`, no local pagination skin.

- [ ] **Step 4: Add shared record CSS**

Add `.va-record-tab`, `.va-record-filter`, `.va-record-filter__grid`,
`.va-record-filter__actions`, `.va-record-table-card`, and wide-scroll rules.
Reuse `vm-table` and `vm-pagination` classes rather than duplicating them.

- [ ] **Step 5: Verify primitive tests**

Run the focused record test. Expected: primitive tests pass.

## Task 6: Implement the insurance record tab

**Files:**

- Create: `src/prototypes/vehicle-management/components/DetailInsuranceRecordsTab.tsx`
- Modify: `tests/vehicle-management/DetailRecordTabs.test.tsx`

- [ ] **Step 1: Add failing insurance contract tests**

Render with current record, insurance expiry map entry, and current purchase rows. Assert:

- five overview buttons: 交强险、商业险、超赔险、驾意险、货物险;
- selected insurance detail contains 保单号、保险公司、到期日期、保费;
- history headers exactly:
  保险导入时间、操作人、类型、保单号、保险状态、保险公司、付款时间、到期日期、保单文件;
- unavailable JSON fields display `—`;
- preview/download buttons call the supplied `onToast` with the existing prototype wording.

- [ ] **Step 2: Verify RED**

Run the record test. Expected: insurance component import or field assertions fail.

- [ ] **Step 3: Implement the insurance tab**

API:

```tsx
interface DetailInsuranceRecordsTabProps {
  record: VehicleRecord;
  insurance?: VehicleInsuranceExpire;
  rows: InsurancePurchaseRecord[];
  onToast: (message: string) => void;
}
```

Do not add fields to `insurance-purchases.json`. Normalize missing operator, type,
policy number, company, payment date, premium, and files to `—`. Preserve current
purchase/expiry values. Only show file actions when a file exists; otherwise `—`.

Use clickable overview cards and the shared record table/footer.

- [ ] **Step 4: Verify insurance tests**

Run the focused record test. Expected: insurance tests pass.

## Task 7: Implement lease, accident, violation, movement, transfer, and annual tabs

**Files:**

- Create: `src/prototypes/vehicle-management/components/DetailRecordTabs.tsx`
- Modify: `tests/vehicle-management/DetailRecordTabs.test.tsx`

- [ ] **Step 1: Add failing field-contract tests**

For each exported component, render fixture rows and assert exact headers:

```ts
const leaseHeaders = ['合同编码','项目名称','客户名称','业务类型','交车日期','交车人','还车日期','还车人'];
const accidentHeaders = ['事故编码','事故时间','事故地点','事故类型','客户名称','我方定损金额','对方定损金额','责任划分','事故状态','结案时间'];
const violationHeaders = ['违法时间','违法地点','违法行为','扣分','罚款金额','缴费状态','是否处理','采集单位'];
const movementHeaders = ['异动开始日期','异动预计结束日期','异动状态','异动目的地','目的地名称','异动类型','预计异动里程 (km)','异动开始里程 (km)','异动开始电量 (kWh)','异动开始氢量','异动结束里程 (km)','异动结束电量 (kWh)','异动结束氢量','创建人','创建时间'];
const transferHeaders = ['调拨日期','调出人','接收人','出发区域','接收区域','调拨方式','出发停车场','接收停车场','接收日期'];
const annualHeaders = ['检验有效期至','检测服务站名称','检测费用','二保服务站名称','二保费用','整备服务站名称','整备费用','办理人','完成时间'];
```

Assert each tab exposes its approved filter labels and query/reset buttons.

- [ ] **Step 2: Verify RED**

Run the record test. Expected: component exports or header assertions fail.

- [ ] **Step 3: Implement explicit filter types and helpers**

In `DetailRecordTabs.tsx`, define one filter type/empty constant per tab. Use:

- `O2Input` for contract/project/customer/free-text fields;
- `O2Select` for enumerations;
- `O2DateRangePicker` for dates.

Each component maintains `pendingFilters`, `appliedFilters`, `page`, `pageSize`;
query copies pending to applied and resets page; reset restores the exact empty
constant and resets page. Filter only current in-memory rows.

- [ ] **Step 4: Implement exact columns and operations**

Use the JSON keys shown by the current data:

- lease: link contract/project/delivery/return cells to `onToast`;
- accident: link `accidentCode` to `onToast`;
- violation: link `violationBehavior` to `onToast`;
- movement: link `startDate` to `onToast`;
- transfer: link `transferDate` to `onToast`;
- annual: link `inspectionValidUntil` to `onToast`.

Use `Intl.NumberFormat('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })`
for monetary values, returning `—` for null/empty.

- [ ] **Step 5: Verify all six record tabs**

Run:

```bash
npm run test:run -- tests/vehicle-management/DetailRecordTabs.test.tsx
```

Expected: all header, filter, query/reset, and interaction tests pass.

## Task 8: Repair and integrate the fault-record tab

**Files:**

- Modify: `src/prototypes/vehicle-management/components/DetailFaultRecordsTab.tsx`
- Modify: `tests/vehicle-management/DetailRecordTabs.test.tsx`

- [ ] **Step 1: Add failing fault contract tests**

Assert the six filters and fourteen headers from the approved spec. Assert action
buttons are exactly `查看记录`, `编辑`, and optional `更多操作` only when more items exist.
Click both actions and verify callbacks receive the row.

- [ ] **Step 2: Verify RED**

Run the record test. Expected: current orphan component fails to import nonexistent
local `DateRangeFilterField`, `FilterPickerField`, `StatusTag`, `TablePagination`,
and `utils/faultRecords`.

- [ ] **Step 3: Make the component self-contained**

Replace missing imports with:

```tsx
import { O2DateRangePicker, O2Select, O2Input } from '../../../common/oneos-v2-form';
import { TablePagination } from '../../../common/TablePagination';
import { OperationActions } from '../../../common/OperationActions';
```

Read rows from the passed `rows` prop rather than a missing `faultRecords` utility.
Define the filter logic locally and use existing JSON keys.

Use global action semantics:

```tsx
<OperationActions
  view={{ label: '查看记录', onClick: () => onViewFaultDetail?.(record, row) }}
  edit={{ label: '编辑', onClick: () => onEditFaultRecord?.(record, row) }}
/>
```

Do not create a page-specific more menu.

- [ ] **Step 4: Verify fault tests**

Run the focused record test. Expected: all fault tests pass.

## Task 9: Integrate all tab components into DetailView

**Files:**

- Modify: `src/prototypes/vehicle-management/components/DetailView.tsx`
- Modify: `tests/vehicle-management/DetailView.tabs.test.tsx`

- [ ] **Step 1: Expand the integration test**

Click every tab from model through annual and assert a unique landmark:

- 型号参数: `型号参数（只读）`
- 证照信息: navigation `证照分类`
- 保险记录: text `车辆保险档案`
- 租赁记录: header `合同编码`
- 事故记录: header `事故编码`
- 故障记录: header `故障编号`
- 违章记录: header `违法行为`
- 异动记录: header `异动开始日期`
- 调拨记录: header `调拨日期`
- 年审记录: header `检验有效期至`

For each, assert aside is absent. Click lifecycle/basic and assert aside is present.

- [ ] **Step 2: Verify RED**

Run the detail-view test. Expected: license and record landmarks fail while inline
generic `RecordTable` remains.

- [ ] **Step 3: Replace inline rendering**

Import and render the focused components. Pass only the current vehicle rows already
computed in `plateRows`, plus existing `onToast` callbacks. Replace the license
placeholder, insurance blocks, and generic `RecordTable` branches.

Remove `RecordTable` from `DetailView`. Do not move child filter state into
`DetailView`.

- [ ] **Step 4: Verify the integrated detail view**

Run:

```bash
npm run test:run -- tests/vehicle-management/DetailView.tabs.test.tsx
```

Expected: all tab and layout assertions pass.

## Task 10: Responsive styling and visual QA

**Files:**

- Modify: `src/prototypes/vehicle-management/style.css`
- Verify: all new/modified components.

- [ ] **Step 1: Complete wide-layout CSS**

Add:

```css
.va-form-page-grid.is-wide-tab .va-form-main {
  grid-column: 1 / -1;
}

.va-form-page-grid.is-wide-tab .va-form-card--workbench {
  min-width: 0;
}
```

Keep summary/location cards unchanged. Ensure the workbench uses full width only
for model and later tabs.

- [ ] **Step 2: Add responsive rules**

At `max-width: 767px`:

- description grid one column;
- license cards one column;
- index pills horizontally scroll or wrap without clipping;
- record filters one column;
- buttons meet 44px touch targets;
- tables retain minimum widths and scroll inside `.vm-table-wrap`.

- [ ] **Step 3: Run focused and full tests**

Run:

```bash
npm run test:run -- \
  tests/vehicle-management/DetailView.tabs.test.tsx \
  tests/vehicle-management/DetailModelParamsTab.test.tsx \
  tests/vehicle-management/DetailLicenseTab.test.tsx \
  tests/vehicle-management/DetailRecordTabs.test.tsx

npm run test:run
```

Expected: all focused tests and the full Vitest suite pass.

- [ ] **Step 4: Run static checks**

Run:

```bash
npm run typecheck
npm run build
```

Expected for this workspace baseline:

- typecheck may remain blocked by missing `@types/react` / `@types/react-dom`;
- build may remain blocked first by
  `src/prototypes/lease-contract-management/index.tsx` missing a default export.

Record the first fresh failure exactly. Investigate and fix any new diagnostic
attributable to vehicle-management.

- [ ] **Step 5: Browser QA at 1280px**

Open `/prototypes/vehicle-management`, enter the first vehicle, and verify:

- lifecycle selected initially;
- lifecycle/basic show aside;
- model onward full width;
- model uses unboxed description values;
- license index positions correctly and images preview only when present;
- all record filters/query/reset/pagination work;
- wide movement/fault tables scroll without page-level overflow.

Capture screenshots for model, license, insurance, and one wide record table.

- [ ] **Step 6: Browser QA at 390px**

Verify:

- no horizontal page overflow outside table scroll areas;
- tab strip remains usable;
- description/license layouts are single-column;
- filter controls and buttons are at least 44px;
- license index and preview remain accessible.

Reset the browser viewport after QA.

## Task 11: Final consistency review

**Files:**

- Verify: `src/prototypes/vehicle-management/.spec/2026-07-26-detail-tabs-v2-redesign.md`
- Verify: all Task 1–10 files.

- [ ] **Step 1: Scan for stale placeholders and old inline tables**

Run:

```bash
rg -n "已建档（只读演示）|function RecordTable|va-model-param-item__value" \
  src/prototypes/vehicle-management/components \
  src/prototypes/vehicle-management/style.css
```

Expected: no active old license placeholder, inline `DetailView` record table, or
input-like model-value style remains.

- [ ] **Step 2: Scan the approved field contract**

Run tests plus a source scan for all tab headers named in Tasks 6–8. Confirm no
reference-page field was silently dropped and no fake JSON field was added.

- [ ] **Step 3: Review deliverable scope**

List exact changed files. Exclude `.superpowers/brainstorm/` artifacts from the
deliverable. Because this workspace is not a Git repository, do not claim commits,
branches, or a clean Git diff.
