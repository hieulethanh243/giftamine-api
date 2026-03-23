-- AlterEnum
ALTER TYPE "GiftItemStatus" ADD VALUE 'CLAIMED';

-- AlterTable
ALTER TABLE "GiftItem" ADD COLUMN     "claimedAt" TIMESTAMP(3),
ADD COLUMN     "claimedBy" TEXT,
ADD COLUMN     "purchasedBy" TEXT;
