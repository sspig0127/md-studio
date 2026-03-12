/**
 * editor.js — EasyMDE 初始化與設定
 */
const Editor = (() => {
  let _easyMDE = null;
  let _onChange = null;

  const MERMAID_TEMPLATE = '```mermaid\nflowchart TD\n    A[開始] --> B{判斷}\n    B -->|是| C[執行]\n    B -->|否| D[結束]\n```\n';

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
      'fullscreen',
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
