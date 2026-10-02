# LinkExpiry Backend Specification

## Project

Build the backend for LinkExpiry, a minimal one-page temporary-message
application.

A user creates a message, receives a unique URL, and shares that URL
with another person. The message can be viewed only once and
automatically becomes inaccessible after its expiration time.

The backend must enforce all security and business rules.

Keep the MVP small, clean, secure, and maintainable.

## Technology Stack

Use: - Python 3.12+ - FastAPI - PostgreSQL - SQLAlchemy 2.x - Pydantic
v2 - Alembic - Uvicorn - python-dotenv

Use async database operations where appropriate.

Do not use Firebase or MongoDB. Do not introduce unnecessary
microservices.

## Architecture

Recommended structure:

app/ main.py core/ config.py security.py db/ database.py models.py
schemas/ message.py api/ routes/ messages.py services/
message_service.py

alembic/ requirements.txt .env.example README.md

Keep the architecture understandable. Do not over-engineer it.

## Database Model

Create a messages table with:

-   id --- UUID or integer primary key.
-   token --- unique cryptographically secure public identifier.
-   encrypted_message --- encrypted message contents.
-   expires_at --- UTC timestamp.
-   viewed_at --- nullable UTC timestamp.
-   created_at --- UTC timestamp.

Never use the database primary key as the public URL identifier.

Do not store plaintext messages in the database.

## Encryption

Encrypt messages before storing them.

Use a well-established authenticated encryption library. The encryption
key must come from an environment variable.

Never hardcode encryption keys or commit `.env`.

Create `.env.example` with placeholders.

If encryption configuration is missing, fail clearly rather than storing
plaintext.

## Token Generation

Use a cryptographically secure random generator.

Do not use: - incremental IDs - timestamps - predictable random
numbers - database IDs - usernames

The token must be sufficiently long to make guessing impractical.

## API

### POST /api/messages

Request:

``` json
{
  "message": "example secret",
  "expiration_minutes": 60
}
```

Validate: - message is not empty - surrounding whitespace is handled -
message size has a reasonable maximum - expiration is one of the
supported values

Supported expiration values: - 10 minutes - 60 minutes - 1440 minutes -
10080 minutes

Response:

``` json
{
  "token": "...",
  "expires_at": "...",
  "url": "..."
}
```

Do not return the plaintext message.

### GET /api/messages/{token}

This endpoint must NOT reveal the secret message.

Possible states: - available - expired - viewed - not_found

Example:

``` json
{
  "status": "available",
  "expires_at": "..."
}
```

### POST /api/messages/{token}/reveal

Reveal an available message exactly once.

Rules: 1. Find the message by token. 2. If it does not exist, return not
found. 3. If it has expired, return expired. 4. If `viewed_at` is not
NULL, return viewed. 5. Decrypt the message. 6. Mark `viewed_at`
immediately. 7. Return the plaintext exactly once.

## One-Time Access

The backend must enforce one-time viewing.

Do not rely on JavaScript or hiding content in the frontend.

Protect the reveal operation against simultaneous requests. If two
requests attempt to reveal the same message at nearly the same time,
only one may receive the message.

Use an appropriate database transaction/locking strategy.

## Expiration

Expiration is server-side.

A message is unavailable when:

`current UTC time >= expires_at`

The browser may display a countdown, but the backend remains
authoritative.

## Error Responses

Use consistent JSON errors.

Examples:

``` json
{
  "detail": "Message not found"
}
```

``` json
{
  "detail": "This message has expired"
}
```

``` json
{
  "detail": "This message has already been viewed"
}
```

``` json
{
  "detail": "Invalid expiration period"
}
```

Do not expose stack traces or internal database errors.

## Security

Implement: - secure random tokens - application-level encryption -
environment-based encryption key - server-side expiration - server-side
one-time access - input validation - maximum message size - generic
error responses - no sensitive information in logs - no plaintext
secrets in logs - explicit CORS configuration

Do not add authentication for the MVP.

## Database and Migrations

Use PostgreSQL and SQLAlchemy 2.x.

Use Alembic migrations.

Create an initial migration.

The application should support:

`alembic upgrade head`

Do not automatically create production tables at startup.

## Environment Variables

Create `.env.example` containing:

``` text
DATABASE_URL=
MESSAGE_ENCRYPTION_KEY=
FRONTEND_ORIGIN=
```

Never commit the real `.env`.

## Testing

Test: 1. Message creation. 2. Empty message rejection. 3. Oversized
message rejection. 4. Invalid expiration rejection. 5. Successful status
retrieval. 6. Successful reveal. 7. Second reveal rejection. 8. Expired
message rejection. 9. Invalid token. 10. Concurrent reveal attempts.

The concurrent reveal test is particularly important.

## Development Quality

Before finishing: - run the application - run migrations - run tests -
check `/docs` - check database operations - check API errors - review
security-sensitive code - remove unused dependencies - remove debug
prints - check for hardcoded secrets

Do not declare the backend complete merely because files were generated.
Inspect and test the implementation, then fix problems found.

## Scope Restrictions

Do NOT add: - user accounts - social login - admin dashboard -
payments - analytics dashboard - chat - notifications - teams -
subscriptions - file uploads - AI features

The goal is a small, technically sound backend.
