import { randomUUID } from 'node:crypto'
import type { FastifyReply, FastifyRequest } from 'fastify'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

const cookieOptions = {
  httpOnly: true,
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 60 * 60 * 24 * 30,
}

export function ensureCookie(request: FastifyRequest, reply: FastifyReply, name: string): string {
  const current = request.cookies[name]
  if (current && UUID_RE.test(current)) return current
  const id = randomUUID()
  reply.setCookie(name, id, cookieOptions)
  return id
}
