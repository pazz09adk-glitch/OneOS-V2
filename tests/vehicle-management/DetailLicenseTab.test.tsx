// @vitest-environment jsdom

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import React, { act } from 'react';
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
import { DetailLicenseTab } from '../../src/prototypes/vehicle-management/components/DetailLicenseTab';
import type { VehicleRecord } from '../../src/prototypes/vehicle-management/types';
import { daysUntilExpire } from '../../src/prototypes/vehicle-management/utils/vehicle';
import {
  DRIVER_LICENSE_WARN_DAYS,
  licenseStatusFromDays,
  resolveVehicleLicenses,
  STANDARD_LICENSE_WARN_DAYS,
  type VehicleLicenseGroup,
  type VehicleLicenseImage,
  VEHICLE_LICENSE_STATUS_LABELS,
} from '../../src/prototypes/vehicle-management/utils/vehicleLicenses';
import {
  buttonByName,
  click,
  renderReact,
  type RenderReactResult,
} from './detailTestUtils';

const REFERENCE_DATE = new Date(2026, 6, 26);
const DRIVER_FRONT_IMAGE = 'data:image/png;base64,iVBORw0KGgo=';
const DRIVER_BACK_IMAGE = 'data:image/png;base64,iVBORw0KGgo=back';

let rendered: RenderReactResult | undefined;
const scrollIntoView = vi.fn();
const originalScrollIntoViewDescriptor = Object.getOwnPropertyDescriptor(
  Element.prototype,
  'scrollIntoView',
);

beforeAll(() => {
  (
    globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }
  ).IS_REACT_ACT_ENVIRONMENT = true;

  Object.defineProperty(Element.prototype, 'scrollIntoView', {
    configurable: true,
    value: scrollIntoView,
  });
});

afterAll(() => {
  if (originalScrollIntoViewDescriptor) {
    Object.defineProperty(
      Element.prototype,
      'scrollIntoView',
      originalScrollIntoViewDescriptor,
    );
  } else {
    Reflect.deleteProperty(Element.prototype, 'scrollIntoView');
  }
});

beforeEach(() => {
  scrollIntoView.mockClear();
});

afterEach(async () => {
  await rendered?.unmount();
  rendered = undefined;
});

function makeVehicle(overrides: Partial<VehicleRecord> = {}): VehicleRecord {
  return {
    id: 'vehicle-fixture',
    plateNo: '粤A00000',
    vin: 'TESTVIN0000000001',
    vehicleNo: '0001',
    color: '',
    year: '',
    purchaseDate: '',
    parking: '',
    ownership: '',
    scrapDate: '2040-06-03',
    ratingTime: '',
    operateCompany: '',
    vehicleSource: '',
    leaseCompany: '',
    vehicleType: '',
    brand: '',
    model: '',
    customer: '',
    department: '',
    manager: '',
    contractNo: '',
    operateStatus: '',
    vehicleStatus: '',
    licenseStatus: '',
    insuranceStatus: '',
    mileage: '',
    location: '',
    gpsTime: '',
    regDate: '2025-06-03',
    inspectExpire: '2027-06-30',
    lastDeliveryTime: '',
    lastDeliveryMile: '',
    lastReturnTime: '',
    lastReturnMile: '',
    outStatus: '',
    onlineStatus: '',
    projectName: '',
    telematicsLinked: false,
    ...overrides,
  } satisfies VehicleRecord;
}

function makeGroupsWithDriverImage(): VehicleLicenseGroup[] {
  return makeGroupsWithDriverImages([
    {
      id: 'driver-front',
      src: DRIVER_FRONT_IMAGE,
      alt: '行驶证正页',
    },
    {
      id: 'driver-back',
      src: DRIVER_BACK_IMAGE,
      alt: '行驶证副页',
    },
    {
      id: 'driver-empty',
      src: '   ',
      alt: '空白图片',
    },
    {
      id: 'driver-script',
      src: 'javascript:alert(1)',
      alt: '脚本图片',
    },
  ]);
}

function makeGroupsWithDriverImages(
  images: VehicleLicenseImage[],
): VehicleLicenseGroup[] {
  return resolveVehicleLicenses(makeVehicle(), REFERENCE_DATE).map((group) => (
    group.id === 'driver'
      ? {
          ...group,
          images,
        }
      : group
  ));
}

function findClosingBrace(source: string, openingBraceIndex: number): number {
  let depth = 0;

  for (let index = openingBraceIndex; index < source.length; index += 1) {
    if (source[index] === '{') {
      depth += 1;
    } else if (source[index] === '}') {
      depth -= 1;
      if (depth === 0) return index;
    }
  }

  return -1;
}

function ruleFor(styles: string, selector: string): string {
  const selectorIndex = styles.indexOf(`${selector} {`);
  if (selectorIndex < 0) return '';
  const openingBraceIndex = styles.indexOf('{', selectorIndex);
  const closingBraceIndex = findClosingBrace(styles, openingBraceIndex);
  return styles.slice(selectorIndex, closingBraceIndex + 1);
}

function reducedMotionMatchMedia(query: string): MediaQueryList {
  return {
    matches: query === '(prefers-reduced-motion: reduce)',
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  };
}

describe('vehicle license view model', () => {
  it.each([
    ['2026-07-25', -1],
    ['2026-07-26', 0],
    ['2026-07-27', 1],
  ])(
    'counts %s from a local 2026-07-26 reference by calendar day',
    (targetDate, expectedDays) => {
      expect(daysUntilExpire(targetDate, REFERENCE_DATE)).toBe(expectedDays);
    },
  );

  it('exposes one frozen runtime source for the four status labels', () => {
    expect(VEHICLE_LICENSE_STATUS_LABELS).toEqual({
      normal: '正常',
      expiring: '临期',
      expired: '已到期',
      missing: '未上传',
    });
    expect(Object.isFrozen(VEHICLE_LICENSE_STATUS_LABELS)).toBe(true);
  });

  it('normalizes the eight license groups in the required order', () => {
    const groups = resolveVehicleLicenses(makeVehicle(), REFERENCE_DATE);

    expect(groups.map(({ id }) => id)).toEqual([
      'driver',
      'transport',
      'registration',
      'special-registration',
      'special-mark',
      'hydrogen-card',
      'safety-valve',
      'pressure-gauge',
    ]);
    expect(groups.map(({ label }) => label)).toEqual([
      '行驶证',
      '道路运输证',
      '登记证',
      '特种设备使用登记证',
      '特种设备使用标识',
      '加氢卡',
      '安全阀',
      '压力表',
    ]);
    expect(groups.every(({ images }) => images.length === 0)).toBe(true);
  });

  it('maps current vehicle fields without inventing unavailable license data', () => {
    const groups = resolveVehicleLicenses(makeVehicle(), REFERENCE_DATE);
    const driver = groups.find(({ id }) => id === 'driver');
    const transport = groups.find(({ id }) => id === 'transport');

    expect(driver?.fields).toEqual([
      { label: '注册日期', value: '2025-06-03' },
      { label: '发证日期', value: '—' },
      { label: '强制报废日期', value: '2040-06-03' },
      {
        label: '检验有效期至',
        value: '2027-06-30',
        expiryDays: 339,
      },
    ]);
    expect(driver).toMatchObject({
      status: 'normal',
      statusLabel: '正常',
    });
    expect(transport?.fields).toEqual([
      { label: '经营许可证号', value: '—' },
      { label: '核发时间', value: '—' },
      { label: '证件有效期', value: '—' },
      { label: '审验有效期', value: '—' },
    ]);
  });

  it('derives only the hydrogen card binding state from telematics linkage', () => {
    const bound = resolveVehicleLicenses(
      makeVehicle({ telematicsLinked: true }),
      REFERENCE_DATE,
    ).find(({ id }) => id === 'hydrogen-card');
    const missing = resolveVehicleLicenses(
      makeVehicle({ telematicsLinked: false }),
      REFERENCE_DATE,
    ).find(({ id }) => id === 'hydrogen-card');

    expect(bound).toMatchObject({
      status: 'normal',
      statusLabel: '正常',
      fields: [{ label: '绑定状态', value: '已绑定' }],
    });
    expect(missing).toMatchObject({
      status: 'missing',
      statusLabel: '未上传',
      fields: [{ label: '绑定状态', value: '未绑定' }],
    });
    expect(bound?.fields.some(({ label }) => label.includes('卡号'))).toBe(false);
  });

  it('keeps unavailable document groups explicit and missing', () => {
    const groups = resolveVehicleLicenses(makeVehicle(), REFERENCE_DATE);
    const byId = new Map(groups.map((group) => [group.id, group]));

    expect(byId.get('registration')?.fields).toEqual([]);
    expect(byId.get('special-registration')?.fields).toEqual([]);
    expect(byId.get('special-mark')?.fields).toEqual([
      { label: '下次检验日期', value: '—' },
    ]);
    expect(byId.get('safety-valve')?.fields).toEqual([
      { label: '本次检验日期', value: '—' },
      { label: '下次检测日期', value: '—' },
    ]);
    expect(byId.get('pressure-gauge')?.fields).toEqual([
      { label: '本次检验日期', value: '—' },
      { label: '下次检验日期', value: '—' },
    ]);

    for (const id of [
      'transport',
      'registration',
      'special-registration',
      'special-mark',
      'hydrogen-card',
      'safety-valve',
      'pressure-gauge',
    ] as const) {
      expect(byId.get(id)).toMatchObject({
        status: 'missing',
        statusLabel: '未上传',
      });
    }
  });

  it.each([
    ['blank', '   '],
    ['hyphen', ' - '],
    ['em dash', '—'],
  ])('normalizes %s driver metadata to em dashes and missing', (_name, emptyValue) => {
    const driver = resolveVehicleLicenses(
      makeVehicle({
        regDate: emptyValue,
        scrapDate: emptyValue,
        inspectExpire: emptyValue,
      }),
      REFERENCE_DATE,
    ).find(({ id }) => id === 'driver');

    expect(driver).toMatchObject({
      status: 'missing',
      statusLabel: '未上传',
    });
    expect(driver?.fields.map(({ value }) => value)).toEqual([
      '—',
      '—',
      '—',
      '—',
    ]);
  });

  it.each([
    ['registration date', { regDate: '2025-06-03' }],
    ['scrap date', { scrapDate: '2040-06-03' }],
    ['inspection expiry', { inspectExpire: '2027-06-30' }],
  ] satisfies Array<[string, Partial<VehicleRecord>]>)(
    'treats a driver license with only %s as partial metadata',
    (_name, presentMetadata) => {
      const driver = resolveVehicleLicenses(
        makeVehicle({
          regDate: '-',
          scrapDate: '-',
          inspectExpire: '-',
          ...presentMetadata,
        }),
        REFERENCE_DATE,
      ).find(({ id }) => id === 'driver');

      expect(driver).toMatchObject({
        status: 'normal',
        statusLabel: '正常',
        images: [],
      });
    },
  );

  it('labels fixed driver expiry dates as expiring or expired', () => {
    const expiring = resolveVehicleLicenses(
      makeVehicle({ inspectExpire: '2026-08-25' }),
      REFERENCE_DATE,
    ).find(({ id }) => id === 'driver');
    const expired = resolveVehicleLicenses(
      makeVehicle({ inspectExpire: '2026-07-25' }),
      REFERENCE_DATE,
    ).find(({ id }) => id === 'driver');

    expect(expiring).toMatchObject({
      status: 'expiring',
      statusLabel: '临期',
    });
    expect(expired).toMatchObject({
      status: 'expired',
      statusLabel: '已到期',
    });
  });

  it('uses an explicit reference date without mutating it', () => {
    const referenceDate = new Date(2030, 0, 15, 17, 30);
    const originalTimestamp = referenceDate.getTime();

    expect(daysUntilExpire('2030-01-16', referenceDate)).toBe(1);
    expect(
      (() => {
        const fields = resolveVehicleLicenses(
          makeVehicle({ inspectExpire: '2030-01-16' }),
          referenceDate,
        ).find(({ id }) => id === 'driver')?.fields ?? [];
        return fields[fields.length - 1]?.expiryDays;
      })(),
    ).toBe(1);
    expect(referenceDate.getTime()).toBe(originalTimestamp);
  });

  it('classifies document status from availability and remaining days', () => {
    expect(DRIVER_LICENSE_WARN_DAYS).toBe(90);
    expect(STANDARD_LICENSE_WARN_DAYS).toBe(60);
    expect(licenseStatusFromDays(120, 90, false)).toBe('missing');
    expect(licenseStatusFromDays(null, 90, true)).toBe('normal');
    expect(licenseStatusFromDays(-1, 90, true)).toBe('expired');
    expect(licenseStatusFromDays(0, 90, true)).toBe('expiring');
    expect(licenseStatusFromDays(90, 90, true)).toBe('expiring');
    expect(licenseStatusFromDays(91, 90, true)).toBe('normal');
    expect(licenseStatusFromDays(60, 60, true)).toBe('expiring');
    expect(licenseStatusFromDays(61, 60, true)).toBe('normal');
  });
});

describe('DetailLicenseTab', () => {
  it('renders eight keyboard-operable category buttons and a textual status legend', async () => {
    rendered = await renderReact(<DetailLicenseTab record={makeVehicle()} />);
    const nav = rendered.container.querySelector<HTMLElement>(
      'nav[aria-label="证照分类"]',
    );
    const buttons = Array.from(nav?.querySelectorAll('button') ?? []);
    const legend = rendered.container.querySelector<HTMLElement>(
      '[aria-label="证照状态图例"]',
    );

    expect(nav).not.toBeNull();
    expect(buttons).toHaveLength(8);
    expect(buttons.every((button) => button.tagName === 'BUTTON')).toBe(true);
    expect(buttons.map((button) => button.textContent?.trim())).toEqual([
      '行驶证',
      '道路运输证',
      '登记证',
      '特种设备使用登记证',
      '特种设备使用标识',
      '加氢卡',
      '安全阀',
      '压力表',
    ]);
    expect(legend?.textContent).toContain('正常');
    expect(legend?.textContent).toContain('临期');
    expect(legend?.textContent).toContain('已到期');
    expect(legend?.textContent).toContain('未上传');
    expect(legend?.querySelectorAll('[aria-hidden="true"]')).toHaveLength(4);
  });

  it('renders eight semantic cards, four driver fields, and V2 image empty states without fake images', async () => {
    rendered = await renderReact(<DetailLicenseTab record={makeVehicle()} />);
    const articles = rendered.container.querySelectorAll<HTMLElement>(
      'article[data-license-id]',
    );
    const driver = rendered.container.querySelector<HTMLElement>(
      'article[data-license-id="driver"]',
    );
    const driverLabels = Array.from(
      driver?.querySelectorAll('.va-license-description dt') ?? [],
      (label) => label.textContent?.trim(),
    );

    expect(articles).toHaveLength(8);
    expect(driverLabels).toEqual([
      '注册日期',
      '发证日期',
      '强制报废日期',
      '检验有效期至',
    ]);
    expect(rendered.container.textContent).toContain('暂无行驶证图片');
    expect(rendered.container.textContent).toContain('该证照尚未上传可预览图片');
    expect(rendered.container.querySelector('img')).toBeNull();
  });

  it('renders only allowlisted image URLs and rejects control-character protocol bypasses', async () => {
    const allowedImages: VehicleLicenseImage[] = [
      {
        id: 'allowed-https',
        src: 'https://cdn.example.com/license.png',
        alt: 'HTTPS 图片',
      },
      {
        id: 'allowed-http',
        src: 'http://cdn.example.com/license.png',
        alt: 'HTTP 图片',
      },
      {
        id: 'allowed-blob',
        src: 'blob:https://example.com/license-id',
        alt: 'Blob 图片',
      },
      {
        id: 'allowed-data',
        src: DRIVER_FRONT_IMAGE,
        alt: 'Data 图片',
      },
      {
        id: 'allowed-data-uppercase',
        src: 'DATA:IMAGE/PNG;BASE64,iVBORw0KGgo=',
        alt: '大写 Data 图片',
      },
      {
        id: 'allowed-root-relative',
        src: '/assets/license.png',
        alt: '根路径图片',
      },
      {
        id: 'allowed-relative',
        src: 'assets/license.png',
        alt: '相对路径图片',
      },
    ];
    const rejectedImages: VehicleLicenseImage[] = [
      { id: 'empty', src: '   ', alt: '空地址' },
      { id: 'javascript', src: 'javascript:alert(1)', alt: '脚本协议' },
      { id: 'javascript-newline', src: 'java\nscript:alert(1)', alt: '换行绕过' },
      { id: 'javascript-tab', src: 'java\tscript:alert(1)', alt: '制表符绕过' },
      { id: 'javascript-nul', src: '\0javascript:alert(1)', alt: 'NUL 绕过' },
      { id: 'data-text', src: 'data:text/html,<svg></svg>', alt: '文本 Data' },
      { id: 'data-space', src: 'data: image/png;base64,AAAA', alt: '变形 Data' },
      { id: 'mailto', src: 'mailto:test@example.com', alt: '邮件协议' },
      { id: 'invalid-url', src: 'http://[', alt: '无法解析地址' },
    ];

    rendered = await renderReact(
      <DetailLicenseTab
        record={makeVehicle()}
        groups={makeGroupsWithDriverImages([
          ...allowedImages,
          ...rejectedImages,
        ])}
      />,
    );
    const renderedAlts = Array.from(
      rendered.container.querySelectorAll<HTMLImageElement>(
        '.va-license-thumbnail img',
      ),
      (image) => image.alt,
    );

    expect(renderedAlts).toEqual(allowedImages.map(({ alt }) => alt));
    for (const { alt } of rejectedImages) {
      expect(renderedAlts).not.toContain(alt);
    }
  });

  it('uses the frozen status-label mapping instead of mutable injected label text', async () => {
    const groups = resolveVehicleLicenses(makeVehicle(), REFERENCE_DATE).map((group) => (
      group.id === 'driver'
        ? { ...group, statusLabel: '自定义状态文案' }
        : group
    ));

    rendered = await renderReact(
      <DetailLicenseTab record={makeVehicle()} groups={groups} />,
    );
    const driver = rendered.container.querySelector<HTMLElement>(
      'article[data-license-id="driver"]',
    );

    expect(driver?.textContent).toContain('正常');
    expect(driver?.textContent).not.toContain('自定义状态文案');
  });

  it('closes the accessible preview by its button and by Escape while restoring focus', async () => {
    rendered = await renderReact(
      <DetailLicenseTab
        record={makeVehicle()}
        groups={makeGroupsWithDriverImage()}
      />,
    );
    const thumbnail = buttonByName(rendered.container, '预览行驶证正页');

    expect(rendered.container.querySelectorAll('.va-license-thumbnail img')).toHaveLength(2);
    expect(rendered.container.querySelector('img[alt="空白图片"]')).toBeNull();
    expect(rendered.container.querySelector('img[alt="脚本图片"]')).toBeNull();
    thumbnail.focus();
    await click(thumbnail);

    const dialog = document.body.querySelector<HTMLElement>(
      '[role="dialog"][aria-label="证照图片预览"]',
    );
    const closeButton = buttonByName(dialog ?? document.body, '关闭预览');
    const previewImage = dialog?.querySelector<HTMLImageElement>('img');

    expect(dialog).not.toBeNull();
    expect(previewImage?.getAttribute('src')).toBe(DRIVER_FRONT_IMAGE);
    expect(previewImage?.getAttribute('alt')).toBe('行驶证正页');
    expect(closeButton.type).toBe('button');
    expect(document.activeElement).toBe(closeButton);

    await click(closeButton);

    expect(document.body.querySelector('[role="dialog"][aria-label="证照图片预览"]')).toBeNull();
    expect(document.activeElement).toBe(thumbnail);

    await click(thumbnail);

    const reopenedDialog = document.body.querySelector<HTMLElement>(
      '[role="dialog"][aria-label="证照图片预览"]',
    );
    const reopenedCloseButton = buttonByName(
      reopenedDialog ?? document.body,
      '关闭预览',
    );

    expect(reopenedDialog).not.toBeNull();
    expect(document.activeElement).toBe(reopenedCloseButton);

    await act(async () => {
      document.dispatchEvent(new KeyboardEvent('keydown', {
        key: 'Escape',
        bubbles: true,
      }));
    });

    expect(document.body.querySelector('[role="dialog"][aria-label="证照图片预览"]')).toBeNull();
    expect(document.activeElement).toBe(thumbnail);
  });

  it('isolates the modal, traps Tab focus, and restores document state after closing', async () => {
    const previousBodyOverflow = document.body.style.overflow;
    const preInertSibling = document.createElement('section');
    const backgroundButton = document.createElement('button');
    preInertSibling.setAttribute('inert', 'persisted');
    preInertSibling.appendChild(backgroundButton);
    document.body.appendChild(preInertSibling);
    document.body.style.overflow = 'clip';
    const addEventListener = vi.spyOn(document, 'addEventListener');
    const removeEventListener = vi.spyOn(document, 'removeEventListener');

    try {
      rendered = await renderReact(
        <DetailLicenseTab
          record={makeVehicle()}
          groups={makeGroupsWithDriverImage()}
        />,
      );
      const thumbnail = buttonByName(rendered.container, '预览行驶证正页');
      await click(thumbnail);

      const dialog = document.body.querySelector<HTMLElement>(
        '[role="dialog"][aria-label="证照图片预览"]',
      );
      const closeButton = buttonByName(dialog ?? document.body, '关闭预览');
      const addedKeydownListeners = addEventListener.mock.calls
        .filter(([type]) => type === 'keydown')
        .map(([, listener]) => listener);

      expect(rendered.container.hasAttribute('inert')).toBe(true);
      expect(preInertSibling.hasAttribute('inert')).toBe(true);
      expect(document.body.style.overflow).toBe('hidden');

      await act(async () => {
        closeButton.dispatchEvent(new KeyboardEvent('keydown', {
          key: 'Tab',
          bubbles: true,
        }));
      });
      expect(document.activeElement).toBe(closeButton);

      await act(async () => {
        closeButton.dispatchEvent(new KeyboardEvent('keydown', {
          key: 'Tab',
          shiftKey: true,
          bubbles: true,
        }));
      });
      expect(document.activeElement).toBe(closeButton);

      backgroundButton.focus();
      expect(document.activeElement).toBe(backgroundButton);
      await act(async () => {
        backgroundButton.dispatchEvent(new KeyboardEvent('keydown', {
          key: 'Tab',
          bubbles: true,
        }));
      });
      expect(document.activeElement).toBe(closeButton);

      await click(closeButton);

      const removedKeydownListeners = removeEventListener.mock.calls
        .filter(([type]) => type === 'keydown')
        .map(([, listener]) => listener);
      expect(rendered.container.hasAttribute('inert')).toBe(false);
      expect(preInertSibling.getAttribute('inert')).toBe('persisted');
      expect(document.body.style.overflow).toBe('clip');
      expect(removedKeydownListeners.some((listener) => (
        addedKeydownListeners.includes(listener)
      ))).toBe(true);
    } finally {
      addEventListener.mockRestore();
      removeEventListener.mockRestore();
      preInertSibling.remove();
      document.body.style.overflow = previousBodyOverflow;
    }
  });

  it('restores modal isolation when unmounted while the preview is open', async () => {
    const previousBodyOverflow = document.body.style.overflow;
    const sibling = document.createElement('div');
    document.body.appendChild(sibling);
    document.body.style.overflow = 'clip';

    try {
      rendered = await renderReact(
        <DetailLicenseTab
          record={makeVehicle()}
          groups={makeGroupsWithDriverImage()}
        />,
      );
      await click(buttonByName(rendered.container, '预览行驶证正页'));

      expect(sibling.hasAttribute('inert')).toBe(true);
      expect(document.body.style.overflow).toBe('hidden');

      await rendered.unmount();
      rendered = undefined;

      expect(sibling.hasAttribute('inert')).toBe(false);
      expect(document.body.style.overflow).toBe('clip');
    } finally {
      sibling.remove();
      document.body.style.overflow = previousBodyOverflow;
    }
  });

  it('does not restore focus to a preview trigger that has been disconnected', async () => {
    rendered = await renderReact(
      <DetailLicenseTab
        record={makeVehicle()}
        groups={makeGroupsWithDriverImage()}
      />,
    );
    const thumbnail = buttonByName(rendered.container, '预览行驶证副页');
    const focus = vi.spyOn(thumbnail, 'focus');
    thumbnail.focus();
    await click(thumbnail);
    focus.mockClear();
    rendered.container.remove();

    await act(async () => {
      document.dispatchEvent(new KeyboardEvent('keydown', {
        key: 'Escape',
        bubbles: true,
      }));
    });

    expect(document.body.querySelector('[role="dialog"][aria-label="证照图片预览"]')).toBeNull();
    expect(focus).not.toHaveBeenCalled();
    expect(document.activeElement).not.toBe(thumbnail);
    focus.mockRestore();
  });

  it('keeps dialog clicks open and closes from the scrim', async () => {
    rendered = await renderReact(
      <DetailLicenseTab
        record={makeVehicle()}
        groups={makeGroupsWithDriverImage()}
      />,
    );
    const thumbnail = buttonByName(rendered.container, '预览行驶证正页');
    await click(thumbnail);
    const scrim = document.body.querySelector<HTMLElement>(
      '.va-license-preview-scrim',
    );
    const dialog = document.body.querySelector<HTMLElement>(
      '[role="dialog"][aria-label="证照图片预览"]',
    );

    await act(async () => {
      dialog?.click();
    });
    expect(document.body.querySelector('[role="dialog"][aria-label="证照图片预览"]')).not.toBeNull();

    await act(async () => {
      scrim?.click();
    });
    expect(document.body.querySelector('[role="dialog"][aria-label="证照图片预览"]')).toBeNull();
    expect(document.activeElement).toBe(thumbnail);
  });

  it('opens the second real image and restores focus to its own trigger', async () => {
    rendered = await renderReact(
      <DetailLicenseTab
        record={makeVehicle()}
        groups={makeGroupsWithDriverImage()}
      />,
    );
    const secondThumbnail = buttonByName(rendered.container, '预览行驶证副页');
    secondThumbnail.focus();
    await click(secondThumbnail);
    const dialog = document.body.querySelector<HTMLElement>(
      '[role="dialog"][aria-label="证照图片预览"]',
    );

    expect(dialog?.querySelector('img')?.getAttribute('src')).toBe(DRIVER_BACK_IMAGE);
    expect(dialog?.querySelector('img')?.getAttribute('alt')).toBe('行驶证副页');

    await click(buttonByName(dialog ?? document.body, '关闭预览'));

    expect(document.activeElement).toBe(secondThumbnail);
  });

  it('uses V2 surface fallbacks in each scoped license rule', () => {
    const styles = readFileSync(
      resolve(
        process.cwd(),
        'src/prototypes/vehicle-management/style.css',
      ),
      'utf8',
    );
    const expectedBackground = (
      'background: var(--ln-surface-pearl, var(--ln-canvas-soft, #f8fafc));'
    );

    for (const selector of [
      '.va-license-toolbar',
      '.va-license-thumbnail',
      '.va-license-image-empty',
      '.va-license-preview__close:hover',
      '.va-license-preview__canvas',
    ]) {
      expect(ruleFor(styles, selector)).toContain(expectedBackground);
    }
  });

  it('smoothly scrolls the selected native index button to its card', async () => {
    rendered = await renderReact(<DetailLicenseTab record={makeVehicle()} />);
    const nav = rendered.container.querySelector<HTMLElement>(
      'nav[aria-label="证照分类"]',
    );
    const driverButton = buttonByName(nav ?? rendered.container, '行驶证');

    expect(driverButton.tagName).toBe('BUTTON');
    expect(driverButton.type).toBe('button');

    await click(driverButton);

    expect(scrollIntoView).toHaveBeenCalledOnce();
    expect(scrollIntoView).toHaveBeenCalledWith({
      behavior: 'smooth',
      block: 'start',
    });
  });

  it('uses auto scrolling when reduced motion is requested and restores matchMedia', async () => {
    rendered = await renderReact(<DetailLicenseTab record={makeVehicle()} />);
    const originalMatchMediaDescriptor = Object.getOwnPropertyDescriptor(
      window,
      'matchMedia',
    );
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      value: vi.fn(reducedMotionMatchMedia),
    });

    try {
      const nav = rendered.container.querySelector<HTMLElement>(
        'nav[aria-label="证照分类"]',
      );
      await click(buttonByName(nav ?? rendered.container, '道路运输证'));

      expect(scrollIntoView).toHaveBeenCalledWith({
        behavior: 'auto',
        block: 'start',
      });
    } finally {
      if (originalMatchMediaDescriptor) {
        Object.defineProperty(
          window,
          'matchMedia',
          originalMatchMediaDescriptor,
        );
      } else {
        Reflect.deleteProperty(window, 'matchMedia');
      }
    }
  });
});
