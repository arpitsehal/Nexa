import React, { useState, useContext, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import {
  motion,
  AnimatePresence,
  useInView,
  useReducedMotion,
  useScroll,
  useTransform,
} from 'framer-motion';
import {
  ArrowRight,
  ArrowUpRight,
  Plus,
  Menu,
  X,
  Mail,
  Download,
  Rss,
  Bookmark,
  BarChart3,
  Smartphone,
  Headphones,
  Bot,
  Star,
} from 'lucide-react';
import './LandingPage.css';
import aboutMockup from '../assets/about-mockup.png';
import adminMockup from '../assets/admin-mockup.png';
import heroMockup from '../assets/hero-mockup.png';

/* ---------------------------------- data --------------------------------- */

const NAV_LINKS = [
  { href: '#services', label: 'Features' },
  { href: '#process', label: 'How it works' },
  { href: '#about', label: 'About' },
  { href: '#faq', label: 'FAQ' },
];

const TOPICS = [
  'World',
  'Technology',
  'Markets',
  'Science',
  'Startups',
  'Politics',
  'Climate',
  'Sports',
  'Health',
  'AI & Research',
  'Culture',
  'Space',
];

const STATS = [
  { value: 30, suffix: 'K+', label: 'Active readers' },
  { value: 2.1, suffix: 'M', decimals: 1, label: 'Articles read' },
  { value: 98, suffix: '%', label: 'Reader satisfaction' },
  { value: 24, suffix: '/7', label: 'Live feed updates' },
];

const FEATURES = [
  {
    icon: Rss,
    title: 'Real-time feed',
    description:
      'A curated stream of news, articles, and discussions happening right now — tuned to what you care about.',
  },
  {
    icon: Bookmark,
    title: 'Smart bookmarks',
    description:
      'Save important stories and resources for later with an intelligent bookmarking system.',
  },
  {
    icon: Bot,
    title: 'Ask AI',
    description:
      'Instant summaries and context on any article from a built-in AI assistant.',
  },
  {
    icon: Headphones,
    title: 'Listen to news',
    description:
      'Catch up on the go with an integrated text-to-speech audio player.',
  },
  {
    icon: BarChart3,
    title: 'Admin analytics',
    description:
      'Dashboards and reporting that show engagement, readers, and platform growth.',
  },
  {
    icon: Smartphone,
    title: 'Mobile ready',
    description:
      'Fully responsive on the web, plus a native Android app for reading anywhere.',
  },
];

const STEPS = [
  {
    key: 'discover',
    title: 'Discover',
    lead: 'Pick your interests once.',
    body:
      'Choose the topics you follow and Nexa builds a daily intel feed around your profile, filtering out the noise before it reaches you.',
    points: ['Interest-based curation', 'Live updates every minute', 'Zero clutter'],
    image: heroMockup,
  },
  {
    key: 'save',
    title: 'Save',
    lead: 'Keep what matters.',
    body:
      'Bookmark stories in one tap and come back to them from any device. Your reading list stays in sync everywhere.',
    points: ['One-tap bookmarks', 'Synced across devices', 'Organised reading list'],
    image: aboutMockup,
  },
  {
    key: 'understand',
    title: 'Understand',
    lead: 'Go deeper with AI.',
    body:
      'Ask the assistant for a summary, background, or the other side of a story, or listen to it read aloud while you commute.',
    points: ['AI summaries & context', 'Text-to-speech player', 'Follow-up questions'],
    image: aboutMockup,
  },
  {
    key: 'measure',
    title: 'Measure',
    lead: 'See the whole picture.',
    body:
      'Nexa Intelligence gives admins real-time data on engagement, registered readers, and platform activity.',
    points: ['Engagement analytics', 'Reader growth', 'Live activity'],
    image: adminMockup,
  },
];

const FAQS = [
  {
    question: 'How does Nexa personalize my news feed?',
    answer:
      'Nexa uses AI and your selected interests to curate a daily intel feed tailored to your profile, so you only see the news that matters most to you.',
  },
  {
    question: 'Do I need to download an app?',
    answer:
      'No. Nexa is fully web-based and responsive, so it works in any browser on desktop, tablet, or mobile. If you prefer a native experience, an Android app is also available.',
  },
  {
    question: 'How secure is my data?',
    answer:
      'We use enterprise-grade encryption and Google Firebase to make sure your data is stored securely and compliantly.',
  },
  {
    question: 'What does Nexa Intelligence provide?',
    answer:
      'Nexa Intelligence is the admin analytics dashboard, with real-time data on user engagement, registered readers, and platform activity.',
  },
];

const EASE = [0.22, 1, 0.36, 1];

/* -------------------------------- primitives ------------------------------ */

/** Fades + lifts its children into view once they enter the viewport. */
const Reveal = ({ children, delay = 0, y = 32, className = '', as = 'div', ...rest }) => {
  const reduced = useReducedMotion();
  const Tag = motion[as];

  return (
    <Tag
      className={className}
      initial={reduced ? { opacity: 0 } : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.8, delay, ease: EASE }}
      {...rest}
    >
      {children}
    </Tag>
  );
};

/** Headline whose words slide up out of a mask, one after another. */
const SplitHeading = ({ text, className = '', delay = 0, as = 'h2', accent }) => {
  const reduced = useReducedMotion();
  const Tag = motion[as];
  const words = text.split(' ');
  const wordVariants = {
    hidden: reduced ? { opacity: 0 } : { y: '110%' },
    shown: (i) => ({
      ...(reduced ? { opacity: 1 } : { y: '0%' }),
      transition: { duration: 0.9, delay: delay + i * 0.06, ease: EASE },
    }),
  };

  // The in-view trigger lives on the heading, not the words: each word starts
  // translated outside its overflow mask, so an observer on it would never fire.
  return (
    <Tag
      className={className}
      aria-label={text}
      initial="hidden"
      whileInView="shown"
      viewport={{ once: true, margin: '-40px' }}
    >
      {words.map((word, i) => (
        // The space sits outside the inline-block mask, where it would be trimmed.
        <React.Fragment key={`${word}-${i}`}>
          <span className="word-mask" aria-hidden="true">
            <motion.span
              className={`word ${accent === word ? 'accent' : ''}`}
              variants={wordVariants}
              custom={i}
            >
              {word}
            </motion.span>
          </span>
          {i < words.length - 1 && ' '}
        </React.Fragment>
      ))}
    </Tag>
  );
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
      <span className="stat-suffix">{suffix}</span>
    </span>
  );
};

/** Infinite horizontal ticker. Content is rendered twice so the loop is seamless. */
const Marquee = ({ items, reverse = false, dark = false }) => (
  <div className={`marquee ${dark ? 'marquee-dark' : ''}`} aria-hidden="true">
    <div className={`marquee-track ${reverse ? 'is-reverse' : ''}`}>
      {[0, 1].map((copy) => (
        <div className="marquee-group" key={copy}>
          {items.map((item) => (
            <span className="marquee-item" key={`${copy}-${item}`}>
              {item}
              <span className="marquee-star">✦</span>
            </span>
          ))}
        </div>
      ))}
    </div>
  </div>
);

/* --------------------------------- sections ------------------------------- */

const Navbar = ({ user, go }) => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <motion.header
      className={`pn-nav ${scrolled ? 'is-scrolled' : ''}`}
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: EASE }}
    >
      <div className="pn-nav-inner">
        <a href="/" className="pn-logo">
          <img src="/Nexa.png" alt="" />
          <span>Nexa</span>
        </a>

        <nav className="pn-nav-links" aria-label="Primary">
          {NAV_LINKS.map((link) => (
            <a key={link.href} href={link.href}>
              {link.label}
            </a>
          ))}
        </nav>

        <div className="pn-nav-actions">
          {!user && (
            <button className="pn-link-btn" onClick={go}>
              Log in
            </button>
          )}
          <button className="pn-btn pn-btn-dark" onClick={go}>
            {user ? 'Open newsroom' : "Let's start"}
            <span className="pn-btn-icon">
              <ArrowUpRight size={16} />
            </span>
          </button>
          <button
            className="pn-nav-toggle"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.nav
            className="pn-drawer"
            aria-label="Mobile"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
          >
            {NAV_LINKS.map((link) => (
              <a key={link.href} href={link.href} onClick={() => setMenuOpen(false)}>
                {link.label}
                <ArrowRight size={18} />
              </a>
            ))}
          </motion.nav>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

const Hero = ({ user, go }) => {
  const reduced = useReducedMotion();
  const mediaRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: mediaRef,
    offset: ['start end', 'end start'],
  });
  // The showcase card opens up from a slightly inset, scaled-down state as it scrolls in.
  const scale = useTransform(scrollYProgress, [0, 0.45], [0.9, 1]);
  const imgY = useTransform(scrollYProgress, [0, 1], ['-6%', '6%']);

  return (
    <section className="pn-hero">
      <div className="pn-container">
        <motion.div
          className="pn-hero-rating"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <span className="pn-stars" aria-hidden="true">
            {[0, 1, 2, 3, 4].map((i) => (
              <Star key={i} size={14} fill="currentColor" />
            ))}
          </span>
          Loved by 30K+ readers
        </motion.div>

        <SplitHeading
          as="h1"
          className="pn-hero-title"
          text="AI-Powered News, Curated For You"
          accent="You"
          delay={0.15}
        />

        <div className="pn-hero-bottom">
          <motion.p
            className="pn-hero-sub"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5, ease: EASE }}
          >
            Nexa is your personal newsroom. Discover, save, listen to, and understand the
            stories that matter — without the noise.
          </motion.p>

          <motion.div
            className="pn-hero-actions"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6, ease: EASE }}
          >
            <button className="pn-btn pn-btn-accent pn-btn-lg" onClick={go}>
              {user ? 'Open newsroom' : 'Get started free'}
              <span className="pn-btn-icon">
                <ArrowUpRight size={18} />
              </span>
            </button>
            <a className="pn-btn pn-btn-outline pn-btn-lg" href="/Nexa.apk" download>
              <Download size={18} />
              Android app
            </a>
          </motion.div>
        </div>
      </div>

      <div className="pn-container">
        <motion.div
          ref={mediaRef}
          className="pn-showcase"
          style={reduced ? undefined : { scale }}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5, ease: EASE }}
        >
          <div className="pn-showcase-glow" aria-hidden="true" />
          <motion.img
            src={aboutMockup}
            alt="Nexa newsroom dashboard preview"
            style={reduced ? undefined : { y: imgY }}
          />
          <div className="pn-showcase-tag">
            <span className="pn-live-dot" /> Live feed
          </div>
        </motion.div>
      </div>
    </section>
  );
};

const Stats = () => (
  <section className="pn-section pn-stats-section">
    <div className="pn-container">
      <div className="pn-section-head pn-split">
        <Reveal>
          <span className="pn-eyebrow">(01) By the numbers</span>
        </Reveal>
        <SplitHeading
          className="pn-h2"
          text="A newsroom people actually return to"
          accent="return"
        />
      </div>

      <div className="pn-stats">
        {STATS.map((stat, i) => (
          <Reveal key={stat.label} className="pn-stat" delay={i * 0.08}>
            <div className="pn-stat-value">
              <CountUp value={stat.value} decimals={stat.decimals} suffix={stat.suffix} />
            </div>
            <p>{stat.label}</p>
          </Reveal>
        ))}
      </div>
    </div>
  </section>
);

const Services = () => (
  <section id="services" className="pn-section">
    <div className="pn-container">
      <div className="pn-section-head pn-split">
        <Reveal>
          <span className="pn-eyebrow">(02) Features</span>
        </Reveal>
        <div>
          <SplitHeading
            className="pn-h2"
            text="Everything you need to stay informed"
            accent="informed"
          />
          <Reveal as="p" className="pn-lead" delay={0.2}>
            Powerful tools to source, track, and engage with content — designed so the
            complexity stays under the hood.
          </Reveal>
        </div>
      </div>

      <div className="pn-services">
        {FEATURES.map((feature, i) => {
          const Icon = feature.icon;
          return (
            <Reveal key={feature.title} delay={(i % 3) * 0.08}>
              <article className="pn-service">
                <div className="pn-service-top">
                  <span className="pn-service-index">{String(i + 1).padStart(2, '0')}</span>
                  <span className="pn-service-icon">
                    <Icon size={22} />
                  </span>
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
                <span className="pn-service-arrow" aria-hidden="true">
                  <ArrowUpRight size={20} />
                </span>
              </article>
            </Reveal>
          );
        })}
      </div>
    </div>
  </section>
);

const Process = () => {
  const [active, setActive] = useState(0);
  const step = STEPS[active];

  return (
    <section id="process" className="pn-section pn-dark">
      <div className="pn-container">
        <div className="pn-section-head pn-split">
          <Reveal>
            <span className="pn-eyebrow">(03) How it works</span>
          </Reveal>
          <SplitHeading
            className="pn-h2"
            text="From headline to insight in four steps"
            accent="insight"
          />
        </div>

        <div className="pn-tabs" role="tablist" aria-label="How Nexa works">
          {STEPS.map((s, i) => (
            <button
              key={s.key}
              role="tab"
              id={`tab-${s.key}`}
              aria-selected={active === i}
              aria-controls={`panel-${s.key}`}
              className={`pn-tab ${active === i ? 'is-active' : ''}`}
              onClick={() => setActive(i)}
            >
              <span className="pn-tab-num">0{i + 1}</span>
              {s.title}
              {active === i && (
                <motion.span className="pn-tab-pill" layoutId="tab-pill" transition={{ duration: 0.45, ease: EASE }} />
              )}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step.key}
            id={`panel-${step.key}`}
            role="tabpanel"
            aria-labelledby={`tab-${step.key}`}
            className="pn-panel"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.45, ease: EASE }}
          >
            <div className="pn-panel-copy">
              <h3>{step.lead}</h3>
              <p>{step.body}</p>
              <ul>
                {step.points.map((point) => (
                  <li key={point}>
                    <span className="pn-check" aria-hidden="true" />
                    {point}
                  </li>
                ))}
              </ul>
            </div>
            <div className="pn-panel-media">
              <img src={step.image} alt={`${step.title} in Nexa`} />
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <Marquee items={TOPICS} dark reverse />
    </section>
  );
};

const About = () => (
  <section id="about" className="pn-section">
    <div className="pn-container pn-about">
      <div className="pn-about-copy">
        <Reveal>
          <span className="pn-eyebrow">(04) About us</span>
        </Reveal>
        <SplitHeading
          className="pn-h2"
          text="We solve real problems, not just add features"
          accent="problems,"
        />
        <Reveal as="p" className="pn-lead" delay={0.15}>
          Most platforms are full of features you'll never use. We focus on what actually
          moves the needle: better discovery, less noise, real productivity gains.
        </Reveal>
        <Reveal as="p" className="pn-lead" delay={0.22}>
          Great design hides the complexity, so the product feels easy because we've done
          the hard work underneath.
        </Reveal>
        <Reveal className="pn-about-points" delay={0.3}>
          <div>
            <strong>Firebase</strong>
            <span>Secure by default</span>
          </div>
          <div>
            <strong>Gemini AI</strong>
            <span>Summaries & context</span>
          </div>
          <div>
            <strong>Web + Android</strong>
            <span>Read anywhere</span>
          </div>
        </Reveal>
      </div>

      <Reveal className="pn-about-media" delay={0.1}>
        <img src={adminMockup} alt="Nexa admin analytics dashboard" />
        <div className="pn-about-badge">
          <span className="pn-about-badge-num">98%</span>
          <span>of readers would recommend Nexa</span>
        </div>
      </Reveal>
    </div>
  </section>
);

const FAQ = () => {
  const [open, setOpen] = useState(0);

  return (
    <section id="faq" className="pn-section pn-muted">
      <div className="pn-container pn-faq">
        <div className="pn-faq-head">
          <Reveal>
            <span className="pn-eyebrow">(05) FAQ</span>
          </Reveal>
          <SplitHeading className="pn-h2" text="Questions, answered" accent="answered" />
          <Reveal as="p" className="pn-lead" delay={0.15}>
            Can't find what you're looking for? Write to us and we'll get back to you.
          </Reveal>
        </div>

        <div className="pn-faq-list">
          {FAQS.map((faq, i) => {
            const isOpen = open === i;
            return (
              <Reveal key={faq.question} delay={i * 0.06}>
                <div className={`pn-faq-item ${isOpen ? 'is-open' : ''}`}>
                  <button
                    className="pn-faq-q"
                    onClick={() => setOpen(isOpen ? null : i)}
                    aria-expanded={isOpen}
                  >
                    <span>{faq.question}</span>
                    <span className="pn-faq-icon" aria-hidden="true">
                      <Plus size={18} />
                    </span>
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.35, ease: EASE }}
                        style={{ overflow: 'hidden' }}
                      >
                        <p className="pn-faq-a">{faq.answer}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
};

const CTA = ({ user, go }) => (
  <section id="contact" className="pn-section">
    <div className="pn-container">
      <Reveal className="pn-cta">
        <div className="pn-cta-glow" aria-hidden="true" />
        <span className="pn-eyebrow pn-eyebrow-light">Ready when you are</span>
        <SplitHeading
          className="pn-cta-title"
          text="Let's cut through the noise"
          accent="noise"
        />
        <p>Join thousands of readers who get exactly the news they care about — nothing more.</p>
        <div className="pn-cta-actions">
          <button className="pn-btn pn-btn-accent pn-btn-lg" onClick={go}>
            {user ? 'Open newsroom' : 'Get started free'}
            <span className="pn-btn-icon">
              <ArrowUpRight size={18} />
            </span>
          </button>
          <a className="pn-cta-mail" href="mailto:2005sehalarpit@gmail.com">
            <Mail size={17} />
            2005sehalarpit@gmail.com
          </a>
        </div>
      </Reveal>
    </div>
  </section>
);

const Footer = () => (
  <footer className="pn-footer">
    <div className="pn-container">
      <div className="pn-footer-grid">
        <div className="pn-footer-brand">
          <a href="/" className="pn-logo pn-logo-light">
            <img src="/Nexa.png" alt="" />
            <span>Nexa</span>
          </a>
          <p>Your personal AI-powered newsroom.</p>
        </div>

        <div className="pn-footer-col">
          <h4>Product</h4>
          <ul>
            <li><a href="#services">Features</a></li>
            <li><a href="#process">How it works</a></li>
            <li><a href="/Nexa.apk" download>Android app</a></li>
          </ul>
        </div>

        <div className="pn-footer-col">
          <h4>Company</h4>
          <ul>
            <li><a href="#about">About us</a></li>
            <li><a href="#faq">FAQ</a></li>
            <li><a href="#contact">Contact</a></li>
          </ul>
        </div>

        <div className="pn-footer-col">
          <h4>Legal</h4>
          <ul>
            <li><a href="#">Privacy Policy</a></li>
            <li><a href="#">Terms of Service</a></li>
            <li><a href="#">Cookie Policy</a></li>
          </ul>
        </div>
      </div>

      <div className="pn-footer-word" aria-hidden="true">
        Nexa<span>.</span>
      </div>

      <div className="pn-footer-bottom">
        <span>© {new Date().getFullYear()} Nexa Technology. All rights reserved.</span>
        <a href="#top">Back to top ↑</a>
      </div>
    </div>
  </footer>
);

/* ---------------------------------- page ---------------------------------- */

const LandingPage = () => {
  const navigate = useNavigate();
  const { user } = useContext(AppContext);
  const go = () => navigate(user ? '/feed' : '/login');

  return (
    <div className="pn" id="top">
      <Navbar user={user} go={go} />
      <main>
        <Hero user={user} go={go} />
        <Marquee items={TOPICS} />
        <Stats />
        <Services />
        <Process />
        <About />
        <FAQ />
        <CTA user={user} go={go} />
      </main>
      <Footer />
    </div>
  );
};

export default LandingPage;
