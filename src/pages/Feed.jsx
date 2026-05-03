import React, { useState, useEffect, useContext, useRef } from 'react';
import { AppContext } from '../context/AppContext';
import { fetchNewsForInterests } from '../services/newsService';
import ArticleCard from '../components/ArticleCard';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Compass, Loader, Home, Flame, Bookmark, Rss, Smartphone, Settings, LogOut, 
  Moon, Sun, Plus, Trash2, Menu, X, Rocket, TrendingUp, Code, Landmark, 
  Gamepad2, Briefcase, HeartPulse, MonitorPlay, Lightbulb, Globe, Languages,
  Sparkles, HelpCircle 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const INTEREST_CATEGORIES = [
  { id: 'startup', label: 'Startups & VC', icon: Rocket, color: '#f59e0b' },
  { id: 'finance', label: 'Finance & Markets', icon: TrendingUp, color: '#10b981' },
  { id: 'tech', label: 'Technology', icon: Code, color: '#3b82f6' },
  { id: 'politics', label: 'Politics', icon: Landmark, color: '#ef4444' },
  { id: 'gaming', label: 'Gaming', icon: Gamepad2, color: '#8b5cf6' },
  { id: 'business', label: 'Business', icon: Briefcase, color: '#6366f1' },
  { id: 'health', label: 'Health & Science', icon: HeartPulse, color: '#ec4899' },
  { id: 'entertainment', label: 'Entertainment', icon: MonitorPlay, color: '#14b8a6' },
  { id: 'innovation', label: 'Innovation', icon: Lightbulb, color: '#eab308' },
  { id: 'world', label: 'World News', icon: Globe, color: '#64748b' },
];

const Feed = () => {
  const { user, interests, setInterests, customFeeds, setCustomFeeds, bookmarks, logout, theme, setTheme } = useContext(AppContext);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  
  // UI State
  const [activeTab, setActiveTab] = useState('home');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [showRssInput, setShowRssInput] = useState(false);
  const [newRss, setNewRss] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [localInterests, setLocalInterests] = useState(interests || []);
  const [showRssGuide, setShowRssGuide] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [tutorialStep, setTutorialStep] = useState(null); // null, 'prompt', 0, 1, 2...
  
  // Check if tutorial is needed
  useEffect(() => {
    const hasSeenTutorial = localStorage.getItem(`tutorial_seen_${user?.uid}`);
    if (!hasSeenTutorial && user) {
      setTutorialStep('prompt');
    }
  }, [user]);

  const completeTutorial = () => {
    localStorage.setItem(`tutorial_seen_${user?.uid}`, 'true');
    setTutorialStep(null);
  };

  const relaunchTutorial = () => {
    setTutorialStep(0);
    setShowSettingsMenu(false);
  };

  // Auto-open sidebar on mobile for sidebar steps
  useEffect(() => {
    if (typeof tutorialStep === 'number' && window.innerWidth < 1024) {
      const step = TUTORIAL_STEPS[tutorialStep];
      if (step?.target.startsWith('sidebar-')) {
        setIsMobileMenuOpen(true);
      } else {
        setIsMobileMenuOpen(false);
      }
    }
  }, [tutorialStep]);

  const TUTORIAL_STEPS = [
    { target: 'sidebar-home', title: 'Daily Intel', text: 'Access your personalized AI-curated news feed here.', pos: 'right' },
    { target: 'sidebar-picks', title: 'Top Picks', text: 'See what is trending across your selected interests.', pos: 'right' },
    { target: 'sidebar-bookmarks', title: 'Saved Briefings', text: 'Your personal vault for articles you want to read later.', pos: 'right' },
    { target: 'sidebar-rss', title: 'Custom Feeds', text: 'Add your own RSS links to follow any site you love.', pos: 'right' },
    { target: 'sidebar-interests', title: 'Manage Interests', text: 'Update your topics to retune your newsroom anytime.', pos: 'right' },
    { target: 'header-settings', title: 'Settings', text: 'Customize your theme and manage your preferences.', pos: 'bottom' },
    { target: 'header-profile', title: 'Profile', text: 'Manage your profile and sign out from here.', pos: 'bottom' },
  ];

  const currentStepData = typeof tutorialStep === 'number' ? TUTORIAL_STEPS[tutorialStep] : null;
  
  const loadMoreRef = useRef(null);
  const navigate = useNavigate();

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.profile-dropdown') && showProfileMenu) {
        setShowProfileMenu(false);
      }
      if (!event.target.closest('.settings-dropdown') && showSettingsMenu) {
        setShowSettingsMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showProfileMenu, showSettingsMenu]);

  useEffect(() => {
    const getNews = async () => {
      if (interests.length === 0) {
        navigate('/onboarding');
        return;
      }
      setLoading(true);
      setPage(0);
      const news = await fetchNewsForInterests(interests, customFeeds, 0);
      
      // Simulate Top Picks by filtering or randomizing slightly for visual difference
      if (activeTab === 'top-picks') {
        const sorted = [...news].sort(() => 0.5 - Math.random()).slice(0, 10);
        setArticles(sorted);
      } else {
        setArticles(news);
      }
      
      setHasMore(news.length > 0);
      setLoading(false);
    };

    getNews();

    return () => {
      window.speechSynthesis.cancel();
    };
  }, [interests.join(','), customFeeds?.join(','), navigate, activeTab]);

  const handleLoadMore = async () => {
    if (isLoadingMore) return;
    setIsLoadingMore(true);
    const nextPage = page + 1;
    const moreNews = await fetchNewsForInterests(interests, customFeeds, nextPage);

    setArticles(prev => {
      const existingIds = new Set(prev.map(a => a.id));
      const uniqueNews = moreNews.filter(n => !existingIds.has(n.id));

      if (uniqueNews.length === 0) {
        setHasMore(false);
        return prev;
      }

      return [...prev, ...uniqueNews];
    });
    setPage(nextPage);
    setIsLoadingMore(false);
  };

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !loading && !isLoadingMore && hasMore && articles.length > 0) {
        handleLoadMore();
      }
    }, { threshold: 0.1 });

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [loading, isLoadingMore, articles.length, page, interests, customFeeds]);

  const handleAddRss = () => {
    if (newRss.trim() && newRss.startsWith('http') && !customFeeds.includes(newRss.trim())) {
      setCustomFeeds([...customFeeds, newRss.trim()]);
      setNewRss('');
    }
  };

  const removeRss = (url) => {
    setCustomFeeds(customFeeds.filter(f => f !== url));
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="app-layout">
      {/* Mobile Overlay */}
      <div 
        className={`mobile-overlay ${isMobileMenuOpen ? 'visible' : ''}`}
        onClick={() => setIsMobileMenuOpen(false)}
      />

      {/* Sidebar Navigation */}
      <aside className={`app-sidebar ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
        <div style={{ padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', marginBottom: '40px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '36px', height: '36px',
              borderRadius: '50%', background: '#ffffff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              overflow: 'hidden', flexShrink: 0
            }}>
              <img src="/Nexa.png" alt="Nexa Logo" style={{ width: '24px', height: '24px', objectFit: 'contain' }} />
            </div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Nexa</h2>
          </div>
          
          <button className="mobile-menu-btn" onClick={() => setIsMobileMenuOpen(false)}>
            <X size={24} />
          </button>
        </div>

        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>

          
          <button 
            id="sidebar-home"
            className={`sidebar-nav-item ${activeTab === 'home' ? 'active' : ''}`}
            onClick={() => { setActiveTab('home'); setIsMobileMenuOpen(false); }}
          >
            <Home size={20} /> Home
          </button>
          
          <button 
            id="sidebar-picks"
            className={`sidebar-nav-item ${activeTab === 'top-picks' ? 'active' : ''}`}
            onClick={() => { setActiveTab('top-picks'); setIsMobileMenuOpen(false); }}
          >
            <Flame size={20} /> Top Picks
          </button>
          
          <button 
            id="sidebar-bookmarks"
            className={`sidebar-nav-item ${activeTab === 'bookmarks' ? 'active' : ''}`}
            onClick={() => { setActiveTab('bookmarks'); setIsMobileMenuOpen(false); }}
          >
            <Bookmark size={20} /> Bookmarks
          </button>
          
          <button 
            id="sidebar-rss"
            className={`sidebar-nav-item ${showRssInput ? 'active' : ''}`}
            onClick={() => {
              setShowRssInput(!showRssInput);
              if (!showRssInput) setShowRssGuide(true);
            }}
          >
            <Rss size={20} /> Custom Feed
          </button>

          <AnimatePresence>
            {showRssInput && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                style={{ padding: '8px 24px', display: 'flex', flexDirection: 'column', gap: '12px', overflow: 'hidden' }}
              >
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input 
                    type="url" placeholder="RSS Link..." value={newRss} onChange={(e) => setNewRss(e.target.value)}
                    style={{ flex: 1, width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.1)', color: 'var(--text-primary)', outline: 'none', fontSize: '0.85rem' }}
                  />
                  <button onClick={handleAddRss} style={{ background: 'var(--accent-primary)', color: 'white', padding: '0 12px', borderRadius: '8px', display: 'flex', alignItems: 'center' }}>
                    <Plus size={16} />
                  </button>
                </div>
                {customFeeds?.map((feed, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.05)', padding: '8px 12px', borderRadius: '6px' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{feed}</span>
                    <button onClick={() => removeRss(feed)} style={{ color: 'var(--danger)', cursor: 'pointer' }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          <button 
            id="sidebar-interests"
            className={`sidebar-nav-item ${activeTab === 'manage-interests' ? 'active' : ''}`}
            onClick={() => { setActiveTab('manage-interests'); setIsMobileMenuOpen(false); }}
          >
            <Settings size={20} /> Manage Interests
          </button>

          <div style={{ margin: '16px 24px', height: '1px', background: 'var(--glass-border)' }} />
          
          <a href="/Nexa.apk" download="Nexa.apk" className="sidebar-nav-item" style={{ color: 'var(--success)' }}>
            <Smartphone size={20} /> Install Android App
          </a>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="app-main">
        {/* Top Header */}
        <header style={{ 
          position: 'sticky', top: 0, zIndex: 90,
          background: 'var(--bg-secondary)',
          borderBottom: '1px solid var(--glass-border)',
          padding: '16px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          <button className="mobile-menu-btn" onClick={() => setIsMobileMenuOpen(true)}>
            <Menu size={24} />
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginLeft: 'auto' }}>
            
            <div id="header-settings" className="dropdown-container settings-dropdown">
              <button 
                onClick={() => setShowSettingsMenu(!showSettingsMenu)}
                style={{ padding: '8px', borderRadius: '50%', color: 'var(--text-secondary)', transition: 'background 0.2s' }}
                onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <Settings size={20} />
              </button>
              
              <AnimatePresence>
                {showSettingsMenu && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="glass-card dropdown-menu"
                    style={{ position: 'absolute', top: '100%', right: 0, marginTop: '12px', width: '220px', zIndex: 100 }}
                  >
                    <button className="dropdown-item" onClick={() => { setTheme(theme === 'dark' ? 'light' : 'dark'); setShowSettingsMenu(false); }}>
                      {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />} 
                      {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                    </button>
                    <div style={{ height: '1px', background: 'var(--glass-border)' }} />
                    <button className="dropdown-item" onClick={() => { setShowLanguageModal(true); setShowSettingsMenu(false); }}>
                      <Languages size={16} /> Language
                    </button>
                    <div style={{ height: '1px', background: 'var(--glass-border)' }} />
                    <button className="dropdown-item" onClick={relaunchTutorial}>
                      <HelpCircle size={16} /> Show Tutorial
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div id="header-profile" className="dropdown-container profile-dropdown">
              <button 
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                style={{ padding: 0, borderRadius: '50%', overflow: 'hidden', border: '2px solid transparent', transition: 'border-color 0.2s', cursor: 'pointer' }}
                onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--accent-primary)'}
                onMouseOut={(e) => e.currentTarget.style.borderColor = 'transparent'}
              >
                <img src={user?.photoURL || 'https://www.gravatar.com/avatar/0?d=mp&f=y'} alt="Profile" style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }} />
              </button>
              
              <AnimatePresence>
                {showProfileMenu && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                    className="dropdown-menu"
                  >
                    <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--glass-border)' }}>
                      <p style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{user?.displayName || 'User'}</p>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{user?.email}</p>
                    </div>
                    <button className="dropdown-item danger" onClick={handleLogout}>
                      <LogOut size={16} /> Logout
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
          </div>
        </header>

        {/* Content Area */}
        <div style={{ padding: '32px', flex: 1 }}>
          
          {activeTab === 'manage-interests' ? (
            <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
              <header style={{ marginBottom: '40px', textAlign: 'center' }}>
                <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', marginBottom: '1rem' }}>
                  Manage your <span className="text-gradient">Interests</span>
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem' }}>
                  Select the topics you care about to retune your daily AI briefings.
                </p>
              </header>

              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 140px), 1fr))', 
                gap: '1.5rem',
                width: '100%'
              }}>
                {INTEREST_CATEGORIES.map((category, index) => {
                  const isSelected = localInterests.includes(category.id);
                  const Icon = category.icon;
                  
                  return (
                    <motion.button
                      key={category.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => {
                        setLocalInterests(prev => 
                          prev.includes(category.id) ? prev.filter(i => i !== category.id) : [...prev, category.id]
                        );
                      }}
                      className="glass-card"
                      style={{
                        padding: '1.5rem',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '1rem',
                        border: isSelected ? `2px solid ${category.color}` : '1px solid var(--glass-border)',
                        background: isSelected ? `${category.color}15` : 'var(--glass-bg)',
                        transform: isSelected ? 'translateY(-4px)' : 'none',
                      }}
                    >
                      <div style={{
                        width: '48px', height: '48px', borderRadius: '50%',
                        background: isSelected ? category.color : 'rgba(255,255,255,0.05)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'all 0.3s'
                      }}>
                        <Icon color={isSelected ? 'white' : category.color} size={24} />
                      </div>
                      <span style={{ fontWeight: 600, color: isSelected ? 'white' : 'var(--text-secondary)' }}>
                        {category.label}
                      </span>
                    </motion.button>
                  )
                })}
              </div>

              <div style={{ marginTop: '3rem', display: 'flex', justifyContent: 'center' }}>
                <button 
                  onClick={() => {
                    setInterests(localInterests);
                    setActiveTab('home');
                  }}
                  className="btn-primary" 
                  disabled={localInterests.length === 0}
                  style={{ 
                    padding: '14px 48px', 
                    borderRadius: '16px', 
                    fontSize: '1.1rem',
                    letterSpacing: '0.02em',
                    boxShadow: '0 8px 24px -8px var(--accent-primary)'
                  }}
                >
                  Save and Update Feed
                </button>
              </div>
            </div>
          ) : (
            <>


              {activeTab === 'bookmarks' ? (
                bookmarks.length === 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '100px 0', textAlign: 'center' }}>
                    <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                      <Bookmark size={40} color="var(--text-muted)" />
                    </div>
                    <h3 style={{ fontSize: '1.5rem', color: 'var(--text-primary)', marginBottom: '8px' }}>Your vault is empty</h3>
                    <p style={{ color: 'var(--text-secondary)' }}>Articles you bookmark will appear here for easy reference.</p>
                  </div>
                ) : (
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))',
                    gap: '24px'
                  }}>
                    {bookmarks.map((article, idx) => (
                      <ArticleCard key={article.id || idx} article={article} index={idx} />
                    ))}
                  </div>
                )
              ) : (
                <>
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
                        <div ref={loadMoreRef} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 0', width: '100%' }}>
                          {isLoadingMore ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                              <Loader className="spin" size={20} /> Loading more news...
                            </div>
                          ) : !hasMore ? (
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              style={{
                                textAlign: 'center',
                                color: 'var(--text-muted)',
                                background: 'rgba(255, 255, 255, 0.03)',
                                padding: '24px 40px',
                                borderRadius: '24px',
                                border: '1px solid var(--glass-border)',
                                maxWidth: '400px'
                              }}
                            >
                              <p style={{ fontSize: '1rem', fontWeight: 500, marginBottom: '8px', color: 'var(--text-primary)' }}>You've reached the end!</p>
                              <p style={{ fontSize: '0.9rem', lineHeight: 1.5 }}>
                                You reached the end of this feed. Come back later for more or change your interests in your profile.
                              </p>
                            </motion.div>
                          ) : (
                            <div style={{ height: '2px', width: '10px' }} />
                          )}
                        </div>
                      )}
                    </>
                  )}
                </>
              )}
            </>
          )}
        </div>

        {/* RSS Guide Modal */}
        <AnimatePresence>
          {showRssGuide && (
            <div style={{ 
              position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
              zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: '24px'
            }}>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowRssGuide(false)}
                style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }}
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="glass-card"
                style={{ 
                  width: '100%', maxWidth: '500px', padding: '40px', position: 'relative', 
                  zIndex: 1001, border: '1px solid var(--glass-border)', textAlign: 'center'
                }}
              >
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                  <Rss size={32} color="white" />
                </div>
                <h2 style={{ fontSize: '1.75rem', marginBottom: '16px' }}>How Custom Feeds Work</h2>
                <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '32px', color: 'var(--text-secondary)' }}>
                  <div style={{ display: 'flex', gap: '16px' }}>
                    <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: 'white', fontWeight: 600, fontSize: '0.8rem' }}>1</div>
                    <p>Visit a site like <a href="https://rss.feedspot.com/indian_news_rss_feeds/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-primary)', textDecoration: 'underline' }}>FeedSpot</a> to find your favorite news RSS feeds.</p>
                  </div>
                  <div style={{ display: 'flex', gap: '16px' }}>
                    <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: 'white', fontWeight: 600, fontSize: '0.8rem' }}>2</div>
                    <p>Copy the RSS link (it usually looks like a URL ending in .xml or .rss).</p>
                  </div>
                  <div style={{ display: 'flex', gap: '16px' }}>
                    <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: 'white', fontWeight: 600, fontSize: '0.8rem' }}>3</div>
                    <p>Paste the link into the "RSS Link..." box in the sidebar and click the **+** button.</p>
                  </div>
                  <div style={{ display: 'flex', gap: '16px' }}>
                    <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: 'white', fontWeight: 600, fontSize: '0.8rem' }}>4</div>
                    <p>Your custom news will now automatically appear in your home feed!</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowRssGuide(false)}
                  className="btn-primary"
                  style={{ width: '100%', padding: '16px', borderRadius: '12px' }}
                >
                  Got it, let's explore!
                </button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Language Modal */}
        <AnimatePresence>
          {showLanguageModal && (
            <div style={{ 
              position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
              zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: '24px'
            }}>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowLanguageModal(false)}
                style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }}
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="glass-card"
                style={{ 
                  width: '100%', maxWidth: '400px', padding: '40px', position: 'relative', 
                  zIndex: 1001, border: '1px solid var(--glass-border)', textAlign: 'center'
                }}
              >
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', border: '1px solid var(--glass-border)' }}>
                  <Languages size={32} color="var(--accent-primary)" />
                </div>
                <h2 style={{ fontSize: '1.75rem', marginBottom: '16px' }}>Languages</h2>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', lineHeight: 1.6 }}>
                  We are currently training our AI models to support multiple languages including Hindi, Spanish, French, and more. 
                  <br /><br />
                  Stay tuned! This feature will be available in the next major update.
                </p>
                <button 
                  onClick={() => setShowLanguageModal(false)}
                  className="btn-primary"
                  style={{ width: '100%', padding: '16px', borderRadius: '12px' }}
                >
                  Close
                </button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Tutorial System */}
        <AnimatePresence>
          {tutorialStep === 'prompt' && (
            <div style={{ position: 'fixed', inset: 0, zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', padding: '24px' }}>
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="glass-card" style={{ maxWidth: '450px', padding: '48px 40px', textAlign: 'center', border: '1px solid var(--accent-primary)' }}>
                <div style={{ width: '80px', height: '80px', background: 'var(--accent-primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', boxShadow: '0 0 30px var(--accent-primary)' }}>
                  <Sparkles size={40} color="white" />
                </div>
                <h2 style={{ fontSize: '2rem', marginBottom: '16px' }}>Welcome to Nexa</h2>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '40px', lineHeight: 1.6, fontSize: '1.1rem' }}>
                  Want a quick 1-minute tour to see how your new AI-powered newsroom works?
                </p>
                <div style={{ display: 'flex', gap: '16px' }}>
                  <button onClick={() => setTutorialStep(0)} className="btn-primary" style={{ flex: 1, padding: '16px' }}>Take the Tour</button>
                  <button onClick={completeTutorial} style={{ flex: 1, background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid var(--glass-border)', borderRadius: '12px', cursor: 'pointer' }}>Skip for now</button>
                </div>
              </motion.div>
            </div>
          )}

          {typeof tutorialStep === 'number' && currentStepData && (
            <div style={{ position: 'fixed', inset: 0, zIndex: 2000, pointerEvents: 'none' }}>
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', pointerEvents: 'auto' }} onClick={completeTutorial} />
              
              <TutorialHighlight targetId={currentStepData.target} stepData={currentStepData} isMobileMenuOpen={isMobileMenuOpen} onNext={() => {
                if (tutorialStep < TUTORIAL_STEPS.length - 1) setTutorialStep(tutorialStep + 1);
                else completeTutorial();
              }} onSkip={completeTutorial} />
            </div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

// Helper component for tutorial highlighting
const TutorialHighlight = ({ targetId, stepData, onNext, onSkip, isMobileMenuOpen }) => {
  const [rect, setRect] = useState(null);

  useEffect(() => {
    const updateRect = () => {
      const el = document.getElementById(targetId);
      if (el) setRect(el.getBoundingClientRect());
    };
    
    updateRect();
    const timer = setTimeout(updateRect, 400); // Wait for sidebar animation
    
    window.addEventListener('resize', updateRect);
    return () => {
      window.removeEventListener('resize', updateRect);
      clearTimeout(timer);
    };
  }, [targetId, isMobileMenuOpen]);

  if (!rect) return null;

  const tooltipStyle = {
    position: 'absolute',
    background: 'var(--bg-secondary)',
    border: '1px solid var(--accent-primary)',
    borderRadius: '16px',
    padding: '24px',
    width: '280px',
    zIndex: 2001,
    pointerEvents: 'auto',
    boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
    color: 'white'
  };

  const viewportWidth = window.innerWidth;
  const tooltipWidth = 280;

  if (stepData.pos === 'right') {
    let left = rect.right + 20;
    if (left + tooltipWidth > viewportWidth - 20) {
      left = Math.max(20, rect.left - tooltipWidth - 20);
    }
    // Final safety: if still off screen or element is hidden, center it
    if (rect.right < 0 || rect.left > viewportWidth) {
      tooltipStyle.left = '50%';
      tooltipStyle.top = '50%';
      tooltipStyle.transform = 'translate(-50%, -50%)';
    } else {
      tooltipStyle.left = `${left}px`;
      tooltipStyle.top = `${rect.top}px`;
    }
  } else if (stepData.pos === 'bottom') {
    let left = rect.left - tooltipWidth/2 + rect.width/2;
    left = Math.max(20, Math.min(left, viewportWidth - tooltipWidth - 20));
    tooltipStyle.left = `${left}px`;
    tooltipStyle.top = `${rect.bottom + 20}px`;
  }

  return (
    <>
      {/* Target Highlight */}
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        style={{
          position: 'absolute', top: rect.top - 8, left: rect.left - 8,
          width: rect.width + 16, height: rect.height + 16,
          borderRadius: '12px', border: '2px solid var(--accent-primary)',
          boxShadow: '0 0 0 9999px rgba(0,0,0,0.7)', zIndex: 2000, pointerEvents: 'none'
        }}
      />
      
      {/* Tooltip */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={tooltipStyle}>
        <h4 style={{ margin: '0 0 8px 0', fontSize: '1.2rem', color: 'var(--accent-primary)' }}>{stepData.title}</h4>
        <p style={{ margin: '0 0 20px 0', fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{stepData.text}</p>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button onClick={onSkip} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.85rem' }}>Skip Tour</button>
          <button onClick={onNext} className="btn-primary" style={{ padding: '8px 20px', fontSize: '0.9rem', borderRadius: '8px' }}>
            {stepData.target === 'header-profile' ? 'Finish' : 'Next'}
          </button>
        </div>
      </motion.div>
    </>
  );
};

export default Feed;

