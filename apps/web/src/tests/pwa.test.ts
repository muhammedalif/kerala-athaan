import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('PWA Manifest & Precache Compliance', () => {
  const distDir = path.resolve(__dirname, '../../dist');

  it('generates a valid W3C Web App Manifest on build', () => {
    const manifestPath = path.join(distDir, 'manifest.webmanifest');
    expect(fs.existsSync(manifestPath), 'manifest.webmanifest must exist in dist').toBe(true);

    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

    // Manifest specifications
    expect(manifest.name).toBe('Kerala Athaan - കേരള അദാൻ');
    expect(manifest.short_name).toBe('Kerala Athaan');
    expect(manifest.theme_color).toBe('#0B6E4F');
    expect(manifest.background_color).toBe('#FAF7F0');
    expect(manifest.display).toBe('standalone');
    expect(manifest.start_url).toBe('/');
    expect(manifest.orientation).toBe('portrait');

    // Icons
    expect(Array.isArray(manifest.icons)).toBe(true);
    expect(manifest.icons.length).toBeGreaterThanOrEqual(2);

    const hasMaskable = manifest.icons.some(
      (icon: { purpose?: string }) => icon.purpose?.includes('maskable'),
    );
    expect(hasMaskable, 'PWA must declare maskable icons for Android').toBe(true);
  });

  it('generates the Service Worker script (sw.js) with precache entries', () => {
    const swPath = path.join(distDir, 'sw.js');
    expect(fs.existsSync(swPath), 'sw.js must exist in dist').toBe(true);

    const swContent = fs.readFileSync(swPath, 'utf8');

    // Verify workbox precache manifest injection
    expect(swContent).toContain('precacheAndRoute');
  });

  it('contains valid PWA icons in the public/dist directory', () => {
    const svgIcon = path.join(distDir, 'icons/icon.svg');
    const png192 = path.join(distDir, 'icons/icon-192.png');
    const png512 = path.join(distDir, 'icons/icon-512.png');

    expect(fs.existsSync(svgIcon)).toBe(true);
    expect(fs.existsSync(png192)).toBe(true);
    expect(fs.existsSync(png512)).toBe(true);

    // PNG headers (8-byte PNG magic signature: 0x89, 'P', 'N', 'G')
    const pngBuf = fs.readFileSync(png192);
    expect(pngBuf[0]).toBe(0x89);
    expect(pngBuf[1]).toBe(0x50);
    expect(pngBuf[2]).toBe(0x4e);
    expect(pngBuf[3]).toBe(0x47);
  });
});
