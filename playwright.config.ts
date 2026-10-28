import { defineConfig } from '@playwright/test';
import { existsSync } from 'node:fs';

const candidates = [
  process.env['CHROME_PATH'],
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files/BraveSoftware/Brave-Browser/Application/brave.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
].filter((value): value is string => !!value);
const executablePath = candidates.find(path => existsSync(path));
export default defineConfig({
  testDir: './e2e', fullyParallel: false, workers: 1, timeout: 45000, retries: 0,
  reporter: 'list', outputDir: 'test-results',
  use: { baseURL: 'http://127.0.0.1:4200', headless: true, viewport: { width: 1440, height: 1000 }, launchOptions: { executablePath }, trace: 'retain-on-failure' },
  webServer: { command: 'node node_modules/@angular/cli/bin/ng.js serve --host 127.0.0.1 --port 4200', url: 'http://127.0.0.1:4200', reuseExistingServer: !process.env['CI'], timeout: 120000 },
});
