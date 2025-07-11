#!/bin/bash
clear
echo -e "🔄 Verificando atualizações do bot..."

# Corrige erro de propriedade do Git
git config --global --add safe.directory "$(pwd)"

# Força o reset pra última versão do GitHub, ignorando alterações locais
git fetch origin main
git reset --hard origin/main

echo -e "✅ Bot atualizado com sucesso!"
