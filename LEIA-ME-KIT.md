# Les Pensées de Camille — Les Mots en Fleurs

Kit completo do **modelo 1 — Herbier vivant**, escolhido como **Les Mots en Fleurs**. Site de apresentação em francês, com cinco capítulos, marca atual restaurada em PNG transparente, fotografias reais, fontes locais e direção de movimento. Entrega local; não publicada.

## Comece aqui

1. Extraia o ZIP inteiro, preservando as pastas.
2. Abra `GUIA-VISUAL.html` para a direção de arte, referência aprovada e mapa da entrega.
3. Abra `site/index.html` para a implementação. CSS, JavaScript, fontes e imagens são locais; não há instalação obrigatória. Use um navegador atual. Chamadas, e-mail e itinerário dependem dos aplicativos/serviços externos correspondentes.
4. Leia os seis arquivos em `roteiros/` para produzir, revisar ou continuar o projeto.
5. Antes de publicar, confira horários e dados comerciais com a boutique e complete as informações legais aplicáveis com dados reais. O kit não contém cadastro, conta de hospedagem nem publicação automática.

## O que está pronto

- Hero **LES MOTS / EN FLEURS.**, com composição floral de campanha em camada transparente, tipografia estreita e sombra suave.
- Criações com fotografia real e índice de Bouquets / Compositions / Plantes; cada item abre um aperçu com uma foto fornecida, sem catálogo ou preço inventado.
- Capítulo de contraste **Pour les grands jours. Et les petites attentions.**, com ocasiões, bijoux e cadeaux.
- Capítulo humano **Une boutique. Des envies à partager.**, usando a fotografia original, sem modificar rosto nem atribuir nome ou função.
- Contato **Faisons fleurir vos envies.**, sobre a boutique real, com telefone, itinerário, Instagram, e-mail e informações práticas.
- Menu móvel, navegação por âncoras, diálogos nativos com fechamento por Escape, foco devolvido ao gatilho, movimento reduzido e pausa manual.

## Identidade e imagens

A identidade atual da fachada e do Instagram tem prioridade. `brand/logo-restaurado-transparente.png` é uma **restauração raster assistida por IA** da referência fornecida, com lettering preto, assinatura e emblema dourado. Não é o arquivo mestre oficial nem um vetor original. O logo histórico encontrado no site público ficou somente em `references/`, identificado para não ser usado.

Os arquivos em `images/originals/` são cópias intactas das imagens anexadas. A implementação faz enquadramentos via CSS para omitir controles das capturas, preservando seus pixels e os rostos. A composição do hero em `images/campaign/` foi criada para a campanha e não representa um produto disponível. A prancha aprovada em `references/` é uma composição conceitual, não uma captura da implementação.

## A regra de escala

Base virtual **1024 px**, centralizada. Título principal **92 px** e composição floral **650 px** no desktop; esses valores permanecem em 1024, 1440 e 1920 px. Fundos ambientes e cores podem ocupar a largura da página. Hero e sujeitos têm medidas explícitas e proporção natural. Mobile usa reflow, não uma prancha inteira encolhida. Veja `docs/scale-contract.json` e `docs/scale-measurements.json`.

## Estrutura

| Pasta/arquivo | Uso |
| --- | --- |
| `site/` | HTML, CSS, JS e assets prontos para revisão |
| `brand/` | PNG transparente e tokens visuais |
| `fonts/` | Fontes TTF originais e licenças OFL |
| `images/` | Originais fornecidos e master floral de campanha |
| `references/` | Modelo aprovado, conceito fornecido e logo histórico identificado |
| `roteiros/` | Direção de arte, hero, capítulos, conteúdo, assets e entrega |
| `motion/` | Timeline e especificação de movimento |
| `docs/` | Seleção, fontes, inventário, contratos e relatório de QA |
| `tools/` | Verificação de arquivos, escala e integridade; dependências opcionais |
| `MANIFEST.sha256` | Hash de cada arquivo do kit, exceto o próprio manifesto |

## Validação e limites

Consulte `docs/QA.md` para o resultado executado. A prévia gerenciada não pôde abrir porque o relay do ambiente estava indisponível. **QA visual em navegador: não verificado.** As medidas de 375, 768, 1024, 1440 e 1920 px são verificações de contrato e métricas tipográficas, não screenshots ou testes de interação. Sintaxe JS, referências locais, decodificação de imagens, alpha da marca, fontes, hashes e CRC do ZIP são verificados separadamente.

Para repetir a verificação opcional em um ambiente com Python, Pillow e fontTools: `python tools/verificar-kit.py`. Para conferir hashes sem dependências extras: `python tools/verificar-hashes.py`. Execute a partir da raiz do kit.

Não há vídeo gerado, checkout, reserva, formulário que simule envio, avaliações fabricadas nem integração de redes sociais carregada sem clique. O conteúdo usa contatos públicos da boutique e textos autorais em francês.
