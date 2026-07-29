/**
 * @name 业财闭环汇报
 * @description 租赁→能源→采购业财一体化可汇报页：公式、七条链、收付对照、门禁与拍板；链到 bfcl 原型
 */
import './style.css';
import React, { useEffect, useMemo, useState } from 'react';
import {
  type AnnotationSourceDocument,
  type AnnotationViewerOptions,
} from '@axhub/annotation';
import {
  ArrowRight,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Flag,
  GitBranch,
  Layers,
  MonitorPlay,
  Scale,
  Sparkles,
  Users,
  Wallet,
  X,
} from 'lucide-react';
import { PrototypeAnnotationHost } from '../../common/prototype-annotation-host';
import { clearHostPrototypeRouteInfo } from '../../common/useHashPage';
import {
  BRIEFING_META,
  CHAIN_MODULES,
  DECISIONS,
  FINANCE_HUB,
  GATES,
  PAYMENT_ROWS,
  RECEIPT_ROWS,
  ROLE_CARDS,
  type ChainModule,
} from './chains';
import {
  scrollToSection,
  usePresentationStep,
  useScrollSpy,
  useScrolledPast,
} from './hooks';
import annotationSourceDocument from './annotation-source.json';

function outcomeClass(tone: 'ok' | 'warn' | 'danger') {
  return `bfbf-outcome bfbf-outcome--${tone}`;
}

function ModuleCard({
  module,
  active,
  index,
  moduleCount,
}: {
  module: ChainModule;
  active: boolean;
  index: number;
  moduleCount: number;
}) {
  const Icon = module.icon;
  const sectionId = `bfbf-${module.id}`;

  return (
    <article
      className={`bfbf-module bfbf-module--${module.accent}${active ? ' is-active' : ''}`}
      id={sectionId}
      data-annotation-id={`bfbf-mod-${module.id}`}
      style={{ '--bfbf-index': index } as React.CSSProperties}
    >
      <div className="bfbf-module-rail" aria-hidden>
        <span className="bfbf-module-rail-dot" />
        {index < moduleCount - 1 && <span className="bfbf-module-rail-line" />}
      </div>

      <div className="bfbf-module-panel">
        <header className="bfbf-module-header">
          <div className="bfbf-module-icon-wrap">
            <Icon size={22} aria-hidden />
          </div>
          <div className="bfbf-module-titles">
            <span className="bfbf-module-step">
              {module.step === 0 ? '财务中枢' : `第 ${module.step} 步`}
            </span>
            <h2>{module.title}</h2>
            <p className="bfbf-module-subtitle">{module.subtitle}</p>
          </div>
        </header>

        <div className="bfbf-roles" aria-label="责任部门">
          {module.roles.map((role) => (
            <span key={role} className="bfbf-role-tag">
              {role}
            </span>
          ))}
        </div>

        <div className="bfbf-module-body">
          <section className="bfbf-block bfbf-block--start" aria-labelledby={`${sectionId}-start`}>
            <h3 className="bfbf-block-label" id={`${sectionId}-start`}>
              <span className="bfbf-block-icon">
                <Flag size={15} aria-hidden />
              </span>
              起点
            </h3>
            <p>{module.start}</p>
          </section>

          <section
            className="bfbf-block bfbf-block--process"
            aria-labelledby={`${sectionId}-process`}
          >
            <h3 className="bfbf-block-label" id={`${sectionId}-process`}>
              <span className="bfbf-block-icon">
                <GitBranch size={15} aria-hidden />
              </span>
              怎么运作
            </h3>
            <ol className="bfbf-process-steps">
              {module.process.map((item, stepIdx) => (
                <li key={item}>
                  <span className="bfbf-process-num">{stepIdx + 1}</span>
                  <span>{item}</span>
                </li>
              ))}
            </ol>
            {module.outcomes && (
              <div className="bfbf-outcomes" aria-label="关键结果">
                {module.outcomes.map((item) => (
                  <span key={item.label} className={outcomeClass(item.tone)}>
                    {item.label}
                  </span>
                ))}
              </div>
            )}
          </section>

          <section
            className="bfbf-block bfbf-block--closure"
            aria-labelledby={`${sectionId}-closure`}
          >
            <h3 className="bfbf-block-label" id={`${sectionId}-closure`}>
              <span className="bfbf-block-icon">
                <CheckCircle2 size={15} aria-hidden />
              </span>
              闭环
            </h3>
            <p>{module.closure}</p>
          </section>
        </div>

        {module.prototypeHref ? (
          <footer className="bfbf-module-footer">
            <p className="bfbf-closure-note">演示时可进入系统查看该模块实际操作界面。</p>
            <a className="bfbf-link-btn" href={module.prototypeHref}>
              {module.prototypeLabel}
              <ArrowRight size={16} aria-hidden />
            </a>
          </footer>
        ) : null}
      </div>
    </article>
  );
}

const ALL_MODULES: ChainModule[] = [FINANCE_HUB, ...CHAIN_MODULES];

function BriefingPage({
  presentMode,
  setPresentMode,
}: {
  presentMode: boolean;
  setPresentMode: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const sectionIds = useMemo(() => ALL_MODULES.map((m) => `bfbf-${m.id}`), []);
  const activeId = useScrollSpy(sectionIds, 72);
  const headerPinned = useScrolledPast(96);
  const { stepIndex, next, prev, isFirst, isLast } = usePresentationStep(ALL_MODULES.length);

  const activeIndex = ALL_MODULES.findIndex((m) => `bfbf-${m.id}` === activeId);
  const progress =
    ((activeIndex >= 0 ? activeIndex : 0) + 1) / ALL_MODULES.length;

  useEffect(() => {
    if (!presentMode) return;
    scrollToSection(`bfbf-${ALL_MODULES[stepIndex].id}`);
  }, [presentMode, stepIndex]);

  return (
    <>
      <header
        className={`bfbf-topbar bfbf-topbar--line${headerPinned ? ' is-pinned' : ''}`}
        data-annotation-id="bfbf-nav"
      >
        <div className="bfbf-topbar-inner">
          <span className="bfbf-topbar-brand">
            <Layers size={18} aria-hidden />
            业财闭环汇报
          </span>
          <div className="bfbf-topbar-progress" aria-hidden>
            <span className="bfbf-topbar-progress-fill" style={{ width: `${progress * 100}%` }} />
          </div>
          <button
            type="button"
            className={`bfbf-present-toggle${presentMode ? ' is-on' : ''}`}
            onClick={() => setPresentMode((v) => !v)}
            aria-pressed={presentMode}
          >
            {presentMode ? <X size={16} aria-hidden /> : <MonitorPlay size={16} aria-hidden />}
            {presentMode ? '退出演示' : '演示模式'}
          </button>
        </div>
      </header>

      <section className="bfbf-hero" data-annotation-id="bfbf-hero" id="bfbf-hero">
        <div className="bfbf-hero-inner">
          <p className="bfbf-eyebrow">
            <Sparkles size={16} aria-hidden />
            {BRIEFING_META.eyebrow}
          </p>
          <h1>{BRIEFING_META.title}</h1>
          <p className="bfbf-tagline">{BRIEFING_META.tagline}</p>
          <p className="bfbf-summary">{BRIEFING_META.summary}</p>

          <div className="bfbf-evolution" data-annotation-id="bfbf-formula">
            <p className="bfbf-evolution-heading">业财公式</p>
            <div className="bfbf-evolution-track">
              <div className="bfbf-evolution-phase">
                <span className="bfbf-evolution-label">该收 / 该付</span>
                <p>业务出单：提车应收、账单、还车应结、能源对账、保险付款等。</p>
              </div>
              <div className="bfbf-evolution-arrow" aria-hidden>
                <ChevronRight size={22} />
              </div>
              <div className="bfbf-evolution-phase bfbf-evolution-phase--target">
                <span className="bfbf-evolution-label">实收 / 实付 → 放行</span>
                <p>财务收付款关联后回写状态，驱动交车、开票、充值与保单归档。</p>
              </div>
            </div>
            <p className="bfbf-brief-discipline">{BRIEFING_META.discipline}</p>
          </div>

          <div className="bfbf-stats" aria-label="汇报要点数字">
            {BRIEFING_META.stats.map((stat) => (
              <div key={stat.label} className="bfbf-stat">
                <span className="bfbf-stat-value">{stat.value}</span>
                <span className="bfbf-stat-label">{stat.label}</span>
              </div>
            ))}
          </div>

          <div className="bfbf-pipeline" aria-label="七条链总览">
            {CHAIN_MODULES.map((module, idx) => {
              const Icon = module.icon;
              const sectionId = `bfbf-${module.id}`;
              return (
                <React.Fragment key={module.id}>
                  <button
                    type="button"
                    className={`bfbf-pipeline-node bfbf-pipeline-node--${module.accent}${activeId === sectionId ? ' is-active' : ''}`}
                    onClick={() => scrollToSection(sectionId)}
                    aria-current={activeId === sectionId ? 'step' : undefined}
                  >
                    <span className="bfbf-pipeline-icon">
                      <Icon size={18} aria-hidden />
                    </span>
                    <span className="bfbf-pipeline-label">{module.shortLabel}</span>
                  </button>
                  {idx < CHAIN_MODULES.length - 1 && (
                    <span className="bfbf-pipeline-connector" aria-hidden>
                      <ChevronRight size={14} />
                    </span>
                  )}
                </React.Fragment>
              );
            })}
          </div>

          <div className="bfbf-role-grid" data-annotation-id="bfbf-roles">
            {ROLE_CARDS.map((card) => (
              <article key={card.role} className="bfbf-role-card">
                <h3>{card.role}</h3>
                <p>{card.text}</p>
              </article>
            ))}
          </div>

          <div className="bfbf-hero-ctas">
            <a className="bfbf-link-btn" href="/prototypes/biz-finance-closed-loop/">
              打开业财闭环总览
              <ArrowRight size={16} aria-hidden />
            </a>
            <button
              type="button"
              className="bfbf-link-btn bfbf-link-btn--ghost"
              onClick={() => scrollToSection('bfbf-payment')}
            >
              <Wallet size={16} aria-hidden />
              先看财务中枢
            </button>
          </div>
        </div>
      </section>

      <div className="bfbf-shell">
        <aside className="bfbf-sidebar" aria-label="章节导航">
          <p className="bfbf-sidebar-title">浏览进度</p>
          <nav className="bfbf-sidebar-nav">
            {ALL_MODULES.map((module) => {
              const Icon = module.icon;
              const sectionId = `bfbf-${module.id}`;
              const isActive = activeId === sectionId;
              return (
                <button
                  key={module.id}
                  type="button"
                  className={`bfbf-sidebar-link bfbf-sidebar-link--${module.accent}${isActive ? ' is-active' : ''}`}
                  onClick={() => scrollToSection(sectionId)}
                  aria-current={isActive ? 'step' : undefined}
                >
                  <span className="bfbf-sidebar-num">{module.step === 0 ? '中' : module.step}</span>
                  <span className="bfbf-sidebar-text">
                    <Icon size={16} aria-hidden />
                    {module.shortLabel}
                  </span>
                </button>
              );
            })}
            <button
              type="button"
              className="bfbf-sidebar-link bfbf-sidebar-link--amber"
              onClick={() => scrollToSection('bfbf-finance-map')}
            >
              <span className="bfbf-sidebar-num">对</span>
              <span className="bfbf-sidebar-text">
                <Scale size={16} aria-hidden />
                收付对照
              </span>
            </button>
            <button
              type="button"
              className="bfbf-sidebar-link bfbf-sidebar-link--teal"
              onClick={() => scrollToSection('bfbf-gates')}
            >
              <span className="bfbf-sidebar-num">门</span>
              <span className="bfbf-sidebar-text">
                <Flag size={16} aria-hidden />
                门禁拍板
              </span>
            </button>
          </nav>
        </aside>

        <main id="bfbf-main" className="bfbf-main">
          {ALL_MODULES.map((module, index) => (
            <ModuleCard
              key={module.id}
              module={module}
              active={activeId === `bfbf-${module.id}`}
              index={index}
              moduleCount={ALL_MODULES.length}
            />
          ))}

          <section
            className="bfbf-brief-section"
            id="bfbf-finance-map"
            data-annotation-id="bfbf-finance-map"
          >
            <header className="bfbf-brief-section-header">
              <h2>收付款对照</h2>
              <p>业务侧出「该收/该付」，财务侧认「实收/实付」，条线做关联。</p>
            </header>
            <div className="bfbf-brief-tables">
              <div className="bfbf-brief-table-card">
                <h3>收款关联（5）</h3>
                <table>
                  <thead>
                    <tr>
                      <th>业务单据</th>
                      <th>动作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {RECEIPT_ROWS.map((row) => (
                      <tr key={row.doc}>
                        <td>{row.doc}</td>
                        <td>{row.action}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="bfbf-brief-table-card">
                <h3>付款关联（3）</h3>
                <table>
                  <thead>
                    <tr>
                      <th>业务单据</th>
                      <th>动作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {PAYMENT_ROWS.map((row) => (
                      <tr key={row.doc}>
                        <td>{row.doc}</td>
                        <td>{row.action}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          <section
            className="bfbf-brief-section"
            id="bfbf-gates"
            data-annotation-id="bfbf-gates"
          >
            <header className="bfbf-brief-section-header">
              <h2>关键门禁</h2>
              <p>无关联，不得假性结清 / 已充值 / 已付款 / 可交车。</p>
            </header>
            <div className="bfbf-gate-grid">
              {GATES.map((gate) => (
                <article key={gate.title} className={`bfbf-gate-card bfbf-gate-card--${gate.tone}`}>
                  <h3>{gate.title}</h3>
                  <p>{gate.detail}</p>
                </article>
              ))}
            </div>

            <div className="bfbf-decision-block" data-annotation-id="bfbf-decisions">
              <h3>会上待拍板</h3>
              <ol>
                {DECISIONS.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ol>
            </div>
          </section>

          <aside className="bfbf-loop-card" data-annotation-id="bfbf-full-loop" aria-label="全链路闭环">
            <div className="bfbf-loop-icon" aria-hidden>
              <Users size={20} />
              <ArrowRight size={16} />
              <CheckCircle2 size={20} />
            </div>
            <div className="bfbf-loop-content">
              <h3>七条链 + 财务中枢 = 业财闭环</h3>
              <p>
                从客户风险到保险保单，每一步都能落到「单据 ↔ 收付款」的可演示原型；汇报讲清逻辑，原型验门禁。
              </p>
            </div>
            <a className="bfbf-loop-btn" href="/prototypes/biz-finance-closed-loop/">
              进入原型总览
            </a>
          </aside>
        </main>
      </div>

      <nav className="bfbf-mobile-nav" aria-label="模块快速跳转">
        {ALL_MODULES.map((module) => (
          <button
            key={module.id}
            type="button"
            className={`bfbf-mobile-chip${activeId === `bfbf-${module.id}` ? ' is-active' : ''}`}
            onClick={() => scrollToSection(`bfbf-${module.id}`)}
            aria-label={module.title}
          >
            {module.step === 0 ? '财' : module.step}
          </button>
        ))}
      </nav>

      {presentMode && (
        <div className="bfbf-present-bar" role="toolbar" aria-label="演示控制">
          <button type="button" className="bfbf-present-btn" disabled={isFirst} onClick={prev}>
            <ChevronLeft size={18} aria-hidden />
            上一模块
          </button>
          <span className="bfbf-present-indicator">
            {stepIndex + 1}
            {' / '}
            {ALL_MODULES.length}
            {' · '}
            {ALL_MODULES[stepIndex].title}
          </span>
          <button
            type="button"
            className="bfbf-present-btn bfbf-present-btn--primary"
            disabled={isLast}
            onClick={next}
          >
            下一模块
            <ChevronRight size={18} aria-hidden />
          </button>
        </div>
      )}
    </>
  );
}

export default function BizFinanceLineBriefing() {
  const [presentMode, setPresentMode] = useState(false);

  useEffect(() => {
    clearHostPrototypeRouteInfo();
  }, []);

  const annotationOptions = useMemo<AnnotationViewerOptions>(
    () => ({ title: '业财闭环汇报' }),
    [],
  );

  return (
    <PrototypeAnnotationHost
      source={annotationSourceDocument as unknown as AnnotationSourceDocument}
      options={annotationOptions}
    >
      <div
        className={`bfbf-page${presentMode ? ' bfbf-page--present' : ''}`}
        data-annotation-id="bfbf-page"
      >
        <a className="bfbf-skip" href="#bfbf-main">
          跳到正文
        </a>
        <div className="bfbf-bg" aria-hidden>
          <span className="bfbf-bg-orb bfbf-bg-orb--1" />
          <span className="bfbf-bg-orb bfbf-bg-orb--2" />
          <span className="bfbf-bg-grid" />
        </div>
        <BriefingPage presentMode={presentMode} setPresentMode={setPresentMode} />
      </div>
    </PrototypeAnnotationHost>
  );
}
