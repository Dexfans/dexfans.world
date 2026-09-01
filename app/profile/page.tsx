"use client";

import Link from "next/link";

export default function ProfilePage() {
  return (
    <main className="profile-page">

      <header className="profile-header">
        <Link href="/" className="back-home">
          ← DexFans
        </Link>

        <button className="profile-settings">
          ⚙
        </button>
      </header>

      <section className="profile-card">

        <div className="profile-avatar">
          D
        </div>

        <div className="profile-main">

          <div className="profile-name-row">
            <h1>dexfans</h1>
            <button className="edit-profile">
              Edit profile
            </button>
          </div>

          <div className="profile-stats">
            <div>
              <strong>0</strong>
              <span>Posts</span>
            </div>

            <div>
              <strong>0</strong>
              <span>Followers</span>
            </div>

            <div>
              <strong>0</strong>
              <span>Following</span>
            </div>
          </div>

          <p className="profile-bio">
            DexFans creator
            <br />
            The creator social platform built for Web3.
            <br />
            🌐 DexFans.world
          </p>

        </div>

      </section>

      <div className="profile-tabs">
        <button className="active">
          Posts
        </button>

        <button>
          Media
        </button>

        <button>
          Saved
        </button>
      </div>

      <section className="empty-profile">
        <div className="empty-icon">＋</div>
        <h2>Share your first post</h2>
        <p>
          Your posts will appear here.
        </p>
        <button className="primary-button">
          Create post
        </button>
      </section>

    </main>
  );
}
