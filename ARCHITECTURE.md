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
Markdown_webap/
├── index.html              # 主頁面（唯一 HTML）
├── manifest.json           # PWA manifest
├── sw.js                   # Service Worker（離線快取）
├── css/
│   ├── main.css            # 全域樣式、CSS 變數
│   ├── editor.css          # 編輯器客製化樣式
│   ├── tabs.css            # 多分頁樣式
│   └── responsive.css      # RWD media query
├── js/
│   ├── app.js              # 主程式入口，初始化各模組
│   ├── editor.js           # EasyMDE 初始化與設定
│   ├── preview.js          # 預覽區渲染（marked + mermaid）
│   ├── tabs.js             # 多檔案分頁管理
│   ├── storage.js          # localStorage、開啟/下載 .md
│   ├── cloud.js            # Google Drive API 整合
│   └── i18n.js             # 多語言切換邏輯
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

### 手機（< 768px）：分頁收折 + 單欄

```
┌──────────────────────────────┐
│  [Logo] [編輯|預覽] [≡ 選單]  │
├──────────────────────────────┤
│  [← 檔案1] [檔案2 →]  (滑動) │
├──────────────────────────────┤
│                              │
│  編輯區 或 預覽區（擇一）     │
│  100% 寬度                   │
│                              │
└──────────────────────────────┘
```

---

## 模組說明

### `editor.js` — 編輯器核心
- 使用 EasyMDE 初始化 `<textarea id="editor">`
- Toolbar 項目：粗體、斜體、標題、連結、圖片、程式碼、引言、清單、Mermaid 插入按鈕、分隔、預覽（桌機）
- 手機 toolbar 只顯示最常用的 6 個按鈕，其餘收進「更多」選單
- 每次內容變更觸發 `preview.js` 的 `render()` 函式（debounce 300ms）

### `preview.js` — 預覽渲染
- 使用 `marked.js` 解析 Markdown → HTML
- 渲染完成後，掃描所有 ` ```mermaid ` 程式碼區塊
- 將其替換為 `<div class="mermaid">...</div>`
- 呼叫 `mermaid.init()` 渲染成 SVG
- Mermaid SVG 容器設定 `max-width: 100%` 確保手機縮放正常

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
- **開啟本機 `.md` 檔**：File API，開啟後自動在新分頁顯示
- **下載 `.md` 檔**：Blob + URL.createObjectURL
- **關閉頁面保護**：任一分頁有未儲存變更時，`beforeunload` 提示

### `pwa` — 離線支援（sw.js + manifest.json）
- **Service Worker 策略**：Cache-First（所有本地檔案優先讀快取）
- **快取清單**：index.html、所有 CSS/JS/vendor/locales 檔案
- **更新機制**：sw.js 版本號更新時，自動清除舊快取
- **manifest.json**：設定 App 名稱、圖示、`display: standalone`、`start_url: /`
- **安裝提示**：瀏覽器支援時顯示「加入主畫面」按鈕


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
