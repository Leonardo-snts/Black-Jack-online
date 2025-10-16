const UNOGame = require('./Game')
const UNOPlayer = require('./Player')

class UNORoom {
  constructor(roomCode) {
    this.roomCode = roomCode
    this.players = []
    this.game = null
    this.maxPlayers = 10
    this.minPlayers = 2
    this.status = 'waiting' // waiting, playing, finished
  }

  // Adiciona um jogador à sala
  addPlayer(playerId, playerName) {
    if (this.players.length >= this.maxPlayers) {
      throw new Error('Sala cheia')
    }

    if (this.players.find(p => p.id === playerId)) {
      throw new Error('Jogador já está na sala')
    }

    const player = new UNOPlayer(playerId, playerName)
    this.players.push(player)

    return player
  }

  // Remove um jogador da sala
  removePlayer(playerId) {
    const index = this.players.findIndex(p => p.id === playerId)
    if (index !== -1) {
      this.players.splice(index, 1)
      
      // Se o jogo estava em andamento e ficou com menos de 2 jogadores, cancela
      if (this.status === 'playing' && this.players.length < this.minPlayers) {
        this.status = 'waiting'
        this.game = null
      }
    }
  }

  // Define jogador como pronto
  setPlayerReady(playerId, ready = true) {
    const player = this.players.find(p => p.id === playerId)
    if (player) {
      player.isReady = ready
    }
  }

  // Verifica se todos os jogadores estão prontos
  allPlayersReady() {
    return this.players.length >= this.minPlayers && 
           this.players.every(p => p.isReady)
  }

  // Inicia o jogo
  startGame() {
    if (this.players.length < this.minPlayers) {
      throw new Error(`Mínimo de ${this.minPlayers} jogadores necessário`)
    }

    if (!this.allPlayersReady()) {
      throw new Error('Nem todos os jogadores estão prontos')
    }

    this.game = new UNOGame(this.players)
    this.game.start()
    this.status = 'playing'

    return this.game.getGameState()
  }

  // Obtém o estado da sala
  getRoomState() {
    return {
      roomCode: this.roomCode,
      status: this.status,
      players: this.players.map(p => p.toJSON(true)),
      playerCount: this.players.length,
      maxPlayers: this.maxPlayers,
      gameState: this.game ? this.game.getGameState() : null
    }
  }

  // Obtém o estado da sala para um jogador específico
  getPlayerView(playerId) {
    const roomState = this.getRoomState()
    
    if (this.game) {
      roomState.gameState = this.game.getPlayerView(playerId)
    }
    
    return roomState
  }

  // Jogador joga uma carta
  playCard(playerId, cardIndex, chosenColor = null) {
    if (!this.game) {
      throw new Error('Jogo não iniciado')
    }

    const playerIndex = this.players.findIndex(p => p.id === playerId)
    if (playerIndex === -1) {
      throw new Error('Jogador não encontrado')
    }

    return this.game.playCard(playerIndex, cardIndex, chosenColor)
  }

  // Jogador compra uma carta
  drawCard(playerId) {
    if (!this.game) {
      throw new Error('Jogo não iniciado')
    }

    const playerIndex = this.players.findIndex(p => p.id === playerId)
    if (playerIndex === -1) {
      throw new Error('Jogador não encontrado')
    }

    return this.game.drawCard(playerIndex)
  }

  // Jogador passa a vez
  passTurn(playerId) {
    if (!this.game) {
      throw new Error('Jogo não iniciado')
    }

    const playerIndex = this.players.findIndex(p => p.id === playerId)
    if (playerIndex === -1) {
      throw new Error('Jogador não encontrado')
    }

    return this.game.passTurn(playerIndex)
  }

  // Jogador grita UNO
  sayUno(playerId) {
    if (!this.game) {
      throw new Error('Jogo não iniciado')
    }

    const playerIndex = this.players.findIndex(p => p.id === playerId)
    if (playerIndex === -1) {
      throw new Error('Jogador não encontrado')
    }

    return this.game.sayUno(playerIndex)
  }

  // Reinicia o jogo
  restartGame() {
    if (this.players.length < this.minPlayers) {
      throw new Error(`Mínimo de ${this.minPlayers} jogadores necessário`)
    }

    // Reseta o estado de pronto de todos os jogadores
    this.players.forEach(p => p.isReady = false)
    this.status = 'waiting'
    this.game = null

    return this.getRoomState()
  }
}

module.exports = UNORoom

