# Peace & Hope - Church Platform

## Environment Configuration

Configure the following environment variables in your deployment environment (`.env.local` for Next.js or `.env` for Vite):

```bash
# Supabase Project URL (MUST NOT have trailing slash, and MUST NOT include /rest/v1)
# Correct: https://xyzcompany.supabase.co
# Incorrect: https://xyzcompany.supabase.co/
# Incorrect: https://xyzcompany.supabase.co/rest/v1
NEXT_PUBLIC_SUPABASE_URL="https://<project-ref>.supabase.co"
VITE_SUPABASE_URL="https://<project-ref>.supabase.co"

# Supabase Anonymous Public API Key (JWT token from Project Settings -> API)
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
VITE_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Notes on URL Normalization & Resiliency
- The app automatically strips trailing slashes and accidental `/rest/v1` suffixes to prevent `Invalid path specified in request URL` errors.
- Realtime channels use progressive enhancement: if Realtime is disconnected or disabled, initial content remains rendered, and errors are handled silently at debug level.
- All public homepage sections and the Header component are wrapped in isolated Error Boundaries to ensure no single component failure can bring down the page.
