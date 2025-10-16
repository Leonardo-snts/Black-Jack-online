function ModeSelector({ onSelectMode }) {
  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="bg-slate-800 rounded-2xl shadow-2xl p-8 w-full max-w-4xl border border-slate-700">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600 mb-4">
            BLACK JACK
          </h1>
          <p className="text-slate-400 text-lg">Escolha o modo de jogo</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <button
            onClick={() => onSelectMode('solo')}
            className="bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-xl p-8 text-white transition transform hover:scale-105 active:scale-95 group"
          >
            <div className="text-6xl mb-4">🎰</div>
            <h3 className="text-2xl font-bold mb-2">Jogar Solo</h3>
            <p className="text-blue-200">
              Jogue sozinho contra o dealer
            </p>
          </button>

          <button
            onClick={() => onSelectMode('online')}
            className="bg-gradient-to-br from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 rounded-xl p-8 text-white transition transform hover:scale-105 active:scale-95 group"
          >
            <div className="text-6xl mb-4">👥</div>
            <h3 className="text-2xl font-bold mb-2">Jogar Online</h3>
            <p className="text-green-200">
              Jogue com até 6 amigos online
            </p>
          </button>
        </div>
      </div>
    </div>
  )
}

export default ModeSelector

