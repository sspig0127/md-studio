/**
 * settings.js — 使用者設定管理
 * 提供 UI 讓使用者設定 Google Client ID，存入 localStorage。
 */

const Settings = (() => {
  const KEY_CLIENT_ID = 'md_google_client_id';

  function getClientId() {
    return localStorage.getItem(KEY_CLIENT_ID) || '';
  }

  function _setClientId(id) {
    localStorage.setItem(KEY_CLIENT_ID, id.trim());
  }

  function openModal() {
    const modal = document.getElementById('settings-modal');
    const input = document.getElementById('input-client-id');
    input.value = getClientId();
    _updateStatus();
    modal.hidden = false;
    input.focus();
  }

  function closeModal() {
    document.getElementById('settings-modal').hidden = true;
  }

  function _updateStatus() {
    const status = document.getElementById('settings-client-id-status');
    if (!status) return;
    const hasId = !!getClientId();
    status.textContent = I18n.t(hasId ? 'settings.cloud.status.set' : 'settings.cloud.status.unset');
    status.className = 'settings-status ' + (hasId ? 'status-ok' : 'status-warn');
  }

  function init() {
    // Close buttons
    document.getElementById('btn-settings-close').addEventListener('click', closeModal);
    document.getElementById('btn-settings-cancel').addEventListener('click', closeModal);

    // Click outside modal to close
    document.getElementById('settings-modal').addEventListener('click', (e) => {
      if (e.target.id === 'settings-modal') closeModal();
    });

    // Save
    document.getElementById('btn-settings-save').addEventListener('click', () => {
      const id = document.getElementById('input-client-id').value.trim();
      _setClientId(id);
      closeModal();
      // Re-initialize cloud with new Client ID
      if (typeof Cloud !== 'undefined') Cloud.reinit();
    });

    // Open modal from navbar + mobile drawer
    document.getElementById('btn-settings')?.addEventListener('click', (e) => {
      e.stopPropagation();
      openModal();
    });
    document.getElementById('md-settings')?.addEventListener('click', () => {
      openModal();
    });

    // Update status indicator when language changes
    document.addEventListener('langchange', _updateStatus);

    _updateStatus();
  }

  return { init, getClientId, openModal };
})();
