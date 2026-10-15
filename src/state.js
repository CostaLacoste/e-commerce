import { reactive } from 'vue'

export const shop = reactive({
  query: '',
  cart: { items: [], count: 0, subtotal: 0 },
  wishlist: { items: [], count: 0 },
})

export function setCart(cart) {
  shop.cart = cart
}

export function setWishlist(wishlist) {
  shop.wishlist = wishlist
}

export function isWishlisted(productId) {
  return shop.wishlist.items.some((item) => item.productId === productId)
}
