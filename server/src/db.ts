import fs from 'node:fs'
import path from 'node:path'
import { DatabaseSync } from 'node:sqlite'

const SCHEMA = `
CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  image TEXT NOT NULL,
  alt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  price_cents INTEGER NOT NULL CHECK (price_cents >= 0),
  rating REAL NOT NULL CHECK (rating >= 0 AND rating <= 5),
  image TEXT NOT NULL,
  discount INTEGER NOT NULL DEFAULT 0 CHECK (discount >= 0 AND discount <= 100),
  category_id INTEGER REFERENCES categories(id),
  description TEXT NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS offers (
  id INTEGER PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  discount TEXT NOT NULL,
  end_date TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE COLLATE NOCASE,
  bg_color TEXT NOT NULL,
  text_color TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS messages (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS carts (
  id TEXT PRIMARY KEY,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS cart_items (
  cart_id TEXT NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL REFERENCES products(id),
  quantity INTEGER NOT NULL CHECK (quantity > 0 AND quantity <= 99),
  PRIMARY KEY (cart_id, product_id)
);

CREATE TABLE IF NOT EXISTS wishlists (
  id TEXT PRIMARY KEY,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS wishlist_items (
  wishlist_id TEXT NOT NULL REFERENCES wishlists(id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL REFERENCES products(id),
  PRIMARY KEY (wishlist_id, product_id)
);

CREATE TABLE IF NOT EXISTS offer_claims (
  id INTEGER PRIMARY KEY,
  offer_id INTEGER NOT NULL REFERENCES offers(id),
  cart_id TEXT NOT NULL,
  created_at TEXT NOT NULL,
  UNIQUE (offer_id, cart_id)
);
`

export function openDatabase(filename: string): DatabaseSync {
  if (filename !== ':memory:') {
    fs.mkdirSync(path.dirname(filename), { recursive: true })
  }
  const db = new DatabaseSync(filename)
  db.exec('PRAGMA foreign_keys = ON')
  db.exec('PRAGMA journal_mode = WAL')
  return db
}

export function migrate(db: DatabaseSync): void {
  db.exec('PRAGMA foreign_keys = ON')
  db.exec(SCHEMA)
}
