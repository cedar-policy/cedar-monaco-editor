# Releasing

This package is published to [npm](https://www.npmjs.com/package/@cedar-policy/cedar-monaco-editor) automatically when a GitHub Release is published.

## How publishing is wired up

- The package is published under the `@cedar-policy` npm org as `@cedar-policy/cedar-monaco-editor`.
- Authentication uses [npm trusted publishing](https://docs.npmjs.com/trusted-publishers): the `@cedar-policy/cedar-monaco-editor` package on npmjs.com is configured to trust this repository's `.github/workflows/publish.yml` workflow via GitHub's OIDC. No `NPM_TOKEN` secret is used or supported.
- `publishConfig` in `package.json` pins `access: public` and `provenance: true`, so every publish is public and carries an [npm provenance attestation](https://docs.npmjs.com/generating-provenance-statements) linking the tarball back to the exact workflow run that built it.
- The workflow triggers on GitHub Release `published` events only — pushing a tag alone does not publish.

## Cutting a release

1. On a branch, bump `version` in `package.json` to the new semver (e.g., `0.2.0`). Commit as `chore: release vX.Y.Z`.
2. Open a PR to `main`. CI must pass. Merge.
3. On GitHub, go to **Releases → Draft a new release**:
   - **Tag**: `vX.Y.Z` (matching the `package.json` version, create on publish)
   - **Target**: `main`
   - **Title**: `vX.Y.Z`
   - **Notes**: use "Generate release notes" and edit as needed
4. Click **Publish release**.
5. The `Publish Package to npmjs` workflow runs automatically: install, test, build, `npm publish`. Access level and provenance are configured via `publishConfig` in `package.json`.
6. Verify the new version appears at https://www.npmjs.com/package/@cedar-policy/cedar-monaco-editor.

## Tag convention

Tags are `v`-prefixed semver: `v0.1.0`, `v0.2.0`, `v1.0.0-beta.1`, etc. The tag name is informational only — the version that gets published is whatever is in `package.json` at the commit the release points to.

## Rolling back

Published versions cannot be overwritten. To fix a bad release, bump the patch version and publish again. Use `npm deprecate @cedar-policy/cedar-monaco-editor@X.Y.Z "reason"` to mark the bad version as deprecated.
