# Viagem Sistema Solar

Jogo educativo em HTML, CSS e JavaScript sobre o Sistema Solar. O jogador percorre uma rota espacial, enfrenta desafios em cada corpo celeste e explora fichas técnicas dos planetas e da Lua.

## Demo online

| Tipo | URL |
|------|-----|
| Jogo | https://jorgeramalho.github.io/Astronavesistemasolar/ |
| Acesso dedicado | https://jorgeramalho.github.io/Astronavesistemasolar/acesso.html |
| Teste em rede local (QR) | `/rede.html` no servidor local |

## Como executar localmente

```bash
node serve.js
```

Ou execute `start-teste.bat` no Windows. O servidor sobe na porta **8765** e exibe os links para teste na mesma rede Wi‑Fi.

## Estrutura do projeto

```
index.html          Entrada principal do jogo
acesso.html         Portal de acesso dedicado (web)
rede.html           Link e QR Code para teste em outros dispositivos
css/style.css       Estilos e responsividade mobile
js/main.js          Telas, rotas, exploração e integração geral
js/games.js         Mini-jogos e controles touch
js/audio.js         Música ambiente e narração da tripulação
js/tripulantes.js  Diálogos do Comandante Alexis e da Navegadora Caroll
js/rede-teste.js    Links online, rede local e compartilhamento
js/data.js          Dados dos planetas e curiosidades
serve.js            Servidor HTTP local para testes
```

## Branches

| Branch | Finalidade |
|--------|------------|
| `main` | Versão publicada no GitHub Pages |
| `docs/historico-registros` | Documentação do histórico de desenvolvimento e registros da sessão com IA |

Detalhes em [docs/BRANCHES.md](docs/BRANCHES.md) e linha do tempo completa em [docs/HISTORICO-REGISTROS.md](docs/HISTORICO-REGISTROS.md).

## Repositório

https://github.com/JorgeRamalho/Astronavesistemasolar
