import { esc, join, whatsappUrl, icon } from './helpers.mjs';

const navLink = (item, path) => {
  const active = item.href === '/' ? path === '/' : path.startsWith(item.href);
  return `<li><a href="${item.href}"${active ? ' aria-current="page"' : ''}>${esc(item.label)}</a></li>`;
};

const header = (ctx, path) => {
  const { site } = ctx;
  return `
<header class="site-header">
  <div class="container site-header__row">
    <a class="brand" href="/">
      ${ctx.logoSvg}
    </a>
    <nav class="site-nav" aria-label="Principal">
      <button class="site-nav__toggle" popovertarget="site-menu" aria-label="Abrir menu">${icon('menu')}</button>
      <div id="site-menu" popover class="site-nav__panel">
        <button class="site-nav__close" popovertarget="site-menu" popovertargetaction="hide" aria-label="Fechar menu">${icon('close')}</button>
        <ul class="site-nav__list">
          ${site.nav.map((i) => navLink(i, path)).join('\n          ')}
        </ul>
        <a class="button button--whatsapp site-nav__cta" href="${whatsappUrl(site)}" target="_blank" rel="noopener">${icon('whatsapp', 20)} Orçamento pelo WhatsApp</a>
      </div>
    </nav>
  </div>
</header>`;
};

const footer = (ctx) => {
  const { site, catalog } = ctx;
  const a = site.address;
  return `
<footer class="site-footer">
  <div class="container site-footer__grid">
    <section class="site-footer__col">
      <h2 class="site-footer__title">${esc(site.name)}</h2>
      <p>Atuamos no segmento de locação e manutenção de equipamentos médicos e venda de equipamentos veterinários. Temos orgulho em ser uma das principais empresas no segmento de assistência técnica voltada a equipamentos de videocirurgia.</p>
      <p><a href="${site.sisterCompany.url}" rel="noopener">${esc(site.sisterCompany.name)}</a>: ${esc(site.sisterCompany.description)}</p>
    </section>
    <section class="site-footer__col">
      <h2 class="site-footer__title">Especialidades</h2>
      <ul class="site-footer__list">
        ${catalog.specialties.map((s) => `<li><a href="/especialidades/${s.slug}/">${esc(s.name)}</a></li>`).join('\n        ')}
        <li><a href="/servicos/manutencao/">Assistência técnica</a></li>
        <li><a href="/servicos/locacao/">Locação</a></li>
        <li><a href="/servicos/venda/">Venda</a></li>
      </ul>
    </section>
    <section class="site-footer__col">
      <h2 class="site-footer__title">Contato</h2>
      <address class="site-footer__address">
        <p>${icon('pin', 18)} <a href="${site.address.mapsUrl}" target="_blank" rel="noopener">${esc(a.street)}<br>${esc(a.neighborhood)}, ${esc(a.city)} - ${esc(a.state)}, CEP ${esc(a.postalCode)}</a></p>
        ${site.phones.map((p) => `<p>${icon('phone', 18)} <a href="tel:${p.e164}">${esc(p.display)}</a></p>`).join('\n        ')}
        <p>${icon('whatsapp', 18)} <a href="${whatsappUrl(site)}" target="_blank" rel="noopener">WhatsApp ${esc(site.whatsapp.display)}</a></p>
        <p>${icon('mail', 18)} <a href="mailto:${site.email}">${esc(site.email)}</a></p>
        <p>${icon('clock', 18)} ${esc(site.openingHoursDisplay)}</p>
      </address>
    </section>
  </div>
  <div class="container site-footer__bottom">
    <p>© ${new Date().getFullYear()} ${esc(site.name)}. Todos os direitos reservados.</p>
    <p><a href="${site.social.facebook}" target="_blank" rel="noopener" aria-label="Facebook da Equimed">${icon('facebook', 18)} Facebook</a> · <a href="/sitemap.xml">Mapa do site</a></p>
  </div>
</footer>
<a class="whatsapp-fab" href="${whatsappUrl(site)}" target="_blank" rel="noopener" aria-label="Falar no WhatsApp">${icon('whatsapp', 32)}<span>Falar no WhatsApp</span></a>`;
};

const breadcrumbs = (items) =>
  items?.length
    ? `<nav class="breadcrumbs container" aria-label="Você está em">
  <ol>
    <li><a href="/">Início</a></li>
    ${items.map((b, i) => (i === items.length - 1 ? `<li aria-current="page">${esc(b.name)}</li>` : `<li><a href="${b.href}">${esc(b.name)}</a></li>`)).join('\n    ')}
  </ol>
</nav>`
    : '';

const breadcrumbJsonLd = (site, items) => ({
  '@type': 'BreadcrumbList',
  itemListElement: [{ name: 'Início', href: '/' }, ...items].map((b, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: b.name,
    item: site.url + b.href,
  })),
});

const organizationJsonLd = (site) => ({
  '@type': ['MedicalBusiness', 'LocalBusiness'],
  '@id': `${site.url}/#organization`,
  name: site.name,
  legalName: site.legalName,
  url: site.url,
  logo: `${site.url}/assets/img/site/logo.svg`,
  image: `${site.url}/assets/img/site/og-image.webp`,
  description: site.shortDescription,
  foundingDate: String(site.foundingYear),
  telephone: site.phones[0].e164,
  email: site.email,
  address: {
    '@type': 'PostalAddress',
    streetAddress: site.address.street,
    addressLocality: site.address.city,
    addressRegion: site.address.state,
    postalCode: site.address.postalCode,
    addressCountry: site.address.country,
  },
  geo: { '@type': 'GeoCoordinates', latitude: site.geo.latitude, longitude: site.geo.longitude },
  openingHours: site.openingHours,
  areaServed: [{ '@type': 'City', name: 'Curitiba' }, { '@type': 'State', name: 'Paraná' }, { '@type': 'Country', name: 'Brasil' }],
  contactPoint: [
    { '@type': 'ContactPoint', contactType: 'sales', telephone: site.phones[0].e164, availableLanguage: 'Portuguese' },
    { '@type': 'ContactPoint', contactType: 'customer support', telephone: site.phones[1].e164, availableLanguage: 'Portuguese' },
  ],
  sameAs: [site.social.facebook, whatsappUrl(site)],
});

/**
 * Wraps a page body in the shared document shell.
 * page: { title, description, body, path, breadcrumbs?, jsonLd?, ogImage?, ogType?, noindex? }
 */
export function layout(ctx, page) {
  const { site } = ctx;
  const canonical = site.url + page.path.replace(/404\.html$/, '');
  const ogImage = site.url + (page.ogImage ?? '/assets/img/site/og-image.webp');
  const graph = [organizationJsonLd(site), page.breadcrumbs?.length && breadcrumbJsonLd(site, page.breadcrumbs), ...(page.jsonLd ?? [])].filter(Boolean);
  const jsonLd = JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }).replace(/</g, '\\u003c');

  return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(page.title)}</title>
<meta name="description" content="${esc(page.description)}">
<link rel="canonical" href="${canonical}">
${page.noindex ? '<meta name="robots" content="noindex">' : '<meta name="robots" content="index,follow,max-image-preview:large">'}
<meta name="google-site-verification" content="${site.googleSiteVerification}">
<meta name="theme-color" content="#1d4ed8">
<meta name="color-scheme" content="light dark">
<meta property="og:locale" content="pt_BR">
<meta property="og:type" content="${page.ogType ?? 'website'}">
<meta property="og:site_name" content="${esc(site.name)}">
<meta property="og:title" content="${esc(page.title)}">
<meta property="og:description" content="${esc(page.description)}">
<meta property="og:url" content="${canonical}">
<meta property="og:image" content="${ogImage}">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="/assets/img/site/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/assets/img/site/apple-touch-icon.png">
<link rel="manifest" href="/assets/site.webmanifest">
<link rel="stylesheet" href="/assets/css/main.css">
<script type="application/ld+json">${jsonLd}</script>
</head>
<body>
<a class="skip-link" href="#conteudo">Pular para o conteúdo</a>
${header(ctx, page.path)}
${breadcrumbs(page.breadcrumbs)}
<main id="conteudo">
${page.body}
</main>
${footer(ctx)}
<script src="/assets/js/main.js" type="module"></script>
</body>
</html>
`;
}

export { join };
