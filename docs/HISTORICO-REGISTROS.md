# Histórico de registros — sessão de desenvolvimento com IA

Documento gerado a partir do histórico do chat de desenvolvimento do projeto **Viagem Sistema Solar**.  
Repositório: https://github.com/JorgeRamalho/Astronavesistemasolar

Data de referência da sessão: **22/06/2026**

---

## Resumo executivo

A sessão concentrou-se em:

1. Experiência **mobile** na viagem espacial e nos desafios.
2. Ajustes de **UI/UX** (títulos, enquadramento, botões).
3. Evolução do **modo exploração** com fichas técnicas.
4. **Tripulação narradora** com voz (Alexis e Caroll).
5. **Publicação web** com link online, rede local e acesso dedicado.
6. Refinamento do **modo exploração** — fichas no mapa animado, hover em órbita.
7. **Tripulação voice-only** — narração por voz sem HUD visual.
8. **Reorganização do menu** — galeria “Conheça os Planetas” dentro do Sistema Solar.
9. **Selo Novo Game** no card Viagem Espacial da tela inicial.

---

## Registro por solicitação

### 1. Scroll automático para controles no mobile

**Pedido:** Ao clicar em "Iniciar Desafio", rolar até os controles touch (subir ou descer conforme necessário).

**Alterações:**
- `js/games.js` — função `scrollParaControlesMobile()`, chamada ao final de `jogar()`.
- `js/main.js` — em mobile, não força scroll ao topo em `entrarModoDesafio()`.
- `css/style.css` — `scroll-margin-bottom` nos controles para não ficarem atrás do rodapé.

**Commit relacionado em `main`:** `0bc8b9d`, `1838da5`

---

### 2. Scroll também em "Tentar novamente"

**Pedido:** Incluir "Tentar novamente" no scroll inteligente com margem extra no rodapé.

**Alterações:**
- `js/games.js` — mesma função `scrollParaControlesMobile()` reutilizada no fluxo de reinício.

**Commit relacionado em `main`:** `0bc8b9d`

---

### 3. Link para teste em outro dispositivo

**Pedido:** Link acessível na mesma rede Wi‑Fi.

**Alterações:**
- `serve.js` — servidor HTTP na porta 8765 com API `/api/rede-info`.
- `rede.html` — página com link e QR Code.
- `js/rede-teste.js` — descoberta de IP e geração de links.
- `start-teste.bat` — atalho para subir o servidor no Windows.

**Commit relacionado em `main`:** `1838da5`

---

### 4. Títulos no mobile — remover duplicata fora do fieldset

**Pedido:** Remover título redundante fora do fieldset; manter indicação abaixo de "Informações do planeta".

**Alterações:**
- `js/games.js`, `js/main.js`, `css/style.css` — estrutura do título do desafio no mobile.

**Commit relacionado em `main`:** `0bc8b9d`

---

### 5. Enquadramento da tela de desafio no mobile

**Pedido:** Melhorar enquadramento visual da área de jogo.

**Alterações:**
- `css/style.css` — card único `desafio-tela-jogo`, padding e altura ajustados.

**Commit relacionado em `main`:** `0bc8b9d`

---

### 6. Remover título "Desvie de Meteoros" abaixo de Informações do planeta

**Pedido:** Excluir título duplicado nessa posição.

**Alterações:**
- `js/games.js`, `css/style.css` — remoção/ocultação do elemento redundante.

**Commit relacionado em `main`:** `0bc8b9d`

---

### 7. Título do desafio na cor amarela padrão

**Pedido:** `desafio-jogo-titulo` na cor `#FDB813`.

**Alterações:**
- `css/style.css` — cor amarela no título visível do desafio.

**Commit relacionado em `main`:** `0bc8b9d`

---

### 8. Desfazer última alteração (reversão pontual)

**Pedido:** Reverter mudança imediatamente anterior.

**Alterações:** Ajuste temporário revertido na mesma sessão; estado final consolidado no commit `0bc8b9d`.

---

### 9. Botões "Voltar ao mapa" centralizados e menores

**Pedido:** Padronizar botões de retorno ao mapa.

**Alterações:**
- `js/main.js` — classe `btn-voltar-mapa` no rodapé do planeta.
- `css/style.css` — centralização e tamanho reduzido.

**Commit relacionado em `main`:** `0bc8b9d`

---

### 10. "Continuar Jornada" acima de "Viagem Espacial"

**Pedido:** Reordenar botões no menu inicial.

**Alterações:**
- `js/main.js` — ordem dos elementos em `criarTelaInicial()`.

**Commit relacionado em `main`:** `0bc8b9d`

---

### 11. Modo Exploração — "Voltar ao Menu" no footer

**Pedido:** Botão de retorno no rodapé da página de exploração.

**Alterações:**
- `js/main.js` — `planeta-rodape` no modo exploração.
- `css/style.css` — estilos do rodapé.

**Commit relacionado em `main`:** `0bc8b9d`

---

### 12. Fichas técnicas no modo Exploração

**Pedido:** Catálogo com dados de Sol, planetas e Lua.

**Alterações:**
- `js/main.js` — `criarCatalogoExploracao()` e painel de ficha + curiosidades.

**Commit relacionado em `main`:** `0bc8b9d`

---

### 13. Seta "←" nos botões "Voltar ao Menu"

**Pedido:** Centralizar e alinhar a seta com o ícone do botão.

**Alterações:**
- `css/style.css` — `justify-content: center`, correção do hover em `::before`.

**Commit relacionado em `main`:** `0bc8b9d`

---

### 14. Tripulação narradora (voz + interatividade)

**Pedido:** Dois tripulantes da astronave como narradores.

**Alterações:**
- `js/tripulantes.js` — **novo** — diálogos por contexto.
- `js/audio.js` — módulo `TripulacaoNaracao` com HUD e síntese de voz.
- `js/main.js` — integração em menu, rota, planeta, desafio e finale.
- `index.html` — inclusão de `tripulantes.js`.
- `css/style.css` — HUD da tripulação.

**Commit relacionado em `main`:** `0bc8b9d`

---

### 15. Voz masculina — Comandante Alexis

**Pedido:** Narrador masculino com perfil de comandante.

**Alterações:**
- `js/audio.js` — seleção de voz com `pitch: 0.82` para Alexis.

**Commit relacionado em `main`:** `0bc8b9d`

---

### 16. Narradora renomeada para Caroll

**Pedido:** Alterar nome da navegadora.

**Alterações:**
- `js/tripulantes.js` — identificador e textos atualizados para **Caroll**.

**Commit relacionado em `main`:** `0bc8b9d`

---

### 17. Acesso via link na web

**Pedido:** Link público para abrir o site.

**Alterações:**
- `js/rede-teste.js` — `SITE_ONLINE_URL` e `obterLinkOnline()`.
- `js/main.js` — seção "Compartilhar Jogo" e link no menu.

**Commit relacionado em `main`:** `1838da5`, `0bc8b9d`

---

### 18. Link reservado de acesso dedicado

**Pedido:** Portal exclusivo para entrada no jogo.

**Alterações:**
- `acesso.html` — **novo** — QR Code, copiar link e "Entrar na missão".
- `js/rede-teste.js` — `obterLinkDedicado()`, `obterLinkJogoDedicado()`.
- `js/main.js` — link dedicado no menu e em Compartilhar Jogo.
- `css/style.css` — estilos `.rede-link-box-dedicado`, `.link-site-dedicado`.

**Commit relacionado em `main`:** `66bcc29`

---

### 19. Correção — acesso dedicado não abria

**Pedido:** Link não funcionava em alguns dispositivos.

**Causa:** URLs geradas com barra dupla (`//acesso.html`) por erro em `pathname.replace()`.

**Alterações:**
- `js/rede-teste.js` — `obterBasePath()` e URLs absolutas corretas.
- `acesso.html` — links absolutos e tratamento de erro no QR Code.
- `js/main.js` — navegação na mesma aba (melhor em mobile).
- `css/style.css` — `z-index` e padding no menu para links clicáveis.

**Commit relacionado em `main`:** `b40fc89`

---

### 20. Fichas técnicas no mapa (sem catálogo abaixo)

**Pedido:** Abrir fichas ao clicar nos corpos celestes do mapa; remover grade de fichas abaixo.

**Alterações:**
- `js/main.js` — removidos `criarCatalogoExploracao()` e seção HTML do catálogo; clique abre painel via `mostrarPainelExploracao()`.
- `css/style.css` — removidos estilos `.exploracao-catalogo*`.

**Commit relacionado em `main`:** `bac3e5f`

---

### 21. Modo Exploração — hover e texto orientativo

**Pedido:** Mapa animado com nomes ocultos até hover/toque; instruções claras no header.

**Alterações:**
- `js/main.js` — textos do card e header atualizados; nomes nos corpos sem rótulo “📋 Ficha”.
- `css/style.css` — `.corpo-nome` oculto por padrão, visível em `:hover` e `.ativo-touch`.

**Commit relacionado em `main`:** `bac3e5f`

---

### 22. Remoção da pausa de órbitas no hover

**Pedido:** Manter animação contínua; não pausar órbitas ao passar o mouse.

**Alterações:**
- `js/main.js` — removida `configurarPausaOrbitasExploracao()`.
- `css/style.css` — removido `.exploracao-wrapper.pausado`.

**Commit relacionado em `main`:** `bac3e5f`

---

### 23. Planetas como links com contra-rotação em órbita

**Pedido:** Interação igual ao Sol durante movimento orbital; Lua clicável separada da Terra.

**Alterações:**
- `js/main.js` — `registrarPlanetaExploracao()` com suporte a teclado, touch e `ignorarCliqueFilho` (Lua).
- `css/style.css` — classes `exploracao-ficha-link`, `exploracao-orbita`, animação `exploracao-contrarrotar`, zoom em `.planeta-arte`.

**Commit relacionado em `main`:** `bac3e5f`

---

### 24. Tripulação — narração só por voz (sem HUD)

**Pedido:** Remover balão, avatares e HUD; manter TTS da Alexis e Caroll.

**Alterações:**
- `js/audio.js` — `TripulacaoNaracao` simplificado: sem `_montarHUD` completo, sem balão nem interação por avatar.
- `css/style.css` — removidos estilos `.tripulantes-hud*`, `.trip-balao`, `.trip-texto`.

**Commit relacionado em `main`:** `ee263c0`

---

### 25. Botão de narração no container de som

**Pedido:** Controle 🗣️ ao lado do botão de música ambiente.

**Alterações:**
- `index.html` — `#trip-toggle-narracao` em `#btn-som-container`.
- `js/audio.js` — toggle vinculado ao botão fixo da página.
- `css/style.css` — estilo `.btn-narracao`.

**Commit relacionado em `main`:** `ee263c0`

---

### 26. Galeria integrada ao modo Sistema Solar

**Pedido:** Retirar “Conheça os Planetas” da tela inicial e colocar dentro do Sistema Solar.

**Alterações:**
- `js/main.js` — removido card `data-modo="galeria"` do menu; seção `.exploracao-galeria` abaixo do mapa; `criarModoGaleria()` substituída por `montarGaleriaPlanetas()`.
- `css/style.css` — estilos `.exploracao-galeria`; ajuste de layout do mapa (`flex: 0 0 auto`).

**Commit relacionado em `main`:** `8a7a41b`

---

### 27. Selo “Novo Game” em Viagem Espacial

**Pedido:** Adicionar título/destaque “Novo Game” no botão Viagem Espacial da tela principal.

**Alterações:**
- `js/main.js` — `<span class="modo-card-novo">Novo Game</span>` no card da aventura.
- `css/style.css` — estilo `.modo-card-novo` (selo amarelo/laranja).

**Commit relacionado em `main`:** `c13cfc5`

---

## Arquivos criados na sessão

| Arquivo | Função |
|---------|--------|
| `js/tripulantes.js` | Diálogos da tripulação |
| `acesso.html` | Portal de acesso dedicado |
| `docs/HISTORICO-REGISTROS.md` | Este documento |
| `docs/BRANCHES.md` | Estratégia de branches |
| `README.md` | Apresentação do repositório |

## Arquivos removidos em commits anteriores (pré-sessão)

| Arquivo | Motivo |
|---------|--------|
| `js/narrator.js` | Substituído pela tripulação Alexis/Caroll (`7f0dde2`) |

---

## Commits em `main` (rodada de refinamento)

| Hash | Mensagem |
|------|----------|
| `bac3e5f` | `feat(exploracao): fichas interativas no mapa com hover em orbita` |
| `ee263c0` | `refactor(tripulacao): remove HUD visual e mantem narracao por voz` |

## Commits em `main` (reorganização do menu)

| Hash | Mensagem |
|------|----------|
| `8a7a41b` | `refactor(ui): integra galeria ao modo Sistema Solar` |
| `c13cfc5` | `feat(menu): adiciona selo Novo Game em Viagem Espacial` |

---

## Commits desta branch

| Hash | Mensagem |
|------|----------|
| `2c6a942` | `docs: adiciona README e historico profissional de desenvolvimento` |
| `481c3de` | `docs: atualiza hash de referencia no historico de registros` |
| `9a16f91` | `docs: inclui commits recentes de main e desta branch na linha do tempo` |
| `667c654` | `docs: registra refinamento do modo exploracao e tripulacao voice-only` |
| `7b1c33b` | `docs: registra galeria no Sistema Solar e selo Novo Game` |

---

## Referências

- Site: https://jorgeramalho.github.io/Astronavesistemasolar/
- Acesso dedicado: https://jorgeramalho.github.io/Astronavesistemasolar/acesso.html
- Remote: `https://github.com/JorgeRamalho/Astronavesistemasolar.git`
