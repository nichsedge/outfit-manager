'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { ClothingItem, Outfit, CustomTag } from '../lib/types';
import * as db from '../lib/db';
import { DEFAULT_ITEMS } from '../lib/seedData';

interface AppState {
  items: ClothingItem[];
  outfits: Outfit[];
  tags: CustomTag[];
  loading: boolean;
  refreshItems: () => Promise<void>;
  refreshOutfits: () => Promise<void>;
  refreshTags: () => Promise<void>;
  addItem: (item: ClothingItem) => Promise<void>;
  updateItem: (item: ClothingItem) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  addOutfit: (outfit: Outfit) => Promise<void>;
  updateOutfit: (outfit: Outfit) => Promise<void>;
  deleteOutfit: (id: string) => Promise<void>;
  addTag: (tag: CustomTag) => Promise<void>;
  updateTag: (tag: CustomTag, oldLabel: string) => Promise<void>;
  deleteTag: (id: string, label: string) => Promise<void>;
  restoreBackup: (items: ClothingItem[], outfits: Outfit[], tags?: CustomTag[]) => Promise<void>;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ClothingItem[]>([]);
  const [outfits, setOutfits] = useState<Outfit[]>([]);
  const [tags, setTags] = useState<CustomTag[]>([]);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  const refreshItems = useCallback(async () => {
    const all = await db.getAllItems();
    setItems(all.sort((a, b) => b.createdAt - a.createdAt));
  }, []);

  const refreshOutfits = useCallback(async () => {
    const all = await db.getAllOutfits();
    setOutfits(all.sort((a, b) => b.createdAt - a.createdAt));
  }, []);

  const refreshTags = useCallback(async () => {
    const all = await db.getAllTags();
    setTags(all.sort((a, b) => a.label.localeCompare(b.label)));
  }, []);

  useEffect(() => {
    const init = async () => {
      // Theme init
      const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
      if (savedTheme) {
        setTheme(savedTheme);
        document.documentElement.dataset.theme = savedTheme;
      } else {
        document.documentElement.dataset.theme = 'dark';
      }

      const existing = await db.getAllItems();
      if (existing.length === 0) {
        // Seed default wardrobe items on first launch
        await Promise.all(DEFAULT_ITEMS.map(item => db.addItem(item)));
      }
      await db.seedTagsIfEmpty();
      await Promise.all([refreshItems(), refreshOutfits(), refreshTags()]);
      setLoading(false);
    };
    init();
  }, [refreshItems, refreshOutfits]);

  const toggleTheme = useCallback(() => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('theme', next);
    document.documentElement.dataset.theme = next;
  }, [theme]);

  const addItem = useCallback(async (item: ClothingItem) => {
    await db.addItem(item);
    await refreshItems();
  }, [refreshItems]);

  const updateItem = useCallback(async (item: ClothingItem) => {
    await db.updateItem(item);
    await refreshItems();
  }, [refreshItems]);

  const deleteItem = useCallback(async (id: string) => {
    await db.deleteItem(id);
    await refreshItems();
  }, [refreshItems]);

  const addOutfit = useCallback(async (outfit: Outfit) => {
    await db.addOutfit(outfit);
    await refreshOutfits();
  }, [refreshOutfits]);

  const updateOutfit = useCallback(async (outfit: Outfit) => {
    await db.updateOutfit(outfit);
    await refreshOutfits();
  }, [refreshOutfits]);

  const deleteOutfit = useCallback(async (id: string) => {
    await db.deleteOutfit(id);
    await refreshOutfits();
  }, [refreshOutfits]);

  const addTag = useCallback(async (tag: CustomTag) => {
    await db.addTag(tag);
    await refreshTags();
  }, [refreshTags]);

  const updateTag = useCallback(async (updatedTag: CustomTag, oldLabel: string) => {
    await db.updateTag(updatedTag);
    // Renaming a tag: Update all items that had the old label
    const itemsToUpdate = items.filter(item => item.tags.includes(oldLabel));
    for (const item of itemsToUpdate) {
      await db.updateItem({
        ...item,
        tags: item.tags.map(t => t === oldLabel ? updatedTag.label : t)
      });
    }
    await refreshTags();
    await refreshItems();
  }, [items, refreshTags, refreshItems]);

  const deleteTag = useCallback(async (id: string, label: string) => {
    await db.deleteTag(id);
    // Deleting a tag: Remove the label from all items that had it
    const itemsToUpdate = items.filter(item => item.tags.includes(label));
    for (const item of itemsToUpdate) {
      await db.updateItem({
        ...item,
        tags: item.tags.filter(t => t !== label)
      });
    }
    await refreshTags();
    await refreshItems();
  }, [items, refreshTags, refreshItems]);

  const restoreBackup = useCallback(async (newItems: ClothingItem[], newOutfits: Outfit[], newTags?: CustomTag[]) => {
    await db.restoreFromBackup(newItems, newOutfits, newTags);
    await refreshItems();
    await refreshOutfits();
    await refreshTags();
  }, [refreshItems, refreshOutfits, refreshTags]);

  return (
    <AppContext.Provider value={{
      items, outfits, tags, loading,
      refreshItems, refreshOutfits, refreshTags,
      addItem, updateItem, deleteItem,
      addOutfit, updateOutfit, deleteOutfit,
      addTag, updateTag, deleteTag,
      restoreBackup,
      theme,
      toggleTheme,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
