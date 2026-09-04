"use client";

import {
  ArrowLeft,
  Settings,
  Camera,
  Grid3X3,
  Lock,
  Edit3,
  LogOut,
} from "lucide-react";

import { useEffect, useState } from "react";

const API =
  "https://dexfans-api.dwf6zb4bd.workers.dev";

type User = {
  id: number;
  username: string;
  display_name: string;
  email?: string;
  bio?: string;
  avatar_url?: string;
};

type Post = {
  id: number;
  user_id: number;
  username: string;
  display_name: string;
  caption?: string;
  media_url?: string;
  created_at: string;
};

export default function MyProfilePage() {
  const [user, setUser] =
    useState<User | null>(null);

  const [posts, setPosts] =
    useState<Post[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [editing, setEditing] =
    useState(false);

  const [displayName, setDisplayName] =
    useState("");

  const [bio, setBio] =
    useState("");

  const [avatarUrl, setAvatarUrl] =
    useState("");

  const [saving, setSaving] =
    useState(false);

  useEffect(() => {
    const saved =
      localStorage.getItem("dexfans_user");

    if (!saved) {
      window.location.href = "/login";
      return;
    }

    try {
      const parsed = JSON.parse(saved);

      setUser(parsed);
      setDisplayName(
        parsed.display_name ||
          parsed.username ||
          ""
      );
      setBio(parsed.bio || "");
      setAvatarUrl(parsed.avatar_url || "");

      loadPosts(parsed.id);
    } catch {
      localStorage.removeItem(
        "dexfans_user"
      );

      window.location.href = "/login";
    }
  }, []);

  async function loadPosts(
    userId: number
  ) {
    try {
      const response = await fetch(
        `${API}/api/posts?user_id=${userId}`
      );

      if (!response.ok) {
        setLoading(false);
        return;
      }

      const data =
        await response.json();

      if (
        data.success &&
        Array.isArray(data.posts)
      ) {
        setPosts(data.posts);
      }
    } catch {
    } finally {
      setLoading(false);
    }
  }

  async function saveProfile() {
    if (!user) return;

    setSaving(true);

    try {
      const response = await fetch(
        `${API}/api/users/${encodeURIComponent(
          user.username
        )}`,
        {
          method: "PUT",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            displayName:
              displayName.trim(),
            bio: bio.trim(),
            avatarUrl:
              avatarUrl.trim(),
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.error ||
            "Could not update profile"
        );
      }

      const updatedUser =
        data.user || {
          ...user,
          display_name:
            displayName.trim(),
          bio: bio.trim(),
          avatar_url:
            avatarUrl.trim(),
        };

      setUser(updatedUser);

      localStorage.setItem(
        "dexfans_user",
        JSON.stringify(updatedUser)
      );

      setEditing(false);
    } catch {
      /*
       * Keep the local profile usable even
       * if the API update endpoint isn't
       * deployed yet.
       */

      const updatedUser = {
        ...user,
        display_name:
          displayName.trim(),
        bio: bio.trim(),
        avatar_url:
          avatarUrl.trim(),
      };

      setUser(updatedUser);

      localStorage.setItem(
        "dexfans_user",
        JSON.stringify(updatedUser)
      );

      setEditing(false);
    } finally {
      setSaving(false);
    }
  }

  function logout() {
    localStorage.removeItem(
      "dexfans_user"
    );

    window.location.href = "/login";
  }

  if (loading) {
    return (
      <main className="my-profile-loading">
        <div className="profile-spinner" />
      </main>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <main className="my-profile-page">

      {/* HEADER */}

      <header className="my-profile-topbar">

        <a href="/">
          <ArrowLeft size={23} />
        </a>

        <strong>
          @{user.username}
        </strong>

        <button
          onClick={() =>
            setEditing(true)
          }
        >
          <Settings size={21} />
        </button>

      </header>

      {/* PROFILE */}

      <section className="my-profile-header">

        <div className="my-profile-main">

          <div className="my-profile-avatar">

            {user.avatar_url ? (
              <img
                src={user.avatar_url}
                alt=""
              />
            ) : (
              <span>
                {user.username
                  .charAt(0)
                  .toUpperCase()}
              </span>
            )}

          </div>

          <div className="my-profile-info">

            <h1>
              {user.display_name ||
                user.username}
            </h1>

            <p>
              @{user.username}
            </p>

            <div className="my-profile-bio">
              {user.bio ||
                "No bio yet. Tell your fans about yourself."}
            </div>

          </div>

        </div>

        {/* STATS */}

        <div className="my-profile-stats">

          <div>
            <strong>
              {posts.length}
            </strong>

            <span>Posts</span>
          </div>

          <div>
            <strong>0</strong>

            <span>Followers</span>
          </div>

          <div>
            <strong>0</strong>

            <span>Following</span>
          </div>

        </div>

        {/* BUTTONS */}

        <div className="my-profile-actions">

          <button
            onClick={() =>
              setEditing(true)
            }
          >
            <Edit3 size={16} />
            Edit profile
          </button>

          <button
            onClick={() =>
              alert(
                "Creator tools are coming next."
              )
            }
          >
            Creator tools
          </button>

          <button
            onClick={logout}
            className="logout-button"
          >
            <LogOut size={16} />
            Log out
          </button>

        </div>

      </section>

      {/* TABS */}

      <div className="my-profile-tabs">

        <button className="active">
          <Grid3X3 size={20} />
          Posts
        </button>

        <button>
          <Lock size={19} />
          Exclusive
        </button>

      </div>

      {/* POSTS */}

      <section className="my-profile-grid">

        {posts.length === 0 ? (

          <div className="empty-profile">

            <div>
              <Camera size={38} />
            </div>

            <h2>
              Share your first post
            </h2>

            <p>
              Create content and start
              building your audience.
            </p>

            <button
              onClick={() =>
                (window.location.href =
                  "/")
              }
            >
              Create post
            </button>

          </div>

        ) : (

          posts.map((post) => (

            <article
              className="my-profile-post"
              key={post.id}
            >

              {post.media_url ? (
                <img
                  src={post.media_url}
                  alt=""
                />
              ) : (
                <div>
                  {post.caption}
                </div>
              )}

            </article>

          ))

        )}

      </section>

      {/* EDIT MODAL */}

      {editing && (

        <div className="edit-profile-overlay">

          <div className="edit-profile-modal">

            <header>

              <h2>
                Edit profile
              </h2>

              <button
                onClick={() =>
                  setEditing(false)
                }
              >
                ×
              </button>

            </header>

            {/* AVATAR */}

            <div className="edit-avatar">

              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt=""
                />
              ) : (
                <span>
                  {user.username
                    .charAt(0)
                    .toUpperCase()}
                </span>
              )}

              <label>
                <Camera size={17} />
                Change photo

                <input
                  type="text"
                  value={avatarUrl}
                  onChange={(e) =>
                    setAvatarUrl(
                      e.target.value
                    )
                  }
                  placeholder="Image URL"
                />
              </label>

            </div>

            {/* DISPLAY NAME */}

            <label className="edit-field">

              <span>
                Display name
              </span>

              <input
                value={displayName}
                onChange={(e) =>
                  setDisplayName(
                    e.target.value
                  )
                }
                placeholder="Your name"
                maxLength={50}
              />

            </label>

            {/* USERNAME */}

            <label className="edit-field">

              <span>
                Username
              </span>

              <input
                value={`@${user.username}`}
                disabled
              />

            </label>

            {/* BIO */}

            <label className="edit-field">

              <span>
                Bio
              </span>

              <textarea
                value={bio}
                onChange={(e) =>
                  setBio(e.target.value)
                }
                placeholder="Tell people about yourself..."
                rows={4}
                maxLength={160}
              />

              <small>
                {bio.length}/160
              </small>

            </label>

            <button
              className="save-profile"
              onClick={saveProfile}
              disabled={saving}
            >
              {saving
                ? "Saving..."
                : "Save changes"}
            </button>

          </div>

        </div>

      )}

    </main>
  );
}
