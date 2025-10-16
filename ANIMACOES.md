# Guia de Animações - Black Jack

## Sistema de Animações Implementado

### 1. Animação de Distribuição de Cartas (dealCard)

#### Cartas Iniciais
Quando o jogo começa, as cartas são distribuídas com animação cinematográfica:

```css
@keyframes dealCard {
  0% {
    transform: translateX(-200px) translateY(-300px) scale(0.3) rotate(-15deg);
    opacity: 0;
  }
  60% {
    opacity: 1;
  }
  100% {
    transform: translateX(0) translateY(0) scale(1) rotate(0deg);
    opacity: 1;
  }
}
```

**Características:**
- Vem do canto superior esquerdo (posição do dealer)
- Começa pequena (escala 0.3) e cresce para tamanho normal
- Rotaciona durante o movimento (-15deg → 0deg)
- Fade in durante o trajeto
- Duração: 0.6s
- Delay entre cartas: 0.15s

#### Cartas Adicionadas (Hit)
Quando o jogador pede uma carta nova, ela também é animada:

**Sistema de Detecção:**
1. Componente usa `useRef` para guardar estado anterior das mãos
2. Compara número de cartas antes vs depois
3. Marca cartas novas com `isNew={true}`
4. Anima apenas as cartas novas

**Código:**
```javascript
useEffect(() => {
  if (previousHandsRef.current) {
    const newIndices = new Set()
    
    playerData.hands.forEach((hand, handIdx) => {
      const prevHand = previousHandsRef.current[handIdx]
      if (prevHand && hand.cards.length > prevHand.cards.length) {
        newIndices.add(`${handIdx}-${hand.cards.length - 1}`)
      }
    })
    
    if (newIndices.size > 0) {
      setNewCardIndices(newIndices)
      setTimeout(() => setNewCardIndices(new Set()), 700)
    }
  }
}, [playerData.hands])
```

### 2. Animações de Transição

#### Scale In (scaleIn)
Elementos aparecem crescendo suavemente:

```css
@keyframes scaleIn {
  0% {
    transform: scale(0.9);
    opacity: 0;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}
```

**Usado em:**
- Indicadores de "ESTOUROU!"
- Indicadores de "BLACKJACK!"
- Indicadores de "21!"
- Mensagens de status

#### Fade In (fadeIn)
Fade suave para elementos que aparecem:

```css
@keyframes fadeIn {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}
```

**Usado em:**
- Valor do dealer quando revelado
- Informações de pontuação
- Mensagens de jogo

#### Slide In (slideIn)
Elementos deslizam de baixo com fade:

```css
@keyframes slideIn {
  0% {
    transform: translateY(20px);
    opacity: 0;
  }
  100% {
    transform: translateY(0);
    opacity: 1;
  }
}
```

**Usado em:**
- Cards de mão dos jogadores
- Mensagens de feedback
- Elementos de interface

### 3. Transições Suaves (Smooth Transitions)

#### Classes de Transição:

**smooth-transition:**
```css
.smooth-transition {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
```

**smooth-opacity:**
```css
.smooth-opacity {
  transition: opacity 0.3s ease-in-out;
}
```

**smooth-transform:**
```css
.smooth-transform {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
```

**Aplicadas em:**
- Valores de pontuação (mudam suavemente)
- Estados de jogo (standing, busted)
- Elementos interativos

### 4. Efeitos de Hover

#### Cartas 3D:
```css
.card-3d:hover {
  transform: translateY(-8px) rotateX(5deg);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.5);
}
```

**Características:**
- Eleva a carta em 8px
- Rotaciona ligeiramente no eixo X (5deg)
- Aumenta a sombra para efeito de profundidade
- Transição suave de 0.3s

#### Chips de Aposta:
```css
.betting-chip:hover {
  transform: translateY(-4px) scale(1.1);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.4);
}
```

#### Botões:
```css
hover:scale-105 active:scale-95
```

### 5. Animações Contínuas

#### Chip Pulse:
```css
@keyframes chipPulse {
  0%, 100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(234, 179, 8, 0.7);
  }
  50% {
    transform: scale(1.05);
    box-shadow: 0 0 0 10px rgba(234, 179, 8, 0);
  }
}
```

**Usado em:**
- Chips de aposta ativos
- Indicadores pulsantes
- Duração: 2s infinito

#### Shimmer (Brilho):
```css
@keyframes shimmer {
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
}
```

**Usado em:**
- Botões especiais
- Elementos destacados
- Efeitos de brilho

### 6. Sincronização de Animações

#### Timing das Cartas:
```javascript
style={{ animationDelay: `${index * 0.15}s` }}
```

**Sequência:**
- Carta 1: 0s
- Carta 2: 0.15s
- Carta 3: 0.30s
- Carta 4: 0.45s
- E assim por diante...

#### Limpeza de Estados:
```javascript
setTimeout(() => setNewCardIndices(new Set()), 700)
```

Após 700ms (duração da animação + buffer), remove o flag `isNew`

### 7. Performance e Otimizações

#### Will-Change:
```css
.card-3d {
  transform-style: preserve-3d;
  will-change: transform;
}
```

#### GPU Acceleration:
Uso de `transform` e `opacity` ao invés de propriedades que causam layout:
- ✅ `transform: translateY(-8px)` (GPU)
- ❌ `margin-top: -8px` (CPU)

#### Debouncing:
```javascript
const timer = setTimeout(() => setShouldAnimate(false), 700)
return () => clearTimeout(timer)
```

### 8. Estados de Animação

#### Componente Card:
```javascript
const [shouldAnimate, setShouldAnimate] = useState(dealAnimation || isNew)

useEffect(() => {
  if (dealAnimation || isNew) {
    setShouldAnimate(true)
    const timer = setTimeout(() => setShouldAnimate(false), 700)
    return () => clearTimeout(timer)
  }
}, [dealAnimation, isNew, card])
```

**Lógica:**
1. Recebe prop `dealAnimation` (cartas iniciais) ou `isNew` (cartas pedidas)
2. Define `shouldAnimate` como true
3. Após 700ms, remove a animação
4. Previne re-animação desnecessária

### 9. Cubic Bezier (Curvas de Timing)

**ease-out:** Rápido no início, desacelera no fim
```css
cubic-bezier(0.4, 0, 0.2, 1)
```

**ease-in-out:** Acelera no início, desacelera no fim
```css
ease-in-out
```

### 10. Multiplayer vs Solo

#### Solo (GameTable):
- Detecta mudanças em `playerData.hands`
- Anima cartas do jogador único

#### Multiplayer (MultiplayerGame):
- Detecta mudanças em `roomState.gameState.players`
- Anima cartas de todos os jogadores
- Keys únicas: `${player.id}-${handIdx}-${cardIdx}`

## Cronograma de Animações

### Início do Jogo (Deal):
```
0.00s: Primeira carta jogador
0.15s: Carta do dealer
0.30s: Segunda carta jogador
0.45s: Segunda carta dealer (virada)
0.60s: Todas as animações completas
```

### Pedir Carta (Hit):
```
0.00s: Nova carta aparece
0.60s: Animação completa
0.70s: Flag isNew removido
```

### Mudança de Estado:
```
0.00s: Estado muda (bust, stand, etc)
0.30s: Indicador aparece (scale-in)
```

## Melhorias Futuras

### Planejadas:
- [ ] Animação de embaralhar deck
- [ ] Efeito de flip na carta do dealer
- [ ] Partículas ao ganhar
- [ ] Shake ao estourar
- [ ] Glow effect no blackjack
- [ ] Trail effect nas cartas
- [ ] Bounce nas fichas
- [ ] Confetti na vitória

### Sons (Próxima Versão):
- [ ] Som de carta sendo distribuída
- [ ] Som de fichas ao apostar
- [ ] Som de vitória/derrota
- [ ] Som ambiente de cassino

