import React, { useState, useEffect } from "react";

const API_URL = "http://localhost:5000/api/users";

// Toast Notification Component
function Toast({ message, type, onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000); // Auto-dismiss after 4 seconds

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

export default function GetStartedPage() {
  const [mode, setMode] = useState("signup");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setToast(null);

    if (mode === "signup") {
      if (!name || !email || !pass || !confirmPass) {
        setToast({ message: "Please fill all fields to sign up.", type: "error" });
        return;
      }

      setLoading(true);
      try {
        const response = await fetch(`${API_URL}/register`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: name,
            email: email,
            password: pass,
            confirmPassword: confirmPass,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Registration failed");
        }

        setToast({ message: "Account created successfully! Please log in.", type: "success" });
        setMode("login");
        setName("");
        setPass("");
        setConfirmPass("");
      } catch (err) {
        setToast({ message: err.message || "Failed to create account. Please try again.", type: "error" });
      } finally {
        setLoading(false);
      }
    } else {
      if (!email || !pass) {
        setToast({ message: "Please enter email and password to log in.", type: "error" });
        return;
      }

      setLoading(true);
      try {
        const response = await fetch(`${API_URL}/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            identifier: email,
            password: pass,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Login failed");
        }

        localStorage.setItem("accessToken", data.accessToken);
        localStorage.setItem("refreshToken", data.refreshToken);

        setToast({ message: "Login successful! Redirecting...", type: "success" });
        
        setEmail("");
        setPass("");

        const hasOnboarded = (() => {
          try {
            return localStorage.getItem("hasOnboarded") === "true";
          } catch (_) {
            return false;
          }
        })();

        setTimeout(() => {
          window.location.pathname = hasOnboarded ? "/shop" : "/onboarding";
        }, 1000);
      } catch (err) {
        setToast({ message: err.message || "Failed to log in. Please try again.", type: "error" });
      } finally {
        setLoading(false);
      }
    }
  };

  const goHome = (e) => {
    e.preventDefault();
    window.location.pathname = "/";
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      <section className="flex justify-center items-center min-h-screen px-5 py-10">
        <div className="bg-white/[0.06] border border-white/[0.08] rounded-3xl p-12 md:p-14 shadow-[0_12px_30px_rgba(0,0,0,0.35)] w-full max-w-md text-center">
        <h2 className="text-4xl mb-2 text-[#f7f7fb] font-bold">Get Started</h2>
        <p className="text-[#a6a6b3] text-base mb-8 leading-relaxed">
          {mode === "signup"
            ? "Create your account to begin."
            : "Welcome back! Log in to continue."}
        </p>

        <div className="flex justify-center bg-white/[0.04] border border-white/[0.08] rounded-xl mb-8 overflow-hidden">
          <button
            className={`flex-1 py-3 border-none font-semibold text-[#a6a6b3] transition-all duration-250 cursor-pointer text-base ${
              mode === "signup"
                ? "bg-gradient-to-br from-primary to-secondary text-dark-bg shadow-lg shadow-primary/30"
                : "bg-transparent hover:bg-white/[0.08] hover:text-[#f7f7fb]"
            }`}
            onClick={() => setMode("signup")}
          >
            Sign Up
          </button>
          <button
            className={`flex-1 py-3 border-none font-semibold text-[#a6a6b3] transition-all duration-250 cursor-pointer text-base ${
              mode === "login"
                ? "bg-gradient-to-br from-primary to-secondary text-dark-bg shadow-lg shadow-primary/30"
                : "bg-transparent hover:bg-white/[0.08] hover:text-[#f7f7fb]"
            }`}
            onClick={() => setMode("login")}
          >
            Log In
          </button>
        </div>

        <form className="flex flex-col gap-5 mb-6" onSubmit={submit}>
          {mode === "signup" && (
            <div className="text-left">
              <label className="font-semibold text-[#f7f7fb] block mb-2 text-sm">Username</label>
              <input
                className="w-full py-3.5 px-4 border-[1.5px] border-white/12 rounded-xl text-base transition-all bg-white/[0.04] text-[#f7f7fb] placeholder:text-[#a6a6b3] focus:outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(155,140,255,0.1)]"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your username"
                disabled={loading}
              />
            </div>
          )}
          <div className="text-left">
            <label className="font-semibold text-[#f7f7fb] block mb-2 text-sm">Email</label>
            <input
              type="email"
              className="w-full py-3.5 px-4 border-[1.5px] border-white/12 rounded-xl text-base transition-all bg-white/[0.04] text-[#f7f7fb] placeholder:text-[#a6a6b3] focus:outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(155,140,255,0.1)]"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@email.com"
              disabled={loading}
            />
          </div>
          <div className="text-left">
            <label className="font-semibold text-[#f7f7fb] block mb-2 text-sm">Password</label>
            <input
              type="password"
              className="w-full py-3.5 px-4 border-[1.5px] border-white/12 rounded-xl text-base transition-all bg-white/[0.04] text-[#f7f7fb] placeholder:text-[#a6a6b3] focus:outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(155,140,255,0.1)]"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              placeholder="••••••••"
              disabled={loading}
            />
          </div>
          {mode === "signup" && (
            <div className="text-left">
              <label className="font-semibold text-[#f7f7fb] block mb-2 text-sm">Confirm Password</label>
              <input
                type="password"
                className="w-full py-3.5 px-4 border-[1.5px] border-white/12 rounded-xl text-base transition-all bg-white/[0.04] text-[#f7f7fb] placeholder:text-[#a6a6b3] focus:outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(155,140,255,0.1)]"
                value={confirmPass}
                onChange={(e) => setConfirmPass(e.target.value)}
                placeholder="••••••••"
                disabled={loading}
              />
            </div>
          )}

          <button
            className="w-full py-3.5 bg-gradient-to-br from-primary to-secondary text-dark-bg border-none rounded-xl text-base font-bold transition-all duration-300 cursor-pointer shadow-lg shadow-primary/30 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/40 disabled:opacity-50 disabled:cursor-not-allowed"
            type="submit"
            disabled={loading}
          >
            {loading ? "Loading..." : mode === "signup" ? "Create Account" : "Log In"}
          </button>
        </form>

        <a
          href="/"
          onClick={goHome}
          className="inline-block mt-4 text-primary font-medium no-underline transition-colors text-sm hover:text-secondary"
        >
          ← Back to About
        </a>
        </div>
      </section>
    </>
  );
}
