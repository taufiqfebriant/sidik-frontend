<script setup lang="ts">
import { useMutation, useQuery } from '@tanstack/vue-query';
import { useRoute } from 'vue-router';

const route = useRoute();
const productId = route.params.id;

export interface Root {
  message: string
  data: Data
}

export interface Data {
  id: number
  name: string
  description: string
  price: number
  image: string | null
  created_at: string
  updated_at: string
}

const fetchProduct = async (id: number) => {
  const response = await api.get(`api/v1/products/${id}`).json<Root>();
  return response.data;
};

const {
  isPending,
  isError,
  data: product,
} = useQuery({
  queryKey: ['product', productId],
  queryFn: () => fetchProduct(Number(productId)),
});

const { mutate, isPending: addToCartIsPending } = useMutation({
  mutationFn: async (product: Data) => {
    const response = await api.post('api/v1/carts', {
      json: {
        product_id: product.id,
        quantity: 1,
      }
    });
    return response.json();
  },
  onSuccess: (data) => {
  },
  onError: (error) => {
    console.error('Error adding product to cart:', error);
  },
});

const addToCart = (product: Data) => {
  mutate(product);
}
</script>

<template>
  <div v-if="isPending" class="text-center">Loading...</div>

  <div v-else-if="isError" class="text-center text-red-500">
    Error
  </div>

  <div v-else class="flex flex-col md:flex-row md:gap-x-6" v-if="product">
    <div class="w-full md:w-72 md:h-72">
      <NuxtImg :src="product.image" v-if="product.image" :alt="product.name"
        class="w-full h-auto rounded-lg shadow-lg" />
    </div>

    <div class="flex-1">
      <div class="flex">
        <h1 class="text-3xl font-semibold flex-1">{{ product.name }}</h1>
        <Button class="flex-shrink-0" @click="addToCart(product)">
          {{ addToCartIsPending ? "Adding to Cart..." : "Add to Cart" }}
        </Button>
      </div>

      <p class="text-sm mt-2 text-gray-600">{{ product.description }}</p>

      <p class="font-semibold text-xl mt-4">
        Rp {{ product.price.toLocaleString('id-ID', { style: 'decimal' }) }}
      </p>
    </div>
  </div>
</template>
