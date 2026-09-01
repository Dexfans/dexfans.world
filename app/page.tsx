"use client";

import { useState } from "react";
import {
  Heart,
  MessageCircle,
  Send,
  Bookmark,
  Home,
  Search,
  Compass,
  Film,
  PlusSquare,
  User,
  Menu,
  MoreHorizontal,
  Play,
  Sparkles
} from "lucide-react";

const stories = [
  {
    name: "dexfans",
    image: "https://i.pravatar.cc/150?img=12"
  },
  {
    name: "luna",
    image: "https://i.pravatar.cc/150?img=47"
  },
  {
    name: "mia",
    image: "https://i.pravatar.cc/150?img=32"
  },
  {
    name: "sophie",
    image: "https://i.pravatar.cc/150?img=44"
  },
  {
    name: "ava",
    image: "https://i.pravatar.cc/150?img=49"
  },
  {
    name: "ruby",
    image: "https://i.pravatar.cc/150?img=25"
  },
  {
    name: "emily",
    image: "https://i.pravatar.cc/150?img=36"
  }
];

const posts = [
  {
    id: 1,
    user: "Luna",
    username: "luna",
    avatar: "https://i.pravatar.cc/150?img=47",
    image: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1200&q=90",
    caption: "Welcome to my world ✨",
    likes: 1824,
    comments: 92
  },
  {
    id: 2,
    user: "Mia",
    username: "mia",
    avatar: "https://i.pravatar.cc/150?img=32",
    image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=90",
    caption: "New content coming soon 🔥",
    likes: 941,
    comments: 41
  },
  {
    id: 3,
    user: "Sophie",
    username: "sophie",
    avatar: "https://i.pravatar.cc/150?img=44",
    image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=90",
    caption: "Sunday mood.",
    likes: 3210,
    comments: 177
  }
];

export default function HomePage() {
  const [liked, setLiked] = useState<number[]>([]);
  const [saved, setSaved] = useState<number[]>([]);
  const [active, setActive] = useState("Home");

  function toggleLike(id: number) {
    setLiked((current) =>
      current.includes(id)
        ? current.filter((x) => x !== id)
        : [...current, id]
    );
  }

  function toggleSave(id: number) {
    setSaved((current) =>
      current.includes(id)
        ? current.filter((x) => x !== id)
        : [...current, id]
    );
  }

  return (
    <div className="app">

      <aside className="desktop-sidebar">

        <div className="brand">
          <div className="brand-mark">D</div>
          <span>DexFans</span>
        </div>

        <nav>

          <NavItem
            icon={<Home size={25} />}
            text="Home"
            active={active === "Home"}
            onClick={() => setActive("Home")}
          />

          <NavItem
            icon={<Search size={25} />}
            text="Search"
            active={active === "Search"}
            onClick={() => setActive("Search")}
          />

          <NavItem
            icon={<Compass size={25} />}
            text="Explore"
            active={active === "Explore"}
            onClick={() => setActive("Explore")}
          />

          <NavItem
            icon={<Film size={25} />}
            text="Reels"
            active={active === "Reels"}
            onClick={() => setActive("Reels")}
          />

          <NavItem
            icon={<MessageCircle size={25} />}
            text="Messages"
            active={active === "Messages"}
            onClick={() => setActive("Messages")}
          />

          <NavItem
            icon={<Heart size={25} />}
            text="Notifications"
            active={active === "Notifications"}
            onClick={() => setActive("Notifications")}
          />

          <NavItem
            icon={<PlusSquare size={25} />}
            text="Create"
            active={active === "Create"}
            onClick={() => setActive("Create")}
          />

          <NavItem
            icon={<User size={25} />}
            text="Profile"
            active={active === "Profile"}
            onClick={() => setActive("Profile")}
          />

        </nav>

        <div className="sidebar-bottom">

          <div className="goji-card">
            <Sparkles size={18} />
            <div>
              <strong>GOJI POWER</strong>
              <small>Creator economy</small>
            </div>
          </div>

          <NavItem
            icon={<Menu size={25} />}
            text="More"
            active={false}
            onClick={() => {}}
          />

        </div>

      </aside>

      <header className="mobile-header">

        <div className="brand">
          <div className="brand-mark">D</div>
          <span>DexFans</span>
        </div>

        <div className="mobile-actions">
          <Heart size={24} />
          <MessageCircle size={24} />
        </div>

      </header>

      <main className="main">

        <section className="feed">

          <Stories />

          <div className="feed-header">
            <span>For you</span>
            <button>Following</button>
          </div>

          {posts.map((post) => (
            <article className="post" key={post.id}>

              <div className="post-header">

                <div className="post-user">

                  <img
                    src={post.avatar}
                    alt={post.username}
                  />

                  <div>
                    <strong>{post.username}</strong>
                    <small>Creator</small>
                  </div>

                </div>

                <MoreHorizontal size={22} />

              </div>

              <div className="post-image">

                <img
                  src={post.image}
                  alt=""
                />

                <button className="image-play">
                  <Play size={18} fill="white" />
                </button>

              </div>

              <div className="post-actions">

                <div className="left-actions">

                  <button onClick={() => toggleLike(post.id)}>
                    <Heart
                      size={25}
                      fill={
                        liked.includes(post.id)
                          ? "currentColor"
                          : "none"
                      }
                    />
                  </button>

                  <button>
                    <MessageCircle size={25} />
                  </button>

                  <button>
                    <Send size={25} />
                  </button>

                </div>

                <button onClick={() => toggleSave(post.id)}>
                  <Bookmark
                    size={25}
                    fill={
                      saved.includes(post.id)
                        ? "currentColor"
                        : "none"
                    }
                  />
                </button>

              </div>

              <div className="post-info">

                <strong>
                  {post.likes +
                    (liked.includes(post.id) ? 1 : 0)
                  } likes
                </strong>

                <p>
                  <b>{post.username}</b>{" "}
                  {post.caption}
                </p>

                <button className="comments">
                  View all {post.comments} comments
                </button>

                <div className="comment-box">
                  <input placeholder="Add a comment..." />
                  <button>Post</button>
                </div>

              </div>

            </article>
          ))}

        </section>

        <aside className="right-sidebar">

          <div className="my-profile">

            <img
              src="https://i.pravatar.cc/150?img=12"
              alt=""
            />

            <div>
              <strong>dexfans</strong>
              <span>DexFans World</span>
            </div>

            <button>Switch</button>

          </div>

          <div className="suggestion-header">
            <strong>Suggested for you</strong>
            <button>See All</button>
          </div>

          {stories.slice(1, 6).map((story) => (

            <div className="suggestion" key={story.name}>

              <img
                src={story.image}
                alt=""
              />

              <div>
                <strong>{story.name}</strong>
                <span>Suggested for you</span>
              </div>

              <button>Follow</button>

            </div>

          ))}

          <div className="footer-links">
            About · Help · Press · API · Jobs · Privacy ·
            Terms · Locations
          </div>

          <small className="copyright">
            © 2026 DEXFANS
          </small>

        </aside>

      </main>

      <nav className="mobile-nav">

        <Home size={24} />
        <Search size={24} />
        <PlusSquare size={24} />
        <Film size={24} />
        <User size={24} />

      </nav>

    </div>
  );
}

function NavItem({
  icon,
  text,
  active,
  onClick
}: {
  icon: React.ReactNode;
  text: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      className={`nav-item ${active ? "active" : ""}`}
      onClick={onClick}
    >
      {icon}
      <span>{text}</span>
    </button>
  );
}

function Stories() {
  return (
    <div className="stories">

      {stories.map((story, index) => (

        <div className="story" key={story.name}>

          <div className="story-ring">

            <img
              src={story.image}
              alt={story.name}
            />

            {index === 0 && (
              <div className="story-plus">+</div>
            )}

          </div>

          <span>{story.name}</span>

        </div>

      ))}

    </div>
  );
}