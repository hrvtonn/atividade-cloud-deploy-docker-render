# =========================================================================
# Stage 1: Build da aplicação com Node.js Alpine (Multi-stage build)
# =========================================================================
FROM node:22-alpine AS builder

WORKDIR /app

# URL padrão da API embutida no build (pode ser sobrescrita em tempo de
# execução pela variável de ambiente API_URL)
ARG VITE_API_URL=http://localhost:3000
ENV VITE_API_URL=$VITE_API_URL

# Copia apenas os manifestos de dependências para otimizar o cache de camadas
COPY package.json package-lock.json ./
RUN npm ci

# Copia o código-fonte (respeitando o .dockerignore) e gera os estáticos
COPY . .
RUN npm run build

# =========================================================================
# Stage 2: Servidor Web ultraleve com Nginx Alpine
# =========================================================================
FROM nginx:alpine

# Porta em que o Nginx escuta. O Render injeta PORT automaticamente;
# localmente o padrão é 8080.
ENV PORT=8080
# URL pública da API, lida na inicialização do contêiner
ENV API_URL=""

# O entrypoint oficial do Nginx processa os templates (envsubst de ${PORT})
# e executa os scripts de /docker-entrypoint.d antes de subir o servidor
RUN rm -rf /etc/nginx/conf.d/*
COPY nginx.conf /etc/nginx/templates/default.conf.template
COPY docker/40-env-config.sh /docker-entrypoint.d/40-env-config.sh

# Copia apenas os artefatos estáticos compilados na etapa anterior
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- "http://127.0.0.1:${PORT}/healthz" || exit 1

CMD ["nginx", "-g", "daemon off;"]
