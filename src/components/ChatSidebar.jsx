import React, { useState, useContext, useRef, useEffect } from 'react';
import { AppContext } from '../context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Bot, User, Sparkles } from 'lucide-react';
import { askArticleQuestion } from '../services/newsService';
import { db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const ChatSidebar = () => {
  const { user, activeChatArticle, setActiveChatArticle } = useContext(AppContext);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // Reset chat or load from Firestore when a new article is selected
  useEffect(() => {
    const loadChat = async () => {
      if (!activeChatArticle || !user) return;
      
      setLoading(true);
      try {
        const safeId = encodeURIComponent(activeChatArticle.id).replace(/\./g, '_');
        const chatRef = doc(db, 'users', user.uid, 'chats', safeId);
        const docSnap = await getDoc(chatRef);
        
        if (docSnap.exists() && docSnap.data().messages) {
          setMessages(docSnap.data().messages);
        } else {
          setMessages([
            { role: 'assistant', content: `Hi! I'm your AI assistant. Ask me anything about "${activeChatArticle.title}".` }
          ]);
        }
      } catch (error) {
        console.error("Error loading chat:", error);
        setMessages([
          { role: 'assistant', content: `Hi! I'm your AI assistant. Ask me anything about "${activeChatArticle.title}".` }
        ]);
      }
      setLoading(false);
      setInput('');
    };
    
    loadChat();
  }, [activeChatArticle, user]);

  if (!activeChatArticle) return null;

  const handleSendMessage = async (e, predefinedMessage = null) => {
    if (e) e.preventDefault();
    
    const messageText = predefinedMessage || input.trim();
    if (!messageText.trim() || loading) return;

    setInput('');
    
    // Add user message to UI
    const newMessages = [...messages, { role: 'user', content: messageText }];
    setMessages(newMessages);
    setLoading(true);

    const historyForApi = newMessages.map(m => ({
      role: m.role,
      content: m.content
    }));
    
    const aiResponse = await askArticleQuestion(activeChatArticle, historyForApi, messageText);
    
    const finalMessages = [...newMessages, { role: 'assistant', content: aiResponse }];
    setMessages(finalMessages);
    setLoading(false);

    // Save strictly to Firestore seamlessly in background
    if (user && activeChatArticle) {
      try {
        const safeId = encodeURIComponent(activeChatArticle.id).replace(/\./g, '_');
        const chatRef = doc(db, 'users', user.uid, 'chats', safeId);
        await setDoc(chatRef, { 
          articleTitle: activeChatArticle.title,
          updatedAt: new Date().toISOString(),
          messages: finalMessages 
        }, { merge: true });
      } catch (err) {
        console.error("Failed to save chat to cloud:", err);
      }
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          width: '100%',
          maxWidth: '400px',
          height: '100vh',
          background: 'rgba(10, 10, 11, 0.95)',
          backdropFilter: 'blur(20px)',
          borderLeft: '1px solid var(--glass-border)',
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '-10px 0 30px rgba(0, 0, 0, 0.5)'
        }}
      >
        {/* Header */}
        <div style={{
          padding: '20px',
          borderBottom: '1px solid var(--glass-border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              background: 'var(--accent-gradient)',
              padding: '8px',
              borderRadius: '8px'
            }}>
              <Bot size={20} color="white" />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600 }}>Nexa AI</h3>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '200px' }}>
                {activeChatArticle.title}
              </p>
            </div>
          </div>
          <button 
            onClick={() => setActiveChatArticle(null)}
            style={{ color: 'var(--text-muted)', background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <X size={24} />
          </button>
        </div>

        {/* Chat Messages */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          {messages.map((msg, idx) => (
            <div key={idx} style={{
              display: 'flex',
              gap: '12px',
              alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
              flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
              maxWidth: '85%'
            }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: msg.role === 'user' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(139, 92, 246, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                {msg.role === 'user' ? <User size={16} /> : <Sparkles size={16} color="var(--accent-primary)" />}
              </div>
              <div style={{
                background: msg.role === 'user' ? 'var(--accent-primary)' : 'rgba(255, 255, 255, 0.05)',
                padding: '12px 16px',
                borderRadius: '16px',
                borderTopRightRadius: msg.role === 'user' ? '4px' : '16px',
                borderTopLeftRadius: msg.role === 'user' ? '16px' : '4px',
                color: 'var(--text-primary)',
                fontSize: '0.95rem',
                lineHeight: 1.5,
                whiteSpace: 'pre-wrap'
              }}>
                {msg.content}
              </div>
            </div>
          ))}
          {loading && (
            <div style={{ display: 'flex', gap: '12px', alignSelf: 'flex-start' }}>
              <div style={{
                width: '32px', height: '32px', borderRadius: '50%',
                background: 'rgba(139, 92, 246, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <Sparkles size={16} color="var(--accent-primary)" />
              </div>
              <div style={{
                background: 'rgba(255, 255, 255, 0.05)', padding: '12px 16px', borderRadius: '16px',
                borderTopLeftRadius: '4px', display: 'flex', alignItems: 'center', gap: '4px'
              }}>
                <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1.5 }} style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--text-secondary)' }} />
                <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.2 }} style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--text-secondary)' }} />
                <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.4 }} style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--text-secondary)' }} />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div style={{ 
          padding: '20px', 
          borderTop: '1px solid var(--glass-border)',
          background: 'rgba(10, 10, 11, 0.95)'
        }}>
          {/* Quick Actions */}
          {messages.length === 1 && (
            <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', marginBottom: '12px', paddingBottom: '4px' }} className="no-scrollbar">
              <button 
                onClick={() => handleSendMessage(null, "Analyze the market impact. List 3 specific public companies or industries affected by this news and explain why.")}
                style={{ 
                  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(139, 92, 246, 0.3)',
                  padding: '6px 12px', borderRadius: '16px', fontSize: '0.75rem', color: 'var(--accent-secondary)',
                  whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer'
                }}
                onMouseOver={(e) => e.currentTarget.style.background = 'rgba(139, 92, 246, 0.1)'}
                onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
              >
                📉 Analyze Market Impact
              </button>
              <button 
                onClick={() => handleSendMessage(null, "Summarize this article in exactly 3 short bullet points.")}
                style={{ 
                  background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)',
                  padding: '6px 12px', borderRadius: '16px', fontSize: '0.75rem', color: 'var(--text-secondary)',
                  whiteSpace: 'nowrap', cursor: 'pointer'
                }}
                onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
              >
                📝 TL;DR Summary
              </button>
            </div>
          )}

          <form onSubmit={(e) => handleSendMessage(e)} style={{ display: 'flex', gap: '10px' }}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about this article..."
              disabled={loading}
              style={{
                flex: 1,
                padding: '12px 16px',
                borderRadius: '24px',
                border: '1px solid var(--glass-border)',
                background: 'rgba(255, 255, 255, 0.05)',
                color: 'var(--text-primary)',
                outline: 'none',
              }}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              style={{
                background: input.trim() && !loading ? 'var(--accent-primary)' : 'rgba(255, 255, 255, 0.1)',
                color: 'white',
                border: 'none',
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: input.trim() && !loading ? 'pointer' : 'default',
                transition: 'background 0.2s'
              }}
            >
              <Send size={18} style={{ marginLeft: '2px' }} />
            </button>
          </form>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ChatSidebar;
