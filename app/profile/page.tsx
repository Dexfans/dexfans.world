"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const API =
  "https://dexfans-api.dwf6zb4bd.workers.dev";

type User = {
  id: number;
  username: string;
  display_name: string;
  bio?: string;
  avatar_url?: string;
  email?: string;
  posts_count?: number;
  followers_count?: number;
  following_count?: number;
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

export default function ProfilePage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [caption, setCaption] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const savedUser = localStorage.getItem("dexfans_user");

    if (!savedUser) {
      router.push("/login");
      return;
    }

    try {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      loadPosts(parsedUser.id);
    } catch {
      localStorage.removeItem("dexfans_user");
      router.push("/login");
    }
  }, [router]);

  async function loadPosts(userId: number) {
    try {
      const response = await fetch(
        `${API}/api/posts?user_id=${userId}`
      );

      if (!response.ok) {
        throw new Error("Could not load posts");
      }

      const data = await response.json();

      if (data.success) {
        setPosts(data.posts || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function createPost(e: FormEvent) {
    e.preventDefault();

    if (!user) return;

    setError("");

    if (!caption.trim() && !mediaUrl.trim()) {
      setError("Write something or add media.");
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
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not create post"
      );
    } finally {
      setPosting(false);
    }
  }

  function logout() {
    localStorage.removeItem("dexfans_user");
    router.push("/login");
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="text-gray-400">
          Loading profile...
        </p>
      </main>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <main className="min-h-screen bg-black text-white">

      {/* TOP BAR */}
      <header className="border-b border-zinc-800">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">

          <button
            onClick={() => router.push("/")}
            className="font-bold text-xl"
          >
            DexFans
          </button>

          <button
            onClick={logout}
            className="text-sm text-gray-400 hover:text-white"
          >
            Logout
          </button>

        </div>
      </header>

      {/* PROFILE */}
      <section className="max-w-3xl mx-auto px-6 pt-10">

        <div className="flex items-center gap-6">

          {/* AVATAR */}
          <div className="w-24 h-24 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-3xl font-bold">
            {user.avatar_url ? (
              <img
                src={user.avatar_url}
                alt={user.username}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              user.username
                .charAt(0)
                .toUpperCase()
            )}
          </div>

          {/* USER INFO */}
          <div className="flex-1">

            <div className="flex items-center gap-4">

              <h1 className="text-2xl font-semibold">
                {user.display_name ||
                  user.username}
              </h1>

              <button
                className="border border-zinc-700 rounded-lg px-4 py-2 text-sm hover:bg-zinc-900"
              >
                Edit Profile
              </button>

            </div>

            <p className="text-gray-400 mt-1">
              @{user.username}
            </p>

            <p className="text-gray-300 mt-3">
              {user.bio || "No bio yet."}
            </p>

          </div>

        </div>

        {/* STATS */}
        <div className="flex gap-8 mt-8 border-y border-zinc-800 py-5">

          <div>
            <strong>{posts.length}</strong>{" "}
            <span className="text-gray-400">
              Posts
            </span>
          </div>

          <div>
            <strong>
              {user.followers_count || 0}
            </strong>{" "}
            <span className="text-gray-400">
              Followers
            </span>
          </div>

          <div>
            <strong>
              {user.following_count || 0}
            </strong>{" "}
            <span className="text-gray-400">
              Following
            </span>
          </div>

        </div>

        {/* CREATE POST */}
        <section className="mt-8">

          <h2 className="text-lg font-semibold mb-4">
            Create a post
          </h2>

          <form
            onSubmit={createPost}
            className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5"
          >

            <textarea
              value={caption}
              onChange={(e) =>
                setCaption(e.target.value)
              }
              placeholder="What's happening?"
              rows={4}
              className="w-full bg-black border border-zinc-700 rounded-xl p-4 outline-none resize-none focus:border-white"
            />

            <input
              type="text"
              value={mediaUrl}
              onChange={(e) =>
                setMediaUrl(e.target.value)
              }
              placeholder="Media URL (optional)"
              className="w-full mt-3 bg-black border border-zinc-700 rounded-xl px-4 py-3 outline-none focus:border-white"
            />

            {error && (
              <div className="mt-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl px-4 py-3 text-sm">
                {error}
              </div>
            )}

            <div className="flex justify-end mt-4">

              <button
                type="submit"
                disabled={posting}
                className="bg-white text-black font-semibold rounded-xl px-6 py-3 hover:bg-gray-200 disabled:opacity-50"
              >
                {posting
                  ? "Posting..."
                  : "Post"}
              </button>

            </div>

          </form>

        </section>

        {/* POSTS */}
        <section className="mt-10 pb-20">

          <h2 className="text-lg font-semibold mb-5">
            Posts
          </h2>

          {posts.length === 0 ? (
            <div className="border border-zinc-800 rounded-2xl p-10 text-center text-gray-500">
              No posts yet.
            </div>
          ) : (
            <div className="space-y-5">

              {posts.map((post) => (
                <article
                  key={post.id}
                  className="border border-zinc-800 rounded-2xl overflow-hidden"
                >

                  {/* POST HEADER */}
                  <div className="p-4 flex items-center gap-3">

                    <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center font-semibold">

                      {post.avatar_url ? (
                        <img
                          src={post.avatar_url}
                          alt={post.username}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        post.username
                          .charAt(0)
                          .toUpperCase()
                      )}

                    </div>

                    <div>
                      <p className="font-medium">
                        {post.display_name ||
                          post.username}
                      </p>

                      <p className="text-xs text-gray-500">
                        @{post.username}
                      </p>
                    </div>

                  </div>

                  {/* MEDIA */}
                  {post.media_url && (
                    <img
                      src={post.media_url}
                      alt="Post media"
                      className="w-full max-h-[700px] object-cover"
                    />
                  )}

                  {/* CAPTION */}
                  {post.caption && (
                    <div className="p-5">
                      <p className="text-gray-200 whitespace-pre-wrap">
                        {post.caption}
                      </p>
                    </div>
                  )}

                </article>
              ))}

            </div>
          )}

        </section>

      </section>

    </main>
  );
}
