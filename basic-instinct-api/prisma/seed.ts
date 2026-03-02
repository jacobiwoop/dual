import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import bcrypt from 'bcryptjs';

const adapter = new PrismaBetterSqlite3({ url: 'file:./dev.db' });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Seeding database...');

  // Nettoyer les données existantes (optionnel)
  console.log('🧹 Cleaning existing data...');
  await prisma.message.deleteMany();
  await prisma.conversationParticipant.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.libraryItem.deleteMany();
  await prisma.libraryFolder.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.post.deleteMany();
  await prisma.user.deleteMany();

  // Créer un créateur de test
  console.log('👤 Creating creator...');
  const creatorPassword = await bcrypt.hash('password123', 10);
  const creator = await prisma.user.create({
    data: {
      email: 'creator@test.com',
      passwordHash: creatorPassword,
      username: 'bella_creator',
      displayName: 'Bella Creator',
      role: 'CREATOR',
      bio: 'Créatrice de contenu lifestyle 💕',
      subscriptionPrice: 9.99,
      subscriptionPricePlus: 19.99,
      isVerified: true,
      balance: 1250.50,
      totalEarned: 5000.00,
    },
  });

  // Créer un client de test
  console.log('👤 Creating client...');
  const clientPassword = await bcrypt.hash('password123', 10);
  const client = await prisma.user.create({
    data: {
      email: 'client@test.com',
      passwordHash: clientPassword,
      username: 'john_client',
      displayName: 'John Doe',
      role: 'CLIENT',
      balanceCredits: 500,
      totalSpent: 150.00,
    },
  });

  // Créer un admin de test
  console.log('🛡️ Creating admin...');
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.create({
    data: {
      email: 'admin@basicinstinct.com',
      passwordHash: adminPassword,
      username: 'admin',
      displayName: 'Admin User',
      role: 'ADMIN',
    },
  });

  // Créer une conversation
  console.log('💬 Creating conversation...');
  const conversation = await prisma.conversation.create({
    data: {
      participants: {
        create: [
          { userId: creator.id },
          { userId: client.id },
        ],
      },
    },
  });

  // Créer des messages
  console.log('📨 Creating messages...');
  await prisma.message.createMany({
    data: [
      {
        conversationId: conversation.id,
        senderId: creator.id,
        content: 'Salut! Merci pour ton abonnement 💕',
        isAuto: true,
      },
      {
        conversationId: conversation.id,
        senderId: client.id,
        content: 'Merci! J\'adore ton contenu!',
      },
      {
        conversationId: conversation.id,
        senderId: creator.id,
        content: 'Tu es adorable! N\'hésite pas si tu as des questions 😊',
      },
    ],
  });

  // Créer un abonnement
  console.log('⭐ Creating subscription...');
  await prisma.subscription.create({
    data: {
      clientId: client.id,
      creatorId: creator.id,
      tier: 'normal',
      priceCredits: 100,
      status: 'active',
      renewsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // +30 jours
    },
  });

  // Créer un dossier bibliothèque
  console.log('📁 Creating library folder...');
  const folder = await prisma.libraryFolder.create({
    data: {
      creatorId: creator.id,
      title: 'Mes photos préférées',
      description: 'Collection de mes meilleures photos',
    },
  });

  // Créer des médias bibliothèque
  console.log('🖼️ Creating library items...');
  await prisma.libraryItem.createMany({
    data: [
      {
        creatorId: creator.id,
        folderId: folder.id,
        url: 'https://picsum.photos/800/600?random=1',
        thumbnailUrl: 'https://picsum.photos/200/150?random=1',
        type: 'image',
        filename: 'photo1.jpg',
        sizeBytes: BigInt(2500000),
      },
      {
        creatorId: creator.id,
        folderId: folder.id,
        url: 'https://picsum.photos/800/600?random=2',
        thumbnailUrl: 'https://picsum.photos/200/150?random=2',
        type: 'image',
        filename: 'photo2.jpg',
        sizeBytes: BigInt(3200000),
      },
      {
        creatorId: creator.id,
        url: 'https://picsum.photos/800/600?random=3',
        thumbnailUrl: 'https://picsum.photos/200/150?random=3',
        type: 'image',
        filename: 'photo3.jpg',
        sizeBytes: BigInt(1800000),
      },
    ],
  });

  // Créer des posts publics
  console.log('📱 Creating posts...');
  await prisma.post.createMany({
    data: [
      {
        creatorId: creator.id,
        content: 'Nouveau shooting photos! 📸✨',
        type: 'text',
        visibility: 'public',
        likesCount: 25,
        commentsCount: 3,
      },
      {
        creatorId: creator.id,
        content: 'Journée plage parfaite 🏖️☀️',
        type: 'text',
        visibility: 'subscribers',
        likesCount: 42,
        commentsCount: 7,
      },
    ],
  });

  // Créer des types de shows
  console.log('🎭 Creating show types...');
  await prisma.showType.createMany({
    data: [
      {
        creatorId: creator.id,
        emoji: '💃',
        title: 'Danse personnalisée',
        description: 'Une danse spécialement pour toi',
        priceCredits: 50,
        durationLabel: '5 minutes',
        availability: 'always',
        isActive: true,
        sortOrder: 1,
      },
      {
        creatorId: creator.id,
        emoji: '📸',
        title: 'Shooting photo custom',
        description: 'Photos personnalisées selon tes préférences',
        priceCredits: 100,
        durationLabel: '10 photos',
        availability: 'on_demand',
        isActive: true,
        sortOrder: 2,
      },
    ],
  });

  // Créer des auto-messages
  console.log('🤖 Creating auto messages...');
  await prisma.autoMessage.createMany({
    data: [
      {
        creatorId: creator.id,
        trigger: 'new_subscriber',
        content: 'Bienvenue! Merci pour ton abonnement 💕 Je suis ravie de t\'avoir avec moi!',
        delayMinutes: 0,
        isActive: true,
      },
      {
        creatorId: creator.id,
        trigger: 'after_tip',
        content: 'Merci beaucoup pour ton tip! Tu es incroyable 🥰',
        delayMinutes: 1,
        isActive: true,
      },
    ],
  });

  // Créer des settings plateforme
  console.log('⚙️ Creating platform settings...');
  await prisma.platformSettings.createMany({
    data: [
      {
        key: 'commission_rate',
        value: '0.20',
        description: 'Taux de commission plateforme (20%)',
      },
      {
        key: 'credit_euro_rate',
        value: '0.10',
        description: '1 crédit = 0.10€',
      },
      {
        key: 'min_withdrawal',
        value: '50.00',
        description: 'Montant minimum de retrait (50€)',
      },
      {
        key: 'max_upload_size_mb',
        value: '500',
        description: 'Taille maximale upload (Mo)',
      },
    ],
  });

  console.log('\n✅ Seed completed successfully!');
  console.log('\n📋 Test accounts created:');
  console.log(`
  🎨 Creator:
     Email: ${creator.email}
     Password: password123
     Username: ${creator.username}
     
  👤 Client:
     Email: ${client.email}
     Password: password123
     Username: ${client.username}
     
  🛡️ Admin:
     Email: ${admin.email}
     Password: admin123
     Username: ${admin.username}
  `);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
