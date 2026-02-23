#!/bin/bash

# Script de deploy para o backend IECB
# Uso: ./deploy.sh

set -e

echo "=== Deploy Backend IECB ==="

# Navegar para o diretório do servidor
cd /sistema/iecb2

# Instalar dependências
echo "Instalando dependências..."
npm install

# Fazer o build do TypeScript
echo "Fazendo build do TypeScript..."
npm run build

# Verificar se o build foi criado
if [ ! -f "dist/main.js" ]; then
    echo "ERRO: Build falhou - dist/main.js não foi criado"
    exit 1
fi

echo "Build concluído com sucesso!"

# Verificar se o processo já existe no PM2
if pm2 list | grep -q "iecbs"; then
    echo "Reiniciando processo existente..."
    pm2 restart iecbs --env production
else
    echo "Iniciando novo processo..."
    pm2 start ecosystem.config.js --env production
fi

# Salvar configuração do PM2
pm2 save

echo "=== Deploy concluído! ==="
pm2 status iecbs
