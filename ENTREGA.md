# Atividade Prática: Arquitetura em Nuvem

**Disciplina:** Computação em Nuvem e DevOps

---

## Links da entrega

| Item | URL |
|---|---|
| API no Render | `https://api-agendamentos-255a.onrender.com` |
| Front-end no Render | `https://agendamentos-frontend.onrender.com` |
| Documentação da API (Swagger) | `https://api-agendamentos-255a.onrender.com/api-docs` |
| Imagem da API no Docker Hub | `https://hub.docker.com/r/hrvton/api-agendamentos` |
| Imagem do Front-end no Docker Hub | `https://hub.docker.com/r/hrvton/agendamentos-frontend` |

---

## Parte 1: Modelos de Serviço (IaaS, PaaS, SaaS)

### Situação A: Controle e Customização Extrema

**Modelo escolhido:** IaaS (Infrastructure as a Service)

**Justificativa:** A startup precisa de acesso root ao sistema operacional para instalar bibliotecas de rede em C++, definir as próprias regras de firewall e alterar o kernel do Linux para reduzir a latência. Só o IaaS oferece esse nível de controle. O provedor entrega a infraestrutura virtualizada (máquinas virtuais, rede e armazenamento, como AWS EC2, Google Compute Engine ou Azure VMs) e o cliente fica responsável pelo sistema operacional e por tudo o que roda acima dele. No PaaS e no SaaS o sistema operacional é gerenciado pelo provedor e não pode ser alterado, o que impediria as customizações exigidas.

### Situação B: Foco Exclusivo no Código

**Modelo escolhido:** PaaS (Platform as a Service)

**Justificativa:** A equipe quer publicar a API Node.js rapidamente sem administrar servidores, aplicar patches no sistema operacional ou configurar balanceadores de carga. No PaaS (por exemplo Render, Heroku, Google App Engine ou AWS Elastic Beanstalk), o provedor gerencia o sistema operacional, o runtime, a segurança, o balanceamento de carga e a escalabilidade. A equipe só envia o código ou a imagem e a aplicação começa a rodar, o que atende ao requisito de fazer o upload do código e colocá-lo no ar. Com isso, a equipe se concentra apenas no desenvolvimento.

### Situação C: Solução Pronta para o Usuário Final

**Modelo escolhido:** SaaS (Software as a Service)

**Justificativa:** O RH não tem equipe de TI e precisa de um sistema de folha de pagamento e benefícios já pronto, acessado pelo navegador e pago por assinatura mensal. Esse é o SaaS: o software completo é entregue como serviço e o fornecedor cuida da infraestrutura, das atualizações, da segurança, do backup e da disponibilidade. O cliente apenas usa a aplicação, sem lidar com código, servidores ou instalação.

---

## Parte 2: Deploy Prático com Docker e Render

### 1. Conteinerização

| Serviço | Pasta | Dockerfile | Porta | Comando de inicialização |
|---|---|---|---|---|
| API (Node.js + Express + PostgreSQL) | `Desafio Hospedagem/` | build multi-stage: o esbuild gera um único `server.js` e a imagem final usa `node:22-alpine` com usuário não-root | 3000 (ou `PORT`) | `node server.js` |
| Front-end (React + Vite) | `frontend/` | build multi-stage: o Vite gera os estáticos e o Nginx Alpine os serve | 8080 (ou `PORT`) | `nginx -g "daemon off;"` |

As duas imagens leem a porta da variável `PORT`, que o Render define automaticamente.

O Vite grava a URL da API no código durante o build. Como o Render executa uma imagem já construída, o front-end lê essa URL **em tempo de execução**: ao iniciar, o contêiner gera o arquivo `/env-config.js` a partir da variável `API_URL`. Assim, basta configurar `API_URL` no painel do Render, sem reconstruir a imagem.

Teste local:

```bash
# API + PostgreSQL
cd "Desafio Hospedagem"
docker compose up -d --build
curl http://localhost:3000/health        # {"status":"ok","database":"up"}

# Front-end
cd ../frontend
docker compose up -d --build             # http://localhost:8080
```

### 2. Publicação no Docker Hub

```bash
docker login

cd "Desafio Hospedagem"
docker build -t hrvton/api-agendamentos:v1 .
docker push hrvton/api-agendamentos:v1

cd ../frontend
docker build -t hrvton/agendamentos-frontend:v1 .
docker push hrvton/agendamentos-frontend:v1
```

### 3. Hospedagem no Render

1. **Banco de dados:** em *New → Postgres*, crie um banco no plano Free. Copie a **Internal Database URL**.
2. **API:** em *New → Web Service → Deploy an existing image from a registry*, informe `docker.io/hrvton/api-agendamentos:v1`.
   - Environment Variables:
     - `DATABASE_URL` = Internal Database URL do passo 1 (o banco e a API precisam estar na mesma região)
     - `CORS_ORIGIN` = `*` ou a URL pública do front-end
3. **Front-end:** em *New → Web Service → Deploy an existing image from a registry*, informe `docker.io/hrvton/agendamentos-frontend:v1`.

### 4. Variáveis de ambiente e integração

No serviço do front-end, em *Environment*, configure:

| Variável | Valor |
|---|---|
| `API_URL` | `https://api-agendamentos-255a.onrender.com` (sem barra no final) |

Depois de salvar, o Render reinicia o serviço. Verificação:

- Log da API: `[db] migrações aplicadas` e `[http] API rodando na porta 10000 (production)`
- Log do front-end: `[env-config] API_URL=https://api-agendamentos-255a.onrender.com`
- `https://api-agendamentos-255a.onrender.com/health` retorna `{"status":"ok","database":"up"}`
- Ao abrir o front-end, o cabeçalho mostra **"API conectada"**
