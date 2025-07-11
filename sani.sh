#!/bin/bash

# Cores para o terminal
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NOCOLOR='\033[0m'

while true; do
    printf "${GREEN}        Auto reconexão para prevenção de quedas...\n\n${NOCOLOR}"

    if [ "$1" = "cdg" ]; then
        printf "${BLUE}Iniciando bot...${NOCOLOR}\n"
        node start.js --code
    else
        printf "${BLUE}Iniciando bot...${NOCOLOR}\n"
        node start.js
    fi

    echo -e "\n${GREEN}𝑹𝑬𝑰𝑵𝑰𝑪𝑰𝑨𝑵𝑫𝑶ฅ^•ﻌ•^ฅ...${NOCOLOR}\n"
    sleep 3
done