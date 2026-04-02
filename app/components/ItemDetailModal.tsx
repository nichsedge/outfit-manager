'use client';

import { useRef, useState } from 'react';
import { ClothingItem, CATEGORIES, COLORS } from '../lib/types';
import { useApp } from './AppProvider';
import Toast from './Toast';

interface Props {
  item: ClothingItem;
  onClose: () => void;
}

export default function ItemDetailModal({ item, onClose }: Props) {
  const { deleteItem, updateItem } = useApp();
  const [confirming, setConfirming] = useState(false);
  const [toast, setToast] = useState('');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const category = CATEGORIES.find(c => c.value === item.category);
  const colorInfo = COLORS.find(c => c.value === item.color);

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (item.images && item.images.length >= 5) {
      setToast('Maximum 5 photos allowed.');
      return;
    }
    setUploadingPhoto(true);
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const newImageData = ev.target?.result as string;
      const updatedImages = [...(item.images || []), newImageData];
      await updateItem({ ...item, images: updatedImages });
      setToast('✓ Photo added!');
      setUploadingPhoto(false);
    };
    reader.readAsDataURL(file);
    // reset so the same file can be picked again
    e.target.value = '';
  };

  const handleDelete = async () => {
    if (!confirming) { setConfirming(true); return; }
    await deleteItem(item.id);
    setToast('Item deleted');
    setTimeout(onClose, 500);
  };

  const handleWear = async () => {
    await updateItem({ ...item, lastWornAt: Date.now() });
    setToast('✓ Marked as worn today!');
    setTimeout(onClose, 1200);
  };

  return (
    <>
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-sheet animate-scale" onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <span className="modal-title">{item.name}</span>
            <button id="modal-close" className="modal-close" onClick={onClose}>✕</button>
          </div>
          <div className="modal-body">

            {/* Image Carousel */}
            <div style={{ position: 'relative', marginBottom: 'var(--space-4)' }}>
              {item.images && item.images.length > 0 ? (
                <div 
                  className="carousel-container" 
                  style={{ 
                    display: 'flex', overflowX: 'auto', scrollSnapType: 'x mandatory', 
                    gap: 'var(--space-3)', paddingBottom: 'var(--space-2)' 
                  }}
                >
                  {item.images.map((img, idx) => (
                    <div 
                      key={idx} 
                      className="item-detail__image-wrapper"
                      style={{ flexShrink: 0, width: '100%', scrollSnapAlign: 'start', margin: 0, position: 'relative' }}
                      onClick={(e) => {
                        const imgEl = e.currentTarget.querySelector('img');
                        if (!imgEl) return;
        
                        const canvas = document.createElement('canvas');
                        const ctx = canvas.getContext('2d');
                        if (!ctx) return;
        
                        const rect = imgEl.getBoundingClientRect();
                        const x = ((e.clientX - rect.left) / rect.width) * imgEl.naturalWidth;
                        const y = ((e.clientY - rect.top) / rect.height) * imgEl.naturalHeight;
        
                        canvas.width = imgEl.naturalWidth;
                        canvas.height = imgEl.naturalHeight;
                        ctx.drawImage(imgEl, 0, 0);
        
                        const pixel = ctx.getImageData(x, y, 1, 1).data;
                        const hex = '#' + ((1 << 24) + (pixel[0] << 16) + (pixel[1] << 8) + pixel[2]).toString(16).slice(1);
                        updateItem({ ...item, color: hex });
                        setToast(`✓ Color updated to ${hex}`);
                      }}
                      role="button"
                    >
                      <img
                        src={img}
                        alt={`${item.name} ${idx + 1}`}
                        className="item-detail__image"
                        style={{ margin: 0 }}
                      />
                      {item.images && item.images.length > 1 && (
                        <div style={{ position: 'absolute', top: 12, left: 12, background: 'rgba(0,0,0,0.6)', color: 'white', padding: '2px 8px', borderRadius: 'var(--radius-pill)', fontSize: 11, fontWeight: 700, pointerEvents: 'none' }}>
                          {idx + 1} / {item.images.length}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div 
                  id="item-photo-area"
                  className="item-detail__image-wrapper"
                  onClick={() => fileRef.current?.click()}
                  role="button"
                >
                  <div className="item-detail__image" style={{ display: 'grid', placeItems: 'center', fontSize: 72, margin: 0 }}>
                    {category?.emoji}
                  </div>
                  <div className="item-photo-overlay" style={{ opacity: 1 }}>
                    {uploadingPhoto ? (
                      <div className="loading-spinner" style={{ width: 28, height: 28, borderWidth: 2 }} />
                    ) : (
                      <>
                        <span style={{ fontSize: 26 }}>📷</span>
                        <span style={{ fontSize: 13, fontWeight: 600, color: 'white' }}>Add photo</span>
                      </>
                    )}
                  </div>
                </div>
              )}
              
              {uploadingPhoto && item.images && item.images.length > 0 && (
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 'var(--radius-lg)' }}>
                  <div className="loading-spinner" style={{ width: 28, height: 28, borderWidth: 2 }} />
                </div>
              )}
            </div>

            {item.images && item.images.length > 0 && (
              <p style={{ fontSize: 11, color: 'var(--accent)', marginTop: -8, marginBottom: 16, fontWeight: 600, textAlign: 'center' }}>
                🎯 Tap on any image to pick a color • Swipe to see more
              </p>
            )}

            {/* Hidden file input */}
            <input
              ref={fileRef}
              id="update-photo-input"
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handlePhotoChange}
              style={{ display: 'none' }}
            />

            {/* Info rows */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', marginTop: 'var(--space-4)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>Category</span>
                <span style={{ fontWeight: 600, fontSize: 14 }}>
                  {category?.emoji} {category?.label}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>Color</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div 
                    id="update-color-swatch"
                    style={{
                      width: 24, height: 24, borderRadius: '50%',
                      backgroundColor: item.color, border: '1px solid rgba(255,255,255,0.2)',
                      cursor: 'pointer',
                      position: 'relative'
                    }}
                    onClick={() => document.getElementById('update-color-input')?.click()}
                    title="Change color"
                  >
                    <input
                      id="update-color-input"
                      type="color"
                      value={item.color}
                      onChange={async (e) => {
                        const newColor = e.target.value;
                        await updateItem({ ...item, color: newColor });
                        setToast('✓ Color updated!');
                      }}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        opacity: 0,
                        width: '100%',
                        height: '100%',
                        cursor: 'pointer'
                      }}
                    />
                  </div>
                  <span style={{ fontWeight: 600, fontSize: 14 }}>{colorInfo?.label || item.color}</span>
                </div>
              </div>

              {item.lastWornAt && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>Last worn</span>
                  <span style={{ fontWeight: 600, fontSize: 14 }}>
                    {new Date(item.lastWornAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>Added</span>
                <span style={{ fontWeight: 600, fontSize: 14 }}>
                  {new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
            </div>

            {/* Tags */}
            {item.tags.length > 0 && (
              <div className="item-detail__tags">
                {item.tags.map(tag => (
                  <span key={tag} className="tag-badge">{tag}</span>
                ))}
              </div>
            )}

            <div className="divider" />

            {/* Actions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              <button
                id="btn-update-photo"
                className="btn btn-ghost btn-full"
                onClick={() => fileRef.current?.click()}
                disabled={uploadingPhoto || (item.images && item.images.length >= 5)}
              >
                📷 {item.images && item.images.length >= 5 ? 'Max photos reached' : 'Add another photo'}
              </button>
              <button id="btn-wear-today" className="btn btn-ghost btn-full" onClick={handleWear}>
                👕 Wearing this today
              </button>
              <button
                id="btn-delete-item"
                className="btn btn-danger btn-full"
                onClick={handleDelete}
              >
                {confirming ? '⚠️ Tap again to confirm delete' : '🗑 Delete item'}
              </button>
            </div>
          </div>
        </div>
      </div>
      {toast && <Toast message={toast} onDone={() => setToast('')} />}
    </>
  );
}
