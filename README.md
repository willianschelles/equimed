# equimedpr.com.br

Site institucional da **EquimedPR** (Equimed Equipamentos Médicos, Curitiba, PR): assistência técnica independente multimarcas. Versão 2 (2026): site estático,
HTML e CSS puros, sem frameworks nem dependências de runtime. Substitui o app Django/Heroku de 2018.

- Produção: https://www.equimedpr.com.br (GitHub Pages, publicado pelo workflow `Deploy`)
- Edição de conteúdo sem programar: [docs/CONTENT-EDITING.md](docs/CONTENT-EDITING.md)
- Estratégia de SEO e marketing, robô de monitoramento, mensuração e opções: [docs/SEO-MARKETING.md](docs/SEO-MARKETING.md)
- Proposta de escopo, etapas e itens a validar (resposta às diretrizes de out/2026): [docs/PROPOSTA.md](docs/PROPOSTA.md)
- Checklist do que falta (validação, virada de DNS, contas Google/Meta): [docs/PROXIMOS-PASSOS.md](docs/PROXIMOS-PASSOS.md)

## Linguagem visual (v4, out/2026)

Direção "D" escolhida no canvas de design (https://claude.ai/artifact/VfobQgVQyrFSoBJKpTHKgD): foto em tela cheia e
tipografia editorial (IBM Plex Sans + Mono), com blocos escuros trabalhados (navy #0A121A, petróleo #12324A),
cards arredondados e destaque laranja. Seções alternam claro e escuro. Referências: Intuitive, CMR Surgical,
Butterfly, ConMed.

CSS: **Tailwind CSS v4** via CLI standalone (binário, sem npm). `tools/setup-tailwind.sh` baixa a versão fixada
para `tools/bin/` (ignorado pelo git); o build gera `dist/assets/css/main.css` minificado. Tokens ficam em
`@theme` e os componentes em `@layer components` de `src/styles/main.css`; utilitários podem ser usados direto
nos templates.

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

Não há `npm install`. Antes do primeiro build, rode `npm run setup` (baixa o Tailwind standalone). O Lighthouse CI roda via `npx` apenas no CI.

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
