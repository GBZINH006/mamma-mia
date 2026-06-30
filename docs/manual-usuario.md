# Manual do Usuario - Mamma Mia Delivery Web

## Cliente

1. Acesse o site da pizzaria.
2. Escolha uma categoria ou use a busca.
3. Clique em `Adicionar` nos produtos desejados.
4. Abra o carrinho.
5. Preencha nome, telefone, endereco, pagamento e observacoes.
6. Clique em `Confirmar pedido`.
7. Acompanhe o pedido em `Meus pedidos`.

## Atendente/Admin

1. Entre com um usuario que tenha perfil `admin`.
2. Acesse a aba `Admin`.
3. Veja os indicadores de pedidos, faturamento, produtos e pedidos em andamento.
4. Na aba `Pedidos`, altere o status conforme a operacao:
   - Recebido
   - Em preparo
   - Saiu para entrega
   - Entregue
   - Cancelado
5. Na aba `Produtos`, cadastre novos itens do cardapio.
6. Na aba `Categorias`, cadastre novas categorias.

## Erros Comuns

- Se o cardapio nao carregar do banco, verificar se a API esta rodando.
- Se a API informar erro de acesso ao MySQL, conferir `DB_USER` e `DB_PASSWORD`.
- Se o pedido nao salvar, verificar se o banco `mamma_mia` foi criado.
