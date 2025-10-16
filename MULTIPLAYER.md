# Guia Multiplayer - Black Jack

## Visão Geral

O Black Jack agora suporta modo multiplayer online para até 6 jogadores sem necessidade de login ou cadastro. Os jogadores se conectam através de salas com códigos únicos.

## Como Funciona

### Sistema de Salas

Cada sala possui:
- **Código Único**: 6 caracteres alfanuméricos (ex: ABC123, XYZ789)
- **Capacidade**: Até 6 jogadores
- **Host**: Primeiro jogador que cria a sala
- **Tempo de Vida**: Salas vazias são removidas após 30 minutos

### Criando uma Sala

1. Na tela inicial, clique em "Jogar Online"
2. Selecione "Criar Sala"
3. Digite seu nome
4. Defina o saldo inicial (opcional, padrão: R$ 1000)
5. Clique em "Criar Sala"
6. **Copie o código da sala** que aparece no topo
7. Compartilhe o código com seus amigos

### Entrando em uma Sala

1. Na tela inicial, clique em "Jogar Online"
2. Selecione "Entrar na Sala"
3. Digite seu nome
4. Digite o código da sala recebido
5. Clique em "Entrar na Sala"

## Lobby da Sala

### Funcionalidades

- **Visualização dos Jogadores**: Veja quem está na sala
- **Status de Pronto**: Indique quando estiver pronto para jogar
- **Indicador de Host**: O host tem uma badge especial
- **Saldo dos Jogadores**: Veja o saldo de cada jogador
- **Botão Sair**: Saia da sala a qualquer momento

### Preparando-se para Jogar

1. Aguarde todos os jogadores entrarem
2. Clique em "Estou Pronto!" quando estiver preparado
3. Seu card ficará verde quando pronto
4. O host só pode iniciar o jogo quando **todos** estiverem prontos

### Iniciando o Jogo (Host)

1. Aguarde todos marcarem como "Pronto"
2. O botão "Iniciar Jogo" será habilitado
3. Clique para começar a partida

## Jogando Online

### Fase de Apostas

1. Cada jogador faz sua aposta individualmente
2. Pode incluir apostas laterais (Perfect Pairs, 21+3)
3. Aguarde todos os jogadores apostarem
4. As cartas são distribuídas automaticamente

### Fase de Jogo

1. **Turnos**: Os jogadores jogam em sequência
2. **Indicador de Turno**: O jogador ativo tem um destaque verde
3. **Ações Disponíveis** (quando for sua vez):
   - Pedir Carta
   - Parar
   - Dobrar (se disponível)
   - Dividir (se disponível)
4. **Visualização**: Veja as cartas e ações de todos os jogadores em tempo real

### Resultados

1. Após todos jogarem, o dealer joga automaticamente
2. Resultados são mostrados para todos
3. Saldos são atualizados
4. Host pode iniciar nova rodada

## Sincronização

### Atualização Automática

- O estado do jogo é atualizado a cada 1 segundo
- Todos os jogadores veem as mesmas informações
- Ações de um jogador aparecem para todos instantaneamente

### Desconexão

- Se um jogador sair, ele é removido da sala
- Se o host sair, outro jogador vira host
- Se todos saírem, a sala é deletada

## Regras Multiplayer

### Ordem dos Turnos

1. Os jogadores jogam na ordem em que entraram na sala
2. O host sempre joga primeiro
3. Cada jogador deve completar todas as suas mãos antes do próximo

### Apostas

- Cada jogador aposta independentemente
- Não há limite mínimo ou máximo (exceto o saldo)
- Apostas laterais são opcionais

### Múltiplas Mãos (Split)

- Ao dividir, você joga ambas as mãos antes de passar a vez
- Outros jogadores aguardam você completar todas as mãos

## Dicas para Jogar Online

### Para Hosts

1. ✅ Compartilhe o código da sala claramente
2. ✅ Aguarde todos entrarem antes de iniciar
3. ✅ Não inicie o jogo se alguém ainda não está pronto
4. ✅ Você controla quando nova rodada começa

### Para Jogadores

1. ✅ Digite o código da sala corretamente (6 caracteres)
2. ✅ Marque como "Pronto" quando estiver preparado
3. ✅ Aguarde sua vez para jogar
4. ✅ Tome decisões rapidamente para não atrasar outros

### Comunicação

- Combine antecipadamente como vão se comunicar (Discord, WhatsApp, etc.)
- Compartilhe estratégias e resultados
- Divirta-se com seus amigos!

## Exemplos de Códigos de Sala

Códigos válidos:
- ✅ ABC123
- ✅ XYZ789
- ✅ GAME42
- ✅ PLAY99

Códigos inválidos:
- ❌ abc (muito curto)
- ❌ ABCDEFGH (muito longo)
- ❌ AB@123 (caracteres especiais)

## Solução de Problemas

### "Sala não encontrada"
- Verifique se o código está correto
- A sala pode ter sido fechada
- Peça um novo código ao host

### "Sala está cheia"
- A sala já tem 6 jogadores
- Aguarde alguém sair ou crie uma nova sala

### "Jogo já começou"
- Não é possível entrar em salas com jogo em andamento
- Aguarde a rodada terminar ou entre em outra sala

### Jogador não aparece
- Atualize a página
- Verifique a conexão com internet
- Saia e entre novamente na sala

## API de Salas (Para Desenvolvedores)

### Endpoints Disponíveis

```
POST   /api/room/create              # Criar sala
POST   /api/room/:roomCode/join      # Entrar na sala
POST   /api/room/:roomCode/leave     # Sair da sala
POST   /api/room/:roomCode/ready     # Marcar como pronto
POST   /api/room/:roomCode/start     # Iniciar jogo (host)
GET    /api/room/:roomCode/state     # Obter estado da sala
POST   /api/room/:roomCode/bet       # Fazer aposta
POST   /api/room/:roomCode/deal      # Distribuir cartas
POST   /api/room/:roomCode/hit       # Pedir carta
POST   /api/room/:roomCode/stand     # Parar
POST   /api/room/:roomCode/double    # Dobrar
POST   /api/room/:roomCode/split     # Dividir
POST   /api/room/:roomCode/reset     # Nova rodada
```

## Segurança e Privacidade

- ✅ Sem necessidade de login ou senha
- ✅ Sem coleta de dados pessoais
- ✅ Códigos de sala são temporários
- ✅ Salas são automaticamente limpas
- ✅ Apenas jogadores com o código podem entrar

## Limitações Conhecidas

- Atualização por polling (1 segundo de delay)
- Sem persistência de dados (salas em memória)
- Sem recuperação de sessão ao recarregar página
- Limite de 6 jogadores por sala
