import { useState } from 'react'
import axios from 'axios'

function GameSetup({ onGameCreated }) {
  const [playerName, setPlayerName] = useState('')
  const [initialBalance, setInitialBalance] = useState(1000)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleCreateGame = async (e) => {
    e.preventDefault()
    
    if (!playerName.trim()) {
      setError('Digite seu nome')
      return
    }

    setLoading(true)
    setError('')

    try {
      const createResponse = await axios.post('/api/game/create')
      const gameId = createResponse.data.gameId

      const joinResponse = await axios.post(`/api/game/${gameId}/join`, {
        playerName,
        balance: initialBalance
      })

      onGameCreated(gameId, joinResponse.data.playerId, joinResponse.data.player)
    } catch (error) {
      setError('Erro ao criar o jogo')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="bg-slate-800 rounded-2xl shadow-2xl p-8 w-full max-w-md border border-slate-700">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600 mb-2">
            BLACK JACK
          </h1>
          <p className="text-slate-400">Bem-vindo ao jogo</p>
        </div>

        <form onSubmit={handleCreateGame} className="space-y-6">
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

          {error && (
            <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 text-white font-bold py-3 px-6 rounded-lg hover:from-yellow-600 hover:to-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed transition transform hover:scale-105 active:scale-95"
          >
            {loading ? 'Criando...' : 'Criar Jogo'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default GameSetup

