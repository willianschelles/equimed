# Virada do domínio: Heroku → GitHub Pages

Situação encontrada em 21/10/2026 (`dig`/`whois`):

| Item | Hoje |
|---|---|
| Registro | Registro.br (status ACTIVE) |
| Servidores DNS | PointDNS (`*.pointhq.com`), o add-on de DNS do Heroku |
| `www.equimedpr.com.br` | CNAME → `functional-jaguar-….herokudns.com` (app Django) |
| `equimedpr.com.br` (sem www) | **sem registro A**: não abre |
| MX / TXT | nenhum (e-mail é Gmail, nada a migrar) |

Ponto de atenção: a zona DNS vive num add-on do Heroku. Se o app for apagado antes de mover o DNS, o domínio
sai do ar. Por isso a ordem abaixo começa tirando o DNS do Heroku.

## Passo a passo (30 min de trabalho, até 24 h de propagação)

**1. Levar o DNS para o Registro.br (grátis, fica na conta da EquimedPR).**
No painel do Registro.br, no domínio `equimedpr.com.br`: *DNS → Alterar servidores DNS → Utilizar DNS do Registro.br*.
Depois, em *Editar zona*, criar os registros:

| Tipo | Nome | Valor |
|---|---|---|
| A | (vazio = apex) | `185.199.108.153` |
| A | (vazio) | `185.199.109.153` |
| A | (vazio) | `185.199.110.153` |
| A | (vazio) | `185.199.111.153` |
| CNAME | `www` | `willianschelles.github.io` |

Enquanto a propagação não termina (minutos a 24 h), quem ainda resolver pelo PointDNS continua vendo o Heroku;
quem resolver pelo Registro.br cai no GitHub. Não há janela "fora do ar".

**2. Dizer ao GitHub qual é o domínio.**
No repositório `willianschelles/equimed`: *Settings → Pages → Custom domain* = `www.equimedpr.com.br` → Save.
Ou, no terminal: `gh api -X PUT repos/willianschelles/equimed/pages -f cname=www.equimedpr.com.br`.
O GitHub emite o certificado TLS sozinho em alguns minutos assim que o DNS responder.

**3. Ligar a chave no site.**
Em `content/site.json`, mudar `"publishCname": false` para `true` e dar push na `main`. Isso faz o build gerar o
arquivo `CNAME`, usar links absolutos (sem o prefixo `/equimed/`) e ativar a auditoria no deploy.

**4. Forçar HTTPS.**
Quando *Settings → Pages* mostrar "DNS check successful" e o certificado pronto, marcar *Enforce HTTPS*.

**5. Conferir.**
`https://www.equimedpr.com.br/`, `https://equimedpr.com.br/` (deve redirecionar para www), um endereço antigo como
`https://www.equimedpr.com.br/about` (deve cair em `/sobre/`), e `https://www.equimedpr.com.br/sitemap.xml`.
Rodar `npm run check:seo:live` ou *Actions → SEO monitor → Run workflow*.

**6. Só então desligar o Heroku.**
Depois de 48 h com o novo site respondendo, desativar os dynos e, se quiser, apagar o app. O add-on PointDNS
vai junto, sem efeito porque o DNS já estará no Registro.br.

## Depois da virada

Search Console (propriedade `www.equimedpr.com.br`, enviar o sitemap), Google Business Profile, e os IDs de GA4 e
Meta em `content/site.json`. Ver `docs/SEO-MARKETING.md`.

## Se algo der errado

- Reverter é trocar os servidores DNS de volta para os do PointDNS no Registro.br (enquanto o app Heroku existir).
- O preview `https://willianschelles.github.io/equimed/` passa a redirecionar para o domínio assim que o custom
  domain for configurado; isso é esperado.
