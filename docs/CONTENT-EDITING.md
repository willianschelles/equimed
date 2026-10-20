# Como editar o conteúdo do site (sem programar)

Todo o texto, produtos, telefones e endereço ficam em arquivos `.json` na pasta `content/`.
Editar um deles e publicar é tudo o que você precisa. Nada de servidor, banco ou painel.

## Onde está cada coisa

| Quero mudar… | Arquivo | Campo |
|---|---|---|
| Telefones, WhatsApp, e-mail, endereço, horário | `content/site.json` | `phones`, `whatsapp`, `email`, `address`, `openingHoursDisplay` |
| Mensagem que já vem pronta no WhatsApp | `content/site.json` | `whatsapp.message` |
| Textos da página inicial, serviços, sobre, contato | `content/pages.json` | cada bloco tem `title` (aba do navegador e Google), `description` (resumo no Google) e os textos |
| Perguntas frequentes | `content/pages.json` | `services.items[].faq` |
| Produtos (adicionar, remover, corrigir) | `content/catalog.json` | lista `products` |
| Categorias e especialidades | `content/catalog.json` | lista `specialties` |
| Marcas | `content/brands.json` + logo em `src/assets/img/brands/<slug>.webp` | |
| Imagem de produto | `src/assets/img/products/<image>.webp` (WebP, ~1000 px de largura) | |

## Adicionar um produto

1. Salve a foto como WebP em `src/assets/img/products/nome-do-produto.webp`
   (no Mac/Linux: `cwebp -q 82 -resize 1000 0 foto.jpg -o src/assets/img/products/nome-do-produto.webp`).
2. Em `content/catalog.json`, copie um bloco de `products` e ajuste:

```json
{
  "slug": "storz-camera-image1-s",          // vira a URL: /produtos/storz-camera-image1-s/
  "name": "Storz Câmera de Vídeo",
  "model": "Image1 S, 4K",
  "brand": "Karl Storz",
  "specialty": "video-cirurgia",            // slug de uma especialidade existente
  "category": "cameras-de-video",           // slug de uma categoria dessa especialidade
  "image": "storz-camera-image1-s",         // nome do arquivo sem .webp
  "condition": "seminovo",                  // opcional; mostra o selo "seminovo revisado"
  "summary": "Uma frase que resume o produto (vira a descrição no Google).",
  "paragraphs": ["Parágrafos extras, opcional."],
  "list": { "title": "Características", "items": ["item 1", "item 2"] },
  "specs": [["Alimentação", "100–240 V"], ["Peso", "5 kg"]]
}
```

3. Publique (abaixo). A página do produto, a listagem da categoria, o sitemap e os dados estruturados
   são gerados sozinhos.

## Publicar

**Pelo site do GitHub (sem instalar nada):** abra o arquivo no repositório, clique no lápis, edite, e em
*Commit changes* escolha **Create a new branch and start a pull request**. O robô verifica o site (build,
SEO, Lighthouse). Se passar, clique em *Merge*. Em ~2 minutos o site está no ar.

**No computador:**

```sh
npm run dev      # vê em http://localhost:8787
npm run check    # confere SEO do build
git commit -am "Adiciona câmera Storz Image1 S" && git push
```

## Regras que o robô cobra

- `title`: 15 a 65 caracteres, único por página.
- `description`/`summary`: 50 a 160 caracteres, única por página.
- Toda imagem precisa existir no arquivo indicado (o build falha se não existir).
- JSON válido (vírgulas e aspas). Em caso de dúvida, cole o arquivo em https://jsonlint.com.
