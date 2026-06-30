CREATE DATABASE IF NOT EXISTS mamma_mia
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE mamma_mia;

CREATE TABLE IF NOT EXISTS users (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(160) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  phone VARCHAR(30),
  role ENUM('customer', 'admin') NOT NULL DEFAULT 'customer',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS addresses (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  label VARCHAR(60) NOT NULL DEFAULT 'Principal',
  street VARCHAR(160) NOT NULL,
  number VARCHAR(20) NOT NULL,
  complement VARCHAR(120),
  district VARCHAR(100) NOT NULL,
  city VARCHAR(100) NOT NULL,
  state CHAR(2) NOT NULL,
  zip_code VARCHAR(12) NOT NULL,
  reference_point VARCHAR(160),
  is_default BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_addresses_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS categories (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(80) NOT NULL,
  slug VARCHAR(90) NOT NULL UNIQUE,
  description VARCHAR(255),
  sort_order INT UNSIGNED NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS products (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  category_id BIGINT UNSIGNED NOT NULL,
  name VARCHAR(120) NOT NULL,
  slug VARCHAR(140) NOT NULL UNIQUE,
  description TEXT NOT NULL,
  image_url VARCHAR(500),
  price DECIMAL(10,2) NOT NULL,
  size VARCHAR(30) NOT NULL DEFAULT 'Grande',
  preparation_minutes INT UNSIGNED NOT NULL DEFAULT 35,
  is_available BOOLEAN NOT NULL DEFAULT TRUE,
  featured_label VARCHAR(40),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_products_category
    FOREIGN KEY (category_id) REFERENCES categories(id)
    ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS orders (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED,
  address_id BIGINT UNSIGNED,
  customer_name VARCHAR(120) NOT NULL,
  customer_phone VARCHAR(30) NOT NULL,
  delivery_address VARCHAR(300) NOT NULL,
  status ENUM('received', 'preparing', 'out_for_delivery', 'delivered', 'cancelled')
    NOT NULL DEFAULT 'received',
  payment_method ENUM('cash', 'card', 'pix') NOT NULL DEFAULT 'pix',
  subtotal DECIMAL(10,2) NOT NULL,
  delivery_fee DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  discount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  total DECIMAL(10,2) NOT NULL,
  notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_orders_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE SET NULL,
  CONSTRAINT fk_orders_address
    FOREIGN KEY (address_id) REFERENCES addresses(id)
    ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS order_items (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_id BIGINT UNSIGNED NOT NULL,
  product_id BIGINT UNSIGNED,
  product_name VARCHAR(120) NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  quantity INT UNSIGNED NOT NULL,
  line_total DECIMAL(10,2) NOT NULL,
  notes VARCHAR(255),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_order_items_order
    FOREIGN KEY (order_id) REFERENCES orders(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_order_items_product
    FOREIGN KEY (product_id) REFERENCES products(id)
    ON DELETE SET NULL
) ENGINE=InnoDB;

INSERT INTO categories (id, name, slug, description, sort_order) VALUES
  (1, 'Tradicionais', 'tradicionais', 'Sabores classicos para todos os dias.', 1),
  (2, 'Especiais da Casa', 'especiais', 'Receitas autorais com ingredientes selecionados.', 2),
  (3, 'Pizzas Doces', 'doces', 'Sobremesas assadas no forno da pizzaria.', 3),
  (4, 'Bebidas', 'bebidas', 'Bebidas geladas para acompanhar o pedido.', 4),
  (5, 'Entradas', 'entradas', 'Porcoes e acompanhamentos para compartilhar.', 5),
  (6, 'Combos', 'combos', 'Ofertas completas para familia e grupos.', 6)
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  slug = VALUES(slug),
  description = VALUES(description),
  sort_order = VALUES(sort_order);

INSERT INTO products
  (id, category_id, name, slug, description, image_url, price, size, preparation_minutes, featured_label)
VALUES
  (1, 1, 'Margherita', 'margherita', 'Molho de tomate da casa, mozzarella, tomate fresco, manjericao e azeite.', 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=900&q=80', 49.90, 'Grande', 35, 'Mais pedida'),
  (2, 1, 'Calabresa Acebolada', 'calabresa-acebolada', 'Calabresa fatiada, cebola roxa, azeitonas pretas e oregano.', 'https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=900&q=80', 52.90, 'Grande', 35, 'Tradicional'),
  (3, 1, 'Frango com Catupiry', 'frango-com-catupiry', 'Frango desfiado temperado, catupiry cremoso, milho e oregano.', 'https://images.unsplash.com/photo-1595854341625-f33ee10dbf94?auto=format&fit=crop&w=900&q=80', 56.90, 'Grande', 36, 'Cremosa'),
  (4, 1, 'Portuguesa', 'portuguesa', 'Presunto, ovos, cebola, ervilha, azeitonas, mozzarella e molho artesanal.', 'https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?auto=format&fit=crop&w=900&q=80', 58.90, 'Grande', 38, 'Completa'),
  (5, 1, 'Napolitana', 'napolitana', 'Mozzarella, tomate em rodelas, parmesao ralado e oregano.', 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=900&q=80', 51.90, 'Grande', 35, 'Leve'),
  (6, 2, 'Parma e Rucula', 'parma-e-rucula', 'Presunto parma, rucula fresca, parmesao, tomate confit e azeite.', 'https://images.unsplash.com/photo-1601924582970-9238bcb495d9?auto=format&fit=crop&w=900&q=80', 68.90, 'Grande', 40, 'Chef'),
  (7, 2, 'Quattro Formaggi', 'quattro-formaggi', 'Mozzarella, gorgonzola, parmesao, provolone e toque de mel.', 'https://images.unsplash.com/photo-1594007654729-407eedc4be65?auto=format&fit=crop&w=900&q=80', 64.90, 'Grande', 38, 'Cremosa'),
  (8, 2, 'Mamma Mia Especial', 'mamma-mia-especial', 'Mozzarella, pepperoni, bacon crocante, cebola caramelizada e molho defumado.', 'https://images.unsplash.com/photo-1571997478779-2adcbbe9ab2f?auto=format&fit=crop&w=900&q=80', 72.90, 'Grande', 42, 'Especial'),
  (9, 2, 'Caprese Premium', 'caprese-premium', 'Mozzarella de bufala, tomate cereja, pesto de manjericao e reducao balsamica.', 'https://images.unsplash.com/photo-1601924582970-9238bcb495d9?auto=format&fit=crop&w=900&q=80', 69.90, 'Grande', 40, 'Premium'),
  (10, 3, 'Chocolate com Morango', 'chocolate-com-morango', 'Creme de chocolate, morangos frescos e raspas de chocolate.', 'https://images.unsplash.com/photo-1613564834361-9436948817d1?auto=format&fit=crop&w=900&q=80', 46.90, 'Grande', 30, 'Doce'),
  (11, 3, 'Banana Nevada', 'banana-nevada', 'Banana, canela, leite condensado e cobertura de chocolate branco.', 'https://images.unsplash.com/photo-1620374645498-af6bd681a0bd?auto=format&fit=crop&w=900&q=80', 44.90, 'Grande', 30, 'Sobremesa'),
  (12, 3, 'Romeu e Julieta', 'romeu-e-julieta', 'Goiabada cremosa, queijo mozzarella e finalizacao com cream cheese.', 'https://images.unsplash.com/photo-1613564834361-9436948817d1?auto=format&fit=crop&w=900&q=80', 45.90, 'Grande', 30, 'Classica'),
  (13, 4, 'Coca-Cola 2L', 'coca-cola-2l', 'Refrigerante Coca-Cola garrafa 2 litros.', 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=900&q=80', 14.90, '2L', 5, 'Gelada'),
  (14, 4, 'Guarana Antarctica 2L', 'guarana-antarctica-2l', 'Refrigerante Guarana Antarctica garrafa 2 litros.', 'https://images.unsplash.com/photo-1581006852262-e4307cf6283a?auto=format&fit=crop&w=900&q=80', 13.90, '2L', 5, 'Gelada'),
  (15, 4, 'Suco Natural de Laranja', 'suco-natural-laranja', 'Suco natural de laranja em garrafa de 500ml.', 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?auto=format&fit=crop&w=900&q=80', 11.90, '500ml', 5, 'Natural'),
  (16, 5, 'Pao de Alho Recheado', 'pao-de-alho-recheado', 'Pao de alho com queijo, ervas finas e gratinado no forno.', 'https://images.unsplash.com/photo-1573140247632-f8fd74997d5c?auto=format&fit=crop&w=900&q=80', 24.90, '6 un', 18, 'Entrada'),
  (17, 5, 'Batata Rustica', 'batata-rustica', 'Batatas rusticas crocantes com maionese temperada da casa.', 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=900&q=80', 29.90, 'Porcao', 20, 'Compartilhar'),
  (18, 6, 'Combo Familia', 'combo-familia', 'Duas pizzas grandes tradicionais, uma entrada e refrigerante 2L.', 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=900&q=80', 129.90, 'Combo', 45, 'Oferta'),
  (19, 6, 'Combo Casal', 'combo-casal', 'Uma pizza grande especial, uma pizza doce broto e duas bebidas.', 'https://images.unsplash.com/photo-1594007654729-407eedc4be65?auto=format&fit=crop&w=900&q=80', 94.90, 'Combo', 42, 'Oferta')
ON DUPLICATE KEY UPDATE
  category_id = VALUES(category_id),
  name = VALUES(name),
  slug = VALUES(slug),
  description = VALUES(description),
  image_url = VALUES(image_url),
  price = VALUES(price),
  size = VALUES(size),
  preparation_minutes = VALUES(preparation_minutes),
  featured_label = VALUES(featured_label);

CREATE OR REPLACE VIEW vw_catalog AS
SELECT
  p.id,
  p.name,
  p.slug,
  c.name AS category,
  c.slug AS category_slug,
  p.description,
  p.image_url,
  p.price,
  p.size,
  p.preparation_minutes,
  p.featured_label,
  p.is_available
FROM products p
JOIN categories c ON c.id = p.category_id
WHERE c.is_active = TRUE
ORDER BY c.sort_order, p.name;

CREATE OR REPLACE VIEW vw_order_summary AS
SELECT
  o.id,
  o.customer_name,
  o.customer_phone,
  o.status,
  o.payment_method,
  o.subtotal,
  o.delivery_fee,
  o.discount,
  o.total,
  COUNT(oi.id) AS total_items,
  o.created_at
FROM orders o
LEFT JOIN order_items oi ON oi.order_id = o.id
GROUP BY
  o.id,
  o.customer_name,
  o.customer_phone,
  o.status,
  o.payment_method,
  o.subtotal,
  o.delivery_fee,
  o.discount,
  o.total,
  o.created_at;

CREATE OR REPLACE VIEW vw_revenue_by_day AS
SELECT
  DATE(created_at) AS order_date,
  COUNT(*) AS orders_count,
  SUM(total) AS revenue
FROM orders
WHERE status <> 'cancelled'
GROUP BY DATE(created_at)
ORDER BY order_date DESC;

-- Para criar o primeiro administrador:
-- 1. Cadastre o usuario pelo site.
-- 2. Execute:
-- UPDATE users SET role = 'admin' WHERE email = 'seu-email@dominio.com';
