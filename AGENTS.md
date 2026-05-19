# AGENTS.md

## Project Overview

- React single-page enterprise data app for intelligent Q&A, document search, data management, work orders, dashboards, and permission management.
- Treat this directory as the project root for code changes, commands, and Git operations.

## Tech Stack

- React 18 with Create React App (`react-scripts`).
- React Router DOM v6 using `BrowserRouter`, nested `Routes`, and `Outlet`.
- Ant Design 5 and `@ant-design/icons`.
- Recharts for charts.
- Quill / React Quill for rich text.
- Plain global CSS imported from JS files; no Tailwind, CSS Modules, SCSS, Less, or CSS-in-JS setup.
- Package manager: `pnpm@10.21.0`.

## Directory Structure

- `src/App.js`: top-level route registration.
- `src/index.js`: React entrypoint.
- `src/pages/`: route-level pages.
- `src/components/`: shared layout, query, conversation, editor, preview, modal, and panel components.
- `src/contexts/`: shared React context state.
- `src/data/`: mock/static data for pages and search flows.
- `src/utils/`: query parsing, search, file icon, and tree helpers.
- `src/formats/`: editor format extensions.
- `public/`: static public assets.
- `build/`: generated production output; do not commit.

## Routing Rules

- Register app routes in `src/App.js` under the root route that renders `MainLayout`.
- `MainLayout` owns sidebar navigation, selected menu state, conversation sidebar, file preview panel, and shared providers.
- For new navigable pages, update both `src/App.js` and the `menuItems` / selected-key logic in `src/components/MainLayout.js`.
- Keep route groups consistent:
  - `/question`: intelligent Q&A.
  - `/document`: document search.
  - `/data/*`: data management.
  - `/work-order/*`: work orders.
  - `/permission/*`: permission management.
- Do not bypass `MainLayout` for normal app pages unless explicitly required.

## Styling And Component Reuse

- Prefer Ant Design components for tables, forms, buttons, drawers, modals, tabs, tags, pagination, inputs, and layout primitives.
- Prefer `@ant-design/icons` for menu icons and icon buttons.
- Reuse existing shared components before creating new ones, especially `QueryResult`, `QueryConfigModal`, `CombinedThinking`, `ConversationSidebar`, `FilePreviewer`, rich text editors, relation panels, and date/time controls.
- Use `PageStyle.css` with `page-container`, `page-header`, and `page-content` for standard admin pages.
- Place page-specific CSS in `src/pages/`; place reusable component CSS in `src/components/`.
- Prefix CSS classes by feature/component to reduce global CSS collisions.
- Match the existing style: compact enterprise UI, light gray background, white panels, Ant Design blue accents, subtle borders, restrained shadows, dense tables and filters.

## Development Commands

Run from the project root:

```bash
pnpm install
pnpm start
pnpm lint
pnpm build
pnpm test -- --watchAll=false
```

## Git / PR Check Flow

- Before editing, run `git status --short`.
- Keep changes scoped to the requested task.
- Do not revert unrelated user changes.
- Before preparing a PR, run `pnpm lint` and `pnpm build`.
- Run focused tests, or `pnpm test -- --watchAll=false` when test changes are relevant.
- Review `git diff` before staging.
- TODO: Confirm remote CI and PR template before relying on any repo-specific checklist.

## Blog Module Boundary

- TODO: No existing blog route, page directory, or blog-specific component boundary has been identified.
- Do not add a blog module unless explicitly requested.
- If requested, isolate blog pages, components, and styles from existing data, document, work-order, and permission flows.
- Blog work must not change existing route behavior, sidebar behavior, query flows, document search, or permission pages unless explicitly required.

## Prohibited Changes

- Do not commit `node_modules/`, `build/`, coverage output, `.DS_Store`, or local `.env*` files.
- Do not introduce a new UI framework, router, styling system, or state library without explicit approval.
- Do not replace Ant Design/local shared components with unrelated custom UI when an existing pattern fits.
- Do not break existing pages, route paths, menu selection, conversation state, file preview behavior, or mock-data demos.
- Do not rename route files, shared components, or data files casually.
- Do not add broad refactors while implementing a narrow feature.
- Do not remove shared CSS imports unless all affected pages have been checked.
