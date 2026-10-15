import type { DatabaseSync } from 'node:sqlite'

type CategorySeed = {
  id: number
  title: string
  description: string
  image: string
  alt: string
}

type ProductSeed = {
  id: number
  name: string
  priceCents: number
  rating: number
  image: string
  discount: number
  categoryId: number
  description: string
}

type OfferSeed = {
  id: number
  title: string
  description: string
  discount: string
  endDate: string
  code: string
  bgColor: string
  textColor: string
}

// Storefront copy matches src/data/catalog.js so the Vue page and the API stay in sync.
const categories: CategorySeed[] = [
  { id: 1, title: "Men's Collection", description: 'Bold & masculine scents', image: '8.png', alt: "Men's Collection" },
  { id: 2, title: "Women's Collection", description: 'Bold & masculine scents', image: '9.jpg', alt: "Women's Collection" },
  { id: 3, title: "Men's Collection", description: 'Bold & masculine scents', image: '10.jpg', alt: "Men's Collection" },
  { id: 4, title: "Women's Collection", description: 'Bold & masculine scents', image: '11.webp', alt: "Women's Collection" },
  { id: 5, title: "Men's Collection", description: 'Bold & masculine scents', image: '12.jpg', alt: "Men's Collection" },
]

const products: ProductSeed[] = [
  { id: 1, name: 'Floral', priceCents: 9999, rating: 4.5, image: '1.jpg', discount: 20, categoryId: 2, description: 'A soft floral perfume with a bright opening.' },
  { id: 2, name: 'Woody', priceCents: 19999, rating: 4.1, image: '2.jpg', discount: 13, categoryId: 1, description: 'Warm woody notes for a deeper signature scent.' },
  { id: 3, name: 'Oriental', priceCents: 8799, rating: 4.6, image: '3.webp', discount: 5, categoryId: 4, description: 'An oriental blend with spice and amber.' },
  { id: 4, name: 'Floral', priceCents: 9999, rating: 4.2, image: '4.webp', discount: 2, categoryId: 2, description: 'A lighter floral perfume for everyday wear.' },
  { id: 5, name: 'Floral', priceCents: 9399, rating: 3.7, image: '5.jpg', discount: 1, categoryId: 3, description: 'Fresh petals with a clean, green finish.' },
  { id: 6, name: 'Floral', priceCents: 29999, rating: 5, image: '6.jpg', discount: 6, categoryId: 4, description: 'A rich floral extrait with a long trail.' },
  { id: 7, name: 'Floral', priceCents: 4999, rating: 4, image: '7.jpg', discount: 12, categoryId: 5, description: 'An easy floral scent at a smaller size.' },
  { id: 8, name: 'Floral', priceCents: 6999, rating: 2.6, image: '8.png', discount: 16, categoryId: 1, description: 'A bright floral with a soft musky base.' },
]

const offers: OfferSeed[] = [
  {
    id: 1,
    title: 'Hot Summer Sale',
    description: 'Up to 30% off on our summer perfume collection',
    discount: '30%',
    endDate: '2026-08-31',
    code: 'SUMMER30',
    bgColor: 'bg-amber-200',
    textColor: 'text-amber-700',
  },
  {
    id: 2,
    title: 'Free perfume offer',
    description: 'Up to 30% off on our summer perfume collection',
    discount: 'Gift',
    endDate: '2026-08-31',
    code: 'FREEPERFUME',
    bgColor: 'bg-purple-200',
    textColor: 'text-purple-700',
  },
  {
    id: 3,
    title: 'New Launch Discount',
    description: 'Up to 30% off on our summer perfume collection',
    discount: '20%',
    endDate: '2026-08-31',
    code: 'NEW20',
    bgColor: 'bg-pink-200',
    textColor: 'text-pink-700',
  },
]

export function seed(db: DatabaseSync): void {
  const existing = db.prepare('SELECT COUNT(*) AS count FROM products').get() as { count: number }
  if (existing.count > 0) return

  const insertCategory = db.prepare(
    'INSERT INTO categories (id, title, description, image, alt) VALUES (?, ?, ?, ?, ?)',
  )
  const insertProduct = db.prepare(
    `INSERT INTO products
      (id, name, price_cents, rating, image, discount, category_id, description)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
  )
  const insertOffer = db.prepare(
    `INSERT INTO offers
      (id, title, description, discount, end_date, code, bg_color, text_color)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
  )

  db.exec('BEGIN')
  try {
    for (const category of categories) {
      insertCategory.run(category.id, category.title, category.description, category.image, category.alt)
    }
    for (const product of products) {
      insertProduct.run(
        product.id,
        product.name,
        product.priceCents,
        product.rating,
        product.image,
        product.discount,
        product.categoryId,
        product.description,
      )
    }
    for (const offer of offers) {
      insertOffer.run(
        offer.id,
        offer.title,
        offer.description,
        offer.discount,
        offer.endDate,
        offer.code,
        offer.bgColor,
        offer.textColor,
      )
    }
    db.exec('COMMIT')
  } catch (error) {
    db.exec('ROLLBACK')
    throw error
  }
}
