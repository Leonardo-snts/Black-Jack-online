import { useState, useEffect } from 'react'

function Card({ card, hidden = false, index = 0 }) {
  const [isAnimating, setIsAnimating] = useState(true)
  const [hasAnimated, setHasAnimated] = useState(false)

  useEffect(() => {
    // Sempre anima quando carta muda
    setIsAnimating(true)
    setHasAnimated(false)
    
    // Marca como animado após completar
    const timer = setTimeout(() => {
      setIsAnimating(false)
      setHasAnimated(true)
    }, 700 + (index * 150)) // duração + delay
    
    return () => clearTimeout(timer)
  }, [card?.value, card?.suit, index])

  if (hidden) {
    return (
      <div 
        className={`w-20 h-28 card-3d ${isAnimating ? 'card-deal' : ''} ${hasAnimated ? 'animated' : ''}`}
        style={{ 
          animationDelay: `${index * 0.15}s`,
          opacity: !isAnimating && !hasAnimated ? 0 : undefined
        }}
      >
        <div className="w-full h-full bg-gradient-to-br from-blue-700 via-blue-800 to-blue-900 rounded-lg border-4 border-blue-500 flex items-center justify-center shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-transparent"></div>
          <div className="absolute inset-2 border-2 border-blue-400/30 rounded-md"></div>
          <div className="text-5xl text-blue-300/50 font-bold">♠</div>
        </div>
      </div>
    )
  }

  const isRed = card.suit === '♥' || card.suit === '♦'
  const color = isRed ? 'text-red-600' : 'text-slate-900'
  const suitColor = isRed ? 'text-red-600' : 'text-slate-900'

  return (
    <div 
      className={`w-20 h-28 card-3d ${isAnimating ? 'card-deal' : ''} ${hasAnimated ? 'animated' : ''}`}
      style={{ 
        animationDelay: `${index * 0.15}s`,
        opacity: !isAnimating && !hasAnimated ? 0 : undefined
      }}
    >
      <div className="w-full h-full bg-white rounded-lg border-2 border-slate-300 shadow-2xl p-2 flex flex-col justify-between relative overflow-hidden hover:shadow-3xl transition-all duration-300">
        {/* Brilho sutil */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent pointer-events-none"></div>
        
        {/* Valor superior esquerdo */}
        <div className={`${color} font-bold text-lg flex flex-col items-start leading-none relative z-10`}>
          <span className="text-xl">{card.value}</span>
          <span className={`text-3xl ${suitColor}`}>{card.suit}</span>
        </div>
        
        {/* Símbolo central para cartas de figura */}
        {['J', 'Q', 'K', 'A'].includes(card.value) && (
          <div className={`absolute inset-0 flex items-center justify-center ${suitColor} opacity-10`}>
            <span className="text-6xl font-bold">{card.suit}</span>
          </div>
        )}
        
        {/* Valor inferior direito */}
        <div className={`${color} font-bold text-lg flex flex-col items-end leading-none relative z-10`}>
          <span className={`text-3xl ${suitColor}`}>{card.suit}</span>
          <span className="text-xl">{card.value}</span>
        </div>
      </div>
    </div>
  )
}

export default Card

