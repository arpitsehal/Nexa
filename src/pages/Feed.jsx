import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { fetchNewsForInterests } from '../services/newsService';
import ArticleCard from '../components/ArticleCard';
import { motion } from 'framer-motion';
import { LogOut, Bookmark as BookmarkIcon, Settings, Compass, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Feed = () => {
  const { user, interests, logout } = useContext(AppContext);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const getNews = async () => {
      if (interests.length === 0) {
        navigate('/onboarding');
        return;
      }
      setLoading(true);
      const news = await fetchNewsForInterests(interests);
      setArticles(news);
      setLoading(false);
    };

    getNews();
  }, [interests, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Navigation */}
      <nav style={{ 
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(10, 10, 11, 0.8)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--glass-border)',
        padding: '16px 0'
      }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ 
              width: '40px', height: '40px', borderRadius: '10px', 
              background: 'var(--accent-gradient)', display: 'flex', 
              alignItems: 'center', justifyContent: 'center'
            }}>
              <Sparkles size={20} color="white" />
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>My ET</h2>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <span style={{ color: 'var(--text-secondary)', display: 'none', '@media (min-width: 768px)': { display: 'block'} }}>
              <span className="text-gradient" style={{ fontWeight: 600 }}>{user?.name}</span>'s Room
            </span>
            <button onClick={() => navigate('/bookmarks')} style={{ color: 'var(--text-primary)' }} title="Bookmarks">
              <BookmarkIcon size={24} />
            </button>
            <button onClick={() => navigate('/onboarding')} style={{ color: 'var(--text-primary)' }} title="Interests">
              <Settings size={24} />
            </button>
            <button onClick={handleLogout} style={{ color: 'var(--danger)', marginLeft: '8px' }} title="Logout">
              <LogOut size={24} />
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="container" style={{ flex: 1, padding: '40px 24px' }}>
        <header style={{ marginBottom: '40px' }}>
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            style={{ fontSize: '3rem', marginBottom: '8px' }}
          >
            Your Daily <span className="text-gradient">Intel</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Compass size={20} /> Curated by Gen AI for your unique profile.
          </motion.p>
        </header>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '100px 0', gap: '20px' }}>
            <motion.div 
              animate={{ rotate: 360, scale: [1, 1.2, 1] }} 
              transition={{ repeat: Infinity, duration: 2 }}
              style={{ width: '40px', height: '40px', borderRadius: '50%', border: '3px solid var(--accent-primary)', borderTopColor: 'transparent' }}
            />
            <p style={{ color: 'var(--text-secondary)', fontWeight: 500, letterSpacing: '0.05em' }}>AI AGENTS CURATING YOUR FEED...</p>
          </div>
        ) : (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', 
            gap: '30px' 
          }}>
            {articles.length > 0 ? (
              articles.map((article, idx) => (
                <ArticleCard key={article.id || idx} article={article} index={idx} />
              ))
            ) : (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px 0', color: 'var(--text-secondary)' }}>
                No fresh news found for your interests. Try adding more categories!
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default Feed;
