/**
 * Hassan Saleh — Interactive AI Portfolio
 * Vanilla JS + native Canvas perspective projection. No CDN or runtime dependencies.
 */
(() => {
  'use strict';
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isFinePointer = window.matchMedia('(pointer: fine)').matches;

  const header = $('#header');
  const scrollBar = $('#scroll-progress');
  const backTop = $('#back-top');
  let scrollPending = false;
  const syncScroll = () => {
    const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const fraction = Math.min(1, Math.max(0, window.scrollY / max));
    if (scrollBar) scrollBar.style.width = `${fraction * 100}%`;
    header?.classList.toggle('scrolled', window.scrollY > 35);
    backTop?.classList.toggle('show', window.scrollY > 640);
    scrollPending = false;
  };
  window.addEventListener('scroll', () => {
    if (!scrollPending) {
      scrollPending = true;
      requestAnimationFrame(syncScroll);
    }
  }, { passive: true });
  window.addEventListener('resize', syncScroll, { passive: true });
  syncScroll();
  $('#year').textContent = new Date().getFullYear();

  const toggle = $('#nav-toggle');
  const links = $('#nav-links');
  function closeMenu() { if (!toggle || !links) return; toggle.setAttribute('aria-expanded', 'false'); toggle.setAttribute('aria-label', 'Open menu'); links.classList.remove('open'); }
  toggle?.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') !== 'true';
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    links.classList.toggle('open', open);
  });
  $$('a', links).forEach(link => link.addEventListener('click', closeMenu));
  window.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });
  window.addEventListener('resize', () => { if (window.innerWidth > 800) closeMenu(); });
  backTop?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' }));

  if ('IntersectionObserver' in window && !reduceMotion) {
    document.documentElement.classList.add('js-motion');
    const appear = new IntersectionObserver((entries, observer) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      }
    }, { threshold: .07, rootMargin: '0px 0px 45px 0px' });
    $$('.reveal').forEach(node => appear.observe(node));
    // The hero is visible immediately; no invisible content until scrolling.
  }

  const sections = $$('main section[id]');
  if ('IntersectionObserver' in window) {
    const spy = new IntersectionObserver(entries => {
      for (const entry of entries) if (entry.isIntersecting) {
        $$('.nav-links a').forEach(link => link.classList.toggle('active', link.hash === '#' + entry.target.id));
      }
    }, { rootMargin: '-33% 0px -59% 0px' });
    sections.forEach(section => spy.observe(section));
  }

  // Accessible category filters, keeping all seven CV items in source order.
  const filters = $$('.filter-btn');
  const projects = $$('.project-card');
  filters.forEach(btn => btn.addEventListener('click', () => {
    const selected = btn.dataset.filter;
    filters.forEach(b => {
      const active = b === btn;
      b.classList.toggle('active', active);
      b.setAttribute('aria-pressed', String(active));
    });
    projects.forEach(card => {
      const show = selected === 'all' || card.dataset.category === selected;
      card.hidden = !show;
      if (show) card.classList.add('visible');
    });
  }));

  // Perspective tilt, applied only to fine-pointer devices to avoid mobile jank.
  if (isFinePointer && !reduceMotion) {
    $$('.tilt-card').forEach(card => {
      let raf = 0;
      const move = event => {
        if (raf) return;
        raf = requestAnimationFrame(() => {
          raf = 0;
          const rect = card.getBoundingClientRect();
          const x = (event.clientX - rect.left) / rect.width - .5;
          const y = (event.clientY - rect.top) / rect.height - .5;
          card.style.setProperty('--pointer-x', `${(x + .5) * 100}%`);
          card.style.setProperty('--pointer-y', `${(y + .5) * 100}%`);
          card.style.transform = `perspective(1200px) rotateX(${-y * 2.2}deg) rotateY(${x * 2.5}deg) translateY(-3px)`;
        });
      };
      card.addEventListener('pointermove', move, { passive: true });
      card.addEventListener('pointerleave', () => { cancelAnimationFrame(raf); raf = 0; card.style.transform = ''; });
    });
    // Slow-follow, low-contrast ambient light. Its neutral-to-sage tone changes
    // very subtly across the viewport instead of making the whole page glow.
    const glow = $('#cursor-glow');
    if (glow) {
      let goalX = -800, goalY = -800, actualX = -800, actualY = -800;
      let targetTone = 0, tone = 0, glowFrame = 0;
      const animateGlow = () => {
        actualX += (goalX - actualX) * .115;
        actualY += (goalY - actualY) * .115;
        tone += (targetTone - tone) * .07;
        glow.style.transform = `translate3d(${actualX - 330}px,${actualY - 330}px,0)`;
        glow.style.setProperty('--glow-r', Math.round(143 + tone * 17));
        glow.style.setProperty('--glow-g', Math.round(175 - tone * 6));
        glow.style.setProperty('--glow-b', Math.round(154 - tone * 13));
        if (Math.abs(actualX - goalX) > .4 || Math.abs(actualY - goalY) > .4 || Math.abs(targetTone - tone) > .015) {
          glowFrame = requestAnimationFrame(animateGlow);
        } else glowFrame = 0;
      };
      window.addEventListener('pointermove', event => {
        goalX = event.clientX; goalY = event.clientY;
        targetTone = Math.max(0,Math.min(1,event.clientX / window.innerWidth));
        glow.classList.add('is-active');
        if (!glowFrame) glowFrame = requestAnimationFrame(animateGlow);
      }, { passive: true });
      document.addEventListener('mouseleave', () => glow.classList.remove('is-active'));
      window.addEventListener('blur', () => glow.classList.remove('is-active'));
    }
  }

  // Custom native Canvas renderer. Perspective-projected 3D orbitals + neural mesh.
  // Runs from file:// without installing Three.js or reaching a CDN.
  const canvas = $('#core-canvas');
  const stage = $('#hero-scene');
  if (!canvas || !stage) return;
  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) return;

  let width = 0, height = 0, dpr = 1;
  let mouseX = 0, mouseY = 0;
  let aimX = 0, aimY = 0;
  let onScreen = true;
  let frame = 0;
  let lastTime = 0;

  const rand = (seed) => {
    let x = Math.sin(seed * 127.1 + 4.173) * 43758.5453;
    return x - Math.floor(x);
  };
  const stars = Array.from({ length: 90 }, (_, i) => ({
    x: rand(i + 1), y: rand(i + 200), radius: .35 + rand(i + 431) * 1.2,
    pulse: rand(i + 87) * Math.PI * 2, alpha: .06 + rand(i + 17) * .19
  }));
  // Fibonacci distribution on a sphere yields stable, nearly uniform landmarks.
  const vertices = Array.from({ length: 118 }, (_, i) => {
    const t = (i + .5) / 118;
    const y = 1 - 2 * t;
    const radius = Math.sqrt(1 - y * y);
    const angle = i * Math.PI * (3 - Math.sqrt(5));
    return [radius * Math.cos(angle), y, radius * Math.sin(angle)];
  });
  const edges = [];
  for (let i = 0; i < vertices.length; i++) {
    for (let j = i + 1; j < vertices.length; j++) {
      const a = vertices[i], b = vertices[j];
      const dist2 = (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2;
      if (dist2 < .16) edges.push([i, j]);
    }
  }
  function resizeScene() {
    const rect = stage.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    width = rect.width; height = rect.height;
    dpr = Math.min(window.devicePixelRatio || 1, window.innerWidth < 720 ? 1.35 : 1.75);
    canvas.width = Math.max(1, Math.round(width * dpr));
    canvas.height = Math.max(1, Math.round(height * dpr));
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  const rotate = ([x, y, z], ax, ay, az) => {
    let c = Math.cos(ax), s = Math.sin(ax);
    [y, z] = [y * c - z * s, y * s + z * c];
    c = Math.cos(ay); s = Math.sin(ay);
    [x, z] = [x * c + z * s, -x * s + z * c];
    c = Math.cos(az); s = Math.sin(az);
    [x, y] = [x * c - y * s, x * s + y * c];
    return [x, y, z];
  };
  function project([x, y, z]) {
    const k = 5.4 / (5.4 - z);
    const unit = Math.min(width, height) * .201;
    return [width * .53 + x * unit * k, height * .49 + y * unit * k, z, k];
  }
  function stroke3d(points, color, lineWidth = 1, shadow = 0) {
    ctx.beginPath();
    points.forEach((p, i) => i === 0 ? ctx.moveTo(p[0], p[1]) : ctx.lineTo(p[0], p[1]));
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.shadowBlur = shadow;
    ctx.shadowColor = color;
    ctx.stroke();
    ctx.shadowBlur = 0;
  }
  function circleGlow(x, y, r, color, alpha = 1) {
    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 1;
  }
  const rgba = (r, g, b, a) => `rgba(${r},${g},${b},${a.toFixed(3)})`;

  function draw(time) {
    const t = time * .001;
    ctx.clearRect(0, 0, width, height);
    if (!width || !height) return;
    // Glow and scattered telemetry particles.
    const cx = width * .53, cy = height * .49;
    let aura = ctx.createRadialGradient(cx, cy, 2, cx, cy, Math.min(width, height) * .47);
    aura.addColorStop(0, 'rgba(127,158,136,.075)');
    aura.addColorStop(.42, 'rgba(103,127,111,.055)');
    aura.addColorStop(1, 'rgba(18,22,20,0)');
    ctx.fillStyle = aura;
    ctx.fillRect(0, 0, width, height);
    stars.forEach(s => circleGlow(s.x * width, s.y * height, s.radius, '#ADBEB2', s.alpha * (.76 + .24 * Math.sin(t * 1.3 + s.pulse))));

    aimX += (mouseX - aimX) * .024;
    aimY += (mouseY - aimY) * .024;
    const rx = t * .125 + aimY * .28;
    const ry = t * .2 + aimX * .4;

    // Backlit inner core, soft metallic / glass appearance.
    const c = project([0, 0, 0]);
    const radius = Math.min(width, height) * .206;
    const core = ctx.createRadialGradient(c[0] - radius * .23, c[1] - radius * .29, radius * .06, c[0], c[1], radius * 1.18);
    core.addColorStop(0, 'rgba(154,182,163,.11)');
    core.addColorStop(.38, 'rgba(66,97,80,.23)');
    core.addColorStop(.7, 'rgba(44,59,49,.22)');
    core.addColorStop(1, 'rgba(18,23,19,0)');
    ctx.fillStyle = core;
    ctx.beginPath();ctx.arc(c[0], c[1], radius * 1.18, 0, Math.PI * 2);ctx.fill();

    // Connections rotate coherently through 3D; depth sets brightness.
    const pts = vertices.map(point => project(rotate(point.map(v => v * 1.36), rx, ry, t * .09)));
    for (const [a, b] of edges) {
      const p1 = pts[a], p2 = pts[b];
      const dep = (p1[2] + p2[2]) / 2;
      const alpha = .105 + Math.max(0, (dep + 1.7) / 3.4) * .32;
      stroke3d([p1, p2], dep > .35 ? rgba(154, 190, 163, alpha * .82) : rgba(132, 157, 137, alpha * .75), .63 + Math.max(0, dep) * .3);
    }
    pts.forEach((p, i) => {
      const dep = p[2];
      const a = .25 + Math.max(0, (dep + 1.3) / 2.8) * .65;
      if (dep > -.45 || i % 4 === 0) circleGlow(p[0], p[1], .75 + Math.max(0, dep) * .65, dep > 0 ? '#A7C5AF' : '#899F91', a);
    });

    // Three independent gyroscopic rings, rendered in 3D (not CSS images).
    const configs = [
      { r: 2.14, x: .78, y: -.5, z: -.37, sx: .18, sy: .15, sz: .08, rgb: [157, 185, 162], alpha: .51, thick: 1.25 },
      { r: 2.34, x: -.43, y: .6, z: .82, sx: -.08, sy: .1, sz: -.15, rgb: [181, 185, 160], alpha: .38, thick: 1.05 },
      { r: 1.83, x: .12, y: 1.1, z: -.26, sx: .1, sy: -.2, sz: .1, rgb: [124, 158, 139], alpha: .36, thick: .9 }
    ];
    configs.forEach((ring, ringIndex) => {
      const arr = [];
      const steps = 160;
      for (let k = 0; k <= steps; k++) {
        const theta = Math.PI * 2 * k / steps;
        const xyz = [Math.cos(theta) * ring.r, Math.sin(theta) * ring.r, 0];
        arr.push(project(rotate(xyz, ring.x + t * ring.sx + aimY * .26, ring.y + t * ring.sy + aimX * .25, ring.z + t * ring.sz)));
      }
      // Drawing per segment gives front/back rings a natural depth cue.
      for (let k = 0; k < steps; k++) {
        const z = (arr[k][2] + arr[k + 1][2]) / 2;
        const depth = Math.max(0, (z + ring.r) / (2 * ring.r));
        const alpha = ring.alpha * (.15 + depth * .85);
        const shadow = depth > .62 && k % 6 === 0 ? 5 : 0;
        stroke3d([arr[k], arr[k + 1]], rgba(...ring.rgb, alpha), ring.thick + depth * .65, shadow);
      }
      const markerT = t * (.13 + ringIndex * .08) + ringIndex * 2.2;
      const marker = project(rotate([Math.cos(markerT) * ring.r, Math.sin(markerT) * ring.r, 0], ring.x + t * ring.sx + aimY * .26, ring.y + t * ring.sy + aimX * .25, ring.z + t * ring.sz));
      if (marker[2] > -.1) {
        ctx.shadowColor = ringIndex === 1 ? '#AAB9A4' : '#91B49D';ctx.shadowBlur = 11;
        circleGlow(marker[0], marker[1], 4.2, ringIndex === 1 ? '#B7BCA7' : '#A8C3B0');
        ctx.shadowBlur = 0;
      }
    });

    // Tiny floating labels keep the orb readable as a technical instrument.
    const top = project(rotate([1.2, -.1, 1.35], rx, ry, .2));
    const labelA = .25 + .15 * Math.sin(t * 2.1);
    stroke3d([[top[0], top[1]], [top[0] + 26, top[1] - 15], [top[0] + 69, top[1] - 15]], rgba(155, 187, 164, labelA * .72), .7);
    circleGlow(top[0], top[1], 2.1, '#B2C4B5', .6);
  }

  const render = timestamp => {
    if (!document.hidden && onScreen) {
      // Cap at ~45fps to reduce CPU load on laptops and mobile phones.
      if (timestamp - lastTime >= 22) { draw(timestamp); lastTime = timestamp; }
    }
    frame = requestAnimationFrame(render);
  };
  if (isFinePointer && !reduceMotion) {
    stage.addEventListener('pointermove', event => {
      const box = stage.getBoundingClientRect();
      mouseX = Math.max(-1, Math.min(1, ((event.clientX - box.left) / box.width - .5) * 2));
      mouseY = Math.max(-1, Math.min(1, ((event.clientY - box.top) / box.height - .5) * 2));
    }, { passive: true });
    stage.addEventListener('pointerleave', () => { mouseX = 0; mouseY = 0; });
  }
  if ('IntersectionObserver' in window) {
    const vis = new IntersectionObserver(entries => { onScreen = entries[0].isIntersecting; }, { threshold: 0 });
    vis.observe(stage);
  }
  let rsT = 0;
  window.addEventListener('resize', () => { clearTimeout(rsT); rsT = setTimeout(() => { resizeScene(); if (reduceMotion) draw(0); }, 90); }, { passive: true });
  resizeScene();
  if (reduceMotion) draw(0);
  else frame = requestAnimationFrame(render);
})();
