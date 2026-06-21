function planetaArte(id, tamanho = 60) {
  const classes = {
    sol: 'pa-sol', mercurio: 'pa-mercurio', venus: 'pa-venus',
    terra: 'pa-terra', lua: 'pa-lua', marte: 'pa-marte',
    jupiter: 'pa-jupiter', saturno: 'pa-saturno', urano: 'pa-urano',
    netuno: 'pa-netuno', plutao: 'pa-plutao',
    halley: 'pa-halley', halebopp: 'pa-halebopp'
  };
  const cls = classes[id] || 'pa-terra';
  let extras = '';
  if (id === 'jupiter') extras = '<div class="tempestade"></div>';
  if (id === 'netuno') extras = '<div class="aneis-netuno"></div>';
  return `<div class="planeta-arte ${cls}" style="width:${tamanho}px;height:${tamanho}px"><div class="arte-sombra"></div>${extras}</div>`;
}

const planetas = [
  {
    id: 'sol',
    nome: 'Sol',
    tipo: 'Estrela',
    cor: '#FDB813',
    corSecundaria: '#FF6B00',
    tamanhoRelativo: 10,
    orbitaDistancia: 0,
    ficha: {
      diametro: '1.391.000 km',
      massa: '1.989 × 10^30 kg',
      temperatura: '5.500°C (superfície)',
      idade: '4,6 bilhões de anos',
      tipo: 'Estrela Anã Amarela (G2V)',
      composicao: '73% Hidrogênio, 25% Hélio'
    },
    curiosidades: [
      'O Sol contém 99,86% de toda a massa do Sistema Solar.',
      'A luz do Sol leva cerca de 8 minutos e 20 segundos para chegar à Terra.',
      'O Sol é tão grande que caberiam 1,3 milhões de Terras dentro dele.'
    ],

    desafio: {
      nome: 'Quiz Solar',
      descricao: 'Responda perguntas sobre o Sol!',
      tipo: 'quiz',
      perguntas: [
        {
          pergunta: 'Qual é a temperatura da superfície do Sol?',
          opcoes: ['3.000°C', '5.500°C', '10.000°C', '1.000.000°C'],
          correta: 1
        },
        {
          pergunta: 'Quanto tempo a luz solar leva para chegar à Terra?',
          opcoes: ['8 minutos e 20 segundos', '5 minutos', '1 hora', '30 segundos'],
          correta: 0
        },
        {
          pergunta: 'Qual elemento químico é mais abundante no Sol?',
          opcoes: ['Hélio', 'Carbono', 'Hidrogênio', 'Oxigênio'],
          correta: 2
        },
        {
          pergunta: 'O Sol é classificado como que tipo de estrela?',
          opcoes: ['Gigante Vermelha', 'Anã Amarela', 'Anã Branca', 'Supergigante Azul'],
          correta: 1
        },
        {
          pergunta: 'Quantas Terras caberiam dentro do Sol?',
          opcoes: ['130 mil', '13 mil', '1,3 milhão', '130 milhões'],
          correta: 2
        }
      ]
    }
  },
  {
    id: 'mercurio',
    nome: 'Mercúrio',
    tipo: 'Planeta Rochoso',
    cor: '#B5B5B5',
    corSecundaria: '#8A8A8A',
    tamanhoRelativo: 3,
    orbitaDistancia: 1,
    ficha: {
      diametro: '4.879 km',
      massa: '3,301 × 10^23 kg',
      temperatura: '-180°C a 430°C',
      idade: '4,5 bilhões de anos',
      distanciaSol: '57,9 milhões de km',
      periodoOrbital: '88 dias terrestres'
    },
    curiosidades: [
      'Mercúrio é o menor planeta do Sistema Solar.',
      'Um dia em Mercúrio (176 dias terrestres) é mais longo que seu ano (88 dias).',
      'Mercúrio não tem atmosfera, por isso as temperaturas variam drasticamente.'
    ],
    desafio: {
      nome: 'Velocidade de Mercúrio',
      descricao: 'Mercúrio é o planeta mais rápido! Clique o máximo de vezes que conseguir em 10 segundos.',
      tipo: 'clickRace',
      duracao: 10,
      meta: 30
    }
  },
  {
    id: 'venus',
    nome: 'Vênus',
    tipo: 'Planeta Rochoso',
    cor: '#E8B84B',
    corSecundaria: '#C4953A',
    tamanhoRelativo: 4,
    orbitaDistancia: 2,
    ficha: {
      diametro: '12.104 km',
      massa: '4,867 × 10^24 kg',
      temperatura: '462°C (média)',
      idade: '4,5 bilhões de anos',
      distanciaSol: '108,2 milhões de km',
      periodoOrbital: '225 dias terrestres'
    },
    curiosidades: [
      'Vênus é o planeta mais quente do Sistema Solar, mesmo não sendo o mais próximo do Sol.',
      'Em Vênus, o Sol nasce no oeste e se põe no leste (rotação retrógrada).',
      'Vênus é frequentemente chamado de "irmã gêmea" da Terra por ter tamanho similar.'
    ],
    desafio: {
      nome: 'Ordenação de Temperaturas',
      descricao: 'Organize os planetas do mais frio ao mais quente!',
      tipo: 'ordenacao',
      itens: [
        { nome: 'Netuno', valor: -200 },
        { nome: 'Urano', valor: -195 },
        { nome: 'Marte', valor: -65 },
        { nome: 'Terra', valor: 15 },
        { nome: 'Mercúrio', valor: 167 },
        { nome: 'Vênus', valor: 462 }
      ]
    }
  },
  {
    id: 'terra',
    nome: 'Terra',
    tipo: 'Planeta Rochoso',
    cor: '#4B8BBE',
    corSecundaria: '#2E6B9E',
    tamanhoRelativo: 4,
    orbitaDistancia: 3,
    ficha: {
      diametro: '12.742 km',
      massa: '5,972 × 10^24 kg',
      temperatura: '-89°C a 57°C',
      idade: '4,54 bilhões de anos',
      distanciaSol: '149,6 milhões de km',
      periodoOrbital: '365,25 dias'
    },
    curiosidades: [
      'A Terra é o único planeta conhecido que abriga vida.',
      'Cerca de 71% da superfície da Terra é coberta por água.',
      'A atmosfera terrestre nos protege da radiação solar e de meteoros.'
    ],
    desafio: {
      nome: 'Desvio de Meteoros',
      descricao: 'Desvie dos meteoros e cometas por 1 minuto! Use as setas ← → para mover a nave.',
      tipo: 'desvioMeteoros',
      duracao: 60
    }
  },
  {
    id: 'lua',
    nome: 'Lua',
    tipo: 'Satélite Natural',
    cor: '#C8C8C8',
    corSecundaria: '#A0A0A0',
    tamanhoRelativo: 2,
    orbitaDistancia: 3.5,
    ficha: {
      diametro: '3.474 km',
      massa: '7,342 × 10^22 kg',
      temperatura: '-233°C a 123°C',
      idade: '4,53 bilhões de anos',
      distanciaTerra: '384.400 km',
      periodoOrbital: '27,3 dias'
    },
    curiosidades: [
      'A Lua é o quinto maior satélite natural do Sistema Solar.',
      'A gravidade na Lua é cerca de 1/6 da gravidade da Terra.',
      'A Lua está se afastando da Terra cerca de 3,8 cm por ano.'
    ],
    desafio: {
      nome: 'Pouso Lunar',
      descricao: 'Pouse a nave na Lua! Use as setas ← → para controlar e ↓ para descer mais rápido.',
      tipo: 'pousoLunar',
      gravidade: 0.3,
      combustivel: 100
    }
  },
  {
    id: 'marte',
    nome: 'Marte',
    tipo: 'Planeta Rochoso',
    cor: '#C1440E',
    corSecundaria: '#8B2E0A',
    tamanhoRelativo: 3,
    orbitaDistancia: 4,
    ficha: {
      diametro: '6.779 km',
      massa: '6,417 × 10^23 kg',
      temperatura: '-140°C a 20°C',
      idade: '4,5 bilhões de anos',
      distanciaSol: '227,9 milhões de km',
      periodoOrbital: '687 dias'
    },
    curiosidades: [
      'Marte é conhecido como o "Planeta Vermelho" devido ao óxido de ferro em sua superfície.',
      'O Monte Olimpo em Marte é o maior vulcão do Sistema Solar, com 21,9 km de altura.',
      'Marte tem estações do ano como a Terra, mas cada estação dura cerca de 6 meses.'
    ],
    desafio: {
      nome: 'Caça aos Meteoros',
      descricao: 'Clique nos meteoros para coletá-los antes que caiam em Marte! Você tem 20 segundos.',
      tipo: 'cliqueMeteoros',
      duracao: 20,
      totalMeteoros: 15
    }
  },
  {
    id: 'jupiter',
    nome: 'Júpiter',
    tipo: 'Gigante Gasoso',
    cor: '#D4A574',
    corSecundaria: '#B8865A',
    tamanhoRelativo: 8,
    orbitaDistancia: 5,
    ficha: {
      diametro: '139.820 km',
      massa: '1,898 × 10^27 kg',
      temperatura: '-110°C (topo das nuvens)',
      idade: '4,6 bilhões de anos',
      distanciaSol: '778,5 milhões de km',
      periodoOrbital: '11,86 anos'
    },
    curiosidades: [
      'Júpiter é o maior planeta do Sistema Solar.',
      'A Grande Mancha Vermelha é uma tempestade maior que a Terra que dura há centenas de anos.',
      'Júpiter tem pelo menos 95 luas conhecidas!'
    ],
    desafio: {
      nome: 'Tempestade em Júpiter',
      descricao: 'Desvie sua nave das tempestades na Grande Mancha Vermelha! Use as setas ← → para mover.',
      tipo: 'desvioTempestade',
      duracao: 15
    }
  },
  {
    id: 'saturno',
    nome: 'Saturno',
    tipo: 'Gigante Gasoso',
    cor: '#EAD6A5',
    corSecundaria: '#C4B07A',
    tamanhoRelativo: 7,
    orbitaDistancia: 6,
    ficha: {
      diametro: '116.460 km',
      massa: '5,683 × 10^26 kg',
      temperatura: '-140°C (topo das nuvens)',
      idade: '4,6 bilhões de anos',
      distanciaSol: '1,43 bilhões de km',
      periodoOrbital: '29,46 anos'
    },
    curiosidades: [
      'Saturno é conhecido por seus belos anéis feitos de gelo e rocha.',
      'Saturno é tão leve que flutuaria na água (se houvesse um oceano grande o suficiente).',
      'Os anéis de Saturno têm apenas cerca de 10 metros de espessura, mas se estendem por 282.000 km.'
    ],
    desafio: {
      nome: 'Monte os Anéis de Saturno',
      descricao: 'Arraste as partículas de gelo para montar os anéis de Saturno na ordem correta (da maior para a menor)!',
      tipo: 'montarAneis',
      itens: [
        { nome: 'Anel A', tamanho: 10 },
        { nome: 'Anel B', tamanho: 15 },
        { nome: 'Anel C', tamanho: 5 },
        { nome: 'Anel D', tamanho: 3 },
        { nome: 'Anel F', tamanho: 1 }
      ]
    }
  },
  {
    id: 'urano',
    nome: 'Urano',
    tipo: 'Gigante de Gelo',
    cor: '#7EC8E3',
    corSecundaria: '#5A9DB8',
    tamanhoRelativo: 5,
    orbitaDistancia: 7,
    ficha: {
      diametro: '50.724 km',
      massa: '8,681 × 10^25 kg',
      temperatura: '-195°C',
      idade: '4,5 bilhões de anos',
      distanciaSol: '2,87 bilhões de km',
      periodoOrbital: '84 anos'
    },
    curiosidades: [
      'Urano gira de lado! Seu eixo de rotação é inclinado em 98°.',
      'Urano foi o primeiro planeta descoberto com um telescópio (1781).',
      'Uma estação em Urano dura cerca de 21 anos terrestres.'
    ],
    desafio: {
      nome: 'Inclinação de Urano',
      descricao: 'Ajude Urano a se inclinar corretamente! Clique no botão no momento certo para parar a rotação no ângulo de 98 graus.',
      tipo: 'inclinacao',
      alvo: 98,
      tolerancia: 5
    }
  },
  {
    id: 'plutao',
    nome: 'Plutão',
    tipo: 'Planeta Anão',
    cor: '#CDB38C',
    corSecundaria: '#A08B6E',
    tamanhoRelativo: 2,
    orbitaDistancia: 9,
    ficha: {
      diametro: '2.377 km',
      massa: '1,303 × 10^22 kg',
      temperatura: '-230°C',
      idade: '4,5 bilhões de anos',
      distanciaSol: '5,91 bilhões de km',
      periodoOrbital: '248 anos'
    },
    curiosidades: [
      'Plutão foi reclassificado de planeta para planeta anão em 2006.',
      'Plutão tem 5 luas conhecidas: Caronte, Estige, Nix, Cérbero e Hidra.',
      'A sonda New Horizons visitou Plutão em 2015, revelando sua superfície incrível.'
    ],
    desafio: {
      nome: 'Quiz Plutão',
      descricao: 'Teste seus conhecimentos sobre este planeta anão!',
      tipo: 'quiz',
      perguntas: [
        {
          pergunta: 'Em que ano Plutão foi reclassificado como planeta anão?',
          opcoes: ['2000', '2006', '2010', '2015'],
          correta: 1
        },
        {
          pergunta: 'Quantas luas Plutão possui conhecidas?',
          opcoes: ['1', '3', '5', '7'],
          correta: 2
        },
        {
          pergunta: 'Qual é a temperatura média em Plutão?',
          opcoes: ['-100°C', '-170°C', '-230°C', '-50°C'],
          correta: 2
        },
        {
          pergunta: 'Qual sonda visitou Plutão em 2015?',
          opcoes: ['Voyager 1', 'Cassini', 'New Horizons', 'Hubble'],
          correta: 2
        },
        {
          pergunta: 'Qual é o maior satélite de Plutão?',
          opcoes: ['Nix', 'Caronte', 'Hidra', 'Cérbero'],
          correta: 1
        }
      ]
    }
  },
  {
    id: 'netuno',
    nome: 'Netuno',
    tipo: 'Gigante de Gelo',
    cor: '#3B5EAB',
    corSecundaria: '#1E3D7A',
    tamanhoRelativo: 5,
    orbitaDistancia: 8,
    ficha: {
      diametro: '49.244 km',
      massa: '1,024 × 10^26 kg',
      temperatura: '-200°C',
      idade: '4,5 bilhões de anos',
      distanciaSol: '4,50 bilhões de km',
      periodoOrbital: '164,8 anos'
    },
    curiosidades: [
      'Netuno tem os ventos mais fortes do Sistema Solar, chegando a 2.100 km/h.',
      'Netuno foi o primeiro planeta descoberto através de cálculos matemáticos.',
      'Um ano em Netuno dura 164,8 anos terrestres.'
    ],
    desafio: {
      nome: 'Fuja dos Ventos de Netuno',
      descricao: 'Desvie dos ventos supersônicos de Netuno! As rajadas vêm de direções aleatórias. Use WASD para mover a nave.',
      tipo: 'fugaVentos',
      duracao: 20
    }
  },
  {
    id: 'halley',
    nome: 'Cometa Halley',
    tipo: 'Cometa Periódico',
    cor: '#8CC4E8',
    corSecundaria: '#6BAED6',
    tamanhoRelativo: 1,
    ficha: {
      diametro: '15 km (núcleo)',
      periodoOrbital: '75-76 anos',
      temperatura: '-60°C a 100°C',
      idade: '4,6 bilhões de anos',
      composicao: 'Gelo, poeira e rochas',
      descoberta: '1758 (primeiro retorno previsto)',
      distanciaSol: '0,6 a 35 UA'
    },
    curiosidades: [
      'O Halley foi o primeiro cometa reconhecido como periódico, descoberto por Edmond Halley em 1705.',
      'Sua última passagem pelo Sistema Solar interno foi em 1986, e a próxima será em 2061.',
      'O núcleo do Halley tem formato irregular, parecido com um amendoim de 15 km de comprimento.'
    ],
  },
  {
    id: 'halebopp',
    nome: 'Cometa Hale-Bopp',
    tipo: 'Cometa',
    cor: '#A8D8F0',
    corSecundaria: '#7EC8E3',
    tamanhoRelativo: 1,
    ficha: {
      diametro: '30-40 km (núcleo)',
      periodoOrbital: '2.533 anos',
      temperatura: '-80°C a 50°C',
      idade: '4,6 bilhões de anos',
      composicao: 'Gelo, poeira cósmica e gases',
      descoberta: '23 de julho de 1995',
      distanciaSol: '0,9 a 45 UA'
    },
    curiosidades: [
      'Foi um dos cometas mais brilhantes já vistos no século XX, visível a olho nu por 18 meses.',
      'Seu núcleo gigante de até 40 km o tornou excepcionalmente brilhante.',
      'Descoberto simultaneamente por Alan Hale e Thomas Bopp nos Estados Unidos.'
    ],
  }
];
