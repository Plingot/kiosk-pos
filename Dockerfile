ARG ALPINE_VERSION=3.21
ARG NODE_VERSION=22.16.0

FROM node:${NODE_VERSION}-alpine${ALPINE_VERSION} AS base

ENV SKIP_ENV_VALIDATION=true \
  DOCKER_OUTPUT=1 \
  NEXT_TELEMETRY_DISABLED=1

RUN apk add --no-cache libc6-compat
WORKDIR /app

RUN corepack enable

COPY package.json pnpm-lock.yaml prisma/ ./
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm build


FROM node:${NODE_VERSION}-alpine${ALPINE_VERSION} AS release
ENV NODE_ENV=production

WORKDIR /app
RUN apk add --no-cache libc6-compat

COPY --from=base /app/next.config.mjs .
COPY --from=base /app/package.json .
COPY --from=base /app/pnpm-lock.yaml .
COPY --from=base /app/.next/standalone ./
COPY --from=base /app/.next/static ./.next/static
COPY --from=base /app/public ./public
COPY --from=base /app/prisma ./prisma

# Prisma binaries (optional if used at runtime)
COPY --from=base /app/node_modules ./node_modules

ENV SKIP_ENV_VALIDATION=false

COPY ./start.sh ./start.sh
RUN chmod +x start.sh

CMD ["sh", "start.sh"]