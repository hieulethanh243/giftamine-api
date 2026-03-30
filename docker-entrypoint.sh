#!/bin/sh
set -e

# Tách Host và Port từ biến DATABASE_URL (nếu có) hoặc dùng biến riêng
# Nếu bạn không muốn phức tạp, có thể bỏ qua đoạn 'while' này trên Render
if [ -n "$DB_HOST" ]; then
  echo "Waiting for database at $DB_HOST:5432..."
  # Thêm thời gian timeout 30s để tránh treo vô hạn
  timeout 30s sh -c "until nc -z $DB_HOST 5432; do sleep 1; done" || echo "Database check timed out, trying to proceed anyway..."
fi

# Chạy database migrations
echo "Running database migrations..."
# Sử dụng npx hoặc pnpm đều được, nhưng npx thường nhẹ hơn ở bước này
npx prisma migrate deploy

# Start the application
echo "Starting the application..."
exec "$@"