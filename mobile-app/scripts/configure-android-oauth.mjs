import {readFileSync,writeFileSync} from 'node:fs';

const manifestPath=process.argv[2]||'android/app/src/main/AndroidManifest.xml';
const manifest=readFileSync(manifestPath,'utf8');
const marker='android:host="auth-callback"';

if(manifest.includes(marker)){
  console.log('ASCEND OAuth intent filter already configured.');
  process.exit(0);
}

const launcherEnd='</intent-filter>';
const index=manifest.indexOf(launcherEnd);
if(index<0)throw new Error('Could not locate the Android launcher intent filter.');

const insertAt=index+launcherEnd.length;
const oauthFilter=`
            <intent-filter>
                <action android:name="android.intent.action.VIEW" />
                <category android:name="android.intent.category.DEFAULT" />
                <category android:name="android.intent.category.BROWSABLE" />
                <data android:scheme="@string/custom_url_scheme" android:host="auth-callback" />
            </intent-filter>`;

writeFileSync(manifestPath,manifest.slice(0,insertAt)+oauthFilter+manifest.slice(insertAt));
console.log('Configured com.ascend.path://auth-callback for Google OAuth.');
