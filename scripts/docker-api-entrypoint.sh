#!/bin/sh
set -e

CI=true pnpm install --frozen-lockfile

attempt=0
max_attempts=30

until pnpm nx run api:migrate --skip-nx-cache; do
  attempt=$((attempt + 1))

  if [ "$attempt" -ge "$max_attempts" ]; then
    echo "Database migrations failed after ${max_attempts} attempts."
    exit 1
  fi

  echo "Waiting for database (${attempt}/${max_attempts})..."
  sleep 2
done

exec ./node_modules/.bin/nodemon \
  --legacy-watch \
  --watch apps/api/src \
  --ext ts \
  --exec "tsx apps/api/src/main.ts"
