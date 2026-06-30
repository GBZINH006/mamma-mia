import { useEffect, useMemo, useState } from 'react';
import {
  ChefHat,
  Clock,
  ClipboardList,
  Flame,
  Lock,
  LogIn,
  LogOut,
  Minus,
  PackagePlus,
  Pizza,
  Plus,
  Search,
  ShoppingBag,
  Sparkles,
  Tags,
  Trash2,
  User,
} from 'lucide-react';
import {
  checkMysqlHealth,
  createMysqlCategory,
  createMysqlOrder,
  createMysqlProduct,
  fetchMysqlCatalog,
  fetchMysqlCategories,
  fetchMysqlMe,
  fetchMysqlMyOrders,
  fetchMysqlOrders,
  setMysqlToken,
  signInMysql,
  signUpMysql,
  updateMysqlOrderStatus,
} from './services/mysqlApi.js';

const currency = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

const statusLabels = {
  received: 'Recebido',
  preparing: 'Em preparo',
  out_for_delivery: 'Saiu para entrega',
  delivered: 'Entregue',
  cancelled: 'Cancelado',
};

const statusValues = Object.keys(statusLabels);

function App() {
  const [activePage, setActivePage] = useState('menu');
  const [activeCategory, setActiveCategory] = useState('todos');
  const [query, setQuery] = useState('');
  const [cart, setCart] = useState([]);
  const [catalog, setCatalog] = useState([]);
  const [catalogCategories, setCatalogCategories] = useState([]);
  const [orders, setOrders] = useState([]);
  const [user, setUser] = useState(null);
  const [notice, setNotice] = useState('');
  const [isApiReady, setIsApiReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function loadRemoteData() {
      try {
        await checkMysqlHealth();
        const [nextCategories, nextCatalog] = await Promise.all([
          fetchMysqlCategories(),
          fetchMysqlCatalog(),
        ]);
        setCatalogCategories(nextCategories);
        setCatalog(nextCatalog);
        setIsApiReady(true);

        try {
          const currentUser = await fetchMysqlMe();
          setUser(currentUser);
          if (currentUser.role === 'admin') {
            setOrders(await fetchMysqlOrders());
          } else {
            setOrders(await fetchMysqlMyOrders());
          }
        } catch {
          setMysqlToken(null);
        }
      } catch (error) {
        setNotice(`API indisponivel: ${error.message}`);
      }
    }

    loadRemoteData();
  }, []);

  const filteredProducts = useMemo(() => {
    return catalog.filter((product) => {
      const categoryMatch =
        activeCategory === 'todos' || product.categoryId === activeCategory;
      const queryMatch = `${product.name} ${product.description}`
        .toLowerCase()
        .includes(query.toLowerCase());
      return categoryMatch && queryMatch;
    });
  }, [activeCategory, catalog, query]);

  const subtotal = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  );
  const deliveryFee = subtotal > 0 ? 8.9 : 0;
  const total = subtotal + deliveryFee;
  const cartCount = cart.reduce((count, item) => count + item.quantity, 0);
  const isAdmin = user?.role === 'admin' || user?.user_metadata?.role === 'admin';

  function addToCart(product) {
    setCart((current) => {
      const existing = current.find((item) => item.id === product.id);
      if (existing) {
        return current.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }
      return [...current, { ...product, quantity: 1 }];
    });
  }

  function changeQuantity(productId, amount) {
    setCart((current) =>
      current
        .map((item) =>
          item.id === productId
            ? { ...item, quantity: item.quantity + amount }
            : item,
        )
        .filter((item) => item.quantity > 0),
    );
  }

  function removeFromCart(productId) {
    setCart((current) => current.filter((item) => item.id !== productId));
  }

  async function finishOrder(event) {
    event.preventDefault();
    if (!cart.length) return;

    const form = new FormData(event.currentTarget);
    const customer = {
      name: form.get('name') || user?.user_metadata?.name || 'Cliente',
      phone: form.get('phone'),
      address: form.get('address'),
      notes: form.get('notes'),
      paymentMethod: form.get('paymentMethod') || 'pix',
    };

    setIsLoading(true);
    setNotice('');

    try {
      const nextOrder = await createMysqlOrder({
        customer,
        cart,
        subtotal,
        deliveryFee,
        total,
      });

      setOrders((current) => [nextOrder, ...current]);
      setCart([]);
      setActivePage('success');
    } catch (error) {
      setNotice(`Nao foi possivel salvar o pedido: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleAuthSubmit(event, mode) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setIsLoading(true);
    setNotice('');

    try {
      const session =
        mode === 'login'
          ? await signInMysql(form.get('email'), form.get('password'))
          : await signUpMysql({
              name: form.get('name'),
              phone: form.get('phone'),
              email: form.get('email'),
              password: form.get('password'),
            });

      setMysqlToken(session.token);
      setUser(session.user);

      if (session.user.role === 'admin') {
        setOrders(await fetchMysqlOrders());
      } else {
        setOrders(await fetchMysqlMyOrders());
      }

      setNotice('Login realizado com sucesso.');
      setActivePage('menu');
    } catch (error) {
      setNotice(`Autenticacao: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleLogout() {
    setMysqlToken(null);
    setUser(null);
    setOrders([]);
    setActivePage('menu');
  }

  async function handleStatusChange(orderId, status) {
    setOrders((current) =>
      current.map((order) =>
        order.id === orderId ? { ...order, status } : order,
      ),
    );

    const order = orders.find((item) => item.id === orderId);
    if (order?.rawId) {
      try {
        await updateMysqlOrderStatus(order.rawId, status);
      } catch (error) {
        setNotice(`Status nao salvo: ${error.message}`);
      }
      return;
    }
  }

  function slugify(value) {
    return value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  async function handleCategorySave(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = form.get('name').trim();
    if (!name) return;

    let nextCategory = { id: slugify(name), name };

    try {
      nextCategory = await createMysqlCategory({
        name,
        description: form.get('description') || '',
      });
    } catch (error) {
      setNotice(`Categoria nao salva: ${error.message}`);
      return;
    }

    setCatalogCategories((current) => {
      if (current.some((category) => category.id === nextCategory.id)) {
        return current;
      }
      return [...current, nextCategory];
    });

    event.currentTarget.reset();
    setNotice('Categoria cadastrada.');
  }

  async function handleProductSave(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = form.get('name').trim();
    const price = Number(form.get('price'));

    if (!name || Number.isNaN(price)) return;

    let nextProduct = {
      id: Date.now(),
      categoryId: form.get('categoryId'),
      name,
      description: form.get('description'),
      price,
      image:
        form.get('image') ||
        'https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?auto=format&fit=crop&w=900&q=80',
      badge: form.get('badge') || 'Novo',
    };

    try {
      nextProduct = await createMysqlProduct(nextProduct);
    } catch (error) {
      setNotice(`Produto nao salvo: ${error.message}`);
      return;
    }

    setCatalog((current) => [nextProduct, ...current]);
    event.currentTarget.reset();
    setNotice('Produto cadastrado.');
  }

  return (
    <div className="app-shell">
      <header className="site-header">
        <button className="brand" onClick={() => setActivePage('menu')}>
          <span className="brand-mark">
            <Pizza size={24} />
          </span>
          <span>
            <strong>Mamma Mia</strong>
            <small>Pizzaria artesanal</small>
          </span>
        </button>

        <nav className="main-nav" aria-label="Navegacao principal">
          <button
            className={activePage === 'menu' ? 'active' : ''}
            onClick={() => setActivePage('menu')}
          >
            Cardapio
          </button>
          <button
            className={activePage === 'orders' ? 'active' : ''}
            onClick={() => setActivePage('orders')}
          >
            Meus pedidos
          </button>
          {isAdmin && (
            <button
              className={activePage === 'admin' ? 'active' : ''}
              onClick={() => setActivePage('admin')}
            >
              Admin
            </button>
          )}
          <button
            className={activePage === 'auth' ? 'active' : ''}
            onClick={() => setActivePage('auth')}
          >
            {user ? 'Conta' : 'Entrar'}
          </button>
        </nav>

        <div className="header-actions">
          {user && (
            <button className="account-button" onClick={handleLogout}>
              <LogOut size={17} />
              Sair
            </button>
          )}
          <button className="cart-button" onClick={() => setActivePage('cart')}>
            <ShoppingBag size={19} />
            <span>{cartCount}</span>
          </button>
        </div>
      </header>

      {notice && <div className="notice-bar">{notice}</div>}

      <main>
        {activePage === 'menu' && (
          <>
            <section className="hero-section">
              <div className="hero-copy">
                <span className="eyebrow">Aberto hoje ate 23h</span>
                <h1>Mamma Mia</h1>
                <p>
                  Pizzas artesanais, ingredientes selecionados e pedidos online
                  com preparo rapido para matar a fome sem complicacao.
                </p>
                <div className="hero-actions">
                  <button
                    className="primary-button"
                    onClick={() => document.getElementById('menu')?.scrollIntoView()}
                  >
                    Ver cardapio
                  </button>
                  <button
                    className="secondary-button"
                    onClick={() => setActivePage('cart')}
                  >
                    Finalizar pedido
                  </button>
                </div>
                <div className="hero-badges" aria-label="Diferenciais da pizzaria">
                  <span>Massa de longa fermentacao</span>
                  <span>Forno bem quente</span>
                  <span>Entrega propria</span>
                </div>
              </div>
              <div className="hero-panel">
                <div className="hero-panel-feature">
                  <Sparkles size={22} />
                  <span>Especial de hoje</span>
                  <strong>Mamma Mia Especial</strong>
                </div>
                <div>
                  <Clock size={20} />
                  <span>Tempo medio</span>
                  <strong>35-45 min</strong>
                </div>
                <div>
                  <Flame size={20} />
                  <span>Forno</span>
                  <strong>Alta temperatura</strong>
                </div>
                <div>
                  <Sparkles size={20} />
                  <span>Avaliacao</span>
                  <strong>4.9/5</strong>
                </div>
                <div>
                  <span>Entrega</span>
                  <strong>{currency.format(8.9)}</strong>
                </div>
              </div>
            </section>

            <section className="menu-section" id="menu">
              <div className="section-heading">
                <div>
                  <span className="eyebrow">Cardapio</span>
                  <h2>Escolha sua pizza</h2>
                </div>
                <label className="search-box">
                  <Search size={18} />
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Buscar sabor"
                  />
                </label>
              </div>

              <div className="category-tabs">
                <button
                  className={activeCategory === 'todos' ? 'active' : ''}
                  onClick={() => setActiveCategory('todos')}
                >
                  Todos
                </button>
                {catalogCategories.map((category) => (
                  <button
                    key={category.id}
                    className={activeCategory === category.id ? 'active' : ''}
                    onClick={() => setActiveCategory(category.id)}
                  >
                    {category.name}
                  </button>
                ))}
              </div>

              <div className="product-grid">
                {filteredProducts.length > 0 ? filteredProducts.map((product) => (
                  <article className="product-card" key={product.id}>
                    <img src={product.image} alt={product.name} />
                    <div className="product-content">
                      <div className="product-topline">
                        <span>{product.badge}</span>
                        <strong>{currency.format(product.price)}</strong>
                      </div>
                      <h3>{product.name}</h3>
                      <p>{product.description}</p>
                      <div className="product-meta">
                        <span>{product.size || 'Grande'}</span>
                        <span>{product.preparationMinutes || 35} min</span>
                      </div>
                      <div className="product-action-row">
                        <strong>{currency.format(product.price)}</strong>
                        <button onClick={() => addToCart(product)}>
                          <Plus size={18} />
                          Adicionar
                        </button>
                      </div>
                    </div>
                  </article>
                )) : (
                  <div className="empty-state menu-empty">
                    <Pizza size={34} />
                    <h3>Cardapio indisponivel</h3>
                    <p>Confira se a API e o banco MySQL estao em funcionamento.</p>
                  </div>
                )}
              </div>
            </section>
          </>
        )}

        {activePage === 'cart' && (
          <section className="two-column-page">
            <CartPanel
              cart={cart}
              subtotal={subtotal}
              deliveryFee={deliveryFee}
              total={total}
              onChangeQuantity={changeQuantity}
              onRemove={removeFromCart}
            />
            <CheckoutPanel
              cart={cart}
              user={user}
              isLoading={isLoading}
              onSubmit={finishOrder}
              onBack={() => setActivePage('menu')}
              onLogin={() => setActivePage('auth')}
            />
          </section>
        )}

        {activePage === 'success' && (
          <section className="status-page">
            <div className="status-icon">
              <ClipboardList size={34} />
            </div>
            <span className="eyebrow">Pedido confirmado</span>
            <h2>Sua pizza ja entrou na fila do forno.</h2>
            <p>
              Acompanhe o status em meus pedidos. O pedido foi registrado no
              banco de dados.
            </p>
            <button className="primary-button" onClick={() => setActivePage('orders')}>
              Ver meus pedidos
            </button>
          </section>
        )}

        {activePage === 'orders' && <OrdersPage orders={orders} />}

        {activePage === 'admin' && isAdmin && (
          <AdminPage
            orders={orders}
            catalog={catalog}
            categories={catalogCategories}
            onStatusChange={handleStatusChange}
            onProductSave={handleProductSave}
            onCategorySave={handleCategorySave}
          />
        )}

        {activePage === 'admin' && !isAdmin && (
          <section className="status-page">
            <div className="status-icon">
              <Lock size={34} />
            </div>
            <span className="eyebrow">Acesso restrito</span>
            <h2>Area administrativa restrita.</h2>
            <p>
              Faca login com uma conta autorizada para continuar.
            </p>
            <button className="primary-button" onClick={() => setActivePage('auth')}>
              Entrar
            </button>
          </section>
        )}

        {activePage === 'auth' && (
          <AuthPage
            user={user}
            isLoading={isLoading}
            onSubmit={handleAuthSubmit}
            onLogout={handleLogout}
          />
        )}
      </main>

      <footer className="site-footer">
        <span>Mamma Mia Pizzaria</span>
        <span>{isApiReady ? 'Sistema online' : 'Conectando ao servidor'}</span>
      </footer>
    </div>
  );
}

function CartPanel({
  cart,
  subtotal,
  deliveryFee,
  total,
  onChangeQuantity,
  onRemove,
}) {
  return (
    <section className="surface">
      <div className="section-heading compact">
        <div>
          <span className="eyebrow">Carrinho</span>
          <h2>Seu pedido</h2>
        </div>
      </div>

      {cart.length === 0 ? (
        <div className="empty-state">
          <ShoppingBag size={34} />
          <h3>Carrinho vazio</h3>
          <p>Adicione itens do cardapio para continuar.</p>
        </div>
      ) : (
        <div className="cart-list">
          {cart.map((item) => (
            <article className="cart-item" key={item.id}>
              <img src={item.image} alt={item.name} />
              <div>
                <h3>{item.name}</h3>
                <span>{currency.format(item.price)}</span>
              </div>
              <div className="quantity-control">
                <button onClick={() => onChangeQuantity(item.id, -1)}>
                  <Minus size={16} />
                </button>
                <strong>{item.quantity}</strong>
                <button onClick={() => onChangeQuantity(item.id, 1)}>
                  <Plus size={16} />
                </button>
              </div>
              <button className="icon-button" onClick={() => onRemove(item.id)}>
                <Trash2 size={17} />
              </button>
            </article>
          ))}
        </div>
      )}

      <div className="summary">
        <div>
          <span>Subtotal</span>
          <strong>{currency.format(subtotal)}</strong>
        </div>
        <div>
          <span>Entrega</span>
          <strong>{currency.format(deliveryFee)}</strong>
        </div>
        <div className="summary-total">
          <span>Total</span>
          <strong>{currency.format(total)}</strong>
        </div>
      </div>
    </section>
  );
}

function CheckoutPanel({ cart, user, isLoading, onSubmit, onBack, onLogin }) {
  return (
    <section className="surface">
      <div className="section-heading compact">
        <div>
          <span className="eyebrow">Checkout</span>
          <h2>Entrega</h2>
        </div>
        <Lock size={20} />
      </div>

      {!user && (
        <button className="auth-callout" onClick={onLogin}>
          <LogIn size={18} />
          Entrar ou cadastrar antes do pedido
        </button>
      )}

      <form className="checkout-form" onSubmit={onSubmit}>
        <label>
          Nome
          <input
            name="name"
            placeholder="Seu nome"
            defaultValue={user?.user_metadata?.name ?? ''}
            required
          />
        </label>
        <label>
          Telefone
          <input
            name="phone"
            placeholder="(00) 00000-0000"
            defaultValue={user?.user_metadata?.phone ?? ''}
            required
          />
        </label>
        <label>
          Endereco
          <input name="address" placeholder="Rua, numero, bairro" required />
        </label>
        <label>
          Pagamento
          <select name="paymentMethod" defaultValue="pix">
            <option value="pix">Pix</option>
            <option value="card">Cartao</option>
            <option value="cash">Dinheiro</option>
          </select>
        </label>
        <label>
          Observacoes
          <textarea name="notes" placeholder="Ponto da massa, troco, referencia" />
        </label>
        <button className="primary-button full" disabled={!cart.length || isLoading}>
          {isLoading ? 'Salvando...' : 'Confirmar pedido'}
        </button>
        <button type="button" className="secondary-button full" onClick={onBack}>
          Voltar ao cardapio
        </button>
      </form>
    </section>
  );
}

function OrdersPage({ orders }) {
  return (
    <section className="content-page">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Historico</span>
          <h2>Meus pedidos</h2>
        </div>
        <User size={22} />
      </div>
      <div className="order-list">
        {orders.map((order) => (
          <article className="order-card" key={order.id}>
            <div>
              <span>{order.id}</span>
              <h3>{order.items}</h3>
              <p>{order.time} - {statusLabels[order.status] ?? order.status}</p>
            </div>
            <strong>{currency.format(order.total)}</strong>
          </article>
        ))}
      </div>
    </section>
  );
}

function AdminPage({
  orders,
  catalog,
  categories,
  onStatusChange,
  onProductSave,
  onCategorySave,
}) {
  const [adminTab, setAdminTab] = useState('orders');
  const revenue = orders.reduce((sum, order) => sum + order.total, 0);
  const pendingOrders = orders.filter(
    (order) => !['delivered', 'cancelled'].includes(order.status),
  ).length;

  return (
    <section className="content-page">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Painel</span>
          <h2>Administracao</h2>
        </div>
        <ChefHat size={24} />
      </div>

      <div className="metrics-grid">
        <div className="metric">
          <span>Pedidos</span>
          <strong>{orders.length}</strong>
        </div>
        <div className="metric">
          <span>Faturamento</span>
          <strong>{currency.format(revenue)}</strong>
        </div>
        <div className="metric">
          <span>Produtos</span>
          <strong>{catalog.length}</strong>
        </div>
        <div className="metric">
          <span>Em andamento</span>
          <strong>{pendingOrders}</strong>
        </div>
      </div>

      <div className="admin-tabs">
        <button
          className={adminTab === 'orders' ? 'active' : ''}
          onClick={() => setAdminTab('orders')}
        >
          <ClipboardList size={18} />
          Pedidos
        </button>
        <button
          className={adminTab === 'products' ? 'active' : ''}
          onClick={() => setAdminTab('products')}
        >
          <PackagePlus size={18} />
          Produtos
        </button>
        <button
          className={adminTab === 'categories' ? 'active' : ''}
          onClick={() => setAdminTab('categories')}
        >
          <Tags size={18} />
          Categorias
        </button>
      </div>

      {adminTab === 'orders' && (
        <div className="admin-table">
          {orders.map((order) => (
            <article className="admin-row" key={order.id}>
              <div>
                <span>{order.id}</span>
                <h3>{order.customer}</h3>
                <p>{order.items}</p>
              </div>
              <strong>{currency.format(order.total)}</strong>
              <select
                value={order.status}
                onChange={(event) => onStatusChange(order.id, event.target.value)}
              >
                {statusValues.map((status) => (
                  <option key={status} value={status}>
                    {statusLabels[status]}
                  </option>
                ))}
              </select>
            </article>
          ))}
        </div>
      )}

      {adminTab === 'products' && (
        <div className="admin-grid">
          <form className="surface checkout-form" onSubmit={onProductSave}>
            <span className="eyebrow">Produto</span>
            <label>
              Nome
              <input name="name" placeholder="Pizza Caprese" required />
            </label>
            <label>
              Categoria
              <select name="categoryId" required>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Descricao
              <textarea name="description" placeholder="Ingredientes e diferenciais" required />
            </label>
            <label>
              Imagem
              <input name="image" placeholder="URL da imagem" />
            </label>
            <div className="form-row">
              <label>
                Preco
                <input name="price" type="number" step="0.01" min="1" required />
              </label>
              <label>
                Selo
                <input name="badge" placeholder="Novo" />
              </label>
            </div>
            <button className="primary-button full">
              <Plus size={18} />
              Cadastrar produto
            </button>
          </form>

          <div className="admin-list">
            {catalog.map((product) => (
              <article className="inventory-row" key={product.id}>
                <img src={product.image} alt={product.name} />
                <div>
                  <h3>{product.name}</h3>
                  <p>{product.badge} - {currency.format(product.price)}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      )}

      {adminTab === 'categories' && (
        <div className="admin-grid">
          <form className="surface checkout-form" onSubmit={onCategorySave}>
            <span className="eyebrow">Categoria</span>
            <label>
              Nome
              <input name="name" placeholder="Combos" required />
            </label>
            <label>
              Descricao
              <input name="description" placeholder="Descricao breve" />
            </label>
            <button className="primary-button full">
              <Plus size={18} />
              Cadastrar categoria
            </button>
          </form>

          <div className="admin-list">
            {categories.map((category) => (
              <article className="category-row" key={category.id}>
                <Tags size={20} />
                <div>
                  <h3>{category.name}</h3>
                  <p>{category.id}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

function AuthPage({ user, isLoading, onSubmit, onLogout }) {
  const [mode, setMode] = useState('login');

  if (user) {
    return (
      <section className="content-page auth-page">
        <div className="surface account-panel">
          <div className="status-icon">
            <User size={32} />
          </div>
          <span className="eyebrow">Conta ativa</span>
          <h2>{user.user_metadata?.name || user.email}</h2>
          <p>{user.email}</p>
          <button className="secondary-button" onClick={onLogout}>
            <LogOut size={18} />
            Sair da conta
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="content-page auth-page">
      <div className="auth-grid">
        <div className="surface auth-copy">
          <span className="eyebrow">Area do cliente</span>
          <h2>{mode === 'login' ? 'Entrar na conta' : 'Criar cadastro'}</h2>
          <p>
            Use login para acompanhar pedidos e manter os dados do cliente
            protegidos no sistema.
          </p>
          <div className="auth-switch">
            <button
              className={mode === 'login' ? 'active' : ''}
              onClick={() => setMode('login')}
            >
              Login
            </button>
            <button
              className={mode === 'register' ? 'active' : ''}
              onClick={() => setMode('register')}
            >
              Cadastro
            </button>
          </div>
        </div>

        <form
          className="surface checkout-form"
          onSubmit={(event) => onSubmit(event, mode)}
        >
          {mode === 'register' && (
            <>
              <label>
                Nome
                <input name="name" placeholder="Nome completo" required />
              </label>
              <label>
                Telefone
                <input name="phone" placeholder="(00) 00000-0000" required />
              </label>
            </>
          )}
          <label>
            E-mail
            <input name="email" type="email" placeholder="voce@email.com" required />
          </label>
          <label>
            Senha
            <input
              name="password"
              type="password"
              placeholder="Minimo de 6 caracteres"
              minLength={6}
              required
            />
          </label>
          <button className="primary-button full" disabled={isLoading}>
            {isLoading ? 'Carregando...' : mode === 'login' ? 'Entrar' : 'Cadastrar'}
          </button>
        </form>
      </div>
    </section>
  );
}

export default App;
