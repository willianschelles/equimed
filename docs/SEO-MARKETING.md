# SEO e marketing: estratégia, robô de monitoramento e opções

Princípio: **ninguém vai olhar isso toda semana.** Então tudo o que depende de atenção humana foi
transformado em (a) decisão tomada uma vez e gravada no código, ou (b) verificação automática que só
fala quando precisa de ação, e diz exatamente o que fazer.

## 1. Quem busca, o que busca (pesquisa de campo, out/2026)

Personas e vocabulário, do mais frequente ao menos:

| Quem | O que precisa ver | Palavras que usa |
|---|---|---|
| Engenharia clínica / manutenção hospitalar | escopo por equipamento, laudo, teste de segurança elétrica, prazo, equipamento reserva | "assistência técnica videocirurgia", "manutenção fonte de luz xenon", "conserto câmera Karl Storz", "manutenção insuflador" |
| Compras / suprimentos / licitação | CNPJ, garantia, locação com manutenção incluída, comodato | "locação de torre de videocirurgia", "comodato equipamentos cirúrgicos" |
| Cirurgião ortopedista / artroscopista | compatibilidade de marca e modelo, backup no dia da cirurgia | "perfurador Stryker System 6 seminovo", "artrobomba", "shaver" |
| Distribuidora de OPME / implantes | reparo rápido, empréstimo, instrumental | "manutenção motor Stryker", "caixa de instrumental" |
| Veterinário cirurgião | preço, seminovo, parcelamento, WhatsApp | "equipamento cirúrgico veterinário", "videocirurgia veterinária" |

Decisões gravadas no site a partir disso:

- **WhatsApp é o CTA principal** em todas as páginas (botão fixo, barra de CTA, formulário que gera a
  mensagem). A mensagem já vem com os campos que a equipe precisa (equipamento, marca/modelo, necessidade).
- URLs e títulos em português com marca + modelo + tipo (`/produtos/stryker-fonte-de-luz-l9000-led/`),
  porque é assim que se busca.
- Página por serviço (`/servicos/manutencao/`, `/locacao/`, `/venda/`) com FAQ: cada pergunta é uma busca
  de cauda longa e vira *rich result* via FAQPage.
- "Curitiba", "Paraná" e "todo o Brasil" aparecem nos títulos e no texto, não só no rodapé.
- Sinais de confiança no texto: desde 2014, garantia 3 meses/1 ano, revisado e testado conforme fabricante,
  assistência técnica **independente** (honestidade sobre autorização de fábrica conta a favor).

Palavras-chave alvo (valide no Search Console depois de 60 dias): ver lista no fim deste arquivo.

## 2. O que já está no código (não precisa manter)

- Títulos e descrições únicos por página; canonical; Open Graph (preview bonito no WhatsApp).
- Dados estruturados JSON-LD: `MedicalBusiness`/`LocalBusiness` (endereço, telefone, horário, geo),
  `Product` + `Offer` por produto, `Service` + `FAQPage` por serviço, `BreadcrumbList`, `ItemList`.
- `sitemap.xml` e `robots.txt` gerados no build. Página 404 real. `google-site-verification` mantido.
- Performance: HTML estático, CSS único sem framework, imagens WebP com `width/height` (sem layout shift),
  `loading="lazy"`, sem fontes externas, sem JS de terceiros. Zero cookies, zero LGPD a gerenciar.
- Acessibilidade: HTML semântico, skip link, foco visível, contraste, `lang="pt-BR"`, modo escuro.

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

Serviço: manutenção de equipamentos médicos Curitiba · assistência técnica videocirurgia · assistência técnica
torre de vídeo · conserto câmera de vídeo cirúrgica · manutenção câmera Karl Storz · manutenção fonte de luz
xenon · troca de lâmpada xenon por LED · manutenção insuflador de CO2 · manutenção artrobomba · manutenção
endoscópio rígido · reparo perfurador ortopédico · manutenção motor Stryker System 5 / System 6.

Locação: locação de equipamentos cirúrgicos · locação de torre de videocirurgia · locação de equipamentos
para artroscopia · locação por procedimento · comodato de equipamentos cirúrgicos.

Venda: equipamentos de videocirurgia seminovos · perfurador ortopédico Stryker seminovo · carregador de
bateria Stryker · instrumental artroscopia STAHL · equipamento cirúrgico veterinário · câmera de vídeo
cirúrgica seminova.

Marca + modelo: Stryker 1488HD · Stryker L9000 · Storz Image1 HUB · Storz 20133120 · Dyonics 560P ·
Dyonics 500XL · NDS Radiance G2 · Stryker WiSe · Stryker System 6.

Local: + Curitiba · + Paraná · + Sul do Brasil.
