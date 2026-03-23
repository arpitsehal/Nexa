import React, { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { X, LogOut, Bookmark, Settings, Rss, Moon, Sun, Plus, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ProfileSidebar = () => {
  const { user, isProfileOpen, setIsProfileOpen, logout, customFeeds, setCustomFeeds, theme, setTheme } = useContext(AppContext);
  const [showRss, setShowRss] = useState(false);
  const [newRss, setNewRss] = useState('');
  const navigate = useNavigate();

  if (!user) return null;

  const handleNavigate = (path) => {
    setIsProfileOpen(false);
    navigate(path);
  };

  const handleLogout = () => {
    setIsProfileOpen(false);
    logout();
    navigate('/login');
  };

  const handleAddRss = () => {
    if (newRss.trim() && newRss.startsWith('http')) {
      setCustomFeeds([...customFeeds, newRss.trim()]);
      setNewRss('');
    }
  };

  const removeRss = (url) => {
    setCustomFeeds(customFeeds.filter(f => f !== url));
  };

  return (
    <AnimatePresence>
      {isProfileOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsProfileOpen(false)}
            style={{
              position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
              background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
              zIndex: 999
            }}
          />
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            style={{
              position: 'fixed', top: 0, right: 0, bottom: 0, width: '100%', maxWidth: '360px',
              background: 'var(--glass-bg)', borderLeft: '1px solid var(--glass-border)',
              display: 'flex', flexDirection: 'column', zIndex: 1000,
              padding: '32px 24px',
              boxShadow: '-10px 0 30px rgba(0,0,0,0.5)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <img 
                  src={user.photoURL || 'https://www.gravatar.com/avatar/0?d=mp&f=y'} 
                  alt="Profile" 
                  style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--accent-primary)' }}
                />
                <div>
                  <h3 style={{ fontSize: '1.2rem', marginBottom: '4px', fontWeight: 600 }}>{user.displayName || 'Newsroom User'}</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{user.email}</p>
                </div>
              </div>
              <button 
                onClick={() => setIsProfileOpen(false)} 
                style={{ color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.05)', padding: '8px', borderRadius: '50%' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
              
              <button onClick={() => handleNavigate('/bookmarks')} className="sidebar-link">
                <Bookmark size={20} /> Saved Bookmarks
              </button>

              <button onClick={() => handleNavigate('/onboarding')} className="sidebar-link">
                <Settings size={20} /> Manage Interests
              </button>

              <div style={{ margin: '16px 0', height: '1px', background: 'var(--glass-border)' }} />

              <button className="sidebar-link" onClick={() => setShowRss(!showRss)}>
                <Rss size={20} /> Custom Feeds
              </button>

              <AnimatePresence>
                {showRss && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: '12px', overflow: 'hidden', marginBottom: '8px' }}
                  >
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input 
                        type="url" 
                        placeholder="https://example.com/rss" 
                        value={newRss}
                        onChange={(e) => setNewRss(e.target.value)}
                        style={{ flex: 1, width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)', color: 'white', outline: 'none', fontSize: '0.85rem' }}
                      />
                      <button onClick={handleAddRss} style={{ background: 'var(--accent-primary)', color: 'white', padding: '0 12px', borderRadius: '8px', display: 'flex', alignItems: 'center' }}>
                        <Plus size={16} />
                      </button>
                    </div>
                    
                    {customFeeds.map((feed, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.05)', padding: '8px 12px', borderRadius: '8px' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{feed}</span>
                        <button onClick={() => removeRss(feed)} style={{ color: 'var(--danger)', padding: '4px', cursor: 'pointer' }}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

            </div>

            <button onClick={handleLogout} className="btn-primary" style={{ display: 'flex', justifyContent: 'center', gap: '8px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
              <LogOut size={20} /> Sign Out
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ProfileSidebar;
