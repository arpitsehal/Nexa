import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { motion, useReducedMotion } from 'framer-motion';
import { signInWithPopup } from 'firebase/auth';
import { ArrowLeft, ArrowUpRight, ShieldCheck, Sparkles, Headphones } from 'lucide-react';
import { auth, googleProvider } from '../firebase';
import aboutMockup from '../assets/about-mockup.png';
// Shares the landing page's tokens (.pn), buttons and type so the two pages read as one site.
import './LandingPage.css';
import './Login.css';

const EASE = [0.22, 1, 0.36, 1];

const PERKS = [
  { icon: Sparkles, label: 'A feed tuned to your interests' },
  { icon: Headphones, label: 'Listen to any story on the go' },
  { icon: ShieldCheck, label: 'Secured with Google Firebase' },
];

const Login = () => {
  const { user, authLoading, interests } = useContext(AppContext);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const navigate = useNavigate();
  const reduced = useReducedMotion();

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
      <div className="pn pn-login-loading">
        <span className="pn-live-dot" />
        <p>Loading authentication...</p>
      </div>
    );
  }

  const rise = (delay) => ({
    initial: reduced ? { opacity: 0 } : { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.8, delay, ease: EASE },
  });

  return (
    <div className="pn pn-login">
      <section className="pn-login-form">
        <header className="pn-login-top">
          <a href="/" className="pn-logo">
            <img src="/Nexa.png" alt="" />
            <span>Nexa</span>
          </a>
          <a href="/" className="pn-login-back">
            <ArrowLeft size={16} />
            Back to site
          </a>
        </header>

        <div className="pn-login-body">
          <motion.span className="pn-eyebrow" {...rise(0.05)}>
            Sign in
          </motion.span>

          <motion.h1 className="pn-login-title" {...rise(0.12)}>
            Welcome to your <span className="pn-accent">newsroom</span>
          </motion.h1>

          <motion.p className="pn-lead" {...rise(0.2)}>
            The personalized newsroom of the future. Sign in to pick up right where you left off.
          </motion.p>

          <motion.div className="pn-login-actions" {...rise(0.28)}>
            <button
              className="pn-btn pn-btn-dark pn-btn-lg pn-login-google"
              onClick={handleGoogleLogin}
              disabled={isLoggingIn}
            >
              <span className="pn-login-g">
                <img
                  src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                  alt=""
                  width="20"
                  height="20"
                />
              </span>
              {isLoggingIn ? 'Signing in...' : 'Continue with Google'}
              <span className="pn-btn-icon">
                <ArrowUpRight size={18} />
              </span>
            </button>
          </motion.div>

          <motion.ul className="pn-login-perks" {...rise(0.36)}>
            {PERKS.map((perk) => {
              const Icon = perk.icon;
              return (
                <li key={perk.label}>
                  <span className="pn-login-perk-icon">
                    <Icon size={16} />
                  </span>
                  {perk.label}
                </li>
              );
            })}
          </motion.ul>
        </div>

        <p className="pn-login-legal">
          By continuing you agree to Nexa's Terms of Service and Privacy Policy.
        </p>
      </section>

      <motion.aside
        className="pn-login-showcase"
        aria-hidden="true"
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, delay: 0.15, ease: EASE }}
      >
        <div className="pn-showcase-glow" />
        <div className="pn-showcase-tag">
          <span className="pn-live-dot" /> Live feed
        </div>

        <div className="pn-login-quote">
          <p>
            Better discovery. <span>Less noise.</span>
          </p>
          <div className="pn-login-stats">
            <div>
              <strong>30K+</strong>
              <span>Active readers</span>
            </div>
            <div>
              <strong>2.1M</strong>
              <span>Articles read</span>
            </div>
          </div>
        </div>

        <img className="pn-login-mockup" src={aboutMockup} alt="" />
      </motion.aside>
    </div>
  );
};

export default Login;
