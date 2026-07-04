import type { SupabaseRecommendationVersionResponse } from "@workspace/recommender"

export const mockSupabaseRecommendationVersionResponse = {
  id: "rec-version-15.24-seeded-v1",
  patch_version: "15.24",
  data_dragon_version: "15.24.1",
  imported_at: "2026-07-04T00:00:00.000Z",
  item_tags: [
    {
      item_id: "kraken-slayer",
      name: "Kraken Slayer",
      build_stage: "completed",
      tags: ["damage"],
      fits: ["marksman"],
    },
    {
      item_id: "mortal-reminder",
      name: "Mortal Reminder",
      build_stage: "completed",
      tags: ["anti-heal", "penetration", "crit"],
      fits: ["assassin", "marksman"],
    },
    {
      item_id: "executioners-calling",
      name: "Executioner's Calling",
      build_stage: "component",
      gold_cost: 800,
      tags: ["anti-heal", "damage"],
      fits: ["fighter", "marksman"],
    },
  ],
  champion_tags: [
    {
      champion_id: "jinx",
      name: "Jinx",
      roles: ["bot"],
      class: "marksman",
      damage_profile: "physical",
      traits: ["crit"],
    },
    {
      champion_id: "soraka",
      name: "Soraka",
      roles: ["support"],
      class: "enchanter",
      damage_profile: "magic",
      traits: ["healing"],
    },
  ],
  baseline_item_recommendations: [
    {
      champion_id: "jinx",
      role: "bot",
      target_item_id: "kraken-slayer",
      alternative_item_id: "mortal-reminder",
      full_build_item_ids: ["kraken-slayer", "mortal-reminder"],
      explanation: "Jinx starts from the seeded marksman baseline.",
      confidence: "low",
    },
  ],
  baseline_rune_recommendations: [
    {
      champion_id: "jinx",
      role: "bot",
      primary_tree: {
        id: "precision",
        dataDragonId: 8000,
        name: "Precision",
        iconPath: "perk-images/Styles/7201_Precision.png",
      },
      keystone: {
        dataDragonId: 8008,
        key: "LethalTempo",
        name: "Lethal Tempo",
        iconPath:
          "perk-images/Styles/Precision/LethalTempo/LethalTempoTemp.png",
      },
      secondary_tree: {
        id: "resolve",
        dataDragonId: 8400,
        name: "Resolve",
        iconPath: "perk-images/Styles/7204_Resolve.png",
      },
      key_minor_runes: [
        {
          dataDragonId: 8009,
          key: "PresenceOfMind",
          name: "Presence of Mind",
          iconPath:
            "perk-images/Styles/Precision/PresenceOfMind/PresenceOfMind.png",
        },
        {
          dataDragonId: 8473,
          key: "BonePlating",
          name: "Bone Plating",
          iconPath: "perk-images/Styles/Resolve/BonePlating/BonePlating.png",
        },
      ],
      explanation:
        "Jinx keeps Precision with Lethal Tempo as the seeded champion-select page.",
    },
  ],
} as const satisfies SupabaseRecommendationVersionResponse
