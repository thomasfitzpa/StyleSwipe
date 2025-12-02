import React, { useState, useEffect } from "react";

export default function Header({ isLoggedIn, onLoginChange, onCartClick }) {
  const [route, setRoute] = useState(() => {
    const pathname = window.location.pathname;
    if (pathname === '/onboarding') return 'onboarding';
    if (pathname === '/get-started') return 'get-started';
    if (pathname === '/shop') return 'shop';
    if (pathname === '/checkout') return 'checkout';
    if (pathname === '/profile') return 'profile';
    return window.location.hash || "#home";
  });
  
  // Cart state for shop/checkout pages
  const [cartCount, setCartCount] = useState(() => {
    const saved = localStorage.getItem("shoppingCart");
    if (!saved) return 0;
    const cart = JSON.parse(saved);
    return cart.reduce((total, item) => total + item.quantity, 0);
  });
  const [cartPulse, setCartPulse] = useState(false);

  // Listen for cart updates
  useEffect(() => {
    if (route !== "shop" && route !== "checkout") return;
    
    const updateCartCount = () => {
      const saved = localStorage.getItem("shoppingCart");
      if (!saved) {
        setCartCount(0);
        return;
      }
      const cart = JSON.parse(saved);
      const newCount = cart.reduce((total, item) => total + item.quantity, 0);
      if (newCount > cartCount) {
        setCartPulse(true);
        setTimeout(() => setCartPulse(false), 600);
      }
      setCartCount(newCount);
    };

    // Listen for cart updates
    window.addEventListener('cartUpdated', updateCartCount);
    window.addEventListener('itemAddedToCart', updateCartCount);
    
    // Also check on storage changes
    window.addEventListener('storage', updateCartCount);
    
    // Initial check
    updateCartCount();

    return () => {
      window.removeEventListener('cartUpdated', updateCartCount);
      window.removeEventListener('itemAddedToCart', updateCartCount);
      window.removeEventListener('storage', updateCartCount);
    };
  }, [route, cartCount]);

  useEffect(() => {
    const updateRoute = () => {
      const pathname = window.location.pathname;
      if (pathname === '/onboarding') setRoute('onboarding');
      else if (pathname === '/get-started') setRoute('get-started');
      else if (pathname === '/shop') setRoute('shop');
      else if (pathname === '/checkout') setRoute('checkout');
      else if (pathname === '/profile') setRoute('profile');
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

    // ✅ ALWAYS go to the main marketing page
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

  // Checkout page - show back button
  if (route === "checkout") {
    return (
      <nav className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 backdrop-blur-xl bg-gradient-to-b from-[rgba(12,12,17,0.85)] to-[rgba(12,12,17,0.65)] border-b border-white/10 shadow-lg">
        <a className="font-bold text-lg flex items-center gap-3 transition-transform hover:-translate-y-0.5 tracking-tight" href="/" onClick={goHome}>
          <span className="inline-grid place-items-center w-9 h-9 rounded-lg bg-gradient-to-br from-primary to-secondary text-dark-bg font-extrabold shadow-lg shadow-primary/30">SS</span>
          StyleSwipe
        </a>
        <button
          onClick={() => {
            window.location.pathname = "/shop";
            window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
          }}
          className="inline-flex items-center px-5 py-2.5 rounded-lg font-bold text-sm bg-white/[0.1] border border-white/20 text-white hover:bg-white/[0.15] transition-all"
        >
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to Shop
        </button>
      </nav>
    );
  }

  // ✅ FIXED: Shop page - cart + profile + logout
  if (route === "shop") {
    return (
      <nav className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 backdrop-blur-xl bg-gradient-to-b from-[rgba(12,12,17,0.85)] to-[rgba(12,12,17,0.65)] border-b border-white/10 shadow-lg">
        
        <a
          className="font-bold text-lg flex items-center gap-3 transition-transform hover:-translate-y-0.5 tracking-tight"
          href="/"
          onClick={goHome}
        >
          <span className="inline-grid place-items-center w-9 h-9 rounded-lg bg-gradient-to-br from-primary to-secondary text-dark-bg font-extrabold shadow-lg shadow-primary/30">
            SS
          </span>
          StyleSwipe
        </a>

        <div className="flex items-center gap-4">

          {/* ✅ PROFILE BUTTON */}
          <button
            onClick={(e) => {
              e.preventDefault();
              window.location.pathname = "/profile";
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="text-[#a6a6b3] hover:text-white transition-colors text-sm font-medium"
          >
            Profile
          </button>

          {/* ✅ CART BUTTON */}
          <button
            onClick={() => {
              if (onCartClick) onCartClick();
              else window.dispatchEvent(new CustomEvent('openCart'));
            }}
            className={`relative inline-flex items-center px-5 py-2.5 rounded-lg font-bold text-sm bg-gradient-to-br from-primary to-secondary text-dark-bg shadow-lg shadow-primary/35 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/45 ${
              cartPulse ? 'animate-pulse scale-110' : ''
            }`}
          >
            Cart
            {cartCount > 0 && (
              <span className={`absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center transition-all ${
                cartPulse ? 'scale-125 ring-2 ring-red-400' : ''
              }`}>
                {cartCount}
              </span>
            )}
          </button>

          {/* ✅ LOGOUT BUTTON */}
          <button
            onClick={handleLogout}
            className="inline-flex items-center px-5 py-2.5 rounded-lg font-bold text-sm bg-white/[0.1] border border-white/20 text-white hover:bg-white/[0.15] transition-all"
          >
            Logout
          </button>
        </div>
      </nav>
    );
  }


  // Default nav for home page
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
            onClick={(e) => {
              e.preventDefault();
              window.location.pathname = "/profile";
              window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
            }}
            className="text-[#a6a6b3] hover:text-white transition-colors text-sm font-medium"
          >
            Profile
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
