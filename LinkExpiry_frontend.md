# LinkExpiry Frontend Specification

## Project

Build the frontend for LinkExpiry, a minimal one-page temporary-message
utility.

A user creates a message, selects an expiration period, receives a
unique URL, and shares it. The recipient opens the URL and can reveal
the message once.

After it has been revealed, it cannot be revealed again.

## Technology

Use: - React - TypeScript - Vite - Tailwind CSS - Lucide React

Connect to the FastAPI backend through REST APIs.

Do not move backend business rules into the frontend.

The backend is authoritative for: - expiration - message availability -
one-time access - encryption - message state

## Application Structure

The application should behave as a single-page application.

Primary states:

`CREATE`

and

`VIEW`

`/` shows the create interface.

`/{token}` shows the message-view interface.

Do not create a large dashboard or multiple marketing pages.

## Create State

Display: - LinkExpiry - concise explanation - message textarea -
expiration selector - create secure link button

Keep the interface compact.

## Create Flow

When submitted: 1. Validate the message. 2. Disable the submit button.
3. Show a subtle loading state. 4. POST to the FastAPI API. 5. Handle
errors. 6. Display the generated link.

Success state:

Your secure link is ready.

The message can be viewed once and expires at \[time\].

Show: - generated URL - copy button - create another button

Do not redirect to another page.

## View State

When visiting `/{token}`, call the backend.

If available:

You have a private message.

This message can only be viewed once.

`Reveal message`

If expired: `This link has expired.`

If already viewed: `This message has already been viewed.`

If invalid: `This link is not available.`

Do not reveal the message before the user explicitly presses Reveal.

## Reveal Flow

When Reveal is pressed: 1. Disable the button. 2. Call
`POST /api/messages/{token}/reveal`. 3. Display the returned message. 4.
Clearly indicate that it has been consumed. 5. Do not call the reveal
endpoint again.

## API Handling

Create a small API client layer.

Handle: - loading - success - validation errors - 404 - expired -
already viewed - server errors - network errors

Never show raw API exceptions.

## Responsive Design

Support: - 320px - 375px - 430px - 768px - 1024px - 1440px+

Mobile must be treated as a first-class layout.

Avoid horizontal overflow.

Buttons need comfortable touch targets.

Long generated URLs must wrap.

Long messages must remain readable.

## Accessibility

Use semantic HTML.

All inputs need labels.

Buttons must be keyboard accessible.

Maintain visible focus states.

Use `aria-live` for dynamic status and error messages.

Do not communicate important states through color alone.

## Frontend State

Handle: - idle - loading - success - error

Avoid unnecessary global state.

React local state is sufficient.

Do not introduce Redux unless there is a demonstrated need.

## Design Constraint

Read and follow: - `design.md` - `style.md`

Also follow the separate Impeccable design guidance available to the
project.

The interface must NOT look like an AI-generated SaaS template.

Do not add: - generic SaaS sections - pricing - testimonials - fake
statistics - feature grids - decorative illustrations - oversized
marketing hero - unnecessary navigation - unnecessary dashboards

This is a utility, not a marketing website.

## Quality Check

After implementation: - run the frontend - test creation - test
generated links - test expired links - test consumed links - test
backend errors - test mobile - test desktop - test long messages - test
long URLs - test keyboard navigation

Review the interface critically and remove anything unnecessary or
visually generic.
