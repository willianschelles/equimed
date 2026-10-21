# SEO e marketing: estratégia, robô de monitoramento e opções

Princípio: **ninguém vai olhar isso toda semana.** Então tudo o que depende de atenção humana foi
transformado em (a) decisão tomada uma vez e gravada no código, ou (b) verificação automática que só
fala quando precisa de ação, e diz exatamente o que fazer.

## 1. Posicionamento e quem busca

Posicionamento (diretrizes de 20/10/2026): **assistência técnica independente multimarcas** em equipamentos
médicos, com manutenção, locação, venda e soluções de software. Foco: Stryker, ConMed, Linvatec, Karl Storz,
equipamentos nacionais e chineses. Fora do escopo: implantes e instrumentais; nunca sugerir assistência autorizada.

| Quem | O que precisa ver | Palavras que usa |
|---|---|---|
| Engenharia clínica / manutenção hospitalar | escopo por família e modelo, processo de avaliação, laudo e teste de segurança elétrica, prazo, reserva | "manutenção perfurador Stryker", "assistência técnica Karl Storz", "manutenção fonte de luz xenon" |
| Compras / suprimentos / licitação | garantia, proposta técnica, locação com manutenção incluída | "locação de torre de videocirurgia", "venda perfurador seminovo" |
| Cirurgião ortopedista / artroscopista | compatibilidade de linha (System 5/6/7/8), bateria, backup no dia | "System 7 bateria", "shaver Linvatec manutenção" |
| Distribuidora / locadora de equipamentos | reparo rápido, atualização de software, carregador multilinha | "desbloqueio Stryker", "atualização firmware perfurador" |

Decisões gravadas no site:

- **WhatsApp é o CTA principal** em todas as páginas, com mensagem pré-preenchida por contexto (família, marca, produto).
- **Uma página por serviço × família** (`/manutencao/<família>/`) e **uma por marca** (`/marcas/<marca>/`):
  são as páginas que respondem "manutenção de perfuradores Stryker", "assistência ConMed/Linvatec", "manutenção Karl Storz".
- Produtos com estado explícito: atendido em manutenção, à venda, em locação. Linhas atuais (System 7 e 8) presentes
  mesmo sem estoque, porque a busca é por manutenção.
- Conteúdo técnico original (`/conteudo/`) com FAQ e entidades nomeadas: é o que motores de busca e assistentes de IA citam.
- Aviso de independência em todas as páginas de marca, produto e serviço.

## 2. O que já está no código (não precisa manter)

- Títulos e descrições únicos por página; canonical; Open Graph (preview bonito no WhatsApp).
- Dados estruturados JSON-LD: `MedicalBusiness`/`LocalBusiness` (endereço, telefone, horário, geo),
  `Product` + `Offer` por produto, `Service` + `FAQPage` por serviço, `BreadcrumbList`, `ItemList`.
- `sitemap.xml` e `robots.txt` gerados no build. Página 404 real. `google-site-verification` mantido.
- Performance: HTML estático, CSS único sem framework, fontes próprias (Inter e Manrope, subset latin), imagens WebP
  com `width/height` e `srcset`, `loading="lazy"`, sem JS de terceiros até o consentimento.
- Acessibilidade: HTML semântico, skip link, foco visível, contraste AA, `lang="pt-BR"`, modo escuro.
- Mensuração (seção 6): GA4 e Pixel da Meta opcionais, eventos de lead, consentimento LGPD.
- 66 redirecionamentos dos endereços antigos (Django) para os novos.

## 3. O robô (`tools/seo-audit.mjs` + workflow `SEO monitor`)

**Quando roda:** dia 1 de cada mês às 6h (Curitiba) e quando você quiser (*Actions → SEO monitor → Run workflow*).
Também roda em todo Pull Request (contra o build) e no deploy, bloqueando regressões antes de ir ao ar.

**O que verifica no site no ar:** cada URL do sitemap responde 200; título e descrição com tamanho e únicos;
um H1; canonical correto; Open Graph; JSON-LD válido; `alt` nas imagens; links internos; `lang`; viewport;
conteúdo misto http; robots e sitemap; redirecionamento http→https e sem-www→www; 404 real; conteúdo parado
há mais de 180 dias; notas do **PageSpeed Insights** (mobile) em 4 páginas, com alerta abaixo de 90.

**Como alerta:** mantém **uma única Issue** no GitHub ("Monitor SEO: ajustes pendentes", label `seo-monitor`).
Abre quando há algo, comenta nas execuções seguintes, fecha sozinha quando limpar. O GitHub manda e-mail
ao dono do repositório a cada atualização: esse é o alerta. Cada item traz **O que é / Como corrigir / Onde**
(arquivo a editar), em português, pensado para quem não é de SEO.

**Como aplicar a correção (manual, hoje):** editar o arquivo indicado (quase sempre `content/*.json`),
abrir PR (o CI confere), merge. Guia: `docs/CONTENT-EDITING.md`.

## 4. Opções para evoluir (escolha quando quiser)

| Opção | Esforço | O que ganha |
|---|---|---|
| **A. Manual via Issue (atual)** | zero | Alerta mensal por e-mail com instruções. |
| **B. Google Search Console** (uma vez) | 10 min | Ver as buscas reais que trazem visitas e páginas com erro de indexação. Já deixei o `google-site-verification` na tag; basta adicionar a propriedade em https://search.google.com/search-console e enviar `https://www.equimedpr.com.br/sitemap.xml`. |
| **C. Google Business Profile** (uma vez) | 20 min | Aparecer no mapa para "manutenção de equipamentos médicos Curitiba". Categoria: *Serviço de reparo de equipamentos médicos*; usar os mesmos telefone/endereço do `site.json` (consistência NAP). |
| **D. Search Console API no robô** | 1–2 h | O relatório mensal passa a incluir cliques, impressões, posição média e páginas perdendo tráfego. Requer uma *service account* e o secret `GSC_CREDENTIALS`. |
| **E. Chave PageSpeed** | 5 min | Secret `PSI_API_KEY` eleva a cota da API (hoje usa cota anônima, suficiente para 4 páginas/mês). |
| **F. Auto-correção com Claude Code** | 1 h | Workflow que, ao abrir a Issue, roda `claude -p` para propor um PR corrigindo títulos/descrições. Você só revisa e faz merge. |
| **G. Monitor de disponibilidade** | 10 min | UptimeRobot (gratuito) avisando se o site cair. O robô mensal já pega, mas com atraso. |
| **H. Conteúdo trimestral** | 1 h/trimestre | Um texto novo por trimestre (ex.: "Xenon ou LED: quando converter a fonte de luz") mantém o site "vivo". O robô avisa quando passar de 180 dias sem mudança. |

Recomendação: faça B e C agora (gratuitos, uma vez só). D e F quando quiser mais automação.

## 5. Palavras-chave alvo (para acompanhar no Search Console)

Serviço × marca: manutenção de perfuradores Stryker · manutenção Stryker System 7 · manutenção System 8 ·
assistência técnica ConMed · assistência Linvatec · manutenção Hall PowerPro · manutenção equipamentos Karl Storz ·
manutenção câmera IMAGE1 · manutenção fonte de luz xenon · conversão xenon para LED · manutenção insuflador ·
manutenção artrobomba · manutenção shaver · recuperação bateria Stryker · carregador bateria Stryker.

Software: atualização firmware perfurador · desbloqueio equipamento médico · carregador inteligente Stryker.

Locação e venda: locação de torre de videocirurgia · locação perfurador Stryker · perfurador Stryker seminovo ·
câmera de vídeo cirúrgica seminova · fonte de luz LED seminova.

Local: + Curitiba · + Paraná · + Brasil (envio por transportadora).

## 6. Mensuração e marketing

- **GA4**: preencha `analytics.ga4MeasurementId` em `content/site.json` (formato `G-XXXXXXX`). Eventos enviados:
  `whatsapp_click`, `phone_click`, `email_click`, `form_submit` e `generate_lead` (com `place` = hero, header,
  footer, fab, produto, cta). Marque `generate_lead` como conversão no GA4 para ver a origem dos contatos.
- **Meta**: preencha `analytics.metaPixelId`. O pixel dispara `PageView` e os mesmos eventos como `trackCustom`.
  Para campanhas, verifique o domínio no Meta Business e use os eventos acima como conversões personalizadas.
- **Consentimento**: o aviso só aparece quando há algum ID preenchido; nada é carregado antes do "Aceitar".
  A escolha fica no navegador do visitante e pode ser trocada em `/privacidade/`.
- **Links compartilhados**: cada página tem Open Graph e Twitter Card; a imagem padrão é
  `src/assets/img/site/og-image.png` (1200×630). Produtos com foto usam a própria foto.
- **Contas e acessos**: Search Console, Business Profile, GA4 e Meta devem ser criados na conta da EquimedPR,
  com o desenvolvedor como usuário convidado.
