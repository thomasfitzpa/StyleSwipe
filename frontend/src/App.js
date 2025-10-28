// App.js
import React, { useState, useEffect } from "react";
import "./styles.css";
import GetStartedPage from "./getStarted";

export default function App() {
  // simple hash-based router
  const [route, setRoute] = useState(window.location.hash || "#home");
  useEffect(() => {
    const onHash = () => setRoute(window.location.hash || "#home");
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  if (route === "#get-started") {
    return (
      <div className="page">
        <FloatingNav />
        <GetStartedPage />
        <Footer />
      </div>
    );
  }

  return (
    <div className="about">
      <div id="top" />
      <FloatingNav />
      <Hero />
      <Section id="mission" title="Our mission">
        <p className="lead">
          StyleSwipe is the newest fashion finder. Inspired by Tinder, we make
          style discovery fast, fun, and perfectly personalized. Swipe right to
          add pieces you love to your cart, swipe left to pass, and train your
          feed with every flick.
        </p>
        <ul className="bullets">
          <li>Build your vibe into your feed in minutes.</li>
          <li>See real fits, posted by verified real sellers.</li>
          <li>Shop smarter with live price drops & size alerts.</li>
        </ul>
      </Section>

      <Section id="how" title="How it works">
        <div className="steps">
          <Step
            n="1"
            title="Tell us your vibe in your user profile"
            text="Pick your styles, sizes, and favorite brands. We’ll use this data to create your starter feed in seconds."
          />
          <Step
            n="2"
            title="Swipe"
            text="Right = I want that! Left = Not for me. Super-like to get instant restock/price notifications."
          />
          <Step
            n="3"
            title="Buy or bookmark"
            text="Check out directly from verified sellers or save to boards for later."
          />
        </div>
        <div className="tip">
          Pro tip: the more you swipe, the more your feed is trained to curate
          exactly what you want.
        </div>
      </Section>

      <Section id="features" title="What makes us different">
        <div className="grid">
          <Feature
            title="Real-time curation"
            text="Your feed adapts with every swipe—no more endless scrolling."
          />
          <Feature
            title="Fit first"
            text="Creator & community photos show how pieces look on real bodies."
          />
          <Feature
            title="Deal radar"
            text="Auto-alerts for price drops, restocks, and size matches."
          />
          <Feature
            title="Boards"
            text="Group items into moodboards (’Campus Fits’, ’Date Night’, ’Gym Drip’)."
          />
          <Feature
            title="Brand-mix engine"
            text="High-street, vintage, and indie labels in one feed."
          />
          <Feature
            title="Low-friction checkout"
            text="Buy from trusted merchants without leaving the app."
          />
        </div>
      </Section>

      <Section id="trust" title="Trust & privacy">
        <div className="trust">
          <Badge>Verified sellers</Badge>
          <Badge>Secure checkout</Badge>
          <Badge>No data resale</Badge>
          <Badge>Report & review</Badge>
        </div>
        <p className="muted">
          We only collect what’s needed to personalize your feed. You control
          what’s public and can delete your data any time.
        </p>
      </Section>

      <Section id="stats" title="Community">
        <div className="stats">
          <Stat label="Swipes" value="12M+" />
          <Stat label="Brands" value="2,400+" />
          <Stat label="Avg. discover → buy" value="3.7 swipes" />
        </div>
      </Section>

      <Section id="team" title="Meet the team">
        <div className="team">
          <Card
            name="Thomas Fitzpatrick"
            role="Frontend Developer"
            blurb="Favorite Style: Granola Outdoors — think Patagonia and KAVU."
          />
          <Card
            name="Matthew Edelman"
            role="Frontend Developer"
            blurb="Favorite Style: "
          />
          <Card
            name="Adiel Garcia Tavarez"
            role="Software Developer"
            blurb="Favorite Style: "
          />
          <Card
            name="Alex Yan"
            role="Software Developer"
            blurb="Favorite Style: "
          />
          <Card
            name="YOU! All of Our Users!"
            role="Sellers, Swipers, Buyers"
            blurb="Help us by signing up, selling your clothes, and start swiping!"
          />
        </div>
      </Section>

      <Section id="roadmap" title="Roadmap">
        <Timeline
          items={[
            {
              tag: "Now",
              title: "Private Beta",
              text: "Core swiping, Boards, verified sellers.",
            },
            {
              tag: "Next",
              title: "Creator looks",
              text: "OOTD uploads, remixable fits, shoppable tags.",
            },
            {
              tag: "Soon",
              title: "Social & Collabs",
              text: "DMs, shared Boards, limited drops.",
            },
          ]}
        />
      </Section>

      <Section id="faq" title="FAQs">
        <FAQ
          q="Is StyleSwipe free?"
          a="Yep. Free to browse & swipe. Standard checkout fees apply when you buy."
        />
        <FAQ
          q="Where do items come from?"
          a="From verified brands, boutiques, and curated marketplaces. No sketchy sellers."
        />
        <FAQ
          q="How do price alerts work?"
          a="Super-like or add to a Board—if a size or price changes, we’ll ping you."
        />
        <FAQ
          q="Do you resell my data?"
          a="No. We use your preferences only to personalize your feed."
        />
      </Section>

      <CTA />
      <Footer />
    </div>
  );
}

/* ---------- UI Bits ---------- */

function FloatingNav() {
  const [open, setOpen] = useState(false);

  const smoothScroll = (id) => (e) => {
    e.preventDefault();
    const el = document.querySelector(id);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    setOpen(false);
    el.setAttribute("tabindex", "-1");
    el.focus({ preventScroll: true });
  };

  const goHome = (e) => {
    e.preventDefault();
    window.location.hash = "#home";
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
    setOpen(false);
  };

  const goGetStarted = (e) => {
    e.preventDefault();
    window.location.hash = "#get-started";
    window.scrollTo({ top: 0, behavior: "smooth" });
    setOpen(false);
  };

  return (
    <nav className="nav">
      <a className="brand" href="#home" onClick={goHome}>
        <span className="logo">SS</span> StyleSwipe
      </a>

      <button
        className="hamburger"
        onClick={() => setOpen(!open)}
        aria-label="Menu"
      >
        ☰
      </button>

      <div
        className={`links ${open ? "open" : ""}`}
        onClick={() => setOpen(false)}
      >
        {/* Get started FIRST in the link row */}
        <a className="nav-cta" href="#get-started" onClick={goGetStarted}>
          Get started
        </a>

        <a href="#mission" onClick={smoothScroll("#mission")}>
          Mission
        </a>
        <a href="#how" onClick={smoothScroll("#how")}>
          How it works
        </a>
        <a href="#features" onClick={smoothScroll("#features")}>
          Features
        </a>
        <a href="#team" onClick={smoothScroll("#team")}>
          Team
        </a>
        <a href="#faq" onClick={smoothScroll("#faq")}>
          FAQ
        </a>
      </div>
    </nav>
  );
}

function Hero() {
  const go = (id) => (e) => {
    e.preventDefault();
    document
      .querySelector(id)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const goGetStarted = (e) => {
    e.preventDefault();
    window.location.hash = "#get-started";
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <header className="hero">
      <div className="hero-inner">
        <h1>
          Swipe your <span className="accent">next fit</span>.
        </h1>
        <p className="sub">
          Fast, fun, and personalized fashion discovery. Right swipe your vibe.
          ✨
        </p>

        <div className="cta-row">
          <a className="btn primary" href="#how" onClick={go("#how")}>
            How it works
          </a>
          <a className="btn ghost" href="#features" onClick={go("#features")}>
            See features
          </a>
          <a className="btn primary" href="#get-started" onClick={goGetStarted}>
            Get Started
          </a>
        </div>

        <div className="cards">
          <DemoCard label="Right swipe" />
          <DemoCard label="Left swipe" />
          <DemoCard label="Super-like" />
        </div>
      </div>
    </header>
  );
}

function DemoCard({ label }) {
  return (
    <div className="demo-card">
      <div className="img-skeleton" />
      <div className="demo-row">
        <span className="pill">{label}</span>
        <div className="dots">⋯</div>
      </div>
    </div>
  );
}

function Section({ id, title, children }) {
  return (
    <section id={id} className="section">
      <h2>{title}</h2>
      {children}
    </section>
  );
}

function Step({ n, title, text }) {
  return (
    <div className="step">
      <div className="badge">{n}</div>
      <div>
        <h3>{title}</h3>
        <p>{text}</p>
      </div>
    </div>
  );
}

function Feature({ title, text }) {
  return (
    <div className="feature">
      <h3>{title}</h3>
      <p>{text}</p>
    </div>
  );
}

function Badge({ children }) {
  return <span className="badge soft">{children}</span>;
}

function Stat({ label, value }) {
  return (
    <div className="stat">
      <div className="value">{value}</div>
      <div className="label">{label}</div>
    </div>
  );
}

function Card({ name, role, blurb }) {
  return (
    <div className="card">
      <div className="avatar" />
      <div className="card-body">
        <div className="card-title">{name}</div>
        <div className="card-sub">{role}</div>
        <p className="card-text">{blurb}</p>
      </div>
    </div>
  );
}

function Timeline({ items }) {
  return (
    <ol className="timeline">
      {items.map((it, i) => (
        <li key={i}>
          <div className="timeline-pin" />
          <div className="timeline-content">
            <span className="pill">{it.tag}</span>
            <h4>{it.title}</h4>
            <p>{it.text}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

function FAQ({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`faq ${open ? "open" : ""}`}>
      <button className="faq-q" onClick={() => setOpen(!open)}>
        {q}
        <span className="chev">{open ? "–" : "+"}</span>
      </button>
      {open && <div className="faq-a">{a}</div>}
    </div>
  );
}

function CTA() {
  const goGetStarted = (e) => {
    e.preventDefault();
    window.location.hash = "#get-started";
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  return (
    <section className="cta">
      <h2>Join the private beta</h2>
      <p>Be first to swipe drops, build Boards, and shape what’s next.</p>
      <a className="btn primary" href="#get-started" onClick={goGetStarted}>
        Get early access
      </a>
    </section>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <div>© {new Date().getFullYear()} StyleSwipe</div>
      <div className="footer-links">
        <a
          href="#trust"
          onClick={(e) => {
            e.preventDefault();
            document
              .querySelector("#trust")
              ?.scrollIntoView({ behavior: "smooth" });
          }}
        >
          Privacy
        </a>
        <a
          href="#faq"
          onClick={(e) => {
            e.preventDefault();
            document
              .querySelector("#faq")
              ?.scrollIntoView({ behavior: "smooth" });
          }}
        >
          Help
        </a>
        <a
          href="#team"
          onClick={(e) => {
            e.preventDefault();
            document
              .querySelector("#team")
              ?.scrollIntoView({ behavior: "smooth" });
          }}
        >
          Careers
        </a>
      </div>
    </footer>
  );
}
