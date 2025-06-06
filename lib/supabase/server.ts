import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient(token?: string) {
  const cookieStore = await cookies();

  const client = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {}
        },
      },
    }
  );

  if (token) {
    await client.auth.setSession({
      access_token: token,
      refresh_token: token,
    });
  }

  return client;
}
