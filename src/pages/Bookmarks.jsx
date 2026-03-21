import React, { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import ArticleCard from '../components/ArticleCard';
import { motion } from 'framer-motion';
import { ArrowLeft, Bookmark } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Bookmarks = () => {
  const { bookmarks } = useContext(AppContext);
  const navigate = useNavigate();

  return (
    <div className="container" style={{ minHeight: '100vh', padding: '40px 24px', display: 'flex', flexDirection: 'column' }}>
      <header style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '40px' }}>
        <button 
          onClick={() => navigate(-1)} 
          style={{ 
            background: 'var(--glass-bg)', 
            border: '1px solid var(--glass-border)',
            borderRight: '50%',
            padding: '12px',
            color: 'var(--text-primary)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 style={{ fontSize: '2.5rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
            Saved <span className="text-gradient">Briefings</span> <Bookmark size={32} color="var(--accent-primary)" fill="var(--accent-primary)" />
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>Your personal archive of important stories.</p>
        </div>
      </header>

      {bookmarks.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}
        >
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
            <Bookmark size={40} color="var(--text-muted)" />
          </div>
          <h3 style={{ fontSize: '1.5rem', color: 'var(--text-primary)', marginBottom: '8px' }}>Your vault is empty</h3>
          <p style={{ color: 'var(--text-secondary)' }}>Articles you bookmark will appear here for easy reference.</p>
        </motion.div>
      ) : (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', 
          gap: '30px' 
        }}>
          {bookmarks.map((article, idx) => (
            <ArticleCard key={idx} article={article} index={idx} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Bookmarks;
