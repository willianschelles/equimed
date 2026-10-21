import { esc, img, icon, whatsappUrl, productUrl, familyUrl, maintenanceUrl, brandUrl, articleUrl } from './helpers.mjs';

const wa = (site, message) => whatsappUrl(site, message);
const SUFFIX = ' | EquimedPR';

/** Keeps <title> within 65 chars: drop the suffix first, then cut at a word boundary. */
export const fitTitle = (text, suffix = SUFFIX) => {
  if ((text + suffix).length <= 65) return text + suffix;
  if (text.length <= 65) return text;
  return text.slice(0, 64).replace(/\s+\S*$/, '').replace(/[,\-–:]$/, '') + '…';
};

/** Keeps meta description within 50–160 chars. */
export const fitDescription = (text, filler = ' EquimedPR, Curitiba, PR.') => {
  let d = text.trim();
  if (d.length < 50) d = (d.endsWith('.') ? d : d + '.') + filler;
  return d.length > 160 ? d.slice(0, 157).replace(/\s+\S*$/, '') + '…' : d;
};

const SERVICE_LABEL = { manutencao: 'Manutenção', venda: 'Venda', locacao: 'Locação', software: 'Software' };

/* ---------------- Shared blocks ---------------- */
const sectionHead = (index, title, lead, action = '') => `<div class="section__head"><div><h2 class="section__title">${esc(title)}</h2>${lead ? `<p class="lead">${esc(lead)}</p>` : ''}</div>${action}</div>`;
const photo = (ctx, name, alt, opts = {}) => img(ctx, `/assets/img/photos/${name}.webp`, alt, { sizes: '(min-width: 64rem) 40vw, 100vw', ...(name.endsWith('-recorte') ? { cls: 'is-cutout' } : {}), ...opts });
const gallery = (ctx, names, alt) => names.length <= 1
  ? `<figure class="page-header__media frame">${photo(ctx, names[0], alt, { lazy: false })}</figure>`
  : `<div class="gallery" data-gallery>
    <div class="gallery__track frame">
      ${names.map((n, i) => `<figure class="gallery__slide" id="foto-${i + 1}">${photo(ctx, n, `${alt} (foto ${i + 1} de ${names.length})`, { lazy: i > 0 })}</figure>`).join('')}
    </div>
    <div class="gallery__nav">
      <button type="button" class="gallery__btn" data-dir="-1" aria-label="Foto anterior">${icon('arrow', 18)}</button>
      <span class="gallery__dots">${names.map((_, i) => `<button type="button" class="gallery__dot${i === 0 ? ' is-active' : ''}" data-index="${i}" aria-label="Foto ${i + 1}"></button>`).join('')}</span>
      <button type="button" class="gallery__btn" data-dir="1" aria-label="Próxima foto">${icon('arrow', 18)}</button>
    </div>
  </div>`;
const pageHeader = (heading, lead, { eyebrow, extra = '', ctx, photoName, photos, photoAlt = '' } = {}) => `
<div class="page-hero"><header class="page-header container${photoName || photos?.length ? ' page-header--media' : ''}">
  <div class="page-header__copy">
    ${eyebrow ? `<p class="eyebrow">${esc(eyebrow)}</p>` : ''}
    <h1>${esc(heading)}</h1>
    ${lead ? `<p class="lead">${esc(lead)}</p>` : ''}
    ${extra}
  </div>
  ${photos?.length ? gallery(ctx, photos, photoAlt) : photoName ? `<figure class="page-header__media frame">${photo(ctx, photoName, photoAlt, { lazy: false })}</figure>` : ''}
</header></div>`;

const ctaBar = (site, { title = 'Precisa de manutenção, locação, um equipamento ou software?', text = 'Envie marca, modelo e o defeito. Respondemos em horário comercial com a avaliação e o orçamento.', message, place = 'cta' } = {}) => `
<section class="cta-bar">
  <div class="container cta-bar__row">
    <div>
      <h2 class="cta-bar__title">${esc(title)}</h2>
      <p class="cta-bar__text">${esc(text)}</p>
    </div>
    <div class="cta-bar__actions">
      <a class="button button--whatsapp button--lg" href="${wa(site, message)}" target="_blank" rel="noopener" data-track="whatsapp_click" data-place="${place}">${icon('whatsapp', 22)} Falar no WhatsApp</a>
      <a class="button button--ghost button--lg" href="/contato/">Solicitar orçamento</a>
    </div>
  </div>
</section>`;

const faq = (items, title = 'Perguntas frequentes') =>
  items?.length
    ? `<section class="section container faq-block">
  <div class="faq-block__head"><h2 class="section__title">${esc(title)}</h2><p class="lead">Não encontrou a resposta? Fale com a equipe técnica pelo WhatsApp.</p></div>
  <div class="faq-block__list">${items.map((f) => `<details class="faq" name="faq"><summary>${esc(f.q)}${icon('chevron', 20)}</summary><p>${esc(f.a)}</p></details>`).join('\n  ')}</div>
</section>`
    : '';

const faqJsonLd = (items) =>
  items?.length && {
    '@type': 'FAQPage',
    mainEntity: items.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
  };

const brandHead = (ctx, slug, name) => {
  const b = slug ? ctx.brands.find((x) => x.slug === slug) : null;
  if (!b?.logo) return '';
  const logo = img(ctx, `/assets/img/brands/${b.logo}.webp`, '');
  return `<a class="mcard__head" href="${brandUrl({ slug })}" aria-label="${esc(name)}">${logo}</a>`;
};
/** items: [{ ctx, slug, name, title, models: [] }] */
const modelCards = (ctx, items) => `<ul class="mcards">${items.map((it) => `<li class="mcard">
  ${it.head ?? brandHead(ctx, it.slug, it.name)}
  <div class="mcard__body">
    <h3 class="mcard__title">${esc(it.title ?? it.name)}</h3>
    <ul class="mcard__chips">${it.models.map((m) => `<li>${esc(m)}</li>`).join('')}</ul>
  </div>
</li>`).join('')}</ul>`;

const checklist = (items) => `<ul class="checklist">${items.map((i) => `<li>${icon('check', 18)} <span>${esc(i)}</span></li>`).join('')}</ul>`;

const independence = (site) => `<p class="notice">${icon('shield', 18)} <span>${esc(site.independenceNotice)}</span></p>`;

const statusBadges = (p) => {
  const b = [];
  if (p.condition === 'seminovo') b.push('<span class="badge badge--warm">Seminovo revisado · 3 meses de garantia</span>');
  if (p.condition === 'novo') b.push('<span class="badge badge--warm">Novo</span>');
  const sells = p.services.includes('venda') || p.services.includes('locacao');
  if (!sells) b.push('<span class="badge badge--manutencao">Atendido em manutenção</span>');
  else b.push(`<span class="badge badge--venda">${p.services.filter((s) => s !== 'manutencao').map((s) => SERVICE_LABEL[s]).join(' · ')}</span>`);
  return `<p class="badges">${b.join(' ')}</p>`;
};

/* Card images are decorative (the card title names the item), hence alt="". The first cards of a
   grid load eagerly because one of them is usually the Largest Contentful Paint element. */
const media = (ctx, p, { eager = false, sizes = '(min-width: 64rem) 22rem, (min-width: 40rem) 45vw, 90vw' } = {}) =>
  p.image
    ? `<figure class="card__media">${img(ctx, `/assets/img/products/${p.image}.webp`, '', { lazy: !eager, sizes })}</figure>`
    : `<figure class="card__media card__media--icon">${icon(p.familyRef.icon, 56)}<span>Foto em breve</span></figure>`;

const productCard = (ctx, p, { level = 3, eager = false } = {}) => `
<li class="card">
  <a class="card__link" href="${productUrl(p)}">
    ${media(ctx, p, { eager })}
    <div class="card__body">
      ${p.brand ? `<p class="card__brand">${esc(p.brand)}</p>` : ''}
      <h${level} class="card__title">${esc(p.name)}</h${level}>
      ${p.model ? `<p class="card__meta">${esc(p.model)}</p>` : ''}
      ${statusBadges(p)}
    </div>
  </a>
</li>`;

const familyCard = (ctx, f, { level = 3, href } = {}) => {
  const serviced = f.products.filter((p) => !p.services.includes('venda') && !p.services.includes('locacao')).length;
  const available = f.products.length - serviced;
  const media = f.cover
    ? img(ctx, `/assets/img/products/${f.cover}.webp`, '', { sizes: '(min-width: 64rem) 22rem, (min-width: 40rem) 45vw, 90vw' })
    : `<span class="fam__glyph">${icon(f.icon, 56)}</span>`;
  return `
<li class="fam">
  <a class="fam__link" href="${href ?? familyUrl(f)}">
    <span class="fam__media">${media}</span>
    <span class="fam__body">
      <h${level} class="fam__title">${esc(f.shortName)}</h${level}>
      <span class="fam__text">${esc(f.short)}</span>
      <span class="fam__tags">
        ${f.maintenance ? '<span class="fam__tag fam__tag--petrol">Manutenção</span>' : ''}
        ${available ? `<span class="fam__tag fam__tag--ok">${available} à venda / locação</span>` : ''}
      </span>
    </span>
    <span class="fam__more">Ver ${esc(f.shortName.toLowerCase())} ${icon('arrow', 16)}</span>
  </a>
</li>`;
};

const brandTile = (ctx, b, { level = 3 } = {}) => `
<li class="brand-tile${b.focus ? ' brand-tile--focus' : ''}">
  <a href="${brandUrl(b)}">
    <span class="brand-tile__logo">${b.logo ? img(ctx, `/assets/img/brands/${b.logo}.webp`, '') : `<span class="brand-tile__word">${esc(b.name)}</span>`}</span>
    <h${level} class="brand-tile__name">${esc(b.name)}</h${level}>
    <p class="brand-tile__lead">${esc(b.lead)}</p>
  </a>
</li>`;

const articleCard = (a, { level = 3 } = {}) => `
<li class="card card--article">
  <a class="card__link" href="${articleUrl(a)}">
    <div class="card__body">
      <p class="card__meta">${esc(a.readingMinutes)} min de leitura</p>
      <h${level} class="card__title">${esc(a.title)}</h${level}>
      <p class="card__text">${esc(a.description)}</p>
      <span class="card__more">Ler ${icon('arrow', 16)}</span>
    </div>
  </a>
</li>`;

const SERVICE_META = {
  manutencao: ['Avaliação em bancada', 'Orçamento detalhado', 'Relatório e garantia'],
  locacao: ['Por procedimento ou período', 'Manutenção incluída', 'Reserva durante reparo'],
  venda: ['Seminovos revisados', '3 meses de garantia', 'Proposta para licitação'],
  software: ['Atualização de firmware', 'Desbloqueio de contadores', 'Desenvolvimento sob medida'],
};
const serviceCard = (s, { level = 2, index = 1, ctx } = {}) => `
<li class="tile">
  <a class="tile__link" href="/${s.slug}/">
    <span class="tile__media">${photo(ctx, s.photo, '', { sizes: '(min-width: 64rem) 36rem, 100vw' })}</span>
    <span class="tile__body">
      <span class="tile__num">0${index}</span>
      <h${level} class="tile__title">${esc(s.name)}</h${level}>
      <p class="tile__text">${esc(s.summary)}</p>
      <ul class="tile__meta">${SERVICE_META[s.slug].map((m) => `<li>${icon('check', 14)} ${esc(m)}</li>`).join('')}</ul>
      <span class="tile__more">Ver ${esc(s.name.toLowerCase())} ${icon('arrow', 18)}</span>
    </span>
  </a>
</li>`;

const aside = (site, { title = 'Solicite um orçamento', text = 'Envie marca, modelo, número de série e o defeito. Respondemos em horário comercial.', message, place = 'aside' } = {}) => `
<aside class="aside-card">
  <h2>${esc(title)}</h2>
  <p>${esc(text)}</p>
  <a class="button button--whatsapp button--block" href="${wa(site, message)}" target="_blank" rel="noopener" data-track="whatsapp_click" data-place="${place}">${icon('whatsapp', 20)} Falar no WhatsApp</a>
  <a class="button button--ghost button--block" href="/contato/">Formulário de contato</a>
  <p class="small">${site.phones.map((p) => `<a href="tel:${p.e164}" data-track="phone_click">${esc(p.display)}</a>`).join(' · ')}</p>
  <p class="small">${icon('truck', 16)} Recebemos equipamentos de todo o Brasil por transportadora.</p>
</aside>`;

const stepsBlock = (title, items, index = '04') => `
<section class="section container">
  ${sectionHead(index, title)}
  <ol class="steps">
    ${items.map((s) => `<li class="step"><h3>${esc(s.title)}</h3><p>${esc(s.text)}</p></li>`).join('\n    ')}
  </ol>
</section>`;

/* ---------------- Home ---------------- */
export function home(ctx) {
  const { site, copy, families, brands, services, articles } = ctx;
  const h = copy.home;
  const logoBrands = ['stryker', 'conmed', 'karl-storz', 'smith-nephew', 'olympus'].map((s) => brands.find((b) => b.slug === s)).filter((b) => b?.logo);
  const fams = families.filter((f) => f.cover).slice(0, 7);
  const body = `
<section class="hero">
  <figure class="hero__photo">${photo(ctx, 'bench-multimeter', '', { lazy: false, sizes: '100vw' })}</figure>
  <div class="container hero__copy">
    <p class="eyebrow">${esc(h.eyebrow)}</p>
    <h1>Equipamento cirúrgico <strong>pronto para a próxima cirurgia.</strong></h1>
    <p class="lead">${esc(h.lead)}</p>
    <div class="hero__actions">
      <a class="button button--whatsapp button--lg" href="${wa(site)}" target="_blank" rel="noopener" data-track="whatsapp_click" data-place="hero">${icon('whatsapp', 20)} Falar no WhatsApp</a>
      <a class="button button--ghost button--lg" href="/manutencao/">Conheça a bancada ${icon('arrow', 18)}</a>
    </div>
  </div>
</section>

<div class="container stats" role="list">
  <div class="stat" role="listitem"><span class="stat__label">DESDE</span><span class="stat__value">${site.foundingYear}</span><span class="stat__text">atendendo hospitais e clínicas</span></div>
  <div class="stat" role="listitem"><span class="stat__label">LINHAS STRYKER</span><span class="stat__value">5–8</span><span class="stat__text">System 5, 6, 7 e 8 atendidos</span></div>
  <div class="stat" role="listitem"><span class="stat__label">GARANTIA</span><span class="stat__value">3<small> meses</small></span><span class="stat__text">em todo seminovo revisado</span></div>
  <div class="stat" role="listitem"><span class="stat__label">ATENDIMENTO</span><span class="stat__value">BR</span><span class="stat__text">envio e retorno por transportadora</span></div>
</div>

<section class="section container statement">
  <span class="statement__label">QUEM SOMOS</span>
  <p class="statement__text">Desde ${site.foundingYear} cuidamos do que mantém o centro cirúrgico funcionando. <strong>Diagnóstico em bancada, orçamento detalhado e garantia</strong> em perfuradores, serras, câmeras, fontes de luz e insufladores.</p>
</section>

<section class="section section--dark">
  <div class="container">
    ${sectionHead(null, h.servicesTitle)}
    <div class="svc">
      <a class="svc__tile svc__tile--feature" href="/manutencao/">
        <figure class="svc__media">${photo(ctx, 'stryker-system7-desmontado-recorte', 'Perfurador Stryker System 7 desmontado na bancada EquimedPR', { sizes: '(min-width: 64rem) 52rem, 100vw' })}</figure>
        <div class="svc__body"><span class="svc__label">Manutenção</span><h3 class="svc__title">Diagnóstico em bancada antes de qualquer reparo</h3><p class="svc__text">Corretiva e preventiva, com orçamento detalhado e garantia do serviço. Você aprova antes de começarmos.</p><span class="svc__more">Ver manutenção →</span></div>
      </a>
      <a class="svc__tile svc__tile--card" href="/locacao/">
        <figure class="svc__media">${photo(ctx, 'seminovo-stryker-6-conjunto-recorte', 'Conjunto de perfurador e serra Stryker com carregador, pronto para locação', { sizes: '(min-width: 64rem) 26rem, 100vw' })}</figure>
        <div class="svc__body"><span class="svc__label">Locação</span><h3 class="svc__title">Conjunto revisado no dia da cirurgia</h3></div>
      </a>
      <a class="svc__tile svc__tile--card" href="/venda/">
        <figure class="svc__media">${photo(ctx, 'stryker-system7-recorte', 'Perfurador Stryker System 7', { sizes: '(min-width: 64rem) 26rem, 100vw' })}</figure>
        <div class="svc__body"><span class="svc__label">Venda</span><h3 class="svc__title">Seminovos com ${esc(site.warranty.used)} de garantia</h3></div>
      </a>
      <a class="svc__tile svc__tile--band" href="/software/">
        <figure class="svc__media">${img(ctx, '/assets/img/products/carregador-de-bateria-inteligente.webp', 'Carregador inteligente multilinha EquimedPR', { sizes: '(min-width: 64rem) 30rem, 60vw' })}</figure>
        <div class="svc__body"><span class="svc__label">Software</span><h3 class="svc__title">Atualização de firmware, desbloqueio e desenvolvimento sob medida</h3><p class="svc__text">Baterias, carregadores e consoles que travam mesmo com a mecânica em ordem.</p></div>
      </a>
    </div>
  </div>
</section>

<section class="section section--tint">
  <div class="container">
    ${sectionHead(null, h.familiesTitle, h.familiesLead, '<a class="button button--ghost" href="/equipamentos/">Todas as famílias ' + icon('arrow', 16) + '</a>')}
    <ul class="fams">
      ${fams.map((f) => familyCard(ctx, f)).join('\n      ')}
      <li class="fam--ask"><a class="fam__link" href="${wa(site, 'Olá, EquimedPR! Vim pelo site e não encontrei o meu equipamento.\n\nEquipamento: \nMarca/modelo: \n')}" target="_blank" rel="noopener" data-track="whatsapp_click" data-place="familias-ask"><span class="fam__label">NÃO ACHOU O SEU?</span><span class="fam__ask">Atendemos também shavers, cabos de fibra óptica e equipamentos nacionais e chineses.</span><span class="fam__more">Perguntar pelo WhatsApp ${icon('arrow', 16)}</span></a></li>
    </ul>
  </div>
</section>

<section class="section section--dark" style="padding-block: 3.5rem;">
  <div class="container logos">
    <span class="logos__label">MARCAS ATENDIDAS</span>
    ${logoBrands.map((b) => `<a href="${brandUrl(b)}">${img(ctx, `/assets/img/brands/${b.logo}.webp`, b.name)}</a>`).join('\n    ')}
  </div>
</section>

<section class="section section--petrol">
  <div class="container">
    ${sectionHead(null, h.stepsTitle)}
    <ol class="steps">
      ${copy.steps.map((s) => `<li class="step"><h3>${esc(s.title)}</h3><p>${esc(s.text)}</p></li>`).join('\n      ')}
    </ol>
  </div>
</section>

<section class="section">
  <div class="container">
    ${sectionHead(null, h.articlesTitle, 'Guias escritos pela equipe técnica para quem cuida do equipamento.', '<a class="button button--ghost" href="/conteudo/">Todo o conteúdo ' + icon('arrow', 16) + '</a>')}
    <ul class="grid grid--3">
      ${articles.slice(0, 3).map((a) => articleCard(a)).join('\n      ')}
    </ul>
  </div>
</section>

${faq(h.faq, h.faqTitle)}
${ctaBar(site, { title: 'Equipamento parado? Fale com a bancada.', text: '(41) 9 9889-3793 · segunda a sexta, das 8h às 18h. Envie marca, modelo e o defeito.', place: 'home-cta' })}`;

  return { title: h.title, description: h.description, body, jsonLd: [faqJsonLd(h.faq)].filter(Boolean) };
}

/* ---------------- Services ---------------- */
const serviceJsonLd = (site, s, description) => ({
  '@type': 'Service',
  name: s.heading,
  serviceType: s.name,
  provider: { '@id': `${site.url}/#organization` },
  areaServed: { '@type': 'Country', name: 'Brasil' },
  description,
});

export function maintenance(ctx) {
  const { site, services, families, copy } = ctx;
  const s = services.manutencao;
  const message = `Olá, EquimedPR! Vim pelo site e preciso de manutenção.\n\nEquipamento: \nMarca/modelo: \nDefeito: \n`;
  const body = `
${pageHeader(s.heading, s.lead, { eyebrow: 'Assistência técnica independente multimarcas', ctx, photoName: s.photo, photos: s.photos, photoAlt: 'Perfurador Stryker System 7 na bancada da EquimedPR' })}
<section class="section container service-layout">
  <div class="prose">
    ${s.intro.map((p) => `<p>${esc(p)}</p>`).join('\n    ')}
    ${independence(site)}
  </div>
  ${aside(site, { message, place: 'manutencao' })}
</section>

<section class="section section--tint">
  <div class="container">
    ${sectionHead('01', s.familiesTitle, s.familiesLead)}
    <ul class="fams">
      ${families.filter((f) => f.maintenance).map((f) => familyCard(ctx, f, { href: maintenanceUrl(f) })).join('\n      ')}
    </ul>
  </div>
</section>

${stepsBlock(s.process.title, s.process.steps, '02')}

<section class="section container">
  <div class="panel">
    <span class="panel__icon">${icon('clipboard', 28)}</span>
    <div>
      <h2>${esc(s.preventive.title)}</h2>
      <p>${esc(s.preventive.text)}</p>
      <p><a class="button button--primary" href="${wa(site, 'Olá, EquimedPR! Gostaria de uma proposta de manutenção preventiva.\n\nEquipamentos: \nQuantidade: \n')}" target="_blank" rel="noopener" data-track="whatsapp_click" data-place="preventiva">${icon('whatsapp', 18)} Pedir proposta de preventiva</a></p>
    </div>
  </div>
</section>

${faq(s.faq)}
${ctaBar(site, { message, place: 'manutencao-cta' })}`;
  return {
    title: s.title, description: s.description, body,
    jsonLd: [serviceJsonLd(site, s, s.description), faqJsonLd(s.faq)].filter(Boolean),
    breadcrumbs: [{ name: s.name, href: '/manutencao/' }],
  };
}

export function maintenanceFamily(ctx, f) {
  const { site, brands, articles } = ctx;
  const m = f.maintenance;
  const message = `Olá, EquimedPR! Vim pelo site e preciso de manutenção em ${f.shortName.toLowerCase()}.\n\nMarca/modelo: \nDefeito: \n`;
  const related = articles.filter((a) => a.families.includes(f.slug)).slice(0, 3);
  const body = `
${pageHeader(m.title, f.lead, { eyebrow: 'Manutenção por família de equipamento', ctx, photoName: f.photo, photos: f.photos, photoAlt: f.name })}
<section class="section container service-layout">
  <div class="prose">
    ${m.intro.map((p) => `<p>${esc(p)}</p>`).join('\n    ')}
    <h2>Defeitos mais comuns</h2>
    ${checklist(m.commonFailures)}
    <h2>O que fazemos</h2>
    ${checklist(m.whatWeDo)}
    <h2>Marcas e modelos atendidos</h2>
    ${modelCards(ctx, m.brands.map((b) => ({ slug: b.slug, name: b.brand, models: b.models })))}
    <p class="small">A lista não é exaustiva. Se o seu modelo não está aqui, pergunte pelo WhatsApp.</p>
    ${independence(site)}
    ${f.products.length ? `<p><a class="button button--ghost" href="${familyUrl(f)}">Ver ${f.shortName.toLowerCase()} para venda e locação ${icon('arrow', 16)}</a></p>` : ''}
  </div>
  ${aside(site, { message, place: `manutencao-${f.slug}` })}
</section>
${related.length ? `<section class="section section--tint"><div class="container"><h2 class="section__title">Leitura relacionada</h2><ul class="grid grid--3">${related.map((a) => articleCard(a)).join('')}</ul></div></section>` : ''}
${faq(m.faq)}
${ctaBar(site, { title: `Precisa de manutenção em ${f.shortName.toLowerCase()}?`, message, place: `manutencao-${f.slug}-cta` })}`;
  return {
    title: fitTitle(m.metaTitle), description: fitDescription(m.metaDescription), body,
    jsonLd: [
      { '@type': 'Service', name: m.title, serviceType: 'Manutenção', provider: { '@id': `${site.url}/#organization` }, areaServed: { '@type': 'Country', name: 'Brasil' }, description: m.metaDescription },
      faqJsonLd(m.faq),
    ].filter(Boolean),
    breadcrumbs: [{ name: 'Manutenção', href: '/manutencao/' }, { name: f.shortName, href: maintenanceUrl(f) }],
  };
}

export function rental(ctx) {
  const { site, services, products } = ctx;
  const s = services.locacao;
  const message = `Olá, EquimedPR! Vim pelo site e gostaria de um orçamento de locação.\n\nEquipamento: \nPeríodo ou procedimento: \nCidade: \n`;
  const list = products.filter((p) => p.services.includes('locacao')).slice(0, 6);
  const body = `
${pageHeader(s.heading, s.lead, { eyebrow: 'Por procedimento, por período ou como reserva', ctx, photoName: s.photo, photos: s.photos, photoAlt: 'Perfurador Stryker System 7' })}
<section class="section container service-layout">
  <div class="prose">
    ${s.intro.map((p) => `<p>${esc(p)}</p>`).join('\n    ')}
    <h2>${esc(s.items.title)}</h2>
    ${checklist(s.items.list)}
    <h2>${esc(s.modes.title)}</h2>
    <ul class="modes">${s.modes.list.map((m) => `<li><h3>${esc(m.title)}</h3><p>${esc(m.text)}</p></li>`).join('')}</ul>
  </div>
  ${aside(site, { message, place: 'locacao' })}
</section>
<section class="section section--tint"><div class="container">
  <h2 class="section__title">Equipamentos com locação disponível</h2>
  <ul class="grid grid--3">${list.map((p, i) => productCard(ctx, p, { eager: i < 3 })).join('')}</ul>
  <p class="section__foot"><a class="button button--ghost" href="/equipamentos/">Todos os equipamentos ${icon('arrow', 16)}</a></p>
</div></section>
${faq(s.faq)}
${ctaBar(site, { title: 'Precisa de um equipamento para o próximo procedimento?', message, place: 'locacao-cta' })}`;
  return { title: s.title, description: s.description, body, jsonLd: [serviceJsonLd(site, s, s.description), faqJsonLd(s.faq)].filter(Boolean), breadcrumbs: [{ name: s.name, href: '/locacao/' }] };
}

export function sales(ctx) {
  const { site, services, products, families } = ctx;
  const s = services.venda;
  const message = `Olá, EquimedPR! Vim pelo site e tenho interesse em comprar um equipamento.\n\nEquipamento: \nMarca/modelo: \n`;
  const forSale = products.filter((p) => p.services.includes('venda'));
  const body = `
${pageHeader(s.heading, s.lead, { eyebrow: 'Seminovos revisados com garantia', ctx, photoName: s.photo, photos: s.photos, photoAlt: 'Perfuradores e serras Stryker revisados' })}
<section class="section container service-layout">
  <div class="prose">
    ${s.intro.map((p) => `<p>${esc(p)}</p>`).join('\n    ')}
    <h2>${esc(s.items.title)}</h2>
    ${checklist(s.items.list)}
    <p class="notice">${icon('tag', 18)} <span>${esc(site.scopeNotice)}</span></p>
  </div>
  ${aside(site, { message, place: 'venda' })}
</section>
${families.filter((f) => forSale.some((p) => p.family === f.slug)).map((f, fi) => `
<section class="section${fi % 2 ? '' : ' section--tint'}"><div class="container">
  <h2 class="section__title"><a href="${familyUrl(f)}">${esc(f.name)}</a></h2>
  <ul class="grid grid--3">${forSale.filter((p) => p.family === f.slug).map((p, i) => productCard(ctx, p, { eager: fi === 0 && i < 3 })).join('')}</ul>
</div></section>`).join('')}
${faq(s.faq)}
${ctaBar(site, { title: 'Não encontrou o modelo? Consulte-nos.', message, place: 'venda-cta' })}`;
  return { title: s.title, description: s.description, body, jsonLd: [serviceJsonLd(site, s, s.description), faqJsonLd(s.faq)].filter(Boolean), breadcrumbs: [{ name: s.name, href: '/venda/' }] };
}

export function software(ctx) {
  const { site, services, products } = ctx;
  const s = services.software;
  const message = `Olá, EquimedPR! Vim pelo site e preciso de uma solução de software.\n\nEquipamento: \nMarca/modelo: \nSituação: (atualização / desbloqueio / desenvolvimento)\n`;
  const charger = products.find((p) => p.slug === 'carregador-de-bateria-inteligente');
  const body = `
${pageHeader(s.heading, s.lead, { eyebrow: 'Atualização, desbloqueio e desenvolvimento', ctx, photoName: s.photo, photoAlt: 'Técnico reparando uma placa eletrônica na bancada' })}
<section class="section container service-layout">
  <div class="prose">
    ${s.intro.map((p) => `<p>${esc(p)}</p>`).join('\n    ')}
  </div>
  ${aside(site, { message, place: 'software' })}
</section>
<section class="section section--tint"><div class="container">
  <ul class="grid grid--3">
    ${s.areas.map((a, i) => `<li class="card"><div class="card__link"><div class="card__body"><p class="card__brand">0${i + 1}</p><h2 class="card__title">${esc(a.title)}</h2><p class="card__text">${esc(a.text)}</p>${checklist(a.list)}</div></div></li>`).join('\n    ')}
  </ul>
</div></section>
<section class="section container">
  <div class="panel">
    <span class="panel__icon">${icon('battery', 28)}</span>
    <div>
      <h2>Carregador inteligente EquimedPR</h2>
      <p>${esc(charger.summary)}</p>
      <p><a class="button button--primary" href="${productUrl(charger)}">Ver o carregador inteligente ${icon('arrow', 16)}</a></p>
    </div>
  </div>
</section>
${faq(s.faq)}
${ctaBar(site, { title: 'Equipamento bloqueado ou desatualizado?', message, place: 'software-cta' })}`;
  return { title: s.title, description: s.description, body, jsonLd: [serviceJsonLd(site, s, s.description), faqJsonLd(s.faq)].filter(Boolean), breadcrumbs: [{ name: s.name, href: '/software/' }] };
}

/* ---------------- Equipment ---------------- */
export function equipment(ctx) {
  const { site, copy, families, brands } = ctx;
  const c = copy.equipamentos;
  const body = `
${pageHeader(c.heading, c.lead)}
<section class="section container">
  ${sectionHead('01', c.familiesTitle)}
  <ul class="fams">
    ${families.map((f) => familyCard(ctx, f)).join('\n    ')}
  </ul>
</section>
<section class="section section--tint"><div class="container">
  ${sectionHead('02', c.brandsTitle)}
  <ul class="brand-grid">
    ${brands.filter((b) => b.focus).map((b) => brandTile(ctx, b)).join('\n    ')}
  </ul>
  <p class="section__foot"><a class="button button--ghost" href="/marcas/">Todas as marcas ${icon('arrow', 16)}</a></p>
  ${independence(site)}
</div></section>
${ctaBar(site)}`;
  return { title: c.title, description: c.description, body, breadcrumbs: [{ name: 'Equipamentos', href: '/equipamentos/' }] };
}

export function family(ctx, f) {
  const { site } = ctx;
  const title = fitTitle(f.name);
  const message = `Olá, EquimedPR! Vim pelo site e procuro ${f.shortName.toLowerCase()}.\n\nMarca/modelo: \nPreciso de: (manutenção / locação / compra)\n`;
  const serviced = f.products.filter((p) => !p.services.includes('venda') && !p.services.includes('locacao'));
  const available = f.products.filter((p) => p.services.includes('venda') || p.services.includes('locacao'));
  const grid = (list, label) => list.length ? `
<section class="section container">
  <h2 class="section__title">${label}</h2>
  <ul class="grid grid--3">${list.map((p, i) => productCard(ctx, p, { level: 3, eager: i < 3 })).join('')}</ul>
</section>` : '';
  const body = `
${pageHeader(f.name, f.lead, { ctx, photoName: f.photo, photos: f.photos, photoAlt: f.name, eyebrow: 'Equipamentos atendidos', extra: f.maintenance ? `<p><a class="button button--primary" href="${maintenanceUrl(f)}">${icon('wrench', 18)} Manutenção de ${esc(f.shortName.toLowerCase())}</a></p>` : '' })}
${grid(available, 'Disponíveis para venda ou locação')}
${grid(serviced, 'Atendidos em manutenção')}
${f.maintenance ? `<section class="section section--tint"><div class="container">${sectionHead(null, 'Marcas e modelos atendidos em manutenção')}${modelCards(ctx, f.maintenance.brands.map((b) => ({ slug: b.slug, name: b.brand, models: b.models })))}<p><a class="button button--ghost" href="${maintenanceUrl(f)}">Defeitos comuns e o que fazemos ${icon('arrow', 16)}</a></p></div></section>` : ''}
${ctaBar(site, { title: `Não encontrou o modelo? Consulte-nos sobre ${f.shortName.toLowerCase()}.`, message, place: `familia-${f.slug}` })}`;
  const jsonLd = [{ '@type': 'ItemList', name: f.name, itemListElement: f.products.map((p, i) => ({ '@type': 'ListItem', position: i + 1, url: site.url + productUrl(p), name: p.name })) }];
  return {
    title, description: fitDescription(f.description), body, jsonLd,
    breadcrumbs: [{ name: 'Equipamentos', href: '/equipamentos/' }, { name: f.shortName, href: familyUrl(f) }],
  };
}

export function product(ctx, p) {
  const { site } = ctx;
  const fullName = p.name;
  const title = fitTitle(fullName);
  const sells = p.services.includes('venda') || p.services.includes('locacao');
  const description = fitDescription(p.summary, sells ? ' Venda, locação e manutenção. EquimedPR, Curitiba.' : ' Manutenção pela EquimedPR, Curitiba.');
  const message = `Olá, EquimedPR! Vim pelo site e tenho interesse em:\n${fullName}\n${site.url}${productUrl(p)}\n\nPreciso de: (${p.services.map((s) => SERVICE_LABEL[s].toLowerCase()).join(' / ')})\n`;
  const related = p.familyRef.products.filter((x) => x.slug !== p.slug).slice(0, 3);
  const body = `
<article class="product container">
  ${p.image ? `<figure class="product__media frame">${img(ctx, `/assets/img/products/${p.image}.webp`, fullName, { lazy: false, sizes: '(min-width: 64rem) 45vw, 100vw' })}<figcaption>${p.condition === 'seminovo' ? 'Foto · equipamento seminovo do estoque EquimedPR' : 'Foto · equipamento atendido na bancada EquimedPR'}</figcaption></figure>` : `<figure class="product__media product__media--icon">${icon(p.familyRef.icon, 96)}<figcaption>Foto real em breve</figcaption></figure>`}
  <div class="product__body">
    <p class="eyebrow"><a href="${familyUrl(p.familyRef)}">${esc(p.familyRef.name)}</a>${p.brandRef ? ` · <a href="${brandUrl(p.brandRef)}">${esc(p.brandRef.name)}</a>` : p.brand ? ` · ${esc(p.brand)}` : ''}</p>
    <h1>${esc(p.name)}</h1>
    ${p.model ? `<p class="product__model">${esc(p.model)}</p>` : ''}
    <ul class="status">
      ${p.services.includes('venda') ? `<li class="status__pill status__pill--ok">${icon('check', 16)} Disponível para venda</li>` : ''}
      ${p.services.includes('locacao') ? `<li class="status__pill status__pill--ok">${icon('check', 16)} Disponível para locação</li>` : ''}
      ${p.services.includes('manutencao') ? `<li class="status__pill status__pill--petrol">${icon('wrench', 16)} Atendido em manutenção</li>` : ''}
      ${p.condition === 'seminovo' ? `<li class="status__pill status__pill--warm">${icon('shield', 16)} Seminovo revisado · 3 meses de garantia</li>` : ''}
    </ul>
    <div class="prose">
      <p>${esc(p.summary)}</p>
      ${(p.paragraphs ?? []).map((t) => `<p>${esc(t)}</p>`).join('\n      ')}
      ${p.list ? `<h2>${esc(p.list.title)}</h2>${checklist(p.list.items)}` : ''}
      ${p.condition === 'seminovo' ? `<h2>Condição</h2>${checklist(['Seminovo revisado em bancada', 'Testado conforme a especificação da linha', `Garantia de ${site.warranty.used}`, 'Relatório de revisão acompanha o equipamento'])}` : ''}
      ${
        p.specs?.length
          ? `<h2>Especificações</h2>
      <table class="specs"><tbody>${p.specs.map(([k, v]) => `<tr><th scope="row">${esc(k)}</th><td>${esc(v)}</td></tr>`).join('')}</tbody></table>`
          : ''
      }
      ${p.familyRef.maintenance ? `<h2>Manutenção</h2><p>Atendemos ${esc(p.familyRef.shortName.toLowerCase())} desta linha em manutenção corretiva e preventiva. <a href="${maintenanceUrl(p.familyRef)}">Veja os defeitos mais comuns e o que fazemos</a>.</p>` : ''}
    </div>
    <div class="product__cta">
      <a class="button button--whatsapp button--lg" href="${wa(site, message)}" target="_blank" rel="noopener" data-track="whatsapp_click" data-place="produto">${icon('whatsapp', 20)} Solicitar orçamento pelo WhatsApp</a>
      <a class="button button--ghost button--lg" href="/contato/?produto=${encodeURIComponent(fullName)}">Enviar por e-mail</a>
    </div>
    ${independence(site)}
  </div>
</article>
${
  related.length
    ? `<section class="section section--tint"><div class="container">
  <h2 class="section__title">Outros em ${esc(p.familyRef.shortName.toLowerCase())}</h2>
  <ul class="grid grid--3">${related.map((r) => productCard(ctx, r)).join('')}</ul>
</div></section>`
    : ''
}`;
  const image = p.image ? `${site.url}/assets/img/products/${p.image}.webp` : `${site.url}/assets/img/site/og-image.png`;
  const jsonLd = sells
    ? [{
        '@type': 'Product', name: fullName, image, description: p.summary,
        ...(p.brand ? { brand: { '@type': 'Brand', name: p.brand } } : {}),
        ...(p.model ? { model: p.model } : {}),
        category: p.familyRef.name,
        offers: {
          '@type': 'Offer', availability: 'https://schema.org/InStock',
          itemCondition: p.condition === 'seminovo' ? 'https://schema.org/RefurbishedCondition' : 'https://schema.org/NewCondition',
          priceCurrency: 'BRL', seller: { '@id': `${site.url}/#organization` }, url: site.url + productUrl(p),
        },
      }]
    : [{ '@type': 'Service', name: `Manutenção de ${fullName}`, serviceType: 'Manutenção', provider: { '@id': `${site.url}/#organization` }, areaServed: { '@type': 'Country', name: 'Brasil' }, description: p.summary }];
  return {
    title, description, body, jsonLd,
    ogType: sells ? 'product' : 'website',
    ogImage: p.image ? `/assets/img/products/${p.image}.webp` : undefined,
    breadcrumbs: [{ name: 'Equipamentos', href: '/equipamentos/' }, { name: p.familyRef.shortName, href: familyUrl(p.familyRef) }, { name: p.name, href: productUrl(p) }],
  };
}

/* ---------------- Brands ---------------- */
export function brandsPage(ctx) {
  const { site, copy, brands } = ctx;
  const b = copy.brands;
  const body = `
${pageHeader(b.heading, b.lead)}
<section class="section container">
  <h2 class="section__title">${esc(b.focusTitle)}</h2>
  <ul class="brand-grid">
    ${brands.filter((x) => x.focus).map((x) => brandTile(ctx, x)).join('\n    ')}
  </ul>
</section>
<section class="section section--tint"><div class="container">
  <h2 class="section__title">${esc(b.othersTitle)}</h2>
  <ul class="brand-grid brand-grid--compact">
    ${brands.filter((x) => !x.focus).map((x) => brandTile(ctx, x)).join('\n    ')}
  </ul>
  ${independence(site)}
</div></section>
${ctaBar(site)}`;
  return { title: b.title, description: b.description, body, breadcrumbs: [{ name: 'Equipamentos', href: '/equipamentos/' }, { name: 'Marcas', href: '/marcas/' }] };
}

export function brand(ctx, b) {
  const { site, families, products } = ctx;
  const fams = b.families.map((s) => families.find((f) => f.slug === s)).filter(Boolean);
  const list = products.filter((p) => p.brandSlug === b.slug);
  const message = `Olá, EquimedPR! Vim pelo site e tenho um equipamento ${b.name}.\n\nModelo: \nPreciso de: (manutenção / locação / compra / software)\n`;
  const title = fitTitle(b.focus ? `Assistência técnica ${b.name}: manutenção e equipamentos` : `Equipamentos ${b.name}: manutenção`);
  const description = fitDescription(b.description ?? `Assistência técnica independente em equipamentos ${b.name}: ${b.lead}`);
  const body = `
${pageHeader(b.focus ? `Assistência técnica em equipamentos ${b.name}` : `Equipamentos ${b.name}`, b.lead, { eyebrow: 'Assistência técnica independente' })}
<section class="section container service-layout">
  <div class="prose">
    ${(b.paragraphs ?? [`Atendemos equipamentos ${b.name} em manutenção, conforme a família do equipamento. Envie o modelo e o defeito pelo WhatsApp para a avaliação técnica.`]).map((p) => `<p>${esc(p)}</p>`).join('\n    ')}
    ${independence(site)}
    ${fams.length ? `<h2>Famílias atendidas</h2><ul class="pills">${fams.map((f) => `<li><a href="${f.maintenance ? maintenanceUrl(f) : familyUrl(f)}">${esc(f.shortName)}</a></li>`).join('')}</ul>` : ''}
    ${(() => { const rows = fams.filter((f) => f.maintenance).map((f) => { const m = f.maintenance.brands.find((x) => x.slug === b.slug || (b.slug === 'conmed' && x.slug === 'linvatec') || (b.slug === 'nacionais-e-chineses' && x.slug === null)); return m ? { head: `<a class="mcard__head mcard__head--icon" href="${maintenanceUrl(f)}" aria-label="${esc(f.shortName)}">${icon(f.icon, 26)}</a>`, name: f.shortName, models: m.models } : null; }).filter(Boolean); return rows.length ? `<h2>Modelos atendidos</h2>${modelCards(ctx, rows)}` : ''; })()}
  </div>
  ${aside(site, { message, place: `marca-${b.slug}` })}
</section>
${list.length ? `<section class="section section--tint"><div class="container"><h2 class="section__title">Equipamentos ${esc(b.name)} no site</h2><ul class="grid grid--3">${list.map((p, i) => productCard(ctx, p, { eager: i < 3 })).join('')}</ul></div></section>` : ''}
${ctaBar(site, { title: `Tem um equipamento ${b.name} parado?`, message, place: `marca-${b.slug}-cta` })}`;
  return {
    title, description, body,
    jsonLd: [{ '@type': 'Service', name: `Assistência técnica em equipamentos ${b.name}`, serviceType: 'Manutenção', provider: { '@id': `${site.url}/#organization` }, areaServed: { '@type': 'Country', name: 'Brasil' }, description }],
    breadcrumbs: [{ name: 'Equipamentos', href: '/equipamentos/' }, { name: 'Marcas', href: '/marcas/' }, { name: b.name, href: brandUrl(b) }],
  };
}

/* ---------------- Articles ---------------- */
export function articles(ctx) {
  const { site, copy, articles } = ctx;
  const c = copy.conteudo;
  const body = `
${pageHeader(c.heading, c.lead)}
<section class="section container">
  <ul class="grid grid--3">
    ${articles.map((a) => articleCard(a, { level: 2 })).join('\n    ')}
  </ul>
</section>
${ctaBar(site)}`;
  return { title: c.title, description: c.description, body, breadcrumbs: [{ name: 'Conteúdo técnico', href: '/conteudo/' }] };
}

export function article(ctx, a) {
  const { site, families, articles } = ctx;
  const fams = a.families.map((s) => families.find((f) => f.slug === s)).filter(Boolean);
  const others = articles.filter((x) => x.slug !== a.slug).slice(0, 3);
  const body = `
<article class="article container">
  <header class="article__head">
    <p class="eyebrow"><a href="/conteudo/">Conteúdo técnico</a> · ${esc(a.readingMinutes)} min de leitura</p>
    <h1>${esc(a.title)}</h1>
    <p class="lead">${esc(a.description)}</p>
    <p class="small">Publicado em <time datetime="${a.date}">${new Date(a.date + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}</time> pela equipe técnica da EquimedPR.</p>
  </header>
  <div class="article__grid">
    <div class="prose">
      ${a.sections.map((s) => `<h2>${esc(s.h)}</h2>${(s.p ?? []).map((p) => `<p>${esc(p)}</p>`).join('')}${s.list ? `<ul>${s.list.map((i) => `<li>${esc(i)}</li>`).join('')}</ul>` : ''}`).join('\n      ')}
      ${fams.length ? `<h2>Páginas relacionadas</h2><ul class="pills">${fams.map((f) => `<li><a href="${f.maintenance ? maintenanceUrl(f) : familyUrl(f)}">${esc(f.maintenance ? f.maintenance.title : f.name)}</a></li>`).join('')}</ul>` : ''}
    </div>
    ${aside(site, { title: 'Fale com a equipe técnica', text: 'Dúvida sobre o seu equipamento? Envie marca, modelo e o sintoma.', place: `artigo-${a.slug}` })}
  </div>
</article>
<section class="section section--tint"><div class="container"><h2 class="section__title">Mais conteúdo técnico</h2><ul class="grid grid--3">${others.map((x) => articleCard(x)).join('')}</ul></div></section>
${ctaBar(site)}`;
  return {
    title: fitTitle(a.metaTitle), description: fitDescription(a.description), body, ogType: 'article',
    jsonLd: [{ '@type': 'TechArticle', headline: a.title, description: a.description, datePublished: a.date, dateModified: a.date, inLanguage: 'pt-BR', author: { '@id': `${site.url}/#organization` }, publisher: { '@id': `${site.url}/#organization` }, mainEntityOfPage: site.url + articleUrl(a) }],
    breadcrumbs: [{ name: 'Conteúdo técnico', href: '/conteudo/' }, { name: a.title, href: articleUrl(a) }],
  };
}

/* ---------------- About ---------------- */
export function about(ctx) {
  const { site, copy } = ctx;
  const a = copy.about;
  const body = `
${pageHeader(a.heading, a.lead)}
<section class="section container service-layout">
  <div class="prose">
    ${a.paragraphs.map((p) => `<p>${esc(p)}</p>`).join('\n    ')}
    <h2>${esc(a.valuesTitle)}</h2>
    <ul class="modes">${a.values.map((v) => `<li><h3>${esc(v.title)}</h3><p>${esc(v.text)}</p></li>`).join('')}</ul>
    ${independence(site)}
  </div>
  ${aside(site, { place: 'sobre' })}
</section>
${ctaBar(site)}`;
  return { title: a.title, description: a.description, body, jsonLd: [{ '@type': 'AboutPage', name: a.heading, url: `${site.url}/sobre/` }], breadcrumbs: [{ name: 'Sobre', href: '/sobre/' }] };
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
        <option value="Software">Software: atualização ou desbloqueio</option>
        <option value="Outro">Outro assunto</option>
      </select>
    </div>
    <div class="field">
      <label for="f-equipamento">Equipamento (marca, modelo e número de série)</label>
      <input id="f-equipamento" name="equipamento" type="text" placeholder="Ex.: Perfurador Stryker System 7">
    </div>
    <div class="field">
      <label for="f-mensagem">Mensagem</label>
      <textarea id="f-mensagem" name="mensagem" rows="5" required minlength="4" placeholder="Descreva o defeito ou a necessidade."></textarea>
    </div>
    <div class="contact-form__actions">
      <button class="button button--whatsapp button--lg" type="submit" value="whatsapp" name="via">${icon('whatsapp', 20)} Enviar pelo WhatsApp</button>
      <button class="button button--ghost button--lg" type="submit" value="email" name="via">Enviar por e-mail</button>
    </div>
    <p class="small">O envio abre o WhatsApp ou o seu programa de e-mail com a mensagem pronta. Este site não armazena os dados do formulário. <a href="/privacidade/">Política de privacidade</a>.</p>
    <noscript><p class="small">Com JavaScript desativado, envie diretamente para <a href="mailto:${site.email}">${esc(site.email)}</a> ou pelo <a href="${wa(site)}">WhatsApp</a>.</p></noscript>
  </form>
  <aside class="aside-card">
    <h2>Canais de atendimento</h2>
    <p>${icon('whatsapp', 18)} <a href="${wa(site)}" target="_blank" rel="noopener" data-track="whatsapp_click" data-place="contato">WhatsApp ${esc(site.whatsapp.display)}</a></p>
    ${site.phones.map((p) => `<p>${icon('phone', 18)} <a href="tel:${p.e164}" data-track="phone_click">${esc(p.display)}</a></p>`).join('\n    ')}
    <p>${icon('mail', 18)} <a href="mailto:${site.email}" data-track="email_click">${esc(site.email)}</a></p>
    <p>${icon('clock', 18)} ${esc(site.openingHoursDisplay)}</p>
    <h2>Endereço</h2>
    <address>
      <p>${icon('pin', 18)} ${esc(a.street)}<br>${esc(a.neighborhood)}, ${esc(a.city)} - ${esc(a.state)}<br>CEP ${esc(a.postalCode)}</p>
    </address>
    <a class="button button--ghost button--block" href="${a.mapsUrl}" target="_blank" rel="noopener">${icon('map', 18)} Abrir no Google Maps</a>
    <p class="small">${icon('truck', 16)} Recebemos equipamentos de todo o Brasil por transportadora. Combine o envio pelo WhatsApp antes de despachar.</p>
  </aside>
</section>`;
  return {
    title: c.title, description: c.description, body,
    jsonLd: [{ '@type': 'ContactPage', name: c.heading, url: `${site.url}/contato/` }],
    breadcrumbs: [{ name: 'Contato', href: '/contato/' }],
  };
}

/* ---------------- Privacy ---------------- */
export function privacy(ctx) {
  const { site, copy } = ctx;
  const p = copy.privacy;
  const an = site.analytics ?? {};
  const body = `
${pageHeader(p.heading, 'Como tratamos os dados de quem entra em contato pelo site e quais cookies podem ser usados.')}
<section class="section container prose">
  <p class="small">Última atualização: <time datetime="${p.updated}">${new Date(p.updated + 'T12:00:00').toLocaleDateString('pt-BR')}</time>.</p>
  <h2>Quem somos</h2>
  <p>${esc(site.legalName)} (${esc(site.name)}), ${esc(site.address.street)}, ${esc(site.address.neighborhood)}, ${esc(site.address.city)} - ${esc(site.address.state)}, CEP ${esc(site.address.postalCode)}. Contato: <a href="mailto:${site.email}">${esc(site.email)}</a>.</p>
  <h2>Dados que recebemos</h2>
  <p>Este site não possui banco de dados nem armazena formulários. O formulário de contato monta uma mensagem e a abre no seu WhatsApp ou no seu programa de e-mail; os dados seguem diretamente para os nossos canais de atendimento (WhatsApp Business e e-mail), onde ficam guardados pelo tempo necessário para responder, orçar e executar o serviço, e pelos prazos legais de guarda de documentos fiscais e de garantia.</p>
  <p>Os dados tratados são os que você informa: nome, empresa, telefone, e-mail, equipamento e descrição do problema. A base legal é a execução de procedimentos preliminares ao contrato e o legítimo interesse em responder ao seu pedido (LGPD, art. 7º, V e IX).</p>
  <h2>Cookies e medição</h2>
  ${an.ga4MeasurementId || an.metaPixelId
    ? `<p>Com o seu consentimento, este site usa ${[an.ga4MeasurementId && 'o Google Analytics 4', an.metaPixelId && 'o Pixel da Meta'].filter(Boolean).join(' e ')} para medir visitas e a origem dos contatos (cliques em WhatsApp, telefone e formulário). Nenhum desses serviços é carregado antes de você aceitar no aviso de cookies, e a escolha pode ser alterada a qualquer momento abaixo.</p>
  <p><button class="button button--ghost" type="button" data-consent="reset">Alterar minha escolha de cookies</button></p>`
    : `<p>No momento este site não usa cookies de medição nem de publicidade. Se isso mudar, um aviso de consentimento será exibido e esta página será atualizada.</p>`}
  <p>Cookies estritamente necessários: o site guarda no seu navegador apenas a sua escolha sobre cookies, quando houver aviso de consentimento.</p>
  <h2>Compartilhamento</h2>
  <p>Não vendemos nem cedemos dados pessoais. Dados podem ser compartilhados com transportadoras (para envio e devolução de equipamentos) e com provedores de serviço essenciais (hospedagem, e-mail, WhatsApp), limitados ao necessário.</p>
  <h2>Seus direitos</h2>
  <p>Você pode pedir confirmação, acesso, correção, anonimização ou eliminação dos seus dados, e revogar o consentimento, pelo e-mail <a href="mailto:${site.email}">${esc(site.email)}</a>. Respondemos nos prazos previstos na LGPD (Lei 13.709/2018).</p>
  <h2>Links e marcas</h2>
  <p>Links externos (WhatsApp, Google Maps, Facebook) estão sujeitos às políticas dos respectivos serviços. ${esc(site.independenceNotice)}</p>
  <h2 id="creditos">Créditos de imagens</h2>
  <p>Fotos de produtos: acervo EquimedPR. Fotos de ambiente cirúrgico, usadas com atribuição conforme a licença de cada autor:</p>
  <ul>${ctx.credits.map((c) => `<li><a href="${c.source}" rel="noopener">${esc(c.title)}</a>, ${esc(c.author)}, ${c.licenseUrl ? `<a href="${c.licenseUrl}" rel="noopener">${esc(c.license)}</a>` : esc(c.license)}, via Wikimedia Commons.</li>`).join('')}</ul>
</section>`;
  return { title: p.title, description: p.description, body, breadcrumbs: [{ name: 'Privacidade', href: '/privacidade/' }] };
}

/* ---------------- 404 and redirects ---------------- */
export function notFound(ctx) {
  const { site } = ctx;
  const body = `
<section class="section container prose">
  <h1>Página não encontrada</h1>
  <p>O endereço pode ter mudado com o novo site. Use o menu ou os atalhos abaixo.</p>
  <p class="actions"><a class="button button--primary" href="/">Página inicial</a> <a class="button button--ghost" href="/equipamentos/">Equipamentos</a> <a class="button button--ghost" href="/manutencao/">Manutenção</a> <a class="button button--ghost" href="/contato/">Contato</a></p>
</section>`;
  return { title: `Página não encontrada | ${site.name}`, description: 'A página solicitada não existe.', body, noindex: true };
}

export function redirect(ctx, to, name) {
  const body = `
<section class="section container prose">
  <h1>Esta página mudou de endereço</h1>
  <p>Você será levado para <a href="${to}">${esc(name)}</a>.</p>
</section>`;
  return { title: `${name} | ${ctx.site.name}`, description: `O endereço desta página mudou. Novo endereço: ${to}.`, body, noindex: true, redirect: to, canonical: to };
}
