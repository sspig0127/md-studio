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

#### 1. 底部工具列 Bottom Toolbar 🔴
- 直式模式下，將常用操作（粗體、斜體、標題、清單）移至畫面底部固定工具列
- 高度約 44–48px，圖示採用 Unicode 字元維持 zero-dependency
- 桌機模式不顯示此工具列（`desktop-only` 隱藏）

#### 2. 大綱面板 Portrait 適配 🔴
- 直式模式下，大綱面板改為從**底部向上滑入**的抽屜（bottom sheet）
- 半透明 overlay 遮罩，點遮罩區域關閉
- 高度約 60vh，內部可捲動
- 斷點：`@media (max-width: 767px)` + orientation portrait

#### 3. 編輯 / 預覽 Swipe 手勢 🟡
- 支援左右滑動切換「編輯」與「預覽」模式
- 使用 `touchstart` / `touchend` 偵測，滑動距離 > 80px 觸發切換
- 提供視覺提示（底部 page indicator 小圓點）

#### 4. 快捷鍵面板 Portrait 適配 🟡
- 直式模式下改為從底部滑入的 bottom sheet（高度 70vh，可捲動）
- 桌機版維持現有浮動視窗

#### 5. 狀態列精簡 🟡
- 直式模式下只顯示「字數」與「行數」，隱藏「字元」
- 大綱按鈕保留在右側

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

*最後更新：2026-03-12*
