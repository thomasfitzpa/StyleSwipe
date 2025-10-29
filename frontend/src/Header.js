import React, { useState, useEffect } from "react";

export default function Header({ isLoggedIn, onLoginChange }) {
  const [route, setRoute] = useState(() => {
    const pathname = window.location.pathname;
    if (pathname === '/onboarding') return 'onboarding';
    if (pathname === '/get-started') return 'get-started';
    if (pathname === '/shop') return 'shop';
    return window.location.hash || "#home";
  });

  useEffect(() => {
    const updateRoute = () => {
      const pathname = window.location.pathname;
      if (pathname === '/onboarding') setRoute('onboarding');
      else if (pathname === '/get-started') setRoute('get-started');
      else if (pathname === '/shop') setRoute('shop');
      else setRoute(window.location.hash || "#home");
    };

    window.addEventListener("hashchange", updateRoute);
    window.addEventListener("popstate", updateRoute);
    
    return () => {
      window.removeEventListener("hashchange", updateRoute);
      window.removeEventListener("popstate", updateRoute);
    };
  }, []);

  const goHome = (e) => {
    e?.preventDefault();
    window.location.pathname = "/";
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  };

  const goShop = (e) => {
    e?.preventDefault();
    window.location.pathname = "/shop";
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    if (onLoginChange) onLoginChange(false);
    window.location.pathname = "/";
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  };

  // Get started page - no right side content
  if (route === "get-started" || route === "#get-started") {
    return (
      <nav className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 backdrop-blur-xl bg-gradient-to-b from-[rgba(12,12,17,0.85)] to-[rgba(12,12,17,0.65)] border-b border-white/10 shadow-lg">
        <a className="font-bold text-lg flex items-center gap-3 transition-transform hover:-translate-y-0.5 tracking-tight" href="/" onClick={goHome}>
          <span className="inline-grid place-items-center w-9 h-9 rounded-lg bg-gradient-to-br from-primary to-secondary text-dark-bg font-extrabold shadow-lg shadow-primary/30">SS</span> 
          StyleSwipe
        </a>
        <div></div>
      </nav>
    );
  }

  // Onboarding page - only "Welcome!" text, no login
  if (route === "onboarding" || route === "#onboarding") {
    return (
      <nav className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 backdrop-blur-xl bg-gradient-to-b from-[rgba(12,12,17,0.85)] to-[rgba(12,12,17,0.65)] border-b border-white/10 shadow-lg">
        <a className="font-bold text-lg flex items-center gap-3 transition-transform hover:-translate-y-0.5 tracking-tight" href="/" onClick={goHome}>
          <span className="inline-grid place-items-center w-9 h-9 rounded-lg bg-gradient-to-br from-primary to-secondary text-dark-bg font-extrabold shadow-lg shadow-primary/30">SS</span> 
          StyleSwipe
        </a>
        <span className="text-[#a6a6b3] text-sm">Welcome!</span>
      </nav>
    );
  }

  // Default nav for home page and shop page
  return (
    <nav className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 backdrop-blur-xl bg-gradient-to-b from-[rgba(12,12,17,0.85)] to-[rgba(12,12,17,0.65)] border-b border-white/10 shadow-lg">
      <a className="font-bold text-lg flex items-center gap-3 transition-transform hover:-translate-y-0.5 tracking-tight" href="/" onClick={goHome}>
        <span className="inline-grid place-items-center w-9 h-9 rounded-lg bg-gradient-to-br from-primary to-secondary text-dark-bg font-extrabold shadow-lg shadow-primary/30">SS</span>
        StyleSwipe
      </a>
      {isLoggedIn ? (
        <div className="flex items-center gap-4">
          <button
            onClick={goShop}
            className="text-[#a6a6b3] hover:text-white transition-colors text-sm font-medium"
          >
            Shop
          </button>
          <button
            onClick={handleLogout}
            className="inline-flex items-center px-5 py-2.5 rounded-lg font-bold text-sm bg-white/[0.1] border border-white/20 text-white hover:bg-white/[0.15] transition-all"
          >
            Logout
          </button>
        </div>
      ) : (
        <a 
          className="inline-flex items-center px-5 py-2.5 rounded-lg font-bold text-sm bg-gradient-to-br from-primary to-secondary text-dark-bg shadow-lg shadow-primary/35 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/45" 
          href="/get-started"
          onClick={(e) => {
            e.preventDefault();
            window.location.pathname = "/get-started";
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        >
          Login
        </a>
      )}
    </nav>
  );
}
