"use client";

import {
  ArrowLeft,
  Bell,
  Heart,
  MessageCircle,
  MoreHorizontal,
  UserPlus,
  Video,
  Grid3X3,
  Play,
  Lock,
} from "lucide-react";

import { useEffect, useState } from "react";

const API =
  "https://dexfans-api.dwf6zb4bd.workers.dev";

type Creator = {
  id: number;
  username: string;
  display_name: string;
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

const demoCreators: Record<
  string,
  Creator
> = {
  luna: {
    id: 1,
    username: "luna",
    display_name: "Luna",
    bio: "Creator ✨ | Welcome to my world",
    avatar_url:
      "https://i.pravatar.cc/500?img=47",
  },

  maya: {
    id: 2,
    username: "maya",
    display_name: "Maya",
    bio: "Good vibes only 🖤",
    avatar_url:
      "https://i.pravatar.cc/500?img=32",
  },

  aria: {
    id: 3,
    username: "aria",
    display_name: "Aria",
    bio: "New content every week ✨",
    avatar_url:
      "https://i.pravatar.cc/500?img=44",
  },

  sophie: {
    id: 4,
    username: "sophie",
    display_name: "Sophie",
    bio: "Living my best life",
    avatar_url:
      "https://i.pravatar.cc/500?img=25",
  },

  mia: {
    id: 5,
    username: "mia",
    display_name: "Mia",
    bio: "Creator & model",
    avatar_url:
      "https://i.pravatar.cc/500?img=12",
  },

  jade: {
    id: 6,
    username: "jade",
    display_name: "Jade",
    bio: "Say hello 💕",
    avatar_url:
      "https://i.pravatar.cc/500?img=18",
  },
};

const demoImages = [
  "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=900&q=90",
  "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=90",
  "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=900&q=90",
  "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=90",
  "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=90",
  "https://images.unsplash.com/photo-1496217590455-aa63a8350eea?auto=format&fit=crop&w=900&q=90",
];

export default function CreatorProfile({
  params,
}: {
  params: Promise<{
    username: string;
  }>;
}) {
  const [username, setUsername] =
    useState("");

  const [creator, setCreator] =
    useState<Creator | null>(null);

  const [posts, setPosts] =
    useState<Post[]>([]);

  const [following, setFollowing] =
    useState(false);

  const [loading, setLoading] =
    useState(true);

  const [selectedPost, setSelectedPost] =
    useState<Post | null>(null);

  useEffect(() => {
    params.then((value) => {
      setUsername(value.username);
      loadProfile(value.username);
    });
  }, [params]);

  async function loadProfile(
    name: string
  ) {
    const fallback =
      demoCreators[name.toLowerCase()] || {
        id: 99,
        username: name,
        display_name: name,
        bio: "DexFans creator",
        avatar_url: `https://i.pravatar.cc/500?u=${name}`,
      };

    setCreator(fallback);

    try {
      const response = await fetch(
        `${API}/api/users/${encodeURIComponent(
          name
        )}`
      );

      if (response.ok) {
        const data =
          await response.json();

        if (data.success && data.user) {
          setCreator(data.user);
        }
      }
    } catch {}

    try {
      const response = await fetch(
        `${API}/api/posts?username=${encodeURIComponent(
          name
        )}`
      );

      if (response.ok) {
        const data =
          await response.json();

        if (
          data.success &&
          Array.isArray(data.posts)
        ) {
          setPosts(data.posts);
        }
      }
    } catch {}

    setLoading(false);
  }

  function handleFollow() {
    setFollowing(!following);
  }

  if (loading) {
    return (
      <main className="creator-profile-loading">
        <div className="profile-spinner" />
      </main>
    );
  }

  if (!creator) {
    return (
      <main className="creator-not-found">
        <h1>User not found</h1>

        <a href="/">
          Return home
        </a>
      </main>
    );
  }

  const displayPosts =
    posts.length > 0
      ? posts
      : demoImages.map(
          (image, index) => ({
            id: index + 1,
            user_id: creator.id,
            username: creator.username,
            display_name:
              creator.display_name,
            caption:
              index === 0
                ? "Welcome to my world ✨"
                : "New content 💕",
            media_url: image,
            created_at:
              new Date().toISOString(),
          })
        );

  return (
    <main className="creator-profile-page">

      {/* TOP BAR */}

      <header className="creator-topbar">

        <button
          className="profile-back"
          onClick={() =>
            window.history.back()
          }
        >
          <ArrowLeft size={23} />
        </button>

        <strong>
          @{creator.username}
        </strong>

        <div className="profile-top-actions">
          <button>
            <Bell size={21} />
          </button>

          <button>
            <MoreHorizontal size={22} />
          </button>
        </div>

      </header>

      {/* PROFILE */}

      <section className="creator-header">

        <div className="creator-main">

          <div className="large-avatar">

            <img
              src={
                creator.avatar_url ||
                `https://i.pravatar.cc/500?u=${creator.username}`
              }
              alt=""
            />

          </div>

          <div className="creator-details">

            <div className="creator-name-row">

              <h1>
                {creator.display_name ||
                  creator.username}
              </h1>

              <span className="verified">
                ✓
              </span>

            </div>

            <p className="creator-username">
              @{creator.username}
            </p>

            <p className="creator-bio">
              {creator.bio ||
                "DexFans creator"}
            </p>

          </div>

        </div>

        {/* STATS */}

        <div className="profile-stats">

          <div>
            <strong>
              {displayPosts.length}
            </strong>

            <span>Posts</span>
          </div>

          <div>
            <strong>
              {following ? "1" : "0"}
            </strong>

            <span>Following</span>
          </div>

          <div>
            <strong>
              {following ? "1.2K" : "0"}
            </strong>

            <span>Followers</span>
          </div>

        </div>

        {/* ACTIONS */}

        <div className="profile-actions">

          <button
            className={
              following
                ? "following-button"
                : "follow-button"
            }
            onClick={handleFollow}
          >
            {following ? (
              <>
                <UserPlus size={17} />
                Following
              </>
            ) : (
              <>
                <UserPlus size={17} />
                Follow
              </>
            )}
          </button>

          <button
            className="message-button"
            onClick={() =>
              alert(
                "Messaging is coming next."
              )
            }
          >
            Message
          </button>

          <button
            className="live-button"
            onClick={() =>
              (window.location.href =
                "/live")
            }
          >
            <Video size={17} />
            Live
          </button>

        </div>

      </section>

      {/* CREATOR NAV */}

      <div className="creator-tabs">

        <button className="active">
          <Grid3X3 size={20} />
          Posts
        </button>

        <button>
          <Play size={20} />
          Reels
        </button>

        <button>
          <Lock size={19} />
          Exclusive
        </button>

      </div>

      {/* POSTS */}

      <section className="creator-post-grid">

        {displayPosts.map((post) => (

          <button
            key={post.id}
            className="creator-grid-post"
            onClick={() =>
              setSelectedPost(post)
            }
          >

            {post.media_url ? (
              <img
                src={post.media_url}
                alt=""
              />
            ) : (
              <div className="text-post">
                {post.caption}
              </div>
            )}

            <div className="grid-hover">

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

          </button>

        ))}

      </section>

      {/* POST MODAL */}

      {selectedPost && (

        <div
          className="profile-post-modal"
          onClick={() =>
            setSelectedPost(null)
          }
        >

          <div
            className="profile-post-window"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <button
              className="close-post"
              onClick={() =>
                setSelectedPost(null)
              }
            >
              ×
            </button>

            <div className="modal-post-image">

              {selectedPost.media_url ? (
                <img
                  src={
                    selectedPost.media_url
                  }
                  alt=""
                />
              ) : (
                <div className="modal-text-post">
                  {selectedPost.caption}
                </div>
              )}

            </div>

            <div className="modal-post-info">

              <div className="modal-post-user">

                <img
                  src={
                    creator.avatar_url ||
                    `https://i.pravatar.cc/100?u=${creator.username}`
                  }
                  alt=""
                />

                <strong>
                  @{creator.username}
                </strong>

              </div>

              <p>
                {selectedPost.caption}
              </p>

              <div className="modal-actions">

                <button>
                  <Heart size={25} />
                </button>

                <button>
                  <MessageCircle
                    size={25}
                  />
                </button>

              </div>

              <span className="modal-date">
                {new Date(
                  selectedPost.created_at
                ).toLocaleDateString()}
              </span>

            </div>

          </div>

        </div>

      )}

    </main>
  );
}
