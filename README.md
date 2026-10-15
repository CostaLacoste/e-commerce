# ShopEase

Vue 3 storefront for a perfume shop, with a TypeScript API for the catalog, offers, contact form, cart, and wishlist.

## Storefront

```bash
npm install
npm run dev
```

## API

Requires Node.js 22.13 or newer. The API uses the built-in `node:sqlite` module and stores its database in `server/data/shop.db`. Delete that file to load the seed catalog again.

```bash
npm install --prefix server
npm run dev:api
```

The API listens on port 3001. The Vite dev server proxies `/api` and `/media` to it, so run both processes together.

## Tests

```bash
npm test
npm run test:api
npm run typecheck:api
```

## API

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/api/health` | Process check |
| GET | `/api/products?q=&categoryId=` | Catalog search |
| GET | `/api/products/:id` | One product |
| GET | `/api/categories` | Collection cards |
| GET | `/api/offers` | Current offers |
| POST | `/api/offers/claim` | `{ "code": "SUMMER30" }` |
| POST | `/api/contact` | `{ "name", "email", "message" }` |
| GET | `/api/cart` | Cart for this browser |
| POST | `/api/cart/items` | `{ "productId", "quantity" }` |
| PATCH | `/api/cart/items/:productId` | `{ "quantity" }` (`0` removes the line) |
| DELETE | `/api/cart/items/:productId` | Remove a line |
| GET | `/api/wishlist` | Saved products |
| POST | `/api/wishlist/items` | `{ "productId" }` |
| DELETE | `/api/wishlist/items/:productId` | Remove a saved product |
| GET | `/media/:file` | Catalog image |

Cart and wishlist ids are `httpOnly` cookies (`cart_id`, `wishlist_id`). Prices are stored in cents and returned in dollars. Offer codes are matched without case sensitivity. A code whose end date is before today returns `410`.

[![Netlify Status](https://api.netlify.com/api/v1/badges/66b2b07f-edc3-4e49-b5c2-73ddf5304d61/deploy-status)](https://app.netlify.com/projects/unique-basbousa-c4e8ef/deploys)
