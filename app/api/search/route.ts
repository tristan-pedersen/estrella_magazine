import {type NextRequest, NextResponse} from 'next/server'
import {searchSuggestions} from '@/sanity/lib/articles'

export async function GET(request: NextRequest) {
  const q = (request.nextUrl.searchParams.get('q') ?? '').trim().slice(0, 100)

  if (q.length < 2) {
    return NextResponse.json([])
  }

  const results = await searchSuggestions(q)
  return NextResponse.json(results)
}