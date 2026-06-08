import { Product, Banner } from './types';

export const INITIAL_BANNERS: Banner[] = [
  {
    id: '1',
    title: 'LANÇAMENTO: NOVAS SELEÇÕES 2026',
    subtitle: 'Garanta a Amarelinha Oficial e o Manto de três estrelas Argentino com Frete Grátis acima de R$ 299!',
    image: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=1920&auto=format&fit=crop',
    buttonText: 'Ver Lançamentos',
    active: true
  },
  {
    id: '2',
    title: 'RETRO LEGENDS COLLECTION',
    subtitle: 'Vista a glória do futebol clássico com reedições icônicas dos anos 90 e 2000. Descontos de até 20%!',
    image: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=1920&auto=format&fit=crop',
    buttonText: 'Comprar Retrô',
    active: true
  }
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Camisa Flamengo Home 2024',
    team: 'Flamengo',
    league: 'Brasileirão',
    price: 349.90,
    image: 'https://images.unsplash.com/photo-1620127252536-03bdfcf6d5c3?q=80&w=800&auto=format&fit=crop',
    description: 'A nova camisa do Mengão para a temporada 2024. Tecnologia de ponta e tradição rubro-negra.',
    category: 'Home',
    sizes: ['P', 'M', 'G', 'GG'],
    sizeStock: { 'P': 10, 'M': 15, 'G': 15, 'GG': 10 },
    stock: 50,
    active: true
  },
  {
    id: '2',
    name: 'Camisa Real Madrid Home 24/25',
    team: 'Real Madrid',
    league: 'La Liga',
    price: 499.90,
    image: 'https://images.unsplash.com/photo-1599408162449-366553896683?q=80&w=800&auto=format&fit=crop',
    description: 'A clássica branca merengue. Elegância e história em cada detalhe.',
    category: 'Home',
    sizes: ['M', 'G', 'GG'],
    sizeStock: { 'M': 10, 'G': 10, 'GG': 10 },
    stock: 30,
    active: true
  },
  {
    id: '3',
    name: 'Camisa Brasil Home 2024',
    team: 'Seleção Brasileira',
    league: 'Internacional',
    price: 399.90,
    image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=800&auto=format&fit=crop',
    description: 'A amarelinha mais famosa do mundo. Sinta a energia do penta.',
    category: 'Home',
    sizes: ['P', 'M', 'G'],
    sizeStock: { 'P': 30, 'M': 40, 'G': 30 },
    stock: 100,
    active: true
  },
  {
    id: '4',
    name: 'Camisa Manchester City Away 24/25',
    team: 'Manchester City',
    league: 'Premier League',
    price: 449.90,
    image: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?q=80&w=800&auto=format&fit=crop',
    description: 'Design moderno para os atuais campeões da Inglaterra.',
    category: 'Away',
    sizes: ['P', 'M', 'G', 'GG'],
    sizeStock: { 'P': 5, 'M': 10, 'G': 5, 'GG': 5 },
    stock: 25,
    active: true
  }
];
