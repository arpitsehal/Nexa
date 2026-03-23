import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { motion } from 'framer-motion';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../firebase';

const Login = () => {
  const { user, authLoading, interests } = useContext(AppContext);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // If the Firebase user is resolved and they are logged in
    if (!authLoading && user) {
      if (interests && interests.length > 0) {
        navigate('/');
      } else {
        navigate('/onboarding');
      }
    }
  }, [user, authLoading, interests, navigate]);

  const handleGoogleLogin = async () => {
    try {
      setIsLoggingIn(true);
      await signInWithPopup(auth, googleProvider);
      // Navigation is handled automatically by the useEffect above
    } catch (error) {
      console.error("Error signing in with Google", error);
      setIsLoggingIn(false);
    }
  };

  if (authLoading) {
    return (
      <div className="container" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Loading authentication...</p>
      </div>
    );
  }

  return (
    <div className="container" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="glass-card" 
        style={{ padding: '3rem', maxWidth: '440px', width: '100%', textAlign: 'center' }}
      >
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
          <img 
            src="/Nexa.png" 
            alt="Nexa Logo" 
            style={{ 
              width: '80px', 
              height: '80px', 
              objectFit: 'contain',
              filter: 'drop-shadow(0 8px 16px rgba(139, 92, 246, 0.4))'
            }} 
          />
        </div>
        
        <h1 style={{ marginBottom: '0.5rem', fontSize: '2rem' }}>Welcome to <span className="text-gradient">Nexa</span></h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2.5rem' }}>The Personalized Newsroom of the Future.</p>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <button 
            onClick={handleGoogleLogin} 
            disabled={isLoggingIn}
            className="btn-primary" 
            style={{ 
              width: '100%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: '12px',
              background: 'white',
              color: '#333'
            }}
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" style={{width: 20, height: 20}} />
            {isLoggingIn ? 'Signing in...' : 'Sign in with Google'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
