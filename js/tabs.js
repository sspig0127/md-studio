/**
 * tabs.js — 多檔案分頁管理
 */
const Tabs = (() => {
  const META_KEY = 'md_tabs_meta';
  let _tabs = [];
  let _activeId = null;
  let _onSwitch = null; // cb(tab)
  let _tabsListEl = null;

  function init(tabsListEl, onSwitchCb) {
    _tabsListEl = tabsListEl;
    _onSwitch = onSwitchCb;
    _loadMeta();
    if (_tabs.length === 0) _createTab();
    _render();
    _switchTo(_activeId || _tabs[0].id);
  }

  // ---- PUBLIC ----

  function createTab(filename = null, content = '') {
    const tab = _createTab(filename, content);
    _render();
    _switchTo(tab.id);
    return tab;
  }

  function closeTab(id) {
    const tab = _find(id);
    if (!tab) return;
    if (tab.isDirty && !confirm(I18n.t('tabs.close.confirm'))) return;
    localStorage.removeItem(_storageKey(tab.id));
    _tabs = _tabs.filter(t => t.id !== id);
    if (_tabs.length === 0) _createTab();
    _render();
    if (_activeId === id) _switchTo(_tabs[_tabs.length - 1].id);
    _saveMeta();
  }

  function switchTo(id) {
    _switchTo(id);
  }

  function setDirty(id, dirty) {
    const tab = _find(id);
    if (!tab || tab.isDirty === dirty) return;
    tab.isDirty = dirty;
    _renderTab(tab);
  }

  function setFilename(id, name) {
    const tab = _find(id);
    if (!tab) return;
    tab.filename = name;
    _renderTab(tab);
    _saveMeta();
  }

  function setCloudFileId(id, fileId) {
    const tab = _find(id);
    if (!tab) return;
    tab.cloudFileId = fileId;
    _saveMeta();
  }

  function saveContent(id, content) {
    const tab = _find(id);
    if (!tab) return;
    tab.content = content;
    localStorage.setItem(_storageKey(tab.id), content);
    tab.isDirty = false;
    _renderTab(tab);
    _saveMeta();
  }

  function activeTab() {
    return _find(_activeId);
  }

  function allTabs() {
    return [..._tabs];
  }

  // ---- PRIVATE ----

  function _createTab(filename = null, content = '') {
    const id = 'tab_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6);
    const tab = {
      id,
      filename: filename || I18n.t('tabs.untitled'),
      content,
      isDirty: false,
      cloudFileId: null,
    };
    _tabs.push(tab);
    localStorage.setItem(_storageKey(id), content);
    _saveMeta();
    return tab;
  }

  function _switchTo(id) {
    // Save current editor content before switching (skip if switching to the same tab,
    // which happens on initial load when Editor is still empty)
    if (_activeId && _onSwitch && _activeId !== id) {
      const cur = _find(_activeId);
      if (cur) {
        cur.content = Editor.getValue();
        localStorage.setItem(_storageKey(cur.id), cur.content);
      }
    }
    _activeId = id;
    const tab = _find(id);
    if (!tab) return;
    // Load content into editor
    Editor.setValue(tab.content);
    if (_onSwitch) _onSwitch(tab);
    _render();
  }

  function _find(id) {
    return _tabs.find(t => t.id === id) || null;
  }

  function _storageKey(id) {
    return `md_tab_${id}`;
  }

  function _saveMeta() {
    const meta = {
      activeId: _activeId,
      tabs: _tabs.map(t => ({
        id: t.id,
        filename: t.filename,
        cloudFileId: t.cloudFileId,
      })),
    };
    localStorage.setItem(META_KEY, JSON.stringify(meta));
  }

  function _loadMeta() {
    try {
      const raw = localStorage.getItem(META_KEY);
      if (!raw) return;
      const meta = JSON.parse(raw);
      _activeId = meta.activeId || null;
      _tabs = (meta.tabs || []).map(m => ({
        id: m.id,
        filename: m.filename,
        content: localStorage.getItem(_storageKey(m.id)) || '',
        isDirty: false,
        cloudFileId: m.cloudFileId || null,
      }));
    } catch (e) {
      console.warn('[Tabs] Failed to load meta:', e);
      _tabs = [];
    }
  }

  function _render() {
    if (!_tabsListEl) return;
    _tabsListEl.innerHTML = '';
    _tabs.forEach(tab => {
      const el = _makeTabEl(tab);
      _tabsListEl.appendChild(el);
    });
  }

  function _renderTab(tab) {
    const existing = _tabsListEl.querySelector(`[data-tab-id="${tab.id}"]`);
    if (!existing) return;
    const fresh = _makeTabEl(tab);
    existing.replaceWith(fresh);
  }

  function _makeTabEl(tab) {
    const el = document.createElement('div');
    el.className = 'tab-item' + (tab.id === _activeId ? ' active' : '');
    el.setAttribute('data-tab-id', tab.id);

    const name = document.createElement('span');
    name.className = 'tab-name';
    name.textContent = tab.filename;
    name.title = tab.filename;
    el.appendChild(name);

    if (tab.isDirty) {
      const dot = document.createElement('span');
      dot.className = 'tab-dirty';
      dot.textContent = '●';
      dot.title = I18n.t('status.unsaved');
      el.appendChild(dot);
    }

    const closeBtn = document.createElement('button');
    closeBtn.className = 'tab-close';
    closeBtn.textContent = '×';
    closeBtn.title = 'Close';
    closeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      closeTab(tab.id);
    });
    el.appendChild(closeBtn);

    el.addEventListener('click', () => switchTo(tab.id));
    return el;
  }

  return { init, createTab, closeTab, switchTo, setDirty, setFilename, saveContent, setCloudFileId, activeTab, allTabs };
})();
