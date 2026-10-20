#!/usr/bin/env bash
set -euo pipefail
# Provision dependencies before this command; upload artifacts after it.
# A fresh network+PID namespace has only loopback. Drop capabilities and forbid
# privilege gain, so tested code cannot use sudo/nsenter to regain host egress.
qa_uid=$(id -u)
qa_gid=$(id -g)
exec sudo --preserve-env=PATH,HOME,PLAYWRIGHT_BROWSERS_PATH,WUL_BASE_COMMIT,WUL_REVIEW_DIR,GITHUB_ACTIONS,GITHUB_SHA,GITHUB_EVENT_NAME,GITHUB_HEAD_REF,GITHUB_REF_NAME,GITHUB_RUN_ID,GITHUB_RUN_ATTEMPT,GITHUB_WORKFLOW,GITHUB_REPOSITORY,GITHUB_OUTPUT,GITHUB_STEP_SUMMARY,CI \
  unshare --net --pid --fork --mount-proc --kill-child=SIGKILL \
  bash -c 'ip link set lo up; exec setpriv --reuid="$1" --regid="$2" --clear-groups --bounding-set=-all --no-new-privs -- "${@:3}"' \
  qa-isolation "$qa_uid" "$qa_gid" "$@"
