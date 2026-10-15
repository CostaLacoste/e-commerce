import path from 'node:path'
import { fileURLToPath } from 'node:url'

const srcDir = path.dirname(fileURLToPath(import.meta.url))

export function databasePath(): string {
  return process.env.DB_PATH ?? path.join(srcDir, '../data/shop.db')
}

export function assetsPath(): string {
  return path.resolve(srcDir, '../../src/assets')
}
