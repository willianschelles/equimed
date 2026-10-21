import { esc, join, whatsappUrl, icon, familyUrl, brandUrl } from './helpers.mjs';

const navLink = (item, path) => {
  const active = item.href === '/' ? path === '/' : path.startsWith(item.href);
  return `<li><a href="${item.href}"${active ? ' aria-current="page"' : ''}${item.title ? ` title="${esc(item.title)}"` : ''}>${esc(item.label)}</a></li>`;
};

const header = (ctx, path) => {
  const { site } = ctx;
  return `
<header class="site-header">
  <div class="container site-header__row">
    <a class="brand" href="/" title="Página inicial">
      ${ctx.logoSvg}
    </a>
    <nav class="site-nav" aria-label="Principal">
      <button class="site-nav__toggle" popovertarget="site-menu" aria-label="Abrir menu">${icon('menu')}</button>
      <div id="site-menu" popover class="site-nav__panel">
        <div class="site-nav__top">
          <span class="site-nav__brand">${esc(site.name)}</span>
          <button class="site-nav__close" popovertarget="site-menu" popovertargetaction="hide" aria-label="Fechar menu">${icon('close')}</button>
        </div>
        <ul class="site-nav__list">
          ${site.nav.map((i) => navLink(i, path)).join('\n          ')}
        </ul>
        <div class="site-nav__actions">
          <a class="button button--whatsapp" href="${whatsappUrl(site)}" target="_blank" rel="noopener" data-track="whatsapp_click" data-place="header">${icon('whatsapp', 20)} <span>Orçamento</span></a>
          <a class="site-nav__contact" href="/contato/">Contato</a>
        </div>
      </div>
    </nav>
  </div>
</header>`;
};

const footer = (ctx) => {
  const { site, families, brands, services } = ctx;
  const a = site.address;
  return `
<footer class="site-footer">
  <div class="container site-footer__grid">
    <section class="site-footer__col site-footer__col--about">
      <h2 class="site-footer__title">${esc(site.name)}</h2>
      <p>${esc(site.tagline)}. Manutenção, locação, venda e soluções de software para equipamentos de videocirurgia, artroscopia, laparoscopia e ortopedia.</p>
      <p class="site-footer__notice">${esc(site.independenceNotice)} ${esc(site.scopeNotice)}</p>
      <p><a href="${site.sisterCompany.url}" rel="noopener">${esc(site.sisterCompany.name)}</a>, empresa do grupo: ${esc(site.sisterCompany.description)}</p>
    </section>
    <section class="site-footer__col">
      <h2 class="site-footer__title">Serviços</h2>
      <ul class="site-footer__list">
        ${Object.values(services).map((s) => `<li><a href="/${s.slug}/">${esc(s.name)}</a></li>`).join('\n        ')}
        <li><a href="/equipamentos/">Marcas e equipamentos</a></li>
        <li><a href="/conteudo/">Conteúdo técnico</a></li>
        <li><a href="/sobre/">Sobre a EquimedPR</a></li>
        <li><a href="/contato/">Contato e orçamento</a></li>
      </ul>
    </section>
    <section class="site-footer__col">
      <h2 class="site-footer__title">Equipamentos</h2>
      <ul class="site-footer__list">
        ${families.map((f) => `<li><a href="${familyUrl(f)}">${esc(f.shortName)}</a></li>`).join('\n        ')}
      </ul>
      <h2 class="site-footer__title">Marcas em foco</h2>
      <ul class="site-footer__list">
        ${brands.filter((b) => b.focus).map((b) => `<li><a href="${brandUrl(b)}">${esc(b.name)}</a></li>`).join('\n        ')}
      </ul>
    </section>
    <section class="site-footer__col">
      <h2 class="site-footer__title">Contato</h2>
      <address class="site-footer__address">
        <p>${icon('pin', 18)} <a href="${site.address.mapsUrl}" target="_blank" rel="noopener">${esc(a.street)}<br>${esc(a.neighborhood)}, ${esc(a.city)} - ${esc(a.state)}, CEP ${esc(a.postalCode)}</a></p>
        ${site.phones.map((p) => `<p>${icon('phone', 18)} <a href="tel:${p.e164}" data-track="phone_click">${esc(p.display)}</a></p>`).join('\n        ')}
        <p>${icon('whatsapp', 18)} <a href="${whatsappUrl(site)}" target="_blank" rel="noopener" data-track="whatsapp_click" data-place="footer">WhatsApp ${esc(site.whatsapp.display)}</a></p>
        <p>${icon('mail', 18)} <a href="mailto:${site.email}" data-track="email_click">${esc(site.email)}</a></p>
        <p>${icon('clock', 18)} ${esc(site.openingHoursDisplay)}</p>
      </address>
    </section>
  </div>
  <div class="container site-footer__bottom">
    <p>© ${new Date().getFullYear()} ${esc(site.legalName)}. Todos os direitos reservados.</p>
    <p>
      <a href="${site.social.facebook}" target="_blank" rel="noopener">${icon('facebook', 18)} Facebook</a>
      ${site.social.instagram ? `· <a href="${site.social.instagram}" target="_blank" rel="noopener">${icon('instagram', 18)} Instagram</a>` : ''}
      · <a href="/privacidade/">Privacidade e cookies</a>
      · <a href="/privacidade/#creditos">Créditos de imagens</a>
      · <a href="/sitemap.xml">Mapa do site</a>
    </p>
  </div>
</footer>
<a class="whatsapp-fab" href="${whatsappUrl(site)}" target="_blank" rel="noopener" aria-label="Falar no WhatsApp" data-track="whatsapp_click" data-place="fab">${icon('whatsapp', 30)}<span>Falar no WhatsApp</span></a>`;
};

const consent = (site) =>
  site.analytics?.ga4MeasurementId || site.analytics?.metaPixelId
    ? `
<div class="consent" id="consent" hidden role="region" aria-label="Aviso de cookies">
  <p>Usamos cookies de medição (Google Analytics${site.analytics.metaPixelId ? ' e Meta' : ''}) para entender de onde vêm os contatos. Nada é ativado sem o seu consentimento. <a href="/privacidade/">Política de privacidade</a>.</p>
  <div class="consent__actions">
    <button class="button button--primary" type="button" data-consent="accept">Aceitar</button>
    <button class="button button--ghost" type="button" data-consent="reject">Recusar</button>
  </div>
</div>`
    : '';

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
  alternateName: site.shortName,
  legalName: site.legalName,
  url: site.url,
  logo: `${site.url}/assets/img/site/logo.svg`,
  image: `${site.url}/assets/img/site/og-image.png`,
  description: site.shortDescription,
  slogan: site.tagline,
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
  knowsAbout: ['Stryker System 5, 6, 7 e 8', 'ConMed Hall', 'Linvatec', 'Karl Storz', 'Videocirurgia', 'Artroscopia', 'Laparoscopia', 'Ortopedia'],
  contactPoint: [
    { '@type': 'ContactPoint', contactType: 'sales', telephone: site.phones[0].e164, availableLanguage: 'Portuguese' },
    { '@type': 'ContactPoint', contactType: 'customer support', telephone: site.phones[1].e164, availableLanguage: 'Portuguese' },
  ],
  sameAs: [site.social.facebook, site.social.instagram, whatsappUrl(site)].filter(Boolean),
});

/**
 * Wraps a page body in the shared document shell.
 * page: { title, description, body, path, breadcrumbs?, jsonLd?, ogImage?, ogType?, noindex?, redirect? }
 */
export function layout(ctx, page) {
  const { site } = ctx;
  const canonical = site.url + (page.canonical ?? page.path.replace(/404\.html$/, ''));
  const ogImage = site.url + (page.ogImage ?? '/assets/img/site/og-image.png');
  const graph = [organizationJsonLd(site), page.breadcrumbs?.length && breadcrumbJsonLd(site, page.breadcrumbs), ...(page.jsonLd ?? [])].filter(Boolean);
  const jsonLd = JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }).replace(/</g, '\\u003c');
  const an = site.analytics ?? {};
  const analyticsMeta = [an.ga4MeasurementId && `<meta name="x-ga4" content="${esc(an.ga4MeasurementId)}">`, an.metaPixelId && `<meta name="x-meta-pixel" content="${esc(an.metaPixelId)}">`].filter(Boolean).join('\n');

  return `<!doctype html>
<html lang="pt-BR"${process.env.THEME ? ` data-theme="${process.env.THEME}"` : ''}>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(page.title)}</title>
<meta name="description" content="${esc(page.description)}">
<link rel="canonical" href="${canonical}">
${page.noindex ? '<meta name="robots" content="noindex">' : '<meta name="robots" content="index,follow,max-image-preview:large">'}
${page.redirect ? `<meta http-equiv="refresh" content="0; url=${page.redirect}">` : ''}
<meta name="google-site-verification" content="${site.googleSiteVerification}">
<meta name="theme-color" content="#0f3d5c">
<meta name="color-scheme" content="light dark">
<meta property="og:locale" content="pt_BR">
<meta property="og:type" content="${page.ogType ?? 'website'}">
<meta property="og:site_name" content="${esc(site.name)}">
<meta property="og:title" content="${esc(page.title)}">
<meta property="og:description" content="${esc(page.description)}">
<meta property="og:url" content="${canonical}">
<meta property="og:image" content="${ogImage}">
${page.ogImage ? '' : '<meta property="og:image:width" content="1200">\n<meta property="og:image:height" content="630">'}
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(page.title)}">
<meta name="twitter:description" content="${esc(page.description)}">
<meta name="twitter:image" content="${ogImage}">
${analyticsMeta}
<link rel="icon" href="/assets/img/site/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/assets/img/site/apple-touch-icon.png">
<link rel="manifest" href="/assets/site.webmanifest">
<link rel="preload" href="/assets/fonts/manrope-latin.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/assets/fonts/inter-latin.woff2" as="font" type="font/woff2" crossorigin>
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
${consent(site)}
<script src="/assets/js/main.js" type="module"></script>
</body>
</html>
`;
}

export { join };
