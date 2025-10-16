import { useState } from 'react'
import axios from 'axios'

function BettingArea({ gameId, playerId, playerData, onBetPlaced }) {
  const [mainBet, setMainBet] = useState(10)
  const [perfectPairsBet, setPerfectPairsBet] = useState(0)
  const [twentyOnePlusThreeBet, setTwentyOnePlusThreeBet] = useState(0)
  const [error, setError] = useState('')

  const totalBet = mainBet + perfectPairsBet + twentyOnePlusThreeBet

  const handlePlaceBet = async () => {
    if (totalBet > playerData.balance) {
      setError('Saldo insuficiente')
      return
    }

    if (mainBet < 1) {
      setError('Aposta mínima é 1')
      return
    }

    try {
      await axios.post(`/api/game/${gameId}/bet`, {
        playerId,
        amount: mainBet,
        sideBets: {
          perfectPairs: perfectPairsBet,
          twentyOnePlusThree: twentyOnePlusThreeBet
        }
      })

      onBetPlaced()
    } catch (error) {
      setError(error.response?.data?.error || 'Erro ao fazer aposta')
    }
  }

  const quickBet = (amount) => {
    if (amount <= playerData.balance) {
      setMainBet(amount)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="bg-slate-800 rounded-2xl shadow-2xl p-8 w-full max-w-2xl border border-slate-700">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">Faça sua Aposta</h2>
          <p className="text-slate-400">Saldo: <span className="text-yellow-500 font-bold">R$ {playerData.balance}</span></p>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-700 rounded-lg p-6">
            <label className="block text-sm font-medium text-slate-300 mb-3">
              Aposta Principal
            </label>
            <input
              type="number"
              value={mainBet}
              onChange={(e) => setMainBet(parseInt(e.target.value) || 0)}
              className="w-full px-4 py-3 bg-slate-600 border border-slate-500 rounded-lg text-white text-xl font-bold focus:outline-none focus:ring-2 focus:ring-yellow-500 transition"
              min="1"
            />
            
            <div className="grid grid-cols-4 gap-2 mt-4">
              {[10, 25, 50, 100].map(amount => (
                <button
                  key={amount}
                  onClick={() => quickBet(amount)}
                  className="bg-slate-600 hover:bg-slate-500 text-white font-bold py-2 px-4 rounded-lg transition"
                >
                  R$ {amount}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-slate-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Apostas Laterais</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Perfect Pairs (Paga 25:1 para par perfeito)
                </label>
                <input
                  type="number"
                  value={perfectPairsBet}
                  onChange={(e) => setPerfectPairsBet(parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500 transition"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  21+3 (Paga até 100:1 para suited trips)
                </label>
                <input
                  type="number"
                  value={twentyOnePlusThreeBet}
                  onChange={(e) => setTwentyOnePlusThreeBet(parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500 transition"
                  min="0"
                />
              </div>
            </div>
          </div>

          <div className="bg-slate-700 rounded-lg p-4 flex justify-between items-center">
            <span className="text-slate-300">Total da Aposta:</span>
            <span className="text-2xl font-bold text-yellow-500">R$ {totalBet}</span>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <button
            onClick={handlePlaceBet}
            disabled={totalBet > playerData.balance || mainBet < 1}
            className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white font-bold py-4 px-6 rounded-lg hover:from-green-600 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition transform hover:scale-105 active:scale-95"
          >
            Confirmar Aposta
          </button>
        </div>
      </div>
    </div>
  )
}

export default BettingArea

