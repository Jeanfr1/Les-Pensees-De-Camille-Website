# 06 — Revisão e entrega

## Verificação de escala obrigatória

Revisar 375, 768, 1024, 1440 e 1920 px. Em 1024/1440/1920 o H1 permanece 92 px e a flor principal 650 px; a largura do núcleo é 1024 px. O título não pode subir para 174–185 px por uma regra ligada à largura raster do board. Nunca usar viewport dividido por 760 como escala global.

As alturas são de composição e não 100vh. No mobile, checar legibilidade, botão de menu, botões lado a lado ou empilhados, diálogos e horário expandido. Atentar à preservação do rosto e aos controles das capturas nas bordas.

## Revisão funcional em navegador, quando disponível

Verificar todos os links de navegação; abrir e fechar os três aperçus com botão, Escape e clique fora; testar foco por Tab e seu retorno; abrir menu e seguir âncora; abrir detalhes de horários; pausar/retomar movimento; ativar preferência de movimento reduzido. Confirmar que não há layout horizontal transbordando e que o rodapé segue o crescimento de horários.

O ambiente atual não disponibilizou o relay de prévia. Esses testes de navegador permanecem **não verificados**; não foram substituídos por uma captura gerada. As checagens estáticas executadas estão em `docs/QA.md`.

## Empacotamento

Executar `python tools/verificar-kit.py`, corrigir falhas, atualizar os relatórios, gerar MANIFEST.sha256 e conferir todos os hashes. Criar o ZIP com um diretório raiz único, nomes relativos e nenhum caminho absoluto ou arquivo de sessão. Reabrir o ZIP, validar CRC e comparar os bytes de cada entrada com o manifesto. Verificar novamente o arquivo final após disponibilizá-lo.

## Continuidade

Esse kit é local. Para publicar posteriormente, mover a pasta site para o diretório estático esperado pela hospedagem (por exemplo dist), preservar caminhos de assets, registrar o projeto real e configurar seu manifest com a identidade retornada. Não inventar um project_id nem sobrescrever a identidade de outro cliente. Completar a revisão visual e os dados legais antes da publicação comercial.
