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
          username: username.trim(),
          displayName: displayName.trim(),
          bio: bio.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.error || "Could not create profile.");
        return;
      }

      localStorage.setItem(
        "dexfans_user",
        JSON.stringify(data.user)
      );

      setMessage("✅ Profile created successfully!");

      setUsername("");
      setDisplayName("");
      setBio("");

    } catch (error) {
      setMessage("❌ Could not connect to DexFans API.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#000",
        color: "#fff",
        padding: "30px 20px",
      }}
    >

      <div
        style={{
          maxWidth: "600px",
          margin: "0 auto",
        }}
      >

        <Link
          href="/"
          style={{
            color: "#999",
            textDecoration: "none",
            fontSize: "14px",
          }}
        >
          ← DexFans
        </Link>

        <div
          style={{
            marginTop: "50px",
            background: "#0b0b0b",
            border: "1px solid #292929",
            borderRadius: "20px",
            padding: "30px",
          }}
        >

          <div
            style={{
              width: "100px",
              height: "100px",
              borderRadius: "50%",
              background:
                "linear-gradient(135deg,#ff006e,#8338ec,#0095f6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "40px",
              fontWeight: "800",
              marginBottom: "25px",
            }}
          >
            {username
              ? username.charAt(0).toUpperCase()
              : "D"}
          </div>

          <h1
            style={{
              fontSize: "28px",
              marginBottom: "8px",
            }}
          >
            Create your DexFans profile
          </h1>

          <p
            style={{
              color: "#888",
              marginBottom: "30px",
            }}
          >
            Create your identity on DexFans.
          </p>

          <form
            onSubmit={createProfile}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "15px",
            }}
          >

            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) =>
                setUsername(e.target.value)
              }
              required
              minLength={3}
              style={inputStyle}
            />

            <input
              type="text"
              placeholder="Display name"
              value={displayName}
              onChange={(e) =>
                setDisplayName(e.target.value)
              }
              style={inputStyle}
            />

            <textarea
              placeholder="Tell people about yourself..."
              value={bio}
              onChange={(e) =>
                setBio(e.target.value)
              }
              rows={5}
              style={{
                ...inputStyle,
                resize: "vertical",
              }}
            />

            <button
              type="submit"
              disabled={loading}
              style={{
                background: "#0095f6",
                color: "#fff",
                border: "none",
                borderRadius: "10px",
                padding: "15px",
                fontSize: "16px",
                fontWeight: "700",
                cursor: "pointer",
                opacity: loading ? 0.6 : 1,
              }}
            >
              {loading
                ? "Creating profile..."
                : "Create profile"}
            </button>

          </form>

          {message && (
            <div
              style={{
                marginTop: "20px",
                padding: "15px",
                background: "#151515",
                borderRadius: "10px",
                color: "#fff",
              }}
            >
              {message}
            </div>
          )}

        </div>

      </div>

    </main>
  );
}

const inputStyle = {
  width: "100%",
  boxSizing: "border-box" as const,
  background: "#151515",
  color: "#fff",
  border: "1px solid #333",
  borderRadius: "10px",
  padding: "15px",
  fontSize: "15px",
  outline: "none",
};
