import {Suspense} from 'react'
import {notFound} from 'next/navigation'
import {getCategories, getCategoryWithArticles} from '@/sanity/lib/articles'
import {ArticleCard} from '@/components/ArticleCard'

export async function generateStaticParams() {
  const categories = await getCategories()
  return categories.map((c) => ({slug: c.slug}))
}

async function CategoryArticles({params}: {params: Promise<{slug: string}>}) {
  const {slug} = await params
  const category = await getCategoryWithArticles(slug)

  if (!category) notFound()

  return (
    <>
      <h1 className="text-4xl font-bold">{category.title}</h1>
      {category.description && <p className="mt-3 text-lg">{category.description}</p>}

      {category.articles.length === 0 ? (
        <p className="mt-10">Nothing published here yet.</p>
      ) : (
        <div className="mt-10 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
          {category.articles.map((article) => (
            <ArticleCard key={article._id} article={article} />
          ))}
        </div>
      )}
    </>
  )
}

export default function CategoryPage({params}: {params: Promise<{slug: string}>}) {
  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <Suspense fallback={<p>Loading…</p>}>
        <CategoryArticles params={params} />
      </Suspense>
    </main>
  )
}