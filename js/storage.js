/**
 * storage.js — 本機儲存：localStorage 暫存、開啟 .md、下載 .md
 */
const Storage = (() => {
  let _autoSaveTimer = null;
  let _isDirty = false;

  function init() {
    // Warn on unload if dirty tabs exist
    window.addEventListener('beforeunload', (e) => {
      const dirty = Tabs.allTabs().some(t => t.isDirty);
      if (dirty) {
        e.preventDefault();
        e.returnValue = I18n.t('confirm.close.unsaved');
      }
    });
  }

  // Called on every editor change
  function onContentChange(content) {
    _isDirty = true;
    _setStatus('unsaved');
    _updateWordCount(content);
    // Auto-save after 1 second of inactivity
    clearTimeout(_autoSaveTimer);
    _autoSaveTimer = setTimeout(() => autoSave(content), 1000);
    // Also schedule preview
    Preview.scheduleRender(content);
  }

  function autoSave(content) {
    const tab = Tabs.activeTab();
    if (!tab) return;
    Tabs.saveContent(tab.id, content);
    _setStatus('saved');
    _isDirty = false;
  }

  // Open local .md file
  function openFile(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target.result;
      const tab = Tabs.createTab(file.name, content);
      Preview.render(content);
    };
    reader.onerror = () => alert(I18n.t('error.file.read'));
    reader.readAsText(file, 'UTF-8');
  }

  // Download current tab as .md
  function downloadFile() {
    const tab = Tabs.activeTab();
    if (!tab) return;
    const content = Editor.getValue();
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = tab.filename.endsWith('.md') ? tab.filename : tab.filename + '.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    // Mark saved after download
    Tabs.saveContent(tab.id, content);
    _setStatus('saved');
  }

  // Export current tab preview as standalone .html file
  function exportHTML() {
    const tab = Tabs.activeTab();
    if (!tab) return;
    // Ensure preview reflects latest editor content
    Preview.render(Editor.getValue());
    const filename = tab.filename.replace(/\.(md|markdown|txt)$/i, '') + '.html';
    const body = document.getElementById('preview-content').innerHTML;
    const title = tab.filename.replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const html = `<!DOCTYPE html>
<html lang="zh-TW">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;max-width:800px;margin:0 auto;padding:32px 24px;line-height:1.6;color:#24292f}
    h1,h2,h3,h4,h5,h6{margin-top:24px;margin-bottom:8px;font-weight:600;line-height:1.25}
    h1,h2{border-bottom:1px solid #d0d7de;padding-bottom:.3em}
    h1{font-size:2em}h2{font-size:1.5em}h3{font-size:1.25em}
    pre{background:#f6f8fa;border-radius:6px;padding:16px;overflow-x:auto}
    code{font-family:ui-monospace,SFMono-Regular,monospace;font-size:85%}
    p code,li code{background:#f6f8fa;padding:2px 6px;border-radius:4px}
    blockquote{border-left:4px solid #d0d7de;padding-left:16px;color:#57606a;margin:0 0 16px}
    table{border-collapse:collapse;width:100%;margin-bottom:16px}
    th,td{border:1px solid #d0d7de;padding:6px 13px}
    th{background:#f6f8fa;font-weight:600}
    tr:nth-child(even){background:#f6f8fa}
    img{max-width:100%;height:auto}
    a{color:#0969da;text-decoration:none}a:hover{text-decoration:underline}
    hr{border:none;border-top:1px solid #d0d7de;margin:24px 0}
    ul,ol{padding-left:2em}li+li{margin-top:.25em}
  </style>
</head>
<body>
${body}
</body>
</html>`;
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function _setStatus(state) {
    const el = document.getElementById('status-text');
    if (!el) return;
    el.className = state === 'saved' ? 'status-saved' : 'status-unsaved';
    el.textContent = I18n.t(state === 'saved' ? 'status.saved' : 'status.unsaved');
  }

  function _updateWordCount(text) {
    const words = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
    const chars = text.length;
    const lines = text === '' ? 0 : text.split('\n').length;
    const wc = document.getElementById('word-count');
    const cc = document.getElementById('char-count');
    const lc = document.getElementById('line-count');
    if (wc) wc.textContent = words;
    if (cc) cc.textContent = chars;
    if (lc) lc.textContent = lines;
  }

  return { init, onContentChange, updateStats: _updateWordCount, openFile, downloadFile, exportHTML };
})();
