import React, { useEffect, useState } from "react";
import { useConnector } from "@solana/connector/react";

function shortenAddress(address) {
  if (!address) return "";
  return `${address.slice(0, 5)}...${address.slice(-5)}`;
}

export default function App() {
  const {
    connectors,
    connectWallet,
    disconnectWallet,
    isConnected,
    isConnecting,
    account,
    connector,
    walletError
  } = useConnector();

  const [walletOpen, setWalletOpen] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => {
    if (!toast) return;

    const timer = setTimeout(() => {
      setToast("");
    }, 3500);

    return () => clearTimeout(timer);
  }, [toast]);

  function showToast(message) {
    setToast(message);
  }

  function openWallets() {
    if (isConnected) return;
    setWalletOpen(true);
  }

  function closeWallets() {
    if (!isConnecting) {
      setWalletOpen(false);
    }
  }

  async function handleConnect(connectorId) {
    try {
      setWalletOpen(false);

      await connectWallet(connectorId);

      showToast("Wallet connected");
    } catch (error) {
      console.error("Wallet connection error:", error);

      showToast(
        error?.message || "Could not connect to wallet."
      );
    }
  }

  async function handleDisconnect() {
    try {
      await disconnectWallet();

      showToast("Wallet disconnected");
    } catch (error) {
      console.error("Wallet disconnect error:", error);

      showToast(
        error?.message || "Could not disconnect wallet."
      );
    }
  }

  function scrollTo(id) {
    document
      .getElementById(id)
      ?.scrollIntoView({
        behavior: "smooth"
      });
  }

  return (
    <div className="app">

      {/* NAVIGATION */}

      <header className="navbar">

        <a href="/" className="brand">
          <span className="brandMark">
            D
          </span>

          <span>
            DexFans
          </span>
        </a>

        <nav className="navLinks">

          <button
            onClick={() => scrollTo("features")}
          >
            Features
          </button>

          <button
            onClick={() => scrollTo("payments")}
          >
            Payments
          </button>

          <button
            onClick={() => scrollTo("how")}
          >
            How it works
          </button>

        </nav>

        <div>

          {isConnected ? (

            <button
              className="walletButton connected"
              onClick={handleDisconnect}
            >

              <span className="onlineDot" />

              {shortenAddress(account)}

            </button>

          ) : (

            <button
              className="walletButton"
              onClick={openWallets}
              disabled={isConnecting}
            >
              {isConnecting
                ? "Connecting..."
                : "Connect Wallet"}
            </button>

          )}

        </div>

      </header>


      {/* HERO */}

      <main>

        <section className="hero">

          <div className="heroContent">

            <div className="eyebrow">

              <span className="statusDot" />

              BUILT ON SOLANA

            </div>

            <h1>

              Your creators.

              <span>
                Your world.
              </span>

            </h1>

            <p className="heroText">
              DexFans is a next-generation
              creator platform where fans
              connect directly with creators
              and pay using SOL or GOJIPOWER.
            </p>

            <div className="heroButtons">

              <button
                className="primaryButton"
                onClick={() => scrollTo("features")}
              >
                Explore DexFans
              </button>

              <button
                className="secondaryButton"
                onClick={openWallets}
              >
                {isConnected
                  ? shortenAddress(account)
                  : "Connect wallet"}
              </button>

            </div>

            <div className="paymentStrip">

              <span>
                PAY WITH
              </span>

              <span className="paymentItem">

                <span className="coinIcon">
                  ◎
                </span>

                SOL

              </span>

              <span>
                OR
              </span>

              <span className="paymentItem">

                <span className="coinIcon">
                  G
                </span>

                GOJIPOWER

              </span>

            </div>

          </div>


          {/* HERO CARD */}

          <div className="heroVisual">

            <div className="glow" />

            <div className="creatorCard">

              <div className="creatorImage">

                <span className="liveBadge">
                  ● LIVE
                </span>

                <div className="avatarShape" />

                <div className="bodyShape" />

              </div>

              <div className="creatorInfo">

                <div>

                  <div className="creatorName">

                    Creator

                    <span className="verified">
                      ✓
                    </span>

                  </div>

                  <div className="creatorHandle">
                    @creator
                  </div>

                </div>

                <div className="creatorPrice">

                  <strong>
                    0.25 SOL
                  </strong>

                  / month

                </div>

              </div>

            </div>

          </div>

        </section>


        {/* FEATURES */}

        <section
          className="section"
          id="features"
        >

          <div className="sectionLabel">
            THE PLATFORM
          </div>

          <h2>
            Built for creators.
          </h2>

          <div className="featureGrid">

            <article className="featureCard">

              <span className="number">
                01
              </span>

              <h3>
                Subscriptions
              </h3>

              <p>
                Creators set their own
                subscription prices and fans
                pay directly through Solana.
              </p>

            </article>


            <article className="featureCard">

              <span className="number">
                02
              </span>

              <h3>
                Premium Content
              </h3>

              <p>
                Publish free posts, subscriber
                content and pay-per-view
                content from one profile.
              </p>

            </article>


            <article className="featureCard">

              <span className="number">
                03
              </span>

              <h3>
                Direct Support
              </h3>

              <p>
                Fans can support creators
                directly using SOL or
                GOJIPOWER.
              </p>

            </article>

          </div>

        </section>


        {/* PAYMENTS */}

        <section
          className="section paymentSection"
          id="payments"
        >

          <div className="center">

            <div className="sectionLabel">
              CRYPTO PAYMENTS
            </div>

            <h2>
              Two currencies.
              <br />
              One ecosystem.
            </h2>

          </div>

          <div className="paymentGrid">

            <article className="paymentCard">

              <div className="bigCoin">
                ◎
              </div>

              <h3>
                SOL
              </h3>

              <p>
                Native Solana payments for
                subscriptions, premium
                content and creator tips.
              </p>

              <div className="network">
                SOLANA MAINNET
              </div>

            </article>


            <article className="paymentCard">

              <div className="bigCoin">
                G
              </div>

              <h3>
                GOJIPOWER
              </h3>

              <p>
                The native token powering
                the DexFans creator economy.
              </p>

              <div className="network">
                SPL TOKEN · SOLANA
              </div>

            </article>

          </div>

        </section>


        {/* HOW IT WORKS */}

        <section
          className="section"
          id="how"
        >

          <div className="sectionLabel">
            HOW IT WORKS
          </div>

          <h2>
            Connect.
            <br />
            Subscribe.
            <br />
            Unlock.
          </h2>

          <div className="featureGrid">

            <article className="featureCard">

              <span className="number">
                01
              </span>

              <h3>
                Connect
              </h3>

              <p>
                Connect Phantom, Solflare,
                Backpack or another compatible
                Solana wallet.
              </p>

            </article>


            <article className="featureCard">

              <span className="number">
                02
              </span>

              <h3>
                Pay
              </h3>

              <p>
                Select SOL or GOJIPOWER and
                approve the transaction in
                your wallet.
              </p>

            </article>


            <article className="featureCard">

              <span className="number">
                03
              </span>

              <h3>
                Unlock
              </h3>

              <p>
                DexFans verifies the blockchain
                transaction and unlocks your
                creator access.
              </p>

            </article>

          </div>

        </section>


        {/* CTA */}

        <section className="cta">

          <div className="sectionLabel">
            DEXFANS.WORLD
          </div>

          <h2>
            The creator economy
            is changing.
          </h2>

          <p>
            Connect directly. Pay on-chain.
            Own your relationship with the
            creators you support.
          </p>

          <button
            className="primaryButton"
            onClick={openWallets}
          >
            {isConnected
              ? shortenAddress(account)
              : "Connect wallet"}
          </button>

        </section>

      </main>


      {/* FOOTER */}

      <footer>

        <div className="footerBrand">
          DexFans.world
        </div>

        <div>
          Powered by Solana
        </div>

      </footer>


      {/* WALLET MODAL */}

      {walletOpen && (

        <div
          className="modalBackdrop"
          onClick={closeWallets}
        >

          <div
            className="walletModal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <div className="modalHeader">

              <div>

                <div className="modalTitle">
                  Connect wallet
                </div>

                <div className="modalSubtitle">
                  Choose a Solana wallet
                </div>

              </div>

              <button
                className="closeButton"
                onClick={closeWallets}
              >
                ×
              </button>

            </div>


            <div className="walletList">

              {connectors.length === 0 ? (

                <div className="emptyWallets">

                  <div className="emptyIcon">
                    ◎
                  </div>

                  <h3>
                    No wallets detected
                  </h3>

                  <p>
                    Open DexFans in a compatible
                    wallet browser or install a
                    Solana wallet such as Phantom.
                  </p>

                </div>

              ) : (

                connectors.map((item) => (

                  <button
                    className="walletOption"
                    key={item.id}
                    disabled={
                      isConnecting ||
                      !item.ready
                    }
                    onClick={() =>
                      handleConnect(item.id)
                    }
                  >

                    {item.icon ? (

                      <img
                        src={item.icon}
                        alt=""
                        className="walletIconImage"
                      />

                    ) : (

                      <span className="walletIcon">
                        ◎
                      </span>

                    )}

                    <span className="walletDetails">

                      <strong>
                        {item.name}
                      </strong>

                      <small>
                        {item.ready
                          ? "Available"
                          : "Not detected"}
                      </small>

                    </span>

                    <span className="walletArrow">
                      →
                    </span>

                  </button>

                ))

              )}

            </div>


            {walletError && (

              <div className="walletError">

                {walletError.message ||
                  "Wallet connection failed."}

              </div>

            )}


            <div className="modalFooter">
              Solana Mainnet
            </div>

          </div>

        </div>

      )}


      {/* TOAST */}

      {toast && (

        <div className="toast">
          {toast}
        </div>

      )}

    </div>
  );
}
