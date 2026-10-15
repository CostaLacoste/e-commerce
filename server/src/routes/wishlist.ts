import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { ensureCookie } from '../cookies.js'
import { parse } from '../http.js'
import { addWishlistItem, getWishlist, removeWishlistItem } from '../store.js'

const AddBody = z.object({
  productId: z.number({ invalid_type_error: 'productId must be a number' }).int().positive(),
})

const ProductParams = z
  .object({
    productId: z.string().regex(/^[1-9]\d*$/, 'Invalid product id'),
  })
  .transform((value) => ({ productId: Number(value.productId) }))

export function registerWishlistRoutes(app: FastifyInstance): void {
  app.get('/api/wishlist', async (request, reply) => {
    const wishlistId = ensureCookie(request, reply, 'wishlist_id')
    return getWishlist(app.db, wishlistId)
  })

  app.post('/api/wishlist/items', async (request, reply) => {
    const body = parse(AddBody, request.body)
    const wishlistId = ensureCookie(request, reply, 'wishlist_id')
    return addWishlistItem(app.db, wishlistId, body.productId)
  })

  app.delete('/api/wishlist/items/:productId', async (request, reply) => {
    const params = parse(ProductParams, request.params)
    const wishlistId = ensureCookie(request, reply, 'wishlist_id')
    return removeWishlistItem(app.db, wishlistId, params.productId)
  })
}
