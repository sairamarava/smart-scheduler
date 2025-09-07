# Smart Scheduler

A production-ready web app for Google Calendar integration, built with Vite, MERN, Tailwind, Framer Motion. See `SRS.txt` for requirements.

## Setup

1. Enable Google Calendar API in Google Cloud Console.
2. Configure OAuth consent screen, scopes, credentials.
3. Clone repo, add `.env` files in `client/` and `server/`.
4. Install dependencies:
   - Frontend: `cd client && npm install`
   - Backend: `cd server && npm install`
5. Run locally:
   - Frontend: `npm run dev`
   - Backend: `npm run dev`

## Deployment

- Frontend: Vercel/Netlify
- Backend: Vercel/Netlify or cloud VM

## Features

- Google OAuth login
- Calendar/event CRUD
- Intelligent scheduling
- Responsive UI (Tailwind, Framer Motion)
- System design: see `architecture.md`

## Future Enhancements

- Third-party calendar sync
- Analytics
- Advanced scheduling suggestions
