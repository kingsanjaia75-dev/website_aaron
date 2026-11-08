/* NORAA Elite Fitness — interactions */
(() => {
  'use strict';
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const root = document.documentElement;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const inr = n => '₹' + Math.round(n).toLocaleString('en-IN');
  const WA = '917305624503';

  $('#year').textContent = new Date().getFullYear();

  /* ---------- split text: words slide up from a mask (hero title per letter) ---------- */
  $$('[data-split]').forEach(el => {
    const chars = el.dataset.split === 'chars';
    let wi = 0, ci = 0;
    const walk = node => {
      [...node.childNodes].forEach(child => {
        if (child.nodeType === 3) {
          const frag = document.createDocumentFragment();
          child.textContent.split(/(\s+)/).forEach(part => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
            const w = document.createElement('span');
            w.className = 'word';
            const inner = document.createElement('span');
            inner.className = 'wi';
            inner.style.setProperty('--wi', wi++);
            if (chars) {
              [...part].forEach(ch => {
                const c = document.createElement('span');
                c.className = 'char';
                c.textContent = ch;
                c.style.setProperty('--ci', ci++);
                inner.appendChild(c);
              });
            } else inner.textContent = part;
            w.appendChild(inner);
            frag.appendChild(w);
          });
          child.replaceWith(frag);
        } else if (child.nodeType === 1) walk(child);
      });
    };
    el.setAttribute('aria-label', el.textContent.trim());
    walk(el);
    $$('.word', el).forEach(w => w.setAttribute('aria-hidden', 'true'));
  });

  /* ---------- launch intro ---------- */
  const intro = $('#intro');
  const startSite = () => document.body.classList.add('ready');
  if (root.classList.contains('intro-run') && intro) {
    const count = $('.intro-count', intro);
    const bar = $('.intro-bar', intro);
    const MIN = 3000, MAX = 5500;
    const t0 = performance.now();
    let loaded = document.readyState === 'complete';
    let done = false;
    window.addEventListener('load', () => { loaded = true; });

    const finish = () => {
      if (done) return;
      done = true;
      count.textContent = 100;
      bar.style.setProperty('--p', 1);
      intro.classList.add('leaving');
      setTimeout(() => { intro.classList.add('out'); }, 350);
      setTimeout(startSite, 550);
      setTimeout(() => { root.classList.remove('intro-run'); intro.remove(); }, 1500);
    };
    const tick = now => {
      if (done) return;
      const t = now - t0;
      let p = Math.min(t / MIN, 1);
      if (!loaded) p = Math.min(p, .92);
      const eased = 1 - Math.pow(1 - p, 2.2);
      count.textContent = Math.round(eased * 100);
      bar.style.setProperty('--p', eased);
      if ((p >= 1 && loaded) || t > MAX) { setTimeout(finish, 250); return; }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    $('.intro-skip', intro).addEventListener('click', finish);
  } else {
    if (intro) intro.remove();
    requestAnimationFrame(startSite);
  }

  /* ---------- reveal on scroll ---------- */
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.classList.add('in');
      io.unobserve(e.target);
    });
  }, { threshold: .15, rootMargin: '0px 0px -40px 0px' });
  $$('[data-reveal], [data-split], .tp').forEach(el => { if (!el.closest('.hero')) io.observe(el); });

  /* ---------- counters ---------- */
  const countUp = el => {
    const target = +el.dataset.count, prefix = el.dataset.prefix || '';
    if (reduced) { el.textContent = prefix + target.toLocaleString('en-IN'); return; }
    const delay = +(el.dataset.delay || 0);
    if (delay) { el.dataset.delay = 0; setTimeout(() => countUp(el), delay); return; }
    const t0 = performance.now(), dur = +(el.dataset.dur || 1600);
    const step = now => {
      const p = Math.min((now - t0) / dur, 1), v = Math.round(target * (1 - Math.pow(1 - p, 3)));
      el.textContent = prefix + v.toLocaleString('en-IN');
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  const cio = new IntersectionObserver(entries => entries.forEach(e => {
    if (e.isIntersecting) { countUp(e.target); cio.unobserve(e.target); }
  }), { threshold: .6 });
  $$('[data-count]').forEach(el => {
    if (!reduced) el.textContent = (el.dataset.prefix || '') + '0';
    cio.observe(el);
  });

  /* ---------- header, progress, active link ---------- */
  const header = $('#siteHeader');
  const nav = $('#mainNav');
  const burger = $('#hamburger');
  let lastY = 0, ticking = false;
  const onScroll = () => {
    const y = scrollY;
    header.classList.toggle('scrolled', y > 30);
    header.classList.toggle('hide', y > 600 && y > lastY && !nav.classList.contains('open'));
    lastY = y;
    const max = document.documentElement.scrollHeight - innerHeight;
    $('.scroll-progress i').style.transform = `scaleX(${max > 0 ? y / max : 0})`;
    ticking = false;
  };
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();

  const links = $$('.main-nav ul a');
  const sio = new IntersectionObserver(entries => entries.forEach(e => {
    if (!e.isIntersecting) return;
    links.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id));
  }), { rootMargin: '-45% 0px -50% 0px' });
  links.forEach(a => { const s = $(a.getAttribute('href')); if (s) sio.observe(s); });

  const setMenu = open => {
    nav.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', open);
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  };
  burger.addEventListener('click', () => setMenu(!nav.classList.contains('open')));
  $$('a', nav).forEach(a => a.addEventListener('click', () => setMenu(false)));
  addEventListener('keydown', e => { if (e.key === 'Escape' && nav.classList.contains('open')) { setMenu(false); burger.focus(); } });

  /* ---------- pointer effects ---------- */
  document.addEventListener('pointermove', e => {
    const s = e.target.closest && e.target.closest('.spot');
    if (!s) return;
    const r = s.getBoundingClientRect();
    s.style.setProperty('--mx', `${e.clientX - r.left}px`);
    s.style.setProperty('--my', `${e.clientY - r.top}px`);
  }, { passive: true });

  if (finePointer && !reduced) {
    // custom cursor
    const dot = $('.cursor-dot'), ring = $('.cursor-ring');
    let mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my;
    addEventListener('pointermove', e => { mx = e.clientX; my = e.clientY; dot.style.transform = `translate(${mx}px,${my}px)`; }, { passive: true });
    const loop = () => { rx += (mx - rx) * .18; ry += (my - ry) * .18; ring.style.transform = `translate(${rx}px,${ry}px)`; requestAnimationFrame(loop); };
    loop();
    document.addEventListener('pointerover', e => ring.classList.toggle('hover', !!e.target.closest('a,button,.cert,input,select,textarea,label')));

    // magnetic buttons
    $$('.magnetic').forEach(b => {
      b.addEventListener('pointermove', e => {
        const r = b.getBoundingClientRect();
        b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .25}px,${(e.clientY - r.top - r.height / 2) * .3}px)`;
      });
      b.addEventListener('pointerleave', () => { b.style.transform = ''; });
    });

    // 3D tilt
    $$('.tilt').forEach(t => {
      t.addEventListener('pointermove', e => {
        const r = t.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
        t.style.transform = `perspective(900px) rotateY(${x * 12}deg) rotateX(${-y * 12}deg)`;
      });
      t.addEventListener('pointerleave', () => { t.style.transform = ''; });
    });

    // hero emblem parallax
    const hero = $('.hero'), emblem = $('#heroEmblem');
    hero.addEventListener('pointermove', e => {
      if (!document.body.classList.contains('ready')) return;
      const x = e.clientX / innerWidth - .5, y = e.clientY / innerHeight - .5;
      emblem.style.transform = `perspective(1000px) rotateY(${x * 22}deg) rotateX(${-y * 22}deg) translate3d(${x * 20}px,${y * 20}px,0)`;
    });
    hero.addEventListener('pointerleave', () => { emblem.style.transform = ''; });
  }

  /* ---------- hero particles ---------- */
  const canvas = $('#heroCanvas');
  if (canvas && !reduced) {
    const ctx = canvas.getContext('2d');
    let w, h, dpr, parts = [], running = true;
    const colors = ['29,91,255', '56,189,248', '11,63,217'];
    const sprites = {};
    colors.forEach(c => {
      const o = document.createElement('canvas');
      o.width = o.height = 32;
      const g = o.getContext('2d'), gr = g.createRadialGradient(16, 16, 0, 16, 16, 16);
      gr.addColorStop(0, `rgba(${c},1)`); gr.addColorStop(.22, `rgba(${c},.9)`); gr.addColorStop(1, `rgba(${c},0)`);
      g.fillStyle = gr; g.fillRect(0, 0, 32, 32);
      sprites[c] = o;
    });
    const resize = () => {
      dpr = Math.min(devicePixelRatio || 1, 1.5);
      w = canvas.clientWidth; h = canvas.clientHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = Math.round(Math.min(70, w * h / 18000));
      parts = Array.from({ length: n }, () => spawn(true));
    };
    const spawn = init => ({
      x: Math.random() * w, y: init ? Math.random() * h : h + 10,
      r: Math.random() * 1.8 + .4, vy: Math.random() * .5 + .15, vx: (Math.random() - .5) * .25,
      c: colors[Math.random() * 3 | 0], a: Math.random() * .6 + .25, tw: Math.random() * Math.PI * 2
    });
    let mouse = { x: -999, y: -999 };
    canvas.parentElement.addEventListener('pointermove', e => { const r = canvas.getBoundingClientRect(); mouse = { x: e.clientX - r.left, y: e.clientY - r.top }; });
    const draw = () => {
      if (!running) return;
      ctx.clearRect(0, 0, w, h);
      for (let i = 0; i < parts.length; i++) {
        const p = parts[i];
        p.y -= p.vy; p.x += p.vx; p.tw += .04;
        const dx = p.x - mouse.x, dy = p.y - mouse.y, d2 = dx * dx + dy * dy;
        if (d2 < 14000) { p.x += dx * .02; p.y += dy * .02; }
        if (p.y < -10) parts[i] = spawn(false);
        const a = p.a * (.6 + Math.sin(p.tw) * .4);
        const sz = p.r * 7;
        ctx.globalAlpha = a;
        ctx.drawImage(sprites[p.c], p.x - sz / 2, p.y - sz / 2, sz, sz);
        ctx.globalAlpha = 1;
        for (let j = i + 1; j < parts.length; j++) {
          const q = parts[j], ex = p.x - q.x, ey = p.y - q.y, e2 = ex * ex + ey * ey;
          if (e2 < 9000) {
            ctx.strokeStyle = `rgba(${p.c},${.18 * (1 - e2 / 9000)})`;
            ctx.lineWidth = .6;
            ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke();
          }
        }
      }
      requestAnimationFrame(draw);
    };
    resize();
    addEventListener('resize', resize);
    new IntersectionObserver(([e]) => {
      const was = running; running = e.isIntersecting && !document.hidden;
      if (running && !was) draw();
    }).observe(canvas);
    document.addEventListener('visibilitychange', () => {
      const was = running; running = !document.hidden;
      if (running && !was) draw();
    });
    draw();
  }

  /* ---------- personal coaching switcher ---------- */
  const months = [1, 4, 6, 8, 12];
  const coaching = {
    offline: { label: 'Offline', desc: 'Train in person at the gym, 1-on-1 with your coach.', prices: [5499, 19799, 28655, 37399, 52799] },
    home:    { label: 'Home',    desc: 'Your coach trains you at your home. No commute, full attention.', prices: [8499, 30799, 45899, 58519, 82699] },
    hybrid:  { label: 'Hybrid',  desc: 'Mix in-person sessions with online guidance for the best of both.', prices: [6499, 22799, 33119, 43199, 61199] },
    online:  { label: 'Online',  desc: 'Plans, check-ins and doubt support from anywhere.', prices: [2499, 8999, 13119, 16999, 23999] }
  };
  const tbody = $('#priceTable tbody');
  const tabs = $$('.mode-tabs [role=tab]');
  const ind = $('.mode-ind');
  const modeCta = $('#modeCta');
  let current = 'offline', prev = null;

  tbody.innerHTML = months.map((m, i) =>
    `<tr style="--r:${i}"><td>${m} Month${m > 1 ? 's' : ''}</td><td>-</td><td>-</td></tr>`).join('');
  const rows = $$('tr', tbody);

  const tween = (el, from, to, fmt) => {
    if (reduced || from === null) { el.textContent = fmt(to); return; }
    const t0 = performance.now(), dur = 650;
    const step = now => {
      const p = Math.min((now - t0) / dur, 1), e = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt(from + (to - from) * e);
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  const moveInd = () => {
    const t = tabs.find(b => b.dataset.mode === current);
    ind.style.width = t.offsetWidth + 'px';
    ind.style.transform = `translateX(${t.offsetLeft}px)`;
  };
  const setMode = mode => {
    const data = coaching[mode];
    current = mode;
    tabs.forEach(b => {
      const on = b.dataset.mode === mode;
      b.setAttribute('aria-selected', on);
      b.tabIndex = on ? 0 : -1;
    });
    moveInd();
    $('#modeDesc').textContent = data.desc;
    modeCta.firstChild.textContent = `Book ${data.label} Coaching `;
    rows.forEach((tr, i) => {
      const [, tot, per] = tr.children;
      tween(tot, prev ? prev.prices[i] : null, data.prices[i], inr);
      tween(per, prev ? prev.prices[i] / months[i] : null, data.prices[i] / months[i], v => inr(v) + '/mo');
      tr.classList.remove('flash'); void tr.offsetWidth; tr.classList.add('flash');
    });
    prev = data;
  };
  tabs.forEach((b, i) => {
    b.addEventListener('click', () => setMode(b.dataset.mode));
    b.addEventListener('keydown', e => {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      const n = tabs[(i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length];
      n.focus(); setMode(n.dataset.mode);
    });
  });
  addEventListener('resize', moveInd);
  setMode('offline');
  if (document.fonts) document.fonts.ready.then(moveInd);

  modeCta.addEventListener('click', () => {
    const sel = $('#contactForm select[name=program]');
    sel.value = `Personal Coaching — ${coaching[current].label}`;
  });

  /* ---------- lightbox ---------- */
  const lb = $('#lightbox');
  const lbImg = $('img', lb), lbCap = $('figcaption', lb);
  let group = [], gi = 0;
  const show = () => {
    const it = group[gi];
    lbImg.src = it.src; lbImg.alt = it.cap; lbCap.textContent = it.cap;
    lbImg.style.animation = 'none'; void lbImg.offsetWidth; lbImg.style.animation = '';
  };
  const openLb = (items, i) => { group = items; gi = i; show(); lb.showModal(); };
  const step = d => { gi = (gi + d + group.length) % group.length; show(); };
  $('.lb-close', lb).addEventListener('click', () => lb.close());
  $('.lb-prev', lb).addEventListener('click', () => step(-1));
  $('.lb-next', lb).addEventListener('click', () => step(1));
  lb.addEventListener('click', e => { if (e.target === lb) lb.close(); });
  lb.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight') step(1);
    if (e.key === 'ArrowLeft') step(-1);
  });
  const flyerBtns = $$('[data-lb=flyers]');
  const flyers = flyerBtns.map(b => ({ src: b.dataset.src, cap: b.dataset.cap }));
  flyerBtns.forEach((b, i) => b.addEventListener('click', () => openLb(flyers, i)));

  /* ---------- certificate coverflow ---------- */
  const certs = [
    ['01-apex-elite-personal-trainer', 'Elite Personal Trainer — APEX'],
    ['02-fat-loss-specialist', 'Fat Loss Specialist'],
    ['03-advanced-diet-nutrition', 'Advanced Diet & Nutrition'],
    ['04-lifestyle-transformation', 'Lifestyle Transformation Expert'],
    ['05-supplements-expert', 'Supplements Expert'],
    ['06-natural-bodybuilding', 'Natural Bodybuilding Specialist'],
    ['07-contest-prep', 'Bodybuilding Contest Prep Specialist'],
    ['08-strength-conditioning', 'Strength & Conditioning Specialist'],
    ['09-special-population', 'Special Population Specialist'],
    ['10-female-transformation', 'Female Transformation Specialist'],
    ['11-injury-first-aid', 'Injury Management & First Aid'],
    ['12-exercise-science-practicals', 'Exercise & Science — Practicals'],
    ['13-exercise-science-appreciation', 'Exercise & Science — Appreciation']
  ].map(([f, cap]) => ({ src: `assets/certs/${f}.jpg`, cap }));

  const track = $('#certTrack');
  track.innerHTML = certs.map((c, i) =>
    `<button type="button" class="cert" data-i="${i}" aria-label="View certificate: ${c.cap}">
       <img src="${c.src}" alt="" loading="lazy" draggable="false" width="760" height="1076"><span class="cap">${c.cap}</span>
     </button>`).join('');
  const cards = $$('.cert', track);

  let cfTick = false;
  const coverflow = () => {
    const tr = track.getBoundingClientRect(), mid = tr.left + tr.width / 2;
    cards.forEach(c => {
      const r = c.getBoundingClientRect();
      const d = Math.max(-3, Math.min(3, (r.left + r.width / 2 - mid) / (r.width + 22)));
      const ad = Math.abs(d);
      c.style.transform = reduced ? '' :
        `rotateY(${-d * 16}deg) scale(${1 - Math.min(ad, 2) * .08}) translateZ(${-ad * 30}px)`;
      c.style.opacity = 1 - Math.min(ad, 3) * .12;
      c.style.zIndex = 10 - Math.round(ad);
      c.classList.toggle('center', ad < .5);
    });
    cfTick = false;
  };
  track.addEventListener('scroll', () => { if (!cfTick) { cfTick = true; requestAnimationFrame(coverflow); } }, { passive: true });
  addEventListener('resize', coverflow);
  coverflow();
  $$('img', track).forEach(img => img.addEventListener('load', coverflow, { once: true }));

  const stepW = () => cards[0].offsetWidth + parseFloat(getComputedStyle(track).columnGap || 36);
  // start centred on the middle certificate
  const centreMiddle = () => {
    track.style.scrollSnapType = 'none';
    track.scrollLeft = Math.floor(cards.length / 2) * stepW();
    track.style.scrollSnapType = '';
    coverflow();
  };
  centreMiddle();
  if (document.fonts) document.fonts.ready.then(() => { if (track.scrollLeft === 0) centreMiddle(); });
  $('#certPrev').addEventListener('click', () => track.scrollBy({ left: -stepW(), behavior: 'smooth' }));
  $('#certNext').addEventListener('click', () => track.scrollBy({ left: stepW(), behavior: 'smooth' }));
  track.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight') { e.preventDefault(); track.scrollBy({ left: stepW(), behavior: 'smooth' }); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); track.scrollBy({ left: -stepW(), behavior: 'smooth' }); }
  });

  // mouse drag (touch scrolls natively)
  let drag = null, moved = false;
  track.addEventListener('pointerdown', e => {
    if (e.pointerType !== 'mouse' || e.button !== 0) return;
    drag = { x: e.clientX, left: track.scrollLeft }; moved = false;
  });
  addEventListener('pointermove', e => {
    if (!drag) return;
    const dx = e.clientX - drag.x;
    if (Math.abs(dx) > 5 && !moved) { moved = true; track.classList.add('dragging'); }
    if (moved) track.scrollLeft = drag.left - dx;
  });
  addEventListener('pointerup', () => {
    if (!drag) return;
    drag = null;
    if (moved) {
      track.classList.remove('dragging');
      // snap to nearest after drag
      const i = Math.round(track.scrollLeft / stepW());
      track.scrollTo({ left: i * stepW(), behavior: 'smooth' });
    }
  });
  cards.forEach((c, i) => c.addEventListener('click', e => {
    if (moved) { e.preventDefault(); moved = false; return; }
    if (!c.classList.contains('center')) {
      track.scrollTo({ left: i * stepW(), behavior: 'smooth' });
      return;
    }
    openLb(certs, i);
  }));

  /* ---------- BMI gauge ---------- */
  const NS = 'http://www.w3.org/2000/svg';
  const CX = 150, CY = 150, R = 110, LO = 10, HI = 40;
  const pt = (b, r = R) => {
    const t = Math.PI * (1 - (b - LO) / (HI - LO));
    return [CX + r * Math.cos(t), CY - r * Math.sin(t)];
  };
  const zones = [[LO, 18.5, '#38bdf8'], [18.5, 25, '#22c55e'], [25, 30, '#f59e0b'], [30, HI, '#ef4444']];
  const arcs = $('#gaugeArcs'), ticks = $('#gaugeTicks');
  zones.forEach(([a, b, col], i) => {
    const [x1, y1] = pt(a + (i ? .25 : 0)), [x2, y2] = pt(b - (i < 3 ? .25 : 0));
    const p = document.createElementNS(NS, 'path');
    p.setAttribute('d', `M${x1} ${y1} A${R} ${R} 0 0 1 ${x2} ${y2}`);
    p.setAttribute('class', 'arc');
    p.setAttribute('stroke', col);
    p.style.filter = `drop-shadow(0 0 6px ${col})`;
    arcs.appendChild(p);
  });
  [10, 15, 18.5, 25, 30, 35, 40].forEach(b => {
    const [x1, y1] = pt(b, R - 16), [x2, y2] = pt(b, R - 24), [lx, ly] = pt(b, R + 22);
    const l = document.createElementNS(NS, 'line');
    l.setAttribute('x1', x1); l.setAttribute('y1', y1); l.setAttribute('x2', x2); l.setAttribute('y2', y2);
    l.setAttribute('class', 'tick');
    const t = document.createElementNS(NS, 'text');
    t.setAttribute('x', lx); t.setAttribute('y', ly + 3); t.setAttribute('class', 'tick-l');
    t.textContent = b;
    ticks.append(l, t);
  });

  const needle = $('#needle'), bmiVal = $('#bmiVal'), bmiCat = $('#bmiCat');
  let lastBmi = null;
  $('#bmiForm').addEventListener('submit', e => {
    e.preventDefault();
    const h = parseFloat($('#bmiH').value) / 100, w = parseFloat($('#bmiW').value);
    if (!h || !w) return;
    const bmi = w / (h * h);
    const [cat, col] = bmi < 18.5 ? ['Underweight', '#0ea5e9'] : bmi < 25 ? ['Healthy weight', '#22c55e'] : bmi < 30 ? ['Overweight', '#f59e0b'] : ['Obese', '#ef4444'];
    const clamped = Math.max(LO, Math.min(HI, bmi));
    needle.style.transform = `rotate(${-90 + 180 * (clamped - LO) / (HI - LO)}deg)`;
    bmiVal.style.color = col;
    bmiCat.textContent = cat;
    bmiCat.style.color = col;
    tween(bmiVal, lastBmi ?? 0, bmi, v => v.toFixed(1));
    lastBmi = bmi;
  });

  /* ---------- contact → WhatsApp ---------- */
  $('#contactForm').addEventListener('submit', e => {
    e.preventDefault();
    const f = new FormData(e.target);
    const lines = [
      `Hi NORAA Elite Fitness! I'm ${f.get('name').trim()}.`,
      `I'm interested in: ${f.get('program')}.`,
      f.get('msg').trim() && `Goal: ${f.get('msg').trim()}`,
      f.get('phone').trim() && `My number: ${f.get('phone').trim()}`
    ].filter(Boolean);
    window.open(`https://wa.me/${WA}?text=${encodeURIComponent(lines.join('\n'))}`, '_blank', 'noopener');
  });
})();
