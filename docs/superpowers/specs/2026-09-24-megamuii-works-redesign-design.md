# Megamuii Works Redesign

## Goal

Make Megamuii Works feel like a modern, friendly creative download hub while keeping its current Supabase-backed project data, project detail route, admin login, uploads, publishing, and download links working.

## Approved direction

- Keep the current App Router, project data types, `listProjects()` and `getProjectBySlug()` data flow, Supabase client, and admin publish actions.
- Turn `/` into a distinct landing page with an editorial hero, three concise feature cards, and only the three newest works.
- Add `/works` for the complete project list.
- Redesign `/projects/[slug]` as a product and download page, retaining all project data, file versions, and external download URLs.
- Give `/admin` the same visual language without changing auth, upload, or database behavior.
- Use shared navigation, footer, project card, and download action components where useful.
- Use CSS for pastel green and blue styling, responsive layouts, focus states, restrained transitions, entrance reveals, and `prefers-reduced-motion`. Do not add dependencies or change the database schema.

## Visual system

Use a warm off-white page background, white surfaces, pastel green as the main action color, pastel blue as a supporting tint, deep green text, muted secondary text, fine borders, rounded corners, and soft shadows. Keep content within a centered max-width near 1200px. Ensure Thai copy stays readable and use semantic links, buttons, headings, and form labels.

## Functional boundaries

Do not replace live Supabase content with static mock content or alter `lib/data.ts`, `lib/projects.ts`, `lib/supabase.ts`, or `supabase-schema.sql` unless implementation proves a change unavoidable. Preserve `/admin` event handlers and form field names. Preserve the existing detail route, file URLs, installation content, updated dates, and not-found behavior.

## Validation

Run the production build and inspect the complete diff. Do not add test infrastructure or run tests for this UI-only redesign.
