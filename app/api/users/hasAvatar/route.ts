import { prisma } from '@/lib/prisma';
import { currentUser } from '@clerk/nextjs/server';

export async function GET() {
  const user = await currentUser();
  if (!user) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const prismaUser = await prisma.user.findFirst({
      where: { id: user.id }
    });

    if (!prismaUser) {
      return new Response('User not found', { status: 404 });
    }

    const body = JSON.stringify({
      photo: prismaUser.imageUrl || null
    });

    return new Response(body, {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('[hasAvatar ERROR]', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
