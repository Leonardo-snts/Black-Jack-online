import { useState, useEffect } from 'react'
import axios from 'axios'
import GameSelector from './components/GameSelector'
import ModeSelector from './components/ModeSelector'
import GameSetup from './components/GameSetup'
import GameTable from './components/GameTable'
import BlackJack3D from './components/BlackJack3D'
import BettingArea from './components/BettingArea'
import RoomSetup from './components/RoomSetup'
import RoomLobby from './components/RoomLobby'
import MultiplayerGame from './components/MultiplayerGame'
import UNORoomSetup from './components/uno/UNORoomSetup'
import UNORoomLobby from './components/uno/UNORoomLobby'
import UNOGameTable from './components/uno/UNOGameTable'

function App() {
  const [gameState, setGameState] = useState('game-select')
  const [selectedGame, setSelectedGame] = useState(null)
  const [gameMode, setGameMode] = useState(null)
  const [gameId, setGameId] = useState(null)
  const [playerId, setPlayerId] = useState(null)
  const [playerData, setPlayerData] = useState(null)
  const [gameData, setGameData] = useState(null)
  const [roomCode, setRoomCode] = useState(null)
  const [view3D, setView3D] = useState(false)

  useEffect(() => {
    if (gameId && gameState !== 'setup' && gameMode === 'solo') {
      const interval = setInterval(() => {
        fetchGameState()
      }, 1000)
      
      return () => clearInterval(interval)
    }
  }, [gameId, gameState, gameMode])

  const fetchGameState = async () => {
    try {
      const response = await axios.get(`/api/game/${gameId}/state`)
      setGameData(response.data)
      
      const player = response.data.players.find(p => p.id === playerId)
      if (player) {
        setPlayerData(player)
      }

      if (response.data.gameState === 'waiting' && gameState === 'playing') {
        setGameState('betting')
      }
    } catch (error) {
      console.error('Erro ao buscar estado do jogo:', error)
    }
  }

  const handleGameSelect = (game) => {
    setSelectedGame(game)
    setGameState('mode-select')
  }

  const handleModeSelect = (mode) => {
    setGameMode(mode)
    
    // UNO só tem modo online (multiplayer)
    if (selectedGame === 'uno') {
      setGameState('uno-room-setup')
    } else {
      // Black Jack tem solo e online
      if (mode === 'solo') {
        setGameState('setup')
      } else {
        setGameState('room-setup')
      }
    }
  }

  const handleGameCreated = (newGameId, newPlayerId, player) => {
    setGameId(newGameId)
    setPlayerId(newPlayerId)
    setPlayerData(player)
    setGameState('betting')
  }

  const handleRoomCreated = (newRoomCode, newPlayerId, player) => {
    setRoomCode(newRoomCode)
    setPlayerId(newPlayerId)
    setPlayerData(player)
    setGameState('room-lobby')
  }

  const handleUNORoomCreated = (newRoomCode, newPlayerId, player) => {
    setRoomCode(newRoomCode)
    setPlayerId(newPlayerId)
    setPlayerData(player)
    setGameState('uno-room-lobby')
  }

  const handleGameStart = () => {
    setGameState('multiplayer-game')
  }

  const handleUNOGameStart = () => {
    setGameState('uno-game')
  }

  const handleBackToModeSelect = () => {
    setGameState('mode-select')
    setGameMode(null)
    setGameId(null)
    setPlayerId(null)
    setPlayerData(null)
    setGameData(null)
    setRoomCode(null)
  }

  const handleBackToGameSelect = () => {
    setGameState('game-select')
    setSelectedGame(null)
    setGameMode(null)
    setGameId(null)
    setPlayerId(null)
    setPlayerData(null)
    setGameData(null)
    setRoomCode(null)
  }

  const handleBetPlaced = async () => {
    try {
      await axios.post(`/api/game/${gameId}/deal`)
      await fetchGameState()
      setGameState('playing')
    } catch (error) {
      console.error('Erro ao distribuir cartas:', error)
    }
  }

  const handleNewRound = async () => {
    try {
      await axios.post(`/api/game/${gameId}/reset`)
      await fetchGameState()
      setGameState('betting')
    } catch (error) {
      console.error('Erro ao iniciar nova rodada:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Toggle 3D - apenas para Black Jack */}
      {(gameState === 'playing' || gameState === 'betting') && gameMode === 'solo' && selectedGame === 'blackjack' && (
        <button
          onClick={() => setView3D(!view3D)}
          className="fixed top-4 left-4 z-[999] bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-full font-bold shadow-2xl hover:scale-110 transition-transform flex items-center gap-2"
          style={{ animation: 'float 3s ease-in-out infinite' }}
        >
          <span className="text-2xl">{view3D ? '🎮' : '🎲'}</span>
          <span>{view3D ? 'Modo 2D' : 'Modo 3D'}</span>
        </button>
      )}

      {gameState === 'game-select' && (
        <GameSelector onSelectGame={handleGameSelect} />
      )}

      {gameState === 'mode-select' && (
        <ModeSelector 
          onSelectMode={handleModeSelect} 
          onBack={handleBackToGameSelect}
          gameType={selectedGame}
        />
      )}

      {gameState === 'setup' && (
        <GameSetup onGameCreated={handleGameCreated} />
      )}

      {gameState === 'room-setup' && (
        <RoomSetup 
          onRoomCreated={handleRoomCreated}
          onBack={handleBackToModeSelect}
        />
      )}

      {gameState === 'room-lobby' && (
        <RoomLobby 
          roomCode={roomCode}
          playerId={playerId}
          onGameStart={handleGameStart}
          onLeave={handleBackToModeSelect}
        />
      )}

      {gameState === 'multiplayer-game' && (
        <MultiplayerGame 
          roomCode={roomCode}
          playerId={playerId}
          onBackToLobby={() => setGameState('room-lobby')}
        />
      )}
      
      {gameState === 'betting' && gameMode === 'solo' && (
        <BettingArea 
          gameId={gameId}
          playerId={playerId}
          playerData={playerData}
          onBetPlaced={handleBetPlaced}
        />
      )}
      
      {gameState === 'playing' && gameMode === 'solo' && gameData && (
        <>
          {view3D ? (
            <BlackJack3D
              gameId={gameId}
              playerId={playerId}
              gameData={gameData}
              playerData={playerData}
              onNewRound={handleNewRound}
              onGameStateUpdate={fetchGameState}
            />
          ) : (
            <GameTable 
              gameId={gameId}
              playerId={playerId}
              gameData={gameData}
              playerData={playerData}
              onNewRound={handleNewRound}
              onGameStateUpdate={fetchGameState}
            />
          )}
        </>
      )}

      {/* UNO Components */}
      {gameState === 'uno-room-setup' && (
        <UNORoomSetup 
          onRoomCreated={handleUNORoomCreated}
          onBack={handleBackToModeSelect}
        />
      )}

      {gameState === 'uno-room-lobby' && (
        <UNORoomLobby 
          roomCode={roomCode}
          playerId={playerId}
          onGameStart={handleUNOGameStart}
          onLeave={handleBackToModeSelect}
        />
      )}

      {gameState === 'uno-game' && (
        <UNOGameTable 
          roomCode={roomCode}
          playerId={playerId}
          onBackToLobby={() => setGameState('uno-room-lobby')}
        />
      )}
    </div>
  )
}

export default App

