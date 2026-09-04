"use client";

import { useEffect, useState } from "react";
import {
  Search,
  Video,
  Users,
  X,
  Lock,
  Wallet,
  ArrowUpRight,
  Radio,
  Home,
  Compass,
  User,
  Plus,
  Play
} from "lucide-react";
import Link from "next/link";

type Creator = {
  id: number;
  username: string;
  displayName: string;
  bio?: string;
  avatarUrl?: string;
  country?: string;
  flag?: string;
  viewers?: number;
  title?: string;
  isLive?: boolean;
};

const demoCreators: Creator[] = [
  {
    id: 1,
    username: "creator_one",
    displayName: "Creator One",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=900",
    country: "United States",
    flag: "🇺🇸",
    viewers: 1248,
    title: "Late night live 🔥",
    isLive: true
  },
  {
    id: 2,
    username: "creator_two",
    displayName: "Creator Two",
    avatarUrl: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=900",
    country: "United Kingdom",
    flag: "🇬🇧",
    viewers: 823,
    title: "Come hang out ❤️",
    isLive: true
  },
  {
    id: 3,
    username: "creator_three",
    displayName: "Creator Three",
    avatarUrl: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=900",
    country: "Japan",
    flag: "🇯🇵",
    viewers: 547,
    title: "Tokyo night",
    isLive: true
  },
  {
    id: 4,
    username: "creator_four",
    displayName: "Creator Four",
    avatarUrl: "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=900",
    country: "Brazil",
    flag: "🇧🇷",
    viewers: 391,
    title: "Live from Rio",
    isLive: true
  },
  {
    id: 5,
    username: "creator_five",
    displayName: "Creator Five",
    avatarUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=900",
    country: "Canada",
    flag: "🇨🇦",
    viewers: 276,
    title: "Morning stream",
    isLive: true
  },
  {
    id: 6,
    username: "creator_six",
    displayName: "Creator Six",
    avatarUrl: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=900",
    country: "Thailand",
    flag: "🇹🇭",
    viewers: 184,
    title: "Bangkok live",
    isLive: true
  }
];

export default function LivePage() {
  const [creators, setCreators] = useState<Creator[]>([]);
  const [selectedCreator, setSelectedCreator] =
    useState<Creator | null>(null);
  const [search, setSearch] = useState("");
  const [unlocked, setUnlocked] = useState(false);

  useEffect(() => {
    async function loadCreators() {
      try {
        const response = await fetch(
          "https://dexfans-api.dwf6zb4bd.workers.dev/api/creators"
        );

        if (!response.ok) {
          throw new Error("Failed to load creators");
        }

        const data = await response.json();

        if (data?.creators?.length) {
          setCreators(
            data.creators.map((creator: any) => ({
              ...creator,
              country: creator.country || "Worldwide",
              flag: creator.flag || "🌎",
              viewers:
                typeof creator.viewers === "number"
                  ? creator.viewers
                  : Math.floor(Math.random() * 900) + 50,
              title:
                creator.title ||
                "Live now on DexFans",
              isLive:
                creator.isLive !== false
            }))
          );
        } else {
          setCreators(demoCreators);
        }
      } catch {
        setCreators(demoCreators);
      }
    }

    loadCreators();
  }, []);

  const filteredCreators = creators.filter((creator) => {
    const query = search.toLowerCase();

    return (
      creator.username.toLowerCase().includes(query) ||
      creator.displayName.toLowerCase().includes(query) ||
      creator.country?.toLowerCase().includes(query)
    );
  });

  function openCreator(creator: Creator) {
    setSelectedCreator(creator);
    setUnlocked(false);
  }

  function closeCreator() {
    setSelectedCreator(null);
    setUnlocked(false);
  }

  function unlockLive() {
    /*
      TEMPORARY:

      This currently unlocks the stream UI.

      Later we will replace this with:
      1. Phantom/Solana wallet connection
      2. GOJIPOWER balance check
      3. Optional GOJIPOWER tip transaction
      4. Cloudflare Stream playback unlock
    */

    setUnlocked(true);
  }

  return (
    <main className="live-page">
      {/* DESKTOP SIDEBAR */}

      <aside className="live-sidebar">
        <Link href="/" className="live-logo">
          DexFans
        </Link>

        <nav>
          <Link href="/">
            <Home size={22} />
            <span>Home</span>
          </Link>

          <Link href="/explore">
            <Compass size={22} />
            <span>Explore</span>
          </Link>

          <Link href="/live" className="active">
            <Radio size={22} />
            <span>Live</span>
          </Link>

          <Link href="/profile">
            <User size={22} />
            <span>Profile</span>
          </Link>

          <Link href="/?create=1">
            <Plus size={22} />
            <span>Create</span>
          </Link>
        </nav>
      </aside>

      {/* MAIN */}

      <section className="live-main">

        {/* HEADER */}

        <header className="live-header">
          <div>
            <div className="live-heading">
              <span className="live-red-dot" />
              <h1>Live</h1>
            </div>

            <p>
              Discover creators broadcasting live on DexFans.
            </p>
          </div>

          <div className="live-search">
            <Search size={18} />

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search creators or countries"
            />
          </div>
        </header>

        {/* LIVE HERO */}

        <section className="live-hero">
          <div className="live-hero-content">

            <div className="live-badge">
              <span />
              LIVE NOW
            </div>

            <h2>
              Watch creators live.
              <br />
              Support them with GOJIPOWER.
            </h2>

            <p>
              Join live broadcasts from creators around the world.
              Connect your wallet and use GOJIPOWER to support your
              favourite creators.
            </p>

            <button
              className="live-hero-button"
              onClick={() => {
                const first = creators.find(
                  (creator) => creator.isLive
                );

                if (first) {
                  openCreator(first);
                }
              }}
            >
              <Play size={18} fill="currentColor" />
              Watch Live
            </button>

          </div>

          <div className="live-hero-stat">
            <Users size={20} />
            <strong>
              {creators
                .reduce(
                  (total, creator) =>
                    total + (creator.viewers || 0),
                  0
                )
                .toLocaleString()}
            </strong>
            <span>watching now</span>
          </div>
        </section>

        {/* FILTERS */}

        <div className="live-filters">
          <button className="live-filter active">
            All
          </button>

          <button className="live-filter">
            🌎 Worldwide
          </button>

          <button className="live-filter">
            🇺🇸 USA
          </button>

          <button className="live-filter">
            🇬🇧 UK
          </button>

          <button className="live-filter">
            🇯🇵 Japan
          </button>

          <button className="live-filter">
            🇹🇭 Thailand
          </button>
        </div>

        {/* STREAM GRID */}

        <section className="live-section">

          <div className="live-section-title">
            <h2>Live creators</h2>

            <span>
              {filteredCreators.length} broadcasting
            </span>
          </div>

          <div className="live-grid">

            {filteredCreators.map((creator) => (

              <button
                key={creator.id}
                className="live-card"
                onClick={() => openCreator(creator)}
              >

                <div className="live-card-image">

                  <img
                    src={
                      creator.avatarUrl ||
                      "/placeholder-avatar.png"
                    }
                    alt={creator.displayName}
                  />

                  <div className="live-card-top">

                    <span className="live-card-live">
                      <span />
                      LIVE
                    </span>

                    <span className="live-card-viewers">
                      <Users size={13} />
                      {(
                        creator.viewers || 0
                      ).toLocaleString()}
                    </span>

                  </div>

                  <div className="live-card-bottom">

                    <span className="goji-lock">
                      <Lock size={12} />
                      GOJIPOWER
                    </span>

                  </div>

                  <div className="live-play">
                    <Play
                      size={24}
                      fill="currentColor"
                    />
                  </div>

                </div>

                <div className="live-card-info">

                  <div className="live-card-name">

                    <div className="live-avatar-small">
                      <img
                        src={
                          creator.avatarUrl ||
                          "/placeholder-avatar.png"
                        }
                        alt=""
                      />
                    </div>

                    <div>

                      <strong>
                        {creator.displayName}
                      </strong>

                      <span>
                        @{creator.username}
                      </span>

                    </div>

                  </div>

                  <p className="live-card-title">
                    {creator.title}
                  </p>

                  <div className="live-card-country">
                    <span>
                      {creator.flag || "🌎"}
                    </span>

                    <span>
                      {creator.country || "Worldwide"}
                    </span>
                  </div>

                </div>

              </button>

            ))}

          </div>

        </section>

        {/* MOBILE NAV */}

        <nav className="live-mobile-nav">

          <Link href="/">
            <Home size={22} />
            <span>Home</span>
          </Link>

          <Link href="/explore">
            <Compass size={22} />
            <span>Explore</span>
          </Link>

          <Link href="/live" className="active">
            <Radio size={24} />
            <span>Live</span>
          </Link>

          <Link href="/profile">
            <User size={22} />
            <span>Profile</span>
          </Link>

        </nav>

      </section>

      {/* LIVE MODAL */}

      {selectedCreator && (

        <div
          className="live-modal-overlay"
          onClick={closeCreator}
        >

          <div
            className="live-modal"
            onClick={(e) => e.stopPropagation()}
          >

            <button
              className="live-modal-close"
              onClick={closeCreator}
            >
              <X size={22} />
            </button>

            {!unlocked ? (

              <div className="live-unlock">

                <div className="live-unlock-image">

                  <img
                    src={
                      selectedCreator.avatarUrl ||
                      "/placeholder-avatar.png"
                    }
                    alt={selectedCreator.displayName}
                  />

                  <div className="live-unlock-overlay">
                    <Lock size={32} />
                  </div>

                </div>

                <div className="live-unlock-content">

                  <div className="live-modal-live">
                    <span />
                    LIVE NOW
                  </div>

                  <h2>
                    {selectedCreator.displayName}
                  </h2>

                  <p className="live-modal-username">
                    @{selectedCreator.username}
                  </p>

                  <div className="live-modal-country">
                    {selectedCreator.flag || "🌎"}
                    {selectedCreator.country ||
                      "Worldwide"}
                  </div>

                  <div className="goji-required">

                    <div className="goji-required-icon">
                      <Lock size={20} />
                    </div>

                    <div>

                      <strong>
                        GOJIPOWER required
                      </strong>

                      <p>
                        Connect your wallet and use
                        GOJIPOWER to support this creator
                        before watching the stream.
                      </p>

                    </div>

                  </div>

                  <button
                    className="connect-wallet-button"
                    onClick={unlockLive}
                  >
                    <Wallet size={19} />
                    Connect Wallet
                    <ArrowUpRight size={17} />
                  </button>

                  <button
                    className="get-goji-button"
                    onClick={() => {
                      window.open(
                        "https://dexfans.world",
                        "_blank"
                      );
                    }}
                  >
                    Get GOJIPOWER
                  </button>

                  <small>
                    You will be able to connect a Solana
                    wallet and tip with GOJIPOWER.
                  </small>

                </div>

              </div>

            ) : (

              <div className="live-player">

                <div className="live-player-header">

                  <div>

                    <div className="live-modal-live">
                      <span />
                      LIVE
                    </div>

                    <strong>
                      {selectedCreator.displayName}
                    </strong>

                  </div>

                  <div className="live-player-viewers">
                    <Users size={15} />
                    {(
                      selectedCreator.viewers || 0
                    ).toLocaleString()}
                  </div>

                </div>

                {/* CLOUDflare STREAM PLAYER WILL GO HERE */}

                <div className="live-player-placeholder">

                  <Radio size={52} />

                  <h2>
                    Live stream unlocked
                  </h2>

                  <p>
                    Cloudflare Stream playback will
                    appear here.
                  </p>

                </div>

                <div className="live-player-footer">

                  <div>
                    <strong>
                      {selectedCreator.title}
                    </strong>

                    <span>
                      {selectedCreator.flag || "🌎"}{" "}
                      {selectedCreator.country ||
                        "Worldwide"}
                    </span>
                  </div>

                  <button>
                    <Wallet size={17} />
                    Tip GOJIPOWER
                  </button>

                </div>

              </div>

            )}

          </div>

        </div>

      )}

    </main>
  );
}
