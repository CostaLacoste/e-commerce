<template>
    <section id="categories" class="py-16 scroll-mt-20 bg-white">
        <div class="container mx-auto px-4">
            <div class="text-center mb-12">
                <h2 class="text-3xl font-bold text-amber-950">Explore Our Frangnance Collections</h2>
                <p class="text-lg text-gray-800 max-w-2xl mx-auto">
                    Discover scents that match your personality
                </p>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <div v-for="category in categories" :key="category.id" class="relative group overflow-hidden rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
                    <div class="h-64 overflow-hidden">
                        <img :src="category.image" :alt="category.alt" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
                    </div>
                    <div class="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent">
                        <div class="absolute bottom-0 left-0 p-6">
                            <h3 class="text-xl font-semibold text-white">{{ category.title }}</h3>
                            <p class="text-gray-200 mt-1">{{ category.description }}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
</template>
<script setup>
import {onMounted, ref} from 'vue'
import {fetchCategories} from '../api'
import {defaultCategories} from '../data/catalog'

const categories = ref(defaultCategories)

onMounted(async () => {
    try {
        const remote = await fetchCategories()
        if (remote?.length) categories.value = remote
    } catch {
        // Keep the bundled categories when the API is offline.
    }
})
</script>