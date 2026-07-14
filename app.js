/* ============================================================
   SKILLS TECHNOLOGY SOLUTIONS — main.js
   Every image sequence below (Logo / Services / Team) is driven
   ONLY by scroll position. Nothing auto-plays on its own.
   ============================================================ */
(function () {
  "use strict";

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);

  function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }

  /* progress (0..1) of how far the user has scrolled through a tall pin block,
     relative to that block staying pinned for one viewport height */
  function pinProgress(pinEl) {
    const rect = pinEl.getBoundingClientRect();
    const scrollable = pinEl.offsetHeight - window.innerHeight;
    return clamp(-rect.top / Math.max(1, scrollable), 0, 1);
  }
  /* progress of a normal (non-pinned) element moving through the viewport */
  function sectionProgress(el) {
    const r = el.getBoundingClientRect();
    const vh = window.innerHeight;
    const total = r.height + vh;
    const done = vh - r.top;
    return clamp(done / total, 0, 1);
  }

  /* ---------------- DATA ---------------- */
  const LOGO_COUNT = 185;
  const LOGO_IMAGES = Array.from({ length: LOGO_COUNT }, (_, i) => `assets/logo/logo-${String(i + 1).padStart(3, '0')}.jpg`);

  const SERVICES_FRAME_COUNT = 248;
  const SERVICES_IMAGES = Array.from({ length: SERVICES_FRAME_COUNT }, (_, i) => `assets/services/svc-${String(i + 1).padStart(3, '0')}.jpg`);

  const TEAM_FRAME_COUNT = 250;
  const TEAM_IMAGES = Array.from({ length: TEAM_FRAME_COUNT }, (_, i) => `assets/team/team-${String(i + 1).padStart(3, '0')}.jpg`);

  const COURSES = [
    { img: 'assets/courses/14.png', title: 'AI & Chatbots', dur: '8 Weeks', level: 'Intermediate', offer: true },
    { img: 'assets/courses/11.png', title: 'Python Programming', dur: '10 Weeks', level: 'Beginner', offer: false },
    { img: 'assets/courses/7.png', title: 'Web Development', dur: '12 Weeks', level: 'Beginner', offer: true },
    { img: 'assets/courses/8.png', title: 'App Development', dur: '12 Weeks', level: 'Intermediate', offer: false },
    { img: 'assets/courses/13.png', title: 'WordPress', dur: '6 Weeks', level: 'Beginner', offer: false },
    { img: 'assets/courses/4.png', title: 'Shopify', dur: '6 Weeks', level: 'Beginner', offer: true },
    { img: 'assets/courses/9.png', title: 'Graphic Design', dur: '8 Weeks', level: 'Beginner', offer: false },
    { img: 'assets/courses/10.png', title: 'Video Editing', dur: '6 Weeks', level: 'Beginner', offer: true },
    { img: 'assets/courses/2.png', title: 'YouTube Automation', dur: '5 Weeks', level: 'Beginner', offer: true },
    { img: 'assets/courses/3.png', title: 'TikTok Automation', dur: '5 Weeks', level: 'Beginner', offer: false },
    { img: 'assets/courses/6.png', title: 'Facebook Monetization', dur: '5 Weeks', level: 'Beginner', offer: true },
    { img: 'assets/courses/5.png', title: 'Instagram Automation', dur: '5 Weeks', level: 'Beginner', offer: false },
    { img: 'assets/courses/15.png', title: 'Digital Marketing', dur: '9 Weeks', level: 'Intermediate', offer: false },
    { img: 'assets/courses/16.png', title: 'Cyber Security', dur: '10 Weeks', level: 'Advanced', offer: true },
  ];

  const SERVICE_STEPS = [
    { title: 'Web Development', desc: 'Fast, modern, conversion-focused websites built with clean code and premium UI.' },
    { title: 'App Development', desc: 'Native and cross-platform mobile apps shipped to the App Store and Play Store.' },
    { title: 'Digital Marketing', desc: 'Full-funnel campaigns across search and social, built on data — not guesswork.' },
    { title: 'Graphic Design', desc: 'Brand identities and creative that make a business instantly recognizable.' },
    { title: 'Video Editing', desc: 'Scroll-stopping short and long-form video production for creators and brands.' },
    { title: 'Social Automation', desc: 'Automated posting and monetization systems across YouTube, TikTok and Instagram.' },
    { title: 'Cyber Security', desc: 'Security audits, hardening and monitoring to keep client data protected.' },
    { title: 'AI Consulting', desc: 'Chatbots and applied AI tooling that cut manual work out of daily operations.' },
  ];

  const TESTIMONIALS = [
    { name: 'Hassan R.', role: 'Web Development student', text: 'The course was hands-on from day one. I launched my first client project before I even finished the program.' },
    { name: 'Ayesha K.', role: 'Digital Marketing student', text: 'Clear explanations, real campaigns, real budgets. I run paid ads for two local businesses now.' },
    { name: 'Bilal M.', role: 'AI & Chatbots student', text: 'I went from zero coding knowledge to shipping my own chatbot in eight weeks. Incredible pace.' },
    { name: 'Sana T.', role: 'Graphic Design student', text: 'Small class sizes meant the instructor actually looked at my work and told me what to fix.' },
    { name: 'Usman F.', role: 'App Development student', text: 'Best investment I made this year. My app is live and I picked up freelance work within a month.' },
    { name: 'Mahnoor A.', role: 'YouTube Automation student', text: 'The automation workflows alone paid for the course. My channel runs almost hands-free now.' },
  ];

  /* ---------------- SAFE INIT WRAPPER ----------------
     one broken module should never prevent the nav/menu from working */
  function safe(fn, label) {
    try { fn(); }
    catch (err) { console.error('[' + label + '] init failed:', err); }
  }

  /* ---------------- PRELOADER (loads the Logo frame sequence — blocking) ---------------- */
  let heroFrames = [];

  function initPreloader() {
    const bar = document.getElementById('loaderBar');
    const pct = document.getElementById('loader-pct');
    const pre = document.getElementById('preloader');
    const CIRC = 339;
    document.body.style.overflow = 'hidden';

    function setProgress(t) {
      bar.style.strokeDashoffset = CIRC - (CIRC * t);
      pct.textContent = Math.floor(t * 100) + '%';
    }

    let loaded = 0;
    const total = LOGO_IMAGES.length;
    heroFrames = new Array(total);

    const finish = () => {
      setProgress(1);
      setTimeout(() => {
        pre.classList.add('hidden');
        document.body.style.overflow = '';
        safe(playIntro, 'playIntro');
        safe(initHeroCanvas, 'heroCanvas');
      }, 250);
    };

    LOGO_IMAGES.forEach((src, i) => {
      const img = new Image();
      img.onload = img.onerror = () => {
        heroFrames[i] = img;
        loaded++;
        setProgress(loaded / total);
        if (loaded === total) finish();
      };
      img.src = src;
    });

    setTimeout(() => { if (loaded < total) finish(); }, 9000);
  }

  function playIntro() {
    if (reducedMotion || typeof gsap === 'undefined') return;
    gsap.from('#siteHeader', { y: -40, opacity: 0, duration: .8, ease: 'power3.out' });
    gsap.from('.hero-frame-badge, .scroll-cue', { opacity: 0, y: 10, duration: 1, delay: .3 });
  }

  /* ---------------- BACKGROUND PRELOAD (Services / Team — non-blocking) ----------------
     Starts loading immediately so frames are ready by the time the user scrolls
     there, but never blocks the page. */
  let serviceFrames = new Array(SERVICES_FRAME_COUNT);
  let teamFrames = new Array(TEAM_FRAME_COUNT);

  function backgroundPreload(list, store) {
    list.forEach((src, i) => {
      const img = new Image();
      img.onload = img.onerror = () => { store[i] = img; };
      img.src = src;
    });
  }

  /* ---------------- CURSOR GLOW ---------------- */
  function initCursorGlow() {
    const glow = document.getElementById('cursorGlow');
    if (!glow) return;
    if (window.matchMedia('(pointer: coarse)').matches) { glow.style.display = 'none'; return; }
    let mx = innerWidth / 2, my = innerHeight / 2, cx = mx, cy = my;
    window.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });
    function loop() {
      cx += (mx - cx) * 0.12; cy += (my - cy) * 0.12;
      glow.style.transform = `translate(${cx}px, ${cy}px)`;
      requestAnimationFrame(loop);
    }
    loop();
  }

  /* ---------------- AMBIENT PARTICLES (decorative background only) ---------------- */
  function initParticles() {
    const canvas = document.getElementById('particles-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let w, h, particles;
    function resize() { w = canvas.width = innerWidth; h = canvas.height = innerHeight; }
    function makeParticles() {
      const count = Math.min(70, Math.floor((w * h) / 22000));
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * w, y: Math.random() * h,
        r: Math.random() * 1.6 + 0.4,
        vx: (Math.random() - .5) * 0.15, vy: (Math.random() - .5) * 0.15 - 0.05,
        a: Math.random() * 0.5 + 0.15
      }));
    }
    function draw() {
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = '#00e5ff';
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = w; if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h; if (p.y > h) p.y = 0;
        ctx.globalAlpha = p.a;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
      });
      ctx.globalAlpha = 1;
      if (!reducedMotion) requestAnimationFrame(draw);
    }
    resize(); makeParticles(); draw();
    window.addEventListener('resize', () => { resize(); makeParticles(); });
  }

  /* ---------------- NAVBAR / FULLSCREEN MENU ---------------- */
  function initNav() {
    const header = document.getElementById('siteHeader');
    const backTop = document.getElementById('backTop');
    const btn = document.getElementById('hamburgerBtn');
    const nav = document.getElementById('fullnav');
    const scrim = document.getElementById('navScrim');

    /* header is now just the round logo + hamburger floating directly on the
       page (no solid bar behind them), so it stays visible permanently and
       never hides the scrubbing frame sequences underneath it. */
    window.addEventListener('scroll', () => {
      if (backTop) backTop.classList.toggle('show', window.scrollY > 700);
    }, { passive: true });

    if (!btn || !nav) return;

    function closeNav() {
      nav.classList.remove('open');
      btn.classList.remove('active');
      btn.setAttribute('aria-expanded', 'false');
      if (scrim) scrim.classList.remove('show');
      document.body.style.overflow = '';
    }
    function openNav() {
      nav.classList.add('open');
      btn.classList.add('active');
      btn.setAttribute('aria-expanded', 'true');
      if (scrim) scrim.classList.add('show');
      document.body.style.overflow = 'hidden';
    }
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      nav.classList.contains('open') ? closeNav() : openNav();
    });
    nav.querySelectorAll('a').forEach(a => a.addEventListener('click', closeNav));
    if (scrim) scrim.addEventListener('click', closeNav);

    if (backTop) backTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

  /* ---------------- GENERIC FRAME-SEQUENCE CANVAS DRAWER ---------------- */
  function drawFrameCover(ctx, canvas, img) {
    if (!img || !img.naturalWidth) return;
    const cw = canvas.width, ch = canvas.height;
    const ir = img.naturalWidth / img.naturalHeight, cr = cw / ch;
    let dw, dh, dx, dy;
    if (ir > cr) { dh = ch; dw = ch * ir; dx = (cw - dw) / 2; dy = 0; }
    else { dw = cw; dh = cw / ir; dx = 0; dy = (ch - dh) / 2; }
    ctx.clearRect(0, 0, cw, ch);
    ctx.drawImage(img, dx, dy, dw, dh);
  }
  /* fits the whole frame inside the canvas without cropping (for portrait Services/Team frames) */
  function drawFrameContain(ctx, canvas, img) {
    if (!img || !img.naturalWidth) return;
    const cw = canvas.width, ch = canvas.height;
    const ir = img.naturalWidth / img.naturalHeight, cr = cw / ch;
    let dw, dh, dx, dy;
    if (ir > cr) { dw = cw; dh = cw / ir; dx = 0; dy = (ch - dh) / 2; }
    else { dh = ch; dw = ch * ir; dx = (cw - dw) / 2; dy = 0; }
    ctx.clearRect(0, 0, cw, ch);
    ctx.drawImage(img, dx, dy, dw, dh);
  }
  /* finds the nearest loaded frame if the exact one hasn't finished loading yet */
  function nearestLoaded(arr, i) {
    if (arr[i] && arr[i].naturalWidth) return arr[i];
    for (let d = 1; d < 40; d++) {
      if (arr[i - d] && arr[i - d].naturalWidth) return arr[i - d];
      if (arr[i + d] && arr[i + d].naturalWidth) return arr[i + d];
    }
    return null;
  }

  /* ---------------- HERO — scroll-scrubbed Logo sequence, true fullscreen ---------------- */
  let heroCanvas, heroCtx, heroLastFrame = -1;

  function initHeroCanvas() {
    heroCanvas = document.getElementById('heroCanvas');
    if (!heroCanvas) return;
    heroCtx = heroCanvas.getContext('2d');
    resizeHeroCanvas();
    window.addEventListener('resize', resizeHeroCanvas);
    updateHeroScrub();
  }
  function resizeHeroCanvas() {
    if (!heroCanvas) return;
    heroCanvas.width = heroCanvas.clientWidth * dpr;
    heroCanvas.height = heroCanvas.clientHeight * dpr;
    if (heroLastFrame >= 0) drawFrameCover(heroCtx, heroCanvas, heroFrames[heroLastFrame]);
  }
  function updateHeroScrub() {
    const pin = document.getElementById('hero-pin');
    if (!pin || !heroCanvas || !heroFrames.length) return;
    const progress = pinProgress(pin);
    const idx = Math.min(heroFrames.length - 1, Math.floor(progress * (heroFrames.length - 1)));
    if (idx !== heroLastFrame) {
      drawFrameCover(heroCtx, heroCanvas, heroFrames[idx]);
      heroLastFrame = idx;
    }
    const numEl = document.getElementById('heroFrameNum');
    const barEl = document.getElementById('heroFrameBar');
    const cueEl = document.getElementById('scrollCue');
    if (numEl) numEl.textContent = String(idx + 1).padStart(3, '0');
    if (barEl) barEl.style.width = (progress * 100) + '%';
    if (cueEl) cueEl.classList.toggle('fade', progress > 0.03);
  }

  /* ---------------- COURSES — pinned image strip, completes before next section ---------------- */
  let courseArcEl, coursesPinEl;

  function initCourses() {
    const arc = document.getElementById('courseArc');
    courseArcEl = arc;
    coursesPinEl = document.getElementById('coursesPin');

    COURSES.forEach((c, i) => {
      const item = document.createElement('div');
      item.className = 'arc-item';
      const arcOffset = Math.sin((i / COURSES.length) * Math.PI) * -26;
      item.style.transform = `translateY(${arcOffset}px)`;
      const img = document.createElement('img');
      img.src = c.img; img.alt = c.title; img.loading = 'lazy';
      item.appendChild(img);
      arc.appendChild(item);
    });

    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('in'); });
    }, { threshold: 0.15 });
    arc.querySelectorAll('.arc-item').forEach(el => io.observe(el));

    const grid = document.getElementById('courseGrid');
    COURSES.forEach(c => {
      const card = document.createElement('div');
      card.className = 'course-card glass reveal';
      card.innerHTML = `
      ${c.offer ? '<div class="ribbon">SPECIAL OFFER</div>' : ''}
      <div class="course-img-wrap"><img src="${c.img}" alt="${c.title}" loading="lazy"></div>
      <div class="course-title">${c.title}</div>
      <div class="course-meta">
        <span><i></i>${c.dur}</span>
        <span><i></i>${c.level}</span>
      </div>
      <button class="enroll-btn" type="button">Enroll Now →</button>
    `;
      card.querySelector('.enroll-btn').addEventListener('click', () => {
        document.getElementById('contact').scrollIntoView({ behavior: 'smooth' });
      });
      grid.appendChild(card);
    });
  }
  function updateCoursesScrub() {
    if (!courseArcEl || !coursesPinEl) return;
    const p = pinProgress(coursesPinEl);
    const wrap = courseArcEl.parentElement;
    const maxShift = Math.max(0, courseArcEl.scrollWidth - wrap.clientWidth);
    courseArcEl.style.transform = `translateX(${-p * maxShift}px)`;
    const bar = document.getElementById('coursesProgressBar');
    if (bar) bar.style.width = (p * 100) + '%';
  }

  /* ---------------- SERVICES — split screen scrub (left: frames, right: copy) ---------------- */
  let servicesCanvas, servicesCtx, servicesLastFrame = -1, servicesPinEl;

  function initServicesSplit() {
    servicesCanvas = document.getElementById('servicesCanvas');
    servicesPinEl = document.getElementById('servicesPin');
    if (!servicesCanvas) return;
    servicesCtx = servicesCanvas.getContext('2d');

    const host = document.getElementById('serviceSteps');
    SERVICE_STEPS.forEach((s, i) => {
      const el = document.createElement('div');
      el.className = 'svc-step';
      el.innerHTML = `<span class="num">0${i + 1}</span><span><span class="name">${s.title}</span><span class="desc">${s.desc}</span></span>`;
      host.appendChild(el);
    });

    function resize() {
      servicesCanvas.width = servicesCanvas.clientWidth * dpr;
      servicesCanvas.height = servicesCanvas.clientHeight * dpr;
      if (servicesLastFrame >= 0) {
        const img = nearestLoaded(serviceFrames, servicesLastFrame);
        if (img) drawFrameContain(servicesCtx, servicesCanvas, img);
      }
    }
    window.addEventListener('resize', resize);
    resize();
  }
  function updateServicesScrub() {
    if (!servicesCanvas || !servicesPinEl) return;
    const p = pinProgress(servicesPinEl);
    const idx = Math.min(SERVICES_FRAME_COUNT - 1, Math.floor(p * (SERVICES_FRAME_COUNT - 1)));
    if (idx !== servicesLastFrame) {
      const img = nearestLoaded(serviceFrames, idx);
      if (img) { drawFrameContain(servicesCtx, servicesCanvas, img); servicesLastFrame = idx; }
    }
    const stepCount = SERVICE_STEPS.length;
    const activeIdx = Math.min(stepCount - 1, Math.floor(p * stepCount));
    document.querySelectorAll('#serviceSteps .svc-step').forEach((el, i) => {
      el.classList.toggle('active', i === activeIdx);
    });
    const bar = document.getElementById('servicesProgressBar');
    if (bar) bar.style.width = (p * 100) + '%';
  }

  /* ---------------- TEAM — split screen scrub (left: founder frames, right: bio) ---------------- */
  let teamCanvas, teamCtx, teamLastFrame = -1, teamPinEl;

  function initTeamSplit() {
    teamCanvas = document.getElementById('teamCanvas');
    teamPinEl = document.getElementById('teamPin');
    if (!teamCanvas) return;
    teamCtx = teamCanvas.getContext('2d');

    function resize() {
      teamCanvas.width = teamCanvas.clientWidth * dpr;
      teamCanvas.height = teamCanvas.clientHeight * dpr;
      if (teamLastFrame >= 0) {
        const img = nearestLoaded(teamFrames, teamLastFrame);
        if (img) drawFrameContain(teamCtx, teamCanvas, img);
      }
    }
    window.addEventListener('resize', resize);
    resize();
  }
  function updateTeamScrub() {
    if (!teamCanvas || !teamPinEl) return;
    const p = pinProgress(teamPinEl);
    const idx = Math.min(TEAM_FRAME_COUNT - 1, Math.floor(p * (TEAM_FRAME_COUNT - 1)));
    if (idx !== teamLastFrame) {
      const img = nearestLoaded(teamFrames, idx);
      if (img) { drawFrameContain(teamCtx, teamCanvas, img); teamLastFrame = idx; }
    }
    const bar = document.getElementById('teamProgressBar');
    if (bar) bar.style.width = (p * 100) + '%';
  }

  /* ---------------- TESTIMONIALS (scroll-scrub, no auto-play) ---------------- */
  let testiTrackEl, testiSectionEl;

  function initTestimonials() {
    const track = document.getElementById('testiTrack');
    testiTrackEl = track;
    testiSectionEl = document.getElementById('testimonials');
    TESTIMONIALS.forEach(t => {
      const initials = t.name.split(' ').map(w => w[0]).join('').slice(0, 2);
      const card = document.createElement('div');
      card.className = 'testi-card glass';
      card.innerHTML = `
      <div class="quote-icon">&ldquo;</div>
      <div class="stars">★★★★★</div>
      <p class="testi-text">${t.text}</p>
      <div class="testi-person">
        <div class="testi-avatar">${initials}</div>
        <div><b>${t.name}</b><span>${t.role}</span></div>
      </div>`;
      track.appendChild(card);
    });
  }
  function updateTestimonialsScrub() {
    if (!testiTrackEl || !testiSectionEl) return;
    const p = sectionProgress(testiSectionEl);
    const wrap = testiTrackEl.parentElement;
    const maxShift = Math.max(0, testiTrackEl.scrollWidth - wrap.clientWidth + 40);
    testiTrackEl.style.transform = `translateX(${-p * maxShift}px)`;
  }

  /* ---------------- CONTACT FORM ---------------- */
  function initContactForm() {
    const form = document.getElementById('contactForm');
    if (!form) return;
    const success = document.getElementById('successLayer');
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    form.addEventListener('submit', e => {
      e.preventDefault();
      let valid = true;
      const checks = [
        { id: 'cf-name', ok: v => v.trim().length > 1 },
        { id: 'cf-email', ok: v => emailRe.test(v.trim()) },
        { id: 'cf-subject', ok: v => v.trim().length > 2 },
        { id: 'cf-message', ok: v => v.trim().length > 5 },
      ];
      checks.forEach(c => {
        const input = document.getElementById(c.id);
        const field = input.closest('.field');
        const ok = c.ok(input.value);
        field.classList.toggle('invalid', !ok);
        if (!ok) valid = false;
      });
      if (!valid) return;

      success.classList.add('show');
      setTimeout(() => {
        form.reset();
        success.classList.remove('show');
      }, 2600);
    });

    form.querySelectorAll('input, textarea').forEach(el => {
      el.addEventListener('input', () => el.closest('.field').classList.remove('invalid'));
    });
  }

  /* ---------------- SCROLL REVEAL (fade-ins only, not frame playback) ---------------- */
  function initReveal() {
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          e.target.classList.add('in-view');
        }
      });
    }, { threshold: 0.15 });
    document.querySelectorAll('.reveal, .section-head').forEach(el => {
      el.classList.add('reveal');
      io.observe(el);
    });
  }

  /* ---------------- GLOBAL SCROLL-SCRUB CONTROLLER ----------------
     Everything here only updates inside a scroll event — nothing plays by itself. */
  function updateScrollScrub() {
    updateHeroScrub();
    updateCoursesScrub();
    updateServicesScrub();
    updateTeamScrub();
    updateTestimonialsScrub();
  }
  function initScrollScrub() {
    let ticking = false;
    function onScroll() {
      if (!ticking) {
        requestAnimationFrame(() => { updateScrollScrub(); ticking = false; });
        ticking = true;
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    onScroll();
  }

  /* ---------------- INIT ---------------- */
  document.addEventListener('DOMContentLoaded', () => {
    const yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    // nav/menu goes first and is wrapped safely so it always works
    safe(initNav, 'nav');
    safe(initCursorGlow, 'cursorGlow');
    safe(initParticles, 'particles');

    safe(initCourses, 'courses');
    safe(initServicesSplit, 'servicesSplit');
    safe(initTeamSplit, 'teamSplit');
    safe(initTestimonials, 'testimonials');
    safe(initContactForm, 'contactForm');

    safe(initScrollScrub, 'scrollScrub');
    safe(initReveal, 'reveal');

    // background-load the big frame sequences used further down the page
    backgroundPreload(SERVICES_IMAGES, serviceFrames);
    backgroundPreload(TEAM_IMAGES, teamFrames);

    // blocking preloader for the Logo sequence used in the fullscreen hero
    safe(initPreloader, 'preloader');
  });

})();
