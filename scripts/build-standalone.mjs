// Gera a versão independente do Painel de Estudos a partir de standalone/app.ts:
//  - standalone/painel-de-estudos.html: página única (publicada como artifact no claude.ai);
//  - standalone/app/: aplicativo instalável (PWA) para hospedar em qualquer site estático
//    (Netlify Drop, Cloudflare Pages, GitHub Pages) e instalar no computador e no celular;
//  - standalone/painel-de-estudos-app.zip: a pasta app/ compactada, pronta para enviar.
// Uso: npm run build:standalone
import {build} from 'esbuild';
import {createHash} from 'node:crypto';
import {copyFileSync,mkdirSync,readFileSync,rmSync,writeFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';

const res=await build({entryPoints:['standalone/app.ts'],bundle:true,format:'iife',target:'es2019',minify:true,write:false,legalComments:'none'});
const js=res.outputFiles[0].text.replace(/<\/script/gi,'<\\/script');
const template=readFileSync('standalone/template.html','utf8');
const page=template.replace('/*APP*/',()=>js);
writeFileSync('standalone/painel-de-estudos.html',page);

// ---------- Aplicativo instalável ----------
const version=createHash('sha256').update(page).digest('hex').slice(0,10);
const split=page.indexOf('<div id="app">');
const head=page.slice(0,split),body=page.slice(split);
const pwa=`<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="theme-color" content="#0b0c10">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="Estudos">
<link rel="manifest" href="manifest.webmanifest">
<link rel="icon" href="icon-192.png">
<link rel="apple-touch-icon" href="apple-touch-icon.png">
<style>html{padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}body{margin:0}[hidden]{display:none!important}</style>
${head}</head>
<body>
${body}
<script>if('serviceWorker' in navigator)addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{}));</script>
</body>
</html>
`;
const manifest={name:'Painel de Estudos · 8º ano',short_name:'Estudos',description:'Estudos do 8º ano com foco em Matemática: questões com gabarito, treino rápido, simulado e plano anual.',lang:'pt-BR',start_url:'./',scope:'./',display:'standalone',background_color:'#0b0c10',theme_color:'#0b0c10',icons:[{src:'icon-192.png',sizes:'192x192',type:'image/png'},{src:'icon-512.png',sizes:'512x512',type:'image/png'},{src:'icon-maskable-512.png',sizes:'512x512',type:'image/png',purpose:'maskable'}]};
const files=['./','index.html','manifest.webmanifest','icon-192.png','icon-512.png','icon-maskable-512.png','apple-touch-icon.png'];
const sw=`// Guarda o app no aparelho para abrir sem internet; atualiza em segundo plano quando houver versão nova.
const CACHE='painel-estudos-${version}';
const FILES=${JSON.stringify(files)};
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
 const req=e.request;if(req.method!=='GET')return;
 const url=new URL(req.url);
 if(url.origin===location.origin){
  // Cache primeiro; busca a versão nova para a próxima abertura.
  e.respondWith(caches.match(req,{ignoreSearch:true}).then(hit=>{const net=fetch(req).then(r=>{if(r.ok)caches.open(CACHE).then(c=>c.put(req,r.clone()));return r}).catch(()=>hit);return hit||net}));
 }else if(url.hostname.endsWith('fonts.googleapis.com')||url.hostname.endsWith('fonts.gstatic.com')){
  e.respondWith(caches.open(CACHE).then(c=>c.match(req).then(hit=>hit||fetch(req).then(r=>{if(r.ok||r.type==='opaque')c.put(req,r.clone());return r}))));
 }
});
`;
rmSync('standalone/app',{recursive:true,force:true});
mkdirSync('standalone/app',{recursive:true});
writeFileSync('standalone/app/index.html',pwa);
writeFileSync('standalone/app/manifest.webmanifest',JSON.stringify(manifest,null,2));
writeFileSync('standalone/app/sw.js',sw);
for(const f of ['icon-192.png','icon-512.png','icon-maskable-512.png','apple-touch-icon.png'])copyFileSync(`standalone/icons/${f}`,`standalone/app/${f}`);
rmSync('standalone/painel-de-estudos-app.zip',{force:true});
try{execFileSync('python3',['-c',"import shutil;shutil.make_archive('standalone/painel-de-estudos-app','zip','standalone/app')"])}catch{console.warn('Não foi possível gerar o .zip (python3 ausente); use a pasta standalone/app.')}
console.log(`standalone/painel-de-estudos.html: ${(page.length/1024).toFixed(0)} KB · standalone/app/ (versão ${version})`);
