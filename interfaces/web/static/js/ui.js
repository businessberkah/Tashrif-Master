/**
 * ui.js — UI state machine and settings for Asy-Syafee
 * Manages: loading / empty / error / done states, toast, settings popover.
 */
import { t } from './i18n.js';

// ── Settings (localStorage) ──────────────────────────────────────────────────
const SETTINGS_KEY = 'qutrub_settings';
const DEFAULT_SETTINGS = { fontSize: 100, coloredHarakat: false };

export function loadSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : { ...DEFAULT_SETTINGS };
  } catch { return { ...DEFAULT_SETTINGS }; }
}

export function saveSettings(settings) {
  try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)); } catch {}
}

export function applySettings(settings) {
  const scale = (settings.fontSize || 100) / 100;
  document.documentElement.style.setProperty('--table-scale', scale);

  const resultArea = document.getElementById('result-area');
  if (resultArea) {
    const isColored = !!settings.coloredHarakat;
    const tables = resultArea.querySelectorAll('.conj-table');
    tables.forEach(table => {
      table.classList.toggle('colored-harakat', isColored);
      const cells = table.querySelectorAll('tbody td[data-cell]');
      cells.forEach(td => {
        const text = td.dataset.cell;
        if (!text) return;
        if (isColored) {
          if (window.__qutrubTable?.renderHarakatNode) {
            window.__qutrubTable.renderHarakatNode(text, td);
          }
        } else {
          td.textContent = text;
        }
      });
    });
  }

  // Always update display controls
  const fv = document.getElementById('font-size-val');
  if (fv) fv.textContent = (settings.fontSize || 100) + '%';
  const toggle = document.getElementById('colored-harakat-toggle');
  if (toggle) toggle.checked = !!settings.coloredHarakat;
}



// ── Toast (aria-live) ─────────────────────────────────────────────────────────
let _toastTimer = null;

export function showToast(message) {
  let toast = document.getElementById('qutrub-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'qutrub-toast';
    toast.className = 'toast-banner';
    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-live', 'polite');
    toast.setAttribute('aria-atomic', 'true');
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add('visible');
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => toast.classList.remove('visible'), 2400);
}

// ── State machine ─────────────────────────────────────────────────────────────

function _getResultArea() {
  return document.getElementById('result-area');
}

/** Show loading skeleton */
export function setLoading() {
  const area = _getResultArea();
  if (!area) return;

  const container = document.createElement('div');
  container.className = 'state-container';

  const skelWrap = document.createElement('div');
  skelWrap.style.width = '100%';
  skelWrap.style.maxWidth = '600px';

  for (let r = 0; r < 6; r++) {
    const row = document.createElement('div');
    row.className = 'skeleton-row';
    const colCount = r === 0 ? 5 : 4;
    for (let c = 0; c < colCount; c++) {
      const cell = document.createElement('div');
      cell.className = 'skeleton-cell';
      if (c === 0) cell.style.flex = '0 0 80px';
      row.appendChild(cell);
    }
    skelWrap.appendChild(row);
  }

  const label = document.createElement('p');
  label.className = 'state-subtitle';
  label.textContent = t('stateLoading');


  container.appendChild(skelWrap);
  container.appendChild(label);
  area.textContent = '';
  area.appendChild(container);
}

/** Show empty-input state */
export function setEmpty() {
  _clearSuggest();
  const area = _getResultArea();
  if (!area) return;
  area.textContent = '';
  area.appendChild(_makeState(
    _pencilIcon(),
    t('stateEmptyTitle'),
    t('stateEmptySub')
  ));
}

/** Show invalid-verb state with optional suggestions */
export function setInvalid(suggest) {
  const area = _getResultArea();
  if (!area) return;
  area.textContent = '';
  area.appendChild(_makeState(
    _searchIcon(),
    t('stateInvalidTitle'),
    t('stateInvalidSub')
  ));
  _renderSuggest(suggest);
}

/** Show network error state */
export function setError(onRetry) {
  _clearSuggest();
  const area = _getResultArea();
  if (!area) return;
  area.textContent = '';

  const container = _makeState(
    _alertIcon(),
    t('stateErrorTitle'),
    t('stateErrorSub')
  );

  if (typeof onRetry === 'function') {
    const btn = document.createElement('button');
    btn.className = 'btn-pill-outline';
    btn.textContent = t('retryBtn');
    btn.addEventListener('click', onRetry);
    container.appendChild(btn);
  }
  area.appendChild(container);
}

/** Show full result: verb-info strip + suggest chips + voice tabs + table + toolbar */
export function setDone({ verbInfo, suggest, result, voiceFilter, settings, onCopyCell, onVoiceChange }) {
  const area = _getResultArea();
  if (!area) return;
  area.textContent = '';

  // Verb info strip
  if (verbInfo) {
    const strip = _buildVerbInfo(verbInfo);
    area.appendChild(strip);
  }

  // Suggestions
  _renderSuggest(suggest);

  // Voice tabs
  const { buildTable, hasPassive } = window.__qutrubTable;  // injected by app.js
  const showPassiveTab = hasPassive(result);
  if (showPassiveTab) {
    area.appendChild(_buildVoiceTabs(voiceFilter, onVoiceChange));
  }

  // Table
  const tableEl = buildTable(result, voiceFilter, settings?.coloredHarakat);
  if (tableEl) {
    // Event delegation for cell copy
    tableEl.addEventListener('click', e => {
      const td = e.target.closest('td[data-cell]');
      if (!td) return;
      _copyText(td.dataset.cell);
    });
    tableEl.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        const td = e.target.closest('td[data-cell]');
        if (td) { e.preventDefault(); _copyText(td.dataset.cell); }
      }
    });

    area.appendChild(tableEl);
  }

  // Toolbar
  area.appendChild(_buildToolbar(result));
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function _copyText(text) {
  navigator.clipboard.writeText(text).then(
    () => showToast(t('toastCopied') + text),
    () => showToast(t('toastCopyFail'))
  );
}

function _makeState(iconEl, title, subtitle) {
  const c = document.createElement('div');
  c.className = 'state-container';

  const iconWrap = document.createElement('div');
  iconWrap.className = 'state-icon';
  iconWrap.appendChild(iconEl);

  const t = document.createElement('p');
  t.className = 'state-title';
  t.textContent = title;

  const s = document.createElement('p');
  s.className = 'state-subtitle';
  s.textContent = subtitle;

  c.appendChild(iconWrap);
  c.appendChild(t);
  c.appendChild(s);
  return c;
}

function _buildVerbInfo(verbInfo) {
  const strip = document.createElement('div');
  strip.className = 'verb-info-strip';

  // Parse verbInfo string: "الفعل كَتَبَ - يَكْتُبُ فعل ثلاثي متعدي سالم"
  const parts = verbInfo.replace(/^الفعل\s*/u, '').trim().split(/\s+-\s+|\s{2,}/u);
  const verb   = parts[0] || '';
  const rest   = verbInfo;

  const verbSpan = document.createElement('span');
  verbSpan.className = 'verb-info-verb';
  verbSpan.textContent = verb;
  strip.appendChild(verbSpan);

  // Chips from remaining tokens
  const chipWrap = document.createElement('div');
  chipWrap.className = 'verb-info-chips';

  // Extract chip-worthy tokens
  const chipPatterns = [
    /فعل\s+(?:ثلاثي|رباعي|خماسي|سداسي|سباعي)/u,
    /(?:متعدي|لازم)/u,
    /(?:سالم|مضعف|مهموز|أجوف|ناقص|مثال|لفيف)/u,
  ];
  chipPatterns.forEach(pat => {
    const m = rest.match(pat);
    if (m) {
      const chip = document.createElement('span');
      chip.className = 'verb-info-chip';
      chip.textContent = m[0];
      chipWrap.appendChild(chip);
    }
  });

  strip.appendChild(chipWrap);
  return strip;
}

function _buildVoiceTabs(active, onVoiceChange) {
  const wrap = document.createElement('div');
  wrap.className = 'voice-tabs';
  wrap.setAttribute('role', 'tablist');
  wrap.setAttribute('aria-label', 'اختر الصيغة');

  const tabs = [
    { id: 'active',  key: 'voiceActive' },
    { id: 'passive', key: 'voicePassive' },
  ];
  tabs.forEach(tab => {
    const btn = document.createElement('button');
    btn.className = 'voice-tab-btn' + (tab.id === active ? ' active' : '');
    btn.setAttribute('role', 'tab');
    btn.setAttribute('aria-selected', tab.id === active ? 'true' : 'false');
    btn.textContent = t(tab.key);
    btn.dataset.voice = tab.id;
    btn.addEventListener('click', () => {
      if (typeof onVoiceChange === 'function') onVoiceChange(tab.id);
    });
    wrap.appendChild(btn);
  });
  return wrap;
}

function _buildToolbar(result) {
  const { generateCSV, downloadFile } = window.__qutrubTable;

  const bar = document.createElement('div');
  bar.className = 'result-toolbar no-print';

  const tools = [
    { labelKey: 'toolCopyCsv', icon: _copyIcon(), action: () => {
        const csv = generateCSV(result);
        navigator.clipboard.writeText(csv).then(
          () => showToast(t('toastCsvCopied')),
          () => showToast(t('toastCopyFail'))
        );
    }},
    { labelKey: 'toolDownloadCsv', icon: _downloadIcon(), action: () => {
        const csv = generateCSV(result);
        downloadFile(csv, 'asy-syafee.csv');
        showToast(t('toastCsvDownloading'));
    }},
    { labelKey: 'toolPrint', icon: _printIcon(), action: () => window.print() },
  ];

  tools.forEach(({ labelKey, icon, action }) => {
    const btn = document.createElement('button');
    btn.className = 'btn-pill-outline';
    btn.appendChild(icon);
    const span = document.createElement('span');
    span.textContent = t(labelKey);
    btn.appendChild(span);
    btn.addEventListener('click', action);
    bar.appendChild(btn);
  });

  return bar;
}

function _renderSuggest(suggest) {
  const area = document.getElementById('suggest-area');
  if (!area) return;
  area.textContent = '';

  if (!suggest || suggest.length === 0) return;

  const label = document.createElement('p');
  label.className = 'suggest-label';
  label.textContent = t('suggestLabel');

  const chips = document.createElement('div');
  chips.className = 'suggest-chips';

  suggest.forEach(s => {
    const chip = document.createElement('button');
    chip.className = 'chip';
    chip.type = 'button';
    chip.dataset.verb    = s.verb    || '';
    chip.dataset.haraka  = s.haraka  || 'فتحة';
    chip.dataset.trans   = s.transitive ? '1' : '0';

    const verbSpan = document.createElement('span');
    verbSpan.textContent = s.verb || '';
    const futureSpan = document.createElement('span');
    futureSpan.className = 'text-muted';
    futureSpan.style.fontSize = '0.85em';
    futureSpan.textContent = s.future ? ' · ' + s.future : '';

    chip.appendChild(verbSpan);
    chip.appendChild(futureSpan);
    chips.appendChild(chip);
  });

  area.appendChild(label);
  area.appendChild(chips);
}

function _clearSuggest() {
  const area = document.getElementById('suggest-area');
  if (area) area.textContent = '';
}

// ── Inline SVG icons (Lucide, 1.5px stroke) ──────────────────────────────────
function _icon(path, extra = '') {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', '18'); svg.setAttribute('height', '18');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('fill', 'none');
  svg.setAttribute('stroke', 'currentColor');
  svg.setAttribute('stroke-width', '1.5');
  svg.setAttribute('stroke-linecap', 'round');
  svg.setAttribute('stroke-linejoin', 'round');
  svg.setAttribute('aria-hidden', 'true');
  svg.innerHTML = path + extra;  // SVG path data only — safe (no user input)
  return svg;
}
function _pencilIcon()   { return _icon('<path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>'); }
function _searchIcon()   { return _icon('<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>'); }
function _alertIcon()    { return _icon('<path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" x2="12" y1="9" y2="13"/><line x1="12" x2="12.01" y1="17" y2="17"/>'); }
function _copyIcon()     { return _icon('<rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>'); }
function _downloadIcon() { return _icon('<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/>'); }
function _printIcon()    { return _icon('<polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect width="12" height="8" x="6" y="14"/>'); }
