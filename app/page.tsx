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
  Video
} from "lucide-react";

import { useState } from "react";

const posts = [
  {
    id: 1,
    username: "luna",
    avatar: "https://i.pravatar.cc/150?img=47",
    image:
      "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1200&q=90",
    likes: "18,421",
    caption:
      "Welcome to my world ✨ New content dropping soon."
  },
  {
    id: 2,
    username: "maya",
    avatar: "https://i.pravatar.cc/150?img=32",
    image:
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=90",
    likes: "9,842",
    caption:
      "Good vibes only 🖤"
  },
  {
    id: 3,
    username: "aria",
    avatar: "https://i.pravatar.cc/150?img=44",
    image:
      "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1200&q=90",
    likes: "24,901",
    caption:
      "Who is ready for the weekend?"
  }
];

export default function HomePage() {
  const [liked, setLiked] = useState<number[]>([]);

  function toggleLike(id: number) {
    setLiked((current) =>
      current.includes(id)
        ? current.filter((x) => x !== id)
        : [...current, id]
    );
  }

  return (
    <main className="instagram-app">

      {/* DESKTOP SIDEBAR */}

      <aside className="sidebar">

        <div className="brand">
          <div className="brand-icon">D</div>
          <span>DexFans</span>
        </div>

        <nav>

          <a className="nav-item active" href="/">
            <Home size={24} />
            <span>Home</span>
          </a>

          <a className="nav-item" href="/explore">
            <Compass size={24} />
            <span>Explore</span>
          </a>

          <a className="nav-item" href="/login">
            <Video size={24} />
            <span>Live</span>
          </a>

          <a className="nav-item" href="/profile">
            <User size={24} />
            <span>Profile</span>
          </a>

        </nav>

        <button className="create-button">
          <Plus size={22} />
          Create
        </button>

      </aside>


      {/* MOBILE TOP BAR */}

      <header className="mobile-header">

        <div className="brand">
          <div className="brand-icon">D</div>
          <span>DexFans</span>
        </div>

        <Search size={23} />

      </header>


      {/* MAIN FEED */}

      <section className="feed">

        <div className="stories">

          <div className="story create-story">

            <div className="story-avatar create-avatar">
              <Plus size={20} />
            </div>

            <span>Your story</span>

          </div>

          {[
            ["luna", 47],
            ["maya", 32],
            ["aria", 44],
            ["sophie", 25],
            ["mia", 12],
            ["jade", 18]
          ].map(([name, img]) => (

            <div className="story" key={String(name)}>

              <div className="story-ring">

                <img
                  src={`https://i.pravatar.cc/150?img=${img}`}
                  alt=""
                />

              </div>

              <span>{name}</span>

            </div>

          ))}

        </div>


        {posts.map((post) => {

          const isLiked = liked.includes(post.id);

          return (

            <article className="post" key={post.id}>

              <header className="post-header">

                <a href="/profile" className="post-user">

                  <img
                    src={post.avatar}
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
                  •••
                </button>

              </header>


              <div className="post-image">

                <img
                  src={post.image}
                  alt=""
                />

              </div>


              <div className="post-actions">

                <div>

                  <button
                    onClick={() =>
                      toggleLike(post.id)
                    }
                    className={
                      isLiked
                        ? "action liked"
                        : "action"
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


              <div className="post-content">

                <strong>
                  {post.likes} likes
                </strong>

                <p>
                  <b>{post.username}</b>{" "}
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


      {/* RIGHT SIDE */}

      <aside className="right-panel">

        <div className="account">

          <img
            src="https://i.pravatar.cc/150?img=11"
            alt=""
          />

          <div>

            <strong>dexfans</strong>

            <span>DexFans.world</span>

          </div>

          <button>
            Switch
          </button>

        </div>

        <div className="suggestion-title">

          <span>Suggested for you</span>

          <b>See All</b>

        </div>

        {[
          ["nova", 36],
          ["bella", 21],
          ["ruby", 48],
          ["sky", 29],
          ["zoe", 39]
        ].map(([name, img]) => (

          <div className="suggestion" key={String(name)}>

            <img
              src={`https://i.pravatar.cc/150?img=${img}`}
              alt=""
            />

            <div>

              <strong>{name}</strong>

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

        <button>
          <Plus size={25} />
        </button>

        <a href="/login">
          <Video size={23} />
        </a>

        <a href="/profile">
          <User size={23} />
        </a>

      </nav>

    </main>
  );
}
