import { prisma } from './src/lib/prisma';

async function run() {
  try {
    const david = await prisma.user.findUnique({ where: { username: 'david_m' } });
    console.log('Exists david_m:', !!david);

    const creators = await prisma.user.findMany({ where: { role: 'CREATOR' } });
    console.log('Creators:', creators.map(c => c.username).join(', '));

    const clientId = '525c0a32-7e4b-4ef6-a2bc-d12e3dd640be';
    const conversations = await prisma.conversation.findMany({
      where: {
        participants: {
          some: { userId: clientId },
        },
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                displayName: true,
                avatarUrl: true,
                role: true,
                isVerified: true,
                isPayPerMessageEnabled: true,
                messagePrice: true,
              },
            },
          },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: {
            id: true, content: true, createdAt: true, isRead: true,
            senderId: true, isPaid: true, isUnlocked: true,
            mediaAttachments: { include: { libraryItem: true } },
          },
        },
      },
      take: 20,
      skip: 0,
      orderBy: { updatedAt: 'desc' },
    });
    console.log('Conversations test passed, found:', conversations.length);
  } catch (e) {
    console.error('Test error:', e);
  } finally {
    await prisma.$disconnect();
  }
}
run();
