<script setup lang="ts">
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query';
import { CircleUser, Menu, Package2 } from 'lucide-vue-next';
import { useRoute, useRouter } from 'vue-router';

const queryClient = useQueryClient();
const router = useRouter();
const route = useRoute();

type Root = { data: Data }

type Data = {
  id: number
  name: string
  email: string
  role_id: number
}

const fetchMe = async () => api.get('api/v1/me', { credentials: 'include' }).json<Root>();

const { isSuccess, data } = useQuery({
  queryKey: ['me'],
  queryFn: fetchMe,
  retry: false,
});

const { mutate } = useMutation({
  mutationFn: async () => api.post('logout', { credentials: 'include' }).json(),
  onSuccess: async () => {
    await queryClient.invalidateQueries();
    router.push('/');
  },
});

const handleLogout = () => mutate();
</script>

<template>
  <div class="flex min-h-screen w-full flex-col">
    <header class="sticky top-0 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
      <nav
        class="hidden flex-1 flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
        <a href="#" class="flex items-center gap-2 text-lg font-semibold md:text-base">
          <Package2 class="h-6 w-6" />
          <span class="sr-only">Acme Inc</span>
        </a>

        <NuxtLink to="/"
          :class="route.path === '/' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'">
          Home
        </NuxtLink>

        <template v-if="isSuccess && data?.data.role_id === 1">
          <NuxtLink to="/admin"
            :class="route.path === '/admin' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'">
            Admin
          </NuxtLink>
        </template>

        <template v-if="!isSuccess">
          <NuxtLink to="/login" :class="[
            'text-muted-foreground hover:text-foreground',
            route.path === '/login' ? 'text-foreground' : '',
            'ml-auto'
          ]">
            Login
          </NuxtLink>
          <NuxtLink to="/register"
            :class="route.path === '/register' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'">
            Register
          </NuxtLink>
        </template>

        <template v-else>
          <NuxtLink to="/cart" :class="[
            'text-muted-foreground hover:text-foreground',
            route.path === '/cart' ? 'text-foreground' : '',
            'ml-auto'
          ]">
            Cart
          </NuxtLink>
        </template>
      </nav>

      <Sheet>
        <SheetTrigger as-child>
          <Button variant="outline" size="icon" class="shrink-0 md:hidden">
            <Menu class="h-5 w-5" />
            <span class="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left">
          <nav class="grid gap-6 text-lg font-medium">
            <a href="#" class="flex items-center gap-2 text-lg font-semibold">
              <Package2 class="h-6 w-6" />
              <span class="sr-only">Acme Inc</span>
            </a>
            <NuxtLink to="/" class="hover:text-foreground">
              Home
            </NuxtLink>

            <template v-if="!isSuccess">
              <NuxtLink to="/login" class="text-muted-foreground hover:text-foreground">
                Login
              </NuxtLink>
              <NuxtLink to="/register" class="text-muted-foreground hover:text-foreground">
                Register
              </NuxtLink>
            </template>
            <template v-else>
              <NuxtLink to="/cart" class="text-muted-foreground hover:text-foreground">
                Cart
              </NuxtLink>
              <NuxtLink v-if="data?.data.role_id === 1" to="/admin" class="text-muted-foreground hover:text-foreground">
                Admin
              </NuxtLink>
            </template>
          </nav>
        </SheetContent>
      </Sheet>

      <div class="flex items-center gap-4 ml-auto md:gap-2 lg:gap-4">
        <DropdownMenu v-if="isSuccess">
          <DropdownMenuTrigger as-child>
            <Button variant="secondary" size="icon" class="rounded-full">
              <CircleUser class="h-5 w-5" />
              <span class="sr-only">Toggle user menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem @click="handleLogout">Logout</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>

    <main class="flex-1 p-4 md:p-6">
      <slot /> <!-- ✅ This renders the page content dynamically -->
    </main>
  </div>
</template>
