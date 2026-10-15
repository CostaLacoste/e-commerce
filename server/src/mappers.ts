import { priceFromCents, lineTotalCents } from './money.js'
import { todayISO } from './http.js'

export type ProductRow = {
  id: number
  name: string
  price_cents: number
  rating: number
  image: string
  discount: number
  category_id: number | null
  description: string
}

export type CategoryRow = {
  id: number
  title: string
  description: string
  image: string
  alt: string
}

export type OfferRow = {
  id: number
  title: string
  description: string
  discount: string
  end_date: string
  code: string
  bg_color: string
  text_color: string
}

export type CartJoinRow = ProductRow & { quantity: number }

export function toProduct(row: ProductRow) {
  return {
    id: row.id,
    name: row.name,
    price: priceFromCents(row.price_cents),
    rating: row.rating,
    image: row.image,
    discount: row.discount,
    categoryId: row.category_id,
    description: row.description,
  }
}

export function toCategory(row: CategoryRow) {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    image: row.image,
    alt: row.alt,
  }
}

export function toOffer(row: OfferRow, today = todayISO()) {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    discount: row.discount,
    endDate: row.end_date,
    code: row.code,
    bgColor: row.bg_color,
    textColor: row.text_color,
    active: row.end_date >= today,
  }
}

export function toCart(rows: CartJoinRow[]) {
  let count = 0
  let subtotalCents = 0
  const items = rows.map((row) => {
    count += row.quantity
    const lineCents = lineTotalCents(row.price_cents, row.discount, row.quantity)
    subtotalCents += lineCents
    return {
      productId: row.id,
      quantity: row.quantity,
      lineTotal: priceFromCents(lineCents),
      product: toProduct(row),
    }
  })
  return {
    items,
    count,
    subtotal: priceFromCents(subtotalCents),
  }
}
