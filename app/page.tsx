'use client';

import { useState } from 'react';
import { useApp } from './components/AppProvider';
import WardrobeView from './components/WardrobeView';
import OutfitsView from './components/OutfitsView';
import AddItemView from './components/AddItemView';
import SettingsModal from './components/SettingsModal';
import { ActiveTab } from './lib/types';

export default function Home() {
  const { loading, theme, toggleTheme } = useApp();
  const [activeTab, setActiveTab] = useState<ActiveTab>('wardrobe');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner" />
      </div>
    );
  }

  return (
    <div className="app-shell">
      {/* Header */}
      <header className="app-header">
        <div className="app-header__logo">
          <div className="app-header__logo-icon">🧥</div>
          <span className="app-header__title">Wardrobe</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500, opacity: 0.7 }}>
            {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
          </span>
          <button 
            className="btn-circle" 
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? '🌞' : '🌙'}
          </button>
          <button 
            id="btn-settings"
            className="btn-circle" 
            onClick={() => setIsSettingsOpen(true)}
            aria-label="Settings"
            title="Settings & Backup"
          >
            ⚙️
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ flex: 1 }}>
        {activeTab === 'wardrobe' && <WardrobeView />}
        {activeTab === 'outfits' && <OutfitsView />}
        {activeTab === 'add' && <AddItemView onDone={() => setActiveTab('wardrobe')} />}
      </main>

      {isSettingsOpen && (
        <SettingsModal onClose={() => setIsSettingsOpen(false)} />
      )}

      {/* Bottom Nav */}
      <nav className="bottom-nav">
        <button
          id="nav-wardrobe"
          className={`nav-btn ${activeTab === 'wardrobe' ? 'active' : ''}`}
          onClick={() => setActiveTab('wardrobe')}
        >
          <span className="nav-btn__icon">👕</span>
          <span className="nav-btn__label">Wardrobe</span>
        </button>

        <button
          id="nav-add"
          className="nav-btn nav-btn--add"
          onClick={() => setActiveTab('add')}
          aria-label="Add clothing item"
        >
          <span className="nav-btn__icon">+</span>
        </button>

        <button
          id="nav-outfits"
          className={`nav-btn ${activeTab === 'outfits' ? 'active' : ''}`}
          onClick={() => setActiveTab('outfits')}
        >
          <span className="nav-btn__icon">✨</span>
          <span className="nav-btn__label">Outfits</span>
        </button>
      </nav>
    </div>
  );
}
