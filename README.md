# Megamuii Works

Pastel-green download hub for mods and personal projects.

## Features
- Responsive Home page with project cards
- Dynamic project detail pages
- Installation instructions
- Download/version history
- Supabase-backed public project data
- Admin email/password login
- Admin upload for cover + downloadable file
- Supabase Database + Storage + RLS schema
- Demo data fallback before Supabase is configured

## Run locally
1. Install Node.js 20+
2. `npm install`
3. Copy `.env.example` to `.env.local`
4. Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. `npm run dev`
6. Open http://localhost:3000

## Supabase setup
1. Create a Supabase project.
2. Open SQL Editor and run `supabase-schema.sql`.
3. In Authentication, create your owner user (email/password).
4. Find that user's UUID in Authentication > Users.
5. Add it to the admin table:
   `insert into public.admin_users (user_id) values ('YOUR-USER-UUID');`
6. Put the Supabase URL and anon key in `.env.local`.

After that, `/admin` can log in and publish projects directly.

## Next recommended feature
Add an “Upload New Version” action to existing projects so a new ZIP updates `updated_at` while preserving previous versions.
