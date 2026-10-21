#!/usr/bin/env node
// Static site generator for equimedpr.com.br. Zero dependencies: Node >= 20.
// Reads content/*.json, renders src/templates, writes dist/.
import { readFileSync, writeFileSync, mkdirSync, rmSync, cpSync, readdirSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { layout } from './src/templates/layout.mjs';
import * as pages from './src/templates/pages.mjs';
import { imageSize, familyUrl, productUrl } from './src/templates/helpers.mjs';

const root = dirname(fileURLToPath(import.meta.url));
// BASE_PATH="/equimed" rewrites root-relative links for a GitHub Pages *project* preview URL.
// Leave empty (default) for the real domain. Canonical/sitemap always use site.url.
const basePath = (process.env.BASE_PATH ?? '').replace(/\/$/, '');
const withBase = (html) =>
  basePath
    ? html
        .replace(/(href|src|url)="\/(?!\/)/g, `$1="${basePath}/`)
        .replace(/content="0; url=\//g, `content="0; url=${basePath}/`)
        .replace(/ srcset="([^"]*)"/g, (_, v) => ` srcset="${v.replace(/(^|,\s*)\//g, `$1${basePath}/`)}"`)
    : html;
const out = join(root, 'dist');
const json = (f) => JSON.parse(readFileSync(join(root, 'content', f), 'utf8'));

const site = json('site.json');
const { products } = json('catalog.json');
const families = json('families.json');
const brands = json('brands.json');
const services = json('services.json');
const articles = json('articles.json');
const copy = json('pages.json');

// Index images once so templates can emit width/height (avoids layout shift).
const images = {};
for (const dir of readdirSync(join(root, 'src/assets/img'))) {
  for (const f of readdirSync(join(root, 'src/assets/img', dir))) {
    const p = join(root, 'src/assets/img', dir, f);
    if (statSync(p).isFile() && /\.(webp|png)$/.test(f)) images[`/assets/img/${dir}/${f}`] = imageSize(readFileSync(p));
  }
}

const logoSvg = readFileSync(join(root, 'src/assets/img/site/logo.svg'), 'utf8')
  .replace(/<\?xml[^>]*>\s*/, '')
  .replace('<svg ', '<svg class="brand__logo" role="img" aria-label="EquimedPR" ');

// Resolve relations.
for (const f of families) f.products = products.filter((p) => p.family === f.slug);
for (const p of products) {
  p.familyRef = families.find((f) => f.slug === p.family);
  if (!p.familyRef) throw new Error(`Product ${p.slug}: unknown family ${p.family}`);
  p.brandRef = p.brandSlug ? brands.find((b) => b.slug === p.brandSlug) : null;
  if (p.brandSlug && !p.brandRef) throw new Error(`Product ${p.slug}: unknown brand ${p.brandSlug}`);
  if (p.image && !images[`/assets/img/products/${p.image}.webp`]) throw new Error(`Product ${p.slug}: missing image ${p.image}`);
}
for (const b of brands) for (const s of b.families) if (!families.find((f) => f.slug === s)) throw new Error(`Brand ${b.slug}: unknown family ${s}`);
for (const a of articles) for (const s of a.families) if (!families.find((f) => f.slug === s)) throw new Error(`Article ${a.slug}: unknown family ${s}`);

const ctx = { site, products, families, brands, services, articles, copy, images, logoSvg, buildDate: new Date().toISOString().slice(0, 10) };

// Page registry: path -> rendered page descriptor.
const registry = [];
const add = (path, page, { priority = 0.5, changefreq = 'monthly', sitemap = true } = {}) =>
  registry.push({ path, page, priority, changefreq, sitemap });

add('/', pages.home(ctx), { priority: 1.0, changefreq: 'weekly' });
add('/manutencao/', pages.maintenance(ctx), { priority: 0.9 });
for (const f of families) if (f.maintenance) add(`/manutencao/${f.slug}/`, pages.maintenanceFamily(ctx, f), { priority: 0.8 });
add('/locacao/', pages.rental(ctx), { priority: 0.9 });
add('/venda/', pages.sales(ctx), { priority: 0.9 });
add('/software/', pages.software(ctx), { priority: 0.9 });
add('/equipamentos/', pages.equipment(ctx), { priority: 0.8 });
for (const f of families) add(familyUrl(f), pages.family(ctx, f), { priority: 0.7 });
for (const p of products) add(productUrl(p), pages.product(ctx, p), { priority: 0.6 });
add('/marcas/', pages.brandsPage(ctx), { priority: 0.7 });
for (const b of brands) add(`/marcas/${b.slug}/`, pages.brand(ctx, b), { priority: b.focus ? 0.8 : 0.5 });
add('/conteudo/', pages.articles(ctx), { priority: 0.7, changefreq: 'weekly' });
for (const a of articles) add(`/conteudo/${a.slug}/`, pages.article(ctx, a), { priority: 0.6 });
add('/sobre/', pages.about(ctx), { priority: 0.6 });
add('/contato/', pages.contact(ctx), { priority: 0.9 });
add('/privacidade/', pages.privacy(ctx), { priority: 0.2, changefreq: 'yearly' });
add('/404.html', pages.notFound(ctx), { sitemap: false });

// Redirect stubs preserve the addresses of the previous Django site and of the first preview.
const fam = (slug) => families.find((f) => f.slug === slug);
const redirects = {
  '/about': ['/sobre/', 'Sobre a EquimedPR'],
  '/brands': ['/marcas/', 'Marcas atendidas'],
  '/contact': ['/contato/', 'Contato e orçamento'],
  '/our-services': ['/manutencao/', 'Manutenção'],
  '/speciality/Vendas': ['/venda/', 'Venda'],
  '/speciality/Vendas/Insufladores': [familyUrl(fam('insufladores')), 'Insufladores'],
  '/speciality/Artroscopia': ['/equipamentos/', 'Equipamentos'],
  '/speciality/Artroscopia/Acessórios': [familyUrl(fam('acessorios-de-video')), 'Acessórios de vídeo'],
  '/speciality/Artroscopia/Artrobomba': [familyUrl(fam('artrobombas')), 'Artrobombas'],
  '/speciality/Artroscopia/Instrumentos': ['/equipamentos/', 'Equipamentos'],
  '/speciality/Laparoscopia': [familyUrl(fam('insufladores')), 'Insufladores'],
  '/speciality/Laparoscopia/Insufladores': [familyUrl(fam('insufladores')), 'Insufladores'],
  '/speciality/Ortopedia - Trauma': [familyUrl(fam('perfuradores-e-serras')), 'Perfuradores e serras'],
  '/speciality/Ortopedia - Trauma/Perfuradores': [familyUrl(fam('perfuradores-e-serras')), 'Perfuradores e serras'],
  '/speciality/Ortopedia - Trauma/Serras': [familyUrl(fam('perfuradores-e-serras')), 'Perfuradores e serras'],
  '/speciality/Ortopedia - Trauma/Carregadores': [familyUrl(fam('baterias-e-carregadores')), 'Baterias e carregadores'],
  '/speciality/Vídeo-Cirurgia': ['/equipamentos/', 'Equipamentos'],
  '/speciality/Vídeo-Cirurgia/Câmeras de Vídeo': [familyUrl(fam('cameras-de-video')), 'Câmeras de vídeo'],
  '/speciality/Vídeo-Cirurgia/Fonte de Luz': [familyUrl(fam('fontes-de-luz')), 'Fontes de luz'],
  '/speciality/Vídeo-Cirurgia/Monitores de Vídeo': [familyUrl(fam('monitores-cirurgicos')), 'Monitores cirúrgicos'],
  '/products/STAHL Access': ['/equipamentos/', 'Equipamentos'],
  '/products/STAHL caixa de esterilização  para instrumentos': ['/equipamentos/', 'Equipamentos'],
  '/products/STAHL Acessórios de limpeza': ['/equipamentos/', 'Equipamentos'],
  '/servicos': ['/manutencao/', 'Manutenção'],
  '/servicos/manutencao': ['/manutencao/', 'Manutenção'],
  '/servicos/locacao': ['/locacao/', 'Locação'],
  '/servicos/venda': ['/venda/', 'Venda'],
  '/especialidades': ['/equipamentos/', 'Equipamentos'],
  '/especialidades/video-cirurgia': ['/equipamentos/', 'Equipamentos'],
  '/especialidades/video-cirurgia/cameras-de-video': [familyUrl(fam('cameras-de-video')), 'Câmeras de vídeo'],
  '/especialidades/video-cirurgia/monitores-de-video': [familyUrl(fam('monitores-cirurgicos')), 'Monitores cirúrgicos'],
  '/especialidades/video-cirurgia/fonte-de-luz': [familyUrl(fam('fontes-de-luz')), 'Fontes de luz'],
  '/especialidades/artroscopia': [familyUrl(fam('artrobombas')), 'Artrobombas'],
  '/especialidades/artroscopia/artrobomba': [familyUrl(fam('artrobombas')), 'Artrobombas'],
  '/especialidades/artroscopia/acessorios': [familyUrl(fam('acessorios-de-video')), 'Acessórios de vídeo'],
  '/especialidades/artroscopia/instrumentos': ['/equipamentos/', 'Equipamentos'],
  '/especialidades/laparoscopia': [familyUrl(fam('insufladores')), 'Insufladores'],
  '/especialidades/laparoscopia/insufladores': [familyUrl(fam('insufladores')), 'Insufladores'],
  '/especialidades/ortopedia-trauma': [familyUrl(fam('perfuradores-e-serras')), 'Perfuradores e serras'],
  '/especialidades/ortopedia-trauma/perfuradores': [familyUrl(fam('perfuradores-e-serras')), 'Perfuradores e serras'],
  '/especialidades/ortopedia-trauma/serras': [familyUrl(fam('perfuradores-e-serras')), 'Perfuradores e serras'],
  '/especialidades/ortopedia-trauma/carregadores': [familyUrl(fam('baterias-e-carregadores')), 'Baterias e carregadores'],
};
// Names containing a double quote (two NDS monitors) cannot be file names on every platform; they fall to the 404 page.
for (const p of products) if (p.legacyName && !p.legacyName.includes('"')) redirects[`/products/${p.legacyName}`] = [productUrl(p), p.name];
for (const [from, [to, name]] of Object.entries(redirects)) add(`${from}/`, pages.redirect(ctx, to, name), { sitemap: false });

// Emit.
rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });
for (const { path, page } of registry) {
  const file = path.endsWith('.html') ? join(out, path) : join(out, path, 'index.html');
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, withBase(layout(ctx, { ...page, path })));
}

cpSync(join(root, 'src/assets'), join(out, 'assets'), { recursive: true });
writeFileSync(join(out, 'assets/site.webmanifest'), withBase(readFileSync(join(root, 'src/assets/site.webmanifest'), 'utf8')).replace(/"start_url": "\/"/, `"start_url": "${basePath || '/'}"`));
cpSync(join(root, 'src/styles'), join(out, 'assets/css'), { recursive: true });
cpSync(join(root, 'src/scripts'), join(out, 'assets/js'), { recursive: true });

const urls = registry.filter((r) => r.sitemap);
writeFileSync(
  join(out, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    urls
      .map(
        (r) =>
          `  <url><loc>${site.url}${r.path}</loc><lastmod>${ctx.buildDate}</lastmod><changefreq>${r.changefreq}</changefreq><priority>${r.priority.toFixed(1)}</priority></url>`,
      )
      .join('\n') +
    `\n</urlset>\n`,
);
writeFileSync(join(out, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${site.url}/sitemap.xml\n`);
// CNAME binds GitHub Pages to the custom domain. Keep publishCname=false until the DNS points here,
// otherwise the *.github.io preview redirects to the old host.
if (site.publishCname) writeFileSync(join(out, 'CNAME'), new URL(site.url).host + '\n');
writeFileSync(join(out, '.nojekyll'), '');
writeFileSync(join(out, `google${site.googleSiteVerification}.html`), `google-site-verification: google${site.googleSiteVerification}.html\n`);

console.log(`Built ${registry.length} pages into dist/ (${urls.length} in sitemap, ${registry.length - urls.length - 1} redirects)${basePath ? ` with BASE_PATH=${basePath}` : ''}.`);
