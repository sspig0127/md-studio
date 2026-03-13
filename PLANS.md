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

#### 3. 編輯 / 預覽 Swipe 手勢 🟡
- 支援左右滑動切換「編輯」與「預覽」模式
- 使用 `touchstart` / `touchend` 偵測，滑動距離 > 80px 觸發切換
- 提供視覺提示（底部 page indicator 小圓點）

#### 4. 快捷鍵面板 Portrait 適配 🟡
- 直式模式下改為從底部滑入的 bottom sheet（高度 70vh，可捲動）
- 桌機版維持現有浮動視窗

#### 5. 狀態列精簡 🟡 ✅ 已完成（2026-03-13）
- 直式模式下只顯示「字數」與「行數」，隱藏「字元」
- 大綱按鈕保留在右側
- **實作**：CSS `:has()` 同時隱藏 `#status-chars` 及前後兩個分隔符

#### 6. Navbar 整合 🟢
- 直式模式下 navbar 只保留 Logo 與 ☰ Menu 按鈕
- 所有動作（New / Open / Download / Cloud / Lang / Typo / Settings）統一收入 Drawer
- Drawer 改為側邊滑出（從右側），更接近原生 App 體驗

#### 7. 分頁列觸控優化 🟢
- 分頁列支援水平 scroll snap
- 長按分頁可拖移排序（Drag-to-reorder）

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
| 搜尋 / 取代 | 編輯器內 Ctrl+F 搜尋，Ctrl+H 取代 | 🟡 |
| 匯出 HTML | 將預覽區 HTML 下載為 .html 檔 | 🟡 |
| 匯出 PDF | 透過瀏覽器列印 / print CSS | 🟢 |
| 字數目標 | 設定目標字數並顯示進度條 | 🟢 |
| Vim / Emacs 模式 | CodeMirror keymap 切換 | 🟢 |
| 自訂 CSS | 讓使用者貼入自訂 preview CSS | 🟢 |

---

## 🏁 最終里程碑：版本升級與跨平台 APP 打包

> 在功能穩定後，將 md-studio 打包為各平台原生 APP，提升安裝體驗與系統整合度。

### 階段規劃

#### 階段一：PWA 強化（基礎，已部分完成）
- [x] Service Worker 離線快取
- [x] `manifest.json` 基本設定
- [ ] `manifest.json` 補齊 `shortcuts`、`share_target`、`file_handlers`（`.md` 副檔名關聯）
- [ ] 安裝提示（`beforeinstallprompt` 事件引導使用者加入主畫面）
- [ ] iOS Safari 安裝說明提示

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

---

*最後更新：2026-03-13*
