#!/bin/bash

GREEN='\033[0;32m'
NC='\033[0m' # Sem cor

echo -e "${GREEN}🔄 Verificando atualizações do bot...${NC}"
sleep 1

# Verifica se o diretório está versionado com git
if [ -d ".git" ]; then
    git pull origin main
    echo -e "${GREEN}✅ Bot atualizado com sucesso!${NC}"
else
    echo -e "${RED}❌ Este diretório não é um repositório Git.${NC}"
    echo "Execute 'git init' e configure o repositório primeiro."
fi