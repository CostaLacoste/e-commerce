import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { parse } from '../http.js'
import { createMessage } from '../store.js'

const ContactBody = z.object({
  name: z.string().trim().min(1, 'Name is required').max(120, 'Name is too long'),
  email: z.string().trim().email('Enter a valid email address').max(200, 'Email is too long'),
  message: z.string().trim().min(1, 'Message is required').max(5000, 'Message is too long'),
})

export function registerContactRoutes(app: FastifyInstance): void {
  app.post('/api/contact', async (request, reply) => {
    const body = parse(ContactBody, request.body)
    const message = createMessage(app.db, body)
    return reply.status(201).send(message)
  })
}
