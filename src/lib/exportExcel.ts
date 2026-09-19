export type ExcelCellValue = string | number | boolean | Date | null | undefined;

export type ExcelCellKind = 'text' | 'number' | 'date' | 'datetime' | 'currency';
export type ExcelSemanticStyle =
  | 'new'
  | 'contacted'
  | 'converted'
  | 'not_interested'
  | 'sent'
  | 'failed'
  | 'warning';

export interface ExcelColumn<T> {
  header: string;
  width?: number;
  kind?: ExcelCellKind;
  wrap?: boolean;
  value: (row: T) => ExcelCellValue;
  style?: (row: T, value: ExcelCellValue) => ExcelSemanticStyle | undefined;
}

export interface ExcelSummaryMetric {
  label: string;
  value: string | number;
  kind?: 'number' | 'percent' | 'currency';
}

export interface ExcelDistributionRow {
  label: string;
  count: number;
  percent: number;
  style?: ExcelSemanticStyle;
}

export interface ExcelDistribution {
  title: string;
  rows: ExcelDistributionRow[];
}

export interface ProfessionalExcelExport<T> {
  filename: string;
  dataSheetName: string;
  tableName: string;
  columns: ExcelColumn<T>[];
  rows: T[];
  summaryTitle: string;
  summaryMetrics: ExcelSummaryMetric[];
  distributions?: ExcelDistribution[];
  exportInfo: Array<{ label: string; value: string | number }>;
}

const encoder = new TextEncoder();

function xmlEscape(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function columnLetter(index: number): string {
  let n = index + 1;
  let result = '';
  while (n > 0) {
    const remainder = (n - 1) % 26;
    result = String.fromCharCode(65 + remainder) + result;
    n = Math.floor((n - 1) / 26);
  }
  return result;
}

function normalizeExcelName(value: string, fallback: string): string {
  const cleaned = value.replace(/[^A-Za-z0-9_]/g, '_').replace(/^[^A-Za-z_]+/, '');
  return (cleaned || fallback).slice(0, 200);
}

function parseFlexibleDate(value: ExcelCellValue): Date | null {
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value;
  if (typeof value !== 'string') return null;
  const raw = value.trim();
  if (!raw) return null;

  const fr = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:[ T](\d{1,2}):(\d{2})(?::(\d{2}))?)?$/);
  if (fr) {
    const [, d, m, y, hh = '0', mm = '0', ss = '0'] = fr;
    return new Date(Number(y), Number(m) - 1, Number(d), Number(hh), Number(mm), Number(ss));
  }

  const isoDate = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoDate) {
    const [, y, m, d] = isoDate;
    return new Date(Number(y), Number(m) - 1, Number(d));
  }

  const safeIso = raw.replace(/(\.\d{3})\d+/, '$1');
  const parsed = new Date(safeIso);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function excelSerial(date: Date): number {
  const utc = Date.UTC(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    date.getHours(),
    date.getMinutes(),
    date.getSeconds(),
    date.getMilliseconds()
  );
  return utc / 86400000 + 25569;
}

function semanticStyleIndex(style?: ExcelSemanticStyle): number | undefined {
  switch (style) {
    case 'new': return 7;
    case 'contacted': return 8;
    case 'converted': return 9;
    case 'not_interested': return 10;
    case 'sent': return 11;
    case 'failed': return 12;
    case 'warning': return 13;
    default: return undefined;
  }
}

function baseStyleIndex(kind?: ExcelCellKind, wrap?: boolean): number {
  if (wrap) return 6;
  switch (kind) {
    case 'date': return 2;
    case 'datetime': return 3;
    case 'currency': return 4;
    default: return 23;
  }
}

function cellXml(
  ref: string,
  value: ExcelCellValue,
  styleIndex: number,
  kind?: ExcelCellKind
): string {
  if (value === null || value === undefined || value === '') {
    return `<c r="${ref}" s="${styleIndex}"/>`;
  }

  if (kind === 'date' || kind === 'datetime') {
    const parsed = parseFlexibleDate(value);
    if (parsed) {
      return `<c r="${ref}" s="${styleIndex}"><v>${excelSerial(parsed)}</v></c>`;
    }
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    return `<c r="${ref}" s="${styleIndex}"><v>${value}</v></c>`;
  }

  if (typeof value === 'boolean') {
    return `<c r="${ref}" t="b" s="${styleIndex}"><v>${value ? 1 : 0}</v></c>`;
  }

  return `<c r="${ref}" t="inlineStr" s="${styleIndex}"><is><t xml:space="preserve">${xmlEscape(value)}</t></is></c>`;
}

function buildDataSheet<T>(columns: ExcelColumn<T>[], rows: T[]): string {
  const lastCol = columnLetter(columns.length - 1);
  const lastRow = Math.max(1, rows.length + 1);

  const cols = columns
    .map((column, index) => `<col min="${index + 1}" max="${index + 1}" width="${column.width ?? 18}" customWidth="1"/>`)
    .join('');

  const headerCells = columns
    .map((column, index) => cellXml(`${columnLetter(index)}1`, column.header, 1, 'text'))
    .join('');

  const dataRows = rows
    .map((row, rowIndex) => {
      const excelRow = rowIndex + 2;
      const cells = columns
        .map((column, columnIndex) => {
          const value = column.value(row);
          const semantic = column.style?.(row, value);
          const styleIndex = semanticStyleIndex(semantic) ?? baseStyleIndex(column.kind, column.wrap);
          return cellXml(`${columnLetter(columnIndex)}${excelRow}`, value, styleIndex, column.kind);
        })
        .join('');
      return `<row r="${excelRow}">${cells}</row>`;
    })
    .join('');

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"
 xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheetViews>
    <sheetView workbookViewId="0">
      <pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/>
    </sheetView>
  </sheetViews>
  <sheetFormatPr defaultRowHeight="15"/>
  <cols>${cols}</cols>
  <sheetData>
    <row r="1" ht="24" customHeight="1">${headerCells}</row>
    ${dataRows}
  </sheetData>
  <tableParts count="1"><tablePart r:id="rId1"/></tableParts>
</worksheet>`;
}

function buildTableXml<T>(
  columns: ExcelColumn<T>[],
  rowCount: number,
  tableName: string
): string {
  const lastCol = columnLetter(columns.length - 1);
  const lastRow = Math.max(1, rowCount + 1);
  const ref = `A1:${lastCol}${lastRow}`;
  const safeName = normalizeExcelName(tableName, 'ExaltData');

  const tableColumns = columns
    .map((column, index) => `<tableColumn id="${index + 1}" name="${xmlEscape(column.header)}"/>`)
    .join('');

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<table xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"
 id="1" name="${safeName}" displayName="${safeName}" ref="${ref}" totalsRowShown="0">
  <autoFilter ref="${ref}"/>
  <tableColumns count="${columns.length}">${tableColumns}</tableColumns>
</table>`;
}

function buildSummarySheet(
  title: string,
  metrics: ExcelSummaryMetric[],
  distributions: ExcelDistribution[]
): string {
  const rows: string[] = [];
  rows.push(`<row r="1" ht="28" customHeight="1">${cellXml('A1', title, 14, 'text')}</row>`);

  let row = 3;
  metrics.forEach((metric) => {
    const valueStyle =
      metric.kind === 'currency' ? 17 :
      metric.kind === 'percent' ? 18 :
      16;
    rows.push(
      `<row r="${row}">` +
      cellXml(`A${row}`, metric.label, 15, 'text') +
      cellXml(`B${row}`, metric.value, valueStyle, metric.kind === 'currency' ? 'currency' : 'number') +
      `</row>`
    );
    row += 1;
  });

  row += 2;

  distributions.forEach((distribution) => {
    rows.push(
      `<row r="${row}" ht="22" customHeight="1">${cellXml(`A${row}`, distribution.title, 19, 'text')}</row>`
    );
    row += 1;
    rows.push(
      `<row r="${row}">` +
      cellXml(`A${row}`, 'Catégorie', 1, 'text') +
      cellXml(`B${row}`, 'Nombre', 1, 'text') +
      cellXml(`C${row}`, 'Part', 1, 'text') +
      `</row>`
    );
    row += 1;

    distribution.rows.forEach((item) => {
      const labelStyle = semanticStyleIndex(item.style) ?? 23;
      rows.push(
        `<row r="${row}">` +
        cellXml(`A${row}`, item.label, labelStyle, 'text') +
        cellXml(`B${row}`, item.count, 23, 'number') +
        cellXml(`C${row}`, item.percent, 5, 'number') +
        `</row>`
      );
      row += 1;
    });

    row += 2;
  });

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <sheetViews><sheetView workbookViewId="0"/></sheetViews>
  <cols>
    <col min="1" max="1" width="34" customWidth="1"/>
    <col min="2" max="2" width="20" customWidth="1"/>
    <col min="3" max="3" width="16" customWidth="1"/>
  </cols>
  <sheetData>${rows.join('')}</sheetData>
  <mergeCells count="1"><mergeCell ref="A1:C1"/></mergeCells>
</worksheet>`;
}

function buildInfoSheet(info: Array<{ label: string; value: string | number }>): string {
  const rows: string[] = [];
  rows.push(`<row r="1" ht="28" customHeight="1">${cellXml('A1', 'Informations sur l’export', 14, 'text')}</row>`);

  info.forEach((item, index) => {
    const row = index + 3;
    rows.push(
      `<row r="${row}">` +
      cellXml(`A${row}`, item.label, 20, 'text') +
      cellXml(`B${row}`, item.value, 21, typeof item.value === 'number' ? 'number' : 'text') +
      `</row>`
    );
  });

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <sheetViews><sheetView workbookViewId="0"/></sheetViews>
  <cols>
    <col min="1" max="1" width="32" customWidth="1"/>
    <col min="2" max="2" width="54" customWidth="1"/>
  </cols>
  <sheetData>${rows.join('')}</sheetData>
  <mergeCells count="1"><mergeCell ref="A1:B1"/></mergeCells>
</worksheet>`;
}

function stylesXml(): string {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <numFmts count="4">
    <numFmt numFmtId="164" formatCode="dd/mm/yyyy"/>
    <numFmt numFmtId="165" formatCode="dd/mm/yyyy hh:mm"/>
    <numFmt numFmtId="166" formatCode="# ##0 &quot;FCFA&quot;"/>
    <numFmt numFmtId="167" formatCode="0.0%"/>
  </numFmts>
  <fonts count="4">
    <font><sz val="11"/><name val="Calibri"/></font>
    <font><b/><color rgb="FFFFFFFF"/><sz val="11"/><name val="Calibri"/></font>
    <font><b/><color rgb="FF4A342B"/><sz val="11"/><name val="Calibri"/></font>
    <font><b/><color rgb="FF4A342B"/><sz val="14"/><name val="Calibri"/></font>
  </fonts>
  <fills count="11">
    <fill><patternFill patternType="none"/></fill>
    <fill><patternFill patternType="gray125"/></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FFC96B4B"/><bgColor indexed="64"/></patternFill></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FFF4E8E1"/><bgColor indexed="64"/></patternFill></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FFFFF2CC"/><bgColor indexed="64"/></patternFill></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FFD9EAF7"/><bgColor indexed="64"/></patternFill></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FFE2F0D9"/><bgColor indexed="64"/></patternFill></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FFF2F2F2"/><bgColor indexed="64"/></patternFill></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FFC6E0B4"/><bgColor indexed="64"/></patternFill></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FFF4CCCC"/><bgColor indexed="64"/></patternFill></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FFFCE4D6"/><bgColor indexed="64"/></patternFill></fill>
  </fills>
  <borders count="2">
    <border><left/><right/><top/><bottom/><diagonal/></border>
    <border>
      <left style="thin"><color rgb="FFE6D6CE"/></left>
      <right style="thin"><color rgb="FFE6D6CE"/></right>
      <top style="thin"><color rgb="FFE6D6CE"/></top>
      <bottom style="thin"><color rgb="FFE6D6CE"/></bottom>
      <diagonal/>
    </border>
  </borders>
  <cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>
  <cellXfs count="24">
    <xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>
    <xf numFmtId="0" fontId="1" fillId="2" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center" wrapText="1"/></xf>
    <xf numFmtId="164" fontId="0" fillId="0" borderId="1" xfId="0" applyNumberFormat="1" applyBorder="1"/>
    <xf numFmtId="165" fontId="0" fillId="0" borderId="1" xfId="0" applyNumberFormat="1" applyBorder="1"/>
    <xf numFmtId="166" fontId="0" fillId="0" borderId="1" xfId="0" applyNumberFormat="1" applyBorder="1"/>
    <xf numFmtId="167" fontId="0" fillId="0" borderId="1" xfId="0" applyNumberFormat="1" applyBorder="1"/>
    <xf numFmtId="0" fontId="0" fillId="0" borderId="1" xfId="0" applyBorder="1" applyAlignment="1"><alignment wrapText="1" vertical="top"/></xf>
    <xf numFmtId="0" fontId="2" fillId="4" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1"/>
    <xf numFmtId="0" fontId="2" fillId="5" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1"/>
    <xf numFmtId="0" fontId="2" fillId="6" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1"/>
    <xf numFmtId="0" fontId="2" fillId="7" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1"/>
    <xf numFmtId="0" fontId="2" fillId="8" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1"/>
    <xf numFmtId="0" fontId="2" fillId="9" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1"/>
    <xf numFmtId="0" fontId="2" fillId="10" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1"/>
    <xf numFmtId="0" fontId="1" fillId="2" borderId="0" xfId="0" applyFont="1" applyFill="1" applyAlignment="1"><alignment vertical="center"/></xf>
    <xf numFmtId="0" fontId="2" fillId="3" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1"/>
    <xf numFmtId="0" fontId="3" fillId="0" borderId="1" xfId="0" applyFont="1" applyBorder="1"/>
    <xf numFmtId="166" fontId="3" fillId="0" borderId="1" xfId="0" applyFont="1" applyBorder="1" applyNumberFormat="1"/>
    <xf numFmtId="167" fontId="3" fillId="0" borderId="1" xfId="0" applyFont="1" applyBorder="1" applyNumberFormat="1"/>
    <xf numFmtId="0" fontId="1" fillId="2" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1"/>
    <xf numFmtId="0" fontId="2" fillId="3" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1"/>
    <xf numFmtId="0" fontId="0" fillId="0" borderId="1" xfId="0" applyBorder="1"/>
    <xf numFmtId="0" fontId="0" fillId="0" borderId="1" xfId="0" applyBorder="1" applyAlignment="1"><alignment horizontal="center"/></xf>
    <xf numFmtId="0" fontId="0" fillId="0" borderId="1" xfId="0" applyBorder="1"/>
  </cellXfs>
  <cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>
</styleSheet>`;
}

function u16(value: number): Uint8Array {
  return Uint8Array.of(value & 0xff, (value >>> 8) & 0xff);
}

function u32(value: number): Uint8Array {
  const v = value >>> 0;
  return Uint8Array.of(v & 0xff, (v >>> 8) & 0xff, (v >>> 16) & 0xff, (v >>> 24) & 0xff);
}

function concatBytes(parts: Uint8Array[]): Uint8Array {
  const total = parts.reduce((sum, part) => sum + part.length, 0);
  const output = new Uint8Array(total);
  let offset = 0;
  parts.forEach((part) => {
    output.set(part, offset);
    offset += part.length;
  });
  return output;
}

const crcTable = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n += 1) {
    let c = n;
    for (let k = 0; k < 8; k += 1) {
      c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(bytes: Uint8Array): number {
  let crc = 0xffffffff;
  for (let i = 0; i < bytes.length; i += 1) {
    crc = crcTable[(crc ^ bytes[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

interface ZipEntry {
  name: string;
  content: string;
}

function buildZip(entries: ZipEntry[]): Uint8Array {
  const localParts: Uint8Array[] = [];
  const centralParts: Uint8Array[] = [];
  let offset = 0;

  entries.forEach((entry) => {
    const name = encoder.encode(entry.name);
    const data = encoder.encode(entry.content);
    const crc = crc32(data);
    const flags = 0x0800;

    const localHeader = concatBytes([
      u32(0x04034b50),
      u16(20),
      u16(flags),
      u16(0),
      u16(0),
      u16(0),
      u32(crc),
      u32(data.length),
      u32(data.length),
      u16(name.length),
      u16(0),
      name,
    ]);
    const localRecord = concatBytes([localHeader, data]);
    localParts.push(localRecord);

    const centralHeader = concatBytes([
      u32(0x02014b50),
      u16(20),
      u16(20),
      u16(flags),
      u16(0),
      u16(0),
      u16(0),
      u32(crc),
      u32(data.length),
      u32(data.length),
      u16(name.length),
      u16(0),
      u16(0),
      u16(0),
      u16(0),
      u32(0),
      u32(offset),
      name,
    ]);
    centralParts.push(centralHeader);
    offset += localRecord.length;
  });

  const localData = concatBytes(localParts);
  const centralData = concatBytes(centralParts);
  const end = concatBytes([
    u32(0x06054b50),
    u16(0),
    u16(0),
    u16(entries.length),
    u16(entries.length),
    u32(centralData.length),
    u32(localData.length),
    u16(0),
  ]);

  return concatBytes([localData, centralData, end]);
}

export function downloadProfessionalExcel<T>(config: ProfessionalExcelExport<T>): void {
  const dataSheetName = config.dataSheetName.slice(0, 31);
  const summarySheetName = 'Résumé';
  const infoSheetName = 'Informations export';

  const workbookXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"
 xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheets>
    <sheet name="${xmlEscape(dataSheetName)}" sheetId="1" r:id="rId1"/>
    <sheet name="${summarySheetName}" sheetId="2" r:id="rId2"/>
    <sheet name="${infoSheetName}" sheetId="3" r:id="rId3"/>
  </sheets>
</workbook>`;

  const workbookRels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet2.xml"/>
  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet3.xml"/>
  <Relationship Id="rId4" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`;

  const rootRels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`;

  const sheetRels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/table" Target="../tables/table1.xml"/>
</Relationships>`;

  const contentTypes = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
  <Override PartName="/xl/worksheets/sheet2.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
  <Override PartName="/xl/worksheets/sheet3.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
  <Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
  <Override PartName="/xl/tables/table1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.table+xml"/>
</Types>`;

  const entries: ZipEntry[] = [
    { name: '[Content_Types].xml', content: contentTypes },
    { name: '_rels/.rels', content: rootRels },
    { name: 'xl/workbook.xml', content: workbookXml },
    { name: 'xl/_rels/workbook.xml.rels', content: workbookRels },
    { name: 'xl/styles.xml', content: stylesXml() },
    { name: 'xl/worksheets/sheet1.xml', content: buildDataSheet(config.columns, config.rows) },
    { name: 'xl/worksheets/_rels/sheet1.xml.rels', content: sheetRels },
    { name: 'xl/worksheets/sheet2.xml', content: buildSummarySheet(config.summaryTitle, config.summaryMetrics, config.distributions ?? []) },
    { name: 'xl/worksheets/sheet3.xml', content: buildInfoSheet(config.exportInfo) },
    { name: 'xl/tables/table1.xml', content: buildTableXml(config.columns, config.rows.length, config.tableName) },
  ];

  const bytes = buildZip(entries);
  const blob = new Blob([bytes], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = config.filename.endsWith('.xlsx') ? config.filename : `${config.filename}.xlsx`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
