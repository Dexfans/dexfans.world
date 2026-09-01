"use client";

import {
  Search,
  Heart,
  MessageCircle,
  Play,
  ArrowLeft
} from "lucide-react";

import { useState } from "react";

const explorePosts = [
  {
    id: 1,
    image:
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=90",
    likes: "12.4K"
  },
  {
    id: 2,
    image:
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=800&q=90",
    likes: "8.2K"
  },
  {
    id: 3,
    image:
      "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=800&q=90",
    likes: "19.1K"
  },
  {
    id: 4,
    image:
      "https://images.unsplash.com/photo-1506629905607-d9c297d7e7c2?auto=format&fit=crop&w=800&q=90",
    likes: "6.8K"
  },
  {
    id: 5,
    image:
      "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=90",
    likes: "22.5K"
  },
  {
    id: 6,
    image:
      "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=800&q=90",
    likes: "4.9K"
  },
  {
    id: 7,
    image:
      "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=800&q=90",
    likes: "15.7K"
  },
  {
    id: 8,
    image:
      "https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?auto=format&fit=crop&w=800&q=90",
    likes: "9.3K"
  },
  {
    id: 9,
    image:
      "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=90",
    likes: "11.8K"
  },
  {
    id: 10,
    image:
      "https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=800&q=90",
    likes: "7.6K"
  },
  {
    id: 11,
    image:
      "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=800&q=90",
    likes: "14.2K"
  },
  {
    id: 12,
    image:
      "https://images.unsplash.com/photo-1485968579580-b6d095142e6e?auto=format&fit=crop&w=800&q=90",
    likes: "18.6K"
  }
];

export default function ExplorePage() {
  const [search, setSearch] = useState("");

  return (
    <main className="explore-page">

      <header className="explore-header">

        <a href="/" className="back-button">
          <ArrowLeft size={22} />
        </a>

        <div className="explore-search">

          <Search size={18} />

          <input
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            placeholder="Search creators..."
          />

        </div>

      </header>

      <section className="explore-title">

        <div>
          <h1>Explore</h1>
          <p>Discover creators on DexFans</p>
        </div>

      </section>

      <div className="category-row">

        <button className="category active">
          All
        </button>

        <button className="category">
          Trending
        </button>

        <button className="category">
          Creators
        </button>

        <button className="category">
          Videos
        </button>

        <button className="category">
          Live
        </button>

      </div>

      <section className="explore-grid">

        {explorePosts.map((post, index) => (

          <article
            className={`explore-card ${
              index === 4 || index === 7
                ? "large"
                : ""
            }`}
            key={post.id}
          >

            <img
              src={post.image}
              alt=""
            />

            <div className="explore-overlay">

              <div>
                <Heart
                  size={18}
                  fill="white"
                />

                <span>{post.likes}</span>
              </div>

              <div>
                <MessageCircle size={18} />

                <span>
                  {Math.floor(Math.random() * 500) + 20}
                </span>
              </div>

            </div>

            {index === 2 && (
              <div className="video-badge">
                <Play
                  size={15}
                  fill="white"
                />
              </div>
            )}

          </article>

        ))}

      </section>

    </main>
  );
}
