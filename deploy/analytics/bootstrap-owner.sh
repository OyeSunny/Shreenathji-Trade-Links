#!/usr/bin/env bash
set -euo pipefail

# Run once on the VPS as root after the Umami container is healthy. This script
# removes Umami's seeded default credentials and records only the non-secret
# tracker website ID in the public website's runtime environment.

analytics_dir=/opt/shreenathji-analytics
app_env=/var/www/shreenathji-trade-links/.env
analytics_url=http://127.0.0.1:3001
owner_username=shreenathjigdm@gmail.com

if [ -s "$analytics_dir/website.env" ]; then
  printf '%s\n' 'Analytics owner bootstrap was already completed.'
  exit 0
fi

login_response=$(curl -fsS -X POST "$analytics_url/api/auth/login" \
  -H 'Content-Type: application/json' \
  --data '{"username":"admin","password":"umami"}')
token=$(printf '%s' "$login_response" | node -e '
let value = "";
process.stdin.on("data", (chunk) => (value += chunk));
process.stdin.on("end", () => process.stdout.write(JSON.parse(value).token));
')
user_id=$(printf '%s' "$login_response" | node -e '
let value = "";
process.stdin.on("data", (chunk) => (value += chunk));
process.stdin.on("end", () => process.stdout.write(JSON.parse(value).user.id));
')

website_response=$(curl -fsS -X POST "$analytics_url/api/websites" \
  -H 'Content-Type: application/json' \
  -H "Authorization: Bearer $token" \
  --data '{"name":"Shreenathji Trade Links","domain":"shreenathjitradelinks.com"}')
website_id=$(printf '%s' "$website_response" | node -e '
let value = "";
process.stdin.on("data", (chunk) => (value += chunk));
process.stdin.on("end", () => process.stdout.write(JSON.parse(value).id));
')

owner_password=$(openssl rand -hex 32)
curl -fsS -X POST "$analytics_url/api/users/$user_id" \
  -H 'Content-Type: application/json' \
  -H "Authorization: Bearer $token" \
  --data "{\"username\":\"$owner_username\",\"password\":\"$owner_password\",\"role\":\"admin\"}" \
  >/dev/null

umask 077
printf 'UMAMI_WEBSITE_ID=%s\n' "$website_id" > "$analytics_dir/website.env"
printf 'UMAMI_OWNER_USERNAME=%s\nUMAMI_OWNER_PASSWORD=%s\n' \
  "$owner_username" "$owner_password" > "$analytics_dir/owner-access.env"
chown root:root "$analytics_dir/website.env" "$analytics_dir/owner-access.env"
chmod 0600 "$analytics_dir/website.env" "$analytics_dir/owner-access.env"

if grep -q '^NEXT_PUBLIC_UMAMI_WEBSITE_ID=' "$app_env"; then
  sed -i "s/^NEXT_PUBLIC_UMAMI_WEBSITE_ID=.*/NEXT_PUBLIC_UMAMI_WEBSITE_ID=$website_id/" "$app_env"
else
  printf '\nNEXT_PUBLIC_UMAMI_WEBSITE_ID=%s\n' "$website_id" >> "$app_env"
fi

printf '%s\n' 'Analytics owner bootstrap complete.'
