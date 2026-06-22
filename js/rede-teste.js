const RedeTeste = {
  overlayAtivo: false,
  _ipLocal: null,
  _resizeHandler: null,
  _pollTimer: null,
  PORTA_PADRAO: 8765,
  SITE_ONLINE_URL: 'https://jorgeramalho.github.io/Astronavesistemasolar/',
  ACESSO_DEDICADO_PATH: 'acesso.html',

  init() {
    if (sessionStorage.getItem('redeTesteOverlay') === '1') {
      this.ativarOverlay();
    }
    if (new URLSearchParams(location.search).get('rede') === '1' && typeof App !== 'undefined') {
      setTimeout(() => App.criarTelaTesteRede?.(), 300);
    }
  },

  estaEmArquivoLocal() {
    return location.protocol === 'file:';
  },

  obterPorta() {
    const p = location.port;
    if (p) return p;
    return location.protocol === 'https:' ? '443' : '80';
  },

  async obterInfoServidor() {
    const tentativas = [];

    if (!this.estaEmArquivoLocal()) {
      tentativas.push('/api/rede-info');
    }
    tentativas.push(`http://localhost:${this.PORTA_PADRAO}/api/rede-info`);
    tentativas.push(`http://127.0.0.1:${this.PORTA_PADRAO}/api/rede-info`);

    for (const url of tentativas) {
      try {
        const r = await fetch(url, { cache: 'no-store', mode: 'cors' });
        if (r.ok) return await r.json();
      } catch {}
    }
    return null;
  },

  obterBaseOnline() {
    const base = this.SITE_ONLINE_URL.replace(/\/?$/, '/');
    return base;
  },

  obterBasePath() {
    if (this.estaEmArquivoLocal() || this.estaNoSiteOnline()) {
      return this.obterBaseOnline();
    }
    const segmentos = location.pathname.split('/').filter(Boolean);
    if (segmentos.length && segmentos[segmentos.length - 1].includes('.')) {
      segmentos.pop();
    }
    const dir = segmentos.length ? `/${segmentos.join('/')}/` : '/';
    return `${location.origin}${dir}`;
  },

  obterLinkOnline() {
    return this.obterBaseOnline();
  },

  obterLinkDedicado() {
    return `${this.obterBasePath()}${this.ACESSO_DEDICADO_PATH}`;
  },

  obterLinkJogo() {
    return `${this.obterBasePath()}index.html`;
  },

  obterLinkJogoDedicado() {
    return `${this.obterBasePath()}index.html?acesso=dedicado`;
  },

  estaNoSiteOnline() {
    return location.hostname.includes('github.io');
  },

  async descobrirIpLocal() {
    if (this._ipLocal) return this._ipLocal;
    if (!window.RTCPeerConnection) return null;

    return new Promise((resolve) => {
      let resolvido = false;
      const finalizar = (ip) => {
        if (resolvido) return;
        resolvido = true;
        if (ip) this._ipLocal = ip;
        resolve(ip);
      };

      try {
        const pc = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] });
        pc.createDataChannel('rede');
        pc.onicecandidate = (e) => {
          if (!e.candidate?.candidate) return;
          const match = /(\d{1,3}(?:\.\d{1,3}){3})/.exec(e.candidate.candidate);
          if (match && !match[1].startsWith('127.') && !match[1].startsWith('169.254.')) {
            finalizar(match[1]);
          }
        };
        pc.createOffer()
          .then((offer) => pc.setLocalDescription(offer))
          .catch(() => finalizar(null));
        setTimeout(() => {
          pc.close();
          finalizar(null);
        }, 3000);
      } catch {
        finalizar(null);
      }
    });
  },

  async gerarLinksCompartilhaveis() {
    const info = await this.obterInfoServidor();
    if (info?.links?.length) {
      return { links: info.links.map(l => l.url), primary: info.primary, fonte: 'servidor' };
    }

    if (!this.estaEmArquivoLocal()) {
      const host = location.hostname;
      const porta = this.obterPorta();
      if (host && host !== 'localhost' && host !== '127.0.0.1') {
        const url = `${location.origin}/`;
        return { links: [url], primary: url, fonte: 'atual' };
      }
      const ip = await this.descobrirIpLocal();
      if (ip) {
        const url = `http://${ip}:${porta}/`;
        return { links: [url], primary: url, fonte: 'webrtc' };
      }
    }

    return { links: [], primary: null, fonte: null };
  },

  renderizarQrCode(elemento, url) {
    if (!elemento || typeof qrcode !== 'function') return false;
    try {
      const qr = qrcode(0, 'M');
      qr.addData(url);
      qr.make();
      elemento.innerHTML = qr.createSvgTag(5, 2);
      const svg = elemento.querySelector('svg');
      if (svg) {
        svg.setAttribute('width', '220');
        svg.setAttribute('height', '220');
        svg.classList.add('rede-qr-svg');
      }
      return true;
    } catch {
      return false;
    }
  },

  obterBreakpoint() {
    const w = window.innerWidth;
    if (w < 480) return { nome: 'Mobile', cor: '#7EC8E3' };
    if (w < 768) return { nome: 'Tablet', cor: '#FDB813' };
    if (w < 1024) return { nome: 'Desktop', cor: '#6fcf6f' };
    return { nome: 'Wide', cor: '#a78bfa' };
  },

  obterInfoViewport() {
    const bp = this.obterBreakpoint();
    return {
      largura: window.innerWidth,
      altura: window.innerHeight,
      dpr: window.devicePixelRatio || 1,
      orientacao: window.innerWidth > window.innerHeight ? 'Paisagem' : 'Retrato',
      breakpoint: bp.nome,
      corBreakpoint: bp.cor
    };
  },

  async copiarTexto(texto) {
    try {
      await navigator.clipboard.writeText(texto);
      return true;
    } catch {
      const ta = document.createElement('textarea');
      ta.value = texto;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand('copy');
      ta.remove();
      return ok;
    }
  },

  pararPoll() {
    if (this._pollTimer) {
      clearInterval(this._pollTimer);
      this._pollTimer = null;
    }
  },

  ativarOverlay() {
    if (this.overlayAtivo) return;
    this.overlayAtivo = true;
    sessionStorage.setItem('redeTesteOverlay', '1');

    const bar = document.createElement('div');
    bar.id = 'rede-teste-overlay';
    bar.className = 'rede-teste-overlay';
    bar.innerHTML = `
      <span class="rede-teste-tag" id="rede-teste-bp">—</span>
      <span id="rede-teste-dims">—</span>
      <span id="rede-teste-orient">—</span>
      <button type="button" class="rede-teste-fechar" id="rede-teste-fechar" title="Fechar overlay">✕</button>
    `;
    document.body.appendChild(bar);

    const atualizar = () => {
      const info = this.obterInfoViewport();
      const bpEl = document.getElementById('rede-teste-bp');
      const dimsEl = document.getElementById('rede-teste-dims');
      const orientEl = document.getElementById('rede-teste-orient');
      if (bpEl) {
        bpEl.textContent = info.breakpoint;
        bpEl.style.background = info.corBreakpoint;
      }
      if (dimsEl) dimsEl.textContent = `${info.largura} × ${info.altura}px · DPR ${info.dpr}`;
      if (orientEl) orientEl.textContent = info.orientacao;
    };

    atualizar();
    this._resizeHandler = atualizar;
    window.addEventListener('resize', this._resizeHandler);
    window.addEventListener('orientationchange', this._resizeHandler);

    document.getElementById('rede-teste-fechar')?.addEventListener('click', () => {
      this.desativarOverlay();
    });
  },

  desativarOverlay() {
    this.overlayAtivo = false;
    sessionStorage.removeItem('redeTesteOverlay');
    document.getElementById('rede-teste-overlay')?.remove();
    if (this._resizeHandler) {
      window.removeEventListener('resize', this._resizeHandler);
      window.removeEventListener('orientationchange', this._resizeHandler);
      this._resizeHandler = null;
    }
  },

  alternarOverlay() {
    if (this.overlayAtivo) this.desativarOverlay();
    else this.ativarOverlay();
  }
};
