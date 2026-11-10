# Validação — Les Mots en Fleurs

**Checagens estáticas: 142/142 aprovadas.**

**QA visual e de interação em navegador: NÃO VERIFICADO.** A prévia gerenciada falhou com `preview relay unavailable: No such file or directory`. A configuração de diretório foi corrigida antes da tentativa final; o erro restante é de infraestrutura. Nenhum servidor ou navegador alternativo foi usado para contornar o ambiente.

## Executado

Referências locais e âncoras; sintaxe JavaScript; arquivos JSON; cinco capítulos e seleção; arquivos de fontes/licenças; glyphs franceses; decodificação de cada imagem; canal alpha real do logo e do hero; igualdade exata dos pixels RGB das quatro fotos reais nas cópias WebP lossless; restrições de escala e métricas tipográficas em 375, 768, 1024, 1440 e 1920 px.

Em 1024/1440/1920, título de 92 px e flor de 650 px. Essas são verificações dos parâmetros de implementação e avanços da fonte, não medições de layout em navegador.

## Inspeção visual de assets

Prancha aprovada, fotos de referência, logo atual da fachada e do Instagram, arranjo transparente e restauração raster da marca foram inspecionados. O logo histórico do site público foi separado e não é usado. Fotografias reais não foram regeneradas. Isso não substitui a revisão visual da página montada.

## Pendente em navegador

Enquadramento em cada breakpoint, sobreposição das camadas, estabilidade no carregamento, contraste sobre fotos, menus, aperçus, details expandido, foco, Escape, links externos em aplicativos reais, pausa, preferência reduzida e eventual transbordamento horizontal. Não houve chamadas telefônicas, e-mails, mensagens, pedidos ou publicação.

## Integridade da entrega

O empacotamento é verificado separadamente no relatório externo de release: CRC de todas as entradas do ZIP e SHA-256 dos arquivos contra o manifesto. O hash do próprio ZIP fica no relatório externo para evitar referência circular.
