import React, { useEffect, useRef, useState } from 'react';
import {
  MoreHorizontal,
  Eye,
  Wrench,
  PauseCircle,
  BellRing,
} from 'lucide-react';
import type { FaultRecord } from '../types';

export interface FaultRowActionsMenuProps {
  row: FaultRecord;
  onView: (row: FaultRecord) => void;
  onHandle: (row: FaultRecord) => void;
  onSuspend: (row: FaultRecord) => void;
  onNotice: (row: FaultRecord) => void;
}

/** 台账操作列：仅 ⋯（DESIGN §3.17）；菜单首项「查看详情」 */
export const FaultRowActionsMenu: React.FC<FaultRowActionsMenuProps> = ({
  row,
  onView,
  onHandle,
  onSuspend,
  onNotice,
}) => {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  return (
    <div className={`v2-fh-actions-more${open ? ' is-open' : ''}`} ref={menuRef}>
      <button
        type="button"
        className={`v2-fh-btn-more${open ? ' is-active' : ''}`}
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="更多操作"
        title="更多操作"
      >
        <MoreHorizontal size={15} aria-hidden />
      </button>

      {open ? (
        <div className="v2-fh-actions-menu" role="menu">
          <button
            type="button"
            className="v2-fh-actions-menu__item"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              onView(row);
            }}
          >
            <Eye size={13} className="v2-fh-actions-menu__icon" aria-hidden />
            <div className="v2-fh-actions-menu__text">
              <span className="v2-fh-actions-menu__title">查看详情</span>
              <span className="v2-fh-actions-menu__sub">进入故障处置详情全页</span>
            </div>
          </button>

          {row.taskStatus !== 'archived' ? (
            <button
              type="button"
              className="v2-fh-actions-menu__item"
              role="menuitem"
              onClick={() => {
                setOpen(false);
                onHandle(row);
              }}
            >
              <Wrench size={13} className="v2-fh-actions-menu__icon" aria-hidden />
              <div className="v2-fh-actions-menu__text">
                <span className="v2-fh-actions-menu__title">处置与归档</span>
                <span className="v2-fh-actions-menu__sub">填写处置结果与索赔证据</span>
              </div>
            </button>
          ) : null}

          {row.taskStatus === 'processing' ? (
            <button
              type="button"
              className="v2-fh-actions-menu__item"
              role="menuitem"
              onClick={() => {
                setOpen(false);
                onSuspend(row);
              }}
            >
              <PauseCircle size={13} className="v2-fh-actions-menu__icon" aria-hidden />
              <div className="v2-fh-actions-menu__text">
                <span className="v2-fh-actions-menu__title">申请挂起</span>
                <span className="v2-fh-actions-menu__sub">挂起保护，不计处置时限</span>
              </div>
            </button>
          ) : null}

          <button
            type="button"
            className="v2-fh-actions-menu__item"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              onNotice(row);
            }}
          >
            <BellRing size={13} className="v2-fh-actions-menu__icon" aria-hidden />
            <div className="v2-fh-actions-menu__text">
              <span className="v2-fh-actions-menu__title">催办通知</span>
              <span className="v2-fh-actions-menu__sub">短信 / 邮件督办并留痕</span>
            </div>
          </button>
        </div>
      ) : null}
    </div>
  );
};
