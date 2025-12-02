import React, { useState, useEffect } from "react";

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
  }, []);

  const fetchUserProfile = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('http://localhost:5000/api/users/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }

      const data = await response.json();
      setUserData(data);
      setFormData(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
      setToast({ message: 'Failed to load profile data', type: 'error' });
    } finally {
      setLoading(false);
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
      const token = localStorage.getItem('accessToken');
      const response = await fetch('http://localhost:5000/api/users/account', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
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

      setUserData(data);
      setFormData(data);
      setEditMode(false);
      setToast({ message: 'Profile updated successfully!', type: 'success' });
    } catch (error) {
      console.error('Error updating profile:', error);
      setToast({ message: error.message || 'Failed to update profile', type: 'error' });
    } finally {
      setSaving(false);
    }
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
                <div className="px-4 py-3 rounded-lg bg-white/[0.04] border border-white/10 text-white">
                  {userData.username}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#a6a6b3] mb-2">
                  Email
                </label>
                <div className="px-4 py-3 rounded-lg bg-white/[0.04] border border-white/10 text-white">
                  {userData.email}
                </div>
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
            <div className="flex items-center justify-end gap-4">
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
        </div>
      </div>
    </>
  );
}