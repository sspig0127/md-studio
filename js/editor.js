/**
 * editor.js — EasyMDE 初始化與設定
 */
const Editor = (() => {
  let _easyMDE = null;
  let _onChange = null;

  const MERMAID_TEMPLATE = '```mermaid\nflowchart TD\n    A[開始] --> B{判斷}\n    B -->|是| C[執行]\n    B -->|否| D[結束]\n```\n';

  let _panelJustOpened = false;

  // ---- 快捷鍵浮動面板 ----

  function _createShortcutsPanel() {
    const SHORTCUTS = [
      { key: 'Ctrl + B',         i18n: 'shortcuts.bold' },
      { key: 'Ctrl + I',         i18n: 'shortcuts.italic' },
      { key: 'Ctrl + K',         i18n: 'shortcuts.link' },
      { sep: true },
      { key: 'Ctrl + Alt + 1',   i18n: 'shortcuts.h1' },
      { key: 'Ctrl + Alt + 2',   i18n: 'shortcuts.h2' },
      { key: 'Ctrl + Alt + 3',   i18n: 'shortcuts.h3' },
      { key: 'Ctrl + Alt + 4',   i18n: 'shortcuts.h4' },
      { sep: true },
      { key: 'Ctrl + Shift + X', i18n: 'shortcuts.strikethrough' },
      { key: 'Ctrl + Alt + M',   i18n: 'shortcuts.mermaid' },
      { sep: true },
      { key: 'Ctrl + Z',         i18n: 'shortcuts.undo' },
      { key: 'Ctrl + Y',         i18n: 'shortcuts.redo' },
      { key: 'F11',              i18n: 'shortcuts.fullscreen' },
    ];

    const panel = document.createElement('div');
    panel.id = 'shortcuts-panel';
    panel.className = 'shortcuts-panel';
    panel.hidden = true;

    // Header（可拖移）
    const header = document.createElement('div');
    header.className = 'shortcuts-panel-header';

    const titleEl = document.createElement('span');
    titleEl.setAttribute('data-i18n', 'shortcuts.title');
    titleEl.textContent = I18n.t('shortcuts.title');

    const closeBtn = document.createElement('button');
    closeBtn.className = 'shortcuts-panel-close';
    closeBtn.textContent = '×';
    closeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      panel.hidden = true;
    });

    header.appendChild(titleEl);
    header.appendChild(closeBtn);

    // Body（快捷鍵表格）
    const body = document.createElement('div');
    body.className = 'shortcuts-panel-body';
    const table = document.createElement('table');

    SHORTCUTS.forEach(s => {
      const tr = document.createElement('tr');
      if (s.sep) {
        tr.className = 'shortcuts-sep';
        tr.innerHTML = '<td colspan="2"></td>';
      } else {
        const actionTd = document.createElement('td');
        actionTd.setAttribute('data-i18n', s.i18n);
        actionTd.textContent = I18n.t(s.i18n);

        const keyTd = document.createElement('td');
        keyTd.className = 'shortcuts-key';
        keyTd.innerHTML = s.key.split(' + ')
          .map(k => `<kbd>${k}</kbd>`)
          .join('<span class="shortcuts-plus">+</span>');

        tr.appendChild(actionTd);
        tr.appendChild(keyTd);
      }
      table.appendChild(tr);
    });

    body.appendChild(table);
    panel.appendChild(header);
    panel.appendChild(body);
    document.body.appendChild(panel);

    // 語言切換時更新面板文字
    document.addEventListener('langchange', () => {
      panel.querySelectorAll('[data-i18n]').forEach(el => {
        el.textContent = I18n.t(el.dataset.i18n);
      });
    });

    // 拖移
    _makePanelDraggable(panel, header, closeBtn);

    // 點面板外部自動關閉
    document.addEventListener('click', (e) => {
      if (_panelJustOpened) { _panelJustOpened = false; return; }
      if (!panel.hidden && !panel.contains(e.target)) panel.hidden = true;
    });

    return panel;
  }

  function _makePanelDraggable(panel, handle, excludeEl) {
    handle.addEventListener('mousedown', (e) => {
      if (e.target === excludeEl) return;
      const rect = panel.getBoundingClientRect();
      const startX = e.clientX, startY = e.clientY;
      const startLeft = rect.left, startTop = rect.top;

      const onMove = (e) => {
        panel.style.left  = (startLeft + e.clientX - startX) + 'px';
        panel.style.top   = (startTop  + e.clientY - startY) + 'px';
        panel.style.right = 'auto';
      };
      const onUp = () => {
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onUp);
      };
      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
      e.preventDefault();
    });
  }

  // ---- 標題 toggle / Mermaid 插入 ----

  // 切換指定層級的標題（toggle：有則移除，無則加上）
  function _toggleHeading(cm, level) {
    const prefix = '#'.repeat(level) + ' ';
    const line = cm.getCursor().line;
    const text = cm.getLine(line);
    const clean = text.replace(/^#{1,6} /, '');
    const next = text.startsWith(prefix) ? clean : prefix + clean;
    cm.replaceRange(next, { line, ch: 0 }, { line, ch: text.length });
  }

  // 插入 Mermaid 區塊至游標位置
  function _insertMermaid(cm) {
    cm.replaceRange(MERMAID_TEMPLATE, cm.getCursor());
  }

  function init(textareaId, onChangeCb) {
    _onChange = onChangeCb;

    _easyMDE = new EasyMDE({
      element: document.getElementById(textareaId),
      autofocus: true,
      spellChecker: false,
      autosave: { enabled: false },
      placeholder: I18n.t('editor.placeholder'),
      status: false, // We have our own status bar
      toolbar: _buildToolbar(),
      previewRender: () => '', // Disable built-in preview (we use our own pane)
      renderingConfig: { singleLineBreaks: false },
      shortcuts: {
        'togglePreview':     null,          // 停用內建預覽切換
        'toggleHeading1':    'Ctrl-Alt-1',  // H1
        'toggleHeading2':    'Ctrl-Alt-2',  // H2
        'toggleHeading3':    'Ctrl-Alt-3',  // H3
        'toggleStrikethrough': 'Shift-Ctrl-X', // 刪除線
      },
    });

    // 自訂快捷鍵（EasyMDE 未提供的功能）
    _easyMDE.codemirror.addKeyMap({
      'Ctrl-Alt-4': (cm) => _toggleHeading(cm, 4), // H4
      'Ctrl-Alt-M': (cm) => _insertMermaid(cm),     // 插入 Mermaid
    });

    // 建立快捷鍵浮動面板
    _createShortcutsPanel();

    _easyMDE.codemirror.on('change', () => {
      if (_onChange) _onChange(_easyMDE.value());
    });

    // Update placeholder on language change
    document.addEventListener('langchange', () => {
      const ph = _easyMDE.codemirror.getOption('placeholder');
      const newPh = I18n.t('editor.placeholder');
      if (ph !== newPh) {
        _easyMDE.codemirror.setOption('placeholder', newPh);
      }
    });

    return _easyMDE;
  }

  function _buildToolbar() {
    return [
      'bold', 'italic', 'strikethrough', '|',
      'heading-1', 'heading-2', 'heading-3', '|',
      'unordered-list', 'ordered-list', 'checklist', '|',
      'link', 'image', 'table', '|',
      'code', 'quote', '|',
      {
        name: 'mermaid',
        action: (editor) => {
          const cm = editor.codemirror;
          const cursor = cm.getCursor();
          cm.replaceRange(MERMAID_TEMPLATE, cursor);
        },
        className: 'fa fa-project-diagram',
        title: 'Insert Mermaid Diagram',
      },
      '|',
      'undo', 'redo', '|',
      'fullscreen', '|',
      {
        name: 'shortcuts',
        action: () => {
          const panel = document.getElementById('shortcuts-panel');
          panel.hidden = !panel.hidden;
          if (!panel.hidden) _panelJustOpened = true;
        },
        className: 'fa fa-keyboard',
        title: I18n.t('shortcuts.title'),
      },
    ];
  }

  function getValue() {
    return _easyMDE ? _easyMDE.value() : '';
  }

  function setValue(content) {
    if (!_easyMDE) return;
    const saved = _onChange;
    _onChange = null;
    _easyMDE.value(content);
    _easyMDE.codemirror.clearHistory();
    _onChange = saved;
  }

  function focus() {
    if (_easyMDE) _easyMDE.codemirror.focus();
  }

  function instance() {
    return _easyMDE;
  }

  return { init, getValue, setValue, focus, instance };
})();
