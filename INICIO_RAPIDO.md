# Início Rápido - Black Jack Multiplayer

## Executar o Jogo

### 1. Backend
```bash
cd backend
npm install
npm start
```
Servidor: `http://localhost:3001`

### 2. Frontend (em outro terminal)
```bash
cd frontend
npm install
npm run dev
```
Interface: `http://localhost:3000`

## Jogar Solo

1. Abra `http://localhost:3000`
2. Clique em "Jogar Solo"
3. Digite seu nome e saldo
4. Faça suas apostas e jogue!

## Jogar Online com Amigos

### Host (Criador da Sala)

1. Abra `http://localhost:3000`
2. Clique em "Jogar Online"
3. Clique em "Criar Sala"
4. Digite seu nome
5. **Copie o código da sala** (ex: ABC123)
6. Compartilhe com seus amigos
7. Aguarde todos entrarem
8. Clique em "Estou Pronto!"
9. Clique em "Iniciar Jogo"

### Jogador (Entrar em Sala Existente)

1. Abra `http://localhost:3000`
2. Clique em "Jogar Online"
3. Clique em "Entrar na Sala"
4. Digite seu nome
5. Digite o código recebido (6 caracteres)
6. Clique em "Entrar na Sala"
7. Clique em "Estou Pronto!"
8. Aguarde o host iniciar

## Funcionalidades Disponíveis

### Durante o Jogo

- **Pedir Carta**: Recebe mais uma carta
- **Parar**: Mantém a mão atual
- **Dobrar**: Dobra a aposta e recebe 1 carta (só com 2 cartas)
- **Dividir**: Divide um par em 2 mãos (só com par)

### Apostas Laterais

- **Perfect Pairs**: Aposta se suas 2 primeiras cartas formam par
  - Par Perfeito (mesmo naipe): 25:1
  - Par Colorido (mesma cor): 12:1
  - Par Misto: 6:1

- **21+3**: Aposta nas suas 2 cartas + carta do dealer
  - Suited Trips: 100:1
  - Straight Flush: 40:1
  - Three of a Kind: 30:1
  - Straight: 10:1
  - Flush: 5:1

## Dicas Rápidas

### Modo Solo
- Comece com apostas pequenas
- Use "Dobrar" estrategicamente
- "Dividir" só com pares bons (A, 8, 9, 10)

### Modo Online
- Combine comunicação (Discord, WhatsApp)
- Host controla quando nova rodada começa
- Todos devem marcar "Pronto" para iniciar
- Seja rápido nas decisões

## Estrutura de Documentação

- **README.md**: Documentação completa
- **MULTIPLAYER.md**: Guia detalhado do modo online
- **ESTRUTURA.md**: Arquitetura do projeto
- **TESTES.md**: Guia de testes
- **RESUMO_IMPLEMENTACAO.md**: O que foi implementado
- **INICIO_RAPIDO.md**: Este arquivo

## Solução Rápida de Problemas

### Erro ao instalar dependências
```bash
rm -rf node_modules package-lock.json
npm install
```

### Porta já em uso
- Backend: Edite `backend/server.js`, mude `PORT = 3001`
- Frontend: Edite `frontend/vite.config.js`, mude `port: 3000`

### Sala não encontrada
- Verifique se digitou o código correto (6 caracteres)
- Peça novo código ao host

### Não consigo ver outros jogadores
- Verifique conexão com internet
- Recarregue a página
- Entre novamente na sala

## Requisitos

- Node.js 14+
- npm 6+
- Navegador moderno
- Mínimo 2 players para multiplayer (máximo 6)

## Contato

Para dúvidas ou problemas, consulte a documentação completa em:
- README.md
- MULTIPLAYER.md

Divirta-se jogando Black Jack! 🎰🃏

