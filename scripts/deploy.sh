#!/usr/bin/env bash
set -euo pipefail

# Restrict all values passed through the remote shell to safe path/host characters.
[[ ${BEGET_HOST:-} =~ ^[A-Za-z0-9][A-Za-z0-9.-]+$ ]] || { echo 'Invalid BEGET_HOST'; exit 1; }
[[ ${BEGET_USER:-} =~ ^[A-Za-z0-9_][A-Za-z0-9_-]*$ ]] || { echo 'Invalid BEGET_USER'; exit 1; }
[[ ${BEGET_PORT:-} =~ ^[0-9]+$ ]] && ((BEGET_PORT > 0 && BEGET_PORT < 65536)) || { echo 'Invalid SSH port'; exit 1; }
[[ ${BEGET_SITE_DIR:-} =~ ^/[A-Za-z0-9_./-]+$ && "$BEGET_SITE_DIR" != *'..'* ]] || { echo 'Use an absolute site directory without spaces'; exit 1; }
[[ ${GITHUB_SHA:-} =~ ^[a-f0-9]{40}$ ]] || { echo 'Invalid revision'; exit 1; }
[[ -f dist/beget/public_html/index.html ]] || { echo 'Artifact is missing'; exit 1; }

key="$RUNNER_TEMP/beget_key"
known="$RUNNER_TEMP/beget_known_hosts"
remote="$BEGET_USER@$BEGET_HOST"
opts=(-i "$key" -p "$BEGET_PORT" -o BatchMode=yes -o IdentitiesOnly=yes -o StrictHostKeyChecking=yes -o "UserKnownHostsFile=$known" -o ConnectTimeout=15)

# Existing site directory must be inside this SSH user's home. Symlinked roots are rejected.
ssh "${opts[@]}" "$remote" bash -s -- "$BEGET_SITE_DIR" "$GITHUB_SHA" <<'REMOTE'
set -euo pipefail
site=$(realpath -e -- "$1")
user_home=$(realpath -e -- "$HOME")
[[ "$site" == "$user_home/"* && "$site" != "$user_home" && "$site" == "$1" ]] || { echo 'Site is outside the home or uses a symlink'; exit 1; }
[[ -d "$site/public_html" && ! -L "$site/public_html" ]] || { echo 'Create the site in Beget first (real public_html required)'; exit 1; }
for directory in private .deploy-incoming .deploy-backups; do
  [[ ! -L "$site/$directory" ]] || { echo 'Deployment directories must not be symlinks'; exit 1; }
done
command -v rsync >/dev/null
command -v flock >/dev/null
mkdir -p -- "$site/.deploy-incoming/$2"
REMOTE

# Quotes protect runner temp paths; all interpolated remote-path values were validated above.
export RSYNC_RSH="ssh -i '$key' -p '$BEGET_PORT' -o BatchMode=yes -o IdentitiesOnly=yes -o StrictHostKeyChecking=yes -o UserKnownHostsFile='$known' -o ConnectTimeout=15"
rsync -az -- dist/beget/ "$remote:$BEGET_SITE_DIR/.deploy-incoming/$GITHUB_SHA/"
ssh "${opts[@]}" "$remote" bash -s -- "$BEGET_SITE_DIR" "$GITHUB_SHA" < scripts/publish-remote.sh
