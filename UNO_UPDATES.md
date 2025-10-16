# 🎴 Atualizações do UNO

## Versão 1.1 - Novas Funcionalidades

### 🎯 1. Escolher Jogar ou Passar Após Comprar

**Problema anterior:**
- Ao comprar uma carta, se pudesse jogar, era obrigado a jogar
- Se não pudesse jogar, passava automaticamente

**Solução implementada:**
- Agora o jogador **escolhe** se quer jogar a carta comprada ou passar a vez
- Dois botões aparecem após comprar:
  - **✓ Jogar Carta Comprada** (verde) - Joga a carta que acabou de comprar
  - **➡️ Passar a Vez** (cinza) - Mantém a carta e passa para o próximo

**Casos especiais:**
- Se a carta comprada **não pode** ser jogada: passa automaticamente após 1.5s
- Evita estratégia de segurar cartas boas para jogadas futuras

---

### 🛡️ 2. Auto-Compra em Combo +2/+4

**Problema anterior:**
- Jogador recebia +2 ou +4 e tinha que clicar em "Comprar" manualmente
- Mesmo sem ter carta de defesa (+2 ou +4)

**Solução implementada:**
- Sistema **verifica automaticamente** se o jogador tem defesa
- **Se NÃO tiver** +2 nem +4:
  - Compra as cartas **AUTOMATICAMENTE**
  - Mostra mensagem: "Você comprou X cartas! ⚡"
  - Passa para o próximo jogador
- **Se TIVER** +2 ou +4:
  - Permite jogar a carta de defesa
  - Continua o combo (acumulando penalidade)

**Lógica de defesa:**
- Contra +2: pode defender com +2 ou +4
- Contra +4: pode defender com +4
- Sem defesa: compra automática

---

## 📋 Detalhes Técnicos

### Backend

**`Game.js`:**
```javascript
// Novo método
passTurn(playerIndex) // Passa a vez manualmente

// Novo método
hasDrawStackDefense(playerIndex) // Verifica se tem +2 ou +4

// Modificado
drawCard(playerIndex) // Retorna drawnCardIndex ao invés de passar automaticamente

// Modificado  
getPlayerView(playerId) // Inclui drawStackDefense quando há combo ativo
```

**`Room.js`:**
```javascript
passTurn(playerId) // Wrapper para Game.passTurn()
```

**`server.js`:**
```javascript
POST /api/uno/room/:roomCode/pass // Nova rota para passar a vez
```

### Frontend

**`UNOGameTable.jsx`:**

**Novos estados:**
```javascript
const [drawnCardIndex, setDrawnCardIndex] = useState(null)
const [canPlayDrawnCard, setCanPlayDrawnCard] = useState(false)
```

**Novas funções:**
```javascript
handlePassTurn() // Chama API para passar a vez
```

**Modificado:**
```javascript
handleDrawCard() // Salva índice da carta e mostra botões
handlePlayCard() // Limpa estados de carta comprada
```

**Novo useEffect:**
```javascript
// Auto-compra se não tiver defesa contra +2/+4
useEffect(() => {
  if (isMyTurn && drawStack > 0 && !hasDefense) {
    handleDrawCard() // Compra automaticamente
  }
}, [isMyTurn, drawStack])
```

**Nova UI:**
```jsx
{canPlayDrawnCard && (
  <div>
    <button onClick={() => handlePlayCard(drawnCardIndex)}>
      ✓ Jogar Carta Comprada
    </button>
    <button onClick={handlePassTurn}>
      ➡️ Passar a Vez
    </button>
  </div>
)}
```

---

## 🎮 Como Usar

### Passar Após Comprar:

1. Na sua vez, clique em **"Comprar"** (ícone 🎴)
2. Se a carta puder ser jogada:
   - Aparecerão dois botões
   - **Jogar Carta Comprada**: joga a carta
   - **Passar a Vez**: guarda a carta e passa
3. Escolha sua estratégia!

### Combo +2/+4:

1. Adversário joga **+2** ou **+4**
2. Sistema verifica sua mão automaticamente
3. **Se você tem +2 ou +4:**
   - Pode jogar para continuar o combo
   - Próximo jogador acumula mais penalidade
4. **Se você NÃO tem:**
   - Compra automaticamente as cartas
   - Não precisa clicar
   - Passa para o próximo

---

## 🐛 Correções Incluídas

- ✅ Botão UNO agora aparece corretamente quando ficar com 1 carta
- ✅ Penalidade UNO aplicada apenas quando o próximo jogar
- ✅ Cartas visíveis com cores corretas (texto não fica branco)
- ✅ Sistema de combo +2/+4 mais fluido
- ✅ Feedback visual claro em todas as ações

---

## 🚀 Próximas Melhorias Sugeridas

- [ ] Som ao jogar cartas especiais
- [ ] Animação de combo +2/+4
- [ ] Histórico de últimas jogadas
- [ ] Chat entre jogadores
- [ ] Estatísticas de partida

---

**Desenvolvido com ❤️ para diversão máxima!**

