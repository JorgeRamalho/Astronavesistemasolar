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
