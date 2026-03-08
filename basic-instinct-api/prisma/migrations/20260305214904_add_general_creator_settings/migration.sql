-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
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
    "isSubscriptionEnabled" BOOLEAN NOT NULL DEFAULT true,
    "isPayPerMessageEnabled" BOOLEAN NOT NULL DEFAULT false,
    "messagePrice" INTEGER NOT NULL DEFAULT 0,
    "isSpecialContentEnabled" BOOLEAN NOT NULL DEFAULT true,
    "specialContentBasePrice" INTEGER NOT NULL DEFAULT 0,
    "isPrivateGalleryEnabled" BOOLEAN NOT NULL DEFAULT false,
    "privateGalleryDefaultPrice" INTEGER NOT NULL DEFAULT 0,
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
INSERT INTO "new_User" ("age", "avatarUrl", "bannerUrl", "bio", "bodyType", "categories", "coinBalance", "country", "createdAt", "cryptoAddress", "cryptoNetwork", "displayName", "email", "eyeColor", "hairColor", "height", "iban", "ibanVerified", "id", "isActive", "isSuspended", "isVerified", "kycStatus", "lastLoginAt", "passwordHash", "paxfulUsername", "preferredPayoutMethod", "profilePhotos", "role", "subscriberWelcomeMsg", "subscriptionPrice", "subscriptionPricePlus", "suspendedAt", "suspendedReason", "tags", "tattoos", "totalEarned", "totalSpent", "updatedAt", "username", "welcomeMessage") SELECT "age", "avatarUrl", "bannerUrl", "bio", "bodyType", "categories", "coinBalance", "country", "createdAt", "cryptoAddress", "cryptoNetwork", "displayName", "email", "eyeColor", "hairColor", "height", "iban", "ibanVerified", "id", "isActive", "isSuspended", "isVerified", "kycStatus", "lastLoginAt", "passwordHash", "paxfulUsername", "preferredPayoutMethod", "profilePhotos", "role", "subscriberWelcomeMsg", "subscriptionPrice", "subscriptionPricePlus", "suspendedAt", "suspendedReason", "tags", "tattoos", "totalEarned", "totalSpent", "updatedAt", "username", "welcomeMessage" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
