# Phase 1: Compile the application assets and server bundles
FROM node:22-alpine AS builder

WORKDIR /app

# Copy dependency mappings
COPY package*.json tsconfig.json vite.config.ts ./

# Install development & module dependencies
RUN npm ci

# Copy the source directories
COPY src/ ./src
COPY .env.example index.html metadata.json server.ts ./

# Run production compilation: frontend build + esbuild node wrapper CJS bundle
RUN NODE_ENV=production npm run build

# Phase 2: Lightweight Production runner environment
FROM node:22-alpine AS runner

WORKDIR /app

# Bind port 3000 as required on infrastructure setups
ENV PORT=3000
ENV NODE_ENV=production

# Copy built artifacts and CJS packages to runner directory
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist/ ./dist/
COPY --from=builder /app/src/db.json /app/src/db.json

# Install strictly production dependencies to reduce disk footprints
RUN npm ci --only=production

EXPOSE 3000

# Fire the compiled CommonJS server bundle
CMD ["node", "dist/server.cjs"]
