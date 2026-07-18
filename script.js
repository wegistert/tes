
// Переключатель тем: темная / белая
(function initThemeSwitcher() {
  const storageKey = 'teatr-theme';
  const metaTheme = document.querySelector('meta[name="theme-color"]');
  const buttons = document.querySelectorAll('.theme-toggle');

  function getSystemTheme() {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  }

  function applyTheme(theme) {
    const normalized = theme === 'light' ? 'light' : 'dark';
    document.body.dataset.theme = normalized;
    document.documentElement.dataset.theme = normalized;
    if (metaTheme) metaTheme.setAttribute('content', normalized === 'light' ? '#eaf7ff' : '#061a33');

    buttons.forEach((button) => {
      const icon = button.querySelector('.theme-toggle__icon');
      const text = button.querySelector('.theme-toggle__text');
      button.setAttribute('aria-label', normalized === 'light' ? 'Переключить темную тему' : 'Переключить светлую тему');
      button.setAttribute('aria-pressed', normalized === 'light' ? 'true' : 'false');
      if (icon) icon.textContent = normalized === 'light' ? '☀' : '☾';
      if (text) text.textContent = normalized === 'light' ? 'Белая' : 'Тёмная';
    });
  }

  const savedTheme = localStorage.getItem(storageKey);
  applyTheme(savedTheme || getSystemTheme());

  buttons.forEach((button) => {
    button.addEventListener('click', () => {
      const nextTheme = document.body.dataset.theme === 'light' ? 'dark' : 'light';
      localStorage.setItem(storageKey, nextTheme);
      applyTheme(nextTheme);
    });
  });
})();

// Меню
const menuBtn = document.querySelector('.menu-btn');
const nav = document.querySelector('.nav');
menuBtn?.addEventListener('click', () => nav.classList.toggle('open'));
nav?.querySelectorAll('a').forEach(a => a.addEventListener('click', () => nav.classList.remove('open')));

// Плавное появление блоков
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.14 });

document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

// Счетчики
const counters = document.querySelectorAll('[data-count]');
const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    const target = Number(el.dataset.count || 0);
    const duration = 1000;
    const start = performance.now();

    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.floor(target * eased) + (target >= 1000 ? '+' : '+');
      if (progress < 1) requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
    counterObserver.unobserve(el);
  });
}, { threshold: 0.6 });

counters.forEach(el => counterObserver.observe(el));

// Строгий параллакс телефона
const phoneWrap = document.querySelector('[data-parallax] .phone');
window.addEventListener('mousemove', (event) => {
  if (!phoneWrap || window.innerWidth < 900) return;
  const x = (event.clientX / window.innerWidth - 0.5) * 10;
  const y = (event.clientY / window.innerHeight - 0.5) * -10;
  phoneWrap.style.transform = `rotateY(${x}deg) rotateX(${y}deg)`;
});

// Синие "феи"/световые частицы от курсора, но в строгом стиле
const canvas = document.getElementById('cursorCanvas');
const ctx = canvas.getContext('2d');
let particles = [];
let lastSpawn = 0;

function resizeCanvas() {
  canvas.width = window.innerWidth * window.devicePixelRatio;
  canvas.height = window.innerHeight * window.devicePixelRatio;
  canvas.style.width = window.innerWidth + 'px';
  canvas.style.height = window.innerHeight + 'px';
  ctx.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

function spawnFairy(x, y) {
  const now = performance.now();
  if (now - lastSpawn < 16) return;
  lastSpawn = now;

  for (let i = 0; i < 2; i++) {
    particles.push({
      x,
      y,
      vx: (Math.random() - 0.5) * 1.4,
      vy: -Math.random() * 1.7 - 0.25,
      life: 1,
      size: Math.random() * 3.2 + 1.2,
      spin: Math.random() * Math.PI,
      kind: Math.random() > 0.78 ? 'mask' : 'spark'
    });
  }
}

window.addEventListener('mousemove', (e) => spawnFairy(e.clientX, e.clientY));
window.addEventListener('touchmove', (e) => {
  const t = e.touches[0];
  if (t) spawnFairy(t.clientX, t.clientY);
}, { passive: true });

function drawMaskParticle(p) {
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.rotate(p.spin);
  ctx.globalAlpha = Math.max(p.life, 0) * 0.7;
  ctx.strokeStyle = '#56ccf2';
  ctx.lineWidth = 1.1;
  ctx.beginPath();
  ctx.ellipse(0, 0, p.size * 2.2, p.size * 1.35, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(-p.size * .7, -p.size * .15, p.size * .22, 0, Math.PI * 2);
  ctx.arc(p.size * .7, -p.size * .15, p.size * .22, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

function drawSparkParticle(p, intense = false) {
  const glowSize = p.size * (intense ? 8 : 4);
  const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, glowSize);
  const hue = p.hue || 190;
  gradient.addColorStop(0, `hsla(${hue}, 100%, 72%, ${p.life})`);
  gradient.addColorStop(1, `hsla(${hue}, 100%, 55%, 0)`);
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(p.x, p.y, glowSize, 0, Math.PI * 2);
  ctx.fill();

  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.rotate(p.spin);
  ctx.globalAlpha = Math.max(p.life, 0);
  ctx.strokeStyle = `hsla(${hue}, 100%, 82%, ${p.life})`;
  ctx.lineWidth = intense ? 1.4 : 1;
  ctx.beginPath();
  ctx.moveTo(-p.size * 2.2, 0);
  ctx.lineTo(p.size * 2.2, 0);
  ctx.moveTo(0, -p.size * 2.2);
  ctx.lineTo(0, p.size * 2.2);
  ctx.stroke();
  ctx.restore();
}

function animateParticles() {
  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
  particles = particles.filter(p => p.life > 0.02);
  for (const p of particles) {
    p.x += p.vx;
    p.y += p.vy;
    p.vy += p.kind === 'firework' ? 0.055 : 0.018;
    p.life *= p.kind === 'firework' ? 0.948 : 0.965;
    p.spin += p.kind === 'firework' ? 0.08 : 0.015;

    if (p.kind === 'mask') {
      drawMaskParticle(p);
    } else if (p.kind === 'firework') {
      drawSparkParticle(p, true);
    } else {
      drawSparkParticle(p, false);
    }
  }
  requestAnimationFrame(animateParticles);
}
animateParticles();


// Живые счетчики: скачивания APK и клики по Газану
const ruNumber = new Intl.NumberFormat('ru-RU');

function readCounterNumber(el) {
  const raw = String(el?.textContent || '0').replace(/\D/g, '');
  return raw ? Number(raw) : 0;
}

function setCounterText(el, value) {
  const target = Number(value);
  if (!el || !Number.isFinite(target)) return;

  // Для публичного релиза не показываем "0" в блоках, где база ещё не заполнена/не подключена.
  if (target <= 0 && el.dataset.empty) {
    el.textContent = el.dataset.empty;
    el.classList.add('counter-empty');
    return;
  }

  el.classList.remove('counter-empty');
  el.textContent = ruNumber.format(target);
}

function animateCounterElement(el, toValue, duration = 900) {
  const target = Number(toValue);
  if (!el || !Number.isFinite(target)) return;

  if (target <= 0 && el.dataset.empty) {
    setCounterText(el, target);
    return;
  }

  const from = readCounterNumber(el);
  const start = performance.now();
  el.classList.add('counter-rolling');

  function frame(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const value = Math.round(from + (target - from) * eased);
    el.textContent = ruNumber.format(value);

    if (progress < 1) {
      requestAnimationFrame(frame);
    } else {
      setCounterText(el, target);
      el.classList.remove('counter-rolling');
      el.classList.add('counter-pop');
      setTimeout(() => el.classList.remove('counter-pop'), 360);
    }
  }

  requestAnimationFrame(frame);
}

function updateSiteCounters(counters, animated = true) {
  if (!counters) return;
  for (const [key, value] of Object.entries(counters)) {
    const el = document.querySelector(`[data-site-counter="${key}"]`);
    if (!el || !Number.isFinite(Number(value))) continue;
    if (animated) animateCounterElement(el, Number(value));
    else setCounterText(el, Number(value));
  }
}

// Лёгкая поочередная анимация карточек внутри блоков
document.querySelectorAll('.stats .stat-card, .features .feature, .journey-card, .faq-card, .screen-card, .tag-cloud span, .db-insight-card').forEach((el, index) => {
  el.style.setProperty('--item-delay', `${Math.min(index * 55, 420)}ms`);
  el.classList.add('animated-item');
});

// Автослайдер скриншотов: карточки подсвечиваются сами, а телефон на первом экране меняет экран.
(function initScreensAutoSlider() {
  const cards = Array.from(document.querySelectorAll('.screen-card'));
  const phoneImg = document.querySelector('.phone img');
  if (cards.length === 0) return;

  let index = Math.max(0, cards.findIndex(card => card.classList.contains('screen-current')));
  let timer = 0;
  let paused = false;

  function setActive(nextIndex, userAction = false) {
    index = (nextIndex + cards.length) % cards.length;

    cards.forEach((card, i) => {
      const active = i === index;
      card.classList.toggle('screen-current', active);
      card.classList.toggle('active', active);
      card.style.setProperty('--screen-active', active ? '1' : '0');
    });

    const img = cards[index].querySelector('img');
    if (phoneImg && img?.src) {
      phoneImg.classList.add('phone-screen-switching');
      window.setTimeout(() => {
        phoneImg.src = img.src;
        phoneImg.alt = img.alt || phoneImg.alt;
        phoneImg.classList.remove('phone-screen-switching');
      }, 130);
    }

    if (userAction) restart();
  }

  function tick() {
    if (!paused) setActive(index + 1);
  }

  function restart() {
    window.clearInterval(timer);
    timer = window.setInterval(tick, 3400);
  }

  cards.forEach((card, i) => {
    card.addEventListener('mouseenter', () => { paused = true; });
    card.addEventListener('mouseleave', () => { paused = false; });
    card.addEventListener('focusin', () => { paused = true; });
    card.addEventListener('focusout', () => { paused = false; });
    card.addEventListener('pointerdown', () => setActive(i, true), { passive: true });
  });

  setActive(index);
  restart();
})();

function trackSiteEvent(eventName, options = {}) {
  const body = new URLSearchParams({ action: eventName, event: eventName });

  if (options.beacon && navigator.sendBeacon) {
    const blob = new Blob([body.toString()], { type: 'application/x-www-form-urlencoded;charset=UTF-8' });
    navigator.sendBeacon('/api/track', blob);
    return Promise.resolve(null);
  }

  return fetch('/api/track', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
    body,
    keepalive: true,
    cache: 'no-store'
  })
    .then((response) => response.ok ? response.json() : null)
    .then((data) => {
      if (data?.counters) updateSiteCounters(data.counters);
      return data;
    })
    .catch(() => null);
}


function addDownloadFireworkFromElement(el) {
  const rect = el?.getBoundingClientRect?.();
  const cx = rect ? rect.left + rect.width / 2 : window.innerWidth * 0.5;
  const cy = rect ? rect.top + rect.height / 2 : window.innerHeight * 0.5;

  for (let burst = 0; burst < 3; burst++) {
    window.setTimeout(() => {
      const count = burst === 0 ? 58 : 34;
      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count + Math.random() * 0.42;
        const speed = 2.2 + Math.random() * 5.8;
        particles.push({
          x: cx + (Math.random() - 0.5) * ((rect?.width || 180) * 0.42),
          y: cy + (Math.random() - 0.5) * 24,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 1.7,
          life: 1,
          size: Math.random() * 4.2 + 1.4,
          spin: Math.random() * Math.PI,
          hue: [184, 192, 202, 210, 220][Math.floor(Math.random() * 5)],
          kind: 'firework'
        });
      }
    }, burst * 120);
  }

  el?.classList?.remove('download-burst');
  void el?.offsetWidth;
  el?.classList?.add('download-burst');
  window.setTimeout(() => el?.classList?.remove('download-burst'), 620);
}

for (const link of document.querySelectorAll('a[download], .js-track-download')) {
  link.addEventListener('click', () => {
    link.dataset.clicked = 'true';
    addDownloadFireworkFromElement(link);
    trackSiteEvent('download', { beacon: true });
  });
}


// Кнопка скачивания, которая появляется у низа страницы и плавно летит за курсором.
(function initCursorDownloadButton() {
  const button = document.querySelector('.cursor-download');
  if (!button) return;

  let mouseX = window.innerWidth - 150;
  let mouseY = window.innerHeight - 90;
  let currentX = mouseX;
  let currentY = mouseY;
  let isVisible = false;
  let raf = 0;

  function isNearPageBottom() {
    const scrollTop = window.scrollY || document.documentElement.scrollTop || 0;
    const viewport = window.innerHeight || document.documentElement.clientHeight || 0;
    const page = Math.max(
      document.body.scrollHeight,
      document.documentElement.scrollHeight
    );

    return scrollTop + viewport >= page - Math.max(360, viewport * 0.34);
  }

  function updateVisibility() {
    const shouldShow = isNearPageBottom();
    if (shouldShow === isVisible) return;

    isVisible = shouldShow;
    button.classList.toggle('visible', isVisible);

    if (isVisible) {
      currentX = mouseX;
      currentY = mouseY;
      if (!raf) raf = requestAnimationFrame(tick);
    }
  }

  function setMouse(x, y) {
    const rect = button.getBoundingClientRect();
    const halfW = Math.max(rect.width / 2, 90);
    const halfH = Math.max(rect.height / 2, 34);

    mouseX = Math.max(halfW + 12, Math.min(window.innerWidth - halfW - 12, x));
    mouseY = Math.max(halfH + 12, Math.min(window.innerHeight - halfH - 12, y));

    if (isVisible && !raf) raf = requestAnimationFrame(tick);
  }

  function tick() {
    raf = 0;

    if (!isVisible) return;

    currentX += (mouseX - currentX) * 0.12;
    currentY += (mouseY - currentY) * 0.12;

    button.style.transform = `translate3d(${currentX}px, ${currentY}px, 0) translate(-50%, -50%)`;

    if (Math.abs(mouseX - currentX) > 0.2 || Math.abs(mouseY - currentY) > 0.2) {
      raf = requestAnimationFrame(tick);
    }
  }

  window.addEventListener('mousemove', (event) => {
    if (window.matchMedia('(pointer: coarse)').matches) return;
    setMouse(event.clientX, event.clientY);
  }, { passive: true });

  window.addEventListener('scroll', updateVisibility, { passive: true });
  window.addEventListener('resize', () => {
    setMouse(mouseX, mouseY);
    updateVisibility();
  }, { passive: true });

  // Начальная позиция, если пользователь сразу оказался внизу.
  setMouse(window.innerWidth - 160, window.innerHeight - 86);
  updateVisibility();
})();

// Пасхалка Газан: нажми на маленькую почти незаметную фотку в блоке команды.
const gazanButton = document.querySelector('.easter-gazan');
const gazanStage = document.querySelector('.gazan-stage');
const gazanClose = document.querySelector('.gazan-close');
let gazanTimer = null;
let gazanDanceFireworkTimer = null;
let gazanIsActive = false;

// Музыка пасхалки. Положи файл сюда: assets/gazan.mp3
const gazanMusic = new Audio('assets/gazan.mp3');
gazanMusic.preload = 'auto';
gazanMusic.volume = 0.9;

let gazanAudioCtx = null;
let gazanAnalyser = null;
let gazanSource = null;
let gazanAudioData = null;
let gazanBeatRaf = 0;
let gazanLastBeat = 0;
let gazanEnergySmooth = 0;
let gazanGrooveTimer = 0;
let gazanMoveIndex = 0;

const GAZAN_ENTER_TIME = 1250;          // Газан долетает до центра
const GAZAN_EXIT_TIME = 1400;           // время ухода после конца трека
const GAZAN_FALLBACK_TRACK_TIME = 45000; // если браузер не прочитал длину mp3
const GAZAN_MAX_TRACK_TIME = 180000;     // защита: максимум 3 минуты


function initGazanAudioAnalyser() {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return false;

    if (!gazanAudioCtx) {
      gazanAudioCtx = new AudioContextClass();
    }

    if (!gazanAnalyser) {
      gazanAnalyser = gazanAudioCtx.createAnalyser();
      gazanAnalyser.fftSize = 512;
      gazanAnalyser.smoothingTimeConstant = 0.72;
      gazanAudioData = new Uint8Array(gazanAnalyser.frequencyBinCount);
    }

    if (!gazanSource) {
      gazanSource = gazanAudioCtx.createMediaElementSource(gazanMusic);
      gazanSource.connect(gazanAnalyser);
      gazanAnalyser.connect(gazanAudioCtx.destination);
    }

    if (gazanAudioCtx.state === 'suspended') {
      gazanAudioCtx.resume().catch(() => {});
    }

    return true;
  } catch (_) {
    return false;
  }
}

function averageAudioRange(data, from, to) {
  if (!data || data.length === 0) return 0;

  const start = Math.max(0, Math.min(data.length - 1, from));
  const end = Math.max(start + 1, Math.min(data.length, to));
  let sum = 0;

  for (let i = start; i < end; i++) sum += data[i];

  return sum / ((end - start) * 255);
}


function stopGazanGroove() {
  if (gazanGrooveTimer) {
    clearInterval(gazanGrooveTimer);
    gazanGrooveTimer = 0;
  }
}

function stopGazanBeatDance() {
  stopGazanGroove();

  if (gazanBeatRaf) {
    cancelAnimationFrame(gazanBeatRaf);
    gazanBeatRaf = 0;
  }

  gazanStage?.classList.remove('beat-dancing', 'gazan-step-left', 'gazan-step-right', 'gazan-step-jump');

  const flyer = gazanStage?.querySelector('.gazan-flyer');
  const img = gazanStage?.querySelector('.gazan-flyer img');

  if (window.gsap) {
    try {
      if (flyer) gsap.killTweensOf(flyer);
      if (img) gsap.killTweensOf(img);
      if (flyer) gsap.set(flyer, { clearProps: 'transform,filter' });
      if (img) gsap.set(img, { clearProps: 'transform,borderRadius' });
    } catch (_) {}
  }

  if (flyer) {
    flyer.style.transform = '';
    flyer.style.filter = '';
  }

  if (img) {
    img.style.transform = '';
  }
}

/*
  Танец без постоянной тряски:
  analyser только ловит сильный удар, а GSAP делает один понятный шаг.
*/
function gazanDoGsapMove(bass, mid, high, beatHit = false) {
  if (!window.gsap || !gazanStage) return false;

  const flyer = gazanStage.querySelector('.gazan-flyer');
  const img = gazanStage.querySelector('.gazan-flyer img');
  if (!flyer || !img) return false;

  const moves = [
    { x: -92, y: -18, r: -12, s: 1.06, dur: .34, name: 'left' },
    { x:  92, y: -18, r:  12, s: 1.06, dur: .34, name: 'right' },
    { x: -54, y: -76, r:   7, s: 1.14, dur: .30, name: 'jump' },
    { x:  54, y: -76, r:  -7, s: 1.14, dur: .30, name: 'jump' },
    { x: -112, y: 8,  r: -18, s: 1.03, dur: .38, name: 'left' },
    { x:  112, y: 8,  r:  18, s: 1.03, dur: .38, name: 'right' },
    { x: 0, y: -96, r: 0, s: 1.18, dur: .30, name: 'jump' },
    { x: 0, y: 0, r: 0, s: .98, dur: .22, name: 'down' },
  ];

  const pose = moves[gazanMoveIndex % moves.length];
  gazanMoveIndex += 1;

  gazanStage.classList.remove('gazan-step-left', 'gazan-step-right', 'gazan-step-jump');
  if (pose.name === 'left') gazanStage.classList.add('gazan-step-left');
  if (pose.name === 'right') gazanStage.classList.add('gazan-step-right');
  if (pose.name === 'jump') gazanStage.classList.add('gazan-step-jump');

  const power = Math.max(.72, Math.min(1.18, bass * 1.12 + .58));
  const x = pose.x * power;
  const y = pose.y * Math.max(.78, Math.min(1.18, bass * 1.1 + .55));
  const rotate = pose.r + (mid - .35) * 8;
  const scale = pose.s + bass * .06;
  const glow = 26 + Math.round(Math.max(bass, high) * 34);

  gsap.killTweensOf(flyer);
  gsap.killTweensOf(img);

  const tl = gsap.timeline({ defaults: { overwrite: true } });

  tl.to(flyer, {
    duration: pose.dur,
    x,
    y,
    rotation: rotate,
    scale,
    ease: 'power3.out',
    filter: `drop-shadow(0 24px 34px rgba(0,0,0,.34)) drop-shadow(0 0 ${glow}px rgba(97,232,255,.48)) saturate(${1.04 + high * .18})`,
  }, 0)
  .to(img, {
    duration: pose.dur * .72,
    rotation: -rotate * .24,
    scaleX: pose.name === 'jump' ? 0.96 : 1.04,
    scaleY: pose.name === 'jump' ? 1.08 : 0.98,
    ease: 'power2.out',
  }, 0)
  .to(flyer, {
    duration: .26,
    x: 0,
    y: 0,
    rotation: 0,
    scale: 1,
    ease: 'sine.inOut',
  }, pose.dur * .88)
  .to(img, {
    duration: .20,
    rotation: 0,
    scaleX: 1,
    scaleY: 1,
    ease: 'sine.inOut',
  }, pose.dur * .88);

  return true;
}

function startGazanIdleGroove() {
  stopGazanGroove();

  if (!window.gsap || !gazanStage) return;

  const flyer = gazanStage.querySelector('.gazan-flyer');
  const img = gazanStage.querySelector('.gazan-flyer img');
  if (!flyer || !img) return;

  gazanGrooveTimer = setInterval(() => {
    if (!gazanIsActive || !gazanStage.classList.contains('dancing')) return;

    const dir = gazanMoveIndex % 2 === 0 ? -1 : 1;

    gsap.to(flyer, {
      duration: .42,
      x: dir * 16,
      y: -8,
      rotation: dir * 3,
      scale: 1.015,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: 1,
      overwrite: 'auto'
    });

    gsap.to(img, {
      duration: .42,
      rotation: dir * -1.8,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: 1,
      overwrite: 'auto'
    });
  }, 760);
}

function startGazanBeatDance() {
  if (!gazanStage || !gazanAnalyser || !gazanAudioData) return false;

  const flyer = gazanStage.querySelector('.gazan-flyer');
  if (!flyer) return false;

  gazanStage.classList.add('beat-dancing');
  startGazanIdleGroove();

  function frame(now) {
    if (!gazanIsActive || !gazanStage.classList.contains('dancing')) {
      stopGazanBeatDance();
      return;
    }

    gazanAnalyser.getByteFrequencyData(gazanAudioData);

    const bass = averageAudioRange(gazanAudioData, 1, 14);
    const lowMid = averageAudioRange(gazanAudioData, 14, 34);
    const mid = averageAudioRange(gazanAudioData, 34, 92);
    const high = averageAudioRange(gazanAudioData, 92, 190);
    const energy = bass * 0.62 + lowMid * 0.22 + mid * 0.12 + high * 0.04;

    gazanEnergySmooth = gazanEnergySmooth * 0.86 + energy * 0.14;

    const threshold = Math.max(0.30, gazanEnergySmooth * 1.42);
    const beatHit = bass > threshold && now - gazanLastBeat > 330;

    if (beatHit) {
      gazanLastBeat = now;
      const moved = gazanDoGsapMove(bass, mid, high, true);

      addGazanFirework(
        window.innerWidth * (0.42 + Math.random() * 0.16),
        window.innerHeight * (0.34 + Math.random() * 0.20),
        12 + Math.round(bass * 18)
      );

      if (!moved) {
        const side = (gazanMoveIndex++ % 2 === 0 ? -1 : 1) * 58;
        flyer.style.transform = `translate(-50%, -50%) translate(${side}px, -32px) rotate(${side > 0 ? 10 : -10}deg) scale(1.05)`;
        setTimeout(() => { flyer.style.transform = ''; }, 280);
      }
    }

    gazanBeatRaf = requestAnimationFrame(frame);
  }

  gazanBeatRaf = requestAnimationFrame(frame);
  return true;
}


function stopGazanMusic(reset = true) {
  stopGazanBeatDance();
  try {
    gazanMusic.pause();
    if (reset) gazanMusic.currentTime = 0;
  } catch (_) {}
}

function playGazanMusicFromStart() {
  try {
    initGazanAudioAnalyser();
    gazanMusic.pause();
    gazanMusic.currentTime = 0;
    const playPromise = gazanMusic.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(() => {
        // Если браузер всё равно заблокировал звук, повторная попытка будет после старта танца.
      });
    }
  } catch (_) {}
}

function addGazanFirework(cx = window.innerWidth * 0.5, cy = window.innerHeight * 0.48, count = 46) {
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count + Math.random() * 0.35;
    const speed = 1.7 + Math.random() * 4.7;
    particles.push({
      x: cx + (Math.random() - 0.5) * 40,
      y: cy + (Math.random() - 0.5) * 34,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 1.2,
      life: 1,
      size: Math.random() * 3.6 + 1.2,
      spin: Math.random() * Math.PI,
      hue: [188, 198, 210, 178, 220][Math.floor(Math.random() * 5)],
      kind: 'firework'
    });
  }
}

function finishGazan() {
  if (!gazanStage || !gazanIsActive) return;

  gazanIsActive = false;
  clearTimeout(gazanTimer);
  clearInterval(gazanDanceFireworkTimer);
  stopGazanBeatDance();
  stopGazanMusic();

  gazanStage.classList.remove('entering', 'dancing');
  gazanStage.classList.add('leaving');
  addGazanFirework(window.innerWidth * 0.52, window.innerHeight * 0.45, 70);

  gazanTimer = setTimeout(() => {
    gazanStage.classList.remove('active', 'leaving');
  }, GAZAN_EXIT_TIME + 150);
}

function closeGazan() {
  if (!gazanStage) return;
  if (gazanIsActive || gazanStage.classList.contains('active')) {
    finishGazan();
    return;
  }
  gazanStage.classList.remove('active', 'entering', 'dancing', 'leaving');
}

function startGazanTrackAndDance() {
  if (!gazanStage || !gazanIsActive) return;

  gazanStage.classList.remove('entering');
  gazanStage.classList.add('dancing');

  initGazanAudioAnalyser();
  stopGazanBeatDance();
  startGazanBeatDance();

  addGazanFirework(window.innerWidth * 0.5, window.innerHeight * 0.48, 95);
  clearInterval(gazanDanceFireworkTimer);
  gazanDanceFireworkTimer = setInterval(() => {
    if (!gazanIsActive) return;
    addGazanFirework(
      window.innerWidth * (0.38 + Math.random() * 0.24),
      window.innerHeight * (0.30 + Math.random() * 0.34),
      34
    );
  }, 1600);

  if (gazanMusic.paused) {
    try {
      const playPromise = gazanMusic.play();
      if (playPromise && typeof playPromise.catch === 'function') playPromise.catch(() => {});
    } catch (_) {}
  }

  clearTimeout(gazanTimer);
  const durationMs = Number.isFinite(gazanMusic.duration) && gazanMusic.duration > 1
    ? Math.min(gazanMusic.duration * 1000, GAZAN_MAX_TRACK_TIME)
    : GAZAN_FALLBACK_TRACK_TIME;

  gazanTimer = setTimeout(finishGazan, durationMs + 250);
}

function launchGazan() {
  if (!gazanStage || gazanIsActive) return;

  trackSiteEvent('gazan')?.then((data) => {
    if (data?.counters) updateSiteCounters(data.counters);
  });

  gazanIsActive = true;
  clearTimeout(gazanTimer);
  clearInterval(gazanDanceFireworkTimer);
  stopGazanMusic();
  playGazanMusicFromStart();

  gazanStage.classList.remove('active', 'entering', 'dancing', 'leaving');
  void gazanStage.offsetWidth;
  gazanStage.classList.add('active', 'entering');

  addGazanFirework(window.innerWidth * 0.50, window.innerHeight * 0.62, 55);

  const runDance = () => {
    if (!gazanIsActive) return;
    startGazanTrackAndDance();
  };

  gazanTimer = setTimeout(runDance, GAZAN_ENTER_TIME);
}

gazanMusic.addEventListener('ended', finishGazan);
gazanButton?.addEventListener('click', launchGazan);
gazanClose?.addEventListener('click', closeGazan);

// Доп. секрет: быстро набери на клавиатуре GAZAN.
let gazanCode = '';
window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    closeGazan();
    return;
  }

  gazanCode = (gazanCode + event.key.toLowerCase()).slice(-5);
  if (gazanCode === 'gazan') launchGazan();
  if (gazanCode === 'газан') launchGazan();
});

// #top фикс: гарантированно поднимает страницу вверх даже с fixed header
(function initTopAnchorFix() {
  function goTop(event) {
    const href = this.getAttribute('href') || '';
    if (href === '#top' || href === '/#top') {
      event.preventDefault();
      history.replaceState(null, '', location.pathname + location.search);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }
  document.querySelectorAll('a[href="#top"], a[href="/#top"]').forEach((link) => {
    link.addEventListener('click', goTop);
  });
  if (location.hash === '#top') {
    setTimeout(() => { document.documentElement.scrollTop = 0; document.body.scrollTop = 0; window.scrollTo({ top: 0, behavior: 'auto' }); }, 0);
  }
})();

// Просмотр скриншотов приложения: анимация + листание
(function initScreenLightbox() {
  const modal = document.querySelector('.screen-lightbox');
  const modalImg = modal?.querySelector('img');
  const closeBtn = modal?.querySelector('.screen-lightbox__close');
  const prevBtn = modal?.querySelector('.screen-lightbox__prev');
  const nextBtn = modal?.querySelector('.screen-lightbox__next');
  const caption = modal?.querySelector('.screen-lightbox__caption');
  const buttons = Array.from(document.querySelectorAll('.screen-open'));
  if (!modal || !modalImg || !closeBtn || !prevBtn || !nextBtn || !caption || buttons.length === 0) return;

  const screens = buttons.map((button) => {
    const img = button.querySelector('img');
    const card = button.closest('.screen-card');
    const title = card?.querySelector('figcaption')?.childNodes?.[0]?.textContent?.trim() || img?.alt || 'Скриншот';
    return {
      src: button.dataset.full || img?.src || '',
      alt: img?.alt || 'Скриншот приложения',
      title
    };
  });

  let currentIndex = 0;
  let touchStartX = 0;
  let modalCleanupTimer = 0;
  let modalIntroTimer = 0;

  function clearModalTimers() {
    window.clearTimeout(modalCleanupTimer);
    window.clearTimeout(modalIntroTimer);
  }

  function setSwitchDirection(direction) {
    modal.classList.remove('switch-left', 'switch-right');
    if (direction === 'prev') modal.classList.add('switch-left');
    if (direction === 'next') modal.classList.add('switch-right');
  }

  function clearSwitchDirection() {
    modal.classList.remove('switch-left', 'switch-right');
  }

  function render(index, animated = true, direction = 'next') {
    currentIndex = (index + screens.length) % screens.length;
    const item = screens[currentIndex];

    if (animated) {
      setSwitchDirection(direction);
      modal.classList.add('switching');
    } else {
      clearSwitchDirection();
      modal.classList.remove('switching');
    }

    window.setTimeout(() => {
      modalImg.src = item.src;
      modalImg.alt = item.alt;
      caption.textContent = `${item.title} • ${currentIndex + 1}/${screens.length}`;
      modal.classList.remove('switching');
      window.setTimeout(clearSwitchDirection, 180);
    }, animated ? 145 : 0);
  }

  function open(index, opener = null) {
    clearModalTimers();

    if (opener) {
      const rect = opener.getBoundingClientRect();
      const fromX = rect.left + rect.width / 2 - window.innerWidth / 2;
      const fromY = rect.top + rect.height / 2 - window.innerHeight / 2;
      const scale = Math.max(0.18, Math.min(0.62, rect.width / Math.max(window.innerWidth * 0.52, 1)));

      modal.style.setProperty('--from-x', `${fromX}px`);
      modal.style.setProperty('--from-y', `${fromY}px`);
      modal.style.setProperty('--from-scale', String(scale));
    } else {
      modal.style.setProperty('--from-x', '0px');
      modal.style.setProperty('--from-y', '22px');
      modal.style.setProperty('--from-scale', '.86');
    }

    render(index, false);
    modal.classList.remove('closing', 'switching');
    clearSwitchDirection();
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('no-scroll');

    window.requestAnimationFrame(() => {
      modal.classList.add('opening');
    });

    modalIntroTimer = window.setTimeout(() => {
      modal.classList.remove('opening');
    }, 460);
  }

  function close() {
    if (!modal.classList.contains('open') || modal.classList.contains('closing')) return;

    clearModalTimers();
    modal.classList.remove('opening', 'switching');
    clearSwitchDirection();
    modal.classList.add('closing');
    modal.setAttribute('aria-hidden', 'true');

    modalCleanupTimer = window.setTimeout(() => {
      modal.classList.remove('open', 'closing');
      document.body.classList.remove('no-scroll');
      modalImg.src = '';
    }, 320);
  }

  function next() { render(currentIndex + 1, true, 'next'); }
  function prev() { render(currentIndex - 1, true, 'prev'); }

  buttons.forEach((button, index) => {
    button.addEventListener('click', () => open(index, button));
  });

  closeBtn.addEventListener('click', close);
  nextBtn.addEventListener('click', next);
  prevBtn.addEventListener('click', prev);

  modal.addEventListener('click', (event) => {
    if (event.target === modal) close();
  });

  modal.addEventListener('touchstart', (event) => {
    touchStartX = event.touches[0]?.clientX || 0;
  }, { passive: true });

  modal.addEventListener('touchend', (event) => {
    const endX = event.changedTouches[0]?.clientX || 0;
    const delta = endX - touchStartX;
    if (Math.abs(delta) > 55) {
      delta < 0 ? next() : prev();
    }
  }, { passive: true });

  window.addEventListener('keydown', (event) => {
    if (!modal.classList.contains('open')) return;
    if (event.key === 'Escape') close();
    if (event.key === 'ArrowRight') next();
    if (event.key === 'ArrowLeft') prev();
  });
})();


function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (ch) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  }[ch]));
}

function formatSessionDate(date) {
  if (!date) return '';
  try {
    return new Intl.DateTimeFormat('ru-RU', { day: '2-digit', month: 'short' }).format(new Date(date + 'T00:00:00'));
  } catch (_) {
    return date;
  }
}

function renderHighlightsList(key, items) {
  const root = document.querySelector(`[data-highlights-list="${key}"]`);
  if (!root) return;

  const list = Array.isArray(items) ? items : [];
  if (list.length === 0) {
    root.innerHTML = '<div class="database-empty">Данные появятся здесь после заполнения расписания в приложении.</div>';
    return;
  }

  if (key === 'nearest_sessions') {
    root.innerHTML = list.map((item, i) => `
      <div class="database-row" style="--item-delay:${i * 65}ms">
        <div class="database-row__date">
          <b>${escapeHtml(formatSessionDate(item.date))}</b>
          <span>${escapeHtml(item.time || '—')}</span>
        </div>
        <div class="database-row__body">
          <strong>${escapeHtml(item.title)}</strong>
          <p>${escapeHtml([item.theater, item.hall, item.genre].filter(Boolean).join(' · ') || 'Сеанс из приложения')}</p>
        </div>
        ${item.price ? `<em>${escapeHtml(item.price)} ₽</em>` : ''}
      </div>
    `).join('');
    return;
  }

  if (key === 'latest_reviews') {
    root.innerHTML = list.map((item, i) => {
      const rating = Math.max(0, Math.min(5, Number(item.rating) || 0));
      const stars = '★'.repeat(rating) + '☆'.repeat(5 - rating);
      return `
        <article class="review-card" style="--item-delay:${i * 65}ms">
          <div class="review-card__top">
            <strong>${escapeHtml(item.play)}</strong>
            <div class="database-stars" aria-label="Оценка ${rating} из 5">${stars}</div>
          </div>
          <p>${escapeHtml(item.comment || 'Отзыв без текста')}</p>
          <small>${escapeHtml(item.user || 'Зритель')}</small>
        </article>
      `;
    }).join('');
    return;
  }

  if (key === 'popular_plays') {
    root.innerHTML = list.map((item, i) => `
      <div class="database-play-card" style="--item-delay:${i * 65}ms">
        <span>${escapeHtml(item.genre || 'Афиша')}</span>
        <strong>${escapeHtml(item.title)}</strong>
        <p>${escapeHtml([item.age, item.duration ? item.duration + ' мин' : ''].filter(Boolean).join(' · '))}</p>
      </div>
    `).join('');
  }
}

async function loadDatabaseHighlights() {
  try {
    const res = await fetch('/api/highlights?t=' + Date.now(), {
      headers: { 'Accept': 'application/json' },
      cache: 'no-store'
    });

    if (!res.ok) return;

    const data = await res.json();
    if (!data.ok || !data.highlights) return;

    renderHighlightsList('nearest_sessions', data.highlights.nearest_sessions);
    renderHighlightsList('latest_reviews', data.highlights.latest_reviews);
    renderHighlightsList('popular_plays', data.highlights.popular_plays);
  } catch (e) {
    console.warn('Highlights load failed', e);
  }
}

async function loadRealCounters() {
  try {
    const res = await fetch('/api/counters?fresh=1&t=' + Date.now(), {
      headers: { 'Accept': 'application/json' }
    });

    if (!res.ok) return;

    const data = await res.json();
    if (!data.ok || !data.counters) return;

    const counters = data.counters;

    document.querySelectorAll('[data-site-counter]').forEach((el) => {
      const key = el.dataset.siteCounter;

      if (Object.prototype.hasOwnProperty.call(counters, key)) {
        animateCounterElement(el, counters[key], 1100);
      }
    });
  } catch (e) {
    console.warn('Counters load failed', e);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  loadRealCounters();
  loadDatabaseHighlights();
});

// === Пасхалка Никиты Сергеевича: вводим loginoff / куратор / логиннс / никитос ===
(function initNikitaEasterEgg() {
  const egg = document.getElementById('nikitaEgg');
  if (!egg) return;

  const secretWords = ['никита сервеевич', 'никита сергеевич', 'loginoff', 'куратор', 'логиннс', 'никитос'];
  const floatLayer = document.getElementById('nikitaFloat');
  const canvas = document.getElementById('nikitaFireworks');
  const ctx = canvas?.getContext('2d');
  const slides = Array.from(egg.querySelectorAll('.nikita-egg__slide'));
  const audio = document.getElementById('nikitaAudio');
  let typedBuffer = '';
  let slideIndex = 0;
  let slideTimer = 0;
  let heartTimer = 0;
  let fireworkTimer = 0;
  let raf = 0;
  let sparks = [];

  function normalize(value) {
    return String(value || '')
      .toLowerCase()
      .replace(/ё/g, 'е')
      .replace(/[.,!?:;"'`~()[\]{}<>]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function hasSecretExact(value) {
    const normalized = normalize(value);
    return secretWords.includes(normalized);
  }

  function hasSecretTyped(value) {
    const normalized = normalize(value);
    return secretWords.some((word) => normalized.endsWith(word));
  }

  function setSlide(nextIndex) {
    if (!slides.length) return;
    slides.forEach((slide, index) => slide.classList.toggle('is-active', index === nextIndex));
  }

  function startSlides() {
    window.clearInterval(slideTimer);
    slideIndex = 0;
    setSlide(slideIndex);
    slideTimer = window.setInterval(() => {
      slideIndex = (slideIndex + 1) % slides.length;
      setSlide(slideIndex);
    }, 2600);
  }

  function createHeart() {
    if (!floatLayer) return;
    const heart = document.createElement('span');
    heart.className = 'nikita-heart-pop';
    const variants = ['💖', '💘', '💕', '💋', '💗', '❤️'];
    heart.textContent = variants[Math.floor(Math.random() * variants.length)];
    heart.style.left = Math.random() * 100 + 'vw';
    heart.style.fontSize = 18 + Math.random() * 34 + 'px';
    heart.style.animationDuration = 3.6 + Math.random() * 4.6 + 's';
    heart.style.setProperty('--drift', (Math.random() * 180 - 90) + 'px');
    floatLayer.appendChild(heart);
    window.setTimeout(() => heart.remove(), 9000);
  }

  function resizeFireworks() {
    if (!canvas || !ctx) return;
    const ratio = Math.max(1, window.devicePixelRatio || 1);
    canvas.width = Math.floor(window.innerWidth * ratio);
    canvas.height = Math.floor(window.innerHeight * ratio);
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  }

  function burst(x, y) {
    if (!ctx) return;
    const count = 56 + Math.floor(Math.random() * 40);
    const palette = [330, 342, 354, 12, 28, 46, 300, 285];
    for (let i = 0; i < count; i++) {
      const a = Math.PI * 2 * (i / count) + Math.random() * .18;
      const s = 1.6 + Math.random() * 5.4;
      sparks.push({
        x, y,
        vx: Math.cos(a) * s,
        vy: Math.sin(a) * s,
        life: 1,
        decay: .014 + Math.random() * .012,
        size: 1.5 + Math.random() * 2.8,
        hue: palette[Math.floor(Math.random() * palette.length)]
      });
    }
  }

  function renderFireworks() {
    if (!ctx || !canvas || !egg.classList.contains('is-open')) return;
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    sparks = sparks.filter((p) => p.life > 0.02);
    for (const p of sparks) {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.03;
      p.vx *= .993;
      p.life -= p.decay;
      ctx.beginPath();
      ctx.fillStyle = `hsla(${p.hue}, 100%, 68%, ${Math.max(p.life, 0)})`;
      ctx.shadowBlur = 16;
      ctx.shadowColor = `hsla(${p.hue}, 100%, 70%, .95)`;
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
    raf = requestAnimationFrame(renderFireworks);
  }

  function startFireworks() {
    resizeFireworks();
    window.clearInterval(fireworkTimer);
    sparks = [];
    burst(window.innerWidth * .16, window.innerHeight * .22);
    burst(window.innerWidth * .34, window.innerHeight * .14);
    burst(window.innerWidth * .50, window.innerHeight * .16);
    burst(window.innerWidth * .66, window.innerHeight * .14);
    burst(window.innerWidth * .84, window.innerHeight * .22);
    fireworkTimer = window.setInterval(() => {
      burst(window.innerWidth * (.14 + Math.random() * .72), window.innerHeight * (.10 + Math.random() * .36));
    }, 620);
    cancelAnimationFrame(raf);
    renderFireworks();
  }

  function openEgg() {
    typedBuffer = '';
    if (egg.classList.contains('is-open')) return;
    egg.classList.add('is-open');
    egg.setAttribute('aria-hidden', 'false');
    document.body.classList.add('nikita-egg-lock');
    startSlides();
    startFireworks();
    window.clearInterval(heartTimer);
    for (let i = 0; i < 24; i++) window.setTimeout(createHeart, i * 60);
    heartTimer = window.setInterval(createHeart, 150);
    if (audio) {
      try {
        audio.currentTime = 0;
        const playPromise = audio.play();
        if (playPromise && typeof playPromise.catch === 'function') playPromise.catch(() => {});
      } catch (e) {}
    }
  }

  function closeEgg() {
    typedBuffer = '';
    egg.classList.remove('is-open');
    egg.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('nikita-egg-lock');
    window.clearInterval(slideTimer);
    window.clearInterval(heartTimer);
    window.clearInterval(fireworkTimer);
    cancelAnimationFrame(raf);
    sparks = [];
    if (ctx) ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    if (floatLayer) floatLayer.innerHTML = '';
    if (audio) {
      try {
        audio.pause();
        audio.currentTime = 0;
      } catch (e) {}
    }
  }

  egg.querySelectorAll('[data-nikita-close]').forEach((button) => button.addEventListener('click', closeEgg));
  if (audio) audio.addEventListener('ended', closeEgg);
  window.addEventListener('resize', resizeFireworks);

  document.addEventListener('input', (event) => {
    const target = event.target;
    if (target && ('value' in target) && hasSecretExact(target.value)) openEgg();
  }, true);

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeEgg();
      return;
    }
    if (event.ctrlKey || event.altKey || event.metaKey || event.key.length !== 1) return;
    typedBuffer = normalize((typedBuffer + event.key).slice(-80));
    if (hasSecretTyped(typedBuffer)) openEgg();
  });

  // Можно открыть и ссылкой: /?nikita=loginoff или /#loginoff
  const params = new URLSearchParams(window.location.search);
  if (hasSecretExact(params.get('nikita')) || hasSecretExact(decodeURIComponent(window.location.hash.slice(1)))) {
    window.setTimeout(openEgg, 700);
  }
})();
