# Instagram Clone — Full-stack (Express + Vite + Postgres)

Ovaj projekat spaja:
- **Backend**: Express REST API za postove i komentare (`/api/*`).
- **Frontend**: React/Vite Instagram klon (build izlaz u `dist/`), serviran preko `express.static` sa SPA fallback-om — tako da root URL (`/`) prikazuje pravu aplikaciju, a `/api/*` i dalje radi kao čist backend.
- **Baza**: Postgres kad je podešen `DATABASE_URL` (npr. na OctaDeploy-u sa `needs_db: true`); bez toga radi na in-memory demo podacima (korisno lokalno).

## Pokretanje lokalno

```bash
npm install
npm run build   # builduje frontend u dist/
npm start       # pokreće Express server (servira dist/ + /api/*)
```

Server sluša na `process.env.PORT` (podrazumevano 3000) i hostu `0.0.0.0`.

## API Endpoints

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

## Frontend

Svi rute koje nisu `/api/*` vraćaju `dist/index.html` (SPA fallback), tako da klijentska React aplikacija preuzima routing.
