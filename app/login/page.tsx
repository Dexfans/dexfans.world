"use client";

import { useState } from "react";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <main className="auth-page">
      <div className="auth-card">
        <div className="brand auth-brand">
          <div className="brand-icon">D</div>
          <span>DexFans</span>
        </div>

        <h1>Welcome back</h1>
        <p className="auth-subtitle">
          Log in to your DexFans account.
        </p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            alert("Login system coming next.");
          }}
        >
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button className="primary-button" type="submit">
            Log in
          </button>
        </form>

        <div className="divider">
          <span>OR</span>
        </div>

        <button className="wallet-button">
          Connect Solana Wallet
        </button>

        <p className="auth-footer">
          Don't have an account?{" "}
          <Link href="/profile">Create profile</Link>
        </p>

        <Link className="back-home" href="/">
          ← Back to DexFans
        </Link>
      </div>
    </main>
  );
}
