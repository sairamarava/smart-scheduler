Deployment instructions for Smart Scheduler server

Supported options:

1) Render (recommended for simplicity)
- Create a new Web Service on Render.
- Link your GitHub repo and pick the `server` subdirectory as the root (or create a separate repo for server).
- Build command: npm install
- Start command: npm start
- Set environment variables in Render:
  - MONGODB_URI
  - CLIENT_URL (optional)
  - JWT_SECRET and any other secrets

2) Railway
- Create a new project, connect GitHub, select `server` folder.
- Railway auto-detects Node.
- Set environment variables (MONGODB_URI, JWT_SECRET, etc.).

3) Heroku (legacy)
- Create a Heroku app, connect GitHub or push via git.
- Procfile present (web: node src/app.js).
- Set env vars with `heroku config:set`.

4) Docker (any provider)
- Build image: docker build -t smart-scheduler-server:latest .
- Run: docker run -e MONGODB_URI="<uri>" -p 5000:5000 smart-scheduler-server:latest

Notes:
- Ensure your MongoDB is accessible from the host (use Atlas with IP allowlist or private networking).
- Uploads folder is stored locally (server/uploads). For production use S3 or similar and change upload storage.
- Add environment variables in the host provider with proper secrets.
