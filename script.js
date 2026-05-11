const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const cursor = document.getElementById('cursor');
const flash = document.getElementById('flash');
const loading = document.getElementById('loading');
const welcome = document.getElementById('welcome');
const mascot = document.getElementById('mascot');
const exploreBtn = document.getElementById('explore-btn');
const siteContent = document.getElementById('site-content');
const navbar = document.getElementById('navbar');
const navToggle = document.getElementById('navToggle');
const heroMascot = document.getElementById('heroMascot');
const ctaDot = document.getElementById('ctaDot');
const mitchowDot = document.getElementById('mitchowDot');

const S = {
  mouse: { x: window.innerWidth/2, y: window.innerHeight/2 },
  center: { x: window.innerWidth/2, y: window.innerHeight/2 },
  target: { x: window.innerWidth/2, y: window.innerHeight/2 },
  lastMoveTime: 0, activating: false, activated: false,
  activationStart: 0, transitioning: false, transitionStart: 0,
  zoomed: false, explored: false, particles: [], stars: [], nodes: [],
  connections: [], flowParticles: [], hoverIdx: -1, soundReady: false, audioCtx: null,
};

function resize() {
  canvas.width = window.innerWidth; canvas.height = window.innerHeight;
  if (!S.activated && !S.activating) { S.center.x = window.innerWidth/2; S.center.y = window.innerHeight/2; S.target.x = window.innerWidth/2; S.target.y = window.innerHeight/2; }
  createStars(); if (S.explored) initNodes();
}
window.addEventListener('resize', resize);

function initAudio() {
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    S.audioCtx = new AC(); S.soundReady = true;
    const m = S.audioCtx.createGain(); m.gain.value = 0.035; m.connect(S.audioCtx.destination);
    const o1 = S.audioCtx.createOscillator(); o1.type='sine'; o1.frequency.value=55;
    const g1 = S.audioCtx.createGain(); g1.gain.value=0.3; o1.connect(g1); g1.connect(m); o1.start();
    const o2 = S.audioCtx.createOscillator(); o2.type='sine'; o2.frequency.value=65;
    const g2 = S.audioCtx.createGain(); g2.gain.value=0.2; o2.connect(g2); g2.connect(m); o2.start();
    const lfo = S.audioCtx.createOscillator(); lfo.type='sine'; lfo.frequency.value=0.2;
    const lg = S.audioCtx.createGain(); lg.gain.value=0.02; lfo.connect(lg); lg.connect(g1.gain); lfo.start();
    S.audioCtx._master = m;
    function r() { if(S.audioCtx&&S.audioCtx.state==='suspended') S.audioCtx.resume(); document.removeEventListener('click',r); document.removeEventListener('touchstart',r); }
    document.addEventListener('click',r); document.addEventListener('touchstart',r);
  } catch(e) {}
}
function playClick(p) { if(!S.soundReady) return; try{ const o=S.audioCtx.createOscillator(),g=S.audioCtx.createGain(); o.type='sine'; o.frequency.value=p||600; g.gain.setValueAtTime(0.05,S.audioCtx.currentTime); g.gain.exponentialRampToValueAtTime(0.001,S.audioCtx.currentTime+0.08); o.connect(g); g.connect(S.audioCtx._master||S.audioCtx.destination); o.start(); o.stop(S.audioCtx.currentTime+0.08); }catch(e){} }
function playConnect() { if(!S.soundReady) return; try{ const t=S.audioCtx.currentTime,o=S.audioCtx.createOscillator(),g=S.audioCtx.createGain(); o.type='sine'; o.frequency.setValueAtTime(300,t); o.frequency.exponentialRampToValueAtTime(600,t+0.15); g.gain.setValueAtTime(0.07,t); g.gain.exponentialRampToValueAtTime(0.001,t+0.2); o.connect(g); g.connect(S.audioCtx._master||S.audioCtx.destination); o.start(t); o.stop(t+0.2); }catch(e){} }
function playActivate() { if(!S.soundReady) return; try{ const t=S.audioCtx.currentTime; [200,300,500,800].forEach((f,i)=>{ const o=S.audioCtx.createOscillator(),g=S.audioCtx.createGain(); o.type='sine'; o.frequency.value=f; g.gain.setValueAtTime(0.04,t+i*0.1); g.gain.exponentialRampToValueAtTime(0.001,t+i*0.1+0.3); o.connect(g); g.connect(S.audioCtx._master||S.audioCtx.destination); o.start(t+i*0.1); o.stop(t+i*0.1+0.3); }); }catch(e){} }

function createStars() { S.stars=[]; for(let i=0;i<200;i++) S.stars.push({x:Math.random()*canvas.width,y:Math.random()*canvas.height,s:Math.random()*1+0.3,o:Math.random()*0.1+0.02}); }
function createParticles() { S.particles=[]; for(let i=0;i<35;i++){ const r=70+Math.random()*180,s=(0.0006+Math.random()*0.005)*(i%2===0?1:-1); S.particles.push({a:Math.random()*Math.PI*2,r,s,size:1.5+Math.random()*2.5,o:0.35+Math.random()*0.45,x:0,y:0,orb:false,bp:0}); } }

function initNodes() { if(!S.explored) return; S.nodes=[]; const n=8+Math.floor(Math.random()*5),cx=canvas.width/2,cy=canvas.height/2; for(let i=0;i<n;i++){ const a=i/n*Math.PI*2+Math.random()*0.3,r=120+Math.random()*180; S.nodes.push({x:cx+Math.cos(a)*r,y:cy+Math.sin(a)*r,targetX:cx+Math.cos(a)*r,targetY:cy+Math.sin(a)*r,vx:0,vy:0,size:1.8+Math.random()*2.5,pulse:Math.random()*Math.PI*2,speed:0.0006+Math.random()*0.002,angle:a,radius:r}); } }
function initFlow() { S.flowParticles=[]; for(let i=0;i<15;i++){ const f=Math.floor(Math.random()*S.nodes.length); let t=Math.floor(Math.random()*S.nodes.length); if(t===f) t=(t+1)%S.nodes.length; S.flowParticles.push({from:f,to:t,progress:Math.random(),speed:0.002+Math.random()*0.006,size:1.2+Math.random()*1.5}); } }

function updateCenter(t) { if(S.transitioning||S.zoomed) return; const e=0.05; if(t-S.lastMoveTime>4000){ const dx=window.innerWidth/2-S.target.x,dy=window.innerHeight/2-S.target.y; if(Math.hypot(dx,dy)>1){ S.target.x+=dx*0.008; S.target.y+=dy*0.008; } } S.center.x+=(S.target.x-S.center.x)*e; S.center.y+=(S.target.y-S.center.y)*e; }

function updateParticles(t) {
  if(S.explored) return;
  const cx=S.center.x,cy=S.center.y;
  for(const p of S.particles){
    if(S.activating&&!S.activated){ const e=Math.min((t-S.activationStart)/1600,1); if(e>0.2){ const bp=Math.min((e-0.2)/0.8,1),es=1-Math.pow(1-bp,3); p.x=cx+(cx+Math.cos(p.a)*p.r-cx)*es; p.y=cy+(cy+Math.sin(p.a)*p.r-cy)*es; p.bp=bp; } if(e>=1){ p.orb=true; p.x=cx+Math.cos(p.a)*p.r; p.y=cy+Math.sin(p.a)*p.r; S.activating=false; S.activated=true; S.target.x=window.innerWidth/2; S.target.y=window.innerHeight/2; } continue; }
    if(S.transitioning||S.zoomed){ if(S.transitioning){ const e=Math.min((t-S.transitionStart)/1200,1),cp=Math.min(e*1.5,1),es=1-Math.pow(1-cp,2); p.x=cx+(p.x-cx)*(1-es); p.y=cy+(p.y-cy)*(1-es); } continue; }
    if(!p.orb){ p.x=cx; p.y=cy; continue; }
    p.a+=p.s; p.x=cx+Math.cos(p.a)*p.r; p.y=cy+Math.sin(p.a)*p.r;
  }
}

function updateMesh(t) {
  if(!S.explored) return;
  const scY=window.scrollY||0,cx=canvas.width/2,cy=canvas.height/2;
  for(let i=0;i<S.nodes.length;i++){ const n=S.nodes[i],da=n.angle+Math.sin(t*n.speed+i)*0.3,dr=n.radius+Math.sin(t*0.0005+i*2)*20; n.targetX=cx+Math.cos(da)*dr+scY*0.02; n.targetY=cy+Math.sin(da)*dr+scY*0.02; n.vx+=(n.targetX-n.x)*0.02; n.vy+=(n.targetY-n.y)*0.02; n.vx*=0.94; n.vy*=0.94; n.x+=n.vx; n.y+=n.vy; n.pulse+=0.015; }
  S.connections=[];
  for(let i=0;i<S.nodes.length;i++) for(let j=i+1;j<S.nodes.length;j++){ const a=S.nodes[i],b=S.nodes[j],d=Math.hypot(a.x-b.x,a.y-b.y); if(d<250) S.connections.push({a,b,alpha:1-d/250}); }
  for(const p of S.flowParticles){ p.progress+=p.speed; if(p.progress>1){ p.progress=0; p.from=p.to; p.to=Math.floor(Math.random()*S.nodes.length); } }
  if(S.flowParticles.length<S.nodes.length&&Math.random()<0.02) initFlow();
}

function draw(t) {
  ctx.clearRect(0,0,canvas.width,canvas.height);
  const g=ctx.createRadialGradient(canvas.width/2,canvas.height/2,0,canvas.width/2,canvas.height/2,canvas.width*0.7);
  g.addColorStop(0,'#080a16'); g.addColorStop(0.5,'#06070e'); g.addColorStop(1,'#030306');
  ctx.fillStyle=g; ctx.fillRect(0,0,canvas.width,canvas.height);
  for(const s of S.stars){ ctx.fillStyle=`rgba(255,255,255,${s.o})`; ctx.beginPath(); ctx.arc(s.x,s.y,s.s,0,Math.PI*2); ctx.fill(); }

  const cx=S.center.x,cy=S.center.y;

  if(S.explored) {
    const scY=window.scrollY||0;
    for(const c of S.connections){ const p=0.3+0.7*(0.5+0.5*Math.sin(t*0.002+c.a.x)),a=c.alpha*0.06*p; ctx.strokeStyle=`rgba(0,229,255,${a})`; ctx.lineWidth=0.5; ctx.beginPath(); ctx.moveTo(c.a.x,c.a.y); ctx.lineTo(c.b.x,c.b.y); ctx.stroke(); const pp=(t*0.0003+c.a.x*0.01)%1,px=c.a.x+(c.b.x-c.a.x)*pp,py=c.a.y+(c.b.y-c.a.y)*pp; ctx.fillStyle=`rgba(0,229,255,${0.2*(1-Math.abs(pp-0.5)*2)})`; ctx.beginPath(); ctx.arc(px,py,1.5,0,Math.PI*2); ctx.fill(); }
    for(const n of S.nodes){ const p=0.5+0.5*Math.sin(n.pulse),r=n.size*(1+p*0.2); const grd=ctx.createRadialGradient(n.x,n.y,0,n.x,n.y,r*4); grd.addColorStop(0,`rgba(0,229,255,${0.04*p})`); grd.addColorStop(1,'rgba(0,229,255,0)'); ctx.fillStyle=grd; ctx.beginPath(); ctx.arc(n.x,n.y,r*4,0,Math.PI*2); ctx.fill(); ctx.fillStyle=`rgba(0,229,255,${0.2+p*0.15})`; ctx.beginPath(); ctx.arc(n.x,n.y,r,0,Math.PI*2); ctx.fill(); }
    for(const p of S.flowParticles){ const fn=S.nodes[p.from],tn=S.nodes[p.to]; if(fn&&tn){ const x=fn.x+(tn.x-fn.x)*p.progress,y=fn.y+(tn.y-fn.y)*p.progress; ctx.fillStyle=`rgba(0,229,255,${0.3*(1-Math.abs(p.progress-0.5)*2)})`; ctx.beginPath(); ctx.arc(x,y,p.size,0,Math.PI*2); ctx.fill(); } }
    return;
  }

  const showP=S.activating||S.activated;
  if(showP&&!S.zoomed){
    for(let i=0;i<S.particles.length;i++) for(let j=i+1;j<S.particles.length;j++){ const a=S.particles[i],b=S.particles[j]; if((!a.orb&&a.bp<0.3)||(!b.orb&&b.bp<0.3)) continue; const d=Math.hypot(a.x-b.x,a.y-b.y); if(d<160&&d>5){ ctx.strokeStyle=`rgba(0,229,255,${(1-d/160)*0.05})`; ctx.lineWidth=0.4; ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y); ctx.stroke(); } }
    for(const p of S.particles){ if((p.orb||p.bp>0)&&!S.zoomed){ const d=Math.hypot(p.x-cx,p.y-cy); if(d>8){ ctx.strokeStyle=`rgba(0,229,255,${0.04+0.06*(1-Math.min(d/300,1))})`; ctx.lineWidth=0.4; ctx.beginPath(); ctx.moveTo(cx,cy); ctx.lineTo(p.x,p.y); ctx.stroke(); } } }
    for(const p of S.particles){ if((p.orb||p.bp>0)&&!S.zoomed){ ctx.save(); ctx.shadowColor='rgba(0,229,255,0.2)'; ctx.shadowBlur=5; ctx.fillStyle=`rgba(0,229,255,${p.o})`; ctx.beginPath(); ctx.arc(p.x,p.y,p.size,0,Math.PI*2); ctx.fill(); ctx.restore(); } }
  }

  if(!S.zoomed&&!S.explored){
    let ds=1,gs=1;
    if(S.activating&&!S.activated){ const e=Math.min((t-S.activationStart)/1600,1),pk=0.3; if(e<pk) ds=1+(e/pk)*2; else ds=3-((e-pk)/(1-pk))*2; gs=1+e*4; }
    if(S.transitioning){ const e=Math.min((t-S.transitionStart)/1200,1); ds=1+e*8; gs=1+e*6; const fr=Math.max(0,Math.min(1,(e-0.25)/0.3)),ff=Math.max(0,Math.min(1,(e-0.55)/0.45)); flash.style.opacity=e>0.55?1-ff:fr; if(e>=1){ S.zoomed=true; S.transitioning=false; showWelcome(); } }
    const pf=1+0.12*Math.sin(t*0.0025),r=6*ds*pf,gr=(45+20*Math.sin(t*0.002))*gs;
    if(S.activated&&!S.transitioning){ const rp=0.5+0.5*Math.sin(t*0.003); ctx.strokeStyle=`rgba(0,229,255,${0.06*rp})`; ctx.lineWidth=1; ctx.setLineDash([4,8]); ctx.beginPath(); ctx.arc(cx,cy,28+rp*8,0,Math.PI*2); ctx.stroke(); ctx.setLineDash([]); }
    const gg=ctx.createRadialGradient(cx,cy,0,cx,cy,gr*2.5); gg.addColorStop(0,`rgba(0,229,255,${0.15*gs})`); gg.addColorStop(0.3,`rgba(0,229,255,${0.05*gs})`); gg.addColorStop(1,'rgba(0,229,255,0)');
    ctx.fillStyle=gg; ctx.beginPath(); ctx.arc(cx,cy,gr*2.5,0,Math.PI*2); ctx.fill();
    ctx.save(); ctx.shadowColor='rgba(0,229,255,0.5)'; ctx.shadowBlur=gr; ctx.fillStyle='#00e5ff'; ctx.beginPath(); ctx.arc(cx,cy,r,0,Math.PI*2); ctx.fill(); ctx.restore();
    ctx.fillStyle='#00e5ff'; ctx.beginPath(); ctx.arc(cx,cy,r*0.55,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='rgba(255,255,255,0.15)'; ctx.beginPath(); ctx.arc(cx-r*0.25,cy-r*0.25,r*0.2,0,Math.PI*2); ctx.fill();
  }
}

function animate(ts) { const t=ts||performance.now(); updateCenter(t); updateParticles(t); updateMesh(t); draw(t); requestAnimationFrame(animate); }

function startActivation() { loading.style.opacity='0'; setTimeout(()=>{loading.style.display='none'},600); S.activating=true; S.activationStart=performance.now(); playActivate(); }

function showWelcome() { canvas.style.opacity='0'; welcome.classList.add('visible'); playConnect(); }
function showSite() { welcome.classList.remove('visible'); welcome.style.display='none'; S.zoomed=false; S.explored=true; siteContent.classList.add('visible'); canvas.style.opacity='1'; initNodes(); initFlow(); }

document.addEventListener('mousemove',e=>{ S.mouse.x=e.clientX; S.mouse.y=e.clientY; S.target.x=e.clientX; S.target.y=e.clientY; S.lastMoveTime=performance.now(); cursor.style.left=e.clientX+'px'; cursor.style.top=e.clientY+'px'; });
document.addEventListener('touchmove',e=>{const t=e.touches[0]; S.mouse.x=t.clientX; S.mouse.y=t.clientY; S.target.x=t.clientX; S.target.y=t.clientY;},{passive:true});
document.addEventListener('touchstart',e=>{const t=e.touches[0]; cursor.style.left=t.clientX+'px'; cursor.style.top=t.clientY+'px';});
document.addEventListener('mouseleave',()=>cursor.classList.add('hidden'));
document.addEventListener('mouseenter',()=>cursor.classList.remove('hidden'));

function h(e){ if(!e)return; e.addEventListener('mouseenter',()=>cursor.classList.add('hover')); e.addEventListener('mouseleave',()=>cursor.classList.remove('hover')); e.addEventListener('mousedown',()=>{cursor.classList.add('click');playClick(700)}); e.addEventListener('mouseup',()=>cursor.classList.remove('click')); e.addEventListener('click',()=>playClick(600)); }
document.querySelectorAll('a,button,.emotion-tag').forEach(h);

canvas.addEventListener('click',e=>{ if(!S.activated||S.transitioning||S.zoomed) return; S.transitioning=true; S.transitionStart=performance.now(); cursor.classList.add('click'); setTimeout(()=>cursor.classList.remove('click'),200); playClick(800); });
canvas.addEventListener('touchstart',e=>{ if(!S.activated||S.transitioning||S.zoomed) return; e.preventDefault(); S.transitioning=true; S.transitionStart=performance.now(); },{passive:false});
canvas.addEventListener('mousemove',e=>{ if(S.activated&&!S.transitioning&&!S.zoomed){ const d=Math.hypot(e.clientX-S.center.x,e.clientY-S.center.y); if(d<45) cursor.classList.add('hover'); else cursor.classList.remove('hover'); } });

exploreBtn.addEventListener('click',showSite); h(exploreBtn);

window.addEventListener('scroll',()=>{navbar.classList.toggle('scrolled',window.scrollY>60);});
navToggle.addEventListener('click',()=>{document.querySelector('.nav-links').classList.toggle('open');playClick(500);});
document.querySelectorAll('.nav-link').forEach(l=>{l.addEventListener('click',()=>document.querySelector('.nav-links')?.classList.remove('open'));});
document.getElementById('heroCTA').addEventListener('click',()=>{document.getElementById('features').scrollIntoView({behavior:'smooth'});playConnect();});
document.getElementById('heroLearn').addEventListener('click',()=>{document.getElementById('how-it-works').scrollIntoView({behavior:'smooth'});playConnect();});

const obs=new IntersectionObserver(e=>{e.forEach(e=>{if(e.isIntersecting)e.target.classList.add('visible')})},{threshold:0.1,rootMargin:'0px 0px -60px 0px'});
document.querySelectorAll('.feature-card,.step,.use-case,.tech-item').forEach(el=>{obs.observe(el); const d=parseInt(el.dataset.delay)||0; const m=el.classList.contains('feature-card')?0.08:el.classList.contains('tech-item')?0.06:el.classList.contains('step')?0.12:0.1; el.style.transitionDelay=(d*m)+'s';});

function trackEyes(c){ if(!c)return; const eyes=c.querySelectorAll('.eye,.mascot-eye,.mitchow-eye,.cta-eye'); c.addEventListener('mousemove',e=>{const r=c.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2,dx=e.clientX-cx,dy=e.clientY-cy,angle=Math.atan2(dy,dx),dist=Math.min(Math.hypot(dx,dy),14),mx=Math.cos(angle)*dist*0.15,my=Math.sin(angle)*dist*0.15; eyes.forEach(eye=>{eye.style.transform=`translate(${mx}px,${my}px)`})}); c.addEventListener('mouseleave',()=>{eyes.forEach(eye=>{eye.style.transform=''})}); }
trackEyes(mascot); trackEyes(heroMascot); trackEyes(ctaDot); if(mitchowDot) trackEyes(mitchowDot);

let lb=0;
setInterval(()=>{const n=Date.now(); if(n-lb<2500+Math.random()*4000) return; lb=n; document.querySelectorAll('.eye,.mascot-eye,.mitchow-eye,.cta-eye').forEach(e=>{e.classList.add('blink');setTimeout(()=>e.classList.remove('blink'),100)})},500);

document.querySelectorAll('.emotion-tag').forEach(t=>{t.addEventListener('click',()=>{document.querySelectorAll('.emotion-tag').forEach(t=>t.classList.remove('active')); t.classList.add('active'); mitchowDot.className='mitchow-dot'; if(t.dataset.emotion) mitchowDot.classList.add('emotion-'+t.dataset.emotion); playClick(500+Math.random()*400)})});

function init() { initAudio(); resize(); createParticles(); animate(); setTimeout(startActivation,2200); }
init();
