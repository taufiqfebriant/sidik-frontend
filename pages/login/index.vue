<script setup lang="ts">
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useMutation, useQueryClient } from "@tanstack/vue-query";
import { toTypedSchema } from "@vee-validate/zod";
import { AlertCircle } from 'lucide-vue-next';
import { useForm } from "vee-validate";
import { useRouter } from "vue-router";
import { object, z } from "zod";

const schema = toTypedSchema(
  object({
    email: z.string().min(1).email(),
    password: z.string().min(1),
  })
);

const form = useForm({
  validationSchema: schema,
});

const router = useRouter();
const queryClient = useQueryClient();

const showAlert = ref(false);

const { isPending, mutate } = useMutation({
  mutationFn: async (values: { email: string; password: string }) => {
    await api.get("sanctum/csrf-cookie");
    const response = await api.post("login", {
      json: values,
    });
    return response.json();
  },
  onSuccess: async () => {
    await queryClient.invalidateQueries();
    router.push("/");
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
  <div class="flex-1 justify-center items-center flex">
    <Card class="mx-auto max-w-sm">
      <CardHeader>
        <CardTitle class="text-2xl">Login</CardTitle>
        <CardDescription>Enter your email below to login to your account</CardDescription>
      </CardHeader>
      <CardContent>
        <Alert variant="destructive" v-if="showAlert" class="mb-2">
          <AlertCircle class="w-4 h-4" />
          <AlertTitle>Failed</AlertTitle>
          <AlertDescription>
            Please try again.
          </AlertDescription>
        </Alert>

        <form @submit="onSubmit" class="grid gap-4">
          <FormField v-slot="{ componentField }" name="email">
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="text" placeholder="m@example.com" v-bind="componentField" />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <FormField v-slot="{ componentField }" name="password">
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" v-bind="componentField" />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <Button type="submit" class="w-full" :disabled="isPending">
            {{ isPending ? "Logging in..." : "Login" }}
          </Button>
        </form>
        <div class="mt-4 text-center text-sm">
          Don't have an account?
          <NuxtLink to="/register" class="underline">Sign up</NuxtLink>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
