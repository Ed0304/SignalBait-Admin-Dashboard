# SignalBait

SignalBait is a phishing and scam message scanner designed to help users identify suspicious messages and report potential scams.

The project consists of a public-facing scanner and a separate administrative dashboard for managing submitted reports.

## Features

### Public Scanner

- Analyze suspicious messages.
- Supports text and image input.
- Provides a risk assessment for submitted content.
- Generates a ticket number so users can track their report.
- Public users do not need to create an account or log in.

### Admin Dashboard

The administrative dashboard provides authenticated administrators with tools to:

- Log in using Django session authentication.
- View submitted tickets.
- Update ticket status.
- Delete tickets.
- View ticket analytics.
- Filter and review audit logs.
- Track administrative actions such as login, logout, ticket updates, and ticket deletion.

## Architecture

```text
                    ┌──────────────────────┐
                    │   Public Frontend    │
                    │      Vue + Vite      │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │   Public Backend     │
                    │     Spring Boot      │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │     ML Service       │
                    │    Python/FastAPI    │
                    └──────────────────────┘


                    ┌──────────────────────┐
                    │   Admin Frontend     │
                    │ Angular + TypeScript │
                    └──────────┬───────────┘
                               │
                    Session Authentication
                               │
                               ▼
                    ┌──────────────────────┐
                    │    Admin Backend     │
                    │ Django + Python      │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │     PostgreSQL       │
                    └──────────────────────┘
```

The public application and administrative dashboard are intentionally separated.

The public application is stateless and does not require user authentication. The administrative dashboard uses Django's session-based authentication and is restricted to authenticated administrators.

## Tech Stack

### Public Application

- Vue
- Vite
- TypeScript
- Tailwind CSS
- Vue Router
- Spring Boot
- PostgreSQL
- Python / FastAPI for ML functionality

### Admin Dashboard

- Angular
- TypeScript
- Django
- PostgreSQL
- Django Sessions
- django-cors-headers
- Apache ECharts
- ngx-echarts
- Vercel for deployment

## Admin Authentication

The admin dashboard uses Django's built-in session authentication rather than JWT.

The authentication flow is:

```text
Angular
   │
   │ POST /api/login/
   ▼
Django
   │
   │ authenticate()
   ▼
Django User
   │
   │ django_login()
   ▼
Session Cookie
   │
   ▼
Angular
```

Subsequent authenticated API requests send the session cookie using credentials-enabled HTTP requests.

The frontend uses:

```ts
{
  withCredentials: true
}
```

The production deployment therefore requires cross-origin CORS configuration and secure session cookies.

## Admin API

The Django backend exposes endpoints for authentication, ticket management, analytics, and audit logs.

### Authentication

```text
POST /api/login/
POST /api/logout/
GET  /api/me/
```

### Tickets

```text
GET    /api/tickets/
PATCH  /api/tickets/<ticket_id>/
DELETE /api/tickets/<ticket_id>/
```

### Analytics

```text
GET /api/analytics/
```

Analytics currently provides aggregated ticket information including:

- Ticket status counts
- Issue type counts
- Daily ticket counts
- Configurable sorting

### Audit Logs

```text
GET /api/audit-logs/
```

Audit logs record administrative actions, including:

- Login
- Logout
- Ticket status updates
- Ticket deletion

## Database Models

### Ticket

The `Ticket` model stores submitted report information:

- `ticket_id`
- `created_at`
- `issue_type`
- `reporter_email`
- `ticket_status`

### AuditLog

The `AuditLog` model records administrative activity:

- `user`
- `action`
- `ticket_id`
- `created_at`

The user relationship uses Django's built-in `User` model.

## Admin Dashboard Pages

The Angular dashboard currently contains:

- **Login** — administrator authentication.
- **Dashboard** — ticket management and CRUD operations.
- **Analytics** — visual ticket statistics using ECharts.
- **Audit Logs** — administrative activity history with user/date filtering.

The dashboard uses Angular routing and route guards to restrict authenticated pages.

## Project Structure

A simplified structure is:

```text
SignalBait/
├── frontend/
│   ├── signalbait/              # Public Vue application
│   └── signalbait-admin/        # Angular admin dashboard
│
├── backend/
│   ├── api/                     # Django API application
│   └── backend/                 # Django project configuration
│
└── ml/
    └── ...                       # FastAPI / ML service
```

The exact structure may vary depending on the local development layout.

## Local Development

### Django Admin Backend

Create and activate a Python virtual environment, install the backend dependencies, and configure the environment variables required by Django and PostgreSQL.

Example:

```bash
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

The local API is available at:

```text
http://localhost:8000
```

### Angular Admin Dashboard

Install dependencies and start the development server:

```bash
npm install
ng serve
```

The Angular development server normally runs at:

```text
http://localhost:4200
```

The frontend API configuration should point to:

```text
http://localhost:8000/api
```

during local development.

## Environment Variables

Secrets and environment-specific configuration should not be committed to source control.

The Django backend uses environment variables including:

```text
DJANGO_SECRET_KEY
DB_NAME
DB_USER
DB_PASSWORD
DB_HOST
DB_PORT
```

A local `.env` file can be used during development.

For production deployments, configure the same variables through the hosting platform's environment-variable settings rather than committing them to Git.

The Angular application should also use environment-specific API configuration so that:

```text
Development → http://localhost:8000/api
Production  → deployed Django API
```

The production frontend must never depend on `localhost`.

## CORS and Session Configuration

Because the Angular admin dashboard and Django API are deployed separately, the Django backend allows the production Angular origin explicitly.

The deployment uses credentialed CORS because Django session cookies are required for authenticated requests.

Production session cookies should use secure cross-site settings:

```python
SESSION_COOKIE_SECURE = True
SESSION_COOKIE_SAMESITE = "None"

CSRF_COOKIE_SECURE = True
CSRF_COOKIE_SAMESITE = "None"
```

CORS should remain restricted to trusted origins rather than allowing every origin when credentials are enabled.

## Deployment

The Angular admin dashboard is deployed as a static Angular application.

The Django backend is deployed separately and connects to PostgreSQL using production environment variables.

When deploying, verify:

1. Production environment variables are configured.
2. `DJANGO_SECRET_KEY` is present.
3. PostgreSQL credentials point to the intended production database.
4. The production admin account exists in the database.
5. Django `ALLOWED_HOSTS` includes the deployed backend host.
6. CORS allows the deployed Angular origin.
7. The Angular production build uses the deployed Django API URL rather than `localhost`.
8. Session cookies are configured for secure cross-origin requests.

## Security Considerations

SignalBait is a cybersecurity-oriented project, so deployment configuration intentionally separates secrets and application code.

Important practices include:

- Do not commit `.env` files.
- Do not commit Django's `SECRET_KEY`.
- Do not expose database credentials in frontend code.
- Keep CORS origins explicit.
- Use secure session cookies in production.
- Protect administrative routes with authentication.
- Record sensitive administrative actions in audit logs.
- Keep public user functionality separate from privileged administrative functionality.

## Project Goals

SignalBait was built as a practical full-stack cybersecurity project combining:

- Web development
- TypeScript
- Vue
- Angular
- Spring Boot
- Django
- PostgreSQL
- Machine-learning-assisted analysis
- Authentication and authorization
- CRUD operations
- Data analytics
- Audit logging
- Cloud deployment

The project demonstrates experience working across multiple frontend and backend ecosystems rather than relying on a single framework.

## Status

The core admin dashboard includes:

- Authentication
- Ticket CRUD
- Analytics
- Audit logging
- Production deployment

The public SignalBait application is developed separately from the administrative dashboard.

## Author

Built as a portfolio cybersecurity/full-stack project.
