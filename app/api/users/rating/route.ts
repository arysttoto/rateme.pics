import { prisma } from '@/lib/prisma';
import { currentUser } from '@clerk/nextjs/server';

export async function GET() {
  const user = await currentUser();
  if (!user) return new Response('Unauthorized', { status: 401 });

  try {
    const [userRating, stats] = await Promise.all([
      prisma.user.findUnique({
        where: { id: user.id },
        select: { rating: true },
      }),
      prisma.user.aggregate({
        _max: { rating: true },
        _min: { rating: true },
      }),
    ]);

    if (!userRating || stats._max.rating === null || stats._min.rating === null) {
      return new Response('User or rating stats not found', { status: 404 });
    }

    const max = stats._max.rating;
    const min = stats._min.rating;
    const rating = userRating.rating;

    const normalized = max === min
      ? 10
      : ((rating - min) / (max - min)) * 10;

    const rounded = Number(normalized.toFixed(2));  

    return new Response(JSON.stringify(rounded), { status: 200 }); 

  } catch (error) {
    return new Response('Internal Server Error', { status: 500 });
  }
}
