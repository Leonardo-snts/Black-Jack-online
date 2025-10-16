#!/bin/bash

echo "Iniciando servidor Black Jack..."
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
echo "Servidor rodando em http://localhost:3001"
echo "Pressione Ctrl+C para parar"
echo ""

node server.js

