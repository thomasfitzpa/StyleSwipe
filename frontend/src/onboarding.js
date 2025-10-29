import React, { useState } from "react";

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
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

  const [loading, setLoading] = useState(false);
  const [complete, setComplete] = useState(false);

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

  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    // TODO: Send formData to backend API
    setTimeout(() => {
      setLoading(false);
      setComplete(true);
    }, 1500);
  };

  const shoeSizes = Array.from({ length: 20 }, (_, i) => i + 4); // 4-23
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

  if (complete) {
    return (
      <section className="flex justify-center items-center min-h-screen px-5 py-10">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-white/[0.06] border border-white/10 rounded-3xl p-12 md:p-16">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl font-bold text-dark-bg">✓</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight">
              You're all set! 🎉
            </h1>
            <p className="text-[#a6a6b3] text-lg mb-8">
              Your profile is customized. Start swiping to discover your perfect style!
            </p>
            <button
              onClick={() => {
                window.location.pathname = "/shop";
              }}
              className="inline-flex items-center justify-center px-8 py-4 rounded-xl font-bold text-base bg-gradient-to-br from-primary to-secondary text-dark-bg shadow-lg shadow-primary/35 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/45"
            >
              Start Swiping
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="flex justify-center items-center min-h-screen px-5 py-10">
      <div className="max-w-3xl mx-auto w-full">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm text-[#a6a6b3]">Step {step} of 4</span>
            <span className="text-sm text-[#a6a6b3]">{Math.round((step / 4) * 100)}%</span>
          </div>
          <div className="w-full h-2 bg-white/[0.1] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-500"
              style={{ width: `${(step / 4) * 100}%` }}
            />
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white/[0.06] border border-white/[0.08] rounded-3xl p-8 md:p-12 shadow-[0_12px_30px_rgba(0,0,0,0.35)]">
          {/* Step 1: Gender */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-2">Tell us about yourself</h2>
                <p className="text-[#a6a6b3] text-lg">
                  Let's start with the basics to personalize your experience.
                </p>
              </div>

              <div>
                <label className="block text-[#f7f7fb] font-semibold mb-4 text-lg">
                  What's your gender?
                </label>
                <div className="grid grid-cols-2 gap-4">
                  {["Male", "Female", "Unisex"].map((option) => (
                    <button
                      key={option}
                      onClick={() => handleInputChange("gender", option)}
                      className={`py-4 px-6 rounded-xl border-2 transition-all duration-300 ${
                        formData.gender === option
                          ? "border-primary bg-primary/20 text-white"
                          : "border-white/10 bg-white/[0.04] text-[#a6a6b3] hover:border-primary/30"
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Sizes */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-2">Your sizes</h2>
                <p className="text-[#a6a6b3] text-lg">
                  We'll use this to show you items that fit perfectly.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[#f7f7fb] font-semibold mb-3">
                    Shoe Size
                  </label>
                  <select
                    value={formData.shoeSize}
                    onChange={(e) => handleInputChange("shoeSize", e.target.value)}
                    className="w-full py-3.5 px-4 border-[1.5px] border-white/12 rounded-xl text-base transition-all bg-white text-black focus:outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(155,140,255,0.1)]"
                  >
                    <option value="" className="text-black bg-white">Select size</option>
                    {shoeSizes.map((size) => (
                      <option key={size} value={size} className="text-black bg-white">
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
                    className="w-full py-3.5 px-4 border-[1.5px] border-white/12 rounded-xl text-base transition-all bg-white text-black focus:outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(155,140,255,0.1)]"
                  >
                    <option value="" className="text-black bg-white">Select size</option>
                    {shirtSizes.map((size) => (
                      <option key={size} value={size} className="text-black bg-white">
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
                    className="w-full py-3.5 px-4 border-[1.5px] border-white/12 rounded-xl text-base transition-all bg-white text-black focus:outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(155,140,255,0.1)]"
                  >
                    <option value="" className="text-black bg-white">Select size</option>
                    {pantsSizes.map((size) => (
                      <option key={size} value={size} className="text-black bg-white">
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
                    className="w-full py-3.5 px-4 border-[1.5px] border-white/12 rounded-xl text-base transition-all bg-white text-black focus:outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(155,140,255,0.1)]"
                  >
                    <option value="" className="text-black bg-white">Select size</option>
                    {shortSizes.map((size) => (
                      <option key={size} value={size} className="text-black bg-white">
                        {size}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Style Preferences */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-2">Style preferences</h2>
                <p className="text-[#a6a6b3] text-lg">
                  Select all styles that resonate with you. This helps us curate your feed.
                </p>
              </div>

              <div>
                <label className="block text-[#f7f7fb] font-semibold mb-4 text-lg">
                  What styles do you love?
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {styleOptions.map((style) => (
                    <button
                      key={style}
                      onClick={() => handleToggleArray("stylePreferences", style)}
                      className={`py-3 px-4 rounded-xl border-2 transition-all duration-300 text-sm ${
                        formData.stylePreferences.includes(style)
                          ? "border-primary bg-primary/20 text-white"
                          : "border-white/10 bg-white/[0.04] text-[#a6a6b3] hover:border-primary/30"
                      }`}
                    >
                      {style}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-8">
                <label className="block text-[#f7f7fb] font-semibold mb-4 text-lg">
                  Favorite colors?
                </label>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {colorOptions.map((color) => (
                    <button
                      key={color}
                      onClick={() => handleToggleArray("colorPreferences", color)}
                      className={`py-3 px-4 rounded-xl border-2 transition-all duration-300 text-sm ${
                        formData.colorPreferences.includes(color)
                          ? "border-primary bg-primary/20 text-white"
                          : "border-white/10 bg-white/[0.04] text-[#a6a6b3] hover:border-primary/30"
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Brands & Budget */}
          {step === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-2">Last few details</h2>
                <p className="text-[#a6a6b3] text-lg">
                  Help us understand your brand preferences and budget.
                </p>
              </div>

              <div>
                <label className="block text-[#f7f7fb] font-semibold mb-4 text-lg">
                  Favorite brands (select all that apply)
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {popularBrands.map((brand) => (
                    <button
                      key={brand}
                      onClick={() => handleToggleArray("favoriteBrands", brand)}
                      className={`py-3 px-4 rounded-xl border-2 transition-all duration-300 text-sm ${
                        formData.favoriteBrands.includes(brand)
                          ? "border-primary bg-primary/20 text-white"
                          : "border-white/10 bg-white/[0.04] text-[#a6a6b3] hover:border-primary/30"
                      }`}
                    >
                      {brand}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-8">
                <label className="block text-[#f7f7fb] font-semibold mb-4 text-lg">
                  Typical price range per item?
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {["$0-50", "$50-100", "$100-200", "$200+"].map((range) => (
                    <button
                      key={range}
                      onClick={() => handleInputChange("priceRange", range)}
                      className={`py-4 px-6 rounded-xl border-2 transition-all duration-300 ${
                        formData.priceRange === range
                          ? "border-primary bg-primary/20 text-white"
                          : "border-white/10 bg-white/[0.04] text-[#a6a6b3] hover:border-primary/30"
                      }`}
                    >
                      {range}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center mt-10 pt-6 border-t border-white/10">
            <button
              onClick={handleBack}
              disabled={step === 1}
              className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                step === 1
                  ? "opacity-50 cursor-not-allowed text-[#a6a6b3]"
                  : "text-white hover:text-primary border border-white/10 hover:border-primary/30"
              }`}
            >
              ← Back
            </button>

            {step < 4 ? (
              <button
                onClick={handleNext}
                className="px-8 py-3 rounded-xl font-bold bg-gradient-to-br from-primary to-secondary text-dark-bg shadow-lg shadow-primary/35 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/45"
              >
                Next →
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="px-8 py-3 rounded-xl font-bold bg-gradient-to-br from-primary to-secondary text-dark-bg shadow-lg shadow-primary/35 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/45 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Saving..." : "Complete Setup"}
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
