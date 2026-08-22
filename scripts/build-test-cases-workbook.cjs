const fs = require('fs');
const path = require('path');
const ExcelJS = require('/tmp/hw06-xlsx-tools/node_modules/exceljs');

const root = path.resolve(__dirname, '..');
const outputPath = path.join(root, 'excel', 'HW06_API_Test_Cases_and_Summary.xlsx');

const standardHeaders = [
  'ID', 'Source', 'Objective / transition', 'Preconditions', 'Request data / steps',
  'Expected result', 'Security / schema assertion', 'Audit', 'Audit reasoning', 'Actual / evidence'
];

function splitRow(line) {
  return line.trim().slice(1, -1).split('|').map((cell) => cell.trim());
}

function isSeparator(line) {
  return /^\|\s*:?-{3,}/.test(line.trim());
}

function normalizeRow(prefix, cells) {
  const blank = '';
  if (cells.length >= 10) return cells.slice(0, 10);
  if (prefix === 'A1' || prefix === 'B1') {
    // Student-extension tables: ID, objective, preconditions, steps, expected, audit, reasoning, evidence.
    return [cells[0], 'Student', cells[1] || blank, cells[2] || blank, cells[3] || blank,
      cells[4] || blank, blank, cells[5] || blank, cells[6] || blank, cells[7] || blank];
  }
  // FR-14 student-extension table includes an explicit source but no separate security column.
  return [cells[0], cells[1] || 'Student', cells[2] || blank, cells[3] || blank, cells[4] || blank,
    cells[5] || blank, blank, cells[6] || blank, cells[7] || blank, cells[8] || blank];
}

function extractCases(fileName, prefix) {
  const lines = fs.readFileSync(path.join(root, 'test-cases', fileName), 'utf8').split(/\r?\n/);
  const cases = [];
  const seen = new Set();
  for (const line of lines) {
    if (!line.startsWith('|') || isSeparator(line)) continue;
    const cells = splitRow(line);
    if (!new RegExp(`^${prefix}-\\d{3}$`).test(cells[0] || '') || seen.has(cells[0])) continue;
    seen.add(cells[0]);
    cases.push(normalizeRow(prefix, cells));
  }
  return cases;
}

function addCaseSheet(workbook, name, cases) {
  const sheet = workbook.addWorksheet(name, { views: [{ showGridLines: false, state: 'frozen', ySplit: 4 }] });
  sheet.mergeCells('A1:J1');
  sheet.getCell('A1').value = `HW06 API Testing — ${name}`;
  sheet.getCell('A2').value = 'Student ID'; sheet.getCell('B2').value = '23127172';
  sheet.getCell('D2').value = 'Total cases'; sheet.getCell('E2').value = cases.length;
  sheet.getCell('G2').value = 'AI cases'; sheet.getCell('H2').value = { formula: `COUNTIF(B5:B${cases.length + 4},"AI")` };
  sheet.getCell('I2').value = 'Student cases'; sheet.getCell('J2').value = { formula: `COUNTIF(B5:B${cases.length + 4},"Student")` };
  sheet.getRow(4).values = standardHeaders;
  cases.forEach((row, i) => sheet.getRow(i + 5).values = row);
  sheet.autoFilter = { from: 'A4', to: `J${cases.length + 4}` };
  sheet.addTable({ name: `${name.replace(/[^A-Za-z0-9]/g, '')}Table`, ref: 'A4', headerRow: true,
    columns: standardHeaders.map((name) => ({ name })), rows: cases,
    style: { theme: 'TableStyleMedium2', showRowStripes: true } });
  const widths = [12, 11, 34, 30, 44, 38, 38, 14, 34, 32];
  widths.forEach((width, index) => { sheet.getColumn(index + 1).width = width; });
  sheet.getRow(1).height = 28;
  sheet.getCell('A1').font = { bold: true, size: 16, color: { argb: 'FFFFFFFF' } };
  sheet.getCell('A1').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F4E78' } };
  for (let row = 5; row <= cases.length + 4; row++) {
    sheet.getRow(row).alignment = { vertical: 'top', wrapText: true };
  }
  ['A2', 'D2', 'G2', 'I2'].forEach((cell) => sheet.getCell(cell).font = { bold: true, color: { argb: 'FF1F4E78' } });
  sheet.getColumn(8).eachCell({ includeEmpty: false }, (cell, row) => {
    if (row > 4) {
      const value = String(cell.value || '').toUpperCase();
      if (value === 'VALID') cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2F0D9' } };
      if (value === 'INVALID') cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFCE4D6' } };
      if (value === 'INCOMPLETE') cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF2CC' } };
    }
  });
  return sheet;
}

async function main() {
  const apis = [
    { sheet: 'FR-02 Cases', file: 'api-1.md', prefix: 'A1', feature: 'FR-02 Login and account lockout', executed: 40, passed: 35, failed: 5, assertions: '75 / 80' },
    { sheet: 'FR-08 Cases', file: 'api-2.md', prefix: 'B1', feature: 'FR-08 Checkout', executed: 40, passed: 30, failed: 10, assertions: '103 / 114' },
    { sheet: 'FR-14 Cases', file: 'api-3.md', prefix: 'C1', feature: 'FR-14 Category CRUD', executed: 40, passed: 22, failed: 18, assertions: '72 / 92' },
  ];
  const workbook = new ExcelJS.Workbook();
  workbook.creator = '23127172';
  workbook.created = new Date();
  const summary = workbook.addWorksheet('Summary', { views: [{ showGridLines: false, state: 'frozen', ySplit: 5 }] });
  summary.mergeCells('A1:L1');
  summary.getCell('A1').value = 'HW06 API Testing — Test Summary';
  summary.getCell('A2').value = 'Student ID'; summary.getCell('B2').value = '23127172';
  summary.getCell('D2').value = 'Scope'; summary.getCell('E2').value = 'FR-02, FR-08, FR-14';
  summary.getCell('A4').value = 'Original execution evidence: historical Newman/Postman runs against the unpatched SUT. CI remediation runs are documented separately.';
  summary.mergeCells('A4:L4');
  const summaryHeaders = ['API', 'Feature', 'Total cases', 'AI cases', 'Student cases', 'VALID', 'INVALID', 'INCOMPLETE', 'Executed', 'Passed cases', 'Failed cases', 'Assertions passed / total'];
  summary.getRow(6).values = summaryHeaders;
  apis.forEach((api, index) => {
    const row = index + 7;
    const caseSheet = api.sheet;
    summary.getCell(row, 1).value = `API ${index + 1}`;
    summary.getCell(row, 2).value = api.feature;
    summary.getCell(row, 3).value = { formula: `COUNTA('${caseSheet}'!A5:A44)` };
    summary.getCell(row, 4).value = { formula: `COUNTIF('${caseSheet}'!B5:B44,"AI")` };
    summary.getCell(row, 5).value = { formula: `COUNTIF('${caseSheet}'!B5:B44,"Student")` };
    summary.getCell(row, 6).value = { formula: `COUNTIF('${caseSheet}'!H5:H44,"VALID")` };
    summary.getCell(row, 7).value = { formula: `COUNTIF('${caseSheet}'!H5:H44,"INVALID")` };
    summary.getCell(row, 8).value = { formula: `COUNTIF('${caseSheet}'!H5:H44,"INCOMPLETE")` };
    summary.getCell(row, 9).value = api.executed;
    summary.getCell(row, 10).value = api.passed;
    summary.getCell(row, 11).value = api.failed;
    summary.getCell(row, 12).value = api.assertions;
  });
  summary.addTable({ name: 'SummaryTable', ref: 'A6', headerRow: true, totalsRow: false,
    columns: summaryHeaders.map((name) => ({ name })),
    rows: apis.map((api, index) => [`API ${index + 1}`, api.feature, '', '', '', '', '', '', api.executed, api.passed, api.failed, api.assertions]),
    style: { theme: 'TableStyleMedium2', showRowStripes: true } });
  apis.forEach((api, index) => {
    const row = index + 7;
    const caseSheet = api.sheet;
    summary.getCell(row, 3).value = { formula: `COUNTA('${caseSheet}'!A5:A44)` };
    summary.getCell(row, 4).value = { formula: `COUNTIF('${caseSheet}'!B5:B44,"AI")` };
    summary.getCell(row, 5).value = { formula: `COUNTIF('${caseSheet}'!B5:B44,"Student")` };
    summary.getCell(row, 6).value = { formula: `COUNTIF('${caseSheet}'!H5:H44,"VALID")` };
    summary.getCell(row, 7).value = { formula: `COUNTIF('${caseSheet}'!H5:H44,"INVALID")` };
    summary.getCell(row, 8).value = { formula: `COUNTIF('${caseSheet}'!H5:H44,"INCOMPLETE")` };
  });
  summary.getRow(10).values = ['Total', '', { formula: 'SUM(C7:C9)' }, { formula: 'SUM(D7:D9)' }, { formula: 'SUM(E7:E9)' }, { formula: 'SUM(F7:F9)' }, { formula: 'SUM(G7:G9)' }, { formula: 'SUM(H7:H9)' }, { formula: 'SUM(I7:I9)' }, { formula: 'SUM(J7:J9)' }, { formula: 'SUM(K7:K9)' }, ''];
  [11, 38, 13, 12, 14, 11, 11, 14, 12, 15, 15, 23].forEach((width, index) => summary.getColumn(index + 1).width = width);
  summary.getRow(1).height = 28;
  summary.getCell('A1').font = { bold: true, size: 16, color: { argb: 'FFFFFFFF' } };
  summary.getCell('A1').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F4E78' } };
  summary.getCell('A4').font = { italic: true, color: { argb: 'FF666666' } };
  ['A2', 'D2'].forEach((cell) => summary.getCell(cell).font = { bold: true, color: { argb: 'FF1F4E78' } });
  summary.getRow(10).font = { bold: true };
  summary.getRow(10).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9EAF7' } };
  apis.forEach((api) => addCaseSheet(workbook, api.sheet, extractCases(api.file, api.prefix)));
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  await workbook.xlsx.writeFile(outputPath);
  console.log(JSON.stringify({ outputPath, sheets: workbook.worksheets.map((sheet) => ({ name: sheet.name, rows: sheet.rowCount })) }, null, 2));
}

main().catch((error) => { console.error(error); process.exit(1); });
