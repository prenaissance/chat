FROM node:20-bookworm
RUN corepack enable
RUN corepack prepare --activate pnpm@latest
WORKDIR /usr/src/app
COPY --link package.json pnpm-lock.yaml tsconfig.json next.config.mjs .env ./
COPY --link src/ src/
COPY --link prisma/ prisma/
COPY --link public/ public/
RUN pnpm install --frozen-lockfile
RUN pnpm run build
ENTRYPOINT [ "pnpm", "start" ]
