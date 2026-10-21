// Progressive enhancement only. The site works without this file.

/* 1. Measurement with consent. Google Analytics 4 and the Meta Pixel load only when
      content/site.json has an id AND the visitor accepted the cookie notice. */
const ga4 = document.querySelector('meta[name="x-ga4"]')?.content;
const pixel = document.querySelector('meta[name="x-meta-pixel"]')?.content;
const CONSENT_KEY = 'equimedpr-consent';
const store = {
  get() { try { return localStorage.getItem(CONSENT_KEY); } catch { return null; } },
  set(v) { try { localStorage.setItem(CONSENT_KEY, v); } catch { /* private mode */ } },
  clear() { try { localStorage.removeItem(CONSENT_KEY); } catch { /* ignore */ } },
};
let loaded = false;
function loadAnalytics() {
  if (loaded) return;
  loaded = true;
  if (ga4) {
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', ga4, { anonymize_ip: true });
    const s = document.createElement('script');
    s.async = true;
    s.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(ga4)}`;
    document.head.append(s);
  }
  if (pixel) {
    const f = (window.fbq = function () { f.callMethod ? f.callMethod.apply(f, arguments) : f.queue.push(arguments); });
    f.queue = []; f.loaded = true; f.version = '2.0';
    const s = document.createElement('script');
    s.async = true;
    s.src = 'https://connect.facebook.net/en_US/fbevents.js';
    document.head.append(s);
    window.fbq('init', pixel);
    window.fbq('track', 'PageView');
  }
}
function track(name, params = {}) {
  if (window.gtag) window.gtag('event', name, params);
  if (window.fbq) window.fbq('trackCustom', name, params);
}

const consent = document.getElementById('consent');
if (consent && (ga4 || pixel)) {
  const choice = store.get();
  if (choice === 'accepted') loadAnalytics();
  else if (choice !== 'rejected') consent.hidden = false;
  consent.addEventListener('click', (e) => {
    const b = e.target.closest('[data-consent]');
    if (!b) return;
    store.set(b.dataset.consent === 'accept' ? 'accepted' : 'rejected');
    consent.hidden = true;
    if (b.dataset.consent === 'accept') loadAnalytics();
  });
}
document.querySelector('[data-consent="reset"]')?.addEventListener('click', () => {
  store.clear();
  if (consent) consent.hidden = false;
  else location.reload();
});

/* 2. Lead tracking: WhatsApp, phone and e-mail clicks, wherever they are. */
document.addEventListener('click', (e) => {
  const a = e.target.closest('a[href]');
  if (!a) return;
  const href = a.getAttribute('href') ?? '';
  const name = a.dataset.track ?? (href.includes('wa.me') ? 'whatsapp_click' : href.startsWith('tel:') ? 'phone_click' : href.startsWith('mailto:') ? 'email_click' : null);
  if (!name) return;
  const params = { place: a.dataset.place ?? 'inline', page_path: location.pathname };
  track(name, params);
  if (name === 'whatsapp_click' || name === 'phone_click') track('generate_lead', { method: name.replace('_click', ''), ...params });
});

/* 3. Contact form: compose a WhatsApp or e-mail message from the fields. No data leaves the browser. */
const form = document.getElementById('contact-form');
if (form) {
  const params = new URLSearchParams(location.search);
  const presetProduct = params.get('produto');
  if (presetProduct) {
    form.elements.equipamento.value = presetProduct;
    form.elements.assunto.value = 'Compra';
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const via = event.submitter?.value ?? 'whatsapp';
    const f = form.elements;
    const lines = [
      `Olá, EquimedPR! Vim pelo site.`,
      ``,
      `Nome: ${f.nome.value.trim()}`,
      f.empresa.value.trim() && `Empresa: ${f.empresa.value.trim()}`,
      `Telefone: ${f.telefone.value.trim()}`,
      `Preciso de: ${f.assunto.value}`,
      f.equipamento.value.trim() && `Equipamento: ${f.equipamento.value.trim()}`,
      ``,
      f.mensagem.value.trim(),
    ].filter((l) => l !== false);
    const text = lines.join('\n');
    track('form_submit', { via, subject: f.assunto.value, page_path: location.pathname });
    track('generate_lead', { method: `form_${via}` });

    if (via === 'email') {
      const subject = `[Site] ${f.assunto.value}${f.equipamento.value.trim() ? ` - ${f.equipamento.value.trim()}` : ''}`;
      location.href = `mailto:${form.dataset.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`;
    } else {
      window.open(`https://wa.me/${form.dataset.whatsapp}?text=${encodeURIComponent(text)}`, '_blank', 'noopener');
    }
  });
}

/* 4. Close the mobile menu when a link inside it is activated. */
const menu = document.getElementById('site-menu');
menu?.addEventListener('click', (event) => {
  if (event.target.closest('a')) menu.hidePopover?.();
});

/* 5. Header galleries: arrows and dots over a CSS scroll-snap track. */
for (const g of document.querySelectorAll('[data-gallery]')) {
  const track = g.querySelector('.gallery__track');
  const dots = [...g.querySelectorAll('.gallery__dot')];
  const count = dots.length;
  const index = () => Math.round(track.scrollLeft / track.clientWidth);
  const go = (i) => track.scrollTo({ left: ((i + count) % count) * track.clientWidth, behavior: 'smooth' });
  g.querySelectorAll('.gallery__btn').forEach((b) => b.addEventListener('click', () => go(index() + Number(b.dataset.dir))));
  dots.forEach((d) => d.addEventListener('click', () => go(Number(d.dataset.index))));
  track.addEventListener('scroll', () => { const i = index(); dots.forEach((d, k) => d.classList.toggle('is-active', k === i)); }, { passive: true });
}

/* 6. Motion (home and header). Everything below is decoration: the page reads the same without it,
      and prefers-reduced-motion turns it into a still frame. */
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

// Title: words rise one by one.
const words = $('[data-words]');
if (words && !reduce) {
  words.innerHTML = words.textContent.trim().split(/\s+/).map((w, i) => `<span class="w"><span style="--i:${i}">${w}</span></span>`).join(' ');
}

// ECG monitor sweeping the bottom of the hero.
function monitor(canvas) {
  const g = canvas.getContext('2d');
  const dpr = Math.min(2, devicePixelRatio || 1);
  let W = 0, H = 0, base = 0, amp = 0, beat = 0, buf = new Float32Array(0), head = 0, last = performance.now(), visible = true, travelled = 0;
  const wave = (t, k) => {
    if (t > 0.1 && t < 0.2) return 0.12 * Math.sin((Math.PI * (t - 0.1)) / 0.1);
    if (t >= 0.26 && t < 0.29) return (-0.14 * (t - 0.26)) / 0.03;
    if (t >= 0.29 && t < 0.315) return -0.14 + (1.14 * k * (t - 0.29)) / 0.025;
    if (t >= 0.315 && t < 0.345) return 1 * k - ((1 * k + 0.3) * (t - 0.315)) / 0.03;
    if (t >= 0.345 && t < 0.375) return -0.3 + (0.3 * (t - 0.345)) / 0.03;
    if (t > 0.5 && t < 0.68) return 0.24 * Math.sin((Math.PI * (t - 0.5)) / 0.18);
    return 0;
  };
  const gains = Array.from({ length: 64 }, () => 0.86 + Math.random() * 0.2);
  const sample = (x) => wave((x % beat) / beat, gains[Math.floor(x / beat) % 64]) + (Math.random() - 0.5) * 0.012;
  function size() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    canvas.width = w * dpr; canvas.height = h * dpr; g.setTransform(dpr, 0, 0, dpr, 0, 0);
    W = w; H = h; base = h * 0.7; amp = Math.min(62, h * 0.4); beat = Math.max(180, Math.min(300, w / 5));
    const old = buf; buf = new Float32Array(Math.ceil(W)).fill(NaN);
    buf.set(old.subarray(0, Math.min(old.length, buf.length)));
  }
  size(); addEventListener('resize', size);
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; last = performance.now(); }).observe(canvas);
  const GAP = 46;
  function render() {
    g.clearRect(0, 0, W, H); g.lineJoin = 'round'; g.lineCap = 'round';
    for (let x0 = 0; x0 < W; x0 += 6) {
      const ahead = (x0 - head + W) % W;
      if (ahead < GAP) continue;
      const a = Math.max(0.08, 1 - ((W - ahead) / W) * 0.9);
      g.beginPath(); let on = false;
      for (let x = x0; x <= Math.min(W - 1, x0 + 6); x++) {
        const v = buf[x]; if (Number.isNaN(v)) { on = false; continue; }
        const y = base - v * amp; if (on) g.lineTo(x, y); else { g.moveTo(x, y); on = true; }
      }
      g.strokeStyle = `rgba(91,184,224,${a.toFixed(3)})`; g.lineWidth = 2;
      g.shadowColor = `rgba(91,184,224,${(a * 0.8).toFixed(3)})`; g.shadowBlur = 8 * a; g.stroke();
    }
    const hv = buf[Math.floor(head) % buf.length];
    if (!Number.isNaN(hv)) { g.shadowBlur = 18; g.shadowColor = 'rgba(160,215,240,1)'; g.fillStyle = '#EAF6FC'; g.beginPath(); g.arc(head, base - hv * amp, 3, 0, Math.PI * 2); g.fill(); }
    g.shadowBlur = 0;
  }
  return {
    tick(now) {
      if (!visible) return;
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      const to = head + Math.max(220, W / 5.5) * dt;
      for (let x = Math.floor(head); x < Math.floor(to); x++) buf[x % buf.length] = sample(++travelled);
      head = to % W; render();
    },
    still() { for (let x = 0; x < W; x++) buf[x] = sample(x); head = W * 0.82; render(); },
  };
}
const ecgCanvas = $('[data-ecg]');
const ecg = ecgCanvas ? monitor(ecgCanvas) : null;

const header = $('.site-header');
const progress = $('.site-header__progress');
const fab = $('.whatsapp-fab');
const hero = $('.hx');
const heroCopy = $('[data-hero-copy]');
const speeds = $$('[data-speed]').map((el) => ({ el, inner: el.firstElementChild, s: parseFloat(el.dataset.speed) }));
const lifts = $$('[data-lift]').map((el) => ({ el, s: parseFloat(el.dataset.lift) }));
const flow = $('[data-flow]');
const flowSteps = flow ? $$('.flow__step', flow) : [];
if (flow && !reduce) flow.dataset.armed = '';
const cta = $('.cta-hx, .cta-bar');

// Horizontal rail: pinned and driven by vertical scroll on large screens, native swipe elsewhere.
const hs = $('[data-hs]'), rail = $('[data-rail]'), railBar = $('[data-rail-bar]');
const prev = $('[data-rail-prev]'), next = $('[data-rail-next]');
let pinned = false, dist = 0;
function setupPin() {
  if (!hs) return;
  pinned = !reduce && innerWidth >= 1024 && innerHeight >= 640;
  hs.classList.toggle('is-pinned', pinned);
  rail.style.transform = '';
  if (pinned) { dist = Math.max(0, rail.scrollWidth - innerWidth); hs.style.height = `${innerHeight + dist}px`; }
  else hs.style.height = '';
}
function syncRail() {
  if (!rail || pinned) return;
  const max = rail.scrollWidth - rail.clientWidth, vis = rail.clientWidth / rail.scrollWidth;
  const t = max > 0 ? rail.scrollLeft / max : 1;
  railBar.style.setProperty('--rp', (vis + (1 - vis) * t).toFixed(3));
  prev.disabled = rail.scrollLeft < 4; next.disabled = rail.scrollLeft > max - 4;
}
if (rail) {
  const step = () => (rail.firstElementChild?.getBoundingClientRect().width || 300) + 16;
  prev.addEventListener('click', () => rail.scrollBy({ left: -step() * 2, behavior: reduce ? 'auto' : 'smooth' }));
  next.addEventListener('click', () => rail.scrollBy({ left: step() * 2, behavior: reduce ? 'auto' : 'smooth' }));
  rail.addEventListener('scroll', syncRail, { passive: true });
}

function frame() {
  const y = scrollY, vh = innerHeight, max = document.documentElement.scrollHeight - vh;
  const heroH = hero ? hero.offsetHeight : 0;
  header?.classList.toggle('is-light', hero ? y > heroH - 80 : y > 120);
  progress?.style.setProperty('--p', max > 0 ? (y / max).toFixed(4) : 0);
  if (hero) fab?.classList.toggle('is-hidden', y < heroH * 0.6);

  if (!reduce) {
    for (const { el, inner, s } of speeds) {
      const r = el.getBoundingClientRect();
      if (!inner || r.bottom < -200 || r.top > vh + 200) continue;
      inner.style.transform = `translate3d(0, ${(-((r.top + r.height / 2) - vh / 2) * s).toFixed(1)}px, 0)`;
    }
    for (const { el, s } of lifts) el.style.transform = `translate3d(0, ${(Math.min(y, vh) * s).toFixed(1)}px, 0)`;
    if (heroCopy && y < heroH) {
      heroCopy.style.transform = `translate3d(0, ${(y * 0.28).toFixed(1)}px, 0)`;
      heroCopy.style.opacity = Math.max(0, 1 - y / (heroH * 0.75)).toFixed(3);
    }
  }
  if (pinned) {
    const r = hs.getBoundingClientRect();
    const t = Math.min(1, Math.max(0, -r.top / (hs.offsetHeight - vh)));
    rail.style.transform = `translate3d(${(-t * dist).toFixed(1)}px, 0, 0)`;
    railBar.style.setProperty('--rp', (0.15 + 0.85 * t).toFixed(3));
  }
  if (flow && !reduce) {
    const r = flow.getBoundingClientRect();
    const t = Math.min(1, Math.max(0, (vh * 0.85 - r.top) / (r.height + vh * 0.25)));
    flow.style.setProperty('--fp', t.toFixed(3));
    flowSteps.forEach((s, i) => s.classList.toggle('is-lit', t >= (i + 0.35) / flowSteps.length));
  }
  if (cta && !reduce) {
    const r = cta.getBoundingClientRect();
    cta.style.setProperty('--cp', Math.min(1, Math.max(0, (vh - r.top) / (vh * 0.9))).toFixed(3));
  }
}

setupPin(); syncRail();
addEventListener('resize', () => { setupPin(); syncRail(); frame(); });
if (ecg && reduce) ecg.still();
let ticking = false;
if (ecg && !reduce) {
  const loop = (now) => { ecg.tick(now); frame(); requestAnimationFrame(loop); };
  requestAnimationFrame(loop);
} else {
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(() => { frame(); ticking = false; }); } }, { passive: true });
  frame();
}

// Entrances on scroll (home markup carries .rise; inner pages get it here).
$$('main .section__head, main .section__title:not(.section__head *), main .grid > li, main .mcards > li, main .fams > li, main .faq-block, main .steps > li').forEach((el) => el.classList.add('rise'));
if (!reduce && 'IntersectionObserver' in window) {
  const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -10% 0px' });
  $$('.rise').forEach((el, i) => { el.style.transitionDelay = `${(i % 4) * 70}ms`; io.observe(el); });
} else $$('.rise').forEach((el) => el.classList.add('is-in'));

// Bench ticket: steps light up in sequence.
$$('[data-ticket] .tstep').forEach((li, i) => {
  const apply = () => li.classList.add(i < 3 ? 'is-done' : i === 3 ? 'is-now' : 'is-next');
  if (reduce) apply(); else setTimeout(apply, 1500 + i * 380);
});

requestAnimationFrame(() => requestAnimationFrame(() => document.documentElement.classList.add('is-loaded')));
