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
