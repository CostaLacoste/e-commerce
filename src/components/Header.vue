<template>
    <header class="sticky top-0 z-50 transition-all duration-300">
        <section :class="['relative z-20 w-full', isScrolled ? 'bg-gray-100/95 backdrop-blur shadow-md py-2' : 'bg-gray-100 py-4']">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="flex flex-col md:flex-row items-center justify-between gap-3 md:gap-6">
                    <div class="flex justify-between items-center w-full md:w-auto">
                        <a href="/" class="text-2xl font-bold text-pink-600">ShopEase</a>
                        <button class="md:hidden text-gray-700 hover:text-indigo-600" aria-label="Toggle mobile menu" @click="isMobileMenuOpen = !isMobileMenuOpen">
                            <Icon icon="mdi:menu" class="h-6 w-6"/>
                        </button>
                    </div>
                    <form class="w-full md:flex-1 max-w-sm" role="search" aria-label="Site search" @submit.prevent="submitSearch">
                        <label class="relative w-full">
                            <input id="search" name="q" v-model="query" type="search" aria-label="Search" placeholder="Search..." class="w-full px-3 py-2 text-xs border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500">
                            <button type="submit" class="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-indigo-600" aria-label="Search button">
                                <Icon icon="mdi:magnify" class="w-4 h-4"/>
                            </button>
                        </label>
                    </form>
                    <aside class="flex items-center justify-end space-x-4 w-full md:w-auto">
                        <div class="relative">
                            <button type="button" class="relative p-2 text-gray-700 hover:text-pink-600" aria-label="Wishlist" :aria-expanded="wishlistOpen" @click="togglePanel('wishlist')">
                                <Icon icon="mdi:heart-outline" class="w-5 h-5"/>
                                <span v-if="shop.wishlist.count > 0" class="absolute -top-1 -right-1 bg-pink-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center" aria-live="polite">{{ shop.wishlist.count }}</span>
                            </button>
                            <div v-if="wishlistOpen" class="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg border border-gray-100 p-4 z-50">
                                <h2 class="font-semibold text-gray-900 mb-3">Wishlist</h2>
                                <p v-if="shop.wishlist.items.length === 0" class="text-sm text-gray-600">No saved perfumes yet.</p>
                                <ul v-else class="space-y-3">
                                    <li v-for="item in shop.wishlist.items" :key="item.productId" class="flex items-center justify-between gap-3 text-sm">
                                        <span class="text-gray-800">{{ item.product.name }}</span>
                                        <button type="button" class="text-pink-700 hover:text-pink-900" @click="removeSaved(item.productId)">Remove</button>
                                    </li>
                                </ul>
                            </div>
                        </div>
                        <div class="relative">
                            <button type="button" class="relative p-2 text-gray-700 hover:text-pink-600" aria-label="Cart" :aria-expanded="cartOpen" @click="togglePanel('cart')">
                                <Icon icon="mdi:cart-outline" class="w-5 h-5"/>
                                <span v-if="shop.cart.count > 0" class="absolute -top-1 -right-1 bg-pink-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center" aria-live="polite">{{ shop.cart.count }}</span>
                            </button>
                            <div v-if="cartOpen" class="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-100 p-4 z-50">
                                <h2 class="font-semibold text-gray-900 mb-3">Cart</h2>
                                <p v-if="shop.cart.items.length === 0" class="text-sm text-gray-600">Your cart is empty.</p>
                                <ul v-else class="space-y-3">
                                    <li v-for="item in shop.cart.items" :key="item.productId" class="flex items-start justify-between gap-3 text-sm">
                                        <div>
                                            <p class="text-gray-800 font-medium">{{ item.product.name }}</p>
                                            <p class="text-gray-500">Qty {{ item.quantity }} · ${{ item.lineTotal.toFixed(2) }}</p>
                                        </div>
                                        <button type="button" class="text-pink-700 hover:text-pink-900" @click="removeItem(item.productId)">Remove</button>
                                    </li>
                                </ul>
                                <p v-if="shop.cart.items.length" class="mt-4 pt-3 border-t border-gray-100 font-semibold text-gray-900">Subtotal ${{ shop.cart.subtotal.toFixed(2) }}</p>
                            </div>
                        </div>
                        <button type="button" class="relative p-2 text-gray-700 hover:text-pink-600" aria-label="Account">
                            <Icon icon="mdi:account-outline" class="w-5 h-5"/>
                        </button>
                    </aside>
                </div>
            </div>
        </section>
        <nav class="relative z-10 bg-pink-950" aria-label="Main navigation">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <ul class="hidden md:flex justify-center py-3 flex-wrap gap-x-6 text-sm font-medium text-white">
                    <li v-for="item in navItems" :key="item.id">
                        <a :href="item.link" class="hover:text-pink-300 transition-colors">{{item.name}}</a>
                    </li>
                    <section v-if="isMobileMenuOpen" class="md:hidden mt-2 bg-white rounded-lg shadow-md p-4 space-y-3 text-[#5D4037] text-center" aria-label="Mobile navigation">
                        <a v-for="item in navItems" :href="item.link" :key="item.id" class="block hover:text-amber-600 text-sm font-medium">{{item.name}}</a>
                    </section>
                </ul>
            </div>
        </nav>
    </header>
</template>
<script setup>
import {ref, onMounted, onUnmounted} from 'vue'
import {refreshSession, removeFromCart, removeFromWishlist} from '../api'
import {shop} from '../state'

const isScrolled = ref(false)
const isMobileMenuOpen = ref(false)
const query = ref('')
const cartOpen = ref(false)
const wishlistOpen = ref(false)

const submitSearch = () => {
    shop.query = query.value.trim()
    document.getElementById('products')?.scrollIntoView({behavior: 'smooth'})
}

const togglePanel = (panel) => {
    cartOpen.value = panel === 'cart' ? !cartOpen.value : false
    wishlistOpen.value = panel === 'wishlist' ? !wishlistOpen.value : false
}

const removeItem = async (productId) => {
    try {
        await removeFromCart(productId)
    } catch {
        // Keep the open cart as it was when the API is unreachable.
    }
}

const removeSaved = async (productId) => {
    try {
        await removeFromWishlist(productId)
    } catch {
        // Keep the open wishlist as it was when the API is unreachable.
    }
}
const navItems = [
    {id: 1, name: 'Home', link: '#home'},
    {id: 2, name: 'Products', link: '#products'},
    {id: 3, name: 'Categories', link: '#categories'},
    {id: 4, name: 'Offers', link: '#offers'},
    {id: 5, name: 'About', link: '#about'},
    {id: 6, name: 'Contact', link: '#contact'},
]

const handleScroll = () => {
    isScrolled.value = window.scrollY > 10
}

onMounted(() => {
    window.addEventListener('scroll', handleScroll)
    refreshSession().catch(() => {
        // Badges stay empty when the API is offline.
    })
})

onUnmounted(() => {
    window.removeEventListener('scroll', handleScroll)
})
</script>