import {newGame,act,inspect,routes} from './engine.mjs';
import {pathToFileURL} from 'node:url';
export function policy(s) {
  const cfg=s.cfg,legal=cmd=>inspect(s,cmd).ok;
  let roomGuests=s.guests.filter(p=>p.status==='room').sort((a,b)=>a.remaining-b.remaining);
  // Do not let background consumers prevent all actions.
  if(s.energy<cfg.sendEnergy&&s.reserve===0&&s.credits>=cfg.batteryPrice&&legal({type:'battery'}))return {type:'battery'};
  if(s.bio<35&&!s.production.bio)return {type:'toggle',resource:'bio',on:true};
  if(s.water<5&&!s.production.water)return {type:'toggle',resource:'water',on:true};
  for(const p of roomGuests) {
    const cmd=p.route?{type:'send',guest:p.id}:{type:'route',guest:p.id,route:(p.allowed||routes(s))[0],help:!!p.story&&p.visit===1};
    if(legal(cmd))return cmd;
    if(cmd.help&&legal({...cmd,help:false}))return {...cmd,help:false};
  }
  const queue=s.guests.filter(p=>p.status==='queue').sort((a,b)=>a.remaining-b.remaining);
  for(const p of queue){for(let room=0;room<2;room++){const cmd={type:'accept',guest:p.id,room};if(legal(cmd))return cmd;}}
  if(s.reserve<=12&&legal({type:'battery'}))return {type:'battery'};
  for(const p of queue){for(const room of p.race==='dry'?[0,1]:[1,0]){const cmd={type:'convert',room,medium:p.race};if(legal(cmd))return cmd;}}
  for(const resource of ['bio','water']) {
    const threshold=resource==='bio'?65:8;
    if(!s.production[resource]&&s[resource]<threshold)return {type:'toggle',resource,on:true};
  }
  if(s.xp>=cfg.generatorXP&&!s.upgrades.generator&&s.credits>=cfg.generatorPrice+cfg.batteryPrice+cfg.upkeep&&legal({type:'upgrade',upgrade:'generator'}))return {type:'upgrade',upgrade:'generator'};
  if(s.upgrades.generator&&s.fuel===0&&legal({type:'fuel'}))return {type:'fuel'};
  return {type:'wait'};
}

export function simulate(seed,config={},idle=false){let s=newGame(config,seed);while(!s.ended&&s.log.length<300){const r=act(s,idle?{type:'wait'}:policy(s));if(!r.ok)throw Error(r.reason);s=r.state;}return s;}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
const n=Number(process.argv[2]||200),runs=Array.from({length:n},(_,i)=>simulate((Math.imul(i+1,2654435761))>>>0));
const stat=k=>{const a=runs.map(k).sort((a,b)=>a-b);return {min:a[0],mean:Math.round(a.reduce((x,y)=>x+y,0)/n*10)/10,max:a.at(-1)};};
console.log(JSON.stringify({runs:n,wins:runs.filter(s=>s.ending==='win').length,bankrupt:runs.filter(s=>s.ending==='bankrupt').length,sent:stat(s=>s.sent),arrivals:stat(s=>s.guests.length),credits:stat(s=>s.credits),lost:stat(s=>s.lost),bioSpent:stat(s=>s.metrics.bioSpentOnGuests),maxQueue:stat(s=>s.metrics.maxQueue),overflow:stat(s=>s.metrics.overflow)},null,2));
}
