const VERSION = "3.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Max-Age": "86400"
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders
    }
  });
}

function error(message, status = 400) {
  return json({
    success: false,
    error: message
  }, status);
}

async function hashPassword(password) {
  const data = new TextEncoder().encode(password);
  const hash = await crypto.subtle.digest("SHA-256", data);

  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
}

function cleanUsername(username) {
  return String(username || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_.-]/g, "");
}

function cleanFileName(name) {
  return String(name || "file")
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .slice(-120);
}

function mediaUrl(request, key) {
  const origin = new URL(request.url).origin;

  const encodedKey = key
    .split("/")
    .map(part => encodeURIComponent(part))
    .join("/");

  return `${origin}/api/media/${encodedKey}`;
}

async function handleUpload(request, env) {
  if (!env.MEDIA) {
    return error("R2 storage is not connected", 503);
  }

  const form = await request.formData();
  const file = form.get("file");

  if (!file || typeof file.arrayBuffer !== "function") {
    return error("No file uploaded");
  }

  const MAX_FILE_SIZE = 50 * 1024 * 1024;

  if (file.size > MAX_FILE_SIZE) {
    return error("File is too large. Maximum size is 50MB.");
  }

  const contentType = file.type || "application/octet-stream";

  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
    "video/mp4",
    "video/webm",
    "video/quicktime",
    "audio/mpeg",
    "audio/mp4",
    "audio/wav",
    "audio/webm"
  ];

  if (!allowedTypes.includes(contentType)) {
    return error("File type is not supported");
  }

  const safeName = cleanFileName(file.name);

  const key =
    `uploads/${new Date().toISOString().slice(0, 10)}/` +
    `${crypto.randomUUID()}-${safeName}`;

  await env.MEDIA.put(key, file.stream(), {
    httpMetadata: {
      contentType
    },
    customMetadata: {
      originalName: file.name,
      uploadedAt: new Date().toISOString()
    }
  });

  return json({
    success: true,
    key,
    url: mediaUrl(request, key),
    type: contentType,
    size: file.size,
    name: file.name
  });
}

async function handleMedia(request, env, pathname) {
  if (!env.MEDIA) {
    return new Response("R2 storage is not connected", {
      status: 503,
      headers: corsHeaders
    });
  }

  const prefix = "/api/media/";

  if (!pathname.startsWith(prefix)) {
    return new Response("Not found", {
      status: 404,
      headers: corsHeaders
    });
  }

  const key = pathname
    .slice(prefix.length)
    .split("/")
    .map(part => decodeURIComponent(part))
    .join("/");

  if (!key) {
    return new Response("Not found", {
      status: 404,
      headers: corsHeaders
    });
  }

  const object = await env.MEDIA.get(key);

  if (!object) {
    return new Response("Media not found", {
      status: 404,
      headers: corsHeaders
    });
  }

  const headers = new Headers(corsHeaders);

  object.writeHttpMetadata(headers);

  headers.set("ETag", object.httpEtag);
  headers.set(
    "Cache-Control",
    "public, max-age=31536000, immutable"
  );

  return new Response(object.body, {
    status: 200,
    headers
  });
}

async function handleSignup(request, env) {
  let body;

  try {
    body = await request.json();
  } catch {
    return error("Invalid JSON");
  }

  const email = String(body.email || "")
    .trim()
    .toLowerCase();

  const username = cleanUsername(body.username);

  const password = String(body.password || "");

  if (!email || !username || !password) {
    return error("Email, username and password are required");
  }

  if (password.length < 6) {
    return error("Password must be at least 6 characters");
  }

  if (username.length < 3) {
    return error("Username must be at least 3 characters");
  }

  const existingEmail = await env.DB
    .prepare("SELECT id FROM users WHERE email = ? LIMIT 1")
    .bind(email)
    .first();

  if (existingEmail) {
    return error("Email already registered", 409);
  }

  const existingUsername = await env.DB
    .prepare("SELECT id FROM users WHERE username = ? LIMIT 1")
    .bind(username)
    .first();

  if (existingUsername) {
    return error("Username already taken", 409);
  }

  const passwordHash = await hashPassword(password);

  const displayName =
    String(body.displayName || username).trim();

  const result = await env.DB
    .prepare(`
      INSERT INTO users
      (username, display_name, bio, email, password_hash)
      VALUES (?, ?, ?, ?, ?)
    `)
    .bind(
      username,
      displayName,
      "",
      email,
      passwordHash
    )
    .run();

  const user = await env.DB
    .prepare(`
      SELECT
        id,
        username,
        display_name,
        bio,
        avatar_url,
        email
      FROM users
      WHERE id = ?
    `)
    .bind(result.meta.last_row_id)
    .first();

  return json({
    success: true,
    user
  }, 201);
}

async function handleLogin(request, env) {
  let body;

  try {
    body = await request.json();
  } catch {
    return error("Invalid JSON");
  }

  const email = String(body.email || "")
    .trim()
    .toLowerCase();

  const password = String(body.password || "");

  if (!email || !password) {
    return error("Email and password are required");
  }

  const passwordHash = await hashPassword(password);

  const user = await env.DB
    .prepare(`
      SELECT
        id,
        username,
        display_name,
        bio,
        avatar_url,
        email
      FROM users
      WHERE email = ?
        AND password_hash = ?
      LIMIT 1
    `)
    .bind(email, passwordHash)
    .first();

  if (!user) {
    return error("Invalid email or password", 401);
  }

  return json({
    success: true,
    user
  });
}

async function handleGetUser(username, env) {
  const user = await env.DB
    .prepare(`
      SELECT
        id,
        username,
        display_name,
        bio,
        avatar_url,
        email
      FROM users
      WHERE username = ?
      LIMIT 1
    `)
    .bind(username)
    .first();

  if (!user) {
    return error("User not found", 404);
  }

  const posts = await env.DB
    .prepare(`
      SELECT
        p.id,
        p.user_id,
        p.caption,
        p.media_url,
        p.created_at,
        u.username,
        u.display_name,
        u.avatar_url
      FROM posts p
      JOIN users u ON u.id = p.user_id
      WHERE p.user_id = ?
      ORDER BY p.created_at DESC
    `)
    .bind(user.id)
    .all();

  const followers = await env.DB
    .prepare(`
      SELECT COUNT(*) AS count
      FROM followers
      WHERE following_id = ?
    `)
    .bind(user.id)
    .first();

  const following = await env.DB
    .prepare(`
      SELECT COUNT(*) AS count
      FROM followers
      WHERE follower_id = ?
    `)
    .bind(user.id)
    .first();

  return json({
    success: true,
    user: {
      ...user,
      followers: Number(followers?.count || 0),
      following: Number(following?.count || 0),
      posts: Number(posts?.results?.length || 0)
    },
    posts: posts?.results || []
  });
}

async function handleCreators(env) {
  const result = await env.DB
    .prepare(`
      SELECT
        u.id,
        u.username,
        u.display_name,
        u.bio,
        u.avatar_url,
        COUNT(DISTINCT p.id) AS posts_count,
        COUNT(DISTINCT f1.follower_id) AS followers_count
      FROM users u
      LEFT JOIN posts p
        ON p.user_id = u.id
      LEFT JOIN followers f1
        ON f1.following_id = u.id
      GROUP BY
        u.id,
        u.username,
        u.display_name,
        u.bio,
        u.avatar_url
      ORDER BY followers_count DESC, posts_count DESC
      LIMIT 100
    `)
    .all();

  return json({
    success: true,
    creators: result?.results || []
  });
}

async function handleGetPosts(request, env, url) {
  const userId = url.searchParams.get("user_id");
  const username = url.searchParams.get("username");

  let result;

  if (userId) {
    result = await env.DB
      .prepare(`
        SELECT
          p.id,
          p.user_id,
          p.caption,
          p.media_url,
          p.created_at,
          u.username,
          u.display_name,
          u.avatar_url,
          (
            SELECT COUNT(*)
            FROM likes
            WHERE post_id = p.id
          ) AS likes_count,
          (
            SELECT COUNT(*)
            FROM comments
            WHERE post_id = p.id
          ) AS comments_count
        FROM posts p
        JOIN users u ON u.id = p.user_id
        WHERE p.user_id = ?
        ORDER BY p.created_at DESC
        LIMIT 100
      `)
      .bind(userId)
      .all();
  } else if (username) {
    result = await env.DB
      .prepare(`
        SELECT
          p.id,
          p.user_id,
          p.caption,
          p.media_url,
          p.created_at,
          u.username,
          u.display_name,
          u.avatar_url,
          (
            SELECT COUNT(*)
            FROM likes
            WHERE post_id = p.id
          ) AS likes_count,
          (
            SELECT COUNT(*)
            FROM comments
            WHERE post_id = p.id
          ) AS comments_count
        FROM posts p
        JOIN users u ON u.id = p.user_id
        WHERE u.username = ?
        ORDER BY p.created_at DESC
        LIMIT 100
      `)
      .bind(username)
      .all();
  } else {
    result = await env.DB
      .prepare(`
        SELECT
          p.id,
          p.user_id,
          p.caption,
          p.media_url,
          p.created_at,
          u.username,
          u.display_name,
          u.avatar_url,
          (
            SELECT COUNT(*)
            FROM likes
            WHERE post_id = p.id
          ) AS likes_count,
          (
            SELECT COUNT(*)
            FROM comments
            WHERE post_id = p.id
          ) AS comments_count
        FROM posts p
        JOIN users u ON u.id = p.user_id
        ORDER BY p.created_at DESC
        LIMIT 100
      `)
      .all();
  }

  return json({
    success: true,
    posts: result?.results || []
  });
}

async function handleCreatePost(request, env) {
  let body;

  try {
    body = await request.json();
  } catch {
    return error("Invalid JSON");
  }

  const userId = Number(body.userId || body.user_id);
  const caption = String(body.caption || "").trim();
  const mediaUrl = String(
    body.mediaUrl || body.media_url || ""
  ).trim();

  if (!userId) {
    return error("User ID is required");
  }

  const user = await env.DB
    .prepare("SELECT id FROM users WHERE id = ? LIMIT 1")
    .bind(userId)
    .first();

  if (!user) {
    return error("User not found", 404);
  }

  if (!caption && !mediaUrl) {
    return error("Post must contain text or media");
  }

  const result = await env.DB
    .prepare(`
      INSERT INTO posts
      (user_id, caption, media_url, created_at)
      VALUES (?, ?, ?, ?)
    `)
    .bind(
      userId,
      caption,
      mediaUrl,
      new Date().toISOString()
    )
    .run();

  const post = await env.DB
    .prepare(`
      SELECT
        p.id,
        p.user_id,
        p.caption,
        p.media_url,
        p.created_at,
        u.username,
        u.display_name,
        u.avatar_url
      FROM posts p
      JOIN users u ON u.id = p.user_id
      WHERE p.id = ?
    `)
    .bind(result.meta.last_row_id)
    .first();

  return json({
    success: true,
    post
  }, 201);
}

async function handleLike(request, env, postId) {
  let body = {};

  try {
    body = await request.json();
  } catch {}

  const userId = Number(body.userId || body.user_id);

  if (!userId) {
    return error("User ID is required");
  }

  const post = await env.DB
    .prepare("SELECT id FROM posts WHERE id = ? LIMIT 1")
    .bind(postId)
    .first();

  if (!post) {
    return error("Post not found", 404);
  }

  const existing = await env.DB
    .prepare(`
      SELECT id
      FROM likes
      WHERE post_id = ?
        AND user_id = ?
      LIMIT 1
    `)
    .bind(postId, userId)
    .first();

  if (existing) {
    await env.DB
      .prepare("DELETE FROM likes WHERE id = ?")
      .bind(existing.id)
      .run();

    return json({
      success: true,
      liked: false
    });
  }

  await env.DB
    .prepare(`
      INSERT INTO likes
      (post_id, user_id)
      VALUES (?, ?)
    `)
    .bind(postId, userId)
    .run();

  return json({
    success: true,
    liked: true
  });
}

async function handleComments(request, env, postId) {
  if (request.method === "GET") {
    const result = await env.DB
      .prepare(`
        SELECT
          c.id,
          c.post_id,
          c.user_id,
          c.comment,
          c.created_at,
          u.username,
          u.display_name,
          u.avatar_url
        FROM comments c
        JOIN users u ON u.id = c.user_id
        WHERE c.post_id = ?
        ORDER BY c.created_at ASC
      `)
      .bind(postId)
      .all();

    return json({
      success: true,
      comments: result?.results || []
    });
  }

  let body;

  try {
    body = await request.json();
  } catch {
    return error("Invalid JSON");
  }

  const userId = Number(body.userId || body.user_id);
  const comment = String(body.comment || "").trim();

  if (!userId || !comment) {
    return error("User ID and comment are required");
  }

  const post = await env.DB
    .prepare("SELECT id FROM posts WHERE id = ? LIMIT 1")
    .bind(postId)
    .first();

  if (!post) {
    return error("Post not found", 404);
  }

  const result = await env.DB
    .prepare(`
      INSERT INTO comments
      (post_id, user_id, comment, created_at)
      VALUES (?, ?, ?, ?)
    `)
    .bind(
      postId,
      userId,
      comment,
      new Date().toISOString()
    )
    .run();

  const newComment = await env.DB
    .prepare(`
      SELECT
        c.id,
        c.post_id,
        c.user_id,
        c.comment,
        c.created_at,
        u.username,
        u.display_name,
        u.avatar_url
      FROM comments c
      JOIN users u ON u.id = c.user_id
      WHERE c.id = ?
    `)
    .bind(result.meta.last_row_id)
    .first();

  return json({
    success: true,
    comment: newComment
  }, 201);
}

async function handleUpdateUser(request, env, username) {
  let body;

  try {
    body = await request.json();
  } catch {
    return error("Invalid JSON");
  }

  const displayName =
    String(
      body.displayName ??
      body.display_name ??
      ""
    ).trim();

  const bio =
    String(body.bio ?? "").trim();

  const avatarUrl =
    String(
      body.avatarUrl ??
      body.avatar_url ??
      ""
    ).trim();

  const existing = await env.DB
    .prepare(`
      SELECT id
      FROM users
      WHERE username = ?
      LIMIT 1
    `)
    .bind(username)
    .first();

  if (!existing) {
    return error("User not found", 404);
  }

  await env.DB
    .prepare(`
      UPDATE users
      SET
        display_name = ?,
        bio = ?,
        avatar_url = ?
      WHERE username = ?
    `)
    .bind(
      displayName,
      bio,
      avatarUrl,
      username
    )
    .run();

  const user = await env.DB
    .prepare(`
      SELECT
        id,
        username,
        display_name,
        bio,
        avatar_url,
        email
      FROM users
      WHERE username = ?
      LIMIT 1
    `)
    .bind(username)
    .first();

  return json({
    success: true,
    user
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const pathname = url.pathname;

    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders
      });
    }

    try {
      /*
       * HEALTH
       */

      if (request.method === "GET" && pathname === "/") {
        return json({
          success: true,
          name: "DexFans API",
          status: "online",
          version: VERSION
        });
      }

      if (
        request.method === "GET" &&
        pathname === "/api/status"
      ) {
        return json({
          success: true,
          api: "online",
          database: env.DB ? "connected" : "not configured",
          storage: env.MEDIA ? "connected" : "not configured",
          version: VERSION
        });
      }

      /*
       * R2 UPLOAD
       */

      if (
        request.method === "POST" &&
        pathname === "/api/upload"
      ) {
        return await handleUpload(request, env);
      }

      /*
       * R2 MEDIA SERVING
       */

      if (
        request.method === "GET" &&
        pathname.startsWith("/api/media/")
      ) {
        return await handleMedia(
          request,
          env,
          pathname
        );
      }

      /*
       * AUTH
       */

      if (
        request.method === "POST" &&
        pathname === "/api/auth/signup"
      ) {
        return await handleSignup(request, env);
      }

      if (
        request.method === "POST" &&
        pathname === "/api/auth/login"
      ) {
        return await handleLogin(request, env);
      }

      /*
       * USERS
       */

      if (
        pathname.startsWith("/api/users/")
      ) {
        const username = decodeURIComponent(
          pathname.replace("/api/users/", "")
        );

        if (
          request.method === "GET" &&
          username
        ) {
          return await handleGetUser(
            username,
            env
          );
        }

        if (
          request.method === "PUT" &&
          username
        ) {
          return await handleUpdateUser(
            request,
            env,
            username
          );
        }
      }

      /*
       * CREATORS
       */

      if (
        request.method === "GET" &&
        pathname === "/api/creators"
      ) {
        return await handleCreators(env);
      }

      /*
       * POSTS
       */

      if (
        request.method === "GET" &&
        pathname === "/api/posts"
      ) {
        return await handleGetPosts(
          request,
          env,
          url
        );
      }

      if (
        request.method === "POST" &&
        pathname === "/api/posts"
      ) {
        return await handleCreatePost(
          request,
          env
        );
      }

      /*
       * LIKES
       */

      const likeMatch = pathname.match(
        /^\/api\/posts\/(\d+)\/like$/
      );

      if (
        likeMatch &&
        request.method === "POST"
      ) {
        return await handleLike(
          request,
          env,
          likeMatch[1]
        );
      }

      /*
       * COMMENTS
       */

      const commentMatch = pathname.match(
        /^\/api\/posts\/(\d+)\/comments$/
      );

      if (
        commentMatch &&
        (request.method === "GET" ||
          request.method === "POST")
      ) {
        return await handleComments(
          request,
          env,
          commentMatch[1]
        );
      }

      return error("Route not found", 404);

    } catch (err) {
      console.error(err);

      return error(
        err?.message || "Internal server error",
        500
      );
    }
  }
};
