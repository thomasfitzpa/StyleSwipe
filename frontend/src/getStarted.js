import React, { useState, useEffect } from "react";

export default function GetStartedPage() {
  const [mode, setMode] = useState("signup");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [name, setName] = useState("");

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const submit = (e) => {
    e.preventDefault();
    if (mode === "signup") {
      if (!name || !email || !pass)
        return alert("Please fill all fields to sign up.");
      alert(`Sign up:\nName: ${name}\nEmail: ${email}\nPassword: ••••`);
    } else {
      if (!email || !pass)
        return alert("Please enter email and password to log in.");
      alert(`Log in:\nEmail: ${email}\nPassword: ••••`);
    }
  };

  const goHome = (e) => {
    e.preventDefault();
    window.location.hash = "#home";
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <section className="get-started-page">
      <style>{`
        .get-started-page {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          background: linear-gradient(135deg, #4b6cb7, #182848);
          padding: 20px;
          font-family: "Inter", sans-serif;
        }

        .gs-card {
          background: #fff;
          border-radius: 20px;
          padding: 40px 50px;
          box-shadow: 0 12px 25px rgba(0, 0, 0, 0.15);
          width: 100%;
          max-width: 420px;
          text-align: center;
        }

        .gs-title {
          font-size: 2rem;
          margin-bottom: 8px;
          color: #222;
        }

        .gs-subtitle {
          color: #666;
          font-size: 0.95rem;
          margin-bottom: 24px;
        }

        .gs-toggle {
          display: flex;
          justify-content: center;
          background: #f3f4f6;
          border-radius: 10px;
          margin-bottom: 30px;
          overflow: hidden;
        }

        .tab {
          flex: 1;
          padding: 12px 0;
          border: none;
          background: transparent;
          font-weight: 600;
          color: #555;
          transition: all 0.25s ease;
          cursor: pointer;
        }

        .tab.active {
          background: #4b6cb7;
          color: white;
          box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.2);
        }

        .tab:not(.active):hover {
          background: #e6e9ef;
        }

        .gs-form {
          display: flex;
          flex-direction: column;
          gap: 18px;
          margin-bottom: 24px;
        }

        .field {
          text-align: left;
        }

        .field label {
          font-weight: 600;
          color: #333;
          display: block;
          margin-bottom: 6px;
        }

        .field input {
          width: 100%;
          padding: 12px 14px;
          border: 1.5px solid #ccc;
          border-radius: 8px;
          font-size: 0.95rem;
          transition: border-color 0.25s;
        }

        .field input:focus {
          outline: none;
          border-color: #4b6cb7;
        }

        .btn.primary {
          width: 100%;
          padding: 14px 0;
          background: #4b6cb7;
          color: white;
          border: none;
          border-radius: 10px;
          font-size: 1rem;
          font-weight: 600;
          transition: all 0.3s ease;
          cursor: pointer;
        }

        .btn.primary:hover {
          background: #3d58a5;
          transform: translateY(-2px);
          box-shadow: 0 6px 15px rgba(75, 108, 183, 0.4);
        }

        .back-link {
          display: inline-block;
          margin-top: 10px;
          color: #4b6cb7;
          font-weight: 500;
          text-decoration: none;
          transition: color 0.2s ease;
        }

        .back-link:hover {
          color: #182848;
        }
      `}</style>

      <div className="gs-card">
        <h2 className="gs-title">Get Started</h2>
        <p className="gs-subtitle">
          {mode === "signup"
            ? "Create your account to begin."
            : "Welcome back! Log in to continue."}
        </p>

        <div className="gs-toggle">
          <button
            className={`tab ${mode === "signup" ? "active" : ""}`}
            onClick={() => setMode("signup")}
          >
            Sign Up
          </button>
          <button
            className={`tab ${mode === "login" ? "active" : ""}`}
            onClick={() => setMode("login")}
          >
            Log In
          </button>
        </div>

        <form className="gs-form" onSubmit={submit}>
          {mode === "signup" && (
            <div className="field">
              <label>Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
              />
            </div>
          )}
          <div className="field">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@email.com"
            />
          </div>
          <div className="field">
            <label>Password</label>
            <input
              type="password"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          <button className="btn primary" type="submit">
            {mode === "signup" ? "Create Account" : "Log In"}
          </button>
        </form>

        <a href="#home" onClick={goHome} className="back-link">
          ← Back to About
        </a>
      </div>
    </section>
  );
}
