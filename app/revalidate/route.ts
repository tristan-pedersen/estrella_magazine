import {revalidateTag} from 'next/cache'
import {type NextRequest, NextResponse} from 'next/server'
import {parseBody} from 'next-sanity/webhook'

type WebhookPayload = {_type?: string}

export async function POST(req: NextRequest) {
  const secret = process.env.SANITY_REVALIDATE_SECRET
  if (!secret) {
    return new Response('Missing SANITY_REVALIDATE_SECRET', {status: 500})
  }

  const {isValidSignature, body} = await parseBody<WebhookPayload>(req, secret)

  if (!isValidSignature) {
    return new Response('Invalid signature', {status: 401})
  }

  if (!body?._type) {
    return new Response('Bad request', {status: 400})
  }

  // Marks everything tagged "articles" as expired right away
  revalidateTag('articles', {expire: 0})

  return NextResponse.json({revalidated: true, type: body._type})
}