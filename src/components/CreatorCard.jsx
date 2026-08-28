import React from "react";
import "./CreatorCard.css";

export default function CreatorCard({ creator }) {
  return (
    <article className="creator-card">

      {/* Livestream image */}
      <div className="creator-image-wrap">

        <img
          src={creator.image}
          alt={`${creator.name} livestream`}
          className="creator-image"
          loading="lazy"
        />

        {/* LIVE indicator */}
        <div className="live-badge">
          <span className="live-dot"></span>
          {creator.status}
        </div>

        {/* Viewer count */}
        <div className="viewer-count">
          <span>👁</span>
          {creator.viewers.toLocaleString()}
        </div>

      </div>

      {/* Creator information */}
      <div className="creator-info">

        <div className="creator-name-row">
          <h3>{creator.name}</h3>
          <span className="country-flag">
            {creator.flag}
          </span>
        </div>

        <div className="creator-country">
          {creator.country}
        </div>

        <button
          className="watch-button"
          type="button"
        >
          Watch Live
        </button>

      </div>

    </article>
  );
}
