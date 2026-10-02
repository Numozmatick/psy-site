#!/usr/bin/env bash
set -euo pipefail
site=$(realpath -e -- "$1")
sha=$2
user_home=$(realpath -e -- "$HOME")
[[ "$site" == "$user_home/"* && "$site" == "$1" && "$sha" =~ ^[a-f0-9]{40}$ ]] || exit 1
[[ -d "$site/public_html" && ! -L "$site/public_html" ]] || exit 1
for directory in private .deploy-incoming .deploy-backups; do [[ ! -L "$site/$directory" ]] || exit 1; done
release="$site/.deploy-incoming/$sha"
[[ -f "$release/public_html/index.html" ]] || { echo 'Incomplete upload'; exit 1; }
exec 9>"$site/.deploy.lock"
flock -w 120 9
mkdir -p -- "$site/.deploy-backups" "$site/private"
backup="$site/.deploy-backups/$(date -u +%Y%m%dT%H%M%SZ)-$sha.tar.gz"
# The backup is outside the document root. SMTP config/storage always stay in place.
tar -czf "$backup" -C "$site" public_html

restore() {
  echo 'Publish failed: restoring previous public files.' >&2
  tar -xzf "$backup" -C "$site"
}
trap restore ERR

rsync -a --exclude='/mail-config.php' --exclude='/storage/' "$release/private/" "$site/private/"
if [[ ! -f "$site/private/mail-config.php" ]]; then
  cp -- "$site/private/mail-config.example.php" "$site/private/mail-config.php"
  chmod 600 "$site/private/mail-config.php"
fi
if [[ ! -f "$site/public_html/site-config.js" ]]; then
  cp -- "$release/public_html/site-config.js" "$site/public_html/site-config.js"
fi

# Upload assets first and HTML last. No --delete: keep old hashed chunks for open tabs.
rsync -a --exclude='*.html' --exclude='/site-config.js' --exclude='/deploy-version.txt' "$release/public_html/" "$site/public_html/"
rsync -a --include='*/' --include='*.html' --exclude='*' "$release/public_html/" "$site/public_html/"
cp -- "$release/public_html/deploy-version.txt" "$site/public_html/deploy-version.txt.tmp"
mv -- "$site/public_html/deploy-version.txt.tmp" "$site/public_html/deploy-version.txt"
trap - ERR
echo "Published $sha; backup: $backup"
