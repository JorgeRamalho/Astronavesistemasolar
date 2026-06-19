const Narrador = {
  elemento: null,
  nome: 'Capitão Cosmos',
  avatar: '🚀',
  fila: [],
  falando: false,
  velocidade: 35,
  vozAtiva: true,

  init() {
    this.elemento = document.getElementById('narrador');
    if (window.speechSynthesis) {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => {};
    }
  },

  falar(texto, callback) {
    this.fila.push({ texto, callback });
    if (!this.falando) {
      this.proximaFala();
    }
  },

  falarInstantaneo(texto) {
    this.fila = [];
    this.falando = false;
    if (this.elemento) {
      this.elemento.querySelector('.narrador-texto').textContent = texto;
      this.elemento.classList.add('ativo');
    }
    this.falarVoz(texto);
  },

  proximaFala() {
    if (this.fila.length === 0) {
      this.falando = false;
      return;
    }

    this.falando = true;
    const { texto, callback } = this.fila.shift();
    const textoEl = this.elemento.querySelector('.narrador-texto');
    textoEl.textContent = '';
    this.elemento.classList.add('ativo');

    this.falarVoz(texto);

    let i = 0;
    const digitar = () => {
      if (i < texto.length) {
        textoEl.textContent += texto[i];
        i++;
        setTimeout(digitar, this.velocidade);
      } else {
        this.falando = false;
        if (callback) callback();
        setTimeout(() => this.proximaFala(), 2000);
      }
    };
    digitar();
  },

  falarVoz(texto) {
    if (!this.vozAtiva || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(texto);
    utterance.lang = 'pt-BR';
    utterance.rate = 0.9;
    utterance.pitch = 0.8;
    utterance.volume = 0.7;
    const vozes = window.speechSynthesis.getVoices();
    const vozBR = vozes.find(v => v.lang.startsWith('pt'));
    if (vozBR) utterance.voice = vozBR;
    window.speechSynthesis.speak(utterance);
  },

  pularAnimacao() {
    if (this.fila.length > 0 || this.falando) {
      const textoEl = this.elemento.querySelector('.narrador-texto');
      if (this.fila.length > 0) {
        textoEl.textContent = this.fila[0].texto;
        const cb = this.fila[0].callback;
        this.fila.shift();
        this.falando = false;
        if (cb) cb();
        setTimeout(() => this.proximaFala(), 500);
      }
    }
  },

  esconder() {
    if (this.elemento) {
      this.elemento.classList.remove('ativo');
    }
  },

  mensagemRapida(texto, tempo = 3000) {
    const bolha = document.createElement('div');
    bolha.className = 'narrador-bolha-rapida';
    bolha.textContent = `${this.avatar} ${texto}`;
    document.body.appendChild(bolha);
    setTimeout(() => bolha.remove(), tempo);
  },

  alternarVoz() {
    this.vozAtiva = !this.vozAtiva;
    if (!this.vozAtiva) window.speechSynthesis.cancel();
    return this.vozAtiva;
  }
};
