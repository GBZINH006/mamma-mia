# Plano de Implantacao - Mamma Mia Delivery Web

## Objetivo

Implantar um sistema web de pedidos online para a Pizzaria Mamma Mia, permitindo
que clientes consultem o cardapio, adicionem itens ao carrinho e finalizem
pedidos com endereco, telefone, forma de pagamento e observacoes.

## Escopo da Entrega

Incluido:

- Site React responsivo e profissional.
- Backend Node.js/Express.
- Banco de dados MySQL.
- Autenticacao com senha criptografada e token JWT.
- Cardapio com categorias, busca e produtos.
- Carrinho de compras e checkout.
- Registro de pedidos em `orders` e `order_items`.
- Painel administrativo protegido por perfil `admin`.
- Cadastro administrativo de produtos e categorias.
- Scripts de build, execucao e preparacao de banco.

Fora do escopo atual:

- Pagamento online real.
- Rastreamento de entregador em tempo real.
- WhatsApp/e-mail automatico.

## Ambientes

Desenvolvimento local:

- Frontend: Vite em `http://localhost:5173` ou porta livre.
- Backend: Express em `http://localhost:3333/api`.
- Banco: MySQL 8, database `mamma_mia`.

Producao sugerida:

- Frontend: Vercel.
- Backend: Render, Railway, Fly.io ou VPS.
- Banco: MySQL gerenciado.

## Variaveis de Ambiente

Crie um arquivo `.env` na raiz:

```text
VITE_API_URL=http://localhost:3333/api

NODE_ENV=development
PORT=3333
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=sua-senha
DB_NAME=mamma_mia
JWT_SECRET=troque-por-uma-chave-grande-e-segura
CORS_ORIGIN=http://localhost:5173
```

## Passo a Passo Local

1. Instalar dependencias:

```bash
npm install
```

2. Criar o banco MySQL:

```bash
npm run db:setup
```

3. Rodar API e frontend juntos:

```bash
npm run dev:full
```

4. Testar API:

```text
http://localhost:3333/api/health
http://localhost:3333/api/products
```

5. Testar frontend:

```text
http://localhost:5173
```

## Primeiro Administrador

1. Cadastre um usuario real pelo site.
2. Promova esse usuario no MySQL:

```sql
UPDATE users SET role = 'admin' WHERE email = 'seu-email@dominio.com';
```

3. Faca login novamente.

## Criterios de Sucesso

- Site carrega sem erro.
- Cardapio aparece vindo da API MySQL.
- Pedido e salvo em `orders` e `order_items`.
- Painel admin lista pedidos recebidos.
- Status do pedido pode ser alterado.
- Cadastro de produto e categoria funciona no painel admin.
- Build de producao executa com sucesso.

## Plano de Rollback

- Frontend: reverter para build anterior na Vercel.
- Backend: voltar commit anterior ou reiniciar servico anterior.
- Banco: restaurar backup antes da implantacao.

## Checklist Antes da Apresentacao

- Preencher `.env` com credenciais reais.
- Executar `npm run db:setup`.
- Validar `http://localhost:3333/api/health`.
- Criar o primeiro usuario pelo site.
- Promover o usuario para admin no MySQL.
- Cadastrar um pedido real pelo site.
- Confirmar o pedido no MySQL:

```sql
SELECT * FROM vw_order_summary;
SELECT * FROM order_items;
```
