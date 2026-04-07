'use client';

import { useState } from 'react';
import { useApp } from './AppProvider';
import { CATEGORIES, Category } from '../lib/types';
import ItemCard from './ItemCard';
import ItemDetailModal from './ItemDetailModal';
import InsightsSection from './InsightsSection';
import { ClothingItem } from '../lib/types';

export default function WardrobeView() {
  const { items, tags } = useApp();
  const [activeCategory, setActiveCategory] = useState<Category | 'all'>('all');
  const [activeTag, setActiveTag] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<ClothingItem | null>(null);

  const filtered = items.filter(i => {
    const matchCat = activeCategory === 'all' || i.category === activeCategory;
    const matchTag = activeTag === 'all' || i.tags.includes(activeTag);
    const matchSearch = !searchQuery || 
      i.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchCat && matchTag && matchSearch;
  });

  return (
    <div className="page-content">
      {/* Header with Search and Toggle */}
      <div className="section-header">
        <h2 className="section-title">Wardrobe</h2>
        <span className="section-count">{items.length}</span>
      </div>



      {/* Search Bar */}
      <div className="search-container animate-in">
        <span className="search-icon">🔍</span>
        <input
          type="text"
          className="search-input"
          placeholder="Search items or tags..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <button 
            onClick={() => setSearchQuery('')}
            style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 18 }}
          >
            ×
          </button>
        )}
      </div>

      {/* Stats Mini Bar (Only if not showing full insights) */}
      {items.length > 0 && (
        <div className="stats-row animate-in" style={{ display: searchQuery ? 'none' : 'flex' }}>
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
      <div className="filter-bar" style={{ marginBottom: 'var(--space-2)' }}>
        <button
          id="filter-cat-all"
          className={`filter-chip ${activeCategory === 'all' ? 'active' : ''}`}
          onClick={() => setActiveCategory('all')}
        >
          All
        </button>
        {CATEGORIES.map(cat => (
          <button
            id={`filter-cat-${cat.value}`}
            key={cat.value}
            className={`filter-chip ${activeCategory === cat.value ? 'active' : ''}`}
            onClick={() => setActiveCategory(cat.value)}
          >
            {cat.emoji} {cat.label}
          </button>
        ))}
      </div>
      
      <div className="filter-bar">
        <button
          id="filter-tag-all"
          className={`filter-chip ${activeTag === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTag('all')}
        >
          🏷️ All Styles
        </button>
        {tags.map(tag => (
          <button
            id={`filter-tag-${tag.id}`}
            key={tag.id}
            className={`filter-chip ${activeTag === tag.label ? 'active' : ''}`}
            onClick={() => setActiveTag(tag.label)}
          >
            {tag.label}
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
          <div className="empty-state__title">No items found</div>
          <div className="empty-state__desc">
            {searchQuery ? `No results for "${searchQuery}"` : `No ${activeCategory}s matching your filters`}
          </div>
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
          item={items.find(i => i.id === selectedItem.id) || selectedItem}
          onClose={() => setSelectedItem(null)}
        />
      )}
    </div>
  );
}
