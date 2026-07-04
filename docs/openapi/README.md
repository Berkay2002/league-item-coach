# OpenAPI References

This folder contains pinned API schemas used as implementation references.

## Riot API

- `openapi-3.0.0.json`
- Source named in the schema: https://github.com/MingweiSamuel/riotapi-schema
- Upstream terms: https://developer.riotgames.com/terms

Use this schema when implementing backend or worker code that calls Riot-hosted APIs, especially Account-V1, Summoner-V4, Match-V5, League-V4, Champion Mastery, or tournament-code endpoints.

Do not use this schema as a substitute for Data Dragon static data. Data Dragon remains the source for item, champion, rune, icon, and patch static-data sync.

Do not put Riot API keys in this folder. Client-shipped code must not contain Riot API secrets.
