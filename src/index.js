const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    if (method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: CORS_HEADERS,
      });
    }

    try {
      if (method === "GET" && path === "/") {
        return json({
          success: true,
          name: "DexFans API",
          status: "online",
          version: "2.3.0",
        });
      }

      if (method === "GET" && path === "/api/status") {
        return json({
          success: true,
          api: "online",
          database: env.DB ? "connected" : "not configured",
          storage: env.MEDIA ? "connected" : "not configured",
        });
      }

      if (method === "POST" && path === "/api/auth/signup") {
        const body = await request.json();

        const email = String(body.email || "").trim().toLowerCase();
        const username = String(body.username || "").trim().toLowerCase();
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

        if (password.length < 8) {
          return json(
            {
              success: false,
              error: "Password must be at least 8 characters",
            },
            400
          );
        }

        if (!/^[a-z0-9_]{3,30}$/.test(username)) {
          return json(
            {
              success: false,
              error: "Username must be 3-30 characters using letters, numbers and underscores",
            },
            400
          );
        }

        const existingEmail = await env.DB.prepare(
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
            409
          );
        }

        const existingUsername = await env.DB.prepare(
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
            409
          );
        }

        const passwordHash = await hashPassword(password);

        const result = await env.DB.prepare(
          `INSERT INTO users
            (username, display_name, bio, avatar_url, email, password_hash)
           VALUES (?, ?, ?, ?, ?, ?)`
        )
          .bind(
            username,
            username,
            "",
            "",
            email,
            passwordHash
          )
          .run();

        const user = await env.DB.prepare(
          `SELECT
            id,
            username,
            display_name,
            bio,
            avatar_url,
            email
           FROM users
           WHERE id = ?`
        )
          .bind(result.meta.last_row_id)
          .first();

        return json({
          success: true,
          user,
        });
      }

      if (method === "POST" && path === "/api/auth/login") {
        const body = await request.json();

        const email = String(body.email || "").trim().toLowerCase();
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

        const user = await env.DB.prepare(
          `SELECT
            id,
            username,
            display_name,
            bio,
            avatar_url,
            email,
            password_hash
           FROM users
           WHERE email = ?
           LIMIT 1`
        )
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

        const passwordHash = await hashPassword(password);

        if (passwordHash !== user.password_hash) {
          return json(
            {
              success: false,
              error: "Invalid email or password",
            },
            401
          );
        }

        delete user.password_hash;

        return json({
          success: true,
          user,
        });
      }

      if (method === "GET" && path.startsWith("/api/users/")) {
        const username = decodeURIComponent(
          path.replace("/api/users/", "")
        )
          .trim()
          .toLowerCase();

        const user = await env.DB.prepare(
          `SELECT
            id,
            username,
            display_name,
            bio,
            avatar_url
           FROM users
           WHERE username = ?
           LIMIT 1`
        )
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

        const postsCount = await env.DB.prepare(
          "SELECT COUNT(*) AS count FROM posts WHERE user_id = ?"
        )
          .bind(user.id)
          .first();

        const followersCount = await env.DB.prepare(
          "SELECT COUNT(*) AS count FROM followers WHERE following_id = ?"
        )
          .bind(user.id)
          .first();

        const followingCount = await env.DB.prepare(
          "SELECT COUNT(*) AS count FROM followers WHERE follower_id = ?"
        )
          .bind(user.id)
          .first();

        return json({
          success: true,
          user: {
            ...user,
            posts_count: Number(postsCount?.count || 0),
            followers_count: Number(followersCount?.count || 0),
            following_count: Number(followingCount?.count || 0),
          },
        });
      }

      if (method === "GET" && path === "/api/creators") {
        const result = await env.DB.prepare(
          `SELECT
            id,
            username,
            display_name,
            bio,
            avatar_url
           FROM users
           ORDER BY id DESC
           LIMIT 50`
        ).all();

        return json({
          success: true,
          creators: result.results || [],
        });
      }

      // CREATE POST
      if (method === "POST" && path === "/api/posts") {
        const body = await request.json();

        const userId = Number(body.userId);
        const caption = String(body.caption || "").trim();
        const mediaUrl = String(body.mediaUrl || "").trim();

        if (!Number.isInteger(userId) || userId <= 0) {
          return json(
            {
              success: false,
              error: "Valid userId is required",
            },
            400
          );
        }

        if (!caption && !mediaUrl) {
          return json(
            {
              success: false,
              error: "Post must contain text or media",
            },
            400
          );
        }

        const user = await env.DB.prepare(
          `SELECT
            id,
            username,
            display_name,
            avatar_url
           FROM users
           WHERE id = ?
           LIMIT 1`
        )
          .bind(userId)
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

        const createdAt = new Date().toISOString();

        const result = await env.DB.prepare(
          `INSERT INTO posts
            (user_id, caption, media_url, created_at)
           VALUES (?, ?, ?, ?)`
        )
          .bind(
            userId,
            caption,
            mediaUrl || null,
            createdAt
          )
          .run();

        const post = await env.DB.prepare(
          `SELECT
            posts.id,
            posts.user_id,
            posts.caption,
            posts.media_url,
            posts.created_at,
            users.username,
            users.display_name,
            users.avatar_url
           FROM posts
           JOIN users
             ON users.id = posts.user_id
           WHERE posts.id = ?
           LIMIT 1`
        )
          .bind(result.meta.last_row_id)
          .first();

        return json({
          success: true,
          post,
        });
      }

      // GET POSTS
      if (method === "GET" && path === "/api/posts") {
        const userIdParam = url.searchParams.get("user_id");

        let result;

        if (userIdParam) {
          const userId = Number(userIdParam);

          if (!Number.isInteger(userId) || userId <= 0) {
            return json(
              {
                success: false,
                error: "Invalid user_id",
              },
              400
            );
          }

          result = await env.DB.prepare(
            `SELECT
              posts.id,
              posts.user_id,
              posts.caption,
              posts.media_url,
              posts.created_at,
              users.username,
              users.display_name,
              users.avatar_url
             FROM posts
             JOIN users
               ON users.id = posts.user_id
             WHERE posts.user_id = ?
             ORDER BY posts.id DESC
             LIMIT 50`
          )
            .bind(userId)
            .all();
        } else {
          result = await env.DB.prepare(
            `SELECT
              posts.id,
              posts.user_id,
              posts.caption,
              posts.media_url,
              posts.created_at,
              users.username,
              users.display_name,
              users.avatar_url
             FROM posts
             JOIN users
               ON users.id = posts.user_id
             ORDER BY posts.id DESC
             LIMIT 50`
          ).all();
        }

        return json({
          success: true,
          posts: result.results || [],
        });
      }

      // LIKE / UNLIKE POST
      if (
        method === "POST" &&
        /^\/api\/posts\/[0-9]+\/like$/.test(path)
      ) {
        const postId = Number(path.split("/")[3]);
        const body = await request.json();
        const userId = Number(body.userId);

        if (
          !Number.isInteger(postId) ||
          postId <= 0 ||
          !Number.isInteger(userId) ||
          userId <= 0
        ) {
          return json(
            {
              success: false,
              error: "Valid postId and userId are required",
            },
            400
          );
        }

        const existing = await env.DB.prepare(
          `SELECT id
           FROM likes
           WHERE user_id = ?
             AND post_id = ?
           LIMIT 1`
        )
          .bind(userId, postId)
          .first();

        if (existing) {
          await env.DB.prepare(
            `DELETE FROM likes
             WHERE user_id = ?
               AND post_id = ?`
          )
            .bind(userId, postId)
            .run();

          return json({
            success: true,
            liked: false,
          });
        }

        await env.DB.prepare(
          `INSERT INTO likes
            (user_id, post_id)
           VALUES (?, ?)`
        )
          .bind(userId, postId)
          .run();

        return json({
          success: true,
          liked: true,
        });
      }

      // GET COMMENTS
      if (
        method === "GET" &&
        /^\/api\/posts\/[0-9]+\/comments$/.test(path)
      ) {
        const postId = Number(path.split("/")[3]);

        if (!Number.isInteger(postId) || postId <= 0) {
          return json(
            {
              success: false,
              error: "Invalid post ID",
            },
            400
          );
        }

        const result = await env.DB.prepare(
          `SELECT
            comments.id,
            comments.user_id,
            comments.post_id,
            comments.comment,
            comments.created_at,
            users.username,
            users.display_name,
            users.avatar_url
           FROM comments
           JOIN users
             ON users.id = comments.user_id
           WHERE comments.post_id = ?
           ORDER BY comments.id ASC`
        )
          .bind(postId)
          .all();

        return json({
          success: true,
          comments: result.results || [],
        });
      }

      // CREATE COMMENT
      if (
        method === "POST" &&
        /^\/api\/posts\/[0-9]+\/comments$/.test(path)
      ) {
        const postId = Number(path.split("/")[3]);
        const body = await request.json();

        const userId = Number(body.userId);
        const text = String(body.text || "").trim();

        if (
          !Number.isInteger(postId) ||
          postId <= 0 ||
          !Number.isInteger(userId) ||
          userId <= 0 ||
          !text
        ) {
          return json(
            {
              success: false,
              error: "postId, userId and text are required",
            },
            400
          );
        }

        const user = await env.DB.prepare(
          "SELECT id FROM users WHERE id = ? LIMIT 1"
        )
          .bind(userId)
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

        const post = await env.DB.prepare(
          "SELECT id FROM posts WHERE id = ? LIMIT 1"
        )
          .bind(postId)
          .first();

        if (!post) {
          return json(
            {
              success: false,
              error: "Post not found",
            },
            404
          );
        }

        const result = await env.DB.prepare(
          `INSERT INTO comments
            (user_id, post_id, comment, created_at)
           VALUES (?, ?, ?, ?)`
        )
          .bind(
            userId,
            postId,
            text,
            new Date().toISOString()
          )
          .run();

        return json({
          success: true,
          comment: {
            id: result.meta.last_row_id,
            user_id: userId,
            post_id: postId,
            comment: text,
          },
        });
      }

      return json(
        {
          success: false,
          error: "Route not found",
          path,
        },
        404
      );
    } catch (error) {
      console.error("DexFans API error:", error);

      return json(
        {
          success: false,
          error:
            error instanceof Error
              ? error.message
              : "Internal server error",
        },
        500
      );
    }
  },
};

async function hashPassword(password) {
  const data = new TextEncoder().encode(password);

  const hash = await crypto.subtle.digest(
    "SHA-256",
    data
  );

  return Array.from(new Uint8Array(hash))
    .map((byte) =>
      byte.toString(16).padStart(2, "0")
    )
    .join("");
}

function json(data, status = 200) {
  return new Response(
    JSON.stringify(data),
    {
      status,
      headers: {
        ...CORS_HEADERS,
        "Content-Type": "application/json; charset=utf-8",
      },
    }
  );
}
