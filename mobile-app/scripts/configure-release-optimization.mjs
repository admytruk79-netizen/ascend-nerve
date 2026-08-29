import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const androidDir = path.resolve('android');
const appGradle = path.join(androidDir, 'app', 'build.gradle');
const rootGradle = path.join(androidDir, 'build.gradle');
const variablesGradle = path.join(androidDir, 'variables.gradle');
const proguardFile = path.join(androidDir, 'app', 'proguard-rules.pro');

for (const required of [appGradle, rootGradle, variablesGradle]) {
  if (!fs.existsSync(required)) {
    throw new Error(`Required Android Gradle file not found: ${required}`);
  }
}

let gradle = fs.readFileSync(appGradle, 'utf8');
let root = fs.readFileSync(rootGradle, 'utf8');
let variables = fs.readFileSync(variablesGradle, 'utf8');

// Google Play requires Android 16 / API 36 for new apps and app updates
// submitted from Aug 31, 2026. Capacitor 7.6.x still generates API 35,
// so enforce API 36 after every fresh `cap add android`.
variables = variables.replace(/compileSdkVersion\s*=\s*\d+/, 'compileSdkVersion = 36');
variables = variables.replace(/targetSdkVersion\s*=\s*\d+/, 'targetSdkVersion = 36');

// API 36 requires Android Gradle Plugin 8.9.1 or newer. Capacitor 7.6.x
// generates AGP 8.7.2 while its Gradle 8.11.1 wrapper is already compatible.
root = root.replace(
  /classpath ['"]com\.android\.tools\.build:gradle:[^'"]+['"]/,
  "classpath 'com.android.tools.build:gradle:8.9.1'"
);

// Google Play requires each uploaded bundle to have a higher versionCode.
gradle = gradle.replace(/versionCode\s+\d+/, 'versionCode 6');
gradle = gradle.replace(/versionName\s+['"][^'"]+['"]/, "versionName '1.5'");

// Capacitor's generated release block is intentionally minimal. Turn on R8
// code shrinking/obfuscation and Android resource shrinking for Play builds.
if (/release\s*\{[\s\S]*?minifyEnabled\s+(true|false)/m.test(gradle)) {
  gradle = gradle.replace(/(release\s*\{[\s\S]*?minifyEnabled\s+)false/m, '$1true');
  if (!/release\s*\{[\s\S]*?shrinkResources\s+true/m.test(gradle)) {
    gradle = gradle.replace(/(release\s*\{)/m, '$1\n            shrinkResources true');
  }
} else {
  gradle = gradle.replace(
    /(release\s*\{)/m,
    `$1\n            minifyEnabled true\n            shrinkResources true\n            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'`
  );
}

if (!/proguardFiles\s+getDefaultProguardFile\('proguard-android-optimize\.txt'\),\s*'proguard-rules\.pro'/m.test(gradle)) {
  gradle = gradle.replace(
    /(release\s*\{)/m,
    `$1\n            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'`
  );
}

fs.writeFileSync(appGradle, gradle);
fs.writeFileSync(rootGradle, root);
fs.writeFileSync(variablesGradle, variables);

const keepRules = `# ASCEND Path release rules\n# Keep Capacitor bridge/plugin entry points that are discovered dynamically.\n-keep class com.getcapacitor.** { *; }\n-keep interface com.getcapacitor.** { *; }\n-keep class org.apache.cordova.** { *; }\n-keepattributes *Annotation*\n-keepattributes Signature\n`;

const existingRules = fs.existsSync(proguardFile) ? fs.readFileSync(proguardFile, 'utf8') : '';
if (!existingRules.includes('# ASCEND Path release rules')) {
  fs.writeFileSync(proguardFile, `${existingRules.trim()}\n\n${keepRules}`.trimStart());
}

// Capacitor generates its own blue launcher icon whenever the Android shell is
// created. Replace every launcher density after cap sync so ASCEND Path always
// ships with its own identity instead of the Capacitor default.
const launcherSource = path.resolve('www', 'assets', 'ascend-logo.png');
const resDir = path.join(androidDir, 'app', 'src', 'main', 'res');
if (!fs.existsSync(launcherSource)) {
  throw new Error(`ASCEND Path launcher artwork not found: ${launcherSource}`);
}

const densities = [
  ['mdpi', 48, 108],
  ['hdpi', 72, 162],
  ['xhdpi', 96, 216],
  ['xxhdpi', 144, 324],
  ['xxxhdpi', 192, 432],
];

for (const [density, legacySize, adaptiveSize] of densities) {
  const dir = path.join(resDir, `mipmap-${density}`);
  fs.mkdirSync(dir, { recursive: true });

  const legacy = await sharp(launcherSource)
    .resize(legacySize, legacySize, { fit: 'cover' })
    .png()
    .toBuffer();
  fs.writeFileSync(path.join(dir, 'ic_launcher.png'), legacy);
  fs.writeFileSync(path.join(dir, 'ic_launcher_round.png'), legacy);

  const glyph = Math.round(adaptiveSize * 0.68);
  const padA = Math.floor((adaptiveSize - glyph) / 2);
  const padB = adaptiveSize - glyph - padA;
  await sharp(launcherSource)
    .resize(glyph, glyph, { fit: 'contain' })
    .extend({
      top: padA,
      bottom: padB,
      left: padA,
      right: padB,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toFile(path.join(dir, 'ic_launcher_foreground.png'));
}

const anyDpi = path.join(resDir, 'mipmap-anydpi-v26');
fs.mkdirSync(anyDpi, { recursive: true });
const adaptiveIconXml = `<?xml version="1.0" encoding="utf-8"?>\n<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">\n    <background android:drawable="@color/ic_launcher_background" />\n    <foreground android:drawable="@mipmap/ic_launcher_foreground" />\n</adaptive-icon>\n`;
fs.writeFileSync(path.join(anyDpi, 'ic_launcher.xml'), adaptiveIconXml);
fs.writeFileSync(path.join(anyDpi, 'ic_launcher_round.xml'), adaptiveIconXml);

const valuesDir = path.join(resDir, 'values');
fs.mkdirSync(valuesDir, { recursive: true });
fs.writeFileSync(
  path.join(valuesDir, 'ic_launcher_background.xml'),
  `<?xml version="1.0" encoding="utf-8"?>\n<resources>\n    <color name="ic_launcher_background">#07131D</color>\n</resources>\n`
);
console.log('Installed ASCEND Path launcher icons for legacy and adaptive Android launchers.');

// Release-only web asset optimization. Keep the original PNG artwork in source
// control, but ship WebP copies in the Android bundle and remove the larger PNGs.
const webRoot = path.join(androidDir, 'app', 'src', 'main', 'assets', 'public');
const seasonalDir = path.join(webRoot, 'assets', 'seasonal-art');
const seasonalScript = path.join(webRoot, 'seasonal-layer.js');
let originalBytes = 0;
let optimizedBytes = 0;
let converted = 0;

if (fs.existsSync(seasonalDir)) {
  const pngFiles = fs.readdirSync(seasonalDir).filter(name => name.toLowerCase().endsWith('.png'));
  for (const name of pngFiles) {
    const input = path.join(seasonalDir, name);
    const output = path.join(seasonalDir, name.replace(/\.png$/i, '.webp'));
    originalBytes += fs.statSync(input).size;
    await sharp(input)
      .webp({ quality: 80, effort: 6, smartSubsample: true })
      .toFile(output);
    optimizedBytes += fs.statSync(output).size;
    fs.unlinkSync(input);
    converted += 1;
  }

  if (fs.existsSync(seasonalScript) && converted > 0) {
    const source = fs.readFileSync(seasonalScript, 'utf8');
    fs.writeFileSync(seasonalScript, source.replace(/\.png(['"`])/g, '.webp$1'));
  }
}

if (converted > 0) {
  const saved = originalBytes - optimizedBytes;
  const percent = originalBytes ? Math.round((saved / originalBytes) * 100) : 0;
  console.log(`Optimized ${converted} seasonal images: ${(originalBytes / 1048576).toFixed(2)} MB -> ${(optimizedBytes / 1048576).toFixed(2)} MB (${percent}% smaller).`);
}

console.log('Configured Play release: versionCode=6, versionName=1.5, compileSdk=36, targetSdk=36, AGP=8.9.1, R8/resource shrinking enabled.');
