import fs from 'node:fs';
import path from 'node:path';

const androidDir = path.resolve('android');
const appGradle = path.join(androidDir, 'app', 'build.gradle');
const proguardFile = path.join(androidDir, 'app', 'proguard-rules.pro');

if (!fs.existsSync(appGradle)) {
  throw new Error(`Android app Gradle file not found: ${appGradle}`);
}

let gradle = fs.readFileSync(appGradle, 'utf8');

// Google Play requires each uploaded bundle to have a higher versionCode.
gradle = gradle.replace(/versionCode\s+\d+/, 'versionCode 3');
gradle = gradle.replace(/versionName\s+['"][^'"]+['"]/, "versionName '1.2'");

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

const keepRules = `# ASCEND Path release rules\n# Keep Capacitor bridge/plugin entry points that are discovered dynamically.\n-keep class com.getcapacitor.** { *; }\n-keep interface com.getcapacitor.** { *; }\n-keep class org.apache.cordova.** { *; }\n-keepattributes *Annotation*\n-keepattributes Signature\n`;

const existingRules = fs.existsSync(proguardFile) ? fs.readFileSync(proguardFile, 'utf8') : '';
if (!existingRules.includes('# ASCEND Path release rules')) {
  fs.writeFileSync(proguardFile, `${existingRules.trim()}\n\n${keepRules}`.trimStart());
}

console.log('Configured release optimization: versionCode=3, versionName=1.2, R8 minification enabled, resource shrinking enabled.');
