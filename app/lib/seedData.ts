import { v4 as uuidv4 } from 'uuid';
import { ClothingItem } from './types';

// Color map inferred from Indonesian item names
const colorMap: Record<string, string> = {
  hitam: '#1a1a1a',
  navy: '#1d4ed8',
  biru: '#2563eb',
  coklat: '#854d0e',
  putih: '#f5f5f5',
  abu: '#6b7280',
  cream: '#d4a373',
  mocca: '#854d0e',
  merah: '#dc2626',
  hijau: '#16a34a',
  kuning: '#ca8a04',
};

function inferColor(name: string): string {
  const lower = name.toLowerCase();
  for (const [keyword, hex] of Object.entries(colorMap)) {
    if (lower.includes(keyword)) return hex;
  }
  return '#6b7280'; // default gray
}

const now = Date.now();

export const DEFAULT_ITEMS: ClothingItem[] = [
  // Outerwear
  { id: uuidv4(), name: 'Jaket Hitam',  category: 'outerwear', color: inferColor('Jaket Hitam'),  tags: ['Casual'],    images: [], createdAt: now - 11 },
  { id: uuidv4(), name: 'Jaket Navy',   category: 'outerwear', color: inferColor('Jaket Navy'),   tags: ['Casual'],    images: [], createdAt: now - 10 },
  { id: uuidv4(), name: 'Flannel Biru', category: 'outerwear', color: inferColor('Flannel Biru'), tags: ['Casual', 'Streetwear'], images: [], createdAt: now - 9 },

  // Tops
  { id: uuidv4(), name: 'Henley Coklat',   category: 'top', color: inferColor('Henley Coklat'),   tags: ['Casual'],    images: [], createdAt: now - 8 },
  { id: uuidv4(), name: 'Henley Biru',     category: 'top', color: inferColor('Henley Biru'),     tags: ['Casual'],    images: [], createdAt: now - 7 },
  { id: uuidv4(), name: 'Kaos Putih Misty',category: 'top', color: inferColor('Kaos Putih Misty'),tags: ['Casual'],    images: [], createdAt: now - 6 },
  { id: uuidv4(), name: 'Kaos Abu Misty',  category: 'top', color: inferColor('Kaos Abu Misty'),  tags: ['Casual'],    images: [], createdAt: now - 5 },

  // Bottoms
  { id: uuidv4(), name: 'Cino Cream', category: 'bottom', color: inferColor('Cino Cream'), tags: ['Casual', 'Formal'], images: [], createdAt: now - 4 },
  { id: uuidv4(), name: 'Cino Hitam', category: 'bottom', color: inferColor('Cino Hitam'), tags: ['Casual', 'Formal'], images: [], createdAt: now - 3 },
  { id: uuidv4(), name: 'Cino Abu',   category: 'bottom', color: inferColor('Cino Abu'),   tags: ['Casual'],           images: [], createdAt: now - 2 },
  { id: uuidv4(), name: 'Cino Mocca', category: 'bottom', color: inferColor('Cino Mocca'), tags: ['Casual'],           images: [], createdAt: now - 1 },
];
