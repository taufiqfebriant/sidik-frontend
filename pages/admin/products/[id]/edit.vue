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
import { useMutation, useQuery, useQueryClient } from "@tanstack/vue-query";
import { toTypedSchema } from "@vee-validate/zod";
import { useForm } from "vee-validate";
import { z } from "zod";

const route = useRoute();
const productId = route.params.id;

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string(),
  price: z
    .string()
    .refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
      message: "Price must be a positive number",
    }),
  image: z
    .instanceof(File)
    .refine(
      (file) =>
        !file ||
        ["image/jpeg", "image/png", "image/jpg", "image/gif"].includes(
          file.type
        ),
      {
        message: "Image must be a jpeg, png, jpg, or gif file",
      }
    )
    .refine((file) => !file || file.size <= 2048 * 1024, {
      message: "Image must be smaller than 2MB",
    })
    .optional(),
});

type Schema = z.infer<typeof schema>;

const form = useForm({
  validationSchema: toTypedSchema(schema),
});

const router = useRouter();
const queryClient = useQueryClient();
const showAlert = ref(false);

type ProductResponse = {
  message: string;
  data: {
    id: number;
    name: string;
    description: string;
    price: number;
    image: string | null;
    created_at: string;
    updated_at: string;
  };
};

const { data: productData, isLoading } = useQuery({
  queryKey: ["product", productId],
  queryFn: async () => {
    const response = await api.get(`api/v1/products/${productId}`).json<ProductResponse>();
    return response.data;
  },
  enabled: !!productId,
});

watchEffect(() => {
  if (productData.value) {
    form.setValues({
      name: productData.value.name,
      description: productData.value.description,
      price: String(productData.value.price),
    });
  }
});

const { isPending, mutate } = useMutation({
  mutationFn: async (values: Schema) => {
    const formData = new FormData();
    formData.append("_method", "PATCH");
    formData.append("name", values.name);
    formData.append("description", values.description);
    formData.append("price", values.price);

    if (values.image) {
      formData.append("image", values.image);
    }

    const response = await api.post(`api/v1/products/${productId}`, {
      body: formData,
    });

    return response.json();
  },
  onSuccess: async () => {
    await queryClient.invalidateQueries({ queryKey: ["product", productId] });
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
  <h1 class="text-4xl font-bold">Edit Product</h1>

  <div v-if="isLoading">Loading product data...</div>
  <form v-else @submit="onSubmit" class="grid gap-4 mt-6">
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
          <div class="border border-r-0 w-12 rounded rounded-r-none flex items-center justify-center">
            Rp
          </div>
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
          <div v-if="productData?.image">
            <img :src="productData.image" alt="Product Image" class="w-32 h-32 object-cover mb-2" />
          </div>
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
        {{ isPending ? "Updating..." : "Update" }}
      </Button>
    </div>
  </form>
</template>
