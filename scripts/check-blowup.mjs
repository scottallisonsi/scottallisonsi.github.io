import assert from 'node:assert/strict';
import {readFile,stat} from 'node:fs/promises';
const root=new URL('../',import.meta.url);
const homepage=await readFile(new URL('index.html',root),'utf8');
assert.match(homepage,/href="https:\/\/scottallisonsi\.github\.io\/blowup\/"/);
for(const tag of homepage.match(/<(?:script|link|iframe|img)\b[^>]*>/g)||[]){
 assert.ok(!/blowup|three|watch-scene/i.test(tag),'Watch resources must not load on the homepage: '+tag);
}
const html=await readFile(new URL('blowup/index.html',root),'utf8');
assert.doesNotMatch(html,/chatgpt\.site|localhost|127\.0\.0\.1/);
for(const [,path] of html.matchAll(/(?:src|href)="(\/blowup\/[^\"]+)"/g))assert.ok((await stat(new URL(path.slice(1),root))).isFile());
await stat(new URL('.nojekyll',root)); // served as plain files, no Jekyll
console.log('Blowup link, asset paths and homepage isolation verified.');
