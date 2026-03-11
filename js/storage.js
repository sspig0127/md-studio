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

  function _setStatus(state) {
    const el = document.getElementById('status-text');
    if (!el) return;
    el.className = state === 'saved' ? 'status-saved' : 'status-unsaved';
    el.textContent = I18n.t(state === 'saved' ? 'status.saved' : 'status.unsaved');
  }

  function _updateWordCount(text) {
    const words = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
    const chars = text.length;
    const wc = document.getElementById('word-count');
    const cc = document.getElementById('char-count');
    if (wc) wc.textContent = words;
    if (cc) cc.textContent = chars;
  }

  return { init, onContentChange, openFile, downloadFile };
})();
