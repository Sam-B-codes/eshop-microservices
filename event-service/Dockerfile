# ======================================================
# BUILD STAGE
# ======================================================

FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci

COPY . .

RUN npx nx run @org/event-service:prune --skip-nx-cache

# ======================================================
# PRODUCTION STAGE
# ======================================================

FROM node:22-alpine AS production

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=6010

WORKDIR /app

COPY --from=builder /app/event-service/dist ./

RUN npm install --omit=dev --force

EXPOSE 6010

CMD ["node", "main.js"]