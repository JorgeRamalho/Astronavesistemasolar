const AudioEspaco = {
  ctx: null,
  osciladores: [],
  ganhos: [],
  ativo: false,

  init() {
    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      return;
    }
  },

  iniciar() {
    if (this.ativo) return;
    if (!this.ctx) this.init();
    if (this.ctx.state === 'suspended') this.ctx.resume();
    this.ativo = true;

    const notas = [55, 65.4, 82.4, 110];
    this.osciladores = [];
    this.ganhos = [];

    notas.forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const ganho = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;

      const modLFO = this.ctx.createOscillator();
      const modGanho = this.ctx.createGain();
      modLFO.frequency.value = 0.1 + i * 0.05;
      modGanho.gain.value = 2 + i * 0.5;
      modLFO.connect(modGanho);
      modGanho.connect(osc.frequency);
      modLFO.start();

      const ampLFO = this.ctx.createOscillator();
      const ampGanho = this.ctx.createGain();
      ampLFO.frequency.value = 0.3 + i * 0.1;
      ampGanho.gain.value = 0.15;
      ampLFO.connect(ampGanho);
      ampGanho.connect(ganho.gain);

      ganho.gain.value = 0.15;
      ampLFO.start();

      osc.connect(ganho);
      ganho.connect(this.ctx.destination);
      osc.start();

      this.osciladores.push(osc);
      this.ganhos.push(ganho);
    });

    const noise = this.ctx.createOscillator();
    const noiseGanho = this.ctx.createGain();
    noise.type = 'sawtooth';
    noise.frequency.value = 0.5;
    noiseGanho.gain.value = 0.02;
    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = 'lowpass';
    noiseFilter.frequency.value = 200;
    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGanho);
    noiseGanho.connect(this.ctx.destination);
    noise.start();
    this.noise = { osc: noise, ganho: noiseGanho };
  },

  parar() {
    this.ativo = false;
    this.osciladores.forEach(o => { try { o.stop(); } catch (e) {} });
    this.ganhos.forEach(g => g.disconnect());
    if (this.noise) {
      try { this.noise.osc.stop(); } catch (e) {}
      this.noise.ganho.disconnect();
    }
    this.osciladores = [];
    this.ganhos = [];
    this.noise = null;
  },

  alternar() {
    if (this.ativo) this.parar();
    else this.iniciar();
    return this.ativo;
  }
};

const TripulacaoNaracao = {
  _vozesCarregadas: false,
  _vozes: { alexis: null, caroll: null },
  _fila: [],
  _falando: false,
  _ativo: true,
  _contexto: { tela: 'menu', planeta: null },
  _hideTimer: null,
  _els: {},

  perfis: {
    alexis: { pitch: 0.82, rate: 0.9 },
    caroll: { pitch: 1.12, rate: 0.95 }
  },

  init() {
    this._montarHUD();
    this._carregarVozes();
    if ('speechSynthesis' in window) {
      speechSynthesis.onvoiceschanged = () => this._carregarVozes();
    }
  },

  _montarHUD() {
    const existente = document.getElementById('tripulantes-hud');
    if (existente) existente.remove();

    const hud = document.createElement('div');
    hud.id = 'tripulantes-hud';
    hud.className = 'tripulantes-hud oculto';
    hud.setAttribute('aria-live', 'polite');
    hud.innerHTML = `
      <div class="tripulantes-hud-inner">
        <button type="button" class="trip-personagem" data-trip="alexis" aria-label="Comandante Alexis">
          <span class="trip-avatar">👨‍🚀</span>
          <span class="trip-nome">Alexis</span>
        </button>
        <div class="trip-balao">
          <span class="trip-falante"></span>
          <p class="trip-texto"></p>
        </div>
        <button type="button" class="trip-personagem" data-trip="caroll" aria-label="Navegadora Caroll">
          <span class="trip-avatar">👩‍🚀</span>
          <span class="trip-nome">Caroll</span>
        </button>
      </div>
      <button type="button" class="trip-toggle-narracao ativo" id="trip-toggle-narracao" title="Voz da tripulação">🗣️</button>
    `;
    document.getElementById('app-container').appendChild(hud);

    this._els = {
      hud,
      balao: hud.querySelector('.trip-balao'),
      falante: hud.querySelector('.trip-falante'),
      texto: hud.querySelector('.trip-texto'),
      personagens: hud.querySelectorAll('.trip-personagem'),
      toggle: hud.querySelector('#trip-toggle-narracao')
    };

    hud.querySelector('[data-trip="alexis"]').addEventListener('click', () => {
      this._interagir('alexis');
    });
    hud.querySelector('[data-trip="caroll"]').addEventListener('click', () => {
      this._interagir('caroll');
    });
    this._els.toggle.addEventListener('click', () => {
      this._ativo = !this._ativo;
      this._els.toggle.classList.toggle('ativo', this._ativo);
      this._els.toggle.textContent = this._ativo ? '🗣️' : '🔇';
      if (!this._ativo) this.parar();
    });
  },

  _carregarVozes() {
    if (!('speechSynthesis' in window)) return;
    const pt = speechSynthesis.getVoices().filter(v => v.lang.startsWith('pt'));
    if (!pt.length) return;

    const mascRe = /daniel|male|masculino|homem|joão|joao|felipe|thiago|ricardo|antônio|antonio|luciano|davi|heitor|google.*portugu[eê]s.*brasil.*male/i;
    const femRe = /female|feminina|mulher|maria|luciana|francisca|amanda|vitória|vitoria|heloísa|heloisa|fernanda|google.*portugu[eê]s.*brasil(?!.*male)/i;

    const fem = pt.find(v => /francisca|luciana|maria/i.test(v.name))
      || pt.find(v => femRe.test(v.name))
      || pt.find(v => !mascRe.test(v.name))
      || pt[0];

    const masc = pt.find(v => /daniel/i.test(v.name))
      || pt.find(v => mascRe.test(v.name) && v !== fem)
      || pt.find(v => v !== fem && !femRe.test(v.name))
      || pt[0];

    this._vozes.alexis = masc;
    this._vozes.caroll = fem !== masc ? fem : pt.find(v => v !== masc) || masc;
    this._vozesCarregadas = true;
  },

  definirContexto(tela, planeta = null) {
    this._contexto = { tela, planeta };
  },

  mostrarHUD(manter = false) {
    clearTimeout(this._hideTimer);
    this._els.hud?.classList.remove('oculto');
    if (!manter && !this._falando) {
      this._hideTimer = setTimeout(() => {
        if (!this._falando) this._els.hud?.classList.add('oculto');
      }, 12000);
    }
  },

  ocultarHUD() {
    clearTimeout(this._hideTimer);
    this._els.hud?.classList.add('oculto');
  },

  modoCompacto(ativo) {
    this._els.hud?.classList.toggle('tripulantes-hud--compacto', ativo);
  },

  _destacarFalante(quem) {
    this._els.personagens?.forEach(btn => {
      btn.classList.toggle('trip-personagem--ativa', btn.dataset.trip === quem);
    });
    const info = TripulantesDialogos[quem];
    if (this._els.falante && info) {
      this._els.falante.textContent = `${info.emoji} ${info.nome}`;
    }
  },

  _atualizarBalao(quem, texto) {
    this._destacarFalante(quem);
    if (this._els.texto) this._els.texto.textContent = texto;
    this.mostrarHUD(true);
  },

  _falarUm(quem, texto) {
    return new Promise((resolve) => {
      if (!this._ativo || !('speechSynthesis' in window)) {
        this._atualizarBalao(quem, texto);
        setTimeout(resolve, Math.min(4000, texto.length * 45));
        return;
      }

      if (!this._vozesCarregadas) this._carregarVozes();
      this._atualizarBalao(quem, texto);

      const utterance = new SpeechSynthesisUtterance(texto);
      utterance.lang = 'pt-BR';
      const perfil = this.perfis[quem] || { pitch: 1, rate: 0.93 };
      utterance.pitch = perfil.pitch;
      utterance.rate = perfil.rate;
      const voz = this._vozes[quem];
      if (voz) utterance.voice = voz;

      utterance.onend = () => resolve();
      utterance.onerror = () => resolve();
      speechSynthesis.speak(utterance);
    });
  },

  async dialogo(falas, opcoes = {}) {
    if (!falas?.length) return;
    this.parar(false);
    this._falando = true;
    this.mostrarHUD(true);

    for (const fala of falas) {
      if (!this._ativo) break;
      await this._falarUm(fala.quem, fala.texto);
      if (fala.pausa) await new Promise(r => setTimeout(r, fala.pausa));
      else await new Promise(r => setTimeout(r, 350));
    }

    this._falando = false;
    if (!opcoes.manterHUD) {
      this.mostrarHUD(false);
    } else {
      this.mostrarHUD(true);
    }
  },

  narrar(texto, onFim) {
    this.dialogo([{ quem: 'caroll', texto }]).then(() => { if (onFim) onFim(); });
  },

  _interagir(quem) {
    if (this._falando) return;
    const p = this._contexto.planeta;
    const texto = quem === 'alexis'
      ? TripulantesDialogos.dicaAlexis(p)
      : TripulantesDialogos.dicaCaroll(p);

    this._falando = true;
    this.mostrarHUD(true);
    this._falarUm(quem, texto).then(() => {
      this._falando = false;
      this.mostrarHUD(false);
    });
  },

  parar(ocultar = true) {
    if ('speechSynthesis' in window) speechSynthesis.cancel();
    this._fila = [];
    this._falando = false;
    if (ocultar) this.ocultarHUD();
  }
};

const NaracaoEspaco = {
  narrar(texto, onFim) {
    const falas = TripulantesDialogos.finale();
    TripulacaoNaracao.dialogo(falas, { manterHUD: true }).then(() => { if (onFim) onFim(); });
  },
  parar() {
    TripulacaoNaracao.parar();
  }
};

if ('speechSynthesis' in window) {
  speechSynthesis.getVoices();
}
