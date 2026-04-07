'use client';

import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useApp } from './AppProvider';
import { ClothingItem, CATEGORIES, Category, Outfit } from '../lib/types';
import ItemCard from './ItemCard';
import Toast from './Toast';

interface Props {
  initialOutfit?: Outfit | null;
  onClose: () => void;
}

export default function OutfitBuilderModal({ initialOutfit, onClose }: Props) {
  const { items, addOutfit, updateOutfit } = useApp();
  const [selectedIds, setSelectedIds] = useState<string[]>(initialOutfit ? initialOutfit.itemIds : []);
  const [name, setName] = useState(initialOutfit ? initialOutfit.name : '');
  const [note, setNote] = useState(initialOutfit ? initialOutfit.note : '');
  const [filterCat, setFilterCat] = useState<Category | 'all'>('all');
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');

  const toggleItem = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const filteredItems = items.filter(i => {
    const isCatMatch = filterCat === 'all' || i.category === filterCat;
    const isReady = i.status === 'ready';
    const isAlreadySelected = selectedIds.includes(i.id);
    return isCatMatch && (isReady || isAlreadySelected);
  });

  const selectedItems = selectedIds
    .map(id => items.find(i => i.id === id))
    .filter(Boolean) as ClothingItem[];

  const handleSave = async () => {
    if (selectedIds.length < 2) return;
    setSaving(true);
    
    if (initialOutfit) {
      await updateOutfit({
        ...initialOutfit,
        name: name.trim() || `Outfit ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
        note: note.trim(),
        itemIds: selectedIds,
      });
      setToast('✓ Outfit updated!');
    } else {
      await addOutfit({
        id: uuidv4(),
        name: name.trim() || `Outfit ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
        note: note.trim(),
        itemIds: selectedIds,
        createdAt: Date.now(),
      });
      setToast('✓ Outfit saved!');
    }
    
    setTimeout(onClose, 800);
  };

  return (
    <>
      <div className="modal-overlay" onClick={onClose}>
        <div
          className="modal-sheet"
          style={{ maxHeight: '92dvh' }}
          onClick={e => e.stopPropagation()}
        >
          <div className="modal-header">
            <span className="modal-title">{initialOutfit ? 'Edit Outfit' : 'Build Outfit'}</span>
            <button id="builder-close" className="modal-close" onClick={onClose}>✕</button>
          </div>

          <div className="modal-body">
            {/* Selected preview */}
            {selectedItems.length > 0 && (
              <div style={{ marginBottom: 'var(--space-5)' }}>
                <div className="build-section__header">Selected ({selectedItems.length})</div>
                <div className="selected-items-preview">
                  {selectedItems.map(item => {
                    const cat = CATEGORIES.find(c => c.value === item.category);
                    return item.images && item.images.length > 0 ? (
                      <img
                        key={item.id}
                        src={item.images[0]}
                        alt={item.name}
                        className="selected-item-thumb"
                      />
                    ) : (
                      <div key={item.id} className="selected-item-thumb--placeholder">
                        {cat?.emoji}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Category filter */}
            <div className="filter-bar" style={{ marginBottom: 'var(--space-4)' }}>
              <button
                id="builder-filter-all"
                className={`filter-chip ${filterCat === 'all' ? 'active' : ''}`}
                onClick={() => setFilterCat('all')}
              >
                All
              </button>
              {CATEGORIES.map(cat => (
                <button
                  id={`builder-filter-${cat.value}`}
                  key={cat.value}
                  className={`filter-chip ${filterCat === cat.value ? 'active' : ''}`}
                  onClick={() => setFilterCat(cat.value)}
                >
                  {cat.emoji} {cat.label}
                </button>
              ))}
            </div>

            {/* Item grid */}
            <div className="item-grid" style={{ marginBottom: 'var(--space-5)' }}>
              {filteredItems.map(item => (
                <ItemCard
                  key={item.id}
                  item={item}
                  selected={selectedIds.includes(item.id)}
                  selectable
                  onSelect={() => toggleItem(item.id)}
                />
              ))}
            </div>

            {/* Outfit details */}
            <div className="divider" />

            <div className="form-group">
              <label className="form-label" htmlFor="outfit-name">Outfit Name</label>
              <input
                id="outfit-name"
                className="form-input"
                type="text"
                placeholder="e.g. Date Night, Office Monday…"
                value={name}
                onChange={e => setName(e.target.value)}
                maxLength={50}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="outfit-note">Notes <span style={{ color: 'var(--text-muted)' }}>(optional)</span></label>
              <textarea
                id="outfit-note"
                className="form-input form-textarea"
                placeholder="Occasion, weather, mood…"
                value={note}
                onChange={e => setNote(e.target.value)}
                maxLength={200}
              />
            </div>

            <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
              <button id="builder-cancel" className="btn btn-ghost" onClick={onClose} style={{ flex: 1 }}>
                Cancel
              </button>
              <button
                id="btn-save-outfit"
                className="btn btn-primary"
                style={{ flex: 2 }}
                onClick={handleSave}
                disabled={selectedIds.length < 2 || saving}
              >
                {saving ? 'Saving…' : `Save Outfit (${selectedIds.length})`}
              </button>
            </div>
          </div>
        </div>
      </div>
      {toast && <Toast message={toast} onDone={() => setToast('')} />}
    </>
  );
}
