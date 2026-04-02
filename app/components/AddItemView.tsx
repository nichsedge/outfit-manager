'use client';

import { useState, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { ClothingItem, CATEGORIES, COLORS, Category } from '../lib/types';
import { useApp } from './AppProvider';
import Toast from './Toast';

interface Props {
  onDone: () => void;
}

export default function AddItemView({ onDone }: Props) {
  const { addItem, tags: dynamicTags } = useApp();
  const fileRef = useRef<HTMLInputElement>(null);
  const [images, setImages] = useState<string[]>([]);
  const [name, setName] = useState('');
  const [category, setCategory] = useState<Category | ''>('');
  const [color, setColor] = useState('#1a1a1a');
  const [tags, setTags] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (images.length >= 5) {
      setToast('Maximum 5 photos allowed.');
      return;
    }
    const reader = new FileReader();
    reader.onload = ev => {
      const dataUrl = ev.target?.result as string;
      setImages(prev => [...prev, dataUrl]);
      // auto-fill name from file if empty
      if (!name) {
        const base = file.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ');
        setName(base.charAt(0).toUpperCase() + base.slice(1));
      }
    };
    reader.readAsDataURL(file);
    // clear input so same file can be selected again
    e.target.value = '';
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const toggleTag = (tagLabel: string) => {
    setTags(prev => prev.includes(tagLabel) ? prev.filter(t => t !== tagLabel) : [...prev, tagLabel]);
  };

  const canSave = name.trim() && category;

  const handleSave = async () => {
    if (!canSave) return;
    setSaving(true);
    const item: ClothingItem = {
      id: uuidv4(),
      name: name.trim(),
      category: category as Category,
      color,
      tags,
      images,
      createdAt: Date.now(),
    };
    await addItem(item);
    setToast('✓ Item added to wardrobe!');
    setTimeout(onDone, 800);
  };

  return (
    <div className="form-page animate-in">
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.5px', marginBottom: 4 }}>
          Add Item
        </h1>
        <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>
          Take a photo or pick from gallery
        </p>
      </div>

      {/* Photos */}
      <div className="form-group">
        <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Photos</span>
          <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 400 }}>
            {images.length}/5 (Front, back, details)
          </span>
        </label>
        
        <div style={{ display: 'flex', gap: 'var(--space-3)', overflowX: 'auto', paddingBottom: 'var(--space-3)' }}>
          {images.map((img, idx) => (
            <div key={idx} style={{ position: 'relative', width: 240, height: 320, flexShrink: 0, borderRadius: 'var(--radius-xl)', overflow: 'hidden', border: '1px solid var(--border)' }}>
              <img 
                src={img} 
                alt={`Photo ${idx + 1}`} 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onClick={(e) => {
                  const imgEl = e.currentTarget;
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
                  setColor(hex);
                  setToast(`Color picked: ${hex}`);
                }}
              />
              {idx === 0 && (
                <div style={{ position: 'absolute', bottom: 12, left: 12, background: 'var(--accent)', color: 'var(--bg-0)', padding: '2px 8px', borderRadius: 'var(--radius-pill)', fontSize: 11, fontWeight: 700, pointerEvents: 'none' }}>
                  Cover
                </div>
              )}
              <button
                type="button"
                onClick={() => removeImage(idx)}
                style={{
                  position: 'absolute', top: 12, right: 12, background: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: '50%',
                  width: 32, height: 32, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 10
                }}
                title="Remove photo"
              >✕</button>
            </div>
          ))}
          
          {images.length < 5 && (
            <div
              className="photo-upload"
              onClick={() => fileRef.current?.click()}
              role="button"
              style={{ width: 240, height: 320, flexShrink: 0, cursor: 'pointer' }}
            >
              <span className="photo-upload__icon">📷</span>
              <span className="photo-upload__text">Tap to add photo</span>
            </div>
          )}
        </div>
        
        {images.length > 0 && (
          <p style={{ fontSize: 11, color: 'var(--accent)', marginTop: 2, fontWeight: 600, textAlign: 'center' }}>
            🎯 Tap on any image to pick a color
          </p>
        )}
        
        <input
          ref={fileRef}
          id="file-input"
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleImageChange}
          style={{ display: 'none' }}
        />
      </div>

      {/* Name */}
      <div className="form-group">
        <label className="form-label" htmlFor="item-name">Name</label>
        <input
          id="item-name"
          className="form-input"
          type="text"
          placeholder="e.g. White Oxford Shirt"
          value={name}
          onChange={e => setName(e.target.value)}
          maxLength={60}
        />
      </div>

      {/* Category */}
      <div className="form-group">
        <label className="form-label">Category</label>
        <div className="pill-group">
          {CATEGORIES.map(cat => (
            <button
              id={`cat-${cat.value}`}
              key={cat.value}
              className={`pill ${category === cat.value ? 'active' : ''}`}
              onClick={() => setCategory(cat.value)}
            >
              {cat.emoji} {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Color */}
      <div className="form-group">
        <label className="form-label">Color</label>
        <div className="color-grid">
          {COLORS.map(c => (
            <button
              id={`color-${c.label.toLowerCase()}`}
              key={c.value}
              className={`color-swatch ${color === c.value ? 'active' : ''}`}
              style={{ backgroundColor: c.value }}
              onClick={() => setColor(c.value)}
              title={c.label}
              aria-label={c.label}
            />
          ))}
          {/* Custom Color Picker */}
          <div style={{ position: 'relative' }}>
            <button
              id="color-custom-btn"
              className={`color-swatch ${!COLORS.some(c => c.value === color) ? 'active' : ''}`}
              style={{ 
                backgroundColor: !COLORS.some(c => c.value === color) ? color : 'var(--bg-3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px',
                color: !COLORS.some(c => c.value === color) ? (parseInt(color.replace('#',''), 16) > 0xffffff/2 ? '#000' : '#fff') : 'var(--text-secondary)'
              }}
              onClick={() => document.getElementById('custom-color-input')?.click()}
              title="Custom Color"
              aria-label="Custom Color"
            >
              {!COLORS.some(c => c.value === color) ? '✓' : '+'}
            </button>
            <input
              id="custom-color-input"
              type="color"
              value={!COLORS.some(c => c.value === color) ? color : '#ffffff'}
              onChange={(e) => setColor(e.target.value)}
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
        </div>
      </div>

      {/* Tags */}
      <div className="form-group">
        <label className="form-label">Style Tags <span style={{ color: 'var(--text-muted)' }}>(optional)</span></label>
        <div className="pill-group">
          {dynamicTags.map(tag => (
            <button
              id={`tag-${tag.id}`}
              key={tag.id}
              className={`pill ${tags.includes(tag.label) ? 'active' : ''}`}
              onClick={() => toggleTag(tag.label)}
            >
              {tag.label}
            </button>
          ))}
        </div>
      </div>

      {/* Save */}
      <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-4)' }}>
        <button id="btn-cancel" className="btn btn-ghost" onClick={onDone} style={{ flex: 1 }}>
          Cancel
        </button>
        <button
          id="btn-save-item"
          className="btn btn-primary"
          style={{ flex: 2 }}
          onClick={handleSave}
          disabled={!canSave || saving}
        >
          {saving ? 'Saving…' : '✓ Add to Wardrobe'}
        </button>
      </div>

      {toast && <Toast message={toast} onDone={() => setToast('')} />}
    </div>
  );
}
