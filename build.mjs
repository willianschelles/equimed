#!/usr/bin/env node
// Static site generator for equimedpr.com.br. Zero dependencies: Node >= 20.
// Reads content/*.json, renders src/templates, writes dist/.
import { readFileSync, writeFileSync, mkdirSync, rmSync, cpSync, readdirSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { layout } from './src/templates/layout.mjs';
import * as pages from './src/templates/pages.mjs';
import { imageSize } from './src/templates/helpers.mjs';

const root = dirname(fileURLToPath(import.meta.url));
// BASE_PATH="/equimed" rewrites root-relative links for a GitHub Pages *project* preview URL.
// Leave empty (default) for the real domain. Canonical/sitemap always use site.url.
const basePath = (process.env.BASE_PATH ?? '').replace(/\/$/, '');
const withBase = (html) => (basePath ? html.replace(/(href|src)="\/(?!\/)/g, `$1="${basePath}/`) : html);
const out = join(root, 'dist');
const json = (f) => JSON.parse(readFileSync(join(root, 'content', f), 'utf8'));

const site = json('site.json');
const catalog = json('catalog.json');
const brands = json('brands.json');
const copy = json('pages.json');

// Index images once so templates can emit width/height (avoids layout shift).
const images = {};
for (const dir of readdirSync(join(root, 'src/assets/img'))) {
  for (const f of readdirSync(join(root, 'src/assets/img', dir))) {
    const p = join(root, 'src/assets/img', dir, f);
    if (statSync(p).isFile()) images[`/assets/img/${dir}/${f}`] = imageSize(readFileSync(p));
  }
}

const logoSvg = readFileSync(join(root, 'src/assets/img/site/logo.svg'), 'utf8')
  .replace(/<\?xml[^>]*>\s*/, '')
  .replace('<svg ', '<svg class="brand__logo" ');
const ctx = { site, catalog, brands, copy, images, logoSvg, buildDate: new Date().toISOString().slice(0, 10) };

// Resolve catalog relations.
for (const sp of catalog.specialties) {
  for (const cat of sp.categories) {
    cat.specialty = sp;
    cat.products = catalog.products.filter(
      (p) => p.specialty === sp.slug && (p.category === cat.slug || (p.alsoIn ?? []).includes(cat.slug)),
    );
  }
}
for (const p of catalog.products) {
  p.specialtyRef = catalog.specialties.find((s) => s.slug === p.specialty);
  p.categoryRef = p.specialtyRef.categories.find((c) => c.slug === p.category);
  if (!p.categoryRef) throw new Error(`Product ${p.slug}: unknown category ${p.category}`);
}

// Page registry: path -> rendered page descriptor.
const registry = [];
const add = (path, page, { priority = 0.5, changefreq = 'monthly', sitemap = true } = {}) =>
  registry.push({ path, page, priority, changefreq, sitemap });

add('/', pages.home(ctx), { priority: 1.0, changefreq: 'weekly' });
add('/servicos/', pages.services(ctx), { priority: 0.9 });
for (const s of copy.services.items) add(`/servicos/${s.slug}/`, pages.service(ctx, s), { priority: 0.9 });
add('/especialidades/', pages.specialties(ctx), { priority: 0.8 });
for (const sp of catalog.specialties) {
  add(`/especialidades/${sp.slug}/`, pages.specialty(ctx, sp), { priority: 0.7 });
  for (const cat of sp.categories) add(`/especialidades/${sp.slug}/${cat.slug}/`, pages.category(ctx, cat), { priority: 0.6 });
}
for (const p of catalog.products) add(`/produtos/${p.slug}/`, pages.product(ctx, p), { priority: 0.6 });
add('/marcas/', pages.brandsPage(ctx), { priority: 0.6 });
add('/sobre/', pages.about(ctx), { priority: 0.7 });
add('/contato/', pages.contact(ctx), { priority: 0.9 });
add('/404.html', pages.notFound(ctx), { sitemap: false });

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

console.log(`Built ${registry.length} pages into dist/ (${urls.length} in sitemap)${basePath ? ` with BASE_PATH=${basePath}` : ''}.`);
