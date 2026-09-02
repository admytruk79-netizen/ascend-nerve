import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root=path.resolve('www');
const read=name=>fs.readFileSync(path.join(root,name),'utf8');

const runtimeUiFiles=[
  'approved-screens.js',
  'design-v3-today.js',
  'training-dashboard.js',
  'contextual-library.js',
  'month-path.js',
  'mirror-engine.js',
  'training-layers.js',
  'practitioner-mode.js',
  'practice-timer-authority.js'
];

test('frontend helpers do not inject stylesheets or style tags at runtime',()=>{
  for(const file of runtimeUiFiles){
    const source=read(file);
    assert.doesNotMatch(source,/createElement\(['"]style['"]\)/,`${file} must not create runtime style tags`);
    assert.doesNotMatch(source,/createElement\(['"]link['"]\)/,`${file} must not create runtime stylesheet links`);
    assert.doesNotMatch(source,/\.rel\s*=\s*['"]stylesheet['"]/,`${file} must not inject stylesheets`);
  }
});

test('retired Today and approved-screen helpers do not rebuild primary screens',()=>{
  const approved=read('approved-screens.js');
  const today=read('design-v3-today.js');
  assert.doesNotMatch(approved,/approved-hero|initiation-school\.css|insertAdjacentElement\(['"]afterend['"]|screen\.prepend/);
  assert.doesNotMatch(today,/today-v3|approved-hero|initiation-school\.css|approved-screens\.js/);
});

test('practice timer is elapsed-time authoritative and cannot complete from interval count alone',()=>{
  const timer=read('practice-timer-authority.js');
  const bridge=read('design-v3-today.js');
  assert.match(timer,/deadline=Date\.now\(\)\+remainingMs/);
  assert.match(timer,/remainingMs=Math\.max\(0,deadline-Date\.now\(\)\)/);
  assert.match(timer,/if\(remainingMs<=0\)complete\(\)/);
  assert.match(timer,/current\.cloneNode\(true\)/);
  assert.match(timer,/data\.timerAuthority|dataset\.timerAuthority/);
  assert.match(bridge,/practice-timer-authority\.js/);
});

test('theme and component CSS are statically composed',()=>{
  const theme=read('theme.css');
  assert.match(theme,/theme-authority\.css/);
  assert.match(theme,/mirror-component\.css/);
  assert.match(theme,/training-components\.css/);
});

test('signing identity remains outside frontend reconstruction',()=>{
  const capacitor=JSON.parse(fs.readFileSync(path.resolve('capacitor.config.json'),'utf8'));
  assert.equal(capacitor.appId,'com.ascend.path');
  assert.equal(capacitor.appName,'ASCEND Path');
  assert.equal(capacitor.webDir,'www');
});