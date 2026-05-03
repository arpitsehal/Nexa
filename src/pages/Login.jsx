import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { motion } from 'framer-motion';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../firebase';
import loginBg from '../assets/login-bg.png';

const Login = () => {
  const { user, authLoading, interests } = useContext(AppContext);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // If the Firebase user is resolved and they are logged in
    if (!authLoading && user) {
      if (interests && interests.length > 0) {
        navigate('/feed');
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
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#0f172a', // Dark fallback
      backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.4), rgba(15, 23, 42, 0.4)), url(${loginBg})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      padding: '20px'
    }}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="glass-card"
        style={{
          padding: 'clamp(2rem, 5vw, 3.5rem)',
          maxWidth: '440px',
          width: '100%',
          textAlign: 'center',
          background: 'rgba(255, 255, 255, 0.7)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.8)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.1)'
        }}
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

        <h1 style={{ marginBottom: '0.5rem', fontSize: '2rem', color: '#3a3b3fff' }}>Welcome to <span className="text-gradient">Nexa</span></h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2.5rem' }}>The Personalized Newsroom of the Future.</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <motion.button
            onClick={handleGoogleLogin}
            disabled={isLoggingIn}
            whileHover={{ y: -2, boxShadow: '0 10px 25px -5px rgba(99, 102, 241, 0.3)' }}
            whileTap={{ scale: 0.98 }}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              background: '#ffffff',
              color: '#0f172a',
              border: '1px solid #e2e8f0',
              padding: '14px 24px',
              borderRadius: '50px',
              fontSize: '1.05rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'background 0.2s ease, border-color 0.2s ease'
            }}
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" style={{ width: 24, height: 24 }} />
            {isLoggingIn ? 'Signing in...' : 'Continue with Google'}
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
