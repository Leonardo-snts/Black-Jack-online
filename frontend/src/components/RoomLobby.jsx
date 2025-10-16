import { useState, useEffect } from 'react'
import axios from 'axios'

function RoomLobby({ roomCode, playerId, onGameStart, onLeave }) {
  const [roomState, setRoomState] = useState(null)
  const [isReady, setIsReady] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchRoomState()
    const interval = setInterval(fetchRoomState, 1000)
    return () => clearInterval(interval)
  }, [roomCode])

  useEffect(() => {
    if (roomState?.gameStarted) {
      onGameStart(roomState)
    }
  }, [roomState?.gameStarted])

  const fetchRoomState = async () => {
    try {
      const response = await axios.get(`/api/room/${roomCode}/state`)
      setRoomState(response.data)
    } catch (error) {
      console.error('Erro ao buscar estado da sala:', error)
    }
  }

  const handleToggleReady = async () => {
    try {
      await axios.post(`/api/room/${roomCode}/ready`, {
        playerId,
        isReady: !isReady
      })
      setIsReady(!isReady)
    } catch (error) {
      setError('Erro ao alterar status')
    }
  }

  const handleStartGame = async () => {
    try {
      await axios.post(`/api/room/${roomCode}/start`)
    } catch (error) {
      setError(error.response?.data?.error || 'Erro ao iniciar jogo')
    }
  }

  const handleLeave = async () => {
    try {
      await axios.post(`/api/room/${roomCode}/leave`, { playerId })
      onLeave()
    } catch (error) {
      console.error('Erro ao sair da sala:', error)
      onLeave()
    }
  }

  const currentPlayer = roomState?.players.find(p => p.id === playerId)
  const isHost = currentPlayer?.isHost

  if (!roomState) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-white text-xl">Carregando...</div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="bg-slate-800 rounded-2xl shadow-2xl p-8 w-full max-w-4xl border border-slate-700">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">Sala de Espera</h2>
            <div className="flex items-center gap-4">
              <div className="bg-slate-700 px-4 py-2 rounded-lg">
                <span className="text-slate-400 text-sm">Código da Sala:</span>
                <div className="text-2xl font-bold text-yellow-500 tracking-wider">{roomCode}</div>
              </div>
              <div className="text-slate-400">
                {roomState.players.length}/{roomState.maxPlayers} jogadores
              </div>
            </div>
          </div>
          <button
            onClick={handleLeave}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition"
          >
            Sair
          </button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {roomState.players.map((player) => (
            <div
              key={player.id}
              className={`bg-slate-700 rounded-lg p-4 border-2 ${
                player.isReady ? 'border-green-500' : 'border-slate-600'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${player.isReady ? 'bg-green-500' : 'bg-slate-500'}`}></div>
                  <span className="text-white font-semibold">{player.name}</span>
                </div>
                {player.isHost && (
                  <span className="bg-yellow-500 text-slate-900 text-xs font-bold px-2 py-1 rounded">
                    HOST
                  </span>
                )}
              </div>
              <div className="text-slate-400 text-sm">
                Saldo: R$ {player.balance}
              </div>
              {player.isReady && (
                <div className="text-green-500 text-sm mt-1">✓ Pronto</div>
              )}
            </div>
          ))}

          {Array.from({ length: roomState.maxPlayers - roomState.players.length }).map((_, idx) => (
            <div
              key={`empty-${idx}`}
              className="bg-slate-700/50 rounded-lg p-4 border-2 border-dashed border-slate-600 flex items-center justify-center"
            >
              <span className="text-slate-500">Aguardando jogador...</span>
            </div>
          ))}
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <div className="flex gap-4">
          <button
            onClick={handleToggleReady}
            className={`flex-1 font-bold py-3 px-6 rounded-lg transition transform hover:scale-105 ${
              isReady
                ? 'bg-slate-600 hover:bg-slate-500 text-white'
                : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white'
            }`}
          >
            {isReady ? 'Cancelar' : 'Estou Pronto!'}
          </button>

          {isHost && (
            <button
              onClick={handleStartGame}
              disabled={!roomState.canStart}
              className="flex-1 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-lg transition transform hover:scale-105 disabled:transform-none"
            >
              Iniciar Jogo
            </button>
          )}
        </div>

        {isHost && !roomState.canStart && (
          <div className="mt-4 text-center text-slate-400 text-sm">
            Aguardando todos os jogadores ficarem prontos...
          </div>
        )}
      </div>
    </div>
  )
}

export default RoomLobby

