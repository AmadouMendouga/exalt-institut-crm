export interface CsvColumn<T> {
  label: string;
  value: (row: T) => unknown;
}

function escapeCsvValue(value: unknown): string {
  if (value === null || value === undefined) return '""';

  let text = value instanceof Date ? value.toISOString() : String(value);

  // Empêche Excel/LibreOffice d'interpréter une donnée utilisateur comme une formule.
  // Cela protège notamment les exports contenant des noms, notes ou numéros commençant
  // par =, +, -, ou @.
  if (/^[=+\-@]/.test(text)) {
    text = `'${text}`;
  }

  return `"${text.replace(/"/g, '""')}"`;
}

export function downloadCsv<T>(
  filename: string,
  columns: CsvColumn<T>[],
  rows: T[]
): void {
  const delimiter = ';';
  const header = columns.map((column) => escapeCsvValue(column.label)).join(delimiter);
  const body = rows.map((row) =>
    columns.map((column) => escapeCsvValue(column.value(row))).join(delimiter)
  );

  // BOM UTF-8 + séparateur ";" : ouverture propre dans Excel en environnement francophone.
  const csv = '\uFEFF' + [header, ...body].join('\r\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
