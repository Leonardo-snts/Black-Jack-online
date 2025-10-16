#!/bin/bash

echo "Iniciando interface do Black Jack..."
echo ""

if ! command -v node &> /dev/null; then
    echo "Erro: Node.js não encontrado!"
    echo "Por favor, instale o Node.js: https://nodejs.org/"
    exit 1
fi

echo "Verificando dependências..."
if [ ! -d "node_modules" ]; then
    echo "Instalando dependências..."
    npm install
fi

echo ""
echo "Interface disponível em http://localhost:3000"
echo "Pressione Ctrl+C para parar"
echo ""

npm run dev

