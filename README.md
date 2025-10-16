# Black Jack

Um jogo de Black Jack completo com moedas simuladas, interface moderna e todas as funcionalidades clássicas do jogo.

## Características

- Interface moderna e intuitiva com React e Tailwind CSS
- Backend robusto com Node.js e Express
- Sistema de moedas simuladas
- **Modo Solo**: Jogue sozinho contra o dealer
- **Modo Online**: Jogue com até 6 amigos sem necessidade de login
- **Salas com Código**: Crie ou entre em salas usando códigos únicos de 6 caracteres
- Todas as ações do Black Jack: Hit, Stand, Double Down, Split
- Apostas laterais: Perfect Pairs e 21+3
- Regras oficiais do Black Jack
- Sincronização em tempo real entre jogadores

## Regras do Jogo

### Objetivo
Chegar o mais próximo possível de 21 pontos sem estourar, e ter uma mão melhor que o dealer.

### Ações Disponíveis

- **Pedir Carta (Hit)**: Recebe uma carta adicional
- **Parar (Stand)**: Mantém a mão atual
- **Dobrar (Double Down)**: Dobra a aposta e recebe apenas uma carta adicional (disponível apenas nas duas primeiras cartas)
- **Dividir (Split)**: Se tiver duas cartas do mesmo valor, pode dividir em duas mãos separadas

### Apostas Laterais

#### Perfect Pairs
Aposta se suas duas primeiras cartas formam um par:
- Par Perfeito (mesmo naipe): Paga 25:1
- Par Colorido (mesma cor): Paga 12:1
- Par Misto: Paga 6:1

#### 21+3
Aposta nas suas duas primeiras cartas mais a carta visível do dealer:
- Suited Trips: Paga 100:1
- Straight Flush: Paga 40:1
- Three of a Kind: Paga 30:1
- Straight: Paga 10:1
- Flush: Paga 5:1

## Instalação e Execução

### Pré-requisitos
- Node.js (versão 14 ou superior)
- npm ou yarn

### Backend

```bash
cd backend
npm install
npm start
```

O servidor rodará na porta 3001.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

A aplicação estará disponível em http://localhost:3000

## Estrutura do Projeto

```
black-jack/
├── backend/
│   ├── game/
│   │   ├── Deck.js        # Lógica do baralho
│   │   ├── Hand.js        # Lógica da mão
│   │   ├── Player.js      # Lógica do jogador
│   │   └── Game.js        # Lógica principal do jogo
│   ├── server.js          # Servidor Express
│   └── package.json
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── GameSetup.jsx    # Configuração inicial
    │   │   ├── BettingArea.jsx  # Área de apostas
    │   │   ├── GameTable.jsx    # Mesa do jogo
    │   │   └── Card.jsx         # Componente de carta
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── index.html
    └── package.json
```

## Como Jogar

### Modo Solo
1. Escolha "Jogar Solo"
2. Digite seu nome e saldo inicial
3. Faça sua aposta principal
4. (Opcional) Faça apostas laterais
5. Receba suas cartas e decida:
   - Pedir mais cartas
   - Parar
   - Dobrar a aposta
   - Dividir (se aplicável)
6. Veja o resultado e seus ganhos
7. Inicie uma nova rodada

### Modo Online (Multiplayer)
1. Escolha "Jogar Online"
2. **Criar Sala**:
   - Digite seu nome
   - Clique em "Criar Sala"
   - Compartilhe o código da sala com seus amigos
3. **Entrar em Sala**:
   - Digite seu nome
   - Digite o código da sala (6 caracteres)
   - Clique em "Entrar na Sala"
4. Aguarde todos os jogadores entrarem (máximo 6)
5. Clique em "Estou Pronto!" quando estiver preparado
6. O host inicia o jogo quando todos estiverem prontos
7. Jogue normalmente, cada jogador terá sua vez
8. Ao final da rodada, inicie uma nova ou saia da sala

## Tecnologias Utilizadas

- **Backend**: Node.js, Express
- **Frontend**: React, Tailwind CSS, Vite
- **HTTP Client**: Axios

## Funcionalidades Multiplayer

### Salas de Jogo
- Códigos únicos de 6 caracteres (ex: ABC123)
- Suporte para até 6 jogadores simultâneos
- Sistema de host (primeiro jogador)
- Sincronização automática entre jogadores
- Salas são automaticamente removidas após 30 minutos de inatividade

### Fluxo Multiplayer
1. **Lobby**: Jogadores entram e se preparam
2. **Apostas**: Cada jogador faz sua aposta
3. **Jogo**: Turnos alternados entre jogadores
4. **Resultados**: Todos veem os resultados simultaneamente
5. **Nova Rodada**: Host pode iniciar nova rodada

## Próximas Melhorias

- WebSocket para comunicação em tempo real (atualmente usa polling)
- Chat entre jogadores
- Histórico de jogadas
- Estatísticas do jogador
- Animações aprimoradas
- Sistema de ranking
- Diferentes variantes do Black Jack

