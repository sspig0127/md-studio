// @ts-check
const { test, expect } = require('@playwright/test');

// 工具：清除 tour seen 狀態，確保每次測試從乾淨狀態開始
async function clearTourSeen(page) {
  await page.evaluate(() => localStorage.removeItem('md_tour_seen'));
}

// ─── 測試一：Navbar 行動版 RWD ───────────────────────────────────────────────

test.describe('Navbar 行動版 RWD', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('navbar 無水平捲軸', async ({ page }) => {
    const scrollWidth = await page.evaluate(() => document.body.scrollWidth);
    const clientWidth = await page.evaluate(() => document.body.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1);
  });

  test('漢堡選單按鈕可見（≤ 767px）', async ({ page }) => {
    await expect(page.locator('#btn-mobile-menu')).toBeVisible();
  });

  test('開啟 / 關閉漢堡 drawer', async ({ page }) => {
    const btn = page.locator('#btn-mobile-menu');
    const drawer = page.locator('#mobile-drawer');

    await btn.click();
    await expect(drawer).toBeVisible();

    // 點 drawer 外區域關閉
    await page.mouse.click(10, 10);
    await expect(drawer).not.toBeVisible();
  });

  test('drawer 包含大綱、下載、開啟檔案選項', async ({ page }) => {
    await page.locator('#btn-mobile-menu').click();
    const drawer = page.locator('#mobile-drawer');
    await expect(drawer).toBeVisible();

    // 驗證關鍵項目存在
    await expect(drawer.getByText(/大綱|Outline/i)).toBeVisible();
    await expect(drawer.getByText(/下載|Download/i)).toBeVisible();
    await expect(drawer.getByText(/開啟|Open/i)).toBeVisible();
  });

  test('點 drawer 大綱項目 → drawer 關閉，大綱 bottom sheet 滑入', async ({ page }) => {
    await page.locator('#btn-mobile-menu').click();
    const drawer = page.locator('#mobile-drawer');
    await expect(drawer).toBeVisible();

    await drawer.getByText(/大綱|Outline/i).click();
    await expect(drawer).not.toBeVisible();

    // 大綱 bottom sheet 應出現
    const outlinePanel = page.locator('#outline-panel, .outline-sheet, [id*="outline"]').first();
    await expect(outlinePanel).toBeVisible({ timeout: 3000 });
  });
});

// ─── 測試二：底部工具列可見性 ────────────────────────────────────────────────

test.describe('底部工具列 safe-area', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('底部 #bottom-toolbar 可見', async ({ page }) => {
    await expect(page.locator('#bottom-toolbar')).toBeVisible();
  });

  test('狀態列（.status-bar）可見', async ({ page }) => {
    await expect(page.locator('.status-bar')).toBeVisible();
  });

  test('底部工具列不超出 viewport 下緣', async ({ page }) => {
    const toolbar = page.locator('#bottom-toolbar');
    const box = await toolbar.boundingBox();
    const viewportHeight = page.viewportSize()?.height ?? 812;
    expect(box).not.toBeNull();
    if (box) {
      expect(box.y + box.height).toBeLessThanOrEqual(viewportHeight + 1);
    }
  });
});

// ─── 測試三：編輯 / 預覽切換 ────────────────────────────────────────────────

test.describe('編輯 / 預覽模式切換', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('mode-toggle 按鈕可見', async ({ page }) => {
    await expect(page.locator('.mode-toggle')).toBeVisible();
  });

  test('點切換按鈕，預覽區出現', async ({ page }) => {
    const toggleBtn = page.locator('.mode-toggle');
    await toggleBtn.click();
    // 預覽模式下 #preview-pane 應可見
    await expect(page.locator('#preview-pane')).toBeVisible();
  });
});

// ─── 測試四：Onboarding Tour 行動版 7 步 ────────────────────────────────────

test.describe('Onboarding Tour 行動版', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await clearTourSeen(page);
    await page.reload();
    await page.waitForLoadState('networkidle');
  });

  test('首次開啟出現歡迎卡', async ({ page }) => {
    // tour 約 0.7s 後觸發
    const welcomeCard = page.locator('.tour-welcome, #tour-welcome, [class*="tour"][class*="welcome"]').first();
    await expect(welcomeCard).toBeVisible({ timeout: 3000 });
  });

  test('點「跳過」→ 歡迎卡消失，md_tour_seen 寫入', async ({ page }) => {
    const skipBtn = page.getByText(/跳過|Skip/i).first();
    await expect(skipBtn).toBeVisible({ timeout: 3000 });
    await skipBtn.click();

    const tourSeen = await page.evaluate(() => localStorage.getItem('md_tour_seen'));
    expect(tourSeen).toBe('1');
  });

  test('開始導覽 → 共 7 步，進度顯示 1/7', async ({ page }) => {
    const startBtn = page.getByText(/開始導覽|Start Tour/i).first();
    await expect(startBtn).toBeVisible({ timeout: 3000 });
    await startBtn.click();

    // 進度文字應包含 1/7 或 1 / 7
    const progress = page.locator('[class*="tour"][class*="progress"], [class*="progress"]').first();
    await expect(progress).toContainText(/1\s*\/\s*7/, { timeout: 3000 });
  });

  test('可以走完 7 步導覽', async ({ page }) => {
    const startBtn = page.getByText(/開始導覽|Start Tour/i).first();
    await expect(startBtn).toBeVisible({ timeout: 3000 });
    await startBtn.click();

    // 連續按「下一步」7 次（最後一步按鈕文字不同）
    for (let i = 0; i < 6; i++) {
      const nextBtn = page.getByText(/下一步|Next/i).first();
      await expect(nextBtn).toBeVisible({ timeout: 3000 });
      await nextBtn.click();
    }

    // 第 7 步按鈕應為「開始使用」
    const finishBtn = page.getByText(/開始使用|Get Started/i).first();
    await expect(finishBtn).toBeVisible({ timeout: 3000 });
    await finishBtn.click();

    // 導覽結束，遮罩消失
    const overlay = page.locator('.tour-overlay, #tour-overlay, [class*="tour-mask"]').first();
    await expect(overlay).not.toBeVisible({ timeout: 3000 });

    const tourSeen = await page.evaluate(() => localStorage.getItem('md_tour_seen'));
    expect(tourSeen).toBe('1');
  });
});

// ─── 測試五：基本編輯功能（迴歸） ───────────────────────────────────────────

test.describe('基本功能迴歸', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    // 如果 tour 出現先跳過
    const skipBtn = page.getByText(/跳過|Skip/i).first();
    if (await skipBtn.isVisible({ timeout: 1500 }).catch(() => false)) {
      await skipBtn.click();
    }
  });

  test('編輯器可輸入文字', async ({ page }) => {
    const editor = page.locator('.CodeMirror, .cm-editor').first();
    await editor.click();
    await page.keyboard.type('# Hello Firefox Mobile');
    await expect(editor).toContainText('Hello Firefox Mobile');
  });

  test('狀態列顯示字數', async ({ page }) => {
    const statusBar = page.locator('.status-bar');
    await expect(statusBar).toBeVisible();
    // 字數應有數字
    await expect(statusBar).toContainText(/\d+/);
  });
});
