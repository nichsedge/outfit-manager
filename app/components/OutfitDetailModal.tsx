'use client';

import { useState } from 'react';
import { ClothingItem, Outfit, CATEGORIES } from '../lib/types';
import { useApp } from './AppProvider';
import Toast from './Toast';

interface Props {
  outfit: Outfit;
  items: ClothingItem[];
  onClose: () => void;
}

export default function OutfitDetailModal({ outfit, items, onClose }: Props) {
  const { deleteOutfit, updateOutfit } = useApp();
  const [confirming, setConfirming] = useState(false);
  const [toast, setToast] = useState('');

  const outfitItems = outfit.itemIds
    .map(id => items.find(i => i.id === id))
    .filter(Boolean) as ClothingItem[];

  const handleDelete = async () => {
    if (!confirming) { setConfirming(true); return; }
    await deleteOutfit(outfit.id);
    setToast('Outfit deleted');
    setTimeout(onClose, 500);
  };

  const handleWear = async () => {
    await updateOutfit({ ...outfit, lastWornAt: Date.now() });
    setToast('✓ Wearing this outfit today!');
    setTimeout(onClose, 1200);
  };

  return (
    <>
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-sheet animate-scale" onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <span className="modal-title">{outfit.name || 'Outfit'}</span>
            <button id="outfit-detail-close" className="modal-close" onClick={onClose}>✕</button>
          </div>

          <div className="modal-body">
            {/* Image grid */}
            {outfitItems.length > 0 && (
              <div
                className="outfit-detail__grid"
                style={{ gridTemplateColumns: `repeat(${Math.min(outfitItems.length, 3)}, 1fr)` }}
              >
                {outfitItems.slice(0, 3).map(item => {
                  const cat = CATEGORIES.find(c => c.value === item.category);
                  return item.images && item.images.length > 0 ? (
                    <img
                      key={item.id}
                      src={item.images[0]}
                      alt={item.name}
                      className="outfit-detail__img"
                    />
                  ) : (
                    <div key={item.id} className="outfit-detail__img" style={{
                      display: 'grid', placeItems: 'center', fontSize: 40, background: 'var(--bg-3)'
                    }}>
                      {cat?.emoji}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Note */}
            {outfit.note && (
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 'var(--space-4)', lineHeight: 1.6 }}>
                {outfit.note}
              </p>
            )}

            {/* Items list */}
            <div style={{ marginBottom: 'var(--space-5)' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 'var(--space-3)' }}>
                {outfitItems.length} Item{outfitItems.length !== 1 ? 's' : ''}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                {outfitItems.map(item => {
                  const cat = CATEGORIES.find(c => c.value === item.category);
                  return (
                    <div key={item.id} style={{
                      display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
                      padding: 'var(--space-3)', background: 'var(--bg-2)',
                      borderRadius: 'var(--radius-md)', border: '1px solid var(--border)'
                    }}>
                      {item.images && item.images.length > 0 ? (
                        <img src={item.images[0]} alt={item.name} style={{
                          width: 44, height: 44, objectFit: 'cover', borderRadius: 8, flexShrink: 0
                        }} />
                      ) : (
                        <div style={{
                          width: 44, height: 44, background: 'var(--bg-3)', borderRadius: 8,
                          display: 'grid', placeItems: 'center', fontSize: 22, flexShrink: 0
                        }}>
                          {cat?.emoji}
                        </div>
                      )}
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600 }}>{item.name}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
                          <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: item.color }} />
                          {cat?.label}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Dates */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-5)' }}>
              <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Created</span>
              <span style={{ fontSize: 13 }}>
                {new Date(outfit.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>

            <div className="divider" />

            {/* Actions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              <button id="btn-wear-outfit" className="btn btn-primary btn-full" onClick={handleWear}>
                ✨ Wearing this today
              </button>
              <button
                id="btn-delete-outfit"
                className="btn btn-danger btn-full"
                onClick={handleDelete}
              >
                {confirming ? '⚠️ Tap again to confirm delete' : '🗑 Delete outfit'}
              </button>
            </div>
          </div>
        </div>
      </div>
      {toast && <Toast message={toast} onDone={() => setToast('')} />}
    </>
  );
}
