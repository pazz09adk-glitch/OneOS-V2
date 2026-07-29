import React, { useState, useEffect } from 'react';
import {
  Palette,
  Type,
  Sliders,
  Calendar,
  Clock,
  CheckSquare,
  Radio as RadioIcon,
  ToggleLeft,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Search,
  RotateCcw,
  Plus,
  Download,
  Filter,
  Eye,
  Check,
  X,
  FileText,
  Truck,
  Sun,
  Moon,
  Layers,
  LayoutGrid,
  Kanban,
  Columns,
  List,
  Sparkles,
  Copy,
  CheckCircle2,
  XCircle,
  Clock3,
  Smartphone,
  Monitor,
  Home,
  User,
  Share2,
  MoreHorizontal,
  Bell
} from 'lucide-react';
import '../../resources/design-system/oneos-ds-tokens.css';
import LeaseContractHub from '../lease-contract-management/LeaseContractHub';
import H5VehicleAssetsApp from '../oneos-v2-h5-vehicle-assets/H5VehicleAssetsApp';
import { FaultDispositionForm } from '../lease-contract-redesign/FaultDispositionForm';
import {
  V2Select,
  V2DatePicker,
  V2DateRangePicker,
  V2SingleInputDateRangePicker,
  V2TimePicker,
  V2SingleInputTimeRangePicker,
  V2RadioGroup,
  V2CheckboxGroup,
  V2Switch,
  V2Steps,
  V2Timeline,
  V2ApprovalProgress,
  V2MobileHeader,
  V2MobileBottomNav,
  V2MobileActionBar,
  V2Pagination,
  V2Empty,
  V2SegmentedControl,
  V2StatusTabs,
  V2Button,
  V2ImageUpload,
  type V2ImageUploadItem,
} from './UIComponents';

const COMPANY_OPTIONS = [
  { value: '羚牛氢能（浙江）新能源科技有限公司', label: '羚牛氢能（浙江）新能源科技有限公司' },
  { value: '羚牛氢能（上海）物流有限公司', label: '羚牛氢能（上海）物流有限公司' },
  { value: '嘉兴氢能运力供应链有限公司', label: '嘉兴氢能运力供应链有限公司' },
];

const TEMPLATE_OPTIONS = [
  { value: '标准车辆租赁合同书模板', label: '标准车辆租赁合同书模板' },
  { value: '试用期转正式车辆租赁合同书模板', label: '试用期转正式车辆租赁合同书模板' },
  { value: '现代18吨氢能卡车专章协议', label: '现代18吨氢能卡车专章协议' },
];

const STATUS_OPTIONS = [
  { value: '草稿', label: '草稿未提交' },
  { value: '待审批', label: '待审批与盖章' },
  { value: '履约执行中', label: '履约执行中' },
  { value: '审批通过', label: '审批通过' },
  { value: '超期终止', label: '已超期终止' },
];

export const DesignSystemShowcase: React.FC = () => {
  // Main Top Mode Tab ('showcase' | 'master_page' | 'form_page' | 'h5_vehicle')
  const [topTab, setTopTab] = useState<'showcase' | 'master_page' | 'form_page' | 'h5_vehicle'>('showcase');

  // Device Viewport Mode ('pc' | 'h5_375' | 'h5_390')
  const [viewportMode, setViewportMode] = useState<'pc' | 'h5_375' | 'h5_390'>('pc');

  // Theme Mode
  const [isDark, setIsDark] = useState<boolean>(false);

  // Active Showcase Anchor
  const [activeSection, setActiveSection] = useState<string>('tokens');

  // Interactive UI Controls Demo States
  const [inputText, setInputText] = useState<string>('LC-2026-001');
  const [inputStatus, setInputStatus] = useState<'default' | 'focus' | 'error'>('default');
  const [textareaText, setTextareaText] = useState<string>('该租赁合同包含 3 台氢能重卡，需安排本月 28 号前完成交付核验。');
  const [singleSelect, setSingleSelect] = useState<string>('羚牛氢能（浙江）新能源科技有限公司');
  const [searchSelect, setSearchSelect] = useState<string>('试用期转正式车辆租赁合同书模板');
  const [multiSelect, setMultiSelect] = useState<string[]>(['待审批', '履约执行中']);
  const [radioVal, setRadioVal] = useState<string>('formal');
  const [checkboxState, setCheckboxState] = useState<{ [key: string]: boolean }>({
    c1: true,
    c2: false,
    c3: true,
  });
  const [switchVal, setSwitchVal] = useState<boolean>(true);
  
  // Date & Time Pickers Demo States
  const [singleDate, setSingleDate] = useState<string>('2026-07-23');
  const [dateRangeStart, setDateRangeStart] = useState<string>('2026-06-01');
  const [dateRangeEnd, setDateRangeEnd] = useState<string>('2026-06-30');
  const [singleInputStart, setSingleInputStart] = useState<string>('2026-06-01');
  const [singleInputEnd, setSingleInputEnd] = useState<string>('2026-07-31');
  const [timeRangeStart, setTimeRangeStart] = useState<string>('08:30:00');
  const [timeRangeEnd, setTimeRangeEnd] = useState<string>('17:30:00');
  const [timeVal, setTimeVal] = useState<string>('14:30:00');
  const [dateTimeVal, setDateTimeVal] = useState<string>('2026-07-23 14:30:00');
  const [amountVal, setAmountVal] = useState<number>(1250000);

  // Steps, Timeline & Approval Progress Demo States
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [stepDirection, setStepDirection] = useState<'horizontal' | 'vertical'>('horizontal');

  // H5 Mobile Navigation Demo States
  const [mobileTabKey, setMobileTabKey] = useState<string>('contracts');
  const [mobileHeaderTitle, setMobileHeaderTitle] = useState<string>('车辆租赁合同详情');
  const [mobileActionToast, setMobileActionToast] = useState<string>('');
  const [stepStatus, setStepStatus] = useState<'finish' | 'process' | 'wait' | 'error'>('process');

  // FilterBar & Table Demo States
  const [filterExpanded, setFilterExpanded] = useState<boolean>(true);
  const [tableSubExpanded, setTableSubExpanded] = useState<boolean>(true);
  const [miniViewMode, setMiniViewMode] = useState<'list' | 'kanban' | 'split'>('list');

  // Pagination Demo States
  const [paginationPage, setPaginationPage] = useState<number>(1);
  const [paginationSize, setPaginationSize] = useState<number>(20);
  const [paginationTotal, setPaginationTotal] = useState<number>(182);

  // Disabled Demo State
  const [demoDisabled, setDemoDisabled] = useState<boolean>(true);
  const [demoImages, setDemoImages] = useState<V2ImageUploadItem[]>([]);

  // Segmented Controls Demo States (修改项1 & 修改项2 纳入规范)
  const [demoSegMode, setDemoSegMode] = useState<'list' | 'kanban' | 'split'>('list');
  const [demoStatusTabKey, setDemoStatusTabKey] = useState<'all' | 'approval' | 'active' | 'draft'>('all');

  // Code Copy Alert
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const isH5 = viewportMode !== 'pc';

  // Toggle dark mode on html
  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.dataset.dsMode = 'dark';
      root.dataset.oneosTheme = 'dark';
      root.classList.add('dark');
    } else {
      root.dataset.dsMode = 'light';
      root.dataset.oneosTheme = 'light';
      root.classList.remove('dark');
    }
  }, [isDark]);

  const copyToClipboard = async (text: string, key: string) => {
    try {
      if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
        await navigator.clipboard.writeText(text);
      } else {
        throw new Error('Clipboard API unavailable');
      }
    } catch {
      try {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.left = '-9999px';
        textarea.style.top = '-9999px';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      } catch {
        // Fallback gracefully without unhandled rejection
      }
    }
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Color Swatch Component
  const ColorSwatch = ({ title, varName, hex, desc }: { title: string; varName: string; hex: string; desc: string }) => (
    <div 
      style={{
        background: 'var(--ln-surface-card)',
        borderColor: 'var(--ln-hairline)',
        borderWidth: '1px',
        borderStyle: 'solid',
        borderRadius: '12px',
        padding: '14px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: hex, border: '1px solid rgba(0,0,0,0.12)', boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.2)' }} />
          <div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--ln-ink)' }}>{title}</div>
            <div style={{ fontSize: '11px', fontFamily: 'monospace', color: 'var(--ln-muted)' }}>{varName}</div>
          </div>
        </div>
        <button
          onClick={() => copyToClipboard(`var(${varName})`, varName)}
          style={{
            padding: '6px',
            borderRadius: '6px',
            border: '1px solid var(--ln-hairline)',
            background: 'var(--ln-surface-pearl)',
            color: 'var(--ln-body)',
            cursor: 'pointer'
          }}
          title="复制 CSS 变量"
        >
          {copiedKey === varName ? <Check style={{ width: '14px', height: '14px', color: '#10B981' }} /> : <Copy style={{ width: '14px', height: '14px' }} />}
        </button>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', paddingTop: '8px', borderTop: '1px solid var(--ln-hairline)' }}>
        <span style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--ln-body)' }}>{hex}</span>
        <span style={{ color: 'var(--ln-muted)' }}>{desc}</span>
      </div>
    </div>
  );

  const showcaseContent = (
    <div style={{ maxWidth: isH5 ? '100%' : '1280px', margin: '0 auto', padding: isH5 ? '16px 12px' : '32px 24px', boxSizing: 'border-box' }}>
      {/* Quick Anchor Sub-Nav */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflowX: 'auto', paddingBottom: '16px', marginBottom: '32px', borderBottom: '1px solid var(--ln-hairline)' }}>
        {[
          { id: 'tokens', label: '🎨 色彩 & Tokens', icon: Palette },
          { id: 'typography', label: '🔤 字体 & 排版', icon: Type },
          { id: 'controls', label: '🎛️ 基础 UI 控件', icon: Sliders },
          { id: 'disabled_states', label: '🚫 控件禁用状态与灰度标准', icon: XCircle },
          { id: 'datepicker', label: '📅 日期 & 时间', icon: Calendar },
          { id: 'buttons', label: '🔘 按钮 & 操作', icon: CheckSquare },
          { id: 'mobile_nav', label: '📱 H5 移动端导航', icon: Smartphone },
          { id: 'pagination', label: '📄 统一分页控制器', icon: FileText },
          { id: 'empty_states', label: '🏜️ 空状态 & 异常页', icon: Layers },
          { id: 'badges', label: '🏷️ 状态徽章 Pills', icon: RadioIcon },
          { id: 'composite', label: '📊 13项筛选 & 子表', icon: Filter },
          { id: 'steps_timeline', label: '🪜 步骤条/时间轴/审批', icon: Layers },
          { id: 'views', label: '📐 三视角模板', icon: LayoutGrid },
          { id: 'docs', label: '📄 规范文件路径', icon: FileText },
        ].map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveSection(item.id);
                document.getElementById(`sec-${item.id}`)?.scrollIntoView({ behavior: 'smooth' });
              }}
              className={`ds-nav-btn ${isActive ? 'active' : ''}`}
            >
              <Icon style={{ width: '14px', height: '14px' }} />
              {item.label}
            </button>
          );
        })}
      </div>

      {/* Section 1: Colors & Tokens */}
      <section id="sec-tokens" style={{ marginBottom: '48px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(83, 58, 253, 0.1)', color: '#533AFD' }}>
            <Palette style={{ width: '20px', height: '20px' }} />
          </div>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--ln-ink)', margin: 0 }}>
              1. 色彩体系与 Design Tokens (Global Color Palette)
            </h2>
            <p style={{ fontSize: '12px', color: 'var(--ln-muted)', margin: '2px 0 0 0' }}>
              以 Stripe Violet 品牌紫（`#533AFD`）为全局第一主色，配合精细的底色与双色模式 Semantic Tokens
            </p>
          </div>
        </div>

        <div className="ds-grid-4">
          <ColorSwatch title="Stripe Violet 主色" varName="--ln-primary" hex="#533AFD" desc="品牌主色、主按钮、高亮指示" />
          <ColorSwatch title="Primary Hover" varName="--ln-primary-hover" hex="#6346FF" desc="主按钮 Hover 悬停态" />
          <ColorSwatch title="Primary Focus Ring" varName="--ln-primary-focus" hex="#4226E8" desc="控件 Focus 强光边圈" />
          <ColorSwatch title="Primary Soft 浅底" varName="--ln-primary-soft" hex={isDark ? 'rgba(83,58,253,0.18)' : '#E0E7FF'} desc="选中背景、Tag 浅底、高亮 Pill" />
          <ColorSwatch title="Canvas 画布底色" varName="--ln-canvas-parchment" hex={isDark ? '#0A0B0D' : '#F6F9FC'} desc="最外层页面背景画布" />
          <ColorSwatch title="Surface Card 容器卡片" varName="--ln-surface-card" hex={isDark ? '#121418' : '#FFFFFF'} desc="卡片容器、表单面板、Modal / Drawer 底色" />
          <ColorSwatch title="Surface Pearl 辅助容器" varName="--ln-surface-pearl" hex={isDark ? '#16181F' : '#F8FAFC'} desc="表头底色、禁用态背景" />
          <ColorSwatch title="Surface Strong 激活底色" varName="--ln-surface-strong" hex={isDark ? '#1E222D' : '#F1F5F9'} desc="搜索框背景、Tab 激活底色" />
          <ColorSwatch title="Ink 强对比标题正文" varName="--ln-ink" hex={isDark ? '#F7FAFC' : '#0A2540'} desc="一级标题、大数字" />
          <ColorSwatch title="Body 标准正文" varName="--ln-body" hex={isDark ? '#A0AEC0' : '#425466'} desc="标准正文、表单 Label" />
          <ColorSwatch title="Muted 次要描述" varName="--ln-muted" hex={isDark ? '#718096' : '#627D98'} desc="占位符、次要辅助文本" />
          <ColorSwatch title="Hairline 标准边框" varName="--ln-hairline" hex={isDark ? '#23272F' : '#E3E8EE'} desc="卡片分割线、标准边框" />
          <ColorSwatch title="Success 成功/履约中" varName="--ln-success" hex="#10B981" desc="进行中、已支付、履约正常" />
          <ColorSwatch title="Warning 预警/待审批" varName="--ln-warning" hex="#D97706" desc="待审批、盖章中、预警" />
          <ColorSwatch title="Error 危险/欠费" varName="--ln-error" hex="#EF4444" desc="超期、终止、驳回、欠费" />
          <ColorSwatch title="Info 信息/草稿" varName="--ln-info" hex="#3B82F6" desc="提示信息、待提交" />
        </div>
      </section>

      {/* Section 2: Typography & Numeric Format */}
      <section id="sec-typography" style={{ marginBottom: '48px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(83, 58, 253, 0.1)', color: '#533AFD' }}>
            <Type style={{ width: '20px', height: '20px' }} />
          </div>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--ln-ink)', margin: 0 }}>
              2. 字体排版与 Tabular Nums 数字格式 (Typography & Tabular Numbers)
            </h2>
            <p style={{ fontSize: '12px', color: 'var(--ln-muted)', margin: '2px 0 0 0' }}>
              所有金额、单价、车辆数、VIN 码、时间与日期统一采用等宽字体 `tabular-nums`，移动端正文 ≥ 14px 止自动缩放
            </p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: isH5 ? '1fr' : 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
          <div className="ds-card">
            <h3 style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#533AFD', marginTop: 0, marginBottom: '16px' }}>
              字号阶梯 (Font Scale)
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', borderBottom: '1px solid var(--ln-hairline)', paddingBottom: '8px' }}>
                <span style={{ fontSize: '12px', fontFamily: 'monospace', color: 'var(--ln-muted)' }}>Display (24px)</span>
                <span style={{ fontSize: '24px', fontWeight: 800, color: 'var(--ln-ink)', letterSpacing: '-0.02em' }}>¥ 2,780,000.00</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', borderBottom: '1px solid var(--ln-hairline)', paddingBottom: '8px' }}>
                <span style={{ fontSize: '12px', fontFamily: 'monospace', color: 'var(--ln-muted)' }}>Head-Lg (18px)</span>
                <span style={{ fontSize: '18px', fontWeight: 800, color: 'var(--ln-ink)' }}>租赁合同管理与车辆资产枢纽</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', borderBottom: '1px solid var(--ln-hairline)', paddingBottom: '8px' }}>
                <span style={{ fontSize: '12px', fontFamily: 'monospace', color: 'var(--ln-muted)' }}>Head-Sm (16px)</span>
                <span style={{ fontSize: '16px', fontWeight: 700, color: 'var(--ln-ink)' }}>羚牛氢能 (浙江) 运营项目</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', borderBottom: '1px solid var(--ln-hairline)', paddingBottom: '8px' }}>
                <span style={{ fontSize: '12px', fontFamily: 'monospace', color: 'var(--ln-muted)' }}>Subhead (14px)</span>
                <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--ln-ink)' }}>浙A88888F - 49吨氢能重卡</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', borderBottom: '1px solid var(--ln-hairline)', paddingBottom: '8px' }}>
                <span style={{ fontSize: '12px', fontFamily: 'monospace', color: 'var(--ln-muted)' }}>Body-Base (14px H5)</span>
                <span style={{ fontSize: '14px', fontWeight: 400, color: 'var(--ln-body)' }}>标准文本、表单录入文本、表格明细</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '12px', fontFamily: 'monospace', color: 'var(--ln-muted)' }}>Caption (12px H5)</span>
                <span style={{ fontSize: '12px', color: 'var(--ln-muted)' }}>次要辅助标注、时间戳、SLA 倒计时微标</span>
              </div>
            </div>
          </div>

          <div className="ds-card">
            <h3 style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#533AFD', marginTop: 0, marginBottom: '8px' }}>
              等宽数字对齐演示 (Tabular Nums)
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--ln-muted)', marginBottom: '16px' }}>
              全局强制使用 `JetBrains Mono` / `SFMono-Regular` 结合 `font-variant-numeric: tabular-nums`，确保高密度数值对齐不错位。
            </p>

            <div style={{ padding: '16px', borderRadius: '12px', border: '1px solid var(--ln-hairline)', background: 'var(--ln-surface-pearl)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', fontSize: '12px', fontWeight: 700, borderBottom: '1px solid var(--ln-hairline)', paddingBottom: '8px', color: 'var(--ln-muted)' }}>
                <span>车牌 / VIN 码</span>
                <span style={{ textAlign: 'right' }}>未格式化</span>
                <span style={{ textAlign: 'right' }}>Tabular Nums</span>
              </div>
              {[
                { plate: '浙A88888F', raw: '¥ 111,111.11', tabular: '¥ 111,111.11' },
                { plate: '浙A99999F', raw: '¥ 888,888.88', tabular: '¥ 888,888.88' },
                { plate: '沪B12345F', raw: '¥ 100,000.00', tabular: '¥ 100,000.00' },
              ].map((row, idx) => (
                <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', fontSize: '12px', fontFamily: 'monospace' }}>
                  <span style={{ fontWeight: 600, color: '#533AFD' }}>{row.plate}</span>
                  <span style={{ textAlign: 'right', fontFamily: 'sans-serif', color: 'var(--ln-muted)' }}>{row.raw}</span>
                  <span style={{ textAlign: 'right', fontWeight: 700, color: '#10B981', fontVariantNumeric: 'tabular-nums' }}>
                    {row.tabular}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Basic UI Controls */}
      <section id="sec-controls" style={{ marginBottom: '48px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(83, 58, 253, 0.1)', color: '#533AFD' }}>
            <Sliders style={{ width: '20px', height: '20px' }} />
          </div>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--ln-ink)', margin: 0 }}>
              3. 全量基础 UI 控件组件库 (Basic UI Input Controls)
            </h2>
            <p style={{ fontSize: '12px', color: 'var(--ln-muted)', margin: '2px 0 0 0' }}>
              符合 OneOS V2 规范的高规 custom React 控件（触控高 ≥ 44px、H5 移动端自动唤起底部 Sheet Popover 面板）
            </p>
          </div>
        </div>

        <div className="ds-grid-3">
          {/* Card 1: Input & Textarea */}
          <div className="ds-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', color: '#533AFD', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <FileText style={{ width: '14px', height: '14px' }} />
              文本输入框与文本域 (Input & Textarea)
            </h3>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--ln-body)', marginBottom: '6px' }}>
                合同编码 (Touch Target ≥ 44px)
              </label>
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className={`ds-input ${inputStatus === 'error' ? 'ds-input-error' : ''}`}
                onFocus={() => setInputStatus('focus')}
                onBlur={() => setInputStatus('default')}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--ln-body)', marginBottom: '6px' }}>
                检索前缀图标输入框 (Icon Prefix Input)
              </label>
              <div style={{ position: 'relative' }}>
                <Search style={{ width: '14px', height: '14px', position: 'absolute', left: '12px', top: '15px', color: 'var(--ln-muted)' }} />
                <input
                  type="text"
                  placeholder="搜索项目名称、客户或车牌号..."
                  className="ds-input"
                  style={{ paddingLeft: '34px' }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--ln-body)', marginBottom: '6px' }}>
                备注批注说明 (Textarea)
              </label>
              <textarea
                rows={3}
                value={textareaText}
                onChange={(e) => setTextareaText(e.target.value)}
                className="ds-input"
                style={{ height: 'auto', minHeight: '80px', padding: '10px' }}
              />
            </div>
          </div>

          {/* Card 2: Custom Selects */}
          <div className="ds-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', color: '#533AFD', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ChevronDown style={{ width: '14px', height: '14px' }} />
              高阶下拉选择器 (Custom V2Select Component)
            </h3>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--ln-body)', marginBottom: '6px' }}>
                签约公司主体 (Single Custom Select)
              </label>
              <V2Select
                options={COMPANY_OPTIONS}
                value={singleSelect}
                onChange={setSingleSelect}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--ln-body)', marginBottom: '6px' }}>
                标准合同名称 (Searchable Custom Select)
              </label>
              <V2Select
                options={TEMPLATE_OPTIONS}
                value={searchSelect}
                onChange={setSearchSelect}
                searchable
              />
              <p style={{ fontSize: '11px', margin: '4px 0 0 0', color: '#10B981' }}>✓ 支持 H5 底部 Sheet 与关键词检索</p>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--ln-body)', marginBottom: '6px' }}>
                审批状态多选 (Multi-Select Tag Pills)
              </label>
              <V2Select
                options={STATUS_OPTIONS}
                value={multiSelect}
                onChange={setMultiSelect}
                multiple
                searchable
              />
            </div>
          </div>

          {/* Card 3: Radios, Checkboxes, Switch & Currency */}
          <div className="ds-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', color: '#533AFD', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ToggleLeft style={{ width: '14px', height: '14px' }} />
              单选、复选、开关与金额 (Radio, Checkbox, Switch)
            </h3>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--ln-body)', marginBottom: '8px' }}>
                合同类型 (RadioGroup)
              </label>
              <V2RadioGroup
                options={[
                  { value: 'formal', label: '正式合同' },
                  { value: 'trial', label: '试用合同' },
                  { value: 'special', label: '非标合同' },
                ]}
                value={radioVal}
                onChange={setRadioVal}
                type="segmented"
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--ln-body)', marginBottom: '8px' }}>
                附加业务开通 (CheckboxGroup)
              </label>
              <V2CheckboxGroup
                options={[
                  { value: 'c1', label: '代交氢费' },
                  { value: 'c2', label: '保险代办' },
                  { value: 'c3', label: '运力调度' },
                ]}
                value={Object.keys(checkboxState).filter((k) => checkboxState[k])}
                onChange={(vals) => {
                  setCheckboxState({
                    c1: vals.includes('c1'),
                    c2: vals.includes('c2'),
                    c3: vals.includes('c3'),
                  });
                }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--ln-ink)' }}>开启 OCR 资质自动拦截</div>
                <div style={{ fontSize: '11px', color: 'var(--ln-muted)' }}>若客户营业执照过期则阻断提交</div>
              </div>
              <V2Switch checked={switchVal} onChange={setSwitchVal} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--ln-body)', marginBottom: '6px' }}>
                合同月租金总额 (Currency Number Input)
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '12px', top: '12px', fontSize: '14px', fontWeight: 800, color: '#533AFD' }}>¥</span>
                <input
                  type="number"
                  value={amountVal}
                  onChange={(e) => setAmountVal(Number(e.target.value))}
                  className="ds-input"
                  style={{ paddingLeft: '28px', fontFamily: 'monospace', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 4: Disabled Component States & Grayscale Standards */}
      <section id="sec-disabled_states" style={{ marginBottom: '48px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.1)', color: '#EF4444' }}>
              <XCircle style={{ width: '20px', height: '20px' }} />
            </div>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--ln-ink)', margin: 0 }}>
                4. 控件禁用状态与灰度标准 (Disabled Component States & Grayscale Standards)
              </h2>
              <p style={{ fontSize: '12px', color: 'var(--ln-muted)', margin: '2px 0 0 0' }}>
                全局统一禁用规范：背景 `var(--ln-surface-pearl)` / `#F1F5F9` (Dark `#16181F`)，文字图标 `var(--ln-muted)` / `#94A3B8`，边框 `var(--ln-hairline)`，`cursor: not-allowed` 且阻断 Hover/Focus 交互
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'var(--ln-surface-card)', padding: '6px 12px', borderRadius: '10px', border: '1px solid var(--ln-hairline)' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--ln-ink)' }}>禁用状态体验模式：</span>
            <V2Switch
              checked={demoDisabled}
              onChange={setDemoDisabled}
              label={demoDisabled ? '强制禁用 (Disabled ON)' : '正常可编辑 (Disabled OFF)'}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: isH5 ? '1fr' : 'repeat(2, 1fr)', gap: '20px' }}>
          {/* Card 1: Input, Textarea & Buttons Disabled */}
          <div className="ds-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', color: '#EF4444', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <FileText style={{ width: '14px', height: '14px' }} />
              文本框与按钮禁用 (Disabled Input, Textarea & Buttons)
            </h3>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--ln-body)', marginBottom: '6px' }}>
                合同编码 (Disabled Input)
              </label>
              <input
                type="text"
                disabled={demoDisabled}
                value="LC-2026-DISABLED-001"
                readOnly
                className="ds-input"
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--ln-body)', marginBottom: '6px' }}>
                检索输入框 (Disabled Prefix Input)
              </label>
              <div style={{ position: 'relative' }}>
                <Search style={{ width: '14px', height: '14px', position: 'absolute', left: '12px', top: '15px', color: 'var(--ln-muted)', opacity: demoDisabled ? 0.55 : 1 }} />
                <input
                  type="text"
                  disabled={demoDisabled}
                  placeholder="检索已锁定的资产..."
                  className="ds-input"
                  style={{ paddingLeft: '34px' }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--ln-body)', marginBottom: '6px' }}>
                归档批注 (Disabled Textarea)
              </label>
              <textarea
                rows={2}
                disabled={demoDisabled}
                value="本合同归档锁定后不可修改任何条款。"
                readOnly
                className="ds-input"
                style={{ height: 'auto', minHeight: '64px', padding: '10px' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--ln-body)', marginBottom: '8px' }}>
                按钮禁用形态 (Disabled Buttons)
              </label>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <V2Button variant="primary" size="md" disabled={demoDisabled}>
                  提交生效
                </V2Button>
                <V2Button variant="secondary" size="md" disabled={demoDisabled}>
                  暂存草稿
                </V2Button>
                <V2Button variant="outline" size="md" disabled={demoDisabled}>
                  重置清空
                </V2Button>
              </div>
            </div>
          </div>

          {/* Card 2: Custom Selects, Date & Time Pickers Disabled */}
          <div className="ds-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', color: '#EF4444', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ChevronDown style={{ width: '14px', height: '14px' }} />
              下拉与日期时间禁用 (Disabled V2 Selects & Pickers)
            </h3>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--ln-body)', marginBottom: '6px' }}>
                单选下拉 (Disabled V2Select Single)
              </label>
              <V2Select
                disabled={demoDisabled}
                options={COMPANY_OPTIONS}
                value="羚牛氢能（浙江）新能源科技有限公司"
                onChange={() => {}}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--ln-body)', marginBottom: '6px' }}>
                多选标签 (Disabled V2Select Multiple)
              </label>
              <V2Select
                disabled={demoDisabled}
                options={STATUS_OPTIONS}
                value={['待审批', '履约执行中']}
                onChange={() => {}}
                multiple
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--ln-body)', marginBottom: '6px' }}>
                  日期 (Disabled V2DatePicker)
                </label>
                <V2DatePicker
                  disabled={demoDisabled}
                  value="2026-07-23"
                  onChange={() => {}}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--ln-body)', marginBottom: '6px' }}>
                  时间 (Disabled V2TimePicker)
                </label>
                <V2TimePicker
                  disabled={demoDisabled}
                  value="14:30:00"
                  onChange={() => {}}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--ln-body)', marginBottom: '6px' }}>
                跨月范围 (Disabled V2SingleInputDateRangePicker)
              </label>
              <V2SingleInputDateRangePicker
                disabled={demoDisabled}
                startDate="2026-06-01"
                endDate="2026-06-30"
                onChange={() => {}}
              />
            </div>
          </div>

          {/* Card 3: Radio, Checkbox & Switch Disabled */}
          <div className="ds-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', color: '#EF4444', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ToggleLeft style={{ width: '14px', height: '14px' }} />
              单选复选与开关禁用 (Disabled Radio, Checkbox & Switch)
            </h3>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--ln-body)', marginBottom: '8px' }}>
                分段单选 (Disabled Segmented Radio)
              </label>
              <V2RadioGroup
                disabled={demoDisabled}
                options={[
                  { value: 'formal', label: '正式合同' },
                  { value: 'trial', label: '试用合同' },
                  { value: 'special', label: '非标合同' },
                ]}
                value="formal"
                onChange={() => {}}
                type="segmented"
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--ln-body)', marginBottom: '8px' }}>
                卡片单选 (Disabled Card Radio)
              </label>
              <V2RadioGroup
                disabled={demoDisabled}
                options={[
                  { value: 'formal', label: '标准租赁', description: '固定月租金按月结算' },
                  { value: 'trial', label: '试用租赁', description: '30 天短租测试' },
                ]}
                value="formal"
                onChange={() => {}}
                type="card"
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--ln-body)', marginBottom: '8px' }}>
                多选复选框 (Disabled CheckboxGroup)
              </label>
              <V2CheckboxGroup
                disabled={demoDisabled}
                options={[
                  { value: 'c1', label: '代交氢费' },
                  { value: 'c2', label: '保险代办' },
                  { value: 'c3', label: '运力调度' },
                ]}
                value={['c1', 'c3']}
                onChange={() => {}}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <V2Switch
                disabled={demoDisabled}
                checked={true}
                label="自动扣款代扣 (禁用开启状态)"
              />
              <V2Switch
                disabled={demoDisabled}
                checked={false}
                label="短信通知提示 (禁用关闭状态)"
              />
            </div>
          </div>

          {/* Card 4: Steps, Timeline & Approval Progress Disabled */}
          <div className="ds-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', color: '#EF4444', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Layers style={{ width: '14px', height: '14px' }} />
              步骤条/时间轴/审批禁用 (Disabled Steps, Timeline & Approval)
            </h3>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--ln-body)', marginBottom: '8px' }}>
                步骤条 (Disabled V2Steps)
              </label>
              <V2Steps
                disabled={demoDisabled}
                current={1}
                items={[
                  { title: '草稿提交' },
                  { title: '部门审核' },
                  { title: '完成归档' },
                ]}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--ln-body)', marginBottom: '8px' }}>
                时间轴 (Disabled V2Timeline)
              </label>
              <V2Timeline
                disabled={demoDisabled}
                items={[
                  { title: '合同起草入库', timestamp: '2026-07-20 10:00', operator: '王冕' },
                  { title: '电子盖章锁定', timestamp: '2026-07-21 14:30', operator: '法务部' },
                ]}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--ln-body)', marginBottom: '8px' }}>
                审批进度 (Disabled V2ApprovalProgress)
              </label>
              <V2ApprovalProgress
                disabled={demoDisabled}
                nodes={[
                  { title: '起草人', status: 'approved', approver: { name: '王冕' } },
                  { title: '法务初审', status: 'processing', approver: { name: '张法务' } },
                  { title: '终审交办', status: 'pending', approver: { name: '李总' } },
                ]}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Section 5: Date & Time Pickers */}
      <section id="sec-datepicker" style={{ marginBottom: '48px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(83, 58, 253, 0.1)', color: '#533AFD' }}>
            <Calendar style={{ width: '20px', height: '20px' }} />
          </div>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--ln-ink)', margin: 0 }}>
              4. 高规设计感日期与时间选择器全集 (Custom V2 Date & Time Pickers)
            </h2>
            <p style={{ fontSize: '12px', color: 'var(--ln-muted)', margin: '2px 0 0 0' }}>
              H5 移动端模式下自动转换为底部智能 Bottom Sheet，双月日历自适应单列无缝滑动
            </p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: isH5 ? '1fr' : 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
          {/* Card 1: Single Input Box + Dual Calendar Mode */}
          <div className="ds-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--ln-hairline)', paddingBottom: '12px' }}>
              <h3 style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', color: '#533AFD', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Calendar style={{ width: '14px', height: '14px' }} />
                模式一：单框 + 双日历 (V2SingleInputDateRangePicker)
              </h3>
              <span style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 700, background: 'rgba(83, 58, 253, 0.15)', color: '#533AFD' }}>
                H5 自动单列 Sheet
              </span>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--ln-ink)', marginBottom: '8px' }}>
                单输入框跨月区间选择 (移动端自动唤起底部 80vh 滚动日历)
              </label>
              
              <V2SingleInputDateRangePicker
                startDate={singleInputStart}
                endDate={singleInputEnd}
                onChange={(start, end) => {
                  setSingleInputStart(start);
                  setSingleInputEnd(end);
                }}
              />
              <p style={{ fontSize: '11px', color: 'var(--ln-muted)', marginTop: '8px' }}>
                ✓ 自动感应 H5 屏宽，将 560px 左右双月顺畅切换为单列滑向日历
              </p>
            </div>
          </div>

          {/* Card 2: Dual Box Range Picker Mode */}
          <div className="ds-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--ln-hairline)', paddingBottom: '12px' }}>
              <h3 style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', color: '#533AFD', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Calendar style={{ width: '14px', height: '14px' }} />
                模式二：13项筛选双框 (V2DateRangePicker)
              </h3>
              <span style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 700, background: 'rgba(16, 185, 129, 0.12)', color: '#10B981' }}>
                H5 垂直折叠
              </span>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--ln-ink)', marginBottom: '8px' }}>
                合同到期双框区间 (移动端自适应垂直折叠)
              </label>
              
              <V2DateRangePicker
                startDate={dateRangeStart}
                endDate={dateRangeEnd}
                onChange={(start, end) => {
                  setDateRangeStart(start);
                  setDateRangeEnd(end);
                }}
              />
            </div>
          </div>

          {/* Card 3: Time Range & Single Date */}
          <div className="ds-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', color: '#533AFD', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Clock style={{ width: '14px', height: '14px' }} />
              模式三：单框时间段与单日选择器 (Time Range & Date)
            </h3>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--ln-body)', marginBottom: '6px' }}>
                服务/班次时间段 (V2SingleInputTimeRangePicker)
              </label>
              <V2SingleInputTimeRangePicker
                startTime={timeRangeStart}
                endTime={timeRangeEnd}
                onChange={(start, end) => {
                  setTimeRangeStart(start);
                  setTimeRangeEnd(end);
                }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: isH5 ? '1fr' : '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--ln-body)', marginBottom: '6px' }}>
                  单日交车日期 (V2DatePicker)
                </label>
                <V2DatePicker value={singleDate} onChange={setSingleDate} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--ln-body)', marginBottom: '6px' }}>
                  时刻选择 (V2TimePicker)
                </label>
                <V2TimePicker value={timeVal} onChange={setTimeVal} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 5: Buttons & Actions */}
      <section id="sec-buttons" style={{ marginBottom: '48px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(83, 58, 253, 0.1)', color: '#533AFD' }}>
            <CheckSquare style={{ width: '20px', height: '20px' }} />
          </div>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--ln-ink)', margin: 0 }}>
              5. 按钮与 H5 底部固定操作条 (Buttons & Mobile Sticky Action Bar)
            </h2>
            <p style={{ fontSize: '12px', color: 'var(--ln-muted)', margin: '2px 0 0 0' }}>
              移动端触控高 ≥ 44px，支持底部固定主操作条（`position: fixed; bottom: 0;`）
            </p>
          </div>
        </div>

        <div className="ds-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#533AFD', marginBottom: 8 }}>
              V2Button 变体（DESIGN.md §3.0 · 主色走 CSS 变量）
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '12px' }}>
              <V2Button variant="primary" size="lg" icon={<Plus style={{ width: 16, height: 16 }} />}>
                Primary 新建合同
              </V2Button>
              <V2Button variant="secondary" size="lg" icon={<Download style={{ width: 16, height: 16 }} />}>
                Secondary 导出台账
              </V2Button>
              <V2Button variant="outline" size="lg" icon={<Eye style={{ width: 16, height: 16 }} />}>
                Outline 展开子表
              </V2Button>
              <V2Button variant="ghost" size="lg">
                Ghost 取消
              </V2Button>
              <V2Button variant="danger" size="lg" icon={<X style={{ width: 16, height: 16 }} />}>
                Danger 终止履约
              </V2Button>
              <V2Button variant="back" size="md">
                返回列表
              </V2Button>
              <V2Button variant="primary" size="md" loading>
                提交中
              </V2Button>
              <V2Button variant="primary" size="lg" disabled>
                Disabled
              </V2Button>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 12, alignItems: 'center' }}>
              <span style={{ fontSize: 11, color: 'var(--ln-muted)' }}>尺寸</span>
              <V2Button variant="primary" size="sm">sm 32</V2Button>
              <V2Button variant="primary" size="md">md 36</V2Button>
              <V2Button variant="primary" size="lg">lg 44</V2Button>
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--ln-hairline)', paddingTop: '16px' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#533AFD', marginBottom: 8 }}>
              V2ImageUpload 图片上传（DESIGN.md §3.17 · Web 拖拽 / H5 拍照·相册）
            </div>
            <p style={{ fontSize: 12, color: 'var(--ln-muted)', margin: '0 0 12px' }}>
              PC：点击或拖拽虚线区；有图后缩略图网格 +「新增」。H5（窄屏）：拍照 / 相册双入口 ≥44px，不以拖拽为主。
            </p>
            <V2ImageUpload
              value={demoImages}
              onChange={setDemoImages}
              maxCount={6}
              maxSizeMB={10}
              title="点击或拖拽上传现场照片 / 单据凭证"
              hint="支持 JPG/PNG/WEBP，单张 ≤10MB，最多 6 张"
            />
          </div>

          {/* Sticky Bottom Bar Demo for H5 */}
          <div style={{ borderTop: '1px solid var(--ln-hairline)', paddingTop: '16px' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#533AFD', marginBottom: '8px' }}>
              H5 吸底操作条：次要 secondary + 主 CTA primary（单一主按钮）
            </div>
            <div 
              style={{
                borderRadius: '12px',
                border: '1px solid var(--ln-hairline)',
                background: 'var(--ln-surface-card)',
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                boxShadow: '0 -4px 16px rgba(0,0,0,0.08)'
              }}
            >
              <V2Button variant="secondary" size="lg" style={{ flex: 1 }}>
                暂存草稿
              </V2Button>
              <V2Button variant="primary" size="lg" style={{ flex: 2 }}>
                确认并提交审批
              </V2Button>
            </div>
          </div>

          {/* 顶栏与台账分段切换组件规范 (修改项1 & 修改项2 纳入规范) */}
          <div style={{ borderTop: '1px solid var(--ln-hairline)', paddingTop: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--ln-ink)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Layers style={{ width: '15px', height: '15px', color: '#533AFD' }} />
                5.1 顶栏视图分段切换条 (V2SegmentedControl) & 状态过滤页签条 (V2StatusTabs)
              </div>
              <p style={{ fontSize: '12px', color: 'var(--ln-muted)', margin: 0 }}>
                将大盘页面的「三模式切换条」与表格台账顶部的「状态过滤 Tab 选项卡」标准化为设计系统原生组件，统一圆角、阴影、微边界与 Stripe Violet 激活态高亮。
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '16px', background: 'var(--ln-surface-pearl)', borderRadius: '12px', border: '1px solid var(--ln-hairline)' }}>
              {/* 1. V2SegmentedControl Demo */}
              <div>
                <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--ln-muted)', marginBottom: '8px' }}>
                  【修改项 1 规范组件】顶栏三视图分段切换条 (V2SegmentedControl - 列表 / 看板 / 主从)
                </div>
                <V2SegmentedControl
                  value={demoSegMode}
                  onChange={setDemoSegMode}
                  options={[
                    { key: 'list', label: '列表模式', icon: <List style={{ width: '14px', height: '14px' }} /> },
                    { key: 'kanban', label: '看板模式', icon: <LayoutGrid style={{ width: '14px', height: '14px' }} /> },
                    { key: 'split', label: '主从/表单模式', icon: <Columns style={{ width: '14px', height: '14px' }} /> },
                  ]}
                />
              </div>

              {/* 2. V2StatusTabs Demo */}
              <div>
                <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--ln-muted)', marginBottom: '8px' }}>
                  【修改项 2 规范组件】状态分类过滤页签条 (V2StatusTabs - 带计数与高亮 Pill)
                </div>
                <V2StatusTabs
                  value={demoStatusTabKey}
                  onChange={setDemoStatusTabKey}
                  options={[
                    { key: 'all', label: '全部合同', count: 4 },
                    { key: 'approval', label: '待我审批', count: 1 },
                    { key: 'active', label: '履约执行中', count: 2 },
                    { key: 'draft', label: '草稿箱', count: 1 },
                  ]}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 5.2: H5 Mobile Navigation Components */}
      <section id="sec-mobile_nav" style={{ marginBottom: '48px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(83, 58, 253, 0.1)', color: '#533AFD' }}>
            <Smartphone style={{ width: '20px', height: '20px' }} />
          </div>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--ln-ink)', margin: 0 }}>
              5.2 H5 移动端顶部导航栏、底部 TabBar 与操作条规范 (Mobile Navigation)
            </h2>
            <p style={{ fontSize: '12px', color: 'var(--ln-muted)', margin: '2px 0 0 0' }}>
              面向移动端/App 嵌入式 H5 视口（触控热区 ≥ 44px、Safe Area 智能适配、Stripe Violet 激活亮色）
            </p>
          </div>
        </div>

        <div className="ds-card" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Controls Bar for Live Demo */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
              padding: '12px 16px',
              borderRadius: '8px',
              background: 'var(--ln-surface-pearl)',
              border: '1px solid var(--ln-hairline)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--ln-ink)' }}>修改 Header 标题：</span>
              <input
                type="text"
                value={mobileHeaderTitle}
                onChange={(e) => setMobileHeaderTitle(e.target.value)}
                style={{
                  padding: '6px 10px',
                  borderRadius: '6px',
                  border: '1px solid var(--ln-hairline-strong)',
                  background: 'var(--ln-surface-card)',
                  color: 'var(--ln-ink)',
                  fontSize: '12px'
                }}
              />
            </div>
            <div style={{ fontSize: '12px', color: '#533AFD', fontWeight: 600 }}>
              当前 Tab：<span style={{ fontFamily: 'monospace' }}>{mobileTabKey}</span>
            </div>
          </div>

          {/* Interactive Mobile Header Live Preview */}
          <div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--ln-ink)', marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span>1. V2MobileHeader（移动端顶部导航栏 · 高度 44px + Safe Area）</span>
              <span style={{ fontSize: '11px', color: 'var(--ln-muted)', fontWeight: 400 }}>支持毛玻璃 Backdrop Blur / 左右动作按键 / Badge 红点</span>
            </div>
            <div style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--ln-hairline)', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
              <V2MobileHeader
                title={mobileHeaderTitle}
                subtitle="编号：LC-2026-0723-001"
                showBack={true}
                onBack={() => setMobileActionToast('点击了顶部返回按钮')}
                rightActions={[
                  {
                    key: 'search',
                    icon: <Search style={{ width: '18px', height: '18px' }} />,
                    label: '',
                    onClick: () => setMobileActionToast('点击了搜索按钮')
                  },
                  {
                    key: 'share',
                    icon: <Share2 style={{ width: '18px', height: '18px' }} />,
                    badge: true,
                    onClick: () => setMobileActionToast('点击了分享按钮')
                  },
                  {
                    key: 'more',
                    icon: <MoreHorizontal style={{ width: '18px', height: '18px' }} />,
                    onClick: () => setMobileActionToast('点击了更多设置按钮')
                  }
                ]}
              />
            </div>
          </div>

          {/* Interactive Mobile Bottom Nav Live Preview */}
          <div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--ln-ink)', marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span>2. V2MobileBottomNav（移动端底部 TabBar 导航 · 高度 50px + Safe Area）</span>
              <span style={{ fontSize: '11px', color: 'var(--ln-muted)', fontWeight: 400 }}>Stripe Violet `#533AFD` 选中态高亮 / 支持红点与数字角标</span>
            </div>
            <div style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--ln-hairline)', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
              <V2MobileBottomNav
                items={[
                  { key: 'home', label: '工作台', icon: <Home style={{ width: '20px', height: '20px' }} /> },
                  { key: 'contracts', label: '合同台账', icon: <FileText style={{ width: '20px', height: '20px' }} />, badge: '3' },
                  { key: 'vehicles', label: '车辆履约', icon: <Truck style={{ width: '20px', height: '20px' }} />, badge: true },
                  { key: 'mine', label: '个人中心', icon: <User style={{ width: '20px', height: '20px' }} /> }
                ]}
                activeKey={mobileTabKey}
                onChange={(k) => {
                  setMobileTabKey(k);
                  setMobileActionToast(`切换至 Tab: ${k}`);
                }}
              />
            </div>
          </div>

          {/* Interactive Mobile Floating Action Bar Live Preview */}
          <div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--ln-ink)', marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span>3. V2MobileActionBar（移动端固定吸底主操作条 · 高度 56px + Safe Area）</span>
              <span style={{ fontSize: '11px', color: 'var(--ln-muted)', fontWeight: 400 }}>金额与等宽数字计算 / 触控按键高 44px</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: isH5 ? '1fr' : '1fr 1fr', gap: '16px' }}>
              {/* Variant A: Summary Price + Primary CTA */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <span style={{ fontSize: '11px', color: 'var(--ln-muted)', fontWeight: 600 }}>形态 A：金额汇总 + 44px 主提交 CTA</span>
                <div style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--ln-hairline)' }}>
                  <V2MobileActionBar
                    summaryLabel="首期应付合计"
                    summaryPrice="45,000.00"
                    summarySubtext="含保证金 ¥30,000 + 首月租金 ¥15,000"
                    primaryText="确认并提交审批"
                    onPrimary={() => setMobileActionToast('提交审批成功！')}
                  />
                </div>
              </div>

              {/* Variant B: Cancel + Primary CTA */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <span style={{ fontSize: '11px', color: 'var(--ln-muted)', fontWeight: 600 }}>形态 B：次要动作 + 主提交 CTA</span>
                <div style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--ln-hairline)' }}>
                  <V2MobileActionBar
                    secondaryText="暂存草稿"
                    onSecondary={() => setMobileActionToast('已暂存至草稿箱')}
                    primaryText="立即签署合同"
                    onPrimary={() => setMobileActionToast('已唤起电子签章')}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Feedback Toast Notice */}
          {mobileActionToast && (
            <div
              style={{
                padding: '10px 14px',
                borderRadius: '8px',
                background: 'rgba(83, 58, 253, 0.08)',
                border: '1px solid rgba(83, 58, 253, 0.2)',
                color: '#533AFD',
                fontSize: '12px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <span>⚡ {mobileActionToast}</span>
              <button
                type="button"
                onClick={() => setMobileActionToast('')}
                style={{ background: 'transparent', border: 'none', color: '#533AFD', cursor: 'pointer', fontSize: '11px', fontWeight: 700 }}
              >
                关闭
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Section 5.3: Pagination Controller */}
      <section id="sec-pagination" style={{ marginBottom: '48px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(83, 58, 253, 0.1)', color: '#533AFD' }}>
            <FileText style={{ width: '20px', height: '20px' }} />
          </div>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--ln-ink)', margin: 0 }}>
              5.3 统一分页控制器 (V2Pagination Controller)
            </h2>
            <p style={{ fontSize: '12px', color: 'var(--ln-muted)', margin: '2px 0 0 0' }}>
              面向列表台账、模态框明细与 H5 响应式界面的全局高规分页组件（支持条数切换、快速跳转、Tabular Nums 与 H5 自适应）
            </p>
          </div>
        </div>

        <div className="ds-card" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* 1. Interactive Standard Pagination */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--ln-ink)' }}>
                1. 交互式标准台账分页 (Standard Interactive V2Pagination)
              </div>
              <div style={{ fontSize: '11px', color: 'var(--ln-muted)', fontFamily: '"JetBrains Mono", tabular-nums' }}>
                当前页: <span style={{ color: '#533AFD', fontWeight: 700 }}>{paginationPage}</span> / {Math.ceil(paginationTotal / paginationSize)} | 每页 {paginationSize} 条 | 共 {paginationTotal} 条
              </div>
            </div>

            <V2Pagination
              page={paginationPage}
              pageSize={paginationSize}
              total={paginationTotal}
              onPageChange={setPaginationPage}
              onPageSizeChange={setPaginationSize}
              showQuickJumper={true}
              showSizeChanger={true}
              showTotal={true}
            />
          </div>

          {/* 2. Compact / Modal Pagination */}
          <div style={{ borderTop: '1px solid var(--ln-hairline)', paddingTop: '16px' }}>
            <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--ln-ink)', marginBottom: '12px' }}>
              2. 紧凑型 / 模态框明细表分页 (Small / Modal Detail V2Pagination)
            </div>
            <div style={{ background: 'var(--ln-surface-pearl)', padding: '8px 12px', borderRadius: '8px' }}>
              <V2Pagination
                size="small"
                page={2}
                pageSize={10}
                total={85}
                showQuickJumper={false}
                showSizeChanger={true}
                showTotal={true}
              />
            </div>
          </div>

          {/* 3. Disabled Pagination */}
          <div style={{ borderTop: '1px solid var(--ln-hairline)', paddingTop: '16px' }}>
            <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--ln-ink)', marginBottom: '12px' }}>
              3. 禁用加载中状态 (Disabled / Loading V2Pagination)
            </div>
            <V2Pagination
              disabled={true}
              page={3}
              pageSize={20}
              total={120}
              showQuickJumper={true}
              showSizeChanger={true}
              showTotal={true}
            />
          </div>

          {/* 4. Mobile H5 Mode */}
          <div style={{ borderTop: '1px solid var(--ln-hairline)', paddingTop: '16px' }}>
            <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--ln-ink)', marginBottom: '12px' }}>
              4. H5 移动端触控模式预演 (Mobile Touch Responsive V2Pagination)
            </div>
            <div style={{ maxWidth: '375px', border: '1px solid var(--ln-hairline)', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}>
              <V2Pagination
                page={paginationPage}
                pageSize={paginationSize}
                total={paginationTotal}
                onPageChange={setPaginationPage}
                onPageSizeChange={setPaginationSize}
                showTotal={true}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Section 5.4: Empty States & Exception Views */}
      <section id="sec-empty_states" style={{ marginBottom: '48px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(83, 58, 253, 0.1)', color: '#533AFD' }}>
            <Layers style={{ width: '20px', height: '20px' }} />
          </div>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--ln-ink)', margin: 0 }}>
              5.4 空状态与异常页规范 (Empty States & Exception Views V2Empty)
            </h2>
            <p style={{ fontSize: '12px', color: 'var(--ln-muted)', margin: '2px 0 0 0' }}>
              涵盖无数据台账、无搜索匹配、403无权限、500服务异常与网络断开等多种预设场景（支持 Stripe Violet 光环与 44px 移动端触控按键）
            </p>
          </div>
        </div>

        <div className="ds-card" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Grid Layout for Empty State Scenarios */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isH5 ? '1fr' : 'repeat(auto-fit, minmax(340px, 1fr))',
              gap: '16px'
            }}
          >
            {/* Scenario 1: Default Empty / No Data */}
            <div style={{ border: '1px solid var(--ln-hairline)', borderRadius: '12px', background: 'var(--ln-surface-pearl)', overflow: 'hidden' }}>
              <div style={{ padding: '12px 16px', background: 'var(--ln-surface-card)', borderBottom: '1px solid var(--ln-hairline)', fontSize: '12px', fontWeight: 700, color: 'var(--ln-ink)' }}>
                1. 默认暂无数据 (`type="empty"`)
              </div>
              <V2Empty
                type="empty"
                title="暂无租赁合同记录"
                description="当前租户库或选定主体下尚未创建合同，您可以新建第一份正式合同。"
                primaryActionText="新建合同"
                onPrimaryAction={() => alert('触发：新建合同')}
              />
            </div>

            {/* Scenario 2: Search / Filter No Result */}
            <div style={{ border: '1px solid var(--ln-hairline)', borderRadius: '12px', background: 'var(--ln-surface-pearl)', overflow: 'hidden' }}>
              <div style={{ padding: '12px 16px', background: 'var(--ln-surface-card)', borderBottom: '1px solid var(--ln-hairline)', fontSize: '12px', fontWeight: 700, color: 'var(--ln-ink)' }}>
                2. 未筛选到匹配结果 (`type="no_search"`)
              </div>
              <V2Empty
                type="no_search"
                title="未匹配到符合条件的合同"
                description="未找到符合当前 13 项高阶筛选条件的数据，建议您尝试清空搜索条件。"
                primaryActionText="重置筛选条件"
                onPrimaryAction={() => alert('触发：重置筛选')}
                secondaryActionText="更换关键词"
                onSecondaryAction={() => alert('触发：更换关键词')}
              />
            </div>

            {/* Scenario 3: 403 Permission Denied */}
            <div style={{ border: '1px solid var(--ln-hairline)', borderRadius: '12px', background: 'var(--ln-surface-pearl)', overflow: 'hidden' }}>
              <div style={{ padding: '12px 16px', background: 'var(--ln-surface-card)', borderBottom: '1px solid var(--ln-hairline)', fontSize: '12px', fontWeight: 700, color: 'var(--ln-ink)' }}>
                3. 暂无模块访问权限 (`type="no_permission"`)
              </div>
              <V2Empty
                type="no_permission"
                title="暂无该数据表的查看权限"
                description="您当前账号角色未包含该敏感模块的只读或编辑权限，请提交工单联系管理员。"
                primaryActionText="申请开通权限"
                onPrimaryAction={() => alert('触发：申请权限')}
              />
            </div>

            {/* Scenario 4: 500 Server Error / Network Timeout */}
            <div style={{ border: '1px solid var(--ln-hairline)', borderRadius: '12px', background: 'var(--ln-surface-pearl)', overflow: 'hidden' }}>
              <div style={{ padding: '12px 16px', background: 'var(--ln-surface-card)', borderBottom: '1px solid var(--ln-hairline)', fontSize: '12px', fontWeight: 700, color: 'var(--ln-ink)' }}>
                4. 后端服务加载异常 (`type="server_error"`)
              </div>
              <V2Empty
                type="server_error"
                title="数据服务加载失败 (500)"
                description="网络请求超时或后端服务发生异常，请检查网络后再试。"
                primaryActionText="一键刷新重试"
                onPrimaryAction={() => alert('触发：刷新重试')}
              />
            </div>
          </div>

          {/* Compact / In-Card Empty State */}
          <div style={{ borderTop: '1px solid var(--ln-hairline)', paddingTop: '16px' }}>
            <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--ln-ink)', marginBottom: '12px' }}>
              5. 卡片/抽屉内嵌入紧凑型空状态 (`size="compact"`)
            </div>
            <div style={{ border: '1px dashed var(--ln-hairline)', borderRadius: '8px', background: 'var(--ln-surface-pearl)' }}>
              <V2Empty
                size="compact"
                type="empty"
                title="暂无关联车辆交接明细"
                description="该合同项下尚未录入车辆交接记录，点击右侧按钮可补录。"
                primaryActionText="补录交接记录"
                onPrimaryAction={() => alert('触发：补录交接')}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Section 6: Badges & Status Pills */}
      <section id="sec-badges" style={{ marginBottom: '48px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(83, 58, 253, 0.1)', color: '#533AFD' }}>
            <RadioIcon style={{ width: '20px', height: '20px' }} />
          </div>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--ln-ink)', margin: 0 }}>
              6. 状态徽章与胶囊 Pill (Badges & Status Pills)
            </h2>
            <p style={{ fontSize: '12px', color: 'var(--ln-muted)', margin: '2px 0 0 0' }}>
              五色状态与电子签章语义徽章（圆角 9999px Pill 统一造型）
            </p>
          </div>
        </div>

        <div className="ds-card" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '12px' }}>
          <span className="ds-pill" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10B981' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10B981', flexShrink: 0 }} />
            履约执行中
          </span>
          <span className="ds-pill" style={{ background: 'rgba(217, 119, 6, 0.15)', color: '#D97706' }}>
            <Clock3 style={{ width: '13px', height: '13px', flexShrink: 0 }} />
            待审批与盖章
          </span>
          <span className="ds-pill" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#EF4444' }}>
            <XCircle style={{ width: '13px', height: '13px', flexShrink: 0 }} />
            已欠费 / 超期终止
          </span>
          <span className="ds-pill" style={{ background: 'var(--ln-surface-strong)', color: 'var(--ln-muted)' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--ln-muted)', flexShrink: 0 }} />
            草稿未提交
          </span>
          <span className="ds-pill" style={{ background: 'rgba(83, 58, 253, 0.15)', color: '#533AFD' }}>
            <CheckCircle2 style={{ width: '13px', height: '13px', flexShrink: 0 }} />
            在线电子签章认证
          </span>
        </div>
      </section>

      {/* Section 7: Composite Components */}
      <section id="sec-composite" style={{ marginBottom: '48px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(83, 58, 253, 0.1)', color: '#533AFD' }}>
            <Filter style={{ width: '20px', height: '20px' }} />
          </div>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--ln-ink)', margin: 0 }}>
              7. 复合组件：13 项高阶条件筛选区与 H5 响应式卡片台账
            </h2>
            <p style={{ fontSize: '12px', color: 'var(--ln-muted)', margin: '2px 0 0 0' }}>
              移动端 H5 模式下 13 项筛选单列自适应折叠，大盘表格转化为单列卡片展示
            </p>
          </div>
        </div>

        {/* 13 Items FilterBar Preview with Custom V2 Controls */}
        <div className="ds-card" style={{ marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', color: '#533AFD', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Filter style={{ width: '14px', height: '14px' }} />
              13 项高阶筛选组件 (H5 移动端单列自适应折叠)
            </h3>
            <button
              onClick={() => setFilterExpanded(!filterExpanded)}
              style={{ background: 'none', border: 'none', color: '#533AFD', fontWeight: 700, fontSize: '12px', cursor: 'pointer' }}
            >
              {filterExpanded ? '收起 13 项筛选 ▲' : '展开 13 项筛选 ▼'}
            </button>
          </div>

          {/* Live Filter Inputs Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: isH5 ? '1fr' : 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px 12px', alignItems: 'end' }}>
            <div style={{ width: '100%', minWidth: 0, boxSizing: 'border-box' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--ln-body)', display: 'block', marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>1. 合同编码</label>
              <input type="text" placeholder="输入合同编号..." className="ds-input" />
            </div>
            <div style={{ width: '100%', minWidth: 0, boxSizing: 'border-box' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--ln-body)', display: 'block', marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>2. 项目名称</label>
              <input type="text" placeholder="输入项目名..." className="ds-input" />
            </div>
            <div style={{ width: '100%', minWidth: 0, boxSizing: 'border-box' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--ln-body)', display: 'block', marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>3. 客户名称</label>
              <input type="text" placeholder="输入客户名..." className="ds-input" />
            </div>
            <div style={{ width: '100%', minWidth: 0, boxSizing: 'border-box' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--ln-body)', display: 'block', marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>4. 签约公司主体</label>
              <V2Select options={COMPANY_OPTIONS} value={singleSelect} onChange={setSingleSelect} />
            </div>

            {filterExpanded && (
              <>
                <div style={{ width: '100%', minWidth: 0, boxSizing: 'border-box' }}>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--ln-body)', display: 'block', marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>5. 审批状态 (多选)</label>
                  <V2Select options={STATUS_OPTIONS} value={multiSelect} onChange={setMultiSelect} multiple searchable />
                </div>
                <div style={{ width: '100%', minWidth: 0, boxSizing: 'border-box' }}>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--ln-body)', display: 'block', marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>6. 合同状态</label>
                  <V2Select options={[{ value: '进行中', label: '合同进行中' }, { value: '已终止', label: '已终止' }]} value="进行中" onChange={() => {}} />
                </div>
                <div style={{ width: '100%', minWidth: 0, boxSizing: 'border-box' }}>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--ln-body)', display: 'block', marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>7. 业务部门</label>
                  <input type="text" placeholder="业务部..." className="ds-input" />
                </div>
                <div style={{ width: '100%', minWidth: 0, boxSizing: 'border-box' }}>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--ln-body)', display: 'block', marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>8. 业务负责人</label>
                  <input type="text" placeholder="负责人..." className="ds-input" />
                </div>
                <div style={{ width: '100%', minWidth: 0, boxSizing: 'border-box' }}>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--ln-body)', display: 'block', marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>9. 合同模板分类</label>
                  <V2Select options={[{ value: '正式合同', label: '正式合同' }, { value: '试用合同', label: '试用合同' }]} value="正式合同" onChange={() => {}} />
                </div>
                <div style={{ width: '100%', minWidth: 0, boxSizing: 'border-box' }}>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--ln-body)', display: 'block', marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>10. 标准合同名称 (联动)</label>
                  <V2Select options={TEMPLATE_OPTIONS} value={searchSelect} onChange={setSearchSelect} searchable />
                </div>
                <div style={{ width: '100%', minWidth: 0, boxSizing: 'border-box' }}>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--ln-body)', display: 'block', marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>11. 审批类型</label>
                  <V2Select options={[{ value: '标准合同', label: '标准合同' }, { value: '非标合同', label: '非标合同' }]} value="标准合同" onChange={() => {}} />
                </div>
                <div style={{ width: '100%', minWidth: 0, boxSizing: 'border-box' }}>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--ln-body)', display: 'block', marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>12. 创建人</label>
                  <input type="text" placeholder="创建人..." className="ds-input" />
                </div>
                <div style={{ gridColumn: isH5 ? 'span 1' : 'span 2', width: '100%', minWidth: 0, boxSizing: 'border-box' }}>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--ln-body)', display: 'block', marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    13. 合同结束日期 (V2SingleInputDateRangePicker)
                  </label>
                  <V2SingleInputDateRangePicker startDate={singleInputStart} endDate={singleInputEnd} onChange={(s, e) => { setSingleInputStart(s); setSingleInputEnd(e); }} />
                </div>
              </>
            )}
          </div>

          {/* V2 查询收起规则 Demo：查询 / 重置后自动收起展开项 */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap', paddingTop: '4px', borderTop: '1px dashed var(--ln-hairline)' }}>
            <p style={{ fontSize: '11px', color: 'var(--ln-muted)', margin: 0 }}>
              规范：筛选展开后点击【查询】或【重置】须自动收起并展示结果
            </p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                className="ds-btn-secondary"
                style={{ padding: '7px 16px', fontSize: '12px', minHeight: isH5 ? '44px' : undefined }}
                onClick={() => setFilterExpanded(false)}
              >
                <RotateCcw style={{ width: '14px', height: '14px' }} /> 重置
              </button>
              <button
                type="button"
                className="ds-btn-primary"
                style={{ padding: '7px 20px', fontSize: '12px', minHeight: isH5 ? '44px' : undefined }}
                onClick={() => setFilterExpanded(false)}
              >
                <Search style={{ width: '14px', height: '14px' }} /> 查询（收起筛选）
              </button>
            </div>
          </div>
        </div>

        {/* Expandable Vehicle Sub-Table Demonstration */}
        <div className="ds-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', color: '#533AFD', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Truck style={{ width: '14px', height: '14px' }} />
              嵌套车辆/订单台账 ({isH5 ? 'H5 移动端卡片模式' : '表格表格模式'})
            </h3>
            <button
              onClick={() => setTableSubExpanded(!tableSubExpanded)}
              className="ds-btn-outline"
              style={{ padding: '4px 12px', fontSize: '11px' }}
            >
              {tableSubExpanded ? '收起子表' : '展开车辆子表 ▶'}
            </button>
          </div>

          {isH5 ? (
            /* Mobile Card View for H5 */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ padding: '16px', borderRadius: '12px', border: '1px solid var(--ln-hairline)', background: 'var(--ln-surface-card)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '14px', color: '#533AFD' }}>嘉兴氢能快递物流运输项目</div>
                    <div style={{ fontSize: '11px', fontFamily: 'monospace', color: 'var(--ln-muted)' }}>LC-2026-001</div>
                  </div>
                  <span className="ds-pill" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10B981' }}>
                    履约中
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', borderTop: '1px solid var(--ln-hairline)', paddingTop: '8px' }}>
                  <span style={{ color: 'var(--ln-muted)' }}>签约主体:</span>
                  <span style={{ fontWeight: 600, color: 'var(--ln-ink)' }}>羚牛氢能 (浙江) 公司</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                  <span style={{ color: 'var(--ln-muted)' }}>租赁月租金:</span>
                  <span style={{ fontWeight: 800, color: '#10B981', fontFamily: 'monospace' }}>¥ 45,000.00 /月</span>
                </div>

                <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                  <span style={{ padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 700, background: 'rgba(83, 58, 253, 0.15)', color: '#533AFD' }}>租赁 3 辆</span>
                  <span style={{ padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 700, background: 'rgba(16, 185, 129, 0.15)', color: '#10B981' }}>已交 2 辆</span>
                </div>

                {tableSubExpanded && (
                  <div style={{ marginTop: '8px', paddingTop: '10px', borderTop: '1px solid var(--ln-hairline)', background: 'var(--ln-surface-pearl)', padding: '10px', borderRadius: '8px' }}>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#533AFD', marginBottom: '8px' }}>嵌套车辆子卡片 (浙A88888F)</div>
                    <div style={{ fontSize: '11px', display: 'flex', flexDirection: 'column', gap: '4px', color: 'var(--ln-body)' }}>
                      <div>VIN: LNH249T2026001</div>
                      <div>提车款: <span style={{ color: '#10B981', fontWeight: 700 }}>已付 ¥10,000</span></div>
                      <div>交车记录: 12,500 km (2026-06-01)</div>
                      <div>里程进度: 12,500/20,000 km (62.5%)</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Desktop Table View */
            <div style={{ border: '1px solid var(--ln-hairline)', borderRadius: '12px', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12px' }}>
                <thead style={{ background: 'var(--ln-surface-pearl)', color: 'var(--ln-muted)' }}>
                  <tr>
                    <th style={{ padding: '12px' }}>项目信息与编码</th>
                    <th style={{ padding: '12px' }}>租赁订单数</th>
                    <th style={{ padding: '12px' }}>签约主体</th>
                    <th style={{ padding: '12px' }}>履约与审批状态</th>
                    <th style={{ padding: '12px', textAlign: 'right' }}>月租金</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderTop: '1px solid var(--ln-hairline)' }}>
                    <td style={{ padding: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <button
                          onClick={() => setTableSubExpanded(!tableSubExpanded)}
                          style={{ background: 'none', border: 'none', color: '#533AFD', cursor: 'pointer', padding: 0 }}
                        >
                          {tableSubExpanded ? <ChevronDown style={{ width: '16px', height: '16px' }} /> : <ChevronRight style={{ width: '16px', height: '16px' }} />}
                        </button>
                        <div>
                          <div style={{ fontWeight: 700, color: '#533AFD' }}>嘉兴氢能快递物流运输项目</div>
                          <div style={{ fontSize: '11px', fontFamily: 'monospace', color: 'var(--ln-muted)' }}>LC-2026-001</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 700, background: 'rgba(83, 58, 253, 0.15)', color: '#533AFD' }}>租赁 3 辆</span>
                        <span style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 700, background: 'rgba(16, 185, 129, 0.15)', color: '#10B981' }}>已交 2 辆</span>
                      </div>
                    </td>
                    <td style={{ padding: '12px', color: 'var(--ln-body)' }}>羚牛氢能 (浙江) 公司</td>
                    <td style={{ padding: '12px' }}>
                      <span className="ds-pill" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10B981' }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10B981', flexShrink: 0 }} />
                        履约执行中
                      </span>
                    </td>
                    <td style={{ padding: '12px', textAlign: 'right', fontFamily: 'monospace', fontWeight: 700, color: '#10B981' }}>¥ 45,000.00 /月</td>
                  </tr>
                </tbody>
              </table>

              {tableSubExpanded && (
                <div style={{ padding: '16px', borderTop: '1px solid var(--ln-hairline)', background: 'var(--ln-surface-pearl)' }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, marginBottom: '8px', display: 'flex', justifyContent: 'space-between', color: '#533AFD' }}>
                    <span>包含车辆明细子表 (VehicleSubTable)</span>
                    <span style={{ fontSize: '11px', color: 'var(--ln-muted)' }}>实时展示车辆提车、交车记录、还车应结与里程要求</span>
                  </div>

                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12px', background: 'var(--ln-surface-card)', borderRadius: '8px', border: '1px solid var(--ln-hairline)' }}>
                    <thead style={{ fontSize: '11px', color: 'var(--ln-muted)', borderBottom: '1px solid var(--ln-hairline)' }}>
                      <tr>
                        <th style={{ padding: '10px' }}>车牌号 / VIN</th>
                        <th style={{ padding: '10px' }}>提车应收款</th>
                        <th style={{ padding: '10px' }}>交车记录</th>
                        <th style={{ padding: '10px' }}>租赁账单</th>
                        <th style={{ padding: '10px' }}>里程要求与进度</th>
                        <th style={{ padding: '10px', textAlign: 'right' }}>操作</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr style={{ borderBottom: '1px solid var(--ln-hairline)' }}>
                        <td style={{ padding: '10px' }}>
                          <div style={{ fontFamily: 'monospace', fontWeight: 700, color: '#533AFD' }}>浙A88888F</div>
                          <div style={{ fontSize: '10px', fontFamily: 'monospace', color: 'var(--ln-muted)' }}>LNH249T2026001</div>
                        </td>
                        <td style={{ padding: '10px', color: '#10B981', fontWeight: 700 }}>已支付 ¥10,000</td>
                        <td style={{ padding: '10px', color: 'var(--ln-body)' }}>12,500 km (张三/2026-06-01)</td>
                        <td style={{ padding: '10px' }}><span style={{ color: '#10B981', fontWeight: 700 }}>正常</span></td>
                        <td style={{ padding: '10px' }}>
                          <div style={{ width: '130px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--ln-muted)', marginBottom: '2px' }}>
                              <span>12,500/20,000 km</span>
                              <span style={{ color: '#10B981', fontWeight: 700 }}>62.5%</span>
                            </div>
                            <div style={{ width: '100%', height: '6px', borderRadius: '9999px', background: 'var(--ln-hairline-strong)', overflow: 'hidden' }}>
                              <div style={{ height: '100%', background: '#533AFD', width: '62.5%' }} />
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '10px', textAlign: 'right' }}>
                          <button style={{ background: 'none', border: 'none', color: '#533AFD', fontWeight: 700, fontSize: '12px', cursor: 'pointer' }}>还车办理</button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Section 8: Steps, Timeline & Approval Workflow Progress */}
      <section id="sec-steps_timeline" style={{ marginBottom: '48px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(83, 58, 253, 0.1)', color: '#533AFD' }}>
            <Layers style={{ width: '20px', height: '20px' }} />
          </div>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--ln-ink)', margin: 0 }}>
              8. 步骤条、时间轴与审批流程进度 (Steps, Timeline & Approval Workflow Progress)
            </h2>
            <p style={{ fontSize: '12px', color: 'var(--ln-muted)', margin: '2px 0 0 0' }}>
              面向履约阶段、审批节点、全生命周期日志与工单轨迹的高规组件集
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* 8.1 步骤条 V2Steps Demo Card */}
          <div className="ds-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--ln-ink)', margin: 0 }}>
                  8.1 横向与垂直步骤条 (V2Steps)
                </h3>
                <p style={{ fontSize: '12px', color: 'var(--ln-muted)', margin: '2px 0 0 0' }}>
                  支持 finish / process / wait / error 状态，自定义 Icon，标题与子描述
                </p>
              </div>

              {/* Interactive Controls for V2Steps */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--ln-muted)' }}>
                  <span>当前步骤:</span>
                  {[0, 1, 2, 3].map((stepIdx) => (
                    <button
                      key={stepIdx}
                      onClick={() => setCurrentStep(stepIdx)}
                      style={{
                        padding: '2px 8px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: currentStep === stepIdx ? 700 : 500,
                        border: '1px solid var(--ln-hairline)',
                        background: currentStep === stepIdx ? '#533AFD' : 'var(--ln-surface-pearl)',
                        color: currentStep === stepIdx ? '#FFFFFF' : 'var(--ln-ink)',
                        cursor: 'pointer'
                      }}
                    >
                      步骤 {stepIdx + 1}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setStepDirection(stepDirection === 'horizontal' ? 'vertical' : 'horizontal')}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: 600,
                    border: '1px solid var(--ln-hairline)',
                    background: 'var(--ln-surface-pearl)',
                    color: '#533AFD',
                    cursor: 'pointer'
                  }}
                >
                  切换方向: {stepDirection === 'horizontal' ? '横向' : '垂直'}
                </button>

                <button
                  onClick={() => setStepStatus(stepStatus === 'error' ? 'process' : 'error')}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: 600,
                    border: '1px solid var(--ln-hairline)',
                    background: stepStatus === 'error' ? 'rgba(239, 68, 68, 0.15)' : 'var(--ln-surface-pearl)',
                    color: stepStatus === 'error' ? '#EF4444' : 'var(--ln-body)',
                    cursor: 'pointer'
                  }}
                >
                  {stepStatus === 'error' ? '切回正常(Process)' : '模拟异常(Error)'}
                </button>
              </div>
            </div>

            <div style={{ padding: '16px', background: 'var(--ln-surface-pearl)', borderRadius: '10px', border: '1px solid var(--ln-hairline)' }}>
              <V2Steps
                current={currentStep}
                direction={stepDirection}
                status={stepStatus}
                onChange={(newStep) => setCurrentStep(newStep)}
                items={[
                  {
                    title: '填写租赁意向',
                    description: '选择车系、提车网点与租赁期限',
                    subDescription: '2026-07-23 09:30 · 经办人：张经理'
                  },
                  {
                    title: '主体资质审核',
                    description: '上传营业执照、法人身份证与承租授权书',
                    subDescription: '2026-07-23 10:15 · 审核中'
                  },
                  {
                    title: '签署合同与首付款',
                    description: '在线电子签章及定金/预付款划扣',
                    subDescription: '待处理'
                  },
                  {
                    title: '车辆交付与起租',
                    description: '到店扫码验车、签署交车确认单',
                    subDescription: '未开始'
                  }
                ]}
              />
            </div>
          </div>

          {/* 8.2 时间轴 V2Timeline Demo Card */}
          <div className="ds-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--ln-ink)', margin: 0 }}>
                8.2 全生命周期与审计日志时间轴 (V2Timeline)
              </h3>
              <p style={{ fontSize: '12px', color: 'var(--ln-muted)', margin: '2px 0 0 0' }}>
                节点状态包含 紫光高规 (#533AFD) / 成功 (#10B981) / 预警 (#D97706) / 错误 (#EF4444) / 灰度 (#627D98)
              </p>
            </div>

            <div style={{ padding: '16px', background: 'var(--ln-surface-pearl)', borderRadius: '10px', border: '1px solid var(--ln-hairline)' }}>
              <V2Timeline
                items={[
                  {
                    title: '车辆验车入库与智能终端绑定',
                    timestamp: '2026-07-23 14:30:22',
                    operator: '李工 (车载运维组)',
                    tag: '硬件部署',
                    color: 'violet',
                    content: '完成 3 台现代 18 吨氢能重卡 T-Box 终端激活，车联网数据上报正常，信号强度 100%。'
                  },
                  {
                    title: '法务终审与印章调用完成',
                    timestamp: '2026-07-23 11:15:00',
                    operator: '王法务 (法务部)',
                    tag: '合同归档',
                    color: 'success',
                    content: '电子合同编号 LC-2026-0723-001 已完成双章签署，PDF 文件加密归档至云端存储。'
                  },
                  {
                    title: '预算额度超限风险预警',
                    timestamp: '2026-07-22 17:45:10',
                    operator: '风控系统 (AutoRDO)',
                    tag: '风控触发',
                    color: 'warning',
                    content: '承租方嘉兴氢能运力累计在租金额超过单客户授信上限 (¥5,000,000.00)，已自动触发补充保证金要求。'
                  },
                  {
                    title: '保证金支付逾期未打款',
                    timestamp: '2026-07-21 09:00:00',
                    operator: '财务结算中心',
                    tag: '异常退回',
                    color: 'error',
                    content: '首期履约保证金 ¥150,000.00 超过约定划扣时间 24 小时，已暂停下发车辆解锁密钥。'
                  },
                  {
                    title: '初始草稿提交与项目创建',
                    timestamp: '2026-07-20 16:20:00',
                    operator: '张经理 (大客户组)',
                    tag: '新建工单',
                    color: 'muted',
                    content: '创建车辆租赁意向单，锁定 3 台嘉兴港口路线氢能重卡运力额度。'
                  }
                ]}
              />
            </div>
          </div>

          {/* 8.3 审批流程进度 V2ApprovalProgress Demo Card */}
          <div className="ds-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--ln-ink)', margin: 0 }}>
                8.3 多阶段审批流进度面板 (V2ApprovalProgress - 垂直贯穿式)
              </h3>
              <p style={{ fontSize: '12px', color: 'var(--ln-muted)', margin: '2px 0 0 0' }}>
                采用垂直贯穿时间轴与卡片结构，解决横向审批部门/节点过多时一页无法完整显示的问题。
              </p>
            </div>

            <div style={{ padding: '16px', background: 'var(--ln-surface-pearl)', borderRadius: '10px', border: '1px solid var(--ln-hairline)' }}>
              <V2ApprovalProgress
                direction="vertical"
                nodes={[
                  {
                    title: '发起租赁申请',
                    approver: { name: '王冕', role: '大客户经理' },
                    status: 'approved',
                    timestamp: '2026-07-23 09:10',
                    duration: '5分钟',
                    comment: '提交 3 台氢能重卡 36 个月长租申请，客户信用等级 AAA。'
                  },
                  {
                    title: '部门主管复核',
                    approver: { name: '张立军', role: '运力业务总监' },
                    status: 'approved',
                    timestamp: '2026-07-23 10:15',
                    duration: '1小时05分',
                    comment: '同意申请，商务租金折扣符合 Q3 专场优惠标准。'
                  },
                  {
                    title: '风控合规审查',
                    approver: { name: '钱风控', role: '风险管理部总监' },
                    status: 'approved',
                    timestamp: '2026-07-23 11:30',
                    duration: '1小时15分',
                    comment: '已核查客户履约记录与资产抵押物，风控额度审核通过。'
                  },
                  {
                    title: '法务审核盖章',
                    approver: { name: '赵法务', role: '高级法务专家' },
                    status: 'processing',
                    timestamp: '2026-07-23 14:00',
                    duration: '进行中...',
                    comment: '正在核对合同特殊违约责任条款与赔偿限额。'
                  },
                  {
                    title: '财务归档放款',
                    approver: { name: '陈财务', role: '资深财务经理' },
                    status: 'pending',
                    timestamp: '-',
                    duration: '-'
                  }
                ]}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Section 9: Three Views Architecture Schemas */}
      <section id="sec-views" style={{ marginBottom: '48px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(83, 58, 253, 0.1)', color: '#533AFD' }}>
            <LayoutGrid style={{ width: '20px', height: '20px' }} />
          </div>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--ln-ink)', margin: 0 }}>
              9. 三视角视图模板结构 (Three Core View Perspective Templates)
            </h2>
            <p style={{ fontSize: '12px', color: 'var(--ln-muted)', margin: '2px 0 0 0' }}>
              所有复杂台账页面统一提供列表模式、看板模式与主从表单模式
            </p>
          </div>
        </div>

        <div className="ds-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              {[
                { id: 'list', label: '1. 列表模式 (List)', icon: Columns },
                { id: 'kanban', label: '2. 看板模式 (Kanban)', icon: Kanban },
                { id: 'split', label: '3. 主从表单模式 (Split)', icon: LayoutGrid },
              ].map((v) => {
                const Icon = v.icon;
                return (
                  <button
                    key={v.id}
                    onClick={() => setMiniViewMode(v.id as any)}
                    className={`ds-nav-btn ${miniViewMode === v.id ? 'active' : ''}`}
                  >
                    <Icon style={{ width: '14px', height: '14px' }} />
                    {v.label}
                  </button>
                );
              })}
            </div>
            <span style={{ fontSize: '12px', color: 'var(--ln-muted)', fontFamily: 'monospace' }}>Top Segmented View Controls Standard</span>
          </div>

          <div style={{ padding: '16px', borderRadius: '12px', border: '1px solid var(--ln-hairline)', background: 'var(--ln-surface-pearl)' }}>
            {miniViewMode === 'list' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#533AFD' }}>视角 1：列表模式 (List View Wireframe)</div>
                <div style={{ display: 'grid', gridTemplateColumns: isH5 ? '1fr 1fr' : 'repeat(4, 1fr)', gap: '8px', fontSize: '10px', textAlign: 'center' }}>
                  <div style={{ padding: '8px', borderRadius: '6px', background: 'var(--ln-surface-card)', border: '1px solid var(--ln-hairline)' }}>KPI 1: ¥ 2.78M</div>
                  <div style={{ padding: '8px', borderRadius: '6px', background: 'var(--ln-surface-card)', border: '1px solid var(--ln-hairline)' }}>KPI 2: 13 辆</div>
                  <div style={{ padding: '8px', borderRadius: '6px', background: 'var(--ln-surface-card)', border: '1px solid var(--ln-hairline)' }}>KPI 3: 3 份待办</div>
                  <div style={{ padding: '8px', borderRadius: '6px', background: 'var(--ln-surface-card)', border: '1px solid var(--ln-hairline)' }}>KPI 4: 预警 4 项</div>
                </div>
                <div style={{ padding: '8px', borderRadius: '6px', background: 'var(--ln-surface-card)', fontSize: '11px', color: 'var(--ln-muted)', border: '1px solid var(--ln-hairline)' }}>
                  13 项高阶筛选区 (FilterBar Component)
                </div>
                <div style={{ padding: '12px', borderRadius: '6px', background: 'var(--ln-surface-card)', fontSize: '11px', color: 'var(--ln-muted)', border: '1px solid var(--ln-hairline)' }}>
                  Stripe 风格表格 (带有项目折叠 ▶ 与内嵌嵌套车辆子表 VehicleSubTable)
                </div>
              </div>
            )}

            {miniViewMode === 'kanban' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#533AFD' }}>视角 2：看板 Pipeline 模式 (Kanban View Wireframe)</div>
                <div style={{ display: 'grid', gridTemplateColumns: isH5 ? '1fr' : 'repeat(4, 1fr)', gap: '8px', fontSize: '10px' }}>
                  <div style={{ padding: '8px', borderRadius: '6px', background: 'var(--ln-surface-strong)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ fontWeight: 700, borderBottom: '1px solid var(--ln-hairline)', paddingBottom: '4px' }}>草稿箱 (2)</div>
                    <div style={{ padding: '6px', borderRadius: '4px', background: 'var(--ln-surface-card)' }}>LC-004 (快捷切入主从)</div>
                  </div>
                  <div style={{ padding: '8px', borderRadius: '6px', background: 'rgba(217, 119, 6, 0.1)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ fontWeight: 700, borderBottom: '1px solid var(--ln-hairline)', paddingBottom: '4px', color: '#D97706' }}>待审批/盖章 (3)</div>
                    <div style={{ padding: '6px', borderRadius: '4px', background: 'var(--ln-surface-card)' }}>LC-002 (盖章中)</div>
                  </div>
                  <div style={{ padding: '8px', borderRadius: '6px', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ fontWeight: 700, borderBottom: '1px solid var(--ln-hairline)', paddingBottom: '4px', color: '#10B981' }}>履约执行中 (8)</div>
                    <div style={{ padding: '6px', borderRadius: '4px', background: 'var(--ln-surface-card)' }}>LC-001 (履行正常)</div>
                  </div>
                  <div style={{ padding: '8px', borderRadius: '6px', background: 'var(--ln-surface-strong)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ fontWeight: 700, borderBottom: '1px solid var(--ln-hairline)', paddingBottom: '4px' }}>已终止/归档 (1)</div>
                    <div style={{ padding: '6px', borderRadius: '4px', background: 'var(--ln-surface-card)' }}>LC-000 (合同结束)</div>
                  </div>
                </div>
              </div>
            )}

            {miniViewMode === 'split' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#533AFD' }}>视角 3：主从双栏模式 (Split Master-Detail Wireframe)</div>
                <div style={{ display: 'grid', gridTemplateColumns: isH5 ? '1fr' : '4fr 8fr', gap: '8px', fontSize: '10px' }}>
                  <div style={{ padding: '8px', borderRadius: '6px', background: 'var(--ln-surface-card)', border: '1px solid #533AFD', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ fontWeight: 700, color: '#533AFD' }}>左侧 340px 任务列表</div>
                    <div style={{ padding: '4px', borderRadius: '4px', background: 'rgba(83, 58, 253, 0.15)', color: '#533AFD' }}>▶ LC-001 选中高亮</div>
                    <div style={{ padding: '4px', borderRadius: '4px', opacity: 0.5 }}>LC-002</div>
                  </div>
                  <div style={{ padding: '12px', borderRadius: '6px', background: 'var(--ln-surface-card)', border: '1px solid var(--ln-hairline)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ fontWeight: 700, display: 'flex', justifyContent: 'space-between' }}>
                      <span>右侧深度工作台 (Detail Pane)</span>
                      <span style={{ color: '#10B981' }}>Sub-Tabs: 车辆履约 | 资质授权 | 审批文件</span>
                    </div>
                    <div style={{ padding: '8px', borderRadius: '4px', background: 'var(--ln-surface-pearl)', fontSize: '10px' }}>
                      实时包含全量表单填报、合规轨痕、支持发起盖章与下载 PDF
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Section 10: Docs & Code References */}
      <section id="sec-docs" style={{ marginBottom: '48px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(83, 58, 253, 0.1)', color: '#533AFD' }}>
            <FileText style={{ width: '20px', height: '20px' }} />
          </div>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--ln-ink)', margin: 0 }}>
              10. 设计规范文档源路径与 Cursor AI Rules
            </h2>
            <p style={{ fontSize: '12px', color: 'var(--ln-muted)', margin: '2px 0 0 0' }}>
              包含 PC / H5 移动端与 App 嵌入式响应式规范与 Token 变量路径
            </p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: isH5 ? '1fr' : 'repeat(auto-fit, minmax(360px, 1fr))', gap: '16px' }}>
          <div className="ds-card" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#533AFD', display: 'flex', justifyContent: 'space-between' }}>
              <span>全局规范 Markdown (DESIGN.md)</span>
              <span style={{ fontSize: '10px', fontFamily: 'monospace', color: 'var(--ln-muted)' }}>v2.3 H5增补版</span>
            </div>
            <div style={{ fontSize: '12px', fontFamily: 'monospace', padding: '8px 12px', borderRadius: '6px', background: 'var(--ln-surface-pearl)', color: 'var(--ln-body)' }}>
              src/resources/design-system/DESIGN.md
            </div>
            <div style={{ fontSize: '11px', color: 'var(--ln-muted)' }}>
              包含全量排版、Design Tokens 语义、13 项筛选及 H5 移动端与 App 嵌入式响应式规范
            </div>
          </div>

          <div className="ds-card" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#533AFD', display: 'flex', justifyContent: 'space-between' }}>
              <span>Cursor Agent 自动规则 (.mdc)</span>
              <span style={{ fontSize: '10px', fontFamily: 'monospace', color: 'var(--ln-muted)' }}>globs: oneos-v2</span>
            </div>
            <div style={{ fontSize: '12px', fontFamily: 'monospace', padding: '8px 12px', borderRadius: '6px', background: 'var(--ln-surface-pearl)', color: 'var(--ln-body)' }}>
              .cursor/rules/oneos-v2-design-system.mdc
            </div>
            <div style={{ fontSize: '11px', color: 'var(--ln-muted)' }}>
              限制 AI 生成新页面或迁移代码时自动继承该设计规范与 PC/H5 响应式要求
            </div>
          </div>
        </div>
      </section>
    </div>
  );

  return (
    <div 
      data-viewport={isH5 ? 'h5' : 'pc'}
      style={{
        minHeight: '100vh',
        background: 'var(--ln-canvas-parchment)',
        color: 'var(--ln-ink)',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "PingFang SC", sans-serif',
        transition: 'background-color 0.2s, color 0.2s'
      }}
    >
      {/* Embedded CSS overrides for components & H5 responsive media queries */}
      <style>{`
        *, *::before, *::after {
          box-sizing: border-box;
        }
        .ds-nav-btn {
          padding: 8px 14px;
          border-radius: 10px;
          font-size: 12px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 6px;
          white-space: nowrap;
          cursor: pointer;
          transition: all 0.15s ease;
          border: 1px solid var(--ln-hairline);
          background: var(--ln-surface-card);
          color: var(--ln-body);
        }
        .ds-nav-btn.active {
          background: #533AFD;
          color: #FFFFFF;
          border-color: #533AFD;
          box-shadow: 0 2px 8px rgba(83, 58, 253, 0.25);
        }
        .ds-grid-4 {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
          gap: 16px;
        }
        .ds-grid-3 {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 20px;
        }
        .ds-card {
          background: var(--ln-surface-card);
          border: 1px solid var(--ln-hairline);
          border-radius: 16px;
          padding: 20px;
          box-sizing: border-box;
        }
        .ds-input {
          box-sizing: border-box;
          width: 100%;
          height: 36px;
          min-height: 44px;
          padding: 0 12px;
          font-size: 13px;
          border-radius: 8px;
          border: 1px solid var(--ln-hairline);
          background: var(--ln-surface-pearl);
          color: var(--ln-ink);
          outline: none;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        .ds-input:focus {
          border-color: #533AFD;
          box-shadow: 0 0 0 3px rgba(83, 58, 253, 0.2);
        }
        .ds-input:disabled {
          background: var(--ln-surface-pearl) !important;
          color: var(--ln-muted) !important;
          border-color: var(--ln-hairline) !important;
          cursor: not-allowed !important;
          box-shadow: none !important;
          opacity: 0.65;
        }
        .ds-input-error {
          border-color: #EF4444;
          box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.15);
        }
        .ds-btn-primary {
          background: #533AFD;
          color: #FFFFFF;
          padding: 10px 18px;
          min-height: 44px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 700;
          border: none;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          box-shadow: 0 2px 6px rgba(83, 58, 253, 0.25);
          transition: background-color 0.15s, transform 0.1s;
        }
        .ds-btn-primary:hover:not(:disabled) {
          background: #6346FF;
        }
        .ds-btn-primary:disabled {
          background: var(--ln-surface-pearl) !important;
          color: var(--ln-muted) !important;
          border: 1px solid var(--ln-hairline) !important;
          cursor: not-allowed !important;
          box-shadow: none !important;
          transform: none !important;
          opacity: 0.65;
        }
        .ds-btn-secondary {
          background: var(--ln-surface-card);
          color: var(--ln-ink);
          border: 1px solid var(--ln-hairline);
          padding: 10px 18px;
          min-height: 44px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          transition: border-color 0.15s;
        }
        .ds-btn-secondary:hover:not(:disabled) {
          border-color: var(--ln-hairline-strong);
        }
        .ds-btn-secondary:disabled {
          background: var(--ln-surface-pearl) !important;
          color: var(--ln-muted) !important;
          border: 1px solid var(--ln-hairline) !important;
          cursor: not-allowed !important;
          box-shadow: none !important;
          opacity: 0.65;
        }
        .ds-btn-outline {
          background: transparent;
          color: #533AFD;
          border: 1px solid #533AFD;
          padding: 10px 18px;
          min-height: 44px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }
        .ds-btn-outline:hover:not(:disabled) {
          background: rgba(83, 58, 253, 0.08);
        }
        .ds-btn-outline:disabled {
          background: var(--ln-surface-pearl) !important;
          color: var(--ln-muted) !important;
          border: 1px solid var(--ln-hairline) !important;
          cursor: not-allowed !important;
          box-shadow: none !important;
          opacity: 0.65;
        }
        .ds-pill {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          height: 28px;
          padding: 0 12px;
          border-radius: 9999px;
          font-size: 12px;
          font-weight: 700;
          line-height: 1;
          box-sizing: border-box;
          white-space: nowrap;
        }

        /* H5 Mobile Responsive Overrides */
        @media (max-width: 767px) {
          .ds-grid-4, .ds-grid-3 {
            grid-template-columns: 1fr !important;
          }
          .ds-card {
            padding: 14px !important;
            border-radius: 12px !important;
          }
        }

        [data-viewport="h5"] .ds-grid-4,
        [data-viewport="h5"] .ds-grid-3 {
          grid-template-columns: 1fr !important;
        }
        [data-viewport="h5"] .ds-card {
          padding: 14px !important;
          border-radius: 12px !important;
        }
      `}</style>

      {/* Top Main Navigation Header */}
      <header 
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 40,
          borderBottom: '1px solid var(--ln-hairline)',
          backdropFilter: 'blur(12px)',
          background: isDark ? 'rgba(18, 20, 24, 0.88)' : 'rgba(255, 255, 255, 0.88)',
          transition: 'background-color 0.2s'
        }}
      >
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: isH5 ? '12px 16px' : '10px 24px', minHeight: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div 
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                color: '#FFFFFF',
                background: 'linear-gradient(135deg, #533AFD 0%, #6346FF 100%)',
                boxShadow: '0 4px 12px rgba(83, 58, 253, 0.3)',
                flexShrink: 0
              }}
            >
              V2
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <h1 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--ln-ink)', margin: 0, letterSpacing: '-0.01em' }}>
                  OneOS V2 全局定版设计规范与 UI 控件展厅
                </h1>
                <span style={{ padding: '2px 8px', borderRadius: '9999px', fontSize: '10px', fontWeight: 700, background: 'var(--ln-primary-soft)', color: '#533AFD', whiteSpace: 'nowrap' }}>
                  v2.3 H5响应式增补版
                </span>
              </div>
              <p style={{ fontSize: '11px', color: 'var(--ln-muted)', margin: '2px 0 0 0' }}>
                Stripe Violet `#533AFD` 紫光高规 B2B SaaS | PC 全宽 & H5 移动端 App 嵌入双宽度支持
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            {/* Viewport Simulator Switcher */}
            <div style={{ display: 'flex', alignItems: 'center', padding: '3px', borderRadius: '10px', border: '1px solid var(--ln-hairline)', background: 'var(--ln-surface-pearl)', gap: '2px' }}>
              <button
                onClick={() => setViewportMode('pc')}
                style={{
                  padding: '5px 10px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: viewportMode === 'pc' ? 700 : 500,
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  background: viewportMode === 'pc' ? 'var(--ln-surface-card)' : 'transparent',
                  color: viewportMode === 'pc' ? '#533AFD' : 'var(--ln-body)',
                  boxShadow: viewportMode === 'pc' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                }}
              >
                <Monitor style={{ width: '13px', height: '13px' }} />
                PC 全宽
              </button>
              <button
                onClick={() => setViewportMode('h5_375')}
                style={{
                  padding: '5px 10px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: viewportMode === 'h5_375' ? 700 : 500,
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  background: viewportMode === 'h5_375' ? '#533AFD' : 'transparent',
                  color: viewportMode === 'h5_375' ? '#FFFFFF' : 'var(--ln-body)',
                  boxShadow: viewportMode === 'h5_375' ? '0 1px 3px rgba(83, 58, 253, 0.3)' : 'none'
                }}
              >
                <Smartphone style={{ width: '13px', height: '13px' }} />
                H5 📱 (375px)
              </button>
              <button
                onClick={() => setViewportMode('h5_390')}
                style={{
                  padding: '5px 10px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: viewportMode === 'h5_390' ? 700 : 500,
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  background: viewportMode === 'h5_390' ? '#533AFD' : 'transparent',
                  color: viewportMode === 'h5_390' ? '#FFFFFF' : 'var(--ln-body)',
                  boxShadow: viewportMode === 'h5_390' ? '0 1px 3px rgba(83, 58, 253, 0.3)' : 'none'
                }}
              >
                <Smartphone style={{ width: '13px', height: '13px' }} />
                H5 📱 (390px)
              </button>
            </div>

            {/* Master Mode Switcher Tabs */}
            <div style={{ display: 'flex', alignItems: 'center', padding: '4px', borderRadius: '12px', border: '1px solid var(--ln-hairline)', background: 'var(--ln-surface-pearl)' }}>
              <button
                onClick={() => setTopTab('showcase')}
                style={{
                  padding: '6px 14px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: topTab === 'showcase' ? 700 : 500,
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: topTab === 'showcase' ? 'var(--ln-surface-card)' : 'transparent',
                  color: topTab === 'showcase' ? '#533AFD' : 'var(--ln-body)',
                  boxShadow: topTab === 'showcase' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                }}
              >
                <Sparkles style={{ width: '14px', height: '14px' }} />
                全量控件展厅
              </button>
              <button
                onClick={() => setTopTab('master_page')}
                style={{
                  padding: '6px 14px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: topTab === 'master_page' ? 700 : 500,
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: topTab === 'master_page' ? 'var(--ln-surface-card)' : 'transparent',
                  color: topTab === 'master_page' ? '#533AFD' : 'var(--ln-body)',
                  boxShadow: topTab === 'master_page' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                }}
              >
                <Layers style={{ width: '14px', height: '14px' }} />
                PC 母版: 租赁合同
              </button>
              <button
                onClick={() => setTopTab('form_page')}
                style={{
                  padding: '6px 14px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: topTab === 'form_page' ? 700 : 500,
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: topTab === 'form_page' ? 'var(--ln-surface-card)' : 'transparent',
                  color: topTab === 'form_page' ? '#533AFD' : 'var(--ln-body)',
                  boxShadow: topTab === 'form_page' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                }}
              >
                <FileText style={{ width: '14px', height: '14px' }} />
                PC 表单母版
              </button>
              <button
                onClick={() => setTopTab('h5_vehicle')}
                style={{
                  padding: '6px 14px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: topTab === 'h5_vehicle' ? 700 : 500,
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: topTab === 'h5_vehicle' ? 'var(--oneos-primary, #533AFD)' : 'transparent',
                  color: topTab === 'h5_vehicle' ? (topTab === 'h5_vehicle' ? '#FFFFFF' : '#533AFD') : 'var(--ln-body)',
                  boxShadow: topTab === 'h5_vehicle' ? '0 2px 8px rgba(83, 58, 253, 0.25)' : 'none'
                }}
              >
                <Smartphone style={{ width: '14px', height: '14px' }} />
                📱 H5 车辆资产设计稿
              </button>
            </div>

            {/* Dark Mode Toggle */}
            <button
              onClick={() => setIsDark(!isDark)}
              style={{
                padding: '7px 14px',
                borderRadius: '12px',
                border: '1px solid var(--ln-hairline)',
                background: 'var(--ln-surface-card)',
                color: 'var(--ln-ink)',
                fontSize: '12px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer'
              }}
              title="切换浅色/暗色模式"
            >
              {isDark ? (
                <>
                  <Moon style={{ width: '14px', height: '14px', color: '#FBBF24' }} />
                  <span>暗色</span>
                </>
              ) : (
                <>
                  <Sun style={{ width: '14px', height: '14px', color: '#F59E0B' }} />
                  <span>浅色</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Conditional Rendering for topTab */}
      {topTab === 'master_page' ? (
        <div style={{ padding: '16px' }}>
          <LeaseContractHub />
        </div>
      ) : topTab === 'form_page' ? (
        <div>
          <div
            style={{
              margin: '12px 16px 0',
              padding: '10px 14px',
              borderRadius: '10px',
              border: '1px solid var(--ln-hairline)',
              background: 'var(--ln-surface-pearl)',
              fontSize: '12px',
              lineHeight: 1.55,
              color: 'var(--ln-body)',
            }}
          >
            <strong style={{ color: 'var(--ln-ink)' }}>表单双布局（§4.9）</strong>
            ：本页演示为 <strong>方案 A · 侧栏工作台</strong>（左主表单 + 右 340px）。
            无右栏、需横向空间时用 <strong>方案 B · 横向整屏 B1</strong>（主区 width 100% + PC 边距 20–24px，非贴边）。
            生成前须声明 <code>layout: sidebar | fullBleed</code>。
          </div>
          <FaultDispositionForm isDark={isDark} />
        </div>
      ) : topTab === 'h5_vehicle' ? (
        <H5VehicleAssetsApp />
      ) : isH5 ? (
        /* Render Mobile Simulator Viewport */
        <div style={{ padding: '24px 0', background: 'var(--ln-canvas-parchment)' }}>
          <div
            style={{
              width: viewportMode === 'h5_375' ? '375px' : '390px',
              margin: '0 auto',
              borderRadius: '36px',
              border: '12px solid #1E222D',
              boxShadow: '0 25px 60px rgba(0,0,0,0.35)',
              background: 'var(--ln-surface-card)',
              overflow: 'hidden',
              position: 'relative'
            }}
          >
            {/* Phone Status Bar Mockup */}
            <div style={{ height: '36px', background: 'var(--ln-surface-pearl)', borderBottom: '1px solid var(--ln-hairline)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', fontSize: '12px', fontWeight: 800, color: 'var(--ln-ink)' }}>
              <span>09:41</span>
              <div style={{ width: '80px', height: '18px', borderRadius: '12px', background: '#000000', margin: '0 auto' }} />
              <span style={{ fontSize: '10px' }}>5G 100%</span>
            </div>

            {/* H5 Page Content Inside Phone Container */}
            {showcaseContent}

            {/* Phone Home Indicator Bar Mockup */}
            <div style={{ height: '24px', background: 'var(--ln-surface-pearl)', borderTop: '1px solid var(--ln-hairline)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: '134px', height: '4px', borderRadius: '9999px', background: 'var(--ln-ink)', opacity: 0.4 }} />
            </div>
          </div>
        </div>
      ) : (
        /* PC Full Width Showcase Content */
        showcaseContent
      )}
    </div>
  );
};

export default DesignSystemShowcase;
