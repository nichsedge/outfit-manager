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
  const [activeStatus, setActiveStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<ClothingItem | null>(null);
  
  // Batch Selection
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const { updateItem } = useApp();

  const filtered = items.filter(i => {
    const matchCat = activeCategory === 'all' || i.category === activeCategory;
    const matchTag = activeTag === 'all' || i.tags.includes(activeTag);
    const matchStatus = activeStatus === 'all' || i.status === activeStatus;
    const matchSearch = !searchQuery || 
      i.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.material?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchCat && matchTag && matchStatus && matchSearch;
  });

  const toggleSelection = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const handleBatchStatus = async (status: ClothingItem['status']) => {
    const itemsToUpdate = items.filter(i => selectedIds.has(i.id));
    await Promise.all(itemsToUpdate.map(i => updateItem({ ...i, status })));
    setSelectionMode(false);
    setSelectedIds(new Set());
  };

  const handleBatchTag = async (tag: string) => {
    const itemsToUpdate = items.filter(i => selectedIds.has(i.id));
    await Promise.all(itemsToUpdate.map(i => {
      if (i.tags.includes(tag)) return Promise.resolve();
      return updateItem({ ...i, tags: [...i.tags, tag] });
    }));
    setSelectionMode(false);
    setSelectedIds(new Set());
  };

  return (
    <div className="page-content">
      {/* Header with Search and Toggle */}
      <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <h2 className="section-title">Wardrobe</h2>
          <span className="section-count">{items.length}</span>
        </div>
        <button 
          className={`btn ${selectionMode ? 'btn-primary' : 'btn-ghost'}`} 
          style={{ padding: '4px 12px', fontSize: 13, height: 'auto', minHeight: 'auto' }}
          onClick={() => {
            setSelectionMode(!selectionMode);
            setSelectedIds(new Set());
          }}
        >
          {selectionMode ? 'Done' : 'Select'}
        </button>
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

      <div className="filter-bar">
        <button
          id="filter-status-all"
          className={`filter-chip ${activeStatus === 'all' ? 'active' : ''}`}
          onClick={() => setActiveStatus('all')}
        >
          ✨ All Status
        </button>
        <button
          id="filter-status-ready"
          className={`filter-chip ${activeStatus === 'ready' ? 'active' : ''}`}
          onClick={() => setActiveStatus('ready')}
        >
          ✅ Ready
        </button>
        <button
          id="filter-status-dirty"
          className={`filter-chip ${activeStatus === 'dirty' ? 'active' : ''}`}
          onClick={() => setActiveStatus('dirty')}
        >
          🧺 Dirty
        </button>
        <button
          id="filter-status-cleaning"
          className={`filter-chip ${activeStatus === 'cleaning' ? 'active' : ''}`}
          onClick={() => setActiveStatus('cleaning')}
        >
          🧼 Cleaning
        </button>
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
        <>
          <div className="item-grid animate-in">
            {filtered.map(item => (
              <ItemCard
                key={item.id}
                item={item}
                onClick={() => selectionMode ? toggleSelection(item.id) : setSelectedItem(item)}
                selectable={selectionMode}
                selected={selectedIds.has(item.id)}
                onSelect={() => toggleSelection(item.id)}
              />
            ))}
          </div>

          {selectionMode && selectedIds.size > 0 && (
            <div className="batch-actions-bar animate-slide-up">
              <div style={{ fontSize: 13, fontWeight: 700, color: 'white', marginBottom: 'var(--space-2)' }}>
                {selectedIds.size} items selected
              </div>
              <div style={{ display: 'flex', gap: 'var(--space-2)', overflowX: 'auto', paddingBottom: 4 }}>
                <button className="btn btn-ghost" style={{ background: 'rgba(34, 197, 94, 0.2)', color: '#22c55e', fontSize: 11, border: 'none' }} onClick={() => handleBatchStatus('ready')}>✅ Set Ready</button>
                <button className="btn btn-ghost" style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', fontSize: 11, border: 'none' }} onClick={() => handleBatchStatus('dirty')}>🧺 Set Dirty</button>
                {tags.slice(0, 5).map(tag => (
                  <button key={tag.id} className="btn btn-ghost" style={{ background: 'rgba(255,255,255,0.1)', fontSize: 11, border: 'none' }} onClick={() => handleBatchTag(tag.label)}>🏷️ +{tag.label}</button>
                ))}
              </div>
            </div>
          )}
        </>
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
