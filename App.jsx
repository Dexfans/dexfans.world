import React from "react";
import creators from "./data/creators";
import CreatorCard from "./components/CreatorCard";
import "./App.css";

export default function App() {
  return (
    <main className="dexfans-home">
      <section className="live-section">

        <header className="section-header">
          <div>
            <div className="brand">DEXFANS</div>
            <h1>Live Now</h1>
            <p>Creators streaming right now</p>
          </div>

          <div className="live-count">
            <span className="live-indicator"></span>
            {creators.length} Live
          </div>
        </header>

        <div className="creator-grid">
          {creators.map((creator) => (
            <CreatorCard
              key={creator.id}
              creator={creator}
            />
          ))}
        </div>

      </section>
    </main>
  );
}
