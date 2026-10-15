import { hydrateCategory, hydrateProduct } from './data/catalog'
import { setCart, setWishlist } from './state'

async function request(path, options = {}) {
  const response = await fetch(path, {
    ...options,
    headers: {
      Accept: 'application/json',
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...options.headers,
    },
  })
  const body = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(body.error || `Request failed (${response.status})`)
  }
  return body
}

function hydrateCart(cart) {
  return {
    ...cart,
    items: cart.items.map((item) => ({
      ...item,
      product: hydrateProduct(item.product),
    })),
  }
}

function hydrateWishlist(wishlist) {
  return {
    ...wishlist,
    items: wishlist.items.map((item) => ({
      ...item,
      product: hydrateProduct(item.product),
    })),
  }
}

export async function fetchProducts() {
  if (import.meta.env.MODE === 'test') return null
  const body = await request('/api/products')
  return body.products.map(hydrateProduct)
}

export async function fetchCategories() {
  if (import.meta.env.MODE === 'test') return null
  const body = await request('/api/categories')
  return body.categories.map(hydrateCategory)
}

export async function fetchOffers() {
  if (import.meta.env.MODE === 'test') return null
  const body = await request('/api/offers')
  return body.offers
}

export async function sendMessage(payload) {
  return request('/api/contact', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function claimOffer(code) {
  return request('/api/offers/claim', {
    method: 'POST',
    body: JSON.stringify({ code }),
  })
}

export async function refreshSession() {
  if (import.meta.env.MODE === 'test') return
  const [cart, wishlist] = await Promise.all([
    request('/api/cart'),
    request('/api/wishlist'),
  ])
  setCart(hydrateCart(cart))
  setWishlist(hydrateWishlist(wishlist))
}

export async function addToCart(productId) {
  const cart = await request('/api/cart/items', {
    method: 'POST',
    body: JSON.stringify({ productId, quantity: 1 }),
  })
  const hydrated = hydrateCart(cart)
  setCart(hydrated)
  return hydrated
}

export async function removeFromCart(productId) {
  const cart = await request(`/api/cart/items/${productId}`, { method: 'DELETE' })
  const hydrated = hydrateCart(cart)
  setCart(hydrated)
  return hydrated
}

export async function addToWishlist(productId) {
  const wishlist = await request('/api/wishlist/items', {
    method: 'POST',
    body: JSON.stringify({ productId }),
  })
  const hydrated = hydrateWishlist(wishlist)
  setWishlist(hydrated)
  return hydrated
}

export async function removeFromWishlist(productId) {
  const wishlist = await request(`/api/wishlist/items/${productId}`, { method: 'DELETE' })
  const hydrated = hydrateWishlist(wishlist)
  setWishlist(hydrated)
  return hydrated
}
