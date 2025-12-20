import { defineConfig } from "playwright";
export default defineConfig({
  timeout: 60_000,
  use: { headless: true, viewport: { width: 1280, height: 800 }, ignoreHTTPSErrors: true }
});
