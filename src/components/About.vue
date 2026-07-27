<template>
    <div id="about" class="min-h-screen scroll-mt-20 bg-linear-to-b from-gray-50 to-white py-12 px-4 sm:px-6 lg:px-8">
        <div class="max-w-7xl mx-auto">
            <div class="flex flex-col lg:flex-row gap-12 mb-20">
                <div class="lg:w-1/2">
                    <div class="relative rounded-2xl overflow-hidden h-96 shadow-xl">
                        <img :src="product1" alt="Luxury perfumes" class="w-full h-full object-cover">
                        <div class="absolute inset-0 bg-linear-to-t from-black to-transparent opacity-50"></div>
                        <div class="absolute bottom-0 left-0 p-6 text-white">
                            <h3 class="text-2xl font-bold">Since 1950</h3>
                            <p class="mt-2">Crafting perfumes with passion</p>
                        </div>
                    </div>
                </div>
                <div class="lg:w-1/2 flex flex-col justify-center">
                    <h2 class="text-4xl font-bold text-amber-900 mb-6">About Us</h2>
                    <p class="text-lg text-gray-600 mb-4">
                        Lorem ipsum dolor sit amet, consectetur adipisicing elit. 
                        Nostrum velit, ipsam quas nulla, veniam ducimus voluptatibus quasi ad maxime perferendis fugiat corporis. 
                        Sint, amet ullam consectetur temporibus vitae obcaecati accusantium?
                    </p>
                    <div class="grid grid-cols-2 gap-4 mt-4">
                        <div class="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                            <h4 class="font-semibold text-pink-600">500+</h4>
                            <p class="text-gray-600">Unique fragranses</p>
                        </div>
                        <div class="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                            <h4 class="font-semibold text-pink-600">50+</h4>
                            <p class="text-gray-600">Customers worldwide</p>
                        </div>
                        <div class="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                            <h4 class="font-semibold text-pink-600">100+</h4>
                            <p class="text-gray-600">Customers satifaction</p>
                        </div>
                        <div class="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                            <h4 class="font-semibold text-pink-600">24/7</h4>
                            <p class="text-gray-600">Customer support</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<script setup>
import product1 from '../assets/1.jpg'
</script>