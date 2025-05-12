import { put, type PutBlobResult } from '@vercel/blob';
import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';


export async function POST(request: Request): Promise<NextResponse> {
  try {
    const user = await currentUser();
    if (!user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const filename = searchParams.get('filename');

    if (!filename) {
      return new NextResponse('Filename is missing', { status: 400 });
    }

    if (!request.body) {
      return new NextResponse('No file data received', { status: 400 });
    }

    if (!filename.endsWith('.png') && !filename.endsWith('.jpg') && !filename.endsWith('.jpeg')) {
        return new NextResponse('Unsupported file type', { status: 415 });
    }
    const sanitizedFilename = filename.replace(/[^a-zA-Z0-9._-]/g, '_');

    // Upload the blob to Vercel Blob Storage
    const blob: PutBlobResult = await put(sanitizedFilename, request.body, {
      access: 'public', 
      addRandomSuffix: true
    });
    
    // Check if user exists in local database
    const existing = await prisma.user.findUnique({ where: { id: user.id } });
    if (!existing) return new NextResponse('User not found in DB', { status: 404 });

    // Add image to the user 
    await prisma.user.update(
        {
            data: {imageUrl: blob.url},
            where: {id: user.id}, 
        }
    ); 

    return NextResponse.json(blob);
  } catch (error) {
    console.error('[UPLOAD ERROR]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
