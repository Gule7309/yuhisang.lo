#!/usr/bin/env bash
# CMS release synchronization. May fast-forward staging but never discard drafts.
# Invoked from an authorized successful main deployment job.
set -euo pipefail
remote="${CMS_REMOTE:-origin}"
completed_sha="${CMS_DEPLOYED_SHA:-}"
event_type="${CMS_EVENT_TYPE:-workflow_dispatch}"
git fetch "$remote" main cms-staging
main_sha="$(git rev-parse "refs/remotes/$remote/main")"
stage_sha="$(git rev-parse "refs/remotes/$remote/cms-staging")"
{
  echo "### CMS staging post-deploy sync"
  echo "- Main: \`$main_sha\`"
  echo "- Staging before: \`$stage_sha\`"
} >> "${GITHUB_STEP_SUMMARY:-/dev/null}"
if [[ "$event_type" == "workflow_run" && "$main_sha" != "$completed_sha" ]]; then
  echo "SKIP: main advanced beyond completed deployment; no branch changed."
  exit 0
fi
if [[ "$stage_sha" == "$main_sha" ]]; then
  echo "SYNCED: staging already matches main."
  exit 0
fi
if ! git merge-base --is-ancestor "$stage_sha" "$main_sha"; then
  echo "SKIP: unpublished or divergent staging commits; preserve drafts for manual reconciliation."
  exit 0
fi
# Non-force push fails if remote staging moved since fetching. This is intentional.
git push "$remote" "$main_sha:refs/heads/cms-staging"
echo "UPDATED: staging fast-forwarded to main."
