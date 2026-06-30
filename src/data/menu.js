export const categories = [
  { id: 'classicas', name: 'Classicas' },
  { id: 'especiais', name: 'Especiais' },
  { id: 'doces', name: 'Doces' },
  { id: 'bebidas', name: 'Bebidas' },
];

export const products = [
  {
    id: 1,
    categoryId: 'classicas',
    name: 'Margherita',
    description: 'Molho artesanal, mozzarella, tomate fresco e manjericao.',
    price: 49.9,
    image:
      'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=900&q=80',
    badge: 'Mais pedida',
  },
  {
    id: 2,
    categoryId: 'classicas',
    name: 'Calabresa',
    description: 'Calabresa fatiada, cebola roxa, azeitonas e oregano.',
    price: 52.9,
    image:
      'https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=900&q=80',
    badge: 'Tradicional',
  },
  {
    id: 3,
    categoryId: 'especiais',
    name: 'Parma & Rucula',
    description: 'Presunto parma, rucula, parmesao, tomate confit e azeite.',
    price: 68.9,
    image:
      'https://images.unsplash.com/photo-1601924582970-9238bcb495d9?auto=format&fit=crop&w=900&q=80',
    badge: 'Chef',
  },
  {
    id: 4,
    categoryId: 'especiais',
    name: 'Quattro Formaggi',
    description: 'Mozzarella, gorgonzola, parmesao, provolone e mel trufado.',
    price: 64.9,
    image:
      'https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?auto=format&fit=crop&w=900&q=80',
    badge: 'Cremosa',
  },
  {
    id: 5,
    categoryId: 'doces',
    name: 'Chocolate com Morango',
    description: 'Creme de chocolate, morangos frescos e raspas de chocolate.',
    price: 46.9,
    image:
      'https://images.unsplash.com/photo-1613564834361-9436948817d1?auto=format&fit=crop&w=900&q=80',
    badge: 'Doce',
  },
  {
    id: 6,
    categoryId: 'bebidas',
    name: 'Refrigerante Artesanal',
    description: 'Garrafa 500ml nos sabores limao siciliano ou cola natural.',
    price: 12.9,
    image:
      'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=900&q=80',
    badge: 'Gelado',
  },
];
