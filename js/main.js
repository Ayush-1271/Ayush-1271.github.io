/**
 * Portfolio Animation Engine v2
 * Smooth scroll · Parallax · Text reveals · Cursor · 3D cards
 */

/* ═══════════════════════════════════
   SCROLL PROGRESS BAR
═══════════════════════════════════ */
const progressBar = document.createElement('div');
progressBar.id = 'scroll-progress';
progressBar.style.cssText = `
  position: fixed; top: 0; left: 0; z-index: 9999;
  height: 2px; width: 0%; background: linear-gradient(90deg, #7c75f5, #26d4e8, #3bdc8f);
  transition: width 0.1s linear; pointer-events: none;
`;
document.body.appendChild(progressBar);

/* ═══════════════════════════════════
   NAV + SCROLL VARS
═══════════════════════════════════ */
const nav = document.querySelector('.nav');
let lastScroll = 0;
let ticking = false;

function onScroll() {
  if (!ticking) {
    requestAnimationFrame(() => {
      const sy = window.scrollY;
      const max = document.body.scrollHeight - window.innerHeight;
      const pct = max > 0 ? (sy / max) * 100 : 0;

      progressBar.style.width = pct + '%';

      // Nav
      if (sy > 40) nav.classList.add('scrolled');
      else nav.classList.remove('scrolled');

      // Gradient background shift — CSS var
      document.documentElement.style.setProperty('--sp', (sy / max).toFixed(4));

      // Active nav link
      document.querySelectorAll('section[id]').forEach(s => {
        if (sy >= s.offsetTop - 120 && sy < s.offsetTop + s.offsetHeight - 120) {
          document.querySelectorAll('.nav-links a').forEach(a => {
            a.classList.toggle('active', a.getAttribute('href') === `#${s.id}`);
          });
        }
      });

      // Parallax hero elements — clamp opacity so it never goes below 0
      const heroContent = document.querySelector('.hero-content');
      if (heroContent && sy < window.innerHeight) {
        heroContent.style.transform = `translateY(${sy * 0.25}px)`;
        heroContent.style.opacity = Math.max(0, 1 - (sy / (window.innerHeight * 0.75)));
      } else if (heroContent && sy >= window.innerHeight) {
        heroContent.style.opacity = '0';
      }

      lastScroll = sy;
      ticking = false;
    });
    ticking = true;
  }
}
window.addEventListener('scroll', onScroll, { passive: true });

/* ═══════════════════════════════════
   CURSOR GLOW
═══════════════════════════════════ */
const glow = document.createElement('div');
glow.className = 'cursor-glow';
document.body.appendChild(glow);

const dot = document.createElement('div');
dot.style.cssText = `
  width: 8px; height: 8px; border-radius: 50%;
  background: rgba(124,117,245,0.8);
  position: fixed; pointer-events: none; z-index: 10000;
  transform: translate(-50%,-50%);
  transition: transform 0.1s, opacity 0.3s;
`;
document.body.appendChild(dot);

let mx = 0, my = 0, gx = 0, gy = 0, dx = 0, dy = 0;
// Hide cursor effects on touch/mobile (pointless + expensive)
const isTouch = window.matchMedia('(hover:none)').matches;
if (isTouch) { glow.style.display = 'none'; dot.style.display = 'none'; }

document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });

if (!isTouch) {
  document.querySelectorAll('a, button, .project-card, .skill-card').forEach(el => {
    el.addEventListener('mouseenter', () => {
      dot.style.transform = 'translate(-50%,-50%) scale(2.5)';
      dot.style.background = 'rgba(124,117,245,0.35)';
    });
    el.addEventListener('mouseleave', () => {
      dot.style.transform = 'translate(-50%,-50%) scale(1)';
      dot.style.background = 'rgba(124,117,245,0.75)';
    });
  });

  (function cursorLoop() {
    gx += (mx - gx) * 0.06;
    gy += (my - gy) * 0.06;
    dx += (mx - dx) * 0.18;
    dy += (my - dy) * 0.18;
    glow.style.left = gx + 'px';
    glow.style.top  = gy + 'px';
    dot.style.left  = dx + 'px';
    dot.style.top   = dy + 'px';
    requestAnimationFrame(cursorLoop);
  })();
}

/* ═══════════════════════════════════
   INTERSECTION OBSERVER — REVEALS
═══════════════════════════════════ */
const revealObs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      revealObs.unobserve(e.target);
    }
  });
}, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

/* Observe ALL reveal variants — reveal-left/right/scale/curtain all need .visible */
document.querySelectorAll(
  '.reveal, .reveal-left, .reveal-right, .reveal-scale, .reveal-curtain'
).forEach(el => revealObs.observe(el));

// Staggered children
document.querySelectorAll('.stagger-children').forEach(parent => {
  [...parent.children].forEach((child, i) => {
    child.style.transitionDelay = `${i * 0.1}s`;
    child.classList.add('reveal');
    revealObs.observe(child);
  });
});

/* ═══════════════════════════════════
   TEXT SCRAMBLE REVEAL
═══════════════════════════════════ */
class TextScramble {
  constructor(el) {
    this.el = el;
    this.chars = '!<>-_\\/[]{}—=+*^?#abcdefghijklmnopqrstuvwxyz';
    this.update = this.update.bind(this);
  }
  setText(newText) {
    const old = this.el.innerText;
    const len = Math.max(old.length, newText.length);
    const promise = new Promise(r => this.resolve = r);
    this.queue = [];
    for (let i = 0; i < len; i++) {
      const from = old[i] || '';
      const to = newText[i] || '';
      const start = Math.floor(Math.random() * 10);
      const end = start + Math.floor(Math.random() * 15);
      this.queue.push({ from, to, start, end });
    }
    cancelAnimationFrame(this.frameReq);
    this.frame = 0;
    this.update();
    return promise;
  }
  update() {
    let output = '';
    let complete = 0;
    for (const { from, to, start, end } of this.queue) {
      if (this.frame >= end) {
        complete++;
        output += to;
      } else if (this.frame >= start) {
        output += `<span class="scramble-char" style="color:var(--accent);opacity:0.5">${this.chars[Math.floor(Math.random() * this.chars.length)]}</span>`;
      } else {
        output += from;
      }
    }
    this.el.innerHTML = output;
    if (complete < this.queue.length) {
      this.frameReq = requestAnimationFrame(this.update);
      this.frame++;
    } else {
      this.resolve();
    }
  }
}

// Scramble headings when they enter viewport
const scrambleObs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting && !e.target.dataset.scrambled) {
      e.target.dataset.scrambled = '1';
      const original = e.target.dataset.text || e.target.textContent;
      const fx = new TextScramble(e.target);
      fx.setText(original);
      scrambleObs.unobserve(e.target);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('[data-scramble]').forEach(el => {
  el.dataset.text = el.textContent;
  scrambleObs.observe(el);
});

/* ═══════════════════════════════════
   COUNTER ANIMATION
═══════════════════════════════════ */
function animateCounter(el, target, suffix = '') {
  const dur = 1800;
  const start = performance.now();
  const isFloat = target % 1 !== 0;
  const update = now => {
    const t = Math.min((now - start) / dur, 1);
    const ease = 1 - Math.pow(1 - t, 4);
    const val = target * ease;
    el.textContent = (isFloat ? val.toFixed(2) : Math.floor(val)) + suffix;
    if (t < 1) requestAnimationFrame(update);
    else el.textContent = (isFloat ? target.toFixed(2) : target) + suffix;
  };
  requestAnimationFrame(update);
}

const counterObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      animateCounter(e.target, parseFloat(e.target.dataset.count), e.target.dataset.suffix || '');
      counterObs.unobserve(e.target);
    }
  });
}, { threshold: 0.6 });

document.querySelectorAll('[data-count]').forEach(el => counterObs.observe(el));

/* ═══════════════════════════════════
   3D CARD TILT
═══════════════════════════════════ */
document.querySelectorAll('.tilt-card').forEach(card => {
  const inner = card.querySelector('.tilt-inner') || card;
  card.addEventListener('mousemove', e => {
    const r = card.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    inner.style.transform = `perspective(600px) rotateY(${x * 12}deg) rotateX(${-y * 8}deg) translateZ(8px)`;
    card.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100) + '%');
    card.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100) + '%');
  });
  card.addEventListener('mouseleave', () => {
    inner.style.transform = '';
    inner.style.transition = 'transform 0.6s cubic-bezier(0.23,1,0.32,1)';
    setTimeout(() => inner.style.transition = '', 600);
  });
});

/* ═══════════════════════════════════
   EXPERIENCE TIMELINE DRAW
═══════════════════════════════════ */
const expObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) e.target.classList.add('visible');
  });
}, { threshold: 0.15 });
document.querySelectorAll('.exp-item').forEach(el => expObs.observe(el));

/* ═══════════════════════════════════
   MOBILE NAV TOGGLE
═══════════════════════════════════ */
const hamburger = document.querySelector('.nav-hamburger');
const navMenu = document.querySelector('.nav-links');
if (hamburger && navMenu) {
  hamburger.addEventListener('click', () => {
    const open = hamburger.classList.toggle('open');
    navMenu.classList.toggle('mobile-open', open);
  });
  navMenu.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      hamburger.classList.remove('open');
      navMenu.classList.remove('mobile-open');
    });
  });
}

/* ═══════════════════════════════════
   HORIZONTAL PROJECT SCROLL
═══════════════════════════════════ */
/* H-scroll: only bind from main.js if the page hasn't set data-hscroll-bound
   (index.html manages its own h-scroll inline to avoid double-binding) */
const hScroll = document.querySelector('.h-scroll-track');
if (hScroll && !hScroll.dataset.hscrollBound) {
  hScroll.dataset.hscrollBound = '1';
  const container = hScroll.closest('.h-scroll-container');

  // Wheel → horizontal scroll on desktop
  container.addEventListener('wheel', e => {
    if (window.innerWidth > 900) {
      e.preventDefault();
      hScroll.scrollLeft += e.deltaY * 1.2;
    }
  }, { passive: false });

  // Drag scroll
  let isDragging = false, startX, scrollStart;
  hScroll.addEventListener('mousedown', e => {
    isDragging = true;
    startX = e.pageX;
    scrollStart = hScroll.scrollLeft;
    hScroll.style.cursor = 'grabbing';
    e.preventDefault();
  });
  window.addEventListener('mouseup', () => {
    isDragging = false;
    if (hScroll) hScroll.style.cursor = 'grab';
  });
  hScroll.addEventListener('mousemove', e => {
    if (!isDragging) return;
    hScroll.scrollLeft = scrollStart - (e.pageX - startX);
  });

  // Progress dots
  const dots = document.querySelectorAll('.h-scroll-dot');
  if (dots.length) {
    hScroll.addEventListener('scroll', () => {
      const cards = hScroll.querySelectorAll('.project-card');
      const cardW = cards[0] ? cards[0].offsetWidth + 24 : 344;
      const idx = Math.min(Math.round(hScroll.scrollLeft / cardW), dots.length - 1);
      dots.forEach((d, i) => d.classList.toggle('active', i === idx));
    });
  }
}
