export function parseBacklogFile(fileName, content) {
  const lower = fileName.toLowerCase();

  // 1. Định dạng JSON: mảng các object [{ title, description, acceptanceCriteria }]
  if (lower.endsWith('.json')) {
    const parsed = JSON.parse(content);
    if (!Array.isArray(parsed)) {
      throw new Error('File JSON phải là một mảng danh sách các User Story!');
    }
    return parsed
      .filter((item) => item && item.title && String(item.title).trim() !== '')
      .map((item) => ({
        title: String(item.title).trim(),
        description: item.description ? String(item.description).trim() : '',
        acceptanceCriteria:
          item.acceptanceCriteria || item.acceptance_criteria
            ? String(item.acceptanceCriteria || item.acceptance_criteria).trim()
            : '',
      }));
  }

  // 2. Định dạng CSV: hỗ trợ cả file xuất từ Excel (UTF-8 BOM) lẫn file chuẩn
  if (lower.endsWith('.csv')) {
    const cleanText = content.replace(/^\uFEFF/, '');
    const rows = parseCsvRows(cleanText);
    if (rows.length < 2) {
      throw new Error('File CSV cần có dòng tiêu đề và ít nhất 1 dòng dữ liệu!');
    }

    const headers = rows[0].map((h) => h.trim().toLowerCase());
    const titleIdx = headers.findIndex((h) => h === 'title' || h === 'tiêu đề');
    const descIdx = headers.findIndex((h) => h === 'description' || h === 'mô tả');
    const acIdx = headers.findIndex(
      (h) => h === 'acceptance criteria' || h === 'acceptance_criteria' || h === 'ac'
    );

    if (titleIdx === -1) {
      throw new Error('File CSV bắt buộc phải có cột "Title"!');
    }

    return rows
      .slice(1)
      .filter((cols) => cols[titleIdx] && cols[titleIdx].trim() !== '')
      .map((cols) => ({
        title: cols[titleIdx].trim(),
        description: descIdx !== -1 && cols[descIdx] ? cols[descIdx].trim() : '',
        acceptanceCriteria: acIdx !== -1 && cols[acIdx] ? cols[acIdx].trim() : '',
      }));
  }

  throw new Error('Chỉ hỗ trợ định dạng file .csv hoặc .json!');
}

function parseCsvRows(text) {
  const rows = [];
  let row = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const next = text[i + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      row.push(current);
      current = '';
    } else if ((char === '\n' || (char === '\r' && next === '\n')) && !inQuotes) {
      if (char === '\r') i++;
      row.push(current);
      rows.push(row);
      row = [];
      current = '';
    } else {
      current += char;
    }
  }

  if (current.length > 0 || row.length > 0) {
    row.push(current);
    rows.push(row);
  }
  return rows;
}