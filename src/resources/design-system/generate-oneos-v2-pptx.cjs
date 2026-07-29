/**
 * OneOS V2 设计规范简介 — PPT generator
 * Run: node generate-oneos-v2-pptx.js  (needs pptxgenjs on NODE_PATH or cwd)
 */
const PptxGenJS = require("pptxgenjs");
const path = require("path");

const OUT = path.join(__dirname, "OneOS-V2-设计规范简介.pptx");

// OneOS V2 Stripe Violet palette
const C = {
  primary: "533AFD",
  primaryHover: "6346FF",
  primaryFocus: "4226E8",
  soft: "E0E7FF",
  canvas: "F6F9FC",
  card: "FFFFFF",
  pearl: "F8FAFC",
  strong: "F1F5F9",
  hairline: "E3E8EE",
  ink: "0A2540",
  body: "425466",
  muted: "627D98",
  success: "10B981",
  successSoft: "DCFCE7",
  warning: "D97706",
  warningSoft: "FEF3C7",
  error: "EF4444",
  errorSoft: "FEE2E2",
  info: "3B82F6",
  infoSoft: "DBEAFE",
  darkCanvas: "0A0B0D",
  darkCard: "121418",
  darkInk: "F7FAFC",
  darkBody: "A0AEC0",
  white: "FFFFFF",
};

function shadow() {
  return { type: "outer", color: "0A2540", blur: 12, offset: 3, opacity: 0.08 };
}

function addFooter(slide, page, total) {
  slide.addText("OneOS V2 Design System  ·  v2.6", {
    x: 0.5,
    y: 5.28,
    w: 7.5,
    h: 0.28,
    fontSize: 10,
    fontFace: "Arial",
    color: C.muted,
    margin: 0,
  });
  slide.addText(`${page} / ${total}`, {
    x: 8.5,
    y: 5.28,
    w: 1.0,
    h: 0.28,
    fontSize: 10,
    fontFace: "Arial",
    color: C.muted,
    align: "right",
    margin: 0,
  });
}

function sectionTitle(slide, title, subtitle) {
  slide.addText(title, {
    x: 0.5,
    y: 0.32,
    w: 9.0,
    h: 0.48,
    fontSize: 28,
    fontFace: "Arial",
    bold: true,
    color: C.ink,
    margin: 0,
  });
  if (subtitle) {
    slide.addText(subtitle, {
      x: 0.5,
      y: 0.82,
      w: 9.0,
      h: 0.32,
      fontSize: 13,
      fontFace: "Arial",
      color: C.body,
      margin: 0,
    });
  }
}

function card(slide, x, y, w, h, opts = {}) {
  slide.addShape(slide._slideLayout ? undefined : undefined); // noop guard
  slide.addShape("roundRect", {
    x,
    y,
    w,
    h,
    fill: { color: opts.fill || C.card },
    shadow: opts.noShadow ? undefined : shadow(),
    rectRadius: 0.12,
  });
}

async function main() {
  const pres = new PptxGenJS();
  pres.layout = "LAYOUT_16x9";
  pres.author = "OneOS Product";
  pres.title = "OneOS V2 设计规范简介";
  pres.subject = "Stripe Fintech UI + Linear 扁平微结构";

  const TOTAL = 14;
  let page = 0;

  // ─── 1. Cover ───
  page++;
  {
    const s = pres.addSlide();
    s.addShape("rect", { x: 0, y: 0, w: 10, h: 5.625, fill: { color: C.darkCanvas } });
    s.addShape("roundRect", {
      x: 0.5,
      y: 1.55,
      w: 0.55,
      h: 0.55,
      fill: { color: C.primary },
      rectRadius: 0.12,
    });
    s.addText("V2", {
      x: 0.5,
      y: 1.62,
      w: 0.55,
      h: 0.4,
      fontSize: 16,
      fontFace: "Arial",
      bold: true,
      color: C.white,
      align: "center",
      margin: 0,
    });
    s.addText("OneOS V2", {
      x: 1.25,
      y: 1.5,
      w: 8,
      h: 0.55,
      fontSize: 40,
      fontFace: "Arial",
      bold: true,
      color: C.darkInk,
      margin: 0,
    });
    s.addText("全局定版设计规范简介", {
      x: 1.25,
      y: 2.1,
      w: 8,
      h: 0.4,
      fontSize: 22,
      fontFace: "Arial",
      color: C.darkBody,
      margin: 0,
    });
    s.addText(
      "Stripe Fintech UI（紫光高规）  ·  Linear 扁平微结构  ·  PC / H5 双形态  ·  三视角台账",
      {
        x: 1.25,
        y: 2.65,
        w: 8,
        h: 0.35,
        fontSize: 13,
        fontFace: "Arial",
        color: C.muted,
        margin: 0,
      }
    );
    // accent pills
    const pills = [
      { t: "主色 #533AFD", c: C.primary },
      { t: "文档 v2.6", c: "16181F" },
      { t: "2026-07", c: "16181F" },
    ];
    pills.forEach((p, i) => {
      const x = 1.25 + i * 1.85;
      s.addShape("roundRect", {
        x,
        y: 3.35,
        w: 1.7,
        h: 0.36,
        fill: { color: p.c },
        rectRadius: 0.18,
      });
      s.addText(p.t, {
        x,
        y: 3.38,
        w: 1.7,
        h: 0.3,
        fontSize: 11,
        fontFace: "Arial",
        bold: true,
        color: C.white,
        align: "center",
        margin: 0,
      });
    });
    s.addText("面向产品 / 设计 / 研发的统一落地标准", {
      x: 1.25,
      y: 4.6,
      w: 7,
      h: 0.3,
      fontSize: 12,
      fontFace: "Arial",
      color: C.darkBody,
      margin: 0,
    });
  }

  // ─── 2. Agenda ───
  page++;
  {
    const s = pres.addSlide();
    s.addShape("rect", { x: 0, y: 0, w: 10, h: 5.625, fill: { color: C.canvas } });
    sectionTitle(s, "目录", "这份简介覆盖规范的核心骨架与强制约束");
    const items = [
      { n: "01", t: "设计原则", d: "紫光质感 · 双形态 · 三视角 · 语义态" },
      { n: "02", t: "Design Tokens", d: "色彩 / 字体 / 间距 / 栅格" },
      { n: "03", t: "组件体系", d: "V2Button 与全量封装控件" },
      { n: "04", t: "三视角架构", d: "列表 · 看板 · 主从表单" },
      { n: "05", t: "台账与页头", d: "KPI / 筛选连体 / 详情页头" },
      { n: "06", t: "H5 与主题", d: "触控 · Bottom Sheet · 若依主题" },
    ];
    items.forEach((it, i) => {
      const col = i % 3;
      const row = Math.floor(i / 3);
      const x = 0.5 + col * 3.1;
      const y = 1.35 + row * 1.7;
      s.addShape("roundRect", {
        x,
        y,
        w: 2.9,
        h: 1.45,
        fill: { color: C.card },
        shadow: shadow(),
        rectRadius: 0.12,
      });
      s.addText(it.n, {
        x: x + 0.2,
        y: y + 0.25,
        w: 2.5,
        h: 0.35,
        fontSize: 20,
        fontFace: "Arial",
        bold: true,
        color: C.primary,
        margin: 0,
      });
      s.addText(it.t, {
        x: x + 0.2,
        y: y + 0.65,
        w: 2.5,
        h: 0.3,
        fontSize: 16,
        fontFace: "Arial",
        bold: true,
        color: C.ink,
        margin: 0,
      });
      s.addText(it.d, {
        x: x + 0.2,
        y: y + 0.98,
        w: 2.5,
        h: 0.28,
        fontSize: 11,
        fontFace: "Arial",
        color: C.body,
        margin: 0,
      });
    });
    addFooter(s, page, TOTAL);
  }

  // ─── 3. Principles ───
  page++;
  {
    const s = pres.addSlide();
    s.addShape("rect", { x: 0, y: 0, w: 10, h: 5.625, fill: { color: C.canvas } });
    sectionTitle(s, "六条设计原则", "所有 V2 原型与迁移页必须对齐");
    const principles = [
      { t: "Stripe Violet 紫光高规", d: "主色 #533AFD，微边框、无重阴影，沉浸式卡片容器" },
      { t: "PC / H5 100% 响应式", d: "≥1024 PC · ≤767 H5；触控 ≥44px；Bottom Sheet + 吸底条" },
      { t: "三视角原生统一", d: "列表台账 · Pipeline 看板 · 主从工作台，同页切换" },
      { t: "数据高可读", d: "金额 / VIN / 日期用 tabular-nums 等宽数字" },
      { t: "状态语义明确", d: "成功绿 · 预警橙 · 危险红 · 信息蓝 · 次要灰" },
      { t: "无缝双色适配", d: "Light / Dark 全量映射；禁止外壳深内容浅" },
    ];
    principles.forEach((p, i) => {
      const y = 1.2 + i * 0.62;
      s.addShape("roundRect", {
        x: 0.5,
        y,
        w: 9.0,
        h: 0.55,
        fill: { color: C.card },
        shadow: shadow(),
        rectRadius: 0.1,
      });
      s.addShape("roundRect", {
        x: 0.65,
        y: y + 0.12,
        w: 0.32,
        h: 0.32,
        fill: { color: C.soft },
        rectRadius: 0.08,
      });
      s.addText(String(i + 1), {
        x: 0.65,
        y: y + 0.14,
        w: 0.32,
        h: 0.28,
        fontSize: 12,
        fontFace: "Arial",
        bold: true,
        color: C.primary,
        align: "center",
        margin: 0,
      });
      s.addText(p.t, {
        x: 1.15,
        y: y + 0.08,
        w: 3.2,
        h: 0.38,
        fontSize: 14,
        fontFace: "Arial",
        bold: true,
        color: C.ink,
        valign: "middle",
        margin: 0,
      });
      s.addText(p.d, {
        x: 4.4,
        y: y + 0.08,
        w: 4.9,
        h: 0.38,
        fontSize: 12,
        fontFace: "Arial",
        color: C.body,
        valign: "middle",
        margin: 0,
      });
    });
    addFooter(s, page, TOTAL);
  }

  // ─── 4. Color tokens ───
  page++;
  {
    const s = pres.addSlide();
    s.addShape("rect", { x: 0, y: 0, w: 10, h: 5.625, fill: { color: C.canvas } });
    sectionTitle(s, "主色与表面 Token", "消费 var(--oneos-primary)，禁止硬编码主色");
    // Primary family
    const primaries = [
      { hex: C.primary, name: "Primary", note: "#533AFD" },
      { hex: C.primaryHover, name: "Hover", note: "#6346FF" },
      { hex: C.primaryFocus, name: "Focus", note: "#4226E8" },
      { hex: C.soft, name: "Soft", note: "#E0E7FF", dark: true },
    ];
    primaries.forEach((p, i) => {
      const x = 0.5 + i * 2.35;
      s.addShape("roundRect", {
        x,
        y: 1.25,
        w: 2.2,
        h: 1.55,
        fill: { color: C.card },
        shadow: shadow(),
        rectRadius: 0.12,
      });
      s.addShape("roundRect", {
        x: x + 0.15,
        y: 1.4,
        w: 1.9,
        h: 0.75,
        fill: { color: p.hex },
        rectRadius: 0.08,
      });
      s.addText(p.name, {
        x: x + 0.15,
        y: 2.25,
        w: 1.9,
        h: 0.25,
        fontSize: 13,
        fontFace: "Arial",
        bold: true,
        color: C.ink,
        margin: 0,
      });
      s.addText(p.note, {
        x: x + 0.15,
        y: 2.5,
        w: 1.9,
        h: 0.22,
        fontSize: 11,
        fontFace: "Courier New",
        color: C.body,
        margin: 0,
      });
    });
    // Surfaces
    const surfaces = [
      { hex: C.canvas, name: "Canvas", note: "#F6F9FC" },
      { hex: C.card, name: "Card", note: "#FFFFFF", border: true },
      { hex: C.pearl, name: "Pearl", note: "#F8FAFC", border: true },
      { hex: C.strong, name: "Strong", note: "#F1F5F9" },
      { hex: C.hairline, name: "Hairline", note: "#E3E8EE" },
    ];
    surfaces.forEach((p, i) => {
      const x = 0.5 + i * 1.85;
      s.addShape("roundRect", {
        x,
        y: 3.1,
        w: 1.75,
        h: 1.55,
        fill: { color: C.card },
        shadow: shadow(),
        rectRadius: 0.12,
      });
      s.addShape("roundRect", {
        x: x + 0.12,
        y: 3.25,
        w: 1.5,
        h: 0.7,
        fill: { color: p.hex },
        line: p.border ? { color: C.hairline, width: 1 } : undefined,
        rectRadius: 0.06,
      });
      s.addText(p.name, {
        x: x + 0.12,
        y: 4.05,
        w: 1.5,
        h: 0.22,
        fontSize: 12,
        fontFace: "Arial",
        bold: true,
        color: C.ink,
        margin: 0,
      });
      s.addText(p.note, {
        x: x + 0.12,
        y: 4.28,
        w: 1.5,
        h: 0.2,
        fontSize: 10,
        fontFace: "Courier New",
        color: C.body,
        margin: 0,
      });
    });
    addFooter(s, page, TOTAL);
  }

  // ─── 5. Semantic + ink ───
  page++;
  {
    const s = pres.addSlide();
    s.addShape("rect", { x: 0, y: 0, w: 10, h: 5.625, fill: { color: C.canvas } });
    sectionTitle(s, "语义色与正文层级", "状态 Pill / Badge 统一四色语义");
    const semantics = [
      { hex: C.success, soft: C.successSoft, name: "Success", use: "履约中 · 已支付 · 成功" },
      { hex: C.warning, soft: C.warningSoft, name: "Warning", use: "待审批 · 临期预警" },
      { hex: C.error, soft: C.errorSoft, name: "Error", use: "欠费 · 超期 · 驳回" },
      { hex: C.info, soft: C.infoSoft, name: "Info", use: "待提交 · 提示信息" },
    ];
    semantics.forEach((p, i) => {
      const x = 0.5 + i * 2.35;
      s.addShape("roundRect", {
        x,
        y: 1.25,
        w: 2.2,
        h: 2.0,
        fill: { color: C.card },
        shadow: shadow(),
        rectRadius: 0.12,
      });
      s.addShape("roundRect", {
        x: x + 0.2,
        y: 1.45,
        w: 1.8,
        h: 0.7,
        fill: { color: p.soft },
        rectRadius: 0.08,
      });
      s.addShape("ellipse", {
        x: x + 0.35,
        y: 1.62,
        w: 0.36,
        h: 0.36,
        fill: { color: p.hex },
      });
      s.addText(p.name, {
        x: x + 0.8,
        y: 1.65,
        w: 1.05,
        h: 0.3,
        fontSize: 13,
        fontFace: "Arial",
        bold: true,
        color: C.ink,
        margin: 0,
      });
      s.addText("#" + p.hex, {
        x: x + 0.2,
        y: 2.3,
        w: 1.8,
        h: 0.25,
        fontSize: 12,
        fontFace: "Courier New",
        color: C.body,
        margin: 0,
      });
      s.addText(p.use, {
        x: x + 0.2,
        y: 2.65,
        w: 1.8,
        h: 0.4,
        fontSize: 11,
        fontFace: "Arial",
        color: C.muted,
        margin: 0,
      });
    });
    // Text hierarchy
    const texts = [
      { c: C.ink, l: "Ink  #0A2540", d: "一级标题 · 强对比数字" },
      { c: C.body, l: "Body  #425466", d: "标准正文 · 表单 Label" },
      { c: C.muted, l: "Muted  #627D98", d: "次要描述 · Placeholder" },
    ];
    texts.forEach((t, i) => {
      const x = 0.5 + i * 3.1;
      s.addShape("roundRect", {
        x,
        y: 3.5,
        w: 2.95,
        h: 1.15,
        fill: { color: C.card },
        shadow: shadow(),
        rectRadius: 0.12,
      });
      s.addText(t.l, {
        x: x + 0.2,
        y: 3.7,
        w: 2.55,
        h: 0.35,
        fontSize: 15,
        fontFace: "Arial",
        bold: true,
        color: t.c,
        margin: 0,
      });
      s.addText(t.d, {
        x: x + 0.2,
        y: 4.15,
        w: 2.55,
        h: 0.3,
        fontSize: 12,
        fontFace: "Arial",
        color: C.body,
        margin: 0,
      });
    });
    addFooter(s, page, TOTAL);
  }

  // ─── 6. Typography & spacing ───
  page++;
  {
    const s = pres.addSlide();
    s.addShape("rect", { x: 0, y: 0, w: 10, h: 5.625, fill: { color: C.canvas } });
    sectionTitle(s, "字体阶梯与圆角间距", "H5 正文字号 ≥14px；圆角分层清晰");
    // Type scale
    s.addShape("roundRect", {
      x: 0.5,
      y: 1.2,
      w: 4.5,
      h: 3.55,
      fill: { color: C.card },
      shadow: shadow(),
      rectRadius: 0.12,
    });
    s.addText("字号阶梯", {
      x: 0.7,
      y: 1.35,
      w: 4,
      h: 0.3,
      fontSize: 14,
      fontFace: "Arial",
      bold: true,
      color: C.primary,
      margin: 0,
    });
    const scales = [
      { s: "Display 24", d: "KPI 大数字 / 800" },
      { s: "Head-Lg 18", d: "页面大标题" },
      { s: "Head-Sm 16", d: "模块 / Modal 标题" },
      { s: "Subhead 14–15", d: "按钮 · 卡片副标" },
      { s: "Body 13–14", d: "正文 · 输入（H5≥14）" },
      { s: "Caption 11–12", d: "微标 · 时间戳" },
    ];
    scales.forEach((sc, i) => {
      const y = 1.75 + i * 0.45;
      s.addText(sc.s, {
        x: 0.7,
        y,
        w: 2.0,
        h: 0.35,
        fontSize: 13,
        fontFace: "Arial",
        bold: true,
        color: C.ink,
        margin: 0,
      });
      s.addText(sc.d, {
        x: 2.7,
        y,
        w: 2.0,
        h: 0.35,
        fontSize: 12,
        fontFace: "Arial",
        color: C.body,
        margin: 0,
      });
    });
    // Radius
    s.addShape("roundRect", {
      x: 5.2,
      y: 1.2,
      w: 4.3,
      h: 3.55,
      fill: { color: C.card },
      shadow: shadow(),
      rectRadius: 0.12,
    });
    s.addText("圆角与关键约束", {
      x: 5.4,
      y: 1.35,
      w: 3.9,
      h: 0.3,
      fontSize: 14,
      fontFace: "Arial",
      bold: true,
      color: C.primary,
      margin: 0,
    });
    const radii = [
      { t: "Tag / 小控件", v: "4px" },
      { t: "按钮 / 输入 / Select", v: "8px" },
      { t: "卡片 / Modal / 表格", v: "12px" },
      { t: "H5 Bottom Sheet", v: "20px 顶圆" },
      { t: "状态 Pill", v: "9999px" },
    ];
    radii.forEach((r, i) => {
      const y = 1.8 + i * 0.42;
      s.addText(r.t, {
        x: 5.4,
        y,
        w: 2.4,
        h: 0.32,
        fontSize: 13,
        fontFace: "Arial",
        color: C.ink,
        margin: 0,
      });
      s.addShape("roundRect", {
        x: 7.9,
        y: y + 0.02,
        w: 1.3,
        h: 0.28,
        fill: { color: C.soft },
        rectRadius: 0.14,
      });
      s.addText(r.v, {
        x: 7.9,
        y: y + 0.02,
        w: 1.3,
        h: 0.28,
        fontSize: 11,
        fontFace: "Arial",
        bold: true,
        color: C.primary,
        align: "center",
        valign: "middle",
        margin: 0,
      });
    });
    s.addText("车牌规范：浙A88888F（禁止中间 · 点）", {
      x: 5.4,
      y: 4.15,
      w: 3.9,
      h: 0.35,
      fontSize: 12,
      fontFace: "Arial",
      bold: true,
      color: C.ink,
      margin: 0,
    });
    addFooter(s, page, TOTAL);
  }

  // ─── 7. Components ───
  page++;
  {
    const s = pres.addSlide();
    s.addShape("rect", { x: 0, y: 0, w: 10, h: 5.625, fill: { color: C.canvas } });
    sectionTitle(s, "V2 组件库总览", "统一从 UIComponents.tsx 导入，禁止原生 select/date");
    const comps = [
      "V2Button",
      "V2Select",
      "V2DatePicker",
      "V2DateRangePicker",
      "V2SingleInputDateRangePicker",
      "V2TimePicker",
      "V2SingleInputTimeRangePicker",
      "V2RadioGroup",
      "V2CheckboxGroup",
      "V2Switch",
      "V2Steps",
      "V2Timeline",
      "V2ApprovalProgress",
      "V2Pagination",
      "V2Empty",
      "V2SegmentedControl",
      "V2StatusTabs",
      "V2ImageUpload",
      "V2MobileHeader",
      "V2MobileBottomNav",
      "V2MobileActionBar",
      "OperationActions",
    ];
    comps.forEach((name, i) => {
      const col = i % 4;
      const row = Math.floor(i / 4);
      const x = 0.5 + col * 2.35;
      const y = 1.25 + row * 0.58;
      s.addShape("roundRect", {
        x,
        y,
        w: 2.2,
        h: 0.48,
        fill: { color: C.card },
        shadow: shadow(),
        rectRadius: 0.08,
      });
      s.addText(name, {
        x: x + 0.1,
        y: y + 0.08,
        w: 2.0,
        h: 0.32,
        fontSize: 11,
        fontFace: "Courier New",
        bold: true,
        color: C.ink,
        align: "center",
        margin: 0,
      });
    });
    addFooter(s, page, TOTAL);
  }

  // ─── 8. Buttons ───
  page++;
  {
    const s = pres.addSlide();
    s.addShape("rect", { x: 0, y: 0, w: 10, h: 5.625, fill: { color: C.canvas } });
    sectionTitle(s, "按钮变体矩阵", "同一操作区仅允许 1 个 primary");
    const variants = [
      { name: "primary", fill: C.primary, color: C.white, use: "查询 / 提交 / 新建" },
      { name: "secondary", fill: C.card, color: C.ink, use: "暂存 / 导出", border: C.hairline },
      { name: "outline", fill: C.card, color: C.primary, use: "展开 / 筛选", border: C.primary },
      { name: "ghost", fill: C.card, color: C.body, use: "取消 / 返回", border: C.hairline },
      { name: "danger", fill: C.error, color: C.white, use: "删除 / 终止" },
      { name: "back", fill: C.card, color: C.body, use: "页头返回", border: C.hairline },
    ];
    variants.forEach((v, i) => {
      const col = i % 3;
      const row = Math.floor(i / 3);
      const x = 0.5 + col * 3.1;
      const y = 1.25 + row * 1.75;
      s.addShape("roundRect", {
        x,
        y,
        w: 2.95,
        h: 1.55,
        fill: { color: C.card },
        shadow: shadow(),
        rectRadius: 0.12,
      });
      s.addShape("roundRect", {
        x: x + 0.35,
        y: y + 0.3,
        w: 2.25,
        h: 0.45,
        fill: { color: v.fill },
        line: v.border ? { color: v.border, width: 1.25 } : undefined,
        rectRadius: 0.08,
      });
      s.addText(v.name, {
        x: x + 0.35,
        y: y + 0.35,
        w: 2.25,
        h: 0.35,
        fontSize: 13,
        fontFace: "Arial",
        bold: true,
        color: v.color,
        align: "center",
        margin: 0,
      });
      s.addText(v.use, {
        x: x + 0.2,
        y: y + 0.95,
        w: 2.55,
        h: 0.35,
        fontSize: 12,
        fontFace: "Arial",
        color: C.body,
        align: "center",
        margin: 0,
      });
    });
    addFooter(s, page, TOTAL);
  }

  // ─── 9. Three views ───
  page++;
  {
    const s = pres.addSlide();
    s.addShape("rect", { x: 0, y: 0, w: 10, h: 5.625, fill: { color: C.canvas } });
    sectionTitle(s, "三视角架构", "台账 / 审批 / 履约页必须提供或集成");
    const views = [
      {
        n: "1",
        t: "列表模式",
        d: "Bento KPI 大盘\nPill Tabs + 更多筛选\n嵌套车辆子表\n查询/重置后自动收起",
      },
      {
        n: "2",
        t: "看板模式",
        d: "4 阶段 Pipeline\n草稿 → 审批 → 履约 → 归档\n卡片快操推进\n可切入主从工作台",
      },
      {
        n: "3",
        t: "主从表单",
        d: "左 340px 任务列表\n右深度工作台\n结构化表单 + Tabs\n履约图谱与审批",
      },
    ];
    views.forEach((v, i) => {
      const x = 0.5 + i * 3.15;
      s.addShape("roundRect", {
        x,
        y: 1.25,
        w: 3.0,
        h: 3.5,
        fill: { color: C.card },
        shadow: shadow(),
        rectRadius: 0.12,
      });
      s.addShape("ellipse", {
        x: x + 1.1,
        y: 1.5,
        w: 0.7,
        h: 0.7,
        fill: { color: i === 0 ? C.primary : C.soft },
      });
      s.addText(v.n, {
        x: x + 1.1,
        y: 1.62,
        w: 0.7,
        h: 0.45,
        fontSize: 22,
        fontFace: "Arial",
        bold: true,
        color: i === 0 ? C.white : C.primary,
        align: "center",
        margin: 0,
      });
      s.addText(v.t, {
        x: x + 0.2,
        y: 2.4,
        w: 2.6,
        h: 0.4,
        fontSize: 18,
        fontFace: "Arial",
        bold: true,
        color: C.ink,
        align: "center",
        margin: 0,
      });
      s.addText(v.d, {
        x: x + 0.25,
        y: 2.95,
        w: 2.5,
        h: 1.5,
        fontSize: 13,
        fontFace: "Arial",
        color: C.body,
        align: "center",
        margin: 0,
      });
    });
    addFooter(s, page, TOTAL);
  }

  // ─── 10. Ledger patterns ───
  page++;
  {
    const s = pres.addSlide();
    s.addShape("rect", { x: 0, y: 0, w: 10, h: 5.625, fill: { color: C.canvas } });
    sectionTitle(s, "台账交互母版", "对齐车辆资产 / 租赁合同；筛选与表格连体");
    const blocks = [
      {
        t: "顶栏",
        d: "仅三视角切换 + 主操作\n禁止大标题说明卡片条",
      },
      {
        t: "KPI Bento",
        d: "4 列 · padding 18×20\n数字 24/800 tabular",
      },
      {
        t: "筛选工具条",
        d: "Pill Tabs + 搜索\n更多筛选默认收起\n查询后强制收起",
      },
      {
        t: "表格连体",
        d: "筛选面板与表格无缝拼接\n展开后表格下移恢复圆角",
      },
      {
        t: "操作列",
        d: "外侧最多 2 个常用\n低频与危险入 ⋮ 更多",
      },
      {
        t: "空态 / 分页",
        d: "统一 V2Empty\n统一 V2Pagination",
      },
    ];
    blocks.forEach((b, i) => {
      const col = i % 3;
      const row = Math.floor(i / 3);
      const x = 0.5 + col * 3.1;
      const y = 1.25 + row * 1.75;
      s.addShape("roundRect", {
        x,
        y,
        w: 2.95,
        h: 1.55,
        fill: { color: C.card },
        shadow: shadow(),
        rectRadius: 0.12,
      });
      s.addShape("roundRect", {
        x: x + 0.2,
        y: y + 0.22,
        w: 0.9,
        h: 0.32,
        fill: { color: C.soft },
        rectRadius: 0.16,
      });
      s.addText(b.t, {
        x: x + 0.2,
        y: y + 0.24,
        w: 0.9,
        h: 0.28,
        fontSize: 11,
        fontFace: "Arial",
        bold: true,
        color: C.primary,
        align: "center",
        margin: 0,
      });
      s.addText(b.d, {
        x: x + 0.2,
        y: y + 0.7,
        w: 2.55,
        h: 0.7,
        fontSize: 13,
        fontFace: "Arial",
        color: C.ink,
        margin: 0,
      });
    });
    addFooter(s, page, TOTAL);
  }

  // ─── 11. Form header ───
  page++;
  {
    const s = pres.addSlide();
    s.addShape("rect", { x: 0, y: 0, w: 10, h: 5.625, fill: { color: C.canvas } });
    sectionTitle(s, "详情 / 表单页头（强制）", "禁止白底描边整条卡片顶栏");
    // Mock header
    s.addShape("roundRect", {
      x: 0.5,
      y: 1.25,
      w: 9.0,
      h: 1.7,
      fill: { color: C.card },
      shadow: shadow(),
      rectRadius: 0.12,
    });
    s.addShape("roundRect", {
      x: 0.7,
      y: 1.45,
      w: 1.35,
      h: 0.38,
      fill: { color: C.card },
      line: { color: C.hairline, width: 1 },
      rectRadius: 0.08,
    });
    s.addText("← 返回列表", {
      x: 0.7,
      y: 1.48,
      w: 1.35,
      h: 0.32,
      fontSize: 11,
      fontFace: "Arial",
      color: C.body,
      align: "center",
      margin: 0,
    });
    s.addText("|", {
      x: 2.15,
      y: 1.48,
      w: 0.2,
      h: 0.32,
      fontSize: 14,
      color: C.hairline,
      margin: 0,
    });
    s.addText("故障处置  ·", {
      x: 2.4,
      y: 1.5,
      w: 1.4,
      h: 0.3,
      fontSize: 12,
      fontFace: "Arial",
      color: C.body,
      margin: 0,
    });
    s.addShape("roundRect", {
      x: 3.8,
      y: 1.48,
      w: 1.6,
      h: 0.32,
      fill: { color: C.soft },
      rectRadius: 0.16,
    });
    s.addText("FD-20260727-01", {
      x: 3.8,
      y: 1.5,
      w: 1.6,
      h: 0.28,
      fontSize: 11,
      fontFace: "Courier New",
      bold: true,
      color: C.primary,
      align: "center",
      margin: 0,
    });
    s.addShape("roundRect", {
      x: 6.85,
      y: 1.45,
      w: 1.1,
      h: 0.38,
      fill: { color: C.card },
      line: { color: C.hairline, width: 1 },
      rectRadius: 0.08,
    });
    s.addText("暂存", {
      x: 6.85,
      y: 1.48,
      w: 1.1,
      h: 0.32,
      fontSize: 12,
      fontFace: "Arial",
      color: C.ink,
      align: "center",
      margin: 0,
    });
    s.addShape("roundRect", {
      x: 8.1,
      y: 1.45,
      w: 1.2,
      h: 0.38,
      fill: { color: C.primary },
      rectRadius: 0.08,
    });
    s.addText("提交归档", {
      x: 8.1,
      y: 1.48,
      w: 1.2,
      h: 0.32,
      fontSize: 12,
      fontFace: "Arial",
      bold: true,
      color: C.white,
      align: "center",
      margin: 0,
    });
    s.addText("故障处置详情", {
      x: 0.7,
      y: 2.1,
      w: 6,
      h: 0.45,
      fontSize: 22,
      fontFace: "Arial",
      bold: true,
      color: C.ink,
      margin: 0,
    });
    s.addText("扁平页头 · 单号紫胶囊 · 20px 标题 · 状态放上下文卡", {
      x: 0.7,
      y: 2.55,
      w: 8,
      h: 0.25,
      fontSize: 12,
      fontFace: "Arial",
      color: C.muted,
      margin: 0,
    });

    const rules = [
      { t: "必须", d: "返回按钮 · 路径 meta · 单号紫胶囊 · 业务页名标题" },
      { t: "禁止", d: "整条白卡片顶栏 · 车牌当唯一大标题 · 状态 Tag 挤页头" },
      { t: "母版", d: "§4.8 FaultDispositionForm · va-form-header" },
    ];
    rules.forEach((r, i) => {
      const x = 0.5 + i * 3.15;
      s.addShape("roundRect", {
        x,
        y: 3.25,
        w: 3.0,
        h: 1.4,
        fill: { color: C.card },
        shadow: shadow(),
        rectRadius: 0.12,
      });
      s.addText(r.t, {
        x: x + 0.2,
        y: 3.45,
        w: 2.6,
        h: 0.3,
        fontSize: 14,
        fontFace: "Arial",
        bold: true,
        color: r.t === "禁止" ? C.error : C.primary,
        margin: 0,
      });
      s.addText(r.d, {
        x: x + 0.2,
        y: 3.85,
        w: 2.6,
        h: 0.6,
        fontSize: 13,
        fontFace: "Arial",
        color: C.ink,
        margin: 0,
      });
    });
    addFooter(s, page, TOTAL);
  }

  // ─── 12. H5 ───
  page++;
  {
    const s = pres.addSlide();
    s.addShape("rect", { x: 0, y: 0, w: 10, h: 5.625, fill: { color: C.canvas } });
    sectionTitle(s, "H5 移动端硬性标准", "≤767px / App 嵌入；独立 H5 原型勿硬塞 PC 顶栏");
    const h5 = [
      { t: "触控 ≥44px", d: "按钮、输入、Select、日期触发器统一 min-height 44px" },
      { t: "Bottom Sheet", d: "下拉/日期弹层吸底；抓手条 + 44px 确定" },
      { t: "吸底操作条", d: "V2MobileActionBar；次 1 : 主 2；兼容 Safe Area" },
      { t: "表格→卡片", d: "多列表格转为单列卡片 + 状态 Pill + KV 行" },
      { t: "断点策略", d: "PC≥1024 · Tablet 768–1023 · Mobile≤767" },
      { t: "导航三件套", d: "V2MobileHeader · BottomNav · ActionBar" },
    ];
    h5.forEach((h, i) => {
      const col = i % 3;
      const row = Math.floor(i / 3);
      const x = 0.5 + col * 3.1;
      const y = 1.25 + row * 1.75;
      s.addShape("roundRect", {
        x,
        y,
        w: 2.95,
        h: 1.55,
        fill: { color: C.card },
        shadow: shadow(),
        rectRadius: 0.12,
      });
      s.addText(h.t, {
        x: x + 0.2,
        y: y + 0.3,
        w: 2.55,
        h: 0.35,
        fontSize: 16,
        fontFace: "Arial",
        bold: true,
        color: C.ink,
        margin: 0,
      });
      s.addText(h.d, {
        x: x + 0.2,
        y: y + 0.75,
        w: 2.55,
        h: 0.55,
        fontSize: 12,
        fontFace: "Arial",
        color: C.body,
        margin: 0,
      });
    });
    addFooter(s, page, TOTAL);
  }

  // ─── 13. Theme / dark ───
  page++;
  {
    const s = pres.addSlide();
    s.addShape("rect", { x: 0, y: 0, w: 10, h: 5.625, fill: { color: C.canvas } });
    sectionTitle(s, "深浅双色与若依主题", "主题色走 CSS 变量，全站自动响应");
    // Light / Dark compare
    s.addShape("roundRect", {
      x: 0.5,
      y: 1.25,
      w: 4.4,
      h: 3.5,
      fill: { color: C.card },
      shadow: shadow(),
      rectRadius: 0.12,
    });
    s.addText("Light", {
      x: 0.7,
      y: 1.4,
      w: 4,
      h: 0.3,
      fontSize: 14,
      fontFace: "Arial",
      bold: true,
      color: C.primary,
      margin: 0,
    });
    s.addShape("roundRect", {
      x: 0.7,
      y: 1.85,
      w: 4.0,
      h: 2.6,
      fill: { color: C.canvas },
      rectRadius: 0.1,
    });
    s.addShape("roundRect", {
      x: 0.95,
      y: 2.1,
      w: 3.5,
      h: 1.0,
      fill: { color: C.card },
      line: { color: C.hairline, width: 1 },
      rectRadius: 0.08,
    });
    s.addText("卡片 #FFFFFF", {
      x: 1.1,
      y: 2.25,
      w: 3.2,
      h: 0.3,
      fontSize: 13,
      fontFace: "Arial",
      bold: true,
      color: C.ink,
      margin: 0,
    });
    s.addText("画布 #F6F9FC  ·  边框 #E3E8EE", {
      x: 1.1,
      y: 2.6,
      w: 3.2,
      h: 0.25,
      fontSize: 11,
      fontFace: "Arial",
      color: C.body,
      margin: 0,
    });
    s.addText("正文 #0A2540 / #425466", {
      x: 0.95,
      y: 3.35,
      w: 3.5,
      h: 0.3,
      fontSize: 12,
      fontFace: "Arial",
      color: C.ink,
      margin: 0,
    });
    s.addText("data-ds-mode / data-oneos-theme", {
      x: 0.95,
      y: 3.75,
      w: 3.5,
      h: 0.3,
      fontSize: 11,
      fontFace: "Courier New",
      color: C.muted,
      margin: 0,
    });

    s.addShape("roundRect", {
      x: 5.1,
      y: 1.25,
      w: 4.4,
      h: 3.5,
      fill: { color: C.darkCard },
      shadow: shadow(),
      rectRadius: 0.12,
    });
    s.addText("Dark", {
      x: 5.3,
      y: 1.4,
      w: 4,
      h: 0.3,
      fontSize: 14,
      fontFace: "Arial",
      bold: true,
      color: C.soft,
      margin: 0,
    });
    s.addShape("roundRect", {
      x: 5.3,
      y: 1.85,
      w: 4.0,
      h: 2.6,
      fill: { color: C.darkCanvas },
      rectRadius: 0.1,
    });
    s.addShape("roundRect", {
      x: 5.55,
      y: 2.1,
      w: 3.5,
      h: 1.0,
      fill: { color: C.darkCard },
      line: { color: "23272F", width: 1 },
      rectRadius: 0.08,
    });
    s.addText("卡片 #121418", {
      x: 5.7,
      y: 2.25,
      w: 3.2,
      h: 0.3,
      fontSize: 13,
      fontFace: "Arial",
      bold: true,
      color: C.darkInk,
      margin: 0,
    });
    s.addText("画布 #0A0B0D  ·  边框 #23272F", {
      x: 5.7,
      y: 2.6,
      w: 3.2,
      h: 0.25,
      fontSize: 11,
      fontFace: "Arial",
      color: C.darkBody,
      margin: 0,
    });
    s.addText("正文 #F7FAFC / #A0AEC0", {
      x: 5.55,
      y: 3.35,
      w: 3.5,
      h: 0.3,
      fontSize: 12,
      fontFace: "Arial",
      color: C.darkInk,
      margin: 0,
    });
    s.addText("var(--oneos-primary, var(--ln-primary, #533AFD))", {
      x: 5.55,
      y: 3.75,
      w: 3.5,
      h: 0.35,
      fontSize: 10,
      fontFace: "Courier New",
      color: C.darkBody,
      margin: 0,
    });
    addFooter(s, page, TOTAL);
  }

  // ─── 14. Closing checklist ───
  page++;
  {
    const s = pres.addSlide();
    s.addShape("rect", { x: 0, y: 0, w: 10, h: 5.625, fill: { color: C.darkCanvas } });
    s.addText("交付前检查清单", {
      x: 0.5,
      y: 0.4,
      w: 9,
      h: 0.45,
      fontSize: 28,
      fontFace: "Arial",
      bold: true,
      color: C.darkInk,
      margin: 0,
    });
    s.addText("新建 / 迁移 / 改版原型前，逐项对齐 DESIGN.md", {
      x: 0.5,
      y: 0.9,
      w: 9,
      h: 0.3,
      fontSize: 13,
      fontFace: "Arial",
      color: C.darkBody,
      margin: 0,
    });
    const checks = [
      "已读 DESIGN.md，使用 V2 封装控件（无原生 select/date）",
      "台账：三视角 + KPI + Pill Tabs + 更多筛选连体表格",
      "查询 / 重置后筛选栏自动收起",
      "详情页头：扁平返回 + 单号紫胶囊 + 20px 标题",
      "操作列：外侧 ≤2，其余进 ⋮ 更多（OperationActions）",
      "主色走 CSS 变量；深浅双色完整；车牌无中间点",
      "H5：44px 触控 · Bottom Sheet · 吸底条 · 空态/分页组件",
      "一侧栏一项：列表/详情同页切换，不拆套娃下级页",
    ];
    checks.forEach((c, i) => {
      const y = 1.35 + i * 0.42;
      s.addShape("roundRect", {
        x: 0.5,
        y,
        w: 0.28,
        h: 0.28,
        fill: { color: C.primary },
        rectRadius: 0.06,
      });
      s.addText("✓", {
        x: 0.5,
        y: y + 0.01,
        w: 0.28,
        h: 0.26,
        fontSize: 12,
        fontFace: "Arial",
        bold: true,
        color: C.white,
        align: "center",
        margin: 0,
      });
      s.addText(c, {
        x: 0.95,
        y,
        w: 8.5,
        h: 0.32,
        fontSize: 13,
        fontFace: "Arial",
        color: C.darkInk,
        margin: 0,
      });
    });
  }

  await pres.writeFile({ fileName: OUT });
  console.log("Wrote", OUT);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
