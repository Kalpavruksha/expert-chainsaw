// ─── 1. Lenis smooth scroll ────────────────────────────────────────────────
const lenis = new Lenis({
  duration: 1.0,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smoothWheel: true,
});

lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((time) => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);

ScrollTrigger.defaults({ toggleActions: 'play none none reverse' });

// ─── 2. Shared mouse state ─────────────────────────────────────────────────
let mouseX = 0, mouseY = 0;
let targetX = 0, targetY = 0;

// ─── 3. Three.js — only render when something changed ─────────────────────
let particlesMesh;
try {
  const canvas = document.getElementById('hero-canvas');
  if (canvas && typeof THREE !== 'undefined') {
    const scene    = new THREE.Scene();
    const camera   = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false, powerPreference: 'low-power' });

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1));   // cap at 1× — no need for Retina particles

    const count   = 200;                                             // was 300
    const posArr  = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i++) posArr[i] = (Math.random() - 0.5) * 10;

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(posArr, 3));

    const mat = new THREE.PointsMaterial({
      size: 0.025, color: 0xc9a84c, transparent: true, opacity: 0.7,
      blending: THREE.AdditiveBlending, depthWrite: false,
    });

    particlesMesh = new THREE.Points(geo, mat);
    scene.add(particlesMesh);
    camera.position.z = 3;

    // Only rotate when hero is visible (IntersectionObserver kills the loop off-screen)
    let heroVisible = true;
    let needsRender = true;
    let rafId;

    const tick = () => {
      if (!heroVisible) { rafId = null; return; }
      rafId = requestAnimationFrame(tick);

      particlesMesh.rotation.y += 0.0002;
      particlesMesh.rotation.x += 0.0002;
      particlesMesh.rotation.y += 0.04 * (targetX - particlesMesh.rotation.y);
      particlesMesh.rotation.x += 0.04 * (targetY - particlesMesh.rotation.x);

      renderer.render(scene, camera);
    };
    tick();

    const io = new IntersectionObserver(([e]) => {
      heroVisible = e.isIntersecting;
      if (heroVisible && !rafId) tick();   // restart if re-entered
    }, { threshold: 0.01 });
    io.observe(document.getElementById('hero'));

    // Resize
    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }, { passive: true });

    // Particle implode on scroll (only updates transform, cheap)
    gsap.to(particlesMesh.scale, {
      scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: 1 },
      x: 0, y: 0, z: 0, ease: 'none',
    });
  }
} catch (e) { console.error('Three.js:', e); }

// ─── 4. Film overlay — fast fade then DOM removal ─────────────────────────
const overlay = document.querySelector('.film-overlay');
if (overlay) {
  gsap.to(overlay, { opacity: 0, duration: 0.5, onComplete: () => overlay.remove() });
}

// ─── 5. Hero title letter split ───────────────────────────────────────────
const line1 = document.querySelector('.hero-title .line1');
const line2 = document.querySelector('.hero-title .line2');
if (line1 && line2) {
  const split = (el) => {
    el.innerHTML = el.textContent.split('').map(c =>
      c === ' ' ? '&nbsp;' : `<span style="display:inline-block">${c}</span>`
    ).join('');
  };
  split(line1); split(line2);

  gsap.timeline({ defaults: { ease: 'power3.out' } })
    .from('.hero-title .line1 span, .hero-title .line2 span', { y: 60, opacity: 0, stagger: 0.06, duration: 0.7 }, '+=0.3')
    .from('.hero-role',        { y: 24, opacity: 0, duration: 0.6 }, '-=0.4')
    .from('.hero-bio',         { y: 24, opacity: 0, duration: 0.6 }, '-=0.4')
    .from('.hero-actions',     { y: 24, opacity: 0, duration: 0.6 }, '-=0.4')
    .from('.hero-image-frame', { scale: 0.88, opacity: 0, duration: 1.0, ease: 'elastic.out(1,0.75)' }, '-=0.7')
    .from('.hero-scroll',      { opacity: 0, duration: 0.4 }, '-=0.2');
}

// ─── 6. Hero parallax — single subtle scrub (removed glow scale scrub) ────
gsap.to('.hero-image-frame', {
  scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: true },
  y: 60, ease: 'none',
});

// ─── 7. About section ─────────────────────────────────────────────────────
gsap.fromTo('#about',
  { opacity: 0 },
  { opacity: 1, duration: 0.6, scrollTrigger: { trigger: '#about', start: 'top 90%' } }
);

gsap.fromTo('.stat-card',
  { y: 28, opacity: 0 },
  { y: 0, opacity: 1, stagger: 0.1, duration: 0.6, ease: 'power2.out',
    scrollTrigger: { trigger: '.about-stats', start: 'top 85%' } }
);

gsap.fromTo('.about-text p',
  { y: 30, opacity: 0 },
  { y: 0, opacity: 1, stagger: 0.15, duration: 0.7, ease: 'power3.out',
    scrollTrigger: { trigger: '.about-text', start: 'top 95%' } }
);

// ─── 8. Stat counters ─────────────────────────────────────────────────────
document.querySelectorAll('.stat-num[data-count]').forEach(el => {
  const target = parseInt(el.dataset.count);
  el.innerText = '0';
  ScrollTrigger.create({
    trigger: el, start: 'top 85%',
    onEnter: () => gsap.to(el, {
      innerText: target, snap: { innerText: 1 }, duration: 1.8, ease: 'power2.out',
      onComplete: () => {
        if (el.dataset.suffix && !el.innerHTML.includes(el.dataset.suffix)) {
          el.innerHTML += `<span style="font-size:0.5em;margin-left:4px;vertical-align:middle">${el.dataset.suffix}</span>`;
        }
      },
    }),
  });
});

// ─── 9. Skills ────────────────────────────────────────────────────────────
gsap.fromTo('.skill-pill',
  { y: 16, opacity: 0 },
  { y: 0, opacity: 1, stagger: 0.025, duration: 0.45, ease: 'power2.out',
    scrollTrigger: { trigger: '.skills-grid', start: 'top 90%' } }
);

// ─── 10. Section titles ───────────────────────────────────────────────────
gsap.utils.toArray('.section-title').forEach(el => {
  gsap.from(el, { y: 36, opacity: 0, duration: 0.7, ease: 'power3.out',
    scrollTrigger: { trigger: el, start: 'top 88%' } });
});

// ─── 11. Experience ───────────────────────────────────────────────────────
gsap.fromTo('.exp-card',
  { scaleY: 0, transformOrigin: 'top' },
  { scaleY: 1, duration: 0.7, ease: 'power3.out',
    scrollTrigger: { trigger: '#experience', start: 'top 80%' } }
);
gsap.fromTo('.exp-list li',
  { x: -16, opacity: 0 },
  { x: 0, opacity: 1, stagger: 0.12, duration: 0.55, ease: 'power3.out',
    scrollTrigger: { trigger: '#experience', start: 'top 70%' } }
);

// ─── 12. Projects — native CSS scroll-snap, IntersectionObserver fade-in ──
// No GSAP pin/scrub/containerAnimation — those caused the freeze.
// CSS handles the horizontal scroll natively (scroll-snap, hardware-accelerated).
(function () {
  const grid = document.querySelector('.projects-grid');
  if (!grid) return;

  // Arrow navigation buttons
  const btnPrev = document.querySelector('.proj-arrow-prev');
  const btnNext = document.querySelector('.proj-arrow-next');
  const CARD_W  = () => grid.querySelector('.project-card')?.offsetWidth + 28 || 448; // card + gap

  if (btnNext) btnNext.addEventListener('click', () => { grid.scrollBy({ left:  CARD_W(), behavior: 'smooth' }); });
  if (btnPrev) btnPrev.addEventListener('click', () => { grid.scrollBy({ left: -CARD_W(), behavior: 'smooth' }); });

  // Show/hide arrows based on scroll position
  const updateArrows = () => {
    if (!btnPrev || !btnNext) return;
    btnPrev.style.opacity = grid.scrollLeft < 20 ? '0.3' : '1';
    btnNext.style.opacity = grid.scrollLeft + grid.clientWidth >= grid.scrollWidth - 20 ? '0.3' : '1';
  };
  grid.addEventListener('scroll', updateArrows, { passive: true });
  updateArrows();

  // Fade-in via IntersectionObserver (no GSAP overhead)
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('card-visible');
        io.unobserve(entry.target); // fire once
      }
    });
  }, { threshold: 0.10, rootMargin: '0px 0px -20px 0px' });

  document.querySelectorAll('.project-card').forEach(c => io.observe(c));

  // Mouse drag-to-scroll (desktop)
  let isDragging = false, startX = 0, startScrollLeft = 0;
  grid.addEventListener('mousedown', (e) => {
    isDragging = true;
    startX = e.pageX - grid.offsetLeft;
    startScrollLeft = grid.scrollLeft;
    grid.style.userSelect = 'none';
  });
  window.addEventListener('mouseup', () => {
    isDragging = false;
    grid.style.userSelect = '';
  });
  window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x    = e.pageX - grid.offsetLeft;
    const walk = (x - startX) * 1.5;
    grid.scrollLeft = startScrollLeft - walk;
  });
})();

// ─── 13. Achievements folder ──────────────────────────────────────────────
ScrollTrigger.create({
  trigger: '#achievements', start: 'top 50%',
  onEnter:     () => document.querySelector('.folder-gallery-container').classList.add('open'),
  onLeaveBack: () => document.querySelector('.folder-gallery-container').classList.remove('open'),
});

// ─── 14. Contact ──────────────────────────────────────────────────────────
gsap.from('.contact-inner > *', {
  y: 36, opacity: 0, stagger: 0.12, duration: 0.7, ease: 'power3.out',
  scrollTrigger: { trigger: '#contact', start: 'top 80%' },
});

// ─── 15. VanillaTilt — desktop only, scoped to first 4 cards ──────────────
try {
  if (typeof VanillaTilt !== 'undefined' && window.innerWidth > 900) {
    VanillaTilt.init(document.querySelectorAll('.project-card'), {
      max: 6, speed: 400, glare: false,   // no glare = no extra DOM element per card
    });
  }
} catch (e) { console.error('VanillaTilt:', e); }

// ─── 16. Progress bar + nav — single passive scroll listener using RAF ─────
const bar      = document.querySelector('.progress-bar');
const sections = [...document.querySelectorAll('section[id]')];
const navLinks = [...document.querySelectorAll('.nav-links a')];

let scrollRAF = false;
window.addEventListener('scroll', () => {
  if (scrollRAF) return;
  scrollRAF = true;
  requestAnimationFrame(() => {
    // Progress bar
    if (bar) {
      const ratio = window.scrollY / (document.body.scrollHeight - window.innerHeight);
      bar.style.transform = `scaleX(${ratio})`;
    }
    // Active nav link
    let current = '';
    for (const s of sections) {
      if (window.scrollY >= s.offsetTop - 200) current = s.id;
    }
    for (const a of navLinks) {
      a.style.color = a.getAttribute('href') === '#' + current ? 'var(--text)' : '';
    }
    scrollRAF = false;
  });
}, { passive: true });

// ─── 17. Custom cursor — RAF-based follower with idle auto-stop ────────────
const cursor   = document.querySelector('.cursor');
const follower = document.querySelector('.cursor-follower');
let fX = 0, fY = 0;
let cursorRAF = null;

const animateFollower = () => {
  const dx = mouseX - fX;
  const dy = mouseY - fY;
  fX += dx * 0.1;
  fY += dy * 0.1;
  if (follower) {
    follower.style.left = fX + 'px';
    follower.style.top  = fY + 'px';
  }
  // Stop loop when caught up (saves GPU when idle)
  if (Math.abs(dx) > 0.3 || Math.abs(dy) > 0.3) {
    cursorRAF = requestAnimationFrame(animateFollower);
  } else {
    cursorRAF = null;
  }
};

// Cursor expand on interactive elements
document.querySelectorAll('a, button, .project-card, .skill-pill, .stat-card, .folder-front, .ach-card').forEach(el => {
  el.addEventListener('mouseenter', () => { if (follower) follower.classList.add('large'); });
  el.addEventListener('mouseleave', () => { if (follower) follower.classList.remove('large'); });
});

// ─── 18. Magnetic buttons ─────────────────────────────────────────────────
const magnets = document.querySelectorAll('.nav-links a, .btn-primary, .btn-secondary');
let activeMagnet = null;
magnets.forEach(btn => {
  btn.addEventListener('mouseenter', () => { activeMagnet = btn; });
  btn.addEventListener('mouseleave', () => {
    activeMagnet = null;
    gsap.to(btn, { x: 0, y: 0, duration: 0.4, ease: 'elastic.out(1,0.3)', overwrite: true });
  });
});

// ─── 19. Single throttled mousemove ───────────────────────────────────────
let mouseTick = false;
window.addEventListener('mousemove', (e) => {
  if (mouseTick) return;
  mouseTick = true;
  requestAnimationFrame(() => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    if (cursor) { cursor.style.left = mouseX + 'px'; cursor.style.top = mouseY + 'px'; }

    // Three.js target
    targetX = (mouseX / window.innerWidth)  - 0.5;
    targetY = (mouseY / window.innerHeight) - 0.5;

    // Magnetic
    if (activeMagnet) {
      const r = activeMagnet.getBoundingClientRect();
      gsap.to(activeMagnet, {
        x: (mouseX - r.left - r.width  / 2) * 0.25,
        y: (mouseY - r.top  - r.height / 2) * 0.25,
        duration: 0.4, ease: 'power3.out', overwrite: true,
      });
    }

    // Restart follower loop if it stopped
    if (!cursorRAF) cursorRAF = requestAnimationFrame(animateFollower);

    mouseTick = false;
  });
}, { passive: true });

// ─── 20. Single resize handler ────────────────────────────────────────────
window.addEventListener('resize', () => { ScrollTrigger.refresh(); }, { passive: true });
