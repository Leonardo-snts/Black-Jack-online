# Guia de Testes - Black Jack

## Pré-requisitos para Testes

1. Node.js instalado (versão 14+)
2. npm ou yarn
3. Navegador moderno (Chrome, Firefox, Safari, Edge)

## Executando os Testes

### 1. Teste do Backend

#### Teste Automatizado
```bash
cd backend
npm install
node test.js
```

Este script testa:
- Criação de jogadores
- Sistema de apostas e moedas
- Distribuição de cartas
- Todas as ações (Hit, Stand, Double, Split)
- Lógica do dealer
- Cálculo de resultados
- Apostas laterais

#### Teste do Servidor
```bash
cd backend
npm install
npm start
```

O servidor estará rodando em `http://localhost:3001`

### 2. Teste do Frontend

```bash
cd frontend
npm install
npm run dev
```

A interface estará disponível em `http://localhost:3000`

## Cenários de Teste Manual

### Teste 1: Fluxo Básico do Jogo

1. **Criar Jogo**
   - Abra `http://localhost:3000`
   - Digite seu nome (ex: "João")
   - Defina saldo inicial (ex: 1000)
   - Clique em "Criar Jogo"
   - ✓ Deve redirecionar para tela de apostas

2. **Fazer Aposta**
   - Digite valor da aposta (ex: 50)
   - Clique em "Confirmar Aposta"
   - ✓ Deve distribuir cartas iniciais
   - ✓ Deve mostrar 2 cartas para você e 1 carta visível do dealer

3. **Jogar uma Mão**
   - Clique em "Pedir Carta" ou "Parar"
   - ✓ Ao pedir carta, deve receber nova carta
   - ✓ Ao parar, dealer deve jogar automaticamente
   - ✓ Deve mostrar resultado (Ganhou/Perdeu/Empate)
   - ✓ Saldo deve atualizar corretamente

### Teste 2: Funcionalidade Double Down

1. Criar jogo e fazer aposta de 50
2. Receber cartas iniciais
3. Verificar se botão "Dobrar" está disponível
4. Clicar em "Dobrar"
5. ✓ Deve dobrar a aposta para 100
6. ✓ Deve receber apenas 1 carta adicional
7. ✓ Deve parar automaticamente após receber a carta

### Teste 3: Funcionalidade Split

1. Criar jogo e fazer aposta
2. Continuar jogando até receber um par (duas cartas com mesmo valor)
3. Verificar se botão "Dividir" está disponível
4. Clicar em "Dividir"
5. ✓ Deve criar duas mãos separadas
6. ✓ Cada mão deve receber uma carta adicional
7. ✓ Deve poder jogar cada mão separadamente

### Teste 4: Apostas Laterais - Perfect Pairs

1. Criar jogo
2. Na tela de apostas, definir:
   - Aposta principal: 50
   - Perfect Pairs: 10
3. Confirmar aposta
4. Se receber um par:
   - Par Perfeito (mesmo naipe): ✓ Deve pagar 25:1 (250)
   - Par Colorido (mesma cor): ✓ Deve pagar 12:1 (120)
   - Par Misto: ✓ Deve pagar 6:1 (60)
5. Verificar se saldo foi atualizado

### Teste 5: Apostas Laterais - 21+3

1. Criar jogo
2. Na tela de apostas, definir:
   - Aposta principal: 50
   - 21+3: 10
3. Confirmar aposta
4. Se suas 2 cartas + carta do dealer formarem:
   - Suited Trips: ✓ Deve pagar 100:1 (1000)
   - Straight Flush: ✓ Deve pagar 40:1 (400)
   - Three of a Kind: ✓ Deve pagar 30:1 (300)
   - Straight: ✓ Deve pagar 10:1 (100)
   - Flush: ✓ Deve pagar 5:1 (50)

### Teste 6: Blackjack Natural

1. Criar jogo e apostar
2. Se receber Ás + carta de valor 10 (10, J, Q, K):
3. ✓ Deve mostrar "BLACKJACK!"
4. ✓ Deve pagar 2.5:1 (aposta de 100 = ganho de 250)

### Teste 7: Dealer Bust (Dealer Estoura)

1. Jogar até parar com valor seguro (ex: 18)
2. Esperar dealer jogar
3. Se dealer estourar (> 21):
4. ✓ Você deve ganhar automaticamente
5. ✓ Deve receber 2x a aposta

### Teste 8: Player Bust (Você Estoura)

1. Continuar pedindo cartas até passar de 21
2. ✓ Deve mostrar "ESTOUROU!"
3. ✓ Deve perder a aposta imediatamente
4. ✓ Não deve esperar o dealer jogar

### Teste 9: Saldo Insuficiente

1. Apostar quase todo o saldo
2. Tentar dobrar ou dividir sem saldo suficiente
3. ✓ Botões devem estar desabilitados
4. ✓ Deve mostrar mensagem de erro se tentar

### Teste 10: Nova Rodada

1. Completar uma rodada
2. Clicar em "Nova Rodada"
3. ✓ Deve limpar as cartas
4. ✓ Deve manter o saldo atualizado
5. ✓ Deve retornar para tela de apostas

## Checklist de Funcionalidades

### Regras do Jogo
- [x] Cartas são distribuídas corretamente
- [x] Valores das cartas calculados corretamente
- [x] Ás vale 11 ou 1 conforme necessário
- [x] Dealer para em 17 ou mais
- [x] Blackjack paga 2.5:1
- [x] Vitória normal paga 2:1
- [x] Empate devolve aposta

### Ações do Jogador
- [x] Hit (Pedir Carta) - Adiciona carta à mão
- [x] Stand (Parar) - Termina turno
- [x] Double Down (Dobrar) - Dobra aposta, recebe 1 carta
- [x] Split (Dividir) - Divide par em 2 mãos

### Sistema de Moedas
- [x] Saldo inicial configurável
- [x] Aposta deduzida do saldo
- [x] Ganhos adicionados ao saldo
- [x] Validação de saldo suficiente

### Apostas Laterais
- [x] Perfect Pairs implementado
- [x] 21+3 implementado
- [x] Pagamentos corretos

### Interface
- [x] Design moderno e intuitivo
- [x] Cartas visualmente agradáveis
- [x] Feedback claro das ações
- [x] Responsiva e funcional

### API do Backend
- [x] POST /api/game/create - Criar jogo
- [x] POST /api/game/:gameId/join - Entrar no jogo
- [x] POST /api/game/:gameId/bet - Fazer aposta
- [x] POST /api/game/:gameId/deal - Distribuir cartas
- [x] POST /api/game/:gameId/hit - Pedir carta
- [x] POST /api/game/:gameId/stand - Parar
- [x] POST /api/game/:gameId/double - Dobrar
- [x] POST /api/game/:gameId/split - Dividir
- [x] GET /api/game/:gameId/state - Obter estado do jogo
- [x] POST /api/game/:gameId/reset - Nova rodada

## Bugs Conhecidos

Nenhum bug conhecido no momento.

## Melhorias Futuras

1. WebSocket para multiplayer em tempo real
2. Animações de cartas
3. Sons do jogo
4. Histórico de jogadas
5. Estatísticas do jogador
6. Diferentes temas visuais

