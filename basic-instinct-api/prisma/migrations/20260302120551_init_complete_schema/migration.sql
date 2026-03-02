-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'CLIENT',
    "displayName" TEXT,
    "username" TEXT,
    "avatarUrl" TEXT,
    "bio" TEXT,
    "bannerUrl" TEXT,
    "subscriptionPrice" REAL NOT NULL DEFAULT 0.0,
    "subscriptionPricePlus" REAL NOT NULL DEFAULT 0.0,
    "balance" REAL NOT NULL DEFAULT 0.0,
    "balanceCredits" INTEGER NOT NULL DEFAULT 0,
    "totalEarned" REAL NOT NULL DEFAULT 0.0,
    "totalSpent" REAL NOT NULL DEFAULT 0.0,
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

-- CreateTable
CREATE TABLE "RefreshToken" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RefreshToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Conversation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ConversationParticipant" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "conversationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "joinedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastReadAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ConversationParticipant_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ConversationParticipant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "conversationId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "content" TEXT,
    "isPaid" BOOLEAN NOT NULL DEFAULT false,
    "price" REAL,
    "isUnlocked" BOOLEAN NOT NULL DEFAULT false,
    "isTip" BOOLEAN NOT NULL DEFAULT false,
    "tipAmount" REAL,
    "isAuto" BOOLEAN NOT NULL DEFAULT false,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Message_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MessageMedia" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "messageId" TEXT NOT NULL,
    "libraryItemId" TEXT NOT NULL,
    CONSTRAINT "MessageMedia_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "Message" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "MessageMedia_libraryItemId_fkey" FOREIGN KEY ("libraryItemId") REFERENCES "LibraryItem" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "LibraryFolder" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "creatorId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "coverUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "LibraryFolder_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "LibraryItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "creatorId" TEXT NOT NULL,
    "folderId" TEXT,
    "url" TEXT NOT NULL,
    "thumbnailUrl" TEXT,
    "type" TEXT NOT NULL,
    "filename" TEXT,
    "sizeBytes" BIGINT,
    "durationSec" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "LibraryItem_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "LibraryItem_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "LibraryFolder" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Post" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "creatorId" TEXT NOT NULL,
    "content" TEXT,
    "type" TEXT NOT NULL DEFAULT 'text',
    "visibility" TEXT NOT NULL DEFAULT 'subscribers',
    "priceCredits" INTEGER NOT NULL DEFAULT 0,
    "likesCount" INTEGER NOT NULL DEFAULT 0,
    "commentsCount" INTEGER NOT NULL DEFAULT 0,
    "viewsCount" INTEGER NOT NULL DEFAULT 0,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "isPinned" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Post_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PostMedia" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "postId" TEXT NOT NULL,
    "mediaItemId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "PostMedia_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PostMedia_mediaItemId_fkey" FOREIGN KEY ("mediaItemId") REFERENCES "MediaItem" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Like" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "postId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Like_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Like_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Comment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "postId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Comment_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Comment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MediaItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "creatorId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "thumbnailUrl" TEXT,
    "visibility" TEXT NOT NULL DEFAULT 'free',
    "priceCredits" INTEGER NOT NULL DEFAULT 0,
    "description" TEXT,
    "galleryId" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "fileSizeBytes" BIGINT,
    "durationSec" INTEGER,
    "isFlagged" BOOLEAN NOT NULL DEFAULT false,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "salesCount" INTEGER NOT NULL DEFAULT 0,
    "revenueCredits" INTEGER NOT NULL DEFAULT 0,
    "uploadDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MediaItem_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "MediaItem_galleryId_fkey" FOREIGN KEY ("galleryId") REFERENCES "Gallery" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Gallery" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "creatorId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "coverUrl" TEXT,
    "visibility" TEXT NOT NULL DEFAULT 'free',
    "priceCredits" INTEGER NOT NULL DEFAULT 0,
    "salesCount" INTEGER NOT NULL DEFAULT 0,
    "revenueCredits" INTEGER NOT NULL DEFAULT 0,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Gallery_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clientId" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "tier" TEXT NOT NULL DEFAULT 'normal',
    "priceCredits" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "startedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "renewsAt" DATETIME,
    "cancelledAt" DATETIME,
    CONSTRAINT "Subscription_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Subscription_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Purchase" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clientId" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "itemType" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "priceCredits" INTEGER NOT NULL,
    "purchasedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Purchase_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "type" TEXT NOT NULL,
    "amountCredits" INTEGER,
    "amountEur" REAL,
    "commissionEur" REAL NOT NULL DEFAULT 0,
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

-- CreateTable
CREATE TABLE "ShowRequest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clientId" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "typeLabel" TEXT NOT NULL,
    "description" TEXT,
    "priceCredits" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "refusalReason" TEXT,
    "requestedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "respondedAt" DATETIME,
    "completedAt" DATETIME,
    CONSTRAINT "ShowRequest_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ShowRequest_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ShowType" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "creatorId" TEXT NOT NULL,
    "emoji" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "priceCredits" INTEGER NOT NULL,
    "durationLabel" TEXT,
    "availability" TEXT NOT NULL DEFAULT 'always',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ShowType_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AutoMessage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "creatorId" TEXT NOT NULL,
    "trigger" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "delayMinutes" INTEGER NOT NULL DEFAULT 0,
    "mediaId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sentCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AutoMessage_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "KycSubmission" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "creatorId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "birthDate" DATETIME NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "postalCode" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "idDocumentUrl" TEXT NOT NULL,
    "idDocumentType" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "rejectionReason" TEXT,
    "reviewedAt" DATETIME,
    "reviewedBy" TEXT,
    "submittedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "KycSubmission_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Withdrawal" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "creatorId" TEXT NOT NULL,
    "amountCredits" INTEGER NOT NULL,
    "amountEur" REAL NOT NULL,
    "commissionEur" REAL NOT NULL,
    "netEur" REAL NOT NULL,
    "ibanSnapshot" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "rejectionReason" TEXT,
    "adminId" TEXT,
    "requestedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" DATETIME,
    "completedAt" DATETIME,
    CONSTRAINT "Withdrawal_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CreatorNote" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "creatorId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CreatorNote_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CreatorNote_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "recipientId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "linkUrl" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Notification_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AdminLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "adminId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "targetType" TEXT,
    "targetId" TEXT,
    "details" TEXT,
    "ipAddress" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "PlatformSettings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "description" TEXT,
    "updatedAt" DATETIME NOT NULL,
    "updatedBy" TEXT
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "RefreshToken_token_key" ON "RefreshToken"("token");

-- CreateIndex
CREATE INDEX "RefreshToken_userId_idx" ON "RefreshToken"("userId");

-- CreateIndex
CREATE INDEX "ConversationParticipant_userId_idx" ON "ConversationParticipant"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ConversationParticipant_conversationId_userId_key" ON "ConversationParticipant"("conversationId", "userId");

-- CreateIndex
CREATE INDEX "Message_conversationId_createdAt_idx" ON "Message"("conversationId", "createdAt");

-- CreateIndex
CREATE INDEX "Message_senderId_idx" ON "Message"("senderId");

-- CreateIndex
CREATE UNIQUE INDEX "MessageMedia_messageId_libraryItemId_key" ON "MessageMedia"("messageId", "libraryItemId");

-- CreateIndex
CREATE INDEX "LibraryFolder_creatorId_idx" ON "LibraryFolder"("creatorId");

-- CreateIndex
CREATE INDEX "LibraryItem_creatorId_folderId_idx" ON "LibraryItem"("creatorId", "folderId");

-- CreateIndex
CREATE INDEX "Post_creatorId_createdAt_idx" ON "Post"("creatorId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "PostMedia_postId_mediaItemId_key" ON "PostMedia"("postId", "mediaItemId");

-- CreateIndex
CREATE INDEX "Like_userId_idx" ON "Like"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Like_postId_userId_key" ON "Like"("postId", "userId");

-- CreateIndex
CREATE INDEX "Comment_postId_createdAt_idx" ON "Comment"("postId", "createdAt");

-- CreateIndex
CREATE INDEX "Comment_userId_idx" ON "Comment"("userId");

-- CreateIndex
CREATE INDEX "MediaItem_creatorId_galleryId_idx" ON "MediaItem"("creatorId", "galleryId");

-- CreateIndex
CREATE INDEX "MediaItem_visibility_isVisible_idx" ON "MediaItem"("visibility", "isVisible");

-- CreateIndex
CREATE INDEX "Gallery_creatorId_idx" ON "Gallery"("creatorId");

-- CreateIndex
CREATE INDEX "Subscription_creatorId_status_idx" ON "Subscription"("creatorId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_clientId_creatorId_key" ON "Subscription"("clientId", "creatorId");

-- CreateIndex
CREATE INDEX "Purchase_clientId_creatorId_idx" ON "Purchase"("clientId", "creatorId");

-- CreateIndex
CREATE INDEX "Purchase_itemType_itemId_idx" ON "Purchase"("itemType", "itemId");

-- CreateIndex
CREATE INDEX "Transaction_userId_createdAt_idx" ON "Transaction"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "Transaction_type_status_idx" ON "Transaction"("type", "status");

-- CreateIndex
CREATE INDEX "ShowRequest_creatorId_status_idx" ON "ShowRequest"("creatorId", "status");

-- CreateIndex
CREATE INDEX "ShowRequest_clientId_idx" ON "ShowRequest"("clientId");

-- CreateIndex
CREATE INDEX "ShowType_creatorId_isActive_idx" ON "ShowType"("creatorId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "AutoMessage_creatorId_trigger_key" ON "AutoMessage"("creatorId", "trigger");

-- CreateIndex
CREATE INDEX "KycSubmission_creatorId_idx" ON "KycSubmission"("creatorId");

-- CreateIndex
CREATE INDEX "Withdrawal_creatorId_status_idx" ON "Withdrawal"("creatorId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "CreatorNote_creatorId_clientId_key" ON "CreatorNote"("creatorId", "clientId");

-- CreateIndex
CREATE INDEX "Notification_recipientId_isRead_createdAt_idx" ON "Notification"("recipientId", "isRead", "createdAt");

-- CreateIndex
CREATE INDEX "AdminLog_adminId_createdAt_idx" ON "AdminLog"("adminId", "createdAt");

-- CreateIndex
CREATE INDEX "AdminLog_targetType_targetId_idx" ON "AdminLog"("targetType", "targetId");

-- CreateIndex
CREATE UNIQUE INDEX "PlatformSettings_key_key" ON "PlatformSettings"("key");
