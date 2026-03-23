/* ============================================================
   WIPCO – about.js
   Full scroll animation: pinned decades, parallax, staggered
   ============================================================ */

/* ===== NAVBAR ===== */
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 20);
}, { passive: true });

/* ===== HAMBURGER ===== */
const hamburger = document.getElementById('hamburger');
const mobileNav = document.getElementById('mobileNav');
hamburger.addEventListener('click', () => {
  mobileNav.classList.toggle('open');
  hamburger.querySelectorAll('span').forEach((s, i) => {
    s.style.transform = mobileNav.classList.contains('open')
      ? (i === 0 ? 'rotate(45deg) translate(5px,5px)' : i === 1 ? 'scaleX(0)' : 'rotate(-45deg) translate(5px,-5px)')
      : '';
    s.style.opacity = mobileNav.classList.contains('open') && i === 1 ? '0' : '';
  });
});
mobileNav.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => {
    mobileNav.classList.remove('open');
    hamburger.querySelectorAll('span').forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
  });
});

/* ===== GLOBAL FADE-UP ===== */
const fadeObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('visible'); fadeObserver.unobserve(e.target); }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
document.querySelectorAll('.fade-up').forEach(el => fadeObserver.observe(el));

/* =======================================================
   DECADES — SMOOTH OVERLAY SCROLL (no image effects)
*/
const pinWrap = document.getElementById('decadesPinWrap');
const stage = document.getElementById('decadesStage');
const dCards = document.querySelectorAll('#decadesTrack .decades-card');
const dDots = document.querySelectorAll('#decadesDots .dp');
const CARD_COUNT = dCards.length;

const SCROLL_PER_CARD = () => window.innerHeight * 1.0;

function setDecadesWrapHeight() {
  if (!pinWrap || !stage) return;
  const extra = Math.max(0, CARD_COUNT - 1) * SCROLL_PER_CARD();
  pinWrap.style.height = `${stage.offsetHeight + extra}px`;
}

function applyDecadesProgress(baseIdx, phase) {
  const incomingIdx = Math.min(baseIdx + 1, CARD_COUNT - 1);
  // Smoothstep easing for softer overlay motion.
  const eased = phase * phase * (3 - 2 * phase);

  dCards.forEach((card, i) => {
    let y = 100;
    let z = 0;
    let opacity = 0;

    if (i === 0) {
      // First card stays fixed; acts like sticky base card.
      y = 0;
      opacity = 1;
      z = 1;
    } else if (i === incomingIdx && baseIdx < CARD_COUNT - 1) {
      // Second card overlays upward on top of first card.
      y = 100 - (100 * eased);
      opacity = 1;
      z = 2;
    } else if (i < baseIdx) {
      y = 0;
      opacity = 1;
      z = 2;
    }

    card.style.transform = `translateY(${y}%)`;
    card.style.opacity = `${opacity}`;
    card.style.zIndex = `${z}`;
    card.classList.toggle('dc-active', i === 0 || (i === incomingIdx && phase >= 0.5));
    card.classList.toggle('dc-exit', false);
  });

  const dotIdx = baseIdx >= 1 ? 1 : (phase >= 0.5 && baseIdx < CARD_COUNT - 1 ? incomingIdx : 0);
  dDots.forEach((d, i) => d.classList.toggle('active', i === dotIdx));
}

function onDecadesScroll() {
  if (!pinWrap || !CARD_COUNT) return;
  const rect = pinWrap.getBoundingClientRect();
  const scrolledIntoPin = Math.max(0, -rect.top);
  const maxPhase = Math.max(0, CARD_COUNT - 1);
  const raw = scrolledIntoPin / SCROLL_PER_CARD();
  const clamped = Math.min(raw, maxPhase);
  const baseIdx = Math.min(Math.floor(clamped), CARD_COUNT - 1);
  const phase = baseIdx === CARD_COUNT - 1 ? 0 : clamped - baseIdx;

  applyDecadesProgress(baseIdx, phase);
}

dDots.forEach((dot, idx) => {
  dot.addEventListener('click', () => {
    if (!pinWrap) return;
    const targetY = window.scrollY + pinWrap.getBoundingClientRect().top + (idx * SCROLL_PER_CARD());
    window.scrollTo({ top: targetY, behavior: 'smooth' });
  });
});

if (pinWrap && CARD_COUNT) {
  setDecadesWrapHeight();
  window.addEventListener('resize', () => { setDecadesWrapHeight(); onDecadesScroll(); }, { passive: true });
  window.addEventListener('scroll', onDecadesScroll, { passive: true });
  onDecadesScroll();
}

/* =======================================================
   WHAT WE DO — STAGGERED CARD REVEAL
   Cards slide up + fade in one by one (100ms stagger each)
*/
const wwdCards = document.querySelectorAll('.wwd-card');

const wwdObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      // Trigger each card with increasing delay
      wwdCards.forEach((card, i) => {
        setTimeout(() => card.classList.add('wwd-visible'), i * 130);
      });
      wwdObserver.disconnect();
    }
  });
}, { threshold: 0.15 });

const wwdGrid = document.querySelector('.wwd-grid');
if (wwdGrid) wwdObserver.observe(wwdGrid);

/* =======================================================
   COMMITMENT — 4-FRAME IMAGE + COLOUR CYCLE
*/
const CYCLE_COLORS = ['red', 'yellow', 'green', 'blue'];
const FRAME_IDS    = ['cfRed', 'cfYellow', 'cfGreen', 'cfCyan'];
const CYCLE_MS     = 2000;

const commitSection  = document.getElementById('commitment');
const allCommitItems = document.querySelectorAll('.commitment-item');

function activateCommit(idx) {
  const colorName = CYCLE_COLORS[idx];
  allCommitItems.forEach(item => {
    if (item.dataset.color === colorName) item.setAttribute('data-active', 'true');
    else item.removeAttribute('data-active');
  });
  FRAME_IDS.forEach((id, i) => {
    const el = document.getElementById(id);
    if (el) el.classList.toggle('cf-active', i === idx);
  });
}

let colorIdx = 0, cycleTimer = null;

function startCommitCycle() {
  if (cycleTimer) return;
  activateCommit(colorIdx);
  cycleTimer = setInterval(() => {
    colorIdx = (colorIdx + 1) % CYCLE_COLORS.length;
    activateCommit(colorIdx);
  }, CYCLE_MS);
}

const commitObs = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) startCommitCycle(); });
}, { threshold: 0.2 });
if (commitSection) {
  commitObs.observe(commitSection);
  // Fallback: if section is already in view at load, start slider immediately.
  if (commitSection.getBoundingClientRect().top < window.innerHeight * 0.9) {
    startCommitCycle();
  }
}

/* ===== CLIENTS — STAGGERED FADE-IN ===== */
const clientItems = document.querySelectorAll('.client-item');
const clientsGrid = document.getElementById('clientsGrid');

const clientObs = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      clientItems.forEach((item, i) => {
        setTimeout(() => item.classList.add('visible'), parseInt(item.dataset.delay) || i * 80);
      });
      clientObs.disconnect();
    }
  });
}, { threshold: 0.1 });
if (clientsGrid) clientObs.observe(clientsGrid);

/* ===== SMOOTH ANCHOR SCROLL ===== */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - 88, behavior: 'smooth' });
  });
});

/* ===== HERO PARALLAX ===== */
const heroBgImg = document.querySelector('.about-hero-img');
if (heroBgImg) {
  window.addEventListener('scroll', () => {
    const sy = window.scrollY;
    if (sy < window.innerHeight) heroBgImg.style.transform = `translateY(${sy * 0.25}px)`;
  }, { passive: true });
}
