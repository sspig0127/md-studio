# 後續開發計畫 / Development Roadmap

> 本文件記錄 md-studio 尚未實作但已規劃的功能方向。
> 優先序標記：🔴 高 / 🟡 中 / 🟢 低

---

## 📱 直式（Portrait）使用者介面重構

> 目前手機直式模式以最陽春的「編輯 / 預覽」切換鍵實作，體驗落差較大。
> 本章節為正式重構前的規劃大綱。

### 現況問題

| 項目 | 現狀 | 目標 |
|------|------|------|
| 工具列 | 桌機版工具列直接縮小，按鈕密集 | 觸控友善，主要操作易達 |
| 大綱面板 | 桌機動畫可用，直式下未適配 | 直式模式改為底部抽屜或全螢幕 overlay |
| 快捷鍵速查 | 浮動視窗在小螢幕容易超出邊界 | 改為 bottom sheet 或 modal |
| 狀態列 | 字元/字數全部擠在一行 | 精簡顯示，或收入下拉 |
| 導覽列 | logo + 按鈕 + ☰ 三層擠壓 | 統一收入 ☰ Drawer，navbar 只留最少按鈕 |

---

### 規劃方向

#### 1. 底部工具列 Bottom Toolbar 🔴 ✅ 已完成（2026-03-13）
- 直式模式下，將常用操作（粗體、斜體、標題、清單）移至畫面底部固定工具列
- 高度約 44–48px，圖示採用 Unicode 字元維持 zero-dependency
- 桌機模式不顯示此工具列（`desktop-only` 隱藏）
- **實作**：`B / I / # / ≡ / ① / </>` 6 個按鈕，綁定 EasyMDE 靜態方法

#### 2. 大綱面板 Portrait 適配 🔴 ✅ 已完成（2026-03-13）
- 直式模式下，大綱面板改為從**底部向上滑入**的抽屜（bottom sheet）
- 半透明 overlay 遮罩，點遮罩區域關閉
- 高度約 60vh，內部可捲動
- 斷點：`@media (max-width: 767px)` + orientation portrait
- **實作**：CSS `transform: translateY()` + `#outline-backdrop` opacity 動畫
- **修正（2026-03-13）**：手機編輯模式下點選大綱項目，`preview-pane` 為 `display:none` 導致 `scrollIntoView` 無效；改為自動切換預覽模式 → 關閉底部抽屜 → `requestAnimationFrame` 後捲動

#### 3. 編輯 / 預覽 Swipe 手勢 🟡 ✅ 已完成（2026-03-13）
- 支援左右滑動切換「編輯」與「預覽」模式
- 使用 `touchstart` / `touchend` 偵測，滑動距離 > 80px 觸發切換
- 提供視覺提示（底部 page indicator 小圓點，純 CSS 依 `preview-mode` body class 切換）

#### 4. 快捷鍵面板 Portrait 適配 🟡 ✅ 已完成（2026-03-13）
- 直式模式下改為從底部滑入的 bottom sheet（高度 70vh，可捲動）
- 桌機版維持現有浮動視窗（可拖移）
- **實作**：CSS `display:flex !important` 覆蓋 `[hidden]` 屬性，`transform: translateY()` 控制顯示；JS 統一用 `_openShortcuts()` / `_closeShortcuts()` 管理，附 `#shortcuts-backdrop` 遮罩

#### 5. 狀態列精簡 🟡 ✅ 已完成（2026-03-13）
- 直式模式下只顯示「字數」與「行數」，隱藏「字元」
- 大綱按鈕保留在右側
- **實作**：CSS `:has()` 同時隱藏 `#status-chars` 及前後兩個分隔符

#### 6. Navbar 整合 🟢 ✅ 已完成（2026-03-13）
- 直式模式下 navbar 只保留 Logo 與 ☰ Menu 按鈕
- 所有動作（New / Open / Download / Cloud / Lang / Typo / Settings）統一收入 Drawer
- Drawer 從右側滑出（`transform: translateX` + `transition: 0.25s ease`）
- Backdrop 遮罩層（點擊關閉）已加入

#### 7. 分頁列觸控優化 🟢 ✅ scroll snap 已完成（2026-03-13）
- 分頁列支援水平 scroll snap（`scroll-snap-type: x mandatory` + `scroll-snap-align: start`）
- 長按分頁可拖移排序（Drag-to-reorder）🟢 待實作

---

### 技術評估

| 方案 | 說明 |
|------|------|
| CSS `@media (orientation: portrait)` | 搭配 `max-width` 斷點精準定向 |
| Bottom Sheet | Pure CSS + JS class toggle，無需額外套件 |
| Touch gesture | Vanilla `touchstart/touchend`，避免引入 Hammer.js |
| 動畫 | 與現有 `margin-left / transform transition` 一致，維持 0-dependency |

---

## 🔮 其他待評估功能

| 功能 | 說明 | 優先序 |
|------|------|--------|
| Google Drive 零設定（hosted）| 官方 GitHub Pages 版內建共用 Client ID，使用者不需自行申請 | 🔴 |
| 新手導覽 Onboarding Tour | 首次開啟時逐步介紹各功能與位置，可隨時跳過或重播 | 🟡 |
| 拖曳開檔 Drop Zone | 桌機版拖曳 .md 檔至畫面，半透明框線提示後放開即開啟 | ✅ 已完成（2026-03-13）|
| 搜尋 / 取代 | 編輯器內 Ctrl+F 搜尋，Ctrl+H 取代 | ✅ 已完成（2026-03-13）|
| 匯出 HTML | 將預覽區 HTML 下載為 .html 檔 | ✅ 已完成（2026-03-13）|
| 匯出 PDF | 透過瀏覽器列印 / print CSS | ✅ 已完成（2026-03-13）|
| 字數目標 | 設定目標字數並顯示進度條 | 🟢 |
| Vim / Emacs 模式 | CodeMirror keymap 切換 | 🟢 |
| 自訂 CSS | 讓使用者貼入自訂 preview CSS | 🟢 |

---

## 🎓 新手導覽 Onboarding Tour 🟡

> 首次開啟應用時，以「聚光燈 + 說明氣泡」方式逐步介紹各功能位置，
> 降低新使用者學習門檻，同時保留隨時跳過的自由度。

### 觸發時機

| 觸發 | 說明 |
|------|------|
| 首次開啟 | `localStorage` 無 `md_tour_seen` 紀錄時自動啟動 |
| 手動重播 | 設定頁面新增「重新播放導覽」按鈕 |
| 跳過後重播 | 不強制，可隨時從設定喚起 |

### 互動流程

```
首次開啟頁面
  ↓
顯示歡迎覆蓋層（「要開始導覽嗎？」）
  ├─ 開始 → 逐步導覽
  └─ 跳過 → 寫入 md_tour_seen，不再自動觸發

導覽中每一步：
  → 半透明覆蓋層（spotlight 聚光），目標元素高亮
  → 說明氣泡（標題 + 說明文 + 步驟進度 X/N）
  → 上一步 / 下一步 / 隨時跳過

最後一步結束 → 寫入 md_tour_seen → 導覽結束
```

### 聚光燈視覺方案

| 方案 | 說明 | 選用 |
|------|------|------|
| `box-shadow: 0 0 0 9999px rgba(0,0,0,0.6)` | 直接套用在目標元素 | ❌ z-index 複雜 |
| `clip-path` polygon 挖洞 | 全頁遮罩 + clip-path 矩形缺口 | ✅ 推薦 |
| SVG mask | 最精確，支援 border-radius | 🟡 備選 |

**採用 clip-path 方案：**
```
覆蓋層 position:fixed; inset:0; background:rgba(0,0,0,0.55)
clip-path: polygon(
  0% 0%, 100% 0%, 100% 100%, 0% 100%,   ← 外框
  0% top, left top, left bottom, 0% bottom, ← 挖洞（目標元素 rect）
)
transition: clip-path 0.3s ease          ← 步驟切換時平滑移動
```

### 步驟規劃（桌機版，約 10 步）

| 步驟 | 目標元素 | 說明重點 |
|------|---------|---------|
| 1 | `.nav-logo` | 歡迎，介紹工具名稱與定位 |
| 2 | `#btn-new` / `#btn-open` | 新增文件、開啟本地檔案 |
| 3 | `#tabs-bar` | 多分頁管理 |
| 4 | `#editor-pane` | Markdown 編輯區，支援語法高亮 |
| 5 | `#preview-pane` | 即時預覽區，Mermaid 圖表支援 |
| 6 | `.editor-toolbar` | 工具列快捷操作（含快捷鍵速查） |
| 7 | `#btn-cloud` | Google Drive 雲端整合 |
| 8 | `#btn-typo` | 排版風格切換 |
| 9 | `.status-bar` | 字數 / 行數統計 |
| 10 | `#btn-outline` | 大綱面板（點選跳轉） |

**手機版（約 6 步）：** 略過桌機專屬項目，加入底部工具列與 ☰ Drawer 說明。

### 說明氣泡定位邏輯

```
取目標元素 getBoundingClientRect()
  → 計算上下左右可用空間
  → 優先顯示在元素「下方」（空間足夠時）
  → 空間不足時自動切換方向（上 / 左 / 右）
  → 手機版：一律顯示於畫面底部固定位置（避免遮擋）
```

### 多語系

導覽步驟的標題與說明文字加入 locale JSON：
```json
"tour.step.1.title": "歡迎使用 MD Studio",
"tour.step.1.desc": "一款純前端、支援離線的 Markdown 編輯器。",
...
"tour.next": "下一步",
"tour.prev": "上一步",
"tour.skip": "跳過導覽",
"tour.done": "開始使用",
"tour.replay": "重新播放導覽"
```

### 技術評估

| 項目 | 說明 |
|------|------|
| 新增檔案 | `js/tour.js`（Tour 模組）|
| CSS | 加入 `css/main.css`（`.tour-overlay`、`.tour-bubble` 等）|
| 依賴 | Zero-dependency，Vanilla JS + CSS |
| localStorage key | `md_tour_seen`（值為版本號，方便日後重置）|
| 版本重置 | 若導覽步驟大幅更新，可改版本號讓老用戶再看一次 |
| 與設定整合 | `Settings.init()` 新增「重新播放導覽」按鈕 |

---

## 🔍 搜尋/取代 Search & Replace

> Ctrl+F 開啟搜尋列，Ctrl+H 展開取代列，ESC 關閉。
> 底層使用 CodeMirror 內建 `getSearchCursor()`（已包含在 EasyMDE bundle 中），Zero-dependency。

### 觸發方式

| 快捷鍵 | 行為 |
|--------|------|
| `Ctrl+F` | 開啟搜尋列（僅搜尋模式） |
| `Ctrl+H` | 開啟搜尋+取代列 |
| `Enter` / `F3` | 跳至下一個符合項 |
| `Shift+Enter` / `Shift+F3` | 跳至上一個符合項 |
| `Escape` | 關閉面板，游標留在當前位置 |

### 介面設計

```
┌─────────────────────────────────────────────────┐
│  [🔍 搜尋輸入框]  3/12  [↑] [↓]  [Aa] [.*] [W]  [✕]  ← 搜尋列
│  [取代輸入框]           [取代] [全部取代]              ← 取代列（Ctrl+H）
└─────────────────────────────────────────────────┘
```

**位置**：固定在 `#editor-pane` 右上角（`position: absolute; top: 8px; right: 8px`）
**層級**：`z-index: 1500`（低於 modal 2000，高於 outline 1000）

### 選項按鈕

| 按鈕 | 功能 | 快捷鍵 |
|------|------|--------|
| `Aa` | 區分大小寫（case-sensitive） | `Alt+C` |
| `.*` | 正規表達式（regex）模式 | `Alt+R` |
| `W`  | 全字比對（whole word） | `Alt+W` |

### 符合項高亮

- **當前符合**：`background: var(--color-accent); color: white`（滾動進視窗）
- **其他符合**：`background: rgba(accent, 0.25)`（使用 CodeMirror overlay 或 `markText`）
- 計數器：`3/12`（第 N 個 / 共 M 個），無符合時紅底顯示

### 手機版（Portrait）

- 面板改為固定在**底部**（`position: fixed; bottom: 0; left: 0; right: 0`）
- 高度 auto，與底部工具列不重疊（底部工具列上移）
- 選項按鈕收進第二行（avoid 按鈕太小）

### 技術實作方案

#### 核心搜尋邏輯（`js/search.js`）

```javascript
// 使用 CodeMirror 內建 API
const cursor = cm.getSearchCursor(query, from, { caseFold: !caseSensitive });
// query 若為 string → 普通搜尋；若為 RegExp → regex 搜尋

// 找下一個
cursor.findNext() → cursor.from() / cursor.to() → cm.setSelection()

// 全部高亮（markText）
cm.getAllMarks().forEach(m => m.clear());
while (cursor.findNext()) {
  cm.markText(cursor.from(), cursor.to(), { className: 'cm-search-match' });
}

// 取代
cm.replaceRange(replaceText, cursor.from(), cursor.to());

// 全部取代
const cursor = cm.getSearchCursor(query);
cm.operation(() => {
  while (cursor.findNext()) cursor.replace(replaceText);
});
```

#### 模組介面

```javascript
const Search = {
  open(mode = 'search'),  // mode: 'search' | 'replace'
  close(),
  findNext(),
  findPrev(),
  replace(),
  replaceAll(),
  setQuery(text),
  init(cm),               // 注入 CodeMirror instance
};
export default Search;
```

#### 整合點

| 位置 | 修改內容 |
|------|---------|
| `js/editor.js` | `addKeyMap` 加入 `Ctrl-F`、`Ctrl-H`，呼叫 `Search.open()` |
| `index.html` | 加入 `#search-panel` 結構（搜尋列 + 取代列） |
| `css/main.css` | `.search-panel`、`.cm-search-match`、`.cm-search-match-current` 樣式 |
| `css/responsive.css` | 手機版 bottom 定位覆蓋 |
| `locales/*.json` | 新增 `search.*` i18n key |
| `js/app.js` | `import Search` 並在初始化時呼叫 `Search.init(cm)` |

### HTML 結構草稿

```html
<div id="search-panel" class="search-panel" hidden>
  <div class="search-row">
    <input id="search-input" type="text" data-i18n-placeholder="search.placeholder" autocomplete="off">
    <span id="search-count" class="search-count"></span>
    <button id="search-prev" title="↑">↑</button>
    <button id="search-next" title="↓">↓</button>
    <button id="search-opt-case" class="search-opt" data-i18n-title="search.caseSensitive">Aa</button>
    <button id="search-opt-regex" class="search-opt" data-i18n-title="search.regex">.*</button>
    <button id="search-opt-word" class="search-opt" data-i18n-title="search.wholeWord">W</button>
    <button id="search-close">✕</button>
  </div>
  <div id="replace-row" class="replace-row" hidden>
    <input id="replace-input" type="text" data-i18n-placeholder="search.replacePlaceholder" autocomplete="off">
    <button id="btn-replace" data-i18n="search.replace">取代</button>
    <button id="btn-replace-all" data-i18n="search.replaceAll">全部取代</button>
  </div>
</div>
```

### i18n Key 列表

```json
"search.placeholder": "搜尋...",
"search.replacePlaceholder": "取代為...",
"search.caseSensitive": "區分大小寫",
"search.regex": "正規表達式",
"search.wholeWord": "全字比對",
"search.replace": "取代",
"search.replaceAll": "全部取代",
"search.noResult": "找不到結果",
"search.matchCount": "{current}/{total}",
"search.replaced": "已取代 {count} 處"
```

### 實作順序

1. `index.html` 加入 `#search-panel` HTML
2. `css/main.css` 加入面板樣式 + `.cm-search-match` highlight
3. `js/search.js` 實作搜尋核心邏輯
4. `js/editor.js` 綁定 Ctrl+F / Ctrl+H / Escape keymap
5. `js/app.js` 初始化 Search 模組
6. `locales/*.json` 加入 i18n key
7. `css/responsive.css` 加入手機版覆蓋樣式

### 快捷鍵面板更新

`js/editor.js` 的 shortcuts panel 需加入：

| 按鍵 | 功能 |
|------|------|
| `Ctrl + F` | 搜尋 |
| `Ctrl + H` | 搜尋與取代 |
| `Enter / F3` | 下一個符合 |
| `Shift+Enter / Shift+F3` | 上一個符合 |

---

## 🗂️ 拖曳開檔 Drop Zone（桌機）🟡

> 桌機模式下，讓使用者直接從檔案總管或桌面拖曳 Markdown 檔案到編輯器，降低「開啟檔案」操作摩擦。

### 互動流程

```
使用者拖曳檔案進入瀏覽器視窗
  ↓
偵測 dragenter — 判斷 DataTransfer 內是否含可讀格式
  ├─ 格式符合 → 顯示 Drop Zone 覆蓋層（半透明背景 + 四邊框線 + 提示文字）
  └─ 格式不符 → 不顯示（忽略此次拖曳）

使用者在 Drop Zone 範圍內放開滑鼠（drop）
  → 隱藏覆蓋層
  → 以 FileReader 讀取檔案內容
  → 呼叫現有 Storage.openFile() 開啟新分頁

使用者將檔案拖離視窗（dragleave）
  → 隱藏覆蓋層，不做任何動作
```

### 視覺設計

| 元素 | 規格 |
|------|------|
| 覆蓋層 | `position: fixed; inset: 0`，背景 `rgba(accent, 0.15)` |
| 框線 | `2px dashed var(--color-accent)`，`border-radius: 12px`，內縮 16px |
| 提示文字 | 置中顯示，例如「放開以開啟檔案」/ "Drop to open" |
| 動畫 | `opacity` 淡入淡出（0.15s），配合 `pointer-events: none/auto` |
| z-index | 低於 modal（2000）但高於一般內容 |

### 支援格式

偵測 `DataTransfer.items[].type` 或副檔名：

| 格式 | MIME type |
|------|-----------|
| `.md` | `text/markdown` / `text/plain` |
| `.txt` | `text/plain` |
| `.markdown` | `text/markdown` / `text/plain` |

不支援的格式（圖片、PDF 等）拖入時不顯示覆蓋層，行為與瀏覽器預設一致。

### 技術評估

| 項目 | 說明 |
|------|------|
| 事件 | `dragenter` / `dragover` / `dragleave` / `drop`，均需 `e.preventDefault()` 阻止瀏覽器預設開啟行為 |
| 格式判斷 | 優先用 `item.type`；MIME 不明時 fallback 比對副檔名 |
| 檔案讀取 | 複用現有 `Storage.openFile(file)` |
| 手機版 | 不啟用（`dragenter` 在觸控裝置不觸發）|
| 依賴 | Vanilla JS + 現有 CSS 變數，zero-dependency |

---

## 🏁 最終里程碑：版本升級與跨平台 APP 打包

> 在功能穩定後，將 md-studio 打包為各平台原生 APP，提升安裝體驗與系統整合度。

### 階段規劃

#### 階段一：PWA 強化（基礎，已部分完成）✅ 已完成（2026-03-13）
- [x] Service Worker 離線快取
- [x] `manifest.json` 基本設定
- [x] `manifest.json` 補齊 `shortcuts`、`share_target`、`file_handlers`（`.md` 副檔名關聯）
- [x] 安裝提示（`beforeinstallprompt` → 設定面板「安裝至桌面」按鈕）
- [x] iOS Safari 安裝說明提示（可關閉橫幅，session 不再重複出現）
- [x] `launchQueue` API：從檔案總管開啟 .md 自動載入新分頁
- [x] `?action=new / sample` shortcuts URL 處理
- [x] `?text=&title=` share_target URL 處理

#### 階段二：桌機 APP — Tauri 🔴
- 技術選型：**Tauri v2**（Rust + WebView，比 Electron 輕量數十倍）
- 目標平台：Windows、macOS、Linux
- 打包產出：`.exe` / `.dmg` / `.AppImage`
- 重點整合項目：
  - 原生選單列（File / Edit / View）
  - 原生檔案開啟 / 儲存對話框（取代 `<input type="file">`）
  - 視窗標題列顯示目前檔名
  - 系統通知（儲存成功 / 離線警告）

#### 階段三：行動 APP — Capacitor 🟡
- 技術選型：**Capacitor v6**（直接包裝現有 Web 程式碼，無需改寫）
- 目標平台：Android（APK / AAB）、iOS（IPA）
- 重點整合項目：
  - Android：`.md` 副檔名關聯，從檔案管理器直接開啟
  - iOS：Files App 整合
  - 分享功能（Share Sheet）
  - 觸控鍵盤上方工具列（iOS inputAccessoryView 替代方案）

#### 階段四：版本號與發布流程 🟡
- 語意化版本（Semantic Versioning）：`MAJOR.MINOR.PATCH`
- 版本號統一管理（目前三處手動同步 → 改為單一 `version.js` 或 `package.json` 驅動）
- GitHub Releases 自動發布（GitHub Actions）：
  - 打 tag → 觸發 build → 產出各平台安裝檔 → 上傳 Release Assets
- Changelog 自動生成（Conventional Commits）

### 技術選型比較

| 方案 | 桌機 | 行動 | 包大小 | 原生 API | 難度 |
|------|------|------|--------|----------|------|
| PWA | ✅ | ✅ | 最小 | 受限 | 低 |
| Tauri v2 | ✅ | 🚧 實驗中 | 極小（~5MB） | 完整 | 中 |
| Electron | ✅ | ❌ | 大（~150MB） | 完整 | 低 |
| Capacitor | 🚧 | ✅ | 中 | 完整 | 中 |
| React Native / Flutter | ❌ | ✅ | 中 | 完整 | 高（需重寫） |

> **建議路徑**：PWA → Tauri（桌機）→ Capacitor（行動），最大限度複用現有程式碼。

---

## 🐛 已修正問題記錄

| 日期 | 問題描述 | 修正方式 |
|------|---------|---------|
| 2026-03-13 | `btn-settings` 的 `data-i18n` 覆寫 ⚙ 圖示為翻譯文字 | 改用 `data-i18n-title`；`md-settings` 改為 `<span>` 分離圖示與文字 |
| 2026-03-13 | 導覽列按鈕 hover tooltip 切換語系後仍顯示中文 | 硬編碼 `title` 改為 `data-i18n-title`，隨語系自動更新 |
| 2026-03-13 | 手機大綱點選項目無法跳轉（`preview-pane` 為 `display:none`） | 點選時先切換至預覽模式，再以 `requestAnimationFrame` 捲動 |
| 2026-03-13 | SW `CACHE_NAME` 未隨程式碼更新升版，導致設備載入舊快取 | `md-editor-v8` → `md-editor-v9` |
| 2026-03-13 | 匯出 ▾ 下拉選單即開即關（click 事件冒泡觸發 `closeAllDropdowns`） | 補 `btn-export` event listener + `e.stopPropagation()` |
| 2026-03-13 | 頁面載入 / 切換分頁後字數統計顯示 0 | `storage.js` 新增 `updateStats` export；`_onSwitch` 補呼叫；AppInit 結尾加 `setTimeout` 確保在 EasyMDE async change event 之後更新 |

---

---

## 💝 贊助模型

> 詳細評估報告 → `SPONSOR-MODEL.md`（私人文件，存於 toolbox-wiki-notes/projects/md-studio/，本機 symlink）
> 臺灣金流與稅務評估 → `SPONSOR-TAIWAN-FINANCE.md`（同上）

| 階段 | 狀態 | 主要內容 |
|------|------|---------|
| 0：口碑累積 | 🔄 進行中 | 無付費機制，先衝使用者數 |
| 1：視覺差異化 | 🟡 規劃中 | 進階主題包、自訂 Preview CSS、Ko-fi 榮譽開關 |
| 2：功能差異化 | 🟢 評估中 | 匯出 HTML/PDF、解鎖碼機制、分頁上限差異 |
| 3：進階整合 | 🟢 評估中 | GitHub Gist、WebDAV、自訂快捷鍵 |

*最後更新：2026-03-13（修正匯出選單事件冒泡 + 字數統計初始化問題）*
