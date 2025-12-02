import React, { useState, useEffect, useRef } from "react";
import { apiFetch } from "./auth";
import AddToCartModal from "./AddToCartModal";

// Toast Notification Component
function Toast({ message, type, onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = type === "success" ? "bg-green-500" : "bg-red-500";
  const icon = type === "success" ? "✓" : "✕";

  return (
    <div className="fixed bottom-5 right-5 z-[9999] animate-slide-in pointer-events-auto">
      <div className={`${bgColor} text-white px-5 py-3 rounded-lg shadow-2xl flex items-center gap-3 max-w-[350px]`}>
        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-white/25 flex items-center justify-center font-bold text-sm">
          {icon}
        </div>
        <div className="flex-1 text-sm font-medium leading-snug">{message}</div>
        <button
          onClick={onClose}
          className="flex-shrink-0 w-5 h-5 rounded-full hover:bg-white/20 transition-colors flex items-center justify-center text-lg leading-none font-bold"
          aria-label="Close"
        >
          ×
        </button>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [editMode, setEditMode] = useState(false);
  
  const [userData, setUserData] = useState({
    username: "",
    email: "",
    gender: "",
    shoeSize: "",
    shirtSize: "",
    shortSize: "",
    pantsSize: "",
    stylePreferences: [],
    favoriteBrands: [],
    priceRange: "",
    colorPreferences: [],
  });

  const [formData, setFormData] = useState({...userData});

  // Liked items state
  const [likedItems, setLikedItems] = useState([]);
  const [likedItemsPage, setLikedItemsPage] = useState(1);
  const [likedItemsTotal, setLikedItemsTotal] = useState(0);
  const [likedItemsLoading, setLikedItemsLoading] = useState(false);
  const [removingItems, setRemovingItems] = useState(new Set());
  const [serverCart, setServerCart] = useState([]);

  // Add to cart modal state
  const [showAddToCart, setShowAddToCart] = useState(false);
  const [selectedItemForCart, setSelectedItemForCart] = useState(null);

  const USERS_API = "http://localhost:5000/api/users";

  const shoeSizes = Array.from({ length: 20 }, (_, i) => i + 4);
  const shirtSizes = ["XS", "S", "M", "L", "XL", "XXL"];
  const pantsSizes = ["26", "28", "30", "32", "34", "36", "38", "40"];
  const shortSizes = ["XS", "S", "M", "L", "XL", "XXL"];

  const styleOptions = [
    "Streetwear",
    "Casual",
    "Athletic",
    "Formal",
    "Vintage",
    "Minimalist",
    "Boho",
    "Preppy",
    "Grunge",
    "Techwear",
  ];

  const colorOptions = [
    "Black",
    "White",
    "Gray",
    "Navy",
    "Brown",
    "Beige",
    "Red",
    "Blue",
    "Green",
    "Pastels",
  ];

  const popularBrands = [
    "Nike",
    "Adidas",
    "Zara",
    "H&M",
    "Uniqlo",
    "Levi's",
    "Patagonia",
    "Vans",
    "Converse",
    "The North Face",
    "Supreme",
    "Stüssy",
    "Other",
  ];

  useEffect(() => {
    fetchUserProfile();
    fetchLikedItems(1);
    fetchCart();
  }, []);

  useEffect(() => {
    fetchLikedItems(likedItemsPage);
  }, [likedItemsPage]);

  const fetchUserProfile = async () => {
    setLoading(true);
    try {
      const response = await apiFetch(`${USERS_API}/account`);

      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }

      const data = await response.json();
      const prefs = data.preferences || {};
      setUserData({
        username: data.username,
        email: data.email,
        gender: data.gender,
        shoeSize: prefs.shoeSize,
        shirtSize: prefs.shirtSize,
        shortSize: prefs.shortSize,
        pantsSize: prefs.pantsSize,
        stylePreferences: prefs.stylePreferences || [],
        favoriteBrands: prefs.favoriteBrands || [],
        priceRange: prefs.priceRange,
        colorPreferences: prefs.colorPreferences || [],
      });
      setFormData({
        username: data.username,
        email: data.email,
        gender: data.gender,
        shoeSize: prefs.shoeSize,
        shirtSize: prefs.shirtSize,
        shortSize: prefs.shortSize,
        pantsSize: prefs.pantsSize,
        stylePreferences: prefs.stylePreferences || [],
        favoriteBrands: prefs.favoriteBrands || [],
        priceRange: prefs.priceRange,
        colorPreferences: prefs.colorPreferences || [],
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
      setToast({ message: 'Failed to load profile data', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const fetchLikedItems = async (page) => {
    setLikedItemsLoading(true);
    try {
      const response = await apiFetch(`${USERS_API}/account/liked-items?page=${page}&limit=10`);
      if (!response.ok) {
        throw new Error('Failed to fetch liked items');
      }
      const data = await response.json();
      setLikedItems(data.items || []);
      setLikedItemsTotal(data.total || 0);
    } catch (error) {
      console.error('Error fetching liked items:', error);
      setToast({ message: 'Failed to load liked items', type: 'error' });
    } finally {
      setLikedItemsLoading(false);
    }
  };

  const fetchCart = async () => {
    try {
      const res = await apiFetch(`${USERS_API}/cart`);
      if (!res.ok) return;
      const data = await res.json();
      setServerCart(data.items || []);
    } catch (err) {
      console.error('Error fetching cart:', err);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleToggleArray = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter((item) => item !== value)
        : [...prev[field], value],
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await apiFetch(`${USERS_API}/account`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          gender: formData.gender,
          shoeSize: formData.shoeSize,
          shirtSize: formData.shirtSize,
          shortSize: formData.shortSize,
          pantsSize: formData.pantsSize,
          stylePreferences: formData.stylePreferences,
          favoriteBrands: formData.favoriteBrands,
          priceRange: formData.priceRange,
          colorPreferences: formData.colorPreferences,
        })
      });

      const data = await response.json().catch(() => null);
      
      if (!response.ok) {
        let message = 'Failed to update profile';
        if (data) {
          if (data.errors && Array.isArray(data.errors)) {
            message = data.errors.map(e => e.msg || e.message).join(', ');
          } else if (data.error?.message) {
            message = data.error.message;
          } else if (data.message) {
            message = data.message;
          }
        }
        throw new Error(message);
      }

      setUserData(formData);
      setEditMode(false);
      setToast({ message: 'Profile updated successfully!', type: 'success' });
    } catch (error) {
      console.error('Error updating profile:', error);
      setToast({ message: error.message || 'Failed to update profile', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveLikedItems = async (itemIds) => {
    try {
      // Mark items as removing
      setRemovingItems(new Set(itemIds));
      
      const response = await apiFetch(`${USERS_API}/account/liked-items`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ itemIds })
      });

      const data = await response.json().catch(() => null);
      
      if (!response.ok) {
        let message = 'Failed to remove items';
        if (data) {
          if (data.errors && Array.isArray(data.errors)) {
            message = data.errors.map(e => e.msg || e.message).join(', ');
          } else if (data.error?.message) {
            message = data.error.message;
          } else if (data.message) {
            message = data.message;
          }
        }
        throw new Error(message);
      }

      setToast({ message: 'Item removed from liked', type: 'success' });
      // Refresh liked items
      await fetchLikedItems(likedItemsPage);
    } catch (error) {
      console.error('Error removing liked items:', error);
      setToast({ message: error.message || 'Failed to remove items', type: 'error' });
    } finally {
      setRemovingItems(new Set());
    }
  };

  const handleOpenAddToCart = (item) => {
    setSelectedItemForCart(item);
    setShowAddToCart(true);
  };

  const handleCartAdded = async () => {
    setShowAddToCart(false);
    setSelectedItemForCart(null);
    await fetchCart();
    setToast({ message: 'Item added to cart!', type: 'success' });
  };

  const normalizeImageUrl = (url) => {
    if (!url) return url;
    const s3Match = /^s3:\/\/([^\/]+)\/(.+)$/.exec(url);
    if (s3Match) {
      const bucket = s3Match[1];
      const key = s3Match[2];
      return `https://${bucket}.s3.amazonaws.com/${key}`;
    }
    const gcsMatch = /^gs:\/\/([^\/]+)\/(.+)$/.exec(url);
    if (gcsMatch) {
      const bucket = gcsMatch[1];
      const key = gcsMatch[2];
      return `https://storage.googleapis.com/${bucket}/${key}`;
    }
    return url;
  };

  const handleCancel = () => {
    setFormData({...userData});
    setEditMode(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#a6a6b3]">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      
      <div className="min-h-screen w-full px-4 md:px-6 py-8 md:py-12">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold mb-2 tracking-tight">
                My Profile
              </h1>
              <p className="text-[#a6a6b3] text-base md:text-lg">
                Manage your style preferences and account settings
              </p>
            </div>
            {!editMode && (
              <button
                onClick={() => setEditMode(true)}
                className="px-6 py-3 rounded-xl font-bold text-sm md:text-base bg-gradient-to-br from-primary to-secondary text-dark-bg shadow-lg shadow-primary/35 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/45"
              >
                Edit Profile
              </button>
            )}
          </div>

          {/* Account Info */}
          <div className="bg-white/[0.06] border border-white/10 rounded-2xl p-6 md:p-8 mb-6">
            <h2 className="text-xl md:text-2xl font-bold text-white mb-6">
              Account Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-[#a6a6b3] mb-2">
                  Username
                </label>
                {editMode ? (
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => handleInputChange("username", e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-white text-black border border-white/10 focus:outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(155,140,255,0.1)] transition-all"
                    placeholder="Enter username"
                  />
                ) : (
                  <div className="px-4 py-3 rounded-lg bg-white/[0.04] border border-white/10 text-white">
                    {userData.username}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-[#a6a6b3] mb-2">
                  Email
                </label>
                {editMode ? (
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-white text-black border border-white/10 focus:outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(155,140,255,0.1)] transition-all"
                    placeholder="Enter email"
                  />
                ) : (
                  <div className="px-4 py-3 rounded-lg bg-white/[0.04] border border-white/10 text-white">
                    {userData.email}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Basic Info */}
          <div className="bg-white/[0.06] border border-white/10 rounded-2xl p-6 md:p-8 mb-6">
            <h2 className="text-xl md:text-2xl font-bold text-white mb-6">
              Basic Info
            </h2>
            
            <div>
              <label className="block text-[#f7f7fb] font-semibold mb-4 text-base">
                Gender
              </label>
              <div className="grid grid-cols-3 gap-4">
                {["Male", "Female", "Unisex"].map((option) => (
                  <button
                    key={option}
                    onClick={() => editMode && handleInputChange("gender", option)}
                    disabled={!editMode}
                    className={`py-3 px-4 rounded-xl border-2 transition-all duration-300 ${
                      formData.gender === option
                        ? "border-primary bg-primary/20 text-white"
                        : "border-white/10 bg-white/[0.04] text-[#a6a6b3]"
                    } ${editMode ? 'cursor-pointer hover:border-primary/30' : 'cursor-default opacity-70'}`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Sizes */}
          <div className="bg-white/[0.06] border border-white/10 rounded-2xl p-6 md:p-8 mb-6">
            <h2 className="text-xl md:text-2xl font-bold text-white mb-6">
              Your Sizes
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[#f7f7fb] font-semibold mb-3">
                  Shoe Size
                </label>
                <select
                  value={formData.shoeSize}
                  onChange={(e) => handleInputChange("shoeSize", e.target.value)}
                  disabled={!editMode}
                  className={`w-full py-3.5 px-4 border-[1.5px] border-white/12 rounded-xl text-base transition-all bg-white text-black focus:outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(155,140,255,0.1)] ${!editMode && 'opacity-70 cursor-not-allowed'}`}
                >
                  <option value="">Select size</option>
                  {shoeSizes.map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[#f7f7fb] font-semibold mb-3">
                  Shirt Size
                </label>
                <select
                  value={formData.shirtSize}
                  onChange={(e) => handleInputChange("shirtSize", e.target.value)}
                  disabled={!editMode}
                  className={`w-full py-3.5 px-4 border-[1.5px] border-white/12 rounded-xl text-base transition-all bg-white text-black focus:outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(155,140,255,0.1)] ${!editMode && 'opacity-70 cursor-not-allowed'}`}
                >
                  <option value="">Select size</option>
                  {shirtSizes.map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[#f7f7fb] font-semibold mb-3">
                  Pants Size
                </label>
                <select
                  value={formData.pantsSize}
                  onChange={(e) => handleInputChange("pantsSize", e.target.value)}
                  disabled={!editMode}
                  className={`w-full py-3.5 px-4 border-[1.5px] border-white/12 rounded-xl text-base transition-all bg-white text-black focus:outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(155,140,255,0.1)] ${!editMode && 'opacity-70 cursor-not-allowed'}`}
                >
                  <option value="">Select size</option>
                  {pantsSizes.map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[#f7f7fb] font-semibold mb-3">
                  Shorts Size
                </label>
                <select
                  value={formData.shortSize}
                  onChange={(e) => handleInputChange("shortSize", e.target.value)}
                  disabled={!editMode}
                  className={`w-full py-3.5 px-4 border-[1.5px] border-white/12 rounded-xl text-base transition-all bg-white text-black focus:outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(155,140,255,0.1)] ${!editMode && 'opacity-70 cursor-not-allowed'}`}
                >
                  <option value="">Select size</option>
                  {shortSizes.map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Style Preferences */}
          <div className="bg-white/[0.06] border border-white/10 rounded-2xl p-6 md:p-8 mb-6">
            <h2 className="text-xl md:text-2xl font-bold text-white mb-6">
              Style Preferences
            </h2>
            
            <div className="mb-8">
              <label className="block text-[#f7f7fb] font-semibold mb-4 text-base">
                Your Styles
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                {styleOptions.map((style) => (
                  <button
                    key={style}
                    onClick={() => editMode && handleToggleArray("stylePreferences", style)}
                    disabled={!editMode}
                    className={`py-3 px-4 rounded-xl border-2 transition-all duration-300 text-sm ${
                      formData.stylePreferences.includes(style)
                        ? "border-primary bg-primary/20 text-white"
                        : "border-white/10 bg-white/[0.04] text-[#a6a6b3]"
                    } ${editMode ? 'cursor-pointer hover:border-primary/30' : 'cursor-default opacity-70'}`}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[#f7f7fb] font-semibold mb-4 text-base">
                Favorite Colors
              </label>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {colorOptions.map((color) => (
                  <button
                    key={color}
                    onClick={() => editMode && handleToggleArray("colorPreferences", color)}
                    disabled={!editMode}
                    className={`py-3 px-4 rounded-xl border-2 transition-all duration-300 text-sm ${
                      formData.colorPreferences.includes(color)
                        ? "border-primary bg-primary/20 text-white"
                        : "border-white/10 bg-white/[0.04] text-[#a6a6b3]"
                    } ${editMode ? 'cursor-pointer hover:border-primary/30' : 'cursor-default opacity-70'}`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Brands & Budget */}
          <div className="bg-white/[0.06] border border-white/10 rounded-2xl p-6 md:p-8 mb-6">
            <h2 className="text-xl md:text-2xl font-bold text-white mb-6">
              Brands & Budget
            </h2>
            
            <div className="mb-8">
              <label className="block text-[#f7f7fb] font-semibold mb-4 text-base">
                Favorite Brands
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {popularBrands.map((brand) => (
                  <button
                    key={brand}
                    onClick={() => editMode && handleToggleArray("favoriteBrands", brand)}
                    disabled={!editMode}
                    className={`py-3 px-4 rounded-xl border-2 transition-all duration-300 text-sm ${
                      formData.favoriteBrands.includes(brand)
                        ? "border-primary bg-primary/20 text-white"
                        : "border-white/10 bg-white/[0.04] text-[#a6a6b3]"
                    } ${editMode ? 'cursor-pointer hover:border-primary/30' : 'cursor-default opacity-70'}`}
                  >
                    {brand}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[#f7f7fb] font-semibold mb-4 text-base">
                Price Range per Item
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {["$0-50", "$50-100", "$100-200", "$200+"].map((range) => (
                  <button
                    key={range}
                    onClick={() => editMode && handleInputChange("priceRange", range)}
                    disabled={!editMode}
                    className={`py-4 px-6 rounded-xl border-2 transition-all duration-300 ${
                      formData.priceRange === range
                        ? "border-primary bg-primary/20 text-white"
                        : "border-white/10 bg-white/[0.04] text-[#a6a6b3]"
                    } ${editMode ? 'cursor-pointer hover:border-primary/30' : 'cursor-default opacity-70'}`}
                  >
                    {range}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          {editMode && (
            <div className="flex items-center justify-end gap-4 mb-6">
              <button
                onClick={handleCancel}
                disabled={saving}
                className="px-6 py-3 rounded-xl font-semibold text-white border border-white/20 hover:bg-white/[0.08] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-8 py-3 rounded-xl font-bold bg-gradient-to-br from-primary to-secondary text-dark-bg shadow-lg shadow-primary/35 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/45 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          )}

          {/* Liked Items */}
          <div className="bg-white/[0.06] border border-white/10 rounded-2xl p-6 md:p-8 mb-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl md:text-2xl font-bold text-white">
                Liked Items
              </h2>
              <div className="text-[#a6a6b3] text-sm">
                {likedItemsTotal} item{likedItemsTotal !== 1 ? 's' : ''}
              </div>
            </div>

            {likedItemsLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : likedItems.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-[#a6a6b3] text-lg mb-2">No liked items yet</p>
                <p className="text-[#a6a6b3] text-sm">Start swiping to find items you love!</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {likedItems.map((item) => (
                    <div
                      key={item._id}
                      className="bg-white/[0.04] border border-white/10 rounded-xl overflow-hidden hover:border-primary/30 transition-all"
                    >
                      <div className="relative aspect-square">
                        <img
                          src={normalizeImageUrl(item.images?.[0])}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-4">
                        <h3 className="text-white font-semibold text-lg mb-1 truncate">
                          {item.name}
                        </h3>
                        <p className="text-[#a6a6b3] text-sm mb-2">{item.brand}</p>
                        <p className="text-primary font-bold text-lg mb-4">
                          ${item.price?.toFixed(2)}
                        </p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleOpenAddToCart(item)}
                            disabled={removingItems.has(item._id)}
                            className="flex-1 py-2 px-4 rounded-lg bg-gradient-to-br from-primary to-secondary text-dark-bg font-semibold text-sm hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Add to Cart
                          </button>
                          <button
                            onClick={() => handleRemoveLikedItems([item._id])}
                            disabled={removingItems.has(item._id)}
                            className="py-2 px-4 rounded-lg border border-white/20 text-white font-semibold text-sm hover:bg-white/[0.08] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {removingItems.has(item._id) ? "..." : "Remove"}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {likedItemsTotal > 10 && (
                  <div className="flex items-center justify-center gap-2 mt-8">
                    <button
                      onClick={() => setLikedItemsPage(p => Math.max(1, p - 1))}
                      disabled={likedItemsPage === 1 || likedItemsLoading}
                      className="px-4 py-2 rounded-lg border border-white/20 text-white font-semibold text-sm hover:bg-white/[0.08] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <div className="flex items-center gap-2">
                      {Array.from({ length: Math.ceil(likedItemsTotal / 10) }, (_, i) => i + 1).map(page => (
                        <button
                          key={page}
                          onClick={() => setLikedItemsPage(page)}
                          disabled={likedItemsLoading}
                          className={`w-10 h-10 rounded-lg font-semibold text-sm transition-all ${
                            page === likedItemsPage
                              ? "bg-gradient-to-br from-primary to-secondary text-dark-bg"
                              : "border border-white/20 text-white hover:bg-white/[0.08]"
                          } disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                          {page}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={() => setLikedItemsPage(p => Math.min(Math.ceil(likedItemsTotal / 10), p + 1))}
                      disabled={likedItemsPage === Math.ceil(likedItemsTotal / 10) || likedItemsLoading}
                      className="px-4 py-2 rounded-lg border border-white/20 text-white font-semibold text-sm hover:bg-white/[0.08] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Add to Cart Modal */}
      {showAddToCart && selectedItemForCart && (
        <AddToCartModal
          item={selectedItemForCart}
          cartItems={serverCart}
          onClose={() => {
            setShowAddToCart(false);
            setSelectedItemForCart(null);
          }}
          onAdded={handleCartAdded}
        />
      )}
    </>
  );
}