const $ = selector => document.querySelector(selector);
const fmt = n => (n > 0 ? '+' : '') + n.toFixed(2);
const pct = n => Math.round(n * 100) + '%';
let side='Batting', selected=0, match=0, delivery=0, heroDelivery=0, timer=null;

function rankings() {
  const list=atlas.cards.filter(p=>p.side===side), player=list[selected];
  const batting=side==='Batting';
  $('#intro').textContent=batting?'Crunch · Pressure ≥60. Ranked by floor, in runs of impact per six pressure balls.':'Squeeze · Pressure ≥50. The broader band gives more bowling spells enough evidence.';
  $('#evidence').textContent=batting?'Ranks 2–10 overlap. Their top-ten chances range from 36% to 51%.':'All ten bowling intervals include par. No bowler showed a reliably positive edge.';
  document.querySelectorAll('[data-side]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.side===side));
  $('#rows').innerHTML=list.map((p,i)=>`<button class="row person" data-index="${i}" aria-pressed="${i===selected}" aria-controls="profile"><span class="ranknum">${String(i+1).padStart(2,'0')}</span><span><strong>${p.player_name}</strong><small>${p.pool}</small></span>${intervalChart(p,list)}<span class="num">${fmt(p.floor)}</span></button>`).join('');
  $('#profile').innerHTML=`<div class="overline">${side} file &nbsp;/&nbsp; Rank ${String(player.rank).padStart(2,'0')}</div><h3>${player.player_name}</h3><div class="pool">${player.pool}</div><span class="badge ${player.label==='Above par'?'above':''}">${player.label}</span>
    <div class="stats"><div class="stat"><strong>${fmt(player.floor)}</strong>Floor</div><div class="stat"><strong>${fmt(player.mean)}</strong>Mean impact</div><div class="stat"><strong>${pct(player.p10)}</strong>Top-ten chance</div></div>
    <div class="chartlabel">Runs of impact per six pressure balls</div>${intervalChart(player,list)}<div class="chartlabel">90% interval · ${fmt(player.lo)} to ${fmt(player.hi)}</div>
    <p class="profiletext">${player.rr_use}</p><div class="meta">${player.balls} pressure balls · ${player.matches} matches · Tier ${player.tier_num}${player.one?' · One-season evidence':''}</div>
    <details><summary>Read this estimate</summary><p>Four in five estimates exceed the floor. Zero means level with matched peers. “Above par” means the entire 90% interval is positive. Top-ten chance counts how often the player placed in the ten across model draws.</p></details>`;
}
function showBand(band) {
  document.querySelectorAll('[data-band]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.band===band));
  const crunch=atlas.cards.filter(p=>p.side==='Batting');
  const list=band==='60'?crunch:atlas.squeeze;
  const other=new Set((band==='60'?atlas.squeeze:crunch).map(x=>x.player_name));
  $('#bandlist').innerHTML=list.map((p,i)=>`<div class="bandrow"><span class="ranknum">${String(i+1).padStart(2,'0')}</span><strong>${p.player_name}</strong>${other.has(p.player_name)?'<small>Both tens</small>':''}<span>Floor ${fmt(p.floor)}</span></div>`).join('');
}
function hero() {
  const state=overState(atlas.overs[0],heroDelivery);
  $('#heroScore').innerHTML=`<strong>${state.score}</strong><span>${state.left} balls left</span>`;
  $('#heroBalls').innerHTML=deliveryButtons(state.balls,heroDelivery,'hero');
}
function stop() {
  clearInterval(timer); timer=null;
  $('#play').textContent='▶ Play over'; $('#play').setAttribute('aria-label','Play the over');
}
function replay() {
  const o=atlas.overs[match], state=overState(o,delivery);
  const player=atlas.cards.find(p=>p.player_name===o.name && p.side===(match===2?'Bowling':'Batting'));
  const token=state.balls[delivery-1];
  const outcome=!token?'Before the over':token.includes('W')?'Wicket':({'0':'Dot ball','1':'Single','4':'Four','6':'Six'}[token] || token+' runs');
  $('#matches').innerHTML=atlas.overs.map((p,i)=>`<button class="match" data-match="${i}" aria-pressed="${i===match}">${p.name}<small>${p.teams}</small></button>`).join('');
  $('#scrub').value=delivery;
  $('#scrub').setAttribute('aria-valuetext',delivery?'After delivery '+delivery:'Before the over');
  $('#score').innerHTML=`<div class="overline">${o.date} · Innings ${o.innings} · Over ${o.over}</div><div class="scoreline"><h3>${state.score}</h3><span>${state.left} balls left</span></div><div class="balls">${deliveryButtons(state.balls,delivery,'ball')}</div><strong>${delivery?'Ball '+delivery+' · ':''}${outcome}</strong>
  <div class="impactbox"><div class="overline">Best qualifying Crunch over</div><p><b>${fmt(o.impact)}</b> runs of impact across the complete over</p>${match===0?'<p>20 scored − 7 expected = +13.00 from runs. Preserving the wicket adds +2.66, for +15.66 total.</p>':''}<small>The ranking draws on ${player.matches} matches in the primary deployment.</small></div>`;
}
document.addEventListener('click',e=>{
  const b=e.target.closest('button'); if(!b)return;
  if(b.dataset.side){side=b.dataset.side;selected=0;rankings()}
  else if(b.dataset.index!==undefined){
    selected=Number(b.dataset.index);rankings();
    if(matchMedia('(max-width:760px)').matches)$('#profile').focus();
    else document.querySelector('[data-index="'+selected+'"]').focus({preventScroll:true});
  }else if(b.dataset.band){showBand(b.dataset.band)}
  else if(b.dataset.hero){heroDelivery=Number(b.dataset.hero);hero();document.querySelector('[data-hero="'+heroDelivery+'"]').focus({preventScroll:true})}
  else if(b.dataset.match!==undefined){stop();match=Number(b.dataset.match);delivery=0;replay();document.querySelector('[data-match="'+match+'"]').focus({preventScroll:true})}
  else if(b.dataset.ball){stop();delivery=Number(b.dataset.ball);replay();document.querySelector('[data-ball="'+delivery+'"]').focus({preventScroll:true})}
});
$('#scrub').addEventListener('input',e=>{stop();delivery=Number(e.target.value);replay()});
$('#play').addEventListener('click',()=>{
  if(timer){stop();return}
  if(delivery===6)delivery=0;
  $('#play').textContent='Ⅱ Pause';$('#play').setAttribute('aria-label','Pause replay');
  replay();timer=setInterval(()=>{delivery++;replay();if(delivery===6)stop()},900);
});
document.addEventListener('visibilitychange',()=>{if(document.hidden)stop()});
$('#openReplay').addEventListener('click',()=>{stop();match=0;delivery=heroDelivery;replay()});
$('#scope').innerHTML=atlas.scope.slice().sort((a,b)=>a.percent-b.percent).map(x=>`<div class="barline"><span>${x.bat_role}</span><i style="width:${x.percent}%"></i><b>${x.percent.toFixed(1)}%</b></div>`).join('');
rankings();showBand('60');hero();replay();bindMotion();
