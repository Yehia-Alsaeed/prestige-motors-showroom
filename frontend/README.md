# Prestige Motors Frontend

This folder contains the responsive React/Vite frontend for Prestige Motors, a showroom and used-car marketplace interface connected to the Express API in `../backend`.

## Frontend Stack

- React 19
- TypeScript
- Vite
- React Router
- Tailwind CSS
- Lucide React
- React Hot Toast

## Main Areas

- Public pages: home, about, contact, new-car catalog, used-car catalog, and car details.
- Customer pages: registration, login, dashboard, reservations, offers, personal listings, and sell-your-car submission.
- Admin pages: admin login, dashboard metrics, inventory management, image gallery management, listing approvals, and reservation/offer review.
- Shared layout: responsive public navigation, responsive admin navigation, route guards, and API request helpers.
- Mobile support: hamburger navigation, stacked forms, readable listing cards, horizontally scrollable admin tables, and mobile-safe modals.

## Project Structure

```text
src/
  components/      Shared navigation, footer, and layout components
  context/         Authentication state and token handling
  pages/           Public, customer, and admin screens
  pages/admin/     Protected admin dashboard workflows
  utils/           API request helpers
  config.ts        API base URL configuration
```

## Environment Variables

Copy the example file:

```bash
cp frontend/.env.example frontend/.env
```

Then update `frontend/.env` if the API runs somewhere other than `http://localhost:5000`:

```env
VITE_API_URL=http://localhost:5000
```

For same-domain production deployments, set `VITE_API_URL` to an empty string so requests use relative `/api` paths.

## Scripts

```bash
npm run dev      # Start local development server
npm run build    # Type-check and create production build
npm run lint     # Run ESLint
npm run preview  # Preview the production build locally
```

## Development Notes

- API requests are centralized through `src/utils/apiFetch.ts`.
- Protected customer and admin routes are handled in `src/App.tsx`.
- Authentication state is managed through `src/context/AuthContext.tsx`.
- The frontend expects the backend API to be running locally at `http://localhost:5000` unless `VITE_API_URL` is changed.
