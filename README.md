# equimedpr.com.br

Site institucional da **Equimed Equipamentos Médicos** (Curitiba, PR). Versão 2 (2026): site estático,
HTML e CSS puros, sem frameworks nem dependências de runtime. Substitui o app Django/Heroku de 2018.

- Produção: https://www.equimedpr.com.br (GitHub Pages, publicado pelo workflow `Deploy`)
- Edição de conteúdo sem programar: [docs/CONTENT-EDITING.md](docs/CONTENT-EDITING.md)
- Estratégia de SEO e marketing, robô de monitoramento e opções: [docs/SEO-MARKETING.md](docs/SEO-MARKETING.md)

## Como funciona

```
content/         <- TODO o conteúdo editável (JSON): empresa, páginas, catálogo, marcas
src/templates/   <- templates (JS puro, template literals): layout + páginas
src/styles/      <- main.css (cascade layers, custom properties, container queries, light-dark)
src/scripts/     <- main.js (apenas progressive enhancement: formulário -> WhatsApp/e-mail)
src/assets/      <- imagens WebP, logo SVG, favicon, manifest
build.mjs        <- gerador estático (Node >= 20, zero dependências) -> dist/
tools/           <- seo-audit.mjs (robô), serve.mjs (preview), optimize-images.sh
.github/         <- deploy (Pages), ci (PR), seo-monitor (mensal)
```

```sh
npm run dev          # build + preview em http://localhost:8787
npm run check        # build + auditoria SEO do build (falha se houver erro)
npm run check:seo:live   # auditoria do site no ar + PageSpeed Insights
```

Não há `npm install`: nada a instalar. O Lighthouse CI roda via `npx` apenas no CI.

## Publicação

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
