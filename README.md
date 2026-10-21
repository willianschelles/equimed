# equimedpr.com.br

Site institucional da **EquimedPR** (Equimed Equipamentos Médicos, Curitiba, PR): assistência técnica independente multimarcas. Versão 2 (2026): site estático,
HTML e CSS puros, sem frameworks nem dependências de runtime. Substitui o app Django/Heroku de 2018.

- Produção: https://www.equimedpr.com.br (GitHub Pages, publicado pelo workflow `Deploy`)
- Edição de conteúdo sem programar: [docs/CONTENT-EDITING.md](docs/CONTENT-EDITING.md)
- Estratégia de SEO e marketing, robô de monitoramento, mensuração e opções: [docs/SEO-MARKETING.md](docs/SEO-MARKETING.md)
- Proposta de escopo, etapas e itens a validar (resposta às diretrizes de out/2026): [docs/PROPOSTA.md](docs/PROPOSTA.md)
- Checklist do que falta (validação, virada de DNS, contas Google/Meta): [docs/PROXIMOS-PASSOS.md](docs/PROXIMOS-PASSOS.md)

## Linguagem visual (v3, out/2026)

Pesquisa de design em sites do setor (MS Medical, Multmed, Multy Surgical, Avante, Soma, Agiliti, Integrity)
mostrou que o que é nativo do mercado é a **ficha técnica**, não a landing page: marca sobre modelo, tags de
condição como vocabulário fechado, fluxo numerado de recebimento → laudo → reparo → testes, tabelas de
compatibilidade e números de garantia. Daí: IBM Plex Sans + Plex Mono (etiquetas, referências, specs),
réguas finas em vez de cards sombreados, seções numeradas, listas-índice e grades tipo datasheet, fotos em
placas com legenda "Fig. 01". Modo claro fixo. Tudo em `src/styles/main.css`.

## Como funciona

```
content/         <- TODO o conteúdo editável (JSON): site, pages, services, families, brands, catalog, articles
src/templates/   <- templates (JS puro, template literals): layout + páginas
src/styles/      <- main.css (cascade layers, custom properties, container queries, light-dark)
src/scripts/     <- main.js (progressive enhancement: consentimento + GA4/Meta, eventos de lead, formulário -> WhatsApp/e-mail)
src/assets/      <- imagens WebP (produtos, fotos de ambiente), fontes woff2 (IBM Plex Sans/Mono), logo SVG, favicon, OG image
build.mjs        <- gerador estático (Node >= 20, zero dependências) -> dist/
tools/           <- seo-audit.mjs (robô), serve.mjs (preview), optimize-images.sh, clean-product-photos.py
.github/         <- deploy (Pages), ci (PR), seo-monitor (mensal)
```

```sh
npm run dev          # build + preview em http://localhost:8787
npm run check        # build + auditoria SEO do build (falha se houver erro)
npm run check:seo:live   # auditoria do site no ar + PageSpeed Insights
```

Não há `npm install`: nada a instalar. O Lighthouse CI roda via `npx` apenas no CI.

## Publicação

Roteiro completo da virada Heroku → GitHub Pages (DNS no Registro.br, ordem segura, verificação): [docs/DNS-CUTOVER.md](docs/DNS-CUTOVER.md).

Push na branch `main` → workflow **Deploy** → GitHub Pages. Enquanto `publishCname` for `false` em
`content/site.json`, o site fica no endereço de preview `https://willianschelles.github.io/equimed/`.
Para virar a chave do domínio: (1) ajuste o DNS abaixo, (2) mude `publishCname` para `true`, (3) push.

| Tipo  | Nome | Valor |
|-------|------|-------|
| CNAME | www  | `willianschelles.github.io` |
| A     | @    | 185.199.108.153, 185.199.109.153, 185.199.110.153, 185.199.111.153 |

Depois, em *Settings → Pages*: Source = GitHub Actions, Custom domain = `www.equimedpr.com.br`, marcar *Enforce HTTPS*.

## Futuro backend

Todo conteúdo vem de `content/*.json`. Quando houver banco de dados, basta trocar a origem dos dados em
`build.mjs` (ou servir os mesmos templates do lado do servidor). Os templates e o CSS não mudam.
