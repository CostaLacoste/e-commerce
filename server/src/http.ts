import { z } from 'zod'

export class HttpError extends Error {
  readonly statusCode: number

  constructor(statusCode: number, message: string) {
    super(message)
    this.name = 'HttpError'
    this.statusCode = statusCode
  }
}

export function parse<Schema extends z.ZodTypeAny>(schema: Schema, data: unknown): z.output<Schema> {
  const result = schema.safeParse(data)
  if (!result.success) {
    throw new HttpError(400, result.error.issues[0]?.message ?? 'Invalid request')
  }
  return result.data
}

export function todayISO(now = new Date()): string {
  return now.toISOString().slice(0, 10)
}
