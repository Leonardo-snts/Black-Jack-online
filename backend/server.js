const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const Game = require('./game/Game');
const Room = require('./game/Room');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const games = new Map();
const rooms = new Map();

function generateRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

app.post('/api/game/create', (req, res) => {
  const gameId = uuidv4();
  const game = new Game(gameId);
  games.set(gameId, game);
  
  res.json({ gameId, message: 'Jogo criado com sucesso' });
});

app.post('/api/game/:gameId/join', (req, res) => {
  const { gameId } = req.params;
  const { playerName, balance } = req.body;
  
  const game = games.get(gameId);
  if (!game) {
    return res.status(404).json({ error: 'Jogo não encontrado' });
  }

  const playerId = uuidv4();
  const player = game.addPlayer(playerId, playerName, balance || 1000);
  
  res.json({ 
    playerId, 
    player: {
      id: player.id,
      name: player.name,
      balance: player.balance
    }
  });
});

app.post('/api/game/:gameId/bet', (req, res) => {
  const { gameId } = req.params;
  const { playerId, amount, sideBets } = req.body;
  
  const game = games.get(gameId);
  if (!game) {
    return res.status(404).json({ error: 'Jogo não encontrado' });
  }

  const result = game.placeBet(playerId, amount, sideBets);
  
  if (!result.success) {
    return res.status(400).json({ error: result.message });
  }

  res.json({ message: 'Aposta realizada com sucesso' });
});

app.post('/api/game/:gameId/deal', (req, res) => {
  const { gameId } = req.params;
  
  const game = games.get(gameId);
  if (!game) {
    return res.status(404).json({ error: 'Jogo não encontrado' });
  }

  game.dealInitialCards();
  
  res.json({ 
    message: 'Cartas distribuídas',
    gameState: game.getGameState()
  });
});

app.post('/api/game/:gameId/hit', (req, res) => {
  const { gameId } = req.params;
  const { playerId } = req.body;
  
  const game = games.get(gameId);
  if (!game) {
    return res.status(404).json({ error: 'Jogo não encontrado' });
  }

  const result = game.hit(playerId);
  
  if (!result.success) {
    return res.status(400).json({ error: result.message });
  }

  res.json({ 
    ...result,
    gameState: game.getGameState()
  });
});

app.post('/api/game/:gameId/stand', (req, res) => {
  const { gameId } = req.params;
  const { playerId } = req.body;
  
  const game = games.get(gameId);
  if (!game) {
    return res.status(404).json({ error: 'Jogo não encontrado' });
  }

  const result = game.stand(playerId);
  
  if (!result.success) {
    return res.status(400).json({ error: result.message });
  }

  res.json({ 
    ...result,
    gameState: game.getGameState()
  });
});

app.post('/api/game/:gameId/double', (req, res) => {
  const { gameId } = req.params;
  const { playerId } = req.body;
  
  const game = games.get(gameId);
  if (!game) {
    return res.status(404).json({ error: 'Jogo não encontrado' });
  }

  const result = game.doubleDown(playerId);
  
  if (!result.success) {
    return res.status(400).json({ error: result.message });
  }

  res.json({ 
    ...result,
    gameState: game.getGameState()
  });
});

app.post('/api/game/:gameId/split', (req, res) => {
  const { gameId } = req.params;
  const { playerId } = req.body;
  
  const game = games.get(gameId);
  if (!game) {
    return res.status(404).json({ error: 'Jogo não encontrado' });
  }

  const result = game.split(playerId);
  
  if (!result.success) {
    return res.status(400).json({ error: result.message });
  }

  res.json({ 
    ...result,
    gameState: game.getGameState()
  });
});

app.get('/api/game/:gameId/state', (req, res) => {
  const { gameId } = req.params;
  
  const game = games.get(gameId);
  if (!game) {
    return res.status(404).json({ error: 'Jogo não encontrado' });
  }

  res.json(game.getGameState());
});

app.post('/api/game/:gameId/reset', (req, res) => {
  const { gameId } = req.params;
  
  const game = games.get(gameId);
  if (!game) {
    return res.status(404).json({ error: 'Jogo não encontrado' });
  }

  game.reset();
  
  res.json({ 
    message: 'Jogo reiniciado',
    gameState: game.getGameState()
  });
});

app.post('/api/room/create', (req, res) => {
  const { playerName, balance } = req.body;
  
  let roomCode;
  do {
    roomCode = generateRoomCode();
  } while (rooms.has(roomCode));

  const room = new Room(roomCode, playerName);
  const playerId = uuidv4();
  
  const result = room.addPlayer(playerId, playerName, balance || 1000);
  
  if (!result.success) {
    return res.status(400).json({ error: result.message });
  }

  rooms.set(roomCode, room);
  
  res.json({ 
    roomCode,
    playerId,
    player: result.player
  });
});

app.post('/api/room/:roomCode/join', (req, res) => {
  const { roomCode } = req.params;
  const { playerName, balance } = req.body;
  
  const room = rooms.get(roomCode);
  if (!room) {
    return res.status(404).json({ error: 'Sala não encontrada' });
  }

  const playerId = uuidv4();
  const result = room.addPlayer(playerId, playerName, balance || 1000);
  
  if (!result.success) {
    return res.status(400).json({ error: result.message });
  }

  res.json({ 
    playerId,
    player: result.player,
    roomState: room.getRoomState()
  });
});

app.post('/api/room/:roomCode/leave', (req, res) => {
  const { roomCode } = req.params;
  const { playerId } = req.body;
  
  const room = rooms.get(roomCode);
  if (!room) {
    return res.status(404).json({ error: 'Sala não encontrada' });
  }

  room.removePlayer(playerId);

  if (room.players.length === 0) {
    rooms.delete(roomCode);
  }

  res.json({ message: 'Saiu da sala' });
});

app.post('/api/room/:roomCode/ready', (req, res) => {
  const { roomCode } = req.params;
  const { playerId, isReady } = req.body;
  
  const room = rooms.get(roomCode);
  if (!room) {
    return res.status(404).json({ error: 'Sala não encontrada' });
  }

  room.setPlayerReady(playerId, isReady);
  
  res.json({ 
    message: 'Status atualizado',
    roomState: room.getRoomState()
  });
});

app.post('/api/room/:roomCode/start', (req, res) => {
  const { roomCode } = req.params;
  
  const room = rooms.get(roomCode);
  if (!room) {
    return res.status(404).json({ error: 'Sala não encontrada' });
  }

  const result = room.startGame();
  
  if (!result.success) {
    return res.status(400).json({ error: result.message });
  }

  res.json({ 
    message: 'Jogo iniciado',
    roomState: room.getRoomState()
  });
});

app.get('/api/room/:roomCode/state', (req, res) => {
  const { roomCode } = req.params;
  
  const room = rooms.get(roomCode);
  if (!room) {
    return res.status(404).json({ error: 'Sala não encontrada' });
  }

  res.json(room.getRoomState());
});

app.post('/api/room/:roomCode/bet', (req, res) => {
  const { roomCode } = req.params;
  const { playerId, amount, sideBets } = req.body;
  
  const room = rooms.get(roomCode);
  if (!room || !room.game) {
    return res.status(404).json({ error: 'Sala ou jogo não encontrado' });
  }

  const result = room.game.placeBet(playerId, amount, sideBets);
  
  if (!result.success) {
    return res.status(400).json({ error: result.message });
  }

  const player = room.game.getPlayer(playerId);
  if (player) {
    room.updatePlayerBalance(playerId, player.balance);
  }

  const allPlayersHaveBet = room.game.players.every(p => p.hands.length > 0);
  
  if (allPlayersHaveBet && room.game.gameState === 'waiting') {
    room.game.dealInitialCards();
  }

  res.json({ 
    message: 'Aposta realizada',
    roomState: room.getRoomState(),
    allBetsPlaced: allPlayersHaveBet
  });
});

app.post('/api/room/:roomCode/deal', (req, res) => {
  const { roomCode } = req.params;
  
  const room = rooms.get(roomCode);
  if (!room || !room.game) {
    return res.status(404).json({ error: 'Sala ou jogo não encontrado' });
  }

  room.game.dealInitialCards();
  
  res.json({ 
    message: 'Cartas distribuídas',
    roomState: room.getRoomState()
  });
});

app.post('/api/room/:roomCode/hit', (req, res) => {
  const { roomCode } = req.params;
  const { playerId } = req.body;
  
  const room = rooms.get(roomCode);
  if (!room || !room.game) {
    return res.status(404).json({ error: 'Sala ou jogo não encontrado' });
  }

  const result = room.game.hit(playerId);
  
  if (!result.success) {
    return res.status(400).json({ error: result.message });
  }

  res.json({ 
    ...result,
    roomState: room.getRoomState()
  });
});

app.post('/api/room/:roomCode/stand', (req, res) => {
  const { roomCode } = req.params;
  const { playerId } = req.body;
  
  const room = rooms.get(roomCode);
  if (!room || !room.game) {
    return res.status(404).json({ error: 'Sala ou jogo não encontrado' });
  }

  const result = room.game.stand(playerId);
  
  if (!result.success) {
    return res.status(400).json({ error: result.message });
  }

  const player = room.game.getPlayer(playerId);
  if (player && room.game.gameState === 'finished') {
    room.updatePlayerBalance(playerId, player.balance);
  }

  res.json({ 
    ...result,
    roomState: room.getRoomState()
  });
});

app.post('/api/room/:roomCode/double', (req, res) => {
  const { roomCode } = req.params;
  const { playerId } = req.body;
  
  const room = rooms.get(roomCode);
  if (!room || !room.game) {
    return res.status(404).json({ error: 'Sala ou jogo não encontrado' });
  }

  const result = room.game.doubleDown(playerId);
  
  if (!result.success) {
    return res.status(400).json({ error: result.message });
  }

  const player = room.game.getPlayer(playerId);
  if (player) {
    room.updatePlayerBalance(playerId, player.balance);
    if (room.game.gameState === 'finished') {
      room.updatePlayerBalance(playerId, player.balance);
    }
  }

  res.json({ 
    ...result,
    roomState: room.getRoomState()
  });
});

app.post('/api/room/:roomCode/split', (req, res) => {
  const { roomCode } = req.params;
  const { playerId } = req.body;
  
  const room = rooms.get(roomCode);
  if (!room || !room.game) {
    return res.status(404).json({ error: 'Sala ou jogo não encontrado' });
  }

  const result = room.game.split(playerId);
  
  if (!result.success) {
    return res.status(400).json({ error: result.message });
  }

  const player = room.game.getPlayer(playerId);
  if (player) {
    room.updatePlayerBalance(playerId, player.balance);
  }

  res.json({ 
    ...result,
    roomState: room.getRoomState()
  });
});

app.post('/api/room/:roomCode/reset', (req, res) => {
  const { roomCode } = req.params;
  
  const room = rooms.get(roomCode);
  if (!room) {
    return res.status(404).json({ error: 'Sala não encontrada' });
  }

  room.resetGame();
  
  res.json({ 
    message: 'Jogo reiniciado',
    roomState: room.getRoomState()
  });
});

setInterval(() => {
  const now = Date.now();
  const timeout = 30 * 60 * 1000;
  
  for (const [roomCode, room] of rooms.entries()) {
    if (!room.gameStarted && (now - room.createdAt) > timeout) {
      rooms.delete(roomCode);
    }
  }
}, 5 * 60 * 1000);

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

