# Megamuii Works Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Redesign Megamuii Works into a responsive, pastel download hub with separate landing, works, project detail, and admin experiences.

**Architecture:** Keep the App Router and existing Supabase data path unchanged. Add a reusable UI shell and project card, use the existing `Project` shape to build the landing preview, full works listing, and product-style detail view, and centralize the new visual system and lightweight motion in `app/globals.css`.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript, existing Supabase client, CSS; no added dependencies.

**Spec:** `docs/superpowers/specs/2026-09-24-megamuii-works-redesign-design.md`

## Global Constraints

- Preserve all existing Supabase, admin auth, image/file upload, publishing, and download behavior.
- Do not change database schema or replace live project data with mock data.
- Keep homepage to three newest projects; `/works` lists every project.
- Keep the current dynamic project detail route and its not-found behavior.
- Use CSS and existing dependencies only; support reduced motion and keyboard focus.
- Do not add or run tests for this UI redesign; validate with the existing production build.

## Review Focus

- No projects or a Supabase fallback: landing and `/works` render a useful empty/list state without failing.
- Cover is a remote URL or a text label: card/detail remains legible and has meaningful alt text when an image exists.
- No downloadable files: detail page explains the state and avoids a broken primary action.
- Long Thai titles, descriptions, installation steps, and filenames: layouts wrap on mobile without horizontal scrolling.
- Reduced motion preference: entry and floating effects are removed while hover/focus affordances remain usable.

## Files and responsibilities

- `components/SiteHeader.tsx`: site brand and Home/Works/Admin navigation.
- `components/SiteFooter.tsx`: compact site footer and current year.
- `components/ProjectCard.tsx`: shared accessible project preview for home and `/works`.
- `components/DownloadButton.tsx`: consistent download CTA while leaving URL semantics intact.
- `app/layout.tsx`: global shell and shared navigation/footer.
- `app/page.tsx`: distinct hero, intro features, latest-three project preview.
- `app/works/page.tsx`: complete projects page using `listProjects()`.
- `app/projects/[slug]/page.tsx`: product-style detail, instructions, latest file and version list.
- `app/admin/page.tsx`: visual styling/accessibility only; preserve all handlers and Supabase calls.
- `app/globals.css`: palette, layout, responsive behavior, hover/entrance motion, focus, reduced motion.

### Task 1: Shared shell and visual system

**Interfaces:** Header links to `/`, `/works`, `/admin`; footer is layout-level. No data dependencies.

- [x] Add header and footer components; set the document metadata and nav labels without altering route behavior.
- [x] Replace global styles with the approved palette, reusable buttons/panels, focus styles, responsive containers, and reduced-motion rules.
- [x] Make the nav sticky with a translucent background and ensure all three links remain reachable on narrow screens.

### Task 2: Shared project card and landing page

**Interfaces:** `ProjectCard({ project })` consumes the existing `Project` type and links to `/projects/${project.slug}`.

- [x] Build a cover card that supports both remote cover URLs and text fallback labels, displaying updated date, optional latest version, and a details affordance.
- [x] Build the landing page hero, project-type badge, clear CTA links, three compact feature items, and latest works section.
- [x] Derive the homepage preview from the first three projects returned by `listProjects()`; do not introduce separate data or change ordering.
- [x] Add empty-state handling and lightweight CSS entrance/hover effects.

### Task 3: Full works page

**Interfaces:** `/works` uses `listProjects()` and the same `ProjectCard`.

- [x] Add a force-dynamic App Router page with title, description, responsive 3/2/1-column grid, and a useful empty state.

### Task 4: Project detail and downloads

**Interfaces:** Keep `getProjectBySlug(slug)`, `Project` and `ProjectFile`; add no database fields.

- [x] Keep the slug param resolution and `notFound()` path.
- [x] Add breadcrumb, two-column cover/header layout, updated date, latest version, short description, and a prominent latest-file action where a file exists.
- [x] Render description and installation steps as scannable panels, plus a latest file card and compact previous-version rows.
- [x] Retain every file's existing `fileUrl`, filename, version, and date. Show a clear no-file state when needed.
- [x] Add mobile stacking and cover alt text/fallback treatment.

### Task 5: Admin visual alignment

**Interfaces:** Preserve existing login and publish handlers, Supabase calls, form field names, upload paths, and status messages.

- [x] Apply consistent page heading, panel, spacing, input, file picker, button, focus, and responsive styles.
- [x] Add explicit input label associations and accessible message semantics without changing form submission behavior.

### Task 6: Final verification and GitHub push

- [x] Run `npm run build`; resolve any compilation or lint failures caused by the changes.
- [x] Inspect `git diff --check` and the full diff; confirm no Supabase/data/schema changes or credentials are included.
- [x] Commit the redesign and push the authorized branch to `origin`.
