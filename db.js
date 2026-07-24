const { Pool } = require('pg');

const useDb = !!process.env.DATABASE_URL;

let pool;
if (useDb) {
  pool = new Pool({ connectionString: process.env.DATABASE_URL });
}

const seedPosts = [
  { user: 'ana.travel', location: 'Santorini, Greece', image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=1100&h=900&fit=crop', caption: 'Zalazak koji se pamti. More, vetar i savršena svetlost ✨', likes: 12864 },
  { user: 'design.lab', location: 'Belgrade Studio', image: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=1100&h=900&fit=crop', caption: 'Minimal setup za maksimalan fokus. Ko bi radio odavde?', likes: 5201 },
  { user: 'foodie.rs', location: 'Novi Sad', image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=1100&h=900&fit=crop', caption: 'Danas: domaća pizza, sveže bilje i puno sira 🍕', likes: 9733 }
];

const seedComments = {
  0: [
    { user: 'marko.fit', text: 'Prelepo! 😍', likes: 4 },
    { user: 'design.lab', text: 'Ovo ide na bucket listu.', likes: 2 }
  ],
  1: [
    { user: 'ana.travel', text: 'Clean 🔥', likes: 8 }
  ],
  2: [
    { user: 'milica.art', text: 'Gladna sam sad.', likes: 3 }
  ]
};

// ---------- In-memory fallback (koristi se kad DATABASE_URL nije podešen) ----------
let memPosts = [];
let memComments = [];
let memPostId = 1;
let memCommentId = 1;

function seedMemory() {
  seedPosts.forEach((p, idx) => {
    const post = { id: memPostId++, user: p.user, location: p.location, image: p.image, caption: p.caption, likes: p.likes, created_at: new Date().toISOString() };
    memPosts.push(post);
    (seedComments[idx] || []).forEach(c => {
      memComments.push({ id: memCommentId++, post_id: post.id, user: c.user, text: c.text, likes: c.likes, created_at: new Date().toISOString() });
    });
  });
}

function memGetPosts() {
  return memPosts
    .map(p => ({ ...p, comment_count: memComments.filter(c => c.post_id === p.id).length }))
    .sort((a, b) => b.id - a.id);
}
function memGetPost(id) {
  const post = memPosts.find(p => p.id === Number(id));
  if (!post) return null;
  return { ...post, comments: memComments.filter(c => c.post_id === post.id) };
}
function memCreatePost(data) {
  const post = { id: memPostId++, user: data.user, location: data.location || '', image: data.image, caption: data.caption || '', likes: 0, created_at: new Date().toISOString() };
  memPosts.push(post);
  return post;
}
function memDeletePost(id) {
  memPosts = memPosts.filter(p => p.id !== Number(id));
  memComments = memComments.filter(c => c.post_id !== Number(id));
}
function memLikePost(id, liked) {
  const post = memPosts.find(p => p.id === Number(id));
  if (!post) return null;
  post.likes = Math.max(0, post.likes + (liked ? 1 : -1));
  return post;
}
function memGetComments(postId) {
  return memComments.filter(c => c.post_id === Number(postId));
}
function memAddComment(postId, data) {
  const comment = { id: memCommentId++, post_id: Number(postId), user: data.user, text: data.text, likes: 0, created_at: new Date().toISOString() };
  memComments.push(comment);
  return comment;
}
function memDeleteComment(id) {
  memComments = memComments.filter(c => c.id !== Number(id));
}
function memLikeComment(id, liked) {
  const c = memComments.find(c => c.id === Number(id));
  if (!c) return null;
  c.likes = Math.max(0, c.likes + (liked ? 1 : -1));
  return c;
}

// ---------- Users (in-memory) ----------
let memUsers = [];
let memUserId = 1;

function memGetUserByUsername(username) {
  return memUsers.find(u => u.username === username) || null;
}
function memCreateUser(data) {
  const user = { id: memUserId++, username: data.username, email: data.email, password: data.password, created_at: new Date().toISOString() };
  memUsers.push(user);
  return user;
}

// ---------- Postgres store (koristi se kad je DATABASE_URL podešen, npr. na OctaDeploy) ----------
async function pgGetUserByUsername(username) {
  const { rows } = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
  return rows[0] || null;
}
async function pgCreateUser(data) {
  const { rows } = await pool.query(
    'INSERT INTO users (username, email, password) VALUES ($1,$2,$3) RETURNING *',
    [data.username, data.email, data.password]
  );
  return rows[0];
}

async function pgInit() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS posts (
      id SERIAL PRIMARY KEY,
      "user" TEXT NOT NULL,
      location TEXT DEFAULT '',
      image TEXT NOT NULL,
      caption TEXT DEFAULT '',
      likes INTEGER DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT now()
    );
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS comments (
      id SERIAL PRIMARY KEY,
      post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
      "user" TEXT NOT NULL,
      text TEXT NOT NULL,
      likes INTEGER DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT now()
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      email TEXT NOT NULL,
      password TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT now()
    );
  `);

  const { rows } = await pool.query('SELECT COUNT(*)::int AS count FROM posts');
  if (rows[0].count === 0) {
    for (let i = 0; i < seedPosts.length; i++) {
      const p = seedPosts[i];
      const res = await pool.query(
        'INSERT INTO posts ("user", location, image, caption, likes) VALUES ($1,$2,$3,$4,$5) RETURNING id',
        [p.user, p.location, p.image, p.caption, p.likes]
      );
      const postId = res.rows[0].id;
      for (const c of (seedComments[i] || [])) {
        await pool.query(
          'INSERT INTO comments (post_id, "user", text, likes) VALUES ($1,$2,$3,$4)',
          [postId, c.user, c.text, c.likes]
        );
      }
    }
  }
}

async function pgGetPosts() {
  const { rows } = await pool.query(`
    SELECT p.*, COUNT(c.id)::int AS comment_count
    FROM posts p
    LEFT JOIN comments c ON c.post_id = p.id
    GROUP BY p.id
    ORDER BY p.id DESC
  `);
  return rows;
}
async function pgGetPost(id) {
  const { rows } = await pool.query('SELECT * FROM posts WHERE id = $1', [id]);
  if (!rows[0]) return null;
  const { rows: comments } = await pool.query('SELECT * FROM comments WHERE post_id = $1 ORDER BY id ASC', [id]);
  return { ...rows[0], comments };
}
async function pgCreatePost(data) {
  const { rows } = await pool.query(
    'INSERT INTO posts ("user", location, image, caption, likes) VALUES ($1,$2,$3,$4,0) RETURNING *',
    [data.user, data.location || '', data.image, data.caption || '']
  );
  return rows[0];
}
async function pgDeletePost(id) {
  await pool.query('DELETE FROM posts WHERE id = $1', [id]);
}
async function pgLikePost(id, liked) {
  const { rows } = await pool.query(
    'UPDATE posts SET likes = GREATEST(likes + $2, 0) WHERE id = $1 RETURNING *',
    [id, liked ? 1 : -1]
  );
  return rows[0] || null;
}
async function pgGetComments(postId) {
  const { rows } = await pool.query('SELECT * FROM comments WHERE post_id = $1 ORDER BY id ASC', [postId]);
  return rows;
}
async function pgAddComment(postId, data) {
  const { rows } = await pool.query(
    'INSERT INTO comments (post_id, "user", text, likes) VALUES ($1,$2,$3,0) RETURNING *',
    [postId, data.user, data.text]
  );
  return rows[0];
}
async function pgDeleteComment(id) {
  await pool.query('DELETE FROM comments WHERE id = $1', [id]);
}
async function pgLikeComment(id, liked) {
  const { rows } = await pool.query(
    'UPDATE comments SET likes = GREATEST(likes + $2, 0) WHERE id = $1 RETURNING *',
    [id, liked ? 1 : -1]
  );
  return rows[0] || null;
}

module.exports = {
  useDb,
  async init() {
    if (useDb) await pgInit();
    else seedMemory();
  },
  getPosts: () => (useDb ? pgGetPosts() : Promise.resolve(memGetPosts())),
  getPost: (id) => (useDb ? pgGetPost(id) : Promise.resolve(memGetPost(id))),
  createPost: (data) => (useDb ? pgCreatePost(data) : Promise.resolve(memCreatePost(data))),
  deletePost: (id) => (useDb ? pgDeletePost(id) : Promise.resolve(memDeletePost(id))),
  likePost: (id, liked) => (useDb ? pgLikePost(id, liked) : Promise.resolve(memLikePost(id, liked))),
  getComments: (postId) => (useDb ? pgGetComments(postId) : Promise.resolve(memGetComments(postId))),
  addComment: (postId, data) => (useDb ? pgAddComment(postId, data) : Promise.resolve(memAddComment(postId, data))),
  deleteComment: (id) => (useDb ? pgDeleteComment(id) : Promise.resolve(memDeleteComment(id))),
  likeComment: (id, liked) => (useDb ? pgLikeComment(id, liked) : Promise.resolve(memLikeComment(id, liked)))
};
