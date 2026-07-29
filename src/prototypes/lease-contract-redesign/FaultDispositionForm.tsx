import React, { useState } from 'react';
import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Clock,
  FileCheck,
  MapPin,
  Save,
  Send,
  Truck,
  User,
  Wrench,
} from 'lucide-react';
import {
  V2CheckboxGroup,
  V2Button,
  V2ImageUpload,
  type V2ImageUploadItem,
} from '../../resources/design-system/components/UIComponents';
import '../../resources/design-system/oneos-ds-tokens.css';

type FaultLevel = '特急' | '紧急' | '一般' | '提示';

const LEVELS: FaultLevel[] = ['特急', '紧急', '一般', '提示'];

const NOTIFY_OPTIONS = [
  { value: 'sms', label: '短信提醒车队调度员' },
  { value: 'email', label: '邮件抄送合规安全审计组' },
];

const DEMO_VOUCHERS: V2ImageUploadItem[] = [
  {
    id: 'demo-1',
    name: 'fcu_sensor_leak_before.jpg',
    url: 'data:image/svg+xml,' + encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" width="240" height="240"><rect fill="#E0E7FF" width="240" height="240"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#533AFD" font-size="14" font-family="sans-serif">处置前</text></svg>',
    ),
    size: 1.2 * 1024 * 1024,
  },
  {
    id: 'demo-2',
    name: 'fcu_pressure_ok_after.jpg',
    url: 'data:image/svg+xml,' + encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" width="240" height="240"><rect fill="#DCFCE7" width="240" height="240"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#10B981" font-size="14" font-family="sans-serif">处置后</text></svg>',
    ),
    size: 850 * 1024,
  },
];

/**
 * OneOS V2 定稿表单页母版：结构化工单填报
 * 入口：`/prototypes/lease-contract-redesign?concept=form`
 * 亦挂载于 oneos-v2 展厅「PC 表单母版」
 */
export function FaultDispositionForm({ isDark }: { isDark: boolean }) {
  const [formData, setFormData] = useState({
    code: 'GZ-20250722-003',
    plateNo: '浙AFC891',
    vehicleModel: '羚牛氢能重卡 49T (重卡示范版)',
    region: '华东·嘉兴物流园区',
    chatSummary:
      '驾驶员反映车辆行驶过程中 FCU 氢堆出现 2 级压力异常警报，功率受限 30%。',
    faultTime: '2025-07-22 14:15:00',
    location: 'G15 沈海高速嘉兴服务区',
    part: '氢燃料电池系统 (FCU 堆栈水路)',
    level: '紧急' as FaultLevel,
    assignee: '刘洋 (高级运维工程师)',
    result:
      '现场检测水路传感器接口松动并微漏，已重新紧固接口、更换 O 型密封圈并完成系统压力复位测试，恢复满功率输出。',
    remark: '建议在下一次定检（8 月 15 日）对同批次重卡水路管线固件进行预防性抽查。',
    notifyChannels: ['sms', 'email'] as string[],
  });

  const [submitted, setSubmitted] = useState(false);
  const [vouchers, setVouchers] = useState<V2ImageUploadItem[]>(DEMO_VOUCHERS);

  const accent = 'var(--oneos-primary, var(--ln-primary, #533AFD))';
  const accentLight = isDark ? 'rgba(83, 58, 253, 0.18)' : '#E0E7FF';
  const surface = 'var(--ln-surface-card, #FFFFFF)';
  const border = 'var(--ln-hairline, #E3E8EE)';
  const textPrimary = 'var(--ln-ink, #0A2540)';
  const textSecondary = 'var(--ln-body, #425466)';
  const inputBg = 'var(--ln-surface-pearl, #F8FAFC)';
  const canvas = 'var(--ln-canvas-parchment, #F6F9FC)';

  const fieldBase: React.CSSProperties = {
    background: inputBg,
    border: `1px solid ${border}`,
    borderRadius: 8,
    padding: '8px 12px',
    fontSize: 13,
    color: textPrimary,
    width: '100%',
    outline: 'none',
    boxSizing: 'border-box',
    minHeight: 36,
    fontFamily: 'inherit',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 12,
    color: textSecondary,
    fontWeight: 600,
    display: 'block',
    marginBottom: 6,
  };

  const cardStyle: React.CSSProperties = {
    background: surface,
    border: `1px solid ${border}`,
    borderRadius: 12,
    padding: '20px 24px',
    boxShadow: isDark ? 'none' : '0 2px 6px rgba(0,0,0,0.02)',
    boxSizing: 'border-box',
  };

  return (
    <div
      data-ds-mode={isDark ? 'dark' : 'light'}
      data-oneos-theme={isDark ? 'dark' : 'light'}
      data-annotation-id="fault-disposition-form"
      style={{
        background: canvas,
        color: textPrimary,
        minHeight: '100vh',
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "PingFang SC", "Microsoft YaHei", sans-serif',
        padding: '24px 36px',
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box',
      }}
    >
      {/* 页头：返回 + 标题/单号 + 主操作 */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 20,
          gap: 16,
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
          <V2Button variant="back" size="md">
            返回故障列表
          </V2Button>
          <div style={{ height: 16, width: 1, background: border, flexShrink: 0 }} />
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                flexWrap: 'wrap',
              }}
            >
              <h1
                style={{
                  fontSize: 20,
                  fontWeight: 800,
                  margin: 0,
                  color: textPrimary,
                  lineHeight: 1.3,
                }}
              >
                车辆故障处置工单填报
              </h1>
              <span
                style={{
                  fontSize: 11,
                  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                  fontWeight: 700,
                  color: accent,
                  background: accentLight,
                  padding: '2px 8px',
                  borderRadius: 4,
                }}
              >
                {formData.code}
              </span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
          <V2Button variant="secondary" size="md" icon={<Save size={15} aria-hidden />}>
            暂存草稿
          </V2Button>
          <V2Button
            variant="primary"
            size="md"
            icon={<Send size={15} aria-hidden />}
            onClick={() => setSubmitted(true)}
          >
            {submitted ? '已提交归档' : '提交处置结果'}
          </V2Button>
        </div>
      </div>

      {submitted && (
        <div
          role="status"
          style={{
            background: isDark ? 'rgba(16, 185, 129, 0.15)' : '#DCFCE7',
            border: `1px solid ${isDark ? 'rgba(16, 185, 129, 0.3)' : '#86EFAC'}`,
            borderRadius: 10,
            padding: '12px 16px',
            marginBottom: 20,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            color: isDark ? '#34D399' : '#15803D',
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          <CheckCircle2 size={18} aria-hidden />{' '}
          故障处置单已成功提交！状态已更新为「已处理归档」，同步抄送关联责任人。
        </div>
      )}

      {/* 主区：左结构化表单 + 右 340px 侧栏 */}
      <div
        className="v2-form-page-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) 340px',
          gap: 20,
          alignItems: 'start',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, minWidth: 0 }}>
          {/* 1. 报修车辆与现场环境 */}
          <section style={cardStyle}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 16,
                gap: 12,
                flexWrap: 'wrap',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Truck size={18} style={{ color: accent }} aria-hidden />
                <h2 style={{ fontSize: 15, fontWeight: 700, margin: 0, color: textPrimary }}>
                  1. 报修车辆与现场环境
                </h2>
              </div>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  background: isDark ? 'rgba(239, 68, 68, 0.18)' : '#FEE2E2',
                  color: '#EF4444',
                  padding: '2px 8px',
                  borderRadius: 12,
                }}
              >
                优先级：{formData.level}
              </span>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                gap: 16,
              }}
            >
              <div>
                <span style={{ ...labelStyle, fontWeight: 500 }}>报修车牌号</span>
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: textPrimary,
                    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {formData.plateNo}
                </div>
              </div>
              <div>
                <span style={{ ...labelStyle, fontWeight: 500 }}>车辆品牌车型</span>
                <div style={{ fontSize: 13, fontWeight: 600, color: textPrimary }}>
                  {formData.vehicleModel}
                </div>
              </div>
              <div>
                <span style={{ ...labelStyle, fontWeight: 500 }}>归属运营区域</span>
                <div style={{ fontSize: 13, fontWeight: 600, color: textPrimary }}>
                  {formData.region}
                </div>
              </div>
            </div>

            {/* AI 语音摘要：预警琥珀底 */}
            <div
              style={{
                marginTop: 16,
                padding: '12px 14px',
                background: isDark ? 'rgba(217, 119, 6, 0.12)' : '#FFFBEB',
                border: `1px solid ${isDark ? 'rgba(217, 119, 6, 0.35)' : '#FDE68A'}`,
                borderRadius: 8,
                fontSize: 12,
                color: textSecondary,
                display: 'flex',
                gap: 10,
                alignItems: 'flex-start',
              }}
            >
              <AlertTriangle
                size={16}
                style={{ color: '#D97706', flexShrink: 0, marginTop: 2 }}
                aria-hidden
              />
              <div>
                <span
                  style={{
                    fontWeight: 700,
                    color: textPrimary,
                    display: 'block',
                    marginBottom: 2,
                  }}
                >
                  司机 AI 语音上报记录摘要：
                </span>
                {formData.chatSummary}
              </div>
            </div>
          </section>

          {/* 2. 故障诊断与判定录入 */}
          <section style={cardStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <Wrench size={18} style={{ color: accent }} aria-hidden />
              <h2 style={{ fontSize: 15, fontWeight: 700, margin: 0, color: textPrimary }}>
                2. 故障诊断与判定录入
              </h2>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                gap: 16,
              }}
            >
              <div>
                <label style={labelStyle}>
                  故障发生时间 <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    ...fieldBase,
                  }}
                >
                  <Calendar size={14} style={{ color: textSecondary, flexShrink: 0 }} aria-hidden />
                  <input
                    type="text"
                    value={formData.faultTime}
                    onChange={(e) => setFormData({ ...formData, faultTime: e.target.value })}
                    aria-label="故障发生时间"
                    style={{
                      background: 'transparent',
                      border: 'none',
                      outline: 'none',
                      fontSize: 13,
                      color: textPrimary,
                      width: '100%',
                      fontVariantNumeric: 'tabular-nums',
                      fontFamily: 'inherit',
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={labelStyle}>
                  故障发生具体地点 <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    ...fieldBase,
                  }}
                >
                  <MapPin size={14} style={{ color: textSecondary, flexShrink: 0 }} aria-hidden />
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    aria-label="故障发生具体地点"
                    style={{
                      background: 'transparent',
                      border: 'none',
                      outline: 'none',
                      fontSize: 13,
                      color: textPrimary,
                      width: '100%',
                      fontFamily: 'inherit',
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={labelStyle}>
                  故障系统/部位 <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <input
                  type="text"
                  value={formData.part}
                  onChange={(e) => setFormData({ ...formData, part: e.target.value })}
                  aria-label="故障系统/部位"
                  style={fieldBase}
                />
              </div>

              <div>
                <label style={labelStyle}>
                  故障严重等级 <span style={{ color: '#EF4444' }}>*</span>
                </label>
                {/* 定稿：离散四档按钮组（非顶栏 V2SegmentedControl） */}
                <div
                  role="radiogroup"
                  aria-label="故障严重等级"
                  style={{ display: 'flex', gap: 8 }}
                >
                  {LEVELS.map((lvl) => {
                    const active = formData.level === lvl;
                    return (
                      <button
                        key={lvl}
                        type="button"
                        role="radio"
                        aria-checked={active}
                        onClick={() => setFormData({ ...formData, level: lvl })}
                        style={{
                          flex: 1,
                          padding: '7px 4px',
                          borderRadius: 6,
                          fontSize: 12,
                          fontWeight: 600,
                          cursor: 'pointer',
                          minHeight: 36,
                          border: active ? `1px solid ${accent}` : `1px solid ${border}`,
                          background: active ? accentLight : inputBg,
                          color: active ? accent : textSecondary,
                        }}
                      >
                        {lvl}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>

          {/* 3. 处置结果与凭证 */}
          <section style={cardStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <FileCheck size={18} style={{ color: accent }} aria-hidden />
              <h2 style={{ fontSize: 15, fontWeight: 700, margin: 0, color: textPrimary }}>
                3. 处置结果说明与凭证附记录入
              </h2>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={labelStyle}>
                  处置结果与维修措施 <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <textarea
                  rows={3}
                  value={formData.result}
                  onChange={(e) => setFormData({ ...formData, result: e.target.value })}
                  aria-label="处置结果与维修措施"
                  style={{
                    ...fieldBase,
                    resize: 'vertical',
                    minHeight: 72,
                    lineHeight: 1.5,
                  }}
                />
              </div>

              <div>
                <label style={labelStyle}>后续预防与跟踪建议</label>
                <input
                  type="text"
                  value={formData.remark}
                  onChange={(e) => setFormData({ ...formData, remark: e.target.value })}
                  aria-label="后续预防与跟踪建议"
                  style={fieldBase}
                />
              </div>

              <div>
                <label style={labelStyle}>处置现场照片 / 维修单据凭证</label>
                <V2ImageUpload
                  value={vouchers}
                  onChange={setVouchers}
                  maxCount={6}
                  maxSizeMB={10}
                  title="点击或拖拽上传维修工单照片、替换件发票"
                  hint="支持 JPG/PNG，单张 ≤10MB，最多 6 张（H5 可用拍照 / 相册）"
                />
              </div>
            </div>
          </section>
        </div>

        {/* 右侧栏 */}
        <aside style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <section style={{ ...cardStyle, padding: 20 }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, margin: '0 0 12px 0', color: textPrimary }}>
              指派处理人与责任组
            </h3>

            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 11, color: textSecondary, display: 'block', marginBottom: 4 }}>
                主处理责任人
              </label>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  background: inputBg,
                  border: `1px solid ${border}`,
                  borderRadius: 8,
                  padding: '8px 12px',
                  minHeight: 36,
                }}
              >
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    background: accentLight,
                    color: accent,
                    padding: '4px 10px',
                    borderRadius: 6,
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                >
                  <User size={14} aria-hidden />
                  {formData.assignee}
                </span>
              </div>
            </div>

            <div>
              <label style={{ fontSize: 11, color: textSecondary, display: 'block', marginBottom: 4 }}>
                自动通知抄送通道
              </label>
              <V2CheckboxGroup
                options={NOTIFY_OPTIONS}
                value={formData.notifyChannels}
                onChange={(val) => setFormData({ ...formData, notifyChannels: val })}
                style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 4 }}
              />
            </div>
          </section>

          <section
            style={{
              background: isDark ? 'rgba(83, 58, 253, 0.1)' : '#E0E7FF',
              border: `1px solid ${isDark ? 'rgba(83, 58, 253, 0.25)' : '#C7D2FE'}`,
              borderRadius: 12,
              padding: 16,
              boxSizing: 'border-box',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                color: accent,
                fontWeight: 700,
                fontSize: 13,
                marginBottom: 6,
              }}
            >
              <Clock size={16} aria-hidden /> 响应 SLA 控制计时
            </div>
            <p style={{ margin: 0, fontSize: 12, color: textSecondary, lineHeight: 1.5 }}>
              紧急级别工单要求 <strong style={{ color: textPrimary }}>2 小时内</strong>{' '}
              完成现场响应并填报处置记录。当前处理用时：
              <span style={{ fontVariantNumeric: 'tabular-nums' }}>42</span> 分钟，履约准时率{' '}
              <span style={{ fontVariantNumeric: 'tabular-nums' }}>100%</span>。
            </p>
          </section>
        </aside>
      </div>

      <style>{`
        @media (max-width: 1023px) {
          .v2-form-page-grid {
            grid-template-columns: 1fr !important;
          }
        }
        @media (max-width: 767px) {
          [data-annotation-id="fault-disposition-form"] {
            padding: 16px !important;
          }
          [data-annotation-id="fault-disposition-form"] input,
          [data-annotation-id="fault-disposition-form"] textarea,
          [data-annotation-id="fault-disposition-form"] button {
            min-height: 44px !important;
            font-size: 14px !important;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          [data-annotation-id="fault-disposition-form"] * {
            transition: none !important;
          }
        }
      `}</style>
    </div>
  );
}
