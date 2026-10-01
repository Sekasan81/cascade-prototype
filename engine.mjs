export const VERSION=3;
export const ECONOMY={startCredits:0,prepareCost:2,refillRate:3,refillMax:100,normalMin:10,normalMax:15,petMin:10,petMax:20,groupMin:15,groupMax:25,cargoMin:15,cargoMax:20,contrabandMin:25,contrabandMax:35,contrabandPenaltyMin:2,contrabandPenaltyMax:5};
export const DEFAULTS={...ECONOMY,ticks:30,resource:45,rooms:['dry','dry','water'],arrivalEvery:3,patience:9};
export const DESTS=['Марс','Сигма-4','Альфа-9'];
export const TYPES={dry:'Сухая',water:'Водная'};
export const CONDITIONS={pet:{name:'Питомец',text:'Оформить переноску для спутника. Потребуется ещё одно место.',action:'Оформить переноску',seats:1},cargo:{name:'Особый груз',text:'Закрепить контейнер в грузовом отсеке. Потребуется ещё одно место.',action:'Закрепить груз',seats:1},group:{name:'Попутчик',text:'Два пассажира летят вместе и размещаются в одной комнате. Расход: 2 ед./такт.',action:'Оформить группу',seats:1},contraband:{name:'Незаявленный груз',text:'Разрешить провоз за повышенную оплату и потерю репутации или изъять груз и получить обычную выплату.',action:'Изъять груз',seats:0}};
const PEOPLE=[['Оррен','Каменник','dry',0,'pet'],['Нэя','Пелаг','water',1,null],['Севр','Каменник','dry',0,null],['Ирис','Споровик','dry',2,'cargo'],['Тао','Пелаг','water',0,'group'],['Вель','Споровик','dry',1,'contraband'],['Каир','Каменник','dry',2,null],['Уна','Пелаг','water',2,'pet'],['Элио','Споровик','dry',1,null],['Роан','Каменник','dry',0,'group']];
export function createGame(options={}){
 const config={...DEFAULTS,...options};config.rooms=[...config.rooms];
 const s={version:VERSION,config,shift:1,tick:0,time:0,resource:config.resource,credits:config.startCredits,rng:98173,reputation:10,repEvents:[],serial:0,queue:[],rooms:config.rooms.map((type,i)=>({id:i,type,prepared:false,p:null})),flights:[],log:[],stats:{accepted:0,departed:0,left:0,flights:0},ended:false,failed:false};
 schedule(s,0);for(let i=0;i<3;i++)spawn(s);note(s,'Терминал открыт. Подготовьте комнаты к приёму.');return s;
}
function schedule(s,from){for(let t=from+1;t<=from+60;t++){let d=t%9===5?0:t%9===7?1:t%9===0?2:-1;if(d>=0)s.flights.push({id:`F${t}`,dest:DESTS[d],at:t,capacity:[4,3,3][d],used:0});}}
function spawn(s){const n=s.serial++;const [name,race,type,dest,condition]=PEOPLE[n%PEOPLE.length];s.queue.push({id:`P${n}`,name:`${name}${n>=10?' '+(Math.floor(n/10)+1):''}`,race,type,dest:DESTS[dest],condition,talked:false,fulfilled:false,decision:null,flight:null,patience:s.config.patience+(n%3),count:condition==='group'?2:1});}
export const seats=p=>p.count+(p.condition==='pet'||p.condition==='cargo'?1:0);
export const consumption=s=>s.rooms.reduce((n,r)=>n+(r.p?.count||0),0);
export const findPassenger=(s,id)=>s.queue.find(p=>p.id===id)||s.rooms.find(r=>r.p?.id===id)?.p;
export const occupiedRoom=(s,id)=>s.rooms.find(r=>r.p?.id===id);
export function note(s,text){s.log.unshift({at:s.tick,shift:s.shift,text});s.log=s.log.slice(0,30);}
export const reputationReward=p=>p.condition==='group'?3:p.condition==='pet'?2:1;
function roll(s,min,max){s.rng=(Math.imul(s.rng,1664525)+1013904223)>>>0;return min+Math.floor(s.rng/4294967296*(max-min+1));}
function rewardDeparture(s,p){const kind=p.condition==='contraband'?(p.decision==='allow'?'contraband':'normal'):(p.condition||'normal');const amount=roll(s,s.config[kind+'Min'],s.config[kind+'Max']);const delta=kind==='contraband'?-roll(s,s.config.contrabandPenaltyMin,s.config.contrabandPenaltyMax):reputationReward(p);s.credits+=amount;reputationChange(s,delta,p);s.repEvents.at(-1).credits=amount;note(s,`${p.name}: +${amount} кр.`);}
function reputationChange(s,delta,p){s.reputation=Math.min(100,s.reputation+delta);s.repEvents.push({delta,name:p.name});note(s,`${p.name}: репутация ${delta>0?'+':''}${delta}.`);}
export function restoreGame(saved){if(!saved)return null;const s=structuredClone(saved);if(s.version===1){s.version=2;s.reputation=10;s.repEvents=[];if(s.config.resource===30){s.config.resource=45;if(s.time===0||s.ended)s.resource=45;}}if(s.version===2){s.version=VERSION;s.config={...ECONOMY,...s.config};s.credits=s.config.startCredits;s.rng=98173;}return validSave(s)?s:null;}
export function reason(s,action,id,extra){
 if(s.failed)return 'Ресурс исчерпан. Начните заново.';
 if(s.ended)return 'Смена завершена. Откройте следующую смену.';
 const p=findPassenger(s,id),room=occupiedRoom(s,id);
 if(action==='wait')return '';
 if(action==='refill'){const n=Number(id);return !Number.isInteger(n)||n<1||n>s.config.refillMax?'Недопустимое количество':s.resource+n>s.config.resource?'Превышен максимальный запас станции':s.credits<n*s.config.refillRate?'Недостаточно кредитов':'';}
 if(action==='prepare'){const r=s.rooms.find(r=>r.id===id);return !r?'Комната не найдена':r.p?'Комната занята':r.prepared?'Комната уже подготовлена':s.resource<s.config.prepareCost?`Нужно ${s.config.prepareCost} ед. ресурса`:'';}
 if(!p)return 'Выберите пассажира';
 if(action==='accept')return !s.queue.includes(p)?'Пассажир уже на станции':!s.rooms.some(r=>r.type===p.type&&r.prepared&&!r.p)?`Нужна свободная подготовленная комната: ${TYPES[p.type].toLowerCase()}`:'';
 if(!room)return 'Сначала примите пассажира';
 if(p.flight)return 'Пассажир уже назначен. Вылет произойдёт автоматически.';
 if(action==='talk')return p.talked?'Требования уже известны':'';
 if(action==='fulfill')return !p.talked?'Сначала поговорите с пассажиром':!p.condition||p.fulfilled?'Все условия уже выполнены':'';
 if(action==='assign'){
  const f=s.flights.find(f=>f.id===extra);
  return !p.talked?'Сначала поговорите с пассажиром':p.condition&&!p.fulfilled?'Сначала выполните условие':!f||f.at<=s.time?'Рейс уже отправился':f.dest!==p.dest?'Другое направление':f.capacity-f.used<seats(p)?`Нужно ${seats(p)} места, свободно ${f.capacity-f.used}`:'';
 }
 return 'Неизвестное действие';
}
export function act(s,action,id,extra){
 const blocked=reason(s,action,id,extra);if(blocked)return {ok:false,message:blocked};
 const p=findPassenger(s,id);
 if(action==='refill'){const n=Number(id);s.resource+=n;s.credits-=n*s.config.refillRate;note(s,`Куплено ${n} ресурса за ${n*s.config.refillRate} кр.`);}
 if(action==='prepare'){s.resource-=s.config.prepareCost;s.rooms.find(r=>r.id===id).prepared=true;note(s,`Комната ${id+1} подготовлена.`);}
 if(action==='accept'){s.rooms.find(r=>r.type===p.type&&r.prepared&&!r.p).p=p;s.queue=s.queue.filter(x=>x.id!==id);s.stats.accepted+=p.count;note(s,`${p.name}: принят на станцию.`);advance(s);}
 if(action==='talk'){p.talked=true;note(s,`${p.name}: ${p.dest}. ${p.condition?CONDITIONS[p.condition].name:'Особых условий нет'}.`);}
 if(action==='fulfill'){p.fulfilled=true;p.decision=p.condition==='contraband'?(extra==='allow'?'allow':'seize'):'done';note(s,`${p.name}: ${p.decision==='allow'?'провоз груза разрешён':p.decision==='seize'?'груз изъят':'условие выполнено'}.`);}
 if(action==='assign'){const f=s.flights.find(f=>f.id===extra);f.used+=seats(p);p.flight=f.id;note(s,`${p.name}: назначен на ${f.dest}, ${seats(p)} мест.`);advance(s);}
 if(action==='wait')advance(s);
 return {ok:true};
}
function advance(s){
 s.repEvents=[];s.resource=Math.max(0,s.resource-consumption(s));s.time++;s.tick++;
 for(const f of s.flights.filter(f=>f.at===s.time)){
  let count=0;for(const r of s.rooms){if(r.p?.flight===f.id){count+=r.p.count;rewardDeparture(s,r.p);r.p=null;r.prepared=false;}}
  s.stats.departed+=count;s.stats.flights++;note(s,`${f.dest}: рейс отправлен. Пассажиров: ${count}.`);
 }
 s.flights=s.flights.filter(f=>f.at>s.time);
 for(const p of s.queue)p.patience--;
 const leaving=s.queue.filter(p=>p.patience<=0);for(const p of leaving){s.stats.left+=p.count;reputationChange(s,-3,p);note(s,`${p.name} покидает очередь.`);}s.queue=s.queue.filter(p=>p.patience>0);
 if(s.tick>=s.config.ticks){s.ended=true;s.resource=s.config.resource;note(s,'Смена завершена. Ожидающие пассажиры остаются в комнатах.');}
 else if(s.resource===0){s.failed=true;note(s,'Ресурс исчерпан. Работа терминала приостановлена.');}
 else if(s.time%s.config.arrivalEvery===0&&s.queue.length<7)spawn(s);
}
export function nextShift(s){if(!s.ended||s.failed)return false;s.shift++;s.tick=0;s.resource=s.config.resource;s.ended=false;if(s.flights.at(-1).at<s.time+40)schedule(s,s.flights.at(-1).at);note(s,'Новая смена. Запас ресурса восстановлен.');return true;}
export function validSave(s){return !!s&&s.version===VERSION&&Number.isFinite(s.credits)&&s.credits>=0&&Number.isInteger(s.rng)&&Number.isFinite(s.reputation)&&Array.isArray(s.repEvents)&&Number.isInteger(s.tick)&&s.tick>=0&&s.tick<=s.config?.ticks&&Number.isFinite(s.resource)&&Array.isArray(s.rooms)&&s.rooms.length>0&&s.rooms.every(r=>r&&TYPES[r.type]&&(!r.p||typeof r.p.id==='string'))&&Array.isArray(s.queue)&&Array.isArray(s.flights)&&s.flights.length>0&&Array.isArray(s.log)&&s.stats&&s.config.rooms;}
