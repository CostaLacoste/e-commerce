<template>
    <section class="py-12 scroll-mt-20 bg-gray-50" id="products">
        <main class="container mx-auto px-4">
            <header class="flex justify-between items-center mb-8">
                <h2 class="md:text-3xl text-2xl font-bold text-amber-900">Featured Products</h2>
                <nav class="flex space-x-4" aria-label="Product carousel controls">
                    <button @click="previousSlide" class="p-2 rounded-full bg-white shadow-md hover:bg-pink-100 text-pink-600 transition-colors" aria-label="Previous slide">
                        <Icon icon="line-md:arrow-small-left" width="24" height="24"/>
                    </button>
                    <button @click="nextSlide" class="p-2 rounded-full bg-white shadow-md hover:bg-pink-100 text-pink-600 transition-colors" aria-label="Next slide">
                        <Icon icon="line-md:arrow-small-right" width="24" height="24"/>
                    </button>
                </nav>
            </header>
            <section class="relative overflow-hidden">
                <ul class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    <li v-for="product in visibleProducts" :key="product.id"
                    class="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:scale-105">
                        <article>
                            <figure class="relative">
                                <img :src="product.image" :alt="product.name" class="w-full h-64 object-cover" />
                                <figcaption v-if="product.discount > 0" class="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">-{{ product.discount }}%</figcaption>
                                <button type="button" class="absolute top-3 left-3 p-2 bg-white rounded-full shadow-md hover:bg-pink-100" :class="isWishlisted(product.id) ? 'text-pink-600' : 'text-gray-700'" :aria-pressed="isWishlisted(product.id)" :aria-label="isWishlisted(product.id) ? 'Remove from wishlist' : 'Add to wishlist'" @click="toggleWishlist(product)">
                                    <Icon icon="line-md:heart" width="18" height="18"/>
                                </button>
                            </figure>
                            <section class="p-4">
                                <div class="flex items-center mb-2">
                                    <Icon v-for="i in 5" :key="i" icon="line-md:star-alt-filled" width="16" height="16" :class="i <= Math.floor(product.rating) ? 'text-yellow-400' : 'text-gray-300'"/>
                                    <span class="text-sm text-gray-500 ml-1">({{ product.rating }})</span>
                                </div>
                                <h3 class="text-lg text-gray-800 font-semibold mb-1">{{ product.name }}</h3>
                                <footer class="flex items-center justify-between">
                                    <div>
                                        <span class="text-lg font-bold text-pink-600">
                                            ${{ (product.price * (1-product.discount/100)).toFixed(2) }}
                                        </span>
                                        <span v-if="product.discount > 0" class="text-sm text-gray-500 line-through ml-2">
                                            ${{ product.price.toFixed(2) }}
                                        </span>
                                    </div>
                                    <button type="button" class="p-2 bg-pink-950 rounded-full text-white hover:bg-pink-700 transition-colors" aria-label="Add to cart" @click="addToCart(product)">
                                        <Icon icon="icon-park-solid:shopping" width="18" height="18"/>
                                    </button>
                                </footer>
                            </section>
                        </article>
                    </li>
                </ul>
            </section>
            <p v-if="shop.query && filteredProducts.length === 0" class="text-center text-gray-600 py-8">No products match your search.</p>
            <nav class="flex justify-center mt-6 space-x-2" aria-label="Carousel pagination">
                <button v-for="index in totalSlides" :key="index" @click="currentSlide = index - 1" :class="['w-3 h-3 rounded-full', currentSlide === index - 1 ? 'bg-pink-950' : 'bg-gray-400']" />
            </nav>
        </main>
    </section>
</template>
<script setup>
import {ref, computed, onMounted, onBeforeUnmount, watch} from 'vue'
import {addToCart as saveCartItem, addToWishlist, fetchProducts, removeFromWishlist} from '../api'
import {defaultProducts} from '../data/catalog'
import {isWishlisted, shop} from '../state'

const currentSlide = ref(0);
const productsPerPage = ref(4);
const products = ref(defaultProducts);

const filteredProducts = computed(() => {
    const query = shop.query.trim().toLowerCase();
    if (!query) return products.value;
    return products.value.filter((product) => {
        const description = product.description?.toLowerCase() ?? '';
        return product.name.toLowerCase().includes(query) || description.includes(query);
    });
});

const totalSlides = computed(() => Math.ceil(filteredProducts.value.length / productsPerPage.value));
const visibleProducts = computed(() => {
    const start = currentSlide.value * productsPerPage.value;
    return filteredProducts.value.slice(start, start + productsPerPage.value);
})

watch(() => shop.query, () => {
    currentSlide.value = 0;
})

const nextSlide = () => {
    if (totalSlides.value < 1) return;
    currentSlide.value = currentSlide.value === totalSlides.value -1 ? 0 : currentSlide.value + 1;
}

const previousSlide = () => {
    if (totalSlides.value < 1) return;
    currentSlide.value = currentSlide.value === 0 ? totalSlides.value - 1 : currentSlide.value - 1;
}

const addToCart = async (product) => {
    try {
        await saveCartItem(product.id);
    } catch {
        // The badge stays unchanged when the API is unreachable.
    }
}

const toggleWishlist = async (product) => {
    try {
        if (isWishlisted(product.id)) {
            await removeFromWishlist(product.id);
        } else {
            await addToWishlist(product.id);
        }
    } catch {
        // The heart stays unchanged when the API is unreachable.
    }
}

const handleResize = () => {
    if (window.innerWidth < 640) {
        productsPerPage.value = 1
    } else if (window.innerWidth < 768) {
        productsPerPage.value = 2
    } else if (window.innerWidth < 1024) {
        productsPerPage.value = 3
    } else {
        productsPerPage.value = 4
    }
}

onMounted(async () => {
    handleResize();
    window.addEventListener('resize', handleResize);
    try {
        const remote = await fetchProducts();
        if (remote?.length) products.value = remote;
    } catch {
        // Keep the bundled catalog when the API is offline.
    }
})

onBeforeUnmount(() => {
    window.removeEventListener('resize', handleResize);
})
</script>