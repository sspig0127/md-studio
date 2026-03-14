# Third-Party Notices

本專案使用了以下第三方函式庫與服務。使用前請確認各項目的授權條款。

---

## 1. EasyMDE

- **版本**：v2.20.0
- **授權**：MIT License
- **著作權**：Copyright Jeroen Akkerman
- **來源**：https://github.com/Ionaru/easy-markdown-editor
- **使用方式**：本機打包（`vendor/easymde.min.js`、`vendor/easymde.min.css`）

```
MIT License

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 2. marked

- **版本**：v15.0.12
- **授權**：MIT License
- **著作權**：Copyright (c) 2011-2025, Christopher Jeffrey
- **來源**：https://github.com/markedjs/marked
- **使用方式**：本機打包（`vendor/marked.min.js`）

```
MIT License

Copyright (c) 2011-2025, Christopher Jeffrey

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 3. Mermaid

- **版本**：（Bundle 未標記版本；包含 dagre-d3、cytoscape、KaTeX 等依賴）
- **授權**：MIT License
- **著作權**：Copyright (c) 2014-present Knut Sveidqvist and contributors
- **來源**：https://github.com/mermaid-js/mermaid
- **使用方式**：本機打包（`vendor/mermaid.min.js`）
- **附帶依賴**：此 bundle 包含以下子依賴，均採 MIT 授權：
  - [dagre-d3](https://github.com/dagrejs/dagre-d3) — MIT
  - [cytoscape](https://github.com/cytoscape/cytoscape.js) — MIT
  - [KaTeX](https://github.com/KaTeX/KaTeX) — MIT

```
MIT License

Copyright (c) 2014-present Knut Sveidqvist

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 4. Google APIs（運行時動態載入）

以下 Google 服務不包含於本 repo，於使用者瀏覽器執行時動態載入。使用須遵守 Google 服務條款。

### 4a. Google API Client Library（gapi）

- **來源**：`https://apis.google.com/js/api.js`（動態載入）
- **授權**：[Google APIs Terms of Service](https://developers.google.com/terms)
- **用途**：存取 Google Drive REST API

### 4b. Google Identity Services（GIS）

- **來源**：`https://accounts.google.com/gsi/client`（動態載入）
- **授權**：[Google APIs Terms of Service](https://developers.google.com/terms)
- **用途**：OAuth 2.0 授權流程（取得 Google Drive 存取 Token）

> **注意**：使用 Google Drive 功能需由使用者自行申請 OAuth 2.0 Client ID，並遵守 [Google Drive API 使用政策](https://developers.google.com/drive/api/guides/api-specific-terms)。本專案不儲存或代理任何 Google 憑證。

---

## 合規摘要

| 函式庫 | 授權 | 打包方式 | 版權聲明需求 |
|--------|------|----------|------------|
| EasyMDE v2.20.0 | MIT | 本機 vendor/ | 保留原始版權標頭即可 |
| marked v15.0.12 | MIT | 本機 vendor/ | 保留原始版權標頭即可 |
| Mermaid (bundled) | MIT | 本機 vendor/ | 保留原始版權標頭即可 |
| Google APIs | Google ToS | 運行時動態 | 遵守 Google APIs ToS |

> MIT 授權允許自由使用、修改與散布，僅需在散布時保留版權聲明與授權文字。
> 本專案 `vendor/` 目錄中各 `.min.js` / `.min.css` 檔案均已保留原始版權標頭，符合 MIT 授權要求。
