// Builds content/generated/posts.json and works.json from the one-file-per-entry folders.
const fs=require('fs'),path=require('path');
const read=dir=>{let names=[];try{names=fs.readdirSync(dir).filter(f=>f.endsWith('.json'))}catch(e){}
 return names.map(f=>{const o=JSON.parse(fs.readFileSync(path.join(dir,f),'utf8'));o.slug=f.replace(/\.json$/,'');return o})};
fs.mkdirSync('content/generated',{recursive:true});
for(const [dir,out] of [['content/blog','posts'],['content/work','works']]){
 const items=read(dir);fs.writeFileSync(`content/generated/${out}.json`,JSON.stringify(items));console.log(out+':',items.length);
}
