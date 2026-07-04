do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'baseline_item_recommendations_champion_version_fkey'
      and conrelid = 'baseline_item_recommendations'::regclass
  ) then
    alter table baseline_item_recommendations
      add constraint baseline_item_recommendations_champion_version_fkey
      foreign key (version_id, champion_id)
      references recommendation_champion_tags (version_id, champion_id)
      on delete cascade;
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'baseline_item_recommendations_target_item_version_fkey'
      and conrelid = 'baseline_item_recommendations'::regclass
  ) then
    alter table baseline_item_recommendations
      add constraint baseline_item_recommendations_target_item_version_fkey
      foreign key (version_id, target_item_id)
      references recommendation_item_tags (version_id, item_id)
      on delete cascade;
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'baseline_item_recommendations_alternative_item_version_fkey'
      and conrelid = 'baseline_item_recommendations'::regclass
  ) then
    alter table baseline_item_recommendations
      add constraint baseline_item_recommendations_alternative_item_version_fkey
      foreign key (version_id, alternative_item_id)
      references recommendation_item_tags (version_id, item_id)
      on delete cascade;
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'baseline_rune_recommendations_champion_version_fkey'
      and conrelid = 'baseline_rune_recommendations'::regclass
  ) then
    alter table baseline_rune_recommendations
      add constraint baseline_rune_recommendations_champion_version_fkey
      foreign key (version_id, champion_id)
      references recommendation_champion_tags (version_id, champion_id)
      on delete cascade;
  end if;
end $$;
