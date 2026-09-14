import {readFileSync,writeFileSync,copyFileSync,mkdirSync} from 'node:fs';
import {dirname,resolve,normalize} from 'node:path';

const manifestPath=process.argv[2]||'android/app/src/main/AndroidManifest.xml';
let manifest=readFileSync(manifestPath,'utf8');
const marker='android:host="auth-callback"';

if(!manifest.includes(marker)){
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
  manifest=manifest.slice(0,insertAt)+oauthFilter+manifest.slice(insertAt);
  console.log('Configured com.ascend.path://auth-callback for Google OAuth.');
}else{
  console.log('ASCEND OAuth intent filter already configured.');
}

/* Only mutate launcher resources for the real generated Capacitor manifest.
   Unit tests pass a temporary manifest and must remain side-effect free. */
const normalizedManifest=normalize(manifestPath).replaceAll('\\','/');
const isGeneratedAndroidManifest=normalizedManifest.endsWith('android/app/src/main/AndroidManifest.xml');

if(isGeneratedAndroidManifest){
  const launcherSource=resolve('www/assets/ascend-logo.png');
  const launcherTarget=resolve('android/app/src/main/res/drawable/ascend_launcher.png');
  mkdirSync(dirname(launcherTarget),{recursive:true});
  copyFileSync(launcherSource,launcherTarget);

  manifest=manifest
    .replace(/android:icon="[^"]+"/,'android:icon="@drawable/ascend_launcher"')
    .replace(/android:roundIcon="[^"]+"/,'android:roundIcon="@drawable/ascend_launcher"');

  if(!manifest.includes('android:icon="@drawable/ascend_launcher"')){
    throw new Error('Could not configure the ASCEND Android launcher icon.');
  }
  console.log('Configured ASCEND launcher icon for generated Android build.');
}

writeFileSync(manifestPath,manifest);
