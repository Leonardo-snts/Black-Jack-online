import { useState, useEffect, useRef } from 'react'
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
  const [dealerCardsToShow, setDealerCardsToShow] = useState([])
  const [showResults, setShowResults] = useState(false)
  const animatingDealerRef = useRef(false)

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
        setDealerCardsToShow([])
        setShowResults(false)
        animatingDealerRef.current = false
      } else if (roomState.gameState.gameState === 'playing') {
        setCurrentPhase('playing')
        setDealerCardsToShow(roomState.gameState.dealer.hands[0].cards)
        setShowResults(false)
        animatingDealerRef.current = false
      } else if (roomState.gameState.gameState === 'finished') {
        setCurrentPhase('finished')
        
        // Anima dealer sequencialmente quando jogo termina
        if (!animatingDealerRef.current) {
          animatingDealerRef.current = true
          setShowResults(false) // Esconde resultados durante animação
          const dealerCards = roomState.gameState.dealer.hands[0].cards
          
          // Limpa primeiro
          setDealerCardsToShow([])
          
          // Pequeno delay antes de começar
          setTimeout(() => {
            // Mostra cartas iniciais
            const initialCards = dealerCards.slice(0, 2)
            setDealerCardsToShow([...initialCards])
            
            // Anima cartas adicionais uma por uma
            const extraCards = dealerCards.length - 2
            if (extraCards > 0) {
              dealerCards.slice(2).forEach((card, index) => {
                setTimeout(() => {
                  setDealerCardsToShow(prev => [...prev, card])
                  
                  // Se for a última carta, mostra resultados
                  if (index === extraCards - 1) {
                    setTimeout(() => {
                      setShowResults(true)
                    }, 800) // Espera a animação da última carta completar
                  }
                }, (index + 1) * 900)
              })
            } else {
              // Se dealer não puxou cartas extras, mostra resultado após revelar as 2 iniciais
              setTimeout(() => {
                setShowResults(true)
              }, 800)
            }
          }, 100)
        }
      }
    }
  }, [roomState?.gameState?.gameState, roomState?.gameState?.dealer?.hands?.[0]?.cards?.length])

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
      
      // Delay para animação da carta do JOGADOR completar
      await new Promise(resolve => setTimeout(resolve, 900))
      
      // Se o jogo terminou, delay adicional para transição
      if (response.data.gameState === 'finished') {
        await new Promise(resolve => setTimeout(resolve, 400))
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

  const getHandResult = (hand, dealerHand) => {
    if (!dealerHand || currentPhase !== 'finished' || !showResults) return null

    const dealerValue = dealerHand.value
    const playerValue = hand.value

    if (hand.isBusted) return 'Perdeu'
    if (dealerHand.isBusted) return 'Ganhou!'
    if (hand.isBlackjack && !dealerHand.isBlackjack) return 'BLACKJACK!'
    if (playerValue > dealerValue) return 'Ganhou!'
    if (playerValue === dealerValue) return 'Empate'
    return 'Perdeu'
  }

  if (!roomState || !roomState.gameState) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
        <div className="text-white text-2xl">Carregando jogo...</div>
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
      <div className="min-h-screen p-4 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-xl shadow-2xl p-6 border border-yellow-500/30 mb-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600">
                  Sala: {roomCode}
                </h2>
                <p className="text-slate-400">Saldo: <span className="text-yellow-500 font-bold text-xl">R$ {currentPlayer.balance}</span></p>
              </div>
            </div>
          </div>

          {!hasBet ? (
            <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-md rounded-2xl shadow-2xl p-8 border-2 border-yellow-500/30">
              <h3 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600 mb-8 text-center">
                Faça sua Aposta
              </h3>
              
              <div className="space-y-6">
                <div className="bg-slate-700/50 rounded-xl p-6 border border-slate-600">
                  <label className="block text-lg font-semibold text-yellow-400 mb-4">
                    Aposta Principal
                  </label>
                  <input
                    type="number"
                    value={mainBet}
                    onChange={(e) => setMainBet(parseInt(e.target.value) || 0)}
                    className="w-full px-6 py-4 bg-slate-600/50 border-2 border-slate-500 rounded-xl text-white text-2xl font-bold focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition"
                    min="1"
                  />
                  
                  <div className="grid grid-cols-4 gap-3 mt-4">
                    {[10, 25, 50, 100].map(amount => (
                      <button
                        key={amount}
                        onClick={() => setMainBet(amount)}
                        className="bg-gradient-to-br from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-slate-900 font-bold py-3 rounded-lg transition transform hover:scale-105"
                      >
                        R$ {amount}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-700/50 rounded-xl p-6 border border-slate-600">
                  <h4 className="text-lg font-semibold text-yellow-400 mb-4">Apostas Laterais</h4>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Perfect Pairs (Paga até 25:1)
                      </label>
                      <input
                        type="number"
                        value={perfectPairsBet}
                        onChange={(e) => setPerfectPairsBet(parseInt(e.target.value) || 0)}
                        className="w-full px-4 py-3 bg-slate-600/50 border border-slate-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500 transition"
                        min="0"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        21+3 (Paga até 100:1)
                      </label>
                      <input
                        type="number"
                        value={twentyOnePlusThreeBet}
                        onChange={(e) => setTwentyOnePlusThreeBet(parseInt(e.target.value) || 0)}
                        className="w-full px-4 py-3 bg-slate-600/50 border border-slate-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500 transition"
                        min="0"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-slate-700 to-slate-800 rounded-xl p-6 flex justify-between items-center border-2 border-yellow-500/50">
                  <span className="text-yellow-400 font-semibold text-lg">Total da Aposta:</span>
                  <span className="text-4xl font-bold text-yellow-500">R$ {totalBet}</span>
                </div>

                {message && (
                  <div className="bg-red-500/10 border-2 border-red-500 text-red-400 px-6 py-4 rounded-xl font-semibold">
                    {message}
                  </div>
                )}

                <button
                  onClick={handlePlaceBet}
                  disabled={totalBet > currentPlayer.balance || mainBet < 1}
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-5 rounded-xl transition transform hover:scale-105 shadow-xl text-lg"
                >
                  Confirmar Aposta
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-gradient-to-br from-slate-700/50 to-slate-800/50 backdrop-blur-md rounded-xl p-8 text-center border-2 border-yellow-500/30">
              <div className="text-yellow-400 text-2xl font-bold mb-3">✓ Aposta Confirmada!</div>
              <div className="text-slate-300 text-lg">Aguardando outros jogadores...</div>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-7xl mx-auto">
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-xl shadow-2xl p-4 mb-6 border border-yellow-500/30">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600">
                Sala: {roomCode}
              </h2>
              <p className="text-slate-400">Saldo: <span className="text-yellow-500 font-bold text-xl">R$ {currentPlayer.balance}</span></p>
            </div>
            {currentPhase === 'finished' && showResults && (
              <button
                onClick={handleNewRound}
                className="bg-gradient-to-r from-green-500 to-green-600 text-white font-bold py-3 px-8 rounded-xl hover:from-green-600 hover:to-green-700 transition transform hover:scale-105 shadow-lg fade-in"
              >
                Nova Rodada
              </button>
            )}
          </div>
        </div>

        <div className="blackjack-table table-felt-pattern rounded-[200px] p-8 min-h-[650px] flex flex-col">
          {/* Dealer */}
          <div className="dealer-position flex flex-col items-center mb-6">
            <div className="flex gap-2 mb-3">
              {dealerCardsToShow.map((card, idx) => (
                <Card 
                  key={`dealer-${idx}-${card.value}${card.suit}`} 
                  card={card} 
                  index={idx}
                  animate={true}
                />
              ))}
              {currentPhase === 'playing' && dealerCardsToShow.length === 1 && (
                <Card hidden={true} index={1} animate={true} />
              )}
            </div>
            {roomState.gameState.dealer.hands[0].value !== null && (
              <div className="bg-slate-900/80 px-4 py-2 rounded-full border-2 border-yellow-500/50 backdrop-blur-sm fade-in">
                <span className="text-white font-bold">Valor: <span className="smooth-transition">{roomState.gameState.dealer.hands[0].value}</span></span>
              </div>
            )}
          </div>

          {/* Jogadores */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 flex-1">
            {roomState.gameState.players.map((player) => (
              <div
                key={player.id}
                className={`bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-md rounded-xl p-4 border-2 ${
                  player.id === playerId ? 'border-yellow-400 ring-2 ring-yellow-400/50' : 'border-slate-700'
                } ${isMyTurn && player.id === playerId ? 'ring-4 ring-green-500' : ''} transition-all`}
              >
                <div className="mb-3">
                  <h4 className="text-white font-bold flex items-center justify-between">
                    <span>{player.name} {player.id === playerId && '(Você)'}</span>
                    {isMyTurn && player.id === playerId && (
                      <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full animate-pulse">SUA VEZ!</span>
                    )}
                  </h4>
                </div>

                {player.hands.map((hand, handIdx) => (
                  <div key={handIdx} className="mb-3">
                  <div className="flex gap-1 mb-2 flex-wrap">
                    {hand.cards.map((card, cardIdx) => (
                      <div key={`${player.id}-${handIdx}-${cardIdx}-${card.value}${card.suit}`} className="w-14">
                        <Card 
                          card={card} 
                          index={cardIdx}
                          animate={true}
                        />
                      </div>
                    ))}
                  </div>
                    <div className="text-white text-sm font-semibold smooth-transition">
                      Valor: <span className="text-yellow-400 smooth-transition">{hand.value}</span>
                      {hand.isBusted && <span className="text-red-400 ml-1 scale-in">BUST!</span>}
                      {hand.isBlackjack && <span className="text-yellow-400 ml-1 scale-in">BJ!</span>}
                      {hand.value === 21 && !hand.isBlackjack && <span className="text-yellow-400 ml-1 scale-in">21!</span>}
                    </div>
                    <div className="text-slate-400 text-xs">Aposta: R$ {hand.bet}</div>
                    
                    {(hand.sideBets.perfectPairs > 0 || hand.sideBets.twentyOnePlusThree > 0) && (
                      <div className="text-xs mt-1 space-y-1">
                        {hand.sideBets.perfectPairs > 0 && (
                          <div>
                            {hand.sideBetResults?.perfectPairs ? (
                              <p className="text-green-400 font-semibold">
                                ✓ PP: {getSideBetName(hand.sideBetResults.perfectPairs.type, 'perfectPairs')} +R$ {hand.sideBetResults.perfectPairs.won}
                              </p>
                            ) : (
                              <p className="text-red-400">✗ PP: R$ {hand.sideBets.perfectPairs}</p>
                            )}
                          </div>
                        )}
                        {hand.sideBets.twentyOnePlusThree > 0 && (
                          <div>
                            {hand.sideBetResults?.twentyOnePlusThree ? (
                              <p className="text-green-400 font-semibold">
                                ✓ 21+3: {getSideBetName(hand.sideBetResults.twentyOnePlusThree.type, 'twentyOnePlusThree')} +R$ {hand.sideBetResults.twentyOnePlusThree.won}
                              </p>
                            ) : (
                              <p className="text-red-400">✗ 21+3: R$ {hand.sideBets.twentyOnePlusThree}</p>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                    
                    {currentPhase === 'finished' && (
                      <div className={`text-sm font-bold mt-2 px-2 py-1 rounded ${
                        getHandResult(hand, roomState.gameState.dealer.hands[0])?.includes('Ganhou') || 
                        getHandResult(hand, roomState.gameState.dealer.hands[0])?.includes('BLACKJACK')
                          ? 'bg-green-500/20 text-green-400'
                          : getHandResult(hand, roomState.gameState.dealer.hands[0]) === 'Empate'
                          ? 'bg-yellow-500/20 text-yellow-400'
                          : 'bg-red-500/20 text-red-400'
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
            <div className="mt-6 flex gap-3 flex-wrap justify-center">
              <button
                onClick={() => handleAction('pedir carta', 'hit')}
                disabled={actionLoading}
                className="bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold py-3 px-8 rounded-xl hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 transition transform hover:scale-105 shadow-lg"
              >
                Pedir Carta
              </button>

              <button
                onClick={() => handleAction('parar', 'stand')}
                disabled={actionLoading}
                className="bg-gradient-to-r from-red-500 to-red-600 text-white font-bold py-3 px-8 rounded-xl hover:from-red-600 hover:to-red-700 disabled:opacity-50 transition transform hover:scale-105 shadow-lg"
              >
                Parar
              </button>

              {currentHand.canDoubleDown && (
                <button
                  onClick={() => handleAction('dobrar', 'double')}
                  disabled={actionLoading}
                  className="bg-gradient-to-r from-purple-500 to-purple-600 text-white font-bold py-3 px-8 rounded-xl hover:from-purple-600 hover:to-purple-700 disabled:opacity-50 transition transform hover:scale-105 shadow-lg"
                >
                  Dobrar
                </button>
              )}

              {currentHand.canSplit && (
                <button
                  onClick={() => handleAction('dividir', 'split')}
                  disabled={actionLoading}
                  className="bg-gradient-to-r from-green-500 to-green-600 text-white font-bold py-3 px-8 rounded-xl hover:from-green-600 hover:to-green-700 disabled:opacity-50 transition transform hover:scale-105 shadow-lg"
                >
                  Dividir
                </button>
              )}
            </div>
          )}

          {isMyTurn && currentHand && currentHand.value === 21 && (
            <div className="mt-6 bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 border-2 border-yellow-400 text-yellow-400 px-6 py-3 rounded-xl font-bold text-center backdrop-blur-sm scale-in">
              ✨ 21! Mão perfeita - Parou automaticamente ✨
            </div>
          )}

          {message && (
            <div className="mt-4 bg-gradient-to-r from-slate-800 to-slate-900 border-2 border-yellow-500 text-white px-6 py-3 rounded-xl text-center font-bold shadow-xl">
              {message}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default MultiplayerGame
