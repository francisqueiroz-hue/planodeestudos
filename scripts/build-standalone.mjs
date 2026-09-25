// Gera standalone/painel-de-estudos.html: página única com dados, gerador e interface embutidos.
// Uso: npm run build:standalone
import {build} from 'esbuild';
import {readFileSync,writeFileSync} from 'node:fs';
const res=await build({entryPoints:['standalone/app.ts'],bundle:true,format:'iife',target:'es2019',minify:true,write:false,legalComments:'none'});
const js=res.outputFiles[0].text.replace(/<\/script/gi,'<\\/script');
const html=readFileSync('standalone/template.html','utf8').replace('/*APP*/',()=>js);
writeFileSync('standalone/painel-de-estudos.html',html);
console.log(`standalone/painel-de-estudos.html: ${(html.length/1024).toFixed(0)} KB`);
