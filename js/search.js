/* ============================================
   search.js — Search / Replace for spigot-md
   Uses CodeMirror's built-in getSearchCursor()
   ============================================ */

'use strict';

const Search = (() => {
  let _cm = null;        // CodeMirror instance
  let _panel = null;     // #search-panel element
  let _marks = [];       // TextMarker[] for all highlights
  let _results = [];     // [{from, to}] positions of all matches
  let _current = -1;     // index into _results for current match
  let _currentMark = null;

  // Options
  let _caseSensitive = false;
  let _useRegex = false;
  let _wholeWord = false;

  // ---- DOM refs ----
  let _inputEl, _replaceInputEl, _countEl, _replaceRow;
  let _optCase, _optRegex, _optWord;

  // ---- Init ----
  function init(cm) {
    _cm = cm;
    _panel = document.getElementById('search-panel');
    if (!_panel) return;

    _inputEl       = document.getElementById('search-input');
    _replaceInputEl= document.getElementById('replace-input');
    _countEl       = document.getElementById('search-count');
    _replaceRow    = document.getElementById('replace-row');
    _optCase       = document.getElementById('search-opt-case');
    _optRegex      = document.getElementById('search-opt-regex');
    _optWord       = document.getElementById('search-opt-word');

    // Bind UI events
    _inputEl.addEventListener('input', _onQueryChange);
    _inputEl.addEventListener('keydown', _onInputKey);
    _replaceInputEl.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') close();
    });

    document.getElementById('search-next').addEventListener('click', next);
    document.getElementById('search-prev').addEventListener('click', prev);
    document.getElementById('search-close').addEventListener('click', close);
    document.getElementById('btn-replace').addEventListener('click', replaceOne);
    document.getElementById('btn-replace-all').addEventListener('click', replaceAll);

    _optCase.addEventListener('click', () => { _caseSensitive = !_caseSensitive; _syncOpts(); _onQueryChange(); });
    _optRegex.addEventListener('click', () => { _useRegex = !_useRegex; _syncOpts(); _onQueryChange(); });
    _optWord.addEventListener('click', () => { _wholeWord = !_wholeWord; _syncOpts(); _onQueryChange(); });
  }

  // ---- Open / Close ----
  function open(withReplace) {
    if (!_panel) return;
    _panel.removeAttribute('hidden');
    if (withReplace) {
      _replaceRow.removeAttribute('hidden');
    }
    // Pre-fill with selection if any
    const sel = _cm.getSelection();
    if (sel && sel.length < 200) {
      _inputEl.value = sel;
    }
    _inputEl.focus();
    _inputEl.select();
    _onQueryChange();
  }

  function close() {
    if (!_panel) return;
    _panel.setAttribute('hidden', '');
    _replaceRow.setAttribute('hidden', '');
    _clearMarks();
    _results = [];
    _current = -1;
    _countEl.textContent = '';
    _panel.classList.remove('no-match');
    _cm.focus();
  }

  function isOpen() {
    return _panel && !_panel.hidden;
  }

  // ---- Query change → re-run search ----
  function _onQueryChange() {
    _clearMarks();
    _results = [];
    _current = -1;
    _panel.classList.remove('no-match');

    const query = _inputEl.value;
    if (!query) { _countEl.textContent = ''; return; }

    const re = _buildRegex(query);
    if (!re) { _countEl.textContent = ''; return; }

    // Walk all text with getSearchCursor
    const cursor = _cm.getSearchCursor(re, { line: 0, ch: 0 }, { caseFold: !_caseSensitive });
    _cm.operation(() => {
      while (cursor.findNext()) {
        const from = cursor.from();
        const to   = cursor.to();
        _results.push({ from, to });
        const mark = _cm.markText(from, to, { className: 'cm-search-match' });
        _marks.push(mark);
      }
    });

    if (_results.length === 0) {
      _panel.classList.add('no-match');
      _countEl.textContent = '0/0';
      return;
    }

    // Jump to nearest match to cursor
    const pos = _cm.getCursor();
    _current = _nearestIndex(pos);
    _highlightCurrent();
    _updateCount();
  }

  // ---- Navigation ----
  function next() {
    if (_results.length === 0) return;
    _current = (_current + 1) % _results.length;
    _highlightCurrent();
    _updateCount();
  }

  function prev() {
    if (_results.length === 0) return;
    _current = (_current - 1 + _results.length) % _results.length;
    _highlightCurrent();
    _updateCount();
  }

  function _highlightCurrent() {
    if (_currentMark) { _currentMark.clear(); _currentMark = null; }
    if (_current < 0 || _current >= _results.length) return;
    const { from, to } = _results[_current];
    _currentMark = _cm.markText(from, to, { className: 'cm-search-match-current' });
    _cm.scrollIntoView({ from, to }, 60);
  }

  function _updateCount() {
    if (_results.length === 0) { _countEl.textContent = '0/0'; return; }
    _countEl.textContent = `${_current + 1}/${_results.length}`;
  }

  // ---- Replace ----
  function replaceOne() {
    if (_current < 0 || _current >= _results.length) return;
    const replacement = _replaceInputEl.value;
    const { from, to } = _results[_current];
    _cm.replaceRange(replacement, from, to);
    // Re-run search after replacement
    _onQueryChange();
  }

  function replaceAll() {
    if (_results.length === 0) return;
    const replacement = _replaceInputEl.value;
    _cm.operation(() => {
      // Iterate in reverse to preserve positions
      for (let i = _results.length - 1; i >= 0; i--) {
        const { from, to } = _results[i];
        _cm.replaceRange(replacement, from, to);
      }
    });
    _onQueryChange();
  }

  // ---- Helpers ----
  function _buildRegex(query) {
    try {
      let source = _useRegex ? query : _escapeRegex(query);
      if (_wholeWord) source = `\\b${source}\\b`;
      return new RegExp(source, _caseSensitive ? 'g' : 'gi');
    } catch (e) {
      return null; // invalid regex
    }
  }

  function _escapeRegex(s) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function _nearestIndex(pos) {
    let best = 0;
    let bestDist = Infinity;
    for (let i = 0; i < _results.length; i++) {
      const d = _lineDist(pos, _results[i].from);
      if (d < bestDist) { bestDist = d; best = i; }
    }
    return best;
  }

  function _lineDist(a, b) {
    const dl = Math.abs(a.line - b.line);
    const dc = Math.abs(a.ch - b.ch);
    return dl * 10000 + dc;
  }

  function _clearMarks() {
    if (_currentMark) { _currentMark.clear(); _currentMark = null; }
    _cm.operation(() => {
      _marks.forEach(m => m.clear());
    });
    _marks = [];
  }

  function _syncOpts() {
    _optCase.classList.toggle('active', _caseSensitive);
    _optRegex.classList.toggle('active', _useRegex);
    _optWord.classList.toggle('active', _wholeWord);
  }

  function _onInputKey(e) {
    if (e.key === 'Enter') {
      e.shiftKey ? prev() : next();
      e.preventDefault();
    } else if (e.key === 'Escape') {
      close();
    } else if (e.key === 'F3') {
      e.shiftKey ? prev() : next();
      e.preventDefault();
    }
  }

  return { init, open, close, isOpen, next, prev, replaceOne, replaceAll };
})();
