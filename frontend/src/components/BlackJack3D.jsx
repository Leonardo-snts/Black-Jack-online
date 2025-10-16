import { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import './BlackJack3D.css'

function BlackJack3D({ gameId, playerId, gameData, playerData, onNewRound, onGameStateUpdate }) {
  const [actionLoading, setActionLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [dealerCardsToShow, setDealerCardsToShow] = useState([])
  const [showResults, setShowResults] = useState(false)
  const [dealerAnimating, setDealerAnimating] = useState('')
  const animatingDealerRef = useRef(false)
  const [chipsAnimating, setChipsAnimating] = useState(false)

  const currentHand = playerData.hands[playerData.currentHandIndex]
  const isMyTurn = gameData.gameState === 'playing' && 
                   gameData.currentPlayerIndex === gameData.players.findIndex(p => p.id === playerId)

  // Anima dealer
  useEffect(() => {
    const dealerCards = gameData.dealer.hands[0].cards
    
    if (gameData.gameState === 'waiting') {
      setDealerCardsToShow([])
      setShowResults(false)
      animatingDealerRef.current = false
    } else if (gameData.gameState === 'playing') {
      setDealerCardsToShow(dealerCards)
      setShowResults(false)
      animatingDealerRef.current = false
      setDealerAnimating('dealing')
      setTimeout(() => setDealerAnimating(''), 1000)
    } else if (gameData.gameState === 'finished' && !animatingDealerRef.current) {
      animatingDealerRef.current = true
      setShowResults(false)
      setDealerAnimating('thinking')
      
      setDealerCardsToShow([])
      
      setTimeout(() => {
        setDealerAnimating('dealing')
        const initialCards = dealerCards.slice(0, 2)
        setDealerCardsToShow([...initialCards])
        
        const extraCards = dealerCards.length - 2
        if (extraCards > 0) {
          dealerCards.slice(2).forEach((card, index) => {
            setTimeout(() => {
              setDealerCardsToShow(prev => [...prev, card])
              
              if (index === extraCards - 1) {
                setTimeout(() => {
                  setDealerAnimating(gameData.dealer.hands[0].isBusted ? 'sad' : 'happy')
                  setShowResults(true)
                }, 800)
              }
            }, (index + 1) * 900)
          })
        } else {
          setTimeout(() => {
            setDealerAnimating(gameData.dealer.hands[0].isBusted ? 'sad' : 'happy')
            setShowResults(true)
          }, 800)
        }
      }, 100)
    }
  }, [gameData.gameState, gameData.dealer.hands[0].cards.length])

  const handleAction = async (action, endpoint) => {
    setActionLoading(true)
    setMessage('')
    setDealerAnimating('watching')

    try {
      const response = await axios.post(`/api/game/${gameId}/${endpoint}`, { playerId })
      
      if (response.data.isBusted) {
        setMessage('Estourou!')
        setDealerAnimating('happy')
      } else if (response.data.autoStand) {
        setMessage('21! Parou automaticamente')
        setDealerAnimating('impressed')
      }
      
      await new Promise(resolve => setTimeout(resolve, 900))
      await onGameStateUpdate()
      
      const newState = await axios.get(`/api/game/${gameId}/state`)
      if (newState.data.game.gameState === 'finished') {
        await new Promise(resolve => setTimeout(resolve, 400))
      }
    } catch (error) {
      setMessage(error.response?.data?.error || `Erro ao ${action}`)
    } finally {
      setActionLoading(false)
    }
  }

  const handlePlaceBet = async () => {
    setChipsAnimating(true)
    setTimeout(() => setChipsAnimating(false), 1000)
    // Lógica de aposta aqui
  }

  const getHandResult = (hand, dealerHand) => {
    if (!dealerHand || gameData.gameState !== 'finished' || !showResults) return null

    const dealerValue = dealerHand.value
    const playerValue = hand.value

    if (hand.isBusted) return { text: 'Perdeu', type: 'lose' }
    if (dealerHand.isBusted) return { text: 'Ganhou!', type: 'win' }
    if (hand.isBlackjack && !dealerHand.isBlackjack) return { text: 'BLACKJACK!', type: 'blackjack' }
    if (playerValue > dealerValue) return { text: 'Ganhou!', type: 'win' }
    if (playerValue === dealerValue) return { text: 'Empate', type: 'push' }
    return { text: 'Perdeu', type: 'lose' }
  }

  return (
    <div className="blackjack-3d-container">
      {/* Cenário 3D */}
      <div className="casino-scene">
        {/* Parede de fundo */}
        <div className="casino-wall"></div>
        
        {/* Mesa 3D */}
        <div className="table-3d">
          <div className="table-surface">
            <div className="table-felt"></div>
            <div className="betting-circle player-circle">JOGADOR</div>
            
            {/* Fichas na mesa */}
            {currentHand && (
              <div className={`chips-stack ${chipsAnimating ? 'chip-drop' : ''}`}>
                <div className="chip chip-red" style={{ '--delay': '0s' }}>
                  <div className="chip-value">R$ {currentHand.bet}</div>
                </div>
                {currentHand.sideBets.perfectPairs > 0 && (
                  <div className="chip chip-blue" style={{ '--delay': '0.1s' }}>
                    <div className="chip-value">PP</div>
                  </div>
                )}
                {currentHand.sideBets.twentyOnePlusThree > 0 && (
                  <div className="chip chip-green" style={{ '--delay': '0.2s' }}>
                    <div className="chip-value">21+3</div>
                  </div>
                )}
              </div>
            )}

            {/* Dealer */}
            <div className={`dealer-3d ${dealerAnimating}`}>
              <div className="dealer-avatar">
                <div className="dealer-head">
                  <div className="dealer-face"></div>
                  <div className="dealer-eyes">
                    <span className="eye"></span>
                    <span className="eye"></span>
                  </div>
                </div>
                <div className="dealer-body">
                  <span style={{ top: '20px' }}></span>
                  <span style={{ top: '40px' }}></span>
                  <span style={{ top: '60px' }}></span>
                </div>
                <div className="dealer-arms">
                  <div className="dealer-arm left"></div>
                  <div className="dealer-arm right"></div>
                </div>
              </div>
              <div className="dealer-name-tag">🎰 Dealer Profissional</div>
            </div>

            {/* Cartas do Dealer */}
            <div className="dealer-cards-3d" style={{ position: 'relative', width: `${dealerCardsToShow.length * 25 + 45}px`, height: '65px' }}>
              {dealerCardsToShow.map((card, idx) => (
                <div
                  key={`dealer-${idx}-${card.value}${card.suit}`}
                  className="card-3d-wrapper"
                  style={{ '--card-index': idx, '--card-delay': `${idx * 0.15}s` }}
                >
                  <div className="card-3d">
                    <div className="card-3d-front">
                      <div className={`card-3d-content ${card.suit === '♥' || card.suit === '♦' ? 'red' : 'black'}`}>
                        <div className="card-corner top-left">
                          <span className="value">{card.value}</span>
                          <span className="suit">{card.suit}</span>
                        </div>
                        <div className="card-center">{card.suit}</div>
                        <div className="card-corner bottom-right">
                          <span className="value">{card.value}</span>
                          <span className="suit">{card.suit}</span>
                        </div>
                      </div>
                    </div>
                    <div className="card-3d-back"></div>
                  </div>
                </div>
              ))}
              {dealerCardsToShow.length > 0 && (
                <div style={{
                  position: 'absolute',
                  top: '-40px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: 'rgba(212, 175, 55, 0.9)',
                  color: '#1a0a2e',
                  padding: '8px 20px',
                  borderRadius: '20px',
                  fontWeight: 'bold',
                  fontSize: '14px',
                  whiteSpace: 'nowrap',
                  boxShadow: '0 5px 15px rgba(212, 175, 55, 0.5)'
                }}>
                  DEALER
                </div>
              )}
            </div>

            {/* Cartas do Jogador */}
            <div className="player-cards-3d">
              {playerData.hands.map((hand, handIdx) => (
                <div key={handIdx} className="player-hand-3d" style={{ position: 'relative', width: `${hand.cards.length * 25 + 45}px`, height: '65px' }}>
                  {hand.cards.map((card, cardIdx) => (
                    <div
                      key={`player-${handIdx}-${cardIdx}-${card.value}${card.suit}`}
                      className="card-3d-wrapper player-card"
                      style={{ '--card-index': cardIdx, '--card-delay': `${cardIdx * 0.15}s` }}
                    >
                      <div className="card-3d">
                        <div className="card-3d-front">
                          <div className={`card-3d-content ${card.suit === '♥' || card.suit === '♦' ? 'red' : 'black'}`}>
                            <div className="card-corner top-left">
                              <span className="value">{card.value}</span>
                              <span className="suit">{card.suit}</span>
                            </div>
                            <div className="card-center">{card.suit}</div>
                            <div className="card-corner bottom-right">
                              <span className="value">{card.value}</span>
                              <span className="suit">{card.suit}</span>
                            </div>
                          </div>
                        </div>
                        <div className="card-3d-back"></div>
                      </div>
                    </div>
                  ))}

                  {/* Label VOCÊ */}
                  <div style={{
                    position: 'absolute',
                    top: '-40px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: 'rgba(81, 207, 102, 0.9)',
                    color: 'white',
                    padding: '8px 20px',
                    borderRadius: '20px',
                    fontWeight: 'bold',
                    fontSize: '14px',
                    whiteSpace: 'nowrap',
                    boxShadow: '0 5px 15px rgba(81, 207, 102, 0.5)',
                    border: '2px solid rgba(255, 255, 255, 0.3)'
                  }}>
                    VOCÊ
                  </div>

                  {/* Valor da mão */}
                  <div className="hand-value-3d">
                    <span className="value-text">{hand.value}</span>
                    {hand.isBlackjack && <span className="bj-badge">BJ!</span>}
                    {hand.isBusted && <span className="bust-badge">BUST!</span>}
                  </div>

                  {/* Resultado */}
                  {showResults && getHandResult(hand, gameData.dealer.hands[0]) && (
                    <div className={`result-3d ${getHandResult(hand, gameData.dealer.hands[0]).type}`}>
                      <div className="result-text">
                        {getHandResult(hand, gameData.dealer.hands[0]).text}
                      </div>
                      <div className="result-particles"></div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Controles */}
        <div className="controls-3d">
          {isMyTurn && currentHand && !currentHand.isStanding && !currentHand.isBusted && !currentHand.isBlackjack && currentHand.value !== 21 && (
            <div className="action-buttons-3d">
              <button
                onClick={() => handleAction('pedir carta', 'hit')}
                disabled={actionLoading}
                className="btn-3d btn-hit"
              >
                <span className="btn-icon">🃏</span>
                <span className="btn-text">PEDIR</span>
              </button>
              <button
                onClick={() => handleAction('parar', 'stand')}
                disabled={actionLoading}
                className="btn-3d btn-stand"
              >
                <span className="btn-icon">✋</span>
                <span className="btn-text">PARAR</span>
              </button>
              {currentHand.cards.length === 2 && playerData.balance >= currentHand.bet && (
                <button
                  onClick={() => handleAction('dobrar', 'double')}
                  disabled={actionLoading}
                  className="btn-3d btn-double"
                >
                  <span className="btn-icon">2×</span>
                  <span className="btn-text">DOBRAR</span>
                </button>
              )}
            </div>
          )}

          {gameData.gameState === 'finished' && showResults && (
            <button onClick={onNewRound} className="btn-3d btn-new-round">
              <span className="btn-icon">🔄</span>
              <span className="btn-text">NOVA RODADA</span>
            </button>
          )}
        </div>

        {/* Info HUD */}
        <div className="hud-3d">
          <div className="hud-item balance">
            <span className="hud-label">Saldo</span>
            <span className="hud-value">R$ {playerData.balance}</span>
          </div>
          {message && (
            <div className="hud-message">{message}</div>
          )}
        </div>
      </div>
    </div>
  )
}

export default BlackJack3D

