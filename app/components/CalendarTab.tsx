'use client';

import { useMemo, useState } from 'react';
import { useApp } from './AppProvider';
import { ClothingItem, Outfit, CATEGORIES } from '../lib/types';
import ItemDetailModal from './ItemDetailModal';

// Group logic
export default function CalendarTab() {
  const { items, outfits } = useApp();
  const [selectedItem, setSelectedItem] = useState<ClothingItem | null>(null);

  // Group by date string: YYYY-MM-DD
  const days = useMemo(() => {
    const map: Record<string, { dateObj: Date, outfits: Outfit[], items: ClothingItem[] }> = {};

    const getDayKey = (ts: number) => {
      const d = new Date(ts);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    };

    // 1. Collect all outfits
    outfits.forEach(outfit => {
      const logs = outfit.wearLogs || (outfit.lastWornAt ? [outfit.lastWornAt] : []);
      logs.forEach(ts => {
        const key = getDayKey(ts);
        if (!map[key]) map[key] = { dateObj: new Date(ts), outfits: [], items: [] };
        // Avoid duplicate outfit entries for the same day
        if (!map[key].outfits.find(o => o.id === outfit.id)) {
          map[key].outfits.push(outfit);
        }
      });
    });

    // 2. Collect all items
    items.forEach(item => {
      const logs = item.wearLogs || (item.lastWornAt ? [item.lastWornAt] : []);
      logs.forEach(ts => {
        const key = getDayKey(ts);
        if (!map[key]) map[key] = { dateObj: new Date(ts), outfits: [], items: [] };
        
        // Only add item if it's NOT already in one of the outfits for this day
        const isInOutfitToday = map[key].outfits.some(o => o.itemIds.includes(item.id));
        if (!isInOutfitToday) {
          if (!map[key].items.find(i => i.id === item.id)) {
            map[key].items.push(item);
          }
        }
      });
    });

    // Convert map to sorted array (newest first)
    return Object.entries(map)
      .map(([key, data]) => ({ key, ...data }))
      .sort((a, b) => b.dateObj.getTime() - a.dateObj.getTime());
  }, [items, outfits]);

  const formatDateLabel = (dateObj: Date) => {
    const today = new Date();
    const isToday = today.toDateString() === dateObj.toDateString();
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const isYesterday = yesterday.toDateString() === dateObj.toDateString();

    if (isToday) return 'Today';
    if (isYesterday) return 'Yesterday';
    return dateObj.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
  };

  return (
    <div className="page-content animate-fade-in">
      <div className="section-header">
        <h1 className="section-title">Style Log</h1>
      </div>

      {days.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state__emoji">📅</div>
          <div className="empty-state__title">No history yet</div>
          <div className="empty-state__desc">Tap "Wearing this today" on any item to start building your style log.</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
          {days.map(day => (
            <div key={day.key}>
              <div style={{ 
                fontSize: 14, 
                fontWeight: 700, 
                color: 'var(--text-secondary)',
                borderBottom: '1px solid var(--border)',
                paddingBottom: 'var(--space-2)',
                marginBottom: 'var(--space-4)',
                textTransform: 'uppercase',
                letterSpacing: 0.5
              }}>
                {formatDateLabel(day.dateObj)}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                {/* Outfits first */}
                {day.outfits.map(outfit => (
                  <div key={`outfit-${outfit.id}`} className="outfit-card" style={{ padding: 'var(--space-3)' }}>
                    <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 'var(--space-2)', color: 'var(--accent)' }}>Outfit: {outfit.name}</div>
                    <div style={{ display: 'flex', gap: 'var(--space-2)', overflowX: 'auto', scrollbarWidth: 'none' }}>
                      {outfit.itemIds.map(itemId => {
                        const item = items.find(i => i.id === itemId);
                        if (!item) return null;
                        const cat = CATEGORIES.find(c => c.value === item.category);
                        return (
                          <div 
                            key={itemId} 
                            onClick={() => setSelectedItem(item)}
                            style={{ width: 64, flexShrink: 0, cursor: 'pointer' }}
                          >
                            <div style={{ width: 64, height: 64, borderRadius: 'var(--radius-md)', background: 'var(--bg-3)', overflow: 'hidden', marginBottom: 4 }}>
                              {item.images && item.images.length > 0 ? (
                                <img src={item.images[0]} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              ) : (
                                <div style={{ display: 'grid', placeItems: 'center', width: '100%', height: '100%', fontSize: 24 }}>{cat?.emoji}</div>
                              )}
                            </div>
                            <div style={{ fontSize: 10, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', textAlign: 'center' }}>{item.name}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}

                {/* Individual Items */}
                {day.items.length > 0 && (
                  <div style={{ display: 'flex', gap: 'var(--space-2)', overflowX: 'auto', scrollbarWidth: 'none' }}>
                    {day.items.map(item => {
                      const cat = CATEGORIES.find(c => c.value === item.category);
                      return (
                        <div 
                          key={`single-${item.id}`}
                          onClick={() => setSelectedItem(item)}
                          style={{ width: 80, flexShrink: 0, cursor: 'pointer', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: 'var(--space-2)' }}
                        >
                          <div style={{ width: '100%', aspectRatio: '1', borderRadius: 'calc(var(--radius-md) - 4px)', background: 'var(--bg-3)', overflow: 'hidden', marginBottom: 6 }}>
                            {item.images && item.images.length > 0 ? (
                              <img src={item.images[0]} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                              <div style={{ display: 'grid', placeItems: 'center', width: '100%', height: '100%', fontSize: 28 }}>{cat?.emoji}</div>
                            )}
                          </div>
                          <div style={{ fontSize: 11, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', textAlign: 'center' }}>{item.name}</div>
                          <div style={{ fontSize: 9, color: 'var(--text-muted)', textAlign: 'center', textTransform: 'capitalize' }}>Single item</div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedItem && (
        <ItemDetailModal 
          item={items.find(i => i.id === selectedItem.id) || selectedItem} 
          onClose={() => setSelectedItem(null)} 
        />
      )}
    </div>
  );
}
