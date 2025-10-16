const Deck = require('./Deck');
const Hand = require('./Hand');
const Player = require('./Player');

class Game {
  constructor(gameId) {
    this.gameId = gameId;
    this.deck = new Deck();
    this.players = [];
    this.dealer = { hands: [new Hand()] };
    this.currentPlayerIndex = 0;
    this.gameState = 'waiting';
    this.sideBetPayouts = {
      perfectPairs: {
        perfect: 25,
        colored: 12,
        mixed: 6
      },
      twentyOnePlusThree: {
        'suited-trips': 100,
        'straight-flush': 40,
        'three-of-kind': 30,
        'straight': 10,
        'flush': 5
      }
    };
  }

  addPlayer(playerId, playerName, balance = 1000) {
    const player = new Player(playerId, playerName, balance);
    this.players.push(player);
    return player;
  }

  getPlayer(playerId) {
    return this.players.find(p => p.id === playerId);
  }

  placeBet(playerId, amount, sideBets = {}) {
    const player = this.getPlayer(playerId);
    if (!player) return { success: false, message: 'Jogador não encontrado' };

    const totalBet = amount + (sideBets.perfectPairs || 0) + (sideBets.twentyOnePlusThree || 0);
    
    if (totalBet > player.balance) {
      return { success: false, message: 'Saldo insuficiente' };
    }

    const hand = new Hand();
    hand.bet = amount;
    hand.sideBets = {
      perfectPairs: sideBets.perfectPairs || 0,
      twentyOnePlusThree: sideBets.twentyOnePlusThree || 0
    };

    player.placeBet(totalBet);
    player.addHand(hand);

    return { success: true };
  }

  dealInitialCards() {
    this.gameState = 'playing';
    
    for (let player of this.players) {
      if (player.hands.length > 0) {
        player.hands[0].addCard(this.deck.draw());
      }
    }
    
    this.dealer.hands[0].addCard(this.deck.draw());
    
    for (let player of this.players) {
      if (player.hands.length > 0) {
        player.hands[0].addCard(this.deck.draw());
      }
    }
    
    this.dealer.hands[0].addCard(this.deck.draw());

    this.checkSideBets();
    
    for (let player of this.players) {
      if (player.hands.length > 0) {
        const hand = player.hands[0];
        if (hand.isBlackjack || hand.getValue() === 21) {
          hand.isStanding = true;
        }
      }
    }
    
    if (this.allPlayersFinished()) {
      this.playDealer();
    }
  }

  allPlayersFinished() {
    return this.players.every(player => 
      player.hands.every(hand => hand.isStanding || hand.isBusted)
    );
  }

  checkSideBets() {
    for (let player of this.players) {
      const hand = player.hands[0];
      if (!hand) continue;

      hand.sideBetResults = {
        perfectPairs: null,
        twentyOnePlusThree: null
      };

      if (hand.sideBets.perfectPairs > 0) {
        const pairType = hand.checkPerfectPairs();
        if (pairType) {
          const payout = this.sideBetPayouts.perfectPairs[pairType];
          const winAmount = hand.sideBets.perfectPairs * (payout + 1);
          player.winBet(winAmount);
          hand.sideBetResults.perfectPairs = {
            type: pairType,
            payout: payout,
            bet: hand.sideBets.perfectPairs,
            won: winAmount
          };
        }
      }

      if (hand.sideBets.twentyOnePlusThree > 0) {
        const result = hand.check21PlusThree(this.dealer.hands[0].cards[0]);
        if (result) {
          const payout = this.sideBetPayouts.twentyOnePlusThree[result];
          const winAmount = hand.sideBets.twentyOnePlusThree * (payout + 1);
          player.winBet(winAmount);
          hand.sideBetResults.twentyOnePlusThree = {
            type: result,
            payout: payout,
            bet: hand.sideBets.twentyOnePlusThree,
            won: winAmount
          };
        }
      }
    }
  }

  hit(playerId) {
    const player = this.getPlayer(playerId);
    if (!player) return { success: false, message: 'Jogador não encontrado' };

    const hand = player.getCurrentHand();
    if (!hand || hand.isStanding || hand.isBusted) {
      return { success: false, message: 'Não pode pedir carta' };
    }

    const card = this.deck.draw();
    hand.addCard(card);

    if (hand.getValue() === 21 || hand.isBlackjack || hand.isBusted) {
      hand.isStanding = true;
      
      if (!player.nextHand()) {
        this.currentPlayerIndex++;
        if (this.currentPlayerIndex >= this.players.length || this.allPlayersFinished()) {
          this.playDealer();
        }
      }
    }

    return { 
      success: true, 
      card,
      value: hand.getValue(),
      isBusted: hand.isBusted,
      autoStand: hand.getValue() === 21 || hand.isBlackjack || hand.isBusted
    };
  }

  stand(playerId) {
    const player = this.getPlayer(playerId);
    if (!player) return { success: false, message: 'Jogador não encontrado' };

    const hand = player.getCurrentHand();
    if (!hand) return { success: false, message: 'Não há mão ativa' };

    hand.isStanding = true;

    if (!player.nextHand()) {
      this.currentPlayerIndex++;
      if (this.currentPlayerIndex >= this.players.length || this.allPlayersFinished()) {
        this.playDealer();
      }
    }

    return { success: true };
  }

  doubleDown(playerId) {
    const player = this.getPlayer(playerId);
    if (!player) return { success: false, message: 'Jogador não encontrado' };

    const hand = player.getCurrentHand();
    if (!hand || !hand.canDoubleDown()) {
      return { success: false, message: 'Não pode dobrar' };
    }

    if (player.balance < hand.bet) {
      return { success: false, message: 'Saldo insuficiente' };
    }

    player.placeBet(hand.bet);
    hand.bet *= 2;
    hand.isDoubledDown = true;

    const card = this.deck.draw();
    hand.addCard(card);
    hand.isStanding = true;

    if (!player.nextHand()) {
      this.currentPlayerIndex++;
      if (this.currentPlayerIndex >= this.players.length || this.allPlayersFinished()) {
        this.playDealer();
      }
    }

    return { 
      success: true, 
      card,
      value: hand.getValue(),
      isBusted: hand.isBusted
    };
  }

  split(playerId) {
    const player = this.getPlayer(playerId);
    if (!player) return { success: false, message: 'Jogador não encontrado' };

    const hand = player.getCurrentHand();
    if (!hand || !hand.canSplit()) {
      return { success: false, message: 'Não pode dividir' };
    }

    if (player.balance < hand.bet) {
      return { success: false, message: 'Saldo insuficiente' };
    }

    player.placeBet(hand.bet);

    const newHand = new Hand();
    newHand.bet = hand.bet;
    newHand.addCard(hand.cards.pop());
    newHand.addCard(this.deck.draw());
    
    hand.addCard(this.deck.draw());

    player.hands.splice(player.currentHandIndex + 1, 0, newHand);

    return { 
      success: true,
      hands: player.hands
    };
  }

  playDealer() {
    const dealerHand = this.dealer.hands[0];
    
    while (dealerHand.getValue() < 17) {
      dealerHand.addCard(this.deck.draw());
    }

    this.gameState = 'finished';
    this.calculateWinnings();
  }

  calculateWinnings() {
    const dealerValue = this.dealer.hands[0].getValue();
    const dealerBusted = this.dealer.hands[0].isBusted;

    for (let player of this.players) {
      for (let hand of player.hands) {
        if (hand.isBusted) {
          continue;
        }

        const playerValue = hand.getValue();

        if (dealerBusted || playerValue > dealerValue) {
          if (hand.isBlackjack && !this.dealer.hands[0].isBlackjack) {
            player.winBet(hand.bet + (hand.bet * 2.5));
          } else {
            player.winBet(hand.bet * 2);
          }
        } else if (playerValue === dealerValue) {
          player.winBet(hand.bet);
        }
      }
    }
  }

  reset() {
    this.dealer = { hands: [new Hand()] };
    this.currentPlayerIndex = 0;
    this.gameState = 'waiting';
    
    for (let player of this.players) {
      player.resetHands();
    }
  }

  getGameState() {
    return {
      gameId: this.gameId,
      gameState: this.gameState,
      players: this.players.map(p => ({
        id: p.id,
        name: p.name,
        balance: p.balance,
        hands: p.hands.map(h => ({
          cards: h.cards,
          value: h.getValue(),
          bet: h.bet,
          sideBets: h.sideBets,
          sideBetResults: h.sideBetResults || null,
          isStanding: h.isStanding,
          isBusted: h.isBusted,
          isBlackjack: h.isBlackjack,
          canSplit: h.canSplit(),
          canDoubleDown: h.canDoubleDown()
        })),
        currentHandIndex: p.currentHandIndex
      })),
      dealer: {
        hands: this.dealer.hands.map(h => ({
          cards: this.gameState === 'playing' ? [h.cards[0]] : h.cards,
          value: this.gameState === 'playing' ? null : h.getValue(),
          isBusted: h.isBusted,
          isBlackjack: h.isBlackjack
        }))
      },
      currentPlayerIndex: this.currentPlayerIndex
    };
  }
}

module.exports = Game;

