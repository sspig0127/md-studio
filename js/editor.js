/**
 * editor.js — EasyMDE 初始化與設定
 */
const Editor = (() => {
  let _easyMDE = null;
  let _onChange = null;

  const MERMAID_TEMPLATE = '```mermaid\nflowchart TD\n    A[開始] --> B{判斷}\n    B -->|是| C[執行]\n    B -->|否| D[結束]\n```\n';

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
        'togglePreview': null, // disable built-in
      },
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
    _easyMDE.value(content);
    _easyMDE.codemirror.clearHistory();
  }

  function focus() {
    if (_easyMDE) _easyMDE.codemirror.focus();
  }

  function instance() {
    return _easyMDE;
  }

  return { init, getValue, setValue, focus, instance };
})();
