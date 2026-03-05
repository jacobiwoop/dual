import { prisma } from '../lib/prisma';
import * as bcrypt from 'bcryptjs';

async function main() {
  const creators = [
    {
      email: 'sofia.monroe@basicinstinct.com',
      username: 'sofiamonroe',
      displayName: 'Sofia Monroe',
      bio: 'Passionnée de photographie et de voyage. Je partage mon quotidien et mes aventures exclusives 🌍✨',
      country: 'France',
      age: 24,
      subscriptionPrice: 1500,
      isVerified: true,
      hairColor: 'Chatain',
      eyeColor: 'Vert',
      bodyType: 'Athlétique',
    },
    {
      email: 'luna.rossi@basicinstinct.com',
      username: 'lunarossi',
      displayName: 'Luna Rossi',
      bio: 'Artiste et créatrice de contenu depuis Rome 🇮🇹 Fan de mode, beauté et lifestyle.',
      country: 'Italie',
      age: 26,
      subscriptionPrice: 1200,
      isVerified: true,
      hairColor: 'Noir',
      eyeColor: 'Marron',
      bodyType: 'Mince',
    },
    {
      email: 'chloe.martin@basicinstinct.com',
      username: 'chloemartin',
      displayName: 'Chloé Martin',
      bio: 'Danseuse professionnelle. Contenu exclusif, behind-the-scenes et bien plus 💃',
      country: 'France',
      age: 23,
      subscriptionPrice: 1800,
      isVerified: false,
      hairColor: 'Blond',
      eyeColor: 'Bleu',
      bodyType: 'Athlétique',
    },
    {
      email: 'zara.knight@basicinstinct.com',
      username: 'zaraknight',
      displayName: 'Zara Knight',
      bio: 'London based model & fitness addict 💪🏋️‍♀️ Exclusive workouts and lifestyle content.',
      country: 'Royaume-Uni',
      age: 28,
      subscriptionPrice: 2000,
      isVerified: true,
      hairColor: 'Roux',
      eyeColor: 'Vert',
      bodyType: 'Musclée',
    },
    {
      email: 'nina.belle@basicinstinct.com',
      username: 'ninabelle',
      displayName: 'Nina Belle',
      bio: 'Modèle et influenceuse basée à Paris 🗼 Photos exclusives et contenu lifestyle quotidien.',
      country: 'France',
      age: 25,
      subscriptionPrice: 1600,
      isVerified: true,
      hairColor: 'Chatain',
      eyeColor: 'Noisette',
      bodyType: 'Courbes',
    },
    {
      email: 'eva.santos@basicinstinct.com',
      username: 'evasantos',
      displayName: 'Eva Santos',
      bio: 'Desde Madrid con amor 🇪🇸❤️ Modelo, actriz y creadora de contenido exclusivo.',
      country: 'Espagne',
      age: 27,
      subscriptionPrice: 1400,
      isVerified: false,
      hairColor: 'Noir',
      eyeColor: 'Marron',
      bodyType: 'Mince',
    },
    {
      email: 'mia.dupont@basicinstinct.com',
      username: 'miadupont',
      displayName: 'Mia Dupont',
      bio: 'Photographe et modèle freelance 📸 Je capture la beauté du quotidien, abonne-toi pour plus!',
      country: 'Belgique',
      age: 22,
      subscriptionPrice: 1000,
      isVerified: false,
      hairColor: 'Blond',
      eyeColor: 'Bleu',
      bodyType: 'Mince',
    },
    {
      email: 'aria.voss@basicinstinct.com',
      username: 'ariavoss',
      displayName: 'Aria Voss',
      bio: 'Berlin vibes 🇩🇪 Alternative model, tattoos & underground art. 100% authentic exclusive content.',
      country: 'Allemagne',
      age: 29,
      subscriptionPrice: 1700,
      isVerified: true,
      hairColor: 'Noir',
      eyeColor: 'Gris',
      bodyType: 'Mince',
      tattoos: 'Plusieurs',
    },
    {
      email: 'jade.leblanc@basicinstinct.com',
      username: 'jadeleblanc',
      displayName: 'Jade Leblanc',
      bio: 'Québécoise 🍁 Créatrice de contenu lifestyle, yoga et bien-être. Rejoins ma communauté!',
      country: 'Canada',
      age: 30,
      subscriptionPrice: 1300,
      isVerified: true,
      hairColor: 'Chatain',
      eyeColor: 'Vert',
      bodyType: 'Athlétique',
    },
    {
      email: 'rose.taylor@basicinstinct.com',
      username: 'rosetaylor',
      displayName: 'Rose Taylor',
      bio: 'NYC girl 🗽 Fashion model and content creator. Exclusive photoshoots and behind-the-scenes.',
      country: 'États-Unis',
      age: 26,
      subscriptionPrice: 2200,
      isVerified: true,
      hairColor: 'Blond',
      eyeColor: 'Bleu',
      bodyType: 'Mince',
    },
  ];

  const passwordHash = await bcrypt.hash('Creator@123', 10);

  let created = 0;
  for (const creator of creators) {
    const existing = await prisma.user.findUnique({ where: { email: creator.email } });
    if (existing) {
      console.log(`⏭️  Déjà existant: ${creator.username}`);
      continue;
    }

    await prisma.user.create({
      data: {
        ...creator,
        passwordHash,
        role: 'CREATOR',
        isActive: true,
        isSuspended: false,
        isVerified: creator.isVerified ?? false,
        kycStatus: creator.isVerified ? 'approved' : 'pending',
        coinBalance: 0,
        totalEarned: 0,
        subscriptionPricePlus: 0,
      },
    });
    console.log(`✅ Créé: ${creator.displayName} (@${creator.username})`);
    created++;
  }

  console.log(`\n🎉 ${created} créateur(s) ajouté(s) !`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
