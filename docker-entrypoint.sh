#!/bin/sh
set -e

# 1. Bỏ qua bước check DB bằng nc nếu bạn thấy phiền, hoặc sửa thành:
if [ -n "$DB_HOST" ]; then
  echo "🔍 Checking database connection..."
  timeout 15s sh -c "until nc -z $DB_HOST 5432; do sleep 1; done" || echo "⚠️ Skip DB check..."
fi

# 2. SỬA DÒNG NÀY (Cực kỳ quan trọng)
echo "🚀 Running database migrations..."
# Dùng pnpm để nó lấy đúng bản Prisma 7 bạn đã cài trong project
pnpm prisma migrate deploy

echo "✅ Starting application..."
exec "$@"