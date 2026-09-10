import {defineConfig} from 'vite';
import tailwindcss from '@tailwindcss/postcss';
import {fileURLToPath} from 'node:url';
export default defineConfig({
 base:'/blowup/',
 resolve:{alias:{'@':fileURLToPath(new URL('./src',import.meta.url))}},
 esbuild:{jsx:'automatic'},
 css:{postcss:{plugins:[tailwindcss()]}},
 build:{outDir:'../../blowup',emptyOutDir:true},
});
