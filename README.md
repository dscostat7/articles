# Sistema Simples de Artigos - NestJS

Sistema de gerenciamento de artigos com autenticação JWT e controle de permissões baseado em níveis (Admin, Editor, Reader).

## Tecnologias Utilizadas

- **NestJS** - Framework Node.js para construção de aplicações server-side
- **TypeORM** - ORM para TypeScript e JavaScript
- **PostgreSQL** - Banco de dados relacional
- **JWT** - Autenticação baseada em tokens
- **Docker & Docker Compose** - Containerização da aplicação
- **bcrypt** - Hash de senhas
- **class-validator** - Validação de DTOs

## Requisitos

- Docker
- Docker Compose

## Como Executar

### Com Docker (Recomendado)

```bash
docker compose up --build
```

A aplicação estará disponível em `http://localhost:3000`.

### Desenvolvimento Local

1. Clone o repositório
2. Copie o arquivo de ambiente:
   ```bash
   cp .env.example .env
   ```
3. Instale as dependências:
   ```bash
   npm install
   ```
4. Configure um banco PostgreSQL local
5. Execute as migrations:
   ```bash
   npm run migration:run
   ```
6. Execute os seeds:
   ```bash
   npm run seed:run
   ```
7. Inicie a aplicação:
   ```bash
   npm run start:dev
   ```

## Usuário Root Padrão

Ao subir o projeto, um usuário administrador é criado automaticamente:

- **Email:** root@admin.com
- **Senha:** root123

## Níveis de Permissão

| Permissão | Descrição |
|-----------|-----------|
| **admin** | Acesso total: CRUD de usuários e artigos |
| **editor** | CRUD de artigos apenas |
| **reader** | Apenas leitura de artigos |

## Endpoints da API

### Autenticação

| Método | Endpoint | Descrição | Permissão |
|--------|----------|-----------|-----------|
| POST | `/auth/login` | Login do usuário | Público |

**Exemplo de Login:**
```json
POST /auth/login
{
  "email": "root@admin.com",
  "password": "root123"
}
```

**Resposta:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "name": "Root Admin",
    "email": "root@admin.com",
    "permission": "admin"
  }
}
```

### Usuários

| Método | Endpoint | Descrição | Permissão |
|--------|----------|-----------|-----------|
| GET | `/users` | Listar todos os usuários | Admin |
| GET | `/users/:id` | Buscar usuário por ID | Admin |
| POST | `/users` | Criar novo usuário | Admin |
| PATCH | `/users/:id` | Atualizar usuário | Admin |
| DELETE | `/users/:id` | Excluir usuário | Admin |

**Exemplo de Criação de Usuário:**
```json
POST /users
Authorization: Bearer <token>
{
  "name": "João Silva",
  "email": "joao@email.com",
  "password": "senha123",
  "permissionId": 2
}
```

### Artigos

| Método | Endpoint | Descrição | Permissão |
|--------|----------|-----------|-----------|
| GET | `/articles` | Listar todos os artigos | Admin, Editor, Reader |
| GET | `/articles/:id` | Buscar artigo por ID | Admin, Editor, Reader |
| POST | `/articles` | Criar novo artigo | Admin, Editor |
| PATCH | `/articles/:id` | Atualizar artigo | Admin, Editor |
| DELETE | `/articles/:id` | Excluir artigo | Admin, Editor |

**Exemplo de Criação de Artigo:**
```json
POST /articles
Authorization: Bearer <token>
{
  "title": "Meu Primeiro Artigo",
  "content": "Conteúdo do artigo..."
}
```

### Permissões

| Método | Endpoint | Descrição | Permissão |
|--------|----------|-----------|-----------|
| GET | `/permissions` | Listar todas as permissões | Admin |

## Estrutura do Projeto

```
src/
├── auth/                    # Módulo de autenticação
│   ├── dto/
│   ├── strategies/
│   ├── auth.controller.ts
│   ├── auth.module.ts
│   └── auth.service.ts
├── users/                   # Módulo de usuários
│   ├── dto/
│   ├── entities/
│   ├── users.controller.ts
│   ├── users.module.ts
│   └── users.service.ts
├── articles/                # Módulo de artigos
│   ├── dto/
│   ├── entities/
│   ├── articles.controller.ts
│   ├── articles.module.ts
│   └── articles.service.ts
├── permissions/             # Módulo de permissões
│   ├── entities/
│   ├── permissions.controller.ts
│   ├── permissions.module.ts
│   └── permissions.service.ts
├── common/                  # Utilitários compartilhados
│   ├── decorators/
│   ├── guards/
│   └── interfaces/
├── database/                # Configuração do banco
│   ├── migrations/
│   ├── seeds/
│   └── data-source.ts
├── app.module.ts
└── main.ts
```

## Variáveis de Ambiente

| Variável | Descrição | Valor Padrão |
|----------|-----------|--------------|
| DB_HOST | Host do PostgreSQL | localhost |
| DB_PORT | Porta do PostgreSQL | 5432 |
| DB_USERNAME | Usuário do banco | postgres |
| DB_PASSWORD | Senha do banco | postgres |
| DB_DATABASE | Nome do banco | articles_db |
| JWT_SECRET | Chave secreta do JWT | (definir em produção) |
| JWT_EXPIRATION | Tempo de expiração do token | 24h |
| PORT | Porta da aplicação | 3000 |

## Comandos Úteis

```bash
# Executar migrations
npm run migration:run

# Reverter última migration
npm run migration:revert

# Executar seeds
npm run seed:run

# Desenvolvimento
npm run start:dev

# Produção
npm run start:prod

# Testes
npm run test

# Lint
npm run lint
```

## Decisões Técnicas

1. **TypeORM com Migrations**: Escolhi utilizar migrations em vez de synchronize para ter controle total sobre as alterações do schema do banco de dados em produção.

2. **Guards e Decorators**: Implementei guards customizados para autenticação (JwtAuthGuard) e autorização (PermissionsGuard), juntamente com decorators para facilitar a marcação de rotas protegidas.

3. **DTOs com class-validator**: Validação automática de entrada de dados usando decorators, garantindo integridade dos dados antes de processar as requisições.

4. **Separação de Módulos**: Cada entidade tem seu próprio módulo, seguindo o princípio de responsabilidade única e facilitando a manutenção e testes.

5. **Eager Loading**: Configurei o carregamento eager para relações frequentemente necessárias (como permission em User), otimizando consultas comuns.

6. **Senhas Hash**: Utilização de bcrypt para hash seguro de senhas, com salt rounds adequados.

7. **Docker Multi-stage**: O Dockerfile aguarda o banco estar pronto antes de executar migrations e seeds, garantindo a ordem correta de inicialização.

## Autor

Desenvolvido como teste técnico.
