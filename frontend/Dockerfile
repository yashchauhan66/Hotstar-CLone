FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install ALL dependencies (dev deps needed for TypeScript build)
RUN npm ci

# Copy source code
COPY . .

# Pass build arguments for Next.js environment variables
ARG NEXT_PUBLIC_API_BASE_URL
ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL

ARG NEXT_PUBLIC_STREAMING_BASE_URL
ENV NEXT_PUBLIC_STREAMING_BASE_URL=$NEXT_PUBLIC_STREAMING_BASE_URL

# Build the application with standalone output
RUN npm run build


# Production stage - Use Node.js to run Next.js standalone
FROM node:20-alpine

RUN apk add --no-cache curl

WORKDIR /app

# Copy standalone build from builder (includes all needed node_modules)
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 3000

ENV NODE_ENV=production
ENV PORT=3000

HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
  CMD curl -f http://localhost:3000/ || exit 1

CMD ["node", "server.js"]
