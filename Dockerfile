# ---------- Builder ----------
FROM node:20-bookworm-slim AS builder
WORKDIR /app

# Railway injects NEXT_PUBLIC_SUPABASE_* during build
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY

# Install deps
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

# Copy source and build
COPY . .
RUN npx next telemetry disable && npm run build

# ---------- Runner ----------
FROM node:20-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

# Install tsx for custom server
RUN npm install -g tsx

# Copy package files and install production dependencies
COPY package.json package-lock.json ./
RUN npm ci --only=production --no-audit --no-fund

# Copy built application and custom server files
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/server.ts ./server.ts
COPY --from=builder /app/src ./src
COPY --from=builder /app/tsconfig.json ./tsconfig.json

# Railway will set $PORT automatically
EXPOSE 3000
CMD ["npm", "start"]