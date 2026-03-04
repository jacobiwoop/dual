/*
  Warnings:

  - You are about to drop the column `amountCredits` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `amountEur` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `commissionEur` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `balance` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `balanceCredits` on the `User` table. All the data in the column will be lost.
  - You are about to alter the column `subscriptionPrice` on the `User` table. The data in that column could be lost. The data in that column will be cast from `Float` to `Int`.
  - You are about to alter the column `subscriptionPricePlus` on the `User` table. The data in that column could be lost. The data in that column will be cast from `Float` to `Int`.
  - You are about to alter the column `totalEarned` on the `User` table. The data in that column could be lost. The data in that column will be cast from `Float` to `Int`.
  - You are about to alter the column `totalSpent` on the `User` table. The data in that column could be lost. The data in that column will be cast from `Float` to `Int`.
  - You are about to drop the column `amountCredits` on the `Withdrawal` table. All the data in the column will be lost.
  - You are about to drop the column `ibanSnapshot` on the `Withdrawal` table. All the data in the column will be lost.
  - Added the required column `clientId` to the `Conversation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `creatorId` to the `Conversation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `recipientId` to the `Message` table without a default value. This is not possible if the table is not empty.
  - Added the required column `amountCoins` to the `Transaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `amountCoins` to the `Withdrawal` table without a default value. This is not possible if the table is not empty.
  - Added the required column `payoutDetails` to the `Withdrawal` table without a default value. This is not possible if the table is not empty.
  - Added the required column `payoutMethod` to the `Withdrawal` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "PurchaseRequest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clientId" TEXT NOT NULL,
    "coinsRequested" INTEGER NOT NULL,
    "amountPaidRaw" REAL NOT NULL,
    "currency" TEXT NOT NULL,
    "paymentMethod" TEXT NOT NULL,
    "transactionId" TEXT,
    "proofImageUrl" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "rejectionReason" TEXT,
    "adminId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PurchaseRequest_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Conversation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "creatorId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "lastMessageAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Conversation_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Conversation_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Conversation" ("createdAt", "id", "updatedAt") SELECT "createdAt", "id", "updatedAt" FROM "Conversation";
DROP TABLE "Conversation";
ALTER TABLE "new_Conversation" RENAME TO "Conversation";
CREATE INDEX "Conversation_creatorId_idx" ON "Conversation"("creatorId");
CREATE INDEX "Conversation_clientId_idx" ON "Conversation"("clientId");
CREATE UNIQUE INDEX "Conversation_creatorId_clientId_key" ON "Conversation"("creatorId", "clientId");
CREATE TABLE "new_Message" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "conversationId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "recipientId" TEXT NOT NULL,
    "content" TEXT,
    "type" TEXT NOT NULL DEFAULT 'text',
    "isPaid" BOOLEAN NOT NULL DEFAULT false,
    "price" REAL,
    "isUnlocked" BOOLEAN NOT NULL DEFAULT false,
    "isTip" BOOLEAN NOT NULL DEFAULT false,
    "tipAmount" REAL,
    "isAuto" BOOLEAN NOT NULL DEFAULT false,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "readAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Message_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Message" ("content", "conversationId", "createdAt", "id", "isAuto", "isPaid", "isRead", "isTip", "isUnlocked", "price", "senderId", "tipAmount") SELECT "content", "conversationId", "createdAt", "id", "isAuto", "isPaid", "isRead", "isTip", "isUnlocked", "price", "senderId", "tipAmount" FROM "Message";
DROP TABLE "Message";
ALTER TABLE "new_Message" RENAME TO "Message";
CREATE INDEX "Message_conversationId_createdAt_idx" ON "Message"("conversationId", "createdAt");
CREATE INDEX "Message_senderId_idx" ON "Message"("senderId");
CREATE INDEX "Message_recipientId_idx" ON "Message"("recipientId");
CREATE TABLE "new_Transaction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "type" TEXT NOT NULL,
    "amountCoins" INTEGER NOT NULL,
    "commissionCoins" INTEGER NOT NULL DEFAULT 0,
    "commissionRate" REAL,
    "status" TEXT NOT NULL DEFAULT 'completed',
    "referenceId" TEXT,
    "paymentMethod" TEXT,
    "paymentIntentId" TEXT,
    "refundedAt" DATETIME,
    "refundReason" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Transaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Transaction" ("commissionRate", "createdAt", "id", "paymentIntentId", "paymentMethod", "referenceId", "refundReason", "refundedAt", "status", "type", "userId") SELECT "commissionRate", "createdAt", "id", "paymentIntentId", "paymentMethod", "referenceId", "refundReason", "refundedAt", "status", "type", "userId" FROM "Transaction";
DROP TABLE "Transaction";
ALTER TABLE "new_Transaction" RENAME TO "Transaction";
CREATE INDEX "Transaction_userId_createdAt_idx" ON "Transaction"("userId", "createdAt");
CREATE INDEX "Transaction_type_status_idx" ON "Transaction"("type", "status");
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'CLIENT',
    "displayName" TEXT,
    "username" TEXT,
    "avatarUrl" TEXT,
    "bio" TEXT,
    "bannerUrl" TEXT,
    "age" INTEGER,
    "country" TEXT,
    "welcomeMessage" TEXT,
    "subscriberWelcomeMsg" TEXT,
    "categories" TEXT,
    "tags" TEXT,
    "profilePhotos" TEXT,
    "height" TEXT,
    "hairColor" TEXT,
    "eyeColor" TEXT,
    "bodyType" TEXT,
    "tattoos" TEXT,
    "subscriptionPrice" INTEGER NOT NULL DEFAULT 0,
    "subscriptionPricePlus" INTEGER NOT NULL DEFAULT 0,
    "coinBalance" INTEGER NOT NULL DEFAULT 0,
    "totalEarned" INTEGER NOT NULL DEFAULT 0,
    "totalSpent" INTEGER NOT NULL DEFAULT 0,
    "preferredPayoutMethod" TEXT,
    "cryptoAddress" TEXT,
    "cryptoNetwork" TEXT,
    "paxfulUsername" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "kycStatus" TEXT NOT NULL DEFAULT 'pending',
    "iban" TEXT,
    "ibanVerified" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isSuspended" BOOLEAN NOT NULL DEFAULT false,
    "suspendedReason" TEXT,
    "suspendedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "lastLoginAt" DATETIME
);
INSERT INTO "new_User" ("avatarUrl", "bannerUrl", "bio", "createdAt", "displayName", "email", "iban", "ibanVerified", "id", "isActive", "isSuspended", "isVerified", "kycStatus", "lastLoginAt", "passwordHash", "role", "subscriptionPrice", "subscriptionPricePlus", "suspendedAt", "suspendedReason", "totalEarned", "totalSpent", "updatedAt", "username") SELECT "avatarUrl", "bannerUrl", "bio", "createdAt", "displayName", "email", "iban", "ibanVerified", "id", "isActive", "isSuspended", "isVerified", "kycStatus", "lastLoginAt", "passwordHash", "role", "subscriptionPrice", "subscriptionPricePlus", "suspendedAt", "suspendedReason", "totalEarned", "totalSpent", "updatedAt", "username" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
CREATE TABLE "new_Withdrawal" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "creatorId" TEXT NOT NULL,
    "amountCoins" INTEGER NOT NULL,
    "payoutMethod" TEXT NOT NULL,
    "payoutDetails" TEXT NOT NULL,
    "amountEur" REAL NOT NULL,
    "commissionEur" REAL NOT NULL,
    "netEur" REAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "rejectionReason" TEXT,
    "adminId" TEXT,
    "requestedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" DATETIME,
    "completedAt" DATETIME,
    CONSTRAINT "Withdrawal_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Withdrawal" ("adminId", "amountEur", "commissionEur", "completedAt", "creatorId", "id", "netEur", "processedAt", "rejectionReason", "requestedAt", "status") SELECT "adminId", "amountEur", "commissionEur", "completedAt", "creatorId", "id", "netEur", "processedAt", "rejectionReason", "requestedAt", "status" FROM "Withdrawal";
DROP TABLE "Withdrawal";
ALTER TABLE "new_Withdrawal" RENAME TO "Withdrawal";
CREATE INDEX "Withdrawal_creatorId_status_idx" ON "Withdrawal"("creatorId", "status");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
