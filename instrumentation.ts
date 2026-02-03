import posthog from 'posthog-js'

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Server-side init if needed (e.g., for server-side tracking)
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
    })
  }
}