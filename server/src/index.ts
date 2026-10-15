import { buildApp } from './app.js'
import { migrate, openDatabase } from './db.js'
import { databasePath } from './paths.js'
import { seed } from './seed.js'

const port = Number(process.env.PORT ?? 3001)
const host = process.env.HOST ?? '0.0.0.0'
const db = openDatabase(databasePath())

migrate(db)
seed(db)

const app = await buildApp(db, { logger: true })

const shutdown = async () => {
  await app.close()
  db.close()
}

process.on('SIGINT', () => {
  void shutdown().then(() => process.exit(0))
})
process.on('SIGTERM', () => {
  void shutdown().then(() => process.exit(0))
})

await app.listen({ port, host })
