export const VERSION = 'station-0.2.0';
export const RACES = {
  dry: {name:'Терраны', medium:'Сухая', color:'#edbd79', noun:'терран'},
  water: {name:'Аквари', medium:'Водная', color:'#67d5f5', noun:'аквари'},
  gas: {name:'Аэриды', medium:'Газовая', color:'#c4a1fa', noun:'аэрид'},
};
export const CATEGORIES = ['Беженец','Турист','Дипломат','Торговец'];
export const DESTINATIONS = { A:'Аврора', B:'Борея', C:'Церера' };
// [default, min, max, label, group]. All values apply to a new game only.
export const FIELDS = {
  credits:[80,0,2000,'Кредиты на старте','Старт и запасы'], bio:[120,0,1000,'Биоматериал на старте','Старт и запасы'], water:[18,0,200,'Вода на старте','Старт и запасы'],
  energy:[12,0,100,'Энергия на старте','Старт и запасы'], reserve:[48,0,400,'Заряд батареи на старте','Старт и запасы'],
  bioCap:[240,10,2000,'Емкость биоматериала','Старт и запасы'], waterCap:[36,3,200,'Емкость воды','Старт и запасы'], energyCap:[16,4,100,'Емкость энергии','Старт и запасы'], reserveCap:[96,1,400,'Емкость заряда батарей','Старт и запасы'],
  acceptEnergy:[2,0,20,'Прием: энергия','Действия'], routeEnergy:[1,0,20,'Маршрут: энергия','Действия'], sendEnergy:[4,0,20,'Отправка: энергия','Действия'],
  convertEnergy:[4,0,20,'Перестройка: энергия','Действия'], convertBio:[12,1,100,'Перестройка: био','Действия'], convertWater:[3,0,20,'Переход в воду: вода','Действия'], acceptWater:[1,0,10,'Прием аквари: вода','Действия'], upgradeEnergy:[4,0,20,'Улучшение: энергия','Действия'],
  batteryPrice:[18,1,100,'Цена батареи','Энергия и производство'], batterySize:[36,1,200,'Заряд одной батареи','Энергия и производство'], recharge:[3,1,20,'Передача заряда за такт','Энергия и производство'],
  period:[3,1,12,'Период производства','Энергия и производство'], bioYield:[9,1,100,'Выпуск био','Энергия и производство'], waterYield:[4,1,20,'Выпуск воды','Энергия и производство'], productionEnergy:[2,0,20,'Энергия на один выпуск','Энергия и производство'],
  generatorPrice:[60,1,500,'Цена генератора','Улучшения'], generatorBio:[40,0,200,'Генератор: био','Улучшения'], generatorXP:[24,0,200,'Генератор: порог XP','Улучшения'], generatorPeriod:[3,1,12,'Генератор: период','Улучшения'], generatorYield:[3,1,20,'Генератор: выпуск энергии','Улучшения'], fuelSize:[12,1,100,'Емкость топливного бака','Улучшения'], fuelPrice:[4,1,100,'Цена полного бака','Улучшения'],
  capacityPrice:[35,1,300,'Цена накопителя','Улучшения'], capacityBio:[30,0,200,'Накопитель: био','Улучшения'], extraCapacity:[6,1,50,'Добавочная емкость энергии','Улучшения'],
  efficientPrice:[45,1,300,'Цена экономной перестройки','Улучшения'], efficientBio:[30,0,200,'Улучшение перестройки: био','Улучшения'], efficientSaving:[4,1,50,'Экономия био при перестройке','Улучшения'],
  shiftTicks:[24,18,48,'Рабочих тактов в смене','Смены и прогресс'], sleepTicks:[6,1,12,'Тактов сна','Смены и прогресс'], upkeep:[30,0,100,'Содержание за смену','Смены и прогресс'], target:[32,1,100,'Отправок для победы','Смены и прогресс'], bXP:[12,0,200,'Направление B: XP','Смены и прогресс'], cXP:[36,0,300,'Направление C: XP','Смены и прогресс'],
  arrivalPeriod:[4,2,10,'Интервал плановых прибытий','Поток и очередь'], extraOne:[12,0,100,'Шанс одного дополнительного гостя, %','Поток и очередь'], extraTwo:[2,0,100,'Шанс двух дополнительных гостей, %','Поток и очередь'], queueCap:[6,3,12,'Мест в очереди','Поток и очередь'], arrivalBuffer:[6,3,12,'Прекратить случайные прибытия за N тактов до сна','Поток и очередь'], openingGuests:[2,1,3,'Гостей в начале смены','Поток и очередь'], patienceSpread:[2,0,5,'Разброс терпения, плюс-минус тактов','Поток и очередь'], bioPack:[40,1,200,'Биоматериал в закупке','Энергия и производство'], bioPrice:[16,1,100,'Цена закупки биоматериала','Энергия и производство'],
  repTourist:[4,1,100,'Турист: репутация','Смены и прогресс'], repDiplomat:[10,1,150,'Дипломат: репутация','Смены и прогресс'], repTrader:[18,1,200,'Торговец: репутация','Смены и прогресс'],
};
for (let i=0;i<4;i++) {
  const name=CATEGORIES[i];
  for(const [key,values,min,max,label] of [ ['reward',[10,14,18,22],0,200,'кредиты'], ['xp',[3,4,6,7],0,30,'XP'], ['rep',[3,4,5,5],0,20,'репутация'], ['queue',[16,14,12,12],1,40,'срок в очереди'], ['room',[14,12,10,10],2,40,'срок в комнате'] ])
    FIELDS[`${key}${i}`]=[values[i],min,max,`${name}: ${label}`,'Пассажиры'];
}
export const DEFAULTS=Object.fromEntries(Object.entries(FIELDS).map(([k,v])=>[k,v[0]]));
export function validateConfig(config) {
  for(const [k,[,min,max,label]] of Object.entries(FIELDS)) if(!Number.isInteger(config[k])||config[k]<min||config[k]>max) return `${label}: целое число от ${min} до ${max}`;
  for(const k of ['bio','water','energy','reserve']) if(config[k]>config[k+'Cap']) return 'Начальный запас не может превышать емкость';
  if(config.extraOne+config.extraTwo>100)return 'Сумма вероятностей дополнительных гостей не может превышать 100%';
  if(config.openingGuests>config.queueCap||config.bioPack>config.bioCap)return 'Начальная очередь и закупка должны помещаться в емкость';
  if(config.batterySize>config.reserveCap) return 'Батарея должна помещаться в запас заряда';
  if(config.bioYield>config.bioCap||config.waterYield>config.waterCap||config.generatorYield>config.energyCap) return 'Партия производства должна помещаться в запас';
  if(!(config.bXP<=config.cXP&&config.repTourist<config.repDiplomat&&config.repDiplomat<config.repTrader)) return 'Пороги прогресса должны идти по возрастанию';
  if(config.efficientSaving>=config.convertBio) return 'После улучшения перестройка должна стоить хотя бы 1 био';
  if(Math.max(config.acceptEnergy,config.routeEnergy,config.sendEnergy,config.convertEnergy,config.upgradeEnergy)>config.energyCap) return 'Накопитель должен вмещать энергию самого дорогого действия';
  return '';
}
export const SCHEDULE=[['dry','dry','water','dry','water'],['dry','water','gas','dry','gas'],['water','gas','dry','dry','water'],['gas','dry','water','dry','gas'],['water','gas','dry','dry','water'],['gas','water','dry','dry','gas']];
export const arrivalTicks=(shift,cfg=DEFAULTS)=>Array.from({length:Math.floor((cfg.shiftTicks-cfg.arrivalBuffer-1)/cfg.arrivalPeriod)+1},(_,i)=>1+i*cfg.arrivalPeriod);
export const scheduledRace=(shift,slot)=>SCHEDULE[shift-1][slot%SCHEDULE[shift-1].length];
function random(s){s.rng=(Math.imul(s.rng,1664525)+1013904223)>>>0;return s.rng/4294967296;}
const roll=(s,min,max)=>min+Math.floor(random(s)*(max-min+1));
export const energyCap=s=>s.cfg.energyCap+(s.upgrades.capacity?s.cfg.extraCapacity:0);
export const routes=s=>['A',...(s.xp>=s.cfg.bXP?['B']:[]),...(s.xp>=s.cfg.cXP?['C']:[])];
export const active=s=>s.guests.filter(p=>p.status==='queue'||p.status==='room');
export const occupant=(s,index)=>s.guests.find(p=>p.status==='room'&&p.room===index);
export function newGame(config={},seed=Math.floor(Math.random()*4294967296)) {
  const cfg={...DEFAULTS,...config}; const err=validateConfig(cfg); if(err)throw Error(err);
  const s={version:VERSION,cfg,seed:seed>>>0,rng:seed>>>0,shift:1,tick:0,world:0,credits:cfg.credits,bio:cfg.bio,water:cfg.water,energy:cfg.energy,reserve:cfg.reserve,fuel:0,xp:0,rep:{dry:0,water:0,gas:0},unlocked:{dry:0,water:0,gas:0},rooms:['dry','water'],upgrades:{generator:false,capacity:false,efficient:false},production:{bio:false,water:false},guests:[],stories:{neri:{helped:false,gift:false},ro:{helped:false,gift:false}},sent:0,lost:0,skipped:0,ended:false,ending:'',log:[],summaries:[],nextId:1,metrics:{maxQueue:0,extraArrivals:0,overflow:0,bioSpentOnGuests:0}};
  opening(s,[]);return s;
}
function refreshUnlocks(s) {
  for(const race of Object.keys(RACES)) for(const [i,key] of [[1,'repTourist'],[2,'repDiplomat'],[3,'repTrader']]) if(s.rep[race]>=s.cfg[key]) s.unlocked[race]=Math.max(s.unlocked[race],i);
}
function spawn(s,slot,events,extra=false,forcedRace=null) {
  if(!extra&&s.guests.some(p=>p.shift===s.shift&&p.slot===slot&&!p.extra))return;
  const race=forcedRace||(extra?Object.keys(RACES)[roll(s,0,2)]:scheduledRace(s.shift,slot));
  let category=s.shift===1?0:s.unlocked[race]; const available=routes(s);
  if(category===1&&available.length<2) category=0;
  const story=extra?null:(s.shift===1&&slot===2)||(s.shift===4&&slot===2)?'neri':(s.shift===3&&slot===2)||(s.shift===6&&slot===3)?'ro':null;
  const names={dry:['Тим','Эно','Лис','Мио','Сан'],water:['Уна','Оли','Каи','Луми'],gas:['Фло','Иви','Зеф','Эхо']};
  const id=s.nextId++;
  const [lo,hi]=[[1,3],[3,6],[6,8],[8,10]][category];
  const sampledNeed=roll(s,lo,hi);
  const bioNeed=story==='neri'?7:story==='ro'?5:Math.min(10,sampledNeed+(race==='dry'?0:1));
  const patience=Math.max(3,s.cfg['queue'+category]+roll(s,-s.cfg.patienceSpread,s.cfg.patienceSpread));
  const p={id,race,category,extra,bioNeed,patienceMax:patience,queuePatience:patience,shift:s.shift,slot,story,visit:story?(s.shift<=3?1:2):0,name:story==='neri'?'Нери':story==='ro'?'Ро':names[race][(id-1)%names[race].length],status:'queue',room:null,route:null,allowed:category===0?null:category===1?available.slice(0,2):[available[(id-1)%available.length]],remaining:patience,help:false,traded:false};
  s.guests.push(p);
  if(extra)s.metrics.extraArrivals++;
  if(s.guests.filter(g=>g.status==='queue').length>s.cfg.queueCap) lose(s,p,'Очередь переполнена',events);
  else events.push(`Прибыл ${p.name}${extra?' (дополнительный)':''}: ${CATEGORIES[category].toLowerCase()} · ${bioNeed} био · терпение ${patience}`);
  s.metrics.maxQueue=Math.max(s.metrics.maxQueue,s.guests.filter(g=>g.status==='queue').length);
}
function opening(s,events){spawn(s,0,events);for(let i=1;i<s.cfg.openingGuests;i++)spawn(s,-s.nextId,events,true,s.shift===1?(i===1?'water':'dry'):null);}
function arrivals(s,events){
  const slot=arrivalTicks(s.shift,s.cfg).indexOf(s.tick+1);if(slot>=0)spawn(s,slot,events);
  if(s.tick<=s.cfg.shiftTicks-s.cfg.arrivalBuffer){const chance=random(s)*100;const count=chance<s.cfg.extraTwo?2:chance<s.cfg.extraTwo+s.cfg.extraOne?1:0;for(let i=0;i<count;i++)spawn(s,-s.nextId,events,true);}
}
export const allowedRoutes=(s,p)=>p.allowed||routes(s);
export function inspect(s,cmd) {
  const deny=reason=>({ok:false,reason,cost:{}}), noop=reason=>({ok:false,noop:true,reason,cost:{}});
  if(s.ended)return deny('Партия завершена');
  if(!cmd||typeof cmd!=='object')return deny('Неизвестное действие');
  let p=s.guests.find(g=>g.id===cmd.guest),cost={}, label='';
  const room=cmd.room;
  switch(cmd.type) {
    case 'wait':label='Ожидание';break;
    case 'close':label='Закрытие станции';break;
    case 'convert':
      if(![0,1].includes(room)||!RACES[cmd.medium])return deny('Неизвестная комната или среда');
      if(s.rooms[room]===cmd.medium)return noop('Эта среда уже установлена');
      if(occupant(s,room))return deny('Комната занята');
      cost={energy:s.cfg.convertEnergy,bio:s.cfg.convertBio-(s.upgrades.efficient?s.cfg.efficientSaving:0),water:cmd.medium==='water'?s.cfg.convertWater:0};label=`Комната ${room+1}: ${RACES[cmd.medium].medium.toLowerCase()} среда`;break;
    case 'accept':
      if(!p||p.status!=='queue')return deny('Пассажир уже не в очереди');
      if(![0,1].includes(room))return deny('Выберите комнату');
      if(occupant(s,room))return deny('Комната занята');
      if(s.rooms[room]!==p.race)return deny(`Нужна ${RACES[p.race].medium.toLowerCase()} среда`);
      cost={energy:s.cfg.acceptEnergy,bio:p.bioNeed,water:p.race==='water'?s.cfg.acceptWater:0};label=`Прием: ${p.name}`;break;
    case 'route':
      if(!p||p.status!=='room')return deny('Сначала разместите пассажира');
      if(p.route===cmd.route)return noop('Маршрут уже подтвержден');
      if(!routes(s).includes(cmd.route)||!allowedRoutes(s,p).includes(cmd.route))return deny('Недопустимое направление');
      if(cmd.help&&(!p.story||p.visit!==1||p.route))return deny('Решение истории уже принято');
      cost={energy:s.cfg.routeEnergy,...(cmd.help?(p.story==='neri'?{bio:2}:{credits:4}):{})};label=`${p.name}: маршрут ${cmd.route}`;break;
    case 'send':
      if(!p||p.status!=='room')return deny('Пассажир уже отправлен или не размещен');
      if(!p.route)return deny('Сначала подтвердите направление');
      cost={energy:s.cfg.sendEnergy};label=`Отправка: ${p.name}`;break;
    case 'refuse':
      if(!p||p.status!=='queue')return deny('Отказать можно только гостю в очереди');
      label=`Отказ: ${p.name}`;break;
    case 'toggle':
      if(!['bio','water'].includes(cmd.resource)||typeof cmd.on!=='boolean')return deny('Неизвестный производитель');
      if(s.production[cmd.resource]===cmd.on)return noop('Этот режим уже включен');
      label=`${cmd.resource==='bio'?'Биосинтезатор':'Водосборник'}: ${cmd.on?'включен':'выключен'}`;break;
    case 'battery':
      if(s.reserve+s.cfg.batterySize>s.cfg.reserveCap)return deny('Нет места для всей батареи');
      cost={credits:s.cfg.batteryPrice};label='Покупка батареи';break;
    case 'bioPack':
      if(s.bio+s.cfg.bioPack>s.cfg.bioCap)return deny('Нет места для всей партии биоматериала');
      cost={credits:s.cfg.bioPrice};label=`Закупка ${s.cfg.bioPack} био`;break;
    case 'fuel':
      if(!s.upgrades.generator)return deny('Сначала купите генератор');
      if(s.fuel!==0)return deny('Заправка доступна при пустом баке');
      cost={credits:s.cfg.fuelPrice};label='Заправка генератора';break;
    case 'upgrade': {
      const key=cmd.upgrade;
      if(!['generator','capacity','efficient'].includes(key))return deny('Неизвестное улучшение');
      if(s.upgrades[key])return noop('Улучшение уже установлено');
      if(key==='generator'&&s.xp<s.cfg.generatorXP)return deny(`Нужно ${s.cfg.generatorXP} XP, сейчас ${s.xp}`);
      cost={credits:s.cfg[key+'Price'],bio:s.cfg[key+'Bio'],energy:s.cfg.upgradeEnergy};label=`Улучшение: ${key==='generator'?'генератор':key==='capacity'?'накопитель':'перестройка'}`;break;
    }
    case 'trade':
      if(!p||p.status!=='room'||p.category!==3)return deny('Торговец должен находиться в комнате');
      if(p.traded)return noop('Сделка уже совершена');
      if(s.bio+30>s.cfg.bioCap)return deny('Нужно место для 30 био');
      cost={credits:10};label=`${p.name}: покупка 30 био`;break;
    default:return deny('Неизвестное действие');
  }
  for(const [key,value] of Object.entries(cost)) if(s[key]<value) return {...deny(`Нужно еще ${value-s[key]} ${ {credits:'кредитов',energy:'энергии',bio:'био',water:'воды'}[key] }`),cost};
  return {ok:true,cost,label};
}
function lose(s,p,reason,events) {
  const overflow=reason==='Очередь переполнена';
  const penalty=overflow?0:p.status==='room'?2:1;if(overflow)s.metrics.overflow++;
  p.status='lost';p.loss=reason;s.rep[p.race]=Math.max(0,s.rep[p.race]-penalty);s.lost++;
  events.push(`${p.name}: ${reason.toLowerCase()} · репутация −${penalty}`);
}
function background(s,events) {
  s.world++;
  if(s.upgrades.generator&&s.world%s.cfg.generatorPeriod===0&&s.fuel>0&&s.energy+s.cfg.generatorYield<=energyCap(s)) {
    s.fuel--;s.energy+=s.cfg.generatorYield;events.push(`Генератор: +${s.cfg.generatorYield} энергии, −1 топливо`);
  }
  const charge=Math.min(s.cfg.recharge,s.reserve,energyCap(s)-s.energy);
  s.reserve-=charge;s.energy+=charge;
  if(charge)events.push(`Батарея: +${charge} энергии, −${charge} заряда`);
  if(s.world%s.cfg.period===0)for(const resource of ['bio','water'])if(s.production[resource]) {
    const name=resource==='bio'?'Био':'Вода',amount=s.cfg[resource+'Yield'];
    if(s[resource]+amount>s.cfg[resource+'Cap'])events.push(`${name}: выпуск пропущен, склад заполнен`);
    else if(s.energy<s.cfg.productionEnergy)events.push(`${name}: выпуск пропущен, мало энергии`);
    else {s[resource]+=amount;s.energy-=s.cfg.productionEnergy;events.push(`${name}: +${amount}, −${s.cfg.productionEnergy} энергии`);}
  }
}
const snapshot=s=>({credits:s.credits,bio:s.bio,water:s.water,energy:s.energy,reserve:s.reserve,fuel:s.fuel,xp:s.xp,rep:{...s.rep},sent:s.sent,lost:s.lost});
function finishShift(s,events) {
  for(const p of active(s))lose(s,p,p.status==='room'?'Эвакуация при закрытии':'Закрытие станции',events);
  const appeared=s.guests.filter(p=>p.shift===s.shift).length;
  const skipped=arrivalTicks(s.shift,s.cfg).filter((t,slot)=>!s.guests.some(p=>p.shift===s.shift&&!p.extra&&p.slot===slot)).length;s.skipped+=skipped;
  for(let i=0;i<s.cfg.sleepTicks;i++)background(s,events);
  s.credits-=s.cfg.upkeep;events.push(`Сон: ${s.cfg.sleepTicks} тактов · содержание −${s.cfg.upkeep} кредитов`);
  const guests=s.guests.filter(p=>p.shift===s.shift);
  s.summaries.push({shift:s.shift,ticks:s.tick,sent:guests.filter(p=>p.status==='sent').length,lost:guests.filter(p=>p.status==='lost').length,skipped,arrived:appeared,...snapshot(s),shiftSent:guests.filter(p=>p.status==='sent').length,shiftLost:guests.filter(p=>p.status==='lost').length});
  if(s.credits<0||s.shift===6) {
    s.ended=true;s.ending=s.credits<0?'bankrupt':s.sent>=s.cfg.target?'win':'incomplete';
    events.push(s.ending==='win'?'Партия завершена: план выполнен':s.ending==='bankrupt'?'Партия завершена: банкротство':'Партия завершена: план отправок не выполнен');
  } else {s.shift++;s.tick=0;opening(s,events);}
}
export function act(state,cmd) {
  const check=inspect(state,cmd);if(!check.ok)return {state,...check,events:[]};
  const s=structuredClone(state),events=[],before=snapshot(s),oldShift=s.shift,oldTick=s.tick;
  let p=s.guests.find(g=>g.id===cmd.guest),newlyAccepted=null;
  for(const [key,value] of Object.entries(check.cost))s[key]-=value;
  switch(cmd.type) {
    case 'convert':s.rooms[cmd.room]=cmd.medium;break;
    case 'accept':s.metrics.bioSpentOnGuests+=p.bioNeed;p.status='room';p.room=cmd.room;p.remaining=s.cfg['room'+p.category];p.patienceMax=p.remaining;newlyAccepted=p.id;break;
    case 'route':if(!p.route)p.help=!!cmd.help;p.route=cmd.route;break;
    case 'send':
      p.status='sent';s.sent++;s.credits+=s.cfg['reward'+p.category];s.xp+=s.cfg['xp'+p.category];s.rep[p.race]+=s.cfg['rep'+p.category];
      events.push(`Награда: +${s.cfg['reward'+p.category]} кредитов, +${s.cfg['xp'+p.category]} XP, +${s.cfg['rep'+p.category]} репутации`);
      if(p.story&&p.visit===1&&p.help)s.stories[p.story].helped=true;
      if(p.story&&p.visit===2&&s.stories[p.story].helped&&!s.stories[p.story].gift) {
        s.stories[p.story].gift=true;
        if(p.story==='neri') {const gift=Math.min(20,s.cfg.bioCap-s.bio);s.bio+=gift;events.push(`Подарок Нери: +${gift} био${gift<20?` (${20-gift} не поместилось)`:''}`);}
        else {s.credits+=8;events.push('Подарок Ро: +8 кредитов');}
      }
      refreshUnlocks(s);break;
    case 'refuse':lose(s,p,'Отказ в приеме',events);break;
    case 'toggle':s.production[cmd.resource]=cmd.on;break;
    case 'battery':s.reserve+=s.cfg.batterySize;break;
    case 'fuel':s.fuel=s.cfg.fuelSize;break;
    case 'bioPack':s.bio+=s.cfg.bioPack;break;
    case 'upgrade':s.upgrades[cmd.upgrade]=true;if(cmd.upgrade==='generator')s.fuel=s.cfg.fuelSize;break;
    case 'trade':p.traded=true;s.bio+=30;break;
  }
  s.tick++;background(s,events);
  for(const guest of active(s))if(guest.id!==newlyAccepted) {guest.remaining--;if(guest.remaining<=0)lose(s,guest,'Истек срок ожидания',events);}
  if(cmd.type==='close'||s.tick>=s.cfg.shiftTicks)finishShift(s,events);
  else arrivals(s,events);
  s.log.push({n:s.log.length+1,shift:oldShift,tick:oldTick+1,world:s.world,command:structuredClone(cmd),label:check.label,cost:check.cost,before,after:snapshot(s),events});
  return {ok:true,state:s,events,label:check.label};
}
export function serialize(s) {return JSON.stringify(s);}
export function restore(text) {
  const s=JSON.parse(text);
  if(s.version!==VERSION||validateConfig(s.cfg)||!Array.isArray(s.guests)||!Array.isArray(s.log)||!Array.isArray(s.summaries)||!Array.isArray(s.rooms)||s.rooms.length!==2)throw Error('Сохранение другой версии или повреждено');
  if(!Number.isInteger(s.rng)||s.rng<0||s.rng>4294967295||!Number.isInteger(s.seed)||!s.metrics||s.guests.some(p=>!Number.isInteger(p.bioNeed)||p.bioNeed<1||p.bioNeed>10||!Number.isInteger(p.patienceMax)||p.patienceMax<1))throw Error('Повреждены данные потока или пассажира');
  for(const k of ['energy','reserve','bio','water','fuel','xp','sent','lost','skipped','world','tick'])if(!Number.isFinite(s[k])||s[k]<0)throw Error('Поврежденный запас');
  if(!Number.isFinite(s.credits)||!Number.isInteger(s.shift)||s.shift<1||s.shift>6||!s.production||!s.upgrades||!s.rep||!s.unlocked||!s.stories)throw Error('Поврежденное состояние');
  if(s.energy>energyCap(s)||s.bio>s.cfg.bioCap||s.water>s.cfg.waterCap||s.reserve>s.cfg.reserveCap)throw Error('Запасы превышают емкость');
  return s;
}
