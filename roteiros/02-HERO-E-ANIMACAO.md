# 02 — Hero e movimento: a frase floresce

## Cena inicial

Fundo marfim com luz difusa e grão muito discreto em CSS. Logo atual à esquerda, navegação contida à direita. Texto: Fleurs, plantes & jolies attentions · Herbignac. H1: LES MOTS / EN FLEURS. Dois caminhos: Voir les créations e Échanger avec nous. A frase de apoio é Pour ce que l’on a envie de dire.

À direita, um gerbera rosa com rosa marfim, lisianthus e flores pequenas. Camada recortada transparente, com folhas e hastes desenhando espaços entre as linhas. Trata-se de fotografia de campanha gerada, não de uma oferta de produto. Não reaproveitar o arranjo do pôster de referência como se fosse da loja.

## Roteiro técnico implementado

| Tempo | Evento | Amplitude |
| --- | --- | --- |
| 0–1,2 s | Texto entra com opacidade e deslocamento vertical | 16 px; sem ampliar letras |
| 0–1,8 s | Plano floral se assenta no eixo da página | 18 px horizontal, 24 px vertical, rotação de 2° para 0° |
| Após 1,8 s | Respiração lenta do conjunto | ±0,45°, deslocamento vertical máximo 7 px, ciclo alternado 9 s |
| Ao entrar no campo visual | Haste desenha seu percurso por stroke-dashoffset | 1,6 s, uma vez por visita |
| Demais capítulos | Texto se revela ao entrar 12% no campo visual | 18 px e opacidade; 1 s, uma vez |

Nada de vídeo, simulação de carregamento ou tela de espera. Nenhum texto depende da animação para existir. A página segue scroll nativo e não captura roda ou toque. Não há pinning em 100vh nem sequência que trave o visitante para completar um efeito.

## Responsividade do movimento

No desktop, a flor tem largura explícita de 650 px e o H1, 92 px. Essa escala não cresce em 1440/1920. No tablet, a camada floral passa a 560 px. Até 600 px, texto e botões ficam em cima e a flor ocupa uma área inferior de 400 px; o conteúdo não é reduzido como uma imagem única.

Pausa manual no rodapé interrompe a respiração e revela imediatamente os textos. Com prefers-reduced-motion, não há entrada, respiração, desenho progressivo nem scroll suave. A mudança de preferência é acompanhada durante a sessão. Se JavaScript falhar, todo o conteúdo permanece visível.

## Direção para uma eventual evolução

Uma futura separação em pétalas e hastes independentes só deve ser feita com novos recortes aprovados. Não aplicar um movimento distinto ao rosto das pessoas, não deformar fotos reais e não adicionar uma chuva de partículas. O código atual anima um único plano floral e duas hastes SVG; não confundir o roteiro com um vídeo já produzido.
