import { test, expect } from '@playwright/test';

test.describe('PWA Offline & Airplane Mode E2E', () => {
  test('loads completely offline, registers service worker, and calculates prayer times in airplane mode', async ({
    page,
    context,
  }) => {
    // 1. Initial online load to cache shell and register service worker
    await page.goto('/');
    await expect(page).toHaveTitle(/Kerala Athaan/);

    // Wait for prayer times and home hero card to render
    const fajrLabel = page.getByText(/സുബ്ഹ്|Fajr/i).first();
    await expect(fajrLabel).toBeVisible();

    // Verify PWA Manifest is linked
    const manifestLink = page.locator('link[rel="manifest"]');
    await expect(manifestLink).toHaveAttribute('href', '/manifest.webmanifest');

    // 2. Simulate Airplane Mode (disconnect network completely)
    await context.setOffline(true);

    // 3. Reload page while completely offline
    await page.reload();

    // Verify app still renders fully from Service Worker cache
    await expect(page).toHaveTitle(/Kerala Athaan/);
    await expect(fajrLabel).toBeVisible();

    // 4. Test offline navigation between tabs
    // Navigate to Daily View
    const dailyTab = page.getByRole('tab', { name: /ദിവസേന|Daily/i });
    await dailyTab.click();
    await expect(page.getByText(/ദിവസേനയുള്ള സമയപ്പട്ടിക|Daily Timetable/i)).toBeVisible();

    // Navigate to Monthly View
    const monthlyTab = page.getByRole('tab', { name: /മാസാന്തം|Monthly/i });
    await monthlyTab.click();
    await expect(page.getByText(/പ്രതിമാസ നിസ്കാര കലണ്ടർ|Monthly Prayer Timetable/i)).toBeVisible();

    // Test Dual Calendar sub-tab
    const dualCalSubTab = page.getByRole('button', { name: /ഹിജ്റ കലണ്ടർ|Dual Calendar/i });
    await dualCalSubTab.click();
    await expect(page.getByText(/എന്റെ മാറ്റങ്ങൾ|My Adjustments/i)).toBeVisible();

    // Test Ramadan & Fasting sub-tab
    const ramadanSubTab = page.getByRole('button', { name: /റമദാൻ & നോമ്പ്|Ramadan & Fasting/i });
    await ramadanSubTab.click();
    await expect(page.getByText(/നോമ്പ് സമയ കൗണ്ട്ഡൗൺ|Fasting Countdown/i)).toBeVisible();
    await expect(
      page.getByText(/മാസപ്പിറവി കാണുന്നതിനനുസരിച്ച് റമദാൻ തീയതികളിൽ മാറ്റമുണ്ടാകാം|Ramadan dates are subject to moon sighting/i).first(),
    ).toBeVisible();

    // Navigate to Locations View
    const locationsTab = page.getByRole('tab', { name: /സ്ഥലങ്ങൾ|Locations/i });
    await locationsTab.click();
    await expect(page.getByText(/സംരക്ഷിച്ച സ്ഥലങ്ങൾ|Saved Locations/i)).toBeVisible();

    // Test offline gazetteer search
    const searchInput = page.getByPlaceholder(/സ്ഥലം അല്ലെങ്കിൽ ജില്ല തിരയുക|Search town/i);
    await searchInput.fill('Kozhikode');
    await expect(page.getByText(/കോഴിക്കോട്|Kozhikode/i).first()).toBeVisible();

    // Navigate to Settings View
    const settingsTab = page.getByRole('tab', { name: /ക്രമീകരണങ്ങൾ|Settings/i });
    await settingsTab.click();
    await expect(page.getByText(/കണക്കുകൂട്ടൽ ക്രമീകരണങ്ങൾ|Calculation Settings/i)).toBeVisible();
  });
});
