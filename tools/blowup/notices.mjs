import {readFile,writeFile,readdir} from 'node:fs/promises';
const root=new URL('./',import.meta.url);
const lock=JSON.parse(await readFile(new URL('package-lock.json',root),'utf8'));
const notices=['Third-party package notices for the Blowup build. Includes build-time tools. These files are not loaded by the webpage.\n'];
for(const name of Object.keys(lock.packages).filter(p=>p.startsWith('node_modules/')).sort()){
 const dir=new URL(name+'/',root);
 const files=await readdir(dir).catch(()=>[]);
 const license=files.find(f=>/^licen[sc]e(?:\.(?:md|txt))?$/i.test(f));
 if(license)notices.push('\n--- '+name.replace(/^node_modules\//,'')+' ---\n'+await readFile(new URL(license,dir),'utf8'));
}
await writeFile(new URL('../../blowup/THIRD_PARTY_LICENSES.txt',root),notices.join('\n'));
