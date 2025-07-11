#!/bin/bash
clear
echo -e "🔄 Verificando atualizações do bot..."

# Corrige o erro de "dubious ownership"
git config --global --add safe.directory "$(pwd)"

# Puxa a atualização
git pull

echo -e "✅ Bot atualizado com sucesso!"
