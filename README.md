# Instagram Clone API

Express REST API za Instagram klon — postovi i komentari.

- Bez `DATABASE_URL` env promenljive radi na **in-memory** skladištu (demo podaci se učitaju na startu).
- Sa `DATABASE_URL` (Postgres connection string) automatski kreira tabele i koristi pravu bazu.

## Pokretanje lokalno

```bash
npm install
npm start
```

Server sluša na `process.env.PORT` (podrazumevano 3000) i hostu `0.0.0.0`.

## Endpoints

| Metoda | Ruta | Opis |
|---|---|---|
| GET | `/api/health` | status servera i tip baze |
| GET | `/api/posts` | lista svih objava (sa brojem komentara) |
| GET | `/api/posts/:id` | jedna objava + njeni komentari |
| POST | `/api/posts` | kreiraj objavu `{ user, image, caption, location }` |
| DELETE | `/api/posts/:id` | obriši objavu |
| POST | `/api/posts/:id/like` | lajkuj/unlajkuj `{ liked: true/false }` |
| GET | `/api/posts/:id/comments` | komentari objave |
| POST | `/api/posts/:id/comments` | dodaj komentar `{ user, text }` |
| DELETE | `/api/comments/:id` | obriši komentar |
| POST | `/api/comments/:id/like` | lajkuj/unlajkuj komentar `{ liked: true/false }` |
