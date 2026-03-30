# Sử dụng Node 20 để tránh lỗi ESM
FROM node:20-alpine AS base

# Cài đặt pnpm
RUN npm install -g pnpm

WORKDIR /app

# Copy file cấu hình
COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma/

# Cài đặt deps (đảm bảo cho phép chạy script của prisma)
RUN pnpm install --frozen-lockfile

# Copy toàn bộ code
COPY . .

# Generate Prisma client (Lúc này Node 20 sẽ xử lý tốt ESM)
RUN pnpm prisma generate

# ... các bước build tiếp theo

# Build the application
RUN pnpm build

# Production stage
FROM node:18-alpine AS production

# Install pnpm and netcat
RUN npm install -g pnpm && apk add --no-cache netcat-openbsd

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install only production dependencies
RUN pnpm install --frozen-lockfile --prod

# Copy built application from base stage
COPY --from=base /app/dist ./dist
COPY --from=base /app/generated ./generated
COPY --from=base /app/prisma ./prisma

# Copy entrypoint script
COPY docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001

# Change ownership of the app directory
RUN chown -R nestjs:nodejs /app
USER nestjs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node --version || exit 1

# Start the application
ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["pnpm", "start:prod"]