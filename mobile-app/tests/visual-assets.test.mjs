import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {ASCEND_VISUAL_ASSETS,ASCEND_SEMANTIC_ART,ASCEND_ENVIRONMENT_ASSETS,semanticAssetFor} from '../www/app/data/visual-assets.js';

const here=path.dirname(fileURLToPath(import.meta.url));
const librarySource=fs.readFileSync(path.join(here,'../www/app/screens/library.js'),'utf8');

test('ASCEND Path owns the full 38-image visual registry',()=>{
  assert.equal(ASCEND_VISUAL_ASSETS.length,38);
  assert.equal(new Set(ASCEND_VISUAL_ASSETS.map(asset=>asset.src)).size,38);
  assert.equal(ASCEND_SEMANTIC_ART.length,34);
  assert.equal(ASCEND_ENVIRONMENT_ASSETS.length,4);
});

test('all physically present semantic artwork is represented including the previously orphaned April image',()=>{
  const ids=new Set(ASCEND_SEMANTIC_ART.map(asset=>asset.id));
  assert.ok(ids.has('spring-april-clarifying-the-will'));
  assert.ok(ids.has('march-what-am-i-noticing'));
  assert.ok(ids.has('june-gathering-energy'));
  assert.ok(ids.has('july-discipline-fire'));
  assert.ok(ids.has('august-presence-devotion'));
});

test('Library artwork is explicit and semantic rather than hash-assigned by curriculum month',()=>{
  assert.equal(semanticAssetFor({title:'Generic teaching',metadata:{}}),null);
  assert.equal(semanticAssetFor({metadata:{art_key:'discipline-or-freedom'}})?.id,'discipline-or-freedom');
  assert.doesNotMatch(librarySource,/function\s+hashSlug|SEASONAL_ART|seasonForMonth\s*\(/);
  assert.match(librarySource,/semanticAssetFor/);
  assert.match(librarySource,/Seasonal & Visual/);
});

test('visual collection is support-only and opens artwork rather than a teaching reader',()=>{
  assert.match(librarySource,/function\s+visualCard/);
  assert.match(librarySource,/openArtwork\(asset\)/);
  assert.doesNotMatch(librarySource,/visualCard[\s\S]{0,1500}openItem\(/);
});
