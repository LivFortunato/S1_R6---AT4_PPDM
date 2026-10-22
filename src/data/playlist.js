

export const PLAYLIST = [
  {
    id: '1',
    title: 'Minha Música 1',
    artist: 'Seu nome aqui',
    album: 'Meu primeiro álbum',
    file: require('../../assets/audio/henriqueejulianooficial-desbeijar-minha-boca-c2f932ee.mp3'),
    colors: ['#1DB954', '#0B5E2B'],
    placeholder: true, // ← apague esta linha depois de trocar a música
  },
  {
    id: '2',
    title: 'Minha Música 2',
    artist: 'Seu nome aqui',
    album: 'Meu primeiro álbum',
    file: require('../../assets/audio/henriqueejulianooficial-lembranca-boa-9a51e0fc.mp3'),
    colors: ['#F26B3A', '#B3220F'],
    placeholder: true, // ← apague esta linha depois de trocar a música
  },
  {
    id: '3',
    title: 'Minha Música 3',
    artist: 'Seu nome aqui',
    album: 'Meu primeiro álbum',
    file: require('../../assets/audio/henriqueejulianooficial-quem-pegou-pegou-b0f3933d.mp3'),
    colors: ['#3A7BF2', '#12316E'],
    placeholder: true, // ← apague esta linha depois de trocar a música
  },
  {
    id: '4',
    title: 'Minha Música 4',
    artist: 'Seu nome aqui',
    album: 'Meu primeiro álbum',
    file: require('../../assets/audio/hungriahiphop-amor-e-fe-a4c807bb.mp3'),
    colors: ['#B23AF2', '#4B1075'],
    placeholder: true, // ← apague esta linha depois de trocar a música
  },
  {
    id: '5',
    title: 'Minha Música 5',
    artist: 'Seu nome aqui',
    album: 'Meu primeiro álbum',
    file: require('../../assets/audio/hungriahiphop-coracao-de-aco-wwwpalcomp3comdjmixer-djmixeroficial-7f241d60.mp3'),
    colors: ['#F2C53A', '#7A5600'],
    placeholder: true, // ← apague esta linha depois de trocar a música
  },
];


export function sourceOf(track) {
  if (track.file) return track.file;
  if (track.url) return track.url;
  return null;
}