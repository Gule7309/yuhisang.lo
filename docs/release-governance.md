# Phase 26 — Release governance policy and administrator checklist

The portfolio has working CI, CMS staging isolation and main-only Pages deployment, but **CI alone cannot prevent an owner with write access from directly pushing to main**. This policy should be enforced by GitHub Repository Rulesets or Branch Protection, not by adding more conditional statements to workflow YAML.

## Verified repository evidence (2026-11-26)

- Public GitHub ruleset listing returned an **empty list** at inspection time.
- Querying `branches/main/protection` through the connected GitHub integration returned HTTP **403 (resource not accessible by integration)**. This is **unknown**, not proof that traditional branch protection is disabled.
- No repository-admin ruleset mutation is performed by this PR or audit script.
- Actual check run/job names currently include `Portfolio PR validation / verify`, `Portfolio pull request checks / validate`, and `CMS staging publication gate / cms-content-only`. Verify exact names in the Checks tab before configuring rules, particularly when GitHub identifies checks by workflow/job rather than by human-readable label.

## Administrator configuration (manual)

Open [Repository Settings → Rules → Rulesets](https://github.com/Gule7309/yuhisang.lo/settings/rules). If available on the repository plan, create an **active branch ruleset** targeting `main` (consider allowing the existing GitHub Pages workflow to run without relaxing PR checks). Enable:

1. Require a pull request before merging (do not allow direct pushes to `main`).
2. Require status checks. Select the **actual check contexts** for `Portfolio PR validation / verify` and `Portfolio pull request checks / validate`; consider `CMS staging publication gate / cms-content-only` only after confirming the job is present and required status can be enforced on staging PRs without falsely failing normal engineering PRs.
3. Block force pushes and deletions; require resolving conversations if the repo's review workflow uses them.
4. Restrict bypass permissions to the smallest viable set. Confirm whether the owner's account can bypass these controls.
5. If there are other contributors, consider required reviews. On a single-owner repository, one required *other-person* approval can make routine publishing impossible. Do not enable a threshold without an available reviewer.

**Important:** The staging gate job is intentionally skipped for non-staging engineering PRs; GitHub normally treats skipped jobs as success. It does **not** replace the always-on Portfolio validation checks. If the publishing gate is made required, verify a staging PR is genuinely blocked when its content validation fails, and that a normal engineering PR remains mergeable when checks pass.

## Test the rules in GitHub

- Start a throwaway non-sensitive test PR (not a fake published research record). Confirm merging is blocked while a required check fails and allowed after checks pass.
- Check attempts to push directly to `main` are blocked for roles you intend to restrict; do not force-push or publish sensitive test content.
- Check a CMS staging-to-main PR with an unauthorized file fails its staging gate.
- Check an incomplete Published work record fails structural validation.
- Verify Pages deploys only when main changes and the smoke job passes.
- Complete an **authenticated** CMS staging-save trial separately with your own token. Existing test suites use mock APIs and isolated Git, not a real logged-in Sveltia session.

## Read-only governance audit

Run [Audit main release governance](https://github.com/Gule7309/yuhisang.lo/actions/workflows/release-governance.yml) manually. It inspects matching active rulesets and legacy branch protection when the GitHub token is allowed to read them. It never changes settings. **Unknown/403 is explicitly reported as unknown**. Even with valid ruleset observations, manually check bypass actors and required check selection.

If rulesets cannot be enabled due to repository plan or access, preserve the current PR workflow and document the limitation; do not claim branch protection is enforced.

## Recovery

Use a new reviewed corrective PR or GitHub Revert after a mistaken release. Never force-reset `cms-staging` while it may contain pending drafts. Published Git history remains public even after reverting; exposed credentials must be revoked or rotated.
