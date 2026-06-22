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

## Commits desta branch

| Hash | Mensagem |
|------|----------|
| `9d26dec` | `docs: adiciona README e historico profissional de desenvolvimento` |

---

## Referências

- Site: https://jorgeramalho.github.io/Astronavesistemasolar/
- Acesso dedicado: https://jorgeramalho.github.io/Astronavesistemasolar/acesso.html
- Remote: `https://github.com/JorgeRamalho/Astronavesistemasolar.git`
