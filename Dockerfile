# syntax=docker/dockerfile:1.7

FROM node:22.22.0-alpine AS dependencies
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM dependencies AS builder
COPY . .
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1
RUN npm run build

FROM dependencies AS production-dependencies
RUN npm prune --omit=dev

FROM node:22.22.0-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    PORT=3000 \
    NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 --ingroup nodejs vinext

COPY --from=production-dependencies --chown=vinext:nodejs /app/node_modules/ ./node_modules/
COPY --from=builder --chown=vinext:nodejs /app/dist/standalone/ ./

USER vinext
EXPOSE 3000

HEALTHCHECK --interval=10s --timeout=3s --start-period=15s --retries=6 \
  CMD ["node", "-e", "fetch('http://127.0.0.1:3000/api/health').then(r=>{if(!r.ok)process.exit(1)}).catch(()=>process.exit(1))"]

CMD ["node", "server.js"]
