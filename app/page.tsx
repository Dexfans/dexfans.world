"use client";

import {
  Heart,
  MessageCircle,
  Send,
  Bookmark,
  Plus,
  Search,
  Home,
  Compass,
  User,
  Video,
  MoreHorizontal,
  Image as ImageIcon,
  X,
} from "lucide-react";

import { useEffect, useState } from "react";

const API =
  "https://dexfans-api.dwf6zb4bd.workers.dev";

type UserType = {
  id: number;
  username: string;
  display_name: string;
  avatar_url?: string;
};

type Post = {
  id: number;
  user_id: number;
  caption: string;
  media_url?: string;
  created_at: string;
  username: string;
  display_name: string;
  avatar_url?: string;
};

const demoPosts: Post[] = [
  {
    id: 1,
    user_id: 1,
    username: "luna",
    display_name: "Luna",
    avatar_url: "https://i.pravatar.cc/150?img=47",
    media_url:
      "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1200&q=90",
    caption:
      "Welcome to my world ✨ New content dropping soon.",
    created_at: new Date().toISOString(),
  },
  {
    id: 2,
    user_id: 2,
    username: "maya",
    display_name: "Maya",
    avatar_url: "https://i.pravatar.cc/150?img=32",
    media_url:
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=90",
    caption: "Good vibes only 🖤",
    created_at: new Date().toISOString(),
  },
  {
    id: 3,
    user_id: 3,
    username: "aria",
    display_name: "Aria",
    avatar_url: "https://i.pravatar.cc/150?img=44",
    media_url:
      "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1200&q=90",
    caption: "Who is ready for the weekend?",
    created_at: new Date().toISOString(),
  },
];

export default function HomePage() {
  const [user, setUser] = useState<UserType | null>(null);
  const [posts, setPosts] = useState<Post[]>(demoPosts);

  const [liked, setLiked] = useState<number[]>([]);

  const [showCreate, setShowCreate] =
    useState(false);

  const [caption, setCaption] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");

  const [posting, setPosting] = useState(false);

  useEffect(() => {
    const saved =
      localStorage.getItem("dexfans_user");

    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setUser(parsed);

        loadPosts();
      } catch {
        localStorage.removeItem("dexfans_user");
      }
    }
  }, []);

  async function loadPosts() {
    try {
      const response = await fetch(
        `${API}/api/posts`
      );

      if (!response.ok) return;

      const data = await response.json();

      if (
        data.success &&
        Array.isArray(data.posts) &&
        data.posts.length > 0
      ) {
        setPosts(data.posts);
      }
    } catch {
      // Keep demo feed if API is unavailable.
    }
  }

  function toggleLike(id: number) {
    setLiked((current) =>
      current.includes(id)
        ? current.filter((x) => x !== id)
        : [...current, id]
    );

    if (user) {
      fetch(`${API}/api/posts/${id}/like`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
        }),
      }).catch(() => {});
    }
  }

  async function createPost() {
    if (!user) {
      window.location.href = "/login";
      return;
    }

    if (!caption.trim() && !mediaUrl.trim()) {
      return;
    }

    setPosting(true);

    try {
      const response = await fetch(
        `${API}/api/posts`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: user.id,
            caption: caption.trim(),
            mediaUrl: mediaUrl.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.error || "Could not create post"
        );
      }

      setPosts((current) => [
        data.post,
        ...current,
      ]);

      setCaption("");
      setMediaUrl("");
      setShowCreate(false);
    } catch {
      alert(
        "The post could not be published right now."
      );
    } finally {
      setPosting(false);
    }
  }

  return (
    <main className="instagram-app">

      {/* DESKTOP SIDEBAR */}

      <aside className="sidebar">

        <a
          href="/"
          className="brand"
          style={{
            textDecoration: "none",
          }}
        >
          <div className="brand-icon">
            D
          </div>

          <span>DexFans</span>
        </a>

        <nav>

          <a
            className="nav-item active"
            href="/"
          >
            <Home size={24} />
            <span>Home</span>
          </a>

          <a
            className="nav-item"
            href="/explore"
          >
            <Compass size={24} />
            <span>Explore</span>
          </a>

          <a
            className="nav-item"
            href="/live"
          >
            <Video size={24} />
            <span>Live</span>
          </a>

          <button
            className="nav-item"
            onClick={() => {
              if (!user) {
                window.location.href =
                  "/login";
              } else {
                window.location.href =
                  "/profile";
              }
            }}
          >
            <User size={24} />
            <span>Profile</span>
          </button>

        </nav>

        <button
          className="create-button"
          onClick={() => {
            if (!user) {
              window.location.href =
                "/login";
            } else {
              setShowCreate(true);
            }
          }}
        >
          <Plus size={22} />
          Create
        </button>

      </aside>

      {/* MOBILE HEADER */}

      <header className="mobile-header">

        <a
          href="/"
          className="brand"
          style={{
            textDecoration: "none",
          }}
        >
          <div className="brand-icon">
            D
          </div>

          <span>DexFans</span>
        </a>

        <Search size={23} />

      </header>

      {/* MAIN FEED */}

      <section className="feed">

        {/* STORIES */}

        <div className="stories">

          <button
            className="story"
            onClick={() => {
              if (!user) {
                window.location.href =
                  "/login";
              } else {
                setShowCreate(true);
              }
            }}
          >

            <div className="story-avatar create-avatar">
              <Plus size={20} />
            </div>

            <span>Your story</span>

          </button>

          {[
            ["luna", 47],
            ["maya", 32],
            ["aria", 44],
            ["sophie", 25],
            ["mia", 12],
            ["jade", 18],
          ].map(([name, img]) => (

            <a
              className="story"
              key={String(name)}
              href={`/profile/${name}`}
            >

              <div className="story-ring">

                <img
                  src={`https://i.pravatar.cc/150?img=${img}`}
                  alt=""
                />

              </div>

              <span>{name}</span>

            </a>

          ))}

        </div>

        {/* FEED */}

        {posts.map((post) => {

          const isLiked =
            liked.includes(post.id);

          return (

            <article
              className="post"
              key={post.id}
            >

              {/* POST HEADER */}

              <header className="post-header">

                <a
                  href={`/profile/${post.username}`}
                  className="post-user"
                >

                  <img
                    src={
                      post.avatar_url ||
                      "https://i.pravatar.cc/150?img=11"
                    }
                    alt=""
                  />

                  <div>

                    <strong>
                      {post.username}
                    </strong>

                    <span>
                      Creator
                    </span>

                  </div>

                </a>

                <button className="more">
                  <MoreHorizontal
                    size={21}
                  />
                </button>

              </header>

              {/* IMAGE */}

              {post.media_url ? (

                <div className="post-image">

                  <img
                    src={post.media_url}
                    alt=""
                  />

                </div>

              ) : null}

              {/* ACTIONS */}

              <div className="post-actions">

                <div>

                  <button
                    className={
                      isLiked
                        ? "action liked"
                        : "action"
                    }
                    onClick={() =>
                      toggleLike(post.id)
                    }
                  >

                    <Heart
                      size={26}
                      fill={
                        isLiked
                          ? "currentColor"
                          : "none"
                      }
                    />

                  </button>

                  <button className="action">

                    <MessageCircle
                      size={26}
                    />

                  </button>

                  <button className="action">

                    <Send size={25} />

                  </button>

                </div>

                <button className="action">

                  <Bookmark size={26} />

                </button>

              </div>

              {/* CONTENT */}

              <div className="post-content">

                <strong>
                  {isLiked
                    ? "1 like"
                    : "0 likes"}
                </strong>

                <p>

                  <b>
                    {post.username}
                  </b>{" "}

                  {post.caption}

                </p>

                <button className="comments">

                  View all comments

                </button>

              </div>

            </article>

          );
        })}

      </section>

      {/* RIGHT PANEL */}

      <aside className="right-panel">

        <div className="account">

          {user ? (

            <>

              <div className="profile-avatar-small">

                {user.avatar_url ? (

                  <img
                    src={user.avatar_url}
                    alt=""
                  />

                ) : (

                  user.username
                    .charAt(0)
                    .toUpperCase()

                )}

              </div>

              <div>

                <strong>
                  {user.username}
                </strong>

                <span>
                  {user.display_name ||
                    "DexFans creator"}
                </span>

              </div>

              <a href="/profile">
                Profile
              </a>

            </>

          ) : (

            <>

              <img
                src="https://i.pravatar.cc/150?img=11"
                alt=""
              />

              <div>

                <strong>
                  DexFans
                </strong>

                <span>
                  DexFans.world
                </span>

              </div>

              <a href="/login">
                Login
              </a>

            </>

          )}

        </div>

        <div className="suggestion-title">

          <span>
            Suggested for you
          </span>

          <b>
            See All
          </b>

        </div>

        {[
          ["nova", 36],
          ["bella", 21],
          ["ruby", 48],
          ["sky", 29],
          ["zoe", 39],
        ].map(([name, img]) => (

          <div
            className="suggestion"
            key={String(name)}
          >

            <img
              src={`https://i.pravatar.cc/150?img=${img}`}
              alt=""
            />

            <div>

              <strong>
                {name}
              </strong>

              <span>
                Suggested for you
              </span>

            </div>

            <button>
              Follow
            </button>

          </div>

        ))}

      </aside>

      {/* MOBILE NAV */}

      <nav className="mobile-nav">

        <a href="/">
          <Home size={23} />
        </a>

        <a href="/explore">
          <Search size={23} />
        </a>

        <button
          onClick={() => {
            if (!user) {
              window.location.href =
                "/login";
            } else {
              setShowCreate(true);
            }
          }}
        >
          <Plus size={25} />
        </button>

        <a href="/live">
          <Video size={23} />
        </a>

        <a href="/profile">
          <User size={23} />
        </a>

      </nav>

      {/* CREATE POST MODAL */}

      {showCreate && (

        <div
          style={{
            position: "fixed",
            inset: 0,
            background:
              "rgba(0,0,0,0.8)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
            padding: "20px",
          }}
        >

          <div
            style={{
              width: "100%",
              maxWidth: "500px",
              background: "#181818",
              border:
                "1px solid #333",
              borderRadius: "18px",
              padding: "24px",
            }}
          >

            <div
              style={{
                display: "flex",
                justifyContent:
                  "space-between",
                alignItems: "center",
                marginBottom: "20px",
              }}
            >

              <h2
                style={{
                  margin: 0,
                  fontSize: "20px",
                }}
              >
                Create post
              </h2>

              <button
                onClick={() =>
                  setShowCreate(false)
                }
              >
                <X size={22} />
              </button>

            </div>

            <textarea
              value={caption}
              onChange={(e) =>
                setCaption(e.target.value)
              }
              placeholder="What's happening?"
              rows={5}
              style={{
                width: "100%",
                background: "#000",
                color: "#fff",
                border:
                  "1px solid #333",
                borderRadius: "12px",
                padding: "15px",
                resize: "none",
                outline: "none",
                fontSize: "15px",
              }}
            />

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                marginTop: "12px",
              }}
            >

              <ImageIcon size={20} />

              <input
                value={mediaUrl}
                onChange={(e) =>
                  setMediaUrl(e.target.value)
                }
                placeholder="Paste image URL"
                style={{
                  flex: 1,
                  background: "#000",
                  color: "#fff",
                  border:
                    "1px solid #333",
                  borderRadius: "10px",
                  padding: "12px",
                  outline: "none",
                }}
              />

            </div>

            <button
              onClick={createPost}
              disabled={posting}
              style={{
                width: "100%",
                marginTop: "18px",
                padding: "14px",
                background: "#fff",
                color: "#000",
                borderRadius: "10px",
                fontWeight: 700,
                opacity:
                  posting ? 0.5 : 1,
              }}
            >
              {posting
                ? "Publishing..."
                : "Publish"}
            </button>

          </div>

        </div>

      )}

    </main>
  );
}
