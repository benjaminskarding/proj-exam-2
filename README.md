# Holidaze

Holidaze is a modern accommodation booking app built with React and TailwindCSS. Users can search and filter through vacation venues by name, location, date range, guest count, and amenities. Venue managers can create and manage venues and bookings.

This project was built as a final exam submission using the official Noroff Holidaze API (v2).

---

## Tech stack

- **React** (functional components and hooks)
- **React Router v6**
- **TailwindCSS**
- **Fuse.js** – for fuzzy search
- **React DatePicker** – for selecting check-in/check-out
- **p-limit** – throttling concurrent API calls
- **use-debounce** – for smooth search experience
- **Noroff Holidaze API v2**

---

## Getting started

### 1. Clone the project

```bash
git clone https://github.com/benjaminskarding/proj-exam-2.git
cd holidaze
```

### 2. Install dependencies

```bash
npm install
```

### 3. Start the dev server

```bash
npm run start
```

This will run the app at `http://localhost:3000` by default.

---

## Configuration

Create .env.local file in root and insert real values

REACT_APP_API_BASE=
REACT_APP_API_KEY=

---

## Build for production

```bash
npm run build
```

Then you can preview the production build:

```bash
npm run preview
```

---

## Features

- Search venues by name, city, or country
- Filter by date range, guest count, amenities
- Sort by newest, oldest, or default
- Responsive layout
- Optimized with debounce and caching
- Admin panel (for venue management)

---

## Design

The visual identity for Holidaze is built around clarity, ease of use, and a calm, welcoming aesthetic.

Colors were deliberately limited to a cool-toned palette, with emerald green (#075F47) serving as the primary brand color. This is used for CTAs, category pills, and visual accents. Supporting grays and soft backgrounds provide contrast and make venue images stand out.

Responsive design is consistent throughout the project, with layout breakpoints and interactions optimized for both desktop and mobile.

## ✍️ Author

Made by Benjamin Skarding.
