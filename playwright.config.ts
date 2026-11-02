import { defineConfig, devices } from '@playwright/test';
export default defineConfig({testDir:'./e2e',fullyParallel:true,use:{baseURL:'http://127.0.0.1:4175',trace:'retain-on-failure'},webServer:{command:'npm run dev -- --port 4175 --strictPort',url:'http://127.0.0.1:4175',reuseExistingServer:!process.env.CI},projects:[{name:'desktop',use:{...devices['Desktop Chrome']}},{name:'mobile',use:{...devices['iPhone 13'],defaultBrowserType:'chromium'}}]});

