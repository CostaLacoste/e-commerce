import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { parse } from '../http.js'
import { claimOffer, getProduct, listCategories, listOffers, listProducts } from '../store.js'
import { ensureCookie } from '../cookies.js'

const ProductQuery = z
  .object({
    q: z.string().max(100, 'Search is too long').optional(),
    categoryId: z
      .string()
      .regex(/^[1-9]\d*$/, 'categoryId must be a positive integer')
      .optional(),
  })
  .transform((value) => ({
    q: value.q?.trim() ? value.q.trim() : null,
    categoryId: value.categoryId ? Number(value.categoryId) : null,
  }))

const IdParams = z
  .object({
    id: z.string().regex(/^[1-9]\d*$/, 'Invalid id'),
  })
  .transform((value) => ({ id: Number(value.id) }))

const ClaimBody = z.object({
  code: z.string().trim().min(1, 'Offer code is required').max(40, 'Offer code is too long'),
})

export function registerCatalogRoutes(app: FastifyInstance): void {
  app.get('/api/products', async (request) => {
    const filters = parse(ProductQuery, request.query)
    return { products: listProducts(app.db, filters) }
  })

  app.get('/api/products/:id', async (request) => {
    const params = parse(IdParams, request.params)
    return { product: getProduct(app.db, params.id) }
  })

  app.get('/api/categories', async () => {
    return { categories: listCategories(app.db) }
  })

  app.get('/api/offers', async () => {
    return { offers: listOffers(app.db) }
  })

  app.post('/api/offers/claim', async (request, reply) => {
    const body = parse(ClaimBody, request.body)
    const cartId = ensureCookie(request, reply, 'cart_id')
    return claimOffer(app.db, cartId, body.code)
  })
}
