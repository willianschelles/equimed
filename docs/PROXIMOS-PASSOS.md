# Próximos passos (parado em 21/10/2026)

Estado: site v3 completo e publicado no preview https://willianschelles.github.io/equimed/ (commit mais
recente na `main`). Auditoria SEO 0/0, Lighthouse 100. Preview local: `npm run dev` → http://localhost:8787/.

## 1. Validar site e UI com o pessoal (Willian + família, 22/10)

Mostrar o preview e colher respostas para os itens de `docs/PROPOSTA.md`, seção 4:

- [ ] Listas de marcas e modelos por família (`content/families.json`): estão corretas? Faltam/sobram modelos?
- [ ] Textos de software (desbloqueio só sem função de segurança, só equipamento do cliente): ok?
- [ ] Garantia do serviço (hoje "com garantia", sem prazo) e se a avaliação técnica é cobrada.
- [ ] Horário (seg–sex 8h–18h foi assumido) e Instagram (se existir).
- [ ] Ressonância, raio-x e mamografia: continuam atendidos? (hoje removidos)
- [ ] Fotos reais: 7 linhas sem foto (System 7, System 8, baterias 7/8, Hall PowerPro/MPower, Linvatec Advantage,
      IMAGE1 S, Stryker Core) e, se possível, fotos novas dos seminovos em fundo branco e da bancada.
- [ ] Preencher valores e prazos na tabela da seção 5 da proposta antes de enviar ao pai.

Edições de texto: `docs/CONTENT-EDITING.md`. Depois de editar, `npm run check` e push na `main`.

## 2. Virar o domínio (quando a validação passar)

Roteiro completo: `docs/DNS-CUTOVER.md`. Resumo:

- [ ] Registro.br: servidores DNS do PointDNS (Heroku) → DNS do Registro.br; criar 4 A no apex
      (185.199.108.153 / .109.153 / .110.153 / .111.153) e CNAME `www` → `willianschelles.github.io`.
- [ ] GitHub: Settings → Pages → Custom domain `www.equimedpr.com.br`
      (ou `gh api -X PUT repos/willianschelles/equimed/pages -f cname=www.equimedpr.com.br`).
- [ ] `content/site.json`: `"publishCname": true` → push.
- [ ] GitHub: marcar Enforce HTTPS quando o DNS check passar.
- [ ] Conferir www, apex, `/about` → `/sobre/`, `/sitemap.xml`; rodar Actions → SEO monitor.
- [ ] Após 48 h estável, desligar o Heroku (o add-on PointDNS vai junto; sem efeito, DNS já migrado).

## 3. Contas na conta da EquimedPR (depois da virada)

- [ ] Google Search Console: propriedade `www.equimedpr.com.br` (tag de verificação já no site), enviar sitemap.
- [ ] Google Business Profile: categoria "serviço de reparo de equipamentos médicos", mesmo telefone/endereço do site.
- [ ] GA4 e Pixel da Meta: colar os IDs em `content/site.json` → `analytics` (o aviso de cookies aparece sozinho).
- [ ] Opcional: automações da seção 4 de `docs/SEO-MARKETING.md` (Search Console no relatório mensal,
      PR de correção automática com Claude Code).
