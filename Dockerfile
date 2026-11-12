FROM node:22-alpine as build

WORKDIR /app

COPY package.json ./
COPY yarn.lock ./

RUN yarn --frozen-lockfile

COPY . ./
ENV NODE_ENV=production
ENV NITRO_PRESET=bun
RUN yarn build

FROM oven/bun:alpine as serve

WORKDIR /app
COPY --from=build /app/.output ./

# Port configured from environment variable (defaults to 3000)
ENV PORT=3000 \
  HOST=0.0.0.0
EXPOSE 3000
ENV NODE_ENV=production
ENTRYPOINT ["bun", "run", "/app/server/index.mjs"]
