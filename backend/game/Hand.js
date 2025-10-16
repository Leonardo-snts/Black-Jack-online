class Hand {
  constructor() {
    this.cards = [];
    this.bet = 0;
    this.sideBets = {
      perfectPairs: 0,
      twentyOnePlusThree: 0
    };
    this.isStanding = false;
    this.isDoubledDown = false;
    this.isBusted = false;
    this.isBlackjack = false;
  }

  addCard(card) {
    this.cards.push(card);
    this.checkBusted();
    this.checkBlackjack();
  }

  getValue() {
    let value = 0;
    let aces = 0;

    for (let card of this.cards) {
      value += card.numericValue;
      if (card.value === 'A') {
        aces++;
      }
    }

    while (value > 21 && aces > 0) {
      value -= 10;
      aces--;
    }

    return value;
  }

  checkBusted() {
    if (this.getValue() > 21) {
      this.isBusted = true;
    }
  }

  checkBlackjack() {
    if (this.cards.length === 2 && this.getValue() === 21) {
      this.isBlackjack = true;
    }
  }

  canSplit() {
    return this.cards.length === 2 && 
           this.cards[0].numericValue === this.cards[1].numericValue;
  }

  canDoubleDown() {
    return this.cards.length === 2 && !this.isDoubledDown;
  }

  checkPerfectPairs() {
    if (this.cards.length < 2) return null;
    
    const card1 = this.cards[0];
    const card2 = this.cards[1];

    if (card1.value === card2.value && card1.suit === card2.suit) {
      return 'perfect';
    }
    
    if (card1.value === card2.value && 
        ((card1.suit === '♥' || card1.suit === '♦') && (card2.suit === '♥' || card2.suit === '♦') ||
         (card1.suit === '♠' || card1.suit === '♣') && (card2.suit === '♠' || card2.suit === '♣'))) {
      return 'colored';
    }
    
    if (card1.value === card2.value) {
      return 'mixed';
    }

    return null;
  }

  check21PlusThree(dealerCard) {
    if (this.cards.length < 2 || !dealerCard) return null;

    const card1 = this.cards[0];
    const card2 = this.cards[1];
    const card3 = dealerCard;

    const suits = [card1.suit, card2.suit, card3.suit];
    const values = [card1.value, card2.value, card3.value].sort();

    const isFlush = suits.every(suit => suit === suits[0]);
    const isSequence = this.checkSequence(values);
    const threeOfKind = values.every(val => val === values[0]);

    if (isSequence && isFlush && values[0] === values[1] && values[1] === values[2]) {
      return 'suited-trips';
    }
    if (isSequence && isFlush) {
      return 'straight-flush';
    }
    if (threeOfKind) {
      return 'three-of-kind';
    }
    if (isSequence) {
      return 'straight';
    }
    if (isFlush) {
      return 'flush';
    }

    return null;
  }

  checkSequence(values) {
    const order = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
    const indices = values.map(v => order.indexOf(v));
    
    for (let i = 0; i < order.length - 2; i++) {
      if (order[i] === values[0] && 
          order[i + 1] === values[1] && 
          order[i + 2] === values[2]) {
        return true;
      }
    }
    
    return false;
  }
}

module.exports = Hand;

