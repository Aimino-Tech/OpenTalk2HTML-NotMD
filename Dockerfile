FROM node:20-alpine AS builder

WORKDIR /build

COPY package*.json ./
RUN npm ci

COPY tsconfig.json ./
COPY src/ ./src/
RUN npm run build

FROM node:20-alpine AS runner

WORKDIR /app

RUN addgroup -S appgroup && adduser -S appuser -G appgroup

COPY package*.json ./
RUN npm ci --omit=dev --ignore-scripts

COPY --from=builder /build/dist/ ./dist/
COPY --from=builder /build/src/templates/*.dot ./src/templates/

USER appuser

EXPOSE 3000

ENV TRANSPORT=sse
ENV PORT=3000
ENV HOST=0.0.0.0
ENV NODE_ENV=production

ENTRYPOINT ["node", "dist/index.js"]
