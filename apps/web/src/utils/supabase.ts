import { createClient } from "@supabase/supabase-js"

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
const supabasePublishableKey = import.meta.env
  .VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined

export const hasSupabaseConfig = Boolean(
  supabaseUrl && supabasePublishableKey
)

export const supabase =
  supabaseUrl !== undefined && supabasePublishableKey !== undefined
  ? createClient(supabaseUrl, supabasePublishableKey)
  : undefined

export const shouldUseSupabaseRecommendationData =
  import.meta.env.VITE_RECOMMENDATION_DATA_SOURCE === "supabase"
