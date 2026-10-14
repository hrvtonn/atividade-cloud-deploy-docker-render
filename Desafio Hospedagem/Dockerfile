# =========================================================================
# Stage 1: build — instala dependências e gera um único server.js (esbuild)
# =========================================================================
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# =========================================================================
# Stage 2: imagem final mínima, sem node_modules nem código-fonte
# =========================================================================
FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
COPY --from=build /app/dist/server.js ./server.js
USER node
EXPOSE 3000
CMD ["node", "server.js"]
