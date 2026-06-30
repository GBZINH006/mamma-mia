const money = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

const categories = [
  { id: 'todos', name: 'Todos' },
  { id: 'tradicionais', name: 'Tradicionais' },
  { id: 'especiais', name: 'Especiais' },
  { id: 'doces', name: 'Doces' },
  { id: 'bebidas', name: 'Bebidas' },
  { id: 'entradas', name: 'Entradas' },
  { id: 'combos', name: 'Combos' },
];

const products = [
  {
    id: 1,
    category: 'tradicionais',
    name: 'Margherita',
    description: 'Molho da casa, mozzarella, tomate fresco, manjericao e azeite.',
    price: 49.9,
    size: 'Grande',
    time: 35,
    badge: 'Mais pedida',
    image:
      'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=900&q=85',
  },
  {
    id: 2,
    category: 'tradicionais',
    name: 'Calabresa Acebolada',
    description: 'Calabresa fatiada, cebola roxa, azeitonas pretas e oregano.',
    price: 52.9,
    size: 'Grande',
    time: 35,
    badge: 'Tradicional',
    image:
      'https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=900&q=85',
  },
  {
    id: 3,
    category: 'tradicionais',
    name: 'Frango com Catupiry',
    description: 'Frango desfiado temperado, catupiry cremoso, milho e oregano.',
    price: 56.9,
    size: 'Grande',
    time: 36,
    badge: 'Cremosa',
    image:
      'https://images.unsplash.com/photo-1595854341625-f33ee10dbf94?auto=format&fit=crop&w=900&q=85',
  },
  {
    id: 4,
    category: 'tradicionais',
    name: 'Portuguesa',
    description: 'Presunto, ovos, cebola, ervilha, azeitonas e mozzarella.',
    price: 58.9,
    size: 'Grande',
    time: 38,
    badge: 'Completa',
    image:
      'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=900&q=85',
  },
  {
    id: 5,
    category: 'especiais',
    name: 'Mamma Mia Especial',
    description: 'Pepperoni, bacon crocante, cebola caramelizada e molho defumado.',
    price: 72.9,
    size: 'Grande',
    time: 42,
    badge: 'Especial',
    image:
      'https://images.unsplash.com/photo-1571997478779-2adcbbe9ab2f?auto=format&fit=crop&w=900&q=85',
  },
  {
    id: 6,
    category: 'especiais',
    name: 'Parma e Rucula',
    description: 'Presunto parma, rucula fresca, parmesao, tomate confit e azeite.',
    price: 68.9,
    size: 'Grande',
    time: 40,
    badge: 'Chef',
    image:
      'https://images.unsplash.com/photo-1601924582970-9238bcb495d9?auto=format&fit=crop&w=900&q=85',
  },
  {
    id: 7,
    category: 'especiais',
    name: 'Quattro Formaggi',
    description: 'Mozzarella, gorgonzola, parmesao, provolone e toque de mel.',
    price: 64.9,
    size: 'Grande',
    time: 38,
    badge: 'Cremosa',
    image:
      'https://images.unsplash.com/photo-1594007654729-407eedc4be65?auto=format&fit=crop&w=900&q=85',
  },
  {
    id: 8,
    category: 'doces',
    name: 'Chocolate com Morango',
    description: 'Creme de chocolate, morangos frescos e raspas de chocolate.',
    price: 46.9,
    size: 'Grande',
    time: 30,
    badge: 'Doce',
    image:
      'https://images.unsplash.com/photo-1613564834361-9436948817d1?auto=format&fit=crop&w=900&q=85',
  },
  {
    id: 9,
    category: 'doces',
    name: 'Banana Nevada',
    description: 'Banana, canela, leite condensado e chocolate branco.',
    price: 44.9,
    size: 'Grande',
    time: 30,
    badge: 'Sobremesa',
    image:
      'https://images.unsplash.com/photo-1620374645498-af6bd681a0bd?auto=format&fit=crop&w=900&q=85',
  },
  {
    id: 10,
    category: 'bebidas',
    name: 'Coca-Cola 2L',
    description: 'Refrigerante Coca-Cola garrafa 2 litros.',
    price: 14.9,
    size: '2L',
    time: 5,
    badge: 'Gelada',
    image:
      'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=900&q=85',
  },
  {
    id: 11,
    category: 'bebidas',
    name: 'Suco Natural de Laranja',
    description: 'Suco natural de laranja em garrafa de 500ml.',
    price: 11.9,
    size: '500ml',
    time: 5,
    badge: 'Natural',
    image:
      'https://images.unsplash.com/photo-1600271886742-f049cd451bba?auto=format&fit=crop&w=900&q=85',
  },
  {
    id: 12,
    category: 'entradas',
    name: 'Pao de Alho Recheado',
    description: 'Pao de alho com queijo, ervas finas e gratinado no forno.',
    price: 24.9,
    size: '6 un',
    time: 18,
    badge: 'Entrada',
    image:
      'https://images.unsplash.com/photo-1573140247632-f8fd74997d5c?auto=format&fit=crop&w=900&q=85',
  },
  {
    id: 13,
    category: 'entradas',
    name: 'Batata Rustica',
    description: 'Batatas rusticas crocantes com maionese temperada da casa.',
    price: 29.9,
    size: 'Porcao',
    time: 20,
    badge: 'Compartilhar',
    image:
      'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=900&q=85',
  },
  {
    id: 14,
    category: 'combos',
    name: 'Combo Familia',
    description: 'Duas pizzas grandes tradicionais, uma entrada e refrigerante 2L.',
    price: 129.9,
    size: 'Combo',
    time: 45,
    badge: 'Oferta',
    image:
      'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=900&q=85',
  },
];

const state = {
  category: 'todos',
  search: '',
  cart: JSON.parse(localStorage.getItem('mamma-mia-cart') || '[]'),
  orders: JSON.parse(localStorage.getItem('mamma-mia-orders') || '[]'),
};

const els = {
  categoryTabs: document.querySelector('#categoryTabs'),
  productGrid: document.querySelector('#productGrid'),
  searchInput: document.querySelector('#searchInput'),
  cartCount: document.querySelector('#cartCount'),
  cartList: document.querySelector('#cartList'),
  subtotal: document.querySelector('#subtotalValue'),
  delivery: document.querySelector('#deliveryValue'),
  total: document.querySelector('#totalValue'),
  checkoutForm: document.querySelector('#checkoutForm'),
  ordersList: document.querySelector('#ordersList'),
  toast: document.querySelector('#toast'),
};

function saveCart() {
  localStorage.setItem('mamma-mia-cart', JSON.stringify(state.cart));
}

function saveOrders() {
  localStorage.setItem('mamma-mia-orders', JSON.stringify(state.orders));
}

function showToast(message) {
  els.toast.textContent = message;
  els.toast.classList.add('show');
  window.setTimeout(() => els.toast.classList.remove('show'), 2600);
}

function goTo(page) {
  document.querySelectorAll('.page').forEach((item) => item.classList.remove('page-active'));
  document.querySelector(`#${page}Page`).classList.add('page-active');

  document.querySelectorAll('.nav-link').forEach((item) => {
    item.classList.toggle('active', item.dataset.page === page);
  });

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function renderCategories() {
  els.categoryTabs.innerHTML = categories
    .map(
      (category) => `
        <button class="${category.id === state.category ? 'active' : ''}" data-category="${category.id}">
          ${category.name}
        </button>
      `,
    )
    .join('');
}

function filteredProducts() {
  return products.filter((product) => {
    const categoryMatch = state.category === 'todos' || product.category === state.category;
    const query = `${product.name} ${product.description}`.toLowerCase();
    return categoryMatch && query.includes(state.search.toLowerCase());
  });
}

function renderProducts() {
  const items = filteredProducts();

  if (!items.length) {
    els.productGrid.innerHTML = `
      <div class="empty" style="grid-column: 1 / -1;">
        <strong>Nenhum item encontrado</strong>
        <span>Tente outra categoria ou busca.</span>
      </div>
    `;
    return;
  }

  els.productGrid.innerHTML = items
    .map(
      (product) => `
        <article class="product-card">
          <img src="${product.image}" alt="${product.name}" loading="lazy" />
          <div class="product-content">
            <div class="product-topline">
              <span>${product.badge}</span>
            </div>
            <h3>${product.name}</h3>
            <p>${product.description}</p>
            <div class="product-meta">
              <span>${product.size}</span>
              <span>${product.time} min</span>
            </div>
            <div class="product-action">
              <strong>${money.format(product.price)}</strong>
              <button data-add="${product.id}">Adicionar</button>
            </div>
          </div>
        </article>
      `,
    )
    .join('');
}

function cartTotals() {
  const subtotal = state.cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const delivery = subtotal > 0 ? 8.9 : 0;
  return { subtotal, delivery, total: subtotal + delivery };
}

function renderCart() {
  const count = state.cart.reduce((sum, item) => sum + item.quantity, 0);
  els.cartCount.textContent = count;

  if (!state.cart.length) {
    els.cartList.innerHTML = `
      <div class="empty">
        <strong>Carrinho vazio</strong>
        <span>Adicione uma pizza para continuar.</span>
      </div>
    `;
  } else {
    els.cartList.innerHTML = state.cart
      .map(
        (item) => `
          <article class="cart-item">
            <img src="${item.image}" alt="${item.name}" />
            <div>
              <h3>${item.name}</h3>
              <span>${money.format(item.price)}</span>
            </div>
            <div class="quantity">
              <button data-dec="${item.id}">−</button>
              <strong>${item.quantity}</strong>
              <button data-inc="${item.id}">+</button>
            </div>
          </article>
        `,
      )
      .join('');
  }

  const totals = cartTotals();
  els.subtotal.textContent = money.format(totals.subtotal);
  els.delivery.textContent = money.format(totals.delivery);
  els.total.textContent = money.format(totals.total);
}

function addToCart(id) {
  const product = products.find((item) => item.id === Number(id));
  const existing = state.cart.find((item) => item.id === product.id);

  if (existing) {
    existing.quantity += 1;
  } else {
    state.cart.push({ ...product, quantity: 1 });
  }

  saveCart();
  renderCart();
  showToast(`${product.name} adicionado ao carrinho.`);
}

function changeQuantity(id, amount) {
  state.cart = state.cart
    .map((item) =>
      item.id === Number(id) ? { ...item, quantity: item.quantity + amount } : item,
    )
    .filter((item) => item.quantity > 0);
  saveCart();
  renderCart();
}

function renderOrders() {
  if (!state.orders.length) {
    els.ordersList.innerHTML = `
      <div class="empty">
        <strong>Nenhum pedido ainda</strong>
        <span>Quando voce finalizar um pedido, ele aparece aqui.</span>
      </div>
    `;
    return;
  }

  els.ordersList.innerHTML = state.orders
    .map(
      (order) => `
        <article class="order-card">
          <div>
            <h3>${order.id}</h3>
            <p>${order.items}</p>
          </div>
          <strong>${money.format(order.total)}</strong>
        </article>
      `,
    )
    .join('');
}

function finishOrder(event) {
  event.preventDefault();

  if (!state.cart.length) {
    showToast('Adicione itens ao carrinho antes de finalizar.');
    return;
  }

  const data = new FormData(event.currentTarget);
  const totals = cartTotals();
  const order = {
    id: `MM-${String(Date.now()).slice(-6)}`,
    customer: data.get('name'),
    phone: data.get('phone'),
    address: data.get('address'),
    payment: data.get('payment'),
    notes: data.get('notes'),
    items: state.cart.map((item) => `${item.quantity}x ${item.name}`).join(', '),
    total: totals.total,
    createdAt: new Date().toISOString(),
  };

  state.orders.unshift(order);
  state.cart = [];
  saveOrders();
  saveCart();
  event.currentTarget.reset();
  renderCart();
  renderOrders();
  showToast('Pedido confirmado! Sua pizza ja entrou na fila.');
  goTo('orders');
}

document.addEventListener('click', (event) => {
  const pageButton = event.target.closest('[data-page]');
  if (pageButton) {
    goTo(pageButton.dataset.page);
  }

  const categoryButton = event.target.closest('[data-category]');
  if (categoryButton) {
    state.category = categoryButton.dataset.category;
    renderCategories();
    renderProducts();
  }

  const addButton = event.target.closest('[data-add]');
  if (addButton) addToCart(addButton.dataset.add);

  const incButton = event.target.closest('[data-inc]');
  if (incButton) changeQuantity(incButton.dataset.inc, 1);

  const decButton = event.target.closest('[data-dec]');
  if (decButton) changeQuantity(decButton.dataset.dec, -1);
});

els.searchInput.addEventListener('input', (event) => {
  state.search = event.target.value;
  renderProducts();
});

els.checkoutForm.addEventListener('submit', finishOrder);

renderCategories();
renderProducts();
renderCart();
renderOrders();
