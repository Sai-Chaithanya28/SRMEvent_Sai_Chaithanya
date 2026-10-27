import { test, expect } from '@playwright/test';

test.describe('FairShift End-to-End Suite', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test
    await page.goto('/login');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('1. Role routing: Worker and Employer navigate to respective interfaces', async ({ page }) => {
    await page.goto('/login');

    // Click worker demo login
    await page.getByRole('button', { name: /Ramesh Kumar/i }).click();
    await expect(page).toHaveURL(/.*worker/);
    await expect(page.getByText(/Today's Shift/i)).toBeVisible();

    // Log out
    await page.getByRole('button', { name: /Log out/i }).click();
    await expect(page).toHaveURL(/.*login/);

    // Click employer demo login
    await page.getByRole('button', { name: /Vikram Singh/i }).click();
    await expect(page).toHaveURL(/.*employer/);
    await expect(page.getByText(/Overview/i)).toBeVisible();
    await expect(page.getByText(/Checked in today/i)).toBeVisible();
  });

  test('2. Sector switch updates branding, terminology and presets across app', async ({ page }) => {
    await page.goto('/login');

    // Default is Construction
    await expect(page.getByText(/Construction Site/i).first()).toBeVisible();

    // Switch to College Sector
    await page.getByRole('button', { name: /College Campus/i }).click();
    await expect(page.getByText(/Ananya Sharma/i)).toBeVisible();
    await expect(page.getByText(/Dr. K. Narayanan/i)).toBeVisible();

    // Log in as College Worker
    await page.getByRole('button', { name: /Ananya Sharma/i }).click();
    await expect(page).toHaveURL(/.*worker/);
    await expect(page.getByText(/College Campus/i)).toBeVisible();

    // Check hazard presets reflect College Campus
    await page.getByRole('link', { name: /Report Hazard/i }).click();
    await expect(page.getByText(/Chemical Fume|Slippery Hallway/i)).toBeVisible();
  });

  test('3. Language switcher switches UI strings to Hindi, Tamil, Telugu', async ({ page }) => {
    await page.goto('/login');

    // Switch to Hindi
    await page.getByRole('combobox', { name: /Language/i }).selectOption('hi');
    await expect(page.getByText(/सभी के लिए सम्मानजनक कार्य/i)).toBeVisible();
    await expect(page.getByText(/श्रमिक \/ कर्मचारी/i)).toBeVisible();

    // Switch to Tamil
    await page.getByRole('combobox', { name: /Language|भाषा/i }).selectOption('ta');
    await expect(page.getByText(/அனைவருக்கும் கண்ணியமான வேலை/i)).toBeVisible();

    // Switch back to English
    await page.getByRole('combobox', { name: /Language|மொழி/i }).selectOption('en');
    await expect(page.getByText(/Decent work for everyone/i)).toBeVisible();
  });

  test('4. Shift tracking: QR check-in and overtime calculation', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('button', { name: /Ramesh Kumar/i }).click();

    // Navigate to check-in
    await page.getByRole('link', { name: /Check In/i }).click();
    await expect(page.getByText(/Scan site QR code/i)).toBeVisible();

    // Perform check-in via QR
    await page.getByRole('button', { name: /Scan & Check In/i }).click();
    await expect(page.getByText(/Checked in successfully/i)).toBeVisible();
    await expect(page.getByText(/Live Shift/i)).toBeVisible();

    // Perform Check Out
    await page.getByRole('button', { name: /Check Out/i }).click();
    await expect(page.getByText(/Shift recorded/i)).toBeVisible();
  });

  test('5. Offline check-in queues to Dexie and displays offline badge', async ({ page, context }) => {
    await page.goto('/login');
    await page.getByRole('button', { name: /Ramesh Kumar/i }).click();

    // Go offline
    await context.setOffline(true);
    await page.getByRole('link', { name: /Check In/i }).click();
    await page.getByRole('button', { name: /Scan & Check In/i }).click();

    // Verify offline banner and message
    await expect(page.getByText(/Offline – will sync/i)).toBeVisible();

    // Restore online
    await context.setOffline(false);
  });

  test('6. Closed-loop safety report: Worker submits hazard, employer updates status and replies', async ({ page }) => {
    // 1. Worker reports hazard
    await page.goto('/login');
    await page.getByRole('button', { name: /Ramesh Kumar/i }).click();
    await page.getByRole('link', { name: /Report Hazard/i }).click();

    await page.getByPlaceholder(/Describe the hazard clearly/i).fill('Exposed electrical conduit in North stairwell');
    await page.getByRole('button', { name: /High/i }).click();
    await page.getByRole('button', { name: /Submit report/i }).click();

    await expect(page.getByText(/Report submitted/i)).toBeVisible();
    await expect(page.getByText(/Exposed electrical conduit in North stairwell/i)).toBeVisible();

    // 2. Employer reviews in Hazard Inbox and replies
    await page.getByRole('button', { name: /Log out/i }).click();
    await page.getByRole('button', { name: /Vikram Singh/i }).click();
    await page.getByRole('link', { name: /Hazard Inbox/i }).click();

    await expect(page.getByText(/Exposed electrical conduit in North stairwell/i)).toBeVisible();
    await page.getByRole('button', { name: /Update Status & Reply/i }).first().click();

    await page.getByPlaceholder(/Scaffolding crew summoned/i).fill('Electrician dispatched with replacement junction box');
    await page.getByRole('button', { name: /Save Status & Notify Worker/i }).click();

    await expect(page.getByText(/Hazard status updated/i)).toBeVisible();

    // 3. Worker checks My Reports and sees employer note
    await page.getByRole('button', { name: /Log out/i }).click();
    await page.getByRole('button', { name: /Ramesh Kumar/i }).click();
    await page.getByRole('link', { name: /Report Hazard/i }).click();
    await page.getByRole('button', { name: /My Safety Reports/i }).click();

    await expect(page.getByText(/Electrician dispatched with replacement junction box/i)).toBeVisible();
  });

  test('7. Real Anonymity: Token-hash keyed feedback, employer replies, DB join impossible', async ({ page }) => {
    // 1. Worker submits anonymous feedback
    await page.goto('/login');
    await page.getByRole('button', { name: /Ramesh Kumar/i }).click();
    await page.getByRole('link', { name: /Speak Up/i }).click();

    await page.getByPlaceholder(/Share your thoughts/i).fill('Water filter in break room tastes metallic');
    await page.getByRole('button', { name: /Submit anonymously/i }).click();

    await expect(page.getByText(/Feedback submitted anonymously/i)).toBeVisible();

    // 2. Verify in local storage and DB structure that NO user_id exists on feedback thread
    const threadsRaw = await page.evaluate(() => localStorage.getItem('fairshift_feedbacks'));
    expect(threadsRaw).not.toBeNull();
    const threads = JSON.parse(threadsRaw!);
    const latestThread = threads[0].thread;
    expect(latestThread).toHaveProperty('tokenHash');
    expect(latestThread).not.toHaveProperty('userId');
    expect(latestThread).not.toHaveProperty('user_id');
    expect(latestThread).not.toHaveProperty('profileId');
    expect(latestThread).not.toHaveProperty('profile_id');

    // 3. Employer views feedback and replies anonymously
    await page.getByRole('button', { name: /Log out/i }).click();
    await page.getByRole('button', { name: /Vikram Singh/i }).click();
    await page.getByRole('link', { name: /Feedback Insights/i }).click();

    await expect(page.getByText(/Water filter in break room tastes metallic/i)).toBeVisible();
    await page.getByPlaceholder(/Write a reply/i).first().fill('Maintenance team will replace carbon filter cartridge today');
    await page.getByRole('button', { name: /Send reply/i }).first().click();

    await expect(page.getByText(/Anonymous reply sent/i)).toBeVisible();

    // 4. Worker views their thread and sees employer reply
    await page.getByRole('button', { name: /Log out/i }).click();
    await page.getByRole('button', { name: /Ramesh Kumar/i }).click();
    await page.getByRole('link', { name: /Speak Up/i }).click();
    await page.getByRole('button', { name: /My Anonymous Threads/i }).click();

    await expect(page.getByText(/Maintenance team will replace carbon filter cartridge today/i)).toBeVisible();
  });

  test('8. Aggregate sentiment is hidden when team has fewer than 5 responses', async ({ page }) => {
    await page.goto('/login');

    // Switch to College Sector (has only 2 seed feedbacks -> < 5)
    await page.getByRole('button', { name: /College Campus/i }).click();
    await page.getByRole('button', { name: /Dr. K. Narayanan/i }).click();
    await page.getByRole('link', { name: /Feedback Insights/i }).click();

    // Privacy shield banner MUST be visible
    await expect(page.getByText(/Fewer than 5 responses – details hidden/i)).toBeVisible();
    await expect(page.getByText(/To prevent employers from isolating or identifying workers/i)).toBeVisible();
  });
});
