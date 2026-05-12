import { test, expect } from '@playwright/test';

test.describe('Job Application Flow', () => {
    test('User can search for jobs and view details', async ({ page }) => {
        // 1. Navigate to Jobs Page
        await page.goto('http://localhost:3000/dashboard/jobs');

        // 2. Wait for jobs to load (check for at least one job card)
        await expect(page.locator('text=View Details').first()).toBeVisible({ timeout: 10000 });

        // 3. Search for a specific role
        await page.fill('input[placeholder*="Job title"]', 'Engineer');
        await page.click('button:has-text("Find Jobs")');

        // Wait for reload
        await page.waitForTimeout(2000);

        // 4. Click "View Details" on the first card
        await page.click('text=View Details >> nth=0');

        // 5. Verify Modal Content
        await expect(page.locator('h2[class*="DialogTitle"]')).toBeVisible();
        await expect(page.locator('text=Job Description')).toBeVisible();

        // 6. Verify "Open Link" button presence
        const openLinkBtn = page.locator('a:has-text("Open Link")');
        await expect(openLinkBtn).toBeVisible();

        // Check href attribute exists
        const href = await openLinkBtn.getAttribute('href');
        expect(href).toBeTruthy();
        expect(href).toContain('http');
    });
});
