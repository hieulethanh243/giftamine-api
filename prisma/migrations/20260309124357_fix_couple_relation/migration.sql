-- DropIndex
DROP INDEX "CoupleConnection_receiverId_key";

-- DropIndex
DROP INDEX "CoupleConnection_senderId_key";

-- CreateIndex
CREATE INDEX "CoupleConnection_senderId_idx" ON "CoupleConnection"("senderId");
