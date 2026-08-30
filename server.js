import "dotenv/config";

import express from "express";
import cors from "cors";
import Database from "better-sqlite3";

import {
  Connection,
  PublicKey,
  LAMPORTS_PER_SOL
} from "@solana/web3.js";

import {
  getAssociatedTokenAddressSync,
  TOKEN_PROGRAM_ID
} from "@solana/spl-token";

const app = express();

const PORT = Number(process.env.PORT || 3000);

const RPC_URL =
  process.env.SOLANA_RPC_URL ||
  "https://api.mainnet-beta.solana.com";

const TREASURY =
  process.env.DEXFANS_TREASURY_WALLET || "";

const GOJI_MINT =
  process.env.GOJIPOWER_MINT ||
  "DYCLLejhtfyCDUY8ygBx7Y7uwfcdaRzLo7nHHVGdApump";

const PLATFORM_FEE =
  Number(process.env.PLATFORM_FEE_PERCENT || 5);

const DATABASE_FILE =
  process.env.DATABASE_FILE || "./dexfans.db";

const connection = new Connection(
  RPC_URL,
  "confirmed"
);

app.use(
  cors({
    origin: true,
    credentials: true
  })
);

app.use(express.json());

app.use(express.static("public"));

const db = new Database(DATABASE_FILE);

db.pragma("journal_mode = WAL");

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    wallet TEXT UNIQUE NOT NULL,
    username TEXT UNIQUE,
    display_name TEXT,
    bio TEXT DEFAULT '',
    avatar TEXT DEFAULT '',
    banner TEXT DEFAULT '',
    role TEXT DEFAULT 'fan',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS creators (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER UNIQUE NOT NULL,
    subscription_price_sol REAL DEFAULT 0,
    subscription_price_goji REAL DEFAULT 0,
    verified INTEGER DEFAULT 0,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    creator_id INTEGER NOT NULL,
    text TEXT DEFAULT '',
    media_url TEXT DEFAULT '',
    media_type TEXT DEFAULT 'image',
    price_sol REAL DEFAULT 0,
    price_goji REAL DEFAULT 0,
    is_ppv INTEGER DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(creator_id) REFERENCES creators(id)
  );

  CREATE TABLE IF NOT EXISTS subscriptions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    fan_wallet TEXT NOT NULL,
    creator_id INTEGER NOT NULL,
    payment_id INTEGER,
    expires_at TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(fan_wallet, creator_id)
  );

  CREATE TABLE IF NOT EXISTS payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    wallet TEXT NOT NULL,
    creator_id INTEGER,
    post_id INTEGER,
    type TEXT NOT NULL,
    currency TEXT NOT NULL,
    amount REAL NOT NULL,
    signature TEXT UNIQUE NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS tips (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    fan_wallet TEXT NOT NULL,
    creator_id INTEGER NOT NULL,
    currency TEXT NOT NULL,
    amount REAL NOT NULL,
    signature TEXT UNIQUE NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );
`);

function isValidPublicKey(value) {
  try {
    new PublicKey(value);
    return true;
  } catch {
    return false;
  }
}

function getCreatorById(id) {
  return db.prepare(`
    SELECT
      c.*,
      u.wallet,
      u.username,
      u.display_name,
      u.bio,
      u.avatar,
      u.banner
    FROM creators c
    JOIN users u ON u.id = c.user_id
    WHERE c.id = ?
  `).get(id);
}

function getCreatorByUsername(username) {
  return db.prepare(`
    SELECT
      c.*,
      u.wallet,
      u.username,
      u.display_name,
      u.bio,
      u.avatar,
      u.banner
    FROM creators c
    JOIN users u ON u.id = c.user_id
    WHERE u.username = ?
  `).get(username);
}

function getMintDecimals(mint) {
  return connection
    .getParsedAccountInfo(new PublicKey(mint))
    .then((result) => {
      const value = result.value;

      if (!value) {
        throw new Error("Token mint not found");
      }

      return value.data.parsed.info.decimals;
    });
}

async function verifySolPayment(
  signature,
  expectedSender,
  expectedAmount
) {
  const tx = await connection.getParsedTransaction(
    signature,
    {
      commitment: "confirmed",
      maxSupportedTransactionVersion: 0
    }
  );

  if (!tx) {
    return {
      valid: false,
      reason: "Transaction not found or not confirmed"
    };
  }

  if (tx.meta?.err) {
    return {
      valid: false,
      reason: "Transaction failed"
    };
  }

  const treasury = new PublicKey(TREASURY);

  const sender = new PublicKey(expectedSender);

  let amountReceived = 0;

  for (const instruction of tx.transaction.message.instructions) {
    if (
      instruction.program === "system" &&
      instruction.parsed?.type === "transfer"
    ) {
      const info = instruction.parsed.info;

      if (
        info.destination === treasury.toBase58() &&
        info.source === sender.toBase58()
      ) {
        amountReceived +=
          Number(info.lamports) / LAMPORTS_PER_SOL;
      }
    }
  }

  return {
    valid: amountReceived + 0.000000001 >= Number(expectedAmount),
    received: amountReceived,
    expected: Number(expectedAmount)
  };
}

async function verifyGojiPayment(
  signature,
  expectedSender,
  expectedAmount
) {
  const tx = await connection.getParsedTransaction(
    signature,
    {
      commitment: "confirmed",
      maxSupportedTransactionVersion: 0
    }
  );

  if (!tx) {
    return {
      valid: false,
      reason: "Transaction not found or not confirmed"
    };
  }

  if (tx.meta?.err) {
    return {
      valid: false,
      reason: "Transaction failed"
    };
  }

  const sender = new PublicKey(expectedSender);
  const treasury = new PublicKey(TREASURY);
  const mint = new PublicKey(GOJI_MINT);

  const treasuryATA =
    getAssociatedTokenAddressSync(
      mint,
      treasury,
      false,
      TOKEN_PROGRAM_ID
    );

  const senderATA =
    getAssociatedTokenAddressSync(
      mint,
      sender,
      false,
      TOKEN_PROGRAM_ID
    );

  const decimals = await getMintDecimals(GOJI_MINT);

  let received = 0;

  for (const instruction of tx.transaction.message.instructions) {
    if (
      instruction.program === "spl-token" &&
      instruction.parsed?.type === "transfer"
    ) {
      const info = instruction.parsed.info;

      if (
        info.mint === mint.toBase58() &&
        info.source === senderATA.toBase58() &&
        info.destination === treasuryATA.toBase58()
      ) {
        received +=
          Number(info.tokenAmount?.amount || 0) /
          Math.pow(10, decimals);
      }
    }
  }

  return {
    valid: received + 0.000001 >= Number(expectedAmount),
    received,
    expected: Number(expectedAmount)
  };
}

app.get("/api/config", (req, res) => {
  res.json({
    network: "mainnet-beta",
    treasury: TREASURY,
    gojiMint: GOJI_MINT,
    platformFeePercent: PLATFORM_FEE
  });
});

app.get("/api/creators", (req, res) => {
  const creators = db.prepare(`
    SELECT
      c.id,
      c.subscription_price_sol,
      c.subscription_price_goji,
      c.verified,
      u.username,
      u.display_name,
      u.bio,
      u.avatar,
      u.banner
    FROM creators c
    JOIN users u ON u.id = c.user_id
    ORDER BY c.id DESC
  `).all();

  res.json(creators);
});

app.get("/api/creators/:username", (req, res) => {
  const creator =
    getCreatorByUsername(req.params.username);

  if (!creator) {
    return res.status(404).json({
      error: "Creator not found"
    });
  }

  const posts = db.prepare(`
    SELECT
      id,
      text,
      media_url,
      media_type,
      price_sol,
      price_goji,
      is_ppv,
      created_at
    FROM posts
    WHERE creator_id = ?
    ORDER BY created_at DESC
  `).all(creator.id);

  res.json({
    creator,
    posts
  });
});

app.post("/api/users", (req, res) => {
  const {
    wallet,
    username,
    displayName,
    bio = "",
    avatar = "",
    banner = "",
    role = "fan"
  } = req.body;

  if (!wallet || !isValidPublicKey(wallet)) {
    return res.status(400).json({
      error: "Valid Solana wallet required"
    });
  }

  try {
    const existing = db.prepare(`
      SELECT * FROM users WHERE wallet = ?
    `).get(wallet);

    if (existing) {
      return res.json(existing);
    }

    const result = db.prepare(`
      INSERT INTO users
      (
        wallet,
        username,
        display_name,
        bio,
        avatar,
        banner,
        role
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      wallet,
      username || null,
      displayName || null,
      bio,
      avatar,
      banner,
      role
    );

    const user = db.prepare(`
      SELECT * FROM users WHERE id = ?
    `).get(result.lastInsertRowid);

    res.json(user);
  } catch (error) {
    res.status(400).json({
      error: error.message
    });
  }
});

app.post("/api/creators", (req, res) => {
  const {
    wallet,
    username,
    displayName,
    bio = "",
    avatar = "",
    banner = "",
    subscriptionPriceSol = 0,
    subscriptionPriceGoji = 0
  } = req.body;

  if (!wallet || !isValidPublicKey(wallet)) {
    return res.status(400).json({
      error: "Valid wallet required"
    });
  }

  let user = db.prepare(`
    SELECT * FROM users WHERE wallet = ?
  `).get(wallet);

  if (!user) {
    const result = db.prepare(`
      INSERT INTO users
      (
        wallet,
        username,
        display_name,
        bio,
        avatar,
        banner,
        role
      )
      VALUES (?, ?, ?, ?, ?, ?, 'creator')
    `).run(
      wallet,
      username,
      displayName,
      bio,
      avatar,
      banner
    );

    user = db.prepare(`
      SELECT * FROM users WHERE id = ?
    `).get(result.lastInsertRowid);
  }

  const existing = db.prepare(`
    SELECT * FROM creators WHERE user_id = ?
  `).get(user.id);

  if (existing) {
    return res.json(existing);
  }

  const result = db.prepare(`
    INSERT INTO creators
    (
      user_id,
      subscription_price_sol,
      subscription_price_goji
    )
    VALUES (?, ?, ?)
  `).run(
    user.id,
    Number(subscriptionPriceSol),
    Number(subscriptionPriceGoji)
  );

  const creator =
    getCreatorById(result.lastInsertRowid);

  res.json(creator);
});

app.post("/api/payments/verify", async (req, res) => {
  try {
    const {
      wallet,
      signature,
      currency,
      amount,
      creatorId = null,
      postId = null,
      type = "subscription"
    } = req.body;

    if (!wallet || !isValidPublicKey(wallet)) {
      return res.status(400).json({
        error: "Invalid wallet"
      });
    }

    if (!signature) {
      return res.status(400).json({
        error: "Transaction signature required"
      });
    }

    if (!["SOL", "GOJI"].includes(currency)) {
      return res.status(400).json({
        error: "Unsupported currency"
      });
    }

    const duplicate = db.prepare(`
      SELECT * FROM payments
      WHERE signature = ?
    `).get(signature);

    if (duplicate) {
      return res.json({
        success: duplicate.status === "confirmed",
        payment: duplicate
      });
    }

    let verification;

    if (currency === "SOL") {
      verification =
        await verifySolPayment(
          signature,
          wallet,
          amount
        );
    } else {
      verification =
        await verifyGojiPayment(
          signature,
          wallet,
          amount
        );
    }

    if (!verification.valid) {
      return res.status(400).json({
        error:
          verification.reason ||
          "Payment verification failed",
        verification
      });
    }

    const result = db.prepare(`
      INSERT INTO payments
      (
        wallet,
        creator_id,
        post_id,
        type,
        currency,
        amount,
        signature,
        status
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, 'confirmed')
    `).run(
      wallet,
      creatorId,
      postId,
      type,
      currency,
      Number(amount),
      signature
    );

    const payment = db.prepare(`
      SELECT * FROM payments WHERE id = ?
    `).get(result.lastInsertRowid);

    if (
      type === "subscription" &&
      creatorId
    ) {
      const creator =
        getCreatorById(creatorId);

      if (!creator) {
        return res.status(404).json({
          error: "Creator not found"
        });
      }

      const expires =
        new Date();

      expires.setMonth(
        expires.getMonth() + 1
      );

      db.prepare(`
        INSERT INTO subscriptions
        (
          fan_wallet,
          creator_id,
          payment_id,
          expires_at
        )
        VALUES (?, ?, ?, ?)
        ON CONFLICT(fan_wallet, creator_id)
        DO UPDATE SET
          payment_id = excluded.payment_id,
          expires_at = excluded.expires_at
      `).run(
        wallet,
        creatorId,
        payment.id,
        expires.toISOString()
      );
    }

    res.json({
      success: true,
      payment
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Payment verification failed"
    });
  }
});

app.get(
  "/api/subscriptions/check",
  (req, res) => {
    const {
      wallet,
      creatorId
    } = req.query;

    if (
      !wallet ||
      !creatorId ||
      !isValidPublicKey(wallet)
    ) {
      return res.json({
        active: false
      });
    }

    const subscription =
      db.prepare(`
        SELECT *
        FROM subscriptions
        WHERE fan_wallet = ?
        AND creator_id = ?
        AND expires_at > datetime('now')
      `).get(
        wallet,
        creatorId
      );

    res.json({
      active: Boolean(subscription),
      subscription: subscription || null
    });
  }
);

app.post("/api/tips/verify", async (req, res) => {
  try {
    const {
      wallet,
      creatorId,
      currency,
      amount,
      signature
    } = req.body;

    if (
      !wallet ||
      !creatorId ||
      !currency ||
      !amount ||
      !signature
    ) {
      return res.status(400).json({
        error: "Missing required fields"
      });
    }

    const duplicate = db.prepare(`
      SELECT * FROM tips
      WHERE signature = ?
    `).get(signature);

    if (duplicate) {
      return res.json({
        success: true,
        tip: duplicate
      });
    }

    let verification;

    if (currency === "SOL") {
      verification =
        await verifySolPayment(
          signature,
          wallet,
          amount
        );
    } else if (currency === "GOJI") {
      verification =
        await verifyGojiPayment(
          signature,
          wallet,
          amount
        );
    } else {
      return res.status(400).json({
        error: "Unsupported currency"
      });
    }

    if (!verification.valid) {
      return res.status(400).json({
        error: "Tip verification failed"
      });
    }

    const result = db.prepare(`
      INSERT INTO tips
      (
        fan_wallet,
        creator_id,
        currency,
        amount,
        signature
      )
      VALUES (?, ?, ?, ?, ?)
    `).run(
      wallet,
      creatorId,
      currency,
      Number(amount),
      signature
    );

    const tip = db.prepare(`
      SELECT * FROM tips WHERE id = ?
    `).get(result.lastInsertRowid);

    res.json({
      success: true,
      tip
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Tip verification failed"
    });
  }
});

app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
    service: "DexFans API",
    network: "Solana Mainnet"
  });
});

app.get("*", (req, res) => {
  res.sendFile(
    process.cwd() +
    "/public/index.html"
  );
});

app.listen(PORT, () => {
  console.log(
    `DexFans API running on port ${PORT}`
  );
});
