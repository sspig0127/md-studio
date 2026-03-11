# GitHub Copilot 專案指引 — md-studio

## 專案概述

**md-studio** 是一款純前端 PWA Markdown 編輯器，無需任何 build 步驟，所有第三方函式庫均打包於 `vendor/` 目錄。

- **線上網址**：https://sspig0127.github.io/md-studio/
- **架構**：Vanilla JavaScript（IIFE 模組模式）+ Pure CSS + Service Worker
- **無框架**：不使用 React / Vue / Node.js / npm

---

## 技術棧

| 用途 | 技術 |
|---|---|
| Markdown 編輯器 | EasyMDE（`vendor/easymde.min.js`） |
| Markdown 渲染 | marked.js（`vendor/marked.min.js`） |
| 圖表渲染 | Mermaid.js v10（`vendor/mermaid.min.js`） |
| 樣式 | Pure CSS，CSS 自訂屬性（`--color-*`） |
| 本機儲存 | localStorage + File API |
| 雲端 | Google Drive API v3 + OAuth2 |
| 離線支援 | Service Worker（`sw.js`） |
| 多語系 | 自製 i18n（JSON + `[data-i18n]` attribute） |

---

## 模組架構（js/）

每個模組為 IIFE，回傳公開 API，掛在全域變數：

```
app.js       — 主入口；Theme / Typo 模組；事件綁定；初始化順序
editor.js    — EasyMDE 初始化；setValue() 抑制 onChange 防 dirty
preview.js   — marked 渲染；mermaid 渲染（SVG 處理 + tooltip）；debounce 300ms
tabs.js      — 多分頁管理；localStorage md_tab_{id} + md_tabs_meta
storage.js   — 自動存檔（1s debounce）；開啟/下載 .md；beforeunload 保護
settings.js  — 設定 Modal；Google Client ID 讀寫 localStorage
cloud.js     — Google Drive OAuth2 登入/登出；開啟/儲存雲端 .md
i18n.js      — 載入 locales/*.json；更新 [data-i18n] 元素；語言偏好存 localStorage
```

**初始化順序**（app.js AppInit）：
Theme → Typo → I18n → Preview → Editor → Tabs → Storage → Settings → Cloud

---

## CSS 架構

```
css/main.css      — CSS 變數（7 種主題）、Navbar、Dropdown、Modal、StatusBar
css/editor.css    — EasyMDE 覆蓋、預覽 Markdown 樣式、5 種排版風格、Mermaid wrapper
css/tabs.css      — 分頁列樣式
css/responsive.css — RWD（≤767px 行動版）
```

### 佈景主題

透過 `<html data-theme="...">` 切換，共 7 種：

| key | 名稱 | 類型 |
|---|---|---|
| （無 attribute）| Dark Purple | 深色，預設 |
| `dark` | Dark | 深色 |
| `light` | Light | 淺色 |
| `nord` | Nord | 深色 |
| `solarized` | Solarized Light | 淺色 |
| `latte` | Catppuccin Latte | 淺色 |
| `rosepine` | Rosé Pine Dawn | 淺色 |

- 每個主題定義完整 `--color-*` 變數，包含 `--color-heading`（標題強調色）
- 淺色主題（light / solarized / latte / rosepine）Mermaid 使用 `'default'` theme；其餘用 `'dark'`
- 切換後呼叫 `location.reload()` 生效；SW network-first 確保重載取得最新 HTML

### 排版風格

透過 `#preview-content[data-typo="..."]` 切換，共 5 種：
`default`（無 attribute）/ `reading` / `compact` / `document` / `wide`

---

## Service Worker 策略（sw.js）

- **HTML 導航**（`navigate` mode）→ **Network-First**：確保 `location.reload()` 後取得最新 HTML
- **靜態資源**（JS / CSS / vendor）→ **Cache-First**：離線時仍可使用
- `CACHE_NAME` 升號時 `activate` 自動清除舊快取；`skipWaiting()` + `clients.claim()` 即時生效

> ⚠️ 修改任何靜態檔案後，**必須同步升級 `CACHE_NAME`**（目前為 `md-editor-v4`），否則使用者會看到舊版。

---

## 版本標記規則

每次功能變更需同步更新以下三處，格式為 `YYYY-MM-DD.流水號`：

1. `js/app.js` — `const APP_VERSION = '...'`
2. `index.html` — `<meta name="app-version" content="...">`
3. `index.html` — `<div class="modal-version">v...</div>`

目前版本：`2026-03-11.6`

---

## 重要實作細節

### 下拉選單定位
所有 `.dropdown-menu` 使用 `position: fixed`，由 JS `toggleDropdown()` 動態計算 `top` / `right`，避免被 EasyMDE 的 stacking context 遮擋。

### Mermaid SVG 處理流程
1. `mermaid.render()` 生成 SVG
2. 移除 `height` 屬性（`style.height = 'auto'`）
3. 移除所有 `clip-path` 防文字截斷
4. `pre.replaceWith(wrapper)` 插入 DOM
5. `requestAnimationFrame` 後展開過窄節點框（`getBoundingClientRect()` 需 live DOM）

### i18n 與 ▾ 箭頭
下拉按鈕的翻譯文字用 `<span data-i18n="...">` 包裹，▾ 箭頭在 span 外，避免 `textContent` 替換時消失。

### localStorage Key 命名
| Key | 用途 |
|---|---|
| `md_theme` | 佈景主題 |
| `md_typo` | 排版風格 |
| `md_tab_{id}` | 各分頁內容 |
| `md_tabs_meta` | 分頁順序與當前選中 |
| `lang` | 介面語言 |
| `md_google_client_id` | Google OAuth Client ID |

---

## 多語系（locales/）

支援：`zh-TW`（預設）/ `en` / `vi`

新增 UI 文字時，三個 JSON 檔均需同步新增對應 key。
HTML 用 `data-i18n="key"` 標記靜態文字，JS 用 `I18n.t('key')` 取得翻譯。

---

## 開發注意事項

1. **不使用 CDN**：所有第三方資源必須在 `vendor/` 目錄，確保完整離線可用
2. **不引入 build 工具**：直接編輯原始碼，瀏覽器直接載入
3. **修改後驗證版本**：於瀏覽器 Console 確認 `[md-studio] vXXXX-XX-XX.X` 版本正確
4. **行動版測試**：Chrome DevTools 模擬 375px（iPhone SE）確認 Navbar 無溢出
5. **SW 快取**：部署後若舊版殘留，於 DevTools → Application → Service Workers → Unregister，再硬重整

---

## 檔案結構

```
Markdown_webapp/
├── index.html              # 主頁面（唯一 HTML）
├── manifest.json           # PWA manifest
├── sw.js                   # Service Worker
├── ARCHITECTURE.md         # 架構說明
├── TESTING.md              # 測試指南（供部署人員使用）
├── css/
│   ├── main.css            # 全域樣式、7 種主題 CSS 變數
│   ├── editor.css          # 編輯器覆蓋、5 種排版風格
│   ├── tabs.css            # 分頁樣式
│   └── responsive.css      # RWD
├── js/
│   ├── app.js              # 主入口（Theme / Typo / 事件）
│   ├── editor.js           # EasyMDE
│   ├── preview.js          # 渲染（marked + mermaid + tooltip）
│   ├── tabs.js             # 多分頁
│   ├── storage.js          # 存檔 / 開啟 / 下載
│   ├── settings.js         # 設定 Modal
│   ├── cloud.js            # Google Drive
│   └── i18n.js             # 多語系
├── locales/
│   ├── zh-TW.json
│   ├── en.json
│   └── vi.json
├── vendor/                 # 本地第三方套件（離線必須）
└── assets/                 # favicon、PWA 圖示
```
