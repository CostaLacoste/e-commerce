import fs from 'node:fs'
import path from 'node:path'
import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { HttpError, parse } from '../http.js'
import { assetsPath } from '../paths.js'

const types: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
}

const FileParams = z.object({
  file: z.string().regex(/^[A-Za-z0-9._-]+$/, 'Invalid file name'),
})

export function registerMediaRoutes(app: FastifyInstance): void {
  const root = path.resolve(assetsPath())

  app.get('/media/:file', async (request, reply) => {
    const params = parse(FileParams, request.params)
    const filename = path.basename(params.file)
    const full = path.resolve(root, filename)
    if (full !== path.join(root, filename)) {
      throw new HttpError(404, 'Not found')
    }
    if (!fs.existsSync(full) || !fs.statSync(full).isFile()) {
      throw new HttpError(404, 'Not found')
    }
    const type = types[path.extname(filename).toLowerCase()]
    if (!type) throw new HttpError(404, 'Not found')
    return reply.type(type).send(fs.readFileSync(full))
  })
}
