const Game = require('./Game');

class Room {
  constructor(roomCode, hostName) {
    this.roomCode = roomCode;
    this.hostName = hostName;
    this.players = [];
    this.maxPlayers = 6;
    this.game = null;
    this.gameStarted = false;
    this.createdAt = Date.now();
  }

  generateRoomCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  addPlayer(playerId, playerName, balance = 1000) {
    if (this.players.length >= this.maxPlayers) {
      return { success: false, message: 'Sala está cheia' };
    }

    if (this.players.find(p => p.id === playerId)) {
      return { success: false, message: 'Jogador já está na sala' };
    }

    if (this.gameStarted) {
      return { success: false, message: 'Jogo já começou' };
    }

    const player = {
      id: playerId,
      name: playerName,
      balance: balance,
      isReady: false,
      isHost: this.players.length === 0
    };

    this.players.push(player);

    return { success: true, player };
  }

  removePlayer(playerId) {
    const index = this.players.findIndex(p => p.id === playerId);
    if (index === -1) return false;

    const wasHost = this.players[index].isHost;
    this.players.splice(index, 1);

    if (wasHost && this.players.length > 0) {
      this.players[0].isHost = true;
    }

    if (this.game) {
      const gamePlayer = this.game.getPlayer(playerId);
      if (gamePlayer) {
        const playerIndex = this.game.players.indexOf(gamePlayer);
        if (playerIndex > -1) {
          this.game.players.splice(playerIndex, 1);
        }
      }
    }

    return true;
  }

  setPlayerReady(playerId, isReady) {
    const player = this.players.find(p => p.id === playerId);
    if (!player) return false;

    player.isReady = isReady;
    return true;
  }

  canStartGame() {
    return this.players.length >= 1 && 
           this.players.every(p => p.isReady) && 
           !this.gameStarted;
  }

  startGame() {
    if (!this.canStartGame()) {
      return { success: false, message: 'Nem todos os jogadores estão prontos' };
    }

    this.game = new Game(this.roomCode);
    
    for (const player of this.players) {
      this.game.addPlayer(player.id, player.name, player.balance);
    }

    this.gameStarted = true;

    return { success: true };
  }

  resetGame() {
    if (this.game) {
      this.game.reset();
    }
    
    this.players.forEach(p => p.isReady = false);
    this.gameStarted = false;
  }

  updatePlayerBalance(playerId, newBalance) {
    const player = this.players.find(p => p.id === playerId);
    if (player) {
      player.balance = newBalance;
    }
  }

  getRoomState() {
    return {
      roomCode: this.roomCode,
      hostName: this.hostName,
      players: this.players.map(p => ({
        id: p.id,
        name: p.name,
        balance: p.balance,
        isReady: p.isReady,
        isHost: p.isHost
      })),
      maxPlayers: this.maxPlayers,
      gameStarted: this.gameStarted,
      canStart: this.canStartGame(),
      gameState: this.game ? this.game.getGameState() : null
    };
  }
}

module.exports = Room;

