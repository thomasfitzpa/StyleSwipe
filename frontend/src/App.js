// App.js
import React, { useState, useEffect } from "react";
import AOS from "aos";
import "./styles.css";
import GetStartedPage from "./getStarted";
import OnboardingPage from "./onboarding";

export default function App() {
  // simple hash-based router
  const [route, setRoute] = useState(window.location.hash || "#home");
  
  useEffect(() => {
    AOS.init({
      duration: 800,
      once: true,
      offset: 100,
      easing: 'ease-out-cubic',
    });
  }, []);
  
  useEffect(() => {
    const onHash = () => setRoute(window.location.hash || "#home");
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  if (route === "#get-started") {
    return (
      <div className="min-h-screen w-full">
        <FloatingNav />
        <GetStartedPage />
        <Footer />
      </div>
    );
  }

  if (route === "#onboarding") {
    return (
      <div className="min-h-screen w-full">
        <FloatingNav />
        <OnboardingPage />
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full">
      <div id="top" />
      <FloatingNav />
      <Hero />
      <Section id="mission" title="Our mission" altBg="1">
        <p className="text-lg text-[#e6e6ef] text-center mx-auto mb-8 max-w-[840px] leading-relaxed font-normal" data-aos="fade-up">
          StyleSwipe is the newest fashion finder. Inspired by Tinder, we make
          style discovery fast, fun, and perfectly personalized. Swipe right to
          add pieces you love to your cart, swipe left to pass, and train your
          feed with every flick.
        </p>
        <ul className="flex flex-col items-center text-center list-none mx-auto p-0 text-[#a6a6b3] max-w-[840px]">
          <li className="my-2 leading-relaxed relative pl-5" data-aos="fade-right" data-aos-delay="100">
            <span className="absolute left-0 text-primary">•</span>
            Build your vibe into your feed in minutes.
          </li>
          <li className="my-2 leading-relaxed relative pl-5" data-aos="fade-right" data-aos-delay="200">
            <span className="absolute left-0 text-primary">•</span>
            See real fits, posted by verified real sellers.
          </li>
          <li className="my-2 leading-relaxed relative pl-5" data-aos="fade-right" data-aos-delay="300">
            <span className="absolute left-0 text-primary">•</span>
            Shop smarter with live price drops & size alerts.
          </li>
        </ul>
      </Section>

      <Section id="how" title="How it works" altBg="2">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div data-aos="fade-up" data-aos-delay="100">
            <Step
              n="1"
              title="Tell us your vibe in your user profile"
              text="Pick your styles, sizes, and favorite brands. We'll use this data to create your starter feed in seconds."
            />
          </div>
          <div data-aos="fade-up" data-aos-delay="200">
            <Step
              n="2"
              title="Swipe"
              text="Right = I want that! Left = Not for me. Super-like to get instant restock/price notifications."
            />
          </div>
          <div data-aos="fade-up" data-aos-delay="300">
            <Step
              n="3"
              title="Buy or bookmark"
              text="Check out directly from verified sellers or save to boards for later."
            />
          </div>
        </div>
        <div className="text-center text-[#a6a6b3] mt-6 text-[15px]" data-aos="fade-up" data-aos-delay="400">
          Pro tip: the more you swipe, the more your feed is trained to curate
          exactly what you want.
        </div>
      </Section>

      <Section id="features" title="What makes us different" altBg="3">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div data-aos="zoom-in" data-aos-delay="100">
            <Feature
              title="Real-time curation"
              text="Your feed adapts with every swipe—no more endless scrolling."
            />
          </div>
          <div data-aos="zoom-in" data-aos-delay="150">
            <Feature
              title="Fit first"
              text="Creator & community photos show how pieces look on real bodies."
            />
          </div>
          <div data-aos="zoom-in" data-aos-delay="200">
            <Feature
              title="Deal radar"
              text="Auto-alerts for price drops, restocks, and size matches."
            />
          </div>
          <div data-aos="zoom-in" data-aos-delay="250">
            <Feature
              title="Boards"
              text="Group items into moodboards ('Campus Fits', 'Date Night', 'Gym Drip')."
            />
          </div>
          <div data-aos="zoom-in" data-aos-delay="300">
            <Feature
              title="Brand-mix engine"
              text="High-street, vintage, and indie labels in one feed."
            />
          </div>
          <div data-aos="zoom-in" data-aos-delay="350">
            <Feature
              title="Low-friction checkout"
              text="Buy from trusted merchants without leaving the app."
            />
          </div>
        </div>
      </Section>

      <Section id="trust" title="Trust & privacy" altBg="4">
        <div className="flex flex-wrap gap-3 justify-center mb-4">
          <Badge>Verified sellers</Badge>
          <Badge>Secure checkout</Badge>
          <Badge>No data resale</Badge>
          <Badge>Report & review</Badge>
        </div>
        <p className="text-[#a6a6b3] text-center max-w-[800px] mx-auto">
          We only collect what's needed to personalize your feed. You control
          what's public and can delete your data any time.
        </p>
      </Section>

      <Section id="stats" title="Community" altBg="1">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Stat label="Swipes" value="12M+" />
          <Stat label="Brands" value="2,400+" />
          <Stat label="Avg. discover → buy" value="3.7 swipes" />
        </div>
      </Section>

      <Section id="team" title="Meet the team" altBg="2">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

      <Section id="roadmap" title="Roadmap" altBg="3">
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

      <Section id="faq" title="FAQs" altBg="4">
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
          a="Super-like or add to a Board—if a size or price changes, we'll ping you."
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
  const [route, setRoute] = useState(window.location.hash || "#home");

  useEffect(() => {
    const onHash = () => setRoute(window.location.hash || "#home");
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const goHome = (e) => {
    e.preventDefault();
    window.location.hash = "#home";
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  };

  const goGetStarted = (e) => {
    e.preventDefault();
    window.location.hash = "#get-started";
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Simplified nav for get-started and onboarding pages
  if (route === "#get-started" || route === "#onboarding") {
    return (
      <nav className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 backdrop-blur-xl bg-gradient-to-b from-[rgba(12,12,17,0.85)] to-[rgba(12,12,17,0.65)] border-b border-white/10 shadow-lg">
        <a className="font-bold text-lg flex items-center gap-3 transition-transform hover:-translate-y-0.5 tracking-tight" href="#home" onClick={goHome}>
          <span className="inline-grid place-items-center w-9 h-9 rounded-lg bg-gradient-to-br from-primary to-secondary text-dark-bg font-extrabold shadow-lg shadow-primary/30">SS</span> 
          StyleSwipe
        </a>
        {route === "#onboarding" ? (
          <span className="text-[#a6a6b3] text-sm">Welcome!</span>
        ) : (
          <a className="inline-flex items-center px-5 py-2.5 rounded-lg font-bold text-sm bg-gradient-to-br from-primary to-secondary text-dark-bg shadow-lg shadow-primary/35 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/45" href="#get-started">
            Get started
          </a>
        )}
      </nav>
    );
  }

  // Full nav for home page - just "Login"
  return (
    <nav className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 backdrop-blur-xl bg-gradient-to-b from-[rgba(12,12,17,0.85)] to-[rgba(12,12,17,0.65)] border-b border-white/10 shadow-lg">
      <a className="font-bold text-lg flex items-center gap-3 transition-transform hover:-translate-y-0.5 tracking-tight" href="#home" onClick={goHome}>
        <span className="inline-grid place-items-center w-9 h-9 rounded-lg bg-gradient-to-br from-primary to-secondary text-dark-bg font-extrabold shadow-lg shadow-primary/30">SS</span>
        StyleSwipe
      </a>
      <a className="inline-flex items-center px-5 py-2.5 rounded-lg font-bold text-sm bg-gradient-to-br from-primary to-secondary text-dark-bg shadow-lg shadow-primary/35 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/45" href="#get-started" onClick={goGetStarted}>
        Login
      </a>
    </nav>
  );
}

function Hero() {
  const goGetStarted = (e) => {
    e.preventDefault();
    window.location.hash = "#get-started";
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <header className="px-6 py-24 md:py-32">
      <div className="max-w-5xl mx-auto text-center">
        <h1 className="text-5xl md:text-7xl font-extrabold mb-5 leading-tight tracking-tight" data-aos="fade-up">
          Swipe your <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent inline-block">next fit</span>.
        </h1>
        <p className="text-[#a6a6b3] text-lg md:text-xl leading-relaxed max-w-2xl mx-auto" data-aos="fade-up" data-aos-delay="100">
          Fast, fun, and personalized fashion discovery. Right swipe your vibe.
          ✨
        </p>

        <div className="flex gap-4 justify-center mt-10 md:mt-14 items-center" data-aos="zoom-in" data-aos-delay="200">
          <a className="inline-flex items-center justify-center px-8 py-4 rounded-xl font-bold text-base bg-gradient-to-br from-primary to-secondary text-dark-bg shadow-lg shadow-primary/35 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/45 hover:scale-105" href="#get-started" onClick={goGetStarted}>
            Get Started
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-4xl mx-auto mt-14">
          <div data-aos="flip-left" data-aos-delay="100">
            <DemoCard label="Right swipe" />
          </div>
          <div data-aos="flip-left" data-aos-delay="200">
            <DemoCard label="Left swipe" />
          </div>
          <div data-aos="flip-left" data-aos-delay="300">
            <DemoCard label="Super-like" />
          </div>
        </div>
      </div>
    </header>
  );
}

function DemoCard({ label }) {
  return (
    <div className="bg-white/[0.06] border border-white/10 rounded-2xl p-4 transition-all duration-300 cursor-pointer hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl">
      <div className="h-44 md:h-48 rounded-xl bg-gradient-to-br from-white/10 to-white/[0.03] relative overflow-hidden shimmer"></div>
      <div className="flex items-center justify-between mt-3">
        <span className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/10 border border-white/12 text-white">{label}</span>
        <div className="opacity-50 text-lg">⋯</div>
      </div>
    </div>
  );
}

function Section({ id, title, children, altBg }) {
  const bgClass = altBg ? `section-alt-${altBg}` : '';
  return (
    <section id={id} className={`py-20 md:py-24 w-full scroll-mt-24 border-b border-white/5 ${bgClass}`}>
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="text-3xl md:text-5xl font-bold text-center mb-12 tracking-tight" data-aos="fade-down">{title}</h2>
        <div>
          {children}
        </div>
      </div>
    </section>
  );
}

function Step({ n, title, text }) {
  return (
    <div className="bg-white/[0.06] border border-white/10 rounded-2xl p-7 flex gap-4 items-start transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl hover:scale-105">
      <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg bg-gradient-to-br from-primary to-secondary text-dark-bg shadow-lg shadow-primary/30">
        {n}
      </div>
      <div className="flex-1">
        <h3 className="mb-2 text-lg font-bold text-white">{title}</h3>
        <p className="m-0 leading-relaxed text-[#a6a6b3] text-sm">{text}</p>
      </div>
    </div>
  );
}

function Feature({ title, text }) {
  return (
    <div className="bg-white/[0.06] border border-white/10 rounded-2xl p-7 transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl">
      <h3 className="mb-3 text-lg font-bold text-white">{title}</h3>
      <p className="m-0 leading-relaxed text-[#a6a6b3]">{text}</p>
    </div>
  );
}

function Badge({ children }) {
  return <span className="rounded-lg px-3.5 py-2 h-auto w-auto bg-white/[0.08] border border-white/12 text-white text-sm font-semibold">{children}</span>;
}

function Stat({ label, value }) {
  return (
    <div className="bg-white/[0.06] border border-white/10 rounded-2xl p-8 text-center transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl">
      <div className="text-4xl font-extrabold mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">{value}</div>
      <div className="text-[#a6a6b3] text-sm m-0 font-medium">{label}</div>
    </div>
  );
}

function Card({ name, role, blurb }) {
  return (
    <div className="bg-white/[0.06] border border-white/10 rounded-2xl p-6 flex gap-4 transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl">
      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-secondary flex-shrink-0 shadow-lg"></div>
      <div>
        <div className="font-bold mb-1 text-base text-white">{name}</div>
        <div className="text-[#a6a6b3] text-sm mb-2">{role}</div>
        <p className="text-[#e6e6ef] m-0 leading-relaxed">{blurb}</p>
      </div>
    </div>
  );
}

function Timeline({ items }) {
  return (
    <ol className="list-none p-0 m-0 max-w-3xl mx-auto">
      {items.map((it, i) => (
        <li key={i} className="relative pl-9 my-6 pb-6 border-l-2 border-white/[0.08] last:border-l-0">
          <div className="absolute -left-1.5 top-1.5 w-3 h-3 rounded-full bg-gradient-to-br from-primary to-secondary shadow-[0_0_0_4px_rgba(155,140,255,0.2)]"></div>
          <div>
            <span className="inline-block mr-2 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/10 border border-white/12 text-white">{it.tag}</span>
            <h4 className="my-2 text-lg font-bold text-white">{it.title}</h4>
            <p className="text-[#a6a6b3] leading-relaxed m-0">{it.text}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

function FAQ({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`max-w-3xl mx-auto my-4 border border-white/10 bg-white/[0.06] rounded-2xl transition-all duration-300 hover:border-primary/20 hover:shadow-lg ${open ? 'border-primary/20' : ''}`}>
      <button className="w-full text-left bg-transparent border-0 text-white p-5 md:p-6 font-semibold text-base flex justify-between items-center cursor-pointer transition-colors hover:text-primary" onClick={() => setOpen(!open)}>
        {q}
        <span className="opacity-60 text-xl font-normal">{open ? "–" : "+"}</span>
      </button>
      {open && <div className="px-5 md:px-6 pb-6 text-[#a6a6b3] leading-relaxed text-[15px]">{a}</div>}
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
    <section className="text-center py-24 md:py-32 w-full border-b border-white/5 section-alt-1">
      <div className="max-w-5xl mx-auto px-6">
        <h2 className="mb-4 text-4xl md:text-5xl font-extrabold tracking-tight" data-aos="fade-up">Join the private beta</h2>
        <p className="text-[#a6a6b3] mb-8 text-lg leading-relaxed max-w-2xl mx-auto" data-aos="fade-up" data-aos-delay="100">Be first to swipe drops, build Boards, and shape what's next.</p>
        <div data-aos="zoom-in" data-aos-delay="200">
          <a className="inline-flex items-center justify-center px-8 py-4 rounded-xl font-bold text-base bg-gradient-to-br from-primary to-secondary text-dark-bg shadow-lg shadow-primary/35 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/45 hover:scale-110" href="#get-started" onClick={goGetStarted}>
            Get early access
          </a>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="py-8 border-t border-white/10 bg-[#1a1a24] w-full text-sm">
      <div className="flex flex-col md:flex-row justify-between items-center max-w-6xl mx-auto w-full gap-4 px-6">
      <div>© {new Date().getFullYear()} StyleSwipe</div>
      <div className="flex gap-6">
        <a
          href="#team"
          className="text-[#a6a6b3] no-underline transition-colors hover:text-white"
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
      </div>
    </footer>
  );
}
