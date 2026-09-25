/**
 * table.js — DOM builder for the conjugation table.
 * NEVER uses innerHTML with user data. All text via textContent / createElement.
 */
import { getLang, PRONOUN_MAP_ID } from './i18n.js';


/**
 * Safely render Arabic text with colored Tashkeel / Harakat spans
 * using DOM TextNodes and Spans (Zero innerHTML, 100% XSS safe).
 *
 * @param {string} text
 * @param {HTMLElement} container
 */
export function renderHarakatNode(text, container) {
  container.textContent = '';
  if (!text) return;

  const regex = /([\u064B-\u0652\u0670])/g;
  let lastIdx = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIdx) {
      container.appendChild(document.createTextNode(text.slice(lastIdx, match.index)));
    }
    const span = document.createElement('span');
    const ch = match[0];
    const code = ch.charCodeAt(0);
    let cls = 'h-fatha';
    if (code === 0x064E) cls = 'h-fatha';
    else if (code === 0x064F) cls = 'h-damma';
    else if (code === 0x0650) cls = 'h-kasra';
    else if (code === 0x0652) cls = 'h-sukun';
    else if (code === 0x0651) cls = 'h-shadda';
    else if (code === 0x064B || code === 0x064C || code === 0x064D) cls = 'h-tanwin';
    span.className = cls;
    span.textContent = ch;
    container.appendChild(span);
    lastIdx = regex.lastIndex;
  }
  if (lastIdx < text.length) {
    container.appendChild(document.createTextNode(text.slice(lastIdx)));
  }
}

/**
 * Build the full conjugation table DOM.
 * result = API "result" object: {"0":{headers}, "1":{row}, ...}
 * voiceFilter: "active" | "passive" | "all"
 * coloredHarakat: boolean
 *
 * @param {Object} result
 * @param {string} [voiceFilter="all"]
 * @param {boolean} [coloredHarakat=false]
 * @returns {HTMLElement}  .table-wrapper div
 */
export function buildTable(result, voiceFilter = 'all', coloredHarakat = false) {
  if (!result || Object.keys(result).length === 0) return null;

  const header  = result['0'] || {};
  const colKeys = Object.keys(header);       // ["0","1","2",...]

  // Split columns into active vs passive by tense name (skip '0' pronoun column)
  const activeColKeys  = [];
  const passiveColKeys = [];
  colKeys.forEach(k => {
    if (k === '0') return;
    const name = header[k] || '';
    if (name.includes('مجهول')) passiveColKeys.push(k);
    else activeColKeys.push(k);
  });

  // Decide which columns to show
  let shownColKeys;
  if (voiceFilter === 'passive' && passiveColKeys.length > 0) {
    shownColKeys = ['0', ...passiveColKeys];
  } else if (voiceFilter === 'active') {
    shownColKeys = ['0', ...activeColKeys];
  } else {
    shownColKeys = colKeys;
  }

  const wrapper = document.createElement('div');
  wrapper.className = 'table-wrapper';
  wrapper.setAttribute('role', 'region');
  wrapper.setAttribute('aria-label', 'جدول التصريف');
  wrapper.tabIndex = 0;

  const table = document.createElement('table');
  table.className = 'conj-table';
  if (coloredHarakat) table.classList.add('colored-harakat');
  table.dir = 'rtl';

  // ── THEAD ────────────────────────────────────────────────
  const thead = document.createElement('thead');
  const headerRow = document.createElement('tr');
  const isId = getLang() === 'id';

  shownColKeys.forEach(k => {
    const th = document.createElement('th');
    th.scope = 'col';
    if (k === '0' && isId) {
      th.textContent = 'Dhamir (الضمائر)';
    } else {
      th.textContent = header[k] || '';
    }
    headerRow.appendChild(th);
  });
  thead.appendChild(headerRow);
  table.appendChild(thead);

  // ── TBODY ────────────────────────────────────────────────
  const tbody = document.createElement('tbody');
  const rowKeys = Object.keys(result).filter(k => k !== '0');

  rowKeys.forEach((rk, idx) => {
    const rowData = result[rk];
    const tr = document.createElement('tr');

    shownColKeys.forEach(ck => {
      const td = document.createElement('td');
      const cellText = rowData[ck] ?? '';

      if (cellText === '') {
        td.classList.add('empty-cell');
        td.textContent = '—';
        td.setAttribute('aria-label', isId ? 'Tidak ada bentuk' : 'لا توجد صيغة');
      } else {
        let displayText = cellText;
        if (ck === '0' && isId) {
          const stripped = cellText.replace(/[\u064B-\u065F\u0670]/g, '').trim();
          displayText = PRONOUN_MAP_ID[cellText] || PRONOUN_MAP_ID[stripped] || cellText;
          td.textContent = displayText;
        } else if (coloredHarakat && ck !== '0') {
          renderHarakatNode(cellText, td);
        } else {
          td.textContent = displayText;
        }
        td.setAttribute('title', isId ? 'Klik untuk menyalin' : 'انقر للنسخ');
        td.setAttribute('role', 'button');
        td.tabIndex = 0;
        td.dataset.cell = cellText;          // picked up by event delegation
      }
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);
  wrapper.appendChild(table);
  return wrapper;
}

/**
 * Returns true if the result has any passive (مجهول) columns.
 * @param {Object} result
 */
export function hasPassive(result) {
  if (!result || !result['0']) return false;
  return Object.values(result['0']).some(v => v.includes('مجهول'));
}

/**
 * Generate CSV string from result object.
 * @param {Object} result
 * @returns {string}
 */
export function generateCSV(result) {
  if (!result) return '';
  let csv = '';
  const rowKeys = Object.keys(result).sort((a, b) => Number(a) - Number(b));
  rowKeys.forEach(rk => {
    const row = result[rk];
    const colKeys = Object.keys(row).sort((a, b) => Number(a) - Number(b));
    const line = colKeys.map(ck => {
      const val = (row[ck] || '').replace(/"/g, '""');
      return `"${val}"`;
    }).join(',');
    csv += line + '\r\n';
  });
  return csv;
}

/**
 * Download a string as a file.
 * @param {string} content
 * @param {string} filename
 * @param {string} mimeType
 */
export function downloadFile(content, filename, mimeType = 'text/csv;charset=utf-8;') {
  const BOM = '\uFEFF';  // UTF-8 BOM for Excel compatibility
  const blob = new Blob([BOM + content], { type: mimeType });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = filename;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
