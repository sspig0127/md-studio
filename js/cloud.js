/**
 * cloud.js — Google Drive API 整合
 *
 * Google Client ID 現在可透過網頁介面的「設定」頁面輸入，
 * 無需修改此程式碼。
 *
 * 設定步驟：
 * 1. 前往 https://console.cloud.google.com
 * 2. 建立專案 → 啟用 Google Drive API
 * 3. 建立 OAuth 2.0 Client ID（Web application）
 * 4. 在 Authorized JavaScript origins 加入你的網站網址
 * 5. 點選畫面右上角「⚙ 設定」按鈕，貼入 Client ID 並儲存
 */

const Cloud = (() => {
  const SCOPES = 'https://www.googleapis.com/auth/drive.file';
  const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest';

  let _isSignedIn = false;
  let _tokenClient = null;
  let _gapiInited = false;
  let _gisInited = false;

  function init() {
    if (!navigator.onLine) {
      _setCloudButtonsState(false);
      return;
    }
    const clientId = Settings.getClientId();
    if (!clientId) {
      console.warn('[Cloud] Google Client ID not configured. Open Settings to enable cloud features.');
      _setCloudButtonsState(false);
      return;
    }
    _loadGapi(clientId);
  }

  // Re-initialize after user updates Client ID in Settings
  function reinit() {
    const clientId = Settings.getClientId();
    if (!clientId || !navigator.onLine) {
      _setCloudButtonsState(false);
      return;
    }
    if (_gapiInited && _gisInited) {
      // Scripts already loaded — just recreate token client with new ID
      _tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: SCOPES,
        callback: _handleTokenResponse,
      });
      _maybeEnable();
    } else {
      _loadGapi(clientId);
    }
  }

  function _loadGapi(clientId) {
    // Load gapi
    const gapiScript = document.createElement('script');
    gapiScript.src = 'https://apis.google.com/js/api.js';
    gapiScript.onload = () => {
      gapi.load('client', async () => {
        await gapi.client.init({ discoveryDocs: [DISCOVERY_DOC] });
        _gapiInited = true;
        _maybeEnable();
      });
    };
    gapiScript.onerror = () => console.warn('[Cloud] Failed to load gapi');
    document.head.appendChild(gapiScript);

    // Load GIS
    const gisScript = document.createElement('script');
    gisScript.src = 'https://accounts.google.com/gsi/client';
    gisScript.onload = () => {
      _tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: SCOPES,
        callback: _handleTokenResponse,
      });
      _gisInited = true;
      _maybeEnable();
    };
    gisScript.onerror = () => console.warn('[Cloud] Failed to load GIS');
    document.head.appendChild(gisScript);
  }

  function _maybeEnable() {
    if (_gapiInited && _gisInited) {
      document.getElementById('btn-cloud-login').disabled = false;
      document.getElementById('md-cloud-login').disabled = false;
    }
  }

  function _handleTokenResponse(resp) {
    if (resp.error) {
      alert(I18n.t('cloud.login.error'));
      return;
    }
    _isSignedIn = true;
    _updateSignedInUI(true);
  }

  function signIn() {
    if (!_gisInited) return;
    if (gapi.client.getToken() === null) {
      _tokenClient.requestAccessToken({ prompt: 'consent' });
    } else {
      _tokenClient.requestAccessToken({ prompt: '' });
    }
  }

  function signOut() {
    const token = gapi.client.getToken();
    if (token) {
      google.accounts.oauth2.revoke(token.access_token);
      gapi.client.setToken('');
    }
    _isSignedIn = false;
    _updateSignedInUI(false);
  }

  async function openFromDrive() {
    if (!_isSignedIn) { signIn(); return; }
    try {
      const res = await gapi.client.drive.files.list({
        q: "mimeType='text/markdown' or fileExtension='md'",
        fields: 'files(id, name)',
        pageSize: 20,
      });
      const files = res.result.files;
      if (!files || files.length === 0) {
        alert('Google Drive 中沒有找到 .md 檔案');
        return;
      }
      // Simple picker dialog
      const names = files.map((f, i) => `${i + 1}. ${f.name}`).join('\n');
      const choice = prompt(`${I18n.t('cloud.open.title')}\n\n${names}\n\n請輸入編號：`);
      const idx = parseInt(choice, 10) - 1;
      if (isNaN(idx) || idx < 0 || idx >= files.length) return;
      const file = files[idx];
      const content = await _downloadFile(file.id);
      const tab = Tabs.createTab(file.name, content);
      Tabs.setCloudFileId(tab.id, file.id);
      Preview.render(content);
    } catch (e) {
      console.error('[Cloud] Open error:', e);
      alert(I18n.t('cloud.save.error'));
    }
  }

  async function saveToDrive() {
    if (!_isSignedIn) { signIn(); return; }
    const tab = Tabs.activeTab();
    if (!tab) return;
    const content = Editor.getValue();
    try {
      if (tab.cloudFileId) {
        await _updateFile(tab.cloudFileId, content);
      } else {
        const fileId = await _createFile(tab.filename, content);
        tab.cloudFileId = fileId;
      }
      Tabs.saveContent(tab.id, content);
      alert(I18n.t('cloud.save.success'));
    } catch (e) {
      console.error('[Cloud] Save error:', e);
      alert(I18n.t('cloud.save.error'));
    }
  }

  async function _downloadFile(fileId) {
    const res = await gapi.client.drive.files.get({
      fileId,
      alt: 'media',
    });
    return res.body;
  }

  async function _createFile(name, content) {
    const filename = name.endsWith('.md') ? name : name + '.md';
    const boundary = '-------314159265358979323846';
    const metadata = JSON.stringify({ name: filename, mimeType: 'text/markdown' });
    const body = [
      `--${boundary}`,
      'Content-Type: application/json; charset=UTF-8',
      '',
      metadata,
      `--${boundary}`,
      'Content-Type: text/markdown',
      '',
      content,
      `--${boundary}--`,
    ].join('\r\n');

    const res = await gapi.client.request({
      path: '/upload/drive/v3/files',
      method: 'POST',
      params: { uploadType: 'multipart' },
      headers: { 'Content-Type': `multipart/related; boundary="${boundary}"` },
      body,
    });
    return res.result.id;
  }

  async function _updateFile(fileId, content) {
    await gapi.client.request({
      path: `/upload/drive/v3/files/${fileId}`,
      method: 'PATCH',
      params: { uploadType: 'media' },
      headers: { 'Content-Type': 'text/markdown' },
      body: content,
    });
  }

  function _updateSignedInUI(signedIn) {
    const loginBtns = [document.getElementById('btn-cloud-login'), document.getElementById('md-cloud-login')];
    const logoutBtn = document.getElementById('btn-cloud-logout');
    const openBtns  = [document.getElementById('btn-cloud-open'),  document.getElementById('md-cloud-open')];
    const saveBtns  = [document.getElementById('btn-cloud-save'),  document.getElementById('md-cloud-save')];

    loginBtns.forEach(b => { if (b) b.style.display = signedIn ? 'none' : ''; });
    if (logoutBtn) logoutBtn.style.display = signedIn ? '' : 'none';
    openBtns.forEach(b => { if (b) b.disabled = !signedIn; });
    saveBtns.forEach(b => { if (b) b.disabled = !signedIn; });

    if (signedIn) alert(I18n.t('cloud.login.success'));
  }

  function _setCloudButtonsState(enabled) {
    ['btn-cloud-login','btn-cloud-open','btn-cloud-save','md-cloud-login','md-cloud-open','md-cloud-save']
      .forEach(id => {
        const el = document.getElementById(id);
        if (el) {
          el.disabled = !enabled;
          if (!enabled) el.title = I18n.t('offline.cloud.disabled');
        }
      });
  }

  return { init, reinit, signIn, signOut, openFromDrive, saveToDrive };
})();
