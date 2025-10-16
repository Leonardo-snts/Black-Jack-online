import { useState } from 'react'
import axios from 'axios'

function UNORoomSetup({ onRoomCreated, onBack }) {
  const [mode, setMode] = useState(null)
  const [playerName, setPlayerName] = useState('')
  const [roomCode, setRoomCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleCreateRoom = async () => {
    if (!playerName.trim()) {
      setError('Digite seu nome')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await axios.post('/api/uno/room/create', {
        playerName: playerName.trim()
      })

      onRoomCreated(response.data.roomCode, response.data.playerId, response.data.player)
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao criar sala')
    } finally {
      setLoading(false)
    }
  }

  const handleJoinRoom = async () => {
    if (!playerName.trim()) {
      setError('Digite seu nome')
      return
    }

    if (!roomCode.trim()) {
      setError('Digite o código da sala')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await axios.post(`/api/uno/room/${roomCode.toUpperCase()}/join`, {
        playerName: playerName.trim()
      })

      onRoomCreated(roomCode.toUpperCase(), response.data.playerId, response.data.player)
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao entrar na sala')
    } finally {
      setLoading(false)
    }
  }

  if (!mode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-600 via-yellow-500 to-blue-600 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md">
          <button
            onClick={onBack}
            className="mb-4 text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-2"
          >
            <span>←</span>
            <span>Voltar</span>
          </button>

          <h1 className="text-4xl font-bold text-center mb-8 text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-yellow-500 to-blue-600">
            UNO Online
          </h1>

          <div className="space-y-4">
            <button
              onClick={() => setMode('create')}
              className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-4 rounded-xl font-bold text-lg transition-all transform hover:scale-105"
            >
              🎮 Criar Nova Sala
            </button>

            <button
              onClick={() => setMode('join')}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-4 rounded-xl font-bold text-lg transition-all transform hover:scale-105"
            >
              🚪 Entrar em uma Sala
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-600 via-yellow-500 to-blue-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md">
        <button
          onClick={() => setMode(null)}
          className="mb-4 text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-2"
        >
          <span>←</span>
          <span>Voltar</span>
        </button>

        <h2 className="text-3xl font-bold text-center mb-6 text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-yellow-500 to-blue-600">
          {mode === 'create' ? 'Criar Sala' : 'Entrar na Sala'}
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Seu Nome
            </label>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none text-gray-900"
              placeholder="Digite seu nome"
              maxLength={20}
            />
          </div>

          {mode === 'join' && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Código da Sala
              </label>
              <input
                type="text"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none text-gray-900 font-mono tracking-widest"
                placeholder="XXXXXX"
                maxLength={6}
              />
            </div>
          )}

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          <button
            onClick={mode === 'create' ? handleCreateRoom : handleJoinRoom}
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-4 rounded-xl font-bold text-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '⏳ Aguarde...' : mode === 'create' ? '✨ Criar Sala' : '🎯 Entrar'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default UNORoomSetup

