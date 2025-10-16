class UNOPlayer {
  constructor(id, name) {
    this.id = id
    this.name = name
    this.hand = []
    this.saidUno = false
    this.isReady = false
  }

  // Adiciona uma carta à mão
  addCard(card) {
    this.hand.push(card)
    // Se tiver mais de 1 carta, reseta o flag de UNO
    if (this.hand.length > 1) {
      this.saidUno = false
    }
  }

  // Adiciona múltiplas cartas à mão
  addCards(cards) {
    cards.forEach(card => this.addCard(card))
  }

  // Remove e retorna uma carta da mão pelo índice
  playCard(cardIndex) {
    if (cardIndex < 0 || cardIndex >= this.hand.length) {
      throw new Error('Índice de carta inválido')
    }
    
    const card = this.hand[cardIndex]
    this.hand.splice(cardIndex, 1)
    
    return card
  }

  // Verifica se pode jogar uma carta específica
  canPlayCard(card, topCard, chosenColor = null) {
    // Se for coringa, sempre pode jogar
    if (card.type === 'wild' || card.type === 'wild_draw_four') {
      return true
    }
    
    // Se a carta do topo for coringa, usa a cor escolhida
    const topColor = (topCard.type === 'wild' || topCard.type === 'wild_draw_four') 
      ? chosenColor 
      : topCard.color
    
    // Pode jogar se for mesma cor ou mesmo valor
    return card.color === topColor || card.value === topCard.value
  }

  // Verifica se tem alguma carta jogável
  hasPlayableCard(topCard, chosenColor = null) {
    return this.hand.some(card => this.canPlayCard(card, topCard, chosenColor))
  }

  // Obtém todas as cartas jogáveis
  getPlayableCards(topCard, chosenColor = null) {
    return this.hand
      .map((card, index) => ({ card, index }))
      .filter(({ card }) => this.canPlayCard(card, topCard, chosenColor))
  }

  // Grita "UNO!"
  sayUno() {
    if (this.hand.length === 1) {
      this.saidUno = true
      return true
    }
    return false
  }

  // Verifica se esqueceu de gritar UNO
  forgotUno() {
    return this.hand.length === 1 && !this.saidUno
  }

  // Verifica se ganhou (sem cartas)
  hasWon() {
    return this.hand.length === 0
  }

  // Obtém o número de cartas na mão
  getCardCount() {
    return this.hand.length
  }

  // Reseta o estado do jogador
  reset() {
    this.hand = []
    this.saidUno = false
  }

  // Serializa o jogador para enviar ao cliente
  toJSON(hideCards = false) {
    return {
      id: this.id,
      name: this.name,
      cardCount: this.hand.length,
      hand: hideCards ? [] : this.hand,
      saidUno: this.saidUno || false,
      isReady: this.isReady || false
    }
  }
}

module.exports = UNOPlayer

