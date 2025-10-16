import { useState, useEffect } from 'react'

function UNOCard({ card, onClick, selectable = false, size = 'normal' }) {
  const [shouldAnimate, setShouldAnimate] = useState(true)

  useEffect(() => {
    setShouldAnimate(true)
    const timer = setTimeout(() => setShouldAnimate(false), 600)
    return () => clearTimeout(timer)
  }, [card?.value, card?.suit])

  if (!card) return null

  const getCardColor = () => {
    switch (card.color) {
      case 'red': return 'bg-gradient-to-br from-red-500 to-red-700'
      case 'blue': return 'bg-gradient-to-br from-blue-500 to-blue-700'
      case 'green': return 'bg-gradient-to-br from-green-500 to-green-700'
      case 'yellow': return 'bg-gradient-to-br from-yellow-400 to-yellow-600'
      case 'wild': return 'bg-gradient-to-br from-purple-600 via-pink-500 to-orange-500'
      default: return 'bg-gray-700'
    }
  }

  const getTextColor = () => {
    return card.color === 'yellow' ? 'text-gray-900' : 'text-white'
  }

  const getCentralTextColor = () => {
    // Cor do texto central (em cima do fundo branco)
    switch (card.color) {
      case 'red': return 'text-red-600'
      case 'blue': return 'text-blue-600'
      case 'green': return 'text-green-600'
      case 'yellow': return 'text-yellow-600'
      case 'wild': return 'text-black'
      default: return 'text-gray-900'
    }
  }

  const getSizeClasses = () => {
    switch (size) {
      case 'small': return 'w-12 h-18'
      case 'normal': return 'w-20 h-28'
      case 'large': return 'w-24 h-36'
      default: return 'w-20 h-28'
    }
  }

  const getValueFontSize = () => {
    switch (size) {
      case 'small': return 'text-lg'
      case 'normal': return 'text-3xl'
      case 'large': return 'text-4xl'
      default: return 'text-3xl'
    }
  }

  const animationClass = shouldAnimate ? 'card-deal' : ''

  return (
    <div
      onClick={selectable ? onClick : undefined}
      className={`
        ${getSizeClasses()}
        ${getCardColor()}
        ${animationClass}
        rounded-xl
        ${selectable ? 'cursor-pointer hover:scale-110 hover:-translate-y-2 hover:shadow-2xl' : ''}
        transition-all duration-300
        shadow-lg
        relative
        overflow-hidden
        border-4 border-white/30
      `}
    >
      {/* Brilho superior */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/30 to-transparent pointer-events-none"></div>
      
      {/* Elipse branca central */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-14 h-20 bg-white rounded-full opacity-90"></div>
      
      {/* Valor da carta */}
      <div className={`
        absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2
        ${getValueFontSize()}
        font-black
        ${getCentralTextColor()}
        z-10
        drop-shadow-lg
      `}>
        {card.value}
      </div>

      {/* Cantos */}
      <div className={`absolute top-1 left-1 ${size === 'small' ? 'text-xs' : 'text-sm'} font-bold ${getTextColor()}`}>
        {card.value}
      </div>
      <div className={`absolute bottom-1 right-1 ${size === 'small' ? 'text-xs' : 'text-sm'} font-bold ${getTextColor()} transform rotate-180`}>
        {card.value}
      </div>

      {/* Logo UNO para coringas */}
      {card.color === 'wild' && (
        <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 text-xs font-bold text-white opacity-70">
          UNO
        </div>
      )}
    </div>
  )
}

export default UNOCard

