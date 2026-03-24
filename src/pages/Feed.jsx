import React, { useState, useEffect, useContext, useRef } from 'react';
import { AppContext } from '../context/AppContext';
import { fetchNewsForInterests, generateAudioBriefing } from '../services/newsService';
import ArticleCard from '../components/ArticleCard';
import { motion } from 'framer-motion';
import { Compass, Headphones, Play, Square, Loader } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Feed = () => {
  const { user, interests, customFeeds, setIsProfileOpen } = useContext(AppContext);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const loadMoreRef = useRef(null);
  
  // Audio State
  const [audioScript, setAudioScript] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  
  const navigate = useNavigate();

  useEffect(() => {
    const getNews = async () => {
      if (interests.length === 0) {
        navigate('/onboarding');
        return;
      }
      setLoading(true);
      setPage(0);
      const news = await fetchNewsForInterests(interests, customFeeds, 0);
      setArticles(news);
      setLoading(false);
    };

    getNews();
    
    // Stop audio on unmount
    return () => {
      window.speechSynthesis.cancel();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [interests.join(','), customFeeds?.join(','), navigate]);

  const handleLoadMore = async () => {
    if (isLoadingMore) return;
    setIsLoadingMore(true);
    const nextPage = page + 1;
    const moreNews = await fetchNewsForInterests(interests, customFeeds, nextPage);
    
    setArticles(prev => {
      const existingIds = new Set(prev.map(a => a.id));
      const uniqueNews = moreNews.filter(n => !existingIds.has(n.id));
      return [...prev, ...uniqueNews];
    });
    setPage(nextPage);
    setIsLoadingMore(false);
  };

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !loading && !isLoadingMore && articles.length > 0) {
        handleLoadMore();
      }
    }, { threshold: 0.1 });

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [loading, isLoadingMore, articles.length, page, interests, customFeeds]);

  const handlePlayAudio = async () => {
    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }
    
    setIsGeneratingAudio(true);
    let scriptToPlay = audioScript;
    
    if (!scriptToPlay) {
      const topArticles = articles.slice(0, 3);
      if (topArticles.length === 0) {
        setIsGeneratingAudio(false);
        return;
      }
      scriptToPlay = await generateAudioBriefing(topArticles);
      setAudioScript(scriptToPlay);
    }
    
    setIsGeneratingAudio(false);
    
    const utterance = new SpeechSynthesisUtterance(scriptToPlay);
    utterance.rate = 1.0;
    utterance.onend = () => setIsPlaying(false);
    
    const voices = window.speechSynthesis.getVoices();
    const englishVoices = voices.filter(v => v.lang.startsWith('en'));
    if (englishVoices.length > 0) {
      utterance.voice = englishVoices.find(v => v.name.includes('Google') || v.name.includes('Premium')) || englishVoices[0];
    }

    window.speechSynthesis.speak(utterance);
    setIsPlaying(true);
  };

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
              width: '40px', height: '40px',
              borderRadius: '50%',
              background: '#ffffff',
              border: '1px solid rgba(0,0,0,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              overflow: 'hidden',
              flexShrink: 0
            }}>
              <img 
                src="/Nexa.png" 
                alt="Nexa Logo" 
                style={{ width: '28px', height: '28px', objectFit: 'contain' }} 
              />
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Nexa</h2>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <span className="desktop-only" style={{ color: 'var(--text-secondary)' }}>
              <span className="text-gradient" style={{ fontWeight: 600 }}>{user?.displayName?.split(' ')?.[0] || 'User'}</span>'s Room
            </span>
            <button 
              onClick={() => setIsProfileOpen(true)}
              style={{ padding: 0, borderRadius: '50%', overflow: 'hidden', border: '2px solid transparent', transition: 'border-color 0.2s', background: 'transparent', cursor: 'pointer' }}
              onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--accent-primary)'}
              onMouseOut={(e) => e.currentTarget.style.borderColor = 'transparent'}
            >
              <img 
                src={user?.photoURL || 'https://www.gravatar.com/avatar/0?d=mp&f=y'} 
                alt="Profile" 
                style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
              />
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
            style={{ fontSize: 'clamp(2rem, 8vw, 3rem)', marginBottom: '8px' }}
          >
            Your Daily <span className="text-gradient">Intel</span>
          </motion.h1>
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}
          >
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Compass size={20} /> Curated by Gen AI for your unique profile.
            </p>
            
            {articles.length > 0 && !loading && (
              <button 
                onClick={handlePlayAudio}
                className="btn-primary"
                style={{ 
                  borderRadius: '30px', 
                  padding: '10px 24px', 
                  fontSize: '0.9rem',
                  background: isPlaying ? 'rgba(239, 68, 68, 0.1)' : 'var(--accent-gradient)',
                  color: isPlaying ? '#ef4444' : 'white',
                  border: isPlaying ? '1px solid rgba(239, 68, 68, 0.5)' : 'none',
                  boxShadow: isPlaying ? 'none' : 'var(--shadow-glow)',
                  gap: '10px',
                  opacity: isGeneratingAudio ? 0.7 : 1,
                  cursor: isGeneratingAudio ? 'wait' : 'pointer'
                }}
                disabled={isGeneratingAudio}
              >
                {isGeneratingAudio ? (
                  <><Loader className="spin" size={18} /> Writing Sync...</>
                ) : isPlaying ? (
                  <><Square size={16} fill="currentColor" /> Stop Briefing</>
                ) : (
                  <><Headphones size={18} /> Listen to Morning Briefing</>
                )}
              </button>
            )}
          </motion.div>
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
          <>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))', 
              gap: '24px' 
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
          
          {!loading && articles.length > 0 && (
            <div ref={loadMoreRef} style={{ display: 'flex', justifyContent: 'center', padding: '40px 0', width: '100%' }}>
              {isLoadingMore ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  <Loader className="spin" size={20} /> Loading more news...
                </div>
              ) : (
                <div style={{ height: '2px', width: '10px' }} />
              )}
            </div>
          )}
          </>
        )}
      </main>
    </div>
  );
};

export default Feed;
