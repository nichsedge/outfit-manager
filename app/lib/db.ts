import { openDB, IDBPDatabase } from 'idb';
import { ClothingItem, Outfit, CustomTag, DEFAULT_TAG_NAMES } from './types';
import { v4 as uuidv4 } from 'uuid';

const DB_NAME = 'outfit-manager';
const DB_VERSION = 2;

type OutfitManagerDB = {
  items: {
    key: string;
    value: ClothingItem;
    indexes: { byCategory: string; byCreatedAt: number };
  };
  outfits: {
    key: string;
    value: Outfit;
    indexes: { byCreatedAt: number };
  };
  tags: {
    key: string;
    value: CustomTag;
  };
};

let dbPromise: Promise<IDBPDatabase<OutfitManagerDB>> | null = null;

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB<OutfitManagerDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('items')) {
          const itemStore = db.createObjectStore('items', { keyPath: 'id' });
          itemStore.createIndex('byCategory', 'category');
          itemStore.createIndex('byCreatedAt', 'createdAt');
        }
        if (!db.objectStoreNames.contains('outfits')) {
          const outfitStore = db.createObjectStore('outfits', { keyPath: 'id' });
          outfitStore.createIndex('byCreatedAt', 'createdAt');
        }
        if (!db.objectStoreNames.contains('tags')) {
          db.createObjectStore('tags', { keyPath: 'id' });
        }
      },
    });
  }
  return dbPromise;
}

export async function seedTagsIfEmpty(): Promise<void> {
  const db = await getDB();
  const existing = await db.getAll('tags');
  if (existing.length === 0) {
    const tx = db.transaction('tags', 'readwrite');
    const store = tx.objectStore('tags');
    for (const name of DEFAULT_TAG_NAMES) {
      await store.add({ id: uuidv4(), label: name });
    }
    await tx.done;
  }
}

// Items
function migrateItem(raw: any): ClothingItem {
  if (raw && typeof raw.imageData === 'string') {
    raw.images = raw.imageData ? [raw.imageData] : [];
    delete raw.imageData;
  }
  if (raw && raw.lastWornAt && !raw.wearLogs) {
    raw.wearLogs = [raw.lastWornAt];
  }
  return raw as ClothingItem;
}

function migrateOutfit(raw: any): Outfit {
  if (raw && raw.lastWornAt && !raw.wearLogs) {
    raw.wearLogs = [raw.lastWornAt];
  }
  return raw as Outfit;
}

export async function getAllItems(): Promise<ClothingItem[]> {
  const db = await getDB();
  const rawItems = await db.getAll('items');
  return rawItems.map(migrateItem);
}

export async function getItem(id: string): Promise<ClothingItem | undefined> {
  const db = await getDB();
  const rawItem = await db.get('items', id);
  return rawItem ? migrateItem(rawItem) : undefined;
}

export async function addItem(item: ClothingItem): Promise<void> {
  const db = await getDB();
  await db.add('items', item);
}

export async function updateItem(item: ClothingItem): Promise<void> {
  const db = await getDB();
  await db.put('items', item);
}

export async function deleteItem(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('items', id);
}

// Outfits
export async function getAllOutfits(): Promise<Outfit[]> {
  const db = await getDB();
  const rawOutfits = await db.getAll('outfits');
  return rawOutfits.map(migrateOutfit);
}

export async function getOutfit(id: string): Promise<Outfit | undefined> {
  const db = await getDB();
  const rawOutfit = await db.get('outfits', id);
  return rawOutfit ? migrateOutfit(rawOutfit) : undefined;
}

export async function addOutfit(outfit: Outfit): Promise<void> {
  const db = await getDB();
  await db.add('outfits', outfit);
}

export async function updateOutfit(outfit: Outfit): Promise<void> {
  const db = await getDB();
  await db.put('outfits', outfit);
}

export async function deleteOutfit(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('outfits', id);
}

// Tags
export async function getAllTags(): Promise<CustomTag[]> {
  const db = await getDB();
  return db.getAll('tags');
}

export async function addTag(tag: CustomTag): Promise<void> {
  const db = await getDB();
  await db.add('tags', tag);
}

export async function updateTag(tag: CustomTag): Promise<void> {
  const db = await getDB();
  await db.put('tags', tag);
}

export async function deleteTag(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('tags', id);
}

// Backup & Restore
export async function restoreFromBackup(items: ClothingItem[], outfits: Outfit[], tags?: CustomTag[]): Promise<void> {
  const db = await getDB();
  const storeNames: Array<"items" | "outfits" | "tags"> = ['items', 'outfits', 'tags'];
  const tx = db.transaction(storeNames, 'readwrite');
  
  // 1. Clear existing data
  await tx.objectStore('items').clear();
  await tx.objectStore('outfits').clear();
  
  // 2. Add new data from backup
  const itemStore = tx.objectStore('items');
  for (const item of items) {
    await itemStore.add(item);
  }
  
  const outfitStore = tx.objectStore('outfits');
  for (const outfit of outfits) {
    await outfitStore.add(outfit);
  }

  if (tags) {
    const tagStore = tx.objectStore('tags');
    await tagStore.clear();
    for (const tag of tags) {
      await tagStore.add(tag);
    }
  }
  
  await tx.done;
}
