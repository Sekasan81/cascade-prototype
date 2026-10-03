export const RESOURCES={water:{name:'Вода',icon:'💧'},food:{name:'Еда',icon:'🍖'},bio:{name:'Биоматериал',icon:'🧬'},gas:{name:'Газ',icon:'≋'}};
export const RACES={
 human:{name:'Человекоподобный',room:'dry',consume:'food',use:1,produce:'bio',yield:.5,payMin:10,payMax:20,seats:1,waitMin:8,waitMax:10},
 aquatic:{name:'Водный',room:'water',consume:'water',use:1,produce:'food',yield:.5,payMin:10,payMax:25,seats:1,waitMin:6,waitMax:8},
 fungal:{name:'Грибной',room:'soil',consume:'bio',use:.5,produce:'gas',yield:1,payMin:5,payMax:20,seats:1,waitMin:15,waitMax:20},
 gaseous:{name:'Газовый',room:'gas',consume:'gas',use:1,produce:'water',yield:.5,payMin:10,payMax:25,seats:1,waitMin:6,waitMax:8},
 stone:{name:'Каменный',room:'dry',consume:null,use:0,produce:null,yield:0,payMin:30,payMax:40,seats:2,waitMin:15,waitMax:20}
};
export const PROFESSIONS={refugee:{name:'Беженец',use:.5,pay:.8},tourist:{name:'Турист'},merchant:{name:'Торговец',pay:1.3},diplomat:{name:'Дипломат',food:1.5,pay:2},researcher:{name:'Исследователь'},engineer:{name:'Инженер',yield:1.5}};
export const CHARACTERS={calm:{name:'Спокойный'},aggressive:{name:'Агрессивный'},impatient:{name:'Нетерпеливый',wait:-2},glutton:{name:'Прожорливый',use:1.5,pay:1.5},greedy:{name:'Жадный',pay:.7,yield:1.5},friendly:{name:'Дружелюбный',wait:2}};
export const FEATURES={none:{name:'Нет особенности',icon:'—'},pet:{name:'Питомец',icon:'🐾',seats:1,yield:2},pair:{name:'Пара',icon:'👥',count:2},luggage:{name:'Багаж',icon:'🧳',seats:1,pay:1.2},heavy:{name:'Много багажа',icon:'📦',seats:2,pay:1.5},vip:{name:'VIP',icon:'★',use:2,pay:2}};
export const PROBABILITIES={pet:10,pair:10,luggage:20,heavy:5,vip:5,touristPet:30,touristPair:50,merchantLuggage:40};
export const emptyResources=()=>({water:0,food:0,bio:0,gas:0});
export const round=n=>Math.round((n+Number.EPSILON)*1000)/1000;
export function random(s){s.rng=(Math.imul(s.rng,1664525)+1013904223)>>>0;return s.rng/4294967296;}
export const roll=(s,min,max)=>min+Math.floor(random(s)*(max-min+1));
const pick=(s,a)=>a[Math.floor(random(s)*a.length)];
export function featureProbabilities(profession,config){
 const c=config.probabilities||PROBABILITIES;
 let rates={pet:c.pet,pair:c.pair,luggage:profession==='merchant'?c.merchantLuggage:c.luggage,heavy:c.heavy,vip:profession==='diplomat'?c.vip:0};
 if(profession==='tourist'){
  const left=100-c.touristPet-c.touristPair,baseNone=100-c.pet-c.pair-c.luggage-c.heavy,rest=baseNone+c.luggage+c.heavy;
  rates={pet:c.touristPet,pair:c.touristPair,luggage:left*c.luggage/rest,heavy:left*c.heavy/rest,vip:0};
 }
 rates.none=100-Object.values(rates).reduce((n,v)=>n+v,0);return rates;
}
export function passengerStats(p){
 const race=p.base||RACES[p.raceId],job=PROFESSIONS[p.profession],character=CHARACTERS[p.character],feature=FEATURES[p.feature],count=feature.count||1;
 const used=emptyResources(),made=emptyResources();
 if(race.consume)used[race.consume]=round(race.use*(job.use||1)*(race.consume==='food'?(job.food||1):1)*(character.use||1)*(feature.use||1)*count);
 if(race.produce)made[race.produce]=round(race.yield*(job.yield||1)*(character.yield||1)*(feature.yield||1)*count);
 return {used,made,seats:race.seats*count+(feature.seats||0),count,payment:Math.round(p.basePay*(job.pay||1)*(character.pay||1)*(feature.pay||1)*count*100)/100};
}
export function generatePassenger(s){
 const n=s.serial++,raceId=pick(s,Object.keys(RACES)),race={...RACES[raceId],...s.config.races?.[raceId]},profession=pick(s,Object.keys(PROFESSIONS));
 const character=pick(s,Object.keys(CHARACTERS).filter(k=>!(k==='aggressive'&&['fungal','gaseous'].includes(raceId))&&!(k==='glutton'&&raceId==='stone')));
 const rates=featureProbabilities(profession,s.config);let r=random(s)*100,feature='none';for(const [k,v]of Object.entries(rates)){r-=v;if(r<0){feature=k;break;}}
 const names=['Оррен','Нэя','Севр','Ирис','Тао','Вель','Каир','Уна','Элио','Роан'];
 const patience=roll(s,race.waitMin,race.waitMax)+(CHARACTERS[character].wait||0);
 const p={id:`P${n}`,name:names[n%10]+(n>=10?' '+(Math.floor(n/10)+1):''),raceId,race:race.name,base:race,profession,character,feature,type:race.room,dest:pick(s,['Марс','Сигма-4','Альфа-9']),basePay:roll(s,race.payMin,race.payMax),patience,initialPatience:patience,flight:null};
 p.count=passengerStats(p).count;return p;
}
