import {Suspense} from 'react'
import {getLatestArticles} from '@/sanity/lib/articles'
import Link from 'next/link'

async function LatestArticles() {
  const articles = await getLatestArticles()

  if (articles.length === 0) {
    return <p>No articles published yet.</p>
  }

  return (
    <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
      {articles.map((article) => (
        <article key={article._id}>
          {article.image && (
            <img
              src={`${article.image}?w=800&auto=format`}
              alt={article.title}
              className="mb-4 aspect-[4/5] w-full object-cover"
            />
          )}
          {article.category && (
            <p className="text-xs uppercase tracking-widest">{article.category}</p>
          )}
          <h2 className="mt-1 text-2xl font-semibold">
  <Link href={`/articles/${article.slug}`}>{article.title}</Link>
</h2>
          {article.excerpt && <p className="mt-2 text-sm">{article.excerpt}</p>}
          {article.author && <p className="mt-2 text-xs">By {article.author}</p>}
        </article>
      ))}
    </div>
  )
}

export default function Home() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <h1 className="mb-10 text-4xl font-bold">Your Magazine</h1>
      <Suspense fallback={<p>Loading…</p>}>
        <LatestArticles />
      </Suspense>
    </main>
  )
}