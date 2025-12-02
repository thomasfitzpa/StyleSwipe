import React, { useState, useEffect, useImperativeHandle, forwardRef, useRef } from "react";
import { apiFetch } from "./auth";

const ShopPage = forwardRef(({ cart, setCart }, ref) => {
  const [showCart, setShowCart] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [items, setItems] = useState([]);
  const [loadingFeed, setLoadingFeed] = useState(false);
  const [feedEnded, setFeedEnded] = useState(false);
  const [lastSwipes, setLastSwipes] = useState([]); // stack of { itemId, action }
  const [feedError, setFeedError] = useState(null);
  const [shownItemIds, setShownItemIds] = useState([]); // IDs already fetched in this session
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [swipeDirection, setSwipeDirection] = useState(null); // 'left' or 'right'
  const [isAnimating, setIsAnimating] = useState(false);
  const [likedItems, setLikedItems] = useState(() => {
    const saved = localStorage.getItem("likedItems");
    return saved ? JSON.parse(saved) : [];
  });
  const cardRef = useRef(null);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const currentIndexRef = useRef(0);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const ITEMS_API = "http://localhost:5000/api/items";

  // Detect mobile/desktop
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Initialize cart from localStorage or use prop
  const [localCart, setLocalCart] = useState(() => {
    if (cart) return cart;
    const saved = localStorage.getItem("shoppingCart");
    return saved ? JSON.parse(saved) : [];
  });

  // Sync cart with localStorage and parent component
  useEffect(() => {
    localStorage.setItem("shoppingCart", JSON.stringify(localCart));
    if (setCart) setCart(localCart);
    // Trigger custom event to update header cart counter
    window.dispatchEvent(new CustomEvent('cartUpdated', { 
      detail: { cart: localCart } 
    }));
  }, [localCart, setCart]);

  // Sync liked items with localStorage
  useEffect(() => {
    localStorage.setItem("likedItems", JSON.stringify(likedItems));
  }, [likedItems]);

  // Expose openCart method to parent via ref
  useImperativeHandle(ref, () => ({
    openCart: () => setShowCart(true)
  }));

  // Listen for custom event to open cart
  useEffect(() => {
    const handleOpenCart = () => setShowCart(true);
    window.addEventListener('openCart', handleOpenCart);
    return () => window.removeEventListener('openCart', handleOpenCart);
  }, []);

  const addToCart = (product) => {
    setLocalCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id);
      if (existingItem) {
        return prevCart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
    // Trigger animation feedback
    window.dispatchEvent(new CustomEvent('itemAddedToCart'));
  };

  const likeItem = (product) => {
    setLikedItems((prev) => {
      if (prev.find((item) => item.id === product.id)) {
        return prev; // Already liked
      }
      return [...prev, product];
    });
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setLocalCart((prevCart) =>
      prevCart.map((item) =>
        item.id === productId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const removeFromCart = (productId) => {
    setLocalCart((prevCart) => prevCart.filter((item) => item.id !== productId));
  };

  const getTotalPrice = () => {
    return localCart.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  };

  const getCartItemCount = () => {
    return localCart.reduce((total, item) => total + item.quantity, 0);
  };

  const handleCheckout = () => {
    if (localCart.length === 0) {
      alert("Your cart is empty!");
      return;
    }
    // Navigate to checkout page
    window.location.pathname = "/checkout";
  };

  // Fetch initial batch
  useEffect(() => {
    const loadInitial = async () => {
      setLoadingFeed(true);
      setFeedError(null);
      try {
        console.log('Fetching initial feed...');
        const excludeIds = shownItemIds.length > 0 ? `&exclude=${shownItemIds.join(',')}` : '';
        const res = await apiFetch(`${ITEMS_API}/feed?limit=20${excludeIds}`);
        console.log('Feed response status:', res.status);
        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(`Feed API error: ${res.status} - ${errorText}`);
        }
        const data = await res.json();
        console.log('Feed data received:', data);
        const mapped = (data.items || []).map((it) => ({
          id: it._id || it.id,
          name: it.name,
          price: it.price,
          image: Array.isArray(it.images) && it.images.length ? it.images[0] : "",
          description: it.description || it.brand || "",
          brand: it.brand || "",
        }));
        // Normalize image URLs (convert s3://bucket/key to https)
        const normalized = mapped.map(p => ({
          ...p,
          image: normalizeImageUrl(p.image)
        }));
        setItems(normalized);
        setShownItemIds(normalized.map(item => item.id));
        setFeedEnded((data.items || []).length === 0);
        console.log('Loaded items:', mapped.length);
      } catch (e) {
        console.error("Failed to load feed", e);
        setFeedError(e.message || 'Failed to load feed');
      } finally {
        setLoadingFeed(false);
      }
    };
    loadInitial();
  }, []);

  // Load next batch when near end
  useEffect(() => {
    const nearEnd = items.length > 0 && currentIndex >= items.length - 3 && !loadingFeed && !feedEnded;
    if (!nearEnd) return;
    const loadMore = async () => {
      setLoadingFeed(true);
      try {
        const excludeIds = shownItemIds.length > 0 ? `&exclude=${shownItemIds.join(',')}` : '';
        const res = await apiFetch(`${ITEMS_API}/feed?limit=20${excludeIds}`);
        const data = await res.json();
        const mapped = (data.items || []).map((it) => ({
          id: it._id || it.id,
          name: it.name,
          price: it.price,
          image: Array.isArray(it.images) && it.images.length ? it.images[0] : "",
          description: it.description || it.brand || "",
          brand: it.brand || "",
        }));
        const normalized = mapped.map(p => ({
          ...p,
          image: normalizeImageUrl(p.image)
        }));
        if (normalized.length === 0) setFeedEnded(true);
        setItems((prev) => [...prev, ...normalized]);
        setShownItemIds((prev) => [...prev, ...normalized.map(item => item.id)]);
      } catch (e) {
        console.error("Failed to load more feed", e);
      } finally {
        setLoadingFeed(false);
      }
    };
    loadMore();
  }, [currentIndex, items.length, loadingFeed, feedEnded]);

  // Helper: convert s3 URI to public HTTPS URL
  function normalizeImageUrl(url) {
    if (!url) return url;
    // Match s3://bucket/key or s3://bucket/path/to/key
    const s3Match = /^s3:\/\/([^\/]+)\/(.+)$/.exec(url);
    if (s3Match) {
      const bucket = s3Match[1];
      const key = s3Match[2];
      return `https://${bucket}.s3.amazonaws.com/${key}`;
    }
    return url;
  }

  // Update ref when currentIndex changes
  useEffect(() => {
    currentIndexRef.current = currentIndex;
  }, [currentIndex]);

  // Swipe handlers
  const handleSwipe = async (direction) => {
    const idx = currentIndexRef.current;
    if (idx >= items.length || isAnimating) return;
    
    const currentProduct = items[idx];
    
    // Set swipe direction for animation
    setSwipeDirection(direction);
    setIsAnimating(true);
    
    if (direction === 'right') {
      // Like the item (server)
      try {
        const res = await apiFetch(`${ITEMS_API}/like`, {
          method: 'POST',
          body: JSON.stringify({ itemId: currentProduct.id })
        });
        if (res.ok) {
          setLastSwipes((prev) => [...prev, { itemId: currentProduct.id, action: 'like' }]);
          likeItem(currentProduct);
        }
      } catch (e) {
        console.error('Failed to like item', e);
      }
    } else if (direction === 'left') {
      // Dislike (server)
      try {
        const res = await apiFetch(`${ITEMS_API}/dislike`, {
          method: 'POST',
          body: JSON.stringify({ itemId: currentProduct.id })
        });
        if (res.ok) {
          setLastSwipes((prev) => [...prev, { itemId: currentProduct.id, action: 'dislike' }]);
        }
      } catch (e) {
        console.error('Failed to dislike item', e);
      }
    }
    // Left swipe just skips (no action needed)
    
    // Animate card out with rotation
    const exitDistance = direction === 'right' ? 1000 : -1000;
    const exitRotation = direction === 'right' ? 30 : -30;
    setDragOffset({ x: exitDistance, y: -50 });
    
    // Wait for exit animation, then move to next item with delay
    setTimeout(() => {
      setCurrentIndex((prev) => prev + 1);
      setDragOffset({ x: 0, y: 0 });
      setSwipeDirection(null);
      // Keep animating state for a bit to allow next card to fade in
      setTimeout(() => {
        setIsAnimating(false);
      }, 100);
    }, 400); // Animation duration - longer for better visibility
  };

  // Arrow key support for desktop
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (currentIndexRef.current >= items.length) return;
      
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handleSwipe('left');
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleSwipe('right');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [items]);

  // Touch handlers
  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    dragStartRef.current = { x: touch.clientX, y: touch.clientY };
    setDragStart({ x: touch.clientX, y: touch.clientY });
    setIsDragging(true);
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    const touch = e.touches[0];
    const deltaX = touch.clientX - dragStartRef.current.x;
    const deltaY = touch.clientY - dragStartRef.current.y;
    setDragOffset({ x: deltaX, y: deltaY });
  };

  const handleTouchEnd = () => {
    if (!isDragging || isAnimating) return;
    setIsDragging(false);
    
    const threshold = 100;
    if (Math.abs(dragOffset.x) > threshold) {
      handleSwipe(dragOffset.x > 0 ? 'right' : 'left');
    } else {
      // Spring back animation
      setDragOffset({ x: 0, y: 0 });
    }
  };

  // Mouse handlers
  const handleMouseDown = (e) => {
    const startPos = { x: e.clientX, y: e.clientY };
    dragStartRef.current = startPos;
    setDragStart(startPos);
    setIsDragging(true);
  };

  // Prevent text selection while dragging
  useEffect(() => {
    if (isDragging) {
      document.body.style.userSelect = 'none';
      const moveHandler = (e) => {
        const deltaX = e.clientX - dragStartRef.current.x;
        const deltaY = e.clientY - dragStartRef.current.y;
        setDragOffset({ x: deltaX, y: deltaY });
      };
      const upHandler = () => {
        if (isAnimating) return;
        setDragOffset((currentOffset) => {
          const threshold = 100;
          if (Math.abs(currentOffset.x) > threshold) {
            const direction = currentOffset.x > 0 ? 'right' : 'left';
            handleSwipe(direction);
            return currentOffset; // Keep current offset for exit animation
          }
          return { x: 0, y: 0 };
        });
        setIsDragging(false);
      };
      document.addEventListener('mousemove', moveHandler);
      document.addEventListener('mouseup', upHandler);
      return () => {
        document.body.style.userSelect = '';
        document.removeEventListener('mousemove', moveHandler);
        document.removeEventListener('mouseup', upHandler);
      };
    } else {
      document.body.style.userSelect = '';
    }
  }, [isDragging, items]);

  const currentProduct = items[currentIndex];
  const rotation = isAnimating 
    ? (swipeDirection === 'right' ? 30 : -30)
    : dragOffset.x * 0.1;
  const opacity = isAnimating 
    ? 0 
    : 1 - Math.abs(dragOffset.x) / 300;
  const isLiked = currentProduct && likedItems.find((item) => item.id === currentProduct.id);

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center px-4 md:px-6 py-6 md:py-10">
      {feedError ? (
        <div className="text-center py-12 max-w-md mx-auto">
          <h2 className="text-2xl font-bold mb-3 text-red-400">Oops! Something went wrong</h2>
          <p className="text-[#a6a6b3] mb-4">{feedError}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 rounded-lg font-semibold bg-white/[0.1] border border-white/20 text-white hover:bg-white/[0.15] transition-all"
          >
            Try Again
          </button>
        </div>
      ) : loadingFeed && items.length === 0 ? (
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-3">Loading your feed…</h2>
          <p className="text-[#a6a6b3]">Hang tight while we fetch items.</p>
        </div>
      ) : currentIndex < items.length ? (
        <>
          {/* Swipe Card Container */}
          <div className="relative w-full max-w-sm h-[600px] md:h-[650px] flex items-center justify-center">
            {/* Next card (background) - animated entrance */}
            {currentIndex + 1 < items.length && (
              <div 
                className={`absolute w-full max-w-sm bg-white/[0.03] border border-white/5 rounded-3xl h-[560px] md:h-[610px] transform scale-95 transition-all duration-300 ${
                  isAnimating ? 'scale-100 opacity-100' : 'scale-95 opacity-50'
                }`}
              />
            )}

            {/* Current card */}
            <div
              ref={cardRef}
              className={`absolute w-full max-w-sm bg-white/[0.06] border border-white/10 rounded-3xl overflow-hidden shadow-2xl ${
                isAnimating ? 'transition-all duration-300 ease-out' : isDragging ? 'transition-none' : 'transition-all duration-200'
              } ${
                isDragging ? 'cursor-grabbing' : 'cursor-grab'
              }`}
              style={{
                transform: `translate(${dragOffset.x}px, ${dragOffset.y}px) rotate(${rotation}deg) scale(${isAnimating ? 0.9 : 1})`,
                opacity: isAnimating ? 0 : Math.max(0.5, opacity),
                zIndex: 10
              }}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onMouseDown={handleMouseDown}
            >
              {/* Swipe indicators - more prominent */}
              {Math.abs(dragOffset.x) > 30 && !isAnimating && (
                <div
                  className={`absolute top-8 left-8 right-8 z-20 p-4 md:p-6 rounded-xl font-bold text-xl md:text-2xl border-4 shadow-2xl animate-pulse ${
                    dragOffset.x > 0
                      ? 'bg-green-500/30 border-green-400 text-green-300'
                      : 'bg-red-500/30 border-red-400 text-red-300'
                  }`}
                  style={{
                    transform: `scale(${1 + Math.min(Math.abs(dragOffset.x) / 500, 0.2)})`,
                  }}
                >
                  {dragOffset.x > 0 ? '✓ LIKE' : '✗ PASS'}
                </div>
              )}
              
              {/* Swipe direction overlay */}
              {Math.abs(dragOffset.x) > 50 && !isAnimating && (
                <div
                  className={`absolute inset-0 z-10 ${
                    dragOffset.x > 0
                      ? 'bg-green-500/10'
                      : 'bg-red-500/10'
                  }`}
                />
              )}

              {/* Product Image */}
              <div className="relative h-[400px] md:h-[450px] bg-gradient-to-br from-white/10 to-white/[0.03]">
                <img
                  src={currentProduct?.image || "https://via.placeholder.com/400x600/1a1a24/ffffff?text=StyleSwipe"}
                  alt={currentProduct?.name}
                  className="w-full h-full object-cover"
                  draggable={false}
                />
                {isLiked && (
                  <div className="absolute top-4 right-4 bg-green-500/90 text-white px-3 py-1.5 rounded-full text-sm font-bold flex items-center gap-2">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Liked
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl md:text-2xl font-bold text-white">
                    {currentProduct?.name}
                  </h3>
                  <span className="text-xl md:text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    {typeof currentProduct?.price === 'number' ? `$${currentProduct?.price.toFixed(2)}` : ''}
                  </span>
                </div>
                <p className="text-[#a6a6b3] text-sm mb-4">
                  {currentProduct?.description}
                </p>
                <p className="text-[#a6a6b3] text-xs mb-4">
                  {currentProduct?.brand}
                </p>
                
                {/* Add to Cart Button */}
                <button
                  onClick={() => {
                    addToCart(currentProduct);
                  }}
                  className="w-full px-6 py-3 rounded-xl font-bold text-base bg-gradient-to-br from-primary to-secondary text-dark-bg shadow-lg shadow-primary/35 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/45"
                >
                  Add to Cart
                </button>
              </div>
            </div>
          </div>

          {/* Action Buttons - Mobile */}
          {isMobile && (
            <div className="flex items-center justify-center gap-6 mt-8">
              <button
                onClick={() => handleSwipe('left')}
                className="w-16 h-16 rounded-full bg-white/[0.1] border-2 border-white/20 flex items-center justify-center text-white hover:bg-white/[0.15] transition-all active:scale-95"
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <button
                onClick={() => handleSwipe('right')}
                className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-secondary text-dark-bg shadow-lg shadow-primary/35 flex items-center justify-center transition-all active:scale-95 hover:shadow-xl hover:shadow-primary/45"
              >
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </button>
            </div>
          )}

          {/* Action Buttons - Desktop */}
          {!isMobile && (
            <div className="flex items-center justify-center gap-6 mt-8">
              <button
                onClick={() => handleSwipe('left')}
                className="w-16 h-16 rounded-full bg-white/[0.1] border-2 border-white/20 flex items-center justify-center text-white hover:bg-white/[0.15] transition-all hover:scale-110"
                title="Pass (Left Arrow)"
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <button
                onClick={() => handleSwipe('right')}
                className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-secondary text-dark-bg shadow-lg shadow-primary/35 flex items-center justify-center transition-all hover:scale-110 hover:shadow-xl hover:shadow-primary/45"
                title="Like (Right Arrow)"
              >
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </button>
            </div>
          )}

          {/* Instructions */}
          <p className="text-[#a6a6b3] text-xs md:text-sm mt-6 text-center">
            {isMobile 
              ? "Swipe right to like • Swipe left to pass"
              : "Swipe or use arrow keys • Right = Like • Left = Pass"
            }
          </p>
          {/* Undo last swipe */}
          <div className="mt-4">
            <button
              disabled={lastSwipes.length === 0 || isAnimating}
              onClick={async () => {
                const last = lastSwipes[lastSwipes.length - 1];
                try {
                  await apiFetch(`${ITEMS_API}/undo`, {
                    method: 'POST',
                    body: JSON.stringify({ itemId: last.itemId })
                  });
                  // Move back one index to show the undone item again
                  setCurrentIndex((prev) => Math.max(prev - 1, 0));
                  setLastSwipes((prev) => prev.slice(0, -1));
                  // Also remove from likedItems if the undone was a like
                  if (last.action === 'like') {
                    setLikedItems((prev) => prev.filter((li) => li.id !== last.itemId));
                  }
                } catch (e) {
                  console.error('Failed to undo swipe', e);
                }
              }}
              className={`px-4 py-2 rounded-lg font-semibold text-sm border border-white/20 transition-all ${lastSwipes.length === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:border-primary/40 hover:text-primary'}`}
            >
              Undo Last Swipe
            </button>
          </div>
        </>
      ) : (
        <div className="text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {items.length === 0 ? 'No items to show' : "You've seen everything! 🎉"}
          </h2>
          <p className="text-[#a6a6b3] text-base md:text-lg mb-8">
            {items.length === 0 
              ? 'There are no items in the feed yet. Check back later or contact support.'
              : feedEnded 
                ? 'No more items available right now.' 
                : 'Check your cart or refresh to see more items'
            }
          </p>
          <button
            onClick={() => {
              setCurrentIndex(0);
              // Reload feed fresh
              setItems([]);
              setFeedEnded(false);
              setShownItemIds([]);
            }}
            className="px-8 py-4 rounded-xl font-bold text-base bg-gradient-to-br from-primary to-secondary text-dark-bg shadow-lg shadow-primary/35 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/45"
          >
            Start Over
          </button>
        </div>
      )}

      {/* Shopping Cart Sidebar */}
      {showCart && (
        <div className="fixed inset-0 z-50 flex items-end justify-end">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowCart(false)}
          />
          <div className={`relative w-full ${isMobile ? 'h-full' : 'max-w-md h-full'} bg-[#1a1a24] ${isMobile ? '' : 'border-l border-white/10'} shadow-2xl overflow-y-auto`}>
            <div className="sticky top-0 bg-[#1a1a24] border-b border-white/10 p-4 md:p-6 flex items-center justify-between">
              <h2 className="text-xl md:text-2xl font-bold text-white">Shopping Cart</h2>
              <button
                onClick={() => setShowCart(false)}
                className="text-[#a6a6b3] hover:text-white transition-colors text-2xl md:text-3xl"
              >
                ×
              </button>
            </div>

            <div className="p-4 md:p-6">
              {localCart.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-[#a6a6b3] text-base md:text-lg mb-4">Your cart is empty</p>
                  <p className="text-[#a6a6b3] text-sm mb-4">Add items to your cart to see them here!</p>
                  <button
                    onClick={() => setShowCart(false)}
                    className="px-6 py-3 rounded-lg font-semibold bg-white/[0.1] border border-white/20 text-white hover:bg-white/[0.15] transition-all"
                  >
                    Continue Swiping
                  </button>
                </div>
              ) : (
                <>
                  <div className="space-y-3 md:space-y-4 mb-4 md:mb-6">
                    {localCart.map((item) => (
                      <div
                        key={item.id}
                        className="bg-white/[0.06] border border-white/10 rounded-xl p-3 md:p-4"
                      >
                        <div className="flex gap-3 md:gap-4">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-16 h-16 md:w-20 md:h-20 object-cover rounded-lg flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-white mb-1 text-sm md:text-base truncate">
                              {item.name}
                            </h3>
                            <p className="text-[#a6a6b3] text-xs md:text-sm mb-2">
                              ${item.price.toFixed(2)}
                            </p>
                            <div className="flex items-center gap-2 md:gap-3">
                              <button
                                onClick={() =>
                                  updateQuantity(item.id, item.quantity - 1)
                                }
                                className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-white/[0.1] border border-white/20 text-white hover:bg-white/[0.15] transition-all flex items-center justify-center text-sm md:text-base"
                              >
                                −
                              </button>
                              <span className="text-white font-semibold min-w-[1.5rem] md:min-w-[2rem] text-center text-sm md:text-base">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() =>
                                  updateQuantity(item.id, item.quantity + 1)
                                }
                                className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-white/[0.1] border border-white/20 text-white hover:bg-white/[0.15] transition-all flex items-center justify-center text-sm md:text-base"
                              >
                                +
                              </button>
                              <button
                                onClick={() => removeFromCart(item.id)}
                                className="ml-auto text-red-400 hover:text-red-300 transition-colors text-xs md:text-sm font-medium"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-white/10 pt-4 md:pt-6 sticky bottom-0 bg-[#1a1a24] pb-4 md:pb-6">
                    <div className="flex items-center justify-between mb-3 md:mb-4">
                      <span className="text-base md:text-lg font-semibold text-white">
                        Total:
                      </span>
                      <span className="text-xl md:text-2xl font-bold text-white">
                        ${getTotalPrice().toFixed(2)}
                      </span>
                    </div>
                    <button
                      onClick={handleCheckout}
                      className="w-full px-6 py-3 md:py-4 rounded-xl font-bold text-sm md:text-base bg-gradient-to-br from-primary to-secondary text-dark-bg shadow-lg shadow-primary/35 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/45 active:scale-95"
                    >
                      Proceed to Pay
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
});

ShopPage.displayName = 'ShopPage';

export default ShopPage;
