# Mamma Mia Pizzaria

Sistema profissional de pedidos online para pizzaria, feito com React, Node.js,
Express e MySQL.

## Como Rodar Localmente

1. Instale as dependencias:

```bash
npm install
```

2. Copie `.env.example` para `.env` e preencha com os dados reais do MySQL.

3. Crie as tabelas e o cardapio inicial:

```bash
npm run db:setup
```

4. Rode frontend e backend:

```bash
npm run dev:full
```

Frontend:

```text
http://localhost:5173
```

API:

```text
http://localhost:3333/api
```

## Primeiro Administrador

1. Cadastre um usuario pelo site.
2. Promova esse usuario no MySQL:

```sql
UPDATE users SET role = 'admin' WHERE email = 'seu-email@dominio.com';
```

3. Faça login novamente no site.

## Banco MySQL

O schema de producao esta em:

```text
database/mysql-schema.sql
```

Ele cria:

- usuarios
- enderecos
- categorias
- produtos
- pedidos
- itens do pedido
- indices
- views de catalogo, pedidos e faturamento

## Deploy

Variaveis obrigatorias no backend:

```text
NODE_ENV=production
PORT=3333
DB_HOST=
DB_PORT=3306
DB_USER=
DB_PASSWORD=
DB_NAME=mamma_mia
JWT_SECRET=
CORS_ORIGIN=https://seu-frontend.vercel.app
```

Variavel obrigatoria no frontend:

```text
VITE_API_URL=https://sua-api.com/api
```

## Documentacao

```text
docs/implantacao.md
docs/manual-usuario.md
```
