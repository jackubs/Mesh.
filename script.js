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

const LABELS = [
  'Network Connection', 'Smart AI Signal',
  'Real-time Linking', 'Data Flow'
];

const S = {
  mouse: { x: window.innerWidth / 2, y: window.innerHeight / 2 },
  center: { x: window.innerWidth / 2, y: window.innerHeight / 2 },
  target: { x: window.innerWidth / 2, y: window.innerHeight / 2 },
  lastMoveTime: 0,
  activating: false,
  activated: false,
  activationStart: 0,
  transitioning: false,
  transitionStart: 0,
  zoomed: false,
  particles: [],
  stars: [],
  nodes: [],
  connections: [],
  flowParticles: [],
  hoverIdx: -1,
  explored: false,
  soundReady: false,
  audioCtx: null,
};

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  if (!S.activated && !S.activating) {
    S.center.x = window.innerWidth / 2;
    S.center.y = window.innerHeight / 2;
    S.target.x = window.innerWidth / 2;
    S.target.y = window.innerHeight / 2;
  }
  createStars();
  if (S.activated || S.zoomed) initNodes();
}
window.addEventListener('resize', resize);

// ===== AUDIO =====
function initAudio() {
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    S.audioCtx = new AC();
    S.soundReady = true;

    const masterGain = S.audioCtx.createGain();
    masterGain.gain.value = 0.035;
    masterGain.connect(S.audioCtx.destination);

    const osc1 = S.audioCtx.createOscillator();
    osc1.type = 'sine'; osc1.frequency.value = 55;
    const g1 = S.audioCtx.createGain(); g1.gain.value = 0.3;
    osc1.connect(g1); g1.connect(masterGain); osc1.start();

    const osc2 = S.audioCtx.createOscillator();
    osc2.type = 'sine'; osc2.frequency.value = 65;
    const g2 = S.audioCtx.createGain(); g2.gain.value = 0.2;
    osc2.connect(g2); g2.connect(masterGain); osc2.start();

    const lfo = S.audioCtx.createOscillator();
    lfo.type = 'sine'; lfo.frequency.value = 0.2;
    const lfoGain = S.audioCtx.createGain(); lfoGain.gain.value = 0.02;
    lfo.connect(lfoGain); lfoGain.connect(g1.gain); lfo.start();

    const filter = S.audioCtx.createBiquadFilter();
    filter.type = 'lowpass'; filter.frequency.value = 200; filter.Q.value = 1;
    const ns = S.audioCtx.createOscillator();
    ns.type = 'sawtooth'; ns.frequency.value = 40;
    const ng = S.audioCtx.createGain(); ng.gain.value = 0.015;
    ns.connect(ng); ng.connect(filter); filter.connect(masterGain); ns.start();

    S.audioCtx._master = masterGain;

    function resume() {
      if (S.audioCtx && S.audioCtx.state === 'suspended') S.audioCtx.resume();
      document.removeEventListener('click', resume);
      document.removeEventListener('touchstart', resume);
    }
    document.addEventListener('click', resume);
    document.addEventListener('touchstart', resume);
  } catch(e) { /* no audio */ }
}

function playClick(p) {
  if (!S.soundReady) return;
  try {
    const osc = S.audioCtx.createOscillator();
    const g = S.audioCtx.createGain();
    osc.type = 'sine'; osc.frequency.value = p || 600;
    g.gain.setValueAtTime(0.05, S.audioCtx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, S.audioCtx.currentTime + 0.08);
    osc.connect(g); g.connect(S.audioCtx._master || S.audioCtx.destination);
    osc.start(); osc.stop(S.audioCtx.currentTime + 0.08);
  } catch(e) {}
}

function playConnect() {
  if (!S.soundReady) return;
  try {
    const t = S.audioCtx.currentTime;
    const osc = S.audioCtx.createOscillator();
    const g = S.audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(300, t);
    osc.frequency.exponentialRampToValueAtTime(600, t + 0.15);
    g.gain.setValueAtTime(0.07, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
    osc.connect(g); g.connect(S.audioCtx._master || S.audioCtx.destination);
    osc.start(t); osc.stop(t + 0.2);
  } catch(e) {}
}

function playActivate() {
  if (!S.soundReady) return;
  try {
    const t = S.audioCtx.currentTime;
    [200,300,500,800].forEach((f,i) => {
      const osc = S.audioCtx.createOscillator();
      const g = S.audioCtx.createGain();
      osc.type = 'sine'; osc.frequency.value = f;
      g.gain.setValueAtTime(0.04, t + i * 0.1);
      g.gain.exponentialRampToValueAtTime(0.001, t + i * 0.1 + 0.3);
      osc.connect(g); g.connect(S.audioCtx._master || S.audioCtx.destination);
      osc.start(t + i * 0.1); osc.stop(t + i * 0.1 + 0.3);
    });
  } catch(e) {}
}

// ===== STARS =====
function createStars() {
  S.stars = [];
  for (let i = 0; i < 200; i++) {
    S.stars.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      s: Math.random() * 1.0 + 0.3,
      o: Math.random() * 0.1 + 0.02,
    });
  }
}

// ===== ORBIT PARTICLES =====
function createParticles() {
  S.particles = [];
  for (let i = 0; i < 35; i++) {
    const radius = 70 + Math.random() * 180;
    const speed = (0.0006 + Math.random() * 0.005) * (i % 2 === 0 ? 1 : -1);
    S.particles.push({
      a: Math.random() * Math.PI * 2,
      r: radius, s: speed, size: 1.5 + Math.random() * 2.5,
      li: i % LABELS.length,
      o: 0.35 + Math.random() * 0.45,
      x: 0, y: 0, orb: false, bp: 0,
    });
  }
}

// ===== MESH NODES =====
function initNodes() {
  if (S.zoomed) return;
  S.nodes = [];
  const count = 8 + Math.floor(Math.random() * 5);
  const cx = canvas.width / 2;
  const cy = canvas.height / 2;
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2 + Math.random() * 0.3;
    const radius = 120 + Math.random() * 180;
    S.nodes.push({
      x: cx + Math.cos(angle) * radius,
      y: cy + Math.sin(angle) * radius,
      targetX: cx + Math.cos(angle) * radius,
      targetY: cy + Math.sin(angle) * radius,
      vx: 0, vy: 0,
      size: 1.8 + Math.random() * 2.5,
      pulse: Math.random() * Math.PI * 2,
      speed: 0.0006 + Math.random() * 0.002,
      angle, radius,
    });
  }
}

function initFlowParticles() {
  S.flowParticles = [];
  for (let i = 0; i < 15; i++) {
    const from = Math.floor(Math.random() * S.nodes.length);
    let to = Math.floor(Math.random() * S.nodes.length);
    if (to === from) to = (to + 1) % S.nodes.length;
    S.flowParticles.push({ from, to, progress: Math.random(), speed: 0.002 + Math.random() * 0.006, size: 1.2 + Math.random() * 1.5 });
  }
}

// ===== UPDATE =====
function updateCenter(time) {
  if (S.transitioning || S.zoomed) return;
  const e = 0.05;
  if (time - S.lastMoveTime > 4000) {
    const dx = window.innerWidth / 2 - S.target.x;
    const dy = window.innerHeight / 2 - S.target.y;
    if (Math.hypot(dx, dy) > 1) {
      S.target.x += dx * 0.008;
      S.target.y += dy * 0.008;
    }
  }
  S.center.x += (S.target.x - S.center.x) * e;
  S.center.y += (S.target.y - S.center.y) * e;
}

function updateParticles(time) {
  if (S.explored) return;
  const cx = S.center.x;
  const cy = S.center.y;

  for (const p of S.particles) {
    if (S.activating && !S.activated) {
      const elapsed = time - S.activationStart;
      const progress = Math.min(elapsed / 1600, 1);
      if (progress > 0.2) {
        const bp = Math.min((progress - 0.2) / 0.8, 1);
        const ease = 1 - Math.pow(1 - bp, 3);
        const tx = cx + Math.cos(p.a) * p.r;
        const ty = cy + Math.sin(p.a) * p.r;
        p.x = cx + (tx - cx) * ease;
        p.y = cy + (ty - cy) * ease;
        p.bp = bp;
      }
      if (progress >= 1) {
        p.orb = true;
        p.x = cx + Math.cos(p.a) * p.r;
        p.y = cy + Math.sin(p.a) * p.r;
        S.activating = false;
        S.activated = true;
        S.target.x = window.innerWidth / 2;
        S.target.y = window.innerHeight / 2;
      }
      continue;
    }

    if (S.transitioning || S.zoomed) {
      if (S.transitioning) {
        const elapsed = time - S.transitionStart;
        const progress = Math.min(elapsed / 1200, 1);
        const cp = Math.min(progress * 1.5, 1);
        const ease = 1 - Math.pow(1 - cp, 2);
        p.x = cx + (p.x - cx) * (1 - ease);
        p.y = cy + (p.y - cy) * (1 - ease);
      }
      continue;
    }

    if (!p.orb) { p.x = cx; p.y = cy; continue; }
    p.a += p.s;
    p.x = cx + Math.cos(p.a) * p.r;
    p.y = cy + Math.sin(p.a) * p.r;
  }
}

function updateMeshNodes(time) {
  if (!S.activated || S.transitioning || S.zoomed) return;
  if (!S.explored) return; // only run mesh after exploring
  const cx = canvas.width / 2;
  const cy = canvas.height / 2;
  const scrollY = window.scrollY || 0;

  for (let i = 0; i < S.nodes.length; i++) {
    const n = S.nodes[i];
    const driftAngle = n.angle + Math.sin(time * n.speed + i) * 0.3;
    const driftRadius = n.radius + Math.sin(time * 0.0005 + i * 2) * 20;
    n.targetX = cx + Math.cos(driftAngle) * driftRadius + scrollY * 0.02;
    n.targetY = cy + Math.sin(driftAngle) * driftRadius + scrollY * 0.02;
    n.vx += (n.targetX - n.x) * 0.02;
    n.vy += (n.targetY - n.y) * 0.02;
    n.vx *= 0.94; n.vy *= 0.94;
    n.x += n.vx; n.y += n.vy;
    n.pulse += 0.015;
  }

  S.connections = [];
  for (let i = 0; i < S.nodes.length; i++) {
    for (let j = i + 1; j < S.nodes.length; j++) {
      const a = S.nodes[i], b = S.nodes[j];
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      if (dist < 250) S.connections.push({ a, b, alpha: 1 - dist / 250 });
    }
  }

  for (const p of S.flowParticles) {
    p.progress += p.speed;
    if (p.progress > 1) {
      p.progress = 0; p.from = p.to;
      p.to = Math.floor(Math.random() * S.nodes.length);
    }
  }
  if (S.flowParticles.length < S.nodes.length && Math.random() < 0.02) initFlowParticles();
}

// ===== DRAW =====
function draw(time) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const grad = ctx.createRadialGradient(canvas.width/2, canvas.height/2, 0, canvas.width/2, canvas.height/2, canvas.width*0.7);
  grad.addColorStop(0, '#080a16'); grad.addColorStop(0.5, '#06070e'); grad.addColorStop(1, '#030306');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (const star of S.stars) {
    ctx.fillStyle = `rgba(255,255,255,${star.o})`;
    ctx.beginPath(); ctx.arc(star.x, star.y, star.s, 0, Math.PI*2); ctx.fill();
  }

  const cx = S.center.x;
  const cy = S.center.y;

  // Draw mesh network (only after exploring)
  if (S.explored) {
    const scrollY = window.scrollY || 0;
    const scrollCx = canvas.width / 2;
    const scrollCy = canvas.height / 2;

    for (const c of S.connections) {
      const pulse = 0.3 + 0.7 * (0.5 + 0.5 * Math.sin(time * 0.002 + c.a.x));
      const alpha = c.alpha * 0.06 * pulse;
      ctx.strokeStyle = `rgba(0,229,255,${alpha})`;
      ctx.lineWidth = 0.5;
      ctx.beginPath(); ctx.moveTo(c.a.x, c.a.y); ctx.lineTo(c.b.x, c.b.y); ctx.stroke();

      const pp = (time * 0.0003 + c.a.x * 0.01) % 1;
      const px = c.a.x + (c.b.x - c.a.x) * pp;
      const py = c.a.y + (c.b.y - c.a.y) * pp;
      ctx.fillStyle = `rgba(0,229,255,${0.2 * (1 - Math.abs(pp - 0.5) * 2)})`;
      ctx.beginPath(); ctx.arc(px, py, 1.5, 0, Math.PI*2); ctx.fill();
    }

    for (const n of S.nodes) {
      const p = 0.5 + 0.5 * Math.sin(n.pulse);
      const r = n.size * (1 + p * 0.2);
      const grd = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, r*4);
      grd.addColorStop(0, `rgba(0,229,255,${0.04 * p})`);
      grd.addColorStop(1, 'rgba(0,229,255,0)');
      ctx.fillStyle = grd;
      ctx.beginPath(); ctx.arc(n.x, n.y, r*4, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = `rgba(0,229,255,${0.2 + p * 0.15})`;
      ctx.beginPath(); ctx.arc(n.x, n.y, r, 0, Math.PI*2); ctx.fill();
    }

    for (const p of S.flowParticles) {
      const fn = S.nodes[p.from], tn = S.nodes[p.to];
      if (fn && tn) {
        const x = fn.x + (tn.x - fn.x) * p.progress;
        const y = fn.y + (tn.y - fn.y) * p.progress;
        ctx.fillStyle = `rgba(0,229,255,${0.3 * (1 - Math.abs(p.progress - 0.5) * 2)})`;
        ctx.beginPath(); ctx.arc(x, y, p.size, 0, Math.PI*2); ctx.fill();
      }
    }

    const hubGrd = ctx.createRadialGradient(scrollCx, scrollCy + scrollY * 0.02, 0, scrollCx, scrollCy + scrollY * 0.02, 60);
    hubGrd.addColorStop(0, `rgba(0,229,255,${0.03 + 0.02 * Math.sin(time * 0.001)})`);
    hubGrd.addColorStop(0.5, `rgba(0,229,255,${0.01})`);
    hubGrd.addColorStop(1, 'rgba(0,229,255,0)');
    ctx.fillStyle = hubGrd;
    ctx.beginPath(); ctx.arc(scrollCx, scrollCy + scrollY * 0.02, 60, 0, Math.PI*2); ctx.fill();
  }

  // Draw orbit particles
  // Draw orbit particles (only before exploring)
  const showParticles = (S.activating || S.activated) && !S.explored;

  if (showParticles && !S.zoomed) {
    for (let i = 0; i < S.particles.length; i++) {
      for (let j = i + 1; j < S.particles.length; j++) {
        const a = S.particles[i], b = S.particles[j];
        if ((!a.orb && a.bp < 0.3) || (!b.orb && b.bp < 0.3)) continue;
        const dist = Math.hypot(a.x - b.x, a.y - b.y);
        if (dist < 160 && dist > 5) {
          ctx.strokeStyle = `rgba(0,229,255,${(1-dist/160)*0.05})`;
          ctx.lineWidth = 0.4;
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        }
      }
    }

    for (const p of S.particles) {
      if ((p.orb || p.bp > 0) && !S.zoomed) {
        const dist = Math.hypot(p.x - cx, p.y - cy);
        if (dist > 8) {
          ctx.strokeStyle = `rgba(0,229,255,${0.04 + 0.06 * (1 - Math.min(dist/300, 1))})`;
          ctx.lineWidth = 0.4;
          ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(p.x, p.y); ctx.stroke();
        }
      }
    }

    for (const p of S.particles) {
      if ((p.orb || p.bp > 0) && !S.zoomed) {
        ctx.save();
        ctx.shadowColor = 'rgba(0,229,255,0.2)';
        ctx.shadowBlur = 5;
        ctx.fillStyle = `rgba(0,229,255,${p.o})`;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI*2); ctx.fill();
        ctx.restore();
      }
    }
  }

  // Draw center dot
  // Draw center dot (only before exploring)
  if (!S.zoomed && !S.explored) {
    let dotScale = 1, glowScale = 1;

    if (S.activating && !S.activated) {
      const elapsed = time - S.activationStart;
      const progress = Math.min(elapsed / 1600, 1);
      const peak = 0.3;
      if (progress < peak) dotScale = 1 + (progress/peak)*2;
      else dotScale = 3 - ((progress - peak)/(1-peak))*2;
      glowScale = 1 + progress * 4;
    }

    if (S.transitioning) {
      const elapsed = time - S.transitionStart;
      const progress = Math.min(elapsed / 1200, 1);
      dotScale = 1 + progress * 8;
      glowScale = 1 + progress * 6;
      const flashRise = Math.max(0, Math.min(1, (progress-0.25)/0.3));
      const flashFall = Math.max(0, Math.min(1, (progress-0.55)/0.45));
      flash.style.opacity = progress > 0.55 ? 1 - flashFall : flashRise;
      if (progress >= 1) {
        S.zoomed = true; S.transitioning = false;
        showWelcome();
      }
    }

    const pulseFactor = 1 + 0.12 * Math.sin(time * 0.0025);
    const r = 6 * dotScale * pulseFactor;
    const gr = (45 + 20 * Math.sin(time * 0.002)) * glowScale;
    const clickable = S.activated && !S.transitioning;

    // Outer ring pulse when clickable
    if (clickable) {
      const ringPulse = 0.5 + 0.5 * Math.sin(time * 0.003);
      ctx.strokeStyle = `rgba(0,229,255,${0.06 * ringPulse})`;
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 8]);
      ctx.beginPath();
      ctx.arc(cx, cy, 28 + ringPulse * 8, 0, Math.PI*2);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    const gg = ctx.createRadialGradient(cx, cy, 0, cx, cy, gr*2.5);
    gg.addColorStop(0, `rgba(0,229,255,${0.15*glowScale})`);
    gg.addColorStop(0.3, `rgba(0,229,255,${0.05*glowScale})`);
    gg.addColorStop(1, 'rgba(0,229,255,0)');
    ctx.fillStyle = gg;
    ctx.beginPath(); ctx.arc(cx, cy, gr*2.5, 0, Math.PI*2); ctx.fill();

    ctx.save();
    ctx.shadowColor = 'rgba(0,229,255,0.5)';
    ctx.shadowBlur = gr;
    ctx.fillStyle = '#00e5ff';
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI*2); ctx.fill();
    ctx.restore();

    ctx.fillStyle = '#00e5ff';
    ctx.beginPath(); ctx.arc(cx, cy, r*0.55, 0, Math.PI*2); ctx.fill();

    ctx.fillStyle = 'rgba(255,255,255,0.15)';
    ctx.beginPath(); ctx.arc(cx - r*0.25, cy - r*0.25, r*0.2, 0, Math.PI*2); ctx.fill();
  }
}

// ===== ANIMATION LOOP =====
function animate(timestamp) {
  const time = timestamp || performance.now();
  updateCenter(time);
  updateParticles(time);
  updateMeshNodes(time);
  draw(time);
  requestAnimationFrame(animate);
}

// ===== START ACTIVATION =====
function startActivation() {
  loading.style.opacity = '0';
  setTimeout(() => { loading.style.display = 'none'; }, 600);
  S.activating = true;
  S.activationStart = performance.now();
  playActivate();
}

// ===== WELCOME =====
function showWelcome() {
  canvas.style.opacity = '0';
  welcome.classList.add('visible');
  playConnect();
}

function showSite() {
  welcome.classList.remove('visible');
  welcome.style.display = 'none';
  S.zoomed = false;
  S.explored = true;
  siteContent.classList.add('visible');
  canvas.style.opacity = '1';
  initNodes();
  initFlowParticles();
}

// ===== CURSOR =====
document.addEventListener('mousemove', (e) => {
  S.mouse.x = e.clientX; S.mouse.y = e.clientY;
  S.target.x = e.clientX; S.target.y = e.clientY;
  S.lastMoveTime = performance.now();
  cursor.style.left = e.clientX + 'px';
  cursor.style.top = e.clientY + 'px';
});
document.addEventListener('touchmove', (e) => {
  const t = e.touches[0];
  S.mouse.x = t.clientX; S.mouse.y = t.clientY;
  S.target.x = t.clientX; S.target.y = t.clientY;
}, { passive: true });
document.addEventListener('touchstart', (e) => {
  const t = e.touches[0];
  cursor.style.left = t.clientX + 'px';
  cursor.style.top = t.clientY + 'px';
});
document.addEventListener('mouseleave', () => cursor.classList.add('hidden'));
document.addEventListener('mouseenter', () => cursor.classList.remove('hidden'));

function trackHover(el) {
  if (!el) return;
  el.addEventListener('mouseenter', () => cursor.classList.add('hover'));
  el.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
  el.addEventListener('mousedown', () => { cursor.classList.add('click'); playClick(700); });
  el.addEventListener('mouseup', () => cursor.classList.remove('click'));
  el.addEventListener('click', () => playClick(600));
}
document.querySelectorAll('a, button, .emotion-tag').forEach(trackHover);

// ===== CLICK CENTER DOT =====
canvas.addEventListener('click', (e) => {
  if (!S.activated || S.transitioning || S.zoomed) return;
  S.transitioning = true;
  S.transitionStart = performance.now();
  cursor.classList.add('click');
  setTimeout(() => cursor.classList.remove('click'), 200);
  playClick(800);
});
canvas.addEventListener('touchstart', (e) => {
  if (!S.activated || S.transitioning || S.zoomed) return;
  e.preventDefault();
  S.transitioning = true;
  S.transitionStart = performance.now();
}, { passive: false });

canvas.addEventListener('mousemove', (e) => {
  if (S.activated && !S.transitioning && !S.zoomed) {
    const d = Math.hypot(e.clientX - S.center.x, e.clientY - S.center.y);
    if (d < 45) cursor.classList.add('hover');
    else cursor.classList.remove('hover');
  }
});

// ===== EXPLORE BUTTON =====
exploreBtn.addEventListener('click', showSite);
trackHover(exploreBtn);

// ===== NAV =====
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 60);
});

navToggle.addEventListener('click', () => {
  document.querySelector('.nav-links').classList.toggle('open');
  playClick(500);
});
document.querySelectorAll('.nav-link').forEach(l => {
  l.addEventListener('click', () => document.querySelector('.nav-links')?.classList.remove('open'));
});

document.getElementById('heroCTA').addEventListener('click', () => {
  document.getElementById('features').scrollIntoView({ behavior: 'smooth' });
  playConnect();
});
document.getElementById('heroLearn').addEventListener('click', () => {
  document.getElementById('how-it-works').scrollIntoView({ behavior: 'smooth' });
  playConnect();
});

// ===== SCROLL ANIMATIONS =====
const observer = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });
document.querySelectorAll('.feature-card, .step, .use-case, .tech-item').forEach(el => observer.observe(el));

document.querySelectorAll('.feature-card, .tech-item, .step, .use-case').forEach(el => {
  const d = parseInt(el.dataset.delay) || 0;
  const m = el.classList.contains('feature-card') ? 0.08 : el.classList.contains('tech-item') ? 0.06 : el.classList.contains('step') ? 0.12 : 0.1;
  el.style.transitionDelay = (d * m) + 's';
});

// ===== EYE TRACKING =====
function trackEyes(container) {
  if (!container) return;
  const eyes = container.querySelectorAll('.eye, .mascot-eye, .mitchow-eye, .cta-eye');
  container.addEventListener('mousemove', (e) => {
    const rect = container.getBoundingClientRect();
    const cx = rect.left + rect.width/2, cy = rect.top + rect.height/2;
    const dx = e.clientX - cx, dy = e.clientY - cy;
    const angle = Math.atan2(dy, dx);
    const dist = Math.min(Math.hypot(dx, dy), 14);
    const mx = Math.cos(angle)*dist*0.15, my = Math.sin(angle)*dist*0.15;
    eyes.forEach(eye => { eye.style.transform = `translate(${mx}px,${my}px)`; });
  });
  container.addEventListener('mouseleave', () => { eyes.forEach(eye => { eye.style.transform = ''; }); });
}
trackEyes(mascot);
trackEyes(heroMascot);
trackEyes(ctaDot);
if (mitchowDot) trackEyes(mitchowDot);

// ===== BLINK =====
let lastBlink = 0;
function blinkAll() {
  const now = Date.now();
  if (now - lastBlink < 2500 + Math.random() * 4000) return;
  lastBlink = now;
  document.querySelectorAll('.eye, .mascot-eye, .mitchow-eye, .cta-eye').forEach(e => {
    e.classList.add('blink');
    setTimeout(() => e.classList.remove('blink'), 100);
  });
}
setInterval(blinkAll, 500);

// ===== MITCHOW EMOTIONS =====
document.querySelectorAll('.emotion-tag').forEach(tag => {
  tag.addEventListener('click', () => {
    document.querySelectorAll('.emotion-tag').forEach(t => t.classList.remove('active'));
    tag.classList.add('active');
    mitchowDot.className = 'mitchow-dot';
    if (tag.dataset.emotion) mitchowDot.classList.add('emotion-' + tag.dataset.emotion);
    playClick(500 + Math.random() * 400);
  });
});

// ===== INIT =====
function init() {
  initAudio();
  resize();
  createParticles();
  animate();
  setTimeout(startActivation, 2200);
}

init();
