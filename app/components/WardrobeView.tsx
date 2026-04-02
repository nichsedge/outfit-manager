'use client';

import { useState } from 'react';
import { useApp } from './AppProvider';
import { CATEGORIES, Category } from '../lib/types';
import ItemCard from './ItemCard';
import ItemDetailModal from './ItemDetailModal';
import { ClothingItem } from '../lib/types';

export default function WardrobeView() {
  const { items } = useApp();
  const [activeCategory, setActiveCategory] = useState<Category | 'all'>('all');
  const [selectedItem, setSelectedItem] = useState<ClothingItem | null>(null);

  const filtered = activeCategory === 'all'
    ? items
    : items.filter(i => i.category === activeCategory);

  return (
    <div className="page-content">
      {/* Stats */}
      {items.length > 0 && (
        <div className="stats-row animate-in">
          <div className="stat-card">
            <span className="stat-card__value">{items.length}</span>
            <span className="stat-card__label">Items</span>
          </div>
          <div className="stat-card">
            <span className="stat-card__value">
              {new Set(items.map(i => i.category)).size}
            </span>
            <span className="stat-card__label">Categories</span>
          </div>
          <div className="stat-card">
            <span className="stat-card__value">
              {new Set(items.flatMap(i => i.tags)).size}
            </span>
            <span className="stat-card__label">Styles</span>
          </div>
        </div>
      )}

      {/* Filter */}
      <div className="filter-bar">
        <button
          id="filter-all"
          className={`filter-chip ${activeCategory === 'all' ? 'active' : ''}`}
          onClick={() => setActiveCategory('all')}
        >
          All
        </button>
        {CATEGORIES.map(cat => (
          <button
            id={`filter-${cat.value}`}
            key={cat.value}
            className={`filter-chip ${activeCategory === cat.value ? 'active' : ''}`}
            onClick={() => setActiveCategory(cat.value)}
          >
            {cat.emoji} {cat.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      {items.length === 0 ? (
        <div className="empty-state animate-in">
          <div className="empty-state__emoji">🧥</div>
          <div className="empty-state__title">Your wardrobe is empty</div>
          <div className="empty-state__desc">
            Tap the <strong style={{ color: 'var(--accent)' }}>+</strong> button to add your first clothing item
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state animate-in">
          <div className="empty-state__emoji">🔍</div>
          <div className="empty-state__title">No items here</div>
          <div className="empty-state__desc">No {activeCategory}s in your wardrobe yet</div>
        </div>
      ) : (
        <div className="item-grid animate-in">
          {filtered.map(item => (
            <ItemCard
              key={item.id}
              item={item}
              onClick={() => setSelectedItem(item)}
            />
          ))}
        </div>
      )}

      {/* Item Detail Modal */}
      {selectedItem && (
        <ItemDetailModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
        />
      )}
    </div>
  );
}
