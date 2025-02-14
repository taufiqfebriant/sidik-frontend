<script setup lang="ts">
import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useMutation, useQueryClient } from "@tanstack/vue-query";
import { toTypedSchema } from "@vee-validate/zod";
import { useForm } from "vee-validate";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(1),
  description: z.string(),
  price: z
    .string()
    .refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
      message: 'Price must be a positive number',
    }),
  image: z
    .instanceof(File)
    .refine((file) => !file || ['image/jpeg', 'image/png', 'image/jpg', 'image/gif'].includes(file.type), {
      message: 'Image must be a jpeg, png, jpg, or gif file',
    })
    .refine((file) => !file || file.size <= 2048 * 1024, {
      message: 'Image must be smaller than 2MB',
    })
    .optional(),
})

type Schema = z.infer<typeof schema>

const form = useForm({
  validationSchema: toTypedSchema(schema),
});

const router = useRouter();
const queryClient = useQueryClient();

const showAlert = ref(false);

const { isPending, mutate } = useMutation({
  mutationFn: async (values: Schema) => {
    const formData = new FormData();

    formData.append('name', values.name);
    formData.append('description', values.description);
    formData.append('price', values.price);

    if (values.image) {
      formData.append('image', values.image);
    }

    const response = await api.post('api/v1/products', {
      body: formData,
    });

    return response.json();
  },
  onSuccess: async () => {
    await queryClient.invalidateQueries();
    router.push("/admin");
  },
  onError: () => {
    showAlert.value = true;
  },
});


const onSubmit = form.handleSubmit((values) => {
  mutate(values);
});
</script>

<template>
  <h1 class="text-4xl font-bold">Add Product</h1>
  <form @submit="onSubmit" class="grid gap-4 mt-6">
    <FormField v-slot="{ componentField }" name="name">
      <FormItem>
        <FormLabel>Name</FormLabel>
        <FormControl>
          <Input type="text" v-bind="componentField" />
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>

    <FormField v-slot="{ componentField }" name="description">
      <FormItem>
        <FormLabel>Description</FormLabel>
        <FormControl>
          <Textarea v-bind="componentField" />
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>

    <FormField v-slot="{ componentField }" name="price">
      <FormItem>
        <FormLabel>Price</FormLabel>
        <div class="flex">
          <div class="border border-r-0 w-12 rounded rounded-r-none flex items-center justify-center">Rp</div>
          <FormControl>
            <Input type="text" v-bind="componentField" class="rounded-l-none" />
          </FormControl>
        </div>
        <FormMessage />
      </FormItem>
    </FormField>

    <FormField v-slot="{ handleChange, handleBlur }" name="image">
      <FormItem>
        <FormLabel>Image</FormLabel>
        <FormControl>
          <Input type="file" @change="handleChange" @blur="handleBlur" />
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>

    <div class="flex justify-between">
      <Button as-child variant="outline">
        <NuxtLink to="/admin">
          Cancel
        </NuxtLink>
      </Button>

      <Button type="submit" :disabled="isPending">
        {{ isPending ? "Adding..." : "Add" }}
      </Button>
    </div>
  </form>
</template>