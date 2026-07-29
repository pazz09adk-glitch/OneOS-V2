/**
 * 车辆资产批量导入 Excel 模板（.xlsx）
 * 「车辆来源」列使用数据有效性序列下拉，避免自由输入与系统枚举不符。
 */

import { VEHICLE_SOURCE_OPTIONS } from './vehicle';

export const IMPORT_TEMPLATE_HEADERS = [
  '车辆类型',
  '公告型号',
  '车牌号',
  '车辆识别代码',
  '车辆编号',
  '车身颜色',
  '轮胎规格',
  '供氢系统生产企业',
  '电堆生产企业',
  '出厂年份',
  '采购入库时间',
  '停放区域',
  '登记所有权',
  '强制报废日期',
  '运营公司',
  '车辆来源',
  '来源公司',
] as const;

export const IMPORT_TEMPLATE_SAMPLE_ROW: string[] = [
  '运营车辆',
  '帕力安4.5吨',
  '浙A88888',
  'LB9A32A25R0LS1581',
  'VH-2026-0001',
  '白色',
  '245/70R19.5',
  '某某氢系统有限公司',
  '某某电堆有限公司',
  '2024',
  '2024-06-15',
  '杭州半山停车场',
  '羚牛新能源科技（上海）有限公司',
  '2039-06-15',
  '羚牛新能源科技（上海）有限公司',
  '自有',
  '羚牛新能源科技（上海）有限公司',
];

/** 车辆来源列（1-based / Excel 列字母） */
export const IMPORT_VEHICLE_SOURCE_COL_INDEX = IMPORT_TEMPLATE_HEADERS.indexOf('车辆来源') + 1;

const IMPORT_DATA_END_ROW = 2000;

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function colLetter(index1Based: number): string {
  let n = index1Based;
  let s = '';
  while (n > 0) {
    const rem = (n - 1) % 26;
    s = String.fromCharCode(65 + rem) + s;
    n = Math.floor((n - 1) / 26);
  }
  return s;
}

function sheetCell(col: number, row: number, value: string): string {
  const ref = `${colLetter(col)}${row}`;
  return `<c r="${ref}" t="inlineStr"><is><t>${escapeXml(value)}</t></is></c>`;
}

function buildSheetXml(headers: readonly string[], sample: string[], sourceOptions: readonly string[]): string {
  const headerCells = headers.map((h, i) => sheetCell(i + 1, 1, h)).join('');
  const sampleCells = sample.map((v, i) => sheetCell(i + 1, 2, v)).join('');
  const sourceCol = colLetter(IMPORT_VEHICLE_SOURCE_COL_INDEX);
  const listFormula = `"${sourceOptions.join(',')}"`;
  const sqref = `${sourceCol}2:${sourceCol}${IMPORT_DATA_END_ROW}`;

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"
  xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheetData>
    <row r="1">${headerCells}</row>
    <row r="2">${sampleCells}</row>
  </sheetData>
  <dataValidations count="1">
    <dataValidation type="list" allowBlank="1" showErrorMessage="1" showInputMessage="1"
      promptTitle="车辆来源"
      prompt="请从下拉列表选择，勿自行输入，以免与系统枚举不符导致导入失败"
      errorTitle="车辆来源无效"
      error="请选择：${escapeXml(sourceOptions.join('、'))}"
      sqref="${sqref}">
      <formula1>${escapeXml(listFormula)}</formula1>
    </dataValidation>
  </dataValidations>
</worksheet>`;
}

function crc32(buf: Uint8Array): number {
  let c = ~0;
  for (let i = 0; i < buf.length; i += 1) {
    c ^= buf[i];
    for (let k = 0; k < 8; k += 1) {
      c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
    }
  }
  return ~c >>> 0;
}

function u16(n: number): Uint8Array {
  const b = new Uint8Array(2);
  b[0] = n & 0xff;
  b[1] = (n >>> 8) & 0xff;
  return b;
}

function u32(n: number): Uint8Array {
  const b = new Uint8Array(4);
  b[0] = n & 0xff;
  b[1] = (n >>> 8) & 0xff;
  b[2] = (n >>> 16) & 0xff;
  b[3] = (n >>> 24) & 0xff;
  return b;
}

function concatBytes(parts: Uint8Array[]): Uint8Array {
  const total = parts.reduce((sum, p) => sum + p.length, 0);
  const out = new Uint8Array(total);
  let offset = 0;
  for (const p of parts) {
    out.set(p, offset);
    offset += p.length;
  }
  return out;
}

function encodeUtf8(text: string): Uint8Array {
  return new TextEncoder().encode(text);
}

/** 无压缩 ZIP（STORE），Excel 可正常打开 */
function zipStore(files: Array<{ path: string; content: string }>): Blob {
  const localParts: Uint8Array[] = [];
  const centralParts: Uint8Array[] = [];
  let offset = 0;

  for (const file of files) {
    const nameBytes = encodeUtf8(file.path);
    const data = encodeUtf8(file.content);
    const crc = crc32(data);
    const localHeader = concatBytes([
      u32(0x04034b50),
      u16(20),
      u16(0),
      u16(0),
      u16(0),
      u16(0),
      u32(crc),
      u32(data.length),
      u32(data.length),
      u16(nameBytes.length),
      u16(0),
      nameBytes,
    ]);
    localParts.push(localHeader, data);

    const central = concatBytes([
      u32(0x02014b50),
      u16(20),
      u16(20),
      u16(0),
      u16(0),
      u16(0),
      u16(0),
      u32(crc),
      u32(data.length),
      u32(data.length),
      u16(nameBytes.length),
      u16(0),
      u16(0),
      u16(0),
      u16(0),
      u32(0),
      u32(offset),
      nameBytes,
    ]);
    centralParts.push(central);
    offset += localHeader.length + data.length;
  }

  const centralDir = concatBytes(centralParts);
  const end = concatBytes([
    u32(0x06054b50),
    u16(0),
    u16(0),
    u16(files.length),
    u16(files.length),
    u32(centralDir.length),
    u32(offset),
    u16(0),
  ]);

  return new Blob([concatBytes([...localParts, centralDir, end])], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
}

export const IMPORT_TEMPLATE_FILENAME = '车辆资产批量导入模板_OneOS.xlsx';

/** 生成带「车辆来源」下拉的 Excel 模板 Blob */
export function buildVehicleImportTemplateBlob(
  sourceOptions: readonly string[] = VEHICLE_SOURCE_OPTIONS,
): Blob {
  const sheet = buildSheetXml(IMPORT_TEMPLATE_HEADERS, IMPORT_TEMPLATE_SAMPLE_ROW, sourceOptions);

  const contentTypes = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
  <Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
</Types>`;

  const rootRels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`;

  const workbook = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"
  xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheets>
    <sheet name="车辆导入" sheetId="1" r:id="rId1"/>
  </sheets>
</workbook>`;

  const workbookRels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`;

  const styles = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <fonts count="1"><font><sz val="11"/><name val="Calibri"/></font></fonts>
  <fills count="1"><fill><patternFill patternType="none"/></fill></fills>
  <borders count="1"><border/></borders>
  <cellStyleXfs count="1"><xf/></cellStyleXfs>
  <cellXfs count="1"><xf/></cellXfs>
</styleSheet>`;

  return zipStore([
    { path: '[Content_Types].xml', content: contentTypes },
    { path: '_rels/.rels', content: rootRels },
    { path: 'xl/workbook.xml', content: workbook },
    { path: 'xl/_rels/workbook.xml.rels', content: workbookRels },
    { path: 'xl/styles.xml', content: styles },
    { path: 'xl/worksheets/sheet1.xml', content: sheet },
  ]);
}

export function downloadVehicleImportTemplate(): void {
  const blob = buildVehicleImportTemplateBlob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = IMPORT_TEMPLATE_FILENAME;
  a.click();
  URL.revokeObjectURL(url);
}
