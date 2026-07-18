import React, { useState, useContext, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useSpring,
  useTransform,
  useInView,
  useReducedMotion,
  useScroll,
} from 'framer-motion';
import {
  CheckCircle2,
  Users,
  BarChart3,
  Smartphone,
  ShieldCheck,
  Zap,
  ChevronDown,
  Globe,
  Headphones,
  Bot,
  Sparkles,
  ArrowRight,
  Menu,
  X,
  Mail,
} from 'lucide-react';
import './LandingPage.css';
import aboutMockup from '../assets/about-mockup.png';
import adminMockup from '../assets/admin-mockup.png';

/* ---------------------------------- data --------------------------------- */

const FEATURES = [
  {
    icon: Users,
    title: 'Real-time Feed',
    description:
      'Stay updated with a curated feed of news, articles, and discussions happening right now.',
  },
  {
    icon: CheckCircle2,
    title: 'Smart Bookmarks',
    description:
      'Save important articles and resources for later reading with our intelligent bookmarking system.',
  },
  {
    icon: BarChart3,
    title: 'Admin Analytics',
    description:
      'Powerful dashboard and reporting tools to understand user engagement and platform growth.',
  },
  {
    icon: Smartphone,
    title: 'Mobile Optimized',
    description:
      'Access your feed and manage your workflow anywhere with our fully responsive mobile design.',
  },
  {
    icon: Headphones,
    title: 'Listen to News',
    description:
      'Listen to the latest news on the go with our integrated text-to-speech audio player.',
  },
  {
    icon: Bot,
    title: 'Ask AI',
    description:
      'Get instant summaries and context on any article by asking our intelligent AI assistant.',
  },
];

const STATS = [
  { value: 30, suffix: 'K+', label: 'Active Users' },
  { value: 2.1, suffix: 'M', decimals: 1, label: 'Articles Read' },
  { value: 98, suffix: '%', label: 'Satisfaction' },
];

const FAQS = [
  {
    question: 'How does Nexa personalize my news feed?',
    answer:
      'Nexa uses advanced AI algorithms and your selected interests to curate a daily intel feed specifically tailored to your unique profile, ensuring you only see the news that matters most to you.',
  },
  {
    question: 'Do I need to download an app?',
    answer:
      'Our platform is fully web-based and highly responsive, meaning you can access it from any browser on desktop, tablet, or mobile without needing to download a separate app.',
  },
  {
    question: 'How secure is my data?',
    answer:
      'We use enterprise-grade encryption and partner with industry leaders like Google Firebase to ensure your data is stored securely and compliantly.',
  },
  {
    question: 'What does Nexa Intelligence provide?',
    answer:
      'Nexa Intelligence is our powerful admin analytics dashboard that provides real-time data on user engagement, registered readers, and platform activity.',
  },
];

const NAV_LINKS = [
  { href: '#features', label: 'Features' },
  { href: '#about', label: 'About' },
  { href: '#faq', label: 'FAQ' },
  { href: '#contact', label: 'Contact' },
];

/* -------------------------------- primitives ------------------------------ */

/** Fades + lifts its children into view once they enter the viewport. */
const Reveal = ({ children, delay = 0, y = 28, className = '', ...rest }) => {
  const reduced = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={reduced ? { opacity: 0 } : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      {...rest}
    >
      {children}
    </motion.div>
  );
};

/** Tracks the pointer inside a card so CSS can draw a glow that follows it. */
const useSpotlight = () => {
  const ref = useRef(null);

  const onMouseMove = (e) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty('--mx', `${e.clientX - rect.left}px`);
    el.style.setProperty('--my', `${e.clientY - rect.top}px`);
  };

  return { ref, onMouseMove };
};

/** Counts from 0 to `value` the first time it scrolls into view. */
const CountUp = ({ value, decimals = 0, suffix = '' }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  const reduced = useReducedMotion();
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView || reduced) return;

    const duration = 1600;
    let frame;
    let start;

    const tick = (now) => {
      if (start === undefined) start = now;
      const progress = Math.min((now - start) / duration, 1);
      // easeOutExpo — fast start, gentle landing
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setDisplay(value * eased);
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, value, reduced]);

  // With reduced motion we skip the animation and show the final number outright.
  const shown = reduced ? value : display;

  return (
    <span ref={ref}>
      {shown.toFixed(decimals)}
      {suffix}
    </span>
  );
};

/* --------------------------------- sections ------------------------------- */

const AuroraBackdrop = () => (
  <div className="aurora" aria-hidden="true">
    <span className="aurora-blob aurora-blob-1" />
    <span className="aurora-blob aurora-blob-2" />
    <span className="aurora-blob aurora-blob-3" />
    <div className="aurora-grid" />
    <div className="aurora-vignette" />
  </div>
);

const Navbar = ({ user, navigate }) => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const go = () => navigate(user ? '/feed' : '/login');

  return (
    <motion.nav
      className={`landing-nav ${scrolled ? 'is-scrolled' : ''}`}
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      <a href="/" className="landing-logo">
        <img src="/Nexa.png" alt="" className="landing-logo-mark" />
        <span>Nexa</span>
      </a>

      <div className="landing-nav-links">
        {NAV_LINKS.map((link) => (
          <a key={link.href} href={link.href}>
            {link.label}
          </a>
        ))}
      </div>

      <div className="landing-nav-actions">
        <button className="btn btn-primary" onClick={go}>
          {user ? 'Go to Newsroom' : 'Get Started'}
          <ArrowRight size={16} />
        </button>
        <button
          className="nav-toggle"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="nav-drawer"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
          >
            {NAV_LINKS.map((link) => (
              <a key={link.href} href={link.href} onClick={() => setMenuOpen(false)}>
                {link.label}
              </a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

const HeroMockup = ({ src }) => {
  const reduced = useReducedMotion();
  const wrapRef = useRef(null);

  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rotateX = useSpring(useTransform(my, [-0.5, 0.5], [8, -8]), {
    stiffness: 140,
    damping: 18,
  });
  const rotateY = useSpring(useTransform(mx, [-0.5, 0.5], [-10, 10]), {
    stiffness: 140,
    damping: 18,
  });

  const onMouseMove = (e) => {
    if (reduced) return;
    const rect = wrapRef.current.getBoundingClientRect();
    mx.set((e.clientX - rect.left) / rect.width - 0.5);
    my.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const onMouseLeave = () => {
    mx.set(0);
    my.set(0);
  };

  return (
    <motion.div
      className="hero-mockup-stage"
      ref={wrapRef}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      initial={{ opacity: 0, y: 60, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 1, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.div
        className="hero-mockup-frame"
        style={reduced ? undefined : { rotateX, rotateY }}
      >
        <div className="hero-mockup-glow" aria-hidden="true" />
        <img src={src} alt="Nexa newsroom dashboard preview" />
        <div className="hero-mockup-sheen" aria-hidden="true" />
      </motion.div>
      <div className="hero-mockup-reflection" aria-hidden="true" />
    </motion.div>
  );
};

const FeatureCard = ({ feature, index }) => {
  const { ref, onMouseMove } = useSpotlight();
  const Icon = feature.icon;

  return (
    <Reveal delay={index * 0.08}>
      <article className="feature-card" ref={ref} onMouseMove={onMouseMove}>
        <div className="feature-card-spot" aria-hidden="true" />
        <div className="feature-icon">
          <Icon size={22} />
        </div>
        <h3>{feature.title}</h3>
        <p>{feature.description}</p>
      </article>
    </Reveal>
  );
};

const FAQItem = ({ question, answer, isOpen, onToggle }) => (
  <div className={`faq-item ${isOpen ? 'is-open' : ''}`}>
    <button className="faq-question" onClick={onToggle} aria-expanded={isOpen}>
      <span>{question}</span>
      <motion.span
        className="faq-chevron"
        animate={{ rotate: isOpen ? 180 : 0 }}
        transition={{ duration: 0.3 }}
      >
        <ChevronDown size={18} />
      </motion.span>
    </button>
    <AnimatePresence initial={false}>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
          style={{ overflow: 'hidden' }}
        >
          <p className="faq-answer">{answer}</p>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

/* ---------------------------------- page ---------------------------------- */

const LandingPage = () => {
  const navigate = useNavigate();
  const { user } = useContext(AppContext);
  const [openFaq, setOpenFaq] = useState(null);
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.3 });

  const go = () => navigate(user ? '/feed' : '/login');

  return (
    <div className="landing">
      <motion.div className="scroll-progress" style={{ scaleX: progress }} aria-hidden="true" />
      <AuroraBackdrop />
      <Navbar user={user} navigate={navigate} />

      {/* Hero */}
      <section className="hero">
        <motion.div
          className="hero-badge"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.05 }}
        >
          <Sparkles size={14} />
          AI-curated intel, updated every minute
        </motion.div>

        <motion.h1
          className="hero-title"
          initial={{ opacity: 0, y: 26 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
        >
          Your personalized
          <br />
          AI-powered <span className="shine">newsroom</span>
        </motion.h1>

        <motion.p
          className="hero-subtitle"
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, delay: 0.22 }}
        >
          Redefining how you discover, save, and consume important content — a seamless
          experience from your tailored feed to deep AI analytics.
        </motion.p>

        <motion.div
          className="hero-actions"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, delay: 0.3 }}
        >
          <button className="btn btn-primary btn-lg" onClick={go}>
            {user ? 'Go to Newsroom' : 'Sign up free'}
            <ArrowRight size={18} />
          </button>
          <button
            className="btn btn-ghost btn-lg"
            onClick={() =>
              document.getElementById('features').scrollIntoView({ behavior: 'smooth' })
            }
          >
            See features
          </button>
        </motion.div>

        <motion.ul
          className="hero-trust"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.45 }}
        >
          <li>
            <ShieldCheck size={15} /> Enterprise-grade security
          </li>
          <li>
            <Zap size={15} /> Real-time updates
          </li>
          <li>
            <Globe size={15} /> Works on every device
          </li>
        </motion.ul>

        <HeroMockup src={aboutMockup} />
      </section>

      {/* Features */}
      <section id="features" className="section">
        <Reveal className="section-header">
          <span className="eyebrow">Features</span>
          <h2>
            Powerful tools. <span className="muted-grad">Incredible results.</span>
          </h2>
          <p>Everything you need to source, track, and engage with content effortlessly.</p>
        </Reveal>

        <div className="features-grid">
          {FEATURES.map((feature, idx) => (
            <FeatureCard key={feature.title} feature={feature} index={idx} />
          ))}
        </div>
      </section>

      {/* About */}
      <section id="about" className="section about">
        <Reveal className="about-copy">
          <span className="eyebrow">About us</span>
          <h2>We solve real problems, not just add features</h2>
          <p>
            Most platforms are full of features you'll never use. We focus on the stuff that
            actually moves the needle. Better discovery. Less noise. Real productivity gains.
          </p>
          <p>
            We use great design to hide complexity, making sure the software feels easy because
            we've done the hard work under the hood.
          </p>

          <div className="stats-grid">
            {STATS.map((stat) => (
              <div className="stat" key={stat.label}>
                <h4>
                  <CountUp
                    value={stat.value}
                    decimals={stat.decimals}
                    suffix={stat.suffix}
                  />
                </h4>
                <p>{stat.label}</p>
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal className="about-visual" delay={0.12}>
          <div className="about-frame">
            <img src={adminMockup} alt="Nexa admin analytics dashboard" />
          </div>
        </Reveal>
      </section>

      {/* FAQ */}
      <section id="faq" className="section faq">
        <Reveal className="section-header">
          <span className="eyebrow">FAQ</span>
          <h2>Frequently asked questions</h2>
          <p>Got questions? We've got answers.</p>
        </Reveal>

        <div className="faq-list">
          {FAQS.map((faq, idx) => (
            <Reveal key={faq.question} delay={idx * 0.06}>
              <FAQItem
                question={faq.question}
                answer={faq.answer}
                isOpen={openFaq === idx}
                onToggle={() => setOpenFaq(openFaq === idx ? null : idx)}
              />
            </Reveal>
          ))}
        </div>
      </section>

      {/* Contact / CTA */}
      <section id="contact" className="section">
        <Reveal className="cta-panel">
          <div className="cta-glow" aria-hidden="true" />
          <h2>Ready to cut through the noise?</h2>
          <p>
            Join thousands of readers who get exactly the news they care about — nothing more.
          </p>
          <div className="cta-actions">
            <button className="btn btn-primary btn-lg" onClick={go}>
              {user ? 'Go to Newsroom' : 'Get started free'}
              <ArrowRight size={18} />
            </button>
            <a className="cta-mail" href="mailto:2005sehalarpit@gmail.com">
              <Mail size={17} />
              2005sehalarpit@gmail.com
            </a>
          </div>
        </Reveal>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-grid">
          <div className="footer-brand">
            <a href="/" className="landing-logo">
              <img src="/Nexa.png" alt="" className="landing-logo-mark" />
              <span>Nexa</span>
            </a>
            <p>Your personal AI-powered newsroom.</p>
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
