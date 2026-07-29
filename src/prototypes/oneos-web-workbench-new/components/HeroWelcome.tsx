import React, { useEffect, useMemo, useState } from 'react';
import {
  Zap,
  ExternalLink,
  FileText,
  RotateCcw,
  Wrench,
  CreditCard,
  Receipt,
  Truck,
  Users,
  DollarSign,
  ShieldCheck,
  Calendar,
  Fuel,
  ChevronUp,
  Settings2,
  X,
  Check,
} from 'lucide-react';
import type { RoleConfig, RoleId } from '../types';
import {
  ALL_QUICK_LINKS,
  loadPinnedQuickLinks,
  savePinnedQuickLinks,
} from '../data/roles';
import { V2Select } from '../../../resources/design-system/components/UIComponents';

export interface HeroWelcomeProps {
  currentRole: RoleConfig;
  availableRoles: RoleConfig[];
  onRoleChange: (roleId: RoleId) => void;
}

const ICON_MAP: Record<string, React.ReactNode> = {
  FileText: <FileText size={13} />,
  RotateCcw: <RotateCcw size={13} />,
  Wrench: <Wrench size={13} />,
  CreditCard: <CreditCard size={13} />,
  Receipt: <Receipt size={13} />,
  Truck: <Truck size={13} />,
  Users: <Users size={13} />,
  DollarSign: <DollarSign size={13} />,
  ShieldCheck: <ShieldCheck size={13} />,
  Calendar: <Calendar size={13} />,
  Fuel: <Fuel size={13} />,
};

export const HeroWelcome: React.FC<HeroWelcomeProps> = ({
  currentRole,
  availableRoles,
  onRoleChange,
}) => {
  const [showQuickLinks, setShowQuickLinks] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [pinnedIds, setPinnedIds] = useState<string[]>(currentRole.defaultQuickLinks);
  const [draftIds, setDraftIds] = useState<string[]>([]);

  useEffect(() => {
    const loaded = loadPinnedQuickLinks(currentRole.id, currentRole.defaultQuickLinks);
    setPinnedIds(loaded);
  }, [currentRole.id, currentRole.defaultQuickLinks]);

  const getGreetingText = () => {
    const hour = new Date().getHours();
    if (hour < 12) return '早上好';
    if (hour < 18) return '下午好';
    return '晚上好';
  };

  const quickLinks = useMemo(
    () => ALL_QUICK_LINKS.filter((link) => pinnedIds.includes(link.id)),
    [pinnedIds],
  );

  const actionPool = ALL_QUICK_LINKS.filter((l) => l.category === 'action');
  const modulePool = ALL_QUICK_LINKS.filter((l) => l.category === 'module');

  const openEditor = () => {
    setDraftIds([...pinnedIds]);
    setEditOpen(true);
    setShowQuickLinks(true);
  };

  const toggleDraft = (id: string) => {
    setDraftIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const saveEditor = () => {
    const next = draftIds.length > 0 ? draftIds : currentRole.defaultQuickLinks;
    setPinnedIds(next);
    savePinnedQuickLinks(currentRole.id, next);
    setEditOpen(false);
  };

  return (
    <div className="v2-wb-hero">
      <div className="v2-wb-hero__top">
        <div className="v2-wb-hero__user-row">
          <div className="v2-wb-hero__avatar">{currentRole.operatorName.slice(0, 1)}</div>
          <div>
            <h1 className="v2-wb-hero__greeting">
              <span>
                {getGreetingText()}，{currentRole.operatorName}！
              </span>
              <span className="v2-wb-hero__role-badge">{currentRole.name}</span>
            </h1>
            <p className="v2-wb-hero__subtitle">
              今日工作已就绪。可通过快捷入口发起常用业务，或自定义常用功能入口。
            </p>
          </div>
        </div>

        <div className="v2-wb-hero__actions">
          <div style={{ width: 170 }}>
            <V2Select
              options={availableRoles.map((r) => ({
                value: r.id,
                label: `模拟: ${r.name}`,
              }))}
              value={currentRole.id}
              onChange={(val) => onRoleChange(val as RoleId)}
            />
          </div>

          <button
            type="button"
            className={`v2-wb-btn v2-wb-btn--secondary${showQuickLinks ? ' is-active' : ''}`}
            onClick={() => setShowQuickLinks((v) => !v)}
            aria-expanded={showQuickLinks}
            title="展开/收起常用快捷入口"
          >
            <Zap size={14} style={{ color: 'var(--oneos-primary)' }} />
            <span>常用快捷入口</span>
            <ChevronUp
              size={14}
              style={{
                transition: 'transform 0.15s ease',
                transform: showQuickLinks ? 'rotate(0deg)' : 'rotate(180deg)',
              }}
            />
          </button>
        </div>
      </div>

      {showQuickLinks && (
        <div className="v2-wb-quick-bar">
          <div className="v2-wb-quick-bar__links">
            {quickLinks.length === 0 ? (
              <span className="v2-wb-quick-bar__empty">尚未钉选入口，请点击「自定义」</span>
            ) : (
              quickLinks.map((link) => (
                <a key={link.id} href={link.href} className="v2-wb-quick-item">
                  {ICON_MAP[link.iconName] || <ExternalLink size={13} />}
                  <span>{link.title}</span>
                </a>
              ))
            )}
          </div>
          <button
            type="button"
            className="v2-wb-btn v2-wb-btn--secondary"
            onClick={openEditor}
          >
            <Settings2 size={13} />
            自定义
          </button>
        </div>
      )}

      {editOpen && (
        <div className="v2-wb-overlay" onClick={() => setEditOpen(false)} role="presentation">
          <div
            className="v2-wb-modal v2-wb-modal--wide"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="自定义快捷入口"
          >
            <div className="v2-wb-modal__head">
              <div className="v2-wb-modal__title">
                <Settings2 size={18} style={{ color: 'var(--oneos-primary)' }} />
                自定义快捷入口
              </div>
              <button
                type="button"
                className="v2-wb-icon-btn"
                onClick={() => setEditOpen(false)}
                aria-label="关闭"
              >
                <X size={18} />
              </button>
            </div>

            <p className="v2-wb-modal__desc">
              勾选需要钉选的入口，按当前角色「{currentRole.name}」分别记忆。
            </p>

            <div className="v2-wb-quick-edit">
              <div>
                <div className="v2-wb-quick-edit__section">快速发起</div>
                <div className="v2-wb-quick-edit__grid">
                  {actionPool.map((link) => {
                    const on = draftIds.includes(link.id);
                    return (
                      <button
                        key={link.id}
                        type="button"
                        className={`v2-wb-quick-edit__chip${on ? ' is-on' : ''}`}
                        onClick={() => toggleDraft(link.id)}
                      >
                        {on ? <Check size={12} /> : null}
                        {link.title}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <div className="v2-wb-quick-edit__section">功能入口</div>
                <div className="v2-wb-quick-edit__grid">
                  {modulePool.map((link) => {
                    const on = draftIds.includes(link.id);
                    return (
                      <button
                        key={link.id}
                        type="button"
                        className={`v2-wb-quick-edit__chip${on ? ' is-on' : ''}`}
                        onClick={() => toggleDraft(link.id)}
                      >
                        {on ? <Check size={12} /> : null}
                        {link.title}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="v2-wb-modal__foot">
              <button
                type="button"
                className="v2-wb-btn v2-wb-btn--secondary"
                onClick={() => setEditOpen(false)}
              >
                取消
              </button>
              <button type="button" className="v2-wb-btn v2-wb-btn--primary" onClick={saveEditor}>
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
