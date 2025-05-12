import { prisma } from '@/lib/prisma';

type DBUser = { id: string, imageUrl: string };

type UserResponse = {
    id: string;
    photo: string;
  };

export async function GET() {
  // const user = await currentUser();
  // if (!user) return new Response('Unauthorized', { status: 401 });

  try {
    const randomUsers = await prisma.$queryRaw<DBUser[]>`
        SELECT *
        FROM "User"
        WHERE "imageUrl" IS NOT NULL
        ORDER BY RANDOM()
        LIMIT 2;
    `;
    // if (randomUsers) {
    //   console.log(randomUsers)
    //   return new Response('User or rating stats not found', { status: 404 });
    // }
    if (randomUsers.length !== 2) 
    {
        return new Response('Not enough images.', { status: 404 });
    } 

    const combined: UserResponse[]  = randomUsers.map((user) => ({
        id: user.id,
        photo: user.imageUrl,
      }));

    return new Response(JSON.stringify(combined), { status: 200 }); 

  } catch (error) {
    console.log(error); 
    return new Response('Internal Server Error', { status: 500 });
  }
}
