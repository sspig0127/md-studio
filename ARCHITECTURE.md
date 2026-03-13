# Markdown Web App — 架構規劃文件

## 專案目標
打造一個**純前端、無需後端伺服器**的 Markdown 編輯器 Web App，支援：
- 桌機雙欄（編輯＋即時預覽）
- 手機單欄（切換模式）
- Mermaid 流程圖渲染
- 本機檔案開啟 / 匯出下載
- 中英文介面切換

---

## 技術選型

| 功能 | 技術 | 引入方式 |
|---|---|---|
| Markdown 編輯器 | EasyMDE | **本地 vendor/**（離線必須） |
| Markdown 渲染 | marked.js | **本地 vendor/** |
| Mermaid 圖表 | mermaid.js v10 | **本地 vendor/** |
| 樣式框架 | 無框架，純 CSS | 自撰 |
| 響應式 | CSS media query | 自撰 |
| 多語言 | 自製 i18n（JSON + JS） | 本地 locales/ |
| 本機儲存 | localStorage + File API | 瀏覽器原生 API |
| 雲端儲存 | Google Drive JS SDK | **本地 vendor/**（離線快取） |
| 離線支援 | PWA：Service Worker + manifest.json | 自撰 |
| 打包工具 | 無（不需要 Node.js / npm） | — |

> ⚠️ **所有第三方套件必須下載到本地 `vendor/` 目錄**，不依賴 CDN，確保無網路環境可完整使用。

---

## 專案檔案結構

```
Markdown_webapp/
├── index.html              # 主頁面（唯一 HTML）
├── manifest.json           # PWA manifest
├── sw.js                   # Service Worker（HTML network-first / 靜態 cache-first）
├── css/
│   ├── main.css            # 全域樣式、CSS 變數（7 種主題）
│   ├── editor.css          # 編輯器客製化樣式、5 種排版風格
│   ├── tabs.css            # 多分頁樣式
│   └── responsive.css      # RWD media query
├── js/
│   ├── version.js          # 唯一版本來源（APP_VERSION），sw.js 與 app.js 共用
│   ├── app.js              # 主程式入口；Theme / Typo 模組、事件綁定
│   ├── editor.js           # EasyMDE 初始化與設定
│   ├── preview.js          # 預覽區渲染（marked + mermaid + tooltip）
│   ├── tabs.js             # 多檔案分頁管理
│   ├── storage.js          # localStorage、開啟/下載 .md
│   ├── settings.js         # 設定 Modal（Google Client ID）
│   ├── cloud.js            # Google Drive API 整合
│   ├── i18n.js             # 多語言切換邏輯
│   ├── search.js           # 搜尋 / 取代功能
│   └── tour.js             # 新手導覽 Onboarding Tour
├── locales/
│   ├── zh-TW.json          # 繁體中文
│   ├── en.json             # 英文
│   └── vi.json             # 越南文
├── vendor/                 # 所有第三方套件（本地，離線可用）
│   ├── easymde.min.js
│   ├── easymde.min.css
│   ├── marked.min.js
│   └── mermaid.min.js
└── assets/
    ├── favicon.ico
    └── icons/              # PWA 圖示（192x192, 512x512）
```

---

## UI 版面架構

### 桌機（>= 768px）：左右雙欄

```
┌─────────────────────────────────────────────────────┐
│  Navbar: [Logo] [開啟檔案] [儲存] [下載] [語言切換]   │
├──────────────────────┬──────────────────────────────┤
│                      │                              │
│   編輯區（EasyMDE）   │      預覽區（marked+mermaid） │
│                      │                              │
│   50% 寬度           │      50% 寬度                │
│                      │                              │
└──────────────────────┴──────────────────────────────┘
```

### 手機（< 768px）：單欄 + 模式切換

```
┌──────────────────────────────┐
│  [Logo]  [編輯|預覽] [選單▼]  │
├──────────────────────────────┤
│                              │
│  編輯區 或 預覽區（擇一顯示）  │
│  100% 寬度                   │
│                              │
└──────────────────────────────┘
```

---

## UI 版面架構（更新版）

### 桌機（>= 768px）：多分頁 + 雙欄

```
┌──────────────────────────────────────────────────────────────┐
│  Navbar: [Logo] [新增] [開啟] [儲存] [雲端▼] [語言▼]         │
├──────────────────────────────────────────────────────────────┤
│  [檔案1.md ×] [檔案2.md ×] [+ 新增分頁]                      │
├──────────────────────┬───────────────────────────────────────┤
│                      │                                       │
│   編輯區（EasyMDE）   │   預覽區（marked + mermaid）          │
│   50% 寬度           │   50% 寬度                            │
│                      │                                       │
└──────────────────────┴───────────────────────────────────────┘
│  狀態列: [● 已儲存] [字數: 123]                               │
└──────────────────────────────────────────────────────────────┘
```

### 手機（< 768px）：分頁收折 + 單欄 + 底部工具列

```
┌──────────────────────────────┐
│  [Logo] [編輯|預覽] [≡ 選單]  │  ← Navbar (48px)
├──────────────────────────────┤
│  [← 檔案1] [檔案2 →]  (滑動) │  ← Tabs (36px)
├──────────────────────────────┤
│                              │
│  編輯區 或 預覽區（擇一）     │  ← editor-wrapper (flex:1)
│  100% 寬度                   │  ← 支援左右 swipe 切換（> 80px）
│                              │
├──────────────────────────────┤
│          ● ○  (or ○ ●)       │  ← Swipe dots (16px) — 左:edit / 右:preview
├──────────────────────────────┤
│  [B] [I] [#] [≡] [①] [</>]  │  ← Bottom Toolbar (48px, 編輯模式)
├──────────────────────────────┤
│  ● 已儲存 | 字數: 0 | 行:0 ○ │  ← Status (26px)
└──────────────────────────────┘

大綱（手機版）：底部抽屜（60vh）從底部滑入，overlay backdrop 遮蓋
Drop Zone（桌機）：`position:fixed` 全頁虛線框覆蓋層，拖曳 .md/.txt 時淡入
```

---

## 模組說明

---

## 佈景主題系統

CSS 自訂屬性（`--color-*`）定義於 `css/main.css`，透過 `[data-theme]` attribute 切換：

| 主題 key | 名稱 | 類型 | 標題色 (`--color-heading`) |
|---|---|---|---|
| `purple`（預設，無 attribute）| Dark Purple | 深色 | `#c8b8ff` 淺紫 |
| `dark` | Dark | 深色 | `#79c0ff` 淺藍 |
| `light` | Light | 淺色 | `#0550ae` 深藍 |
| `nord` | Nord | 深色 | `#8fbcbb` 青綠 |
| `solarized` | Solarized Light | 淺色 | `#073642` 深青 |
| `latte` | Catppuccin Latte | 淺色 | `#1e1e2e` 近黑 |
| `rosepine` | Rosé Pine Dawn | 淺色 | `#286983` 松綠 |

- 切換後需點「套用配色」觸發 `location.reload()`；SW network-first 確保重載後 HTML 為最新版本
- Mermaid 依 `lightThemes` 陣列自動選擇 `'default'` 或 `'dark'` 主題

---

### `editor.js` — 編輯器核心
- 使用 EasyMDE 初始化 `<textarea id="editor">`
- Toolbar 項目：粗體、斜體、標題、連結、圖片、程式碼、引言、清單、Mermaid 插入按鈕、分隔、預覽（桌機）
- 手機 toolbar 只顯示最常用的 6 個按鈕，其餘收進「更多」選單
- 每次內容變更觸發 `preview.js` 的 `render()` 函式（debounce 300ms）
- **快捷鍵面板（`#shortcuts-panel`）**：桌機為可拖移浮動視窗；手機（`≤ 767px`）改為 bottom sheet（70vh，附 `#shortcuts-backdrop` 遮罩）；`_openShortcuts()` / `_closeShortcuts()` 統一管理，CSS `display:flex !important` 覆蓋 `[hidden]`，`transform: translateY()` 控制動畫

### `preview.js` — 預覽渲染
- 使用 `marked.js` 解析 Markdown → HTML
- 渲染完成後，掃描所有 ` ```mermaid ` 程式碼區塊，呼叫 `mermaid.render()` 轉成 SVG
- SVG 處理三步驟：① 移除 height 限制 ② 移除 clip-path 防截斷 ③ 插入 DOM 後用 `requestAnimationFrame` 展開過窄的節點框
- Mermaid 主題：淺色佈景（light / solarized / latte / rosepine）→ `'default'`；深色佈景 → `'dark'`
- **Tooltip**：節點（`.node`）與箭頭標籤（`.edgeLabel`）均支援，滑鼠停留 2.5 秒後顯示完整文字；使用 `position:fixed` 確保不被遮擋

### `tabs.js` — 多檔案分頁管理
- 維護 `tabs[]` 陣列，每個 tab 物件包含：`{ id, filename, content, isDirty, storageKey }`
- 操作：新增分頁、關閉分頁（未儲存時提示）、切換分頁（保存當前 editor 內容）
- 桌機：水平分頁列；手機：左右滑動切換
- 每個分頁有獨立的 `localStorage` key：`md_tab_{id}`
- 分頁狀態（順序、當前選中）存入 `localStorage['md_tabs_meta']`

### `cloud.js` — Google Drive 整合
- 使用 Google Drive API v3 + `gapi` JS SDK（本地 vendor）
- **OAuth2 流程**：點擊「雲端登入」→ Google 授權頁 → 取得 token → 存入 sessionStorage
- **讀取**：瀏覽雲端 .md 檔案，選取後載入到新分頁
- **寫入**：「儲存到雲端」→ 更新已開啟的雲端檔案（或新建）
- **離線降級**：無網路時，雲端按鈕 disabled，僅提示「請連線後使用雲端功能」

### `storage.js` — 儲存管理（更新）
- **自動暫存**：內容變更後 1 秒寫入對應分頁的 `localStorage` slot
- **開啟本機 `.md` 檔**：`openFile(file)` 透過 File API 讀取，開啟後自動在新分頁顯示；同時被 `<input type="file">` 與 Drop Zone 拖曳事件呼叫
- **下載 `.md` 檔**：Blob + URL.createObjectURL
- **關閉頁面保護**：任一分頁有未儲存變更時，`beforeunload` 提示

### `app.js` — 主程式入口（新增模組）
- **`Theme` 模組**：讀取 / 儲存 `localStorage('md_theme')`；`activate()` 設定 `<html data-theme>`；初始化順序最優先，確保 EasyMDE 以正確色彩渲染
- **`Typo` 模組**：讀取 / 儲存 `localStorage('md_typo')`；`apply()` 設定 `#preview-content[data-typo]`；5 種排版：default / reading / compact / document / wide
- **下拉選單定位**：所有下拉改用 `position:fixed` + `getBoundingClientRect()` 動態計算座標，完全跳出 stacking context，不會被編輯器元素遮擋
- **`initSwipe()`**：手機版 Swipe 手勢，監聽 `#editor-wrapper` 的 `touchstart/touchend`（passive），`|dx| ≥ 80px` 且水平分量 > 垂直分量時觸發 `setMode()`；Swipe dots 樣式由 CSS `body.preview-mode` 狀態純 CSS 控制，無 JS 狀態管理
- **`initDropZone()`**：桌機版拖曳開檔，監聽 `document` 的 `dragenter/dragover/dragleave/drop`；`dragDepth` 計數解決子元素觸發 `dragleave` 誤判；`drop` 時比對 MIME type 或副檔名（`.md/.txt/.markdown`），呼叫 `Storage.openFile()`；`window.innerWidth > 767` 動態判斷，手機不啟動

### `pwa` — 離線支援（sw.js + manifest.json）
- **Service Worker 策略（雙軌）**：
  - HTML 導航請求（`navigate` mode）→ **Network-First**：確保 `location.reload()` 後取得最新 `index.html`，更新成功後寫入快取
  - 其他靜態資源（JS / CSS / vendor）→ **Cache-First**：離線時仍可使用
- **快取清單（`PRECACHE_URLS`）**：index.html、所有 CSS/JS/vendor/locales 檔案
  - ⚠️ 新增 JS/CSS 檔案時，**必須手動**加入 `PRECACHE_URLS`，否則離線時無法載入
- **更新機制**：`CACHE_NAME = 'md-editor-' + APP_VERSION`；版本升號後 `activate` 事件自動清除舊快取；`skipWaiting()` + `clients.claim()` 確保新 SW 即時生效
- **版本號管理**：`js/version.js` 為唯一版本來源（`const APP_VERSION = 'YYYY-MM-DD'`）
  - `sw.js` 透過 `importScripts('/js/version.js')` 取得版本號
  - `app.js` 直接讀取全域 `APP_VERSION`（設定 Modal 版本顯示）
  - **部署時只需修改 `js/version.js` 一個檔案**，SW 快取即自動升版
- **manifest.json**：設定 App 名稱、圖示、`display: standalone`、`start_url: /`


- **自動暫存**：內容變更後 1 秒寫入 `localStorage['md_draft']`
- **開啟本機 `.md` 檔**：使用 `<input type="file" accept=".md,.txt">` + `FileReader API`
- **下載 `.md` 檔**：使用 `Blob` + `URL.createObjectURL` 觸發下載
- **儲存提示**：未儲存變更時，關閉頁面前顯示 `beforeunload` 警告

### `i18n.js` — 多語言（三語）
- 支援：繁體中文（zh-TW）、英文（en）、越南文（vi）
- 語言包為 JSON 檔，key 對應 HTML 中 `data-i18n="key"` 屬性
- 切換語言時：載入對應 JSON → 遍歷所有 `[data-i18n]` 元素 → 更新 `textContent` 及 `placeholder`
- 語言偏好存入 `localStorage['lang']`，下次開啟自動套用
- 預設語言：繁體中文（zh-TW）

---

## RWD 策略

```css
/* responsive.css 架構 */

/* 桌機：雙欄 */
.editor-wrapper {
  display: flex;
  height: calc(100vh - 50px); /* 扣掉 navbar */
}
.editor-pane  { flex: 1; }
.preview-pane { flex: 1; border-left: 1px solid #ddd; }

/* 手機：單欄切換 */
@media (max-width: 767px) {
  .editor-wrapper { flex-direction: column; }
  .editor-pane,
  .preview-pane   { flex: none; width: 100%; height: 100%; }

  /* 預設只顯示編輯區 */
  .preview-pane   { display: none; }
  .preview-pane.active { display: block; }
  .editor-pane.hidden  { display: none; }
}
```

切換按鈕邏輯（在 `app.js` 中）：
- 手機模式下，Navbar 出現「編輯 / 預覽」切換 Tab
- 點擊切換時加/移除 `.active` / `.hidden` class

---

## Mermaid 整合注意事項

1. **版本**：使用 mermaid.js v10（ESM 版，支援 CDN import）
2. **初始化方式**：`mermaid.initialize({ startOnLoad: false, theme: 'default' })`
3. **手動觸發**：每次預覽更新後呼叫 `mermaid.run({ nodes: [...] })`
4. **SVG 縮放**：確保 `.mermaid svg { max-width: 100%; height: auto; }`
5. **深色模式**（未來擴充）：切換 `theme: 'dark'`

---

## 多語言 JSON 結構範例

```json
// zh-TW.json
{
  "nav.open": "開啟檔案",
  "nav.save": "儲存",
  "nav.download": "下載 .md",
  "nav.lang": "語言",
  "nav.cloud": "雲端",
  "nav.cloud.login": "Google 登入",
  "nav.cloud.open": "從雲端開啟",
  "nav.cloud.save": "儲存到雲端",
  "editor.placeholder": "在此輸入 Markdown...",
  "toolbar.mermaid": "插入 Mermaid 圖表",
  "status.saved": "已自動儲存",
  "status.unsaved": "尚未儲存",
  "tabs.new": "新增分頁",
  "tabs.close.confirm": "此分頁有未儲存的變更，確定關閉？",
  "offline.cloud.disabled": "請連線後使用雲端功能"
}
```

---

## 開發階段規劃（P1～P9）

| 階段 | 內容 | 產出 |
|---|---|---|
| P1 | vendor 下載 + HTML 骨架 + EasyMDE 初始化 | 可輸入 Markdown，桌機雙欄，完全離線可用 |
| P2 | Mermaid 整合 + 預覽渲染完整 | Mermaid 圖在預覽區正常顯示 |
| P3 | 多分頁管理（tabs.js） | 可開啟多個 .md 分頁，各自獨立 |
| P4 | RWD CSS + 手機切換邏輯 | 手機版正常使用，分頁可滑動 |
| P5 | localStorage 暫存 + 開啟/下載檔案 | 基本本機檔案管理 |
| P6 | PWA：manifest + Service Worker | 可離線使用、可加入主畫面 |
| P7 | Google Drive 整合（cloud.js） | 可讀寫雲端 .md 檔案 |
| P8 | i18n 三語切換（zh-TW / en / vi） | 介面可切換三種語言 |
| P9 | 細節優化（錯誤處理、載入狀態、狀態列）| 成品品質提升 |

---

## 瀏覽器相容性

| 瀏覽器 | 支援狀況 |
|---|---|
| Chrome 90+ | ✅ 完整支援 |
| Firefox 88+ | ✅ 完整支援 |
| Safari 14+ | ✅ 完整支援（含 iOS） |
| Edge 90+ | ✅ 完整支援 |
| IE 11 | ❌ 不支援（Mermaid v10 使用 ESM） |
| Android Chrome | ✅ 完整支援 |

---

## 假設與已確認事項

- [x] 雲端儲存：支援 Google Drive（讀寫）
- [x] 多檔案分頁管理：支援
- [x] 語言：繁體中文、英文、越南文
- [x] 離線使用：PWA + 所有 vendor 改本地檔案
- [ ] Google Drive API Key / Client ID 需由開發者自行申請並設定在 `cloud.js`
