import { useState, useEffect } from 'react'
import axios from 'axios'
import ModeSelector from './components/ModeSelector'
import GameSetup from './components/GameSetup'
import GameTable from './components/GameTable'
import BettingArea from './components/BettingArea'
import RoomSetup from './components/RoomSetup'
import RoomLobby from './components/RoomLobby'
import MultiplayerGame from './components/MultiplayerGame'

function App() {
  const [gameState, setGameState] = useState('mode-select')
  const [gameMode, setGameMode] = useState(null)
  const [gameId, setGameId] = useState(null)
  const [playerId, setPlayerId] = useState(null)
  const [playerData, setPlayerData] = useState(null)
  const [gameData, setGameData] = useState(null)
  const [roomCode, setRoomCode] = useState(null)

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

  const handleModeSelect = (mode) => {
    setGameMode(mode)
    if (mode === 'solo') {
      setGameState('setup')
    } else {
      setGameState('room-setup')
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

  const handleGameStart = () => {
    setGameState('multiplayer-game')
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
      {gameState === 'mode-select' && (
        <ModeSelector onSelectMode={handleModeSelect} />
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
        <GameTable 
          gameId={gameId}
          playerId={playerId}
          gameData={gameData}
          playerData={playerData}
          onNewRound={handleNewRound}
          onGameStateUpdate={fetchGameState}
        />
      )}
    </div>
  )
}

export default App

