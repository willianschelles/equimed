# Como editar o conteúdo do site (sem programar)

Todo o texto, produtos, telefones e endereço ficam em arquivos `.json` na pasta `content/`.
Editar um deles e publicar é tudo o que você precisa. Nada de servidor, banco ou painel.

## Onde está cada coisa

| Quero mudar… | Arquivo | Campo |
|---|---|---|
| Telefones, WhatsApp, e-mail, endereço, horário | `content/site.json` | `phones`, `whatsapp`, `email`, `address`, `openingHoursDisplay` |
| Mensagem que já vem pronta no WhatsApp | `content/site.json` | `whatsapp.message` |
| Aviso de assistência independente e de escopo (implantes/instrumentais) | `content/site.json` | `independenceNotice`, `scopeNotice` |
| Google Analytics 4 e Pixel da Meta | `content/site.json` | `analytics.ga4MeasurementId`, `analytics.metaPixelId` (vazio = desligado) |
| Instagram no rodapé | `content/site.json` | `social.instagram` |
| Menu principal | `content/site.json` | `nav` |
| Página inicial, Equipamentos, Marcas, Conteúdo, Sobre, Contato, Privacidade | `content/pages.json` | cada bloco tem `title` (aba e Google), `description` (resumo no Google) e os textos |
| Manutenção, Locação, Venda, Software (textos, listas e FAQ) | `content/services.json` | um bloco por serviço: `intro`, `items`/`areas`, `faq` |
| Famílias de equipamento e as páginas "Manutenção de …" | `content/families.json` | `lead`, `short`, `maintenance.intro`, `commonFailures`, `whatWeDo`, `brands[].models`, `faq` |
| Marcas e páginas por marca | `content/brands.json` | `lead`, `paragraphs`, `families`, `focus` (true = destaque) |
| Produtos e linhas atendidas | `content/catalog.json` | lista `products` |
| Conteúdo técnico (artigos) | `content/articles.json` | `title`, `description`, `sections[]` |
| Foto de produto | `src/assets/img/products/<image>.webp` + `<image>-480.webp` | |
| Logo de marca | `src/assets/img/brands/<slug>.webp` (sem logo, o site mostra o nome em texto) | |

## Produtos: atendido, à venda ou em locação

Cada produto tem `services`, que decide os selos e os textos:

```json
"services": ["manutencao", "venda", "locacao"]
"services": ["manutencao"]
```

A primeira forma é um seminovo disponível. A segunda é uma linha atendida só em manutenção (ex.: System 8).

- `condition`: `"seminovo"` (mostra "garantia 3 meses"), `"novo"` ou `null`.
- `family`: um dos `slug` de `content/families.json`.
- `brandSlug`: um dos `slug` de `content/brands.json` (ou `null`).
- `image`: nome do arquivo sem `.webp`, ou `null` para mostrar o ícone da família com "Foto em breve".

## Adicionar um produto

1. Salve a foto como WebP em `src/assets/img/products/nome-do-produto.webp` (~1000 px) e uma versão
   `nome-do-produto-480.webp` (480 px). No Mac/Linux:

   ```sh
   cwebp -q 85 -resize 1000 0 foto.jpg -o src/assets/img/products/nome-do-produto.webp
   cwebp -q 85 -resize 480 0 foto.jpg -o src/assets/img/products/nome-do-produto-480.webp
   ```

   Fundo branco ou claro funciona melhor: o site funde o branco com o fundo do cartão.
2. Em `content/catalog.json`, copie um bloco de `products` e ajuste `slug` (vira a URL `/produtos/<slug>/`),
   `name`, `model`, `brand`, `brandSlug`, `family`, `image`, `condition`, `services`, `summary`,
   `paragraphs`, `list` e `specs`.
3. Publique (abaixo).

## Adicionar um artigo de conteúdo técnico

Copie um bloco de `content/articles.json`. Cada item de `sections` tem `h` (subtítulo), `p` (parágrafos) e/ou
`list` (itens). `families` liga o artigo às páginas de manutenção relacionadas. A data vai em `date`.

## Regras que o robô confere

- `title` com 15–65 caracteres; `description` com 50–160. O build encurta o que passar, mas é melhor escrever certo.
- Cada página tem um único H1 (vem do template; não escreva "#" nos textos).
- Não deixe `image` apontando para arquivo inexistente: o build falha e diz qual.

## Publicar

1. Edite o arquivo no GitHub (ícone de lápis) ou localmente.
2. Localmente: `npm run check` (constrói e audita). No GitHub: abra um Pull Request; a verificação roda sozinha.
3. Merge/push na branch `main`. O workflow **Deploy** publica em 1–2 minutos.

Preview local: `npm run dev` e abra http://localhost:8787/.
