FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files first (Docker layer caching)
COPY package*.json ./

# Install ALL dependencies (dev deps needed for TypeScript/Next.js build)
RUN npm ci

# Copy source code
COPY . .

# Ensure public directory exists (prevents COPY failure if empty)
RUN mkdir -p public

# Pass build arguments for Next.js environment variables
ARG NEXT_PUBLIC_API_BASE_URL
ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL

ARG NEXT_PUBLIC_STREAMING_BASE_URL
ENV NEXT_PUBLIC_STREAMING_BASE_URL=$NEXT_PUBLIC_STREAMING_BASE_URL

# Build the application with standalone output
RUN npm run build


# ---- Production stage ----
FROM node:20-alpine

RUN apk add --no-cache curl

WORKDIR /app

# Copy standalone build from builder (includes all needed node_modules)
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Copy public assets (use wildcard to avoid failure if dir is empty)
COPY --from=builder /app/public ./public

EXPOSE 3000

ENV NODE_ENV=production
ENV PORT=3000

HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
  CMD curl -f http://localhost:3000/ || exit 1

CMD ["node", "server.js"]
