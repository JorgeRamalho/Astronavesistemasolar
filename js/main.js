document.addEventListener('DOMContentLoaded', () => {
  const App = {
    planetaAtual: null,
    estaViajando: false,
    visitados: new Set(),
    modoAtual: 'aventura',
    jornadaOrdem: ['terra', 'lua', 'mercurio', 'venus', 'marte', 'jupiter', 'saturno', 'urano', 'netuno', 'plutao', 'sol'],
    jornadaIndice: 0,
    jornadaCompletos: [],

    obterLabelsFicha() {
      return {
        diametro: 'Diâmetro', massa: 'Massa', temperatura: 'Temperatura',
        idade: 'Idade', tipo: 'Tipo', composicao: 'Composição',
        distanciaSol: 'Distância do Sol', periodoOrbital: 'Período Orbital',
        distanciaTerra: 'Distância da Terra', descoberta: 'Descoberta'
      };
    },

    init() {
      Jogos.init();
      RedeTeste.init();
      TripulacaoNaracao.init();
      this.carregarProgresso();
      this.criarTelaInicial();
      this.initControlesAudio();
    },

    initControlesAudio() {
      document.getElementById('btn-som').addEventListener('click', () => {
        const ativa = AudioEspaco.alternar();
        document.getElementById('btn-som').textContent = ativa ? '🎵' : '🔇';
      });
      AudioEspaco.init();
    },

    carregarProgresso() {
      try {
        const dados = localStorage.getItem('viagemSolar');
        if (dados) {
          const p = JSON.parse(dados);
          this.jornadaIndice = p.jornadaIndice || 0;
          this.jornadaCompletos = p.jornadaCompletos || [];
        }
      } catch (e) {}
    },

    salvarProgresso() {
      try {
        localStorage.setItem('viagemSolar', JSON.stringify({
          jornadaIndice: this.jornadaIndice,
          jornadaCompletos: this.jornadaCompletos
        }));
      } catch (e) {}
    },

    criarEstrelas() {
      const container = document.querySelector('.estrelas-bg');
      if (!container) return;
      container.innerHTML = '';
      for (let i = 0; i < 150; i++) {
        const estrela = document.createElement('div');
        estrela.className = 'estrela';
        estrela.style.left = `${Math.random() * 100}%`;
        estrela.style.top = `${Math.random() * 100}%`;
        estrela.style.width = `${1 + Math.random() * 3}px`;
        estrela.style.height = estrela.style.width;
        estrela.style.animationDelay = `${Math.random() * 3}s`;
        estrela.style.animationDuration = `${2 + Math.random() * 3}s`;
        container.appendChild(estrela);
      }
    },

    transicao(callback) {
      TripulacaoNaracao.parar();
      const overlay = document.getElementById('transition-overlay');
      overlay.classList.add('ativo');
      setTimeout(() => {
        overlay.classList.remove('ativo');
        if (callback) callback();
      }, 800);
    },

    temSaveJornada() {
      try {
        return !!localStorage.getItem('viagemSolar');
      } catch {
        return false;
      }
    },

    temJornadaEmAndamento() {
      return this.temSaveJornada() && this.jornadaIndice < this.jornadaOrdem.length;
    },

    obterResumoProgresso() {
      const total = this.jornadaOrdem.length;
      const concluidas = this.jornadaCompletos.length;
      const idAtual = this.jornadaOrdem[this.jornadaIndice];
      const planetaAtual = planetas.find(p => p.id === idAtual);
      const pct = Math.round((concluidas / total) * 100);

      let situacao;
      if (concluidas === 0) {
        situacao = `Viagem em andamento — parada atual: ${planetaAtual?.nome || 'Terra'} (1ª fase)`;
      } else if (this.jornadaIndice >= total) {
        situacao = 'Viagem completa — todo o Sistema Solar explorado';
      } else {
        situacao = `${concluidas} de ${total} paradas concluídas — parada atual: ${planetaAtual?.nome || '—'}`;
      }

      return { concluidas, total, pct, planetaAtual: planetaAtual?.nome || 'Terra', situacao };
    },

    mostrarConfirmacaoSobrescrita(onConfirm) {
      const resumo = this.obterResumoProgresso();
      const existente = document.getElementById('modal-sobrescrever');
      if (existente) existente.remove();

      const modal = document.createElement('div');
      modal.id = 'modal-sobrescrever';
      modal.className = 'modal-sobrescrever';
      modal.innerHTML = `
        <div class="modal-sobrescrever-fundo" id="modal-sobrescrever-fundo"></div>
        <div class="modal-sobrescrever-caixa" role="alertdialog" aria-labelledby="modal-sobrescrever-titulo">
          <div class="modal-sobrescrever-icone">⚠️</div>
          <h2 id="modal-sobrescrever-titulo">Sobrescrever save da viagem?</h2>
          <p class="modal-sobrescrever-destaque">
            Tem certeza? O progresso salvo será <strong>apagado permanentemente</strong> e não poderá ser recuperado.
          </p>
          <div class="modal-sobrescrever-progresso">
            <div class="modal-sobrescrever-progresso-barra">
              <div class="modal-sobrescrever-progresso-preenchimento" style="width:${resumo.pct}%"></div>
            </div>
            <p class="modal-sobrescrever-situacao">${resumo.situacao}</p>
          </div>
          <p class="modal-sobrescrever-nota">Isso vale para qualquer progresso — inclusive se você ainda estiver na Terra.</p>
          <div class="modal-sobrescrever-botoes">
            <button type="button" class="btn-modal-cancelar" id="modal-sobrescrever-cancelar">Cancelar</button>
            <button type="button" class="btn-modal-confirmar" id="modal-sobrescrever-confirmar">Sim, apagar e recomeçar</button>
          </div>
        </div>
      `;
      document.body.appendChild(modal);

      const fechar = () => modal.remove();
      document.getElementById('modal-sobrescrever-fundo')?.addEventListener('click', fechar);
      document.getElementById('modal-sobrescrever-cancelar')?.addEventListener('click', fechar);
      document.getElementById('modal-sobrescrever-confirmar')?.addEventListener('click', () => {
        fechar();
        onConfirm();
      });
    },

    iniciarNovaJornadaConfirmada() {
      this.novaJornada();
      this.modoAtual = 'aventura';
      this.transicao(() => this.criarRotaAventura());
    },

    novaJornada() {
      this.jornadaIndice = 0;
      this.jornadaCompletos = [];
      this.salvarProgresso();
    },

    criarTelaInicial() {
      const main = document.getElementById('main-container');
      const temProgresso = this.temJornadaEmAndamento();
      main.innerHTML = `
        <div class="tela-inicial">
          <div class="sol-decorativo">${planetaArte('sol', 160)}</div>
          <div class="lua-decorativa">${planetaArte('lua', 100)}</div>
          <div class="nave-intro">
            <div class="nave-spaceship">🚀</div>
            <h1 class="titulo-jogo">VIAGEM<br>SISTEMA SOLAR</h1>
            <p class="subtitulo-jogo">Uma aventura pelos planetas, o Sol e a Lua</p>
          </div>
          ${temProgresso ? '<button class="btn-continuar" id="btn-continuar">▶ CONTINUAR JORNADA</button>' : ''}
          <div class="modos-menu">
            <div class="modo-card" data-modo="aventura">
              <div class="modo-card-icon">👨‍🚀</div>
              <div class="modo-card-content">
                <h3>Viagem Espacial</h3>
                <p>Inicie uma nova viagem pelo Sistema Solar!</p>
                <span class="modo-card-info">${this.jornadaOrdem.length} paradas</span>
              </div>
            </div>
            <div class="modo-card" data-modo="exploracao">
              <div class="modo-card-icon">🚀</div>
              <div class="modo-card-content">
                <h3>Sistema Solar</h3>
                <p>Modo Exploração - Visite livremente!</p>
                <span class="modo-card-info">Sem regras</span>
              </div>
            </div>
            <div class="modo-card" data-modo="galeria">
              <div class="modo-card-icon">📡</div>
              <div class="modo-card-content">
                <h3>Conheça os Planetas</h3>
                <p>Modo Galeria - Navegue pelas fichas técnicas!</p>
                <span class="modo-card-info">${planetas.length} planetas</span>
              </div>
            </div>
            <div class="modo-card modo-card-rede" data-modo="rede">
              <div class="modo-card-icon">🌐</div>
              <div class="modo-card-content">
                <h3>Compartilhar Jogo</h3>
                <p>Link online e QR Code — acesse de qualquer lugar</p>
                <span class="modo-card-info">Site + rede local</span>
              </div>
            </div>
          </div>
          <a class="link-site-online link-site-dedicado" href="${RedeTeste.obterLinkDedicado()}" rel="noopener noreferrer">
            🔐 Acesso dedicado: ${RedeTeste.obterLinkDedicado().replace(/^https?:\/\//, '')}
          </a>
          <a class="link-site-online link-site-online-alt" href="${RedeTeste.obterLinkOnline()}" rel="noopener noreferrer">
            🌐 Site online: jorgeramalho.github.io/Astronavesistemasolar
          </a>
          <div class="estrelas-bg"></div>
        </div>
      `;

      this.criarEstrelas();

      document.querySelectorAll('.modo-card').forEach(card => {
        card.addEventListener('click', () => {
          const modo = card.dataset.modo;
          this.modoAtual = modo;
          if (modo === 'aventura') {
            this.transicao(() => this.criarTelaNovaJornada());
          } else if (modo === 'exploracao') {
            this.transicao(() => this.criarModoExploracao());
          } else if (modo === 'galeria') {
            this.transicao(() => this.criarModoGaleria());
          } else if (modo === 'rede') {
            this.transicao(() => this.criarTelaTesteRede());
          }
        });
      });

      const btnContinuar = document.getElementById('btn-continuar');
      if (btnContinuar) {
        btnContinuar.addEventListener('click', () => {
          this.modoAtual = 'aventura';
          this.transicao(() => this.criarRotaAventura());
        });
      }

      TripulacaoNaracao.definirContexto('menu');
      if (!sessionStorage.getItem('trip_boas_vindas')) {
        sessionStorage.setItem('trip_boas_vindas', '1');
        setTimeout(() => {
          TripulacaoNaracao.dialogo(TripulantesDialogos.boasVindas());
        }, 700);
      }
    },

    criarTelaNovaJornada() {
      const main = document.getElementById('main-container');
      const temSave = this.temSaveJornada();
      const resumo = this.obterResumoProgresso();
      const paradas = this.jornadaOrdem.map(id => planetas.find(p => p.id === id)).filter(Boolean);

      main.innerHTML = `
        <div class="nova-jornada">
          <div class="voltar-bar">
            <button class="btn-voltar" id="nova-jornada-voltar">Voltar ao Menu</button>
          </div>
          <div class="nova-jornada-header">
            <h2>🚀 Nova Viagem Espacial</h2>
            <p>Embarque numa jornada completa pelo Sistema Solar</p>
          </div>
          ${temSave ? `
            <div class="nova-jornada-alerta" role="alert">
              <strong>⚠️ Atenção — save existente detectado</strong>
              <p>Você já possui uma viagem salva. Ao iniciar uma nova viagem, <strong>todo o progresso atual será sobrescrito</strong>, mesmo que esteja na primeira fase (Terra) ou perto de concluir o jogo.</p>
              <div class="nova-jornada-alerta-resumo">
                <span class="nova-jornada-alerta-barra" style="width:${resumo.pct}%"></span>
                <span>${resumo.situacao}</span>
              </div>
            </div>
          ` : ''}
          <div class="nova-jornada-info">
            <p>Visite <strong>${this.jornadaOrdem.length} paradas</strong>, complete os desafios de cada corpo celeste e chegue ao Sol! Cada fase concluída fica indisponível — avance sempre para a próxima.</p>
          </div>
          <div class="nova-jornada-rota">
            ${paradas.map((p, idx) => `
              <span class="nova-jornada-parada" style="color:${p.cor}">${idx + 1}. ${p.nome}</span>
            `).join('')}
          </div>
          <button class="btn-iniciar${temSave ? ' btn-iniciar-alerta' : ''}" id="btn-iniciar-jornada">
            ${temSave ? '⚠️ Iniciar Nova Viagem (sobrescrever save)' : 'Iniciar Nova Viagem'}
          </button>
        </div>
        <div class="estrelas-bg"></div>
      `;

      this.criarEstrelas();

      document.getElementById('nova-jornada-voltar').addEventListener('click', () => {
        this.transicao(() => this.criarTelaInicial());
      });

      document.getElementById('btn-iniciar-jornada').addEventListener('click', () => {
        if (this.temSaveJornada()) {
          this.mostrarConfirmacaoSobrescrita(() => this.iniciarNovaJornadaConfirmada());
        } else {
          this.iniciarNovaJornadaConfirmada();
        }
      });
    },

    criarRotaAventura() {
      const main = document.getElementById('main-container');
      const destinoIdx = this.jornadaIndice;

      main.innerHTML = `
        <div class="rota-aventura">
          <div class="voltar-bar">
            <button class="btn-voltar" id="rota-voltar-menu">Voltar ao Menu</button>
          </div>
          <div class="rota-header">
            <h2>🚀 ROTA DA AVENTURA</h2>
            <p>Sua jornada pelo Sistema Solar</p>
          </div>
          <div class="rota-progresso">
            <span>Parada ${destinoIdx + 1} de ${this.jornadaOrdem.length}</span>
            <div class="barra-progresso">
              <div class="barra-preenchimento" style="width:${(this.jornadaCompletos.length / this.jornadaOrdem.length) * 100}%"></div>
            </div>
          </div>
          <div class="rota-lista" id="rota-lista"></div>
          <p class="rota-dica">Apenas a fase atual está disponível — clique no planeta destacado</p>
        </div>
        <div class="estrelas-bg"></div>
      `;

      this.criarEstrelas();
      this.criarListaRota();

      document.getElementById('rota-voltar-menu').addEventListener('click', () => {
        this.transicao(() => this.criarTelaInicial());
      });

      const destino = planetas.find(p => p.id === this.jornadaOrdem[this.jornadaIndice]);
      TripulacaoNaracao.definirContexto('rota', destino);
      setTimeout(() => {
        const falas = this.temJornadaEmAndamento() && this.jornadaCompletos.length > 0
          ? TripulantesDialogos.continuarJornada(this.jornadaCompletos.length + 1, this.jornadaOrdem.length)
          : TripulantesDialogos.rotaAventura(destino?.nome);
        TripulacaoNaracao.dialogo(falas, { manterHUD: true });
      }, 500);
    },

    criarTelaTesteRede() {
      RedeTeste.pararPoll();
      const main = document.getElementById('main-container');
      const info = RedeTeste.obterInfoViewport();
      const emArquivo = RedeTeste.estaEmArquivoLocal();
      const linkOnline = RedeTeste.obterLinkOnline();
      const linkDedicado = RedeTeste.obterLinkDedicado();

      main.innerHTML = `
        <div class="tela-teste-rede">
          <div class="voltar-bar">
            <button class="btn-voltar" id="rede-voltar">Voltar ao Menu</button>
          </div>
          <div class="rede-header">
            <span class="rede-header-icon">🌐</span>
            <h2>Compartilhar Jogo</h2>
            <p>Acesse de qualquer lugar ou teste na rede local</p>
          </div>

          <div class="rede-link-box rede-link-box-dedicado">
            <div class="rede-badge-dedicado">ACESSO DEDICADO</div>
            <label class="rede-label">Link reservado — porta de entrada exclusiva</label>
            <div class="rede-link-linha">
              <input type="text" class="rede-link-input rede-link-input-dedicado" id="rede-link-dedicado" readonly value="${linkDedicado}">
              <button type="button" class="btn-rede-copiar btn-rede-copiar-dedicado" id="btn-copiar-dedicado">Copiar</button>
            </div>
            <a class="btn-abrir-online btn-abrir-dedicado" href="${linkDedicado}" rel="noopener noreferrer">Abrir acesso dedicado ↗</a>
            <div class="rede-qr-wrap">
              <div class="rede-qr-placeholder" id="rede-qr-dedicado"></div>
            </div>
            <p class="rede-link-dica" id="rede-status-dedicado">Compartilhe este link reservado para convidados entrarem direto na missão.</p>
          </div>

          <div class="rede-link-box rede-link-box-online">
            <div class="rede-badge-online">SITE ONLINE</div>
            <label class="rede-label">Link público — funciona em qualquer rede</label>
            <div class="rede-link-linha">
              <input type="text" class="rede-link-input rede-link-input-online" id="rede-link-online" readonly value="${linkOnline}">
              <button type="button" class="btn-rede-copiar btn-rede-copiar-online" id="btn-copiar-online">Copiar</button>
            </div>
            <a class="btn-abrir-online" href="${linkOnline}" target="_blank" rel="noopener">Abrir site online ↗</a>
            <div class="rede-qr-wrap">
              <div class="rede-qr-placeholder" id="rede-qr-online"></div>
            </div>
            <p class="rede-link-dica" id="rede-status-online">Escaneie o QR Code ou envie o link para qualquer pessoa.</p>
          </div>

          <details class="rede-local-detalhes"${emArquivo ? ' open' : ''}>
            <summary>Teste na rede local (Wi‑Fi)</summary>
            ${emArquivo ? `
              <div class="rede-alerta rede-alerta-aviso">
                <strong>Servidor local</strong>
                <p>Execute <code>start-teste.bat</code> para gerar link na mesma Wi‑Fi.</p>
              </div>
            ` : ''}
            <div class="rede-link-box" id="rede-link-box">
              <label class="rede-label">Link na mesma Wi‑Fi</label>
              <div class="rede-link-linha">
                <input type="text" class="rede-link-input" id="rede-link-input" readonly placeholder="Aguardando servidor…">
                <button type="button" class="btn-rede-copiar" id="btn-rede-copiar">Copiar</button>
              </div>
              <p class="rede-link-dica" id="rede-link-status">Detectando link na rede…</p>
              <div class="rede-qr-wrap">
                <div class="rede-qr-placeholder" id="rede-qr-placeholder">
                  <span class="rede-qr-loading">⏳ Gerando QR Code…</span>
                </div>
              </div>
              <div class="rede-links-extra" id="rede-links-extra"></div>
            </div>
          </details>

          <div class="rede-viewport-box">
            <h3>Este dispositivo agora</h3>
            <div class="rede-viewport-grid">
              <div class="rede-stat"><span>Breakpoint</span><strong style="color:${info.corBreakpoint}">${info.breakpoint}</strong></div>
              <div class="rede-stat"><span>Resolução</span><strong>${info.largura} × ${info.altura}px</strong></div>
              <div class="rede-stat"><span>Orientação</span><strong>${info.orientacao}</strong></div>
              <div class="rede-stat"><span>DPR</span><strong>${info.dpr}</strong></div>
            </div>
            <button type="button" class="btn-rede-overlay" id="btn-rede-overlay">
              ${RedeTeste.overlayAtivo ? 'Desativar' : 'Ativar'} overlay responsivo
            </button>
          </div>
        </div>
        <div class="estrelas-bg"></div>
      `;

      this.criarEstrelas();

      const qrDedicado = document.getElementById('rede-qr-dedicado');
      if (qrDedicado) RedeTeste.renderizarQrCode(qrDedicado, linkDedicado);

      const qrOnline = document.getElementById('rede-qr-online');
      if (qrOnline) RedeTeste.renderizarQrCode(qrOnline, linkOnline);

      document.getElementById('rede-voltar').addEventListener('click', () => {
        RedeTeste.pararPoll();
        this.transicao(() => this.criarTelaInicial());
      });

      document.getElementById('btn-rede-overlay')?.addEventListener('click', () => {
        RedeTeste.alternarOverlay();
        const btn = document.getElementById('btn-rede-overlay');
        if (btn) btn.textContent = `${RedeTeste.overlayAtivo ? 'Desativar' : 'Ativar'} overlay responsivo`;
      });

      document.getElementById('btn-copiar-dedicado')?.addEventListener('click', async () => {
        const ok = await RedeTeste.copiarTexto(linkDedicado);
        const st = document.getElementById('rede-status-dedicado');
        if (st) st.textContent = ok ? '✅ Link dedicado copiado!' : 'Copie manualmente o link acima.';
      });

      document.getElementById('btn-copiar-online')?.addEventListener('click', async () => {
        const ok = await RedeTeste.copiarTexto(linkOnline);
        const st = document.getElementById('rede-status-online');
        if (st) st.textContent = ok ? '✅ Link online copiado!' : 'Copie manualmente o link acima.';
      });

      document.getElementById('btn-rede-copiar')?.addEventListener('click', () => this.copiarLinkRede());

      this.carregarLinkRede();
      if (!document.getElementById('rede-link-input')?.value) {
        RedeTeste._pollTimer = setInterval(() => this.carregarLinkRede(), 2500);
      }
    },

    async copiarLinkRede() {
      const input = document.getElementById('rede-link-input');
      const status = document.getElementById('rede-link-status');
      if (!input?.value) return;
      const ok = await RedeTeste.copiarTexto(input.value);
      if (status) {
        status.textContent = ok ? '✅ Link copiado! Cole no navegador do celular.' : 'Copie manualmente o link acima.';
        status.style.color = ok ? '#6fcf6f' : '#ff8888';
      }
    },

    async carregarLinkRede() {
      const input = document.getElementById('rede-link-input');
      const status = document.getElementById('rede-link-status');
      const qrBox = document.getElementById('rede-qr-placeholder');
      const extra = document.getElementById('rede-links-extra');
      if (!input) return;

      const resultado = await RedeTeste.gerarLinksCompartilhaveis();

      if (resultado.primary) {
        input.value = resultado.primary;
        if (qrBox) {
          const ok = RedeTeste.renderizarQrCode(qrBox, resultado.primary);
          if (!ok) qrBox.innerHTML = '<span class="rede-qr-erro">QR indisponível</span>';
        }
        if (status) {
          status.textContent = '📱 Escaneie o QR Code ou toque em Copiar e abra no celular.';
          status.style.color = '#8899bb';
        }
        if (extra && resultado.links.length > 1) {
          extra.innerHTML = `
            <p class="rede-label" style="margin-top:16px">Outros endereços:</p>
            ${resultado.links.filter(u => u !== resultado.primary).map(u =>
              `<a class="rede-link-alt" href="${u}" target="_blank" rel="noopener">${u}</a>`
            ).join('')}
          `;
        }
        RedeTeste.pararPoll();
      } else if (status && !input.value) {
        status.textContent = '⏳ Execute start-teste.bat e aguarde…';
      }
    },

    criarListaRota() {
      const lista = document.getElementById('rota-lista');
      if (!lista) return;

      lista.innerHTML = this.jornadaOrdem.map((id, idx) => {
        const p = planetas.find(pl => pl.id === id);
        const passou = idx < this.jornadaIndice;
        const atual = idx === this.jornadaIndice;
        const bloqueada = idx > this.jornadaIndice;

        let classe = 'rota-item';
        let icone, statusTexto;
        if (passou) {
          classe += ' completa indisponivel';
          icone = '✅';
          statusTexto = 'Completo';
        } else if (atual) {
          classe += ' atual';
          icone = '🚀';
          statusTexto = 'Atual';
        } else if (bloqueada) {
          classe += ' bloqueada';
          icone = '🔒';
          statusTexto = 'Bloqueado';
        }

        return `
          <div class="${classe}${this.podeVisitar(id) ? ' clicavel' : ''}" data-planeta="${id}">
            <span class="rota-icone">${icone}</span>
            ${planetaArte(p.id, 32)}
            <span class="rota-nome" style="color:${p.cor}">${p.nome}</span>
            <span class="rota-status">${statusTexto}</span>
          </div>
        `;
      }).join('');

      lista.querySelectorAll('.rota-item.clicavel').forEach(el => {
        el.addEventListener('click', () => {
          const id = el.dataset.planeta;
          if (id && this.podeVisitar(id)) this.visitarPlaneta(id);
        });
      });
    },

    criarModoExploracao() {
      const main = document.getElementById('main-container');

      main.innerHTML = `
        <div class="exploracao-modo">
          <div class="mapa-sistema" id="mapa-sistema">
            <div class="mapa-header">
              <h2>🚀 MODO EXPLORAÇÃO</h2>
              <p>Explore o mapa ou toque nas fichas abaixo para ver dados de cada corpo celeste!</p>
            </div>
            <div class="exploracao-wrapper" id="exploracao-wrapper">
              <div class="orbita-container" id="orbita-container"></div>
            </div>
            <section class="exploracao-catalogo" id="exploracao-catalogo" aria-label="Fichas técnicas">
              <h3 class="exploracao-catalogo-titulo">📋 Fichas Técnicas</h3>
              <p class="exploracao-catalogo-sub">Sol, planetas e Lua — toque para ver informações completas</p>
              <div class="exploracao-catalogo-grade" id="exploracao-catalogo-grade"></div>
            </section>
            <div class="exploracao-painel" id="exploracao-painel"></div>
          </div>
          <footer class="planeta-rodape">
            <button class="btn-voltar" id="explorar-voltar">Voltar ao Menu</button>
          </footer>
        </div>
        <div class="estrelas-bg"></div>
      `;

      this.criarEstrelas();
      this.criarOrbitasExploracao();
      this.criarCatalogoExploracao();

      document.getElementById('explorar-voltar').addEventListener('click', () => {
        this.transicao(() => this.criarTelaInicial());
      });

      TripulacaoNaracao.definirContexto('exploracao');
      setTimeout(() => {
        TripulacaoNaracao.dialogo(TripulantesDialogos.exploracao(), { manterHUD: true });
      }, 500);
    },

    criarOrbitasExploracao() {
      const container = document.getElementById('orbita-container');
      if (!container) return;
      container.innerHTML = '';

      const isMobile = window.innerWidth <= 768;
      const escala = isMobile ? 0.6 : 1.0;

      const ordemMapa = ['mercurio','venus','terra','marte','jupiter','saturno','urano','netuno','plutao'];
      const tamanhos = {
        mercurio: isMobile ? 20 : 24, venus: isMobile ? 26 : 30,
        terra: isMobile ? 28 : 32, marte: isMobile ? 22 : 26,
        jupiter: isMobile ? 40 : 48, saturno: isMobile ? 36 : 42,
        urano: isMobile ? 26 : 30, netuno: isMobile ? 26 : 30, plutao: isMobile ? 18 : 22
      };

      const orbitas = {
        mercurio: { raio: Math.round(95 * escala), duracao: 14 },
        venus:    { raio: Math.round(130 * escala), duracao: 20 },
        terra:    { raio: Math.round(165 * escala), duracao: 28 },
        marte:    { raio: Math.round(195 * escala), duracao: 35 },
        jupiter:  { raio: Math.round(230 * escala), duracao: 48 },
        saturno:  { raio: Math.round(260 * escala), duracao: 62 },
        urano:    { raio: Math.round(290 * escala), duracao: 82 },
        netuno:   { raio: Math.round(320 * escala), duracao: 102 },
        plutao:   { raio: Math.round(350 * escala), duracao: 135 }
      };

      const angulosIniciais = {
        mercurio: 50, venus: 120, terra: 200, marte: 80,
        jupiter: 300, saturno: 140, urano: 220, netuno: 10, plutao: 340
      };

      const tamanhosSol = isMobile ? 50 : 70;

      const solWrapper = document.createElement('div');
      solWrapper.className = 'planeta-wrapper';
      solWrapper.style.cssText = `position:absolute;top:50%;left:50%;width:0;height:0;transform:translate(-50%,-50%);z-index:10;`;

      const solEl = document.createElement('div');
      solEl.className = 'corpo-celeste planeta sol planeta-link';
      solEl.dataset.planeta = 'sol';
      solEl.style.cssText = `position:absolute;top:50%;left:50%;width:${tamanhosSol}px;height:${tamanhosSol}px;cursor:pointer;`;
      solEl.innerHTML = `${planetaArte('sol', tamanhosSol)}<span class="corpo-nome">Sol</span>`;
      solEl.addEventListener('click', (e) => {
        e.stopPropagation();
        this.mostrarPainelExploracao('sol');
      });
      solWrapper.appendChild(solEl);
      container.appendChild(solWrapper);

      ordemMapa.forEach(id => {
        const p = planetas.find(pl => pl.id === id);
        if (!p) return;
        const orb = orbitas[id];
        const orbita = document.createElement('div');
        orbita.className = 'orbita';
        orbita.style.width = `${orb.raio * 2}px`;
        orbita.style.height = `${orb.raio * 2}px`;
        orbita.style.animationDuration = `${orb.duracao}s`;
        orbita.style.top = `calc(50% - ${orb.raio}px)`;
        orbita.style.left = `calc(50% - ${orb.raio}px)`;

        const rad = (angulosIniciais[id] * Math.PI) / 180;
        const planetaWrapper = document.createElement('div');
        planetaWrapper.className = 'planeta-wrapper';
        planetaWrapper.style.cssText = `position:absolute;top:50%;left:50%;width:0;height:0;transform:translate(${Math.cos(rad) * orb.raio}px,${Math.sin(rad) * orb.raio}px);`;

        const planetaEl = document.createElement('div');
        planetaEl.className = 'corpo-celeste planeta planeta-link';
        planetaEl.dataset.planeta = id;
        planetaEl.style.cssText = `position:absolute;top:50%;left:50%;width:${tamanhos[id]}px;height:${tamanhos[id]}px;`;

        let html = planetaArte(id, tamanhos[id]);
        if (id === 'terra') {
          html += `<div class="lua-companhia" data-planeta="lua" role="button" tabindex="0" aria-label="Lua">${planetaArte('lua', 16)}</div>`;
        }
        html += `<span class="corpo-nome">${p.nome}</span>`;
        planetaEl.innerHTML = html;

        planetaEl.addEventListener('click', (e) => {
          e.stopPropagation();
          if (e.target.closest('[data-planeta="lua"]')) {
            this.mostrarPainelExploracao('lua');
            return;
          }
          this.mostrarPainelExploracao(id);
        });

        const luaEl = planetaEl.querySelector('.lua-companhia');
        if (luaEl) {
          const abrirLua = (e) => {
            e.stopPropagation();
            e.preventDefault();
            this.mostrarPainelExploracao('lua');
          };
          luaEl.addEventListener('click', abrirLua);
          luaEl.addEventListener('touchend', abrirLua);
        }

        planetaWrapper.appendChild(planetaEl);
        orbita.appendChild(planetaWrapper);
        container.appendChild(orbita);
      });
    },

    criarCatalogoExploracao() {
      const grade = document.getElementById('exploracao-catalogo-grade');
      if (!grade) return;

      const ordem = ['sol', 'mercurio', 'venus', 'terra', 'lua', 'marte', 'jupiter', 'saturno', 'urano', 'netuno', 'plutao'];
      const tamanhos = { sol: 40, mercurio: 28, venus: 30, terra: 30, lua: 26, marte: 28, jupiter: 36, saturno: 34, urano: 30, netuno: 30, plutao: 26 };

      ordem.forEach(id => {
        const p = planetas.find(pl => pl.id === id);
        if (!p) return;

        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'exploracao-catalogo-item';
        btn.style.borderColor = p.cor;
        btn.innerHTML = `
          ${planetaArte(id, tamanhos[id] || 28)}
          <span class="exploracao-catalogo-nome" style="color:${p.cor}">${p.nome}</span>
          <span class="exploracao-catalogo-tipo">${p.tipo}</span>
        `;
        btn.addEventListener('click', () => this.mostrarPainelExploracao(id));
        grade.appendChild(btn);
      });
    },

    mostrarPainelExploracao(id) {
      const p = planetas.find(pl => pl.id === id);
      if (!p) return;
      const painel = document.getElementById('exploracao-painel');
      if (!painel) return;

      TripulacaoNaracao.definirContexto('exploracao', p);

      const labels = this.obterLabelsFicha();

      painel.innerHTML = `
        <div class="exploracao-painel-overlay" id="exploracao-painel-fechar"></div>
        <div class="exploracao-painel-conteudo" style="border-color: ${p.cor}">
          <button class="btn-voltar btn-voltar--icone" id="exploracao-painel-fechar-btn" aria-label="Fechar">✕</button>
          <div class="exploracao-painel-topo" style="background: radial-gradient(circle at center, ${p.cor}22 0%, transparent 70%)">
            ${planetaArte(p.id, 80)}
            <h2 style="color:${p.cor}">${p.nome}</h2>
            <span class="painel-tipo">${p.tipo}</span>
          </div>
          <div class="painel-abas">
            <button class="painel-aba ativa" data-paba="ficha">📋 Ficha Técnica</button>
            <button class="painel-aba" data-paba="curiosidades">💡 Curiosidades</button>
          </div>
          <div class="painel-corpo">
            <div class="painel-aba-conteudo ativa" id="paba-ficha">
              <div class="painel-ficha">
                ${Object.entries(p.ficha).map(([key, val]) => `
                  <div class="painel-ficha-item">
                    <span class="painel-ficha-label">${labels[key] || key}</span>
                    <span class="painel-ficha-valor">${val}</span>
                  </div>
                `).join('')}
              </div>
            </div>
            <div class="painel-aba-conteudo" id="paba-curiosidades">
              <ul class="painel-curiosidades">
                ${p.curiosidades.map(c => `<li class="painel-curiosidade-item">💫 ${c}</li>`).join('')}
              </ul>
            </div>
          </div>
        </div>
      `;
      painel.classList.add('ativo');

      document.getElementById('exploracao-painel-fechar').addEventListener('click', () => this.fecharPainelExploracao());
      document.getElementById('exploracao-painel-fechar-btn').addEventListener('click', () => this.fecharPainelExploracao());

      document.querySelectorAll('.painel-aba').forEach(btn => {
        btn.addEventListener('click', () => {
          document.querySelectorAll('.painel-aba').forEach(b => b.classList.remove('ativa'));
          btn.classList.add('ativa');
          document.querySelectorAll('.painel-aba-conteudo').forEach(c => c.classList.remove('ativa'));
          const aba = document.getElementById(`paba-${btn.dataset.paba}`);
          if (aba) aba.classList.add('ativa');
        });
      });
    },

    fecharPainelExploracao() {
      const painel = document.getElementById('exploracao-painel');
      if (painel) painel.classList.remove('ativo');
    },

    criarModoGaleria() {
      const main = document.getElementById('main-container');
      const labels = {
        diametro: 'Diâmetro', massa: 'Massa', temperatura: 'Temperatura',
        idade: 'Idade', tipo: 'Tipo', composicao: 'Composição',
        distanciaSol: 'Distância do Sol', periodoOrbital: 'Período Orbital',
        distanciaTerra: 'Distância da Terra', descoberta: 'Descoberta'
      };

      main.innerHTML = `
        <div class="galeria-modo" id="galeria-modo">
          <div class="voltar-bar">
            <button class="btn-voltar" id="galeria-voltar">Voltar ao Menu</button>
          </div>
          <div class="galeria-header">
            <h2>📡 GALERIA DO SISTEMA SOLAR</h2>
            <p>Navegue pelas fichas técnicas de todos os corpos celestes</p>
          </div>
          <div class="galeria-grade" id="galeria-grade"></div>
          <div class="galeria-painel" id="galeria-painel"></div>
        </div>
        <div class="estrelas-bg"></div>
      `;

      this.criarEstrelas();
      const grade = document.getElementById('galeria-grade');

      const ordemGaleria = ['sol','mercurio','venus','terra','lua','marte','jupiter','saturno','urano','netuno','plutao'];
      const tamanhos = { sol: 72, mercurio: 26, venus: 32, terra: 32, lua: 24, marte: 26, jupiter: 44, saturno: 38, urano: 32, netuno: 32, plutao: 24 };

      ordemGaleria.forEach(id => {
        const p = planetas.find(pl => pl.id === id);
        if (!p) return;
        const card = document.createElement('div');
        card.className = 'galeria-card';
        card.style.borderColor = p.cor;

        let arteHtml = planetaArte(id, tamanhos[id]);
        if (id === 'terra') {
          arteHtml = `<div class="terra-com-lua">${planetaArte('terra', tamanhos.terra)}<div class="lua-orbita">${planetaArte('lua', 16)}</div></div>`;
        }
        card.innerHTML = `
          ${arteHtml}
          <h3 style="color:${p.cor}">${p.nome}</h3>
          <span class="galeria-tipo">${p.tipo}</span>
          <div class="galeria-mini-ficha">
            ${p.ficha.diametro ? `<span>📏 ${p.ficha.diametro}</span>` : ''}
            ${p.ficha.temperatura ? `<span>🌡️ ${p.ficha.temperatura}</span>` : ''}
            ${p.ficha.distanciaSol || p.ficha.distanciaTerra ? `<span>📍 ${p.ficha.distanciaSol || p.ficha.distanciaTerra}</span>` : ''}
          </div>
        `;
        card.addEventListener('click', (e) => {
          if (id === 'terra' && e.target.closest('.lua-orbita')) {
            const luaData = planetas.find(pl => pl.id === 'lua');
            if (luaData) this.mostrarFichaPainel(luaData, labels, tamanhos);
            return;
          }
          this.mostrarFichaPainel(p, labels, tamanhos);
        });
        grade.appendChild(card);
      });

      document.getElementById('galeria-voltar').addEventListener('click', () => {
        this.transicao(() => this.criarTelaInicial());
      });

    },

    mostrarFichaPainel(p, labels, tamanhos) {
      const painel = document.getElementById('galeria-painel');
      if (!painel) return;
      const tam = tamanhos[p.id] || 60;
      painel.innerHTML = `
        <div class="painel-overlay" id="painel-fechar"></div>
        <div class="painel-conteudo">
          <button class="btn-voltar btn-voltar--icone" id="painel-fechar-btn" aria-label="Fechar">✕</button>
          <div class="painel-topo" style="background: radial-gradient(circle at center, ${p.cor}22 0%, transparent 70%)">
            ${planetaArte(p.id, tam + 20)}
            <h2 style="color:${p.cor}">${p.nome}</h2>
            <span class="painel-tipo">${p.tipo}</span>
          </div>
          <div class="painel-abas">
            <button class="painel-aba ativa" data-paba="ficha">📋 Ficha Técnica</button>
            <button class="painel-aba" data-paba="curiosidades">💡 Curiosidades</button>
          </div>
          <div class="painel-corpo">
            <div class="painel-aba-conteudo ativa" id="paba-ficha">
              <div class="painel-ficha">
                ${Object.entries(p.ficha).map(([key, val]) => `
                  <div class="painel-ficha-item">
                    <span class="painel-ficha-label">${labels[key] || key}</span>
                    <span class="painel-ficha-valor">${val}</span>
                  </div>
                `).join('')}
              </div>
            </div>
            <div class="painel-aba-conteudo" id="paba-curiosidades">
              <ul class="painel-curiosidades">
                ${p.curiosidades.map(c => `<li class="painel-curiosidade-item">💫 ${c}</li>`).join('')}
              </ul>
            </div>
          </div>
        </div>
      `;
      painel.classList.add('ativo');

      document.getElementById('painel-fechar').addEventListener('click', () => this.fecharPainel());
      document.getElementById('painel-fechar-btn').addEventListener('click', () => this.fecharPainel());

      document.querySelectorAll('.painel-aba').forEach(btn => {
        btn.addEventListener('click', () => {
          document.querySelectorAll('.painel-aba').forEach(b => b.classList.remove('ativa'));
          btn.classList.add('ativa');
          document.querySelectorAll('.painel-aba-conteudo').forEach(c => c.classList.remove('ativa'));
          const aba = document.getElementById(`paba-${btn.dataset.paba}`);
          if (aba) aba.classList.add('ativa');
        });
      });
    },

    fecharPainel() {
      const painel = document.getElementById('galeria-painel');
      if (painel) painel.classList.remove('ativo');
    },

    podeVisitar(id) {
      if (this.jornadaIndice >= this.jornadaOrdem.length) return false;
      return id === this.jornadaOrdem[this.jornadaIndice];
    },

    visitarPlaneta(id) {
      if (this.estaViajando) return;
      if (this.modoAtual === 'aventura' && !this.podeVisitar(id)) return;
      const planeta = planetas.find(p => p.id === id);
      if (!planeta) return;

      this.planetaAtual = id;
      this.estaViajando = true;

      this.transicao(() => {
        this.mostrarPlaneta(planeta);
        this.estaViajando = false;
      });
    },

    mostrarPlaneta(planeta) {
      this.visitados.add(planeta.id);
      const main = document.getElementById('main-container');
      const idxRota = this.jornadaOrdem.indexOf(planeta.id);
      const eODestinoAtual = idxRota === this.jornadaIndice;
      const jaCompleto = this.jornadaCompletos.includes(planeta.id);

      main.innerHTML = `
        <div class="planeta-visao ${planeta.id === 'lua' ? 'lua-ambiente' : ''}" id="planeta-visao">
          <div class="planeta-destaque" style="background: radial-gradient(circle at center, ${planeta.cor}33 0%, transparent 70%)">
            ${jaCompleto
              ? '<p class="aventura-indicador aventura-indicador--completo">✅ Missão cumprida!</p>'
              : (eODestinoAtual ? '<p class="aventura-indicador">Destino atual — complete o desafio</p>' : '')}
            ${planetaArte(planeta.id, 100)}
            <h2 class="planeta-nome" style="color: ${planeta.cor}">${planeta.nome}</h2>
            <span class="planeta-tipo">${planeta.tipo}</span>
          </div>

          <div class="planeta-conteudo">
            <div class="desafio-destaque-wrap">
              <button type="button" class="btn-desafio-principal aba-btn${jaCompleto ? ' concluido' : ''}${eODestinoAtual && !jaCompleto ? ' pulsar' : ''}" data-aba="desafio">
                ${jaCompleto ? '✅ Desafio concluído' : '🎮 Iniciar Desafio'}
              </button>
              ${planeta.desafio ? `<p class="desafio-destaque-sub">${planeta.desafio.nome}</p>` : ''}
            </div>

            <div class="planeta-abas planeta-abas-secundarias">
              <button class="aba-btn ativa" data-aba="ficha">📋 Ficha Técnica</button>
              <button class="aba-btn" data-aba="curiosidades">💡 Curiosidades</button>
            </div>

            <div class="aba-conteudo ativa" id="aba-ficha">
              <div class="ficha-tecnica">
                ${Object.entries(planeta.ficha).map(([key, val]) => {
                  const labels = {
                    diametro: 'Diâmetro', massa: 'Massa', temperatura: 'Temperatura',
                    idade: 'Idade', tipo: 'Tipo', composicao: 'Composição',
                    distanciaSol: 'Distância do Sol', periodoOrbital: 'Período Orbital',
                    distanciaTerra: 'Distância da Terra'
                  };
                  return `<div class="ficha-item"><span class="ficha-label">${labels[key] || key}</span><span class="ficha-valor">${val}</span></div>`;
                }).join('')}
              </div>
            </div>

            <div class="aba-conteudo" id="aba-curiosidades">
              <ul class="curiosidades-lista">
                ${planeta.curiosidades.map(c => `<li class="curiosidade-item">💫 ${c}</li>`).join('')}
              </ul>
            </div>

            <div class="aba-conteudo" id="aba-desafio">
              <div class="desafio-tela-jogo">
                <div class="desafio-jogo-topo">
                  <button type="button" class="btn-voltar-info" id="btn-voltar-info-planeta">← Informações do planeta</button>
                  <h3 class="desafio-jogo-titulo">🎮 ${planeta.desafio?.nome || 'Desafio'}</h3>
                </div>
                <div class="desafio-area" id="desafio-area"></div>
              </div>
            </div>
          </div>

          <footer class="planeta-rodape">
            <button class="btn-voltar btn-voltar-mapa" id="btn-voltar-mapa">Voltar ao Mapa</button>
          </footer>
        </div>
        <div class="estrelas-bg"></div>
      `;

      this.criarEstrelas();
      this.configurarAbaNavegacao(planeta, eODestinoAtual, jaCompleto);

      TripulacaoNaracao.definirContexto('planeta', planeta);
      TripulacaoNaracao.modoCompacto(false);
      setTimeout(() => {
        TripulacaoNaracao.dialogo(TripulantesDialogos.chegada(planeta), { manterHUD: true });
      }, 450);
    },

    configurarAbaNavegacao(planeta, eDestinoAtual, jaCompleto) {
      const btns = document.querySelectorAll('.aba-btn');
      const visao = document.getElementById('planeta-visao');
      let desafioCarregado = false;

      const ativarAba = (abaId) => {
        btns.forEach(b => b.classList.remove('ativa'));
        document.querySelectorAll('.aba-conteudo').forEach(c => c.classList.remove('ativa'));
        const btn = document.querySelector(`.aba-btn[data-aba="${abaId}"]`);
        const aba = document.getElementById(`aba-${abaId}`);
        if (btn) btn.classList.add('ativa');
        if (aba) aba.classList.add('ativa');
      };

      const entrarModoDesafio = () => {
        visao?.classList.add('planeta-visao--jogo');
        if (!Jogos.usarControlesTouch()) {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      };

      const sairModoDesafio = () => {
        visao?.classList.remove('planeta-visao--jogo');
        TripulacaoNaracao.modoCompacto(false);
        Jogos.pararJogo();
        Jogos.setCallback(null);
        desafioCarregado = false;
        ativarAba('ficha');
      };

      const iniciarTelaDesafio = () => {
        ativarAba('desafio');
        entrarModoDesafio();
        TripulacaoNaracao.modoCompacto(true);
        const area = document.getElementById('desafio-area');
        if (!area) return;

        if (jaCompleto) {
          area.innerHTML = `<div class="desafio-completo">✅ Fase concluída! Esta parada não está mais disponível. Siga para a próxima.</div>`;
          desafioCarregado = true;
          return;
        }

        TripulacaoNaracao.dialogo(TripulantesDialogos.inicioDesafio(planeta));

        Jogos.pararJogo();
        Jogos.setCallback((venceu) => {
          if (venceu && eDestinoAtual) {
            TripulacaoNaracao.modoCompacto(false);
            TripulacaoNaracao.dialogo(TripulantesDialogos.vitoriaDesafio(planeta), { manterHUD: true });

            this.jornadaCompletos.push(planeta.id);
            this.jornadaIndice++;
            this.salvarProgresso();

            if (this.jornadaIndice >= this.jornadaOrdem.length) {
              setTimeout(() => {
                const btn = document.querySelector('.btn-continuar-jogo');
                if (btn) {
                  btn.addEventListener('click', () => {
                    setTimeout(() => this.transicao(() => this.mostrarApresentacaoFinal()), 400);
                  }, { once: true });
                } else {
                  this.transicao(() => this.mostrarApresentacaoFinal());
                }
              }, 100);
            } else {
              const prox = planetas.find(p => p.id === this.jornadaOrdem[this.jornadaIndice]);
              setTimeout(() => {
                area.innerHTML = `
                  <div class="desafio-completo">
                    ✅ Missão cumprida!<br>
                    Próxima parada: <strong style="color:${prox.cor}">${prox.nome}</strong>
                    <button class="btn-avancar" id="btn-seguir-proximo">🚀 Seguir para ${prox.nome}</button>
                  </div>
                `;
                document.getElementById('btn-seguir-proximo').addEventListener('click', () => {
                  Jogos.pararJogo();
                  Jogos.setCallback(null);
                  this.visitarPlaneta(prox.id);
                });
              }, 1000);
            }
          }
        });

        Jogos.jogar(planeta, area);
        desafioCarregado = true;
      };

      btns.forEach(btn => {
        btn.addEventListener('click', () => {
          if (btn.dataset.aba === 'desafio') {
            iniciarTelaDesafio();
            return;
          }
          sairModoDesafio();
          ativarAba(btn.dataset.aba);
        });
      });

      document.getElementById('btn-voltar-info-planeta')?.addEventListener('click', () => {
        sairModoDesafio();
      });

      document.getElementById('btn-voltar-mapa').addEventListener('click', () => {
        sairModoDesafio();
        this.transicao(() => this.criarRotaAventura());
      });
    },

    mostrarApresentacaoFinal() {
      Jogos.pararJogo();
      Jogos.setCallback(null);
      NaracaoEspaco.parar();
      if (this._recapTimer) clearInterval(this._recapTimer);

      const paradas = this.jornadaOrdem
        .map(id => planetas.find(p => p.id === id))
        .filter(Boolean);
      const main = document.getElementById('main-container');
      const slidesHtml = paradas.map((p, idx) => `
        <div class="recap-slide${idx === 0 ? ' ativo' : ''}" data-idx="${idx}" style="--cor-planeta:${p.cor}">
          <div class="recap-slide-num">Parada ${idx + 1} de ${paradas.length}</div>
          <div class="recap-slide-arte">${planetaArte(p.id, 120)}</div>
          <h2 class="recap-slide-nome" style="color:${p.cor}">${p.nome}</h2>
          <p class="recap-slide-desafio">✅ ${p.desafio?.nome || 'Missão concluída'}</p>
          <p class="recap-slide-curio">${p.curiosidades?.[0] || ''}</p>
        </div>
      `).join('');

      main.innerHTML = `
        <div class="apresentacao-final">
          <div class="estrelas-bg"></div>
          <div class="recap-cabecalho">
            <span class="recap-emoji">🚀</span>
            <h1>Sua Jornada pelo Sistema Solar</h1>
            <p>Reviva cada parada da sua viagem espacial</p>
          </div>
          <div class="recap-slideshow" id="recap-slideshow">
            ${slidesHtml}
          </div>
          <div class="recap-barra">
            <div class="recap-barra-preenchimento" id="recap-barra"></div>
          </div>
          <div class="recap-finale oculto" id="recap-finale">
            <div class="recap-finale-brilho"></div>
            <div class="recap-finale-sol">${planetaArte('sol', 140)}</div>
            <h2 class="recap-finale-titulo">🎉 Viagem Completa!</h2>
            <p class="recap-narracao" id="recap-narracao">
              Uau, um astronauta assim como você vai longe para novas viagens.
              Você quer conhecer outras galáxias, outros sistemas planetários e novas estrelas.
            </p>
            <button class="btn-interstellar" id="btn-viagem-interstellar">Viagem Interstellar</button>
          </div>
        </div>
      `;

      this.criarEstrelas();
      this.iniciarSlideshowRecap(paradas.length);

      document.getElementById('btn-viagem-interstellar')?.addEventListener('click', () => {
        NaracaoEspaco.parar();
        if (this._recapTimer) clearInterval(this._recapTimer);
        this.transicao(() => this.mostrarTelaInterstellar());
      });
    },

    iniciarSlideshowRecap(total) {
      let atual = 0;
      const slides = document.querySelectorAll('.recap-slide');
      const barra = document.getElementById('recap-barra');
      const slideshow = document.getElementById('recap-slideshow');
      const finale = document.getElementById('recap-finale');
      const duracaoSlide = 3200;

      const avancar = () => {
        slides[atual]?.classList.remove('ativo');
        atual++;
        if (atual < total) {
          slides[atual]?.classList.add('ativo');
          if (barra) barra.style.width = `${((atual + 1) / total) * 100}%`;
        } else {
          clearInterval(this._recapTimer);
          slideshow?.classList.add('oculto');
          document.querySelector('.recap-cabecalho')?.classList.add('oculto');
          document.querySelector('.recap-barra')?.classList.add('oculto');
          finale?.classList.remove('oculto');
          TripulacaoNaracao.dialogo(TripulantesDialogos.finale(), { manterHUD: true });
        }
      };

      if (barra) barra.style.width = `${(1 / total) * 100}%`;
      this._recapTimer = setInterval(avancar, duracaoSlide);
    },

    mostrarTelaInterstellar() {
      NaracaoEspaco.parar();
      const main = document.getElementById('main-container');
      main.innerHTML = `
        <div class="tela-interstellar">
          <div class="estrelas-bg"></div>
          <div class="interstellar-galaxia"></div>
          <div class="interstellar-conteudo">
            <div class="interstellar-nave">🚀</div>
            <h1>Viagem Interstellar</h1>
            <p class="interstellar-sub">Além do Sistema Solar aguardam galáxias, exoplanetas e estrelas distantes.</p>
            <p class="interstellar-em-breve">🌌 Em breve — novas fronteiras do universo!</p>
            <button class="btn-voltar" id="btn-interstellar-voltar">Voltar ao Menu</button>
          </div>
        </div>
      `;
      this.criarEstrelas();
      document.getElementById('btn-interstellar-voltar').addEventListener('click', () => {
        this.transicao(() => this.criarTelaInicial());
      });
    }
  };

  window.App = App;
  App.init();
});
