/**
 * app.js — Asy-Syafee entry point (ES module)
 * Wires DOM events -> api.js -> table.js -> ui.js
 * All text via textContent. No innerHTML on user data.
 */

import { conjugate, getRandomVerb, currentRequestId } from './api.js';
import * as Table from './table.js';
import {
  loadSettings, saveSettings, applySettings,
  showToast,
  setLoading, setEmpty, setError, setInvalid, setDone,
} from './ui.js';
import { initLang, setLang, getLang, t, DICTIONARY } from './i18n.js';

// Expose table helpers so ui.js can use them (avoids circular imports)
window.__qutrubTable = Table;

// ── State ─────────────────────────────────────────────────────────────────────
let _lastResult   = null;
let _voiceFilter  = 'active';
let _settings     = loadSettings();
let _isSubmitting = false;

// ── DOM refs ──────────────────────────────────────────────────────────────────
let inputField, futureTypeSelect, voiceSegmented, submitBtn;

// ── Init ──────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  inputField       = document.getElementById('verb-input');
  futureTypeSelect = document.getElementById('future-type-select');
  voiceSegmented   = document.getElementById('voice-segmented');
  submitBtn        = document.getElementById('conjugate-btn');

  // Init language (loads from localStorage, defaults to 'id')
  const lang = initLang();
  _applyLangToDOM(lang);
  _syncLangBtns(lang);

  // Apply persisted settings
  applySettings(_settings);

  // Read URL params and auto-run
  const params    = new URLSearchParams(location.search);
  const verbParam = params.get('verb') || '';
  const harakaParam = params.get('haraka') || '';
  const transParam  = params.get('trans') || '';

  if (verbParam && inputField) {
    inputField.value = verbParam;
    if (harakaParam && futureTypeSelect) {
      const map = { a: 'فتحة', u: 'ضمة', i: 'كسرة', فتحة: 'فتحة', ضمة: 'ضمة', كسرة: 'كسرة' };
      const h = map[harakaParam] || harakaParam;
      futureTypeSelect.value = h;
    }
    if (transParam === '0') { _setVoice('intransitive'); }
    _submit();
  } else {
    setEmpty();
  }

  // Event delegation
  document.body.addEventListener('click', _handleBodyClick);
  document.body.addEventListener('keydown', _handleBodyKeydown);

  // Enter key on input
  if (inputField) {
    inputField.addEventListener('keydown', e => {
      if (e.key === 'Enter') { e.preventDefault(); _submit(); }
    });
  }

  // Navbar search icon
  const searchBtn = document.querySelector('[data-action="search"]');
  if (searchBtn) {
    searchBtn.addEventListener('click', () => {
      if (inputField) {
        inputField.focus();
        inputField.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        location.href = '/';
      }
    });
  }

  // Mobile hamburger
  const hamburger  = document.querySelector('.navbar-hamburger');
  const sheet      = document.getElementById('nav-sheet');
  const sheetClose = document.getElementById('nav-sheet-close');
  if (hamburger && sheet) {
    hamburger.addEventListener('click', () => {
      sheet.classList.toggle('open');
      hamburger.setAttribute('aria-expanded', sheet.classList.contains('open'));
    });
  }
  if (sheetClose && sheet) {
    sheetClose.addEventListener('click', () => sheet.classList.remove('open'));
  }
  if (sheet) {
    sheet.addEventListener('click', e => {
      if (e.target === sheet) sheet.classList.remove('open');
    });
  }

  // Settings popover
  const settingsBtn   = document.querySelector('[data-action="settings"]');
  const settingsPop   = document.getElementById('settings-popover');
  const fontInc       = document.getElementById('font-size-inc');
  const fontDec       = document.getElementById('font-size-dec');
  const coloredToggle = document.getElementById('colored-harakat-toggle');
  const resetBtn      = document.getElementById('settings-reset');

  if (settingsBtn && settingsPop) {
    settingsBtn.addEventListener('click', e => {
      e.stopPropagation();
      settingsPop.classList.toggle('open');
    });
    document.addEventListener('click', e => {
      if (!settingsPop.contains(e.target) && e.target !== settingsBtn) {
        settingsPop.classList.remove('open');
      }
    });
    settingsPop.addEventListener('click', e => e.stopPropagation());
  }
  if (fontInc) fontInc.addEventListener('click', () => {
    _changeFontSize(10);
    showToast(t('settingsFontSize') + ': ' + _settings.fontSize + '%');
  });
  if (fontDec) fontDec.addEventListener('click', () => {
    _changeFontSize(-10);
    showToast(t('settingsFontSize') + ': ' + _settings.fontSize + '%');
  });
  if (coloredToggle) {
    coloredToggle.addEventListener('change', () => {
      _settings.coloredHarakat = coloredToggle.checked;
      saveSettings(_settings);
      applySettings(_settings);
      showToast(t('settingsColorTashkeel') + ': ' + (coloredToggle.checked ? '✓' : '✗'));
    });
  }
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      _settings = { fontSize: 100, coloredHarakat: false };
      saveSettings(_settings);
      applySettings(_settings);
      showToast(t('settingsReset') + ' ✓');
    });
  }

  // Advanced options collapsible
  const advToggle = document.getElementById('advanced-toggle');
  const advBody   = document.getElementById('advanced-body');
  if (advToggle && advBody) {
    advToggle.addEventListener('click', () => {
      const open = advBody.classList.toggle('open');
      advToggle.setAttribute('aria-expanded', open);
    });
  }
});

// ── Language Switcher ─────────────────────────────────────────────────────────
function _handleBodyClick(e) {
  // Language buttons
  const langBtn = e.target.closest('[data-lang-btn]');
  if (langBtn) {
    const lang = langBtn.dataset.langBtn;
    const newLang = setLang(lang);
    _applyLangToDOM(newLang);
    _syncLangBtns(newLang);
    // Re-render result if there is one
    if (_lastResult) {
      setDone({
        verbInfo: _lastVerbInfo,
        suggest: [],
        result: _lastResult,
        voiceFilter: _voiceFilter,
        settings: _settings,
        onCopyCell: null,
        onVoiceChange: v => { _voiceFilter = v; _rerenderTable(); },
      });
      applySettings(_settings);
    }
    return;
  }

  // Submit button
  if (e.target.closest('#conjugate-btn')) {
    e.preventDefault();
    _submit();
    return;
  }
  // Hero CTA
  if (e.target.closest('[data-action="start"]')) {
    e.preventDefault();
    inputField?.focus();
    inputField?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }
  // Example verb chip
  const chip = e.target.closest('[data-example-verb]');
  if (chip) {
    const v = chip.dataset.exampleVerb;
    if (v && inputField) {
      inputField.value = v;
      inputField.focus();
      _submit();
    }
    return;
  }
  // Suggestion chip
  const sugChip = e.target.closest('[data-verb][data-haraka]');
  if (sugChip) {
    const verb   = sugChip.dataset.verb;
    const haraka = sugChip.dataset.haraka;
    const trans  = sugChip.dataset.trans !== '0';
    if (verb && inputField) {
      inputField.value = verb;
      if (futureTypeSelect) futureTypeSelect.value = haraka;
      _submitWith({ text: verb, future_type: haraka, transitive: trans, all: true });
    }
    return;
  }
  // Voice segmented control
  const segBtn = e.target.closest('.segmented-btn[data-trans]');
  if (segBtn) {
    document.querySelectorAll('.segmented-btn[data-trans]').forEach(b => b.classList.remove('active'));
    segBtn.classList.add('active');
    return;
  }
  // Voice tab
  const tabBtn = e.target.closest('.voice-tab-btn[data-voice]');
  if (tabBtn) {
    _voiceFilter = tabBtn.dataset.voice;
    _rerenderTable();
    return;
  }
  // Random verb
  if (e.target.closest('[data-action="random"]')) {
    _fetchRandom();
    return;
  }
}

function _handleBodyKeydown(e) {
  if ((e.key === 'Enter' || e.key === ' ') && e.target.closest('[data-example-verb]')) {
    e.preventDefault();
    e.target.click();
  }
}

// ── Apply i18n translations to the DOM ───────────────────────────────────────
function _applyLangToDOM(lang) {
  const dict = DICTIONARY[lang] || DICTIONARY.id;

  // data-i18n: textContent
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    if (dict[key] !== undefined) el.textContent = dict[key];
  });

  // data-i18n-html: innerHTML (only safe static strings — no user input)
  document.querySelectorAll('[data-i18n-html]').forEach(el => {
    const key = el.dataset.i18nHtml;
    if (dict[key] !== undefined) el.innerHTML = dict[key];
  });

  // data-i18n-placeholder: input placeholder
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.dataset.i18nPlaceholder;
    if (dict[key] !== undefined) el.placeholder = dict[key];
  });

  // Rotating arc badge text
  const arcText = document.getElementById('arc-badge-text');
  if (arcText && dict.arcBadgeText) arcText.textContent = dict.arcBadgeText;

  // Page title
  const titleEl = document.getElementById('page-title');
  if (titleEl) {
    const verb = titleEl.dataset.verb;
    if (verb) {
      titleEl.textContent = `Asy-Syafee | ${lang === 'ar' ? 'تصريف الفعل' : 'Konjugasi'} ${verb}`;
    } else {
      titleEl.textContent = lang === 'ar'
        ? 'الشافعي: تصريف الأفعال العربية'
        : 'Asy-Syafee: Konjugasi Kata Kerja Bahasa Arab';
    }
  }
}

function _syncLangBtns(lang) {
  document.querySelectorAll('[data-lang-btn]').forEach(btn => {
    const isActive = btn.dataset.langBtn === lang;
    btn.classList.toggle('active', isActive);
    btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
  });
}

// ── Core submit ───────────────────────────────────────────────────────────────
let _lastVerbInfo = '';

async function _submit() {
  if (!inputField) return;
  const text = inputField.value.trim();
  if (!text) { setEmpty(); return; }
  await _submitWith({ text, all: _getAll(), future_type: _getFutureType(), transitive: _getTransitive(), ..._getTenseFilters() });
}

async function _submitWith(params) {
  if (_isSubmitting) return;
  _isSubmitting = true;

  setLoading();
  _updateURL(params.text, params.future_type, params.transitive);

  try {
    const { data, id } = await conjugate(params);
    if (id !== currentRequestId()) return;

    const result   = data.result || {};
    const suggest  = data.suggest || [];
    const verbInfo = (data.verb_info || '').trim();

    if (!result || Object.keys(result).length === 0) {
      setInvalid(suggest);
    } else {
      _lastResult   = result;
      _lastVerbInfo = verbInfo;
      _voiceFilter  = Table.hasPassive(result) ? 'active' : 'all';
      setDone({
        verbInfo,
        suggest,
        result,
        voiceFilter: _voiceFilter,
        settings: _settings,
        onCopyCell: null,
        onVoiceChange: v => { _voiceFilter = v; _rerenderTable(); },
      });
      applySettings(_settings);

      // Update page title with verb
      const titleEl = document.getElementById('page-title');
      if (titleEl) {
        const lang = getLang();
        titleEl.textContent = `Asy-Syafee | ${lang === 'ar' ? 'تصريف الفعل' : 'Konjugasi'} ${params.text}`;
        titleEl.dataset.verb = params.text;
      }
    }
  } catch {
    setError(() => _submit());
  } finally {
    _isSubmitting = false;
  }
}

async function _fetchRandom() {
  try {
    const verb = await getRandomVerb();
    if (verb && inputField) {
      inputField.value = verb;
      _submit();
    }
  } catch { showToast(t('toastRandomFail')); }
}

function _rerenderTable() {
  if (!_lastResult) return;
  const area = document.getElementById('result-area');
  if (!area) return;

  const oldTabs  = area.querySelector('.voice-tabs');
  const oldTable = area.querySelector('.table-wrapper');

  const hasP = Table.hasPassive(_lastResult);
  if (hasP) {
    const newTabs = _buildVoiceTabsEl(_voiceFilter);
    if (oldTabs) oldTabs.replaceWith(newTabs);
  }

  const newTable = Table.buildTable(_lastResult, _voiceFilter);
  if (newTable && oldTable) {
    newTable.addEventListener('click', e => {
      const td = e.target.closest('td[data-cell]');
      if (td) _copyText(td.dataset.cell);
    });
    newTable.addEventListener('keydown', e => {
      if ((e.key === 'Enter' || e.key === ' ') && e.target.dataset?.cell) {
        e.preventDefault();
        _copyText(e.target.dataset.cell);
      }
    });
    if (_settings.coloredHarakat) {
      newTable.querySelector('.conj-table')?.classList.add('colored-harakat');
    }
    oldTable.replaceWith(newTable);
  }
}

function _buildVoiceTabsEl(active) {
  const wrap = document.createElement('div');
  wrap.className = 'voice-tabs';
  wrap.setAttribute('role', 'tablist');
  wrap.setAttribute('aria-label', 'اختر الصيغة');
  [{ id: 'active', key: 'voiceActive' }, { id: 'passive', key: 'voicePassive' }]
    .forEach(tab => {
      const btn = document.createElement('button');
      btn.className = 'voice-tab-btn' + (tab.id === active ? ' active' : '');
      btn.setAttribute('role', 'tab');
      btn.setAttribute('aria-selected', tab.id === active ? 'true' : 'false');
      btn.textContent = t(tab.key);
      btn.dataset.voice = tab.id;
      wrap.appendChild(btn);
    });
  return wrap;
}

function _copyText(text) {
  navigator.clipboard.writeText(text).then(
    () => showToast(t('toastCopied') + text),
    () => showToast(t('toastCopyFail'))
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function _getFutureType() { return futureTypeSelect?.value || 'فتحة'; }
function _getTransitive() {
  const active = document.querySelector('.segmented-btn.active[data-trans]');
  return active ? active.dataset.trans !== '0' : true;
}
function _getAll() {
  const allChk = document.getElementById('all-checkbox');
  return allChk ? allChk.checked : true;
}
function _getTenseFilters() {
  return {
    past:         document.getElementById('past-checkbox')?.checked         ?? false,
    future:       document.getElementById('future-checkbox')?.checked       ?? false,
    imperative:   document.getElementById('imperative-checkbox')?.checked   ?? false,
    passive:      document.getElementById('passive-checkbox')?.checked      ?? false,
    future_moode: document.getElementById('future-moode-checkbox')?.checked ?? false,
    confirmed:    document.getElementById('confirmed-checkbox')?.checked    ?? false,
  };
}
function _setVoice(v) {
  document.querySelectorAll('.segmented-btn[data-trans]').forEach(b => {
    b.classList.toggle('active', b.dataset.trans === (v === 'intransitive' ? '0' : '1'));
  });
}
function _changeFontSize(delta) {
  _settings.fontSize = Math.max(70, Math.min(140, _settings.fontSize + delta));
  saveSettings(_settings);
  applySettings(_settings);
}
function _updateURL(verb, haraka, trans) {
  const harakaMap = { فتحة: 'a', ضمة: 'u', كسرة: 'i' };
  const h = harakaMap[haraka] || haraka || 'a';
  const t = trans ? '1' : '0';
  const url = `${location.pathname}?verb=${encodeURIComponent(verb)}&haraka=${h}&trans=${t}`;
  if (history.replaceState) history.replaceState(null, '', url);
}
