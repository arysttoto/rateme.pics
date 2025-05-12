import { prisma } from '@/lib/prisma';
import { currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { del } from '@vercel/blob';


export async function DELETE() {
  const user = await currentUser();
  if (!user) return new Response('Unauthorized', { status: 401 });

  try {
    // Check if user exists in local database
    const prismaUser = await prisma.user.findUnique({ where: { id: user.id } });
    if (!prismaUser) return new NextResponse('User not found in DB', { status: 404 });

    // Delete users avatar 
    if (prismaUser?.imageUrl)
    {
        await Promise.all([
            del(prismaUser.imageUrl),
            prisma.user.update(
                {
                    data: {imageUrl: null},
                    where: {id: prismaUser.id}, 
                }
            )
        ]);
    }          
    
    return new NextResponse("Success", { status: 200 }); 

  } catch (error) {
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
