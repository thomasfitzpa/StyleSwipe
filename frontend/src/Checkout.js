import React, { useState, useEffect } from "react";
import Header from "./Header";

export default function CheckoutPage({ isLoggedIn, onLoginChange }) {
  const [cart, setCart] = useState([]);
  const [formData, setFormData] = useState({
    cardNumber: "",
    cardName: "",
    expiryDate: "",
    cvv: "",
    billingAddress: "",
    city: "",
    state: "",
    zipCode: "",
    email: "",
    phone: ""
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("shoppingCart");
    if (saved) {
      setCart(JSON.parse(saved));
    }
  }, []);

  const getTotalPrice = () => {
    return cart.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  };

  const getCartItemCount = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(" ");
    } else {
      return v;
    }
  };

  const formatExpiryDate = (value) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    if (v.length >= 2) {
      return v.substring(0, 2) + "/" + v.substring(2, 4);
    }
    return v;
  };

  const handleInputChange = (field, value) => {
    let formattedValue = value;
    
    if (field === "cardNumber") {
      formattedValue = formatCardNumber(value);
    } else if (field === "expiryDate") {
      formattedValue = formatExpiryDate(value);
    } else if (field === "cvv") {
      formattedValue = value.replace(/\D/g, "").substring(0, 4);
    } else if (field === "zipCode") {
      formattedValue = value.replace(/\D/g, "").substring(0, 5);
    } else if (field === "phone") {
      formattedValue = value.replace(/\D/g, "").substring(0, 10);
    }

    setFormData((prev) => ({ ...prev, [field]: formattedValue }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.cardNumber || formData.cardNumber.replace(/\s/g, "").length < 16) {
      newErrors.cardNumber = "Please enter a valid card number";
    }
    if (!formData.cardName) {
      newErrors.cardName = "Please enter cardholder name";
    }
    if (!formData.expiryDate || formData.expiryDate.length < 5) {
      newErrors.expiryDate = "Please enter a valid expiry date (MM/YY)";
    }
    if (!formData.cvv || formData.cvv.length < 3) {
      newErrors.cvv = "Please enter a valid CVV";
    }
    if (!formData.billingAddress) {
      newErrors.billingAddress = "Please enter billing address";
    }
    if (!formData.city) {
      newErrors.city = "Please enter city";
    }
    if (!formData.state) {
      newErrors.state = "Please enter state";
    }
    if (!formData.zipCode || formData.zipCode.length < 5) {
      newErrors.zipCode = "Please enter a valid ZIP code";
    }
    if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    if (!formData.phone || formData.phone.length < 10) {
      newErrors.phone = "Please enter a valid phone number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    // Simulate payment processing (fake - doesn't actually process)
    setTimeout(() => {
      setIsSubmitting(false);
      alert("Payment processing simulation complete! (This is a demo - no actual payment was processed)");
      // In a real app, you would redirect to a success page
      // For now, just clear the cart and go back to shop
      localStorage.removeItem("shoppingCart");
      window.location.pathname = "/shop";
    }, 2000);
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen w-full">
        <Header isLoggedIn={isLoggedIn} onLoginChange={onLoginChange} />
        <div className="flex justify-center items-center min-h-[80vh] px-5 py-10">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight">
              Your cart is empty
            </h1>
            <p className="text-[#a6a6b3] text-lg mb-8">
              Add items to your cart before checkout
            </p>
            <button
              onClick={() => {
                window.location.pathname = "/shop";
              }}
              className="inline-flex items-center justify-center px-8 py-4 rounded-xl font-bold text-base bg-gradient-to-br from-primary to-secondary text-dark-bg shadow-lg shadow-primary/35 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/45"
            >
              Go to Shop
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full">
      <Header isLoggedIn={isLoggedIn} onLoginChange={onLoginChange} />
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 md:py-12">
        <h1 className="text-3xl md:text-4xl font-extrabold mb-8 tracking-tight">
          Checkout
        </h1>

        <div className="flex flex-col lg:grid lg:grid-cols-3 gap-6 md:gap-8">
          {/* Order Summary - appears first on mobile */}
          <div className="lg:col-span-1 lg:order-2">
            <div className="bg-white/[0.06] border border-white/10 rounded-2xl p-6 md:p-8 lg:sticky lg:top-24">
              <h2 className="text-xl md:text-2xl font-bold text-white mb-6">
                Order Summary
              </h2>

              <div className="space-y-4 mb-6">
                {cart.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 md:w-20 md:h-20 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h3 className="font-bold text-white text-sm md:text-base mb-1">
                        {item.name}
                      </h3>
                      <p className="text-[#a6a6b3] text-xs md:text-sm mb-1">
                        Quantity: {item.quantity}
                      </p>
                      <p className="text-white font-semibold text-sm md:text-base">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-white/10 pt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[#a6a6b3] text-sm md:text-base">Subtotal</span>
                  <span className="text-white font-semibold text-sm md:text-base">
                    ${getTotalPrice().toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[#a6a6b3] text-sm md:text-base">Shipping</span>
                  <span className="text-white font-semibold text-sm md:text-base">Free</span>
                </div>
                <div className="flex items-center justify-between mb-4 pt-2 border-t border-white/10">
                  <span className="text-lg md:text-xl font-bold text-white">Total</span>
                  <span className="text-xl md:text-2xl font-bold text-white">
                    ${getTotalPrice().toFixed(2)}
                  </span>
                </div>
                <p className="text-[#a6a6b3] text-xs text-center">
                  {getCartItemCount()} {getCartItemCount() === 1 ? "item" : "items"}
                </p>
              </div>
            </div>
          </div>

          {/* Payment Form - appears second on mobile */}
          <div className="lg:col-span-2 lg:order-1">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Payment Information */}
              <div className="bg-white/[0.06] border border-white/10 rounded-2xl p-6 md:p-8">
                <h2 className="text-xl md:text-2xl font-bold text-white mb-6">
                  Payment Information
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[#a6a6b3] mb-2">
                      Card Number
                    </label>
                    <input
                      type="text"
                      value={formData.cardNumber}
                      onChange={(e) => handleInputChange("cardNumber", e.target.value)}
                      placeholder="1234 5678 9012 3456"
                      maxLength={19}
                      className={`w-full px-4 py-3 rounded-lg bg-white/[0.08] border ${
                        errors.cardNumber ? "border-red-500" : "border-white/20"
                      } text-white placeholder-[#a6a6b3] focus:outline-none focus:ring-2 focus:ring-primary transition-all`}
                    />
                    {errors.cardNumber && (
                      <p className="text-red-400 text-sm mt-1">{errors.cardNumber}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#a6a6b3] mb-2">
                      Cardholder Name
                    </label>
                    <input
                      type="text"
                      value={formData.cardName}
                      onChange={(e) => handleInputChange("cardName", e.target.value)}
                      placeholder="John Doe"
                      className={`w-full px-4 py-3 rounded-lg bg-white/[0.08] border ${
                        errors.cardName ? "border-red-500" : "border-white/20"
                      } text-white placeholder-[#a6a6b3] focus:outline-none focus:ring-2 focus:ring-primary transition-all`}
                    />
                    {errors.cardName && (
                      <p className="text-red-400 text-sm mt-1">{errors.cardName}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[#a6a6b3] mb-2">
                        Expiry Date
                      </label>
                      <input
                        type="text"
                        value={formData.expiryDate}
                        onChange={(e) => handleInputChange("expiryDate", e.target.value)}
                        placeholder="MM/YY"
                        maxLength={5}
                        className={`w-full px-4 py-3 rounded-lg bg-white/[0.08] border ${
                          errors.expiryDate ? "border-red-500" : "border-white/20"
                        } text-white placeholder-[#a6a6b3] focus:outline-none focus:ring-2 focus:ring-primary transition-all`}
                      />
                      {errors.expiryDate && (
                        <p className="text-red-400 text-sm mt-1">{errors.expiryDate}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#a6a6b3] mb-2">
                        CVV
                      </label>
                      <input
                        type="text"
                        value={formData.cvv}
                        onChange={(e) => handleInputChange("cvv", e.target.value)}
                        placeholder="123"
                        maxLength={4}
                        className={`w-full px-4 py-3 rounded-lg bg-white/[0.08] border ${
                          errors.cvv ? "border-red-500" : "border-white/20"
                        } text-white placeholder-[#a6a6b3] focus:outline-none focus:ring-2 focus:ring-primary transition-all`}
                      />
                      {errors.cvv && (
                        <p className="text-red-400 text-sm mt-1">{errors.cvv}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Billing Address */}
              <div className="bg-white/[0.06] border border-white/10 rounded-2xl p-6 md:p-8">
                <h2 className="text-xl md:text-2xl font-bold text-white mb-6">
                  Billing Address
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[#a6a6b3] mb-2">
                      Street Address
                    </label>
                    <input
                      type="text"
                      value={formData.billingAddress}
                      onChange={(e) => handleInputChange("billingAddress", e.target.value)}
                      placeholder="123 Main St"
                      className={`w-full px-4 py-3 rounded-lg bg-white/[0.08] border ${
                        errors.billingAddress ? "border-red-500" : "border-white/20"
                      } text-white placeholder-[#a6a6b3] focus:outline-none focus:ring-2 focus:ring-primary transition-all`}
                    />
                    {errors.billingAddress && (
                      <p className="text-red-400 text-sm mt-1">{errors.billingAddress}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[#a6a6b3] mb-2">
                        City
                      </label>
                      <input
                        type="text"
                        value={formData.city}
                        onChange={(e) => handleInputChange("city", e.target.value)}
                        placeholder="New York"
                        className={`w-full px-4 py-3 rounded-lg bg-white/[0.08] border ${
                          errors.city ? "border-red-500" : "border-white/20"
                        } text-white placeholder-[#a6a6b3] focus:outline-none focus:ring-2 focus:ring-primary transition-all`}
                      />
                      {errors.city && (
                        <p className="text-red-400 text-sm mt-1">{errors.city}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#a6a6b3] mb-2">
                        State
                      </label>
                      <input
                        type="text"
                        value={formData.state}
                        onChange={(e) => handleInputChange("state", e.target.value)}
                        placeholder="NY"
                        className={`w-full px-4 py-3 rounded-lg bg-white/[0.08] border ${
                          errors.state ? "border-red-500" : "border-white/20"
                        } text-white placeholder-[#a6a6b3] focus:outline-none focus:ring-2 focus:ring-primary transition-all`}
                      />
                      {errors.state && (
                        <p className="text-red-400 text-sm mt-1">{errors.state}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#a6a6b3] mb-2">
                      ZIP Code
                    </label>
                    <input
                      type="text"
                      value={formData.zipCode}
                      onChange={(e) => handleInputChange("zipCode", e.target.value)}
                      placeholder="10001"
                      maxLength={5}
                      className={`w-full px-4 py-3 rounded-lg bg-white/[0.08] border ${
                        errors.zipCode ? "border-red-500" : "border-white/20"
                      } text-white placeholder-[#a6a6b3] focus:outline-none focus:ring-2 focus:ring-primary transition-all`}
                    />
                    {errors.zipCode && (
                      <p className="text-red-400 text-sm mt-1">{errors.zipCode}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="bg-white/[0.06] border border-white/10 rounded-2xl p-6 md:p-8">
                <h2 className="text-xl md:text-2xl font-bold text-white mb-6">
                  Contact Information
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[#a6a6b3] mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      placeholder="john@example.com"
                      className={`w-full px-4 py-3 rounded-lg bg-white/[0.08] border ${
                        errors.email ? "border-red-500" : "border-white/20"
                      } text-white placeholder-[#a6a6b3] focus:outline-none focus:ring-2 focus:ring-primary transition-all`}
                    />
                    {errors.email && (
                      <p className="text-red-400 text-sm mt-1">{errors.email}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#a6a6b3] mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      placeholder="(555) 123-4567"
                      maxLength={10}
                      className={`w-full px-4 py-3 rounded-lg bg-white/[0.08] border ${
                        errors.phone ? "border-red-500" : "border-white/20"
                      } text-white placeholder-[#a6a6b3] focus:outline-none focus:ring-2 focus:ring-primary transition-all`}
                    />
                    {errors.phone && (
                      <p className="text-red-400 text-sm mt-1">{errors.phone}</p>
                    )}
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full px-6 py-4 rounded-xl font-bold text-base bg-gradient-to-br from-primary to-secondary text-dark-bg shadow-lg shadow-primary/35 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/45 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Processing..." : `Pay $${getTotalPrice().toFixed(2)}`}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

