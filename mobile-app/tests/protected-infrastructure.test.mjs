import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const here = path.dirname(fileURLToPath(import.meta.url));
const mobileRoot = path.resolve(here, '..');
const repoRoot = path.resolve(mobileRoot, '..');

async function readJson(file) {
  return JSON.parse(await readFile(file, 'utf8'));
}

test('Capacitor identity remains compatible with the existing Play application', async () => {
  const config = await readJson(path.join(mobileRoot, 'capacitor.config.json'));
  assert.equal(config.appId, 'com.ascend.path');
  assert.equal(config.appName, 'ASCEND Path');
  assert.equal(config.webDir, 'www');
});

test('Android signing workflow keeps established signing secret contract', async () => {
  const workflow = await readFile(path.join(repoRoot, '.github', 'workflows', 'build-android-aab.yml'), 'utf8');
  for (const secret of [
    'ANDROID_KEYSTORE_BASE64',
    'ANDROID_KEY_ALIAS',
    'ANDROID_STORE_PASSWORD',
    'ANDROID_KEY_PASSWORD'
  ]) {
    assert.match(workflow, new RegExp(`secrets\\.${secret}`), `missing protected signing secret ${secret}`);
  }
  assert.match(workflow, /bundleRelease/);
  assert.match(workflow, /jarsigner/);
});

test('Capacitor native dependencies required by the current wrapper remain installed', async () => {
  const pkg = await readJson(path.join(mobileRoot, 'package.json'));
  for (const dep of ['@capacitor/app', '@capacitor/android', '@capacitor/core', '@capacitor/haptics']) {
    assert.ok(pkg.dependencies?.[dep], `missing protected native dependency ${dep}`);
  }
});
