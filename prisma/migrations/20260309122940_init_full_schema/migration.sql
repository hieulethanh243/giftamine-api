-- CreateEnum
CREATE TYPE "GiftItemStatus" AS ENUM ('ACTIVE', 'PURCHASED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "CoupleStatus" AS ENUM ('PENDING', 'CONNECTED');

-- CreateEnum
CREATE TYPE "SubscriptionPlan" AS ENUM ('MONTHLY', 'YEARLY', 'COUPLE');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'CANCELED', 'PAST_DUE');

-- CreateEnum
CREATE TYPE "NotificationChannel" AS ENUM ('EMAIL', 'SMS', 'ZALO');

-- CreateTable
CREATE TABLE "Wishlist" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "occasion" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isShared" BOOLEAN NOT NULL DEFAULT false,
    "shareToken" TEXT,
    "sharedWith" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Wishlist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GiftItem" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" DOUBLE PRECISION,
    "url" TEXT,
    "imageUrl" TEXT,
    "notes" TEXT,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "status" "GiftItemStatus" NOT NULL DEFAULT 'ACTIVE',
    "purchasedAt" TIMESTAMP(3),
    "actualPrice" DOUBLE PRECISION,
    "wishlistId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GiftItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Anniversary" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "recurring" BOOLEAN NOT NULL DEFAULT true,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "daysBefore" INTEGER[] DEFAULT ARRAY[7]::INTEGER[],
    "channels" "NotificationChannel"[] DEFAULT ARRAY['EMAIL']::"NotificationChannel"[],
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Anniversary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL,
    "plan" "SubscriptionPlan" NOT NULL,
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'ACTIVE',
    "lemonSubscriptionId" TEXT,
    "lemonCustomerId" TEXT,
    "lemonOrderId" TEXT,
    "currentPeriodStart" TIMESTAMP(3),
    "currentPeriodEnd" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CoupleConnection" (
    "id" TEXT NOT NULL,
    "status" "CoupleStatus" NOT NULL DEFAULT 'PENDING',
    "senderId" TEXT NOT NULL,
    "receiverId" TEXT NOT NULL,
    "connectedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CoupleConnection_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Wishlist_shareToken_key" ON "Wishlist"("shareToken");

-- CreateIndex
CREATE INDEX "Wishlist_userId_idx" ON "Wishlist"("userId");

-- CreateIndex
CREATE INDEX "Wishlist_shareToken_idx" ON "Wishlist"("shareToken");

-- CreateIndex
CREATE INDEX "GiftItem_wishlistId_idx" ON "GiftItem"("wishlistId");

-- CreateIndex
CREATE INDEX "GiftItem_userId_status_idx" ON "GiftItem"("userId", "status");

-- CreateIndex
CREATE INDEX "Anniversary_userId_idx" ON "Anniversary"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_lemonSubscriptionId_key" ON "Subscription"("lemonSubscriptionId");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_userId_key" ON "Subscription"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "CoupleConnection_senderId_key" ON "CoupleConnection"("senderId");

-- CreateIndex
CREATE UNIQUE INDEX "CoupleConnection_receiverId_key" ON "CoupleConnection"("receiverId");

-- CreateIndex
CREATE INDEX "CoupleConnection_receiverId_idx" ON "CoupleConnection"("receiverId");

-- CreateIndex
CREATE UNIQUE INDEX "CoupleConnection_senderId_receiverId_key" ON "CoupleConnection"("senderId", "receiverId");

-- AddForeignKey
ALTER TABLE "Wishlist" ADD CONSTRAINT "Wishlist_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GiftItem" ADD CONSTRAINT "GiftItem_wishlistId_fkey" FOREIGN KEY ("wishlistId") REFERENCES "Wishlist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GiftItem" ADD CONSTRAINT "GiftItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Anniversary" ADD CONSTRAINT "Anniversary_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CoupleConnection" ADD CONSTRAINT "CoupleConnection_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CoupleConnection" ADD CONSTRAINT "CoupleConnection_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
