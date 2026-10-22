# PPDM_02 — Player de Música (I2HS)

Player de música para dispositivos móveis (Android/iOS) feito com **React Native + Expo**,
com visual inspirado no Spotify (escuro, capa grande, mini player no rodapé).

---

## 1. O que o app faz

- Lista as músicas da sua playlist
- Toca arquivos `.mp3` que ficam dentro do próprio projeto (`assets/audio/`)
- Tocar em uma música que **já está tocando** pausa / continua
- Barra de progresso arrastável (dá para pular para qualquer parte da música)
- Botões: anterior, próxima, play/pause
- Botão de **repetir** (desligado → todas → repetir uma)
- Botão de **modo aleatório** (shuffle)
- Controle de **volume**
- **Mini player** fixo no rodapé; ao tocar nele abre a tela do player completo
- Toca mesmo com o celular no silencioso e continua tocando com o app em segundo plano

---

## 2. Antes de rodar: coloque suas músicas ⚠️

Os arquivos `assets/audio/musica01.mp3` … `musica05.mp3` são **mudos de exemplo**
(gerados por `npm run audio:placeholder`, só para o app conseguir compilar). Troque
pelas suas músicas:

```
assets/audio/musica01.mp3   ←  seu arquivo de verdade
assets/audio/musica02.mp3
...
```

Os nomes podem ser quaisquer. Depois é só ajustar a lista em
[`src/data/playlist.js`](src/data/playlist.js) e apagar a linha
`placeholder: true` de cada música para o aviso da tela sumir.

> O `require()` do `.mp3` é resolvido pelo Metro na hora de gerar o bundle.
> Se um arquivo não existir, aparece o erro
> `Unable to resolve ".../musica01.mp3" from "src/data/playlist.js"`.
> Nesse caso, confira o nome do arquivo ou rode `npm run audio:placeholder`
> para recriar os exemplos.

---

## 3. Como rodar

```bash
npm install
npx expo start
```

Aparecerá um QR Code. Abra o app **Expo Go** no celular e escaneie.

- **Android**: conecte o celular por cabo (com depuração USB) e aperte `a`
- **iPhone**: leia o QR Code com a Câmera

> O app é para **celular** (Android/iOS). Rodar no navegador exigiria instalar o
> `react-native-web` e o `react-dom`, então o script `web` fica indisponível.

> Ao trocar os arquivos `.mp3`, reinicie o Metro para ele pegar os arquivos novos:
> ```bash
> npx expo start -c
> ```

### Gerar o APK (opcional)

```bash
npx eas build --profile preview --platform android
```

Precisa de uma conta gratuita no [expo.dev](https://expo.dev). Também é possível gerar
um build local com Android Studio instalado (`npx expo run:android`).

---

## 4. Como trocar / adicionar músicas

Tudo está em **um único arquivo**: [`src/data/playlist.js`](src/data/playlist.js).

```js
{
  id: '1',                                   // único
  title: 'Nome da música',
  artist: 'Nome do artista',
  album: 'Nome do álbum',                   // opcional
  file: require('../../assets/audio/musica01.mp3'),   // arquivo local
  // url: 'https://.../musica.mp3',          // ou streaming (em vez de file)
  // cover: require('../../assets/capa.jpg'), // capa real (opcional)
  colors: ['#1DB954', '#0B5E2B'],           // cores da capa automática
  duration: 185,                             // segundos (opcional)
  placeholder: true,                         // true = ainda é .mp3 mudo de exemplo
}
```

- **Arquivo local**: `require(...)` de um `.mp3` dentro de `assets/audio/`
- **Streaming**: troque `file` por `url: 'https://.../musica.mp3'`
- **Capa**: sem `cover`, o app desenha uma capa automática com as cores de `colors`
- Depois de editar: `npx expo start -c`

---

## 5. Estrutura do projeto

```
App.js                              ponto de entrada
index.js                            registra o App
app.json                            nome, ícones, cores do app
assets/
  audio/                            os seus .mp3
  images/                           ícones gerados
src/
  data/playlist.js                  ⭐ SUAS MÚSICAS (edite aqui)
  hooks/usePlayer.js                o motor de áudio (tocar/pausar/pular/repetir)
  screens/HomeScreen.js             a tela com a lista + player
  components/
    Artwork.js                      capa da música + barrinhas verdes animadas
    TrackRow.js                     uma linha da lista
    MiniPlayer.js                   player pequeno do rodapé
    FullPlayer.js                   tela do player completo
    Slider.js                       barra arrastável (progresso e volume)
  theme.js                          cores e medidas
  utils/formatTime.js               185 segundos -> "3:05"
  utils/audioValidation.js          avisa que os mp3 vieram vazios
scripts/generate-icons.mjs          gera os ícones do app
scripts/generate-placeholder-audio.mjs  gera .mp3 mudos de exemplo
```

---

## 6. Layout (estilo Spotify, simples)

```
┌──────────────────────────────┐
│ PLAYLIST                     │
│ Minhas Músicas               │  ← cabeçalho
│ 5 músicas              [🔀]  │
├──────────────────────────────┤
│ ▢  Música 1        3:05      │
│    Seu nome aqui             │  ← lista
│ ▢  Música 2                  │
│    Seu nome aqui             │
├──────────────────────────────┤
│ ▬▬▬▬▬▬▬▬░░░░░░░░░░░░░░░░░░░ │  ← progresso
│ ▢ Música 1   [▶]  [⏭]       │  ← mini player
└──────────────────────────────┘
```

Tocando no mini player abre a tela completa:

```
┌──────────────────────────────┐
│        ⌄   TOCANDO DA PLAYLIST│
│                              │
│        ┌────────────┐        │
│        │            │        │
│        │    CAPA    │        │  ← capa grande
│        │            │        │
│        └────────────┘        │
│                              │
│  Música 1                    │
│  Seu nome aqui               │
│                              │
│  ────────●──────────────     │  ← barra arrastável
│  0:42            3:05        │
│                              │
│   🔀   ⏮    ( ▶ )    ⏭   🔁  │
│                              │
│  🔉 ──────●──────────────     │  ← volume
└──────────────────────────────┘
```

---

## 7. Detalhes técnicos

| Item | Valor |
|---|---|
| SDK do Expo | 57 |
| React Native | 0.86.3 |
| React | 19.2.3 |
| Biblioteca de áudio | `expo-audio` |
| Ícones | `@expo/vector-icons` |
| Áreas seguras | `react-native-safe-area-context` |

O áudio é controlado pelo hook [`src/hooks/usePlayer.js`](src/hooks/usePlayer.js):

```js
const player = useAudioPlayer(null);        // cria o player
const status = useAudioPlayerStatus(player); // "espião" de tempo/duração

player.replace(source);  // troca a música
player.play();           // toca
player.pause();          // pausa
player.seekTo(30);       // pula para 30 segundos
player.volume = 0.5;     // volume
```

O `didJustFinish` (quando a música acaba) é o que faz a próxima tocar sozinha.