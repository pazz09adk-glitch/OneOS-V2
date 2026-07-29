/** VIN 正则校验（ISO 3779 常见约束，排除 I/O/Q） */

const VIN_REGEX = /^[A-HJ-NPR-Z0-9]{17}$/;

export function normalizeVin(raw: string): string {
  return String(raw || '')
    .trim()
    .toUpperCase()
    .replace(/\s+/g, '');
}

export function isValidVin(raw: string): boolean {
  return VIN_REGEX.test(normalizeVin(raw));
}

export function vinValidationMessage(raw: string): string | null {
  const v = normalizeVin(raw);
  if (!v) return '请填写 VIN 码';
  if (v.length !== 17) return 'VIN 码须为 17 位';
  if (!VIN_REGEX.test(v)) return 'VIN 码格式不正确（不可含 I/O/Q，仅字母与数字）';
  return null;
}

/** OCR 模拟回填样例（未接真实 OCR） */
export const OCR_SAMPLE_VINS = [
  'LZZ1CLWB0PA123456',
  'LZZ1CLWB0PA123457',
  'LFNA1LSE5N1A88901',
  'LZZ1CLSB5PA778899',
];

export function mockOcrVin(index = 0): string {
  return OCR_SAMPLE_VINS[index % OCR_SAMPLE_VINS.length];
}
