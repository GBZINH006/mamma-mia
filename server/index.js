import 'dotenv/config';
import bcrypt from 'bcryptjs';
import cors from 'cors';
import express from 'express';
import jwt from 'jsonwebtoken';
import { pingDatabase, pool } from './db.js';

const app = express();
const port = Number(process.env.PORT || 3333);
const jwtSecret = process.env.JWT_SECRET;
const isProduction = process.env.NODE_ENV === 'production';
const configuredOrigins = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

if (isProduction && !jwtSecret) {
  throw new Error('JWT_SECRET e obrigatorio em producao.');
}

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) {
        callback(null, true);
        return;
      }

      const isLocalVite =
        !isProduction && /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin);

      if (isLocalVite || configuredOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error(`Origem nao permitida pelo CORS: ${origin}`));
    },
  }),
);
app.use(express.json({ limit: '1mb' }));

function signToken(user) {
  return jwt.sign(
    {
      sub: String(user.id),
      role: user.role,
      email: user.email,
    },
    jwtSecret || 'dev-local-secret-change-me',
    { expiresIn: '7d' },
  );
}

function publicUser(user) {
  return {
    id: user.id,
    email: user.email,
    role: user.role,
    user_metadata: {
      name: user.name,
      phone: user.phone,
      role: user.role,
    },
  };
}

function readAuth(request) {
  const header = request.headers.authorization;
  if (!header?.startsWith('Bearer ')) return null;

  try {
    return jwt.verify(
      header.replace('Bearer ', ''),
      jwtSecret || 'dev-local-secret-change-me',
    );
  } catch {
    return null;
  }
}

function requireAuth(request, response, next) {
  const payload = readAuth(request);
  if (!payload) {
    response.status(401).json({ error: 'Autenticacao obrigatoria.' });
    return;
  }

  request.auth = payload;
  next();
}

function requireAdmin(request, response, next) {
  const payload = readAuth(request);
  if (!payload || payload.role !== 'admin') {
    response.status(403).json({ error: 'Acesso administrativo negado.' });
    return;
  }

  request.auth = payload;
  next();
}

function toCatalogProduct(product) {
  return {
    id: product.id,
    categoryId: product.category_slug,
    name: product.name,
    description: product.description,
    image: product.image_url,
    price: Number(product.price),
    badge: product.featured_label,
    size: product.size,
    preparationMinutes: product.preparation_minutes,
  };
}

function toOrder(order) {
  return {
    id: `MM-${order.id}`,
    rawId: order.id,
    customer: order.customer_name,
    phone: order.customer_phone,
    status: order.status,
    paymentMethod: order.payment_method,
    total: Number(order.total),
    items: order.items || '',
    time: new Date(order.created_at).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    }),
    createdAt: order.created_at,
  };
}

app.get('/api/health', async (_request, response) => {
  try {
    response.json({
      ok: true,
      database: await pingDatabase(),
      service: 'mamma-mia-api',
    });
  } catch (error) {
    response.status(500).json({ ok: false, error: error.message });
  }
});

app.post('/api/auth/login', async (request, response) => {
  const { email, password } = request.body;

  if (!email || !password) {
    response.status(400).json({ error: 'E-mail e senha sao obrigatorios.' });
    return;
  }

  const [[user]] = await pool.execute(
    `SELECT id, name, email, phone, role, password_hash
     FROM users
     WHERE email = :email AND is_active = TRUE
     LIMIT 1`,
    { email },
  );

  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    response.status(401).json({ error: 'Credenciais invalidas.' });
    return;
  }

  response.json({
    user: publicUser(user),
    token: signToken(user),
  });
});

app.post('/api/auth/register', async (request, response) => {
  const { name, phone, email, password } = request.body;

  if (!name || !phone || !email || !password) {
    response.status(400).json({ error: 'Dados de cadastro incompletos.' });
    return;
  }

  const passwordHash = bcrypt.hashSync(password, 10);

  try {
    const [result] = await pool.execute(
      `INSERT INTO users (name, email, password_hash, phone, role)
       VALUES (:name, :email, :passwordHash, :phone, 'customer')`,
      { name, email, passwordHash, phone },
    );

    const user = {
      id: result.insertId,
      name,
      phone,
      email,
      role: 'customer',
    };

    response.status(201).json({
      user: publicUser(user),
      token: signToken(user),
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      response.status(409).json({ error: 'E-mail ja cadastrado.' });
      return;
    }
    throw error;
  }
});

app.get('/api/auth/me', requireAuth, async (request, response) => {
  const [[user]] = await pool.execute(
    `SELECT id, name, email, phone, role
     FROM users
     WHERE id = :id AND is_active = TRUE
     LIMIT 1`,
    { id: request.auth.sub },
  );

  if (!user) {
    response.status(404).json({ error: 'Usuario nao encontrado.' });
    return;
  }

  response.json(publicUser(user));
});

app.get('/api/categories', async (_request, response) => {
  const [rows] = await pool.query(
    `SELECT id, name, slug, description
     FROM categories
     WHERE is_active = TRUE
     ORDER BY sort_order, name`,
  );

  response.json(
    rows.map((category) => ({
      id: category.slug,
      rawId: category.id,
      name: category.name,
      description: category.description,
    })),
  );
});

app.post('/api/categories', requireAdmin, async (request, response) => {
  const { name, description = '' } = request.body;
  const slug = String(name || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  if (!name || !slug) {
    response.status(400).json({ error: 'Nome da categoria e obrigatorio.' });
    return;
  }

  const [result] = await pool.execute(
    `INSERT INTO categories (name, slug, description, sort_order)
     VALUES (:name, :slug, :description, 99)`,
    { name, slug, description },
  );

  response.status(201).json({ id: slug, rawId: result.insertId, name, description });
});

app.get('/api/products', async (_request, response) => {
  const [rows] = await pool.query(
    `SELECT *
     FROM vw_catalog
     WHERE is_available = TRUE`,
  );

  response.json(rows.map(toCatalogProduct));
});

app.post('/api/products', requireAdmin, async (request, response) => {
  const {
    categoryId,
    name,
    description,
    image,
    price,
    badge = 'Novo',
    size = 'Grande',
  } = request.body;

  const slug = String(name || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  if (!categoryId || !name || !description || !price) {
    response.status(400).json({ error: 'Produto incompleto.' });
    return;
  }

  const [[category]] = await pool.execute(
    'SELECT id, slug FROM categories WHERE slug = :categoryId OR id = :categoryId LIMIT 1',
    { categoryId },
  );

  if (!category) {
    response.status(404).json({ error: 'Categoria nao encontrada.' });
    return;
  }

  const [result] = await pool.execute(
    `INSERT INTO products
      (category_id, name, slug, description, image_url, price, size, featured_label)
     VALUES
      (:categoryId, :name, :slug, :description, :image, :price, :size, :badge)`,
    {
      categoryId: category.id,
      name,
      slug,
      description,
      image: image || null,
      price,
      size,
      badge,
    },
  );

  response.status(201).json({
    id: result.insertId,
    categoryId: category.slug,
    name,
    description,
    image,
    price: Number(price),
    badge,
    size,
  });
});

app.get('/api/orders', requireAdmin, async (_request, response) => {
  const [rows] = await pool.query(
    `SELECT
       o.*,
       GROUP_CONCAT(CONCAT(oi.quantity, 'x ', oi.product_name) ORDER BY oi.id SEPARATOR ', ') AS items
     FROM orders o
     LEFT JOIN order_items oi ON oi.order_id = o.id
     GROUP BY o.id
     ORDER BY o.created_at DESC`,
  );

  response.json(rows.map(toOrder));
});

app.get('/api/my-orders', requireAuth, async (request, response) => {
  const [rows] = await pool.execute(
    `SELECT
       o.*,
       GROUP_CONCAT(CONCAT(oi.quantity, 'x ', oi.product_name) ORDER BY oi.id SEPARATOR ', ') AS items
     FROM orders o
     LEFT JOIN order_items oi ON oi.order_id = o.id
     WHERE o.user_id = :userId
     GROUP BY o.id
     ORDER BY o.created_at DESC`,
    { userId: request.auth.sub },
  );

  response.json(rows.map(toOrder));
});

app.post('/api/orders', async (request, response) => {
  const { customer, cart, subtotal, deliveryFee, total } = request.body;
  const auth = readAuth(request);

  if (!customer?.name || !customer?.phone || !customer?.address || !cart?.length) {
    response.status(400).json({ error: 'Pedido incompleto.' });
    return;
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [orderResult] = await connection.execute(
      `INSERT INTO orders
        (user_id, customer_name, customer_phone, delivery_address, status, payment_method, subtotal, delivery_fee, total, notes)
       VALUES
        (:userId, :name, :phone, :address, 'received', :paymentMethod, :subtotal, :deliveryFee, :total, :notes)`,
      {
        userId: auth?.sub ? Number(auth.sub) : null,
        name: customer.name,
        phone: customer.phone,
        address: customer.address,
        paymentMethod: customer.paymentMethod || 'pix',
        subtotal,
        deliveryFee,
        total,
        notes: customer.notes || null,
      },
    );

    const orderId = orderResult.insertId;

    for (const item of cart) {
      await connection.execute(
        `INSERT INTO order_items
          (order_id, product_id, product_name, unit_price, quantity, line_total)
         VALUES
          (:orderId, :productId, :productName, :unitPrice, :quantity, :lineTotal)`,
        {
          orderId,
          productId: Number.isInteger(Number(item.id)) ? item.id : null,
          productName: item.name,
          unitPrice: item.price,
          quantity: item.quantity,
          lineTotal: item.price * item.quantity,
        },
      );
    }

    await connection.commit();

    const [[order]] = await pool.execute(
      `SELECT
         o.*,
         GROUP_CONCAT(CONCAT(oi.quantity, 'x ', oi.product_name) ORDER BY oi.id SEPARATOR ', ') AS items
       FROM orders o
       LEFT JOIN order_items oi ON oi.order_id = o.id
       WHERE o.id = :orderId
       GROUP BY o.id`,
      { orderId },
    );

    response.status(201).json(toOrder(order));
  } catch (error) {
    await connection.rollback();
    response.status(500).json({ error: error.message });
  } finally {
    connection.release();
  }
});

app.patch('/api/orders/:id/status', requireAdmin, async (request, response) => {
  const { status } = request.body;
  const allowedStatuses = [
    'received',
    'preparing',
    'out_for_delivery',
    'delivered',
    'cancelled',
  ];

  if (!allowedStatuses.includes(status)) {
    response.status(400).json({ error: 'Status invalido.' });
    return;
  }

  await pool.execute('UPDATE orders SET status = :status WHERE id = :id', {
    status,
    id: request.params.id,
  });

  response.json({ ok: true });
});

app.use((error, _request, response, _next) => {
  response.status(500).json({ error: error.message });
});

app.listen(port, () => {
  console.log(`Mamma Mia API rodando em http://localhost:${port}/api`);
});
