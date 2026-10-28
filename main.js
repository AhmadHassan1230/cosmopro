// Cosmopro · runtime: smooth scroll, reveals, header, video, range index, process story, lightbox, forms.
const root = document.documentElement;
const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const narrow = () => innerWidth < 960;
const cfg = JSON.parse($('#cfg')?.textContent || '{}');
const { gsap, ScrollTrigger, Lenis } = window;

// ---------- smooth scroll ----------
let lenis = null;
if (gsap && ScrollTrigger) {
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });
}
if (Lenis && !reduced) {
  lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
  if (gsap && ScrollTrigger) {
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  } else {
    const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
  }
}
window.__lenis = lenis;
const scrollTo = (target) => (lenis ? lenis.scrollTo(target, { offset: 0, duration: 1.4 }) : target.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' }));

// ---------- header ----------
const hd = $('[data-hd]');
const isHome = document.body.classList.contains('p-home');
let lastY = 0;
const onScroll = () => {
  const y = lenis ? lenis.scroll : scrollY;
  const pastHero = isHome ? y > innerHeight * 0.82 : y > 24;
  hd.classList.toggle('is-solid', pastHero);
  const goingDown = y > lastY + 2;
  const goingUp = y < lastY - 2;
  if (y > 240 && goingDown && !root.classList.contains('menu-open')) hd.classList.add('is-hidden');
  else if (goingUp || y < 240) hd.classList.remove('is-hidden');
  lastY = y;
};
if (lenis) lenis.on('scroll', onScroll); else addEventListener('scroll', onScroll, { passive: true });
onScroll();

// ---------- mobile menu ----------
const menuBtn = $('[data-menu-btn]');
const menu = $('[data-menu]');
const setMenu = (open) => {
  root.classList.toggle('menu-open', open);
  menuBtn.setAttribute('aria-expanded', String(open));
  menu.setAttribute('aria-hidden', String(!open));
  $('.hd-menu-l', menuBtn).textContent = open ? 'Close' : 'Menu';
  if (lenis) open ? lenis.stop() : lenis.start();
  if (open) $('a', menu)?.focus({ preventScroll: true });
};
menuBtn?.addEventListener('click', () => setMenu(!root.classList.contains('menu-open')));
addEventListener('keydown', (e) => { if (e.key === 'Escape' && root.classList.contains('menu-open')) { setMenu(false); menuBtn.focus(); } });
addEventListener('resize', () => { if (!narrow() && root.classList.contains('menu-open')) setMenu(false); });

// ---------- reveals ----------
$$('[data-split], [data-hero-title]').forEach((el) => $$('.w', el).forEach((w, i) => w.style.setProperty('--wi', i)));
const io = new IntersectionObserver((entries) => {
  entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } });
}, { rootMargin: '0px 0px -8% 0px', threshold: 0.01 });
$$('[data-split], [data-reveal]').forEach((el) => io.observe(el));
// A fully clipped element never reports as visible, so media frames are watched through their parent.
const mio = new IntersectionObserver((entries) => {
  entries.forEach((e) => { if (e.isIntersecting) { e.target.__media.forEach((m) => m.classList.add('is-in')); mio.unobserve(e.target); } });
}, { rootMargin: '0px 0px -8% 0px' });
$$('[data-media]').forEach((m) => {
  const host = m.parentElement;
  (host.__media ||= []).push(m);
  if (host.__media.length === 1) mio.observe(host);
});

// ---------- video (Flow loops, optional) ----------
// <video data-video="assets/video/name"> loads name.mp4, or name-mobile.mp4 on narrow screens when the build found one.
// The build only writes the tag when the file exists, so until then the poster image is all you see.
const loadVideo = (v) => {
  if (v.dataset.loaded) return;
  v.dataset.loaded = '1';
  const base = v.dataset.video;
  const q = v.dataset.v ? '?v=' + v.dataset.v : '';
  const tries = narrow() && 'm' in v.dataset ? [base + '-mobile.mp4' + q, base + '.mp4' + q] : [base + '.mp4' + q];
  let i = 0;
  const next = () => { if (i < tries.length) { v.src = tries[i++]; v.load(); } };
  v.addEventListener('error', next);
  v.addEventListener('playing', () => v.classList.add('is-playing'), { once: true });
  v.addEventListener('canplay', () => { if (v.dataset.want === '1') v.play().catch(() => {}); });
  next();
};
const playVideo = (v) => { if (reduced) return; v.dataset.want = '1'; loadVideo(v); v.play?.().catch(() => {}); };
const pauseVideo = (v) => { v.dataset.want = '0'; if (!v.paused) v.pause(); };
const vio = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    const v = e.target;
    if (v.closest('[data-rng-f]') && !v.closest('.is-on')) return; // range stage handles its own
    e.isIntersecting ? playVideo(v) : pauseVideo(v);
  });
}, { rootMargin: '200px 0px' });
$$('video[data-video]').forEach((v) => vio.observe(v));

// ---------- hero ----------
const hero = $('[data-hero]');
if (hero) {
  const title = $('[data-hero-title]', hero);
  const side = $$('[data-hero-side]', hero);
  if (!reduced && gsap) gsap.set(side, { opacity: 0, y: 24 });
  const intro = () => {
    title.classList.add('is-in');
    if (!reduced && gsap) gsap.to(side, { opacity: 1, y: 0, duration: 1.2, ease: 'expo.out', delay: 0.55, stagger: 0.1 });
  };
  document.fonts?.ready.then(() => requestAnimationFrame(intro)) ?? intro();
  if (!reduced && gsap && ScrollTrigger) {
    const st = { trigger: hero, start: 'top top', end: 'bottom top', scrub: true };
    gsap.to($('[data-hero-media]', hero), { yPercent: 12, scale: 1.08, ease: 'none', scrollTrigger: st });
    gsap.to($('[data-hero-frame]', hero), { scale: 0.94, ease: 'none', scrollTrigger: st });
    gsap.to([$('.hero-in', hero), $('.hero-foot', hero)], { y: -70, opacity: 0, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: '60% top', scrub: true } });
    // entrance: the frame settles in as the footage fades up
    gsap.from($('[data-hero-frame]', hero), { scale: 1.035, duration: 1.8, ease: 'expo.out' });
  }
}

// ---------- range index (home) ----------
const rng = $('[data-rng]');
if (rng) {
  const links = $$('[data-rng-i]', rng);
  const frames = $$('[data-rng-f]', rng);
  let active = 0;
  const show = (i) => {
    if (i === active) return;
    links[active].classList.remove('is-on'); frames[active].classList.remove('is-on');
    const old = $('video', frames[active]); if (old) pauseVideo(old);
    active = i;
    links[i].classList.add('is-on'); frames[i].classList.add('is-on');
    const v = $('video', frames[i]); if (v && !narrow()) playVideo(v);
  };
  links.forEach((a, i) => { a.addEventListener('mouseenter', () => !narrow() && show(i)); a.addEventListener('focus', () => show(i)); });
  const first = $('video', frames[0]);
  if (first) new IntersectionObserver(([e]) => { if (e.isIntersecting && active === 0 && !narrow()) playVideo(first); }, { rootMargin: '200px 0px' }).observe(rng);
}

// ---------- process story ----------
const proc = $('[data-proc]');
if (proc) {
  const steps = $$('[data-proc-s]', proc);
  const bar = $('[data-proc-bar]', proc);
  const num = $('[data-proc-num]', proc);
  const canvas = $('[data-proc-canvas]', proc);
  let scene3d = null;
  let cur = -1;
  let lastP = 0;
  const setStage = (p) => {
    lastP = p;
    const i = Math.min(steps.length - 1, Math.floor(p * steps.length));
    if (bar) bar.style.transform = `scaleX(${p.toFixed(4)})`;
    scene3d?.setProgress(p);
    if (i === cur) return;
    steps[cur]?.classList.remove('is-on');
    steps[i].classList.add('is-on');
    num.textContent = String(i + 1).padStart(2, '0');
    cur = i;
  };
  setStage(0);

  if (gsap && ScrollTrigger) {
    ScrollTrigger.create({
      trigger: proc,
      start: 'top top',
      end: () => '+=' + Math.round(innerHeight * (narrow() ? 4 : 4.6)),
      pin: true,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      onUpdate: (self) => setStage(self.progress),
    });
  }

  const boot = async () => {
    try {
      const probe = document.createElement('canvas');
      if (!(probe.getContext('webgl2') || probe.getContext('webgl'))) throw new Error('no webgl');
      const mod = await import('./process3d.js');
      scene3d = await mod.createProcess(canvas, { reduced });
      scene3d.setProgress(lastP);
      new IntersectionObserver(([e]) => scene3d.setActive(e.isIntersecting), { rootMargin: '100px 0px' }).observe(proc);
    } catch (err) {
      console.warn('[cosmopro] process scene fallback:', err.message);
      root.classList.add('no-webgl');
    }
  };
  const bootIO = new IntersectionObserver(([e]) => { if (e.isIntersecting) { bootIO.disconnect(); boot(); } }, { rootMargin: '150% 0px' });
  bootIO.observe(proc);
}

// ---------- in-page anchors ----------
$$('a[href^="#"]').forEach((a) => a.addEventListener('click', (e) => {
  const t = a.getAttribute('href').length > 1 && $(a.getAttribute('href'));
  if (t) { e.preventDefault(); scrollTo(t); }
}));
if (location.hash) {
  const t = $(location.hash);
  if (t) addEventListener('load', () => setTimeout(() => scrollTo(t), 80), { once: true });
}

// ---------- lightbox ----------
const lb = $('[data-lb]');
let lbReturn = null;
const lbClose = () => { lb.classList.remove('is-open'); lb.setAttribute('aria-hidden', 'true'); lenis?.start(); lbReturn?.focus(); };
$$('[data-lb-open]').forEach((b) => b.addEventListener('click', () => {
  lbReturn = b;
  const im = $('img', lb); im.src = b.dataset.lbOpen; im.alt = b.getAttribute('aria-label')?.replace('View ', '') || '';
  lb.classList.add('is-open'); lb.setAttribute('aria-hidden', 'false'); lenis?.stop();
  $('[data-lb-close]', lb).focus();
}));
lb?.addEventListener('click', (e) => { if (e.target === lb || e.target.closest('[data-lb-close]')) lbClose(); });
addEventListener('keydown', (e) => { if (e.key === 'Escape' && lb?.classList.contains('is-open')) lbClose(); });

// ---------- forms ----------
const labelOf = (el) => {
  const fs = el.closest('fieldset');
  if (fs) return $('legend', fs).textContent.trim();
  return ($(`label[for="${el.id}"]`)?.childNodes[0]?.textContent || el.name).trim();
};
const setErr = (wrap, msg) => {
  if (!wrap) return;
  wrap.classList.toggle('is-bad', !!msg);
  const p = $('.f-err', wrap); if (p) p.textContent = msg || '';
};
const validate = (form) => {
  let firstBad = null;
  $$('input[required], select[required], textarea[required]', form).forEach((el) => {
    if (el.type === 'radio') return;
    const wrap = el.closest('.f');
    let msg = '';
    if (!el.value.trim()) msg = el.tagName === 'SELECT' ? 'Choose an option.' : `Add your ${labelOf(el).toLowerCase()}.`;
    else if (el.type === 'email' && !el.validity.valid) msg = 'Enter an email address like name@company.com.';
    else if (el.type === 'number' && !el.validity.valid) msg = 'Enter a number.';
    setErr(wrap, msg);
    if (msg && !firstBad) firstBad = el;
  });
  const radioNames = [...new Set($$('input[type=radio][required]', form).map((r) => r.name))];
  radioNames.forEach((n) => {
    const ok = $$(`input[name="${n}"]`, form).some((r) => r.checked);
    const wrap = $(`input[name="${n}"]`, form).closest('.f');
    setErr(wrap, ok ? '' : 'Choose one option.');
    if (!ok && !firstBad) firstBad = $(`input[name="${n}"]`, form);
  });
  $$('[data-req-group]', form).forEach((g) => {
    const ok = $$('input', g).some((c) => c.checked);
    setErr(g, ok ? '' : 'Choose at least one.');
    if (!ok && !firstBad) firstBad = $('input', g);
  });
  return firstBad;
};
const summary = (form) => {
  const out = [];
  const seen = new Set();
  $$('input, select, textarea', form).forEach((el) => {
    if (!el.name || seen.has(el.name) || el.name === 'marketing') return;
    seen.add(el.name);
    let val;
    if (el.type === 'checkbox' || el.type === 'radio') val = $$(`input[name="${el.name}"]:checked`, form).map((c) => c.value).join(', ');
    else val = el.value.trim();
    if (val) out.push(`${labelOf(el)}: ${val}`);
  });
  const mk = $('input[name="marketing"]', form);
  if (mk) out.push(`Updates: ${mk.checked ? 'yes' : 'no'}`);
  return out.join('\n');
};
const titleOf = (form) => {
  const fd = new FormData(form);
  if (form.dataset.form === 'enquiry') return `Project enquiry: ${fd.get('company') || ''} (${fd.get('first_name') || ''} ${fd.get('last_name') || ''})`.trim();
  return `Website message: ${fd.get('subject') || 'General'} from ${fd.get('name') || ''}`;
};
const done = (form, msg) => {
  form.classList.add('is-done');
  const d = $('[data-form-done]', form); d.hidden = false;
  $('[data-form-done-msg]', d).innerHTML = msg;
  scrollTo(form);
  d.focus({ preventScroll: true });
};
$$('form[data-form]').forEach((form) => {
  form.addEventListener('input', (e) => { const w = e.target.closest('.f'); if (w?.classList.contains('is-bad')) setErr(w, ''); });
  form.addEventListener('change', (e) => { const w = e.target.closest('.f'); if (w?.classList.contains('is-bad')) setErr(w, ''); });
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const bad = validate(form);
    const ferr = $('.f-err-form', form);
    if (bad) { ferr.textContent = 'A few details are missing. They are marked above.'; scrollTo(bad.closest('.f') || bad); setTimeout(() => bad.focus({ preventScroll: true }), 600); return; }
    ferr.textContent = '';
    const subject = titleOf(form);
    const body = summary(form);
    if (cfg.endpoint) {
      form.classList.add('is-sending');
      try {
        const fd = new FormData(form); fd.append('_subject', subject);
        const r = await fetch(cfg.endpoint, { method: 'POST', body: fd, headers: { Accept: 'application/json' } });
        if (!r.ok) throw new Error(r.status);
        done(form, 'We have your message and will reply soon. For anything urgent, call <a class="link" href="tel:+923248592259">+92 324 8592259</a>.');
      } catch {
        ferr.innerHTML = `The message could not be sent. Email <a class="link" href="mailto:${cfg.email}">${cfg.email}</a> instead.`;
      } finally { form.classList.remove('is-sending'); }
      return;
    }
    const mail = `mailto:${cfg.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    location.href = mail;
    done(form, `Your email app should now open with everything filled in. Press send to reach us. If nothing opened, <a class="link" href="${mail}">try again</a> or <a class="link" href="https://wa.me/${cfg.whatsapp}?text=${encodeURIComponent(subject + '\n\n' + body)}" target="_blank" rel="noopener">send it on WhatsApp</a>.`);
  });
  $('[data-form-wa]', form)?.addEventListener('click', () => {
    const bad = validate(form);
    if (bad) { $('.f-err-form', form).textContent = 'A few details are missing. They are marked above.'; scrollTo(bad.closest('.f') || bad); return; }
    open(`https://wa.me/${cfg.whatsapp}?text=${encodeURIComponent(titleOf(form) + '\n\n' + summary(form))}`, '_blank', 'noopener');
  });
});
// Prefill from links like enquire.html?service=toll or ?product=Serums
const q = new URLSearchParams(location.search);
const enq = $('form[data-form="enquiry"]');
if (enq) {
  const svc = q.get('service');
  if (svc) {
    const map = { 'private-label': 'Private label', contract: 'Contract manufacturing', toll: 'Toll manufacturing' };
    const sel = $('select[name="service"]', enq); if (sel && map[svc]) sel.value = map[svc];
  }
  const prod = q.get('product');
  if (prod) $('input[name="product"]', enq).value = prod;
}

// ---------- page fade ----------
const ready = () => document.body.classList.add('is-ready');
document.fonts?.ready.then(ready) ?? ready();
setTimeout(ready, 900);
addEventListener('pageshow', (e) => { if (e.persisted) { document.body.classList.remove('is-leaving'); ready(); } });
document.addEventListener('click', (e) => {
  const a = e.target.closest('a[href]');
  if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || a.target === '_blank') return;
  const url = new URL(a.href, location.href);
  if (url.origin !== location.origin || /^(mailto|tel):/.test(a.href)) return;
  if (url.pathname === location.pathname && url.hash) return;
  if (reduced) return;
  e.preventDefault();
  if (root.classList.contains('menu-open')) setMenu(false);
  document.body.classList.add('is-leaving');
  setTimeout(() => { location.href = url.href; }, 340);
});

$$('[data-year]').forEach((el) => { el.textContent = new Date().getFullYear(); });
addEventListener('load', () => ScrollTrigger?.refresh());
