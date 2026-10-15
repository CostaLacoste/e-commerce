import type { DatabaseSync, SQLInputValue } from 'node:sqlite'
import { HttpError, todayISO } from './http.js'
import { toCart, toCategory, toOffer, toProduct, type CartJoinRow, type CategoryRow, type OfferRow, type ProductRow } from './mappers.js'

function likePattern(term: string): string {
  return `%${term.replace(/[\\%_]/g, (character) => `\\${character}`)}%`
}

function requireProduct(db: DatabaseSync, productId: number): ProductRow {
  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(productId) as ProductRow | undefined
  if (!product) throw new HttpError(404, 'Product not found')
  return product
}

function ensureCart(db: DatabaseSync, cartId: string): void {
  db.prepare('INSERT INTO carts (id, created_at) VALUES (?, ?) ON CONFLICT(id) DO NOTHING').run(cartId, new Date().toISOString())
}

function ensureWishlist(db: DatabaseSync, wishlistId: string): void {
  db.prepare('INSERT INTO wishlists (id, created_at) VALUES (?, ?) ON CONFLICT(id) DO NOTHING').run(
    wishlistId,
    new Date().toISOString(),
  )
}

const cartQuery = `
  SELECT
    ci.quantity AS quantity,
    p.id AS id,
    p.name AS name,
    p.price_cents AS price_cents,
    p.rating AS rating,
    p.image AS image,
    p.discount AS discount,
    p.category_id AS category_id,
    p.description AS description
  FROM cart_items ci
  JOIN products p ON p.id = ci.product_id
  WHERE ci.cart_id = ?
  ORDER BY p.id
`

const wishlistQuery = `
  SELECT p.*
  FROM wishlist_items wi
  JOIN products p ON p.id = wi.product_id
  WHERE wi.wishlist_id = ?
  ORDER BY p.id
`

export function listProducts(db: DatabaseSync, filters: { q: string | null; categoryId: number | null }) {
  const pattern = filters.q ? likePattern(filters.q) : null
  const params: Record<string, SQLInputValue> = {
    q: pattern,
    categoryId: filters.categoryId,
  }
  const rows = db.prepare(
    `SELECT * FROM products
     WHERE (:q IS NULL OR name LIKE :q ESCAPE '\\' OR description LIKE :q ESCAPE '\\')
       AND (:categoryId IS NULL OR category_id = :categoryId)
     ORDER BY id`,
  ).all(params) as ProductRow[]
  return rows.map(toProduct)
}

export function getProduct(db: DatabaseSync, id: number) {
  return toProduct(requireProduct(db, id))
}

export function listCategories(db: DatabaseSync) {
  const rows = db.prepare('SELECT * FROM categories ORDER BY id').all() as CategoryRow[]
  return rows.map(toCategory)
}

export function listOffers(db: DatabaseSync) {
  const rows = db.prepare('SELECT * FROM offers ORDER BY id').all() as OfferRow[]
  return rows.map((row) => toOffer(row))
}

export function claimOffer(db: DatabaseSync, cartId: string, code: string) {
  const offer = db.prepare('SELECT * FROM offers WHERE code = ? COLLATE NOCASE').get(code.trim()) as OfferRow | undefined
  if (!offer) throw new HttpError(404, 'Offer not found')

  const existing = db.prepare('SELECT created_at FROM offer_claims WHERE offer_id = ? AND cart_id = ?').get(offer.id, cartId) as
    | { created_at: string }
    | undefined
  if (existing) {
    return { offer: toOffer(offer), claimedAt: existing.created_at, alreadyClaimed: true }
  }

  if (offer.end_date < todayISO()) {
    throw new HttpError(410, `This offer ended on ${offer.end_date}`)
  }

  const claimedAt = new Date().toISOString()
  db.prepare('INSERT INTO offer_claims (offer_id, cart_id, created_at) VALUES (?, ?, ?)').run(offer.id, cartId, claimedAt)
  return { offer: toOffer(offer), claimedAt, alreadyClaimed: false }
}

export function createMessage(db: DatabaseSync, input: { name: string; email: string; message: string }) {
  const createdAt = new Date().toISOString()
  const result = db.prepare('INSERT INTO messages (name, email, message, created_at) VALUES (?, ?, ?, ?)').run(
    input.name,
    input.email,
    input.message,
    createdAt,
  )
  return { id: Number(result.lastInsertRowid), createdAt }
}

export function getCart(db: DatabaseSync, cartId: string) {
  ensureCart(db, cartId)
  const rows = db.prepare(cartQuery).all(cartId) as CartJoinRow[]
  return toCart(rows)
}

export function addCartItem(db: DatabaseSync, cartId: string, productId: number, quantity: number) {
  requireProduct(db, productId)
  ensureCart(db, cartId)
  db.prepare(
    `INSERT INTO cart_items (cart_id, product_id, quantity)
     VALUES (?, ?, ?)
     ON CONFLICT(cart_id, product_id) DO UPDATE SET quantity = MIN(99, quantity + excluded.quantity)`,
  ).run(cartId, productId, quantity)
  return getCart(db, cartId)
}

export function setCartQuantity(db: DatabaseSync, cartId: string, productId: number, quantity: number) {
  requireProduct(db, productId)
  ensureCart(db, cartId)
  if (quantity < 1) {
    db.prepare('DELETE FROM cart_items WHERE cart_id = ? AND product_id = ?').run(cartId, productId)
  } else {
    const updated = db.prepare('UPDATE cart_items SET quantity = ? WHERE cart_id = ? AND product_id = ?').run(
      quantity,
      cartId,
      productId,
    )
    if (updated.changes === 0) {
      db.prepare('INSERT INTO cart_items (cart_id, product_id, quantity) VALUES (?, ?, ?)').run(cartId, productId, quantity)
    }
  }
  return getCart(db, cartId)
}

export function removeCartItem(db: DatabaseSync, cartId: string, productId: number) {
  requireProduct(db, productId)
  ensureCart(db, cartId)
  db.prepare('DELETE FROM cart_items WHERE cart_id = ? AND product_id = ?').run(cartId, productId)
  return getCart(db, cartId)
}

export function getWishlist(db: DatabaseSync, wishlistId: string) {
  ensureWishlist(db, wishlistId)
  const rows = db.prepare(wishlistQuery).all(wishlistId) as ProductRow[]
  return {
    items: rows.map((row) => ({ productId: row.id, product: toProduct(row) })),
    count: rows.length,
  }
}

export function addWishlistItem(db: DatabaseSync, wishlistId: string, productId: number) {
  requireProduct(db, productId)
  ensureWishlist(db, wishlistId)
  db.prepare('INSERT INTO wishlist_items (wishlist_id, product_id) VALUES (?, ?) ON CONFLICT DO NOTHING').run(
    wishlistId,
    productId,
  )
  return getWishlist(db, wishlistId)
}

export function removeWishlistItem(db: DatabaseSync, wishlistId: string, productId: number) {
  requireProduct(db, productId)
  ensureWishlist(db, wishlistId)
  db.prepare('DELETE FROM wishlist_items WHERE wishlist_id = ? AND product_id = ?').run(wishlistId, productId)
  return getWishlist(db, wishlistId)
}
