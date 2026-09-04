```javascript
export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // --------------------------------------------------
    // CORS / PREFLIGHT
    // --------------------------------------------------

    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders(),
      });
    }

    // --------------------------------------------------
    // API ROOT
    // --------------------------------------------------

    if (url.pathname === "/" && request.method === "GET") {
      return json({
        success: true,
        name: "DexFans API",
        status: "online",
        version: "2.1.0",
      });
    }

    // --------------------------------------------------
    // API STATUS
    // --------------------------------------------------

    if (url.pathname === "/api/status" && request.method === "GET") {
      return json({
        success: true,
        api: "online",
        database: env.DB ? "connected" : "not configured",
        storage: env.MEDIA ? "connected" : "not configured",
      });
    }

    // --------------------------------------------------
    // SIGN UP
    // POST /api/auth/signup
    // --------------------------------------------------

    if (
      url.pathname === "/api/auth/signup" &&
      request.method === "POST"
    ) {
      if (!env.DB) {
        return json(
          {
            success: false,
            error: "Database not connected",
          },
          500
        );
      }

      let body;

      try {
        body = await request.json();
      } catch {
        return json(
          {
            success: false,
            error: "Invalid JSON",
          },
          400
        );
      }

      const email = String(body.email || "")
        .trim()
        .toLowerCase();

      const username = String(body.username || "")
        .trim()
        .toLowerCase();

      const password = String(body.password || "");

      if (!email || !username || !password) {
        return json(
          {
            success: false,
            error: "Email, username and password are required",
          },
          400
        );
      }

      if (!email.includes("@")) {
        return json(
          {
            success: false,
            error: "Please enter a valid email address",
          },
          400
        );
      }

      if (username.length < 3) {
        return json(
          {
            success: false,
            error: "Username must be at least 3 characters",
          },
          400
        );
      }

      if (username.length > 30) {
        return json(
          {
            success: false,
            error: "Username must be 30 characters or less",
          },
          400
        );
      }

      if (!/^[a-z0-9_]+$/.test(username)) {
        return json(
          {
            success: false,
            error:
              "Username can only contain letters, numbers and underscores",
          },
          400
        );
      }

      if (password.length < 8) {
        return json(
          {
            success: false,
            error: "Password must be at least 8 characters",
          },
          400
        );
      }

      // Check email
      const existingEmail = await env.DB
        .prepare(
          "SELECT id FROM users WHERE email = ? LIMIT 1"
        )
        .bind(email)
        .first();

      if (existingEmail) {
        return json(
          {
            success: false,
            error: "Email is already registered",
          },
          400
        );
      }

      // Check username
      const existingUsername = await env.DB
        .prepare(
          "SELECT id FROM users WHERE username = ? LIMIT 1"
        )
        .bind(username)
        .first();

      if (existingUsername) {
        return json(
          {
            success: false,
            error: "Username is already taken",
          },
          400
        );
      }

      // Hash password
      const passwordHash = await hashPassword(password);

      try {
        const result = await env.DB
          .prepare(`
            INSERT INTO users
            (
              username,
              display_name,
              bio,
              email,
              password_hash,
              created_at
            )
            VALUES (?, ?, ?, ?, ?, datetime('now'))
          `)
          .bind(
            username,
            username,
            "",
            email,
            passwordHash
          )
          .run();

        const userId = result.meta.last_row_id;

        const user = {
          id: userId,
          username: username,
          display_name: username,
          bio: "",
          avatar_url: null,
          email: email,
        };

        return json(
          {
            success: true,
            message: "Account created",
            user: user,
          },
          201
        );
      } catch (error) {
        console.error("SIGNUP ERROR:", error);

        return json(
          {
            success: false,
            error: "Could not create account",
          },
          500
        );
      }
    }

    // --------------------------------------------------
    // LOGIN
    // POST /api/auth/login
    // --------------------------------------------------

    if (
      url.pathname === "/api/auth/login" &&
      request.method === "POST"
    ) {
      if (!env.DB) {
        return json(
          {
            success: false,
            error: "Database not connected",
          },
          500
        );
      }

      let body;

      try {
        body = await request.json();
      } catch {
        return json(
          {
            success: false,
            error: "Invalid JSON",
          },
          400
        );
      }

      const email = String(body.email || "")
        .trim()
        .toLowerCase();

      const password = String(body.password || "");

      if (!email || !password) {
        return json(
          {
            success: false,
            error: "Email and password are required",
          },
          400
        );
      }

      const user = await env.DB
        .prepare(`
          SELECT
            id,
            username,
            display_name,
            bio,
            avatar_url,
            email,
            password_hash
          FROM users
          WHERE email = ?
          LIMIT 1
        `)
        .bind(email)
        .first();

      if (!user) {
        return json(
          {
            success: false,
            error: "Invalid email or password",
          },
          401
        );
      }

      const validPassword = await verifyPassword(
        password,
        user.password_hash
      );

      if (!validPassword) {
        return json(
          {
            success: false,
            error: "Invalid email or password",
          },
          401
        );
      }

      return json({
        success: true,
        message: "Login successful",
        user: {
          id: user.id,
          username: user.username,
          display_name: user.display_name,
          bio: user.bio || "",
          avatar_url: user.avatar_url || null,
          email: user.email,
        },
      });
    }

    // --------------------------------------------------
    // CREATE PROFILE
    // POST /api/users
    // --------------------------------------------------

    if (
      url.pathname === "/api/users" &&
      request.method === "POST"
    ) {
      if (!env.DB) {
        return json(
          {
            success: false,
            error: "D1 database not connected",
          },
          500
        );
      }

      let body;

      try {
        body = await request.json();
      } catch {
        return json(
          {
            success: false,
            error: "Invalid JSON",
          },
          400
        );
      }

      const username = String(body.username || "")
        .trim()
        .toLowerCase();

      const displayName = String(
        body.displayName || ""
      ).trim();

      const bio = String(body.bio || "").trim();

      if (!username) {
        return json(
          {
            success: false,
            error: "Username is required",
          },
          400
        );
      }

      if (username.length < 3) {
        return json(
          {
            success: false,
            error: "Username must be at least 3 characters",
          },
          400
        );
      }

      if (username.length > 30) {
        return json(
          {
            success: false,
            error: "Username must be 30 characters or less",
          },
          400
        );
      }

      if (!/^[a-z0-9_]+$/.test(username)) {
        return json(
          {
            success: false,
            error:
              "Username can only contain letters, numbers and underscores",
          },
          400
        );
      }

      const existingUsername = await env.DB
        .prepare(
          "SELECT id FROM users WHERE username = ? LIMIT 1"
        )
        .bind(username)
        .first();

      if (existingUsername) {
        return json(
          {
            success: false,
            error: "Username is already taken",
          },
          400
        );
      }

      try {
        const result = await env.DB
          .prepare(`
            INSERT INTO users
            (
              username,
              display_name,
              bio,
              created_at
            )
            VALUES (?, ?, ?, datetime('now'))
          `)
          .bind(
            username,
            displayName || username,
            bio
          )
          .run();

        const user = {
          id: result.meta.last_row_id,
          username: username,
          display_name: displayName || username,
          bio: bio,
          avatar_url: null,
        };

        return json(
          {
            success: true,
            message: "Profile created",
            user: user,
          },
          201
        );
      } catch (error) {
        console.error("PROFILE ERROR:", error);

        return json(
          {
            success: false,
            error: "Could not create profile",
          },
          500
        );
      }
    }

    // --------------------------------------------------
    // GET USER PROFILE
    // GET /api/users/:username
    // --------------------------------------------------

    if (
      url.pathname.startsWith("/api/users/") &&
      request.method === "GET"
    ) {
      if (!env.DB) {
        return json(
          {
            success: false,
            error: "D1 database not connected",
          },
          500
        );
      }

      const username = decodeURIComponent(
        url.pathname.replace("/api/users/", "")
      )
        .trim()
        .toLowerCase();

      if (!username) {
        return json(
          {
            success: false,
            error: "Username is required",
          },
          400
        );
      }

      const user = await env.DB
        .prepare(`
          SELECT
            id,
            username,
            display_name,
            bio,
            avatar_url,
            email,
            created_at
          FROM users
          WHERE username = ?
          LIMIT 1
        `)
        .bind(username)
        .first();

      if (!user) {
        return json(
          {
            success: false,
            error: "User not found",
          },
          404
        );
      }

      return json({
        success: true,
        user: user,
      });
    }

    // --------------------------------------------------
    // GET CREATORS
    // GET /api/creators
    // --------------------------------------------------

    if (
      url.pathname === "/api/creators" &&
      request.method === "GET"
    ) {
      if (!env.DB) {
        return json(
          {
            success: false,
            error: "D1 database not connected",
          },
          500
        );
      }

      const result = await env.DB
        .prepare(`
          SELECT
            id,
            username,
            display_name,
            bio,
            avatar_url
          FROM users
          ORDER BY id DESC
          LIMIT 50
        `)
        .all();

      return json({
        success: true,
        creators: result.results || [],
      });
    }

    // --------------------------------------------------
    // UNKNOWN ROUTE
    // --------------------------------------------------

    return json(
      {
        success: false,
        error: "Endpoint not found",
        path: url.pathname,
      },
      404
    );
  },
};

// --------------------------------------------------
// PASSWORD HASHING
// --------------------------------------------------

async function hashPassword(password) {
  const data = new TextEncoder().encode(password);

  const hash = await crypto.subtle.digest(
    "SHA-256",
    data
  );

  return arrayBufferToHex(hash);
}

async function verifyPassword(password, storedHash) {
  if (!storedHash) {
    return false;
  }

  const hash = await hashPassword(password);

  return hash === storedHash;
}

function arrayBufferToHex(buffer) {
  return [...new Uint8Array(buffer)]
    .map((byte) =>
      byte.toString(16).padStart(2, "0")
    )
    .join("");
}

// --------------------------------------------------
// CORS
// --------------------------------------------------

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods":
      "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers":
      "Content-Type, Authorization",
    "Access-Control-Max-Age":
      "86400",
  };
}

// --------------------------------------------------
// JSON RESPONSE
// --------------------------------------------------

function json(data, status = 200) {
  return new Response(
    JSON.stringify(data),
    {
      status: status,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders(),
      },
    }
  );
}
```
