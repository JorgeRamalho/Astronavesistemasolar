const Jogos = {
  jogoAtivo: null,
  animacaoId: null,
  teclasPressionadas: {},
  _onResultado: null,
  ultimoPlaneta: null,
  ultimoContainer: null,
  _controlesTouchEl: null,
  canvasW: 400,
  canvasH: 500,

  mapControlesTouch: {
    solarFlare: 'dpad',
    mercuryDash: 'horizontal-tap',
    venusEscape: 'dpad',
    desvioMeteoros: 'horizontal-hold',
    pousoLunar: 'pouso',
    cliqueMeteoros: 'tiro',
    desvioTempestade: 'dpad',
    ringCollector: 'horizontal-hold',
    uranoIce: 'dpad',
    fugaVentos: 'dpad',
    plutoMiner: 'dpad'
  },

  init() {
    document.addEventListener('keydown', (e) => {
      this.teclasPressionadas[e.key] = true;
      if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(e.key)) e.preventDefault();
    });
    document.addEventListener('keyup', (e) => {
      this.teclasPressionadas[e.key] = false;
    });
  },

  usarControlesTouch() {
    return ('ontouchstart' in window || navigator.maxTouchPoints > 0 || window.innerWidth < 768);
  },

  scrollParaControlesMobile() {
    if (!this.usarControlesTouch()) return;

    const rolar = () => {
      const alvo = this._controlesTouchEl || document.querySelector('.controles-touch')
        || document.querySelector('.area-jogo-arcade');
      if (!alvo) return;

      const rodape = document.querySelector('.planeta-rodape');
      const margemInferior = (rodape?.offsetHeight || 0) + 16;
      const margemSuperior = 12;
      const rect = alvo.getBoundingClientRect();

      const acima = rect.top < margemSuperior;
      const abaixo = rect.bottom > window.innerHeight - margemInferior;
      if (!acima && !abaixo) return;

      const destino = abaixo
        ? window.scrollY + rect.bottom - window.innerHeight + margemInferior
        : window.scrollY + rect.top - margemSuperior;

      window.scrollTo({ top: Math.max(0, destino), behavior: 'smooth' });
    };

    requestAnimationFrame(() => {
      requestAnimationFrame(rolar);
      setTimeout(rolar, 400);
    });
  },

  removerControlesTouch() {
    this._controlesTouchEl?.remove();
    this._controlesTouchEl = null;
  },

  vincularBotaoTouch(btn, key, modo) {
    const pressionar = (e) => {
      e.preventDefault();
      e.stopPropagation();
      btn.classList.add('ativo');
      this.teclasPressionadas[key] = true;
      if (modo === 'tap') {
        setTimeout(() => { this.teclasPressionadas[key] = false; }, 80);
      }
    };
    const soltar = (e) => {
      e.preventDefault();
      e.stopPropagation();
      btn.classList.remove('ativo');
      if (modo !== 'tap') this.teclasPressionadas[key] = false;
    };

    btn.addEventListener('touchstart', pressionar, { passive: false });
    btn.addEventListener('touchend', soltar, { passive: false });
    btn.addEventListener('touchcancel', soltar, { passive: false });
    btn.addEventListener('mousedown', pressionar);
    btn.addEventListener('mouseup', soltar);
    btn.addEventListener('mouseleave', soltar);
  },

  criarBotaoTouch(key, label, extraClass = '') {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `controle-touch-btn ${extraClass}`.trim();
    btn.dataset.key = key;
    btn.textContent = label;
    btn.setAttribute('aria-label', key.replace('Arrow', ''));
    return btn;
  },

  criarControlesTouch(area, tipo) {
    if (!this.usarControlesTouch() || !tipo || tipo === 'tiro') return null;

    this.removerControlesTouch();
    const wrap = document.createElement('div');
    wrap.className = `controles-touch controles-touch--${tipo}`;
    wrap.setAttribute('aria-label', 'Controles touch');

    const modo = tipo === 'horizontal-tap' ? 'tap' : 'hold';

    if (tipo === 'horizontal-hold' || tipo === 'horizontal-tap') {
      const esq = this.criarBotaoTouch('ArrowLeft', '←', 'controle-esq');
      const dir = this.criarBotaoTouch('ArrowRight', '→', 'controle-dir');
      this.vincularBotaoTouch(esq, 'ArrowLeft', modo);
      this.vincularBotaoTouch(dir, 'ArrowRight', modo);
      wrap.appendChild(esq);
      wrap.appendChild(dir);
    } else if (tipo === 'dpad' || tipo === 'pouso') {
      const grid = document.createElement('div');
      grid.className = 'controles-touch-grid';
      const botoes = [
        { key: 'ArrowUp', label: '↑', cls: 'controle-cima slot-cima' },
        { key: 'ArrowLeft', label: '←', cls: 'controle-esq slot-esq' },
        { key: 'ArrowDown', label: '↓', cls: 'controle-baixo slot-baixo' },
        { key: 'ArrowRight', label: '→', cls: 'controle-dir slot-dir' }
      ];
      botoes.forEach(({ key, label, cls }) => {
        const btn = this.criarBotaoTouch(key, label, cls);
        this.vincularBotaoTouch(btn, key, 'hold');
        grid.appendChild(btn);
      });
      wrap.appendChild(grid);
    }

    area.classList.add('area-jogo-com-touch');
    area.appendChild(wrap);
    this._controlesTouchEl = wrap;
    return wrap;
  },

  configurarToqueCanvas(canvas, callback) {
    const handler = (clientX, clientY) => {
      const rect = canvas.getBoundingClientRect();
      const escalaX = canvas.width / rect.width;
      const escalaY = canvas.height / rect.height;
      callback((clientX - rect.left) * escalaX, (clientY - rect.top) * escalaY);
    };

    canvas.addEventListener('click', (e) => handler(e.clientX, e.clientY));
    canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      const t = e.changedTouches[0];
      if (t) handler(t.clientX, t.clientY);
    }, { passive: false });
    canvas.style.touchAction = 'none';
  },

  dicaControles(textoTeclado, textoTouch) {
    return this.usarControlesTouch() ? textoTouch : textoTeclado;
  },

  setCallback(fn) {
    this._onResultado = fn;
  },

  async jogar(planeta, container) {
    this.pararJogo();
    this.ultimoPlaneta = planeta;
    this.ultimoContainer = container;
    container.innerHTML = '';
    container.style.display = 'block';
    const desafio = planeta.desafio;
    if (!desafio) return;

    if (!this.usarControlesTouch()) {
      const titulo = document.createElement('h3');
      titulo.className = 'desafio-titulo';
      titulo.textContent = `🎮 ${desafio.nome}`;
      container.appendChild(titulo);
    }

    const desc = document.createElement('p');
    desc.className = 'desafio-descricao';
    desc.textContent = desafio.descricao;
    container.appendChild(desc);

    const areaJogo = document.createElement('div');
    areaJogo.className = 'area-jogo area-jogo-arcade';
    container.appendChild(areaJogo);

    const tipoControle = this.mapControlesTouch[desafio.tipo];
    if (tipoControle) {
      this.criarControlesTouch(areaJogo, tipoControle);
    }

    switch (desafio.tipo) {
      case 'solarFlare': this.jogoSolarFlare(desafio, areaJogo, container); break;
      case 'mercuryDash': this.jogoMercuryDash(desafio, areaJogo, container); break;
      case 'venusEscape': this.jogoVenusEscape(desafio, areaJogo, container); break;
      case 'desvioMeteoros': this.jogoDesvioMeteoros(desafio, areaJogo, container); break;
      case 'pousoLunar': this.jogoPousoLunar(desafio, areaJogo, container); break;
      case 'cliqueMeteoros': this.jogoCliqueMeteoros(desafio, areaJogo, container); break;
      case 'desvioTempestade': this.jogoDesvioTempestade(desafio, areaJogo, container); break;
      case 'ringCollector': this.jogoRingCollector(desafio, areaJogo, container); break;
      case 'uranoIce': this.jogoUranoIce(desafio, areaJogo, container); break;
      case 'fugaVentos': this.jogoFugaVentos(desafio, areaJogo, container); break;
      case 'plutoMiner': this.jogoPlutoMiner(desafio, areaJogo, container); break;
      default: areaJogo.innerHTML = '<p>Jogo em desenvolvimento...</p>';
    }

    this.scrollParaControlesMobile();
  },

  finalizarJogo(container, venceu, mensagem) {
    const overlay = document.createElement('div');
    overlay.className = `jogo-resultado ${venceu ? 'vitoria' : 'derrota'}`;
    overlay.innerHTML = `
      <div class="jogo-resultado-conteudo">
        <div class="jogo-resultado-emoji">${venceu ? '🎉' : '💫'}</div>
        <h3>${venceu ? 'Missão Cumprida!' : 'Tente Novamente!'}</h3>
        <p>${mensagem}</p>
        <div class="jogo-resultado-botoes">
          ${venceu ? `<button class="btn-jogo btn-continuar-jogo">Continuar</button>` :
          `<button class="btn-voltar btn-fechar-jogo">Fechar</button>
           <button class="btn-jogo btn-tentar" id="btn-tentar-novamente">🔄 Tentar Novamente</button>`}
        </div>
      </div>
    `;
    container.appendChild(overlay);

    overlay.querySelector('.btn-continuar-jogo')?.addEventListener('click', () => { overlay.remove(); });
    overlay.querySelector('.btn-fechar-jogo')?.addEventListener('click', () => { overlay.remove(); });
    overlay.querySelector('#btn-tentar-novamente')?.addEventListener('click', () => {
      overlay.remove();
      this.jogar(this.ultimoPlaneta, this.ultimoContainer);
    });

    this.pararJogo();
    if (typeof this._onResultado === 'function') {
      this._onResultado(venceu);
    }
  },

  pararJogo() {
    if (this.animacaoId) {
      cancelAnimationFrame(this.animacaoId);
      this.animacaoId = null;
    }
    this.removerControlesTouch();
    this.teclasPressionadas = {};
    this.jogoAtivo = null;
  },

  criarCanvas(area) {
    const canvas = document.createElement('canvas');
    canvas.width = this.canvasW;
    canvas.height = this.canvasH;
    canvas.className = 'arcade-canvas';
    canvas.style.touchAction = 'none';
    area.insertBefore(canvas, area.firstChild);
    return canvas.getContext('2d');
  },

  desenharBackground(ctx, cor1 = '#0a0a1a', cor2 = '#0f0f2a') {
    const grad = ctx.createLinearGradient(0, 0, 0, this.canvasH);
    grad.addColorStop(0, cor1);
    grad.addColorStop(1, cor2);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, this.canvasW, this.canvasH);
    for (let i = 0; i < 50; i++) {
      ctx.fillStyle = `rgba(255,255,255,${0.1 + Math.random() * 0.4})`;
      ctx.beginPath();
      ctx.arc(Math.random() * this.canvasW, Math.random() * this.canvasH, Math.random() * 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
  },

  desenharHUD(ctx, textoEsq, textoDir, cor = '#fff') {
    ctx.fillStyle = cor;
    ctx.font = 'bold 14px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(textoEsq, 10, 22);
    ctx.textAlign = 'right';
    ctx.fillText(textoDir, this.canvasW - 10, 22);
  },

  // --- SOLAR FLARE ---
  jogoSolarFlare(desafio, area, container) {
    const ctx = this.criarCanvas(area);
    let nave = { x: 200, y: 400 };
    let flares = [];
    let tempoRestante = desafio.duracao;
    let ativo = true;

    const loop = () => {
      if (!ativo) return;
      this.desenharBackground(ctx, '#1a0a00', '#0a0500');

      ctx.save();
      ctx.translate(200, 140);
      const grad = ctx.createRadialGradient(0, 0, 10, 0, 0, 60);
      grad.addColorStop(0, '#fff8e0');
      grad.addColorStop(0.3, '#FDB813');
      grad.addColorStop(0.7, '#ff6600');
      grad.addColorStop(1, '#cc3300');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(0, 0, 60, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(253,184,19,0.3)';
      ctx.beginPath();
      ctx.arc(0, 0, 80 + Math.sin(Date.now() / 500) * 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      if (Math.random() < 0.04) {
        const ang = Math.random() * Math.PI * 2;
        flares.push({
          x: 200 + Math.cos(ang) * 70,
          y: 140 + Math.sin(ang) * 70,
          vx: Math.cos(ang) * (1 + Math.random() * 2),
          vy: Math.sin(ang) * (1 + Math.random() * 2),
          tamanho: 8 + Math.random() * 14,
          vida: 80 + Math.random() * 40
        });
      }

      flares = flares.filter(f => {
        f.x += f.vx;
        f.y += f.vy;
        f.vida--;
        const alpha = Math.min(1, f.vida / 40);
        const grad2 = ctx.createRadialGradient(f.x, f.y, 2, f.x, f.y, f.tamanho);
        grad2.addColorStop(0, `rgba(255,200,100,${alpha})`);
        grad2.addColorStop(0.5, `rgba(255,100,0,${alpha * 0.6})`);
        grad2.addColorStop(1, `rgba(200,50,0,0)`);
        ctx.fillStyle = grad2;
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.tamanho, 0, Math.PI * 2);
        ctx.fill();
        return f.vida > 0 && f.x > -50 && f.x < this.canvasW + 50 && f.y > -50 && f.y < this.canvasH + 50;
      });

      if (this.teclasPressionadas['w'] || this.teclasPressionadas['W'] || this.teclasPressionadas['ArrowUp']) nave.y -= 3;
      if (this.teclasPressionadas['s'] || this.teclasPressionadas['S'] || this.teclasPressionadas['ArrowDown']) nave.y += 3;
      if (this.teclasPressionadas['a'] || this.teclasPressionadas['A'] || this.teclasPressionadas['ArrowLeft']) nave.x -= 3;
      if (this.teclasPressionadas['d'] || this.teclasPressionadas['D'] || this.teclasPressionadas['ArrowRight']) nave.x += 3;
      nave.x = Math.max(18, Math.min(this.canvasW - 18, nave.x));
      nave.y = Math.max(18, Math.min(this.canvasH - 18, nave.y));

      for (const f of flares) {
        const dx = nave.x - f.x;
        const dy = nave.y - f.y;
        if (Math.sqrt(dx * dx + dy * dy) < f.tamanho + 12) {
          ativo = false;
          this.finalizarJogo(container, false, 'Sua nave foi atingida por uma erupção solar!');
          return;
        }
      }

      ctx.fillStyle = '#4488ff';
      ctx.beginPath();
      ctx.moveTo(nave.x, nave.y - 15);
      ctx.lineTo(nave.x - 10, nave.y + 8);
      ctx.lineTo(nave.x + 10, nave.y + 8);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#88ccff';
      ctx.beginPath();
      ctx.moveTo(nave.x, nave.y - 8);
      ctx.lineTo(nave.x - 5, nave.y + 3);
      ctx.lineTo(nave.x + 5, nave.y + 3);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#FDB813';
      ctx.font = 'bold 14px monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`⏱ ${Math.ceil(tempoRestante)}s`, 10, 22);
      ctx.textAlign = 'right';
      ctx.fillText(`☀️ ${flares.length}`, this.canvasW - 10, 22);

      ctx.fillStyle = '#8899bb';
      ctx.font = '11px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(this.dicaControles('WASD para desviar', 'Use os botões ou deslize'), 200, this.canvasH - 8);

      if (tempoRestante <= 0) {
        ativo = false;
        this.finalizarJogo(container, true, 'Sobreviveu às erupções solares!');
        return;
      }
      tempoRestante -= 1 / 60;
      this.animacaoId = requestAnimationFrame(loop);
    };
    loop();
  },

  // --- MERCURY DASH ---
  jogoMercuryDash(desafio, area, container) {
    const ctx = this.criarCanvas(area);
    const faixas = [80, 200, 320];
    let faixaAtual = 1;
    let obstaculos = [];
    let tempoRestante = desafio.duracao;
    let ativo = true;
    let velocidade = 4;

    const loop = () => {
      if (!ativo) return;
      this.desenharBackground(ctx, '#1a1a2a', '#0a0a1a');

      for (let i = 0; i < 3; i++) {
        ctx.strokeStyle = 'rgba(255,255,255,0.08)';
        ctx.lineWidth = 2;
        ctx.setLineDash([10, 15]);
        ctx.beginPath();
        ctx.moveTo(faixas[i], 0);
        ctx.lineTo(faixas[i], this.canvasH);
        ctx.stroke();
      }
      ctx.setLineDash([]);

      velocidade = Math.min(8, 4 + (desafio.duracao - tempoRestante) / 8);

      if (Math.random() < 0.015 * (velocidade / 4)) {
        const faixa = Math.floor(Math.random() * 3);
        obstaculos.push({
          faixa: faixa,
          y: -40,
          tamanho: 15 + Math.random() * 20,
          cor: Math.random() < 0.3 ? '#ff4444' : '#ffaa00'
        });
      }

      obstaculos = obstaculos.filter(o => {
        o.y += velocidade;
        const x = faixas[o.faixa];
        const grad2 = ctx.createRadialGradient(x, o.y, 2, x, o.y, o.tamanho);
        grad2.addColorStop(0, '#fff');
        grad2.addColorStop(0.3, o.cor);
        grad2.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = grad2;
        ctx.beginPath();
        ctx.arc(x, o.y, o.tamanho, 0, Math.PI * 2);
        ctx.fill();
        return o.y < this.canvasH + 50;
      });

      if ((this.teclasPressionadas['ArrowLeft'] || this.teclasPressionadas['a'] || this.teclasPressionadas['A']) && faixaAtual > 0) {
        faixaAtual--;
        this.teclasPressionadas['ArrowLeft'] = false;
        this.teclasPressionadas['a'] = false;
        this.teclasPressionadas['A'] = false;
      }
      if ((this.teclasPressionadas['ArrowRight'] || this.teclasPressionadas['d'] || this.teclasPressionadas['D']) && faixaAtual < 2) {
        faixaAtual++;
        this.teclasPressionadas['ArrowRight'] = false;
        this.teclasPressionadas['d'] = false;
        this.teclasPressionadas['D'] = false;
      }

      const naveX = faixas[faixaAtual];
      for (const o of obstaculos) {
        if (o.faixa === faixaAtual && o.y > 350 && o.y < 450) {
          ativo = false;
          this.finalizarJogo(container, false, 'Colisão em Mercúrio! Muito rápido!');
          return;
        }
      }

      ctx.fillStyle = '#4488ff';
      ctx.shadowColor = '#4488ff';
      ctx.shadowBlur = 15;
      ctx.beginPath();
      ctx.moveTo(naveX, 430 - 18);
      ctx.lineTo(naveX - 14, 430 + 8);
      ctx.lineTo(naveX + 14, 430 + 8);
      ctx.closePath();
      ctx.fill();
      ctx.shadowBlur = 0;

      ctx.fillStyle = '#fff';
      ctx.font = 'bold 14px monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`⏱ ${Math.ceil(tempoRestante)}s`, 10, 22);
      ctx.textAlign = 'right';
      ctx.fillText(`⚡ ${velocidade.toFixed(0)}x`, this.canvasW - 10, 22);
      ctx.fillStyle = '#8899bb';
      ctx.font = '11px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(this.dicaControles('← → para trocar de faixa', 'Toque ← → para trocar de faixa'), 200, this.canvasH - 8);

      if (tempoRestante <= 0) {
        ativo = false;
        this.finalizarJogo(container, true, 'Velocidade de Mercúrio dominada!');
        return;
      }
      tempoRestante -= 1 / 60;
      this.animacaoId = requestAnimationFrame(loop);
    };
    loop();
  },

  // --- VENUS ESCAPE ---
  jogoVenusEscape(desafio, area, container) {
    const ctx = this.criarCanvas(area);
    let nave = { x: 200, y: 450 };
    let plataformas = [];
    let tempoRestante = desafio.duracao;
    let ativo = true;
    let score = 0;

    const loop = () => {
      if (!ativo) return;
      this.desenharBackground(ctx, '#2a1000', '#1a0800');

      if (Math.random() < 0.03) {
        const larg = 60 + Math.random() * 80;
        plataformas.push({
          x: Math.random() * (this.canvasW - larg),
          y: -20,
          larg: larg,
          tipo: Math.random() < 0.3 ? 'perigo' : 'normal'
        });
      }

      plataformas = plataformas.filter(p => {
        p.y += 2;
        if (p.tipo === 'perigo') {
          ctx.fillStyle = 'rgba(255,50,0,0.6)';
          ctx.shadowColor = '#ff3300';
          ctx.shadowBlur = 15;
          ctx.fillRect(p.x, p.y, p.larg, 12);
          ctx.shadowBlur = 0;
        } else {
          const grad2 = ctx.createLinearGradient(p.x, p.y, p.x, p.y + 12);
          grad2.addColorStop(0, 'rgba(200,150,50,0.8)');
          grad2.addColorStop(1, 'rgba(150,100,30,0.4)');
          ctx.fillStyle = grad2;
          ctx.fillRect(p.x, p.y, p.larg, 12);
        }
        return p.y < this.canvasH + 20;
      });

      if (this.teclasPressionadas['ArrowLeft'] || this.teclasPressionadas['a'] || this.teclasPressionadas['A']) nave.x -= 3;
      if (this.teclasPressionadas['ArrowRight'] || this.teclasPressionadas['d'] || this.teclasPressionadas['D']) nave.x += 3;
      if (this.teclasPressionadas['ArrowUp'] || this.teclasPressionadas['w'] || this.teclasPressionadas['W']) nave.y -= 3;
      if (this.teclasPressionadas['ArrowDown'] || this.teclasPressionadas['s'] || this.teclasPressionadas['S']) nave.y += 2;
      nave.x = Math.max(10, Math.min(this.canvasW - 10, nave.x));
      nave.y = Math.max(10, Math.min(this.canvasH - 10, nave.y));

      let emPlataforma = false;
      for (const p of plataformas) {
        if (nave.x > p.x && nave.x < p.x + p.larg && nave.y > p.y - 8 && nave.y < p.y + 16) {
          if (p.tipo === 'perigo') {
            ativo = false;
            this.finalizarJogo(container, false, 'Calor extremo de Vênus!');
            return;
          }
          emPlataforma = true;
          score++;
          break;
        }
      }

      let gradNave = ctx.createRadialGradient(nave.x, nave.y, 2, nave.x, nave.y, 14);
      gradNave.addColorStop(0, '#88ff88');
      gradNave.addColorStop(1, '#448844');
      ctx.fillStyle = gradNave;
      ctx.beginPath();
      ctx.arc(nave.x, nave.y, 12, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#E8B84B';
      ctx.font = 'bold 14px monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`⏱ ${Math.ceil(tempoRestante)}s`, 10, 22);
      ctx.textAlign = 'right';
      ctx.fillText(`📦 ${score}`, this.canvasW - 10, 22);
      ctx.fillStyle = '#8899bb';
      ctx.font = '11px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(this.dicaControles('WASD para escalar 💀 Vermelho = perigo', 'Toque direcional | 💀 Vermelho = perigo'), 200, this.canvasH - 8);

      if (tempoRestante <= 0) {
        ativo = false;
        this.finalizarJogo(container, score > 30, score > 30 ? `Escapou de Vênus com ${score} pontos!` : `Só ${score} pontos. Tente novamente!`);
        return;
      }
      tempoRestante -= 1 / 60;
      this.animacaoId = requestAnimationFrame(loop);
    };
    loop();
  },

  // --- RING COLLECTOR ---
  jogoRingCollector(desafio, area, container) {
    const ctx = this.criarCanvas(area);
    let naveX = 200;
    let itens = [];
    let tempoRestante = desafio.duracao;
    let ativo = true;

    const loop = () => {
      if (!ativo) return;
      this.desenharBackground(ctx, '#1a1020', '#0f0818');

      ctx.save();
      ctx.translate(200, 80);
      ctx.strokeStyle = 'rgba(200,170,100,0.15)';
      ctx.lineWidth = 20;
      ctx.beginPath();
      ctx.ellipse(0, 0, 90, 30, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = 'rgba(200,170,100,0.1)';
      ctx.lineWidth = 15;
      ctx.beginPath();
      ctx.ellipse(0, 0, 70, 22, 0.3, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = 'rgba(200,170,100,0.08)';
      ctx.lineWidth = 10;
      ctx.beginPath();
      ctx.ellipse(0, 0, 50, 15, -0.2, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      if (Math.random() < 0.065) {
        const roll = Math.random();
        if (roll < 0.4) {
          itens.push({
            x: Math.random() * (this.canvasW - 20) + 10,
            y: -20,
            tipo: 'anel',
            tamanho: 12 + Math.random() * 10,
            vy: 1.2 + Math.random() * 1.8
          });
        } else if (roll < 0.7) {
          itens.push({
            x: Math.random() * (this.canvasW - 20) + 10,
            y: -20,
            tipo: 'meteoro',
            tamanho: 10 + Math.random() * 12,
            vy: 1.4 + Math.random() * 2
          });
        } else {
          itens.push({
            x: Math.random() * (this.canvasW - 20) + 10,
            y: -20,
            tipo: 'cometa',
            tamanho: 11 + Math.random() * 10,
            vy: 1.3 + Math.random() * 1.9
          });
        }
      }

      itens = itens.filter(item => {
        item.y += item.vy;
        if (item.tipo === 'anel') {
          ctx.strokeStyle = '#FDB813';
          ctx.lineWidth = 3;
          ctx.shadowColor = '#EAD6A5';
          ctx.shadowBlur = 12;
          ctx.beginPath();
          ctx.ellipse(item.x, item.y, item.tamanho, item.tamanho * 0.4, Date.now() / 2000, 0, Math.PI * 2);
          ctx.stroke();
          ctx.shadowBlur = 0;
        } else if (item.tipo === 'meteoro') {
          const grad = ctx.createRadialGradient(item.x, item.y, 2, item.x, item.y, item.tamanho);
          grad.addColorStop(0, '#fff8cc');
          grad.addColorStop(0.35, '#FDB813');
          grad.addColorStop(1, '#c4950a');
          ctx.fillStyle = grad;
          ctx.shadowColor = '#FDB813';
          ctx.shadowBlur = 8;
          ctx.beginPath();
          ctx.arc(item.x, item.y, item.tamanho, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
        } else {
          ctx.fillStyle = '#FDB813';
          ctx.shadowColor = '#EAD6A5';
          ctx.shadowBlur = 10;
          ctx.beginPath();
          ctx.arc(item.x, item.y, item.tamanho * 0.45, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = 'rgba(253, 184, 19, 0.5)';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(item.x, item.y);
          ctx.lineTo(item.x - item.tamanho * 1.8, item.y - item.tamanho * 0.6);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(item.x, item.y);
          ctx.lineTo(item.x - item.tamanho * 1.4, item.y + item.tamanho * 0.4);
          ctx.stroke();
          ctx.shadowBlur = 0;
        }
        return item.y < this.canvasH + 30;
      });

      if (this.teclasPressionadas['ArrowLeft'] || this.teclasPressionadas['a'] || this.teclasPressionadas['A']) naveX -= 4;
      if (this.teclasPressionadas['ArrowRight'] || this.teclasPressionadas['d'] || this.teclasPressionadas['D']) naveX += 4;
      naveX = Math.max(15, Math.min(this.canvasW - 15, naveX));

      for (let i = itens.length - 1; i >= 0; i--) {
        const item = itens[i];
        const dx = naveX - item.x;
        const dy = 430 - item.y;
        if (Math.sqrt(dx * dx + dy * dy) < item.tamanho + 15) {
          ativo = false;
          const msgs = {
            anel: 'Colidiu com os anéis de Saturno!',
            meteoro: 'Atingido por um meteoro!',
            cometa: 'Atingido por um cometa!'
          };
          this.finalizarJogo(container, false, msgs[item.tipo] || 'Colisão!');
          return;
        }
      }

      ctx.fillStyle = '#4488ff';
      ctx.shadowColor = '#4488ff';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.moveTo(naveX, 430 - 15);
      ctx.lineTo(naveX - 10, 430 + 8);
      ctx.lineTo(naveX + 10, 430 + 8);
      ctx.closePath();
      ctx.fill();
      ctx.shadowBlur = 0;

      this.desenharHUD(ctx, `⏱ ${Math.ceil(tempoRestante)}s`, `💫 ${itens.length}`);
      ctx.fillStyle = '#8899bb';
      ctx.font = '11px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(this.dicaControles('← → mover | Desvie dos anéis, meteoros e cometas amarelos', 'Toque ← → | Desvie dos obstáculos amarelos'), this.canvasW / 2, this.canvasH - 8);

      if (tempoRestante <= 0) {
        ativo = false;
        this.finalizarJogo(container, true, 'Sobreviveu aos anéis de Saturno!');
        return;
      }
      tempoRestante -= 1 / 60;
      this.animacaoId = requestAnimationFrame(loop);
    };
    loop();
  },

  // --- URANO ICE ---
  jogoUranoIce(desafio, area, container) {
    const ctx = this.criarCanvas(area);
    let naveX = 200, naveY = 400;
    let itens = [];
    let tempoRestante = desafio.duracao;
    let ativo = true;
    let coletados = 0;

    const loop = () => {
      if (!ativo) return;
      this.desenharBackground(ctx, '#0a1020', '#050818');

      if (Math.random() < 0.04) {
        if (Math.random() < 0.55) {
          itens.push({
            x: Math.random() * (this.canvasW - 16) + 8,
            y: -16,
            tipo: 'cristal',
            vy: 1 + Math.random() * 1.5
          });
        } else {
          itens.push({
            x: Math.random() * (this.canvasW - 20) + 10,
            y: -20,
            tipo: 'detrito',
            vy: 1.5 + Math.random() * 2
          });
        }
      }

      itens = itens.filter(item => {
        item.y += item.vy;
        if (item.tipo === 'cristal') {
          ctx.fillStyle = '#7EC8E3';
          ctx.shadowColor = '#7EC8E3';
          ctx.shadowBlur = 12;
          ctx.beginPath();
          ctx.moveTo(item.x, item.y - 8);
          ctx.lineTo(item.x + 6, item.y + 4);
          ctx.lineTo(item.x, item.y + 2);
          ctx.lineTo(item.x - 6, item.y + 4);
          ctx.closePath();
          ctx.fill();
          ctx.shadowBlur = 0;
        } else {
          ctx.fillStyle = '#556';
          ctx.beginPath();
          ctx.arc(item.x, item.y, 6 + Math.random() * 4, 0, Math.PI * 2);
          ctx.fill();
        }
        return item.y < this.canvasH + 30;
      });

      if (this.teclasPressionadas['ArrowLeft'] || this.teclasPressionadas['a'] || this.teclasPressionadas['A']) naveX -= 3;
      if (this.teclasPressionadas['ArrowRight'] || this.teclasPressionadas['d'] || this.teclasPressionadas['D']) naveX += 3;
      if (this.teclasPressionadas['ArrowUp'] || this.teclasPressionadas['w'] || this.teclasPressionadas['W']) naveY -= 3;
      if (this.teclasPressionadas['ArrowDown'] || this.teclasPressionadas['s'] || this.teclasPressionadas['S']) naveY += 3;
      naveX = Math.max(12, Math.min(this.canvasW - 12, naveX));
      naveY = Math.max(12, Math.min(this.canvasH - 12, naveY));

      for (let i = itens.length - 1; i >= 0; i--) {
        const item = itens[i];
        const dx = naveX - item.x;
        const dy = naveY - item.y;
        if (Math.sqrt(dx * dx + dy * dy) < 18) {
          if (item.tipo === 'cristal') { coletados++; itens.splice(i, 1); }
          else { ativo = false; this.finalizarJogo(container, false, 'Detritos gelados danificaram sua nave!'); return; }
        }
      }

      ctx.fillStyle = '#4488ff';
      ctx.shadowColor = '#4488ff';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(naveX, naveY, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#88ccff';
      ctx.beginPath();
      ctx.arc(naveX, naveY, 6, 0, Math.PI * 2);
      ctx.fill();

      this.desenharHUD(ctx, `⏱ ${Math.ceil(tempoRestante)}s`, `❄️ ${coletados}`);
      ctx.fillStyle = '#8899bb';
      ctx.font = '11px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(this.dicaControles('WASD mover | ❄️ cristal (colete) | detritos (evite)', 'Toque direcional | ❄️ colete | detritos evite'), 200, this.canvasH - 8);

      if (tempoRestante <= 0) {
        ativo = false;
        this.finalizarJogo(container, coletados >= 10, coletados >= 10 ? `Coletou ${coletados} cristais!` : `Só ${coletados} cristais. Precisa de 10!`);
        return;
      }
      tempoRestante -= 1 / 60;
      this.animacaoId = requestAnimationFrame(loop);
    };
    loop();
  },

  // --- PLUTO MINER ---
  jogoPlutoMiner(desafio, area, container) {
    const ctx = this.criarCanvas(area);
    let naveX = 200, naveY = 350;
    let cristais = [];
    let tempoRestante = desafio.duracao;
    let ativo = true;
    let minerados = 0;

    const loop = () => {
      if (!ativo) return;
      this.desenharBackground(ctx, '#0a0a14', '#05050f');

      ctx.fillStyle = '#889';
      ctx.fillRect(0, this.canvasH - 40, this.canvasW, 40);
      ctx.fillStyle = '#667';
      for (let i = 0; i < this.canvasW; i += 12) {
        ctx.fillRect(i, this.canvasH - 40, 6, 3 + Math.random() * 4);
      }

      if (Math.random() < 0.04) {
        if (Math.random() < 0.5) {
          cristais.push({
            x: Math.random() * (this.canvasW - 16) + 8,
            y: -16,
            tipo: 'cristal',
            vy: 0.8 + Math.random() * 1.2
          });
        } else {
          cristais.push({
            x: Math.random() * (this.canvasW - 40) + 20,
            y: this.canvasH - 44,
            tipo: 'cristal',
            vy: -(0.3 + Math.random() * 0.5)
          });
        }
      }

      if (Math.random() < 0.02) {
        cristais.push({
          x: Math.random() > 0.5 ? -20 : this.canvasW + 20,
          y: Math.random() * (this.canvasH - 80) + 40,
          tipo: 'meteoro',
          vx: Math.random() > 0.5 ? 2 + Math.random() * 2 : -(2 + Math.random() * 2),
          vy: 0.5 + Math.random() * 1
        });
      }

      cristais = cristais.filter(c => {
        if (c.vy !== undefined) c.y += c.vy;
        if (c.vx !== undefined) c.x += c.vx;
        ctx.fillStyle = c.tipo === 'cristal' ? '#CDB38C' : '#ff4444';
        ctx.shadowColor = c.tipo === 'cristal' ? '#CDB38C' : '#ff4444';
        ctx.shadowBlur = c.tipo === 'cristal' ? 8 : 5;
        ctx.beginPath();
        if (c.tipo === 'cristal') {
          ctx.moveTo(c.x, c.y - 8);
          ctx.lineTo(c.x + 5, c.y + 2);
          ctx.lineTo(c.x, c.y);
          ctx.lineTo(c.x - 5, c.y + 2);
          ctx.closePath();
        } else {
          ctx.arc(c.x, c.y, 8, 0, Math.PI * 2);
        }
        ctx.fill();
        ctx.shadowBlur = 0;
        return c.x > -30 && c.x < this.canvasW + 30 && c.y > -30 && c.y < this.canvasH + 30;
      });

      if (this.teclasPressionadas['ArrowLeft'] || this.teclasPressionadas['a'] || this.teclasPressionadas['A']) naveX -= 3;
      if (this.teclasPressionadas['ArrowRight'] || this.teclasPressionadas['d'] || this.teclasPressionadas['D']) naveX += 3;
      if (this.teclasPressionadas['ArrowUp'] || this.teclasPressionadas['w'] || this.teclasPressionadas['W']) naveY -= 3;
      if (this.teclasPressionadas['ArrowDown'] || this.teclasPressionadas['s'] || this.teclasPressionadas['S']) naveY += 3;
      naveX = Math.max(12, Math.min(this.canvasW - 12, naveX));
      naveY = Math.max(12, Math.min(this.canvasH - 12, naveY));

      for (let i = cristais.length - 1; i >= 0; i--) {
        const c = cristais[i];
        const dx = naveX - c.x;
        const dy = naveY - c.y;
        if (Math.sqrt(dx * dx + dy * dy) < 18) {
          if (c.tipo === 'cristal') { minerados++; cristais.splice(i, 1); }
          else { ativo = false; this.finalizarJogo(container, false, 'Meteoro atingiu sua nave!'); return; }
        }
      }

      ctx.fillStyle = '#4488ff';
      ctx.shadowColor = '#4488ff';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(naveX, naveY, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#88ccff';
      ctx.beginPath();
      ctx.arc(naveX, naveY, 6, 0, Math.PI * 2);
      ctx.fill();

      this.desenharHUD(ctx, `⏱ ${Math.ceil(tempoRestante)}s`, `💎 ${minerados}`);
      ctx.fillStyle = '#8899bb';
      ctx.font = '11px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(this.dicaControles('WASD mover | 💎 cristais | 🔴 meteoros (evite)', 'Toque direcional | 💎 colete | 🔴 evite'), 200, this.canvasH - 8);

      if (tempoRestante <= 0) {
        ativo = false;
        this.finalizarJogo(container, minerados >= 12, minerados >= 12 ? `Minerou ${minerados} cristais em Plutão!` : `Só ${minerados} cristais. Precisa de 12!`);
        return;
      }
      tempoRestante -= 1 / 60;
      this.animacaoId = requestAnimationFrame(loop);
    };
    loop();
  },

  // --- POUSO LUNAR (improved arcade) ---
  jogoPousoLunar(desafio, area, container) {
    const ctx = this.criarCanvas(area);
    const canvas = area.querySelector('canvas');
    canvas.tabIndex = 0;
    canvas.focus();

    let nave = { x: 200, y: 50, vy: 0, vx: 0 };
    let combustivel = desafio.combustivel;
    let ativo = true;
    const soloY = 460;
    const shipHalfW = 12;
    const shipFeet = 15;
    const padX = 120;
    const padW = 160;
    const potenciaMotor = 0.38;
    const maxVyPouso = 4;
    const maxVxPouso = 2.5;

    const estaSobrePad = () => {
      const esq = nave.x - shipHalfW;
      const dir = nave.x + shipHalfW;
      return dir > padX && esq < padX + padW;
    };

    const velocidadeSegura = () =>
      Math.abs(nave.vy) <= maxVyPouso && Math.abs(nave.vx) <= maxVxPouso;

    const loop = () => {
      if (!ativo) return;
      this.desenharBackground(ctx, '#0a0a2e', '#050518');

      ctx.fillStyle = '#666';
      ctx.fillRect(0, soloY, this.canvasW, this.canvasH - soloY);
      ctx.fillStyle = 'rgba(80, 200, 120, 0.3)';
      ctx.fillRect(padX, soloY - 4, padW, this.canvasH - soloY + 4);
      ctx.strokeStyle = 'rgba(80, 200, 120, 0.9)';
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 4]);
      ctx.strokeRect(padX, soloY - 2, padW, 10);
      ctx.setLineDash([]);
      ctx.fillStyle = 'rgba(80, 200, 120, 0.85)';
      ctx.font = 'bold 11px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('POUSO', padX + padW / 2, soloY - 8);
      ctx.fillStyle = '#888';
      for (let i = 0; i < this.canvasW; i += 15) {
        ctx.beginPath();
        ctx.arc(i, soloY, 3 + Math.random() * 3, Math.PI, 0);
        ctx.fill();
      }

      const acelerando = (this.teclasPressionadas['ArrowUp'] || this.teclasPressionadas['w'] || this.teclasPressionadas['W']) && combustivel > 0;
      if (acelerando) { nave.vy -= potenciaMotor; combustivel -= 0.4; }
      if (this.teclasPressionadas['ArrowLeft'] && combustivel > 0) { nave.vx -= 0.08; combustivel -= 0.15; }
      if (this.teclasPressionadas['ArrowRight'] && combustivel > 0) { nave.vx += 0.08; combustivel -= 0.15; }
      if (this.teclasPressionadas['ArrowDown'] && combustivel > 0) { nave.vy += 0.06; combustivel -= 0.25; }

      nave.vy += desafio.gravidade;
      nave.vx *= 0.98;
      nave.x += nave.vx;
      nave.y += nave.vy;
      nave.x = Math.max(20, Math.min(this.canvasW - 20, nave.x));

      ctx.save();
      ctx.translate(nave.x, nave.y);
      const ang = Math.atan2(nave.vx, -nave.vy) * 0.3;
      ctx.rotate(ang);
      ctx.shadowColor = '#4488ff';
      ctx.shadowBlur = 15;
      ctx.fillStyle = '#e0e0e0';
      ctx.beginPath(); ctx.moveTo(0, 15); ctx.lineTo(-12, -12); ctx.lineTo(12, -12); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#4488ff'; ctx.fillRect(-2, 15, 4, 6);
      ctx.shadowBlur = 0;
      if (acelerando) {
        ctx.fillStyle = '#ff8800'; ctx.shadowColor = '#ff8800'; ctx.shadowBlur = 10;
        ctx.beginPath(); ctx.moveTo(-6, 24); ctx.lineTo(0, 40); ctx.lineTo(6, 24); ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#ffcc00'; ctx.shadowBlur = 5;
        ctx.beginPath(); ctx.moveTo(-3, 24); ctx.lineTo(0, 33); ctx.lineTo(3, 24); ctx.closePath(); ctx.fill();
      }
      ctx.restore();

      const tocouSolo = nave.y + shipFeet >= soloY;
      if (tocouSolo) {
        ativo = false;
        nave.y = soloY - shipFeet;
        const noPad = estaSobrePad();
        const velOk = velocidadeSegura();
        if (noPad && velOk) {
          this.finalizarJogo(container, true, `Pouso lunar concluído! Velocidade: ${Math.abs(nave.vy).toFixed(1)}`);
        } else if (noPad && !velOk) {
          this.finalizarJogo(container, false,
            `Você acertou a plataforma, mas pousou rápido demais (${Math.abs(nave.vy).toFixed(1)}). Segure ↑ para frear antes de tocar o solo.`);
        } else if (!noPad && velOk) {
          this.finalizarJogo(container, false,
            'Velocidade ok, mas a nave ficou fora da área verde. Use ← → para alinhar antes de pousar.');
        } else {
          this.finalizarJogo(container, false,
            `Fora da plataforma e velocidade alta (${Math.abs(nave.vy).toFixed(1)}). Freie com ↑ e alinhe na área verde.`);
        }
        return;
      }

      const velCor = velocidadeSegura() ? '#6f6' : (Math.abs(nave.vy) <= maxVyPouso + 1.5 ? '#fc6' : '#f66');
      const padCor = estaSobrePad() ? '#6f6' : '#f96';
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 14px monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`⬇ ${Math.abs(nave.vy).toFixed(1)} / ${maxVyPouso}`, 10, 22);
      ctx.textAlign = 'right';
      ctx.fillText(`⛽ ${Math.max(0, combustivel).toFixed(0)}%`, this.canvasW - 10, 22);
      ctx.textAlign = 'left';
      ctx.font = '12px monospace';
      ctx.fillStyle = velCor;
      ctx.fillText(velocidadeSegura() ? '✓ Velocidade segura' : '⚠ Freie com ↑', 10, 42);
      ctx.fillStyle = padCor;
      ctx.fillText(estaSobrePad() ? '✓ Sobre a plataforma' : '← → Alinhe na área verde', 10, 58);
      ctx.fillStyle = '#8899bb';
      ctx.font = '11px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(this.dicaControles('↑ frear  ← → mover  ↓ descer', 'Toque ↑ frear  ← → mover  ↓ descer'), this.canvasW / 2, this.canvasH - 8);

      this.animacaoId = requestAnimationFrame(loop);
    };
    loop();
  },

  // --- CAÇA METEOROS MARTE (tiro) ---
  jogoCliqueMeteoros(desafio, area, container) {
    const ctx = this.criarCanvas(area);
    const canvas = area.querySelector('canvas');
    let coletados = 0;
    const total = desafio.totalMeteoros;
    let ativo = true;
    let tempoRestante = desafio.duracao;
    let meteoros = [];
    let tiros = [];
    let spawnTimer = 0;
    const nave = { x: this.canvasW / 2, y: this.canvasH - 36 };
    const velTiro = 16;
    const raioTiro = 6;

    const disparar = (alvoX, alvoY) => {
      if (!ativo) return;
      const ang = Math.atan2(alvoY - nave.y, alvoX - nave.x);
      tiros.push({
        x: nave.x,
        y: nave.y,
        vx: Math.cos(ang) * velTiro,
        vy: Math.sin(ang) * velTiro
      });
    };

    this.configurarToqueCanvas(canvas, disparar);

    const loop = () => {
      if (!ativo) return;
      spawnTimer++;
      if (spawnTimer >= 55) {
        spawnTimer = 0;
        meteoros.push({
          x: 30 + Math.random() * (this.canvasW - 60),
          y: -25,
          vy: 0.55 + Math.random() * 0.45,
          r: 16 + Math.random() * 8,
          bom: Math.random() < 0.62
        });
      }

      this.desenharBackground(ctx, '#1a0808', '#0a0404');

      ctx.fillStyle = '#6b2d0f';
      ctx.fillRect(0, this.canvasH - 28, this.canvasW, 28);
      ctx.fillStyle = '#8b4513';
      for (let i = 0; i < this.canvasW; i += 22) {
        ctx.beginPath();
        ctx.arc(i + 4, this.canvasH - 14, 3, 0, Math.PI * 2);
        ctx.fill();
      }

      tiros = tiros.filter(t => {
        t.x += t.vx;
        t.y += t.vy;
        if (t.x < -10 || t.x > this.canvasW + 10 || t.y < -10 || t.y > this.canvasH + 10) return false;

        ctx.strokeStyle = '#88ddff';
        ctx.lineWidth = 3;
        ctx.shadowColor = '#4488ff';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.moveTo(t.x - t.vx * 0.6, t.y - t.vy * 0.6);
        ctx.lineTo(t.x, t.y);
        ctx.stroke();
        ctx.shadowBlur = 0;

        for (let i = meteoros.length - 1; i >= 0; i--) {
          const m = meteoros[i];
          const dx = t.x - m.x;
          const dy = t.y - m.y;
          if (Math.sqrt(dx * dx + dy * dy) < m.r + raioTiro) {
            if (m.bom) {
              coletados++;
              if (coletados >= total) {
                ativo = false;
                this.finalizarJogo(container, true, `Todos os ${total} meteoros abatidos!`);
                return false;
              }
            }
            meteoros.splice(i, 1);
            return false;
          }
        }
        return true;
      });

      meteoros = meteoros.filter(m => {
        m.y += m.vy;
        if (m.y - m.r > this.canvasH - 28) {
          if (m.bom && ativo) {
            ativo = false;
            this.finalizarJogo(container, false, 'Um meteoro caiu em Marte!');
          }
          return false;
        }

        const grad = ctx.createRadialGradient(m.x, m.y, 2, m.x, m.y, m.r);
        if (m.bom) {
          grad.addColorStop(0, '#fff');
          grad.addColorStop(0.4, '#ffaa44');
          grad.addColorStop(1, '#aa4400');
        } else {
          grad.addColorStop(0, '#fff');
          grad.addColorStop(0.4, '#ff6644');
          grad.addColorStop(1, '#661100');
        }
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2);
        ctx.fill();

        ctx.font = `${Math.round(m.r * 1.1)}px serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(m.bom ? '☄️' : '💥', m.x, m.y);
        return true;
      });

      ctx.fillStyle = '#4488ff';
      ctx.shadowColor = '#4488ff';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.moveTo(nave.x, nave.y - 16);
      ctx.lineTo(nave.x - 14, nave.y + 10);
      ctx.lineTo(nave.x + 14, nave.y + 10);
      ctx.closePath();
      ctx.fill();
      ctx.shadowBlur = 0;

      ctx.fillStyle = '#fff';
      ctx.font = 'bold 14px monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`☄️ ${coletados}/${total}`, 10, 22);
      ctx.textAlign = 'center';
      ctx.fillText(`⏱ ${Math.ceil(tempoRestante)}s`, this.canvasW / 2, 22);
      ctx.fillStyle = '#8899bb';
      ctx.font = '11px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(this.dicaControles('Clique para disparar | Abata os meteoros ☄️', 'Toque na tela para disparar ☄️'), this.canvasW / 2, this.canvasH - 8);

      tempoRestante -= 1 / 60;
      if (tempoRestante <= 0) {
        ativo = false;
        this.finalizarJogo(container, false, 'Tempo esgotado!');
        return;
      }

      this.animacaoId = requestAnimationFrame(loop);
    };
    loop();
  },

  // --- DESVIO METEOROS (improved) ---
  jogoDesvioMeteoros(desafio, area, container) {
    const ctx = this.criarCanvas(area);
    let naveX = 200, tempoRestante = desafio.duracao;
    let obstaculos = [], ativo = true, frame = 0;

    const loop = () => {
      if (!ativo) return;
      frame++;
      this.desenharBackground(ctx, '#0a0a1a', '#050510');

      ctx.fillStyle = '#1a3a5c';
      ctx.fillRect(0, this.canvasH - 30, this.canvasW, 30);
      ctx.fillStyle = '#2a5a8c';
      for (let i = 0; i < this.canvasW; i += 25) {
        ctx.beginPath(); ctx.arc(i + 5, this.canvasH - 15, 3, 0, Math.PI * 2); ctx.fill();
      }

      if (frame % Math.max(12, 35 - Math.floor(tempoRestante / 3)) === 0) {
        obstaculos.push({
          x: 20 + Math.random() * (this.canvasW - 40), y: -30,
          vy: 2 + Math.random() * (2 + (60 - tempoRestante) / 15),
          vx: (Math.random() - 0.5) * 1.5,
          tamanho: 12 + Math.random() * 15
        });
      }

      obstaculos = obstaculos.filter(o => {
        o.x += o.vx; o.y += o.vy;
        const grad = ctx.createRadialGradient(o.x, o.y, 2, o.x, o.y, o.tamanho);
        grad.addColorStop(0, '#ff8844'); grad.addColorStop(0.5, '#aa4422'); grad.addColorStop(1, '#441100');
        ctx.fillStyle = grad;
        ctx.beginPath(); ctx.arc(o.x, o.y, o.tamanho, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = 'rgba(255,136,68,0.2)';
        ctx.beginPath(); ctx.arc(o.x, o.y, o.tamanho * 1.3, 0, Math.PI * 2); ctx.fill();
        return o.y < this.canvasH + 40;
      });

      if (this.teclasPressionadas['ArrowLeft']) naveX -= 5;
      if (this.teclasPressionadas['ArrowRight']) naveX += 5;
      naveX = Math.max(18, Math.min(this.canvasW - 18, naveX));

      for (const o of obstaculos) {
        if (Math.sqrt((naveX - o.x) ** 2 + (430 - o.y) ** 2) < o.tamanho + 14) {
          ativo = false;
          this.finalizarJogo(container, false, 'Sua nave foi atingida!');
          return;
        }
      }

      ctx.fillStyle = '#4488ff';
      ctx.shadowColor = '#4488ff';
      ctx.shadowBlur = 12;
      ctx.beginPath(); ctx.moveTo(naveX, 430 - 18); ctx.lineTo(naveX - 12, 430 + 6); ctx.lineTo(naveX + 12, 430 + 6); ctx.closePath(); ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#88ccff';
      ctx.beginPath(); ctx.moveTo(naveX, 430 - 10); ctx.lineTo(naveX - 6, 430 + 3); ctx.lineTo(naveX + 6, 430 + 3); ctx.closePath(); ctx.fill();

      this.desenharHUD(ctx, `⏱ ${Math.ceil(tempoRestante)}s`, `☄️ ${obstaculos.length}`);
      ctx.fillStyle = '#8899bb';
      ctx.font = '11px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(this.dicaControles('← → para desviar', 'Toque ← → para desviar'), 200, this.canvasH - 5);

      if (tempoRestante <= 0) {
        ativo = false;
        this.finalizarJogo(container, true, 'Sobreviveu ao cinturão de meteoros! 🚀');
        return;
      }
      tempoRestante -= 1 / 60;
      this.animacaoId = requestAnimationFrame(loop);
    };
    loop();
  },

  // --- DESVIO TEMPESTADE (improved) ---
  jogoDesvioTempestade(desafio, area, container) {
    const ctx = this.criarCanvas(area);
    let naveX = 200;
    let naveY = 430;
    let tempoRestante = desafio.duracao;
    let tempestades = [], ativo = true;
    const minY = 160;
    const maxY = this.canvasH - 40;

    const loop = () => {
      if (!ativo) return;
      this.desenharBackground(ctx, '#1a0a2e', '#0f0520');

      ctx.shadowBlur = 40;
      ctx.shadowColor = '#8B0000';
      const gradSol = ctx.createRadialGradient(200, 80, 10, 200, 80, 60);
      gradSol.addColorStop(0, '#ff4444'); gradSol.addColorStop(0.5, '#8B0000'); gradSol.addColorStop(1, '#440000');
      ctx.fillStyle = gradSol;
      ctx.beginPath(); ctx.arc(200, 80, 60, 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 0;

      ctx.fillStyle = 'rgba(139,0,0,0.3)';
      ctx.beginPath(); ctx.arc(200 + Math.sin(Date.now()/800)*10, 80, 80, 0, Math.PI * 2); ctx.fill();

      if (Math.random() < 0.028) {
        const lado = Math.random() > 0.5 ? 1 : -1;
        tempestades.push({
          x: lado === 1 ? -20 : this.canvasW + 20,
          y: minY + Math.random() * (maxY - minY),
          vx: lado * (0.9 + Math.random() * 1.1),
          tamanho: 18 + Math.random() * 25
        });
      }

      tempestades = tempestades.filter(t => {
        t.x += t.vx;
        const grad = ctx.createRadialGradient(t.x, t.y, 2, t.x, t.y, t.tamanho);
        grad.addColorStop(0, 'rgba(150,0,200,0.8)'); grad.addColorStop(0.5, 'rgba(100,0,150,0.5)'); grad.addColorStop(1, 'rgba(50,0,100,0)');
        ctx.fillStyle = grad;
        ctx.beginPath(); ctx.arc(t.x, t.y, t.tamanho, 0, Math.PI * 2); ctx.fill();
        return t.x > -50 && t.x < this.canvasW + 50;
      });

      if (this.teclasPressionadas['ArrowLeft'] || this.teclasPressionadas['a'] || this.teclasPressionadas['A']) naveX -= 4;
      if (this.teclasPressionadas['ArrowRight'] || this.teclasPressionadas['d'] || this.teclasPressionadas['D']) naveX += 4;
      if (this.teclasPressionadas['ArrowUp'] || this.teclasPressionadas['w'] || this.teclasPressionadas['W']) naveY -= 4;
      if (this.teclasPressionadas['ArrowDown'] || this.teclasPressionadas['s'] || this.teclasPressionadas['S']) naveY += 4;
      naveX = Math.max(15, Math.min(this.canvasW - 15, naveX));
      naveY = Math.max(minY, Math.min(maxY, naveY));

      for (const t of tempestades) {
        if (Math.sqrt((naveX - t.x) ** 2 + (naveY - t.y) ** 2) < t.tamanho + 15) {
          ativo = false;
          this.finalizarJogo(container, false, 'Atingido por tempestade!');
          return;
        }
      }

      ctx.fillStyle = '#4488ff';
      ctx.shadowColor = '#4488ff';
      ctx.shadowBlur = 12;
      ctx.beginPath(); ctx.moveTo(naveX, naveY - 15); ctx.lineTo(naveX - 10, naveY + 5); ctx.lineTo(naveX + 10, naveY + 5); ctx.closePath(); ctx.fill();
      ctx.shadowBlur = 0;

      this.desenharHUD(ctx, `⏱ ${Math.ceil(tempoRestante)}s`, `🌪️ ${tempestades.length}`);
      ctx.fillStyle = '#8899bb';
      ctx.font = '11px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(this.dicaControles('← → lados  ↑ ↓ frente/trás  |  Desvie da Grande Mancha Vermelha', 'Toque direcional | Desvie da tempestade'), this.canvasW / 2, this.canvasH - 8);

      if (tempoRestante <= 0) {
        ativo = false;
        this.finalizarJogo(container, true, 'Sobreviveu à Grande Mancha Vermelha!');
        return;
      }
      tempoRestante -= 1 / 60;
      this.animacaoId = requestAnimationFrame(loop);
    };
    loop();
  },

  // --- FUGA VENTOS (improved) ---
  jogoFugaVentos(desafio, area, container) {
    const ctx = this.criarCanvas(area);
    let naveX = 200, naveY = 250, tempoRestante = desafio.duracao;
    let ventos = [], ativo = true;
    const tempoTotal = desafio.duracao;
    const margem = 20;

    const loop = () => {
      if (!ativo) return;
      this.desenharBackground(ctx, '#0a0a2e', '#050520');

      const tempoDecorrido = tempoTotal - tempoRestante;
      const taxaSpawn = tempoDecorrido < 4 ? 0 : (tempoDecorrido < 10 ? 0.018 : 0.028);

      ctx.strokeStyle = 'rgba(255, 80, 80, 0.25)';
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 6]);
      ctx.strokeRect(margem, margem, this.canvasW - margem * 2, this.canvasH - margem * 2);
      ctx.setLineDash([]);

      if (Math.random() < taxaSpawn) {
        const angulos = [Math.PI, 0, -Math.PI / 2, Math.PI / 2];
        const ang = angulos[Math.floor(Math.random() * 4)];
        const vel = 1 + Math.random() * 1.2;
        ventos.push({
          x: naveX + Math.cos(ang) * 20,
          y: naveY + Math.sin(ang) * 20,
          vx: Math.cos(ang) * vel,
          vy: Math.sin(ang) * vel,
          vida: 55 + Math.random() * 35
        });
      }

      ventos = ventos.filter(v => {
        v.x += v.vx; v.y += v.vy; v.vida--;
        const alpha = Math.min(0.7, v.vida / 70);
        ctx.fillStyle = `rgba(100,200,255,${alpha})`;
        ctx.font = '20px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('💨', v.x, v.y);
        ctx.strokeStyle = `rgba(150,220,255,${alpha * 0.8})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(v.x - v.vx * 8, v.y - v.vy * 8);
        ctx.lineTo(v.x + v.vx * 14, v.y + v.vy * 14);
        ctx.stroke();
        const dx = naveX - v.x, dy = naveY - v.y;
        if (Math.sqrt(dx * dx + dy * dy) < 32) {
          naveX += v.vx * 1.2;
          naveY += v.vy * 1.2;
        }
        return v.vida > 0;
      });

      const esq = this.teclasPressionadas['ArrowLeft'] || this.teclasPressionadas['a'] || this.teclasPressionadas['A'];
      const dir = this.teclasPressionadas['ArrowRight'] || this.teclasPressionadas['d'] || this.teclasPressionadas['D'];
      const cima = this.teclasPressionadas['ArrowUp'] || this.teclasPressionadas['w'] || this.teclasPressionadas['W'];
      const baixo = this.teclasPressionadas['ArrowDown'] || this.teclasPressionadas['s'] || this.teclasPressionadas['S'];
      if (cima) naveY -= 4.5;
      if (baixo) naveY += 4.5;
      if (esq) naveX -= 4.5;
      if (dir) naveX += 4.5;

      if (naveX < margem || naveX > this.canvasW - margem || naveY < margem || naveY > this.canvasH - margem) {
        ativo = false;
        this.finalizarJogo(container, false, 'Os ventos empurraram sua nave para fora da zona segura!');
        return;
      }
      naveX = Math.max(margem, Math.min(this.canvasW - margem, naveX));
      naveY = Math.max(margem, Math.min(this.canvasH - margem, naveY));

      ctx.fillStyle = '#4488ff';
      ctx.shadowColor = '#4488ff';
      ctx.shadowBlur = 12;
      ctx.beginPath(); ctx.moveTo(naveX, naveY - 15); ctx.lineTo(naveX - 10, naveY + 8); ctx.lineTo(naveX + 10, naveY + 8); ctx.closePath(); ctx.fill();
      ctx.shadowBlur = 0;

      this.desenharHUD(ctx, `⏱ ${Math.ceil(tempoRestante)}s`, `💨 ${ventos.length}`);
      ctx.fillStyle = '#8899bb';
      ctx.font = '11px monospace';
      ctx.textAlign = 'center';
      if (tempoDecorrido < 4) {
        ctx.fillStyle = '#aad4ff';
        ctx.fillText('Prepare-se! Os ventos de Netuno vão começar em instantes…', this.canvasW / 2, this.canvasH - 8);
      } else {
        ctx.fillText(this.dicaControles('WASD / setas — mantenha a nave dentro da área tracejada', 'Toque direcional — mantenha a nave na área tracejada'), this.canvasW / 2, this.canvasH - 8);
      }

      if (tempoRestante <= 0) {
        ativo = false;
        this.finalizarJogo(container, true, 'Sobreviveu aos ventos de Netuno!');
        return;
      }
      tempoRestante -= 1 / 60;
      this.animacaoId = requestAnimationFrame(loop);
    };
    loop();
  }
};
