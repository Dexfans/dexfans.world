"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const API = "https://dexfans-api.dwf6zb4bd.workers.dev";

type User = {
  id: number;
  username: string;
  display_name: string;
  bio: string;
  avatar_url?: string;
  email?: string;
};

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);

  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem("dexfans_user");

    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);

        if (parsedUser?.username) {
          setUser(parsedUser);
        }
      } catch {
        localStorage.removeItem("dexfans_user");
      }
    }
  }, []);

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
          username: username.trim().toLowerCase(),
          displayName: displayName.trim(),
          bio: bio.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setMessage(
          `❌ ${data.error || "Could not create profile."}`
        );
        return;
      }

      // Save the real user returned by D1
      localStorage.setItem(
        "dexfans_user",
        JSON.stringify(data.user)
      );

      // Immediately switch to profile view
      setUser(data.user);

      setMessage("");

      setUsername("");
      setDisplayName("");
      setBio("");

    } catch (error) {
      setMessage("❌ Could not connect to DexFans API.");
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    localStorage.removeItem("dexfans_user");
    setUser(null);
  }

  // =========================================
  // REAL PROFILE
  // =========================================

  if (user) {
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
            maxWidth: "700px",
            margin: "0 auto",
          }}
        >

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "40px",
            }}
          >

            <Link
              href="/"
              style={{
                color: "#999",
                textDecoration: "none",
              }}
            >
              ← DexFans
            </Link>

            <button
              onClick={logout}
              style={{
                background: "#151515",
                color: "#fff",
                border: "1px solid #333",
                borderRadius: "10px",
                padding: "10px 16px",
                cursor: "pointer",
              }}
            >
              Logout
            </button>

          </div>

          <div
            style={{
              background: "#0b0b0b",
              border: "1px solid #292929",
              borderRadius: "20px",
              padding: "35px",
            }}
          >

            {/* AVATAR */}

            <div
              style={{
                width: "110px",
                height: "110px",
                borderRadius: "50%",
                background:
                  "linear-gradient(135deg,#ff006e,#8338ec,#0095f6)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "42px",
                fontWeight: "800",
                marginBottom: "25px",
              }}
            >
              {user.username
                ? user.username.charAt(0).toUpperCase()
                : "D"}
            </div>

            {/* NAME */}

            <h1
              style={{
                fontSize: "32px",
                margin: "0 0 5px",
              }}
            >
              {user.display_name || user.username}
            </h1>

            {/* USERNAME */}

            <p
              style={{
                color: "#888",
                fontSize: "16px",
                margin: "0 0 25px",
              }}
            >
              @{user.username}
            </p>

            {/* BIO */}

            <p
              style={{
                color: "#ccc",
                fontSize: "16px",
                lineHeight: "1.6",
                marginBottom: "30px",
              }}
            >
              {user.bio || "No bio yet."}
            </p>

            {/* STATS */}

            <div
              style={{
                display: "flex",
                gap: "40px",
                borderTop: "1px solid #292929",
                borderBottom: "1px solid #292929",
                padding: "20px 0",
                marginBottom: "30px",
              }}
            >

              <div>
                <strong style={{ fontSize: "20px" }}>
                  0
                </strong>

                <div style={{ color: "#777" }}>
                  Posts
                </div>
              </div>

              <div>
                <strong style={{ fontSize: "20px" }}>
                  0
                </strong>

                <div style={{ color: "#777" }}>
                  Followers
                </div>
              </div>

              <div>
                <strong style={{ fontSize: "20px" }}>
                  0
                </strong>

                <div style={{ color: "#777" }}>
                  Following
                </div>
              </div>

            </div>

            {/* POSTS */}

            <div>

              <h2
                style={{
                  fontSize: "20px",
                  marginBottom: "15px",
                }}
              >
                Posts
              </h2>

              <div
                style={{
                  background: "#111",
                  borderRadius: "12px",
                  padding: "35px",
                  textAlign: "center",
                  color: "#666",
                }}
              >
                No posts yet.
              </div>

            </div>

          </div>

        </div>
      </main>
    );
  }

  // =========================================
  // CREATE PROFILE
  // =========================================

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
                setUsername(
                  e.target.value
                    .toLowerCase()
                    .replace(/[^a-z0-9_]/g, "")
                )
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
