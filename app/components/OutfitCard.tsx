'use client';

import { ClothingItem, Outfit, CATEGORIES } from '../lib/types';

interface Props {
  outfit: Outfit;
  items: ClothingItem[];
  onClick: () => void;
}

export default function OutfitCard({ outfit, items, onClick }: Props) {
  const outfitItems = outfit.itemIds
    .map(id => items.find(i => i.id === id))
    .filter(Boolean) as ClothingItem[];

  const previewSlots = outfitItems.slice(0, 3);
  while (previewSlots.length < 3) {
    previewSlots.push(null as unknown as ClothingItem);
  }

  return (
    <div
      id={`outfit-card-${outfit.id}`}
      className="outfit-card"
      onClick={onClick}
      role="button"
    >
      <div className="outfit-card__images">
        {previewSlots.map((item, idx) => {
          if (!item) {
            return (
              <div key={idx} className="outfit-card__img-slot--placeholder">
                {idx === 0 ? '👕' : idx === 1 ? '👖' : '👟'}
              </div>
            );
          }
          const cat = CATEGORIES.find(c => c.value === item.category);
          return item.images && item.images.length > 0 ? (
            <img
              key={item.id}
              src={item.images[0]}
              alt={item.name}
              className="outfit-card__img-slot"
            />
          ) : (
            <div key={item.id} className="outfit-card__img-slot--placeholder">
              {cat?.emoji}
            </div>
          );
        })}
      </div>

      <div className="outfit-card__body">
        <div>
          <div className="outfit-card__name">
            {outfit.name || 'Untitled Outfit'}
          </div>
          {outfit.note && (
            <div className="outfit-card__note">{outfit.note}</div>
          )}
        </div>
        <div className="outfit-card__items-count">
          {outfitItems.length} item{outfitItems.length !== 1 ? 's' : ''}
        </div>
      </div>
    </div>
  );
}
