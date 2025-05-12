import { prisma } from '@/lib/prisma';
import { currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export async function GET() {
  const user = await currentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const userRating = await prisma.user.findUnique({
      where: { id: user.id },
      select: { rating: true, imageUrl: true },
    });

    if (!userRating || !userRating.imageUrl) {
      return NextResponse.json({ error: 'User rating or image not found' }, { status: 404 });
    }

    const [countBefore, totalUsers, stats] = await Promise.all([
      prisma.user.count({ where: { rating: { lt: userRating.rating } } }),
      prisma.user.count(),
      prisma.user.aggregate({
        _max: { rating: true },
        _min: { rating: true },
      }),
    ]);

    if (stats._max.rating === null || stats._min.rating === null) {
      return NextResponse.json({ error: 'No rating stats found' }, { status: 404 });
    }

    const { rating } = userRating;
    const max = stats._max.rating;
    const min = stats._min.rating;

    const normalized = max === min ? 10 : ((rating - min) / (max - min)) * 10;
    const rounded = Number(normalized.toFixed(2));

    const percentile = totalUsers === 0 ? 0 : (countBefore / totalUsers) * 100;

    return NextResponse.json({
      name: user.firstName,
      photo: userRating.imageUrl,
      rating: rounded,
      percentile: Number(percentile.toFixed(2)),
    });

  } catch (error) {
    console.error('[RATING_ERROR]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}