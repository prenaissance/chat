FROM node:20-bookworm as base
RUN corepack enable
RUN corepack prepare --activate pnpm@latest

FROM base as build
COPY --link package.json pnpm-lock.yaml tsconfig.json ./
COPY --link src/ src/
COPY --link prisma/ prisma/
RUN pnpm install --frozen-lockfile
RUN pnpm run build:ws

FROM base as runner
WORKDIR /usr/src/app
COPY --link --from=build . .
RUN npm add -g sharp
RUN npm add -g prisma@5.0.0
RUN pnpm prune --prod
EXPOSE 3031
ENTRYPOINT ["node"]
CMD ["dist/index.js"]

