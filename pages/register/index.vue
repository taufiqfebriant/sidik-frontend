<script setup lang="ts">
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { api } from '@/utils/api';
import { useMutation, useQueryClient } from '@tanstack/vue-query';
import { toTypedSchema } from '@vee-validate/zod';
import { AlertCircle } from 'lucide-vue-next';
import { useForm } from 'vee-validate';
import { useRouter } from 'vue-router';
import { object, z } from 'zod';

const schema = toTypedSchema(
  object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().min(1, 'Email is required').email('Invalid email'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    passwordConfirm: z.string().min(6, 'Confirm Password is required'),
  }).refine((data) => data.password === data.passwordConfirm, {
    message: 'Passwords do not match',
    path: ['passwordConfirm'],
  })
);

const form = useForm({
  validationSchema: schema,
});

const router = useRouter();
const queryClient = useQueryClient();

const showAlert = ref(false);

const { isPending, mutate } = useMutation({
  mutationFn: async ({ passwordConfirm, ...rest }: { name: string; email: string; password: string, passwordConfirm: string }) => {
    await api.get('sanctum/csrf-cookie');
    return api.post('register', {
      json: {
        ...rest,
        password_confirmation: passwordConfirm
      }
    }).json();
  },
  onSuccess: async () => {
    await queryClient.invalidateQueries();
    router.push('/');
  },
  onError: async (error: any) => {
    showAlert.value = true;
    const response = await error.response.json();
    form.setErrors(response.errors || {});
  },
});

const onSubmit = form.handleSubmit((values) => {
  showAlert.value = false;
  mutate(values);
});
</script>

<template>
  <div class="flex-1 justify-center items-center flex">
    <Card class="mx-auto max-w-sm">
      <CardHeader>
        <CardTitle class="text-2xl">Sign Up</CardTitle>
        <CardDescription>Enter your details to create an account</CardDescription>
      </CardHeader>
      <CardContent>
        <Alert variant="destructive" v-if="showAlert" class="mb-2">
          <AlertCircle class="w-4 h-4" />
          <AlertTitle>Registration Failed</AlertTitle>
          <AlertDescription>Check the form and try again.</AlertDescription>
        </Alert>

        <form @submit="onSubmit" class="grid gap-4">
          <FormField v-slot="{ componentField }" name="name">
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input type="text" placeholder="Your name" v-bind="componentField" />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <FormField v-slot="{ componentField }" name="email">
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="m@example.com" v-bind="componentField" />
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

          <FormField v-slot="{ componentField }" name="passwordConfirm">
            <FormItem>
              <FormLabel>Confirm Password</FormLabel>
              <FormControl>
                <Input type="password" v-bind="componentField" />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <Button type="submit" class="w-full" :disabled="isPending">
            {{ isPending ? 'Creating account...' : 'Create an account' }}
          </Button>
        </form>

        <div class="mt-4 text-center text-sm">
          Already have an account?
          <NuxtLink to="/login" class="underline">Sign in</NuxtLink>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
