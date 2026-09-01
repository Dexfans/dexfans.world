"use client";

import {
  ArrowLeft,
  Grid3X3,
  Film,
  Bookmark,
  Settings,
  MoreHorizontal
} from "lucide-react";

import { useState } from "react";

const gallery = [
  "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=800&q=90",
  "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=90",
  "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=800&q=90",
  "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=90",
  "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=800&q=90",
  "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=800&q=90"
];

export default function ProfilePage() {

  const [following, setFollowing] =
    useState(false);

  return (

    <main className="profile-page">

      <header className="profile-mobile-header">

        <a href="/">
          <ArrowLeft size={23} />
        </a>

        <strong>luna</strong>

        <MoreHorizontal size={23} />

      </header>

      <section className="profile-top">

        <div className="profile-avatar">

          <img
            src="https://i.pravatar.cc/300?img=47"
            alt="Luna"
          />

        </div>

        <div className="profile-information">

          <div className="profile-name-row">

            <h1>luna</h1>

            <button
              className={
                following
                  ? "follow-button following"
                  : "follow-button"
              }
              onClick={() =>
                setFollowing(!following)
              }
            >
              {following
                ? "Following"
                : "Follow"}
            </button>

            <button className="message-button">
              Message
            </button>

            <button className="settings-button">
              <Settings size={20} />
            </button>

          </div>

          <div className="profile-stats">

            <span>
              <b>246</b> posts
            </span>

            <span>
              <b>182K</b> followers
            </span>

            <span>
              <b>483</b> following
            </span>

          </div>

          <div className="profile-bio">

            <strong>Luna ✨</strong>

            <p>
              Creator · Digital personality
              <br />
              Welcome to my world.
              <br />
              New content every week 🔥
            </p>

          </div>

        </div>

      </section>

      <div className="profile-tabs">

        <button className="active">
          <Grid3X3 size={22} />
        </button>

        <button>
          <Film size={22} />
        </button>

        <button>
          <Bookmark size={22} />
        </button>

      </div>

      <section className="profile-gallery">

        {gallery.map((image, index) => (

          <div
            className="profile-gallery-item"
            key={index}
          >

            <img
              src={image}
              alt=""
            />

          </div>

        ))}

      </section>

    </main>
  );
}
