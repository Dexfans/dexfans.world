"use client";

import {
  useEffect,
  useState,
  ChangeEvent,
} from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Settings,
  Grid3X3,
  Video,
  Bookmark,
  User,
  X,
  Upload,
  Image as ImageIcon,
} from "lucide-react";
import { apiFetch } from "@/lib/api";

type UserType = {
  id: number;
  username: string;
  display_name?: string;
  bio?: string;
  avatar_url?: string;
  email?: string;
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

export default function MyProfilePage() {
  const [user, setUser] =
    useState<UserType | null>(null);

  const [posts, setPosts] =
    useState<Post[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [showEdit, setShowEdit] =
    useState(false);

  const [displayName, setDisplayName] =
    useState("");

  const [bio, setBio] =
    useState("");

  const [avatarUrl, setAvatarUrl] =
    useState("");

  const [avatarFile, setAvatarFile] =
    useState<File | null>(null);

  const [avatarPreview, setAvatarPreview] =
    useState("");

  const [saving, setSaving] =
    useState(false);

  const [selectedPost, setSelectedPost] =
    useState<Post | null>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    try {
      const stored =
        localStorage.getItem(
          "dexfans_user"
        );

      if (!stored) {
        window.location.href = "/login";
        return;
      }

      const storedUser: UserType =
        JSON.parse(stored);

      setUser(storedUser);

      setDisplayName(
        storedUser.display_name || ""
      );

      setBio(storedUser.bio || "");

      setAvatarUrl(
        storedUser.avatar_url || ""
      );

      const data =
        await apiFetch<{
          success: boolean;
          user: UserType;
          posts: Post[];
        }>(
          `/api/users/${encodeURIComponent(
            storedUser.username
          )}`
        );

      if (data.user) {
        setUser(data.user);

        setDisplayName(
          data.user.display_name || ""
        );

        setBio(
          data.user.bio || ""
        );

        setAvatarUrl(
          data.user.avatar_url || ""
        );

        localStorage.setItem(
          "dexfans_user",
          JSON.stringify(data.user)
        );
      }

      setPosts(data.posts || []);
    } catch {
      try {
        const stored =
          localStorage.getItem(
            "dexfans_user"
          );

        if (stored) {
          const storedUser =
            JSON.parse(stored);

          const postData =
            await apiFetch<{
              success: boolean;
              posts: Post[];
            }>(
              `/api/posts?user_id=${storedUser.id}`
            );

          setPosts(
            postData.posts || []
          );
        }
      } catch {}
    } finally {
      setLoading(false);
    }
  }

  function openEdit() {
    setDisplayName(
      user?.display_name || ""
    );

    setBio(user?.bio || "");

    setAvatarUrl(
      user?.avatar_url || ""
    );

    setAvatarFile(null);
    setAvatarPreview("");

    setShowEdit(true);
  }

  function closeEdit() {
    if (saving) return;

    if (avatarPreview) {
      URL.revokeObjectURL(
        avatarPreview
      );
    }

    setAvatarPreview("");
    setAvatarFile(null);
    setShowEdit(false);
  }

  function handleAvatarChange(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const file =
      event.target.files?.[0];

    if (!file) return;

    const allowed = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
    ];

    if (!allowed.includes(file.type)) {
      alert(
        "Please choose a JPG, PNG, WEBP or GIF image."
      );
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert(
        "Profile pictures must be under 10MB."
      );
      return;
    }

    if (avatarPreview) {
      URL.revokeObjectURL(
        avatarPreview
      );
    }

    setAvatarFile(file);

    setAvatarPreview(
      URL.createObjectURL(file)
    );
  }

  async function uploadAvatar() {
    if (!avatarFile) {
      return avatarUrl;
    }

    const formData =
      new FormData();

    formData.append(
      "file",
      avatarFile
    );

    const response =
      await fetch(
        "https://dexfans-api.dwf6zb4bd.workers.dev/api/upload",
        {
          method: "POST",
          body: formData,
        }
      );

    if (!response.ok) {
      throw new Error(
        "Avatar upload failed"
      );
    }

    const data =
      await response.json();

    if (
      !data.success ||
      !data.url
    ) {
      throw new Error(
        data.error ||
          "Avatar upload failed"
      );
    }

    return data.url;
  }

  async function saveProfile() {
    if (!user) return;

    setSaving(true);

    try {
      /*
       * Upload new avatar to R2
       */

      const newAvatarUrl =
        await uploadAvatar();

      /*
       * Update profile in D1
       */

      const data =
        await apiFetch<{
          success: boolean;
          user: UserType;
        }>(
          `/api/users/${encodeURIComponent(
            user.username
          )}`,
          {
            method: "PUT",
            body: JSON.stringify({
              displayName:
                displayName.trim(),
              bio: bio.trim(),
              avatarUrl:
                newAvatarUrl || "",
            }),
          }
        );

      const updatedUser =
        data.user || {
          ...user,
          display_name:
            displayName.trim(),
          bio: bio.trim(),
          avatar_url:
            newAvatarUrl || "",
        };

      setUser(updatedUser);

      localStorage.setItem(
        "dexfans_user",
        JSON.stringify(
          updatedUser
        )
      );

      setAvatarUrl(
        updatedUser.avatar_url || ""
      );

      setAvatarFile(null);

      if (avatarPreview) {
        URL.revokeObjectURL(
          avatarPreview
        );
      }

      setAvatarPreview("");

      setShowEdit(false);
    } catch (error) {
      console.error(error);

      /*
       * Keep local profile usable even
       * if the API is temporarily unavailable.
       */

      const fallbackUser = {
        ...user,
        display_name:
          displayName.trim(),
        bio: bio.trim(),
        avatar_url:
          avatarFile
            ? avatarPreview
            : avatarUrl,
      };

      setUser(fallbackUser);

      localStorage.setItem(
        "dexfans_user",
        JSON.stringify(
          fallbackUser
        )
      );

      setShowEdit(false);

      alert(
        "Profile saved locally. The server update could not be completed."
      );
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
      <main className="profile-loading">
        Loading profile...
      </main>
    );
  }

  const avatar =
    avatarPreview ||
    user?.avatar_url ||
    "";

  return (
    <main className="my-profile-page">

      {/* TOP BAR */}

      <header className="profile-topbar">

        <Link
          href="/"
          className="profile-back"
        >
          <ArrowLeft size={22} />
        </Link>

        <strong>
          {user?.username ||
            "Profile"}
        </strong>

        <button
          className="profile-settings"
          onClick={openEdit}
        >
          <Settings size={22} />
        </button>

      </header>


      {/* PROFILE HEADER */}

      <section className="profile-header">

        <div className="profile-avatar-large">

          {avatar ? (
            <img
              src={avatar}
              alt={
                user?.username ||
                "Profile"
              }
            />
          ) : (
            <div className="avatar-placeholder large">
              {(
                user?.display_name ||
                user?.username ||
                "D"
              )
                .charAt(0)
                .toUpperCase()}
            </div>
          )}

        </div>


        <div className="profile-info">

          <div className="profile-name-row">

            <h1>
              {user?.display_name ||
                user?.username ||
                "DexFans User"}
            </h1>

            <button
              className="edit-profile-button"
              onClick={openEdit}
            >
              Edit profile
            </button>

            <button
              className="profile-settings-desktop"
              onClick={openEdit}
            >
              <Settings size={20} />
            </button>

          </div>


          <div className="profile-stats">

            <span>
              <strong>
                {posts.length}
              </strong>{" "}
              posts
            </span>

            <span>
              <strong>0</strong>{" "}
              followers
            </span>

            <span>
              <strong>0</strong>{" "}
              following
            </span>

          </div>


          <div className="profile-bio">

            <strong>
              @{user?.username}
            </strong>

            {user?.bio && (
              <p>
                {user.bio}
              </p>
            )}

          </div>

        </div>

      </section>


      {/* PROFILE ACTIONS */}

      <div className="profile-action-row">

        <button
          className="profile-action-button"
          onClick={openEdit}
        >
          Edit profile
        </button>

        <Link
          href="/live"
          className="profile-action-button"
        >
          Go Live
        </Link>

      </div>


      {/* CREATOR TOOLS */}

      <section className="creator-tools">

        <div className="creator-tools-header">

          <div>
            <span className="creator-tools-label">
              CREATOR TOOLS
            </span>

            <h2>
              Build your audience
            </h2>
          </div>

        </div>

        <div className="creator-tools-grid">

          <div className="creator-tool-card">
            <strong>
              Content
            </strong>
            <span>
              Manage your posts
            </span>
          </div>

          <div className="creator-tool-card">
            <strong>
              Live
            </strong>
            <span>
              Start a live stream
            </span>
          </div>

          <div className="creator-tool-card">
            <strong>
              Earnings
            </strong>
            <span>
              Coming soon
            </span>
          </div>

        </div>

      </section>


      {/* POSTS TABS */}

      <div className="profile-tabs">

        <button className="profile-tab active">
          <Grid3X3 size={18} />
          POSTS
        </button>

        <button className="profile-tab">
          <Video size={18} />
          LIVE
        </button>

        <button className="profile-tab">
          <Bookmark size={18} />
          SAVED
        </button>

      </div>


      {/* POST GRID */}

      <section className="profile-grid">

        {posts.length === 0 ? (

          <div className="empty-profile">

            <div className="empty-profile-icon">
              <Grid3X3 size={35} />
            </div>

            <h2>
              No posts yet
            </h2>

            <p>
              Your posts will appear here.
            </p>

            <Link
              href="/"
              className="empty-profile-button"
            >
              Create your first post
            </Link>

          </div>

        ) : (

          posts.map((post) => (

            <button
              key={post.id}
              className="profile-grid-item"
              onClick={() =>
                setSelectedPost(post)
              }
            >

              {post.media_url ? (

                <img
                  src={
                    post.media_url
                  }
                  alt={
                    post.caption ||
                    "Post"
                  }
                />

              ) : (

                <div className="grid-text-post">
                  {post.caption}
                </div>

              )}

            </button>

          ))

        )}

      </section>


      {/* LOGOUT */}

      <div className="profile-logout-area">

        <button
          onClick={logout}
          className="logout-button"
        >
          Log out
        </button>

      </div>


      {/* EDIT PROFILE MODAL */}

      {showEdit && (

        <div className="profile-modal-overlay">

          <div className="profile-edit-modal">

            <div className="profile-modal-header">

              <strong>
                Edit profile
              </strong>

              <button
                onClick={closeEdit}
                disabled={saving}
              >
                <X size={22} />
              </button>

            </div>


            {/* AVATAR */}

            <div className="avatar-upload-section">

              <div className="avatar-upload-preview">

                {avatarPreview ||
                avatarUrl ? (

                  <img
                    src={
                      avatarPreview ||
                      avatarUrl
                    }
                    alt="Avatar"
                  />

                ) : (

                  <div className="avatar-placeholder upload-avatar">
                    {(
                      user?.display_name ||
                      user?.username ||
                      "D"
                    )
                      .charAt(0)
                      .toUpperCase()}
                  </div>

                )}

              </div>


              <label className="avatar-upload-button">

                <Upload size={17} />

                <span>
                  Change profile photo
                </span>

                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={
                    handleAvatarChange
                  }
                  hidden
                />

              </label>

              {avatarFile && (
                <span className="avatar-file-name">
                  {avatarFile.name}
                </span>
              )}

            </div>


            {/* FORM */}

            <label className="profile-field">

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
                maxLength={80}
                placeholder="Your name"
              />

            </label>


            <label className="profile-field">

              <span>
                Username
              </span>

              <input
                value={
                  user?.username || ""
                }
                disabled
              />

            </label>


            <label className="profile-field">

              <span>
                Bio
              </span>

              <textarea
                value={bio}
                onChange={(e) =>
                  setBio(
                    e.target.value
                  )
                }
                maxLength={300}
                placeholder="Tell people about yourself..."
              />

            </label>


            <div className="profile-edit-actions">

              <button
                className="cancel-profile-button"
                onClick={closeEdit}
                disabled={saving}
              >
                Cancel
              </button>

              <button
                className="save-profile-button"
                onClick={saveProfile}
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : "Save changes"}
              </button>

            </div>

          </div>

        </div>

      )}


      {/* POST VIEWER */}

      {selectedPost && (

        <div
          className="post-viewer-overlay"
          onClick={() =>
            setSelectedPost(null)
          }
        >

          <div
            className="post-viewer"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <button
              className="post-viewer-close"
              onClick={() =>
                setSelectedPost(null)
              }
            >
              <X size={24} />
            </button>

            {selectedPost.media_url ? (
              <img
                src={
                  selectedPost.media_url
                }
                alt={
                  selectedPost.caption ||
                  "Post"
                }
              />
            ) : (
              <div className="post-viewer-text">
                {
                  selectedPost.caption
                }
              </div>
            )}

          </div>

        </div>

      )}


      {/* MOBILE NAV */}

      <nav className="mobile-bottom-nav profile-mobile-nav">

        <Link href="/">
          <Grid3X3 size={22} />
        </Link>

        <Link href="/explore">
          <User size={22} />
        </Link>

        <button onClick={openEdit}>
          <Settings size={22} />
        </button>

      </nav>

    </main>
  );
}
