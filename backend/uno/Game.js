const UNODeck = require('./Deck')
const UNOPlayer = require('./Player')

class UNOGame {
  constructor(players = []) {
    this.deck = new UNODeck()
    this.players = players
    this.currentPlayerIndex = 0
    this.direction = 1 // 1 para horário, -1 para anti-horário
    this.gameState = 'waiting' // waiting, playing, finished
    this.chosenColor = null // Cor escolhida quando joga coringa
    this.drawStack = 0 // Contador de +2 e +4 acumulados
    this.lastAction = null
    this.winner = null
    this.lastPlayerWithOneCard = null // Guarda o último jogador que ficou com 1 carta
  }

  // Adiciona um jogador ao jogo
  addPlayer(player) {
    if (this.players.length >= 10) {
      throw new Error('Número máximo de jogadores atingido')
    }
    this.players.push(player)
  }

  // Inicia o jogo
  start() {
    if (this.players.length < 2) {
      throw new Error('Mínimo de 2 jogadores necessário')
    }

    // Cria e embaralha o baralho
    this.deck.create()
    this.deck.shuffle()

    // Distribui 7 cartas para cada jogador
    this.players.forEach(player => {
      player.reset()
      for (let i = 0; i < 7; i++) {
        player.addCard(this.deck.draw())
      }
    })

    // Inicia a pilha de descarte com uma carta numérica
    this.deck.startDiscardPile()

    // Define o estado do jogo
    this.gameState = 'playing'
    this.currentPlayerIndex = 0
    this.direction = 1
    this.chosenColor = null
    this.drawStack = 0
    this.winner = null
    this.lastAction = { type: 'game_started' }
  }

  // Obtém o jogador atual
  getCurrentPlayer() {
    return this.players[this.currentPlayerIndex]
  }

  // Passa para o próximo jogador
  nextPlayer() {
    this.currentPlayerIndex = (this.currentPlayerIndex + this.direction + this.players.length) % this.players.length
  }

  // Inverte a direção do jogo
  reverseDirection() {
    this.direction *= -1
    this.lastAction = { type: 'reverse', playerIndex: this.currentPlayerIndex }
  }

  // Pula o próximo jogador
  skipNextPlayer() {
    const skippedIndex = (this.currentPlayerIndex + this.direction + this.players.length) % this.players.length
    this.lastAction = { 
      type: 'skip', 
      playerIndex: this.currentPlayerIndex,
      skippedPlayerIndex: skippedIndex
    }
    this.nextPlayer() // Pula o jogador
  }

  // Força um jogador a comprar cartas
  forceDrawCards(playerIndex, count) {
    const player = this.players[playerIndex]
    const drawnCards = []
    
    for (let i = 0; i < count; i++) {
      const card = this.deck.draw()
      player.addCard(card)
      drawnCards.push(card)
    }
    
    return drawnCards
  }

  // Jogador compra uma carta
  drawCard(playerIndex) {
    if (this.gameState !== 'playing') {
      throw new Error('Jogo não está em andamento')
    }

    if (playerIndex !== this.currentPlayerIndex) {
      throw new Error('Não é a vez deste jogador')
    }

    const player = this.players[playerIndex]

    // Verifica se o jogador anterior esqueceu de gritar UNO
    this.checkUnoPenalty(playerIndex)
    
    // Se houver +2 ou +4 acumulados, tem que comprar todos
    if (this.drawStack > 0) {
      const drawnCards = this.forceDrawCards(playerIndex, this.drawStack)
      this.lastAction = {
        type: 'draw_penalty',
        playerIndex,
        count: this.drawStack,
        cards: drawnCards
      }
      this.drawStack = 0
      this.nextPlayer()
      return { mustDraw: true, count: drawnCards.length, cards: drawnCards }
    }

    // Compra normal
    const card = this.deck.draw()
    player.addCard(card)

    const topCard = this.deck.getTopCard()
    const canPlay = player.canPlayCard(card, topCard, this.chosenColor)

    this.lastAction = {
      type: 'draw',
      playerIndex,
      canPlay,
      card
    }

    // Não passa automaticamente - jogador decide se joga ou passa
    return { 
      canPlay, 
      card,
      drawnCardIndex: player.hand.length - 1 // Índice da carta comprada
    }
  }

  // Jogador passa a vez (após comprar carta)
  passTurn(playerIndex) {
    if (this.gameState !== 'playing') {
      throw new Error('Jogo não está em andamento')
    }

    if (playerIndex !== this.currentPlayerIndex) {
      throw new Error('Não é a vez deste jogador')
    }

    this.lastAction = {
      type: 'pass',
      playerIndex
    }

    this.nextPlayer()
    
    return { success: true, passed: true }
  }

  // Jogador joga uma carta
  playCard(playerIndex, cardIndex, chosenColor = null) {
    if (this.gameState !== 'playing') {
      throw new Error('Jogo não está em andamento')
    }

    if (playerIndex !== this.currentPlayerIndex) {
      throw new Error('Não é a vez deste jogador')
    }

    const player = this.players[playerIndex]

    // Verifica se o jogador anterior esqueceu de gritar UNO
    this.checkUnoPenalty(playerIndex)

    const topCard = this.deck.getTopCard()
    const card = player.hand[cardIndex]

    if (!card) {
      throw new Error('Carta não encontrada')
    }

    // Verifica se há +2 ou +4 acumulados
    if (this.drawStack > 0) {
      // Só pode jogar outro +2 ou +4
      if (card.type === 'draw_two' && this.drawStack % 2 === 0) {
        // OK, pode jogar +2 em cima de +2
      } else if (card.type === 'wild_draw_four') {
        // OK, pode jogar +4
      } else {
        throw new Error('Deve comprar as cartas ou jogar outro +2/+4')
      }
    } else {
      // Validação normal
      if (!player.canPlayCard(card, topCard, this.chosenColor)) {
        throw new Error('Carta não pode ser jogada')
      }
    }

    // Remove a carta da mão
    const playedCard = player.playCard(cardIndex)

    // Descarta a carta
    this.deck.discard(playedCard)

    // Processa efeitos especiais
    this.processCardEffect(playedCard, playerIndex, chosenColor)

    // Verifica se o jogador ganhou
    if (player.hasWon()) {
      this.gameState = 'finished'
      this.winner = player
      this.lastAction = {
        type: 'win',
        playerIndex,
        player: player.toJSON()
      }
      return { won: true, winner: player.toJSON() }
    }

    // Se ficou com 1 carta, marca que precisa gritar UNO
    const needsUno = player.hand.length === 1 && !player.saidUno
    
    // Registra o jogador que ficou com 1 carta para verificação futura
    if (player.hand.length === 1 && !player.saidUno) {
      this.lastPlayerWithOneCard = playerIndex
    } else if (player.hand.length === 0 || player.saidUno) {
      // Limpa se ganhou ou gritou UNO
      if (this.lastPlayerWithOneCard === playerIndex) {
        this.lastPlayerWithOneCard = null
      }
    }

    // Passa para o próximo jogador (se a carta jogada não causar pulo)
    if (playedCard.type !== 'skip' && playedCard.type !== 'reverse') {
      this.nextPlayer()
    }

    return { 
      success: true, 
      card: playedCard,
      needsUno,
      cardsLeft: player.hand.length
    }
  }

  // Processa efeitos especiais das cartas
  processCardEffect(card, playerIndex, chosenColor = null) {
    switch (card.type) {
      case 'skip':
        this.skipNextPlayer()
        this.nextPlayer() // O jogador que pulou passa também
        break

      case 'reverse':
        // Se for apenas 2 jogadores, reverse funciona como skip
        if (this.players.length === 2) {
          this.lastAction = { 
            type: 'skip_by_reverse', 
            playerIndex 
          }
        } else {
          this.reverseDirection()
        }
        this.nextPlayer()
        break

      case 'draw_two':
        this.drawStack += 2
        this.lastAction = {
          type: 'draw_two',
          playerIndex,
          drawStack: this.drawStack
        }
        break

      case 'wild':
        if (!chosenColor || !['red', 'blue', 'green', 'yellow'].includes(chosenColor)) {
          throw new Error('Deve escolher uma cor válida')
        }
        this.chosenColor = chosenColor
        this.lastAction = {
          type: 'wild',
          playerIndex,
          chosenColor
        }
        break

      case 'wild_draw_four':
        if (!chosenColor || !['red', 'blue', 'green', 'yellow'].includes(chosenColor)) {
          throw new Error('Deve escolher uma cor válida')
        }
        this.chosenColor = chosenColor
        this.drawStack += 4
        this.lastAction = {
          type: 'wild_draw_four',
          playerIndex,
          chosenColor,
          drawStack: this.drawStack
        }
        break

      default:
        this.lastAction = {
          type: 'play',
          playerIndex,
          card
        }
        // Reseta a cor escolhida se não for coringa
        this.chosenColor = null
    }
  }

  // Verifica se algum jogador esqueceu de gritar UNO
  checkUnoPenalty(currentPlayerIndex) {
    // Se há um jogador registrado que ficou com 1 carta
    if (this.lastPlayerWithOneCard !== null && this.lastPlayerWithOneCard !== currentPlayerIndex) {
      const playerWithOneCard = this.players[this.lastPlayerWithOneCard]
      
      // Se ainda tem 1 carta e não gritou UNO, aplica penalidade
      if (playerWithOneCard && playerWithOneCard.hand.length === 1 && !playerWithOneCard.saidUno) {
        this.forceDrawCards(this.lastPlayerWithOneCard, 2)
        this.lastAction = {
          ...this.lastAction,
          unoPenalty: {
            playerIndex: this.lastPlayerWithOneCard,
            playerName: playerWithOneCard.name
          }
        }
        this.lastPlayerWithOneCard = null // Limpa após aplicar penalidade
      }
    }
  }

  // Verifica se o jogador tem defesa contra +2 ou +4
  hasDrawStackDefense(playerIndex) {
    const player = this.players[playerIndex]
    
    if (this.drawStack === 0) return { hasDefense: false }
    
    // Se o drawStack é múltiplo de 2 (só +2), pode defender com +2
    if (this.drawStack % 2 === 0 && this.drawStack <= 8) {
      const hasPlusTwo = player.hand.some(card => card.type === 'draw_two')
      const hasPlusFour = player.hand.some(card => card.type === 'wild_draw_four')
      
      if (hasPlusTwo || hasPlusFour) {
        return { 
          hasDefense: true,
          canPlayPlusTwo: hasPlusTwo,
          canPlayPlusFour: hasPlusFour
        }
      }
    }
    
    // Sempre pode defender com +4
    const hasPlusFour = player.hand.some(card => card.type === 'wild_draw_four')
    if (hasPlusFour) {
      return { 
        hasDefense: true,
        canPlayPlusFour: hasPlusFour
      }
    }
    
    return { hasDefense: false }
  }

  // Jogador grita UNO
  sayUno(playerIndex) {
    const player = this.players[playerIndex]
    const success = player.sayUno()
    
    // Se gritou UNO com sucesso, limpa o registro
    if (success && this.lastPlayerWithOneCard === playerIndex) {
      this.lastPlayerWithOneCard = null
    }
    
    return success
  }

  // Obtém o estado do jogo
  getGameState() {
    return {
      gameState: this.gameState,
      currentPlayerIndex: this.currentPlayerIndex,
      direction: this.direction,
      topCard: this.deck.getTopCard(),
      chosenColor: this.chosenColor,
      drawStack: this.drawStack,
      remainingCards: this.deck.getRemainingCards(),
      players: this.players.map((p, idx) => ({
        ...p.toJSON(true), // Esconde as cartas dos outros
        isCurrentPlayer: idx === this.currentPlayerIndex
      })),
      lastAction: this.lastAction,
      winner: this.winner ? this.winner.toJSON() : null
    }
  }

  // Obtém o estado completo do jogo para um jogador específico
  getPlayerView(playerId) {
    const state = this.getGameState()
    const player = this.players.find(p => p.id === playerId)
    
    if (player) {
      state.myHand = player.hand
      state.myIndex = this.players.indexOf(player)
      state.isMyTurn = this.currentPlayerIndex === state.myIndex
      
      // Se for a vez do jogador e houver drawStack, verifica se tem defesa
      if (state.isMyTurn && this.drawStack > 0) {
        state.drawStackDefense = this.hasDrawStackDefense(state.myIndex)
      }
    }
    
    return state
  }
}

module.exports = UNOGame

