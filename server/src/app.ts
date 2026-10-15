import cookie from '@fastify/cookie'
import cors from '@fastify/cors'
import Fastify, { type FastifyServerOptions } from 'fastify'
import type { DatabaseSync } from 'node:sqlite'
import { HttpError } from './http.js'
import { registerCartRoutes } from './routes/cart.js'
import { registerCatalogRoutes } from './routes/catalog.js'
import { registerContactRoutes } from './routes/contact.js'
import { registerMediaRoutes } from './routes/media.js'
import { registerWishlistRoutes } from './routes/wishlist.js'

export async function buildApp(db: DatabaseSync, options?: FastifyServerOptions) {
  const app = Fastify({ logger: false, ...options })
  app.decorate('db', db)

  await app.register(cookie)
  await app.register(cors, {
    origin: true,
    credentials: true,
  })

  app.setErrorHandler((error, request, reply) => {
    if (error instanceof HttpError) {
      return reply.status(error.statusCode).send({ error: error.message })
    }
    const statusCode = typeof error === 'object' && error !== null && 'statusCode' in error ? error.statusCode : undefined
    const message = error instanceof Error ? error.message : 'Invalid request'
    if (typeof statusCode === 'number' && statusCode >= 400 && statusCode < 500) {
      return reply.status(statusCode).send({ error: message })
    }
    request.log.error(error)
    return reply.status(500).send({ error: 'Internal server error' })
  })

  app.setNotFoundHandler((_request, reply) => {
    return reply.status(404).send({ error: 'Not found' })
  })

  app.get('/api/health', async () => ({ ok: true }))
  registerCatalogRoutes(app)
  registerContactRoutes(app)
  registerCartRoutes(app)
  registerWishlistRoutes(app)
  registerMediaRoutes(app)

  return app
}
