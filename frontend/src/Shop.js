import React, { useState, useEffect, useImperativeHandle, forwardRef, useRef } from "react";

const ShopPage = forwardRef(({ cart, setCart }, ref) => {
  const [showCart, setShowCart] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
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

  const [products] = useState([
    {
      id: 1,
      name: "Classic White Tee",
      price: 29.99,
      image: "https://via.placeholder.com/400x600/9b8cff/ffffff?text=White+Tee",
      description: "Essential white t-shirt for your wardrobe",
      brand: "StyleSwipe"
    },
    {
      id: 2,
      name: "Denim Jacket",
      price: 79.99,
      image: "https://via.placeholder.com/400x600/47e7c1/ffffff?text=Denim+Jacket",
      description: "Vintage-inspired denim jacket",
      brand: "StyleSwipe"
    },
    {
      id: 3,
      name: "Black Sneakers",
      price: 89.99,
      image: "https://via.placeholder.com/400x600/1a1a24/ffffff?text=Sneakers",
      description: "Comfortable everyday sneakers",
      brand: "StyleSwipe"
    },
    {
      id: 4,
      name: "Cargo Pants",
      price: 59.99,
      image: "https://via.placeholder.com/400x600/252535/ffffff?text=Cargo+Pants",
      description: "Functional and stylish cargo pants",
      brand: "StyleSwipe"
    },
    {
      id: 5,
      name: "Hoodie",
      price: 49.99,
      image: "https://via.placeholder.com/400x600/2a2a3a/ffffff?text=Hoodie",
      description: "Cozy pullover hoodie",
      brand: "StyleSwipe"
    },
    {
      id: 6,
      name: "Baseball Cap",
      price: 24.99,
      image: "https://via.placeholder.com/400x600/1f1f2f/ffffff?text=Cap",
      description: "Classic baseball cap",
      brand: "StyleSwipe"
    },
    {
      id: 7,
      name: "Leather Jacket",
      price: 149.99,
      image: "https://via.placeholder.com/400x600/9b8cff/ffffff?text=Leather+Jacket",
      description: "Premium leather jacket",
      brand: "StyleSwipe"
    },
    {
      id: 8,
      name: "Sunglasses",
      price: 34.99,
      image: "https://via.placeholder.com/400x600/47e7c1/ffffff?text=Sunglasses",
      description: "Stylish aviator sunglasses",
      brand: "StyleSwipe"
    }
  ]);

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

  // Update ref when currentIndex changes
  useEffect(() => {
    currentIndexRef.current = currentIndex;
  }, [currentIndex]);

  // Swipe handlers
  const handleSwipe = (direction) => {
    const idx = currentIndexRef.current;
    if (idx >= products.length || isAnimating) return;
    
    const currentProduct = products[idx];
    
    // Set swipe direction for animation
    setSwipeDirection(direction);
    setIsAnimating(true);
    
    if (direction === 'right') {
      // Like the item
      likeItem(currentProduct);
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
      if (currentIndexRef.current >= products.length) return;
      
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
  }, [products]);

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
  }, [isDragging, products]);

  const currentProduct = products[currentIndex];
  const rotation = isAnimating 
    ? (swipeDirection === 'right' ? 30 : -30)
    : dragOffset.x * 0.1;
  const opacity = isAnimating 
    ? 0 
    : 1 - Math.abs(dragOffset.x) / 300;
  const isLiked = currentProduct && likedItems.find((item) => item.id === currentProduct.id);

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center px-4 md:px-6 py-6 md:py-10">
      {currentIndex < products.length ? (
        <>
          {/* Swipe Card Container */}
          <div className="relative w-full max-w-sm h-[600px] md:h-[650px] flex items-center justify-center">
            {/* Next card (background) - animated entrance */}
            {currentIndex + 1 < products.length && (
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
                  src={currentProduct?.image}
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
                    ${currentProduct?.price.toFixed(2)}
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
        </>
      ) : (
        <div className="text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            You've seen everything! 🎉
          </h2>
          <p className="text-[#a6a6b3] text-base md:text-lg mb-8">
            Check your cart or refresh to see more items
          </p>
          <button
            onClick={() => {
              setCurrentIndex(0);
              window.location.reload();
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
