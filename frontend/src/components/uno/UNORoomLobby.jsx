import { useState, useEffect } from 'react'
import axios from 'axios'

function UNORoomLobby({ roomCode, playerId, onGameStart, onLeave }) {
  const [roomState, setRoomState] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchRoomState()
    const interval = setInterval(fetchRoomState, 1000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    // Se o jogo começou, notifica o componente pai
    if (roomState?.status === 'playing') {
      onGameStart()
    }
  }, [roomState?.status])

  const fetchRoomState = async () => {
    try {
      const response = await axios.get(`/api/uno/room/${roomCode}/state`, {
        params: { playerId }
      })
      setRoomState(response.data)
    } catch (error) {
      console.error('Erro ao buscar estado da sala:', error)
    }
  }

  const handleToggleReady = async () => {
    const currentPlayer = roomState.players.find(p => p.id === playerId)
    const newReadyState = !currentPlayer?.isReady

    try {
      await axios.post(`/api/uno/room/${roomCode}/ready`, {
        playerId,
        ready: newReadyState
      })
      await fetchRoomState()
    } catch (error) {
      console.error('Erro ao marcar pronto:', error)
    }
  }

  const handleStartGame = async () => {
    setLoading(true)
    try {
      await axios.post(`/api/uno/room/${roomCode}/start`)
      await fetchRoomState()
    } catch (error) {
      console.error('Erro ao iniciar jogo:', error)
      alert(error.response?.data?.error || 'Erro ao iniciar jogo')
    } finally {
      setLoading(false)
    }
  }

  const handleLeave = async () => {
    try {
      await axios.post(`/api/uno/room/${roomCode}/leave`, { playerId })
      onLeave()
    } catch (error) {
      console.error('Erro ao sair da sala:', error)
      onLeave()
    }
  }

  if (!roomState) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-600 via-yellow-500 to-blue-600 flex items-center justify-center">
        <div className="text-white text-2xl">Carregando...</div>
      </div>
    )
  }

  const currentPlayer = roomState.players.find(p => p.id === playerId)
  const allReady = roomState.players.length >= 2 && roomState.players.every(p => p.isReady)

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-600 via-yellow-500 to-blue-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-4xl">
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={handleLeave}
            className="text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-2"
          >
            <span>←</span>
            <span>Sair</span>
          </button>

          <div className="text-center">
            <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-yellow-500 to-blue-600">
              Sala UNO
            </h2>
            <div className="text-3xl font-mono font-bold text-gray-800 tracking-widest">
              {roomCode}
            </div>
          </div>

          <div className="w-20"></div>
        </div>

        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 mb-6">
          <h3 className="font-bold text-lg mb-4 text-gray-800">
            Jogadores ({roomState.players.length}/{roomState.maxPlayers})
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {roomState.players.map((player) => (
              <div
                key={player.id}
                className={`
                  p-4 rounded-lg
                  ${player.id === playerId ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white' : 'bg-white'}
                  ${player.isReady ? 'ring-4 ring-green-500' : ''}
                  transition-all
                `}
              >
                <div className="font-bold truncate">{player.name}</div>
                <div className={`text-sm ${player.id === playerId ? 'text-white/80' : 'text-gray-600'}`}>
                  {player.isReady ? '✓ Pronto' : '⏳ Aguardando'}
                </div>
                {player.id === playerId && (
                  <div className="text-xs mt-1 text-white/60">Você</div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={handleToggleReady}
            className={`
              w-full py-4 rounded-xl font-bold text-lg transition-all transform hover:scale-105
              ${currentPlayer?.isReady
                ? 'bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white'
                : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white'
              }
            `}
          >
            {currentPlayer?.isReady ? '❌ Cancelar' : '✓ Estou Pronto!'}
          </button>

          {allReady && (
            <button
              onClick={handleStartGame}
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-4 rounded-xl font-bold text-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed animate-pulse"
            >
              {loading ? '⏳ Iniciando...' : '🎮 Iniciar Jogo!'}
            </button>
          )}

          {!allReady && roomState.players.length < 2 && (
            <div className="text-center text-gray-600 py-2">
              Aguardando mais jogadores... (mínimo 2)
            </div>
          )}

          {!allReady && roomState.players.length >= 2 && (
            <div className="text-center text-gray-600 py-2">
              Aguardando todos marcarem como prontos...
            </div>
          )}
        </div>

        <div className="mt-6 text-center text-sm text-gray-500">
          Compartilhe o código da sala com seus amigos para jogarem juntos!
        </div>
      </div>
    </div>
  )
}

export default UNORoomLobby

