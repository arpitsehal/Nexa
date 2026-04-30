import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle2, 
  Users, 
  BarChart3, 
  Smartphone, 
  ShieldCheck, 
  Zap, 
  ChevronDown, 
  ChevronUp,
  Globe,
  Headphones,
  Bot
} from 'lucide-react';
import './LandingPage.css';
import heroMockup from '../assets/hero-mockup.png';
import aboutMockup from '../assets/about-mockup.png';
import adminMockup from '../assets/admin-mockup.png';

const FAQItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="faq-item">
      <div 
        className="faq-question" 
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{question}</span>
        {isOpen ? <ChevronUp size={20} color="#01c46b" /> : <ChevronDown size={20} color="#64748b" />}
      </div>
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{ overflow: 'hidden' }}
          >
            <div className="faq-answer">
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const LandingPage = () => {
  const navigate = useNavigate();
  const { user } = useContext(AppContext);

  const features = [
    {
      icon: <Users size={28} />,
      title: "Real-time Feed",
      description: "Stay updated with a curated feed of news, articles, and discussions happening right now."
    },
    {
      icon: <CheckCircle2 size={28} />,
      title: "Smart Bookmarks",
      description: "Save important articles and resources for later reading with our intelligent bookmarking system."
    },
    {
      icon: <BarChart3 size={28} />,
      title: "Admin Analytics",
      description: "Powerful dashboard and reporting tools to understand user engagement and platform growth."
    },
    {
      icon: <Smartphone size={28} />,
      title: "Mobile Optimized",
      description: "Access your feed and manage your workflow anywhere with our fully responsive mobile design."
    },
    {
      icon: <Headphones size={28} />,
      title: "Listen News Feature",
      description: "Listen to the latest news on the go with our integrated text-to-speech audio player."
    },
    {
      icon: <Bot size={28} />,
      title: "Ask AI",
      description: "Get instant summaries and context on any article by asking our intelligent AI assistant."
    }
  ];

  const faqs = [
    {
      question: "How does Nexa personalize my news feed?",
      answer: "Nexa uses advanced AI algorithms and your selected interests to curate a daily intel feed specifically tailored to your unique profile, ensuring you only see the news that matters most to you."
    },
    {
      question: "Do I need to download an app?",
      answer: "Our platform is fully web-based and highly responsive, meaning you can access it from any browser on desktop, tablet, or mobile without needing to download a separate app."
    },
    {
      question: "How secure is my data?",
      answer: "We use enterprise-grade encryption and partner with industry leaders like Google Firebase to ensure your data is stored securely and compliantly."
    },
    {
      question: "What does Nexa Intelligence provide?",
      answer: "Nexa Intelligence is our powerful admin analytics dashboard that provides real-time data on user engagement, registered readers, and platform activity."
    }
  ];

  return (
    <div className="landing-container">
      {/* Navbar */}
      <nav className="landing-nav">
        <a href="/" className="landing-logo">
          <img src="/Nexa.png" alt="Nexa Logo" style={{ width: '32px', height: '32px', objectFit: 'contain' }} />
          Nexa
        </a>
        <div className="landing-nav-links">
          <a href="#features">Features</a>
          <a href="#about">About Us</a>
          <a href="#faq">FAQ</a>
          <a href="#contact">Contact</a>
        </div>
        <div className="landing-nav-actions">
          <button className="landing-btn-primary" onClick={() => navigate(user ? '/feed' : '/login')}>
            {user ? 'Go to Newsroom' : 'Get Started'}
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section">
        <motion.div 
          className="hero-content"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="hero-title">Your all-in-one platform for knowledge sharing</h1>
          <p className="hero-subtitle">
            Redefining how teams discover, save, and discuss important content. A seamless experience from your feed to the analytics dashboard.
          </p>
          <div className="hero-actions">
            <button className="landing-btn-primary" onClick={() => navigate(user ? '/feed' : '/login')} style={{ padding: '1rem 2rem', fontSize: '1.1rem' }}>
              {user ? 'Go to Newsroom' : 'Sign up'}
            </button>
            <button className="landing-btn-secondary" onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })}>
              See Features
            </button>
          </div>
          
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            style={{ marginTop: '4rem' }}
          >
            <motion.img 
              src={aboutMockup} 
              alt="Dashboard Preview" 
              style={{ width: '100%', maxWidth: '900px', borderRadius: '12px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', border: '1px solid #e2e8f0', cursor: 'pointer' }} 
              animate={{ 
                y: ["0%", "-3%", "0%"],
                rotate: [0, 1.5, -1.5, 0],
                boxShadow: ["0 25px 50px -12px rgba(0, 0, 0, 0.25)", "0 35px 60px -15px rgba(99, 102, 241, 0.4)", "0 25px 50px -12px rgba(0, 0, 0, 0.25)"],
                transition: {
                  duration: 6,
                  ease: "easeInOut",
                  repeat: Infinity,
                }
              }}
            />
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" className="features-section">
        <div className="section-header">
          <h2>Powerful tools. Incredible results.</h2>
          <p>Everything you need to source, track, and engage with content effortlessly.</p>
        </div>
        
        <div className="features-grid">
          {features.map((feature, idx) => (
            <motion.div 
              key={idx} 
              className="feature-card"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
            >
              <div className="feature-icon-wrapper">
                {feature.icon}
              </div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* About Us Section */}
      <section id="about" className="about-section">
        <motion.div 
          className="about-content"
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
        >
          <h2>We solve real problems, not just add features</h2>
          <p>
            Most platforms are full of features you'll never use. We focus on the stuff that actually moves the needle. Better discovery. Less noise. Real productivity gains.
          </p>
          <p>
            We use great design to hide complexity, making sure the software feels easy because we've done the hard work under the hood.
          </p>
          
          <div className="stats-grid">
            <div className="stat-item">
              <h4>30K+</h4>
              <p>Active Users</p>
            </div>
            <div className="stat-item">
              <h4>2.1M</h4>
              <p>Articles Read</p>
            </div>
            <div className="stat-item">
              <h4>98%</h4>
              <p>Satisfaction</p>
            </div>
          </div>
        </motion.div>
        
        <motion.div 
          className="about-image"
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
        >
          {/* using creative admin dashboard mockup for about image */}
          <img src={adminMockup} alt="Creative Nexa Admin Dashboard Mockup" style={{ width: '100%', display: 'block' }} />
        </motion.div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="faq-section">
        <div className="section-header">
          <h2>Frequently Asked Questions</h2>
          <p>Got questions? We've got answers.</p>
        </div>
        
        <div className="faq-list">
          {faqs.map((faq, idx) => (
            <FAQItem key={idx} question={faq.question} answer={faq.answer} />
          ))}
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="contact-section">
        <div className="contact-content">
          <h2>Get in Touch</h2>
          <p>Have questions or want to learn more? We'd love to hear from you.</p>
          <a href="mailto:2005sehalarpit@gmail.com" style={{ color: '#6366f1', fontWeight: '600', fontSize: '1.125rem', marginTop: '1.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
            <Globe size={20} />
            2005sehalarpit@gmail.com
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-content">
          <div className="footer-col">
            <a href="/" className="landing-logo" style={{ color: 'white', marginBottom: '1.5rem', display: 'inline-flex', alignItems: 'center' }}>
              <img src="/Nexa.png" alt="Nexa Logo" style={{ width: '28px', height: '28px', objectFit: 'contain', marginRight: '0.5rem' }} />
              Nexa
            </a>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '1rem' }}>
              Your personal AI powered newsroom.
            </p>
          </div>
          
          <div className="footer-col">
            <h4>Product</h4>
            <ul>
              <li><a href="#features">Features</a></li>
              <li><a href="#">Pricing</a></li>
              <li><a href="#">Security</a></li>
            </ul>
          </div>
          
          <div className="footer-col">
            <h4>Company</h4>
            <ul>
              <li><a href="#about">About us</a></li>
              <li><a href="#">Careers</a></li>
              <li><a href="#contact">Contact</a></li>
            </ul>
          </div>
          
          <div className="footer-col">
            <h4>Legal</h4>
            <ul>
              <li><a href="#">Privacy Policy</a></li>
              <li><a href="#">Terms of Service</a></li>
              <li><a href="#">Cookie Policy</a></li>
            </ul>
          </div>
        </div>
        
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Nexa Technology. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
