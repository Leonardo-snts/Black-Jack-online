import { useState, useEffect } from 'react'
import axios from 'axios'
import UNOCard from './UNOCard'

function UNOGameTable({ roomCode, playerId, onBackToLobby }) {
  const [roomState, setRoomState] = useState(null)
  const [selectedCardIndex, setSelectedCardIndex] = useState(null)
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [drawnCardIndex, setDrawnCardIndex] = useState(null)
  const [canPlayDrawnCard, setCanPlayDrawnCard] = useState(false)

  useEffect(() => {
    fetchRoomState()
    const interval = setInterval(fetchRoomState, 1000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    // Verifica se há penalidade de UNO no último estado
    if (roomState?.gameState?.lastAction?.unoPenalty) {
      const penalty = roomState.gameState.lastAction.unoPenalty
      setMessage(`❌ ${penalty.playerName} esqueceu de gritar UNO e comprou 2 cartas!`)
      setTimeout(() => setMessage(''), 3000)
    }
  }, [roomState?.gameState?.lastAction])

  useEffect(() => {
    // Verifica se é a vez do jogador e há drawStack mas sem defesa - compra automaticamente
    const gameState = roomState?.gameState
    if (gameState?.isMyTurn && gameState?.drawStack > 0 && gameState?.drawStackDefense) {
      if (!gameState.drawStackDefense.hasDefense) {
        // Não tem defesa, compra automaticamente
        handleDrawCard()
      }
    }
  }, [roomState?.gameState?.isMyTurn, roomState?.gameState?.drawStack])

  const fetchRoomState = async () => {
    try {
      const response = await axios.get(`/api/uno/room/${roomCode}/state`, {
        params: { playerId }
      })
      setRoomState(response.data)
    } catch (error) {
      console.error('Erro ao buscar estado:', error)
    }
  }

  const handlePlayCard = async (cardIndex, chosenColor = null) => {
    setLoading(true)
    setMessage('')
    
    try {
      const card = roomState.gameState.myHand[cardIndex]
      
      // Se for coringa, mostra o seletor de cor
      if ((card.type === 'wild' || card.type === 'wild_draw_four') && !chosenColor) {
        setSelectedCardIndex(cardIndex)
        setShowColorPicker(true)
        setLoading(false)
        return
      }

      const response = await axios.post(`/api/uno/room/${roomCode}/play`, {
        playerId,
        cardIndex,
        chosenColor
      })

      setSelectedCardIndex(null)
      setShowColorPicker(false)
      
      // Limpa o estado de carta comprada
      setDrawnCardIndex(null)
      setCanPlayDrawnCard(false)

      // Se ficou com 1 carta e precisa gritar UNO, mostra mensagem
      if (response.data.needsUno) {
        setMessage('⚠️ Você tem 1 carta! GRITE UNO ou levará penalidade! ⚠️')
      }
      
      await fetchRoomState()
    } catch (error) {
      setMessage(error.response?.data?.error || 'Erro ao jogar carta')
    } finally {
      setLoading(false)
    }
  }

  const handleDrawCard = async () => {
    setLoading(true)
    setMessage('')
    
    try {
      const response = await axios.post(`/api/uno/room/${roomCode}/draw`, {
        playerId
      })

      if (response.data.mustDraw) {
        // Comprou cartas de penalidade (+2 ou +4)
        setMessage(`Você comprou ${response.data.count} cartas! ⚡`)
        setDrawnCardIndex(null)
        setCanPlayDrawnCard(false)
      } else {
        // Compra normal
        const canPlay = response.data.canPlay
        const cardIndex = response.data.drawnCardIndex
        
        setDrawnCardIndex(cardIndex)
        setCanPlayDrawnCard(canPlay)
        
        if (canPlay) {
          setMessage('✅ Você pode jogar a carta que comprou ou passar a vez')
        } else {
          setMessage('❌ Não pode jogar a carta. Passando a vez...')
          // Se não pode jogar, passa automaticamente após 1.5s
          setTimeout(() => handlePassTurn(), 1500)
        }
      }

      await fetchRoomState()
    } catch (error) {
      setMessage(error.response?.data?.error || 'Erro ao comprar carta')
    } finally {
      setLoading(false)
    }
  }

  const handlePassTurn = async () => {
    setLoading(true)
    setMessage('')
    
    try {
      await axios.post(`/api/uno/room/${roomCode}/pass`, {
        playerId
      })
      
      setMessage('Passou a vez ➡️')
      setDrawnCardIndex(null)
      setCanPlayDrawnCard(false)
      
      await fetchRoomState()
    } catch (error) {
      setMessage(error.response?.data?.error || 'Erro ao passar a vez')
    } finally {
      setLoading(false)
    }
  }

  const handleSayUno = async () => {
    try {
      const response = await axios.post(`/api/uno/room/${roomCode}/uno`, {
        playerId
      })
      
      if (response.data.success) {
        setMessage('✅ UNO! Você está protegido! 🎉')
        setTimeout(() => setMessage(''), 3000)
      } else {
        setMessage('❌ ' + (response.data.message || 'Você precisa ter apenas 1 carta'))
      }
      
      await fetchRoomState()
    } catch (error) {
      console.error('Erro ao gritar UNO:', error)
      setMessage('❌ Erro ao gritar UNO')
    }
  }

  const handleRestart = async () => {
    try {
      await axios.post(`/api/uno/room/${roomCode}/restart`)
      await fetchRoomState()
    } catch (error) {
      console.error('Erro ao reiniciar:', error)
    }
  }

  const selectColor = async (color) => {
    await handlePlayCard(selectedCardIndex, color)
  }

  if (!roomState || !roomState.gameState) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-2xl">Carregando jogo...</div>
      </div>
    )
  }

  const gameState = roomState.gameState
  const isMyTurn = gameState.isMyTurn
  const myHand = gameState.myHand || []
  const currentPlayer = roomState.players[gameState.currentPlayerIndex]
  const myPlayer = roomState.players.find(p => p.id === playerId)
  const showUnoButton = myHand.length === 1 && (!myPlayer?.saidUno)

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-4">
        <div className="flex justify-between items-center text-white">
          <button
            onClick={onBackToLobby}
            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition"
          >
            ← Sair
          </button>
          
          <div className="text-center">
            <div className="text-sm opacity-80">Sala: {roomCode}</div>
            <div className="text-lg font-bold">
              {gameState.gameState === 'finished' ? '🏆 Jogo Finalizado!' : 
               isMyTurn ? '🎯 SUA VEZ!' : `Vez de ${currentPlayer?.name}`}
            </div>
          </div>

          <div className="text-right">
            <div className="text-sm opacity-80">Cartas restantes</div>
            <div className="text-2xl font-bold">{gameState.remainingCards}</div>
          </div>
        </div>
      </div>

      {/* Outros jogadores */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="flex justify-center gap-4 flex-wrap">
          {roomState.players
            .filter(p => p.id !== playerId)
            .map((player) => (
              <div
                key={player.id}
                className={`
                  bg-white/10 backdrop-blur-sm rounded-xl p-3 text-white
                  ${player.id === currentPlayer.id ? 'ring-4 ring-yellow-400' : ''}
                `}
              >
                <div className="font-bold">{player.name}</div>
                <div className="text-sm opacity-80">
                  {player.cardCount} {player.cardCount === 1 ? 'carta' : 'cartas'}
                </div>
                {player.saidUno && player.cardCount === 1 && (
                  <div className="text-xs text-yellow-400 font-bold">UNO!</div>
                )}
              </div>
            ))}
        </div>
      </div>

      {/* Mesa central */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-8">
          <div className="flex justify-center items-center gap-8">
            {/* Pilha de compra */}
            <div className="text-center">
              <div className="text-white text-sm mb-2">Comprar</div>
              <div
                onClick={isMyTurn && !loading ? handleDrawCard : undefined}
                className={`
                  w-24 h-36 rounded-xl bg-gradient-to-br from-gray-700 to-gray-900
                  flex items-center justify-center text-white text-4xl font-bold
                  border-4 border-white/30
                  ${isMyTurn && !loading ? 'cursor-pointer hover:scale-110 transition-transform' : 'opacity-50'}
                `}
              >
                🎴
              </div>
            </div>

            {/* Carta do topo */}
            <div className="text-center">
              <div className="text-white text-sm mb-2">
                {gameState.chosenColor && (
                  <span className="font-bold">Cor: {
                    gameState.chosenColor === 'red' ? '🔴 Vermelho' :
                    gameState.chosenColor === 'blue' ? '🔵 Azul' :
                    gameState.chosenColor === 'green' ? '🟢 Verde' :
                    '🟡 Amarelo'
                  }</span>
                )}
              </div>
              <UNOCard card={gameState.topCard} size="large" />
              {gameState.drawStack > 0 && (
                <div className="mt-2 text-yellow-400 font-bold text-xl animate-bounce">
                  +{gameState.drawStack} Cartas!
                </div>
              )}
            </div>

            {/* Direção */}
            <div className="text-white text-4xl animate-pulse">
              {gameState.direction === 1 ? '⟳' : '⟲'}
            </div>
          </div>
        </div>
      </div>

      {/* Mensagem */}
      {message && (
        <div className="max-w-7xl mx-auto mb-4">
          <div className={`
            px-6 py-3 rounded-xl text-center font-bold
            ${message.includes('⚠️') ? 'bg-red-500 text-white animate-pulse' : 
              message.includes('❌') ? 'bg-orange-500 text-white' : 
              'bg-yellow-500 text-gray-900'}
          `}>
            {message}
          </div>
        </div>
      )}

      {/* Botão Passar (após comprar carta) */}
      {canPlayDrawnCard && drawnCardIndex !== null && isMyTurn && (
        <div className="max-w-7xl mx-auto mb-4 flex justify-center gap-4">
          <button
            onClick={() => handlePlayCard(drawnCardIndex)}
            className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all transform hover:scale-105"
          >
            ✓ Jogar Carta Comprada
          </button>
          <button
            onClick={handlePassTurn}
            className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all transform hover:scale-105"
          >
            ➡️ Passar a Vez
          </button>
        </div>
      )}

      {/* Minha mão */}
      <div className="max-w-7xl mx-auto">
        <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-white font-bold text-lg">Suas Cartas ({myHand.length})</h3>
            
            {showUnoButton && (
              <button
                onClick={handleSayUno}
                className="bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 px-8 py-3 rounded-full font-bold text-xl shadow-2xl hover:scale-110 transition-transform z-50"
                style={{ animation: 'bounce 1s infinite' }}
              >
                🔔 GRITAR UNO! 🔔
              </button>
            )}
          </div>

          <div className="flex justify-center gap-2 flex-wrap">
            {myHand.map((card, index) => (
              <div key={index} onClick={() => isMyTurn && !loading ? handlePlayCard(index) : null}>
                <UNOCard
                  card={card}
                  selectable={isMyTurn && !loading}
                  size="normal"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Seletor de cor */}
      {showColorPicker && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl p-8 max-w-md">
            <h3 className="text-2xl font-bold text-center mb-6">Escolha uma cor</h3>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => selectColor('red')}
                className="bg-gradient-to-br from-red-500 to-red-700 text-white py-8 rounded-xl font-bold text-xl hover:scale-110 transition-transform"
              >
                🔴 Vermelho
              </button>
              <button
                onClick={() => selectColor('blue')}
                className="bg-gradient-to-br from-blue-500 to-blue-700 text-white py-8 rounded-xl font-bold text-xl hover:scale-110 transition-transform"
              >
                🔵 Azul
              </button>
              <button
                onClick={() => selectColor('green')}
                className="bg-gradient-to-br from-green-500 to-green-700 text-white py-8 rounded-xl font-bold text-xl hover:scale-110 transition-transform"
              >
                🟢 Verde
              </button>
              <button
                onClick={() => selectColor('yellow')}
                className="bg-gradient-to-br from-yellow-400 to-yellow-600 text-gray-900 py-8 rounded-xl font-bold text-xl hover:scale-110 transition-transform"
              >
                🟡 Amarelo
              </button>
            </div>
            <button
              onClick={() => {
                setShowColorPicker(false)
                setSelectedCardIndex(null)
              }}
              className="mt-4 w-full bg-gray-500 hover:bg-gray-600 text-white py-3 rounded-xl font-bold transition"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Tela de vitória */}
      {gameState.gameState === 'finished' && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-3xl p-12 max-w-lg text-center">
            <div className="text-6xl mb-4">🏆</div>
            <h2 className="text-4xl font-bold text-gray-900 mb-2">
              {gameState.winner?.id === playerId ? 'VOCÊ VENCEU!' : `${gameState.winner?.name} VENCEU!`}
            </h2>
            <p className="text-xl text-gray-800 mb-8">Parabéns!</p>
            <button
              onClick={handleRestart}
              className="bg-white text-gray-900 px-8 py-4 rounded-xl font-bold text-lg hover:scale-110 transition-transform"
            >
              ↻ Jogar Novamente
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default UNOGameTable

