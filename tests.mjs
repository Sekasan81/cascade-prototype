import assert from 'node:assert/strict';
import {writeFileSync} from 'node:fs';
import {newGame,act,inspect,serialize,restore,DEFAULTS,active,occupant,routes,energyCap,validateConfig,VERSION} from './engine.mjs';
let passed=0;
function test(name,fn){fn();passed++;console.log('PASS',name);}
const go=(s,cmd)=>{const r=act(s,cmd);assert.ok(r.ok,JSON.stringify(cmd)+' '+r.reason);return r.state;};
function firstShift(){let s=newGame();for(let i=1;i<=24;i++){const slot=i<=3?1:i>=8&&i<=10?2:i>=15&&i<=17?3:null;const offset=i<=3?i:i<=10?i-7:i-14;const cmd=slot?offset===1?{type:'accept',guest:slot,room:slot===3?1:0}:offset===2?{type:'route',guest:slot,route:'A'}:{type:'send',guest:slot}:{type:'wait'};s=go(s,cmd);}return s;}
test('golden first shift exactly matches PDF',()=>{const s=firstShift();assert.equal(s.shift,2);assert.equal(s.tick,0);assert.equal(s.world,30);assert.deepEqual([s.credits,s.xp,s.rep.dry,s.rep.water,s.bio,s.water,s.energy,s.reserve],[122,9,4,2,8,8,12,11]);assert.equal(s.sent,3);});
test('invalid actions are immutable, including timers and resources',()=>{let s=newGame();s.energy=0;const original=serialize(s),r=act(s,{type:'accept',guest:1,room:0});assert.equal(r.ok,false);assert.equal(serialize(r.state),original);assert.equal(r.state,s);});
test('same medium and same production mode are true no-ops',()=>{const s=newGame();for(const cmd of [{type:'convert',room:0,medium:'dry'},{type:'toggle',resource:'bio',on:false}]){const r=act(s,cmd);assert.equal(r.noop,true);assert.equal(r.state,s);}});
test('route no-op, paid reroute and duplicate dispatch',()=>{let s=newGame();s.xp=40;s=go(s,{type:'accept',guest:1,room:0});s=go(s,{type:'route',guest:1,route:'A'});assert.equal(act(s,{type:'route',guest:1,route:'A'}).state,s);const timer=s.guests[0].remaining;s=go(s,{type:'route',guest:1,route:'B'});assert.equal(s.guests[0].remaining,timer-1);s=go(s,{type:'send',guest:1});const before=serialize(s);assert.equal(act(s,{type:'send',guest:1}).ok,false);assert.equal(serialize(s),before);});
test('occupied and incompatible rooms are protected',()=>{let s=newGame();assert.equal(inspect(s,{type:'accept',guest:1,room:1}).ok,false);s=go(s,{type:'accept',guest:1,room:0});assert.equal(inspect(s,{type:'convert',room:0,medium:'gas'}).ok,false);});
test('last patience tick can be used for acceptance or dispatch',()=>{let s=newGame();s.guests[0].remaining=1;s=go(s,{type:'accept',guest:1,room:0});assert.equal(s.guests[0].remaining,14);s=go(s,{type:'route',guest:1,route:'A'});s.guests[0].remaining=1;s=go(s,{type:'send',guest:1});assert.equal(s.sent,1);});
test('expired guests lose race reputation but not unlocked category',()=>{let s=newGame();s.rep.dry=5;s.unlocked.dry=1;s.guests[0].remaining=1;s=go(s,{type:'wait'});assert.equal(s.guests[0].status,'lost');assert.equal(s.rep.dry,4);assert.equal(s.unlocked.dry,1);});
test('arrival timer is not decremented on appearance',()=>{let s=newGame();for(let i=0;i<7;i++)s=go(s,{type:'wait'});assert.equal(s.guests.find(p=>p.id===2).remaining,12);});
test('queue overflow is a terminal loss with no reward',()=>{let s=newGame();s.tick=6;s.rep.dry=5;s.guests.push({...s.guests[0],id:20,slot:20},{...s.guests[0],id:21,slot:21});s=go(s,{type:'wait'});assert.equal(s.guests.filter(p=>p.status==='queue').length,3);assert.equal(s.lost,1);assert.equal(s.rep.dry,4);});
test('zero energy permits buying a battery, then recharging',()=>{let s=newGame();s.energy=0;s.reserve=0;s.credits=18;s=go(s,{type:'battery'});assert.equal(s.energy,2);assert.equal(s.reserve,34);assert.equal(s.credits,0);});
test('two waits restore four energy from reserve',()=>{let s=newGame();s.energy=0;s=go(go(s,{type:'wait'}),{type:'wait'});assert.equal(s.energy,4);});
test('production requires full capacity and does not overcharge',()=>{let s=newGame();s.world=2;s.bio=15;s.energy=8;s.reserve=0;s.production.bio=true;s=go(s,{type:'wait'});assert.equal(s.bio,15);assert.equal(s.energy,8);});
test('bio takes priority over water and missed batches do not accumulate',()=>{let s=newGame();s.world=2;s.energy=2;s.reserve=0;s.production={bio:true,water:true};s=go(s,{type:'wait'});assert.equal(s.bio,10);assert.equal(s.water,9);assert.equal(s.energy,0);s.energy=2;s=go(s,{type:'wait'});assert.equal(s.water,9);assert.equal(s.energy,2);});
test('generator runs before battery, fuel is finite, blocked batches are free',()=>{let s=newGame();s.world=2;s.upgrades.generator=true;s.fuel=12;s.energy=9;s=go(s,{type:'wait'});assert.equal(s.energy,12);assert.equal(s.reserve,36);assert.equal(s.fuel,11);s.world=5;s.energy=11;s=go(s,{type:'wait'});assert.equal(s.fuel,11);assert.equal(s.reserve,35);});
test('generator maximum: 30 energy for 10 fuel in 30 world ticks',()=>{let s=newGame();s.upgrades.generator=true;s.fuel=12;s.reserve=0;let production=0;for(let i=0;i<24;i++){s.energy=0;const r=act(s,{type:'wait'});production+=r.events.filter(e=>e.startsWith('Генератор:')).length*3;s=r.state;}assert.equal(s.world,30);assert.equal(production,30);assert.equal(s.fuel,2);});
test('early closing evacuates guests, skips arrivals and charges upkeep',()=>{let s=newGame();s=go(s,{type:'accept',guest:1,room:0});s.rep.dry=5;s=go(s,{type:'close'});assert.equal(s.shift,2);assert.equal(s.rep.dry,3);assert.equal(s.skipped,2);assert.equal(s.credits,68);assert.equal(s.world,8);assert.equal(s.guests[0].status,'lost');});
test('sleep cannot create energy without charge or fuel',()=>{let s=newGame();s.energy=0;s.reserve=0;s.upgrades.generator=true;s.fuel=0;s=go(s,{type:'close'});assert.equal(s.energy,0);assert.equal(s.credits,68);});
test('negative balance ends game, commands cannot continue',()=>{let s=newGame();s.credits=0;s=go(s,{type:'close'});assert.equal(s.ending,'bankrupt');assert.equal(s.ended,true);assert.equal(act(s,{type:'wait'}).state,s);});
test('upgrades have price, XP gate, and cannot be bought twice',()=>{let s=newGame();assert.equal(inspect(s,{type:'upgrade',upgrade:'generator'}).ok,false);s.xp=24;s=go(s,{type:'upgrade',upgrade:'generator'});assert.equal(s.upgrades.generator,true);assert.equal(s.credits,20);assert.equal(s.fuel,12);assert.equal(act(s,{type:'upgrade',upgrade:'generator'}).state,s);});
test('XP opens B and C at exact thresholds',()=>{const s=newGame();for(const [xp,expected] of [[11,['A']],[12,['A','B']],[35,['A','B']],[36,['A','B','C']]]){s.xp=xp;assert.deepEqual(routes(s),expected);}});
test('named gifts only follow successful earlier help, exactly once',()=>{let s=newGame();let p=s.guests[0];Object.assign(p,{story:'neri',visit:1});s=go(s,{type:'accept',guest:1,room:0});s=go(s,{type:'route',guest:1,route:'A',help:true});assert.equal(s.stories.neri.helped,false);s=go(s,{type:'send',guest:1});assert.equal(s.stories.neri.helped,true);s.guests.push({...s.guests[0],id:50,status:'room',visit:2,remaining:10,room:0});const bio=s.bio;s=go(s,{type:'send',guest:50});assert.equal(s.bio,bio+4);assert.equal(s.stories.neri.gift,true);const loaded=restore(serialize(s));assert.equal(act(loaded,{type:'send',guest:50}).state,loaded);});
test('trader purchase is one time and cannot overflow warehouse',()=>{let s=newGame();Object.assign(s.guests[0],{status:'room',room:0,category:3});s.bio=15;assert.equal(inspect(s,{type:'trade',guest:1}).ok,false);s.bio=8;s=go(s,{type:'trade',guest:1});assert.equal(s.bio,12);assert.equal(s.credits,72);assert.equal(act(s,{type:'trade',guest:1}).state,s);});
test('save restores exact next transition in queue, room, routed and sent states',()=>{let s=newGame();for(const cmd of [{type:'accept',guest:1,room:0},{type:'route',guest:1,route:'A'},{type:'send',guest:1},{type:'wait'}]){const saved=restore(serialize(s));assert.deepEqual(act(saved,cmd),act(s,cmd));s=go(s,cmd);}});
test('settings validate cross-resource bounds and retain active game config',()=>{assert.ok(validateConfig({...DEFAULTS,energy:100}));assert.ok(validateConfig({...DEFAULTS,batterySize:100}));assert.ok(validateConfig({...DEFAULTS,repTrader:1}));const config={...DEFAULTS,batteryPrice:10};const s=newGame(config);config.batteryPrice=99;assert.equal(s.cfg.batteryPrice,10);});

// A deterministic test operator, using only public actions and legal information.
function policy(s) {
  const cfg=s.cfg,legal=cmd=>inspect(s,cmd).ok;
  let roomGuests=s.guests.filter(p=>p.status==='room').sort((a,b)=>a.remaining-b.remaining);
  // Do not let background consumers prevent all actions.
  if(s.energy<cfg.sendEnergy&&s.reserve===0&&s.credits>=cfg.batteryPrice&&legal({type:'battery'}))return {type:'battery'};
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
    const threshold=resource==='bio'?9:6;
    if(!s.production[resource]&&s[resource]<threshold)return {type:'toggle',resource,on:true};
  }
  if(s.xp>=cfg.generatorXP&&!s.upgrades.generator&&s.credits>=cfg.generatorPrice+cfg.batteryPrice+cfg.upkeep&&legal({type:'upgrade',upgrade:'generator'}))return {type:'upgrade',upgrade:'generator'};
  if(s.upgrades.generator&&s.fuel===0&&legal({type:'fuel'}))return {type:'fuel'};
  return {type:'wait'};
}
let play=newGame();
test('full six-shift legal playthrough, all categories, both story arcs',()=>{
  while(!play.ended&&play.log.length<200){const cmd=policy(play);play=go(play,cmd);for(const k of ['bio','water','energy','reserve'])assert.ok(play[k]>=0);assert.ok(play.energy<=energyCap(play));assert.ok(play.bio<=play.cfg.bioCap);assert.ok(play.water<=play.cfg.waterCap);}
  assert.equal(play.ended,true);assert.equal(play.ending,'win',JSON.stringify({sent:play.sent,lost:play.lost,credits:play.credits}));assert.equal(play.summaries.length,6);assert.equal(play.guests.length,22);assert.ok(play.guests.some(p=>p.category===3));assert.equal(play.stories.neri.gift,true);assert.equal(play.stories.ro.gift,true);assert.equal(play.upgrades.generator,true);
});
if(process.env.STATION_REPORT_PATH)writeFileSync(process.env.STATION_REPORT_PATH,JSON.stringify({version:VERSION,passed,sent:play.sent,lost:play.lost,credits:play.credits,summaries:play.summaries,log:play.log},null,2));
console.log(`\n${passed} checks passed. Full run: ${play.sent}/22 sent, ${play.lost} lost, ${play.credits} credits.`);
