# LinkExpiry

A minimal, secure, one-page temporary message application.

A user creates a secret message, receives a unique URL, and shares that URL with another person. The message can be viewed **only once** and automatically becomes inaccessible after its expiration time.

---

## Features

- **Authenticated Encryption**: All secret messages are encrypted using Fernet (AES-128-CBC + HMAC-SHA256) before storing in the database. Plaintext is never stored.
- **Server-Authoritative Expiration**: Enforced on the backend (10 minutes, 1 hour, 1 day, 7 days).
- **One-Time Reveal & Concurrency Protection**: Atomic conditional updates prevent race conditions and guarantee single-use viewing.
- **Minimalist & Accessible UI**: Clean, restrained design adhering strictly to `design.md`, `style.md`, and the provided visual specifications.
- **Mobile-First Responsive Layout**: Fully responsive across desktop, tablet, and mobile devices.

---

## Project Structure

```
linkexpiry/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   └── routes/
│   │   │       └── messages.py       # API endpoints (/api/messages)
│   │   ├── core/
│   │   │   ├── config.py             # App settings & env configuration
│   │   │   └── security.py           # Encryption and token generation
│   │   ├── db/
│   │   │   ├── database.py           # SQLAlchemy async session management
│   │   │   └── models.py             # Database models
│   │   ├── schemas/
│   │   │   └── message.py            # Pydantic validation schemas
│   │   ├── services/
│   │   │   └── message_service.py    # Core business logic & atomic reveal
│   │   └── main.py                   # FastAPI application entrypoint
│   ├── alembic/                      # Database migrations
│   ├── tests/
│   │   └── test_messages.py          # 10 comprehensive backend test cases
│   ├── .env.example
│   └── requirements.txt
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Header.tsx            # Minimal navigation & branding
    │   │   ├── CreateMessageCard.tsx # Create temporary message form
    │   │   ├── CreatedSuccessCard.tsx# Ready link & copy actions
    │   │   ├── ViewMessageCard.tsx   # Recipient private message view
    │   │   ├── RevealedMessageCard.tsx# Decrypted message display
    │   │   └── StatusMessageCard.tsx # Expired, viewed, invalid states
    │   ├── api.ts                    # Frontend API client
    │   ├── types.ts                  # TypeScript interfaces
    │   ├── utils.ts                  # Time formatting & clipboard helpers
    │   ├── App.tsx                   # Main state & SPA routing
    │   └── index.css                 # Inter font & design system tokens
    ├── package.json
    └── vite.config.ts
```

---

## Quick Start

### 1. Backend Setup

```bash
cd backend

# Create and activate virtual environment
python -m venv .venv
source .venv/bin/activate  # Or on Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env

# Run database migrations
alembic upgrade head

# Run tests
pytest -v

# Start FastAPI server
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start Vite dev server (proxies /api to http://127.0.0.1:8000)
npm run dev
```

Open `http://localhost:5173` in your browser.
