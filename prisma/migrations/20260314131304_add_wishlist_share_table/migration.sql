-- CreateTable
CREATE TABLE "WishlistShare" (
    "id" TEXT NOT NULL,
    "wishlistId" TEXT NOT NULL,
    "sharedToId" TEXT NOT NULL,
    "sharedById" TEXT NOT NULL,
    "acceptedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WishlistShare_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "WishlistShare_sharedToId_idx" ON "WishlistShare"("sharedToId");

-- CreateIndex
CREATE UNIQUE INDEX "WishlistShare_wishlistId_sharedToId_key" ON "WishlistShare"("wishlistId", "sharedToId");

-- AddForeignKey
ALTER TABLE "WishlistShare" ADD CONSTRAINT "WishlistShare_wishlistId_fkey" FOREIGN KEY ("wishlistId") REFERENCES "Wishlist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WishlistShare" ADD CONSTRAINT "WishlistShare_sharedToId_fkey" FOREIGN KEY ("sharedToId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WishlistShare" ADD CONSTRAINT "WishlistShare_sharedById_fkey" FOREIGN KEY ("sharedById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
