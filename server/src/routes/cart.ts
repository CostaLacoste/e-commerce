import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { ensureCookie } from '../cookies.js'
import { parse } from '../http.js'
import { addCartItem, getCart, removeCartItem, setCartQuantity } from '../store.js'

const AddBody = z.object({
  productId: z.number({ invalid_type_error: 'productId must be a number' }).int().positive(),
  quantity: z.number().int().positive().max(99).optional(),
})

const QuantityBody = z.object({
  quantity: z.number().int().min(0).max(99),
})

const ProductParams = z
  .object({
    productId: z.string().regex(/^[1-9]\d*$/, 'Invalid product id'),
  })
  .transform((value) => ({ productId: Number(value.productId) }))

export function registerCartRoutes(app: FastifyInstance): void {
  app.get('/api/cart', async (request, reply) => {
    const cartId = ensureCookie(request, reply, 'cart_id')
    return getCart(app.db, cartId)
  })

  app.post('/api/cart/items', async (request, reply) => {
    const body = parse(AddBody, request.body)
    const cartId = ensureCookie(request, reply, 'cart_id')
    return addCartItem(app.db, cartId, body.productId, body.quantity ?? 1)
  })

  app.patch('/api/cart/items/:productId', async (request, reply) => {
    const params = parse(ProductParams, request.params)
    const body = parse(QuantityBody, request.body)
    const cartId = ensureCookie(request, reply, 'cart_id')
    return setCartQuantity(app.db, cartId, params.productId, body.quantity)
  })

  app.delete('/api/cart/items/:productId', async (request, reply) => {
    const params = parse(ProductParams, request.params)
    const cartId = ensureCookie(request, reply, 'cart_id')
    return removeCartItem(app.db, cartId, params.productId)
  })
}
