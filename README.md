# Atividade Prática: Arquitetura em Nuvem (Docker + Render)

Atividade da disciplina **Computação em Nuvem e DevOps**. Uma aplicação de agendamentos, composta por uma API back-end e um front-end, conteinerizada com Docker, publicada no Docker Hub e hospedada no Render.

## Aplicação no ar

| Serviço | URL |
|---|---|
| Front-end | https://agendamentos-frontend.onrender.com |
| API | https://api-agendamentos-255a.onrender.com |
| Documentação da API (Swagger) | https://api-agendamentos-255a.onrender.com/api-docs |
| Health check da API | https://api-agendamentos-255a.onrender.com/health |

> Os serviços usam o plano gratuito do Render, que "dorme" após cerca de 15 minutos sem uso. O primeiro acesso depois disso pode levar uns 50 segundos.

## Imagens no Docker Hub

| Imagem | Repositório |
|---|---|
| `hrvton/api-agendamentos:v1` | https://hub.docker.com/r/hrvton/api-agendamentos |
| `hrvton/agendamentos-frontend:v1` | https://hub.docker.com/r/hrvton/agendamentos-frontend |

## Arquitetura

```
Navegador
   │
   ▼
Front-end (React + Vite servido por Nginx)    ── Render Web Service (imagem Docker)
   │  fetch → API_URL
   ▼
API (Node.js + Express + TypeScript)          ── Render Web Service (imagem Docker)
   │  DATABASE_URL
   ▼
PostgreSQL                                    ── Render Postgres
```

## Estrutura do repositório

```
.
├── Desafio Hospedagem/   # API REST de agendamentos (Node.js + Express 5 + PostgreSQL)
│   ├── Dockerfile
│   └── docker-compose.yml
├── frontend/             # Interface web (React 19 + Vite + Tailwind)
│   ├── Dockerfile
│   ├── nginx.conf
│   └── docker-compose.yml
└── ENTREGA.md            # Respostas da Parte 1 (IaaS, PaaS, SaaS) e passo a passo do deploy
```

## Imagens Docker

### API (`Desafio Hospedagem/Dockerfile`)
- Build multi-stage. O **esbuild** gera um único `server.js` minificado.
- A imagem final usa `node:22-alpine`, sem `node_modules` nem código-fonte, e roda com o usuário não-root `node`.
- Porta: `3000`, ou o valor da variável `PORT`.
- Inicialização: `node server.js`. As migrações do banco rodam automaticamente ao subir.

### Front-end (`frontend/Dockerfile`)
- Build multi-stage. O Vite gera os arquivos estáticos e o **Nginx Alpine** os serve, com gzip, cache e roteamento de SPA.
- Porta: `8080`, ou o valor da variável `PORT`, definida automaticamente pelo Render.
- **Configuração em tempo de execução:** ao iniciar, o contêiner gera o arquivo `/env-config.js` a partir da variável `API_URL`. Assim, a mesma imagem funciona com qualquer endereço de API, sem precisar ser reconstruída.

## Variáveis de ambiente

| Serviço | Variável | Descrição |
|---|---|---|
| API | `DATABASE_URL` | String de conexão do PostgreSQL |
| API | `CORS_ORIGIN` | Origens permitidas (`*` ou lista separada por vírgula) |
| API | `PORT` | Porta HTTP (padrão `3000`) |
| Front-end | `API_URL` | URL pública da API, sem barra no final |
| Front-end | `PORT` | Porta do Nginx (padrão `8080`) |

## Executando localmente

```bash
# API + PostgreSQL → http://localhost:3000
cd "Desafio Hospedagem"
docker compose up -d --build

# Front-end → http://localhost:8080
cd ../frontend
docker compose up -d --build
```

## Publicação no Docker Hub

```bash
docker login

cd "Desafio Hospedagem"
docker build -t hrvton/api-agendamentos:v1 .
docker push hrvton/api-agendamentos:v1

cd ../frontend
docker build -t hrvton/agendamentos-frontend:v1 .
docker push hrvton/agendamentos-frontend:v1
```

## Deploy no Render

1. **Postgres:** crie um banco no plano Free e copie a *Internal Database URL*.
2. **API:** crie um *Web Service* com a opção *Deploy an existing image* e a imagem `docker.io/hrvton/api-agendamentos:v1`. Defina `DATABASE_URL` e `CORS_ORIGIN`.
3. **Front-end:** crie um *Web Service* com a opção *Deploy an existing image* e a imagem `docker.io/hrvton/agendamentos-frontend:v1`. Defina `API_URL` com a URL pública da API.

## Endpoints da API

| Método | Rota | Descrição |
|---|---|---|
| GET | `/health` | Status da API e do banco |
| GET | `/api-docs` | Documentação Swagger |
| POST | `/appointments` | Cria um agendamento |
| GET | `/appointments` | Lista agendamentos (filtros `status`, `from`, `to`) |
| GET | `/appointments/:id` | Detalha um agendamento |
| PUT | `/appointments/:id` | Atualiza um agendamento |
| PATCH | `/appointments/:id/cancel` | Cancela um agendamento |
| PATCH | `/appointments/:id/complete` | Conclui um agendamento |
| DELETE | `/appointments/:id` | Remove um agendamento |

## Parte 1: Modelos de serviço

| Situação | Modelo | Resumo |
|---|---|---|
| A: servidores de jogos com acesso root e kernel customizado | **IaaS** | Controle total do sistema operacional |
| B: API Node.js sem gerenciar servidores | **PaaS** | O provedor gerencia SO, patches e balanceamento; a equipe só envia o código |
| C: sistema de RH pronto, acessado pelo navegador | **SaaS** | Software completo por assinatura, sem infraestrutura nem código |

As justificativas completas estão em [ENTREGA.md](ENTREGA.md).

## Tecnologias

Node.js 22 · TypeScript · Express 5 · PostgreSQL · Zod · React 19 · Vite · Tailwind CSS · Nginx · Docker · Docker Hub · Render
