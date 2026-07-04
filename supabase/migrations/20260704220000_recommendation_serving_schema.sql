-- Draft schema for compact recommendation data served to shipped clients.
-- This mirrors the TypeScript SupabaseRecommendationVersionResponse contract in
-- packages/recommender/src/recommendation-data.ts.

create table if not exists recommendation_versions (
  id text primary key,
  patch_version text not null,
  data_dragon_version text not null,
  imported_at timestamptz not null default now(),
  is_active boolean not null default false,
  created_at timestamptz not null default now()
);

create unique index if not exists one_active_recommendation_version
  on recommendation_versions (is_active)
  where is_active;

create table if not exists recommendation_item_tags (
  version_id text not null references recommendation_versions (id) on delete cascade,
  item_id text not null,
  name text not null,
  build_stage text not null check (build_stage in ('component', 'completed')),
  gold_cost integer,
  tags text[] not null default '{}',
  fits text[] not null default '{}',
  primary key (version_id, item_id)
);

create table if not exists recommendation_champion_tags (
  version_id text not null references recommendation_versions (id) on delete cascade,
  champion_id text not null,
  name text not null,
  roles text[] not null default '{}',
  class text not null,
  damage_profile text not null check (
    damage_profile in ('physical', 'magic', 'mixed')
  ),
  traits text[] not null default '{}',
  primary key (version_id, champion_id)
);

create table if not exists baseline_item_recommendations (
  version_id text not null references recommendation_versions (id) on delete cascade,
  champion_id text not null,
  role text not null,
  target_item_id text not null,
  alternative_item_id text,
  full_build_item_ids text[] not null default '{}',
  explanation text not null,
  confidence text not null check (confidence in ('low', 'medium', 'high')),
  primary key (version_id, champion_id, role)
);

create table if not exists baseline_rune_recommendations (
  version_id text not null references recommendation_versions (id) on delete cascade,
  champion_id text not null,
  role text not null,
  primary_tree jsonb not null,
  keystone jsonb not null,
  secondary_tree jsonb not null,
  key_minor_runes jsonb not null default '[]'::jsonb,
  explanation text not null,
  primary key (version_id, champion_id, role)
);

alter table recommendation_versions enable row level security;
alter table recommendation_item_tags enable row level security;
alter table recommendation_champion_tags enable row level security;
alter table baseline_item_recommendations enable row level security;
alter table baseline_rune_recommendations enable row level security;

drop policy if exists "public read recommendation versions" on recommendation_versions;
create policy "public read recommendation versions"
  on recommendation_versions
  for select
  to anon, authenticated
  using (is_active);

drop policy if exists "public read recommendation item tags" on recommendation_item_tags;
create policy "public read recommendation item tags"
  on recommendation_item_tags
  for select
  to anon, authenticated
  using (
    exists (
      select 1
      from recommendation_versions v
      where v.id = recommendation_item_tags.version_id and v.is_active
    )
  );

drop policy if exists "public read recommendation champion tags" on recommendation_champion_tags;
create policy "public read recommendation champion tags"
  on recommendation_champion_tags
  for select
  to anon, authenticated
  using (
    exists (
      select 1
      from recommendation_versions v
      where v.id = recommendation_champion_tags.version_id and v.is_active
    )
  );

drop policy if exists "public read baseline item recommendations" on baseline_item_recommendations;
create policy "public read baseline item recommendations"
  on baseline_item_recommendations
  for select
  to anon, authenticated
  using (
    exists (
      select 1
      from recommendation_versions v
      where v.id = baseline_item_recommendations.version_id and v.is_active
    )
  );

drop policy if exists "public read baseline rune recommendations" on baseline_rune_recommendations;
create policy "public read baseline rune recommendations"
  on baseline_rune_recommendations
  for select
  to anon, authenticated
  using (
    exists (
      select 1
      from recommendation_versions v
      where v.id = baseline_rune_recommendations.version_id and v.is_active
    )
  );

revoke all on table recommendation_versions from anon, authenticated;
revoke all on table recommendation_item_tags from anon, authenticated;
revoke all on table recommendation_champion_tags from anon, authenticated;
revoke all on table baseline_item_recommendations from anon, authenticated;
revoke all on table baseline_rune_recommendations from anon, authenticated;

grant select on table recommendation_versions to anon, authenticated;
grant select on table recommendation_item_tags to anon, authenticated;
grant select on table recommendation_champion_tags to anon, authenticated;
grant select on table baseline_item_recommendations to anon, authenticated;
grant select on table baseline_rune_recommendations to anon, authenticated;

grant select, insert, update, delete on table recommendation_versions to service_role;
grant select, insert, update, delete on table recommendation_item_tags to service_role;
grant select, insert, update, delete on table recommendation_champion_tags to service_role;
grant select, insert, update, delete on table baseline_item_recommendations to service_role;
grant select, insert, update, delete on table baseline_rune_recommendations to service_role;

create or replace view active_recommendation_version
with (security_invoker = true)
as
select
  v.id,
  v.patch_version,
  v.data_dragon_version,
  v.imported_at,
  coalesce(
    (
      select jsonb_agg(
        jsonb_build_object(
          'item_id', i.item_id,
          'name', i.name,
          'build_stage', i.build_stage,
          'gold_cost', i.gold_cost,
          'tags', i.tags,
          'fits', i.fits
        )
        order by i.item_id
      )
      from recommendation_item_tags i
      where i.version_id = v.id
    ),
    '[]'::jsonb
  ) as item_tags,
  coalesce(
    (
      select jsonb_agg(
        jsonb_build_object(
          'champion_id', c.champion_id,
          'name', c.name,
          'roles', c.roles,
          'class', c.class,
          'damage_profile', c.damage_profile,
          'traits', c.traits
        )
        order by c.champion_id
      )
      from recommendation_champion_tags c
      where c.version_id = v.id
    ),
    '[]'::jsonb
  ) as champion_tags,
  coalesce(
    (
      select jsonb_agg(
        jsonb_build_object(
          'champion_id', bi.champion_id,
          'role', bi.role,
          'target_item_id', bi.target_item_id,
          'alternative_item_id', bi.alternative_item_id,
          'full_build_item_ids', bi.full_build_item_ids,
          'explanation', bi.explanation,
          'confidence', bi.confidence
        )
        order by bi.champion_id, bi.role
      )
      from baseline_item_recommendations bi
      where bi.version_id = v.id
    ),
    '[]'::jsonb
  ) as baseline_item_recommendations,
  coalesce(
    (
      select jsonb_agg(
        jsonb_build_object(
          'champion_id', br.champion_id,
          'role', br.role,
          'primary_tree', br.primary_tree,
          'keystone', br.keystone,
          'secondary_tree', br.secondary_tree,
          'key_minor_runes', br.key_minor_runes,
          'explanation', br.explanation
        )
        order by br.champion_id, br.role
      )
      from baseline_rune_recommendations br
      where br.version_id = v.id
    ),
    '[]'::jsonb
  ) as baseline_rune_recommendations
from recommendation_versions v
where v.is_active;

revoke all on table active_recommendation_version from anon, authenticated;
grant select on table active_recommendation_version to anon, authenticated;
grant select on table active_recommendation_version to service_role;
