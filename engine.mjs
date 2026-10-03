import {RESOURCES,RACES,PROFESSIONS,CHARACTERS,FEATURES,PROBABILITIES,emptyResources,round,generatePassenger,passengerStats} from './passengers.mjs?v=growth-8';
export {RESOURCES,RACES,PROFESSIONS,CHARACTERS,FEATURES,PROBABILITIES,passengerStats};
export const VERSION=5;
export const ECONOMY={startCredits:0,prepareCost:2,refillRate:3,refillMax:100,roomCost:100,maxRooms:6,seatCost:50};
export const DEFAULTS={...ECONOMY,ticks:30,resource:45,rooms:['dry','water'],arrivalEvery:3,probabilities:PROBABILITIES,races:RACES};
export const DESTS=['Марс','Сигма-4','Альфа-9'];
export const TYPES={dry:'Сухая',water:'Водная',soil:'Грунтовая',gas:'Газовая'};
export const ROOM_RESOURCE={dry:'food',water:'water',soil:'bio',gas:'gas'};
export const ENVIRONMENTS={dry:'Сухая умеренная среда',water:'Водная среда',soil:'Умеренная грунтовая среда',gas:'Газовая среда'};
export function createGame(options={}){
 const config={...DEFAULTS,...options,probabilities:{...PROBABILITIES,...options.probabilities},races:Object.fromEntries(Object.entries(RACES).map(([k,v])=>[k,{...v,...options.races?.[k]}]))};config.rooms=[...config.rooms];
 for(const k of [...Object.keys(ECONOMY),'resource'])config[k]=Math.max(0,round(config[k]));config.maxRooms=Math.max(config.rooms.length,config.maxRooms);config.refillMax=Math.max(1,config.refillMax);
 const s={version:VERSION,config,shift:1,tick:0,time:0,resources:Object.fromEntries(Object.keys(RESOURCES).map(k=>[k,config.resource])),credits:config.startCredits,rng:options.seed??Math.floor(Math.random()*4294967296),reputation:10,repEvents:[],serial:0,queue:[],rooms:config.rooms.map((type,i)=>({id:i,type,prepared:true,built:true,p:null})),directionSeats:Object.fromEntries(DESTS.map(d=>[d,0])),flights:[],log:[],stats:{accepted:0,departed:0,left:0,flights:0},ended:false,failed:false};
 schedule(s,0);for(let i=0;i<3;i++)spawn(s);note(s,'Терминал открыт. Выберите пассажира и подходящую комнату.');return s;
}
function schedule(s,from){for(let t=from+1;t<=from+60;t++){let d=t%9===5?0:t%9===7?1:t%9===0?2:-1;if(d>=0)s.flights.push({id:`F${t}`,dest:DESTS[d],at:t,capacity:[4,3,3][d]+(s.directionSeats[DESTS[d]]||0),used:0});}}
function spawn(s){s.queue.push(generatePassenger(s));}
export const seats=p=>p.flight&&p.reservedSeats!=null?p.reservedSeats:passengerStats(p).seats;
export function resourceFlow(s){const used=emptyResources(),made=emptyResources();for(const r of s.rooms){if(!r.p)continue;const rates=passengerStats(r.p);for(const k of Object.keys(RESOURCES)){used[k]=round(used[k]+rates.used[k]);made[k]=round(made[k]+rates.made[k]);}}return {used,made};}
export const findPassenger=(s,id)=>s.queue.find(p=>p.id===id)||s.rooms.find(r=>r.p?.id===id)?.p;
export const occupiedRoom=(s,id)=>s.rooms.find(r=>r.p?.id===id);
export function note(s,text){s.log.unshift({at:s.tick,shift:s.shift,text});s.log=s.log.slice(0,30);}
export const reputationReward=p=>p.feature==='pair'?3:p.feature==='pet'?2:1;
function reputationChange(s,delta,p){s.reputation=Math.min(100,s.reputation+delta);s.repEvents.push({delta,name:p.name});note(s,`${p.name}: репутация ${delta>0?'+':''}${delta}.`);}
function rewardDeparture(s,p){const amount=passengerStats(p).payment;s.credits+=amount;reputationChange(s,reputationReward(p),p);s.repEvents.at(-1).credits=amount;note(s,`${p.name}: +${amount} кр.`);}
export function restoreGame(saved){
 if(!saved)return null;const s=structuredClone(saved);
 if([1,2,3].includes(s.version)){
  const oldResource=s.resource??45;s.config={...DEFAULTS,...s.config,probabilities:{...PROBABILITIES},races:structuredClone(RACES)};
  s.resources=Object.fromEntries(Object.keys(RESOURCES).map(k=>[k,oldResource]));s.credits??=0;s.rng??=98173;s.reputation??=10;s.repEvents??=[];
  function migrate(p){const reserved=p.count+(p.condition==='pet'||p.condition==='cargo'?1:0);const raceId=p.race==='Споровик'?'fungal':p.type==='water'?'aquatic':'stone';const base=structuredClone(RACES[raceId]);const feature=({pet:'pet',group:'pair',cargo:'luggage'})[p.condition]||'none';Object.assign(p,{raceId,race:base.name,base,profession:'researcher',character:'calm',feature,type:base.room,basePay:base.payMin,initialPatience:p.patience??base.waitMin});p.count=passengerStats(p).count;if(p.flight)p.reservedSeats=reserved;delete p.condition;delete p.talked;delete p.fulfilled;delete p.decision;}
  s.queue.forEach(migrate);for(const r of s.rooms){r.built=true;if(r.p){migrate(r.p);r.type=r.p.type;delete r.p.patience;}}
  for(const type of Object.keys(TYPES))if(!s.rooms.some(r=>r.type===type))s.rooms.push({id:Math.max(...s.rooms.map(r=>r.id))+1,type,built:true,prepared:false,p:null});
  s.config.rooms=s.rooms.map(r=>r.type);s.version=4;delete s.resource;note(s,'Обновление: четыре ресурса, новые свойства пассажиров. Старые брони сохранены.');
 }
 if(s.version===4){s.config={...DEFAULTS,...s.config,rooms:[...DEFAULTS.rooms],maxRooms:Math.max(DEFAULTS.maxRooms,s.rooms.length)};for(const k of [...Object.keys(ECONOMY),'resource'])s.config[k]=round(s.config[k]);s.rooms.forEach(r=>r.prepared=true);s.resources=Object.fromEntries(Object.entries(s.resources).map(([k,v])=>[k,round(v)]));s.credits=round(s.credits);s.repEvents.forEach(e=>{if(e.credits!=null)e.credits=round(e.credits)});s.directionSeats=Object.fromEntries(DESTS.map(d=>[d,0]));s.version=VERSION;note(s,'Среда комнат сохраняется. Ресурсы и кредиты округлены до целых; старые комнаты и брони сохранены. Новая игра начинается с двух комнат.');}
 return validSave(s)?s:null;
}
export function roomReason(s,p,r){
 if(!r||r.built===false)return 'Не построена / заблокирована';
 if(r.p)return 'Занята';
 if(r.type!==p.type&&s.resources[ROOM_RESOURCE[p.type]]<s.config.prepareCost)return `Нужно ${s.config.prepareCost} ${RESOURCES[ROOM_RESOURCE[p.type]].name.toLowerCase()}`;
 return '';
}
export function reason(s,action,id,extra){
 if(s.failed)return 'Ресурс исчерпан. Начните заново.';
 if(s.ended)return 'Смена завершена. Откройте следующую смену.';
 const p=findPassenger(s,id),room=occupiedRoom(s,id);
 if(action==='wait')return '';
 if(action==='buy-room')return s.rooms.length>=s.config.maxRooms?'Достигнут предел комнат':s.credits<s.config.roomCost?'Недостаточно кредитов':'';
 if(action==='buy-seats'){const n=Number(extra);return !DESTS.includes(id)?'Неизвестное направление':!Number.isInteger(n)||n<1||n>100?'Выберите от 1 до 100 мест':s.credits<n*s.config.seatCost?'Недостаточно кредитов':'';}
 if(action==='refill'){const n=Number(id);return !RESOURCES[extra]?'Выберите ресурс':!Number.isInteger(n)||n<1||n>s.config.refillMax?'Недопустимое количество':s.resources[extra]+n>s.config.resource?'Превышен максимальный запас':s.credits<n*s.config.refillRate?'Недостаточно кредитов':'';}
 if(action==='prepare'){const r=s.rooms.find(r=>r.id===id),type=extra??r?.type;return !r||r.built===false?'Комната не построена':r.p?'Комната занята':!TYPES[type]?'Выберите среду':r.type===type?'Эта среда уже установлена — перестройка не нужна':s.resources[ROOM_RESOURCE[type]]<s.config.prepareCost?`Нужно ${s.config.prepareCost} ${RESOURCES[ROOM_RESOURCE[type]].name.toLowerCase()}`:'';}
 if(!p)return 'Выберите пассажира';
 if(action==='accept'){if(!s.queue.includes(p))return 'Пассажир уже на станции';return roomReason(s,p,s.rooms.find(r=>r.id===Number(extra)));}
 if(!room)return 'Сначала выберите комнату для пассажира';
 if(p.flight)return 'Пассажир уже назначен. Вылет произойдёт автоматически.';
 if(action==='assign'){
  const f=s.flights.find(f=>f.id===extra);if(!f||f.at<=s.time)return 'Рейс уже отправился';if(f.dest!==p.dest)return 'Другое направление';if(f.capacity-f.used<seats(p))return `Нужно ${seats(p)} мест, свободно ${f.capacity-f.used}`;
  const nearest=s.flights.find(f=>f.dest===p.dest&&f.capacity-f.used>=seats(p));
  return p.character==='aggressive'&&f.id!==nearest?.id?'Агрессивный: только ближайший подходящий рейс':'';
 }
 return 'Неизвестное действие';
}
export function act(s,action,id,extra){
 const blocked=reason(s,action,id,extra);if(blocked)return {ok:false,message:blocked};const p=findPassenger(s,id);
 if(action==='buy-room'){s.credits-=s.config.roomCost;const id=Math.max(-1,...s.rooms.map(r=>r.id))+1;s.rooms.push({id,type:'dry',prepared:true,built:true,p:null});note(s,`Куплена комната ${id+1}: −${s.config.roomCost} кр. Сухая среда включена в стоимость.`);}
 if(action==='buy-seats'){const n=Number(extra);s.credits-=n*s.config.seatCost;s.directionSeats[id]+=n;for(const f of s.flights)if(f.dest===id)f.capacity+=n;note(s,`${id}: +${n} мест на каждом рейсе, −${n*s.config.seatCost} кр.`);}
 if(action==='refill'){const n=Number(id);s.resources[extra]=round(s.resources[extra]+n);s.credits-=n*s.config.refillRate;note(s,`Куплено: ${RESOURCES[extra].name}, ${n} ед. за ${n*s.config.refillRate} кр.`);}
 if(action==='prepare'){const r=s.rooms.find(r=>r.id===id),type=extra??r.type,k=ROOM_RESOURCE[type];s.resources[k]=round(s.resources[k]-s.config.prepareCost);r.type=type;r.prepared=true;note(s,`Комната ${id+1}: ${TYPES[type].toLowerCase()} среда подготовлена.`);}
 if(action==='accept'){const r=s.rooms.find(r=>r.id===Number(extra));if(r.type!==p.type){const k=ROOM_RESOURCE[p.type];s.resources[k]=round(s.resources[k]-s.config.prepareCost);r.type=p.type;}r.prepared=true;r.p=p;s.queue=s.queue.filter(x=>x.id!==id);delete p.patience;s.stats.accepted+=p.count;note(s,`${p.name}: комната ${r.id+1}.`);advance(s);}
 if(action==='assign'){const f=s.flights.find(f=>f.id===extra);f.used+=seats(p);p.flight=f.id;note(s,`${p.name}: назначен на ${f.dest}, ${seats(p)} мест.`);advance(s);}
 if(action==='wait')advance(s);return {ok:true};
}
function advance(s){
 s.repEvents=[];const {used,made}=resourceFlow(s);const exhausted=[];
 for(const k of Object.keys(RESOURCES)){const value=round(s.resources[k]-used[k]+made[k]);if(value<=0&&used[k]>made[k])exhausted.push(k);s.resources[k]=Math.max(0,Math.min(s.config.resource,value));}
 s.time++;s.tick++;
 for(const f of s.flights.filter(f=>f.at===s.time)){
  let count=0;for(const r of s.rooms){if(r.p?.flight===f.id){count+=r.p.count;rewardDeparture(s,r.p);r.p=null;r.prepared=true;}}
  s.stats.departed+=count;s.stats.flights++;note(s,`${f.dest}: рейс отправлен. Пассажиров: ${count}.`);
 }
 s.flights=s.flights.filter(f=>f.at>s.time);for(const p of s.queue)p.patience--;
 for(const p of s.queue.filter(p=>p.patience<=0)){s.stats.left+=p.count;reputationChange(s,-3,p);note(s,`${p.name} покидает очередь.`);}s.queue=s.queue.filter(p=>p.patience>0);
 if(s.tick>=s.config.ticks){s.ended=true;for(const k of Object.keys(RESOURCES))s.resources[k]=s.config.resource;note(s,'Смена завершена. Ресурсы восстановлены.');}
 else if(exhausted.length){s.failed=true;note(s,'Исчерпан ресурс: '+exhausted.map(k=>RESOURCES[k].name).join(', ')+'. Работа приостановлена.');}
 else if(s.time%s.config.arrivalEvery===0&&s.queue.length<7)spawn(s);
}
export function nextShift(s){if(!s.ended||s.failed)return false;s.shift++;s.tick=0;s.ended=false;if(s.flights.at(-1).at<s.time+40)schedule(s,s.flights.at(-1).at);note(s,'Новая смена. Репутация, кредиты и брони сохранены.');return true;}
export function validSave(s){try{return !!s&&s.version===VERSION&&Number.isInteger(s.credits)&&s.credits>=0&&DESTS.every(d=>Number.isInteger(s.directionSeats?.[d])&&s.directionSeats[d]>=0)&&Object.keys(ECONOMY).every(k=>Number.isInteger(s.config[k])&&s.config[k]>=0)&&Number.isInteger(s.rng)&&Number.isFinite(s.reputation)&&Array.isArray(s.repEvents)&&Number.isInteger(s.tick)&&s.tick>=0&&s.tick<=s.config.ticks&&Object.keys(RESOURCES).every(k=>Number.isInteger(s.resources[k])&&s.resources[k]>=0)&&Array.isArray(s.rooms)&&s.rooms.length>0&&s.rooms.every(r=>TYPES[r.type])&&Array.isArray(s.queue)&&[...s.queue,...s.rooms.flatMap(r=>r.p?[r.p]:[])].every(p=>RACES[p.raceId]&&PROFESSIONS[p.profession]&&CHARACTERS[p.character]&&FEATURES[p.feature]&&Number.isFinite(p.basePay))&&s.flights.length>0&&Array.isArray(s.log)&&s.stats&&s.config.rooms;}catch{return false;}}

