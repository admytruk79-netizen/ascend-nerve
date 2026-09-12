import {defineConfig} from '@playwright/test';

export default defineConfig({
  testDir:'./tests/e2e',
  timeout:30000,
  expect:{timeout:5000},
  // The integrity suite intentionally models one authenticated ASCEND account
  // and one progression record. Running those stateful integration scenarios
  // in parallel creates competing bootstrap/save sessions that do not represent
  // the single-session mobile app and made CI nondeterministic.
  fullyParallel:false,
  workers:1,
  use:{baseURL:'http://127.0.0.1:4173',headless:true},
  webServer:{
    command:'python3 -m http.server 4173 -d www',
    url:'http://127.0.0.1:4173',
    reuseExistingServer:true,
    timeout:15000
  }
});
