# Versioning Policy

All configuration files must pin exact versions. Avoid floating tags, wildcards, or implicit latest.

- Use exact semver for JavaScript dependencies.
- Commit `pnpm-lock.yaml` and keep it in sync.
- GitHub Actions must reference commit SHAs with a comment noting the release tag.
- Docker images and external tools must use tag plus digest.
- Changes to versions must be reviewed and documented in `VERSION_MATRIX.md`.
