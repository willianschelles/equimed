#!/usr/bin/env node
/**
 * SEO / technical health audit. Zero dependencies (Node >= 20).
 *
 *   node tools/seo-audit.mjs --dir dist                 # audit the local build (CI, before deploy)
 *   node tools/seo-audit.mjs --site https://www.equimedpr.com.br   # audit the live site
 *   add --psi to fetch PageSpeed Insights scores (live only, free API, no key needed)
 *   add --out report.md to write the Markdown report; --json findings.json for machines
 *   add --strict to exit 1 on warnings too (default: exit 1 only on errors)
 *
 * Every finding carries a plain-language explanation and the file to edit, so that
 * someone without SEO background can act on the report.
 */
import { readFileSync, writeFileSync, existsSync, statSync } from 'node:fs';
import { join } from 'node:path';

const args = Object.fromEntries(
  process.argv.slice(2).map((a, i, all) => (a.startsWith('--') ? [a.slice(2), all[i + 1]?.startsWith('--') || all[i + 1] === undefined ? true : all[i + 1]] : [])).filter((x) => x.length),
);
const site = JSON.parse(readFileSync(new URL('../content/site.json', import.meta.url), 'utf8'));
const base = args.site ? String(args.site).replace(/\/$/, '') : site.url;
const dir = args.dir ? String(args.dir) : null;
if (!dir && !args.site) {
  console.error('Usage: seo-audit.mjs --dir dist | --site https://host [--psi] [--out report.md] [--json out.json] [--strict]');
  process.exit(2);
}

/* ---------- Rules (pt-BR copy for the report) ---------- */
const RULES = {
  'fetch-failed': { sev: 'error', title: 'Página não carrega', why: 'Uma página listada no sitemap não respondeu com 200. O Google deixará de indexá-la.', fix: 'Confira se a página existe em dist/ e se o deploy terminou. Se a página foi removida de propósito, remova-a também do build (build.mjs).' },
  'title-missing': { sev: 'error', title: 'Sem <title>', why: 'O título é o texto azul do resultado no Google. Sem ele, a página quase não aparece.', fix: 'Defina "title" no content/pages.json (páginas fixas) ou "name"/"model" no content/catalog.json (produtos).' },
  'title-length': { sev: 'warn', title: 'Título fora do tamanho ideal (15–65 caracteres)', why: 'Títulos longos são cortados no Google; curtos demais desperdiçam a chance de conter palavras-chave.', fix: 'Ajuste o "title" em content/pages.json ou o nome/modelo em content/catalog.json.' },
  'title-duplicate': { sev: 'warn', title: 'Título repetido em mais de uma página', why: 'Páginas com o mesmo título competem entre si e confundem o Google sobre qual mostrar.', fix: 'Torne cada título único (inclua modelo, categoria ou cidade).' },
  'description-missing': { sev: 'error', title: 'Sem meta description', why: 'É o texto cinza abaixo do título no Google. Sem ele, o Google inventa um trecho, geralmente pior.', fix: 'Defina "description" em content/pages.json ou "summary" no produto em content/catalog.json.' },
  'description-length': { sev: 'warn', title: 'Meta description fora do ideal (50–160 caracteres)', why: 'Descrições longas são cortadas; curtas demais não convencem o clique.', fix: 'Ajuste "description" (pages.json) ou "summary" (catalog.json).' },
  'description-duplicate': { sev: 'warn', title: 'Meta description repetida', why: 'Descrições iguais em páginas diferentes reduzem a relevância de cada uma.', fix: 'Escreva uma descrição específica para cada página.' },
  'h1-count': { sev: 'error', title: 'Página sem H1 único', why: 'O H1 diz ao Google e ao leitor qual é o assunto principal. Deve existir exatamente um.', fix: 'Verifique o template em src/templates/pages.mjs; cada página deve ter um único <h1>.' },
  'canonical-missing': { sev: 'error', title: 'Sem link canonical', why: 'O canonical evita que versões duplicadas da URL (com/sem barra, http/https) dividam a relevância.', fix: 'O layout (src/templates/layout.mjs) gera o canonical automaticamente; confira se a página passou por ele.' },
  'canonical-mismatch': { sev: 'error', title: 'Canonical aponta para outra URL', why: 'Se o canonical diverge da URL real, o Google pode indexar a outra página em vez desta.', fix: 'Confira "url" em content/site.json e o caminho da página no build.mjs.' },
  'og-missing': { sev: 'warn', title: 'Faltam tags Open Graph (og:title, og:description, og:image)', why: 'Sem elas, o link compartilhado no WhatsApp fica sem imagem e sem descrição.', fix: 'O layout gera as tags; confira src/templates/layout.mjs.' },
  'jsonld-invalid': { sev: 'error', title: 'Dados estruturados (JSON-LD) inválidos', why: 'JSON-LD quebrado faz o Google ignorar os dados da empresa, produtos e FAQ (rich results).', fix: 'Valide em https://validator.schema.org/ e corrija o template em src/templates/.' },
  'img-alt': { sev: 'warn', title: 'Imagem sem texto alternativo (alt)', why: 'O alt descreve a imagem para o Google Imagens e para leitores de tela.', fix: 'Toda chamada img() nos templates deve passar um alt descritivo (nome do produto, marca).' },
  'link-broken': { sev: 'error', title: 'Link interno quebrado', why: 'Links para páginas inexistentes prejudicam a navegação e o rastreamento.', fix: 'Corrija o href no template ou no conteúdo (content/*.json).' },
  'lang-missing': { sev: 'error', title: '<html lang> ausente ou diferente de pt-BR', why: 'Informa o idioma ao Google e aos leitores de tela.', fix: 'Confira src/templates/layout.mjs.' },
  'viewport-missing': { sev: 'error', title: 'Sem meta viewport', why: 'Sem viewport a página não é "mobile-friendly" e perde posições no celular.', fix: 'Confira src/templates/layout.mjs.' },
  'noindex-in-sitemap': { sev: 'error', title: 'Página com noindex listada no sitemap', why: 'Sinais contraditórios: o sitemap pede indexação, a página proíbe.', fix: 'Remova a página do sitemap (build.mjs: sitemap: false) ou retire o noindex.' },
  'mixed-content': { sev: 'error', title: 'Recurso carregado por http:// em página https', why: 'Navegadores bloqueiam ou alertam, e o Google penaliza.', fix: 'Troque o endereço para https:// ou para um caminho relativo.' },
  'robots-missing': { sev: 'error', title: 'robots.txt ausente ou sem Sitemap', why: 'O robots.txt orienta os robôs e aponta o sitemap.', fix: 'O build gera dist/robots.txt; confira o deploy.' },
  'sitemap-missing': { sev: 'error', title: 'sitemap.xml ausente ou vazio', why: 'O sitemap é a lista de páginas que pedimos ao Google para indexar.', fix: 'O build gera dist/sitemap.xml; confira o deploy.' },
  'redirect-https': { sev: 'error', title: 'http:// não redireciona para https://', why: 'Sem redirecionamento, existem duas versões do site e o cadeado de segurança falha.', fix: 'No GitHub Pages: Settings > Pages > "Enforce HTTPS". Em outro host, configure o redirecionamento 301.' },
  'redirect-www': { sev: 'warn', title: 'Domínio sem www não redireciona para o com www (ou vice-versa)', why: 'Duas versões do site dividem a relevância.', fix: 'Configure o registro DNS do apex (A/ALIAS) e o redirecionamento 301 para a versão canônica definida em content/site.json.' },
  '404-status': { sev: 'warn', title: 'URL inexistente não devolve status 404', why: 'Se tudo devolve 200, o Google indexa lixo e páginas inexistentes.', fix: 'Confira se dist/404.html existe (GitHub Pages usa esse arquivo automaticamente).' },
  'psi-score': { sev: 'warn', title: 'Pontuação do PageSpeed Insights abaixo da meta', why: 'Performance, acessibilidade, boas práticas e SEO abaixo de 90 (mobile) costumam indicar regressão.', fix: 'Abra o link do PageSpeed no relatório; ele lista as correções sugeridas. Para imagens, use tools/optimize-images.sh.' },
  'html-size': { sev: 'warn', title: 'HTML muito grande (> 300 KB)', why: 'Páginas pesadas demoram a carregar no celular.', fix: 'Reduza conteúdo inline ou divida a página.' },
  'stale-content': { sev: 'info', title: 'Sitemap sem alteração há mais de 180 dias', why: 'Sites sem atualização perdem relevância aos poucos. Uma novidade, produto ou FAQ por trimestre já ajuda.', fix: 'Adicione um produto em content/catalog.json ou atualize um texto em content/pages.json e publique.' },
};

const findings = [];
const add = (code, page, detail = '') => findings.push({ code, page, detail, ...RULES[code] });

/* ---------- Loading helpers ---------- */
const cache = new Map();
async function get(url, { method = 'GET', redirect = 'follow' } = {}) {
  const key = method + url + redirect;
  if (cache.has(key)) return cache.get(key);
  let r;
  try {
    const res = await fetch(url, { method, redirect, headers: { 'user-agent': 'equimed-seo-audit/1.0' } });
    r = { status: res.status, headers: res.headers, text: method === 'GET' ? await res.text() : '' };
  } catch (e) {
    r = { status: 0, headers: new Headers(), text: '', error: e.message };
  }
  cache.set(key, r);
  return r;
}

function localPath(pathname) {
  const p = decodeURIComponent(pathname.split('#')[0].split('?')[0]);
  const f = join(dir, p);
  if (existsSync(f) && statSync(f).isDirectory()) return join(f, 'index.html');
  return f;
}

async function load(pathname) {
  if (dir) {
    const f = localPath(pathname);
    return existsSync(f) ? { status: 200, text: readFileSync(f, 'utf8') } : { status: 404, text: '' };
  }
  return get(base + pathname);
}

async function exists(pathname) {
  if (dir) return existsSync(localPath(pathname));
  const r = await get(base + pathname, { method: 'HEAD' });
  return r.status >= 200 && r.status < 400;
}

/* ---------- Tiny HTML helpers (regex is enough for our own generated HTML) ---------- */
const attr = (tag, name) => tag.match(new RegExp(`\\s${name}=["']([^"']*)["']`, 'i'))?.[1];
const tags = (html, name) => html.match(new RegExp(`<${name}\\b[^>]*>`, 'gi')) ?? [];
const meta = (html, key, value) => tags(html, 'meta').find((t) => (attr(t, key) ?? '').toLowerCase() === value);
const decode = (s = '') => s.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>');

/* ---------- Site-level checks ---------- */
const sitemapRes = await load('/sitemap.xml');
const urls = [...(sitemapRes.text.matchAll(/<loc>([^<]+)<\/loc>/g))].map((m) => m[1]);
if (sitemapRes.status !== 200 || !urls.length) add('sitemap-missing', '/sitemap.xml');
const lastmods = [...(sitemapRes.text.matchAll(/<lastmod>([^<]+)<\/lastmod>/g))].map((m) => new Date(m[1]));
if (lastmods.length && Date.now() - Math.max(...lastmods) > 180 * 864e5) add('stale-content', '/sitemap.xml', `Última alteração: ${new Date(Math.max(...lastmods)).toISOString().slice(0, 10)}`);

const robots = await load('/robots.txt');
if (robots.status !== 200 || !/sitemap:/i.test(robots.text)) add('robots-missing', '/robots.txt');

if (!dir) {
  const host = new URL(base).host;
  const http = await get(`http://${host}/`, { redirect: 'manual' });
  if (!(http.status >= 301 && http.status <= 308 && (http.headers.get('location') ?? '').startsWith('https://'))) add('redirect-https', `http://${host}/`, `status ${http.status}`);
  const alt = host.startsWith('www.') ? host.slice(4) : `www.${host}`;
  const altRes = await get(`https://${alt}/`, { redirect: 'manual' });
  if (!(altRes.status >= 301 && altRes.status <= 308 && (altRes.headers.get('location') ?? '').includes(host))) add('redirect-www', `https://${alt}/`, `status ${altRes.status}`);
  const nf = await get(`${base}/pagina-que-nao-existe-${Date.now()}/`);
  if (nf.status !== 404) add('404-status', '/pagina-que-nao-existe/', `status ${nf.status}`);
}

/* ---------- Page-level checks ---------- */
const titles = new Map();
const descriptions = new Map();
const pathOf = (u) => new URL(u).pathname;

for (const u of urls) {
  const pathname = pathOf(u);
  const res = await load(pathname);
  if (res.status !== 200) {
    add('fetch-failed', pathname, `status ${res.status}${res.error ? ` (${res.error})` : ''}`);
    continue;
  }
  const html = res.text;
  if (html.length > 300_000) add('html-size', pathname, `${Math.round(html.length / 1024)} KB`);

  const lang = attr(tags(html, 'html')[0] ?? '', 'lang');
  if (lang !== 'pt-BR') add('lang-missing', pathname, `lang="${lang ?? ''}"`);
  if (!meta(html, 'name', 'viewport')) add('viewport-missing', pathname);

  const title = decode(html.match(/<title>([^<]*)<\/title>/i)?.[1]?.trim());
  if (!title) add('title-missing', pathname);
  else {
    if (title.length < 15 || title.length > 65) add('title-length', pathname, `${title.length} caracteres: "${title}"`);
    titles.set(title, [...(titles.get(title) ?? []), pathname]);
  }

  const desc = decode(attr(meta(html, 'name', 'description') ?? '', 'content'));
  if (!desc) add('description-missing', pathname);
  else {
    if (desc.length < 50 || desc.length > 160) add('description-length', pathname, `${desc.length} caracteres`);
    descriptions.set(desc, [...(descriptions.get(desc) ?? []), pathname]);
  }

  const h1s = html.match(/<h1\b/gi)?.length ?? 0;
  if (h1s !== 1) add('h1-count', pathname, `${h1s} H1`);

  const canonical = attr(tags(html, 'link').find((t) => attr(t, 'rel') === 'canonical') ?? '', 'href');
  if (!canonical) add('canonical-missing', pathname);
  else if (canonical !== u) add('canonical-mismatch', pathname, `canonical=${canonical}`);

  if (!(meta(html, 'property', 'og:title') && meta(html, 'property', 'og:description') && meta(html, 'property', 'og:image'))) add('og-missing', pathname);

  const robotsMeta = attr(meta(html, 'name', 'robots') ?? '', 'content') ?? '';
  if (/noindex/i.test(robotsMeta)) add('noindex-in-sitemap', pathname);

  for (const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try {
      JSON.parse(m[1]);
    } catch (e) {
      add('jsonld-invalid', pathname, e.message);
    }
  }

  for (const t of tags(html, 'img')) if (attr(t, 'alt') === undefined) add('img-alt', pathname, attr(t, 'src'));

  if (/\s(src|href)=["']http:\/\//i.test(html)) add('mixed-content', pathname);

  const hrefs = new Set(
    [...tags(html, 'a'), ...tags(html, 'link'), ...tags(html, 'img'), ...tags(html, 'script')]
      .map((t) => attr(t, 'href') ?? attr(t, 'src'))
      .filter((h) => h && (h.startsWith('/') || h.startsWith(base)))
      .map((h) => (h.startsWith(base) ? h.slice(base.length) : h))
      .filter((h) => !h.startsWith('//')),
  );
  for (const h of hrefs) if (!(await exists(h))) add('link-broken', pathname, h);
}
for (const [t, pages] of titles) if (pages.length > 1) add('title-duplicate', pages.join(', '), `"${t}"`);
for (const [d, pages] of descriptions) if (pages.length > 1) add('description-duplicate', pages.join(', '), `"${d.slice(0, 60)}…"`);

/* ---------- PageSpeed Insights (live only) ---------- */
const psi = [];
if (args.psi && !dir) {
  const sample = urls.filter((u) => [`${base}/`, `${base}/servicos/manutencao/`, `${base}/contato/`].includes(u) || /\/produtos\//.test(u)).slice(0, 4);
  for (const u of sample) {
    const api = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(u)}&strategy=mobile&category=PERFORMANCE&category=ACCESSIBILITY&category=BEST_PRACTICES&category=SEO${process.env.PSI_API_KEY ? `&key=${process.env.PSI_API_KEY}` : ''}`;
    const r = await get(api);
    if (r.status !== 200) {
      psi.push({ url: u, error: `PSI status ${r.status}` });
      continue;
    }
    const cats = JSON.parse(r.text).lighthouseResult?.categories ?? {};
    const scores = Object.fromEntries(Object.entries(cats).map(([k, v]) => [k, Math.round(v.score * 100)]));
    psi.push({ url: u, scores });
    const low = Object.entries(scores).filter(([, s]) => s < 90);
    if (low.length) add('psi-score', pathOf(u), low.map(([k, s]) => `${k}: ${s}`).join(', ') + ` — https://pagespeed.web.dev/report?url=${encodeURIComponent(u)}`);
  }
}

/* ---------- Report ---------- */
const order = { error: 0, warn: 1, info: 2 };
findings.sort((a, b) => order[a.sev] - order[b.sev] || a.code.localeCompare(b.code));
const errors = findings.filter((f) => f.sev === 'error').length;
const warns = findings.filter((f) => f.sev === 'warn').length;
const label = { error: '🔴 Erro', warn: '🟡 Atenção', info: '🔵 Info' };

const grouped = new Map();
for (const f of findings) grouped.set(f.code, [...(grouped.get(f.code) ?? []), f]);

let md = `# Relatório SEO — ${dir ? `build local (${dir})` : base}\n\n`;
md += `Data: ${new Date().toISOString().slice(0, 10)} · Páginas verificadas: ${urls.length} · Erros: ${errors} · Atenções: ${warns}\n\n`;
md += errors + warns === 0 ? `✅ **Tudo certo.** Nenhum problema encontrado.\n\n` : '';
for (const [code, items] of grouped) {
  const r = RULES[code];
  md += `## ${label[r.sev]} — ${r.title}\n\n`;
  md += `**O que é:** ${r.why}\n\n**Como corrigir:** ${r.fix}\n\n`;
  md += `**Onde (${items.length}):**\n`;
  for (const f of items.slice(0, 30)) md += `- \`${f.page}\`${f.detail ? ` — ${f.detail}` : ''}\n`;
  if (items.length > 30) md += `- … e mais ${items.length - 30}\n`;
  md += '\n';
}
if (psi.length) {
  md += `## PageSpeed Insights (mobile)\n\n| Página | Performance | Acessibilidade | Boas práticas | SEO |\n|---|---|---|---|---|\n`;
  for (const p of psi) md += p.error ? `| ${p.url} | ${p.error} | | | |\n` : `| ${p.url} | ${p.scores.performance} | ${p.scores.accessibility} | ${p.scores['best-practices']} | ${p.scores.seo} |\n`;
  md += '\n';
}
md += `---\nComo aplicar uma correção: edite o arquivo indicado, rode \`npm run check\` localmente (ou abra um Pull Request: a verificação roda sozinha) e publique com um push na branch main. Guia: docs/CONTENT-EDITING.md.\n`;

if (args.out) writeFileSync(String(args.out), md);
if (args.json) writeFileSync(String(args.json), JSON.stringify({ base, errors, warns, findings, psi }, null, 2));
console.log(md);
process.exit(errors > 0 || (args.strict && warns > 0) ? 1 : 0);
