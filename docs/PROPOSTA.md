# Proposta: atualização do site EquimedPR (www.equimedpr.com.br)

Resposta às diretrizes enviadas em 20/10/2026 (apresentação institucional, posicionamento em buscadores
e geração de oportunidades), com o que já está implementado neste repositório e o que fica como trabalho
contínuo. Valores e prazos são campos para preencher antes de enviar.

## 1. Diagnóstico técnico do site atual (Django/Heroku, 2018)

| Ponto levantado | Situação encontrada | Tratamento |
|---|---|---|
| Venda associada à veterinária no cabeçalho e locação no mesmo segmento | Confirmado no HTML antigo e na primeira versão nova | Removido. Posicionamento único: assistência técnica independente multimarcas em equipamentos médicos |
| Sem área de software | Confirmado | Página `/software/` com três frentes (atualização, desbloqueio, desenvolvimento) e o carregador inteligente como caso |
| Manutenção genérica | Confirmado (3 parágrafos) | 7 páginas `/manutencao/<família>/` com defeitos comuns, o que fazemos, marcas e modelos e FAQ, mais o processo de avaliação técnica |
| Catálogo em System 5 e 6 | Confirmado | Adicionadas as linhas System 7 e 8, baterias 7/8, ConMed Hall PowerPro/MPower 2, Linvatec Advantage, Storz IMAGE1 S, Stryker Core/CrossFire. Cada item marca se é **atendido** (manutenção), **venda** ou **locação** |
| Instrumentais e implantes | Confirmado (STAHL Access, caixa de esterilização, acessórios de limpeza) | Removidos. Aviso "não trabalhamos com implantes nem instrumentais" no rodapé, na venda e na FAQ |
| Ressonância, raio-x e mamografia | Confirmado no texto antigo de serviços e sobre | Removidos até validação. Se forem atendidos, basta recolocar em `content/services.json` |
| Textos em inglês, modelos e garantias inconsistentes | Confirmado | Todos os textos reescritos em pt-BR, nomes com marca + modelo + referência, garantia 3 meses (seminovos) e 1 ano (novos) |
| Campos de programação expostos e página de marcas rasa | Confirmado (chaves de template no HTML e grade de logos sem texto) | Página de marcas com texto por marca, famílias atendidas e páginas individuais `/marcas/<marca>/` |
| Sitemap inexistente (404), sem canonical, sem dados estruturados | Confirmado | Gerados no build: sitemap, robots, canonical, Open Graph, JSON-LD |

## 2. Estrutura implementada

Navegação: **Manutenção · Locação · Venda · Software · Equipamentos (marcas e equipamentos atendidos) ·
Conteúdo técnico · Sobre · Contato e orçamento** (botão de WhatsApp sempre visível).

| Área | URL | Conteúdo |
|---|---|---|
| Manutenção | `/manutencao/` + `/manutencao/<família>/` | processo de avaliação técnica, preventiva/contratos, 7 famílias com modelos por marca |
| Locação | `/locacao/` | modalidades (procedimento, período, reserva durante reparo), equipamentos, FAQ |
| Venda | `/venda/` | seminovos por família, garantia, licitação, escopo |
| Software | `/software/` | atualização de firmware, desbloqueio, desenvolvimento sob medida |
| Equipamentos | `/equipamentos/` + `/equipamentos/<família>/` + `/produtos/<item>/` | 9 famílias, 33 itens (26 com foto, 7 linhas atendidas aguardando foto real) |
| Marcas | `/marcas/` + `/marcas/<marca>/` | Stryker, ConMed, Linvatec, Karl Storz e nacionais/chineses em destaque; 17 outras marcas |
| Conteúdo técnico | `/conteudo/` + 6 artigos | avaliação técnica, System 5 a 8, sinais de falha, baterias, xenon x LED, independente x autorizada |
| Institucional | `/sobre/`, `/contato/`, `/privacidade/` | |
| Endereços antigos | 66 redirecionamentos (`/about`, `/products/...`, `/speciality/...`) | preservam os links já indexados |

Páginas-alvo das buscas pedidas: "manutenção de perfuradores Stryker" leva a `/manutencao/perfuradores-e-serras/`
e `/marcas/stryker/`; "assistência em equipamentos ConMed/Linvatec" leva a `/marcas/conmed/` e `/marcas/linvatec/`;
"manutenção de equipamentos Karl Storz" leva a `/marcas/karl-storz/` e às famílias de câmera, fonte e insuflador.

## 3. SEO, IA e mensuração: o que está no código

- Título e descrição únicos por página, URLs em português, links internos entre serviço, família, marca, produto e artigo.
- Dados estruturados: `MedicalBusiness/LocalBusiness`, `Service` por serviço, família e marca, `Product` + `Offer`
  (só para itens à venda), `FAQPage`, `TechArticle`, `BreadcrumbList`, `ItemList`.
- Preparação para buscas com IA: conteúdo técnico original, perguntas e respostas explícitas (FAQ), entidades
  nomeadas (marca, modelo, família), aviso claro de independência. Sem promessa de posicionamento.
- Compartilhamento: imagem Open Graph 1200×630 própria, título e descrição por página (WhatsApp, Facebook, Instagram).
- Mensuração: Google Analytics 4 e Pixel da Meta prontos, ativados ao preencher o ID em `content/site.json`.
  Eventos: `whatsapp_click`, `phone_click`, `email_click`, `form_submit` e `generate_lead`, com a posição do
  clique (hero, rodapé, produto, CTA). Nada carrega antes do consentimento de cookies (LGPD); política em `/privacidade/`.
- Validação técnica: sitemap, robots, canonical, 404 real, auditoria automática mensal (ver `docs/SEO-MARKETING.md`).
- Desempenho e acessibilidade: Lighthouse 100/100/100/100 nas 6 páginas de referência (desktop), fontes
  próprias, imagens WebP com tamanhos, sem bibliotecas externas.

## 4. O que a EquimedPR precisa validar ou fornecer

1. **Modelos citados** por família e marca (`content/families.json`): a lista foi montada por pesquisa e precisa
   da revisão técnica de vocês. Em especial: ConMed/Linvatec (PowerPro, MPower 2, Advantage, LS7700/LS8000,
   IM4000/IM8000), Storz (IMAGE1 S, Power LED, Endoflator 50) e Stryker (1688, L10, Pneumosure, Core 2).
2. **Fotos reais**: as fotos de ambiente (hero, cabeçalhos de serviço e família) são do Wikimedia Commons, com licença livre e crédito em `/privacidade/#creditos`; fotos próprias da bancada e da equipe devem substituí-las. Também faltam fotos das 7 linhas sem foto (System 7, System 8, baterias 7/8, Hall PowerPro/MPower, Linvatec
   Advantage, IMAGE1 S, Stryker Core) e, se possível, fotos novas dos seminovos em fundo branco.
3. **Serviços de software**: confirmar o texto de desbloqueio (o site diz que não remove bloqueios com função de
   segurança e atende só equipamento do próprio cliente).
4. **Garantias e prazos**: garantia do serviço (o site diz "com garantia", sem prazo) e se a avaliação técnica é cobrada.
5. **Horário de atendimento** (seg–sex, 8h–18h foi assumido) e **Instagram** (se existir).
6. **Contas**: criar ou confirmar propriedade do Google Search Console, Google Business Profile, GA4 e Meta
   Business em nome da EquimedPR (domínio, contas e acessos ficam com a empresa).
7. **Ressonância, raio-x e mamografia**: confirmar se continuam atendidos.

## 5. Etapas, prazos e investimento

| Etapa | Entregas | Prazo | Investimento |
|---|---|---|---|
| 1. Diagnóstico e estrutura | diagnóstico (seção 1), arquitetura (seção 2), base técnica, auditoria | **concluída** | R$ ____ |
| 2. Página inicial + página de serviço padrão | home, `/manutencao/` e `/manutencao/perfuradores-e-serras/` para aprovar o padrão | **concluída, aguardando revisão** | incluído |
| 3. Demais páginas | locação, venda, software, famílias, marcas, produtos, artigos, contato, privacidade | **concluídas, aguardando revisão de conteúdo** | R$ ____ |
| 4. Revisão e publicação | ajustes da revisão técnica, fotos reais, GA4/Meta, Search Console, Business Profile, DNS, teste em celular e formulários | ____ dias após o retorno da revisão | R$ ____ |
| **Contínuo: conteúdo e SEO** | 1 artigo técnico por mês ou trimestre, resposta ao relatório mensal do robô, revisão trimestral de palavras-chave no Search Console, novas linhas no catálogo | mensal | R$ ____ /mês |

Diferença entre atualização inicial e trabalho contínuo: a inicial entrega o site, a estrutura e a medição;
o contínuo é o que faz o site ganhar buscas ao longo do tempo (conteúdo novo, ajustes guiados pelos dados).
O robô mensal (`docs/SEO-MARKETING.md`) reduz o contínuo ao mínimo: ele avisa só quando há algo a fazer.

## 6. Referências consideradas

MS Medical Systems (organização venda, locação e assistência, FAQ) e Multmed (proximidade técnica em
perfuradores, serras, baterias e atualização) serviram de base para a estrutura por serviço e para as
páginas por família com conteúdo técnico, preservando a identidade da EquimedPR.
