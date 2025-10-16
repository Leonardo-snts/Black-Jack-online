class Player {
  constructor(id, name, balance = 1000) {
    this.id = id;
    this.name = name;
    this.balance = balance;
    this.hands = [];
    this.currentHandIndex = 0;
  }

  addHand(hand) {
    this.hands.push(hand);
  }

  getCurrentHand() {
    return this.hands[this.currentHandIndex];
  }

  nextHand() {
    this.currentHandIndex++;
    return this.currentHandIndex < this.hands.length;
  }

  resetHands() {
    this.hands = [];
    this.currentHandIndex = 0;
  }

  placeBet(amount) {
    if (amount > this.balance) {
      return false;
    }
    this.balance -= amount;
    return true;
  }

  winBet(amount) {
    this.balance += amount;
  }
}

module.exports = Player;

