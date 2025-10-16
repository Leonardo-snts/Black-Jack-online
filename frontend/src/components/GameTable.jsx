import { useState } from 'react'
import axios from 'axios'
import Card from './Card'

function GameTable({ gameId, playerId, gameData, playerData, onNewRound, onGameStateUpdate }) {
  const [actionLoading, setActionLoading] = useState(false)
  const [message, setMessage] = useState('')

  const currentHand = playerData.hands[playerData.currentHandIndex]
  const isMyTurn = gameData.gameState === 'playing' && 
                   gameData.currentPlayerIndex === gameData.players.findIndex(p => p.id === playerId)

  const handleAction = async (action, endpoint) => {
    setActionLoading(true)
    setMessage('')

    try {
      const response = await axios.post(`/api/game/${gameId}/${endpoint}`, { playerId })
      
      if (response.data.isBusted) {
        setMessage('Estourou!')
      } else if (response.data.autoStand) {
        setMessage('21! Parou automaticamente')
      }
      
      await onGameStateUpdate()
    } catch (error) {
      setMessage(error.response?.data?.error || `Erro ao ${action}`)
    } finally {
      setActionLoading(false)
    }
  }

  const getSideBetName = (type, category) => {
    if (category === 'perfectPairs') {
      const names = {
        'perfect': 'Par Perfeito',
        'colored': 'Par Colorido',
        'mixed': 'Par Misto'
      }
      return names[type] || type
    }
    if (category === 'twentyOnePlusThree') {
      const names = {
        'suited-trips': 'Suited Trips',
        'straight-flush': 'Straight Flush',
        'three-of-kind': 'Trinca',
        'straight': 'Sequência',
        'flush': 'Flush'
      }
      return names[type] || type
    }
    return type
  }

  const getHandResult = (hand, dealerHand) => {
    if (!dealerHand || gameData.gameState !== 'finished') return null

    const dealerValue = dealerHand.value
    const playerValue = hand.value

    if (hand.isBusted) return 'Perdeu'
    if (dealerHand.isBusted) return 'Ganhou!'
    if (hand.isBlackjack && !dealerHand.isBlackjack) return 'BLACKJACK!'
    if (playerValue > dealerValue) return 'Ganhou!'
    if (playerValue === dealerValue) return 'Empate'
    return 'Perdeu'
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-slate-800 rounded-2xl shadow-2xl p-6 border border-slate-700 mb-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-white">{playerData.name}</h2>
              <p className="text-slate-400">Saldo: <span className="text-yellow-500 font-bold">R$ {playerData.balance}</span></p>
            </div>
            {gameData.gameState === 'finished' && (
              <button
                onClick={onNewRound}
                className="bg-gradient-to-r from-green-500 to-green-600 text-white font-bold py-2 px-6 rounded-lg hover:from-green-600 hover:to-green-700 transition transform hover:scale-105"
              >
                Nova Rodada
              </button>
            )}
          </div>
        </div>

        <div className="bg-gradient-to-br from-felt-green to-green-800 rounded-2xl shadow-2xl p-8 border-4 border-yellow-600">
          <div className="mb-12">
            <h3 className="text-xl font-bold text-white mb-4">Dealer</h3>
            <div className="flex gap-2 mb-2">
              {gameData.dealer.hands[0].cards.map((card, idx) => (
                <Card key={idx} card={card} />
              ))}
              {gameData.gameState === 'playing' && gameData.dealer.hands[0].cards.length === 1 && (
                <Card hidden={true} />
              )}
            </div>
            {gameData.dealer.hands[0].value !== null && (
              <div className="text-white font-bold text-lg">
                Valor: {gameData.dealer.hands[0].value}
                {gameData.dealer.hands[0].isBusted && <span className="text-red-500 ml-2">ESTOUROU!</span>}
                {gameData.dealer.hands[0].isBlackjack && <span className="text-yellow-500 ml-2">BLACKJACK!</span>}
              </div>
            )}
          </div>

          <div className="space-y-6">
            {playerData.hands.map((hand, handIdx) => (
              <div key={handIdx} className={`bg-slate-800/50 rounded-lg p-6 ${handIdx === playerData.currentHandIndex && isMyTurn ? 'ring-4 ring-yellow-500' : ''}`}>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-white">
                      Mão {handIdx + 1} {handIdx === playerData.currentHandIndex && isMyTurn && '(Sua vez)'}
                    </h3>
                    <p className="text-slate-300">Aposta: R$ {hand.bet}</p>
                    {(hand.sideBets.perfectPairs > 0 || hand.sideBets.twentyOnePlusThree > 0) && (
                      <div className="text-sm mt-2">
                        <p className="text-slate-400">Apostas Laterais:</p>
                        {hand.sideBets.perfectPairs > 0 && (
                          <div className="mt-1">
                            {hand.sideBetResults?.perfectPairs ? (
                              <p className="text-green-500 font-bold">
                                ✓ Perfect Pairs: {getSideBetName(hand.sideBetResults.perfectPairs.type, 'perfectPairs')} ({hand.sideBetResults.perfectPairs.payout}:1) - Ganhou R$ {hand.sideBetResults.perfectPairs.won}
                              </p>
                            ) : (
                              <p className="text-red-500">✗ Perfect Pairs: R$ {hand.sideBets.perfectPairs} - Perdeu</p>
                            )}
                          </div>
                        )}
                        {hand.sideBets.twentyOnePlusThree > 0 && (
                          <div className="mt-1">
                            {hand.sideBetResults?.twentyOnePlusThree ? (
                              <p className="text-green-500 font-bold">
                                ✓ 21+3: {getSideBetName(hand.sideBetResults.twentyOnePlusThree.type, 'twentyOnePlusThree')} ({hand.sideBetResults.twentyOnePlusThree.payout}:1) - Ganhou R$ {hand.sideBetResults.twentyOnePlusThree.won}
                              </p>
                            ) : (
                              <p className="text-red-500">✗ 21+3: R$ {hand.sideBets.twentyOnePlusThree} - Perdeu</p>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  {gameData.gameState === 'finished' && (
                    <div className={`text-2xl font-bold ${
                      getHandResult(hand, gameData.dealer.hands[0]) === 'Ganhou!' || 
                      getHandResult(hand, gameData.dealer.hands[0]) === 'BLACKJACK!' 
                        ? 'text-green-500' 
                        : getHandResult(hand, gameData.dealer.hands[0]) === 'Empate'
                        ? 'text-yellow-500'
                        : 'text-red-500'
                    }`}>
                      {getHandResult(hand, gameData.dealer.hands[0])}
                    </div>
                  )}
                </div>

                <div className="flex gap-2 mb-4">
                  {hand.cards.map((card, cardIdx) => (
                    <Card key={cardIdx} card={card} />
                  ))}
                </div>

                <div className="text-white font-bold text-lg mb-4">
                  Valor: {hand.value}
                  {hand.isBusted && <span className="text-red-500 ml-2">ESTOUROU!</span>}
                  {hand.isBlackjack && <span className="text-yellow-500 ml-2">BLACKJACK!</span>}
                  {hand.isStanding && <span className="text-blue-500 ml-2">PAROU</span>}
                </div>

                {isMyTurn && handIdx === playerData.currentHandIndex && !hand.isStanding && !hand.isBusted && !hand.isBlackjack && hand.value !== 21 && (
                  <div className="flex gap-2 flex-wrap">
                    <button
                      onClick={() => handleAction('pedir carta', 'hit')}
                      disabled={actionLoading}
                      className="bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold py-2 px-6 rounded-lg hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 transition transform hover:scale-105"
                    >
                      Pedir Carta
                    </button>

                    <button
                      onClick={() => handleAction('parar', 'stand')}
                      disabled={actionLoading}
                      className="bg-gradient-to-r from-red-500 to-red-600 text-white font-bold py-2 px-6 rounded-lg hover:from-red-600 hover:to-red-700 disabled:opacity-50 transition transform hover:scale-105"
                    >
                      Parar
                    </button>

                    {hand.canDoubleDown && (
                      <button
                        onClick={() => handleAction('dobrar', 'double')}
                        disabled={actionLoading || playerData.balance < hand.bet}
                        className="bg-gradient-to-r from-purple-500 to-purple-600 text-white font-bold py-2 px-6 rounded-lg hover:from-purple-600 hover:to-purple-700 disabled:opacity-50 transition transform hover:scale-105"
                      >
                        Dobrar
                      </button>
                    )}

                    {hand.canSplit && (
                      <button
                        onClick={() => handleAction('dividir', 'split')}
                        disabled={actionLoading || playerData.balance < hand.bet}
                        className="bg-gradient-to-r from-green-500 to-green-600 text-white font-bold py-2 px-6 rounded-lg hover:from-green-600 hover:to-green-700 disabled:opacity-50 transition transform hover:scale-105"
                      >
                        Dividir
                      </button>
                    )}
                  </div>
                )}

                {hand.value === 21 && !hand.isBusted && (
                  <div className="bg-yellow-500/20 border border-yellow-500 text-yellow-500 px-4 py-2 rounded-lg font-bold text-center">
                    21! Mão perfeita
                  </div>
                )}
              </div>
            ))}
          </div>

          {message && (
            <div className="mt-4 bg-slate-800 border border-slate-600 text-white px-4 py-3 rounded-lg text-center font-bold">
              {message}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default GameTable

