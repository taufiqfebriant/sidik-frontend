<script setup lang="ts">
import { NuxtLink } from '#components';
import DataTable from '@/components/DataTable.vue';
import { useQuery, useQueryClient } from '@tanstack/vue-query';
import type { ColumnDef } from '@tanstack/vue-table';
import { h, ref } from 'vue';
import Button from '~/components/ui/button/Button.vue';

interface Product {
  id: number
  name: string
  description: string
  price: number
  image: string | null
  created_at: string
  updated_at: string
}

const columns: ColumnDef<Product>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
    cell: ({ row }) => h('div', {}, row.getValue('name')),
  },
  {
    accessorKey: 'description',
    header: 'Description',
    cell: ({ row }) => h('div', {}, row.getValue('description')),
  },
  {
    accessorKey: 'price',
    header: 'Price',
    cell: ({ row }) => {
      return h('div', {}, `Rp ${new Intl.NumberFormat().format(row.original.price)}`);
    },
  },
  {
    accessorKey: 'image',
    header: 'Image',
    cell: ({ row }) => {
      const imageUrl = row.getValue('image');
      if (!imageUrl) {
        return ''
      }

      return h('img', { src: imageUrl ?? '', alt: row.getValue('name'), class: 'w-16 h-16 object-cover' });
    },
  },
  {
    accessorKey: 'actions',
    header: 'Actions',
    cell: ({ row }) => h('div', { class: 'flex gap-2' }, [
      h(NuxtLink, {
        to: `/admin/products/${row.original.id}/edit`,
        class: 'px-3 py-1 bg-yellow-500 text-white rounded'
      }, 'Edit'),
      h('button', {
        class: 'px-3 py-1 bg-red-600 text-white rounded',
        onClick: () => handleDelete(row.original.id)
      }, 'Delete')
    ]),
  },
];

const queryClient = useQueryClient();

const handleDelete = async (id: number) => {
  if (!confirm('Are you sure you want to delete this product?')) return;

  try {
    await api.delete(`api/v1/products/${id}`);
    await queryClient.invalidateQueries();
  } catch (error) {
    alert('Failed to delete product');
  }
};


const page = ref(1);

type Root = {
  message: string;
  data: {
    current_page: number;
    data: Product[];
    total: number;
    last_page: number;
  };
};

const fetchProducts = async (page: number) => {
  try {
    const response = await api.get('api/v1/products', {
      searchParams: {
        per_page: 10,
        page: page,
      },
    }).json<Root>();

    return response.data;
  } catch (error) {
    throw new Error('Error fetching products');
  }
};

const {
  data: productsData,
  suspense
} = useQuery({
  queryKey: ['products', page],
  queryFn: () => fetchProducts(page.value),
});

onServerPrefetch(async () => {
  await suspense()
})
</script>

<template>
  <div class="flex items-center justify-between">
    <h1 class="text-4xl font-bold">Products</h1>
    <Button as-child>
      <NuxtLink to="/admin/products/create">
        Add Product
      </NuxtLink>
    </Button>
  </div>

  <DataTable v-if="productsData?.data" :columns="columns" :data="productsData?.data ?? []" class="mt-6" />
</template>
