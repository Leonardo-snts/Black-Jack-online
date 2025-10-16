class Deck {
  constructor() {
    this.cards = [];
    this.reset();
  }

  reset() {
    const suits = ['♠', '♥', '♦', '♣'];
    const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
    
    this.cards = [];
    
    for (let suit of suits) {
      for (let value of values) {
        this.cards.push({
          suit,
          value,
          numericValue: this.getNumericValue(value)
        });
      }
    }
    
    this.shuffle();
  }

  getNumericValue(value) {
    if (value === 'A') return 11;
    if (['J', 'Q', 'K'].includes(value)) return 10;
    return parseInt(value);
  }

  shuffle() {
    for (let i = this.cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
    }
  }

  draw() {
    if (this.cards.length === 0) {
      this.reset();
    }
    return this.cards.pop();
  }

  drawMultiple(count) {
    const drawn = [];
    for (let i = 0; i < count; i++) {
      drawn.push(this.draw());
    }
    return drawn;
  }
}

module.exports = Deck;

