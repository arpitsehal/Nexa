import React, { useContext } from 'react';
import { Bookmark, Sparkles } from 'lucide-react';
import { AppContext } from '../context/AppContext';
import { motion } from 'framer-motion';

const ArticleCard = ({ article, index }) => {
  const { toggleBookmark, bookmarks, setActiveChatArticle } = useContext(AppContext);
  
  const isBookmarked = bookmarks.some(b => b.title === article.title);

  // Format date
  const dateObj = new Date(article.pubDate);
  const dateString = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  // Get correct image or placeholder
  let imageUrl = article.thumbnail || article.enclosure?.link;
  if (!imageUrl && article.description) {
    const imgMatch = article.description.match(/<img[^>]+src="([^">]+)"/);
    if (imgMatch) imageUrl = imgMatch[1];
  }
  
  // Clean description HTML
  let cleanDesc = article.description?.replace(/<\/?[^>]+(>|$)/g, "") || '';
  if (cleanDesc.length > 150) cleanDesc = cleanDesc.substring(0, 150) + '...';

  return (
    <motion.article 
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="glass-card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        position: 'relative',
        height: '100%'
      }}
    >
      {imageUrl && (
        <div style={{ height: '200px', width: '100%', overflow: 'hidden' }}>
          <img 
            src={imageUrl} 
            alt={article.title} 
            style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s' }}
            onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
            onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
            onError={(e) => e.target.style.display = 'none'}
          />
        </div>
      )}

      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <span style={{ 
            fontSize: '0.75rem', 
            fontWeight: 600, 
            color: 'var(--accent-secondary)',
            background: 'rgba(139, 92, 246, 0.1)',
            padding: '4px 10px',
            borderRadius: '12px',
            textTransform: 'uppercase'
          }}>
            {article.category || 'News'}
          </span>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{dateString}</span>
        </div>

        <h2 style={{ fontSize: '1.25rem', marginBottom: '12px', lineHeight: 1.4 }}>
          <a href={article.link} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-primary)'}}>
            {article.title}
          </a>
        </h2>
        
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '20px', flex: 1 }}>
          {cleanDesc}
        </p>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--glass-border)', paddingTop: '16px', marginTop: 'auto' }}>
          <button 
            onClick={() => setActiveChatArticle(article)} 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px', 
              color: 'var(--accent-primary)', 
              background: 'rgba(99, 102, 241, 0.1)',
              padding: '6px 12px',
              borderRadius: '20px',
              transition: 'all 0.2s',
            }}
            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(99, 102, 241, 0.2)'}
            onMouseOut={(e) => e.currentTarget.style.background = 'rgba(99, 102, 241, 0.1)'}
          >
            <Sparkles size={16} />
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Nexa AI</span>
          </button>
          
          <button onClick={() => toggleBookmark(article)} style={{ color: isBookmarked ? 'var(--accent-primary)' : 'var(--text-muted)', transition: 'color 0.2s' }}>
            <Bookmark size={22} fill={isBookmarked ? 'var(--accent-primary)' : 'none'} color={isBookmarked ? 'var(--accent-primary)' : 'currentColor'} />
          </button>
        </div>
      </div>
    </motion.article>
  );
};

export default ArticleCard;
