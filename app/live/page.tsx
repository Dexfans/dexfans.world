"use client";

import {
  Home,
  Compass,
  Video,
  User,
  Plus,
  Search,
  Radio,
  Users,
  Play,
  Heart,
} from "lucide-react";

import { useEffect, useState } from "react";

const API =
  "https://dexfans-api.dwf6zb4bd.workers.dev";

type Creator = {
  id: number;
  username: string;
  display_name: string;
  avatar_url?: string;
};

const liveCreators: Creator[] = [
  {
    id: 1,
    username: "luna",
    display_name: "Luna",
    avatar_url: "https://i.pravatar.cc/300?img=47",
  },
  {
    id: 2,
    username: "maya",
    display_name: "Maya",
    avatar_url: "https://i.pravatar.cc/300?img=32",
  },
  {
    id: 3,
    username: "aria",
    display_name: "Aria",
    avatar_url: "https://i.pravatar.cc/300?img=44",
  },
  {
    id: 4,
    username: "sophie",
    display_name: "Sophie",
    avatar_url: "https://i.pravatar.cc/300?img=25",
  },
  {
    id: 5,
    username: "mia",
    display_name: "Mia",
    avatar_url: "https://i.pravatar.cc/300?img=12",
  },
  {
    id: 6,
    username: "jade",
    display_name: "Jade",
    avatar_url: "https://i.pravatar.cc/300?img=18",
  },
];

export default function LivePage() {
  const [user, setUser] =
    useState<Creator | null>(null);

  const [creators, setCreators] =
    useState<Creator[]>(liveCreators);

  const [search, setSearch] = useState("");

  const [selected, setSelected] =
    useState<Creator | null>(null);

  useEffect(() => {
    const saved =
      localStorage.getItem("dexfans_user");

    if (saved) {
      try {
        setUser(JSON.parse(saved));
      } catch {}
    }

    loadCreators();
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
        data.creators.length > 0
      ) {
        setCreators(data.creators);
      }
    } catch {}
  }

  const filteredCreators =
    creators.filter((creator) => {
      const q =
        search.toLowerCase().trim();

      if (!q) return true;

      return (
        creator.username
          .toLowerCase()
          .includes(q) ||
        creator.display_name
          .toLowerCase()
          .includes(q)
      );
    });

  return (
    <main className="live-page">

      {/* SIDEBAR */}

      <aside className="live-sidebar">

        <a
          href="/"
          className="live-brand"
        >
          <div className="live-brand-icon">
            D
          </div>

          <span>DexFans</span>
        </a>

        <nav>

          <a
            href="/"
            className="live-nav-item"
          >
            <Home size={24} />
            <span>Home</span>
          </a>

          <a
            href="/explore"
            className="live-nav-item"
          >
            <Compass size={24} />
            <span>Explore</span>
          </a>

          <a
            href="/live"
            className="live-nav-item active"
          >
            <Video size={24} />
            <span>Live</span>
          </a>

          <a
            href="/profile"
            className="live-nav-item"
          >
            <User size={24} />
            <span>Profile</span>
          </a>

        </nav>

        <button
          className="live-create"
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

      <section className="live-main">

        <header className="live-header">

          <div>
            <div className="live-title">

              <Radio size={27} />

              <h1>Live</h1>

              <span>
                LIVE NOW
              </span>

            </div>

            <p>
              Watch creators streaming
              live on DexFans.
            </p>
          </div>

          <div className="live-search">

            <Search size={19} />

            <input
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Search live creators..."
            />

          </div>

        </header>

        {/* LIVE HERO */}

        <section className="live-hero">

          <div className="hero-video">

            <div className="hero-background">

              <img
                src={
                  filteredCreators[0]
                    ?.avatar_url ||
                  "https://i.pravatar.cc/1000?img=47"
                }
                alt=""
              />

            </div>

            <div className="hero-gradient" />

            <div className="live-badge">
              <span />
              LIVE
            </div>

            <div className="viewer-count">
              <Users size={16} />
              1.2K watching
            </div>

            <button
              className="hero-play"
              onClick={() =>
                setSelected(
                  filteredCreators[0] ||
                    liveCreators[0]
                )
              }
            >
              <Play
                size={30}
                fill="currentColor"
              />
            </button>

            <div className="hero-info">

              <div className="hero-user">

                <img
                  src={
                    filteredCreators[0]
                      ?.avatar_url ||
                    "https://i.pravatar.cc/300?img=47"
                  }
                  alt=""
                />

                <div>

                  <strong>
                    {filteredCreators[0]
                      ?.display_name ||
                      "Luna"}
                  </strong>

                  <span>
                    @{filteredCreators[0]
                      ?.username ||
                      "luna"}
                  </span>

                </div>

              </div>

              <h2>
                Live now on DexFans 🔥
              </h2>

              <p>
                Join the stream and
                interact with the creator.
              </p>

            </div>

          </div>

        </section>

        {/* LIVE CREATORS */}

        <section className="live-section">

          <div className="live-section-title">

            <div>
              <h2>
                Live creators
              </h2>

              <p>
                {filteredCreators.length} creators
                streaming
              </p>
            </div>

            <div className="live-dot">
              <span />
              Live
            </div>

          </div>

          <div className="live-grid">

            {filteredCreators.map(
              (creator, index) => (
                <article
                  key={creator.id}
                  className="live-card"
                  onClick={() =>
                    setSelected(creator)
                  }
                >

                  <div className="live-card-image">

                    <img
                      src={
                        creator.avatar_url ||
                        `https://i.pravatar.cc/500?u=${creator.username}`
                      }
                      alt=""
                    />

                    <div className="live-card-overlay" />

                    <div className="card-live">
                      <span />
                      LIVE
                    </div>

                    <div className="card-viewers">
                      <Users size={14} />
                      {[
                        "428",
                        "1.2K",
                        "836",
                        "294",
                        "672",
                        "1.8K",
                      ][index % 6]}
                    </div>

                    <button className="card-play">
                      <Play
                        size={21}
                        fill="currentColor"
                      />
                    </button>

                  </div>

                  <div className="live-card-info">

                    <div className="live-card-user">

                      <img
                        src={
                          creator.avatar_url ||
                          `https://i.pravatar.cc/100?u=${creator.username}`
                        }
                        alt=""
                      />

                      <div>

                        <strong>
                          {creator.display_name ||
                            creator.username}
                        </strong>

                        <span>
                          @{creator.username}
                        </span>

                      </div>

                    </div>

                    <button className="heart-button">
                      <Heart size={18} />
                    </button>

                  </div>

                </article>
              )
            )}

          </div>

        </section>

        {/* START STREAM */}

        <section className="start-stream">

          <div className="start-icon">
            <Video size={30} />
          </div>

          <div>
            <h2>
              Want to go live?
            </h2>

            <p>
              Start your own live stream
              and connect with your fans.
            </p>
          </div>

          <button
            onClick={() => {
              if (!user) {
                window.location.href =
                  "/login";
              } else {
                alert(
                  "Live streaming is coming next."
                );
              }
            }}
          >
            Go Live
          </button>

        </section>

      </section>

      {/* MOBILE NAV */}

      <nav className="live-mobile-nav">

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
              alert(
                "Create your next post from Home."
              );
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

      {/* STREAM MODAL */}

      {selected && (
        <div className="stream-modal">

          <div className="stream-window">

            <button
              className="stream-close"
              onClick={() =>
                setSelected(null)
              }
            >
              ×
            </button>

            <div className="stream-screen">

              <img
                src={
                  selected.avatar_url ||
                  "https://i.pravatar.cc/1000?img=47"
                }
                alt=""
              />

              <div className="stream-screen-overlay" />

              <div className="stream-live-label">
                <span />
                LIVE
              </div>

              <div className="stream-center">

                <Play
                  size={42}
                  fill="currentColor"
                />

                <h2>
                  {selected.display_name}
                </h2>

                <p>
                  Live streaming will be
                  connected here.
                </p>

              </div>

              <div className="stream-bottom">

                <div className="stream-user">

                  <img
                    src={
                      selected.avatar_url ||
                      "https://i.pravatar.cc/100?img=47"
                    }
                    alt=""
                  />

                  <strong>
                    @{selected.username}
                  </strong>

                </div>

                <button>
                  <Heart
                    size={22}
                    fill="currentColor"
                  />
                </button>

              </div>

            </div>

          </div>

        </div>
      )}

    </main>
  );
}
