import React from "react";

export default function OnboardingPage() {
  return (
    <section className="flex justify-center items-center min-h-screen px-5 py-10">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-5xl md:text-6xl font-extrabold mb-6 tracking-tight">
          Welcome to <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">StyleSwipe</span>!
        </h1>
        <p className="text-[#a6a6b3] text-xl mb-12">
          Let's get you set up and swiping in no time.
        </p>
        
        <div className="bg-white/[0.06] border border-white/10 rounded-3xl p-12 md:p-16">
          <p className="text-[#e6e6ef] text-lg">
            Onboarding content coming soon...
          </p>
        </div>
      </div>
    </section>
  );
}

