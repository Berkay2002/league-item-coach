import { createClient } from "@supabase/supabase-js"

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
const supabasePublishableKey = import.meta.env
  .VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined
const configuredSupabaseUrl = configuredValue(supabaseUrl)
const configuredSupabasePublishableKey = configuredValue(supabasePublishableKey)

export const hasSupabaseConfig = Boolean(
  configuredSupabaseUrl && configuredSupabasePublishableKey
)

export const supabase =
  configuredSupabaseUrl && configuredSupabasePublishableKey
  ? createClient(configuredSupabaseUrl, configuredSupabasePublishableKey)
  : undefined

export const shouldUseSupabaseRecommendationData =
  import.meta.env.VITE_RECOMMENDATION_DATA_SOURCE === "supabase"

function configuredValue(value: string | undefined): string | undefined {
  const trimmed = value?.trim()

  return trimmed && trimmed.length > 0 ? trimmed : undefined
}
