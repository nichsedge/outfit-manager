'use client';

import { useApp } from './AppProvider';
import { CATEGORIES, COLORS, ClothingItem } from '../lib/types';
import { useMemo } from 'react';

export default function InsightsSection() {
  const { items, outfits } = useApp();

  const stats = useMemo(() => {
    if (items.length === 0) return null;

    // Most worn items
    const sortedByWear = [...items].sort((a, b) => (b.wearLogs?.length || 0) - (a.wearLogs?.length || 0));
    const topItems = sortedByWear.slice(0, 3).filter(i => (i.wearLogs?.length || 0) > 0);

    // Category distribution
    const catCounts = items.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Total wears
    const totalWears = items.reduce((acc, item) => acc + (item.wearLogs?.length || 0), 0) +
                       outfits.reduce((acc, o) => acc + (o.wearLogs?.length || 0), 0);

    return {
      topItems,
      catCounts,
      totalWears,
      itemCount: items.length,
      outfitCount: outfits.length
    };
  }, [items, outfits]);

  if (!stats) return null;

  return (
    <div className="insights-section animate-in">
      <div className="insights-grid">
        {/* Main Stats */}
        <div className="insight-card highlight">
          <div className="insight-card__title">Total Utility</div>
          <div className="insight-card__main-val">{stats.totalWears}</div>
          <div className="insight-card__sub-val">Times Worn</div>
          <div className="insight-card__progress-track">
            <div 
              className="insight-card__progress-bar" 
              style={{ width: `${Math.min(100, (stats.totalWears / (stats.itemCount * 5)) * 100)}%` }} 
            />
          </div>
        </div>

        <div className="insight-card">
          <div className="insight-card__title">Diversity</div>
          <div className="insight-card__main-val">{stats.itemCount}</div>
          <div className="insight-card__sub-val">Unique Items</div>
          <div className="insight-card__mini-list">
            {CATEGORIES.slice(0, 3).map(cat => (
              <div key={cat.value} className="mini-stat">
                <span>{cat.emoji}</span>
                <span className="mini-stat__bar">
                  <div style={{ width: `${(stats.catCounts[cat.value] || 0) / stats.itemCount * 100}%` }} />
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {stats.topItems.length > 0 && (
        <div className="top-worn-section">
          <h3 className="insight-subtitle">Your Favorites</h3>
          <div className="fav-items-row">
            {stats.topItems.map(item => (
              <div key={item.id} className="fav-item-bubble">
                {item.images[0] ? (
                  <img src={item.images[0]} alt={item.name} />
                ) : (
                  <div className="fav-item-placeholder">{CATEGORIES.find(c => c.value === item.category)?.emoji}</div>
                )}
                <div className="fav-item-badge">{item.wearLogs?.length}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
