#!/usr/bin/env bash
set -euo pipefail

APP_DIR=/var/www/shreenathji-trade-links
cd "$APP_DIR"

git fetch --depth 1 origin main
git reset --hard origin/main
pnpm install --frozen-lockfile

while IFS= read -r entry || [ -n "$entry" ]; do
  case "$entry" in ''|'#'*) continue ;; esac
  key=${entry%%=*}
  value=${entry#*=}
  export "$key=$value"
done < .env
export NODE_ENV=production

pnpm prisma generate
pnpm prisma migrate deploy
pnpm build

install -d -o shreenathji -g shreenathji -m 0755 "$APP_DIR/public/media/uploads"
install -d -o shreenathji -g shreenathji -m 0700 "$APP_DIR/var/media-processing/sources"
install -m 0644 "$APP_DIR/deploy/systemd/shreenathji-product-video-worker.service" /etc/systemd/system/shreenathji-product-video-worker.service
systemctl daemon-reload
systemctl enable shreenathji-product-video-worker
systemctl restart shreenathji-trade-links shreenathji-product-video-worker

for attempt in $(seq 1 30); do
  if curl -fsS http://127.0.0.1:3000/api/health >/dev/null; then
    printf 'Deployed commit: '
    git rev-parse --short HEAD
    exit 0
  fi
  sleep 1
done

printf '%s\n' 'Service did not pass its health check after deployment.' >&2
exit 1
