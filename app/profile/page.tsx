"use client";

import { useState } from "react";
import Link from "next/link";

const API = "https://dexfans-api.dwf6zb4bd6.workers.dev";

export default function ProfilePage() {
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function createProfile(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(`${API}/api/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          displayName,
          bio,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.error || "Could not create profile.");
        return;
      }

      localStorage.setItem("dexfans_user", JSON.stringify(data.user));

      setMessage("Profile created successfully.");
    } catch {
      setMessage("Could not connect to DexFans API.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="profile-page">

      <header className="profile-header">
        <Link href="/" className="back-home">
          ← DexFans
        </Link>
      </header>

      <section className="profile-card">

        <div className="profile-avatar">
          {username ? username.charAt(0).toUpperCase() : "D"}
        </div>

        <div className="profile-main">

          <h1>Create your DexFans profile</h1>

          <p className="profile-bio">
            Create your identity on DexFans.
          </p>

          <form
            onSubmit={createProfile}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "12px",
              maxWidth: "450px",
              marginTop: "25px",
            }}
          >

            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              minLength={3}
            />

            <input
              type="text"
              placeholder="Display name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />

            <textarea
              placeholder="Bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={4}
            />

            <button
              className="primary-button"
              type="submit"
              disabled={loading}
            >
              {loading ? "Creating..." : "Create profile"}
            </button>

          </form>

          {message && (
            <p style={{ marginTop: "20px" }}>
              {message}
            </p>
          )}

        </div>

      </section>

    </main>
  );
}
