<script setup lang="ts">
import { useQuery } from '@tanstack/vue-query'
import { ref } from 'vue'
import { Button } from '~/components/ui/button'
import { Card } from '~/components/ui/card'

const page = ref(1)

type Product = {
  id: number
  name: string
  description: string
  price: number
  image: string
  created_at: string
  updated_at: string
}

type Link = {
  url?: string
  label: string
  active: boolean
}

type Data = {
  current_page: number
  data: Product[]
  first_page_url: string
  from: number
  last_page: number
  last_page_url: string
  links: Link[]
  next_page_url: any
  path: string
  per_page: number
  prev_page_url: any
  to: number
  total: number
}

type Root = {
  message: string
  data: Data
}

const fetchProducts = async (page: number) => {
  try {
    const response = await api.get(`api/v1/products`, {
      searchParams: {
        per_page: 10,
        page: page,
      },
    }).json<Root>();

    return response;
  } catch (error) {
    throw new Error('Error fetching products');
  }
}

const {
  data,
  suspense
} = useQuery({
  queryKey: ['products', page],
  queryFn: () => fetchProducts(page.value),
})

onServerPrefetch(async () => {
  await suspense()
})

const fetchPage = (pageNumber: Data['current_page']) => {
  page.value = pageNumber
}
</script>

<template>
  <div>
    <h1 class="text-4xl font-bold">Products</h1>

    <template v-if="data?.data?.data?.length">
      <div class="mt-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-x-4 gap-y-10">
        <NuxtLink v-for="product in data.data.data" :key="product.id" :to="{ name: 'id', params: { id: product.id } }">
          <Card>
            <div class="h-48 w-full rounded bg-[#eef0f2] flex items-center justify-center">
              <div class="h-32 w-32 relative">
                <img :src="product.image" :alt="product.name" class="object-cover" />
              </div>
            </div>

            <div class="flex items-start px-2 py-4">
              <div class="flex-1">
                <p class="text-sm">{{ product.name }}</p>
                <p class="font-semibold">
                  Rp
                  {{ product.price.toLocaleString('id-ID', { style: 'decimal' }) }}
                </p>
              </div>
            </div>
          </Card>
        </NuxtLink>
      </div>

      <div class="flex justify-between mt-10">
        <Button :disabled="data.data.current_page === 1" @click="fetchPage(data.data.current_page - 1)">
          Previous
        </Button>

        <Button :disabled="data.data.current_page === data.data.last_page"
          @click="fetchPage(data.data.current_page + 1)">
          Next
        </Button>
      </div>
    </template>
    <template v-else>
      <p class="text-center mt-10">No products found</p>
    </template>
  </div>
</template>
