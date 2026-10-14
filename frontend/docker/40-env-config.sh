#!/bin/sh
# Gera /env-config.js a partir das variáveis de ambiente do contêiner,
# permitindo trocar a URL da API sem reconstruir a imagem (ex.: no Render).
set -eu

cat > /usr/share/nginx/html/env-config.js <<JS
window.__ENV__ = { VITE_API_URL: "${API_URL:-}" };
JS

echo "[env-config] API_URL=${API_URL:-<não definida, usando valor do build>}"
