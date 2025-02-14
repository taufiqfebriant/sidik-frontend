<script setup lang="ts">
import DataTable from '@/components/DataTable.vue';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  NumberField,
  NumberFieldContent,
  NumberFieldDecrement,
  NumberFieldIncrement,
  NumberFieldInput,
} from '@/components/ui/number-field';
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query';
import type { ColumnDef } from '@tanstack/vue-table';
import { h, ref } from 'vue';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string | null;
  created_at: string;
  updated_at: string;
}

interface CartItem {
  id: number;
  user_id: number;
  product_id: number;
  quantity: number;
  product: Product;
  created_at: string;
  updated_at: string;
}

type CartResponse = {
  message: string;
  data: CartItem[];
};

const queryClient = useQueryClient();

// Fetch cart items
const { data: cartData, suspense } = useQuery({
  queryKey: ['carts'],
  queryFn: async () => {
    const response = await api.get('api/v1/carts').json<CartResponse>();
    return response.data;
  },
});

// Mutation to update cart item quantity
const { mutate: updateQuantity } = useMutation({
  mutationFn: async ({ id, quantity }: { id: number; quantity: number }) => {
    await api.patch(`api/v1/carts/${id}`, { json: { quantity } });
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['carts'] });
  },
});

// Mutation to delete cart item
const { mutate: deleteCartItem } = useMutation({
  mutationFn: async (id: number) => {
    await api.delete(`api/v1/carts/${id}`);
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['carts'] });
  },
});

// Column definitions
const columns: ColumnDef<CartItem>[] = [
  {
    accessorKey: 'product.name',
    header: 'Product',
    cell: ({ row }) => h('div', row.original.product.name),
  },
  {
    accessorKey: 'product.price',
    header: 'Price',
    cell: ({ row }) =>
      h('div', `Rp ${row.original.product.price.toLocaleString()}`),
  },
  {
    accessorKey: 'quantity',
    header: 'Quantity',
    cell: ({ row }) => {
      const quantity = ref(row.original.quantity);

      const updateCartQuantity = (newQuantity: number) => {
        if (newQuantity >= 1) {
          quantity.value = newQuantity;
          updateQuantity({ id: row.original.id, quantity: newQuantity });
        }
      };

      return h(
        NumberField,
        {
          min: 1,
          modelValue: quantity.value,
          'onUpdate:modelValue': (val: number) => updateCartQuantity(val),
        },
        {
          default: () => [
            h(Label, { for: `quantity-${row.original.id}` }, 'Qty'),
            h(NumberFieldContent, {}, [
              h(NumberFieldDecrement, {
                onClick: () => updateCartQuantity(quantity.value - 1),
              }),
              h(NumberFieldInput, { id: `quantity-${row.original.id}` }),
              h(NumberFieldIncrement, {
                onClick: () => updateCartQuantity(quantity.value + 1),
              }),
            ]),
          ],
        }
      );
    },
  },
  {
    accessorKey: 'actions',
    header: 'Actions',
    cell: ({ row }) =>
      h(
        Button,
        {
          variant: 'destructive',
          onClick: () => deleteCartItem(row.original.id),
        },
        'Remove'
      ),
  },
];
</script>

<template>
  <h1 class="text-2xl font-bold mb-4">Your Cart</h1>

  <Suspense>
    <template #default>
      <DataTable v-if="cartData" :columns="columns" :data="cartData" />
    </template>
    <template #fallback>
      <p>Loading cart items...</p>
    </template>
  </Suspense>
</template>
