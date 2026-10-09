import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
const root=path.resolve(new URL('.',import.meta.url).pathname.replace(/^\/([A-Za-z]:)/,'$1'));const base=decodeURIComponent(root);
http.createServer(async(req,res)=>{try{let name=decodeURIComponent(new URL(req.url,'http://localhost').pathname);let file=path.resolve(base,'.'+(name==='/'?'/index.html':name));if(!file.startsWith(base+path.sep)&&file!==path.join(base,'index.html'))throw Error();let body=await fs.readFile(file);res.setHeader('Content-Type',({'html':'text/html; charset=utf-8','css':'text/css','mjs':'text/javascript','png':'image/png','json':'application/json'})[file.split('.').pop()]||'application/octet-stream');res.end(body);}catch{res.statusCode=404;res.end('Not found');}}).listen(4173,'127.0.0.1',()=>console.log('Ready at http://127.0.0.1:4173'));
