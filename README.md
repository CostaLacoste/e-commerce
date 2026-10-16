# ShopEase

ShopEase is a perfume shop. The storefront is a Vue 3 single-page site, and the catalog, offers, contact form, cart, and wishlist are served by a TypeScript API.

[![Netlify Status](https://api.netlify.com/api/v1/badges/66b2b07f-edc3-4e49-b5c2-73ddf5304d61/deploy-status)](https://app.netlify.com/projects/unique-basbousa-c4e8ef/deploys)

## Stack

- **Storefront:** Vue 3, Vite, Tailwind CSS 4, Vitest
- **API:** Node.js 22, TypeScript, Fastify, Zod
- **Database:** SQLite through the built-in `node:sqlite` module

## Features

- Product carousel with search, ratings, and discounts
- Fragrance collection cards
- Limited-time offers with claimable codes
- Contact form
- Cart and wishlist stored per browser

The storefront keeps a bundled copy of the catalog. If the API is not running, the page still renders that copy. Search, the cart, the wishlist, offer claims, and the contact form need the API.

## Requirements

- Node.js 22.13 or newer
- npm

## Run locally

Install and start both processes. The Vite dev server proxies `/api` and `/media` to the API.

```bash
npm install
npm install --prefix server

npm run dev:api
npm run dev
```

Open http://127.0.0.1:5173. The API listens on port 3001.

| Variable | Default | Used by |
| --- | --- | --- |
| `PORT` | `3001` | API listen port |
| `HOST` | `0.0.0.0` | API listen address |
| `DB_PATH` | `server/data/shop.db` | SQLite file |

The database file is created on first launch and filled with the seed catalog. Delete `server/data/shop.db` to load that seed again.

## Scripts

From the repository root:

| Script | What it does |
| --- | --- |
| `npm run dev` | Start the Vite storefront |
| `npm run dev:api` | Start the API in watch mode |
| `npm run build` | Build the storefront |
| `npm run preview` | Preview the production storefront build |
| `npm test` | Run the storefront tests once if Vitest is not in watch mode, or start Vitest |
| `npm run test:api` | Run the API tests |
| `npm run typecheck:api` | Typecheck the API |

`npm test` uses Vitest. In a terminal it watches for changes. Use `npx vitest run` for a single pass.

## Project layout

```text
src/                  Vue storefront
  components/         Page sections
  data/catalog.js     Bundled catalog used before the API responds
  api.js              Client for the API
  state.js            Shared cart, wishlist, and search state
server/               TypeScript API
  src/                Fastify app, routes, and SQLite access
  test/api.test.ts    HTTP tests
```

## API

Prices are stored in cents and returned in dollars. Cart and wishlist identity is an `httpOnly` cookie: `cart_id` and `wishlist_id`. Offer codes are matched without case sensitivity. A code whose end date is before today returns `410`.

| Method | Path | Body | Purpose |
| --- | --- | --- | --- |
| `GET` | `/api/health` | | Process check |
| `GET` | `/api/products?q=&categoryId=` | | List or search products |
| `GET` | `/api/products/:id` | | One product |
| `GET` | `/api/categories` | | Collection cards |
| `GET` | `/api/offers` | | Offers, including whether each code is still active |
| `POST` | `/api/offers/claim` | `{ "code": "SUMMER30" }` | Claim an offer for this browser |
| `POST` | `/api/contact` | `{ "name", "email", "message" }` | Save a contact message |
| `GET` | `/api/cart` | | Cart for this browser |
| `POST` | `/api/cart/items` | `{ "productId", "quantity?" }` | Add a product. Quantity defaults to 1 and is capped at 99 |
| `PATCH` | `/api/cart/items/:productId` | `{ "quantity" }` | Set a line quantity. `0` removes the line |
| `DELETE` | `/api/cart/items/:productId` | | Remove a line |
| `GET` | `/api/wishlist` | | Saved products |
| `POST` | `/api/wishlist/items` | `{ "productId" }` | Save a product |
| `DELETE` | `/api/wishlist/items/:productId` | | Remove a saved product |
| `GET` | `/media/:file` | | A catalog image from `src/assets` |

Errors are JSON: `{ "error": "message" }`.
