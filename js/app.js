/**
 * app.js — 主程式入口
 * 初始化所有模組，綁定 UI 事件
 */

const APP_VERSION = '2026-03-11.6';
console.info(`%c[md-studio] v${APP_VERSION}`, 'color:#7c6af7;font-weight:bold;font-size:13px;');

const SAMPLE_CONTENT = `# Markdown + Mermaid 語法範例

> 歡迎使用 Markdown 編輯器！本範例涵蓋常用語法，可直接在左側編輯區修改練習。

---

## 1. 標題

用 \`#\` 數量決定層級（H1～H6）：

\`\`\`
# 一級標題
## 二級標題
### 三級標題
\`\`\`

---

## 2. 文字樣式

**粗體** — 兩個星號：\`**粗體**\`

*斜體* — 一個星號：\`*斜體*\`

~~刪除線~~ — 兩個波浪號：\`~~刪除線~~\`

\`行內程式碼\` — 反引號：\` \`程式碼\` \`

---

## 3. 清單

無序清單（\`-\` 開頭）：

- 蘋果
- 香蕉
  - 芭蕉（縮排兩格成為子項目）
- 橘子

有序清單（數字 + 點）：

1. 第一步：安裝工具
2. 第二步：撰寫內容
3. 第三步：匯出文件

---

## 4. 引用

> 用 \`>\` 開頭表示引用區塊。
> 可以跨越多行，也可以巢狀：
>
> > 這是巢狀引用。

---

## 5. 連結與圖片

[連結文字](https://github.com/sspig0127/md-studio)

![圖片替代文字](https://placehold.co/300x80/7c6af7/ffffff?text=Markdown+Editor)

---

## 6. 程式碼區塊

行內程式碼：\`console.log('Hello')\`

程式碼區塊（三個反引號 + 語言名稱）：

\`\`\`javascript
function greet(name) {
  return \`Hello, \${name}!\`;
}
console.log(greet('World'));
\`\`\`

\`\`\`python
def greet(name):
    return f"Hello, {name}!"

print(greet("World"))
\`\`\`

---

## 7. 表格

| 語法             | 效果       | 說明             |
| ---------------- | ---------- | ---------------- |
| \`**文字**\`     | **粗體**   | 兩個星號包圍     |
| \`*文字*\`       | *斜體*     | 一個星號包圍     |
| \`~~文字~~\`     | ~~刪除線~~ | 兩個波浪號包圍   |
| \`# 標題\`       | 標題       | 1～6 個 # 符號   |

---

## 8. Mermaid 流程圖

\`\`\`mermaid
graph TD
    A[開始] --> B{是否已登入?}
    B -->|是| C[進入首頁]
    B -->|否| D[前往登入頁]
    D --> E[輸入帳號密碼]
    E --> F{驗證成功?}
    F -->|是| C
    F -->|否| G[顯示錯誤訊息]
    G --> D
    C --> H[結束]
\`\`\`

---

## 9. Mermaid 循序圖

\`\`\`mermaid
sequenceDiagram
    participant 使用者
    participant 前端
    participant 後端
    participant 資料庫

    使用者->>前端: 點擊登入
    前端->>後端: POST /api/login
    後端->>資料庫: 查詢帳號
    資料庫-->>後端: 回傳使用者資料
    後端-->>前端: 回傳 JWT Token
    前端-->>使用者: 登入成功，跳轉首頁
\`\`\`

---

## 10. Mermaid 圓餅圖

\`\`\`mermaid
pie title 常用程式語言比例
    "JavaScript" : 38
    "Python" : 28
    "TypeScript" : 20
    "Go" : 8
    "其他" : 6
\`\`\`

---

## 11. Mermaid 甘特圖

\`\`\`mermaid
gantt
    title 專案開發排程
    dateFormat  YYYY-MM-DD
    section 規劃
    需求分析       :done,    a1, 2025-01-01, 7d
    架構設計       :done,    a2, after a1,  5d
    section 開發
    前端開發       :active,  b1, after a2, 14d
    後端開發       :         b2, after a2, 14d
    section 測試
    整合測試       :         c1, after b1, 7d
    上線部署       :         c2, after c1, 2d
\`\`\`

---

*恭喜！你已瀏覽完所有範例。試著在左側修改內容，觀察右側預覽即時變化吧！*
`;

const Theme = (() => {
  const KEY = 'md_theme';

  function apply(theme) {
    localStorage.setItem(KEY, theme);
    document.querySelectorAll('[data-theme-btn]').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.themeBtn === theme);
    });
  }

  function activate(theme) {
    if (theme === 'purple') {
      document.documentElement.removeAttribute('data-theme');
    } else {
      document.documentElement.setAttribute('data-theme', theme);
    }
  }

  function init() {
    const saved = localStorage.getItem(KEY) || 'purple';
    activate(saved);
    document.querySelectorAll('[data-theme-btn]').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.themeBtn === saved);
      btn.addEventListener('click', () => apply(btn.dataset.themeBtn));
    });
    document.getElementById('btn-apply-theme')
      ?.addEventListener('click', () => location.reload());
  }

  return { init, apply, activate };
})();

function closeAllDropdowns() {
  document.querySelectorAll('.dropdown-menu.open').forEach(m => m.classList.remove('open'));
}

function closeMobileDrawer() {
  const drawer = document.getElementById('mobile-drawer');
  if (drawer) drawer.hidden = true;
}

const Typo = (() => {
  const KEY = 'md_typo';

  function apply(style) {
    const el = document.getElementById('preview-content');
    if (!el) return;
    if (style === 'default') {
      el.removeAttribute('data-typo');
    } else {
      el.setAttribute('data-typo', style);
    }
    localStorage.setItem(KEY, style);
    document.querySelectorAll('[data-typo-btn]').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.typoBtn === style);
    });
  }

  function init() {
    const saved = localStorage.getItem(KEY) || 'default';
    apply(saved);
    document.querySelectorAll('[data-typo-btn]').forEach(btn => {
      btn.addEventListener('click', () => {
        apply(btn.dataset.typoBtn);
        closeAllDropdowns();
        closeMobileDrawer();
      });
    });
  }

  return { init };
})();

(async function AppInit() {
  function toggleDropdown(menuId) {
    const menu = document.getElementById(menuId);
    const isOpen = menu.classList.contains('open');
    closeAllDropdowns();
    if (!isOpen) {
      // 用 fixed 定位：取觸發按鈕的位置計算下拉選單座標
      const btn = menu.previousElementSibling;
      const rect = btn.getBoundingClientRect();
      menu.style.top   = (rect.bottom + 4) + 'px';
      menu.style.left  = 'auto';
      menu.style.right = (window.innerWidth - rect.right) + 'px';
      menu.classList.add('open');
    }
  }

  function setMode(mode) {
    document.body.classList.toggle('preview-mode', mode === 'preview');
    document.getElementById('btn-mode-edit').classList.toggle('active', mode === 'edit');
    document.getElementById('btn-mode-preview').classList.toggle('active', mode === 'preview');
  }

  // 1. Theme（最先套用，確保 EasyMDE 以正確顏色初始化）
  Theme.init();

  // 2. Typography
  Typo.init();

  // 3. i18n
  await I18n.init();

  // 4. Preview
  Preview.init(document.getElementById('preview-content'));

  // 5. Editor
  Editor.init('editor', (content) => {
    // Notify storage (auto-save + word count)
    Storage.onContentChange(content);
    // Mark current tab dirty
    const tab = Tabs.activeTab();
    if (tab) Tabs.setDirty(tab.id, true);
  });

  // 6. Tabs
  Tabs.init(
    document.getElementById('tabs-list'),
    (tab) => {
      // On tab switch: render preview for the new tab's content
      Preview.render(tab.content);
      document.title = tab.filename + ' — ' + I18n.t('nav.title');
    }
  );

  // 7. Storage
  Storage.init();

  // 8. Settings
  Settings.init();

  // 9. Cloud (non-blocking)
  Cloud.init();

  // ---- BIND EVENTS ----

  // New tab
  document.getElementById('btn-tab-new').addEventListener('click', () => Tabs.createTab());
  document.getElementById('btn-new')?.addEventListener('click', () => Tabs.createTab());
  document.getElementById('md-new')?.addEventListener('click', () => {
    Tabs.createTab();
    closeMobileDrawer();
  });

  // Sample file
  document.getElementById('btn-sample')?.addEventListener('click', () =>
    Tabs.createTab('markdown-sample.md', SAMPLE_CONTENT)
  );
  document.getElementById('md-sample')?.addEventListener('click', () => {
    Tabs.createTab('markdown-sample.md', SAMPLE_CONTENT);
    closeMobileDrawer();
  });

  // Open file
  document.getElementById('btn-open').addEventListener('click', () =>
    document.getElementById('file-input').click()
  );
  document.getElementById('md-open')?.addEventListener('click', () => {
    document.getElementById('file-input').click();
    closeMobileDrawer();
  });
  document.getElementById('file-input').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) Storage.openFile(file);
    e.target.value = ''; // Reset so same file can be re-opened
  });

  // Download
  document.getElementById('btn-download').addEventListener('click', () => Storage.downloadFile());
  document.getElementById('md-download')?.addEventListener('click', () => {
    Storage.downloadFile();
    closeMobileDrawer();
  });

  // Cloud buttons
  document.getElementById('btn-cloud-login').addEventListener('click', () => Cloud.signIn());
  document.getElementById('btn-cloud-logout').addEventListener('click', () => Cloud.signOut());
  document.getElementById('btn-cloud-open').addEventListener('click', () => Cloud.openFromDrive());
  document.getElementById('btn-cloud-save').addEventListener('click', () => Cloud.saveToDrive());
  document.getElementById('md-cloud-login')?.addEventListener('click', () => { Cloud.signIn(); closeMobileDrawer(); });
  document.getElementById('md-cloud-open')?.addEventListener('click', () => { Cloud.openFromDrive(); closeMobileDrawer(); });
  document.getElementById('md-cloud-save')?.addEventListener('click', () => { Cloud.saveToDrive(); closeMobileDrawer(); });

  // Language buttons (desktop dropdown + mobile drawer)
  document.querySelectorAll('[data-lang]').forEach(btn => {
    btn.addEventListener('click', () => {
      I18n.load(btn.dataset.lang);
      closeAllDropdowns();
      closeMobileDrawer();
    });
  });

  // Dropdown toggles
  document.getElementById('btn-cloud').addEventListener('click', (e) => {
    e.stopPropagation();
    toggleDropdown('cloud-menu');
  });
  document.getElementById('btn-lang').addEventListener('click', (e) => {
    e.stopPropagation();
    toggleDropdown('lang-menu');
  });
  document.getElementById('btn-typo')?.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleDropdown('typo-menu');
  });

  // Mobile menu
  document.getElementById('btn-mobile-menu').addEventListener('click', (e) => {
    e.stopPropagation();
    const drawer = document.getElementById('mobile-drawer');
    drawer.hidden = !drawer.hidden;
  });

  // Mobile mode toggle
  document.getElementById('btn-mode-edit').addEventListener('click', () => setMode('edit'));
  document.getElementById('btn-mode-preview').addEventListener('click', () => {
    setMode('preview');
    Preview.render(Editor.getValue());
  });

  // Close dropdowns/drawer on outside click
  document.addEventListener('click', () => {
    closeAllDropdowns();
    closeMobileDrawer();
  });

  // Initial preview render
  const activeTab = Tabs.activeTab();
  if (activeTab && activeTab.content) {
    Preview.render(activeTab.content);
  }

  // Network status: disable cloud when offline
  window.addEventListener('offline', () => {
    ['btn-cloud-login','btn-cloud-open','btn-cloud-save','md-cloud-login','md-cloud-open','md-cloud-save']
      .forEach(id => {
        const el = document.getElementById(id);
        if (el) { el.disabled = true; el.title = I18n.t('offline.cloud.disabled'); }
      });
  });
  window.addEventListener('online', () => Cloud.init());

})();
