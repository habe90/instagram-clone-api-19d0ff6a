const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => res.json({ name: 'instagram-clone-api', status: 'ok', docs: '/api/health' }));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', db: db.useDb ? 'postgres' : 'in-memory' });
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

const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';

if (require.main === module) {
  db.init()
    .then(() => {
      app.listen(PORT, HOST, () => {
        console.log(`API server running on http://${HOST}:${PORT} (db: ${db.useDb ? 'postgres' : 'in-memory'})`);
      });
    })
    .catch(err => {
      console.error('Failed to initialize database:', err);
      process.exit(1);
    });
}

module.exports = app;
