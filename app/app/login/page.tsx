"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";

export default function LoginPage() {

  const [email, setEmail] = useState("");
  const [password, setPassword] =
    useState("");

  const [message, setMessage] =
    useState("");

  function login(e: React.FormEvent) {

    e.preventDefault();

    if (!email || !password) {
      setMessage(
        "Enter your email and password."
      );
      return;
    }

    setMessage(
      "Authentication will be connected to Cloudflare next."
    );
  }

  return (

    <main className="auth-page">

      <div className="auth-card">

        <div className="auth-logo">

          <div className="brand-mark">
            D
          </div>

          <span>DexFans</span>

        </div>

        <p className="auth-tagline">
          Your world. Your creators.
        </p>

        <form onSubmit={login}>

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
          />

          <button className="auth-submit">
            Log in
          </button>

        </form>

        {message && (
          <p className="auth-message">
            {message}
          </p>
        )}

        <div className="divider">
          <span>OR</span>
        </div>

        <button className="social-login">
          Continue with Google
        </button>

        <p className="signup-text">
          Don't have an account?
          <a href="#"> Sign up</a>
        </p>

        <div className="creator-box">

          <Sparkles size={18} />

          <div>
            <strong>
              Become a creator
            </strong>

            <span>
              Build your audience and earn.
            </span>
          </div>

        </div>

      </div>

    </main>
  );
}
