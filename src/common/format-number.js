/**
 * 全局数字/金额格式化（千分位 + 固定小数位）
 * 与 vehicle-management `.vm-expire-date` 数字展示规范配套使用。
 */

function toFiniteNumber(value, fallback = 0) {
  if (value === null || value === undefined || value === '') return fallback;
  const n = typeof value === 'number' ? value : parseFloat(String(value).replace(/,/g, ''));
  return Number.isFinite(n) ? n : fallback;
}

/**
 * @param {number|string|null|undefined} value
 * @param {{ fractionDigits?: number, empty?: string }} [options]
 */
export function formatNumber(value, options) {
  const fractionDigits = options && options.fractionDigits != null ? options.fractionDigits : 2;
  const empty = options && options.empty != null ? options.empty : null;
  if (value === null || value === undefined || value === '') {
    return empty != null ? empty : (fractionDigits > 0 ? (0).toFixed(fractionDigits) : '0');
  }
  const n = toFiniteNumber(value, NaN);
  if (Number.isNaN(n)) {
    return empty != null ? empty : (fractionDigits > 0 ? (0).toFixed(fractionDigits) : '0');
  }
  return n.toLocaleString('zh-CN', {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  });
}

/** 金额（默认 2 位小数，无货币符号） */
export function formatMoney(value, options) {
  if (value == null || value === '') {
    if (options && options.empty != null) return options.empty;
  }
  if (typeof value === 'number' && Number.isNaN(value)) {
    if (options && options.empty != null) return options.empty;
  }
  return formatNumber(value, Object.assign({ fractionDigits: 2 }, options || {}));
}

/** 提车应收款等列表沿用的金额字符串（无「元」后缀） */
export function formatMoneyYuan(value) {
  return formatMoney(value);
}

/** 金额 + 单位，默认「元」 */
export function formatMoneyWithUnit(value, unit) {
  return formatMoney(value) + (unit != null ? unit : ' 元');
}

/** 整数数量（里程、计数等） */
export function formatInteger(value) {
  return formatNumber(value, { fractionDigits: 0 });
}
