import {newGame,act,inspect,allowedRoutes,occupant} from './engine.mjs';
import {policy} from './balance-sim.mjs';
function expanded(s){const legal=c=>inspect(s,c).ok;const rooms=s.guests.filter(p=>p.status==='room');const queue=s.guests.filter(p=>p.status==='queue').sort((a,b)=>a.remaining-b.remaining);
 if(s.bio<45&&!s.production.bio)return {type:'toggle',resource:'bio',on:true};
 if(s.water<5&&!s.production.water)return {type:'toggle',resource:'water',on:true};
 if(s.energy<8&&s.reserve<6&&legal({type:'battery'}))return {type:'battery'};
 const groups=['A','B','C'].map(route=>rooms.filter(p=>p.route===route));
 for(const g of groups)if(g.length>=2&&legal({type:'depart',guests:g.map(p=>p.id)}))return {type:'depart',guests:g.map(p=>p.id)};
 const urgent=rooms.find(p=>p.remaining<=3||s.tick>=s.cfg.shiftTicks-3);if(urgent){const c=urgent.route?{type:'send',guest:urgent.id}:{type:'route',guest:urgent.id,route:allowedRoutes(s,urgent)[0]};if(legal(c))return c;}
 if(s.rooms.length===2&&s.credits>=s.cfg.buildPrice+s.cfg.upkeep+36&&s.bio>=s.cfg.buildBio+40&&legal({type:'build',medium:'gas'}))return {type:'build',medium:'gas'};
 for(const p of queue)for(let room=0;room<s.rooms.length;room++){const c={type:'accept',guest:p.id,room};if(legal(c))return c;}
 for(const p of rooms.filter(p=>!p.route)){const c={type:'route',guest:p.id,route:allowedRoutes(s,p)[0],help:!!p.story&&p.visit===1};if(legal(c))return c;}
 for(const p of rooms){const c={type:'send',guest:p.id};if(legal(c))return c;}
 return policy(s);
}
let out=[];for(let i=1;i<=200;i++){let s=newGame({},Math.imul(i,2654435761)>>>0);while(!s.ended){const c=expanded(s),r=act(s,c);if(!r.ok)throw Error(r.reason);s=r.state;}out.push({sent:s.sent,credits:s.credits,rooms:s.rooms.length,groups:s.flights.filter(f=>f.guests.length>1).length,win:s.ending==='win'});}
const stats=k=>({min:Math.min(...out.map(s=>s[k])),mean:Math.round(out.reduce((t,s)=>t+s[k],0)/out.length*10)/10,max:Math.max(...out.map(s=>s[k]))});console.log(JSON.stringify({n:out.length,wins:out.filter(s=>s.win).length,sent:stats('sent'),credits:stats('credits'),rooms:stats('rooms'),groupFlights:stats('groups')},null,2));
