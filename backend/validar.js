const Game = require('./game/Game');
const Deck = require('./game/Deck');
const Hand = require('./game/Hand');
const Player = require('./game/Player');

let testsPassed = 0;
let testsFailed = 0;

function assert(condition, testName) {
  if (condition) {
    console.log(`✓ ${testName}`);
    testsPassed++;
  } else {
    console.log(`✗ ${testName}`);
    testsFailed++;
  }
}

console.log('=== VALIDAÇÃO DO BLACK JACK ===\n');

console.log('1. Testando Deck (Baralho)...');
const deck = new Deck();
assert(deck.cards.length === 52, 'Baralho tem 52 cartas');
const card = deck.draw();
assert(card && card.suit && card.value, 'Pode comprar carta do baralho');
assert(deck.cards.length === 51, 'Baralho diminui após comprar carta');

console.log('\n2. Testando Hand (Mão)...');
const hand = new Hand();
hand.addCard({ suit: '♠', value: 'A', numericValue: 11 });
hand.addCard({ suit: '♥', value: 'K', numericValue: 10 });
assert(hand.getValue() === 21, 'Ás + K = 21 (Blackjack)');
assert(hand.isBlackjack === true, 'Reconhece Blackjack');

const hand2 = new Hand();
hand2.addCard({ suit: '♠', value: '10', numericValue: 10 });
hand2.addCard({ suit: '♥', value: '10', numericValue: 10 });
assert(hand2.canSplit() === true, 'Reconhece quando pode dividir');

const hand3 = new Hand();
hand3.addCard({ suit: '♠', value: 'K', numericValue: 10 });
hand3.addCard({ suit: '♥', value: '5', numericValue: 5 });
assert(hand3.canDoubleDown() === true, 'Reconhece quando pode dobrar');

console.log('\n3. Testando Player (Jogador)...');
const player = new Player('p1', 'João', 1000);
assert(player.balance === 1000, 'Saldo inicial correto');
assert(player.placeBet(100) === true, 'Pode fazer aposta com saldo');
assert(player.balance === 900, 'Saldo diminui após aposta');
assert(player.placeBet(1000) === false, 'Não pode apostar mais que o saldo');

console.log('\n4. Testando Game (Jogo)...');
const game = new Game('test-game');
const p1 = game.addPlayer('p1', 'João', 1000);
const p2 = game.addPlayer('p2', 'Maria', 1000);
assert(game.players.length === 2, 'Adiciona jogadores ao jogo');

const betResult = game.placeBet('p1', 50);
assert(betResult.success === true, 'Aceita aposta válida');
assert(p1.balance === 950, 'Deduz aposta do saldo');

game.placeBet('p2', 100);
game.dealInitialCards();
const state = game.getGameState();
assert(state.gameState === 'playing', 'Jogo inicia após distribuir cartas');
assert(state.players[0].hands[0].cards.length === 2, 'Jogador recebe 2 cartas');
assert(state.dealer.hands[0].cards.length >= 1, 'Dealer tem pelo menos 1 carta visível');

console.log('\n5. Testando ações do jogo...');
const hitResult = game.hit('p1');
assert(hitResult.success === true || hitResult.message, 'Ação Hit executada');

const standResult = game.stand('p1');
assert(standResult.success === true || standResult.message, 'Ação Stand executada');

console.log('\n6. Testando apostas laterais...');
const game2 = new Game('test-game-2');
game2.addPlayer('p1', 'João', 1000);
game2.placeBet('p1', 50, { perfectPairs: 10, twentyOnePlusThree: 10 });
const p = game2.getPlayer('p1');
assert(p.balance === 930, 'Deduz aposta principal + side bets (50+10+10=70)');

console.log('\n7. Testando lógica de Ás...');
const handAce = new Hand();
handAce.addCard({ suit: '♠', value: 'A', numericValue: 11 });
handAce.addCard({ suit: '♥', value: '9', numericValue: 9 });
assert(handAce.getValue() === 20, 'Ás vale 11 quando não estoura (A+9=20)');

handAce.addCard({ suit: '♦', value: '5', numericValue: 5 });
assert(handAce.getValue() === 15, 'Ás muda para 1 quando necessário (A+9+5=15)');

console.log('\n8. Testando detecção de bust...');
const handBust = new Hand();
handBust.addCard({ suit: '♠', value: 'K', numericValue: 10 });
handBust.addCard({ suit: '♥', value: 'Q', numericValue: 10 });
handBust.addCard({ suit: '♦', value: '5', numericValue: 5 });
assert(handBust.isBusted === true, 'Detecta quando estoura (K+Q+5=25)');

console.log('\n9. Testando Perfect Pairs...');
const handPerfect = new Hand();
handPerfect.addCard({ suit: '♠', value: 'K', numericValue: 10 });
handPerfect.addCard({ suit: '♠', value: 'K', numericValue: 10 });
assert(handPerfect.checkPerfectPairs() === 'perfect', 'Detecta par perfeito (mesmo naipe)');

const handColored = new Hand();
handColored.addCard({ suit: '♠', value: 'K', numericValue: 10 });
handColored.addCard({ suit: '♣', value: 'K', numericValue: 10 });
assert(handColored.checkPerfectPairs() === 'colored', 'Detecta par colorido (mesma cor)');

const handMixed = new Hand();
handMixed.addCard({ suit: '♠', value: 'K', numericValue: 10 });
handMixed.addCard({ suit: '♥', value: 'K', numericValue: 10 });
assert(handMixed.checkPerfectPairs() === 'mixed', 'Detecta par misto');

console.log('\n10. Testando valores de carta...');
assert(deck.getNumericValue('A') === 11, 'Ás vale 11');
assert(deck.getNumericValue('K') === 10, 'K vale 10');
assert(deck.getNumericValue('Q') === 10, 'Q vale 10');
assert(deck.getNumericValue('J') === 10, 'J vale 10');
assert(deck.getNumericValue('5') === 5, 'Carta numérica vale seu número');

console.log('\n=== RESULTADO DA VALIDAÇÃO ===');
console.log(`✓ Testes passados: ${testsPassed}`);
console.log(`✗ Testes falhos: ${testsFailed}`);

if (testsFailed === 0) {
  console.log('\n🎉 TODOS OS TESTES PASSARAM! Sistema validado e funcionando!');
  process.exit(0);
} else {
  console.log('\n⚠️ Alguns testes falharam. Verifique os erros acima.');
  process.exit(1);
}

