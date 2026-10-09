// Generated atlases: six wardrobe families per race. Size changes the displayed silhouette scale.
export const ROLE_FAMILY=[4,2,1,1,3,0,2,4,3,5,4,5,4,0,4,2,5,3,1,1];
export function portraitView(p,raceName,roleName,sizeName){
 const role=p.tutorial?0:ROLE_FAMILY[p.arch]??2;
 const scale=[.72,.82,.92,1,1.06,1.12][p.size];
 const title=`${raceName} · ${roleName} · ${sizeName}`;
 return `<div class="passenger-portrait" role="img" aria-label="${title}" data-race="${p.race}" data-role="${role}" data-size="${p.size}"><span style="background-image:url('assets/v2/portrait-${p.race}.webp');background-position:${role%3*50}% ${Math.floor(role/3)*100}%;transform:scale(${scale})"></span></div>`;
}
export function machineIcon(type,large=false){return `<span class="art-icon machine-icon ${large?'large-icon':''}" role="img" aria-label="Иконка машины" style="background-position:${type%3*50}% ${Math.floor(type/3)*100}%"></span>`;}
export function resourceIcon(index,large=false){return `<span class="art-icon resource-icon ${large?'large-icon':''}" aria-hidden="true" style="background-position:${index%6*20}% ${Math.floor(index/6)*50}%"></span>`;}
export function seatScale(value,total,label='Места'){
 return `<span class="seat-scale" role="img" aria-label="${label}: ${value} из ${total}"><span class="seat-dots" aria-hidden="true">${Array.from({length:total},(_,i)=>`<i class="${i<value?'filled':''}"></i>`).join('')}</span><b>${value}<small> / ${total}</small></b></span>`;
}
