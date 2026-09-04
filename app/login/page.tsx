"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const API_URL = "https://dexfans-api.dwf6zb4bd6.workers.dev";

type User = {
  id: number;
  username: string;
  display_name: string;
  bio?: string;
  avatar_url?: string;
  email: string;
};

export default function LoginPage() {
  const router = useRouter();

  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const savedUser = localStorage.getItem("dexfans_user");

    if (savedUser) {
      router.push("/profile");
    }
  }, [router]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const endpoint =
        mode === "signup"
          ? `${API_URL}/api/auth/signup`
          : `${API_URL}/api/auth/login`;

      const body =
        mode === "signup"
          ? {
              email,
              username,
              password,
            }
          : {
              email,
              password,
            };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Something went wrong");
      }

      localStorage.setItem(
        "dexfans_user",
        JSON.stringify(data.user)
      );

      setSuccess(
        mode === "signup"
          ? "Account created successfully."
          : "Login successful."
      );

      setTimeout(() => {
        router.push("/profile");
      }, 500);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  }

  function switchMode(newMode: "login" | "signup") {
    setMode(newMode);
    setError("");
    setSuccess("");
    setPassword("");
  }

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center px-6">
      <div className="w-full max-w-md">

        {/* LOGO */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold tracking-tight">
            DexFans
          </h1>

          <p className="text-gray-400 mt-2">
            The creator platform
          </p>
        </div>

        {/* CARD */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-7 shadow-2xl">

          {/* TABS */}
          <div className="grid grid-cols-2 bg-zinc-800 rounded-xl p-1 mb-7">

            <button
              type="button"
              onClick={() => switchMode("login")}
              className={`py-3 rounded-lg font-medium transition ${
                mode === "login"
                  ? "bg-white text-black"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Login
            </button>

            <button
              type="button"
              onClick={() => switchMode("signup")}
              className={`py-3 rounded-lg font-medium transition ${
                mode === "signup"
                  ? "bg-white text-black"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Create Account
            </button>

          </div>

          <h2 className="text-2xl font-semibold mb-2">
            {mode === "login"
              ? "Welcome back"
              : "Create your account"}
          </h2>

          <p className="text-gray-400 mb-7">
            {mode === "login"
              ? "Log in to your DexFans account."
              : "Join DexFans and start building your profile."}
          </p>

          <form
            onSubmit={handleSubmit}
            className="space-y-4"
          >

            {/* EMAIL */}
            <div>
              <label className="block text-sm text-gray-300 mb-2">
                Email
              </label>

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                autoComplete="email"
                className="w-full bg-black border border-zinc-700 rounded-xl px-4 py-3 outline-none focus:border-white transition"
              />
            </div>

            {/* USERNAME */}
            {mode === "signup" && (
              <div>
                <label className="block text-sm text-gray-300 mb-2">
                  Username
                </label>

                <input
                  type="text"
                  value={username}
                  onChange={(e) =>
                    setUsername(
                      e.target.value
                        .toLowerCase()
                        .replace(/[^a-z0-9_]/g, "")
                    )
                  }
                  placeholder="yourusername"
                  required
                  minLength={3}
                  autoComplete="username"
                  className="w-full bg-black border border-zinc-700 rounded-xl px-4 py-3 outline-none focus:border-white transition"
                />
              </div>
            )}

            {/* PASSWORD */}
            <div>
              <label className="block text-sm text-gray-300 mb-2">
                Password
              </label>

              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 8 characters"
                required
                minLength={8}
                autoComplete={
                  mode === "login"
                    ? "current-password"
                    : "new-password"
                }
                className="w-full bg-black border border-zinc-700 rounded-xl px-4 py-3 outline-none focus:border-white transition"
              />
            </div>

            {/* ERROR */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl px-4 py-3 text-sm">
                {error}
              </div>
            )}

            {/* SUCCESS */}
            {success && (
              <div className="bg-green-500/10 border border-green-500/30 text-green-400 rounded-xl px-4 py-3 text-sm">
                {success}
              </div>
            )}

            {/* BUTTON */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white text-black font-semibold rounded-xl py-3.5 mt-2 hover:bg-gray-200 transition disabled:opacity-50"
            >
              {loading
                ? "Please wait..."
                : mode === "login"
                ? "Login"
                : "Create Account"}
            </button>

          </form>

          {/* SWITCH */}
          <div className="text-center mt-6 text-sm text-gray-400">

            {mode === "login" ? (
              <>
                Don't have an account?{" "}
                <button
                  type="button"
                  onClick={() => switchMode("signup")}
                  className="text-white font-medium hover:underline"
                >
                  Create one
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => switchMode("login")}
                  className="text-white font-medium hover:underline"
                >
                  Login
                </button>
              </>
            )}

          </div>

        </div>

        <p className="text-center text-gray-600 text-xs mt-6">
          © 2026 DexFans
        </p>

      </div>
    </main>
  );
}
