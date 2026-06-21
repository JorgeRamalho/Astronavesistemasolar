document.addEventListener('DOMContentLoaded', () => {
  const App = {
    planetaAtual: null,
    estaViajando: false,
    visitados: new Set(),
    modoAtual: 'aventura',
    jornadaOrdem: ['terra', 'lua', 'mercurio', 'venus', 'marte', 'jupiter', 'saturno', 'urano', 'netuno', 'plutao', 'sol'],
    jornadaIndice: 0,
    jornadaCompletos: [],

    init() {
      Jogos.init();
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
      const overlay = document.getElementById('transition-overlay');
      overlay.classList.add('ativo');
      setTimeout(() => {
        overlay.classList.remove('ativo');
        if (callback) callback();
      }, 800);
    },

    criarTelaInicial() {
      const main = document.getElementById('main-container');
      const temProgresso = this.jornadaCompletos.length > 0;
      main.innerHTML = `
        <div class="tela-inicial">
          <div class="sol-decorativo">${planetaArte('sol', 160)}</div>
          <div class="lua-decorativa">${planetaArte('lua', 100)}</div>
          <div class="nave-intro">
            <div class="nave-spaceship">🚀</div>
            <h1 class="titulo-jogo">VIAGEM<br>SISTEMA SOLAR</h1>
            <p class="subtitulo-jogo">Uma aventura pelos planetas, o Sol e a Lua</p>
          </div>
          <div class="modos-menu">
            <div class="modo-card" data-modo="aventura">
              <div class="modo-card-icon">👨‍🚀</div>
              <div class="modo-card-content">
                <h3>Comandante: Capitão Cosmos</h3>
                <p>Modo Aventura - Siga a rota completa!</p>
                <span class="modo-card-info">${this.jornadaOrdem.length} paradas</span>
              </div>
            </div>
            <div class="modo-card" data-modo="exploracao">
              <div class="modo-card-icon">🚀</div>
              <div class="modo-card-content">
                <h3>Foguete: Explorador Estelar</h3>
                <p>Modo Exploração - Visite livremente!</p>
                <span class="modo-card-info">Sem regras</span>
              </div>
            </div>
            <div class="modo-card" data-modo="galeria">
              <div class="modo-card-icon">📡</div>
              <div class="modo-card-content">
                <h3>Missão: Explorar o Sistema Solar</h3>
                <p>Modo Galeria - Navegue pelas fichas técnicas!</p>
                <span class="modo-card-info">${planetas.length} planetas</span>
              </div>
            </div>
          </div>
          ${temProgresso ? '<button class="btn-continuar" id="btn-continuar">▶ CONTINUAR JORNADA</button>' : ''}
          <div class="estrelas-bg"></div>
        </div>
      `;

      this.criarEstrelas();

      document.querySelectorAll('.modo-card').forEach(card => {
        card.addEventListener('click', () => {
          const modo = card.dataset.modo;
          this.modoAtual = modo;
          if (modo === 'aventura') {
            this.transicao(() => this.criarRotaAventura());
          } else if (modo === 'exploracao') {
            this.transicao(() => this.criarModoExploracao());
          } else if (modo === 'galeria') {
            this.transicao(() => this.criarModoGaleria());
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

    },

    criarRotaAventura() {
      const main = document.getElementById('main-container');
      const destinoIdx = this.jornadaIndice;
      const destino = this.jornadaOrdem[destinoIdx];
      const planeta = planetas.find(p => p.id === destino);

      main.innerHTML = `
        <div class="rota-aventura">
          <div class="rota-header">
            <h2>🚀 ROTA DA AVENTURA</h2>
            <p>Sua jornada pelo Sistema Solar</p>
            <button class="btn-voltar-pequeno" id="rota-voltar-menu">Menu</button>
          </div>
          <div class="rota-progresso">
            <span>Parada ${destinoIdx + 1} de ${this.jornadaOrdem.length}</span>
            <div class="barra-progresso">
              <div class="barra-preenchimento" style="width:${(this.jornadaCompletos.length / this.jornadaOrdem.length) * 100}%"></div>
            </div>
          </div>
          <div class="rota-lista" id="rota-lista"></div>
          <button class="btn-avancar" id="rota-continuar">
            🚀 IR PARA ${planeta.nome.toUpperCase()}
          </button>
        </div>
        <div class="estrelas-bg"></div>
      `;

      this.criarEstrelas();
      this.criarListaRota();

      document.getElementById('rota-continuar').addEventListener('click', () => {
        this.visitarPlaneta(destino);
      });

      document.getElementById('rota-voltar-menu').addEventListener('click', () => {
        this.transicao(() => this.criarTelaInicial());
      });

    },

    criarListaRota() {
      const lista = document.getElementById('rota-lista');
      if (!lista) return;

      lista.innerHTML = this.jornadaOrdem.map((id, idx) => {
        const p = planetas.find(pl => pl.id === id);
        const completa = this.jornadaCompletos.includes(id);
        const atual = idx === this.jornadaIndice;
        const bloqueada = idx > this.jornadaIndice;

        let classe = 'rota-item';
        let icone, statusTexto;
        if (completa) {
          classe += ' completa';
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
          <div class="${classe}">
            <span class="rota-icone">${icone}</span>
            ${planetaArte(p.id, 32)}
            <span class="rota-nome" style="color:${p.cor}">${p.nome}</span>
            <span class="rota-status">${statusTexto}</span>
          </div>
        `;
      }).join('');
    },

    criarModoExploracao() {
      const main = document.getElementById('main-container');
      this.roverX = 0;
      this.roverY = 0;
      this.roverTeclas = {};
      this.roverAnimId = null;

      main.innerHTML = `
        <div class="mapa-sistema" id="mapa-sistema">
          <div class="mapa-header">
            <h2>🛸 MODO EXPLORAÇÃO</h2>
            <p>Use WASD ou setas para mover o rover. Passe o mouse nos planetas para ampliar e clique para ver a ficha!</p>
            <button class="btn-voltar-pequeno" id="explorar-voltar">Menu</button>
          </div>
          <div class="exploracao-wrapper" id="exploracao-wrapper">
            <div class="orbita-container" id="orbita-container"></div>
            <div class="rover" id="rover">🛸</div>
          </div>
          <div class="exploracao-painel" id="exploracao-painel"></div>
        </div>
        <div class="estrelas-bg"></div>
      `;

      this.criarEstrelas();
      this.criarOrbitasExploracao();
      this.initRoverControles();

      document.getElementById('explorar-voltar').addEventListener('click', () => {
        this.pararRover();
        this.transicao(() => this.criarTelaInicial());
      });

    },

    initRoverControles() {
      const handleKey = (e) => {
        this.roverTeclas[e.key] = e.type === 'keydown';
      };
      document.addEventListener('keydown', handleKey);
      document.addEventListener('keyup', handleKey);
      this.roverListeners = handleKey;
      this.roverAnimId = requestAnimationFrame(() => this.atualizarRover());
    },

    pararRover() {
      if (this.roverAnimId) cancelAnimationFrame(this.roverAnimId);
      if (this.roverListeners) {
        document.removeEventListener('keydown', this.roverListeners);
        document.removeEventListener('keyup', this.roverListeners);
      }
    },

    atualizarRover() {
      const rover = document.getElementById('rover');
      if (!rover) { this.roverAnimId = null; return; }
      const teclas = this.roverTeclas;
      let dx = 0, dy = 0;
      if (teclas['w'] || teclas['W'] || teclas['ArrowUp']) dy = -3;
      if (teclas['s'] || teclas['S'] || teclas['ArrowDown']) dy = 3;
      if (teclas['a'] || teclas['A'] || teclas['ArrowLeft']) dx = -3;
      if (teclas['d'] || teclas['D'] || teclas['ArrowRight']) dx = 3;

      if (dx || dy) {
        this.roverX += dx;
        this.roverY += dy;
        const max = 280;
        this.roverX = Math.max(-max, Math.min(max, this.roverX));
        this.roverY = Math.max(-max, Math.min(max, this.roverY));
        rover.style.transform = `translate(-50%,-50%) translate(${this.roverX}px,${this.roverY}px)`;
        if (dx < 0) rover.style.transform += ' scaleX(-1)';
        else rover.style.transform = rover.style.transform.replace(' scaleX(-1)', '');

        this.verificarProximidadePlanetas();
      }

      this.roverAnimId = requestAnimationFrame(() => this.atualizarRover());
    },

    verificarProximidadePlanetas() {
      const wrapper = document.getElementById('exploracao-wrapper');
      if (!wrapper) return;
      const wrapperRect = wrapper.getBoundingClientRect();
      const roverEl = document.getElementById('rover');
      if (!roverEl) return;
      const roverRect = roverEl.getBoundingClientRect();
      const cx = roverRect.left + roverRect.width / 2 - wrapperRect.left;
      const cy = roverRect.top + roverRect.height / 2 - wrapperRect.top;

      document.querySelectorAll('.planeta-link').forEach(el => {
        const elRect = el.getBoundingClientRect();
        const ex = elRect.left + elRect.width / 2 - wrapperRect.left;
        const ey = elRect.top + elRect.height / 2 - wrapperRect.top;
        const dist = Math.sqrt((cx - ex) ** 2 + (cy - ey) ** 2);
        el.classList.toggle('rover-perto', dist < 80);
      });
    },

    criarOrbitasExploracao() {
      const container = document.getElementById('orbita-container');
      if (!container) return;
      container.innerHTML = '';

      const isMobile = window.innerWidth <= 768;
      const escala = isMobile ? 0.6 : 1.0;

      const ordemMapa = ['mercurio','venus','terra','marte','jupiter','saturno','urano','netuno','plutao'];
      const tamanhos = {
        sol: isMobile ? 70 : 100, mercurio: isMobile ? 20 : 24, venus: isMobile ? 26 : 30,
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

      const sol = document.createElement('div');
      sol.className = 'corpo-celeste sol planeta-link';
      sol.dataset.planeta = 'sol';
      sol.innerHTML = `${planetaArte('sol', tamanhos.sol)}<span class="corpo-nome">Sol</span>`;
      sol.addEventListener('click', () => this.mostrarPainelExploracao('sol'));
      container.appendChild(sol);

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

        const planetaEl = document.createElement('div');
        planetaEl.className = 'corpo-celeste planeta planeta-link';
        planetaEl.dataset.planeta = id;
        planetaEl.style.cssText = `position:absolute;top:50%;left:50%;width:${tamanhos[id]}px;height:${tamanhos[id]}px;`;

        let html = planetaArte(id, tamanhos[id]);
        if (id === 'terra') {
          html += `<div class="lua-companhia" data-planeta="lua">${planetaArte('lua', 16)}</div>`;
        }
        html += `<span class="corpo-nome">${p.nome}</span>`;
        planetaEl.innerHTML = html;

        const rad = (angulosIniciais[id] * Math.PI) / 180;
        planetaEl.style.transform = `translate(-50%,-50%) translate(${Math.cos(rad) * orb.raio}px,${Math.sin(rad) * orb.raio}px)`;

        planetaEl.addEventListener('click', (e) => {
          e.stopPropagation();
          if (e.target.closest('[data-planeta="lua"]')) {
            this.mostrarPainelExploracao('lua');
            return;
          }
          this.mostrarPainelExploracao(id);
        });
        orbita.appendChild(planetaEl);
        container.appendChild(orbita);
      });
    },

    mostrarPainelExploracao(id) {
      const p = planetas.find(pl => pl.id === id);
      if (!p) return;
      const painel = document.getElementById('exploracao-painel');
      if (!painel) return;

      const labels = {
        diametro: 'Diâmetro', massa: 'Massa', temperatura: 'Temperatura',
        idade: 'Idade', tipo: 'Tipo', composicao: 'Composição',
        distanciaSol: 'Distância do Sol', periodoOrbital: 'Período Orbital',
        distanciaTerra: 'Distância da Terra', descoberta: 'Descoberta'
      };

      painel.innerHTML = `
        <div class="exploracao-painel-overlay" id="exploracao-painel-fechar"></div>
        <div class="exploracao-painel-conteudo" style="border-color: ${p.cor}">
          <button class="exploracao-painel-fechar" id="exploracao-painel-fechar-btn">✕</button>
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
          <div class="galeria-header">
            <h2>📡 GALERIA DO SISTEMA SOLAR</h2>
            <p>Navegue pelas fichas técnicas de todos os corpos celestes</p>
            <button class="btn-voltar-pequeno" id="galeria-voltar">Menu</button>
          </div>
          <div class="galeria-grade" id="galeria-grade"></div>
          <div class="galeria-painel" id="galeria-painel"></div>
        </div>
        <div class="estrelas-bg"></div>
      `;

      this.criarEstrelas();
      const grade = document.getElementById('galeria-grade');

      const ordemGaleria = ['sol','mercurio','venus','terra','lua','marte','jupiter','saturno','urano','netuno','plutao','halley','halebopp'];
      const tamanhos = { sol: 72, mercurio: 26, venus: 32, terra: 32, lua: 24, marte: 26, jupiter: 44, saturno: 38, urano: 32, netuno: 32, plutao: 24, halley: 28, halebopp: 30 };

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
          <button class="painel-fechar" id="painel-fechar-btn">✕</button>
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
      if (this.jornadaCompletos.includes(id)) return true;
      return id === this.jornadaOrdem[this.jornadaIndice];
    },

    visitarPlaneta(id) {
      if (this.estaViajando) return;
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
        <div class="planeta-visao" id="planeta-visao">
          <div class="planeta-header">
            <button class="btn-voltar" id="btn-voltar-mapa">Voltar</button>
          </div>

          <div class="aventura-indicador">
            ${jaCompleto ? '✅ Missão cumprida!' : (eODestinoAtual ? '🚀 Destino atual - Complete o desafio!' : '')}
          </div>

          <div class="planeta-destaque" style="background: radial-gradient(circle at center, ${planeta.cor}33 0%, transparent 70%)">
            ${planetaArte(planeta.id, 100)}
            <h2 class="planeta-nome" style="color: ${planeta.cor}">${planeta.nome}</h2>
            <span class="planeta-tipo">${planeta.tipo}</span>
          </div>

          <div class="planeta-conteudo">
            <div class="planeta-abas">
              <button class="aba-btn ativa" data-aba="ficha">📋 Ficha Técnica</button>
              <button class="aba-btn" data-aba="curiosidades">💡 Curiosidades</button>
              <button class="aba-btn" data-aba="desafio">🎮 Desafio</button>
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
              <div class="desafio-area" id="desafio-area"></div>
            </div>
          </div>
        </div>
        <div class="estrelas-bg"></div>
      `;

      this.criarEstrelas();
      this.configurarAbaNavegacao(planeta, eODestinoAtual, jaCompleto);
    },

    configurarAbaNavegacao(planeta, eDestinoAtual, jaCompleto) {
      const btns = document.querySelectorAll('.aba-btn');
      let desafioCarregado = false;

      btns.forEach(btn => {
        btn.addEventListener('click', () => {
          btns.forEach(b => b.classList.remove('ativa'));
          btn.classList.add('ativa');
          document.querySelectorAll('.aba-conteudo').forEach(c => c.classList.remove('ativa'));
          const aba = document.getElementById(`aba-${btn.dataset.aba}`);
          if (aba) aba.classList.add('ativa');

          if (btn.dataset.aba === 'desafio' && !desafioCarregado) {
            desafioCarregado = true;
            const area = document.getElementById('desafio-area');

            if (jaCompleto) {
              area.innerHTML = `<div class="desafio-completo">✅ Você já completou este desafio! Volte à rota.</div>`;
              return;
            }

            Jogos.setCallback((venceu) => {
              if (venceu && eDestinoAtual) {
                this.jornadaCompletos.push(planeta.id);
                this.jornadaIndice++;
                this.salvarProgresso();

                if (this.jornadaIndice >= this.jornadaOrdem.length) {
                  setTimeout(() => {
                    area.innerHTML = `<div class="desafio-completo" style="font-size:22px">🎉 VIAGEM COMPLETA!<br>Você explorou todo o Sistema Solar!</div>`;
                  }, 2000);
                } else {
                  const prox = planetas.find(p => p.id === this.jornadaOrdem[this.jornadaIndice]);
                  setTimeout(() => {
                    const btnProx = document.createElement('button');
                    btnProx.className = 'btn-avancar';
                    btnProx.style.marginTop = '15px';
                    btnProx.textContent = `🚀 IR PARA ${prox.nome}`;
                    area.appendChild(btnProx);
                    btnProx.addEventListener('click', () => {
                      this.visitarPlaneta(prox.id);
                    });
                  }, 1000);
                }
              }
            });

            Jogos.jogar(planeta, area);
          }
        });
      });

      document.getElementById('btn-voltar-mapa').addEventListener('click', () => {
        Jogos.pararJogo();
        Jogos.setCallback(null);
        this.transicao(() => this.criarRotaAventura());
      });
    }
  };

  App.init();
});
