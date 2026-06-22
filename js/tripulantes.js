const TripulantesDialogos = {
  alexis: { id: 'alexis', nome: 'Comandante Alexis', emoji: '👨‍🚀', cargo: 'Comandante' },
  caroll: { id: 'caroll', nome: 'Navegadora Caroll', emoji: '👩‍🚀', cargo: 'Navegadora' },

  boasVindas() {
    return [
      { quem: 'caroll', texto: 'Bem-vindo à ponte de comando! Sou a Navegadora Caroll, pronta para guiar nossa rota.' },
      { quem: 'alexis', texto: 'Comandante Alexis aqui. Escolha um modo e vamos explorar o Sistema Solar juntos, tripulante!' }
    ];
  },

  continuarJornada(paradaAtual, total) {
    return [
      { quem: 'alexis', texto: `Ótimo te ver de volta! Retomamos da parada ${paradaAtual} de ${total}.` },
      { quem: 'caroll', texto: 'Os sistemas estão estáveis. Podemos seguir viagem quando você quiser.' }
    ];
  },

  rotaAventura(nomeDestino) {
    return [
      { quem: 'alexis', texto: 'Rota da aventura traçada. Mantenha o foco na parada atual.' },
      { quem: 'caroll', texto: nomeDestino
        ? `Próximo destino confirmado: ${nomeDestino}. Toque no planeta destacado para iniciar a aproximação.`
        : 'Toque no planeta destacado na rota para iniciar a aproximação.' }
    ];
  },

  chegada(planeta) {
    const nome = planeta?.nome || 'destino';
    const curio = planeta?.curiosidades?.[0] || '';
    return [
      { quem: 'caroll', texto: `Aproximação concluída. Estamos em órbita de ${nome}.` },
      { quem: 'alexis', texto: `Revise a ficha técnica e, quando estiver pronto, inicie o desafio de ${nome}.` },
      ...(curio ? [{ quem: 'caroll', texto: curio }] : [])
    ];
  },

  inicioDesafio(planeta) {
    const desafio = planeta?.desafio?.nome || 'missão';
    return [
      { quem: 'alexis', texto: `Desafio ativado: ${desafio}. Mantenha a calma e siga as instruções na tela.` },
      { quem: 'caroll', texto: 'Estou monitorando os sensores. Boa sorte, tripulante!' }
    ];
  },

  vitoriaDesafio(planeta) {
    return [
      { quem: 'caroll', texto: `Missão cumprida em ${planeta?.nome || 'desta parada'}! Leituras estáveis.` },
      { quem: 'alexis', texto: 'Excelente trabalho. Preparando salto para a próxima coordenada da rota.' }
    ];
  },

  exploracao() {
    return [
      { quem: 'caroll', texto: 'Modo exploração ativo. Você pode visitar qualquer corpo celeste livremente.' },
      { quem: 'alexis', texto: 'Use o mapa orbital ou as fichas abaixo. Estamos aqui se precisar de orientação.' }
    ];
  },

  fichaExploracao(planeta) {
    return [
      { quem: 'caroll', texto: `Abrindo dados de ${planeta?.nome}. ${planeta?.tipo || ''}.` },
      { quem: 'alexis', texto: 'Confira a ficha técnica e as curiosidades. Conhecimento é combustível de exploração.' }
    ];
  },

  finale() {
    return [
      { quem: 'alexis', texto: 'Tripulante, você completou toda a rota pelo Sistema Solar. Missão histórica!' },
      { quem: 'caroll', texto: 'Uau! Um explorador como você está pronto para ir além — outras galáxias e estrelas nos aguardam.' },
      { quem: 'alexis', texto: 'O universo é vasto. Quando quiser, partimos rumo à viagem interstellar.' }
    ];
  },

  dicaAlexis(planeta) {
    const d = planeta?.desafio;
    if (!d) return 'Mantenha a nave estável e observe o ambiente antes de agir.';
    return `Foco no desafio "${d.nome}": ${d.descricao}`;
  },

  dicaCaroll(planeta) {
    if (!planeta) return 'O Sistema Solar tem bilhões de histórias escondidas em cada órbita.';
    const c = planeta.curiosidades;
    return c?.[1] || c?.[0] || `Sabia que ${planeta.nome} faz parte da nossa jornada pelo cosmos?`;
  }
};
