export type Category = 'top' | 'bottom' | 'shoes' | 'outerwear' | 'accessory' | 'bag';

export type Tag = 'casual' | 'formal' | 'gym' | 'party' | 'work' | 'streetwear' | 'beach' | 'date';

export interface ClothingItem {
  id: string;
  name: string;
  category: Category;
  color: string;
  tags: Tag[];
  images: string[]; // array of base64 data URLs
  createdAt: number;
  lastWornAt?: number; // legacy, keeping for compatibility during migration
  wearLogs?: number[]; // array of timestamps when worn
}

export interface Outfit {
  id: string;
  name: string;
  note: string;
  itemIds: string[];
  createdAt: number;
  lastWornAt?: number; // legacy
  wearLogs?: number[];
}

export type ActiveTab = 'wardrobe' | 'outfits' | 'calendar' | 'add';

export const CATEGORIES: { value: Category; label: string; emoji: string }[] = [
  { value: 'top', label: 'Top', emoji: '👕' },
  { value: 'bottom', label: 'Bottom', emoji: '👖' },
  { value: 'shoes', label: 'Shoes', emoji: '👟' },
  { value: 'outerwear', label: 'Outerwear', emoji: '🧥' },
  { value: 'accessory', label: 'Accessory', emoji: '⌚' },
  { value: 'bag', label: 'Bag', emoji: '👜' },
];

export const TAGS: { value: Tag; label: string }[] = [
  { value: 'casual', label: 'Casual' },
  { value: 'formal', label: 'Formal' },
  { value: 'gym', label: 'Gym' },
  { value: 'party', label: 'Party' },
  { value: 'work', label: 'Work' },
  { value: 'streetwear', label: 'Streetwear' },
  { value: 'beach', label: 'Beach' },
  { value: 'date', label: 'Date Night' },
];

export const COLORS = [
  { value: '#1a1a1a', label: 'Black' },
  { value: '#f5f5f5', label: 'White' },
  { value: '#6b7280', label: 'Gray' },
  { value: '#dc2626', label: 'Red' },
  { value: '#2563eb', label: 'Blue' },
  { value: '#16a34a', label: 'Green' },
  { value: '#ca8a04', label: 'Yellow' },
  { value: '#9333ea', label: 'Purple' },
  { value: '#ea580c', label: 'Orange' },
  { value: '#db2777', label: 'Pink' },
  { value: '#854d0e', label: 'Brown' },
  { value: '#0e7490', label: 'Teal' },
  { value: '#1d4ed8', label: 'Navy' },
  { value: '#d4a373', label: 'Beige' },
];
