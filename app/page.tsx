import {Suspense} from 'react'
import {getLatestArticles} from '@/sanity/lib/articles'
import {ArticleCard} from '@/components/ArticleCard'

async function LatestArticles() {
  const articles = await getLatestArticles()

  if (articles.length === 0) {
    return <p>No articles published yet.</p>
  }

  return (
    <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
      {articles.map((article) => (
        <ArticleCard key={article._id} article={article} />
      ))}
    </div>
  )
}

export default function Home() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <Suspense fallback={<p>Loading…</p>}>
        <LatestArticles />
      </Suspense>
    </main>
  )
}