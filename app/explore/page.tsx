"use client";

import Link from "next/link";

const creators = [
  {
    name: "luna",
    image: "https://i.pravatar.cc/500?img=47",
  },
  {
    name: "maya",
    image: "https://i.pravatar.cc/500?img=32",
  },
  {
    name: "aria",
    image: "https://i.pravatar.cc/500?img=44",
  },
  {
    name: "sophie",
    image: "https://i.pravatar.cc/500?img=25",
  },
  {
    name: "mia",
    image: "https://i.pravatar.cc/500?img=12",
  },
  {
    name: "jade",
    image: "https://i.pravatar.cc/500?img=18",
  },
];

export default function ExplorePage() {
  return (
    <main className="explore-page">

      <header className="explore-header">

        <Link href="/" className="explore-brand">
          <div className="brand-icon">D</div>
          <span>DexFans</span>
        </Link>

        <input
          className="search-box"
          placeholder="Search creators"
        />

        <Link href="/profile" className="explore-profile">
          Profile
        </Link>

      </header>

      <section className="explore-content">

        <div className="explore-title">
          <h1>Explore</h1>
          <p>Discover creators and communities.</p>
        </div>

        <div className="creator-grid">

          {creators.map((creator) => (
            <Link
              href="/profile"
              className="creator-card"
              key={creator.name}
            >
              <img
                src={creator.image}
                alt={creator.name}
              />

              <div className="creator-overlay">
                <strong>{creator.name}</strong>
                <span>Creator</span>
              </div>
            </Link>
          ))}

        </div>

      </section>

      <nav className="mobile-nav">
        <Link href="/">⌂</Link>
        <Link href="/explore">⌕</Link>
        <Link href="/login">＋</Link>
        <Link href="/profile">◯</Link>
      </nav>

    </main>
  );
}
