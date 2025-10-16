class UNODeck {
  constructor() {
    this.cards = []
    this.discardPile = []
  }

  // Cria um baralho completo de UNO
  create() {
    this.cards = []
    
    // Cores: red, blue, green, yellow
    const colors = ['red', 'blue', 'green', 'yellow']
    
    // Para cada cor
    colors.forEach(color => {
      // Um 0 de cada cor
      this.cards.push({ color, value: '0', type: 'number' })
      
      // Dois de cada número de 1-9
      for (let i = 1; i <= 9; i++) {
        this.cards.push({ color, value: i.toString(), type: 'number' })
        this.cards.push({ color, value: i.toString(), type: 'number' })
      }
      
      // Duas cartas especiais de cada tipo por cor
      // +2 (Draw Two)
      this.cards.push({ color, value: '+2', type: 'draw_two' })
      this.cards.push({ color, value: '+2', type: 'draw_two' })
      
      // Inverter (Reverse)
      this.cards.push({ color, value: '⇄', type: 'reverse' })
      this.cards.push({ color, value: '⇄', type: 'reverse' })
      
      // Pular (Skip)
      this.cards.push({ color, value: '⊘', type: 'skip' })
      this.cards.push({ color, value: '⊘', type: 'skip' })
    })
    
    // 4 Coringas (Wild)
    for (let i = 0; i < 4; i++) {
      this.cards.push({ color: 'wild', value: '◆', type: 'wild' })
    }
    
    // 4 Coringas +4 (Wild Draw Four)
    for (let i = 0; i < 4; i++) {
      this.cards.push({ color: 'wild', value: '+4', type: 'wild_draw_four' })
    }
    
    return this.cards
  }

  // Embaralha o baralho
  shuffle() {
    for (let i = this.cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]]
    }
  }

  // Compra uma carta
  draw() {
    // Se o baralho acabar, embaralha a pilha de descarte (exceto a carta do topo)
    if (this.cards.length === 0) {
      if (this.discardPile.length <= 1) {
        // Se não houver cartas para reciclar, cria um novo baralho
        this.create()
        this.shuffle()
      } else {
        const topCard = this.discardPile.pop()
        this.cards = [...this.discardPile]
        this.discardPile = [topCard]
        this.shuffle()
      }
    }
    
    return this.cards.pop()
  }

  // Descarta uma carta
  discard(card) {
    this.discardPile.push(card)
  }

  // Obtém a carta do topo da pilha de descarte
  getTopCard() {
    return this.discardPile[this.discardPile.length - 1]
  }

  // Retorna o número de cartas no baralho
  getRemainingCards() {
    return this.cards.length
  }

  // Inicia a pilha de descarte com uma carta válida
  startDiscardPile() {
    let card = this.draw()
    
    // Garante que a primeira carta não seja uma ação especial
    while (card.type !== 'number') {
      this.cards.unshift(card)
      this.shuffle()
      card = this.draw()
    }
    
    this.discard(card)
    return card
  }
}

module.exports = UNODeck

