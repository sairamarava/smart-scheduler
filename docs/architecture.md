# Smart Scheduler System Architecture

## Overview

Smart Scheduler is a MERN stack web application integrating Google Calendar via OAuth 2.0, providing event management and intelligent scheduling.

## Components

- **Frontend (Vite + React + Tailwind + Framer Motion):**
  - Handles authentication, calendar/event UI, user interactions.
- **Backend (Node.js + Express + MongoDB):**
  - Manages OAuth, token storage, calendar/event CRUD, push notifications.
- **Google Calendar API:**
  - Provides calendar and event data, authentication, webhooks.

## Flow Diagram

```
[User] <-> [React Frontend] <-> [Express Backend] <-> [Google Calendar API]
                                    |
                              [MongoDB]
```

## Key Design Concepts

- **OAuth 2.0:** Secure Google authentication via backend.
- **Token Management:** Store/refresh tokens in MongoDB.
- **RESTful API:** Frontend communicates with backend for calendar/event operations.
- **Webhooks:** Backend subscribes to Google Calendar push notifications for real-time updates.
- **Scalability:** Stateless backend, horizontal scaling, secure credential management.
- **Responsive UI:** Mobile-first, interactive calendar (FullCalendar.js), smooth animations (Framer Motion).

## Deployment

- **Frontend:** Vercel/Netlify
- **Backend:** Vercel/Netlify or cloud VM
- **Environment Variables:** Credentials/secrets in `.env` files

---

Refer to SRS.txt for detailed requirements.
