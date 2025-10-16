import React from 'react'

function GameSelector({ onSelectGame }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-white mb-4">
          🎮 Escolha seu Jogo
        </h1>
        <p className="text-xl text-gray-300 mb-12">
          Selecione qual jogo você deseja jogar
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Black Jack */}
          <button
            onClick={() => onSelectGame('blackjack')}
            className="group relative bg-gradient-to-br from-green-800 to-green-900 p-8 rounded-3xl shadow-2xl hover:shadow-green-500/50 transition-all duration-300 hover:scale-105 border-4 border-yellow-600"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/20 to-transparent rounded-3xl"></div>
            
            <div className="relative z-10">
              <div className="text-7xl mb-4">🃏</div>
              <h2 className="text-4xl font-bold text-white mb-3">Black Jack</h2>
              <p className="text-gray-300 mb-4">
                Jogo clássico de cartas contra o dealer
              </p>
              
              <div className="flex gap-2 justify-center flex-wrap text-sm">
                <span className="bg-yellow-600/30 text-yellow-200 px-3 py-1 rounded-full">21</span>
                <span className="bg-yellow-600/30 text-yellow-200 px-3 py-1 rounded-full">Cassino</span>
                <span className="bg-yellow-600/30 text-yellow-200 px-3 py-1 rounded-full">Estratégia</span>
              </div>

              <div className="mt-6 text-white font-semibold group-hover:text-yellow-400 transition-colors">
                Jogar Black Jack →
              </div>
            </div>
          </button>

          {/* UNO */}
          <button
            onClick={() => onSelectGame('uno')}
            className="group relative bg-gradient-to-br from-red-600 via-yellow-500 to-blue-600 p-8 rounded-3xl shadow-2xl hover:shadow-rainbow transition-all duration-300 hover:scale-105 border-4 border-white"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-3xl"></div>
            
            <div className="relative z-10">
              <div className="text-7xl mb-4">🎴</div>
              <h2 className="text-4xl font-bold text-white mb-3">UNO</h2>
              <p className="text-white mb-4">
                Jogo de cartas colorido e divertido
              </p>
              
              <div className="flex gap-2 justify-center flex-wrap text-sm">
                <span className="bg-white/30 text-white px-3 py-1 rounded-full">Colorido</span>
                <span className="bg-white/30 text-white px-3 py-1 rounded-full">Rápido</span>
                <span className="bg-white/30 text-white px-3 py-1 rounded-full">Multiplayer</span>
              </div>

              <div className="mt-6 text-white font-semibold group-hover:text-yellow-200 transition-colors">
                Jogar UNO →
              </div>
            </div>
          </button>
        </div>

        <div className="mt-12 text-gray-400 text-sm">
          Ambos os jogos suportam modo solo e multiplayer online
        </div>
      </div>
    </div>
  )
}

export default GameSelector

