const Jogos = {
  jogoAtivo: null,
  animacaoId: null,
  teclasPressionadas: {},
  _onResultado: null,

  init() {
    document.addEventListener('keydown', (e) => {
      this.teclasPressionadas[e.key] = true;
    });
    document.addEventListener('keyup', (e) => {
      this.teclasPressionadas[e.key] = false;
    });
  },

  setCallback(fn) {
    this._onResultado = fn;
  },

  async jogar(planeta, container) {
    this.pararJogo();
    container.innerHTML = '';
    container.style.display = 'block';
    const desafio = planeta.desafio;
    if (!desafio) return;

    const titulo = document.createElement('h3');
    titulo.className = 'desafio-titulo';
    titulo.textContent = `🎮 ${desafio.nome}`;
    container.appendChild(titulo);

    const desc = document.createElement('p');
    desc.className = 'desafio-descricao';
    desc.textContent = desafio.descricao;
    container.appendChild(desc);

    const areaJogo = document.createElement('div');
    areaJogo.className = 'area-jogo';
    container.appendChild(areaJogo);

    switch (desafio.tipo) {
      case 'quiz': await this.jogoQuiz(desafio, areaJogo, container); break;
      case 'clickRace': this.jogoClickRace(desafio, areaJogo, container); break;
      case 'ordenacao': this.jogoOrdenacao(desafio, areaJogo, container); break;
      case 'pousoLunar': this.jogoPousoLunar(desafio, areaJogo, container); break;
      case 'cliqueMeteoros': this.jogoCliqueMeteoros(desafio, areaJogo, container); break;
      case 'desvioTempestade': this.jogoDesvioTempestade(desafio, areaJogo, container); break;
      case 'montarAneis': this.jogoMontarAneis(desafio, areaJogo, container); break;
      case 'inclinacao': this.jogoInclinacao(desafio, areaJogo, container); break;
      case 'fugaVentos': this.jogoFugaVentos(desafio, areaJogo, container); break;
      case 'desvioMeteoros': this.jogoDesvioMeteoros(desafio, areaJogo, container); break;
      default: areaJogo.innerHTML = '<p>Jogo em desenvolvimento...</p>';
    }
  },

  finalizarJogo(container, venceu, mensagem) {
    const overlay = document.createElement('div');
    overlay.className = `jogo-resultado ${venceu ? 'vitoria' : 'derrota'}`;
    overlay.innerHTML = `
      <div class="jogo-resultado-conteudo">
        <div class="jogo-resultado-emoji">${venceu ? '🎉' : '💫'}</div>
        <h3>${venceu ? 'Missão Cumprida!' : 'Tente Novamente!'}</h3>
        <p>${mensagem}</p>
        <button class="btn-jogo" onclick="this.closest('.jogo-resultado').remove()">Continuar</button>
      </div>
    `;
    container.appendChild(overlay);
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
    this.jogoAtivo = null;
  },

  async jogoQuiz(desafio, area, container) {
    let perguntaAtual = 0;
    let acertos = 0;

    const mostrarPergunta = () => {
      if (perguntaAtual >= desafio.perguntas.length) {
        const venceu = acertos >= Math.ceil(desafio.perguntas.length * 0.7);
        this.finalizarJogo(container, venceu,
          venceu ? `Você acertou ${acertos} de ${desafio.perguntas.length}!` :
          `Você acertou apenas ${acertos} de ${desafio.perguntas.length}. Tente novamente!`
        );
        return;
      }

      const q = desafio.perguntas[perguntaAtual];
      area.innerHTML = `
        <div class="quiz-container">
          <div class="quiz-progresso">Pergunta ${perguntaAtual + 1}/${desafio.perguntas.length}</div>
          <div class="quiz-pergunta">${q.pergunta}</div>
          <div class="quiz-opcoes">
            ${q.opcoes.map((op, i) => `<button class="quiz-btn" data-index="${i}">${op}</button>`).join('')}
          </div>
        </div>
      `;

      area.querySelectorAll('.quiz-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const idx = parseInt(btn.dataset.index);
          if (idx === q.correta) {
            acertos++;
            btn.classList.add('correta');
          } else {
            btn.classList.add('errada');
            area.querySelector(`[data-index="${q.correta}"]`).classList.add('correta');
          }
          area.querySelectorAll('.quiz-btn').forEach(b => b.disabled = true);
          setTimeout(() => { perguntaAtual++; mostrarPergunta(); }, 1500);
        });
      });
    };
    mostrarPergunta();
  },

  jogoClickRace(desafio, area, container) {
    let cliques = 0;
    let tempoRestante = desafio.duracao;
    let ativo = true;

    area.innerHTML = `
      <div class="clickRace-container">
        <div class="clickRace-info">
          <span>Tempo: <strong id="clickRace-tempo">${tempoRestante}s</strong></span>
          <span>Cliques: <strong id="clickRace-cliques">0</strong></span>
          <span>Meta: <strong>${desafio.meta}</strong></span>
        </div>
        <div class="clickRace-botao" id="clickRace-btn">
          🖱️ CLIQUE AQUI!
        </div>
      </div>
    `;

    const btn = document.getElementById('clickRace-btn');
    const tempoEl = document.getElementById('clickRace-tempo');
    const cliquesEl = document.getElementById('clickRace-cliques');

    btn.addEventListener('click', () => {
      if (!ativo) return;
      cliques++;
      cliquesEl.textContent = cliques;
      btn.style.transform = 'scale(0.95)';
      setTimeout(() => btn.style.transform = 'scale(1)', 50);
    });

    const intervalo = setInterval(() => {
      tempoRestante--;
      tempoEl.textContent = `${tempoRestante}s`;
      if (tempoRestante <= 0) {
        clearInterval(intervalo);
        ativo = false;
        btn.style.pointerEvents = 'none';
        const venceu = cliques >= desafio.meta;
        this.finalizarJogo(container, venceu,
          venceu ? `Incrível! Você clicou ${cliques} vezes! Mercúrio ficaria orgulhoso!` :
          `Você clicou ${cliques} vezes. Precisava de ${desafio.meta}. Tente novamente!`
        );
      }
    }, 1000);
  },

  jogoOrdenacao(desafio, area, container) {
    const embaralhar = (arr) => {
      const a = [...arr];
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
      }
      return a;
    };

    const sorted = [...desafio.itens].sort((a, b) => a.valor - b.valor);
    let items = embaralhar(desafio.itens);
    let arrastando = null;

    area.innerHTML = `
      <div class="ordenacao-container">
        <p class="ordenacao-instrucao">Arraste os itens para ordenar do <strong>mais frio</strong> para o <strong>mais quente</strong>:</p>
        <div class="ordenacao-lista" id="ordenacao-lista"></div>
        <button class="btn-jogo" id="ordenacao-verificar">Verificar</button>
      </div>
    `;

    const lista = document.getElementById('ordenacao-lista');

    const renderizar = () => {
      lista.innerHTML = '';
      items.forEach((item, idx) => {
        const div = document.createElement('div');
        div.className = `ordenacao-item ${arrastando === idx ? 'arrastando' : ''}`;
        div.draggable = true;
        div.innerHTML = `
          <span class="ordenacao-pos">${idx + 1}.</span>
          <span>${item.nome}</span>
          <span class="ordenacao-temp">${item.valor}°C</span>
        `;

        div.addEventListener('dragstart', (e) => {
          arrastando = idx;
          div.classList.add('arrastando');
          e.dataTransfer.effectAllowed = 'move';
        });

        div.addEventListener('dragend', () => {
          arrastando = null;
          document.querySelectorAll('.ordenacao-item').forEach(d => d.classList.remove('arrastando'));
        });

        div.addEventListener('dragover', (e) => {
          e.preventDefault();
          if (arrastando !== null && arrastando !== idx) {
            document.querySelectorAll('.ordenacao-item')[idx]?.classList.add('drag-over');
          }
        });

        div.addEventListener('dragleave', () => {
          div.classList.remove('drag-over');
        });

        div.addEventListener('drop', (e) => {
          e.preventDefault();
          div.classList.remove('drag-over');
          if (arrastando !== null && arrastando !== idx) {
            [items[arrastando], items[idx]] = [items[idx], items[arrastando]];
            arrastando = null;
            renderizar();
          }
        });

        lista.appendChild(div);
      });
    };
    renderizar();

    document.getElementById('ordenacao-verificar').addEventListener('click', () => {
      const correto = items.every((item, idx) => item.nome === sorted[idx].nome);
      this.finalizarJogo(container, correto,
        correto ? 'Perfeito! A ordem está correta!' :
        'A ordem não está correta. Lembre-se: do mais frio para o mais quente!'
      );
    });
  },

  jogoPousoLunar(desafio, area, container) {
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 500;
    canvas.className = 'pouso-canvas';
    area.appendChild(canvas);
    const ctx = canvas.getContext('2d');

    let nave = { x: 200, y: 50, vy: 0, vx: 0 };
    let combustivel = desafio.combustivel;
    let pousou = false;
    let falhou = false;

    const soloY = 460;
    const gravidade = desafio.gravidade;

    const loop = () => {
      if (pousou || falhou) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#1a1a2e';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const estrelas = [
        [50, 30], [120, 80], [300, 40], [350, 120], [80, 200],
        [320, 250], [150, 150], [250, 100], [380, 300], [30, 350]
      ];
      ctx.fillStyle = '#fff';
      estrelas.forEach(([x, y]) => {
        ctx.beginPath();
        ctx.arc(x, y, 1.5, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.fillStyle = '#888';
      ctx.fillRect(0, soloY, canvas.width, canvas.height - soloY);
      ctx.fillStyle = '#aaa';
      for (let i = 0; i < canvas.width; i += 20) {
        ctx.beginPath();
        ctx.arc(i, soloY, 2, 0, Math.PI);
        ctx.fill();
      }

      if (this.teclasPressionadas['ArrowUp'] && combustivel > 0) {
        nave.vy -= 0.15;
        combustivel -= 0.5;
      }
      if (this.teclasPressionadas['ArrowLeft'] && combustivel > 0) {
        nave.vx -= 0.1;
        combustivel -= 0.2;
      }
      if (this.teclasPressionadas['ArrowRight'] && combustivel > 0) {
        nave.vx += 0.1;
        combustivel -= 0.2;
      }
      if (this.teclasPressionadas['ArrowDown'] && combustivel > 0) {
        nave.vy += 0.1;
        combustivel -= 0.3;
      }

      nave.vy += gravidade;
      nave.x += nave.vx;
      nave.y += nave.vy;

      if (nave.x < 20) nave.x = 20;
      if (nave.x > 380) nave.x = 380;

      ctx.save();
      ctx.translate(nave.x, nave.y);

      ctx.fillStyle = '#e0e0e0';
      ctx.beginPath();
      ctx.moveTo(0, 15);
      ctx.lineTo(-12, -12);
      ctx.lineTo(12, -12);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#4488ff';
      ctx.fillRect(-2, 15, 4, 6);

      if (this.teclasPressionadas['ArrowUp'] && combustivel > 0) {
        ctx.fillStyle = '#ff8800';
        ctx.beginPath();
        ctx.moveTo(-6, 24);
        ctx.lineTo(0, 35);
        ctx.lineTo(6, 24);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#ffcc00';
        ctx.beginPath();
        ctx.moveTo(-3, 24);
        ctx.lineTo(0, 30);
        ctx.lineTo(3, 24);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();

      ctx.fillStyle = '#fff';
      ctx.font = '14px monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`Velocidade: ${Math.abs(nave.vy).toFixed(1)}`, 10, 20);
      ctx.fillText(`Combustível: ${Math.max(0, combustivel).toFixed(0)}%`, 10, 40);

      ctx.textAlign = 'center';
      ctx.fillStyle = '#ffcc00';
      ctx.font = '12px monospace';
      ctx.fillText('↑ Acender   ← → Mover   ↓ Descer', 200, 490);

      if (nave.y >= soloY - 15) {
        nave.y = soloY - 15;
        if (Math.abs(nave.vy) > 2 || Math.abs(nave.vx) > 1) {
          falhou = true;
          this.finalizarJogo(container, false,
            `Pouso muito brusco! Velocidade: ${Math.abs(nave.vy).toFixed(1)}. Tente novamente!`
          );
        } else {
          pousou = true;
          this.finalizarJogo(container, true,
            `Pouso perfeito! Velocidade: ${Math.abs(nave.vy).toFixed(1)}. Missão cumprida!`
          );
        }
        return;
      }

      if (combustivel <= 0 && nave.vy > 3) {
        combustivel = 0;
      }

      this.animacaoId = requestAnimationFrame(loop);
    };

    loop();
  },

  jogoCliqueMeteoros(desafio, area, container) {
    let coletados = 0;
    let total = desafio.totalMeteoros;
    let ativo = true;

    area.innerHTML = `
      <div class="meteoros-container">
        <div class="meteoros-info">
          <span>Coletados: <strong id="meteoros-coletados">0</strong>/${total}</span>
        </div>
        <div class="meteoros-area" id="meteoros-area"></div>
      </div>
    `;

    const areaJogo = document.getElementById('meteoros-area');

    const criarMeteoro = () => {
      if (!ativo) return;
      const meteoro = document.createElement('div');
      meteoro.className = 'meteoro';
      const x = Math.random() * (areaJogo.clientWidth - 40);
      meteoro.style.left = `${x}px`;
      meteoro.style.top = '-40px';
      meteoro.textContent = '☄️';
      meteoro.style.fontSize = `${20 + Math.random() * 20}px`;

      meteoro.addEventListener('click', () => {
        if (!ativo) return;
        coletados++;
        document.getElementById('meteoros-coletados').textContent = coletados;
        meteoro.remove();
        if (coletados >= total) {
          ativo = false;
          this.finalizarJogo(container, true, 'Todos os meteoros coletados! Marte está salvo!');
        }
      });

      areaJogo.appendChild(meteoro);

      let y = -40;
      const vel = 1.5 + Math.random() * 2;
      const cair = setInterval(() => {
        y += vel;
        meteoro.style.top = `${y}px`;
        if (y > areaJogo.clientHeight + 40) {
          clearInterval(cair);
          meteoro.remove();
          if (ativo) {
            ativo = false;
            this.finalizarJogo(container, false, 'Um meteoro caiu em Marte! Tente novamente!');
          }
        }
      }, 30);
    };

    const intervalo = setInterval(() => {
      if (!ativo) { clearInterval(intervalo); return; }
      criarMeteoro();
    }, 800);

    setTimeout(() => {
      if (ativo && coletados < total) {
        ativo = false;
        clearInterval(intervalo);
        this.finalizarJogo(container, false, 'O tempo acabou! Tente novamente!');
      }
    }, desafio.duracao * 1000);
  },

  jogoDesvioTempestade(desafio, area, container) {
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 500;
    canvas.className = 'tempestade-canvas';
    area.appendChild(canvas);
    const ctx = canvas.getContext('2d');

    let naveX = 200;
    let naveY = 430;
    let tempoRestante = desafio.duracao;
    let tempestades = [];
    let ativo = true;

    const loop = () => {
      if (!ativo) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#1a0a2e';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < 50; i++) {
        ctx.fillStyle = `rgba(255,255,255,${0.3 + Math.random() * 0.7})`;
        ctx.beginPath();
        ctx.arc(Math.random() * canvas.width, Math.random() * canvas.height, Math.random() * 2, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.fillStyle = '#8B0000';
      ctx.beginPath();
      ctx.arc(200, 80, 60, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#CC0000';
      ctx.beginPath();
      ctx.arc(200, 80, 40, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#FF0000';
      ctx.beginPath();
      ctx.arc(200, 80, 20, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = 'rgba(139, 0, 0, 0.3)';
      ctx.beginPath();
      ctx.arc(200 + Math.sin(Date.now() / 1000) * 10, 80, 80, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ff4444';
      ctx.font = '14px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('GRANDE MANCHA VERMELHA', 200, 15);

      if (Math.random() < 0.03) {
        const lado = Math.random() > 0.5 ? 'left' : 'right';
        tempestades.push({
          x: lado === 'left' ? -20 : canvas.width + 20,
          y: 120 + Math.random() * 280,
          vx: lado === 'left' ? 1.5 + Math.random() * 2 : -(1.5 + Math.random() * 2),
          tamanho: 15 + Math.random() * 25
        });
      }

      tempestades = tempestades.filter(t => {
        t.x += t.vx;
        ctx.fillStyle = 'rgba(100, 0, 150, 0.7)';
        ctx.beginPath();
        ctx.arc(t.x, t.y, t.tamanho, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'rgba(150, 0, 200, 0.4)';
        ctx.beginPath();
        ctx.arc(t.x, t.y, t.tamanho * 1.5, 0, Math.PI * 2);
        ctx.fill();

        return t.x > -50 && t.x < canvas.width + 50;
      });

      if (this.teclasPressionadas['ArrowLeft']) naveX -= 4;
      if (this.teclasPressionadas['ArrowRight']) naveX += 4;
      naveX = Math.max(15, Math.min(canvas.width - 15, naveX));

      const colisao = tempestades.some(t => {
        const dx = naveX - t.x;
        const dy = naveY - t.y;
        return Math.sqrt(dx * dx + dy * dy) < t.tamanho + 15;
      });

      if (colisao) {
        ativo = false;
        this.finalizarJogo(container, false, 'Sua nave foi atingida por uma tempestade! Tente novamente!');
        return;
      }

      ctx.fillStyle = '#4488ff';
      ctx.beginPath();
      ctx.moveTo(naveX, naveY - 15);
      ctx.lineTo(naveX - 10, naveY + 5);
      ctx.lineTo(naveX + 10, naveY + 5);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#88ccff';
      ctx.beginPath();
      ctx.moveTo(naveX, naveY - 8);
      ctx.lineTo(naveX - 5, naveY + 3);
      ctx.lineTo(naveX + 5, naveY + 3);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#fff';
      ctx.font = '14px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`⏱ ${Math.ceil(tempoRestante)}s`, canvas.width / 2, canvas.height - 10);

      if (tempoRestante <= 0) {
        ativo = false;
        this.finalizarJogo(container, true, 'Você sobreviveu à Grande Mancha Vermelha! Impressionante!');
        return;
      }

      tempoRestante -= 1 / 60;
      this.animacaoId = requestAnimationFrame(loop);
    };
    loop();
  },

  jogoMontarAneis(desafio, area, container) {
    const sorted = [...desafio.itens].sort((a, b) => b.tamanho - a.tamanho);
    const items = [...desafio.itens];
    let slots = [];

    const shuffle = (arr) => {
      const a = [...arr];
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
      }
      return a;
    };

    let disponiveis = shuffle(items);
    slots = [];

    const render = () => {
      area.innerHTML = `
        <div class="aneis-container">
          <div class="aneis-area" id="aneis-area">
            <div class="aneis-planeta"></div>
            ${slots.map((s, i) => s ? `<div class="anel-colocado" style="width:${40 + s.tamanho * 20}px">${s.nome}</div>` : `<div class="anel-vazio" data-slot="${i}">?</div>`).join('')}
          </div>
          <div class="aneis-disponiveis" id="aneis-disponiveis">
            ${disponiveis.map((d, i) => `<div class="anel-item" data-item="${i}">${d.nome}</div>`).join('')}
          </div>
          <button class="btn-jogo" id="aneis-verificar">Verificar</button>
        </div>
      `;

      area.querySelectorAll('.anel-item').forEach(el => {
        el.addEventListener('click', () => {
          const idx = parseInt(el.dataset.item);
          const primeiroVazio = slots.findIndex(s => s === undefined);
          if (primeiroVazio === -1) return;
          slots[primeiroVazio] = disponiveis[idx];
          disponiveis.splice(idx, 1);
          render();
        });
      });

      area.querySelectorAll('.anel-vazio').forEach(el => {
        el.addEventListener('click', () => {
          const slotIdx = parseInt(el.dataset.slot);
          if (slots[slotIdx]) {
            disponiveis.push(slots[slotIdx]);
            slots[slotIdx] = undefined;
            render();
          }
        });
      });

      const btn = document.getElementById('aneis-verificar');
      if (btn) {
        btn.addEventListener('click', () => {
          if (slots.some(s => s === undefined)) {
            this.finalizarJogo(container, false, 'Você precisa colocar todos os anéis primeiro!');
            return;
          }
          const correto = slots.every((s, i) => s.nome === sorted[i].nome);
          this.finalizarJogo(container, correto,
            correto ? 'Anéis montados na ordem correta! Magnífico!' :
            'A ordem não está correta. Lembre-se: do maior para o menor!'
          );
        });
      }
    };
    render();
  },

  jogoInclinacao(desafio, area, container) {
    const canvas = document.createElement('canvas');
    canvas.width = 300;
    canvas.height = 400;
    canvas.className = 'inclinacao-canvas';
    area.appendChild(canvas);
    const ctx = canvas.getContext('2d');

    let angulo = 0;
    let girando = true;
    const alvo = desafio.alvo;
    const tolerancia = desafio.tolerancia;

    const loop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#0a0a2e';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < 30; i++) {
        ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.8})`;
        ctx.beginPath();
        ctx.arc(Math.random() * canvas.width, Math.random() * canvas.height, Math.random() * 1.5, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.save();
      ctx.translate(150, 200);
      ctx.rotate((angulo * Math.PI) / 180);

      const grad = ctx.createRadialGradient(0, 0, 10, 0, 0, 70);
      grad.addColorStop(0, '#7EC8E3');
      grad.addColorStop(0.5, '#5A9DB8');
      grad.addColorStop(1, '#3A7D98');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(0, 0, 70, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = 'rgba(255,255,255,0.3)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, 85, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = 'rgba(200,200,255,0.4)';
      ctx.lineWidth = 1;
      for (let i = 0; i < 360; i += 30) {
        const a = (i * Math.PI) / 180;
        ctx.beginPath();
        ctx.arc(Math.cos(a) * 75, Math.sin(a) * 75, 3, 0, Math.PI * 2);
        ctx.stroke();
      }

      ctx.restore();

      ctx.fillStyle = '#aaa';
      ctx.font = '12px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('↑  ↓ para ajustar o ângulo', 150, 30);

      ctx.fillStyle = '#fff';
      ctx.font = '16px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`Ângulo: ${angulo.toFixed(0)}°`, 150, 370);
      ctx.fillStyle = alvo - tolerancia <= angulo && angulo <= alvo + tolerancia ? '#44ff44' : '#ff4444';
      ctx.fillText(`Alvo: ${alvo}° ± ${tolerancia}°`, 150, 390);

      if (this.teclasPressionadas['ArrowUp']) angulo = Math.min(360, angulo + 1);
      if (this.teclasPressionadas['ArrowDown']) angulo = Math.max(0, angulo - 1);

      this.animacaoId = requestAnimationFrame(loop);
    };

    area.innerHTML += `
      <div class="inclinacao-botoes" style="text-align:center;margin-top:10px">
        <button class="btn-jogo" id="inclinacao-parar">Travar Ângulo</button>
      </div>
    `;

    loop();

    document.getElementById('inclinacao-parar').addEventListener('click', () => {
      const acertou = alvo - tolerancia <= angulo && angulo <= alvo + tolerancia;
      this.finalizarJogo(container, acertou,
        acertou ? `Precisão incrível! ${angulo.toFixed(0)}° é a inclinação correta de Urano!` :
        `O ângulo ficou em ${angulo.toFixed(0)}°. Urano está inclinado a ${alvo}°.`
      );
    });
  },

  jogoFugaVentos(desafio, area, container) {
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 500;
    canvas.className = 'ventos-canvas';
    area.appendChild(canvas);
    const ctx = canvas.getContext('2d');

    let naveX = 200, naveY = 250;
    let tempoRestante = desafio.duracao;
    let ventos = [];
    let ativo = true;

    const loop = () => {
      if (!ativo) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#0a0a2e';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < 40; i++) {
        ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.5})`;
        ctx.beginPath();
        ctx.arc(Math.random() * canvas.width, Math.random() * canvas.height, Math.random() * 1.5, 0, Math.PI * 2);
        ctx.fill();
      }

      if (Math.random() < 0.04) {
        const direcoes = ['←', '→', '↑', '↓'];
        const dir = direcoes[Math.floor(Math.random() * 4)];
        const angulos = { '←': Math.PI, '→': 0, '↑': -Math.PI / 2, '↓': Math.PI / 2 };
        ventos.push({
          x: canvas.width / 2,
          y: canvas.height / 2,
          vx: Math.cos(angulos[dir]) * 3,
          vy: Math.sin(angulos[dir]) * 3,
          dir: dir,
          vida: 60 + Math.random() * 60
        });
      }

      ventos = ventos.filter(v => {
        v.x += v.vx;
        v.y += v.vy;
        v.vida--;

        ctx.fillStyle = `rgba(100, 200, 255, ${Math.min(0.6, v.vida / 100)})`;
        ctx.font = '24px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('💨', v.x, v.y);

        ctx.fillStyle = `rgba(100, 200, 255, ${Math.min(0.3, v.vida / 200)})`;
        ctx.font = '16px monospace';
        ctx.fillText('💨', v.x - 20, v.y - 10);
        ctx.fillText('💨', v.x + 15, v.y + 5);

        const dx = naveX - v.x;
        const dy = naveY - v.y;
        if (Math.sqrt(dx * dx + dy * dy) < 30) {
          naveX += v.vx * 3;
          naveY += v.vy * 3;
        }

        return v.vida > 0;
      });

      if (this.teclasPressionadas['w'] || this.teclasPressionadas['W']) naveY -= 3;
      if (this.teclasPressionadas['s'] || this.teclasPressionadas['S']) naveY += 3;
      if (this.teclasPressionadas['a'] || this.teclasPressionadas['A']) naveX -= 3;
      if (this.teclasPressionadas['d'] || this.teclasPressionadas['D']) naveX += 3;

      naveX = Math.max(15, Math.min(canvas.width - 15, naveX));
      naveY = Math.max(15, Math.min(canvas.height - 15, naveY));

      ctx.fillStyle = '#4488ff';
      ctx.beginPath();
      ctx.moveTo(naveX, naveY - 15);
      ctx.lineTo(naveX - 10, naveY + 8);
      ctx.lineTo(naveX + 10, naveY + 8);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#88ccff';
      ctx.beginPath();
      ctx.moveTo(naveX, naveY - 8);
      ctx.lineTo(naveX - 5, naveY + 3);
      ctx.lineTo(naveX + 5, naveY + 3);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#fff';
      ctx.font = '16px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`⏱ ${Math.ceil(tempoRestante)}s`, canvas.width / 2, 25);
      ctx.fillStyle = '#88ccff';
      ctx.font = '12px monospace';
      ctx.fillText('WASD para mover', canvas.width / 2, canvas.height - 10);

      if (naveX <= 15 || naveX >= canvas.width - 15 || naveY <= 15 || naveY >= canvas.height - 15) {
        ativo = false;
        this.finalizarJogo(container, false, 'Os ventos de Netuno te empurraram para fora! Tente novamente!');
        return;
      }

      if (tempoRestante <= 0) {
        ativo = false;
        this.finalizarJogo(container, true, 'Você sobreviveu aos ventos supersônicos de Netuno! Parabéns!');
        return;
      }

      tempoRestante -= 1 / 60;
      this.animacaoId = requestAnimationFrame(loop);
    };
    loop();
  },

  jogoDesvioMeteoros(desafio, area, container) {
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 500;
    canvas.className = 'meteoros-canvas';
    area.appendChild(canvas);
    const ctx = canvas.getContext('2d');

    let naveX = 200, naveY = 430;
    let tempoRestante = desafio.duracao;
    let obstaculos = [];
    let ativo = true;
    let frame = 0;

    const loop = () => {
      if (!ativo) return;
      frame++;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#0a0a1a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < 60; i++) {
        ctx.fillStyle = `rgba(255,255,255,${0.2 + Math.random() * 0.5})`;
        ctx.beginPath();
        ctx.arc(Math.random() * canvas.width, Math.random() * canvas.height, Math.random() * 1.5, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.fillStyle = '#1a3a5c';
      ctx.fillRect(0, canvas.height - 30, canvas.width, 30);
      ctx.fillStyle = '#2a5a8c';
      for (let i = 0; i < canvas.width; i += 30) {
        ctx.beginPath();
        ctx.arc(i + 5, canvas.height - 15, 3, 0, Math.PI * 2);
        ctx.fill();
      }

      if (frame % Math.max(15, 45 - Math.floor(tempoRestante / 2)) === 0) {
        const tipo = Math.random() < 0.3 ? 'cometa' : 'meteoro';
        obstaculos.push({
          x: 20 + Math.random() * (canvas.width - 40),
          y: -30,
          vy: 1.5 + Math.random() * (2.5 + (60 - tempoRestante) / 20),
          vx: (Math.random() - 0.5) * 1.5,
          tamanho: tipo === 'cometa' ? 18 + Math.random() * 12 : 10 + Math.random() * 15,
          tipo: tipo
        });
      }

      obstaculos = obstaculos.filter(o => {
        o.x += o.vx;
        o.y += o.vy;

        if (o.tipo === 'meteoro') {
          const grad = ctx.createRadialGradient(o.x, o.y, 2, o.x, o.y, o.tamanho);
          grad.addColorStop(0, '#ff8844');
          grad.addColorStop(0.4, '#aa4422');
          grad.addColorStop(1, '#441100');
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(o.x, o.y, o.tamanho, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = 'rgba(255,136,68,0.3)';
          ctx.beginPath();
          ctx.arc(o.x, o.y, o.tamanho * 1.3, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#ffaa44';
          ctx.beginPath();
          ctx.arc(o.x - o.tamanho * 0.25, o.y - o.tamanho * 0.25, o.tamanho * 0.35, 0, Math.PI * 2);
          ctx.fill();
        } else {
          const grad = ctx.createRadialGradient(o.x, o.y, 2, o.x, o.y, o.tamanho);
          grad.addColorStop(0, '#ffffff');
          grad.addColorStop(0.3, '#aaddff');
          grad.addColorStop(0.7, '#4488cc');
          grad.addColorStop(1, '#224466');
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(o.x, o.y, o.tamanho * 0.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = 'rgba(100,180,255,0.3)';
          ctx.beginPath();
          ctx.moveTo(o.x, o.y);
          ctx.lineTo(o.x - o.tamanho * 1.5, o.y - o.tamanho * 0.3);
          ctx.lineTo(o.x - o.tamanho * 1.8, o.y + o.tamanho * 0.2);
          ctx.lineTo(o.x, o.y);
          ctx.fill();
          ctx.fillStyle = `rgba(150,200,255,${0.1 + Math.sin(frame / 20) * 0.05})`;
          ctx.beginPath();
          ctx.moveTo(o.x, o.y);
          ctx.lineTo(o.x - o.tamanho * 2.5, o.y + o.tamanho * 0.5);
          ctx.lineTo(o.x - o.tamanho * 2.8, o.y + o.tamanho * 0.8);
          ctx.lineTo(o.x, o.y);
          ctx.fill();
        }

        return o.y < canvas.height + 40;
      });

      if (this.teclasPressionadas['ArrowLeft']) naveX -= 4;
      if (this.teclasPressionadas['ArrowRight']) naveX += 4;
      naveX = Math.max(18, Math.min(canvas.width - 18, naveX));

      const colisao = obstaculos.some(o => {
        const dx = naveX - o.x;
        const dy = naveY - o.y;
        const raio = o.tipo === 'cometa' ? o.tamanho * 0.5 : o.tamanho;
        return Math.sqrt(dx * dx + dy * dy) < raio + 14;
      });

      if (colisao) {
        ativo = false;
        this.finalizarJogo(container, false, 'Sua nave foi atingida! Tente novamente, piloto!');
        return;
      }

      ctx.fillStyle = '#4488ff';
      ctx.beginPath();
      ctx.moveTo(naveX, naveY - 18);
      ctx.lineTo(naveX - 12, naveY + 6);
      ctx.lineTo(naveX + 12, naveY + 6);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#88ccff';
      ctx.beginPath();
      ctx.moveTo(naveX, naveY - 10);
      ctx.lineTo(naveX - 6, naveY + 3);
      ctx.lineTo(naveX + 6, naveY + 3);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#ff4444';
      ctx.font = 'bold 14px monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`⏱ ${Math.ceil(tempoRestante)}s`, 10, 25);
      ctx.fillText(`☄️ ${obstaculos.length}`, 10, 45);

      ctx.fillStyle = '#8899bb';
      ctx.font = '12px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('← → para desviar', canvas.width / 2, canvas.height - 5);

      if (tempoRestante <= 0) {
        ativo = false;
        this.finalizarJogo(container, true, 'Sobreviveu ao cinturão de meteoros! Rumo à Lua! 🚀');
        return;
      }

      tempoRestante -= 1 / 60;
      this.animacaoId = requestAnimationFrame(loop);
    };
    loop();
  }
};
