import {Suspense} from 'react'
import type {Metadata} from 'next'
import {searchArticles} from '@/sanity/lib/articles'
import {ArticleCard} from '@/components/ArticleCard'

export const metadata: Metadata = {
  title: 'Search',
  robots: {index: false},
}

async function Results({
  searchParams,
}: {
  searchParams: Promise<{q?: string | string[]}>
}) {
  const params = await searchParams
  const raw = Array.isArray(params.q) ? params.q[0] : params.q
  const query = (raw ?? '').trim().slice(0, 100)

  if (!query) {
    return <p>Type something in the search box to find articles.</p>
  }

  const articles = await searchArticles(query)

  return (
    <>
      <h1 className="text-3xl font-bold">Results for “{query}”</h1>
      {articles.length === 0 ? (
        <p className="mt-6">No articles found. Try a different word.</p>
      ) : (
        <div className="mt-10 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <ArticleCard key={article._id} article={article} />
          ))}
        </div>
      )}
    </>
  )
}

export default function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{q?: string | string[]}>
}) {
  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <Suspense fallback={<p>Searching…</p>}>
        <Results searchParams={searchParams} />
      </Suspense>
    </main>
  )
}