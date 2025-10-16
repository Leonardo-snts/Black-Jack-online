import { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import Card from './Card'

function GameTable({ gameId, playerId, gameData, playerData, onNewRound, onGameStateUpdate }) {
  const [actionLoading, setActionLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [dealerCardsToShow, setDealerCardsToShow] = useState([])
  const [showResults, setShowResults] = useState(false)
  const animatingDealerRef = useRef(false)

  const currentHand = playerData.hands[playerData.currentHandIndex]
  const isMyTurn = gameData.gameState === 'playing' && 
                   gameData.currentPlayerIndex === gameData.players.findIndex(p => p.id === playerId)

  // Anima cartas do dealer sequencialmente
  useEffect(() => {
    const dealerCards = gameData.dealer.hands[0].cards
    
    if (gameData.gameState === 'waiting') {
      setDealerCardsToShow([])
      setShowResults(false)
      animatingDealerRef.current = false
    } else if (gameData.gameState === 'playing') {
      // Durante o jogo, mostra cartas normalmente
      setDealerCardsToShow(dealerCards)
      setShowResults(false)
      animatingDealerRef.current = false
    } else if (gameData.gameState === 'finished' && !animatingDealerRef.current) {
      animatingDealerRef.current = true
      setShowResults(false) // Esconde resultados durante animação
      
      // Limpa primeiro para garantir animação
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
            }, (index + 1) * 900) // 900ms entre cada carta
          })
        } else {
          // Se dealer não puxou cartas extras, mostra resultado após revelar as 2 iniciais
          setTimeout(() => {
            setShowResults(true)
          }, 800)
        }
      }, 100)
    }
  }, [gameData.gameState, gameData.dealer.hands[0].cards.length])

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
      
      // Delay para animação da carta do JOGADOR completar
      await new Promise(resolve => setTimeout(resolve, 900))
      await onGameStateUpdate()
      
      // Se o jogo terminou, espera mais um pouco para o dealer começar a animar
      const newState = await axios.get(`/api/game/${gameId}/state`)
      if (newState.data.game.gameState === 'finished') {
        // Delay adicional para transição visual suave
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

  const getHandResult = (hand, dealerHand) => {
    if (!dealerHand || gameData.gameState !== 'finished' || !showResults) return null

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
    <div className="min-h-screen p-4 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-7xl mx-auto">
        {/* Header com saldo */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-xl shadow-2xl p-4 mb-6 border border-yellow-500/30">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600">
                {playerData.name}
              </h2>
              <p className="text-slate-400">
                Saldo: <span className="text-yellow-500 font-bold text-xl">R$ {playerData.balance}</span>
              </p>
            </div>
            {gameData.gameState === 'finished' && showResults && (
              <button
                onClick={onNewRound}
                className="bg-gradient-to-r from-green-500 to-green-600 text-white font-bold py-3 px-8 rounded-xl hover:from-green-600 hover:to-green-700 transition transform hover:scale-105 shadow-lg fade-in"
              >
                Nova Rodada
              </button>
            )}
          </div>
        </div>

        {/* Mesa de Blackjack */}
        <div className="blackjack-table table-felt-pattern rounded-[200px] p-12 min-h-[600px] flex flex-col justify-between">
          {/* Área do Dealer */}
          <div className="dealer-position flex flex-col items-center mb-8">
            <div className="flex gap-3 mb-4 justify-center">
              {dealerCardsToShow.map((card, idx) => (
                <Card 
                  key={`dealer-${idx}-${card.value}${card.suit}`} 
                  card={card} 
                  index={idx}
                  animate={true}
                />
              ))}
              {gameData.gameState === 'playing' && dealerCardsToShow.length === 1 && (
                <Card hidden={true} index={1} animate={true} />
              )}
            </div>
            {gameData.dealer.hands[0].value !== null && (
              <div className="bg-slate-900/80 px-6 py-2 rounded-full border-2 border-yellow-500/50 backdrop-blur-sm fade-in">
                <span className="text-white font-bold text-lg">
                  Valor: <span className="smooth-transition">{gameData.dealer.hands[0].value}</span>
                  {gameData.dealer.hands[0].isBusted && <span className="text-red-400 ml-2 scale-in">ESTOUROU!</span>}
                  {gameData.dealer.hands[0].isBlackjack && <span className="text-yellow-400 ml-2 scale-in">BLACKJACK!</span>}
                </span>
              </div>
            )}
          </div>

          {/* Área do Jogador */}
          <div className="space-y-6">
            {playerData.hands.map((hand, handIdx) => (
              <div 
                key={handIdx} 
                className={`slide-in ${handIdx === playerData.currentHandIndex && isMyTurn ? 'ring-4 ring-yellow-400 ring-offset-4 ring-offset-transparent' : ''}`}
                style={{ animationDelay: `${handIdx * 0.1}s` }}
              >
                <div className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-md rounded-2xl p-6 border-2 border-yellow-500/30 shadow-2xl">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-yellow-400 mb-2">
                        Mão {handIdx + 1} {handIdx === playerData.currentHandIndex && isMyTurn && '(Sua vez)'}
                      </h3>
                      <div className="flex items-center gap-4 mb-2">
                        <div className="betting-chip bg-gradient-to-br from-yellow-500 to-yellow-600 border-yellow-400 text-slate-900">
                          R$ {hand.bet}
                        </div>
                        <span className="text-slate-300">Aposta Principal</span>
                      </div>
                      
                      {(hand.sideBets.perfectPairs > 0 || hand.sideBets.twentyOnePlusThree > 0) && (
                        <div className="text-sm mt-3 space-y-2">
                          <p className="text-yellow-400 font-semibold">Apostas Laterais:</p>
                          {hand.sideBets.perfectPairs > 0 && (
                            <div className="bg-slate-800/50 rounded-lg p-2">
                              {hand.sideBetResults?.perfectPairs ? (
                                <p className="text-green-400 font-bold flex items-center gap-2">
                                  <span className="text-2xl">✓</span>
                                  Perfect Pairs: {getSideBetName(hand.sideBetResults.perfectPairs.type, 'perfectPairs')} ({hand.sideBetResults.perfectPairs.payout}:1) 
                                  <span className="text-green-300">+R$ {hand.sideBetResults.perfectPairs.won}</span>
                                </p>
                              ) : (
                                <p className="text-red-400 flex items-center gap-2">
                                  <span className="text-2xl">✗</span>
                                  Perfect Pairs: R$ {hand.sideBets.perfectPairs}
                                </p>
                              )}
                            </div>
                          )}
                          {hand.sideBets.twentyOnePlusThree > 0 && (
                            <div className="bg-slate-800/50 rounded-lg p-2">
                              {hand.sideBetResults?.twentyOnePlusThree ? (
                                <p className="text-green-400 font-bold flex items-center gap-2">
                                  <span className="text-2xl">✓</span>
                                  21+3: {getSideBetName(hand.sideBetResults.twentyOnePlusThree.type, 'twentyOnePlusThree')} ({hand.sideBetResults.twentyOnePlusThree.payout}:1)
                                  <span className="text-green-300">+R$ {hand.sideBetResults.twentyOnePlusThree.won}</span>
                                </p>
                              ) : (
                                <p className="text-red-400 flex items-center gap-2">
                                  <span className="text-2xl">✗</span>
                                  21+3: R$ {hand.sideBets.twentyOnePlusThree}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    
                    {gameData.gameState === 'finished' && showResults && (
                      <div className={`text-3xl font-bold px-6 py-3 rounded-xl fade-in ${
                        getHandResult(hand, gameData.dealer.hands[0]) === 'Ganhou!' || 
                        getHandResult(hand, gameData.dealer.hands[0]) === 'BLACKJACK!' 
                          ? 'bg-green-500/20 text-green-400 border-2 border-green-500' 
                          : getHandResult(hand, gameData.dealer.hands[0]) === 'Empate'
                          ? 'bg-yellow-500/20 text-yellow-400 border-2 border-yellow-500'
                          : 'bg-red-500/20 text-red-400 border-2 border-red-500'
                      }`}>
                        {getHandResult(hand, gameData.dealer.hands[0])}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3 mb-4 flex-wrap">
                    {hand.cards.map((card, cardIdx) => (
                      <Card 
                        key={`player-${handIdx}-${cardIdx}-${card.value}${card.suit}`} 
                        card={card} 
                        index={cardIdx}
                        animate={true}
                      />
                    ))}
                  </div>

                  <div className="bg-slate-800/70 rounded-lg px-4 py-2 inline-block mb-4 smooth-transition">
                    <span className="text-white font-bold text-xl">
                      Valor: <span className="text-yellow-400 text-2xl smooth-transition">{hand.value}</span>
                      {hand.isBusted && <span className="text-red-400 ml-3 scale-in">ESTOUROU!</span>}
                      {hand.isBlackjack && <span className="text-yellow-400 ml-3 scale-in">BLACKJACK!</span>}
                      {hand.isStanding && <span className="text-blue-400 ml-3 scale-in">PAROU</span>}
                    </span>
                  </div>

                  {isMyTurn && handIdx === playerData.currentHandIndex && !hand.isStanding && !hand.isBusted && !hand.isBlackjack && hand.value !== 21 && (
                    <div className="flex gap-3 flex-wrap">
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

                      {hand.canDoubleDown && (
                        <button
                          onClick={() => handleAction('dobrar', 'double')}
                          disabled={actionLoading || playerData.balance < hand.bet}
                          className="bg-gradient-to-r from-purple-500 to-purple-600 text-white font-bold py-3 px-8 rounded-xl hover:from-purple-600 hover:to-purple-700 disabled:opacity-50 transition transform hover:scale-105 shadow-lg"
                        >
                          Dobrar
                        </button>
                      )}

                      {hand.canSplit && (
                        <button
                          onClick={() => handleAction('dividir', 'split')}
                          disabled={actionLoading || playerData.balance < hand.bet}
                          className="bg-gradient-to-r from-green-500 to-green-600 text-white font-bold py-3 px-8 rounded-xl hover:from-green-600 hover:to-green-700 disabled:opacity-50 transition transform hover:scale-105 shadow-lg"
                        >
                          Dividir
                        </button>
                      )}
                    </div>
                  )}

                  {hand.value === 21 && !hand.isBusted && (
                    <div className="bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 border-2 border-yellow-400 text-yellow-400 px-6 py-3 rounded-xl font-bold text-center text-lg backdrop-blur-sm scale-in">
                      ✨ 21! Mão Perfeita ✨
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {message && (
          <div className="mt-6 bg-gradient-to-r from-slate-800 to-slate-900 border-2 border-yellow-500 text-white px-6 py-4 rounded-xl text-center font-bold text-xl shadow-xl slide-in">
            {message}
          </div>
        )}
      </div>
    </div>
  )
}

export default GameTable
