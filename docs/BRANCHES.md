# Estratégia de branches

Este repositório segue um fluxo simples, adequado a um projeto estático publicado no GitHub Pages.

## `main`

- Código estável publicado em produção.
- Cada commit representa uma entrega funcional ou correção aplicada ao jogo.
- Deploy automático via GitHub Pages a partir desta branch.

## `docs/historico-registros`

- Documentação do histórico de desenvolvimento.
- Registro das solicitações feitas na sessão de desenvolvimento assistido por IA.
- Mapeamento entre pedidos, arquivos alterados e commits em `main`.
- Não altera o comportamento do jogo; serve como trilha de auditoria e continuidade do projeto.

## Fluxo recomendado

1. Desenvolver e validar alterações a partir de `main`.
2. Fazer commits pequenos e descritivos em português ou inglês técnico, focando no *porquê*.
3. Publicar com `git push origin main` quando a versão estiver pronta para o site.
4. Atualizar `docs/historico-registros` quando houver nova rodada documentada de mudanças.

## Linha do tempo de commits em `main`

| Commit | Descrição resumida |
|--------|-------------------|
| `fbf9067` | Inicialização do jogo educativo |
| `7f0dde2` | Remoção do narrador Capitão Cosmos |
| `614803d` | Mini-jogos em estilo arcade com canvas |
| `677565e` | Botão "Tentar novamente" ao perder |
| `59aaca8` | Remoção do rover no modo exploração |
| `2b18c14` | Remoção do Sol do centro da exploração |
| `d1ef360` | Rebuild do GitHub Pages |
| `1838da5` | Touch mobile, save e link online |
| `0bc8b9d` | Mobile, tripulação narradora e modo exploração ampliado |
| `66bcc29` | Página e link de acesso dedicado |
| `b40fc89` | Correção de URLs com barras duplicadas no acesso dedicado |
| `b5e4b08` | README do projeto na página do GitHub |
| `bac3e5f` | Fichas interativas no mapa de exploração com hover em órbita |
| `ee263c0` | Tripulação voice-only — narração sem HUD visual |

## Commits em `docs/historico-registros` (documentação)

| Commit | Descrição resumida |
|--------|-------------------|
| `2c6a942` | README, BRANCHES e HISTORICO-REGISTROS |
| `481c3de` | Atualização de referência no histórico |
| `9a16f91` | Linha do tempo com commits recentes de main |
| `667c654` | Registro da rodada de exploração e tripulação voice-only |
