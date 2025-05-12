import { prisma } from '@/lib/prisma';
import { verifyWebhook } from '@clerk/nextjs/webhooks';
import { NextRequest } from 'next/server';


export async function POST(req: NextRequest) {
  try {
    const evt = await verifyWebhook(req)

    const { id } = evt.data
    const eventType = evt.type
    if (!id || !eventType) throw new Error('Incomplete webhook event'); 
    
    if (eventType === 'user.created') {
        if (!id) {
          throw new Error('Missing user ID in webhook event')
        }
        await prisma.user.create({
            data: {
              id: id,    // Clerk ID
            },
          })
    }
    else if (eventType === 'user.deleted') {
        await prisma.user.deleteMany({
            where: { id },
        }) 
    } 
    // else if (eventType === "user.updated") {
    //   const { image_url } = evt.data; 
    //   await prisma.user.upsert({
    //     where: { id },
    //     update: { imageUrl: image_url },
    //     create: { id, imageUrl: image_url },
    //   });
    // } 
    return new Response('Webhook action completed!', { status: 200 })
  } catch (err) {
    console.error('Error verifying webhook:', err)
    return new Response('Error verifying webhook', { status: 400 })
  }
}