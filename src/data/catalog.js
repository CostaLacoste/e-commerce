import image1 from '../assets/1.jpg'
import image2 from '../assets/2.jpg'
import image3 from '../assets/3.webp'
import image4 from '../assets/4.webp'
import image5 from '../assets/5.jpg'
import image6 from '../assets/6.jpg'
import image7 from '../assets/7.jpg'
import image8 from '../assets/8.png'
import image9 from '../assets/9.jpg'
import image10 from '../assets/10.jpg'
import image11 from '../assets/11.webp'
import image12 from '../assets/12.jpg'

const images = {
  '1.jpg': image1,
  '2.jpg': image2,
  '3.webp': image3,
  '4.webp': image4,
  '5.jpg': image5,
  '6.jpg': image6,
  '7.jpg': image7,
  '8.png': image8,
  '9.jpg': image9,
  '10.jpg': image10,
  '11.webp': image11,
  '12.jpg': image12,
}

// These literals stay in the frontend source so Tailwind emits the offer colors.
export const offerColorClasses = [
  'bg-amber-200',
  'text-amber-700',
  'border-amber-700',
  'bg-purple-200',
  'text-purple-700',
  'border-purple-700',
  'bg-pink-200',
  'text-pink-700',
  'border-pink-700',
]

export function resolveImage(image) {
  if (!image) return image
  const filename = String(image).split('/').pop()
  return images[filename] ?? image
}

export function hydrateProduct(product) {
  return {
    ...product,
    image: resolveImage(product.image),
  }
}

export function hydrateCategory(category) {
  return {
    ...category,
    image: resolveImage(category.image),
  }
}

export const defaultProducts = [
  { id: 1, name: 'Floral', price: 99.99, rating: 4.5, image: image1, discount: 20 },
  { id: 2, name: 'Woody', price: 199.99, rating: 4.1, image: image2, discount: 13 },
  { id: 3, name: 'Oriental', price: 87.99, rating: 4.6, image: image3, discount: 5 },
  { id: 4, name: 'Floral', price: 99.99, rating: 4.2, image: image4, discount: 2 },
  { id: 5, name: 'Floral', price: 93.99, rating: 3.7, image: image5, discount: 1 },
  { id: 6, name: 'Floral', price: 299.99, rating: 5.0, image: image6, discount: 6 },
  { id: 7, name: 'Floral', price: 49.99, rating: 4.0, image: image7, discount: 12 },
  { id: 8, name: 'Floral', price: 69.99, rating: 2.6, image: image8, discount: 16 },
]

export const defaultCategories = [
  { id: 1, image: image8, title: "Men's Collection", description: 'Bold & masculine scents', alt: "Men's Collection" },
  { id: 2, image: image9, title: "Women's Collection", description: 'Bold & masculine scents', alt: "Women's Collection" },
  { id: 3, image: image10, title: "Men's Collection", description: 'Bold & masculine scents', alt: "Men's Collection" },
  { id: 4, image: image11, title: "Women's Collection", description: 'Bold & masculine scents', alt: "Women's Collection" },
  { id: 5, image: image12, title: "Men's Collection", description: 'Bold & masculine scents', alt: "Men's Collection" },
]

export const defaultOffers = [
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
