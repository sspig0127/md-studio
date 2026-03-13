# 贊助模型評估報告

> **適用範圍**：純前端 PWA（無後端伺服器、無資料庫）
> **核心原則**：基礎編輯功能永遠免費，贊助者獲得客製化與進階體驗，而非功能封鎖。

---

## 一、純前端的根本限制與設計方向

### 限制

| 項目 | 說明 |
|------|------|
| 無伺服器驗證 | 無法在後端驗證贊助狀態，所有邏輯都在瀏覽器 |
| 易被繞過 | client-side 的解鎖機制在技術上都可被繞過 |
| 無帳號系統 | 跨裝置無法同步贊助狀態（除非自行實作雲端同步） |

### 設計方向

> 不以「安全加密」為目標，而以**誠信模型（Honor System）** 為前提。

贊助金額小（數美元至數十美元），付費門檻低，核心目的是：
1. 讓認同這個工具的使用者表達支持
2. 以「解鎖碼」作為儀式感，非技術門檻
3. 不影響不願付費者的基礎體驗

---

## 二、贊助解鎖機制

### 方案 A：贊助解鎖碼（推薦）

```
使用者在 Ko-fi / GitHub Sponsors 贊助
  → 收到感謝信 + 唯一解鎖碼（6–8 碼英數字串）
  → 輸入解鎖碼到設定頁面
  → 前端以 hash 比對驗證
  → 通過 → 寫入 localStorage，解鎖進階功能
```

**驗證邏輯（client-side hash）：**

```js
// 範例：SHA-256 前 8 碼 + 鹽值比對
// 不是真正安全，但足以過濾非刻意破解的使用者
async function validateSponsorKey(key) {
  const salt = 'md-studio-2026';
  const hash = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(key + salt)
  );
  const hex = [...new Uint8Array(hash)]
    .map(b => b.toString(16).padStart(2, '0')).join('');
  return VALID_KEY_HASHES.includes(hex.slice(0, 16));
}
```

> 解鎖碼列表（`VALID_KEY_HASHES`）隨版本更新發布，可定期輪換。

---

### 方案 B：榮譽切換（最簡單）

設定頁面加入「我已贊助」切換開關，不驗證，僅靠使用者誠信。
適合剛起步、贊助者數量少的階段。

---

### 方案 C：GitHub Sponsors 自動化

若未來有後端（或 GitHub Actions）：
- Webhook 偵測贊助事件
- 自動寄送解鎖碼至贊助者 email

---

## 三、差異化功能清單

### 🎨 視覺體驗（高吸引力、低開發成本）

| 功能 | 免費版 | 贊助版 | 說明 |
|------|--------|--------|------|
| 內建 7 種主題 | ✅ | ✅ | 全部保留免費 |
| 進階主題包 | — | ✅ | Dracula、Tokyo Night、Gruvbox、Everforest 等 |
| 自訂 Accent 顏色 | — | ✅ | 色盤選色，取代固定 accent 色 |
| 自訂 Preview CSS | — | ✅ | 貼入自訂 CSS 套用到預覽區 |
| 自訂 UI 字型 | — | ✅ | 選擇 Google Fonts 或系統字型 |
| 自訂 Logo 文字 | — | ✅ | 替換 Navbar 的「Markdown 編輯器」字樣 |
| 贊助者徽章 | — | ✅ | 狀態列小圖示，純裝飾 |

---

### ⚡ 功能體驗（實用性提升）

| 功能 | 免費版 | 贊助版 | 說明 |
|------|--------|--------|------|
| 分頁數量 | 最多 5 個 | 無限制 | 多文件並行作業 |
| 匯出 HTML | — | ✅ | 預覽區 HTML 下載 |
| 匯出 PDF | — | ✅ | 透過 print CSS 列印為 PDF |
| 字數目標 | — | ✅ | 設定目標字數，顯示進度條 |
| 自動備份排程 | — | ✅ | 定時將分頁內容打包下載 |
| Vim / Emacs 模式 | — | ✅ | CodeMirror keymap 切換 |
| 拼字/語法提示 | — | ✅（評估中）| Hunspell / LanguageTool |
| 自訂快捷鍵 | — | ✅ | 覆寫預設鍵盤綁定 |
| 文件統計面板 | — | ✅ | 閱讀時間估算、段落數、最長句等 |

---

### ☁️ 儲存體驗

| 功能 | 免費版 | 贊助版 | 說明 |
|------|--------|--------|------|
| localStorage 自動存檔 | ✅ | ✅ | 基礎功能維持免費 |
| Google Drive | ✅ | ✅ | 需自填 Client ID，維持免費 |
| 一鍵 Gist 發布 | — | ✅ | 直接推送到 GitHub Gist |
| WebDAV 同步 | — | ✅（評估中）| 自架 NAS / Nextcloud 整合 |

---

## 四、技術實作評估

### 進階主題包

```js
// themes.js 拆分為 free 與 sponsor 兩組
const THEMES_FREE = ['purple', 'dark', 'light', 'nord', 'solarized', 'latte', 'rosepine'];
const THEMES_SPONSOR = ['dracula', 'tokyonight', 'gruvbox', 'everforest'];

function applyTheme(id) {
  if (THEMES_SPONSOR.includes(id) && !Sponsor.isActive()) {
    showSponsorPrompt(); // 非封鎖，只是提示
    return;
  }
  // 套用主題...
}
```

### 自訂 Preview CSS

```js
// 贊助者輸入的 CSS 存入 localStorage，注入 <style id="custom-preview-css">
function applyCustomCss(css) {
  let el = document.getElementById('custom-preview-css');
  if (!el) { el = document.createElement('style'); el.id = 'custom-preview-css'; document.head.appendChild(el); }
  el.textContent = css;
}
```

### 分頁數量限制

```js
// tabs.js — createTab 加入免費版上限判斷
const TAB_LIMIT_FREE = 5;
function createTab(filename, content) {
  if (!Sponsor.isActive() && Tabs.allTabs().length >= TAB_LIMIT_FREE) {
    showSponsorPrompt('tabs');
    return null;
  }
  // 建立分頁...
}
```

---

## 五、贊助提示 UI 設計原則

1. **非阻斷式**：不彈出強制 modal，改用底部或角落的柔性提示
2. **可關閉**：每次只出現一次，不重複打擾
3. **誠懇說明**：說明贊助用途（維護成本、開發時間），非商業廣告語
4. **快速消失**：3 秒後自動淡出，或使用者點擊後不再顯示（localStorage 記錄）

```
╔══════════════════════════════════════╗
║  🙏 喜歡這個工具嗎？                  ║
║  小額贊助可解鎖自訂主題與進階功能      ║
║  [了解更多]          [稍後再說 ×]    ║
╚══════════════════════════════════════╝
```

---

## 六、贊助平台比較

| 平台 | 手續費 | 一次性 | 定期訂閱 | 自動發碼 | 適合場景 |
|------|--------|--------|---------|---------|---------|
| **Ko-fi** | 0%（免費方案）| ✅ | ✅ | 需 Webhook | 開源工具首選，低門檻 |
| **GitHub Sponsors** | 0% | ✅ | ✅ | 需整合 | 開發者社群曝光佳 |
| **Buy Me a Coffee** | 5% | ✅ | ✅ | 需 Webhook | 創作者風格 |
| **Patreon** | 8–12% | — | ✅ | ✅（進階方案）| 多層級訂閱適合 |
| **LemonSqueezy** | 5%+0.5$ | ✅ | ✅ | ✅ 原生支援 | 適合正式「軟體授權」模型 |

### 推薦路徑

```
初期：Ko-fi 榮譽模型（最快上線）
  → 穩定後：Ko-fi + Webhook 自動發碼
  → 規模化：GitHub Sponsors 或 LemonSqueezy 正式授權
```

---

## 七、定價策略建議

| 方案 | 金額 | 解鎖內容 |
|------|------|---------|
| ☕ 請喝咖啡 | $3 一次 | 視覺客製化（主題包、accent 色） |
| ⭐ 支持者 | $6 一次 | 視覺 + 功能進階（匯出、字數目標等） |
| 💎 長期贊助者 | $3/月 | 全部功能 + 優先回覆功能請求 |

> 建議以**一次性**為主，降低訂閱疲勞感。

---

## 八、風險評估

| 風險 | 說明 | 緩解方式 |
|------|------|---------|
| 解鎖碼外洩 | 使用者公開分享解鎖碼 | 定期輪換，舊碼寬限期後失效 |
| client-side 被繞過 | 技術用戶 F12 直接解鎖 | 接受此現實；誠信模型目標用戶不會這樣做 |
| 功能期望過高 | 贊助者期望更多 | 明確列出解鎖項目，不承諾 roadmap |
| 基礎功能降級壓力 | 為推廣贊助而削弱免費版 | 承諾「核心編輯永遠免費」 |

---

## 九、實作優先序建議

```
階段 0（現在）：無任何付費機制，先累積使用者口碑
階段 1（功能穩定後）：
  - 新增進階主題包（視覺差異化，開發成本低）
  - 新增自訂 Preview CSS（高價值感知）
  - Ko-fi 頁面 + 榮譽開關
階段 2（有穩定用量後）：
  - 解鎖碼機制
  - 匯出 HTML / PDF
  - 分頁上限差異化
階段 3（可選）：
  - GitHub Gist 發布
  - WebDAV 同步
  - 自訂快捷鍵
```

---

*建立日期：2026-03-13*
