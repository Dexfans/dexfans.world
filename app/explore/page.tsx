"use client";

import {
  Search,
  Home,
  Compass,
  Video,
  User,
  Plus,
  Heart,
  MessageCircle,
  X,
} from "lucide-react";

import { useEffect, useState } from "react";

const API =
  "https://dexfans-api.dwf6zb4bd.workers.dev";

type Creator = {
  id: number;
  username: string;
  display_name: string;
  avatar_url?: string;
  bio?: string;
};

type Post = {
  id: number;
  username: string;
  display_name: string;
  avatar_url?: string;
  media_url?: string;
  caption?: string;
};

const demoCreators: Creator[] = [
  {
    id: 1,
    username: "luna",
    display_name: "Luna",
    avatar_url: "https://i.pravatar.cc/300?img=47",
    bio: "Creator ✨",
  },
  {
    id: 2,
    username: "maya",
    display_name: "Maya",
    avatar_url: "https://i.pravatar.cc/300?img=32",
    bio: "Welcome to my world 🖤",
  },
  {
    id: 3,
    username: "aria",
    display_name: "Aria",
    avatar_url: "https://i.pravatar.cc/300?img=44",
    bio: "New content every week",
  },
  {
    id: 4,
    username: "sophie",
    display_name: "Sophie",
    avatar_url: "https://i.pravatar.cc/300?img=25",
    bio: "Living my best life",
  },
  {
    id: 5,
    username: "mia",
    display_name: "Mia",
    avatar_url: "https://i.pravatar.cc/300?img=12",
    bio: "Creator & model",
  },
  {
    id: 6,
    username: "jade",
    display_name: "Jade",
    avatar_url: "https://i.pravatar.cc/300?img=18",
    bio: "Say hello 💕",
  },
];

const demoPosts: Post[] = [
  {
    id: 1,
    username: "luna",
    display_name: "Luna",
    avatar_url: "https://i.pravatar.cc/300?img=47",
    media_url:
      "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=900&q=90",
    caption: "Welcome to my world ✨",
  },
  {
    id: 2,
    username: "maya",
    display_name: "Maya",
    avatar_url: "https://i.pravatar.cc/300?img=32",
    media_url:
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=90",
    caption: "Good vibes only 🖤",
  },
  {
    id: 3,
    username: "aria",
    display_name: "Aria",
    avatar_url: "https://i.pravatar.cc/300?img=44",
    media_url:
      "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=900&q=90",
    caption: "Who is ready for the weekend?",
  },
  {
    id: 4,
    username: "sophie",
    display_name: "Sophie",
    avatar_url: "https://i.pravatar.cc/300?img=25",
    media_url:
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=90",
    caption: "New drop coming soon.",
  },
];

export default function ExplorePage() {
  const [creators, setCreators] =
    useState<Creator[]>(demoCreators);

  const [posts, setPosts] =
    useState<Post[]>(demoPosts);

  const [search, setSearch] = useState("");

  const [user, setUser] =
    useState<Creator | null>(null);

  const [showSearch, setShowSearch] =
    useState(false);

  useEffect(() => {
    const saved =
      localStorage.getItem("dexfans_user");

    if (saved) {
      try {
        setUser(JSON.parse(saved));
      } catch {}
    }

    loadCreators();
    loadPosts();
  }, []);

  async function loadCreators() {
    try {
      const response = await fetch(
        `${API}/api/creators`
      );

      if (!response.ok) return;

      const data = await response.json();

      if (
        data.success &&
        Array.isArray(data.creators) &&
        data.creators.length
      ) {
        setCreators(data.creators);
      }
    } catch {}
  }

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
        data.posts.length
      ) {
        setPosts(data.posts);
      }
    } catch {}
  }

  const filteredCreators =
    creators.filter((creator) => {
      const query =
        search.toLowerCase().trim();

      if (!query) return true;

      return (
        creator.username
          .toLowerCase()
          .includes(query) ||
        creator.display_name
          .toLowerCase()
          .includes(query)
      );
    });

  const filteredPosts =
    posts.filter((post) => {
      const query =
        search.toLowerCase().trim();

      if (!query) return true;

      return (
        post.username
          .toLowerCase()
          .includes(query) ||
        post.caption
          ?.toLowerCase()
          .includes(query)
      );
    });

  return (
    <main className="explore-page">

      {/* DESKTOP SIDEBAR */}

      <aside className="explore-sidebar">

        <a href="/" className="explore-brand">
          <div className="explore-brand-icon">
            D
          </div>

          <span>DexFans</span>
        </a>

        <nav>

          <a
            href="/"
            className="explore-nav-item"
          >
            <Home size={24} />
            <span>Home</span>
          </a>

          <a
            href="/explore"
            className="explore-nav-item active"
          >
            <Compass size={24} />
            <span>Explore</span>
          </a>

          <a
            href="/live"
            className="explore-nav-item"
          >
            <Video size={24} />
            <span>Live</span>
          </a>

          <a
            href="/profile"
            className="explore-nav-item"
          >
            <User size={24} />
            <span>Profile</span>
          </a>

        </nav>

        <button
          className="explore-create"
          onClick={() => {
            if (!user) {
              window.location.href =
                "/login";
            } else {
              window.location.href =
                "/";
            }
          }}
        >
          <Plus size={22} />
          Create
        </button>

      </aside>

      {/* MAIN */}

      <section className="explore-main">

        {/* HEADER */}

        <header className="explore-header">

          <div>
            <h1>Explore</h1>

            <p>
              Discover creators and
              content on DexFans.
            </p>
          </div>

          <button
            className="search-toggle"
            onClick={() =>
              setShowSearch(
                !showSearch
              )
            }
          >
            <Search size={22} />
          </button>

        </header>

        {/* SEARCH */}

        <div
          className={
            showSearch
              ? "explore-search visible"
              : "explore-search"
          }
        >
          <Search size={20} />

          <input
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            placeholder="Search creators..."
            autoFocus={showSearch}
          />

          {search && (
            <button
              onClick={() =>
                setSearch("")
              }
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* CREATOR SECTION */}

        <section className="creator-section">

          <div className="section-heading">

            <h2>Creators</h2>

            <span>
              {filteredCreators.length}
            </span>

          </div>

          <div className="creator-grid">

            {filteredCreators.map(
              (creator) => (
                <a
                  key={creator.id}
                  href={`/profile/${creator.username}`}
                  className="creator-card"
                >

                  <div className="creator-avatar">

                    <img
                      src={
                        creator.avatar_url ||
                        `https://i.pravatar.cc/300?u=${creator.username}`
                      }
                      alt=""
                    />

                  </div>

                  <div className="creator-info">

                    <strong>
                      {creator.display_name ||
                        creator.username}
                    </strong>

                    <span>
                      @{creator.username}
                    </span>

                    <p>
                      {creator.bio ||
                        "DexFans creator"}
                    </p>

                  </div>

                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                  >
                    Follow
                  </button>

                </a>
              )
            )}

          </div>

        </section>

        {/* DISCOVER */}

        <section className="discover-section">

          <div className="section-heading">

            <h2>Discover</h2>

            <span>
              {filteredPosts.length}
            </span>

          </div>

          <div className="discover-grid">

            {filteredPosts.map(
              (post) => (
                <a
                  key={post.id}
                  href={`/profile/${post.username}`}
                  className="discover-post"
                >

                  {post.media_url ? (
                    <img
                      src={post.media_url}
                      alt=""
                    />
                  ) : (
                    <div className="empty-media">
                      <MessageCircle
                        size={35}
                      />
                    </div>
                  )}

                  <div className="discover-overlay">

                    <span>
                      <Heart
                        size={18}
                        fill="currentColor"
                      />
                      Like
                    </span>

                    <span>
                      <MessageCircle
                        size={18}
                        fill="currentColor"
                      />
                      Comment
                    </span>

                  </div>

                </a>
              )
            )}

          </div>

        </section>

        {filteredCreators.length === 0 &&
          filteredPosts.length === 0 && (
            <div className="no-results">
              <Search size={45} />

              <h2>
                No results found
              </h2>

              <p>
                Try another creator or
                search term.
              </p>
            </div>
          )}

      </section>

      {/* MOBILE NAV */}

      <nav className="explore-mobile-nav">

        <a href="/">
          <Home size={23} />
        </a>

        <a href="/explore">
          <Compass size={23} />
        </a>

        <button
          onClick={() => {
            if (!user) {
              window.location.href =
                "/login";
            } else {
              window.location.href =
                "/";
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

    </main>
  );
}
