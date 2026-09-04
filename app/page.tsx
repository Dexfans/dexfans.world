"use client";

import {
  useEffect,
  useState,
  ChangeEvent,
} from "react";
import Link from "next/link";
import {
  Home,
  Search,
  Radio,
  User,
  PlusSquare,
  Heart,
  MessageCircle,
  Send,
  Bookmark,
  MoreHorizontal,
  X,
  Upload,
  Image as ImageIcon,
  Video,
} from "lucide-react";
import { apiFetch } from "@/lib/api";

type UserType = {
  id: number;
  username: string;
  display_name?: string;
  bio?: string;
  avatar_url?: string;
};

type Post = {
  id: number;
  user_id: number;
  username?: string;
  display_name?: string;
  avatar_url?: string;
  caption?: string;
  media_url?: string;
  created_at?: string;
  likes_count?: number;
  comments_count?: number;
};

const demoPosts: Post[] = [
  {
    id: 1,
    user_id: 1,
    username: "dexfans",
    display_name: "DexFans",
    caption: "Welcome to the new DexFans social experience.",
    media_url:
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200",
    likes_count: 128,
    comments_count: 12,
  },
  {
    id: 2,
    user_id: 2,
    username: "creator",
    display_name: "Creator",
    caption: "Building something new.",
    media_url:
      "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=1200",
    likes_count: 94,
    comments_count: 8,
  },
];

const demoStories = [
  {
    username: "your_story",
    label: "Your story",
    avatar:
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200",
  },
  {
    username: "dexfans",
    label: "DexFans",
    avatar:
      "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200",
  },
  {
    username: "creator",
    label: "Creator",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200",
  },
  {
    username: "artist",
    label: "Artist",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200",
  },
  {
    username: "model",
    label: "Model",
    avatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200",
  },
];

export default function HomePage() {
  const [user, setUser] = useState<UserType | null>(null);
  const [posts, setPosts] = useState<Post[]>(demoPosts);

  const [showCreate, setShowCreate] = useState(false);
  const [caption, setCaption] = useState("");
  const [selectedFile, setSelectedFile] =
    useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");

  const [uploading, setUploading] = useState(false);

  const [liked, setLiked] = useState<number[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(
        "dexfans_user"
      );

      if (stored) {
        setUser(JSON.parse(stored));
      }
    } catch {}

    loadPosts();
  }, []);

  async function loadPosts() {
    try {
      const data = await apiFetch<{
        success: boolean;
        posts: Post[];
      }>("/api/posts");

      if (data?.posts) {
        setPosts(data.posts);
      }
    } catch {
      setPosts(demoPosts);
    }
  }

  function openCreate() {
    setShowCreate(true);
    setCaption("");
    setSelectedFile(null);
    setPreviewUrl("");
  }

  function closeCreate() {
    if (uploading) return;

    setShowCreate(false);
    setCaption("");
    setSelectedFile(null);

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setPreviewUrl("");
  }

  function handleFileChange(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file) return;

    const allowed = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
      "video/mp4",
      "video/webm",
      "video/quicktime",
    ];

    if (!allowed.includes(file.type)) {
      alert(
        "Please choose a JPG, PNG, WEBP, GIF, MP4, WEBM or MOV file."
      );
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      alert("Maximum file size is 50MB.");
      return;
    }

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  }

  async function createPost() {
    if (!user?.id) {
      alert("Please log in first.");
      window.location.href = "/login";
      return;
    }

    if (!caption.trim() && !selectedFile) {
      alert("Add a photo, video or caption.");
      return;
    }

    setUploading(true);

    try {
      let mediaUrl = "";

      /*
       * Upload media to Cloudflare R2
       */

      if (selectedFile) {
        const formData = new FormData();

        formData.append(
          "file",
          selectedFile
        );

        const uploadResponse =
          await fetch(
            "https://dexfans-api.dwf6zb4bd.workers.dev/api/upload",
            {
              method: "POST",
              body: formData,
            }
          );

        if (!uploadResponse.ok) {
          throw new Error(
            "Media upload failed"
          );
        }

        const uploadData =
          await uploadResponse.json();

        if (
          !uploadData.success ||
          !uploadData.url
        ) {
          throw new Error(
            uploadData.error ||
              "Media upload failed"
          );
        }

        mediaUrl = uploadData.url;
      }

      /*
       * Create database post
       */

      const data =
        await apiFetch<{
          success: boolean;
          post: Post;
        }>("/api/posts", {
          method: "POST",
          body: JSON.stringify({
            userId: user.id,
            caption: caption.trim(),
            mediaUrl,
          }),
        });

      if (!data.success) {
        throw new Error(
          "Post creation failed"
        );
      }

      /*
       * Add the new post immediately
       */

      if (data.post) {
        setPosts((current) => [
          data.post,
          ...current,
        ]);
      }

      closeCreate();
    } catch (error) {
      console.error(error);

      alert(
        "Could not publish the post. Please try again."
      );
    } finally {
      setUploading(false);
    }
  }

  async function toggleLike(postId: number) {
    if (!user?.id) {
      window.location.href = "/login";
      return;
    }

    const currentlyLiked =
      liked.includes(postId);

    setLiked((current) =>
      currentlyLiked
        ? current.filter(
            (id) => id !== postId
          )
        : [...current, postId]
    );

    try {
      await apiFetch(
        `/api/posts/${postId}/like`,
        {
          method: "POST",
          body: JSON.stringify({
            userId: user.id,
          }),
        }
      );
    } catch {}
  }

  function formatDate(date?: string) {
    if (!date) return "";

    const d = new Date(date);

    if (Number.isNaN(d.getTime())) {
      return "";
    }

    return d.toLocaleDateString();
  }

  return (
    <main className="instagram-app">

      {/* SIDEBAR */}

      <aside className="instagram-sidebar">

        <Link
          href="/"
          className="instagram-logo"
        >
          DexFans
        </Link>

        <nav className="instagram-nav">

          <Link
            href="/"
            className="instagram-nav-item active"
          >
            <Home size={24} />
            <span>Home</span>
          </Link>

          <Link
            href="/explore"
            className="instagram-nav-item"
          >
            <Search size={24} />
            <span>Explore</span>
          </Link>

          <Link
            href="/live"
            className="instagram-nav-item"
          >
            <Radio size={24} />
            <span>Live</span>
          </Link>

          <button
            className="instagram-nav-item"
            onClick={openCreate}
          >
            <PlusSquare size={24} />
            <span>Create</span>
          </button>

          <Link
            href="/profile"
            className="instagram-nav-item"
          >
            <User size={24} />
            <span>Profile</span>
          </Link>

        </nav>

      </aside>


      {/* MOBILE HEADER */}

      <header className="mobile-topbar">

        <Link
          href="/"
          className="mobile-logo"
        >
          DexFans
        </Link>

        <button
          onClick={openCreate}
          className="mobile-create"
        >
          <PlusSquare size={23} />
        </button>

      </header>


      {/* MAIN */}

      <section className="instagram-main">

        {/* STORIES */}

        <div className="stories-container">

          {demoStories.map((story) => (
            <div
              className="story"
              key={story.username}
            >
              <div className="story-ring">

                <img
                  src={story.avatar}
                  alt=""
                />

              </div>

              <span>
                {story.label}
              </span>

            </div>
          ))}

        </div>


        {/* FEED */}

        <div className="feed">

          {posts.map((post) => {

            const isLiked =
              liked.includes(post.id);

            const isVideo =
              post.media_url &&
              /\.(mp4|webm|mov)(\?|$)/i.test(
                post.media_url
              );

            return (
              <article
                className="feed-post"
                key={post.id}
              >

                {/* POST HEADER */}

                <div className="feed-post-header">

                  <Link
                    href={`/profile/${
                      post.username ||
                      "creator"
                    }`}
                    className="post-user"
                  >

                    <div className="post-avatar">

                      {post.avatar_url ? (
                        <img
                          src={
                            post.avatar_url
                          }
                          alt=""
                        />
                      ) : (
                        <div className="avatar-placeholder">
                          {(post.display_name ||
                            post.username ||
                            "D")
                            .charAt(0)
                            .toUpperCase()}
                        </div>
                      )}

                    </div>

                    <div>
                      <strong>
                        {post.display_name ||
                          post.username ||
                          "Creator"}
                      </strong>

                      <span>
                        @
                        {post.username ||
                          "creator"}
                      </span>
                    </div>

                  </Link>

                  <button className="icon-button">
                    <MoreHorizontal size={22} />
                  </button>

                </div>


                {/* MEDIA */}

                {post.media_url && (
                  <div className="feed-media">

                    {isVideo ? (
                      <video
                        src={
                          post.media_url
                        }
                        controls
                        playsInline
                      />
                    ) : (
                      <img
                        src={
                          post.media_url
                        }
                        alt={
                          post.caption ||
                          "DexFans post"
                        }
                      />
                    )}

                  </div>
                )}


                {/* ACTIONS */}

                <div className="post-actions">

                  <div className="post-actions-left">

                    <button
                      className={
                        `icon-button ${
                          isLiked
                            ? "liked"
                            : ""
                        }`
                      }
                      onClick={() =>
                        toggleLike(
                          post.id
                        )
                      }
                    >
                      <Heart
                        size={25}
                        fill={
                          isLiked
                            ? "currentColor"
                            : "none"
                        }
                      />
                    </button>

                    <button className="icon-button">
                      <MessageCircle
                        size={24}
                      />
                    </button>

                    <button className="icon-button">
                      <Send size={24} />
                    </button>

                  </div>

                  <button className="icon-button">
                    <Bookmark size={24} />
                  </button>

                </div>


                {/* LIKES */}

                <div className="post-likes">

                  {Number(
                    post.likes_count || 0
                  ) +
                    (isLiked ? 1 : 0)}{" "}
                  likes

                </div>


                {/* CAPTION */}

                {post.caption && (
                  <div className="post-caption">

                    <strong>
                      {post.username ||
                        "creator"}
                    </strong>{" "}

                    {post.caption}

                  </div>
                )}


                {/* COMMENTS */}

                {Number(
                  post.comments_count || 0
                ) > 0 && (

                  <button className="view-comments">

                    View all{" "}
                    {post.comments_count}{" "}
                    comments

                  </button>

                )}

                <div className="post-date">

                  {formatDate(
                    post.created_at
                  )}

                </div>

              </article>
            );
          })}

        </div>

      </section>


      {/* RIGHT PANEL */}

      <aside className="instagram-right-panel">

        <div className="current-user">

          <div className="right-avatar">

            {user?.avatar_url ? (
              <img
                src={user.avatar_url}
                alt=""
              />
            ) : (
              <div className="avatar-placeholder">
                {(user?.display_name ||
                  user?.username ||
                  "D")
                  .charAt(0)
                  .toUpperCase()}
              </div>
            )}

          </div>

          <div className="right-user-info">

            <strong>
              {user?.username ||
                "dexfans369gmailcom"}
            </strong>

            <span>
              {user?.display_name ||
                "DexFans creator"}
            </span>

          </div>

          <Link
            href="/profile"
            className="switch-link"
          >
            Profile
          </Link>

        </div>


        <div className="suggestions-title">

          <span>Suggested for you</span>

          <button>
            See All
          </button>

        </div>


        {demoStories.slice(1).map(
          (story) => (

            <div
              className="suggestion"
              key={story.username}
            >

              <img
                src={story.avatar}
                alt=""
              />

              <div>

                <strong>
                  {story.username}
                </strong>

                <span>
                  Suggested for you
                </span>

              </div>

              <button>
                Follow
              </button>

            </div>

          )
        )}

      </aside>


      {/* MOBILE NAV */}

      <nav className="mobile-bottom-nav">

        <Link href="/">
          <Home size={23} />
        </Link>

        <Link href="/explore">
          <Search size={23} />
        </Link>

        <button onClick={openCreate}>
          <PlusSquare size={23} />
        </button>

        <Link href="/live">
          <Radio size={23} />
        </Link>

        <Link href="/profile">
          <User size={23} />
        </Link>

      </nav>


      {/* CREATE POST MODAL */}

      {showCreate && (

        <div className="create-overlay">

          <div className="create-modal">

            <div className="create-header">

              <strong>
                Create new post
              </strong>

              <button
                onClick={closeCreate}
                disabled={uploading}
              >
                <X size={22} />
              </button>

            </div>


            <div className="create-body">

              {!selectedFile ? (

                <label className="upload-dropzone">

                  <Upload size={48} />

                  <h3>
                    Drag photos and videos here
                  </h3>

                  <span>
                    or choose from your computer
                  </span>

                  <div className="choose-file-button">
                    Select from computer
                  </div>

                  <input
                    type="file"
                    accept="image/*,video/*"
                    onChange={
                      handleFileChange
                    }
                    hidden
                  />

                </label>

              ) : (

                <div className="selected-media">

                  {selectedFile.type.startsWith(
                    "video/"
                  ) ? (

                    <video
                      src={previewUrl}
                      controls
                      playsInline
                    />

                  ) : (

                    <img
                      src={previewUrl}
                      alt="Preview"
                    />

                  )}

                  <button
                    className="remove-media"
                    onClick={() => {
                      if (previewUrl) {
                        URL.revokeObjectURL(
                          previewUrl
                        );
                      }

                      setSelectedFile(null);
                      setPreviewUrl("");
                    }}
                    disabled={uploading}
                  >
                    <X size={18} />
                  </button>

                </div>

              )}


              <div className="create-caption">

                <textarea
                  placeholder="Write a caption..."
                  value={caption}
                  onChange={(e) =>
                    setCaption(
                      e.target.value
                    )
                  }
                  maxLength={2200}
                />

                <div className="caption-count">
                  {caption.length}/2200
                </div>

              </div>

            </div>


            <div className="create-footer">

              <div className="upload-info">

                {selectedFile ? (
                  <>
                    {selectedFile.type.startsWith(
                      "video/"
                    ) ? (
                      <Video size={18} />
                    ) : (
                      <ImageIcon size={18} />
                    )}

                    <span>
                      {selectedFile.name}
                    </span>
                  </>
                ) : (
                  <>
                    <ImageIcon size={18} />
                    <span>
                      Images & videos up to 50MB
                    </span>
                  </>
                )}

              </div>

              <button
                className="publish-button"
                onClick={createPost}
                disabled={
                  uploading ||
                  (!caption.trim() &&
                    !selectedFile)
                }
              >
                {uploading
                  ? "Uploading..."
                  : "Share"}
              </button>

            </div>

          </div>

        </div>

      )}

    </main>
  );
}
