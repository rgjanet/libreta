// Assembles the published site into _site/ : copies files, injects SEO tags, writes sitemap.xml,
// robots.txt, favicon.ico and one small "share page" per post/work so links show a preview card.
const fs=require('fs'),path=require('path');
const OUT='_site';
const rd=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const site=rd('content/site.es.json');
let SITE=String(process.env.SITE_URL||site.site_url||'https://www.rgjanet.com/libreta/').trim();
if(!SITE.endsWith('/'))SITE+='/';
const esc=s=>String(s==null?'':s).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
const abs=u=>!u?'':/^https?:\/\//.test(u)?u:SITE+String(u).replace(/^\/+/,'');
const plain=t=>String(t||'').replace(/!\[[^\]]*\]\([^)]*\)/g,'').replace(/\[([^\]]*)\]\([^)]*\)/g,'$1').replace(/[#*_`>]/g,'').replace(/\s+/g,' ').trim();
const clip=(t,n)=>t.length>n?t.slice(0,n-1).trim()+'…':t;
const ymd=d=>{const x=new Date(d);return isNaN(x)?'':x.toISOString().slice(0,10)};
const list=n=>{try{return rd(`content/generated/${n}.json`)}catch(e){return []}};

for(const f of ['assets/vendor/marked.min.js','assets/fonts/source-serif-4-normal.woff2','assets/og-image.png','assets/icons/favicon.ico'])
 if(!fs.existsSync(f)){console.error('Missing required file: '+f+' (upload it to the repository and publish again)');process.exit(1)}
fs.rmSync(OUT,{recursive:true,force:true});fs.mkdirSync(OUT,{recursive:true});
for(const d of ['admin','assets','content'])fs.cpSync(d,path.join(OUT,d),{recursive:true});
fs.copyFileSync('assets/icons/favicon.ico',path.join(OUT,'favicon.ico'));

const name=site.site_title||'Janet Rodríguez';
const defImg=abs(site.og_image||'assets/og-image.png');
const imgTags=(img,alt)=>`<meta property="og:image" content="${esc(img)}">\n<meta property="og:image:alt" content="${esc(alt)}">\n<meta name="twitter:image" content="${esc(img)}">`;
const social=({title,desc,url,img,type,alt,extra=''})=>`<meta property="og:type" content="${type}">
<meta property="og:site_name" content="${esc(name)}">
<meta property="og:locale" content="es_LA">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${esc(url)}">
${imgTags(img,alt)}
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(desc)}">${extra}`;

// ---- analytics (cookieless options only) ----
const prov=String(site.analytics_provider||'none'),aid=String(site.analytics_id||'').trim();
let analytics='';
if(aid&&/^[A-Za-z0-9._-]+$/.test(aid)){
 if(prov==='goatcounter')analytics=`<script>window.goatcounter={path:function(){return location.pathname+location.search}}</script>\n<script data-goatcounter="https://${aid}.goatcounter.com/count" async src="https://gc.zgo.at/count.js"></script>`;
 else if(prov==='umami')analytics=`<script defer src="https://cloud.umami.is/script.js" data-website-id="${aid}" data-domains="${new URL(SITE).hostname}"></script>`;

}
if(prov==='ga4'&&/^G-[A-Z0-9]+$/.test(aid)){
 // Google Analytics 4 loads ONLY after the visitor accepts (Google would otherwise receive their IP on page load).
 analytics=`<script>(function(){var ID=${JSON.stringify(aid)},K='ga-consent';
function load(){if(window.__ga)return;window.__ga=1;window.dataLayer=window.dataLayer||[];window.gtag=function(){dataLayer.push(arguments)};gtag('js',new Date());gtag('config',ID);var s=document.createElement('script');s.async=1;s.src='https://www.googletagmanager.com/gtag/js?id='+ID;document.head.appendChild(s)}
function get(){try{return localStorage.getItem(K)}catch(e){return null}}
function set(v){try{localStorage.setItem(K,v)}catch(e){}}
var st=document.createElement('style');st.textContent='.gab{position:fixed;left:16px;right:16px;bottom:16px;max-width:460px;z-index:60;background:#FCF3EA;color:#333;border:2px solid #333;box-shadow:6px 6px 0 #333;padding:16px 18px;font:15px/1.45 "Source Serif 4",serif}.gab p{margin:0 0 12px}.gab button,.gpref{font:600 13px "IBM Plex Mono",monospace;border:2px solid #333;border-radius:99px;padding:8px 16px;cursor:pointer;color:#333;background:#D9E9D9;margin-right:8px}.gab button+button{background:#fff}.gpref{border:0;background:none;padding:0;text-decoration:underline;margin:0 0 0 16px;font-weight:500}';
function banner(){if(document.querySelector('.gab'))return;var d=document.createElement('div');d.className='gab';d.setAttribute('role','region');d.setAttribute('aria-label','Analítica');d.innerHTML='<p>Uso Google Analytics para saber cuántas personas visitan el sitio. Solo se activa si lo aceptas.</p><button type="button" data-v="1">Aceptar</button><button type="button" data-v="0">Rechazar</button>';
d.onclick=function(e){var v=e.target.getAttribute&&e.target.getAttribute('data-v');if(v===null||v===undefined)return;set(v);d.remove();if(v==='1')load()};document.body.appendChild(d)}
function pref(){var f=document.querySelector('footer');if(!f||f.querySelector('.gpref'))return!!(f&&f.querySelector('.gpref'));var b=document.createElement('button');b.type='button';b.className='gpref';b.textContent='Preferencias de analítica';b.onclick=function(){set('');banner()};f.appendChild(b);return true}
document.head.appendChild(st);
function init(){if(get()==='1')load();else if(get()!=='0')banner();if(!pref()){var n=0,t=setInterval(function(){if(pref()||++n>40)clearInterval(t)},250)}}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init()})()</script>`;
}
if(prov!=='none'&&!analytics)console.warn('Analytics not added: check the provider and ID.');

// ---- home page ----
const title=name+(site.tagline?' — '+site.tagline:'');
const desc=site.description||site.tagline||name;
const head=`<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${esc(SITE)}">
<meta name="theme-color" content="#FCF3EA">
${social({title,desc,url:SITE,img:defImg,type:'website',alt:title})}
${analytics}`;
let html=fs.readFileSync('index.html','utf8');
if(!html.includes('<meta name="description" content="">'))throw new Error('index.html: description placeholder missing');
html=html.replace(/<title>[^<]*<\/title>/,`<title>${esc(title)}</title>`).replace('<meta name="description" content="">',head);
fs.writeFileSync(path.join(OUT,'index.html'),html);

// ---- share pages + sitemap ----
const urls=[{loc:SITE,lm:''}];
for(const c of (site.categories||[])){if(c&&c.id)urls.push({loc:`${SITE}?page=${encodeURIComponent(c.id)}`,lm:''})}
urls.push({loc:`${SITE}?posts=all`,lm:''});
if(list('books').length)urls.push({loc:`${SITE}?books=all`,lm:''});
const share=(kind,dir,item)=>{
 const slug=item.slug,real=`${SITE}?${kind}=${encodeURIComponent(slug)}`,self=`${SITE}${dir}/${encodeURIComponent(slug)}/`;
 const d=clip(plain(item.excerpt||item.summary||item.body)||desc,200),img=item.cover?abs(item.cover):defImg,t=`${item.title} — ${name}`;
 const rel=`../../?${kind}=${encodeURIComponent(slug)}`;
 const extra=item.date&&ymd(item.date)?`\n<meta property="article:published_time" content="${ymd(item.date)}">`:'';
 const page=`<!DOCTYPE html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(t)}</title>
<meta name="description" content="${esc(d)}">
<link rel="canonical" href="${esc(real)}">
${social({title:t,desc:d,url:self,img,type:'article',alt:item.cover_alt||item.title,extra})}
<meta http-equiv="refresh" content="0;url=${esc(rel)}">
<script>location.replace(${JSON.stringify(rel)})</script></head>
<body><p><a href="${esc(rel)}">${esc(item.title)}</a></p></body></html>`;
 fs.mkdirSync(path.join(OUT,dir,slug),{recursive:true});fs.writeFileSync(path.join(OUT,dir,slug,'index.html'),page);
 urls.push({loc:real,lm:ymd(item.date)});
};
for(const p of list('posts'))share('post','p',p);
for(const w of list('works'))if(w.body)share('work','w',w);

fs.writeFileSync(path.join(OUT,'sitemap.xml'),`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(u=>`<url><loc>${esc(u.loc)}</loc>${u.lm?`<lastmod>${u.lm}</lastmod>`:''}</url>`).join('\n')}\n</urlset>\n`);
fs.writeFileSync(path.join(OUT,'robots.txt'),`User-agent: *\nAllow: /\nDisallow: /admin/\n\nSitemap: ${SITE}sitemap.xml\n`);
console.log(`site built: ${urls.length} URLs in sitemap, base ${SITE}, analytics: ${analytics?prov:'off'}`);
