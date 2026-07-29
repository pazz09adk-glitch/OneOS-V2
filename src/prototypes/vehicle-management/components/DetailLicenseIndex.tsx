import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import {
  ChevronLeft,
  ChevronRight,
  Download,
  FileImage,
  ShieldCheck,
  X,
} from 'lucide-react';
import { V2Empty } from '../../../resources/design-system/components/UIComponents';
import type { VehicleRecord } from '../types';
import { isShanghaiPlate } from '../utils/vehicle';
import {
  resolveVehicleLicenses,
  VEHICLE_LICENSE_STATUS_LABELS,
  type VehicleLicenseGroup,
  type VehicleLicenseImage,
  type VehicleLicenseStatus,
} from '../utils/vehicleLicenses';

export interface DetailLicenseIndexProps {
  record: VehicleRecord;
  groups?: VehicleLicenseGroup[];
  onToast?: (message: string) => void;
}

interface LicenseGalleryItem {
  image: VehicleLicenseImage;
  groupId: VehicleLicenseGroup['id'];
  groupLabel: string;
}

interface LicensePreviewState {
  /** 当前预览所属证照 */
  groupId: VehicleLicenseGroup['id'];
  /** 组内图片下标；无图时为 -1 */
  index: number;
  trigger: HTMLButtonElement;
}

const LICENSE_STATUS_ORDER = [
  'normal',
  'expiring',
  'expired',
  'missing',
] as const satisfies readonly VehicleLicenseStatus[];

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'area[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[contenteditable="true"]',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

function hasRenderableSource(image: VehicleLicenseImage): boolean {
  const source = image.src.trim();
  if (!source || /[\u0000-\u001f\u007f]/.test(source)) return false;

  let baseUrl = 'http://localhost/';
  if (typeof document !== 'undefined' && document.baseURI) {
    try {
      const documentUrl = new URL(document.baseURI);
      if (documentUrl.protocol === 'http:' || documentUrl.protocol === 'https:') {
        baseUrl = documentUrl.href;
      }
    } catch {
      // keep fallback
    }
  }

  try {
    const parsedUrl = new URL(source, baseUrl);
    if (parsedUrl.protocol === 'data:') {
      return /^data:image\//i.test(source)
        && /^data:image\//i.test(parsedUrl.href);
    }
    return parsedUrl.protocol === 'http:'
      || parsedUrl.protocol === 'https:'
      || parsedUrl.protocol === 'blob:';
  } catch {
    return false;
  }
}

function focusableElements(dialog: HTMLElement): HTMLElement[] {
  return Array.from(dialog.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR))
    .filter((element) => (
      !element.hidden
      && element.getAttribute('aria-hidden') !== 'true'
      && !element.closest('[inert]')
    ));
}

function downloadFileName(image: VehicleLicenseImage): string {
  const base = image.alt.replace(/[\\/:*?"<>|]+/g, '_').trim() || '证照图片';
  if (image.src.startsWith('data:image/svg')) return `${base}.svg`;
  if (image.src.startsWith('data:image/png')) return `${base}.png`;
  if (image.src.startsWith('data:image/jpeg') || image.src.startsWith('data:image/jpg')) {
    return `${base}.jpg`;
  }
  return `${base}.png`;
}

function downloadLicenseImage(image: VehicleLicenseImage): void {
  const anchor = document.createElement('a');
  anchor.href = image.src;
  anchor.download = downloadFileName(image);
  anchor.rel = 'noopener';
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
}

/** 预览字段空值：统一文案「未上传」，不展示横杠 */
function isPreviewEmptyValue(value: unknown): boolean {
  const raw = String(value ?? '').trim();
  return !raw || raw === '-' || raw === '—';
}

function formatPreviewFieldValue(value: unknown): string {
  return isPreviewEmptyValue(value) ? '未上传' : String(value).trim();
}

function formatAnnualValidUntil(record: VehicleRecord): string {
  const raw = String(record.inspectExpire || '').trim();
  if (isPreviewEmptyValue(raw)) return '未上传';
  return raw.slice(0, 10);
}

export function DetailLicenseIndex({
  record,
  groups,
  onToast,
}: DetailLicenseIndexProps) {
  const licenses = useMemo(
    () => groups ?? resolveVehicleLicenses(record),
    [groups, record],
  );
  const [activeId, setActiveId] = useState<VehicleLicenseGroup['id']>(
    () => licenses[0]?.id ?? 'driver',
  );
  const [preview, setPreview] = useState<LicensePreviewState | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const scrimRef = useRef<HTMLDivElement>(null);
  const shanghai = isShanghaiPlate(record.plateNo);
  const annualValidUntil = formatAnnualValidUntil(record);

  const imagesByGroup = useMemo(() => {
    const map = new Map<VehicleLicenseGroup['id'], LicenseGalleryItem[]>();
    licenses.forEach((group) => {
      map.set(
        group.id,
        group.images
          .filter(hasRenderableSource)
          .map((image) => ({
            image,
            groupId: group.id,
            groupLabel: group.label,
          })),
      );
    });
    return map;
  }, [licenses]);

  const previewGroup = preview
    ? licenses.find((group) => group.id === preview.groupId) ?? null
    : null;
  const previewItems = preview
    ? imagesByGroup.get(preview.groupId) ?? []
    : [];
  const currentItem = preview && preview.index >= 0
    ? previewItems[preview.index] ?? null
    : null;
  const canPage = previewItems.length > 1;
  const showShanghaiAnnual = Boolean(
    preview
    && preview.groupId === 'driver'
    && shanghai,
  );

  const closePreview = useCallback(() => {
    setPreview(null);
  }, []);

  const openGroupPreview = useCallback((
    groupId: VehicleLicenseGroup['id'],
    trigger: HTMLButtonElement,
  ) => {
    setActiveId(groupId);
    const items = imagesByGroup.get(groupId) ?? [];
    setPreview({
      groupId,
      index: items.length ? 0 : -1,
      trigger,
    });
  }, [imagesByGroup]);

  const goPreview = useCallback((delta: number) => {
    setPreview((current) => {
      if (!current) return current;
      const items = imagesByGroup.get(current.groupId) ?? [];
      if (items.length <= 1) return current;
      const next = (current.index + delta + items.length) % items.length;
      return { ...current, index: next };
    });
  }, [imagesByGroup]);

  const handleDownload = useCallback((image: VehicleLicenseImage) => {
    downloadLicenseImage(image);
    onToast?.(`已开始下载：${downloadFileName(image)}（原型演示）`);
  }, [onToast]);

  useEffect(() => {
    if (!licenses.some((group) => group.id === activeId) && licenses[0]) {
      setActiveId(licenses[0].id);
    }
  }, [activeId, licenses]);

  useEffect(() => {
    if (!preview) return undefined;

    const trigger = preview.trigger;
    const scrim = scrimRef.current;
    const dialog = dialogRef.current;
    const bodyOverflow = document.body.style.overflow;
    const inertSnapshots = Array.from(document.body.children)
      .filter((element) => element !== scrim)
      .map((element) => ({
        element,
        hadAttribute: element.hasAttribute('inert'),
        attributeValue: element.getAttribute('inert'),
      }));

    inertSnapshots.forEach(({ element, hadAttribute }) => {
      if (!hadAttribute) element.setAttribute('inert', '');
    });
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        closePreview();
        return;
      }
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        goPreview(-1);
        return;
      }
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        goPreview(1);
        return;
      }
      if (event.key !== 'Tab' || !dialog) return;

      const focusable = focusableElements(dialog);
      if (!focusable.length) {
        event.preventDefault();
        dialog.focus();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const activeElement = document.activeElement;
      const focusIsOutside = !dialog.contains(activeElement);
      if (event.shiftKey && (focusIsOutside || activeElement === first)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (focusIsOutside || activeElement === last)) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    (closeButtonRef.current
      ?? focusableElements(dialog ?? document.body)[0]
      ?? dialog)?.focus();

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      inertSnapshots.forEach(({ element, hadAttribute, attributeValue }) => {
        if (hadAttribute) {
          element.setAttribute('inert', attributeValue ?? '');
        } else {
          element.removeAttribute('inert');
        }
      });
      document.body.style.overflow = bodyOverflow;
      if (trigger.isConnected && document.contains(trigger)) {
        trigger.focus();
      }
    };
  }, [closePreview, goPreview, preview]);

  return (
    <>
      <section
        className="va-form-card va-license-index-card"
        aria-label="证照情况"
        data-annotation-id="vm-detail-license-index"
      >
        <h3 className="va-form-aside__title">
          <ShieldCheck size={18} aria-hidden />
          证照情况
        </h3>

        <div className="va-license-index-legend" aria-label="证照状态图例">
          {LICENSE_STATUS_ORDER.map((status) => (
            <span key={status} className={`va-license-state is-${status}`}>
              <span className="va-license-state__dot" aria-hidden="true" />
              <span>{VEHICLE_LICENSE_STATUS_LABELS[status]}</span>
            </span>
          ))}
        </div>

        <ul className="va-license-index-list">
          {licenses.map((group) => {
            const selected = group.id === activeId;
            return (
              <li key={group.id}>
                <button
                  type="button"
                  className={[
                    'va-license-index-item',
                    `is-${group.status}`,
                    selected ? 'is-selected' : '',
                  ].filter(Boolean).join(' ')}
                  aria-current={selected ? 'true' : undefined}
                  onClick={(event) => {
                    openGroupPreview(group.id, event.currentTarget);
                  }}
                >
                  <span className="va-license-index-item__label">{group.label}</span>
                  <span
                    className={`va-license-state__dot is-${group.status}`}
                    aria-label={VEHICLE_LICENSE_STATUS_LABELS[group.status]}
                  />
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      {preview && typeof document !== 'undefined'
        ? createPortal(
            <div
              ref={scrimRef}
              className="va-license-preview-scrim"
              role="presentation"
              onClick={(event) => {
                if (event.currentTarget === event.target) closePreview();
              }}
            >
              <div
                ref={dialogRef}
                className="va-license-preview"
                role="dialog"
                aria-modal="true"
                aria-label={`${previewGroup?.label || '证照'}预览`}
                tabIndex={-1}
              >
                <header className="va-license-preview__header">
                  <div className="va-license-preview__titles">
                    <h2>{previewGroup?.label || '证照预览'}</h2>
                    <p className="va-license-preview__meta tabular-nums">
                      {previewGroup?.statusLabel
                        ? `状态：${previewGroup.statusLabel}`
                        : null}
                      {currentItem
                        ? (
                          <>
                            {previewGroup?.statusLabel ? ' · ' : null}
                            {currentItem.image.alt}
                            {' · '}
                            {preview.index + 1}
                            {' / '}
                            {previewItems.length}
                          </>
                        )
                        : (
                          <>
                            {previewGroup?.statusLabel ? ' · ' : null}
                            暂无图片
                          </>
                        )}
                    </p>
                  </div>
                  <div className="va-license-preview__actions">
                    {currentItem ? (
                      <button
                        type="button"
                        className="va-license-preview__action"
                        onClick={() => handleDownload(currentItem.image)}
                      >
                        <Download size={16} aria-hidden="true" />
                        下载
                      </button>
                    ) : null}
                    <button
                      ref={closeButtonRef}
                      type="button"
                      className="va-license-preview__close"
                      aria-label="关闭预览"
                      onClick={closePreview}
                    >
                      <X size={18} aria-hidden="true" />
                    </button>
                  </div>
                </header>

                {previewGroup?.fields?.length ? (
                  <dl className="va-license-preview__fields" aria-label={`${previewGroup.label}关键字段`}>
                    {previewGroup.fields.map((field) => {
                      const days = field.expiryDays;
                      let expiryHint: string | null = null;
                      if (typeof days === 'number') {
                        if (days < 0) expiryHint = `已过期 ${Math.abs(days)} 天`;
                        else if (days <= 30) expiryHint = `临期剩 ${days} 天`;
                        else expiryHint = `剩余 ${days} 天`;
                      }
                      return (
                        <div key={`${previewGroup.id}-${field.label}`} className="va-license-preview__field">
                          <dt>{field.label}</dt>
                          <dd>
                            <span className={isPreviewEmptyValue(field.value) ? 'is-empty' : 'tabular-nums'}>
                              {formatPreviewFieldValue(field.value)}
                            </span>
                            {expiryHint ? (
                              <em className={`va-license-preview__expiry is-${days != null && days < 0 ? 'expired' : days != null && days <= 30 ? 'expiring' : 'ok'}`}>
                                {expiryHint}
                              </em>
                            ) : null}
                          </dd>
                        </div>
                      );
                    })}
                    {showShanghaiAnnual ? (
                      <div className="va-license-preview__field">
                        <dt>年审有效期</dt>
                        <dd>
                          <span className={annualValidUntil === '未上传' ? 'is-empty' : 'tabular-nums'}>
                            {annualValidUntil}
                          </span>
                          <em className="va-license-preview__expiry is-ok">沪牌专属</em>
                        </dd>
                      </div>
                    ) : null}
                  </dl>
                ) : null}

                <div className="va-license-preview__stage">
                  {canPage ? (
                    <button
                      type="button"
                      className="va-license-preview__nav is-prev"
                      aria-label="上一张"
                      onClick={() => goPreview(-1)}
                    >
                      <ChevronLeft size={22} aria-hidden="true" />
                    </button>
                  ) : null}

                  <div className="va-license-preview__canvas">
                    {currentItem ? (
                      <img
                        key={currentItem.image.id}
                        src={currentItem.image.src}
                        alt={currentItem.image.alt}
                      />
                    ) : (
                      <V2Empty
                        type="empty"
                        size="compact"
                        className="va-license-preview-empty"
                        icon={<FileImage size={28} aria-hidden="true" />}
                        title="未上传"
                        description={`${previewGroup?.label || '该证照'}尚未上传图片`}
                        primaryActionText=""
                      />
                    )}
                  </div>

                  {canPage ? (
                    <button
                      type="button"
                      className="va-license-preview__nav is-next"
                      aria-label="下一张"
                      onClick={() => goPreview(1)}
                    >
                      <ChevronRight size={22} aria-hidden="true" />
                    </button>
                  ) : null}
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
