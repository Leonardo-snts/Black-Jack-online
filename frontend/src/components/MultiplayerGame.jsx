import { useState, useEffect } from 'react'
import axios from 'axios'
import Card from './Card'

function MultiplayerGame({ roomCode, playerId, onBackToLobby }) {
  const [roomState, setRoomState] = useState(null)
  const [currentPhase, setCurrentPhase] = useState('betting')
  const [mainBet, setMainBet] = useState(10)
  const [perfectPairsBet, setPerfectPairsBet] = useState(0)
  const [twentyOnePlusThreeBet, setTwentyOnePlusThreeBet] = useState(0)
  const [hasBet, setHasBet] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    fetchRoomState()
    const interval = setInterval(fetchRoomState, 1000)
    return () => clearInterval(interval)
  }, [roomCode])

  useEffect(() => {
    if (roomState?.gameState) {
      if (roomState.gameState.gameState === 'waiting') {
        setCurrentPhase('betting')
        setHasBet(false)
      } else if (roomState.gameState.gameState === 'playing') {
        setCurrentPhase('playing')
      } else if (roomState.gameState.gameState === 'finished') {
        setCurrentPhase('finished')
      }
    }
  }, [roomState?.gameState?.gameState])

  const fetchRoomState = async () => {
    try {
      const response = await axios.get(`/api/room/${roomCode}/state`)
      setRoomState(response.data)
    } catch (error) {
      console.error('Erro ao buscar estado:', error)
    }
  }

  const handlePlaceBet = async () => {
    try {
      await axios.post(`/api/room/${roomCode}/bet`, {
        playerId,
        amount: mainBet,
        sideBets: {
          perfectPairs: perfectPairsBet,
          twentyOnePlusThree: twentyOnePlusThreeBet
        }
      })
      setHasBet(true)
      await fetchRoomState()
    } catch (error) {
      setMessage(error.response?.data?.error || 'Erro ao apostar')
    }
  }

  const handleAction = async (action, endpoint) => {
    setActionLoading(true)
    setMessage('')

    try {
      const response = await axios.post(`/api/room/${roomCode}/${endpoint}`, { playerId })
      
      if (response.data.isBusted) {
        setMessage('Estourou!')
      } else if (response.data.autoStand) {
        setMessage('21! Parou automaticamente')
      }
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

  const handleNewRound = async () => {
    try {
      await axios.post(`/api/room/${roomCode}/reset`)
    } catch (error) {
      setMessage('Erro ao iniciar nova rodada')
    }
  }

  if (!roomState || !roomState.gameState) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-white text-xl">Carregando jogo...</div>
      </div>
    )
  }

  const currentPlayer = roomState.players.find(p => p.id === playerId)
  const gamePlayer = roomState.gameState.players.find(p => p.id === playerId)
  const currentHand = gamePlayer?.hands[gamePlayer.currentHandIndex]
  const isMyTurn = roomState.gameState.gameState === 'playing' && 
                   roomState.gameState.currentPlayerIndex === roomState.gameState.players.findIndex(p => p.id === playerId)

  if (currentPhase === 'betting') {
    const totalBet = mainBet + perfectPairsBet + twentyOnePlusThreeBet

    return (
      <div className="min-h-screen p-4 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="max-w-4xl mx-auto">
          <div className="bg-slate-800 rounded-2xl shadow-2xl p-6 border border-slate-700 mb-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-white">Sala: {roomCode}</h2>
                <p className="text-slate-400">Saldo: <span className="text-yellow-500 font-bold">R$ {currentPlayer.balance}</span></p>
              </div>
            </div>
          </div>

          {!hasBet ? (
            <div className="bg-slate-800 rounded-2xl shadow-2xl p-8 border border-slate-700">
              <h3 className="text-2xl font-bold text-white mb-6">Faça sua Aposta</h3>
              
              <div className="space-y-6">
                <div className="bg-slate-700 rounded-lg p-6">
                  <label className="block text-sm font-medium text-slate-300 mb-3">
                    Aposta Principal
                  </label>
                  <input
                    type="number"
                    value={mainBet}
                    onChange={(e) => setMainBet(parseInt(e.target.value) || 0)}
                    className="w-full px-4 py-3 bg-slate-600 border border-slate-500 rounded-lg text-white text-xl font-bold focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    min="1"
                  />
                </div>

                <div className="bg-slate-700 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Apostas Laterais</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Perfect Pairs
                      </label>
                      <input
                        type="number"
                        value={perfectPairsBet}
                        onChange={(e) => setPerfectPairsBet(parseInt(e.target.value) || 0)}
                        className="w-full px-4 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                        min="0"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        21+3
                      </label>
                      <input
                        type="number"
                        value={twentyOnePlusThreeBet}
                        onChange={(e) => setTwentyOnePlusThreeBet(parseInt(e.target.value) || 0)}
                        className="w-full px-4 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                        min="0"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-slate-700 rounded-lg p-4 flex justify-between items-center">
                  <span className="text-slate-300">Total:</span>
                  <span className="text-2xl font-bold text-yellow-500">R$ {totalBet}</span>
                </div>

                <button
                  onClick={handlePlaceBet}
                  disabled={totalBet > currentPlayer.balance || mainBet < 1}
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:opacity-50 text-white font-bold py-4 rounded-lg transition"
                >
                  Confirmar Aposta
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-slate-700 rounded-xl p-6 text-center">
              <div className="text-white text-xl mb-2">Aposta confirmada!</div>
              <div className="text-slate-400">Aguardando outros jogadores...</div>
            </div>
          )}
        </div>
      </div>
    )
  }

  const getHandResult = (hand, dealerHand) => {
    if (!dealerHand || roomState.gameState.gameState !== 'finished') return null

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
    <div className="min-h-screen p-4 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-7xl mx-auto">
        <div className="bg-slate-800 rounded-2xl shadow-2xl p-6 border border-slate-700 mb-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-white">Sala: {roomCode}</h2>
              <p className="text-slate-400">Saldo: <span className="text-yellow-500 font-bold">R$ {currentPlayer.balance}</span></p>
            </div>
            {currentPhase === 'finished' && (
              <button
                onClick={handleNewRound}
                className="bg-gradient-to-r from-green-500 to-green-600 text-white font-bold py-2 px-6 rounded-lg hover:from-green-600 hover:to-green-700 transition"
              >
                Nova Rodada
              </button>
            )}
          </div>
        </div>

        <div className="bg-gradient-to-br from-felt-green to-green-800 rounded-2xl shadow-2xl p-8 border-4 border-yellow-600">
          <div className="mb-8">
            <h3 className="text-xl font-bold text-white mb-4">Dealer</h3>
            <div className="flex gap-2 mb-2">
              {roomState.gameState.dealer.hands[0].cards.map((card, idx) => (
                <Card key={idx} card={card} />
              ))}
              {currentPhase === 'playing' && roomState.gameState.dealer.hands[0].cards.length === 1 && (
                <Card hidden={true} />
              )}
            </div>
            {roomState.gameState.dealer.hands[0].value !== null && (
              <div className="text-white font-bold text-lg">
                Valor: {roomState.gameState.dealer.hands[0].value}
              </div>
            )}
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {roomState.gameState.players.map((player, playerIdx) => (
              <div
                key={player.id}
                className={`bg-slate-800/50 rounded-lg p-4 ${
                  player.id === playerId ? 'ring-2 ring-yellow-500' : ''
                } ${isMyTurn && player.id === playerId ? 'ring-4 ring-green-500' : ''}`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="text-white font-bold">
                      {player.name} {player.id === playerId && '(Você)'}
                    </h4>
                    {isMyTurn && player.id === playerId && (
                      <span className="text-green-500 text-sm">Sua vez!</span>
                    )}
                  </div>
                </div>

                {player.hands.map((hand, handIdx) => (
                  <div key={handIdx} className="mb-4">
                    <div className="flex gap-1 mb-2 flex-wrap">
                      {hand.cards.map((card, cardIdx) => (
                        <div key={cardIdx} className="w-12">
                          <Card card={card} />
                        </div>
                      ))}
                    </div>
                    <div className="text-white text-sm">
                      Valor: {hand.value}
                      {hand.isBusted && <span className="text-red-500 ml-2">ESTOUROU!</span>}
                      {hand.isBlackjack && <span className="text-yellow-500 ml-2">BJ!</span>}
                      {hand.value === 21 && !hand.isBlackjack && <span className="text-yellow-500 ml-2">21!</span>}
                    </div>
                    <div className="text-slate-400 text-xs">Aposta: R$ {hand.bet}</div>
                    
                    {(hand.sideBets.perfectPairs > 0 || hand.sideBets.twentyOnePlusThree > 0) && (
                      <div className="text-xs mt-1">
                        {hand.sideBets.perfectPairs > 0 && (
                          <div>
                            {hand.sideBetResults?.perfectPairs ? (
                              <p className="text-green-500">
                                ✓ PP: {getSideBetName(hand.sideBetResults.perfectPairs.type, 'perfectPairs')} +R$ {hand.sideBetResults.perfectPairs.won}
                              </p>
                            ) : (
                              <p className="text-red-500">✗ PP: R$ {hand.sideBets.perfectPairs}</p>
                            )}
                          </div>
                        )}
                        {hand.sideBets.twentyOnePlusThree > 0 && (
                          <div>
                            {hand.sideBetResults?.twentyOnePlusThree ? (
                              <p className="text-green-500">
                                ✓ 21+3: {getSideBetName(hand.sideBetResults.twentyOnePlusThree.type, 'twentyOnePlusThree')} +R$ {hand.sideBetResults.twentyOnePlusThree.won}
                              </p>
                            ) : (
                              <p className="text-red-500">✗ 21+3: R$ {hand.sideBets.twentyOnePlusThree}</p>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                    {currentPhase === 'finished' && (
                      <div className={`text-sm font-bold mt-1 ${
                        getHandResult(hand, roomState.gameState.dealer.hands[0])?.includes('Ganhou') || 
                        getHandResult(hand, roomState.gameState.dealer.hands[0])?.includes('BLACKJACK')
                          ? 'text-green-500'
                          : getHandResult(hand, roomState.gameState.dealer.hands[0]) === 'Empate'
                          ? 'text-yellow-500'
                          : 'text-red-500'
                      }`}>
                        {getHandResult(hand, roomState.gameState.dealer.hands[0])}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>

          {isMyTurn && currentHand && !currentHand.isStanding && !currentHand.isBusted && !currentHand.isBlackjack && currentHand.value !== 21 && (
            <div className="mt-6 flex gap-2 flex-wrap justify-center">
              <button
                onClick={() => handleAction('pedir carta', 'hit')}
                disabled={actionLoading}
                className="bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold py-2 px-6 rounded-lg hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 transition"
              >
                Pedir Carta
              </button>

              <button
                onClick={() => handleAction('parar', 'stand')}
                disabled={actionLoading}
                className="bg-gradient-to-r from-red-500 to-red-600 text-white font-bold py-2 px-6 rounded-lg hover:from-red-600 hover:to-red-700 disabled:opacity-50 transition"
              >
                Parar
              </button>

              {currentHand.canDoubleDown && (
                <button
                  onClick={() => handleAction('dobrar', 'double')}
                  disabled={actionLoading}
                  className="bg-gradient-to-r from-purple-500 to-purple-600 text-white font-bold py-2 px-6 rounded-lg hover:from-purple-600 hover:to-purple-700 disabled:opacity-50 transition"
                >
                  Dobrar
                </button>
              )}

              {currentHand.canSplit && (
                <button
                  onClick={() => handleAction('dividir', 'split')}
                  disabled={actionLoading}
                  className="bg-gradient-to-r from-green-500 to-green-600 text-white font-bold py-2 px-6 rounded-lg hover:from-green-600 hover:to-green-700 disabled:opacity-50 transition"
                >
                  Dividir
                </button>
              )}
            </div>
          )}

          {isMyTurn && currentHand && currentHand.value === 21 && (
            <div className="mt-6 bg-yellow-500/20 border border-yellow-500 text-yellow-500 px-4 py-3 rounded-lg font-bold text-center">
              21! Mão perfeita - Parou automaticamente
            </div>
          )}

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

export default MultiplayerGame

