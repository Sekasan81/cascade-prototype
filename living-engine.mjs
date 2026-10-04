// Independent simulation. All times are simulated seconds; the UI owns wall-clock time.
export const VERSION=1;
export const SAVE_KEY='cascade-living-station-v1';
export const TYPES={dry:'Сухая',water:'Водная',soil:'Грунтовая',gas:'Газовая'};
export const FOODS=[
 {name:'Рацион',icon:'◈',race:'human',type:'dry',route:0,ingredients:{organic:1,bio:1}},
 {name:'Мицелий',icon:'♧',race:'fungal',type:'soil',route:0,ingredients:{bio:2}},
 {name:'Аквагель',icon:'◉',race:'aquatic',type:'water',route:1,ingredients:{water:1,brine:1}},
 {name:'Минералы',icon:'◇',race:'stone',type:'dry',route:1,ingredients:{mineral:2}},
 {name:'Нектар',icon:'✧',race:'gaseous',type:'gas',route:2,ingredients:{chemical:1,protein:1}},
 {name:'Протеин',icon:'⬡',race:'human',type:'dry',route:2,ingredients:{protein:1,organic:1}},
 {name:'Солевой гель',icon:'≋',race:'aquatic',type:'water',route:2,ingredients:{brine:2}},
 {name:'Ферросмесь',icon:'▧',race:'stone',type:'dry',route:2,ingredients:{metal:1,mineral:1}}
];
export const ROUTES=[{name:'Марс',sub:'Сады красной планеты',image:'mars',price:0,rank:1},{name:'Сигма-4',sub:'Океан под двумя лунами',image:'sigma',price:180,rank:3},{name:'Альфа-9',sub:'Обсерватория на краю',image:'alpha',price:350,rank:4}];
export const RANKS=[{xp:0,name:'Тихая пристань'},{xp:12,name:'Первые связи'},{xp:45,name:'Местный узел'},{xp:110,name:'Межзвёздный порт'},{xp:240,name:'Живая экосистема'},{xp:450,name:'Дом среди звёзд'}];
export const MATERIALS={trash:'Мусор',w0:'Орг. отходы',w1:'Жидк. отходы',w2:'Твёрд. отходы',w3:'Биоотходы',organic:'Органика',bio:'Биомасса',water:'Вода',brine:'Раствор',mineral:'Мин. масса',metal:'Металл',protein:'Белок',chemical:'Хим. концентрат'};
const pairs=[['organic','bio'],['water','brine'],['mineral','metal'],['protein','chemical']];
export const MACHINES={recycler:{name:'Переработчик',icon:'♻',power:10,seconds:10,price:65},processor:{name:'Обработчик',icon:'⚗',power:15,seconds:10,price:80},crafter:{name:'Крафтер',icon:'⬡',power:20,seconds:25,price:100},booster:{name:'Усилитель',icon:'ϟ',power:25,seconds:0,price:90}};
export const MISSIONS=[
 {title:'Один маленький перелёт',text:'Отправьте первого пассажира.',kind:'served',target:1,reward:60},
 {title:'Здесь вас ждут',text:'Обслужите 3 пассажиров. Откроется фабрика.',kind:'served',target:3,reward:100},
 {title:'Ничего не пропадает',text:'Откройте фабрику и произведите 3 продукта.',kind:'made',target:3,reward:100},
 {title:'К океану двух лун',text:'Откройте направление Сигма-4.',kind:'sigma',target:1,reward:90},
 {title:'Попутчики',text:'Отправьте хотя бы 2 пассажиров одним варпом.',kind:'batch',target:2,reward:100},
 {title:'Станция с именем',text:'Обслужите 12 пассажиров.',kind:'served',target:12,reward:150},
 {title:'Дальше знакомых звёзд',text:'Откройте направление Альфа-9.',kind:'alpha',target:1,reward:150},
 {title:'Круг замкнулся',text:'Произведите 30 продуктов на фабрике.',kind:'made',target:30,reward:160},
 {title:'Дом среди звёзд',text:'Обслужите 30 пассажиров.',kind:'served',target:30,reward:300}
];
export const rank=s=>RANKS.reduce((n,r,i)=>s.xp>=r.xp?i+1:n,1);
export const unlockedFoods=s=>FOODS.map((_,i)=>i).filter(i=>s.routes.includes(FOODS[i].route));
const sum=a=>a.reduce((n,v)=>n+v,0);
function rand(s){s.rng=(Math.imul(s.rng,1664525)+1013904223)>>>0;return s.rng/4294967296;}
function pick(s,a){return a[Math.floor(rand(s)*a.length)];}
export function note(s,text){s.log.unshift({t:s.time,text});s.log.length=Math.min(s.log.length,40);}
export function createGame(seed=72491){
 const s={version:VERSION,rng:seed,time:0,remainder:0,paused:true,speed:1,credits:120,xp:0,cells:12,foods:[12,10,0,0,0,0,0,0],routes:[0],rooms:[{id:0,type:'dry',p:null},{id:1,type:'soil',p:null}],warps:[{id:0,capacity:3,dest:0,ids:[],remaining:0}],queue:[],serial:0,arrival:14,queueSize:3,mission:0,missionClaims:[],tutorial:true,helpUsed:0,rescueAt:0,streak:0,stats:{accepted:0,launched:0,served:0,made:0,batch:0,perfect:0,earned:0},factory:{open:false,cells:Array.from({length:16},(_,i)=>Math.floor(i/4)*5+i%4),machines:[],inventory:[],power:80,serial:0,resources:Object.fromEntries(Object.keys(MATERIALS).map(k=>[k,0]))},log:[],contract:{route:0,target:4,progress:0,serial:1},settings:{sound:false}};
 spawn(s,true);note(s,'Добро пожаловать в Терминал 07. Время остановлено: осмотритесь.');return s;
}
export function spawn(s,first=false){
 if(s.queue.length>=s.queueSize)return;
 const food=first?0:pick(s,unlockedFoods(s));const f=FOODS[food];const max=Math.max(...s.warps.map(w=>w.capacity));
 const special=!first&&s.stats.served>=3&&rand(s)<.3;
 const seats=first?1:Math.min(max,special?2+Math.floor(rand(s)*2):1);
 const wanderer=!first&&rand(s)<.15;
 const names=['Ирис','Оррен','Нэя','Тао','Уна','Вель','Элио','Каир','Севр','Роан','Лио','Тэя'];
 const job=first?'Ботаник':pick(s,['Исследователь','Турист','Курьер','Архивист','Музыкант']);
 const n=s.serial++;
 s.queue.push({id:n,name:names[n%names.length],food,type:f.type,race:f.race,seats,dest:wanderer?null:f.route,wanderer,job,story:first?'Везёт саженец для первого сада на Марсе.':'«Хорошо, что здесь можно передохнуть между мирами».',pay:38+f.route*12+(seats-1)*22+(special?8:0),patience:first?120:65+Math.floor(rand(s)*26),maxPatience:first?120:90,cycle:30,warning:false,fed:false,dissatisfied:false,recovery:0,waste:0,warp:null});
}
export const passenger=(s,id)=>s.queue.find(p=>p.id===id)||s.rooms.find(r=>r.p?.id===id)?.p;
export const usedSeats=(s,w)=>sum(w.ids.map(id=>passenger(s,id)?.seats||0));
export const power=s=>sum(s.factory.machines.map(m=>MACHINES[m.type].power));
export const missionProgress=(s,m=MISSIONS[s.mission])=>!m?0:m.kind==='sigma'?Number(s.routes.includes(1)):m.kind==='alpha'?Number(s.routes.includes(2)):s.stats[m.kind]||0;
export function tutorialStep(s){if(!s.tutorial)return -1;if(s.stats.served)return 4;if(s.warps.some(w=>w.remaining>0))return 3;if(!s.rooms.some(r=>r.p))return 0;return s.warps.some(w=>w.ids.length)?2:1;}
export function roomReason(s,p,r){return !r?'Нет комнаты':r.p?'Комната занята':r.type!==p.type&&s.foods[p.food]<2?'Для среды нужны 2 порции':s.foods[p.food]<(r.type!==p.type?3:1)?'Нужна порция для первого цикла':'';}
export function warpReason(s,p,w){return !w?'Нет варпа':w.remaining>0?'Подготовка уже идёт':p.warp===w.id?'Уже назначен':p.warp!==null&&s.warps.find(v=>v.id===p.warp)?.remaining>0?'Запущенный варп нельзя изменить':p.dest===null?'Сначала выберите направление':w.ids.length&&w.dest!==p.dest?'Другое направление':usedSeats(s,w)+p.seats>w.capacity?'Не хватает мест':'';}
export const roomPrice=s=>100+(s.rooms.length-2)*60;
export const warpPrice=s=>160+(s.warps.length-1)*100;
export function reason(s,a,id=null,x=null){
 const p=passenger(s,id),w=s.warps.find(v=>v.id===id),m=s.factory.machines.find(v=>v.id===id),f=s.factory;
 const funds=n=>s.credits<n?`Нужно ${n} кр. (не хватает ${n-s.credits})`:'';
 if(a==='accept')return !p||!s.queue.includes(p)?'Пассажира нет в очереди':roomReason(s,p,s.rooms.find(r=>r.id===x));
 if(a==='assign')return !p||s.queue.includes(p)?'Сначала примите пассажира':warpReason(s,p,s.warps.find(v=>v.id===x));
 if(a==='destination')return !p||!p.wanderer?'Направление задано пассажиром':!s.routes.includes(x)?'Направление закрыто':p.warp!==null&&s.warps.find(w=>w.id===p.warp)?.remaining>0?'Варп запущен':'';
 if(a==='unassign'||a==='evacuate')return !p||s.queue.includes(p)?'Нет пассажира в комнате':p.warp!==null&&s.warps.find(w=>w.id===p.warp)?.remaining>0?'Варп запущен':a==='unassign'&&p.warp===null?'Не назначен':'';
 if(a==='launch')return !w?'Нет варпа':w.remaining>0?'Варп уже запущен':!w.ids.length?'Сначала назначьте пассажиров':s.cells<usedSeats(s,w)?`Нужно ${usedSeats(s,w)} варп-ячеек`:'';
 if(a==='buyFood')return !unlockedFoods(s).includes(id)?'Рацион пока закрыт':funds(25);
 if(a==='buyCells')return funds(20);
 if(a==='buyRoom')return rank(s)<2?'После первого отправления':s.rooms.length>=8?'Все 8 комнат построены':funds(roomPrice(s));
 if(a==='buyWarp')return rank(s)<2?'После первого отправления':s.warps.length>=4?'Максимум 4 варпа':funds(warpPrice(s));
 if(a==='upgradeWarp')return !w?'Нет варпа':w.remaining>0?'Дождитесь отправки':w.capacity>=8?'Максимум 8 мест':funds(60+(w.capacity-3)*30);
 if(a==='route')return !ROUTES[id]?'Нет направления':s.routes.includes(id)?'Уже открыто':rank(s)<ROUTES[id].rank?`Нужен ранг ${ROUTES[id].rank}`:funds(ROUTES[id].price);
 if(a==='queue')return s.queueSize>=6?'Максимум 6 гостей':rank(s)<2?'Нужен ранг 2':funds(75+(s.queueSize-3)*40);
 if(a==='openFactory')return f.open?'Фабрика уже открыта':s.stats.served<3?'Отправьте 3 пассажиров':funds(120);
 if(a==='claim')return !MISSIONS[s.mission]?'Все главы завершены':missionProgress(s)<MISSIONS[s.mission].target?'Цель ещё не выполнена':'';
 if(a==='rescue')return s.time<s.rescueAt?`Поставка через ${Math.ceil(s.rescueAt-s.time)} с`:s.credits>=25&&s.cells>=3&&unlockedFoods(s).every(i=>s.foods[i]>=3)?'Резерв нужен только при нехватке запасов':'';
 if(['place','buyMachine','remove','upgradeMachine','recipe','expand','power'].includes(a)&&!f.open)return 'Сначала откройте фабрику';
 if(a==='buyMachine')return !MACHINES[id]?'Нет такой машины':id==='booster'&&rank(s)<4?'Усилители доступны с ранга 4':funds(MACHINES[id].price);
 if(a==='place')return !MACHINES[id]?'Нет такой машины':!f.cells.includes(x)?'Клетка ещё не куплена':f.machines.some(m=>m.cell===x)?'Клетка занята':!f.inventory.some(m=>m.type===id)?'Сначала купите машину':'';
 if(a==='remove')return !m?'Нет машины':'';
 if(a==='upgradeMachine')return !m?'Нет машины':m.type==='booster'?'Усилитель не улучшается':m.level>=3?'Максимальный уровень':funds(m.level===1?50:100);
 if(a==='recipe')return !m||m.type==='booster'?'Нет рецептов':!recipes(s,m).some(r=>r.id===x)?'Рецепт пока закрыт':m.recipe===x?'Рецепт уже выбран':'';
 if(a==='expand')return !Number.isInteger(id)||id<0||id>24?'Нет клетки':f.cells.includes(id)?'Клетка уже открыта':funds(50);
 if(a==='power')return f.power>=300?'Максимум 300 мощности':funds(100);
 if(['pause','speed','skipTutorial'].includes(a))return '';
 return 'Неизвестное действие';
}
function detach(s,p){if(p.warp!==null){const w=s.warps.find(w=>w.id===p.warp);w.ids=w.ids.filter(id=>id!==p.id);}p.warp=null;}
export function act(s,a,id=null,x=null){
 const blocked=reason(s,a,id,x);if(blocked)return {ok:false,reason:blocked};
 const p=passenger(s,id),f=s.factory,m=f.machines.find(m=>m.id===id),w=s.warps.find(w=>w.id===id);
 if(a==='pause')s.paused=!s.paused;
 if(a==='speed')s.speed=s.speed===1?2:1;
 if(a==='skipTutorial'){s.tutorial=false;s.paused=false;}
 if(a==='accept'){const r=s.rooms.find(r=>r.id===x);if(r.type!==p.type){s.foods[p.food]-=2;r.type=p.type;}s.foods[p.food]--;p.fed=true;p.cycle=30;r.p=p;s.queue=s.queue.filter(v=>v.id!==id);s.stats.accepted++;note(s,`${p.name} отдыхает в комнате ${r.id+1}.`);}
 if(a==='destination'){detach(s,p);p.dest=x;}
 if(a==='assign'){detach(s,p);const v=s.warps.find(v=>v.id===x);if(!v.ids.length)v.dest=p.dest;v.ids.push(id);p.warp=v.id;}
 if(a==='unassign')detach(s,p);
 if(a==='evacuate'){detach(s,p);s.rooms.find(r=>r.p===p).p=null;note(s,`${p.name} переселён в городской терминал. Без награды и штрафа.`);if(s.tutorial&&!s.stats.served&&!s.queue.length&&!s.rooms.some(r=>r.p))spawn(s,true);}
 if(a==='launch'){s.cells-=usedSeats(s,w);w.remaining=s.tutorial&&!s.stats.served?12:60;w.duration=w.remaining;s.stats.launched++;note(s,`Варп ${w.id+1}: курс на ${ROUTES[w.dest].name}.`);}
 if(a==='buyFood'){s.credits-=25;s.foods[id]+=5;}
 if(a==='buyCells'){s.credits-=20;s.cells+=10;}
 if(a==='buyRoom'){s.credits-=roomPrice(s);s.rooms.push({id:s.rooms.length,type:'dry',p:null});}
 if(a==='buyWarp'){s.credits-=warpPrice(s);s.warps.push({id:s.warps.length,capacity:3,dest:0,ids:[],remaining:0});}
 if(a==='upgradeWarp'){s.credits-=60+(w.capacity-3)*30;w.capacity++;}
 if(a==='queue'){s.credits-=75+(s.queueSize-3)*40;s.queueSize++;}
 if(a==='route'){s.credits-=ROUTES[id].price;s.routes.push(id);FOODS.forEach((food,i)=>{if(food.route===id)s.foods[i]+=8;});note(s,`Открыта ${ROUTES[id].name}! Доставлены новые рационы.`);}
 if(a==='claim'){const mission=MISSIONS[s.mission];s.credits+=mission.reward;s.missionClaims.push(s.mission++);note(s,`Цель «${mission.title}»: +${mission.reward} кр.`);if(s.tutorial&&s.stats.served)s.tutorial=false;}
 if(a==='rescue'){unlockedFoods(s).forEach(i=>s.foods[i]=Math.max(s.foods[i],5));s.cells=Math.max(s.cells,6);s.helpUsed++;s.rescueAt=s.time+120;note(s,'Соседний терминал прислал резервные рационы и ячейки.');}
 if(a==='openFactory'){s.credits-=120;f.open=true;f.resources.trash+=30;for(const [i,type]of ['recycler','processor','crafter'].entries())f.machines.push({id:f.serial++,type,level:1,cell:i,recipe:0,job:null});note(s,'Фабрика открыта. Три машины уже настроены на рационы. Снимите паузу для запуска.');}
 if(a==='buyMachine'){s.credits-=MACHINES[id].price;f.inventory.push({id:f.serial++,type:id,level:1,recipe:0,job:null});}
 if(a==='place'){const list=f.inventory.filter(m=>m.type===id).sort((a,b)=>b.level-a.level);const chosen=list[0];f.inventory=f.inventory.filter(m=>m.id!==chosen.id);f.machines.push({...chosen,cell:x,job:null});}
 if(a==='remove'){if(m.job)for(const[k,n]of Object.entries(m.job.input))f.resources[k]+=n;f.inventory.push({...m,cell:undefined,job:null});f.machines=f.machines.filter(v=>v.id!==id);}
 if(a==='upgradeMachine'){s.credits-=m.level===1?50:100;if(m.job){for(const[k,n]of Object.entries(m.job.input))f.resources[k]+=n;m.job=null;}m.level++;}
 if(a==='recipe'){if(m.job){for(const [k,n]of Object.entries(m.job.input))f.resources[k]+=n;m.job=null;}m.recipe=x;}
 if(a==='expand'){s.credits-=50;f.cells.push(id);}
 if(a==='power'){s.credits-=100;f.power+=40;}
 return {ok:true};
}
export function recipes(s,m){
 if(m.type==='recycler')return pairs.map((_,i)=>({id:i,name:MATERIALS['w'+i],input:{trash:2},output:{['w'+i]:2}}));
 if(m.type==='processor')return pairs.map((p,i)=>({id:i,name:p.map(k=>MATERIALS[k]).join(' + '),input:{['w'+i]:2},output:Object.fromEntries(p.map(k=>[k,1]))}));
 if(m.type==='crafter')return [...unlockedFoods(s).map(i=>({id:i,name:FOODS[i].name,input:FOODS[i].ingredients,food:i,output:{}})),{id:8,name:'Варп-ячейка',input:{metal:1,chemical:1},output:{},cells:1}];
 return [];
}
export function boosterCount(s,m){if(m.type==='booster')return 0;return s.factory.machines.filter(b=>b.type==='booster'&&Math.abs(b.cell%5-m.cell%5)+Math.abs(Math.floor(b.cell/5)-Math.floor(m.cell/5))===1).length;}
export function production(s,m){const r=recipes(s,m).find(r=>r.id===m.recipe);if(!r)return null;const count=m.level+boosterCount(s,m)*2;return {...r,input:Object.fromEntries(Object.entries(r.input).map(([k,n])=>[k,n*count])),output:Object.fromEntries(Object.entries(r.output).map(([k,n])=>[k,n*count])),count};}
export function machineStatus(s,m){if(power(s)>s.factory.power)return {label:'Нет мощности',key:'danger'};if(m.type==='booster')return {label:'Усиливает соседей',key:'good'};if(m.job)return {label:`${Math.ceil(m.job.left)} с`,key:'good'};const p=production(s,m);return !p?{label:'Выберите рецепт',key:'warn'}:Object.entries(p.input).some(([k,n])=>s.factory.resources[k]<n)?{label:'Нужно сырьё',key:'warn'}:{label:'Готова к циклу',key:'good'};}
function factoryTick(s){const f=s.factory;if(!f.open||power(s)>f.power)return;
 for(const m of f.machines){if(m.type==='booster')continue;
  if(m.job){m.job.left--;if(m.job.left<=0){const j=m.job;for(const[k,n]of Object.entries(j.output))f.resources[k]+=n;if(j.food!==undefined){s.foods[j.food]+=j.count;s.stats.made+=j.count;}if(j.cells){s.cells+=j.count;s.stats.made+=j.count;}m.job=null;}}
  if(!m.job){const p=production(s,m);if(p&&Object.entries(p.input).every(([k,n])=>f.resources[k]>=n)){for(const[k,n]of Object.entries(p.input))f.resources[k]-=n;m.job={...p,left:MACHINES[m.type].seconds};}}
 }
}
function departure(s,w){
 const batch=w.ids.length;let total=0;const previousRank=rank(s);
 for(const id of w.ids){const r=s.rooms.find(r=>r.p?.id===id);if(!r)continue;const p=r.p;
  const quality=!p.dissatisfied?1:!p.fed?0:p.recovery>=2?.75:.5;
  const bonus=batch>=2?Math.min(.3,(batch-1)*.1):0;
  const reward=Math.round(p.pay*quality*(1+bonus));s.credits+=reward;total+=reward;s.xp+=Math.round((10+p.seats*2)*quality);s.stats.served++;s.stats.perfect+=Number(quality===1);s.streak=quality===1?s.streak+1:0;fWaste(s,p.waste);r.p=null;
  if(w.dest===s.contract.route){s.contract.progress++;}
 }
 s.stats.earned+=total;s.stats.batch=Math.max(s.stats.batch,batch);note(s,`${ROUTES[w.dest].name}: ${batch} пассаж. отправлено, +${total} кр.${batch>=2?' Бонус попутчиков!':''}`);
 if(s.contract.progress>=s.contract.target){const reward=60+s.contract.serial*15;s.credits+=reward;note(s,`Контракт направления выполнен: +${reward} кр.`);s.contract={route:pick(s,s.routes),target:4+Math.min(4,s.contract.serial),progress:0,serial:s.contract.serial+1};}
 if(rank(s)>previousRank){const gift=40*rank(s);s.credits+=gift;note(s,`Ранг ${rank(s)}: ${RANKS[rank(s)-1].name}. Грант +${gift} кр.`);}
 w.ids=[];w.remaining=0;if(s.tutorial){s.paused=true;note(s,'Первый перелёт завершён! Заберите награду за цель.');}
}
function fWaste(s,n){s.factory.resources.trash+=n;}
function tick(s){
 s.time++;
 for(const r of s.rooms){const p=r.p;if(!p)continue;
  if(!p.fed&&s.foods[p.food]>0){s.foods[p.food]--;p.fed=true;}
  p.cycle--;p.warning=s.foods[p.food]===0;
  if(p.cycle<=0){if(p.fed)p.waste+=5;p.cycle=30;
   if(s.foods[p.food]>0){s.foods[p.food]--;p.fed=true;p.recovery++;}
   else {if(!p.fed){if(!p.dissatisfied)note(s,`${p.name}: пропущено питание. Восстановите запас.`);p.dissatisfied=true;p.recovery=0;}p.fed=false;}
  }
 }
 for(const w of s.warps){if(w.remaining>0){w.remaining--;if(!w.remaining)departure(s,w);}}
 factoryTick(s);
 if(!s.tutorial||s.stats.launched){for(const p of s.queue)p.patience--;s.queue=s.queue.filter(p=>p.patience>0);s.arrival--;if(s.arrival<=0){spawn(s);s.arrival=14+Math.floor(rand(s)*9);}}
}
export function advance(s,seconds){if(s.paused||!Number.isFinite(seconds)||seconds<=0)return;s.remainder+=Math.min(3600,seconds);while(s.remainder>=1&&!s.paused){s.remainder--;tick(s);}}
export function restoreGame(raw){
 try {const s=typeof raw==='string'?JSON.parse(raw):structuredClone(raw);if(s?.version!==VERSION||!Array.isArray(s.foods)||s.foods.length!==8||!Array.isArray(s.rooms)||!Array.isArray(s.warps)||!s.factory||!s.stats||!Array.isArray(s.routes))return null;
  if(![s.credits,s.xp,s.cells,s.time,...s.foods,...Object.values(s.factory.resources)].every(n=>Number.isFinite(n)&&n>=0))return null;
  if(s.rooms.length<2||s.rooms.length>8||s.warps.length<1||s.warps.length>4||!s.routes.every(i=>Number.isInteger(i)&&ROUTES[i])||!s.queue.every(p=>FOODS[p.food]))return null;
  if(!Number.isInteger(s.mission)||s.mission<0||s.mission>MISSIONS.length||!Array.isArray(s.log)||!s.log.every(e=>typeof e.text==='string'&&Number.isFinite(e.t))||!Array.isArray(s.missionClaims)||!s.settings||!s.contract||!ROUTES[s.contract.route]||![s.contract.target,s.contract.progress,s.contract.serial,s.arrival,s.rescueAt,s.rng,s.serial].every(n=>Number.isFinite(n)&&n>=0))return null;
  if(!Array.isArray(s.factory.cells)||new Set(s.factory.cells).size!==s.factory.cells.length||!s.factory.cells.every(c=>Number.isInteger(c)&&c>=0&&c<25)||!Array.isArray(s.factory.machines)||!Array.isArray(s.factory.inventory)||!Number.isFinite(s.factory.power)||s.factory.power<=0)return null;
  if(!Object.keys(MATERIALS).every(k=>Number.isFinite(s.factory.resources[k]))||!Object.values(s.stats).every(n=>Number.isFinite(n)&&n>=0))return null;
  const machines=[...s.factory.machines,...s.factory.inventory];if(new Set(machines.map(m=>m.id)).size!==machines.length||new Set(s.factory.machines.map(m=>m.cell)).size!==s.factory.machines.length)return null;
  for(const m of machines){if(!MACHINES[m.type]||![1,2,3].includes(m.level)||!Number.isInteger(m.id))return null;if(m.type!=='booster'&&!recipes(s,m).some(r=>r.id===m.recipe))return null;if(m.job&&(!Number.isFinite(m.job.left)||m.job.left<0||!m.job.input||!m.job.output||!Number.isFinite(m.job.count)||m.job.count<1||!Object.entries(m.job.input).every(([k,n])=>k in MATERIALS&&Number.isFinite(n)&&n>=0)||!Object.entries(m.job.output).every(([k,n])=>k in MATERIALS&&Number.isFinite(n)&&n>=0)))return null;}
  if(!s.factory.machines.every(m=>s.factory.cells.includes(m.cell)))return null;
  const people=[...s.queue,...s.rooms.filter(r=>r.p).map(r=>r.p)];if(new Set(people.map(p=>p.id)).size!==people.length||people.some(p=>!FOODS[p.food]||!Number.isInteger(p.seats)||p.seats<1||p.seats>8||!Number.isInteger(p.id)||typeof p.name!=='string'||!/^[-\p{L}\p{N} ]{1,40}$/u.test(p.name)||!['human','fungal','stone','aquatic','gaseous'].includes(p.race)||!TYPES[p.type]||!Number.isFinite(p.pay)||p.pay<0||!Number.isFinite(p.cycle)||p.cycle<=0||p.dest!==null&&!s.routes.includes(p.dest)))return null;
  for(const w of s.warps)if(!Array.isArray(w.ids)||new Set(w.ids).size!==w.ids.length||!Number.isInteger(w.capacity)||w.capacity<1||w.capacity>8||!Number.isFinite(w.remaining)||w.remaining<0||!s.routes.includes(w.dest)||w.ids.some(id=>!s.rooms.some(r=>r.p?.id===id&&r.p.warp===w.id&&r.p.dest===w.dest))||usedSeats(s,w)>w.capacity)return null;
  if(people.some(p=>p.warp!==null&&!s.warps.some(w=>w.id===p.warp&&w.ids.includes(p.id))))return null;
  s.paused=true;s.remainder=0;return s;
 }catch{return null;}
}
