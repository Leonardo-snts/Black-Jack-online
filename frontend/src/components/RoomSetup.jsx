import { useState } from 'react'
import axios from 'axios'

function RoomSetup({ onRoomCreated, onBack }) {
  const [mode, setMode] = useState('create')
  const [playerName, setPlayerName] = useState('')
  const [initialBalance, setInitialBalance] = useState(1000)
  const [roomCode, setRoomCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleCreateRoom = async (e) => {
    e.preventDefault()
    
    if (!playerName.trim()) {
      setError('Digite seu nome')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await axios.post('/api/room/create', {
        playerName,
        balance: initialBalance
      })

      onRoomCreated(response.data.roomCode, response.data.playerId, response.data.player)
    } catch (error) {
      setError(error.response?.data?.error || 'Erro ao criar sala')
    } finally {
      setLoading(false)
    }
  }

  const handleJoinRoom = async (e) => {
    e.preventDefault()
    
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
      const response = await axios.post(`/api/room/${roomCode.toUpperCase()}/join`, {
        playerName,
        balance: initialBalance
      })

      onRoomCreated(roomCode.toUpperCase(), response.data.playerId, response.data.player)
    } catch (error) {
      setError(error.response?.data?.error || 'Erro ao entrar na sala')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="bg-slate-800 rounded-2xl shadow-2xl p-8 w-full max-w-md border border-slate-700">
        <button
          onClick={onBack}
          className="mb-6 text-slate-400 hover:text-white transition flex items-center gap-2"
        >
          ← Voltar
        </button>

        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">Sala Online</h2>
        </div>

        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setMode('create')}
            className={`flex-1 py-2 px-4 rounded-lg font-semibold transition ${
              mode === 'create'
                ? 'bg-green-600 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            Criar Sala
          </button>
          <button
            onClick={() => setMode('join')}
            className={`flex-1 py-2 px-4 rounded-lg font-semibold transition ${
              mode === 'join'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            Entrar na Sala
          </button>
        </div>

        <form onSubmit={mode === 'create' ? handleCreateRoom : handleJoinRoom} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Seu Nome
            </label>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition"
              placeholder="Digite seu nome"
            />
          </div>

          {mode === 'join' && (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Código da Sala
              </label>
              <input
                type="text"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition uppercase text-center text-2xl font-bold tracking-wider"
                placeholder="ABC123"
                maxLength={6}
              />
            </div>
          )}

          {mode === 'create' && (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Saldo Inicial
              </label>
              <input
                type="number"
                value={initialBalance}
                onChange={(e) => setInitialBalance(parseInt(e.target.value) || 0)}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition"
                min="100"
                step="100"
              />
            </div>
          )}

          {error && (
            <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full font-bold py-3 px-6 rounded-lg transition transform hover:scale-105 active:scale-95 ${
              mode === 'create'
                ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700'
                : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700'
            } text-white disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {loading ? 'Carregando...' : mode === 'create' ? 'Criar Sala' : 'Entrar na Sala'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default RoomSetup

