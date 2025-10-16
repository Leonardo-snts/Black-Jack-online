function Card({ card, hidden = false }) {
  if (hidden) {
    return (
      <div className="w-20 h-28 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg border-2 border-blue-400 flex items-center justify-center shadow-lg">
        <div className="text-4xl text-blue-300">?</div>
      </div>
    )
  }

  const isRed = card.suit === '♥' || card.suit === '♦'
  const color = isRed ? 'text-red-600' : 'text-slate-900'

  return (
    <div className="w-20 h-28 bg-white rounded-lg border-2 border-slate-300 shadow-lg p-2 flex flex-col justify-between transform transition hover:scale-105">
      <div className={`${color} font-bold text-xl flex flex-col items-start`}>
        <span>{card.value}</span>
        <span className="text-2xl">{card.suit}</span>
      </div>
      <div className={`${color} font-bold text-xl flex flex-col items-end`}>
        <span className="text-2xl">{card.suit}</span>
        <span>{card.value}</span>
      </div>
    </div>
  )
}

export default Card

