FROM node:22-bookworm-slim

RUN corepack enable && corepack prepare pnpm@8.15.4 --activate

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml nx.json tsconfig.json ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json

RUN pnpm install --frozen-lockfile

COPY . .

RUN chmod +x scripts/docker-api-entrypoint.sh

EXPOSE 3333 4200
