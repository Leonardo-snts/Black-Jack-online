# 🎴 Guia do Jogo UNO

## Como Jogar

### 1. Acessar o Jogo
- Na tela inicial, selecione **UNO**
- O jogo é apenas multiplayer online (2-10 jogadores)

### 2. Criar ou Entrar em uma Sala
- **Criar Sala**: Digite seu nome e crie uma nova sala
- **Entrar em Sala**: Digite seu nome e o código da sala de 6 caracteres
- Compartilhe o código com seus amigos

### 3. Lobby
- Aguarde os jogadores entrarem
- Todos devem clicar em "Estou Pronto!"
- Quando todos estiverem prontos, clique em "Iniciar Jogo"

### 4. Jogando

#### Objetivo
Ser o primeiro a ficar sem cartas na mão!

#### Regras Básicas
- Cada jogador começa com 7 cartas
- Você só pode jogar uma carta se:
  - For da mesma **cor** da carta do topo
  - For do mesmo **número/símbolo** da carta do topo
  - For um **coringa** (pode jogar a qualquer momento)

#### Cartas Especiais

**Cartas de Ação (por cor):**
- **+2**: O próximo jogador compra 2 cartas e perde a vez
- **⇄ Inverter**: Inverte a direção do jogo
- **⊘ Pular**: O próximo jogador perde a vez

**Coringas:**
- **◆ Coringa**: Escolha a cor e o jogo continua
- **+4 Coringa**: Escolha a cor e o próximo jogador compra 4 cartas

#### Acúmulo de +2 e +4
- Se receber um +2, você pode jogar outro +2 para passar adiante
- Se receber um +4, você pode jogar outro +4 para acumular
- Se não tiver, compra todas as cartas acumuladas

#### UNO!
- Quando você tiver apenas **1 carta**, clique em "Gritar UNO!"
- Se esquecer e outro jogador perceber, você compra 2 cartas de penalidade

### 5. Sua Vez
- **Jogar Carta**: Clique na carta que deseja jogar
  - Se for coringa, escolha a cor
- **Comprar Carta**: Clique na pilha de compra
  - Se a carta comprada puder ser jogada, você pode jogá-la
  - Senão, perde a vez

### 6. Vitória
- O primeiro jogador a ficar sem cartas vence!
- Clique em "Jogar Novamente" para uma nova partida

## Dicas Estratégicas

1. **Guarde coringas** para momentos críticos
2. **Observe as cartas dos adversários** - quem tem poucas cartas?
3. **Use cartas de ação** estrategicamente para atrapalhar os oponentes
4. **Não esqueça do UNO!** - Sempre grite quando tiver 1 carta
5. **Acumule +2 e +4** quando possível para prejudicar muito o próximo

## API Endpoints (Desenvolvedor)

### Salas
- `POST /api/uno/room/create` - Criar sala
- `POST /api/uno/room/:roomCode/join` - Entrar em sala
- `POST /api/uno/room/:roomCode/leave` - Sair da sala
- `POST /api/uno/room/:roomCode/ready` - Marcar pronto
- `POST /api/uno/room/:roomCode/start` - Iniciar jogo
- `GET /api/uno/room/:roomCode/state` - Obter estado da sala

### Jogo
- `POST /api/uno/room/:roomCode/play` - Jogar carta
- `POST /api/uno/room/:roomCode/draw` - Comprar carta
- `POST /api/uno/room/:roomCode/uno` - Gritar UNO
- `POST /api/uno/room/:roomCode/restart` - Reiniciar jogo

## Estrutura de Arquivos

### Backend
```
backend/uno/
├── Deck.js      # Baralho de 108 cartas
├── Player.js    # Gerenciamento de jogadores
├── Game.js      # Lógica principal do jogo
└── Room.js      # Salas multiplayer
```

### Frontend
```
frontend/src/components/uno/
├── UNOCard.jsx        # Componente de carta colorida
├── UNORoomSetup.jsx   # Criar/entrar em sala
├── UNORoomLobby.jsx   # Lobby com ready check
└── UNOGameTable.jsx   # Mesa de jogo principal
```

## Diferenças do Black Jack

| Característica | Black Jack | UNO |
|----------------|------------|-----|
| Jogadores | 1-6 | 2-10 |
| Modo Solo | ✅ Sim | ❌ Não |
| Modo Online | ✅ Sim | ✅ Sim |
| Tipo de Jogo | Cartas vs Dealer | Turnos entre jogadores |
| Objetivo | Chegar em 21 | Ficar sem cartas |
| Modo 3D | ✅ Sim | ❌ Não |

## Problemas Conhecidos e Soluções

### Sala não encontrada
- Verifique se o código está correto (6 caracteres)
- A sala pode ter expirado (30 minutos de inatividade)

### Não consigo jogar carta
- Verifique se é sua vez
- A carta deve ser da mesma cor ou valor
- Coringas podem sempre ser jogados

### Esqueci de gritar UNO
- Você receberá 2 cartas de penalidade
- Lembre-se de clicar no botão quando tiver 1 carta!

---

**Desenvolvido como extensão do projeto Black Jack**
**Divirta-se jogando UNO! 🎉**

