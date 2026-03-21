import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { motion } from 'framer-motion';
import { 
  Briefcase, Code, Gamepad2, Globe, HeartPulse, 
  Lightbulb, Landmark, MonitorPlay, Rocket, TrendingUp 
} from 'lucide-react';

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

const Onboarding = () => {
  const { user, interests, setInterests } = useContext(AppContext);
  const [localInterests, setLocalInterests] = useState(interests || []);
  const navigate = useNavigate();

  useEffect(() => {
    // If user already has interests skipped to feed
    if (interests.length > 0) {
      setLocalInterests(interests);
    }
  }, [interests]);

  const toggleInterest = (id) => {
    setLocalInterests(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleContinue = () => {
    if (localInterests.length > 0) {
      setInterests(localInterests);
      navigate('/');
    }
  };

  return (
    <div className="container" style={{ minHeight: '100vh', padding: '4rem 24px', display: 'flex', flexDirection: 'column' }}>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
        style={{ marginBottom: '3rem', textAlign: 'center' }}
      >
        <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>
          Welcome, <span className="text-gradient">{user?.name}</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto' }}>
          Let's tailor your newsroom. Select the topics you care about, and our Gen AI will curate the perfect feed for you.
        </p>
      </motion.div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', 
        gap: '1.5rem',
        maxWidth: '1000px',
        margin: '0 auto',
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
              onClick={() => toggleInterest(category.id)}
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

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: localInterests.length > 0 ? 1 : 0 }}
        style={{ marginTop: '4rem', display: 'flex', justifyContent: 'center' }}
      >
        <button 
          onClick={handleContinue}
          className="btn-primary" 
          disabled={localInterests.length === 0}
          style={{ padding: '16px 48px', fontSize: '1.2rem' }}
        >
          Generate My Newsroom ✨
        </button>
      </motion.div>
    </div>
  );
};

export default Onboarding;
