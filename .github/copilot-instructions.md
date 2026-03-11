# Copilot 執行指引 — md-studio

## 角色定義

**你是執行者，不是決策者。**

- 本專案由 **Claude** 負責規劃、架構設計與驗證
- **Copilot（你）** 的任務是依照指定提示詞，精確實作指定範圍內的程式碼
- 若指示不夠清楚，**停下來，不要自行推斷架構決策**

---

## 強制規則（違反會導致錯誤）

### ❌ 絕對不做
- 不引入任何 CDN 連結（所有第三方資源必須在 `vendor/`）
- 不引入 npm / Node.js / 任何 build 工具
- 不使用任何 JS 框架（React / Vue / Alpine 等）
- 不自行新增新模組或新檔案，除非提示詞明確要求
- 不修改沒有被指定的程式碼
- 不重構或「優化」未被要求的部分

### ✅ 每次修改靜態資源後必做
版本號需在以下**三個位置同步更新**，格式 `YYYY-MM-DD.流水號`：

```js
// js/app.js
const APP_VERSION = '2026-03-11.6';
```
```html
<!-- index.html -->
<meta name="app-version" content="2026-03-11.6">
<div class="modal-version">v2026-03-11.6</div>
```

同時升級 `sw.js` 的 `CACHE_NAME`（目前為 `md-editor-v4`）：
```js
const CACHE_NAME = 'md-editor-v5'; // 每次靜態資源有變更就升號
```

---

## 模組規則

### JS 模組模式（IIFE）
本專案所有 JS 模組均為 IIFE，回傳公開 API：

```js
const ModuleName = (() => {
  // 私有變數

  function init() { ... }

  return { init };
})();
```

**不要改用 ES Module（import/export）或 class。**

### 初始化順序（app.js）— 不可更動
```
Theme → Typo → I18n → Preview → Editor → Tabs → Storage → Settings → Cloud
```

### i18n 翻譯按鈕的 ▾ 箭頭
下拉按鈕若需要 i18n，翻譯文字必須用 `<span>` 包裹，▾ 放在 span **外面**：

```html
<!-- ✅ 正確 -->
<button class="nav-btn dropdown-toggle" id="btn-cloud">
  <span data-i18n="nav.cloud">雲端</span> ▾
</button>

<!-- ❌ 錯誤：i18n 會覆蓋整個 textContent，▾ 消失 -->
<button data-i18n="nav.cloud">雲端 ▾</button>
```

### 新增 i18n key
必須同步新增到三個語言檔：
- `locales/zh-TW.json`
- `locales/en.json`
- `locales/vi.json`

---

## CSS 規則

### 主題系統
- 所有顏色使用 `var(--color-*)` CSS 變數，**不寫死顏色值**
- 新增功能若有顏色需求，先確認 `css/main.css` 是否已有對應變數
- 標題顏色用 `var(--color-heading, var(--color-text))`（帶 fallback）

### 現有 CSS 變數（不可刪除）
```
--color-bg         背景色
--color-surface    卡片/面板背景
--color-border     邊框
--color-accent     強調色
--color-accent-hover
--color-text       內文色
--color-text-muted 次要文字
--color-heading    標題色（比內文凸顯）
--color-navbar     導覽列背景
--color-tabs       分頁列背景
--color-status     狀態列背景
--color-tab-active
--color-tab-inactive
--color-btn        按鈕背景
--color-btn-hover
--color-danger
--color-success
--color-warning
```

### z-index 層級（不可打亂）
```
.navbar          z-index: 1000
.mobile-drawer   z-index: 1100
.modal-overlay   z-index: 2000
.dropdown-menu   z-index: 9000  ← position: fixed，JS 動態定位
#mermaid-tooltip z-index: 9999
```

### 下拉選單定位
所有 `.dropdown-menu` 使用 `position: fixed`，**不用 `position: absolute`**。
座標由 `app.js` 的 `toggleDropdown()` 用 `getBoundingClientRect()` 計算。

---

## Service Worker 注意事項

目前 SW 策略（不可改回 cache-first for HTML）：
```
HTML 導航請求（navigate mode） → Network-First
靜態資源（JS / CSS / vendor）  → Cache-First
```

> 曾因 HTML 改用 cache-first 導致 `location.reload()` 後頁面殘留舊版本，已修正為 network-first，**不要還原**。

---

## Mermaid 渲染注意事項

SVG 處理固定三步驟（`js/preview.js` `_renderMermaid()`），不可省略：
1. 移除 `height` 屬性（防止圖表被截斷）
2. 移除所有 `[clip-path]`（防止文字被框線截掉）
3. `pre.replaceWith(wrapper)` 插入 DOM 後，用 `requestAnimationFrame` 展開節點框

> `getBoundingClientRect()` 在元素插入 DOM 前回傳 0，必須在 replaceWith 之後呼叫。

---

## 行動版規則

下列元素在 `css/responsive.css` 中已設為行動版隱藏：
```
#btn-open、#btn-download、#cloud-dropdown、#lang-dropdown、#typo-dropdown
```
對應功能已放入 `#mobile-drawer`。**新增桌機 navbar 按鈕時，必須同步在 drawer 加入對應項目。**

---

## 提交前自我檢查清單

- [ ] 只修改了提示詞指定的檔案
- [ ] 版本號三處已同步更新
- [ ] `sw.js` CACHE_NAME 已升號
- [ ] 有新增 i18n key → 三個語言檔都加了
- [ ] 有新增顏色 → 使用 `var(--color-*)` 而非寫死
- [ ] 有新增桌機 navbar 按鈕 → drawer 也加了
- [ ] 沒有引入 CDN 或外部相依
