import {
  createStaticRecommendationVersionSource,
  mockSupabaseRecommendationVersionResponse,
  type RecommendationVersionSource,
  type SupabaseRecommendationVersionResponse,
} from "@workspace/recommender"

import {
  hasSupabaseConfig,
  shouldUseSupabaseRecommendationData,
  supabase,
} from "./utils/supabase"

const mockSource = createStaticRecommendationVersionSource(
  mockSupabaseRecommendationVersionResponse
)

export function createAppRecommendationVersionSource(): RecommendationVersionSource {
  if (!shouldUseSupabaseRecommendationData) {
    return mockSource
  }

  if (!hasSupabaseConfig || !supabase) {
    console.warn(
      "Recommendation data source is set to 'supabase' but Supabase is not configured; falling back to mock data."
    )

    return mockSource
  }
  const configuredSupabase = supabase

  return {
    loadActiveVersion: async () => {
      const { data, error } = await configuredSupabase
        .from("active_recommendation_version")
        .select("*")
        .maybeSingle()

      if (error) {
        throw new Error(error.message)
      }

      if (!data) {
        throw new Error("No active recommendation version found")
      }

      return data as SupabaseRecommendationVersionResponse
    },
  }
}
