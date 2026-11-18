/* Each instrument receives frozen estimates. Changing a view never fits a model. */
function intervalChart(player, group) {
  const lower = Math.floor(Math.min(...group.map(p => p.lo)));
  const upper = Math.ceil(Math.max(...group.map(p => p.hi)));
  const at = value => 100 * (value - lower) / (upper - lower);
  return `<span class="linechart" aria-hidden="true"><i class="axis"></i><i class="tick" style="left:${at(0)}%"></i>
    <i class="range" style="left:${at(player.lo)}%;width:${at(player.hi)-at(player.lo)}%"></i>
    <i class="floor-mark" style="left:${at(player.floor)}%"></i><i class="dot" style="left:${at(player.mean)}%"></i></span>`;
}

function overState(over, delivery) {
  const balls = over.sequence.split(' ');
  let [runs, wickets] = over.state.split('/').map(Number);
  for (const entry of balls.slice(0, delivery)) {
    runs += parseInt(entry, 10);
    if (entry.includes('W')) wickets++;
  }
  return { balls, score: runs+'/'+wickets, left: over.left-delivery };
}

function deliveryButtons(sequence, current, action) {
  return sequence.map((v,i) => {
    const label = v.includes('W') ? 'wicket' : v+' runs';
    return `<button data-${action}="${i+1}" aria-label="Ball ${i+1}, ${label}" aria-pressed="${current===i+1}" class="${current>i?'delivered':''}">${v.includes('W')?'W':v}</button>`;
  }).join('');
}

function bindMotion() {
  const hero = document.querySelector('.hero');
  const allowed = matchMedia('(hover:hover) and (pointer:fine) and (prefers-reduced-motion:no-preference)');
  let frame;
  hero.addEventListener('pointermove', event => {
    if (!allowed.matches || frame) return;
    frame=requestAnimationFrame(() => {
      const rect=hero.getBoundingClientRect();
      hero.style.setProperty('--light-x', ((event.clientX-rect.left)/rect.width*100)+'%');
      hero.style.setProperty('--light-y', ((event.clientY-rect.top)/rect.height*100)+'%');
      frame=0;
    });
  });
}
