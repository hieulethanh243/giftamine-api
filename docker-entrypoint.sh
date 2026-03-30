#!/bin/sh
set -e

# 1. Kiểm tra Database (Nếu bạn có cấu hình DB_HOST)
if [ -n "$DB_HOST" ]; then
  echo "🔍 Checking database connection..."
  timeout 15s sh -c "until nc -z $DB_HOST 5432; do sleep 1; done" || echo "⚠️ Skip DB check..."
fi

# 2. SỬA DÒNG NÀY: Thêm chữ 'exec' vào giữa
echo "🚀 Running database migrations..."
pnpm exec prisma migrate deploy

echo "✅ Starting application..."
exec "$@"