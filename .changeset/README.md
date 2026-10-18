# Changesets

Каждое изменение, которое попадёт в релиз, описывается командой `pnpm changeset`:
выбираете тип (patch / minor / major) и пишете одну строку для CHANGELOG.

Публикация: `pnpm release` (сборка + `changeset publish`).
