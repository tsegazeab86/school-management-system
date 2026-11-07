import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  GraduationCap,
  Menu,
  X,
  ArrowRight,
  BookOpen,
  Users,
  Globe2,
  FlaskConical,
  LibraryBig,
  MonitorSmartphone,
  ShieldCheck,
  Award,
  Target,
  Eye,
  MapPin,
  Phone,
  Mail,
  CalendarDays,
  Sparkles,
  Sun,
  Moon,
} from "lucide-react";

import "./Home.css";

/* =========================================
   IMAGE ASSETS
========================================= */

const images = {
  hero: "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1800&q=85",

  campus:
    "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1200&q=85",

  elementary:
    "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1000&q=85",

  middle:
    "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?auto=format&fit=crop&w=1000&q=85",

  high: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1000&q=85",

  library:
    "https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=1000&q=85",

  lab: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=1000&q=85",

  activity:
    "https://images.unsplash.com/photo-1529390079861-591de354faf5?auto=format&fit=crop&w=1000&q=85",
};

/* =========================================
   SCHOOL LIFE GALLERY
========================================= */

const schoolMoments = [
  {
    title: "Students Learning",
    image:
      "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=900&q=85",
  },
  {
    title: "Football Activities",
    image:
      "https://images.unsplash.com/photo-1521412644187-c49fa049e84d?auto=format&fit=crop&w=900&q=85",
  },
  {
    title: "Science Experiments",
    image: images.lab,
  },
  {
    title: "Reading and Research",
    image: images.library,
  },
  {
    title: "Computer Learning",
    image:
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=85",
  },
  {
    title: "School Activities",
    image: images.activity,
  },
  {
    title: "Our School Campus",
    image: images.campus,
  },
  {
    title: "Creative Learning",
    image: images.elementary,
  },
];

const firstGalleryRow = [
  ...schoolMoments.slice(0, 4),
  ...schoolMoments.slice(0, 4),
];

const secondGalleryRow = [
  ...schoolMoments.slice(4),
  ...schoolMoments.slice(4),
];

/* =========================================
   ACADEMIC PROGRAMS
   NO YELLOW GRADE LABELS
========================================= */

const programs = [
  {
    title: "Elementary School",
    text: "Building strong foundations in literacy, numeracy, creativity and curiosity.",
    image: images.elementary,
    icon: BookOpen,
  },
  {
    title: "Middle School",
    text: "Developing confidence, critical thinking and independent learning skills.",
    image: images.middle,
    icon: Users,
  },
  {
    title: "High School",
    text: "Preparing learners for higher education, careers and responsible citizenship.",
    image: images.high,
    icon: GraduationCap,
  },
];

/* =========================================
   SCHOOL ADVANTAGES
========================================= */

const advantages = [
  {
    icon: Award,
    title: "Qualified Teachers",
    text: "Supportive educators committed to student growth and achievement.",
  },
  {
    icon: LibraryBig,
    title: "Learning Library",
    text: "A welcoming space for reading, research and independent discovery.",
  },
  {
    icon: FlaskConical,
    title: "Science Laboratories",
    text: "Practical learning that turns questions into real understanding.",
  },
  {
    icon: MonitorSmartphone,
    title: "Smart Technology",
    text: "Digital tools that connect learning, communication and school services.",
  },
];

/* =========================================
   NEWS AND EVENTS
========================================= */

const news = [
  {
    tag: "Learning",
    title: "A culture of curiosity and lifelong learning",
    text: "Explore classroom experiences that help students ask questions, collaborate and grow.",
    image: images.activity,
    date: "School life",
  },
  {
    tag: "Facilities",
    title: "Spaces designed to support discovery",
    text: "See how learning environments can encourage reading, creativity and practical skills.",
    image: images.library,
    date: "Our campus",
  },
  {
    tag: "Science",
    title: "Learning through hands-on exploration",
    text: "Practical activities help connect classroom concepts with the world around us.",
    image: images.lab,
    date: "Academics",
  },
];

/* =========================================
   HOME COMPONENT
========================================= */

function Home() {
  const [menuOpen, setMenuOpen] = useState(false);

  /* Load saved theme */

  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem("edumanage-theme") || "light";
    } catch {
      return "light";
    }
  });

  /* Navigation links */

  const navItems = [
    ["Home", "#home"],
    ["About", "#about"],
    ["Academics", "#academics"],
    ["Admissions", "#admissions"],
    ["News", "#news"],
    ["Contact", "#contact"],
  ];

  /* Apply and save theme */

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);

    try {
      localStorage.setItem("edumanage-theme", theme);
    } catch {
      console.warn("Unable to save theme preference.");
    }
  }, [theme]);

  /* Close mobile menu with Escape */

  useEffect(() => {
    const closeOnEscape = (event) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    };

    window.addEventListener("keydown", closeOnEscape);

    return () => {
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  const closeMenu = () => setMenuOpen(false);

  const toggleTheme = () => {
    setTheme((current) =>
      current === "light" ? "dark" : "light"
    );
  };

  return (
    <main className="home-page">

      {/* =====================================
          COMPACT FIXED NAVBAR
          ANNOUNCEMENT BAR REMOVED
      ===================================== */}

      <header className="home-navbar">

        {/* BRAND */}

        <Link
          to="/"
          className="home-brand"
          onClick={closeMenu}
        >
          <span className="home-logo">
            <GraduationCap size={26} />
          </span>

          <span className="brand-details">
            <strong>EduManage</strong>
            <small>SCHOOL MANAGEMENT SYSTEM</small>
          </span>
        </Link>

        {/* DESKTOP AND MOBILE NAVIGATION */}

        <nav
          id="primary-navigation"
          className={`nav-links ${menuOpen ? "open" : ""}`}
          aria-label="Main navigation"
        >
          {navItems.map(([label, href]) => (
            <a
              key={label}
              href={href}
              className="nav-item"
              onClick={closeMenu}
            >
              {label}
            </a>
          ))}

          <Link
            to="/login"
            className="nav-login"
            onClick={closeMenu}
          >
            Login
            <ArrowRight size={16} />
          </Link>
        </nav>

        {/* NAVBAR ACTIONS */}

        <div className="navbar-actions">

          {/* THEME TOGGLE */}

          <button
            type="button"
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === "light" ? "dark" : "light"
              } mode`}
            title={`Switch to ${theme === "light" ? "dark" : "light"
              } mode`}
          >
            {theme === "light" ? (
              <Moon size={18} />
            ) : (
              <Sun size={18} />
            )}

            <span>
              {theme === "light" ? "Dark" : "Light"}
            </span>
          </button>

          {/* MOBILE MENU BUTTON */}

          <button
            type="button"
            className={`mobile-menu-button ${menuOpen ? "active" : ""
              }`}
            onClick={() => setMenuOpen((open) => !open)}
            aria-label={
              menuOpen
                ? "Close navigation menu"
                : "Open navigation menu"
            }
            aria-expanded={menuOpen}
            aria-controls="primary-navigation"
          >
            {menuOpen ? (
              <X size={22} />
            ) : (
              <Menu size={22} />
            )}
          </button>

        </div>
      </header>

      {/* =====================================
          PREMIUM HERO SECTION
      ===================================== */}

      <section className="premium-hero" id="home">

        <div className="premium-hero-bg" />
        <div className="premium-hero-overlay" />

        <div className="premium-hero-content">

          <motion.div
            className="premium-hero-copy"
            initial={{ opacity: 0, y: 35 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9 }}
          >

            <div className="premium-eyebrow">
              <span className="eyebrow-line" />
              <Sparkles size={15} />
              A WORLD OF OPPORTUNITY
            </div>

            <h1>
              Where Bright Minds
              <br />
              <span>Grow Into Leaders.</span>
            </h1>

            <p>
              Nurturing future leaders through academic excellence,
              innovation, creativity and a supportive learning
              environment. Discover a better future from Grade 1
              to Grade 12.
            </p>

            <div className="premium-hero-actions">

              <Link
                to="/admission"
                className="premium-btn-gold"
              >
                <CalendarDays size={17} />
                Apply for Admission
                <ArrowRight size={17} />
              </Link>

              <a
                href="#academics"
                className="premium-btn-outline"
              >
                <BookOpen size={17} />
                Explore Programs
                <ArrowRight size={17} />
              </a>

            </div>

            <div className="premium-trust-note">
              <ShieldCheck size={18} />
              Empowering students. Supporting families.
              Inspiring excellence.
            </div>

          </motion.div>
        </div>

        {/* HERO HIGHLIGHTS */}

        <motion.div
          className="premium-highlight-bar"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >

          <div className="premium-highlight">
            <Globe2 size={27} />
            <div>
              <strong>Quality Education</strong>
              <span>Learning for every student</span>
            </div>
          </div>

          <div className="premium-highlight">
            <Users size={27} />
            <div>
              <strong>Strong Community</strong>
              <span>Students, parents and teachers</span>
            </div>
          </div>

          <div className="premium-highlight">
            <GraduationCap size={29} />
            <div>
              <strong>Grade 1–12</strong>
              <span>Complete learning journey</span>
            </div>
          </div>

          <div className="premium-highlight">
            <FlaskConical size={27} />
            <div>
              <strong>Modern Learning</strong>
              <span>Technology and innovation</span>
            </div>
          </div>

          <div className="premium-highlight">
            <ShieldCheck size={27} />
            <div>
              <strong>Safe Environment</strong>
              <span>A place to learn and grow</span>
            </div>
          </div>

        </motion.div>

        <a
          href="#about"
          className="premium-scroll-indicator"
          aria-label="Scroll to about section"
        >
          <span />
        </a>

      </section>

      {/* =====================================
          MOVING SCHOOL LIFE GALLERY
      ===================================== */}

      <section
        className="school-life-section"
        id="school-life"
      >

        <div className="school-gallery-heading">

          <span className="eyebrow">
            DISCOVER OUR SCHOOL LIFE
          </span>

          <h2>
            Learning, Playing
            <br />
            <em>and Growing Together.</em>
          </h2>

          <p>
            From engaging classroom lessons to sports, creativity
            and exciting activities, every day is an opportunity
            to grow.
          </p>

        </div>

        {/* FIRST ROW - MOVES LEFT */}

        <div className="school-gallery-marquee">
          <div className="school-gallery-track gallery-left">

            {firstGalleryRow.map((item, index) => (
              <motion.article
                className="school-gallery-card"
                key={`first-${index}`}
                whileHover={{ y: -5 }}
              >
                <img
                  src={item.image}
                  alt={item.title}
                  loading="lazy"
                />

                <div className="school-gallery-caption">
                  <span>{item.title}</span>
                  <ArrowRight size={18} />
                </div>
              </motion.article>
            ))}

          </div>
        </div>

        {/* SECOND ROW - MOVES RIGHT */}

        <div className="school-gallery-marquee">
          <div className="school-gallery-track gallery-right">

            {secondGalleryRow.map((item, index) => (
              <motion.article
                className="school-gallery-card"
                key={`second-${index}`}
                whileHover={{ y: -5 }}
              >
                <img
                  src={item.image}
                  alt={item.title}
                  loading="lazy"
                />

                <div className="school-gallery-caption">
                  <span>{item.title}</span>
                  <ArrowRight size={18} />
                </div>
              </motion.article>
            ))}

          </div>
        </div>

      </section>

      {/* =====================================
          ABOUT OUR SCHOOL
      ===================================== */}

      <section
        className="about-section section-pad"
        id="about"
      >

        <div className="about-photo-wrap">

          <img
            src={images.campus}
            alt="School campus"
            loading="lazy"
          />

          <div className="photo-caption">
            <span>01</span>
            <div>
              <strong>A place to belong</strong>
              <small>Growing together every day</small>
            </div>
          </div>

        </div>

        <div className="about-copy">

          <span className="eyebrow">
            03 / ABOUT OUR SCHOOL
          </span>

          <h2>
            More than a school.
            <br />
            <em>A place to thrive.</em>
          </h2>

          <p className="lead">
            We believe every learner deserves the opportunity,
            guidance and encouragement to reach their full potential.
          </p>

          <p>
            EduManage brings the school community together around
            meaningful learning, strong values and clear communication.
            From the first classroom experiences to the final years
            of high school, we support every step forward.
          </p>

          <div className="mission-grid">

            <div>
              <Target size={21} />
              <strong>Our Mission</strong>
              <span>
                To inspire confident, capable and responsible learners.
              </span>
            </div>

            <div>
              <Eye size={21} />
              <strong>Our Vision</strong>
              <span>
                To build a future where every student can thrive.
              </span>
            </div>

          </div>

          <a className="text-link" href="#academics">
            Discover our approach
            <ArrowRight size={17} />
          </a>

        </div>
      </section>

      {/* =====================================
          ACADEMIC PROGRAMS
          NO GRADE LABELS
      ===================================== */}

      <section
        className="academics-section section-pad"
        id="academics"
      >

        <div className="section-heading">

          <span className="eyebrow">
            04 / ACADEMIC PROGRAMS
          </span>

          <h2>
            Every age. Every stage.
            <br />
            <em>Every opportunity.</em>
          </h2>

          <p>
            A continuous learning journey designed around
            the needs of growing students.
          </p>

        </div>

        <div className="program-grid">

          {programs.map((item, index) => {
            const Icon = item.icon;

            return (
              <motion.article
                className="program-card"
                key={item.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -7 }}
              >

                <div className="program-image">
                  <img
                    src={item.image}
                    alt={item.title}
                    loading="lazy"
                  />
                </div>

                <div className="program-body">

                  <span className="program-icon">
                    <Icon size={21} />
                  </span>

                  <h3>{item.title}</h3>

                  <p>{item.text}</p>

                  <a href="#admissions">
                    Explore program
                    <ArrowRight size={16} />
                  </a>

                </div>

              </motion.article>
            );
          })}

        </div>
      </section>

      {/* =====================================
          STATISTICS
      ===================================== */}

      <section className="stats-section">

        <div className="stats-inner">

          <div className="stats-intro">

            <span className="eyebrow">
              05 / OUR COMMUNITY
            </span>

            <h2>
              One community.
              <br />
              <em>One shared purpose.</em>
            </h2>

            <p>
              A school experience shaped by connection,
              opportunity and a commitment to learning.
            </p>

          </div>

          <div className="stats-grid">

            <div className="stat-item">
              <strong>1–12</strong>
              <span>Grade levels</span>
            </div>

            <div className="stat-item">
              <strong>3</strong>
              <span>Learning stages</span>
            </div>

            <div className="stat-item">
              <strong>9</strong>
              <span>Platform user roles</span>
            </div>

            <div className="stat-item">
              <strong>1</strong>
              <span>Connected platform</span>
            </div>

          </div>

        </div>
      </section>

      {/* =====================================
          WHY CHOOSE OUR SCHOOL
      ===================================== */}

      <section className="why-section section-pad">

        <div className="section-heading">

          <span className="eyebrow">
            06 / WHY CHOOSE OUR SCHOOL
          </span>

          <h2>
            The right environment
            <br />
            <em>makes a difference.</em>
          </h2>

          <p>
            Learning is strongest when students have the people,
            spaces and tools they need to succeed.
          </p>

        </div>

        <div className="why-grid">

          {advantages.map((item, index) => {
            const Icon = item.icon;

            return (
              <motion.div
                className="why-card"
                key={item.title}
                whileHover={{ y: -6 }}
              >

                <span className="why-icon">
                  <Icon size={25} />
                </span>

                <span className="why-index">
                  0{index + 1}
                </span>

                <h3>{item.title}</h3>

                <p>{item.text}</p>

              </motion.div>
            );
          })}

        </div>
      </section>

      {/* =====================================
          NEWS AND EVENTS
      ===================================== */}

      <section
        className="news-section section-pad"
        id="news"
      >

        <div className="news-heading">

          <div>

            <span className="eyebrow">
              07 / NEWS & EVENTS
            </span>

            <h2>
              Life at <em>our school.</em>
            </h2>

            <p>
              Highlights from learning, discovery and our wider
              school community.
            </p>

          </div>

          <a href="#contact" className="text-link">
            Get school updates
            <ArrowRight size={17} />
          </a>

        </div>

        <div className="news-grid">

          {news.map((item) => (
            <article
              className="news-card"
              key={item.title}
            >

              <div className="news-image">
                <img
                  src={item.image}
                  alt={item.title}
                  loading="lazy"
                />
              </div>

              <div className="news-body">

                <div className="news-meta">
                  <span>{item.tag}</span>

                  <small>
                    <CalendarDays size={13} />
                    {item.date}
                  </small>
                </div>

                <h3>{item.title}</h3>

                <p>{item.text}</p>

                <a href="#contact">
                  Read more
                  <ArrowRight size={15} />
                </a>

              </div>
            </article>
          ))}

        </div>
      </section>

      {/* =====================================
          ADMISSIONS
      ===================================== */}

      <section
        className="premium-admission-section"
        id="admissions"
      >

        <div className="admission-decoration admission-decoration-one" />
        <div className="admission-decoration admission-decoration-two" />

        <div className="premium-admission-content">

          <motion.div
            className="admission-copy"
            initial={{ opacity: 0, x: -35 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >

            <span className="admission-label">
              <Sparkles size={15} />
              ADMISSIONS ARE OPEN
            </span>

            <h2>
              Your Child's Future
              <br />
              Starts <em>With Us.</em>
            </h2>

            <p>
              Give your child the opportunity to discover
              their potential, develop confidence and achieve
              academic excellence. Begin your admission
              journey today.
            </p>

            <div className="admission-benefits">

              <span>
                <ShieldCheck size={17} />
                Supportive learning environment
              </span>

              <span>
                <GraduationCap size={17} />
                Programs from Grade 1–12
              </span>

              <span>
                <Users size={17} />
                A welcoming school community
              </span>

            </div>
          </motion.div>

          <motion.div
            className="admission-apply-card"
            initial={{ opacity: 0, x: 35 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            whileHover={{ y: -8 }}
          >

            <div className="admission-card-icon">
              <GraduationCap size={34} />
            </div>

            <span className="admission-card-small">
              START YOUR JOURNEY
            </span>

            <h3>Apply for Admission</h3>

            <p>
              Take the first step toward a brighter future.
              Submit your application online.
            </p>

            <div className="admission-card-divider" />

            <div className="admission-card-info">

              <span>
                <ShieldCheck size={16} />
                Simple online application
              </span>

              <span>
                <CalendarDays size={16} />
                Application review process
              </span>

            </div>

            <Link
              to="/admission"
              className="admission-apply-button"
            >
              Apply Now
              <ArrowRight size={19} />
            </Link>

            <small className="admission-card-footer">
              Start building your future with EduManage.
            </small>

          </motion.div>

        </div>
      </section>

      {/* =====================================
          FOOTER
      ===================================== */}

      <footer className="home-footer" id="contact">

        <div className="footer-main">

          <div className="footer-about">

            <Link
              to="/"
              className="home-brand footer-brand"
            >
              <span className="home-logo">
                <GraduationCap size={26} />
              </span>

              <span className="brand-details">
                <strong>EduManage</strong>
                <small>SCHOOL MANAGEMENT SYSTEM</small>
              </span>
            </Link>

            <p>
              Connecting learners, families and educators
              through a shared commitment to education.
            </p>

            <div className="social-links">

              <a
                href="https://www.facebook.com/"
                aria-label="Facebook"
                target="_blank"
                rel="noreferrer"
              >
                <span className="facebook-letter">f</span>
              </a>

              <a
                href="https://www.instagram.com/"
                aria-label="Instagram"
                target="_blank"
                rel="noreferrer"
              >
                <span className="instagram-letter">◎</span>
              </a>

              <a
                href="https://www.youtube.com/"
                aria-label="YouTube"
                target="_blank"
                rel="noreferrer"
              >
                <span className="youtube-letter">▶</span>
              </a>

            </div>
          </div>

          <div className="footer-links">

            <h3>Explore</h3>

            <a href="#about">About our school</a>
            <a href="#academics">Academic programs</a>
            <a href="#news">News & events</a>
            <a href="#admissions">Admissions</a>

          </div>

          <div className="footer-links">

            <h3>Quick access</h3>

            <Link to="/login">Login portal</Link>
            <Link to="/signup">Admission / Sign up</Link>
            <a href="#home">Back to top</a>

          </div>

          <div className="footer-contact">

            <h3>Contact us</h3>

            <p>
              <MapPin size={17} />
              Add your school address here
            </p>

            <p>
              <Phone size={17} />
              Add your school phone number
            </p>

            <p>
              <Mail size={17} />
              Add your school email address
            </p>

            <small>
              Replace these sample contact details with your real
              school information.
            </small>

          </div>

        </div>

        <div className="footer-bottom">

          <span>
            © {new Date().getFullYear()} EduManage School Management System.
          </span>

          <span>
            Learning today. Leading tomorrow.
          </span>

        </div>

      </footer>

    </main>
  );
}

export default Home;