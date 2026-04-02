'use client';

import { useState, useRef } from 'react';
import { useApp } from './AppProvider';
import Toast from './Toast';
import TagsManagerModal from './TagsManagerModal';

interface Props {
  onClose: () => void;
}

export default function SettingsModal({ onClose }: Props) {
  const { items, outfits, tags, restoreBackup } = useApp();
  const [toast, setToast] = useState('');
  const [restoring, setRestoring] = useState(false);
  const [showTagsManager, setShowTagsManager] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleBackup = () => {
    try {
      const data = {
        version: 2,
        timestamp: Date.now(),
        items,
        outfits,
        tags,
      };
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const date = new Date().toISOString().split('T')[0];
      
      link.href = url;
      link.download = `wardrobe-backup-${date}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      setToast('✓ Backup downloaded!');
    } catch (err) {
      console.error('Backup failed:', err);
      setToast('❌ Backup failed');
    }
  };

  const handleRestore = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setRestoring(true);
    const reader = new FileReader();

    reader.onload = async (ev) => {
      try {
        const content = ev.target?.result as string;
        const backup = JSON.parse(content);
        
        if (!backup.items || !Array.isArray(backup.items)) {
          throw new Error('Invalid backup format: missing items');
        }

        const confirmRestore = window.confirm(
          'Warning: This will overwrite ALL current wardrobe data with the backup. Continue?'
        );

        if (confirmRestore) {
          await restoreBackup(backup.items, backup.outfits || [], backup.tags);
          setToast('✓ Restore complete!');
          setTimeout(onClose, 1000);
        }
      } catch (err) {
        console.error('Restore failed:', err);
        alert('Restore failed: Invalid backup file');
      } finally {
        setRestoring(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };

    reader.readAsText(file);
  };

  return (
    <>
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-sheet animate-scale" onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <span className="modal-title">Settings</span>
            <button id="settings-close" className="modal-close" onClick={onClose}>✕</button>
          </div>
          <div className="modal-body">
            <div className="section-header" style={{ marginTop: 0 }}>
              <span className="section-title">Data Management</span>
            </div>
            
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 'var(--space-4)' }}>
              Export your entire wardrobe as a file or restore from a previous backup.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              <button 
                id="btn-backup-wardrobe"
                className="btn btn-ghost btn-full" 
                onClick={handleBackup}
                style={{ justifyContent: 'flex-start', paddingLeft: 'var(--space-4)' }}
              >
                📥 Backup Wardrobe
              </button>
              
              <button 
                id="btn-restore-wardrobe"
                className="btn btn-ghost btn-full" 
                onClick={() => fileInputRef.current?.click()}
                disabled={restoring}
                style={{ justifyContent: 'flex-start', paddingLeft: 'var(--space-4)' }}
              >
                📤 {restoring ? 'Restoring...' : 'Restore Wardrobe'}
              </button>

              <button 
                id="btn-manage-tags"
                className="btn btn-ghost btn-full" 
                onClick={() => setShowTagsManager(true)}
                style={{ justifyContent: 'flex-start', paddingLeft: 'var(--space-4)' }}
              >
                🏷️ Manage Style Tags
              </button>
              
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleRestore}
                style={{ display: 'none' }}
              />
            </div>

            <div className="divider" />
            
            <div style={{ padding: 'var(--space-4)', background: 'var(--bg-3)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>Statistics</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', gap: 16 }}>
                <span>Items: {items.length}</span>
                <span>Outfits: {outfits.length}</span>
              </div>
            </div>

            <p style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'center', marginTop: 'var(--space-6)' }}>
              Outfit Manager v1.0.0 • Local-first PWA
            </p>
          </div>
        </div>
      </div>
      {toast && <Toast message={toast} onDone={() => setToast('')} />}
      {showTagsManager && <TagsManagerModal onClose={() => setShowTagsManager(false)} />}
    </>
  );
}
