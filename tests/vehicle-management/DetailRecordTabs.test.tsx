// @vitest-environment jsdom

import React from 'react';
import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  expectTypeOf,
  it,
  vi,
} from 'vitest';
import {
  DetailRecordFilterBar,
  DetailRecordFooter,
  DetailRecordTable,
  type DetailRecordColumn,
} from '../../src/prototypes/vehicle-management/components/DetailRecordPrimitives';
import { DetailInsuranceRecordsTab } from '../../src/prototypes/vehicle-management/components/DetailInsuranceRecordsTab';
import {
  DetailAccidentRecordsTab,
  DetailAnnualReviewRecordsTab,
  DetailLeaseRecordsTab,
  DetailMovementRecordsTab,
  DetailTransferRecordsTab,
  DetailViolationRecordsTab,
} from '../../src/prototypes/vehicle-management/components/DetailRecordTabs';
import { DetailFaultRecordsTab } from '../../src/prototypes/vehicle-management/components/DetailFaultRecordsTab';
import vehicles from '../../src/prototypes/vehicle-management/data/vehicles.json';
import type { VehicleRecord } from '../../src/prototypes/vehicle-management/types';
import {
  buttonByName,
  click,
  renderReact,
  type RenderReactResult,
} from './detailTestUtils';

interface FixtureRow {
  id: string;
  code: string;
  status: string;
}

const renderCode = vi.fn((row: FixtureRow) => (
  <span data-record-code>{`编号：${row.code}`}</span>
));
const renderStatus = vi.fn((row: FixtureRow) => (
  <strong data-record-status>{`状态标签：${row.status || '—'}`}</strong>
));

const columns: DetailRecordColumn<FixtureRow>[] = [
  {
    key: 'code',
    label: '编号',
    width: 128,
    className: 'code',
    render: renderCode,
  },
  {
    key: 'status',
    label: '状态',
    render: renderStatus,
  },
];

let rendered: RenderReactResult | undefined;
const actEnvironment = globalThis as typeof globalThis & {
  IS_REACT_ACT_ENVIRONMENT?: boolean;
};
const originalActEnvironment = actEnvironment.IS_REACT_ACT_ENVIRONMENT;

beforeAll(() => {
  actEnvironment.IS_REACT_ACT_ENVIRONMENT = true;
});

afterAll(() => {
  if (originalActEnvironment === undefined) {
    Reflect.deleteProperty(actEnvironment, 'IS_REACT_ACT_ENVIRONMENT');
  } else {
    actEnvironment.IS_REACT_ACT_ENVIRONMENT = originalActEnvironment;
  }
});

afterEach(async () => {
  await rendered?.unmount();
  rendered = undefined;
  vi.clearAllMocks();
});

describe('DetailRecordTable', () => {
  it('keeps width numeric and render required in the column type', () => {
    type Column = DetailRecordColumn<FixtureRow>;
    type HasRequiredRenderer = Column extends {
      render: (row: FixtureRow) => React.ReactNode;
    } ? true : false;

    expectTypeOf<Column['width']>().toEqualTypeOf<number | undefined>();
    expectTypeOf<Column['render']>().toEqualTypeOf<
      (row: FixtureRow) => React.ReactNode
    >();
    expectTypeOf<HasRequiredRenderer>().toEqualTypeOf<true>();
  });

  it('renders a named vm table with scoped headers, column widths, and cell renderers', async () => {
    const rows: FixtureRow[] = [
      { id: 'row-1', code: 'REC-001', status: '正常' },
      { id: 'row-2', code: 'REC-002', status: '' },
    ];
    rendered = await renderReact(
      <DetailRecordTable
        title="测试记录"
        columns={columns}
        rows={rows}
      />,
    );

    const table = rendered.container.querySelector<HTMLTableElement>('table');
    const card = rendered.container.querySelector<HTMLElement>('.va-record-table-card');
    const tableWrap = card?.querySelector<HTMLElement>('.va-table-wrap');
    const headers = Array.from(table?.querySelectorAll('th') ?? []);
    const bodyRows = Array.from(table?.querySelectorAll('tbody tr') ?? []);

    expect(card?.classList.contains('vm-table-card')).toBe(true);
    expect(tableWrap?.classList.contains('vm-table-wrap')).toBe(true);
    expect(tableWrap?.classList.contains('vm-table-wrap--wide')).toBe(true);
    expect(table?.classList.contains('vm-table')).toBe(true);
    expect(table?.classList.contains('va-record-table')).toBe(true);
    expect(table?.querySelector('caption')?.textContent).toBe('测试记录');
    expect(headers.map((header) => header.textContent?.trim())).toEqual(['编号', '状态']);
    expect(headers.every((header) => header.scope === 'col')).toBe(true);
    expect(headers[0].style.minWidth).toBe('128px');
    expect(bodyRows[0].querySelector('[data-record-code]')?.textContent).toBe('编号：REC-001');
    expect(bodyRows[0].querySelector('[data-record-status]')?.textContent).toBe('状态标签：正常');
    expect(bodyRows[1].querySelector('[data-record-status]')?.textContent).toBe('状态标签：—');
    expect(bodyRows[0].querySelector('td')?.classList.contains('code')).toBe(true);
    expect(renderCode).toHaveBeenCalledTimes(2);
    expect(renderCode).toHaveBeenNthCalledWith(1, rows[0]);
    expect(renderCode).toHaveBeenNthCalledWith(2, rows[1]);
    expect(renderStatus).toHaveBeenCalledTimes(2);
  });

  it('renders a clear status fallback instead of a malformed table with no columns', async () => {
    rendered = await renderReact(
      <DetailRecordTable<FixtureRow>
        title="动态记录"
        columns={[]}
        rows={[{ id: 'row-1', code: 'REC-001', status: '正常' }]}
      />,
    );

    const status = rendered.container.querySelector<HTMLElement>('[role="status"]');

    expect(rendered.container.querySelector('table')).toBeNull();
    expect(status?.textContent?.trim()).toBe('暂无可显示字段');
    expect(status?.closest('.va-record-table-card')).not.toBeNull();
  });

  it('renders one spanning empty cell with the default text', async () => {
    rendered = await renderReact(
      <DetailRecordTable title="空记录" columns={columns} rows={[]} />,
    );

    const cells = rendered.container.querySelectorAll<HTMLTableCellElement>('tbody td');
    const emptyCell = cells.item(0);

    expect(cells).toHaveLength(1);
    expect(emptyCell.colSpan).toBe(columns.length);
    expect(emptyCell.textContent).toBe('暂无数据');
  });
});

describe('DetailRecordFooter', () => {
  it('wraps the common pagination with its total and named navigation', async () => {
    rendered = await renderReact(
      <DetailRecordFooter
        page={1}
        pageSize={10}
        total={21}
        onPageChange={vi.fn()}
        onPageSizeChange={vi.fn()}
      />,
    );

    const footer = rendered.container.querySelector('.vm-table-footer--compact');
    const navigation = footer?.querySelector<HTMLElement>(
      '[role="navigation"][aria-label="表格分页"]',
    );

    expect(footer?.classList.contains('vm-table-footer')).toBe(true);
    expect(footer?.classList.contains('va-record-footer')).toBe(true);
    expect(navigation).not.toBeNull();
    expect(navigation?.textContent?.replace(/\s+/g, ' ').trim()).toContain('共 21 条');
    expect(buttonByName(navigation as HTMLElement, '上一页').disabled).toBe(true);
    expect(buttonByName(navigation as HTMLElement, '下一页').disabled).toBe(false);
  });
});

describe('DetailRecordFilterBar', () => {
  it('is a named region with a visible header, V2 actions, and expanded controlled content', async () => {
    rendered = await renderReact(
      <DetailRecordFilterBar title="记录" onQuery={vi.fn()} onReset={vi.fn()}>
        <label>
          状态
          <input name="status" />
        </label>
      </DetailRecordFilterBar>,
    );

    const region = rendered.container.querySelector<HTMLElement>(
      'section[role="region"][aria-label="记录筛选"]',
    );
    const content = region?.querySelector<HTMLElement>('.va-record-filter__content');
    const toggle = buttonByName(region as HTMLElement, '收起筛选');
    const reset = buttonByName(region as HTMLElement, '重置');
    const query = buttonByName(region as HTMLElement, '查询');
    const input = region?.querySelector<HTMLInputElement>('input[name="status"]');

    expect(region?.querySelector('.va-record-filter__header h3')?.textContent).toBe('记录筛选');
    expect(region?.classList.contains('is-expanded')).toBe(true);
    expect(content?.hidden).toBe(false);
    expect(content?.id).toBeTruthy();
    expect(toggle.getAttribute('aria-controls')).toBe(content?.id);
    expect(toggle.getAttribute('aria-expanded')).toBe('true');
    expect(toggle.classList.contains('v2-btn--ghost')).toBe(true);
    expect(toggle.classList.contains('v2-btn--lg')).toBe(true);
    expect(input).not.toBeNull();
    expect(input?.labels?.item(0)?.textContent?.trim()).toBe('状态');
    expect(reset.type).toBe('button');
    expect(reset.classList.contains('v2-btn--secondary')).toBe(true);
    expect(reset.classList.contains('v2-btn--lg')).toBe(true);
    expect(query.type).toBe('button');
    expect(query.classList.contains('v2-btn--primary')).toBe(true);
    expect(query.classList.contains('v2-btn--lg')).toBe(true);
  });

  it('calls query before hiding the content and can reopen it', async () => {
    let region: HTMLElement | null = null;
    const onQuery = vi.fn(() => {
      expect(region?.classList.contains('is-expanded')).toBe(true);
    });
    rendered = await renderReact(
      <DetailRecordFilterBar title="记录" onQuery={onQuery} onReset={vi.fn()}>
        <input aria-label="编号" />
      </DetailRecordFilterBar>,
    );
    region = rendered.container.querySelector<HTMLElement>('.va-record-filter');
    const content = region?.querySelector<HTMLElement>('.va-record-filter__content');
    const query = buttonByName(region as HTMLElement, '查询');

    query.focus();
    expect(document.activeElement).toBe(query);
    await click(query);

    expect(onQuery).toHaveBeenCalledOnce();
    expect(region?.classList.contains('is-expanded')).toBe(false);
    expect(content?.hidden).toBe(true);
    const reopen = buttonByName(region as HTMLElement, '展开筛选');
    expect(reopen.getAttribute('aria-expanded')).toBe('false');
    expect(document.activeElement).toBe(reopen);
    expect(reopen.closest('[hidden]')).toBeNull();

    await click(reopen);

    expect(region?.classList.contains('is-expanded')).toBe(true);
    expect(content?.hidden).toBe(false);
    expect(buttonByName(region as HTMLElement, '收起筛选').getAttribute('aria-expanded')).toBe('true');
  });

  it('calls reset before hiding the content in a fresh render', async () => {
    let region: HTMLElement | null = null;
    const onReset = vi.fn(() => {
      expect(region?.classList.contains('is-expanded')).toBe(true);
    });
    rendered = await renderReact(
      <DetailRecordFilterBar title="记录" onQuery={vi.fn()} onReset={onReset}>
        <input aria-label="编号" />
      </DetailRecordFilterBar>,
    );
    region = rendered.container.querySelector<HTMLElement>('.va-record-filter');
    const content = region?.querySelector<HTMLElement>('.va-record-filter__content');
    const reset = buttonByName(region as HTMLElement, '重置');

    reset.focus();
    expect(document.activeElement).toBe(reset);
    await click(reset);

    expect(onReset).toHaveBeenCalledOnce();
    expect(region?.classList.contains('is-expanded')).toBe(false);
    expect(content?.hidden).toBe(true);
    const reopen = buttonByName(region as HTMLElement, '展开筛选');
    expect(reopen.getAttribute('aria-expanded')).toBe('false');
    expect(document.activeElement).toBe(reopen);
    expect(reopen.closest('[hidden]')).toBeNull();
  });
});

function tableHeaders(root: ParentNode): string[] {
  return Array.from(root.querySelectorAll('th'), (cell) => cell.textContent?.trim() ?? '');
}

describe('vehicle detail record contracts', () => {
  it('renders the approved headers and filters for lease through annual review', async () => {
    const onToast = vi.fn();
    const cases = [
      {
        element: (
          <DetailLeaseRecordsTab
            onToast={onToast}
            rows={[{
              id: 'lease-1',
              plateNo: '粤A00001',
              contractNo: 'HT-001',
              projectName: '示例项目',
              customerName: '示例客户',
              businessType: '租赁',
              deliveryDate: '2026-01-01',
              deliveryPerson: '张三',
              returnDate: '',
              returnPerson: '',
            }]}
          />
        ),
        headers: ['合同编码', '项目名称', '客户名称', '业务类型', '交车日期', '交车人', '还车日期', '还车人'],
        filters: ['合同编码', '项目名称', '客户名称', '业务类型'],
      },
      {
        element: (
          <DetailAccidentRecordsTab
            onToast={onToast}
            rows={[{
              id: 'accident-1',
              accidentCode: 'ACC-001',
              accidentTime: '2026-01-02 10:00',
              accidentLocation: '示例地点',
              accidentType: '追尾',
              customerName: '示例客户',
              accidentLevel: '一般',
              ourDamageAmount: 100,
              theirDamageAmount: 200,
              responsibility: '我方全责',
              status: '已结案',
              closedTime: '2026-01-03 10:00',
            }]}
          />
        ),
        headers: ['事故编码', '事故时间', '事故地点', '事故类型', '客户名称', '我方定损金额', '对方定损金额', '责任划分', '事故状态', '结案时间'],
        filters: ['事故时间', '客户名称', '事故等级', '事故状态'],
      },
      {
        element: (
          <DetailViolationRecordsTab
            onToast={onToast}
            rows={[{
              id: 'violation-1',
              violationTime: '2026-01-04',
              violationLocation: '示例地点',
              violationBehavior: '违反禁令标志',
              pointsDeducted: 1,
              fineAmount: 100,
              paymentStatus: '已缴费',
              processed: '已处理',
              collectionUnit: '示例单位',
              customerName: '示例客户',
            }]}
          />
        ),
        headers: ['违法时间', '违法地点', '违法行为', '扣分', '罚款金额', '缴费状态', '是否处理', '采集单位'],
        filters: ['违法时间', '客户名称', '缴费状态', '是否处理'],
      },
      {
        element: (
          <DetailMovementRecordsTab
            onToast={onToast}
            rows={[{
              id: 'movement-1',
              startDate: '2026-01-05',
              estimatedEndDate: '2026-01-06',
              status: '已完成',
              destinationType: '维修站',
              destinationName: '示例维修站',
              movementType: '年审',
              estimatedMileageKm: 10,
              startMileageKm: 100,
              startBatteryKwh: 80,
              startHydrogenPct: 70,
              endMileageKm: 110,
              endBatteryKwh: 75,
              endHydrogenPct: 65,
              createdBy: '张三',
              createdAt: '2026-01-05 09:00',
            }]}
          />
        ),
        headers: ['异动开始日期', '异动预计结束日期', '异动状态', '异动目的地', '目的地名称', '异动类型', '预计异动里程 (km)', '异动开始里程 (km)', '异动开始电量 (kWh)', '异动开始氢量', '异动结束里程 (km)', '异动结束电量 (kWh)', '异动结束氢量', '创建人', '创建时间'],
        filters: ['异动开始日期', '异动目的地', '异动类型'],
      },
      {
        element: (
          <DetailTransferRecordsTab
            onToast={onToast}
            rows={[{
              id: 'transfer-1',
              transferDate: '2026-01-07',
              transferOutPerson: '张三',
              recipientPerson: '李四',
              departureArea: '出发区域',
              receivingArea: '接收区域',
              transferMethod: '自驾',
              departureParking: '出发停车场',
              receivingParking: '接收停车场',
              receiveDate: '2026-01-07',
            }]}
          />
        ),
        headers: ['调拨日期', '调出人', '接收人', '出发区域', '接收区域', '调拨方式', '出发停车场', '接收停车场', '接收日期'],
        filters: ['调拨日期', '调出人', '接收人'],
      },
      {
        element: (
          <DetailAnnualReviewRecordsTab
            onToast={onToast}
            rows={[{
              id: 'annual-1',
              inspectionValidUntil: '2027-01-01',
              inspectionStation: '检测站',
              inspectionCost: 280,
              m2Station: '二保站',
              m2Cost: 180,
              zbStation: '',
              zbCost: null,
              executor: '张三',
              executeTime: '2026-01-08 10:00',
            }]}
          />
        ),
        headers: ['检验有效期至', '检测服务站名称', '检测费用', '二保服务站名称', '二保费用', '整备服务站名称', '整备费用', '办理人', '完成时间'],
        filters: ['完成时间', '检验有效期', '办理人'],
      },
    ];

    for (const recordCase of cases) {
      rendered = await renderReact(recordCase.element);
      expect(tableHeaders(rendered.container)).toEqual(recordCase.headers);
      for (const label of recordCase.filters) {
        expect(rendered.container.textContent).toContain(label);
      }
      expect(buttonByName(rendered.container, '查询')).toBeTruthy();
      expect(buttonByName(rendered.container, '重置')).toBeTruthy();
      await rendered.unmount();
      rendered = undefined;
    }
  });

  it('renders the insurance overview, reference history fields, and file actions', async () => {
    const onToast = vi.fn();
    rendered = await renderReact(
      <DetailInsuranceRecordsTab
        record={vehicles[0] as VehicleRecord}
        insurance={{ compulsory: '2027-06-30', commercial: '2027-07-31' }}
        rows={[{
          id: 'insurance-1',
          vehicleId: String(vehicles[0].id),
          insuranceType: '交强险',
          expireDate: '2027-06-30',
          purchasedAt: '2026-06-30',
          fileName: '交强险保单.pdf',
          fileUrl: '/files/policy.pdf',
        }]}
        onToast={onToast}
      />,
    );

    expect(
      Array.from(rendered.container.querySelectorAll('.va-insurance-type strong'), (node) => node.textContent),
    ).toEqual(['交强险', '商业险', '超赔险', '驾意险', '货物险']);
    expect(rendered.container.textContent).toContain('保单号');
    expect(rendered.container.textContent).toContain('保险公司');
    expect(rendered.container.textContent).toContain('到期日期');
    expect(rendered.container.textContent).toContain('保费');
    expect(tableHeaders(rendered.container)).toEqual([
      '保险导入时间',
      '操作人',
      '类型',
      '保单号',
      '保险状态',
      '保险公司',
      '付款时间',
      '到期日期',
      '保单文件',
    ]);
    expect(rendered.container.textContent).toContain('—');

    await click(buttonByName(rendered.container, '预览'));
    await click(buttonByName(rendered.container, '下载'));

    expect(onToast).toHaveBeenNthCalledWith(1, '预览保单文件（原型演示）：交强险保单.pdf');
    expect(onToast).toHaveBeenNthCalledWith(2, '已开始下载：交强险保单.pdf（原型演示）');
  });

  it('renders the complete fault contract and global view/edit actions', async () => {
    const onView = vi.fn();
    const onEdit = vi.fn();
    const record = vehicles[0] as VehicleRecord;
    const row = {
      id: 'fault-1',
      plateNo: record.plateNo,
      faultNo: 'GZ-001',
      resolutionStatus: '已解决',
      brand: record.brand,
      model: record.model,
      operateCompany: record.operateCompany,
      faultLevel: 'L2',
      faultType: '冷机故障',
      faultDescription: '制冷异常',
      reportedAt: '2026-01-01 10:00',
      resolvedAt: '2026-01-01 12:00',
      aiMatched: true,
      lastOperator: '张三',
    };
    rendered = await renderReact(
      <DetailFaultRecordsTab
        record={record}
        rows={[row]}
        onViewFaultDetail={onView}
        onEditFaultRecord={onEdit}
      />,
    );

    expect(tableHeaders(rendered.container)).toEqual([
      '故障编号',
      '解决情况',
      '车牌号',
      '车辆品牌',
      '车辆型号',
      '运营公司',
      '故障等级',
      '故障类型',
      '故障描述',
      '上报时间',
      '解决时间',
      'AI匹配状态',
      '最后操作人',
      '操作',
    ]);
    for (const label of ['上报时间', '故障编号', '故障等级', '故障类型', '解决情况', 'AI匹配状态']) {
      expect(rendered.container.textContent).toContain(label);
    }

    await click(buttonByName(rendered.container, '查看'));
    await click(buttonByName(rendered.container, '编辑'));
    expect(onView).toHaveBeenCalledWith(record, row);
    expect(onEdit).toHaveBeenCalledWith(record, row);
  });
});
