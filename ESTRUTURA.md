# Estrutura do Projeto Black Jack

## Visão Geral

```
black-jack/
├── README.md              # Documentação principal
├── MULTIPLAYER.md         # Guia multiplayer
├── TESTES.md              # Guia de testes
├── ESTRUTURA.md           # Este arquivo
├── .gitignore             # Arquivos ignorados pelo Git
│
├── backend/               # Servidor Node.js
│   ├── package.json       # Dependências do backend
│   ├── package-lock.json  # Lock de dependências
│   ├── server.js          # Servidor Express (API REST)
│   ├── validar.js         # Script de validação/testes
│   ├── start.sh           # Script de inicialização
│   │
│   └── game/              # Lógica do jogo
│       ├── Deck.js        # Baralho (52 cartas)
│       ├── Hand.js        # Mão do jogador/dealer
│       ├── Player.js      # Jogador
│       └── Game.js        # Lógica principal do jogo
│
└── frontend/              # Interface React
    ├── package.json       # Dependências do frontend
    ├── vite.config.js     # Configuração do Vite
    ├── tailwind.config.js # Configuração do Tailwind
    ├── postcss.config.js  # Configuração do PostCSS
    ├── index.html         # HTML principal
    ├── start.sh           # Script de inicialização
    │
    └── src/               # Código fonte React
        ├── main.jsx       # Entry point
        ├── App.jsx        # Componente raiz
        ├── index.css      # Estilos globais
        │
        └── components/    # Componentes React
            ├── ModeSelector.jsx      # Escolha de modo (solo/online)
            ├── GameSetup.jsx         # Tela inicial (solo)
            ├── BettingArea.jsx       # Área de apostas (solo)
            ├── GameTable.jsx         # Mesa do jogo (solo)
            ├── RoomSetup.jsx         # Criar/entrar em sala
            ├── RoomLobby.jsx         # Lobby de espera
            ├── MultiplayerGame.jsx   # Jogo multiplayer
            └── Card.jsx              # Componente de carta
```

## Detalhamento dos Arquivos

### Backend

#### `server.js` - Servidor Express
- Gerencia todas as rotas da API
- Mantém estado dos jogos e salas em memória
- Endpoints Solo:
  - POST `/api/game/create` - Criar jogo
  - POST `/api/game/:gameId/join` - Entrar no jogo
  - POST `/api/game/:gameId/bet` - Fazer aposta
  - POST `/api/game/:gameId/deal` - Distribuir cartas
  - POST `/api/game/:gameId/hit` - Pedir carta
  - POST `/api/game/:gameId/stand` - Parar
  - POST `/api/game/:gameId/double` - Dobrar aposta
  - POST `/api/game/:gameId/split` - Dividir mão
  - GET `/api/game/:gameId/state` - Obter estado
  - POST `/api/game/:gameId/reset` - Nova rodada
- Endpoints Multiplayer:
  - POST `/api/room/create` - Criar sala
  - POST `/api/room/:roomCode/join` - Entrar na sala
  - POST `/api/room/:roomCode/leave` - Sair da sala
  - POST `/api/room/:roomCode/ready` - Marcar como pronto
  - POST `/api/room/:roomCode/start` - Iniciar jogo
  - GET `/api/room/:roomCode/state` - Obter estado da sala
  - POST `/api/room/:roomCode/bet` - Fazer aposta
  - POST `/api/room/:roomCode/deal` - Distribuir cartas
  - POST `/api/room/:roomCode/hit` - Pedir carta
  - POST `/api/room/:roomCode/stand` - Parar
  - POST `/api/room/:roomCode/double` - Dobrar
  - POST `/api/room/:roomCode/split` - Dividir
  - POST `/api/room/:roomCode/reset` - Nova rodada

#### `game/Deck.js` - Baralho
- Cria baralho de 52 cartas
- Embaralha as cartas
- Compra cartas
- Auto-reset quando acabam as cartas

#### `game/Hand.js` - Mão
- Gerencia cartas da mão
- Calcula valor (considera Ás como 1 ou 11)
- Detecta Blackjack, bust
- Verifica possibilidade de split/double
- Calcula apostas laterais (Perfect Pairs, 21+3)

#### `game/Player.js` - Jogador
- Gerencia saldo do jogador
- Mantém múltiplas mãos (para split)
- Controla apostas

#### `game/Game.js` - Lógica Principal
- Orquestra todo o jogo
- Gerencia turnos
- Executa ações (hit, stand, double, split)
- Calcula ganhos
- Processa apostas laterais

#### `game/Room.js` - Sistema de Salas
- Gerencia salas multiplayer
- Códigos únicos de 6 caracteres
- Máximo 6 jogadores por sala
- Sistema de host
- Controle de prontos
- Integração com Game.js

### Frontend

#### `App.jsx` - Componente Principal
- Gerencia estado global do jogo
- Controla fluxo entre telas
- Atualiza estado periodicamente
- Coordena comunicação com backend

#### `components/GameSetup.jsx` - Tela Inicial
- Input do nome do jogador
- Definição do saldo inicial
- Criação do jogo
- Interface limpa e moderna

#### `components/BettingArea.jsx` - Área de Apostas
- Input da aposta principal
- Apostas laterais (Perfect Pairs, 21+3)
- Botões de aposta rápida
- Validação de saldo

#### `components/GameTable.jsx` - Mesa do Jogo
- Mostra cartas do dealer
- Mostra cartas do jogador
- Botões de ação (Hit, Stand, Double, Split)
- Exibe resultados
- Botão de nova rodada

#### `components/ModeSelector.jsx` - Seletor de Modo
- Tela inicial
- Escolha entre Solo e Online
- Design moderno

#### `components/RoomSetup.jsx` - Configuração de Sala
- Criar nova sala
- Entrar em sala existente
- Validação de código

#### `components/RoomLobby.jsx` - Lobby de Espera
- Lista de jogadores
- Status de pronto
- Indicador de host
- Iniciar jogo

#### `components/MultiplayerGame.jsx` - Jogo Multiplayer
- Mesa compartilhada
- Visualização de todos os jogadores
- Indicador de turno
- Sincronização em tempo real

#### `components/Card.jsx` - Carta
- Renderiza carta visualmente
- Mostra naipe e valor
- Carta virada (hidden)
- Cores corretas (vermelho/preto)

## Fluxo de Dados

### Modo Solo
```
1. ModeSelector: Escolhe "Solo"
   ↓
2. GameSetup: Cria jogo e jogador
   ↓ POST /api/game/create
   ↓ POST /api/game/:gameId/join
3. Backend cria Game e Player
   ↓
4. BettingArea: Usuário faz aposta
   ↓ POST /api/game/:gameId/bet
5. Backend registra aposta
   ↓ POST /api/game/:gameId/deal
6. Backend distribui cartas
   ↓
7. GameTable: Usuário joga
   ↓ POST /api/game/:gameId/hit|stand|double|split
8. Backend processa ação
   ↓ GET /api/game/:gameId/state (polling)
9. Frontend atualiza interface
   ↓
10. Fim do jogo: Mostra resultados
    ↓ POST /api/game/:gameId/reset
11. Nova rodada
```

### Modo Multiplayer
```
1. ModeSelector: Escolhe "Online"
   ↓
2. RoomSetup: Cria ou entra em sala
   ↓ POST /api/room/create ou POST /api/room/:code/join
3. Backend cria/adiciona à Room
   ↓
4. RoomLobby: Aguarda jogadores
   ↓ POST /api/room/:code/ready
   ↓ GET /api/room/:code/state (polling)
5. Host inicia jogo
   ↓ POST /api/room/:code/start
6. Backend cria Game na Room
   ↓
7. MultiplayerGame: Fase de apostas
   ↓ POST /api/room/:code/bet (cada jogador)
8. Backend registra apostas
   ↓ POST /api/room/:code/deal (automático)
9. Backend distribui cartas
   ↓
10. Jogadores jogam em turnos
    ↓ POST /api/room/:code/hit|stand|double|split
11. Backend processa ações
    ↓ GET /api/room/:code/state (polling - todos)
12. Todos veem atualizações
    ↓
13. Fim do jogo: Resultados
    ↓ POST /api/room/:code/reset
14. Nova rodada ou sair
```

## Tecnologias Utilizadas

### Backend
- **Node.js** - Runtime JavaScript
- **Express** - Framework web
- **CORS** - Permitir requisições do frontend
- **UUID** - Geração de IDs únicos

### Frontend
- **React 18** - Biblioteca UI
- **Vite** - Build tool rápido
- **Tailwind CSS** - Framework CSS utility-first
- **Axios** - Cliente HTTP

## Recursos Implementados

### Regras do Black Jack
- ✅ Baralho de 52 cartas
- ✅ Valores corretos das cartas
- ✅ Ás vale 1 ou 11
- ✅ Dealer para em 17+
- ✅ Blackjack paga 2.5:1
- ✅ Vitória paga 2:1
- ✅ Empate devolve aposta

### Ações do Jogador
- ✅ Hit (Pedir Carta)
- ✅ Stand (Parar)
- ✅ Double Down (Dobrar)
- ✅ Split (Dividir)

### Sistema de Moedas
- ✅ Saldo simulado
- ✅ Apostas
- ✅ Ganhos/perdas
- ✅ Validação de saldo

### Apostas Laterais
- ✅ Perfect Pairs (25:1, 12:1, 6:1)
- ✅ 21+3 (100:1, 40:1, 30:1, 10:1, 5:1)

### Multiplayer
- ✅ Salas com código único (6 caracteres)
- ✅ Até 6 jogadores por sala
- ✅ Sistema de host
- ✅ Lobby de espera
- ✅ Sincronização via polling (1s)
- ✅ Turnos alternados
- ✅ Limpeza automática de salas vazias

### Interface
- ✅ Design moderno com Tailwind
- ✅ Cores do tema (verde mesa, dourado)
- ✅ Gradientes e animações
- ✅ Feedback visual
- ✅ Responsiva
- ✅ Seletor de modo
- ✅ Interface multiplayer

## Próximos Passos

### Melhorias Planejadas
1. WebSocket para multiplayer real-time
2. Persistência de dados (banco de dados)
3. Autenticação de usuários
4. Ranking de jogadores
5. Histórico de jogadas
6. Estatísticas detalhadas
7. Diferentes variantes do Black Jack
8. Modo torneio
9. Achievements/conquistas
10. Temas personalizáveis

