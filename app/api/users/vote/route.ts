import { prisma } from '@/lib/prisma';
import { NextRequest } from 'next/server';


export async function POST(req: NextRequest) {
  try {
    const { winnerId, loserId } = await req.json();
    if (!winnerId || !loserId || winnerId === loserId) {
        return new Response('Invalid winner or loser ID', { status: 400 });
      }
      
    await prisma.$transaction(async (tx) => {
        const [ratingWinner, ratingLoser] = await Promise.all([
            tx.user.findUnique({
              where: { id: winnerId },
              select: { rating: true },
            }),
            tx.user.findUnique({
                where: { id: loserId },
                select: { rating: true },
            }),
        ]);
        if (!ratingWinner || !ratingLoser) {
            return new Response('User or rating stats not found', { status: 404 });
        } 
        const probabilityWinner = 1 / (1 + 10 ** ((ratingLoser.rating - ratingWinner.rating) / 400)); 
        const probabilityLoser = 1 - probabilityWinner; 

        const K = 40;
        const newRatingWinner = Math.round(ratingWinner.rating + K * probabilityLoser); 
        let newRatingLoser = Math.round(ratingLoser.rating + K * (0 - probabilityLoser)); 
        if (newRatingLoser < 0) 
        {
            newRatingLoser = 0; 
        } 

        await Promise.all([
            tx.user.update({
                data: {
                    rating: newRatingWinner,
                },
                where: {
                id: winnerId,
                },
            }),
            tx.user.update({
                data: {
                    rating: newRatingLoser,
                },
                where: {
                id: loserId,
                },
            })
        ]);
    });

    return new Response("Success", { status: 200 }); 

  } catch (error) {
    console.error('Rating update failed:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
