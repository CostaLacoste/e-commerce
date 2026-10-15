import assert from 'node:assert/strict'
import { after, before, describe, it } from 'node:test'
import type { DatabaseSync } from 'node:sqlite'
import type { FastifyInstance } from 'fastify'
import { buildApp } from '../src/app.js'
import { migrate, openDatabase } from '../src/db.js'
import { seed } from '../src/seed.js'

describe('shop API', () => {
  let db: DatabaseSync
  let app: FastifyInstance

  before(async () => {
    db = openDatabase(':memory:')
    migrate(db)
    seed(db)
    app = await buildApp(db)
  })

  after(async () => {
    await app.close()
    db.close()
  })

  it('reports health', async () => {
    const response = await app.inject({ method: 'GET', url: '/api/health' })
    assert.equal(response.statusCode, 200)
    assert.deepEqual(response.json(), { ok: true })
  })

  it('lists the seeded catalog in storefront order', async () => {
    const response = await app.inject({ method: 'GET', url: '/api/products' })
    assert.equal(response.statusCode, 200)
    const { products } = response.json()
    assert.equal(products.length, 8)
    assert.equal(products[0].name, 'Floral')
    assert.equal(products[0].image, '1.jpg')
    assert.equal(products[0].discount, 20)
    assert.equal(Math.round(products[0].price * 100), 9999)
    assert.equal(products[1].name, 'Woody')
    assert.equal(products[2].name, 'Oriental')
  })

  it('filters products by name, description, and category', async () => {
    const oriental = await app.inject({ method: 'GET', url: '/api/products?q=oriental' })
    assert.deepEqual(
      oriental.json().products.map((product: { id: number }) => product.id),
      [3],
    )

    const bright = await app.inject({ method: 'GET', url: '/api/products?q=bright' })
    assert.deepEqual(
      bright.json().products.map((product: { id: number }) => product.id),
      [1, 8],
    )

    const mens = await app.inject({ method: 'GET', url: '/api/products?categoryId=1' })
    assert.deepEqual(
      mens.json().products.map((product: { id: number }) => product.id),
      [2, 8],
    )
  })

  it('treats LIKE wildcards in search as plain text', async () => {
    const response = await app.inject({ method: 'GET', url: '/api/products?q=' + encodeURIComponent('%') })
    assert.equal(response.statusCode, 200)
    assert.deepEqual(response.json().products, [])
  })

  it('rejects a bad category filter', async () => {
    const response = await app.inject({ method: 'GET', url: '/api/products?categoryId=0' })
    assert.equal(response.statusCode, 400)
    assert.equal(response.json().error, 'categoryId must be a positive integer')
  })

  it('returns one product and a 404 for a missing id', async () => {
    const found = await app.inject({ method: 'GET', url: '/api/products/2' })
    assert.equal(found.statusCode, 200)
    assert.equal(found.json().product.name, 'Woody')

    const missing = await app.inject({ method: 'GET', url: '/api/products/99' })
    assert.equal(missing.statusCode, 404)
    assert.equal(missing.json().error, 'Product not found')
  })

  it('lists categories and offers with the storefront copy', async () => {
    const categories = await app.inject({ method: 'GET', url: '/api/categories' })
    assert.equal(categories.json().categories.length, 5)
    assert.equal(categories.json().categories[0].title, "Men's Collection")
    assert.equal(categories.json().categories[0].image, '8.png')

    const offers = await app.inject({ method: 'GET', url: '/api/offers' })
    const codes = offers.json().offers.map((offer: { code: string }) => offer.code)
    assert.deepEqual(codes, ['SUMMER30', 'FREEPERFUME', 'NEW20'])
    assert.equal(offers.json().offers[0].bgColor, 'bg-amber-200')
    assert.equal(offers.json().offers[0].endDate, '2026-08-31')
    assert.equal(offers.json().offers[0].active, false)
    assert.equal(offers.json().offers[1].discount, 'Gift')
  })

  it('rejects an expired offer and accepts a current one once', async () => {
    const expired = await app.inject({
      method: 'POST',
      url: '/api/offers/claim',
      payload: { code: 'summer30' },
    })
    assert.equal(expired.statusCode, 410)
    assert.equal(expired.json().error, 'This offer ended on 2026-08-31')

    db.prepare(
      `INSERT INTO offers (id, title, description, discount, end_date, code, bg_color, text_color)
       VALUES (4, 'Future', 'A current offer', '10%', '2099-01-01', 'FUTURE10', 'bg-pink-200', 'text-pink-700')`,
    ).run()

    const first = await app.inject({
      method: 'POST',
      url: '/api/offers/claim',
      payload: { code: 'future10' },
    })
    assert.equal(first.statusCode, 200)
    assert.equal(first.json().alreadyClaimed, false)
    assert.equal(first.json().offer.code, 'FUTURE10')
    const cartId = first.cookies.find((cookie) => cookie.name === 'cart_id')?.value
    assert.ok(cartId)

    const second = await app.inject({
      method: 'POST',
      url: '/api/offers/claim',
      payload: { code: 'FUTURE10' },
      cookies: { cart_id: cartId },
    })
    assert.equal(second.statusCode, 200)
    assert.equal(second.json().alreadyClaimed, true)
    assert.equal(second.json().claimedAt, first.json().claimedAt)

    const missing = await app.inject({
      method: 'POST',
      url: '/api/offers/claim',
      payload: { code: 'NOPE' },
    })
    assert.equal(missing.statusCode, 404)
  })

  it('stores a contact message and rejects invalid input', async () => {
    const created = await app.inject({
      method: 'POST',
      url: '/api/contact',
      payload: { name: '  Ada  ', email: 'ada@example.com', message: "Hello, I'd like a sample." },
    })
    assert.equal(created.statusCode, 201)
    const body = created.json()
    const stored = db.prepare('SELECT name, email, message FROM messages WHERE id = ?').get(body.id) as {
      name: string
      email: string
      message: string
    }
    assert.equal(stored.name, 'Ada')
    assert.equal(stored.email, 'ada@example.com')
    assert.equal(stored.message, "Hello, I'd like a sample.")

    const invalid = await app.inject({
      method: 'POST',
      url: '/api/contact',
      payload: { name: 'Ada', email: 'not-an-email', message: 'Hi' },
    })
    assert.equal(invalid.statusCode, 400)
    assert.equal(invalid.json().error, 'Enter a valid email address')

    const empty = await app.inject({
      method: 'POST',
      url: '/api/contact',
      payload: { name: '   ', email: 'ada@example.com', message: 'Hi' },
    })
    assert.equal(empty.statusCode, 400)
    assert.equal(empty.json().error, 'Name is required')
  })

  it('keeps a cart in an httpOnly cookie', async () => {
    const created = await app.inject({
      method: 'POST',
      url: '/api/cart/items',
      payload: { productId: 1, quantity: 1 },
    })
    assert.equal(created.statusCode, 200)
    assert.equal(created.json().count, 1)
    assert.equal(Math.round(created.json().subtotal * 100), 7999)
    assert.equal(created.json().items[0].product.name, 'Floral')
    const cartCookie = created.cookies.find((cookie) => cookie.name === 'cart_id')
    assert.equal(cartCookie?.httpOnly, true)
    assert.ok(cartCookie?.value)

    const added = await app.inject({
      method: 'POST',
      url: '/api/cart/items',
      payload: { productId: 2, quantity: 2 },
      cookies: { cart_id: cartCookie.value },
    })
    assert.equal(added.json().count, 3)
    assert.equal(Math.round(added.json().items[1].lineTotal * 100), 34798)

    const capped = await app.inject({
      method: 'POST',
      url: '/api/cart/items',
      payload: { productId: 1, quantity: 99 },
      cookies: { cart_id: cartCookie.value },
    })
    assert.equal(capped.json().items[0].quantity, 99)

    const updated = await app.inject({
      method: 'PATCH',
      url: '/api/cart/items/2',
      payload: { quantity: 1 },
      cookies: { cart_id: cartCookie.value },
    })
    assert.equal(updated.json().items.find((item: { productId: number }) => item.productId === 2).quantity, 1)

    const removed = await app.inject({
      method: 'DELETE',
      url: '/api/cart/items/1',
      cookies: { cart_id: cartCookie.value },
    })
    assert.deepEqual(
      removed.json().items.map((item: { productId: number }) => item.productId),
      [2],
    )

    const missing = await app.inject({
      method: 'POST',
      url: '/api/cart/items',
      payload: { productId: 99 },
      cookies: { cart_id: cartCookie.value },
    })
    assert.equal(missing.statusCode, 404)

    const bad = await app.inject({
      method: 'POST',
      url: '/api/cart/items',
      payload: { productId: '1' },
    })
    assert.equal(bad.statusCode, 400)
  })

  it('toggles wishlist items for the same browser', async () => {
    const created = await app.inject({
      method: 'POST',
      url: '/api/wishlist/items',
      payload: { productId: 3 },
    })
    assert.equal(created.statusCode, 200)
    assert.equal(created.json().count, 1)
    const wishlistId = created.cookies.find((cookie) => cookie.name === 'wishlist_id')?.value
    assert.ok(wishlistId)

    const again = await app.inject({
      method: 'POST',
      url: '/api/wishlist/items',
      payload: { productId: 3 },
      cookies: { wishlist_id: wishlistId },
    })
    assert.equal(again.json().count, 1)

    const listed = await app.inject({
      method: 'GET',
      url: '/api/wishlist',
      cookies: { wishlist_id: wishlistId },
    })
    assert.equal(listed.json().items[0].product.name, 'Oriental')

    const removed = await app.inject({
      method: 'DELETE',
      url: '/api/wishlist/items/3',
      cookies: { wishlist_id: wishlistId },
    })
    assert.equal(removed.json().count, 0)
  })

  it('serves catalog images and hides other files', async () => {
    const image = await app.inject({ method: 'GET', url: '/media/1.jpg' })
    assert.equal(image.statusCode, 200)
    assert.equal(image.headers['content-type'], 'image/jpeg')
    assert.ok(image.rawPayload.length > 1000)

    const missing = await app.inject({ method: 'GET', url: '/media/missing.jpg' })
    assert.equal(missing.statusCode, 404)

    const escaped = await app.inject({ method: 'GET', url: '/media/..%2Fpackage.json' })
    assert.equal(escaped.statusCode, 400)
  })

  it('returns JSON for an unknown API route', async () => {
    const response = await app.inject({ method: 'GET', url: '/api/does-not-exist' })
    assert.equal(response.statusCode, 404)
    assert.deepEqual(response.json(), { error: 'Not found' })
  })
})
