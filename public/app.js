const API = "";

let wallet = null;

const connectButton =
  document.getElementById("connectWallet");

const heroWallet =
  document.getElementById("heroWallet");

function showToast(message) {
  const toast =
    document.getElementById("toast");

  toast.textContent = message;

  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 3000);
}

function shortWallet(address) {
  if (!address) return "";

  return (
    address.slice(0, 4) +
    "..." +
    address.slice(-4)
  );
}

async function connectWallet() {

  if (!window.solana) {
    showToast(
      "Install Phantom or another Solana wallet."
    );

    return;
  }

  try {

    const response =
      await window.solana.connect();

    wallet =
      response.publicKey.toString();

    connectButton.textContent =
      shortWallet(wallet);

    heroWallet.textContent =
      shortWallet(wallet);

    await registerUser();

    showToast("Wallet connected");

  } catch (error) {

    console.error(error);

    showToast(
      "Wallet connection cancelled."
    );
  }
}

async function registerUser() {

  if (!wallet) return;

  await fetch(
    `${API}/api/users`,
    {
      method: "POST",

      headers: {
        "Content-Type":
          "application/json"
      },

      body: JSON.stringify({
        wallet
      })
    }
  );
}

connectButton.addEventListener(
  "click",
  connectWallet
);

heroWallet.addEventListener(
  "click",
  connectWallet
);

async function loadCreators() {

  const grid =
    document.getElementById(
      "creatorGrid"
    );

  try {

    const response =
      await fetch(
        `${API}/api/creators`
      );

    const creators =
      await response.json();

    if (!creators.length) {

      grid.innerHTML = `
        <div class="loading">
          No creators yet.
        </div>
      `;

      return;
    }

    grid.innerHTML =
      creators.map(
        creator => `
          <article class="creator-card">

            <div class="creator-image">

              ${
                creator.avatar
                  ? `
                    <img
                      src="${escapeHtml(
                        creator.avatar
                      )}"
                      alt=""
                    >
                  `
                  : ""
              }

            </div>

            <div class="creator-body">

              <h3>
                ${escapeHtml(
                  creator.display_name ||
                  creator.username ||
                  "Creator"
                )}
              </h3>

              <p>
                @${escapeHtml(
                  creator.username ||
                  "creator"
                )}
              </p>

              <div class="price">

                <span>
                  ${
                    Number(
                      creator.subscription_price_sol
                    ) > 0
                      ? `${creator.subscription_price_sol} SOL`
                      : `${creator.subscription_price_goji} GOJI`
                  }
                </span>

                <button
                  class="subscribe"
                  onclick="subscribeCreator(${creator.id})"
                >
                  Subscribe
                </button>

              </div>

            </div>

          </article>
        `
      ).join("");

  } catch (error) {

    console.error(error);

    grid.innerHTML = `
      <div class="loading">
        API unavailable.
      </div>
    `;
  }
}

function escapeHtml(value) {

  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

async function subscribeCreator(
  creatorId
) {

  if (!wallet) {
    await connectWallet();

    if (!wallet) return;
  }

  try {

    const response =
      await fetch(
        `${API}/api/creators`
      );

    const creators =
      await response.json();

    const creator =
      creators.find(
        item =>
          item.id === creatorId
      );

    if (!creator) {
      showToast(
        "Creator not found."
      );

      return;
    }

    let currency;
    let amount;

    if (
      Number(
        creator.subscription_price_sol
      ) > 0
    ) {

      currency = "SOL";

      amount =
        Number(
          creator.subscription_price_sol
        );

    } else {

      currency = "GOJI";

      amount =
        Number(
          creator.subscription_price_goji
        );
    }

    await payForSubscription(
      creatorId,
      currency,
      amount
    );

  } catch (error) {

    console.error(error);

    showToast(
      "Unable to start payment."
    );
  }
}

async function payForSubscription(
  creatorId,
  currency,
  amount
) {

  if (!window.solana) {
    showToast(
      "Solana wallet required."
    );

    return;
  }

  const configResponse =
    await fetch(
      `${API}/api/config`
    );

  const config =
    await configResponse.json();

  if (!config.treasury) {

    showToast(
      "Treasury wallet is not configured."
    );

    return;
  }

  const {
    PublicKey,
    Transaction,
    SystemProgram,
    LAMPORTS_PER_SOL,
    Connection
  } = solanaWeb3;

  const connection =
    new Connection(
      "https://api.mainnet-beta.solana.com",
      "confirmed"
    );

  const sender =
    new PublicKey(wallet);

  const treasury =
    new PublicKey(
      config.treasury
    );

  let transaction;

  if (currency === "SOL") {

    transaction =
      new Transaction();

    transaction.add(
      SystemProgram.transfer({
        fromPubkey: sender,
        toPubkey: treasury,
        lamports:
          Math.round(
            amount *
            LAMPORTS_PER_SOL
          )
      })
    );

  } else {

    showToast(
      "GOJI checkout module loading..."
    );

    await payGoji(
      creatorId,
      amount,
      config
    );

    return;
  }

  const latest =
    await connection.getLatestBlockhash(
      "confirmed"
    );

  transaction.recentBlockhash =
    latest.blockhash;

  transaction.feePayer =
    sender;

  const signed =
    await window.solana.signAndSendTransaction(
      transaction
    );

  showToast(
    "Transaction submitted. Verifying..."
  );

  await connection.confirmTransaction(
    {
      signature: signed.signature,
      blockhash: latest.blockhash,
      lastValidBlockHeight:
        latest.lastValidBlockHeight
    },
    "confirmed"
  );

  await verifyPayment(
    creatorId,
    null,
    "SOL",
    amount,
    signed.signature
  );
}

async function payGoji(
  creatorId,
  amount,
  config
) {

  if (!window.solana) {
    showToast(
      "Solana wallet required."
    );

    return;
  }

  showToast(
    "GOJI payment requires the SPL token module."
  );

  /*
    GOJIPOWER is an SPL token.

    The production version of this function
    should create:

    sender GOJI ATA
        ↓
    treasury GOJI ATA

    and sign the SPL transfer.

    The backend already verifies the
    resulting SPL transfer against the
    configured GOJIPOWER mint.
  */

  console.log({
    creatorId,
    amount,
    gojiMint:
      config.gojiMint
  });
}

async function verifyPayment(
  creatorId,
  postId,
  currency,
  amount,
  signature
) {

  const response =
    await fetch(
      `${API}/api/payments/verify`,
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json"
        },

        body: JSON.stringify({
          wallet,
          signature,
          currency,
          amount,
          creatorId,
          postId,
          type:
            postId
              ? "ppv"
              : "subscription"
        })
      }
    );

  const result =
    await response.json();

  if (!response.ok) {

    showToast(
      result.error ||
      "Payment verification failed."
    );

    return;
  }

  showToast(
    "Payment confirmed. Access unlocked."
  );
}

loadCreators();
