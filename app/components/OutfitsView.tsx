'use client';

import { useState } from 'react';
import { useApp } from './AppProvider';
import { Outfit, ClothingItem, CATEGORIES } from '../lib/types';
import OutfitCard from './OutfitCard';
import OutfitBuilderModal from './OutfitBuilderModal';
import OutfitDetailModal from './OutfitDetailModal';

export default function OutfitsView() {
  const { outfits, items } = useApp();
  const [buildingOutfit, setBuildingOutfit] = useState(false);
  const [selectedOutfit, setSelectedOutfit] = useState<Outfit | null>(null);

  // Quick suggestion: one from each main category
  const getSuggestion = () => {
    const top = items.filter(i => i.category === 'top')[0];
    const bottom = items.filter(i => i.category === 'bottom')[0];
    const shoes = items.filter(i => i.category === 'shoes')[0];
    return [top, bottom, shoes].filter(Boolean) as ClothingItem[];
  };

  const suggestion = getSuggestion();

  return (
    <div className="page-content">
      {/* Build Button */}
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <button
          id="btn-build-outfit"
          className="btn btn-primary btn-full"
          onClick={() => setBuildingOutfit(true)}
          disabled={items.length < 2}
        >
          ✨ Build New Outfit
        </button>
        {items.length < 2 && (
          <p style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', marginTop: 8 }}>
            Add at least 2 items to your wardrobe first
          </p>
        )}
      </div>

      {/* Quick Suggestion */}
      {suggestion.length >= 2 && outfits.length === 0 && (
        <div style={{
          background: 'var(--accent-subtle)',
          border: '1px solid var(--accent)',
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--space-4)',
          marginBottom: 'var(--space-6)',
        }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent)', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: 'var(--space-3)' }}>
            💡 Suggested for today
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-3)' }}>
            {suggestion.map(item => {
              const cat = CATEGORIES.find(c => c.value === item.category);
              return item.images && item.images.length > 0 ? (
                <img
                  key={item.id}
                  src={item.images[0]}
                  alt={item.name}
                  style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 12, flex: 1, maxWidth: 80 }}
                />
              ) : (
                <div key={item.id} style={{
                  width: 64, height: 64, background: 'var(--bg-3)', borderRadius: 12,
                  display: 'grid', placeItems: 'center', fontSize: 28, flex: 1, maxWidth: 80
                }}>
                  {cat?.emoji}
                </div>
              );
            })}
          </div>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            {suggestion.map(i => i.name).join(' + ')}
          </p>
        </div>
      )}

      {/* Outfits List */}
      <div className="section-header">
        <span className="section-title">Saved Outfits</span>
        <span className="section-count">{outfits.length}</span>
      </div>

      {outfits.length === 0 ? (
        <div className="empty-state animate-in">
          <div className="empty-state__emoji">✨</div>
          <div className="empty-state__title">No outfits yet</div>
          <div className="empty-state__desc">
            Build your first outfit by combining items from your wardrobe
          </div>
        </div>
      ) : (
        <div className="outfit-list animate-in">
          {outfits.map(outfit => (
            <OutfitCard
              key={outfit.id}
              outfit={outfit}
              items={items}
              onClick={() => setSelectedOutfit(outfit)}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      {buildingOutfit && (
        <OutfitBuilderModal onClose={() => setBuildingOutfit(false)} />
      )}
      {selectedOutfit && (
        <OutfitDetailModal
          outfit={selectedOutfit}
          items={items}
          onClose={() => setSelectedOutfit(null)}
        />
      )}
    </div>
  );
}
