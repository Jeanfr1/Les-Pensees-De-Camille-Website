# 05 — Assets e marca

## Procedimento de produção

1. Preservar as cinco capturas fornecidas, sem sobrescrever os arquivos. O conceito fornecido fica separado das fotos comerciais.
2. Conferir a marca atual na fachada e no Instagram. O logo antigo obtido no site público não é usado.
3. Restaurar a marca atual em PNG com canal alpha real, preservando a assinatura e o descritor. O resultado é raster assistido por IA; nunca chamar de vetor oficial. Fonte ideal futura: arquivo mestre enviado pelo cliente.
4. Criar um único arranjo editorial para o hero a partir das espécies e cores da boutique, isolado em fundo transparente. Guardar prompt e master PNG. Não associá-lo a um preço ou disponibilidade.
5. Exportar cópias WebP das fotos reais e do hero para o site. Converter formato sem alterar rosto, conteúdo ou sinalização; os enquadramentos são CSS. Validar cada arquivo após a exportação para evitar WebP vazio.
6. Hospedar fontes localmente, mantendo TTF e OFL no kit. Instrument Serif e Manrope vêm dos repositórios oficiais listados em `docs/font-sources.json`.
7. Validar alpha do logo e do hero, dimensões naturais, links locais, acentos e inventário antes de empacotar.

## Mapa rápido

| Asset | Papel |
| --- | --- |
| `site/assets/brand/logo.png` | Marca atual restaurada, versão sobre claro |
| `site/assets/images/hero-fleurs.webp` | Arranjo transparente gerado para campanha |
| `site/assets/images/bouquet.webp` | Foto real de criações |
| `site/assets/images/rencontre.webp` | Foto real da pessoa com vaso |
| `site/assets/images/boutique.webp` | Foto real da entrada na galeria |
| `site/assets/images/vitrine-fleurs.webp` | Foto real complementar no aperçu Plantes |
| `references/Modelo1-Les-Mots-En-Fleurs-Aprovado.png` | Prancha aprovada, não usada como site |

As hastes e o diamante do capítulo de ocasiões são desenhos SVG simples no HTML, não uma falsa vetorização da marca. Não há vídeos no material fornecido ou na entrega. Todo material gerado está identificado no inventário e nos prompts.
