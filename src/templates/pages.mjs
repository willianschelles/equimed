import { esc, join, img, icon, whatsappUrl, productUrl, categoryUrl, specialtyUrl } from './helpers.mjs';

const wa = (site, message) => whatsappUrl(site, message);

/** Keeps <title> within 65 chars: drop the suffix first, then cut at a word boundary. */
const fitTitle = (text, suffix) => {
  if ((text + suffix).length <= 65) return text + suffix;
  if (text.length <= 65) return text;
  return text.slice(0, 64).replace(/\s+\S*$/, '').replace(/[,\-–:]$/, '') + '…';
};

/** Keeps meta description within 50–160 chars. */
const fitDescription = (text, filler) => {
  let d = text.trim();
  if (d.length < 50) d = (d.endsWith('.') ? d : d + '.') + filler;
  return d.length > 160 ? d.slice(0, 157).replace(/\s+\S*$/, '') + '…' : d;
};

const ctaBar = (site, { title = 'Precisa de manutenção, locação ou um equipamento?', message } = {}) => `
<section class="cta-bar">
  <div class="container cta-bar__row">
    <h2 class="cta-bar__title">${esc(title)}</h2>
    <div class="cta-bar__actions">
      <a class="button button--whatsapp" href="${wa(site, message)}" target="_blank" rel="noopener">${icon('whatsapp', 20)} Falar no WhatsApp</a>
      <a class="button button--ghost" href="/contato/">Solicitar orçamento</a>
    </div>
  </div>
</section>`;

const faq = (items) =>
  items?.length
    ? `<section class="section container"><div class="prose">
  <h2>Perguntas frequentes</h2>
  ${items.map((f) => `<details class="faq"><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`).join('\n  ')}
</div></section>`
    : '';

const faqJsonLd = (items) =>
  items?.length && {
    '@type': 'FAQPage',
    mainEntity: items.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
  };

/* Card images are decorative (the card title names the item), hence alt="". The first cards of a
   grid load eagerly because one of them is usually the Largest Contentful Paint element. */
const productCard = (ctx, p, { level = 3, eager = false } = {}) => `
<li class="card">
  <a class="card__link" href="${productUrl(p)}">
    <figure class="card__media">${img(ctx, `/assets/img/products/${p.image}.webp`, '', { lazy: !eager, sizes: '(min-width: 64rem) 22rem, (min-width: 40rem) 45vw, 90vw' })}</figure>
    <div class="card__body">
      <h${level} class="card__title">${esc(p.name)}</h${level}>
      ${p.model ? `<p class="card__meta">${esc(p.model)}</p>` : ''}
      ${p.condition ? `<p class="badge">Seminovo revisado · garantia 3 meses</p>` : ''}
    </div>
  </a>
</li>`;

const categoryCard = (ctx, c, { level = 3, eager = false } = {}) => `
<li class="card">
  <a class="card__link" href="${categoryUrl(c)}">
    <figure class="card__media">${img(ctx, `/assets/img/categories/${c.slug}.webp`, '', { lazy: !eager, sizes: '(min-width: 64rem) 22rem, (min-width: 40rem) 45vw, 90vw' })}</figure>
    <div class="card__body">
      <h${level} class="card__title">${esc(c.name)}</h${level}>
      <p class="card__meta">${c.products.length} ${c.products.length === 1 ? 'produto' : 'produtos'}</p>
    </div>
  </a>
</li>`;

const pageHeader = (heading, lead) => `
<header class="page-header container">
  <h1>${esc(heading)}</h1>
  ${lead ? `<p class="lead">${esc(lead)}</p>` : ''}
</header>`;

/* ---------------- Home ---------------- */
export function home(ctx) {
  const { site, copy, catalog, brands } = ctx;
  const h = copy.home;
  const body = `
<section class="hero">
  <div class="container hero__grid">
    <div class="hero__copy">
      <p class="eyebrow">${esc(h.eyebrow)}</p>
      <h1>${esc(h.headline)}</h1>
      <p class="lead">${esc(h.lead)}</p>
      <div class="hero__actions">
        <a class="button button--whatsapp" href="${wa(site)}" target="_blank" rel="noopener">${icon('whatsapp', 20)} Orçamento pelo WhatsApp</a>
        <a class="button button--primary" href="/especialidades/">Ver equipamentos ${icon('arrow', 18)}</a>
      </div>
      <ul class="hero__phones">
        ${site.phones.map((p) => `<li>${icon('phone', 16)} <a href="tel:${p.e164}">${esc(p.display)}</a></li>`).join('')}
      </ul>
    </div>
    <figure class="hero__media">
      ${img(ctx, '/assets/img/site/hero-servicos.webp', 'Perfuradores e serras Stryker System 7 sobre bancada. Serviços Equimed: manutenção e locação de perfuradores, serras e shavers; transformação de fonte xenon para LED, atualização de firmware e ensaio de segurança elétrica', { lazy: false, sizes: '(min-width: 64rem) 50vw, 100vw' })}
    </figure>
  </div>
</section>

<section class="section container">
  <ul class="highlights">
    ${h.highlights
      .map(
        (x, i) => `<li class="highlight">
      <span class="highlight__icon">${icon(['wrench', 'cycle', 'handshake'][i])}</span>
      <h2 class="highlight__title"><a href="/servicos/${['manutencao', 'locacao', 'venda'][i]}/">${esc(x.title)}</a></h2>
      <p>${esc(x.text)}</p>
    </li>`,
      )
      .join('\n    ')}
  </ul>
</section>

<section class="section section--tint">
  <div class="container">
    <h2 class="section__title">Especialidades</h2>
    <ul class="grid grid--4">
      ${catalog.specialties
        .map(
          (s) => `<li class="card card--flat"><a class="card__link" href="${specialtyUrl(s)}"><div class="card__body"><h3 class="card__title">${esc(s.name)}</h3><p>${esc(s.description)}</p><span class="card__more">Ver produtos ${icon('arrow', 16)}</span></div></a></li>`,
        )
        .join('\n      ')}
    </ul>
  </div>
</section>

<section class="section container prose prose--center">
  <h2>${esc(h.howItWorks.title)}</h2>
  ${h.howItWorks.paragraphs.map((p) => `<p>${p}</p>`).join('\n  ')}
</section>

<section class="section container">
  <h2 class="section__title">${esc(h.steps.title)}</h2>
  <ol class="steps">
    ${h.steps.items.map((s) => `<li class="step"><h3>${esc(s.title)}</h3><p>${esc(s.text)}</p></li>`).join('\n    ')}
  </ol>
</section>

<section class="section section--tint">
  <div class="container">
    <ul class="trust">
      ${h.trust.map((t, i) => `<li><span class="trust__icon">${icon(['calendar', 'shield', 'video', 'map'][i])}</span><h3>${esc(t.title)}</h3><p>${esc(t.text)}</p></li>`).join('\n      ')}
    </ul>
  </div>
</section>

<section class="section container">
  <h2 class="section__title">Marcas que atendemos</h2>
  <ul class="brands brands--compact">
    ${brands.map((b) => `<li>${img(ctx, `/assets/img/brands/${b.slug}.webp`, b.name)}</li>`).join('\n    ')}
  </ul>
  <p class="center"><a class="button button--ghost" href="/marcas/">Todas as marcas</a></p>
</section>
${ctaBar(site)}`;

  return { title: h.title, description: h.description, body };
}

/* ---------------- Services ---------------- */
export function services(ctx) {
  const { site, copy } = ctx;
  const s = copy.services;
  const body = `
${pageHeader(s.heading, s.lead)}
<section class="section container">
  <ul class="grid grid--3">
    ${s.items
      .map(
        (it) => `<li class="card card--flat service-card">
      <span class="highlight__icon">${icon(it.icon)}</span>
      <h2 class="card__title"><a href="/servicos/${it.slug}/">${esc(it.name)}</a></h2>
      <p>${esc(it.summary)}</p>
      <a class="button button--primary" href="/servicos/${it.slug}/">Veja mais ${icon('arrow', 16)}</a>
    </li>`,
      )
      .join('\n    ')}
  </ul>
</section>
${ctaBar(site)}`;
  return { title: s.title, description: s.description, body, breadcrumbs: [{ name: 'Serviços', href: '/servicos/' }] };
}

export function service(ctx, s) {
  const { site } = ctx;
  const message = `Olá, Equimed! Vim pelo site e gostaria de um orçamento de ${s.name.toLowerCase()}.\n\nEquipamento: \nMarca/modelo: \n`;
  const body = `
${pageHeader(s.shortName)}
<section class="section container service-layout">
  <div class="prose">
    ${s.intro.map((p) => `<p>${esc(p)}</p>`).join('\n    ')}
    <h2>${esc(s.bullets.title)}</h2>
    <ul class="checklist">
      ${s.bullets.items.map((i) => `<li>${icon('check', 18)} ${esc(i)}</li>`).join('\n      ')}
    </ul>
  </div>
  <aside class="aside-card">
    <h2>Solicite um orçamento</h2>
    <p>Envie marca, modelo e o defeito. Respondemos em horário comercial.</p>
    <a class="button button--whatsapp button--block" href="${wa(site, message)}" target="_blank" rel="noopener">${icon('whatsapp', 20)} Falar no WhatsApp</a>
    <a class="button button--ghost button--block" href="/contato/">Formulário de contato</a>
    <p class="small">${site.phones.map((p) => `<a href="tel:${p.e164}">${esc(p.display)}</a>`).join(' · ')}</p>
  </aside>
</section>
${faq(s.faq)}
${ctaBar(site, { message })}`;
  const jsonLd = [
    {
      '@type': 'Service',
      name: s.shortName,
      serviceType: s.name,
      provider: { '@id': `${site.url}/#organization` },
      areaServed: 'BR',
      description: s.description,
    },
    faqJsonLd(s.faq),
  ].filter(Boolean);
  return {
    title: s.title,
    description: s.description,
    body,
    jsonLd,
    breadcrumbs: [
      { name: 'Serviços', href: '/servicos/' },
      { name: s.name, href: `/servicos/${s.slug}/` },
    ],
  };
}

/* ---------------- Catalog ---------------- */
export function specialties(ctx) {
  const { site, copy, catalog } = ctx;
  const c = copy.specialties;
  const body = `
${pageHeader(c.heading, c.lead)}
${catalog.specialties
  .map(
    (s, si) => `<section class="section container">
  <h2 class="section__title"><a href="${specialtyUrl(s)}">${esc(s.name)}</a></h2>
  <p class="lead">${esc(s.description)}</p>
  <ul class="grid grid--3">
    ${s.categories.map((cat, i) => categoryCard(ctx, cat, { eager: si === 0 && i < 3 })).join('\n    ')}
  </ul>
</section>`,
  )
  .join('\n')}
${ctaBar(site)}`;
  return { title: c.title, description: c.description, body, breadcrumbs: [{ name: 'Especialidades', href: '/especialidades/' }] };
}

export function specialty(ctx, s) {
  const { site } = ctx;
  const title = `${s.name}: venda, locação e manutenção | Equimed`;
  const body = `
${pageHeader(s.name, s.description)}
<section class="section container">
  <ul class="grid grid--3">
    ${s.categories.map((cat, i) => categoryCard(ctx, cat, { level: 2, eager: i < 3 })).join('\n    ')}
  </ul>
</section>
${ctaBar(site, { message: `Olá, Equimed! Vim pelo site e tenho interesse em equipamentos de ${s.name}.\n\nPreciso de: (manutenção / locação / compra)\nEquipamento: \n` })}`;
  return {
    title,
    description: fitDescription(s.description, " Equimed, Curitiba, PR."),
    body,
    breadcrumbs: [
      { name: 'Especialidades', href: '/especialidades/' },
      { name: s.name, href: specialtyUrl(s) },
    ],
  };
}

export function category(ctx, c) {
  const { site } = ctx;
  const title = `${c.name} | ${c.specialty.name} | Equimed`;
  const body = `
${pageHeader(c.name, c.description)}
<section class="section container">
  <ul class="grid grid--3">
    ${c.products.map((p, i) => productCard(ctx, p, { level: 2, eager: i < 3 })).join('\n    ')}
  </ul>
</section>
${ctaBar(site, { title: `Não encontrou o modelo? Consulte-nos sobre ${c.name.toLowerCase()}.`, message: `Olá, Equimed! Vim pelo site e procuro ${c.name.toLowerCase()} (${c.specialty.name}).\n\nMarca/modelo: \nPreciso de: (manutenção / locação / compra)\n` })}`;
  const jsonLd = [
    {
      '@type': 'ItemList',
      name: `${c.name} - ${c.specialty.name}`,
      itemListElement: c.products.map((p, i) => ({ '@type': 'ListItem', position: i + 1, url: site.url + productUrl(p), name: p.name })),
    },
  ];
  return {
    title,
    description: `${c.description} Venda, locação e manutenção. Equimed, Curitiba, PR.`,
    body,
    jsonLd,
    ogImage: `/assets/img/categories/${c.slug}.webp`,
    breadcrumbs: [
      { name: 'Especialidades', href: '/especialidades/' },
      { name: c.specialty.name, href: specialtyUrl(c.specialty) },
      { name: c.name, href: categoryUrl(c) },
    ],
  };
}

export function product(ctx, p) {
  const { site } = ctx;
  const fullName = [p.name, p.model].filter(Boolean).join(' ');
  const title = fitTitle(fullName, ' | Equimed');
  const description = fitDescription(p.summary, ` Venda, locação e assistência técnica. Equimed, Curitiba.`);
  const message = `Olá, Equimed! Vim pelo site e tenho interesse no produto:\n${fullName}\n${site.url}${productUrl(p)}\n\nPreciso de: (orçamento de compra / locação / manutenção)\n`;
  const related = p.categoryRef.products.filter((x) => x.slug !== p.slug).slice(0, 3);
  const body = `
<article class="product container">
  <figure class="product__media">${img(ctx, `/assets/img/products/${p.image}.webp`, fullName, { lazy: false, sizes: '(min-width: 64rem) 50vw, 100vw' })}</figure>
  <div class="product__body">
    <p class="eyebrow">${esc(p.categoryRef.name)} · ${esc(p.specialtyRef.name)}</p>
    <h1>${esc(p.name)}</h1>
    ${p.model ? `<p class="product__model">${esc(p.model)}</p>` : ''}
    ${p.condition ? `<p class="badge">Seminovo revisado e testado · garantia de 3 meses</p>` : ''}
    <div class="prose">
      <p>${esc(p.summary)}</p>
      ${(p.paragraphs ?? []).map((t) => `<p>${esc(t)}</p>`).join('\n      ')}
      ${p.list ? `<h2>${esc(p.list.title)}</h2><ul>${p.list.items.map((i) => `<li>${esc(i)}</li>`).join('')}</ul>` : ''}
      ${
        p.specs?.length
          ? `<h2>Especificações</h2>
      <table class="specs"><tbody>${p.specs.map(([k, v]) => `<tr><th scope="row">${esc(k)}</th><td>${esc(v)}</td></tr>`).join('')}</tbody></table>`
          : ''
      }
    </div>
    <div class="product__cta">
      <a class="button button--whatsapp" href="${wa(site, message)}" target="_blank" rel="noopener">${icon('whatsapp', 20)} Solicitar orçamento pelo WhatsApp</a>
      <a class="button button--ghost" href="/contato/?produto=${encodeURIComponent(fullName)}">Enviar e-mail</a>
    </div>
  </div>
</article>
${
  related.length
    ? `<section class="section container">
  <h2 class="section__title">Outros em ${esc(p.categoryRef.name)}</h2>
  <ul class="grid grid--3">${related.map((r) => productCard(ctx, r)).join('')}</ul>
</section>`
    : ''
}`;
  const jsonLd = [
    {
      '@type': 'Product',
      name: fullName,
      image: `${site.url}/assets/img/products/${p.image}.webp`,
      description: p.summary,
      ...(p.brand ? { brand: { '@type': 'Brand', name: p.brand } } : {}),
      ...(p.model ? { model: p.model } : {}),
      category: `${p.specialtyRef.name} > ${p.categoryRef.name}`,
      offers: {
        '@type': 'Offer',
        availability: 'https://schema.org/InStock',
        itemCondition: p.condition === 'seminovo' ? 'https://schema.org/RefurbishedCondition' : 'https://schema.org/NewCondition',
        priceCurrency: 'BRL',
        seller: { '@id': `${site.url}/#organization` },
        url: site.url + productUrl(p),
      },
    },
  ];
  return {
    title,
    description,
    body,
    jsonLd,
    ogType: 'product',
    ogImage: `/assets/img/products/${p.image}.webp`,
    breadcrumbs: [
      { name: 'Especialidades', href: '/especialidades/' },
      { name: p.specialtyRef.name, href: specialtyUrl(p.specialtyRef) },
      { name: p.categoryRef.name, href: categoryUrl(p.categoryRef) },
      { name: p.name, href: productUrl(p) },
    ],
  };
}

/* ---------------- Brands ---------------- */
export function brandsPage(ctx) {
  const { site, copy, brands } = ctx;
  const b = copy.brands;
  const body = `
${pageHeader(b.heading, b.lead)}
<section class="section container">
  <ul class="brands">
    ${brands.map((x) => `<li>${img(ctx, `/assets/img/brands/${x.slug}.webp`, x.name)}</li>`).join('\n    ')}
  </ul>
</section>
${ctaBar(site)}`;
  return { title: b.title, description: b.description, body, breadcrumbs: [{ name: 'Marcas', href: '/marcas/' }] };
}

/* ---------------- About ---------------- */
export function about(ctx) {
  const { site, copy } = ctx;
  const a = copy.about;
  const body = `
${pageHeader(a.heading)}
<section class="section container prose prose--center">
  ${a.paragraphs.map((p) => `<p>${esc(p)}</p>`).join('\n  ')}
  <h2>Especialidades atendidas</h2>
  <ul class="pills">${site.specialtiesServed.map((s) => `<li>${esc(s)}</li>`).join('')}</ul>
  <h2>Empresa do grupo</h2>
  <p><a href="${site.sisterCompany.url}" rel="noopener">${esc(site.sisterCompany.name)}</a>: ${esc(site.sisterCompany.description)}</p>
</section>
${ctaBar(site)}`;
  return { title: a.title, description: a.description, body, breadcrumbs: [{ name: 'Sobre nós', href: '/sobre/' }] };
}

/* ---------------- Contact ---------------- */
export function contact(ctx) {
  const { site, copy } = ctx;
  const c = copy.contact;
  const a = site.address;
  const body = `
${pageHeader(c.heading, c.lead)}
<section class="section container contact-layout">
  <form class="contact-form" id="contact-form" method="post" data-whatsapp="${site.whatsapp.number}" data-email="${site.email}">
    <div class="field">
      <label for="f-nome">Nome</label>
      <input id="f-nome" name="nome" type="text" autocomplete="name" required minlength="2">
    </div>
    <div class="field">
      <label for="f-empresa">Empresa / hospital / clínica <span class="optional">(opcional)</span></label>
      <input id="f-empresa" name="empresa" type="text" autocomplete="organization">
    </div>
    <div class="field">
      <label for="f-telefone">Telefone / WhatsApp</label>
      <input id="f-telefone" name="telefone" type="tel" autocomplete="tel" inputmode="tel" required>
    </div>
    <div class="field">
      <label for="f-assunto">Preciso de</label>
      <select id="f-assunto" name="assunto" required>
        <option value="Manutenção">Manutenção / assistência técnica</option>
        <option value="Locação">Locação</option>
        <option value="Compra">Compra de equipamento</option>
        <option value="Outro">Outro assunto</option>
      </select>
    </div>
    <div class="field">
      <label for="f-equipamento">Equipamento (marca e modelo)</label>
      <input id="f-equipamento" name="equipamento" type="text" placeholder="Ex.: Fonte de luz Storz 300W Xenon">
    </div>
    <div class="field">
      <label for="f-mensagem">Mensagem</label>
      <textarea id="f-mensagem" name="mensagem" rows="5" required minlength="4" placeholder="Descreva o defeito ou a necessidade."></textarea>
    </div>
    <div class="contact-form__actions">
      <button class="button button--whatsapp" type="submit" value="whatsapp" name="via">${icon('whatsapp', 20)} Enviar pelo WhatsApp</button>
      <button class="button button--ghost" type="submit" value="email" name="via">Enviar por e-mail</button>
    </div>
    <p class="small">O envio abre o WhatsApp ou o seu programa de e-mail com a mensagem pronta. Nenhum dado é armazenado neste site.</p>
    <noscript><p class="small">Com JavaScript desativado, envie diretamente para <a href="mailto:${site.email}">${esc(site.email)}</a> ou pelo <a href="${wa(site)}">WhatsApp</a>.</p></noscript>
  </form>
  <aside class="aside-card">
    <h2>Canais de atendimento</h2>
    <p>${icon('whatsapp', 18)} <a href="${wa(site)}" target="_blank" rel="noopener">WhatsApp ${esc(site.whatsapp.display)}</a></p>
    ${site.phones.map((p) => `<p>${icon('phone', 18)} <a href="tel:${p.e164}">${esc(p.display)}</a></p>`).join('\n    ')}
    <p>${icon('mail', 18)} <a href="mailto:${site.email}">${esc(site.email)}</a></p>
    <p>${icon('clock', 18)} ${esc(site.openingHoursDisplay)}</p>
    <h2>Endereço</h2>
    <address>
      <p>${icon('pin', 18)} ${esc(a.street)}<br>${esc(a.neighborhood)}, ${esc(a.city)} - ${esc(a.state)}<br>CEP ${esc(a.postalCode)}</p>
    </address>
    <a class="button button--ghost button--block" href="${a.mapsUrl}" target="_blank" rel="noopener">${icon('map', 18)} Abrir no Google Maps</a>
    <p class="small">Recebemos equipamentos de todo o Brasil por transportadora. Combine o envio pelo WhatsApp antes de despachar.</p>
  </aside>
</section>`;
  return {
    title: c.title,
    description: c.description,
    body,
    jsonLd: [{ '@type': 'ContactPage', name: c.heading, url: `${site.url}/contato/` }],
    breadcrumbs: [{ name: 'Contato', href: '/contato/' }],
  };
}

/* ---------------- 404 ---------------- */
export function notFound(ctx) {
  const { site } = ctx;
  const body = `
<section class="section container prose prose--center">
  <h1>Página não encontrada</h1>
  <p>O endereço pode ter mudado com o novo site. Use o menu ou os atalhos abaixo.</p>
  <p><a class="button button--primary" href="/">Página inicial</a> <a class="button button--ghost" href="/especialidades/">Equipamentos</a> <a class="button button--ghost" href="/contato/">Contato</a></p>
</section>`;
  return { title: `Página não encontrada | ${site.name}`, description: 'A página solicitada não existe.', body, noindex: true };
}

export { join };
