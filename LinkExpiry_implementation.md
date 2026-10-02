# LinkExpiry Implementation Plan

## Before Coding

Read these files in order:

1.  `backend.md`
2.  `frontend.md`
3.  `design.md`
4.  `style.md`

Also inspect and use the available Impeccable design skill/process
before making final frontend decisions.

Do not start coding until the requirements are understood.

## Phase 1 --- Project Setup

Create the project structure.

Set up: - FastAPI backend - React/Vite frontend - PostgreSQL -
SQLAlchemy - Alembic - TypeScript - Tailwind CSS - Lucide React

Create environment templates.

Do not hardcode secrets.

## Phase 2 --- Backend

Implement: - database connection - SQLAlchemy model - encryption
service - secure token generation - Pydantic schemas - message service -
API routes - expiration checks - one-time reveal - concurrency
protection - CORS - error handling

Create the Alembic migration.

## Phase 3 --- Backend Testing

Test the complete backend independently before depending on the
frontend.

Verify: - create - status - reveal - expired - viewed - invalid token -
validation - concurrent reveal

Fix failures before continuing.

## Phase 4 --- Frontend

Build the create state first.

Then implement the generated-link result.

Then implement the token view state.

Then implement reveal.

Then implement all error states.

Do not add unrelated features.

## Phase 5 --- Visual Refinement

Use: - `design.md` - `style.md` - Impeccable design guidance

Review the entire interface.

Look specifically for: - AI-slop - excessive cards - excessive rounded
corners - bad spacing - oversized headings - unnecessary decoration -
poor mobile layout - weak hierarchy - inconsistent controls

Remove rather than add when something is unnecessary.

## Phase 6 --- Integration

Connect the frontend to FastAPI.

Verify: - successful creation - generated URL - copy action - viewing -
reveal - expiration - already-viewed state - server errors - network
errors

## Phase 7 --- Final Review

Do not declare the project finished until you have actually run it.

Check: - frontend build - backend startup - migrations - API requests -
database behavior - tests - responsive layouts - accessibility -
security-sensitive code - console errors - unused dependencies

Test at both mobile and desktop widths.

## Final Principle

Keep the project small.

Do not expand the scope simply because another feature seems
interesting.

The objective is a polished one-page product backed by a real Python
backend, not a large application.
