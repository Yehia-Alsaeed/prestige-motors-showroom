# Prestige Motors Showroom

Prestige Motors is a responsive full-stack MERN showroom platform for browsing premium vehicle inventory, reserving new cars, negotiating used-car offers, submitting customer listings, and managing the complete admin approval workflow across desktop and mobile.

The project includes a React/Vite frontend, an Express/MongoDB API, Cloudinary image uploads, JWT authentication, role-based admin access, and Vercel deployment configuration.

## Live Project

- Live website: https://prestige-motor.vercel.app/

## Screenshots

![Prestige Motors homepage hero](docs/screenshots/home-hero-desktop.png)

![Prestige Motors brand new collection](docs/screenshots/new-collection-desktop.png)

![Prestige Motors used cars marketplace](docs/screenshots/used-cars-marketplace-desktop.png)

## Tech Stack

| Layer | Technologies |
| --- | --- |
| Frontend | React 19, TypeScript, Vite, React Router, Tailwind CSS, Lucide React, React Hot Toast |
| Backend | Node.js, Express 5, MongoDB, Mongoose, JWT, bcrypt |
| Media | Cloudinary, Multer, Multer Storage Cloudinary |
| Security | Helmet, CORS, API rate limiting, password hashing, protected routes |
| Deployment | Vercel static build plus serverless Node API routes |

## Core Features

### Customer Experience

- Fully responsive public and customer-facing interface with mobile navigation, readable cards, and mobile-friendly forms.
- Browse, search, filter, and sort brand-new and pre-owned vehicle inventory.
- View detailed vehicle pages with image galleries, specifications, pricing, and availability status.
- Register, log in, manage profile details, and track reservations, offers, listings, and incoming buyer offers.
- Reserve new vehicles at fixed showroom prices or submit negotiated offers on used vehicles.
- Submit used-car listings with vehicle details, uploaded photos, and seller commission agreement.

### Admin Experience

- Mobile-friendly admin shell with responsive navigation, dashboards, tables, cards, and management modals.
- Protected admin login and admin-only dashboard routes.
- Dashboard metrics for inventory, customers, reservations, offers, and sales pipeline value.
- Manage inventory, mark vehicles as sold, and update vehicle image galleries.
- Review customer-submitted listings and approve or reject them with customer-facing feedback.
- Review reservations and offers across showroom-owned and customer-listed vehicles.
- Reserve vehicles, reject offers, confirm completed sales, or return vehicles to display.

### Backend Capabilities

- REST API for authentication, inventory, offers, reservations, customers, and uploads.
- MongoDB models for users, cars, offers, and reservations.
- JWT authentication, role-based guards, bcrypt password hashing, and API rate limiting.
- Cloudinary upload pipeline with file limits and deployment-friendly environment configuration.

## Repository Structure

```text
prestige-motors-showroom/
  backend/        Express API, MongoDB models, controllers, routes, auth, uploads
  frontend/       React Vite TypeScript interface for customers and admins
  vercel.json     Vercel build and rewrite configuration
  .gitignore      Local dependencies, builds, env files, and private reports
```

## API Overview

| Route Group | Purpose |
| --- | --- |
| `/api/auth` | Customer registration, customer login, admin login, profile management |
| `/api/cars` | Public inventory, car details, admin inventory management, customer listing approvals |
| `/api/offers` | Used-car offers, seller responses, admin reservation decisions, sale confirmation |
| `/api/reservations` | Reservation creation and admin reservation status updates |
| `/api/customers` | Admin customer status management endpoints |
| `/api/upload` | Authenticated Cloudinary image uploads |

## Security Notes

- `.env.example` files are committed intentionally with placeholder values only.
- JWT secrets, database URLs, and Cloudinary credentials must be configured through local or deployment environment variables.
- Auth, offer, reservation, and API routes include rate limiting.
- Admin-only routes are protected with JWT authentication and role checks.
