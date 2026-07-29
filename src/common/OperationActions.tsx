import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  ArrowRightLeft,
  Car,
  CircleDollarSign,
  Download,
  Eye,
  FileText,
  MoreHorizontal,
  OctagonX,
  Pencil,
  RefreshCw,
  Settings2,
  Trash2,
  Undo2,
  Upload,
  Users,
  Wrench,
  type LucideIcon,
} from 'lucide-react';

export type OperationActionItem = {
  key: string;
  label: string;
  onClick: () => void;
  danger?: boolean;
  disabled?: boolean;
  hidden?: boolean;
  icon?: LucideIcon;
};

const MORE_ACTION_ICONS: Record<string, LucideIcon> = {
  edit: Pencil,
  del: Trash2,
  delete: Trash2,
  addVehicle: Car,
  renew: RefreshCw,
  authorized: FileText,
  extraFee: CircleDollarSign,
  toTripartite: Users,
  terminate: OctagonX,
  withdraw: Undo2,
  toFormal: ArrowRightLeft,
  stampSupplement: Upload,
  uploadStamped: Upload,
  manage: Settings2,
  preview: Eye,
  view: Eye,
  viewRecords: Eye,
  history: FileText,
  download: Download,
  failDetail: FileText,
  process: Wrench,
};

function renderMenuItemLabel(item: OperationActionItem) {
  const Icon = item.icon ?? MORE_ACTION_ICONS[item.key];
  return (
    <span
      className={['vm-op-menu-item', item.danger ? 'vm-op-menu-item--danger' : '']
        .filter(Boolean)
        .join(' ')}
    >
      {Icon ? (
        <Icon className="vm-op-menu-item__icon" aria-hidden strokeWidth={1.75} />
      ) : (
        <span className="vm-op-menu-item__icon-spacer" aria-hidden />
      )}
      <span className="vm-op-menu-item__label">{item.label}</span>
    </span>
  );
}

export type OperationPrimaryAction = {
  onClick: () => void;
  label?: string;
  hidden?: boolean;
  disabled?: boolean;
};

export type OperationActionsProps = {
  /**
   * 编辑：常用操作，固定外显（与 process 合计最多 2 个）。
   */
  edit?: OperationPrimaryAction;
  /**
   * 处理 / 处置：常用操作，固定外显。
   */
  process?: OperationPrimaryAction;
  /**
   * 查看 / 详情：对象详情入口，固定在外侧首位。
   * 历史型“查看记录 / 操作记录”应通过 more 传入。
   */
  view?: OperationPrimaryAction;
  /** 其余低频 / 危险操作收入「更多」下拉 */
  more?: OperationActionItem[];
  /** 更多按钮文案（仅 aria），默认「更多」 */
  moreLabel?: string;
  className?: string;
  annotationId?: string;
};

type PrimaryKind = 'edit' | 'process' | 'view';

const PrimaryActionButton = React.forwardRef<
  HTMLButtonElement,
  {
    kind: PrimaryKind | 'more';
    label: string;
    onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
    disabled?: boolean;
    ariaLabel: string;
    ariaHasPopup?: boolean;
    ariaExpanded?: boolean;
    className?: string;
  }
>(function PrimaryActionButton(
  { kind, label, onClick, disabled, ariaLabel, ariaHasPopup, ariaExpanded, className },
  ref,
) {
  const isMore = kind === 'more';
  const Icon =
    kind === 'edit' ? Pencil : kind === 'process' ? Wrench : kind === 'view' ? Eye : MoreHorizontal;

  return (
    <button
      ref={ref}
      type="button"
      className={[isMore ? 'vm-op-more-btn' : 'vm-op-action', className].filter(Boolean).join(' ')}
      aria-label={ariaLabel}
      aria-haspopup={ariaHasPopup ? 'menu' : undefined}
      aria-expanded={ariaExpanded}
      disabled={disabled}
      onClick={onClick}
    >
      {isMore ? (
        <MoreHorizontal className="vm-op-more-btn__icon" aria-hidden strokeWidth={1.75} />
      ) : (
        <>
          <Icon className="vm-op-action__icon" aria-hidden strokeWidth={1.75} />
          <span className="vm-op-action__label">{label}</span>
        </>
      )}
    </button>
  );
});

type MenuEntry =
  | { type: 'divider'; key: string }
  | { type: 'item'; item: OperationActionItem };

/**
 * 列表操作列（强制）：详情入口固定首位；有详情时编辑/处理只外显一个，
 * 无详情时编辑和处理可同时外显；外显操作总数最多两个。
 * 历史、低频管理和危险操作进入更多。
 */
export function OperationActions({
  edit,
  process,
  view,
  more = [],
  moreLabel = '更多',
  className,
  annotationId,
}: OperationActionsProps) {
  const [moreOpen, setMoreOpen] = useState(false);
  const [menuPos, setMenuPos] = useState<{ top: number; left: number } | null>(null);
  const moreBtnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const visibleEdit = edit && !edit.hidden ? edit : undefined;
  const visibleProcess = process && !process.hidden ? process : undefined;
  const visibleView = view && !view.hidden ? view : undefined;

  const outsidePrimaries = useMemo(() => {
    const list: Array<{ kind: PrimaryKind; action: OperationPrimaryAction; defaultLabel: string }> =
      [];
    if (visibleView) {
      list.push({
        kind: 'view',
        action: visibleView,
        defaultLabel: visibleView.label || '详情',
      });
    }
    if (visibleEdit) {
      list.push({ kind: 'edit', action: visibleEdit, defaultLabel: '编辑' });
    }
    if (visibleProcess && (!visibleView || !visibleEdit)) {
      list.push({
        kind: 'process',
        action: visibleProcess,
        defaultLabel: visibleProcess.label || '处理',
      });
    }
    return list.slice(0, 2);
  }, [visibleEdit, visibleProcess, visibleView]);

  const visibleMore = useMemo(() => {
    const items: OperationActionItem[] = [];
    more.forEach((item) => {
      if (item.hidden) return;
      if (visibleEdit && (item.key === 'edit' || item.label === '编辑' || item.label === '编辑合同')) {
        return;
      }
      if (
        visibleProcess &&
        (item.key === 'process' ||
          item.label === '处理' ||
          item.label === '处置' ||
          item.label === (visibleProcess.label || ''))
      ) {
        return;
      }
      if (
        visibleView &&
        (item.key === 'view' ||
          item.label === '查看' ||
          item.label === '详情' ||
          item.label === '查看详情')
      ) {
        return;
      }
      items.push(item);
    });
    return items;
  }, [more, visibleView, visibleEdit, visibleProcess]);

  const menuEntries = useMemo(() => {
    const entries: MenuEntry[] = [];
    visibleMore.forEach((item, index) => {
      if (item.danger && index > 0 && !visibleMore[index - 1]?.danger) {
        entries.push({ type: 'divider', key: `divider-${item.key}` });
      }
      entries.push({ type: 'item', item });
    });
    return entries;
  }, [visibleMore]);

  const showMore = visibleMore.length > 0;

  useLayoutEffect(() => {
    if (!moreOpen || !moreBtnRef.current) {
      setMenuPos(null);
      return;
    }
    const rect = moreBtnRef.current.getBoundingClientRect();
    const menuWidth = 176;
    const left = Math.min(
      Math.max(8, rect.right - menuWidth),
      window.innerWidth - menuWidth - 8,
    );
    setMenuPos({ top: rect.bottom + 4, left });
  }, [moreOpen]);

  useEffect(() => {
    if (!moreOpen) return;

    const onPointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node;
      if (moreBtnRef.current?.contains(target)) return;
      if (menuRef.current?.contains(target)) return;
      setMoreOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMoreOpen(false);
    };
    const onScroll = () => setMoreOpen(false);

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('touchstart', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', onScroll);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('touchstart', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', onScroll);
    };
  }, [moreOpen]);

  if (outsidePrimaries.length === 0 && !showMore) {
    return <span className="vm-operation-actions vm-operation-actions--empty">-</span>;
  }

  const menu =
    moreOpen && menuPos && typeof document !== 'undefined'
      ? createPortal(
          <div
            ref={menuRef}
            className="vm-op-dropdown"
            style={{ top: menuPos.top, left: menuPos.left }}
            role="presentation"
          >
            <div className="vm-op-dropdown-menu" role="menu" aria-label="更多操作">
              {menuEntries.map((entry) => {
                if (entry.type === 'divider') {
                  return <div key={entry.key} className="vm-op-dropdown-divider" role="separator" />;
                }
                const { item } = entry;
                return (
                  <button
                    key={item.key}
                    type="button"
                    role="menuitem"
                    className={[
                      'vm-op-dropdown-item',
                      item.danger ? 'vm-op-dropdown-item--danger' : '',
                      item.disabled ? 'vm-op-dropdown-item--disabled' : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    disabled={item.disabled}
                    onClick={(event) => {
                      event.stopPropagation();
                      if (item.disabled) return;
                      setMoreOpen(false);
                      item.onClick();
                    }}
                  >
                    {renderMenuItemLabel(item)}
                  </button>
                );
              })}
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <div
      className={['vm-row-actions', 'vm-operation-actions', className].filter(Boolean).join(' ')}
      data-annotation-id={annotationId}
      onClick={(event) => event.stopPropagation()}
    >
      {outsidePrimaries.map(({ kind, action, defaultLabel }) => (
        <PrimaryActionButton
          key={kind}
          kind={kind}
          label={action.label || defaultLabel}
          ariaLabel={action.label || defaultLabel}
          disabled={action.disabled}
          onClick={(event) => {
            event.stopPropagation();
            if (!action.disabled) action.onClick();
          }}
        />
      ))}
      {showMore ? (
        <>
          <PrimaryActionButton
            ref={moreBtnRef}
            kind="more"
            label={moreLabel}
            ariaLabel="更多操作"
            ariaHasPopup
            ariaExpanded={moreOpen}
            className={moreOpen ? 'vm-op-more-btn--open' : undefined}
            onClick={(event) => {
              event.stopPropagation();
              setMoreOpen((open) => !open);
            }}
          />
          {menu}
        </>
      ) : null}
    </div>
  );
}

const DETAIL_LABELS = new Set(['详情', '查看', '查看详情']);
const HISTORY_LABELS = new Set(['查看记录', '操作记录']);
const EDIT_LABELS = new Set(['编辑', '编辑合同']);
const PROCESS_LABELS = new Set(['处理', '处置', '还车', '办理']);

/**
 * 从扁平操作列表拆分：详情入口固定首位；有详情时编辑/处理只外显一个，
 * 无详情时编辑和处理可同时外显；外显操作总数最多两个。
 * 查看记录等历史操作进入更多。
 */
export function splitOperationActions(items: OperationActionItem[]): {
  edit?: OperationPrimaryAction;
  process?: OperationPrimaryAction;
  view?: OperationPrimaryAction;
  more: OperationActionItem[];
} {
  const visible = items.filter((item) => !item.hidden);
  const editItem = visible.find(
    (item) => item.key === 'edit' || EDIT_LABELS.has(item.label),
  );
  const processItem = visible.find(
    (item) =>
      item.key === 'process' ||
      item.key === 'handle' ||
      PROCESS_LABELS.has(item.label),
  );
  const viewItem = visible.find(
    (item) =>
      item.key !== 'viewRecords' &&
      item.key !== 'history' &&
      !HISTORY_LABELS.has(item.label) &&
      (item.key === 'view' || DETAIL_LABELS.has(item.label)),
  );
  const more = visible.filter(
    (item) =>
      item !== editItem &&
      item !== processItem &&
      item !== viewItem,
  );

  return {
    edit: editItem
      ? {
          onClick: editItem.onClick,
          label: editItem.label,
          disabled: editItem.disabled,
        }
      : undefined,
    process: processItem
      ? {
          onClick: processItem.onClick,
          label: processItem.label,
          disabled: processItem.disabled,
        }
      : undefined,
    view: viewItem
      ? {
          onClick: viewItem.onClick,
          label: viewItem.label,
          disabled: viewItem.disabled,
        }
      : undefined,
    more,
  };
}
