const path = require('path');
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const db = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

// ---------- API rute ----------
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', db: db.useDb ? 'postgres' : 'in-memory' });
});

// ---------- Auth rute ----------
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const cleanUsername = (username || '').trim();
    const cleanEmail = (email || '').trim();
    if (!cleanUsername || !cleanEmail || !password) {
      return res.status(400).json({ error: 'Sva polja su obavezna.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Lozinka mora imati bar 6 karaktera.' });
    }
    const existing = await db.getUserByUsername(cleanUsername);
    if (existing) {
      return res.status(409).json({ error: 'Korisničko ime već postoji.' });
    }
    const hashed = await bcrypt.hash(password, 10);
    const user = await db.createUser({ username: cleanUsername, email: cleanEmail, password: hashed });
    res.status(201).json({ username: user.username, email: user.email });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Greška pri registraciji.' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const cleanUsername = (username || '').trim();
    if (!cleanUsername || !password) {
      return res.status(400).json({ error: 'Sva polja su obavezna.' });
    }
    const user = await db.getUserByUsername(cleanUsername);
    if (!user) {
      return res.status(401).json({ error: 'Pogrešno korisničko ime ili lozinka.' });
    }
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ error: 'Pogrešno korisničko ime ili lozinka.' });
    }
    res.json({ username: user.username, email: user.email });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Greška pri prijavi.' });
  }
});

app.get('/api/posts', async (req, res) => {
  try {
    const posts = await db.getPosts();
    res.json(posts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Greška pri učitavanju objava.' });
  }
});

app.get('/api/posts/:id', async (req, res) => {
  try {
    const post = await db.getPost(req.params.id);
    if (!post) return res.status(404).json({ error: 'Objava nije pronađena.' });
    res.json(post);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Greška pri učitavanju objave.' });
  }
});

app.post('/api/posts', async (req, res) => {
  try {
    const { user, image, caption, location } = req.body;
    if (!user || !image) return res.status(400).json({ error: 'Polja "user" i "image" su obavezna.' });
    const post = await db.createPost({ user, image, caption, location });
    res.status(201).json(post);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Greška pri kreiranju objave.' });
  }
});

app.delete('/api/posts/:id', async (req, res) => {
  try {
    await db.deletePost(req.params.id);
    res.status(204).end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Greška pri brisanju objave.' });
  }
});

app.post('/api/posts/:id/like', async (req, res) => {
  try {
    const liked = req.body.liked !== false;
    const post = await db.likePost(req.params.id, liked);
    if (!post) return res.status(404).json({ error: 'Objava nije pronađena.' });
    res.json(post);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Greška pri lajkovanju objave.' });
  }
});

app.get('/api/posts/:id/comments', async (req, res) => {
  try {
    const comments = await db.getComments(req.params.id);
    res.json(comments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Greška pri učitavanju komentara.' });
  }
});

app.post('/api/posts/:id/comments', async (req, res) => {
  try {
    const { user, text } = req.body;
    if (!user || !text) return res.status(400).json({ error: 'Polja "user" i "text" su obavezna.' });
    const comment = await db.addComment(req.params.id, { user, text });
    res.status(201).json(comment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Greška pri dodavanju komentara.' });
  }
});

app.delete('/api/comments/:id', async (req, res) => {
  try {
    await db.deleteComment(req.params.id);
    res.status(204).end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Greška pri brisanju komentara.' });
  }
});

app.post('/api/comments/:id/like', async (req, res) => {
  try {
    const liked = req.body.liked !== false;
    const comment = await db.likeComment(req.params.id, liked);
    if (!comment) return res.status(404).json({ error: 'Komentar nije pronađen.' });
    res.json(comment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Greška pri lajkovanju komentara.' });
  }
});

// 404 za nepostojeće /api rute (mora ići posle svih definisanih /api ruta)
app.use('/api', (req, res) => {
  res.status(404).json({ error: 'API ruta nije pronađena.' });
});

// ---------- Frontend (Vite build izlaz) ----------
const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));

// SPA fallback: sve rute koje nisu /api/* vraćaju index.html Instagram klona
app.get(/^\/(?!api\/).*/, (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';

if (require.main === module) {
  db.init()
    .then(() => {
      app.listen(PORT, HOST, () => {
        console.log(`Server running on http://${HOST}:${PORT} (db: ${db.useDb ? 'postgres' : 'in-memory'})`);
      });
    })
    .catch(err => {
      console.error('Failed to initialize database:', err);
      process.exit(1);
    });
}

module.exports = app;
